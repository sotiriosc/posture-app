# Training Engine V2 Candidate Intelligence Review

`ENGINE_V2_BLUEPRINT.md` is authoritative.

## Scope Completed

Candidate Intelligence now performs this deterministic pipeline:

1. receive a `CandidateRequest`;
2. interpret athlete, phase, need, equipment, pain, history, continuity, assessment, alignment, and fatigue context;
3. apply modular hard eligibility components;
4. score only legal candidates with inspectable score components;
5. sort legal candidates deterministically;
6. return ranked candidates, hard rejections, score breakdowns, assessment/alignment influence, pipeline snapshots, and a `DecisionTrace`.

This phase does not generate sessions, weeks, final sets/reps, phase advancement, or Praxis integration.

## Hard Eligibility Modules

- `equipment_eligibility`
- `setup_eligibility`
- `personal_block_eligibility`
- `contraindication_eligibility`
- `capability_eligibility`
- `role_eligibility`
- `pain_review_eligibility`

Hard rules answer only whether an exercise is legal. Moderate pain currently creates warnings and scoring influence unless an explicit hard contraindication exists.

## Score Modules

- `role_fit`
- `goal_fit`
- `session_intent_fit`
- `muscle_target_fit`
- `assessment_fit`
- `alignment_fit`
- `pain_suitability`
- `experience_fit`
- `phase_fit`
- `stability_fit`
- `skill_fit`
- `progression_value`
- `continuity_value`
- `loadability`
- `stimulus_potential`
- `fatigue_cost`
- `joint_cost`
- `equipment_practicality`

Each component produces a 0-10 value, reason code, human-readable reason, source, and optional assessment influence.

## Controlled Scenarios

The scenario corpus in `src/data/candidateScenarios.ts` currently includes:

- `horizontal-pull-gym-neutral`
- `horizontal-pull-low-back-discomfort`
- `horizontal-pull-low-confidence-scapular`
- `scapular-activation-high-confidence`
- `horizontal-pull-productive-continuity`
- `horizontal-pull-plateau-replacement`
- `horizontal-push-phase-1`
- `horizontal-push-phase-3`
- `horizontal-push-shoulder-discomfort`
- `horizontal-push-no-bench`
- `lower-squat-phase-1`
- `lower-squat-phase-3`
- `lower-hinge-moderate-low-back-pain`
- `lower-hinge-capability-missing`
- `home-dumbbells-bench-horizontal-pull`
- `home-dumbbells-no-bench-horizontal-pull`
- `anchored-bands-horizontal-pull`
- `bands-without-anchor-horizontal-pull`
- `loop-bands-only-horizontal-pull`
- `bodyweight-personal-block-push-up`
- `rear-delt-accessory-scapular-priority`
- `horizontal-pull-fatigue-context`

## Representative Ranking Examples

| Scenario | Key Result |
| --- | --- |
| `horizontal-pull-low-back-discomfort` | `chest-supported-dumbbell-row` ranked above `one-arm-dumbbell-row`; pain and joint-cost components explain the difference. |
| `horizontal-push-phase-1` | `machine-chest-press` ranked first because Phase 1 favors supported, lower-complexity pressing. |
| `horizontal-push-phase-3` | `dumbbell-bench-press` ranked first because Phase 3 increases the value of loadability and progression. |
| `scapular-activation-high-confidence` | `band-face-pull` ranked first with visible assessment and alignment boosts. |
| `horizontal-pull-productive-continuity` | `chest-supported-dumbbell-row` ranked first when current/productive/progression-ready. |
| `horizontal-pull-plateau-replacement` | `chest-supported-dumbbell-row` dropped below alternative rows when plateau and failed progression were present. |
| `home-dumbbells-no-bench-horizontal-pull` | `chest-supported-dumbbell-row` was hard-rejected for equipment while `one-arm-dumbbell-row` remained legal. |
| `lower-hinge-capability-missing` | `dumbbell-romanian-deadlift` was hard-rejected for missing `hinge-control`; `cable-pull-through` remained available. |

## Assessment And Alignment

Low-confidence assessment signals remain visible but do not create alignment priorities. Confirmed, high-confidence priorities create `AlignmentPriority` records and influence score components through:

- `assessment_fit`
- `alignment_fit`
- pipeline snapshot `interpreted_assessment`
- pipeline snapshot `alignment_priorities`
- `DecisionTrace.topCandidateScores`

## Phase And Continuity

Phase is represented as developmental appropriateness, not simple difficulty. The same horizontal-push pool produces different rankings in Phase 1 and Phase 3.

Continuity is also not automatic repetition. Productive current work receives a positive `continuity_value`; plateau, failed progression, or pain response reduce that value and can justify replacement.

## Deliberately Rejected

- fixed workout templates patched after the fact;
- beginner equals machine-only;
- advanced equals automatically harder exercises;
- random novelty;
- giant hidden penalties used as fake hard gates;
- repeated program repair after poor selection;
- old-engine score blobs or catalog-specific special cases.

## Human Review Needed

- How strongly moderate pain should demote an otherwise good exercise before it becomes a hard stop.
- Which stress-tag overlaps should be clinically equivalent versus distinct.
- Whether some movement-role mismatches should become candidate-pool filtering rather than low score.
- Final weights for pain, joint cost, phase fit, and continuity.
- Exercise-science review of the two new reference exercises: `one-arm-dumbbell-row` and `machine-row`.
- Whether assessment priorities should influence main lift selection only directly, or also through preparation dependencies once session composition begins.

## Verification

Current commands:

