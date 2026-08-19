import type { NormalizedOutcomeSourceRecord } from "../outcomeSources";
import type { TrainingHistory } from "../domain/history";
import type { CompletedPrescriptionPerformanceReference } from "../prescription/compiler/contracts";
import { explicitIsoTime, stableId, uniqueSorted } from "../prescription/compiler/utilities";
import {
  OWNER_DELIVERY_CONTRACTS,
  type ControlledOwnerV2ProgramPreview,
  type OwnerDeliveryContractReference,
  type OwnerProgramClassification,
  type OwnerProgramProjection,
  type OwnerV2ProductProgramEnvelope,
} from "./contracts";

export const OWNER_CALIBRATION_EVIDENCE_POLICY = Object.freeze({
  policyId: "CONTROLLED_OWNER_INITIAL_CALIBRATION_EVIDENCE_SUFFICIENCY",
  version: "1.0.0",
  minimumCompletedExposuresPerResponsibility: 2,
  minimumCompletedExposuresPerExercise: 2,
  recoveryRequiredForEveryCompletedSession: true,
  automaticProgressionPermitted: false,
} as const);

export const OWNER_CALIBRATION_REQUIRED_OBSERVATION_FIELDS = Object.freeze([
  "completed_set_number",
  "completed_repetitions",
  "actual_load_or_not_applicable",
  "effort_scale",
  "effort_value",
  "completion_state",
  "pain_response",
  "technique_response",
] as const);

export type OwnerCalibrationRequiredObservationField =
  (typeof OWNER_CALIBRATION_REQUIRED_OBSERVATION_FIELDS)[number];
export type OwnerCalibrationEffortScale = "RPE" | "RIR";
export type OwnerCalibrationTechniqueResponse = "controlled" | "limited" | "stopped";
export type OwnerCalibrationPainResponse = "none" | "discomfort" | "pain" | "session_stopped";
export type OwnerCalibrationSetCompletionState = "completed" | "partially_completed" | "stopped";
export type OwnerCalibrationEvidenceSufficiencyStatus =
  | "missing"
  | "incomplete"
  | "contradictory"
  | "safety_blocked"
  | "sufficient_for_reviewed_subsequent_planning";
export type OwnerCalibrationCycleState =
  | "calibration_evidence_incomplete"
  | "calibration_evidence_contradictory"
  | "calibration_safety_review_required"
  | "calibration_complete_pending_review";

export interface OwnerCalibrationEvidenceObligation {
  readonly obligationId: string;
  readonly cycleId: string;
  readonly programFingerprint: string;
  readonly profileRevisionId: string;
  readonly weekObjectiveIds: readonly string[];
  readonly sessionId: string;
  readonly assignmentId: string;
  readonly exerciseId: string;
  readonly responsibilityIds: readonly string[];
  readonly prescriptionId: string;
  readonly prescriptionRevisionId: string;
  readonly sourceExposureEventId: string;
  readonly doseBlockId: string;
  readonly requiredSetCount: number;
  readonly requiredObservationFields: readonly OwnerCalibrationRequiredObservationField[];
  readonly completionState: "required" | "complete";
  readonly provenance: readonly string[];
  readonly obligationFingerprint: string;
}

export interface OwnerCalibrationPlan {
  readonly contract: OwnerDeliveryContractReference;
  readonly cycleId: string;
  readonly programFingerprint: string;
  readonly profileRevisionId: string;
  readonly evidencePolicyReference: string;
  readonly obligations: readonly OwnerCalibrationEvidenceObligation[];
  readonly planFingerprint: string;
}

export interface OwnerCalibrationSetObservation {
  readonly setNumber: number;
  readonly repetitions: number;
  readonly load:
    | { readonly kind: "recorded"; readonly value: number; readonly unit: "kg" | "lb" }
    | { readonly kind: "not_applicable"; readonly reason: "bodyweight_or_unloaded" };
  readonly effort: { readonly scale: OwnerCalibrationEffortScale; readonly value: number };
  readonly completionState: OwnerCalibrationSetCompletionState;
  readonly painResponse: OwnerCalibrationPainResponse;
  readonly techniqueResponse: OwnerCalibrationTechniqueResponse;
}

export interface OwnerCalibrationAssignmentObservation {
  readonly obligationId: string;
  readonly assignmentId: string;
  readonly exerciseId: string;
  readonly doseBlockId: string;
  readonly sets: readonly OwnerCalibrationSetObservation[];
}

