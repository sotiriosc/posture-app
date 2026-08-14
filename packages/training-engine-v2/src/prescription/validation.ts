import {
  evaluateEquipmentRequirement,
  type EquipmentCapabilities,
} from "../domain/equipment";
import type { ExerciseDefinition } from "../domain/exercise";
import { isProgressionAxis } from "../domain/progression";
import { validateEquipmentCapabilities } from "../validation";
import { EXERCISE_DOSE_MODES, type ExerciseDose, type NumericTarget } from "./dose";
import type {
  BreathingCadencePrescription,
  CadenceTimingTarget,
  EffortTarget,
  ExecutionQualityCriterion,
  ExecutionStandard,
  LeverPrescription,
  LocomotorCadencePrescription,
  MovementPhaseTempoTarget,
  NumericEffortTarget,
  RangePrescription,
  SupportPrescription,
  TempoPrescription,
  VariantReference,
} from "./executionStandard";
import type {
  BandTensionMagnitude,
  LoadTarget,
  MachineSettingMagnitude,
  NumericLoadMagnitude,
} from "./load";
import type {
  ActualDurationObservation,
  ActualTempoObservation,
  ExercisePerformanceTimingObservation,
  ExecutionQualityObservation,
  ExercisePerformanceRecord,
  ExerciseSubstitutionRecord,
} from "./performanceOutcome";
import type { ExercisePrescription } from "./prescription";
import type { ProgressionEvidence } from "./progressionEvidence";
import {
  prescriptionFinding,
  type EvidenceProvenance,
  type PrescriptionLaterality,
  type PrescriptionSideBehavior,
  type PrescriptionValidationFinding,
} from "./types";

export type PrescriptionContextValidationStatus =
  | "VALID_PRESCRIPTION_CONTEXT"
  | "INVALID_EQUIPMENT_INPUT"
  | "MISSING_REQUIRED_EQUIPMENT"
  | "INVALID_PRESCRIPTION"
  | "INVALID_DOSE"
  | "UNRESOLVED_EXECUTION_REQUIREMENT";

export interface PrescriptionContextValidationResult {
  readonly status: PrescriptionContextValidationStatus;
  readonly findings: readonly PrescriptionValidationFinding[];
}

export interface ExercisePerformanceContextValidationResult {
  readonly status: "VALID_PERFORMANCE_CONTEXT" | "INVALID_PERFORMANCE_RECORD";
  readonly findings: readonly PrescriptionValidationFinding[];
}

const PHASE_IDS = ["phase_1", "phase_2", "phase_3"] as const;
const PRESCRIPTION_EVIDENCE_SOURCES = [
  "prescription_contract",
  "exercise_definition",
  "assessment_priority",
  "pain_response_requirement",
  "coach_review",
  "athlete_report",
  "sensor",
  "future_vision_adapter",
  "policy",
  "synthetic_contract_fixture",
  "unknown",
] as const;
const DOSE_MODES = EXERCISE_DOSE_MODES;
const DOSE_BASE_FIELDS = [
  "mode",
  "load",
  "effort",
  "rest",
  "range",
  "support",
  "lever",
  "laterality",
  "sideBehavior",
] as const;
const DOSE_FIELDS: Record<(typeof DOSE_MODES)[number], readonly string[]> = {
  repetition_sets: [...DOSE_BASE_FIELDS, "sets", "repetitions", "perSide", "tempo"],
  timed_hold: [...DOSE_BASE_FIELDS, "sets", "duration"],
  breath_cycles: [
    ...DOSE_BASE_FIELDS,
    "rounds",
    "breathCycles",
    "breathingCadence",
    "breathingPhaseStandard",
  ],
  distance_carry: [
    ...DOSE_BASE_FIELDS,
    "trips",
    "distancePerTrip",
    "locomotorCadence",
    "gaitControlStandard",
  ],
  timed_carry: [
    ...DOSE_BASE_FIELDS,
    "trips",
    "durationPerTrip",
    "locomotorCadence",
    "gaitControlStandard",
  ],
  step_march: [
    ...DOSE_BASE_FIELDS,
    "stationary",
    "sets",
    "steps",
    "duration",
    "alternation",
    "marchCadence",
    "marchControlStandard",
  ],
  step_sets: [
    ...DOSE_BASE_FIELDS,
    "sets",
    "steps",
    "stepCountInterpretation",
    "alternation",
    "stepCadence",
    "tempo",
  ],
};
const PRESCRIPTION_SIDES = ["left", "right"] as const;
const LATERALITY_KINDS = [
  "bilateral",
  "single_side",
  "each_side",
  "alternating",
] as const;
const SIDE_RELATIONSHIPS = [
  "same_side",
  "opposite_side",
  "independent",
  "not_applicable",
  "unknown",
] as const;
const SUPPORT_LEVELS = ["full", "partial", "light_touch", "none", "unknown"] as const;
const SUPPORT_SURFACES = [
  "floor",
  "wall",
  "bench",
  "machine",
  "box",
  "chair",
  "rack",
  "cable_or_band_anchor",
  "other",
  "unknown",
] as const;
const LEVER_STATES = [
  "shortened_regressed",
  "standard",
  "lengthened_extended",
  "unknown",
] as const;
const RANGE_KINDS = [
  "full_available",
  "intentionally_partial",
  "custom_reviewed",
  "unknown",
] as const;
const LEGACY_TEMPO_INTENTS = [
  "controlled",
  "natural",
  "explosive_intent",
  "not_applicable",
  "unknown",
] as const;
const TEMPO_INTENTS = [
  "controlled",
  "natural",
  "explosive_intent",
  "maximal_intent",
] as const;
const TEMPO_KINDS = [
  "repetition_phase_tempo",
  "intent_only",
  "not_prescribed",
  "not_applicable",
  "unknown",
  "legacy_compatibility",
] as const;
const MOVEMENT_PHASE_TARGET_KINDS = [
  "exact_seconds",
  "seconds_range",
  "intent_only",
  "not_prescribed",
  "unknown",
] as const;
const LEGACY_TEMPO_MIGRATION_STATUSES = [
  "LEGACY_TEMPO_INTENT_ONLY_COMPATIBLE",
  "LEGACY_TEMPO_PHASE_INCOMPLETE",
  "LEGACY_TEMPO_PHASE_AMBIGUOUS",
] as const;
const BREATHING_CADENCE_KINDS = [
  "structured_breathing_cadence",
  "not_prescribed",
  "unknown",
] as const;
const BREATHING_CADENCE_PHASES = [
  "inhale",
  "post_inhale_pause",
  "exhale",
  "post_exhale_pause",
] as const;
const CADENCE_TARGET_KINDS = [
  "exact_seconds",
  "seconds_range",
  "intent_only",
  "not_prescribed",
  "unknown",
] as const;
const CADENCE_TARGET_INTENTS = [
  "controlled",
  "natural",
  "self_selected_by_reviewed_standard",
] as const;
const LOCOMOTOR_CADENCE_KINDS = [
  "locomotor_or_step_cadence",
  "not_prescribed",
  "unknown",
] as const;
const LOCOMOTOR_CADENCE_INTENTS = [
  "controlled",
  "natural",
  "brisk",
  "self_selected_by_reviewed_standard",
] as const;
const LOAD_KINDS = [
  "bodyweight",
  "external_load",
  "machine_stack",
  "cable_stack",
  "band_tension",
  "user_selected_by_effort",
  "unknown",
  "not_prescribed",
] as const;
const LOAD_UNITS = ["kg", "lb"] as const;
const EXTERNAL_LOAD_APPLICATIONS = [
  "total",
  "per_hand",
  "single_implement",
  "unilateral_side",
] as const;
const LOAD_APPLICATIONS = [
  ...EXTERNAL_LOAD_APPLICATIONS,
  "machine_stack",
  "cable_stack",
] as const;
const BAND_TENSION_KINDS = ["band_level", "reviewed_band_reference"] as const;
const BAND_LEVELS = ["very_light", "light", "moderate", "heavy", "unknown"] as const;
const EFFORT_KINDS = [
  "rir",
  "rpe",
  "phase_qualitative_band",
  "quality_limited",
  "self_selected_by_reviewed_standard",
  "unknown",
] as const;
const EFFORT_TARGET_KINDS = ["exact", "range"] as const;
const PHASE_EFFORT_BANDS = ["easy", "moderate", "hard"] as const;
const EXECUTION_DIMENSIONS = [
  "position_control",
  "movement_control",
  "range_control",
  "tempo_control",
  "breathing_pressure_control",
  "support_control",
  "side_or_symmetry_control",
  "gait_load_transfer_control",
  "exercise_intent_preservation",
] as const;
const EXECUTION_IMPORTANCE = [
  "required_for_progression",
  "preferred",
  "observational",
] as const;
const EXECUTION_SOURCES = [
  "exercise_mechanics",
  "assessment_priority",
  "alignment_priority",
  "pain_response_requirement",
  "coach_review",
  "athlete_report",
  "policy",
] as const;
const COMPLETION_STATUSES = [
  "completed_as_planned",
  "partially_completed",
  "target_not_met",
  "not_performed",
  "substituted",
  "unknown",
] as const;
const QUALITY_RESULTS = ["met", "partially_met", "not_met", "not_observed"] as const;
const QUALITY_SOURCES = [
  "self_report",
  "coach_observation",
  "sensor",
  "future_vision_adapter",
  "unknown",
] as const;
const ACTUAL_TEMPO_OBSERVATION_KINDS = [
  "observed",
  "unknown",
  "not_observed",
] as const;
const ACTUAL_DURATION_OBSERVATION_KINDS = [
  "observed_seconds",
  "unknown",
  "not_observed",
] as const;
const RECOVERY_STATUSES = [
  "recovered_as_expected",
  "recovery_concern",
  "insufficient_observation",
  "unknown",
] as const;
const DOSE_EVIDENCE_STATUSES = [
  "target_met",
  "target_partially_met",
  "target_not_met",
  "unknown",
] as const;
const EXECUTION_EVIDENCE_STATUSES = [
  "all_required_criteria_met",
  "one_or_more_required_criteria_not_met",
  "criteria_not_sufficiently_observed",
] as const;
const PAIN_RESPONSE_EVIDENCE_STATUSES = [
  "no_unresolved_response_requirement",
  "candidate_review_required",
  "prescription_response_unresolved",
  "role_substitution_unresolved",
  "urgent_external_review_signal",
  "unknown",
] as const;
const CONTINUITY_RUNWAY_EVIDENCE_STATUSES = [
  "same_exercise_remains_productive",
  "progression_axes_remain_available",
  "plateau_evidence",
  "failed_progression_evidence",
  "replacement_consideration_evidence",
  "unknown",
] as const;
const REPEATED_EVIDENCE_STATUSES = [
  "isolated_success",
  "repeated_success",
  "insufficient_history",
  "mixed_response",
] as const;

export function validatePrescription(
  prescription: ExercisePrescription,
): readonly PrescriptionValidationFinding[] {
  const findings: PrescriptionValidationFinding[] = [];
  const record = asRecord(prescription);
  if (!record) {
    return [
      prescriptionFinding(
        "error",
        "invalid_prescription_object",
        "Structured prescription must be an object.",
      ),
    ];
  }

  const targetId = stringOrUndefined(record.exerciseId);
  findings.push(
    ...requireNonEmptyString(
      record.prescriptionId,
      "missing_prescription_id",
      "Structured prescription requires a stable prescriptionId.",
      targetId,
    ),
    ...requireNonEmptyString(
      record.sourceExposureEventId,
      "missing_source_exposure_event_id",
      "Structured prescription requires one stable source exposure event id.",
      targetId,
    ),
    ...requireNonEmptyString(
      record.exerciseId,
      "missing_prescription_exercise_id",
      "Structured prescription requires a stable exerciseId.",
      targetId,
    ),
  );

  if (!isOneOf(record.phaseId, PHASE_IDS)) {
    findings.push(
      prescriptionFinding(
        "error",
        "invalid_prescription_phase_id",
        "Prescription phaseId must be a valid current PhaseId.",
        targetId,
      ),
    );
  }

  if (!isNonEmptyString(record.createdAt)) {
    findings.push(
      prescriptionFinding(
        "error",
        "missing_explicit_prescription_time",
        "Prescription time must be supplied explicitly; the engine must not read a hidden clock.",
        targetId,
      ),
    );
  } else if (!isExplicitIsoDateTime(record.createdAt)) {
    findings.push(
      prescriptionFinding(
        "error",
        "invalid_explicit_prescription_time",
        "Prescription time must be a valid ISO-8601 timestamp with explicit timezone.",
        targetId,
      ),
    );
  }

  findings.push(
    ...validateNonEmptyStringArray(
      record.rationale,
      "rationale",
      "invalid_prescription_rationale",
      targetId,
      { requireNonEmptyArray: true },
    ),
    ...validateIntendedProgressionAxes(record.intendedProgressionAxes, targetId),
    ...validateEvidenceProvenance(
      record.provenance,
      "prescription provenance",
      targetId,
    ),
    ...validateExecutionStandard(
      record.executionStandard as ExecutionStandard,
      targetId,
    ),
    ...validateDose(
      record.dose as ExerciseDose,
      asRecord(record.executionStandard)
        ? (record.executionStandard as ExecutionStandard)
        : undefined,
      targetId,
    ),
  );

  return findings;
}

