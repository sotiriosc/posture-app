import type { ObjectivePolicyFamily, ObjectivePriority, TournamentObjectiveFixture } from "./weekPolicyTournamentContracts";
import {
  WEEK_POLICY_V1_SEED, type V1HoldoutScenario, type V1PolicyScope, type WeekPolicyV1HoldoutManifest,
  fingerprintV1HoldoutManifest,
} from "./weekPolicyV1Contracts";

function objective(id: string, family: ObjectivePolicyFamily, priority: ObjectivePriority, order: number,
  options: { unique?: boolean; assessmentRepeat?: boolean } = {}): TournamentObjectiveFixture {
  return Object.freeze({ id, family, priority, priorityOrder: order, explicit: true,
    uniqueMarginalValue: options.unique ?? true,
    ...(options.assessmentRepeat === undefined ? {} : { assessmentRepeatAuthorized: options.assessmentRepeat }) });
}

const s = (id: string, priority: ObjectivePriority = "required", order = 0) => objective(id, "strength", priority, order);
const h = (id: string, priority: ObjectivePriority = "required", order = 1) => objective(id, "muscle", priority, order);
const d = (id: string, priority: ObjectivePriority = "required", order = 1) => objective(id, "direct", priority, order);
const a = (id: string, order = 1) => objective(id, "assessment", "required", order, { assessmentRepeat: false });
const c = (id: string, priority: ObjectivePriority = "required", order = 1) => objective(id, "capacity", priority, order);

function row(index: number, input: {
  scope: V1PolicyScope; opportunities: number; objectives?: readonly TournamentObjectiveFixture[];
  focus: string; condensed?: readonly number[]; cancelled?: readonly number[]; bodyweight?: readonly number[];
  unknown?: readonly number[]; context?: V1HoldoutScenario["context"]; consecutive?: boolean;
  expected?: V1HoldoutScenario["expectedPolicyStatus"]; convergence?: boolean; adaptive?: boolean;
}): V1HoldoutScenario {
  return Object.freeze({
    id: `v1-holdout-${String(index).padStart(2, "0")}-${input.focus.replaceAll("_", "-")}`,
    cohort: "holdout", locked: true, opportunityCount: input.opportunities,
    condensedOpportunityOrders: Object.freeze([...(input.condensed ?? [])]),
    cancelledOpportunityOrders: Object.freeze([...(input.cancelled ?? [])]),
    bodyweightOpportunityOrders: Object.freeze([...(input.bodyweight ?? [])]),
    unknownEquipmentOpportunityOrders: Object.freeze([...(input.unknown ?? [])]),
    consecutive: input.consecutive ?? false, context: input.context ?? "ordinary",
    objectives: Object.freeze([...(input.objectives ?? [])]),
    expectedConvergence: input.convergence ?? false, materialAdaptiveDifference: input.adaptive ?? true,
    policyScope: input.scope, expectedPolicyStatus: input.expected ?? "EXECUTE_V1", coherenceFocus: input.focus,
  });
}