```bash
npm run build --workspace=@praxis/training-engine-v2
npm run test --workspace=@praxis/training-engine-v2
```

<!-- SYNTHETIC_CONTRAST_TABLES_START -->
# Human Ranking Review: Synthetic Contrast Evidence

Generated from the current `runCandidateRankingLab` implementation. These tables are evidence only; no weights, eligibility, catalog data, or ranking behavior were changed to produce them.

Tables use the same score columns as the candidate pipeline. The signal columns show structured assessment-relevance traces when a signal actually affected the candidate.

### A. Horizontal Pull: No Low-Back Concern vs Mild Low-Back Concern

| mode | rank | exercise ID/name | total score | delta from OFF | roleFit | goalFit | sessionIntentFit | muscleTargetFit | assessmentFit | alignmentFit | painSuitability | phaseFit | stabilityFit | continuityValue | loadability | stimulusPotential | assessment signal IDs affecting candidate | signal confidence | signal priority | assessment relevance reason code | direction | shared bounded influence | assessmentContribution | alignmentContribution |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| OFF | 1 | chest-supported-dumbbell-row / Chest-Supported Dumbbell Row | 8.065 | 0.000 | 8.000 | 8.500 | 9.500 | 8.900 | 6.000 | 6.000 | 8.200 | 8.800 | 8.500 | 5.600 | 8.150 | 9.700 | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 | 0 | 0 |
| OFF | 2 | one-arm-dumbbell-row / One-Arm Dumbbell Row | 7.911 | 0.000 | 8.000 | 8.500 | 8.750 | 8.900 | 6.000 | 6.000 | 8.200 | 7.800 | 7.200 | 5.600 | 8.150 | 9.700 | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 | 0 | 0 |
| ON | 1 | chest-supported-dumbbell-row / Chest-Supported Dumbbell Row | 8.183 | 0.118 | 8.000 | 8.500 | 9.500 | 8.900 | 6.098 | 6.066 | 9.200 | 8.800 | 9.300 | 5.600 | 8.150 | 9.700 | low-back-hinge-control-priority:low-back-hinge-control-priority | low-back-hinge-control-priority:medium | low-back-hinge-control-priority:secondary | low-back-hinge-control-priority:ASSESSMENT_STABILITY_RELEVANT | low-back-hinge-control-priority:supports | low-back-hinge-control-priority:0.164 | low-back-hinge-control-priority:0.098 | low-back-hinge-control-priority:0.066 |
| ON | 2 | one-arm-dumbbell-row / One-Arm Dumbbell Row | 7.637 | -0.274 | 8.000 | 8.500 | 8.750 | 8.900 | 6.182 | 6.122 | 6.400 | 7.800 | 7.200 | 5.600 | 8.150 | 9.700 | low-back-hinge-control-priority:low-back-hinge-control-priority | low-back-hinge-control-priority:medium | low-back-hinge-control-priority:secondary | low-back-hinge-control-priority:ASSESSMENT_STABILITY_RELEVANT | low-back-hinge-control-priority:supports | low-back-hinge-control-priority:0.304 | low-back-hinge-control-priority:0.182 | low-back-hinge-control-priority:0.122 |

Rank movers and score deltas:
- chest-supported-dumbbell-row: rank 1 -> 1, total +0.118; caused by assessmentFit +0.098, alignmentFit +0.066, painSuitability +1.000, stabilityFit +0.800; not caused by roleFit unchanged, goalFit unchanged, sessionIntentFit unchanged, muscleTargetFit unchanged.
- one-arm-dumbbell-row: rank 2 -> 2, total -0.274; caused by assessmentFit +0.182, alignmentFit +0.122, painSuitability -1.800, jointCost -3.200; not caused by roleFit unchanged, goalFit unchanged, sessionIntentFit unchanged, muscleTargetFit unchanged.

Candidates whose ranking position did not change:
- chest-supported-dumbbell-row rank 1 -> 1, total +0.118.
- one-arm-dumbbell-row rank 2 -> 2, total -0.274.


### B. Scapular-Control Priority Absent vs High Confidence

