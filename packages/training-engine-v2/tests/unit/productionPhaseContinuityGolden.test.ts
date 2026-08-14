import { describe, expect, it } from "vitest";
import { runProductionPhaseContinuityGoldenEquivalence } from "../helpers/productionPhaseContinuityLab";

describe("production Phase Continuity golden equivalence", () => {
  it("matches all admitted controlled, fixed-shell, holdout, and genuine program-pair evidence", () => {
    const result = runProductionPhaseContinuityGoldenEquivalence();
    expect(result).toMatchObject({ controlledCaseCount: 85, fixedShellCaseCount: 30,
      admittedHoldoutCount: 295, genuineProgramPairCount: 210,
      unexplainedDifferenceCount: 0, productionValidationFailureCount: 0,
      stateMutationAppliedCount: 0, applicationOwnerMissingCount: 0,
      result: "PRODUCTION_PHASE_CONTINUITY_GOLDEN_EQUIVALENCE_PASS" });
    expect(result.expectedRepresentationCorrectionCount).toBe(1);
  });
});
