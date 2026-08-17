import { createHash } from "node:crypto";
import {
  buildSessionPracticeOutcomeSourceLink,
  buildOwnerDeliveryAuditEvent,
  buildSessionPracticeRequest,
  createSessionPracticeAttemptLifecycle,
  deriveSessionPracticeAttemptId,
  deriveSessionPracticeCompletionDisposition,
  fingerprintSessionPracticeRealizationPlan,
  realizeSessionPractice,
  receiveSessionPracticeAtGate13,
  recordSessionPracticeExecutionStart,
  SESSION_PRACTICE_OPTIONS_V2_BRIDGE_CONTRACT_REFERENCE,
  selectSessionPracticeMode,
  stableId,
  type OwnerV2ProductProgramEnvelope,
  type PrescriptionSessionCompilationResult,
  type ProductionFinalSessionSequencingResult,
  type ProductionPostPrescriptionWeekValidationResult,
  type ProductionWeeklyIntentV1_1,
  type ProductionWeekAllocationPlanV1_1,
  type SessionIntentPlanningResult,
  type SessionPracticeModeV2,
  type SessionPracticeSourceSnapshot,
  type SessionSkeleton,
} from "@praxis/training-engine-v2";
import {
  buildPersistedSessionPracticeRevision,
  buildSessionPracticeV2Draft,
  type SessionPracticePersistenceRepository,
} from "../sessionPracticeV2";
import type { OwnerDeliveryRepository, OwnerIdempotencyRecord } from "./contracts";
import type { OutcomeSourcePersistencePort } from "../outcomeSourcePersistence";
import { buildControlledOwnerObservabilityEvent, NOOP_CONTROLLED_OWNER_OBSERVABILITY,
  type ControlledOwnerObservability } from "./observability";
import { persistControlledOwnerSessionOutcome } from "./outcomeService";

function stage<T>(envelope: OwnerV2ProductProgramEnvelope,
  name: OwnerV2ProductProgramEnvelope["programSnapshot"][number]["stage"]): { payload: T; fingerprint: string } {
  const value = envelope.programSnapshot.find((entry) => entry.stage === name);
  if (!value || value.status !== "complete") throw new Error(`OWNER_SESSION_STAGE_REQUIRED:${name}`);
  return { payload: value.payload as T, fingerprint: value.artifactFingerprint };
}

