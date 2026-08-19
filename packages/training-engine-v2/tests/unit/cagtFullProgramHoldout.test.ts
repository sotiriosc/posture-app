import { describe, expect, it } from "vitest";
import {
  EXPECTED_FULL_PRESCRIBED_PROGRAM_CAGT_V1_HOLDOUT_MANIFEST_FINGERPRINT,
  FULL_PROGRAM_HOLDOUT_COVERAGE_LOCK,
  FULL_PROGRAM_HOLDOUT_REQUIREMENT_COUNTS,
  FULL_PRESCRIBED_PROGRAM_CAGT_V1_HOLDOUT_MANIFEST_FINGERPRINT,
} from "../cagt/fullProgramCohorts";
import { runFullProgramHoldout } from "../helpers/fullPrescribedProgramCagtLab";

describe("locked full prescribed-program CAGT V1 holdout", () => {
  it("freezes the manifest before execution and exceeds every required population", () => {
    expect(FULL_PRESCRIBED_PROGRAM_CAGT_V1_HOLDOUT_MANIFEST_FINGERPRINT)
      .toBe(EXPECTED_FULL_PRESCRIBED_PROGRAM_CAGT_V1_HOLDOUT_MANIFEST_FINGERPRINT);
    expect(FULL_PROGRAM_HOLDOUT_REQUIREMENT_COUNTS).toMatchObject({
      pairCount: 248,
      genuineCompleteProgramPairCount: 195,
      expectedConvergencePairCount: 40,
      sharedFrameworkMaterialAdaptationPairCount: 80,
      frameworkChangePairCount: 40,
      overUnderAdaptationMutationCount: 30,
      noRescueMutationCount: 24,
    });
    expect(FULL_PROGRAM_HOLDOUT_COVERAGE_LOCK).toMatchObject({
      opportunityCounts: [1, 2, 3, 4, 5, 6],
    });
    expect(FULL_PROGRAM_HOLDOUT_COVERAGE_LOCK.exerciseIds).toHaveLength(45);
    expect(FULL_PROGRAM_HOLDOUT_COVERAGE_LOCK.doseModes).toHaveLength(7);
    expect(FULL_PROGRAM_HOLDOUT_COVERAGE_LOCK.sections).toHaveLength(5);
    expect(FULL_PROGRAM_HOLDOUT_COVERAGE_LOCK.trainingRoles).toHaveLength(7);
  });

  it("matches all frozen expectations and accepts no downstream rescue", () => {
    expect(runFullProgramHoldout()).toMatchObject({
      pairCount: 248,
      expectedConvergencePairCount: 40,
      justifiedConvergencePairCount: 20,
      materialAdaptationCount: 120,
      underAdaptationCount: 15,
      overAdaptationCount: 15,
      wrongLayerCount: 5,
      adaptationErasureCount: 5,
      cosmeticOnlyCount: 4,
      upstreamShadowOnlyCount: 24,
      downstreamRescueAttemptCount: 24,
      acceptedDownstreamRescueCount: 0,
      expectationMismatchCount: 0,
      resultValidationFailureCount: 0,
    });
  }, 90_000);
});
