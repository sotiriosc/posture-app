import type { ExerciseDoseMode, NumericTarget } from "../dose";
import type { EffortTarget } from "../executionStandard";
import type {
  PrescriptionPolicyDoseRuleValue,
  PrescriptionPolicyRuleVariant,
  PrescriptionPolicyUseCase,
  ProductionPrescriptionPolicy,
  ProductionPrescriptionPolicyRule,
} from "./policyContracts";
import { PRESCRIPTION_POLICY_SPECIFICITY_ORDER } from "./policyContracts";

export const PRESCRIPTION_POLICY_V1_ID =
  "PRESCRIPTION_POLICY_V1_STABLE_ADAPTIVE_CORE" as const;
export const PRESCRIPTION_POLICY_V1_VERSION = "1.0.0" as const;
export const PRESCRIPTION_POLICY_V1_REVIEWED_AT =
  "2026-08-13T15:02:00-04:00" as const;
export const PRESCRIPTION_POLICY_V1_REVIEWER_ID = "sotiriosc" as const;
export const PRESCRIPTION_POLICY_V1_STATE = "reviewed_not_activated" as const;
export const PRESCRIPTION_POLICY_V1_PHILOSOPHY =
  "Praxis prescribes the smallest supporting dose that truthfully prepares the person, and a productive developmental dose that serves the session's actual purpose." as const;

/** Frozen display projection retained for historical CAGT report equivalence. */
export const PRESCRIPTION_POLICY_V1_ADMISSION_SPECIFICITY_ORDER = Object.freeze([
  "TrainingSafety authority",
  "hard contraindication and explicit restriction",
  "exercise-knowledge legality",
  "unresolved pain/response requirement",
  "assignment section and role",
  "selected dose mode",
  "explicit session goal",
  "current equipment realization",
  "continuity/prior Prescription",
  "experience and familiarity",
  "structural capacity",
  "phase applicability",
  "broad V1 default",
] as const);

const provenance = (ruleId: string) => ({
  source: "policy" as const,
  sourceRef: `PRESCRIPTION_POLICY_V1_STABLE_ADAPTIVE_CORE@1.0.0:${ruleId}`,
});

const exact = <Unit extends string>(value: number, unit: Unit): NumericTarget<Unit> => ({
  kind: "exact",
  value,
  unit,
});

const range = <Unit extends string>(
  min: number,
  max: number,
  unit: Unit,
): NumericTarget<Unit> => ({ kind: "range", min, max, unit });

const quality = (description: string): EffortTarget => ({
  kind: "quality_limited",
  requiredCriterionIds: ["prescription:v1:quality-limited"],
  description,
});

const moderate = (): EffortTarget => ({
  kind: "phase_qualitative_band",
  band: "moderate",
});

const easy = (): EffortTarget => ({
  kind: "phase_qualitative_band",
  band: "easy",
});

const rir = (min: number, max: number): EffortTarget => ({
  kind: "rir",
  target: { kind: "range", min, max },
});

function rule(input: {
  readonly id: string;
  readonly useCase: PrescriptionPolicyUseCase;
  readonly mode: ExerciseDoseMode;
  readonly variant: PrescriptionPolicyRuleVariant;
  readonly value: PrescriptionPolicyDoseRuleValue;
  readonly overrideOf?: readonly string[];
}): ProductionPrescriptionPolicyRule {
  return Object.freeze({
    ruleId: `PRESCRIPTION_POLICY_V1:${input.id}`,
    kind: "dose_rule" as const,
    specificityLevel: input.variant === "default" || input.variant === "standard"
      ? "broad_v1_default" as const
      : "experience_and_familiarity" as const,
    applicability: {
      useCase: input.useCase,
      doseMode: input.mode,
      variant: input.variant,
    },
    value: Object.freeze(input.value),
    overrideOfRuleIds: input.overrideOf ?? [],
    conflictsWithRuleIds: [],
    provenance: provenance(input.id),
  });
}

const noRest = null;
const supportingQuality = quality("Quality remains the limiting standard.");