export function buildOwnerSessionPracticeSource(input: {
  readonly envelope: OwnerV2ProductProgramEnvelope;
  readonly sessionId: string;
}): SessionPracticeSourceSnapshot {
  const intentStage = stage<readonly SessionIntentPlanningResult[]>(input.envelope, "session_intent");
  const composerStage = stage<readonly { readonly skeleton: SessionSkeleton }[]>(input.envelope, "session_composer");
  const prescriptionStage = stage<readonly PrescriptionSessionCompilationResult[]>(input.envelope,
    "prescription_compiler");
  const sequenceStage = stage<readonly ProductionFinalSessionSequencingResult[]>(input.envelope,
    "final_sequencing");
  const gateStage = stage<ProductionPostPrescriptionWeekValidationResult>(input.envelope, "gate_13");
  const weekIntent = stage<ProductionWeeklyIntentV1_1>(input.envelope, "week_intent");
  const weekPlan = stage<ProductionWeekAllocationPlanV1_1>(input.envelope, "week_allocation");
  const planning = intentStage.payload.find((entry) => entry.sessionIntent?.id === input.sessionId);
  const skeleton = composerStage.payload.find((entry) => entry.skeleton.sessionIntentId === input.sessionId)?.skeleton;
  const sequence = sequenceStage.payload.find((entry) => entry.plan?.sessionIntentId === input.sessionId)?.plan;
  if (!planning?.sessionIntent || !skeleton || !sequence) throw new Error("OWNER_SESSION_EXACT_ARTIFACTS_REQUIRED");
  const prescription = prescriptionStage.payload.find((entry) =>
    entry.plans.some((plan) => sequence.prescriptionIds.includes(plan.prescriptionId)));
  if (!prescription || prescription.status !== "compiled") throw new Error("OWNER_SESSION_PRESCRIPTION_REQUIRED");
  const ledger = gateStage.payload.sourceExposureLedger.filter((entry) => entry.sessionIntentId === input.sessionId);
  if (!ledger.length) throw new Error("OWNER_SESSION_GATE_13_LINEAGE_REQUIRED");
  const first = ledger[0]!;
  const blockMinimums = Object.fromEntries(prescription.plans.flatMap((plan) =>
    plan.doseBlocks.map((block) => [block.blockId, 1])));
  return Object.freeze({
    bridgeContractReference: SESSION_PRACTICE_OPTIONS_V2_BRIDGE_CONTRACT_REFERENCE,
    sourceSessionId: input.sessionId,
    sourceSessionRevisionId: sequence.sequenceRevisionId,
    sourceSessionFingerprint: stableId("owner-session-source", { envelopeRevisionId: input.envelope.envelopeRevisionId,
      sessionId: input.sessionId, sequenceRevisionId: sequence.sequenceRevisionId }),
    finalPrescribedSessionId: sequence.sequencePlanId,
    finalPrescribedSessionRevisionId: sequence.sequenceRevisionId,
    intent: planning.sessionIntent,
    skeleton,
    prescriptions: prescription.plans,
    finalSequence: sequence,
    week: { programId: input.envelope.envelopeId, programRevisionId: input.envelope.envelopeRevisionId,
      weekPlanId: weekPlan.payload.planId, weekPlanRevisionId: weekPlan.fingerprint,
      reservationId: first.reservationId, reservationRevisionId: gateStage.payload.validationRevisionId,
      opportunityId: first.opportunityId,
      responsibilityIds: first.weeklyObjectiveIds,
      requiredResponsibilityIds: first.weeklyObjectiveIds },
    gate13: { validationId: gateStage.payload.validationId,
      validationRevisionId: gateStage.payload.validationRevisionId,
      state: gateStage.payload.status.startsWith("validated_") ? "PASS" as const : "FAIL_STOP" as const,
      sourceExposureEventIds: ledger.map((entry) => entry.sourceExposureEventId) },
    trainingReadiness: planning.trainingReadiness,
    policyVersionRefs: Object.freeze([...input.envelope.policyVersions,
      `${weekIntent.payload.plannerContract.contractId}@${weekIntent.payload.plannerContract.contractVersion}`]),
    admittedMinimumCountByBlockId: Object.freeze(blockMinimums),
    currentEquipmentReference: `owner-profile:${input.envelope.profileRevisionId}`,
    capturedAt: input.envelope.createdAt,
  });
}

function buildMode(input: { readonly source: SessionPracticeSourceSnapshot; readonly userId: string;
  readonly attemptId: string; readonly mode: SessionPracticeModeV2; readonly selectedAt: string;
  readonly basedOnRevisionId: string | null }) {
  const request = buildSessionPracticeRequest({ source: input.source, athleteId: input.userId,
    attemptId: input.attemptId, mode: input.mode, requestSource: "athlete_explicit",
    recommendationReference: null, selectedAt: input.selectedAt, evaluationTime: input.selectedAt,
    trainingSafetyReference: "owner-profile:training-safety-confirmed",
    actualAvailableMinutes: input.source.intent.availableMinutes,
    provenance: [input.source.sourceSessionRevisionId, "controlled-owner-session:explicit-mode"], state: "applied" });
  const plan = realizeSessionPractice({ source: input.source, request, createdAt: input.selectedAt });
  return { request, plan };
}

export function buildControlledOwnerSessionOptions(input: { readonly envelope: OwnerV2ProductProgramEnvelope;
  readonly sessionId: string; readonly userId: string; readonly evaluatedAt: string }) {
  const source = buildOwnerSessionPracticeSource({ envelope: input.envelope, sessionId: input.sessionId });
  const attemptId = deriveSessionPracticeAttemptId({ athleteId: input.userId, sourceSessionId: input.sessionId,
    sourceSessionRevisionId: source.sourceSessionRevisionId, opportunityId: source.week.opportunityId,
    reservationId: source.week.reservationId, attemptOrdinal: 1 });
  return Object.freeze(["full", "lighter", "recovery"].map((mode) => {
    const { plan } = buildMode({ source, userId: input.userId, attemptId,
      mode: mode as SessionPracticeModeV2, selectedAt: input.evaluatedAt, basedOnRevisionId: null });
    return Object.freeze({ mode, availability: plan.availability, duration: plan.duration,
      assignmentCount: plan.assignments.filter((entry) => entry.state !== "omitted").length });
  }));
}

