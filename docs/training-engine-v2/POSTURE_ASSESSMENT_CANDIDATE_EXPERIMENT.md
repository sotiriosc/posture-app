# Posture Assessment Candidate Experiment

`ENGINE_V2_BLUEPRINT.md` remains authoritative.

## Checkpoint

Candidate Intelligence was checkpointed first:

- Branch: `engine-v2/candidate-intelligence`
- Checkpoint SHA: `1d84ca0a8bf21e2542ee30cf33e88c458e96ad8a`
- Commit: `feat(training-engine-v2): add candidate intelligence laboratory`

No merge was performed.

## Photo Files Discovered

The posture photos were not under the V2 worktree's `docs/` directory. They were found in the sibling release worktree:

- `/home/sotiriosc/posture-app/docs/posturefront.png`
- `/home/sotiriosc/posture-app/docs/postureback.png`
- `/home/sotiriosc/posture-app/docs/postureside.png`

All three are PNG images at `896 x 1195`. The originals were not modified or moved.

## Existing Assessment Pipeline Used

Read-only files inspected:

- `packages/engine/src/poseAnalyzer.ts`
- `packages/engine/src/assessmentEngine.ts`
- `apps/consumer/src/components/results/usePoseAssessment.ts`
- `apps/consumer/src/components/PhotoUploader.tsx`
- `packages/engine/src/engine/poseFocus.ts`
- `packages/engine/tests/unit/assessmentEngine.test.ts`
- `packages/engine/tests/unit/poseFocusConfidenceGate.test.ts`

Existing browser flow:

1. `PhotoUploader` collects `front`, `side`, and `back` files.
2. `usePoseAssessment` loads each `File` into an `HTMLImageElement`.
3. `analyzeImagePose` runs MoveNet via TensorFlow.js.
4. `computeMetrics` derives per-view metrics.
5. `generateObservations` creates per-view pose observations and priorities.
6. `usePoseAssessment` combines front/back/side metrics.
7. `buildAssessmentReport` creates normalized `AssessmentReport` observations.
8. Old engine pose-focus code can derive focus tags from `PoseAnalysis`.

The app pipeline has confidence values:

- per-keypoint scores from MoveNet;
- per-view `confidenceScore` from average keypoint score;
- report-level confidence bucket: `low`, `medium`, or `high`.

## Real Image Analysis

Real image analysis executed successfully without modifying apps or `packages/engine`.

Because the app helper expects browser `HTMLImageElement`, the experiment used a throwaway developer script that decoded the PNGs with `sharp`, created TensorFlow tensors, and then called the existing Praxis functions:

- `loadPoseModel`
- `computeMetrics`
- `generateObservations`
- `buildAssessmentReport`

Training Engine V2 did not inspect images. V2 consumed only the derived structured fixture under:

- `packages/training-engine-v2/tests/fixtures/posture/realPostureAssessmentFixture.ts`
- `packages/training-engine-v2/tests/fixtures/posture/postureCandidateExperimentFixture.ts`

## Pose Outputs

| View | Confidence |
| --- | ---: |
| Front | 0.7476 |
| Back | 0.7316 |
| Side | 0.5624 |
| Combined | 0.6805 |

Report confidence bucket: `medium`.

Raw pose observations included:

- front head position offset;
- front torso lean;
- front hip-to-shoulder offset;
- front hip lateral shift;
- back head position offset;
- back torso lean;
- back hip-to-shoulder offset;
- side knee tracking offset;
- side head position offset.

The existing `AssessmentReport` normalized these pose observations:

| Source Observation | Confidence | V2 Signal | V2 Region | V2 Movement Role | Priority |
| --- | --- | --- | --- | --- | --- |
| `pose-trunk-bias` | medium | `photo-pose-trunk-bias` | `lumbar_spine` | `anti_extension_core` | primary |
| `pose-hip-shift` | medium | `photo-pose-hip-shift` | `hip` | `single_leg` | primary |
| `pose-knee-alignment` | medium | `photo-pose-knee-alignment` | `knee` | `squat` | secondary |

The existing report also emitted `goal-posture-control` from questionnaire goal text. That self-report observation was intentionally not converted for this photo-only experiment.

## Important Pipeline Observation

`UPSTREAM_ASSESSMENT_NORMALIZATION_GAP`

Raw pose output contained repeated head-position observations, but `buildAssessmentReport` did not emit `pose-forward-head`. The likely reason is a wording mismatch: `generateObservations` emits "Head position measured...", while `buildPoseObservations` looks for text containing "forward head".

That looks like under-normalization in the existing assessment pipeline, not a V2 issue.

V2 must not invent this missing finding. The existing assessment pipeline should be reviewed separately.

## Candidate Scenarios Tested

All comparisons used the same athlete/context:

- persona: `intermediate-gym-muscle-gain`
- phase: `phase_2`
- equipment: full gym
- pain: none
- prerequisites satisfied: `push-up-plank-control`, `hinge-control`, `overhead-control`

Each request was run twice:

- CONTROL: empty assessment
- ASSESSMENT: real normalized posture findings enabled

## Ranking Comparisons

### Horizontal Push

| Rank | Control | Assessment |
| ---: | --- | --- |
| 1 | `dumbbell-bench-press` 7.961 | `push-up` 8.017 |
| 2 | `push-up` 7.930 | `dumbbell-bench-press` 7.961 |
| 3 | `machine-chest-press` 7.846 | `machine-chest-press` 7.846 |
| 4 | `dumbbell-shoulder-press` 7.428 | `goblet-squat` 7.622 |
| 5 | `lat-pulldown` 7.398 | `dumbbell-romanian-deadlift` 7.611 |

Meaningful changes:

- `push-up`: rank 2 -> 1, `assessmentFit +1.12`, `alignmentFit +0.45`
- `goblet-squat`: rank 9 -> 4, `assessmentFit +2.88`, `alignmentFit +1.35`
- `dumbbell-romanian-deadlift`: rank 10 -> 5, `assessmentFit +2.88`, `alignmentFit +1.35`

Interpretation: this is not ideal. Lower-body and hinge candidates should not climb into a horizontal-push top five just because they match assessment signals. This suggests V2 currently allows assessment/alignment boosts to leak too strongly into mismatched roles.

### Horizontal Pull

| Rank | Control | Assessment |
| ---: | --- | --- |
| 1 | `machine-row` 8.069 | `chest-supported-dumbbell-row` 8.153 |
| 2 | `seated-cable-row` 8.069 | `one-arm-dumbbell-row` 8.086 |
| 3 | `chest-supported-dumbbell-row` 8.065 | `machine-row` 8.069 |
| 4 | `one-arm-dumbbell-row` 7.911 | `seated-cable-row` 8.069 |
| 5 | `lat-pulldown` 7.651 | `dumbbell-romanian-deadlift` 7.698 |

Representative trace:

- Candidate: `chest-supported-dumbbell-row`
- Control rank: 3
- Assessment rank: 1
- `assessmentFit +1.12`
- `alignmentFit +0.45`
- Signal: `photo-pose-trunk-bias`
- Confidence: medium
- Direction: supports

Interpretation: the chest-supported row movement is plausible because the exercise has low trunk demand and relevant upper-pull stimulus. The `dumbbell-romanian-deadlift` entering the top five is less desirable because the requested role is horizontal pull.

### Trunk Activation

| Rank | Control | Assessment |
| ---: | --- | --- |
| 1 | `pallof-press` 7.749 | `pallof-press` 7.897 |
| 2 | `dead-bug` 7.670 | `dead-bug` 7.757 |
| 3 | `glute-bridge` 7.202 | `glute-bridge` 7.437 |
| 4 | `band-face-pull` 7.196 | `cable-pull-through` 7.378 |
| 5 | `reverse-pec-deck` 7.192 | `bodyweight-box-squat` 7.350 |

Representative trace:

- Candidate: `pallof-press`
- Control rank: 1
- Assessment rank: 1
- `assessmentFit +1.76`
- `alignmentFit +0.90`
- Signal: `photo-pose-trunk-bias`
- Confidence: medium
- Direction: supports

Interpretation: this is sensible. The ranking stays anchored to the trunk-control need, and assessment influence increases relevant candidates without overturning the top choice.

### Squat Main

| Rank | Control | Assessment |
| ---: | --- | --- |
| 1 | `goblet-squat` 8.059 | `goblet-squat` 8.294 |
| 2 | `leg-press` 8.041 | `leg-press` 8.189 |
| 3 | `dumbbell-romanian-deadlift` 7.543 | `dumbbell-romanian-deadlift` 7.778 |
| 4 | `lat-pulldown` 7.398 | `chest-supported-dumbbell-row` 7.481 |
| 5 | `machine-row` 7.398 | `one-arm-dumbbell-row` 7.414 |

Meaningful changes:

- `goblet-squat`: rank 1 -> 1, `assessmentFit +2.88`, `alignmentFit +1.35`
- `leg-press`: rank 2 -> 2, `assessmentFit +1.76`, `alignmentFit +0.90`

Interpretation: the top two staying stable is good. Pull exercises moving up because of body-region overlap is questionable.

### Single-Leg Accessory

| Rank | Control | Assessment |
| ---: | --- | --- |
| 1 | `step-up` 7.795 | `step-up` 8.030 |
| 2 | `split-squat` 7.753 | `split-squat` 7.988 |
| 3 | `glute-bridge` 7.416 | `glute-bridge` 7.651 |
| 4 | `cable-pull-through` 7.403 | `cable-pull-through` 7.638 |
| 5 | `pallof-press` 7.329 | `pallof-press` 7.477 |

Interpretation: this is sensible. Hip and knee findings boost relevant lower-body options while preserving the same top ordering.

## Unchanged Or Mostly Unchanged Examples

- `machine-chest-press` stayed rank 3 and score 7.846 in horizontal push.
- `machine-row` and `seated-cable-row` kept their exact scores in horizontal pull, though their ranks shifted because other candidates were boosted.
- `pallof-press` remained rank 1 for trunk activation.
- `goblet-squat` and `leg-press` remained ranks 1 and 2 for squat main.
- `step-up` and `split-squat` remained ranks 1 and 2 for single-leg accessory.

## Over-Weighting Signals

There is apparent over-weighting or over-broad relevance:

- Assessment boosts can elevate exercises that match body region or muscle group but not the requested movement role.
- `goblet-squat` and `dumbbell-romanian-deadlift` climbed into horizontal-push rankings.
- `dumbbell-romanian-deadlift` climbed into horizontal-pull rankings.
- Assessment and alignment components can double-count the same signal enough to move mismatched candidates.

No tuning was performed for this experiment.

## Under-Weighting Or Missing Normalization

The existing pipeline appears to under-normalize forward-head evidence:

- Raw pose observations included head-position measurements from front, back, and side views.
- `AssessmentReport` did not emit `pose-forward-head`.
- This prevented V2 from receiving a normalized neck/thoracic/head-position signal.

This should be reviewed in the existing assessment layer before V2 is expected to respond to that finding.

## Duplicated Influence

`assessmentFit` and `alignmentFit` both respond to the same source signals. This is acceptable as an inspectable design if weights remain modest, but the experiment shows duplicated influence can become too broad when movement-role mismatch is only a soft scoring concern.

## Exercise-Science Questions

- Should posture-photo findings affect only matching requested roles, or can they boost preparation-like alternatives inside a main-role request?
- Should body-region overlap count when movement-role overlap is absent?
- Should a medium-confidence photo finding ever move a non-requested movement pattern into a top five?
- Should trunk/hip findings influence unsupported pulling differently from supported pulling?
- Should photo-derived findings require role-specific adapter mappings rather than broad `region` and `muscleGroup` matching?

## Stop Condition

No full session was composed. No week was composed. No phase progression was implemented. No Praxis UI integration was added. The existing assessment system was not modified. V2 still does not interpret images.

## Assessment Relevance Scoping Follow-Up

After the initial experiment exposed cross-role contamination, V2 was updated so role/training-need truth is established before assessment influence.

New invariant:

```text
ROLE / TRAINING NEED TRUTH
comes before
ASSESSMENT INFLUENCE
```

Assessment can influence ranking among truthful candidates, but it cannot make a squat, hinge, push, pull, activation, or accessory exercise legal for an unrelated request.

