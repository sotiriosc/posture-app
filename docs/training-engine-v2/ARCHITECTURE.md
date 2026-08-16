# Training Engine V2 Architecture


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

`ENGINE_V2_BLUEPRINT.md` is authoritative. This document summarizes the staged implementation and responsibility boundaries; it must not override the blueprint.

## Package Boundary

`packages/training-engine-v2` is a pure TypeScript workspace package. It has no React, Next.js, database, storage, auth, billing, HTTP, analytics, telemetry, account, or routing dependencies.

Inputs and outputs are plain serializable domain objects.

## Reasoning Flow

The package models the intended reasoning order without implementing production generation:

1. Athlete and availability.
2. Assessment, pain/injury, equipment, history, and current phase state.
3. Weekly and session intent contracts.
4. Legal exercise candidate contracts.
5. Inspectable Candidate Intelligence scoring and trace contracts.
6. Whole-session and whole-week optimizer contracts.
7. Separate selection, prescription, same-exercise progression, and cross-exercise transition contracts.
8. Decision trace and validation structures.

## Implemented Modules

- `domain/athlete.ts`: athlete, preferences, availability, current state, future engine input.
- `domain/assessment.ts`: confidence-aware assessment signals and historical weaknesses.
- `domain/painInjury.ts`: historical injury, sensitivity, current discomfort, moderate pain, acute pain, contraindication, and personal block.
- `domain/trainingSafety.ts`: explicit non-diagnostic safety/review authority, external resolution evidence, legacy urgent-authority compatibility, and result-level downstream training readiness independent of candidate ranking.
- `domain/trainingResponse.ts`: exposure-linked factual tolerance, symptom-change, timing, consequence, descriptive location/side, provenance, and explicit unknown observations.
- `domain/equipment.ts`: capability-based equipment and training-space model with pure requirement evidence.
- `domain/phase.ts`: first-class Phase 1, Phase 2, Phase 3 intents.
- `domain/exerciseSelectionNeed.ts`: canonical lower-level exercise-selection truth.
- `domain/session.ts`: needs-first Session Intent, five semantic sections, structural capacity, preparation dependencies, and multiple-identity continuity evidence.
- `domain/programming.ts`: weekly intent and planned-program contracts.
- `domain/history.ts`: exercise, session, program, progression, and fatigue history.
- `domain/progression.ts`: canonical same-exercise progression-axis vocabulary.
- `domain/exercise.ts`: normalized exercise schema, compositional support/stance mechanics, contextual phase annotations, the optional field-reviewed trunk function profile, same-exercise progression axes, and reviewed transition relationships.
- `eligibility.ts`: hard eligibility contracts.
- `scoringContracts.ts`: inspectable score component contracts.
- `optimizerContracts.ts`: candidate set, session candidate/evaluation, and week candidate/evaluation contracts.
- `prescription/*`: structured dose, load, execution standard, prescription identity, performance outcome, validation, and same-exercise progression-readiness trace contracts.
- `prescriptionProgression.ts`: public compatibility re-export boundary for prescription and progression contracts.
- `decisionTrace.ts`: developer-facing structured trace.
- `validation.ts`: foundation validation utilities.
- `reasonCodes.ts`: stable structured decision reason codes.
- `componentContracts.ts`: modular engine component boundaries.
- `alignment.ts`: assessment-derived alignment priority contracts.
- `pipelineObservability.ts`: stage snapshots for debugging and bug localization.
- `candidate/request.ts`: serializable Candidate Intelligence context, including explicit evaluation time.
- `sessionComposer/*`: exported production candidate seam, consistency checks, canonical facts, validity, strict lexicographic evaluation, calibrated exact/bounded search, non-prescribed skeleton, and Prescription/duration/Sequencing handoffs.
- `candidate/pain/*`: canonical source-aware exercise stress facts, signal/tag matching, review urgency, receiver-specific policies, candidate/result execution readiness, response ownership, and serializable pain traces.
- `candidate/scoring/assessment/*`: modular assessment normalization, relevance, feature target, demand/capability, challenge, budget, and trace responsibilities.
- `transitionComparison.ts`: observational structural deltas for reviewed cross-exercise transitions with no automatic selection effect.
- `phaseSuitability.ts`: deterministic role/section contextual phase resolution, conflict handling, accepted-provenance qualification, runtime annotation validation, and production `CONTEXTUAL_ANNOTATION_ONLY_LOW_CHURN` scoring. Unknown/no-match/conflict abstain; accepted poor remains a real vote. Legacy global scoring and mechanical phase bonuses are audit-only.
- `trainingResponseHistory.ts`: deterministic explicit-`asOf` response ledger, prescription/performance linkage validation, side-scoped evidence, mixed-history observability, and successful later re-exposure evidence without thresholds or automatic action.
- `trainingResponseReceiver.ts`: exact/related/identity-only applicability, structured prescription differences, prescription-first owner routing, continuity evidence, repeated-adverse observability, and successful re-exposure protection without scores or automatic changes.
- `trunkMechanics.ts`: pure trunk-function observability; copies reviewed profile evidence or emits explicit profile-unavailable unknown traces without influencing decisions.

