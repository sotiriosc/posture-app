# Final Candidate Intelligence Readiness Review

`ENGINE_V2_BLUEPRINT.md` is authoritative. This historical Candidate Intelligence review is audit/evidence/classification only; the subsequent Session Composer production milestone did not tune weights, change exercise metadata, create Week Composer, or implement production Prescription progression.

## Scope

Current review inputs: 45 reference exercises, 22 existing controlled scenarios, 12 golden personas, and 82 deterministic CandidateRequest executions across final audit matrices.

Current Candidate Intelligence pipeline remains:

CandidateRequest -> interpreted context -> hard eligibility -> legal candidate pool -> modular candidate scoring -> deterministic ranking -> DecisionTrace / pipeline observability.

## Final Decision

Classification: **CANDIDATE_INTELLIGENCE_READY_FOR_SESSION_COMPOSER_DESIGN**

Architecture is sound and the candidate pipeline is deterministic/explainable. The canonical 45-row catalog now includes the eight approved P0 whole-body identities, and the fixed-shell matrix shows truthful direct-action, primary-muscle, preparation, equipment, pain, response, and continuity behavior. The stable-adaptive doctrine remains binding. No Session/Week Composer behavior is implemented; Composer design is the next separately authorized dependency.

## Trunk / Core Domain Contract Implementation

Status: **FIRST_TRUNK_PROFILE_TRANCHE_IMPLEMENTED**.

The owner accepted Option B. `MuscleGroup.trunk` remains the umbrella; `anti_lateral_flexion_core`, `trunk_flexion`, `trunk_rotation`, and `loaded_bracing` are explicit selection-purpose roles; and `carry` remains distinct. Optional `TrunkMechanicsProfile` metadata exposes eight field-reviewed function annotations with structured provenance and preserves reviewed `none` separately from unavailable `unknown`.

Validation and `buildTrunkMechanicsTrace` remain the only consumers. Strong mechanics cannot manufacture role eligibility, an absent profile emits explicit unavailable/unknown trace evidence, and notes/provenance are non-behavioral. Existing movement roles remain unchanged.

The accepted post-P0 22-scenario ranking fingerprint is `d218c647c71af0fc6ae86ad9032065d37aa3006239c6dfce959483f9ebecf7f7`. The broader fixed contract fingerprint covering totals, component raw values, rejection codes, pain readiness, phase behavior, and assessment traces is `1e9abd5713469223636ead6edfdd3a7a5725027529e58a33b476ac9a0753bd1e`.

The first complete metadata tranche is limited to 90/90 Breathing, Dead Bug, and Pallof Press. It contains ten accepted fields and fourteen explicit unknowns, all accepted provenance points to `TRUNK_MECHANICS_OWNER_DECISIONS.md#approved-first-tranche`, and no scoring, phase, assessment, prescription, exposure-ledger, or composition behavior consumes it.

### Representative Curation Decision

The owner accepted all 15 `PROPOSE_ACCEPTED` field judgments from the representative 14-exercise by 8-function proposal. Ten are implemented in the direct trio; five accepted Push-Up and supported-row judgments remain approved but deferred. The proposal classification remains **TRUNK_PROFILE_TRANCHE_READY_FOR_OWNER_APPROVAL** as the record of the accepted review.

All 17 `PROPOSE_NEEDS_REVIEW` fields remain unresolved. Dead Bug breathing/pressure coordination and Pallof Press anti-lateral-flexion and loaded-bracing values stay unknown; no secondary/support exercise has a partial profile. The post-P0 full catalog fingerprint is `bfb21d7dc91504de5da8f4cd92850c8bb97ca5a0ce5f65624d2db4971d5e1a91`; removing only `mechanics.trunkMechanics` yields `9f50087c224ba18d2dda29ccb50e4e3ee2e69fa416f438a186070b7cd174c779`.

### Minimal Direct Trunk / Carry Catalog Proposal

A deterministic proposal evaluated 24 new candidate concepts and selected Forearm Plank, Forearm Side Plank, Machine Abdominal Crunch, Half-Kneeling High-to-Low Cable Chop, Bilateral Farmer Carry, Suitcase Carry, and Wall-Supported Suitcase March as the smallest coherent first tranche.

Historical milestone status: **SEVEN_EXERCISE_PRODUCTION_COMPLETE**. Those seven trunk/carry rows remain production knowledge with approved phase/stress, equipment, support/stance, prescription/progression, response, and safety contracts. Wall-supported suitcase march remains constrained to `loaded_bracing`; it does not satisfy `carry` or hard `anti_lateral_flexion_core`.

At the time of this review, the exact next dependency was owner authorization for Session Composer design. That authorization and the later production-kernel authorization have now been exercised. Golden-product TrainingSafety wiring remains separately classified as PRODUCT_ADAPTER_PENDING, and P1 catalog concepts remain unimplemented future improvements.

The 17 representative secondary-mechanics proposals remain independently unresolved. They do not block review of the new candidate concepts, and the catalog proposal does not authorize their profile implementation.

## Contract Review

| Area | Verdict | Evidence |
| --- | --- | --- |
| Hard eligibility | GOOD | equipment, setup, personal block, contraindication, capability prerequisites, role, section, movement-role, and target-muscle truth are hard rejection reasons before scoring |
| Soft selection | GOOD | goal, phase, assessment, alignment, pain suitability, experience, skill/stability, progression, continuity, loadability, stimulus, fatigue, joint cost, and equipment practicality appear only in score components |
| Score-as-gate | GOOD | audit did not find giant negative score gates; true exclusions are structured hard rejections |
| Pipeline observability | GOOD | ranked candidates carry component values/reason codes/sources/weights; pipeline snapshots localize eligibility and scoring |
| Pure architecture | GOOD | existing source scan/test covers no Date.now, no no-arg new Date, no performance.now; package boundary docs and source contain no React/Next/UI/storage/network/DB/auth/billing dependency path |

## Invariant Results

- PASS: identical CandidateRequest produced byte-equivalent rank/component/trace semantics.
- PASS: unavailable bench equipment cannot win.
- PASS: personal block cannot win.
- PASS: hard contraindication cannot win.
- PASS: wrong role/section/movement/target truth is handled in hard eligibility before scoring.
- PASS: transition edge alone has no scoring effect; covered by progressionTransitionSemantics invariant.
- PASS: unknown mechanics remain neutral/not_applicable and do not create positive evidence by themselves.

## Score Math And Double-Count Audit

| Fact Pair | Classification | Finding |
| --- | --- | --- |
| assessment_fit + alignment_fit | INTENTIONAL_DISTINCT_SIGNAL | Both read one relevance trace, but bounded influence is split across assessment/alignment contributions rather than added twice. |
| pain_suitability + joint_cost | RESOLVED_CANONICAL_RECEIVER_UNITS | Both receivers consume one canonical signalId+stressTag fact. Pain suitability counts every structured source once per fact; joint cost counts the same fact once only when joint_stress or caution provenance qualifies it. Sixteen representative joint+caution rows now remain one joint unit. |
| phase_fit + experience_fit + skill_fit | CONTEXT_AND_OVERLAP_CONTRACT_READY_FOR_OWNER_DECISION | The current Phase 1 bonus rereads skill/stability and Phase 3 rereads loadability. Current global annotation reasons also mix phase, goal, section, mechanics, progression and continuity ownership. PHASE_SUITABILITY_CALIBRATION_REVIEW.md and PHASE_ANNOTATION_CONTEXT_REVIEW.md contain the full evidence. |
| support/stability/path | RESOLVED_PAIN_OWNERSHIP | Structured row path knowledge is observability-only, pain_suitability has no ID/prose/support bonus, and stability_fit no longer reads global pain state. |
| progression_value + continuity_value | INTENTIONAL_DISTINCT_SIGNAL | progression_value is same-exercise runway/readiness; continuity_value combines retention and reconsideration evidence numerically while reconsideration owns reason-code precedence. Transition edges do not add replacement pressure. |
| unknown metadata | NOT_APPLICABLE | Unknown demand/path/challenge values remain neutral/not_applicable in assessment traces and do not create positive evidence by themselves. |