export function validateStructuredPrescriptionContext(input: {
  readonly exercise: ExerciseDefinition;
  readonly equipment: EquipmentCapabilities;
  readonly prescription: ExercisePrescription;
}): PrescriptionContextValidationResult {
  const findings: PrescriptionValidationFinding[] = [];
  const equipmentFindings = validateEquipmentCapabilities(
    input.equipment,
    input.exercise.id,
  );

  findings.push(
    ...equipmentFindings.map((finding) =>
      prescriptionFinding(
        finding.severity,
        finding.code,
        finding.message,
        finding.targetId,
      ),
    ),
  );

  const missingEquipment = input.exercise.equipmentRequirements
    .map((requirement) =>
      evaluateEquipmentRequirement(input.equipment, requirement),
    )
    .filter((result) => !result.satisfied);

  findings.push(
    ...missingEquipment.flatMap((result) =>
      result.missingCapabilities.map((capability) =>
        prescriptionFinding(
          "error",
          "missing_required_equipment",
          `Prescription context is missing required equipment capability: ${capability}.`,
          input.exercise.id,
        ),
      ),
    ),
  );

  const prescriptionFindings = [
    ...validatePrescription(input.prescription),
    ...validatePrescriptionExerciseBinding(input.exercise, input.prescription),
  ];
  findings.push(...prescriptionFindings);

  if (equipmentFindings.some((finding) => finding.severity === "error")) {
    return { status: "INVALID_EQUIPMENT_INPUT", findings };
  }
  if (missingEquipment.length > 0) {
    return { status: "MISSING_REQUIRED_EQUIPMENT", findings };
  }
  if (prescriptionFindings.some(isPrescriptionErrorFinding)) {
    return { status: "INVALID_PRESCRIPTION", findings };
  }
  if (prescriptionFindings.some(isDoseErrorFinding)) {
    return { status: "INVALID_DOSE", findings };
  }
  if (prescriptionFindings.some(isExecutionErrorFinding)) {
    return { status: "UNRESOLVED_EXECUTION_REQUIREMENT", findings };
  }
  if (findings.some((finding) => finding.severity === "error")) {
    return { status: "INVALID_PRESCRIPTION", findings };
  }

  return { status: "VALID_PRESCRIPTION_CONTEXT", findings };
}

export function validateDose(
  dose: ExerciseDose,
  executionStandard?: ExecutionStandard,
  targetId?: string,
): readonly PrescriptionValidationFinding[] {
  const findings: PrescriptionValidationFinding[] = [];
  const record = asRecord(dose);

  if (!record) {
    return [
      prescriptionFinding(
        "error",
        "invalid_dose_object",
        "Exercise dose must be a structured object.",
        targetId,
      ),
    ];
  }

  const mode = record.mode;
  if (!isOneOf(mode, DOSE_MODES)) {
    return [
      prescriptionFinding(
        "error",
        "invalid_dose_mode",
        "Exercise dose must use a supported discriminated mode.",
        targetId,
      ),
    ];
  }

  findings.push(
    ...validateAllowedFields(
      record,
      DOSE_FIELDS[mode],
      "mode_incompatible_dose_field",
      `Dose mode ${mode}`,
      targetId,
    ),
  );

  switch (mode) {
    case "repetition_sets":
      findings.push(
        ...requireFields(record, ["sets", "repetitions"], targetId),
        ...validateCountTarget(record.sets, "sets", targetId),
        ...validateCountTarget(record.repetitions, "repetitions", targetId),
      );
      if (Object.hasOwn(record, "perSide") && typeof record.perSide !== "boolean") {
        findings.push(
          prescriptionFinding(
            "error",
            "invalid_dose_per_side_boolean",
            "perSide must be boolean when supplied.",
            targetId,
          ),
        );
      }
      if (
        record.perSide === true &&
        asRecord(record.laterality)?.kind !== "each_side"
      ) {
        findings.push(
          prescriptionFinding(
            "error",
            "invalid_dose_per_side_laterality",
            "Per-side repetition work requires each-side prescription laterality.",
            targetId,
          ),
        );
      }
      break;
    case "timed_hold":
      findings.push(
        ...requireFields(record, ["sets", "duration"], targetId),
        ...validateCountTarget(record.sets, "sets", targetId),
        ...validateSecondsTarget(record.duration, "duration", targetId),
      );
      break;
    case "breath_cycles":
      findings.push(
        ...requireFields(record, ["rounds", "breathCycles"], targetId),
        ...validateCountTarget(record.rounds, "rounds", targetId),
        ...validateBreathCycleTarget(
          record.breathCycles,
          "breathCycles",
          targetId,
        ),
      );
      if (
        Object.hasOwn(record, "breathingPhaseStandard") &&
        !isNonEmptyString(record.breathingPhaseStandard)
      ) {
        findings.push(
          prescriptionFinding(
            "error",
            "invalid_dose_breathing_phase_standard",
            "breathingPhaseStandard must be nonempty when supplied.",
            targetId,
          ),
        );
      }
      if (Object.hasOwn(record, "breathingCadence")) {
        findings.push(
          ...validateBreathingCadence(
            record.breathingCadence as BreathingCadencePrescription,
            targetId,
          ),
        );
      }
      break;
    case "distance_carry":
      findings.push(
        ...requireFields(
          record,
          ["trips", "distancePerTrip", "gaitControlStandard"],
          targetId,
        ),
        ...validateCountTarget(record.trips, "trips", targetId),
        ...validateMetresTarget(
          record.distancePerTrip,
          "distancePerTrip",
          targetId,
        ),
        ...requireNonEmptyString(
          record.gaitControlStandard,
          "invalid_dose_gait_control_standard",
          "gaitControlStandard must be nonempty for carry prescriptions.",
          targetId,
        ),
      );
      if (Object.hasOwn(record, "locomotorCadence")) {
        findings.push(
          ...validateLocomotorCadence(
            record.locomotorCadence as LocomotorCadencePrescription,
            targetId,
          ),
        );
      }
      break;
    case "timed_carry":
      findings.push(
        ...requireFields(
          record,
          ["trips", "durationPerTrip", "gaitControlStandard"],
          targetId,
        ),
        ...validateCountTarget(record.trips, "trips", targetId),
        ...validateSecondsTarget(
          record.durationPerTrip,
          "durationPerTrip",
          targetId,
        ),
        ...requireNonEmptyString(
          record.gaitControlStandard,
          "invalid_dose_gait_control_standard",
          "gaitControlStandard must be nonempty for carry prescriptions.",
          targetId,
        ),
      );
      if (Object.hasOwn(record, "locomotorCadence")) {
        findings.push(
          ...validateLocomotorCadence(
            record.locomotorCadence as LocomotorCadencePrescription,
            targetId,
          ),
        );
      }
      break;
    case "step_march":
      findings.push(
        ...requireFields(record, ["stationary", "marchControlStandard"], targetId),
        ...requireNonEmptyString(
          record.marchControlStandard,
          "invalid_dose_march_control_standard",
          "marchControlStandard must be nonempty for step or march prescriptions.",
          targetId,
        ),
      );
      if (record.stationary !== true) {
        findings.push(
          prescriptionFinding(
            "error",
            "invalid_dose_stationary_march_truth",
            "Step or march dose must explicitly remain stationary.",
            targetId,
          ),
        );
      }
      if (Object.hasOwn(record, "distance") || Object.hasOwn(record, "metres")) {
        findings.push(
          prescriptionFinding(
            "error",
            "mode_incompatible_stationary_distance",
            "A stationary march cannot claim distance or carry-distance credit.",
            targetId,
          ),
        );
      }
      if (Object.hasOwn(record, "steps") === Object.hasOwn(record, "duration")) {
        findings.push(
          prescriptionFinding(
            "error",
            "missing_dose_step_or_time_truth",
            "Step or march dose requires exactly one structured steps or time target.",
            targetId,
          ),
        );
      }
      if (Object.hasOwn(record, "steps")) {
        findings.push(...validateStepTarget(record.steps, "steps", targetId));
      }
      if (Object.hasOwn(record, "duration")) {
        findings.push(...validateSecondsTarget(record.duration, "duration", targetId));
      }
      if (
        Object.hasOwn(record, "alternation") &&
        !isOneOf(record.alternation, [
          "alternating",
          "same_side_repeated",
          "not_applicable",
        ] as const)
      ) {
        findings.push(
          prescriptionFinding(
            "error",
            "invalid_dose_march_alternation",
            "Step or march alternation must use a supported value.",
            targetId,
          ),
        );
      }
      if (Object.hasOwn(record, "marchCadence")) {
        findings.push(
          ...validateLocomotorCadence(
            record.marchCadence as LocomotorCadencePrescription,
            targetId,
          ),
        );
      }
      break;
    case "step_sets":
      findings.push(
        ...requireFields(record, ["sets", "steps", "stepCountInterpretation"], targetId),
        ...validateCountTarget(record.sets, "sets", targetId),
        ...validateStepTarget(record.steps, "steps", targetId),
        ...requireNonEmptyString(
          record.stepCountInterpretation,
          "invalid_dose_step_count_interpretation",
          "Step-set dose requires an explicit reviewed step-count interpretation.",
          targetId,
        ),
      );
      if (
        Object.hasOwn(record, "alternation") &&
        !isOneOf(record.alternation, [
          "alternating",
          "same_side_repeated",
          "not_applicable",
        ] as const)
      ) {
        findings.push(
          prescriptionFinding(
            "error",
            "invalid_dose_step_set_alternation",
            "Step-set alternation must use a supported value.",
            targetId,
          ),
        );
      }
      if (Object.hasOwn(record, "stepCadence")) {
        findings.push(
          ...validateLocomotorCadence(
            record.stepCadence as LocomotorCadencePrescription,
            targetId,
          ),
        );
      }
      break;
  }

  if (record.rest !== undefined) {
    findings.push(...validateSecondsTarget(record.rest, "rest", targetId));
  }
  if (record.load !== undefined) {
    findings.push(...validateLoadTarget(record.load as LoadTarget, targetId));
  }
  if (record.effort !== undefined) {
    findings.push(
      ...validateEffortTarget(
        record.effort as EffortTarget,
        requiredCriterionIds(executionStandard),
        targetId,
      ),
    );
  }
  if (record.range !== undefined) {
    findings.push(...validateRangePrescription(record.range as RangePrescription, targetId));
  }
  if (record.tempo !== undefined) {
    findings.push(...validateTempo(record.tempo as TempoPrescription, targetId));
  }
  if (record.support !== undefined) {
    findings.push(
      ...validateSupportPrescription(record.support as SupportPrescription, targetId),
    );
  }
  if (record.lever !== undefined) {
    findings.push(...validateLeverPrescription(record.lever as LeverPrescription, targetId));
  }
  if (record.laterality !== undefined) {
    findings.push(
      ...validatePrescriptionLaterality(
        record.laterality as PrescriptionLaterality,
        targetId,
      ),
    );
  }
  if (record.sideBehavior !== undefined) {
    findings.push(
      ...validatePrescriptionSideBehavior(
        record.sideBehavior as PrescriptionSideBehavior,
        targetId,
      ),
    );
  }
  findings.push(...validateDoseSideConsistency(record, targetId));

  return findings;
}

export function validateExecutionStandard(
  standard: ExecutionStandard,
  targetId?: string,
): readonly PrescriptionValidationFinding[] {
  const findings: PrescriptionValidationFinding[] = [];
  const record = asRecord(standard);
  if (!record) {
    return [
      prescriptionFinding(
        "error",
        "invalid_execution_standard_object",
        "Execution standard must be a structured object.",
        targetId,
      ),
    ];
  }

  findings.push(
    ...validateAllowedFields(
      record,
      [
        "alignmentPriorityIds",
        "assessmentPriorityIds",
        "painResponseRequirementIds",
        "exerciseMechanicsIntent",
        "sideBehavior",
        "criteria",
        "provenance",
      ],
      "invalid_execution_standard_field",
      "Execution standard",
      targetId,
    ),
    ...validateStringIdArray(
      record.alignmentPriorityIds,
      "alignmentPriorityIds",
      "invalid_execution_alignment_priority_id",
      targetId,
    ),
    ...validateStringIdArray(
      record.assessmentPriorityIds,
      "assessmentPriorityIds",
      "invalid_execution_assessment_priority_id",
      targetId,
    ),
    ...validateStringIdArray(
      record.painResponseRequirementIds,
      "painResponseRequirementIds",
      "invalid_execution_pain_response_requirement_id",
      targetId,
    ),
    ...requireNonEmptyString(
      record.exerciseMechanicsIntent,
      "missing_execution_mechanics_intent",
      "Execution standard requires an explicit exercise mechanics intent.",
      targetId,
    ),
    ...validateEvidenceProvenance(
      record.provenance,
      "execution standard provenance",
      targetId,
    ),
  );

  if (record.sideBehavior !== undefined) {
    findings.push(
      ...validatePrescriptionSideBehavior(
        record.sideBehavior as PrescriptionSideBehavior,
        targetId,
      ),
    );
  }

  if (!Array.isArray(record.criteria)) {
    findings.push(
      prescriptionFinding(
        "error",
        "invalid_execution_criteria_array",
        "Execution standard criteria must be an array.",
        targetId,
      ),
    );
    return findings;
  }

  const ids = new Set<string>();
  for (const criterion of record.criteria) {
    const criterionRecord = asRecord(criterion);
    const criterionId = stringOrUndefined(criterionRecord?.id);
    if (criterionId && ids.has(criterionId)) {
      findings.push(
        prescriptionFinding(
          "error",
          "duplicate_execution_criterion_id",
          "Execution quality criteria must have unique ids.",
          targetId,
        ),
      );
    }
    if (criterionId) {
      ids.add(criterionId);
    }
    findings.push(
      ...validateCriterion(criterion as ExecutionQualityCriterion, targetId),
    );
  }

  return findings;
}