export const WEEK_POLICY_V1_HOLDOUT_SCENARIOS: readonly V1HoldoutScenario[] = Object.freeze([
  row(1, { scope: "required_primary_strength", opportunities: 1, objectives: [s("v1-s1")], focus: "one_opportunity_strength" }),
  row(2, { scope: "required_primary_strength", opportunities: 2, objectives: [s("v1-s2")], focus: "two_opportunity_strength_rehearsal" }),
  row(3, { scope: "required_primary_hypertrophy", opportunities: 3, objectives: [s("v1-s3"), h("v1-h3")], focus: "three_opportunity_hypertrophy" }),
  row(4, { scope: "required_primary_strength", opportunities: 4, objectives: [s("v1-s4"), d("v1-d4", "preferred")], focus: "four_opportunity_direct_support" }),
  row(5, { scope: "required_primary_hypertrophy", opportunities: 5, objectives: [s("v1-s5"), h("v1-h5")], focus: "five_opportunity_smaller_commitment" }),
  row(6, { scope: "required_supported_capacity", opportunities: 6, objectives: [s("v1-s6"), c("v1-c6")], focus: "six_opportunity_capacity_once" }),
  row(7, { scope: "required_primary_strength", opportunities: 4, objectives: [s("v1-irregular")], focus: "irregular_ordered_cycle", consecutive: true }),
  row(8, { scope: "required_primary_strength", opportunities: 3, objectives: [s("v1-mixed")], focus: "mixed_equipment_main_change", bodyweight: [1] }),
  row(9, { scope: "required_primary_strength", opportunities: 2, objectives: [s("v1-travel")], focus: "travel_bodyweight", bodyweight: [0], context: "travel" }),
  row(10, { scope: "required_primary_strength", opportunities: 2, objectives: [s("v1-condensed")], focus: "condensed_required_main", condensed: [0] }),
  row(11, { scope: "required_primary_strength", opportunities: 3, objectives: [s("v1-cancel")], focus: "cancelled_opportunity_truth", cancelled: [1] }),
  row(12, { scope: "required_direct", opportunities: 3, objectives: [s("v1-direct-main"), d("v1-direct")], focus: "explicit_direct_once" }),
  row(13, { scope: "required_assessment_cluster", opportunities: 4, objectives: [s("v1-assessment-main"), a("v1-assessment")], focus: "assessment_cluster_once" }),
  row(14, { scope: "required_supported_capacity", opportunities: 3, objectives: [s("v1-cap-main"), c("v1-capacity")], focus: "capacity_responsibility_once" }),
  row(15, { scope: "required_primary_strength", opportunities: 3, objectives: [s("v1-continuity")], focus: "productive_preparation_continuity", context: "productive_continuity" }),
  row(16, { scope: "required_primary_strength", opportunities: 2, objectives: [s("v1-adverse")], focus: "adverse_response_reselection", context: "adverse_response" }),
  row(17, { scope: "required_primary_strength", opportunities: 3, objectives: [s("v1-pain-relevant")], focus: "relevant_pain_dependency", context: "pain_aware" }),
  row(18, { scope: "required_primary_strength", opportunities: 3, objectives: [s("v1-pain-inert")], focus: "irrelevant_pain_convergence", context: "pain_aware", convergence: true, adaptive: false }),
  row(19, { scope: "required_primary_strength", opportunities: 3, objectives: [s("v1-warmup")], focus: "explicit_warmup_dependency" }),
  row(20, { scope: "required_primary_strength", opportunities: 3, objectives: [s("v1-activation")], focus: "explicit_activation_dependency" }),
  row(21, { scope: "required_primary_strength", opportunities: 2, objectives: [s("v1-empty")], focus: "empty_preparation_sections", convergence: true, adaptive: false }),
  row(22, { scope: "required_primary_strength", opportunities: 4, objectives: [s("v1-repeat")], focus: "justified_repeated_preparation" }),
  row(23, { scope: "required_primary_strength", opportunities: 4, objectives: [s("v1-filler")], focus: "unjustified_repetition_mutation" }),
  row(24, { scope: "required_primary_strength", opportunities: 4, objectives: [s("v1-chain"), h("v1-chain-h", "preferred")], focus: "shared_framework_different_chain" }),
  row(25, { scope: "required_primary_strength", opportunities: 4, objectives: [s("v1-converge")], focus: "exact_fact_convergence", convergence: true, adaptive: false }),
  row(26, { scope: "required_primary_hypertrophy", opportunities: 2, objectives: [h("v1-h-only")], focus: "hypertrophy_h1_single" }),
  row(27, { scope: "preferred_strength", opportunities: 2, objectives: [s("v1-pref-s", "preferred")], focus: "preferred_strength_zero_minimum" }),
  row(28, { scope: "optional_muscle", opportunities: 2, objectives: [h("v1-opt-h", "optional")], focus: "optional_muscle_unique_value" }),
  row(29, { scope: "preferred_assessment_cluster", opportunities: 2, objectives: [objective("v1-pref-a", "assessment", "preferred", 0)], focus: "preferred_assessment_zero_minimum" }),
  row(30, { scope: "optional_supported_capacity", opportunities: 2, objectives: [c("v1-opt-c", "optional", 0)], focus: "optional_capacity_no_mandate" }),
  row(31, { scope: "required_primary_strength", opportunities: 2, objectives: [s("v1-unknown-equipment")], focus: "unknown_equipment_search", unknown: [1] }),
  row(32, { scope: "required_primary_strength", opportunities: 1, objectives: [s("v1-below"), d("v1-below-d")], focus: "below_target_no_doubling", condensed: [0] }),
  row(33, { scope: "general_fitness_movement", opportunities: 3, focus: "general_fitness_scope_gap", expected: "WEEKLY_POLICY_REQUIRED" }),
  row(34, { scope: "posture_movement_quality", opportunities: 3, focus: "posture_quality_scope_gap", expected: "WEEKLY_POLICY_REQUIRED" }),
  row(35, { scope: "systemic_conditioning", opportunities: 3, focus: "systemic_conditioning_scope_gap", expected: "WEEKLY_POLICY_REQUIRED" }),
  row(36, { scope: "external_sport_load", opportunities: 4, focus: "external_sport_scope_gap", expected: "WEEKLY_POLICY_REQUIRED" }),
  row(37, { scope: "recovery_session", opportunities: 2, focus: "recovery_session_scope_gap", expected: "WEEKLY_POLICY_REQUIRED" }),
  row(38, { scope: "phase_override", opportunities: 4, focus: "phase_override_scope_gap", expected: "WEEKLY_POLICY_REQUIRED" }),
  row(39, { scope: "direct_secondary_dose", opportunities: 3, focus: "direct_secondary_dose_scope_gap", expected: "WEEKLY_POLICY_REQUIRED" }),
  row(40, { scope: "prescription_informed_muscle_distribution", opportunities: 4,
    focus: "prescription_muscle_distribution_scope_gap", expected: "WEEKLY_POLICY_REQUIRED" }),
]);

export const WEEK_POLICY_V1_HOLDOUT_MANIFEST: WeekPolicyV1HoldoutManifest = Object.freeze({
  manifestId: "CAGT_WEEK_POLICY_V1_HOLDOUT_MANIFEST", version: "1.0.0", fixedSeed: WEEK_POLICY_V1_SEED,
  frozenBeforeExecution: true, priorHoldoutScenarioIdsExcluded: true, scenarios: WEEK_POLICY_V1_HOLDOUT_SCENARIOS,
});

export const WEEK_POLICY_V1_HOLDOUT_MANIFEST_FINGERPRINT = fingerprintV1HoldoutManifest(WEEK_POLICY_V1_HOLDOUT_MANIFEST);
export const EXPECTED_WEEK_POLICY_V1_HOLDOUT_MANIFEST_FINGERPRINT =
  "6edc62f933676e500fdfaac8af5a15e6294df23b587d0edbf1cd0c54c0a07ab3";
