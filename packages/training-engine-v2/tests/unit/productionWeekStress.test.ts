import { describe, expect, it } from "vitest";
import { runProductionWeekStress } from "../cagt/productionWeekEvidence";

describe("production Week deterministic stress", () => {
  it("runs the full mandated deterministic evaluation matrix", () => {
    const result = runProductionWeekStress();
    expect(result.failures).toEqual([]);
    expect(result).toMatchObject({
      intentEvaluations: 10_000,
      allocationEvaluations: 10_000,
      policyEvaluations: 10_000,
      exactSearchComparisons: 5_000,
      boundedSearchComparisons: 5_000,
      pipelineEvaluations: 1_000,
      materializationEvaluations: 1_000,
      reallocationEvaluations: 1_000,
      completedHistoryValidations: 1_000,
      antiBloatValidations: 1_000,
      warmupActivationValidations: 1_000,
      gate13ProjectionValidations: 1_000,
      noRescueMutations: 1_000,
      repeatedRunDeterministic: true,
      productionRandomnessCount: 0,
      hiddenClockCount: 0,
      downstreamRescueCount: 0,
    });
  }, 120_000);
});