const RULES: readonly ProductionPrescriptionPolicyRule[] = Object.freeze([
  rule({ id: "preparation.repetition.default", useCase: "preparation", mode: "repetition_sets", variant: "default", value: { unit: "sets", count: exact(1, "count"), repetitions: range(4, 8, "count"), effort: supportingQuality, betweenUnitsRest: noRest } }),
  rule({ id: "preparation.repetition.two_sets", useCase: "preparation", mode: "repetition_sets", variant: "scoped_override", overrideOf: ["PRESCRIPTION_POLICY_V1:preparation.repetition.default"], value: { unit: "sets", count: exact(2, "count"), repetitions: range(4, 8, "count"), effort: supportingQuality, betweenUnitsRest: range(15, 45, "seconds") } }),
  rule({ id: "preparation.hold.default", useCase: "preparation", mode: "timed_hold", variant: "default", value: { unit: "sets", count: exact(1, "count"), duration: range(10, 20, "seconds"), effort: supportingQuality, betweenUnitsRest: noRest } }),
  rule({ id: "preparation.hold.two_sets", useCase: "preparation", mode: "timed_hold", variant: "scoped_override", overrideOf: ["PRESCRIPTION_POLICY_V1:preparation.hold.default"], value: { unit: "sets", count: exact(2, "count"), duration: range(10, 20, "seconds"), effort: supportingQuality, betweenUnitsRest: range(15, 45, "seconds") } }),
  rule({ id: "preparation.breath.default", useCase: "preparation", mode: "breath_cycles", variant: "default", value: { unit: "rounds", count: exact(1, "count"), breathCycles: range(3, 5, "breath_cycles"), effort: supportingQuality, betweenUnitsRest: noRest } }),
  rule({ id: "preparation.breath.two_rounds", useCase: "preparation", mode: "breath_cycles", variant: "scoped_override", overrideOf: ["PRESCRIPTION_POLICY_V1:preparation.breath.default"], value: { unit: "rounds", count: exact(2, "count"), breathCycles: range(3, 5, "breath_cycles"), effort: supportingQuality, betweenUnitsRest: range(30, 60, "seconds") } }),
  rule({ id: "preparation.steps.default", useCase: "preparation", mode: "step_sets", variant: "default", value: { unit: "sets", count: exact(1, "count"), steps: range(6, 10, "steps"), effort: supportingQuality, betweenUnitsRest: noRest, perSide: true } }),
  rule({ id: "preparation.steps.two_sets", useCase: "preparation", mode: "step_sets", variant: "scoped_override", overrideOf: ["PRESCRIPTION_POLICY_V1:preparation.steps.default"], value: { unit: "sets", count: exact(2, "count"), steps: range(6, 10, "steps"), effort: supportingQuality, betweenUnitsRest: range(15, 45, "seconds"), perSide: true } }),
  rule({ id: "preparation.march.count", useCase: "supporting_stationary_march", mode: "step_march", variant: "count_realization", value: { unit: "sets", count: exact(1, "count"), steps: range(12, 20, "steps"), effort: supportingQuality, betweenUnitsRest: noRest } }),
  rule({ id: "preparation.march.duration", useCase: "supporting_stationary_march", mode: "step_march", variant: "duration_realization", value: { unit: "sets", count: exact(1, "count"), duration: range(15, 25, "seconds"), effort: supportingQuality, betweenUnitsRest: noRest } }),
  rule({ id: "preparation.march.count.two_sets", useCase: "supporting_stationary_march", mode: "step_march", variant: "count_realization_scoped_override", overrideOf: ["PRESCRIPTION_POLICY_V1:preparation.march.count"], value: { unit: "sets", count: exact(2, "count"), steps: range(12, 20, "steps"), effort: supportingQuality, betweenUnitsRest: range(15, 45, "seconds") } }),
  rule({ id: "preparation.march.duration.two_sets", useCase: "supporting_stationary_march", mode: "step_march", variant: "duration_realization_scoped_override", overrideOf: ["PRESCRIPTION_POLICY_V1:preparation.march.duration"], value: { unit: "sets", count: exact(2, "count"), duration: range(15, 25, "seconds"), effort: supportingQuality, betweenUnitsRest: range(15, 45, "seconds") } }),

  rule({ id: "activation.repetition.default", useCase: "activation", mode: "repetition_sets", variant: "default", value: { unit: "sets", count: exact(1, "count"), repetitions: range(6, 12, "count"), effort: supportingQuality, betweenUnitsRest: noRest } }),
  rule({ id: "activation.repetition.two_sets", useCase: "activation", mode: "repetition_sets", variant: "scoped_override", overrideOf: ["PRESCRIPTION_POLICY_V1:activation.repetition.default"], value: { unit: "sets", count: exact(2, "count"), repetitions: range(6, 12, "count"), effort: supportingQuality, betweenUnitsRest: range(15, 45, "seconds") } }),
  rule({ id: "activation.hold.default", useCase: "activation", mode: "timed_hold", variant: "default", value: { unit: "sets", count: exact(1, "count"), duration: range(10, 20, "seconds"), effort: supportingQuality, betweenUnitsRest: noRest } }),
  rule({ id: "activation.hold.two_sets", useCase: "activation", mode: "timed_hold", variant: "scoped_override", overrideOf: ["PRESCRIPTION_POLICY_V1:activation.hold.default"], value: { unit: "sets", count: exact(2, "count"), duration: range(10, 20, "seconds"), effort: supportingQuality, betweenUnitsRest: range(15, 45, "seconds") } }),
  rule({ id: "activation.steps.default", useCase: "activation", mode: "step_sets", variant: "default", value: { unit: "sets", count: exact(1, "count"), steps: range(8, 12, "steps"), effort: supportingQuality, betweenUnitsRest: noRest, perSide: true } }),
  rule({ id: "activation.steps.two_sets", useCase: "activation", mode: "step_sets", variant: "scoped_override", overrideOf: ["PRESCRIPTION_POLICY_V1:activation.steps.default"], value: { unit: "sets", count: exact(2, "count"), steps: range(8, 12, "steps"), effort: supportingQuality, betweenUnitsRest: range(15, 45, "seconds"), perSide: true } }),

  rule({ id: "main_strength.standard", useCase: "main_strength", mode: "repetition_sets", variant: "standard", value: { unit: "sets", count: exact(3, "count"), repetitions: range(3, 6, "count"), effort: rir(1, 3), betweenUnitsRest: range(180, 300, "seconds") } }),
  rule({ id: "main_strength.regression", useCase: "main_strength", mode: "repetition_sets", variant: "regression", overrideOf: ["PRESCRIPTION_POLICY_V1:main_strength.standard"], value: { unit: "sets", count: exact(2, "count"), repetitions: range(3, 6, "count"), effort: rir(2, 4), betweenUnitsRest: range(120, 240, "seconds") } }),
  rule({ id: "secondary_strength.default", useCase: "secondary_strength", mode: "repetition_sets", variant: "default", value: { unit: "sets", count: exact(2, "count"), repetitions: range(5, 10, "count"), effort: rir(2, 3), betweenUnitsRest: range(90, 180, "seconds") } }),
  rule({ id: "secondary_strength.three_sets", useCase: "secondary_strength", mode: "repetition_sets", variant: "scoped_override", overrideOf: ["PRESCRIPTION_POLICY_V1:secondary_strength.default"], value: { unit: "sets", count: exact(3, "count"), repetitions: range(5, 10, "count"), effort: rir(2, 3), betweenUnitsRest: range(90, 180, "seconds") } }),
  rule({ id: "main_hypertrophy.standard", useCase: "main_hypertrophy", mode: "repetition_sets", variant: "standard", value: { unit: "sets", count: exact(3, "count"), repetitions: range(6, 20, "count"), effort: rir(1, 3), betweenUnitsRest: range(90, 180, "seconds") } }),
  rule({ id: "main_hypertrophy.regression", useCase: "main_hypertrophy", mode: "repetition_sets", variant: "regression", overrideOf: ["PRESCRIPTION_POLICY_V1:main_hypertrophy.standard"], value: { unit: "sets", count: exact(2, "count"), repetitions: range(6, 15, "count"), effort: rir(2, 4), betweenUnitsRest: range(90, 180, "seconds") } }),
  rule({ id: "hypertrophy_accessory.required", useCase: "hypertrophy_accessory", mode: "repetition_sets", variant: "required", value: { unit: "sets", count: exact(2, "count"), repetitions: range(8, 20, "count"), effort: rir(1, 3), betweenUnitsRest: range(60, 120, "seconds") } }),
  rule({ id: "hypertrophy_accessory.optional", useCase: "hypertrophy_accessory", mode: "repetition_sets", variant: "preferred_optional", value: { unit: "sets", count: exact(1, "count"), repetitions: range(8, 20, "count"), effort: rir(2, 4), betweenUnitsRest: range(60, 120, "seconds") } }),
  rule({ id: "direct_accessory.required", useCase: "direct_accessory", mode: "repetition_sets", variant: "required", value: { unit: "sets", count: exact(2, "count"), repetitions: range(8, 20, "count"), effort: rir(1, 3), betweenUnitsRest: range(60, 120, "seconds") } }),
  rule({ id: "direct_accessory.optional", useCase: "direct_accessory", mode: "repetition_sets", variant: "preferred_optional", value: { unit: "sets", count: exact(1, "count"), repetitions: range(8, 20, "count"), effort: rir(2, 4), betweenUnitsRest: range(45, 90, "seconds") } }),

  rule({ id: "timed_hold.developmental", useCase: "timed_hold", mode: "timed_hold", variant: "default", value: { unit: "sets", count: exact(2, "count"), duration: range(20, 40, "seconds"), effort: moderate(), betweenUnitsRest: range(60, 120, "seconds") } }),
  rule({ id: "breath_cycles.default", useCase: "breath_cycles", mode: "breath_cycles", variant: "default", value: { unit: "rounds", count: exact(1, "count"), breathCycles: range(3, 5, "breath_cycles"), effort: supportingQuality, betweenUnitsRest: noRest } }),
  rule({ id: "breath_cycles.two_rounds", useCase: "breath_cycles", mode: "breath_cycles", variant: "scoped_override", overrideOf: ["PRESCRIPTION_POLICY_V1:breath_cycles.default"], value: { unit: "rounds", count: exact(2, "count"), breathCycles: range(3, 5, "breath_cycles"), effort: supportingQuality, betweenUnitsRest: range(30, 60, "seconds") } }),
  rule({ id: "carry.capacity.distance", useCase: "capacity_carry", mode: "distance_carry", variant: "default", value: { unit: "trips", count: exact(3, "count"), distance: range(15, 30, "metres"), effort: moderate(), betweenUnitsRest: range(90, 180, "seconds") } }),
  rule({ id: "carry.capacity.timed", useCase: "capacity_carry", mode: "timed_carry", variant: "default", value: { unit: "trips", count: exact(3, "count"), duration: range(20, 40, "seconds"), effort: moderate(), betweenUnitsRest: range(90, 180, "seconds") } }),
  rule({ id: "carry.accessory.distance", useCase: "accessory_carry", mode: "distance_carry", variant: "default", value: { unit: "trips", count: exact(2, "count"), distance: range(10, 20, "metres"), effort: moderate(), betweenUnitsRest: range(60, 120, "seconds") } }),
  rule({ id: "carry.accessory.timed", useCase: "accessory_carry", mode: "timed_carry", variant: "default", value: { unit: "trips", count: exact(2, "count"), duration: range(15, 25, "seconds"), effort: moderate(), betweenUnitsRest: range(60, 120, "seconds") } }),
  rule({ id: "march.developmental.count", useCase: "developmental_stationary_march", mode: "step_march", variant: "count_realization", value: { unit: "sets", count: exact(2, "count"), steps: range(20, 40, "steps"), effort: moderate(), betweenUnitsRest: range(60, 120, "seconds") } }),
  rule({ id: "march.developmental.duration", useCase: "developmental_stationary_march", mode: "step_march", variant: "duration_realization", value: { unit: "sets", count: exact(2, "count"), duration: range(20, 40, "seconds"), effort: moderate(), betweenUnitsRest: range(60, 120, "seconds") } }),
  rule({ id: "steps.supporting", useCase: "supporting_counted_steps", mode: "step_sets", variant: "default", value: { unit: "sets", count: exact(1, "count"), steps: range(6, 10, "steps"), effort: supportingQuality, betweenUnitsRest: noRest, perSide: true } }),
  rule({ id: "steps.developmental", useCase: "developmental_counted_steps", mode: "step_sets", variant: "default", value: { unit: "sets", count: exact(2, "count"), steps: range(8, 15, "steps"), effort: moderate(), betweenUnitsRest: range(60, 120, "seconds"), perSide: true } }),
  rule({ id: "recovery.breath", useCase: "recovery_cooldown", mode: "breath_cycles", variant: "default", value: { unit: "rounds", count: exact(1, "count"), breathCycles: range(3, 5, "breath_cycles"), effort: easy(), betweenUnitsRest: noRest } }),
  rule({ id: "recovery.hold", useCase: "recovery_cooldown", mode: "timed_hold", variant: "default", value: { unit: "sets", count: exact(1, "count"), duration: range(20, 40, "seconds"), effort: easy(), betweenUnitsRest: noRest } }),
]);

