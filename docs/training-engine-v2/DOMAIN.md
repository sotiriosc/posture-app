# Training Engine V2 Domain

`ENGINE_V2_BLUEPRINT.md` is authoritative.

## Athlete And Input

The package avoids a single giant person object. Engine input composes:

- `AthleteProfile`
- `AssessmentState`
- `PainAndInjuryState`
- `EquipmentCapabilities`
- `TrainingHistory`
- `CurrentTrainingState`
- `CandidateEvaluationContext` where time-relative Candidate Intelligence is evaluated

This keeps goals, availability, preferences, assessment, pain, equipment, history, and phase state separately inspectable.

`CandidateEvaluationContext.asOf` is explicit serialized evaluation time. When absent or invalid, history recency is unknown/`no_recency`; the engine does not substitute the current system time.

## Assessment

Assessment uses typed `AssessmentSignal` records with:

- signal type;
- source;
- confidence;
- priority;
- region, movement role, muscle, and side where relevant.

Historical weakness is represented separately from current assessment priority.

Assessment-derived alignment is represented separately through `AlignmentPriority` and `AssessmentInfluence`. This lets assessment influence phase intent, session intent, warmup, activation, candidate scoring, prescription, and progression while keeping low-confidence observations from overpowering the program.

Assessment images are an upstream concern. Training Engine V2 receives normalized signals and does not inspect pixels, infer pose, or diagnose.

Feature-specific reasoning distinguishes the `AssessmentFeatureMatch`, `AssessmentFeatureTargetFit`, and `AssessmentFeatureDevelopment` concepts, represented in the current inspectable contracts by:

- `AssessmentFeatureMatchTrace`: how reviewed candidate mechanics express a normalized assessed feature;
- `AssessmentFeatureTargetFitTrace`: assessment-only selection relevance for that feature;
- `AssessmentFeatureDevelopmentTrace`: feature emphasis, overall task demand, feature capability provenance, and the separately modeled challenge relationship.

Feature target and feature challenge are not synonyms. Feature challenge demand is currently `not_modeled`, so feature demand/capability match remains `not_applicable`. Unknown evidence remains explicit and does not become false numerical precision.

## Pain And Injury

The model distinguishes:

- historical injury;
- historical sensitivity;
- current discomfort;
- moderate pain;
- acute/severe pain;
- hard contraindication;
- personal exercise block.

A personal block is not a medical contraindication. Mild discomfort is not automatically a hard exclusion.

Pain observation/diagnosis, hard legality, candidate suitability, prescription adjustment, composition, and progression/transition are separate responsibilities. No score may override a contraindication, and the training engine does not diagnose.

Candidate pain matching normalizes `loading.jointStressTags`, `cautionStressTags`, and `contraindicatedStressTags` into source-aware stress facts. One pain signal and one matched stress tag form one canonical fact even when several exercise metadata sources contain that tag. Distinct pain signal IDs remain distinct evidence. Receiver policies then decide independently whether that fact can warn, score, hard-reject, inform assessment context, or create a deferred response requirement.

Stress-overlap breadth and reported pain intensity remain separate. Candidate Intelligence uses response-led flat moderate severity: severity 3-6 adds no numeric suitability or joint-cost adjustment beyond canonical overlap. Severity 3-4 emits `standard_moderate_review`; severity 5-6 emits `elevated_moderate_review_non_hard`. Neither urgency is hard authority or acute/severe evidence. Any future reviewed intensity calibration remains signal-level, bounded, owned by pain suitability, and dependent on longitudinal symptom/function evidence.

`CandidatePainExecutionReadinessTrace` classifies only requirements applicable to one candidate, ignoring non-urgent `not_applicable_no_candidate_stress_match` requirements. Its precedence is urgent external review, session role substitution, prescription, candidate review, then `EXECUTABLE_AT_CANDIDATE_SCOPE`. Each `RankedCandidate` exposes this trace. Result readiness reflects rank 1 only, separately lists executable legal candidates and the best executable alternative, and preserves explicit urgent signal IDs across the evaluated pool. It never reranks or silently replaces the selected candidate.

