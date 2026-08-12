# Support And Stance Mechanics Contract

Fixed review time: `2026-08-12T00:00:00.000Z`.

Classification: **SUPPORT_AND_STANCE_SCHEMA_CHANGE_REQUIRED_BEFORE_SEVEN_EXERCISE_PRODUCTION_ROWS**.

This focused review is a prerequisite for the seven-exercise trunk/carry production tranche. It does not change production schema, catalog rows, scoring, ranking, phase behavior, eligibility, transition behavior, prescription, Session Composer, Week Composer, or ledgers.

## Current Consumer Audit

| Path | Consumer | Current use | Migration need |
| --- | --- | --- | --- |
| packages/training-engine-v2/src/domain/exercise.ts | ExerciseSupportProfile schema | Defines `externalSupport` and `bodySupport` as two coarse categorical fields plus review status and notes. | Replace or wrap with compositional support/stance data; preserve review status and notes/provenance. |
| packages/training-engine-v2/src/transitionComparison.ts | transition mechanics delta | Compares `externalSupport` and `bodySupport` with literal deltas and renders them as transition evidence. | Compare base position, stance, orientation, support contacts, support side, and support amount independently. |
| packages/training-engine-v2/src/candidate/rowSelectionKnowledge.ts | horizontal row support trace and lumbar differentiator | Emits support trace fields and gives chest-supported rows a lumbar-context differentiator. | Keep chest support observable while adding truthful support contact/mode and task-changing support amount. |
| packages/training-engine-v2/tests/helpers/candidateIntelligenceReviewReport.ts | review/report rendering | Formats support fields for candidate intelligence review tables. | Render the new compositional support profile without collapsing unknown into false category labels. |

## Schema Recommendation

Recommended shape: a smallest compositional support/stance profile built from base position, stance, orientation, support contacts, support amount, and support relationship. Do not create one enum per exercise, and do not add a field unless a real decision or trace consumes it.

| Field | Recommendation | Decision / trace need |
| --- | --- | --- |
| basePosition | Represent the body organization independent of external support, for example standing, half_kneeling, tall_kneeling, prone, side_support, supine, seated, quadruped, hanging, unknown. | Prevents half-kneeling from being encoded as standing and lets prone/side-support plank rows differ truthfully. |
| stance | Represent stance details only when they change the task, for example bilateral, split, half_kneeling_lead_side, staggered, stacked_feet, bent_knee_side_support, alternating_march, unknown. | Keeps stance compositional instead of creating one enum value per exercise. |
| orientation | Represent trunk/body orientation separately, for example upright, prone, supine, lateral, diagonal, suspended, unknown. | Allows prone forearm plank and lateral forearm side plank to be distinct without abusing body-support labels. |
| supportContacts[] | Represent one or more contacts with body region, surface/source, mode, side, and task role: forearm-floor-primary, foot-floor-primary, knee-floor-variant, hand-wall-secondary, chest-bench-primary, seat-machine-primary. | Captures forearm support, lateral forearm/foot support, wall support, and machine/bench contacts without false `hands_supported` labels. |
| supportAmount | Represent support magnitude only when task-changing: none, light_touch, partial, substantial, prescription_modifiable, unknown. | Keeps wall-supported suitcase march anti-lateral exposure contextual until support force/control is reviewed. |
| supportRelationship | Represent side relationship when it changes mechanics: same_side_load, opposite_side_load, bilateral, side_neutral, alternating, unknown. | Captures suitcase-march load/support relationship without creating a new movement role. |

## Seven-Exercise Blocking Gaps

| Exercise | Gap | Required contract |
| --- | --- | --- |
| forearm-plank | Existing `bodySupport` cannot say prone forearm-and-foot support. `hands_supported` would be false. | basePosition=prone, orientation=prone, supportContacts include bilateral forearms and feet, supportAmount captures knee-supported variant when prescribed. |
| forearm-side-plank | Existing `bodySupport` cannot say lateral forearm/foot or bent-knee side support. | basePosition=side_support, orientation=lateral, supportContacts include side forearm plus foot/knee contacts, side and lever remain prescription-visible. |
| half-kneeling-high-to-low-cable-chop | Existing `bodySupport` cannot say half-kneeling. Encoding it as standing would lie. | basePosition=half_kneeling, stance captures lead side, orientation/upright rotation path remains separate from cable anchor support. |
| wall-supported-suitcase-march | Existing support fields cannot encode wall-support magnitude or opposite-side support/load relationship. | basePosition=standing, stance=alternating_march, supportContacts include hand-wall secondary contact, supportAmount=prescription_modifiable, supportRelationship=opposite_side_load. |

## Existing Metadata Truth Audit

Lie status: `NO_CURRENT_PRODUCTION_SUPPORT_STANCE_LIE_DISCOVERED`.

Current production lie findings: none.

The current production catalog uses coarse support labels and has some setup-dependent notes, but this focused pass did not find an existing production row that encodes half-kneeling as standing, forearm support as hands-supported, or a known task-changing support amount as a hard support category. The defect is representational insufficiency for the next rows, not a discovered production-data falsehood.

Observed support pairs: bench/chest_supported, bench/hands_supported, bench/supine, box/standing, cable_or_band_anchor/seated_supported, cable_or_band_anchor/standing, floor/hands_supported, floor/supine, machine/seated_supported, none/standing, unknown/unknown, wall/standing.

## Production Boundary

Schema change status: `RECOMMENDED_NOT_IMPLEMENTED`.

Production behavior changed: `false`.

Contract fingerprint: `84e7f6305f0cbfb531f96760272d3fa759619f2455520a3f1d08213103ed8d18`.
