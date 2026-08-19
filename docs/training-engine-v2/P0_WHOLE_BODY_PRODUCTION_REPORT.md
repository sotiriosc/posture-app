# P0 Whole-Body Production Report

Classification: `P0_WHOLE_BODY_PRODUCTION_ADMITTED`. Catalog: 37 -> 45; unique IDs: 45.

## Production Contract

| ID | Family | Movement roles | Actions | Training roles | Sections |
| --- | --- | --- | --- | --- | --- |
| standing-calf-raise | calf_accessory | accessory | ankle_plantar_flexion | hypertrophy_accessory | accessory |
| side-lying-hip-adduction | hip_accessory | accessory | hip_adduction | activation, hypertrophy_accessory | activation, accessory |
| loop-band-lateral-walk | hip_accessory | accessory | hip_abduction | activation, hypertrophy_accessory | activation, accessory |
| side-lying-dumbbell-external-rotation | cuff_control | accessory | shoulder_external_rotation | activation, hypertrophy_accessory | activation, accessory |
| supine-hamstring-walkout | glute_hamstring | accessory | knee_flexion, hip_extension | activation, hypertrophy_accessory | activation, accessory |
| wall-ankle-dorsiflexion-rock | mobility_preparation | mobility | ankle_dorsiflexion | preparation | warmup |
| bodyweight-hip-hinge-rehearsal | hinge_pattern | hinge | hip_extension | preparation, activation | warmup, activation |
| single-leg-balance-rehearsal | single_leg_pattern | single_leg | single_leg_stance_control | preparation, activation | warmup, activation |

## Anatomy And Equipment

| ID | Canonical muscle contributions | Required | Optional |
| --- | --- | --- | --- |
| standing-calf-raise | calves:primary_target, trunk:stabilizer_or_contextual_contributor | bodyweight-floor:all(bodyweight+floor_space) | dumbbells:all(dumbbells), stable-support-surface:all(stable_support_surface) |
| side-lying-hip-adduction | hip_adductors:primary_target, trunk:stabilizer_or_contextual_contributor | bodyweight-floor:all(bodyweight+floor_space) | none |
| loop-band-lateral-walk | hip_abductors:primary_target, glutes:key_secondary_target, quads:incidental_contributor, trunk:stabilizer_or_contextual_contributor | loop-band:all(loop_band), floor-space:all(floor_space) | stable-support-surface:all(stable_support_surface) |
| side-lying-dumbbell-external-rotation | rotator_cuff:primary_target, rear_delts:incidental_contributor | dumbbells:all(dumbbells), floor-or-bench-support:oneOf(floor_space\|flat_bench\|adjustable_bench) | none |
| supine-hamstring-walkout | hamstrings:primary_target, glutes:key_secondary_target, trunk:stabilizer_or_contextual_contributor | bodyweight-floor:all(bodyweight+floor_space) | none |
| wall-ankle-dorsiflexion-rock | calves:stabilizer_or_contextual_contributor | wall-and-floor-space:all(wall+floor_space) | none |
| bodyweight-hip-hinge-rehearsal | glutes:key_secondary_target, hamstrings:key_secondary_target, trunk:stabilizer_or_contextual_contributor | bodyweight-floor:all(bodyweight+floor_space) | wall-support:all(wall), stable-support-surface:all(stable_support_surface) |
| single-leg-balance-rehearsal | hip_abductors:key_secondary_target, calves:incidental_contributor, trunk:stabilizer_or_contextual_contributor | bodyweight-floor:all(bodyweight+floor_space) | stable-support-surface:all(stable_support_surface) |

## Mechanics And Loading

| ID | Support/stance | Resistance path | Loadability | Loading potential | Local/systemic fatigue |
| --- | --- | --- | --- | --- | --- |
| standing-calf-raise | standing/bilateral/upright/prescription_modifiable | prescription_dependent | moderate | moderate | moderate/low |
| side-lying-hip-adduction | side_support/unknown/lateral/substantial | bodyweight | limited | moderate | moderate/low |
| loop-band-lateral-walk | standing/alternating_march/upright/prescription_modifiable | band_unanchored | limited | moderate | moderate/low |
| side-lying-dumbbell-external-rotation | side_support/unknown/lateral/substantial | free_implement | limited | low | moderate/low |
| supine-hamstring-walkout | supine/bilateral/supine/substantial | bodyweight | limited | moderate | high/low |
| wall-ankle-dorsiflexion-rock | standing/split/upright/light_touch | bodyweight | none | low | low/low |
| bodyweight-hip-hinge-rehearsal | standing/bilateral/upright/prescription_modifiable | bodyweight | none | low | low/low |
| single-leg-balance-rehearsal | standing/single_leg/upright/prescription_modifiable | bodyweight | none | low | low/low |