export async function startControlledOwnerSession(input: {
  readonly userId: string;
  readonly envelope: OwnerV2ProductProgramEnvelope;
  readonly sessionId: string;
  readonly mode: SessionPracticeModeV2;
  readonly startedAt: string;
  readonly repository: SessionPracticePersistenceRepository;
}) {
  const source = buildOwnerSessionPracticeSource({ envelope: input.envelope, sessionId: input.sessionId });
  const current = await input.repository.listAthleteCurrentRevisions(input.userId);
  const sameSession = current.filter((entry) => entry.request.sourceSessionIntentId === input.sessionId);
  const active = sameSession.find((entry) => !["completed", "abandoned", "invalidated"]
    .includes(entry.lifecycle.state));
  if (active) return Object.freeze({ status: "existing" as const, revision: active,
    reasonCodes: Object.freeze(["OWNER_SESSION_ATTEMPT_ALREADY_ACTIVE"]) });
  const attemptId = deriveSessionPracticeAttemptId({ athleteId: input.userId, sourceSessionId: input.sessionId,
    sourceSessionRevisionId: source.sourceSessionRevisionId, opportunityId: source.week.opportunityId,
    reservationId: source.week.reservationId, attemptOrdinal: sameSession.length + 1 });
  const { request, plan } = buildMode({ source, userId: input.userId, attemptId, mode: input.mode,
    selectedAt: input.startedAt, basedOnRevisionId: null });
  if (plan.status !== "realized" || !plan.finalSequence) return Object.freeze({ status: "unavailable" as const,
    revision: null, reasonCodes: plan.availability.reasonCodes });
  const selected = selectSessionPracticeMode({ lifecycle: createSessionPracticeAttemptLifecycle({ attemptId,
    sourceSessionRevisionId: source.sourceSessionRevisionId }), request, basedOnRevisionId: null,
    finalForExecution: true });
  if (selected.realizationRevisionId !== plan.realizationRevisionId) throw new Error("OWNER_SESSION_REALIZATION_ID_CONFLICT");
  const draft = buildSessionPracticeV2Draft({ plan, lifecycle: selected.lifecycle,
    currentPosition: { exerciseIndex: 0, blockIndex: 0, setIndex: 0 }, actualPerformanceState: {}, timers: [],
    substitutionReferences: [], updatedAt: input.startedAt });
  const revision = buildPersistedSessionPracticeRevision({ basedOnPersistenceRevisionId: null,
    athleteId: input.userId, lifecycle: selected.lifecycle, request, plan, completion: null, outcomeLink: null,
    draft, sourceFingerprint: source.sourceSessionFingerprint,
    planFingerprint: fingerprintSessionPracticeRealizationPlan(plan), createdAt: input.startedAt,
    evaluationTime: input.startedAt });
  const written = await input.repository.appendRevision(revision);
  return Object.freeze({ status: written.status === "appended" ? "started" as const : written.status,
    revision, reasonCodes: Object.freeze([]) });
}

async function latestExact(input: { readonly userId: string; readonly attemptId: string;
  readonly basedOnPersistenceRevisionId: string; readonly repository: SessionPracticePersistenceRepository }) {
  const revisions = await input.repository.readAttemptRevisions(input.userId, input.attemptId);
  const latest = revisions.at(-1) ?? null;
  return latest?.persistenceRevisionId === input.basedOnPersistenceRevisionId ? latest : null;
}

