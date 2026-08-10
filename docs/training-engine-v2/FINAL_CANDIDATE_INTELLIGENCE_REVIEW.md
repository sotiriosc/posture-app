# Final Candidate Intelligence Readiness Review

`ENGINE_V2_BLUEPRINT.md` is authoritative. This review is audit/evidence/classification only; it does not tune weights, change exercise metadata, create Session Composer, create Week Composer, or implement prescription progression.

## Scope

Current review inputs: 30 reference exercises, 22 existing controlled scenarios, 12 golden personas, and 82 deterministic CandidateRequest executions across final audit matrices.

Current Candidate Intelligence pipeline remains:

CandidateRequest -> interpreted context -> hard eligibility -> legal candidate pool -> modular candidate scoring -> deterministic ranking -> DecisionTrace / pipeline observability.

## Final Decision

Classification: **TARGETED_FIXES_REQUIRED_BEFORE_SESSION_COMPOSITION**

Architecture is sound and the candidate pipeline is deterministic/explainable, but Session Composer should not consume these rankings yet because P1 calibration issues remain. Feature-specific target fit, continuity reason-code precedence, and transition-purpose truth are resolved for Candidate Intelligence; the remaining blockers are moderate-pain calibration and phase calibration.

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
| pain_suitability + joint_cost | POTENTIAL_DOUBLE_COUNT | Both react to pain/stress tags; this is conceptually distinct pain suitability vs joint cost, but the combined demotion still needs pain calibration review. |
| phase_fit + experience_fit + skill_fit | INTENTIONAL_DISTINCT_SIGNAL | Phase intent, athlete prior, and exercise demand are separate, but phase suitability remains influential enough to require calibration review. |
| support/stability/path | RESOLVED_FOR_PAIN_SUPPORT_BONUS | Structured row path knowledge is observability-only, and pain_suitability no longer adds positive support credit from exercise ID, name, prose, or structured bodySupport. |
| progression_value + continuity_value | INTENTIONAL_DISTINCT_SIGNAL | progression_value is same-exercise runway/readiness; continuity_value combines retention and reconsideration evidence numerically while reconsideration owns reason-code precedence. Transition edges do not add replacement pressure. |
| unknown metadata | NOT_APPLICABLE | Unknown demand/path/challenge values remain neutral/not_applicable in assessment traces and do not create positive evidence by themselves. |

## UNKNOWN / NEEDS_REVIEW Policy

Catalog coverage: fully usable=2; usable with review caveats=20; materially under-specified=8.

UNKNOWN does not become easy/safe/preferred/developmentally superior/feature matched in assessment demand traces. NEEDS_REVIEW remains visible in catalog review and row trace context. The prior ID-derived support promotion risk is resolved in pain_suitability; remaining uncertainty risks are moderate-pain calibration and incomplete reviewed mechanics.

## Feature-Specific Assessment Review

Verdict: **RESOLVED_FOR_CANDIDATE_INTELLIGENCE**

Feature relevance/expression is explicit and now has a separate conservative target-fit channel. A legal candidate can receive bounded assessment_fit influence when reviewed metadata shows that it trains the assessed feature, even while feature challenge difficulty remains unknown.

Target fit answers what quality the candidate trains. Developmental challenge remains a separate NOT_MODELED question, so current feature-specific traces retain neutral developmental relationships, zero developmental challenge influence, and zero alignment contribution. NEEDS_REVIEW annotations remain downgraded through the existing feature matcher.

