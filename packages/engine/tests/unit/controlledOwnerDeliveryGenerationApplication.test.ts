import { describe, expect, it } from "vitest";
import {
  buildOwnerEnrollmentRevision,
  buildOwnerProfileRevision,
  buildOwnerProgramPreview,
  buildControlledOwnerPainAndInjuryState,
  CONTROLLED_OWNER_PRODUCTION_POLICY_VERSIONS,
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
  readonly proposedProductFacts?: readonly ProposedOwnerImportFact[] }) {
  const enrollmentProfiles = createInMemoryOwnerEnrollmentProfileRepository();
  const delivery = createInMemoryOwnerDeliveryRepository();
  const enrollment = buildOwnerEnrollmentRevision({ userId: USER_ID, basedOnRevisionId: null,
    state: "active", fixedGoal: "strength", permission: input.mode === "apply" ? "apply_allowed" : "preview_only",
    explicitConsent: true, acceptedVersions: ["controlled-owner-delivery@1.0.0"],
    provenance: { source: "owner_confirmation", sourceRefs: ["synthetic-consent"] }, createdAt: NOW });
  await enrollmentProfiles.appendEnrollment(enrollment);
  const profile = buildOwnerProfileRevision({ userId: USER_ID, basedOnRevisionId: null,
    primaryGoal: "strength", trainingMode: "develop", secondaryGoal: null, daysPerWeek: 2,
    sessionOpportunities: [1, 2].map((order) => ({ opportunityId: `owner-opportunity-${order}`, order,
      minutes: input.knownMinutes ? 45 : null })),
    sessionMinutes: input.knownMinutes ? { status: "known", minutes: 45 } :
      { status: "explicit_unknown", minutes: null },
    equipmentCapabilitySnapshot: { environment: "commercial_gym",
      capabilityIds: input.capabilityIds ?? ["commercial_gym", "dumbbells", "adjustable_bench"], confirmed: true,
      sourceRevision: "owner-equipment:synthetic-1" }, coarseExperience: "beginner", familiarity: [],
    painContext: input.painContext ??
      { regionIds: [], limitationIds: [], confirmed: true, diagnosticClaimCount: 0 },
    assessmentReferences: input.assessmentReferences ?? [], trainingSafety: "clear",
    continuityReferences: [], evaluationTime: NOW,
    provenance: { source: "owner_confirmation", sourceRefs: ["synthetic-profile"] },
    reviewState: "confirmed", createdAt: NOW });
  await enrollmentProfiles.appendProfile(profile);
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
    loadSourceContext: async () => ({ sourceProductSnapshotId: "product-snapshot:synthetic-1",
      sourceProductRevisionId: context.currentProductRevisionId,
      activeLegacyProgramRevisionId: context.currentLegacyProgramRevisionId,
      assessmentReport: input.assessmentReport ?? null }) });
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
      readinessStatus: "preview_only_unknown_duration" });
    expect(value.generated.preview?.unresolvedFacts.some((fact) =>
      fact.startsWith("OWNER_CALCULATED_SESSION_DURATION_INDETERMINATE:"))).toBe(true);
    expect(JSON.stringify(value.generated.preview)).not.toContain("owner@example");
  });

  it("permits explicit unknown duration preview but makes approval unavailable", async () => {
    const value = await fixture({ mode: "preview", knownMinutes: false });
    expect(value.generated.status, JSON.stringify(value.generated.reasonCodes)).toBe("generated");
    expect(value.generated.preview?.readinessStatus).toBe("preview_only_unknown_duration");
    expect(value.generated.preview?.unresolvedFacts).toContain("OWNER_SESSION_DURATION_EXPLICIT_UNKNOWN");
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

  it("locks all nine default-empty PostgreSQL owner tables", () => {
    const sql = loadControlledOwnerDeliveryMigrations().map((entry) => entry.sql).join("\n");
    expect(sql.match(/CREATE TABLE IF NOT EXISTS owner_v2_/g)).toHaveLength(9);
    expect(sql).not.toMatch(/INSERT INTO/i);
    expect(sql).not.toMatch(/email/i);
  });
});
