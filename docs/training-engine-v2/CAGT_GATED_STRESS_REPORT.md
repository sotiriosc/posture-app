# CAGT Gated Stress Report

Classification: `CAGT_READY_FOR_POLICY_ADMISSION_USE`.

2026-08-13 Prescription tournament hardening: the numeric Prescription tournament now has a
separate blind semantic evaluator stress pass in `PRESCRIPTION_TOURNAMENT_EVALUATOR_SELF_TEST.md`
and `PRESCRIPTION_TOURNAMENT_V2_CAUSAL_RESULTS.md`. The V2 pass preserves the existing CAGT gate
order and keeps downstream Prescription differences from rescuing upstream Week, Session Intent,
Candidate Intelligence, or Session Composer failures.

Causal Adaptation Gate Testing is a hierarchical counterfactual testing method in which a controlled input change is assigned to its canonical owner, the earliest layer legally permitted to respond, the latest layer by which a meaningful response is required, and the output dimensions allowed to change. Upstream invariants are protected, expected convergence is distinguished from unresponsiveness, and downstream variation cannot compensate for an earlier causal failure.

## Gate Summary

| Gate | Authority | Pass | Justified convergence | Deferred | Fail-stop | Not reached |
|---|---|---:|---:|---:|---:|---:|
| gate_0_scenario_truth | PRODUCTION | 32 | 0 | 0 | 0 | 0 |
| gate_1_weekly_responsibility_truth | DESIGN_ONLY | 32 | 0 | 0 | 0 | 0 |
| gate_2_whole_week_allocation_coverage | DESIGN_ONLY | 32 | 0 | 0 | 0 | 0 |
| gate_3_weekly_causal_adaptation | DESIGN_ONLY | 32 | 0 | 0 | 0 | 0 |
| gate_4_weekly_duplication_distribution | DESIGN_ONLY | 32 | 0 | 0 | 0 | 0 |
| gate_5_reservation_day_materialization | DESIGN_ONLY | 32 | 0 | 0 | 0 | 0 |
| gate_6_session_intent_truth | PRODUCTION | 31 | 1 | 0 | 0 | 0 |
| gate_7_candidate_intelligence_truth | PRODUCTION | 32 | 0 | 0 | 0 | 0 |
| gate_8_session_composition_truth | PRODUCTION | 31 | 1 | 0 | 0 | 0 |
| gate_9_prescription_handoff_truth | HANDOFF_ONLY | 32 | 0 | 0 | 0 | 0 |
| gate_10_sequencing_duration_handoff_truth | HANDOFF_ONLY | 32 | 0 | 0 | 0 | 0 |
| gate_11_execution_response_foundation | FOUNDATION_ONLY | 32 | 0 | 0 | 0 | 0 |
| gate_12_all_horizon_sessions | DESIGN_ONLY | 27 | 0 | 0 | 0 | 0 |
| gate_13_post_prescription_weekly_validation | NOT_IMPLEMENTED | 0 | 0 | 0 | 0 | 32 |
| gate_14_full_prescribed_program_comparison | NOT_IMPLEMENTED | 0 | 0 | 0 | 0 | 32 |
| gate_15_phase_continuity | NOT_IMPLEMENTED | 0 | 0 | 0 | 0 | 32 |
| gate_16_longitudinal_adaptation | FOUNDATION_ONLY | 32 | 0 | 0 | 0 | 0 |

## Causal Pairs