## Trunk Role And Mechanics Boundary

`MuscleGroup.trunk` remains the umbrella muscle system. Selection purpose belongs to `MovementRole`; function expression belongs to optional `ExerciseMechanicsProfile.trunkMechanics`. The added selection roles are `anti_lateral_flexion_core`, `trunk_flexion`, `trunk_rotation`, and `loaded_bracing`; `carry` remains a separate loaded transport/gait purpose.

The profile exposes eight independent fields for breathing/pressure coordination, anti-extension, anti-rotation, anti-lateral flexion, controlled flexion, controlled rotation, loaded bracing, and gait/load transfer. Review authority is field-local. Reviewed `none` is meaningful absence; `unknown` and an absent profile are unavailable evidence and have no automatic behavioral interpretation.

Validation and `buildTrunkMechanicsTrace` are the only current production consumers. Eligibility continues to read explicit movement roles. Candidate scoring, assessment, pain, phase, progression, and transition modules do not consume the profile. Direct, secondary, incidental, and capacity exposure classification remains future contextual ledger work rather than static exercise metadata.

## Modular Components

Training decisions should live in components with coherent responsibility:

- explicit typed input;
- explicit typed output;
- deterministic behavior;
- structured reason codes;
- isolated unit tests.

Future modules should be extracted by training responsibility, not by arbitrary file-size limits. Examples include assessment interpretation, alignment-priority derivation, equipment eligibility, pain eligibility, capability eligibility, role eligibility, assessment scoring, phase scoring, progression value, continuity value, fatigue evaluation, joint-cost evaluation, session evaluation, week evaluation, prescription, same-exercise progression, cross-exercise transition selection, and phase readiness.

## Equipment And Training-Space Truth

`EquipmentCapabilities` carries explicit environment-independent facts for ordinary floor space, stable loaded standing, loaded gait, optional distance/turn/overhead detail, cable attachment heights, dumbbell-pair availability, and exact machine identities. Environment labels are descriptive inputs only. Pure requirement evaluation exposes requested, available, and missing capabilities plus the relevant snapshot; it does not infer space or machine truth from an exercise name, role, gym label, or generic equipment availability.

`carry_load` is a future exercise-family identity only. It grants no movement role, score, capacity credit, composition slot, or mandatory programming behavior.

## Candidate Assessment Pipeline

The settled Candidate Intelligence assessment path is:

```text
signal normalization
  -> truthful relevance
  -> feature matching
  -> feature target fit
  -> task demand/capability
  -> feature development/challenge trace
  -> combined bounded influence
  -> assessment/alignment score receivers
```

Truthful relevance is downstream of hard training-need truth. Assessment may reorder legal candidates but may not create section, role, movement, muscle-target, equipment, or safety truth.

Feature target fit and developmental challenge fit are separate. Target fit describes selection relevance for a feature and is received by assessment scoring. Feature challenge remains `not_modeled`, so feature demand/capability match is `not_applicable`; no challenge precision may be inferred from feature expression.

## Candidate Pain Pipeline

The settled Candidate Intelligence pain path is:

```text
normalized pain inputs + structured exercise stress metadata
  -> canonical source-aware signal/tag facts
  -> response-led flat moderate review urgency
  -> receiver-specific warning, score, eligibility, and assessment decisions
  -> structured response ownership and execution/defer status
  -> candidate-aware and selected-result execution readiness
  -> eligibility, score components, DecisionTrace, and developer lab
```

