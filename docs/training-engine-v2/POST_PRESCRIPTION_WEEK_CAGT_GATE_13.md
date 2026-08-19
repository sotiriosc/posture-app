# Post-Prescription Week CAGT Gate 13

Authority: `POST_PRESCRIPTION_WEEK_VALIDATION_DESIGN_EVIDENCE`. Clean holdout hard failures: `0`.

| Order | Subgate | Failure behavior |
|---|---|---|
| 0 | 13.0_week_input_truth | FAIL_STOP_THEN_SHADOW_ONLY |
| 1 | 13.1_session_completeness | FAIL_STOP_THEN_SHADOW_ONLY |
| 2 | 13.2_source_event_integrity | FAIL_STOP_THEN_SHADOW_ONLY |
| 3 | 13.3_block_contribution_truth | FAIL_STOP_THEN_SHADOW_ONLY |
| 4 | 13.4_weekly_objective_mapping | FAIL_STOP_THEN_SHADOW_ONLY |
| 5 | 13.5_prescribed_frequency_distribution | FAIL_STOP_THEN_SHADOW_ONLY |
| 6 | 13.6_dose_lane_truth | FAIL_STOP_THEN_SHADOW_ONLY |
| 7 | 13.7_stress_concentration_duration | FAIL_STOP_THEN_SHADOW_ONLY |
| 8 | 13.8_spacing_truth | FAIL_STOP_THEN_SHADOW_ONLY |
| 9 | 13.9_complete_prescribed_week_argument | FAIL_STOP_THEN_SHADOW_ONLY |