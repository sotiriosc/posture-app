import {
  evaluateEquipmentRequirement,
  type EquipmentCapabilities,
} from "../domain/equipment";
import type { ExerciseDefinition } from "../domain/exercise";
import { validateEquipmentCapabilities } from "../validation";
import type {
  CountTarget,
  ExerciseDose,
  NumericTarget,
} from "./dose";
import type {
  EffortTarget,
  ExecutionQualityCriterion,
  ExecutionStandard,
  NumericEffortTarget,
  TempoPrescription,
} from "./executionStandard";
import type {
  BandTensionMagnitude,
  LoadTarget,
  MachineSettingMagnitude,
  NumericLoadMagnitude,
} from "./load";
import type { ExercisePrescription } from "./prescription";
import {
  prescriptionFinding,
  type PrescriptionValidationFinding,
} from "./types";

export type PrescriptionContextValidationStatus =
  | "VALID_PRESCRIPTION_CONTEXT"
  | "INVALID_EQUIPMENT_INPUT"
  | "MISSING_REQUIRED_EQUIPMENT"
  | "INVALID_DOSE"
  | "UNRESOLVED_EXECUTION_REQUIREMENT";

export interface PrescriptionContextValidationResult {
  readonly status: PrescriptionContextValidationStatus;
  readonly findings: readonly PrescriptionValidationFinding[];
}

const DOSE_MODES = [
  "repetition_sets",
  "timed_hold",
  "breath_cycles",
  "distance_carry",
  "timed_carry",
  "step_march",
] as const;