export interface OwnerCalibrationSessionObservation {
  readonly schemaVersion: "1.0.0";
  readonly cycleId: string;
  readonly sessionId: string;
  readonly assignments: readonly OwnerCalibrationAssignmentObservation[];
  readonly session: {
    readonly difficulty: number;
    readonly energy: "low" | "moderate" | "high";
    readonly immediatePainResponse: OwnerCalibrationPainResponse;
    readonly notes: string;
  };
  readonly reportingAuthority: "athlete_explicit_report";
}

export interface OwnerCalibrationRecoveryObservation {
  readonly schemaVersion: "1.0.0";
  readonly cycleId: string;
  readonly sessionId: string;
  readonly readiness: "explicit_adequate" | "localized_concern" | "systemic_concern" | "explicit_not_ready";
  readonly sleepReport: "restorative" | "disrupted" | "insufficient" | "unknown";
  readonly reportingAuthority: "athlete_explicit_report";
}

export interface OwnerCalibrationEvidenceSufficiency {
  readonly policyReference: string;
  readonly status: OwnerCalibrationEvidenceSufficiencyStatus;
  readonly completedObligationIds: readonly string[];
  readonly missingObligationIds: readonly string[];
  readonly completedSessionIds: readonly string[];
  readonly recoveryPendingSessionIds: readonly string[];
  readonly sourceRecordRevisionIds: readonly string[];
  readonly reasonCodes: readonly string[];
  readonly reliablePriorPerformancePermitted: boolean;
  readonly progressionAuthorized: false;
}

export interface OwnerCalibrationCycleRevision {
  readonly contract: OwnerDeliveryContractReference;
  readonly cycleId: string;
  readonly cycleRevisionId: string;
  readonly basedOnRevisionId: string | null;
  readonly userId: string;
  readonly enrollmentRevisionId: string;
  readonly profileRevisionId: string;
  readonly previewId: string;
  readonly previewFingerprint: string;
  readonly programFingerprint: string;
  readonly applicationId: string;
  readonly envelopeId: string;
  readonly envelopeRevisionId: string;
  readonly state: OwnerCalibrationCycleState;
  readonly obligations: readonly OwnerCalibrationEvidenceObligation[];
  readonly evidenceSufficiency: OwnerCalibrationEvidenceSufficiency;
  readonly createdAt: string;
  readonly cycleFingerprint: string;
}

const policyReference = `${OWNER_CALIBRATION_EVIDENCE_POLICY.policyId}@${OWNER_CALIBRATION_EVIDENCE_POLICY.version}`;

export function resolveOwnerProgramClassification(input: {
  readonly programClassification?: OwnerProgramClassification;
}): OwnerProgramClassification {
  return input.programClassification ?? "ordinary_program";
}

function developmentalAssignments(projection: OwnerProgramProjection) {
  return projection.sessions.flatMap((session) => session.exerciseAssignments.flatMap((assignment) => {
    if (assignment.section !== "main" && assignment.section !== "accessory") return [];
    return (assignment.doseBlocks ?? []).flatMap((block) => block.purpose === "developmental_work" ? [{
      session,
      assignment,
      block,
    }] : []);
  }));
}