| mode | rank | exercise ID/name | total score | delta from OFF | roleFit | goalFit | sessionIntentFit | muscleTargetFit | assessmentFit | alignmentFit | painSuitability | phaseFit | stabilityFit | continuityValue | loadability | stimulusPotential | assessment signal IDs affecting candidate | signal confidence | signal priority | assessment relevance reason code | direction | shared bounded influence | assessmentContribution | alignmentContribution |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| OFF | 1 | band-face-pull / Band Face Pull | 8.204 | 0.000 | 9.000 | 8.500 | 10.000 | 9.800 | 6.000 | 6.000 | 8.200 | 9.300 | 8.500 | 5.600 | 8.800 | 7.150 | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 | 0 | 0 |
| OFF | 2 | serratus-wall-slide / Serratus Wall Slide | 8.007 | 0.000 | 8.000 | 8.500 | 9.500 | 8.500 | 6.000 | 6.000 | 8.200 | 9.300 | 8.500 | 5.600 | 8.800 | 7.150 | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 | 0 | 0 |
| OFF | 3 | band-row / Band Row | 7.650 | 0.000 | 8.000 | 6.500 | 8.250 | 5.400 | 6.000 | 6.000 | 8.200 | 9.300 | 8.500 | 5.600 | 8.800 | 7.900 | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 | 0 | 0 |
| ON | 1 | band-face-pull / Band Face Pull | 8.271 | 0.067 | 9.000 | 8.500 | 10.000 | 9.800 | 6.720 | 6.480 | 8.200 | 9.300 | 8.500 | 5.600 | 8.800 | 7.150 | synthetic-high-scapular-control:synthetic-high-scapular-control | synthetic-high-scapular-control:high | synthetic-high-scapular-control:primary | synthetic-high-scapular-control:ASSESSMENT_MOVEMENT_RELEVANT | synthetic-high-scapular-control:supports | synthetic-high-scapular-control:1.200 | synthetic-high-scapular-control:0.720 | synthetic-high-scapular-control:0.480 |
| ON | 2 | serratus-wall-slide / Serratus Wall Slide | 8.073 | 0.066 | 8.000 | 8.500 | 9.500 | 8.500 | 6.720 | 6.480 | 8.200 | 9.300 | 8.500 | 5.600 | 8.800 | 7.150 | synthetic-high-scapular-control:synthetic-high-scapular-control | synthetic-high-scapular-control:high | synthetic-high-scapular-control:primary | synthetic-high-scapular-control:ASSESSMENT_MOVEMENT_RELEVANT | synthetic-high-scapular-control:supports | synthetic-high-scapular-control:1.200 | synthetic-high-scapular-control:0.720 | synthetic-high-scapular-control:0.480 |
| ON | 3 | band-row / Band Row | 7.717 | 0.067 | 8.000 | 6.500 | 8.250 | 5.400 | 6.720 | 6.480 | 8.200 | 9.300 | 8.500 | 5.600 | 8.800 | 7.900 | synthetic-high-scapular-control:synthetic-high-scapular-control | synthetic-high-scapular-control:high | synthetic-high-scapular-control:primary | synthetic-high-scapular-control:ASSESSMENT_JOINT_RELEVANT | synthetic-high-scapular-control:supports | synthetic-high-scapular-control:1.200 | synthetic-high-scapular-control:0.720 | synthetic-high-scapular-control:0.480 |

Rank movers and score deltas:
- band-face-pull: rank 1 -> 1, total +0.067; caused by assessmentFit +0.720, alignmentFit +0.480; not caused by roleFit unchanged, goalFit unchanged, sessionIntentFit unchanged, muscleTargetFit unchanged.
- serratus-wall-slide: rank 2 -> 2, total +0.066; caused by assessmentFit +0.720, alignmentFit +0.480; not caused by roleFit unchanged, goalFit unchanged, sessionIntentFit unchanged, muscleTargetFit unchanged.
- band-row: rank 3 -> 3, total +0.067; caused by assessmentFit +0.720, alignmentFit +0.480; not caused by roleFit unchanged, goalFit unchanged, sessionIntentFit unchanged, muscleTargetFit unchanged.

Candidates whose ranking position did not change:
- band-face-pull rank 1 -> 1, total +0.067.
- serratus-wall-slide rank 2 -> 2, total +0.066.
- band-row rank 3 -> 3, total +0.067.


### C1. Scapular-Control Low vs Medium Confidence

| mode | rank | exercise ID/name | total score | delta from OFF | roleFit | goalFit | sessionIntentFit | muscleTargetFit | assessmentFit | alignmentFit | painSuitability | phaseFit | stabilityFit | continuityValue | loadability | stimulusPotential | assessment signal IDs affecting candidate | signal confidence | signal priority | assessment relevance reason code | direction | shared bounded influence | assessmentContribution | alignmentContribution |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| OFF | 1 | band-face-pull / Band Face Pull | 8.204 | 0.000 | 9.000 | 8.500 | 10.000 | 9.800 | 6.000 | 6.000 | 8.200 | 9.300 | 8.500 | 5.600 | 8.800 | 7.150 | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 | 0 | 0 |
| OFF | 2 | serratus-wall-slide / Serratus Wall Slide | 8.007 | 0.000 | 8.000 | 8.500 | 9.500 | 8.500 | 6.000 | 6.000 | 8.200 | 9.300 | 8.500 | 5.600 | 8.800 | 7.150 | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 | 0 | 0 |
| OFF | 3 | band-row / Band Row | 7.650 | 0.000 | 8.000 | 6.500 | 8.250 | 5.400 | 6.000 | 6.000 | 8.200 | 9.300 | 8.500 | 5.600 | 8.800 | 7.900 | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 | 0 | 0 |
| ON | 1 | band-face-pull / Band Face Pull | 8.244 | 0.040 | 9.000 | 8.500 | 10.000 | 9.800 | 6.432 | 6.288 | 8.200 | 9.300 | 8.500 | 5.600 | 8.800 | 7.150 | synthetic-medium-scapular-control:synthetic-medium-scapular-control | synthetic-medium-scapular-control:medium | synthetic-medium-scapular-control:primary | synthetic-medium-scapular-control:ASSESSMENT_MOVEMENT_RELEVANT | synthetic-medium-scapular-control:supports | synthetic-medium-scapular-control:0.720 | synthetic-medium-scapular-control:0.432 | synthetic-medium-scapular-control:0.288 |
| ON | 2 | serratus-wall-slide / Serratus Wall Slide | 8.047 | 0.040 | 8.000 | 8.500 | 9.500 | 8.500 | 6.432 | 6.288 | 8.200 | 9.300 | 8.500 | 5.600 | 8.800 | 7.150 | synthetic-medium-scapular-control:synthetic-medium-scapular-control | synthetic-medium-scapular-control:medium | synthetic-medium-scapular-control:primary | synthetic-medium-scapular-control:ASSESSMENT_MOVEMENT_RELEVANT | synthetic-medium-scapular-control:supports | synthetic-medium-scapular-control:0.720 | synthetic-medium-scapular-control:0.432 | synthetic-medium-scapular-control:0.288 |
| ON | 3 | band-row / Band Row | 7.690 | 0.040 | 8.000 | 6.500 | 8.250 | 5.400 | 6.432 | 6.288 | 8.200 | 9.300 | 8.500 | 5.600 | 8.800 | 7.900 | synthetic-medium-scapular-control:synthetic-medium-scapular-control | synthetic-medium-scapular-control:medium | synthetic-medium-scapular-control:primary | synthetic-medium-scapular-control:ASSESSMENT_JOINT_RELEVANT | synthetic-medium-scapular-control:supports | synthetic-medium-scapular-control:0.720 | synthetic-medium-scapular-control:0.432 | synthetic-medium-scapular-control:0.288 |

