# Training Engine V2 Trunk / Core Domain and Coverage Review

## Decision Summary

The project owner accepted the review finding that `trunk` is a useful umbrella but was not a complete core-programming contract. The production domain can now represent anti-lateral flexion, controlled flexion, controlled rotation, and loaded bracing as selection purposes while keeping carry distinct.

**Option B is accepted and implemented at domain-contract scope**: keep `trunk` as the single umbrella `MuscleGroup`, use explicit selection-purpose `MovementRole` values, and keep function expression in an optional review/provenance-bearing `TrunkMechanicsProfile`. No reference exercise metadata, score, weight, eligibility rule, phase behavior, pain behavior, assessment behavior, or ranking changed in this implementation.

## Owner-Accepted Contract Implementation

- Production roles now include `anti_lateral_flexion_core`, `trunk_flexion`, `trunk_rotation`, and `loaded_bracing`; `carry` remains distinct.
- `ExerciseMechanicsProfile.trunkMechanics` is optional and contains eight field-level function annotations.
- Each annotation exposes `unknown | none | low | moderate | high`, field-level review status, source, structured provenance, and notes. Reviewed `none` remains distinct from unavailable `unknown`.
- `buildTrunkMechanicsTrace` is observability-only. An absent profile yields explicit `profile_unavailable` / `unknown` evidence rather than fabricated `none` values.
- Pure validation requires all eight valid annotations, structured provenance for known levels, and a reviewed basis for accepted unknown evidence.
- Existing reference exercises retain their exact roles and contain no trunk profile. Catalog curation is the next approved boundary; normalized trunk assessment features follow it before Session Composer.

## Representative Trunk Mechanics Curation Under Owner Review

A deterministic 14-exercise by 8-function curation proposal is complete and remains under project-owner review. Its 112 fields are classified as 15 `PROPOSE_ACCEPTED`, 17 `PROPOSE_NEEDS_REVIEW`, and 80 `REMAIN_UNKNOWN`; none of those proposals have been written into production reference metadata.

The proposal classification is **TRUNK_PROFILE_TRANCHE_READY_FOR_OWNER_APPROVAL**. After field-by-field owner decisions and replacement of pending review references with genuine artifacts, the recommended first implementation tranche is limited to 90/90 Breathing, Dead Bug, and Pallof Press. Secondary and supported rows remain proposal evidence only.

## Scope and Evidence

- Current branch reference catalog: 30/30 exercises audited.
- Protected legacy source: golden ancestor `8af4934641c46da9abbe77a62881151cca9cbf34`; inspected without checking it out or modifying it.
- Current receiver inspection: role eligibility/scoring, assessment relevance/demand, pain evidence, transition comparison, row observability, optimizer contracts, and DecisionTrace.
- This is a contract review. Inferred biomechanical functions are labeled `needs review`; they are not silently promoted into exercise facts.
- The accepted phase-context decision remains separate: role/section-scoped phase evidence is not implemented or calibrated here.

## Current Coverage at a Glance

| Measure | Current count | Meaning |
| --- | --- | --- |
| Reference exercises | 30 | Small architecture-test catalog, not a complete catalog |
| Dedicated `core_control` exercises | 2 | Dead Bug and Pallof Press |
| Additional trunk-primary breathing resets | 1 | 90/90 Breathing |
| Primary `trunk` exercises | 3 | 90/90 Breathing, Dead Bug, Pallof Press |
| Secondary `trunk` exercises | 10 | Coarse anatomy; not automatic direct credit |
| Direct developmental trunk exercises | 3 | Three, including one preparation/recovery drill |
| Meaningful secondary trunk exercises | 8 | Eight catalog-supported generic-demand rows; specific functions still need human review |
| Incidental/unreviewed bracing rows | 10 | No direct developmental credit |
| Rows with no current trunk evidence | 9 | Unknown/absent must remain unknown |
| breathing_position / anti-extension / anti-rotation / carry | 1 / 3 / 1 / 0 | Carry is typed but has no reference exercise |
| capacity training-role exercises | 0 | Conditioning/carry composition cannot be exercised |
| ribcage / lumbar_spine / pelvis / general exercises | 1 / 11 / 4 / 0 | No abdomen or abdominal_wall region exists |
| trunk_control low / moderate / high / unknown / mechanics absent | 10 / 7 / 3 / 2 / 8 | Generic demand coverage is broader than function-specific truth |

**Dedicated core-control count: 2.** `90/90 Breathing` is trunk-primary and directly develops breathing/position, but its family and training roles correctly identify preparation/recovery rather than a third generic core-control accessory. A future pressure-coordination annotation still requires review. Heavy compounds provide useful bracing exposure; they do not increase the dedicated count.

## Current Inventory and Receivers

