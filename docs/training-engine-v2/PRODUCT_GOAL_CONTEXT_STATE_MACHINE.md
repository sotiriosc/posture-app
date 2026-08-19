# Product Goal and Context State Machine

States: 17.

| From | Event | To |
| --- | --- | --- |
| pristine | edit_current_field | editing |
| loaded_legacy_profile | edit_current_field | editing |
| loaded_legacy_profile | legacy_reduce_pain_detected | migration_required |
| editing | select_broad_goal | conditional_follow_up_open |
| editing | open_secondary_disclosure | optional_secondary_open |
| editing | change_signed_legacy_field | dirty_current_profile |
| conditional_follow_up_open | select_unsupported_focus | unsupported_focus |
| conditional_follow_up_open | select_supported_focus | editing |
| editing | select_equipment_requiring_legality_fact | equipment_detail_required |
| equipment_detail_required | leave_required_detail_unknown | equipment_detail_unresolved |
| equipment_detail_required | resolve_required_detail | editing |
| editing | select_explicit_preview_get_stronger | inactive_preview_selected |
| inactive_preview_selected | attempt_submit | future_submission_unavailable |
| unsupported_focus | attempt_submit | future_submission_unavailable |
| equipment_detail_unresolved | attempt_submit | incomplete |
| dirty_current_profile | submit_current_legacy_profile | confirmation_required |
| confirmation_required | active_session_exists | active_session_warning |
| confirmation_required | confirm_without_active_session | submitting_legacy |
| active_session_warning | confirm_current_legacy_change | submitting_legacy |
| confirmation_required | cancel | cancel_revert |
| active_session_warning | cancel | cancel_revert |
| cancel_revert | restore_exact_committed_state | loaded_legacy_profile |
| migration_required | cancel_migration | cancel_revert |

Prohibited transitions:

- inactive_preview_selected_to_submitting_legacy
- unsupported_focus_to_submitting_legacy
- equipment_detail_unresolved_to_submitting_legacy
- selection_to_persistence_without_confirmation

Inactive preview reaches legacy generation: no. Unsupported focus reaches generation: no. Cancel restores exact committed state: yes. Current legacy flow remains representable: yes.

Fingerprint: `21abbe07c97eb136486b9483055e3535461d6effb1e62e7d8f14de0b5c58ba72`.
