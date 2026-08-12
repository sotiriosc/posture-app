# Support And Stance Mechanics Contract

Fixed review time: `2026-08-12T00:00:00.000Z`.

Classification: **SUPPORT_AND_STANCE_SCHEMA_IMPLEMENTED**.

The approved compositional contract is implemented in production schema, catalog mechanics, validation, transition traces, row-selection knowledge, and review reports. Candidate scoring, ranking, eligibility, phase coefficients, prescription, Session Composer, Week Composer, and ledgers are unchanged.

## Migrated Consumer Audit

| Path | Consumer | Current use | Migration need |
| --- | --- | --- | --- |
| packages/training-engine-v2/src/domain/exercise.ts | ExerciseSupportProfile schema | Defines normalized base position, stance, orientation, contact, amount, relationship, review status, and notes. | Completed: the coarse pair was removed and explicit unknown remains legal in every dimension. |
| packages/training-engine-v2/src/transitionComparison.ts | transition mechanics delta | Compares every normalized support/stance dimension and canonicalized contact sets. | Completed: support amount is ordinal only when known; modifiable and unknown values remain non-directional. |
| packages/training-engine-v2/src/candidate/rowSelectionKnowledge.ts | horizontal row support trace and lumbar differentiator | Emits the compositional profile and detects primary chest contact structurally. | Completed: chest support remains observable without exercise-name inference. |
| packages/training-engine-v2/tests/helpers/candidateIntelligenceReviewReport.ts | review/report rendering | Formats all normalized support dimensions and explicit contact tuples. | Completed: unknown values render as unknown and are never replaced with inferred labels. |

## Implemented Schema

Implemented shape: the smallest compositional support/stance profile built from base position, stance, orientation, support contacts, support amount, and support relationship. It preserves unknown and avoids one enum per exercise.

| Field | Recommendation | Decision / trace need |
| --- | --- | --- |
| basePosition | Represent the body organization independent of external support, for example standing, half_kneeling, tall_kneeling, prone, side_support, supine, seated, quadruped, hanging, unknown. | Prevents half-kneeling from being encoded as standing and lets prone/side-support plank rows differ truthfully. |
| stance | Represent stance details only when they change the task, for example bilateral, split, half_kneeling_lead_side, staggered, stacked_feet, bent_knee_side_support, alternating_march, unknown. | Keeps stance compositional instead of creating one enum value per exercise. |
| orientation | Represent trunk/body orientation separately, for example upright, prone, supine, lateral, diagonal, suspended, unknown. | Allows prone forearm plank and lateral forearm side plank to be distinct without abusing body-support labels. |
| supportContacts[] | Represent one or more contacts with body region, surface/source, mode, side, and task role: forearm-floor-primary, foot-floor-primary, knee-floor-variant, hand-wall-secondary, chest-bench-primary, seat-machine-primary. | Captures forearm support, lateral forearm/foot support, wall support, and machine/bench contacts without false `hands_supported` labels. |
| supportAmount | Represent support magnitude only when task-changing: none, light_touch, partial, substantial, prescription_modifiable, unknown. | Keeps wall-supported suitcase march anti-lateral exposure contextual until support force/control is reviewed. |
| supportRelationship | Represent side relationship when it changes mechanics: same_side_load, opposite_side_load, bilateral, side_neutral, alternating, unknown. | Captures suitcase-march load/support relationship without creating a new movement role. |

## Resolved Seven-Exercise Schema Requirements

| Exercise | Gap | Required contract |
| --- | --- | --- |
| forearm-plank | Existing `bodySupport` cannot say prone forearm-and-foot support. `hands_supported` would be false. | basePosition=prone, orientation=prone, supportContacts include bilateral forearms and feet, supportAmount captures knee-supported variant when prescribed. |
| forearm-side-plank | Existing `bodySupport` cannot say lateral forearm/foot or bent-knee side support. | basePosition=side_support, orientation=lateral, supportContacts include side forearm plus foot/knee contacts, side and lever remain prescription-visible. |
| half-kneeling-high-to-low-cable-chop | Existing `bodySupport` cannot say half-kneeling. Encoding it as standing would lie. | basePosition=half_kneeling, stance captures lead side, orientation/upright rotation path remains separate from cable anchor support. |
| wall-supported-suitcase-march | Existing support fields cannot encode wall-support magnitude or opposite-side support/load relationship. | basePosition=standing, stance=alternating_march, supportContacts include hand-wall secondary contact, supportAmount=prescription_modifiable, supportRelationship=opposite_side_load. |

