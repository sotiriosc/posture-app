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

Equipment is capability-based. It can distinguish bench type, dumbbell availability and load range, barbell and rack availability, cable availability, machine IDs, band type, anchor height, bodyweight space, pull-up bar, and support surfaces.

The model is intentionally extensible without attempting a complete commercial-gym catalog.

## Phase

Phase is first-class through `PhaseIntent`, `PhaseCapabilityExpectation`, `PhaseProgressionIntent`, `PhaseAdvancementCriterion`, and `PhaseState`.

The package includes Phase 1, Phase 2, and Phase 3 representations. Phase changes do not require exercise replacement; the same exercise can continue with a different prescription when productive.

## Exercise Mechanics

`ExerciseDefinition.mechanics` stores structured support, independent task demands, optional scapular-feature expression, and optional resistance/path knowledge. Resistance/path includes path type, trajectory freedom, line-of-pull adjustability, laterality, fit dependency, review status, notes, and provenance.

Engine behavior must not derive biomechanics from exercise ID, name, summary, labels, equipment prose, or coaching cues. Missing structured mechanics stay unknown or `needs_review`.

## Progression And Transition

`ExerciseProgressionProfile.progressionAxes` describes how prescription can advance while exercise identity remains the same. `transitionRelationships` describes reviewed cross-exercise possibilities with direction, classification, purpose, provenance, and structural deltas.

Each purpose in an `ExerciseTransitionTrace` has a deterministic evidence trace with status `structurally_confirmed`, `contextual_intent`, `unknown_metadata`, or `contradicted`. Direct mechanics purposes use normalized source/target deltas only. Programming intent and multidimensional support purposes remain contextual, and transition notes cannot convert missing or contradictory mechanics into structural confirmation.

An `ExerciseTransitionTrace` has `automaticSelectionEffect: none`. Productive continuity favors keeping and progressing the current exercise before replacement; a transition still requires legal, contextual evidence.

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