export const PRESCRIPTION_POLICY_V1_REST_PLACEMENT = Object.freeze({
  betweenSets: {
    preparationActivationSeconds: [15, 45],
    mainStrengthSeconds: [180, 300],
    secondaryStrengthSeconds: [90, 180],
    mainHypertrophySeconds: [90, 180],
    accessoryDirectSeconds: [60, 120],
    specialModeSeconds: [60, 120],
  },
  betweenPreparatoryBlocksSeconds: [15, 45],
  beforeDevelopmentalBlockSeconds: [60, 180],
  betweenRoundsSeconds: [30, 60],
  betweenTripsSeconds: [60, 180],
  betweenSides: "only_when_exercise_knowledge_or_explicit_requirement_requires_it",
  afterFinalBlock: "not_prescribed",
  interExerciseTransition: "SEQUENCING_OWNED",
  setupTime: "SEQUENCING_OWNED",
} as const);

export const PRESCRIPTION_POLICY_V1_RULE_MATRIX = Object.freeze({
  preparation: { default: "1 set; dynamic 4-8 reps, hold 10-20 seconds, breathing 3-5 cycles, or 6-10 steps/side; quality_limited", scopedOverride: "2 sets only for an explicit dependency, unfamiliar task, new equipment, reviewed range/control dependency, shared dependency, or successful bounded prior evidence", forbidden: "3 sets or developmental weekly credit" },
  activation: { default: "1 set; dynamic 6-12 reps, hold 10-20 seconds, or 8-12 steps/side; quality_limited", scopedOverride: "2 sets only for required low-fatigue control work that preserves main work and has no adverse fatigue response", forbidden: "failure-oriented activation or implicit hypertrophy credit" },
  mainStrength: { standard: "3 sets; 3-6 reps; 1-3 RIR; 180-300 seconds rest", regression: "2 sets; 3-6 reps; 2-4 RIR; 120-240 seconds rest", forbidden: "5-set default" },
  secondaryStrength: { default: "2 sets; 5-10 reps; 2-3 RIR; 90-180 seconds rest", scopedOverride: "3 sets only when required, weekly-prioritized, capacity-supported, non-conflicting, and non-redundant" },
  mainHypertrophy: { standard: "3 sets; 6-20 reps; 1-3 RIR; 90-180 seconds rest", regression: "2 sets; 6-15 reps; 2-4 RIR; 90-180 seconds rest", forbidden: "five high-effort sets as default" },
  hypertrophyAccessory: { default: "1-2 sets; 8-20 reps; 1-3 RIR; 60-120 seconds rest", oneSet: "preferred/optional, condensed, overlapping, first exposure, or insufficient response history", twoSets: "required unique value with coherent remaining capacity" },
  directAccessory: { required: "2 sets; 8-20 reps; 1-3 RIR; 60-120 seconds rest", preferredOptional: "1 set; 8-20 reps; 2-4 RIR; 45-90 seconds rest", exactActionTruthRequired: true },
  timedHold: { preparationActivation: "1 set; 10-20 seconds; quality_limited", developmental: "2 sets; 20-40 seconds; quality_limited or moderate; 60-120 seconds rest", thirdSet: "future_response_led_override_only" },
  breathCycles: { default: "1 round; 3-5 cycles; qualitative cadence or no cadence; no developmental credit", twoRounds: "explicit required preparation/recovery responsibility or reviewed successful response with spare capacity" },
  carry: { capacityMain: "3 trips; 15-30 metres or 20-40 seconds; moderate/quality_limited; 90-180 seconds rest", accessory: "2 trips; 10-20 metres or 15-25 seconds; 60-120 seconds rest", realization: "exactly_one_legal_mode" },
  stationaryMarch: { preparationActivation: "1-2 sets; 12-20 alternating steps or 15-25 seconds; quality_limited", capacityAccessory: "2 sets; 20-40 alternating steps or 20-40 seconds; moderate/quality_limited", distanceClaim: false },
  countedStep: { preparationActivation: "1 set; 6-10 steps/side; quality_limited", developmentalAccessory: "2 sets; 8-15 steps/side; quality_limited/moderate; 60-120 seconds rest" },
  recoveryCooldown: { explicitOnly: true, dose: "1 round; 3-5 breath cycles or 20-40 seconds; easy/quality_limited; no developmental credit" },
  effort: { preparationActivation: "quality_limited", mainStrength: "1-3 RIR standard; 2-4 RIR regression", secondaryStrength: "2-3 RIR", mainHypertrophy: "1-3 RIR standard; 2-4 RIR regression", accessory: "1-3 RIR required; 2-4 RIR preferred/optional", special: "quality_limited or moderate", failureDefault: false },
  tempo: { exactPhaseTempoDefault: "not_prescribed", preparationActivation: "controlled intent where legal", strengthHypertrophy: "natural or controlled intent according to execution requirement", power: "explosive/maximal concentric intent only from explicit legal power facts" },
  duration: { universalTarget: false, unknownOwners: ["repetition tempo", "breathing cadence", "locomotor pace", "step cadence", "rest placement", "Sequencing setup/transition"], unknownIsNotFitOrFailure: true },
  blockStructure: { knownProductiveMain: "0-1 preparatory acclimation blocks plus one developmental block", unfamiliarMain: "1-2 preparatory acclimation blocks plus one developmental block", otherAssignments: "one block unless the selected rule explicitly requires another", backoffDefault: false },
} as const);

