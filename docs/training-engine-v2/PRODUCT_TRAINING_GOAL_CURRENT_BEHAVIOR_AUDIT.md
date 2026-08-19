# Product Training Goal Current Behavior Audit

Status: `AUDIT_ONLY_NO_BEHAVIOR_CHANGE`

Classification: `PRODUCT_TRAINING_GOAL_AND_PRESCRIPTION_SPECIFICITY_V1_READY_FOR_OWNER_POLICY_SELECTION`

Selected policy: `NO`

Production/Product/shadow rollout changed: `NO/NO/NO`

## Verified behavior

| Goal/context | Canonical | Current main repetition use case | Week status | Product option |
| --- | --- | --- | --- | --- |
| strength | yes | main_strength | supported_major_strength_movement_development_S2 | no |
| hypertrophy | yes | main_hypertrophy | unsupported_requires_policy | no |
| general_fitness | yes | main_strength | unsupported_requires_policy | yes |
| conditioning | yes | main_strength | unsupported_requires_policy | no |
| posture_and_movement_quality | yes | main_strength | unsupported_requires_policy | yes |
| pain_aware_return | no | main_strength | context_not_week_goal | yes |
| unknown_or_legacy | no | main_strength | mapping_or_policy_required | no |

Product currently offers Improve posture, Reduce pain, Athletic performance, and General fitness. It does not offer Build strength or Build muscle. Product `trainingIntent=build` means developmental progression, not a canonical outcome. The compiler consequence is narrow but material: main-section repetition-set assignments that survive earlier role/dose-mode branches default to `main_strength` unless the goal is exactly `hypertrophy`.

Audit fingerprint: `0606f9cd19d73e8cf683080c3b71fad1af7eb19d0c873a2361e294cde3be27fb`.

Next dependency: `OWNER_SELECTION_OF_PRODUCT_GOAL_VOCABULARY_AND_GOAL_SPECIFIC_PRESCRIPTION_POLICY`.