export function buildOwnerCalibrationPlan(input: {
  readonly userId: string;
  readonly profileRevisionId: string;
  readonly projection: OwnerProgramProjection;
}): OwnerCalibrationPlan {
  const programFingerprint = input.projection.projectionFingerprint;
  const cycleId = stableId("owner-v2-calibration-cycle", {
    userId: input.userId,
    profileRevisionId: input.profileRevisionId,
    programFingerprint,
  });
  const obligations = developmentalAssignments(input.projection).map(({ session, assignment, block }) => {
    if (!assignment.prescriptionId || !assignment.prescriptionRevisionId || !assignment.sourceEventId) {
      throw new Error("OWNER_CALIBRATION_DEVELOPMENTAL_LINEAGE_REQUIRED");
    }
    const semantic = Object.freeze({
      cycleId,
      programFingerprint,
      profileRevisionId: input.profileRevisionId,
      weekObjectiveIds: Object.freeze(uniqueSorted(assignment.weekObjectiveIds ?? [])),
      sessionId: session.sessionId,
      assignmentId: assignment.assignmentId,
      exerciseId: assignment.exerciseId,
      responsibilityIds: Object.freeze(uniqueSorted(assignment.responsibilityIds ?? [])),
      prescriptionId: assignment.prescriptionId,
      prescriptionRevisionId: assignment.prescriptionRevisionId,
      sourceExposureEventId: assignment.sourceEventId,
      doseBlockId: block.blockId,
      requiredSetCount: assignment.sets ?? 1,
      requiredObservationFields: OWNER_CALIBRATION_REQUIRED_OBSERVATION_FIELDS,
      completionState: "required" as const,
      provenance: Object.freeze([
        input.projection.projectionFingerprint,
        assignment.assignmentId,
        block.blockId,
        "developmental_work",
      ]),
    });
    const obligationId = stableId("owner-v2-calibration-obligation", semantic);
    return Object.freeze({
      obligationId,
      ...semantic,
      obligationFingerprint: stableId("owner-v2-calibration-obligation-fingerprint", {
        obligationId,
        ...semantic,
      }),
    });
  });
  if (!obligations.length) throw new Error("OWNER_CALIBRATION_DEVELOPMENTAL_OBLIGATIONS_REQUIRED");
  const semantic = Object.freeze({
    cycleId,
    programFingerprint,
    profileRevisionId: input.profileRevisionId,
    evidencePolicyReference: policyReference,
    obligations: Object.freeze(obligations),
  });
  return Object.freeze({
    contract: OWNER_DELIVERY_CONTRACTS.calibrationPlan,
    ...semantic,
    planFingerprint: stableId("owner-v2-calibration-plan", semantic),
  });
}

export function validateOwnerCalibrationSessionObservation(input: {
  readonly observation: unknown;
  readonly plan: OwnerCalibrationPlan;
  readonly expectedSessionId: string;
}): readonly string[] {
  const reasons: string[] = [];
  if (!input.observation || typeof input.observation !== "object" || Array.isArray(input.observation)) {
    return Object.freeze(["OWNER_CALIBRATION_OBSERVATION_REQUIRED"]);
  }
  const value = input.observation as Partial<OwnerCalibrationSessionObservation>;
  if (value.schemaVersion !== "1.0.0") reasons.push("OWNER_CALIBRATION_OBSERVATION_SCHEMA_UNSUPPORTED");
  if (value.cycleId !== input.plan.cycleId) reasons.push("OWNER_CALIBRATION_CYCLE_MISMATCH");
  if (value.sessionId !== input.expectedSessionId) reasons.push("OWNER_CALIBRATION_SESSION_MISMATCH");
  if (value.reportingAuthority !== "athlete_explicit_report") reasons.push("OWNER_CALIBRATION_AUTHORITY_REQUIRED");
  const expected = input.plan.obligations.filter((entry) => entry.sessionId === input.expectedSessionId);
  if (!Array.isArray(value.assignments)) reasons.push("OWNER_CALIBRATION_ASSIGNMENTS_REQUIRED");
  const assignments = Array.isArray(value.assignments) ? value.assignments : [];
  const seen = new Set<string>();
  for (const assignment of assignments) {
    const obligation = expected.find((entry) => entry.obligationId === assignment.obligationId);
    if (!obligation || assignment.assignmentId !== obligation.assignmentId ||
        assignment.exerciseId !== obligation.exerciseId || assignment.doseBlockId !== obligation.doseBlockId) {
      reasons.push("OWNER_CALIBRATION_OBLIGATION_LINEAGE_MISMATCH");
      continue;
    }
    if (seen.has(assignment.obligationId)) reasons.push("OWNER_CALIBRATION_OBLIGATION_DUPLICATE");
    seen.add(assignment.obligationId);
    if (!Array.isArray(assignment.sets) || assignment.sets.length !== obligation.requiredSetCount) {
      reasons.push(`OWNER_CALIBRATION_SET_COUNT_REQUIRED:${assignment.obligationId}`);
      continue;
    }
    const setNumbers = new Set<number>();
    for (const set of assignment.sets) {
      if (!Number.isInteger(set.setNumber) || set.setNumber < 1 || set.setNumber > obligation.requiredSetCount ||
          setNumbers.has(set.setNumber)) reasons.push("OWNER_CALIBRATION_SET_NUMBER_INVALID");
      setNumbers.add(set.setNumber);
      if (!Number.isInteger(set.repetitions) || set.repetitions < 0) reasons.push("OWNER_CALIBRATION_REPETITIONS_INVALID");
      if (!set.load || set.load.kind === "recorded" &&
          (!Number.isFinite(set.load.value) || set.load.value < 0 || !["kg", "lb"].includes(set.load.unit)) ||
          set.load?.kind === "not_applicable" && set.load.reason !== "bodyweight_or_unloaded") {
        reasons.push("OWNER_CALIBRATION_LOAD_INVALID");
      }
      if (!set.effort || !["RPE", "RIR"].includes(set.effort.scale) ||
          !Number.isFinite(set.effort.value) || set.effort.value < 0 || set.effort.value > 10) {
        reasons.push("OWNER_CALIBRATION_EFFORT_INVALID");
      }
      if (!["completed", "partially_completed", "stopped"].includes(set.completionState)) {
        reasons.push("OWNER_CALIBRATION_COMPLETION_STATE_INVALID");
      }
      if (!["none", "discomfort", "pain", "session_stopped"].includes(set.painResponse)) {
        reasons.push("OWNER_CALIBRATION_PAIN_RESPONSE_INVALID");
      }
      if (!["controlled", "limited", "stopped"].includes(set.techniqueResponse)) {
        reasons.push("OWNER_CALIBRATION_TECHNIQUE_RESPONSE_INVALID");
      }
    }
  }
  expected.forEach((entry) => {
    if (!seen.has(entry.obligationId)) reasons.push(`OWNER_CALIBRATION_OBLIGATION_MISSING:${entry.obligationId}`);
  });
  if (!value.session || !Number.isFinite(value.session.difficulty) || value.session.difficulty < 1 ||
      value.session.difficulty > 10) reasons.push("OWNER_CALIBRATION_SESSION_DIFFICULTY_INVALID");
  if (!value.session || !["low", "moderate", "high"].includes(value.session.energy)) {
    reasons.push("OWNER_CALIBRATION_SESSION_ENERGY_INVALID");
  }
  if (!value.session || !["none", "discomfort", "pain", "session_stopped"].includes(
    value.session.immediatePainResponse,
  )) reasons.push("OWNER_CALIBRATION_SESSION_PAIN_INVALID");
  if (!value.session || typeof value.session.notes !== "string" || value.session.notes.length > 2000) {
    reasons.push("OWNER_CALIBRATION_SESSION_NOTES_INVALID");
  }
  return Object.freeze(uniqueSorted(reasons));
}

