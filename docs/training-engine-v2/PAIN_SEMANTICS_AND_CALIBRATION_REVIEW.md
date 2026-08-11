# Pain Semantics And Calibration Review

Audit baseline: `1449d46e122cadd8a445e07365c242983afa64eb` on `engine-v2/candidate-intelligence`.

Scope: deterministic audit and documentation only. No pain coefficient, joint coefficient, hard gate, warning, exercise metadata, phase value, component weight, or ranking behavior is changed here. Training Engine V2 consumes normalized training inputs and does not diagnose injury or disease.

## Audit Result

The pain architecture has recognizable owners, hard contraindications remain upstream of scoring, moderate/current pain is visible, and behavior is deterministic. Calibration is not yet the next safe step: the candidate layer does not consume severity or `requiredResponse`, stress-tag receivers use inconsistent universes, `joint_cost` demonstrably counts many duplicated joint/caution tags twice, and `stability_fit` gives a global low-stability bonus for unrelated pain with no shared stress fact.

Final state: **PAIN_CONTRACT_FIXES_REQUIRED_BEFORE_CALIBRATION**

Existing controlled-scenario ranking fingerprint: `f5a39f62f2ef24026a7e3e490fe822204f6f7224870f5f1557d8f36556bf748d` (unchanged from audit baseline).

## Authority And Method

Reviewed authority: `ENGINE_V2_BLUEPRINT.md`, `DOMAIN.md`, `SCORING.md`, and `FINAL_CANDIDATE_INTELLIGENCE_REVIEW.md`. Reviewed runtime paths: the pain domain, contraindication and pain-review eligibility, pain suitability, joint cost, stability fit, athlete capability, developmental relationship, row diagnostics, and every pain-related controlled test/scenario.

All requests use fixed `evaluationContext.asOf=2026-08-10T00:00:00.000Z`. The controlled matrix contains 144 candidate/state rows. Rejected candidates show score fields as `-` because hard eligibility removes them before candidate scoring; unchanged legal values remain printed.

## Field Consumption Inventory

| Input Field | Primary Owner / Giver | Current Output | Downstream Receiver | Current Behavioral Effect | Trace Visibility | Status |
| --- | --- | --- | --- | --- | --- | --- |
| HistoricalInjury.kind | normalized athlete/history adapter | none | none | collection membership supplies the category; the field itself is not read | input only | UNUSED |
| HistoricalInjury.id | normalized athlete/history adapter | none | none | none | absent | UNUSED |
| HistoricalInjury.status | normalized athlete/history adapter | none | none | resolved, managed, and recurring are identical | absent | UNUSED |
| HistoricalInjury.region | normalized athlete/history adapter | none | none | none | absent | UNUSED |
| HistoricalInjury.side | normalized athlete/history adapter | none | none | left, right, bilateral, and absent are identical | absent | UNUSED |
| HistoricalInjury.relevantStressTags | normalized athlete/history adapter | none | none | does not enter eligibility, warning, pain suitability, joint cost, stability, or assessment context | absent | UNUSED |
| HistoricalInjury.description | normalized athlete/history adapter | none | none | none | absent | UNUSED |
| HistoricalSensitivity.kind | athlete/coach adapter | none | none | collection membership supplies the category | input only | UNUSED |
| HistoricalSensitivity.id | athlete/coach adapter | score reason and assessment demand-reduction evidence | pain_suitability, demandReductionContext, row diagnostics | identifies matched evidence but does not change magnitude | partial | PARTIALLY USED |
| HistoricalSensitivity.region | athlete/coach adapter | assessment demand-reduction match | developmentalRelationship | can scope a non-monitor modification to an assessment/candidate context | assessment trace only | PARTIALLY USED |
| HistoricalSensitivity.stressTags | athlete/coach adapter | pain_suitability, joint_cost, assessment context, row diagnostic | candidate scoring and assessment trace | 0.4 per pain overlap; 0.35 per joint/caution occurrence; may justify demand reduction | score reason/count and assessment IDs; matched tags/sources are not native trace fields | FULLY USED |
| HistoricalSensitivity.preferredModification | athlete/coach adapter | binary demand-reduction relevance | developmentalRelationship | monitor is ignored; increase_support, reduce_range, and reduce_load are treated identically | non-monitor value appears in assessment evidence | PARTIALLY USED |
| HistoricalSensitivity.description | athlete/coach adapter | none | none | none | absent | UNUSED |
| CurrentDiscomfort.kind | athlete/assessment adapter | none | none | collection membership supplies the category | input only | UNUSED |
| CurrentDiscomfort.id | athlete/assessment adapter | interpreted pain ID, score reason, assessment evidence | request trace, pain_suitability, demandReductionContext, row diagnostics | identifies evidence but does not change magnitude | partial | PARTIALLY USED |
| CurrentDiscomfort.severity0To10 | athlete/assessment adapter | none | none | severity 1 and 2 are identical | absent | UNUSED |
| CurrentDiscomfort.region | athlete/assessment adapter | capability adjustment and scoped demand-reduction context | athleteCapability, developmentalRelationship, row diagnostics | matching assessment-signal region applies -0.15 capability; may establish context even without tag overlap | indirect capability evidence/context | PARTIALLY USED |
| CurrentDiscomfort.stressTags | athlete/assessment adapter | pain_suitability, joint_cost, assessment context, row diagnostic | candidate scoring and assessment trace | 0.9 per pain overlap; 0.8 per joint/caution occurrence; may justify demand reduction | score reason/count and assessment IDs; matched tags/sources are not native trace fields | FULLY USED |
| CurrentDiscomfort.effect | athlete/assessment adapter | binary demand-reduction relevance | developmentalRelationship | monitor is ignored; prefer_support, reduce_range, and reduce_load are treated identically; no direct prescription exists | matched ID only; exact effect is absent | PARTIALLY USED |
| CurrentDiscomfort.description | athlete/assessment adapter | none | none | none | absent | UNUSED |
| ModeratePain.kind | athlete/assessment adapter | none | none | collection membership supplies the category | input only | UNUSED |
| ModeratePain.id | athlete/assessment adapter | interpreted pain ID, warning evidence, score reason, assessment evidence | request trace, pain warning, pain_suitability, demandReductionContext, row diagnostics | identifies evidence but does not change magnitude | partial | PARTIALLY USED |
| ModeratePain.severity0To10 | athlete/assessment adapter | none | none | severity 3, 4, 5, and 6 are identical | absent | UNUSED |
| ModeratePain.region | athlete/assessment adapter | capability adjustment and scoped demand-reduction context | athleteCapability, developmentalRelationship | matching assessment-signal region applies -0.35 capability; can establish assessment context | indirect capability evidence/context | PARTIALLY USED |
| ModeratePain.stressTags | athlete/assessment adapter | warning, pain_suitability, joint_cost, assessment context, row diagnostic | eligibility warning, candidate scoring, assessment trace | warning on caution overlap; 1.8 per pain overlap; 1.4 per joint/caution occurrence | warning evidence, score reason/count, assessment ID; native matched tag/source trace is absent | FULLY USED |
| ModeratePain.requiredResponse | athlete/assessment adapter | none | none implemented | avoid_aggravator, reduce_load_and_range, and substitute_role are identical | absent | UNUSED |
| ModeratePain.description | athlete/assessment adapter | warning message | painReviewEligibility | changes warning prose only | warning message | FULLY USED |
| AcuteSeverePain.kind | athlete/assessment adapter | none | none | collection membership supplies the category | input only | UNUSED |
| AcuteSeverePain.id | athlete/assessment adapter | interpreted pain ID and rejection evidence | request trace and contraindicationEligibility | identifies rejection evidence | rejection evidence | FULLY USED |
| AcuteSeverePain.severity0To10 | athlete/assessment adapter | none | none | severity 7 through 10 are identical | absent | UNUSED |
| AcuteSeverePain.region | athlete/assessment adapter | none | none | none | absent | UNUSED |
| AcuteSeverePain.stressTags | athlete/assessment adapter | hard rejection | contraindicationEligibility | rejects only on loading.jointStressTags overlap; caution and contraindicated-only tags are ignored | signal ID only, not matched tag/source | PARTIALLY USED |
| AcuteSeverePain.invalidatesTrainingRoles | athlete/assessment adapter | hard rejection | contraindicationEligibility | rejects every candidate evaluated for a listed requested role | signal ID only, not matched role | FULLY USED |
| AcuteSeverePain.urgentReviewRecommended | athlete/assessment adapter | none | none | true and false are identical | absent | UNUSED |
| AcuteSeverePain.description | athlete/assessment adapter | hard-rejection message | contraindicationEligibility | changes rejection prose only | rejection message | FULLY USED |
| HardContraindication.kind | athlete/clinician/coach/safety adapter | none | none | collection membership supplies the category | input only | UNUSED |
| HardContraindication.id | athlete/clinician/coach/safety adapter | interpreted pain ID and rejection evidence | request trace and contraindicationEligibility | identifies rejection evidence | rejection evidence | FULLY USED |
| HardContraindication.region | athlete/clinician/coach/safety adapter | none | none | none | absent | UNUSED |
| HardContraindication.exerciseIds | athlete/clinician/coach/safety adapter | hard rejection | contraindicationEligibility | exact exercise ID match rejects | signal ID, not matched exercise criterion | FULLY USED |
| HardContraindication.stressTags | athlete/clinician/coach/safety adapter | hard rejection | contraindicationEligibility | loading.jointStressTags or contraindicatedStressTags overlap rejects; caution-only overlap does not | signal ID, not matched tag/source | PARTIALLY USED |
| HardContraindication.reason | athlete/clinician/coach/safety adapter | hard-rejection message | contraindicationEligibility | changes rejection prose only | rejection message | FULLY USED |
| HardContraindication.source | athlete/clinician/coach/safety adapter | none; output source is hard-coded pain_injury | none | athlete_report, clinician, coach, and safety_rule are identical | absent | UNUSED |
| PersonalExerciseBlock.kind | athlete/coach | none | none | collection membership supplies the category | input only | UNUSED |
| PersonalExerciseBlock.id | athlete/coach | rejection evidence | personalBlockEligibility | identifies block evidence | rejection evidence | FULLY USED |
| PersonalExerciseBlock.exerciseIds | athlete/coach | hard preference rejection | personalBlockEligibility | exact exercise ID match rejects | block ID, not matched criterion | FULLY USED |
| PersonalExerciseBlock.exerciseFamilies | athlete/coach | hard preference rejection | personalBlockEligibility | exercise-family match rejects | block ID, not matched criterion | FULLY USED |
| PersonalExerciseBlock.reason | athlete/coach | rejection message | personalBlockEligibility | changes rejection prose only | rejection message | FULLY USED |
| PersonalExerciseBlock.createdBy | athlete/coach | none; output source is athlete_preference | none | athlete and coach are identical | absent | UNUSED |

Key field conclusions:

- Every `HistoricalInjury` field is currently dead input for Candidate Intelligence.
- Current and moderate severity values are valid domain distinctions but have no candidate behavior or native trace output.
- `ModeratePain.requiredResponse`, `AcuteSeverePain.urgentReviewRecommended`, and `HardContraindication.source` are not consumed or deferred through an explicit requirement trace.
- Region is partially consumed by assessment capability/context logic; side is not consumed.
- Current effect and historical preferred modification are binary assessment-context switches: `monitor` is excluded and all actionable values are otherwise equivalent at this layer.

## Current Decision Pipeline

```text
pain/injury input
  -> hard contraindication + acute/severe eligibility
  -> moderate-pain review warning
  -> legal candidate pool
  -> pain_suitability
  -> joint_cost
  -> stability_fit
  -> assessment capability + demand-reduction context (when assessment exists)
  -> weighted candidate total + DecisionTrace
```

| Stage | Reads | Ignores | Can Reject | Can Warn | Can Score | Deferred Responsibility |
| --- | --- | --- | --- | --- | --- | --- |
| pain/injury input | typed PainAndInjuryState collections | no validation or canonical matched-stress trace is produced here | no | no | no | upstream owns observation/normalization and diagnosis; V2 does not diagnose |
| hard contraindication eligibility | hard exerciseIds; hard stressTags against joint+contraindicated; acute invalidated roles; acute stressTags against joint | hard region/source; caution-only hard overlap; acute severity/region/urgent flag/contraindicated-only tags | yes | no | no | none when explicit hard truth matches |
| acute/severe eligibility | implemented inside contraindicationEligibility using requested role or jointStressTags overlap | severity value, region, urgentReviewRecommended, cautionStressTags, contraindicatedStressTags | yes | no | no | urgent review is not emitted separately |
| moderate-pain warning | moderate stressTags against cautionStressTags; id and description | severity, region, requiredResponse, joint-only tags, contraindicated-only tags | no | yes | no | warning text says prescription review, but no executable requirement is emitted |
| pain_suitability | current, moderate, and historical-sensitivity stressTags against a deduped joint+caution+contraindicated union | severity, region, effect, requiredResponse, preferredModification, historical injury, acute pain | no | reason code only | yes | relative suitability only |
| joint_cost | current, moderate, and historical-sensitivity stressTags against joint and caution lists separately; axial loading; joint accumulation | contraindicatedStressTags, severity, region, effect/response/modification, historical injury, acute pain | no | reason code only | yes | session-level accumulation remains future composition work |
| stability_fit | whether any current or moderate record exists plus exercise stability demand and phase target | pain kind detail, region, tags, severity, effect, requiredResponse, actual support metadata | no | no | yes | support selection/prescription is not implemented |
| assessment demand/capability | current/moderate region for capability; non-monitor current effect; all moderate signals; non-monitor historical modification; union stress/context | pain severity and requiredResponse; historical injury; side | no | no | indirectly through assessment/alignment when a relevant assessment signal exists | does not execute load/range/support or role substitution |
| candidate aggregate / trace | legal candidates and emitted component values | unconsumed pain fields and rejected-candidate score values | already decided upstream | eligibility warnings retained | weighted mean | prescription, composition, and progression receivers are not implemented here |