Canonical matching owns shared evidence, not shared policy. Pain suitability counts all supported soft signal/tag facts; joint cost counts only facts with joint-stress or caution provenance; hard contraindication and acute/severe eligibility retain their narrower explicit authority filters. Moderate severity 3-6 is numerically flat and changes non-hard review urgency only. Assessment may also use structured region or movement context, but it reuses canonical facts whenever stress matching is required.

Structured exercise stress annotations add a second, generic evidence lane. Accepted intrinsic annotations can become canonical candidate stress facts. Prescription-modifiable, variant-dependent, dose-created, and unknown annotations remain `ExerciseStressPotentialTrace` evidence at candidate scope. They can create explicit prescription-resolution observability, but they do not affect canonical match counts, pain suitability units, joint-cost units, hard criteria, acute criteria, or score coefficients until a prescription realizes exposure.

`PrescriptionStressExposureTrace` is the realization boundary. It preserves one source exposure event and the actual prescription facts: side, load, range, support, lever, duration, distance, steps, tempo, effort, provenance, receiver eligibility, and realization state. `dose_not_yet_classified` and `unknown` remain unresolved states rather than threshold guesses.

Execution readiness is candidate-specific. Non-urgent actions with `not_applicable_no_candidate_stress_match` are ignored for that candidate; explicit acute urgency remains globally visible. Result readiness reflects the selected legal candidate, exposes lower-ranked executable candidates without choosing them, and excludes hard-rejected candidates from selected-result readiness. Prescription and Session Composer requirements are visible but are not executed in Candidate Intelligence.

## Training Safety And Response Ownership

`PainAndInjuryState` owns current reported discomfort/sensitivity, known restrictions, and explicit exercise/stress relationships. `TrainingSafetyState` separately owns externally supplied review authority. An unresolved safety signal marks ordinary downstream training unavailable at result scope while Candidate Intelligence continues to produce unchanged diagnostic rankings. It never becomes a candidate penalty, exercise rejection, stress intolerance, or diagnosis. Only explicit external resolution evidence clears the gate.

`AcuteSeverePain.urgentReviewRecommended=true` remains an explicit legacy urgent-authority bridge. Severity itself is not a bridge condition. `HardContraindication` remains the separate hard authority for known exercise, role, or stress restrictions.

`TrainingResponseHistory` owns what happened after a realized exposure. An observation links exercise, prescription, performance, source exposure, and realized stress IDs; the completed prescription remains source of truth for dose, range, load, support, stance/laterality, and side. Response evidence records factual tolerance, symptom change, timing/persistence, consequence, locations, and provenance. It creates no score, hard rejection, automatic modification, progression, regression, replacement, or exercise-family ban.

The response receiver routes exact current evidence first to prescription review, progression readiness and continuity. Tolerated exact evidence may permit progression review without selecting progression. Limited evidence holds/monitors; aggravated evidence requests regression or review; mixed, unknown and contextual-only history remain insufficient. Repeated adverse facts across realizations are observable but never a count-based replacement rule. `automaticProgressionDecision` and automatic replacement remain false.

The invariant is: exercise identity is not a realized prescription, and a realized prescription is not its observed response. Tolerance at one dose or side does not generalize to every realization. Limited exposure does not permanently poison an exercise identity. Later tolerated re-exposure is preserved alongside earlier adverse evidence rather than deleting it.

## Thin Orchestrators

Future top-level functions such as `generateProgram`, `composeWeek`, `composeSession`, and `rankCandidates` must orchestrate domain modules. They should not contain hundreds of embedded exercise-science rules.

If an important training rule appears inside an orchestrator, that rule belongs in the appropriate component module.

## Pipeline Observability

The engine must make it possible to tell which stage caused an incorrect prescription. Developer-facing snapshots are modeled for:

- normalized athlete state;
- interpreted assessment;
- alignment priorities;
- phase intent;
- weekly intent;
- session intent;
- hard-rejected candidates;
- legal candidate pool;
- candidate score breakdowns;
- session candidates;
- session evaluation;
- week candidates;
- week evaluation;
- prescription;
- same-exercise progression decision;
- cross-exercise transition trace or decision where applicable;
- validation.