## Existing Metadata Truth Audit

Lie status: `NO_CURRENT_PRODUCTION_SUPPORT_STANCE_LIE_DISCOVERED`.

Current production lie findings: none.

The pre-migration production catalog did not encode half-kneeling as standing, forearm support as hands-supported, or known task-changing support amounts as false hard categories. Migration separates resistance anchors from support contacts and retains unknown where the old evidence was insufficient.

Observed normalized support profiles: half_kneeling/half_kneeling_lead_side/upright/none/side_neutral; contacts=foot:floor:weight_bearing:unknown:primary,knee:floor:weight_bearing:unknown:primary, prone/bilateral/prone/prescription_modifiable/bilateral; contacts=foot:floor:weight_bearing:bilateral:primary,forearm:floor:weight_bearing:bilateral:primary, prone/bilateral/prone/substantial/bilateral; contacts=chest:bench:weight_bearing:side_neutral:primary,foot:floor:weight_bearing:bilateral:secondary, prone/bilateral/prone/substantial/bilateral; contacts=foot:floor:weight_bearing:bilateral:primary,hand:floor:weight_bearing:bilateral:primary, seated/bilateral/diagonal/substantial/bilateral; contacts=back:machine:positioning:side_neutral:secondary,seat:machine:weight_bearing:side_neutral:primary, seated/bilateral/upright/substantial/bilateral; contacts=back:machine:positioning:side_neutral:secondary,seat:machine:weight_bearing:side_neutral:primary, seated/bilateral/upright/substantial/bilateral; contacts=foot:floor:weight_bearing:bilateral:secondary,seat:bench:weight_bearing:side_neutral:primary, seated/bilateral/upright/substantial/bilateral; contacts=seat:machine:weight_bearing:side_neutral:primary, side_support/stacked_feet/lateral/prescription_modifiable/side_neutral; contacts=foot:floor:weight_bearing:unknown:primary,forearm:floor:weight_bearing:unknown:primary, standing/alternating_march/upright/prescription_modifiable/opposite_side_load; contacts=foot:floor:weight_bearing:alternating:primary,hand:wall:balance_assist:unknown:secondary, standing/bilateral/upright/none/bilateral; contacts=foot:floor:weight_bearing:bilateral:primary, standing/bilateral/upright/partial/bilateral; contacts=foot:floor:weight_bearing:bilateral:primary,hand:wall:positioning:bilateral:secondary, standing/bilateral/upright/prescription_modifiable/bilateral; contacts=foot:floor:weight_bearing:bilateral:primary,pelvis:box:positioning:side_neutral:secondary, standing/split/upright/prescription_modifiable/side_neutral; contacts=foot:box:weight_bearing:unknown:primary,foot:floor:weight_bearing:unknown:secondary, standing/split/upright/prescription_modifiable/side_neutral; contacts=foot:floor:weight_bearing:bilateral:primary, standing/unknown/diagonal/partial/unknown; contacts=foot:floor:weight_bearing:bilateral:primary,hand:bench:weight_bearing:unknown:secondary, standing/unknown/upright/none/bilateral; contacts=foot:floor:weight_bearing:alternating:primary, standing/unknown/upright/none/unknown; contacts=foot:floor:weight_bearing:alternating:primary, supine/bilateral/supine/substantial/bilateral; contacts=back:bench:weight_bearing:side_neutral:primary,foot:floor:weight_bearing:bilateral:secondary, supine/unknown/supine/substantial/side_neutral; contacts=back:floor:weight_bearing:side_neutral:primary, unknown/unknown/unknown/unknown/unknown; contacts=none.

## Production Boundary

Schema change status: `IMPLEMENTED`.

Candidate selection behavior changed: `false`.

Structural trace contract changed: `true`.

Contract fingerprint: `6542bc249181f0e1a010323763a7e51505dee7ee87229c4c43b65e0d2cc2963f`.
