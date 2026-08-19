import { describe, expect, it } from "vitest";
import {
  CHUNK_C_CONTROLLED_SCENARIOS,
  CHUNK_C_FIXED_SHELL_COHORT,
  CHUNK_C_HOLDOUT_FINGERPRINT,
  CHUNK_C_HOLDOUT_MANIFEST,
  CHUNK_C_METAMORPHIC_RESULTS,
  CHUNK_C_MUTATIONS,
  runChunkCEvidence,
} from "../cagt/controlledProductShadowGoalRealizationEvidence";

describe("controlled Product Shadow goal realization deterministic evidence", () => {
  it("covers controlled and fixed-shell Product facts without quotas", () => {
    expect(CHUNK_C_CONTROLLED_SCENARIOS).toHaveLength(420);
    expect(CHUNK_C_FIXED_SHELL_COHORT).toHaveLength(120);
    expect(new Set(CHUNK_C_CONTROLLED_SCENARIOS.map((entry) => entry.appSurface)))
      .toEqual(new Set(["consumer", "gyms"]));
    expect(new Set(CHUNK_C_FIXED_SHELL_COHORT.map((entry) => entry.orderedOpportunityCount)))
      .toEqual(new Set([4]));
  });

  it("locks the required historical and new-profile holdout lanes", () => {
    expect(CHUNK_C_HOLDOUT_MANIFEST).toMatchObject({ lockedBeforeEvaluation: true,
      tuningAfterInspectionPermitted: false, scenarioCount: 650, historicalV1GoldenCount: 250,
      newProfileMappingCount: 400, b1B4PipelineAttemptCount: 220,
      completeOrCalibrationCompleteCount: 220, honestIncompleteCount: 180 });
    expect(CHUNK_C_HOLDOUT_FINGERPRINT).toMatch(/^[a-f0-9]{64}$/);
  });

  it("rejects every semantic mutation and passes every metamorphic case", () => {
    expect(CHUNK_C_MUTATIONS.length).toBeGreaterThanOrEqual(60);
    expect(CHUNK_C_METAMORPHIC_RESULTS).toHaveLength(28);
    expect(CHUNK_C_METAMORPHIC_RESULTS.every((entry) => entry.passed)).toBe(true);
  });

  it("runs the locked holdout and all minimum stress counts", async () => {
    const result = await runChunkCEvidence();
    expect(result.failures).toEqual([]);
    expect(result.holdout).toMatchObject({ scenarioCount: 650, historicalV1GoldenCount: 250,
      newProfileMappingCount: 400, b1B4PipelineAttemptCount: 220,
      completeOrCalibrationCompleteCount: 220, honestIncompleteCount: 180 });
    expect(result.stress).toMatchObject({ goalMappings: 10_000, planningBriefMappings: 10_000,
      trainingModeMappings: 10_000, experienceHistoryProjections: 10_000, equipmentMappings: 10_000,
      availabilityHorizonMappings: 10_000, exerciseIdentityMappings: 10_000, mappingBundleBuilds: 5_000,
      b1B4PipelineAttempts: 3_000, selfSelectedCalibrationCases: 2_000, restrictedHistoryCases: 2_000,
      comparisonCases: 2_000, historicalV1ReplayComparisons: 1_000,
      currentRouteInvarianceComparisons: 1_000, counterfactualAttributionAttacks: 1_000,
      b4ChallengeBoundaryChecks: 1_000, noRescueMutations: 1_000, hiddenClockReads: 0,
      productionRandomnessCalls: 0, failures: [] });
  });
});