export function validateExercisePerformanceRecord(
  performance: ExercisePerformanceRecord,
): readonly PrescriptionValidationFinding[] {
  const findings: PrescriptionValidationFinding[] = [];
  const record = asRecord(performance);
  if (!record) {
    return [
      prescriptionFinding(
        "error",
        "invalid_performance_object",
        "Exercise performance record must be a structured object.",
      ),
    ];
  }

  const targetId = stringOrUndefined(record.exerciseId);
  findings.push(
    ...validateAllowedFields(
      record,
      [
        "performanceRecordId",
        "prescriptionId",
        "exerciseId",
        "occurredAt",
        "completionStatus",
        "actualDose",
        "actualTiming",
        "qualityObservations",
        "unresolvedPainResponseEvidenceIds",
        "trainingResponseObservationIds",
        "recoveryEvidenceIds",
        "recoveryStatus",
        "substitutions",
        "notes",
        "provenance",
      ],
      "invalid_performance_field",
      "Exercise performance record",
      targetId,
    ),
    ...requireNonEmptyString(
      record.performanceRecordId,
      "missing_performance_record_id",
      "Performance record requires a stable performanceRecordId.",
      targetId,
    ),
    ...requireNonEmptyString(
      record.prescriptionId,
      "missing_performance_prescription_id",
      "Performance record requires a stable prescriptionId.",
      targetId,
    ),
    ...requireNonEmptyString(
      record.exerciseId,
      "missing_performance_exercise_id",
      "Performance record requires a stable exerciseId.",
      targetId,
    ),
    ...validateExplicitIsoField(
      record.occurredAt,
      "invalid_performance_occurred_at",
      "Performance occurredAt must be a valid ISO-8601 timestamp with explicit timezone.",
      targetId,
    ),
    ...validateEvidenceProvenance(
      record.provenance,
      "performance record provenance",
      targetId,
    ),
    ...validateStringIdArray(
      record.unresolvedPainResponseEvidenceIds,
      "unresolvedPainResponseEvidenceIds",
      "invalid_performance_pain_response_id",
      targetId,
    ),
    ...validateStringIdArray(
      record.trainingResponseObservationIds,
      "trainingResponseObservationIds",
      "invalid_performance_training_response_observation_id",
      targetId,
    ),
    ...validateStringIdArray(
      record.recoveryEvidenceIds,
      "recoveryEvidenceIds",
      "invalid_performance_recovery_evidence_id",
      targetId,
    ),
    ...validateNotesArray(record.notes, "performance notes", targetId),
  );

  if (!isOneOf(record.completionStatus, COMPLETION_STATUSES)) {
    findings.push(
      prescriptionFinding(
        "error",
        "invalid_performance_completion_status",
        "Performance completionStatus must use a supported value.",
        targetId,
      ),
    );
  }
  if (
    Object.hasOwn(record, "recoveryStatus") &&
    !isOneOf(record.recoveryStatus, RECOVERY_STATUSES)
  ) {
    findings.push(
      prescriptionFinding(
        "error",
        "invalid_performance_recovery_status",
        "Performance recoveryStatus must use a supported value.",
        targetId,
      ),
    );
  }
  if (Object.hasOwn(record, "actualDose")) {
    findings.push(...validateDose(record.actualDose as ExerciseDose, undefined, targetId));
  }
  if (Object.hasOwn(record, "actualTiming")) {
    findings.push(
      ...validatePerformanceTimingObservation(
        record.actualTiming as ExercisePerformanceTimingObservation,
        targetId,
      ),
    );
  }

  findings.push(
    ...validateQualityObservations(record.qualityObservations, targetId),
    ...validateSubstitutions(record.substitutions, targetId),
  );

  return findings;
}

export function validateExercisePerformanceContext(input: {
  readonly prescription: ExercisePrescription;
  readonly performance: ExercisePerformanceRecord;
}): ExercisePerformanceContextValidationResult {
  const findings = [
    ...validateExercisePerformanceRecord(input.performance),
    ...validatePerformancePrescriptionBinding(input.prescription, input.performance),
  ];

  return {
    status: findings.some((finding) => finding.severity === "error")
      ? "INVALID_PERFORMANCE_RECORD"
      : "VALID_PERFORMANCE_CONTEXT",
    findings,
  };
}

function validatePerformanceTimingObservation(
  timing: ExercisePerformanceTimingObservation,
  targetId?: string,
): readonly PrescriptionValidationFinding[] {
  const record = asRecord(timing);
  if (!record) {
    return [
      objectFinding(
        "invalid_performance_timing_object",
        "Performance timing observation",
        targetId,
      ),
    ];
  }
  const findings = validateAllowedFields(
    record,
    [
      "actualTempo",
      "actualDuration",
      "timingControlObservationCriterionIds",
      "prescribedTempoAssumedActual",
      "prescribedDurationAssumedActual",
      "notes",
    ],
    "invalid_performance_timing_field",
    "Performance timing observation",
    targetId,
  );
  if (record.prescribedTempoAssumedActual !== false) {
    findings.push(
      prescriptionFinding(
        "error",
        "invalid_prescribed_tempo_actual_assumption",
        "Performance timing must not assume prescribed tempo was actual tempo.",
        targetId,
      ),
    );
  }
  if (record.prescribedDurationAssumedActual !== false) {
    findings.push(
      prescriptionFinding(
        "error",
        "invalid_prescribed_duration_actual_assumption",
        "Performance timing must not assume prescribed duration was actual duration.",
        targetId,
      ),
    );
  }
  findings.push(
    ...validateStringIdArray(
      record.timingControlObservationCriterionIds,
      "timingControlObservationCriterionIds",
      "invalid_performance_timing_criterion_id",
      targetId,
    ),
  );
  if (Object.hasOwn(record, "actualTempo")) {
    findings.push(
      ...validateActualTempoObservation(record.actualTempo as ActualTempoObservation, targetId),
    );
  }
  if (Object.hasOwn(record, "actualDuration")) {
    findings.push(
      ...validateActualDurationObservation(
        record.actualDuration as ActualDurationObservation,
        targetId,
      ),
    );
  }
  if (Object.hasOwn(record, "notes")) {
    findings.push(...validateNotesArray(record.notes, "performance timing notes", targetId));
  }
  return findings;
}

function validateActualTempoObservation(
  observation: ActualTempoObservation,
  targetId?: string,
): readonly PrescriptionValidationFinding[] {
  const record = asRecord(observation);
  if (!record) {
    return [objectFinding("invalid_actual_tempo_object", "Actual tempo", targetId)];
  }
  if (!isOneOf(record.kind, ACTUAL_TEMPO_OBSERVATION_KINDS)) {
    return [enumFinding("invalid_actual_tempo_kind", targetId)];
  }
  if (record.kind === "observed") {
    return [
      ...validateAllowedFields(
        record,
        ["kind", "tempo", "provenance"],
        "invalid_actual_tempo_field",
        "Actual tempo",
        targetId,
      ),
      ...validateTempo(record.tempo as TempoPrescription, targetId),
      ...validateEvidenceProvenance(record.provenance, "actual tempo provenance", targetId),
    ];
  }
  return [
    ...validateAllowedFields(
      record,
      ["kind", "reason", "provenance"],
      "invalid_actual_tempo_field",
      "Actual tempo",
      targetId,
    ),
    ...requireNonEmptyString(
      record.reason,
      "invalid_actual_tempo_reason",
      "Actual tempo unknown/not-observed states require a reason.",
      targetId,
    ),
    ...validateEvidenceProvenance(record.provenance, "actual tempo provenance", targetId),
  ];
}

function validateActualDurationObservation(
  observation: ActualDurationObservation,
  targetId?: string,
): readonly PrescriptionValidationFinding[] {
  const record = asRecord(observation);
  if (!record) {
    return [objectFinding("invalid_actual_duration_object", "Actual duration", targetId)];
  }
  if (!isOneOf(record.kind, ACTUAL_DURATION_OBSERVATION_KINDS)) {
    return [enumFinding("invalid_actual_duration_kind", targetId)];
  }
  if (record.kind === "observed_seconds") {
    return [
      ...validateAllowedFields(
        record,
        ["kind", "seconds", "provenance"],
        "invalid_actual_duration_field",
        "Actual duration",
        targetId,
      ),
      ...validateNumber(record.seconds, "actual duration seconds", targetId, {
        integer: false,
        positive: true,
      }),
      ...validateEvidenceProvenance(record.provenance, "actual duration provenance", targetId),
    ];
  }
  return [
    ...validateAllowedFields(
      record,
      ["kind", "reason", "provenance"],
      "invalid_actual_duration_field",
      "Actual duration",
      targetId,
    ),
    ...requireNonEmptyString(
      record.reason,
      "invalid_actual_duration_reason",
      "Actual duration unknown/not-observed states require a reason.",
      targetId,
    ),
    ...validateEvidenceProvenance(record.provenance, "actual duration provenance", targetId),
  ];
}

export function validateProgressionEvidence(
  evidence: ProgressionEvidence,
  context?: {
    readonly prescription?: ExercisePrescription;
    readonly performanceRecords?: readonly ExercisePerformanceRecord[];
  },
): readonly PrescriptionValidationFinding[] {
  const findings: PrescriptionValidationFinding[] = [];
  const record = asRecord(evidence);
  if (!record) {
    return [
      prescriptionFinding(
        "error",
        "invalid_progression_evidence_object",
        "Progression evidence must be a structured object.",
      ),
    ];
  }

  const targetId = stringOrUndefined(record.exerciseId);
  findings.push(
    ...validateAllowedFields(
      record,
      [
        "prescriptionId",
        "exerciseId",
        "doseEvidence",
        "executionQualityEvidence",
        "painResponseEvidence",
        "recoveryEvidence",
        "continuityRunwayEvidence",
        "repeatedEvidence",
        "evidenceRecordIds",
        "notes",
      ],
      "invalid_progression_evidence_field",
      "Progression evidence",
      targetId,
    ),
    ...requireNonEmptyString(
      record.prescriptionId,
      "missing_progression_prescription_id",
      "Progression evidence requires a stable prescriptionId.",
      targetId,
    ),
    ...requireNonEmptyString(
      record.exerciseId,
      "missing_progression_exercise_id",
      "Progression evidence requires a stable exerciseId.",
      targetId,
    ),
    ...validateStringIdArray(
      record.evidenceRecordIds,
      "evidenceRecordIds",
      "invalid_progression_evidence_record_id",
      targetId,
    ),
    ...validateNotesArray(record.notes, "progression notes", targetId),
  );

  if (!isOneOf(record.doseEvidence, DOSE_EVIDENCE_STATUSES)) {
    findings.push(enumFinding("invalid_progression_dose_evidence", targetId));
  }
  if (!isOneOf(record.executionQualityEvidence, EXECUTION_EVIDENCE_STATUSES)) {
    findings.push(enumFinding("invalid_progression_execution_quality_evidence", targetId));
  }
  if (!isOneOf(record.painResponseEvidence, PAIN_RESPONSE_EVIDENCE_STATUSES)) {
    findings.push(enumFinding("invalid_progression_pain_response_evidence", targetId));
  }
  if (!isOneOf(record.recoveryEvidence, RECOVERY_STATUSES)) {
    findings.push(enumFinding("invalid_progression_recovery_evidence", targetId));
  }
  if (!isOneOf(record.repeatedEvidence, REPEATED_EVIDENCE_STATUSES)) {
    findings.push(enumFinding("invalid_progression_repeated_evidence", targetId));
  }

  findings.push(
    ...validateContinuityRunwayEvidence(
      record.continuityRunwayEvidence,
      targetId,
    ),
  );

  if (
    context?.prescription &&
    isNonEmptyString(record.prescriptionId) &&
    record.prescriptionId !== context.prescription.prescriptionId
  ) {
    findings.push(
      prescriptionFinding(
        "error",
        "invalid_progression_prescription_mismatch",
        "Progression evidence prescriptionId must match the supplied prescription.",
        targetId,
      ),
    );
  }
  if (
    context?.prescription &&
    isNonEmptyString(record.exerciseId) &&
    record.exerciseId !== context.prescription.exerciseId
  ) {
    findings.push(
      prescriptionFinding(
        "error",
        "invalid_progression_exercise_mismatch",
        "Progression evidence exerciseId must match the supplied prescription.",
        targetId,
      ),
    );
  }
  if (context?.performanceRecords && Array.isArray(record.evidenceRecordIds)) {
    const knownIds = new Set(
      context.performanceRecords.map((performance) => performance.performanceRecordId),
    );
    for (const id of record.evidenceRecordIds) {
      if (isNonEmptyString(id) && !knownIds.has(id)) {
        findings.push(
          prescriptionFinding(
            "error",
            "invalid_progression_unknown_evidence_record_id",
            `Progression evidence references unknown performance record ${id}.`,
            targetId,
          ),
        );
      }
    }
  }

  return findings;
}

function validatePrescriptionExerciseBinding(
  exercise: ExerciseDefinition,
  prescription: ExercisePrescription,
): readonly PrescriptionValidationFinding[] {
  const record = asRecord(prescription);
  if (!record || !isNonEmptyString(record.exerciseId)) {
    return [];
  }
  if (record.exerciseId !== exercise.id) {
    return [
      prescriptionFinding(
        "error",
        "invalid_prescription_exercise_mismatch",
        "Prescription exerciseId must match the exercise definition being validated.",
        exercise.id,
      ),
    ];
  }
  return [];
}

function validateIntendedProgressionAxes(
  axes: unknown,
  targetId?: string,
): readonly PrescriptionValidationFinding[] {
  if (!Array.isArray(axes)) {
    return [
      prescriptionFinding(
        "error",
        "invalid_prescription_progression_axes_array",
        "intendedProgressionAxes must be an array of canonical progression axes.",
        targetId,
      ),
    ];
  }

  const findings: PrescriptionValidationFinding[] = [];
  const seen = new Set<string>();
  for (const axis of axes) {
    if (!isProgressionAxis(axis)) {
      findings.push(
        prescriptionFinding(
          "error",
          "invalid_prescription_progression_axis",
          "intendedProgressionAxes may contain only canonical progression axes.",
          targetId,
        ),
      );
      continue;
    }
    if (seen.has(axis)) {
      findings.push(
        prescriptionFinding(
          "error",
          "duplicate_prescription_progression_axis",
          "intendedProgressionAxes must not contain duplicate axes.",
          targetId,
        ),
      );
    }
    seen.add(axis);
  }
  return findings;
}

