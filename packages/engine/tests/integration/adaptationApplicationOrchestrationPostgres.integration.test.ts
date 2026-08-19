import { Pool } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { orchestrationDependencies, orchestrationInput } from
  "../../../training-engine-v2/tests/helpers/applicationOrchestrationFixtures";
import { applyOutcomeSourceMigrations, loadOutcomeSourceMigrations } from "../../src/outcomeSourcePersistence";
import {
  createAdaptationApplicationOrchestrationPostgresRepository,
  createAdaptationApplicationOrchestrationService,
  loadAdaptationApplicationOrchestrationMigrations,
  NOOP_ADAPTATION_APPLICATION_ORCHESTRATION_OBSERVABILITY,
  replayAdaptationApplicationOrchestration,
} from "../../src/adaptationApplicationOrchestration";

const databaseUrl = process.env.TEST_DATABASE_URL?.trim();
const describePostgres = databaseUrl ? describe : describe.skip;

describePostgres("real PostgreSQL adaptation application orchestration", () => {
  let pool: Pool;
  beforeAll(async () => {
    pool = new Pool({ connectionString: databaseUrl!, max: 12 });
    await applyOutcomeSourceMigrations({ pool, migrations: loadOutcomeSourceMigrations(),
      operationTime: "2026-08-15T12:00:00.000-04:00" });
    await applyOutcomeSourceMigrations({ pool, migrations: loadAdaptationApplicationOrchestrationMigrations(),
      operationTime: "2026-08-15T12:00:00.000-04:00" });
  });
  afterAll(async () => { await pool.end(); });

  it("persists one complete append-only shadow transaction under concurrent exact retry", async () => {
    const repository = createAdaptationApplicationOrchestrationPostgresRepository({ pool });
    const service = createAdaptationApplicationOrchestrationService({ repository,
      pureDependencies: orchestrationDependencies(),
      observability: NOOP_ADAPTATION_APPLICATION_ORCHESTRATION_OBSERVABILITY,
      recheckCurrentRevisions: async () => true });
    const input = orchestrationInput("keep_current", "build_and_persist_shadow_result");
    const results = await Promise.all([
      service.orchestrateAdaptationApplication(input), service.orchestrateAdaptationApplication(input),
    ]);
    expect(results.map((result) => result.status).sort()).toEqual([
      "idempotent_prior_result", "no_change_shadow_validated",
    ]);
    for (const table of ["adaptation_application_orchestration_runs",
      "adaptation_application_precondition_snapshots", "adaptation_application_owner_results",
      "adaptation_application_shadow_candidates", "adaptation_application_validation_results",
      "adaptation_application_orchestration_attempts"]) {
      const count = await pool.query<{ count: string }>(
        `SELECT COUNT(*)::text AS count FROM ${table} WHERE athlete_id = $1`, [input.request.athleteId]);
      expect(Number(count.rows[0]?.count)).toBe(1);
    }
    const applied = await pool.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM adaptation_application_orchestration_runs
       WHERE athlete_id = $1 AND (application_applied OR product_mutation_applied)`, [input.request.athleteId]);
    expect(Number(applied.rows[0]?.count)).toBe(0);
    await expect(pool.query(
      "UPDATE adaptation_application_orchestration_runs SET orchestration_status = 'failed' WHERE athlete_id = $1",
      [input.request.athleteId])).rejects.toThrow(/OUTCOME_SOURCE_APPEND_ONLY_MUTATION_REJECTED/);
    await expect(pool.query(
      `INSERT INTO adaptation_application_orchestration_runs (
        orchestration_revision_id, orchestration_id, orchestration_attempt_id, request_id, request_revision_id,
        athlete_id, principal_id, directive_id, directive_revision_id, decision_id, decision_revision_id,
        target_id, rightful_owner, owner_port_reference, policy_references, idempotency_key,
        request_semantic_fingerprint, orchestration_status, persistence_state, expected_current_revisions,
        request_payload, orchestration_payload, operation_time, application_applied, product_mutation_applied, provenance
       ) VALUES ('applied-revision','applied-id','applied-attempt','applied-request','applied-request-revision',
        'athlete-applied','principal','directive','directive-revision','decision','decision-revision','target',
        'product_application','{}'::jsonb,'[]'::jsonb,'applied-key','fingerprint','shadow_candidate_validated',
        'persisted','{}'::jsonb,'{}'::jsonb,'{}'::jsonb,NOW(),TRUE,FALSE,'[]'::jsonb)`))
      .rejects.toThrow();
    const persisted = results.find((result) => result.status === "no_change_shadow_validated")!;
    expect(await repository.readOrchestrationRun("different-athlete",
      persisted.orchestrationRevision.orchestrationRevisionId)).toBeNull();
    const replay = await replayAdaptationApplicationOrchestration({ repository, athleteId: input.request.athleteId,
      orchestrationRevisionId: persisted.orchestrationRevision.orchestrationRevisionId,
      mode: "full_orchestration_compare", availableOwnerPortReferences: [input.request.ownerPortReference] });
    expect(replay).toMatchObject({ status: "exact_historical_match", applicationCount: 0,
      persistenceWriteCount: 0 });
  }, 120_000);

  it("rolls back all records when the current revision recheck turns stale", async () => {
    const repository = createAdaptationApplicationOrchestrationPostgresRepository({ pool });
    const service = createAdaptationApplicationOrchestrationService({ repository,
      pureDependencies: orchestrationDependencies(),
      observability: NOOP_ADAPTATION_APPLICATION_ORCHESTRATION_OBSERVABILITY,
      recheckCurrentRevisions: async () => false });
    const input = orchestrationInput("repeat_for_confirmation", "build_and_persist_shadow_result");
    await expect(service.orchestrateAdaptationApplication(input)).rejects.toMatchObject({
      code: "stale_before_persistence" });
    const count = await pool.query<{ count: string }>(
      "SELECT COUNT(*)::text AS count FROM adaptation_application_orchestration_runs WHERE request_revision_id = $1",
      [input.request.requestRevisionId]);
    expect(Number(count.rows[0]?.count)).toBe(0);
  });
});