### Follow-Up OFF vs ON Results

Horizontal push:

| Rank | Control | Assessment |
| ---: | --- | --- |
| 1 | `dumbbell-bench-press` 7.961 | `dumbbell-bench-press` 7.975 |
| 2 | `push-up` 7.930 | `push-up` 7.956 |
| 3 | `machine-chest-press` 7.846 | `machine-chest-press` 7.846 |

Lower-body/hinge candidates no longer enter the legal horizontal-push ranking pool.

Horizontal pull:

| Rank | Control | Assessment |
| ---: | --- | --- |
| 1 | `machine-row` 8.069 | `chest-supported-dumbbell-row` 8.079 |
| 2 | `seated-cable-row` 8.069 | `machine-row` 8.069 |
| 3 | `chest-supported-dumbbell-row` 8.065 | `seated-cable-row` 8.069 |
| 4 | `one-arm-dumbbell-row` 7.911 | `one-arm-dumbbell-row` 7.937 |

Lower-body/hinge candidates no longer enter the legal horizontal-pull ranking pool. The trunk finding can still modestly influence truthful row candidates with candidate-specific trunk/stability relevance.

Trunk activation:

| Rank | Control | Assessment |
| ---: | --- | --- |
| 1 | `pallof-press` 7.749 | `pallof-press` 7.789 |
| 2 | `dead-bug` 7.670 | `dead-bug` 7.710 |

Squat main:

| Rank | Control | Assessment |
| ---: | --- | --- |
| 1 | `goblet-squat` 8.059 | `goblet-squat` 8.151 |
| 2 | `leg-press` 8.041 | `leg-press` 8.107 |

Single-leg accessory:

| Rank | Control | Assessment |
| ---: | --- | --- |
| 1 | `step-up` 7.795 | `step-up` 7.887 |
| 2 | `split-squat` 7.753 | `split-squat` 7.845 |

### Remaining Notes

The original over-weighting section above is preserved as the defect discovery record. After scoping, the remaining unintuitive point is that trunk-control findings can modestly boost supported bench/row candidates when those exercises have any modeled trunk/stability relation. This is bounded and no longer creates cross-role eligibility, but it may need exercise-science review before final tuning.

<!-- HUMAN_RANKING_REVIEW_START -->
# Human Ranking Review

Generated from the current `runCandidateRankingLab` implementation. This is observation-only evidence; no scoring, eligibility, exercise metadata, session composition, or week composition was changed to produce these tables.

## Real Posture Assessment Tables

### A. Horizontal Push

| mode | rank | exercise ID/name | total score | delta from OFF | roleFit | goalFit | sessionIntentFit | muscleTargetFit | assessmentFit | alignmentFit | painSuitability | experienceFit | phaseFit | stabilityFit | skillFit | progressionValue | continuityValue | loadability | stimulusPotential | fatigueCost | jointCost | equipmentPracticality | assessment signal IDs affecting candidate | signal confidence | signal priority | assessment relevance reason code | direction | shared bounded influence | assessmentContribution | alignmentContribution |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| OFF | 1 | dumbbell-bench-press / Dumbbell Bench Press | 7.961 | 0.000 | 8.000 | 8.500 | 9.500 | 7.600 | 6.000 | 6.000 | 8.200 | 8.265 | 8.800 | 8.500 | 7.400 | 8.150 | 5.600 | 8.150 | 9.700 | 7.650 | 8.800 | 8.250 | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 | 0 | 0 |
| OFF | 2 | push-up / Push-Up | 7.930 | 0.000 | 8.000 | 8.500 | 8.750 | 8.900 | 6.000 | 6.000 | 8.200 | 7.590 | 7.800 | 8.500 | 7.950 | 7.600 | 5.600 | 9.000 | 8.600 | 8.450 | 8.800 | 8.700 | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 | 0 | 0 |
| OFF | 3 | machine-chest-press / Machine Chest Press | 7.846 | 0.000 | 8.000 | 8.500 | 8.750 | 7.600 | 6.000 | 6.000 | 8.200 | 6.915 | 7.800 | 8.500 | 8.500 | 8.150 | 5.600 | 8.150 | 9.700 | 7.650 | 8.800 | 8.350 | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 | 0 | 0 |
| ON | 1 | dumbbell-bench-press / Dumbbell Bench Press | 7.975 | 0.014 | 8.000 | 8.500 | 9.500 | 7.600 | 6.151 | 6.101 | 8.200 | 8.265 | 8.800 | 8.500 | 7.400 | 8.150 | 5.600 | 8.150 | 9.700 | 7.650 | 8.800 | 8.250 | photo-pose-trunk-bias:photo-pose-trunk-bias | photo-pose-trunk-bias:medium | photo-pose-trunk-bias:primary | photo-pose-trunk-bias:ASSESSMENT_STABILITY_RELEVANT | photo-pose-trunk-bias:supports | photo-pose-trunk-bias:0.252 | photo-pose-trunk-bias:0.151 | photo-pose-trunk-bias:0.101 |
| ON | 2 | push-up / Push-Up | 7.956 | 0.026 | 8.000 | 8.500 | 8.750 | 8.900 | 6.281 | 6.187 | 8.200 | 7.590 | 7.800 | 8.500 | 7.950 | 7.600 | 5.600 | 9.000 | 8.600 | 8.450 | 8.800 | 8.700 | photo-pose-trunk-bias:photo-pose-trunk-bias | photo-pose-trunk-bias:medium | photo-pose-trunk-bias:primary | photo-pose-trunk-bias:ASSESSMENT_STABILITY_RELEVANT | photo-pose-trunk-bias:supports | photo-pose-trunk-bias:0.468 | photo-pose-trunk-bias:0.281 | photo-pose-trunk-bias:0.187 |
| ON | 3 | machine-chest-press / Machine Chest Press | 7.846 | 0.000 | 8.000 | 8.500 | 8.750 | 7.600 | 6.000 | 6.000 | 8.200 | 6.915 | 7.800 | 8.500 | 8.500 | 8.150 | 5.600 | 8.150 | 9.700 | 7.650 | 8.800 | 8.350 | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 | 0 | 0 |

#### A. Horizontal Push Hard-Rejected Candidates

