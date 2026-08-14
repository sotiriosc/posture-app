# Phase Continuity CAGT Matrix

Generated deterministically from explicit Authority Registry V3 and test/developer-only Gate 15 tooling.

Controlled cases: `85`; malformed result count: `0`.

| Case | Status | First failing subgate |
| --- | --- | --- |
| same_phase_same_facts | remain_current_phase | none |
| week_count_increases_only | remain_current_phase | none |
| calendar_time_changes_only | remain_current_phase | none |
| phase_display_name_changes | remain_current_phase | none |
| developed_quality_prose_changes | remain_current_phase | none |
| priority_muscle_array_changes_without_objective | remain_current_phase | none |
| current_program_remains_productive | remain_current_phase | none |
| insufficient_performance_evidence | remain_current_phase | none |
| mixed_response_evidence | remain_current_phase | none |
| unknown_recovery | remain_current_phase | none |
| target_criterion_incomplete | remain_current_phase | none |
| one_missed_session | remain_current_phase | none |
| one_failed_set | remain_current_phase | none |
| one_local_prescription_review | remain_current_phase | none |
| irrelevant_pain | remain_current_phase | none |
| phase_1_to_2_all_typed_criteria_met | advance_to_next_phase_authorized | none |
| phase_1_to_2_planned_valid_no_completed_evidence | hold_current_phase_pending_evidence | none |
| phase_1_to_2_isolated_success_only | hold_current_phase_pending_evidence | none |
| phase_1_to_2_repeated_successful_evidence | advance_to_next_phase_authorized | none |
| phase_1_to_2_tolerated_exposure_stable_execution | advance_to_next_phase_authorized | none |
| phase_1_to_2_worsening_response_blocker | hold_current_phase_due_blocker | none |
| phase_1_to_2_urgent_safety_block | transition_blocked_by_training_safety | none |
| phase_1_to_2_unresolved_prescription_blocker | hold_current_phase_due_blocker | none |
| phase_1_to_2_mixed_evidence | transition_evidence_conflict | none |
| phase_1_to_2_evidence_conflict | transition_evidence_conflict | none |
| phase_1_to_2_same_framework_retained | advance_to_next_phase_authorized | none |
| phase_1_to_2_same_anchors_retained | advance_to_next_phase_authorized | none |
| phase_1_to_2_same_complete_program_legal | advance_to_next_phase_authorized | none |
| phase_1_to_2_local_prescription_policy_change | advance_to_next_phase_authorized | none |
| phase_1_to_2_all_exercises_replaced_mutation | transition_not_authorized | 15.6_stable_base_continuity |
| phase_2_generic_strength_template_mutation | transition_not_authorized | 15.6_stable_base_continuity |
| phase_priority_muscles_create_needs_mutation | transition_not_authorized | 15.7_local_phase_owned_change |
| phase_primary_goal_overrides_athlete_goal_mutation | transition_not_authorized | 15.7_local_phase_owned_change |
| phase_2_to_3_repeated_productive_progression_evidence | advance_to_next_phase_authorized | none |
| phase_2_to_3_progression_review_permitted_not_selected | advance_to_next_phase_authorized | none |
| phase_2_to_3_recoverability_present | advance_to_next_phase_authorized | none |
| phase_2_to_3_recovery_missing | hold_current_phase_pending_evidence | none |
| phase_2_to_3_plateau_productive_continuity | advance_to_next_phase_authorized | none |
| phase_2_to_3_plateau_poor_recovery | hold_current_phase_due_blocker | none |
| phase_2_to_3_one_adverse_response | hold_current_phase_due_blocker | none |
| phase_2_to_3_successful_re_exposure | advance_to_next_phase_authorized | none |
| phase_2_to_3_same_framework_retained | advance_to_next_phase_authorized | none |
| phase_2_to_3_phase_incompatible_assignment_reviewed | advance_to_next_phase_authorized | none |
| phase_2_to_3_all_anchors_replaced_mutation | transition_not_authorized | 15.6_stable_base_continuity |
| phase_2_to_3_universal_set_increase_mutation | longitudinal_owner_required | 15.7_local_phase_owned_change |
| phase_2_to_3_universal_effort_increase_mutation | longitudinal_owner_required | 15.7_local_phase_owned_change |
| phase_2_to_3_universal_support_reduction_mutation | longitudinal_owner_required | 15.7_local_phase_owned_change |
| phase_2_to_3_universal_slow_tempo_mutation | longitudinal_owner_required | 15.7_local_phase_owned_change |
| phase_3_remain | remain_current_phase | none |
| phase_3_cycle_completion_owner_review | phase_cycle_completion_owner_review_required | none |
| automatic_phase_4_mutation | upstream_program_invalid | 15.1_upstream_validity |
| automatic_phase_1_restart_mutation | longitudinal_owner_required | 15.7_local_phase_owned_change |
| automatic_deload_mutation | longitudinal_owner_required | 15.7_local_phase_owned_change |
| automatic_rotation_mutation | longitudinal_owner_required | 15.7_local_phase_owned_change |
| regression_pain_region_only | remain_current_phase | none |
| regression_repeated_response_blocker | remain_current_phase | none |
| regression_safety_block | transition_blocked_by_training_safety | none |
| regression_one_missed_week | remain_current_phase | none |
| regression_low_adherence_evidence | remain_current_phase | none |
| explicit_regression_review_evidence | phase_regression_review_required | none |
| automatic_phase_2_to_1_mutation | longitudinal_owner_required | 15.7_local_phase_owned_change |
| phase_change_plus_explicit_goal_change | advance_to_next_phase_authorized | none |
| phase_change_plus_one_day_equipment_loss | advance_to_next_phase_authorized | none |
| phase_change_plus_whole_horizon_equipment_loss | advance_to_next_phase_authorized | none |
| phase_change_plus_condensed_session | advance_to_next_phase_authorized | none |
| phase_change_plus_new_direct_objective | advance_to_next_phase_authorized | none |
| phase_change_plus_removed_objective | advance_to_next_phase_authorized | none |
| phase_change_plus_relevant_support_requirement | advance_to_next_phase_authorized | none |
| phase_change_plus_side_specific_requirement | advance_to_next_phase_authorized | none |
| phase_change_plus_safety_block | transition_blocked_by_training_safety | none |
| warmup_dependency_persists | advance_to_next_phase_authorized | none |
| warmup_dependency_disappears | advance_to_next_phase_authorized | none |
| new_typed_warmup_dependency | advance_to_next_phase_authorized | none |
| generic_phase_1_corrective_circuit_mutation | transition_not_authorized | 15.8_warmup_activation_and_supporting_continuity |
| generic_phase_2_activation_circuit_mutation | transition_not_authorized | 15.8_warmup_activation_and_supporting_continuity |
| generic_phase_3_cuff_circuit_mutation | transition_not_authorized | 15.8_warmup_activation_and_supporting_continuity |
| shared_preparation_remains_shared | advance_to_next_phase_authorized | none |
| stale_supporting_work_remains_mutation | advance_to_next_phase_authorized | none |
| stable_phase_cycle_identity | advance_to_next_phase_authorized | none |
| ambiguous_cross_horizon_session_alignment | phase_program_alignment_ambiguous | 15.5_cross_horizon_alignment |
| stable_anchor_moved_to_another_session | advance_to_next_phase_authorized | none |
| source_event_revised_without_duplication | advance_to_next_phase_authorized | none |
| same_exercise_changed_prescription | advance_to_next_phase_authorized | none |
| same_exercise_reps_tempo | advance_to_next_phase_authorized | none |
| exercise_changed_due_equipment_not_phase | advance_to_next_phase_authorized | none |

