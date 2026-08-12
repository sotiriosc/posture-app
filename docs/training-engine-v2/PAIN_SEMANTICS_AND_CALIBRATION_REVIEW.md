# Pain Semantics And Calibration Review

Audit baseline: `1449d46e122cadd8a445e07365c242983afa64eb` on `engine-v2/candidate-intelligence`.

Scope: post-contract deterministic evidence. Pain/joint coefficients, exercise metadata, phase values, component weights, severity calibration, prescription, and Session Composer remain unchanged. Training Engine V2 consumes normalized training inputs and does not diagnose injury or disease.

## Audit Result

Candidate pain decisions now derive from one deterministic, source-aware evidence set. Receiver policies retain independent warning, scoring, hard-authority, acute-authority, assessment-context, and deferred-response responsibilities. Joint/caution provenance no longer multiplies one physiological match unit, and stability fit no longer reads pain.

Final state: **PAIN_CONTRACT_READY**

Post-contract controlled-scenario ranking fingerprint: `237de4c80d45c1da2bd60b88e624ccd5ba08d32a9f58d36241e52d1ca47fc118` (matches the reviewed post-contract fixture).

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
| HistoricalSensitivity.kind | athlete/coach adapter | canonical signal kind | pain trace and receiver policies | selects owned receiver policies without changing coefficient magnitude | native signal trace | FULLY USED |
| HistoricalSensitivity.id | athlete/coach adapter | canonical match identity, score reason, response and assessment evidence | pain receivers, demandReductionContext, row diagnostics | keeps distinct signals separately traceable | native signal/match/response trace | FULLY USED |
| HistoricalSensitivity.region | athlete/coach adapter | canonical signal trace and assessment context | pain trace and developmentalRelationship | can scope a non-monitor modification to an assessment/candidate context | native signal and assessment trace | FULLY USED |
| HistoricalSensitivity.stressTags | athlete/coach adapter | canonical matches, pain_suitability, joint_cost, assessment context | pain receiver policies and assessment trace | 0.4 per unique signal/tag pain unit; 0.35 per qualifying unique joint unit; may justify demand reduction | native matched tag/source and receiver counts | FULLY USED |
| HistoricalSensitivity.preferredModification | athlete/coach adapter | structured response requirement and exact assessment action | response ownership and developmentalRelationship | monitor is observation-only; other actions are explicitly deferred to their future owner | native response and assessment trace | FULLY USED |
| HistoricalSensitivity.description | athlete/coach adapter | none | none | none | absent | UNUSED |
| CurrentDiscomfort.kind | athlete/assessment adapter | canonical signal kind | pain trace and receiver policies | selects owned receiver policies without changing coefficient magnitude | native signal trace | FULLY USED |
| CurrentDiscomfort.id | athlete/assessment adapter | canonical match identity, score reason, response and assessment evidence | pain receivers, demandReductionContext, row diagnostics | keeps distinct signals separately traceable | native signal/match/response trace | FULLY USED |
| CurrentDiscomfort.severity0To10 | athlete/assessment adapter | canonical signal and match severity | trace consumers | severity 1 and 2 remain numerically identical pending calibration | native signal/match/eligibility trace | PARTIALLY USED |
| CurrentDiscomfort.region | athlete/assessment adapter | canonical signal trace, capability adjustment, and scoped assessment context | pain trace, athleteCapability, developmentalRelationship | matching assessment-signal region applies existing capability context and may establish demand-reduction relevance | native signal and assessment trace | FULLY USED |
| CurrentDiscomfort.stressTags | athlete/assessment adapter | canonical matches, pain_suitability, joint_cost, assessment context | pain receiver policies and assessment trace | 0.9 per unique signal/tag pain unit; 0.8 per qualifying unique joint unit; may justify demand reduction | native matched tag/source and receiver counts | FULLY USED |
| CurrentDiscomfort.effect | athlete/assessment adapter | structured response requirement and exact assessment action | response ownership and developmentalRelationship | monitor is observation-only; support/range/load actions are explicitly deferred and not scored | native response and assessment trace | FULLY USED |
| CurrentDiscomfort.description | athlete/assessment adapter | none | none | none | absent | UNUSED |
| ModeratePain.kind | athlete/assessment adapter | canonical signal kind | pain trace and receiver policies | selects warning, suitability, joint, and assessment receiver policies | native signal trace | FULLY USED |
| ModeratePain.id | athlete/assessment adapter | canonical match identity, warning, score, response, and assessment evidence | pain receivers, demandReductionContext, row diagnostics | emits at most one warning per signal/candidate and keeps distinct signals traceable | native signal/match/eligibility/response trace | FULLY USED |
| ModeratePain.severity0To10 | athlete/assessment adapter | canonical signal, match, and warning severity | trace consumers | severity 3 through 6 remain numerically identical pending calibration | native signal/match/eligibility trace | PARTIALLY USED |
| ModeratePain.region | athlete/assessment adapter | canonical signal trace, capability adjustment, and scoped assessment context | pain trace, athleteCapability, developmentalRelationship | matching assessment-signal region applies existing capability context and can establish assessment relevance | native signal and assessment trace | FULLY USED |
| ModeratePain.stressTags | athlete/assessment adapter | canonical warning, pain_suitability, joint_cost, and assessment matches | pain receiver policies and assessment trace | warning on any structured source; 1.8 per unique signal/tag pain unit; 1.4 per qualifying unique joint unit | native matched tag/source and receiver counts | FULLY USED |
| ModeratePain.requiredResponse | athlete/assessment adapter | structured response requirement and exact assessment action | candidate review, prescription, or Session Intent / Session Composer | numeric scores remain identical; ownership and deferred execution status differ | native response, warning, and assessment trace | FULLY USED |
| ModeratePain.description | athlete/assessment adapter | warning message | painReviewEligibility | changes warning prose only | warning message | FULLY USED |
| AcuteSeverePain.kind | athlete/assessment adapter | canonical signal kind | acute eligibility and response trace | selects the explicit acute authority filter | native signal trace | FULLY USED |
| AcuteSeverePain.id | athlete/assessment adapter | canonical match, rejection, urgency, and response evidence | acute eligibility and DecisionTrace | identifies rejection and unresolved urgency evidence | native signal/match/eligibility/response trace | FULLY USED |
| AcuteSeverePain.severity0To10 | athlete/assessment adapter | canonical signal, match, and eligibility severity | trace consumers | severity 7 through 10 remain identical under the preserved acute authority filter | native signal/match/eligibility trace | PARTIALLY USED |
| AcuteSeverePain.region | athlete/assessment adapter | canonical signal and match region | trace consumers | observability only at Candidate Intelligence scope | native signal/match trace | PARTIALLY USED |
| AcuteSeverePain.stressTags | athlete/assessment adapter | canonical matched facts and explicit acute criterion | acute eligibility | rejects only when a canonical match has joint_stress provenance; caution/contraindicated-only remains legal | native matched tag/source and criterion | FULLY USED |
| AcuteSeverePain.invalidatesTrainingRoles | athlete/assessment adapter | hard rejection criterion | acute eligibility | rejects candidates evaluated for an explicitly invalidated requested role | native training-role criterion | FULLY USED |
| AcuteSeverePain.urgentReviewRecommended | athlete/assessment adapter | structured urgent-review requirement | DecisionTrace and external urgent review | preserved whether the candidate is legal or already rejected | native signal and response trace | FULLY USED |
| AcuteSeverePain.description | athlete/assessment adapter | hard-rejection message | contraindicationEligibility | changes rejection prose only | rejection message | FULLY USED |
| HardContraindication.kind | athlete/clinician/coach/safety adapter | canonical signal kind | hard eligibility | selects explicit hard authority | native signal trace | FULLY USED |
| HardContraindication.id | athlete/clinician/coach/safety adapter | canonical match and rejection identity | hard eligibility and DecisionTrace | identifies exact hard criteria | native signal/match/eligibility trace | FULLY USED |
| HardContraindication.region | athlete/clinician/coach/safety adapter | none | none | none | absent | UNUSED |
| HardContraindication.exerciseIds | athlete/clinician/coach/safety adapter | hard rejection | hard eligibility | exact exercise ID match rejects | native exercise-ID criterion | FULLY USED |
| HardContraindication.stressTags | athlete/clinician/coach/safety adapter | canonical matched facts and hard criterion | hard eligibility | joint_stress or contraindicated provenance rejects; caution-only does not | native matched tag/source and criterion | FULLY USED |
| HardContraindication.reason | athlete/clinician/coach/safety adapter | hard-rejection message | contraindicationEligibility | changes rejection prose only | rejection message | FULLY USED |
| HardContraindication.source | athlete/clinician/coach/safety adapter | hard authority provenance | eligibility evidence and DecisionTrace | does not change rejection magnitude; preserves who supplied the authority | native signal and criterion trace | FULLY USED |
| PersonalExerciseBlock.kind | athlete/coach | none | none | collection membership supplies the category | input only | UNUSED |
| PersonalExerciseBlock.id | athlete/coach | rejection evidence | personalBlockEligibility | identifies block evidence | rejection evidence | FULLY USED |
| PersonalExerciseBlock.exerciseIds | athlete/coach | hard preference rejection | personalBlockEligibility | exact exercise ID match rejects | block ID, not matched criterion | FULLY USED |
| PersonalExerciseBlock.exerciseFamilies | athlete/coach | hard preference rejection | personalBlockEligibility | exercise-family match rejects | block ID, not matched criterion | FULLY USED |
| PersonalExerciseBlock.reason | athlete/coach | rejection message | personalBlockEligibility | changes rejection prose only | rejection message | FULLY USED |
| PersonalExerciseBlock.createdBy | athlete/coach | none; output source is athlete_preference | none | athlete and coach are identical | absent | UNUSED |

Key field conclusions:

- Every `HistoricalInjury` field is currently dead input for Candidate Intelligence.
- Current and moderate severity values are visible in native trace output but still do not scale candidate scores; that policy remains for human calibration.
- `ModeratePain.requiredResponse`, `AcuteSeverePain.urgentReviewRecommended`, and `HardContraindication.source` are preserved in structured response or eligibility evidence.
- Region remains structured assessment context; side is explicit as unknown for current matchable signal types and `HistoricalInjury.side` remains unconsumed.
- Current effect and historical preferred modification retain their exact action and truthful observation/deferred ownership status without changing score magnitude.

## Current Decision Pipeline