| Exercise | Rejection stage | Reason code | Explanation |
| --- | --- | --- | --- |
| ninety-ninety-breathing / 90/90 Breathing | role_eligibility | ROLE_MISMATCH | 90/90 Breathing is not defined for primary_strength. |
| ninety-ninety-breathing / 90/90 Breathing | role_eligibility | TRAINING_NEED_MISMATCH | 90/90 Breathing is not suitable for the requested main section. |
| ninety-ninety-breathing / 90/90 Breathing | role_eligibility | TRAINING_NEED_MISMATCH | 90/90 Breathing does not match the requested movement role(s). |
| ninety-ninety-breathing / 90/90 Breathing | role_eligibility | TRAINING_NEED_MISMATCH | 90/90 Breathing does not train the requested target muscle(s). |
| serratus-wall-slide / Serratus Wall Slide | role_eligibility | ROLE_MISMATCH | Serratus Wall Slide is not defined for primary_strength. |
| serratus-wall-slide / Serratus Wall Slide | role_eligibility | TRAINING_NEED_MISMATCH | Serratus Wall Slide is not suitable for the requested main section. |
| serratus-wall-slide / Serratus Wall Slide | role_eligibility | TRAINING_NEED_MISMATCH | Serratus Wall Slide does not match the requested movement role(s). |
| serratus-wall-slide / Serratus Wall Slide | role_eligibility | TRAINING_NEED_MISMATCH | Serratus Wall Slide does not train the requested target muscle(s). |
| dead-bug / Dead Bug | role_eligibility | ROLE_MISMATCH | Dead Bug is not defined for primary_strength. |
| dead-bug / Dead Bug | role_eligibility | TRAINING_NEED_MISMATCH | Dead Bug is not suitable for the requested main section. |
| dead-bug / Dead Bug | role_eligibility | TRAINING_NEED_MISMATCH | Dead Bug does not match the requested movement role(s). |
| dead-bug / Dead Bug | role_eligibility | TRAINING_NEED_MISMATCH | Dead Bug does not train the requested target muscle(s). |
| cable-chest-fly / Cable Chest Fly | role_eligibility | ROLE_MISMATCH | Cable Chest Fly is not defined for primary_strength. |
| cable-chest-fly / Cable Chest Fly | role_eligibility | TRAINING_NEED_MISMATCH | Cable Chest Fly is not suitable for the requested main section. |
| chest-supported-dumbbell-row / Chest-Supported Dumbbell Row | role_eligibility | TRAINING_NEED_MISMATCH | Chest-Supported Dumbbell Row does not match the requested movement role(s). |
| chest-supported-dumbbell-row / Chest-Supported Dumbbell Row | role_eligibility | TRAINING_NEED_MISMATCH | Chest-Supported Dumbbell Row does not train the requested target muscle(s). |
| one-arm-dumbbell-row / One-Arm Dumbbell Row | role_eligibility | TRAINING_NEED_MISMATCH | One-Arm Dumbbell Row does not match the requested movement role(s). |
| one-arm-dumbbell-row / One-Arm Dumbbell Row | role_eligibility | TRAINING_NEED_MISMATCH | One-Arm Dumbbell Row does not train the requested target muscle(s). |
| machine-row / Machine Row | role_eligibility | TRAINING_NEED_MISMATCH | Machine Row does not match the requested movement role(s). |
| machine-row / Machine Row | role_eligibility | TRAINING_NEED_MISMATCH | Machine Row does not train the requested target muscle(s). |
| seated-cable-row / Seated Cable Row | role_eligibility | TRAINING_NEED_MISMATCH | Seated Cable Row does not match the requested movement role(s). |
| seated-cable-row / Seated Cable Row | role_eligibility | TRAINING_NEED_MISMATCH | Seated Cable Row does not train the requested target muscle(s). |
| band-row / Band Row | role_eligibility | ROLE_MISMATCH | Band Row is not defined for primary_strength. |
| band-row / Band Row | role_eligibility | TRAINING_NEED_MISMATCH | Band Row is not suitable for the requested main section. |
| band-row / Band Row | role_eligibility | TRAINING_NEED_MISMATCH | Band Row does not match the requested movement role(s). |
| band-row / Band Row | role_eligibility | TRAINING_NEED_MISMATCH | Band Row does not train the requested target muscle(s). |
| dumbbell-shoulder-press / Dumbbell Shoulder Press | role_eligibility | TRAINING_NEED_MISMATCH | Dumbbell Shoulder Press does not match the requested movement role(s). |
| lat-pulldown / Lat Pulldown | role_eligibility | TRAINING_NEED_MISMATCH | Lat Pulldown does not match the requested movement role(s). |
| lat-pulldown / Lat Pulldown | role_eligibility | TRAINING_NEED_MISMATCH | Lat Pulldown does not train the requested target muscle(s). |
| band-lat-pulldown / Band Lat Pulldown | role_eligibility | ROLE_MISMATCH | Band Lat Pulldown is not defined for primary_strength. |
| band-lat-pulldown / Band Lat Pulldown | role_eligibility | TRAINING_NEED_MISMATCH | Band Lat Pulldown is not suitable for the requested main section. |
| band-lat-pulldown / Band Lat Pulldown | role_eligibility | TRAINING_NEED_MISMATCH | Band Lat Pulldown does not match the requested movement role(s). |
| band-lat-pulldown / Band Lat Pulldown | role_eligibility | TRAINING_NEED_MISMATCH | Band Lat Pulldown does not train the requested target muscle(s). |
| goblet-squat / Goblet Squat | role_eligibility | TRAINING_NEED_MISMATCH | Goblet Squat does not match the requested movement role(s). |
| goblet-squat / Goblet Squat | role_eligibility | TRAINING_NEED_MISMATCH | Goblet Squat does not train the requested target muscle(s). |
| leg-press / Leg Press | role_eligibility | TRAINING_NEED_MISMATCH | Leg Press does not match the requested movement role(s). |
| leg-press / Leg Press | role_eligibility | TRAINING_NEED_MISMATCH | Leg Press does not train the requested target muscle(s). |
| bodyweight-box-squat / Bodyweight Box Squat | role_eligibility | ROLE_MISMATCH | Bodyweight Box Squat is not defined for primary_strength. |
| bodyweight-box-squat / Bodyweight Box Squat | role_eligibility | TRAINING_NEED_MISMATCH | Bodyweight Box Squat is not suitable for the requested main section. |
| bodyweight-box-squat / Bodyweight Box Squat | role_eligibility | TRAINING_NEED_MISMATCH | Bodyweight Box Squat does not match the requested movement role(s). |
| bodyweight-box-squat / Bodyweight Box Squat | role_eligibility | TRAINING_NEED_MISMATCH | Bodyweight Box Squat does not train the requested target muscle(s). |
| dumbbell-romanian-deadlift / Dumbbell Romanian Deadlift | role_eligibility | TRAINING_NEED_MISMATCH | Dumbbell Romanian Deadlift does not match the requested movement role(s). |
| dumbbell-romanian-deadlift / Dumbbell Romanian Deadlift | role_eligibility | TRAINING_NEED_MISMATCH | Dumbbell Romanian Deadlift does not train the requested target muscle(s). |
| cable-pull-through / Cable Pull-Through | role_eligibility | ROLE_MISMATCH | Cable Pull-Through is not defined for primary_strength. |
| cable-pull-through / Cable Pull-Through | role_eligibility | TRAINING_NEED_MISMATCH | Cable Pull-Through is not suitable for the requested main section. |
| cable-pull-through / Cable Pull-Through | role_eligibility | TRAINING_NEED_MISMATCH | Cable Pull-Through does not match the requested movement role(s). |
| cable-pull-through / Cable Pull-Through | role_eligibility | TRAINING_NEED_MISMATCH | Cable Pull-Through does not train the requested target muscle(s). |
| split-squat / Split Squat | role_eligibility | ROLE_MISMATCH | Split Squat is not defined for primary_strength. |
| split-squat / Split Squat | role_eligibility | TRAINING_NEED_MISMATCH | Split Squat does not match the requested movement role(s). |
| split-squat / Split Squat | role_eligibility | TRAINING_NEED_MISMATCH | Split Squat does not train the requested target muscle(s). |
| step-up / Step-Up | role_eligibility | ROLE_MISMATCH | Step-Up is not defined for primary_strength. |
| step-up / Step-Up | role_eligibility | TRAINING_NEED_MISMATCH | Step-Up is not suitable for the requested main section. |
| step-up / Step-Up | role_eligibility | TRAINING_NEED_MISMATCH | Step-Up does not match the requested movement role(s). |
| step-up / Step-Up | role_eligibility | TRAINING_NEED_MISMATCH | Step-Up does not train the requested target muscle(s). |
| lying-leg-curl / Lying Leg Curl | role_eligibility | ROLE_MISMATCH | Lying Leg Curl is not defined for primary_strength. |
| lying-leg-curl / Lying Leg Curl | role_eligibility | TRAINING_NEED_MISMATCH | Lying Leg Curl is not suitable for the requested main section. |
| lying-leg-curl / Lying Leg Curl | role_eligibility | TRAINING_NEED_MISMATCH | Lying Leg Curl does not match the requested movement role(s). |
| lying-leg-curl / Lying Leg Curl | role_eligibility | TRAINING_NEED_MISMATCH | Lying Leg Curl does not train the requested target muscle(s). |
| glute-bridge / Glute Bridge | role_eligibility | ROLE_MISMATCH | Glute Bridge is not defined for primary_strength. |
| glute-bridge / Glute Bridge | role_eligibility | TRAINING_NEED_MISMATCH | Glute Bridge is not suitable for the requested main section. |
| glute-bridge / Glute Bridge | role_eligibility | TRAINING_NEED_MISMATCH | Glute Bridge does not match the requested movement role(s). |
| glute-bridge / Glute Bridge | role_eligibility | TRAINING_NEED_MISMATCH | Glute Bridge does not train the requested target muscle(s). |
| dumbbell-lateral-raise / Dumbbell Lateral Raise | role_eligibility | ROLE_MISMATCH | Dumbbell Lateral Raise is not defined for primary_strength. |
| dumbbell-lateral-raise / Dumbbell Lateral Raise | role_eligibility | TRAINING_NEED_MISMATCH | Dumbbell Lateral Raise is not suitable for the requested main section. |
| dumbbell-lateral-raise / Dumbbell Lateral Raise | role_eligibility | TRAINING_NEED_MISMATCH | Dumbbell Lateral Raise does not match the requested movement role(s). |
| dumbbell-lateral-raise / Dumbbell Lateral Raise | role_eligibility | TRAINING_NEED_MISMATCH | Dumbbell Lateral Raise does not train the requested target muscle(s). |
| reverse-pec-deck / Reverse Pec Deck | role_eligibility | ROLE_MISMATCH | Reverse Pec Deck is not defined for primary_strength. |
| reverse-pec-deck / Reverse Pec Deck | role_eligibility | TRAINING_NEED_MISMATCH | Reverse Pec Deck is not suitable for the requested main section. |
| reverse-pec-deck / Reverse Pec Deck | role_eligibility | TRAINING_NEED_MISMATCH | Reverse Pec Deck does not match the requested movement role(s). |
| reverse-pec-deck / Reverse Pec Deck | role_eligibility | TRAINING_NEED_MISMATCH | Reverse Pec Deck does not train the requested target muscle(s). |
| band-face-pull / Band Face Pull | role_eligibility | ROLE_MISMATCH | Band Face Pull is not defined for primary_strength. |
| band-face-pull / Band Face Pull | role_eligibility | TRAINING_NEED_MISMATCH | Band Face Pull is not suitable for the requested main section. |
| band-face-pull / Band Face Pull | role_eligibility | TRAINING_NEED_MISMATCH | Band Face Pull does not match the requested movement role(s). |
| band-face-pull / Band Face Pull | role_eligibility | TRAINING_NEED_MISMATCH | Band Face Pull does not train the requested target muscle(s). |
| dumbbell-curl / Dumbbell Curl | role_eligibility | ROLE_MISMATCH | Dumbbell Curl is not defined for primary_strength. |
| dumbbell-curl / Dumbbell Curl | role_eligibility | TRAINING_NEED_MISMATCH | Dumbbell Curl is not suitable for the requested main section. |
| dumbbell-curl / Dumbbell Curl | role_eligibility | TRAINING_NEED_MISMATCH | Dumbbell Curl does not match the requested movement role(s). |
| dumbbell-curl / Dumbbell Curl | role_eligibility | TRAINING_NEED_MISMATCH | Dumbbell Curl does not train the requested target muscle(s). |
| cable-triceps-pressdown / Cable Triceps Pressdown | role_eligibility | ROLE_MISMATCH | Cable Triceps Pressdown is not defined for primary_strength. |
| cable-triceps-pressdown / Cable Triceps Pressdown | role_eligibility | TRAINING_NEED_MISMATCH | Cable Triceps Pressdown is not suitable for the requested main section. |
| pallof-press / Pallof Press | role_eligibility | ROLE_MISMATCH | Pallof Press is not defined for primary_strength. |
| pallof-press / Pallof Press | role_eligibility | TRAINING_NEED_MISMATCH | Pallof Press is not suitable for the requested main section. |
| pallof-press / Pallof Press | role_eligibility | TRAINING_NEED_MISMATCH | Pallof Press does not match the requested movement role(s). |
| pallof-press / Pallof Press | role_eligibility | TRAINING_NEED_MISMATCH | Pallof Press does not train the requested target muscle(s). |

### B. Horizontal Pull

| mode | rank | exercise ID/name | total score | delta from OFF | roleFit | goalFit | sessionIntentFit | muscleTargetFit | assessmentFit | alignmentFit | painSuitability | experienceFit | phaseFit | stabilityFit | skillFit | progressionValue | continuityValue | loadability | stimulusPotential | fatigueCost | jointCost | equipmentPracticality | assessment signal IDs affecting candidate | signal confidence | signal priority | assessment relevance reason code | direction | shared bounded influence | assessmentContribution | alignmentContribution |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| OFF | 1 | machine-row / Machine Row | 8.069 | 0.000 | 8.000 | 8.500 | 9.500 | 8.900 | 6.000 | 6.000 | 8.200 | 6.915 | 8.800 | 8.500 | 8.500 | 8.150 | 5.600 | 8.150 | 9.700 | 8.450 | 8.800 | 8.350 | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 | 0 | 0 |
| OFF | 2 | seated-cable-row / Seated Cable Row | 8.069 | 0.000 | 8.000 | 8.500 | 9.500 | 8.900 | 6.000 | 6.000 | 8.200 | 6.915 | 8.800 | 8.500 | 8.500 | 8.150 | 5.600 | 8.150 | 9.700 | 8.450 | 8.800 | 8.350 | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 | 0 | 0 |
| OFF | 3 | chest-supported-dumbbell-row / Chest-Supported Dumbbell Row | 8.065 | 0.000 | 8.000 | 8.500 | 9.500 | 8.900 | 6.000 | 6.000 | 8.200 | 6.915 | 8.800 | 8.500 | 8.500 | 8.150 | 5.600 | 8.150 | 9.700 | 8.450 | 8.800 | 8.250 | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 | 0 | 0 |
| OFF | 4 | one-arm-dumbbell-row / One-Arm Dumbbell Row | 7.911 | 0.000 | 8.000 | 8.500 | 8.750 | 8.900 | 6.000 | 6.000 | 8.200 | 8.265 | 7.800 | 7.200 | 7.400 | 8.150 | 5.600 | 8.150 | 9.700 | 8.450 | 8.450 | 8.700 | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 | 0 | 0 |
| ON | 1 | chest-supported-dumbbell-row / Chest-Supported Dumbbell Row | 8.079 | 0.014 | 8.000 | 8.500 | 9.500 | 8.900 | 6.151 | 6.101 | 8.200 | 6.915 | 8.800 | 8.500 | 8.500 | 8.150 | 5.600 | 8.150 | 9.700 | 8.450 | 8.800 | 8.250 | photo-pose-trunk-bias:photo-pose-trunk-bias | photo-pose-trunk-bias:medium | photo-pose-trunk-bias:primary | photo-pose-trunk-bias:ASSESSMENT_STABILITY_RELEVANT | photo-pose-trunk-bias:supports | photo-pose-trunk-bias:0.252 | photo-pose-trunk-bias:0.151 | photo-pose-trunk-bias:0.101 |
| ON | 2 | machine-row / Machine Row | 8.069 | 0.000 | 8.000 | 8.500 | 9.500 | 8.900 | 6.000 | 6.000 | 8.200 | 6.915 | 8.800 | 8.500 | 8.500 | 8.150 | 5.600 | 8.150 | 9.700 | 8.450 | 8.800 | 8.350 | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 | 0 | 0 |
| ON | 3 | seated-cable-row / Seated Cable Row | 8.069 | 0.000 | 8.000 | 8.500 | 9.500 | 8.900 | 6.000 | 6.000 | 8.200 | 6.915 | 8.800 | 8.500 | 8.500 | 8.150 | 5.600 | 8.150 | 9.700 | 8.450 | 8.800 | 8.350 | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 | 0 | 0 |
| ON | 4 | one-arm-dumbbell-row / One-Arm Dumbbell Row | 7.937 | 0.026 | 8.000 | 8.500 | 8.750 | 8.900 | 6.281 | 6.187 | 8.200 | 8.265 | 7.800 | 7.200 | 7.400 | 8.150 | 5.600 | 8.150 | 9.700 | 8.450 | 8.450 | 8.700 | photo-pose-trunk-bias:photo-pose-trunk-bias | photo-pose-trunk-bias:medium | photo-pose-trunk-bias:primary | photo-pose-trunk-bias:ASSESSMENT_STABILITY_RELEVANT | photo-pose-trunk-bias:supports | photo-pose-trunk-bias:0.468 | photo-pose-trunk-bias:0.281 | photo-pose-trunk-bias:0.187 |

#### B. Horizontal Pull Hard-Rejected Candidates