export function validateOwnerCalibrationRecoveryObservation(input: {
  readonly observation: unknown;
  readonly cycle: OwnerCalibrationCycleRevision;
}): readonly string[] {
  const reasons: string[] = [];
  if (!input.observation || typeof input.observation !== "object" || Array.isArray(input.observation)) {
    return Object.freeze(["OWNER_CALIBRATION_RECOVERY_REQUIRED"]);
  }
  const value = input.observation as Partial<OwnerCalibrationRecoveryObservation>;
  if (value.schemaVersion !== "1.0.0") reasons.push("OWNER_CALIBRATION_RECOVERY_SCHEMA_UNSUPPORTED");
  if (value.cycleId !== input.cycle.cycleId) reasons.push("OWNER_CALIBRATION_CYCLE_MISMATCH");
  if (!value.sessionId || !input.cycle.obligations.some((entry) => entry.sessionId === value.sessionId)) {
    reasons.push("OWNER_CALIBRATION_RECOVERY_SESSION_MISMATCH");
  }
  if (!value.readiness || !["explicit_adequate", "localized_concern", "systemic_concern",
    "explicit_not_ready"].includes(value.readiness)) reasons.push("OWNER_CALIBRATION_RECOVERY_STATE_INVALID");
  if (!value.sleepReport || !["restorative", "disrupted", "insufficient", "unknown"].includes(value.sleepReport)) {
    reasons.push("OWNER_CALIBRATION_SLEEP_REPORT_INVALID");
  }
  if (value.reportingAuthority !== "athlete_explicit_report") reasons.push("OWNER_CALIBRATION_AUTHORITY_REQUIRED");
  return Object.freeze(uniqueSorted(reasons));
}

function facts(record: NormalizedOutcomeSourceRecord, type: string) {
  return record.structuredFacts.filter((entry) => entry.factType === type);
}

function hasSafetyConcern(records: readonly NormalizedOutcomeSourceRecord[]): boolean {
  return records.some((record) =>
    facts(record, "safety_block").length > 0 ||
    facts(record, "immediate_pain_response").some((fact) => fact.value !== "none") ||
    facts(record, "technique_response").some((fact) => fact.value !== "controlled") ||
    facts(record, "response_tolerance").some((fact) => fact.value === "limited" || fact.value === "adverse") ||
    facts(record, "readiness_report").some((fact) => fact.value !== "explicit_adequate"),
  );
}

