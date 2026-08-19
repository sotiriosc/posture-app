import { describe, expect, it } from "vitest";
import {
  buildOwnerEnrollmentRevision,
  buildOwnerProfileRevision,
  buildOwnerProgramPreview,
  buildControlledOwnerPainAndInjuryState,
  CONTROLLED_OWNER_PRODUCTION_POLICY_VERSIONS,
  applyOwnerProfilePreflightAnswers,
  validateOwnerCalibrationSessionObservation,
  type NormalizedOutcomeSourceRecord,
  type OwnerCalibrationCycleRevision,
  type OwnerCalibrationSessionObservation,
  type OwnerProfilePreflightAnswerSubmission,
  type OwnerPainContext,
  type ProposedOwnerImportFact,
} from "@praxis/training-engine-v2";
import {
  applyControlledOwnerGetStrongerApproval,
  approveControlledOwnerGetStrongerPreview,
  createInMemoryOwnerDeliveryRepository,
  createInMemoryOwnerEnrollmentProfileRepository,
  buildControlledOwnerSessionOptions,
  completeControlledOwnerSession,
  generateControlledOwnerGetStrongerPreview,
  loadControlledOwnerDeliveryMigrations,
  recordControlledOwnerSessionDraft,
  proposeOwnerImportsFromTrainingSnapshot,
  recordControlledOwnerCalibrationRecovery,
  preflightControlledOwnerGetStrongerProfile,
  resolveOwnerPreviewReadinessStatus,
  rollbackControlledOwnerProgram,
  reviseControlledOwnerSessionMode,
  startControlledOwnerSession,
  type ControlledOwnerRequestGateResult,
} from "../../src/controlledOwnerDelivery";
import { createInMemorySessionPracticePersistenceRepository } from "../../src/sessionPracticeV2";
import type { OutcomeSourcePersistencePort } from "../../src/outcomeSourcePersistence";

const NOW = "2026-08-17T14:00:00.000Z";
const USER_ID = "synthetic-owner-application-user";
const gate = (mode: "preview" | "apply"): ControlledOwnerRequestGateResult => Object.freeze({
  allowed: true, mode, userId: USER_ID, reasonCode: "OWNER_ELIGIBLE", sessionReadCount: 1,
  databaseWriteCount: 0,
});

async function fixture(input: { readonly mode: "preview" | "apply"; readonly knownMinutes: boolean;
  readonly assessmentReferences?: readonly string[]; readonly assessmentReport?: Record<string, unknown> | null;
  readonly capabilityIds?: readonly string[]; readonly painContext?: OwnerPainContext;
  readonly proposedProductFacts?: readonly ProposedOwnerImportFact[];
  readonly preflightPassLimit?: number }) {
  const enrollmentProfiles = createInMemoryOwnerEnrollmentProfileRepository();
  const delivery = createInMemoryOwnerDeliveryRepository();
  const enrollment = buildOwnerEnrollmentRevision({ userId: USER_ID, basedOnRevisionId: null,
    state: "active", fixedGoal: "strength", permission: input.mode === "apply" ? "apply_allowed" : "preview_only",
    explicitConsent: true, acceptedVersions: ["controlled-owner-delivery@1.0.0"],
    provenance: { source: "owner_confirmation", sourceRefs: ["synthetic-consent"] }, createdAt: NOW });
  await enrollmentProfiles.appendEnrollment(enrollment);
  let profile = buildOwnerProfileRevision({ userId: USER_ID, basedOnRevisionId: null,
    primaryGoal: "strength", trainingMode: "develop", secondaryGoal: null, daysPerWeek: 4,
    sessionOpportunities: [1, 2, 3, 4].map((order) => ({ opportunityId: `owner-opportunity-${order}`, order,
      minutes: input.knownMinutes ? 90 : null })),
    sessionMinutes: input.knownMinutes ? { status: "known", minutes: 90 } :
      { status: "explicit_unknown", minutes: null },
    equipmentCapabilitySnapshot: { environment: "commercial_gym",
      capabilityIds: input.capabilityIds ?? ["commercial_gym", "dumbbells", "adjustable_bench"], confirmed: true,
      sourceRevision: "owner-equipment:synthetic-1" }, coarseExperience: "beginner", familiarity: [{
        exerciseId: "dumbbell-romanian-deadlift", realizationId: null, status: "known",
      }],
    painContext: input.painContext ??
      { regionIds: [], limitationIds: [], confirmed: true, diagnosticClaimCount: 0 },
    assessmentReferences: input.assessmentReferences ?? [], trainingSafety: "clear",
    continuityReferences: [], evaluationTime: NOW,
    provenance: { source: "owner_confirmation", sourceRefs: ["synthetic-profile"] },
    reviewState: "confirmed", createdAt: NOW });
  await enrollmentProfiles.appendProfile(profile);
  const source = { sourceProductSnapshotId: "product-snapshot:synthetic-1",
    sourceProductRevisionId: "product-revision:synthetic-1",
    activeLegacyProgramRevisionId: "legacy-program:synthetic-1",
    assessmentReport: input.assessmentReport ?? null };
  for (let pass = 0; pass < (input.preflightPassLimit ?? 12); pass += 1) {
    const preflight = preflightControlledOwnerGetStrongerProfile({ profile,
      enrollmentRevisionId: enrollment.revisionId, source,
      proposedProductFacts: input.proposedProductFacts ?? [], evaluationTime: NOW,
      engineVersion: "training-engine-v2@owner-1.0.0",
      policyVersions: CONTROLLED_OWNER_PRODUCTION_POLICY_VERSIONS }).preflight;
    if (preflight.questions.length === 0) break;
    const answers = preflight.questions.map((question): OwnerProfilePreflightAnswerSubmission =>
      question.responseType === "load_ceiling"
        ? { questionId: question.questionId, questionRevisionId: question.questionRevisionId,
          answer: "provided", value: 50, unit: "kg" }
        : { questionId: question.questionId, questionRevisionId: question.questionRevisionId,
          answer: "yes" });
    const answeredAt = new Date(Date.parse(NOW) + pass + 1).toISOString();
    const revised = applyOwnerProfilePreflightAnswers({ profile, preflight, answers, answeredAt });
    if (!revised.profile) break;
    profile = revised.profile;
    await enrollmentProfiles.appendProfile(profile);
  }
  const context = { currentProductRevisionId: "product-revision:synthetic-1",
    currentLegacyProgramRevisionId: "legacy-program:synthetic-1",
    currentEquipmentSourceRevision: profile.equipmentCapabilitySnapshot.sourceRevision,
    currentSafetyState: "clear" as const, currentEngineVersion: "training-engine-v2@owner-1.0.0",
    currentPolicyVersions: CONTROLLED_OWNER_PRODUCTION_POLICY_VERSIONS,
    activeLegacySession: false, activeV2Session: false };
  const generated = await generateControlledOwnerGetStrongerPreview({ requestedAt: NOW, evaluationTime: NOW,
    engineVersion: context.currentEngineVersion, policyVersions: context.currentPolicyVersions,
    idempotencyKey: `preview-${input.mode}-${input.knownMinutes}`,
    gate: async () => gate(input.mode), enrollmentProfiles, delivery,
    productImport: { loadProposedFacts: async () => input.proposedProductFacts ?? [] },
    loadSourceContext: async () => source });
  return { generated, enrollmentProfiles, delivery, profile, context };
}

