# Role, Muscle, and Personalization Regression Matrix

Production inventory: 37 rows / 37 stable IDs. P0 proposals: 8; production additions: 0.

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
| 37-row identity inventory | 2bd3669bc06d91d09408a72d455520a62758c644e529ea0a732a7acf95915a44 | 2bd3669bc06d91d09408a72d455520a62758c644e529ea0a732a7acf95915a44 | true |

## Isolated Fingerprints

| Dimension | Fingerprint |
| --- | --- |
| movementRoles | b48b64d14532d54c27cc5507c9b9d85204282250d7b1b895da11c4ea27f06814 |
| actionFunctions | 99678806b52242e5dd53aa9d8867d79b8b9d025b5d92eea06bae96648b74c911 |
| muscleMigration | 78e094ea7ab34c0654a022151e63860ea7e2a603ebfe2f225402d1fd35a4ad06 |
| needRequirements | 7d22119311f861aa51a451d8c29c7a845e4514c485439b23ca76f17bb556df95 |
| personalization | 6d44c963065778de33b3a53c32702013e16cb73e2246e1bb3ecde314a59bf408 |
| rolePools | 771781c7d834b7aeb1000d08fff0129691b9847d42e8f799a5674c19d8b83a09 |
| phaseMetadata | 86a0ca4631d76772ba1dc579f668f624d8aea958be11544ee6e38e245b4e16f3 |
| safetyResponse | 539dba50cc8d0dda4dcaa28cfc9cc764d15049aba8bddace707bff5b98d2c562 |
| equipmentMetadata | 83fa2d16310e0965d84ef1416cfedbb7961aefdaa37414396a102f066b53bc46 |
| progressionMetadata | faf82d77f021267fbc32beeb9c796c54340dec02443981880039df1fa7632fd5 |
| identityInventory | 2bd3669bc06d91d09408a72d455520a62758c644e529ea0a732a7acf95915a44 |
| p0Proposals | d7e55b198bafb4210f227ef766da4a0d8fde7455f3909cc51373803a037043df |
| combined | 0eb9d84e31d1e2641d5a4259741e5be79a32673d80c16036475a0aa1cf61cc77 |
