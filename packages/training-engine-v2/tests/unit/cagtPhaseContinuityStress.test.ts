import { describe, expect, it } from "vitest";
import { runPhaseContinuityDeterministicStress } from "../helpers/phaseContinuityDesignLab";

describe("Gate 15 deterministic stress", () => {
  it("executes the required comparison, evidence, alignment, anchor, and no-rescue volumes", () => {
    const stress = runPhaseContinuityDeterministicStress(10_000);
    expect(stress).toMatchObject({
      deterministicPhaseContinuityComparisonCount: 10_000,
      genuineCurrentProposedCompleteProgramPairCount: 9_000,
      crossHorizonAlignmentCount: 10_000,
      anchorContinuityValidationCount: 10_000,
      noRescueMutationCount: 1_000,
      deterministicMismatchCount: 0,
      resultValidationFailureCount: 0,
      acceptedDownstreamRescueCount: 0,
      hiddenClockReadCount: 0,
      randomOutputCount: 0,
      result: "PHASE_CONTINUITY_DETERMINISTIC_STRESS_PASS",
    });
    expect(stress.criterionEvidenceEvaluationCount).toBeGreaterThanOrEqual(1_000);
  });
});