## Progression, Transitions, And Coaching

| ID | Progression axes | Observational transitions | Coaching focus |
| --- | --- | --- | --- |
| standing-calf-raise | load, reps, sets, range, tempo, support_reduction, stability | none | Rise through the ball of the foot / Control the full return |
| side-lying-hip-adduction | reps, sets, range, tempo, lever | none | Lift with the inner thigh / Keep the pelvis stacked |
| loop-band-lateral-walk | load, steps, sets, range, tempo, effort, support_reduction | none | Step without letting the knees collapse / Keep steady band tension |
| side-lying-dumbbell-external-rotation | load, reps, sets, range, tempo | none | Rotate from the shoulder / Keep the elbow position quiet |
| supine-hamstring-walkout | steps, reps, sets, range, tempo, duration, lever | none | Keep the hips controlled / Walk only as far as you can own |
| wall-ankle-dorsiflexion-rock | range, reps, tempo, duration | none | Guide the knee forward over the foot / Keep the heel grounded |
| bodyweight-hip-hinge-rehearsal | range, reps, tempo, support_reduction, coordination | cable-pull-through (preparation_to_loaded_training, increase_loadability, movement_pattern_development; automatic=none); dumbbell-romanian-deadlift (preparation_to_loaded_training, increase_loadability, movement_pattern_development; automatic=none) | Send the hips back / Keep the trunk organized |
| single-leg-balance-rehearsal | duration, reps, support_reduction, range, stability, coordination | split-squat (preparation_to_loaded_training, increase_loadability; automatic=none); step-up (preparation_to_loaded_training, increase_loadability; automatic=none) | Use only the support you need / Keep the stance side controlled |

All eight rows have no hard prerequisites, no accepted contextual phase annotation, and no caution or contraindication tag. Standing Calf Raise alone exposes `grip_loading` as dose-created potential when an implement is prescribed; the other seven rows add no accepted stress annotation.

All rows use canonical muscle contributions, compact coaching fallbacks, contextual phase abstention, and one canonical catalog. No P1 row, Composer, Library, Knowledge implementation, Coaching Rail, or automatic behavior is included.

## Fingerprints

Production ranking before/after: `6d4603fa0a2f604c13e8dde8d1758b38af0452a505c2df6c7618520524fdda56` / `d218c647c71af0fc6ae86ad9032065d37aa3006239c6dfce959483f9ebecf7f7`.

Comprehensive behavior before/after: `fb08893df66978c60edf912d58cd333e649c5b79d1bf965595b588f49db104de` / `1e9abd5713469223636ead6edfdd3a7a5725027529e58a33b476ac9a0753bd1e`.

| Dimension | Fingerprint |
| --- | --- |
| catalogAddition | 5e6245d3b2c7477002e2e4bde4fb407b8dd5e29a708af28f0155fe8bb4feb258 |
| p0Identities | 58be53b076ac0ee02f337e8b09d7d1933e8b8083156a86aaa73592c1b80f14e4 |
| p0RoleActionPools | 1efa0e90f79ce7b74c3060cec5d44e91f1794beedf29b48ccd8d46f229585c1f |
| p0MuscleContributions | 5fe98a4ea019e41ed4b7d8d5e0ec2052f2ff9d880c9170cd5f4f1d7b8b650d4c |
| p0EquipmentLegality | 21cf5c4fdfc2d75acc4b6410fb7e24b96a8bee0dad5e86a0fc9141954c508f28 |
| supportStanceAdditions | bf86223b756527e7a17af41a7c4bc484bcd5dbb68c19b2ae74d19fbd3aef6f67 |
| resistancePathAdditions | 36a32ab632958708c2e5a661171d11d88beb84e984d465d9f2dfebe18f143a8b |
| p0Personalization | f09a3869a43acda25673ff15eab0ecb0cdd8ba386a27ace86f2058a73c59e272 |
| p0PainSafetyResponse | c8bbc4066b8b31b6117d49460f2ebf3cb4cb4421e09acd50af2a4ba8a9eb16d2 |
| wholeBodyMatrix | 29eb15f92f4f6d8fd7049255aed6430c99ed6c3780866daa8c38c044080349bf |
| graduationReview | f367235f1a385e7ebcf0e391af42e96f90e9ec9ad11e8fc0d968ebf53d4f31dc |
| knowledgeCompatibility | e31f864adaa0707a22bfb92d172fc596476acc923fe023cedf3abfd3ece8ac73 |
| productionRanking | d218c647c71af0fc6ae86ad9032065d37aa3006239c6dfce959483f9ebecf7f7 |
| comprehensiveBehavior | 1e9abd5713469223636ead6edfdd3a7a5725027529e58a33b476ac9a0753bd1e |