function evaluateObligation(obligation: OwnerCalibrationEvidenceObligation,
  records: readonly NormalizedOutcomeSourceRecord[]): { complete: boolean; contradictory: boolean } {
  const matching = records.filter((record) => record.sourceCategory === "block_performance" &&
    record.targetIds.includes(obligation.cycleId) && record.targetIds.includes(obligation.obligationId));
  if (!matching.length) return { complete: false, contradictory: false };
  const setFacts = matching.flatMap((record) => facts(record, "actual_order").map((entry) => ({ record, entry })));
  const setNumbers = setFacts.map(({ entry }) => entry.value).filter((value): value is number => typeof value === "number");
  const contradictory = matching.length > 1 || setNumbers.length !== new Set(setNumbers).size ||
    matching.some((record) => record.lineage.plannedBlockId !== obligation.doseBlockId ||
      record.lineage.prescriptionId !== obligation.prescriptionId ||
      record.lineage.prescriptionRevisionId !== obligation.prescriptionRevisionId);
  const byBlock = new Map<string, NormalizedOutcomeSourceRecord["structuredFacts"]>();
  matching.forEach((record) => record.structuredFacts.forEach((entry) => {
    if (!entry.blockId) return;
    byBlock.set(entry.blockId, [...(byBlock.get(entry.blockId) ?? []), entry]);
  }));
  const completeSets = [...byBlock.values()].filter((entries) => {
    const has = (type: string) => entries.some((entry) => entry.factType === type);
    const complete = entries.some((entry) => entry.factType === "block_completed");
    const load = has("actual_load") || has("actual_load_not_applicable");
    const effort = entries.find((entry) => entry.factType === "actual_effort");
    return complete && has("actual_order") && has("actual_reps") && load && Boolean(effort) &&
      ["rpe", "rir"].includes(effort?.unit ?? "") && has("technique_response") &&
      has("immediate_pain_response");
  }).length;
  return { complete: !contradictory && completeSets === obligation.requiredSetCount, contradictory };
}