Rank movers and score deltas:
- band-face-pull: rank 1 -> 1, total +0.040; caused by assessmentFit +0.432, alignmentFit +0.288; not caused by roleFit unchanged, goalFit unchanged, sessionIntentFit unchanged, muscleTargetFit unchanged.
- serratus-wall-slide: rank 2 -> 2, total +0.040; caused by assessmentFit +0.432, alignmentFit +0.288; not caused by roleFit unchanged, goalFit unchanged, sessionIntentFit unchanged, muscleTargetFit unchanged.
- band-row: rank 3 -> 3, total +0.040; caused by assessmentFit +0.432, alignmentFit +0.288; not caused by roleFit unchanged, goalFit unchanged, sessionIntentFit unchanged, muscleTargetFit unchanged.

Candidates whose ranking position did not change:
- band-face-pull rank 1 -> 1, total +0.040.
- serratus-wall-slide rank 2 -> 2, total +0.040.
- band-row rank 3 -> 3, total +0.040.


### C2. Scapular-Control Medium vs High Confidence

| mode | rank | exercise ID/name | total score | delta from OFF | roleFit | goalFit | sessionIntentFit | muscleTargetFit | assessmentFit | alignmentFit | painSuitability | phaseFit | stabilityFit | continuityValue | loadability | stimulusPotential | assessment signal IDs affecting candidate | signal confidence | signal priority | assessment relevance reason code | direction | shared bounded influence | assessmentContribution | alignmentContribution |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| OFF | 1 | band-face-pull / Band Face Pull | 8.244 | 0.000 | 9.000 | 8.500 | 10.000 | 9.800 | 6.432 | 6.288 | 8.200 | 9.300 | 8.500 | 5.600 | 8.800 | 7.150 | synthetic-medium-scapular-control:synthetic-medium-scapular-control | synthetic-medium-scapular-control:medium | synthetic-medium-scapular-control:primary | synthetic-medium-scapular-control:ASSESSMENT_MOVEMENT_RELEVANT | synthetic-medium-scapular-control:supports | synthetic-medium-scapular-control:0.720 | synthetic-medium-scapular-control:0.432 | synthetic-medium-scapular-control:0.288 |
| OFF | 2 | serratus-wall-slide / Serratus Wall Slide | 8.047 | 0.000 | 8.000 | 8.500 | 9.500 | 8.500 | 6.432 | 6.288 | 8.200 | 9.300 | 8.500 | 5.600 | 8.800 | 7.150 | synthetic-medium-scapular-control:synthetic-medium-scapular-control | synthetic-medium-scapular-control:medium | synthetic-medium-scapular-control:primary | synthetic-medium-scapular-control:ASSESSMENT_MOVEMENT_RELEVANT | synthetic-medium-scapular-control:supports | synthetic-medium-scapular-control:0.720 | synthetic-medium-scapular-control:0.432 | synthetic-medium-scapular-control:0.288 |
| OFF | 3 | band-row / Band Row | 7.690 | 0.000 | 8.000 | 6.500 | 8.250 | 5.400 | 6.432 | 6.288 | 8.200 | 9.300 | 8.500 | 5.600 | 8.800 | 7.900 | synthetic-medium-scapular-control:synthetic-medium-scapular-control | synthetic-medium-scapular-control:medium | synthetic-medium-scapular-control:primary | synthetic-medium-scapular-control:ASSESSMENT_JOINT_RELEVANT | synthetic-medium-scapular-control:supports | synthetic-medium-scapular-control:0.720 | synthetic-medium-scapular-control:0.432 | synthetic-medium-scapular-control:0.288 |
| ON | 1 | band-face-pull / Band Face Pull | 8.271 | 0.027 | 9.000 | 8.500 | 10.000 | 9.800 | 6.720 | 6.480 | 8.200 | 9.300 | 8.500 | 5.600 | 8.800 | 7.150 | synthetic-high-scapular-control:synthetic-high-scapular-control | synthetic-high-scapular-control:high | synthetic-high-scapular-control:primary | synthetic-high-scapular-control:ASSESSMENT_MOVEMENT_RELEVANT | synthetic-high-scapular-control:supports | synthetic-high-scapular-control:1.200 | synthetic-high-scapular-control:0.720 | synthetic-high-scapular-control:0.480 |
| ON | 2 | serratus-wall-slide / Serratus Wall Slide | 8.073 | 0.026 | 8.000 | 8.500 | 9.500 | 8.500 | 6.720 | 6.480 | 8.200 | 9.300 | 8.500 | 5.600 | 8.800 | 7.150 | synthetic-high-scapular-control:synthetic-high-scapular-control | synthetic-high-scapular-control:high | synthetic-high-scapular-control:primary | synthetic-high-scapular-control:ASSESSMENT_MOVEMENT_RELEVANT | synthetic-high-scapular-control:supports | synthetic-high-scapular-control:1.200 | synthetic-high-scapular-control:0.720 | synthetic-high-scapular-control:0.480 |
| ON | 3 | band-row / Band Row | 7.717 | 0.027 | 8.000 | 6.500 | 8.250 | 5.400 | 6.720 | 6.480 | 8.200 | 9.300 | 8.500 | 5.600 | 8.800 | 7.900 | synthetic-high-scapular-control:synthetic-high-scapular-control | synthetic-high-scapular-control:high | synthetic-high-scapular-control:primary | synthetic-high-scapular-control:ASSESSMENT_JOINT_RELEVANT | synthetic-high-scapular-control:supports | synthetic-high-scapular-control:1.200 | synthetic-high-scapular-control:0.720 | synthetic-high-scapular-control:0.480 |