## UNKNOWN / NEEDS_REVIEW Policy

Catalog coverage: fully usable=17; usable with review caveats=20; materially under-specified=8.

UNKNOWN does not become easy/safe/preferred/poor/developmentally superior/feature matched. NEEDS_REVIEW remains visibly qualified in assessment and proposed contextual phase evidence. Pain matching exposes unknown/missing evidence and deferred actions explicitly; numeric moderate-severity calibration is deferred to longitudinal adaptation rather than represented as current precision.

## Feature-Specific Assessment Review

Verdict: **RESOLVED_FOR_CANDIDATE_INTELLIGENCE**

Feature relevance/expression is explicit and now has a separate conservative target-fit channel. A legal candidate can receive bounded assessment_fit influence when reviewed metadata shows that it trains the assessed feature, even while feature challenge difficulty remains unknown.

Target fit answers what quality the candidate trains. Developmental challenge remains a separate NOT_MODELED question, so current feature-specific traces retain neutral developmental relationships, zero developmental challenge influence, and zero alignment contribution. NEEDS_REVIEW annotations remain downgraded through the existing feature matcher.

| Assessment | Winner OFF | Winner ON | Changed | Inspected | Assessment Fit | Alignment Fit | Relevance | Feature Expression | Overall Demand | Feature Challenge | Capability Provenance | Relationship | Target Fit | Developmental Influence | Bounded | Why |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Generic Scapular Control | band-face-pull | serratus-wall-slide | ranking | 2 / band-face-pull / 7.842 | 5.694 | 5.796 | high | generic | 3 | not_applicable | phase_default/weak | exceeds_current_capability | 0.000 | -0.510 | -0.510 | assessment changes the ordered legal pool |
| Serratus / Protraction | band-face-pull | band-face-pull | score only | 2 / serratus-wall-slide / 7.862 | 6.390 | 6.000 | moderate | high/moderate | 2 (moderate) | unknown/not_modeled | phase_default/weak | neutral | 0.390 | 0.000 | 0.390 | reviewed feature target fit affects assessment_fit; feature challenge remains not modeled |
| Upward Rotation | band-face-pull | band-face-pull | score only | 2 / serratus-wall-slide / 7.862 | 6.390 | 6.000 | moderate | high/moderate | 2 (moderate) | unknown/not_modeled | phase_default/weak | neutral | 0.390 | 0.000 | 0.390 | reviewed feature target fit affects assessment_fit; feature challenge remains not modeled |
| Retraction | band-face-pull | band-face-pull | score only | 1 / band-face-pull / 7.895 | 6.390 | 6.000 | moderate | high/moderate | 3 (high) | unknown/not_modeled | phase_default/weak | neutral | 0.390 | 0.000 | 0.390 | reviewed feature target fit affects assessment_fit; feature challenge remains not modeled |
| External Rotation / Cuff | band-face-pull | band-face-pull | score only | 1 / band-face-pull / 7.884 | 6.210 | 6.000 | low | moderate/weak | 3 (high) | unknown/not_modeled | phase_default/weak | neutral | 0.210 | 0.000 | 0.210 | reviewed feature target fit affects assessment_fit; feature challenge remains not modeled |
| Loaded Scapular Stability | band-face-pull | band-face-pull | score only | 1 / band-face-pull / 7.884 | 6.210 | 6.000 | low | moderate/weak | 3 (high) | unknown/not_modeled | phase_default/weak | neutral | 0.210 | 0.000 | 0.210 | reviewed feature target fit affects assessment_fit; feature challenge remains not modeled |

### FEATURE_SPECIFIC_TARGET_FIT_RESOLUTION

Classification: **RESOLVED_FOR_CANDIDATE_INTELLIGENCE**.

Before: a reviewed feature match could be relevant in observability while contributing zero to candidate selection whenever feature challenge demand was unknown.

After: feature relevance can contribute a nonnegative target-fit influence to assessment_fit even when challenge fit remains unknown. The target channel is capped at 0.600 and scales once by feature relevance, assessment confidence, and priority. It does not use severity, generic task demand, capability, phase prior, history capability, or feature challenge demand.

Feature challenge remains intentionally **NOT_MODELED**. Current feature-specific cases therefore retain `featureChallengeDemand=null`, `featureChallengeDemandSource=not_modeled`, `featureDemandCapabilityMatch=not_applicable`, `developmentalChallengeInfluence=0`, and `alignmentContribution=0`. Combined target and future developmental channels remain clamped to the existing 1.200 per-signal assessment envelope.

## Real Posture Regression

Verdict: **GOOD**. V2 consumes normalized assessment signals only; there is no image handling in the engine. OFF/ON review did not show lower-body findings legalizing upper-body candidates or assessment bypassing role truth. Trunk signals remain candidate/request specific, and the feature-target channel is absent when no feature-specific evidence exists.

| Need | Winner OFF | Winner ON | Changed | Legal Pool | Assessment Effect | Verdict |
| --- | --- | --- | --- | --- | --- | --- |
| photo-exp-horizontal-push | dumbbell-bench-press | dumbbell-bench-press | no | 3 | irrelevant or neutral signals remained neutral | GOOD |
| photo-exp-horizontal-pull | machine-row | machine-row | no | 4 | irrelevant or neutral signals remained neutral | GOOD |
| photo-exp-trunk-activation | pallof-press | pallof-press | no | 2 | photo-pose-trunk-bias:high/exceeds_current_capability/-0.306 | GOOD |
| photo-exp-squat-main | goblet-squat | goblet-squat | no | 1 | photo-pose-trunk-bias:low/develops_priority/0.113; photo-pose-hip-shift:high/develops_priority/0.324; photo-pose-knee-alignment:high/develops_priority/0.211 | GOOD |
| photo-exp-single-leg-accessory | step-up | step-up | no | 2 | photo-pose-hip-shift:high/develops_priority/0.324; photo-pose-knee-alignment:high/develops_priority/0.211 | GOOD |

## Phase Review

Verdict: **PHASE_CONTEXT_OWNER_POLICY_SELECTED_CURATION_PENDING**. The owner selected `CONTEXTUAL_ANNOTATION_ONLY_LOW_CHURN` with 8.8/7.8/6.2/5.5 and weight 1.0. The deterministic non-default scorer omits unknown/no-match/conflict and duplicate mechanical bonuses. Legacy production behavior remains active until accepted contextual annotations receive final approval and explicit activation.

| Need | Phase 1 | Phase 2 | Phase 3 | Verdict |
| --- | --- | --- | --- | --- |
| horizontal push | push-up (7.781) over dumbbell-bench-press (7.769) | dumbbell-bench-press (7.906) over push-up (7.853) | dumbbell-bench-press (7.951) over machine-chest-press (7.894) | PROVISIONAL: first laboratory accepted; contextual annotation evidence remains unapproved |
| horizontal pull | chest-supported-dumbbell-row (7.854) over machine-row (7.826) | machine-row (7.936) over seated-cable-row (7.936) | machine-row (7.980) over seated-cable-row (7.980) | CONTEXT_REVIEW_REQUIRED: row ordering relies on global progression/path/setup rationale |
| squat | goblet-squat (7.758) | goblet-squat (7.925) | goblet-squat (7.847) | PROVISIONAL: first laboratory accepted; contextual annotation evidence remains unapproved |
| hinge | dumbbell-romanian-deadlift (7.694) over cable-pull-through (7.620) | dumbbell-romanian-deadlift (7.864) over cable-pull-through (7.757) | dumbbell-romanian-deadlift (7.876) over cable-pull-through (7.680) | PROVISIONAL: first laboratory accepted; contextual annotation evidence remains unapproved |
| single-leg | goblet-squat (7.706) over step-up (7.677) | goblet-squat (7.875) over step-up (7.814) | goblet-squat (7.798) over step-up (7.737) | PROVISIONAL: first laboratory accepted; contextual annotation evidence remains unapproved |
| trunk activation | dead-bug (7.708) over pallof-press (7.673) | pallof-press (7.703) over dead-bug (7.619) | pallof-press (7.691) over dead-bug (7.542) | PROVISIONAL: first laboratory accepted; contextual annotation evidence remains unapproved |
| scapular activation | band-face-pull (7.971) over serratus-wall-slide (7.971) | band-face-pull (7.872) over serratus-wall-slide (7.839) | band-face-pull (7.827) over serratus-wall-slide (7.762) | CONTEXT_REVIEW_REQUIRED: accessory rationale leaks into activation phase evidence |

