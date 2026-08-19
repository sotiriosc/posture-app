export type CagtThresholdKind = "HARD_INVARIANT" | "WARNING" | "OBSERVE_ONLY" | "CANDIDATE_THRESHOLD" | "NOT_MEANINGFUL";
export interface CagtThresholdEntry {
  readonly metric: string; readonly kind: CagtThresholdKind; readonly threshold: number | null;
  readonly owner: string; readonly rationale: string; readonly baselineDistribution: string;
  readonly applicableCohort: string; readonly effectiveVersion: string;
  readonly falsePositiveReview: string; readonly falseNegativeReview: string;
}

const hard = ["invalid_counterfactual_fixture", "undeclared_behavioral_field_changes", "prose_label_behavioral_effects",
  "wrong_layer_effects", "downstream_rescue_accepted", "material_fact_unresponsive", "duplicate_identity_in_session",
  "optional_zero_marginal_value_assignment", "assessment_without_authority", "silent_required_omission",
  "hidden_clock_or_order_dependence", "random_output_variation"];
const observed = ["framework_collision_rate", "anchor_recurrence", "exact_rep_sameness", "same_exercise_rate",
  "exact_full_session_collision_rate", "optional_accessory_recurrence", "unique_program_count"];

export const CAGT_THRESHOLD_REGISTRY: readonly CagtThresholdEntry[] = [
  ...hard.map((metric) => ({ metric, kind: "HARD_INVARIANT" as const, threshold: 0, owner: "cagt_v1_owner",
    rationale: "A causal integrity violation is never tolerated.", baselineDistribution: "zero required",
    applicableCohort: "all_cagt_pairs", effectiveVersion: "1.0.0", falsePositiveReview: "inspect declared contract and fixture diff",
    falseNegativeReview: "mutation test must trip the invariant" })),
  ...observed.map((metric) => ({ metric, kind: "OBSERVE_ONLY" as const, threshold: null, owner: "future_policy_owner",
    rationale: "Sameness is not failure without a causal contract.", baselineDistribution: "captured by CAGT V1",
    applicableCohort: "reported_cohorts", effectiveVersion: "1.0.0", falsePositiveReview: "not applicable until promoted",
    falseNegativeReview: "review distributions before any promotion" })),
];