function validateCountTarget(
  target: unknown,
  label: string,
  targetId?: string,
): readonly PrescriptionValidationFinding[] {
  return validateNumericTarget(target, label, targetId, {
    integer: true,
    positive: true,
    unit: "count",
  });
}

function validateSecondsTarget(
  target: unknown,
  label: string,
  targetId?: string,
): readonly PrescriptionValidationFinding[] {
  return validateNumericTarget(target, label, targetId, {
    integer: false,
    positive: true,
    unit: "seconds",
  });
}

function validateMetresTarget(
  target: unknown,
  label: string,
  targetId?: string,
): readonly PrescriptionValidationFinding[] {
  return validateNumericTarget(target, label, targetId, {
    integer: false,
    positive: true,
    unit: "metres",
  });
}

function validateBreathCycleTarget(
  target: unknown,
  label: string,
  targetId?: string,
): readonly PrescriptionValidationFinding[] {
  return validateNumericTarget(target, label, targetId, {
    integer: true,
    positive: true,
    unit: "breath_cycles",
  });
}

function validateStepTarget(
  target: unknown,
  label: string,
  targetId?: string,
): readonly PrescriptionValidationFinding[] {
  return validateNumericTarget(target, label, targetId, {
    integer: true,
    positive: true,
    unit: "steps",
  });
}

function validateNumericTarget(
  target: unknown,
  label: string,
  targetId: string | undefined,
  rules: {
    readonly integer: boolean;
    readonly positive: boolean;
    readonly unit: string;
  },
): readonly PrescriptionValidationFinding[] {
  const findings: PrescriptionValidationFinding[] = [];
  const record = asRecord(target as NumericTarget<string>);
  if (!record) {
    return [
      prescriptionFinding(
        "error",
        "invalid_target_object",
        `${label} target must be a structured numeric target.`,
        targetId,
      ),
    ];
  }

  if (record.kind === "unknown") {
    findings.push(
      ...validateAllowedFields(
        record,
        ["kind", "reason", "unit"],
        "invalid_target_field",
        `${label} unknown target`,
        targetId,
      ),
      ...requireNonEmptyString(
        record.reason,
        "invalid_target_unknown_reason",
        `${label} unknown target requires a nonempty reason.`,
        targetId,
      ),
      ...validateOptionalTargetUnit(record.unit, rules.unit, label, targetId),
    );
    if (
      Object.hasOwn(record, "value") ||
      Object.hasOwn(record, "min") ||
      Object.hasOwn(record, "max")
    ) {
      findings.push(
        prescriptionFinding(
          "error",
          "invalid_target_unknown_has_numeric_value",
          `${label} unknown/not-prescribed target must not carry a hidden numeric value.`,
          targetId,
        ),
      );
    }
    return findings;
  }

  if (record.kind === "not_prescribed") {
    findings.push(
      ...validateAllowedFields(
        record,
        ["kind", "reason", "unit"],
        "invalid_target_field",
        `${label} not-prescribed target`,
        targetId,
      ),
      ...validateOptionalStringField(record.reason, "reason", targetId),
      ...validateOptionalTargetUnit(record.unit, rules.unit, label, targetId),
    );
    if (
      Object.hasOwn(record, "value") ||
      Object.hasOwn(record, "min") ||
      Object.hasOwn(record, "max")
    ) {
      findings.push(
        prescriptionFinding(
          "error",
          "invalid_target_unknown_has_numeric_value",
          `${label} unknown/not-prescribed target must not carry a hidden numeric value.`,
          targetId,
        ),
      );
    }
    return findings;
  }

  if (record.kind === "exact") {
    findings.push(
      ...validateAllowedFields(
        record,
        ["kind", "value", "unit"],
        "invalid_target_field",
        `${label} exact target`,
        targetId,
      ),
      ...validateRequiredTargetUnit(record.unit, rules.unit, label, targetId),
      ...validateNumber(record.value, label, targetId, rules),
    );
    return findings;
  }

  if (record.kind === "range") {
    findings.push(
      ...validateAllowedFields(
        record,
        ["kind", "min", "max", "unit"],
        "invalid_target_field",
        `${label} range target`,
        targetId,
      ),
      ...validateRequiredTargetUnit(record.unit, rules.unit, label, targetId),
      ...validateNumber(record.min, `${label} minimum`, targetId, rules),
      ...validateNumber(record.max, `${label} maximum`, targetId, rules),
    );
    if (
      typeof record.min === "number" &&
      typeof record.max === "number" &&
      record.min > record.max
    ) {
      findings.push(
        prescriptionFinding(
          "error",
          "invalid_target_range_order",
          `${label} target minimum must not exceed maximum.`,
          targetId,
        ),
      );
    }
    return findings;
  }

  return [
    prescriptionFinding(
      "error",
      "invalid_target_kind",
      `${label} target must use exact, range, unknown, or not_prescribed.`,
      targetId,
    ),
  ];
}

function validateNumber(
  value: unknown,
  label: string,
  targetId: string | undefined,
  rules: {
    readonly integer: boolean;
    readonly positive: boolean;
  },
): readonly PrescriptionValidationFinding[] {
  const findings: PrescriptionValidationFinding[] = [];
  if (typeof value !== "number" || !Number.isFinite(value)) {
    findings.push(
      prescriptionFinding(
        "error",
        "invalid_target_non_finite",
        `${label} must be finite numeric target data.`,
        targetId,
      ),
    );
    return findings;
  }
  if (rules.positive && value <= 0) {
    findings.push(
      prescriptionFinding(
        "error",
        "invalid_target_non_positive",
        `${label} must be positive when prescribed; omitted is not zero.`,
        targetId,
      ),
    );
  }
  if (rules.integer && !Number.isInteger(value)) {
    findings.push(
      prescriptionFinding(
        "error",
        "invalid_target_non_integer_count",
        `${label} count target must use integers.`,
        targetId,
      ),
    );
  }
  return findings;
}

function validateRequiredTargetUnit(
  unit: unknown,
  expectedUnit: string,
  label: string,
  targetId?: string,
): readonly PrescriptionValidationFinding[] {
  if (unit !== expectedUnit) {
    return [
      prescriptionFinding(
        "error",
        "invalid_target_unit",
        `${label} target must use ${expectedUnit} units.`,
        targetId,
      ),
    ];
  }
  return [];
}

function validateOptionalTargetUnit(
  unit: unknown,
  expectedUnit: string,
  label: string,
  targetId?: string,
): readonly PrescriptionValidationFinding[] {
  if (unit !== undefined && unit !== expectedUnit) {
    return [
      prescriptionFinding(
        "error",
        "invalid_target_unit",
        `${label} target optional unit must use ${expectedUnit} when supplied.`,
        targetId,
      ),
    ];
  }
  return [];
}

function validateSupportPrescription(
  support: SupportPrescription,
  targetId?: string,
): readonly PrescriptionValidationFinding[] {
  const record = asRecord(support);
  if (!record) {
    return [objectFinding("invalid_support_object", "Support prescription", targetId)];
  }
  const findings = validateAllowedFields(
    record,
    ["level", "surface", "side", "description"],
    "invalid_support_field",
    "Support prescription",
    targetId,
  );
  if (!isOneOf(record.level, SUPPORT_LEVELS)) {
    findings.push(enumFinding("invalid_support_level", targetId));
  }
  if (Object.hasOwn(record, "surface") && !isOneOf(record.surface, SUPPORT_SURFACES)) {
    findings.push(enumFinding("invalid_support_surface", targetId));
  }
  if (Object.hasOwn(record, "side") && !isValidSide(record.side)) {
    findings.push(enumFinding("invalid_side_value", targetId));
  }
  if (Object.hasOwn(record, "description")) {
    findings.push(...validateOptionalStringField(record.description, "description", targetId));
  }
  return findings;
}

function validateLeverPrescription(
  lever: LeverPrescription,
  targetId?: string,
): readonly PrescriptionValidationFinding[] {
  const record = asRecord(lever);
  if (!record) {
    return [objectFinding("invalid_lever_object", "Lever prescription", targetId)];
  }
  const findings = validateAllowedFields(
    record,
    ["state", "variant", "description"],
    "invalid_lever_field",
    "Lever prescription",
    targetId,
  );
  if (!isOneOf(record.state, LEVER_STATES)) {
    findings.push(enumFinding("invalid_lever_state", targetId));
  }
  if (Object.hasOwn(record, "variant")) {
    findings.push(...validateVariantReference(record.variant as VariantReference, targetId));
  }
  if (Object.hasOwn(record, "description")) {
    findings.push(...validateOptionalStringField(record.description, "description", targetId));
  }
  return findings;
}

function validateVariantReference(
  variant: VariantReference,
  targetId?: string,
): readonly PrescriptionValidationFinding[] {
  const record = asRecord(variant);
  if (!record) {
    return [objectFinding("invalid_lever_variant_object", "Variant reference", targetId)];
  }
  return [
    ...validateAllowedFields(
      record,
      ["exerciseId", "variantId", "description"],
      "invalid_lever_variant_field",
      "Variant reference",
      targetId,
    ),
    ...requireNonEmptyString(
      record.exerciseId,
      "invalid_lever_variant_exercise_id",
      "Variant reference requires a nonempty exerciseId.",
      targetId,
    ),
    ...requireNonEmptyString(
      record.variantId,
      "invalid_lever_variant_id",
      "Variant reference requires a nonempty variantId.",
      targetId,
    ),
    ...requireNonEmptyString(
      record.description,
      "invalid_lever_variant_description",
      "Variant reference requires a nonempty description.",
      targetId,
    ),
  ];
}

function validateRangePrescription(
  range: RangePrescription,
  targetId?: string,
): readonly PrescriptionValidationFinding[] {
  const record = asRecord(range);
  if (!record) {
    return [objectFinding("invalid_range_object", "Range prescription", targetId)];
  }
  const findings: PrescriptionValidationFinding[] = [];
  if (!isOneOf(record.kind, RANGE_KINDS)) {
    findings.push(enumFinding("invalid_range_kind", targetId));
    return findings;
  }
  const allowedFields =
    record.kind === "custom_reviewed"
      ? ["kind", "reviewedRangeId", "description"]
      : record.kind === "intentionally_partial"
        ? ["kind", "description"]
        : ["kind", "description"];
  findings.push(
    ...validateAllowedFields(
      record,
      allowedFields,
      "invalid_range_field",
      "Range prescription",
      targetId,
    ),
  );
  if (record.kind === "intentionally_partial") {
    findings.push(
      ...requireNonEmptyString(
        record.description,
        "invalid_range_description",
        "Intentionally partial range requires a nonempty description.",
        targetId,
      ),
    );
  }
  if (record.kind === "custom_reviewed") {
    findings.push(
      ...requireNonEmptyString(
        record.reviewedRangeId,
        "invalid_range_reviewed_id",
        "Custom reviewed range requires a nonempty reviewedRangeId.",
        targetId,
      ),
      ...requireNonEmptyString(
        record.description,
        "invalid_range_description",
        "Custom reviewed range requires a nonempty description.",
        targetId,
      ),
    );
  }
  if (
    (record.kind === "full_available" || record.kind === "unknown") &&
    Object.hasOwn(record, "description")
  ) {
    findings.push(...validateOptionalStringField(record.description, "description", targetId));
  }
  return findings;
}