`EXECUTABLE_AT_CANDIDATE_SCOPE` means only that Candidate Intelligence has no unresolved pain-response action for that candidate. It does not establish prescription, session, week, product-display, or medical-safety readiness.

`HistoricalInjury` remains intentionally unconsumed at Candidate Intelligence scope. Current effects, moderate required responses and review urgency, acute urgency, historical preferred modifications, and hard-authority provenance remain observable even when their future owner is prescription, Session Intent / Session Composer, or external review.

## Equipment

Equipment is capability-based. It distinguishes bench type, one-or-more dumbbells versus a usable pair, dumbbell load range, barbell and rack availability, cable availability and explicit low/mid/high cable attachment heights, exact machine IDs, band type and independent band-anchor heights, bodyweight space, pull-up bar, support surfaces, stable loaded-standing space, and loaded-gait space.

`bodyweight.floorSpace`, `trainingSpace.stableLoadedStandingSpace`, and `trainingSpace.loadedGait.available` are separate facts. Neither a broad environment label nor ordinary floor space manufactures loaded-standing or loaded-gait truth. Loaded gait may additionally expose straight-line distance, turning availability, and overhead clearance; omitted optional detail remains unknown. Loaded gait marked available while stable loaded standing is false is preserved as inconsistent input and reported by validation rather than silently normalized.

`CableCapability.adjustableHeight` describes the stack characteristic but does not prove a usable attachment height. `availableHeights` is the authority for `cable_anchor_low`, `cable_anchor_mid`, and `cable_anchor_high`; band-anchor keys remain separate. Derived `stable_support_surface` is true only when `supportSurfaces` explicitly contains `wall`, `box`, `chair`, or `stable_table`; environment labels cannot manufacture it.

The model is intentionally extensible without attempting a complete commercial-gym catalog.

## Phase

Phase is first-class through `PhaseIntent`, `PhaseCapabilityExpectation`, `PhaseProgressionIntent`, `PhaseAdvancementCriterion`, and `PhaseState`.

The package includes Phase 1, Phase 2, and Phase 3 representations. Phase changes do not require exercise replacement; the same exercise can continue with a different prescription when productive.

## Session Composer Production Domain

The authoritative `SessionIntent` is needs-first. Each `SessionNeed` owns stable identity, semantic section, required/preferred/optional priority, unique non-negative `priorityOrder`, standalone admission, source/dependency evidence, reason code, inert explanation, and one canonical `ExerciseSelectionNeed`. That lower-level selection contract contains role, movement, action, muscle relationship, and body-region truth only. Legacy `CandidateNeed` is a deterministic compatibility projection; fixed slots are no longer Session Intent authority.

`SessionIntent` additionally owns athlete, kind, phase, primary goal, structural capacity, available-minute context, assessment/pain-response references, fatigue, multiple-identity continuity evidence, Planner trace, and unresolved weekly references. Capacity is serialized as condensed, standard, expanded, or unknown and is never derived from minute thresholds.

The exported `SessionSkeleton` is not a workout prescription. It contains five semantic sections, one assignment per stable identity, truthful need coverage, per-need candidate evidence, continuity, dependencies, unresolved review/Prescription requirements, marginal-value reasons, redundancy and concentration traces, ordering constraints, separated status/readiness/completeness, and truthful infeasibility. It contains no sets, reps, load, range, support, effort, rest, or final within-section order.

See `SESSION_COMPOSER_PRODUCTION_KERNEL.md` and `SESSION_NEED_AND_DEPENDENCY_MODEL.md`.

## Exercise Mechanics

`ExerciseDefinition.mechanics` stores structured support, independent task demands, optional scapular-feature expression, and optional resistance/path knowledge. Resistance/path includes path type, trajectory freedom, line-of-pull adjustability, laterality, fit dependency, review status, notes, and provenance.

Engine behavior must not derive biomechanics from exercise ID, name, summary, labels, equipment prose, or coaching cues. Missing structured mechanics stay unknown or `needs_review`.

## Trunk / Core Functions

`MuscleGroup.trunk` remains the umbrella muscle-system label. `abdominals`, `obliques`, `spinal_extensors`, and `abs` are not separate current muscle groups, and `abdomen` / `abdominal_wall` are not current body regions. Those concepts require future receiver and credit decisions rather than premature aliases.