| Input | Giver | Current receiver | Output | Behavioral effect | Trace visibility | Use | Future owner |
| --- | --- | --- | --- | --- | --- | --- | --- |
| MuscleGroup.trunk on request, assessment signal, or exercise | Session/weekly intent, assessment normalization, reference catalog | Role eligibility, muscle-target score, assessment specificity/relevance | Legal-pool truth, muscle-target contribution, generic trunk-control relevance | Can require or prefer trunk candidates, but cannot distinguish abdominal, oblique, or posterior-trunk functions. | Eligibility reasons, muscle_target_fit, assessment relevance and demand traces | PARTIALLY_USED | Candidate Intelligence plus Weekly Development Ledger |
| BodyRegion.ribcage | Exercise metadata, assessment or pain input | Assessment specificity/developmental relationship; pain trace preserves region | Candidate-specific contextual evidence when the exercise also lists ribcage | Can shape assessment relevance; canonical pain matching still keys on explicit stress tags, not region alone. | Assessment and canonical pain traces | PARTIALLY_USED | Assessment normalization and pain receiver policy |
| BodyRegion.lumbar_spine | Exercise metadata, assessment, pain input, training need | Assessment relevance/developmental relationship, row observability, pain trace | Lumbar context and candidate differentiation | Useful localization, but it does not identify a trunk function and does not itself create a pain stress match. | Assessment, row-selection, and pain traces | PARTIALLY_USED | Assessment and pain policy |
| BodyRegion.pelvis | Exercise metadata, assessment, pain input, training need | Assessment specificity/developmental relationship; pain trace | Pelvic-region context | Can increase assessment specificity but remains distinct from muscle-volume and function tracking. | Assessment and pain traces | PARTIALLY_USED | Assessment and pain policy |
| BodyRegion.general | Domain input only | Generic region-capable contracts | Broad non-localized region value | No current reference exercise uses it and it supplies no trunk-specific meaning. | Only if supplied by a request or signal | UNUSED | Input normalization |
| Abdomen / abdominal_wall BodyRegion | Not representable in current V2 | None | None | Anterior abdominal discomfort cannot be localized without misusing ribcage, lumbar_spine, pelvis, or general. | None | UNUSED | Pain and assessment domain after a concrete intake use case |
| MovementRole.breathing_position | Training need, phase intent, assessment signal, exercise metadata | Role eligibility/scoring and generic trunk assessment | Breathing/position candidate match | Truthfully distinguishes 90/90 Breathing, but no weekly receiver aggregates the exposure. | Eligibility and score reasons; assessment traces | PARTIALLY_USED | Candidate Intelligence and Weekly Development Ledger |
| MovementRole.anti_extension_core | Training need, phase intent, assessment signal, exercise metadata | Role eligibility/scoring and generic trunk assessment | Anti-extension candidate match | Separates the three tagged exercises from unrelated candidates, but direct and secondary use are not distinguished. | Eligibility and score reasons; assessment traces | PARTIALLY_USED | Candidate Intelligence, Composer, and ledger |
| MovementRole.anti_rotation_core | Training need, assessment signal, exercise metadata | Role eligibility/scoring and generic trunk assessment | Anti-rotation candidate match | Currently identifies only Pallof Press in the reference catalog. | Eligibility and score reasons; assessment traces | PARTIALLY_USED | Candidate Intelligence, Composer, and ledger |
| MovementRole.carry | Training need or phase capability contract | Role eligibility/scoring can consume it | No legal reference candidate because the catalog contains no carry | The type is present but cannot produce a session or weekly exposure today. | Rejection traces only when requested | UNUSED | Catalog curation, prescription, Composer, and ledger |
| ExerciseFamily.core_control | Reference exercise metadata | Personal block eligibility | Family-level personal block match | Does not itself improve ranking or distinguish core functions. | Personal-block rejection reason | PARTIALLY_USED | Catalog taxonomy and personal-block policy |
| ExerciseFamily.breathing_reset | Reference exercise metadata | Personal block eligibility | Family-level personal block match | Preserves catalog identity; role and section metadata do the candidate-selection work. | Personal-block rejection reason | PARTIALLY_USED | Catalog taxonomy |
| Exercise mechanics: trunk_control | Reference exercise mechanics profile | Assessment demand/capability comparison, transition comparison, row observability | Generic low/moderate/high trunk-control demand | Can influence relevant assessment scoring, but collapses all trunk functions into one dimension. | Assessment demand traces, transition traces, row-selection trace | PARTIALLY_USED | Candidate Intelligence mechanics contract |
| ExerciseMechanicsProfile.trunkMechanics | Human-reviewed exercise knowledge | Pure validation and buildTrunkMechanicsTrace | Eight field-level trunk-function annotations or explicit profile-unavailable trace evidence | Observability only; no legality, score, pain, phase, assessment, or transition effect. | TrunkMechanicsTrace exposes level, review status, source, provenance, and notes | PARTIALLY_USED | Reference catalog curation before trunk assessment features |
| Exercise mechanics: stability and coordination | Mechanics annotations or loading-profile fallback | Assessment demand/capability and transition comparison | General demand and transition deltas | Useful context, but neither field identifies which trunk function creates the demand. | Assessment and transition traces | PARTIALLY_USED | Candidate Intelligence mechanics contract |
| Exercise mechanics: range and joint_control | Mechanics annotations or temporary skill-demand proxy | Assessment demand/capability and transition comparison | Range/joint-control demand, sometimes review-qualified | Cannot substitute for controlled trunk flexion or rotation semantics. | Assessment and transition traces include source/review status | PARTIALLY_USED | Mechanics review |
| AssessmentSignal movementRole / muscleGroup / region | Assessment adapter or fixture | signalIsTrunk, specificity, relevance, demand/capability match | Generic trunk_control assessment influence | Candidate-specific and role-bounded, but cannot express a normalized trunk feature beyond generic control. | Assessment relevance, interpretation, capability, demand, and relationship traces | PARTIALLY_USED | Assessment semantics |
| AssessmentFeature for trunk function | Not representable; current features are scapular only | None | None | No feature-specific anti-extension, rotational, lateral, loaded-bracing, or ribcage-pelvis evidence can be normalized. | None | UNUSED | Assessment semantics before Session Composer |
| WeeklyIntent.movementExposure | Future week planner | Week optimizer contract only | Requested movement-role counts | No current implementation evaluates or fulfills the target. | WeeklyIntent can be attached to DecisionTrace, but the candidate lab does not produce ledger effects. | UNUSED | Weekly Development Ledger |
| WeeklyIntent.muscleExposure | Future week planner | Week optimizer contract only | Requested muscle-group counts | Could name trunk, but has no direct/secondary/capacity distinction or implemented receiver. | Contract-level only | UNUSED | Weekly Development Ledger |
| WeeklyIntent.volumeIntent | Future week planner | Week optimizer contract only | One global qualitative volume label | Cannot express direct trunk hypertrophy volume or function-specific exposure. | Contract-level only | UNUSED | Weekly Development Ledger and prescription |
| TrainingStimulusSummary movement/muscle/body-region fields | Future week evaluation | WeekEvaluation contract | Potential aggregate exposure and stress summary | No implementation computes it; body-region stress must not be repurposed as muscle volume. | WeekEvaluation/DecisionTrace contract only | UNUSED | Weekly Development Ledger |

### Receiver Truth

- `MovementRole` and `MuscleGroup` participate in hard candidate truth and scoring. Adding a role later is therefore behavioral work and requires explicit catalog and test coverage.
- `BodyRegion` contributes assessment context and trace localization. Canonical pain overlap is driven by explicit stress tags; a matching region alone does not currently create a pain match.
- `ExerciseFamily` currently matters to personal blocks, not ordinary candidate ranking.
- `trunk_control` can affect a relevant assessment comparison and transition evidence. It is not a weekly-credit field and it does not reveal which trunk function is challenged.
- `WeeklyIntent` and `TrainingStimulusSummary` are contracts without an implemented week evaluator. Current weekly credit is therefore **possible to describe but impossible to execute**.

## Goal, Phase, and Longitudinal Coverage