## Current Formulas

The component helper clamps each computed value to `[0, 10]`; `rawValue` is the post-clamp component value.

```text
pain_suitability = 8.2
  - discomfortOverlap * 0.9
  - moderateOverlap * 1.8
  - sensitivityOverlap * 0.4

joint_cost = 8.8
  - activeOverlap * 0.8
  - moderateOverlap * 1.4
  - historicalOverlap * 0.35
  - axialCost * 0.35
  - jointAccumulation

axialCost = demandValue(axialLoading) - 1
jointAccumulation = 0.7 when joint_stress_accumulated is present, else 0
```

The emitted 18-component candidate score has total weight `16.2`. `pain_suitability` has configured weight `1.2`, normalized weight `0.074074`; `joint_cost` has configured weight `0.8`, normalized weight `0.049383`; `stability_fit` has configured weight `0.7`, normalized weight `0.043210`. Each weighted contribution is raw component value multiplied by the exact unrounded configured-weight share, then rounded to six decimals. The aggregate is the weighted mean and is rounded to three decimals for `total`.

`pain_suitability` emits `PAIN_SUITABLE` with no current/moderate/sensitivity overlap and `PAIN_REQUIRES_REVIEW` otherwise. `joint_cost` emits `PAIN_REQUIRES_REVIEW` only for current or moderate overlap; historical overlap alone retains `JOINT_COST_ACCEPTABLE`. Moderate warning eligibility emits `PAIN_REQUIRES_REVIEW` on caution overlap. Hard contraindication and acute/severe matches emit `HARD_CONTRAINDICATION` and prevent all scoring.

## Moderate Severity Contrast

Severity 3, 4, 5, and 6 produce identical warning state, pain suitability, joint cost, stability fit, assessment/alignment values, totals, and ranks for otherwise identical low-back hinge requests. The severity number is not present in component or warning traces.

| Variant | Candidate | Warning | Pain | Joint | Stability | Assessment | Alignment | Capability | Relationship / Reduction | Total / Rank |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 3 | dumbbell-romanian-deadlift | PAIN_REQUIRES_REVIEW | 4.600 | 2.850 | 8.500 | 5.881 | 5.920 | 1.350 | exceeds_current_capability / relevant | 7.418 / 2 |
| 3 | cable-pull-through | PAIN_REQUIRES_REVIEW | 6.400 | 6.000 | 8.500 | 6.127 | 6.084 | 1.350 | develops_priority / relevant | 7.551 / 1 |
| 4 | dumbbell-romanian-deadlift | PAIN_REQUIRES_REVIEW | 4.600 | 2.850 | 8.500 | 5.881 | 5.920 | 1.350 | exceeds_current_capability / relevant | 7.418 / 2 |
| 4 | cable-pull-through | PAIN_REQUIRES_REVIEW | 6.400 | 6.000 | 8.500 | 6.127 | 6.084 | 1.350 | develops_priority / relevant | 7.551 / 1 |
| 5 | dumbbell-romanian-deadlift | PAIN_REQUIRES_REVIEW | 4.600 | 2.850 | 8.500 | 5.881 | 5.920 | 1.350 | exceeds_current_capability / relevant | 7.418 / 2 |
| 5 | cable-pull-through | PAIN_REQUIRES_REVIEW | 6.400 | 6.000 | 8.500 | 6.127 | 6.084 | 1.350 | develops_priority / relevant | 7.551 / 1 |
| 6 | dumbbell-romanian-deadlift | PAIN_REQUIRES_REVIEW | 4.600 | 2.850 | 8.500 | 5.881 | 5.920 | 1.350 | exceeds_current_capability / relevant | 7.418 / 2 |
| 6 | cable-pull-through | PAIN_REQUIRES_REVIEW | 6.400 | 6.000 | 8.500 | 6.127 | 6.084 | 1.350 | develops_priority / relevant | 7.551 / 1 |

## Required Response Contrast

`avoid_aggravator`, `reduce_load_and_range`, and `substitute_role` produce identical candidate behavior and traces. Candidate Intelligence neither executes nor emits an unresolved structured response requirement.

| Variant | Candidate | Warning | Pain | Joint | Stability | Assessment | Alignment | Capability | Relationship / Reduction | Total / Rank |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| avoid_aggravator | dumbbell-romanian-deadlift | PAIN_REQUIRES_REVIEW | 4.600 | 2.850 | 8.500 | 5.881 | 5.920 | 1.350 | exceeds_current_capability / relevant | 7.418 / 2 |
| avoid_aggravator | cable-pull-through | PAIN_REQUIRES_REVIEW | 6.400 | 6.000 | 8.500 | 6.127 | 6.084 | 1.350 | develops_priority / relevant | 7.551 / 1 |
| reduce_load_and_range | dumbbell-romanian-deadlift | PAIN_REQUIRES_REVIEW | 4.600 | 2.850 | 8.500 | 5.881 | 5.920 | 1.350 | exceeds_current_capability / relevant | 7.418 / 2 |
| reduce_load_and_range | cable-pull-through | PAIN_REQUIRES_REVIEW | 6.400 | 6.000 | 8.500 | 6.127 | 6.084 | 1.350 | develops_priority / relevant | 7.551 / 1 |
| substitute_role | dumbbell-romanian-deadlift | PAIN_REQUIRES_REVIEW | 4.600 | 2.850 | 8.500 | 5.881 | 5.920 | 1.350 | exceeds_current_capability / relevant | 7.418 / 2 |
| substitute_role | cable-pull-through | PAIN_REQUIRES_REVIEW | 6.400 | 6.000 | 8.500 | 6.127 | 6.084 | 1.350 | develops_priority / relevant | 7.551 / 1 |

## Current Discomfort Effect Contrast

Pain suitability, joint cost, stability fit, and capability ignore the effect value. In assessment developmental context, `monitor` is excluded; `prefer_support`, `reduce_range`, and `reduce_load` all set the same demand-reduction relevance and can change assessment/alignment contributions when the candidate is below capability. Those three actions are not distinguished or executed.

| Variant | Candidate | Warning | Pain | Joint | Stability | Assessment | Alignment | Capability | Relationship / Reduction | Total / Rank |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| monitor | goblet-squat | none | 7.300 | 7.200 | 8.500 | 5.874 | 5.916 | 2.550 | under_challenges_development / not_relevant | 7.559 / 1 |
| prefer_support | goblet-squat | none | 7.300 | 7.200 | 8.500 | 6.162 | 6.108 | 2.550 | reduces_excess_demand / relevant | 7.586 / 1 |
| reduce_range | goblet-squat | none | 7.300 | 7.200 | 8.500 | 6.162 | 6.108 | 2.550 | reduces_excess_demand / relevant | 7.586 / 1 |
| reduce_load | goblet-squat | none | 7.300 | 7.200 | 8.500 | 6.162 | 6.108 | 2.550 | reduces_excess_demand / relevant | 7.586 / 1 |

## Historical Modification Contrast

Pain suitability and joint cost ignore the preferred-modification value. In assessment developmental context, `monitor` is excluded; `increase_support`, `reduce_range`, and `reduce_load` are behaviorally equivalent, although their exact value appears in assessment evidence text.

| Variant | Candidate | Warning | Pain | Joint | Stability | Assessment | Alignment | Capability | Relationship / Reduction | Total / Rank |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| monitor | goblet-squat | none | 7.800 | 8.100 | 8.500 | 5.874 | 5.916 | 2.700 | under_challenges_development / not_relevant | 7.641 / 1 |
| increase_support | goblet-squat | none | 7.800 | 8.100 | 8.500 | 6.162 | 6.108 | 2.700 | reduces_excess_demand / relevant | 7.667 / 1 |
| reduce_range | goblet-squat | none | 7.800 | 8.100 | 8.500 | 6.162 | 6.108 | 2.700 | reduces_excess_demand / relevant | 7.667 / 1 |
| reduce_load | goblet-squat | none | 7.800 | 8.100 | 8.500 | 6.162 | 6.108 | 2.700 | reduces_excess_demand / relevant | 7.667 / 1 |

## Region And Side Contrast

With identical stress tags, pain suitability, joint cost, warning behavior, stability fit, totals, and ranks do not change by region. Region can still change the generic assessment capability trace (`-0.35` moderate or `-0.15` current when the pain region equals the assessment-signal region), and can establish demand-reduction context when no stress overlap exists. `HistoricalInjury.side` has no receiver and produces no trace or score difference.

| Contrast | Variant | Candidate | Pain | Joint | Stability | Capability | Relationship | Total / Rank |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| same stress tags, different region | lumbar_spine | cable-pull-through | 6.400 | 6.000 | 8.500 | 1.350 | develops_priority | 7.551 / 1 |
| same stress tags, different region | shoulder | cable-pull-through | 6.400 | 6.000 | 8.500 | 1.700 | develops_priority | 7.551 / 1 |
| same historical injury, different side | left | cable-pull-through | 8.200 | 8.800 | 8.500 | 1.700 | develops_priority | 7.823 / 1 |
| same historical injury, different side | right | cable-pull-through | 8.200 | 8.800 | 8.500 | 1.700 | develops_priority | 7.823 / 1 |

## Stress-Tag Source And Counting Audit

| Receiver | loading.jointStressTags | cautionStressTags | contraindicatedStressTags | Deduplication |
| --- | --- | --- | --- | --- |
| painReviewEligibility | ignored | read | ignored | boolean some() per moderate signal |
| pain_suitability | read | read | read | exercise union is Set-deduped; duplicate/multiple input pain tags can still stack |
| joint_cost | read | read | ignored | none across sources; the same tag in joint+caution counts twice |
| hard contraindication | read | ignored | read | boolean match |
| acute/severe eligibility | read | ignored | ignored | boolean match |
| assessment demand-reduction context | read | read | read | exercise union is Set-deduped |

`pain_suitability` counts one matched tag once when the same exercise tag appears in multiple metadata sources because it constructs a `Set`. It does not deduplicate duplicate tags supplied inside pain arrays or the same tag supplied by multiple pain signals. `joint_cost` adds joint-list and caution-list matches, so a tag present in both is charged twice. That is observed arithmetic, not merely a possible future risk.

Across the required representative exercises, 16 exercise/tag rows are classified `ACTUAL_DOUBLE_COUNT`. No current code or domain contract labels the duplicate source occurrences as distinct units of joint cost.

| Exercise | Tag | Metadata Sources | Unique Facts | Pain Count | Joint Count | Moderate Warning | Hard Contra | Acute/Severe | Classification |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| push-up | horizontal_pressing | loading.jointStressTags + cautionStressTags | 1 | 1 | 2 | warning | reject | reject | ACTUAL_DOUBLE_COUNT |
| push-up | wrist_extension_loading | loading.jointStressTags + cautionStressTags | 1 | 1 | 2 | warning | reject | reject | ACTUAL_DOUBLE_COUNT |
| push-up | long_lever_core | loading.jointStressTags | 1 | 1 | 1 | none | reject | reject | NOT_APPLICABLE |
| dumbbell-bench-press | horizontal_pressing | loading.jointStressTags + cautionStressTags | 1 | 1 | 2 | warning | reject | reject | ACTUAL_DOUBLE_COUNT |
| machine-chest-press | horizontal_pressing | loading.jointStressTags + cautionStressTags | 1 | 1 | 2 | warning | reject | reject | ACTUAL_DOUBLE_COUNT |
| dumbbell-romanian-deadlift | loaded_hinge | loading.jointStressTags + cautionStressTags | 1 | 1 | 2 | warning | reject | reject | ACTUAL_DOUBLE_COUNT |
| dumbbell-romanian-deadlift | loaded_spinal_flexion | loading.jointStressTags + cautionStressTags + contraindicatedStressTags | 1 | 1 | 2 | warning | reject | reject | ACTUAL_DOUBLE_COUNT |
| dumbbell-romanian-deadlift | grip_intensive | loading.jointStressTags | 1 | 1 | 1 | none | reject | reject | NOT_APPLICABLE |
| cable-pull-through | loaded_hinge | loading.jointStressTags + cautionStressTags | 1 | 1 | 2 | warning | reject | reject | ACTUAL_DOUBLE_COUNT |
| one-arm-dumbbell-row | loaded_hinge | loading.jointStressTags + cautionStressTags | 1 | 1 | 2 | warning | reject | reject | ACTUAL_DOUBLE_COUNT |
| one-arm-dumbbell-row | loaded_spinal_flexion | loading.jointStressTags + cautionStressTags | 1 | 1 | 2 | warning | reject | reject | ACTUAL_DOUBLE_COUNT |
| one-arm-dumbbell-row | grip_intensive | loading.jointStressTags + cautionStressTags | 1 | 1 | 2 | warning | reject | reject | ACTUAL_DOUBLE_COUNT |
| goblet-squat | deep_knee_flexion | loading.jointStressTags + cautionStressTags | 1 | 1 | 2 | warning | reject | reject | ACTUAL_DOUBLE_COUNT |
| goblet-squat | loaded_knee_flexion | loading.jointStressTags + cautionStressTags | 1 | 1 | 2 | warning | reject | reject | ACTUAL_DOUBLE_COUNT |
| leg-press | deep_knee_flexion | loading.jointStressTags | 1 | 1 | 1 | none | reject | reject | NOT_APPLICABLE |
| leg-press | loaded_knee_flexion | loading.jointStressTags + cautionStressTags | 1 | 1 | 2 | warning | reject | reject | ACTUAL_DOUBLE_COUNT |
| split-squat | deep_knee_flexion | loading.jointStressTags + cautionStressTags | 1 | 1 | 2 | warning | reject | reject | ACTUAL_DOUBLE_COUNT |
| split-squat | loaded_knee_flexion | loading.jointStressTags + cautionStressTags | 1 | 1 | 2 | warning | reject | reject | ACTUAL_DOUBLE_COUNT |
| step-up | loaded_knee_flexion | loading.jointStressTags + cautionStressTags | 1 | 1 | 2 | warning | reject | reject | ACTUAL_DOUBLE_COUNT |