Snapshots carry a pipeline stage, bug-localization stage, optional component id, payload, and reason codes.

## Bug Localization

Architecture must distinguish errors caused by:

- input interpretation;
- assessment interpretation;
- phase intent;
- session intent;
- eligibility;
- candidate scoring;
- session composition;
- week composition;
- prescription;
- same-exercise progression;
- cross-exercise transition;
- validation.

Full-program failures should be traceable back to smaller component outputs. Pain/stress failures should identify whether the issue came from exercise stress potential, candidate canonical matching, prescription realization, or performance response evidence.

## Assessment And Alignment Influence

Uploaded photos, pixels, video, landmarks, and raw pose estimates remain outside this package. The intended flow is:

raw posture photos/images -> existing Praxis pose/assessment system -> normalized assessment findings -> Training Engine V2

V2 receives normalized typed findings; it does not interpret images or diagnose. It models `AlignmentPriority` and `AssessmentInfluence` so assessment/alignment can affect phase intent, session intent, warmup intent, activation intent, main/accessory candidate scoring, prescription, and progression. Low-confidence findings remain visible but should not overpower programming.

## Deterministic Evaluation Time

`CandidateEvaluationContext.asOf` is the only evaluation time available to Candidate Intelligence. History recency parses that supplied value. Missing or invalid `asOf` yields `no_recency`; the engine never reads a hidden wall clock. Adapters and developer tools may obtain a current timestamp outside the package and serialize it into the request.

## Complexity Guard

Do not impose tiny files. Do flag modules that start combining unrelated training responsibilities. Future giant `scoring.ts` or `program.ts` modules are explicitly undesirable.

## Session Composer Production Boundary

The exported low-level kernel consumes Planner-authored `SessionNeed[]`, builds exact Candidate Intelligence results, validates one shared context, derives canonical composition facts, and searches whole-session skeletons with the owner-approved strict lexicographic policy. Display sections create no quotas. Structural capacity is explicit and never inferred from minutes. Composition status, execution readiness, and search completeness remain separate.

The production search is exhaustive through 350 estimated expansions and otherwise uses a calibrated deterministic budget of 48 expansions with frontier 4. Bounded output remains visibly non-optimal or inconclusive; it never repairs, widens pools, or fabricates fallback exercises. Prescription owns dose and realized duration. Sequencing owns final within-section order. The kernel is not connected to product state or final program generation.

See `SESSION_COMPOSER_DESIGN_CONTRACT.md`, `SESSION_NEED_AND_DEPENDENCY_MODEL.md`, `SESSION_COMPOSITION_EVALUATION_POLICY.md`, `SESSION_COMPOSER_SEARCH_LAB.md`, `SESSION_COMPOSER_PERSONALIZATION_MATRIX.md`, and `SESSION_COMPOSER_IMPLEMENTATION_READINESS.md`.

## Non-Goals In This Phase

Candidate Intelligence still does not generate workouts; it supplies local evidence to the downstream production Session Composer kernel. Session Intent Planner, compose-week behavior, final phase gates, dose generation, final sequencing, and Praxis application integration remain unimplemented. Candidate ranking is evidence for composition, not a program. The response receiver and progression integration are policy/observability boundaries; they select no dose axis or exercise. The engine input/result safety contract is complete, while golden-product adapter work is separately `PRODUCT_ADAPTER_PENDING`.

Current implementation classification is `SESSION_COMPOSER_PRODUCTION_KERNEL_READY_FOR_SESSION_INTENT_PLANNER`. Candidate Intelligence and the canonical 45-row catalog remain frozen. The earlier `TARGETED_DESIGN_DECISIONS_REQUIRED` result is historical laboratory evidence; owner decisions, authoritative needs-first migration, production search, and handoff contracts now supersede it. The future Praxis Knowledge Layer remains an optional adapter keyed by `ExerciseDefinition.id`, not an engine dependency. Praxis Library, Coaching Rail, UI, CMS, routes, P1 rows, and automatic progression/replacement remain unimplemented.
# Causal Personalization Boundary (2026-08-12)

