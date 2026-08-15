# Product Training Goal Compiler Fallthrough Audit

Status: `AUDIT_ONLY_NO_BEHAVIOR_CHANGE`

Classification: `PRODUCT_TRAINING_GOAL_AND_PRESCRIPTION_SPECIFICITY_V1_READY_FOR_OWNER_POLICY_SELECTION`

Selected policy: `NO`

Production/Product/shadow rollout changed: `NO/NO/NO`

## Exact branch

After preparation, activation, recovery, holds, breaths, carries, marches, counted steps, and secondary-strength branches, main-section work evaluates only whether the goal is hypertrophy. Hypertrophy resolves to `main_hypertrophy`; every other value resolves to `main_strength`.

## Consequence

The affected goal/context states are general fitness, conditioning, posture/movement quality, legacy pain-aware return, and unknown/legacy values. The canonical primary-main repetition exercise set contains 12 exercises:

- `push-up`
- `dumbbell-bench-press`
- `machine-chest-press`
- `chest-supported-dumbbell-row`
- `one-arm-dumbbell-row`
- `machine-row`
- `seated-cable-row`
- `dumbbell-shoulder-press`
- `lat-pulldown`
- `goblet-squat`
- `leg-press`
- `dumbbell-romanian-deadlift`

This does not convert every session element to strength. It affects main repetition-set assignments that reach the branch. The finding is classified `OVERBROAD_FALLTHROUGH`; this audit does not alter it.

Audit fingerprint: `0606f9cd19d73e8cf683080c3b71fad1af7eb19d0c873a2361e294cde3be27fb`.

Next dependency: `OWNER_SELECTION_OF_PRODUCT_GOAL_VOCABULARY_AND_GOAL_SPECIFIC_PRESCRIPTION_POLICY`.