| Assessment | Winner OFF | Winner ON | Changed | Inspected | Assessment Fit | Alignment Fit | Relevance | Feature Expression | Overall Demand | Feature Challenge | Capability Provenance | Relationship | Target Fit | Developmental Influence | Bounded | Why |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Generic Scapular Control | band-face-pull | band-face-pull | score only | 1 / band-face-pull / 8.012 | 5.694 | 5.796 | high | generic | 3 | not_applicable | phase_default/weak | exceeds_current_capability | 0.000 | -0.510 | -0.510 | assessment changes score without reordering the legal pool |
| Serratus / Protraction | band-face-pull | band-face-pull | score only | 3 / serratus-wall-slide / 7.834 | 6.390 | 6.000 | moderate | high/moderate | 2 (moderate) | unknown/not_modeled | phase_default/weak | neutral | 0.390 | 0.000 | 0.390 | reviewed feature target fit affects assessment_fit; feature challenge remains not modeled |
| Upward Rotation | band-face-pull | band-face-pull | score only | 3 / serratus-wall-slide / 7.834 | 6.390 | 6.000 | moderate | high/moderate | 2 (moderate) | unknown/not_modeled | phase_default/weak | neutral | 0.390 | 0.000 | 0.390 | reviewed feature target fit affects assessment_fit; feature challenge remains not modeled |
| Retraction | band-face-pull | band-face-pull | score only | 1 / band-face-pull / 8.062 | 6.390 | 6.000 | moderate | high/moderate | 3 (high) | unknown/not_modeled | phase_default/weak | neutral | 0.390 | 0.000 | 0.390 | reviewed feature target fit affects assessment_fit; feature challenge remains not modeled |
| External Rotation / Cuff | band-face-pull | band-face-pull | score only | 1 / band-face-pull / 8.052 | 6.210 | 6.000 | low | moderate/weak | 3 (high) | unknown/not_modeled | phase_default/weak | neutral | 0.210 | 0.000 | 0.210 | reviewed feature target fit affects assessment_fit; feature challenge remains not modeled |
| Loaded Scapular Stability | band-face-pull | band-face-pull | score only | 1 / band-face-pull / 8.052 | 6.210 | 6.000 | low | moderate/weak | 3 (high) | unknown/not_modeled | phase_default/weak | neutral | 0.210 | 0.000 | 0.210 | reviewed feature target fit affects assessment_fit; feature challenge remains not modeled |

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
| photo-exp-squat-main | goblet-squat | goblet-squat | no | 2 | photo-pose-trunk-bias:moderate/develops_priority/0.211; photo-pose-hip-shift:high/develops_priority/0.324; photo-pose-knee-alignment:high/develops_priority/0.211 | GOOD |
| photo-exp-single-leg-accessory | step-up | step-up | no | 2 | photo-pose-trunk-bias:moderate/develops_priority/0.211; photo-pose-hip-shift:high/develops_priority/0.324; photo-pose-knee-alignment:high/develops_priority/0.211 | GOOD |

## Phase Review

Verdict: **PLAUSIBLE_NEEDS_REVIEW**. Phase behavior is directionally coherent and does not equate Phase 3 with hardest-looking exercise, but phaseSuitability is still a meaningful rank driver and should be calibrated before Session Composer multiplies candidate choices across slots.

| Need | Phase 1 | Phase 2 | Phase 3 | Verdict |
| --- | --- | --- | --- | --- |
| horizontal push | machine-chest-press (7.815) over push-up (7.793) | dumbbell-bench-press (7.961) over push-up (7.930) | dumbbell-bench-press (8.024) over machine-chest-press (7.909) | GOOD |
| horizontal pull | chest-supported-dumbbell-row (8.003) over machine-row (7.976) | machine-row (8.069) over seated-cable-row (8.069) | chest-supported-dumbbell-row (8.128) over machine-row (8.070) | PLAUSIBLE_NEEDS_REVIEW: phase suitability leaves machine/cable nearly tied without path/fit context |
| squat | goblet-squat (7.910) over leg-press (7.850) | goblet-squat (8.059) over leg-press (8.041) | leg-press (8.073) over goblet-squat (7.797) | GOOD |
| hinge | cable-pull-through (7.783) over dumbbell-romanian-deadlift (7.653) | dumbbell-romanian-deadlift (8.002) over cable-pull-through (7.840) | dumbbell-romanian-deadlift (8.033) over cable-pull-through (7.640) | GOOD |
| single-leg | goblet-squat (7.863) over step-up (7.853) | goblet-squat (8.013) over step-up (8.011) | leg-press (8.027) over split-squat (7.929) | GOOD |
| trunk activation | dead-bug (7.808) over pallof-press (7.785) | pallof-press (7.749) over dead-bug (7.670) | pallof-press (7.709) over dead-bug (7.470) | GOOD |
| scapular activation | band-face-pull (8.204) over serratus-wall-slide (8.007) | band-face-pull (8.040) over reverse-pec-deck (7.901) | reverse-pec-deck (7.891) over band-face-pull (7.870) | GOOD |