### Contraindicated-Only Probe

A synthetic exercise with `high_impact` only in `contraindicatedStressTags` proves the source roles: current discomfort gives pain suitability 7.300; joint cost remains 8.800; moderate warning is absent; an explicit hard contraindication rejects; acute/severe stress overlap does not reject. Thus contraindicated tags affect soft pain suitability and explicit hard-contraindication matching, but are neither an automatic hard gate nor part of acute/severe matching or joint cost.

Warning and scoring do not share one stress universe. A moderate signal can change pain suitability on a joint-only or contraindicated-only tag without a warning; a caution-only tag can warn and affect pain suitability/joint cost but cannot trigger explicit hard-contraindication or acute matching. The native trace reports signal IDs and aggregate counts, not the matched tag and metadata source needed to explain this discrepancy.

## Controlled Pain Matrix

Counts are `U/P/J`: unique matched stress facts, overlap currently counted by pain suitability, and overlap currently counted by joint cost. Weighted values use the fixed 18-component denominator. Acute/severe signals use stress overlap with an empty `invalidatesTrainingRoles` list so the table isolates stress-universe behavior. Hard contraindications use stress tags rather than exercise IDs.

### Shoulder Horizontal Push

| State | Candidate | Outcome | Hard Rejection | Warning | Signal | Region / Tags | Matched Stress / Metadata Sources | Counts U/P/J | Pain Raw / Weighted | Joint Raw / Weighted | Stability | Assessment / Demand Reduction | Total / Rank |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| no pain | push-up | legal | - | - | -; none; severity=-; effect/response=- | -; - | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 7.200 | not_present | 7.793 / 2 |
| no pain | dumbbell-bench-press | legal | - | - | -; none; severity=-; effect/response=- | -; - | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 7.200 | not_present | 7.643 / 3 |
| no pain | machine-chest-press | legal | - | - | -; none; severity=-; effect/response=- | -; - | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 8.500 | not_present | 7.815 / 1 |
| discomfort severity 1 | push-up | legal | - | - | shoulder-horizontal-push-pain-discomfort-1; current_discomfort; severity=1; effect/response=prefer_support | shoulder; horizontal_pressing | horizontal_pressing; horizontal_pressing:loading.jointStressTags+cautionStressTags | 1/1/2 | 7.300 / 0.540741 | 7.200 / 0.355556 | 7.200 | not_present | 7.647 / 2 |
| discomfort severity 1 | dumbbell-bench-press | legal | - | - | shoulder-horizontal-push-pain-discomfort-1; current_discomfort; severity=1; effect/response=prefer_support | shoulder; horizontal_pressing | horizontal_pressing; horizontal_pressing:loading.jointStressTags+cautionStressTags | 1/1/2 | 7.300 / 0.540741 | 7.200 / 0.355556 | 7.200 | not_present | 7.497 / 3 |
| discomfort severity 1 | machine-chest-press | legal | - | - | shoulder-horizontal-push-pain-discomfort-1; current_discomfort; severity=1; effect/response=prefer_support | shoulder; horizontal_pressing | horizontal_pressing; horizontal_pressing:loading.jointStressTags+cautionStressTags | 1/1/2 | 7.300 / 0.540741 | 7.200 / 0.355556 | 9.300 | not_present | 7.704 / 1 |
| discomfort severity 2 | push-up | legal | - | - | shoulder-horizontal-push-pain-discomfort-2; current_discomfort; severity=2; effect/response=prefer_support | shoulder; horizontal_pressing | horizontal_pressing; horizontal_pressing:loading.jointStressTags+cautionStressTags | 1/1/2 | 7.300 / 0.540741 | 7.200 / 0.355556 | 7.200 | not_present | 7.647 / 2 |
| discomfort severity 2 | dumbbell-bench-press | legal | - | - | shoulder-horizontal-push-pain-discomfort-2; current_discomfort; severity=2; effect/response=prefer_support | shoulder; horizontal_pressing | horizontal_pressing; horizontal_pressing:loading.jointStressTags+cautionStressTags | 1/1/2 | 7.300 / 0.540741 | 7.200 / 0.355556 | 7.200 | not_present | 7.497 / 3 |
| discomfort severity 2 | machine-chest-press | legal | - | - | shoulder-horizontal-push-pain-discomfort-2; current_discomfort; severity=2; effect/response=prefer_support | shoulder; horizontal_pressing | horizontal_pressing; horizontal_pressing:loading.jointStressTags+cautionStressTags | 1/1/2 | 7.300 / 0.540741 | 7.200 / 0.355556 | 9.300 | not_present | 7.704 / 1 |
| moderate severity 3 | push-up | legal | - | PAIN_REQUIRES_REVIEW:shoulder-horizontal-push-pain-moderate-3 | shoulder-horizontal-push-pain-moderate-3; moderate_pain; severity=3; effect/response=avoid_aggravator | shoulder; horizontal_pressing | horizontal_pressing; horizontal_pressing:loading.jointStressTags+cautionStressTags | 1/1/2 | 6.400 / 0.474074 | 6.000 / 0.296296 | 7.200 | not_present | 7.521 / 2 |
| moderate severity 3 | dumbbell-bench-press | legal | - | PAIN_REQUIRES_REVIEW:shoulder-horizontal-push-pain-moderate-3 | shoulder-horizontal-push-pain-moderate-3; moderate_pain; severity=3; effect/response=avoid_aggravator | shoulder; horizontal_pressing | horizontal_pressing; horizontal_pressing:loading.jointStressTags+cautionStressTags | 1/1/2 | 6.400 / 0.474074 | 6.000 / 0.296296 | 7.200 | not_present | 7.371 / 3 |
| moderate severity 3 | machine-chest-press | legal | - | PAIN_REQUIRES_REVIEW:shoulder-horizontal-push-pain-moderate-3 | shoulder-horizontal-push-pain-moderate-3; moderate_pain; severity=3; effect/response=avoid_aggravator | shoulder; horizontal_pressing | horizontal_pressing; horizontal_pressing:loading.jointStressTags+cautionStressTags | 1/1/2 | 6.400 / 0.474074 | 6.000 / 0.296296 | 9.300 | not_present | 7.578 / 1 |
| moderate severity 4 | push-up | legal | - | PAIN_REQUIRES_REVIEW:shoulder-horizontal-push-pain-moderate-4 | shoulder-horizontal-push-pain-moderate-4; moderate_pain; severity=4; effect/response=avoid_aggravator | shoulder; horizontal_pressing | horizontal_pressing; horizontal_pressing:loading.jointStressTags+cautionStressTags | 1/1/2 | 6.400 / 0.474074 | 6.000 / 0.296296 | 7.200 | not_present | 7.521 / 2 |
| moderate severity 4 | dumbbell-bench-press | legal | - | PAIN_REQUIRES_REVIEW:shoulder-horizontal-push-pain-moderate-4 | shoulder-horizontal-push-pain-moderate-4; moderate_pain; severity=4; effect/response=avoid_aggravator | shoulder; horizontal_pressing | horizontal_pressing; horizontal_pressing:loading.jointStressTags+cautionStressTags | 1/1/2 | 6.400 / 0.474074 | 6.000 / 0.296296 | 7.200 | not_present | 7.371 / 3 |
| moderate severity 4 | machine-chest-press | legal | - | PAIN_REQUIRES_REVIEW:shoulder-horizontal-push-pain-moderate-4 | shoulder-horizontal-push-pain-moderate-4; moderate_pain; severity=4; effect/response=avoid_aggravator | shoulder; horizontal_pressing | horizontal_pressing; horizontal_pressing:loading.jointStressTags+cautionStressTags | 1/1/2 | 6.400 / 0.474074 | 6.000 / 0.296296 | 9.300 | not_present | 7.578 / 1 |
| moderate severity 5 | push-up | legal | - | PAIN_REQUIRES_REVIEW:shoulder-horizontal-push-pain-moderate-5 | shoulder-horizontal-push-pain-moderate-5; moderate_pain; severity=5; effect/response=avoid_aggravator | shoulder; horizontal_pressing | horizontal_pressing; horizontal_pressing:loading.jointStressTags+cautionStressTags | 1/1/2 | 6.400 / 0.474074 | 6.000 / 0.296296 | 7.200 | not_present | 7.521 / 2 |
| moderate severity 5 | dumbbell-bench-press | legal | - | PAIN_REQUIRES_REVIEW:shoulder-horizontal-push-pain-moderate-5 | shoulder-horizontal-push-pain-moderate-5; moderate_pain; severity=5; effect/response=avoid_aggravator | shoulder; horizontal_pressing | horizontal_pressing; horizontal_pressing:loading.jointStressTags+cautionStressTags | 1/1/2 | 6.400 / 0.474074 | 6.000 / 0.296296 | 7.200 | not_present | 7.371 / 3 |
| moderate severity 5 | machine-chest-press | legal | - | PAIN_REQUIRES_REVIEW:shoulder-horizontal-push-pain-moderate-5 | shoulder-horizontal-push-pain-moderate-5; moderate_pain; severity=5; effect/response=avoid_aggravator | shoulder; horizontal_pressing | horizontal_pressing; horizontal_pressing:loading.jointStressTags+cautionStressTags | 1/1/2 | 6.400 / 0.474074 | 6.000 / 0.296296 | 9.300 | not_present | 7.578 / 1 |
| moderate severity 6 | push-up | legal | - | PAIN_REQUIRES_REVIEW:shoulder-horizontal-push-pain-moderate-6 | shoulder-horizontal-push-pain-moderate-6; moderate_pain; severity=6; effect/response=avoid_aggravator | shoulder; horizontal_pressing | horizontal_pressing; horizontal_pressing:loading.jointStressTags+cautionStressTags | 1/1/2 | 6.400 / 0.474074 | 6.000 / 0.296296 | 7.200 | not_present | 7.521 / 2 |
| moderate severity 6 | dumbbell-bench-press | legal | - | PAIN_REQUIRES_REVIEW:shoulder-horizontal-push-pain-moderate-6 | shoulder-horizontal-push-pain-moderate-6; moderate_pain; severity=6; effect/response=avoid_aggravator | shoulder; horizontal_pressing | horizontal_pressing; horizontal_pressing:loading.jointStressTags+cautionStressTags | 1/1/2 | 6.400 / 0.474074 | 6.000 / 0.296296 | 7.200 | not_present | 7.371 / 3 |
| moderate severity 6 | machine-chest-press | legal | - | PAIN_REQUIRES_REVIEW:shoulder-horizontal-push-pain-moderate-6 | shoulder-horizontal-push-pain-moderate-6; moderate_pain; severity=6; effect/response=avoid_aggravator | shoulder; horizontal_pressing | horizontal_pressing; horizontal_pressing:loading.jointStressTags+cautionStressTags | 1/1/2 | 6.400 / 0.474074 | 6.000 / 0.296296 | 9.300 | not_present | 7.578 / 1 |
| acute/severe | push-up | rejected | HARD_CONTRAINDICATION:shoulder-horizontal-push-pain-acute-7 | - | shoulder-horizontal-push-pain-acute-7; acute_severe_pain; severity=7; effect/response=urgentReviewRecommended=true | shoulder; horizontal_pressing | horizontal_pressing; horizontal_pressing:loading.jointStressTags+cautionStressTags | 1/0/0 | - / - | - / - | - | not_scored | - / - |
| acute/severe | dumbbell-bench-press | rejected | HARD_CONTRAINDICATION:shoulder-horizontal-push-pain-acute-7 | - | shoulder-horizontal-push-pain-acute-7; acute_severe_pain; severity=7; effect/response=urgentReviewRecommended=true | shoulder; horizontal_pressing | horizontal_pressing; horizontal_pressing:loading.jointStressTags+cautionStressTags | 1/0/0 | - / - | - / - | - | not_scored | - / - |
| acute/severe | machine-chest-press | rejected | HARD_CONTRAINDICATION:shoulder-horizontal-push-pain-acute-7 | - | shoulder-horizontal-push-pain-acute-7; acute_severe_pain; severity=7; effect/response=urgentReviewRecommended=true | shoulder; horizontal_pressing | horizontal_pressing; horizontal_pressing:loading.jointStressTags+cautionStressTags | 1/0/0 | - / - | - / - | - | not_scored | - / - |
| hard contraindication | push-up | rejected | HARD_CONTRAINDICATION:shoulder-horizontal-push-pain-hard-contraindication | - | shoulder-horizontal-push-pain-hard-contraindication; hard_contraindication; severity=-; effect/response=source=safety_rule | shoulder; horizontal_pressing | horizontal_pressing; horizontal_pressing:loading.jointStressTags+cautionStressTags | 1/0/0 | - / - | - / - | - | not_scored | - / - |
| hard contraindication | dumbbell-bench-press | rejected | HARD_CONTRAINDICATION:shoulder-horizontal-push-pain-hard-contraindication | - | shoulder-horizontal-push-pain-hard-contraindication; hard_contraindication; severity=-; effect/response=source=safety_rule | shoulder; horizontal_pressing | horizontal_pressing; horizontal_pressing:loading.jointStressTags+cautionStressTags | 1/0/0 | - / - | - / - | - | not_scored | - / - |
| hard contraindication | machine-chest-press | rejected | HARD_CONTRAINDICATION:shoulder-horizontal-push-pain-hard-contraindication | - | shoulder-horizontal-push-pain-hard-contraindication; hard_contraindication; severity=-; effect/response=source=safety_rule | shoulder; horizontal_pressing | horizontal_pressing; horizontal_pressing:loading.jointStressTags+cautionStressTags | 1/0/0 | - / - | - / - | - | not_scored | - / - |

