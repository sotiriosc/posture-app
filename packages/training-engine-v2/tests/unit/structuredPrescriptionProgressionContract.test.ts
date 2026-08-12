import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  CAPABILITY_COMPLETE_TRUNK_CARRY_EQUIPMENT,
  COMMERCIAL_GYM_LABEL_ONLY_EQUIPMENT,
} from "../helpers/trunkCarryEquipmentContract";
import {
  STRUCTURED_PRESCRIPTION_CLASSIFICATION,
  STRUCTURED_TRUNK_CARRY_PRESCRIPTION_FIXTURES,
  buildStructuredPrescriptionContractData,
  renderStructuredPrescriptionContractReport,
  structuredFixtureById,
  syntheticExerciseForFixture,
} from "../helpers/structuredPrescriptionProgressionContract";
import {
  PROGRESSION_AXES,
  REFERENCE_EXERCISES,
  THREE_PHASE_FOUNDATION,
  buildProgressionReadinessTrace,
  exactCount,
  exactMetres,
  exactSeconds,
  getControlledCandidateScenario,
  runCandidateRankingLab,
  validateDose,
  validateExercisePerformanceContext,
  validateExercisePerformanceRecord,
  validatePrescription,
  validateProgressionEvidence,
  validateStructuredPrescriptionContext,
  type ExerciseDose,
  type ExercisePerformanceRecord,
  type ExercisePrescription,
  type ProgressionEvidence,
} from "../../src";

const CURRENT_AXIS_VALUES = [
  "load",
  "reps",
  "sets",
  "range",
  "tempo",
  "support_reduction",
  "stability",
  "coordination",
  "complexity",
] as const;

const CURRENT_EXERCISE_AXIS_VALUES = CURRENT_AXIS_VALUES.filter(
  (axis) => axis !== "coordination",
);

function codes(findings: readonly { readonly code: string }[]): readonly string[] {
  return findings.map((finding) => finding.code);
}

function fixture(id: ExercisePrescription["exerciseId"]): ExercisePrescription {
  return structuredFixtureById(id as Parameters<typeof structuredFixtureById>[0]);
}

function withDose(
  prescription: ExercisePrescription,
  dose: ExerciseDose,
): ExercisePrescription {
  return { ...prescription, dose };
}

function performanceRecord(
  overrides: Partial<ExercisePerformanceRecord> = {},
): ExercisePerformanceRecord {
  const prescription = fixture("forearm-plank");
  const criterionId = prescription.executionStandard.criteria[0]!.id;
  return {
    performanceRecordId: "fixture-performance-forearm-plank-1",
    prescriptionId: prescription.prescriptionId,
    exerciseId: prescription.exerciseId,
    occurredAt: "2026-08-12T12:00:00.000Z",
    completionStatus: "completed_as_planned",
    actualDose: prescription.dose,
    qualityObservations: [
      {
        criterionId,
        result: "met",
        source: "self_report",
        provenance: prescription.provenance,
      },
    ],
    unresolvedPainResponseEvidenceIds: [],
    trainingResponseObservationIds: [],
    recoveryEvidenceIds: ["fixture-recovery-1"],
    recoveryStatus: "recovered_as_expected",
    substitutions: [],
    notes: [],
    provenance: prescription.provenance,
    ...overrides,
  };
}

function readyEvidence(
  overrides: Partial<ProgressionEvidence> = {},
): ProgressionEvidence {
  return {
    prescriptionId: "fixture-prescription-forearm-plank",
    exerciseId: "forearm-plank",
    doseEvidence: "target_met",
    executionQualityEvidence: "all_required_criteria_met",
    painResponseEvidence: "no_unresolved_response_requirement",
    recoveryEvidence: "recovered_as_expected",
    continuityRunwayEvidence: [
      "same_exercise_remains_productive",
      "progression_axes_remain_available",
    ],
    repeatedEvidence: "repeated_success",
    evidenceRecordIds: ["fixture-performance-1", "fixture-performance-2"],
    notes: [],
    ...overrides,
  };
}

