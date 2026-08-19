import { stableId } from "@praxis/training-engine-v2";
import type { PoolClient, QueryResult } from "pg";
import type { ControlledProductShadowAdmissionResult, ControlledProductShadowRepository,
  ControlledProductShadowResourcePolicy, ControlledProductShadowRunRecord,
  ControlledProductShadowTrigger } from "./contracts";

interface Queryable {
  readonly query: <T extends Record<string, unknown> = Record<string, unknown>>(
    text: string, values?: readonly unknown[],
  ) => Promise<QueryResult<T>>;
}
interface ShadowPool extends Queryable { readonly connect: () => Promise<PoolClient> }

async function transaction<T>(pool: ShadowPool, work: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    try {
      const value = await work(client);
      await client.query("COMMIT");
      return value;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  } finally {
    client.release();
  }
}

function assertCounterfactual(record: ControlledProductShadowRunRecord): void {
  const revision = record.runRevision;
  if (revision.productMutationApplied || revision.applicationApplied || revision.deliveredToUser || revision.performed ||
      record.pipelineResult.productMutationApplied || record.pipelineResult.applicationApplied ||
      record.comparison?.outcomeSuperiorityClaimed) {
    throw new Error("CONTROLLED_PRODUCT_SHADOW_APPLIED_DELIVERED_OR_PERFORMED_STATE_REJECTED");
  }
}

async function readRecord(queryable: Queryable, athleteId: string, where: string,
  value: string): Promise<ControlledProductShadowRunRecord | null> {
  const result = await queryable.query<{ record_payload: ControlledProductShadowRunRecord }>(
    `SELECT record_payload FROM controlled_product_shadow_runs WHERE athlete_id = $1 AND ${where} = $2`,
    [athleteId, value]);
  return result.rows[0]?.record_payload ?? null;
}