### Low-Back Hinge

| State | Candidate | Outcome | Hard Rejection | Warning | Signal | Region / Tags | Matched Stress / Metadata Sources | Counts U/P/J | Pain Raw / Weighted | Joint Raw / Weighted | Stability | Assessment / Demand Reduction | Total / Rank |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| no pain | dumbbell-romanian-deadlift | legal | - | - | -; none; severity=-; effect/response=- | -; - | -; - | 0/0/0 | 8.200 / 0.607407 | 8.450 / 0.417284 | 8.500 | low-back-hinge-control-priority:exceeds_current_capability; demandReduction=not_relevant | 7.961 / 1 |
| no pain | cable-pull-through | legal | - | - | -; none; severity=-; effect/response=- | -; - | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 8.500 | low-back-hinge-control-priority:develops_priority; demandReduction=not_relevant | 7.823 / 2 |
| discomfort severity 1 | dumbbell-romanian-deadlift | legal | - | - | low-back-hinge-pain-discomfort-1; current_discomfort; severity=1; effect/response=prefer_support | lumbar_spine; loaded_hinge, loaded_spinal_flexion | loaded_hinge, loaded_spinal_flexion; loaded_hinge:loading.jointStressTags+cautionStressTags, loaded_spinal_flexion:loading.jointStressTags+cautionStressTags+contraindicatedStressTags | 2/2/4 | 6.400 / 0.474074 | 5.250 / 0.259259 | 8.500 | low-back-hinge-control-priority:exceeds_current_capability; demandReduction=relevant | 7.670 / 2 |
| discomfort severity 1 | cable-pull-through | legal | - | - | low-back-hinge-pain-discomfort-1; current_discomfort; severity=1; effect/response=prefer_support | lumbar_spine; loaded_hinge, loaded_spinal_flexion | loaded_hinge; loaded_hinge:loading.jointStressTags+cautionStressTags | 1/1/2 | 7.300 / 0.540741 | 7.200 / 0.355556 | 8.500 | low-back-hinge-control-priority:develops_priority; demandReduction=relevant | 7.677 / 1 |
| discomfort severity 2 | dumbbell-romanian-deadlift | legal | - | - | low-back-hinge-pain-discomfort-2; current_discomfort; severity=2; effect/response=prefer_support | lumbar_spine; loaded_hinge, loaded_spinal_flexion | loaded_hinge, loaded_spinal_flexion; loaded_hinge:loading.jointStressTags+cautionStressTags, loaded_spinal_flexion:loading.jointStressTags+cautionStressTags+contraindicatedStressTags | 2/2/4 | 6.400 / 0.474074 | 5.250 / 0.259259 | 8.500 | low-back-hinge-control-priority:exceeds_current_capability; demandReduction=relevant | 7.670 / 2 |
| discomfort severity 2 | cable-pull-through | legal | - | - | low-back-hinge-pain-discomfort-2; current_discomfort; severity=2; effect/response=prefer_support | lumbar_spine; loaded_hinge, loaded_spinal_flexion | loaded_hinge; loaded_hinge:loading.jointStressTags+cautionStressTags | 1/1/2 | 7.300 / 0.540741 | 7.200 / 0.355556 | 8.500 | low-back-hinge-control-priority:develops_priority; demandReduction=relevant | 7.677 / 1 |
| moderate severity 3 | dumbbell-romanian-deadlift | legal | - | PAIN_REQUIRES_REVIEW:low-back-hinge-pain-moderate-3 | low-back-hinge-pain-moderate-3; moderate_pain; severity=3; effect/response=avoid_aggravator | lumbar_spine; loaded_hinge, loaded_spinal_flexion | loaded_hinge, loaded_spinal_flexion; loaded_hinge:loading.jointStressTags+cautionStressTags, loaded_spinal_flexion:loading.jointStressTags+cautionStressTags+contraindicatedStressTags | 2/2/4 | 4.600 / 0.340741 | 2.850 / 0.140741 | 8.500 | low-back-hinge-control-priority:exceeds_current_capability; demandReduction=relevant | 7.418 / 2 |
| moderate severity 3 | cable-pull-through | legal | - | PAIN_REQUIRES_REVIEW:low-back-hinge-pain-moderate-3 | low-back-hinge-pain-moderate-3; moderate_pain; severity=3; effect/response=avoid_aggravator | lumbar_spine; loaded_hinge, loaded_spinal_flexion | loaded_hinge; loaded_hinge:loading.jointStressTags+cautionStressTags | 1/1/2 | 6.400 / 0.474074 | 6.000 / 0.296296 | 8.500 | low-back-hinge-control-priority:develops_priority; demandReduction=relevant | 7.551 / 1 |
| moderate severity 4 | dumbbell-romanian-deadlift | legal | - | PAIN_REQUIRES_REVIEW:low-back-hinge-pain-moderate-4 | low-back-hinge-pain-moderate-4; moderate_pain; severity=4; effect/response=avoid_aggravator | lumbar_spine; loaded_hinge, loaded_spinal_flexion | loaded_hinge, loaded_spinal_flexion; loaded_hinge:loading.jointStressTags+cautionStressTags, loaded_spinal_flexion:loading.jointStressTags+cautionStressTags+contraindicatedStressTags | 2/2/4 | 4.600 / 0.340741 | 2.850 / 0.140741 | 8.500 | low-back-hinge-control-priority:exceeds_current_capability; demandReduction=relevant | 7.418 / 2 |
| moderate severity 4 | cable-pull-through | legal | - | PAIN_REQUIRES_REVIEW:low-back-hinge-pain-moderate-4 | low-back-hinge-pain-moderate-4; moderate_pain; severity=4; effect/response=avoid_aggravator | lumbar_spine; loaded_hinge, loaded_spinal_flexion | loaded_hinge; loaded_hinge:loading.jointStressTags+cautionStressTags | 1/1/2 | 6.400 / 0.474074 | 6.000 / 0.296296 | 8.500 | low-back-hinge-control-priority:develops_priority; demandReduction=relevant | 7.551 / 1 |
| moderate severity 5 | dumbbell-romanian-deadlift | legal | - | PAIN_REQUIRES_REVIEW:low-back-hinge-pain-moderate-5 | low-back-hinge-pain-moderate-5; moderate_pain; severity=5; effect/response=avoid_aggravator | lumbar_spine; loaded_hinge, loaded_spinal_flexion | loaded_hinge, loaded_spinal_flexion; loaded_hinge:loading.jointStressTags+cautionStressTags, loaded_spinal_flexion:loading.jointStressTags+cautionStressTags+contraindicatedStressTags | 2/2/4 | 4.600 / 0.340741 | 2.850 / 0.140741 | 8.500 | low-back-hinge-control-priority:exceeds_current_capability; demandReduction=relevant | 7.418 / 2 |
| moderate severity 5 | cable-pull-through | legal | - | PAIN_REQUIRES_REVIEW:low-back-hinge-pain-moderate-5 | low-back-hinge-pain-moderate-5; moderate_pain; severity=5; effect/response=avoid_aggravator | lumbar_spine; loaded_hinge, loaded_spinal_flexion | loaded_hinge; loaded_hinge:loading.jointStressTags+cautionStressTags | 1/1/2 | 6.400 / 0.474074 | 6.000 / 0.296296 | 8.500 | low-back-hinge-control-priority:develops_priority; demandReduction=relevant | 7.551 / 1 |
| moderate severity 6 | dumbbell-romanian-deadlift | legal | - | PAIN_REQUIRES_REVIEW:low-back-hinge-pain-moderate-6 | low-back-hinge-pain-moderate-6; moderate_pain; severity=6; effect/response=avoid_aggravator | lumbar_spine; loaded_hinge, loaded_spinal_flexion | loaded_hinge, loaded_spinal_flexion; loaded_hinge:loading.jointStressTags+cautionStressTags, loaded_spinal_flexion:loading.jointStressTags+cautionStressTags+contraindicatedStressTags | 2/2/4 | 4.600 / 0.340741 | 2.850 / 0.140741 | 8.500 | low-back-hinge-control-priority:exceeds_current_capability; demandReduction=relevant | 7.418 / 2 |
| moderate severity 6 | cable-pull-through | legal | - | PAIN_REQUIRES_REVIEW:low-back-hinge-pain-moderate-6 | low-back-hinge-pain-moderate-6; moderate_pain; severity=6; effect/response=avoid_aggravator | lumbar_spine; loaded_hinge, loaded_spinal_flexion | loaded_hinge; loaded_hinge:loading.jointStressTags+cautionStressTags | 1/1/2 | 6.400 / 0.474074 | 6.000 / 0.296296 | 8.500 | low-back-hinge-control-priority:develops_priority; demandReduction=relevant | 7.551 / 1 |
| acute/severe | dumbbell-romanian-deadlift | rejected | HARD_CONTRAINDICATION:low-back-hinge-pain-acute-7 | - | low-back-hinge-pain-acute-7; acute_severe_pain; severity=7; effect/response=urgentReviewRecommended=true | lumbar_spine; loaded_hinge, loaded_spinal_flexion | loaded_hinge, loaded_spinal_flexion; loaded_hinge:loading.jointStressTags+cautionStressTags, loaded_spinal_flexion:loading.jointStressTags+cautionStressTags+contraindicatedStressTags | 2/0/0 | - / - | - / - | - | not_scored | - / - |
| acute/severe | cable-pull-through | rejected | HARD_CONTRAINDICATION:low-back-hinge-pain-acute-7 | - | low-back-hinge-pain-acute-7; acute_severe_pain; severity=7; effect/response=urgentReviewRecommended=true | lumbar_spine; loaded_hinge, loaded_spinal_flexion | loaded_hinge; loaded_hinge:loading.jointStressTags+cautionStressTags | 1/0/0 | - / - | - / - | - | not_scored | - / - |
| hard contraindication | dumbbell-romanian-deadlift | rejected | HARD_CONTRAINDICATION:low-back-hinge-pain-hard-contraindication | - | low-back-hinge-pain-hard-contraindication; hard_contraindication; severity=-; effect/response=source=safety_rule | lumbar_spine; loaded_hinge, loaded_spinal_flexion | loaded_hinge, loaded_spinal_flexion; loaded_hinge:loading.jointStressTags+cautionStressTags, loaded_spinal_flexion:loading.jointStressTags+cautionStressTags+contraindicatedStressTags | 2/0/0 | - / - | - / - | - | not_scored | - / - |
| hard contraindication | cable-pull-through | rejected | HARD_CONTRAINDICATION:low-back-hinge-pain-hard-contraindication | - | low-back-hinge-pain-hard-contraindication; hard_contraindication; severity=-; effect/response=source=safety_rule | lumbar_spine; loaded_hinge, loaded_spinal_flexion | loaded_hinge; loaded_hinge:loading.jointStressTags+cautionStressTags | 1/0/0 | - / - | - / - | - | not_scored | - / - |

### Low-Back Horizontal Row

