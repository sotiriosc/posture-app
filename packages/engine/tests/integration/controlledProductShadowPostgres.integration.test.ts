import { Pool } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { applyOutcomeSourceMigrations } from "../../src/outcomeSourcePersistence";
import {
  createControlledProductShadowPostgresRepository,
  createControlledProductShadowService,
  loadControlledProductShadowMigrations,
  replayControlledProductShadow,
  resolveControlledProductShadowRolloutPolicy,
} from "../../src/controlledProductShadow";
import {
  CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_PROFILE_V1_B1_B4,
  buildControlledProductShadowGoalRealizationMappingBundleV1,
  createControlledProductShadowGoalRealizationPostgresRepository,
  createControlledProductShadowGoalRealizationServiceV1,
  replayControlledProductShadowGoalRealizationV1,
  requiredGoalRealizationReplayVersions,
} from "../../src/controlledProductShadowGoalRealization";
import { COMPLETE_CHUNK_C_PIPELINE, exactFixtureExtensions, productGoalRealizationSnapshot } from
  "../cagt/controlledProductShadowGoalRealizationEvidence";
import {
  COMPLETE_PRODUCT_SHADOW_PIPELINE,
  PRODUCT_SHADOW_DATA_POLICY,
  PRODUCT_SHADOW_RESOURCE_POLICY,
  SHADOW_TIME,
  productShadowClientTrigger,
  productShadowSnapshot,
} from "../helpers/controlledProductShadowFixtures";

const databaseUrl = process.env.TEST_DATABASE_URL?.trim();
const describePostgres = databaseUrl ? describe : describe.skip;
const LATER_TIME = "2026-08-15T13:00:00.000-04:00";

function createService(pool: Pool, athleteId: string, pipeline = COMPLETE_PRODUCT_SHADOW_PIPELINE) {
  const repository = createControlledProductShadowPostgresRepository({ pool });
  const policy = resolveControlledProductShadowRolloutPolicy({ mode: "evaluate_internal_allowlist",
    allowlistedUserIds: athleteId, source: "explicit_test_input" });
  return { repository, service: createControlledProductShadowService({ policy,
    dataMinimizationPolicy: PRODUCT_SHADOW_DATA_POLICY, resourcePolicy: PRODUCT_SHADOW_RESOURCE_POLICY,
    repository, loadProductSnapshot: async () => productShadowSnapshot(), pipeline,
    observability: { emit: () => undefined } }) };
}