### PHASE_SUITABILITY_CALIBRATION_LABORATORY

The production 22-scenario fingerprint remains unchanged. Current phase_fit uses categorical bases 8.8/7.8/6.2/5.5, a Phase 3 +0.8 high-loadability bonus, a Phase 1 +0.5 low-skill/stability bonus, and configured weight 1.0 over an emitted total weight of 16.2.

The audit identifies actual repeated consumption where phase_fit rereads loadability, skill and stability facts already owned by dedicated components. Removing only those bonuses changes the Phase 1 horizontal-push winner; lowering phase weight to 0.75 also changes that near tie and the Phase 3 scapular-activation winner. These are sensitivity findings, not evidence that an experimental policy is better.

`CandidateRequest.goal` remains the goal-fit authority; `PhaseIntent.primaryGoal` is currently unused. Productive continuity survives all phase changes, ready-to-progress remains same-exercise progression, pain readiness and hard eligibility remain independent, and every transition retains `automaticSelectionEffect=none`.

Selected owner policy: one bounded annotation-led phase preference with no hidden eligibility or replacement authority. The approved starting categories are excellent 8.8, good 7.8, possible 6.2, poor 5.5, at weight 1.0; duplicate mechanical bonuses are absent from the contextual scorer.

### PHASE_ANNOTATION_CONTEXT_AND_UNCERTAINTY_REVIEW

Legacy `ExerciseDefinition.phaseSuitability` remains global to the exercise, so accessory, hypertrophy, loadability, setup, progression or continuity rationale can influence a different legal use. Optional contextual annotations and their resolver now expose truthful role/section evidence in DecisionTrace, but production scoring intentionally remains legacy pending final approval of the proposed contextual annotations.

The implemented deterministic resolver orders role+section, section, training-role and genuinely general matches. No match becomes `UNKNOWN_NO_MATCH`; conflicting equal-specificity annotations become `CONFLICTING_ANNOTATIONS`. Neither receives a hidden phase value. Explicit reviewed poor remains a distinct selected category. Reason prose and provenance do not create score, legality, pain, progression or transition behavior.

The accepted contextual scorer consumes only owner-approved, scoped annotations. Needs-review, unknown, conflict, and no-match evidence omits the component and denominator weight. The eight P0 whole-body rows add no accepted phase vote.

The implemented boundary keeps contextual phase evidence downstream of hard eligibility, requires complete accepted provenance for future scoring eligibility, omits `needs_review`, unknown, no-match, and conflict from both component and denominator, and preserves accepted poor as a bounded negative preference. Legacy production scoring remains active until annotation approval and an explicit deterministic switch.

Remaining P1 work is optional catalog and mechanics depth, including the 17 trunk-mechanics needs-review proposals before assessment expansion. Golden-product safety wiring remains `PRODUCT_ADAPTER_PENDING`. These are explicit future improvements, not blockers to truthful composition over current legal pools. Overall readiness is CANDIDATE_INTELLIGENCE_READY_FOR_SESSION_COMPOSER_DESIGN.

## Pain / Injury Review

Verdict: **PAIN_CONTRACT_READY**. One source-aware canonical match trace supports explicit receiver policies. Joint/caution duplicate charging is removed, moderate warning observes every structured source without becoming hard, required responses and acute/hard provenance remain structured, and unrelated pain is stability-neutral. The owner-approved response-led policy keeps severity 3-6 numerically flat while exposing standard/elevated non-hard urgency and candidate-aware execution readiness.

| Scenario | Winner | Runner-Up | Contraindicated Rejections | Pain Effect | Verdict |
| --- | --- | --- | --- | --- | --- |
| shoulder push, no pain | dumbbell-bench-press / 7.906 | push-up / 7.853 | none | PAIN_SUITABLE; pain=8.20; joint=8.80 | GOOD |
| shoulder push, mild/current discomfort | push-up / 7.584 | dumbbell-bench-press / 7.380 | none | PAIN_REQUIRES_REVIEW; pain=7.30; joint=8.00 | GOOD |
| low-back hinge, moderate pain | cable-pull-through / 7.422 | dumbbell-romanian-deadlift / 7.372 | none | PAIN_REQUIRES_REVIEW; pain=6.40; joint=7.40 | PLAUSIBLE_NEEDS_REVIEW |
| knee squat, historical sensitivity | goblet-squat / 7.825 | - | none | PAIN_REQUIRES_REVIEW; pain=7.40; joint=8.10 | GOOD |
| hard contraindication | dumbbell-bench-press / 7.906 | machine-chest-press / 7.849 | push-up | PAIN_SUITABLE; pain=8.20; joint=8.80 | GOOD |

### ID_BASED_SUPPORT_BONUS_RESOLVED

Before behavior: in the full-gym low-back horizontal-pull contrast, `chest-supported-dumbbell-row` received `pain_suitability=9.200` while `machine-row` and `seated-cable-row` stayed at `8.200`, solely because the pain component checked the exercise ID for `chest-supported`.

After behavior: `machine-row`, `seated-cable-row`, and `chest-supported-dumbbell-row` all report `pain_suitability=8.200` when they have no lumbar pain-stressor overlap. Chest support and low trunk demand remain mechanical facts for traces/review, not positive pain score effects.

The canonical contract subsequently removed the separate global stability pain bonus. Current low-back row and unrelated-pain totals are reported in the post-contract matrix; support remains structured observability rather than an implicit pain or stability reward.

### CANONICAL_PAIN_MATCH_CONTRACT_RESOLVED

The full evidence is in `PAIN_SEMANTICS_AND_CALIBRATION_REVIEW.md`: 48 field-consumption rows, 19 representative exercise/tag rows, and 144 fixed-time candidate/state rows. The canonical unit is `signalId + stressTag`; every matching exercise source remains provenance rather than another unit. Receiver policies explicitly own warning, suitability, joint cost, hard authority, acute authority, assessment context, and deferred response requirements.

The reviewed post-P0 22-scenario fingerprint is `d218c647c71af0fc6ae86ad9032065d37aa3006239c6dfce959483f9ebecf7f7`. The change from the pre-P0 fingerprint is an intentional consequence of catalog admission into truthful tested pools; no score coefficient, severity multiplier, or synthetic phase value changed.

### MODERATE_PAIN_CALIBRATION_LABORATORY

Classification: **RESPONSE_LED_FLAT_POLICY_ADOPTED_NUMERIC_CALIBRATION_DEFERRED**.

The deterministic non-production laboratory in `MODERATE_PAIN_CALIBRATION_DECISION.md` evaluates 9 policy variants across 60 fixed-time production requests and 1,512 complete policy/candidate rows. It compares the current flat policy, four two-band probes, three explicit four-level grids, and a response-led flat policy without changing the production scoring path.

The laboratory confirms one bounded intensity adjustment per matched moderate signal, never per stress fact; joint cost remains severity-invariant; required response remains separate execution truth; and no moderate severity becomes a hard gate. The tested 0.125-1.000 raw adjustments produce zero rank changes and zero winner changes. That stability reflects the controlled pools' matched-signal topology and does not justify selecting a coefficient.

Each ranked candidate now exposes candidate-specific pain execution readiness. `CandidateRankingResult.painExecutionReadiness` reflects rank 1 only, lists executable legal candidates and the best executable alternative without reranking, excludes hard-rejected candidates from selected-result readiness, and preserves explicit urgent signals globally. No role substitution, prescription, or Session Composer behavior is added.

