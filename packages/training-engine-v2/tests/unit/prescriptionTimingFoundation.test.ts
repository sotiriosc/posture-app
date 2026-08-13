import { describe, expect, it } from "vitest";
import {
  EXERCISE_DOSE_MODES,
  REFERENCE_EXERCISES,
  validateDose,
} from "../../src";
import {
  PRESCRIPTION_TIMING_FOUNDATION_CLASSIFICATION,
  buildPrescriptionTimingFoundationData,
  codes,
  validStepSetsDose,
} from "../helpers/prescriptionTimingFoundation";

describe("prescription timing foundation", () => {
  it("curates prescription knowledge for all 45 canonical exercise rows", () => {
    const data = buildPrescriptionTimingFoundationData();

    expect(data.classification).toBe(PRESCRIPTION_TIMING_FOUNDATION_CLASSIFICATION);
    expect(data.catalogCount).toBe(45);
    expect(data.validationErrors).toEqual([]);
    expect(data.doseModeCounts).toEqual({
      breath_cycles: 1,
      timed_hold: 3,
      distance_carry: 2,
      step_march: 1,
      step_sets: 2,
      repetition_sets: 36,
    });
    expect(data.timingModelCounts).toEqual({
      breathing_cycle: 1,
      isometric_hold: 3,
      locomotor_trip: 2,
      stationary_march: 1,
      counted_steps: 2,
      dynamic_repetition: 36,
    });
    expect(data.rowsWithPrimaryDuration).toEqual([
      "forearm-plank",
      "forearm-side-plank",
      "single-leg-balance-rehearsal",
    ]);
    expect(data.rowsWithAlternateDuration).toEqual([
      "farmer-carry",
      "suitcase-carry",
      "wall-supported-suitcase-march",
    ]);
    expect(data.rowsWithBreathCadence).toEqual(["ninety-ninety-breathing"]);
    expect(data.rowsWithLocomotorCadence).toEqual([
      "farmer-carry",
      "suitcase-carry",
      "wall-supported-suitcase-march",
      "loop-band-lateral-walk",
      "supine-hamstring-walkout",
    ]);
    expect(data.rowsWithRepetitionTempo).toHaveLength(36);
  });

  it("uses a canonical dose-mode vocabulary and resolves counted-step truth with step_sets", () => {
    const data = buildPrescriptionTimingFoundationData();
    expect(EXERCISE_DOSE_MODES).toEqual([
      "repetition_sets",
      "timed_hold",
      "breath_cycles",
      "distance_carry",
      "timed_carry",
      "step_march",
      "step_sets",
    ]);
    expect(data.stepModeDecision).toBe(
      "STEP_SETS_IMPLEMENTED_FOR_LOOP_BAND_LATERAL_WALK_AND_SUPINE_HAMSTRING_WALKOUT",
    );
    expect(
      REFERENCE_EXERCISES.find((exercise) => exercise.id === "loop-band-lateral-walk")
        ?.prescriptionKnowledge.primaryDoseMode,
    ).toBe("step_sets");
    expect(
      REFERENCE_EXERCISES.find((exercise) => exercise.id === "supine-hamstring-walkout")
        ?.prescriptionKnowledge.primaryDoseMode,
    ).toBe("step_sets");
    expect(
      REFERENCE_EXERCISES.find((exercise) => exercise.id === "wall-supported-suitcase-march")
        ?.prescriptionKnowledge.primaryDoseMode,
    ).toBe("step_march");
    expect(codes(validateDose(validStepSetsDose()))).toEqual([]);
  });

  it("hard-fails incompatible timing and dose-mode mutations", () => {
    const data = buildPrescriptionTimingFoundationData();
    expect(data.mutationResults.stepMarchDistanceClaim).toContain(
      "mode_incompatible_dose_field",
    );
    expect(data.mutationResults.stepMarchDistanceClaim).toContain(
      "mode_incompatible_stationary_distance",
    );
    expect(data.mutationResults.stepMarchNotStationary).toContain(
      "invalid_dose_stationary_march_truth",
    );
    expect(data.mutationResults.timedHoldWithTempo).toContain(
      "mode_incompatible_dose_field",
    );
    expect(data.mutationResults.breathCyclesWithTempo).toContain(
      "mode_incompatible_dose_field",
    );
    expect(data.mutationResults.carryWithTempo).toContain(
      "mode_incompatible_dose_field",
    );
    expect(data.mutationResults.legacyAmbiguousStatus).toBe(
      "LEGACY_TEMPO_PHASE_AMBIGUOUS",
    );
  });

  it("keeps prescribed timing separate from actual timing and extends CAGT dimensions", () => {
    const data = buildPrescriptionTimingFoundationData();

    expect(data.mutationResults.actualTimingValid).toEqual([]);
    expect(data.mutationResults.actualTimingAssumptionRejected).toContain(
      "invalid_prescribed_tempo_actual_assumption",
    );
    expect(data.cagtTimingDimensionCoverage).toBe(true);
    expect(data.cagtTimingDimensions).toEqual([
      "dose_mode_knowledge",
      "tempo_capability",
      "duration_capability",
      "timing_policy_requirement",
      "timing_provenance",
      "duration_determinability",
      "unknown_tempo_contribution",
      "actual_tempo",
      "actual_duration",
      "timing_control_observation",
    ]);
  });

  it("keeps behavior fingerprints stable while producing timing metadata fingerprints", () => {
    const data = buildPrescriptionTimingFoundationData();
    expect(data.candidateBehavior.rankingMatches).toBe(true);
    expect(data.candidateBehavior.comprehensiveMatches).toBe(true);
    expect(Object.values(data.fingerprints).every((value) => /^[a-f0-9]{64}$/.test(value))).toBe(true);
    expect(data.candidateBehavior.catalogBehaviorMetadataFingerprint).toBe(
      "bfb21d7dc91504de5da8f4cd92850c8bb97ca5a0ce5f65624d2db4971d5e1a91",
    );
    expect(data.candidateBehavior.catalogPrescriptionMetadataFingerprint).toBe(
      "c79c2360e5a5b39ecebbf91899c248e62a9edd7997ad29e266d4236cf9410a9e",
    );
  });
});
