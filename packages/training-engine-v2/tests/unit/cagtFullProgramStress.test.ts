import { describe, expect, it } from "vitest";
import { runFullProgramDeterministicStress } from "../helpers/fullPrescribedProgramCagtLab";

describe("full prescribed-program deterministic stress", () => {
  it("passes the complete 10,000 comparison and 1,000 pipeline/alignment/causal/no-rescue matrix", () => {
    expect(runFullProgramDeterministicStress(1_000)).toMatchObject({
      deterministicFullProgramComparisonCount: 10_000,
      completeBaselineCounterfactualPipelinePairCount: 1_000,
      programAlignmentPermutationCount: 1_000,
      causalPropagationValidationCount: 1_000,
      noRescueMutationCount: 1_000,
      deterministicMismatchCount: 0,
      signatureComparisonMismatchCount: 0,
      fullPipelineFailureCount: 0,
      alignmentFailureCount: 0,
      causalPropagationFailureCount: 0,
      noRescueFailureCount: 0,
      hiddenClockCount: 0,
      productionRandomnessCount: 0,
      result: "DETERMINISTIC_FULL_PRESCRIBED_PROGRAM_CAGT_STRESS_PASSED",
    });
  }, 90_000);
});
