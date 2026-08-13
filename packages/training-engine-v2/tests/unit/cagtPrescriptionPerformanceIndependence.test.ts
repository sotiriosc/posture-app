import { describe, expect, it } from "vitest";
import { runPerformanceIndependenceLab } from "../cagt/prescriptionTournamentEvaluatorHardening";

describe("CAGT Prescription performance independence", () => {
  it("keeps planned dose separate from observed actual performance facts", () => {
    const result = runPerformanceIndependenceLab();
    const completed = result.observedCases.find((entry) =>
      entry.caseId === "completed_exactly_as_planned")!;
    const mutation = result.observedCases.find((entry) =>
      entry.caseId === "actual_as_plan_assumption_mutation")!;

    expect(result.actualAsPlanMutation).toBe("ACTUAL_AS_PLAN_ASSUMPTION_REJECTED");
    expect(completed.planEqualsActualWhenExplicitlyObserved).toBe(true);
    expect(completed.actualDoseAssumedFromPlan).toBe(false);
    expect(completed.actualTimingAssumedFromPlan).toBe(false);
    expect(mutation.actualDoseAssumedFromPlan).toBe(true);
    expect(mutation.actualTimingAssumedFromPlan).toBe(true);
    expect(mutation.validationErrors).toEqual(expect.arrayContaining([
      "actual_dose_assumed_from_plan",
      "actual_timing_assumed_from_plan",
    ]));
    expect(result.observedCases.filter((entry) =>
      entry.caseId !== "actual_as_plan_assumption_mutation" &&
      (entry.actualDoseAssumedFromPlan || entry.actualTimingAssumedFromPlan))).toEqual([]);
  });
});
