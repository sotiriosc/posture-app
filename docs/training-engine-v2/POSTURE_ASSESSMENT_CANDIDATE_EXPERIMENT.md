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

Raw pose output contained repeated head-position observations, but `buildAssessmentReport` did not emit `pose-forward-head`. The likely reason is a wording mismatch: `generateObservations` emits "Head position measured...", while `buildPoseObservations` looks for text containing "forward head".

That looks like under-normalization in the existing assessment pipeline, not a V2 issue.

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