| Surface | Current support | Finding |
| --- | --- | --- |
| Health and movement quality | PARTIAL | The function vocabulary is present, but reviewed lateral-control, rotation, gait-transfer, and progression catalog coverage is missing. |
| Strength | PARTIAL | Loaded bracing is requestable in the domain, but no current exercise carries that role and carries remain absent. |
| Hypertrophy | INSUFFICIENT | Dead Bug and Pallof are tagged as accessories, but there is no direct flexion/shortening option, direct-volume semantics, or broad loading runway. |
| Pain-aware return | PARTIAL | Stress tags and lumbar/ribcage/pelvis context exist; anterior abdominal localization and function-specific dose response do not. |
| General fitness | PARTIAL | The generic goal path can rank legal exercises, but functional balance and weekly trunk development are not evaluated. |
| Conditioning | INSUFFICIENT | No reference exercise has the capacity role, no carry exists, and goal-fit has no trunk/capacity-specific policy. |
| All three phases | PARTIAL | Global phase labels exist for the three direct exercises, but accepted role/section-scoped evidence is not implemented or curated. |
| Session Composer | CONTRACT_ONLY | Slots can ask for the approved roles, but catalog coverage and contextual exposure classification remain incomplete. |
| Weekly Development Ledger | CONTRACT_ONLY | WeeklyIntent and TrainingStimulusSummary types exist without an evaluator or direct/secondary/capacity semantics. |
| Longitudinal adaptation | PARTIAL | Exercise/session history and progression evidence exist, but no trunk-function dose/response history can be accumulated. |

Current V2 still cannot support *excellent, coherent* trunk/core programming across every requested surface. The compact type contract closes the representation gap without pretending the catalog, assessment evidence, ledger, and calibration are already complete.

## Current Catalog: Direct and Meaningful Secondary Exposure

| Exercise | Primary trunk role | Secondary trunk role | Exposure | Movement function | Loading potential | Progression axes | Pain/stress tags | Section role | Phase role | Current weekly credit possibility |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 90/90 Breathing | Breathing / ribcage-pelvis position | Anti-extension position control | DIRECT_DEVELOPMENTAL | breathing_position + anti_extension_core (typed); evidence: Trunk is primary; both roles are explicit; trunk_control is low. | none/low | tempo, range | none | roles=preparation, recovery; sections=warmup:excellent, cooldown:good | phase_1:excellent, phase_2:good, phase_3:possible | Contract can name trunk + current role, but no implemented receiver computes direct credit. |
| Dead Bug | Anti-extension control | Ribcage-pelvis coordination is plausible but not separately typed | DIRECT_DEVELOPMENTAL | anti_extension_core (typed); evidence: core_control family; trunk primary; moderate trunk_control. | limited/low | range, tempo, complexity | long_lever_core | roles=activation, hypertrophy_accessory; sections=activation:excellent, accessory:good | phase_1:excellent, phase_2:good, phase_3:possible | Contract can name trunk + current role, but no implemented receiver computes direct credit. |
| Push-Up | None; horizontal push is primary | Anti-extension plank control | MEANINGFUL_SECONDARY | anti_extension_core (typed secondary role); evidence: Trunk is secondary and trunk_control is moderate. | moderate/moderate | reps, sets, tempo, support_reduction | horizontal_pressing, wrist_extension_loading, long_lever_core | roles=primary_strength, secondary_strength, hypertrophy_accessory; sections=main:good, accessory:good | phase_1:possible, phase_2:good, phase_3:possible | Coarse trunk muscle exposure is representable; secondary/direct distinction and receiver are absent. |
| One-Arm Dumbbell Row | None; horizontal pull is primary | Loaded bracing / anti-rotation candidate (needs review) | MEANINGFUL_SECONDARY | High generic trunk control; specific function not typed; evidence: Trunk is secondary and trunk_control is high in an unsupported unilateral setup. | high/high | load, reps, sets, tempo | loaded_hinge, loaded_spinal_flexion, grip_intensive | roles=primary_strength, secondary_strength; sections=main:good, accessory:good | phase_1:possible, phase_2:good, phase_3:excellent | Coarse trunk muscle exposure is representable; secondary/direct distinction and receiver are absent. |
| Dumbbell Shoulder Press | None; vertical push is primary | Loaded bracing / extension control candidate (needs review) | MEANINGFUL_SECONDARY | Moderate generic trunk control; specific function not typed; evidence: Trunk is secondary, trunk_control is moderate, and loaded_spinal_extension is tagged. | high/high | load, reps, sets | overhead_pressing, loaded_spinal_extension | roles=primary_strength, secondary_strength; sections=main:good, accessory:good | phase_1:possible, phase_2:good, phase_3:excellent | Coarse trunk muscle exposure is representable; secondary/direct distinction and receiver are absent. |
| Goblet Squat | None; squat is primary | Anterior-load bracing | MEANINGFUL_SECONDARY | Moderate generic trunk control; loaded bracing not typed; evidence: Trunk is secondary and trunk_control is moderate. | moderate/moderate | load, reps, range, sets | deep_knee_flexion, loaded_knee_flexion | roles=primary_strength, secondary_strength; sections=main:excellent, accessory:good | phase_1:good, phase_2:excellent, phase_3:possible | Coarse trunk muscle exposure is representable; secondary/direct distinction and receiver are absent. |
| Dumbbell Romanian Deadlift | None; hinge is primary | Loaded bracing and posterior-trunk contribution (needs review) | MEANINGFUL_SECONDARY | High generic trunk control; loaded bracing not typed; evidence: Trunk is secondary and trunk_control is high under loaded hinge demand. | high/high | load, reps, sets, range | loaded_hinge, loaded_spinal_flexion, grip_intensive | roles=primary_strength, secondary_strength; sections=main:excellent, accessory:good | phase_1:possible, phase_2:excellent, phase_3:excellent | Coarse trunk muscle exposure is representable; secondary/direct distinction and receiver are absent. |
| Cable Pull-Through | None; hinge is primary | Loaded bracing | MEANINGFUL_SECONDARY | Moderate generic trunk control; loaded bracing not typed; evidence: Trunk is secondary and trunk_control is moderate. | moderate/moderate | load, reps, range | loaded_hinge | roles=activation, secondary_strength, hypertrophy_accessory; sections=activation:good, accessory:good | phase_1:good, phase_2:good, phase_3:possible | Coarse trunk muscle exposure is representable; secondary/direct distinction and receiver are absent. |
| Split Squat | None; unilateral lower work is primary | Lateral/rotational stance control candidate (needs review) | MEANINGFUL_SECONDARY | Moderate generic trunk control; lateral function not typed; evidence: Trunk is secondary and trunk_control is moderate. | moderate/moderate | load, reps, range, support_reduction | deep_knee_flexion, loaded_knee_flexion | roles=secondary_strength, hypertrophy_accessory; sections=main:possible, accessory:excellent | phase_1:possible, phase_2:good, phase_3:excellent | Coarse trunk muscle exposure is representable; secondary/direct distinction and receiver are absent. |
| Step-Up | None; unilateral lower work is primary | Gait/load-transfer and lateral control candidate (needs review) | MEANINGFUL_SECONDARY | Moderate generic trunk control; gait-transfer function not typed; evidence: Trunk is secondary and trunk_control is moderate. | moderate/moderate | load, range, reps | loaded_knee_flexion | roles=secondary_strength, hypertrophy_accessory; sections=accessory:excellent, activation:possible | phase_1:good, phase_2:good, phase_3:good | Coarse trunk muscle exposure is representable; secondary/direct distinction and receiver are absent. |
| Pallof Press | Anti-rotation control | Standing position / hip contribution | DIRECT_DEVELOPMENTAL | anti_rotation_core (typed); evidence: core_control family; trunk primary; trunk_control is high. | moderate/moderate | load, reps, tempo, stability | long_lever_core | roles=activation, hypertrophy_accessory; sections=activation:excellent, accessory:good | phase_1:excellent, phase_2:good, phase_3:good | Contract can name trunk + current role, but no implemented receiver computes direct credit. |

