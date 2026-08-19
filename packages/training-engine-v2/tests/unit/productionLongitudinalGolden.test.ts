import { describe, expect, it } from "vitest";
import { runProductionLongitudinalGoldenEquivalence } from
  "../helpers/productionLongitudinalAdaptationLab";

describe("production Longitudinal golden equivalence", () => {
  it("matches admitted design across the full frozen corpus", () => {
    expect(runProductionLongitudinalGoldenEquivalence()).toMatchObject({
      admittedControlledChainCount: 130, admittedFixedShellCount: 40, admittedHoldoutCount: 360,
      genuineCompletedHistoryCount: 325, productionControlledScenarioCount: 130,
      allExerciseIdentityCount: 45, allDoseModeCount: 7, semanticMismatchCount: 0,
      productionValidationFailureCount: 0,
      admittedHoldoutFingerprint: "7da3dd7a0f543df2caeac29cf822567b24f2c85742bb82a656ecba872a11df18",
      fingerprint: "3df5c7be00ccd07c6e7669c6fe4e535f4596395c8c3cfe466637165764ab2ac5",
      result: "PRODUCTION_LONGITUDINAL_ADAPTATION_GOLDEN_EQUIVALENCE_PASS",
    });
  });
});
