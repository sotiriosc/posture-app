# Training Engine V2 Domain


<!-- LONGITUDINAL_ADAPTATION_GATE_16_V1:START -->
## Longitudinal Adaptation Gate 16 V1 Design Evidence

- Classification: `LONGITUDINAL_ADAPTATION_GATE_16_V1_READY_FOR_PRODUCTION_KERNEL_IMPLEMENTATION_AUTHORIZATION`
- Design status: `LONGITUDINAL_ADAPTATION_GATE_16_DESIGN_EVIDENCE_NOT_PRODUCT_RUNTIME`
- Authority Registry: `CAGT_EFFECTIVE_AUTHORITY_REGISTRY@5.0.0`; Gate 15 remains `PRODUCTION_KERNEL_AUTHORITY`; Gate 16 is `LONGITUDINAL_ADAPTATION_DESIGN_EVIDENCE`.
- Contracts: `LONGITUDINAL_ADAPTATION_GATE_16_CONTRACT@1.0.0` and `LONGITUDINAL_OUTCOME_SOURCE_CONTRACT@1.0.0`.
- Owner policy: `LONGITUDINAL_ADAPTATION_POLICY_V1_STABLE_RESPONSE_LED@1.0.0`, selected for CAGT admission and not production.
- Evidence: 130 controlled chains, 40 fixed-shell cases, and a frozen 360-history holdout with 325 genuine completed histories and 0 mismatches.
- Holdout fingerprint: `7da3dd7a0f543df2caeac29cf822567b24f2c85742bb82a656ecba872a11df18`.
- Stress: `LONGITUDINAL_ADAPTATION_GATE_16_DETERMINISTIC_STRESS_PASS` across 10000 evaluations, including 1000 in every required validation family.
- Activation guards: 0 failures. No runtime export/wiring, live Performance/adherence ingestion, automatic action, Week/phase application, UI, catalog, or product behavior change.
- Decisions and directives remain unapplied. The exact next dependency is `OWNER_AUTHORIZATION_FOR_PRODUCTION_LONGITUDINAL_ADAPTATION_KERNEL_IMPLEMENTATION`.
- Combined Gate 16 design fingerprint: `2b0cf05a07f39f72480eddb0cd28ed8e84f396627b836035e37caa2f1ca12226`.
<!-- LONGITUDINAL_ADAPTATION_GATE_16_V1:END -->

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

## Week Policy V1 Domain Decision

The owner-selected causal core owns only strength, primary hypertrophy/muscle priority, explicit direct work, assessment clusters, supported capacity, advisory participation, and Prescription-pending spacing at declared priority bands. Preparation remains session-level dependency truth and never weekly dose. Unsupported weekly domains remain explicit `WEEKLY_POLICY_REQUIRED` states, including scopes whose eventual evidence depends on Prescription.

## Prescription Timing Domain Decision

Exercise knowledge owns legal dose modes and timing capabilities, not exact numbers. Prescription owns exact sets, reps, load, effort, range, support, side, tempo, duration, distance, steps, breath cycles, and rest. Sequencing owns final order and transitions. Week evaluation later owns aggregation. The current domain implements this boundary with `ExercisePrescriptionKnowledgeProfile`, `step_sets`, Tempo V2, typed breathing/locomotor cadence, and actual-timing performance observations.

## Full Prescription Domain Decision

The domain now distinguishes one source exposure event, immutable Prescription revisions, ordered dose blocks, block purposes, reviewed policy rules, and future performance block linkage. `ExerciseDose` stays one dose realization; complete future Prescription truth is the ordered block plan inside one source event.

## Prescription Policy V1 Owner Admission

V1 preserves the existing Prescription, source-exposure, revision, performance, load, range, support, side, effort, tempo, duration, and block-domain vocabulary without adding prose-driven behavior.

<!-- PRODUCTION_PRESCRIPTION_COMPILER_START -->

## DOMAIN production Compiler update
The explicit production Prescription Compiler kernel is `PRODUCTION_PRESCRIPTION_COMPILER_IMPLEMENTED_NOT_ACTIVATED` with `PRESCRIPTION_POLICY_V1_STABLE_ADAPTIVE_CORE@1.0.0` available only by explicit injection. Gate 9 is `PRODUCTION_KERNEL_AUTHORITY`; Gate 10 remains `MIXED_HANDOFF_AUTHORITY`; Gate 11 remains `FOUNDATION_AUTHORITY`. Existing generators and apps are unchanged. See `PRODUCTION_PRESCRIPTION_COMPILER_IMPLEMENTATION_READINESS.md`.