| Pair | Expected window | First material difference | Classification | First failing gate | No rescue |
|---|---|---|---|---|---|
| identical-meaningful-facts | none | none | EXPECTED_CONVERGENCE | none | true |
| athlete-id-only | none | none | EXPECTED_CONVERGENCE | none | true |
| athlete-label-only | none | none | EXPECTED_CONVERGENCE | none | true |
| prose-only | none | none | EXPECTED_CONVERGENCE | none | true |
| irrelevant-pain | gate_7_candidate_intelligence_truth to gate_7_candidate_intelligence_truth | gate_7_candidate_intelligence_truth | MATERIAL_ADAPTATION | none | true |
| relevant-shoulder | gate_7_candidate_intelligence_truth to gate_9_prescription_handoff_truth | gate_7_candidate_intelligence_truth | MATERIAL_ADAPTATION | none | true |
| low-back-sensitivity | gate_7_candidate_intelligence_truth to gate_9_prescription_handoff_truth | gate_7_candidate_intelligence_truth | MATERIAL_ADAPTATION | none | true |
| knee-sensitivity | gate_7_candidate_intelligence_truth to gate_9_prescription_handoff_truth | gate_7_candidate_intelligence_truth | MATERIAL_ADAPTATION | none | true |
| strength-vs-hypertrophy | gate_6_session_intent_truth to gate_7_candidate_intelligence_truth | gate_6_session_intent_truth | MATERIAL_ADAPTATION | none | true |
| strength-vs-general-fitness | gate_6_session_intent_truth to gate_8_session_composition_truth | gate_6_session_intent_truth | MATERIAL_ADAPTATION | none | true |
| pain-aware-same-goal | gate_6_session_intent_truth to gate_7_candidate_intelligence_truth | gate_6_session_intent_truth | MATERIAL_ADAPTATION | none | true |
| direct-calf-priority | gate_6_session_intent_truth to gate_8_session_composition_truth | gate_6_session_intent_truth | MATERIAL_ADAPTATION | none | true |
| high-assessment | gate_6_session_intent_truth to gate_8_session_composition_truth | gate_6_session_intent_truth | MATERIAL_ADAPTATION | none | true |
| low-assessment | gate_6_session_intent_truth to gate_8_session_composition_truth | gate_6_session_intent_truth | MATERIAL_ADAPTATION | none | true |
| productive-press-anchor | gate_6_session_intent_truth to gate_8_session_composition_truth | gate_6_session_intent_truth | MATERIAL_ADAPTATION | none | true |
| productive-row-anchor | gate_6_session_intent_truth to gate_8_session_composition_truth | gate_6_session_intent_truth | MATERIAL_ADAPTATION | none | true |
| adverse-response | gate_6_session_intent_truth to gate_9_prescription_handoff_truth | gate_6_session_intent_truth | MATERIAL_ADAPTATION | none | true |
| expected-gym-actual-home | gate_7_candidate_intelligence_truth to gate_8_session_composition_truth | gate_7_candidate_intelligence_truth | MATERIAL_ADAPTATION | none | true |
| raw-minutes-same-capacity | gate_6_session_intent_truth to gate_6_session_intent_truth | none | JUSTIFIED_CONVERGENCE | none | true |
| structural-capacity | gate_6_session_intent_truth to gate_8_session_composition_truth | gate_6_session_intent_truth | MATERIAL_ADAPTATION | none | true |
| plateau | gate_16_longitudinal_adaptation to gate_16_longitudinal_adaptation | gate_16_longitudinal_adaptation | MATERIAL_ADAPTATION | none | true |
| explicit-block | gate_7_candidate_intelligence_truth to gate_7_candidate_intelligence_truth | gate_7_candidate_intelligence_truth | MATERIAL_ADAPTATION | none | true |
| missed-without-reallocation | gate_2_whole_week_allocation_coverage to gate_2_whole_week_allocation_coverage | gate_2_whole_week_allocation_coverage | MATERIAL_ADAPTATION | none | true |
| explicit-reallocation | gate_2_whole_week_allocation_coverage to gate_2_whole_week_allocation_coverage | gate_2_whole_week_allocation_coverage | MATERIAL_ADAPTATION | none | true |
| same-four-day-different-responsibility | gate_1_weekly_responsibility_truth to gate_1_weekly_responsibility_truth | gate_1_weekly_responsibility_truth | MATERIAL_ADAPTATION | none | true |
| same-framework-different-support | gate_6_session_intent_truth to gate_6_session_intent_truth | gate_6_session_intent_truth | MATERIAL_ADAPTATION | none | true |
| framework-identical | none | none | EXPECTED_CONVERGENCE | none | true |
| framework-material-change | gate_1_weekly_responsibility_truth to gate_1_weekly_responsibility_truth | gate_1_weekly_responsibility_truth | MATERIAL_ADAPTATION | none | true |
| capacity-main-session | gate_6_session_intent_truth to gate_6_session_intent_truth | gate_6_session_intent_truth | MATERIAL_ADAPTATION | none | true |
| same-reps-permitted | gate_1_weekly_responsibility_truth to gate_1_weekly_responsibility_truth | gate_1_weekly_responsibility_truth | MATERIAL_ADAPTATION | none | true |
| same-exercise-justified | gate_8_session_composition_truth to gate_8_session_composition_truth | none | JUSTIFIED_CONVERGENCE | none | true |
| compound-real-user | gate_1_weekly_responsibility_truth to gate_1_weekly_responsibility_truth | gate_1_weekly_responsibility_truth | MATERIAL_ADAPTATION | none | true |

## Stress

- One-variable pairs: 10000; failures: 0; digest: `08d8292334119ab94dc06142b57a92c3a01aacbc8ad99c22bdd2f380aafb14d1`.
- Executable pipelines: 1000; failures: 0; digest: `7c31cb06b15099da29c525461fd75db938269ce04a4a4dd36c5bc419edc0bf32`.
- Four-day cohort: 10; framework collision: 0.7; adaptive collision: 0.4.
- Downstream rescue mutation: DOWNSTREAM_RESCUE_REJECTED; downstream differences scored: false.

Design-only evidence is not production proof. Not-implemented gates do not pass.

## Weekly Numeric Policy Tournament

The test-only tournament adds 10,000 fixed-seed policy/scenario combinations and audits 1,000 of 2,060 complete reservation-to-production-session pipelines. Invalid bands stop at Gate 0; no-policy stops at Gate 1; bloat, unauthorized assessment recurrence, and constrained overload stop at Gate 4. No later output rescues an earlier failure. Combined tournament fingerprint: `d16dc08712211864cc0d2dfc2762e4c20c85f6dba053c64e6599f3b08a76d905`.

## Week Policy V1 Admission Stress

The owner-selected S2/H1/D1/A1/C1/P0/R0 core completes 10,000 fixed-seed V1 combinations and 1,000 complete pipelines with zero hard failures. The 40-scenario independent holdout, 38 coherent-session scenarios, first-session stop canaries, all-session horizons, order permutations, stale/orphan preparation mutations, and main-selection changes are covered. Admission is `WEEK_POLICY_V1_PARTIAL_SCOPE_READY_TARGETED_POLICY_GAPS`; production activation remains false.

## Prescription Timing Extension

Timing dimensions are now available for Gates 9-11 without changing gate order or production authority. Gate 9 reports dose-mode knowledge, tempo/duration/cadence capability, timing policy requirement, and provenance. Gate 10 reports duration determinability, unknown tempo contribution, and rest/setup dependency. Gate 11 preserves prescribed-versus-actual tempo and duration facts. No timing-only downstream difference can rescue an upstream failure.

## Full Prescription Extension

The full Prescription extension adds 27 design dimensions across Gates 9-11: source exposure, revisions, dose blocks, block purposes, legal mode, policy ownership, unresolved requirements, no rescue, block order, duration determinability, planned-versus-actual block truth, substitutions, response linkage, and immutable original plan. Gate order is unchanged.

Prescription CAGT fingerprint: `f00bade643d196e1e0804c5fa682d35d146fda9d7a5910a8cd2f92a005734f95`.
