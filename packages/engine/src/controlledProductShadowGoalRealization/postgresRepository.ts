import { stableId, type ControlledProductShadowRunV1_1 } from "@praxis/training-engine-v2";
import type { PoolClient, QueryResult } from "pg";
import type { ControlledProductShadowGoalRealizationRepository } from "./contracts";

interface Queryable {
  readonly query: <T extends Record<string, unknown> = Record<string, unknown>>(
    text: string, values?: readonly unknown[],
  ) => Promise<QueryResult<T>>;
}

interface ShadowPool extends Queryable {
  readonly connect: () => Promise<PoolClient>;
}

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

function assertCounterfactual(run: ControlledProductShadowRunV1_1): void {
  if (!run.counterfactualOnly || run.deliveredToUser || run.performed || run.productMutationApplied ||
      run.applicationApplied || run.comparison?.outcomeSuperiorityClaimed ||
      run.comparison?.weightedBetterScore !== null) {
    throw new Error("CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_APPLIED_STATE_REJECTED");
  }
}

export function createControlledProductShadowGoalRealizationPostgresRepository(input: {
  readonly pool: ShadowPool;
}): ControlledProductShadowGoalRealizationRepository {
  const pool = input.pool;
  return Object.freeze({
    append: async (run: ControlledProductShadowRunV1_1) => {
      assertCounterfactual(run);
      await transaction(pool, async (client) => {
        const triggerId = stableId("controlled-product-shadow-goal-realization-trigger-id", {
          athleteId: run.athleteId, sourceTriggerRevisionId: run.sourceTriggerRevisionId,
        });
        await client.query(
          `INSERT INTO controlled_product_shadow_triggers (
             trigger_revision_id, trigger_id, athlete_id, app_surface, trigger_kind, idempotency_key,
             semantic_fingerprint, trigger_payload, accepted_at
           ) VALUES ($1,$2,$3,$4,'product_questionnaire_or_assessment_changed',$5,$6,$7::jsonb,$8)
           ON CONFLICT (trigger_revision_id) DO NOTHING`,
          [run.sourceTriggerRevisionId, triggerId, run.athleteId, run.appSurface, run.runId,
            run.mappingBundle.mappingFingerprint, JSON.stringify({ triggerContract:
              "CONTROLLED_PRODUCT_SHADOW_TRIGGER@1.0.0", source: "explicit_goal_realization_service",
              productStateRevision: run.productStateRevision, rawProductPayloadIncluded: false }), run.evaluationTime]);
        await client.query(
          `INSERT INTO controlled_product_shadow_runs (
             run_revision_id, run_id, based_on_run_revision_id, trigger_revision_id, athlete_id,
             anchor_program_id, run_type, run_status, product_snapshot_revision_id, mapping_payload,
             resource_trace, record_payload, evaluation_time, product_mutation_applied,
             application_applied, delivered_to_user, performed
           ) VALUES ($1,$2,NULL,$3,$4,$5,'combined_product_shadow',$6,$7,$8::jsonb,$9::jsonb,$10::jsonb,$11,
             FALSE,FALSE,FALSE,FALSE)
           ON CONFLICT (run_revision_id) DO NOTHING`,
          [run.runRevisionId, run.runId, run.sourceTriggerRevisionId, run.athleteId,
            run.mappingBundle.legacyHistoryProjection.activeLegacyProgramId, run.pipelineStatus,
            run.sourceSnapshotRevision, JSON.stringify(run.mappingBundle), JSON.stringify({
              mappingProfileReference: run.mappingProfileReference,
              pipelineProfileReference: run.pipelineProfileReference, counterfactualOnly: true }),
            JSON.stringify(run), run.evaluationTime]);
        await client.query(
          `INSERT INTO controlled_product_shadow_product_snapshots (
             source_snapshot_revision_id, run_revision_id, athlete_id, product_state_revision_fingerprint,
             structured_reference_payload, evaluation_time
           ) VALUES ($1,$2,$3,$4,$5::jsonb,$6)
           ON CONFLICT (source_snapshot_revision_id) DO NOTHING`,
          [run.sourceSnapshotRevision, run.runRevisionId, run.athleteId, run.productStateRevision,
            JSON.stringify({ mappingProfileReference: run.mappingProfileReference,
              mappingContractReferences: run.mappingContractReferences, rawProductPayloadIncluded: false }),
            run.evaluationTime]);
        if (run.comparison) await client.query(
          `INSERT INTO controlled_product_shadow_comparisons (
             comparison_revision_id, comparison_id, run_revision_id, athlete_id, difference_class,
             first_meaningful_difference, comparison_payload, weighted_better_score, outcome_superiority_claimed
           ) VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,NULL,FALSE)
           ON CONFLICT (comparison_revision_id) DO NOTHING`,
          [run.comparison.comparisonId, run.comparison.comparisonId, run.runRevisionId, run.athleteId,
            run.comparison.unresolvedRequirements.length ? "incomplete_comparison" : "v2_supported_material_difference",
            run.comparison.firstMeaningfulDifference, JSON.stringify(run.comparison)]);
      });
    },
    read: async (athleteId: string, runRevisionId: string) => {
      const result = await pool.query<{ record_payload: ControlledProductShadowRunV1_1 }>(
        `SELECT record_payload FROM controlled_product_shadow_runs
         WHERE athlete_id = $1 AND run_revision_id = $2`, [athleteId, runRevisionId]);
      return result.rows[0]?.record_payload ?? null;
    },
  });
}