## Pain / Injury Review

Verdict: **TARGETED_FIX_REQUIRED_FOR_CALIBRATION_ONLY**. Hard contraindication works, moderate/current pain is visible and demotes relevant stress overlap, and unrelated pain does not hard-gate legal pools. The ID-derived chest-supported support bonus is resolved; remaining human review is needed for moderate-pain calibration before Session Composer.

| Scenario | Winner | Runner-Up | Contraindicated Rejections | Pain Effect | Verdict |
| --- | --- | --- | --- | --- | --- |
| shoulder push, no pain | dumbbell-bench-press / 7.961 | push-up / 7.930 | none | PAIN_SUITABLE; pain=8.20; joint=8.80 | GOOD |
| shoulder push, mild/current discomfort | push-up / 7.539 | machine-chest-press / 7.404 | none | PAIN_REQUIRES_REVIEW; pain=7.30; joint=7.20 | GOOD |
| low-back hinge, moderate pain | cable-pull-through / 7.456 | dumbbell-romanian-deadlift / 7.200 | none | PAIN_REQUIRES_REVIEW; pain=6.40; joint=6.00 | PLAUSIBLE_NEEDS_REVIEW |
| knee squat, historical sensitivity | goblet-squat / 7.931 | leg-press / 7.930 | none | PAIN_REQUIRES_REVIEW; pain=7.40; joint=7.40 | GOOD |
| hard contraindication | dumbbell-bench-press / 7.961 | machine-chest-press / 7.846 | push-up | PAIN_SUITABLE; pain=8.20; joint=8.80 | GOOD |

### ID_BASED_SUPPORT_BONUS_RESOLVED

Before behavior: in the full-gym low-back horizontal-pull contrast, `chest-supported-dumbbell-row` received `pain_suitability=9.200` while `machine-row` and `seated-cable-row` stayed at `8.200`, solely because the pain component checked the exercise ID for `chest-supported`.

After behavior: `machine-row`, `seated-cable-row`, and `chest-supported-dumbbell-row` all report `pain_suitability=8.200` when they have no lumbar pain-stressor overlap. Chest support and low trunk demand remain mechanical facts for traces/review, not positive pain score effects.

Ranking delta: low-back full-gym horizontal pull changed from `chest-supported-dumbbell-row` rank 1 / `8.176` to rank 3 / `8.102`; `machine-row` and `seated-cable-row` are now rank 1 and 2 at `8.104`; `one-arm-dumbbell-row` remains rank 4 / `7.616` because its structured stress tags overlap the lumbar concern.

Remaining pain P1: moderate-pain coefficient calibration is still unresolved and intentionally out of scope for this resolution.

## Experience / Capability Review

Verdict: **GOOD_WITH_REVIEW_CAVEATS**. Beginner does not become machine-only, advanced does not become unstable/free-weight-only, and capability traces distinguish phase_default, experience prior, assessment inference, and history inference. No prior is described as measured physical capability; direct observed capability remains not consumed.