<!-- PRODUCTION_PRESCRIPTION_COMPILER_END -->

<!-- FINAL_SESSION_SEQUENCING_V1:START -->
## Final Session Sequencing V1 Design Admission

- Policy: `SESSION_SEQUENCING_POLICY_V1_CAUSAL_SEQUENTIAL@1.0.0`
- Classification: `SESSION_SEQUENCING_POLICY_V1_READY_FOR_PRODUCTION_KERNEL_IMPLEMENTATION_AUTHORIZATION`
- Authority: `DESIGN_EVIDENCE_PLUS_HANDOFF_AUTHORITY`
- Execution: `SEQUENTIAL_ASSIGNMENT_EXECUTION_ONLY`
- Production kernel/activation: `NOT_IMPLEMENTED/NOT_ACTIVATED`
- Combined design fingerprint: `71fcb88e231e2953d508e0a1d6389fed98ca0f6af5a67592cdb56bb3ce563f42`

The future production receiver must preserve assignment, section, role, source event, Prescription lineage/final revision, block order, and intra-exercise rest exactly. It may add only a final linear assignment order, typed consecutive transitions, and a truthful final duration interval. Pairing remains deferred.

<!-- FINAL_SESSION_SEQUENCING_V1:END -->

<!-- PRODUCTION_FINAL_SEQUENCING_STATUS_START -->
## Production Final Session Sequencing Status

- Kernel: `PRODUCTION_FINAL_SESSION_SEQUENCING_KERNEL@1.0.0`
- Status: `PRODUCTION_FINAL_SESSION_SEQUENCING_KERNEL_IMPLEMENTED_NOT_ACTIVATED`
- Classification: `PRODUCTION_FINAL_SESSION_SEQUENCING_KERNEL_READY_FOR_POST_PRESCRIPTION_WEEK_VALIDATION_AUTHORIZATION`
- Policy: `SESSION_SEQUENCING_POLICY_V1_CAUSAL_SEQUENTIAL@1.0.0`, explicit injection only
- Search: exact-only with explicit caller resource policy and no fallback
- Identity: assignment/handoff ID, source event, execution attempt, and final Prescription revision
- Gate 10: `PRODUCTION_KERNEL_AUTHORITY`
- Activation: `NOT_ACTIVATED`; no app, Product Adapter, UI, or generateProgram wiring
- Next dependency: `POST_PRESCRIPTION_WEEK_VALIDATION_AUTHORIZATION`

Public V2 exports include the pure kernel, production contracts, Policy V1 object, explicit search policy contracts, transition/duration/revision contracts, and validators. Importing the package does not execute Sequencing.
<!-- PRODUCTION_FINAL_SEQUENCING_STATUS_END -->

<!-- POST_PRESCRIPTION_WEEK_VALIDATION_V1:START -->
## Post-Prescription Week Validation V1

Design admission: `POST_PRESCRIPTION_WEEK_VALIDATION_V1_READY_FOR_PRODUCTION_KERNEL_IMPLEMENTATION_AUTHORIZATION`. Gate 13 authority is `POST_PRESCRIPTION_WEEK_VALIDATION_DESIGN_EVIDENCE`; Gates 14-15 remain `NOT_IMPLEMENTED` and Gate 16 remains `FOUNDATION_ONLY`. The three-ledger invariant, source-event uniqueness, final Prescription/Sequence revisions, objective provenance, contribution truth, dose-lane separation, planned stress/duration/spacing, and no-downstream-rescue behavior are admitted as design evidence only. No production validator, Week activation, app wiring, Performance ingestion, or Longitudinal behavior exists. Combined design fingerprint: `6beea85cca5cfb73343c1ae7b6705ba6a9be4a6b82c737d09945357f6563fb82`.
<!-- POST_PRESCRIPTION_WEEK_VALIDATION_V1:END -->

<!-- PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_KERNEL:START -->
## Production Post-Prescription Week Validator Kernel

