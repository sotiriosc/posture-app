import { describe, expect, it } from "vitest";
import { validateControlledProductShadowRunV1_1 } from "@praxis/training-engine-v2";
import {
  CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_PROFILE_V1_B1_B4,
  buildControlledProductShadowGoalRealizationMappingBundleV1,
  createControlledProductShadowGoalRealizationServiceV1,
  createInMemoryControlledProductShadowGoalRealizationRepository,
  replayControlledProductShadowGoalRealizationV1,
  requiredGoalRealizationReplayVersions,
} from "../../src/controlledProductShadowGoalRealization";
import { CHUNK_C_EVALUATION_TIME, COMPLETE_CHUNK_C_PIPELINE, exactFixtureExtensions,
  productGoalRealizationSnapshot } from "../cagt/controlledProductShadowGoalRealizationEvidence";

function service() {
  const repository = createInMemoryControlledProductShadowGoalRealizationRepository();
  const snapshot = productGoalRealizationSnapshot();
  return { repository, service: createControlledProductShadowGoalRealizationServiceV1({
    profile: CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_PROFILE_V1_B1_B4,
    loadProductSnapshot: async () => snapshot,
    resolveActiveProgramId: (value) => value.programs?.[0]?.id ?? null,
    mappingBuilder: buildControlledProductShadowGoalRealizationMappingBundleV1,
    pipeline: COMPLETE_CHUNK_C_PIPELINE, repository,
  }) };
}

describe("controlled Product Shadow goal realization service V1", () => {
  it("requires an authenticated server Product identity", async () => {
    const context = service();
    await expect(context.service.run({ authenticatedUserId: " ", appSurface: "consumer",
      evaluationTime: CHUNK_C_EVALUATION_TIME,
      fixtureExtensions: exactFixtureExtensions() })).rejects.toThrow("AUTHENTICATED_PRODUCT_SOURCE_REQUIRED");
  });

  it("constructs an explicit V1.1 counterfactual run and returns no artifact", async () => {
    const context = service();
    const result = await context.service.run({ authenticatedUserId: "chunk-c-athlete", appSurface: "consumer",
      evaluationTime: CHUNK_C_EVALUATION_TIME, fixtureExtensions: exactFixtureExtensions() });
    expect(result).toMatchObject({ status: "shadow_program_complete",
      mappingReadiness: "complete_for_shadow_planning", clientArtifactCount: 0,
      productMutationCount: 0, applicationCount: 0 });
    const run = await context.repository.read("chunk-c-athlete", result.runRevisionId!);
    expect(run).toMatchObject({ runReference: { contractVersion: "1.1.0" },
      pipelineProfileReference: { contractVersion: "1.0.0" },
      comparisonReference: { contractVersion: "1.1.0" }, counterfactualOnly: true,
      deliveredToUser: false, performed: false, productMutationApplied: false, applicationApplied: false });
    expect(validateControlledProductShadowRunV1_1(run!)).toEqual([]);
  });

  it("replays only with every exact mapping and pipeline version", async () => {
    const context = service();
    const result = await context.service.run({ authenticatedUserId: "chunk-c-athlete", appSurface: "gyms",
      evaluationTime: CHUNK_C_EVALUATION_TIME, fixtureExtensions: exactFixtureExtensions() });
    const run = await context.repository.read("chunk-c-athlete", result.runRevisionId!);
    const availableVersions = requiredGoalRealizationReplayVersions(run!);
    await expect(replayControlledProductShadowGoalRealizationV1({ repository: context.repository,
      athleteId: "chunk-c-athlete", runRevisionId: result.runRevisionId!, availableVersions }))
      .resolves.toMatchObject({ status: "exact_version_replay_ready", latestVersionFallbackCount: 0,
        productMutationCount: 0, applicationCount: 0, performedCount: 0 });
    await expect(replayControlledProductShadowGoalRealizationV1({ repository: context.repository,
      athleteId: "chunk-c-athlete", runRevisionId: result.runRevisionId!, availableVersions: [] }))
      .rejects.toThrow("CONTROLLED_PRODUCT_SHADOW_MAPPING_PROFILE_VERSION_UNAVAILABLE");
  });

  it("fails at mapping before any stage can rescue incomplete Product input", async () => {
    const repository = createInMemoryControlledProductShadowGoalRealizationRepository();
    const snapshot = productGoalRealizationSnapshot("Reduce pain");
    const service = createControlledProductShadowGoalRealizationServiceV1({
      profile: CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_PROFILE_V1_B1_B4,
      loadProductSnapshot: async () => snapshot,
      resolveActiveProgramId: () => "legacy-program-c1",
      mappingBuilder: buildControlledProductShadowGoalRealizationMappingBundleV1,
      pipeline: COMPLETE_CHUNK_C_PIPELINE, repository,
    });
    const result = await service.run({ authenticatedUserId: "chunk-c-athlete", appSurface: "consumer",
      evaluationTime: CHUNK_C_EVALUATION_TIME,
      fixtureExtensions: exactFixtureExtensions() });
    expect(result).toMatchObject({ status: "shadow_program_incomplete_product_input",
      mappingReadiness: "primary_outcome_follow_up_required", clientArtifactCount: 0 });
    const run = await repository.read("chunk-c-athlete", result.runRevisionId!);
    expect(run?.mappingBundle.goalMapping.primaryOutcome).toBeNull();
    expect(run?.mappingBundle.planningBrief).toBeNull();
  });
});
