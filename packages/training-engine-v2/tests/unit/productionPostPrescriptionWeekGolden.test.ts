import { describe, expect, it } from "vitest";
import { runProductionPostPrescriptionWeekGoldenEquivalence } from "../helpers/productionPostPrescriptionWeekValidationLab";

describe("production post-Prescription Week golden equivalence", () => {
  it("preserves every shared admitted semantic fact", () => {
    const golden = runProductionPostPrescriptionWeekGoldenEquivalence();
    expect(golden).toMatchObject({
      scenarioCount: 160,
      genuineCompletePrescribedWeekCount: 128,
      adaptedCount: 156,
      rejectedCount: 4,
      cleanComparisonCount: 128,
      exactCommonSemanticMatchCount: 128,
      unexplainedSemanticDifferenceCount: 0,
      expectedEventCount: 860,
      observedEventCount: 860,
      uniqueEventCount: 860,
      cleanGate13FailureCount: 0,
      result: "PRODUCTION_POST_PRESCRIPTION_WEEK_GOLDEN_EQUIVALENCE_PASSED",
    });
    expect(golden.adapterRejections.every((entry) =>
      entry.reasonCodes.includes("DESIGN_OBJECTIVE_SESSION_NEED_TRACE_REQUIRED"))).toBe(true);
    expect(golden.h1H2Evidence).toMatchObject({
      equalTotalDistribution: true,
      additiveMutationRejected: true,
      completedResponseClaimed: false,
      hypertrophySuperiorityClaimed: false,
    });
  });
});
