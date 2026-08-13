import { describe, expect, it } from "vitest";
import { CAGT_GATE_ORDER } from "../cagt/contracts";
import { computeCagtFingerprints, EXPECTED_CAGT_FINGERPRINTS } from "../cagt/report";
import {
  ATOMIC_WEEK_POLICY_CANDIDATES, CANDIDATE_LATTICE_FINGERPRINT, COMPOSITE_WEEK_POLICY_CANDIDATES,
  atomicCandidate, validateAtomicCandidate,
} from "../cagt/weekPolicyTournamentCandidates";
import { runWeekPolicyTournament } from "../cagt/weekPolicyTournamentMetrics";
import {
  EXPECTED_WEEK_POLICY_TOURNAMENT_FINGERPRINTS, computeWeekPolicyTournamentFingerprints,
} from "../cagt/weekPolicyTournamentReport";
import { executeTournamentScenario } from "../cagt/weekPolicyTournamentRunner";
import { CALIBRATION_POLICY_SCENARIOS } from "../cagt/weekPolicyTournamentScenarios";
import type { AtomicPolicyCandidate, TournamentScenario } from "../cagt/weekPolicyTournamentContracts";

const result = (id: string) => {
  const tournament = runWeekPolicyTournament();
  return [...tournament.atomic, ...tournament.composite].find((entry) => entry.candidateId === id)!;
};