Classification: `PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_KERNEL_READY_FOR_FULL_PRESCRIBED_PROGRAM_CAGT_AUTHORIZATION`. Status: `PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_KERNEL_IMPLEMENTED_NOT_ACTIVATED`. The public pure kernel consumes `PRODUCTION_PRESCRIBED_WEEK_SOURCE_CONTRACT@1.0.0` with explicit policy injection and owns production Gate 13 authority. Golden evidence is `128/128` common-semantic matches with `0` unexplained differences and `860/860/860` expected/observed/unique events. Gate 14 and Gate 15 remain `NOT_IMPLEMENTED`; Gate 16 remains `FOUNDATION_ONLY / NOT_IMPLEMENTED`. There is no app, generateProgram, Product Horizon, Performance, Longitudinal, UI, implicit policy, or runtime design-adapter wiring. Combined production fingerprint: `c4d87d526f87dddbb9ded6b642c5b8b51dedec7d8aa6e052751bc27149f85951`.
<!-- PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_KERNEL:END -->

<!-- FULL_PRESCRIBED_PROGRAM_CAGT_GATE_14:START -->
## Full Prescribed Program CAGT Gate 14

Classification: `FULL_PRESCRIBED_PROGRAM_CAGT_V1_READY_FOR_PHASE_CONTINUITY_AUTHORIZATION`. Authority Registry: `CAGT_EFFECTIVE_AUTHORITY_REGISTRY@2.0.0`. Gate 14 is `MIXED_PRODUCTION_AND_DESIGN_PROGRAM_COMPARISON_EVIDENCE` test/developer tooling and is not a product-runtime kernel. The frozen holdout contains `248` pairs with `0` expectation mismatches, `0` accepted rescues, and combined fingerprint `ca12131efdc1fc1a8253bbfa8586be705b6e8bf68384366566eda13dcab8bee6`. Historical CAGT V1 and all production fingerprints remain unchanged. Gate 15 is `NOT_IMPLEMENTED`; Gate 16 is `FOUNDATION_ONLY_NOT_IMPLEMENTED`.
<!-- FULL_PRESCRIBED_PROGRAM_CAGT_GATE_14:END -->

<!-- PHASE_CONTINUITY_GATE_15_V1:START -->
## Phase Continuity Gate 15 V1

Classification: `PHASE_CONTINUITY_GATE_15_V1_READY_FOR_PRODUCTION_KERNEL_IMPLEMENTATION_AUTHORIZATION`. Ontology: `PHASE_CONTINUITY_ONTOLOGY_READY`. Authority Registry: `CAGT_EFFECTIVE_AUTHORITY_REGISTRY@3.0.0`; Gate 15 is `PHASE_CONTINUITY_DESIGN_EVIDENCE` and remains test/developer tooling, not product runtime. The frozen holdout has `295` cases, `0` mismatches, and `0` accepted rescues. No automatic phase advancement/regression/reset, progression, replacement, rotation or deload exists. Gate 16 remains `FOUNDATION_ONLY_NOT_IMPLEMENTED`. Combined fingerprint: `9b5602fbbfe5f9f32537bff8c07b434e8cb7528f62513a97d6c823d0cba3f3fc`.
<!-- PHASE_CONTINUITY_GATE_15_V1:END -->

<!-- PRODUCTION_PHASE_CONTINUITY_KERNEL_V1:START -->
## Production Phase Continuity Kernel V1

- Status: `PRODUCTION_PHASE_CONTINUITY_KERNEL_IMPLEMENTED_NOT_ACTIVATED`
- Classification: `PRODUCTION_PHASE_CONTINUITY_KERNEL_READY_FOR_LONGITUDINAL_ADAPTATION_GATE_16_AUTHORIZATION`
- Activation: `NOT_ACTIVATED`
- Contract: `PRODUCTION_PHASE_CONTINUITY_KERNEL@1.0.0`
- Policy injection is explicit; no default policy or evidence source is selected.
- Decisions remain unapplied: `stateMutationApplied=false`, `applicationOwnerRequired=true`.
- Gate 15 authority is production kernel; Gate 16 remains foundation-only and not implemented.
- Golden equivalence: `PRODUCTION_PHASE_CONTINUITY_GOLDEN_EQUIVALENCE_PASS` with 0 unexplained differences.
- Deterministic stress: `PRODUCTION_PHASE_CONTINUITY_DETERMINISTIC_STRESS_PASS` across 10000 evaluations.
- Combined fingerprint: `39236671808d605a53258351b58b081a64231b8c4fd6dee4125501e68e9bd232`
<!-- PRODUCTION_PHASE_CONTINUITY_KERNEL_V1:END -->