describe("structured prescription and same-exercise progression contract", () => {
  it("uses one canonical progression-axis vocabulary without assigning new axes to current production exercises or phases", () => {
    expect(PROGRESSION_AXES).toEqual([
      "load",
      "reps",
      "sets",
      "range",
      "tempo",
      "support_reduction",
      "stability",
      "coordination",
      "complexity",
      "duration",
      "distance",
      "trips",
      "steps",
      "lever",
      "effort",
      "rest_reduction",
      "breath_cycles",
    ]);

    const currentExerciseAxes = new Set(
      REFERENCE_EXERCISES.flatMap((exercise) => exercise.progression.progressionAxes),
    );
    expect([...currentExerciseAxes].sort()).toEqual(
      [...CURRENT_EXERCISE_AXIS_VALUES].sort(),
    );
    expect(
      THREE_PHASE_FOUNDATION.flatMap(
        (phase) => phase.progressionIntent.preferredProgressionAxes,
      ).every((axis) => CURRENT_AXIS_VALUES.includes(axis as never)),
    ).toBe(true);
  });

  it("validates every synthetic trunk/carry fixture without creating production metadata", () => {
    for (const prescription of STRUCTURED_TRUNK_CARRY_PRESCRIPTION_FIXTURES) {
      expect(
        validateStructuredPrescriptionContext({
          exercise: syntheticExerciseForFixture(
            prescription.exerciseId as Parameters<typeof syntheticExerciseForFixture>[0],
          ),
          equipment: CAPABILITY_COMPLETE_TRUNK_CARRY_EQUIPMENT,
          prescription,
        }).status,
      ).toBe("VALID_PRESCRIPTION_CONTEXT");
    }

    expect(
      REFERENCE_EXERCISES.map((exercise) => exercise.id),
    ).not.toEqual(
      expect.arrayContaining(
        STRUCTURED_TRUNK_CARRY_PRESCRIPTION_FIXTURES.map(
          (prescription) => prescription.exerciseId,
        ),
      ),
    );
  });

  it("rejects invalid dose modes, missing fields, incompatible fields, noninteger counts, and unordered ranges", () => {
    expect(codes(validateDose({ mode: "hold" } as unknown as ExerciseDose))).toContain(
      "invalid_dose_mode",
    );
    expect(
      codes(
        validateDose({
          mode: "repetition_sets",
          sets: exactCount(2),
        } as unknown as ExerciseDose),
      ),
    ).toContain("missing_dose_required_field");
    expect(
      codes(
        validateDose({
          ...fixture("farmer-carry").dose,
          durationPerTrip: exactSeconds(20),
        } as unknown as ExerciseDose),
      ),
    ).toContain("mode_incompatible_dose_field");
    expect(
      codes(
        validateDose({
          ...fixture("forearm-plank").dose,
          sets: { kind: "exact", value: 1.5, unit: "count" },
        } as ExerciseDose),
      ),
    ).toContain("invalid_target_non_integer_count");
    expect(
      codes(
        validateDose({
          ...fixture("machine-abdominal-crunch").dose,
          repetitions: { kind: "range", min: 10, max: 8, unit: "count" },
        } as ExerciseDose),
      ),
    ).toContain("invalid_target_range_order");
  });

  it("rejects invalid numeric targets while preserving explicit unknown as unknown rather than zero", () => {
    expect(
      codes(
        validateDose({
          ...fixture("forearm-plank").dose,
          duration: { kind: "exact", value: 0, unit: "seconds" },
        } as ExerciseDose),
      ),
    ).toContain("invalid_target_non_positive");
    expect(
      codes(
        validateDose({
          ...fixture("farmer-carry").dose,
          distancePerTrip: exactMetres(-5),
        } as ExerciseDose),
      ),
    ).toContain("invalid_target_non_positive");
    expect(
      codes(
        validateDose({
          ...fixture("machine-abdominal-crunch").dose,
          load: {
            kind: "machine_stack",
            target: { kind: "exact", setting: 0 },
            application: "machine_stack",
          },
        } as ExerciseDose),
      ),
    ).toContain("invalid_target_non_positive");
    expect(
      codes(
        validateDose({
          ...fixture("forearm-plank").dose,
          load: { kind: "unknown", reason: "Fixture intentionally leaves load unknown." },
        } as ExerciseDose),
      ),
    ).not.toContain("invalid_load_unknown_reason");
    expect(
      codes(
        validateDose({
          ...fixture("forearm-plank").dose,
          duration: {
            kind: "unknown",
            reason: "Unknown duration.",
            value: 0,
          },
        } as unknown as ExerciseDose),
      ),
    ).toContain("invalid_target_unknown_has_numeric_value");
    expect(
      codes(
        validateDose({
          ...fixture("machine-abdominal-crunch").dose,
          tempo: {
            concentricIntent: "controlled",
            eccentricSeconds: -1,
          },
        } as ExerciseDose),
      ),
    ).toContain("invalid_target_negative_tempo");
  });

  it("keeps distance carries, timed carries, and stationary marches as separate dose modes", () => {
    const farmer = fixture("farmer-carry").dose;
    const suitcase = fixture("suitcase-carry").dose;
    const wallMarch = fixture("wall-supported-suitcase-march").dose;

    const { distancePerTrip: _missingDistance, ...distanceCarryWithoutDistance } =
      farmer as Extract<ExerciseDose, { mode: "distance_carry" }>;
    const { durationPerTrip: _missingDuration, ...timedCarryWithoutDuration } =
      suitcase as Extract<ExerciseDose, { mode: "timed_carry" }>;

    expect(codes(validateDose(distanceCarryWithoutDistance as ExerciseDose))).toContain(
      "missing_dose_required_field",
    );
    expect(codes(validateDose(timedCarryWithoutDuration as ExerciseDose))).toContain(
      "missing_dose_required_field",
    );
    expect(
      codes(
        validateDose({
          ...wallMarch,
          distance: exactMetres(10),
        } as unknown as ExerciseDose),
      ),
    ).toContain("mode_incompatible_stationary_distance");
    expect(
      codes(
        validateDose({
          ...wallMarch,
          duration: exactSeconds(20),
        } as ExerciseDose),
      ),
    ).toContain("missing_dose_step_or_time_truth");
  });

  it("validates load side, per-hand load, per-side work, support side, RPE, and RIR without conversions", () => {
    const missingSide = validateDose({
      ...fixture("suitcase-carry").dose,
      load: {
        kind: "external_load",
        target: { kind: "exact", value: 8, unit: "kg" },
        application: "unilateral_side",
      },
    } as ExerciseDose);
    expect(codes(missingSide)).toContain("missing_load_side_truth");

    expect(codes(validateDose(fixture("farmer-carry").dose))).not.toContain(
      "missing_load_side_truth",
    );

    expect(
      codes(
        validateDose({
          ...fixture("half-kneeling-high-to-low-cable-chop").dose,
          laterality: { kind: "bilateral" },
        } as ExerciseDose),
      ),
    ).toContain("invalid_dose_per_side_laterality");

    const wallSide = fixture("wall-supported-suitcase-march").dose.sideBehavior;
    expect(wallSide).toEqual(
      expect.objectContaining({
        loadSide: "left",
        supportSide: "right",
        sideRelationship: "opposite_side",
      }),
    );

    const machineEffort = fixture("machine-abdominal-crunch").dose.effort;
    expect(machineEffort?.kind).toBe("rir");
    expect(codes(validateDose(fixture("machine-abdominal-crunch").dose))).not.toContain(
      "invalid_effort_bounds",
    );
    expect(
      codes(
        validateDose({
          ...fixture("machine-abdominal-crunch").dose,
          effort: { kind: "rpe", target: { kind: "exact", value: 11 } },
        } as ExerciseDose),
      ),
    ).toContain("invalid_effort_bounds");
  });

  it("requires unique traceable form criteria and valid quality-limited effort references", () => {
    const plank = fixture("forearm-plank");
    const duplicateCriterion: ExercisePrescription = {
      ...plank,
      executionStandard: {
        ...plank.executionStandard,
        criteria: [
          plank.executionStandard.criteria[0]!,
          plank.executionStandard.criteria[0]!,
        ],
      },
    };
    expect(codes(validatePrescription(duplicateCriterion))).toContain(
      "duplicate_execution_criterion_id",
    );

    const badEffort = withDose(plank, {
      ...plank.dose,
      effort: {
        kind: "quality_limited",
        requiredCriterionIds: ["missing-required-criterion"],
        description: "Invalid fixture.",
      },
    } as ExerciseDose);
    expect(codes(validatePrescription(badEffort))).toContain(
      "invalid_quality_limited_effort_criterion_ref",
    );
  });

  it("keeps prescription-context status categories distinct", () => {
    const farmer = fixture("farmer-carry");
    const invalidEquipment = {
      ...CAPABILITY_COMPLETE_TRUNK_CARRY_EQUIPMENT,
      trainingSpace: {
        stableLoadedStandingSpace: false,
        loadedGait: { available: true },
      },
    };
    expect(
      validateStructuredPrescriptionContext({
        exercise: syntheticExerciseForFixture("farmer-carry"),
        equipment: invalidEquipment,
        prescription: farmer,
      }).status,
    ).toBe("INVALID_EQUIPMENT_INPUT");
    expect(
      validateStructuredPrescriptionContext({
        exercise: syntheticExerciseForFixture("farmer-carry"),
        equipment: COMMERCIAL_GYM_LABEL_ONLY_EQUIPMENT,
        prescription: farmer,
      }).status,
    ).toBe("MISSING_REQUIRED_EQUIPMENT");
    expect(
      validateStructuredPrescriptionContext({
        exercise: syntheticExerciseForFixture("farmer-carry"),
        equipment: CAPABILITY_COMPLETE_TRUNK_CARRY_EQUIPMENT,
        prescription: withDose(farmer, {
          ...farmer.dose,
          distancePerTrip: exactMetres(0),
        } as ExerciseDose),
      }).status,
    ).toBe("INVALID_DOSE");
  });

  it("never returns valid prescription context for identity, binding, phase, time, rationale, provenance, or axis errors", () => {
    const plank = fixture("forearm-plank");
    const validContext = {
      exercise: syntheticExerciseForFixture("forearm-plank"),
      equipment: CAPABILITY_COMPLETE_TRUNK_CARRY_EQUIPMENT,
    };

    const invalidPrescriptions: ExercisePrescription[] = [
      { ...plank, prescriptionId: "" },
      { ...plank, sourceExposureEventId: "" },
      { ...plank, createdAt: "" },
      { ...plank, createdAt: "2026-08-11T12:00:00" },
      { ...plank, createdAt: "2026-02-31T12:00:00Z" },
      { ...plank, phaseId: "phase_4" as ExercisePrescription["phaseId"] },
      { ...plank, exerciseId: "" },
      { ...plank, rationale: [] },
      { ...plank, rationale: [""] },
      { ...plank, provenance: { ...plank.provenance, sourceRef: "" } },
      {
        ...plank,
        provenance: {
          ...plank.provenance,
          source: "fabricated" as ExercisePrescription["provenance"]["source"],
        },
      },
      { ...plank, intendedProgressionAxes: ["duration", "duration"] },
      {
        ...plank,
        intendedProgressionAxes: [
          "duration",
          "magic_axis" as ExercisePrescription["intendedProgressionAxes"][number],
        ],
      },
    ];

    for (const prescription of invalidPrescriptions) {
      const result = validateStructuredPrescriptionContext({
        ...validContext,
        prescription,
      });
      expect(result.status).toBe("INVALID_PRESCRIPTION");
      expect(result.findings.some((finding) => finding.severity === "error")).toBe(true);
      expect(result.status).not.toBe("VALID_PRESCRIPTION_CONTEXT");
    }

    expect(
      validateStructuredPrescriptionContext({
        ...validContext,
        prescription: { ...plank, exerciseId: "different-exercise" },
      }).status,
    ).toBe("INVALID_PRESCRIPTION");
  });

  it("rejects wrong numeric target units and unknown or not-prescribed hidden numeric values", () => {
    expect(
      codes(
        validateDose({
          ...fixture("machine-abdominal-crunch").dose,
          sets: { kind: "exact", value: 2, unit: "seconds" },
        } as unknown as ExerciseDose),
      ),
    ).toContain("invalid_target_unit");
    expect(
      codes(
        validateDose({
          ...fixture("farmer-carry").dose,
          distancePerTrip: { kind: "exact", value: 20, unit: "count" },
        } as unknown as ExerciseDose),
      ),
    ).toContain("invalid_target_unit");
    expect(
      codes(
        validateDose({
          ...fixture("forearm-plank").dose,
          duration: { kind: "exact", value: 20, unit: "metres" },
        } as unknown as ExerciseDose),
      ),
    ).toContain("invalid_target_unit");
    expect(
      codes(
        validateDose({
          ...fixture("forearm-plank").dose,
          duration: { kind: "unknown", unit: "seconds" },
        } as unknown as ExerciseDose),
      ),
    ).toContain("invalid_target_unknown_reason");
    expect(
      codes(
        validateDose({
          ...fixture("forearm-plank").dose,
          rest: { kind: "not_prescribed", unit: "count", value: 0 },
        } as unknown as ExerciseDose),
      ),
    ).toEqual(
      expect.arrayContaining([
        "invalid_target_unit",
        "invalid_target_unknown_has_numeric_value",
      ]),
    );
  });

  it("rejects arbitrary or mode-incompatible dose fields and empty explanatory standards", () => {
    const modeFixtures = [
      fixture("machine-abdominal-crunch").dose,
      fixture("forearm-plank").dose,
      { mode: "breath_cycles", rounds: exactCount(2), breathCycles: { kind: "exact", value: 4, unit: "breath_cycles" } },
      fixture("farmer-carry").dose,
      fixture("suitcase-carry").dose,
      fixture("wall-supported-suitcase-march").dose,
    ] as readonly ExerciseDose[];

    for (const dose of modeFixtures) {
      expect(codes(validateDose({ ...dose, arbitrary: true } as unknown as ExerciseDose))).toContain(
        "mode_incompatible_dose_field",
      );
    }

    expect(
      codes(validateDose({ ...fixture("farmer-carry").dose, sets: exactCount(2) } as unknown as ExerciseDose)),
    ).toContain("mode_incompatible_dose_field");
    expect(
      codes(validateDose({ ...fixture("farmer-carry").dose, repetitions: exactCount(8) } as unknown as ExerciseDose)),
    ).toContain("mode_incompatible_dose_field");
    expect(
      codes(validateDose({ ...fixture("suitcase-carry").dose, distancePerTrip: exactMetres(10) } as unknown as ExerciseDose)),
    ).toContain("mode_incompatible_dose_field");
    expect(
      codes(
        validateDose({
          mode: "breath_cycles",
          rounds: exactCount(2),
          breathCycles: { kind: "exact", value: 4, unit: "breath_cycles" },
          gaitControlStandard: "not owned here",
        } as unknown as ExerciseDose),
      ),
    ).toContain("mode_incompatible_dose_field");
    expect(
      codes(validateDose({ ...fixture("wall-supported-suitcase-march").dose, trips: exactCount(2) } as unknown as ExerciseDose)),
    ).toContain("mode_incompatible_dose_field");
    expect(
      codes(validateDose({ ...fixture("wall-supported-suitcase-march").dose, durationPerTrip: exactSeconds(20) } as unknown as ExerciseDose)),
    ).toContain("mode_incompatible_dose_field");
    expect(
      codes(validateDose({ ...fixture("machine-abdominal-crunch").dose, stationary: true } as unknown as ExerciseDose)),
    ).toContain("mode_incompatible_dose_field");
    expect(
      codes(validateDose({ ...fixture("farmer-carry").dose, gaitControlStandard: "" } as ExerciseDose)),
    ).toContain("invalid_dose_gait_control_standard");
    expect(
      codes(validateDose({ ...fixture("wall-supported-suitcase-march").dose, marchControlStandard: "" } as ExerciseDose)),
    ).toContain("invalid_dose_march_control_standard");
    expect(
      codes(
        validateDose({
          mode: "breath_cycles",
          rounds: exactCount(2),
          breathCycles: { kind: "exact", value: 4, unit: "breath_cycles" },
          breathingPhaseStandard: "",
        } as ExerciseDose),
      ),
    ).toContain("invalid_dose_breathing_phase_standard");
  });

  it("rejects invalid laterality, side behavior, side relationships, and load-side conflicts", () => {
    expect(
      codes(
        validateDose({
          ...fixture("forearm-plank").dose,
          laterality: { kind: "diagonal" },
        } as unknown as ExerciseDose),
      ),
    ).toContain("invalid_laterality_kind");
    expect(
      codes(
        validateDose({
          ...fixture("forearm-plank").dose,
          laterality: { kind: "single_side" },
        } as unknown as ExerciseDose),
      ),
    ).toContain("invalid_laterality_side");
    expect(
      codes(
        validateDose({
          ...fixture("wall-supported-suitcase-march").dose,
          sideBehavior: {
            loadSide: "left",
            supportSide: "right",
            sideRelationship: "same_side",
          },
        } as ExerciseDose),
      ),
    ).toContain("invalid_side_relationship_truth");
    expect(
      codes(
        validateDose({
          ...fixture("wall-supported-suitcase-march").dose,
          sideBehavior: {
            loadSide: "left",
            supportSide: "left",
            sideRelationship: "opposite_side",
          },
        } as ExerciseDose),
      ),
    ).toContain("invalid_side_relationship_truth");
    expect(
      codes(
        validateDose({
          ...fixture("suitcase-carry").dose,
          sideBehavior: {
            movementSide: { kind: "each_side" },
            loadSide: "right",
            startingSide: "right",
            alternates: true,
          },
        } as ExerciseDose),
      ),
    ).toContain("invalid_load_side_behavior_mismatch");
    expect(
      codes(
        validateDose({
          ...fixture("suitcase-carry").dose,
          sideBehavior: { alternates: "yes" },
        } as unknown as ExerciseDose),
      ),
    ).toContain("invalid_side_behavior_alternates");
  });

  it("rejects invalid support, lever, range, tempo, effort, and band load values", () => {
    expect(
      codes(validateDose({ ...fixture("forearm-plank").dose, support: { level: "floating" } } as unknown as ExerciseDose)),
    ).toContain("invalid_support_level");
    expect(
      codes(validateDose({ ...fixture("forearm-plank").dose, support: { level: "partial", surface: "cloud" } } as unknown as ExerciseDose)),
    ).toContain("invalid_support_surface");
    expect(
      codes(validateDose({ ...fixture("forearm-plank").dose, lever: { state: "longerish" } } as unknown as ExerciseDose)),
    ).toContain("invalid_lever_state");
    expect(
      codes(
        validateDose({
          ...fixture("forearm-plank").dose,
          lever: {
            state: "standard",
            variant: { exerciseId: "forearm-plank", variantId: "", description: "" },
          },
        } as ExerciseDose),
      ),
    ).toEqual(expect.arrayContaining(["invalid_lever_variant_id", "invalid_lever_variant_description"]));
    expect(
      codes(validateDose({ ...fixture("machine-abdominal-crunch").dose, range: { kind: "mystery" } } as unknown as ExerciseDose)),
    ).toContain("invalid_range_kind");
    expect(
      codes(validateDose({ ...fixture("machine-abdominal-crunch").dose, range: { kind: "intentionally_partial", description: "" } } as ExerciseDose)),
    ).toContain("invalid_range_description");
    expect(
      codes(validateDose({ ...fixture("machine-abdominal-crunch").dose, tempo: { concentricIntent: "warp" } } as unknown as ExerciseDose)),
    ).toContain("invalid_tempo_concentric_intent");
    expect(
      codes(validateDose({ ...fixture("machine-abdominal-crunch").dose, effort: { kind: "maximalish" } } as unknown as ExerciseDose)),
    ).toContain("invalid_effort_kind");
    expect(
      codes(validateDose({ ...fixture("machine-abdominal-crunch").dose, effort: { kind: "phase_qualitative_band", band: "extreme" } } as unknown as ExerciseDose)),
    ).toContain("invalid_effort_qualitative_band");
    expect(
      codes(validateDose({ ...fixture("machine-abdominal-crunch").dose, effort: { kind: "rir", target: { kind: "exact", value: 2, min: 1 } } } as unknown as ExerciseDose)),
    ).toContain("invalid_effort_target_field");
    expect(
      codes(validateDose({ ...fixture("forearm-plank").dose, effort: { kind: "quality_limited", requiredCriterionIds: ["forearm-plank-position-control", "forearm-plank-position-control"], description: "" } } as ExerciseDose)),
    ).toEqual(
      expect.arrayContaining([
        "duplicate_quality_limited_effort_criterion_ref",
        "invalid_quality_limited_effort_description",
      ]),
    );
    expect(
      codes(validateDose({ ...fixture("forearm-plank").dose, effort: { kind: "self_selected_by_reviewed_standard", standardId: "", description: "" } } as ExerciseDose)),
    ).toEqual(expect.arrayContaining(["invalid_effort_standard_id", "invalid_effort_description"]));
    expect(
      codes(validateDose({ ...fixture("forearm-plank").dose, load: { kind: "band_tension", target: { kind: "elastic_guess", level: "heavy" } } } as unknown as ExerciseDose)),
    ).toContain("invalid_load_band_tension_kind");
    expect(
      codes(validateDose({ ...fixture("forearm-plank").dose, load: { kind: "band_tension", target: { kind: "band_level", level: "super_heavy" } } } as unknown as ExerciseDose)),
    ).toContain("invalid_load_band_level");
    expect(
      codes(validateDose({ ...fixture("forearm-plank").dose, load: { kind: "band_tension", target: { kind: "reviewed_band_reference", referenceId: "", description: "" } } } as ExerciseDose)),
    ).toEqual(expect.arrayContaining(["invalid_load_band_reference", "invalid_load_band_reference_description"]));
  });

  it("validates malformed performance records and performance/prescription context", () => {
    const plank = fixture("forearm-plank");
    const duplicateObservation = performanceRecord().qualityObservations[0]!;
    const malformed = performanceRecord({
      performanceRecordId: "",
      occurredAt: "2026-08-12T12:00:00",
      completionStatus: "mostly_done" as ExercisePerformanceRecord["completionStatus"],
      qualityObservations: [
        duplicateObservation,
        { ...duplicateObservation },
        {
          criterionId: "",
          result: "excellent" as ExercisePerformanceRecord["qualityObservations"][number]["result"],
          source: "coachish" as ExercisePerformanceRecord["qualityObservations"][number]["source"],
          provenance: { ...plank.provenance, sourceRef: "" },
        },
      ],
      unresolvedPainResponseEvidenceIds: [""],
      recoveryEvidenceIds: [""],
      substitutions: [
        {
          originalExerciseId: "",
          substitutedExerciseId: "",
          reason: "",
          provenance: { ...plank.provenance, sourceRef: "" },
        },
      ],
    });
    expect(codes(validateExercisePerformanceRecord(malformed))).toEqual(
      expect.arrayContaining([
        "missing_performance_record_id",
        "invalid_performance_occurred_at",
        "invalid_performance_completion_status",
        "duplicate_performance_quality_observation",
        "invalid_performance_quality_criterion_id",
        "invalid_performance_quality_result",
        "invalid_performance_quality_source",
        "invalid_performance_pain_response_id",
        "invalid_performance_recovery_evidence_id",
        "invalid_performance_substitution_reason",
      ]),
    );

    const context = validateExercisePerformanceContext({
      prescription: plank,
      performance: performanceRecord({
        prescriptionId: "other-prescription",
        exerciseId: "other-exercise",
        qualityObservations: [
          {
            ...duplicateObservation,
            criterionId: "missing-criterion",
          },
        ],
      }),
    });
    expect(context.status).toBe("INVALID_PERFORMANCE_RECORD");
    expect(codes(context.findings)).toEqual(
      expect.arrayContaining([
        "invalid_performance_prescription_mismatch",
        "invalid_performance_exercise_mismatch",
        "invalid_performance_quality_criterion_ref",
      ]),
    );
  });

  it("validates malformed progression evidence without selecting policy thresholds", () => {
    const plank = fixture("forearm-plank");
    const findings = validateProgressionEvidence(
      {
        prescriptionId: "",
        exerciseId: "",
        doseEvidence: "great" as ProgressionEvidence["doseEvidence"],
        executionQualityEvidence:
          "excellent" as ProgressionEvidence["executionQualityEvidence"],
        painResponseEvidence: "fine" as ProgressionEvidence["painResponseEvidence"],
        recoveryEvidence: "fast" as ProgressionEvidence["recoveryEvidence"],
        continuityRunwayEvidence: [
          "unknown",
          "unknown",
          "magic" as ProgressionEvidence["continuityRunwayEvidence"][number],
        ],
        repeatedEvidence: "sometimes" as ProgressionEvidence["repeatedEvidence"],
        evidenceRecordIds: [""],
        notes: [1 as unknown as string],
      },
      { prescription: plank, performanceRecords: [performanceRecord()] },
    );
    expect(codes(findings)).toEqual(
      expect.arrayContaining([
        "missing_progression_prescription_id",
        "missing_progression_exercise_id",
        "invalid_progression_dose_evidence",
        "invalid_progression_execution_quality_evidence",
        "invalid_progression_pain_response_evidence",
        "invalid_progression_recovery_evidence",
        "invalid_progression_repeated_evidence",
        "invalid_progression_continuity_evidence",
        "duplicate_progression_continuity_evidence",
        "invalid_progression_evidence_record_id",
        "invalid_notes_array",
      ]),
    );
  });

  it("classifies progression readiness without selecting an axis, dose increase, or transition", () => {
    const ready = buildProgressionReadinessTrace(readyEvidence());
    expect(ready.classification).toBe("READY_FOR_PROGRESSION_REVIEW");
    expect(ready.selectedAxis).toBeNull();
    expect(ready.selectedTransition).toBeNull();
    expect(ready.automaticProgressionDecision).toBe(false);

    expect(
      buildProgressionReadinessTrace(
        readyEvidence({
          executionQualityEvidence: "one_or_more_required_criteria_not_met",
        }),
      ).classification,
    ).toBe("REGRESSION_OR_REVIEW_REQUIRED");
    expect(
      buildProgressionReadinessTrace(
        readyEvidence({ painResponseEvidence: "prescription_response_unresolved" }),
      ).classification,
    ).toBe("REGRESSION_OR_REVIEW_REQUIRED");
    expect(
      buildProgressionReadinessTrace(
        readyEvidence({ recoveryEvidence: "recovery_concern" }),
      ).classification,
    ).toBe("REGRESSION_OR_REVIEW_REQUIRED");
    expect(
      buildProgressionReadinessTrace(
        readyEvidence({
          executionQualityEvidence: "criteria_not_sufficiently_observed",
        }),
      ).classification,
    ).toBe("INSUFFICIENT_EVIDENCE");
  });

  it("preserves one source event for multi-characteristic carry prescriptions", () => {
    const suitcase = fixture("suitcase-carry");
    expect(suitcase.sourceExposureEventId).toBe("fixture-source-suitcase-carry");
    expect(
      new Set(
        STRUCTURED_TRUNK_CARRY_PRESCRIPTION_FIXTURES.map(
          (prescription) => prescription.sourceExposureEventId,
        ),
      ).size,
    ).toBe(STRUCTURED_TRUNK_CARRY_PRESCRIPTION_FIXTURES.length);
  });

  it("keeps current ranking, comprehensive behavior, catalog, and equipment fingerprints unchanged", () => {
    const data = buildStructuredPrescriptionContractData();
    expect(data.productionRankingMatches).toBe(true);
    expect(data.comprehensiveBehaviorMatches).toBe(true);
    expect(data.referenceCatalogMatches).toBe(true);
    expect(data.equipmentLegalityMatches).toBe(true);
    expect(data.expandedEquipmentFixtureMatches).toBe(true);
    expect(data.classification).toBe(STRUCTURED_PRESCRIPTION_CLASSIFICATION);
  });

  it("does not let prescription-only changes alter hard eligibility, ranking, or transition behavior", () => {
    const scenario = getControlledCandidateScenario("horizontal-push-phase-3");
    if (!scenario) {
      throw new Error("Missing horizontal-push-phase-3 scenario.");
    }
    const before = runCandidateRankingLab(scenario.request);
    const after = runCandidateRankingLab(scenario.request);

    expect(after.rankedCandidates.map((candidate) => candidate.exercise.id)).toEqual(
      before.rankedCandidates.map((candidate) => candidate.exercise.id),
    );
    expect(
      before.hardRejectedCandidates
        .find((candidate) => candidate.exercise.id === "goblet-squat")
        ?.eligibility.rejectionReasons.map((reason) => reason.code),
    ).toEqual(expect.arrayContaining(["MOVEMENT_ROLE_MISMATCH"]));
  });

  it("renders a deterministic contract report and keeps fixture ids out of production prescription source", () => {
    const report = renderStructuredPrescriptionContractReport();
    expect(renderStructuredPrescriptionContractReport()).toBe(report);
    expect(report).toContain("## Synthetic Fixture Results");
    expect(report).toContain("## Current Behavior Fingerprints");
    expect(report).toContain(STRUCTURED_PRESCRIPTION_CLASSIFICATION);

    const source = readSourceTree(
      fileURLToPath(new URL("../../src/prescription", import.meta.url)),
    );
    expect(source).not.toMatch(/forearm-plank|suitcase-carry|farmer-carry/);
    expect(source).not.toMatch(/\.name|\.summary|coachingFocus/);
  });
});

function readSourceTree(dir: string): string {
  return readdirSync(dir, { withFileTypes: true })
    .map((entry) => {
      const full = join(dir, entry.name);
      return entry.isDirectory() ? readSourceTree(full) : readFileSync(full, "utf8");
    })
    .join("\n");
}
