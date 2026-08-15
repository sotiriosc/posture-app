import type { ProgressionAxis } from "../../domain/progression";
import type { ExerciseDoseMode } from "../../prescription/dose";
import type {
  ProductionLongitudinalAction,
  ProductionLongitudinalAdaptationPolicy,
  ProductionLongitudinalPolicyRule,
} from "./policyContracts";

export const PRODUCTION_LONGITUDINAL_ADAPTATION_POLICY_ID =
  "LONGITUDINAL_ADAPTATION_POLICY_V1_STABLE_RESPONSE_LED" as const;
export const PRODUCTION_LONGITUDINAL_ADAPTATION_POLICY_VERSION = "1.0.0" as const;
export const PRODUCTION_LONGITUDINAL_ADAPTATION_POLICY_REFERENCE = Object.freeze({
  policyId: PRODUCTION_LONGITUDINAL_ADAPTATION_POLICY_ID,
  version: PRODUCTION_LONGITUDINAL_ADAPTATION_POLICY_VERSION,
});

export const PRODUCTION_LONGITUDINAL_ADAPTATION_POLICY_PHILOSOPHY = Object.freeze([
  "CONTINUITY_BY_DEFAULT", "COMPLETED_EVIDENCE_BEFORE_CHANGE", "EXACT_REALIZATION_EVIDENCE_FIRST",
  "REPEATED_EVIDENCE_BEFORE_MATERIAL_CHANGE", "LOCAL_SCOPE_BEFORE_GLOBAL_CHANGE",
  "MINIMUM_CAUSALLY_SUFFICIENT_CHANGE", "PRESCRIPTION_REVIEW_BEFORE_REPLACEMENT",
  "SUCCESSFUL_REEXPOSURE_PRESERVES_OPTIONS", "ONE_PRIMARY_ACTION_PER_TARGET",
  "NO_CALENDAR_PROGRESSION", "NO_PHASE_ONLY_PROGRESSION", "NO_NOVELTY_QUOTA",
  "NO_AUTOMATIC_ROTATION", "NO_AUTOMATIC_DELOAD", "NO_GOAL_REWRITE", "UNKNOWN_MEANS_HOLD",
  "CONFLICT_MEANS_REVIEW", "DECISION_SEPARATE_FROM_APPLICATION",
] as const);

const axes = (...values: ProgressionAxis[]): readonly ProgressionAxis[] => Object.freeze(values);
export const PRODUCTION_LONGITUDINAL_LEGAL_AXES_BY_DOSE_MODE:
Readonly<Record<ExerciseDoseMode, readonly ProgressionAxis[]>> = Object.freeze({
  repetition_sets: axes("load", "reps", "sets", "range", "tempo", "support_reduction", "lever",
    "effort", "rest_reduction", "stability", "coordination", "complexity"),
  timed_hold: axes("duration", "sets", "load", "range", "support_reduction", "lever", "effort"),
  breath_cycles: axes("breath_cycles", "sets", "range", "support_reduction", "coordination"),
  distance_carry: axes("distance", "trips", "load", "effort", "rest_reduction"),
  timed_carry: axes("duration", "trips", "load", "effort", "rest_reduction"),
  step_march: axes("steps", "duration", "sets", "load", "coordination", "stability"),
  step_sets: axes("steps", "sets", "load", "range", "support_reduction", "coordination"),
});

export const PRODUCTION_LONGITUDINAL_ACTION_PRIORITY: readonly ProductionLongitudinalAction[] = Object.freeze([
  "external_safety_review", "owner_review_required", "reopen_candidate_selection_for_replacement",
  "prescription_modification_review", "regress_prescription_axis", "progress_prescription_axis",
  "reopen_candidate_selection_for_bounded_rotation", "deload_review", "week_reallocation_review",
  "phase_review", "hold_current_prescription", "repeat_for_confirmation", "keep_current",
  "no_action_insufficient_evidence",
]);

const rule = (
  ruleId: string,
  action: ProductionLongitudinalAction,
  requiredSignals: readonly string[],
  conflictingSignals: readonly string[],
  applicationOwner: ProductionLongitudinalPolicyRule["applicationOwner"],
): ProductionLongitudinalPolicyRule => Object.freeze({ ruleId, action,
  requiredSignals: Object.freeze([...requiredSignals]), conflictingSignals: Object.freeze([...conflictingSignals]),
  actionOwner: "longitudinal_adaptation", applicationOwner });