Trunk selection purpose is represented by movement roles:

- `breathing_position`: breathing and ribcage-pelvis positioning purpose;
- `anti_extension_core`: intentional resistance to trunk extension;
- `anti_rotation_core`: intentional resistance to trunk rotation;
- `anti_lateral_flexion_core`: intentional resistance to lateral trunk displacement;
- `trunk_flexion`: intentional controlled trunk-flexion or abdominal-shortening purpose;
- `trunk_rotation`: intentional controlled rotational movement purpose;
- `loaded_bracing`: intentional loaded-bracing development purpose;
- `carry`: loaded transport/gait purpose, distinct from lateral control and bracing.

`ExerciseMechanicsProfile.trunkMechanics` separately describes function expression during execution. Its eight fields are `breathingPressureCoordination`, `antiExtensionContribution`, `antiRotationContribution`, `antiLateralFlexionContribution`, `controlledFlexionContribution`, `controlledRotationContribution`, `loadedBracingContribution`, and `gaitLoadTransferContribution`.

Each `TrunkFunctionAnnotation` has a level (`unknown | none | low | moderate | high`), field-level review status, evidence source, structured provenance with source references and evidence basis, and notes. `none` is reviewed absence. `unknown` is unavailable or unreviewed evidence and is not a numeric zero, low expression, poor fit, safety claim, or penalty. An accepted unknown requires a structured reviewed basis; known levels always require structured provenance.

The profile is optional. Absence yields explicit profile-unavailable unknown evidence in `TrunkMechanicsTrace` and changes no legal or ranked result. Mechanics never grant movement-role eligibility: a row, squat, press, or hinge may express a trunk function without becoming a direct trunk-role candidate.

### First Reviewed Profile Tranche

The first project-owner-reviewed production tranche contains complete profiles only for `ninety-ninety-breathing`, `dead-bug`, and `pallof-press`. The authority is `TRUNK_MECHANICS_OWNER_DECISIONS.md#approved-first-tranche`.

- Ten fields are accepted: four on 90/90 Breathing, three on Dead Bug, and three on Pallof Press.
- Fourteen remaining fields are explicit `unknown` / `needs_review` annotations with `source=unknown`, empty provenance, and field-specific notes.
- Every accepted annotation uses `source=human_exercise_science_review`, cites the owner artifact, and names the pre-existing structured evidence supporting the decision.
- Dead Bug breathing/pressure coordination remains unknown. Pallof Press anti-lateral-flexion and loaded-bracing contributions remain unknown. No needs-review proposal was promoted.
- Five accepted Push-Up and supported-row judgments are approved but deferred; those exercises have no partial profile.
- All movement roles, training roles, muscles, body regions, equipment, loading, section/phase metadata, transitions, and pain/stress tags remain unchanged.

After the later intentional migration to compositional support/stance mechanics, the full serialized catalog fingerprint is `124786e955fb411f556d0b583e127d3261a7385ccfa11175a95a9bae79bd41f9`. Removing only `mechanics.trunkMechanics` yields `07bbf55965a92fe5c9cc0cba54352b0a6bfa14c3d21599efe765c26874f6c505`; this retains the support/stance migration. Ranking and comprehensive controlled-behavior fingerprints remain `d6a6452537e1436c3ecbbc035d9ea7a3126e772961012e4141b3302919f11782` and `216ec8c86ffc4bdf2310b6a88c03d10eca982f311df4f05fcf02485daa9c72b9` respectively.

Direct developmental, meaningful secondary, incidental bracing, and capacity exposure are future contextual accounting outcomes, not permanent exercise properties. Their eventual classification depends on actual role, section, prescription, phase, and use.

## Progression And Transition

### Training Safety And Response

Training safety authority is explicit, upstream-supplied, non-diagnostic, and independent of pain severity. A signal records review level, source authority, source reference, evidence basis, reporter identity/time, and unresolved or externally resolved state. Result-level `TrainingReadinessTrace` answers whether ordinary downstream training is allowed and exposes every causal signal without changing candidate ranking or manufacturing contraindications.