function validateTempo(
  tempo: TempoPrescription,
  targetId?: string,
): readonly PrescriptionValidationFinding[] {
  const record = asRecord(tempo);
  if (!record) {
    return [objectFinding("invalid_tempo_object", "Tempo prescription", targetId)];
  }

  if (!Object.hasOwn(record, "kind")) {
    return [
      prescriptionFinding(
        "error",
        "legacy_tempo_requires_adapter",
        "Legacy tempo fields must be converted with adaptLegacyTempoPrescription before validation.",
        targetId,
      ),
    ];
  }

  if (!isOneOf(record.kind, TEMPO_KINDS)) {
    return [enumFinding("invalid_tempo_kind", targetId)];
  }

  switch (record.kind) {
    case "repetition_phase_tempo": {
      const findings = validateAllowedFields(
        record,
        [
          "kind",
          "eccentric",
          "lengthenedTransition",
          "concentric",
          "shortenedTransition",
          "provenance",
          "reviewedTimingStandardRef",
          "description",
        ],
        "invalid_tempo_field",
        "Repetition phase tempo",
        targetId,
      );
      findings.push(
        ...validateMovementPhaseTempoTarget(record.eccentric, "eccentric", targetId),
        ...validateMovementPhaseTempoTarget(
          record.lengthenedTransition,
          "lengthenedTransition",
          targetId,
        ),
        ...validateMovementPhaseTempoTarget(record.concentric, "concentric", targetId),
        ...validateMovementPhaseTempoTarget(
          record.shortenedTransition,
          "shortenedTransition",
          targetId,
        ),
        ...validateEvidenceProvenance(record.provenance, "tempo provenance", targetId),
      );
      if (Object.hasOwn(record, "reviewedTimingStandardRef")) {
        findings.push(
          ...validateOptionalStringField(
            record.reviewedTimingStandardRef,
            "reviewedTimingStandardRef",
            targetId,
          ),
        );
      }
      if (Object.hasOwn(record, "description")) {
        findings.push(...validateOptionalStringField(record.description, "description", targetId));
      }
      return findings;
    }
    case "intent_only": {
      const findings = validateAllowedFields(
        record,
        ["kind", "intent", "provenance", "reviewedTimingStandardRef", "description"],
        "invalid_tempo_field",
        "Intent-only tempo",
        targetId,
      );
      if (!isOneOf(record.intent, TEMPO_INTENTS)) {
        findings.push(enumFinding("invalid_tempo_intent", targetId));
      }
      findings.push(...validateEvidenceProvenance(record.provenance, "tempo provenance", targetId));
      if (Object.hasOwn(record, "reviewedTimingStandardRef")) {
        findings.push(
          ...validateOptionalStringField(
            record.reviewedTimingStandardRef,
            "reviewedTimingStandardRef",
            targetId,
          ),
        );
      }
      if (Object.hasOwn(record, "description")) {
        findings.push(...validateOptionalStringField(record.description, "description", targetId));
      }
      return findings;
    }
    case "not_prescribed":
    case "not_applicable":
    case "unknown": {
      const findings = validateAllowedFields(
        record,
        ["kind", "reason", "provenance", "description"],
        "invalid_tempo_field",
        "Non-phase tempo",
        targetId,
      );
      findings.push(
        ...requireNonEmptyString(
          record.reason,
          "invalid_tempo_reason",
          "Tempo not-prescribed, not-applicable, and unknown states require an explicit reason.",
          targetId,
        ),
        ...validateEvidenceProvenance(record.provenance, "tempo provenance", targetId),
      );
      if (Object.hasOwn(record, "description")) {
        findings.push(...validateOptionalStringField(record.description, "description", targetId));
      }
      return findings;
    }
    case "legacy_compatibility": {
      const findings = validateAllowedFields(
        record,
        [
          "kind",
          "legacy",
          "migrationStatus",
          "authoritative",
          "reason",
          "provenance",
          "description",
        ],
        "invalid_tempo_field",
        "Legacy compatibility tempo",
        targetId,
      );
      if (record.authoritative !== false) {
        findings.push(
          prescriptionFinding(
            "error",
            "invalid_legacy_tempo_authority",
            "Legacy tempo compatibility records must be explicitly non-authoritative.",
            targetId,
          ),
        );
      }
      if (!isOneOf(record.migrationStatus, LEGACY_TEMPO_MIGRATION_STATUSES)) {
        findings.push(enumFinding("invalid_legacy_tempo_migration_status", targetId));
      }
      findings.push(
        ...validateLegacyTempoObject(record.legacy, targetId),
        ...requireNonEmptyString(
          record.reason,
          "invalid_legacy_tempo_reason",
          "Legacy tempo compatibility requires an explicit reason.",
          targetId,
        ),
        ...validateEvidenceProvenance(record.provenance, "tempo provenance", targetId),
      );
      if (Object.hasOwn(record, "description")) {
        findings.push(...validateOptionalStringField(record.description, "description", targetId));
      }
      return findings;
    }
  }
}

function validateMovementPhaseTempoTarget(
  target: unknown,
  label: string,
  targetId?: string,
): readonly PrescriptionValidationFinding[] {
  const record = asRecord(target as MovementPhaseTempoTarget);
  if (!record) {
    return [objectFinding("invalid_tempo_phase_target_object", label, targetId)];
  }
  if (!isOneOf(record.kind, MOVEMENT_PHASE_TARGET_KINDS)) {
    return [enumFinding("invalid_tempo_phase_target_kind", targetId)];
  }
  switch (record.kind) {
    case "exact_seconds":
      return [
        ...validateAllowedFields(
          record,
          ["kind", "seconds"],
          "invalid_tempo_phase_target_field",
          label,
          targetId,
        ),
        ...validateNumber(record.seconds, `${label} tempo seconds`, targetId, {
          integer: false,
          positive: true,
        }),
      ];
    case "seconds_range": {
      const findings = [
        ...validateAllowedFields(
          record,
          ["kind", "minSeconds", "maxSeconds"],
          "invalid_tempo_phase_target_field",
          label,
          targetId,
        ),
        ...validateNumber(record.minSeconds, `${label} tempo min seconds`, targetId, {
          integer: false,
          positive: true,
        }),
        ...validateNumber(record.maxSeconds, `${label} tempo max seconds`, targetId, {
          integer: false,
          positive: true,
        }),
      ];
      if (
        typeof record.minSeconds === "number" &&
        typeof record.maxSeconds === "number" &&
        record.minSeconds > record.maxSeconds
      ) {
        findings.push(
          prescriptionFinding(
            "error",
            "invalid_tempo_phase_range_order",
            "Tempo phase seconds range minimum cannot exceed maximum.",
            targetId,
          ),
        );
      }
      return findings;
    }
    case "intent_only": {
      const findings = validateAllowedFields(
        record,
        ["kind", "intent"],
        "invalid_tempo_phase_target_field",
        label,
        targetId,
      );
      if (!isOneOf(record.intent, TEMPO_INTENTS)) {
        findings.push(enumFinding("invalid_tempo_phase_intent", targetId));
      }
      return findings;
    }
    case "not_prescribed":
    case "unknown":
      return [
        ...validateAllowedFields(
          record,
          ["kind", "reason"],
          "invalid_tempo_phase_target_field",
          label,
          targetId,
        ),
        ...requireNonEmptyString(
          record.reason,
          "invalid_tempo_phase_reason",
          "Tempo phase not-prescribed and unknown targets require a reason.",
          targetId,
        ),
      ];
  }
}

function validateLegacyTempoObject(
  legacy: unknown,
  targetId?: string,
): readonly PrescriptionValidationFinding[] {
  const record = asRecord(legacy);
  if (!record) {
    return [objectFinding("invalid_legacy_tempo_object", "Legacy tempo", targetId)];
  }
  const findings = validateAllowedFields(
    record,
    [
      "eccentricSeconds",
      "pauseSeconds",
      "concentricIntent",
      "topOrEndRangePauseSeconds",
      "description",
    ],
    "invalid_legacy_tempo_field",
    "Legacy tempo",
    targetId,
  );
  if (!isOneOf(record.concentricIntent, LEGACY_TEMPO_INTENTS)) {
    findings.push(enumFinding("invalid_legacy_tempo_concentric_intent", targetId));
  }
  for (const field of [
    "eccentricSeconds",
    "pauseSeconds",
    "topOrEndRangePauseSeconds",
  ] as const) {
    if (Object.hasOwn(record, field)) {
      findings.push(
        ...validateNumber(record[field], "legacy tempo seconds", targetId, {
          integer: false,
          positive: false,
        }),
      );
      if (
        typeof record[field] === "number" &&
        Number.isFinite(record[field]) &&
        record[field] < 0
      ) {
        findings.push(
          prescriptionFinding(
            "error",
            "invalid_target_negative_tempo",
            "Legacy tempo duration cannot be negative.",
            targetId,
          ),
        );
      }
    }
  }
  if (Object.hasOwn(record, "description")) {
    findings.push(...validateOptionalStringField(record.description, "description", targetId));
  }
  return findings;
}

function validateBreathingCadence(
  cadence: BreathingCadencePrescription,
  targetId?: string,
): readonly PrescriptionValidationFinding[] {
  const record = asRecord(cadence);
  if (!record) {
    return [objectFinding("invalid_breathing_cadence_object", "Breathing cadence", targetId)];
  }
  if (!isOneOf(record.kind, BREATHING_CADENCE_KINDS)) {
    return [enumFinding("invalid_breathing_cadence_kind", targetId)];
  }
  if (record.kind === "structured_breathing_cadence") {
    const findings = validateAllowedFields(
      record,
      [
        "kind",
        "inhale",
        "exhale",
        "postInhalePause",
        "postExhalePause",
        "phaseSequence",
        "provenance",
        "description",
      ],
      "invalid_breathing_cadence_field",
      "Breathing cadence",
      targetId,
    );
    findings.push(
      ...validateCadenceTimingTarget(record.inhale, "inhale", targetId),
      ...validateCadenceTimingTarget(record.exhale, "exhale", targetId),
      ...validateEvidenceProvenance(record.provenance, "breathing cadence provenance", targetId),
    );
    if (Object.hasOwn(record, "postInhalePause")) {
      findings.push(
        ...validateCadenceTimingTarget(record.postInhalePause, "postInhalePause", targetId),
      );
    }
    if (Object.hasOwn(record, "postExhalePause")) {
      findings.push(
        ...validateCadenceTimingTarget(record.postExhalePause, "postExhalePause", targetId),
      );
    }
    if (
      !Array.isArray(record.phaseSequence) ||
      record.phaseSequence.length === 0 ||
      !record.phaseSequence.every((phase) => isOneOf(phase, BREATHING_CADENCE_PHASES))
    ) {
      findings.push(
        prescriptionFinding(
          "error",
          "invalid_breathing_cadence_phase_sequence",
          "Breathing cadence requires a nonempty supported phase sequence.",
          targetId,
        ),
      );
    }
    if (Object.hasOwn(record, "description")) {
      findings.push(...validateOptionalStringField(record.description, "description", targetId));
    }
    return findings;
  }
  return [
    ...validateAllowedFields(
      record,
      ["kind", "reason", "provenance"],
      "invalid_breathing_cadence_field",
      "Breathing cadence",
      targetId,
    ),
    ...requireNonEmptyString(
      record.reason,
      "invalid_breathing_cadence_reason",
      "Breathing cadence unknown/not-prescribed states require a reason.",
      targetId,
    ),
    ...validateEvidenceProvenance(record.provenance, "breathing cadence provenance", targetId),
  ];
}

function validateCadenceTimingTarget(
  target: unknown,
  label: string,
  targetId?: string,
): readonly PrescriptionValidationFinding[] {
  const record = asRecord(target as CadenceTimingTarget);
  if (!record) {
    return [objectFinding("invalid_cadence_target_object", label, targetId)];
  }
  if (!isOneOf(record.kind, CADENCE_TARGET_KINDS)) {
    return [enumFinding("invalid_cadence_target_kind", targetId)];
  }
  switch (record.kind) {
    case "exact_seconds":
      return [
        ...validateAllowedFields(
          record,
          ["kind", "seconds"],
          "invalid_cadence_target_field",
          label,
          targetId,
        ),
        ...validateNumber(record.seconds, `${label} cadence seconds`, targetId, {
          integer: false,
          positive: true,
        }),
      ];
    case "seconds_range": {
      const findings = [
        ...validateAllowedFields(
          record,
          ["kind", "minSeconds", "maxSeconds"],
          "invalid_cadence_target_field",
          label,
          targetId,
        ),
        ...validateNumber(record.minSeconds, `${label} cadence min seconds`, targetId, {
          integer: false,
          positive: true,
        }),
        ...validateNumber(record.maxSeconds, `${label} cadence max seconds`, targetId, {
          integer: false,
          positive: true,
        }),
      ];
      if (
        typeof record.minSeconds === "number" &&
        typeof record.maxSeconds === "number" &&
        record.minSeconds > record.maxSeconds
      ) {
        findings.push(
          prescriptionFinding(
            "error",
            "invalid_cadence_range_order",
            "Cadence seconds range minimum cannot exceed maximum.",
            targetId,
          ),
        );
      }
      return findings;
    }
    case "intent_only": {
      const findings = validateAllowedFields(
        record,
        ["kind", "intent"],
        "invalid_cadence_target_field",
        label,
        targetId,
      );
      if (!isOneOf(record.intent, CADENCE_TARGET_INTENTS)) {
        findings.push(enumFinding("invalid_cadence_target_intent", targetId));
      }
      return findings;
    }
    case "not_prescribed":
    case "unknown":
      return [
        ...validateAllowedFields(
          record,
          ["kind", "reason"],
          "invalid_cadence_target_field",
          label,
          targetId,
        ),
        ...requireNonEmptyString(
          record.reason,
          "invalid_cadence_target_reason",
          "Cadence target unknown/not-prescribed states require a reason.",
          targetId,
        ),
      ];
  }
}

function validateLocomotorCadence(
  cadence: LocomotorCadencePrescription,
  targetId?: string,
): readonly PrescriptionValidationFinding[] {
  const record = asRecord(cadence);
  if (!record) {
    return [objectFinding("invalid_locomotor_cadence_object", "Locomotor cadence", targetId)];
  }
  if (!isOneOf(record.kind, LOCOMOTOR_CADENCE_KINDS)) {
    return [enumFinding("invalid_locomotor_cadence_kind", targetId)];
  }
  if (record.kind === "locomotor_or_step_cadence") {
    const findings = validateAllowedFields(
      record,
      ["kind", "intent", "standardRef", "provenance", "description"],
      "invalid_locomotor_cadence_field",
      "Locomotor cadence",
      targetId,
    );
    if (!isOneOf(record.intent, LOCOMOTOR_CADENCE_INTENTS)) {
      findings.push(enumFinding("invalid_locomotor_cadence_intent", targetId));
    }
    findings.push(
      ...validateEvidenceProvenance(record.provenance, "locomotor cadence provenance", targetId),
    );
    if (Object.hasOwn(record, "standardRef")) {
      findings.push(...validateOptionalStringField(record.standardRef, "standardRef", targetId));
    }
    if (Object.hasOwn(record, "description")) {
      findings.push(...validateOptionalStringField(record.description, "description", targetId));
    }
    return findings;
  }
  return [
    ...validateAllowedFields(
      record,
      ["kind", "reason", "provenance"],
      "invalid_locomotor_cadence_field",
      "Locomotor cadence",
      targetId,
    ),
    ...requireNonEmptyString(
      record.reason,
      "invalid_locomotor_cadence_reason",
      "Locomotor cadence unknown/not-prescribed states require a reason.",
      targetId,
    ),
    ...validateEvidenceProvenance(record.provenance, "locomotor cadence provenance", targetId),
  ];
}