Rank movers and score deltas:
- band-face-pull: rank 1 -> 1, total +0.027; caused by assessmentFit +0.288, alignmentFit +0.192; not caused by roleFit unchanged, goalFit unchanged, sessionIntentFit unchanged, muscleTargetFit unchanged.
- serratus-wall-slide: rank 2 -> 2, total +0.026; caused by assessmentFit +0.288, alignmentFit +0.192; not caused by roleFit unchanged, goalFit unchanged, sessionIntentFit unchanged, muscleTargetFit unchanged.
- band-row: rank 3 -> 3, total +0.027; caused by assessmentFit +0.288, alignmentFit +0.192; not caused by roleFit unchanged, goalFit unchanged, sessionIntentFit unchanged, muscleTargetFit unchanged.

Candidates whose ranking position did not change:
- band-face-pull rank 1 -> 1, total +0.027.
- serratus-wall-slide rank 2 -> 2, total +0.026.
- band-row rank 3 -> 3, total +0.027.


### D. Phase 1 vs Phase 3 Horizontal Push

| mode | rank | exercise ID/name | total score | delta from OFF | roleFit | goalFit | sessionIntentFit | muscleTargetFit | assessmentFit | alignmentFit | painSuitability | phaseFit | stabilityFit | continuityValue | loadability | stimulusPotential | assessment signal IDs affecting candidate | signal confidence | signal priority | assessment relevance reason code | direction | shared bounded influence | assessmentContribution | alignmentContribution |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| OFF | 1 | machine-chest-press / Machine Chest Press | 7.815 | 0.000 | 8.000 | 8.500 | 8.750 | 7.600 | 6.000 | 6.000 | 8.200 | 8.300 | 8.500 | 5.600 | 7.300 | 9.700 | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 | 0 | 0 |
| OFF | 2 | push-up / Push-Up | 7.793 | 0.000 | 8.000 | 8.500 | 8.750 | 8.900 | 6.000 | 6.000 | 8.200 | 6.200 | 7.200 | 5.600 | 8.150 | 8.600 | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 | 0 | 0 |
| OFF | 3 | dumbbell-bench-press / Dumbbell Bench Press | 7.643 | 0.000 | 8.000 | 8.500 | 9.500 | 7.600 | 6.000 | 6.000 | 8.200 | 6.200 | 7.200 | 5.600 | 7.300 | 9.700 | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 | 0 | 0 |
| ON | 1 | dumbbell-bench-press / Dumbbell Bench Press | 8.024 | 0.381 | 8.000 | 8.500 | 9.500 | 7.600 | 6.000 | 6.000 | 8.200 | 9.600 | 8.500 | 5.600 | 9.000 | 9.700 | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 | 0 | 0 |
| ON | 2 | machine-chest-press / Machine Chest Press | 7.979 | 0.164 | 8.000 | 8.500 | 8.750 | 7.600 | 6.000 | 6.000 | 8.200 | 8.600 | 8.500 | 5.600 | 9.000 | 9.700 | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 | 0 | 0 |
| ON | 3 | push-up / Push-Up | 7.818 | 0.025 | 8.000 | 8.500 | 8.750 | 8.900 | 6.000 | 6.000 | 8.200 | 6.200 | 8.500 | 5.600 | 8.150 | 8.600 | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 | 0 | 0 |

Rank movers and score deltas:
- machine-chest-press: rank 1 -> 2, total +0.164; caused by phaseFit +0.300, progressionValue +1.100, loadability +1.700; not caused by roleFit unchanged, goalFit unchanged, sessionIntentFit unchanged, muscleTargetFit unchanged.
- push-up: rank 2 -> 3, total +0.025; caused by stabilityFit +1.300, progressionValue -0.550; not caused by roleFit unchanged, goalFit unchanged, sessionIntentFit unchanged, muscleTargetFit unchanged.
- dumbbell-bench-press: rank 3 -> 1, total +0.381; caused by phaseFit +3.400, stabilityFit +1.300, progressionValue +0.550, loadability +1.700; not caused by roleFit unchanged, goalFit unchanged, sessionIntentFit unchanged, muscleTargetFit unchanged.

Candidates whose ranking position did not change:
- None.


### E. Successful Current-Exercise Progression vs Repeated Plateau/Failure