PAIN_CONTRACT: **READY**. MODERATE_PAIN_CANDIDATE_POLICY: **RESOLVED_FOR_CANDIDATE_INTELLIGENCE**. NUMERIC_MODERATE_SEVERITY_CALIBRATION: **DEFERRED_TO_LONGITUDINAL_ADAPTATION**. Pain adds no Candidate Intelligence P1 item; the remaining list contains phase and trunk-domain work and does not claim pain is universally calibrated.

## Experience / Capability Review

Verdict: **GOOD_WITH_REVIEW_CAVEATS**. Beginner does not become machine-only, advanced does not become unstable/free-weight-only, and capability traces distinguish phase_default, experience prior, assessment inference, and history inference. No prior is described as measured physical capability; direct observed capability remains not consumed.

| Persona | Experience | Equipment Env | Need | Winner | Legal Pool | Reasoning Focus |
| --- | --- | --- | --- | --- | --- | --- |
| beginner-gym-no-pain | beginner | commercial_gym | final-horizontal-push-main | push-up / 7.812 | 3 | beginner is not machine-only; equipment truth; phase 1 control |
| beginner-gym-shoulder-concern | beginner | commercial_gym | final-horizontal-push-main | push-up / 7.801 | 3 | assessment affects warmup and main work; mild discomfort is not a blanket hard gate |
| intermediate-gym-muscle-gain | intermediate | commercial_gym | final-horizontal-pull-main | machine-row / 7.936 | 4 | productive continuity; hypertrophy accessories; weekly exposure |
| advanced-gym-muscle-gain | advanced | commercial_gym | final-hinge-accessory | dumbbell-romanian-deadlift / 7.617 | 2 | advanced is not hardest-is-best; pain changes suitability and prescription |
| beginner-dumbbells-bench | beginner | home | final-horizontal-pull-main | chest-supported-dumbbell-row / 7.898 | 2 | free weights are legal when capability fits; bench support matters |
| intermediate-dumbbells | intermediate | home | final-horizontal-push-main | dumbbell-bench-press / 7.906 | 2 | dumbbell progression; loadability limits |
| dumbbells-without-bench | beginner | home | final-horizontal-pull-main | one-arm-dumbbell-row / 7.665 | 1 | bench-dependent exercises are illegal; floor/bodyweight alternatives remain possible |
| anchored-bands | beginner | home | final-scapular-activation | serratus-wall-slide / 8.034 | 3 | anchor height matters; band rows and pulldowns can be represented |
| bands-without-anchor | beginner | travel | final-horizontal-pull-main | none | 0 | band ownership is not anchor capability; setup impossibility is hard eligibility |
| loop-bands-only | novice | travel | final-scapular-activation | serratus-wall-slide / 7.977 | 1 | loop bands differ from anchored tube bands; limited loading path |
| bodyweight | novice | home | final-horizontal-push-main | none | 0 | personal block is not contraindication; bodyweight-only constraints |
| mixed-home | intermediate | home | final-squat-main | goblet-squat / 7.979 | 1 | continuity vs replacement; mixed capability realism |

## History / Continuity Review

Verdict: **GOOD**. Productive + progression runway keeps the current exercise defensible; readyToProgress means same-exercise prescription progression, not replacement pressure. Plateau, failed progression, pain response, and blocked history now receive truthful reconsideration reason-code precedence while transitionRelationships still report automaticSelectionEffect=none.

| Scenario | Current | Transition Candidate | Current Rank | Candidate Rank | Continuity Raw | Reason Code | Evidence | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| no history | chest-supported-dumbbell-row | seated-cable-row | 3 / chest-supported-dumbbell-row / 7.932 | 2 / seated-cable-row / 7.936 | 5.600 | SCORE_NEUTRAL | Chest-Supported Dumbbell Row continuity evidence: retention=[none]; reconsideration=[none]. | GOOD: keep/progress remains defensible |
| productive + stable | chest-supported-dumbbell-row | seated-cable-row | 1 / chest-supported-dumbbell-row / 8.115 | 3 / seated-cable-row / 7.936 | 8.700 | CONTINUITY_FAVORED | Chest-Supported Dumbbell Row continuity evidence: retention=[current, productive, stable]; reconsideration=[none]. | GOOD: keep/progress remains defensible |
| readyToProgress + productive | chest-supported-dumbbell-row | seated-cable-row | 1 / chest-supported-dumbbell-row / 8.133 | 3 / seated-cable-row / 7.936 | 8.000 | CONTINUITY_FAVORED | Chest-Supported Dumbbell Row continuity evidence: retention=[current, productive]; reconsideration=[none]. | GOOD: keep/progress remains defensible |
| too easy + progression success | chest-supported-dumbbell-row | seated-cable-row | 1 / chest-supported-dumbbell-row / 8.174 | 3 / seated-cable-row / 7.936 | 8.700 | CONTINUITY_FAVORED | Chest-Supported Dumbbell Row continuity evidence: retention=[current, productive, stable]; reconsideration=[none]. | GOOD: keep/progress remains defensible |
| plateau + failed progression | chest-supported-dumbbell-row | seated-cable-row | 4 / chest-supported-dumbbell-row / 7.707 | 2 / seated-cable-row / 7.936 | 4.000 | REPLACEMENT_JUSTIFIED | Chest-Supported Dumbbell Row continuity evidence: retention=[current]; reconsideration=[plateaued, failed_progression]. Replacement consideration is justified; this component does not replace the exercise automatically. | GOOD: reconsideration evidence has reason-code precedence without automatic replacement |
| pain response + blocked | chest-supported-dumbbell-row | seated-cable-row | 4 / chest-supported-dumbbell-row / 7.724 | 2 / seated-cable-row / 7.936 | 2.100 | REPLACEMENT_JUSTIFIED | Chest-Supported Dumbbell Row continuity evidence: retention=[current]; reconsideration=[pain_response, blocked]. Replacement consideration is justified; this component does not replace the exercise automatically. | GOOD: reconsideration evidence has reason-code precedence without automatic replacement |

### CONTINUITY_REASON_CODE_PRECEDENCE_RESOLVED

- Positive retention evidence and negative reconsideration evidence remain numerically combined with the existing continuity arithmetic.
- Any plateau, failed progression, pain response, or blocked-history evidence owns `REPLACEMENT_JUSTIFIED` precedence, while all active retention evidence remains visible in the reason text.
- `previousExerciseId` is retention evidence, so a previous-only exercise now reports `CONTINUITY_FAVORED` instead of `SCORE_NEUTRAL`.
- `REPLACEMENT_JUSTIFIED` means the exercise deserves reconsideration; it is not a replacement command and does not select a transition target or bypass ranking, pain, equipment, eligibility, or future composition.
- Focused baseline comparisons confirm continuity raw values, candidate totals, and ranks did not change; only reason-code and reason observability changed.

Before resolution, mixed retention/reconsideration evidence could report `CONTINUITY_FAVORED`, and previous-only evidence could report `SCORE_NEUTRAL`. After resolution, reconsideration wins reason-code precedence and previous-only evidence reports positive continuity truth.

## Row Knowledge Review

Verdict: **GOOD_WITH_REMAINING_CALIBRATION_REVIEW**. Row selection knowledge itself uses structured support/resistance/path values and preserves neutral machine/cable ties as SCORE_EQUIVALENT_BUT_MECHANICALLY_DISTINCT with CONTEXT_REQUIRED_TO_DIFFERENTIATE. Mechanical equivalence does not rely on notes/provenance/review status. pain_suitability no longer uses `exercise.id.includes("chest-supported")` or a generic support bonus.

## Progression / Transition Review