async function reviewedDurationPreview(value: Awaited<ReturnType<typeof fixture>>) {
  const generated = value.generated.preview!;
  const preview = buildOwnerProgramPreview({ userId: generated.userId,
    generationCommandId: generated.generationCommandId, profileId: generated.profileId,
    profileRevisionId: generated.profileRevisionId,
    sourceProductSnapshotId: generated.sourceProductSnapshotId,
    sourceProductRevisionId: generated.sourceProductRevisionId,
    activeLegacyProgramRevisionId: generated.activeLegacyProgramRevisionId,
    engineVersion: generated.engineVersion, policyVersions: generated.policyVersions,
    completeProgramSnapshot: generated.completeProgramSnapshot,
    productProjection: generated.productProjection, unresolvedFacts: [],
    readinessStatus: "ready_for_approval", safetyState: generated.safetyState, createdAt: generated.createdAt });
  await value.delivery.appendPreview(preview);
  return preview;
}

function createMemoryOutcomeRepository() {
  const active = new Map<string, NormalizedOutcomeSourceRecord>();
  const immutableRevisions: NormalizedOutcomeSourceRecord[] = [];
  const persist = async (input: Parameters<OutcomeSourcePersistencePort["persistNormalizedRevision"]>[0]) => {
    const prior = active.get(input.normalizedRecord.sourceRecordId);
    if (!prior) {
      active.set(input.normalizedRecord.sourceRecordId, input.normalizedRecord);
      immutableRevisions.push(input.normalizedRecord);
    }
    return prior ? Object.freeze({ ...input.result, status: "exact_retry_returned_prior_result" as const,
      sourceRecordRevisionId: prior.sourceRecordRevisionId, activeRevisionId: prior.sourceRecordRevisionId }) :
      input.result;
  };
  const repository = {
    persistNormalizedRevision: persist,
    appendCorrection: persist,
    appendSupersession: persist,
    appendWithdrawal: persist,
    readActiveSourceRecords: async (athleteId: string) => Object.freeze([...active.values()]
      .filter((entry) => entry.athleteId === athleteId)),
  } as unknown as OutcomeSourcePersistencePort;
  return Object.freeze({ repository,
    readAll: () => Object.freeze([...immutableRevisions]),
  });
}

function calibrationObservation(input: {
  readonly cycle: OwnerCalibrationCycleRevision;
  readonly sessionId: string;
  readonly painResponse?: "none" | "discomfort" | "pain" | "session_stopped";
  readonly techniqueResponse?: "controlled" | "limited" | "stopped";
}): OwnerCalibrationSessionObservation {
  const obligations = input.cycle.obligations.filter((entry) => entry.sessionId === input.sessionId);
  return Object.freeze({
    schemaVersion: "1.0.0",
    cycleId: input.cycle.cycleId,
    sessionId: input.sessionId,
    assignments: Object.freeze(obligations.map((obligation, assignmentIndex) => Object.freeze({
      obligationId: obligation.obligationId,
      assignmentId: obligation.assignmentId,
      exerciseId: obligation.exerciseId,
      doseBlockId: obligation.doseBlockId,
      sets: Object.freeze(Array.from({ length: obligation.requiredSetCount }, (_, setIndex) => Object.freeze({
        setNumber: setIndex + 1,
        repetitions: 8,
        load: assignmentIndex % 2 === 0 ? Object.freeze({ kind: "recorded" as const, value: 20,
          unit: "kg" as const }) : Object.freeze({ kind: "recorded" as const, value: 45,
          unit: "lb" as const }),
        effort: assignmentIndex % 2 === 0 ? Object.freeze({ scale: "RIR" as const, value: 3 }) :
          Object.freeze({ scale: "RPE" as const, value: 7 }),
        completionState: "completed" as const,
        painResponse: setIndex === 0 && assignmentIndex === 0 ? input.painResponse ?? "none" : "none",
        techniqueResponse: setIndex === 0 && (input.painResponse === undefined || assignmentIndex === 1)
          ? input.techniqueResponse ?? "controlled" : "controlled",
      }))),
    }))),
    session: Object.freeze({ difficulty: 6, energy: "moderate" as const,
      immediatePainResponse: input.painResponse ?? "none", notes: "Athlete-entered context only." }),
    reportingAuthority: "athlete_explicit_report",
  });
}

