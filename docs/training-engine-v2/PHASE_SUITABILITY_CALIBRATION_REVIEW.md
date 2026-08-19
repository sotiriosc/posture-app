# Phase Suitability Calibration Review

`ENGINE_V2_BLUEPRINT.md` is authoritative. This report is deterministic audit and non-production sensitivity evidence. It does not change production phase scores, phase metadata, exercise metadata, weights, rankings, goal behavior, experience behavior, pain behavior, assessment behavior, continuity, prescription, Session Composer or Weekly Composer.

Fixed evaluation time: `2026-08-10T00:00:00.000Z`.

Production 22-scenario ranking fingerprint: `b17b55690f2d222f14975547f9663368c63b399f9052f8924d76583a8edf6e15` (matches the captured HEAD 7aa7ccd baseline).

Experimental phase-laboratory fingerprint: `df3b33a52aaa597f914b3f7cd4839314822d6ae04ebaf78088e56312b7b0c718`.

Phase audit classification: **PHASE_POLICY_READY_FOR_OWNER_DECISION**

This classification means the architecture and evidence are ready for the project owner to choose a policy. It does not mean a production phase policy was selected, implemented or approved.

## Owner Doctrine Used

- The user's enduring `CandidateRequest.goal` remains the goal in every phase.
- Phase describes developmental emphasis and programming context, not equipment identity or a replacement command.
- Every phase still requires a rational stimulus aligned with the user's goal.
- Productive legal exercises may cross phase boundaries through KEEP + PROGRESS.
- Candidate phase fit answers only how appropriate one legal candidate is for the current developmental phase.

## Phase Field-Consumption Inventory

| Input Field | Giver | Current Receiver | Current Output | Behavioral Effect | Trace Visibility | Status | Future Owner |
| --- | --- | --- | --- | --- | --- | --- | --- |
| PhaseIntent.id | THREE_PHASE_FOUNDATION -> CandidateRequest.phase | request interpreter, phaseFitComponent, assessment capability traces | phase id, annotation lookup, Phase 1/3 bonus branch, capability-prior label | selects the active phase annotation and phase-specific copied production branches | interpretedContext.phaseId and phase_fit reason; assessment evidence names the phase | FULLY_USED | Candidate Intelligence plus Session/Weekly Composer phase coherence |
| PhaseIntent.name | THREE_PHASE_FOUNDATION | none | none | none | absent from Candidate Intelligence output | UNUSED | adapter display and phase-plan explanation |
| PhaseIntent.primaryGoal | THREE_PHASE_FOUNDATION | none; goalFitComponent reads CandidateRequest.goal | none | does not overwrite or alter the enduring user goal | present only inside the serialized phase object on the request | UNUSED | phase-plan intent without replacing CandidateRequest.goal |
| PhaseIntent.developedQualities | THREE_PHASE_FOUNDATION | none | none | none at candidate scope | request input only | UNUSED | Session Composer, Weekly Composer and phase advancement |
| PhaseIntent.priorityMuscles | THREE_PHASE_FOUNDATION | none; eligibility and muscle_target_fit read CandidateNeed.targetMuscles | none | does not add muscle truth or duplicate request target-muscle scoring | request input only | UNUSED | Weekly Development Ledger target-band adjustment |
| capabilityExpectation.movementRoles | THREE_PHASE_FOUNDATION | none | none | does not legalize, reject or score a movement role | request input only | UNUSED | Session/Weekly Composer phase coverage |
| capabilityExpectation.control | THREE_PHASE_FOUNDATION | athleteCapability, featureDevelopment, phaseIntentDemandForDimension | weak phase capability prior and phase-intent demand | can change assessment/alignment influence when a relevant assessment exists | assessment demand/capability evidence | PARTIALLY_USED | candidate assessment context plus session prescription and advancement evidence |
| capabilityExpectation.stability | THREE_PHASE_FOUNDATION | stabilityFitComponent, athleteCapability, featureDevelopment | stability target and weak phase capability prior | changes stability_fit and can change bounded assessment/alignment influence | stability_fit reason and assessment capability evidence | PARTIALLY_USED | candidate fit, prescription and advancement evidence |
| capabilityExpectation.coordination | THREE_PHASE_FOUNDATION | athleteCapability and featureDevelopment | weak coordination/scapular capability prior | can change relevant assessment demand/capability reasoning | assessment capability evidence | PARTIALLY_USED | candidate fit, prescription and advancement evidence |
| capabilityExpectation.technicalComplexity | THREE_PHASE_FOUNDATION | none | none | does not alter skill_fit or eligibility | request input only | UNUSED | reviewed candidate challenge and prescription progression |
| progressionIntent.loading | THREE_PHASE_FOUNDATION | loadabilityComponent, phaseIntentDemandForDimension | phase loading target and assessment phase-intent demand | changes loadability and relevant assessment relationship values | loadability reason and assessment demand evidence | PARTIALLY_USED | candidate fit, prescription and weekly loading distribution |
| progressionIntent.effort | THREE_PHASE_FOUNDATION | none | none | does not affect candidate ranking | request input only | UNUSED | prescription and longitudinal adaptation |
| progressionIntent.preferredProgressionAxes | THREE_PHASE_FOUNDATION | progressionValueComponent | count of matching same-exercise progression axes | adds up to 2.2 raw progression_value without selecting a replacement | progression_value reason reports the match count | PARTIALLY_USED | same-exercise prescription progression |
| progressionIntent.exerciseContinuityDefault | THREE_PHASE_FOUNDATION | none | none | Phase 3 review_for_phase_fit creates no replacement pressure | request input only | UNUSED | reviewed composition/transition policy with KEEP + PROGRESS precedence |
| advancementCriteria[].description | THREE_PHASE_FOUNDATION | none | none | none | request input only | UNUSED | future phase advancement evaluator |
| advancementCriteria[].evidenceSignals | THREE_PHASE_FOUNDATION | none | none | none | request input only | UNUSED | future evidence-based phase advancement evaluator |
| advancementCriteria[].blockingSignals | THREE_PHASE_FOUNDATION | none | none | none | request input only | UNUSED | future evidence-based phase advancement evaluator |
| PhaseState.currentPhaseId | CurrentTrainingState | foundation validation only; CandidateRequest receives PhaseIntent directly | valid/invalid known phase id | does not enter Candidate Intelligence ranking | validation result, not candidate trace | PARTIALLY_USED | input adapter and phase-state/intent resolver |
| PhaseState.weekInPhase | CurrentTrainingState | none | none | calendar time does not alter ranking or advance phase | absent | UNUSED | phase advancement context, never sole advancement authority |
| PhaseState.metCriterionIds | CurrentTrainingState | none | none | none | absent | UNUSED | future phase advancement evaluator |
| PhaseState.blockedCriterionIds | CurrentTrainingState | none | none | none | absent | UNUSED | future phase advancement evaluator |
| ExerciseDefinition.phaseSuitability[phase].suitability | reference exercise curator | phaseFitComponent | categorical base 8.8/7.8/6.2 or 5.5 fallback | changes phase_fit for a legal candidate; never changes eligibility | phase_fit reason names the active category | FULLY_USED | reviewed Candidate Intelligence phase preference |
| ExerciseDefinition.phaseSuitability[phase].reason | reference exercise curator | none | none | prose changes do not alter scoring | not copied into phase_fit reason or DecisionTrace | UNUSED | curation explanation and reviewer-facing provenance |
| ExerciseDefinition.phaseSuitability provenance/review status | not represented in current schema | none | none | all categories execute without a phase-specific evidence-quality qualifier | absent | UNUSED | future reviewed phase-annotation contract |

Key inventory findings:

- `PhaseIntent.primaryGoal`, `developedQualities`, `priorityMuscles`, capability movement roles, technical complexity, effort, continuity default and all advancement content have no Candidate Intelligence behavior.
- `PhaseState` is not a CandidateRequest input. Only `currentPhaseId` is checked by foundation validation; week and criterion state do not rank candidates or advance a phase.
- Capability control/stability/coordination and loading intent influence more than `phase_fit`: they also enter stability, loadability and assessment demand/capability reasoning.
- `exerciseContinuityDefault=review_for_phase_fit` in Phase 3 is currently inert. Treating it later as replacement pressure would conflict with KEEP + PROGRESS.
- Exercise phase reason prose is non-executable and absent from the score trace; phase-specific provenance/review status is not represented in the schema.

## Current Production Formula

| Term | Raw Value | Aggregate Effect |
| --- | --- | --- |
| excellent | 8.800 | 0.543210 |
| good | 7.800 | 0.481481 |
| possible | 6.200 | 0.382716 |
| unspecified/fallback | 5.500 | 0.339506 |
| Phase 3 + high loadability | +0.800 | 0.049383 |
| Phase 1 + low skill + stability not high | +0.500 | 0.030864 |

Configured family weight is **1.00**. The 18 emitted components have total configured weight **16.2**, so the exact normalized phase weight is **1/16.2 = 0.061728395** (the trace stores 0.061728). Maximum raw phase_fit is **9.6**; its exact maximum aggregate contribution is **0.592593**. The full fallback-to-maximum aggregate spread is **0.253086**.

## Responsibility And Double-Count Audit

| Compared Facts | Classification | Finding |
| --- | --- | --- |
| phase_fit Phase 3 high-loadability bonus vs loadability | ACTUAL_DOUBLE_COUNT | Both components read exercise.loading.loadability; high loadability receives its normal loadability value and an extra +0.8 raw phase_fit in Phase 3. |
| phase_fit Phase 3 high-loadability bonus vs stimulus_potential | POTENTIAL_DOUBLE_COUNT | stimulus_potential reads loadingPotential rather than loadability, but the two catalog fields and phase rationale often express the same productive-stimulus story. |
| phase_fit Phase 1 low-skill bonus vs skill_fit | ACTUAL_DOUBLE_COUNT | The exact loading.skillDemand fact affects skill_fit and directly adds +0.5 phase_fit when the Phase 1 branch also passes stability. |
| phase_fit Phase 1 stability condition vs stability_fit | ACTUAL_DOUBLE_COUNT | The exact loading.stabilityDemand fact gates the Phase 1 bonus and is independently compared with phase capability in stability_fit. |
| phase_fit Phase 1 skill condition vs experience_fit | POTENTIAL_DOUBLE_COUNT | experience_fit averages skill and coordination demand, so the Phase 1 skill branch can reinforce an already favorable athlete-demand comparison. |
| curated phaseSuitability vs loadability/support/skill/stability/progression facts | POTENTIAL_DOUBLE_COUNT | Many annotation reasons explicitly cite load, support, control, setup or progression while dedicated components score those structured fields; prose is non-executable, but the curated category may encode the same judgment. |
| progressionIntent.preferredProgressionAxes vs progression_value | INTENTIONAL_DISTINCT_SIGNAL | This is the explicit receiver for same-exercise phase progression runway and does not create hidden replacement pressure. |
| PhaseIntent.priorityMuscles vs CandidateNeed.targetMuscles/muscle_target_fit | UNUSED_SEMANTIC | Phase priority muscles are not consumed, so request target-muscle truth remains authoritative and is not currently double counted. |
| PhaseIntent.primaryGoal vs CandidateRequest.goal/goal_fit | UNUSED_SEMANTIC | Phase primaryGoal has no behavioral receiver; CandidateRequest.goal remains the scoring authority, avoiding silent goal replacement but leaving conceptual naming ambiguity. |
| phase_fit vs assessment_fit | INTENTIONAL_DISTINCT_SIGNAL | phase_fit scores candidate phase preference; relevant assessment traces may separately use phase capability priors to judge developmental context. |
| phase_fit vs goal_fit and muscle_target_fit | INTENTIONAL_DISTINCT_SIGNAL | The enduring request goal and requested muscles remain separate authorities; phase category does not create either truth. |
| phase change vs transition relationships | NOT_APPLICABLE | Transition relationships are observational and never read phase; phase movement cannot activate automatic replacement. |

The explicit Phase 3 loadability branch and Phase 1 skill/stability branch are actual repeated consumption of the same structured facts. Correlation with stimulus, experience and curated annotation rationale is potential rather than automatically actual double counting. Goal, muscle and assessment remain distinct authorities.

## Reference-Catalog Phase Audit

Catalog classifications: WELL_JUSTIFIED=34; PLAUSIBLE_NEEDS_REVIEW=8; ARBITRARY_OR_UNDERSPECIFIED=3; CONTRADICTORY=0. These are audit judgments about internal coherence, not missing provenance supplied after the fact.