describe("CAGT weekly numeric policy tournament", () => {
  it("freezes the predeclared 32-atomic and six-composite lattice before execution", () => {
    expect(ATOMIC_WEEK_POLICY_CANDIDATES).toHaveLength(32);
    expect(COMPOSITE_WEEK_POLICY_CANDIDATES).toHaveLength(6);
    expect(Object.isFrozen(ATOMIC_WEEK_POLICY_CANDIDATES)).toBe(true);
    expect(Object.isFrozen(COMPOSITE_WEEK_POLICY_CANDIDATES)).toBe(true);
    expect(CANDIDATE_LATTICE_FINGERPRINT).toBe(EXPECTED_WEEK_POLICY_TOURNAMENT_FINGERPRINTS.frozenCandidateLattice);
    expect(ATOMIC_WEEK_POLICY_CANDIDATES.every((entry) => entry.state === "CAGT_TEST_CANDIDATE_NOT_PRODUCTION")).toBe(true);
  });

  it("fails invalid bands and invalid priority minima at Gate 0 validation", () => {
    const invalidOrder: AtomicPolicyCandidate = { ...atomicCandidate("STRENGTH_S1_MINIMAL"), id: "INVALID_ORDER",
      band: { minimum: 2, target: 1, softMaximum: 1 } };
    const invalidPreferred: AtomicPolicyCandidate = { ...atomicCandidate("STRENGTH_SP1_PREFERRED_ONCE"), id: "INVALID_PREFERRED",
      band: { minimum: 1, target: 1, softMaximum: 2 } };
    expect(validateAtomicCandidate(invalidOrder)).toContain("INVALID_BAND_ORDER");
    expect(validateAtomicCandidate(invalidPreferred)).toContain("NON_REQUIRED_MINIMUM_MUST_BE_ZERO");
    expect(executeTournamentScenario(invalidOrder, CALIBRATION_POLICY_SCENARIOS[0]).firstFailingGate)
      .toBe("gate_0_scenario_truth");
  });

  it("executes Week design and every materialized production session in immutable gate order", () => {
    const balanced = result("COMPOSITE_B1_BALANCED_CAUSAL");
    expect(balanced.scenarioResults.every((entry) => entry.weeklyIntentStatus === "weekly_intent_planned")).toBe(true);
    expect(balanced.scenarioResults.every((entry) => entry.gates.map((gate) => gate.gate).join("|") === CAGT_GATE_ORDER.join("|"))).toBe(true);
    expect(balanced.scenarioResults.every((entry) => entry.downstreamPipelineCount === entry.reservationCount)).toBe(true);
    expect(balanced.scenarioResults.flatMap((entry) => entry.downstreamStatuses).length).toBeGreaterThan(0);
  }, 30_000);

  it("keeps no-policy unresolved and prohibits downstream rescue", () => {
    const control = result("COMPOSITE_X0_NO_POLICY");
    expect(control.classification).toBe("REJECTED_FOR_UNDER_ADAPTATION");
    expect(control.scenarioResults.every((entry) => entry.firstFailingGate === "gate_1_weekly_responsibility_truth")).toBe(true);
    expect(control.scenarioResults.every((entry) => entry.downstreamPipelineCount === 0 &&
      entry.gates.slice(2, 13).every((gate) => gate.state === "NOT_REACHED"))).toBe(true);
  });

  it("allows shared frameworks but rejects unresponsive adaptive content", () => {
    expect(result("COMPOSITE_B1_BALANCED_CAUSAL").frameworkCollision).toBeGreaterThan(0);
    expect(result("COMPOSITE_B1_BALANCED_CAUSAL").hardGateFailures).toBe(0);
    expect(result("COMPOSITE_X0_NO_POLICY").suspiciousConvergence).toBeGreaterThan(0);
  });

  it("does not let frequency or coverage automatically win", () => {
    expect(result("COMPOSITE_F1_HIGH_FREQUENCY_STRESS").classification).toBe("REJECTED_BY_HARD_GATE");
    expect(result("MUSCLE_H3_REQUIRED_TWO").targetAllocationRate).toBe(1);
    expect(result("MUSCLE_H3_REQUIRED_TWO").classification).toBe("REJECTED_FOR_OVER_ADAPTATION");
  });

  it("fails zero-value optional work, unauthorized assessment repeat, and constrained overload", () => {
    const base = CALIBRATION_POLICY_SCENARIOS[0];
    const optionalBloat: TournamentScenario = { ...base, id: "probe-optional-bloat", objectives: [...base.objectives,
      { id: "zero-value-direct", family: "direct", priority: "optional", priorityOrder: 1, explicit: true, uniqueMarginalValue: false }] };
    const bloat = executeTournamentScenario(atomicCandidate("DIRECT_DO1_OPTIONAL"), optionalBloat);
    expect(bloat.gates.find((entry) => entry.state === "FAIL_STOP")?.reasonCode).toBe("ZERO_MARGINAL_VALUE_OPTIONAL_WORK");

    const assessmentScenario = CALIBRATION_POLICY_SCENARIOS.find((entry) => entry.id === "cal-assessment-priority")!;
    const assessmentRepeat = executeTournamentScenario(COMPOSITE_WEEK_POLICY_CANDIDATES[4], assessmentScenario);
    expect(assessmentRepeat.gates.find((entry) => entry.state === "FAIL_STOP")?.reasonCode)
      .toBe("UNAUTHORIZED_ASSESSMENT_RECURRENCE");

    const overload: TournamentScenario = { ...base, id: "probe-condensed-overload", opportunityCount: 1,
      condensedOpportunityOrders: [0], objectives: [base.objectives[0],
        { id: "overload-muscle", family: "muscle", priority: "required", priorityOrder: 1, explicit: true, uniqueMarginalValue: true },
        { id: "overload-direct", family: "direct", priority: "required", priorityOrder: 2, explicit: true, uniqueMarginalValue: true }] };
    const overloaded = executeTournamentScenario(COMPOSITE_WEEK_POLICY_CANDIDATES[0], overload);
    expect(overloaded.gates.find((entry) => entry.state === "FAIL_STOP")?.reasonCode).toBe("CONSTRAINED_SESSION_OVERLOAD");
  });

  it("keeps Prescription burden unresolved and production activation false", () => {
    const tournament = runWeekPolicyTournament();
    expect([...tournament.atomic, ...tournament.composite].every((entry) =>
      entry.scenarioResults.every((scenario) => scenario.productionActivation === false))).toBe(true);
    expect(result("COMPOSITE_B1_BALANCED_CAUSAL").prescriptionResolutionBurden).toBeGreaterThan(0);
    expect(tournament.numericPolicyActivated).toBe(false);
  });

  it("freezes tournament and CAGT-core fingerprints independently", () => {
    expect(computeWeekPolicyTournamentFingerprints()).toEqual(EXPECTED_WEEK_POLICY_TOURNAMENT_FINGERPRINTS);
    expect(computeCagtFingerprints()).toEqual(EXPECTED_CAGT_FINGERPRINTS);
  });
});