describePostgres("real PostgreSQL controlled Product shadow persistence", () => {
  let pool: Pool;

  beforeAll(async () => {
    pool = new Pool({ connectionString: databaseUrl!, max: 16 });
    await pool.query(`CREATE TABLE IF NOT EXISTS product_legacy_shadow_sentinel (
      sentinel_id TEXT PRIMARY KEY, payload JSONB NOT NULL
    )`);
    await pool.query(`INSERT INTO product_legacy_shadow_sentinel (sentinel_id, payload)
      VALUES ('legacy-product-row', '{"authority":"legacy"}'::jsonb)
      ON CONFLICT (sentinel_id) DO UPDATE SET payload = EXCLUDED.payload`);
    const migrations = loadControlledProductShadowMigrations();
    const first = await applyOutcomeSourceMigrations({ pool, migrations,
      operationTime: SHADOW_TIME });
    expect(["applied", "unchanged"]).toContain(first.status);
    expect((await applyOutcomeSourceMigrations({ pool, migrations,
      operationTime: SHADOW_TIME })).status).toBe("unchanged");
  });

  afterAll(async () => { await pool.end(); });

  it("applies nine shadow tables without altering legacy Product data", async () => {
    const count = await pool.query<{ count: string }>(`SELECT COUNT(*)::text AS count
      FROM information_schema.tables WHERE table_schema = 'public'
      AND table_name LIKE 'controlled_product_shadow_%'`);
    expect(Number(count.rows[0]?.count)).toBe(9);
    const sentinel = await pool.query<{ payload: { authority: string } }>(
      "SELECT payload FROM product_legacy_shadow_sentinel WHERE sentinel_id = 'legacy-product-row'");
    expect(sentinel.rows[0]?.payload).toEqual({ authority: "legacy" });
    const sql = loadControlledProductShadowMigrations()[0]!.sql;
    expect(sql).not.toMatch(/ALTER\s+TABLE\s+(training|program|session|exercise_log)/i);
  });

  it("persists an exact unapplied run, comparison, audit, and replay", async () => {
    const athleteId = "athlete-shadow-pg-main";
    const context = createService(pool, athleteId);
    const clientTrigger = productShadowClientTrigger({ clientOperationId: "pg-main-operation" });
    const first = await context.service.run({ clientTrigger, authenticatedUserId: athleteId,
      appSurface: "consumer", evaluationTime: SHADOW_TIME });
    const retry = await context.service.run({ clientTrigger, authenticatedUserId: athleteId,
      appSurface: "consumer", evaluationTime: SHADOW_TIME });
    expect(first.disposition).toBe("accepted");
    expect(retry).toMatchObject({ disposition: "idempotent_prior", runRevisionId: first.runRevisionId });
    const expectedRows: Readonly<Record<string, number>> = {
      controlled_product_shadow_triggers: 1, controlled_product_shadow_runs: 1,
      controlled_product_shadow_product_snapshots: 1,
      controlled_product_shadow_legacy_program_projections: 1,
      controlled_product_shadow_v2_artifact_references: 1,
      controlled_product_shadow_comparisons: 1, controlled_product_shadow_failures: 0,
      controlled_product_shadow_audit_events: 1, controlled_product_shadow_supersessions: 0,
    };
    for (const [table, expected] of Object.entries(expectedRows)) {
      const result = await pool.query<{ count: string }>(
        `SELECT COUNT(*)::text AS count FROM ${table} WHERE athlete_id = $1`, [athleteId]);
      expect(Number(result.rows[0]?.count), table).toBe(expected);
    }
    const record = await context.repository.readRun(athleteId, first.runRevisionId!);
    expect(record?.runRevision).toMatchObject({ productMutationApplied: false, applicationApplied: false,
      deliveredToUser: false, performed: false });
    expect(await context.repository.readRun("different-athlete", first.runRevisionId!)).toBeNull();
    expect(await replayControlledProductShadow({ repository: context.repository, athleteId,
      runRevisionId: first.runRevisionId!, mode: "full_shadow_run",
      availableVersions: [...record!.runRevision.adapterReferences, ...record!.runRevision.policyReferences,
        "CONTROLLED_PRODUCT_SHADOW_RUN@1.0.0"] })).toMatchObject({ status: "exact_historical_match",
      latestVersionFallbackCount: 0, productMutationCount: 0, applicationCount: 0,
      persistenceWriteCount: 0 });
  }, 120_000);

  it("reuses append-only storage for exact goal-realization Run V1.1", async () => {
    const athleteId = "athlete-shadow-pg-goal-realization";
    const repository = createControlledProductShadowGoalRealizationPostgresRepository({ pool });
    const snapshot = productGoalRealizationSnapshot();
    const service = createControlledProductShadowGoalRealizationServiceV1({
      profile: CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_PROFILE_V1_B1_B4,
      loadProductSnapshot: async () => snapshot,
      resolveActiveProgramId: (value) => value.programs?.[0]?.id ?? null,
      mappingBuilder: buildControlledProductShadowGoalRealizationMappingBundleV1,
      pipeline: COMPLETE_CHUNK_C_PIPELINE, repository,
    });
    const result = await service.run({ authenticatedUserId: athleteId, appSurface: "consumer",
      evaluationTime: SHADOW_TIME, fixtureExtensions: exactFixtureExtensions() });
    const run = await repository.read(athleteId, result.runRevisionId!);
    expect(run).toMatchObject({ runReference: { contractVersion: "1.1.0" }, counterfactualOnly: true,
      deliveredToUser: false, performed: false, productMutationApplied: false, applicationApplied: false });
    const stored = await pool.query<{ product_mutation_applied: boolean; application_applied: boolean;
      delivered_to_user: boolean; performed: boolean }>(`SELECT product_mutation_applied, application_applied,
        delivered_to_user, performed FROM controlled_product_shadow_runs
        WHERE athlete_id = $1 AND run_revision_id = $2`, [athleteId, result.runRevisionId]);
    expect(stored.rows[0]).toEqual({ product_mutation_applied: false, application_applied: false,
      delivered_to_user: false, performed: false });
    const availableVersions = requiredGoalRealizationReplayVersions(run!);
    await expect(replayControlledProductShadowGoalRealizationV1({ repository, athleteId,
      runRevisionId: run!.runRevisionId, availableVersions })).resolves.toMatchObject({
        status: "exact_version_replay_ready", latestVersionFallbackCount: 0, productMutationCount: 0,
        applicationCount: 0, performedCount: 0 });
  }, 120_000);

  it("rejects semantic conflicts, mutation, deletion, and applied records", async () => {
    const athleteId = "athlete-shadow-pg-guards";
    const context = createService(pool, athleteId);
    const trigger = productShadowClientTrigger({ clientOperationId: "pg-guard-operation" });
    const first = await context.service.run({ clientTrigger: trigger, authenticatedUserId: athleteId,
      appSurface: "gyms", evaluationTime: SHADOW_TIME });
    const conflict = await context.service.run({ clientTrigger: productShadowClientTrigger({
      clientOperationId: trigger.clientOperationId, productPatchSemanticFingerprint: "changed-semantic-input" }),
    authenticatedUserId: athleteId, appSurface: "gyms", evaluationTime: SHADOW_TIME });
    expect(conflict.disposition).toBe("conflict");
    await expect(pool.query("UPDATE controlled_product_shadow_runs SET run_status = 'shadow_failed' WHERE athlete_id = $1",
      [athleteId])).rejects.toThrow(/CONTROLLED_PRODUCT_SHADOW_APPEND_ONLY/);
    await expect(pool.query("DELETE FROM controlled_product_shadow_triggers WHERE athlete_id = $1",
      [athleteId])).rejects.toThrow(/CONTROLLED_PRODUCT_SHADOW_APPEND_ONLY/);
    const record = await context.repository.readRun(athleteId, first.runRevisionId!);
    await expect(context.repository.persistRun({ ...record!, runRevision: {
      ...record!.runRevision, productMutationApplied: true,
    } } as never)).rejects.toThrow(/APPLIED_DELIVERED_OR_PERFORMED_STATE_REJECTED/);
  });

  it("persists supersession and rolls back a partially inserted duplicate snapshot", async () => {
    const athleteId = "athlete-shadow-pg-supersession";
    const context = createService(pool, athleteId);
    const first = await context.service.run({ clientTrigger: productShadowClientTrigger({
      clientOperationId: "pg-supersession-1" }), authenticatedUserId: athleteId,
    appSurface: "consumer", evaluationTime: SHADOW_TIME });
    const second = await context.service.run({ clientTrigger: productShadowClientTrigger({
      clientOperationId: "pg-supersession-2", productPatchSemanticFingerprint: "later-patch" }),
    authenticatedUserId: athleteId, appSurface: "consumer", evaluationTime: LATER_TIME });
    expect(first.disposition).toBe("accepted");
    expect(second.disposition).toBe("accepted");
    const supersessions = await pool.query<{ count: string }>(`SELECT COUNT(*)::text AS count
      FROM controlled_product_shadow_supersessions WHERE athlete_id = $1`, [athleteId]);
    expect(Number(supersessions.rows[0]?.count)).toBe(1);
    const record = await context.repository.readRun(athleteId, second.runRevisionId!);
    const before = await pool.query<{ count: string }>(`SELECT COUNT(*)::text AS count
      FROM controlled_product_shadow_runs WHERE athlete_id = $1`, [athleteId]);
    await expect(context.repository.persistRun({ ...record!, runRevision: { ...record!.runRevision,
      runId: "rollback-probe-run", runRevisionId: "rollback-probe-revision" },
    audit: { ...record!.audit, auditEventId: "rollback-probe-audit" } } as never)).rejects.toThrow();
    const after = await pool.query<{ count: string }>(`SELECT COUNT(*)::text AS count
      FROM controlled_product_shadow_runs WHERE athlete_id = $1`, [athleteId]);
    expect(after.rows[0]?.count).toBe(before.rows[0]?.count);
  });

  it("supports explicit athlete erasure and operator-directed purge", async () => {
    const erasedAthlete = "athlete-shadow-pg-erasure";
    const erased = createService(pool, erasedAthlete);
    const erasedRun = await erased.service.run({ clientTrigger: productShadowClientTrigger({
      clientOperationId: "pg-erasure-operation" }), authenticatedUserId: erasedAthlete,
    appSurface: "consumer", evaluationTime: SHADOW_TIME });
    expect(await erased.repository.eraseByAthlete(erasedAthlete, LATER_TIME)).toBe(1);
    expect(await erased.repository.readRun(erasedAthlete, erasedRun.runRevisionId!)).toBeNull();
    const leakedAudit = await pool.query<{ count: string }>(`SELECT COUNT(*)::text AS count
      FROM controlled_product_shadow_audit_events WHERE athlete_id = $1`, [erasedAthlete]);
    expect(Number(leakedAudit.rows[0]?.count)).toBe(0);

    const purgedAthlete = "athlete-shadow-pg-purge";
    const purged = createService(pool, purgedAthlete);
    const purgedRun = await purged.service.run({ clientTrigger: productShadowClientTrigger({
      clientOperationId: "pg-purge-operation" }), authenticatedUserId: purgedAthlete,
    appSurface: "gyms", evaluationTime: SHADOW_TIME });
    expect(await purged.repository.purgeBeforeTime("2026-08-16T00:00:00.000-04:00", LATER_TIME))
      .toBeGreaterThanOrEqual(1);
    expect(await purged.repository.readRun(purgedAthlete, purgedRun.runRevisionId!)).toBeNull();
  });
});