| Exercise | Training Roles | Movement Roles | Section Suitability | Phase 1 | Phase 2 | Phase 3 | Loadability | Skill | Stability | Coordination | Progression Axes | Continuity Potential | Assessment Feature Role | Phase Provenance / Review | Classification | Audit Reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ninety-ninety-breathing / 90/90 Breathing | preparation, recovery | breathing_position, anti_extension_core | warmup:excellent, cooldown:good | excellent: Directly supports control and position. | good: Useful when assessment priorities remain relevant. | possible: Useful as targeted preparation, not a main stimulus. | none | low | low | low | tempo, range | same-exercise progression runway present | none modeled | phase-specific provenance/review status not modeled; reason prose only | WELL_JUSTIFIED | Control/preparation emphasis and declining main-stimulus relevance are internally coherent. |
| serratus-wall-slide / Serratus Wall Slide | activation, preparation | scapular_control | warmup:good, activation:excellent | excellent: Useful for control development. | good: Useful as preparation before higher loading. | possible: Useful when shoulder control remains a priority. | limited | low | low | moderate | range, tempo | same-exercise progression runway present | serratus=high, upward_rotation=high, retraction=low, external_rotation=low, loaded_stability=low, profile=needs_review | phase-specific provenance/review status not modeled; reason prose only | WELL_JUSTIFIED | Control-first preparation role and limited loading support the ordered annotations. |
| dead-bug / Dead Bug | activation, hypertrophy_accessory | anti_extension_core | activation:excellent, accessory:good | excellent: Direct control exercise. | good: Can progress with tempo or range. | possible: Useful for targeted trunk control. | limited | low | moderate | moderate | range, tempo, complexity | same-exercise progression runway present | none modeled | phase-specific provenance/review status not modeled; reason prose only | WELL_JUSTIFIED | Control emphasis and bounded progression runway support strong early-phase fit. |
| push-up / Push-Up | primary_strength, secondary_strength, hypertrophy_accessory | horizontal_push, anti_extension_core | main:good, accessory:good | possible: Appropriate if supported or regressed. | good: Good continuity exercise when progression remains available. | possible: May need loading or variation for sufficient stimulus. | moderate | moderate | moderate | low | reps, sets, tempo, support_reduction | same-exercise progression runway present | serratus=moderate, upward_rotation=low, retraction=low, external_rotation=low, loaded_stability=moderate, profile=needs_review | phase-specific provenance/review status not modeled; reason prose only | WELL_JUSTIFIED | Prerequisite/control needs and moderate load ceiling support possible-good-possible. |
| dumbbell-bench-press / Dumbbell Bench Press | primary_strength, secondary_strength | horizontal_push | main:excellent, accessory:good | possible: Can be used with light loading and support. | excellent: Strong progression path. | excellent: Excellent continuity candidate with load or volume progression. | high | moderate | moderate | moderate | load, reps, sets, tempo | same-exercise progression runway present | none modeled | phase-specific provenance/review status not modeled; reason prose only | WELL_JUSTIFIED | Supported loadable pressing and clear progression support later-phase continuity. |
| machine-chest-press / Machine Chest Press | primary_strength, secondary_strength | horizontal_push | main:good, accessory:good | good: Support can reduce coordination demand. | good: Load progression is clear. | good: Useful when machine path fits the athlete. | high | low | low | low | load, reps, sets | same-exercise progression runway present | none modeled | phase-specific provenance/review status not modeled; reason prose only | PLAUSIBLE_NEEDS_REVIEW | All-good treatment is plausible, but phase distinctions and machine-fit evidence are under-specified. |
| cable-chest-fly / Cable Chest Fly | hypertrophy_accessory | accessory | accessory:excellent | possible: Use cautiously if shoulder control is limited. | good: Useful accessory volume. | excellent: High-value hypertrophy accessory. | moderate | moderate | moderate | moderate | reps, sets, tempo, range | same-exercise progression runway present | none modeled | phase-specific provenance/review status not modeled; reason prose only | WELL_JUSTIFIED | Accessory hypertrophy role and shoulder-control caveat support increasing phase fit. |
| chest-supported-dumbbell-row / Chest-Supported Dumbbell Row | primary_strength, secondary_strength | horizontal_pull | main:excellent, accessory:good | good: Support reduces setup and trunk demand. | excellent: Clear load progression. | excellent: Strong continuity candidate. | high | low | low | low | load, reps, sets, tempo | same-exercise progression runway present | serratus=low, upward_rotation=low, retraction=moderate, external_rotation=low, loaded_stability=moderate, profile=needs_review | phase-specific provenance/review status not modeled; reason prose only | PLAUSIBLE_NEEDS_REVIEW | Support and progression rationale are plausible but duplicate dedicated facts and lack phase provenance. |
| one-arm-dumbbell-row / One-Arm Dumbbell Row | primary_strength, secondary_strength | horizontal_pull | main:good, accessory:good | possible: May need support and conservative loading. | good: Progression-friendly home or gym row. | excellent: Useful loadable pull when setup fits. | high | moderate | high | moderate | load, reps, sets, tempo | same-exercise progression runway present | serratus=low, upward_rotation=low, retraction=moderate, external_rotation=low, loaded_stability=high, profile=needs_review | phase-specific provenance/review status not modeled; reason prose only | PLAUSIBLE_NEEDS_REVIEW | Increasing fit is plausible, but high trunk/stability demand and phase rationale need review. |
| machine-row / Machine Row | primary_strength, secondary_strength | horizontal_pull | main:excellent, accessory:good | good: Guided setup can reduce coordination demand. | excellent: Clear load progression. | good: Strong stimulus if the machine path fits the athlete. | high | low | low | low | load, reps, sets | same-exercise progression runway present | serratus=low, upward_rotation=low, retraction=moderate, external_rotation=low, loaded_stability=moderate, profile=needs_review | phase-specific provenance/review status not modeled; reason prose only | ARBITRARY_OR_UNDERSPECIFIED | Phase 2 excellent versus Phase 3 good is justified by machine fit rather than a clearly phase-specific fact. |
| seated-cable-row / Seated Cable Row | primary_strength, secondary_strength | horizontal_pull | main:excellent, accessory:good | good: Predictable path and setup. | excellent: Progression-friendly. | good: Useful when cable station is practical. | high | low | low | low | load, reps, sets | same-exercise progression runway present | serratus=low, upward_rotation=low, retraction=moderate, external_rotation=low, loaded_stability=moderate, profile=needs_review | phase-specific provenance/review status not modeled; reason prose only | ARBITRARY_OR_UNDERSPECIFIED | Phase 2 excellent versus Phase 3 good lacks a reviewed developmental distinction. |
| band-row / Band Row | activation, hypertrophy_accessory, secondary_strength | horizontal_pull | activation:good, accessory:good | excellent: Accessible row pattern when anchor is available. | good: Useful when load needs are modest. | possible: May be limited by loading potential. | limited | low | low | low | reps, sets, tempo | same-exercise progression runway present | serratus=low, upward_rotation=low, retraction=moderate, external_rotation=low, loaded_stability=low, profile=needs_review | phase-specific provenance/review status not modeled; reason prose only | WELL_JUSTIFIED | Accessible patterning and limited loading support declining later-phase preference. |
| dumbbell-shoulder-press / Dumbbell Shoulder Press | primary_strength, secondary_strength | vertical_push | main:good, accessory:good | possible: Usually requires review of range and support. | good: Useful if overhead control is established. | excellent: Strong loadability for vertical push stimulus. | high | moderate | moderate | moderate | load, reps, sets | same-exercise progression runway present | serratus=moderate, upward_rotation=high, retraction=low, external_rotation=moderate, loaded_stability=high, profile=needs_review | phase-specific provenance/review status not modeled; reason prose only | WELL_JUSTIFIED | Range/control prerequisite and high loadability support increasing fit. |
| lat-pulldown / Lat Pulldown | primary_strength, secondary_strength | vertical_pull | main:excellent, accessory:good | good: Stable path can support skill acquisition. | excellent: Clear progression route. | excellent: High-value back stimulus. | high | low | low | low | load, reps, sets | same-exercise progression runway present | none modeled | phase-specific provenance/review status not modeled; reason prose only | WELL_JUSTIFIED | Stable early acquisition and clear load progression support good-excellent-excellent, subject to the catalog-wide provenance gap. |
| band-lat-pulldown / Band Lat Pulldown | activation, hypertrophy_accessory, secondary_strength | vertical_pull | activation:good, accessory:good | good: Accessible vertical pull pattern if anchor exists. | possible: Loadability may limit stimulus. | possible: Usually accessory or travel option. | limited | low | low | low | reps, sets, tempo | same-exercise progression runway present | none modeled | phase-specific provenance/review status not modeled; reason prose only | WELL_JUSTIFIED | Accessible early exposure and limited loadability support later possible ratings. |
| goblet-squat / Goblet Squat | primary_strength, secondary_strength | squat, knee_dominant | main:excellent, accessory:good | good: Teaches squat with manageable load. | excellent: Progression-friendly until load ceiling. | possible: May be load-limited for advanced users. | moderate | low | moderate | low | load, reps, range, sets | same-exercise progression runway present | none modeled | phase-specific provenance/review status not modeled; reason prose only | WELL_JUSTIFIED | Manageable early loading and later load ceiling support good-excellent-possible. |
| leg-press / Leg Press | primary_strength, secondary_strength | knee_dominant | main:excellent, accessory:good | possible: Use range and load conservatively. | excellent: Useful capacity builder. | excellent: High-stimulus lower-body option. | high | low | low | low | load, reps, sets, range | same-exercise progression runway present | none modeled | phase-specific provenance/review status not modeled; reason prose only | WELL_JUSTIFIED | Conservative early use and later high stimulus support possible-excellent-excellent. |
| bodyweight-box-squat / Bodyweight Box Squat | preparation, activation, secondary_strength | squat, knee_dominant | warmup:good, activation:good, accessory:possible | excellent: Range and support are easy to control. | possible: Often becomes too low stimulus. | possible: Mostly preparation or deload context. | limited | low | low | low | range, reps, tempo | same-exercise progression runway present | none modeled | phase-specific provenance/review status not modeled; reason prose only | WELL_JUSTIFIED | Controllable early range and low stimulus ceiling support excellent-possible-possible. |
| dumbbell-romanian-deadlift / Dumbbell Romanian Deadlift | primary_strength, secondary_strength | hinge | main:excellent, accessory:good | possible: Appropriate only if hinge control is present. | excellent: Strong progression path. | excellent: Productive posterior-chain stimulus. | high | moderate | moderate | moderate | load, reps, sets, range | same-exercise progression runway present | none modeled | phase-specific provenance/review status not modeled; reason prose only | WELL_JUSTIFIED | Control prerequisite and strong progression runway support later excellent fit. |
| cable-pull-through / Cable Pull-Through | activation, secondary_strength, hypertrophy_accessory | hinge | activation:good, accessory:good | good: Good hinge teaching tool. | good: Useful accessory or hinge regression. | possible: May be too setup-limited for primary work. | moderate | low | moderate | low | load, reps, range | same-exercise progression runway present | none modeled | phase-specific provenance/review status not modeled; reason prose only | WELL_JUSTIFIED | Teaching value and moderate loading ceiling support good-good-possible. |
| split-squat / Split Squat | secondary_strength, hypertrophy_accessory | single_leg, knee_dominant | main:possible, accessory:excellent | possible: Support may be needed. | good: Progresses single-leg strength. | excellent: Strong accessory stimulus. | moderate | moderate | moderate | moderate | load, reps, range, support_reduction | same-exercise progression runway present | none modeled | phase-specific provenance/review status not modeled; reason prose only | WELL_JUSTIFIED | Scalable support and productive accessory runway support increasing phase fit. |
| step-up / Step-Up | secondary_strength, hypertrophy_accessory | single_leg, knee_dominant | accessory:excellent, activation:possible | good: Height and support can be scaled. | good: Useful unilateral volume. | good: Useful accessory when loadability is enough. | moderate | moderate | moderate | moderate | load, range, reps | same-exercise progression runway present | none modeled | phase-specific provenance/review status not modeled; reason prose only | PLAUSIBLE_NEEDS_REVIEW | All-good treatment preserves continuity but does not explain phase-specific developmental preference. |
| lying-leg-curl / Lying Leg Curl | hypertrophy_accessory | accessory | accessory:excellent | possible: Useful if simple machine setup fits. | good: Supports posterior-chain volume. | excellent: High-value hypertrophy accessory. | high | low | low | low | load, reps, sets, tempo | same-exercise progression runway present | none modeled | phase-specific provenance/review status not modeled; reason prose only | WELL_JUSTIFIED | Simple setup and direct hypertrophy role support increasing later-phase relevance. |
| glute-bridge / Glute Bridge | activation, hypertrophy_accessory | accessory | activation:excellent, accessory:good | excellent: Accessible glute and pelvic-control option. | good: Can progress with load or band. | possible: May need stronger loading path. | moderate | low | low | low | load, reps, sets, tempo | same-exercise progression runway present | none modeled | phase-specific provenance/review status not modeled; reason prose only | WELL_JUSTIFIED | Accessible control and later loading ceiling support excellent-good-possible. |
| dumbbell-lateral-raise / Dumbbell Lateral Raise | hypertrophy_accessory | accessory | accessory:excellent | possible: Use light load and owned range. | good: Useful delt volume. | excellent: High-value hypertrophy accessory. | moderate | low | low | low | reps, sets, tempo, load | same-exercise progression runway present | none modeled | phase-specific provenance/review status not modeled; reason prose only | WELL_JUSTIFIED | Optional early use and direct later hypertrophy role support increasing fit. |
| reverse-pec-deck / Reverse Pec Deck | hypertrophy_accessory, activation | scapular_control | activation:good, accessory:excellent | good: Stable setup for scapular work. | good: Useful upper-back accessory. | excellent: High-value rear-delt accessory. | moderate | low | low | low | load, reps, sets, tempo | same-exercise progression runway present | serratus=low, upward_rotation=low, retraction=moderate, external_rotation=low, loaded_stability=moderate, profile=needs_review | phase-specific provenance/review status not modeled; reason prose only | PLAUSIBLE_NEEDS_REVIEW | Stable setup and hypertrophy role are plausible, but early activation versus accessory intent needs review. |
| band-face-pull / Band Face Pull | activation, hypertrophy_accessory | scapular_control | activation:excellent, accessory:good | excellent: Strong control and preparation fit. | good: Useful between pressing volume. | possible: Accessory if loadability is enough. | limited | low | low | moderate | reps, sets, tempo | same-exercise progression runway present | serratus=low, upward_rotation=low, retraction=high, external_rotation=moderate, loaded_stability=moderate, profile=needs_review | phase-specific provenance/review status not modeled; reason prose only | WELL_JUSTIFIED | Preparation/control value and limited loading support declining later-phase preference. |
| dumbbell-curl / Dumbbell Curl | hypertrophy_accessory | accessory | accessory:excellent | possible: Optional accessory. | good: Adds arm volume. | excellent: Useful hypertrophy accessory. | moderate | low | low | low | load, reps, sets, tempo | same-exercise progression runway present | none modeled | phase-specific provenance/review status not modeled; reason prose only | PLAUSIBLE_NEEDS_REVIEW | Increasing accessory relevance is plausible, but phase rather than session/goal ownership is unclear. |
| cable-triceps-pressdown / Cable Triceps Pressdown | hypertrophy_accessory | accessory | accessory:excellent | possible: Optional accessory. | good: Useful pressing support volume. | excellent: High-value arm accessory. | moderate | low | low | low | load, reps, sets, tempo | same-exercise progression runway present | none modeled | phase-specific provenance/review status not modeled; reason prose only | PLAUSIBLE_NEEDS_REVIEW | Increasing accessory relevance is plausible, but phase rather than session/goal ownership is unclear. |
| pallof-press / Pallof Press | activation, hypertrophy_accessory | anti_rotation_core | activation:excellent, accessory:good | excellent: Strong control exercise. | good: Useful accessory and preparation. | good: Can remain as targeted trunk work. | moderate | low | moderate | low | load, reps, tempo, stability | same-exercise progression runway present | none modeled | phase-specific provenance/review status not modeled; reason prose only | PLAUSIBLE_NEEDS_REVIEW | Continued targeted trunk work is plausible, but good Phase 3 fit needs reviewed phase-specific rationale. |
| forearm-plank / Forearm Plank | activation, hypertrophy_accessory | anti_extension_core | activation:excellent, accessory:good | good: Legacy migration value for early control work. | possible: Legacy migration value for accessory use. | possible: Legacy migration value pending contextual evidence. | limited | low | moderate | low | duration, lever, support_reduction, effort | same-exercise progression runway present | none modeled | phase-specific provenance/review status not modeled; reason prose only | WELL_JUSTIFIED | Scoped Phase 1 activation is owner-approved; later global migration values are non-authoritative. |
| forearm-side-plank / Forearm Side Plank | activation, hypertrophy_accessory | anti_lateral_flexion_core | activation:excellent, accessory:good | good: Legacy migration value for early lateral control. | possible: Legacy migration value for accessory use. | possible: Legacy migration value pending contextual evidence. | limited | low | moderate | low | duration, lever, support_reduction, load, effort | same-exercise progression runway present | none modeled | phase-specific provenance/review status not modeled; reason prose only | WELL_JUSTIFIED | Scoped Phase 1 lateral-control activation is owner-approved; later values remain non-scoring. |
| machine-abdominal-crunch / Machine Abdominal Crunch | hypertrophy_accessory, secondary_strength | trunk_flexion | accessory:excellent | possible: Legacy migration value pending contextual evidence. | possible: Legacy migration value pending contextual evidence. | good: Legacy migration value for direct hypertrophy use. | high | low | low | low | load, reps, sets, range, tempo | same-exercise progression runway present | none modeled | phase-specific provenance/review status not modeled; reason prose only | ARBITRARY_OR_UNDERSPECIFIED | No contextual annotation is accepted; direct hypertrophy utility is not independent phase evidence. |
| half-kneeling-high-to-low-cable-chop / Half-Kneeling High-to-Low Cable Chop | activation, hypertrophy_accessory, secondary_strength | trunk_rotation | activation:good, accessory:excellent | possible: Legacy migration value for controlled activation use. | good: Legacy migration value for loaded rotational capacity. | possible: Legacy migration value pending contextual evidence. | moderate | moderate | moderate | moderate | load, reps, sets, range, tempo | same-exercise progression runway present | none modeled | phase-specific provenance/review status not modeled; reason prose only | WELL_JUSTIFIED | Scoped Phase 2 controlled-rotation capacity evidence is owner-approved. |
| farmer-carry / Farmer Carry | capacity, hypertrophy_accessory, secondary_strength | carry, loaded_bracing | main:good, accessory:good | possible: Legacy migration value pending contextual evidence. | good: Legacy migration value for loaded capacity. | possible: Legacy migration value pending contextual evidence. | high | moderate | moderate | moderate | load, distance, trips, duration, effort | same-exercise progression runway present | none modeled | phase-specific provenance/review status not modeled; reason prose only | WELL_JUSTIFIED | Scoped Phase 2 capacity-main evidence is owner-approved. |
| suitcase-carry / Suitcase Carry | capacity, hypertrophy_accessory, secondary_strength | carry, anti_lateral_flexion_core, loaded_bracing | main:good, accessory:good | possible: Legacy migration value pending contextual evidence. | good: Legacy migration value for unilateral loaded capacity. | possible: Legacy migration value pending contextual evidence. | high | moderate | moderate | moderate | load, distance, trips, duration, effort | same-exercise progression runway present | none modeled | phase-specific provenance/review status not modeled; reason prose only | WELL_JUSTIFIED | Scoped Phase 2 unilateral capacity-main evidence is owner-approved. |
| wall-supported-suitcase-march / Wall-Supported Suitcase March | activation, capacity | loaded_bracing | activation:excellent, accessory:good | good: Legacy migration value for supported control. | possible: Legacy migration value pending contextual evidence. | possible: Legacy migration remains unknown rather than poor. | moderate | low | moderate | moderate | load, steps, duration, support_reduction, effort | same-exercise progression runway present | none modeled | phase-specific provenance/review status not modeled; reason prose only | WELL_JUSTIFIED | Scoped Phase 1 supported loaded-bracing activation is owner-approved. |
| standing-calf-raise / Standing Calf Raise | hypertrophy_accessory | accessory | accessory:excellent | unspecified: no annotation | unspecified: no annotation | unspecified: no annotation | moderate | low | moderate | low | load, reps, sets, range, tempo, support_reduction, stability | same-exercise progression runway present | none modeled | phase-specific provenance/review status not modeled; reason prose only | WELL_JUSTIFIED | Contextual phase abstention preserves direct accessory ownership without inventing a phase vote. |
| side-lying-hip-adduction / Side-Lying Hip Adduction | activation, hypertrophy_accessory | accessory | activation:good, accessory:good | unspecified: no annotation | unspecified: no annotation | unspecified: no annotation | limited | low | low | moderate | reps, sets, range, tempo, lever | same-exercise progression runway present | none modeled | phase-specific provenance/review status not modeled; reason prose only | WELL_JUSTIFIED | Contextual phase abstention leaves direct adduction relevance to the requested need. |
| loop-band-lateral-walk / Loop-Band Lateral Walk | activation, hypertrophy_accessory | accessory | activation:good, accessory:good | unspecified: no annotation | unspecified: no annotation | unspecified: no annotation | limited | moderate | moderate | moderate | load, steps, sets, range, tempo, effort, support_reduction | same-exercise progression runway present | none modeled | phase-specific provenance/review status not modeled; reason prose only | WELL_JUSTIFIED | Contextual phase abstention leaves direct abduction relevance to the requested need and equipment. |
| side-lying-dumbbell-external-rotation / Side-Lying Dumbbell External Rotation | activation, hypertrophy_accessory | accessory | activation:good, accessory:good | unspecified: no annotation | unspecified: no annotation | unspecified: no annotation | limited | moderate | low | moderate | load, reps, sets, range, tempo | same-exercise progression runway present | none modeled | phase-specific provenance/review status not modeled; reason prose only | WELL_JUSTIFIED | Contextual phase abstention leaves direct cuff relevance to action and muscle ownership. |
| supine-hamstring-walkout / Supine Hamstring Walkout | activation, hypertrophy_accessory | accessory | activation:good, accessory:good | unspecified: no annotation | unspecified: no annotation | unspecified: no annotation | limited | moderate | moderate | moderate | steps, reps, sets, range, tempo, duration, lever | same-exercise progression runway present | none modeled | phase-specific provenance/review status not modeled; reason prose only | WELL_JUSTIFIED | Contextual phase abstention avoids treating home equipment fit as phase evidence. |
| wall-ankle-dorsiflexion-rock / Wall Ankle Dorsiflexion Rock | preparation | mobility | warmup:good | unspecified: no annotation | unspecified: no annotation | unspecified: no annotation | none | low | low | low | range, reps, tempo, duration | same-exercise progression runway present | none modeled | phase-specific provenance/review status not modeled; reason prose only | WELL_JUSTIFIED | Contextual phase abstention leaves ankle preparation to an explicit dependency. |
| bodyweight-hip-hinge-rehearsal / Bodyweight Hip-Hinge Rehearsal | preparation, activation | hinge | warmup:excellent, activation:good | unspecified: no annotation | unspecified: no annotation | unspecified: no annotation | none | low | low | moderate | range, reps, tempo, support_reduction, coordination | same-exercise progression runway present | none modeled | phase-specific provenance/review status not modeled; reason prose only | WELL_JUSTIFIED | Contextual phase abstention leaves unloaded hinge rehearsal to role and section context. |
| single-leg-balance-rehearsal / Single-Leg Balance Rehearsal | preparation, activation | single_leg | warmup:good, activation:good | unspecified: no annotation | unspecified: no annotation | unspecified: no annotation | none | moderate | high | moderate | duration, reps, support_reduction, range, stability, coordination | same-exercise progression runway present | none modeled | phase-specific provenance/review status not modeled; reason prose only | WELL_JUSTIFIED | Contextual phase abstention leaves stance-control preparation to an explicit need. |

No phase annotation has a phase-specific provenance or review-status field. Existing reason text cannot substitute for that contract and is not read by scoring.

## Phase-Only Controlled Matrix

Only `CandidateRequest.phase` changes within each three-row need group. Athlete, intermediate experience, enduring goal, full-gym equipment, training need, assessment, pain, history, continuity, fatigue, prerequisites and evaluation time remain fixed.

| Need | Goal | Phase | Winner | Runner-Up | Legal Candidates |
| --- | --- | --- | --- | --- | --- |
| horizontal push main | strength | phase_1 | machine-chest-press | push-up | machine-chest-press, push-up, dumbbell-bench-press |
| horizontal push main | strength | phase_2 | dumbbell-bench-press | push-up | dumbbell-bench-press, push-up, machine-chest-press |
| horizontal push main | strength | phase_3 | dumbbell-bench-press | machine-chest-press | dumbbell-bench-press, machine-chest-press, push-up |
| horizontal pull main | strength | phase_1 | chest-supported-dumbbell-row | machine-row | chest-supported-dumbbell-row, machine-row, seated-cable-row, one-arm-dumbbell-row |
| horizontal pull main | strength | phase_2 | machine-row | seated-cable-row | machine-row, seated-cable-row, chest-supported-dumbbell-row, one-arm-dumbbell-row |
| horizontal pull main | strength | phase_3 | chest-supported-dumbbell-row | machine-row | chest-supported-dumbbell-row, machine-row, seated-cable-row, one-arm-dumbbell-row |
| vertical push secondary | strength | phase_1 | dumbbell-shoulder-press | none | dumbbell-shoulder-press |
| vertical push secondary | strength | phase_2 | dumbbell-shoulder-press | none | dumbbell-shoulder-press |
| vertical push secondary | strength | phase_3 | dumbbell-shoulder-press | none | dumbbell-shoulder-press |
| vertical pull secondary | strength | phase_1 | lat-pulldown | band-lat-pulldown | lat-pulldown, band-lat-pulldown |
| vertical pull secondary | strength | phase_2 | lat-pulldown | band-lat-pulldown | lat-pulldown, band-lat-pulldown |
| vertical pull secondary | strength | phase_3 | lat-pulldown | band-lat-pulldown | lat-pulldown, band-lat-pulldown |
| squat main | strength | phase_1 | goblet-squat | none | goblet-squat |
| squat main | strength | phase_2 | goblet-squat | none | goblet-squat |
| squat main | strength | phase_3 | goblet-squat | none | goblet-squat |
| hinge secondary | strength | phase_1 | cable-pull-through | dumbbell-romanian-deadlift | cable-pull-through, dumbbell-romanian-deadlift |
| hinge secondary | strength | phase_2 | dumbbell-romanian-deadlift | cable-pull-through | dumbbell-romanian-deadlift, cable-pull-through |
| hinge secondary | strength | phase_3 | dumbbell-romanian-deadlift | cable-pull-through | dumbbell-romanian-deadlift, cable-pull-through |
| single-leg accessory | hypertrophy | phase_1 | step-up | split-squat | step-up, split-squat |
| single-leg accessory | hypertrophy | phase_2 | step-up | split-squat | step-up, split-squat |
| single-leg accessory | hypertrophy | phase_3 | split-squat | step-up | split-squat, step-up |
| trunk activation | posture_and_movement_quality | phase_1 | dead-bug | pallof-press | dead-bug, pallof-press |
| trunk activation | posture_and_movement_quality | phase_2 | pallof-press | dead-bug | pallof-press, dead-bug |
| trunk activation | posture_and_movement_quality | phase_3 | pallof-press | dead-bug | pallof-press, dead-bug |
| scapular activation | posture_and_movement_quality | phase_1 | band-face-pull | serratus-wall-slide | band-face-pull, serratus-wall-slide, reverse-pec-deck, band-row |
| scapular activation | posture_and_movement_quality | phase_2 | band-face-pull | serratus-wall-slide | band-face-pull, serratus-wall-slide, reverse-pec-deck, band-row |
| scapular activation | posture_and_movement_quality | phase_3 | reverse-pec-deck | band-face-pull | reverse-pec-deck, band-face-pull, serratus-wall-slide, band-row |
| rear-delt accessory | hypertrophy | phase_1 | reverse-pec-deck | band-face-pull | reverse-pec-deck, band-face-pull, band-row |
| rear-delt accessory | hypertrophy | phase_2 | reverse-pec-deck | band-face-pull | reverse-pec-deck, band-face-pull, band-row |
| rear-delt accessory | hypertrophy | phase_3 | reverse-pec-deck | band-face-pull | reverse-pec-deck, band-face-pull, band-row |

Vertical-push secondary has only one truthful legal reference candidate. The matrix reports that catalog limitation instead of manufacturing a comparison.

### Every Legal Candidate