## Current Catalog: Incidental or No Current Evidence

| Exercise | Primary trunk role | Secondary trunk role | Exposure | Movement function / evidence | Loading potential | Progression axes | Pain/stress tags | Section role | Phase role | Current weekly credit possibility |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Serratus Wall Slide | None | Low positional bracing | INCIDENTAL_BRACING | Generic trunk control only; no trunk movement role; trunk_control is low and trunk is not a listed muscle. | limited/low | range, tempo | overhead_pressing | roles=activation, preparation; sections=warmup:good, activation:excellent | phase_1:excellent, phase_2:good, phase_3:possible | No developmental credit is justified; generic demand is observational and no receiver aggregates it. |
| Dumbbell Bench Press | None | Supported low bracing | INCIDENTAL_BRACING | No trunk function typed; trunk_control is low; trunk is not a listed muscle. | high/high | load, reps, sets, tempo | horizontal_pressing | roles=primary_strength, secondary_strength; sections=main:excellent, accessory:good | phase_1:possible, phase_2:excellent, phase_3:excellent | No developmental credit is justified; generic demand is observational and no receiver aggregates it. |
| Machine Chest Press | None | Machine-supported low bracing | INCIDENTAL_BRACING | No trunk function typed; trunk_control is low; trunk is not a listed muscle. | high/high | load, reps, sets | horizontal_pressing | roles=primary_strength, secondary_strength; sections=main:good, accessory:good | phase_1:good, phase_2:good, phase_3:good | No developmental credit is justified; generic demand is observational and no receiver aggregates it. |
| Cable Chest Fly | None modeled | None modeled | NO_CURRENT_TRUNK_EVIDENCE | No trunk mechanics profile; No trunk muscle, role, region, or mechanics annotation. | moderate/moderate | reps, sets, tempo, range | horizontal_pressing, shoulder_abduction_external_rotation | roles=hypertrophy_accessory; sections=accessory:excellent | phase_1:possible, phase_2:good, phase_3:excellent | None from current metadata. |
| Chest-Supported Dumbbell Row | None | Support intentionally limits trunk demand | INCIDENTAL_BRACING | No trunk function typed; trunk_control is low and chest support is explicit. | high/high | load, reps, sets, tempo | grip_intensive | roles=primary_strength, secondary_strength; sections=main:excellent, accessory:good | phase_1:good, phase_2:excellent, phase_3:excellent | No developmental credit is justified; generic demand is observational and no receiver aggregates it. |
| Machine Row | None | Machine-supported low bracing | INCIDENTAL_BRACING | No trunk function typed; trunk_control is low; trunk is not a listed muscle. | high/high | load, reps, sets | grip_intensive | roles=primary_strength, secondary_strength; sections=main:excellent, accessory:good | phase_1:good, phase_2:excellent, phase_3:good | No developmental credit is justified; generic demand is observational and no receiver aggregates it. |
| Seated Cable Row | None | Stable seated low bracing | INCIDENTAL_BRACING | No trunk function typed; trunk_control is low; trunk is not a listed muscle. | high/high | load, reps, sets | grip_intensive | roles=primary_strength, secondary_strength; sections=main:excellent, accessory:good | phase_1:good, phase_2:excellent, phase_3:good | No developmental credit is justified; generic demand is observational and no receiver aggregates it. |
| Band Row | None | Low stance/posture bracing | INCIDENTAL_BRACING | No trunk function typed; trunk_control is low; trunk is not a listed muscle. | limited/moderate | reps, sets, tempo | none | roles=activation, hypertrophy_accessory, secondary_strength; sections=activation:good, accessory:good | phase_1:excellent, phase_2:good, phase_3:possible | No developmental credit is justified; generic demand is observational and no receiver aggregates it. |
| Lat Pulldown | None modeled | None modeled | NO_CURRENT_TRUNK_EVIDENCE | No trunk mechanics profile; No trunk muscle, role, region, or mechanics annotation. | high/high | load, reps, sets | grip_intensive | roles=primary_strength, secondary_strength; sections=main:excellent, accessory:good | phase_1:good, phase_2:excellent, phase_3:excellent | None from current metadata. |
| Band Lat Pulldown | None modeled | None modeled | NO_CURRENT_TRUNK_EVIDENCE | No trunk mechanics profile; No trunk muscle, role, region, or mechanics annotation. | limited/moderate | reps, sets, tempo | none | roles=activation, hypertrophy_accessory, secondary_strength; sections=activation:good, accessory:good | phase_1:good, phase_2:possible, phase_3:possible | None from current metadata. |
| Leg Press | None | Seat/back-supported low demand | INCIDENTAL_BRACING | No trunk function typed; trunk_control is low; trunk is not a listed muscle. | high/high | load, reps, sets, range | deep_knee_flexion, loaded_knee_flexion | roles=primary_strength, secondary_strength; sections=main:excellent, accessory:good | phase_1:possible, phase_2:excellent, phase_3:excellent | No developmental credit is justified; generic demand is observational and no receiver aggregates it. |
| Bodyweight Box Squat | None; squat preparation is primary | Low unloaded position control | INCIDENTAL_BRACING | Low generic trunk control; specific function not typed; Trunk is secondary but trunk_control and loading potential are low. | limited/low | range, reps, tempo | deep_knee_flexion | roles=preparation, activation, secondary_strength; sections=warmup:good, activation:good, accessory:possible | phase_1:excellent, phase_2:possible, phase_3:possible | No developmental credit is justified; generic demand is observational and no receiver aggregates it. |
| Lying Leg Curl | None modeled | None modeled | NO_CURRENT_TRUNK_EVIDENCE | No trunk mechanics profile; No trunk muscle, role, region, or mechanics annotation. | high/high | load, reps, sets, tempo | none | roles=hypertrophy_accessory; sections=accessory:excellent | phase_1:possible, phase_2:good, phase_3:excellent | None from current metadata. |
| Glute Bridge | None; glute development is primary | Trunk listed, but demand/function are unknown | INCIDENTAL_BRACING | No trunk mechanics profile; Trunk is secondary, but mechanics are absent; developmental credit is not justified. | moderate/moderate | load, reps, sets, tempo | loaded_spinal_extension | roles=activation, hypertrophy_accessory; sections=activation:excellent, accessory:good | phase_1:excellent, phase_2:good, phase_3:possible | No developmental credit is justified; generic demand is observational and no receiver aggregates it. |
| Dumbbell Lateral Raise | None modeled | None modeled | NO_CURRENT_TRUNK_EVIDENCE | No trunk mechanics profile; No trunk muscle, role, region, or mechanics annotation. | moderate/moderate | reps, sets, tempo, load | shoulder_abduction_external_rotation | roles=hypertrophy_accessory; sections=accessory:excellent | phase_1:possible, phase_2:good, phase_3:excellent | None from current metadata. |
| Reverse Pec Deck | None modeled | Unknown | NO_CURRENT_TRUNK_EVIDENCE | trunk_control is explicitly unknown; Unknown is not evidence of contribution. | moderate/moderate | load, reps, sets, tempo | none | roles=hypertrophy_accessory, activation; sections=activation:good, accessory:excellent | phase_1:good, phase_2:good, phase_3:excellent | None from current metadata. |
| Band Face Pull | None modeled | Unknown | NO_CURRENT_TRUNK_EVIDENCE | trunk_control is explicitly unknown; Unknown is not evidence of contribution. | limited/low | reps, sets, tempo | none | roles=activation, hypertrophy_accessory; sections=activation:excellent, accessory:good | phase_1:excellent, phase_2:good, phase_3:possible | None from current metadata. |
| Dumbbell Curl | None modeled | None modeled | NO_CURRENT_TRUNK_EVIDENCE | No trunk mechanics profile; No trunk muscle, role, region, or mechanics annotation. | moderate/moderate | load, reps, sets, tempo | grip_intensive | roles=hypertrophy_accessory; sections=accessory:excellent | phase_1:possible, phase_2:good, phase_3:excellent | None from current metadata. |
| Cable Triceps Pressdown | None modeled | None modeled | NO_CURRENT_TRUNK_EVIDENCE | No trunk mechanics profile; No trunk muscle, role, region, or mechanics annotation. | moderate/moderate | load, reps, sets, tempo | none | roles=hypertrophy_accessory; sections=accessory:excellent | phase_1:possible, phase_2:good, phase_3:excellent | None from current metadata. |