| State | Candidate | Outcome | Hard Rejection | Warning | Signal | Region / Tags | Matched Stress / Metadata Sources | Counts U/P/J | Pain Raw / Weighted | Joint Raw / Weighted | Stability | Assessment / Demand Reduction | Total / Rank |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| no pain | machine-row | legal | - | - | -; none; severity=-; effect/response=- | -; - | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 8.500 | low-back-hinge-control-priority:neutral; demandReduction=not_relevant | 8.069 / 1 |
| no pain | seated-cable-row | legal | - | - | -; none; severity=-; effect/response=- | -; - | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 8.500 | low-back-hinge-control-priority:neutral; demandReduction=not_relevant | 8.069 / 2 |
| no pain | chest-supported-dumbbell-row | legal | - | - | -; none; severity=-; effect/response=- | -; - | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 8.500 | low-back-hinge-control-priority:under_challenges_development; demandReduction=not_relevant | 8.064 / 3 |
| no pain | one-arm-dumbbell-row | legal | - | - | -; none; severity=-; effect/response=- | -; - | -; - | 0/0/0 | 8.200 / 0.607407 | 8.450 / 0.417284 | 7.200 | low-back-hinge-control-priority:exceeds_current_capability; demandReduction=not_relevant | 7.908 / 4 |
| discomfort severity 1 | machine-row | legal | - | - | low-back-horizontal-row-pain-discomfort-1; current_discomfort; severity=1; effect/response=prefer_support | lumbar_spine; loaded_hinge, loaded_spinal_flexion | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 9.300 | low-back-hinge-control-priority:neutral; demandReduction=relevant | 8.104 / 1 |
| discomfort severity 1 | seated-cable-row | legal | - | - | low-back-horizontal-row-pain-discomfort-1; current_discomfort; severity=1; effect/response=prefer_support | lumbar_spine; loaded_hinge, loaded_spinal_flexion | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 9.300 | low-back-hinge-control-priority:neutral; demandReduction=relevant | 8.104 / 2 |
| discomfort severity 1 | chest-supported-dumbbell-row | legal | - | - | low-back-horizontal-row-pain-discomfort-1; current_discomfort; severity=1; effect/response=prefer_support | lumbar_spine; loaded_hinge, loaded_spinal_flexion | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 9.300 | low-back-hinge-control-priority:reduces_excess_demand; demandReduction=relevant | 8.102 / 3 |
| discomfort severity 1 | one-arm-dumbbell-row | legal | - | - | low-back-horizontal-row-pain-discomfort-1; current_discomfort; severity=1; effect/response=prefer_support | lumbar_spine; loaded_hinge, loaded_spinal_flexion | loaded_hinge, loaded_spinal_flexion; loaded_hinge:loading.jointStressTags+cautionStressTags, loaded_spinal_flexion:loading.jointStressTags+cautionStressTags | 2/2/4 | 6.400 / 0.474074 | 5.250 / 0.259259 | 7.200 | low-back-hinge-control-priority:exceeds_current_capability; demandReduction=relevant | 7.616 / 4 |
| discomfort severity 2 | machine-row | legal | - | - | low-back-horizontal-row-pain-discomfort-2; current_discomfort; severity=2; effect/response=prefer_support | lumbar_spine; loaded_hinge, loaded_spinal_flexion | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 9.300 | low-back-hinge-control-priority:neutral; demandReduction=relevant | 8.104 / 1 |
| discomfort severity 2 | seated-cable-row | legal | - | - | low-back-horizontal-row-pain-discomfort-2; current_discomfort; severity=2; effect/response=prefer_support | lumbar_spine; loaded_hinge, loaded_spinal_flexion | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 9.300 | low-back-hinge-control-priority:neutral; demandReduction=relevant | 8.104 / 2 |
| discomfort severity 2 | chest-supported-dumbbell-row | legal | - | - | low-back-horizontal-row-pain-discomfort-2; current_discomfort; severity=2; effect/response=prefer_support | lumbar_spine; loaded_hinge, loaded_spinal_flexion | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 9.300 | low-back-hinge-control-priority:reduces_excess_demand; demandReduction=relevant | 8.102 / 3 |
| discomfort severity 2 | one-arm-dumbbell-row | legal | - | - | low-back-horizontal-row-pain-discomfort-2; current_discomfort; severity=2; effect/response=prefer_support | lumbar_spine; loaded_hinge, loaded_spinal_flexion | loaded_hinge, loaded_spinal_flexion; loaded_hinge:loading.jointStressTags+cautionStressTags, loaded_spinal_flexion:loading.jointStressTags+cautionStressTags | 2/2/4 | 6.400 / 0.474074 | 5.250 / 0.259259 | 7.200 | low-back-hinge-control-priority:exceeds_current_capability; demandReduction=relevant | 7.616 / 4 |
| moderate severity 3 | machine-row | legal | - | - | low-back-horizontal-row-pain-moderate-3; moderate_pain; severity=3; effect/response=avoid_aggravator | lumbar_spine; loaded_hinge, loaded_spinal_flexion | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 9.300 | low-back-hinge-control-priority:neutral; demandReduction=relevant | 8.104 / 1 |
| moderate severity 3 | seated-cable-row | legal | - | - | low-back-horizontal-row-pain-moderate-3; moderate_pain; severity=3; effect/response=avoid_aggravator | lumbar_spine; loaded_hinge, loaded_spinal_flexion | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 9.300 | low-back-hinge-control-priority:neutral; demandReduction=relevant | 8.104 / 2 |
| moderate severity 3 | chest-supported-dumbbell-row | legal | - | - | low-back-horizontal-row-pain-moderate-3; moderate_pain; severity=3; effect/response=avoid_aggravator | lumbar_spine; loaded_hinge, loaded_spinal_flexion | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 9.300 | low-back-hinge-control-priority:reduces_excess_demand; demandReduction=relevant | 8.102 / 3 |
| moderate severity 3 | one-arm-dumbbell-row | legal | - | PAIN_REQUIRES_REVIEW:low-back-horizontal-row-pain-moderate-3 | low-back-horizontal-row-pain-moderate-3; moderate_pain; severity=3; effect/response=avoid_aggravator | lumbar_spine; loaded_hinge, loaded_spinal_flexion | loaded_hinge, loaded_spinal_flexion; loaded_hinge:loading.jointStressTags+cautionStressTags, loaded_spinal_flexion:loading.jointStressTags+cautionStressTags | 2/2/4 | 4.600 / 0.340741 | 2.850 / 0.140741 | 7.200 | low-back-hinge-control-priority:exceeds_current_capability; demandReduction=relevant | 7.364 / 4 |
| moderate severity 4 | machine-row | legal | - | - | low-back-horizontal-row-pain-moderate-4; moderate_pain; severity=4; effect/response=avoid_aggravator | lumbar_spine; loaded_hinge, loaded_spinal_flexion | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 9.300 | low-back-hinge-control-priority:neutral; demandReduction=relevant | 8.104 / 1 |
| moderate severity 4 | seated-cable-row | legal | - | - | low-back-horizontal-row-pain-moderate-4; moderate_pain; severity=4; effect/response=avoid_aggravator | lumbar_spine; loaded_hinge, loaded_spinal_flexion | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 9.300 | low-back-hinge-control-priority:neutral; demandReduction=relevant | 8.104 / 2 |
| moderate severity 4 | chest-supported-dumbbell-row | legal | - | - | low-back-horizontal-row-pain-moderate-4; moderate_pain; severity=4; effect/response=avoid_aggravator | lumbar_spine; loaded_hinge, loaded_spinal_flexion | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 9.300 | low-back-hinge-control-priority:reduces_excess_demand; demandReduction=relevant | 8.102 / 3 |
| moderate severity 4 | one-arm-dumbbell-row | legal | - | PAIN_REQUIRES_REVIEW:low-back-horizontal-row-pain-moderate-4 | low-back-horizontal-row-pain-moderate-4; moderate_pain; severity=4; effect/response=avoid_aggravator | lumbar_spine; loaded_hinge, loaded_spinal_flexion | loaded_hinge, loaded_spinal_flexion; loaded_hinge:loading.jointStressTags+cautionStressTags, loaded_spinal_flexion:loading.jointStressTags+cautionStressTags | 2/2/4 | 4.600 / 0.340741 | 2.850 / 0.140741 | 7.200 | low-back-hinge-control-priority:exceeds_current_capability; demandReduction=relevant | 7.364 / 4 |
| moderate severity 5 | machine-row | legal | - | - | low-back-horizontal-row-pain-moderate-5; moderate_pain; severity=5; effect/response=avoid_aggravator | lumbar_spine; loaded_hinge, loaded_spinal_flexion | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 9.300 | low-back-hinge-control-priority:neutral; demandReduction=relevant | 8.104 / 1 |
| moderate severity 5 | seated-cable-row | legal | - | - | low-back-horizontal-row-pain-moderate-5; moderate_pain; severity=5; effect/response=avoid_aggravator | lumbar_spine; loaded_hinge, loaded_spinal_flexion | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 9.300 | low-back-hinge-control-priority:neutral; demandReduction=relevant | 8.104 / 2 |
| moderate severity 5 | chest-supported-dumbbell-row | legal | - | - | low-back-horizontal-row-pain-moderate-5; moderate_pain; severity=5; effect/response=avoid_aggravator | lumbar_spine; loaded_hinge, loaded_spinal_flexion | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 9.300 | low-back-hinge-control-priority:reduces_excess_demand; demandReduction=relevant | 8.102 / 3 |
| moderate severity 5 | one-arm-dumbbell-row | legal | - | PAIN_REQUIRES_REVIEW:low-back-horizontal-row-pain-moderate-5 | low-back-horizontal-row-pain-moderate-5; moderate_pain; severity=5; effect/response=avoid_aggravator | lumbar_spine; loaded_hinge, loaded_spinal_flexion | loaded_hinge, loaded_spinal_flexion; loaded_hinge:loading.jointStressTags+cautionStressTags, loaded_spinal_flexion:loading.jointStressTags+cautionStressTags | 2/2/4 | 4.600 / 0.340741 | 2.850 / 0.140741 | 7.200 | low-back-hinge-control-priority:exceeds_current_capability; demandReduction=relevant | 7.364 / 4 |
| moderate severity 6 | machine-row | legal | - | - | low-back-horizontal-row-pain-moderate-6; moderate_pain; severity=6; effect/response=avoid_aggravator | lumbar_spine; loaded_hinge, loaded_spinal_flexion | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 9.300 | low-back-hinge-control-priority:neutral; demandReduction=relevant | 8.104 / 1 |
| moderate severity 6 | seated-cable-row | legal | - | - | low-back-horizontal-row-pain-moderate-6; moderate_pain; severity=6; effect/response=avoid_aggravator | lumbar_spine; loaded_hinge, loaded_spinal_flexion | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 9.300 | low-back-hinge-control-priority:neutral; demandReduction=relevant | 8.104 / 2 |
| moderate severity 6 | chest-supported-dumbbell-row | legal | - | - | low-back-horizontal-row-pain-moderate-6; moderate_pain; severity=6; effect/response=avoid_aggravator | lumbar_spine; loaded_hinge, loaded_spinal_flexion | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 9.300 | low-back-hinge-control-priority:reduces_excess_demand; demandReduction=relevant | 8.102 / 3 |
| moderate severity 6 | one-arm-dumbbell-row | legal | - | PAIN_REQUIRES_REVIEW:low-back-horizontal-row-pain-moderate-6 | low-back-horizontal-row-pain-moderate-6; moderate_pain; severity=6; effect/response=avoid_aggravator | lumbar_spine; loaded_hinge, loaded_spinal_flexion | loaded_hinge, loaded_spinal_flexion; loaded_hinge:loading.jointStressTags+cautionStressTags, loaded_spinal_flexion:loading.jointStressTags+cautionStressTags | 2/2/4 | 4.600 / 0.340741 | 2.850 / 0.140741 | 7.200 | low-back-hinge-control-priority:exceeds_current_capability; demandReduction=relevant | 7.364 / 4 |
| acute/severe | machine-row | legal | - | - | low-back-horizontal-row-pain-acute-7; acute_severe_pain; severity=7; effect/response=urgentReviewRecommended=true | lumbar_spine; loaded_hinge, loaded_spinal_flexion | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 8.500 | low-back-hinge-control-priority:neutral; demandReduction=not_relevant | 8.069 / 1 |
| acute/severe | seated-cable-row | legal | - | - | low-back-horizontal-row-pain-acute-7; acute_severe_pain; severity=7; effect/response=urgentReviewRecommended=true | lumbar_spine; loaded_hinge, loaded_spinal_flexion | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 8.500 | low-back-hinge-control-priority:neutral; demandReduction=not_relevant | 8.069 / 2 |
| acute/severe | chest-supported-dumbbell-row | legal | - | - | low-back-horizontal-row-pain-acute-7; acute_severe_pain; severity=7; effect/response=urgentReviewRecommended=true | lumbar_spine; loaded_hinge, loaded_spinal_flexion | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 8.500 | low-back-hinge-control-priority:under_challenges_development; demandReduction=not_relevant | 8.064 / 3 |
| acute/severe | one-arm-dumbbell-row | rejected | HARD_CONTRAINDICATION:low-back-horizontal-row-pain-acute-7 | - | low-back-horizontal-row-pain-acute-7; acute_severe_pain; severity=7; effect/response=urgentReviewRecommended=true | lumbar_spine; loaded_hinge, loaded_spinal_flexion | loaded_hinge, loaded_spinal_flexion; loaded_hinge:loading.jointStressTags+cautionStressTags, loaded_spinal_flexion:loading.jointStressTags+cautionStressTags | 2/0/0 | - / - | - / - | - | not_scored | - / - |
| hard contraindication | machine-row | legal | - | - | low-back-horizontal-row-pain-hard-contraindication; hard_contraindication; severity=-; effect/response=source=safety_rule | lumbar_spine; loaded_hinge, loaded_spinal_flexion | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 8.500 | low-back-hinge-control-priority:neutral; demandReduction=not_relevant | 8.069 / 1 |
| hard contraindication | seated-cable-row | legal | - | - | low-back-horizontal-row-pain-hard-contraindication; hard_contraindication; severity=-; effect/response=source=safety_rule | lumbar_spine; loaded_hinge, loaded_spinal_flexion | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 8.500 | low-back-hinge-control-priority:neutral; demandReduction=not_relevant | 8.069 / 2 |
| hard contraindication | chest-supported-dumbbell-row | legal | - | - | low-back-horizontal-row-pain-hard-contraindication; hard_contraindication; severity=-; effect/response=source=safety_rule | lumbar_spine; loaded_hinge, loaded_spinal_flexion | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 8.500 | low-back-hinge-control-priority:under_challenges_development; demandReduction=not_relevant | 8.064 / 3 |
| hard contraindication | one-arm-dumbbell-row | rejected | HARD_CONTRAINDICATION:low-back-horizontal-row-pain-hard-contraindication | - | low-back-horizontal-row-pain-hard-contraindication; hard_contraindication; severity=-; effect/response=source=safety_rule | lumbar_spine; loaded_hinge, loaded_spinal_flexion | loaded_hinge, loaded_spinal_flexion; loaded_hinge:loading.jointStressTags+cautionStressTags, loaded_spinal_flexion:loading.jointStressTags+cautionStressTags | 2/0/0 | - / - | - / - | - | not_scored | - / - |