| Persona | Experience | Equipment Env | Need | Winner | Legal Pool | Reasoning Focus |
| --- | --- | --- | --- | --- | --- | --- |
| beginner-gym-no-pain | beginner | commercial_gym | final-horizontal-push-main | machine-chest-press / 7.815 | 3 | beginner is not machine-only; equipment truth; phase 1 control |
| beginner-gym-shoulder-concern | beginner | commercial_gym | final-horizontal-push-main | machine-chest-press / 7.861 | 3 | assessment affects warmup and main work; mild discomfort is not a blanket hard gate |
| intermediate-gym-muscle-gain | intermediate | commercial_gym | final-horizontal-pull-main | machine-row / 8.069 | 4 | productive continuity; hypertrophy accessories; weekly exposure |
| advanced-gym-muscle-gain | advanced | commercial_gym | final-hinge-accessory | dumbbell-romanian-deadlift / 7.479 | 2 | advanced is not hardest-is-best; pain changes suitability and prescription |
| beginner-dumbbells-bench | beginner | home | final-horizontal-pull-main | chest-supported-dumbbell-row / 8.003 | 2 | free weights are legal when capability fits; bench support matters |
| intermediate-dumbbells | intermediate | home | final-horizontal-push-main | dumbbell-bench-press / 7.961 | 2 | dumbbell progression; loadability limits |
| dumbbells-without-bench | beginner | home | final-horizontal-pull-main | one-arm-dumbbell-row / 7.655 | 1 | bench-dependent exercises are illegal; floor/bodyweight alternatives remain possible |
| anchored-bands | beginner | home | final-scapular-activation | band-face-pull / 8.176 | 3 | anchor height matters; band rows and pulldowns can be represented |
| bands-without-anchor | beginner | travel | final-horizontal-pull-main | none | 0 | band ownership is not anchor capability; setup impossibility is hard eligibility |
| loop-bands-only | novice | travel | final-scapular-activation | serratus-wall-slide / 7.983 | 1 | loop bands differ from anchored tube bands; limited loading path |
| bodyweight | novice | home | final-horizontal-push-main | none | 0 | personal block is not contraindication; bodyweight-only constraints |
| mixed-home | intermediate | home | final-squat-main | goblet-squat / 8.110 | 1 | continuity vs replacement; mixed capability realism |

## History / Continuity Review

Verdict: **GOOD**. Productive + progression runway keeps the current exercise defensible; readyToProgress means same-exercise prescription progression, not replacement pressure. Plateau, failed progression, pain response, and blocked history now receive truthful reconsideration reason-code precedence while transitionRelationships still report automaticSelectionEffect=none.

| Scenario | Current | Transition Candidate | Current Rank | Candidate Rank | Continuity Raw | Reason Code | Evidence | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| no history | chest-supported-dumbbell-row | seated-cable-row | 3 / chest-supported-dumbbell-row / 8.065 | 2 / seated-cable-row / 8.069 | 5.600 | SCORE_NEUTRAL | Chest-Supported Dumbbell Row continuity evidence: retention=[none]; reconsideration=[none]. | GOOD: keep/progress remains defensible |
| productive + stable | chest-supported-dumbbell-row | seated-cable-row | 1 / chest-supported-dumbbell-row / 8.238 | 3 / seated-cable-row / 8.069 | 8.700 | CONTINUITY_FAVORED | Chest-Supported Dumbbell Row continuity evidence: retention=[current, productive, stable]; reconsideration=[none]. | GOOD: keep/progress remains defensible |
| readyToProgress + productive | chest-supported-dumbbell-row | seated-cable-row | 1 / chest-supported-dumbbell-row / 8.254 | 3 / seated-cable-row / 8.069 | 8.000 | CONTINUITY_FAVORED | Chest-Supported Dumbbell Row continuity evidence: retention=[current, productive]; reconsideration=[none]. | GOOD: keep/progress remains defensible |
| too easy + progression success | chest-supported-dumbbell-row | seated-cable-row | 1 / chest-supported-dumbbell-row / 8.293 | 3 / seated-cable-row / 8.069 | 8.700 | CONTINUITY_FAVORED | Chest-Supported Dumbbell Row continuity evidence: retention=[current, productive, stable]; reconsideration=[none]. | GOOD: keep/progress remains defensible |
| plateau + failed progression | chest-supported-dumbbell-row | seated-cable-row | 4 / chest-supported-dumbbell-row / 7.854 | 2 / seated-cable-row / 8.069 | 4.000 | REPLACEMENT_JUSTIFIED | Chest-Supported Dumbbell Row continuity evidence: retention=[current]; reconsideration=[plateaued, failed_progression]. Replacement consideration is justified; this component does not replace the exercise automatically. | GOOD: reconsideration evidence has reason-code precedence without automatic replacement |
| pain response + blocked | chest-supported-dumbbell-row | seated-cable-row | 4 / chest-supported-dumbbell-row / 7.871 | 2 / seated-cable-row / 8.069 | 2.100 | REPLACEMENT_JUSTIFIED | Chest-Supported Dumbbell Row continuity evidence: retention=[current]; reconsideration=[pain_response, blocked]. Replacement consideration is justified; this component does not replace the exercise automatically. | GOOD: reconsideration evidence has reason-code precedence without automatic replacement |

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