The phase column reports the current global catalog labels for inventory only. Per the accepted phase-context review, those labels are not accepted contextual evidence and cannot leak between activation, accessory, capacity, recovery, or other role/section uses.

## Protected Legacy Knowledge Review

The legacy inspection produced 18 explicit migration decisions: PRESERVE_AS_DOMAIN_KNOWLEDGE=5, PRESERVE_AFTER_REVIEW=5, REDUNDANT=2, QUESTIONABLE=3, DO_NOT_MIGRATE=3. Legacy breadth is evidence that the domain matters; it is not evidence that its old metadata or policies are correct.

| Legacy concept | Classification | Evidence | V2 decision |
| --- | --- | --- | --- |
| Dead Bug as low-complexity anti-extension control | PRESERVE_AS_DOMAIN_KNOWLEDGE | Golden exercises.ts:235-252; already represented in V2. | Keep the function and scalable range/lever concept; re-review all dosage and phase context. |
| Plank, hollow-body hold, and rollout anti-extension runway | PRESERVE_AS_DOMAIN_KNOWLEDGE | Golden exercises.ts:1233-1249, 1366-1382, 4564-4581. | Preserve the need for a progressively overloadable anti-extension runway, not the exact legacy links. |
| Pallof press as anti-rotation development | PRESERVE_AS_DOMAIN_KNOWLEDGE | Golden exercises.ts:643-657 and 4338-4355; already represented in V2. | Keep anti-rotation identity and resistance-path variants under one reviewed function family. |
| Side-plank family as lateral trunk control | PRESERVE_AS_DOMAIN_KNOWLEDGE | Golden exercises.ts:1252-1267 and 2210-2225. | Preserve anti-lateral-flexion/lateral-control knowledge; do not preserve the anti-rotation-only label. |
| Bilateral farmer and unilateral suitcase carry distinction | PRESERVE_AS_DOMAIN_KNOWLEDGE | Golden exercises.ts:2140-2173. | Keep loaded gait, laterality, grip, and trunk-function distinctions as first-class reviewed metadata. |
| Standing brace march and wall-supported carry-march regressions | PRESERVE_AFTER_REVIEW | Golden exercises.ts:255-306 and 4661-4717. | Consolidate duplicates, then review support, gait, laterality, load, and prescription units. |
| Band-offset and dumbbell suitcase march/hold variants | PRESERVE_AFTER_REVIEW | Golden exercises.ts:291-306, 2176-2207, 4545-4562. | Preserve the regression/equipment ideas only after distinguishing stationary holds, marches, and true carries. |
| Woodchop / controlled-rotation work | PRESERVE_AFTER_REVIEW | Golden exercises.ts:1709-1723 and 4358-4375. | Keep controlled rotation as distinct from anti-rotation; review hip, knee, lumbar, and shoulder demands. |
| Machine abdominal crunch for direct shortening/flexion | PRESERVE_AFTER_REVIEW | Golden exercises.ts:4378-4395. | Preserve the hypertrophy use case; correct its function, machine-fit, range, and pain metadata before migration. |
| Hanging knee/leg raise and suspension core families | PRESERVE_AFTER_REVIEW | Golden exercises.ts:3191-3378. | Retain as catalog candidates only after reviewing shoulder/grip prerequisites, hip-flexor contribution, function, and dosage. |
| Band and cable Pallof as separate domain functions | REDUNDANT | Golden exercises.ts:643-657 and 4338-4355. | Treat as resistance-path/equipment variants of anti-rotation, not distinct movement functions. |
| Multiple near-duplicate unloaded brace/march entries | REDUNDANT | Golden exercises.ts:255-306 and 4661-4717. | Consolidate to reviewed setup variants instead of multiplying catalog rows. |
| Dead Bug -> Plank -> Hollow -> Rollout exact progression chain | QUESTIONABLE | Golden progressionOf/regressionOf fields at exercises.ts:235-240, 1233-1239, 1366-1372, 4564-4571. | The direction is plausible, but transitions require capability, support, shoulder, range, and dosage evidence rather than a universal ladder. |
| Pallof -> woodchop as a strict progression | QUESTIONABLE | Golden exercises.ts:643-648 and 4358-4365. | This changes anti-rotation to controlled rotation and is a feature shift, not an automatic progression. |
| Generic core/obliques strings as sufficient anatomy and function | QUESTIONABLE | Golden Exercise.muscleGroups and movementPattern are open string arrays. | Retain useful anatomical context during review, but do not split V2 MuscleGroup or infer function from prose. |
| Name/tag/prose sniffing to infer core family and carry type | DO_NOT_MIGRATE | Golden exercises.ts:4950-5123 and threeDayCoachPolicy.ts:473-511. | Replace with explicit typed roles and reviewed mechanics provenance. |
| One-hit generic core quotas for every user | DO_NOT_MIGRATE | Golden quotaRegistry.ts gives fixed core/coreStability minima before goal-specific trunk semantics. | Use adaptive targets and separate direct, secondary, and capacity channels; no universal flexion or carry quota. |
| Pain contraindication prose as automatic engine authority | DO_NOT_MIGRATE | Golden exercise entries mix free-text painContraindications and contraindications. | Preserve concerns only after normalized region/stress review; prose cannot hard-gate V2. |