### Knee Squat

| State | Candidate | Outcome | Hard Rejection | Warning | Signal | Region / Tags | Matched Stress / Metadata Sources | Counts U/P/J | Pain Raw / Weighted | Joint Raw / Weighted | Stability | Assessment / Demand Reduction | Total / Rank |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| no pain | goblet-squat | legal | - | - | -; none; severity=-; effect/response=- | -; - | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 8.500 | pain-audit-knee-control:under_challenges_development; demandReduction=not_relevant | 7.705 / 2 |
| no pain | leg-press | legal | - | - | -; none; severity=-; effect/response=- | -; - | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 8.500 | pain-audit-knee-control:under_challenges_development; demandReduction=not_relevant | 7.981 / 1 |
| no pain | bodyweight-box-squat | legal | - | - | -; none; severity=-; effect/response=- | -; - | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 8.500 | pain-audit-knee-control:under_challenges_development; demandReduction=not_relevant | 7.311 / 3 |
| discomfort severity 1 | goblet-squat | legal | - | - | knee-squat-pain-discomfort-1; current_discomfort; severity=1; effect/response=prefer_support | knee; deep_knee_flexion, loaded_knee_flexion | deep_knee_flexion, loaded_knee_flexion; deep_knee_flexion:loading.jointStressTags+cautionStressTags, loaded_knee_flexion:loading.jointStressTags+cautionStressTags | 2/2/4 | 6.400 / 0.474074 | 5.600 / 0.276543 | 8.500 | pain-audit-knee-control:reduces_excess_demand; demandReduction=relevant | 7.440 / 2 |
| discomfort severity 1 | leg-press | legal | - | - | knee-squat-pain-discomfort-1; current_discomfort; severity=1; effect/response=prefer_support | knee; deep_knee_flexion, loaded_knee_flexion | deep_knee_flexion, loaded_knee_flexion; deep_knee_flexion:loading.jointStressTags, loaded_knee_flexion:loading.jointStressTags+cautionStressTags | 2/2/3 | 6.400 / 0.474074 | 6.400 / 0.316049 | 9.300 | pain-audit-knee-control:reduces_excess_demand; demandReduction=relevant | 7.790 / 1 |
| discomfort severity 1 | bodyweight-box-squat | legal | - | - | knee-squat-pain-discomfort-1; current_discomfort; severity=1; effect/response=prefer_support | knee; deep_knee_flexion, loaded_knee_flexion | deep_knee_flexion; deep_knee_flexion:loading.jointStressTags+cautionStressTags | 1/1/2 | 7.300 / 0.540741 | 7.200 / 0.355556 | 9.300 | pain-audit-knee-control:reduces_excess_demand; demandReduction=relevant | 7.227 / 3 |
| discomfort severity 2 | goblet-squat | legal | - | - | knee-squat-pain-discomfort-2; current_discomfort; severity=2; effect/response=prefer_support | knee; deep_knee_flexion, loaded_knee_flexion | deep_knee_flexion, loaded_knee_flexion; deep_knee_flexion:loading.jointStressTags+cautionStressTags, loaded_knee_flexion:loading.jointStressTags+cautionStressTags | 2/2/4 | 6.400 / 0.474074 | 5.600 / 0.276543 | 8.500 | pain-audit-knee-control:reduces_excess_demand; demandReduction=relevant | 7.440 / 2 |
| discomfort severity 2 | leg-press | legal | - | - | knee-squat-pain-discomfort-2; current_discomfort; severity=2; effect/response=prefer_support | knee; deep_knee_flexion, loaded_knee_flexion | deep_knee_flexion, loaded_knee_flexion; deep_knee_flexion:loading.jointStressTags, loaded_knee_flexion:loading.jointStressTags+cautionStressTags | 2/2/3 | 6.400 / 0.474074 | 6.400 / 0.316049 | 9.300 | pain-audit-knee-control:reduces_excess_demand; demandReduction=relevant | 7.790 / 1 |
| discomfort severity 2 | bodyweight-box-squat | legal | - | - | knee-squat-pain-discomfort-2; current_discomfort; severity=2; effect/response=prefer_support | knee; deep_knee_flexion, loaded_knee_flexion | deep_knee_flexion; deep_knee_flexion:loading.jointStressTags+cautionStressTags | 1/1/2 | 7.300 / 0.540741 | 7.200 / 0.355556 | 9.300 | pain-audit-knee-control:reduces_excess_demand; demandReduction=relevant | 7.227 / 3 |
| moderate severity 3 | goblet-squat | legal | - | PAIN_REQUIRES_REVIEW:knee-squat-pain-moderate-3 | knee-squat-pain-moderate-3; moderate_pain; severity=3; effect/response=avoid_aggravator | knee; deep_knee_flexion, loaded_knee_flexion | deep_knee_flexion, loaded_knee_flexion; deep_knee_flexion:loading.jointStressTags+cautionStressTags, loaded_knee_flexion:loading.jointStressTags+cautionStressTags | 2/2/4 | 4.600 / 0.340741 | 3.200 / 0.158025 | 8.500 | pain-audit-knee-control:reduces_excess_demand; demandReduction=relevant | 7.188 / 2 |
| moderate severity 3 | leg-press | legal | - | PAIN_REQUIRES_REVIEW:knee-squat-pain-moderate-3 | knee-squat-pain-moderate-3; moderate_pain; severity=3; effect/response=avoid_aggravator | knee; deep_knee_flexion, loaded_knee_flexion | deep_knee_flexion, loaded_knee_flexion; deep_knee_flexion:loading.jointStressTags, loaded_knee_flexion:loading.jointStressTags+cautionStressTags | 2/2/3 | 4.600 / 0.340741 | 4.600 / 0.227160 | 9.300 | pain-audit-knee-control:reduces_excess_demand; demandReduction=relevant | 7.568 / 1 |
| moderate severity 3 | bodyweight-box-squat | legal | - | PAIN_REQUIRES_REVIEW:knee-squat-pain-moderate-3 | knee-squat-pain-moderate-3; moderate_pain; severity=3; effect/response=avoid_aggravator | knee; deep_knee_flexion, loaded_knee_flexion | deep_knee_flexion; deep_knee_flexion:loading.jointStressTags+cautionStressTags | 1/1/2 | 6.400 / 0.474074 | 6.000 / 0.296296 | 9.300 | pain-audit-knee-control:reduces_excess_demand; demandReduction=relevant | 7.101 / 3 |
| moderate severity 4 | goblet-squat | legal | - | PAIN_REQUIRES_REVIEW:knee-squat-pain-moderate-4 | knee-squat-pain-moderate-4; moderate_pain; severity=4; effect/response=avoid_aggravator | knee; deep_knee_flexion, loaded_knee_flexion | deep_knee_flexion, loaded_knee_flexion; deep_knee_flexion:loading.jointStressTags+cautionStressTags, loaded_knee_flexion:loading.jointStressTags+cautionStressTags | 2/2/4 | 4.600 / 0.340741 | 3.200 / 0.158025 | 8.500 | pain-audit-knee-control:reduces_excess_demand; demandReduction=relevant | 7.188 / 2 |
| moderate severity 4 | leg-press | legal | - | PAIN_REQUIRES_REVIEW:knee-squat-pain-moderate-4 | knee-squat-pain-moderate-4; moderate_pain; severity=4; effect/response=avoid_aggravator | knee; deep_knee_flexion, loaded_knee_flexion | deep_knee_flexion, loaded_knee_flexion; deep_knee_flexion:loading.jointStressTags, loaded_knee_flexion:loading.jointStressTags+cautionStressTags | 2/2/3 | 4.600 / 0.340741 | 4.600 / 0.227160 | 9.300 | pain-audit-knee-control:reduces_excess_demand; demandReduction=relevant | 7.568 / 1 |
| moderate severity 4 | bodyweight-box-squat | legal | - | PAIN_REQUIRES_REVIEW:knee-squat-pain-moderate-4 | knee-squat-pain-moderate-4; moderate_pain; severity=4; effect/response=avoid_aggravator | knee; deep_knee_flexion, loaded_knee_flexion | deep_knee_flexion; deep_knee_flexion:loading.jointStressTags+cautionStressTags | 1/1/2 | 6.400 / 0.474074 | 6.000 / 0.296296 | 9.300 | pain-audit-knee-control:reduces_excess_demand; demandReduction=relevant | 7.101 / 3 |
| moderate severity 5 | goblet-squat | legal | - | PAIN_REQUIRES_REVIEW:knee-squat-pain-moderate-5 | knee-squat-pain-moderate-5; moderate_pain; severity=5; effect/response=avoid_aggravator | knee; deep_knee_flexion, loaded_knee_flexion | deep_knee_flexion, loaded_knee_flexion; deep_knee_flexion:loading.jointStressTags+cautionStressTags, loaded_knee_flexion:loading.jointStressTags+cautionStressTags | 2/2/4 | 4.600 / 0.340741 | 3.200 / 0.158025 | 8.500 | pain-audit-knee-control:reduces_excess_demand; demandReduction=relevant | 7.188 / 2 |
| moderate severity 5 | leg-press | legal | - | PAIN_REQUIRES_REVIEW:knee-squat-pain-moderate-5 | knee-squat-pain-moderate-5; moderate_pain; severity=5; effect/response=avoid_aggravator | knee; deep_knee_flexion, loaded_knee_flexion | deep_knee_flexion, loaded_knee_flexion; deep_knee_flexion:loading.jointStressTags, loaded_knee_flexion:loading.jointStressTags+cautionStressTags | 2/2/3 | 4.600 / 0.340741 | 4.600 / 0.227160 | 9.300 | pain-audit-knee-control:reduces_excess_demand; demandReduction=relevant | 7.568 / 1 |
| moderate severity 5 | bodyweight-box-squat | legal | - | PAIN_REQUIRES_REVIEW:knee-squat-pain-moderate-5 | knee-squat-pain-moderate-5; moderate_pain; severity=5; effect/response=avoid_aggravator | knee; deep_knee_flexion, loaded_knee_flexion | deep_knee_flexion; deep_knee_flexion:loading.jointStressTags+cautionStressTags | 1/1/2 | 6.400 / 0.474074 | 6.000 / 0.296296 | 9.300 | pain-audit-knee-control:reduces_excess_demand; demandReduction=relevant | 7.101 / 3 |
| moderate severity 6 | goblet-squat | legal | - | PAIN_REQUIRES_REVIEW:knee-squat-pain-moderate-6 | knee-squat-pain-moderate-6; moderate_pain; severity=6; effect/response=avoid_aggravator | knee; deep_knee_flexion, loaded_knee_flexion | deep_knee_flexion, loaded_knee_flexion; deep_knee_flexion:loading.jointStressTags+cautionStressTags, loaded_knee_flexion:loading.jointStressTags+cautionStressTags | 2/2/4 | 4.600 / 0.340741 | 3.200 / 0.158025 | 8.500 | pain-audit-knee-control:reduces_excess_demand; demandReduction=relevant | 7.188 / 2 |
| moderate severity 6 | leg-press | legal | - | PAIN_REQUIRES_REVIEW:knee-squat-pain-moderate-6 | knee-squat-pain-moderate-6; moderate_pain; severity=6; effect/response=avoid_aggravator | knee; deep_knee_flexion, loaded_knee_flexion | deep_knee_flexion, loaded_knee_flexion; deep_knee_flexion:loading.jointStressTags, loaded_knee_flexion:loading.jointStressTags+cautionStressTags | 2/2/3 | 4.600 / 0.340741 | 4.600 / 0.227160 | 9.300 | pain-audit-knee-control:reduces_excess_demand; demandReduction=relevant | 7.568 / 1 |
| moderate severity 6 | bodyweight-box-squat | legal | - | PAIN_REQUIRES_REVIEW:knee-squat-pain-moderate-6 | knee-squat-pain-moderate-6; moderate_pain; severity=6; effect/response=avoid_aggravator | knee; deep_knee_flexion, loaded_knee_flexion | deep_knee_flexion; deep_knee_flexion:loading.jointStressTags+cautionStressTags | 1/1/2 | 6.400 / 0.474074 | 6.000 / 0.296296 | 9.300 | pain-audit-knee-control:reduces_excess_demand; demandReduction=relevant | 7.101 / 3 |
| acute/severe | goblet-squat | rejected | HARD_CONTRAINDICATION:knee-squat-pain-acute-7 | - | knee-squat-pain-acute-7; acute_severe_pain; severity=7; effect/response=urgentReviewRecommended=true | knee; deep_knee_flexion, loaded_knee_flexion | deep_knee_flexion, loaded_knee_flexion; deep_knee_flexion:loading.jointStressTags+cautionStressTags, loaded_knee_flexion:loading.jointStressTags+cautionStressTags | 2/0/0 | - / - | - / - | - | not_scored | - / - |
| acute/severe | leg-press | rejected | HARD_CONTRAINDICATION:knee-squat-pain-acute-7 | - | knee-squat-pain-acute-7; acute_severe_pain; severity=7; effect/response=urgentReviewRecommended=true | knee; deep_knee_flexion, loaded_knee_flexion | deep_knee_flexion, loaded_knee_flexion; deep_knee_flexion:loading.jointStressTags, loaded_knee_flexion:loading.jointStressTags+cautionStressTags | 2/0/0 | - / - | - / - | - | not_scored | - / - |
| acute/severe | bodyweight-box-squat | rejected | HARD_CONTRAINDICATION:knee-squat-pain-acute-7 | - | knee-squat-pain-acute-7; acute_severe_pain; severity=7; effect/response=urgentReviewRecommended=true | knee; deep_knee_flexion, loaded_knee_flexion | deep_knee_flexion; deep_knee_flexion:loading.jointStressTags+cautionStressTags | 1/0/0 | - / - | - / - | - | not_scored | - / - |
| hard contraindication | goblet-squat | rejected | HARD_CONTRAINDICATION:knee-squat-pain-hard-contraindication | - | knee-squat-pain-hard-contraindication; hard_contraindication; severity=-; effect/response=source=safety_rule | knee; deep_knee_flexion, loaded_knee_flexion | deep_knee_flexion, loaded_knee_flexion; deep_knee_flexion:loading.jointStressTags+cautionStressTags, loaded_knee_flexion:loading.jointStressTags+cautionStressTags | 2/0/0 | - / - | - / - | - | not_scored | - / - |
| hard contraindication | leg-press | rejected | HARD_CONTRAINDICATION:knee-squat-pain-hard-contraindication | - | knee-squat-pain-hard-contraindication; hard_contraindication; severity=-; effect/response=source=safety_rule | knee; deep_knee_flexion, loaded_knee_flexion | deep_knee_flexion, loaded_knee_flexion; deep_knee_flexion:loading.jointStressTags, loaded_knee_flexion:loading.jointStressTags+cautionStressTags | 2/0/0 | - / - | - / - | - | not_scored | - / - |
| hard contraindication | bodyweight-box-squat | rejected | HARD_CONTRAINDICATION:knee-squat-pain-hard-contraindication | - | knee-squat-pain-hard-contraindication; hard_contraindication; severity=-; effect/response=source=safety_rule | knee; deep_knee_flexion, loaded_knee_flexion | deep_knee_flexion; deep_knee_flexion:loading.jointStressTags+cautionStressTags | 1/0/0 | - / - | - / - | - | not_scored | - / - |