export function createControlledProductShadowPostgresRepository(input: {
  readonly pool: ShadowPool;
}): ControlledProductShadowRepository {
  const pool = input.pool;
  const repository: ControlledProductShadowRepository = {
    admitTrigger: async (trigger: ControlledProductShadowTrigger, semanticFingerprint: string,
      policy: ControlledProductShadowResourcePolicy, acceptedAt: string): Promise<ControlledProductShadowAdmissionResult> =>
      transaction(pool, async (client) => {
        await client.query("SELECT pg_advisory_xact_lock(hashtext($1), hashtext($2))",
          [trigger.athleteId, trigger.idempotencyKey]);
        const prior = await client.query<{ semantic_fingerprint: string; trigger_id: string }>(
          `SELECT semantic_fingerprint, trigger_id FROM controlled_product_shadow_triggers
           WHERE athlete_id = $1 AND idempotency_key = $2`, [trigger.athleteId, trigger.idempotencyKey]);
        if (prior.rows[0]) {
          if (prior.rows[0].semantic_fingerprint !== semanticFingerprint) {
            return Object.freeze({ state: "idempotency_conflict", prior: null });
          }
          return Object.freeze({ state: "exact_retry", prior:
            await readRecord(client, trigger.athleteId, "trigger_revision_id", trigger.triggerRevisionId) });
        }
        const accepted = await client.query<{ count: string }>(
          `SELECT COUNT(*)::text AS count FROM controlled_product_shadow_triggers
           WHERE athlete_id = $1 AND accepted_at >= $2::timestamptz - ($3::text || ' seconds')::interval`,
          [trigger.athleteId, acceptedAt, policy.windowSeconds]);
        const pending = await client.query<{ count: string }>(
          `SELECT COUNT(*)::text AS count FROM controlled_product_shadow_triggers t
           LEFT JOIN controlled_product_shadow_runs r ON r.trigger_revision_id = t.trigger_revision_id
           WHERE t.athlete_id = $1 AND r.run_revision_id IS NULL`, [trigger.athleteId]);
        if (Number(accepted.rows[0]?.count ?? 0) >= policy.acceptedTriggersPerWindow ||
            Number(pending.rows[0]?.count ?? 0) >=
              Math.min(policy.concurrentRunsPerAthlete, policy.maximumPendingRuns)) {
          return Object.freeze({ state: "resource_limit", prior: null });
        }
        await client.query(
          `INSERT INTO controlled_product_shadow_triggers (
             trigger_revision_id, trigger_id, athlete_id, app_surface, trigger_kind, idempotency_key,
             semantic_fingerprint, trigger_payload, accepted_at
           ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9)`,
          [trigger.triggerRevisionId, trigger.triggerId, trigger.athleteId, trigger.appSurface,
            trigger.triggerKind, trigger.idempotencyKey, semanticFingerprint, JSON.stringify(trigger),
            acceptedAt]);
        return Object.freeze({ state: "accepted", prior: null });
      }),
    persistRun: async (record: ControlledProductShadowRunRecord) => {
      assertCounterfactual(record);
      await transaction(pool, async (client) => {
        await client.query("SELECT pg_advisory_xact_lock(hashtext($1), hashtext($2))",
          [record.trigger.athleteId, record.trigger.idempotencyKey]);
        const trigger = await client.query<{ semantic_fingerprint: string }>(
          `SELECT semantic_fingerprint FROM controlled_product_shadow_triggers
           WHERE athlete_id = $1 AND trigger_revision_id = $2 FOR SHARE`,
          [record.trigger.athleteId, record.trigger.triggerRevisionId]);
        if (trigger.rows[0]?.semantic_fingerprint !== record.requestSemanticFingerprint) {
          throw new Error("CONTROLLED_PRODUCT_SHADOW_TRIGGER_RECHECK_FAILED");
        }
        const duplicate = await client.query<{ exists: boolean }>(
          "SELECT EXISTS (SELECT 1 FROM controlled_product_shadow_runs WHERE athlete_id = $1 AND run_id = $2) AS exists",
          [record.trigger.athleteId, record.runRevision.runId]);
        if (duplicate.rows[0]?.exists) return;
        await client.query(
          `INSERT INTO controlled_product_shadow_runs (
             run_revision_id, run_id, based_on_run_revision_id, trigger_revision_id, athlete_id,
             anchor_program_id, run_type, run_status, product_snapshot_revision_id, mapping_payload,
             resource_trace, record_payload, evaluation_time, product_mutation_applied,
             application_applied, delivered_to_user, performed
           ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb,$11::jsonb,$12::jsonb,$13,FALSE,FALSE,FALSE,FALSE)`,
          [record.runRevision.runRevisionId, record.runRevision.runId, record.runRevision.basedOnRunRevisionId,
            record.trigger.triggerRevisionId, record.trigger.athleteId, record.trigger.anchorProgramId,
            record.runRevision.runType, record.runRevision.status, record.source.sourceSnapshotRevisionId,
            JSON.stringify(record.mappings), JSON.stringify(record.resourceTrace), JSON.stringify(record),
            record.runRevision.evaluationTime]);
        await client.query(
          `INSERT INTO controlled_product_shadow_product_snapshots (
             source_snapshot_revision_id, run_revision_id, athlete_id, product_state_revision_fingerprint,
             structured_reference_payload, evaluation_time
           ) VALUES ($1,$2,$3,$4,$5::jsonb,$6)`,
          [record.source.sourceSnapshotRevisionId, record.runRevision.runRevisionId, record.trigger.athleteId,
            record.productSnapshotReference.productStateRevisionFingerprint,
            JSON.stringify(record.productSnapshotReference), record.runRevision.evaluationTime]);
        if (record.legacyProjection) await client.query(
          `INSERT INTO controlled_product_shadow_legacy_program_projections (
             projection_record_id, run_revision_id, athlete_id, program_id, program_revision_id,
             projection_payload, candidate_authority, prescription_authority, performance_authority
           ) VALUES ($1,$2,$3,$4,$5,$6::jsonb,FALSE,FALSE,FALSE)`,
          [stableId("controlled-product-shadow-legacy-projection-record", record.runRevision.runRevisionId),
            record.runRevision.runRevisionId, record.trigger.athleteId, record.legacyProjection.programId,
            record.legacyProjection.programRevisionId, JSON.stringify(record.legacyProjection)]);
        for (const artifact of record.pipelineResult.artifactReferences) await client.query(
          `INSERT INTO controlled_product_shadow_v2_artifact_references (
             artifact_record_id, run_revision_id, athlete_id, artifact_type, artifact_id,
             artifact_revision_id, contract_id, contract_version, counterfactual_only
           ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,TRUE)`,
          [stableId("controlled-product-shadow-artifact-record", { run: record.runRevision.runRevisionId,
            artifact: artifact.artifactRevisionId }), record.runRevision.runRevisionId, record.trigger.athleteId,
            artifact.artifactType, artifact.artifactId, artifact.artifactRevisionId, artifact.contractId,
            artifact.contractVersion]);
        if (record.comparison) await client.query(
          `INSERT INTO controlled_product_shadow_comparisons (
             comparison_revision_id, comparison_id, run_revision_id, athlete_id, difference_class,
             first_meaningful_difference, comparison_payload, weighted_better_score, outcome_superiority_claimed
           ) VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,NULL,FALSE)`,
          [record.comparison.comparisonRevisionId, record.comparison.comparisonId,
            record.runRevision.runRevisionId, record.trigger.athleteId, record.comparison.differenceClass,
            record.comparison.firstMeaningfulDifference, JSON.stringify(record.comparison)]);
        if (record.failureCodes.length) await client.query(
          `INSERT INTO controlled_product_shadow_failures (
             failure_record_id, run_revision_id, athlete_id, failure_codes, failure_payload, operation_time
           ) VALUES ($1,$2,$3,$4,$5::jsonb,$6)`,
          [stableId("controlled-product-shadow-failure", record.runRevision.runRevisionId),
            record.runRevision.runRevisionId, record.trigger.athleteId, record.failureCodes,
            JSON.stringify({ status: record.runRevision.status }), record.runRevision.evaluationTime]);
        await client.query(
          `INSERT INTO controlled_product_shadow_audit_events (
             audit_event_id, athlete_id, trigger_revision_id, run_revision_id, operation,
             result_state, operation_time, audit_payload
           ) VALUES ($1,$2,$3,$4,'controlled_shadow_run',$5,$6,$7::jsonb)`,
          [record.audit.auditEventId, record.trigger.athleteId, record.trigger.triggerRevisionId,
            record.runRevision.runRevisionId, record.audit.resultState, record.audit.operationTime,
            JSON.stringify(record.audit)]);
        if (record.runRevision.basedOnRunRevisionId) await client.query(
          `INSERT INTO controlled_product_shadow_supersessions (
             supersession_id, athlete_id, prior_run_revision_id, superseding_run_revision_id,
             reason_code, operation_time
           ) VALUES ($1,$2,$3,$4,'LATER_PRODUCT_SNAPSHOT_REVISION',$5)`,
          [stableId("controlled-product-shadow-supersession", { prior: record.runRevision.basedOnRunRevisionId,
            next: record.runRevision.runRevisionId }), record.trigger.athleteId,
            record.runRevision.basedOnRunRevisionId, record.runRevision.runRevisionId,
            record.runRevision.evaluationTime]);
      });
    },
    readRun: (athleteId, runRevisionId) => readRecord(pool, athleteId, "run_revision_id", runRevisionId),
    readByTrigger: async (athleteId, triggerId) => {
      const result = await pool.query<{ record_payload: ControlledProductShadowRunRecord }>(
        `SELECT r.record_payload FROM controlled_product_shadow_runs r
         JOIN controlled_product_shadow_triggers t ON t.trigger_revision_id = r.trigger_revision_id
         WHERE r.athlete_id = $1 AND t.athlete_id = $1 AND t.trigger_id = $2
         ORDER BY r.evaluation_time DESC LIMIT 1`, [athleteId, triggerId]);
      return result.rows[0]?.record_payload ?? null;
    },
    findLatestRun: async (athleteId, anchorProgramId) => {
      const result = await pool.query<{ record_payload: ControlledProductShadowRunRecord }>(
        `SELECT record_payload FROM controlled_product_shadow_runs
         WHERE athlete_id = $1 AND anchor_program_id IS NOT DISTINCT FROM $2
         ORDER BY evaluation_time DESC, run_revision_id DESC LIMIT 1`, [athleteId, anchorProgramId]);
      return result.rows[0]?.record_payload ?? null;
    },
    eraseByAthlete: (athleteId, operationTime) => transaction(pool, async (client) => {
      await client.query("SET LOCAL praxis.controlled_shadow_erasure_authorized = 'on'");
      await client.query("DELETE FROM controlled_product_shadow_audit_events WHERE athlete_id = $1", [athleteId]);
      const result = await client.query("DELETE FROM controlled_product_shadow_triggers WHERE athlete_id = $1",
        [athleteId]);
      await client.query(
        `INSERT INTO controlled_product_shadow_audit_events (
           audit_event_id, athlete_id, operation, result_state, operation_time, audit_payload
         ) VALUES ($1,'erased','athlete_erasure','completed',$2,$3::jsonb)`,
        [stableId("controlled-product-shadow-erasure-audit", { athleteId, operationTime }), operationTime,
          JSON.stringify({ erasedRecordCount: result.rowCount ?? 0, originalAthleteIdPersisted: false })]);
      return result.rowCount ?? 0;
    }),
    purgeBeforeTime: (cutoff, operationTime) => transaction(pool, async (client) => {
      await client.query("SET LOCAL praxis.controlled_shadow_erasure_authorized = 'on'");
      await client.query(
        `DELETE FROM controlled_product_shadow_audit_events
         WHERE run_revision_id IN (
           SELECT r.run_revision_id FROM controlled_product_shadow_runs r
           JOIN controlled_product_shadow_triggers t ON t.trigger_revision_id = r.trigger_revision_id
           WHERE t.accepted_at < $1
         )`, [cutoff]);
      const result = await client.query(
        "DELETE FROM controlled_product_shadow_triggers WHERE accepted_at < $1", [cutoff]);
      await client.query(
        `INSERT INTO controlled_product_shadow_audit_events (
           audit_event_id, athlete_id, operation, result_state, operation_time, audit_payload
         ) VALUES ($1,'purged','purge_before_time','completed',$2,$3::jsonb)`,
        [stableId("controlled-product-shadow-purge-audit", { cutoff, operationTime }), operationTime,
          JSON.stringify({ cutoff, purgedRecordCount: result.rowCount ?? 0 })]);
      return result.rowCount ?? 0;
    }),
  };
  return Object.freeze(repository);
}
