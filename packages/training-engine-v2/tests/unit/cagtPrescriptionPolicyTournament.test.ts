import { describe, expect, it } from "vitest";
import { EXERCISE_DOSE_MODES } from "../../src";
import {
  EXPECTED_PRESCRIPTION_NUMERIC_TOURNAMENT_FINGERPRINTS,
  PRESCRIPTION_NUMERIC_ATOMIC_CANDIDATES,
  PRESCRIPTION_NUMERIC_CANDIDATE_MANIFEST_FINGERPRINT,
  PRESCRIPTION_NUMERIC_COMPOSITE_CANDIDATES,
  PRESCRIPTION_NUMERIC_TEST_CANDIDATE_STATE,
  buildPrescriptionNumericTournamentReport,
  computePrescriptionNumericTournamentFingerprints,
  runPrescriptionNumericTournament,
} from "../cagt/prescriptionPolicyTournament";

const expectedShapes = [
  "minimal_truthful",
  "balanced",
  "high_dose_or_high_complexity_stress",
  "no_policy_control",
].sort();

describe("CAGT Prescription numeric policy tournament", () => {
  it("freezes the executable 76-atomic and seven-composite candidate manifest", () => {
    expect(PRESCRIPTION_NUMERIC_ATOMIC_CANDIDATES).toHaveLength(76);
    expect(PRESCRIPTION_NUMERIC_COMPOSITE_CANDIDATES).toHaveLength(7);
    expect(Object.isFrozen(PRESCRIPTION_NUMERIC_ATOMIC_CANDIDATES)).toBe(true);
    expect(Object.isFrozen(PRESCRIPTION_NUMERIC_COMPOSITE_CANDIDATES)).toBe(true);
    expect(PRESCRIPTION_NUMERIC_ATOMIC_CANDIDATES.every((entry) =>
      entry.state === PRESCRIPTION_NUMERIC_TEST_CANDIDATE_STATE)).toBe(true);

    const candidatesByFamily = Map.groupBy(PRESCRIPTION_NUMERIC_ATOMIC_CANDIDATES, (entry) => entry.family);
    expect(candidatesByFamily.size).toBe(19);
    for (const candidates of candidatesByFamily.values()) {
      expect(candidates).toHaveLength(4);
      expect([...new Set(candidates.map((entry) => entry.shape))].sort()).toEqual(expectedShapes);
    }
    expect(PRESCRIPTION_NUMERIC_CANDIDATE_MANIFEST_FINGERPRINT)
      .toBe(EXPECTED_PRESCRIPTION_NUMERIC_TOURNAMENT_FINGERPRINTS.executableNumericCandidateManifest);
  });

  it("executes 6,972 candidate/scenario fixtures through Prescription CAGT Gates 9-11", () => {
    const report = buildPrescriptionNumericTournamentReport();
    const tournament = report.tournament;
    const allResults = [...tournament.atomic, ...tournament.composite];
    const compiledResults = allResults.flatMap((entry) => entry.scenarioResults)
      .filter((entry) => entry.status === "compiled_non_production_fixture");
    const modes = new Set(compiledResults.flatMap((entry) =>
      entry.plan?.doseBlocks.map((block) => block.dose.mode) ?? []));

    expect(report.classification).toBe("PRESCRIPTION_NUMERIC_POLICY_FRONTIER_READY_FOR_OWNER_SELECTION");
    expect(report.calibrationScenarioCount).toBe(24);
    expect(report.lockedHoldoutScenarioCount).toBe(60);
    expect(report.scenarioEvaluationCount).toBe(83 * 84);
    expect(report.completeDownstreamPipelines).toBe(6297);
    expect(report.catalogValidationErrors).toEqual([]);
    expect(report.all45ExercisesCovered).toBe(true);
    expect(report.allDoseModesCovered).toBe(true);
    expect([...modes].sort()).toEqual([...EXERCISE_DOSE_MODES].sort());
    expect(compiledResults.every((entry) =>
      entry.gates.map((gate) => gate.gate).join("|") ===
      "gate_9_prescription_handoff_truth|gate_10_sequencing_duration_handoff_truth|gate_11_execution_response_foundation"))
      .toBe(true);
  }, 30_000);

  it("keeps the balanced composite on the Pareto frontier without activating production policy", () => {
    const tournament = runPrescriptionNumericTournament();
    const balanced = tournament.composite.find((entry) =>
      entry.candidateId === "RX_COMPOSITE_B1_BALANCED_CAUSAL")!;
    const stress = tournament.composite.find((entry) =>
      entry.candidateId === "RX_COMPOSITE_F1_HIGH_STRESS")!;
    const noPolicy = tournament.composite.find((entry) =>
      entry.candidateId === "RX_COMPOSITE_X0_NO_POLICY")!;

    expect(tournament.numericPolicyActivated).toBe(false);
    expect(tournament.productionBehaviorChanged).toBe(false);
    expect(tournament.paretoFrontier).toContain("RX_COMPOSITE_B1_BALANCED_CAUSAL");
    expect(balanced.classification).toBe("PARETO_FRONTIER_OWNER_DECISION_REQUIRED");
    expect(balanced.hardGateFailures).toBe(0);
    expect(balanced.validCompiledFixtureRate).toBe(1);
    expect(stress.classification).toBe("REJECTED_BY_HARD_GATE");
    expect(noPolicy.classification).toBe("NO_POLICY_CONTROL");
    expect(tournament.ownerRecommendations.main_strength).toEqual(["MAIN_STRENGTH_BALANCED"]);
    expect(tournament.ownerRecommendations.breath_cycles).toEqual(["BREATH_CYCLES_MINIMAL_TRUTHFUL"]);
  }, 30_000);

  it("preserves prior production fingerprints and freezes the tournament fingerprints", () => {
    const report = buildPrescriptionNumericTournamentReport();
    expect(report.numericPolicyActivated).toBe(false);
    expect(report.productionBehaviorChanged).toBe(false);
    expect(report.productionFingerprints.candidateRankingMatches).toBe(true);
    expect(report.productionFingerprints.candidateComprehensiveMatches).toBe(true);
    expect(report.productionFingerprints.sessionPlannerMatches).toBe(true);
    expect(report.productionFingerprints.sessionComposerMatches).toBe(true);
    expect(report.productionFingerprints.fullPrescriptionDesign)
      .toBe("9c32aa988525f229b8bf9d31574689fd492fc5bd7e9b3756f164c6c9f4a02805");
    expect(computePrescriptionNumericTournamentFingerprints())
      .toEqual(EXPECTED_PRESCRIPTION_NUMERIC_TOURNAMENT_FINGERPRINTS);
  }, 30_000);
});