Purpose-evidence audit: edges=36; purposes=118; structurally_confirmed=63; contextual_intent=40; unknown_metadata=15; contradicted=0.

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

Contextual programming intent remains explicit and retains reviewed transition provenance without pretending to be an ordinal mechanics claim:
| Source | Target | Purpose | Status | Evidence |
| --- | --- | --- | --- | --- |
| ninety-ninety-breathing | dead-bug | movement_pattern_development | contextual_intent | movement roles: source=[anti_extension_core, breathing_position] -> target=[anti_extension_core]; contextual intent; transition note retained; review=accepted; provenance=[migrated from legacy cross-exercise progression edge] |
| ninety-ninety-breathing | dead-bug | preparation_to_loaded_training | contextual_intent | loadability: none -> limited (increase); contextual intent; transition note retained; review=accepted; provenance=[migrated from legacy cross-exercise progression edge] |
| serratus-wall-slide | band-face-pull | preparation_to_loaded_training | contextual_intent | loadability: limited -> limited (same); contextual intent; transition note retained; review=accepted; provenance=[migrated from legacy cross-exercise progression edge] |
| dead-bug | pallof-press | movement_pattern_development | contextual_intent | movement roles: source=[anti_extension_core] -> target=[anti_rotation_core]; contextual intent; transition note retained; review=accepted; provenance=[migrated from legacy cross-exercise progression edge] |
| dead-bug | ninety-ninety-breathing | pain_or_tolerance_regression | contextual_intent | external support: floor -> floor; body support: supine -> supine; trunk demand: moderate -> low (decrease); stability demand: moderate -> low (decrease); contextual intent; transition note retained; review=accepted; provenance=[migrated from legacy cross-exercise progression edge] |
| dead-bug | ninety-ninety-breathing | movement_pattern_development | contextual_intent | movement roles: source=[anti_extension_core] -> target=[anti_extension_core, breathing_position]; contextual intent; transition note retained; review=accepted; provenance=[migrated from legacy cross-exercise progression edge] |
| push-up | dumbbell-bench-press | increase_support | contextual_intent | external support: floor -> bench; body support: hands_supported -> supine; contextual intent; transition note retained; review=accepted; provenance=[migrated from legacy cross-exercise progression edge] |
| push-up | dumbbell-bench-press | stimulus_shift | contextual_intent | movement roles: source=[anti_extension_core, horizontal_push] -> target=[horizontal_push]; muscles: sourceOnly=[serratus, trunk]; targetOnly=[none]; loadability: moderate -> high (increase); contextual intent; transition note retained; review=accepted; provenance=[migrated from legacy cross-exercise progression edge] |
| push-up | machine-chest-press | increase_support | contextual_intent | external support: floor -> machine; body support: hands_supported -> seated_supported; contextual intent; transition note retained; review=accepted; provenance=[migrated from legacy cross-exercise progression edge] |
| push-up | machine-chest-press | pain_or_tolerance_regression | contextual_intent | external support: floor -> machine; body support: hands_supported -> seated_supported; trunk demand: moderate -> low (decrease); stability demand: moderate -> low (decrease); contextual intent; transition note retained; review=accepted; provenance=[migrated from legacy cross-exercise progression edge] |
| dumbbell-bench-press | machine-chest-press | increase_support | contextual_intent | external support: bench -> machine; body support: supine -> seated_supported; contextual intent; transition note retained; review=accepted; provenance=[migrated from legacy cross-exercise progression edge] |
| dumbbell-bench-press | machine-chest-press | pain_or_tolerance_regression | contextual_intent | external support: bench -> machine; body support: supine -> seated_supported; trunk demand: low -> low (same); stability demand: moderate -> low (decrease); contextual intent; transition note retained; review=accepted; provenance=[migrated from legacy cross-exercise progression edge] |
| machine-chest-press | dumbbell-bench-press | reduce_support | contextual_intent | external support: machine -> bench; body support: seated_supported -> supine; contextual intent; transition note retained; review=accepted; provenance=[migrated from legacy cross-exercise progression edge] |
| cable-chest-fly | machine-chest-press | stimulus_shift | contextual_intent | movement roles: source=[horizontal_push] -> target=[horizontal_push]; muscles: sourceOnly=[none]; targetOnly=[triceps]; loadability: moderate -> high (increase); contextual intent; transition note retained; review=needs_review; provenance=[migrated from legacy cross-exercise progression edge] |
| chest-supported-dumbbell-row | seated-cable-row | stimulus_shift | contextual_intent | movement roles: source=[horizontal_pull] -> target=[horizontal_pull]; muscles: sourceOnly=[none]; targetOnly=[none]; loadability: high -> high (same); contextual intent; transition note retained; review=accepted; provenance=[migrated from legacy cross-exercise progression edge] |
| one-arm-dumbbell-row | chest-supported-dumbbell-row | increase_support | contextual_intent | external support: bench -> bench; body support: hands_supported -> chest_supported; contextual intent; transition note retained; review=accepted; provenance=[migrated from legacy cross-exercise progression edge] |
| one-arm-dumbbell-row | chest-supported-dumbbell-row | pain_or_tolerance_regression | contextual_intent | external support: bench -> bench; body support: hands_supported -> chest_supported; trunk demand: high -> low (decrease); stability demand: high -> low (decrease); contextual intent; transition note retained; review=accepted; provenance=[migrated from legacy cross-exercise progression edge] |
| one-arm-dumbbell-row | seated-cable-row | increase_support | contextual_intent | external support: bench -> cable_or_band_anchor; body support: hands_supported -> seated_supported; contextual intent; transition note retained; review=accepted; provenance=[migrated from legacy cross-exercise progression edge] |
| machine-row | chest-supported-dumbbell-row | stimulus_shift | contextual_intent | movement roles: source=[horizontal_pull] -> target=[horizontal_pull]; muscles: sourceOnly=[none]; targetOnly=[none]; loadability: high -> high (same); contextual intent; transition note retained; review=accepted; provenance=[migrated from legacy cross-exercise progression edge] |
| machine-row | seated-cable-row | stimulus_shift | contextual_intent | movement roles: source=[horizontal_pull] -> target=[horizontal_pull]; muscles: sourceOnly=[none]; targetOnly=[none]; loadability: high -> high (same); contextual intent; transition note retained; review=accepted; provenance=[migrated from legacy cross-exercise progression edge] |
| seated-cable-row | chest-supported-dumbbell-row | stimulus_shift | contextual_intent | movement roles: source=[horizontal_pull] -> target=[horizontal_pull]; muscles: sourceOnly=[none]; targetOnly=[none]; loadability: high -> high (same); contextual intent; transition note retained; review=accepted; provenance=[migrated from legacy cross-exercise progression edge] |
| dumbbell-shoulder-press | serratus-wall-slide | preparation_to_loaded_training | contextual_intent | loadability: high -> limited (decrease); contextual intent; transition note retained; review=accepted; provenance=[migrated from legacy cross-exercise progression edge] |
| dumbbell-shoulder-press | serratus-wall-slide | pain_or_tolerance_regression | contextual_intent | external support: none -> wall; body support: standing -> standing; trunk demand: moderate -> low (decrease); stability demand: moderate -> low (decrease); contextual intent; transition note retained; review=accepted; provenance=[migrated from legacy cross-exercise progression edge] |
| goblet-squat | leg-press | increase_support | contextual_intent | external support: none -> machine; body support: standing -> seated_supported; contextual intent; transition note retained; review=accepted; provenance=[migrated from legacy cross-exercise progression edge] |
| goblet-squat | leg-press | stimulus_shift | contextual_intent | movement roles: source=[squat] -> target=[squat]; muscles: sourceOnly=[trunk]; targetOnly=[hamstrings]; loadability: moderate -> high (increase); contextual intent; transition note retained; review=accepted; provenance=[migrated from legacy cross-exercise progression edge] |
| goblet-squat | bodyweight-box-squat | increase_support | contextual_intent | external support: none -> box; body support: standing -> standing; contextual intent; transition note retained; review=accepted; provenance=[migrated from legacy cross-exercise progression edge] |
| goblet-squat | bodyweight-box-squat | pain_or_tolerance_regression | contextual_intent | external support: none -> box; body support: standing -> standing; trunk demand: moderate -> low (decrease); stability demand: moderate -> low (decrease); contextual intent; transition note retained; review=accepted; provenance=[migrated from legacy cross-exercise progression edge] |
| leg-press | goblet-squat | reduce_support | contextual_intent | external support: machine -> none; body support: seated_supported -> standing; contextual intent; transition note retained; review=accepted; provenance=[migrated from legacy cross-exercise progression edge] |
| bodyweight-box-squat | goblet-squat | reduce_support | contextual_intent | external support: box -> none; body support: standing -> standing; contextual intent; transition note retained; review=accepted; provenance=[migrated from legacy cross-exercise progression edge] |
| dumbbell-romanian-deadlift | cable-pull-through | pain_or_tolerance_regression | contextual_intent | external support: none -> cable_or_band_anchor; body support: standing -> standing; trunk demand: high -> moderate (decrease); stability demand: moderate -> moderate (same); contextual intent; transition note retained; review=accepted; provenance=[migrated from legacy cross-exercise progression edge] |
| cable-pull-through | dumbbell-romanian-deadlift | movement_pattern_development | contextual_intent | movement roles: source=[hinge] -> target=[hinge]; contextual intent; transition note retained; review=accepted; provenance=[migrated from legacy cross-exercise progression edge] |
| split-squat | step-up | movement_pattern_development | contextual_intent | movement roles: source=[single_leg, squat] -> target=[single_leg, squat]; contextual intent; transition note retained; review=accepted; provenance=[migrated from legacy cross-exercise progression edge] |
| split-squat | step-up | stimulus_shift | contextual_intent | movement roles: source=[single_leg, squat] -> target=[single_leg, squat]; muscles: sourceOnly=[hip_adductors]; targetOnly=[hamstrings]; loadability: moderate -> moderate (same); contextual intent; transition note retained; review=accepted; provenance=[migrated from legacy cross-exercise progression edge] |
| step-up | split-squat | movement_pattern_development | contextual_intent | movement roles: source=[single_leg, squat] -> target=[single_leg, squat]; contextual intent; transition note retained; review=accepted; provenance=[migrated from legacy cross-exercise progression edge] |
| step-up | split-squat | stimulus_shift | contextual_intent | movement roles: source=[single_leg, squat] -> target=[single_leg, squat]; muscles: sourceOnly=[hamstrings]; targetOnly=[hip_adductors]; loadability: moderate -> moderate (same); contextual intent; transition note retained; review=accepted; provenance=[migrated from legacy cross-exercise progression edge] |
| step-up | bodyweight-box-squat | pain_or_tolerance_regression | contextual_intent | external support: box -> box; body support: standing -> standing; trunk demand: moderate -> low (decrease); stability demand: moderate -> low (decrease); contextual intent; transition note retained; review=accepted; provenance=[migrated from legacy cross-exercise progression edge] |
| glute-bridge | dumbbell-romanian-deadlift | movement_pattern_development | contextual_intent | movement roles: source=[hinge] -> target=[hinge]; contextual intent; transition note retained; review=accepted; provenance=[migrated from legacy cross-exercise progression edge] |
| glute-bridge | dumbbell-romanian-deadlift | stimulus_shift | contextual_intent | movement roles: source=[hinge] -> target=[hinge]; muscles: sourceOnly=[none]; targetOnly=[mid_back]; loadability: moderate -> high (increase); contextual intent; transition note retained; review=accepted; provenance=[migrated from legacy cross-exercise progression edge] |
| pallof-press | dead-bug | movement_pattern_development | contextual_intent | movement roles: source=[anti_rotation_core] -> target=[anti_extension_core]; contextual intent; transition note retained; review=needs_review; provenance=[migrated from legacy cross-exercise progression edge] |
| pallof-press | dead-bug | pain_or_tolerance_regression | contextual_intent | external support: cable_or_band_anchor -> floor; body support: standing -> supine; trunk demand: high -> moderate (decrease); stability demand: moderate -> moderate (same); contextual intent; transition note retained; review=needs_review; provenance=[migrated from legacy cross-exercise progression edge] |

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
| Phase contrast horizontal push | Phase 1 should prefer usable control/support; Phase 3 should value loadable stimulus without hardest-is-best. | dumbbell-bench-press (8.024) over machine-chest-press (7.909) | machine-chest-press (7.815) over push-up (7.793) | phase_fit, loadability, stimulus_potential shift the winner across phases | phaseSuitability has meaningful influence and still needs human calibration | none | none | none | GOOD |
| Feature-specific serratus/protraction assessment | Identify feature relevance without conflating expression with feature difficulty. | band-face-pull | serratus-wall-slide | reviewed feature target fit affects assessment_fit; feature challenge remains not modeled | feature challenge remains unknown while target fit can still be selection-relevant | target=0.390; development=0.000; alignment=0.000 | none | none | GOOD |
| Ready-to-progress current row | Keep productive current exercise and progress prescription before replacement. | 1 / chest-supported-dumbbell-row / 8.254 | 3 / seated-cable-row / 8.069 | continuity_value and progression_value reward same-exercise runway | none | none | none | CONTINUITY_FAVORED | GOOD |
| Plateau/failed progression row | Replacement may become justified by real performance signal. | 2 / seated-cable-row / 8.069 | 4 / chest-supported-dumbbell-row / 7.854 | continuity/progression penalties reduce current exercise | transition edge remains knowledge-only | none | none | REPLACEMENT_JUSTIFIED | GOOD |

## Blocker Classification

### P0

- None found. Candidate Intelligence architecture can continue targeted review; no evidence showed hard eligibility/role truth collapse, nondeterminism, or assessment legalizing wrong-role candidates.

### P1

- Moderate pain calibration remains human-review-needed before a session composer can depend on candidate rank alone.
- Phase suitability carries meaningful rank influence and still needs human exercise-science calibration across full session context.

### P2

- Several non-row exercises still have unknown support or resistance-path metadata.
- Many upper-body exercises still need reviewed scapularMechanics profiles before fine feature selection can be high confidence.
- Catalog remains intentionally small; expansion should follow reviewed selection questions rather than broad migration.

## Readiness Rationale

The engine is not classified READY merely because tests are green. Legal candidate pools are truthful, deterministic ranking and DecisionTrace are strong, and progression/replacement semantics are now separated. The remaining P1 items would become harder to correct after Session Composer starts depending on candidate scores, so the correct next state is targeted fixes before composition.