| mode | rank | exercise ID/name | total score | delta from OFF | roleFit | goalFit | sessionIntentFit | muscleTargetFit | assessmentFit | alignmentFit | painSuitability | phaseFit | stabilityFit | continuityValue | loadability | stimulusPotential | assessment signal IDs affecting candidate | signal confidence | signal priority | assessment relevance reason code | direction | shared bounded influence | assessmentContribution | alignmentContribution |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| OFF | 1 | chest-supported-dumbbell-row / Chest-Supported Dumbbell Row | 8.293 | 0.000 | 8.000 | 8.500 | 9.500 | 8.900 | 6.000 | 6.000 | 8.200 | 8.800 | 8.500 | 8.700 | 8.150 | 9.700 | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 | 0 | 0 |
| OFF | 2 | machine-row / Machine Row | 8.069 | 0.000 | 8.000 | 8.500 | 9.500 | 8.900 | 6.000 | 6.000 | 8.200 | 8.800 | 8.500 | 5.600 | 8.150 | 9.700 | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 | 0 | 0 |
| OFF | 3 | seated-cable-row / Seated Cable Row | 8.069 | 0.000 | 8.000 | 8.500 | 9.500 | 8.900 | 6.000 | 6.000 | 8.200 | 8.800 | 8.500 | 5.600 | 8.150 | 9.700 | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 | 0 | 0 |
| OFF | 4 | one-arm-dumbbell-row / One-Arm Dumbbell Row | 7.911 | 0.000 | 8.000 | 8.500 | 8.750 | 8.900 | 6.000 | 6.000 | 8.200 | 7.800 | 7.200 | 5.600 | 8.150 | 9.700 | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 | 0 | 0 |
| ON | 1 | machine-row / Machine Row | 8.069 | 0.000 | 8.000 | 8.500 | 9.500 | 8.900 | 6.000 | 6.000 | 8.200 | 8.800 | 8.500 | 5.600 | 8.150 | 9.700 | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 | 0 | 0 |
| ON | 2 | seated-cable-row / Seated Cable Row | 8.069 | 0.000 | 8.000 | 8.500 | 9.500 | 8.900 | 6.000 | 6.000 | 8.200 | 8.800 | 8.500 | 5.600 | 8.150 | 9.700 | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 | 0 | 0 |
| ON | 3 | one-arm-dumbbell-row / One-Arm Dumbbell Row | 7.911 | 0.000 | 8.000 | 8.500 | 8.750 | 8.900 | 6.000 | 6.000 | 8.200 | 7.800 | 7.200 | 5.600 | 8.150 | 9.700 | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 | 0 | 0 |
| ON | 4 | chest-supported-dumbbell-row / Chest-Supported Dumbbell Row | 7.854 | -0.439 | 8.000 | 8.500 | 9.500 | 8.900 | 6.000 | 6.000 | 8.200 | 8.800 | 8.500 | 4.000 | 8.150 | 9.700 | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 | 0 | 0 |

Rank movers and score deltas:
- chest-supported-dumbbell-row: rank 1 -> 4, total -0.439; caused by progressionValue -3.200, continuityValue -4.700; not caused by roleFit unchanged, goalFit unchanged, sessionIntentFit unchanged, muscleTargetFit unchanged.
- machine-row: rank 2 -> 1, total +0.000; caused by no component delta; not caused by roleFit unchanged, goalFit unchanged, sessionIntentFit unchanged, muscleTargetFit unchanged.
- seated-cable-row: rank 3 -> 2, total +0.000; caused by no component delta; not caused by roleFit unchanged, goalFit unchanged, sessionIntentFit unchanged, muscleTargetFit unchanged.
- one-arm-dumbbell-row: rank 4 -> 3, total +0.000; caused by no component delta; not caused by roleFit unchanged, goalFit unchanged, sessionIntentFit unchanged, muscleTargetFit unchanged.

Candidates whose ranking position did not change:
- None.


### F1. Trunk Signal in Horizontal Pull

| mode | rank | exercise ID/name | total score | delta from OFF | roleFit | goalFit | sessionIntentFit | muscleTargetFit | assessmentFit | alignmentFit | painSuitability | phaseFit | stabilityFit | continuityValue | loadability | stimulusPotential | assessment signal IDs affecting candidate | signal confidence | signal priority | assessment relevance reason code | direction | shared bounded influence | assessmentContribution | alignmentContribution |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| OFF | 1 | machine-row / Machine Row | 8.069 | 0.000 | 8.000 | 8.500 | 9.500 | 8.900 | 6.000 | 6.000 | 8.200 | 8.800 | 8.500 | 5.600 | 8.150 | 9.700 | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 | 0 | 0 |
| OFF | 2 | seated-cable-row / Seated Cable Row | 8.069 | 0.000 | 8.000 | 8.500 | 9.500 | 8.900 | 6.000 | 6.000 | 8.200 | 8.800 | 8.500 | 5.600 | 8.150 | 9.700 | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 | 0 | 0 |
| OFF | 3 | chest-supported-dumbbell-row / Chest-Supported Dumbbell Row | 8.065 | 0.000 | 8.000 | 8.500 | 9.500 | 8.900 | 6.000 | 6.000 | 8.200 | 8.800 | 8.500 | 5.600 | 8.150 | 9.700 | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 | 0 | 0 |
| OFF | 4 | one-arm-dumbbell-row / One-Arm Dumbbell Row | 7.911 | 0.000 | 8.000 | 8.500 | 8.750 | 8.900 | 6.000 | 6.000 | 8.200 | 7.800 | 7.200 | 5.600 | 8.150 | 9.700 | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 | 0 | 0 |
| ON | 1 | chest-supported-dumbbell-row / Chest-Supported Dumbbell Row | 8.089 | 0.024 | 8.000 | 8.500 | 9.500 | 8.900 | 6.252 | 6.168 | 8.200 | 8.800 | 8.500 | 5.600 | 8.150 | 9.700 | synthetic-trunk-control:synthetic-trunk-control | synthetic-trunk-control:high | synthetic-trunk-control:primary | synthetic-trunk-control:ASSESSMENT_STABILITY_RELEVANT | synthetic-trunk-control:supports | synthetic-trunk-control:0.420 | synthetic-trunk-control:0.252 | synthetic-trunk-control:0.168 |
| ON | 2 | machine-row / Machine Row | 8.069 | 0.000 | 8.000 | 8.500 | 9.500 | 8.900 | 6.000 | 6.000 | 8.200 | 8.800 | 8.500 | 5.600 | 8.150 | 9.700 | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 | 0 | 0 |
| ON | 3 | seated-cable-row / Seated Cable Row | 8.069 | 0.000 | 8.000 | 8.500 | 9.500 | 8.900 | 6.000 | 6.000 | 8.200 | 8.800 | 8.500 | 5.600 | 8.150 | 9.700 | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 | 0 | 0 |
| ON | 4 | one-arm-dumbbell-row / One-Arm Dumbbell Row | 7.955 | 0.044 | 8.000 | 8.500 | 8.750 | 8.900 | 6.468 | 6.312 | 8.200 | 7.800 | 7.200 | 5.600 | 8.150 | 9.700 | synthetic-trunk-control:synthetic-trunk-control | synthetic-trunk-control:high | synthetic-trunk-control:primary | synthetic-trunk-control:ASSESSMENT_STABILITY_RELEVANT | synthetic-trunk-control:supports | synthetic-trunk-control:0.780 | synthetic-trunk-control:0.468 | synthetic-trunk-control:0.312 |