| Need | Phase | Candidate | Rank | Total | phase_fit | goal_fit | experience_fit | skill_fit | stability_fit | loadability | stimulus_potential | progression_value | continuity_value | assessment_fit | pain_suitability | joint_cost |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| horizontal push main | phase_1 | machine-chest-press | 1 | 7.774 | 8.300 | 8.500 | 6.915 | 8.500 | 8.500 | 7.300 | 9.700 | 7.050 | 5.600 | 6.000 | 8.200 | 8.800 |
| horizontal push main | phase_1 | push-up | 2 | 7.683 | 6.200 | 8.500 | 7.590 | 7.950 | 7.200 | 8.150 | 8.600 | 8.150 | 5.600 | 6.000 | 8.200 | 8.800 |
| horizontal push main | phase_1 | dumbbell-bench-press | 3 | 7.672 | 6.200 | 8.500 | 8.265 | 7.400 | 7.200 | 7.300 | 9.700 | 7.600 | 5.600 | 6.000 | 8.200 | 8.800 |
| horizontal push main | phase_2 | dumbbell-bench-press | 1 | 7.961 | 8.800 | 8.500 | 8.265 | 7.400 | 8.500 | 8.150 | 9.700 | 8.150 | 5.600 | 6.000 | 8.200 | 8.800 |
| horizontal push main | phase_2 | push-up | 2 | 7.850 | 7.800 | 8.500 | 7.590 | 7.950 | 8.500 | 9.000 | 8.600 | 7.600 | 5.600 | 6.000 | 8.200 | 8.800 |
| horizontal push main | phase_2 | machine-chest-press | 3 | 7.846 | 7.800 | 8.500 | 6.915 | 8.500 | 8.500 | 8.150 | 9.700 | 8.150 | 5.600 | 6.000 | 8.200 | 8.800 |
| horizontal push main | phase_3 | dumbbell-bench-press | 1 | 8.053 | 9.600 | 8.500 | 8.265 | 7.400 | 8.500 | 9.000 | 9.700 | 8.150 | 5.600 | 6.000 | 8.200 | 8.800 |
| horizontal push main | phase_3 | machine-chest-press | 2 | 7.938 | 8.600 | 8.500 | 6.915 | 8.500 | 8.500 | 9.000 | 9.700 | 8.150 | 5.600 | 6.000 | 8.200 | 8.800 |
| horizontal push main | phase_3 | push-up | 3 | 7.709 | 6.200 | 8.500 | 7.590 | 7.950 | 8.500 | 8.150 | 8.600 | 7.600 | 5.600 | 6.000 | 8.200 | 8.800 |
| horizontal pull main | phase_1 | chest-supported-dumbbell-row | 1 | 7.882 | 8.300 | 8.500 | 6.915 | 8.500 | 8.500 | 7.300 | 9.700 | 7.600 | 5.600 | 6.000 | 8.200 | 8.800 |
| horizontal pull main | phase_1 | machine-row | 2 | 7.855 | 8.300 | 8.500 | 6.915 | 8.500 | 8.500 | 7.300 | 9.700 | 7.050 | 5.600 | 6.000 | 8.200 | 8.800 |
| horizontal pull main | phase_1 | seated-cable-row | 3 | 7.855 | 8.300 | 8.500 | 6.915 | 8.500 | 8.500 | 7.300 | 9.700 | 7.050 | 5.600 | 6.000 | 8.200 | 8.800 |
| horizontal pull main | phase_1 | one-arm-dumbbell-row | 4 | 7.604 | 6.200 | 8.500 | 8.265 | 7.400 | 5.900 | 7.300 | 9.700 | 7.600 | 5.600 | 6.000 | 8.200 | 8.450 |
| horizontal pull main | phase_2 | machine-row | 1 | 7.989 | 8.800 | 8.500 | 6.915 | 8.500 | 8.500 | 8.150 | 9.700 | 8.150 | 5.600 | 6.000 | 8.200 | 8.800 |
| horizontal pull main | phase_2 | seated-cable-row | 2 | 7.989 | 8.800 | 8.500 | 6.915 | 8.500 | 8.500 | 8.150 | 9.700 | 8.150 | 5.600 | 6.000 | 8.200 | 8.800 |
| horizontal pull main | phase_2 | chest-supported-dumbbell-row | 3 | 7.985 | 8.800 | 8.500 | 6.915 | 8.500 | 8.500 | 8.150 | 9.700 | 8.150 | 5.600 | 6.000 | 8.200 | 8.800 |
| horizontal pull main | phase_2 | one-arm-dumbbell-row | 4 | 7.831 | 7.800 | 8.500 | 8.265 | 7.400 | 7.200 | 8.150 | 9.700 | 8.150 | 5.600 | 6.000 | 8.200 | 8.450 |
| horizontal pull main | phase_3 | chest-supported-dumbbell-row | 1 | 8.077 | 9.600 | 8.500 | 6.915 | 8.500 | 8.500 | 9.000 | 9.700 | 8.150 | 5.600 | 6.000 | 8.200 | 8.800 |
| horizontal pull main | phase_3 | machine-row | 2 | 8.019 | 8.600 | 8.500 | 6.915 | 8.500 | 8.500 | 9.000 | 9.700 | 8.150 | 5.600 | 6.000 | 8.200 | 8.800 |
| horizontal pull main | phase_3 | seated-cable-row | 3 | 8.019 | 8.600 | 8.500 | 6.915 | 8.500 | 8.500 | 9.000 | 9.700 | 8.150 | 5.600 | 6.000 | 8.200 | 8.800 |
| horizontal pull main | phase_3 | one-arm-dumbbell-row | 4 | 7.984 | 9.600 | 8.500 | 8.265 | 7.400 | 7.200 | 9.000 | 9.700 | 8.150 | 5.600 | 6.000 | 8.200 | 8.450 |
| vertical push secondary | phase_1 | dumbbell-shoulder-press | 1 | 7.595 | 6.200 | 8.500 | 8.265 | 7.400 | 7.200 | 7.300 | 9.700 | 7.050 | 5.600 | 6.000 | 8.200 | 8.450 |
| vertical push secondary | phase_2 | dumbbell-shoulder-press | 1 | 7.853 | 7.800 | 8.500 | 8.265 | 7.400 | 8.500 | 8.150 | 9.700 | 8.150 | 5.600 | 6.000 | 8.200 | 8.450 |
| vertical push secondary | phase_3 | dumbbell-shoulder-press | 1 | 8.006 | 9.600 | 8.500 | 8.265 | 7.400 | 8.500 | 9.000 | 9.700 | 8.150 | 5.600 | 6.000 | 8.200 | 8.450 |
| vertical pull secondary | phase_1 | lat-pulldown | 1 | 7.809 | 8.300 | 8.500 | 6.915 | 8.500 | 8.500 | 7.300 | 9.700 | 7.050 | 5.600 | 6.000 | 8.200 | 8.800 |
| vertical pull secondary | phase_1 | band-lat-pulldown | 2 | 7.656 | 8.300 | 5.500 | 6.915 | 8.500 | 8.500 | 8.200 | 8.600 | 7.600 | 5.600 | 6.000 | 8.200 | 8.800 |
| vertical pull secondary | phase_2 | lat-pulldown | 1 | 7.943 | 8.800 | 8.500 | 6.915 | 8.500 | 8.500 | 8.150 | 9.700 | 8.150 | 5.600 | 6.000 | 8.200 | 8.800 |
| vertical pull secondary | phase_2 | band-lat-pulldown | 2 | 7.484 | 6.200 | 5.500 | 6.915 | 8.500 | 8.500 | 7.350 | 8.600 | 7.600 | 5.600 | 6.000 | 8.200 | 8.800 |
| vertical pull secondary | phase_3 | lat-pulldown | 1 | 8.034 | 9.600 | 8.500 | 6.915 | 8.500 | 8.500 | 9.000 | 9.700 | 8.150 | 5.600 | 6.000 | 8.200 | 8.800 |
| vertical pull secondary | phase_3 | band-lat-pulldown | 2 | 7.442 | 6.200 | 5.500 | 6.915 | 8.500 | 8.500 | 6.500 | 8.600 | 7.600 | 5.600 | 6.000 | 8.200 | 8.800 |
| squat main | phase_1 | goblet-squat | 1 | 7.789 | 8.300 | 8.500 | 6.915 | 8.500 | 7.200 | 8.150 | 8.600 | 7.600 | 5.600 | 6.000 | 8.200 | 8.800 |
| squat main | phase_2 | goblet-squat | 1 | 7.979 | 8.800 | 8.500 | 6.915 | 8.500 | 8.500 | 9.000 | 8.600 | 8.700 | 5.600 | 6.000 | 8.200 | 8.800 |
| squat main | phase_3 | goblet-squat | 1 | 7.746 | 6.200 | 8.500 | 6.915 | 8.500 | 8.500 | 8.150 | 8.600 | 8.150 | 5.600 | 6.000 | 8.200 | 8.800 |
| hinge secondary | phase_1 | cable-pull-through | 1 | 7.662 | 8.300 | 7.000 | 6.915 | 8.500 | 7.200 | 8.150 | 8.600 | 7.600 | 5.600 | 6.000 | 8.200 | 8.800 |
| hinge secondary | phase_1 | dumbbell-romanian-deadlift | 2 | 7.602 | 6.200 | 8.500 | 8.265 | 7.400 | 7.200 | 7.300 | 9.700 | 7.600 | 5.600 | 6.000 | 8.200 | 8.450 |
| hinge secondary | phase_2 | dumbbell-romanian-deadlift | 1 | 7.921 | 8.800 | 8.500 | 8.265 | 7.400 | 8.500 | 8.150 | 9.700 | 8.700 | 5.600 | 6.000 | 8.200 | 8.450 |
| hinge secondary | phase_2 | cable-pull-through | 2 | 7.760 | 7.800 | 7.000 | 6.915 | 8.500 | 8.500 | 9.000 | 8.600 | 8.150 | 5.600 | 6.000 | 8.200 | 8.800 |
| hinge secondary | phase_3 | dumbbell-romanian-deadlift | 1 | 7.982 | 9.600 | 8.500 | 8.265 | 7.400 | 8.500 | 9.000 | 9.700 | 8.150 | 5.600 | 6.000 | 8.200 | 8.450 |
| hinge secondary | phase_3 | cable-pull-through | 2 | 7.589 | 6.200 | 7.000 | 6.915 | 8.500 | 8.500 | 8.150 | 8.600 | 7.600 | 5.600 | 6.000 | 8.200 | 8.800 |
| single-leg accessory | phase_1 | step-up | 1 | 7.752 | 7.800 | 8.000 | 8.265 | 7.400 | 7.200 | 8.150 | 8.600 | 7.600 | 5.600 | 6.000 | 8.200 | 8.800 |
| single-leg accessory | phase_1 | split-squat | 2 | 7.643 | 6.200 | 8.000 | 8.265 | 7.400 | 7.200 | 8.150 | 8.600 | 8.150 | 5.600 | 6.000 | 8.200 | 8.800 |
| single-leg accessory | phase_2 | step-up | 1 | 7.881 | 7.800 | 8.000 | 8.265 | 7.400 | 8.500 | 9.000 | 8.600 | 8.150 | 5.600 | 6.000 | 8.200 | 8.800 |
| single-leg accessory | phase_2 | split-squat | 2 | 7.840 | 7.800 | 8.000 | 8.265 | 7.400 | 8.500 | 9.000 | 8.600 | 8.150 | 5.600 | 6.000 | 8.200 | 8.800 |
| single-leg accessory | phase_3 | split-squat | 1 | 7.829 | 8.800 | 8.000 | 8.265 | 7.400 | 8.500 | 8.150 | 8.600 | 7.600 | 5.600 | 6.000 | 8.200 | 8.800 |
| single-leg accessory | phase_3 | step-up | 2 | 7.809 | 7.800 | 8.000 | 8.265 | 7.400 | 8.500 | 8.150 | 8.600 | 7.600 | 5.600 | 6.000 | 8.200 | 8.800 |
| trunk activation | phase_1 | dead-bug | 1 | 7.739 | 9.300 | 8.500 | 7.590 | 7.950 | 7.200 | 8.800 | 7.150 | 7.600 | 5.600 | 6.000 | 8.200 | 8.800 |
| trunk activation | phase_1 | pallof-press | 2 | 7.704 | 9.300 | 8.500 | 6.915 | 8.500 | 7.200 | 7.350 | 7.900 | 7.600 | 5.600 | 6.000 | 8.200 | 8.800 |
| trunk activation | phase_2 | pallof-press | 1 | 7.709 | 7.800 | 8.500 | 6.915 | 8.500 | 8.500 | 8.200 | 7.900 | 7.600 | 5.600 | 6.000 | 8.200 | 8.800 |
| trunk activation | phase_2 | dead-bug | 2 | 7.630 | 7.800 | 8.500 | 7.590 | 7.950 | 8.500 | 7.950 | 7.150 | 7.050 | 5.600 | 6.000 | 8.200 | 8.800 |
| trunk activation | phase_3 | pallof-press | 1 | 7.698 | 7.800 | 8.500 | 6.915 | 8.500 | 8.500 | 7.350 | 7.900 | 8.150 | 5.600 | 6.000 | 8.200 | 8.800 |
| trunk activation | phase_3 | dead-bug | 2 | 7.459 | 6.200 | 8.500 | 7.590 | 7.950 | 8.500 | 7.100 | 7.150 | 6.500 | 5.600 | 6.000 | 8.200 | 8.800 |
| scapular activation | phase_1 | band-face-pull | 1 | 8.002 | 9.300 | 8.500 | 7.590 | 7.950 | 8.500 | 8.800 | 7.150 | 7.600 | 5.600 | 6.000 | 8.200 | 8.800 |
| scapular activation | phase_1 | serratus-wall-slide | 2 | 8.002 | 9.300 | 8.500 | 7.590 | 7.950 | 8.500 | 8.800 | 7.150 | 7.600 | 5.600 | 6.000 | 8.200 | 8.800 |
| scapular activation | phase_1 | reverse-pec-deck | 3 | 7.742 | 8.300 | 8.500 | 6.915 | 8.500 | 8.500 | 7.350 | 7.900 | 7.600 | 5.600 | 6.000 | 8.200 | 8.800 |
| scapular activation | phase_1 | band-row | 4 | 7.649 | 9.300 | 6.500 | 6.915 | 8.500 | 8.500 | 8.800 | 7.900 | 7.600 | 5.600 | 6.000 | 8.200 | 8.800 |
| scapular activation | phase_2 | band-face-pull | 1 | 7.867 | 7.800 | 8.500 | 7.590 | 7.950 | 8.500 | 7.950 | 7.150 | 7.600 | 5.600 | 6.000 | 8.200 | 8.800 |
| scapular activation | phase_2 | serratus-wall-slide | 2 | 7.837 | 7.800 | 8.500 | 7.590 | 7.950 | 8.500 | 7.950 | 7.150 | 7.050 | 5.600 | 6.000 | 8.200 | 8.800 |
| scapular activation | phase_2 | reverse-pec-deck | 3 | 7.783 | 7.800 | 8.500 | 6.915 | 8.500 | 8.500 | 8.200 | 7.900 | 8.150 | 5.600 | 6.000 | 8.200 | 8.800 |
| scapular activation | phase_2 | band-row | 4 | 7.515 | 7.800 | 6.500 | 6.915 | 8.500 | 8.500 | 7.950 | 7.900 | 7.600 | 5.600 | 6.000 | 8.200 | 8.800 |
| scapular activation | phase_3 | reverse-pec-deck | 1 | 7.803 | 8.800 | 8.500 | 6.915 | 8.500 | 8.500 | 7.350 | 7.900 | 8.150 | 5.600 | 6.000 | 8.200 | 8.800 |
| scapular activation | phase_3 | band-face-pull | 2 | 7.727 | 6.200 | 8.500 | 7.590 | 7.950 | 8.500 | 7.100 | 7.150 | 7.600 | 5.600 | 6.000 | 8.200 | 8.800 |
| scapular activation | phase_3 | serratus-wall-slide | 3 | 7.666 | 6.200 | 8.500 | 7.590 | 7.950 | 8.500 | 7.100 | 7.150 | 6.500 | 5.600 | 6.000 | 8.200 | 8.800 |
| scapular activation | phase_3 | band-row | 4 | 7.374 | 6.200 | 6.500 | 6.915 | 8.500 | 8.500 | 7.100 | 7.900 | 7.600 | 5.600 | 6.000 | 8.200 | 8.800 |
| rear-delt accessory | phase_1 | reverse-pec-deck | 1 | 7.832 | 8.300 | 8.000 | 6.915 | 8.500 | 8.500 | 8.150 | 8.600 | 7.600 | 5.600 | 6.000 | 8.200 | 8.800 |
| rear-delt accessory | phase_1 | band-face-pull | 2 | 7.831 | 9.300 | 8.000 | 7.590 | 7.950 | 8.500 | 8.200 | 7.500 | 7.600 | 5.600 | 6.000 | 8.200 | 8.800 |
| rear-delt accessory | phase_1 | band-row | 3 | 7.761 | 9.300 | 8.000 | 6.915 | 8.500 | 8.500 | 8.200 | 8.600 | 7.600 | 5.600 | 6.000 | 8.200 | 8.800 |
| rear-delt accessory | phase_2 | reverse-pec-deck | 1 | 7.874 | 7.800 | 8.000 | 6.915 | 8.500 | 8.500 | 9.000 | 8.600 | 8.150 | 5.600 | 6.000 | 8.200 | 8.800 |
| rear-delt accessory | phase_2 | band-face-pull | 2 | 7.697 | 7.800 | 8.000 | 7.590 | 7.950 | 8.500 | 7.350 | 7.500 | 7.600 | 5.600 | 6.000 | 8.200 | 8.800 |
| rear-delt accessory | phase_2 | band-row | 3 | 7.626 | 7.800 | 8.000 | 6.915 | 8.500 | 8.500 | 7.350 | 8.600 | 7.600 | 5.600 | 6.000 | 8.200 | 8.800 |
| rear-delt accessory | phase_3 | reverse-pec-deck | 1 | 7.894 | 8.800 | 8.000 | 6.915 | 8.500 | 8.500 | 8.150 | 8.600 | 8.150 | 5.600 | 6.000 | 8.200 | 8.800 |
| rear-delt accessory | phase_3 | band-face-pull | 2 | 7.556 | 6.200 | 8.000 | 7.590 | 7.950 | 8.500 | 6.500 | 7.500 | 7.600 | 5.600 | 6.000 | 8.200 | 8.800 |
| rear-delt accessory | phase_3 | band-row | 3 | 7.485 | 6.200 | 8.000 | 6.915 | 8.500 | 8.500 | 6.500 | 8.600 | 7.600 | 5.600 | 6.000 | 8.200 | 8.800 |

### Every Hard Rejection

These are expected training-need and equipment/prerequisite truth outcomes from evaluating the complete 30-exercise reference catalog for every phase-only request. Phase never changes these reasons.