export function evaluateOwnerCalibrationEvidence(input: {
  readonly cycle: OwnerCalibrationCycleRevision;
  readonly records: readonly NormalizedOutcomeSourceRecord[];
}): OwnerCalibrationEvidenceSufficiency {
  const scoped = input.records.filter((record) => record.athleteId === input.cycle.userId &&
    record.targetIds.includes(input.cycle.cycleId));
  const evaluations = input.cycle.obligations.map((obligation) => ({
    obligation,
    ...evaluateObligation(obligation, scoped),
  }));
  const completedObligationIds = evaluations.filter((entry) => entry.complete)
    .map((entry) => entry.obligation.obligationId);
  const missingObligationIds = evaluations.filter((entry) => !entry.complete)
    .map((entry) => entry.obligation.obligationId);
  const expectedSessionIds = uniqueSorted(input.cycle.obligations.map((entry) => entry.sessionId));
  const completedSessionIds = uniqueSorted(scoped.filter((record) => record.sourceCategory === "session_completion" &&
    facts(record, "adherence_state").some((fact) => fact.value === "session_completed"))
    .flatMap((record) => expectedSessionIds.filter((sessionId) => record.targetIds.includes(sessionId))));
  const adequateRecovery = new Set(scoped.filter((record) => record.sourceCategory === "recovery_readiness" &&
    facts(record, "readiness_report").some((fact) => fact.value === "explicit_adequate"))
    .flatMap((record) => expectedSessionIds.filter((sessionId) => record.targetIds.includes(sessionId))));
  const recoveryPendingSessionIds = completedSessionIds.filter((sessionId) => !adequateRecovery.has(sessionId));
  const countsByResponsibility = new Map<string, number>();
  evaluations.filter((entry) => entry.complete).forEach((entry) => entry.obligation.responsibilityIds.forEach((id) =>
    countsByResponsibility.set(id, (countsByResponsibility.get(id) ?? 0) + 1)));
  const responsibilityExposureIncomplete = uniqueSorted(input.cycle.obligations.flatMap((entry) =>
    entry.responsibilityIds).filter((id) => (countsByResponsibility.get(id) ?? 0) <
      OWNER_CALIBRATION_EVIDENCE_POLICY.minimumCompletedExposuresPerResponsibility));
  const countsByExercise = new Map<string, number>();
  evaluations.filter((entry) => entry.complete).forEach((entry) =>
    countsByExercise.set(entry.obligation.exerciseId,
      (countsByExercise.get(entry.obligation.exerciseId) ?? 0) + 1));
  const exerciseExposureIncomplete = uniqueSorted(input.cycle.obligations.map((entry) => entry.exerciseId)
    .filter((id) => (countsByExercise.get(id) ?? 0) <
      OWNER_CALIBRATION_EVIDENCE_POLICY.minimumCompletedExposuresPerExercise));
  const contradictory = evaluations.some((entry) => entry.contradictory);
  const safetyBlocked = hasSafetyConcern(scoped);
  const allObligations = missingObligationIds.length === 0;
  const allSessions = completedSessionIds.length === expectedSessionIds.length;
  const reasons = uniqueSorted([
    ...(scoped.length ? [] : ["OWNER_CALIBRATION_EVIDENCE_MISSING"]),
    ...missingObligationIds.map((id) => `OWNER_CALIBRATION_OBLIGATION_INCOMPLETE:${id}`),
    ...expectedSessionIds.filter((id) => !completedSessionIds.includes(id))
      .map((id) => `OWNER_CALIBRATION_SESSION_INCOMPLETE:${id}`),
    ...recoveryPendingSessionIds.map((id) => `OWNER_CALIBRATION_RECOVERY_REQUIRED:${id}`),
    ...responsibilityExposureIncomplete.map((id) => `OWNER_CALIBRATION_REPEATED_EXPOSURE_REQUIRED:${id}`),
    ...exerciseExposureIncomplete.map((id) => `OWNER_CALIBRATION_REPEATED_EXERCISE_EXPOSURE_REQUIRED:${id}`),
    ...(contradictory ? ["OWNER_CALIBRATION_EVIDENCE_CONTRADICTORY"] : []),
    ...(safetyBlocked ? ["OWNER_CALIBRATION_SAFETY_REVIEW_REQUIRED"] : []),
  ]);
  const sufficient = scoped.length > 0 && !contradictory && !safetyBlocked && allObligations && allSessions &&
    recoveryPendingSessionIds.length === 0 && responsibilityExposureIncomplete.length === 0 &&
    exerciseExposureIncomplete.length === 0;
  const status: OwnerCalibrationEvidenceSufficiencyStatus = contradictory ? "contradictory" :
    safetyBlocked ? "safety_blocked" : sufficient ? "sufficient_for_reviewed_subsequent_planning" :
      scoped.length === 0 ? "missing" : "incomplete";
  return Object.freeze({
    policyReference,
    status,
    completedObligationIds: Object.freeze(completedObligationIds),
    missingObligationIds: Object.freeze(missingObligationIds),
    completedSessionIds: Object.freeze(completedSessionIds),
    recoveryPendingSessionIds: Object.freeze(recoveryPendingSessionIds),
    sourceRecordRevisionIds: Object.freeze(uniqueSorted(scoped.map((record) => record.sourceRecordRevisionId))),
    reasonCodes: Object.freeze(reasons),
    reliablePriorPerformancePermitted: sufficient,
    progressionAuthorized: false,
  });
}

function cycleState(evidence: OwnerCalibrationEvidenceSufficiency): OwnerCalibrationCycleState {
  if (evidence.status === "contradictory") return "calibration_evidence_contradictory";
  if (evidence.status === "safety_blocked") return "calibration_safety_review_required";
  if (evidence.missingObligationIds.length === 0) return "calibration_complete_pending_review";
  return "calibration_evidence_incomplete";
}

function buildCycle(input: Omit<OwnerCalibrationCycleRevision,
  "contract" | "cycleRevisionId" | "cycleFingerprint">): OwnerCalibrationCycleRevision {
  if (!explicitIsoTime(input.createdAt)) throw new Error("OWNER_CALIBRATION_EXPLICIT_TIME_REQUIRED");
  const semantic = Object.freeze({ ...input,
    obligations: Object.freeze(input.obligations.map((entry) => Object.freeze({ ...entry }))),
  });
  const cycleRevisionId = stableId("owner-v2-calibration-cycle-revision", semantic);
  return Object.freeze({
    contract: OWNER_DELIVERY_CONTRACTS.calibrationCycle,
    cycleRevisionId,
    ...semantic,
    cycleFingerprint: stableId("owner-v2-calibration-cycle-fingerprint", { cycleRevisionId, ...semantic }),
  });
}

