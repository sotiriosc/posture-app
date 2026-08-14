import type { FullProgramGate14Classification } from "./fullProgramContracts";
import { EXERCISE_DOSE_MODES, REFERENCE_EXERCISES } from "../../src";
import { digest } from "./signatures";

export const FULL_PROGRAM_CONTROLLED_PAIR_NAMES = Object.freeze([
  "identical_meaningful_facts", "athlete_id_nonsemantic", "athlete_label", "display_name", "prose_only",
  "source_array_order", "irrelevant_pain", "irrelevant_assessment", "irrelevant_history",
  "equivalent_equipment_order", "strength_versus_hypertrophy", "direct_calf_priority_added",
  "relevant_shoulder_requirement", "relevant_low_back_requirement", "relevant_knee_requirement",
  "high_confidence_assessment_priority", "productive_press_continuity", "productive_row_continuity",
  "adverse_press_response", "adverse_hinge_response", "exact_prior_load_eligible", "exact_prior_load_ineligible",
  "one_condensed_session", "one_expanded_session", "one_day_equipment_loss", "one_day_home_substitution",
  "capacity_main_objective", "direct_action_objective", "required_support_realization", "reduced_range_requirement",
  "side_specific_requirement", "unresolved_prescription_requirement", "four_opportunities_to_two",
  "two_opportunities_to_four", "required_objective_without_shared_coverage", "opportunity_cancelled_before_planning",
  "whole_horizon_equipment_change", "training_safety_blocks_session", "required_capacity_responsibility_added",
  "explicit_reallocation_source_change", "same_exercises_effort_difference", "same_exercises_support_difference",
  "same_exercises_range_difference", "same_exercises_exact_load_retention", "same_exercises_acclimation_difference",
  "same_exercises_same_reps", "same_exercises_same_tempo", "same_full_sequence", "shoulder_changes_calf_mutation",
  "local_equipment_changes_every_session", "label_changes_exercises", "prose_changes_sets",
  "candidate_rank_changes_sequence", "variety_replaces_anchor", "pain_creates_corrective_circuit",
  "direct_objective_erased", "support_removed_by_prescription", "condensed_optional_work_restored",
  "safety_block_erased", "rejected_assignment_returned", "wrong_objective_attractive_prescription",
  "missing_direct_secondary_rescue", "missing_main_accessory_rescue", "bad_allocation_rep_rescue",
  "gate13_sequence_rescue", "phase_change_deferred", "response_change_deferred", "systemic_conditioning_unresolved",
  "external_sport_unresolved", "h2_response_unresolved", "universal_spacing_unresolved",
  "shared_warmup_dependency_recurrence",
] as const);

export type FullProgramHoldoutCategory =
  | "expected_convergence"
  | "justified_convergence"
  | "shared_framework_material_adaptation"
  | "framework_change"
  | "over_adaptation_mutation"
  | "under_adaptation_mutation"
  | "wrong_layer_mutation"
  | "adaptation_erasure_mutation"
  | "cosmetic_only_mutation"
  | "no_rescue_mutation";

export interface FullProgramHoldoutPairDescriptor {
  readonly pairId: string;
  readonly category: FullProgramHoldoutCategory;
  readonly baselineInputIndex: number;
  readonly counterfactualInputIndex: number;
  readonly changedFactId: string;
  readonly changedFactPath: "personFacts.signal";
  readonly expectedClassification: FullProgramGate14Classification;
  readonly twoGenuineCompletePrograms: boolean;
  readonly expectedSharedFramework: boolean;
  readonly explicitMutationFixture: boolean;
  readonly noRescueMutation: boolean;
}

function descriptors(
  category: FullProgramHoldoutCategory,
  count: number,
  offset: number,
  expectedClassification: FullProgramGate14Classification,
  indexer: (index: number) => readonly [number, number],
  properties: Pick<FullProgramHoldoutPairDescriptor,
    "twoGenuineCompletePrograms" | "expectedSharedFramework" | "explicitMutationFixture" | "noRescueMutation">,
): readonly FullProgramHoldoutPairDescriptor[] {
  return Array.from({ length: count }, (_, localIndex) => {
    const index = offset + localIndex;
    const [baselineInputIndex, counterfactualInputIndex] = indexer(localIndex);
    return Object.freeze({
      pairId: `full-program-holdout-${String(index + 1).padStart(3, "0")}`,
      category,
      baselineInputIndex,
      counterfactualInputIndex,
      changedFactId: `full-program-fact-${String(index + 1).padStart(3, "0")}`,
      changedFactPath: "personFacts.signal" as const,
      expectedClassification,
      ...properties,
    });
  });
}