### Legacy Conclusions

Preserve the functional families: breathing/position, anti-extension, anti-rotation, lateral control, controlled rotation, direct shortening, loaded bracing, and loaded gait/carries. Defer specific exercise rows whose shoulder, grip, lumbar, hip-flexor, machine-fit, laterality, or prescription semantics are not reviewed. Reject legacy name sniffing, free-text authority, generic quota hits, and automatic progression across a function shift.

## Muscle-System Decision

**Keep `trunk` as the umbrella `MuscleGroup`. Do not add `abdominals`, `obliques`, or `spinal_extensors` to `MuscleGroup` in the first contract.**

The current inputs do not justify anatomical set precision, and a split would let one exercise satisfy several muscle buckets without a settled credit rule. Function belongs in `MovementRole` and `TrunkMechanicsProfile`; direct/secondary/capacity accounting belongs in the ledger. Anatomical emphasis can be reconsidered later as optional reviewed metadata if hypertrophy programming, assessment evidence, and set-credit ownership establish a real receiver.

Double-count rule: one completed prescription is one source exposure. It may carry several function descriptors, but a ledger must not clone it into multiple full muscle-set credits. `trunk` volume remains one umbrella lane unless a future owner approves validated subdivision semantics.

## Body-Region Decision

**`abdominal_wall`: USEFUL_LATER, not needed now.**

It could truthfully localize user-reported anterior abdominal-wall discomfort that is neither ribcage, lumbar spine, nor pelvis. It must be added only with a concrete intake/adaptor use case, a plain non-diagnostic definition, reviewed exercise stress mappings, and explicit receiver behavior. It must not imply a diagnosis, hard-gate all trunk work, replace existing regions, create a hidden score, or solve muscle-volume tracking. Until then, unknown localization must remain unknown rather than being forced into `general` or a neighboring region.

## Movement / Function Decision

The production domain keeps `breathing_position`, `anti_extension_core`, `anti_rotation_core`, and `carry` and now includes these additional selection-purpose roles:

- `anti_lateral_flexion_core`
- `trunk_flexion` (or owner-approved `controlled_trunk_flexion` naming)
- `trunk_rotation` (controlled rotation, not uncontrolled lumbar twisting)
- `loaded_bracing`

`carry` remains the loaded transport/gait purpose. It is not sufficient for all lateral-control work: a side plank has lateral-control purpose without gait, while a bilateral farmer carry has loaded gait and grip demands without the same unilateral anti-lateral challenge as a suitcase carry. Use role combinations and mechanics rather than redefining every lateral drill as a carry.

Do not add a role merely because a function contributes secondarily. A goblet squat can carry reviewed `loadedBracingContribution` without becoming a `loaded_bracing` candidate unless bracing is actually the requested training purpose.

## Compact Trunk Mechanics Contract

The production domain now includes one optional `TrunkMechanicsProfile` with these compact function annotations:

1. `breathingPressureCoordination`
2. `antiExtensionContribution`
3. `antiRotationContribution`
4. `antiLateralFlexionContribution`
5. `controlledFlexionContribution`
6. `controlledRotationContribution`
7. `loadedBracingContribution`
8. `gaitLoadTransferContribution`

Each annotation should carry `level = unknown | none | low | moderate | high`, `reviewStatus`, `sourceRef/provenance`, and a concise evidence note. Reviewed `none` means the exercise does not meaningfully express that function; `unknown` means evidence is unavailable and must omit the function from behavioral comparison. Unknown must not become numeric poor, reviewed absence, or zero capability. Profile-level review cannot conceal an unknown field. Posterior-trunk contribution should initially remain evidence attached to loaded bracing/hinge context, not a ninth function or a new muscle bucket; reconsider only after catalog review shows a separate receiver.

This profile is smaller than a taxonomy of muscles, tissues, planes, directions, and diagnoses. It answers one engine question: **which trunk function does this exercise meaningfully express, at what reviewed level, in addition to its selection role?**

## Compact Contract Options

| Option | Architecture | Clarity | Double-count risk | Candidate Intelligence | Assessment | Weekly volume | Prescription | Catalog burden | Extensibility | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | Keep trunk; expand MovementRole only | Good for explicit selection intent, weak for secondary mechanics | Low | Can rank direct roles, cannot compare how compounds express them | Role signals improve; feature evidence remains coarse | Direct functions possible; secondary/capacity classification remains weak | Roles do not encode demand, laterality, or gait/load transfer | Low | Moderate; pressure to overload MovementRole later | Insufficient |
| B | Keep trunk; expand MovementRole; add compact reviewed TrunkMechanicsProfile | High: intent and exercise expression remain separate | Low when ledger lanes preserve one source exposure | Supports direct role truth plus candidate-specific demand/function evidence | Supports normalized feature matching without inventing diagnosis | Supports direct, secondary, incidental, and capacity channels | Can pair function with loading, support, laterality, and dose | Moderate human review burden | High without splitting muscle volume prematurely | RECOMMENDED |
| C | Split trunk into several MuscleGroups | Anatomically tempting but does not by itself describe function | High across compounds and direct work | More target labels, little mechanics truth | Would imply anatomical precision current inputs do not provide | High risk of counting one set in several muscle buckets | Still needs roles and mechanics | High | Poor until evidence and credit semantics are settled | DEFER / DO NOT SELECT NOW |

**Recommendation: Option B.** It separates intent (`MovementRole`), exercise expression (`TrunkMechanicsProfile`), anatomy (`MuscleGroup.trunk`), location (`BodyRegion`), dose (`ExercisePrescription`), and adaptation accounting (Weekly Development Ledger). That separation is the smallest architecture that supports the required use cases without premature anatomical precision.

## Direct vs Indirect Weekly Exposure

