# Role, Muscle, and Personalization Regression Matrix

Production inventory: 45 rows / 45 stable IDs. P0 production additions: 8.

## Role And Action Corrections

| Exercise | Broad roles | Exact actions |
| --- | --- | --- |
| dumbbell-curl | accessory | elbow_flexion |
| cable-triceps-pressdown | accessory | elbow_extension |
| dumbbell-lateral-raise | accessory | shoulder_abduction |
| lying-leg-curl | accessory | knee_flexion |
| cable-chest-fly | accessory | shoulder_horizontal_adduction |
| reverse-pec-deck | scapular_control | shoulder_horizontal_abduction, scapular_retraction |
| band-face-pull | scapular_control | scapular_retraction, shoulder_external_rotation |
| glute-bridge | accessory | hip_extension |
| serratus-wall-slide | scapular_control | scapular_upward_rotation |

## Knee-Dominant Review

| Exercise | Broad roles |
| --- | --- |
| goblet-squat | squat, knee_dominant |
| leg-press | knee_dominant |
| bodyweight-box-squat | squat, knee_dominant |
| split-squat | single_leg, knee_dominant |
| step-up | single_leg, knee_dominant |

## Causal Personalization

Active: goal, experience, preferred_exercise_ids, disliked_exercise_ids, assessment_priority, assessment_confidence, relevant_pain, safety_readiness, equipment, continuity, plateau, tolerated_response, adverse_response, personal_block, phase, fatigue.
Intentionally inert: athlete_id, athlete_label, prose_notes, irrelevant_pain.
Future Composer: availability, variety_preference, preferred_training_days.
Equivalent active facts may produce JUSTIFIED_CONVERGENCE; uniqueness is never forced.

## Unchanged Boundaries

| Boundary | Pre | Post | Invariant |
| --- | --- | --- | --- |
| phase metadata | 86a0ca4631d76772ba1dc579f668f624d8aea958be11544ee6e38e245b4e16f3 | 86a0ca4631d76772ba1dc579f668f624d8aea958be11544ee6e38e245b4e16f3 | true |
| safety/response | 539dba50cc8d0dda4dcaa28cfc9cc764d15049aba8bddace707bff5b98d2c562 | 539dba50cc8d0dda4dcaa28cfc9cc764d15049aba8bddace707bff5b98d2c562 | true |
| equipment metadata | 83fa2d16310e0965d84ef1416cfedbb7961aefdaa37414396a102f066b53bc46 | 83fa2d16310e0965d84ef1416cfedbb7961aefdaa37414396a102f066b53bc46 | true |
| progression metadata | faf82d77f021267fbc32beeb9c796c54340dec02443981880039df1fa7632fd5 | faf82d77f021267fbc32beeb9c796c54340dec02443981880039df1fa7632fd5 | true |
| pre-P0 37-row identity inventory | 2bd3669bc06d91d09408a72d455520a62758c644e529ea0a732a7acf95915a44 | 2bd3669bc06d91d09408a72d455520a62758c644e529ea0a732a7acf95915a44 | true |

## Isolated Fingerprints

| Dimension | Fingerprint |
| --- | --- |
| movementRoles | c84bb01430131d4ac4277ba60c02c1401373729013991aef34fcb357edaa9b27 |
| actionFunctions | 4dd47e3a6da5a031ba6da5d9751bb0d89d44a3813ab13db3b420689052df2d97 |
| muscleMigration | e08f6fb538436278aa75ddaf7398a77a8a53d9a83c76b32c025e7e4d97ff8e35 |
| needRequirements | 7d22119311f861aa51a451d8c29c7a845e4514c485439b23ca76f17bb556df95 |
| personalization | 6d44c963065778de33b3a53c32702013e16cb73e2246e1bb3ecde314a59bf408 |
| rolePools | 453977b9ef75bbbf9fb886517b756079f71e57b6ce2b4fed63104afc81abb7a7 |
| phaseMetadata | dbd76206430c24ff600d12bc1d46724c25e18d3dad43ed118a96fcb21b71cec7 |
| safetyResponse | 539dba50cc8d0dda4dcaa28cfc9cc764d15049aba8bddace707bff5b98d2c562 |
| equipmentMetadata | 7a7864d3f2de8b1d25dfbb781dc77e5476a8faa441013a488a2b91beadd224e8 |
| progressionMetadata | 280b519cf271f9641220313b1a3589463ded13920face5e8522ba927c9a96623 |
| identityInventory | 49b38724c2aa562d6471f09d62cb0d1b09b9900b474139a0279c2adb82919c90 |
| p0Production | 4b10a34a5a524992f499d5bc5bee3db7b382be0a506c2dde3aca7ef2005e9384 |
| combined | a1082c30e93ebc318d129dea702bde0795dde829bc9b64afbff7767c8c565144 |