| Exercise | Rejection stage | Reason code | Explanation |
| --- | --- | --- | --- |
| ninety-ninety-breathing / 90/90 Breathing | role_eligibility | ROLE_MISMATCH | 90/90 Breathing is not defined for primary_strength. |
| ninety-ninety-breathing / 90/90 Breathing | role_eligibility | TRAINING_NEED_MISMATCH | 90/90 Breathing is not suitable for the requested main section. |
| ninety-ninety-breathing / 90/90 Breathing | role_eligibility | TRAINING_NEED_MISMATCH | 90/90 Breathing does not match the requested movement role(s). |
| ninety-ninety-breathing / 90/90 Breathing | role_eligibility | TRAINING_NEED_MISMATCH | 90/90 Breathing does not train the requested target muscle(s). |
| serratus-wall-slide / Serratus Wall Slide | role_eligibility | ROLE_MISMATCH | Serratus Wall Slide is not defined for primary_strength. |
| serratus-wall-slide / Serratus Wall Slide | role_eligibility | TRAINING_NEED_MISMATCH | Serratus Wall Slide is not suitable for the requested main section. |
| serratus-wall-slide / Serratus Wall Slide | role_eligibility | TRAINING_NEED_MISMATCH | Serratus Wall Slide does not match the requested movement role(s). |
| serratus-wall-slide / Serratus Wall Slide | role_eligibility | TRAINING_NEED_MISMATCH | Serratus Wall Slide does not train the requested target muscle(s). |
| dead-bug / Dead Bug | role_eligibility | ROLE_MISMATCH | Dead Bug is not defined for primary_strength. |
| dead-bug / Dead Bug | role_eligibility | TRAINING_NEED_MISMATCH | Dead Bug is not suitable for the requested main section. |
| dead-bug / Dead Bug | role_eligibility | TRAINING_NEED_MISMATCH | Dead Bug does not match the requested movement role(s). |
| dead-bug / Dead Bug | role_eligibility | TRAINING_NEED_MISMATCH | Dead Bug does not train the requested target muscle(s). |
| push-up / Push-Up | role_eligibility | TRAINING_NEED_MISMATCH | Push-Up does not match the requested movement role(s). |
| push-up / Push-Up | role_eligibility | TRAINING_NEED_MISMATCH | Push-Up does not train the requested target muscle(s). |
| dumbbell-bench-press / Dumbbell Bench Press | role_eligibility | TRAINING_NEED_MISMATCH | Dumbbell Bench Press does not match the requested movement role(s). |
| dumbbell-bench-press / Dumbbell Bench Press | role_eligibility | TRAINING_NEED_MISMATCH | Dumbbell Bench Press does not train the requested target muscle(s). |
| machine-chest-press / Machine Chest Press | role_eligibility | TRAINING_NEED_MISMATCH | Machine Chest Press does not match the requested movement role(s). |
| machine-chest-press / Machine Chest Press | role_eligibility | TRAINING_NEED_MISMATCH | Machine Chest Press does not train the requested target muscle(s). |
| cable-chest-fly / Cable Chest Fly | role_eligibility | ROLE_MISMATCH | Cable Chest Fly is not defined for primary_strength. |
| cable-chest-fly / Cable Chest Fly | role_eligibility | TRAINING_NEED_MISMATCH | Cable Chest Fly is not suitable for the requested main section. |
| cable-chest-fly / Cable Chest Fly | role_eligibility | TRAINING_NEED_MISMATCH | Cable Chest Fly does not match the requested movement role(s). |
| cable-chest-fly / Cable Chest Fly | role_eligibility | TRAINING_NEED_MISMATCH | Cable Chest Fly does not train the requested target muscle(s). |
| band-row / Band Row | role_eligibility | ROLE_MISMATCH | Band Row is not defined for primary_strength. |
| band-row / Band Row | role_eligibility | TRAINING_NEED_MISMATCH | Band Row is not suitable for the requested main section. |
| dumbbell-shoulder-press / Dumbbell Shoulder Press | role_eligibility | TRAINING_NEED_MISMATCH | Dumbbell Shoulder Press does not match the requested movement role(s). |
| dumbbell-shoulder-press / Dumbbell Shoulder Press | role_eligibility | TRAINING_NEED_MISMATCH | Dumbbell Shoulder Press does not train the requested target muscle(s). |
| lat-pulldown / Lat Pulldown | role_eligibility | TRAINING_NEED_MISMATCH | Lat Pulldown does not match the requested movement role(s). |
| band-lat-pulldown / Band Lat Pulldown | role_eligibility | ROLE_MISMATCH | Band Lat Pulldown is not defined for primary_strength. |
| band-lat-pulldown / Band Lat Pulldown | role_eligibility | TRAINING_NEED_MISMATCH | Band Lat Pulldown is not suitable for the requested main section. |
| band-lat-pulldown / Band Lat Pulldown | role_eligibility | TRAINING_NEED_MISMATCH | Band Lat Pulldown does not match the requested movement role(s). |
| goblet-squat / Goblet Squat | role_eligibility | TRAINING_NEED_MISMATCH | Goblet Squat does not match the requested movement role(s). |
| goblet-squat / Goblet Squat | role_eligibility | TRAINING_NEED_MISMATCH | Goblet Squat does not train the requested target muscle(s). |
| leg-press / Leg Press | role_eligibility | TRAINING_NEED_MISMATCH | Leg Press does not match the requested movement role(s). |
| leg-press / Leg Press | role_eligibility | TRAINING_NEED_MISMATCH | Leg Press does not train the requested target muscle(s). |
| bodyweight-box-squat / Bodyweight Box Squat | role_eligibility | ROLE_MISMATCH | Bodyweight Box Squat is not defined for primary_strength. |
| bodyweight-box-squat / Bodyweight Box Squat | role_eligibility | TRAINING_NEED_MISMATCH | Bodyweight Box Squat is not suitable for the requested main section. |
| bodyweight-box-squat / Bodyweight Box Squat | role_eligibility | TRAINING_NEED_MISMATCH | Bodyweight Box Squat does not match the requested movement role(s). |
| bodyweight-box-squat / Bodyweight Box Squat | role_eligibility | TRAINING_NEED_MISMATCH | Bodyweight Box Squat does not train the requested target muscle(s). |
| dumbbell-romanian-deadlift / Dumbbell Romanian Deadlift | role_eligibility | TRAINING_NEED_MISMATCH | Dumbbell Romanian Deadlift does not match the requested movement role(s). |
| cable-pull-through / Cable Pull-Through | role_eligibility | ROLE_MISMATCH | Cable Pull-Through is not defined for primary_strength. |
| cable-pull-through / Cable Pull-Through | role_eligibility | TRAINING_NEED_MISMATCH | Cable Pull-Through is not suitable for the requested main section. |
| cable-pull-through / Cable Pull-Through | role_eligibility | TRAINING_NEED_MISMATCH | Cable Pull-Through does not match the requested movement role(s). |
| cable-pull-through / Cable Pull-Through | role_eligibility | TRAINING_NEED_MISMATCH | Cable Pull-Through does not train the requested target muscle(s). |
| split-squat / Split Squat | role_eligibility | ROLE_MISMATCH | Split Squat is not defined for primary_strength. |
| split-squat / Split Squat | role_eligibility | TRAINING_NEED_MISMATCH | Split Squat does not match the requested movement role(s). |
| split-squat / Split Squat | role_eligibility | TRAINING_NEED_MISMATCH | Split Squat does not train the requested target muscle(s). |
| step-up / Step-Up | role_eligibility | ROLE_MISMATCH | Step-Up is not defined for primary_strength. |
| step-up / Step-Up | role_eligibility | TRAINING_NEED_MISMATCH | Step-Up is not suitable for the requested main section. |
| step-up / Step-Up | role_eligibility | TRAINING_NEED_MISMATCH | Step-Up does not match the requested movement role(s). |
| step-up / Step-Up | role_eligibility | TRAINING_NEED_MISMATCH | Step-Up does not train the requested target muscle(s). |
| lying-leg-curl / Lying Leg Curl | role_eligibility | ROLE_MISMATCH | Lying Leg Curl is not defined for primary_strength. |
| lying-leg-curl / Lying Leg Curl | role_eligibility | TRAINING_NEED_MISMATCH | Lying Leg Curl is not suitable for the requested main section. |
| lying-leg-curl / Lying Leg Curl | role_eligibility | TRAINING_NEED_MISMATCH | Lying Leg Curl does not match the requested movement role(s). |
| lying-leg-curl / Lying Leg Curl | role_eligibility | TRAINING_NEED_MISMATCH | Lying Leg Curl does not train the requested target muscle(s). |
| glute-bridge / Glute Bridge | role_eligibility | ROLE_MISMATCH | Glute Bridge is not defined for primary_strength. |
| glute-bridge / Glute Bridge | role_eligibility | TRAINING_NEED_MISMATCH | Glute Bridge is not suitable for the requested main section. |
| glute-bridge / Glute Bridge | role_eligibility | TRAINING_NEED_MISMATCH | Glute Bridge does not match the requested movement role(s). |
| glute-bridge / Glute Bridge | role_eligibility | TRAINING_NEED_MISMATCH | Glute Bridge does not train the requested target muscle(s). |
| dumbbell-lateral-raise / Dumbbell Lateral Raise | role_eligibility | ROLE_MISMATCH | Dumbbell Lateral Raise is not defined for primary_strength. |
| dumbbell-lateral-raise / Dumbbell Lateral Raise | role_eligibility | TRAINING_NEED_MISMATCH | Dumbbell Lateral Raise is not suitable for the requested main section. |
| dumbbell-lateral-raise / Dumbbell Lateral Raise | role_eligibility | TRAINING_NEED_MISMATCH | Dumbbell Lateral Raise does not match the requested movement role(s). |
| dumbbell-lateral-raise / Dumbbell Lateral Raise | role_eligibility | TRAINING_NEED_MISMATCH | Dumbbell Lateral Raise does not train the requested target muscle(s). |
| reverse-pec-deck / Reverse Pec Deck | role_eligibility | ROLE_MISMATCH | Reverse Pec Deck is not defined for primary_strength. |
| reverse-pec-deck / Reverse Pec Deck | role_eligibility | TRAINING_NEED_MISMATCH | Reverse Pec Deck is not suitable for the requested main section. |
| band-face-pull / Band Face Pull | role_eligibility | ROLE_MISMATCH | Band Face Pull is not defined for primary_strength. |
| band-face-pull / Band Face Pull | role_eligibility | TRAINING_NEED_MISMATCH | Band Face Pull is not suitable for the requested main section. |
| band-face-pull / Band Face Pull | role_eligibility | TRAINING_NEED_MISMATCH | Band Face Pull does not train the requested target muscle(s). |
| dumbbell-curl / Dumbbell Curl | role_eligibility | ROLE_MISMATCH | Dumbbell Curl is not defined for primary_strength. |
| dumbbell-curl / Dumbbell Curl | role_eligibility | TRAINING_NEED_MISMATCH | Dumbbell Curl is not suitable for the requested main section. |
| dumbbell-curl / Dumbbell Curl | role_eligibility | TRAINING_NEED_MISMATCH | Dumbbell Curl does not train the requested target muscle(s). |
| cable-triceps-pressdown / Cable Triceps Pressdown | role_eligibility | ROLE_MISMATCH | Cable Triceps Pressdown is not defined for primary_strength. |
| cable-triceps-pressdown / Cable Triceps Pressdown | role_eligibility | TRAINING_NEED_MISMATCH | Cable Triceps Pressdown is not suitable for the requested main section. |
| cable-triceps-pressdown / Cable Triceps Pressdown | role_eligibility | TRAINING_NEED_MISMATCH | Cable Triceps Pressdown does not match the requested movement role(s). |
| cable-triceps-pressdown / Cable Triceps Pressdown | role_eligibility | TRAINING_NEED_MISMATCH | Cable Triceps Pressdown does not train the requested target muscle(s). |
| pallof-press / Pallof Press | role_eligibility | ROLE_MISMATCH | Pallof Press is not defined for primary_strength. |
| pallof-press / Pallof Press | role_eligibility | TRAINING_NEED_MISMATCH | Pallof Press is not suitable for the requested main section. |
| pallof-press / Pallof Press | role_eligibility | TRAINING_NEED_MISMATCH | Pallof Press does not match the requested movement role(s). |
| pallof-press / Pallof Press | role_eligibility | TRAINING_NEED_MISMATCH | Pallof Press does not train the requested target muscle(s). |

### C. Squat