export async function reviseControlledOwnerSessionMode(input: {
  readonly userId: string; readonly attemptId: string; readonly basedOnPersistenceRevisionId: string;
  readonly envelope: OwnerV2ProductProgramEnvelope; readonly mode: SessionPracticeModeV2;
  readonly selectedAt: string; readonly repository: SessionPracticePersistenceRepository;
}) {
  const prior = await latestExact(input);
  if (!prior || ["execution_started", "completed", "abandoned", "invalidated"].includes(prior.lifecycle.state)) {
    return Object.freeze({ status: "locked" as const, revision: prior,
      reasonCodes: Object.freeze(["SESSION_PRACTICE_MODE_LOCKED_AFTER_EXECUTION_START"]) });
  }
  const source = buildOwnerSessionPracticeSource({ envelope: input.envelope,
    sessionId: prior.request.sourceSessionIntentId });
  if (source.sourceSessionRevisionId !== prior.sourceSessionRevisionId) {
    return Object.freeze({ status: "conflict" as const, revision: null,
      reasonCodes: Object.freeze(["OWNER_SESSION_SOURCE_REVISION_CONFLICT"]) });
  }
  const { request, plan } = buildMode({ source, userId: input.userId, attemptId: input.attemptId,
    mode: input.mode, selectedAt: input.selectedAt, basedOnRevisionId: prior.realizationRevisionId });
  if (plan.status !== "realized" || !plan.finalSequence) return Object.freeze({ status: "unavailable" as const,
    revision: prior, reasonCodes: plan.availability.reasonCodes });
  const selected = selectSessionPracticeMode({ lifecycle: prior.lifecycle, request,
    basedOnRevisionId: prior.realizationRevisionId, finalForExecution: true });
  if (selected.status !== "selected" || selected.realizationRevisionId !== plan.realizationRevisionId) {
    return Object.freeze({ status: "conflict" as const, revision: null,
      reasonCodes: Object.freeze(["OWNER_SESSION_MODE_REVISION_CONFLICT"]) });
  }
  const draft = buildSessionPracticeV2Draft({ plan, lifecycle: selected.lifecycle,
    currentPosition: { exerciseIndex: 0, blockIndex: 0, setIndex: 0 }, actualPerformanceState: {}, timers: [],
    substitutionReferences: [], updatedAt: input.selectedAt });
  const revision = buildPersistedSessionPracticeRevision({ basedOnPersistenceRevisionId: prior.persistenceRevisionId,
    athleteId: input.userId, lifecycle: selected.lifecycle, request, plan, completion: null, outcomeLink: null,
    draft, sourceFingerprint: source.sourceSessionFingerprint,
    planFingerprint: fingerprintSessionPracticeRealizationPlan(plan), createdAt: input.selectedAt,
    evaluationTime: input.selectedAt });
  const written = await input.repository.appendRevision(revision);
  return Object.freeze({ status: written.status === "appended" ? "revised" as const : written.status,
    revision, reasonCodes: Object.freeze([]) });
}

export async function recordControlledOwnerSessionDraft(input: {
  readonly userId: string; readonly attemptId: string; readonly basedOnPersistenceRevisionId: string;
  readonly currentPosition: { readonly exerciseIndex: number; readonly blockIndex: number; readonly setIndex: number };
  readonly actualPerformanceState: Readonly<Record<string, unknown>>;
  readonly timers: readonly { readonly timerId: string; readonly elapsedSeconds: number; readonly running: boolean }[];
  readonly executionStarted: boolean; readonly recordedAt: string;
  readonly repository: SessionPracticePersistenceRepository;
}) {
  const prior = await latestExact(input);
  if (!prior || prior.completion) return Object.freeze({ status: "conflict" as const, revision: null });
  const lifecycle = input.executionStarted ? recordSessionPracticeExecutionStart({ lifecycle: prior.lifecycle,
    event: "performance_observation_recorded", occurredAt: input.recordedAt }) : prior.lifecycle;
  if (lifecycle.state === "invalidated") return Object.freeze({ status: "conflict" as const, revision: null });
  const draft = buildSessionPracticeV2Draft({ plan: prior.plan, lifecycle,
    currentPosition: input.currentPosition, actualPerformanceState: input.actualPerformanceState,
    timers: input.timers, substitutionReferences: prior.draft?.substitutionReferences ?? [],
    updatedAt: input.recordedAt });
  const revision = buildPersistedSessionPracticeRevision({ basedOnPersistenceRevisionId: prior.persistenceRevisionId,
    athleteId: input.userId, lifecycle, request: prior.request, plan: prior.plan, completion: null,
    outcomeLink: null, draft, sourceFingerprint: prior.sourceFingerprint,
    planFingerprint: prior.planFingerprint, createdAt: input.recordedAt, evaluationTime: input.recordedAt });
  const written = await input.repository.appendRevision(revision);
  return Object.freeze({ status: written.status, revision: written.status === "lineage_conflict" ? null : revision });
}