export function validatePrescription(
  prescription: ExercisePrescription,
): readonly PrescriptionValidationFinding[] {
  const findings: PrescriptionValidationFinding[] = [];

  if (prescription.prescriptionId.trim().length === 0) {
    findings.push(
      prescriptionFinding(
        "error",
        "missing_prescription_id",
        "Structured prescription requires a stable prescriptionId.",
        prescription.exerciseId,
      ),
    );
  }
  if (prescription.sourceExposureEventId.trim().length === 0) {
    findings.push(
      prescriptionFinding(
        "error",
        "missing_source_exposure_event_id",
        "Structured prescription requires one stable source exposure event id.",
        prescription.exerciseId,
      ),
    );
  }
  if (prescription.createdAt.trim().length === 0) {
    findings.push(
      prescriptionFinding(
        "error",
        "missing_explicit_prescription_time",
        "Prescription time must be supplied explicitly; the engine must not read a hidden clock.",
        prescription.exerciseId,
      ),
    );
  }

  const executionFindings = validateExecutionStandard(
    prescription.executionStandard,
    prescription.exerciseId,
  );
  findings.push(...executionFindings);
  findings.push(
    ...validateDose(
      prescription.dose,
      prescription.executionStandard,
      prescription.exerciseId,
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
  if (equipmentFindings.some((finding) => finding.severity === "error")) {
    return { status: "INVALID_EQUIPMENT_INPUT", findings };
  }

  const missingEquipment = input.exercise.equipmentRequirements
    .map((requirement) =>
      evaluateEquipmentRequirement(input.equipment, requirement),
    )
    .filter((result) => !result.satisfied);

  if (missingEquipment.length > 0) {
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
    return { status: "MISSING_REQUIRED_EQUIPMENT", findings };
  }

  const prescriptionFindings = validatePrescription(input.prescription);
  findings.push(...prescriptionFindings);

  if (
    prescriptionFindings.some((finding) =>
      finding.code.startsWith("invalid_dose") ||
      finding.code.startsWith("missing_dose") ||
      finding.code.startsWith("mode_incompatible") ||
      finding.code.startsWith("invalid_target") ||
      finding.code.startsWith("invalid_load") ||
      finding.code.startsWith("missing_load"),
    )
  ) {
    return { status: "INVALID_DOSE", findings };
  }

  if (
    prescriptionFindings.some((finding) =>
      finding.code.startsWith("invalid_execution") ||
      finding.code.startsWith("missing_execution") ||
      finding.code.startsWith("duplicate_execution") ||
      finding.code.startsWith("invalid_quality_limited_effort"),
    )
  ) {
    return { status: "UNRESOLVED_EXECUTION_REQUIREMENT", findings };
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
  if (!DOSE_MODES.includes(mode as (typeof DOSE_MODES)[number])) {
    return [
      prescriptionFinding(
        "error",
        "invalid_dose_mode",
        "Exercise dose must use a supported discriminated mode.",
        targetId,
      ),
    ];
  }

  switch (mode) {
    case "repetition_sets":
      findings.push(
        ...requireFields(record, ["sets", "repetitions"], targetId),
        ...forbidFields(
          record,
          [
            "duration",
            "rounds",
            "breathCycles",
            "trips",
            "distancePerTrip",
            "durationPerTrip",
            "steps",
            "stationary",
            "marchControlStandard",
            "gaitControlStandard",
          ],
          targetId,
        ),
        ...validateCountTarget(record.sets, "sets", targetId),
        ...validateCountTarget(record.repetitions, "repetitions", targetId),
      );
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
        ...forbidFields(
          record,
          [
            "repetitions",
            "rounds",
            "breathCycles",
            "trips",
            "distancePerTrip",
            "durationPerTrip",
            "steps",
            "stationary",
            "marchControlStandard",
            "gaitControlStandard",
          ],
          targetId,
        ),
        ...validateCountTarget(record.sets, "sets", targetId),
        ...validatePositiveFiniteTarget(record.duration, "duration", targetId),
      );
      break;
    case "breath_cycles":
      findings.push(
        ...requireFields(record, ["rounds", "breathCycles"], targetId),
        ...forbidFields(
          record,
          [
            "repetitions",
            "sets",
            "duration",
            "trips",
            "distancePerTrip",
            "durationPerTrip",
            "steps",
            "stationary",
            "gaitControlStandard",
          ],
          targetId,
        ),
        ...validateCountTarget(record.rounds, "rounds", targetId),
        ...validateCountTarget(record.breathCycles, "breathCycles", targetId),
      );
      break;
    case "distance_carry":
      findings.push(
        ...requireFields(record, ["trips", "distancePerTrip", "gaitControlStandard"], targetId),
        ...forbidFields(
          record,
          ["durationPerTrip", "steps", "stationary", "marchControlStandard"],
          targetId,
        ),
        ...validateCountTarget(record.trips, "trips", targetId),
        ...validatePositiveFiniteTarget(
          record.distancePerTrip,
          "distancePerTrip",
          targetId,
        ),
      );
      break;
    case "timed_carry":
      findings.push(
        ...requireFields(record, ["trips", "durationPerTrip", "gaitControlStandard"], targetId),
        ...forbidFields(
          record,
          ["distancePerTrip", "steps", "stationary", "marchControlStandard"],
          targetId,
        ),
        ...validateCountTarget(record.trips, "trips", targetId),
        ...validatePositiveFiniteTarget(
          record.durationPerTrip,
          "durationPerTrip",
          targetId,
        ),
      );
      break;
    case "step_march":
      findings.push(
        ...requireFields(record, ["stationary", "marchControlStandard"], targetId),
        ...forbidFields(
          record,
          ["distancePerTrip", "trips", "gaitControlStandard"],
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
        findings.push(...validateCountTarget(record.steps, "steps", targetId));
      }
      if (Object.hasOwn(record, "duration")) {
        findings.push(
          ...validatePositiveFiniteTarget(record.duration, "duration", targetId),
        );
      }
      break;
  }

  if (Object.hasOwn(record, "rest")) {
    findings.push(...validatePositiveFiniteTarget(record.rest, "rest", targetId));
  }
  if (Object.hasOwn(record, "load")) {
    findings.push(...validateLoadTarget(record.load as LoadTarget, targetId));
  }
  if (Object.hasOwn(record, "effort")) {
    findings.push(
      ...validateEffortTarget(
        record.effort as EffortTarget,
        requiredCriterionIds(executionStandard),
        targetId,
      ),
    );
  }
  if (Object.hasOwn(record, "tempo")) {
    findings.push(
      ...validateTempo(record.tempo as TempoPrescription, targetId),
    );
  }

  return findings;
}

export function validateExecutionStandard(
  standard: ExecutionStandard,
  targetId?: string,
): readonly PrescriptionValidationFinding[] {
  const findings: PrescriptionValidationFinding[] = [];

  if (standard.exerciseMechanicsIntent.trim().length === 0) {
    findings.push(
      prescriptionFinding(
        "error",
        "missing_execution_mechanics_intent",
        "Execution standard requires an explicit exercise mechanics intent.",
        targetId,
      ),
    );
  }

  const ids = new Set<string>();
  for (const criterion of standard.criteria) {
    if (criterion.id.trim().length === 0) {
      findings.push(
        prescriptionFinding(
          "error",
          "missing_execution_criterion_id",
          "Execution quality criterion requires a stable id.",
          targetId,
        ),
      );
    }
    if (ids.has(criterion.id)) {
      findings.push(
        prescriptionFinding(
          "error",
          "duplicate_execution_criterion_id",
          "Execution quality criteria must have unique ids.",
          targetId,
        ),
      );
    }
    ids.add(criterion.id);
    findings.push(...validateCriterion(criterion, targetId));
  }

  return findings;
}

function validateCriterion(
  criterion: ExecutionQualityCriterion,
  targetId?: string,
): readonly PrescriptionValidationFinding[] {
  const findings: PrescriptionValidationFinding[] = [];

  if (criterion.description.trim().length === 0) {
    findings.push(
      prescriptionFinding(
        "error",
        "missing_execution_criterion_description",
        "Execution criterion description is required for review, but must not be parsed for behavior.",
        targetId,
      ),
    );
  }
  if (
    criterion.importance === "required_for_progression" &&
    criterion.provenance.sourceRef.trim().length === 0
  ) {
    findings.push(
      prescriptionFinding(
        "error",
        "invalid_execution_required_criterion_provenance",
        "Required execution criteria must be individually traceable to provenance.",
        targetId,
      ),
    );
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
  });
}

function validatePositiveFiniteTarget(
  target: unknown,
  label: string,
  targetId?: string,
): readonly PrescriptionValidationFinding[] {
  return validateNumericTarget(target, label, targetId, {
    integer: false,
    positive: true,
  });
}

function validateNumericTarget(
  target: unknown,
  label: string,
  targetId: string | undefined,
  rules: {
    readonly integer: boolean;
    readonly positive: boolean;
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

  if (record.kind === "unknown" || record.kind === "not_prescribed") {
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
    findings.push(...validateNumber(record.value, label, targetId, rules));
    return findings;
  }
  if (record.kind === "range") {
    findings.push(
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

function validateLoadTarget(
  load: LoadTarget,
  targetId?: string,
): readonly PrescriptionValidationFinding[] {
  const findings: PrescriptionValidationFinding[] = [];
  const record = asRecord(load);
  if (!record) {
    return [
      prescriptionFinding(
        "error",
        "invalid_load_object",
        "Load target must be structured.",
        targetId,
      ),
    ];
  }

  switch (record.kind) {
    case "bodyweight":
    case "not_prescribed":
      return findings;
    case "unknown":
      if (typeof record.reason !== "string" || record.reason.trim().length === 0) {
        findings.push(
          prescriptionFinding(
            "error",
            "invalid_load_unknown_reason",
            "Unknown load requires an explicit reason and is not zero.",
            targetId,
          ),
        );
      }
      return findings;
    case "external_load":
      if (record.application === "unilateral_side" && !record.side) {
        findings.push(
          prescriptionFinding(
            "error",
            "missing_load_side_truth",
            "One-sided external load requires explicit load side truth.",
            targetId,
          ),
        );
      }
      findings.push(
        ...validateNumericLoadMagnitude(
          record.target as NumericLoadMagnitude,
          "external load",
          targetId,
        ),
      );
      return findings;
    case "machine_stack":
      findings.push(
        ...validateMachineSettingOrNumeric(
          record.target as MachineSettingMagnitude | NumericLoadMagnitude,
          "machine stack load",
          targetId,
        ),
      );
      return findings;
    case "cable_stack":
      findings.push(
        ...validateMachineSettingOrNumeric(
          record.target as MachineSettingMagnitude | NumericLoadMagnitude,
          "cable stack load",
          targetId,
        ),
      );
      return findings;
    case "band_tension":
      findings.push(
        ...validateBandTension(record.target as BandTensionMagnitude, targetId),
      );
      return findings;
    case "user_selected_by_effort":
      findings.push(
        ...validateEffortTarget(record.effort as EffortTarget, [], targetId),
      );
      return findings;
    default:
      return [
        prescriptionFinding(
          "error",
          "invalid_load_kind",
          "Load target kind is unsupported.",
          targetId,
        ),
      ];
  }
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
    return validateNumber(record.value, label, targetId, {
      integer: false,
      positive: true,
    });
  }
  if (record.kind === "range") {
    const findings = [
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
  if (Object.hasOwn(record, "value") || Object.hasOwn(record, "unit")) {
    return validateNumericLoadMagnitude(
      target as NumericLoadMagnitude,
      label,
      targetId,
    );
  }
  if (record.kind === "exact") {
    return validateNumber(record.setting, label, targetId, {
      integer: false,
      positive: true,
    });
  }
  if (record.kind === "range") {
    const findings = [
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
  if (
    record.kind === "reviewed_band_reference" &&
    (typeof record.referenceId !== "string" ||
      record.referenceId.trim().length === 0)
  ) {
    return [
      prescriptionFinding(
        "error",
        "invalid_load_band_reference",
        "Reviewed band tension requires a stable reference id.",
        targetId,
      ),
    ];
  }
  return [];
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
  if (record.kind === "rir") {
    return validateBoundedEffort(
      record.target as NumericEffortTarget,
      "RIR",
      0,
      10,
      targetId,
    );
  }
  if (record.kind === "rpe") {
    return validateBoundedEffort(
      record.target as NumericEffortTarget,
      "RPE",
      1,
      10,
      targetId,
    );
  }
  if (record.kind === "quality_limited") {
    const ids = Array.isArray(record.requiredCriterionIds)
      ? record.requiredCriterionIds
      : [];
    if (ids.length === 0) {
      return [
        prescriptionFinding(
          "error",
          "invalid_quality_limited_effort_empty",
          "Quality-limited effort must reference required execution criteria.",
          targetId,
        ),
      ];
    }
    const unknownIds = ids.filter((id) => !requiredIds.includes(id));
    return unknownIds.map((id) =>
      prescriptionFinding(
        "error",
        "invalid_quality_limited_effort_criterion_ref",
        `Quality-limited effort references unknown required criterion ${id}.`,
        targetId,
      ),
    );
  }
  return [];
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
  const values =
    record.kind === "exact"
      ? [record.value]
      : record.kind === "range"
        ? [record.min, record.max]
        : [];
  const findings = values.flatMap((value) =>
    validateNumber(value, label, targetId, {
      integer: false,
      positive: false,
    }),
  );
  if (record.kind === "range" && Number(record.min) > Number(record.max)) {
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

function validateTempo(
  tempo: TempoPrescription,
  targetId?: string,
): readonly PrescriptionValidationFinding[] {
  return [
    tempo.eccentricSeconds,
    tempo.pauseSeconds,
    tempo.topOrEndRangePauseSeconds,
  ].flatMap((value) => {
    if (value === undefined) {
      return [];
    }
    const findings = validateNumber(value, "tempo duration", targetId, {
      integer: false,
      positive: false,
    });
    if (typeof value === "number" && Number.isFinite(value) && value < 0) {
      return [
        ...findings,
        prescriptionFinding(
          "error",
          "invalid_target_negative_tempo",
          "Tempo duration cannot be negative.",
          targetId,
        ),
      ];
    }
    return findings;
  });
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

function forbidFields(
  record: Readonly<Record<string, unknown>>,
  fields: readonly string[],
  targetId?: string,
): readonly PrescriptionValidationFinding[] {
  return fields
    .filter((field) => Object.hasOwn(record, field))
    .map((field) =>
      prescriptionFinding(
        "error",
        "mode_incompatible_dose_field",
        `Dose mode ${String(record.mode)} must not carry ${field}.`,
        targetId,
      ),
    );
}

function requiredCriterionIds(
  standard?: ExecutionStandard,
): readonly string[] {
  return (
    standard?.criteria
      .filter((criterion) => criterion.importance === "required_for_progression")
      .map((criterion) => criterion.id) ?? []
  );
}

function asRecord(value: unknown): Readonly<Record<string, unknown>> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Readonly<Record<string, unknown>>)
    : null;
}