Training response observations answer one question: what happened for this person after this specific exposure? They record `tolerated | limited | not_tolerated | unknown`, reported symptom change, onset, persistence, completion/modification consequence, descriptive region/side locations, and provenance. They reference prescriptions and performance records instead of copying full dose structures. Partial historical reports preserve unknown realization details.

The response ledger orders applicable events at an explicit `asOf`, exposes latest/prior observations, mixed and unknown evidence, and later tolerated exposure after earlier limited/not-tolerated exposure. It chooses no threshold or action. Historical injury remains observational by default; explicit restrictions belong to existing hard authority, and successful re-exposure adds evidence without erasing history.

`TrainingResponseReceiverTrace` classifies exact realization evidence, related realization evidence with structured dose/load/range/support/side differences, and exercise-identity-only history. Exact tolerated evidence can support continuity and progression review; limited or aggravated evidence routes to prescription review first; mixed/unknown/contextual-only evidence remains insufficient. Replacement consideration is observable but never automatic, and later tolerated re-exposure reduces inappropriate permanent avoidance pressure without deleting prior facts.

`ExerciseProgressionProfile.progressionAxes` describes how prescription can advance while exercise identity remains the same. `transitionRelationships` describes reviewed cross-exercise possibilities with direction, classification, purpose, provenance, and structural deltas.

`domain/progression.ts` owns the canonical progression-axis vocabulary. Structured prescription modules represent dose, load, laterality, support, lever, range, tempo, effort, rest, execution criteria, completed performance, and readiness evidence. Current exact response can clear a response-related progression blocker or produce hold/regression/review; mixed and unknown response stays insufficient. A readiness trace never chooses a dose increase, axis, phase change, or exercise transition, and `automaticProgressionDecision` remains false.

Runtime validation binds each prescription to its exercise definition and requires stable prescription/source IDs, explicit ISO-8601 timestamps with timezone, valid provenance, canonical progression axes, valid mode-owned dose fields, execution-standard references, completed-performance records, and progression evidence. Malformed runtime evidence remains invalid or insufficient; readiness for progression review requires both same-exercise productivity evidence and progression-axis runway evidence.

One prescription is one source exposure event. Structured dose and performance evidence may later feed ledgers and progression models, but this contract adds no production exercise metadata and changes no current candidate ranking, eligibility, phase, pain, assessment, or transition behavior.

## Structured Pain-Stress Exposure

Pain-stress tags describe modeled training exposure, not diagnosis, tissue damage, bad posture, exercise danger, or universal avoidance. The approved trunk/carry stress additions are `upper_limb_support_loading`, `loaded_trunk_rotation`, `lateral_trunk_loading`, `loaded_gait`, `loaded_march`, and `grip_loading`.

`ExerciseStressAnnotation` is a generic optional contract on `ExerciseDefinition`. It records source (`joint_stress | caution | contraindicated`), exposure scope (`intrinsic | prescription_modifiable | variant_dependent | dose_created | unknown`), side scope, review status, provenance, and notes. Accepted annotations require nonempty owner, human, or external provenance with evidence basis; legacy catalog arrays remain behaviorally authoritative and unscoped.

The canonical catalog now contains 45 rows: the prior 37 plus exactly `standing-calf-raise`, `side-lying-hip-adduction`, `loop-band-lateral-walk`, `side-lying-dumbbell-external-rotation`, `supine-hamstring-walkout`, `wall-ankle-dorsiflexion-rock`, `bodyweight-hip-hinge-rehearsal`, and `single-leg-balance-rehearsal`. New families are limited to `calf_accessory`, `hip_accessory`, and `cuff_control`; new mechanics vocabulary is limited to `single_leg`, `prescription_dependent`, and `band_unanchored` plus the derived support capability. Stable exercise IDs are the only future Praxis Knowledge Layer seam; no alias, second catalog, or Library ID exists.

Owner-approved contextual scoring is production authority. Unknown, needs-review, conflict, and no-match omit both component and denominator weight. The eight P0 rows intentionally have no accepted contextual phase annotation, so phase contributes neither a synthetic fallback nor a mechanical bonus for them.

