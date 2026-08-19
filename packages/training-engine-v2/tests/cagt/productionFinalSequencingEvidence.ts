export const PRODUCTION_FINAL_SEQUENCING_MUTATIONS = Object.freeze([
  "missing_sequencing_policy", "unknown_sequencing_policy", "sequencing_policy_conflict",
  "missing_search_resource_policy", "unknown_search_policy", "unsupported_sequencing_contract",
  "unsupported_prescription_contract", "test_helper_import", "report_import", "hidden_activation",
  "hidden_current_time", "random_plan_id", "random_order", "exercise_id_only_ambiguous_join",
  "duplicate_assignment", "missing_assignment", "extra_prescription_plan", "wrong_assignment_source_mapping",
  "wrong_execution_attempt", "section_change", "role_change", "source_event_rewrite",
  "prescription_id_rewrite", "revision_rewrite", "block_reorder", "block_interleaving",
  "dependency_cycle", "dependency_violation", "required_warmup_after_dependent",
  "required_activation_after_dependent", "policy_created_warmup", "policy_created_activation",
  "policy_created_exercise", "policy_removed_exercise", "candidate_rank_ordering",
  "setup_first_purpose_displacement", "fatigue_only_purpose_displacement", "unsupported_pairing",
  "copied_within_exercise_rest", "duplicated_rest", "same_setup_treated_as_zero",
  "fake_setup_duration", "fake_recovery_duration", "fake_section_duration",
  "unknown_duration_called_fit", "timing_fact_counted_twice", "greedy_fallback_after_limit",
  "best_so_far_called_optimal", "completed_sequence_revision_rewritten",
] as const);

export const PRODUCTION_FINAL_SEQUENCING_METAMORPHIC_INVARIANTS = Object.freeze([
  "assignment_input_ordering",
  "prescription_plan_input_ordering",
  "transition_fact_ordering",
  "policy_rule_ordering",
  "equipment_capability_ordering",
  "catalog_ordering",
  "evidence_reference_ordering",
  "nonsemantic_provenance_ordering",
  "label_changes",
  "display_name_changes",
  "explanatory_prose_changes",
  "candidate_rank_changes_after_selection",
  "irrelevant_pain",
  "irrelevant_assessment",
  "irrelevant_history",
  "equivalent_explicit_assignment_ids",
] as const);

export const PRODUCTION_FINAL_SEQUENCING_MATERIAL_RESPONSES = Object.freeze([
  "hard_dependency", "section", "role", "dominant_need_priority", "planner_priority_order",
  "capacity_main_responsibility", "required_versus_optional_accessory", "reviewed_interference",
  "explicit_setup_relationship", "explicit_transition_duration", "explicit_recovery_duration",
  "available_minute_lower_bound_conflict", "prescription_revision_change", "equipment_realization_change",
] as const);

export const PRODUCTION_FINAL_SEQUENCING_CONTROLLED_SCENARIOS = Object.freeze([
  "no_warmup", "no_activation", "warmup_only", "activation_only", "warmup_and_activation",
  "shared_warmup_dependency", "several_preparation_dependencies", "several_activation_dependencies",
  "one_main_assignment", "two_main_assignments", "primary_plus_secondary_strength",
  "strength_plus_hypertrophy_main", "capacity_main", "required_direct_accessory", "optional_accessory",
  "several_required_accessories", "grip_intensive_accessory_carry", "trunk_intensive_accessory",
  "explicit_cooldown", "no_cooldown", "timed_hold", "breath_cycles", "distance_carry_without_pace",
  "timed_carry", "stationary_march_steps", "stationary_march_time", "counted_step_work",
  "dynamic_intent_only_tempo", "dynamic_exact_tempo", "same_setup_without_timing",
  "compatible_setup_without_timing", "explicit_setup_timing", "explicit_recovery_timing", "section_timing",
  "all_timing_unknown", "known_lower_bound_over_budget", "bounded_duration", "fully_known_duration",
  "blocked_training_safety", "unresolved_prescription_requirement", "missing_plan", "extra_plan",
  "dependency_cycle", "source_event_mismatch", "prescription_revision_mismatch", "same_order_convergence",
  "candidate_rank_mutation", "setup_first_mutation", "pairing_mutation", "search_budget_exhaustion",
] as const);