Rank movers and score deltas:
- machine-row: rank 1 -> 2, total +0.000; caused by no component delta; not caused by roleFit unchanged, goalFit unchanged, sessionIntentFit unchanged, muscleTargetFit unchanged.
- seated-cable-row: rank 2 -> 3, total +0.000; caused by no component delta; not caused by roleFit unchanged, goalFit unchanged, sessionIntentFit unchanged, muscleTargetFit unchanged.
- chest-supported-dumbbell-row: rank 3 -> 1, total +0.024; caused by assessmentFit +0.252, alignmentFit +0.168; not caused by roleFit unchanged, goalFit unchanged, sessionIntentFit unchanged, muscleTargetFit unchanged.
- one-arm-dumbbell-row: rank 4 -> 4, total +0.044; caused by assessmentFit +0.468, alignmentFit +0.312; not caused by roleFit unchanged, goalFit unchanged, sessionIntentFit unchanged, muscleTargetFit unchanged.

Candidates whose ranking position did not change:
- one-arm-dumbbell-row rank 4 -> 4, total +0.044.


### F2. Trunk Signal in Horizontal Push

| mode | rank | exercise ID/name | total score | delta from OFF | roleFit | goalFit | sessionIntentFit | muscleTargetFit | assessmentFit | alignmentFit | painSuitability | phaseFit | stabilityFit | continuityValue | loadability | stimulusPotential | assessment signal IDs affecting candidate | signal confidence | signal priority | assessment relevance reason code | direction | shared bounded influence | assessmentContribution | alignmentContribution |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| OFF | 1 | dumbbell-bench-press / Dumbbell Bench Press | 7.990 | 0.000 | 8.000 | 8.000 | 9.500 | 7.600 | 6.000 | 6.000 | 8.200 | 9.600 | 8.500 | 5.600 | 9.000 | 9.700 | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 | 0 | 0 |
| OFF | 2 | machine-chest-press / Machine Chest Press | 7.875 | 0.000 | 8.000 | 8.000 | 8.750 | 7.600 | 6.000 | 6.000 | 8.200 | 8.600 | 8.500 | 5.600 | 9.000 | 9.700 | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 | 0 | 0 |
| OFF | 3 | push-up / Push-Up | 7.726 | 0.000 | 8.000 | 8.000 | 8.750 | 8.900 | 6.000 | 6.000 | 8.200 | 6.200 | 8.500 | 5.600 | 8.150 | 8.600 | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 | 0 | 0 |
| ON | 1 | dumbbell-bench-press / Dumbbell Bench Press | 8.013 | 0.023 | 8.000 | 8.000 | 9.500 | 7.600 | 6.252 | 6.168 | 8.200 | 9.600 | 8.500 | 5.600 | 9.000 | 9.700 | synthetic-trunk-control:synthetic-trunk-control | synthetic-trunk-control:high | synthetic-trunk-control:primary | synthetic-trunk-control:ASSESSMENT_STABILITY_RELEVANT | synthetic-trunk-control:supports | synthetic-trunk-control:0.420 | synthetic-trunk-control:0.252 | synthetic-trunk-control:0.168 |
| ON | 2 | machine-chest-press / Machine Chest Press | 7.875 | 0.000 | 8.000 | 8.000 | 8.750 | 7.600 | 6.000 | 6.000 | 8.200 | 8.600 | 8.500 | 5.600 | 9.000 | 9.700 | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 | 0 | 0 |
| ON | 3 | push-up / Push-Up | 7.769 | 0.043 | 8.000 | 8.000 | 8.750 | 8.900 | 6.468 | 6.312 | 8.200 | 6.200 | 8.500 | 5.600 | 8.150 | 8.600 | synthetic-trunk-control:synthetic-trunk-control | synthetic-trunk-control:high | synthetic-trunk-control:primary | synthetic-trunk-control:ASSESSMENT_STABILITY_RELEVANT | synthetic-trunk-control:supports | synthetic-trunk-control:0.780 | synthetic-trunk-control:0.468 | synthetic-trunk-control:0.312 |

