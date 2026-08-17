import { Pool } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  CONTROLLED_OWNER_PRODUCTION_POLICY_VERSIONS,
  buildOwnerEnrollmentRevision,
  buildOwnerProfileRevision,
} from "@praxis/training-engine-v2";
import {
  applyControlledOwnerGetStrongerApproval,
  approveControlledOwnerGetStrongerPreview,
  completeControlledOwnerSession,
  createOwnerDeliveryPostgresRepository,
  createOwnerEnrollmentProfilePostgresRepository,
  generateControlledOwnerGetStrongerPreview,
  loadControlledOwnerDeliveryMigrations,
  recordControlledOwnerSessionDraft,
  rollbackControlledOwnerProgram,
  startControlledOwnerSession,
  type ControlledOwnerRequestGateResult,
} from "../../src/controlledOwnerDelivery";
import { applyOutcomeSourceMigrations, createOutcomeSourcePostgresRepository,
  loadOutcomeSourceMigrations } from "../../src/outcomeSourcePersistence";
import { createSessionPracticePostgresRepository, loadSessionPracticeV2Migrations } from
  "../../src/sessionPracticeV2";

const databaseUrl = process.env.TEST_DATABASE_URL?.trim();
const describePostgres = databaseUrl ? describe : describe.skip;
const NOW = "2026-08-17T18:00:00.000Z";
const USER_ID = `synthetic-owner-pg-${process.pid}`;
const OTHER_USER_ID = `${USER_ID}-other`;

const gate = (): ControlledOwnerRequestGateResult => Object.freeze({ allowed: true, mode: "apply",
  userId: USER_ID, reasonCode: "OWNER_ELIGIBLE", sessionReadCount: 1, databaseWriteCount: 0 });