| mode | rank | exercise ID/name | total score | delta from OFF | roleFit | goalFit | sessionIntentFit | muscleTargetFit | assessmentFit | alignmentFit | painSuitability | experienceFit | phaseFit | stabilityFit | skillFit | progressionValue | continuityValue | loadability | stimulusPotential | fatigueCost | jointCost | equipmentPracticality | assessment signal IDs affecting candidate | signal confidence | signal priority | assessment relevance reason code | direction | shared bounded influence | assessmentContribution | alignmentContribution |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| OFF | 1 | goblet-squat / Goblet Squat | 8.059 | 0.000 | 8.000 | 8.500 | 9.500 | 8.900 | 6.000 | 6.000 | 8.200 | 6.915 | 8.800 | 8.500 | 8.500 | 8.700 | 5.600 | 9.000 | 8.600 | 7.650 | 8.800 | 8.700 | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 | 0 | 0 |
| OFF | 2 | leg-press / Leg Press | 8.041 | 0.000 | 8.000 | 8.500 | 9.500 | 8.900 | 6.000 | 6.000 | 8.200 | 6.915 | 8.800 | 8.500 | 8.500 | 8.700 | 5.600 | 8.150 | 9.700 | 7.100 | 8.800 | 8.350 | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 | 0 | 0 |
| ON | 1 | goblet-squat / Goblet Squat | 8.151 | 0.092 | 8.000 | 8.500 | 9.500 | 8.900 | 6.994 | 6.662 | 8.200 | 6.915 | 8.800 | 8.500 | 8.500 | 8.700 | 5.600 | 9.000 | 8.600 | 7.650 | 8.800 | 8.700 | photo-pose-trunk-bias:photo-pose-trunk-bias; photo-pose-hip-shift:photo-pose-hip-shift; photo-pose-knee-alignment:photo-pose-knee-alignment | photo-pose-trunk-bias:medium; photo-pose-hip-shift:medium; photo-pose-knee-alignment:medium | photo-pose-trunk-bias:primary; photo-pose-hip-shift:primary; photo-pose-knee-alignment:secondary | photo-pose-trunk-bias:ASSESSMENT_STABILITY_RELEVANT; photo-pose-hip-shift:ASSESSMENT_JOINT_RELEVANT; photo-pose-knee-alignment:ASSESSMENT_MOVEMENT_RELEVANT | photo-pose-trunk-bias:supports; photo-pose-hip-shift:supports; photo-pose-knee-alignment:supports | photo-pose-trunk-bias:0.468; photo-pose-hip-shift:0.720; photo-pose-knee-alignment:0.468 | photo-pose-trunk-bias:0.281; photo-pose-hip-shift:0.432; photo-pose-knee-alignment:0.281 | photo-pose-trunk-bias:0.187; photo-pose-hip-shift:0.288; photo-pose-knee-alignment:0.187 |
| ON | 2 | leg-press / Leg Press | 8.107 | 0.066 | 8.000 | 8.500 | 9.500 | 8.900 | 6.713 | 6.475 | 8.200 | 6.915 | 8.800 | 8.500 | 8.500 | 8.700 | 5.600 | 8.150 | 9.700 | 7.100 | 8.800 | 8.350 | photo-pose-hip-shift:photo-pose-hip-shift; photo-pose-knee-alignment:photo-pose-knee-alignment | photo-pose-hip-shift:medium; photo-pose-knee-alignment:medium | photo-pose-hip-shift:primary; photo-pose-knee-alignment:secondary | photo-pose-hip-shift:ASSESSMENT_JOINT_RELEVANT; photo-pose-knee-alignment:ASSESSMENT_MOVEMENT_RELEVANT | photo-pose-hip-shift:supports; photo-pose-knee-alignment:supports | photo-pose-hip-shift:0.720; photo-pose-knee-alignment:0.468 | photo-pose-hip-shift:0.432; photo-pose-knee-alignment:0.281 | photo-pose-hip-shift:0.288; photo-pose-knee-alignment:0.187 |

#### C. Squat Hard-Rejected Candidates

| Exercise | Rejection stage | Reason code | Explanation |
| --- | --- | --- | --- |
| ninety-ninety-breathing / 90/90 Breathing | role_eligibility | ROLE_MISMATCH | 90/90 Breathing is not defined for primary_strength. |
| ninety-ninety-breathing / 90/90 Breathing | role_eligibility | TRAINING_NEED_MISMATCH | 90/90 Breathing is not suitable for the requested main section. |
| ninety-ninety-breathing / 90/90 Breathing | role_eligibility | TRAINING_NEED_MISMATCH | 90/90 Breathing does not match the requested movement role(s). |
| ninety-ninety-breathing / 90/90 Breathing | role_eligibility | TRAINING_NEED_MISMATCH | 90/90 Breathing does not train the requested target muscle(s). |
| serratus-wall-slide / Serratus Wall Slide | role_eligibility | ROLE_MISMATCH | Serratus Wall Slide is not defined for primary_strength. |
| serratus-wall-slide / Serratus Wall Slide | role_eligibility | TRAINING_NEED_MISMATCH | Serratus Wall Slide is not suitable for the requested main section. |
| serratus-wall-slide / Serratus Wall Slide | role_eligibility | TRAINING_NEED_MISMATCH | Serratus Wall Slide does not match the requested movement role(s). |
| serratus-wall-slide / Serratus Wall Slide | role_eligibility | TRAINING_NEED_MISMATCH | Serratus Wall Slide does not train the requested target muscle(s). |
| dead-bug / Dead Bug | role_eligibility | ROLE_MISMATCH | Dead Bug is not defined for primary_strength. |
| dead-bug / Dead Bug | role_eligibility | TRAINING_NEED_MISMATCH | Dead Bug is not suitable for the requested main section. |
| dead-bug / Dead Bug | role_eligibility | TRAINING_NEED_MISMATCH | Dead Bug does not match the requested movement role(s). |
| dead-bug / Dead Bug | role_eligibility | TRAINING_NEED_MISMATCH | Dead Bug does not train the requested target muscle(s). |
| push-up / Push-Up | role_eligibility | TRAINING_NEED_MISMATCH | Push-Up does not match the requested movement role(s). |
| push-up / Push-Up | role_eligibility | TRAINING_NEED_MISMATCH | Push-Up does not train the requested target muscle(s). |
| dumbbell-bench-press / Dumbbell Bench Press | role_eligibility | TRAINING_NEED_MISMATCH | Dumbbell Bench Press does not match the requested movement role(s). |
| dumbbell-bench-press / Dumbbell Bench Press | role_eligibility | TRAINING_NEED_MISMATCH | Dumbbell Bench Press does not train the requested target muscle(s). |
| machine-chest-press / Machine Chest Press | role_eligibility | TRAINING_NEED_MISMATCH | Machine Chest Press does not match the requested movement role(s). |
| machine-chest-press / Machine Chest Press | role_eligibility | TRAINING_NEED_MISMATCH | Machine Chest Press does not train the requested target muscle(s). |
| cable-chest-fly / Cable Chest Fly | role_eligibility | ROLE_MISMATCH | Cable Chest Fly is not defined for primary_strength. |
| cable-chest-fly / Cable Chest Fly | role_eligibility | TRAINING_NEED_MISMATCH | Cable Chest Fly is not suitable for the requested main section. |
| cable-chest-fly / Cable Chest Fly | role_eligibility | TRAINING_NEED_MISMATCH | Cable Chest Fly does not match the requested movement role(s). |
| cable-chest-fly / Cable Chest Fly | role_eligibility | TRAINING_NEED_MISMATCH | Cable Chest Fly does not train the requested target muscle(s). |
| chest-supported-dumbbell-row / Chest-Supported Dumbbell Row | role_eligibility | TRAINING_NEED_MISMATCH | Chest-Supported Dumbbell Row does not match the requested movement role(s). |
| chest-supported-dumbbell-row / Chest-Supported Dumbbell Row | role_eligibility | TRAINING_NEED_MISMATCH | Chest-Supported Dumbbell Row does not train the requested target muscle(s). |
| one-arm-dumbbell-row / One-Arm Dumbbell Row | role_eligibility | TRAINING_NEED_MISMATCH | One-Arm Dumbbell Row does not match the requested movement role(s). |
| one-arm-dumbbell-row / One-Arm Dumbbell Row | role_eligibility | TRAINING_NEED_MISMATCH | One-Arm Dumbbell Row does not train the requested target muscle(s). |
| machine-row / Machine Row | role_eligibility | TRAINING_NEED_MISMATCH | Machine Row does not match the requested movement role(s). |
| machine-row / Machine Row | role_eligibility | TRAINING_NEED_MISMATCH | Machine Row does not train the requested target muscle(s). |
| seated-cable-row / Seated Cable Row | role_eligibility | TRAINING_NEED_MISMATCH | Seated Cable Row does not match the requested movement role(s). |
| seated-cable-row / Seated Cable Row | role_eligibility | TRAINING_NEED_MISMATCH | Seated Cable Row does not train the requested target muscle(s). |
| band-row / Band Row | role_eligibility | ROLE_MISMATCH | Band Row is not defined for primary_strength. |
| band-row / Band Row | role_eligibility | TRAINING_NEED_MISMATCH | Band Row is not suitable for the requested main section. |
| band-row / Band Row | role_eligibility | TRAINING_NEED_MISMATCH | Band Row does not match the requested movement role(s). |
| band-row / Band Row | role_eligibility | TRAINING_NEED_MISMATCH | Band Row does not train the requested target muscle(s). |
| dumbbell-shoulder-press / Dumbbell Shoulder Press | role_eligibility | TRAINING_NEED_MISMATCH | Dumbbell Shoulder Press does not match the requested movement role(s). |
| dumbbell-shoulder-press / Dumbbell Shoulder Press | role_eligibility | TRAINING_NEED_MISMATCH | Dumbbell Shoulder Press does not train the requested target muscle(s). |
| lat-pulldown / Lat Pulldown | role_eligibility | TRAINING_NEED_MISMATCH | Lat Pulldown does not match the requested movement role(s). |
| lat-pulldown / Lat Pulldown | role_eligibility | TRAINING_NEED_MISMATCH | Lat Pulldown does not train the requested target muscle(s). |
| band-lat-pulldown / Band Lat Pulldown | role_eligibility | ROLE_MISMATCH | Band Lat Pulldown is not defined for primary_strength. |
| band-lat-pulldown / Band Lat Pulldown | role_eligibility | TRAINING_NEED_MISMATCH | Band Lat Pulldown is not suitable for the requested main section. |
| band-lat-pulldown / Band Lat Pulldown | role_eligibility | TRAINING_NEED_MISMATCH | Band Lat Pulldown does not match the requested movement role(s). |
| band-lat-pulldown / Band Lat Pulldown | role_eligibility | TRAINING_NEED_MISMATCH | Band Lat Pulldown does not train the requested target muscle(s). |
| bodyweight-box-squat / Bodyweight Box Squat | role_eligibility | ROLE_MISMATCH | Bodyweight Box Squat is not defined for primary_strength. |
| bodyweight-box-squat / Bodyweight Box Squat | role_eligibility | TRAINING_NEED_MISMATCH | Bodyweight Box Squat is not suitable for the requested main section. |
| dumbbell-romanian-deadlift / Dumbbell Romanian Deadlift | role_eligibility | TRAINING_NEED_MISMATCH | Dumbbell Romanian Deadlift does not match the requested movement role(s). |
| cable-pull-through / Cable Pull-Through | role_eligibility | ROLE_MISMATCH | Cable Pull-Through is not defined for primary_strength. |
| cable-pull-through / Cable Pull-Through | role_eligibility | TRAINING_NEED_MISMATCH | Cable Pull-Through is not suitable for the requested main section. |
| cable-pull-through / Cable Pull-Through | role_eligibility | TRAINING_NEED_MISMATCH | Cable Pull-Through does not match the requested movement role(s). |
| split-squat / Split Squat | role_eligibility | ROLE_MISMATCH | Split Squat is not defined for primary_strength. |
| step-up / Step-Up | role_eligibility | ROLE_MISMATCH | Step-Up is not defined for primary_strength. |
| step-up / Step-Up | role_eligibility | TRAINING_NEED_MISMATCH | Step-Up is not suitable for the requested main section. |
| lying-leg-curl / Lying Leg Curl | role_eligibility | ROLE_MISMATCH | Lying Leg Curl is not defined for primary_strength. |
| lying-leg-curl / Lying Leg Curl | role_eligibility | TRAINING_NEED_MISMATCH | Lying Leg Curl is not suitable for the requested main section. |
| lying-leg-curl / Lying Leg Curl | role_eligibility | TRAINING_NEED_MISMATCH | Lying Leg Curl does not match the requested movement role(s). |
| lying-leg-curl / Lying Leg Curl | role_eligibility | TRAINING_NEED_MISMATCH | Lying Leg Curl does not train the requested target muscle(s). |
| glute-bridge / Glute Bridge | role_eligibility | ROLE_MISMATCH | Glute Bridge is not defined for primary_strength. |
| glute-bridge / Glute Bridge | role_eligibility | TRAINING_NEED_MISMATCH | Glute Bridge is not suitable for the requested main section. |
| glute-bridge / Glute Bridge | role_eligibility | TRAINING_NEED_MISMATCH | Glute Bridge does not match the requested movement role(s). |
| dumbbell-lateral-raise / Dumbbell Lateral Raise | role_eligibility | ROLE_MISMATCH | Dumbbell Lateral Raise is not defined for primary_strength. |
| dumbbell-lateral-raise / Dumbbell Lateral Raise | role_eligibility | TRAINING_NEED_MISMATCH | Dumbbell Lateral Raise is not suitable for the requested main section. |
| dumbbell-lateral-raise / Dumbbell Lateral Raise | role_eligibility | TRAINING_NEED_MISMATCH | Dumbbell Lateral Raise does not match the requested movement role(s). |
| dumbbell-lateral-raise / Dumbbell Lateral Raise | role_eligibility | TRAINING_NEED_MISMATCH | Dumbbell Lateral Raise does not train the requested target muscle(s). |
| reverse-pec-deck / Reverse Pec Deck | role_eligibility | ROLE_MISMATCH | Reverse Pec Deck is not defined for primary_strength. |
| reverse-pec-deck / Reverse Pec Deck | role_eligibility | TRAINING_NEED_MISMATCH | Reverse Pec Deck is not suitable for the requested main section. |
| reverse-pec-deck / Reverse Pec Deck | role_eligibility | TRAINING_NEED_MISMATCH | Reverse Pec Deck does not match the requested movement role(s). |
| reverse-pec-deck / Reverse Pec Deck | role_eligibility | TRAINING_NEED_MISMATCH | Reverse Pec Deck does not train the requested target muscle(s). |
| band-face-pull / Band Face Pull | role_eligibility | ROLE_MISMATCH | Band Face Pull is not defined for primary_strength. |
| band-face-pull / Band Face Pull | role_eligibility | TRAINING_NEED_MISMATCH | Band Face Pull is not suitable for the requested main section. |
| band-face-pull / Band Face Pull | role_eligibility | TRAINING_NEED_MISMATCH | Band Face Pull does not match the requested movement role(s). |
| band-face-pull / Band Face Pull | role_eligibility | TRAINING_NEED_MISMATCH | Band Face Pull does not train the requested target muscle(s). |
| dumbbell-curl / Dumbbell Curl | role_eligibility | ROLE_MISMATCH | Dumbbell Curl is not defined for primary_strength. |
| dumbbell-curl / Dumbbell Curl | role_eligibility | TRAINING_NEED_MISMATCH | Dumbbell Curl is not suitable for the requested main section. |
| dumbbell-curl / Dumbbell Curl | role_eligibility | TRAINING_NEED_MISMATCH | Dumbbell Curl does not match the requested movement role(s). |
| dumbbell-curl / Dumbbell Curl | role_eligibility | TRAINING_NEED_MISMATCH | Dumbbell Curl does not train the requested target muscle(s). |
| cable-triceps-pressdown / Cable Triceps Pressdown | role_eligibility | ROLE_MISMATCH | Cable Triceps Pressdown is not defined for primary_strength. |
| cable-triceps-pressdown / Cable Triceps Pressdown | role_eligibility | TRAINING_NEED_MISMATCH | Cable Triceps Pressdown is not suitable for the requested main section. |
| cable-triceps-pressdown / Cable Triceps Pressdown | role_eligibility | TRAINING_NEED_MISMATCH | Cable Triceps Pressdown does not match the requested movement role(s). |
| cable-triceps-pressdown / Cable Triceps Pressdown | role_eligibility | TRAINING_NEED_MISMATCH | Cable Triceps Pressdown does not train the requested target muscle(s). |
| pallof-press / Pallof Press | role_eligibility | ROLE_MISMATCH | Pallof Press is not defined for primary_strength. |
| pallof-press / Pallof Press | role_eligibility | TRAINING_NEED_MISMATCH | Pallof Press is not suitable for the requested main section. |
| pallof-press / Pallof Press | role_eligibility | TRAINING_NEED_MISMATCH | Pallof Press does not match the requested movement role(s). |

