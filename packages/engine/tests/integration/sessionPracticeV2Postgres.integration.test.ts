import { Pool } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  createSessionPracticeAttemptLifecycle,
  realizeSessionPractice,
  selectSessionPracticeMode,
} from "@praxis/training-engine-v2";
import { makeSessionPracticeContext } from "../../../training-engine-v2/tests/helpers/sessionPracticeFixtures";
import { applyOutcomeSourceMigrations, loadOutcomeSourceMigrations } from "../../src/outcomeSourcePersistence";
import {
  buildPersistedSessionPracticeRevision,
  buildSessionPracticeV2Draft,
  createSessionPracticePostgresRepository,
  loadSessionPracticeV2Migrations,
  replayExactSessionPracticeRevision,
} from "../../src/sessionPracticeV2";

const databaseUrl = process.env.TEST_DATABASE_URL?.trim();
const describePostgres = databaseUrl ? describe : describe.skip;
const TIME = "2026-08-16T12:00:00.000Z";

function revisionFixture() {
  const context = makeSessionPracticeContext("lighter", { sourceRevision: "postgres-session-rev-1" });
  const plan = realizeSessionPractice(context);
  const initial = createSessionPracticeAttemptLifecycle({ attemptId: plan.attemptId,
    sourceSessionRevisionId: plan.sourceSessionRevisionId });
  const selected = selectSessionPracticeMode({ lifecycle: initial, request: context.request,
    basedOnRevisionId: null, finalForExecution: true });
  if (selected.status !== "selected") throw new Error("fixture selection failed");
  const draft = buildSessionPracticeV2Draft({ plan, lifecycle: selected.lifecycle,
    currentPosition: { exerciseIndex: 0, blockIndex: 0, setIndex: 0 }, actualPerformanceState: {},
    timers: [], substitutionReferences: [], updatedAt: TIME });
  return buildPersistedSessionPracticeRevision({ basedOnPersistenceRevisionId: null,
    athleteId: context.source.intent.athleteId, lifecycle: selected.lifecycle, request: context.request,
    plan, completion: null, outcomeLink: null, draft, sourceFingerprint: context.source.sourceSessionFingerprint,
    planFingerprint: "postgres-plan-fingerprint-1", createdAt: TIME, evaluationTime: TIME });
}

describePostgres("real PostgreSQL 16 V2 Session Practice persistence", () => {
  let pool: Pool;
  beforeAll(async () => {
    pool = new Pool({ connectionString: databaseUrl!, max: 6 });
    await applyOutcomeSourceMigrations({ pool, migrations: loadOutcomeSourceMigrations(), operationTime: TIME });
    await applyOutcomeSourceMigrations({ pool, migrations: loadSessionPracticeV2Migrations(), operationTime: TIME });
  });
  afterAll(async () => { await pool.end(); });

  it("appends and exactly replays one isolated unapplied revision", async () => {
    const repository = createSessionPracticePostgresRepository({ queryable: pool });
    const revision = revisionFixture();
    const appended = await repository.appendRevision(revision);
    expect(["appended", "exact_retry"]).toContain(appended.status);
    expect(await repository.appendRevision(revision)).toMatchObject({ status: "exact_retry",
      mutationCount: 0, productWriteCount: 0 });
    const replay = await replayExactSessionPracticeRevision({ repository, athleteId: revision.athleteId,
      attemptId: revision.attemptId, persistenceRevisionId: revision.persistenceRevisionId,
      expectedContractVersion: "1.0.0" });
    expect(replay).toMatchObject({ status: "replayed_exact_version", latestFallbackApplied: false,
      productWriteApplied: false });
    const stored = await pool.query<{ current_product_write_applied: boolean; product_activation_applied: boolean }>(
      `SELECT current_product_write_applied, product_activation_applied
         FROM session_practice_v2_attempt_revisions
        WHERE persistence_revision_id = $1`, [revision.persistenceRevisionId]);
    expect(stored.rows[0]).toEqual({ current_product_write_applied: false, product_activation_applied: false });
  }, 120_000);

  it("enforces append-only storage and athlete-scoped exact reads", async () => {
    const repository = createSessionPracticePostgresRepository({ queryable: pool });
    const revision = revisionFixture();
    await repository.appendRevision(revision);
    expect(await repository.readExactRevision("different-athlete", revision.attemptId,
      revision.persistenceRevisionId)).toBeNull();
    await expect(pool.query(
      "UPDATE session_practice_v2_attempt_revisions SET plan_fingerprint = 'changed' WHERE persistence_revision_id = $1",
      [revision.persistenceRevisionId])).rejects.toThrow(/SESSION_PRACTICE_V2_REVISIONS_APPEND_ONLY/);
    await expect(pool.query(
      "DELETE FROM session_practice_v2_attempt_revisions WHERE persistence_revision_id = $1",
      [revision.persistenceRevisionId])).rejects.toThrow(/SESSION_PRACTICE_V2_REVISIONS_APPEND_ONLY/);
  }, 120_000);
});