| Class | Qualification | Ledger credit | Effect on targets |
| --- | --- | --- | --- |
| DIRECT DEVELOPMENTAL SET/UNIT | The exercise is intentionally selected for a reviewed trunk function in the requested role/section. | Record completed sets/reps or an explicit non-set dose against direct trunk development and the function. | May satisfy an activated direct-function target; it is not automatically a hypertrophy set unless the prescription is a developmental set. |
| MEANINGFUL SECONDARY EXPOSURE | Reviewed mechanics show material trunk demand, but another movement/muscle is the primary training purpose. | Record in a separate secondary lane with the source exercise and dose; do not convert 1:1 to direct sets. | May support a broad exposure objective when policy allows, but cannot silently close a direct hypertrophy/function target. |
| INCIDENTAL BRACING | The trunk participates at low or unreviewed demand and is not a meaningful selection purpose. | Zero developmental credit; retain only stress/fatigue observability when relevant. | Cannot satisfy a direct or function-specific target. |
| CAPACITY EXPOSURE | Carry, loaded gait, sustained brace, march, hold, or conditioning work is selected for capacity/trunk/gait purpose. | Track time, distance, trips, load, and side as applicable; preserve function and fatigue separately from set volume. | May satisfy an activated capacity/carry target, but is not converted to hypertrophy sets by default. |

A heavy squat, hinge, row, or press can impose substantial trunk demand while its progressive overload, local fatigue, and technique are organized around another training purpose. Treating every compound set as a direct abdominal set would overstate local developmental volume, erase function, and let a week with no intentionally selected trunk work appear complete. Compounds can still reduce the need for additional direct work when a goal-aware weekly policy explicitly accepts meaningful secondary exposure.

The reverse claim is also false: every user does not need isolated abdominal flexion every week. Direct flexion should be activated by hypertrophy intent, a reviewed assessment/development need, exercise history, available time, and pain/tolerance context. Movement-quality, general-fitness, pain-aware, or low-time weeks may be coherent with breathing, anti-extension, anti-rotation, lateral control, carries, and secondary bracing instead. No function is a universal quota.

## Functional Coverage Matrix

| Function | Current V2 type support | Current V2 exercise support | Legacy support | Assessment support | Weekly ledger support | Gap | Recommended owner |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Breathing / ribcage-pelvis position | breathing_position role plus optional breathingPressureCoordination evidence | 90/90 Breathing only | 90/90 Breathing and brace-oriented preparation | Generic role/muscle/region signal; no normalized feature | movementExposure can name the role; no receiver | One low-load option; no pressure-coordination profile or progression family | Catalog + trunk mechanics + assessment |
| Anti-extension | anti_extension_core role plus optional antiExtensionContribution evidence | 90/90 Breathing, Dead Bug, Push-Up | Dead Bug, Plank, Hollow, Rollout, hanging/suspension variants | Role-specific input collapses to trunk_control | Role target is representable; direct/secondary credit is not | No reviewed direct loading runway beyond Dead Bug; Push-Up is secondary | Catalog + mechanics + ledger |
| Anti-rotation | anti_rotation_core role plus optional antiRotationContribution evidence | Pallof Press only | Band/cable Pallof, anti-rotation holds, offset marches | Role-specific input collapses to trunk_control | Role target is representable; no receiver | Single exercise and no reviewed regression/loading family | Catalog + mechanics + ledger |
| Anti-lateral flexion | anti_lateral_flexion_core role plus optional antiLateralFlexionContribution evidence | No direct exercise; unilateral work has only generic trunk demand | Side Plank, Side Plank Star, Suitcase Carry/Hold/March | Only generic trunk muscle/region signals | Movement role is typed; no ledger receiver | No reviewed reference candidate, assessment feature, or exposure-credit receiver | Catalog + assessment + ledger |
| Controlled flexion / abdominal shortening | trunk_flexion role plus optional controlledFlexionContribution evidence | None | Machine Ab Crunch; hanging raises require function review | Only generic trunk muscle/region signals | Movement role is typed; no direct-volume lane | No reviewed direct progressively overloadable shortening exercise | Catalog + prescription + ledger |
| Controlled rotation | trunk_rotation role plus optional controlledRotationContribution evidence | None; Pallof is anti-rotation | Band/Cable Woodchop with metadata caveats | Only generic trunk muscle/region signals | Movement role is typed; no ledger receiver | No reviewed rotation candidate or normalized assessment feature | Catalog + assessment |
| Loaded bracing | loaded_bracing role plus optional loadedBracingContribution evidence | Several compounds have moderate/high demand but no loaded_bracing role | Compounds, brace marches, carries | Generic trunk_control demand/capability comparison | At most coarse trunk muscle exposure; no secondary lane | No reviewed direct-role candidate, curated function profile, or secondary ledger lane | Catalog + ledger; role only when bracing is the selection purpose |
| Loaded gait / carries | carry role, capacity TrainingRole, and optional gaitLoadTransferContribution evidence | Zero carry exercises and zero capacity-role exercises | Farmer, suitcase, band/dumbbell march and supported regressions | carry is not classified as a direct trunk role today | movementExposure can name carry; no receiver or prescription units | No catalog, laterality, gait, grip, shoulder, fatigue, or dose contract | Catalog + prescription + Composer + ledger |
| Posterior-trunk contribution | trunk muscle, hinge role, trunk_control and spinal stress tags | RDL and pull-through provide secondary evidence; no direct posterior-trunk exercise | Hinges/back-extension concepts, often coarsely tagged | Generic trunk/lumbar signal only | No direct/secondary distinction | Anatomical contribution and loaded-bracing function are conflated | Mechanics + catalog review + ledger |

## Health and Hypertrophy Are Separate

Health/movement-quality core work should be selected for breathing/pressure coordination, position, anti-extension, anti-rotation, lateral control, gait/load transfer, tolerance, and progressive confidence. The appropriate dose may be breaths, controlled reps, holds, steps, time, or distance. A low-load drill can be highly useful without being a hypertrophy set.

Hypertrophy-focused trunk work requires direct intent, a sufficiently loadable exercise, appropriate range where tolerated, recoverable direct volume, and a progression runway. Stability drills alone do not prove maximal abdominal hypertrophy stimulus. Direct flexion/shortening is a valid future tool, not a universal mandate; pain, goals, preference, training age, and existing compound demand still govern whether it belongs.

## Assessment Semantics

Current generic `movementRole`, `muscleGroup`, and `region` inputs are sufficient only for coarse trunk influence. `signalIsTrunk` maps lumbar_spine, ribcage, pelvis, trunk, breathing_position, anti_extension_core, and anti_rotation_core into the single `trunk_control` dimension. Candidate-specific demand prevents unrelated influence, but the engine cannot distinguish ribcage-pelvis control from lateral, rotational, or loaded-bracing evidence.