### D. Single-Leg Lower Body

| mode | rank | exercise ID/name | total score | delta from OFF | roleFit | goalFit | sessionIntentFit | muscleTargetFit | assessmentFit | alignmentFit | painSuitability | experienceFit | phaseFit | stabilityFit | skillFit | progressionValue | continuityValue | loadability | stimulusPotential | fatigueCost | jointCost | equipmentPracticality | assessment signal IDs affecting candidate | signal confidence | signal priority | assessment relevance reason code | direction | shared bounded influence | assessmentContribution | alignmentContribution |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| OFF | 1 | step-up / Step-Up | 7.795 | 0.000 | 8.000 | 8.000 | 9.000 | 6.700 | 6.000 | 6.000 | 8.200 | 8.265 | 7.800 | 8.500 | 7.400 | 8.150 | 5.600 | 9.000 | 8.600 | 8.450 | 8.800 | 8.250 | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 | 0 | 0 |
| OFF | 2 | split-squat / Split Squat | 7.753 | 0.000 | 8.000 | 8.000 | 9.000 | 6.700 | 6.000 | 6.000 | 8.200 | 8.265 | 7.800 | 8.500 | 7.400 | 8.150 | 5.600 | 9.000 | 8.600 | 7.100 | 8.800 | 8.700 | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 | 0 | 0 |
| ON | 1 | step-up / Step-Up | 7.887 | 0.092 | 8.000 | 8.000 | 9.000 | 6.700 | 6.994 | 6.662 | 8.200 | 8.265 | 7.800 | 8.500 | 7.400 | 8.150 | 5.600 | 9.000 | 8.600 | 8.450 | 8.800 | 8.250 | photo-pose-trunk-bias:photo-pose-trunk-bias; photo-pose-hip-shift:photo-pose-hip-shift; photo-pose-knee-alignment:photo-pose-knee-alignment | photo-pose-trunk-bias:medium; photo-pose-hip-shift:medium; photo-pose-knee-alignment:medium | photo-pose-trunk-bias:primary; photo-pose-hip-shift:primary; photo-pose-knee-alignment:secondary | photo-pose-trunk-bias:ASSESSMENT_STABILITY_RELEVANT; photo-pose-hip-shift:ASSESSMENT_MOVEMENT_RELEVANT; photo-pose-knee-alignment:ASSESSMENT_JOINT_RELEVANT | photo-pose-trunk-bias:supports; photo-pose-hip-shift:supports; photo-pose-knee-alignment:supports | photo-pose-trunk-bias:0.468; photo-pose-hip-shift:0.720; photo-pose-knee-alignment:0.468 | photo-pose-trunk-bias:0.281; photo-pose-hip-shift:0.432; photo-pose-knee-alignment:0.281 | photo-pose-trunk-bias:0.187; photo-pose-hip-shift:0.288; photo-pose-knee-alignment:0.187 |
| ON | 2 | split-squat / Split Squat | 7.845 | 0.092 | 8.000 | 8.000 | 9.000 | 6.700 | 6.994 | 6.662 | 8.200 | 8.265 | 7.800 | 8.500 | 7.400 | 8.150 | 5.600 | 9.000 | 8.600 | 7.100 | 8.800 | 8.700 | photo-pose-trunk-bias:photo-pose-trunk-bias; photo-pose-hip-shift:photo-pose-hip-shift; photo-pose-knee-alignment:photo-pose-knee-alignment | photo-pose-trunk-bias:medium; photo-pose-hip-shift:medium; photo-pose-knee-alignment:medium | photo-pose-trunk-bias:primary; photo-pose-hip-shift:primary; photo-pose-knee-alignment:secondary | photo-pose-trunk-bias:ASSESSMENT_STABILITY_RELEVANT; photo-pose-hip-shift:ASSESSMENT_MOVEMENT_RELEVANT; photo-pose-knee-alignment:ASSESSMENT_JOINT_RELEVANT | photo-pose-trunk-bias:supports; photo-pose-hip-shift:supports; photo-pose-knee-alignment:supports | photo-pose-trunk-bias:0.468; photo-pose-hip-shift:0.720; photo-pose-knee-alignment:0.468 | photo-pose-trunk-bias:0.281; photo-pose-hip-shift:0.432; photo-pose-knee-alignment:0.281 | photo-pose-trunk-bias:0.187; photo-pose-hip-shift:0.288; photo-pose-knee-alignment:0.187 |

#### D. Single-Leg Lower Body Hard-Rejected Candidates