| Need | Phase | Exercise | Reason Codes |
| --- | --- | --- | --- |
| horizontal push main | phase_1 | ninety-ninety-breathing | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_1 | serratus-wall-slide | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_1 | dead-bug | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_1 | cable-chest-fly | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH |
| horizontal push main | phase_1 | chest-supported-dumbbell-row | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_1 | one-arm-dumbbell-row | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_1 | machine-row | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_1 | seated-cable-row | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_1 | band-row | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_1 | dumbbell-shoulder-press | MOVEMENT_ROLE_MISMATCH |
| horizontal push main | phase_1 | lat-pulldown | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_1 | band-lat-pulldown | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_1 | goblet-squat | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_1 | leg-press | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_1 | bodyweight-box-squat | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_1 | dumbbell-romanian-deadlift | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_1 | cable-pull-through | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_1 | split-squat | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_1 | step-up | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_1 | lying-leg-curl | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_1 | glute-bridge | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_1 | dumbbell-lateral-raise | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_1 | reverse-pec-deck | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_1 | band-face-pull | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_1 | dumbbell-curl | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_1 | cable-triceps-pressdown | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH |
| horizontal push main | phase_1 | pallof-press | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_1 | forearm-plank | SETUP_IMPOSSIBLE, ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_1 | forearm-side-plank | SETUP_IMPOSSIBLE, ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_1 | machine-abdominal-crunch | SETUP_IMPOSSIBLE, ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_1 | half-kneeling-high-to-low-cable-chop | SETUP_IMPOSSIBLE, ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_1 | farmer-carry | SETUP_IMPOSSIBLE, ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_1 | suitcase-carry | SETUP_IMPOSSIBLE, ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_1 | wall-supported-suitcase-march | SETUP_IMPOSSIBLE, ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_1 | standing-calf-raise | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_1 | side-lying-hip-adduction | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_1 | loop-band-lateral-walk | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_1 | side-lying-dumbbell-external-rotation | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_1 | supine-hamstring-walkout | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_1 | wall-ankle-dorsiflexion-rock | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_1 | bodyweight-hip-hinge-rehearsal | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_1 | single-leg-balance-rehearsal | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_2 | ninety-ninety-breathing | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_2 | serratus-wall-slide | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_2 | dead-bug | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_2 | cable-chest-fly | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH |
| horizontal push main | phase_2 | chest-supported-dumbbell-row | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_2 | one-arm-dumbbell-row | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_2 | machine-row | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_2 | seated-cable-row | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_2 | band-row | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_2 | dumbbell-shoulder-press | MOVEMENT_ROLE_MISMATCH |
| horizontal push main | phase_2 | lat-pulldown | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_2 | band-lat-pulldown | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_2 | goblet-squat | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_2 | leg-press | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_2 | bodyweight-box-squat | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_2 | dumbbell-romanian-deadlift | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_2 | cable-pull-through | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_2 | split-squat | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_2 | step-up | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_2 | lying-leg-curl | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_2 | glute-bridge | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_2 | dumbbell-lateral-raise | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_2 | reverse-pec-deck | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_2 | band-face-pull | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_2 | dumbbell-curl | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_2 | cable-triceps-pressdown | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH |
| horizontal push main | phase_2 | pallof-press | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_2 | forearm-plank | SETUP_IMPOSSIBLE, ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_2 | forearm-side-plank | SETUP_IMPOSSIBLE, ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_2 | machine-abdominal-crunch | SETUP_IMPOSSIBLE, ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_2 | half-kneeling-high-to-low-cable-chop | SETUP_IMPOSSIBLE, ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_2 | farmer-carry | SETUP_IMPOSSIBLE, ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_2 | suitcase-carry | SETUP_IMPOSSIBLE, ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_2 | wall-supported-suitcase-march | SETUP_IMPOSSIBLE, ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_2 | standing-calf-raise | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_2 | side-lying-hip-adduction | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_2 | loop-band-lateral-walk | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_2 | side-lying-dumbbell-external-rotation | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_2 | supine-hamstring-walkout | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_2 | wall-ankle-dorsiflexion-rock | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_2 | bodyweight-hip-hinge-rehearsal | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_2 | single-leg-balance-rehearsal | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_3 | ninety-ninety-breathing | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_3 | serratus-wall-slide | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_3 | dead-bug | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_3 | cable-chest-fly | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH |
| horizontal push main | phase_3 | chest-supported-dumbbell-row | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_3 | one-arm-dumbbell-row | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_3 | machine-row | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_3 | seated-cable-row | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_3 | band-row | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_3 | dumbbell-shoulder-press | MOVEMENT_ROLE_MISMATCH |
| horizontal push main | phase_3 | lat-pulldown | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_3 | band-lat-pulldown | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_3 | goblet-squat | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_3 | leg-press | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_3 | bodyweight-box-squat | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_3 | dumbbell-romanian-deadlift | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_3 | cable-pull-through | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_3 | split-squat | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_3 | step-up | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_3 | lying-leg-curl | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_3 | glute-bridge | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_3 | dumbbell-lateral-raise | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_3 | reverse-pec-deck | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_3 | band-face-pull | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_3 | dumbbell-curl | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_3 | cable-triceps-pressdown | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH |
| horizontal push main | phase_3 | pallof-press | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_3 | forearm-plank | SETUP_IMPOSSIBLE, ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_3 | forearm-side-plank | SETUP_IMPOSSIBLE, ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_3 | machine-abdominal-crunch | SETUP_IMPOSSIBLE, ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_3 | half-kneeling-high-to-low-cable-chop | SETUP_IMPOSSIBLE, ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_3 | farmer-carry | SETUP_IMPOSSIBLE, ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_3 | suitcase-carry | SETUP_IMPOSSIBLE, ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_3 | wall-supported-suitcase-march | SETUP_IMPOSSIBLE, ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_3 | standing-calf-raise | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_3 | side-lying-hip-adduction | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_3 | loop-band-lateral-walk | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_3 | side-lying-dumbbell-external-rotation | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_3 | supine-hamstring-walkout | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_3 | wall-ankle-dorsiflexion-rock | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_3 | bodyweight-hip-hinge-rehearsal | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal push main | phase_3 | single-leg-balance-rehearsal | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_1 | ninety-ninety-breathing | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_1 | serratus-wall-slide | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_1 | dead-bug | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_1 | push-up | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_1 | dumbbell-bench-press | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_1 | machine-chest-press | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_1 | cable-chest-fly | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_1 | band-row | ROLE_MISMATCH, SECTION_MISMATCH |
| horizontal pull main | phase_1 | dumbbell-shoulder-press | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_1 | lat-pulldown | MOVEMENT_ROLE_MISMATCH |
| horizontal pull main | phase_1 | band-lat-pulldown | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH |
| horizontal pull main | phase_1 | goblet-squat | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_1 | leg-press | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_1 | bodyweight-box-squat | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_1 | dumbbell-romanian-deadlift | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_1 | cable-pull-through | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_1 | split-squat | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_1 | step-up | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_1 | lying-leg-curl | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_1 | glute-bridge | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_1 | dumbbell-lateral-raise | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_1 | reverse-pec-deck | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH |
| horizontal pull main | phase_1 | band-face-pull | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_1 | dumbbell-curl | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_1 | cable-triceps-pressdown | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_1 | pallof-press | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_1 | forearm-plank | SETUP_IMPOSSIBLE, ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_1 | forearm-side-plank | SETUP_IMPOSSIBLE, ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_1 | machine-abdominal-crunch | SETUP_IMPOSSIBLE, ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_1 | half-kneeling-high-to-low-cable-chop | SETUP_IMPOSSIBLE, ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_1 | farmer-carry | SETUP_IMPOSSIBLE, ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_1 | suitcase-carry | SETUP_IMPOSSIBLE, ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_1 | wall-supported-suitcase-march | SETUP_IMPOSSIBLE, ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_1 | standing-calf-raise | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_1 | side-lying-hip-adduction | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_1 | loop-band-lateral-walk | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_1 | side-lying-dumbbell-external-rotation | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_1 | supine-hamstring-walkout | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_1 | wall-ankle-dorsiflexion-rock | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_1 | bodyweight-hip-hinge-rehearsal | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_1 | single-leg-balance-rehearsal | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_2 | ninety-ninety-breathing | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_2 | serratus-wall-slide | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_2 | dead-bug | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_2 | push-up | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_2 | dumbbell-bench-press | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_2 | machine-chest-press | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_2 | cable-chest-fly | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_2 | band-row | ROLE_MISMATCH, SECTION_MISMATCH |
| horizontal pull main | phase_2 | dumbbell-shoulder-press | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_2 | lat-pulldown | MOVEMENT_ROLE_MISMATCH |
| horizontal pull main | phase_2 | band-lat-pulldown | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH |
| horizontal pull main | phase_2 | goblet-squat | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_2 | leg-press | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_2 | bodyweight-box-squat | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_2 | dumbbell-romanian-deadlift | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_2 | cable-pull-through | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_2 | split-squat | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_2 | step-up | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_2 | lying-leg-curl | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_2 | glute-bridge | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_2 | dumbbell-lateral-raise | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_2 | reverse-pec-deck | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH |
| horizontal pull main | phase_2 | band-face-pull | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_2 | dumbbell-curl | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_2 | cable-triceps-pressdown | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_2 | pallof-press | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_2 | forearm-plank | SETUP_IMPOSSIBLE, ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_2 | forearm-side-plank | SETUP_IMPOSSIBLE, ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_2 | machine-abdominal-crunch | SETUP_IMPOSSIBLE, ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_2 | half-kneeling-high-to-low-cable-chop | SETUP_IMPOSSIBLE, ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_2 | farmer-carry | SETUP_IMPOSSIBLE, ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_2 | suitcase-carry | SETUP_IMPOSSIBLE, ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_2 | wall-supported-suitcase-march | SETUP_IMPOSSIBLE, ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_2 | standing-calf-raise | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_2 | side-lying-hip-adduction | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_2 | loop-band-lateral-walk | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_2 | side-lying-dumbbell-external-rotation | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_2 | supine-hamstring-walkout | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_2 | wall-ankle-dorsiflexion-rock | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_2 | bodyweight-hip-hinge-rehearsal | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_2 | single-leg-balance-rehearsal | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_3 | ninety-ninety-breathing | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_3 | serratus-wall-slide | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_3 | dead-bug | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_3 | push-up | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_3 | dumbbell-bench-press | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_3 | machine-chest-press | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_3 | cable-chest-fly | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_3 | band-row | ROLE_MISMATCH, SECTION_MISMATCH |
| horizontal pull main | phase_3 | dumbbell-shoulder-press | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_3 | lat-pulldown | MOVEMENT_ROLE_MISMATCH |
| horizontal pull main | phase_3 | band-lat-pulldown | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH |
| horizontal pull main | phase_3 | goblet-squat | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_3 | leg-press | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_3 | bodyweight-box-squat | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_3 | dumbbell-romanian-deadlift | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_3 | cable-pull-through | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_3 | split-squat | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_3 | step-up | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_3 | lying-leg-curl | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_3 | glute-bridge | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_3 | dumbbell-lateral-raise | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_3 | reverse-pec-deck | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH |
| horizontal pull main | phase_3 | band-face-pull | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_3 | dumbbell-curl | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_3 | cable-triceps-pressdown | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_3 | pallof-press | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_3 | forearm-plank | SETUP_IMPOSSIBLE, ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_3 | forearm-side-plank | SETUP_IMPOSSIBLE, ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_3 | machine-abdominal-crunch | SETUP_IMPOSSIBLE, ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_3 | half-kneeling-high-to-low-cable-chop | SETUP_IMPOSSIBLE, ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_3 | farmer-carry | SETUP_IMPOSSIBLE, ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_3 | suitcase-carry | SETUP_IMPOSSIBLE, ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_3 | wall-supported-suitcase-march | SETUP_IMPOSSIBLE, ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_3 | standing-calf-raise | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_3 | side-lying-hip-adduction | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_3 | loop-band-lateral-walk | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_3 | side-lying-dumbbell-external-rotation | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_3 | supine-hamstring-walkout | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_3 | wall-ankle-dorsiflexion-rock | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_3 | bodyweight-hip-hinge-rehearsal | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| horizontal pull main | phase_3 | single-leg-balance-rehearsal | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_1 | ninety-ninety-breathing | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_1 | serratus-wall-slide | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_1 | dead-bug | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_1 | push-up | MOVEMENT_ROLE_MISMATCH |
| vertical push secondary | phase_1 | dumbbell-bench-press | MOVEMENT_ROLE_MISMATCH |
| vertical push secondary | phase_1 | machine-chest-press | MOVEMENT_ROLE_MISMATCH |
| vertical push secondary | phase_1 | cable-chest-fly | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH |
| vertical push secondary | phase_1 | chest-supported-dumbbell-row | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_1 | one-arm-dumbbell-row | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_1 | machine-row | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_1 | seated-cable-row | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_1 | band-row | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_1 | lat-pulldown | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_1 | band-lat-pulldown | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_1 | goblet-squat | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_1 | leg-press | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_1 | bodyweight-box-squat | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_1 | dumbbell-romanian-deadlift | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_1 | cable-pull-through | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_1 | split-squat | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_1 | step-up | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_1 | lying-leg-curl | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_1 | glute-bridge | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_1 | dumbbell-lateral-raise | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_1 | reverse-pec-deck | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_1 | band-face-pull | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_1 | dumbbell-curl | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_1 | cable-triceps-pressdown | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH |
| vertical push secondary | phase_1 | pallof-press | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_1 | forearm-plank | SETUP_IMPOSSIBLE, ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_1 | forearm-side-plank | SETUP_IMPOSSIBLE, ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_1 | machine-abdominal-crunch | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_1 | half-kneeling-high-to-low-cable-chop | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_1 | farmer-carry | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_1 | suitcase-carry | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_1 | wall-supported-suitcase-march | SETUP_IMPOSSIBLE, ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_1 | standing-calf-raise | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_1 | side-lying-hip-adduction | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_1 | loop-band-lateral-walk | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_1 | side-lying-dumbbell-external-rotation | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_1 | supine-hamstring-walkout | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_1 | wall-ankle-dorsiflexion-rock | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_1 | bodyweight-hip-hinge-rehearsal | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_1 | single-leg-balance-rehearsal | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_2 | ninety-ninety-breathing | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_2 | serratus-wall-slide | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_2 | dead-bug | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_2 | push-up | MOVEMENT_ROLE_MISMATCH |
| vertical push secondary | phase_2 | dumbbell-bench-press | MOVEMENT_ROLE_MISMATCH |
| vertical push secondary | phase_2 | machine-chest-press | MOVEMENT_ROLE_MISMATCH |
| vertical push secondary | phase_2 | cable-chest-fly | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH |
| vertical push secondary | phase_2 | chest-supported-dumbbell-row | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_2 | one-arm-dumbbell-row | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_2 | machine-row | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_2 | seated-cable-row | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_2 | band-row | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_2 | lat-pulldown | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_2 | band-lat-pulldown | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_2 | goblet-squat | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_2 | leg-press | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_2 | bodyweight-box-squat | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_2 | dumbbell-romanian-deadlift | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_2 | cable-pull-through | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_2 | split-squat | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_2 | step-up | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_2 | lying-leg-curl | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_2 | glute-bridge | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_2 | dumbbell-lateral-raise | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_2 | reverse-pec-deck | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_2 | band-face-pull | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_2 | dumbbell-curl | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_2 | cable-triceps-pressdown | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH |
| vertical push secondary | phase_2 | pallof-press | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_2 | forearm-plank | SETUP_IMPOSSIBLE, ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_2 | forearm-side-plank | SETUP_IMPOSSIBLE, ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_2 | machine-abdominal-crunch | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_2 | half-kneeling-high-to-low-cable-chop | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_2 | farmer-carry | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_2 | suitcase-carry | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_2 | wall-supported-suitcase-march | SETUP_IMPOSSIBLE, ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_2 | standing-calf-raise | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_2 | side-lying-hip-adduction | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_2 | loop-band-lateral-walk | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_2 | side-lying-dumbbell-external-rotation | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_2 | supine-hamstring-walkout | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_2 | wall-ankle-dorsiflexion-rock | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_2 | bodyweight-hip-hinge-rehearsal | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_2 | single-leg-balance-rehearsal | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_3 | ninety-ninety-breathing | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_3 | serratus-wall-slide | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_3 | dead-bug | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_3 | push-up | MOVEMENT_ROLE_MISMATCH |
| vertical push secondary | phase_3 | dumbbell-bench-press | MOVEMENT_ROLE_MISMATCH |
| vertical push secondary | phase_3 | machine-chest-press | MOVEMENT_ROLE_MISMATCH |
| vertical push secondary | phase_3 | cable-chest-fly | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH |
| vertical push secondary | phase_3 | chest-supported-dumbbell-row | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_3 | one-arm-dumbbell-row | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_3 | machine-row | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_3 | seated-cable-row | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_3 | band-row | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_3 | lat-pulldown | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_3 | band-lat-pulldown | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_3 | goblet-squat | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_3 | leg-press | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_3 | bodyweight-box-squat | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_3 | dumbbell-romanian-deadlift | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_3 | cable-pull-through | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_3 | split-squat | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_3 | step-up | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_3 | lying-leg-curl | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_3 | glute-bridge | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_3 | dumbbell-lateral-raise | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_3 | reverse-pec-deck | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_3 | band-face-pull | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_3 | dumbbell-curl | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_3 | cable-triceps-pressdown | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH |
| vertical push secondary | phase_3 | pallof-press | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_3 | forearm-plank | SETUP_IMPOSSIBLE, ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_3 | forearm-side-plank | SETUP_IMPOSSIBLE, ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_3 | machine-abdominal-crunch | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_3 | half-kneeling-high-to-low-cable-chop | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_3 | farmer-carry | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_3 | suitcase-carry | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_3 | wall-supported-suitcase-march | SETUP_IMPOSSIBLE, ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_3 | standing-calf-raise | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_3 | side-lying-hip-adduction | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_3 | loop-band-lateral-walk | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_3 | side-lying-dumbbell-external-rotation | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_3 | supine-hamstring-walkout | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_3 | wall-ankle-dorsiflexion-rock | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_3 | bodyweight-hip-hinge-rehearsal | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical push secondary | phase_3 | single-leg-balance-rehearsal | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_1 | ninety-ninety-breathing | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_1 | serratus-wall-slide | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_1 | dead-bug | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_1 | push-up | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_1 | dumbbell-bench-press | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_1 | machine-chest-press | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_1 | cable-chest-fly | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_1 | chest-supported-dumbbell-row | MOVEMENT_ROLE_MISMATCH |
| vertical pull secondary | phase_1 | one-arm-dumbbell-row | MOVEMENT_ROLE_MISMATCH |
| vertical pull secondary | phase_1 | machine-row | MOVEMENT_ROLE_MISMATCH |
| vertical pull secondary | phase_1 | seated-cable-row | MOVEMENT_ROLE_MISMATCH |
| vertical pull secondary | phase_1 | band-row | MOVEMENT_ROLE_MISMATCH |
| vertical pull secondary | phase_1 | dumbbell-shoulder-press | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_1 | goblet-squat | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_1 | leg-press | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_1 | bodyweight-box-squat | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_1 | dumbbell-romanian-deadlift | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_1 | cable-pull-through | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_1 | split-squat | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_1 | step-up | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_1 | lying-leg-curl | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_1 | glute-bridge | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_1 | dumbbell-lateral-raise | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_1 | reverse-pec-deck | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_1 | band-face-pull | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_1 | dumbbell-curl | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH |
| vertical pull secondary | phase_1 | cable-triceps-pressdown | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_1 | pallof-press | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_1 | forearm-plank | SETUP_IMPOSSIBLE, ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_1 | forearm-side-plank | SETUP_IMPOSSIBLE, ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_1 | machine-abdominal-crunch | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_1 | half-kneeling-high-to-low-cable-chop | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_1 | farmer-carry | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_1 | suitcase-carry | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_1 | wall-supported-suitcase-march | SETUP_IMPOSSIBLE, ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_1 | standing-calf-raise | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_1 | side-lying-hip-adduction | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_1 | loop-band-lateral-walk | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_1 | side-lying-dumbbell-external-rotation | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_1 | supine-hamstring-walkout | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_1 | wall-ankle-dorsiflexion-rock | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_1 | bodyweight-hip-hinge-rehearsal | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_1 | single-leg-balance-rehearsal | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_2 | ninety-ninety-breathing | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_2 | serratus-wall-slide | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_2 | dead-bug | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_2 | push-up | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_2 | dumbbell-bench-press | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_2 | machine-chest-press | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_2 | cable-chest-fly | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_2 | chest-supported-dumbbell-row | MOVEMENT_ROLE_MISMATCH |
| vertical pull secondary | phase_2 | one-arm-dumbbell-row | MOVEMENT_ROLE_MISMATCH |
| vertical pull secondary | phase_2 | machine-row | MOVEMENT_ROLE_MISMATCH |
| vertical pull secondary | phase_2 | seated-cable-row | MOVEMENT_ROLE_MISMATCH |
| vertical pull secondary | phase_2 | band-row | MOVEMENT_ROLE_MISMATCH |
| vertical pull secondary | phase_2 | dumbbell-shoulder-press | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_2 | goblet-squat | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_2 | leg-press | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_2 | bodyweight-box-squat | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_2 | dumbbell-romanian-deadlift | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_2 | cable-pull-through | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_2 | split-squat | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_2 | step-up | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_2 | lying-leg-curl | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_2 | glute-bridge | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_2 | dumbbell-lateral-raise | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_2 | reverse-pec-deck | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_2 | band-face-pull | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_2 | dumbbell-curl | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH |
| vertical pull secondary | phase_2 | cable-triceps-pressdown | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_2 | pallof-press | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_2 | forearm-plank | SETUP_IMPOSSIBLE, ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_2 | forearm-side-plank | SETUP_IMPOSSIBLE, ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_2 | machine-abdominal-crunch | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_2 | half-kneeling-high-to-low-cable-chop | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_2 | farmer-carry | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_2 | suitcase-carry | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_2 | wall-supported-suitcase-march | SETUP_IMPOSSIBLE, ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_2 | standing-calf-raise | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_2 | side-lying-hip-adduction | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_2 | loop-band-lateral-walk | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_2 | side-lying-dumbbell-external-rotation | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_2 | supine-hamstring-walkout | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_2 | wall-ankle-dorsiflexion-rock | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_2 | bodyweight-hip-hinge-rehearsal | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_2 | single-leg-balance-rehearsal | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_3 | ninety-ninety-breathing | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_3 | serratus-wall-slide | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_3 | dead-bug | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_3 | push-up | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_3 | dumbbell-bench-press | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_3 | machine-chest-press | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_3 | cable-chest-fly | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_3 | chest-supported-dumbbell-row | MOVEMENT_ROLE_MISMATCH |
| vertical pull secondary | phase_3 | one-arm-dumbbell-row | MOVEMENT_ROLE_MISMATCH |
| vertical pull secondary | phase_3 | machine-row | MOVEMENT_ROLE_MISMATCH |
| vertical pull secondary | phase_3 | seated-cable-row | MOVEMENT_ROLE_MISMATCH |
| vertical pull secondary | phase_3 | band-row | MOVEMENT_ROLE_MISMATCH |
| vertical pull secondary | phase_3 | dumbbell-shoulder-press | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_3 | goblet-squat | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_3 | leg-press | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_3 | bodyweight-box-squat | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_3 | dumbbell-romanian-deadlift | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_3 | cable-pull-through | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_3 | split-squat | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_3 | step-up | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_3 | lying-leg-curl | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_3 | glute-bridge | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_3 | dumbbell-lateral-raise | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_3 | reverse-pec-deck | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_3 | band-face-pull | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_3 | dumbbell-curl | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH |
| vertical pull secondary | phase_3 | cable-triceps-pressdown | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_3 | pallof-press | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_3 | forearm-plank | SETUP_IMPOSSIBLE, ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_3 | forearm-side-plank | SETUP_IMPOSSIBLE, ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_3 | machine-abdominal-crunch | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_3 | half-kneeling-high-to-low-cable-chop | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_3 | farmer-carry | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_3 | suitcase-carry | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_3 | wall-supported-suitcase-march | SETUP_IMPOSSIBLE, ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_3 | standing-calf-raise | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_3 | side-lying-hip-adduction | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_3 | loop-band-lateral-walk | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_3 | side-lying-dumbbell-external-rotation | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_3 | supine-hamstring-walkout | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_3 | wall-ankle-dorsiflexion-rock | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_3 | bodyweight-hip-hinge-rehearsal | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| vertical pull secondary | phase_3 | single-leg-balance-rehearsal | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_1 | ninety-ninety-breathing | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_1 | serratus-wall-slide | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_1 | dead-bug | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_1 | push-up | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_1 | dumbbell-bench-press | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_1 | machine-chest-press | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_1 | cable-chest-fly | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_1 | chest-supported-dumbbell-row | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_1 | one-arm-dumbbell-row | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_1 | machine-row | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_1 | seated-cable-row | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_1 | band-row | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_1 | dumbbell-shoulder-press | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_1 | lat-pulldown | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_1 | band-lat-pulldown | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_1 | leg-press | MOVEMENT_ROLE_MISMATCH |
| squat main | phase_1 | bodyweight-box-squat | ROLE_MISMATCH, SECTION_MISMATCH |
| squat main | phase_1 | dumbbell-romanian-deadlift | MOVEMENT_ROLE_MISMATCH |
| squat main | phase_1 | cable-pull-through | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH |
| squat main | phase_1 | split-squat | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH |
| squat main | phase_1 | step-up | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH |
| squat main | phase_1 | lying-leg-curl | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_1 | glute-bridge | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH |
| squat main | phase_1 | dumbbell-lateral-raise | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_1 | reverse-pec-deck | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_1 | band-face-pull | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_1 | dumbbell-curl | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_1 | cable-triceps-pressdown | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_1 | pallof-press | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_1 | forearm-plank | SETUP_IMPOSSIBLE, ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_1 | forearm-side-plank | SETUP_IMPOSSIBLE, ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_1 | machine-abdominal-crunch | SETUP_IMPOSSIBLE, ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_1 | half-kneeling-high-to-low-cable-chop | SETUP_IMPOSSIBLE, ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_1 | farmer-carry | SETUP_IMPOSSIBLE, ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_1 | suitcase-carry | SETUP_IMPOSSIBLE, ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_1 | wall-supported-suitcase-march | SETUP_IMPOSSIBLE, ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_1 | standing-calf-raise | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_1 | side-lying-hip-adduction | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_1 | loop-band-lateral-walk | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH |
| squat main | phase_1 | side-lying-dumbbell-external-rotation | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_1 | supine-hamstring-walkout | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH |
| squat main | phase_1 | wall-ankle-dorsiflexion-rock | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_1 | bodyweight-hip-hinge-rehearsal | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH |
| squat main | phase_1 | single-leg-balance-rehearsal | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_2 | ninety-ninety-breathing | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_2 | serratus-wall-slide | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_2 | dead-bug | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_2 | push-up | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_2 | dumbbell-bench-press | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_2 | machine-chest-press | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_2 | cable-chest-fly | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_2 | chest-supported-dumbbell-row | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_2 | one-arm-dumbbell-row | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_2 | machine-row | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_2 | seated-cable-row | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_2 | band-row | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_2 | dumbbell-shoulder-press | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_2 | lat-pulldown | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_2 | band-lat-pulldown | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_2 | leg-press | MOVEMENT_ROLE_MISMATCH |
| squat main | phase_2 | bodyweight-box-squat | ROLE_MISMATCH, SECTION_MISMATCH |
| squat main | phase_2 | dumbbell-romanian-deadlift | MOVEMENT_ROLE_MISMATCH |
| squat main | phase_2 | cable-pull-through | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH |
| squat main | phase_2 | split-squat | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH |
| squat main | phase_2 | step-up | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH |
| squat main | phase_2 | lying-leg-curl | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_2 | glute-bridge | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH |
| squat main | phase_2 | dumbbell-lateral-raise | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_2 | reverse-pec-deck | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_2 | band-face-pull | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_2 | dumbbell-curl | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_2 | cable-triceps-pressdown | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_2 | pallof-press | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_2 | forearm-plank | SETUP_IMPOSSIBLE, ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_2 | forearm-side-plank | SETUP_IMPOSSIBLE, ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_2 | machine-abdominal-crunch | SETUP_IMPOSSIBLE, ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_2 | half-kneeling-high-to-low-cable-chop | SETUP_IMPOSSIBLE, ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_2 | farmer-carry | SETUP_IMPOSSIBLE, ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_2 | suitcase-carry | SETUP_IMPOSSIBLE, ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_2 | wall-supported-suitcase-march | SETUP_IMPOSSIBLE, ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_2 | standing-calf-raise | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_2 | side-lying-hip-adduction | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_2 | loop-band-lateral-walk | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH |
| squat main | phase_2 | side-lying-dumbbell-external-rotation | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_2 | supine-hamstring-walkout | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH |
| squat main | phase_2 | wall-ankle-dorsiflexion-rock | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_2 | bodyweight-hip-hinge-rehearsal | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH |
| squat main | phase_2 | single-leg-balance-rehearsal | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_3 | ninety-ninety-breathing | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_3 | serratus-wall-slide | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_3 | dead-bug | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_3 | push-up | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_3 | dumbbell-bench-press | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_3 | machine-chest-press | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_3 | cable-chest-fly | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_3 | chest-supported-dumbbell-row | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_3 | one-arm-dumbbell-row | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_3 | machine-row | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_3 | seated-cable-row | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_3 | band-row | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_3 | dumbbell-shoulder-press | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_3 | lat-pulldown | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_3 | band-lat-pulldown | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_3 | leg-press | MOVEMENT_ROLE_MISMATCH |
| squat main | phase_3 | bodyweight-box-squat | ROLE_MISMATCH, SECTION_MISMATCH |
| squat main | phase_3 | dumbbell-romanian-deadlift | MOVEMENT_ROLE_MISMATCH |
| squat main | phase_3 | cable-pull-through | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH |
| squat main | phase_3 | split-squat | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH |
| squat main | phase_3 | step-up | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH |
| squat main | phase_3 | lying-leg-curl | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_3 | glute-bridge | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH |
| squat main | phase_3 | dumbbell-lateral-raise | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_3 | reverse-pec-deck | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_3 | band-face-pull | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_3 | dumbbell-curl | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_3 | cable-triceps-pressdown | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_3 | pallof-press | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_3 | forearm-plank | SETUP_IMPOSSIBLE, ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_3 | forearm-side-plank | SETUP_IMPOSSIBLE, ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_3 | machine-abdominal-crunch | SETUP_IMPOSSIBLE, ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_3 | half-kneeling-high-to-low-cable-chop | SETUP_IMPOSSIBLE, ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_3 | farmer-carry | SETUP_IMPOSSIBLE, ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_3 | suitcase-carry | SETUP_IMPOSSIBLE, ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_3 | wall-supported-suitcase-march | SETUP_IMPOSSIBLE, ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_3 | standing-calf-raise | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_3 | side-lying-hip-adduction | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_3 | loop-band-lateral-walk | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH |
| squat main | phase_3 | side-lying-dumbbell-external-rotation | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_3 | supine-hamstring-walkout | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH |
| squat main | phase_3 | wall-ankle-dorsiflexion-rock | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| squat main | phase_3 | bodyweight-hip-hinge-rehearsal | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH |
| squat main | phase_3 | single-leg-balance-rehearsal | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_1 | ninety-ninety-breathing | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_1 | serratus-wall-slide | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_1 | dead-bug | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_1 | push-up | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_1 | dumbbell-bench-press | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_1 | machine-chest-press | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_1 | cable-chest-fly | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_1 | chest-supported-dumbbell-row | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_1 | one-arm-dumbbell-row | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_1 | machine-row | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_1 | seated-cable-row | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_1 | band-row | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_1 | dumbbell-shoulder-press | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_1 | lat-pulldown | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_1 | band-lat-pulldown | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_1 | goblet-squat | MOVEMENT_ROLE_MISMATCH |
| hinge secondary | phase_1 | leg-press | MOVEMENT_ROLE_MISMATCH |
| hinge secondary | phase_1 | bodyweight-box-squat | MOVEMENT_ROLE_MISMATCH |
| hinge secondary | phase_1 | split-squat | MOVEMENT_ROLE_MISMATCH |
| hinge secondary | phase_1 | step-up | MOVEMENT_ROLE_MISMATCH |
| hinge secondary | phase_1 | lying-leg-curl | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH |
| hinge secondary | phase_1 | glute-bridge | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH |
| hinge secondary | phase_1 | dumbbell-lateral-raise | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_1 | reverse-pec-deck | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_1 | band-face-pull | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_1 | dumbbell-curl | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_1 | cable-triceps-pressdown | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_1 | pallof-press | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_1 | forearm-plank | SETUP_IMPOSSIBLE, ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_1 | forearm-side-plank | SETUP_IMPOSSIBLE, ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_1 | machine-abdominal-crunch | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_1 | half-kneeling-high-to-low-cable-chop | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_1 | farmer-carry | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_1 | suitcase-carry | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_1 | wall-supported-suitcase-march | SETUP_IMPOSSIBLE, ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_1 | standing-calf-raise | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_1 | side-lying-hip-adduction | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_1 | loop-band-lateral-walk | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH |
| hinge secondary | phase_1 | side-lying-dumbbell-external-rotation | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_1 | supine-hamstring-walkout | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH |
| hinge secondary | phase_1 | wall-ankle-dorsiflexion-rock | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_1 | bodyweight-hip-hinge-rehearsal | ROLE_MISMATCH, SECTION_MISMATCH |
| hinge secondary | phase_1 | single-leg-balance-rehearsal | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_2 | ninety-ninety-breathing | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_2 | serratus-wall-slide | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_2 | dead-bug | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_2 | push-up | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_2 | dumbbell-bench-press | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_2 | machine-chest-press | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_2 | cable-chest-fly | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_2 | chest-supported-dumbbell-row | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_2 | one-arm-dumbbell-row | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_2 | machine-row | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_2 | seated-cable-row | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_2 | band-row | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_2 | dumbbell-shoulder-press | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_2 | lat-pulldown | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_2 | band-lat-pulldown | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_2 | goblet-squat | MOVEMENT_ROLE_MISMATCH |
| hinge secondary | phase_2 | leg-press | MOVEMENT_ROLE_MISMATCH |
| hinge secondary | phase_2 | bodyweight-box-squat | MOVEMENT_ROLE_MISMATCH |
| hinge secondary | phase_2 | split-squat | MOVEMENT_ROLE_MISMATCH |
| hinge secondary | phase_2 | step-up | MOVEMENT_ROLE_MISMATCH |
| hinge secondary | phase_2 | lying-leg-curl | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH |
| hinge secondary | phase_2 | glute-bridge | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH |
| hinge secondary | phase_2 | dumbbell-lateral-raise | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_2 | reverse-pec-deck | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_2 | band-face-pull | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_2 | dumbbell-curl | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_2 | cable-triceps-pressdown | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_2 | pallof-press | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_2 | forearm-plank | SETUP_IMPOSSIBLE, ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_2 | forearm-side-plank | SETUP_IMPOSSIBLE, ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_2 | machine-abdominal-crunch | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_2 | half-kneeling-high-to-low-cable-chop | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_2 | farmer-carry | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_2 | suitcase-carry | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_2 | wall-supported-suitcase-march | SETUP_IMPOSSIBLE, ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_2 | standing-calf-raise | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_2 | side-lying-hip-adduction | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_2 | loop-band-lateral-walk | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH |
| hinge secondary | phase_2 | side-lying-dumbbell-external-rotation | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_2 | supine-hamstring-walkout | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH |
| hinge secondary | phase_2 | wall-ankle-dorsiflexion-rock | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_2 | bodyweight-hip-hinge-rehearsal | ROLE_MISMATCH, SECTION_MISMATCH |
| hinge secondary | phase_2 | single-leg-balance-rehearsal | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_3 | ninety-ninety-breathing | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_3 | serratus-wall-slide | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_3 | dead-bug | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_3 | push-up | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_3 | dumbbell-bench-press | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_3 | machine-chest-press | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_3 | cable-chest-fly | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_3 | chest-supported-dumbbell-row | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_3 | one-arm-dumbbell-row | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_3 | machine-row | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_3 | seated-cable-row | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_3 | band-row | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_3 | dumbbell-shoulder-press | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_3 | lat-pulldown | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_3 | band-lat-pulldown | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_3 | goblet-squat | MOVEMENT_ROLE_MISMATCH |
| hinge secondary | phase_3 | leg-press | MOVEMENT_ROLE_MISMATCH |
| hinge secondary | phase_3 | bodyweight-box-squat | MOVEMENT_ROLE_MISMATCH |
| hinge secondary | phase_3 | split-squat | MOVEMENT_ROLE_MISMATCH |
| hinge secondary | phase_3 | step-up | MOVEMENT_ROLE_MISMATCH |
| hinge secondary | phase_3 | lying-leg-curl | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH |
| hinge secondary | phase_3 | glute-bridge | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH |
| hinge secondary | phase_3 | dumbbell-lateral-raise | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_3 | reverse-pec-deck | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_3 | band-face-pull | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_3 | dumbbell-curl | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_3 | cable-triceps-pressdown | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_3 | pallof-press | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_3 | forearm-plank | SETUP_IMPOSSIBLE, ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_3 | forearm-side-plank | SETUP_IMPOSSIBLE, ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_3 | machine-abdominal-crunch | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_3 | half-kneeling-high-to-low-cable-chop | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_3 | farmer-carry | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_3 | suitcase-carry | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_3 | wall-supported-suitcase-march | SETUP_IMPOSSIBLE, ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_3 | standing-calf-raise | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_3 | side-lying-hip-adduction | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_3 | loop-band-lateral-walk | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH |
| hinge secondary | phase_3 | side-lying-dumbbell-external-rotation | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_3 | supine-hamstring-walkout | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH |
| hinge secondary | phase_3 | wall-ankle-dorsiflexion-rock | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| hinge secondary | phase_3 | bodyweight-hip-hinge-rehearsal | ROLE_MISMATCH, SECTION_MISMATCH |
| hinge secondary | phase_3 | single-leg-balance-rehearsal | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_1 | ninety-ninety-breathing | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_1 | serratus-wall-slide | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_1 | dead-bug | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_1 | push-up | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_1 | dumbbell-bench-press | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_1 | machine-chest-press | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_1 | cable-chest-fly | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_1 | chest-supported-dumbbell-row | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_1 | one-arm-dumbbell-row | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_1 | machine-row | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_1 | seated-cable-row | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_1 | band-row | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_1 | dumbbell-shoulder-press | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_1 | lat-pulldown | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_1 | band-lat-pulldown | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_1 | goblet-squat | ROLE_MISMATCH |
| single-leg accessory | phase_1 | leg-press | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH |
| single-leg accessory | phase_1 | bodyweight-box-squat | ROLE_MISMATCH |
| single-leg accessory | phase_1 | dumbbell-romanian-deadlift | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH |
| single-leg accessory | phase_1 | cable-pull-through | MOVEMENT_ROLE_MISMATCH |
| single-leg accessory | phase_1 | lying-leg-curl | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_1 | glute-bridge | MOVEMENT_ROLE_MISMATCH |
| single-leg accessory | phase_1 | dumbbell-lateral-raise | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_1 | reverse-pec-deck | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_1 | band-face-pull | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_1 | dumbbell-curl | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_1 | cable-triceps-pressdown | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_1 | pallof-press | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_1 | forearm-plank | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_1 | forearm-side-plank | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_1 | machine-abdominal-crunch | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_1 | half-kneeling-high-to-low-cable-chop | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_1 | farmer-carry | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_1 | suitcase-carry | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_1 | wall-supported-suitcase-march | SETUP_IMPOSSIBLE, ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_1 | standing-calf-raise | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_1 | side-lying-hip-adduction | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_1 | loop-band-lateral-walk | MOVEMENT_ROLE_MISMATCH |
| single-leg accessory | phase_1 | side-lying-dumbbell-external-rotation | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_1 | supine-hamstring-walkout | MOVEMENT_ROLE_MISMATCH |
| single-leg accessory | phase_1 | wall-ankle-dorsiflexion-rock | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_1 | bodyweight-hip-hinge-rehearsal | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH |
| single-leg accessory | phase_1 | single-leg-balance-rehearsal | ROLE_MISMATCH, SECTION_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_2 | ninety-ninety-breathing | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_2 | serratus-wall-slide | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_2 | dead-bug | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_2 | push-up | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_2 | dumbbell-bench-press | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_2 | machine-chest-press | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_2 | cable-chest-fly | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_2 | chest-supported-dumbbell-row | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_2 | one-arm-dumbbell-row | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_2 | machine-row | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_2 | seated-cable-row | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_2 | band-row | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_2 | dumbbell-shoulder-press | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_2 | lat-pulldown | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_2 | band-lat-pulldown | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_2 | goblet-squat | ROLE_MISMATCH |
| single-leg accessory | phase_2 | leg-press | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH |
| single-leg accessory | phase_2 | bodyweight-box-squat | ROLE_MISMATCH |
| single-leg accessory | phase_2 | dumbbell-romanian-deadlift | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH |
| single-leg accessory | phase_2 | cable-pull-through | MOVEMENT_ROLE_MISMATCH |
| single-leg accessory | phase_2 | lying-leg-curl | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_2 | glute-bridge | MOVEMENT_ROLE_MISMATCH |
| single-leg accessory | phase_2 | dumbbell-lateral-raise | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_2 | reverse-pec-deck | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_2 | band-face-pull | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_2 | dumbbell-curl | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_2 | cable-triceps-pressdown | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_2 | pallof-press | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_2 | forearm-plank | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_2 | forearm-side-plank | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_2 | machine-abdominal-crunch | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_2 | half-kneeling-high-to-low-cable-chop | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_2 | farmer-carry | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_2 | suitcase-carry | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_2 | wall-supported-suitcase-march | SETUP_IMPOSSIBLE, ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_2 | standing-calf-raise | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_2 | side-lying-hip-adduction | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_2 | loop-band-lateral-walk | MOVEMENT_ROLE_MISMATCH |
| single-leg accessory | phase_2 | side-lying-dumbbell-external-rotation | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_2 | supine-hamstring-walkout | MOVEMENT_ROLE_MISMATCH |
| single-leg accessory | phase_2 | wall-ankle-dorsiflexion-rock | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_2 | bodyweight-hip-hinge-rehearsal | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH |
| single-leg accessory | phase_2 | single-leg-balance-rehearsal | ROLE_MISMATCH, SECTION_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_3 | ninety-ninety-breathing | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_3 | serratus-wall-slide | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_3 | dead-bug | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_3 | push-up | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_3 | dumbbell-bench-press | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_3 | machine-chest-press | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_3 | cable-chest-fly | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_3 | chest-supported-dumbbell-row | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_3 | one-arm-dumbbell-row | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_3 | machine-row | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_3 | seated-cable-row | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_3 | band-row | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_3 | dumbbell-shoulder-press | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_3 | lat-pulldown | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_3 | band-lat-pulldown | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_3 | goblet-squat | ROLE_MISMATCH |
| single-leg accessory | phase_3 | leg-press | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH |
| single-leg accessory | phase_3 | bodyweight-box-squat | ROLE_MISMATCH |
| single-leg accessory | phase_3 | dumbbell-romanian-deadlift | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH |
| single-leg accessory | phase_3 | cable-pull-through | MOVEMENT_ROLE_MISMATCH |
| single-leg accessory | phase_3 | lying-leg-curl | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_3 | glute-bridge | MOVEMENT_ROLE_MISMATCH |
| single-leg accessory | phase_3 | dumbbell-lateral-raise | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_3 | reverse-pec-deck | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_3 | band-face-pull | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_3 | dumbbell-curl | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_3 | cable-triceps-pressdown | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_3 | pallof-press | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_3 | forearm-plank | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_3 | forearm-side-plank | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_3 | machine-abdominal-crunch | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_3 | half-kneeling-high-to-low-cable-chop | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_3 | farmer-carry | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_3 | suitcase-carry | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_3 | wall-supported-suitcase-march | SETUP_IMPOSSIBLE, ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_3 | standing-calf-raise | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_3 | side-lying-hip-adduction | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_3 | loop-band-lateral-walk | MOVEMENT_ROLE_MISMATCH |
| single-leg accessory | phase_3 | side-lying-dumbbell-external-rotation | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_3 | supine-hamstring-walkout | MOVEMENT_ROLE_MISMATCH |
| single-leg accessory | phase_3 | wall-ankle-dorsiflexion-rock | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| single-leg accessory | phase_3 | bodyweight-hip-hinge-rehearsal | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH |
| single-leg accessory | phase_3 | single-leg-balance-rehearsal | ROLE_MISMATCH, SECTION_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_1 | ninety-ninety-breathing | ROLE_MISMATCH, SECTION_MISMATCH |
| trunk activation | phase_1 | serratus-wall-slide | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_1 | push-up | ROLE_MISMATCH, SECTION_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_1 | dumbbell-bench-press | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_1 | machine-chest-press | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_1 | cable-chest-fly | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_1 | chest-supported-dumbbell-row | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_1 | one-arm-dumbbell-row | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_1 | machine-row | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_1 | seated-cable-row | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_1 | band-row | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_1 | dumbbell-shoulder-press | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_1 | lat-pulldown | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_1 | band-lat-pulldown | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_1 | goblet-squat | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_1 | leg-press | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_1 | bodyweight-box-squat | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_1 | dumbbell-romanian-deadlift | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_1 | cable-pull-through | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_1 | split-squat | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_1 | step-up | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_1 | lying-leg-curl | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_1 | glute-bridge | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_1 | dumbbell-lateral-raise | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_1 | reverse-pec-deck | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_1 | band-face-pull | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_1 | dumbbell-curl | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_1 | cable-triceps-pressdown | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_1 | forearm-plank | SETUP_IMPOSSIBLE |
| trunk activation | phase_1 | forearm-side-plank | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH |
| trunk activation | phase_1 | machine-abdominal-crunch | SETUP_IMPOSSIBLE, ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH |
| trunk activation | phase_1 | half-kneeling-high-to-low-cable-chop | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH |
| trunk activation | phase_1 | farmer-carry | SETUP_IMPOSSIBLE, ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH |
| trunk activation | phase_1 | suitcase-carry | SETUP_IMPOSSIBLE, ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH |
| trunk activation | phase_1 | wall-supported-suitcase-march | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH |
| trunk activation | phase_1 | standing-calf-raise | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_1 | side-lying-hip-adduction | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_1 | loop-band-lateral-walk | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_1 | side-lying-dumbbell-external-rotation | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_1 | supine-hamstring-walkout | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_1 | wall-ankle-dorsiflexion-rock | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_1 | bodyweight-hip-hinge-rehearsal | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_1 | single-leg-balance-rehearsal | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_2 | ninety-ninety-breathing | ROLE_MISMATCH, SECTION_MISMATCH |
| trunk activation | phase_2 | serratus-wall-slide | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_2 | push-up | ROLE_MISMATCH, SECTION_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_2 | dumbbell-bench-press | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_2 | machine-chest-press | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_2 | cable-chest-fly | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_2 | chest-supported-dumbbell-row | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_2 | one-arm-dumbbell-row | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_2 | machine-row | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_2 | seated-cable-row | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_2 | band-row | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_2 | dumbbell-shoulder-press | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_2 | lat-pulldown | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_2 | band-lat-pulldown | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_2 | goblet-squat | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_2 | leg-press | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_2 | bodyweight-box-squat | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_2 | dumbbell-romanian-deadlift | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_2 | cable-pull-through | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_2 | split-squat | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_2 | step-up | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_2 | lying-leg-curl | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_2 | glute-bridge | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_2 | dumbbell-lateral-raise | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_2 | reverse-pec-deck | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_2 | band-face-pull | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_2 | dumbbell-curl | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_2 | cable-triceps-pressdown | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_2 | forearm-plank | SETUP_IMPOSSIBLE |
| trunk activation | phase_2 | forearm-side-plank | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH |
| trunk activation | phase_2 | machine-abdominal-crunch | SETUP_IMPOSSIBLE, ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH |
| trunk activation | phase_2 | half-kneeling-high-to-low-cable-chop | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH |
| trunk activation | phase_2 | farmer-carry | SETUP_IMPOSSIBLE, ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH |
| trunk activation | phase_2 | suitcase-carry | SETUP_IMPOSSIBLE, ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH |
| trunk activation | phase_2 | wall-supported-suitcase-march | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH |
| trunk activation | phase_2 | standing-calf-raise | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_2 | side-lying-hip-adduction | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_2 | loop-band-lateral-walk | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_2 | side-lying-dumbbell-external-rotation | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_2 | supine-hamstring-walkout | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_2 | wall-ankle-dorsiflexion-rock | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_2 | bodyweight-hip-hinge-rehearsal | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_2 | single-leg-balance-rehearsal | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_3 | ninety-ninety-breathing | ROLE_MISMATCH, SECTION_MISMATCH |
| trunk activation | phase_3 | serratus-wall-slide | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_3 | push-up | ROLE_MISMATCH, SECTION_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_3 | dumbbell-bench-press | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_3 | machine-chest-press | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_3 | cable-chest-fly | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_3 | chest-supported-dumbbell-row | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_3 | one-arm-dumbbell-row | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_3 | machine-row | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_3 | seated-cable-row | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_3 | band-row | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_3 | dumbbell-shoulder-press | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_3 | lat-pulldown | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_3 | band-lat-pulldown | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_3 | goblet-squat | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_3 | leg-press | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_3 | bodyweight-box-squat | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_3 | dumbbell-romanian-deadlift | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_3 | cable-pull-through | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_3 | split-squat | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_3 | step-up | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_3 | lying-leg-curl | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_3 | glute-bridge | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_3 | dumbbell-lateral-raise | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_3 | reverse-pec-deck | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_3 | band-face-pull | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_3 | dumbbell-curl | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_3 | cable-triceps-pressdown | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_3 | forearm-plank | SETUP_IMPOSSIBLE |
| trunk activation | phase_3 | forearm-side-plank | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH |
| trunk activation | phase_3 | machine-abdominal-crunch | SETUP_IMPOSSIBLE, ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH |
| trunk activation | phase_3 | half-kneeling-high-to-low-cable-chop | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH |
| trunk activation | phase_3 | farmer-carry | SETUP_IMPOSSIBLE, ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH |
| trunk activation | phase_3 | suitcase-carry | SETUP_IMPOSSIBLE, ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH |
| trunk activation | phase_3 | wall-supported-suitcase-march | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH |
| trunk activation | phase_3 | standing-calf-raise | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_3 | side-lying-hip-adduction | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_3 | loop-band-lateral-walk | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_3 | side-lying-dumbbell-external-rotation | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_3 | supine-hamstring-walkout | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_3 | wall-ankle-dorsiflexion-rock | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_3 | bodyweight-hip-hinge-rehearsal | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| trunk activation | phase_3 | single-leg-balance-rehearsal | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_1 | ninety-ninety-breathing | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_1 | dead-bug | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_1 | push-up | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_1 | dumbbell-bench-press | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_1 | machine-chest-press | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_1 | cable-chest-fly | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_1 | chest-supported-dumbbell-row | ROLE_MISMATCH, SECTION_MISMATCH |
| scapular activation | phase_1 | one-arm-dumbbell-row | ROLE_MISMATCH, SECTION_MISMATCH |
| scapular activation | phase_1 | machine-row | ROLE_MISMATCH, SECTION_MISMATCH |
| scapular activation | phase_1 | seated-cable-row | ROLE_MISMATCH, SECTION_MISMATCH |
| scapular activation | phase_1 | dumbbell-shoulder-press | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_1 | lat-pulldown | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_1 | band-lat-pulldown | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_1 | goblet-squat | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_1 | leg-press | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_1 | bodyweight-box-squat | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_1 | dumbbell-romanian-deadlift | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_1 | cable-pull-through | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_1 | split-squat | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_1 | step-up | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_1 | lying-leg-curl | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_1 | glute-bridge | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_1 | dumbbell-lateral-raise | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_1 | dumbbell-curl | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_1 | cable-triceps-pressdown | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_1 | pallof-press | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_1 | forearm-plank | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_1 | forearm-side-plank | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_1 | machine-abdominal-crunch | SETUP_IMPOSSIBLE, ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_1 | half-kneeling-high-to-low-cable-chop | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_1 | farmer-carry | SETUP_IMPOSSIBLE, ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH |
| scapular activation | phase_1 | suitcase-carry | SETUP_IMPOSSIBLE, ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH |
| scapular activation | phase_1 | wall-supported-suitcase-march | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_1 | standing-calf-raise | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_1 | side-lying-hip-adduction | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_1 | loop-band-lateral-walk | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_1 | side-lying-dumbbell-external-rotation | MOVEMENT_ROLE_MISMATCH |
| scapular activation | phase_1 | supine-hamstring-walkout | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_1 | wall-ankle-dorsiflexion-rock | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_1 | bodyweight-hip-hinge-rehearsal | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_1 | single-leg-balance-rehearsal | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_2 | ninety-ninety-breathing | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_2 | dead-bug | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_2 | push-up | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_2 | dumbbell-bench-press | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_2 | machine-chest-press | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_2 | cable-chest-fly | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_2 | chest-supported-dumbbell-row | ROLE_MISMATCH, SECTION_MISMATCH |
| scapular activation | phase_2 | one-arm-dumbbell-row | ROLE_MISMATCH, SECTION_MISMATCH |
| scapular activation | phase_2 | machine-row | ROLE_MISMATCH, SECTION_MISMATCH |
| scapular activation | phase_2 | seated-cable-row | ROLE_MISMATCH, SECTION_MISMATCH |
| scapular activation | phase_2 | dumbbell-shoulder-press | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_2 | lat-pulldown | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_2 | band-lat-pulldown | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_2 | goblet-squat | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_2 | leg-press | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_2 | bodyweight-box-squat | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_2 | dumbbell-romanian-deadlift | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_2 | cable-pull-through | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_2 | split-squat | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_2 | step-up | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_2 | lying-leg-curl | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_2 | glute-bridge | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_2 | dumbbell-lateral-raise | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_2 | dumbbell-curl | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_2 | cable-triceps-pressdown | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_2 | pallof-press | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_2 | forearm-plank | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_2 | forearm-side-plank | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_2 | machine-abdominal-crunch | SETUP_IMPOSSIBLE, ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_2 | half-kneeling-high-to-low-cable-chop | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_2 | farmer-carry | SETUP_IMPOSSIBLE, ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH |
| scapular activation | phase_2 | suitcase-carry | SETUP_IMPOSSIBLE, ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH |
| scapular activation | phase_2 | wall-supported-suitcase-march | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_2 | standing-calf-raise | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_2 | side-lying-hip-adduction | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_2 | loop-band-lateral-walk | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_2 | side-lying-dumbbell-external-rotation | MOVEMENT_ROLE_MISMATCH |
| scapular activation | phase_2 | supine-hamstring-walkout | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_2 | wall-ankle-dorsiflexion-rock | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_2 | bodyweight-hip-hinge-rehearsal | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_2 | single-leg-balance-rehearsal | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_3 | ninety-ninety-breathing | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_3 | dead-bug | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_3 | push-up | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_3 | dumbbell-bench-press | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_3 | machine-chest-press | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_3 | cable-chest-fly | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_3 | chest-supported-dumbbell-row | ROLE_MISMATCH, SECTION_MISMATCH |
| scapular activation | phase_3 | one-arm-dumbbell-row | ROLE_MISMATCH, SECTION_MISMATCH |
| scapular activation | phase_3 | machine-row | ROLE_MISMATCH, SECTION_MISMATCH |
| scapular activation | phase_3 | seated-cable-row | ROLE_MISMATCH, SECTION_MISMATCH |
| scapular activation | phase_3 | dumbbell-shoulder-press | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_3 | lat-pulldown | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_3 | band-lat-pulldown | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_3 | goblet-squat | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_3 | leg-press | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_3 | bodyweight-box-squat | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_3 | dumbbell-romanian-deadlift | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_3 | cable-pull-through | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_3 | split-squat | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_3 | step-up | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_3 | lying-leg-curl | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_3 | glute-bridge | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_3 | dumbbell-lateral-raise | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_3 | dumbbell-curl | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_3 | cable-triceps-pressdown | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_3 | pallof-press | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_3 | forearm-plank | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_3 | forearm-side-plank | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_3 | machine-abdominal-crunch | SETUP_IMPOSSIBLE, ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_3 | half-kneeling-high-to-low-cable-chop | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_3 | farmer-carry | SETUP_IMPOSSIBLE, ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH |
| scapular activation | phase_3 | suitcase-carry | SETUP_IMPOSSIBLE, ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH |
| scapular activation | phase_3 | wall-supported-suitcase-march | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_3 | standing-calf-raise | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_3 | side-lying-hip-adduction | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_3 | loop-band-lateral-walk | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_3 | side-lying-dumbbell-external-rotation | MOVEMENT_ROLE_MISMATCH |
| scapular activation | phase_3 | supine-hamstring-walkout | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_3 | wall-ankle-dorsiflexion-rock | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_3 | bodyweight-hip-hinge-rehearsal | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| scapular activation | phase_3 | single-leg-balance-rehearsal | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_1 | ninety-ninety-breathing | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_1 | serratus-wall-slide | ROLE_MISMATCH, SECTION_MISMATCH |
| rear-delt accessory | phase_1 | dead-bug | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_1 | push-up | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_1 | dumbbell-bench-press | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_1 | machine-chest-press | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_1 | cable-chest-fly | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_1 | chest-supported-dumbbell-row | ROLE_MISMATCH |
| rear-delt accessory | phase_1 | one-arm-dumbbell-row | ROLE_MISMATCH |
| rear-delt accessory | phase_1 | machine-row | ROLE_MISMATCH |
| rear-delt accessory | phase_1 | seated-cable-row | ROLE_MISMATCH |
| rear-delt accessory | phase_1 | dumbbell-shoulder-press | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_1 | lat-pulldown | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_1 | band-lat-pulldown | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_1 | goblet-squat | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_1 | leg-press | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_1 | bodyweight-box-squat | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_1 | dumbbell-romanian-deadlift | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_1 | cable-pull-through | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_1 | split-squat | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_1 | step-up | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_1 | lying-leg-curl | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_1 | glute-bridge | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_1 | dumbbell-lateral-raise | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_1 | dumbbell-curl | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_1 | cable-triceps-pressdown | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_1 | pallof-press | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_1 | forearm-plank | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_1 | forearm-side-plank | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_1 | machine-abdominal-crunch | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_1 | half-kneeling-high-to-low-cable-chop | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_1 | farmer-carry | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH |
| rear-delt accessory | phase_1 | suitcase-carry | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH |
| rear-delt accessory | phase_1 | wall-supported-suitcase-march | SETUP_IMPOSSIBLE, ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_1 | standing-calf-raise | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_1 | side-lying-hip-adduction | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_1 | loop-band-lateral-walk | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_1 | side-lying-dumbbell-external-rotation | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_1 | supine-hamstring-walkout | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_1 | wall-ankle-dorsiflexion-rock | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_1 | bodyweight-hip-hinge-rehearsal | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_1 | single-leg-balance-rehearsal | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_2 | ninety-ninety-breathing | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_2 | serratus-wall-slide | ROLE_MISMATCH, SECTION_MISMATCH |
| rear-delt accessory | phase_2 | dead-bug | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_2 | push-up | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_2 | dumbbell-bench-press | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_2 | machine-chest-press | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_2 | cable-chest-fly | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_2 | chest-supported-dumbbell-row | ROLE_MISMATCH |
| rear-delt accessory | phase_2 | one-arm-dumbbell-row | ROLE_MISMATCH |
| rear-delt accessory | phase_2 | machine-row | ROLE_MISMATCH |
| rear-delt accessory | phase_2 | seated-cable-row | ROLE_MISMATCH |
| rear-delt accessory | phase_2 | dumbbell-shoulder-press | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_2 | lat-pulldown | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_2 | band-lat-pulldown | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_2 | goblet-squat | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_2 | leg-press | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_2 | bodyweight-box-squat | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_2 | dumbbell-romanian-deadlift | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_2 | cable-pull-through | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_2 | split-squat | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_2 | step-up | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_2 | lying-leg-curl | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_2 | glute-bridge | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_2 | dumbbell-lateral-raise | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_2 | dumbbell-curl | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_2 | cable-triceps-pressdown | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_2 | pallof-press | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_2 | forearm-plank | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_2 | forearm-side-plank | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_2 | machine-abdominal-crunch | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_2 | half-kneeling-high-to-low-cable-chop | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_2 | farmer-carry | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH |
| rear-delt accessory | phase_2 | suitcase-carry | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH |
| rear-delt accessory | phase_2 | wall-supported-suitcase-march | SETUP_IMPOSSIBLE, ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_2 | standing-calf-raise | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_2 | side-lying-hip-adduction | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_2 | loop-band-lateral-walk | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_2 | side-lying-dumbbell-external-rotation | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_2 | supine-hamstring-walkout | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_2 | wall-ankle-dorsiflexion-rock | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_2 | bodyweight-hip-hinge-rehearsal | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_2 | single-leg-balance-rehearsal | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_3 | ninety-ninety-breathing | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_3 | serratus-wall-slide | ROLE_MISMATCH, SECTION_MISMATCH |
| rear-delt accessory | phase_3 | dead-bug | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_3 | push-up | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_3 | dumbbell-bench-press | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_3 | machine-chest-press | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_3 | cable-chest-fly | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_3 | chest-supported-dumbbell-row | ROLE_MISMATCH |
| rear-delt accessory | phase_3 | one-arm-dumbbell-row | ROLE_MISMATCH |
| rear-delt accessory | phase_3 | machine-row | ROLE_MISMATCH |
| rear-delt accessory | phase_3 | seated-cable-row | ROLE_MISMATCH |
| rear-delt accessory | phase_3 | dumbbell-shoulder-press | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_3 | lat-pulldown | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_3 | band-lat-pulldown | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_3 | goblet-squat | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_3 | leg-press | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_3 | bodyweight-box-squat | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_3 | dumbbell-romanian-deadlift | ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_3 | cable-pull-through | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_3 | split-squat | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_3 | step-up | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_3 | lying-leg-curl | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_3 | glute-bridge | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_3 | dumbbell-lateral-raise | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_3 | dumbbell-curl | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_3 | cable-triceps-pressdown | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_3 | pallof-press | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_3 | forearm-plank | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_3 | forearm-side-plank | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_3 | machine-abdominal-crunch | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_3 | half-kneeling-high-to-low-cable-chop | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_3 | farmer-carry | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH |
| rear-delt accessory | phase_3 | suitcase-carry | SETUP_IMPOSSIBLE, MOVEMENT_ROLE_MISMATCH |
| rear-delt accessory | phase_3 | wall-supported-suitcase-march | SETUP_IMPOSSIBLE, ROLE_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_3 | standing-calf-raise | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_3 | side-lying-hip-adduction | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_3 | loop-band-lateral-walk | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_3 | side-lying-dumbbell-external-rotation | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_3 | supine-hamstring-walkout | MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_3 | wall-ankle-dorsiflexion-rock | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_3 | bodyweight-hip-hinge-rehearsal | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |
| rear-delt accessory | phase_3 | single-leg-balance-rehearsal | ROLE_MISMATCH, SECTION_MISMATCH, MOVEMENT_ROLE_MISMATCH, TARGET_MUSCLE_MISMATCH |

