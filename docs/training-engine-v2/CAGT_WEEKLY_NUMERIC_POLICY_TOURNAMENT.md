# CAGT Weekly Numeric Policy Tournament

Classification: `TARGETED_POLICY_CANDIDATE_FIXES_REQUIRED`.

Authority: `OWNER_REVIEW_RECOMMENDATION_ONLY`. No candidate is production policy.

## Execution

- 32 atomic candidates and 6 fixed composites.
- 19 calibration and 23 locked holdout scenarios.
- 1596 candidate/scenario evaluations.
- 2060 complete production Planner/Candidate/Composer pipelines.
- 10000 deterministic stress combinations and 1000 audited complete pipelines.

## Results

| Candidate | Classification | Hard failures | Required coverage | Reservations | Search states |
|---|---|---:|---:|---:|---:|
| STRENGTH_S1_MINIMAL | PARETO_FRONTIER_OWNER_DECISION_REQUIRED | 0 | 100.0% | 49 | 459 |
| STRENGTH_S2_BALANCED | CAGT_RECOMMENDED_FOR_OWNER_ADMISSION | 0 | 100.0% | 84 | 1074 |
| STRENGTH_S3_REQUIRED_TWO | REJECTED_BY_HARD_GATE | 2 | 92.9% | 83 | 615 |
| STRENGTH_S4_HIGH_FREQUENCY_STRESS | REJECTED_BY_HARD_GATE | 2 | 92.9% | 104 | 1089 |
| STRENGTH_SP1_PREFERRED_ONCE | CAGT_RECOMMENDED_FOR_OWNER_ADMISSION | 0 | 100.0% | 49 | 459 |
| STRENGTH_SP2_PREFERRED_DISTRIBUTED | CAGT_RECOMMENDED_FOR_OWNER_ADMISSION | 0 | 100.0% | 49 | 459 |
| STRENGTH_SO1_OPTIONAL | CAGT_RECOMMENDED_FOR_OWNER_ADMISSION | 0 | 100.0% | 49 | 459 |
| MUSCLE_H1_SINGLE_FLEXIBLE | PARETO_FRONTIER_OWNER_DECISION_REQUIRED | 0 | 100.0% | 49 | 459 |
| MUSCLE_H2_DISTRIBUTED | PARETO_FRONTIER_OWNER_DECISION_REQUIRED | 0 | 100.0% | 49 | 551 |
| MUSCLE_H3_REQUIRED_TWO | REJECTED_FOR_OVER_ADAPTATION | 0 | 96.4% | 54 | 480 |
| MUSCLE_H4_HIGH_FREQUENCY_STRESS | REJECTED_FOR_OVER_ADAPTATION | 0 | 96.4% | 59 | 534 |
| MUSCLE_HP1_PREFERRED_ONCE | PARETO_FRONTIER_OWNER_DECISION_REQUIRED | 0 | 100.0% | 49 | 459 |
| MUSCLE_HP2_PREFERRED_DISTRIBUTED | PARETO_FRONTIER_OWNER_DECISION_REQUIRED | 0 | 100.0% | 49 | 580 |
| MUSCLE_HO1_OPTIONAL | PARETO_FRONTIER_OWNER_DECISION_REQUIRED | 0 | 100.0% | 49 | 459 |
| DIRECT_D1_ONCE | CAGT_RECOMMENDED_FOR_OWNER_ADMISSION | 0 | 100.0% | 49 | 459 |
| DIRECT_D2_FLEXIBLE_REPEAT | INSUFFICIENT_EVIDENCE | 0 | 100.0% | 49 | 459 |
| DIRECT_D3_TARGET_TWO | REJECTED_FOR_OVER_ADAPTATION | 0 | 100.0% | 49 | 479 |
| DIRECT_DP1_PREFERRED | CAGT_RECOMMENDED_FOR_OWNER_ADMISSION | 0 | 100.0% | 49 | 459 |
| DIRECT_DO1_OPTIONAL | CAGT_RECOMMENDED_FOR_OWNER_ADMISSION | 0 | 100.0% | 49 | 459 |
| ASSESSMENT_A1_SINGLE_CLUSTER | CAGT_RECOMMENDED_FOR_OWNER_ADMISSION | 0 | 100.0% | 49 | 459 |
| ASSESSMENT_A2_REPEAT_OVERRIDE_STRESS | REJECTED_FOR_OVER_ADAPTATION | 0 | 100.0% | 49 | 567 |
| CAPACITY_C1_ONCE | CAGT_RECOMMENDED_FOR_OWNER_ADMISSION | 0 | 100.0% | 49 | 459 |
| CAPACITY_C2_FLEXIBLE_REPEAT | INSUFFICIENT_EVIDENCE | 0 | 100.0% | 49 | 459 |
| CAPACITY_C3_TARGET_TWO | REJECTED_FOR_OVER_ADAPTATION | 0 | 100.0% | 50 | 483 |
| CAPACITY_CP1_PREFERRED | CAGT_RECOMMENDED_FOR_OWNER_ADMISSION | 0 | 100.0% | 49 | 459 |
| CAPACITY_CO1_OPTIONAL | CAGT_RECOMMENDED_FOR_OWNER_ADMISSION | 0 | 100.0% | 49 | 459 |
| PARTICIPATION_P0_NONE | ADVISORY_ONLY_NOT_EXECUTABLE | 0 | 100.0% | 49 | 459 |
| PARTICIPATION_P1_BROAD_ADVISORY | ADVISORY_ONLY_NOT_EXECUTABLE | 0 | 100.0% | 49 | 459 |
| PARTICIPATION_P2_TWO_DAY_FLOOR_STRESS | ADVISORY_ONLY_NOT_EXECUTABLE | 0 | 100.0% | 49 | 459 |
| SPACING_R0_PRESCRIPTION_PENDING | CAGT_RECOMMENDED_FOR_OWNER_ADMISSION | 0 | 100.0% | 49 | 459 |
| SPACING_R1_PREFER_DISTRIBUTION | INSUFFICIENT_EVIDENCE | 0 | 100.0% | 49 | 459 |
| SPACING_R2_ONE_OPPORTUNITY_GAP_STRESS | PRESCRIPTION_DEPENDENT_NOT_ADMISSIBLE | 0 | 100.0% | 49 | 459 |
| COMPOSITE_M0_MINIMAL_STABILITY | PARETO_FRONTIER_OWNER_DECISION_REQUIRED | 0 | 100.0% | 49 | 459 |
| COMPOSITE_B1_BALANCED_CAUSAL | PARETO_FRONTIER_OWNER_DECISION_REQUIRED | 0 | 100.0% | 84 | 1293 |
| COMPOSITE_S1_STRENGTH_PRACTICE | REJECTED_BY_HARD_GATE | 2 | 92.9% | 83 | 615 |
| COMPOSITE_H1_HYPERTROPHY_FLEXIBLE | PARETO_FRONTIER_OWNER_DECISION_REQUIRED | 0 | 100.0% | 49 | 551 |
| COMPOSITE_F1_HIGH_FREQUENCY_STRESS | REJECTED_BY_HARD_GATE | 4 | 92.9% | 87 | 1910 |
| COMPOSITE_X0_NO_POLICY | REJECTED_FOR_UNDER_ADAPTATION | 42 | 0.0% | 0 | 0 |