| Exercise | Rejection stage | Reason code | Explanation |
| --- | --- | --- | --- |
| ninety-ninety-breathing / 90/90 Breathing | role_eligibility | ROLE_MISMATCH | 90/90 Breathing is not defined for hypertrophy_accessory. |
| ninety-ninety-breathing / 90/90 Breathing | role_eligibility | TRAINING_NEED_MISMATCH | 90/90 Breathing is not suitable for the requested accessory section. |
| ninety-ninety-breathing / 90/90 Breathing | role_eligibility | TRAINING_NEED_MISMATCH | 90/90 Breathing does not match the requested movement role(s). |
| ninety-ninety-breathing / 90/90 Breathing | role_eligibility | TRAINING_NEED_MISMATCH | 90/90 Breathing does not train the requested target muscle(s). |
| serratus-wall-slide / Serratus Wall Slide | role_eligibility | ROLE_MISMATCH | Serratus Wall Slide is not defined for hypertrophy_accessory. |
| serratus-wall-slide / Serratus Wall Slide | role_eligibility | TRAINING_NEED_MISMATCH | Serratus Wall Slide is not suitable for the requested accessory section. |
| serratus-wall-slide / Serratus Wall Slide | role_eligibility | TRAINING_NEED_MISMATCH | Serratus Wall Slide does not match the requested movement role(s). |
| serratus-wall-slide / Serratus Wall Slide | role_eligibility | TRAINING_NEED_MISMATCH | Serratus Wall Slide does not train the requested target muscle(s). |
| dead-bug / Dead Bug | role_eligibility | TRAINING_NEED_MISMATCH | Dead Bug does not match the requested movement role(s). |
| dead-bug / Dead Bug | role_eligibility | TRAINING_NEED_MISMATCH | Dead Bug does not train the requested target muscle(s). |
| push-up / Push-Up | role_eligibility | TRAINING_NEED_MISMATCH | Push-Up does not match the requested movement role(s). |
| push-up / Push-Up | role_eligibility | TRAINING_NEED_MISMATCH | Push-Up does not train the requested target muscle(s). |
| dumbbell-bench-press / Dumbbell Bench Press | role_eligibility | ROLE_MISMATCH | Dumbbell Bench Press is not defined for hypertrophy_accessory. |
| dumbbell-bench-press / Dumbbell Bench Press | role_eligibility | TRAINING_NEED_MISMATCH | Dumbbell Bench Press does not match the requested movement role(s). |
| dumbbell-bench-press / Dumbbell Bench Press | role_eligibility | TRAINING_NEED_MISMATCH | Dumbbell Bench Press does not train the requested target muscle(s). |
| machine-chest-press / Machine Chest Press | role_eligibility | ROLE_MISMATCH | Machine Chest Press is not defined for hypertrophy_accessory. |
| machine-chest-press / Machine Chest Press | role_eligibility | TRAINING_NEED_MISMATCH | Machine Chest Press does not match the requested movement role(s). |
| machine-chest-press / Machine Chest Press | role_eligibility | TRAINING_NEED_MISMATCH | Machine Chest Press does not train the requested target muscle(s). |
| cable-chest-fly / Cable Chest Fly | role_eligibility | TRAINING_NEED_MISMATCH | Cable Chest Fly does not match the requested movement role(s). |
| cable-chest-fly / Cable Chest Fly | role_eligibility | TRAINING_NEED_MISMATCH | Cable Chest Fly does not train the requested target muscle(s). |
| chest-supported-dumbbell-row / Chest-Supported Dumbbell Row | role_eligibility | ROLE_MISMATCH | Chest-Supported Dumbbell Row is not defined for hypertrophy_accessory. |
| chest-supported-dumbbell-row / Chest-Supported Dumbbell Row | role_eligibility | TRAINING_NEED_MISMATCH | Chest-Supported Dumbbell Row does not match the requested movement role(s). |
| chest-supported-dumbbell-row / Chest-Supported Dumbbell Row | role_eligibility | TRAINING_NEED_MISMATCH | Chest-Supported Dumbbell Row does not train the requested target muscle(s). |
| one-arm-dumbbell-row / One-Arm Dumbbell Row | role_eligibility | ROLE_MISMATCH | One-Arm Dumbbell Row is not defined for hypertrophy_accessory. |
| one-arm-dumbbell-row / One-Arm Dumbbell Row | role_eligibility | TRAINING_NEED_MISMATCH | One-Arm Dumbbell Row does not match the requested movement role(s). |
| one-arm-dumbbell-row / One-Arm Dumbbell Row | role_eligibility | TRAINING_NEED_MISMATCH | One-Arm Dumbbell Row does not train the requested target muscle(s). |
| machine-row / Machine Row | role_eligibility | ROLE_MISMATCH | Machine Row is not defined for hypertrophy_accessory. |
| machine-row / Machine Row | role_eligibility | TRAINING_NEED_MISMATCH | Machine Row does not match the requested movement role(s). |
| machine-row / Machine Row | role_eligibility | TRAINING_NEED_MISMATCH | Machine Row does not train the requested target muscle(s). |
| seated-cable-row / Seated Cable Row | role_eligibility | ROLE_MISMATCH | Seated Cable Row is not defined for hypertrophy_accessory. |
| seated-cable-row / Seated Cable Row | role_eligibility | TRAINING_NEED_MISMATCH | Seated Cable Row does not match the requested movement role(s). |
| seated-cable-row / Seated Cable Row | role_eligibility | TRAINING_NEED_MISMATCH | Seated Cable Row does not train the requested target muscle(s). |
| band-row / Band Row | role_eligibility | TRAINING_NEED_MISMATCH | Band Row does not match the requested movement role(s). |
| band-row / Band Row | role_eligibility | TRAINING_NEED_MISMATCH | Band Row does not train the requested target muscle(s). |
| dumbbell-shoulder-press / Dumbbell Shoulder Press | role_eligibility | ROLE_MISMATCH | Dumbbell Shoulder Press is not defined for hypertrophy_accessory. |
| dumbbell-shoulder-press / Dumbbell Shoulder Press | role_eligibility | TRAINING_NEED_MISMATCH | Dumbbell Shoulder Press does not match the requested movement role(s). |
| dumbbell-shoulder-press / Dumbbell Shoulder Press | role_eligibility | TRAINING_NEED_MISMATCH | Dumbbell Shoulder Press does not train the requested target muscle(s). |
| lat-pulldown / Lat Pulldown | role_eligibility | ROLE_MISMATCH | Lat Pulldown is not defined for hypertrophy_accessory. |
| lat-pulldown / Lat Pulldown | role_eligibility | TRAINING_NEED_MISMATCH | Lat Pulldown does not match the requested movement role(s). |
| lat-pulldown / Lat Pulldown | role_eligibility | TRAINING_NEED_MISMATCH | Lat Pulldown does not train the requested target muscle(s). |
| band-lat-pulldown / Band Lat Pulldown | role_eligibility | TRAINING_NEED_MISMATCH | Band Lat Pulldown does not match the requested movement role(s). |
| band-lat-pulldown / Band Lat Pulldown | role_eligibility | TRAINING_NEED_MISMATCH | Band Lat Pulldown does not train the requested target muscle(s). |
| goblet-squat / Goblet Squat | role_eligibility | ROLE_MISMATCH | Goblet Squat is not defined for hypertrophy_accessory. |
| goblet-squat / Goblet Squat | role_eligibility | TRAINING_NEED_MISMATCH | Goblet Squat does not match the requested movement role(s). |
| leg-press / Leg Press | role_eligibility | ROLE_MISMATCH | Leg Press is not defined for hypertrophy_accessory. |
| leg-press / Leg Press | role_eligibility | TRAINING_NEED_MISMATCH | Leg Press does not match the requested movement role(s). |
| bodyweight-box-squat / Bodyweight Box Squat | role_eligibility | ROLE_MISMATCH | Bodyweight Box Squat is not defined for hypertrophy_accessory. |
| bodyweight-box-squat / Bodyweight Box Squat | role_eligibility | TRAINING_NEED_MISMATCH | Bodyweight Box Squat does not match the requested movement role(s). |
| dumbbell-romanian-deadlift / Dumbbell Romanian Deadlift | role_eligibility | ROLE_MISMATCH | Dumbbell Romanian Deadlift is not defined for hypertrophy_accessory. |
| dumbbell-romanian-deadlift / Dumbbell Romanian Deadlift | role_eligibility | TRAINING_NEED_MISMATCH | Dumbbell Romanian Deadlift does not match the requested movement role(s). |
| cable-pull-through / Cable Pull-Through | role_eligibility | TRAINING_NEED_MISMATCH | Cable Pull-Through does not match the requested movement role(s). |
| lying-leg-curl / Lying Leg Curl | role_eligibility | TRAINING_NEED_MISMATCH | Lying Leg Curl does not match the requested movement role(s). |
| lying-leg-curl / Lying Leg Curl | role_eligibility | TRAINING_NEED_MISMATCH | Lying Leg Curl does not train the requested target muscle(s). |
| glute-bridge / Glute Bridge | role_eligibility | TRAINING_NEED_MISMATCH | Glute Bridge does not match the requested movement role(s). |
| dumbbell-lateral-raise / Dumbbell Lateral Raise | role_eligibility | TRAINING_NEED_MISMATCH | Dumbbell Lateral Raise does not match the requested movement role(s). |
| dumbbell-lateral-raise / Dumbbell Lateral Raise | role_eligibility | TRAINING_NEED_MISMATCH | Dumbbell Lateral Raise does not train the requested target muscle(s). |
| reverse-pec-deck / Reverse Pec Deck | role_eligibility | TRAINING_NEED_MISMATCH | Reverse Pec Deck does not match the requested movement role(s). |
| reverse-pec-deck / Reverse Pec Deck | role_eligibility | TRAINING_NEED_MISMATCH | Reverse Pec Deck does not train the requested target muscle(s). |
| band-face-pull / Band Face Pull | role_eligibility | TRAINING_NEED_MISMATCH | Band Face Pull does not match the requested movement role(s). |
| band-face-pull / Band Face Pull | role_eligibility | TRAINING_NEED_MISMATCH | Band Face Pull does not train the requested target muscle(s). |
| dumbbell-curl / Dumbbell Curl | role_eligibility | TRAINING_NEED_MISMATCH | Dumbbell Curl does not match the requested movement role(s). |
| dumbbell-curl / Dumbbell Curl | role_eligibility | TRAINING_NEED_MISMATCH | Dumbbell Curl does not train the requested target muscle(s). |
| cable-triceps-pressdown / Cable Triceps Pressdown | role_eligibility | TRAINING_NEED_MISMATCH | Cable Triceps Pressdown does not match the requested movement role(s). |
| cable-triceps-pressdown / Cable Triceps Pressdown | role_eligibility | TRAINING_NEED_MISMATCH | Cable Triceps Pressdown does not train the requested target muscle(s). |
| pallof-press / Pallof Press | role_eligibility | TRAINING_NEED_MISMATCH | Pallof Press does not match the requested movement role(s). |

### E. Trunk Activation

| mode | rank | exercise ID/name | total score | delta from OFF | roleFit | goalFit | sessionIntentFit | muscleTargetFit | assessmentFit | alignmentFit | painSuitability | experienceFit | phaseFit | stabilityFit | skillFit | progressionValue | continuityValue | loadability | stimulusPotential | fatigueCost | jointCost | equipmentPracticality | assessment signal IDs affecting candidate | signal confidence | signal priority | assessment relevance reason code | direction | shared bounded influence | assessmentContribution | alignmentContribution |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| OFF | 1 | pallof-press / Pallof Press | 7.749 | 0.000 | 8.000 | 8.500 | 9.000 | 6.700 | 6.000 | 6.000 | 8.200 | 6.915 | 7.800 | 8.500 | 8.500 | 7.600 | 5.600 | 8.200 | 7.900 | 9.000 | 8.800 | 8.700 | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 | 0 | 0 |
| OFF | 2 | dead-bug / Dead Bug | 7.670 | 0.000 | 8.000 | 8.500 | 9.000 | 6.700 | 6.000 | 6.000 | 8.200 | 7.590 | 7.800 | 8.500 | 7.950 | 7.050 | 5.600 | 7.950 | 7.150 | 9.000 | 8.800 | 8.700 | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 / neutral | 0 | 0 | 0 |
| ON | 1 | pallof-press / Pallof Press | 7.789 | 0.040 | 8.000 | 8.500 | 9.000 | 6.700 | 6.432 | 6.288 | 8.200 | 6.915 | 7.800 | 8.500 | 8.500 | 7.600 | 5.600 | 8.200 | 7.900 | 9.000 | 8.800 | 8.700 | photo-pose-trunk-bias:photo-pose-trunk-bias | photo-pose-trunk-bias:medium | photo-pose-trunk-bias:primary | photo-pose-trunk-bias:ASSESSMENT_STABILITY_RELEVANT | photo-pose-trunk-bias:supports | photo-pose-trunk-bias:0.720 | photo-pose-trunk-bias:0.432 | photo-pose-trunk-bias:0.288 |
| ON | 2 | dead-bug / Dead Bug | 7.710 | 0.040 | 8.000 | 8.500 | 9.000 | 6.700 | 6.432 | 6.288 | 8.200 | 7.590 | 7.800 | 8.500 | 7.950 | 7.050 | 5.600 | 7.950 | 7.150 | 9.000 | 8.800 | 8.700 | photo-pose-trunk-bias:photo-pose-trunk-bias | photo-pose-trunk-bias:medium | photo-pose-trunk-bias:primary | photo-pose-trunk-bias:ASSESSMENT_MOVEMENT_RELEVANT | photo-pose-trunk-bias:supports | photo-pose-trunk-bias:0.720 | photo-pose-trunk-bias:0.432 | photo-pose-trunk-bias:0.288 |

#### E. Trunk Activation Hard-Rejected Candidates