## Goal-Independence Matrix

The phase is held constant while `CandidateRequest.goal` and the mirrored need goal vary on one truthful horizontal-pull accessory need. Then the same goal is visible across all three phases.

| Phase | Request Goal | Phase primaryGoal | Winner | Runner-Up | Winner goal_fit | Legal Candidates |
| --- | --- | --- | --- | --- | --- | --- |
| phase_1 | hypertrophy | posture_and_movement_quality | band-row | chest-supported-dumbbell-row | 8.000 | band-row, chest-supported-dumbbell-row, machine-row, seated-cable-row, one-arm-dumbbell-row |
| phase_1 | strength | posture_and_movement_quality | chest-supported-dumbbell-row | machine-row | 8.500 | chest-supported-dumbbell-row, machine-row, seated-cable-row, band-row, one-arm-dumbbell-row |
| phase_1 | posture_and_movement_quality | posture_and_movement_quality | band-row | chest-supported-dumbbell-row | 6.500 | band-row, chest-supported-dumbbell-row, machine-row, seated-cable-row, one-arm-dumbbell-row |
| phase_1 | general_fitness | posture_and_movement_quality | band-row | chest-supported-dumbbell-row | 7.000 | band-row, chest-supported-dumbbell-row, machine-row, seated-cable-row, one-arm-dumbbell-row |
| phase_1 | pain_aware_return | posture_and_movement_quality | band-row | chest-supported-dumbbell-row | 6.500 | band-row, chest-supported-dumbbell-row, machine-row, seated-cable-row, one-arm-dumbbell-row |
| phase_1 | conditioning | posture_and_movement_quality | band-row | chest-supported-dumbbell-row | 6.000 | band-row, chest-supported-dumbbell-row, machine-row, seated-cable-row, one-arm-dumbbell-row |
| phase_2 | hypertrophy | strength | machine-row | seated-cable-row | 8.000 | machine-row, seated-cable-row, chest-supported-dumbbell-row, one-arm-dumbbell-row, band-row |
| phase_2 | strength | strength | machine-row | seated-cable-row | 8.500 | machine-row, seated-cable-row, chest-supported-dumbbell-row, one-arm-dumbbell-row, band-row |
| phase_2 | posture_and_movement_quality | strength | machine-row | seated-cable-row | 6.500 | machine-row, seated-cable-row, chest-supported-dumbbell-row, band-row, one-arm-dumbbell-row |
| phase_2 | general_fitness | strength | machine-row | seated-cable-row | 7.000 | machine-row, seated-cable-row, chest-supported-dumbbell-row, band-row, one-arm-dumbbell-row |
| phase_2 | pain_aware_return | strength | machine-row | seated-cable-row | 6.500 | machine-row, seated-cable-row, chest-supported-dumbbell-row, band-row, one-arm-dumbbell-row |
| phase_2 | conditioning | strength | machine-row | seated-cable-row | 6.000 | machine-row, seated-cable-row, chest-supported-dumbbell-row, band-row, one-arm-dumbbell-row |
| phase_3 | hypertrophy | hypertrophy | chest-supported-dumbbell-row | one-arm-dumbbell-row | 8.000 | chest-supported-dumbbell-row, one-arm-dumbbell-row, machine-row, seated-cable-row, band-row |
| phase_3 | strength | hypertrophy | chest-supported-dumbbell-row | one-arm-dumbbell-row | 8.500 | chest-supported-dumbbell-row, one-arm-dumbbell-row, machine-row, seated-cable-row, band-row |
| phase_3 | posture_and_movement_quality | hypertrophy | chest-supported-dumbbell-row | one-arm-dumbbell-row | 6.500 | chest-supported-dumbbell-row, one-arm-dumbbell-row, machine-row, seated-cable-row, band-row |
| phase_3 | general_fitness | hypertrophy | chest-supported-dumbbell-row | one-arm-dumbbell-row | 7.000 | chest-supported-dumbbell-row, one-arm-dumbbell-row, machine-row, seated-cable-row, band-row |
| phase_3 | pain_aware_return | hypertrophy | chest-supported-dumbbell-row | one-arm-dumbbell-row | 6.500 | chest-supported-dumbbell-row, one-arm-dumbbell-row, machine-row, seated-cable-row, band-row |
| phase_3 | conditioning | hypertrophy | chest-supported-dumbbell-row | one-arm-dumbbell-row | 6.000 | chest-supported-dumbbell-row, one-arm-dumbbell-row, machine-row, seated-cable-row, band-row |