<!-- PRODUCTION_LONGITUDINAL_ADAPTATION_KERNEL_V1:START -->
## Production Longitudinal Adaptation Kernel V1

- Status: `PRODUCTION_LONGITUDINAL_ADAPTATION_KERNEL_IMPLEMENTED_NOT_ACTIVATED`
- Classification: `PRODUCTION_LONGITUDINAL_ADAPTATION_KERNEL_READY_FOR_OUTCOME_SOURCE_AND_APPLICATION_INTEGRATION_AUTHORIZATION`
- Activation: `NOT_ACTIVATED`
- Contract: `PRODUCTION_LONGITUDINAL_ADAPTATION_KERNEL@1.0.0`
- Policy and caller-supplied outcome sources are explicit; no live adapter or default is selected.
- Decisions remain unapplied; program, Prescription, replacement, rotation, deload, Week, and Phase mutation flags are false.
- Registry V6 records Gate 16 production-kernel authority; production code imports no CAGT registry.
- Golden equivalence: `PRODUCTION_LONGITUDINAL_ADAPTATION_GOLDEN_EQUIVALENCE_PASS` across 130 controlled, 40 shell, and 360 holdout cases.
- Stress: `PRODUCTION_LONGITUDINAL_ADAPTATION_DETERMINISTIC_STRESS_PASS` across 10000 evaluations.
- Combined fingerprint: `8827a14a2e06dc0c6ddd8902852337946babdca501c81119324b420a69917581`
- Exact next dependency: `OWNER_AUTHORIZATION_FOR_PRODUCTION_OUTCOME_SOURCE_ADAPTERS_PERSISTENCE_AND_ADAPTATION_APPLICATION_ORCHESTRATION`.
<!-- PRODUCTION_LONGITUDINAL_ADAPTATION_KERNEL_V1:END -->

<!-- OUTCOME_SOURCE_PERSISTENCE_FOUNDATION_V1:START -->
## Outcome Source and Adaptation Persistence Foundation V1

- Status: `OUTCOME_SOURCE_AND_ADAPTATION_PERSISTENCE_FOUNDATION_DESIGN_EVIDENCE_NOT_RUNTIME`
- Classification: `OUTCOME_SOURCE_AND_ADAPTATION_PERSISTENCE_FOUNDATION_V1_READY_FOR_PRODUCTION_IMPLEMENTATION_AUTHORIZATION`
- Ontology audit: `TARGETED_OUTCOME_SOURCE_AND_PERSISTENCE_DOMAIN_FIXES_REQUIRED`
- Runtime activation: `NOT_ACTIVATED`
- Contract: `OUTCOME_SOURCE_AND_ADAPTATION_PERSISTENCE_FOUNDATION@1.0.0`
- Registry: `CAGT_EFFECTIVE_AUTHORITY_REGISTRY@7.0.0`; Gate 11 is design evidence.
- Evidence: 158 controlled, 40 shell, 360 holdout, 240 replay, and 530 golden-equivalence histories.
- Stress: `OUTCOME_SOURCE_AND_PERSISTENCE_DETERMINISTIC_STRESS_PASS`; activation guard failures: `0`.
- Live adapters, migrations, writes, queues, applications, and Product/program mutations remain zero.
- Exact next dependency: `OWNER_AUTHORIZATION_FOR_PRODUCTION_OUTCOME_SOURCE_ADAPTERS_AND_APPEND_ONLY_PERSISTENCE_IMPLEMENTATION`.
<!-- OUTCOME_SOURCE_PERSISTENCE_FOUNDATION_V1:END -->

<!-- PRODUCTION_OUTCOME_SOURCE_PERSISTENCE_V1:START -->
## Production Outcome Source Persistence V1

- Status: `PRODUCTION_OUTCOME_SOURCE_ADAPTERS_AND_APPEND_ONLY_PERSISTENCE_IMPLEMENTED_NOT_ACTIVATED`.
- Gate 11: `PRODUCTION_KERNEL_AUTHORITY` under `CAGT_EFFECTIVE_AUTHORITY_REGISTRY@8.0.0`.
- Pure owner: `packages/training-engine-v2`; server owner: `packages/engine`.
- Schema: 24 physical tables, 22 append-only tables, 29 indexes.
- Evidence: 180 controlled, 360 holdout, 5000 replay stress, zero semantic golden mismatches.
- Activation remains zero; existing legacy stores and `generateProgram` are unchanged.
- Next dependency: `PRODUCTION_WEEK_PLANNER_AND_WEEK_ALLOCATION_COMPOSER_AUTHORIZATION`.
<!-- PRODUCTION_OUTCOME_SOURCE_PERSISTENCE_V1:END -->