describePostgres("controlled owner delivery PostgreSQL 16", () => {
  let pool: Pool;
  beforeAll(async () => {
    pool = new Pool({ connectionString: databaseUrl!, max: 8 });
    for (const migration of loadControlledOwnerDeliveryMigrations()) await pool.query(migration.sql);
    for (const migration of loadSessionPracticeV2Migrations()) await pool.query(migration.sql);
    await applyOutcomeSourceMigrations({ pool, migrations: loadOutcomeSourceMigrations(), operationTime: NOW });
  });
  afterAll(async () => { await pool.end(); });

  it("persists exact owner lineage, completion outcome, replay, isolation, rollback, and conflicts", async () => {
    const enrollmentProfiles = createOwnerEnrollmentProfilePostgresRepository({ queryable: pool });
    const delivery = createOwnerDeliveryPostgresRepository({ queryable: pool });
    const enrollment = buildOwnerEnrollmentRevision({ userId: USER_ID, basedOnRevisionId: null,
      state: "active", fixedGoal: "strength", permission: "apply_allowed", explicitConsent: true,
      acceptedVersions: ["controlled-owner-delivery@1.0.0"],
      provenance: { source: "owner_confirmation", sourceRefs: ["synthetic-pg-consent"] }, createdAt: NOW });
    expect(await enrollmentProfiles.appendEnrollment(enrollment)).toBe("appended");
    expect(await enrollmentProfiles.appendEnrollment(enrollment)).toBe("exact_retry");
    const profile = buildOwnerProfileRevision({ userId: USER_ID, basedOnRevisionId: null,
      primaryGoal: "strength", trainingMode: "develop", secondaryGoal: null, daysPerWeek: 1,
      sessionOpportunities: [{ opportunityId: "pg-opportunity-1", order: 1, minutes: 45 }],
      sessionMinutes: { status: "known", minutes: 45 }, equipmentCapabilitySnapshot: {
        environment: "commercial_gym", capabilityIds: ["commercial_gym", "dumbbells", "adjustable_bench"],
        confirmed: true, sourceRevision: "pg-equipment-1" }, coarseExperience: "beginner", familiarity: [],
      painContext: { regionIds: [], limitationIds: [], confirmed: true, diagnosticClaimCount: 0 },
      assessmentReferences: [], trainingSafety: "clear", continuityReferences: [], evaluationTime: NOW,
      provenance: { source: "owner_confirmation", sourceRefs: ["synthetic-pg-profile"] },
      reviewState: "confirmed", createdAt: NOW });
    expect(await enrollmentProfiles.appendProfile(profile)).toBe("appended");
    const context = { currentProductRevisionId: "pg-product-revision-1",
      currentLegacyProgramRevisionId: "pg-legacy-program-1",
      currentEquipmentSourceRevision: profile.equipmentCapabilitySnapshot.sourceRevision,
      currentSafetyState: "clear" as const, currentEngineVersion: "training-engine-v2@owner-1.0.0",
      currentPolicyVersions: CONTROLLED_OWNER_PRODUCTION_POLICY_VERSIONS,
      activeLegacySession: false, activeV2Session: false };
    const generated = await generateControlledOwnerGetStrongerPreview({ requestedAt: NOW, evaluationTime: NOW,
      engineVersion: context.currentEngineVersion, policyVersions: context.currentPolicyVersions,
      idempotencyKey: `pg-preview-${process.pid}`, gate: async () => gate(), enrollmentProfiles, delivery,
      productImport: { loadProposedFacts: async () => [] }, loadSourceContext: async () => ({
        sourceProductSnapshotId: `pg-product-snapshot-${process.pid}`,
        sourceProductRevisionId: context.currentProductRevisionId,
        activeLegacyProgramRevisionId: context.currentLegacyProgramRevisionId }) });
    expect(generated.status).toBe("generated");
    const preview = generated.preview!;
    const approved = await approveControlledOwnerGetStrongerPreview({ previewId: preview.previewId,
      previewFingerprint: preview.previewFingerprint, explicitConfirmation: true, csrfVerified: true,
      idempotencyKey: `pg-approve-${process.pid}`, approvedAt: NOW, gate: async () => gate(),
      enrollmentProfiles, delivery, loadCurrentContext: async () => context });
    expect(approved.status).toBe("approved");
    const applicationClient = await pool.connect();
    const applied = await applyControlledOwnerGetStrongerApproval({ approvalId: approved.approval!.approvalId,
      idempotencyKey: `pg-apply-${process.pid}`, csrfVerified: true, appliedAt: NOW,
      gate: async () => gate(), enrollmentProfiles,
      delivery: createOwnerDeliveryPostgresRepository({ queryable: applicationClient }),
      loadCurrentContext: async () => context }).finally(() => applicationClient.release());
    expect(applied.status).toBe("applied");
    expect(await delivery.readPreviewExact(OTHER_USER_ID, preview.previewId)).toBeNull();
    expect(await delivery.readApplicationExact(OTHER_USER_ID, applied.application!.applicationId)).toBeNull();

    const practice = createSessionPracticePostgresRepository({ queryable: pool });
    const sessionId = applied.envelope!.productProjection.sessions[0]!.sessionId;
    const started = await startControlledOwnerSession({ userId: USER_ID, envelope: applied.envelope!, sessionId,
      mode: "full", startedAt: NOW, repository: practice });
    const initial = started.revision!;
    const retained = initial.plan.assignments.filter((entry) => entry.state !== "omitted");
    const performed = retained.map((entry) => entry.sourceExposureEventId);
    const blocks = retained.flatMap((entry) => entry.retainedBlockIds);
    const recorded = await recordControlledOwnerSessionDraft({ userId: USER_ID, attemptId: initial.attemptId,
      basedOnPersistenceRevisionId: initial.persistenceRevisionId,
      currentPosition: { exerciseIndex: 0, blockIndex: 0, setIndex: 1 },
      actualPerformanceState: Object.fromEntries(performed.map((eventId) => [eventId, { completed: true }])),
      timers: [], executionStarted: true, recordedAt: "2026-08-17T18:01:00.000Z", repository: practice });

    const client = await pool.connect();
    let completed;
    try {
      await client.query("BEGIN");
      completed = await completeControlledOwnerSession({ userId: USER_ID, attemptId: initial.attemptId,
        basedOnPersistenceRevisionId: recorded.revision!.persistenceRevisionId, envelope: applied.envelope!,
        performedSourceEventIds: performed, completedBlockIds: blocks, partiallyCompletedBlockIds: [],
        completedAt: "2026-08-17T18:02:00.000Z", idempotencyKey: `pg-complete-${process.pid}`,
        repository: createSessionPracticePostgresRepository({ queryable: client }),
        delivery: createOwnerDeliveryPostgresRepository({ queryable: client }),
        outcomeRepository: createOutcomeSourcePostgresRepository({ pool, transactionClient: client }) });
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
    expect(completed.status).toBe("completed");
    expect(completed.outcome?.longitudinalObservation).toMatchObject({ observationOnly: true,
      automaticProgressionApplied: false });
    expect(await practice.readAttemptRevisions(OTHER_USER_ID, initial.attemptId)).toEqual([]);
    const replay = await completeControlledOwnerSession({ userId: USER_ID, attemptId: initial.attemptId,
      basedOnPersistenceRevisionId: recorded.revision!.persistenceRevisionId, envelope: applied.envelope!,
      performedSourceEventIds: performed, completedBlockIds: blocks, partiallyCompletedBlockIds: [],
      completedAt: "2026-08-17T18:02:00.000Z", idempotencyKey: `pg-complete-${process.pid}`,
      repository: practice, delivery });
    expect(replay.status).toBe("exact_retry");

    const pointer = await delivery.readActivePointer(USER_ID);
    const rollbackClient = await pool.connect();
    const rollback = await rollbackControlledOwnerProgram({ gate: gate(),
      repository: createOwnerDeliveryPostgresRepository({ queryable: rollbackClient }),
      applicationId: applied.application!.applicationId, expectedPointerRevision: pointer!.revision,
      explicitConfirmation: true, csrfVerified: true, idempotencyKey: `pg-rollback-${process.pid}`,
      rolledBackAt: "2026-08-17T18:03:00.000Z" }).finally(() => rollbackClient.release());
    expect(rollback).toMatchObject({ status: "rolled_back", pointer: { mode: "legacy", revision: 2 },
      auditEvent: { metadata: { deletionCount: 0, preservedV2Records: true } } });
    expect((await delivery.listApplications(USER_ID))).toHaveLength(1);
    expect(await delivery.readEnvelopeExact(USER_ID, applied.envelope!.envelopeId,
      applied.envelope!.envelopeRevisionId)).not.toBeNull();
    const conflict = await rollbackControlledOwnerProgram({ gate: gate(), repository: delivery,
      applicationId: applied.application!.applicationId, expectedPointerRevision: 1,
      explicitConfirmation: true, csrfVerified: true, idempotencyKey: `pg-rollback-conflict-${process.pid}`,
      rolledBackAt: "2026-08-17T18:04:00.000Z" });
    expect(conflict.status).toBe("conflict");
    expect((await pool.query<{ count: string }>(`SELECT COUNT(*)::text AS count
      FROM information_schema.tables WHERE table_schema='public' AND table_name LIKE 'owner_v2_%'`))
      .rows[0]?.count).toBe("9");
  }, 120_000);
});