### Single-Leg

| State | Candidate | Outcome | Hard Rejection | Warning | Signal | Region / Tags | Matched Stress / Metadata Sources | Counts U/P/J | Pain Raw / Weighted | Joint Raw / Weighted | Stability | Assessment / Demand Reduction | Total / Rank |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| no pain | split-squat | legal | - | - | -; none; severity=-; effect/response=- | -; - | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 8.500 | pain-audit-knee-control:under_challenges_development; demandReduction=not_relevant | 7.985 / 1 |
| no pain | step-up | legal | - | - | -; none; severity=-; effect/response=- | -; - | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 8.500 | pain-audit-knee-control:under_challenges_development; demandReduction=not_relevant | 7.965 / 2 |
| discomfort severity 1 | split-squat | legal | - | - | single-leg-pain-discomfort-1; current_discomfort; severity=1; effect/response=prefer_support | knee; deep_knee_flexion, loaded_knee_flexion | deep_knee_flexion, loaded_knee_flexion; deep_knee_flexion:loading.jointStressTags+cautionStressTags, loaded_knee_flexion:loading.jointStressTags+cautionStressTags | 2/2/4 | 6.400 / 0.474074 | 5.600 / 0.276543 | 8.500 | pain-audit-knee-control:reduces_excess_demand; demandReduction=relevant | 7.721 / 2 |
| discomfort severity 1 | step-up | legal | - | - | single-leg-pain-discomfort-1; current_discomfort; severity=1; effect/response=prefer_support | knee; deep_knee_flexion, loaded_knee_flexion | loaded_knee_flexion; loaded_knee_flexion:loading.jointStressTags+cautionStressTags | 1/1/2 | 7.300 / 0.540741 | 7.200 / 0.355556 | 8.500 | pain-audit-knee-control:reduces_excess_demand; demandReduction=relevant | 7.846 / 1 |
| discomfort severity 2 | split-squat | legal | - | - | single-leg-pain-discomfort-2; current_discomfort; severity=2; effect/response=prefer_support | knee; deep_knee_flexion, loaded_knee_flexion | deep_knee_flexion, loaded_knee_flexion; deep_knee_flexion:loading.jointStressTags+cautionStressTags, loaded_knee_flexion:loading.jointStressTags+cautionStressTags | 2/2/4 | 6.400 / 0.474074 | 5.600 / 0.276543 | 8.500 | pain-audit-knee-control:reduces_excess_demand; demandReduction=relevant | 7.721 / 2 |
| discomfort severity 2 | step-up | legal | - | - | single-leg-pain-discomfort-2; current_discomfort; severity=2; effect/response=prefer_support | knee; deep_knee_flexion, loaded_knee_flexion | loaded_knee_flexion; loaded_knee_flexion:loading.jointStressTags+cautionStressTags | 1/1/2 | 7.300 / 0.540741 | 7.200 / 0.355556 | 8.500 | pain-audit-knee-control:reduces_excess_demand; demandReduction=relevant | 7.846 / 1 |
| moderate severity 3 | split-squat | legal | - | PAIN_REQUIRES_REVIEW:single-leg-pain-moderate-3 | single-leg-pain-moderate-3; moderate_pain; severity=3; effect/response=avoid_aggravator | knee; deep_knee_flexion, loaded_knee_flexion | deep_knee_flexion, loaded_knee_flexion; deep_knee_flexion:loading.jointStressTags+cautionStressTags, loaded_knee_flexion:loading.jointStressTags+cautionStressTags | 2/2/4 | 4.600 / 0.340741 | 3.200 / 0.158025 | 8.500 | pain-audit-knee-control:reduces_excess_demand; demandReduction=relevant | 7.469 / 2 |
| moderate severity 3 | step-up | legal | - | PAIN_REQUIRES_REVIEW:single-leg-pain-moderate-3 | single-leg-pain-moderate-3; moderate_pain; severity=3; effect/response=avoid_aggravator | knee; deep_knee_flexion, loaded_knee_flexion | loaded_knee_flexion; loaded_knee_flexion:loading.jointStressTags+cautionStressTags | 1/1/2 | 6.400 / 0.474074 | 6.000 / 0.296296 | 8.500 | pain-audit-knee-control:reduces_excess_demand; demandReduction=relevant | 7.720 / 1 |
| moderate severity 4 | split-squat | legal | - | PAIN_REQUIRES_REVIEW:single-leg-pain-moderate-4 | single-leg-pain-moderate-4; moderate_pain; severity=4; effect/response=avoid_aggravator | knee; deep_knee_flexion, loaded_knee_flexion | deep_knee_flexion, loaded_knee_flexion; deep_knee_flexion:loading.jointStressTags+cautionStressTags, loaded_knee_flexion:loading.jointStressTags+cautionStressTags | 2/2/4 | 4.600 / 0.340741 | 3.200 / 0.158025 | 8.500 | pain-audit-knee-control:reduces_excess_demand; demandReduction=relevant | 7.469 / 2 |
| moderate severity 4 | step-up | legal | - | PAIN_REQUIRES_REVIEW:single-leg-pain-moderate-4 | single-leg-pain-moderate-4; moderate_pain; severity=4; effect/response=avoid_aggravator | knee; deep_knee_flexion, loaded_knee_flexion | loaded_knee_flexion; loaded_knee_flexion:loading.jointStressTags+cautionStressTags | 1/1/2 | 6.400 / 0.474074 | 6.000 / 0.296296 | 8.500 | pain-audit-knee-control:reduces_excess_demand; demandReduction=relevant | 7.720 / 1 |
| moderate severity 5 | split-squat | legal | - | PAIN_REQUIRES_REVIEW:single-leg-pain-moderate-5 | single-leg-pain-moderate-5; moderate_pain; severity=5; effect/response=avoid_aggravator | knee; deep_knee_flexion, loaded_knee_flexion | deep_knee_flexion, loaded_knee_flexion; deep_knee_flexion:loading.jointStressTags+cautionStressTags, loaded_knee_flexion:loading.jointStressTags+cautionStressTags | 2/2/4 | 4.600 / 0.340741 | 3.200 / 0.158025 | 8.500 | pain-audit-knee-control:reduces_excess_demand; demandReduction=relevant | 7.469 / 2 |
| moderate severity 5 | step-up | legal | - | PAIN_REQUIRES_REVIEW:single-leg-pain-moderate-5 | single-leg-pain-moderate-5; moderate_pain; severity=5; effect/response=avoid_aggravator | knee; deep_knee_flexion, loaded_knee_flexion | loaded_knee_flexion; loaded_knee_flexion:loading.jointStressTags+cautionStressTags | 1/1/2 | 6.400 / 0.474074 | 6.000 / 0.296296 | 8.500 | pain-audit-knee-control:reduces_excess_demand; demandReduction=relevant | 7.720 / 1 |
| moderate severity 6 | split-squat | legal | - | PAIN_REQUIRES_REVIEW:single-leg-pain-moderate-6 | single-leg-pain-moderate-6; moderate_pain; severity=6; effect/response=avoid_aggravator | knee; deep_knee_flexion, loaded_knee_flexion | deep_knee_flexion, loaded_knee_flexion; deep_knee_flexion:loading.jointStressTags+cautionStressTags, loaded_knee_flexion:loading.jointStressTags+cautionStressTags | 2/2/4 | 4.600 / 0.340741 | 3.200 / 0.158025 | 8.500 | pain-audit-knee-control:reduces_excess_demand; demandReduction=relevant | 7.469 / 2 |
| moderate severity 6 | step-up | legal | - | PAIN_REQUIRES_REVIEW:single-leg-pain-moderate-6 | single-leg-pain-moderate-6; moderate_pain; severity=6; effect/response=avoid_aggravator | knee; deep_knee_flexion, loaded_knee_flexion | loaded_knee_flexion; loaded_knee_flexion:loading.jointStressTags+cautionStressTags | 1/1/2 | 6.400 / 0.474074 | 6.000 / 0.296296 | 8.500 | pain-audit-knee-control:reduces_excess_demand; demandReduction=relevant | 7.720 / 1 |
| acute/severe | split-squat | rejected | HARD_CONTRAINDICATION:single-leg-pain-acute-7 | - | single-leg-pain-acute-7; acute_severe_pain; severity=7; effect/response=urgentReviewRecommended=true | knee; deep_knee_flexion, loaded_knee_flexion | deep_knee_flexion, loaded_knee_flexion; deep_knee_flexion:loading.jointStressTags+cautionStressTags, loaded_knee_flexion:loading.jointStressTags+cautionStressTags | 2/0/0 | - / - | - / - | - | not_scored | - / - |
| acute/severe | step-up | rejected | HARD_CONTRAINDICATION:single-leg-pain-acute-7 | - | single-leg-pain-acute-7; acute_severe_pain; severity=7; effect/response=urgentReviewRecommended=true | knee; deep_knee_flexion, loaded_knee_flexion | loaded_knee_flexion; loaded_knee_flexion:loading.jointStressTags+cautionStressTags | 1/0/0 | - / - | - / - | - | not_scored | - / - |
| hard contraindication | split-squat | rejected | HARD_CONTRAINDICATION:single-leg-pain-hard-contraindication | - | single-leg-pain-hard-contraindication; hard_contraindication; severity=-; effect/response=source=safety_rule | knee; deep_knee_flexion, loaded_knee_flexion | deep_knee_flexion, loaded_knee_flexion; deep_knee_flexion:loading.jointStressTags+cautionStressTags, loaded_knee_flexion:loading.jointStressTags+cautionStressTags | 2/0/0 | - / - | - / - | - | not_scored | - / - |
| hard contraindication | step-up | rejected | HARD_CONTRAINDICATION:single-leg-pain-hard-contraindication | - | single-leg-pain-hard-contraindication; hard_contraindication; severity=-; effect/response=source=safety_rule | knee; deep_knee_flexion, loaded_knee_flexion | loaded_knee_flexion; loaded_knee_flexion:loading.jointStressTags+cautionStressTags | 1/0/0 | - / - | - / - | - | not_scored | - / - |

### Unrelated Wrist Discomfort During Squat