<!-- PRODUCTION_WEEK_PLANNER_AND_ALLOCATION_V1:START -->
## Production Week Planner And Allocation V1

PRODUCTION_WEEK_PLANNER_AND_WEEK_ALLOCATION_COMPOSER_IMPLEMENTED_NOT_ACTIVATED. The pure Planner, allocation Composer, materializer, reallocation proposal kernel,
canonical Week Policy V1, Gate 13 projection, and CAGT Registry V9 are implemented and exported but inactive.
No Product Horizon call, calendar read, persistence write, plan application, deload construction, or Product behavior is active.
Exact next dependency: `ADAPTATION_APPLICATION_ORCHESTRATION_V1_AUTHORIZATION`.

Combined fingerprint: `4f3fd80ed3fee29cb12c88ef6dea38b6e5f70777ac4718391daa8e7548527387`.
<!-- PRODUCTION_WEEK_PLANNER_AND_ALLOCATION_V1:END -->

<!-- ADAPTATION_APPLICATION_ORCHESTRATION_V1:START -->
## Adaptation Application Orchestration V1

- Status: `ADAPTATION_APPLICATION_ORCHESTRATION_V1_IMPLEMENTED_NOT_ACTIVATED`
- Activation: `NOT_ACTIVATED`
- Classification: `ADAPTATION_APPLICATION_ORCHESTRATION_V1_READY_FOR_CONTROLLED_PRODUCT_SHADOW_INTEGRATION_AUTHORIZATION`
- Contract: `ADAPTATION_APPLICATION_ORCHESTRATION@1.0.0`
- Authority: `PRODUCTION_KERNEL_AUTHORITY_NOT_PRODUCT_RUNTIME` (post-Gate 16)
- Persistence: `002_adaptation_application_orchestration_v1@1.0.0`, explicit and never automatic
- Product/app wiring: zero
- Application applied count: zero
- Combined fingerprint: `a88a493e1553badb4f8cada551ee9d8357d21c4e04872c852bc60058769f8aca`
- Exact next dependency: `CONTROLLED_PRODUCT_SHADOW_INTEGRATION_AUTHORIZATION`

The explicit server-only service can validate, build, persist, and replay unapplied shadow candidates through caller-supplied owner ports. Controlled Product shadow integration and all live Product confirmation/application remain unimplemented.
<!-- ADAPTATION_APPLICATION_ORCHESTRATION_V1:END -->

<!-- CONTROLLED_PRODUCT_SHADOW_INTEGRATION_V1:START -->
## Controlled Product Shadow Integration V1

- Status: `CONTROLLED_PRODUCT_SHADOW_INTEGRATION_V1_IMPLEMENTED_DEFAULT_OFF`.
- Classification: `CONTROLLED_PRODUCT_SHADOW_INTEGRATION_V1_READY_FOR_SEPARATE_PRODUCT_ACTIVATION_AUTHORIZATION`.
- Product decision/output authority: `LEGACY_PRODUCT_OUTPUT_ONLY`.
- V2 application state: `NOT_ACTIVATED`.
- Runtime shape: one shared successful-sync notification, two thin authenticated routes, one server service.
- Rollout: default off, dedicated internal allowlist only, no all-user/percentage/random/anonymous mode.
- Evidence: 280 controlled, 80 fixed-shell, 520 frozen holdout; fingerprint `ab127575cf878d72e5e73154936ce5991dadf148b5be847b05f5a1a94ab4226e`.
- Persistence: explicit forward-only migration plan, 9 append-only tables, no legacy Product table changes, no automatic or production migration.
- Safety: zero Product mutation, application, delivery, rendering, performed credit, or counterfactual outcome attribution.
- Remaining dependency: `SEPARATE_PRODUCT_ACTIVATION_AUTHORIZATION`.
<!-- CONTROLLED_PRODUCT_SHADOW_INTEGRATION_V1:END -->