describe("controlled owner genuine generation and application", () => {
  it("keeps profile, pipeline, and approval readiness separate", () => {
    expect(resolveOwnerPreviewReadinessStatus({ programSemanticCompletenessSatisfied: true,
      profileApprovalAllowed: true })).toBe("ready_for_approval");
    expect(resolveOwnerPreviewReadinessStatus({ programSemanticCompletenessSatisfied: true,
      profileApprovalAllowed: false })).toBe("preview_only_unknown_duration");
    expect(resolveOwnerPreviewReadinessStatus({ programSemanticCompletenessSatisfied: false,
      profileApprovalAllowed: true })).toBe("blocked");
  });

  it("runs genuine production stages and stores an immutable preview without Shadow or legacy generation", async () => {
    const value = await fixture({ mode: "preview", knownMinutes: true });
    expect(value.generated.status, JSON.stringify(value.generated.reasonCodes)).toBe("generated");
    expect(value.generated.preview?.completeProgramSnapshot.map((entry) => entry.stage)).toEqual([
      "product_mapping", "product_horizon", "week_intent", "week_allocation", "session_intent",
      "candidate_intelligence", "session_composer", "prescription_compiler", "final_sequencing",
      "gate_13", "phase_snapshot", "application_readiness", "owner_envelope_projection",
    ]);
    expect(value.generated).toMatchObject({ productShadowCallCount: 0, legacyGenerateProgramCallCount: 0 });
    expect(value.generated.preview).toMatchObject({ counterfactual: true, applied: false, stale: false,
      programClassification: "initial_calibration",
      readinessStatus: "ready_for_initial_calibration_approval" });
    expect(value.generated.preview?.calibrationPlan?.obligations).toHaveLength(8);
    expect(new Set(value.generated.preview?.calibrationPlan?.obligations.map((entry) => entry.sessionId)).size)
      .toBe(4);
    expect(value.generated.preview?.unresolvedFacts.some((fact) =>
      fact.startsWith("owner-query:loading-suitability:"))).toBe(false);
    expect(value.generated.preview?.unresolvedFacts.some((fact) =>
      fact.startsWith("OWNER_CALCULATED_SESSION_DURATION_INDETERMINATE:"))).toBe(false);
    expect(value.generated.preview?.productProjection.sessions.every((session) =>
      session.durationStatus === "bounded" &&
      session.calculatedDuration?.knownUpperBoundSeconds !== null &&
      session.calculatedDuration!.knownUpperBoundSeconds <= (session.availableMinutes ?? 0) * 60))
      .toBe(true);
    expect(JSON.stringify(value.generated.preview)).not.toContain("owner@example");
  });

  it("permits explicit unknown duration preview but blocks approval on unresolved truth", async () => {
    const value = await fixture({ mode: "preview", knownMinutes: false });
    expect(value.generated.status, JSON.stringify(value.generated.reasonCodes)).toBe("generated");
    expect(value.generated.preview?.readinessStatus).toBe("blocked_pending_duration");
    expect(value.generated.preview?.unresolvedFacts).toContain("OWNER_SESSION_DURATION_EXPLICIT_UNKNOWN");
  });

  it("does not persist a preview while typed loading preflight remains unresolved", async () => {
    const value = await fixture({ mode: "preview", knownMinutes: true, preflightPassLimit: 3 });

    expect(value.generated).toMatchObject({ status: "generation_blocked", preview: null,
      productShadowCallCount: 0, legacyGenerateProgramCallCount: 0 });
    expect(value.generated.reasonCodes).toEqual(expect.arrayContaining([
      "owner-query:loading-suitability:foundation:hinge_hip_extension",
      "owner-query:loading-suitability:foundation:knee_dominant_squat",
      "owner-query:loading-suitability:foundation:upper_pull",
      "owner-query:loading-suitability:foundation:upper_push",
    ]));
  });

  it("carries a confirmed structured Product assessment into causal owner preparation", async () => {
    const value = await fixture({ mode: "preview", knownMinutes: true,
      capabilityIds: ["commercial_gym", "bodyweight", "dumbbells", "adjustable_bench"],
      assessmentReferences: ["assessment:observation:pose-shoulder-asymmetry"],
      assessmentReport: { observations: [{ id: "pose-shoulder-asymmetry", confidence: "high",
        title: "Opaque title", description: "Opaque description" }],
      priorities: ["pose-shoulder-asymmetry"], summary: "Opaque summary", disclaimers: [] } });
    const mapping = value.generated.preview?.completeProgramSnapshot.find((entry) =>
      entry.stage === "product_mapping")?.payload as { readonly assessmentHandoff?: {
        readonly mappedSignalIds: readonly string[]; readonly opaqueTextConsumed: boolean } };
    expect(mapping.assessmentHandoff).toMatchObject({
      mappedSignalIds: ["product-assessment:pose-shoulder-asymmetry"], opaqueTextConsumed: false,
    });
    const preparation = value.generated.preview?.productProjection.sessions.flatMap((session) =>
      session.exerciseAssignments).filter((assignment) => assignment.section === "activation");
    expect(preparation).toHaveLength(2);
    expect(preparation).toEqual(expect.arrayContaining([expect.objectContaining({ exerciseId: "scapular-push-up",
      preparationCategories: ["activation_control"] })]));
    expect(JSON.stringify(value.generated.preview)).not.toContain("Opaque description");
  });

  it("hands confirmed typed pain into the canonical candidate pain model", async () => {
    const sourceRevision = "product-revision:synthetic-1";
    const assessmentReport = { observations: [{ id: "pain-lower-back", confidence: "medium" }],
      priorities: ["pain-lower-back"] };
    const proposedProductFacts = proposeOwnerImportsFromTrainingSnapshot({
      snapshot: { questionnaire: { painAreas: ["Lower back"] }, assessment: assessmentReport },
      sourceRevision,
    });
    const painFact = proposedProductFacts.find((fact) => fact.field === "pain_region")!;
    const value = await fixture({ mode: "preview", knownMinutes: true, assessmentReport,
      assessmentReferences: ["assessment:observation:pain-lower-back"], proposedProductFacts,
      painContext: { regionIds: ["lumbar_spine"], limitationIds: [], confirmed: true,
        diagnosticClaimCount: 0, sourceFactIds: [painFact.factId], sourceRevision } });

    expect(value.generated.status).toBe("generation_blocked");
    expect(value.generated.reasonCodes).toContain("OWNER_PRESCRIPTION_BLOCKED:incomplete");
    expect(value.generated.reasonCodes).not.toContain(
      "OWNER_ASSESSMENT_REFERENCE_UNRESOLVED:assessment:observation:pain-lower-back");
    expect(buildControlledOwnerPainAndInjuryState(value.profile)).toMatchObject({
      historicalSensitivities: [{ id: "owner-pain-context:0:lumbar_spine", region: "lumbar_spine",
        stressTags: ["loaded_hinge"], preferredModification: "monitor" }],
    });
  });

  it("fails stale or missing pain ownership closed before Candidate Intelligence", async () => {
    const sourceRevision = "product-revision:synthetic-1";
    const assessmentReport = { observations: [{ id: "pain-lower-back", confidence: "medium" }],
      priorities: ["pain-lower-back"] };
    const proposedProductFacts = proposeOwnerImportsFromTrainingSnapshot({
      snapshot: { questionnaire: { painAreas: ["Lower back"] }, assessment: assessmentReport },
      sourceRevision,
    });
    const painFact = proposedProductFacts.find((fact) => fact.field === "pain_region")!;
    const missing = await fixture({ mode: "preview", knownMinutes: false, assessmentReport,
      assessmentReferences: ["assessment:observation:pain-lower-back"], proposedProductFacts });

    expect(missing.generated).toMatchObject({ status: "generation_blocked", preview: null });
    expect(missing.generated.reasonCodes).toContain("OWNER_WEEK_INTENT_BLOCKED:blocked_by_training_readiness");
    expect(missing.generated.reasonCodes).toEqual(expect.arrayContaining([
      "OWNER_PAIN_FACT_CONFIRMATION_REQUIRED", "OWNER_PAIN_FACT_PROVENANCE_REQUIRED",
    ]));
    expect(missing.generated.reasonCodes).not.toEqual(["OWNER_SESSION_DURATION_EXPLICIT_UNKNOWN"]);
    expect(await missing.enrollmentProfiles.readCurrentProfile(USER_ID)).toEqual(missing.profile);

    const stale = await fixture({ mode: "preview", knownMinutes: true, assessmentReport,
      assessmentReferences: ["assessment:observation:pain-lower-back"], proposedProductFacts,
      painContext: { regionIds: ["lumbar_spine"], limitationIds: [], confirmed: true,
        diagnosticClaimCount: 0, sourceFactIds: [painFact.factId], sourceRevision: "product-revision:stale" } });
    expect(stale.generated).toMatchObject({ status: "generation_blocked", preview: null });
    expect(stale.generated.reasonCodes).toContain("OWNER_PAIN_FACT_SOURCE_STALE");
    expect(stale.generated.reasonCodes).toContain("OWNER_WEEK_INTENT_BLOCKED:blocked_by_training_readiness");
  });

  it("keeps approval separate, then atomically creates envelope, application, pointer, and audit", async () => {
    const value = await fixture({ mode: "apply", knownMinutes: true });
    const preview = await reviewedDurationPreview(value);
    const legacyAvailabilityProfile = { ...value.profile, daysPerWeek: 1 as const,
      sessionOpportunities: [value.profile.sessionOpportunities[0]!] };
    const legacyAvailabilityProfiles = { ...value.enrollmentProfiles,
      readCurrentProfile: async () => legacyAvailabilityProfile };
    const availabilityDeniedApproval = await approveControlledOwnerGetStrongerPreview({
      previewId: preview.previewId, previewFingerprint: preview.previewFingerprint,
      explicitConfirmation: true, csrfVerified: true, idempotencyKey: "approve-legacy-availability",
      approvedAt: NOW, gate: async () => gate("apply"), enrollmentProfiles: legacyAvailabilityProfiles,
      delivery: value.delivery, loadCurrentContext: async () => value.context });
    expect(availabilityDeniedApproval).toMatchObject({ status: "denied",
      reasonCodes: ["OWNER_PROFILE_AVAILABILITY_RECONFIRMATION_REQUIRED"] });
    const approved = await approveControlledOwnerGetStrongerPreview({ previewId: preview.previewId,
      previewFingerprint: preview.previewFingerprint, explicitConfirmation: true, csrfVerified: true,
      idempotencyKey: "approve-key-1", approvedAt: NOW, gate: async () => gate("apply"),
      enrollmentProfiles: value.enrollmentProfiles, delivery: value.delivery,
      loadCurrentContext: async () => value.context });
    expect(approved.status).toBe("approved");
    expect(approved.applicationCount).toBe(0);
    expect(await value.delivery.readActivePointer(USER_ID)).toBeNull();
    const availabilityDeniedApplication = await applyControlledOwnerGetStrongerApproval({
      approvalId: approved.approval!.approvalId, idempotencyKey: "apply-legacy-availability",
      csrfVerified: true, appliedAt: NOW, gate: async () => gate("apply"),
      enrollmentProfiles: legacyAvailabilityProfiles, delivery: value.delivery,
      loadCurrentContext: async () => value.context });
    expect(availabilityDeniedApplication).toMatchObject({ status: "denied",
      reasonCodes: ["OWNER_PROFILE_AVAILABILITY_RECONFIRMATION_REQUIRED"] });
    const applied = await applyControlledOwnerGetStrongerApproval({ approvalId: approved.approval!.approvalId,
      idempotencyKey: "apply-key-1", csrfVerified: true, appliedAt: NOW,
      gate: async () => gate("apply"), enrollmentProfiles: value.enrollmentProfiles,
      delivery: value.delivery, loadCurrentContext: async () => value.context });
    expect(applied.status).toBe("applied");
    expect(applied.envelope?.legacyFallbackReference).toBe(value.context.currentLegacyProgramRevisionId);
    expect(applied.application?.envelopeRevisionId).toBe(applied.envelope?.envelopeRevisionId);
    expect(await value.delivery.readActivePointer(USER_ID)).toMatchObject({ mode: "v2_owner", revision: 1,
      activeApplicationId: applied.application?.applicationId });
    expect(await value.delivery.listAuditEvents(USER_ID)).toHaveLength(1);
    expect(applied.envelope?.assignmentIds).toEqual(preview.productProjection.sessions.flatMap((session) =>
      session.exerciseAssignments.map((assignment) => assignment.assignmentId)).sort());
    const approvalRetry = await approveControlledOwnerGetStrongerPreview({ previewId: preview.previewId,
      previewFingerprint: preview.previewFingerprint, explicitConfirmation: true, csrfVerified: true,
      idempotencyKey: "approve-key-1", approvedAt: "2026-08-17T14:01:00.000Z",
      gate: async () => gate("apply"), enrollmentProfiles: value.enrollmentProfiles, delivery: value.delivery,
      loadCurrentContext: async () => value.context });
    expect(approvalRetry).toMatchObject({ status: "exact_retry",
      approval: { approvalId: approved.approval?.approvalId } });
    const applyRetry = await applyControlledOwnerGetStrongerApproval({ approvalId: approved.approval!.approvalId,
      idempotencyKey: "apply-key-1", csrfVerified: true, appliedAt: "2026-08-17T14:01:00.000Z",
      gate: async () => gate("apply"), enrollmentProfiles: value.enrollmentProfiles,
      delivery: value.delivery, loadCurrentContext: async () => value.context });
    expect(applyRetry).toMatchObject({ status: "exact_retry",
      application: { applicationId: applied.application?.applicationId },
      envelope: { envelopeRevisionId: applied.envelope?.envelopeRevisionId } });
  });

  it("rejects stale source revisions before approval", async () => {
    const value = await fixture({ mode: "apply", knownMinutes: true });
    const preview = await reviewedDurationPreview(value);
    const approved = await approveControlledOwnerGetStrongerPreview({ previewId: preview.previewId,
      previewFingerprint: preview.previewFingerprint, explicitConfirmation: true, csrfVerified: true,
      idempotencyKey: "stale-key", approvedAt: NOW, gate: async () => gate("apply"),
      enrollmentProfiles: value.enrollmentProfiles, delivery: value.delivery,
      loadCurrentContext: async () => ({ ...value.context,
        currentProductRevisionId: "product-revision:changed" }) });
    expect(approved.status).toBe("stale");
    expect(approved.reasonCodes).toContain("OWNER_PRODUCT_REVISION_CHANGED");
  });

  it("executes and resumes an exact owner V2 Full session without touching legacy drafts", async () => {
    const value = await fixture({ mode: "apply", knownMinutes: true });
    const preview = await reviewedDurationPreview(value);
    const approved = await approveControlledOwnerGetStrongerPreview({ previewId: preview.previewId,
      previewFingerprint: preview.previewFingerprint, explicitConfirmation: true, csrfVerified: true,
      idempotencyKey: "session-approve", approvedAt: NOW, gate: async () => gate("apply"),
      enrollmentProfiles: value.enrollmentProfiles, delivery: value.delivery,
      loadCurrentContext: async () => value.context });
    const applied = await applyControlledOwnerGetStrongerApproval({ approvalId: approved.approval!.approvalId,
      idempotencyKey: "session-apply", csrfVerified: true, appliedAt: NOW, gate: async () => gate("apply"),
      enrollmentProfiles: value.enrollmentProfiles, delivery: value.delivery,
      loadCurrentContext: async () => value.context });
    const envelope = applied.envelope!;
    const sessionId = envelope.productProjection.sessions[0]!.sessionId;
    const options = buildControlledOwnerSessionOptions({ envelope, sessionId, userId: USER_ID,
      evaluatedAt: NOW });
    expect(options.map((option) => option.mode)).toEqual(["full", "lighter", "recovery"]);
    expect(options[0]?.availability.state).toBe("available");
    const practice = createInMemorySessionPracticePersistenceRepository();
    const started = await startControlledOwnerSession({ userId: USER_ID, envelope, sessionId, mode: "full",
      startedAt: NOW, repository: practice });
    expect(started.status).toBe("started");
    const initial = started.revision!;
    expect(initial).toMatchObject({ lifecycle: { state: "final_for_execution", selectedMode: "full" },
      draft: { selectedMode: "full", currentPosition: { exerciseIndex: 0, blockIndex: 0, setIndex: 0 } } });
    const recordedAt = "2026-08-17T14:01:00.000Z";
    const retained = initial.plan.assignments.filter((entry) => entry.state !== "omitted");
    const performed = retained.map((entry) => entry.sourceExposureEventId);
    const blocks = retained.flatMap((entry) => entry.retainedBlockIds);
    const recorded = await recordControlledOwnerSessionDraft({ userId: USER_ID, attemptId: initial.attemptId,
      basedOnPersistenceRevisionId: initial.persistenceRevisionId,
      currentPosition: { exerciseIndex: 0, blockIndex: 0, setIndex: 1 },
      actualPerformanceState: Object.fromEntries(performed.map((eventId) => [eventId, { completed: true }])),
      timers: [{ timerId: "rest", elapsedSeconds: 30, running: false }], executionStarted: true,
      recordedAt, repository: practice });
    expect(recorded.revision?.lifecycle.state).toBe("execution_started");
    const locked = await reviseControlledOwnerSessionMode({ userId: USER_ID, attemptId: initial.attemptId,
      basedOnPersistenceRevisionId: recorded.revision!.persistenceRevisionId, envelope, mode: "lighter",
      selectedAt: "2026-08-17T14:02:00.000Z", repository: practice });
    expect(locked.status).toBe("locked");
    const completed = await completeControlledOwnerSession({ userId: USER_ID, attemptId: initial.attemptId,
      basedOnPersistenceRevisionId: recorded.revision!.persistenceRevisionId, envelope,
      performedSourceEventIds: performed, completedBlockIds: blocks, partiallyCompletedBlockIds: [],
      completedAt: "2026-08-17T14:03:00.000Z", idempotencyKey: "session-complete",
      repository: practice, delivery: value.delivery, outcomeRepository: {
        persistNormalizedRevision: async (entry) => entry.result,
      } as unknown as OutcomeSourcePersistencePort });
    expect(completed.status).toBe("completed");
    expect(completed.revision).toMatchObject({ lifecycle: { state: "completed" },
      completion: { status: "full_completed_as_prescribed", automaticReallocationApplied: false,
        adaptationActionApplied: false }, outcomeLink: { omittedAssignmentPerformanceCount: 0,
        selectedModeTreatedAsPerformance: false } });
    expect(completed.outcome).toMatchObject({ longitudinalObservation: { observationOnly: true,
      automaticProgressionApplied: false, automaticRegressionApplied: false,
      automaticDeloadApplied: false, repeatedCompletedEvidenceRequiredForAction: true },
      automaticAdaptationCount: 0, automaticWeekRewriteCount: 0 });
    expect((await value.delivery.listAuditEvents(USER_ID)).map((event) => event.action)).toEqual(
      expect.arrayContaining(["owner_v2_program_applied", "session_completion",
        "longitudinal_observation", "outcome_source"]));
    expect(await practice.listAthleteCurrentRevisions(USER_ID)).toHaveLength(1);
  });

  it("requires explicit calibration consent and carries a complete immutable evidence cycle into a new preview",
    async () => {
      const value = await fixture({ mode: "apply", knownMinutes: true });
      const preview = value.generated.preview!;
      expect(preview).toMatchObject({ programClassification: "initial_calibration",
        readinessStatus: "ready_for_initial_calibration_approval", applied: false });
      expect(preview.calibrationPlan?.obligations).toHaveLength(8);
      expect(new Set(preview.calibrationPlan?.obligations.map((entry) => entry.sessionId)).size).toBe(4);
      expect(preview.calibrationPlan?.obligations.every((entry) => entry.provenance.includes(
        "developmental_work"))).toBe(true);

      const ordinary = await approveControlledOwnerGetStrongerPreview({ previewId: preview.previewId,
        previewFingerprint: preview.previewFingerprint, explicitConfirmation: true, csrfVerified: true,
        idempotencyKey: "calibration-ordinary-approval", approvedAt: NOW, gate: async () => gate("apply"),
        enrollmentProfiles: value.enrollmentProfiles, delivery: value.delivery,
        loadCurrentContext: async () => value.context });
      expect(ordinary).toMatchObject({ status: "denied",
        reasonCodes: ["OWNER_APPROVAL_CLASSIFICATION_MISMATCH"], applicationCount: 0 });

      const approved = await approveControlledOwnerGetStrongerPreview({ previewId: preview.previewId,
        previewFingerprint: preview.previewFingerprint, explicitConfirmation: true,
        approvalClassification: "initial_calibration", csrfVerified: true,
        idempotencyKey: "calibration-explicit-approval", approvedAt: NOW,
        gate: async () => gate("apply"), enrollmentProfiles: value.enrollmentProfiles,
        delivery: value.delivery, loadCurrentContext: async () => value.context });
      expect(approved).toMatchObject({ status: "approved",
        approval: { programClassification: "initial_calibration",
          previewFingerprint: preview.previewFingerprint }, applicationCount: 0 });
      const applied = await applyControlledOwnerGetStrongerApproval({ approvalId: approved.approval!.approvalId,
        idempotencyKey: "calibration-explicit-application", csrfVerified: true, appliedAt: NOW,
        gate: async () => gate("apply"), enrollmentProfiles: value.enrollmentProfiles,
        delivery: value.delivery, loadCurrentContext: async () => value.context });
      expect(applied).toMatchObject({ status: "applied",
        envelope: { programClassification: "initial_calibration",
          legacyFallbackReference: value.context.currentLegacyProgramRevisionId } });
      const envelope = applied.envelope!;
      const originalPointer = await value.delivery.readActivePointer(USER_ID);
      let cycle = await value.delivery.readCalibrationCycleForEnvelope(USER_ID, envelope.envelopeRevisionId);
      expect(cycle).toMatchObject({ state: "calibration_evidence_incomplete",
        evidenceSufficiency: { status: "missing", reliablePriorPerformancePermitted: false,
          progressionAuthorized: false } });
      expect(cycle?.obligations.map((entry) => entry.obligationFingerprint))
        .toEqual(preview.calibrationPlan?.obligations.map((entry) => entry.obligationFingerprint));
      expect(await value.delivery.readCalibrationCycleCurrent("another-user", cycle!.cycleId)).toBeNull();

      const practice = createInMemorySessionPracticePersistenceRepository();
      const outcomeStore = createMemoryOutcomeRepository();
      const sessionIds = preview.productProjection.sessions.map((session) => session.sessionId);
      let firstPersistedRecord = "";
      for (const [sessionIndex, sessionId] of sessionIds.entries()) {
        const sessionTime = new Date(Date.parse(NOW) + (sessionIndex + 1) * 60_000).toISOString();
        const currentOptions = buildControlledOwnerSessionOptions({ envelope, sessionId, userId: USER_ID,
          evaluatedAt: sessionTime, calibrationCycle: cycle });
        expect(currentOptions.find((entry) => entry.mode === "full")?.availability.state).toBe("available");
        expect(currentOptions.filter((entry) => entry.mode !== "full").every((entry) =>
          entry.availability.state !== "available")).toBe(true);
        const started = await startControlledOwnerSession({ userId: USER_ID, envelope, sessionId, mode: "full",
          startedAt: sessionTime, repository: practice, calibrationCycle: cycle });
        expect(started.status).toBe("started");
        const initial = started.revision!;
        const retained = initial.plan.assignments.filter((entry) => entry.state !== "omitted");
        const performed = retained.map((entry) => entry.sourceExposureEventId);
        const blocks = retained.flatMap((entry) => entry.retainedBlockIds);
        const observation = calibrationObservation({ cycle: cycle!, sessionId });
        expect(validateOwnerCalibrationSessionObservation({ observation,
          plan: envelope.calibrationPlan!, expectedSessionId: sessionId })).toEqual([]);
        if (sessionIndex === 0) {
          const invalidEffort = { ...observation, assignments: observation.assignments.map((assignment,
            assignmentIndex) => assignmentIndex === 0 ? { ...assignment, sets: assignment.sets.map((set,
              setIndex) => setIndex === 0 ? { ...set, effort: { scale: "RIR" as const, value: 11 } } : set) } :
            assignment) };
          expect(validateOwnerCalibrationSessionObservation({ observation: invalidEffort,
            plan: envelope.calibrationPlan!, expectedSessionId: sessionId }))
            .toContain("OWNER_CALIBRATION_EFFORT_INVALID");
        }
        const recordedAt = new Date(Date.parse(sessionTime) + 500).toISOString();
        const recorded = await recordControlledOwnerSessionDraft({ userId: USER_ID,
          attemptId: initial.attemptId, basedOnPersistenceRevisionId: initial.persistenceRevisionId,
          currentPosition: { exerciseIndex: 0, blockIndex: 0, setIndex: 1 },
          actualPerformanceState: Object.freeze({ ...Object.fromEntries(performed.map((eventId) =>
            [eventId, { completed: true }])), calibrationObservation: observation }), timers: [],
          executionStarted: true, recordedAt, repository: practice });
        expect(recorded.status).toBe("appended");
        expect(recorded.revision?.lifecycle.state, JSON.stringify(recorded.revision?.lifecycle))
          .toBe("execution_started");
        if (sessionIndex === 0) expect(outcomeStore.readAll()).toEqual([]);
        const completedAt = new Date(Date.parse(sessionTime) + 1_000).toISOString();
        const completed = await completeControlledOwnerSession({ userId: USER_ID,
          attemptId: initial.attemptId, basedOnPersistenceRevisionId: recorded.revision!.persistenceRevisionId,
          envelope, performedSourceEventIds: performed, completedBlockIds: blocks,
          partiallyCompletedBlockIds: [], completedAt, idempotencyKey: `calibration-complete-${sessionIndex}`,
          repository: practice, delivery: value.delivery, outcomeRepository: outcomeStore.repository });
        expect(completed, JSON.stringify(completed)).toMatchObject({ status: "completed",
          outcome: { automaticAdaptationCount: 0, automaticWeekRewriteCount: 0,
            longitudinalObservation: { observationOnly: true, automaticProgressionApplied: false,
              automaticReplacementApplied: false } } });
        cycle = completed.calibrationCycle!;
        expect(cycle.evidenceSufficiency.reliablePriorPerformancePermitted).toBe(false);
        expect(cycle.evidenceSufficiency.recoveryPendingSessionIds).toContain(sessionId);
        if (sessionIndex === 0) {
          const records = outcomeStore.readAll();
          const performance = records.filter((entry) => entry.sourceCategory === "block_performance");
          expect(performance).toHaveLength(2);
          expect(performance.flatMap((entry) => entry.structuredFacts)
            .filter((fact) => fact.factType === "actual_load").map((fact) => fact.unit).sort())
            .toEqual(["kg", "kg", "lb", "lb"]);
          expect(performance.flatMap((entry) => entry.structuredFacts)
            .filter((fact) => fact.factType === "actual_effort").map((fact) => fact.unit).sort())
            .toEqual(["rir", "rir", "rpe", "rpe"]);
          expect(JSON.stringify(records)).not.toContain("Athlete-entered context only.");
          expect(records.find((entry) => entry.sourceCategory === "session_completion")?.structuredFacts)
            .toEqual(expect.arrayContaining([expect.objectContaining({ factType: "session_difficulty", value: 6 }),
              expect.objectContaining({ factType: "energy_readiness", value: "moderate" })]));
          firstPersistedRecord = JSON.stringify(records[0]);
          const replay = await startControlledOwnerSession({ userId: USER_ID, envelope, sessionId, mode: "full",
            startedAt: completedAt, repository: practice, calibrationCycle: cycle });
          expect(replay).toMatchObject({ status: "unavailable",
            reasonCodes: ["OWNER_CALIBRATION_SESSION_ALREADY_COMPLETED"] });
          const remaining = buildControlledOwnerSessionOptions({ envelope, sessionId: sessionIds[1]!,
            userId: USER_ID, evaluatedAt: completedAt, calibrationCycle: cycle });
          expect(remaining.find((entry) => entry.mode === "full")?.availability.state).toBe("available");
        }
        const recoveryAt = new Date(Date.parse(sessionTime) + 2_000).toISOString();
        const recoveryObservation = Object.freeze({ schemaVersion: "1.0.0" as const,
          cycleId: cycle.cycleId, sessionId, readiness: "explicit_adequate" as const,
          sleepReport: "restorative" as const, reportingAuthority: "athlete_explicit_report" as const });
        const recovery = await recordControlledOwnerCalibrationRecovery({ userId: USER_ID,
          cycleId: cycle.cycleId, observation: recoveryObservation,
          idempotencyKey: `calibration-recovery-${sessionIndex}`, recordedAt: recoveryAt,
          delivery: value.delivery, outcomeRepository: outcomeStore.repository });
        expect(recovery).toMatchObject({ status: "recorded", automaticApplicationCount: 0 });
        cycle = recovery.cycle!;
        expect(cycle.evidenceSufficiency.recoveryPendingSessionIds).not.toContain(sessionId);
        if (sessionIndex === 0) {
          const retry = await recordControlledOwnerCalibrationRecovery({ userId: USER_ID,
            cycleId: cycle.cycleId, observation: recoveryObservation,
            idempotencyKey: "calibration-recovery-0", recordedAt: recoveryAt,
            delivery: value.delivery, outcomeRepository: outcomeStore.repository });
          expect(retry.status).toBe("exact_retry");
          const duplicateWithNewKey = await recordControlledOwnerCalibrationRecovery({ userId: USER_ID,
            cycleId: cycle.cycleId, observation: recoveryObservation,
            idempotencyKey: "calibration-recovery-duplicate", recordedAt: recoveryAt,
            delivery: value.delivery, outcomeRepository: outcomeStore.repository });
          expect(duplicateWithNewKey).toMatchObject({ status: "invalid",
            reasonCodes: ["OWNER_CALIBRATION_RECOVERY_ALREADY_RECORDED_USE_CORRECTION"] });
        }
      }

      expect(cycle).toMatchObject({ state: "calibration_complete_pending_review",
        evidenceSufficiency: { status: "sufficient_for_reviewed_subsequent_planning",
          missingObligationIds: [], recoveryPendingSessionIds: [],
          reliablePriorPerformancePermitted: true, progressionAuthorized: false } });
      const completedExerciseCounts = new Map<string, number>();
      cycle!.obligations.forEach((entry) => completedExerciseCounts.set(entry.exerciseId,
        (completedExerciseCounts.get(entry.exerciseId) ?? 0) + 1));
      expect([...completedExerciseCounts.values()].every((count) => count >= 2)).toBe(true);
      expect(cycle!.obligations.every((entry) => entry.completionState === "complete")).toBe(true);
      expect(JSON.stringify(outcomeStore.readAll()[0])).toBe(firstPersistedRecord);
      expect(await outcomeStore.repository.readActiveSourceRecords("another-user", cycle!.createdAt)).toEqual([]);
      expect(await value.delivery.listCalibrationCycleRevisions(USER_ID, cycle!.cycleId)).toHaveLength(9);
      expect(await value.delivery.readActivePointer(USER_ID)).toEqual(originalPointer);
      expect(await value.delivery.listApplications(USER_ID)).toHaveLength(1);

      const successorTime = new Date(Date.parse(NOW) + 10 * 60_000).toISOString();
      const successorInput = { requestedAt: successorTime, evaluationTime: successorTime,
        engineVersion: value.context.currentEngineVersion, policyVersions: value.context.currentPolicyVersions,
        idempotencyKey: "post-calibration-preview", gate: async () => gate("apply"),
        enrollmentProfiles: value.enrollmentProfiles, delivery: value.delivery,
        productImport: { loadProposedFacts: async () => [] },
        loadSourceContext: async () => ({ sourceProductSnapshotId: "product-snapshot:synthetic-1",
          sourceProductRevisionId: "product-revision:synthetic-1",
          activeLegacyProgramRevisionId: value.context.currentLegacyProgramRevisionId, assessmentReport: null }),
        loadCalibrationEvidence: async () => ({ cycle: cycle!, records: outcomeStore.readAll() }) };
      const successor = await generateControlledOwnerGetStrongerPreview(successorInput);
      expect(successor).toMatchObject({ status: "generated", productShadowCallCount: 0,
        legacyGenerateProgramCallCount: 0, preview: { programClassification: "ordinary_program",
          readinessStatus: "ready_for_approval", applied: false } });
      expect(successor.preview?.previewId).not.toBe(preview.previewId);
      const performanceRevisionIds = outcomeStore.readAll().filter((entry) =>
        entry.sourceCategory === "block_performance").map((entry) => entry.sourceRecordRevisionId);
      expect(JSON.stringify(successor.preview)).toContain(performanceRevisionIds[0]!);
      const successorLoads = successor.preview?.productProjection.sessions.flatMap((session) =>
        session.exerciseAssignments.flatMap((assignment) => assignment.doseBlocks?.map((block) => block.load) ?? []));
      expect(successorLoads).not.toContain("20 kg");
      expect(successorLoads).not.toContain("45 lb");
      expect(successor.preview?.activeLegacyProgramRevisionId).toBe(value.context.currentLegacyProgramRevisionId);
      expect(await value.delivery.readActivePointer(USER_ID)).toEqual(originalPointer);
      expect(await value.delivery.listApplications(USER_ID)).toHaveLength(1);
      const successorRetry = await generateControlledOwnerGetStrongerPreview(successorInput);
      expect(successorRetry).toMatchObject({ status: "exact_retry",
        preview: { previewId: successor.preview?.previewId } });
    });

  it("routes painful or technique-limited calibration evidence to canonical Safety review without mutation",
    async () => {
      const value = await fixture({ mode: "apply", knownMinutes: true });
      const preview = value.generated.preview!;
      const approved = await approveControlledOwnerGetStrongerPreview({ previewId: preview.previewId,
        previewFingerprint: preview.previewFingerprint, explicitConfirmation: true,
        approvalClassification: "initial_calibration", csrfVerified: true,
        idempotencyKey: "safety-calibration-approval", approvedAt: NOW, gate: async () => gate("apply"),
        enrollmentProfiles: value.enrollmentProfiles, delivery: value.delivery,
        loadCurrentContext: async () => value.context });
      const applied = await applyControlledOwnerGetStrongerApproval({ approvalId: approved.approval!.approvalId,
        idempotencyKey: "safety-calibration-application", csrfVerified: true, appliedAt: NOW,
        gate: async () => gate("apply"), enrollmentProfiles: value.enrollmentProfiles,
        delivery: value.delivery, loadCurrentContext: async () => value.context });
      const envelope = applied.envelope!;
      const initialCycle = (await value.delivery.readCalibrationCycleForEnvelope(USER_ID,
        envelope.envelopeRevisionId))!;
      const sessionId = envelope.productProjection.sessions[0]!.sessionId;
      const practice = createInMemorySessionPracticePersistenceRepository();
      const outcomeStore = createMemoryOutcomeRepository();
      const started = await startControlledOwnerSession({ userId: USER_ID, envelope, sessionId, mode: "full",
        startedAt: NOW, repository: practice, calibrationCycle: initialCycle });
      const retained = started.revision!.plan.assignments.filter((entry) => entry.state !== "omitted");
      const performed = retained.map((entry) => entry.sourceExposureEventId);
      const observation = calibrationObservation({ cycle: initialCycle, sessionId,
        painResponse: "discomfort", techniqueResponse: "limited" });
      const recordedAt = new Date(Date.parse(NOW) + 1_000).toISOString();
      const recorded = await recordControlledOwnerSessionDraft({ userId: USER_ID,
        attemptId: started.revision!.attemptId,
        basedOnPersistenceRevisionId: started.revision!.persistenceRevisionId,
        currentPosition: { exerciseIndex: 0, blockIndex: 0, setIndex: 1 },
        actualPerformanceState: { calibrationObservation: observation }, timers: [], executionStarted: true,
        recordedAt, repository: practice });
      expect(recorded.revision?.lifecycle.state, JSON.stringify(recorded.revision?.lifecycle))
        .toBe("execution_started");
      const completed = await completeControlledOwnerSession({ userId: USER_ID,
        attemptId: started.revision!.attemptId,
        basedOnPersistenceRevisionId: recorded.revision!.persistenceRevisionId, envelope,
        performedSourceEventIds: performed,
        completedBlockIds: retained.flatMap((entry) => entry.retainedBlockIds),
        partiallyCompletedBlockIds: [], completedAt: new Date(Date.parse(NOW) + 2_000).toISOString(),
        idempotencyKey: "safety-calibration-complete",
        repository: practice, delivery: value.delivery, outcomeRepository: outcomeStore.repository });

      expect(completed, JSON.stringify(completed)).toMatchObject({ status: "completed",
        calibrationCycle: { state: "calibration_safety_review_required",
          evidenceSufficiency: { status: "safety_blocked", reliablePriorPerformancePermitted: false,
            progressionAuthorized: false } },
        outcome: { automaticAdaptationCount: 0, automaticWeekRewriteCount: 0 } });
      expect(outcomeStore.readAll().map((entry) => entry.sourceCategory)).toEqual(expect.arrayContaining([
        "block_performance", "training_response", "training_safety",
      ]));
      const techniqueFact = outcomeStore.readAll().flatMap((entry) => entry.structuredFacts)
        .find((fact) => fact.factType === "technique_response" && fact.value === "limited");
      expect(techniqueFact).toBeTruthy();
      expect(outcomeStore.readAll().find((entry) => entry.sourceCategory === "block_performance"))
        .toMatchObject({ sourceAuthority: "athlete_explicit_report",
          provenance: expect.arrayContaining(["controlled-owner:athlete-explicit-post-performance"]) });
      expect(outcomeStore.readAll().find((entry) => entry.sourceCategory === "training_safety")
        ?.structuredFacts).toEqual(expect.arrayContaining([expect.objectContaining({ factType: "safety_block" })]));
      const nextSessionOptions = buildControlledOwnerSessionOptions({ envelope,
        sessionId: envelope.productProjection.sessions[1]!.sessionId, userId: USER_ID,
        evaluatedAt: NOW, calibrationCycle: completed.calibrationCycle });
      expect(nextSessionOptions.find((entry) => entry.mode === "full")?.availability.reasonCodes)
        .toContain("OWNER_CALIBRATION_REVIEW_REQUIRED_BEFORE_CONTINUATION");
      expect(await value.delivery.listApplications(USER_ID)).toHaveLength(1);
    });

  it("rolls the active pointer back atomically without deleting V2 lineage", async () => {
    const value = await fixture({ mode: "apply", knownMinutes: true });
    const preview = await reviewedDurationPreview(value);
    const approved = await approveControlledOwnerGetStrongerPreview({ previewId: preview.previewId,
      previewFingerprint: preview.previewFingerprint, explicitConfirmation: true, csrfVerified: true,
      idempotencyKey: "rollback-approve", approvedAt: NOW, gate: async () => gate("apply"),
      enrollmentProfiles: value.enrollmentProfiles, delivery: value.delivery,
      loadCurrentContext: async () => value.context });
    const applied = await applyControlledOwnerGetStrongerApproval({ approvalId: approved.approval!.approvalId,
      idempotencyKey: "rollback-apply", csrfVerified: true, appliedAt: NOW, gate: async () => gate("apply"),
      enrollmentProfiles: value.enrollmentProfiles, delivery: value.delivery,
      loadCurrentContext: async () => value.context });
    const activePointer = await value.delivery.readActivePointer(USER_ID);
    const rollback = await rollbackControlledOwnerProgram({ gate: gate("apply"), repository: value.delivery,
      applicationId: applied.application!.applicationId, expectedPointerRevision: activePointer!.revision,
      explicitConfirmation: true, csrfVerified: true, idempotencyKey: "rollback-key",
      rolledBackAt: "2026-08-17T15:00:00.000Z" });
    expect(rollback).toMatchObject({ status: "rolled_back", pointer: { mode: "legacy",
      activeApplicationId: null, revision: 2 }, auditEvent: { action: "rollback",
        metadata: { deletionCount: 0, preservedV2Records: true, legacyRestored: true } } });
    expect(await value.delivery.readApplicationExact(USER_ID, applied.application!.applicationId))
      .toEqual(applied.application);
    expect(await value.delivery.readEnvelopeExact(USER_ID, applied.envelope!.envelopeId,
      applied.envelope!.envelopeRevisionId)).toEqual(applied.envelope);
    const retry = await rollbackControlledOwnerProgram({ gate: gate("apply"), repository: value.delivery,
      applicationId: applied.application!.applicationId, expectedPointerRevision: activePointer!.revision,
      explicitConfirmation: true, csrfVerified: true, idempotencyKey: "rollback-key",
      rolledBackAt: "2026-08-17T15:00:00.000Z" });
    expect(retry.status).toBe("exact_retry");
  });

  it("locks all ten default-empty PostgreSQL owner tables", () => {
    const sql = loadControlledOwnerDeliveryMigrations().map((entry) => entry.sql).join("\n");
    expect(sql.match(/CREATE TABLE IF NOT EXISTS owner_v2_/g)).toHaveLength(10);
    expect(sql).not.toMatch(/INSERT INTO/i);
    expect(sql).not.toMatch(/email/i);
  });
});