| State | Candidate | Outcome | Hard Rejection | Warning | Signal | Region / Tags | Matched Stress / Metadata Sources | Counts U/P/J | Pain Raw / Weighted | Joint Raw / Weighted | Stability | Assessment / Demand Reduction | Total / Rank |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| no pain baseline | goblet-squat | legal | - | - | -; none; severity=-; effect/response=- | -; - | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 8.500 | pain-audit-knee-control:under_challenges_development; demandReduction=not_relevant | 7.705 / 2 |
| no pain baseline | leg-press | legal | - | - | -; none; severity=-; effect/response=- | -; - | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 8.500 | pain-audit-knee-control:under_challenges_development; demandReduction=not_relevant | 7.981 / 1 |
| no pain baseline | bodyweight-box-squat | legal | - | - | -; none; severity=-; effect/response=- | -; - | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 8.500 | pain-audit-knee-control:under_challenges_development; demandReduction=not_relevant | 7.311 / 3 |
| unrelated discomfort | goblet-squat | legal | - | - | unrelated-wrist-during-squat-unrelated-discomfort; current_discomfort; severity=2; effect/response=prefer_support | wrist; wrist_extension_loading | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 8.500 | pain-audit-knee-control:under_challenges_development; demandReduction=not_relevant | 7.705 / 2 |
| unrelated discomfort | leg-press | legal | - | - | unrelated-wrist-during-squat-unrelated-discomfort; current_discomfort; severity=2; effect/response=prefer_support | wrist; wrist_extension_loading | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 9.300 | pain-audit-knee-control:under_challenges_development; demandReduction=not_relevant | 8.016 / 1 |
| unrelated discomfort | bodyweight-box-squat | legal | - | - | unrelated-wrist-during-squat-unrelated-discomfort; current_discomfort; severity=2; effect/response=prefer_support | wrist; wrist_extension_loading | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 9.300 | pain-audit-knee-control:under_challenges_development; demandReduction=not_relevant | 7.346 / 3 |

### Unrelated Knee Discomfort During Horizontal Pull

| State | Candidate | Outcome | Hard Rejection | Warning | Signal | Region / Tags | Matched Stress / Metadata Sources | Counts U/P/J | Pain Raw / Weighted | Joint Raw / Weighted | Stability | Assessment / Demand Reduction | Total / Rank |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| no pain baseline | machine-row | legal | - | - | -; none; severity=-; effect/response=- | -; - | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 8.500 | low-back-hinge-control-priority:neutral; demandReduction=not_relevant | 8.069 / 1 |
| no pain baseline | seated-cable-row | legal | - | - | -; none; severity=-; effect/response=- | -; - | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 8.500 | low-back-hinge-control-priority:neutral; demandReduction=not_relevant | 8.069 / 2 |
| no pain baseline | chest-supported-dumbbell-row | legal | - | - | -; none; severity=-; effect/response=- | -; - | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 8.500 | low-back-hinge-control-priority:under_challenges_development; demandReduction=not_relevant | 8.064 / 3 |
| no pain baseline | one-arm-dumbbell-row | legal | - | - | -; none; severity=-; effect/response=- | -; - | -; - | 0/0/0 | 8.200 / 0.607407 | 8.450 / 0.417284 | 7.200 | low-back-hinge-control-priority:exceeds_current_capability; demandReduction=not_relevant | 7.908 / 4 |
| unrelated discomfort | machine-row | legal | - | - | unrelated-knee-during-horizontal-pull-unrelated-discomfort; current_discomfort; severity=2; effect/response=prefer_support | knee; loaded_knee_flexion | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 9.300 | low-back-hinge-control-priority:neutral; demandReduction=not_relevant | 8.104 / 1 |
| unrelated discomfort | seated-cable-row | legal | - | - | unrelated-knee-during-horizontal-pull-unrelated-discomfort; current_discomfort; severity=2; effect/response=prefer_support | knee; loaded_knee_flexion | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 9.300 | low-back-hinge-control-priority:neutral; demandReduction=not_relevant | 8.104 / 2 |
| unrelated discomfort | chest-supported-dumbbell-row | legal | - | - | unrelated-knee-during-horizontal-pull-unrelated-discomfort; current_discomfort; severity=2; effect/response=prefer_support | knee; loaded_knee_flexion | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 9.300 | low-back-hinge-control-priority:under_challenges_development; demandReduction=not_relevant | 8.098 / 3 |
| unrelated discomfort | one-arm-dumbbell-row | legal | - | - | unrelated-knee-during-horizontal-pull-unrelated-discomfort; current_discomfort; severity=2; effect/response=prefer_support | knee; loaded_knee_flexion | -; - | 0/0/0 | 8.200 / 0.607407 | 8.450 / 0.417284 | 7.200 | low-back-hinge-control-priority:exceeds_current_capability; demandReduction=not_relevant | 7.908 / 4 |

### Unrelated Shoulder Discomfort During Hinge

| State | Candidate | Outcome | Hard Rejection | Warning | Signal | Region / Tags | Matched Stress / Metadata Sources | Counts U/P/J | Pain Raw / Weighted | Joint Raw / Weighted | Stability | Assessment / Demand Reduction | Total / Rank |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| no pain baseline | dumbbell-romanian-deadlift | legal | - | - | -; none; severity=-; effect/response=- | -; - | -; - | 0/0/0 | 8.200 / 0.607407 | 8.450 / 0.417284 | 8.500 | low-back-hinge-control-priority:exceeds_current_capability; demandReduction=not_relevant | 7.961 / 1 |
| no pain baseline | cable-pull-through | legal | - | - | -; none; severity=-; effect/response=- | -; - | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 8.500 | low-back-hinge-control-priority:develops_priority; demandReduction=not_relevant | 7.823 / 2 |
| unrelated discomfort | dumbbell-romanian-deadlift | legal | - | - | unrelated-shoulder-during-hinge-unrelated-discomfort; current_discomfort; severity=2; effect/response=prefer_support | shoulder; horizontal_pressing | -; - | 0/0/0 | 8.200 / 0.607407 | 8.450 / 0.417284 | 8.500 | low-back-hinge-control-priority:exceeds_current_capability; demandReduction=not_relevant | 7.961 / 1 |
| unrelated discomfort | cable-pull-through | legal | - | - | unrelated-shoulder-during-hinge-unrelated-discomfort; current_discomfort; severity=2; effect/response=prefer_support | shoulder; horizontal_pressing | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 8.500 | low-back-hinge-control-priority:develops_priority; demandReduction=not_relevant | 7.823 / 2 |

## Unrelated-Pain Finding

The unrelated pain examples have zero matched stress tags, no pain-suitability or joint-cost change, no warning, and no hard rejection. They are not fully neutral: `stability_fit` checks only whether any current/moderate record exists and adds `0.8` to every low-stability candidate. Therefore unrelated wrist discomfort raises the low-stability leg press and box squat, unrelated knee discomfort raises the low-stability machine/cable/chest-supported rows, and unrelated shoulder discomfort leaves the two moderate-stability hinge candidates unchanged. This global bonus can change totals and ordering despite no explicit shared stress fact.

## Component Ownership Audit

| Owner | Current Finding | Ownership Assessment |
| --- | --- | --- |
| Hard eligibility | Explicit exercise/stress contraindications and acute role/joint overlap reject before scoring. | Correct layer, but hard and acute stress universes differ and provenance/urgent flags are not traced. |
| Pain review warning | Moderate caution overlap emits a review warning. | Correct layer, but it ignores severity/requiredResponse and sees a narrower universe than scoring. |
| Pain suitability | Current/moderate/historical-sensitivity overlap compares legal candidates. | Correct primary owner for direct compatibility; missing matched-tag/source trace and unconsumed response semantics. |
| Joint cost | Joint/caution overlap, axial loading, and accumulated joint fatigue affect cost. | Correct owner for exposure, but duplicated joint/caution facts are charged twice and partially duplicate direct pain suitability. |
| Stability fit | Any current/moderate record globally rewards low stability. | Ownership leak: pain compatibility/support preference is asserted without relevance or support metadata. |
| Assessment/demand reduction | Region, stress context, current effect, and historical modification can change developmental relationship. | Scoped receiver is valid, but it cannot execute the requested pain response and treats actionable variants as equivalent. |
| Prescription | Not implemented in Candidate Intelligence. | Future owner for load, range, support, tempo, effort, and volume actions. |
| Session Composer | Not implemented and not started. | Future owner for role substitution, ordering, accumulated stress, replacement context, and session redirection. |

The same pain signal currently reaches pain suitability and joint cost through overlapping stress evidence, and can also trigger a global stability bonus plus assessment influence. Multiple receivers are not inherently wrong, but each needs a distinct semantic quantity. Current duplicate source counting and the unscoped stability bonus do not establish that distinction.

## Required-Response Ownership Options

### avoid_aggravator

- Candidate hard gate: appropriate only if the input contract explicitly elevates matched exposure to prohibited truth. Risk: a broad stress tag or self-reported response becomes indistinguishable from a hard contraindication.
- Strong candidate demotion plus unresolved requirement: preserves legal alternatives while making the concern visible. Risk: a legal winner may still be unusable if no downstream layer can satisfy avoidance.
- Prescription/session instruction: appropriate when aggravation can be avoided through range, setup, load, or replacement context. Risk: Candidate Intelligence cannot prove executability today.

No current authority establishes one universal choice. Candidate Intelligence should at minimum emit a structured matched response requirement with execution status rather than silently treating the field as absent.

### reduce_load_and_range

Primary future receiver is prescription because load and range modify the selected exercise. Candidate ranking may still account for whether a candidate can truthfully support those modifications. Risk: a ranking penalty without a prescription requirement loses the requested action; automatic modification without validated prescription capabilities invents safety certainty.

### substitute_role

Primary future receiver is Session Intent / Session Composer because isolated candidate scoring cannot replace a requested role while preserving session purpose and coverage. Candidate Intelligence should emit `deferred/unexecutable_at_candidate_layer` with the matched signal and requested response. Risk: letting one candidate component substitute roles would bypass training-need truth; ignoring it lets the original role proceed without the requested redirection.

## Human Exercise-Science Review

The following are **HUMAN_EXERCISE_SCIENCE_REVIEW** questions, not conclusions encoded by this audit:

- Should severity 3 and severity 6 be identical once stress overlap and required response are held constant?
- Should severity influence use linear scaling, categorical bands, response-based policy, or a combination?
- Should severity affect relative pain suitability, review urgency, prescription requirements, or all three with separate bounds?
- Is pain intensity alone ever sufficient for hard exclusion, or must hard exclusion require an explicit role/stress prohibition or contraindication source?
- Should `requiredResponse` and specific stress overlap carry more authority than the raw severity number?
- Are joint exposure and caution annotation genuinely distinct cost evidence when they repeat the same tag, and if so what explicit units distinguish them?
- When pain is unrelated to candidate stress, should low stability receive any generic preference, or must support preference be signal- and mechanics-specific?

## Findings By Priority

### P0

- None. Explicit hard contraindications remain hard, legal candidates cannot score through a hard rejection, behavior is deterministic, and no diagnostic inference was found.

### P1

- Define one canonical, source-aware stress-match contract before tuning pain or joint coefficients. Warning, pain suitability, joint cost, hard contraindication, and acute/severe eligibility currently consume different universes.
- Remove or explicitly justify actual duplicate charging of the same joint/caution stress tag in `joint_cost`; coefficient calibration cannot compensate for an unsettled counting unit.
- Consume or explicitly defer `ModeratePain.requiredResponse`; current traces cannot distinguish avoidance, load/range reduction, and role substitution.
- Scope the pain-driven `stability_fit` effect to relevant evidence and an owned semantic quantity; unrelated pain currently changes low-stability candidate totals without shared stress.
- Establish a human-reviewed moderate-severity policy only after the match/count/response contracts are fixed. Severity 3 through 6 are currently identical.
- Preserve acute review/provenance truth in structured output: `urgentReviewRecommended` and hard-contraindication `source` currently disappear, while acute and hard stress matching differ.

### P2

- Decide whether and how `HistoricalInjury` should influence Candidate Intelligence; every field is currently unused and invisible.
- Add native matched pain tag, metadata source, unique fact count, and counted overlap to traces so audit tooling does not need to reconstruct them.
- Decide whether current effect and historical modification variants need distinct candidate observability even when execution belongs to prescription.
- Validate or normalize duplicate tags and duplicate same-kind pain signals at the input boundary if they are not intended to stack.

## Blueprint Maintenance

No blueprint amendment is made. The authoritative blueprint already separates pain categories, eligibility, ranking, prescription, composition, and progression; it also prohibits diagnosis. Current formulas, duplicate-count findings, unconsumed fields, and calibration questions are implementation-review evidence rather than new enduring architecture.

## Recommended Targeted Implementation Boundary

Before any calibration values change, add a deterministic source-aware `PainMatchTrace` (exact name open) that derives one canonical set of matched stress facts per candidate and records signal ID/kind, severity, region, matched tag, metadata source, unique fact count, receiver-specific counted units, required response, and execution/defer status. Reuse that evidence in warning, pain suitability, joint cost, hard/acute matching, stability relevance, and assessment context while preserving each layer's distinct authority.

Then make the smallest contract fixes: resolve the joint/caution duplicate unit; scope or remove the unrelated global stability bonus; emit `requiredResponse` and urgent/provenance requirements to the correct future receiver without implementing Session Composer or prescription. Only after those contracts are tested should human review choose severity categories and calibrate pain/joint coefficients.

This boundary does not authorize ranking-weight changes, exercise-science calibration, automatic role substitution, Session Composer, prescription, or medical diagnosis.