**Timing decision: BEFORE_SESSION_COMPOSER.** After the function/mechanics vocabulary is approved, add normalized features such as `ribcage_pelvis_control`, `anti_extension_control`, `anti_rotation_control`, `controlled_rotation_control`, `lateral_trunk_control`, and `loaded_bracing_control` in the same pre-Composer catalog tranche. A broad `rotational_control` input must remain broad/unknown unless its source distinguishes resisting rotation from producing controlled rotation. Only explicit or reviewed normalization from movement screens, coach review, training history, or sufficiently specific self-report may populate these features. Do not infer them from descriptions, photos without a validated signal, or diagnosis-like assumptions.

Feature evidence should remain bounded exactly as the existing assessment doctrine requires: feature-specific evidence can influence only a truthful candidate with reviewed matching mechanics; missing feature evidence remains unknown; assessment cannot legalize a wrong role; severity, confidence, capability, challenge, and developmental relationship stay separate.

## Pain and Localization

The future region decision and the trunk mechanics decision are independent. `abdominal_wall` would describe *where* discomfort is reported; mechanics describe *what an exercise demands*. A region must never be used as a proxy for abdominal set volume or a diagnosis. Any future receiver should preserve the canonical rule that pain matching requires reviewed stress overlap or explicit exercise authority, not region coincidence alone, and moderate discomfort should continue to produce the accepted review/readiness semantics rather than an automatic blanket gate.

## Carry Integration

Carries remain first-class capacity/trunk/gait tools, not mandatory finishers. A future carry contract must represent:

- bilateral farmer carry: bilateral load, high grip/load transport, loaded gait and bracing;
- unilateral suitcase carry: unilateral load, anti-lateral/anti-rotation demand, grip and loaded gait;
- front-rack carry: anterior/rack position, trunk and upper-quarter demand;
- overhead carry: overhead shoulder/scapular demand plus trunk and gait, with stronger prerequisites;
- march/hold regressions: stationary or supported gait-transfer/brace options that are not mislabeled as distance carries.

Required metadata: grip demand, trunk function profile, laterality, loaded-gait status, shoulder demand, equipment/anchor/support, local/systemic fatigue, stress tags, and prescription units (`time`, `distance`, `trips`, `load`, `side`). A carry can serve capacity, conditioning, accessory, activation, or preparation only when its role/section metadata and phase evidence support that use. The catalog should start with a minimal bilateral/unilateral/regression set after the contract is approved; this review adds no exercise.

## Weekly Development Ledger Handoff

The future trunk ledger should be event-based: each completed prescription is one source event with role, section, phase, function, exposure class, dose, response, and provenance. Aggregate views may show:

- direct trunk developmental volume;
- anti-extension, anti-rotation, lateral-control, flexion/shortening, rotation, and loaded-bracing exposure;
- carry/loaded-gait capacity by time, distance, trips, load, and side;
- meaningful secondary bracing as a separate lane;
- assessment-priority exposure;
- stress, pain/tolerance response, fatigue, recovery, and progression history.

Targets are activated and sized by goal, experience, phase, assessment, pain/readiness, exercise history, available days/time, total weekly fatigue, and recent response. They should be ranges or priorities with explicit reasons, not fixed quotas copied from legacy. A user may have no direct flexion target, no carry target, or no additional direct trunk target in a given week. The ledger may explain that compounds supplied meaningful secondary exposure; it may not relabel those compounds as direct abdominal sets.

Longitudinal adaptation requires preserving dose and response by function: productive progression, plateau, symptom response, recovery cost, and exposure recency. Exercise-ID continuity alone cannot tell whether a trunk function is developing across exercise substitutions.

## Phase-Context Interaction

Every future core/carry exercise must use the accepted role/section-scoped phase annotation contract. Exact role+section evidence takes precedence over section-only, role-only, and general evidence; equal-specificity conflict remains explicit; no matching evidence remains unknown and contributes no phase term.

Examples:

- Dead Bug as Phase 1 activation is not the same evidence claim as Dead Bug as Phase 3 hypertrophy accessory.
- Pallof Press as activation cannot inherit an accessory-volume rationale.
- A suitcase march as supported preparation cannot inherit the phase evidence of a loaded capacity carry.
- A machine abdominal crunch accessory rationale cannot leak into activation or pain-aware recovery.
- A carry used for conditioning needs capacity/conditioning evidence, not a generic finisher assumption.

No phase coefficient or final suitability value is selected here. Catalog curation must supply provenance for each actual use context before phase behavior changes.

## Recommended Implementation Order

1. COMPLETED: Owner approved Option B, the four exposure classes, function vocabulary, unknown semantics, and the decision to defer abdominal_wall.
2. COMPLETED: Added typed MovementRole values for anti_lateral_flexion_core, trunk_flexion, trunk_rotation, and loaded_bracing; carry remains separate as loaded gait/transport.
3. COMPLETED: Added a compact, review/provenance-bearing TrunkMechanicsProfile, pure validation, and an observability-only trace without scoring or hidden behavior.
4. Human-review the existing 30 exercises, then expand the reference catalog with a minimal progression runway for each approved function and carry regression family.
5. Add normalized trunk assessment features and bounded feature-specific relevance before Session Composer consumes assessment priorities.
6. Add prescription units for sets/reps/time/distance/trips/load/side and implement separate direct, secondary, incidental, and capacity ledger lanes.
7. Apply accepted role/section-scoped phase annotations to each new use context; calibrate Candidate Intelligence only after metadata review.
8. Re-run cross-goal, pain, phase, history, weekly-coverage, and longitudinal counterfactuals; start Session Composer only after owner acceptance.

## Explicit Uncertainties

- Whether controlled rotation needs one role or later direction/range qualifiers; the first contract should avoid side/direction proliferation.
- Whether abdominal_wall can be truthfully captured by intake without implying internal-organ or diagnostic semantics.
- Which compounds merit reviewed meaningful-secondary credit and what evidence threshold is sufficient; current inferences are not accepted metadata.
- How non-set direct work should normalize dosage without pretending seconds, distance, and hypertrophy sets are interchangeable.
- Whether posterior-trunk direct development needs a future function or can remain hinge plus loaded-bracing metadata.
- Which trunk assessment features can be normalized from movement screens, coach review, or explicit self-report without inventing image findings.
- Final phase suitability, ledger targets, and Candidate Intelligence coefficients; none are selected in this review.

## Final Classification

**TRUNK_CORE_CONTRACT_READY_FOR_OWNER_DECISION**

Implementation status: **TYPES_VALIDATION_OBSERVABILITY_IMPLEMENTED**.

The owner accepted Option B and the production type, validation, and trace contracts are implemented. Catalog breadth, assessment feature evidence, body-region intake, weekly targets, prescription normalization, phase annotations, and scoring calibration remain separate reviewed follow-ons.
