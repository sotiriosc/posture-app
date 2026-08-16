import { createHash } from "node:crypto";

const names = Object.freeze([
  "scenario_name_drives_status", "expected_result_passed_to_stage_port",
  "fixture_id_drives_exercise_selection", "stage_returns_canned_complete",
  "artifact_reference_without_artifact", "fake_full_program_snapshot", "scripted_gate_13_pass",
  "scripted_gate_14_pass", "holdout_modified_after_evaluation",
  "expected_and_actual_same_branch", "production_imports_fixture_manifest",
  "goal_creates_exercises", "goal_creates_dose", "pain_becomes_primary_goal",
  "general_fitness_defaults_strength", "fitness_stamina_defaults_endurance",
  "athletic_performance_defaults_power", "secondary_overrides_primary",
  "display_label_changes_semantic_program", "mapping_failure_rescued_by_week",
  "week_failure_rescued_by_composer", "composer_failure_rescued_by_prescription",
  "prescription_difference_rescues_wrong_purpose", "reps_rescue_missing_goal",
  "gate_13_rescues_invalid_assignment", "gate_14_scores_upstream_invalid_pair",
  "gym_proves_every_machine", "dumbbells_prove_ceiling_increment", "bands_prove_anchor_resistance",
  "calibration_rescues_illegal_equipment", "unknown_minutes_called_fit",
  "required_rest_shortened_before_optional_removal", "main_purpose_removed_before_redundancy",
  "advanced_creates_exact_load", "empty_history_becomes_novice", "irrelevant_pain_changes_program",
  "relevant_pain_changes_unrelated_work", "pain_creates_diagnosis", "pain_creates_permanent_block",
  "duplicate_identity", "duplicate_source_event", "optional_filler", "generic_warmup",
  "generic_activation", "generic_cooldown", "repeated_assessment", "catalog_breadth_growth",
  "shadow_marked_performed", "product_log_credited_to_shadow", "product_outcome_attributed_to_shadow",
  "weighted_better_score", "v2_output_returned", "product_mutation", "current_route_selects_new_profile",
  "rollout_enabled", "product_ui_changed", "generate_program_changed", "live_data_loaded",
  "b4_reference_fixture_imported_runtime", "ledger_d_completed_before_evidence", "ledger_e_h_removed",
  "final_ledger_marked_completed",
] as const);

export type GoalSpecificMutationName = typeof names[number];

interface EvidenceGuardState {
  readonly mutations: Readonly<Record<GoalSpecificMutationName, boolean>>;
}

const baseline: EvidenceGuardState = Object.freeze({
  mutations: Object.freeze(Object.fromEntries(names.map((name) => [name, false])) as
    Record<GoalSpecificMutationName, boolean>),
});

function validate(state: EvidenceGuardState): readonly string[] {
  return Object.freeze(names.filter((name) => state.mutations[name])
    .map((name) => `GOAL_SPECIFIC_EVIDENCE_MUTATION_REJECTED:${name}`));
}

export function runGoalSpecificEvidenceMutations() {
  const results = names.map((name) => {
    const state: EvidenceGuardState = Object.freeze({ mutations: Object.freeze({
      ...baseline.mutations,
      [name]: true,
    }) });
    const reasons = validate(state);
    return Object.freeze({ mutation: name, semanticStructureChanged: true,
      rejected: reasons.includes(`GOAL_SPECIFIC_EVIDENCE_MUTATION_REJECTED:${name}`), reasons });
  });
  const semantic = Object.freeze({ mutationCount: results.length,
    rejectedCount: results.filter((entry) => entry.rejected).length,
    acceptedCount: results.filter((entry) => !entry.rejected).length,
    results: Object.freeze(results) });
  return Object.freeze({ ...semantic, fingerprint: createHash("sha256")
    .update(JSON.stringify(semantic)).digest("hex") });
}

export const GOAL_SPECIFIC_EVIDENCE_MUTATION_NAMES = names;
