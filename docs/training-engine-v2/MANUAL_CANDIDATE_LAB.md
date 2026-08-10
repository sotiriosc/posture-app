# Quick Start

Assume the working directory is `/home/sotiriosc/posture-app-engine-v2`.

```bash
cd /home/sotiriosc/posture-app-engine-v2
npm run engine:v2:lab --workspace=@praxis/training-engine-v2
```

The lab is interactive. It prompts for persona, phase, training need, assessment, pain/concern, history, and output mode. It calls the real `runCandidateRankingLab` pipeline and prints ranked candidates, component raw scores/weights/contributions, assessment trace summaries, hard rejections, and an assessment OFF/ON comparison when selected.

To run the first scenario without prompts:

```bash
npm run engine:v2:lab --workspace=@praxis/training-engine-v2 -- --defaults
```

## Scenario 1: Real Posture Horizontal Pull

Use this as the first smoke scenario.

| Prompt | Choice |
| --- | --- |
| Persona | `1. Intermediate gym, muscle gain` |
| Phase | `1. Phase 2` |
| Training Need | `1. Horizontal Pull Main` |
| Assessment | `1. Real Posture Photo` |
| Pain / Concern | `1. None` |
| History | `1. None` |
| Output Mode | `1. Assessment OFF/ON Comparison` |

Look for the legal horizontal-pull pool, component weighted contributions, posture assessment traces, and the OFF/ON delta table.

## Scenario 2: Wrist Discomfort Should Not Reduce Squat Trunk Demand

| Prompt | Choice |
| --- | --- |
| Persona | `1. Intermediate gym, muscle gain` |
| Phase | `3. Phase 3` |
| Training Need | `3. Squat Main` |
| Assessment | `4. Trunk Control` |
| Pain / Concern | `5. Wrist Discomfort` |
| History | `1. None` |
| Output Mode | `1. Assessment OFF/ON Comparison` |

Inspect `demand-reduction` lines. Squat/trunk traces should not show wrist pain as relevant demand-reduction context.

## Scenario 3: Knee Discomfort Can Reduce Squat Demand

| Prompt | Choice |
| --- | --- |
| Persona | `1. Intermediate gym, muscle gain` |
| Phase | `3. Phase 3` |
| Training Need | `3. Squat Main` |
| Assessment | `6. Knee Control` |
| Pain / Concern | `4. Knee Discomfort` |
| History | `1. None` |
| Output Mode | `1. Assessment OFF/ON Comparison` |

Look for `lab-knee-discomfort` under matched pain context and `reduces_excess_demand` on below-capability squat traces.

## Scenario 4: Low-Back Context Changes Horizontal Pull

| Prompt | Choice |
| --- | --- |
| Persona | `2. Mixed home` |
| Phase | `1. Phase 2` |
| Training Need | `1. Horizontal Pull Main` |
| Assessment | `7. Low-Back Hinge` |
| Pain / Concern | `3. Low-Back Discomfort` |
| History | `1. None` |
| Output Mode | `1. Assessment OFF/ON Comparison` |

Compare supported and unsupported row traces. The demand-reduction context should be scoped to the low-back row context, not applied globally.

## Scenario 5: History Evidence Quality

| Prompt | Choice |
| --- | --- |
| Persona | `1. Intermediate gym, muscle gain` |
| Phase | `1. Phase 2` |
| Training Need | `6. Scapular Activation` |
| Assessment | `5. Scapular Control` |
| Pain / Concern | `1. None` |
| History | `3. Scapular Successes` |
| Output Mode | `1. Assessment OFF/ON Comparison` |

Then rerun with `4. Scapular Contradiction`. Compare the `history:` summaries for matching count, positive/negative counts, contradiction, progression corroboration, evidence quality, and adjustment.