Verdict: **RESOLVED_FOR_CANDIDATE_INTELLIGENCE**. All 36 legacy cross-exercise edges are migrated into transitionRelationships; progressionAxes remain same-exercise advancement. Transition traces expose direction, classification, per-purpose evidence status, structural delta, review status, provenance, and automaticSelectionEffect=none. No transition edge selects, boosts, penalizes, bypasses eligibility, or bypasses pain.

Purpose-evidence audit: edges=47; purposes=140; structurally_confirmed=69; contextual_intent=53; unknown_metadata=18; contradicted=0.

Contradicted purpose findings: **none**.

Unknown metadata remains explicit and does not become mechanical confirmation:
| Source | Target | Purpose | Status | Evidence |
| --- | --- | --- | --- | --- |
| serratus-wall-slide | band-face-pull | change_resistance_path | unknown_metadata | source and/or target resistance-path profile is not modeled |
| dead-bug | pallof-press | change_resistance_path | unknown_metadata | source and/or target resistance-path profile is not modeled |
| push-up | dumbbell-bench-press | change_resistance_path | unknown_metadata | source and/or target resistance-path profile is not modeled |
| dumbbell-bench-press | push-up | change_resistance_path | unknown_metadata | source and/or target resistance-path profile is not modeled |
| machine-chest-press | dumbbell-bench-press | change_resistance_path | unknown_metadata | source and/or target resistance-path profile is not modeled |
| machine-row | band-row | change_resistance_path | unknown_metadata | source and/or target resistance-path profile is not modeled |
| seated-cable-row | band-row | change_resistance_path | unknown_metadata | source and/or target resistance-path profile is not modeled |
| band-row | seated-cable-row | change_resistance_path | unknown_metadata | source and/or target resistance-path profile is not modeled |
| lat-pulldown | band-lat-pulldown | change_resistance_path | unknown_metadata | source and/or target resistance-path profile is not modeled |
| band-lat-pulldown | lat-pulldown | change_resistance_path | unknown_metadata | source and/or target resistance-path profile is not modeled |
| dumbbell-romanian-deadlift | cable-pull-through | change_resistance_path | unknown_metadata | source and/or target resistance-path profile is not modeled |
| cable-pull-through | dumbbell-romanian-deadlift | change_resistance_path | unknown_metadata | source and/or target resistance-path profile is not modeled |
| glute-bridge | dumbbell-romanian-deadlift | increase_stability_demand | unknown_metadata | stability demand: unknown -> moderate (unknown); source and/or target metadata is unknown |
| reverse-pec-deck | band-face-pull | change_resistance_path | unknown_metadata | source and/or target resistance-path profile is not modeled |
| band-face-pull | reverse-pec-deck | change_resistance_path | unknown_metadata | source and/or target resistance-path profile is not modeled |
| forearm-plank | dead-bug | change_resistance_path | unknown_metadata | source and/or target resistance-path profile is not modeled |
| half-kneeling-high-to-low-cable-chop | pallof-press | feature_shift | unknown_metadata | source and/or target assessment-feature mechanics are not modeled |
| half-kneeling-high-to-low-cable-chop | pallof-press | change_resistance_path | unknown_metadata | source and/or target resistance-path profile is not modeled |