`CandidateRequest.goal` is the goal-fit scoring authority. `PhaseIntent.primaryGoal` is unused and neither changes the goal component nor overwrites the user's goal. Conditioning has no dedicated goal-fit branch in the current component and therefore receives the default raw value; that is explicit current behavior, not a phase conclusion.

## Experience-Independence Matrix

Goal, phase, horizontal-push need, equipment and every other input are fixed while experience varies.

| Phase | Experience | Winner | Runner-Up | Winner experience_fit | Winner phase_fit | Legal Free-Weight/Bodyweight Candidates | Full Legal Pool |
| --- | --- | --- | --- | --- | --- | --- | --- |
| phase_1 | novice | machine-chest-press | push-up | 8.400 | 8.300 | push-up, dumbbell-bench-press | machine-chest-press, push-up, dumbbell-bench-press |
| phase_1 | beginner | machine-chest-press | push-up | 7.860 | 8.300 | push-up, dumbbell-bench-press | machine-chest-press, push-up, dumbbell-bench-press |
| phase_1 | intermediate | machine-chest-press | push-up | 6.915 | 8.300 | push-up, dumbbell-bench-press | machine-chest-press, push-up, dumbbell-bench-press |
| phase_1 | advanced | machine-chest-press | push-up | 6.240 | 8.300 | push-up, dumbbell-bench-press | machine-chest-press, push-up, dumbbell-bench-press |
| phase_2 | novice | machine-chest-press | dumbbell-bench-press | 8.400 | 7.800 | dumbbell-bench-press, push-up | machine-chest-press, dumbbell-bench-press, push-up |
| phase_2 | beginner | dumbbell-bench-press | machine-chest-press | 7.590 | 8.800 | dumbbell-bench-press, push-up | dumbbell-bench-press, machine-chest-press, push-up |
| phase_2 | intermediate | dumbbell-bench-press | push-up | 8.265 | 8.800 | dumbbell-bench-press, push-up | dumbbell-bench-press, push-up, machine-chest-press |
| phase_2 | advanced | dumbbell-bench-press | push-up | 7.590 | 8.800 | dumbbell-bench-press, push-up | dumbbell-bench-press, push-up, machine-chest-press |
| phase_3 | novice | machine-chest-press | dumbbell-bench-press | 8.400 | 8.600 | dumbbell-bench-press, push-up | machine-chest-press, dumbbell-bench-press, push-up |
| phase_3 | beginner | dumbbell-bench-press | machine-chest-press | 7.590 | 9.600 | dumbbell-bench-press, push-up | dumbbell-bench-press, machine-chest-press, push-up |
| phase_3 | intermediate | dumbbell-bench-press | machine-chest-press | 8.265 | 9.600 | dumbbell-bench-press, push-up | dumbbell-bench-press, machine-chest-press, push-up |
| phase_3 | advanced | dumbbell-bench-press | machine-chest-press | 7.590 | 9.600 | dumbbell-bench-press, push-up | dumbbell-bench-press, machine-chest-press, push-up |