export const PRESCRIPTION_POLICY_V1: ProductionPrescriptionPolicy = Object.freeze({
  policyId: PRESCRIPTION_POLICY_V1_ID,
  version: PRESCRIPTION_POLICY_V1_VERSION,
  state: PRESCRIPTION_POLICY_V1_STATE,
  reviewer: PRESCRIPTION_POLICY_V1_REVIEWER_ID,
  reviewedAt: PRESCRIPTION_POLICY_V1_REVIEWED_AT,
  philosophy: PRESCRIPTION_POLICY_V1_PHILOSOPHY,
  specificityOrder: PRESCRIPTION_POLICY_SPECIFICITY_ORDER,
  rules: RULES,
  conflicts: [],
  provenance: {
    source: "policy" as const,
    sourceRef: "docs/training-engine-v2/PRESCRIPTION_POLICY_V1_OWNER_DECISIONS.md",
    notes: "Owner-admitted V1 values migrated byte-equivalently into production source; policy remains explicitly inactive.",
  },
  activationAuthorized: false,
});

export function findPrescriptionPolicyDoseRule(input: {
  readonly policy: ProductionPrescriptionPolicy;
  readonly useCase: PrescriptionPolicyUseCase;
  readonly doseMode: ExerciseDoseMode;
  readonly variant: PrescriptionPolicyRuleVariant;
}): ProductionPrescriptionPolicyRule | null {
  return input.policy.rules.find((candidate) =>
    candidate.applicability.useCase === input.useCase &&
    candidate.applicability.doseMode === input.doseMode &&
    candidate.applicability.variant === input.variant
  ) ?? null;
}