Contextual programming intent remains explicit and retains reviewed transition provenance without pretending to be an ordinal mechanics claim:
| Source | Target | Purpose | Status | Evidence |
| --- | --- | --- | --- | --- |
| ninety-ninety-breathing | dead-bug | movement_pattern_development | contextual_intent | movement roles: source=[anti_extension_core, breathing_position] -> target=[anti_extension_core]; contextual intent; transition note retained; review=accepted; provenance=[migrated from legacy cross-exercise progression edge] |
| ninety-ninety-breathing | dead-bug | preparation_to_loaded_training | contextual_intent | loadability: none -> limited (increase); contextual intent; transition note retained; review=accepted; provenance=[migrated from legacy cross-exercise progression edge] |
| serratus-wall-slide | band-face-pull | preparation_to_loaded_training | contextual_intent | loadability: limited -> limited (same); contextual intent; transition note retained; review=accepted; provenance=[migrated from legacy cross-exercise progression edge] |
| dead-bug | pallof-press | movement_pattern_development | contextual_intent | movement roles: source=[anti_extension_core] -> target=[anti_rotation_core]; contextual intent; transition note retained; review=accepted; provenance=[migrated from legacy cross-exercise progression edge] |
| dead-bug | ninety-ninety-breathing | pain_or_tolerance_regression | contextual_intent | base position: supine -> supine; stance: unknown -> unknown; orientation: supine -> supine; support amount: substantial -> substantial (same); support relationship: side_neutral -> side_neutral; support contacts: sourceOnly=[none]; targetOnly=[none]; trunk demand: moderate -> low (decrease); stability demand: moderate -> low (decrease); contextual intent; transition note retained; review=accepted; provenance=[migrated from legacy cross-exercise progression edge] |
| dead-bug | ninety-ninety-breathing | movement_pattern_development | contextual_intent | movement roles: source=[anti_extension_core] -> target=[anti_extension_core, breathing_position]; contextual intent; transition note retained; review=accepted; provenance=[migrated from legacy cross-exercise progression edge] |
| push-up | dumbbell-bench-press | increase_support | contextual_intent | base position: prone -> supine; stance: bilateral -> bilateral; orientation: prone -> supine; support amount: substantial -> substantial (same); support relationship: bilateral -> bilateral; support contacts: sourceOnly=[foot:floor:weight_bearing:bilateral:primary, hand:floor:weight_bearing:bilateral:primary]; targetOnly=[back:bench:weight_bearing:side_neutral:primary, foot:floor:weight_bearing:bilateral:secondary]; contextual intent; transition note retained; review=accepted; provenance=[migrated from legacy cross-exercise progression edge] |
| push-up | dumbbell-bench-press | stimulus_shift | contextual_intent | movement roles: source=[anti_extension_core, horizontal_push] -> target=[horizontal_push]; muscles: sourceOnly=[none]; targetOnly=[none]; loadability: moderate -> high (increase); contextual intent; transition note retained; review=accepted; provenance=[migrated from legacy cross-exercise progression edge] |
| push-up | machine-chest-press | increase_support | contextual_intent | base position: prone -> seated; stance: bilateral -> bilateral; orientation: prone -> upright; support amount: substantial -> substantial (same); support relationship: bilateral -> bilateral; support contacts: sourceOnly=[foot:floor:weight_bearing:bilateral:primary, hand:floor:weight_bearing:bilateral:primary]; targetOnly=[back:machine:positioning:side_neutral:secondary, seat:machine:weight_bearing:side_neutral:primary]; contextual intent; transition note retained; review=accepted; provenance=[migrated from legacy cross-exercise progression edge] |
| push-up | machine-chest-press | pain_or_tolerance_regression | contextual_intent | base position: prone -> seated; stance: bilateral -> bilateral; orientation: prone -> upright; support amount: substantial -> substantial (same); support relationship: bilateral -> bilateral; support contacts: sourceOnly=[foot:floor:weight_bearing:bilateral:primary, hand:floor:weight_bearing:bilateral:primary]; targetOnly=[back:machine:positioning:side_neutral:secondary, seat:machine:weight_bearing:side_neutral:primary]; trunk demand: moderate -> low (decrease); stability demand: moderate -> low (decrease); contextual intent; transition note retained; review=accepted; provenance=[migrated from legacy cross-exercise progression edge] |
| dumbbell-bench-press | machine-chest-press | increase_support | contextual_intent | base position: supine -> seated; stance: bilateral -> bilateral; orientation: supine -> upright; support amount: substantial -> substantial (same); support relationship: bilateral -> bilateral; support contacts: sourceOnly=[back:bench:weight_bearing:side_neutral:primary, foot:floor:weight_bearing:bilateral:secondary]; targetOnly=[back:machine:positioning:side_neutral:secondary, seat:machine:weight_bearing:side_neutral:primary]; contextual intent; transition note retained; review=accepted; provenance=[migrated from legacy cross-exercise progression edge] |
| dumbbell-bench-press | machine-chest-press | pain_or_tolerance_regression | contextual_intent | base position: supine -> seated; stance: bilateral -> bilateral; orientation: supine -> upright; support amount: substantial -> substantial (same); support relationship: bilateral -> bilateral; support contacts: sourceOnly=[back:bench:weight_bearing:side_neutral:primary, foot:floor:weight_bearing:bilateral:secondary]; targetOnly=[back:machine:positioning:side_neutral:secondary, seat:machine:weight_bearing:side_neutral:primary]; trunk demand: low -> low (same); stability demand: moderate -> low (decrease); contextual intent; transition note retained; review=accepted; provenance=[migrated from legacy cross-exercise progression edge] |
| machine-chest-press | dumbbell-bench-press | reduce_support | contextual_intent | base position: seated -> supine; stance: bilateral -> bilateral; orientation: upright -> supine; support amount: substantial -> substantial (same); support relationship: bilateral -> bilateral; support contacts: sourceOnly=[back:machine:positioning:side_neutral:secondary, seat:machine:weight_bearing:side_neutral:primary]; targetOnly=[back:bench:weight_bearing:side_neutral:primary, foot:floor:weight_bearing:bilateral:secondary]; contextual intent; transition note retained; review=accepted; provenance=[migrated from legacy cross-exercise progression edge] |
| cable-chest-fly | machine-chest-press | stimulus_shift | contextual_intent | movement roles: source=[accessory] -> target=[horizontal_push]; muscles: sourceOnly=[none]; targetOnly=[triceps]; loadability: moderate -> high (increase); contextual intent; transition note retained; review=needs_review; provenance=[migrated from legacy cross-exercise progression edge] |
| chest-supported-dumbbell-row | seated-cable-row | stimulus_shift | contextual_intent | movement roles: source=[horizontal_pull] -> target=[horizontal_pull]; muscles: sourceOnly=[none]; targetOnly=[none]; loadability: high -> high (same); contextual intent; transition note retained; review=accepted; provenance=[migrated from legacy cross-exercise progression edge] |
| one-arm-dumbbell-row | chest-supported-dumbbell-row | increase_support | contextual_intent | base position: standing -> prone; stance: unknown -> bilateral; orientation: diagonal -> prone; support amount: partial -> substantial (increase); support relationship: unknown -> bilateral; support contacts: sourceOnly=[foot:floor:weight_bearing:bilateral:primary, hand:bench:weight_bearing:unknown:secondary]; targetOnly=[chest:bench:weight_bearing:side_neutral:primary, foot:floor:weight_bearing:bilateral:secondary]; contextual intent; transition note retained; review=accepted; provenance=[migrated from legacy cross-exercise progression edge] |
| one-arm-dumbbell-row | chest-supported-dumbbell-row | pain_or_tolerance_regression | contextual_intent | base position: standing -> prone; stance: unknown -> bilateral; orientation: diagonal -> prone; support amount: partial -> substantial (increase); support relationship: unknown -> bilateral; support contacts: sourceOnly=[foot:floor:weight_bearing:bilateral:primary, hand:bench:weight_bearing:unknown:secondary]; targetOnly=[chest:bench:weight_bearing:side_neutral:primary, foot:floor:weight_bearing:bilateral:secondary]; trunk demand: high -> low (decrease); stability demand: high -> low (decrease); contextual intent; transition note retained; review=accepted; provenance=[migrated from legacy cross-exercise progression edge] |
| one-arm-dumbbell-row | seated-cable-row | increase_support | contextual_intent | base position: standing -> seated; stance: unknown -> bilateral; orientation: diagonal -> upright; support amount: partial -> substantial (increase); support relationship: unknown -> bilateral; support contacts: sourceOnly=[foot:floor:weight_bearing:bilateral:primary, hand:bench:weight_bearing:unknown:secondary]; targetOnly=[foot:floor:weight_bearing:bilateral:secondary, seat:bench:weight_bearing:side_neutral:primary]; contextual intent; transition note retained; review=accepted; provenance=[migrated from legacy cross-exercise progression edge] |
| machine-row | chest-supported-dumbbell-row | stimulus_shift | contextual_intent | movement roles: source=[horizontal_pull] -> target=[horizontal_pull]; muscles: sourceOnly=[none]; targetOnly=[none]; loadability: high -> high (same); contextual intent; transition note retained; review=accepted; provenance=[migrated from legacy cross-exercise progression edge] |
| machine-row | seated-cable-row | stimulus_shift | contextual_intent | movement roles: source=[horizontal_pull] -> target=[horizontal_pull]; muscles: sourceOnly=[none]; targetOnly=[none]; loadability: high -> high (same); contextual intent; transition note retained; review=accepted; provenance=[migrated from legacy cross-exercise progression edge] |
| seated-cable-row | chest-supported-dumbbell-row | stimulus_shift | contextual_intent | movement roles: source=[horizontal_pull] -> target=[horizontal_pull]; muscles: sourceOnly=[none]; targetOnly=[none]; loadability: high -> high (same); contextual intent; transition note retained; review=accepted; provenance=[migrated from legacy cross-exercise progression edge] |
| dumbbell-shoulder-press | serratus-wall-slide | preparation_to_loaded_training | contextual_intent | loadability: high -> limited (decrease); contextual intent; transition note retained; review=accepted; provenance=[migrated from legacy cross-exercise progression edge] |
| dumbbell-shoulder-press | serratus-wall-slide | pain_or_tolerance_regression | contextual_intent | base position: standing -> standing; stance: bilateral -> bilateral; orientation: upright -> upright; support amount: none -> partial (increase); support relationship: bilateral -> bilateral; support contacts: sourceOnly=[none]; targetOnly=[hand:wall:positioning:bilateral:secondary]; trunk demand: moderate -> low (decrease); stability demand: moderate -> low (decrease); contextual intent; transition note retained; review=accepted; provenance=[migrated from legacy cross-exercise progression edge] |
| goblet-squat | leg-press | increase_support | contextual_intent | base position: standing -> seated; stance: bilateral -> bilateral; orientation: upright -> diagonal; support amount: none -> substantial (increase); support relationship: bilateral -> bilateral; support contacts: sourceOnly=[foot:floor:weight_bearing:bilateral:primary]; targetOnly=[back:machine:positioning:side_neutral:secondary, seat:machine:weight_bearing:side_neutral:primary]; contextual intent; transition note retained; review=accepted; provenance=[migrated from legacy cross-exercise progression edge] |
| goblet-squat | leg-press | stimulus_shift | contextual_intent | movement roles: source=[knee_dominant, squat] -> target=[knee_dominant]; muscles: sourceOnly=[none]; targetOnly=[hamstrings]; loadability: moderate -> high (increase); contextual intent; transition note retained; review=accepted; provenance=[migrated from legacy cross-exercise progression edge] |
| goblet-squat | bodyweight-box-squat | increase_support | contextual_intent | base position: standing -> standing; stance: bilateral -> bilateral; orientation: upright -> upright; support amount: none -> prescription_modifiable (unknown); support relationship: bilateral -> bilateral; support contacts: sourceOnly=[none]; targetOnly=[pelvis:box:positioning:side_neutral:secondary]; contextual intent; transition note retained; review=accepted; provenance=[migrated from legacy cross-exercise progression edge] |
| goblet-squat | bodyweight-box-squat | pain_or_tolerance_regression | contextual_intent | base position: standing -> standing; stance: bilateral -> bilateral; orientation: upright -> upright; support amount: none -> prescription_modifiable (unknown); support relationship: bilateral -> bilateral; support contacts: sourceOnly=[none]; targetOnly=[pelvis:box:positioning:side_neutral:secondary]; trunk demand: moderate -> low (decrease); stability demand: moderate -> low (decrease); contextual intent; transition note retained; review=accepted; provenance=[migrated from legacy cross-exercise progression edge] |
| leg-press | goblet-squat | reduce_support | contextual_intent | base position: seated -> standing; stance: bilateral -> bilateral; orientation: diagonal -> upright; support amount: substantial -> none (decrease); support relationship: bilateral -> bilateral; support contacts: sourceOnly=[back:machine:positioning:side_neutral:secondary, seat:machine:weight_bearing:side_neutral:primary]; targetOnly=[foot:floor:weight_bearing:bilateral:primary]; contextual intent; transition note retained; review=accepted; provenance=[migrated from legacy cross-exercise progression edge] |
| bodyweight-box-squat | goblet-squat | reduce_support | contextual_intent | base position: standing -> standing; stance: bilateral -> bilateral; orientation: upright -> upright; support amount: prescription_modifiable -> none (unknown); support relationship: bilateral -> bilateral; support contacts: sourceOnly=[pelvis:box:positioning:side_neutral:secondary]; targetOnly=[none]; contextual intent; transition note retained; review=accepted; provenance=[migrated from legacy cross-exercise progression edge] |
| dumbbell-romanian-deadlift | cable-pull-through | pain_or_tolerance_regression | contextual_intent | base position: standing -> standing; stance: bilateral -> bilateral; orientation: upright -> upright; support amount: none -> none (same); support relationship: bilateral -> bilateral; support contacts: sourceOnly=[none]; targetOnly=[none]; trunk demand: high -> moderate (decrease); stability demand: moderate -> moderate (same); contextual intent; transition note retained; review=accepted; provenance=[migrated from legacy cross-exercise progression edge] |
| cable-pull-through | dumbbell-romanian-deadlift | movement_pattern_development | contextual_intent | movement roles: source=[hinge] -> target=[hinge]; contextual intent; transition note retained; review=accepted; provenance=[migrated from legacy cross-exercise progression edge] |
| split-squat | step-up | movement_pattern_development | contextual_intent | movement roles: source=[knee_dominant, single_leg] -> target=[knee_dominant, single_leg]; contextual intent; transition note retained; review=accepted; provenance=[migrated from legacy cross-exercise progression edge] |
| split-squat | step-up | stimulus_shift | contextual_intent | movement roles: source=[knee_dominant, single_leg] -> target=[knee_dominant, single_leg]; muscles: sourceOnly=[none]; targetOnly=[hamstrings]; loadability: moderate -> moderate (same); contextual intent; transition note retained; review=accepted; provenance=[migrated from legacy cross-exercise progression edge] |
| step-up | split-squat | movement_pattern_development | contextual_intent | movement roles: source=[knee_dominant, single_leg] -> target=[knee_dominant, single_leg]; contextual intent; transition note retained; review=accepted; provenance=[migrated from legacy cross-exercise progression edge] |
| step-up | split-squat | stimulus_shift | contextual_intent | movement roles: source=[knee_dominant, single_leg] -> target=[knee_dominant, single_leg]; muscles: sourceOnly=[hamstrings]; targetOnly=[none]; loadability: moderate -> moderate (same); contextual intent; transition note retained; review=accepted; provenance=[migrated from legacy cross-exercise progression edge] |
| step-up | bodyweight-box-squat | pain_or_tolerance_regression | contextual_intent | base position: standing -> standing; stance: split -> bilateral; orientation: upright -> upright; support amount: prescription_modifiable -> prescription_modifiable (same); support relationship: side_neutral -> bilateral; support contacts: sourceOnly=[foot:box:weight_bearing:unknown:primary, foot:floor:weight_bearing:unknown:secondary]; targetOnly=[foot:floor:weight_bearing:bilateral:primary, pelvis:box:positioning:side_neutral:secondary]; trunk demand: moderate -> low (decrease); stability demand: moderate -> low (decrease); contextual intent; transition note retained; review=accepted; provenance=[migrated from legacy cross-exercise progression edge] |
| glute-bridge | dumbbell-romanian-deadlift | movement_pattern_development | contextual_intent | movement roles: source=[accessory] -> target=[hinge]; contextual intent; transition note retained; review=accepted; provenance=[migrated from legacy cross-exercise progression edge] |
| glute-bridge | dumbbell-romanian-deadlift | stimulus_shift | contextual_intent | movement roles: source=[accessory] -> target=[hinge]; muscles: sourceOnly=[none]; targetOnly=[none]; loadability: moderate -> high (increase); contextual intent; transition note retained; review=accepted; provenance=[migrated from legacy cross-exercise progression edge] |
| pallof-press | dead-bug | movement_pattern_development | contextual_intent | movement roles: source=[anti_rotation_core] -> target=[anti_extension_core]; contextual intent; transition note retained; review=needs_review; provenance=[migrated from legacy cross-exercise progression edge] |
| pallof-press | dead-bug | pain_or_tolerance_regression | contextual_intent | base position: standing -> supine; stance: bilateral -> unknown; orientation: upright -> supine; support amount: none -> substantial (increase); support relationship: bilateral -> side_neutral; support contacts: sourceOnly=[foot:floor:weight_bearing:bilateral:primary]; targetOnly=[back:floor:weight_bearing:side_neutral:primary]; trunk demand: high -> moderate (decrease); stability demand: moderate -> moderate (same); contextual intent; transition note retained; review=needs_review; provenance=[migrated from legacy cross-exercise progression edge] |
| forearm-plank | dead-bug | movement_pattern_development | contextual_intent | movement roles: source=[anti_extension_core] -> target=[anti_extension_core]; contextual intent; transition note retained; review=accepted; provenance=[docs/training-engine-v2/PHASE_AND_STRESS_OWNER_DECISIONS.md#approved-structured-stress-decisions] |
| forearm-side-plank | suitcase-carry | stimulus_shift | contextual_intent | movement roles: source=[anti_lateral_flexion_core] -> target=[anti_lateral_flexion_core, carry, loaded_bracing]; muscles: sourceOnly=[none]; targetOnly=[upper_back]; loadability: limited -> high (increase); contextual intent; transition note retained; review=accepted; provenance=[docs/training-engine-v2/PHASE_AND_STRESS_OWNER_DECISIONS.md#approved-structured-stress-decisions] |
| farmer-carry | suitcase-carry | stimulus_shift | contextual_intent | movement roles: source=[carry, loaded_bracing] -> target=[anti_lateral_flexion_core, carry, loaded_bracing]; muscles: sourceOnly=[none]; targetOnly=[none]; loadability: high -> high (same); contextual intent; transition note retained; review=accepted; provenance=[docs/training-engine-v2/PHASE_AND_STRESS_OWNER_DECISIONS.md#approved-structured-stress-decisions] |
| suitcase-carry | forearm-side-plank | stimulus_shift | contextual_intent | movement roles: source=[anti_lateral_flexion_core, carry, loaded_bracing] -> target=[anti_lateral_flexion_core]; muscles: sourceOnly=[upper_back]; targetOnly=[none]; loadability: high -> limited (decrease); contextual intent; transition note retained; review=accepted; provenance=[docs/training-engine-v2/PHASE_AND_STRESS_OWNER_DECISIONS.md#approved-structured-stress-decisions] |
| suitcase-carry | farmer-carry | stimulus_shift | contextual_intent | movement roles: source=[anti_lateral_flexion_core, carry, loaded_bracing] -> target=[carry, loaded_bracing]; muscles: sourceOnly=[none]; targetOnly=[none]; loadability: high -> high (same); contextual intent; transition note retained; review=accepted; provenance=[docs/training-engine-v2/PHASE_AND_STRESS_OWNER_DECISIONS.md#approved-structured-stress-decisions] |
| wall-supported-suitcase-march | suitcase-carry | reduce_support | contextual_intent | base position: standing -> standing; stance: alternating_march -> unknown; orientation: upright -> upright; support amount: prescription_modifiable -> none (unknown); support relationship: opposite_side_load -> unknown; support contacts: sourceOnly=[hand:wall:balance_assist:unknown:secondary]; targetOnly=[none]; contextual intent; transition note retained; review=accepted; provenance=[docs/training-engine-v2/PHASE_AND_STRESS_OWNER_DECISIONS.md#approved-structured-stress-decisions] |
| wall-supported-suitcase-march | suitcase-carry | movement_pattern_development | contextual_intent | movement roles: source=[loaded_bracing] -> target=[anti_lateral_flexion_core, carry, loaded_bracing]; contextual intent; transition note retained; review=accepted; provenance=[docs/training-engine-v2/PHASE_AND_STRESS_OWNER_DECISIONS.md#approved-structured-stress-decisions] |
| bodyweight-hip-hinge-rehearsal | cable-pull-through | preparation_to_loaded_training | contextual_intent | loadability: none -> moderate (increase); contextual intent; transition note retained; review=accepted; provenance=[docs/training-engine-v2/P0_WHOLE_BODY_PRODUCTION_REPORT.md#production-contract] |
| bodyweight-hip-hinge-rehearsal | cable-pull-through | movement_pattern_development | contextual_intent | movement roles: source=[hinge] -> target=[hinge]; contextual intent; transition note retained; review=accepted; provenance=[docs/training-engine-v2/P0_WHOLE_BODY_PRODUCTION_REPORT.md#production-contract] |
| bodyweight-hip-hinge-rehearsal | dumbbell-romanian-deadlift | preparation_to_loaded_training | contextual_intent | loadability: none -> high (increase); contextual intent; transition note retained; review=accepted; provenance=[docs/training-engine-v2/P0_WHOLE_BODY_PRODUCTION_REPORT.md#production-contract] |
| bodyweight-hip-hinge-rehearsal | dumbbell-romanian-deadlift | movement_pattern_development | contextual_intent | movement roles: source=[hinge] -> target=[hinge]; contextual intent; transition note retained; review=accepted; provenance=[docs/training-engine-v2/P0_WHOLE_BODY_PRODUCTION_REPORT.md#production-contract] |
| single-leg-balance-rehearsal | split-squat | preparation_to_loaded_training | contextual_intent | loadability: none -> moderate (increase); contextual intent; transition note retained; review=accepted; provenance=[docs/training-engine-v2/P0_WHOLE_BODY_PRODUCTION_REPORT.md#production-contract] |
| single-leg-balance-rehearsal | step-up | preparation_to_loaded_training | contextual_intent | loadability: none -> moderate (increase); contextual intent; transition note retained; review=accepted; provenance=[docs/training-engine-v2/P0_WHOLE_BODY_PRODUCTION_REPORT.md#production-contract] |

### TRANSITION_PURPOSE_TRUTH_RESOLVED

- Four direct structural contradictions were corrected without changing exercise mechanics metadata.
- Direct purposes are structurally confirmed, unknown because required metadata is incomplete, or contradicted solely from normalized source/target deltas; transition notes cannot alter that status.
- Programming and multidimensional support purposes remain explicit `contextual_intent` with review provenance retained.
- Every transition remains observational with `automaticSelectionEffect=none`; no candidate score, total, rank, or full ordering changed.
- No automatic replacement behavior was added, and questionable or needs-review relationships retain their review qualification.

## Manual Science Review Table

| Scenario | Expected Coaching Logic | Actual Winner | Runner-Up | Why Winner Won | Surprising Component | Assessment Effect | Pain Effect | Continuity Effect | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Neutral full-gym horizontal pull | Prefer a legal loadable row; preserve machine/cable tie when no context separates them. | machine-row | seated-cable-row | role_fit 8.00; pain_suitability 8.20; session_intent_fit 9.50 | row tie is deliberate context-required evidence | none | none | none | GOOD |
| Low-back row pain context | Prefer lower lumbar demand/support, but keep equipment truth hard. | chest-supported-dumbbell-row | one-arm-dumbbell-row | role_fit 8.00; pain_suitability 8.20; session_intent_fit 9.50 | ID-derived support bonus resolved; remaining pain effect is stress-overlap based | not primary | material | none | PLAUSIBLE_NEEDS_REVIEW |
| Phase contrast horizontal push | Phase 1 should prefer usable control/support; Phase 3 should value loadable stimulus without hardest-is-best. | dumbbell-bench-press (7.951) over machine-chest-press (7.894) | push-up (7.781) over dumbbell-bench-press (7.769) | phase_fit, loadability, stimulus_potential shift the winner across phases | the phase laboratory found exact mechanical double counts and near-tie winner sensitivity | none | none | none | PLAUSIBLE_NEEDS_REVIEW |
| Feature-specific serratus/protraction assessment | Identify feature relevance without conflating expression with feature difficulty. | band-face-pull | serratus-wall-slide | reviewed feature target fit affects assessment_fit; feature challenge remains not modeled | feature challenge remains unknown while target fit can still be selection-relevant | target=0.390; development=0.000; alignment=0.000 | none | none | GOOD |
| Ready-to-progress current row | Keep productive current exercise and progress prescription before replacement. | 1 / chest-supported-dumbbell-row / 8.133 | 3 / seated-cable-row / 7.936 | continuity_value and progression_value reward same-exercise runway | none | none | none | CONTINUITY_FAVORED | GOOD |
| Plateau/failed progression row | Replacement may become justified by real performance signal. | 2 / seated-cable-row / 7.936 | 4 / chest-supported-dumbbell-row / 7.707 | continuity/progression penalties reduce current exercise | transition edge remains knowledge-only | none | none | REPLACEMENT_JUSTIFIED | GOOD |

## Blocker Classification

### P0

- None found. Candidate Intelligence architecture can continue targeted review; no evidence showed hard eligibility/role truth collapse, nondeterminism, or assessment legalizing wrong-role candidates.

### P1

- Nine equipment- or task-specific whole-body catalog concepts remain optional future improvements, not Candidate Intelligence blockers.
- Project-owner resolution of the 17 remaining trunk-mechanics proposals is required before adding further complete profiles or normalized trunk assessment features, not before composition over current legal pools.
- Golden-product TrainingSafety adapter wiring remains separately classified as PRODUCT_ADAPTER_PENDING.

### P2

- Several non-row exercises still have unknown support or resistance-path metadata.
- Many upper-body exercises still need reviewed scapularMechanics profiles before fine feature selection can be high confidence.
- HistoricalInjury is currently unused by Candidate Intelligence and needs an explicit future consumption or non-consumption contract.
- Catalog remains intentionally small; expansion should follow reviewed selection questions rather than broad migration.

## Readiness Rationale

Candidate Intelligence graduates because the 45-row legal pools are truthful, deterministic ranking and DecisionTrace remain inspectable, direct actions and primary-required muscles are selectable, preparation dependencies have bounded candidates, equipment gaps stay explicit, response-led continuity remains separate from replacement, TrainingSafety affects downstream readiness without changing rank, and contextual phase abstention adds no synthetic vote. P1 concepts are improvements rather than blockers. This was the pre-Composer conclusion; the subsequent production milestone is recorded below.

## Subsequent Session Composer Milestones

The design laboratory historically classified policy gaps as `TARGETED_DESIGN_DECISIONS_REQUIRED`. The owner then approved those policies and authorized the production kernel. Candidate Intelligence remains unchanged and continues to supply exact legal per-need evidence. Fixed `SessionIntent.slots` are no longer authoritative; normalized needs, production whole-session search, non-prescribed assignments, and explicit downstream handoffs are exported. Current classification is `SESSION_COMPOSER_PRODUCTION_KERNEL_READY_FOR_SESSION_INTENT_PLANNER`, without application wiring, Week Composer, dose generation, or final sequencing.

## Subsequent Session Intent Planner Milestone

The production Planner now supplies explicit needs from `SessionAllocationDirective`; Candidate Intelligence still receives one canonical goal source and unchanged selection, context, and evaluation facts. Candidate ranking, comprehensive review, catalog, and Knowledge fingerprints remain frozen. Planner ontology graduates as `SESSION_INTENT_PLANNER_READY_FOR_WEEK_COMPOSER_DESIGN`; unresolved real-user contexts retain explicit future owners rather than being guessed.
