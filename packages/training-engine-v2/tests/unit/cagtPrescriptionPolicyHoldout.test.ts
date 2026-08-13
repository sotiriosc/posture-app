import { describe, expect, it } from "vitest";
import { REFERENCE_EXERCISES } from "../../src";
import {
  EXPECTED_PRESCRIPTION_NUMERIC_TOURNAMENT_FINGERPRINTS,
  PRESCRIPTION_NUMERIC_COMPOSITE_CANDIDATES,
  PRESCRIPTION_NUMERIC_LOCKED_HOLDOUT_FINGERPRINT,
  buildPrescriptionNumericCalibrationScenarios,
  buildPrescriptionNumericLockedHoldoutScenarios,
  compileNumericDesignFixture,
} from "../cagt/prescriptionPolicyTournament";

describe("CAGT Prescription numeric locked holdout", () => {
  it("keeps the new holdout disjoint, locked, and independently fingerprinted", () => {
    const calibrationIds = new Set(buildPrescriptionNumericCalibrationScenarios().map((entry) => entry.scenarioId));
    const holdout = buildPrescriptionNumericLockedHoldoutScenarios();

    expect(holdout).toHaveLength(60);
    expect(holdout.length).toBeGreaterThanOrEqual(50);
    expect(Object.isFrozen(holdout)).toBe(true);
    expect(holdout.every((entry) =>
      entry.locked && entry.cohort === "holdout" && !calibrationIds.has(entry.scenarioId))).toBe(true);
    expect(PRESCRIPTION_NUMERIC_LOCKED_HOLDOUT_FINGERPRINT)
      .toBe(EXPECTED_PRESCRIPTION_NUMERIC_TOURNAMENT_FINGERPRINTS.newLockedHoldout);
  });

  it("covers all 45 reference exercises without reusing the calibration cohort ids", () => {
    const holdoutExerciseIds = new Set(buildPrescriptionNumericLockedHoldoutScenarios()
      .map((entry) => entry.exerciseId));
    expect(holdoutExerciseIds.size).toBe(REFERENCE_EXERCISES.length);
    for (const exercise of REFERENCE_EXERCISES) {
      expect(holdoutExerciseIds.has(exercise.id)).toBe(true);
    }
  });

  it("compiles the balanced composite across the locked holdout without validator failures", () => {
    const balanced = PRESCRIPTION_NUMERIC_COMPOSITE_CANDIDATES.find((entry) =>
      entry.candidateId === "RX_COMPOSITE_B1_BALANCED_CAUSAL")!;
    const results = buildPrescriptionNumericLockedHoldoutScenarios().map((scenario) =>
      compileNumericDesignFixture(balanced, scenario));

    expect(results).toHaveLength(60);
    expect(results.every((entry) => entry.status === "compiled_non_production_fixture")).toBe(true);
    expect(results.every((entry) => entry.firstFailingGate === null)).toBe(true);
    expect(results.every((entry) => entry.sourceExposureEventCount === 1 && entry.finalRevisionCount === 1)).toBe(true);
    expect(results.every((entry) => entry.preparatoryMiscredit === 0 && entry.substitutionDoubleCount === 0)).toBe(true);
  }, 30_000);
});