```text
pain/injury input
  -> canonical source-aware candidate pain facts
  -> explicit receiver policies and response ownership
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
| pain/injury input | typed PainAndInjuryState collections | HistoricalInjury remains intentionally unconsumed | no | no | no | upstream owns observation/normalization and diagnosis; V2 does not diagnose |
| canonical pain evidence | pain signal IDs/kinds/regions/severity/actions/tags plus structured exercise stress metadata | exercise ID/name/prose/equipment as inferred stress | no | no | no | creates one deterministic signalId+stressTag fact with source provenance |
| hard contraindication eligibility | exact exercise IDs or canonical hard stress matches through joint_stress/contraindicated provenance | caution-only hard overlap | yes | no | no | preserves athlete_report/clinician/coach/safety_rule authority |
| acute/severe eligibility | requested-role invalidation or canonical joint_stress match | caution-only and contraindicated-only matches as hard authority | yes | no | no | urgent review remains structured and unresolved even when candidate is legal or rejected |
| moderate-pain warning | canonical moderate matches from any structured stress source | none of the structured source types | no | yes | no | one warning per signal/candidate includes response ownership and execution status |
| pain_suitability | unique current/moderate/historical signal-tag facts from every structured source | severity/action as score magnitude; HistoricalInjury; acute/hard signals | no | reason code only | yes | relative compatibility among legal candidates |
| joint_cost | unique owned facts with joint_stress or caution provenance; axial loading; joint accumulation | contraindicated-only facts as cost units; severity/action as score magnitude | no | reason code only | yes | session-level accumulation remains future composition work |
| stability_fit | exercise stability demand and phase target | all pain inputs | no | no | yes | pain-related support preference belongs to an explicit future receiver |
| assessment demand/capability | canonical stress facts plus independent structured region/movement context and exact requested actions | HistoricalInjury and unmodeled side | no | no | indirectly through assessment/alignment when relevant | does not execute load/range/support or role substitution |
| candidate aggregate / trace | legal candidates, receiver counts, structured eligibility evidence, and response requirements | rejected-candidate score values | already decided upstream | eligibility warnings retained | weighted mean | prescription, composition, and progression receivers remain unimplemented |

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

Severity 3, 4, 5, and 6 produce identical warning state, pain suitability, joint cost, stability fit, assessment/alignment values, totals, and ranks for otherwise identical low-back hinge requests. The supplied severity remains visible in canonical, warning, and score-component evidence; scaling is intentionally deferred.

| Variant | Candidate | Warning | Pain | Joint | Stability | Assessment | Alignment | Capability | Relationship / Reduction | Total / Rank |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 3 | dumbbell-romanian-deadlift | PAIN_REQUIRES_REVIEW | 6.400 | 7.050 | 8.500 | 5.881 | 5.920 | 1.350 | exceeds_current_capability / relevant | 7.759 / 1 |
| 3 | cable-pull-through | PAIN_REQUIRES_REVIEW | 6.400 | 7.400 | 8.500 | 6.127 | 6.084 | 1.350 | develops_priority / relevant | 7.620 / 2 |
| 4 | dumbbell-romanian-deadlift | PAIN_REQUIRES_REVIEW | 6.400 | 7.050 | 8.500 | 5.881 | 5.920 | 1.350 | exceeds_current_capability / relevant | 7.759 / 1 |
| 4 | cable-pull-through | PAIN_REQUIRES_REVIEW | 6.400 | 7.400 | 8.500 | 6.127 | 6.084 | 1.350 | develops_priority / relevant | 7.620 / 2 |
| 5 | dumbbell-romanian-deadlift | PAIN_REQUIRES_REVIEW | 6.400 | 7.050 | 8.500 | 5.881 | 5.920 | 1.350 | exceeds_current_capability / relevant | 7.759 / 1 |
| 5 | cable-pull-through | PAIN_REQUIRES_REVIEW | 6.400 | 7.400 | 8.500 | 6.127 | 6.084 | 1.350 | develops_priority / relevant | 7.620 / 2 |
| 6 | dumbbell-romanian-deadlift | PAIN_REQUIRES_REVIEW | 6.400 | 7.050 | 8.500 | 5.881 | 5.920 | 1.350 | exceeds_current_capability / relevant | 7.759 / 1 |
| 6 | cable-pull-through | PAIN_REQUIRES_REVIEW | 6.400 | 7.400 | 8.500 | 6.127 | 6.084 | 1.350 | develops_priority / relevant | 7.620 / 2 |

## Required Response Contrast

`avoid_aggravator`, `reduce_load_and_range`, and `substitute_role` remain numerically identical, but their structured requirements now identify candidate review, prescription, and Session Intent / Session Composer ownership respectively. None is falsely reported as executed.

| Variant | Candidate | Warning | Pain | Joint | Stability | Assessment | Alignment | Capability | Relationship / Reduction | Total / Rank |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| avoid_aggravator | dumbbell-romanian-deadlift | PAIN_REQUIRES_REVIEW | 6.400 | 7.050 | 8.500 | 5.881 | 5.920 | 1.350 | exceeds_current_capability / relevant | 7.759 / 1 |
| avoid_aggravator | cable-pull-through | PAIN_REQUIRES_REVIEW | 6.400 | 7.400 | 8.500 | 6.127 | 6.084 | 1.350 | develops_priority / relevant | 7.620 / 2 |
| reduce_load_and_range | dumbbell-romanian-deadlift | PAIN_REQUIRES_REVIEW | 6.400 | 7.050 | 8.500 | 5.881 | 5.920 | 1.350 | exceeds_current_capability / relevant | 7.759 / 1 |
| reduce_load_and_range | cable-pull-through | PAIN_REQUIRES_REVIEW | 6.400 | 7.400 | 8.500 | 6.127 | 6.084 | 1.350 | develops_priority / relevant | 7.620 / 2 |
| substitute_role | dumbbell-romanian-deadlift | PAIN_REQUIRES_REVIEW | 6.400 | 7.050 | 8.500 | 5.881 | 5.920 | 1.350 | exceeds_current_capability / relevant | 7.759 / 1 |
| substitute_role | cable-pull-through | PAIN_REQUIRES_REVIEW | 6.400 | 7.400 | 8.500 | 6.127 | 6.084 | 1.350 | develops_priority / relevant | 7.620 / 2 |

## Current Discomfort Effect Contrast

Pain suitability, joint cost, stability fit, and capability ignore the effect value as score magnitude. `monitor` is observation-only; `prefer_support`, `reduce_range`, and `reduce_load` preserve distinct actions and deferred owners. Actionable values can still establish the existing scoped assessment context but are not executed here.

| Variant | Candidate | Warning | Pain | Joint | Stability | Assessment | Alignment | Capability | Relationship / Reduction | Total / Rank |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| monitor | goblet-squat | none | 7.300 | 8.000 | 8.500 | 5.874 | 5.916 | 2.550 | under_challenges_development / not_relevant | 7.599 / 1 |
| prefer_support | goblet-squat | none | 7.300 | 8.000 | 8.500 | 6.162 | 6.108 | 2.550 | reduces_excess_demand / relevant | 7.625 / 1 |
| reduce_range | goblet-squat | none | 7.300 | 8.000 | 8.500 | 6.162 | 6.108 | 2.550 | reduces_excess_demand / relevant | 7.625 / 1 |
| reduce_load | goblet-squat | none | 7.300 | 8.000 | 8.500 | 6.162 | 6.108 | 2.550 | reduces_excess_demand / relevant | 7.625 / 1 |

## Historical Modification Contrast

Pain suitability and joint cost ignore preferred modification as score magnitude. `monitor` remains observation-only; `increase_support`, `reduce_range`, and `reduce_load` retain distinct structured actions and truthful deferred owners while preserving existing assessment-context semantics.

| Variant | Candidate | Warning | Pain | Joint | Stability | Assessment | Alignment | Capability | Relationship / Reduction | Total / Rank |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| monitor | goblet-squat | none | 7.800 | 8.450 | 8.500 | 5.874 | 5.916 | 2.700 | under_challenges_development / not_relevant | 7.658 / 1 |
| increase_support | goblet-squat | none | 7.800 | 8.450 | 8.500 | 6.162 | 6.108 | 2.700 | reduces_excess_demand / relevant | 7.685 / 1 |
| reduce_range | goblet-squat | none | 7.800 | 8.450 | 8.500 | 6.162 | 6.108 | 2.700 | reduces_excess_demand / relevant | 7.685 / 1 |
| reduce_load | goblet-squat | none | 7.800 | 8.450 | 8.500 | 6.162 | 6.108 | 2.700 | reduces_excess_demand / relevant | 7.685 / 1 |

## Region And Side Contrast

With identical stress tags, pain suitability, joint cost, warning behavior, stability fit, totals, and ranks do not change by region. Region can still change the generic assessment capability trace (`-0.35` moderate or `-0.15` current when the pain region equals the assessment-signal region), and can establish demand-reduction context when no stress overlap exists. `HistoricalInjury.side` has no receiver and produces no trace or score difference.

| Contrast | Variant | Candidate | Pain | Joint | Stability | Capability | Relationship | Total / Rank |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| same stress tags, different region | lumbar_spine | cable-pull-through | 6.400 | 7.400 | 8.500 | 1.350 | develops_priority | 7.620 / 1 |
| same stress tags, different region | shoulder | cable-pull-through | 6.400 | 7.400 | 8.500 | 1.700 | develops_priority | 7.620 / 1 |
| same historical injury, different side | left | cable-pull-through | 8.200 | 8.800 | 8.500 | 1.700 | develops_priority | 7.823 / 1 |
| same historical injury, different side | right | cable-pull-through | 8.200 | 8.800 | 8.500 | 1.700 | develops_priority | 7.823 / 1 |

## Stress-Tag Source And Counting Audit

| Receiver | loading.jointStressTags | cautionStressTags | contraindicatedStressTags | Deduplication |
| --- | --- | --- | --- | --- |
| moderate warning | read | read | read | one warning per signal/candidate; canonical signal-tag facts retain every source |
| pain_suitability | read | read | read | one unit per signalId+stressTag regardless of source count or duplicate tag occurrence |
| joint_cost | read | read | visible, not counted alone | one unit per qualifying signalId+stressTag even when joint and caution both establish it |
| hard contraindication | read | visible, not authority alone | read | canonical facts plus exact exercise-ID criteria; authority source retained |
| acute/severe eligibility | read | visible, not authority alone | visible, not authority alone | canonical facts; requested-role invalidation remains independent hard authority |
| assessment demand-reduction context | read | read | read | canonical stress facts; region and movement context remain independent structured matches |

The canonical unit is `signalId + stressTag`. Duplicate tag occurrences within one signal and duplicate exercise metadata sources do not multiply that fact; all matching sources remain visible as provenance. Distinct signal IDs remain distinct evidence.

Across the required representative exercises, 13 exercise/tag rows are classified `RESOLVED_SOURCE_DEDUPLICATION`: every one now has one pain-suitability unit and one joint-cost unit despite joint+caution provenance.

| Exercise | Tag | Metadata Sources | Unique Facts | Pain Count | Joint Count | Moderate Warning | Hard Contra | Acute/Severe | Classification |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| push-up | horizontal_pressing | loading.jointStressTags + cautionStressTags | 1 | 1 | 1 | warning | reject | reject | RESOLVED_SOURCE_DEDUPLICATION |
| push-up | wrist_extension_loading | loading.jointStressTags + cautionStressTags | 1 | 1 | 1 | warning | reject | reject | RESOLVED_SOURCE_DEDUPLICATION |
| dumbbell-bench-press | horizontal_pressing | loading.jointStressTags + cautionStressTags | 1 | 1 | 1 | warning | reject | reject | RESOLVED_SOURCE_DEDUPLICATION |
| machine-chest-press | horizontal_pressing | loading.jointStressTags + cautionStressTags | 1 | 1 | 1 | warning | reject | reject | RESOLVED_SOURCE_DEDUPLICATION |
| dumbbell-romanian-deadlift | grip_intensive | loading.jointStressTags | 1 | 1 | 1 | warning | reject | reject | NOT_APPLICABLE |
| dumbbell-romanian-deadlift | loaded_hinge | loading.jointStressTags + cautionStressTags | 1 | 1 | 1 | warning | reject | reject | RESOLVED_SOURCE_DEDUPLICATION |
| cable-pull-through | loaded_hinge | loading.jointStressTags + cautionStressTags | 1 | 1 | 1 | warning | reject | reject | RESOLVED_SOURCE_DEDUPLICATION |
| one-arm-dumbbell-row | grip_intensive | loading.jointStressTags + cautionStressTags | 1 | 1 | 1 | warning | reject | reject | RESOLVED_SOURCE_DEDUPLICATION |
| goblet-squat | deep_knee_flexion | loading.jointStressTags + cautionStressTags | 1 | 1 | 1 | warning | reject | reject | RESOLVED_SOURCE_DEDUPLICATION |
| goblet-squat | loaded_knee_flexion | loading.jointStressTags + cautionStressTags | 1 | 1 | 1 | warning | reject | reject | RESOLVED_SOURCE_DEDUPLICATION |
| leg-press | deep_knee_flexion | loading.jointStressTags | 1 | 1 | 1 | warning | reject | reject | NOT_APPLICABLE |
| leg-press | loaded_knee_flexion | loading.jointStressTags + cautionStressTags | 1 | 1 | 1 | warning | reject | reject | RESOLVED_SOURCE_DEDUPLICATION |
| split-squat | deep_knee_flexion | loading.jointStressTags + cautionStressTags | 1 | 1 | 1 | warning | reject | reject | RESOLVED_SOURCE_DEDUPLICATION |
| split-squat | loaded_knee_flexion | loading.jointStressTags + cautionStressTags | 1 | 1 | 1 | warning | reject | reject | RESOLVED_SOURCE_DEDUPLICATION |
| step-up | loaded_knee_flexion | loading.jointStressTags + cautionStressTags | 1 | 1 | 1 | warning | reject | reject | RESOLVED_SOURCE_DEDUPLICATION |

### Contraindicated-Only Probe

A synthetic exercise with `high_impact` only in `contraindicatedStressTags` proves the source roles: current discomfort gives pain suitability 7.300; joint cost remains 8.800; moderate warning is present; an explicit hard contraindication rejects; acute/severe stress overlap does not reject. Thus contraindicated tags affect soft pain suitability and explicit hard-contraindication matching, but are neither an automatic hard gate nor part of acute/severe matching or joint cost.

Moderate warning now observes canonical matches from joint, caution, and contraindicated sources and emits at most one warning per signal/candidate. Hard and acute receivers intentionally keep narrower authority filters, and the trace identifies both matched and qualifying sources.

## Controlled Pain Matrix

Counts are `U/P/J`: canonical unique matched facts, units counted by pain suitability, and units counted by joint cost. Weighted values use the unchanged 18-component denominator. Acute/severe signals use stress overlap with an empty `invalidatesTrainingRoles` list so the table isolates receiver authority; hard contraindications use stress tags rather than exercise IDs.

### Shoulder Horizontal Push

| State | Candidate | Outcome | Hard Rejection | Warning | Signal | Region / Tags | Matched Stress / Metadata Sources | Counts U/P/J | Pain Raw / Weighted | Joint Raw / Weighted | Stability | Assessment / Demand Reduction | Total / Rank |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| no pain | push-up | legal | - | - | -; none; severity=-; effect/response=- | -; - | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 7.200 | not_present | 7.793 / 2 |
| no pain | dumbbell-bench-press | legal | - | - | -; none; severity=-; effect/response=- | -; - | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 7.200 | not_present | 7.643 / 3 |
| no pain | machine-chest-press | legal | - | - | -; none; severity=-; effect/response=- | -; - | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 8.500 | not_present | 7.815 / 1 |
| discomfort severity 1 | push-up | legal | - | - | shoulder-horizontal-push-pain-discomfort-1; current_discomfort; severity=1; effect/response=prefer_support | shoulder; horizontal_pressing | horizontal_pressing; horizontal_pressing:loading.jointStressTags+cautionStressTags | 1/1/1 | 7.300 / 0.540741 | 8.000 / 0.395062 | 7.200 | not_present | 7.686 / 2 |
| discomfort severity 1 | dumbbell-bench-press | legal | - | - | shoulder-horizontal-push-pain-discomfort-1; current_discomfort; severity=1; effect/response=prefer_support | shoulder; horizontal_pressing | horizontal_pressing; horizontal_pressing:loading.jointStressTags+cautionStressTags | 1/1/1 | 7.300 / 0.540741 | 8.000 / 0.395062 | 7.200 | not_present | 7.537 / 3 |
| discomfort severity 1 | machine-chest-press | legal | - | - | shoulder-horizontal-push-pain-discomfort-1; current_discomfort; severity=1; effect/response=prefer_support | shoulder; horizontal_pressing | horizontal_pressing; horizontal_pressing:loading.jointStressTags+cautionStressTags | 1/1/1 | 7.300 / 0.540741 | 8.000 / 0.395062 | 8.500 | not_present | 7.709 / 1 |
| discomfort severity 2 | push-up | legal | - | - | shoulder-horizontal-push-pain-discomfort-2; current_discomfort; severity=2; effect/response=prefer_support | shoulder; horizontal_pressing | horizontal_pressing; horizontal_pressing:loading.jointStressTags+cautionStressTags | 1/1/1 | 7.300 / 0.540741 | 8.000 / 0.395062 | 7.200 | not_present | 7.686 / 2 |
| discomfort severity 2 | dumbbell-bench-press | legal | - | - | shoulder-horizontal-push-pain-discomfort-2; current_discomfort; severity=2; effect/response=prefer_support | shoulder; horizontal_pressing | horizontal_pressing; horizontal_pressing:loading.jointStressTags+cautionStressTags | 1/1/1 | 7.300 / 0.540741 | 8.000 / 0.395062 | 7.200 | not_present | 7.537 / 3 |
| discomfort severity 2 | machine-chest-press | legal | - | - | shoulder-horizontal-push-pain-discomfort-2; current_discomfort; severity=2; effect/response=prefer_support | shoulder; horizontal_pressing | horizontal_pressing; horizontal_pressing:loading.jointStressTags+cautionStressTags | 1/1/1 | 7.300 / 0.540741 | 8.000 / 0.395062 | 8.500 | not_present | 7.709 / 1 |
| moderate severity 3 | push-up | legal | - | PAIN_REQUIRES_REVIEW:shoulder-horizontal-push-pain-moderate-3 | shoulder-horizontal-push-pain-moderate-3; moderate_pain; severity=3; effect/response=avoid_aggravator | shoulder; horizontal_pressing | horizontal_pressing; horizontal_pressing:loading.jointStressTags+cautionStressTags | 1/1/1 | 6.400 / 0.474074 | 7.400 / 0.365432 | 7.200 | not_present | 7.590 / 2 |
| moderate severity 3 | dumbbell-bench-press | legal | - | PAIN_REQUIRES_REVIEW:shoulder-horizontal-push-pain-moderate-3 | shoulder-horizontal-push-pain-moderate-3; moderate_pain; severity=3; effect/response=avoid_aggravator | shoulder; horizontal_pressing | horizontal_pressing; horizontal_pressing:loading.jointStressTags+cautionStressTags | 1/1/1 | 6.400 / 0.474074 | 7.400 / 0.365432 | 7.200 | not_present | 7.441 / 3 |
| moderate severity 3 | machine-chest-press | legal | - | PAIN_REQUIRES_REVIEW:shoulder-horizontal-push-pain-moderate-3 | shoulder-horizontal-push-pain-moderate-3; moderate_pain; severity=3; effect/response=avoid_aggravator | shoulder; horizontal_pressing | horizontal_pressing; horizontal_pressing:loading.jointStressTags+cautionStressTags | 1/1/1 | 6.400 / 0.474074 | 7.400 / 0.365432 | 8.500 | not_present | 7.612 / 1 |
| moderate severity 4 | push-up | legal | - | PAIN_REQUIRES_REVIEW:shoulder-horizontal-push-pain-moderate-4 | shoulder-horizontal-push-pain-moderate-4; moderate_pain; severity=4; effect/response=avoid_aggravator | shoulder; horizontal_pressing | horizontal_pressing; horizontal_pressing:loading.jointStressTags+cautionStressTags | 1/1/1 | 6.400 / 0.474074 | 7.400 / 0.365432 | 7.200 | not_present | 7.590 / 2 |
| moderate severity 4 | dumbbell-bench-press | legal | - | PAIN_REQUIRES_REVIEW:shoulder-horizontal-push-pain-moderate-4 | shoulder-horizontal-push-pain-moderate-4; moderate_pain; severity=4; effect/response=avoid_aggravator | shoulder; horizontal_pressing | horizontal_pressing; horizontal_pressing:loading.jointStressTags+cautionStressTags | 1/1/1 | 6.400 / 0.474074 | 7.400 / 0.365432 | 7.200 | not_present | 7.441 / 3 |
| moderate severity 4 | machine-chest-press | legal | - | PAIN_REQUIRES_REVIEW:shoulder-horizontal-push-pain-moderate-4 | shoulder-horizontal-push-pain-moderate-4; moderate_pain; severity=4; effect/response=avoid_aggravator | shoulder; horizontal_pressing | horizontal_pressing; horizontal_pressing:loading.jointStressTags+cautionStressTags | 1/1/1 | 6.400 / 0.474074 | 7.400 / 0.365432 | 8.500 | not_present | 7.612 / 1 |
| moderate severity 5 | push-up | legal | - | PAIN_REQUIRES_REVIEW:shoulder-horizontal-push-pain-moderate-5 | shoulder-horizontal-push-pain-moderate-5; moderate_pain; severity=5; effect/response=avoid_aggravator | shoulder; horizontal_pressing | horizontal_pressing; horizontal_pressing:loading.jointStressTags+cautionStressTags | 1/1/1 | 6.400 / 0.474074 | 7.400 / 0.365432 | 7.200 | not_present | 7.590 / 2 |
| moderate severity 5 | dumbbell-bench-press | legal | - | PAIN_REQUIRES_REVIEW:shoulder-horizontal-push-pain-moderate-5 | shoulder-horizontal-push-pain-moderate-5; moderate_pain; severity=5; effect/response=avoid_aggravator | shoulder; horizontal_pressing | horizontal_pressing; horizontal_pressing:loading.jointStressTags+cautionStressTags | 1/1/1 | 6.400 / 0.474074 | 7.400 / 0.365432 | 7.200 | not_present | 7.441 / 3 |
| moderate severity 5 | machine-chest-press | legal | - | PAIN_REQUIRES_REVIEW:shoulder-horizontal-push-pain-moderate-5 | shoulder-horizontal-push-pain-moderate-5; moderate_pain; severity=5; effect/response=avoid_aggravator | shoulder; horizontal_pressing | horizontal_pressing; horizontal_pressing:loading.jointStressTags+cautionStressTags | 1/1/1 | 6.400 / 0.474074 | 7.400 / 0.365432 | 8.500 | not_present | 7.612 / 1 |
| moderate severity 6 | push-up | legal | - | PAIN_REQUIRES_REVIEW:shoulder-horizontal-push-pain-moderate-6 | shoulder-horizontal-push-pain-moderate-6; moderate_pain; severity=6; effect/response=avoid_aggravator | shoulder; horizontal_pressing | horizontal_pressing; horizontal_pressing:loading.jointStressTags+cautionStressTags | 1/1/1 | 6.400 / 0.474074 | 7.400 / 0.365432 | 7.200 | not_present | 7.590 / 2 |
| moderate severity 6 | dumbbell-bench-press | legal | - | PAIN_REQUIRES_REVIEW:shoulder-horizontal-push-pain-moderate-6 | shoulder-horizontal-push-pain-moderate-6; moderate_pain; severity=6; effect/response=avoid_aggravator | shoulder; horizontal_pressing | horizontal_pressing; horizontal_pressing:loading.jointStressTags+cautionStressTags | 1/1/1 | 6.400 / 0.474074 | 7.400 / 0.365432 | 7.200 | not_present | 7.441 / 3 |
| moderate severity 6 | machine-chest-press | legal | - | PAIN_REQUIRES_REVIEW:shoulder-horizontal-push-pain-moderate-6 | shoulder-horizontal-push-pain-moderate-6; moderate_pain; severity=6; effect/response=avoid_aggravator | shoulder; horizontal_pressing | horizontal_pressing; horizontal_pressing:loading.jointStressTags+cautionStressTags | 1/1/1 | 6.400 / 0.474074 | 7.400 / 0.365432 | 8.500 | not_present | 7.612 / 1 |
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
| discomfort severity 1 | dumbbell-romanian-deadlift | legal | - | - | low-back-hinge-pain-discomfort-1; current_discomfort; severity=1; effect/response=prefer_support | lumbar_spine; loaded_hinge, loaded_spinal_flexion | loaded_hinge; loaded_hinge:loading.jointStressTags+cautionStressTags | 1/1/1 | 7.300 / 0.540741 | 7.650 / 0.377778 | 8.500 | low-back-hinge-control-priority:exceeds_current_capability; demandReduction=relevant | 7.855 / 1 |
| discomfort severity 1 | cable-pull-through | legal | - | - | low-back-hinge-pain-discomfort-1; current_discomfort; severity=1; effect/response=prefer_support | lumbar_spine; loaded_hinge, loaded_spinal_flexion | loaded_hinge; loaded_hinge:loading.jointStressTags+cautionStressTags | 1/1/1 | 7.300 / 0.540741 | 8.000 / 0.395062 | 8.500 | low-back-hinge-control-priority:develops_priority; demandReduction=relevant | 7.717 / 2 |
| discomfort severity 2 | dumbbell-romanian-deadlift | legal | - | - | low-back-hinge-pain-discomfort-2; current_discomfort; severity=2; effect/response=prefer_support | lumbar_spine; loaded_hinge, loaded_spinal_flexion | loaded_hinge; loaded_hinge:loading.jointStressTags+cautionStressTags | 1/1/1 | 7.300 / 0.540741 | 7.650 / 0.377778 | 8.500 | low-back-hinge-control-priority:exceeds_current_capability; demandReduction=relevant | 7.855 / 1 |
| discomfort severity 2 | cable-pull-through | legal | - | - | low-back-hinge-pain-discomfort-2; current_discomfort; severity=2; effect/response=prefer_support | lumbar_spine; loaded_hinge, loaded_spinal_flexion | loaded_hinge; loaded_hinge:loading.jointStressTags+cautionStressTags | 1/1/1 | 7.300 / 0.540741 | 8.000 / 0.395062 | 8.500 | low-back-hinge-control-priority:develops_priority; demandReduction=relevant | 7.717 / 2 |
| moderate severity 3 | dumbbell-romanian-deadlift | legal | - | PAIN_REQUIRES_REVIEW:low-back-hinge-pain-moderate-3 | low-back-hinge-pain-moderate-3; moderate_pain; severity=3; effect/response=avoid_aggravator | lumbar_spine; loaded_hinge, loaded_spinal_flexion | loaded_hinge; loaded_hinge:loading.jointStressTags+cautionStressTags | 1/1/1 | 6.400 / 0.474074 | 7.050 / 0.348148 | 8.500 | low-back-hinge-control-priority:exceeds_current_capability; demandReduction=relevant | 7.759 / 1 |
| moderate severity 3 | cable-pull-through | legal | - | PAIN_REQUIRES_REVIEW:low-back-hinge-pain-moderate-3 | low-back-hinge-pain-moderate-3; moderate_pain; severity=3; effect/response=avoid_aggravator | lumbar_spine; loaded_hinge, loaded_spinal_flexion | loaded_hinge; loaded_hinge:loading.jointStressTags+cautionStressTags | 1/1/1 | 6.400 / 0.474074 | 7.400 / 0.365432 | 8.500 | low-back-hinge-control-priority:develops_priority; demandReduction=relevant | 7.620 / 2 |
| moderate severity 4 | dumbbell-romanian-deadlift | legal | - | PAIN_REQUIRES_REVIEW:low-back-hinge-pain-moderate-4 | low-back-hinge-pain-moderate-4; moderate_pain; severity=4; effect/response=avoid_aggravator | lumbar_spine; loaded_hinge, loaded_spinal_flexion | loaded_hinge; loaded_hinge:loading.jointStressTags+cautionStressTags | 1/1/1 | 6.400 / 0.474074 | 7.050 / 0.348148 | 8.500 | low-back-hinge-control-priority:exceeds_current_capability; demandReduction=relevant | 7.759 / 1 |
| moderate severity 4 | cable-pull-through | legal | - | PAIN_REQUIRES_REVIEW:low-back-hinge-pain-moderate-4 | low-back-hinge-pain-moderate-4; moderate_pain; severity=4; effect/response=avoid_aggravator | lumbar_spine; loaded_hinge, loaded_spinal_flexion | loaded_hinge; loaded_hinge:loading.jointStressTags+cautionStressTags | 1/1/1 | 6.400 / 0.474074 | 7.400 / 0.365432 | 8.500 | low-back-hinge-control-priority:develops_priority; demandReduction=relevant | 7.620 / 2 |
| moderate severity 5 | dumbbell-romanian-deadlift | legal | - | PAIN_REQUIRES_REVIEW:low-back-hinge-pain-moderate-5 | low-back-hinge-pain-moderate-5; moderate_pain; severity=5; effect/response=avoid_aggravator | lumbar_spine; loaded_hinge, loaded_spinal_flexion | loaded_hinge; loaded_hinge:loading.jointStressTags+cautionStressTags | 1/1/1 | 6.400 / 0.474074 | 7.050 / 0.348148 | 8.500 | low-back-hinge-control-priority:exceeds_current_capability; demandReduction=relevant | 7.759 / 1 |
| moderate severity 5 | cable-pull-through | legal | - | PAIN_REQUIRES_REVIEW:low-back-hinge-pain-moderate-5 | low-back-hinge-pain-moderate-5; moderate_pain; severity=5; effect/response=avoid_aggravator | lumbar_spine; loaded_hinge, loaded_spinal_flexion | loaded_hinge; loaded_hinge:loading.jointStressTags+cautionStressTags | 1/1/1 | 6.400 / 0.474074 | 7.400 / 0.365432 | 8.500 | low-back-hinge-control-priority:develops_priority; demandReduction=relevant | 7.620 / 2 |
| moderate severity 6 | dumbbell-romanian-deadlift | legal | - | PAIN_REQUIRES_REVIEW:low-back-hinge-pain-moderate-6 | low-back-hinge-pain-moderate-6; moderate_pain; severity=6; effect/response=avoid_aggravator | lumbar_spine; loaded_hinge, loaded_spinal_flexion | loaded_hinge; loaded_hinge:loading.jointStressTags+cautionStressTags | 1/1/1 | 6.400 / 0.474074 | 7.050 / 0.348148 | 8.500 | low-back-hinge-control-priority:exceeds_current_capability; demandReduction=relevant | 7.759 / 1 |
| moderate severity 6 | cable-pull-through | legal | - | PAIN_REQUIRES_REVIEW:low-back-hinge-pain-moderate-6 | low-back-hinge-pain-moderate-6; moderate_pain; severity=6; effect/response=avoid_aggravator | lumbar_spine; loaded_hinge, loaded_spinal_flexion | loaded_hinge; loaded_hinge:loading.jointStressTags+cautionStressTags | 1/1/1 | 6.400 / 0.474074 | 7.400 / 0.365432 | 8.500 | low-back-hinge-control-priority:develops_priority; demandReduction=relevant | 7.620 / 2 |
| acute/severe | dumbbell-romanian-deadlift | rejected | HARD_CONTRAINDICATION:low-back-hinge-pain-acute-7 | - | low-back-hinge-pain-acute-7; acute_severe_pain; severity=7; effect/response=urgentReviewRecommended=true | lumbar_spine; loaded_hinge, loaded_spinal_flexion | loaded_hinge; loaded_hinge:loading.jointStressTags+cautionStressTags | 1/0/0 | - / - | - / - | - | not_scored | - / - |
| acute/severe | cable-pull-through | rejected | HARD_CONTRAINDICATION:low-back-hinge-pain-acute-7 | - | low-back-hinge-pain-acute-7; acute_severe_pain; severity=7; effect/response=urgentReviewRecommended=true | lumbar_spine; loaded_hinge, loaded_spinal_flexion | loaded_hinge; loaded_hinge:loading.jointStressTags+cautionStressTags | 1/0/0 | - / - | - / - | - | not_scored | - / - |
| hard contraindication | dumbbell-romanian-deadlift | rejected | HARD_CONTRAINDICATION:low-back-hinge-pain-hard-contraindication | - | low-back-hinge-pain-hard-contraindication; hard_contraindication; severity=-; effect/response=source=safety_rule | lumbar_spine; loaded_hinge, loaded_spinal_flexion | loaded_hinge; loaded_hinge:loading.jointStressTags+cautionStressTags | 1/0/0 | - / - | - / - | - | not_scored | - / - |
| hard contraindication | cable-pull-through | rejected | HARD_CONTRAINDICATION:low-back-hinge-pain-hard-contraindication | - | low-back-hinge-pain-hard-contraindication; hard_contraindication; severity=-; effect/response=source=safety_rule | lumbar_spine; loaded_hinge, loaded_spinal_flexion | loaded_hinge; loaded_hinge:loading.jointStressTags+cautionStressTags | 1/0/0 | - / - | - / - | - | not_scored | - / - |

### Low-Back Horizontal Row

| State | Candidate | Outcome | Hard Rejection | Warning | Signal | Region / Tags | Matched Stress / Metadata Sources | Counts U/P/J | Pain Raw / Weighted | Joint Raw / Weighted | Stability | Assessment / Demand Reduction | Total / Rank |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| no pain | machine-row | legal | - | - | -; none; severity=-; effect/response=- | -; - | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 8.500 | low-back-hinge-control-priority:neutral; demandReduction=not_relevant | 8.069 / 1 |
| no pain | seated-cable-row | legal | - | - | -; none; severity=-; effect/response=- | -; - | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 8.500 | low-back-hinge-control-priority:neutral; demandReduction=not_relevant | 8.069 / 2 |
| no pain | chest-supported-dumbbell-row | legal | - | - | -; none; severity=-; effect/response=- | -; - | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 8.500 | low-back-hinge-control-priority:under_challenges_development; demandReduction=not_relevant | 8.064 / 3 |
| no pain | one-arm-dumbbell-row | legal | - | - | -; none; severity=-; effect/response=- | -; - | -; - | 0/0/0 | 8.200 / 0.607407 | 8.450 / 0.417284 | 7.200 | low-back-hinge-control-priority:exceeds_current_capability; demandReduction=not_relevant | 7.908 / 4 |
| discomfort severity 1 | machine-row | legal | - | - | low-back-horizontal-row-pain-discomfort-1; current_discomfort; severity=1; effect/response=prefer_support | lumbar_spine; loaded_hinge, loaded_spinal_flexion | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 8.500 | low-back-hinge-control-priority:neutral; demandReduction=relevant | 8.069 / 1 |
| discomfort severity 1 | seated-cable-row | legal | - | - | low-back-horizontal-row-pain-discomfort-1; current_discomfort; severity=1; effect/response=prefer_support | lumbar_spine; loaded_hinge, loaded_spinal_flexion | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 8.500 | low-back-hinge-control-priority:neutral; demandReduction=relevant | 8.069 / 2 |
| discomfort severity 1 | chest-supported-dumbbell-row | legal | - | - | low-back-horizontal-row-pain-discomfort-1; current_discomfort; severity=1; effect/response=prefer_support | lumbar_spine; loaded_hinge, loaded_spinal_flexion | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 8.500 | low-back-hinge-control-priority:reduces_excess_demand; demandReduction=relevant | 8.068 / 3 |
| discomfort severity 1 | one-arm-dumbbell-row | legal | - | - | low-back-horizontal-row-pain-discomfort-1; current_discomfort; severity=1; effect/response=prefer_support | lumbar_spine; loaded_hinge, loaded_spinal_flexion | -; - | 0/0/0 | 8.200 / 0.607407 | 8.450 / 0.417284 | 7.200 | low-back-hinge-control-priority:exceeds_current_capability; demandReduction=relevant | 7.908 / 4 |
| discomfort severity 2 | machine-row | legal | - | - | low-back-horizontal-row-pain-discomfort-2; current_discomfort; severity=2; effect/response=prefer_support | lumbar_spine; loaded_hinge, loaded_spinal_flexion | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 8.500 | low-back-hinge-control-priority:neutral; demandReduction=relevant | 8.069 / 1 |
| discomfort severity 2 | seated-cable-row | legal | - | - | low-back-horizontal-row-pain-discomfort-2; current_discomfort; severity=2; effect/response=prefer_support | lumbar_spine; loaded_hinge, loaded_spinal_flexion | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 8.500 | low-back-hinge-control-priority:neutral; demandReduction=relevant | 8.069 / 2 |
| discomfort severity 2 | chest-supported-dumbbell-row | legal | - | - | low-back-horizontal-row-pain-discomfort-2; current_discomfort; severity=2; effect/response=prefer_support | lumbar_spine; loaded_hinge, loaded_spinal_flexion | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 8.500 | low-back-hinge-control-priority:reduces_excess_demand; demandReduction=relevant | 8.068 / 3 |
| discomfort severity 2 | one-arm-dumbbell-row | legal | - | - | low-back-horizontal-row-pain-discomfort-2; current_discomfort; severity=2; effect/response=prefer_support | lumbar_spine; loaded_hinge, loaded_spinal_flexion | -; - | 0/0/0 | 8.200 / 0.607407 | 8.450 / 0.417284 | 7.200 | low-back-hinge-control-priority:exceeds_current_capability; demandReduction=relevant | 7.908 / 4 |
| moderate severity 3 | machine-row | legal | - | - | low-back-horizontal-row-pain-moderate-3; moderate_pain; severity=3; effect/response=avoid_aggravator | lumbar_spine; loaded_hinge, loaded_spinal_flexion | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 8.500 | low-back-hinge-control-priority:neutral; demandReduction=relevant | 8.069 / 1 |
| moderate severity 3 | seated-cable-row | legal | - | - | low-back-horizontal-row-pain-moderate-3; moderate_pain; severity=3; effect/response=avoid_aggravator | lumbar_spine; loaded_hinge, loaded_spinal_flexion | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 8.500 | low-back-hinge-control-priority:neutral; demandReduction=relevant | 8.069 / 2 |
| moderate severity 3 | chest-supported-dumbbell-row | legal | - | - | low-back-horizontal-row-pain-moderate-3; moderate_pain; severity=3; effect/response=avoid_aggravator | lumbar_spine; loaded_hinge, loaded_spinal_flexion | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 8.500 | low-back-hinge-control-priority:reduces_excess_demand; demandReduction=relevant | 8.068 / 3 |
| moderate severity 3 | one-arm-dumbbell-row | legal | - | - | low-back-horizontal-row-pain-moderate-3; moderate_pain; severity=3; effect/response=avoid_aggravator | lumbar_spine; loaded_hinge, loaded_spinal_flexion | -; - | 0/0/0 | 8.200 / 0.607407 | 8.450 / 0.417284 | 7.200 | low-back-hinge-control-priority:exceeds_current_capability; demandReduction=relevant | 7.908 / 4 |
| moderate severity 4 | machine-row | legal | - | - | low-back-horizontal-row-pain-moderate-4; moderate_pain; severity=4; effect/response=avoid_aggravator | lumbar_spine; loaded_hinge, loaded_spinal_flexion | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 8.500 | low-back-hinge-control-priority:neutral; demandReduction=relevant | 8.069 / 1 |
| moderate severity 4 | seated-cable-row | legal | - | - | low-back-horizontal-row-pain-moderate-4; moderate_pain; severity=4; effect/response=avoid_aggravator | lumbar_spine; loaded_hinge, loaded_spinal_flexion | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 8.500 | low-back-hinge-control-priority:neutral; demandReduction=relevant | 8.069 / 2 |
| moderate severity 4 | chest-supported-dumbbell-row | legal | - | - | low-back-horizontal-row-pain-moderate-4; moderate_pain; severity=4; effect/response=avoid_aggravator | lumbar_spine; loaded_hinge, loaded_spinal_flexion | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 8.500 | low-back-hinge-control-priority:reduces_excess_demand; demandReduction=relevant | 8.068 / 3 |
| moderate severity 4 | one-arm-dumbbell-row | legal | - | - | low-back-horizontal-row-pain-moderate-4; moderate_pain; severity=4; effect/response=avoid_aggravator | lumbar_spine; loaded_hinge, loaded_spinal_flexion | -; - | 0/0/0 | 8.200 / 0.607407 | 8.450 / 0.417284 | 7.200 | low-back-hinge-control-priority:exceeds_current_capability; demandReduction=relevant | 7.908 / 4 |
| moderate severity 5 | machine-row | legal | - | - | low-back-horizontal-row-pain-moderate-5; moderate_pain; severity=5; effect/response=avoid_aggravator | lumbar_spine; loaded_hinge, loaded_spinal_flexion | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 8.500 | low-back-hinge-control-priority:neutral; demandReduction=relevant | 8.069 / 1 |
| moderate severity 5 | seated-cable-row | legal | - | - | low-back-horizontal-row-pain-moderate-5; moderate_pain; severity=5; effect/response=avoid_aggravator | lumbar_spine; loaded_hinge, loaded_spinal_flexion | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 8.500 | low-back-hinge-control-priority:neutral; demandReduction=relevant | 8.069 / 2 |
| moderate severity 5 | chest-supported-dumbbell-row | legal | - | - | low-back-horizontal-row-pain-moderate-5; moderate_pain; severity=5; effect/response=avoid_aggravator | lumbar_spine; loaded_hinge, loaded_spinal_flexion | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 8.500 | low-back-hinge-control-priority:reduces_excess_demand; demandReduction=relevant | 8.068 / 3 |
| moderate severity 5 | one-arm-dumbbell-row | legal | - | - | low-back-horizontal-row-pain-moderate-5; moderate_pain; severity=5; effect/response=avoid_aggravator | lumbar_spine; loaded_hinge, loaded_spinal_flexion | -; - | 0/0/0 | 8.200 / 0.607407 | 8.450 / 0.417284 | 7.200 | low-back-hinge-control-priority:exceeds_current_capability; demandReduction=relevant | 7.908 / 4 |
| moderate severity 6 | machine-row | legal | - | - | low-back-horizontal-row-pain-moderate-6; moderate_pain; severity=6; effect/response=avoid_aggravator | lumbar_spine; loaded_hinge, loaded_spinal_flexion | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 8.500 | low-back-hinge-control-priority:neutral; demandReduction=relevant | 8.069 / 1 |
| moderate severity 6 | seated-cable-row | legal | - | - | low-back-horizontal-row-pain-moderate-6; moderate_pain; severity=6; effect/response=avoid_aggravator | lumbar_spine; loaded_hinge, loaded_spinal_flexion | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 8.500 | low-back-hinge-control-priority:neutral; demandReduction=relevant | 8.069 / 2 |
| moderate severity 6 | chest-supported-dumbbell-row | legal | - | - | low-back-horizontal-row-pain-moderate-6; moderate_pain; severity=6; effect/response=avoid_aggravator | lumbar_spine; loaded_hinge, loaded_spinal_flexion | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 8.500 | low-back-hinge-control-priority:reduces_excess_demand; demandReduction=relevant | 8.068 / 3 |
| moderate severity 6 | one-arm-dumbbell-row | legal | - | - | low-back-horizontal-row-pain-moderate-6; moderate_pain; severity=6; effect/response=avoid_aggravator | lumbar_spine; loaded_hinge, loaded_spinal_flexion | -; - | 0/0/0 | 8.200 / 0.607407 | 8.450 / 0.417284 | 7.200 | low-back-hinge-control-priority:exceeds_current_capability; demandReduction=relevant | 7.908 / 4 |
| acute/severe | machine-row | legal | - | - | low-back-horizontal-row-pain-acute-7; acute_severe_pain; severity=7; effect/response=urgentReviewRecommended=true | lumbar_spine; loaded_hinge, loaded_spinal_flexion | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 8.500 | low-back-hinge-control-priority:neutral; demandReduction=not_relevant | 8.069 / 1 |
| acute/severe | seated-cable-row | legal | - | - | low-back-horizontal-row-pain-acute-7; acute_severe_pain; severity=7; effect/response=urgentReviewRecommended=true | lumbar_spine; loaded_hinge, loaded_spinal_flexion | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 8.500 | low-back-hinge-control-priority:neutral; demandReduction=not_relevant | 8.069 / 2 |
| acute/severe | chest-supported-dumbbell-row | legal | - | - | low-back-horizontal-row-pain-acute-7; acute_severe_pain; severity=7; effect/response=urgentReviewRecommended=true | lumbar_spine; loaded_hinge, loaded_spinal_flexion | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 8.500 | low-back-hinge-control-priority:under_challenges_development; demandReduction=not_relevant | 8.064 / 3 |
| acute/severe | one-arm-dumbbell-row | legal | - | - | low-back-horizontal-row-pain-acute-7; acute_severe_pain; severity=7; effect/response=urgentReviewRecommended=true | lumbar_spine; loaded_hinge, loaded_spinal_flexion | -; - | 0/0/0 | 8.200 / 0.607407 | 8.450 / 0.417284 | 7.200 | low-back-hinge-control-priority:exceeds_current_capability; demandReduction=not_relevant | 7.908 / 4 |
| hard contraindication | machine-row | legal | - | - | low-back-horizontal-row-pain-hard-contraindication; hard_contraindication; severity=-; effect/response=source=safety_rule | lumbar_spine; loaded_hinge, loaded_spinal_flexion | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 8.500 | low-back-hinge-control-priority:neutral; demandReduction=not_relevant | 8.069 / 1 |
| hard contraindication | seated-cable-row | legal | - | - | low-back-horizontal-row-pain-hard-contraindication; hard_contraindication; severity=-; effect/response=source=safety_rule | lumbar_spine; loaded_hinge, loaded_spinal_flexion | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 8.500 | low-back-hinge-control-priority:neutral; demandReduction=not_relevant | 8.069 / 2 |
| hard contraindication | chest-supported-dumbbell-row | legal | - | - | low-back-horizontal-row-pain-hard-contraindication; hard_contraindication; severity=-; effect/response=source=safety_rule | lumbar_spine; loaded_hinge, loaded_spinal_flexion | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 8.500 | low-back-hinge-control-priority:under_challenges_development; demandReduction=not_relevant | 8.064 / 3 |
| hard contraindication | one-arm-dumbbell-row | legal | - | - | low-back-horizontal-row-pain-hard-contraindication; hard_contraindication; severity=-; effect/response=source=safety_rule | lumbar_spine; loaded_hinge, loaded_spinal_flexion | -; - | 0/0/0 | 8.200 / 0.607407 | 8.450 / 0.417284 | 7.200 | low-back-hinge-control-priority:exceeds_current_capability; demandReduction=not_relevant | 7.908 / 4 |

### Knee Squat

| State | Candidate | Outcome | Hard Rejection | Warning | Signal | Region / Tags | Matched Stress / Metadata Sources | Counts U/P/J | Pain Raw / Weighted | Joint Raw / Weighted | Stability | Assessment / Demand Reduction | Total / Rank |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| no pain | goblet-squat | legal | - | - | -; none; severity=-; effect/response=- | -; - | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 8.500 | pain-audit-knee-control:under_challenges_development; demandReduction=not_relevant | 7.705 / 2 |
| no pain | leg-press | legal | - | - | -; none; severity=-; effect/response=- | -; - | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 8.500 | pain-audit-knee-control:under_challenges_development; demandReduction=not_relevant | 7.981 / 1 |
| no pain | bodyweight-box-squat | legal | - | - | -; none; severity=-; effect/response=- | -; - | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 8.500 | pain-audit-knee-control:under_challenges_development; demandReduction=not_relevant | 7.311 / 3 |
| discomfort severity 1 | goblet-squat | legal | - | - | knee-squat-pain-discomfort-1; current_discomfort; severity=1; effect/response=prefer_support | knee; deep_knee_flexion, loaded_knee_flexion | deep_knee_flexion, loaded_knee_flexion; deep_knee_flexion:loading.jointStressTags+cautionStressTags, loaded_knee_flexion:loading.jointStressTags+cautionStressTags | 2/2/2 | 6.400 / 0.474074 | 7.200 / 0.355556 | 8.500 | pain-audit-knee-control:reduces_excess_demand; demandReduction=relevant | 7.519 / 2 |
| discomfort severity 1 | leg-press | legal | - | - | knee-squat-pain-discomfort-1; current_discomfort; severity=1; effect/response=prefer_support | knee; deep_knee_flexion, loaded_knee_flexion | deep_knee_flexion, loaded_knee_flexion; deep_knee_flexion:loading.jointStressTags, loaded_knee_flexion:loading.jointStressTags+cautionStressTags | 2/2/2 | 6.400 / 0.474074 | 7.200 / 0.355556 | 8.500 | pain-audit-knee-control:reduces_excess_demand; demandReduction=relevant | 7.795 / 1 |
| discomfort severity 1 | bodyweight-box-squat | legal | - | - | knee-squat-pain-discomfort-1; current_discomfort; severity=1; effect/response=prefer_support | knee; deep_knee_flexion, loaded_knee_flexion | deep_knee_flexion; deep_knee_flexion:loading.jointStressTags+cautionStressTags | 1/1/1 | 7.300 / 0.540741 | 8.000 / 0.395062 | 8.500 | pain-audit-knee-control:reduces_excess_demand; demandReduction=relevant | 7.232 / 3 |
| discomfort severity 2 | goblet-squat | legal | - | - | knee-squat-pain-discomfort-2; current_discomfort; severity=2; effect/response=prefer_support | knee; deep_knee_flexion, loaded_knee_flexion | deep_knee_flexion, loaded_knee_flexion; deep_knee_flexion:loading.jointStressTags+cautionStressTags, loaded_knee_flexion:loading.jointStressTags+cautionStressTags | 2/2/2 | 6.400 / 0.474074 | 7.200 / 0.355556 | 8.500 | pain-audit-knee-control:reduces_excess_demand; demandReduction=relevant | 7.519 / 2 |
| discomfort severity 2 | leg-press | legal | - | - | knee-squat-pain-discomfort-2; current_discomfort; severity=2; effect/response=prefer_support | knee; deep_knee_flexion, loaded_knee_flexion | deep_knee_flexion, loaded_knee_flexion; deep_knee_flexion:loading.jointStressTags, loaded_knee_flexion:loading.jointStressTags+cautionStressTags | 2/2/2 | 6.400 / 0.474074 | 7.200 / 0.355556 | 8.500 | pain-audit-knee-control:reduces_excess_demand; demandReduction=relevant | 7.795 / 1 |
| discomfort severity 2 | bodyweight-box-squat | legal | - | - | knee-squat-pain-discomfort-2; current_discomfort; severity=2; effect/response=prefer_support | knee; deep_knee_flexion, loaded_knee_flexion | deep_knee_flexion; deep_knee_flexion:loading.jointStressTags+cautionStressTags | 1/1/1 | 7.300 / 0.540741 | 8.000 / 0.395062 | 8.500 | pain-audit-knee-control:reduces_excess_demand; demandReduction=relevant | 7.232 / 3 |
| moderate severity 3 | goblet-squat | legal | - | PAIN_REQUIRES_REVIEW:knee-squat-pain-moderate-3 | knee-squat-pain-moderate-3; moderate_pain; severity=3; effect/response=avoid_aggravator | knee; deep_knee_flexion, loaded_knee_flexion | deep_knee_flexion, loaded_knee_flexion; deep_knee_flexion:loading.jointStressTags+cautionStressTags, loaded_knee_flexion:loading.jointStressTags+cautionStressTags | 2/2/2 | 4.600 / 0.340741 | 6.000 / 0.296296 | 8.500 | pain-audit-knee-control:reduces_excess_demand; demandReduction=relevant | 7.327 / 2 |
| moderate severity 3 | leg-press | legal | - | PAIN_REQUIRES_REVIEW:knee-squat-pain-moderate-3 | knee-squat-pain-moderate-3; moderate_pain; severity=3; effect/response=avoid_aggravator | knee; deep_knee_flexion, loaded_knee_flexion | deep_knee_flexion, loaded_knee_flexion; deep_knee_flexion:loading.jointStressTags, loaded_knee_flexion:loading.jointStressTags+cautionStressTags | 2/2/2 | 4.600 / 0.340741 | 6.000 / 0.296296 | 8.500 | pain-audit-knee-control:reduces_excess_demand; demandReduction=relevant | 7.603 / 1 |
| moderate severity 3 | bodyweight-box-squat | legal | - | PAIN_REQUIRES_REVIEW:knee-squat-pain-moderate-3 | knee-squat-pain-moderate-3; moderate_pain; severity=3; effect/response=avoid_aggravator | knee; deep_knee_flexion, loaded_knee_flexion | deep_knee_flexion; deep_knee_flexion:loading.jointStressTags+cautionStressTags | 1/1/1 | 6.400 / 0.474074 | 7.400 / 0.365432 | 8.500 | pain-audit-knee-control:reduces_excess_demand; demandReduction=relevant | 7.136 / 3 |
| moderate severity 4 | goblet-squat | legal | - | PAIN_REQUIRES_REVIEW:knee-squat-pain-moderate-4 | knee-squat-pain-moderate-4; moderate_pain; severity=4; effect/response=avoid_aggravator | knee; deep_knee_flexion, loaded_knee_flexion | deep_knee_flexion, loaded_knee_flexion; deep_knee_flexion:loading.jointStressTags+cautionStressTags, loaded_knee_flexion:loading.jointStressTags+cautionStressTags | 2/2/2 | 4.600 / 0.340741 | 6.000 / 0.296296 | 8.500 | pain-audit-knee-control:reduces_excess_demand; demandReduction=relevant | 7.327 / 2 |
| moderate severity 4 | leg-press | legal | - | PAIN_REQUIRES_REVIEW:knee-squat-pain-moderate-4 | knee-squat-pain-moderate-4; moderate_pain; severity=4; effect/response=avoid_aggravator | knee; deep_knee_flexion, loaded_knee_flexion | deep_knee_flexion, loaded_knee_flexion; deep_knee_flexion:loading.jointStressTags, loaded_knee_flexion:loading.jointStressTags+cautionStressTags | 2/2/2 | 4.600 / 0.340741 | 6.000 / 0.296296 | 8.500 | pain-audit-knee-control:reduces_excess_demand; demandReduction=relevant | 7.603 / 1 |
| moderate severity 4 | bodyweight-box-squat | legal | - | PAIN_REQUIRES_REVIEW:knee-squat-pain-moderate-4 | knee-squat-pain-moderate-4; moderate_pain; severity=4; effect/response=avoid_aggravator | knee; deep_knee_flexion, loaded_knee_flexion | deep_knee_flexion; deep_knee_flexion:loading.jointStressTags+cautionStressTags | 1/1/1 | 6.400 / 0.474074 | 7.400 / 0.365432 | 8.500 | pain-audit-knee-control:reduces_excess_demand; demandReduction=relevant | 7.136 / 3 |
| moderate severity 5 | goblet-squat | legal | - | PAIN_REQUIRES_REVIEW:knee-squat-pain-moderate-5 | knee-squat-pain-moderate-5; moderate_pain; severity=5; effect/response=avoid_aggravator | knee; deep_knee_flexion, loaded_knee_flexion | deep_knee_flexion, loaded_knee_flexion; deep_knee_flexion:loading.jointStressTags+cautionStressTags, loaded_knee_flexion:loading.jointStressTags+cautionStressTags | 2/2/2 | 4.600 / 0.340741 | 6.000 / 0.296296 | 8.500 | pain-audit-knee-control:reduces_excess_demand; demandReduction=relevant | 7.327 / 2 |
| moderate severity 5 | leg-press | legal | - | PAIN_REQUIRES_REVIEW:knee-squat-pain-moderate-5 | knee-squat-pain-moderate-5; moderate_pain; severity=5; effect/response=avoid_aggravator | knee; deep_knee_flexion, loaded_knee_flexion | deep_knee_flexion, loaded_knee_flexion; deep_knee_flexion:loading.jointStressTags, loaded_knee_flexion:loading.jointStressTags+cautionStressTags | 2/2/2 | 4.600 / 0.340741 | 6.000 / 0.296296 | 8.500 | pain-audit-knee-control:reduces_excess_demand; demandReduction=relevant | 7.603 / 1 |
| moderate severity 5 | bodyweight-box-squat | legal | - | PAIN_REQUIRES_REVIEW:knee-squat-pain-moderate-5 | knee-squat-pain-moderate-5; moderate_pain; severity=5; effect/response=avoid_aggravator | knee; deep_knee_flexion, loaded_knee_flexion | deep_knee_flexion; deep_knee_flexion:loading.jointStressTags+cautionStressTags | 1/1/1 | 6.400 / 0.474074 | 7.400 / 0.365432 | 8.500 | pain-audit-knee-control:reduces_excess_demand; demandReduction=relevant | 7.136 / 3 |
| moderate severity 6 | goblet-squat | legal | - | PAIN_REQUIRES_REVIEW:knee-squat-pain-moderate-6 | knee-squat-pain-moderate-6; moderate_pain; severity=6; effect/response=avoid_aggravator | knee; deep_knee_flexion, loaded_knee_flexion | deep_knee_flexion, loaded_knee_flexion; deep_knee_flexion:loading.jointStressTags+cautionStressTags, loaded_knee_flexion:loading.jointStressTags+cautionStressTags | 2/2/2 | 4.600 / 0.340741 | 6.000 / 0.296296 | 8.500 | pain-audit-knee-control:reduces_excess_demand; demandReduction=relevant | 7.327 / 2 |
| moderate severity 6 | leg-press | legal | - | PAIN_REQUIRES_REVIEW:knee-squat-pain-moderate-6 | knee-squat-pain-moderate-6; moderate_pain; severity=6; effect/response=avoid_aggravator | knee; deep_knee_flexion, loaded_knee_flexion | deep_knee_flexion, loaded_knee_flexion; deep_knee_flexion:loading.jointStressTags, loaded_knee_flexion:loading.jointStressTags+cautionStressTags | 2/2/2 | 4.600 / 0.340741 | 6.000 / 0.296296 | 8.500 | pain-audit-knee-control:reduces_excess_demand; demandReduction=relevant | 7.603 / 1 |
| moderate severity 6 | bodyweight-box-squat | legal | - | PAIN_REQUIRES_REVIEW:knee-squat-pain-moderate-6 | knee-squat-pain-moderate-6; moderate_pain; severity=6; effect/response=avoid_aggravator | knee; deep_knee_flexion, loaded_knee_flexion | deep_knee_flexion; deep_knee_flexion:loading.jointStressTags+cautionStressTags | 1/1/1 | 6.400 / 0.474074 | 7.400 / 0.365432 | 8.500 | pain-audit-knee-control:reduces_excess_demand; demandReduction=relevant | 7.136 / 3 |
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
| discomfort severity 1 | split-squat | legal | - | - | single-leg-pain-discomfort-1; current_discomfort; severity=1; effect/response=prefer_support | knee; deep_knee_flexion, loaded_knee_flexion | deep_knee_flexion, loaded_knee_flexion; deep_knee_flexion:loading.jointStressTags+cautionStressTags, loaded_knee_flexion:loading.jointStressTags+cautionStressTags | 2/2/2 | 6.400 / 0.474074 | 7.200 / 0.355556 | 8.500 | pain-audit-knee-control:reduces_excess_demand; demandReduction=relevant | 7.800 / 2 |
| discomfort severity 1 | step-up | legal | - | - | single-leg-pain-discomfort-1; current_discomfort; severity=1; effect/response=prefer_support | knee; deep_knee_flexion, loaded_knee_flexion | loaded_knee_flexion; loaded_knee_flexion:loading.jointStressTags+cautionStressTags | 1/1/1 | 7.300 / 0.540741 | 8.000 / 0.395062 | 8.500 | pain-audit-knee-control:reduces_excess_demand; demandReduction=relevant | 7.886 / 1 |
| discomfort severity 2 | split-squat | legal | - | - | single-leg-pain-discomfort-2; current_discomfort; severity=2; effect/response=prefer_support | knee; deep_knee_flexion, loaded_knee_flexion | deep_knee_flexion, loaded_knee_flexion; deep_knee_flexion:loading.jointStressTags+cautionStressTags, loaded_knee_flexion:loading.jointStressTags+cautionStressTags | 2/2/2 | 6.400 / 0.474074 | 7.200 / 0.355556 | 8.500 | pain-audit-knee-control:reduces_excess_demand; demandReduction=relevant | 7.800 / 2 |
| discomfort severity 2 | step-up | legal | - | - | single-leg-pain-discomfort-2; current_discomfort; severity=2; effect/response=prefer_support | knee; deep_knee_flexion, loaded_knee_flexion | loaded_knee_flexion; loaded_knee_flexion:loading.jointStressTags+cautionStressTags | 1/1/1 | 7.300 / 0.540741 | 8.000 / 0.395062 | 8.500 | pain-audit-knee-control:reduces_excess_demand; demandReduction=relevant | 7.886 / 1 |
| moderate severity 3 | split-squat | legal | - | PAIN_REQUIRES_REVIEW:single-leg-pain-moderate-3 | single-leg-pain-moderate-3; moderate_pain; severity=3; effect/response=avoid_aggravator | knee; deep_knee_flexion, loaded_knee_flexion | deep_knee_flexion, loaded_knee_flexion; deep_knee_flexion:loading.jointStressTags+cautionStressTags, loaded_knee_flexion:loading.jointStressTags+cautionStressTags | 2/2/2 | 4.600 / 0.340741 | 6.000 / 0.296296 | 8.500 | pain-audit-knee-control:reduces_excess_demand; demandReduction=relevant | 7.607 / 2 |
| moderate severity 3 | step-up | legal | - | PAIN_REQUIRES_REVIEW:single-leg-pain-moderate-3 | single-leg-pain-moderate-3; moderate_pain; severity=3; effect/response=avoid_aggravator | knee; deep_knee_flexion, loaded_knee_flexion | loaded_knee_flexion; loaded_knee_flexion:loading.jointStressTags+cautionStressTags | 1/1/1 | 6.400 / 0.474074 | 7.400 / 0.365432 | 8.500 | pain-audit-knee-control:reduces_excess_demand; demandReduction=relevant | 7.790 / 1 |
| moderate severity 4 | split-squat | legal | - | PAIN_REQUIRES_REVIEW:single-leg-pain-moderate-4 | single-leg-pain-moderate-4; moderate_pain; severity=4; effect/response=avoid_aggravator | knee; deep_knee_flexion, loaded_knee_flexion | deep_knee_flexion, loaded_knee_flexion; deep_knee_flexion:loading.jointStressTags+cautionStressTags, loaded_knee_flexion:loading.jointStressTags+cautionStressTags | 2/2/2 | 4.600 / 0.340741 | 6.000 / 0.296296 | 8.500 | pain-audit-knee-control:reduces_excess_demand; demandReduction=relevant | 7.607 / 2 |
| moderate severity 4 | step-up | legal | - | PAIN_REQUIRES_REVIEW:single-leg-pain-moderate-4 | single-leg-pain-moderate-4; moderate_pain; severity=4; effect/response=avoid_aggravator | knee; deep_knee_flexion, loaded_knee_flexion | loaded_knee_flexion; loaded_knee_flexion:loading.jointStressTags+cautionStressTags | 1/1/1 | 6.400 / 0.474074 | 7.400 / 0.365432 | 8.500 | pain-audit-knee-control:reduces_excess_demand; demandReduction=relevant | 7.790 / 1 |
| moderate severity 5 | split-squat | legal | - | PAIN_REQUIRES_REVIEW:single-leg-pain-moderate-5 | single-leg-pain-moderate-5; moderate_pain; severity=5; effect/response=avoid_aggravator | knee; deep_knee_flexion, loaded_knee_flexion | deep_knee_flexion, loaded_knee_flexion; deep_knee_flexion:loading.jointStressTags+cautionStressTags, loaded_knee_flexion:loading.jointStressTags+cautionStressTags | 2/2/2 | 4.600 / 0.340741 | 6.000 / 0.296296 | 8.500 | pain-audit-knee-control:reduces_excess_demand; demandReduction=relevant | 7.607 / 2 |
| moderate severity 5 | step-up | legal | - | PAIN_REQUIRES_REVIEW:single-leg-pain-moderate-5 | single-leg-pain-moderate-5; moderate_pain; severity=5; effect/response=avoid_aggravator | knee; deep_knee_flexion, loaded_knee_flexion | loaded_knee_flexion; loaded_knee_flexion:loading.jointStressTags+cautionStressTags | 1/1/1 | 6.400 / 0.474074 | 7.400 / 0.365432 | 8.500 | pain-audit-knee-control:reduces_excess_demand; demandReduction=relevant | 7.790 / 1 |
| moderate severity 6 | split-squat | legal | - | PAIN_REQUIRES_REVIEW:single-leg-pain-moderate-6 | single-leg-pain-moderate-6; moderate_pain; severity=6; effect/response=avoid_aggravator | knee; deep_knee_flexion, loaded_knee_flexion | deep_knee_flexion, loaded_knee_flexion; deep_knee_flexion:loading.jointStressTags+cautionStressTags, loaded_knee_flexion:loading.jointStressTags+cautionStressTags | 2/2/2 | 4.600 / 0.340741 | 6.000 / 0.296296 | 8.500 | pain-audit-knee-control:reduces_excess_demand; demandReduction=relevant | 7.607 / 2 |
| moderate severity 6 | step-up | legal | - | PAIN_REQUIRES_REVIEW:single-leg-pain-moderate-6 | single-leg-pain-moderate-6; moderate_pain; severity=6; effect/response=avoid_aggravator | knee; deep_knee_flexion, loaded_knee_flexion | loaded_knee_flexion; loaded_knee_flexion:loading.jointStressTags+cautionStressTags | 1/1/1 | 6.400 / 0.474074 | 7.400 / 0.365432 | 8.500 | pain-audit-knee-control:reduces_excess_demand; demandReduction=relevant | 7.790 / 1 |
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
| unrelated discomfort | leg-press | legal | - | - | unrelated-wrist-during-squat-unrelated-discomfort; current_discomfort; severity=2; effect/response=prefer_support | wrist; wrist_extension_loading | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 8.500 | pain-audit-knee-control:under_challenges_development; demandReduction=not_relevant | 7.981 / 1 |
| unrelated discomfort | bodyweight-box-squat | legal | - | - | unrelated-wrist-during-squat-unrelated-discomfort; current_discomfort; severity=2; effect/response=prefer_support | wrist; wrist_extension_loading | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 8.500 | pain-audit-knee-control:under_challenges_development; demandReduction=not_relevant | 7.311 / 3 |

### Unrelated Knee Discomfort During Horizontal Pull

| State | Candidate | Outcome | Hard Rejection | Warning | Signal | Region / Tags | Matched Stress / Metadata Sources | Counts U/P/J | Pain Raw / Weighted | Joint Raw / Weighted | Stability | Assessment / Demand Reduction | Total / Rank |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| no pain baseline | machine-row | legal | - | - | -; none; severity=-; effect/response=- | -; - | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 8.500 | low-back-hinge-control-priority:neutral; demandReduction=not_relevant | 8.069 / 1 |
| no pain baseline | seated-cable-row | legal | - | - | -; none; severity=-; effect/response=- | -; - | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 8.500 | low-back-hinge-control-priority:neutral; demandReduction=not_relevant | 8.069 / 2 |
| no pain baseline | chest-supported-dumbbell-row | legal | - | - | -; none; severity=-; effect/response=- | -; - | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 8.500 | low-back-hinge-control-priority:under_challenges_development; demandReduction=not_relevant | 8.064 / 3 |
| no pain baseline | one-arm-dumbbell-row | legal | - | - | -; none; severity=-; effect/response=- | -; - | -; - | 0/0/0 | 8.200 / 0.607407 | 8.450 / 0.417284 | 7.200 | low-back-hinge-control-priority:exceeds_current_capability; demandReduction=not_relevant | 7.908 / 4 |
| unrelated discomfort | machine-row | legal | - | - | unrelated-knee-during-horizontal-pull-unrelated-discomfort; current_discomfort; severity=2; effect/response=prefer_support | knee; loaded_knee_flexion | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 8.500 | low-back-hinge-control-priority:neutral; demandReduction=not_relevant | 8.069 / 1 |
| unrelated discomfort | seated-cable-row | legal | - | - | unrelated-knee-during-horizontal-pull-unrelated-discomfort; current_discomfort; severity=2; effect/response=prefer_support | knee; loaded_knee_flexion | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 8.500 | low-back-hinge-control-priority:neutral; demandReduction=not_relevant | 8.069 / 2 |
| unrelated discomfort | chest-supported-dumbbell-row | legal | - | - | unrelated-knee-during-horizontal-pull-unrelated-discomfort; current_discomfort; severity=2; effect/response=prefer_support | knee; loaded_knee_flexion | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 8.500 | low-back-hinge-control-priority:under_challenges_development; demandReduction=not_relevant | 8.064 / 3 |
| unrelated discomfort | one-arm-dumbbell-row | legal | - | - | unrelated-knee-during-horizontal-pull-unrelated-discomfort; current_discomfort; severity=2; effect/response=prefer_support | knee; loaded_knee_flexion | -; - | 0/0/0 | 8.200 / 0.607407 | 8.450 / 0.417284 | 7.200 | low-back-hinge-control-priority:exceeds_current_capability; demandReduction=not_relevant | 7.908 / 4 |

### Unrelated Shoulder Discomfort During Hinge

| State | Candidate | Outcome | Hard Rejection | Warning | Signal | Region / Tags | Matched Stress / Metadata Sources | Counts U/P/J | Pain Raw / Weighted | Joint Raw / Weighted | Stability | Assessment / Demand Reduction | Total / Rank |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| no pain baseline | dumbbell-romanian-deadlift | legal | - | - | -; none; severity=-; effect/response=- | -; - | -; - | 0/0/0 | 8.200 / 0.607407 | 8.450 / 0.417284 | 8.500 | low-back-hinge-control-priority:exceeds_current_capability; demandReduction=not_relevant | 7.961 / 1 |
| no pain baseline | cable-pull-through | legal | - | - | -; none; severity=-; effect/response=- | -; - | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 8.500 | low-back-hinge-control-priority:develops_priority; demandReduction=not_relevant | 7.823 / 2 |
| unrelated discomfort | dumbbell-romanian-deadlift | legal | - | - | unrelated-shoulder-during-hinge-unrelated-discomfort; current_discomfort; severity=2; effect/response=prefer_support | shoulder; horizontal_pressing | -; - | 0/0/0 | 8.200 / 0.607407 | 8.450 / 0.417284 | 8.500 | low-back-hinge-control-priority:exceeds_current_capability; demandReduction=not_relevant | 7.961 / 1 |
| unrelated discomfort | cable-pull-through | legal | - | - | unrelated-shoulder-during-hinge-unrelated-discomfort; current_discomfort; severity=2; effect/response=prefer_support | shoulder; horizontal_pressing | -; - | 0/0/0 | 8.200 / 0.607407 | 8.800 / 0.434568 | 8.500 | low-back-hinge-control-priority:develops_priority; demandReduction=not_relevant | 7.823 / 2 |

## Unrelated-Pain Finding

The unrelated pain examples have zero matched stress tags, no pain-suitability or joint-cost change, no warning, and no hard rejection. They are now fully score-neutral: `stability_fit` reads only exercise stability demand and phase expectation, so each unrelated-pain row is identical to its no-pain baseline.

## Component Ownership Audit

| Owner | Current Finding | Ownership Assessment |
| --- | --- | --- |
| Hard eligibility | Explicit exercise/stress contraindications and acute role/joint overlap reject before scoring. | Correct layer; source provenance, qualifying criteria, severity, role evidence, and urgency are structured. |
| Pain review warning | Any canonical moderate stress match emits one warning per signal/candidate. | Correct non-hard receiver; required response and defer status are attached. |
| Pain suitability | Unique current/moderate/historical signal-tag facts compare legal candidates. | Correct direct-compatibility owner with native tag/source/count trace. |
| Joint cost | Unique joint/caution-qualified facts, axial loading, and accumulated joint fatigue affect cost. | Correct exposure owner; duplicate source charging is removed and contraindicated-only facts remain visible but uncharged. |
| Stability fit | Exercise stability demand is compared with phase expectation. | Correct owner; pain no longer leaks into this component. |
| Assessment/demand reduction | Canonical stress facts plus region/movement context and exact actions can change developmental relationship. | Correct scoped receiver; execution remains truthfully deferred. |
| Prescription | Not implemented in Candidate Intelligence. | Future owner for load, range, support, tempo, effort, and volume actions. |
| Session Composer | Not implemented and not started. | Future owner for role substitution, ordering, accumulated stress, replacement context, and session redirection. |

One canonical matched truth now supports multiple explicit receiver policies. Pain suitability owns direct compatibility, joint cost owns qualified stress exposure, warning owns review observability, hard/acute receivers own distinct authority, and assessment owns contextual developmental reasoning; no receiver reconstructs stress truth independently.

## Required-Response Ownership

### avoid_aggravator

Candidate Intelligence preserves this as `policy_unresolved_candidate_review_required`. It does not silently convert the request into hard authority or claim that a later prescription/composition action is executable.

### reduce_load_and_range

Primary future receiver is prescription because load and range modify the selected exercise. Current status is `deferred_unexecutable_at_candidate_layer`; no automatic modification or extra score magnitude is invented.

### substitute_role

Primary future receiver is Session Intent / Session Composer because isolated candidate scoring cannot replace a requested role while preserving session purpose and coverage. Current status is `deferred_unexecutable_at_candidate_layer`; training-role truth remains hard and no substitution is performed.

## Moderate-Pain Owner Policy

PAIN_CONTRACT: **READY**

MODERATE_PAIN_CANDIDATE_POLICY: **RESOLVED_FOR_CANDIDATE_INTELLIGENCE**

NUMERIC_MODERATE_SEVERITY_CALIBRATION: **DEFERRED_TO_LONGITUDINAL_ADAPTATION**

Candidate Intelligence adopts response-led flat moderate severity. Severity 3-6 adds no numeric pain-suitability or joint-cost adjustment beyond canonical overlap and never creates hard authority. Severity 3-4 carries `standard_moderate_review`; severity 5-6 carries `elevated_moderate_review_non_hard`. The distinction is structured urgency, not acute/severe impersonation.

Each ranked candidate now carries `CandidatePainExecutionReadinessTrace`. Non-urgent `not_applicable_no_candidate_stress_match` requirements are ignored for that candidate. Result readiness follows rank 1 among legal candidates, exposes lower-ranked executable candidates without reranking, excludes hard-rejected candidates from selected-result readiness, and keeps explicit urgent signals globally visible.

Numeric severity calibration is deferred until structured history connects actual prescription with during-session, immediate post-session, recovery-interval, next-morning, next-session, function/performance, and repeated-versus-isolated response.

## Findings By Priority

### P0

- None. Explicit hard contraindications remain hard, legal candidates cannot score through a hard rejection, behavior is deterministic, and no diagnostic inference was found.

### P1

- No pain-contract P1 remains at Candidate Intelligence scope. Overall Candidate Intelligence P1 is phase calibration only.

### P2

- Decide whether and how `HistoricalInjury` should influence Candidate Intelligence; every field is currently unused and invisible.
- Validate or normalize duplicate tags and duplicate same-kind pain signals at the input boundary if they are not intended to stack.

## Blueprint Maintenance

The blueprint records that pain decisions derive from canonical source-aware matched facts while receiver authority remains independent, and that pre-session moderate intensity remains non-numeric at Candidate Intelligence scope until reviewed longitudinal evidence supports calibration.

## Remaining Calibration Boundary

The deterministic pain trace records signal identity, severity, review urgency, region, canonical signal/tag matches, all structured metadata sources, receiver-specific units, explicit criteria, response ownership, candidate readiness, and result readiness. The owner decision does not claim that pain is universally calibrated; it defers numeric severity until longitudinal evidence can justify reopening the policy.

This boundary does not authorize ranking-weight changes, exercise-science calibration, automatic role substitution, Session Composer, prescription, or medical diagnosis.