function validateLoadTarget(
  load: LoadTarget,
  targetId?: string,
): readonly PrescriptionValidationFinding[] {
  const record = asRecord(load);
  if (!record) {
    return [objectFinding("invalid_load_object", "Load target", targetId)];
  }

  if (!isOneOf(record.kind, LOAD_KINDS)) {
    return [
      prescriptionFinding(
        "error",
        "invalid_load_kind",
        "Load target kind is unsupported.",
        targetId,
      ),
    ];
  }

  switch (record.kind) {
    case "bodyweight":
      return validateAllowedFields(
        record,
        ["kind"],
        "invalid_load_field",
        "Bodyweight load",
        targetId,
      );
    case "not_prescribed":
      return [
        ...validateAllowedFields(
          record,
          ["kind", "reason"],
          "invalid_load_field",
          "Not-prescribed load",
          targetId,
        ),
        ...validateOptionalStringField(record.reason, "reason", targetId),
      ];
    case "unknown":
      return [
        ...validateAllowedFields(
          record,
          ["kind", "reason"],
          "invalid_load_field",
          "Unknown load",
          targetId,
        ),
        ...requireNonEmptyString(
          record.reason,
          "invalid_load_unknown_reason",
          "Unknown load requires an explicit reason and is not zero.",
          targetId,
        ),
      ];
    case "external_load":
      return validateExternalLoad(record, targetId);
    case "machine_stack":
      return [
        ...validateAllowedFields(
          record,
          ["kind", "target", "machineId", "settingSystemId", "application"],
          "invalid_load_field",
          "Machine stack load",
          targetId,
        ),
        ...validateExactApplication(
          record.application,
          "machine_stack",
          "invalid_load_application",
          targetId,
        ),
        ...validateMachineSettingOrNumeric(
          record.target as MachineSettingMagnitude | NumericLoadMagnitude,
          "machine stack load",
          targetId,
        ),
        ...validateOptionalNonEmptyString(
          record.machineId,
          "invalid_load_machine_id",
          "machineId must be nonempty when supplied.",
          targetId,
        ),
        ...validateOptionalNonEmptyString(
          record.settingSystemId,
          "invalid_load_setting_system_id",
          "settingSystemId must be nonempty when supplied.",
          targetId,
        ),
      ];
    case "cable_stack":
      return [
        ...validateAllowedFields(
          record,
          ["kind", "target", "cableStackId", "application"],
          "invalid_load_field",
          "Cable stack load",
          targetId,
        ),
        ...validateExactApplication(
          record.application,
          "cable_stack",
          "invalid_load_application",
          targetId,
        ),
        ...validateMachineSettingOrNumeric(
          record.target as MachineSettingMagnitude | NumericLoadMagnitude,
          "cable stack load",
          targetId,
        ),
        ...validateOptionalNonEmptyString(
          record.cableStackId,
          "invalid_load_cable_stack_id",
          "cableStackId must be nonempty when supplied.",
          targetId,
        ),
      ];
    case "band_tension":
      return [
        ...validateAllowedFields(
          record,
          ["kind", "target"],
          "invalid_load_field",
          "Band tension load",
          targetId,
        ),
        ...validateBandTension(record.target as BandTensionMagnitude, targetId),
      ];
    case "user_selected_by_effort":
      return [
        ...validateAllowedFields(
          record,
          ["kind", "effort", "application"],
          "invalid_load_field",
          "User-selected load",
          targetId,
        ),
        ...validateOptionalLoadApplication(record.application, targetId),
        ...validateEffortTarget(record.effort as EffortTarget, [], targetId),
      ];
  }
}

function validateExternalLoad(
  record: Readonly<Record<string, unknown>>,
  targetId?: string,
): readonly PrescriptionValidationFinding[] {
  const findings = [
    ...validateAllowedFields(
      record,
      ["kind", "target", "application", "side"],
      "invalid_load_field",
      "External load",
      targetId,
    ),
    ...validateNumericLoadMagnitude(
      record.target as NumericLoadMagnitude,
      "external load",
      targetId,
    ),
  ];
  if (!isOneOf(record.application, EXTERNAL_LOAD_APPLICATIONS)) {
    findings.push(
      prescriptionFinding(
        "error",
        "invalid_load_application",
        "External load application must use a supported non-machine application.",
        targetId,
      ),
    );
  }
  if (record.application === "unilateral_side") {
    if (!isValidSide(record.side)) {
      findings.push(
        prescriptionFinding(
          "error",
          "missing_load_side_truth",
          "One-sided external load requires explicit load side truth.",
          targetId,
        ),
      );
    }
  } else if (Object.hasOwn(record, "side")) {
    findings.push(
      prescriptionFinding(
        "error",
        "invalid_load_non_unilateral_side",
        "External load side may only be supplied for unilateral_side application.",
        targetId,
      ),
    );
  }
  return findings;
}

function validateNumericLoadMagnitude(
  target: NumericLoadMagnitude,
  label: string,
  targetId?: string,
): readonly PrescriptionValidationFinding[] {
  const record = asRecord(target);
  if (!record) {
    return [
      prescriptionFinding(
        "error",
        "invalid_load_target_object",
        `${label} must be a structured load target.`,
        targetId,
      ),
    ];
  }
  if (record.kind === "exact") {
    return [
      ...validateAllowedFields(
        record,
        ["kind", "value", "unit"],
        "invalid_load_target_field",
        `${label} exact magnitude`,
        targetId,
      ),
      ...validateLoadUnit(record.unit, label, targetId),
      ...validateNumber(record.value, label, targetId, {
        integer: false,
        positive: true,
      }),
    ];
  }
  if (record.kind === "range") {
    const findings = [
      ...validateAllowedFields(
        record,
        ["kind", "min", "max", "unit"],
        "invalid_load_target_field",
        `${label} range magnitude`,
        targetId,
      ),
      ...validateLoadUnit(record.unit, label, targetId),
      ...validateNumber(record.min, `${label} minimum`, targetId, {
        integer: false,
        positive: true,
      }),
      ...validateNumber(record.max, `${label} maximum`, targetId, {
        integer: false,
        positive: true,
      }),
    ];
    if (
      typeof record.min === "number" &&
      typeof record.max === "number" &&
      record.min > record.max
    ) {
      findings.push(
        prescriptionFinding(
          "error",
          "invalid_load_range_order",
          `${label} minimum must not exceed maximum.`,
          targetId,
        ),
      );
    }
    return findings;
  }
  return [
    prescriptionFinding(
      "error",
      "invalid_load_target_kind",
      `${label} must use exact or range magnitude.`,
      targetId,
    ),
  ];
}

function validateMachineSettingOrNumeric(
  target: MachineSettingMagnitude | NumericLoadMagnitude,
  label: string,
  targetId?: string,
): readonly PrescriptionValidationFinding[] {
  const record = asRecord(target);
  if (!record) {
    return [
      prescriptionFinding(
        "error",
        "invalid_load_target_object",
        `${label} must be structured.`,
        targetId,
      ),
    ];
  }
  const hasNumericValue = Object.hasOwn(record, "value") || Object.hasOwn(record, "unit");
  const hasNumericRange =
    Object.hasOwn(record, "min") ||
    Object.hasOwn(record, "max") ||
    Object.hasOwn(record, "unit");
  const hasSettingValue = Object.hasOwn(record, "setting");
  const hasSettingRange =
    Object.hasOwn(record, "minSetting") || Object.hasOwn(record, "maxSetting");

  if ((hasNumericValue || hasNumericRange) && (hasSettingValue || hasSettingRange)) {
    return [
      prescriptionFinding(
        "error",
        "invalid_load_mixed_target_units",
        `${label} must not mix machine setting and kg/lb target shapes.`,
        targetId,
      ),
    ];
  }
  if (hasNumericValue || hasNumericRange) {
    return validateNumericLoadMagnitude(target as NumericLoadMagnitude, label, targetId);
  }
  if (record.kind === "exact") {
    return [
      ...validateAllowedFields(
        record,
        ["kind", "setting"],
        "invalid_load_target_field",
        `${label} exact setting`,
        targetId,
      ),
      ...validateNumber(record.setting, label, targetId, {
        integer: false,
        positive: true,
      }),
    ];
  }
  if (record.kind === "range") {
    const findings = [
      ...validateAllowedFields(
        record,
        ["kind", "minSetting", "maxSetting"],
        "invalid_load_target_field",
        `${label} range setting`,
        targetId,
      ),
      ...validateNumber(record.minSetting, `${label} minimum`, targetId, {
        integer: false,
        positive: true,
      }),
      ...validateNumber(record.maxSetting, `${label} maximum`, targetId, {
        integer: false,
        positive: true,
      }),
    ];
    if (
      typeof record.minSetting === "number" &&
      typeof record.maxSetting === "number" &&
      record.minSetting > record.maxSetting
    ) {
      findings.push(
        prescriptionFinding(
          "error",
          "invalid_load_range_order",
          `${label} minimum must not exceed maximum.`,
          targetId,
        ),
      );
    }
    return findings;
  }
  return [
    prescriptionFinding(
      "error",
      "invalid_load_target_kind",
      `${label} must use exact or range setting data.`,
      targetId,
    ),
  ];
}

function validateBandTension(
  target: BandTensionMagnitude,
  targetId?: string,
): readonly PrescriptionValidationFinding[] {
  const record = asRecord(target);
  if (!record) {
    return [
      prescriptionFinding(
        "error",
        "invalid_load_band_tension",
        "Band tension must be structured and must not be converted to kilograms.",
        targetId,
      ),
    ];
  }
  if (!isOneOf(record.kind, BAND_TENSION_KINDS)) {
    return [
      prescriptionFinding(
        "error",
        "invalid_load_band_tension_kind",
        "Band tension kind is unsupported.",
        targetId,
      ),
    ];
  }
  if (record.kind === "band_level") {
    const findings = [
      ...validateAllowedFields(
        record,
        ["kind", "level", "description"],
        "invalid_load_band_tension_field",
        "Band level tension",
        targetId,
      ),
    ];
    if (!isOneOf(record.level, BAND_LEVELS)) {
      findings.push(
        prescriptionFinding(
          "error",
          "invalid_load_band_level",
          "Band tension level is unsupported.",
          targetId,
        ),
      );
    }
    if (Object.hasOwn(record, "description")) {
      findings.push(...validateOptionalStringField(record.description, "description", targetId));
    }
    return findings;
  }

  return [
    ...validateAllowedFields(
      record,
      ["kind", "referenceId", "description"],
      "invalid_load_band_tension_field",
      "Reviewed band tension",
      targetId,
    ),
    ...requireNonEmptyString(
      record.referenceId,
      "invalid_load_band_reference",
      "Reviewed band tension requires a stable reference id.",
      targetId,
    ),
    ...requireNonEmptyString(
      record.description,
      "invalid_load_band_reference_description",
      "Reviewed band tension requires a nonempty description.",
      targetId,
    ),
  ];
}

function validateEffortTarget(
  effort: EffortTarget,
  requiredIds: readonly string[],
  targetId?: string,
): readonly PrescriptionValidationFinding[] {
  const record = asRecord(effort);
  if (!record) {
    return [
      prescriptionFinding(
        "error",
        "invalid_effort_object",
        "Effort target must be structured.",
        targetId,
      ),
    ];
  }
  if (!isOneOf(record.kind, EFFORT_KINDS)) {
    return [
      prescriptionFinding(
        "error",
        "invalid_effort_kind",
        "Effort target kind is unsupported.",
        targetId,
      ),
    ];
  }
  if (record.kind === "rir") {
    return [
      ...validateAllowedFields(
        record,
        ["kind", "target"],
        "invalid_effort_field",
        "RIR effort",
        targetId,
      ),
      ...validateBoundedEffort(
        record.target as NumericEffortTarget,
        "RIR",
        0,
        10,
        targetId,
      ),
    ];
  }
  if (record.kind === "rpe") {
    return [
      ...validateAllowedFields(
        record,
        ["kind", "target"],
        "invalid_effort_field",
        "RPE effort",
        targetId,
      ),
      ...validateBoundedEffort(
        record.target as NumericEffortTarget,
        "RPE",
        1,
        10,
        targetId,
      ),
    ];
  }
  if (record.kind === "phase_qualitative_band") {
    const findings = validateAllowedFields(
      record,
      ["kind", "band"],
      "invalid_effort_field",
      "Phase qualitative effort",
      targetId,
    );
    if (!isOneOf(record.band, PHASE_EFFORT_BANDS)) {
      findings.push(
        prescriptionFinding(
          "error",
          "invalid_effort_qualitative_band",
          "Phase qualitative effort band is unsupported.",
          targetId,
        ),
      );
    }
    return findings;
  }
  if (record.kind === "quality_limited") {
    return validateQualityLimitedEffort(record, requiredIds, targetId);
  }
  if (record.kind === "self_selected_by_reviewed_standard") {
    return [
      ...validateAllowedFields(
        record,
        ["kind", "standardId", "description"],
        "invalid_effort_field",
        "Self-selected reviewed effort",
        targetId,
      ),
      ...requireNonEmptyString(
        record.standardId,
        "invalid_effort_standard_id",
        "Self-selected reviewed effort requires a nonempty standardId.",
        targetId,
      ),
      ...requireNonEmptyString(
        record.description,
        "invalid_effort_description",
        "Self-selected reviewed effort requires a nonempty description.",
        targetId,
      ),
    ];
  }
  return [
    ...validateAllowedFields(
      record,
      ["kind", "description"],
      "invalid_effort_field",
      "Unknown effort",
      targetId,
    ),
    ...validateOptionalStringField(record.description, "description", targetId),
  ];
}

