import { stableId, type ControlledProductShadowRunV1_1 } from "@praxis/training-engine-v2";
import type { ControlledProductShadowGoalRealizationReplayResult,
  ControlledProductShadowGoalRealizationRepository } from "./contracts";

function reference(value: { readonly contractId: string; readonly contractVersion: string }): string {
  return `${value.contractId}@${value.contractVersion}`;
}

export function requiredGoalRealizationReplayVersions(run: ControlledProductShadowRunV1_1): readonly string[] {
  return Object.freeze([...new Set([
    reference(run.runReference), reference(run.mappingProfileReference), reference(run.pipelineProfileReference),
    reference(run.planningBriefPolicyReference), reference(run.comparisonReference),
    ...run.mappingContractReferences.map(reference), ...run.stageContractReferences.map(reference),
    ...run.b1B4References.map(reference), reference(run.mappingBundle.exerciseIdentityMapping.registryReference),
  ])].sort());
}

export async function replayControlledProductShadowGoalRealizationV1(input: {
  readonly repository: ControlledProductShadowGoalRealizationRepository;
  readonly athleteId: string;
  readonly runRevisionId: string;
  readonly availableVersions: readonly string[];
}): Promise<ControlledProductShadowGoalRealizationReplayResult> {
  const run = await input.repository.read(input.athleteId, input.runRevisionId);
  if (!run) throw new Error("CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_RUN_NOT_FOUND");
  const requiredVersions = requiredGoalRealizationReplayVersions(run);
  if (requiredVersions.some((required) => !input.availableVersions.includes(required))) {
    throw new Error("CONTROLLED_PRODUCT_SHADOW_MAPPING_PROFILE_VERSION_UNAVAILABLE");
  }
  return Object.freeze({ status: "exact_version_replay_ready", runRevisionId: run.runRevisionId,
    comparisonRevisionId: run.comparison?.comparisonId ?? null, requiredVersions,
    latestVersionFallbackCount: 0, productMutationCount: 0, applicationCount: 0, performedCount: 0,
    fingerprint: stableId("controlled-product-shadow-goal-realization-replay", {
      runRevisionId: run.runRevisionId, requiredVersions, sourceSnapshotRevision: run.sourceSnapshotRevision,
      evaluationTime: run.evaluationTime,
    }) });
}