Candidate pain matching counts accepted intrinsic structured stress as canonical facts. Prescription-modifiable, variant-dependent, dose-created, and unknown stress stays potential evidence until a prescription realizes or removes it. Potential evidence can require prescription resolution when it matches a pain signal, but it does not create pain units, joint units, hard criteria, acute criteria, or a hidden risk score.

Pain signals may preserve optional side. Missing side remains null, and tags remain side-neutral. Side compatibility belongs to prescription-realized stress evaluation.

Each purpose in an `ExerciseTransitionTrace` has a deterministic evidence trace with status `structurally_confirmed`, `contextual_intent`, `unknown_metadata`, or `contradicted`. Direct mechanics purposes use normalized source/target deltas only. Programming intent and multidimensional support purposes remain contextual, and transition notes cannot convert missing or contradictory mechanics into structural confirmation.

An `ExerciseTransitionTrace` has `automaticSelectionEffect: none`. Productive continuity favors keeping and progressing the current exercise before replacement; a transition still requires legal, contextual evidence.

The P0 production rows have no hard prerequisites. Their ordinary setup and execution requirements stay in prescription/coaching. Standing Calf Raise alone records `grip_loading` as dose-created potential when a held implement is prescribed; action/function metadata does not create pain or danger truth.

## Session Structure

Sessions use:

1. `warmup`
2. `activation`
3. `main`
4. `accessory`
5. `cooldown`

`PreparationDependency` allows a preparation exercise to reference what it prepares: movement role, body region, assessment signal, range need, main exercise, and session intent.

## History

History distinguishes exercise, session, and program history. Exercise history events include too easy, appropriate challenge, too difficult, failed target, pain response, substitution, personal block, progression success/failure, and plateau.
# Role and Muscle Domain Addendum (2026-08-12)

`MovementRole` includes broad `accessory` and `knee_dominant` purposes. Exact action/function vocabulary and reviewed provenance live on `ExerciseDefinition.actionFunctions`. `ExerciseDefinition.muscleContributions` is canonical with primary, key-secondary, incidental, stabilizer/contextual, and unknown relationships; primary/secondary arrays are derived compatibility views. Candidate muscle requirements select any meaningful, primary-preferred, or primary-required semantics.

# Planner Domain Addendum (2026-08-12)

Planner authority uses `TrainingOutcomeGoal` separately from `ProgrammingContextMode`, and only `ordinary_training` as the authoritative session type. `SessionAllocationDirective` is mandatory. Current availability and equipment carry provenance. `AssessmentSignal.actionFunctions` and `SessionRangeRequirement` preserve structured action/range truth. Legacy `TrainingGoal`, legacy session kinds, `requiredRangeIds`, and current `WeeklyIntent` numeric maps are compatibility-only on this path.

# Week Design Domain Addendum (2026-08-12)

Design-only Week concepts distinguish `WeekPlanningHorizon`, `WeekTrainingOpportunity`, proposed `WeeklyIntent`, `WeeklyDevelopmentObjective`, reviewed weekly policy, `SessionAllocationReservation`, materialization, and `WeekAllocationPlan`. Their truth states are explicit: expected future fact, actual current fact, planned allocation, prescribed dose, completed performance, and observed response.

Weekly development purposes are movement, muscle, direct action, capacity, conditioning, assessment priority, and recovery support. Frequency intent counts allocated opportunities only. Movement/action/capacity/muscle lanes remain separate, and muscle relationships create no fractional set credit. These types are intentionally absent from the package index pending policy and domain approval.

# Policy And Horizon Domain Amendment (2026-08-12)

Reviewed policy now has compact typed rules and deterministic required/conflict outcomes. Objectives have structured goal relationships; reservations have session-specific goals. Product source facts, explicit time windows, confirmation states, equipment records, horizon revisions, and day-of context remain private design types. Recovery readiness, external load, accessibility, and broad conditioning retain future owners.

# CAGT Test Domain

CAGT adds no production domain concepts. Test-only contracts name canonical fact owner, materiality, response window, invariants, difference dimensions, convergence reasons, framework/adaptive relationships, authority expectation, and no-rescue requirement. Authority is explicitly `PRODUCTION`, `DESIGN_ONLY`, `HANDOFF_ONLY`, `FOUNDATION_ONLY`, or `NOT_IMPLEMENTED`.