Phase 1 does not hard-gate the pool to machines: dumbbell bench press and push-up remain legal for every experience. Advanced does not create instability preference, and Phase 3 does not replace the independent experience-fit calculation. Phase and experience can both affect totals, including repeated skill-related facts identified in the overlap audit.

## Continuity Across Phases

| State | Phase | Winner | Current Rank / Total | Current phase_fit | Current continuity | Continuity Reason | Current progression | Transition Auto Effect |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| current | phase_1 | chest-supported-dumbbell-row | 1 / 7.943 | 8.300 | 6.700 | CONTINUITY_FAVORED | 7.600 | none |
| current | phase_2 | chest-supported-dumbbell-row | 1 / 8.046 | 8.800 | 6.700 | CONTINUITY_FAVORED | 8.150 | none |
| current | phase_3 | chest-supported-dumbbell-row | 1 / 8.138 | 9.600 | 6.700 | CONTINUITY_FAVORED | 8.150 | none |
| productive | phase_1 | chest-supported-dumbbell-row | 1 / 8.015 | 8.300 | 8.000 | CONTINUITY_FAVORED | 7.600 | none |
| productive | phase_2 | chest-supported-dumbbell-row | 1 / 8.119 | 8.800 | 8.000 | CONTINUITY_FAVORED | 8.150 | none |
| productive | phase_3 | chest-supported-dumbbell-row | 1 / 8.210 | 9.600 | 8.000 | CONTINUITY_FAVORED | 8.150 | none |
| stable | phase_1 | chest-supported-dumbbell-row | 1 / 7.982 | 8.300 | 7.400 | CONTINUITY_FAVORED | 7.600 | none |
| stable | phase_2 | chest-supported-dumbbell-row | 1 / 8.085 | 8.800 | 7.400 | CONTINUITY_FAVORED | 8.150 | none |
| stable | phase_3 | chest-supported-dumbbell-row | 1 / 8.177 | 9.600 | 7.400 | CONTINUITY_FAVORED | 8.150 | none |
| ready_to_progress | phase_1 | chest-supported-dumbbell-row | 1 / 7.998 | 8.300 | 6.700 | CONTINUITY_FAVORED | 8.600 | none |
| ready_to_progress | phase_2 | chest-supported-dumbbell-row | 1 / 8.102 | 8.800 | 6.700 | CONTINUITY_FAVORED | 9.150 | none |
| ready_to_progress | phase_3 | chest-supported-dumbbell-row | 1 / 8.193 | 9.600 | 6.700 | CONTINUITY_FAVORED | 9.150 | none |
| plateaued | phase_1 | machine-row | 3 / 7.793 | 8.300 | 5.200 | REPLACEMENT_JUSTIFIED | 6.400 | none |
| plateaued | phase_2 | machine-row | 3 / 7.896 | 8.800 | 5.200 | REPLACEMENT_JUSTIFIED | 6.950 | none |
| plateaued | phase_3 | machine-row | 3 / 7.988 | 9.600 | 5.200 | REPLACEMENT_JUSTIFIED | 6.950 | none |
| failed_progression | phase_1 | machine-row | 3 / 7.821 | 8.300 | 5.500 | REPLACEMENT_JUSTIFIED | 6.600 | none |
| failed_progression | phase_2 | machine-row | 3 / 7.924 | 8.800 | 5.500 | REPLACEMENT_JUSTIFIED | 7.150 | none |
| failed_progression | phase_3 | machine-row | 3 / 8.015 | 9.600 | 5.500 | REPLACEMENT_JUSTIFIED | 7.150 | none |
| pain_response | phase_1 | machine-row | 3 / 7.821 | 8.300 | 4.500 | REPLACEMENT_JUSTIFIED | 7.600 | none |
| pain_response | phase_2 | machine-row | 3 / 7.924 | 8.800 | 4.500 | REPLACEMENT_JUSTIFIED | 8.150 | none |
| pain_response | phase_3 | machine-row | 3 / 8.015 | 9.600 | 4.500 | REPLACEMENT_JUSTIFIED | 8.150 | none |
| productive_stable_ready | phase_1 | chest-supported-dumbbell-row | 1 / 8.110 | 8.300 | 8.700 | CONTINUITY_FAVORED | 8.600 | none |
| productive_stable_ready | phase_2 | chest-supported-dumbbell-row | 1 / 8.213 | 8.800 | 8.700 | CONTINUITY_FAVORED | 9.150 | none |
| productive_stable_ready | phase_3 | chest-supported-dumbbell-row | 1 / 8.304 | 9.600 | 8.700 | CONTINUITY_FAVORED | 9.150 | none |

### Policy F - Continuity-Preserving Contrast

This observability-only contrast keeps the current exercise and its continuity evidence fixed while phase changes. Productive, stable and ready-to-progress rows show where continuity and phase preference coexist or disagree; no secret continuity override is added.

Productive, stable and ready-to-progress evidence remains active in every phase. `readyToProgress` raises same-exercise `progression_value`; it does not request replacement. Plateau, failed progression and pain response remain explicit reconsideration evidence. Phase change alone does not activate a transition, and every reviewed relationship retains `automaticSelectionEffect=none`. A phase-fit disadvantage can move rank but never becomes a hard gate.

## Pain And Assessment Interaction

| Scenario | Phase | Winner | One-Arm Rank | One-Arm phase_fit | assessment_fit | pain_suitability | Pain Readiness | Hard Rejections | Assessment Traces |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| neutral | phase_1 | chest-supported-dumbbell-row | 4 | 6.200 | 6.000 | 8.200 | EXECUTABLE_AT_CANDIDATE_SCOPE | none | 0 |
| neutral | phase_2 | machine-row | 4 | 7.800 | 6.000 | 8.200 | EXECUTABLE_AT_CANDIDATE_SCOPE | none | 0 |
| neutral | phase_3 | chest-supported-dumbbell-row | 4 | 9.600 | 6.000 | 8.200 | EXECUTABLE_AT_CANDIDATE_SCOPE | none | 0 |
| relevant_assessment | phase_1 | chest-supported-dumbbell-row | 4 | 6.200 | 6.390 | 8.200 | EXECUTABLE_AT_CANDIDATE_SCOPE | none | 1 |
| relevant_assessment | phase_2 | machine-row | 4 | 7.800 | 6.390 | 8.200 | EXECUTABLE_AT_CANDIDATE_SCOPE | none | 1 |
| relevant_assessment | phase_3 | chest-supported-dumbbell-row | 4 | 9.600 | 6.390 | 8.200 | EXECUTABLE_AT_CANDIDATE_SCOPE | none | 1 |
| current_discomfort | phase_1 | chest-supported-dumbbell-row | 4 | 6.200 | 6.000 | 8.200 | EXECUTABLE_AT_CANDIDATE_SCOPE | none | 0 |
| current_discomfort | phase_2 | machine-row | 4 | 7.800 | 6.000 | 8.200 | EXECUTABLE_AT_CANDIDATE_SCOPE | none | 0 |
| current_discomfort | phase_3 | chest-supported-dumbbell-row | 4 | 9.600 | 6.000 | 8.200 | EXECUTABLE_AT_CANDIDATE_SCOPE | none | 0 |
| moderate_candidate_review | phase_1 | chest-supported-dumbbell-row | 4 | 6.200 | 6.000 | 8.200 | EXECUTABLE_AT_CANDIDATE_SCOPE | none | 0 |
| moderate_candidate_review | phase_2 | machine-row | 4 | 7.800 | 6.000 | 8.200 | EXECUTABLE_AT_CANDIDATE_SCOPE | none | 0 |
| moderate_candidate_review | phase_3 | chest-supported-dumbbell-row | 4 | 9.600 | 6.000 | 8.200 | EXECUTABLE_AT_CANDIDATE_SCOPE | none | 0 |
| moderate_prescription_required | phase_1 | chest-supported-dumbbell-row | 4 | 6.200 | 6.000 | 8.200 | EXECUTABLE_AT_CANDIDATE_SCOPE | none | 0 |
| moderate_prescription_required | phase_2 | machine-row | 4 | 7.800 | 6.000 | 8.200 | EXECUTABLE_AT_CANDIDATE_SCOPE | none | 0 |
| moderate_prescription_required | phase_3 | chest-supported-dumbbell-row | 4 | 9.600 | 6.000 | 8.200 | EXECUTABLE_AT_CANDIDATE_SCOPE | none | 0 |
| moderate_role_substitution | phase_1 | chest-supported-dumbbell-row | 4 | 6.200 | 6.000 | 8.200 | EXECUTABLE_AT_CANDIDATE_SCOPE | none | 0 |
| moderate_role_substitution | phase_2 | machine-row | 4 | 7.800 | 6.000 | 8.200 | EXECUTABLE_AT_CANDIDATE_SCOPE | none | 0 |
| moderate_role_substitution | phase_3 | chest-supported-dumbbell-row | 4 | 9.600 | 6.000 | 8.200 | EXECUTABLE_AT_CANDIDATE_SCOPE | none | 0 |
| productive_continuity | phase_1 | chest-supported-dumbbell-row | 4 | 6.200 | 6.000 | 8.200 | EXECUTABLE_AT_CANDIDATE_SCOPE | none | 0 |
| productive_continuity | phase_2 | one-arm-dumbbell-row | 1 | 7.800 | 6.000 | 8.200 | EXECUTABLE_AT_CANDIDATE_SCOPE | none | 0 |
| productive_continuity | phase_3 | one-arm-dumbbell-row | 1 | 9.600 | 6.000 | 8.200 | EXECUTABLE_AT_CANDIDATE_SCOPE | none | 0 |
| hard_contraindication | phase_1 | chest-supported-dumbbell-row | - | - | - | - | hard_rejected | one-arm-dumbbell-row | 0 |
| hard_contraindication | phase_2 | machine-row | - | - | - | - | hard_rejected | one-arm-dumbbell-row | 0 |
| hard_contraindication | phase_3 | chest-supported-dumbbell-row | - | - | - | - | hard_rejected | one-arm-dumbbell-row | 0 |

The relevant assessment remains independently traceable across phases. Current and moderate pain keep their canonical score/readiness authority; phase cannot turn candidate review, prescription or role-substitution work into executable behavior. The hard-contraindicated candidate remains rejected in every phase. Productive continuity remains visible without bypassing pain or eligibility.

## Policy Sensitivity Laboratory

| Policy | Family | Phase Weight | Category Map | Mechanical Bonuses | Description |
| --- | --- | --- | --- | --- | --- |
| A_CURRENT | CURRENT | 1 | 8.8/7.8/6.2/5.5 | yes | Current categories, current Phase 1/3 mechanical bonuses and weight 1.00. |
| B_ANNOTATION_ONLY | ANNOTATION_ONLY | 1 | 8.8/7.8/6.2/5.5 | no | Current category map with both explicit mechanical bonuses removed. |
| C_NO_PHASE_COMPONENT | NO_PHASE | omitted | none | no | The copied experimental component array omits phase_fit. |
| D_WEIGHT_025 | WEIGHT | 0.25 | 8.8/7.8/6.2/5.5 | yes | Current component shape with only the phase_suitability family weight changed. |
| D_WEIGHT_05 | WEIGHT | 0.5 | 8.8/7.8/6.2/5.5 | yes | Current component shape with only the phase_suitability family weight changed. |
| D_WEIGHT_075 | WEIGHT | 0.75 | 8.8/7.8/6.2/5.5 | yes | Current component shape with only the phase_suitability family weight changed. |
| D_WEIGHT_1 | WEIGHT | 1 | 8.8/7.8/6.2/5.5 | yes | Current component shape with only the phase_suitability family weight changed. |
| D_WEIGHT_125 | WEIGHT | 1.25 | 8.8/7.8/6.2/5.5 | yes | Current component shape with only the phase_suitability family weight changed. |
| E_GENTLE_GAP | CATEGORICAL_GAP | 1 | 8/7.6/7.2/6.8 | yes | Ordered 8.0/7.6/7.2/6.8 mapping with current mechanical bonuses. |
| E_MODERATE_GAP | CATEGORICAL_GAP | 1 | 8.4/7.7/6.8/6.2 | yes | Ordered 8.4/7.7/6.8/6.2 mapping with current mechanical bonuses. |
| E_CURRENT_GAP | CATEGORICAL_GAP | 1 | 8.8/7.8/6.2/5.5 | yes | Current 8.8/7.8/6.2/5.5 mapping with current mechanical bonuses. |

| Policy | Rank Changes | Winner Changes | Ties Created | Ties Broken | Affected Candidates |
| --- | --- | --- | --- | --- | --- |
| A_CURRENT | 0 | 0 | 0 | 0 | none |
| B_ANNOTATION_ONLY | 0 | 0 | 0 | 0 | none |
| C_NO_PHASE_COMPONENT | 13 | 5 | 0 | 0 | band-face-pull, cable-pull-through, chest-supported-dumbbell-row, dumbbell-bench-press, dumbbell-romanian-deadlift, machine-chest-press, machine-row, push-up, reverse-pec-deck, seated-cable-row, serratus-wall-slide, split-squat, step-up |
| D_WEIGHT_025 | 8 | 4 | 0 | 0 | band-face-pull, cable-pull-through, dumbbell-romanian-deadlift, machine-chest-press, push-up, reverse-pec-deck, split-squat, step-up |
| D_WEIGHT_05 | 6 | 3 | 0 | 0 | band-face-pull, cable-pull-through, dumbbell-romanian-deadlift, reverse-pec-deck, split-squat, step-up |
| D_WEIGHT_075 | 0 | 0 | 0 | 0 | none |
| D_WEIGHT_1 | 0 | 0 | 0 | 0 | none |
| D_WEIGHT_125 | 2 | 1 | 0 | 0 | band-face-pull, reverse-pec-deck |
| E_GENTLE_GAP | 6 | 3 | 0 | 0 | band-face-pull, cable-pull-through, dumbbell-romanian-deadlift, reverse-pec-deck, split-squat, step-up |
| E_MODERATE_GAP | 0 | 0 | 0 | 0 | none |
| E_CURRENT_GAP | 0 | 0 | 0 | 0 | none |

Current-control self-comparison: rank changes=0, winner changes=0. Rank movement is sensitivity evidence only; it is not evidence that a policy is better.

### Winner Changes

| Policy | Need | Phase | Current Winner | Experimental Winner | Current Winner phase_fit | Experimental Winner phase_fit | Margin Before | Margin After |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| C_NO_PHASE_COMPONENT | horizontal push main | phase_1 | machine-chest-press | push-up | 8.300 | 0.000 | 0.091 | 0.012 |
| C_NO_PHASE_COMPONENT | horizontal pull main | phase_3 | chest-supported-dumbbell-row | machine-row | 9.600 | 0.000 | 0.058 | 0.000 |
| C_NO_PHASE_COMPONENT | hinge secondary | phase_1 | cable-pull-through | dumbbell-romanian-deadlift | 8.300 | 0.000 | 0.060 | 0.074 |
| C_NO_PHASE_COMPONENT | single-leg accessory | phase_3 | split-squat | step-up | 8.800 | 0.000 | 0.020 | 0.044 |
| C_NO_PHASE_COMPONENT | scapular activation | phase_3 | reverse-pec-deck | band-face-pull | 8.800 | 0.000 | 0.076 | 0.065 |
| D_WEIGHT_025 | horizontal push main | phase_1 | machine-chest-press | push-up | 8.300 | 6.200 | 0.091 | 0.006 |
| D_WEIGHT_025 | hinge secondary | phase_1 | cable-pull-through | dumbbell-romanian-deadlift | 8.300 | 6.200 | 0.060 | 0.039 |
| D_WEIGHT_025 | single-leg accessory | phase_3 | split-squat | step-up | 8.800 | 7.800 | 0.020 | 0.027 |
| D_WEIGHT_025 | scapular activation | phase_3 | reverse-pec-deck | band-face-pull | 8.800 | 6.200 | 0.076 | 0.046 |
| D_WEIGHT_05 | hinge secondary | phase_1 | cable-pull-through | dumbbell-romanian-deadlift | 8.300 | 6.200 | 0.060 | 0.004 |
| D_WEIGHT_05 | single-leg accessory | phase_3 | split-squat | step-up | 8.800 | 7.800 | 0.020 | 0.011 |
| D_WEIGHT_05 | scapular activation | phase_3 | reverse-pec-deck | band-face-pull | 8.800 | 6.200 | 0.076 | 0.004 |
| D_WEIGHT_125 | rear-delt accessory | phase_1 | reverse-pec-deck | band-face-pull | 8.300 | 9.300 | 0.001 | 0.014 |
| E_GENTLE_GAP | hinge secondary | phase_1 | cable-pull-through | dumbbell-romanian-deadlift | 8.300 | 7.200 | 0.060 | 0.013 |
| E_GENTLE_GAP | single-leg accessory | phase_3 | split-squat | step-up | 8.800 | 7.600 | 0.020 | 0.017 |
| E_GENTLE_GAP | scapular activation | phase_3 | reverse-pec-deck | band-face-pull | 8.800 | 7.200 | 0.076 | 0.034 |

### Smallest Weight Thresholds

| Need | Phase | Nearest Changed Weight | Distance From 1.00 | Current Winner | Changed Winner |
| --- | --- | --- | --- | --- | --- |
| horizontal push main | phase_1 | 0.25 | 0.75 | machine-chest-press | push-up |
| hinge secondary | phase_1 | 0.50 | 0.50 | cable-pull-through | dumbbell-romanian-deadlift |
| single-leg accessory | phase_3 | 0.50 | 0.50 | split-squat | step-up |
| scapular activation | phase_3 | 0.50 | 0.50 | reverse-pec-deck | band-face-pull |
| rear-delt accessory | phase_1 | 1.25 | 0.25 | reverse-pec-deck | band-face-pull |

### Phase Movement Attribution

Movement caused only by explicit Phase 1/3 mechanical bonuses:

- None in the tested legal pools.

Movement that remains with annotation-only phase_fit:

- hinge secondary/cable-pull-through: current=[1,2,2], annotation-only=[1,2,2]
- hinge secondary/dumbbell-romanian-deadlift: current=[2,1,1], annotation-only=[2,1,1]
- horizontal pull main/chest-supported-dumbbell-row: current=[1,3,1], annotation-only=[1,3,1]
- horizontal pull main/machine-row: current=[2,1,2], annotation-only=[2,1,2]
- horizontal pull main/seated-cable-row: current=[3,2,3], annotation-only=[3,2,3]
- horizontal push main/dumbbell-bench-press: current=[3,1,1], annotation-only=[3,1,1]
- horizontal push main/machine-chest-press: current=[1,3,2], annotation-only=[1,3,2]
- horizontal push main/push-up: current=[2,2,3], annotation-only=[2,2,3]
- scapular activation/band-face-pull: current=[1,1,2], annotation-only=[1,1,2]
- scapular activation/reverse-pec-deck: current=[3,3,1], annotation-only=[3,3,1]
- scapular activation/serratus-wall-slide: current=[2,2,3], annotation-only=[2,2,3]
- single-leg accessory/split-squat: current=[2,2,1], annotation-only=[2,2,1]
- single-leg accessory/step-up: current=[1,1,2], annotation-only=[1,1,2]
- trunk activation/dead-bug: current=[1,2,2], annotation-only=[1,2,2]
- trunk activation/pallof-press: current=[2,1,1], annotation-only=[2,1,1]

## Human Coaching Review

Meaningful means a winner change or a top-two ordering/membership change. All such changes are shown below; lower-pool rank movements remain counted in the policy summaries.

| Scenario | Enduring Goal | Experience | Phase | Current Winner | Experimental Winner | Why Current Won | Why Experimental Won | Phase Effect | Other Effects | Continuity | Assessment | Pain Readiness | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| C_NO_PHASE_COMPONENT / horizontal push main / winner change | strength | intermediate | phase_1 | machine-chest-press | push-up | phase_fit=8.300 (advantage 0.129630); stimulus_potential=9.700 (advantage 0.061111); stability_fit=8.500 (advantage 0.056173); skill_fit=8.500 (advantage 0.023765) | progression_value=8.150 (advantage 0.065132); loadability=8.150 (advantage 0.044736); fatigue_cost=8.450 (advantage 0.036842); experience_fit=7.590 (advantage 0.031085) | current 8.300; experimental omitted | role_fit=8.000 (0.736842); pain_suitability=8.200 (0.647368); goal_fit=8.500 (0.615132) | 5.600 -> 5.600 | 6.000 -> 6.000 | EXECUTABLE_AT_CANDIDATE_SCOPE -> EXECUTABLE_AT_CANDIDATE_SCOPE | QUESTIONABLE |
| C_NO_PHASE_COMPONENT / horizontal pull main / winner change | strength | intermediate | phase_3 | chest-supported-dumbbell-row | machine-row | phase_fit=9.600 (advantage 0.061729) | equipment_practicality=8.350 (advantage 0.003947) | current 9.600; experimental omitted | role_fit=8.000 (0.736842); pain_suitability=8.200 (0.647368); session_intent_fit=9.500 (0.625000) | 5.600 -> 5.600 | 6.000 -> 6.000 | EXECUTABLE_AT_CANDIDATE_SCOPE -> EXECUTABLE_AT_CANDIDATE_SCOPE | QUESTIONABLE |
| C_NO_PHASE_COMPONENT / hinge secondary / winner change | strength | intermediate | phase_1 | cable-pull-through | dumbbell-romanian-deadlift | phase_fit=8.300 (advantage 0.129630); fatigue_cost=8.450 (advantage 0.058333); skill_fit=8.500 (advantage 0.047531); loadability=8.150 (advantage 0.041975) | goal_fit=8.500 (advantage 0.108553); stimulus_potential=9.700 (advantage 0.065131); experience_fit=8.265 (advantage 0.062171); equipment_practicality=8.700 (advantage 0.013816) | current 8.300; experimental omitted | role_fit=8.000 (0.736842); pain_suitability=8.200 (0.647368); goal_fit=8.500 (0.615132) | 5.600 -> 5.600 | 6.000 -> 6.000 | EXECUTABLE_AT_CANDIDATE_SCOPE -> EXECUTABLE_AT_CANDIDATE_SCOPE | QUESTIONABLE |
| C_NO_PHASE_COMPONENT / single-leg accessory / winner change | hypertrophy | intermediate | phase_3 | split-squat | step-up | phase_fit=8.800 (advantage 0.061729); equipment_practicality=8.700 (advantage 0.016666) | fatigue_cost=8.450 (advantage 0.062171) | current 8.800; experimental omitted | role_fit=8.000 (0.736842); pain_suitability=8.200 (0.647368); session_intent_fit=9.500 (0.625000) | 5.600 -> 5.600 | 6.000 -> 6.000 | EXECUTABLE_AT_CANDIDATE_SCOPE -> EXECUTABLE_AT_CANDIDATE_SCOPE | QUESTIONABLE |
| C_NO_PHASE_COMPONENT / scapular activation / winner change | posture_and_movement_quality | intermediate | phase_3 | reverse-pec-deck | band-face-pull | phase_fit=8.800 (advantage 0.160494); stimulus_potential=7.900 (advantage 0.041667); progression_value=8.150 (advantage 0.030556); skill_fit=8.500 (advantage 0.023765) | muscle_target_fit=8.900 (advantage 0.085526); session_intent_fit=9.500 (advantage 0.049342); experience_fit=7.590 (advantage 0.031085); fatigue_cost=9.000 (advantage 0.025329) | current 8.800; experimental omitted | role_fit=8.000 (0.736842); pain_suitability=8.200 (0.647368); session_intent_fit=9.500 (0.625000) | 5.600 -> 5.600 | 6.000 -> 6.000 | EXECUTABLE_AT_CANDIDATE_SCOPE -> EXECUTABLE_AT_CANDIDATE_SCOPE | QUESTIONABLE |
| D_WEIGHT_025 / horizontal push main / winner change | strength | intermediate | phase_1 | machine-chest-press | push-up | phase_fit=8.300 (advantage 0.129630); stimulus_potential=9.700 (advantage 0.061111); stability_fit=8.500 (advantage 0.056173); skill_fit=8.500 (advantage 0.023765) | progression_value=8.150 (advantage 0.064077); loadability=8.150 (advantage 0.044012); fatigue_cost=8.450 (advantage 0.036246); experience_fit=7.590 (advantage 0.030582) | current 8.300; experimental 6.200 | role_fit=8.000 (0.724919); pain_suitability=8.200 (0.636893); goal_fit=8.500 (0.605178) | 5.600 -> 5.600 | 6.000 -> 6.000 | EXECUTABLE_AT_CANDIDATE_SCOPE -> EXECUTABLE_AT_CANDIDATE_SCOPE | PLAUSIBLE_NEEDS_REVIEW |
| D_WEIGHT_025 / hinge secondary / winner change | strength | intermediate | phase_1 | cable-pull-through | dumbbell-romanian-deadlift | phase_fit=8.300 (advantage 0.129630); fatigue_cost=8.450 (advantage 0.058333); skill_fit=8.500 (advantage 0.047531); loadability=8.150 (advantage 0.041975) | goal_fit=8.500 (advantage 0.106796); stimulus_potential=9.700 (advantage 0.064078); experience_fit=8.265 (advantage 0.061165); equipment_practicality=8.700 (advantage 0.013592) | current 8.300; experimental 6.200 | role_fit=8.000 (0.724919); pain_suitability=8.200 (0.636893); goal_fit=8.500 (0.605178) | 5.600 -> 5.600 | 6.000 -> 6.000 | EXECUTABLE_AT_CANDIDATE_SCOPE -> EXECUTABLE_AT_CANDIDATE_SCOPE | PLAUSIBLE_NEEDS_REVIEW |
| D_WEIGHT_025 / single-leg accessory / winner change | hypertrophy | intermediate | phase_3 | split-squat | step-up | phase_fit=8.800 (advantage 0.061729); equipment_practicality=8.700 (advantage 0.016666) | fatigue_cost=8.450 (advantage 0.061165) | current 8.800; experimental 7.800 | role_fit=8.000 (0.724919); pain_suitability=8.200 (0.636893); session_intent_fit=9.500 (0.614887) | 5.600 -> 5.600 | 6.000 -> 6.000 | EXECUTABLE_AT_CANDIDATE_SCOPE -> EXECUTABLE_AT_CANDIDATE_SCOPE | PLAUSIBLE_NEEDS_REVIEW |
| D_WEIGHT_025 / scapular activation / winner change | posture_and_movement_quality | intermediate | phase_3 | reverse-pec-deck | band-face-pull | phase_fit=8.800 (advantage 0.160494); stimulus_potential=7.900 (advantage 0.041667); progression_value=8.150 (advantage 0.030556); skill_fit=8.500 (advantage 0.023765) | muscle_target_fit=8.900 (advantage 0.084143); session_intent_fit=9.500 (advantage 0.048544); experience_fit=7.590 (advantage 0.030582); fatigue_cost=9.000 (advantage 0.024919) | current 8.800; experimental 6.200 | role_fit=8.000 (0.724919); pain_suitability=8.200 (0.636893); session_intent_fit=9.500 (0.614887) | 5.600 -> 5.600 | 6.000 -> 6.000 | EXECUTABLE_AT_CANDIDATE_SCOPE -> EXECUTABLE_AT_CANDIDATE_SCOPE | PLAUSIBLE_NEEDS_REVIEW |
| D_WEIGHT_05 / hinge secondary / winner change | strength | intermediate | phase_1 | cable-pull-through | dumbbell-romanian-deadlift | phase_fit=8.300 (advantage 0.129630); fatigue_cost=8.450 (advantage 0.058333); skill_fit=8.500 (advantage 0.047531); loadability=8.150 (advantage 0.041975) | goal_fit=8.500 (advantage 0.105095); stimulus_potential=9.700 (advantage 0.063057); experience_fit=8.265 (advantage 0.060191); equipment_practicality=8.700 (advantage 0.013376) | current 8.300; experimental 6.200 | role_fit=8.000 (0.713376); pain_suitability=8.200 (0.626752); goal_fit=8.500 (0.595541) | 5.600 -> 5.600 | 6.000 -> 6.000 | EXECUTABLE_AT_CANDIDATE_SCOPE -> EXECUTABLE_AT_CANDIDATE_SCOPE | PLAUSIBLE_NEEDS_REVIEW |
| D_WEIGHT_05 / single-leg accessory / winner change | hypertrophy | intermediate | phase_3 | split-squat | step-up | phase_fit=8.800 (advantage 0.061729); equipment_practicality=8.700 (advantage 0.016666) | fatigue_cost=8.450 (advantage 0.060191) | current 8.800; experimental 7.800 | role_fit=8.000 (0.713376); pain_suitability=8.200 (0.626752); session_intent_fit=9.500 (0.605096) | 5.600 -> 5.600 | 6.000 -> 6.000 | EXECUTABLE_AT_CANDIDATE_SCOPE -> EXECUTABLE_AT_CANDIDATE_SCOPE | PLAUSIBLE_NEEDS_REVIEW |
| D_WEIGHT_05 / scapular activation / winner change | posture_and_movement_quality | intermediate | phase_3 | reverse-pec-deck | band-face-pull | phase_fit=8.800 (advantage 0.160494); stimulus_potential=7.900 (advantage 0.041667); progression_value=8.150 (advantage 0.030556); skill_fit=8.500 (advantage 0.023765) | muscle_target_fit=8.900 (advantage 0.082803); session_intent_fit=9.500 (advantage 0.047771); experience_fit=7.590 (advantage 0.030096); fatigue_cost=9.000 (advantage 0.024522) | current 8.800; experimental 6.200 | role_fit=8.000 (0.713376); pain_suitability=8.200 (0.626752); session_intent_fit=9.500 (0.605096) | 5.600 -> 5.600 | 6.000 -> 6.000 | EXECUTABLE_AT_CANDIDATE_SCOPE -> EXECUTABLE_AT_CANDIDATE_SCOPE | PLAUSIBLE_NEEDS_REVIEW |
| D_WEIGHT_125 / rear-delt accessory / winner change | hypertrophy | intermediate | phase_1 | reverse-pec-deck | band-face-pull | stimulus_potential=8.600 (advantage 0.061111); session_intent_fit=9.500 (advantage 0.046297); skill_fit=8.500 (advantage 0.023765) | phase_fit=9.300 (advantage 0.075988); experience_fit=7.590 (advantage 0.028724); fatigue_cost=9.000 (advantage 0.023405); equipment_practicality=8.700 (advantage 0.012766) | current 8.300; experimental 9.300 | role_fit=8.000 (0.680851); pain_suitability=8.200 (0.598176); goal_fit=8.000 (0.534954) | 5.600 -> 5.600 | 6.000 -> 6.000 | EXECUTABLE_AT_CANDIDATE_SCOPE -> EXECUTABLE_AT_CANDIDATE_SCOPE | PLAUSIBLE_NEEDS_REVIEW |
| E_GENTLE_GAP / hinge secondary / winner change | strength | intermediate | phase_1 | cable-pull-through | dumbbell-romanian-deadlift | phase_fit=8.300 (advantage 0.129630); fatigue_cost=8.450 (advantage 0.058333); skill_fit=8.500 (advantage 0.047531); loadability=8.150 (advantage 0.041975) | goal_fit=8.500 (advantage 0.101851); stimulus_potential=9.700 (advantage 0.061111); experience_fit=8.265 (advantage 0.058334); equipment_practicality=8.700 (advantage 0.012963) | current 8.300; experimental 7.200 | role_fit=8.000 (0.691358); pain_suitability=8.200 (0.607407); goal_fit=8.500 (0.577160) | 5.600 -> 5.600 | 6.000 -> 6.000 | EXECUTABLE_AT_CANDIDATE_SCOPE -> EXECUTABLE_AT_CANDIDATE_SCOPE | PLAUSIBLE_NEEDS_REVIEW |
| E_GENTLE_GAP / single-leg accessory / winner change | hypertrophy | intermediate | phase_3 | split-squat | step-up | phase_fit=8.800 (advantage 0.061729); equipment_practicality=8.700 (advantage 0.016666) | fatigue_cost=8.450 (advantage 0.058333) | current 8.800; experimental 7.600 | role_fit=8.000 (0.691358); pain_suitability=8.200 (0.607407); session_intent_fit=9.500 (0.586420) | 5.600 -> 5.600 | 6.000 -> 6.000 | EXECUTABLE_AT_CANDIDATE_SCOPE -> EXECUTABLE_AT_CANDIDATE_SCOPE | PLAUSIBLE_NEEDS_REVIEW |
| E_GENTLE_GAP / scapular activation / winner change | posture_and_movement_quality | intermediate | phase_3 | reverse-pec-deck | band-face-pull | phase_fit=8.800 (advantage 0.160494); stimulus_potential=7.900 (advantage 0.041667); progression_value=8.150 (advantage 0.030556); skill_fit=8.500 (advantage 0.023765) | muscle_target_fit=8.900 (advantage 0.080247); session_intent_fit=9.500 (advantage 0.046297); experience_fit=7.590 (advantage 0.029167); fatigue_cost=9.000 (advantage 0.023766) | current 8.800; experimental 7.200 | role_fit=8.000 (0.691358); pain_suitability=8.200 (0.607407); session_intent_fit=9.500 (0.586420) | 5.600 -> 5.600 | 6.000 -> 6.000 | EXECUTABLE_AT_CANDIDATE_SCOPE -> EXECUTABLE_AT_CANDIDATE_SCOPE | PLAUSIBLE_NEEDS_REVIEW |

`QUESTIONABLE` for no-phase cases means removing developmental candidate evidence entirely needs owner justification; it is not an automatic recommendation to retain current math. Other changes remain `PLAUSIBLE_NEEDS_REVIEW` because score movement alone cannot settle coaching quality.

## Phase-Annotation Counterfactuals

| Invariant | Result |
| --- | --- |
| Mechanically identical candidates with different phase annotations differ only through phase_fit | PASS |
| Changing only phaseSuitability leaves eligibility unchanged | PASS |
| Changing only phaseSuitability leaves pain readiness unchanged | PASS |
| Changing only phaseSuitability leaves progression and transition behavior unchanged | PASS |
| Changing only phase reason prose leaves scoring unchanged | PASS |
| Unspecified phase annotation remains explicit fallback | PASS; phase_fit=5.500 |

Unspecified means the explicit 5.5 fallback. It does not become excellent, easy, safe or preferred, and it does not alter legal truth.

## Candidate Phase Fit vs Composer Phase Coherence

Candidate Intelligence owns one legal exercise's inspectable phase appropriateness and bounded developmental preference. It does not own complete-session phase expression, section allocation, exercise cooperation, redundancy, sequencing, dosage or unresolved pain-response execution.

Future Session Composer owns warm-up/activation/main/accessory/cooldown cooperation, combinations, fatigue, redundancy and session-level phase expression. Future Weekly Composer owns weekly volume, frequency, recovery spacing, coverage, priority frequency, stress budgets, carries and phase-wide stimulus distribution.

## Weekly Development Ledger Handoff

The future Weekly Composer should derive individualized target bands, not universal quotas:

- Muscle exposure: minimum, target range, soft ceiling, and direct versus meaningful secondary credit.
- Movement exposure: push, pull, squat, hinge, single-leg, trunk, scapular-control needs, and carry where appropriate.
- Assessment-priority exposure.
- Joint/stress exposure.
- Recovery spacing.
- Capacity exposure: grip, trunk, loaded gait and conditioning.

Targets should begin from experience-level priors and adjust for enduring goal, phase, pain, assessment, priority muscles, available days/time, equipment, adherence, fatigue and response history. Candidate Intelligence does not implement this ledger.

## Carry Handoff

| Question | Finding |
| --- | --- |
| MovementRole contains carry | yes |
| Reference carry exercises | farmer-carry, suitcase-carry |
| Candidate scenarios requesting carry | none |
| Concrete session/week carry allocation | no |

Farmer and suitcase carries now provide canonical production candidates, while controlled scenarios and concrete session/week allocation remain intentionally unimplemented.

A carry is not mandatory filler. Future selection should require a real need such as grip capacity, trunk capacity, loaded gait, unilateral control, work capacity, conditioning or assessment-relevant asymmetry. Placement must consider pulling grip fatigue, hinge/trunk fatigue, unilateral loading already present, next-day recovery, equipment, duration and carry-specific prescription units.

## Phase Advancement Boundary

Advancement criteria are represented but unconsumed. This task does not implement them. Future advancement must evaluate exposure, adherence, movement competency, progression history, pain stability, fatigue/recovery and phase-specific milestones. Calendar time alone must never advance a phase.

## Unresolved Exercise-Science Questions

- Should the explicit Phase 1 skill/stability and Phase 3 loadability bonuses be removed because their exact facts already have dedicated components?
- What reviewed evidence should distinguish excellent, good, possible and unspecified phase suitability for each exercise?
- Should phase annotations gain their own provenance and review-status contract before any category is treated as settled exercise science?
- What categorical gaps and phase-family weight create useful developmental preference without overpowering goal, continuity or assessment truth?
- Should PhaseIntent.primaryGoal be renamed or reframed so it cannot be mistaken for the athlete's enduring CandidateRequest.goal?
- Which phase differences belong in candidate selection versus prescription, session composition, weekly target bands or progression policy?
- When a productive exercise has lower current phase preference, what evidence should justify replacement rather than KEEP + PROGRESS?
- How should phase appropriateness be validated for vertical-push pools where the current reference catalog has only one truthful secondary-strength candidate?
- Which longitudinal outcomes should validate phase annotations, phase advancement and exercise continuity across phases?

## Recommended Policy Shape

- Keep phase as one bounded, inspectable candidate-level preference; it must not become eligibility or replace the enduring user goal.
- Prefer reviewed exercise phase annotations as the phase_fit evidence channel, with explicit provenance/review status added in a later approved metadata change.
- Remove or independently justify direct mechanical bonuses that reread loadability, skill and stability facts already owned by dedicated components.
- Retain phase progression-axis matching in progression_value because it describes same-exercise runway rather than phase_fit or replacement.
- Let the project owner choose the final category gaps and weight after reviewing winner changes and near ties; this laboratory does not select those production values.
- Preserve KEEP + PROGRESS across phase boundaries and leave whole-session, whole-week, dosage and advancement coherence to their future owners.

This recommends a semantic shape, not production coefficients, category values, metadata edits or a selected policy. Those require explicit project-owner approval.

## Explicit Uncertainty

The controlled reference catalog is small, several pools contain only two candidates, vertical-push secondary contains one, annotations lack phase-specific provenance, and no longitudinal outcome data validates a phase coefficient or category gap. Rank stability or movement inside these pools cannot establish physiological superiority. Whole-session and whole-week effects remain untested because their composers do not yet exist.

## Final Classification And Remaining P1

Phase audit: **PHASE_POLICY_READY_FOR_OWNER_DECISION**

Remaining Candidate Intelligence P1 work:

- Project-owner approval of the final Candidate Intelligence phase policy.
- Implementation and full revalidation of the approved phase policy before Session Composer.

Overall Candidate Intelligence remains **TARGETED_FIXES_REQUIRED_BEFORE_SESSION_COMPOSITION**. Do not start Session Composer until the owner approves a phase policy, that policy is implemented in a separate reviewed change, and final readiness is revalidated.

## Blueprint Maintenance

No blueprint amendment is required by this audit. The blueprint already establishes phase as first-class, preserves the user goal, rejects machine-only/hardest-is-best shortcuts, allows continuity across phases, and assigns complete-session/week coherence to future composers. Temporary policy grids, current score values and test counts remain in this report only.