<!-- PRODUCTION_PHASE_CONTINUITY_KERNEL_V1:START -->
## Production Phase Continuity Kernel V1

- Status: `PRODUCTION_PHASE_CONTINUITY_KERNEL_IMPLEMENTED_NOT_ACTIVATED`
- Classification: `PRODUCTION_PHASE_CONTINUITY_KERNEL_READY_FOR_LONGITUDINAL_ADAPTATION_GATE_16_AUTHORIZATION`
- Activation: `NOT_ACTIVATED`
- Contract: `PRODUCTION_PHASE_CONTINUITY_KERNEL@1.0.0`
- Policy injection is explicit; no default policy or evidence source is selected.
- Decisions remain unapplied: `stateMutationApplied=false`, `applicationOwnerRequired=true`.
- Gate 15 authority is production kernel; Gate 16 remains foundation-only and not implemented.
- Golden equivalence: `PRODUCTION_PHASE_CONTINUITY_GOLDEN_EQUIVALENCE_PASS` with 0 unexplained differences.
- Deterministic stress: `PRODUCTION_PHASE_CONTINUITY_DETERMINISTIC_STRESS_PASS` across 10000 evaluations.
- Combined fingerprint: `39236671808d605a53258351b58b081a64231b8c4fd6dee4125501e68e9bd232`
<!-- PRODUCTION_PHASE_CONTINUITY_KERNEL_V1:END -->
