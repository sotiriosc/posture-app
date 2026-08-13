# Prescription Tournament V2 Full Session Report

Classification: `PRESCRIPTION_TOURNAMENT_CAUSAL_VALIDITY_READY_FOR_OWNER_SELECTION`.

The V2 holdout is built from production Session Intent Planner, Candidate Intelligence, Session Composer, valid SessionSkeletons, and SessionPrescriptionHandoff objects.

Assignment-only V1 fixtures are disclosed regression pipelines, not full-session evidence.

- V2 locked scenarios: 100
- Multi-assignment full sessions: 83
- Full-session candidate pipelines: 8300
- Full-session performance-linkage pipelines: 8300

| Scenario | Assignments | Exercises | Tags |
| v2-holdout-001-multi_exercise_upper_strength | 2 | machine-chest-press, machine-row | upper_strength, no_warmup, no_cooldown, same_framework_different_prescription_facts, productive_prior_prescription |
| v2-holdout-002-multi_exercise_lower_strength | 2 | dumbbell-romanian-deadlift, goblet-squat | lower_strength, main_ramp_up, same_skeleton_same_prescription_expected, no_prior_prescription, successful_reexposure |
| v2-holdout-003-hypertrophy_session | 2 | cable-triceps-pressdown, dumbbell-bench-press | hypertrophy, multiple_accessories, same_framework_different_prescription_facts, no_prior_prescription, successful_reexposure |
| v2-holdout-004-general_fitness_session | 1 | push-up | general_fitness, distance_carry, same_skeleton_same_prescription_expected, productive_prior_prescription, successful_reexposure |
| v2-holdout-005-posture_movement_quality | 3 | bodyweight-hip-hinge-rehearsal, machine-chest-press, serratus-wall-slide | posture_quality, warmup_and_activation, same_framework_different_prescription_facts, no_prior_prescription, successful_reexposure |
| v2-holdout-006-pain_aware_explicit_outcome | 2 | bodyweight-hip-hinge-rehearsal, goblet-squat | pain_aware, range_requirement, condensed, same_skeleton_same_prescription_expected, no_prior_prescription |
| v2-holdout-007-activation_without_warmup | 2 | machine-chest-press, serratus-wall-slide | activation_without_warmup, same_framework_different_prescription_facts, productive_prior_prescription, successful_reexposure, actual_duration_differs |
| v2-holdout-008-warmup_without_activation | 2 | bodyweight-hip-hinge-rehearsal, dumbbell-romanian-deadlift | warmup_without_activation, productive_prior_prescription, same_skeleton_same_prescription_expected, no_prior_prescription, successful_reexposure |
| v2-holdout-009-no_accessory_explicit_cooldown | 1 | machine-row | explicit_cooldown, breath_cycles, explicit_breath_cadence, same_framework_different_prescription_facts, no_prior_prescription |
| v2-holdout-010-multiple_accessories_and_carry | 4 | cable-triceps-pressdown, dumbbell-curl, machine-chest-press, suitcase-carry | multiple_accessories, timed_carry, substitution, same_skeleton_same_prescription_expected, productive_prior_prescription |
| v2-holdout-011-support_side_requirement | 2 | goblet-squat, suitcase-carry | support_requirement, side_requirement, same_framework_different_prescription_facts, no_prior_prescription, adverse_response |
| v2-holdout-012-step_and_march_session | 2 | loop-band-lateral-walk, machine-chest-press | step_sets, stationary_march_duration, same_skeleton_same_prescription_expected, no_prior_prescription, successful_reexposure |
| v2-holdout-013-multi_exercise_upper_strength | 2 | machine-chest-press, machine-row | upper_strength, no_warmup, no_cooldown, same_framework_different_prescription_facts, productive_prior_prescription |
| v2-holdout-014-multi_exercise_lower_strength | 2 | dumbbell-romanian-deadlift, goblet-squat | lower_strength, main_ramp_up, same_skeleton_same_prescription_expected, no_prior_prescription, successful_reexposure |
| v2-holdout-015-hypertrophy_session | 2 | cable-triceps-pressdown, dumbbell-bench-press | hypertrophy, multiple_accessories, same_framework_different_prescription_facts, no_prior_prescription, successful_reexposure |
| v2-holdout-016-general_fitness_session | 1 | push-up | general_fitness, distance_carry, same_skeleton_same_prescription_expected, productive_prior_prescription, adverse_response |

Tag coverage: activation_without_warmup, actual_duration_differs, actual_tempo_differs, adverse_response, breath_cycles, condensed, distance_carry, explicit_breath_cadence, explicit_cooldown, general_fitness, hypertrophy, label_blind_mutation, lower_strength, main_ramp_up, multiple_accessories, no_cooldown, no_policy_conflict, no_prior_prescription, no_warmup, owner_leading_blind_mutation, pain_aware, policy_conflict, posture_quality, productive_prior_prescription, range_requirement, same_framework_different_prescription_facts, same_skeleton_same_prescription_expected, semantic_stability, shape_blind_mutation, side_requirement, stationary_march_duration, step_sets, substitution, successful_reexposure, support_requirement, timed_carry, upper_strength, warmup_and_activation, warmup_without_activation.