export async function completeControlledOwnerSession(input: {
  readonly userId: string; readonly attemptId: string; readonly basedOnPersistenceRevisionId: string;
  readonly envelope: OwnerV2ProductProgramEnvelope; readonly performedSourceEventIds: readonly string[];
  readonly completedBlockIds: readonly string[]; readonly partiallyCompletedBlockIds: readonly string[];
  readonly completedAt: string; readonly idempotencyKey: string;
  readonly repository: SessionPracticePersistenceRepository; readonly delivery: OwnerDeliveryRepository;
  readonly outcomeRepository?: OutcomeSourcePersistencePort;
  readonly observability?: ControlledOwnerObservability;
}) {
  const observability = input.observability ?? NOOP_CONTROLLED_OWNER_OBSERVABILITY;
  const requestFingerprint = createHash("sha256").update(JSON.stringify({ attemptId: input.attemptId,
    basedOn: input.basedOnPersistenceRevisionId, performed: [...input.performedSourceEventIds].sort(),
    completedBlocks: [...input.completedBlockIds].sort(), partial: [...input.partiallyCompletedBlockIds].sort() }))
    .digest("hex");
  const priorIdempotency = await input.delivery.readIdempotency(input.userId, "practice", input.idempotencyKey);
  if (priorIdempotency) {
    const response = priorIdempotency.responsePayload as { readonly persistenceRevisionId?: unknown } | null;
    const prior = priorIdempotency.requestFingerprint === requestFingerprint &&
      typeof response?.persistenceRevisionId === "string"
      ? await input.repository.readExactRevision(input.userId, input.attemptId, response.persistenceRevisionId) : null;
    return Object.freeze({ status: prior ? "exact_retry" as const : "conflict" as const, revision: prior });
  }
  const prior = await latestExact(input);
  if (!prior || !prior.draft || prior.lifecycle.state !== "execution_started") {
    return Object.freeze({ status: "conflict" as const, revision: null });
  }
  const source = buildOwnerSessionPracticeSource({ envelope: input.envelope,
    sessionId: prior.request.sourceSessionIntentId });
  if (source.sourceSessionRevisionId !== prior.sourceSessionRevisionId) {
    return Object.freeze({ status: "conflict" as const, revision: null });
  }
  const evidence = Object.freeze({ attemptId: input.attemptId,
    realizationRevisionId: prior.realizationRevisionId,
    performedSourceEventIds: Object.freeze([...input.performedSourceEventIds]),
    completedBlockIds: Object.freeze([...input.completedBlockIds]),
    partiallyCompletedBlockIds: Object.freeze([...input.partiallyCompletedBlockIds]), abandoned: false,
    evidenceComplete: true, conflictingEvidence: false, completedAt: input.completedAt });
  const gate13 = receiveSessionPracticeAtGate13({ source, plan: prior.plan });
  const completion = deriveSessionPracticeCompletionDisposition({ source, plan: prior.plan, gate13, evidence });
  if (completion.status === "completion_conflict" || completion.status === "completion_evidence_incomplete") {
    return Object.freeze({ status: "conflict" as const, revision: null });
  }
  const outcomeLink = buildSessionPracticeOutcomeSourceLink({ plan: prior.plan, evidence, completion });
  const lifecycle = Object.freeze({ ...prior.lifecycle, state: "completed" as const });
  const draft = buildSessionPracticeV2Draft({ plan: prior.plan, lifecycle,
    currentPosition: prior.draft.currentPosition, actualPerformanceState: prior.draft.actualPerformanceState,
    timers: prior.draft.timers.map((timer) => ({ ...timer, running: false })),
    substitutionReferences: prior.draft.substitutionReferences, updatedAt: input.completedAt });
  const revision = buildPersistedSessionPracticeRevision({ basedOnPersistenceRevisionId: prior.persistenceRevisionId,
    athleteId: input.userId, lifecycle, request: prior.request, plan: prior.plan, completion, outcomeLink, draft,
    sourceFingerprint: prior.sourceFingerprint, planFingerprint: prior.planFingerprint,
    createdAt: input.completedAt, evaluationTime: input.completedAt });
  const written = await input.repository.appendRevision(revision);
  if (!['appended', 'exact_retry'].includes(written.status)) return Object.freeze({ status: "conflict" as const,
    revision: null });
  const idempotency: OwnerIdempotencyRecord = Object.freeze({ userId: input.userId, action: "practice",
    idempotencyKey: input.idempotencyKey, requestFingerprint,
    responsePayload: Object.freeze({ persistenceRevisionId: revision.persistenceRevisionId }),
    createdAt: input.completedAt, completedAt: input.completedAt });
  const idempotencyWrite = await input.delivery.appendIdempotency(idempotency);
  if (idempotencyWrite === "conflict") return Object.freeze({ status: "conflict" as const, revision: null,
    outcome: null });
  const outcome = input.outcomeRepository ? await persistControlledOwnerSessionOutcome({ userId: input.userId,
    revision, source, repository: input.outcomeRepository, operationTime: input.completedAt }) : null;
  const completionAudit = buildOwnerDeliveryAuditEvent({ userId: input.userId, action: "session_completion",
    targetId: input.attemptId, occurredAt: input.completedAt,
    metadata: { mode: revision.plan.mode, completionDisposition: completion.status,
      performedSourceEventCount: outcomeLink.performedSourceEventIds.length,
      omittedAssignmentPerformanceCount: outcomeLink.omittedAssignmentPerformanceCount,
      automaticAdaptationCount: 0, automaticWeekRewriteCount: 0 } });
  if (await input.delivery.appendAuditEvent(completionAudit) === "conflict") {
    throw new Error("OWNER_SESSION_COMPLETION_AUDIT_CONFLICT");
  }
  if (outcome) {
    const outcomeAudit = buildOwnerDeliveryAuditEvent({ userId: input.userId, action: "outcome_source",
      targetId: outcome.outcome.sourceRecordRevisionId!, occurredAt: input.completedAt,
      metadata: { attemptId: input.attemptId, sourceCategory: "session_completion",
        state: outcome.outcome.status, automaticAdaptationCount: 0 } });
    const longitudinalAudit = buildOwnerDeliveryAuditEvent({ userId: input.userId,
      action: "longitudinal_observation", targetId: outcome.longitudinalObservation.observationId,
      occurredAt: input.completedAt, metadata: { attemptId: input.attemptId,
        completedEvidencePresent: outcome.longitudinalObservation.completedEvidencePresent,
        observationOnly: true, automaticProgressionCount: 0, automaticRegressionCount: 0,
        automaticDeloadCount: 0, automaticReplacementCount: 0 } });
    if (await input.delivery.appendAuditEvent(outcomeAudit) === "conflict" ||
        await input.delivery.appendAuditEvent(longitudinalAudit) === "conflict") {
      throw new Error("OWNER_SESSION_OUTCOME_AUDIT_CONFLICT");
    }
  }
  await observability.emit(buildControlledOwnerObservabilityEvent({ name: "completion",
    occurredAt: input.completedAt, userId: input.userId, recordId: revision.persistenceRevisionId,
    contractVersion: "1.0.0", mode: null, state: completion.status, reasonCodes: completion.reasonCodes,
    latencyMs: null, fingerprint: revision.semanticFingerprint, appSurface: "owner_session" }));
  if (outcome) await observability.emit(buildControlledOwnerObservabilityEvent({ name: "outcome_source",
    occurredAt: input.completedAt, userId: input.userId,
    recordId: outcome.outcome.sourceRecordRevisionId, contractVersion: "1.0.0", mode: null,
    state: outcome.outcome.status, reasonCodes: outcome.outcome.reasonCodes, latencyMs: null,
    fingerprint: null, appSurface: "owner_session" }));
  return Object.freeze({ status: "completed" as const, revision, outcome });
}
