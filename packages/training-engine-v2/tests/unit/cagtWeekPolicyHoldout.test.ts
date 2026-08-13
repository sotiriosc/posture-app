import { describe, expect, it } from "vitest";
import { runWeekPolicyTournament } from "../cagt/weekPolicyTournamentMetrics";
import {
  CALIBRATION_COHORT_FINGERPRINT, CALIBRATION_POLICY_SCENARIOS, HOLDOUT_COHORT_FINGERPRINT,
  LOCKED_HOLDOUT_POLICY_SCENARIOS,
} from "../cagt/weekPolicyTournamentScenarios";
import { EXPECTED_WEEK_POLICY_TOURNAMENT_FINGERPRINTS } from "../cagt/weekPolicyTournamentReport";

describe("CAGT numeric policy locked holdout", () => {
  it("keeps calibration and holdout disjoint, immutable, and independently fingerprinted", () => {
    const calibrationIds = new Set(CALIBRATION_POLICY_SCENARIOS.map((entry) => entry.id));
    expect(LOCKED_HOLDOUT_POLICY_SCENARIOS.every((entry) => entry.locked && !calibrationIds.has(entry.id))).toBe(true);
    expect(Object.isFrozen(LOCKED_HOLDOUT_POLICY_SCENARIOS)).toBe(true);
    expect(CALIBRATION_COHORT_FINGERPRINT).toBe(EXPECTED_WEEK_POLICY_TOURNAMENT_FINGERPRINTS.calibrationCohort);
    expect(HOLDOUT_COHORT_FINGERPRINT).toBe(EXPECTED_WEEK_POLICY_TOURNAMENT_FINGERPRINTS.holdoutCohort);
  });

  it("retains Pareto-incomparable candidates instead of forcing a winner", () => {
    const result = runWeekPolicyTournament();
    expect(result.incomparableCandidates).toContainEqual(["MUSCLE_H1_SINGLE_FLEXIBLE", "MUSCLE_H2_DISTRIBUTED"]);
    expect(result.paretoFrontier).toEqual(expect.arrayContaining(["MUSCLE_H1_SINGLE_FLEXIBLE", "MUSCLE_H2_DISTRIBUTED"]));
  }, 30_000);

  it("reports deterministic owner recommendations without activating policy", () => {
    const first = runWeekPolicyTournament();
    const second = runWeekPolicyTournament();
    expect(first).toEqual(second);
    expect(first.numericPolicyActivated).toBe(false);
    expect(first.classification).toBe("TARGETED_POLICY_CANDIDATE_FIXES_REQUIRED");
  });
});