export function buildInitialOwnerCalibrationCycle(input: {
  readonly userId: string;
  readonly enrollmentRevisionId: string;
  readonly preview: ControlledOwnerV2ProgramPreview;
  readonly envelope: OwnerV2ProductProgramEnvelope;
  readonly createdAt: string;
}): OwnerCalibrationCycleRevision {
  if (resolveOwnerProgramClassification(input.preview) !== "initial_calibration" || !input.preview.calibrationPlan ||
      resolveOwnerProgramClassification(input.envelope) !== "initial_calibration" ||
      input.envelope.calibrationPlan?.planFingerprint !== input.preview.calibrationPlan.planFingerprint) {
    throw new Error("OWNER_CALIBRATION_EXACT_PLAN_REQUIRED");
  }
  const initialEvidence: OwnerCalibrationEvidenceSufficiency = Object.freeze({
    policyReference,
    status: "missing",
    completedObligationIds: Object.freeze([]),
    missingObligationIds: Object.freeze(input.preview.calibrationPlan.obligations.map((entry) => entry.obligationId)),
    completedSessionIds: Object.freeze([]),
    recoveryPendingSessionIds: Object.freeze([]),
    sourceRecordRevisionIds: Object.freeze([]),
    reasonCodes: Object.freeze(["OWNER_CALIBRATION_EVIDENCE_MISSING"]),
    reliablePriorPerformancePermitted: false,
    progressionAuthorized: false,
  });
  return buildCycle({
    cycleId: input.preview.calibrationPlan.cycleId,
    basedOnRevisionId: null,
    userId: input.userId,
    enrollmentRevisionId: input.enrollmentRevisionId,
    profileRevisionId: input.preview.profileRevisionId,
    previewId: input.preview.previewId,
    previewFingerprint: input.preview.previewFingerprint,
    programFingerprint: input.preview.calibrationPlan.programFingerprint,
    applicationId: input.envelope.applicationId,
    envelopeId: input.envelope.envelopeId,
    envelopeRevisionId: input.envelope.envelopeRevisionId,
    state: "calibration_evidence_incomplete",
    obligations: input.preview.calibrationPlan.obligations,
    evidenceSufficiency: initialEvidence,
    createdAt: input.createdAt,
  });
}

export function reviseOwnerCalibrationCycleFromEvidence(input: {
  readonly prior: OwnerCalibrationCycleRevision;
  readonly records: readonly NormalizedOutcomeSourceRecord[];
  readonly createdAt: string;
}): OwnerCalibrationCycleRevision {
  const evidence = evaluateOwnerCalibrationEvidence({ cycle: input.prior, records: input.records });
  const complete = new Set(evidence.completedObligationIds);
  const { contract: _contract, cycleRevisionId: _cycleRevisionId,
    cycleFingerprint: _cycleFingerprint, ...priorSemantic } = input.prior;
  void [_contract, _cycleRevisionId, _cycleFingerprint];
  return buildCycle({
    ...priorSemantic,
    basedOnRevisionId: input.prior.cycleRevisionId,
    state: cycleState(evidence),
    obligations: input.prior.obligations.map((entry) => Object.freeze({ ...entry,
      completionState: complete.has(entry.obligationId) ? "complete" as const : "required" as const })),
    evidenceSufficiency: evidence,
    createdAt: input.createdAt,
  });
}

export function buildOwnerCalibrationCompletedPerformanceReferences(input: {
  readonly cycle: OwnerCalibrationCycleRevision;
  readonly records: readonly NormalizedOutcomeSourceRecord[];
}): readonly CompletedPrescriptionPerformanceReference[] {
  const evidence = evaluateOwnerCalibrationEvidence(input);
  if (evidence.status !== "sufficient_for_reviewed_subsequent_planning") {
    throw new Error("OWNER_CALIBRATION_EVIDENCE_NOT_SUFFICIENT");
  }
  const scoped = input.records.filter((record) => record.athleteId === input.cycle.userId &&
    record.sourceCategory === "block_performance" && record.targetIds.includes(input.cycle.cycleId));
  return Object.freeze(input.cycle.obligations.map((obligation) => {
    const record = scoped.find((entry) => entry.targetIds.includes(obligation.obligationId));
    if (!record || record.lineage.sourceExposureEventId !== obligation.sourceExposureEventId ||
        record.lineage.prescriptionId !== obligation.prescriptionId ||
        record.lineage.prescriptionRevisionId !== obligation.prescriptionRevisionId) {
      throw new Error("OWNER_CALIBRATION_PERFORMANCE_REFERENCE_LINEAGE_INVALID");
    }
    return Object.freeze({
      performanceRecordId: record.sourceRecordRevisionId,
      prescriptionId: obligation.prescriptionId,
      prescriptionRevisionId: obligation.prescriptionRevisionId,
      sourceExposureEventId: obligation.sourceExposureEventId,
      actualObserved: true as const,
      completedAt: record.eventTime,
    });
  }));
}

