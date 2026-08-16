# Product Goal and Context Screenshot, Code, and Render Drift Audit

| ID | Evidence | Classifications | Disposition | Material to E |
| --- | --- | --- | --- | --- |
| global_visual_language | Five Product composites and current renders share photo, dark glass, sky selection, and gradient CTA language | screenshot_matches_current_branch | preserve | true |
| consumer_field_order | Owner screenshot and consumer branch both order days, goal, mode, pain, experience, equipment | screenshot_matches_current_branch | record_current_order_but_design_goal_first_target | true |
| knees_pain_choice | Owner screenshot includes Knees; both current QuestionnaireForm sources stop at Hips | screenshot_matches_deployed_but_not_branch, stale_build_possible, requires_owner_review | do_not_add_in_E_or_F_without_separate_decision | false |
| resistance_band_detail | Owner reports a conditional detail state; no subtype, anchor, or band-detail branch code/render exists | conditional_state_not_captured, owner_observation_unverified, stale_build_possible, requires_owner_review | design_progressive_disclosure_without_claiming_current_implementation | true |
| consumer_training_mode | Consumer renders Build, Maintain, Recover cards and matches the screenshot | screenshot_matches_current_branch | preserve_current_runtime_in_E_and_F | true |
| gyms_training_mode | Gyms schema accepts trainingIntent but its QuestionnaireForm renders no mode picker | consumer_gyms_difference, current_branch_only | record_parity_gap_keep_gyms_runtime_unchanged | true |
| mobile_owner_crops | Owner declares eight mobile crops, but no independently identifiable mobile crop exists in the local eight-binary inventory | owner_observation_unverified, not_material_to_Chunk_E | use_owner_observation_as_evidence_and_current_head_mobile_renders_for_branch_verification | false |
| binary_inventory | Owner declares 13 logical images while eight 4480x1440 binaries are locally present; three include partial or unrelated desktop context | requires_owner_review, not_material_to_Chunk_E | record_without_requesting_images_again | false |
| training_intent_signature | trainingIntent is persisted and consumed by engine/shadow mapping but omitted from buildQuestionnaireSignature | historical_compatibility_behavior, future_architecture_difference | signature_v2_design_required_before_activation | true |
| legacy_gym_expansion | normalizeEquipmentSelection expands gym to dumbbells, barbell, kettlebell, cables, machines, and bench | historical_compatibility_behavior, future_architecture_difference | preserve_legacy_replay_but_do_not_copy_into_v2_profile | true |
| gyms_buyer_demo_equipment | Buyer demo replaces equipment checkboxes with a gym-owner configured environment panel | current_branch_only, consumer_gyms_difference | gym_owner_lock_remains_authoritative | true |
| movement_profile_title | Screenshot and branch title both say Build your Praxis movement profile | screenshot_matches_current_branch, future_architecture_difference | later_copy_target_broadens_to_training_profile_F_may_preserve_current | true |

Unresolved targeted drift count: 4. Top Chunk E classification remains earnable because the discrepancies are explicit and do not prevent the one-surface design.

Fingerprint: `eebb5b389cbd48c13ca9426eb5f08427a5ab863a1bf43f45c68178a792f1bdfd`.
