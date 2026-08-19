import { describe, expect, it } from "vitest";
import { computePlannerFingerprints, EXPECTED_PLANNER_FINGERPRINTS, runDeterministicPlannerFuzz } from "../helpers/sessionIntentPlannerProduction";

describe("Session Intent Planner deterministic evidence", () => {
  it("passes 10,000 fixed-seed Planner cases", () => {
    const result = runDeterministicPlannerFuzz(10_000);
    expect(result.cases).toBe(10_000);
    expect(result.failures).toEqual([]);
  });

  it("preserves all named Planner contract fingerprints", () => {
    expect(Object.keys(computePlannerFingerprints())).toHaveLength(23);
    expect(computePlannerFingerprints()).toEqual(EXPECTED_PLANNER_FINGERPRINTS);
  });
});