export const PRODUCTION_LONGITUDINAL_ADAPTATION_POLICY_V1_STABLE_RESPONSE_LED:
ProductionLongitudinalAdaptationPolicy = Object.freeze({
  reference: PRODUCTION_LONGITUDINAL_ADAPTATION_POLICY_REFERENCE,
  state: "OWNER_SELECTED_FOR_PRODUCTION_KERNEL_NOT_ACTIVATED",
  reviewer: "longitudinal_adaptation_policy_owner",
  reviewedAt: "2026-08-14T16:00:00-04:00",
  philosophy: PRODUCTION_LONGITUDINAL_ADAPTATION_POLICY_PHILOSOPHY,
  rules: Object.freeze([
    rule("LA-V1-KEEP", "keep_current", ["productive_completion"], ["safety_block"], "product_application"),
    rule("LA-V1-REPEAT", "repeat_for_confirmation", ["isolated_success"], ["safety_block"], "product_application"),
    rule("LA-V1-HOLD", "hold_current_prescription", ["mixed_evidence"], ["safety_block"], "product_application"),
    rule("LA-V1-MODIFY", "prescription_modification_review", ["limited_response"],
      ["successful_reexposure", "safety_block"], "prescription"),
    rule("LA-V1-PROGRESS", "progress_prescription_axis", ["repeated_success", "progression_ready"],
      ["safety_block", "adverse_response"], "prescription"),
    rule("LA-V1-REGRESS", "regress_prescription_axis", ["repeated_target_failure"],
      ["safety_block"], "prescription"),
    rule("LA-V1-REPLACE", "reopen_candidate_selection_for_replacement",
      ["repeated_adverse_response", "replacement_consideration"], ["successful_reexposure", "safety_block"],
      "candidate_intelligence_and_composer"),
    rule("LA-V1-ROTATE", "reopen_candidate_selection_for_bounded_rotation", ["rotation_preference"],
      ["adverse_response", "safety_block"], "candidate_intelligence_and_composer"),
    rule("LA-V1-WEEK", "week_reallocation_review", ["week_reallocation_aggregate"],
      ["safety_block"], "week"),
    rule("LA-V1-DELOAD", "deload_review", ["deload_review_aggregate"], ["safety_block"], "week"),
    rule("LA-V1-PHASE", "phase_review", ["phase_review_requested"], ["safety_block"], "phase_continuity"),
    rule("LA-V1-SAFETY", "external_safety_review", ["safety_block"], [], "training_safety"),
  ]),
  actionPriority: PRODUCTION_LONGITUDINAL_ACTION_PRIORITY,
  legalAxesByDoseMode: PRODUCTION_LONGITUDINAL_LEGAL_AXES_BY_DOSE_MODE,
  automaticProgression: false, automaticRegression: false, automaticReplacement: false,
  automaticRotation: false, automaticDeload: false, automaticWeekReallocation: false,
  automaticPhaseMutation: false,
  provenance: Object.freeze([
    "owner-authorization:PRODUCTION_LONGITUDINAL_ADAPTATION_KERNEL_IMPLEMENTATION_NOT_ACTIVATION",
    "admitted-design:LONGITUDINAL_ADAPTATION_POLICY_V1_STABLE_RESPONSE_LED@1.0.0",
  ]),
});

export const LONGITUDINAL_ADAPTATION_POLICY_V1_DESIGN_COMPATIBILITY_PROJECTION = Object.freeze({
  reference: PRODUCTION_LONGITUDINAL_ADAPTATION_POLICY_REFERENCE,
  state: "OWNER_SELECTED_FOR_GATE_16_CAGT_ADMISSION_NOT_PRODUCTION" as const,
  philosophy: PRODUCTION_LONGITUDINAL_ADAPTATION_POLICY_PHILOSOPHY,
  reviewer: "longitudinal_adaptation_policy_owner" as const,
  reviewedAt: "2026-08-14T16:00:00-04:00",
  provenance: Object.freeze([
    "owner-authorization:LONGITUDINAL_ADAPTATION_GATE_16_V1_ONTOLOGY_POLICY_AND_CAGT_ADMISSION",
  ]),
});