<!-- PRODUCT_GOAL_ARCHITECTURE_LEDGER_V1:START -->
## Product Goal Architecture Ledger

The [Praxis Product Goal Architecture Ledger](./PRAXIS_PRODUCT_GOAL_ARCHITECTURE_LEDGER.md) is the canonical owner-approved architecture record for Product vocabulary, ordered goal priority, context/mode separation, purpose-first Prescription direction, owner boundaries, staged integration, and completion tracking. This document remains purpose-specific and does not duplicate or override that ledger.

The admitted contract is inert, unexported from the package root, and non-executable. Current Product, compiler, Week, Candidate/Composer, Shadow, and activation behavior remains unchanged. B2 and every later chunk require separate authorization.
<!-- PRODUCT_GOAL_ARCHITECTURE_LEDGER_V1:END -->

<!-- PURPOSE_FIRST_PRESCRIPTION_RESOLVER_V1:START -->
## Purpose-First Prescription Resolver V1

Chunk B2 implements `PURPOSE_FIRST_GOAL_SPECIFIC_PRESCRIPTION_RESOLVER@1.0.0` and
`PRODUCTION_PRESCRIPTION_COMPILER_KERNEL@1.1.0` as explicit, fail-closed, non-activated APIs.
V1.0 remains frozen compatibility and Controlled Product Shadow remains pinned to it.

Evidence: [implementation readiness](./PURPOSE_FIRST_PRESCRIPTION_IMPLEMENTATION_READINESS.md) and
[canonical architecture ledger](./PRAXIS_PRODUCT_GOAL_ARCHITECTURE_LEDGER.md).

Next dependency: `SUPPORTED_GOAL_AND_LOCAL_PURPOSE_PRESCRIPTION_POLICY_V1_ADMISSION_AUTHORIZATION`.
<!-- PURPOSE_FIRST_PRESCRIPTION_RESOLVER_V1:END -->


<!-- SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_V1:START -->
## Supported Goal and Local-Purpose Policy V1

Chunk B3 implements explicit future-only Week Policy V2, Resolver Policy V1.1,
Prescription Policy V2, Compiler V1.2, purpose contributions, and Gate 13 V1.1.
Existing V1 behavior is frozen by reference. Product Shadow remains pinned to Compiler V1.0;
Product, UI, orchestration, persistence, and activation remain unchanged.

Evidence: [B3 implementation readiness](./SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_IMPLEMENTATION_READINESS.md)
and [canonical architecture ledger](./PRAXIS_PRODUCT_GOAL_ARCHITECTURE_LEDGER.md).

Next dependency: `EQUIPMENT_EXPERIENCE_AND_CONTEXT_SPECIFIC_PRESCRIPTION_REALIZATION_V1_AUTHORIZATION`.
<!-- SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_V1:END -->

<!-- EQUIPMENT_EXPERIENCE_CONTEXT_REALIZATION_V1:START -->
## Equipment, Experience, and Context Realization V1

Chunk B4 adds explicit future-only experience, familiarity, habitual exposure, equipment-load,
starting-point, return/rebuild, ramp-up, Compiler V1.3, and Gate 13 V1.2 contracts. No progression
is applied. Product Shadow remains pinned to Compiler V1.0; Product and activation are unchanged.

Evidence: [B4 implementation readiness](./EQUIPMENT_EXPERIENCE_CONTEXT_IMPLEMENTATION_READINESS.md)
and [canonical architecture ledger](./PRAXIS_PRODUCT_GOAL_ARCHITECTURE_LEDGER.md).

Next dependency: `CONTROLLED_PRODUCT_SHADOW_GOAL_AND_REALIZATION_MAPPING_V1_AUTHORIZATION`.
<!-- EQUIPMENT_EXPERIENCE_CONTEXT_REALIZATION_V1:END -->

<!-- CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_MAPPING_V1:START -->
## Controlled Product Shadow Goal and Realization Mapping V1
Chunk C adds `CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_PROFILE_V1_B1_B4` as an explicit, default-off, counterfactual test/replay profile. Historical Product Shadow V1 and current routes remain frozen. Product goal/context/mode, coarse experience, restricted history, equipment/load, ordered availability, preference/continuity, identity, planning-brief, pipeline, Run V1.1, and Comparison V1.1 mappings are versioned. Product UI, options, persistence, output, mutation, application, and activation remain unchanged. Next dependency: `GOAL_SPECIFIC_CONTROLLED_PRODUCT_SHADOW_EVIDENCE_V1_AUTHORIZATION`.
<!-- CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_MAPPING_V1:END -->