const holdoutPairs = Object.freeze([
  ...descriptors("expected_convergence", 40, 0, "PROGRAM_EXPECTED_CONVERGENCE",
    (index) => [index % 128, index % 128],
    { twoGenuineCompletePrograms: true, expectedSharedFramework: true, explicitMutationFixture: false,
      noRescueMutation: false }),
  ...descriptors("justified_convergence", 20, 40, "PROGRAM_JUSTIFIED_CONVERGENCE",
    (index) => [(40 + index) % 128, (40 + index) % 128],
    { twoGenuineCompletePrograms: true, expectedSharedFramework: true, explicitMutationFixture: false,
      noRescueMutation: false }),
  ...descriptors("shared_framework_material_adaptation", 80, 60, "PROGRAM_MATERIAL_ADAPTATION_PRESERVED",
    (index) => [index % 122, (index % 122) + 6],
    { twoGenuineCompletePrograms: true, expectedSharedFramework: true, explicitMutationFixture: false,
      noRescueMutation: false }),
  ...descriptors("framework_change", 40, 140, "PROGRAM_MATERIAL_ADAPTATION_PRESERVED",
    (index) => [index % 127, (index % 127) + 1],
    { twoGenuineCompletePrograms: true, expectedSharedFramework: false, explicitMutationFixture: false,
      noRescueMutation: false }),
  ...descriptors("over_adaptation_mutation", 15, 180, "PROGRAM_OVER_ADAPTATION",
    (index) => [index % 122, (index % 122) + 6],
    { twoGenuineCompletePrograms: true, expectedSharedFramework: false, explicitMutationFixture: true,
      noRescueMutation: false }),
  ...descriptors("under_adaptation_mutation", 15, 195, "PROGRAM_UNRESPONSIVE_TO_MATERIAL_INPUT",
    (index) => [(index + 20) % 128, (index + 20) % 128],
    { twoGenuineCompletePrograms: false, expectedSharedFramework: true, explicitMutationFixture: true,
      noRescueMutation: false }),
  ...descriptors("wrong_layer_mutation", 5, 210, "PROGRAM_WRONG_LAYER_EFFECT",
    (index) => [index, index + 6],
    { twoGenuineCompletePrograms: false, expectedSharedFramework: false, explicitMutationFixture: true,
      noRescueMutation: false }),
  ...descriptors("adaptation_erasure_mutation", 5, 215, "MATERIAL_ADAPTATION_ERASED_DOWNSTREAM",
    (index) => [index + 30, index + 30],
    { twoGenuineCompletePrograms: false, expectedSharedFramework: true, explicitMutationFixture: true,
      noRescueMutation: false }),
  ...descriptors("cosmetic_only_mutation", 4, 220, "PROGRAM_COSMETIC_ONLY_DIFFERENCE",
    (index) => [index + 40, index + 40],
    { twoGenuineCompletePrograms: false, expectedSharedFramework: true, explicitMutationFixture: true,
      noRescueMutation: false }),
  ...descriptors("no_rescue_mutation", 24, 224, "PROGRAM_UPSTREAM_FAILED_SHADOW_ONLY",
    (index) => [index % 122, (index % 122) + 6],
    { twoGenuineCompletePrograms: false, expectedSharedFramework: false, explicitMutationFixture: true,
      noRescueMutation: true }),
]);

export const FULL_PROGRAM_HOLDOUT_COVERAGE_LOCK = Object.freeze({
  exerciseIds: Object.freeze(REFERENCE_EXERCISES.map((exercise) => exercise.id).sort()),
  doseModes: Object.freeze([...EXERCISE_DOSE_MODES].sort()),
  sections: Object.freeze(["accessory", "activation", "cooldown", "main", "warmup"]),
  trainingRoles: Object.freeze([
    "activation", "capacity", "hypertrophy_accessory", "preparation", "primary_strength", "recovery",
    "secondary_strength",
  ]),
  objectivePurposes: Object.freeze([
    "assessment_priority_development", "capacity_development", "direct_action_development",
    "movement_development", "muscle_development", "recovery_support",
  ]),
  opportunityCounts: Object.freeze([1, 2, 3, 4, 5, 6]),
  requiredEvidence: Object.freeze([
    "warmup_activation", "direct_work", "assessment_work", "capacity_work", "duration_unknown",
    "definitely_over_budget", "spacing_unresolved", "unsupported_policy_scope",
  ]),
});

export const FULL_PRESCRIBED_PROGRAM_CAGT_V1_HOLDOUT_MANIFEST = Object.freeze({
  contractId: "FULL_PRESCRIBED_PROGRAM_CAGT_V1_HOLDOUT_MANIFEST",
  version: "1.0.0",
  frozenBeforeExecution: true,
  correctionPolicy: "V1.1_NEW_HOLDOUT_REQUIRED",
  coverageLock: FULL_PROGRAM_HOLDOUT_COVERAGE_LOCK,
  pairCount: holdoutPairs.length,
  pairs: holdoutPairs,
});

export const FULL_PRESCRIBED_PROGRAM_CAGT_V1_HOLDOUT_MANIFEST_FINGERPRINT =
  digest(FULL_PRESCRIBED_PROGRAM_CAGT_V1_HOLDOUT_MANIFEST);
export const EXPECTED_FULL_PRESCRIBED_PROGRAM_CAGT_V1_HOLDOUT_MANIFEST_FINGERPRINT =
  "e6ce4f2ff891892d01d7dd5373c32cfa5610e85e68ed19b75a1004757214acda" as const;

export const FULL_PROGRAM_HOLDOUT_REQUIREMENT_COUNTS = Object.freeze({
  pairCount: holdoutPairs.length,
  genuineCompleteProgramPairCount: holdoutPairs.filter((pair) => pair.twoGenuineCompletePrograms).length,
  expectedConvergencePairCount: holdoutPairs.filter((pair) => pair.category === "expected_convergence").length,
  sharedFrameworkMaterialAdaptationPairCount: holdoutPairs.filter((pair) =>
    pair.category === "shared_framework_material_adaptation").length,
  frameworkChangePairCount: holdoutPairs.filter((pair) => pair.category === "framework_change").length,
  overUnderAdaptationMutationCount: holdoutPairs.filter((pair) =>
    pair.category === "over_adaptation_mutation" || pair.category === "under_adaptation_mutation").length,
  noRescueMutationCount: holdoutPairs.filter((pair) => pair.noRescueMutation).length,
});

export const FULL_PROGRAM_FOUR_DAY_COHORT_SIZE = 24;
export const FULL_PROGRAM_MULTI_HORIZON_SHAPES = Object.freeze([
  "one_opportunity", "two_opportunities", "three_opportunities", "four_opportunities",
  "five_opportunities", "six_opportunities", "irregular_ordered_cycle",
] as const);
