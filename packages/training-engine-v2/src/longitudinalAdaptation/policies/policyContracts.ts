import type { ProgressionAxis } from "../../domain/progression";
import type { ExerciseDoseMode } from "../../prescription/dose";

export interface ProductionLongitudinalAdaptationPolicyReference {
  readonly policyId: "LONGITUDINAL_ADAPTATION_POLICY_V1_STABLE_RESPONSE_LED";
  readonly version: "1.0.0";
}

export const PRODUCTION_LONGITUDINAL_ACTIONS = Object.freeze([
  "keep_current", "repeat_for_confirmation", "hold_current_prescription",
  "prescription_modification_review", "progress_prescription_axis", "regress_prescription_axis",
  "reopen_candidate_selection_for_replacement", "reopen_candidate_selection_for_bounded_rotation",
  "week_reallocation_review", "deload_review", "phase_review", "external_safety_review",
  "owner_review_required", "no_action_insufficient_evidence",
] as const);
export type ProductionLongitudinalAction = typeof PRODUCTION_LONGITUDINAL_ACTIONS[number];

export const PRODUCTION_LONGITUDINAL_ACTION_OWNERS = Object.freeze([
  "longitudinal_adaptation", "prescription", "candidate_intelligence_and_composer", "week",
  "phase_continuity", "training_safety", "product_application", "human_owner_review",
] as const);
export type ProductionLongitudinalActionOwner = typeof PRODUCTION_LONGITUDINAL_ACTION_OWNERS[number];

export const PRODUCTION_LONGITUDINAL_PRESCRIPTION_DIMENSIONS = Object.freeze([
  "load", "repetitions", "sets", "rounds", "trips", "duration", "distance", "steps",
  "breath_cycles", "effort", "range", "support", "lever", "laterality", "side", "tempo",
  "rest", "dose_mode", "block_structure", "unresolved_other",
] as const);
export type ProductionLongitudinalPrescriptionDimension =
  typeof PRODUCTION_LONGITUDINAL_PRESCRIPTION_DIMENSIONS[number];

export interface ProductionLongitudinalPolicyRule {
  readonly ruleId: string;
  readonly action: ProductionLongitudinalAction;
  readonly requiredSignals: readonly string[];
  readonly conflictingSignals: readonly string[];
  readonly actionOwner: ProductionLongitudinalActionOwner;
  readonly applicationOwner: ProductionLongitudinalActionOwner;
}

export interface ProductionLongitudinalAdaptationPolicy {
  readonly reference: ProductionLongitudinalAdaptationPolicyReference;
  readonly state: "OWNER_SELECTED_FOR_PRODUCTION_KERNEL_NOT_ACTIVATED";
  readonly reviewer: "longitudinal_adaptation_policy_owner";
  readonly reviewedAt: string;
  readonly philosophy: readonly string[];
  readonly rules: readonly ProductionLongitudinalPolicyRule[];
  readonly actionPriority: readonly ProductionLongitudinalAction[];
  readonly legalAxesByDoseMode: Readonly<Record<ExerciseDoseMode, readonly ProgressionAxis[]>>;
  readonly automaticProgression: false;
  readonly automaticRegression: false;
  readonly automaticReplacement: false;
  readonly automaticRotation: false;
  readonly automaticDeload: false;
  readonly automaticWeekReallocation: false;
  readonly automaticPhaseMutation: false;
  readonly provenance: readonly string[];
}

export type ExplicitProductionLongitudinalAdaptationPolicyInput =
  | ProductionLongitudinalAdaptationPolicy
  | ProductionLongitudinalAdaptationPolicyReference
  | null;