Candidate ranking owns structured facts that can alter candidate legality, score, rank, readiness, or trace. Composer owns availability, weekly scheduling, and variety policy. Athlete labels, IDs, and prose remain trace-only. Identical outputs from materially equivalent active inputs are `JUSTIFIED_CONVERGENCE`; forced uniqueness is prohibited. See `ACTUAL_USER_PERSONALIZATION_AND_COUNTERFACTUAL_CONTRACT.md`.

Exercise selection now separates broad `MovementRole`, exact reviewed `actionFunctions`, and canonical `muscleContributions`. Primary/secondary arrays are generated projections, not authoring inputs.

# Session Intent Planner Layer (2026-08-12)

The Session Intent Planner is now the production authority between explicit session allocation and Candidate Intelligence. `planSessionIntent` owns validation, fixed objective-to-need mapping, bounded assessment enrichment, need merging, and active-need continuity projection. Candidate owns exercise legality/ranking; Composer owns whole-session identity coexistence; Prescription owns dose and executable range/load/support; Sequencing owns final order; the future Week Composer owns split, frequency, volume, and reallocation. No application adapter is included.

# Week Composer Design Layer (2026-08-12)

The private `src/weekComposer/designContracts.ts` and test-only lab propose three pre-Planner authorities without exporting them: Weekly Intent Planner owns structured weekly objective truth; Week Allocation Composer owns responsibility distribution across explicit future opportunities; Session Allocation Materializer converts a reservation plus actual current facts into the existing directive. The Planner remains the first production authority and receives only a materialized directive.

The Week design calls the frozen Planner, Candidate, and Composer stack as an opaque feasibility oracle. It cannot inspect or rewrite those kernels. Allocation has zero dose credit; Prescription and completed-response ledgers remain future owners. Overall design status is `WEEK_LAYER_DESIGN_READY_FOR_OWNER_POLICY_APPROVAL`; there is no production Week API, application adapter, or `generateProgram` integration.

# Product Horizon Adapter Design Layer (2026-08-12)

The private, unexported Product Adapter contracts resolve structured factual sources into tentative/confirmed Week horizons and immutable revisions, then collect day-of actual context. They contain no allocation, objectives, split, reservations, exercise selection, dose, spacing invention, or missed-session compensation. Overall readiness is `TARGETED_WEEK_POLICY_DECISIONS_REMAIN`.

# CAGT Developer Architecture (2026-08-12)

`tests/cagt` contains contracts, canonical diffing/signatures, ordered gates, runner, thresholds, cohorts, Week-policy/Product adapters, human chains, deterministic reports, and stress tools. It imports existing helpers and production APIs but is absent from `src/index.ts` and application runtime. No later gate can score after `FAIL_STOP`; optional shadow output is diagnostic and invalid upstream context.

# Week Policy V1 Admission Test Architecture (2026-08-12)

The V1 admission layer adds an independently locked owner composite and holdout plus complete-session coherence adapters. It composes frozen Planner, Candidate, Composer, Prescription-handoff, and sequencing-handoff APIs as evidence without adding a runtime layer. Coherence is evaluated inside existing gate ownership, not as a new gate.

# Prescription Timing Architecture (2026-08-13)

`ExerciseDefinition.prescriptionKnowledge` is now canonical mechanical Prescription metadata. It is consumed only as capability/provenance handoff evidence and validation input. `ExerciseDoseMode` includes `step_sets`; `TempoPrescription` is discriminated; actual timing belongs to performance records. The full catalog metadata fingerprint intentionally changes to `c79c2360e5a5b39ecebbf91899c248e62a9edd7997ad29e266d4236cf9410a9e`, while behavior-facing catalog projection and Candidate fingerprints remain frozen.

# Full Prescription Design Architecture (2026-08-13)

`src/prescription/designContracts.ts` defines design-only source exposure, revision, dose-block, performance-linkage, reviewed-policy, compiler input/output, and duration-determinability contracts. The deterministic lab remains in tests and does not export a production compiler. The architecture selects one source exposure event per assignment with one or more ordered blocks and a legacy single-dose projection only when truthful.

## Prescription Policy V1 Owner Admission

Prescription owner policy remains a test/developer artifact. No production dependency direction, package export, application wiring, or public API changed.

<!-- PRODUCTION_PRESCRIPTION_COMPILER_START -->

## ARCHITECTURE production Compiler update
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
