# CAGT Weekly Numeric Policy Candidates

Version: `1.0.0`. State for every row: `CAGT_TEST_CANDIDATE_NOT_PRODUCTION`.

This lattice was frozen before tournament execution. Bands are allocated-session frequency only and never establish sets, dose, recovery sufficiency, Prescription, phase multiplication, or production policy.

## Priority Semantics

- Required objectives use the declared required band and remain explicitly unresolved below minimum.
- Preferred objectives use minimum zero; omission requires a structured reason and required responsibilities remain first.
- Optional objectives use `0 / 1 / 1`, require explicit creation and unique positive marginal value, and may be omitted.

## Atomic Lattice

| Candidate | Family and priority | Minimum | Target | Soft maximum | Disposition before test |
|---|---|---:|---:|---:|---|
| STRENGTH_S1_MINIMAL | strength required | 1 | 1 | 2 | neutral |
| STRENGTH_S2_BALANCED | strength required | 1 | 2 | 3 | owner-leading, not selected |
| STRENGTH_S3_REQUIRED_TWO | strength required | 2 | 2 | 3 | stress |
| STRENGTH_S4_HIGH_FREQUENCY_STRESS | strength required | 2 | 3 | 4 | stress |
| STRENGTH_SP1_PREFERRED_ONCE | strength preferred | 0 | 1 | 2 | neutral |
| STRENGTH_SP2_PREFERRED_DISTRIBUTED | strength preferred | 0 | 2 | 3 | neutral |
| STRENGTH_SO1_OPTIONAL | strength optional | 0 | 1 | 1 | neutral |
| MUSCLE_H1_SINGLE_FLEXIBLE | muscle required | 1 | 1 | 2 | neutral |
| MUSCLE_H2_DISTRIBUTED | muscle required | 1 | 2 | 3 | neutral |
| MUSCLE_H3_REQUIRED_TWO | muscle required | 2 | 2 | 3 | stress |
| MUSCLE_H4_HIGH_FREQUENCY_STRESS | muscle required | 2 | 3 | 4 | stress |
| MUSCLE_HP1_PREFERRED_ONCE | muscle preferred | 0 | 1 | 2 | neutral |
| MUSCLE_HP2_PREFERRED_DISTRIBUTED | muscle preferred | 0 | 2 | 3 | neutral |
| MUSCLE_HO1_OPTIONAL | muscle optional | 0 | 1 | 1 | neutral |
| DIRECT_D1_ONCE | direct required | 1 | 1 | 1 | neutral |
| DIRECT_D2_FLEXIBLE_REPEAT | direct required | 1 | 1 | 2 | owner-leading, not selected |
| DIRECT_D3_TARGET_TWO | direct required | 1 | 2 | 2 | stress |
| DIRECT_DP1_PREFERRED | direct preferred | 0 | 1 | 1 | neutral |
| DIRECT_DO1_OPTIONAL | direct optional | 0 | 1 | 1 | neutral |
| ASSESSMENT_A1_SINGLE_CLUSTER | assessment required | 1 | 1 | 1 | owner-leading/default, not selected |
| ASSESSMENT_A2_REPEAT_OVERRIDE_STRESS | assessment required | 1 | 2 | 2 | explicit-override stress |
| CAPACITY_C1_ONCE | supported capacity required | 1 | 1 | 1 | neutral |
| CAPACITY_C2_FLEXIBLE_REPEAT | supported capacity required | 1 | 1 | 2 | owner-leading, not selected |
| CAPACITY_C3_TARGET_TWO | supported capacity required | 1 | 2 | 3 | stress |
| CAPACITY_CP1_PREFERRED | supported capacity preferred | 0 | 1 | 1 | neutral |
| CAPACITY_CO1_OPTIONAL | supported capacity optional | 0 | 1 | 1 | neutral |
| PARTICIPATION_P0_NONE | participation advisory | - | - | - | no executable number |
| PARTICIPATION_P1_BROAD_ADVISORY | participation advisory | 1 | 2 | 4 | advisory only |
| PARTICIPATION_P2_TWO_DAY_FLOOR_STRESS | participation advisory | 2 | 2 | 4 | advisory stress |
| SPACING_R0_PRESCRIPTION_PENDING | spacing state | - | - | - | owner-leading truthful state |
| SPACING_R1_PREFER_DISTRIBUTION | late allocation preference | - | - | - | no elapsed-time claim |
| SPACING_R2_ONE_OPPORTUNITY_GAP_STRESS | ordered-gap stress | 1 | 1 | 1 | Prescription burden unresolved |

Assessment A1 also resolves preferred assessment to `0 / 1 / 1`. Preferred and optional direct/capacity rules are separate rows. Participation values are references only and cannot create objectives or reservations.

## Fixed Composites

| Composite | Strength | Muscle | Direct | Assessment | Capacity | Participation | Spacing |
|---|---|---|---|---|---|---|---|
| COMPOSITE_M0_MINIMAL_STABILITY | S1 | H1 | D1 | A1 | C1 | P0 | R0 |
| COMPOSITE_B1_BALANCED_CAUSAL | S2 | H2 | D2 | A1 | C2 | P1 advisory | R1 |
| COMPOSITE_S1_STRENGTH_PRACTICE | S3 | H1 | D2 | A1 | C2 | P1 advisory | R1 |
| COMPOSITE_H1_HYPERTROPHY_FLEXIBLE | S1 | H2 | D2 | A1 | C2 | P1 advisory | R1 |
| COMPOSITE_F1_HIGH_FREQUENCY_STRESS | S4 | H4 | D3 | A2 | C3 | P2 advisory | R2 |
| COMPOSITE_X0_NO_POLICY | unresolved | unresolved | unresolved | unresolved | unresolved | unresolved | unresolved |

Atomic sensitivity changes one family against M0. No post-result candidate combination is permitted. Lattice fingerprint: `097a115c4e8fd156dcf02e8acc6be7452feeb5cd67c08cb308406999cbfdf6bf`.