function validateQualityLimitedEffort(
  record: Readonly<Record<string, unknown>>,
  requiredIds: readonly string[],
  targetId?: string,
): readonly PrescriptionValidationFinding[] {
  const findings = [
    ...validateAllowedFields(
      record,
      ["kind", "requiredCriterionIds", "description"],
      "invalid_effort_field",
      "Quality-limited effort",
      targetId,
    ),
    ...requireNonEmptyString(
      record.description,
      "invalid_quality_limited_effort_description",
      "Quality-limited effort requires a nonempty description.",
      targetId,
    ),
  ];
  if (!Array.isArray(record.requiredCriterionIds)) {
    findings.push(
      prescriptionFinding(
        "error",
        "invalid_quality_limited_effort_ids",
        "Quality-limited effort must reference required execution criteria.",
        targetId,
      ),
    );
    return findings;
  }
  if (record.requiredCriterionIds.length === 0) {
    findings.push(
      prescriptionFinding(
        "error",
        "invalid_quality_limited_effort_empty",
        "Quality-limited effort must reference required execution criteria.",
        targetId,
      ),
    );
  }
  const seen = new Set<string>();
  for (const id of record.requiredCriterionIds) {
    if (!isNonEmptyString(id)) {
      findings.push(
        prescriptionFinding(
          "error",
          "invalid_quality_limited_effort_empty_id",
          "Quality-limited effort criterion IDs must be nonempty strings.",
          targetId,
        ),
      );
      continue;
    }
    if (seen.has(id)) {
      findings.push(
        prescriptionFinding(
          "error",
          "duplicate_quality_limited_effort_criterion_ref",
          "Quality-limited effort criterion IDs must be unique.",
          targetId,
        ),
      );
    }
    seen.add(id);
    if (!requiredIds.includes(id)) {
      findings.push(
        prescriptionFinding(
          "error",
          "invalid_quality_limited_effort_criterion_ref",
          `Quality-limited effort references unknown required criterion ${id}.`,
          targetId,
        ),
      );
    }
  }
  return findings;
}

function validateBoundedEffort(
  target: NumericEffortTarget,
  label: string,
  minAllowed: number,
  maxAllowed: number,
  targetId?: string,
): readonly PrescriptionValidationFinding[] {
  const record = asRecord(target);
  if (!record) {
    return [
      prescriptionFinding(
        "error",
        "invalid_effort_target_object",
        `${label} target must be structured.`,
        targetId,
      ),
    ];
  }
  if (!isOneOf(record.kind, EFFORT_TARGET_KINDS)) {
    return [
      prescriptionFinding(
        "error",
        "invalid_effort_target_kind",
        `${label} target must use exact or range.`,
        targetId,
      ),
    ];
  }
  const findings = validateAllowedFields(
    record,
    record.kind === "exact" ? ["kind", "value"] : ["kind", "min", "max"],
    "invalid_effort_target_field",
    `${label} target`,
    targetId,
  );
  const values =
    record.kind === "exact" ? [record.value] : [record.min, record.max];
  findings.push(
    ...values.flatMap((value) =>
      validateNumber(value, label, targetId, {
        integer: false,
        positive: false,
      }),
    ),
  );
  if (
    record.kind === "range" &&
    typeof record.min === "number" &&
    typeof record.max === "number" &&
    record.min > record.max
  ) {
    findings.push(
      prescriptionFinding(
        "error",
        "invalid_effort_range_order",
        `${label} minimum must not exceed maximum.`,
        targetId,
      ),
    );
  }
  if (
    values.some(
      (value) =>
        typeof value === "number" &&
        Number.isFinite(value) &&
        (value < minAllowed || value > maxAllowed),
    )
  ) {
    findings.push(
      prescriptionFinding(
        "error",
        "invalid_effort_bounds",
        `${label} target is outside its valid range.`,
        targetId,
      ),
    );
  }
  return findings;
}

function validateCriterion(
  criterion: ExecutionQualityCriterion,
  targetId?: string,
): readonly PrescriptionValidationFinding[] {
  const record = asRecord(criterion);
  if (!record) {
    return [
      prescriptionFinding(
        "error",
        "invalid_execution_criterion_object",
        "Execution quality criterion must be a structured object.",
        targetId,
      ),
    ];
  }
  const findings = [
    ...validateAllowedFields(
      record,
      ["id", "dimension", "importance", "source", "description", "provenance"],
      "invalid_execution_criterion_field",
      "Execution quality criterion",
      targetId,
    ),
    ...requireNonEmptyString(
      record.id,
      "missing_execution_criterion_id",
      "Execution quality criterion requires a stable id.",
      targetId,
    ),
    ...requireNonEmptyString(
      record.description,
      "missing_execution_criterion_description",
      "Execution criterion description is required for review, but must not be parsed for behavior.",
      targetId,
    ),
    ...validateEvidenceProvenance(
      record.provenance,
      "execution criterion provenance",
      targetId,
    ),
  ];
  if (!isOneOf(record.dimension, EXECUTION_DIMENSIONS)) {
    findings.push(enumFinding("invalid_execution_criterion_dimension", targetId));
  }
  if (!isOneOf(record.importance, EXECUTION_IMPORTANCE)) {
    findings.push(enumFinding("invalid_execution_criterion_importance", targetId));
  }
  if (!isOneOf(record.source, EXECUTION_SOURCES)) {
    findings.push(enumFinding("invalid_execution_criterion_source", targetId));
  }
  return findings;
}

function validateEvidenceProvenance(
  provenance: unknown,
  label: string,
  targetId?: string,
): readonly PrescriptionValidationFinding[] {
  const record = asRecord(provenance as EvidenceProvenance);
  if (!record) {
    return [
      prescriptionFinding(
        "error",
        "invalid_provenance_object",
        `${label} must be a structured provenance object.`,
        targetId,
      ),
    ];
  }
  const findings = [
    ...validateAllowedFields(
      record,
      ["source", "sourceRef", "notes"],
      "invalid_provenance_field",
      label,
      targetId,
    ),
    ...requireNonEmptyString(
      record.sourceRef,
      "invalid_provenance_source_ref",
      `${label} requires a nonempty sourceRef.`,
      targetId,
    ),
  ];
  if (!isOneOf(record.source, PRESCRIPTION_EVIDENCE_SOURCES)) {
    findings.push(
      prescriptionFinding(
        "error",
        "invalid_provenance_source",
        `${label} source is unsupported.`,
        targetId,
      ),
    );
  }
  if (Object.hasOwn(record, "notes")) {
    findings.push(...validateOptionalStringField(record.notes, "notes", targetId));
  }
  return findings;
}

function validatePrescriptionLaterality(
  laterality: PrescriptionLaterality,
  targetId?: string,
): readonly PrescriptionValidationFinding[] {
  const record = asRecord(laterality);
  if (!record) {
    return [objectFinding("invalid_laterality_object", "Prescription laterality", targetId)];
  }
  if (!isOneOf(record.kind, LATERALITY_KINDS)) {
    return [enumFinding("invalid_laterality_kind", targetId)];
  }
  const findings = validateAllowedFields(
    record,
    record.kind === "single_side"
      ? ["kind", "side"]
      : record.kind === "alternating"
        ? ["kind", "startingSide"]
        : ["kind"],
    "invalid_laterality_field",
    "Prescription laterality",
    targetId,
  );
  if (record.kind === "single_side" && !isValidSide(record.side)) {
    findings.push(
      prescriptionFinding(
        "error",
        "invalid_laterality_side",
        "single_side laterality requires a valid side.",
        targetId,
      ),
    );
  }
  if (
    record.kind === "alternating" &&
    Object.hasOwn(record, "startingSide") &&
    !isValidSide(record.startingSide)
  ) {
    findings.push(
      prescriptionFinding(
        "error",
        "invalid_laterality_starting_side",
        "alternating laterality startingSide must be valid when supplied.",
        targetId,
      ),
    );
  }
  return findings;
}

function validatePrescriptionSideBehavior(
  sideBehavior: PrescriptionSideBehavior,
  targetId?: string,
): readonly PrescriptionValidationFinding[] {
  const record = asRecord(sideBehavior);
  if (!record) {
    return [objectFinding("invalid_side_behavior_object", "Side behavior", targetId)];
  }
  const findings = validateAllowedFields(
    record,
    [
      "movementSide",
      "loadSide",
      "supportSide",
      "startingSide",
      "sideRelationship",
      "alternates",
    ],
    "invalid_side_behavior_field",
    "Side behavior",
    targetId,
  );
  if (Object.hasOwn(record, "movementSide")) {
    findings.push(
      ...validatePrescriptionLaterality(
        record.movementSide as PrescriptionLaterality,
        targetId,
      ),
    );
  }
  for (const field of ["loadSide", "supportSide", "startingSide"] as const) {
    if (Object.hasOwn(record, field) && !isValidSide(record[field])) {
      findings.push(enumFinding("invalid_side_value", targetId));
    }
  }
  if (
    Object.hasOwn(record, "sideRelationship") &&
    !isOneOf(record.sideRelationship, SIDE_RELATIONSHIPS)
  ) {
    findings.push(enumFinding("invalid_side_relationship", targetId));
  }
  if (Object.hasOwn(record, "alternates") && typeof record.alternates !== "boolean") {
    findings.push(
      prescriptionFinding(
        "error",
        "invalid_side_behavior_alternates",
        "sideBehavior.alternates must be boolean when supplied.",
        targetId,
      ),
    );
  }
  if (
    record.sideRelationship === "same_side" &&
    isValidSide(record.loadSide) &&
    isValidSide(record.supportSide) &&
    record.loadSide !== record.supportSide
  ) {
    findings.push(
      prescriptionFinding(
        "error",
        "invalid_side_relationship_truth",
        "same_side relationship requires loadSide and supportSide to match.",
        targetId,
      ),
    );
  }
  if (
    record.sideRelationship === "opposite_side" &&
    isValidSide(record.loadSide) &&
    isValidSide(record.supportSide) &&
    record.loadSide === record.supportSide
  ) {
    findings.push(
      prescriptionFinding(
        "error",
        "invalid_side_relationship_truth",
        "opposite_side relationship requires loadSide and supportSide to differ.",
        targetId,
      ),
    );
  }
  return findings;
}

function validateDoseSideConsistency(
  record: Readonly<Record<string, unknown>>,
  targetId?: string,
): readonly PrescriptionValidationFinding[] {
  const findings: PrescriptionValidationFinding[] = [];
  const load = asRecord(record.load);
  const sideBehavior = asRecord(record.sideBehavior);
  if (
    load?.kind === "external_load" &&
    load.application === "unilateral_side" &&
    isValidSide(load.side) &&
    sideBehavior &&
    Object.hasOwn(sideBehavior, "loadSide") &&
    isValidSide(sideBehavior.loadSide) &&
    load.side !== sideBehavior.loadSide
  ) {
    findings.push(
      prescriptionFinding(
        "error",
        "invalid_load_side_behavior_mismatch",
        "Unilateral load side must agree with sideBehavior.loadSide when both are supplied.",
        targetId,
      ),
    );
  }
  return findings;
}

function validateQualityObservations(
  observations: unknown,
  targetId?: string,
): readonly PrescriptionValidationFinding[] {
  if (!Array.isArray(observations)) {
    return [
      prescriptionFinding(
        "error",
        "invalid_performance_quality_observations_array",
        "qualityObservations must be an array.",
        targetId,
      ),
    ];
  }
  const findings: PrescriptionValidationFinding[] = [];
  const seen = new Set<string>();
  for (const observation of observations) {
    const record = asRecord(observation as ExecutionQualityObservation);
    if (!record) {
      findings.push(
        prescriptionFinding(
          "error",
          "invalid_performance_quality_observation_object",
          "Quality observation must be a structured object.",
          targetId,
        ),
      );
      continue;
    }
    const criterionId = stringOrUndefined(record.criterionId);
    if (criterionId && seen.has(criterionId)) {
      findings.push(
        prescriptionFinding(
          "error",
          "duplicate_performance_quality_observation",
          "Quality observations must be unique by criterionId.",
          targetId,
        ),
      );
    }
    if (criterionId) {
      seen.add(criterionId);
    }
    findings.push(
      ...validateAllowedFields(
        record,
        ["criterionId", "result", "source", "provenance", "notes"],
        "invalid_performance_quality_observation_field",
        "Quality observation",
        targetId,
      ),
      ...requireNonEmptyString(
        record.criterionId,
        "invalid_performance_quality_criterion_id",
        "Quality observation requires a nonempty criterionId.",
        targetId,
      ),
      ...validateEvidenceProvenance(
        record.provenance,
        "quality observation provenance",
        targetId,
      ),
    );
    if (!isOneOf(record.result, QUALITY_RESULTS)) {
      findings.push(enumFinding("invalid_performance_quality_result", targetId));
    }
    if (!isOneOf(record.source, QUALITY_SOURCES)) {
      findings.push(enumFinding("invalid_performance_quality_source", targetId));
    }
    if (Object.hasOwn(record, "notes")) {
      findings.push(...validateOptionalStringField(record.notes, "notes", targetId));
    }
  }
  return findings;
}

function validateSubstitutions(
  substitutions: unknown,
  targetId?: string,
): readonly PrescriptionValidationFinding[] {
  if (!Array.isArray(substitutions)) {
    return [
      prescriptionFinding(
        "error",
        "invalid_performance_substitutions_array",
        "substitutions must be an array.",
        targetId,
      ),
    ];
  }
  return substitutions.flatMap((substitution) =>
    validateSubstitution(substitution as ExerciseSubstitutionRecord, targetId),
  );
}