Rank movers and score deltas:
- dumbbell-bench-press: rank 1 -> 1, total +0.023; caused by assessmentFit +0.252, alignmentFit +0.168; not caused by roleFit unchanged, goalFit unchanged, sessionIntentFit unchanged, muscleTargetFit unchanged.
- push-up: rank 3 -> 3, total +0.043; caused by assessmentFit +0.468, alignmentFit +0.312; not caused by roleFit unchanged, goalFit unchanged, sessionIntentFit unchanged, muscleTargetFit unchanged.

Candidates whose ranking position did not change:
- dumbbell-bench-press rank 1 -> 1, total +0.023.
- machine-chest-press rank 2 -> 2, total +0.000.
- push-up rank 3 -> 3, total +0.043.


### F3. Trunk Signal in Squat

| mode | rank | exercise ID/name | total score | delta from OFF | roleFit | goalFit | sessionIntentFit | muscleTargetFit | assessmentFit | alignmentFit | painSuitability | phaseFit | stabilityFit | continuityValue | loadability | stimulusPotential | assessment signal IDs affecting candidate | signal confidence | signal priority | assessment relevance reason code | direction | shared bounded influence | assessmentContribution | alignmentContribution |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| OFF | 1 | leg-press / Leg Press | 8.039 | 0.000 | 8.000 | 8.000 | 9.500 | 8.900 | 6.000 | 6.000 | 8.200 | 9.600 | 8.500 | 5.600 | 9.000 | 9.700 | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 | 0 | 0 |
| OFF | 2 | goblet-squat / Goblet Squat | 7.763 | 0.000 | 8.000 | 8.000 | 9.500 | 8.900 | 6.000 | 6.000 | 8.200 | 6.200 | 8.500 | 5.600 | 8.150 | 8.600 | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 | 0 | 0 |
| ON | 1 | leg-press / Leg Press | 8.039 | 0.000 | 8.000 | 8.000 | 9.500 | 8.900 | 6.000 | 6.000 | 8.200 | 9.600 | 8.500 | 5.600 | 9.000 | 9.700 | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 | 0 | 0 |
| ON | 2 | goblet-squat / Goblet Squat | 7.806 | 0.043 | 8.000 | 8.000 | 9.500 | 8.900 | 6.468 | 6.312 | 8.200 | 6.200 | 8.500 | 5.600 | 8.150 | 8.600 | synthetic-trunk-control:synthetic-trunk-control | synthetic-trunk-control:high | synthetic-trunk-control:primary | synthetic-trunk-control:ASSESSMENT_STABILITY_RELEVANT | synthetic-trunk-control:supports | synthetic-trunk-control:0.780 | synthetic-trunk-control:0.468 | synthetic-trunk-control:0.312 |

Rank movers and score deltas:
- goblet-squat: rank 2 -> 2, total +0.043; caused by assessmentFit +0.468, alignmentFit +0.312; not caused by roleFit unchanged, goalFit unchanged, sessionIntentFit unchanged, muscleTargetFit unchanged.

Candidates whose ranking position did not change:
- leg-press rank 1 -> 1, total +0.000.
- goblet-squat rank 2 -> 2, total +0.043.


### F4. Trunk Signal in Activation

| mode | rank | exercise ID/name | total score | delta from OFF | roleFit | goalFit | sessionIntentFit | muscleTargetFit | assessmentFit | alignmentFit | painSuitability | phaseFit | stabilityFit | continuityValue | loadability | stimulusPotential | assessment signal IDs affecting candidate | signal confidence | signal priority | assessment relevance reason code | direction | shared bounded influence | assessmentContribution | alignmentContribution |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| OFF | 1 | band-face-pull / Band Face Pull | 8.204 | 0.000 | 9.000 | 8.500 | 10.000 | 9.800 | 6.000 | 6.000 | 8.200 | 9.300 | 8.500 | 5.600 | 8.800 | 7.150 | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 | 0 | 0 |
| OFF | 2 | serratus-wall-slide / Serratus Wall Slide | 8.007 | 0.000 | 8.000 | 8.500 | 9.500 | 8.500 | 6.000 | 6.000 | 8.200 | 9.300 | 8.500 | 5.600 | 8.800 | 7.150 | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 | 0 | 0 |
| OFF | 3 | band-row / Band Row | 7.650 | 0.000 | 8.000 | 6.500 | 8.250 | 5.400 | 6.000 | 6.000 | 8.200 | 9.300 | 8.500 | 5.600 | 8.800 | 7.900 | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 | 0 | 0 |
| ON | 1 | band-face-pull / Band Face Pull | 8.204 | 0.000 | 9.000 | 8.500 | 10.000 | 9.800 | 6.000 | 6.000 | 8.200 | 9.300 | 8.500 | 5.600 | 8.800 | 7.150 | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 | 0 | 0 |
| ON | 2 | serratus-wall-slide / Serratus Wall Slide | 8.007 | 0.000 | 8.000 | 8.500 | 9.500 | 8.500 | 6.000 | 6.000 | 8.200 | 9.300 | 8.500 | 5.600 | 8.800 | 7.150 | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 | 0 | 0 |
| ON | 3 | band-row / Band Row | 7.650 | 0.000 | 8.000 | 6.500 | 8.250 | 5.400 | 6.000 | 6.000 | 8.200 | 9.300 | 8.500 | 5.600 | 8.800 | 7.900 | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 | 0 | 0 |

Rank movers and score deltas:
- No rank or score movers.

Candidates whose ranking position did not change:
- band-face-pull rank 1 -> 1, total +0.000.
- serratus-wall-slide rank 2 -> 2, total +0.000.
- band-row rank 3 -> 3, total +0.000.
<!-- SYNTHETIC_CONTRAST_TABLES_END -->