<!-- GOAL_SPECIFIC_PRODUCT_SHADOW_EVIDENCE_V1:START -->
## Goal-Specific Controlled Product Shadow Evidence V1

Chunk D exercises the explicit Chunk C profile through genuine B1-B4 kernels using synthetic Product-shaped replay, exact-revision artifacts, Full Prescribed Program snapshots, and Gate 14 causal comparison. It changes no Product UI, current route, output, persistence, rollout, mutation, application, or activation. The historical Chunk C readiness snapshot is preserved; see [post-closure reconciliation](./CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_POST_CLOSURE_RECONCILIATION.md) and [Chunk D evidence readiness](./GOAL_SPECIFIC_PRODUCT_SHADOW_EVIDENCE_READINESS.md). Next dependency: `SCREENSHOT_GUIDED_PRODUCT_GOAL_AND_CONTEXT_INPUT_DESIGN_V1_AUTHORIZATION`.
<!-- GOAL_SPECIFIC_PRODUCT_SHADOW_EVIDENCE_V1:END -->

<!-- PRODUCT_GOAL_CONTEXT_CHUNK_E:START -->

## Chunk E - Screenshot-guided Product input design

Product input semantics now distinguish primary outcome, optional secondary personalization, pain/limitations context, training mode, availability, coarse experience, equipment environment, exact capability, and calibration. None creates an exercise or numeric dose.

Combined Chunk E fingerprint: `5822ccde91f41387886dd57d92015956f10035a23f78596040033d4a8fcf559f`. Exact next dependency: `ONE_INACTIVE_PRODUCT_GOAL_OPTION_V1_IMPLEMENTATION_AUTHORIZATION`.

<!-- PRODUCT_GOAL_CONTEXT_CHUNK_E:END -->

<!-- ONE_INACTIVE_PRODUCT_GOAL_OPTION_CHUNK_F:START -->

## Chunk F - Inactive goal semantics

`get_stronger` is a stable Product option identity whose canonical outcome is `strength` and whose availability is `future_inactive_internal`. It has no follow-up for the bounded supported core. This metadata creates no current goal value, training profile, exercise, dose, Program, delivery, or activation; submission is preview-only and fail-closed.

Combined Chunk F fingerprint: `1665c6b780ab2638d377f09bac48de61480ab76ea346faf1304b799f1bbc9404`. Exact next dependency: `CONTROLLED_OWNER_ACCOUNT_GET_STRONGER_GOAL_DELIVERY_DESIGN_V1_AUTHORIZATION`.

<!-- ONE_INACTIVE_PRODUCT_GOAL_OPTION_CHUNK_F:END -->

<!-- PRE_G1_EXERCISE_CATALOG_HOME_COMFORT_CURATION:START -->

## Pre-G1 - Exercise catalog coverage and home comfort curation

Home environment, experience, exact identity familiarity, realization familiarity, comfort, equipment capability, and support are separate facts. Grip, support, angle, range, side, and load alone do not create duplicate canonical identities.

Combined curation fingerprint: `ca8e07795d123706c3e5c50247bce38be1b15036a617d82d84db8305e6863d0b`. Exact next dependency: `OWNER_SELECTION_OF_EXERCISE_CATALOG_EXPANSION_TRANCHE_V1`.

<!-- PRE_G1_EXERCISE_CATALOG_HOME_COMFORT_CURATION:END -->

<!-- PRE_G2_PACKAGE_R_HOME_FIRST_MIXED_RELEASE:START -->

## Pre-G2 - Package R production catalog and Knowledge core

Home comfort is a versioned per-exercise selection fact, not difficulty or experience. It is evaluated only after Safety, blocks, legality, purpose, pain/response, dependencies, and exact productive familiarity.

Combined Pre-G2 fingerprint: `f67906f4078f29ca0ac9903e5bbc556483bac2083c598e3bad5e6893155df18a`. Exact next dependency: `CURRENT_45_EXERCISE_KNOWLEDGE_CORE_COMPLETENESS_V1_AUTHORIZATION`.

<!-- PRE_G2_PACKAGE_R_HOME_FIRST_MIXED_RELEASE:END -->