## Owner Review

- **assessment:** `ASSESSMENT_A1_SINGLE_CLUSTER` - One reviewed cluster remains one objective and does not recur without explicit authority.
- **direct:** `DIRECT_D1_ONCE` - D2 soft-ceiling flexibility produced no unique executable benefit; the predeclared fallback is D1.
- **capacity:** `CAPACITY_C1_ONCE` - C2 produced no unique repeat value; C1 preserves explicit supported capacity without mandatory recurrence.
- **strength:** `STRENGTH_S2_BALANCED` - Target two improved practice distribution while minimum one remained truthful; minimum-two variants failed constrained contexts.
- **muscle:** `H1_H2_OWNER_DECISION` - H2 did not establish a decisive feasibility benefit over H1 and frequency cannot stand in for volume.
- **participation:** `PARTICIPATION_P0_NONE` - Participation context did not lawfully change objectives, reservations, or sessions.
- **spacing:** `SPACING_R0_PRESCRIPTION_PENDING` - R1 did not prove unique late-tie value; R2 remains Prescription-dependent.
- **composite:** `NO_COMPOSITE_ADMISSION_YET` - B1 is hard-gate clean but inherits unresolved H1/H2 and unproven D2/C2/R1 component choices.

The balanced composite B1 is not activated. Design evidence is not production proof.

## Owner-Selected V1 Admission

The owner selected `WEEK_POLICY_V1_CAUSAL_CORE_CANDIDATE`: strength S2, muscle H1, direct D1, assessment A1, capacity C1, participation P0, and spacing R0. This is a new independently fingerprinted composite, not admission of B1. The result is `WEEK_POLICY_V1_PARTIAL_SCOPE_READY_TARGETED_POLICY_GAPS`; numeric production policy remains inactive.
