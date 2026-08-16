# Product Goal Option State Policy

State vocabulary: `legacy_active`, `future_inactive_internal`, `future_shadow_only`, `owner_account_only`, `generally_available`, `follow_up_required`, `policy_required`, `deprecated_legacy`, `unsupported`.

| ID | Display | Outcome | States | Follow-up | Submission |
| --- | --- | --- | --- | --- | --- |
| improve_posture_legacy | Improve posture | posture_and_movement_quality | legacy_active |  | legacy_generateProgram |
| reduce_pain_legacy | Reduce pain |  | legacy_active, deprecated_legacy, follow_up_required | primary_outcome | legacy_generateProgram_only |
| athletic_performance_legacy | Athletic performance |  | legacy_active, follow_up_required, policy_required | performance_focus | legacy_generateProgram_only |
| general_fitness_legacy | General fitness | general_fitness | legacy_active, follow_up_required | fitness_focus | legacy_generateProgram_only |
| get_stronger | Get stronger | strength | future_inactive_internal |  | preview_only_fail_closed |
| build_muscle | Build muscle | hypertrophy | future_shadow_only |  | unavailable |
| improve_fitness_and_stamina | Improve fitness and stamina | general_fitness | future_shadow_only, follow_up_required, policy_required | fitness_focus | unavailable |
| improve_posture_and_movement | Improve posture and movement | posture_and_movement_quality | future_shadow_only |  | unavailable |
| improve_athletic_performance | Improve athletic performance |  | future_shadow_only, follow_up_required, policy_required | performance_focus | unavailable |

First inactive option: `get_stronger`. No current UI reads this registry in Chunk E.

Fingerprint: `3f7050a34c3f7bf786da9c995f386733897d47e2a87663d6d9a2e8c9c5ac7a80`.