export function buildOwnerCalibrationTrainingHistory(input: {
  readonly cycle: OwnerCalibrationCycleRevision;
  readonly records: readonly NormalizedOutcomeSourceRecord[];
}): TrainingHistory {
  const evidence = evaluateOwnerCalibrationEvidence(input);
  if (evidence.status !== "sufficient_for_reviewed_subsequent_planning") {
    throw new Error("OWNER_CALIBRATION_EVIDENCE_NOT_SUFFICIENT");
  }
  const scoped = input.records.filter((record) => record.athleteId === input.cycle.userId &&
    record.targetIds.includes(input.cycle.cycleId));
  const exerciseCounts = new Map<string, number>();
  input.cycle.obligations.forEach((entry) =>
    exerciseCounts.set(entry.exerciseId, (exerciseCounts.get(entry.exerciseId) ?? 0) + 1));
  const exerciseIds = uniqueSorted([...exerciseCounts].filter(([, count]) => count >=
    OWNER_CALIBRATION_EVIDENCE_POLICY.minimumCompletedExposuresPerExercise).map(([exerciseId]) => exerciseId));
  const responseObservations = input.cycle.obligations.map((obligation) => {
    const record = scoped.find((entry) => entry.sourceCategory === "block_performance" &&
      entry.targetIds.includes(obligation.obligationId))!;
    return Object.freeze({
      observationId: stableId("owner-calibration-training-response", {
        obligationId: obligation.obligationId,
        sourceRecordRevisionId: record.sourceRecordRevisionId,
      }),
      occurredAt: record.eventTime,
      exposure: Object.freeze({
        realizationStatus: "linked_to_performance_record" as const,
        exerciseId: obligation.exerciseId,
        prescriptionId: obligation.prescriptionId,
        performanceRecordId: record.sourceRecordId,
        sourceExposureEventId: obligation.sourceExposureEventId,
        realizedStressExposureIds: Object.freeze([]),
      }),
      tolerance: "tolerated" as const,
      symptomChange: "not_applicable" as const,
      onset: "not_applicable" as const,
      persistence: "not_applicable" as const,
      consequence: "completed" as const,
      reportedLocations: Object.freeze([]),
      provenance: Object.freeze({
        source: "athlete_report" as const,
        sourceRef: record.sourceRecordRevisionId,
        evidenceBasis: Object.freeze([record.sourceRecordRevisionId, obligation.obligationId]),
        reportedBy: input.cycle.userId,
        recordedAt: record.ingestionTime,
      }),
      notes: Object.freeze([]),
    });
  });
  return Object.freeze({
    exerciseHistory: Object.freeze({
      events: Object.freeze(input.cycle.obligations.map((obligation) => Object.freeze({
        id: stableId("owner-calibration-history-event", obligation.obligationId),
        exerciseId: obligation.exerciseId,
        type: "successful_completion" as const,
        occurredAt: scoped.find((record) => record.targetIds.includes(obligation.obligationId))?.eventTime,
        notes: "Canonical controlled-owner calibration exposure completed.",
      }))),
      stableExerciseIds: Object.freeze(exerciseIds),
      blockedExerciseIds: Object.freeze([]),
    }),
    sessionHistory: Object.freeze({ completedSessionIds: evidence.completedSessionIds,
      missedSessionIds: Object.freeze([]), substitutedExerciseIds: Object.freeze([]), notes: Object.freeze([]) }),
    programHistory: Object.freeze({ completedPhaseIds: Object.freeze([]),
      completedWeekIds: Object.freeze([input.cycle.cycleId]), adherenceNotes: Object.freeze([]) }),
    progressionState: Object.freeze({ readyToProgressExerciseIds: Object.freeze([]),
      holdExerciseIds: Object.freeze(exerciseIds), stalledExerciseIds: Object.freeze([]),
      successfulMovementRoles: Object.freeze([]) }),
    fatigueState: Object.freeze({ overall: "moderate" as const, byMovementRole: Object.freeze({}) }),
    trainingResponseHistory: Object.freeze({ observations: Object.freeze(responseObservations) }),
  });
}