| Exercise | Rejection stage | Reason code | Explanation |
| --- | --- | --- | --- |
| ninety-ninety-breathing / 90/90 Breathing | role_eligibility | ROLE_MISMATCH | 90/90 Breathing is not defined for activation. |
| ninety-ninety-breathing / 90/90 Breathing | role_eligibility | TRAINING_NEED_MISMATCH | 90/90 Breathing is not suitable for the requested activation section. |
| serratus-wall-slide / Serratus Wall Slide | role_eligibility | TRAINING_NEED_MISMATCH | Serratus Wall Slide does not match the requested movement role(s). |
| serratus-wall-slide / Serratus Wall Slide | role_eligibility | TRAINING_NEED_MISMATCH | Serratus Wall Slide does not train the requested target muscle(s). |
| push-up / Push-Up | role_eligibility | ROLE_MISMATCH | Push-Up is not defined for activation. |
| push-up / Push-Up | role_eligibility | TRAINING_NEED_MISMATCH | Push-Up is not suitable for the requested activation section. |
| dumbbell-bench-press / Dumbbell Bench Press | role_eligibility | ROLE_MISMATCH | Dumbbell Bench Press is not defined for activation. |
| dumbbell-bench-press / Dumbbell Bench Press | role_eligibility | TRAINING_NEED_MISMATCH | Dumbbell Bench Press is not suitable for the requested activation section. |
| dumbbell-bench-press / Dumbbell Bench Press | role_eligibility | TRAINING_NEED_MISMATCH | Dumbbell Bench Press does not match the requested movement role(s). |
| dumbbell-bench-press / Dumbbell Bench Press | role_eligibility | TRAINING_NEED_MISMATCH | Dumbbell Bench Press does not train the requested target muscle(s). |
| machine-chest-press / Machine Chest Press | role_eligibility | ROLE_MISMATCH | Machine Chest Press is not defined for activation. |
| machine-chest-press / Machine Chest Press | role_eligibility | TRAINING_NEED_MISMATCH | Machine Chest Press is not suitable for the requested activation section. |
| machine-chest-press / Machine Chest Press | role_eligibility | TRAINING_NEED_MISMATCH | Machine Chest Press does not match the requested movement role(s). |
| machine-chest-press / Machine Chest Press | role_eligibility | TRAINING_NEED_MISMATCH | Machine Chest Press does not train the requested target muscle(s). |
| cable-chest-fly / Cable Chest Fly | role_eligibility | ROLE_MISMATCH | Cable Chest Fly is not defined for activation. |
| cable-chest-fly / Cable Chest Fly | role_eligibility | TRAINING_NEED_MISMATCH | Cable Chest Fly is not suitable for the requested activation section. |
| cable-chest-fly / Cable Chest Fly | role_eligibility | TRAINING_NEED_MISMATCH | Cable Chest Fly does not match the requested movement role(s). |
| cable-chest-fly / Cable Chest Fly | role_eligibility | TRAINING_NEED_MISMATCH | Cable Chest Fly does not train the requested target muscle(s). |
| chest-supported-dumbbell-row / Chest-Supported Dumbbell Row | role_eligibility | ROLE_MISMATCH | Chest-Supported Dumbbell Row is not defined for activation. |
| chest-supported-dumbbell-row / Chest-Supported Dumbbell Row | role_eligibility | TRAINING_NEED_MISMATCH | Chest-Supported Dumbbell Row is not suitable for the requested activation section. |
| chest-supported-dumbbell-row / Chest-Supported Dumbbell Row | role_eligibility | TRAINING_NEED_MISMATCH | Chest-Supported Dumbbell Row does not match the requested movement role(s). |
| chest-supported-dumbbell-row / Chest-Supported Dumbbell Row | role_eligibility | TRAINING_NEED_MISMATCH | Chest-Supported Dumbbell Row does not train the requested target muscle(s). |
| one-arm-dumbbell-row / One-Arm Dumbbell Row | role_eligibility | ROLE_MISMATCH | One-Arm Dumbbell Row is not defined for activation. |
| one-arm-dumbbell-row / One-Arm Dumbbell Row | role_eligibility | TRAINING_NEED_MISMATCH | One-Arm Dumbbell Row is not suitable for the requested activation section. |
| one-arm-dumbbell-row / One-Arm Dumbbell Row | role_eligibility | TRAINING_NEED_MISMATCH | One-Arm Dumbbell Row does not match the requested movement role(s). |
| machine-row / Machine Row | role_eligibility | ROLE_MISMATCH | Machine Row is not defined for activation. |
| machine-row / Machine Row | role_eligibility | TRAINING_NEED_MISMATCH | Machine Row is not suitable for the requested activation section. |
| machine-row / Machine Row | role_eligibility | TRAINING_NEED_MISMATCH | Machine Row does not match the requested movement role(s). |
| machine-row / Machine Row | role_eligibility | TRAINING_NEED_MISMATCH | Machine Row does not train the requested target muscle(s). |
| seated-cable-row / Seated Cable Row | role_eligibility | ROLE_MISMATCH | Seated Cable Row is not defined for activation. |
| seated-cable-row / Seated Cable Row | role_eligibility | TRAINING_NEED_MISMATCH | Seated Cable Row is not suitable for the requested activation section. |
| seated-cable-row / Seated Cable Row | role_eligibility | TRAINING_NEED_MISMATCH | Seated Cable Row does not match the requested movement role(s). |
| seated-cable-row / Seated Cable Row | role_eligibility | TRAINING_NEED_MISMATCH | Seated Cable Row does not train the requested target muscle(s). |
| band-row / Band Row | role_eligibility | TRAINING_NEED_MISMATCH | Band Row does not match the requested movement role(s). |
| band-row / Band Row | role_eligibility | TRAINING_NEED_MISMATCH | Band Row does not train the requested target muscle(s). |
| dumbbell-shoulder-press / Dumbbell Shoulder Press | role_eligibility | ROLE_MISMATCH | Dumbbell Shoulder Press is not defined for activation. |
| dumbbell-shoulder-press / Dumbbell Shoulder Press | role_eligibility | TRAINING_NEED_MISMATCH | Dumbbell Shoulder Press is not suitable for the requested activation section. |
| dumbbell-shoulder-press / Dumbbell Shoulder Press | role_eligibility | TRAINING_NEED_MISMATCH | Dumbbell Shoulder Press does not match the requested movement role(s). |
| lat-pulldown / Lat Pulldown | role_eligibility | ROLE_MISMATCH | Lat Pulldown is not defined for activation. |
| lat-pulldown / Lat Pulldown | role_eligibility | TRAINING_NEED_MISMATCH | Lat Pulldown is not suitable for the requested activation section. |
| lat-pulldown / Lat Pulldown | role_eligibility | TRAINING_NEED_MISMATCH | Lat Pulldown does not match the requested movement role(s). |
| lat-pulldown / Lat Pulldown | role_eligibility | TRAINING_NEED_MISMATCH | Lat Pulldown does not train the requested target muscle(s). |
| band-lat-pulldown / Band Lat Pulldown | role_eligibility | TRAINING_NEED_MISMATCH | Band Lat Pulldown does not match the requested movement role(s). |
| band-lat-pulldown / Band Lat Pulldown | role_eligibility | TRAINING_NEED_MISMATCH | Band Lat Pulldown does not train the requested target muscle(s). |
| goblet-squat / Goblet Squat | role_eligibility | ROLE_MISMATCH | Goblet Squat is not defined for activation. |
| goblet-squat / Goblet Squat | role_eligibility | TRAINING_NEED_MISMATCH | Goblet Squat is not suitable for the requested activation section. |
| goblet-squat / Goblet Squat | role_eligibility | TRAINING_NEED_MISMATCH | Goblet Squat does not match the requested movement role(s). |
| leg-press / Leg Press | role_eligibility | ROLE_MISMATCH | Leg Press is not defined for activation. |
| leg-press / Leg Press | role_eligibility | TRAINING_NEED_MISMATCH | Leg Press is not suitable for the requested activation section. |
| leg-press / Leg Press | role_eligibility | TRAINING_NEED_MISMATCH | Leg Press does not match the requested movement role(s). |
| leg-press / Leg Press | role_eligibility | TRAINING_NEED_MISMATCH | Leg Press does not train the requested target muscle(s). |
| bodyweight-box-squat / Bodyweight Box Squat | role_eligibility | TRAINING_NEED_MISMATCH | Bodyweight Box Squat does not match the requested movement role(s). |
| dumbbell-romanian-deadlift / Dumbbell Romanian Deadlift | role_eligibility | ROLE_MISMATCH | Dumbbell Romanian Deadlift is not defined for activation. |
| dumbbell-romanian-deadlift / Dumbbell Romanian Deadlift | role_eligibility | TRAINING_NEED_MISMATCH | Dumbbell Romanian Deadlift is not suitable for the requested activation section. |
| dumbbell-romanian-deadlift / Dumbbell Romanian Deadlift | role_eligibility | TRAINING_NEED_MISMATCH | Dumbbell Romanian Deadlift does not match the requested movement role(s). |
| cable-pull-through / Cable Pull-Through | role_eligibility | TRAINING_NEED_MISMATCH | Cable Pull-Through does not match the requested movement role(s). |
| split-squat / Split Squat | role_eligibility | ROLE_MISMATCH | Split Squat is not defined for activation. |
| split-squat / Split Squat | role_eligibility | TRAINING_NEED_MISMATCH | Split Squat is not suitable for the requested activation section. |
| split-squat / Split Squat | role_eligibility | TRAINING_NEED_MISMATCH | Split Squat does not match the requested movement role(s). |
| step-up / Step-Up | role_eligibility | ROLE_MISMATCH | Step-Up is not defined for activation. |
| step-up / Step-Up | role_eligibility | TRAINING_NEED_MISMATCH | Step-Up does not match the requested movement role(s). |
| lying-leg-curl / Lying Leg Curl | role_eligibility | ROLE_MISMATCH | Lying Leg Curl is not defined for activation. |
| lying-leg-curl / Lying Leg Curl | role_eligibility | TRAINING_NEED_MISMATCH | Lying Leg Curl is not suitable for the requested activation section. |
| lying-leg-curl / Lying Leg Curl | role_eligibility | TRAINING_NEED_MISMATCH | Lying Leg Curl does not match the requested movement role(s). |
| lying-leg-curl / Lying Leg Curl | role_eligibility | TRAINING_NEED_MISMATCH | Lying Leg Curl does not train the requested target muscle(s). |
| glute-bridge / Glute Bridge | role_eligibility | TRAINING_NEED_MISMATCH | Glute Bridge does not match the requested movement role(s). |
| dumbbell-lateral-raise / Dumbbell Lateral Raise | role_eligibility | ROLE_MISMATCH | Dumbbell Lateral Raise is not defined for activation. |
| dumbbell-lateral-raise / Dumbbell Lateral Raise | role_eligibility | TRAINING_NEED_MISMATCH | Dumbbell Lateral Raise is not suitable for the requested activation section. |
| dumbbell-lateral-raise / Dumbbell Lateral Raise | role_eligibility | TRAINING_NEED_MISMATCH | Dumbbell Lateral Raise does not match the requested movement role(s). |
| dumbbell-lateral-raise / Dumbbell Lateral Raise | role_eligibility | TRAINING_NEED_MISMATCH | Dumbbell Lateral Raise does not train the requested target muscle(s). |
| reverse-pec-deck / Reverse Pec Deck | role_eligibility | TRAINING_NEED_MISMATCH | Reverse Pec Deck does not match the requested movement role(s). |
| reverse-pec-deck / Reverse Pec Deck | role_eligibility | TRAINING_NEED_MISMATCH | Reverse Pec Deck does not train the requested target muscle(s). |
| band-face-pull / Band Face Pull | role_eligibility | TRAINING_NEED_MISMATCH | Band Face Pull does not match the requested movement role(s). |
| band-face-pull / Band Face Pull | role_eligibility | TRAINING_NEED_MISMATCH | Band Face Pull does not train the requested target muscle(s). |
| dumbbell-curl / Dumbbell Curl | role_eligibility | ROLE_MISMATCH | Dumbbell Curl is not defined for activation. |
| dumbbell-curl / Dumbbell Curl | role_eligibility | TRAINING_NEED_MISMATCH | Dumbbell Curl is not suitable for the requested activation section. |
| dumbbell-curl / Dumbbell Curl | role_eligibility | TRAINING_NEED_MISMATCH | Dumbbell Curl does not match the requested movement role(s). |
| dumbbell-curl / Dumbbell Curl | role_eligibility | TRAINING_NEED_MISMATCH | Dumbbell Curl does not train the requested target muscle(s). |
| cable-triceps-pressdown / Cable Triceps Pressdown | role_eligibility | ROLE_MISMATCH | Cable Triceps Pressdown is not defined for activation. |
| cable-triceps-pressdown / Cable Triceps Pressdown | role_eligibility | TRAINING_NEED_MISMATCH | Cable Triceps Pressdown is not suitable for the requested activation section. |
| cable-triceps-pressdown / Cable Triceps Pressdown | role_eligibility | TRAINING_NEED_MISMATCH | Cable Triceps Pressdown does not match the requested movement role(s). |
| cable-triceps-pressdown / Cable Triceps Pressdown | role_eligibility | TRAINING_NEED_MISMATCH | Cable Triceps Pressdown does not train the requested target muscle(s). |
<!-- HUMAN_RANKING_REVIEW_END -->
