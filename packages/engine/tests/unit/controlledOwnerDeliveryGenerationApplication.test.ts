import { describe, expect, it } from "vitest";
import {
  buildOwnerEnrollmentRevision,
  buildOwnerProfileRevision,
  CONTROLLED_OWNER_PRODUCTION_POLICY_VERSIONS,
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
  reviseControlledOwnerSessionMode,
  startControlledOwnerSession,
  type ControlledOwnerRequestGateResult,
} from "../../src/controlledOwnerDelivery";
import { createInMemorySessionPracticePersistenceRepository } from "../../src/sessionPracticeV2";

const NOW = "2026-08-17T14:00:00.000Z";
const USER_ID = "synthetic-owner-application-user";
const gate = (mode: "preview" | "apply"): ControlledOwnerRequestGateResult => Object.freeze({
  allowed: true, mode, userId: USER_ID, reasonCode: "OWNER_ELIGIBLE", sessionReadCount: 1,
  databaseWriteCount: 0,
});

async function fixture(input: { readonly mode: "preview" | "apply"; readonly knownMinutes: boolean }) {
  const enrollmentProfiles = createInMemoryOwnerEnrollmentProfileRepository();
  const delivery = createInMemoryOwnerDeliveryRepository();
  const enrollment = buildOwnerEnrollmentRevision({ userId: USER_ID, basedOnRevisionId: null,
    state: "active", fixedGoal: "strength", permission: input.mode === "apply" ? "apply_allowed" : "preview_only",
    explicitConsent: true, acceptedVersions: ["controlled-owner-delivery@1.0.0"],
    provenance: { source: "owner_confirmation", sourceRefs: ["synthetic-consent"] }, createdAt: NOW });
  await enrollmentProfiles.appendEnrollment(enrollment);
  const profile = buildOwnerProfileRevision({ userId: USER_ID, basedOnRevisionId: null,
    primaryGoal: "strength", trainingMode: "develop", secondaryGoal: null, daysPerWeek: 1,
    sessionOpportunities: [{ opportunityId: "owner-opportunity-1", order: 1,
      minutes: input.knownMinutes ? 45 : null }],
    sessionMinutes: input.knownMinutes ? { status: "known", minutes: 45 } :
      { status: "explicit_unknown", minutes: null },
    equipmentCapabilitySnapshot: { environment: "commercial_gym",
      capabilityIds: ["commercial_gym", "dumbbells", "adjustable_bench"], confirmed: true,
      sourceRevision: "owner-equipment:synthetic-1" }, coarseExperience: "beginner", familiarity: [],
    painContext: { regionIds: [], limitationIds: [], confirmed: true, diagnosticClaimCount: 0 },
    assessmentReferences: [], trainingSafety: "clear", continuityReferences: [], evaluationTime: NOW,
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
    productImport: { loadProposedFacts: async () => [] },
    loadSourceContext: async () => ({ sourceProductSnapshotId: "product-snapshot:synthetic-1",
      sourceProductRevisionId: context.currentProductRevisionId,
      activeLegacyProgramRevisionId: context.currentLegacyProgramRevisionId }) });
  return { generated, enrollmentProfiles, delivery, profile, context };
}

describe("controlled owner genuine generation and application", () => {
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
      readinessStatus: "ready_for_approval" });
    expect(JSON.stringify(value.generated.preview)).not.toContain("owner@example");
  });

  it("permits explicit unknown duration preview but makes approval unavailable", async () => {
    const value = await fixture({ mode: "preview", knownMinutes: false });
    expect(value.generated.status, JSON.stringify(value.generated.reasonCodes)).toBe("generated");
    expect(value.generated.preview?.readinessStatus).toBe("preview_only_unknown_duration");
    expect(value.generated.preview?.unresolvedFacts).toContain("OWNER_SESSION_DURATION_EXPLICIT_UNKNOWN");
  });

  it("keeps approval separate, then atomically creates envelope, application, pointer, and audit", async () => {
    const value = await fixture({ mode: "apply", knownMinutes: true });
    const preview = value.generated.preview!;
    const approved = await approveControlledOwnerGetStrongerPreview({ previewId: preview.previewId,
      previewFingerprint: preview.previewFingerprint, explicitConfirmation: true, csrfVerified: true,
      idempotencyKey: "approve-key-1", approvedAt: NOW, gate: async () => gate("apply"),
      enrollmentProfiles: value.enrollmentProfiles, delivery: value.delivery,
      loadCurrentContext: async () => value.context });
    expect(approved.status).toBe("approved");
    expect(approved.applicationCount).toBe(0);
    expect(await value.delivery.readActivePointer(USER_ID)).toBeNull();
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
    const preview = value.generated.preview!;
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
    const preview = value.generated.preview!;
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
      repository: practice, delivery: value.delivery });
    expect(completed.status).toBe("completed");
    expect(completed.revision).toMatchObject({ lifecycle: { state: "completed" },
      completion: { status: "full_completed_as_prescribed", automaticReallocationApplied: false,
        adaptationActionApplied: false }, outcomeLink: { omittedAssignmentPerformanceCount: 0,
        selectedModeTreatedAsPerformance: false } });
    expect(await practice.listAthleteCurrentRevisions(USER_ID)).toHaveLength(1);
  });

  it("locks all nine default-empty PostgreSQL owner tables", () => {
    const sql = loadControlledOwnerDeliveryMigrations().map((entry) => entry.sql).join("\n");
    expect(sql.match(/CREATE TABLE IF NOT EXISTS owner_v2_/g)).toHaveLength(9);
    expect(sql).not.toMatch(/INSERT INTO/i);
    expect(sql).not.toMatch(/email/i);
  });
});