function validateSubstitution(
  substitution: ExerciseSubstitutionRecord,
  targetId?: string,
): readonly PrescriptionValidationFinding[] {
  const record = asRecord(substitution);
  if (!record) {
    return [
      prescriptionFinding(
        "error",
        "invalid_performance_substitution_object",
        "Substitution record must be structured.",
        targetId,
      ),
    ];
  }
  return [
    ...validateAllowedFields(
      record,
      ["originalExerciseId", "substitutedExerciseId", "reason", "provenance"],
      "invalid_performance_substitution_field",
      "Substitution record",
      targetId,
    ),
    ...requireNonEmptyString(
      record.originalExerciseId,
      "invalid_performance_substitution_original_id",
      "Substitution record requires originalExerciseId.",
      targetId,
    ),
    ...requireNonEmptyString(
      record.substitutedExerciseId,
      "invalid_performance_substitution_replacement_id",
      "Substitution record requires substitutedExerciseId.",
      targetId,
    ),
    ...requireNonEmptyString(
      record.reason,
      "invalid_performance_substitution_reason",
      "Substitution record requires a nonempty reason.",
      targetId,
    ),
    ...validateEvidenceProvenance(
      record.provenance,
      "substitution provenance",
      targetId,
    ),
  ];
}

function validatePerformancePrescriptionBinding(
  prescription: ExercisePrescription,
  performance: ExercisePerformanceRecord,
): readonly PrescriptionValidationFinding[] {
  const findings: PrescriptionValidationFinding[] = [];
  const performanceRecord = asRecord(performance);
  if (!performanceRecord) {
    return findings;
  }
  const targetId = stringOrUndefined(performanceRecord.exerciseId);
  if (
    isNonEmptyString(performanceRecord.prescriptionId) &&
    performanceRecord.prescriptionId !== prescription.prescriptionId
  ) {
    findings.push(
      prescriptionFinding(
        "error",
        "invalid_performance_prescription_mismatch",
        "Performance prescriptionId must match the planned prescription.",
        targetId,
      ),
    );
  }
  if (
    isNonEmptyString(performanceRecord.exerciseId) &&
    performanceRecord.exerciseId !== prescription.exerciseId
  ) {
    findings.push(
      prescriptionFinding(
        "error",
        "invalid_performance_exercise_mismatch",
        "Performance exerciseId must match the planned prescription.",
        targetId,
      ),
    );
  }
  if (Object.hasOwn(performanceRecord, "actualDose")) {
    findings.push(
      ...validateDose(
        performanceRecord.actualDose as ExerciseDose,
        prescription.executionStandard,
        targetId,
      ),
    );
  }
  const criterionIds = new Set(
    prescription.executionStandard.criteria.map((criterion) => criterion.id),
  );
  if (Array.isArray(performanceRecord.qualityObservations)) {
    for (const observation of performanceRecord.qualityObservations) {
      const observationRecord = asRecord(observation);
      if (
        observationRecord &&
        isNonEmptyString(observationRecord.criterionId) &&
        !criterionIds.has(observationRecord.criterionId)
      ) {
        findings.push(
          prescriptionFinding(
            "error",
            "invalid_performance_quality_criterion_ref",
            "Quality observation criterionId must reference the planned execution standard.",
            targetId,
          ),
        );
      }
    }
  }
  return findings;
}

function validateContinuityRunwayEvidence(
  evidence: unknown,
  targetId?: string,
): readonly PrescriptionValidationFinding[] {
  if (!Array.isArray(evidence)) {
    return [
      prescriptionFinding(
        "error",
        "invalid_progression_continuity_array",
        "continuityRunwayEvidence must be an array.",
        targetId,
      ),
    ];
  }
  const findings: PrescriptionValidationFinding[] = [];
  const seen = new Set<string>();
  for (const value of evidence) {
    if (!isOneOf(value, CONTINUITY_RUNWAY_EVIDENCE_STATUSES)) {
      findings.push(
        prescriptionFinding(
          "error",
          "invalid_progression_continuity_evidence",
          "continuityRunwayEvidence contains an unsupported value.",
          targetId,
        ),
      );
      continue;
    }
    if (seen.has(value)) {
      findings.push(
        prescriptionFinding(
          "error",
          "duplicate_progression_continuity_evidence",
          "continuityRunwayEvidence must not contain duplicate entries.",
          targetId,
        ),
      );
    }
    seen.add(value);
  }
  return findings;
}

function validateLoadUnit(
  unit: unknown,
  label: string,
  targetId?: string,
): readonly PrescriptionValidationFinding[] {
  if (!isOneOf(unit, LOAD_UNITS)) {
    return [
      prescriptionFinding(
        "error",
        "invalid_load_unit",
        `${label} must use kg or lb units when numeric load is prescribed.`,
        targetId,
      ),
    ];
  }
  return [];
}

function validateExactApplication(
  application: unknown,
  expected: "machine_stack" | "cable_stack",
  code: string,
  targetId?: string,
): readonly PrescriptionValidationFinding[] {
  if (application !== expected) {
    return [
      prescriptionFinding(
        "error",
        code,
        `Load application must be exactly ${expected}.`,
        targetId,
      ),
    ];
  }
  return [];
}

function validateOptionalLoadApplication(
  application: unknown,
  targetId?: string,
): readonly PrescriptionValidationFinding[] {
  if (application !== undefined && !isOneOf(application, LOAD_APPLICATIONS)) {
    return [
      prescriptionFinding(
        "error",
        "invalid_load_application",
        "Load application is unsupported.",
        targetId,
      ),
    ];
  }
  return [];
}

function validateExplicitIsoField(
  value: unknown,
  code: string,
  message: string,
  targetId?: string,
): readonly PrescriptionValidationFinding[] {
  if (!isNonEmptyString(value) || !isExplicitIsoDateTime(value)) {
    return [prescriptionFinding("error", code, message, targetId)];
  }
  return [];
}

function validateStringIdArray(
  value: unknown,
  label: string,
  code: string,
  targetId?: string,
): readonly PrescriptionValidationFinding[] {
  if (!Array.isArray(value)) {
    return [
      prescriptionFinding(
        "error",
        code,
        `${label} must be an array of nonempty string IDs.`,
        targetId,
      ),
    ];
  }
  const findings: PrescriptionValidationFinding[] = [];
  const seen = new Set<string>();
  for (const id of value) {
    if (!isNonEmptyString(id)) {
      findings.push(
        prescriptionFinding(
          "error",
          code,
          `${label} entries must be nonempty string IDs.`,
          targetId,
        ),
      );
      continue;
    }
    if (seen.has(id)) {
      findings.push(
        prescriptionFinding(
          "error",
          `duplicate_${code}`,
          `${label} entries must be unique.`,
          targetId,
        ),
      );
    }
    seen.add(id);
  }
  return findings;
}

function validateNonEmptyStringArray(
  value: unknown,
  label: string,
  code: string,
  targetId: string | undefined,
  options: { readonly requireNonEmptyArray: boolean },
): readonly PrescriptionValidationFinding[] {
  if (!Array.isArray(value) || (options.requireNonEmptyArray && value.length === 0)) {
    return [
      prescriptionFinding(
        "error",
        code,
        `${label} must be a nonempty array of nonempty strings.`,
        targetId,
      ),
    ];
  }
  return value.flatMap((entry) =>
    isNonEmptyString(entry)
      ? []
      : [
          prescriptionFinding(
            "error",
            code,
            `${label} entries must be nonempty strings.`,
            targetId,
          ),
        ],
  );
}

function validateNotesArray(
  value: unknown,
  label: string,
  targetId?: string,
): readonly PrescriptionValidationFinding[] {
  if (!Array.isArray(value)) {
    return [
      prescriptionFinding(
        "error",
        "invalid_notes_array",
        `${label} must be an array of strings.`,
        targetId,
      ),
    ];
  }
  return value.flatMap((entry) =>
    typeof entry === "string"
      ? []
      : [
          prescriptionFinding(
            "error",
            "invalid_notes_array",
            `${label} entries must be strings.`,
            targetId,
          ),
        ],
  );
}

function requireFields(
  record: Readonly<Record<string, unknown>>,
  fields: readonly string[],
  targetId?: string,
): readonly PrescriptionValidationFinding[] {
  return fields
    .filter((field) => !Object.hasOwn(record, field))
    .map((field) =>
      prescriptionFinding(
        "error",
        "missing_dose_required_field",
        `Dose mode ${String(record.mode)} requires ${field}.`,
        targetId,
      ),
    );
}

function validateAllowedFields(
  record: Readonly<Record<string, unknown>>,
  fields: readonly string[],
  code: string,
  label: string,
  targetId?: string,
): PrescriptionValidationFinding[] {
  const allowed = new Set(fields);
  return Object.keys(record)
    .filter((field) => !allowed.has(field))
    .map((field) =>
      prescriptionFinding(
        "error",
        code,
        `${label} must not carry unsupported field ${field}.`,
        targetId,
      ),
    );
}

function requireNonEmptyString(
  value: unknown,
  code: string,
  message: string,
  targetId?: string,
): readonly PrescriptionValidationFinding[] {
  return isNonEmptyString(value)
    ? []
    : [prescriptionFinding("error", code, message, targetId)];
}

function validateOptionalNonEmptyString(
  value: unknown,
  code: string,
  message: string,
  targetId?: string,
): readonly PrescriptionValidationFinding[] {
  if (value === undefined) {
    return [];
  }
  return requireNonEmptyString(value, code, message, targetId);
}

function validateOptionalStringField(
  value: unknown,
  label: string,
  targetId?: string,
): readonly PrescriptionValidationFinding[] {
  if (value !== undefined && typeof value !== "string") {
    return [
      prescriptionFinding(
        "error",
        "invalid_optional_string_field",
        `${label} must be a string when supplied.`,
        targetId,
      ),
    ];
  }
  return [];
}

function requiredCriterionIds(standard?: ExecutionStandard): readonly string[] {
  return Array.isArray(standard?.criteria)
    ? standard.criteria
        .filter((criterion) => criterion.importance === "required_for_progression")
        .map((criterion) => criterion.id)
    : [];
}

function isPrescriptionErrorFinding(
  finding: PrescriptionValidationFinding,
): boolean {
  return (
    finding.severity === "error" &&
    (finding.code.includes("prescription") ||
      finding.code === "invalid_provenance_object" ||
      finding.code === "invalid_provenance_source" ||
      finding.code === "invalid_provenance_source_ref" ||
      finding.code === "invalid_provenance_field")
  );
}

function isDoseErrorFinding(finding: PrescriptionValidationFinding): boolean {
  return (
    finding.severity === "error" &&
    (finding.code.startsWith("invalid_dose") ||
      finding.code.startsWith("missing_dose") ||
      finding.code.startsWith("mode_incompatible") ||
      finding.code.startsWith("invalid_target") ||
      finding.code.startsWith("invalid_load") ||
      finding.code.startsWith("missing_load") ||
      finding.code.startsWith("invalid_effort") ||
      finding.code.startsWith("invalid_quality_limited") ||
      finding.code.startsWith("duplicate_quality_limited") ||
      finding.code.startsWith("invalid_laterality") ||
      finding.code.startsWith("invalid_side") ||
      finding.code.startsWith("invalid_support") ||
      finding.code.startsWith("invalid_lever") ||
      finding.code.startsWith("invalid_range") ||
      finding.code.startsWith("invalid_tempo") ||
      finding.code.startsWith("legacy_tempo") ||
      finding.code.startsWith("invalid_legacy_tempo") ||
      finding.code.startsWith("invalid_breathing_cadence") ||
      finding.code.startsWith("invalid_locomotor_cadence") ||
      finding.code.startsWith("invalid_cadence"))
  );
}

function isExecutionErrorFinding(finding: PrescriptionValidationFinding): boolean {
  return (
    finding.severity === "error" &&
    (finding.code.startsWith("invalid_execution") ||
      finding.code.startsWith("missing_execution") ||
      finding.code.startsWith("duplicate_execution"))
  );
}

function enumFinding(
  code: string,
  targetId?: string,
): PrescriptionValidationFinding {
  return prescriptionFinding(
    "error",
    code,
    "Value must use a supported runtime enum member.",
    targetId,
  );
}

function objectFinding(
  code: string,
  label: string,
  targetId?: string,
): PrescriptionValidationFinding {
  return prescriptionFinding(
    "error",
    code,
    `${label} must be a structured object.`,
    targetId,
  );
}

function isValidSide(value: unknown): value is (typeof PRESCRIPTION_SIDES)[number] {
  return isOneOf(value, PRESCRIPTION_SIDES);
}

function isOneOf<const T extends readonly string[]>(
  value: unknown,
  allowed: T,
): value is T[number] {
  return typeof value === "string" && allowed.includes(value);
}

function stringOrUndefined(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function asRecord(value: unknown): Readonly<Record<string, unknown>> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Readonly<Record<string, unknown>>)
    : null;
}

function isExplicitIsoDateTime(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(Z|[+-]\d{2}:\d{2})$/.exec(
    value,
  );
  if (!match) {
    return false;
  }
  const [, yearText, monthText, dayText, hourText, minuteText, secondText, zone] =
    match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const hour = Number(hourText);
  const minute = Number(minuteText);
  const second = Number(secondText);
  if (
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > daysInMonth(year, month) ||
    hour > 23 ||
    minute > 59 ||
    second > 59
  ) {
    return false;
  }
  if (zone !== "Z") {
    const [offsetHourText, offsetMinuteText] = zone.slice(1).split(":");
    const offsetHour = Number(offsetHourText);
    const offsetMinute = Number(offsetMinuteText);
    if (offsetHour > 23 || offsetMinute > 59) {
      return false;
    }
  }
  return Number.isFinite(Date.parse(value));
}

function daysInMonth(year: number, month: number): number {
  return [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][
    month - 1
  ]!;
}

function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}
