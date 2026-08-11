# Training Engine V2 Architecture

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
- `domain/equipment.ts`: capability-based equipment and training-space model with pure requirement evidence.
- `domain/phase.ts`: first-class Phase 1, Phase 2, Phase 3 intents.
- `domain/session.ts`: warmup, activation, main, accessory, cooldown, and preparation dependencies.
- `domain/programming.ts`: weekly intent and planned-program contracts.
- `domain/history.ts`: exercise, session, program, progression, and fatigue history.
- `domain/progression.ts`: canonical same-exercise progression-axis vocabulary.
- `domain/exercise.ts`: normalized exercise schema, structured mechanics including the optional field-reviewed trunk function profile, same-exercise progression axes, and reviewed transition relationships.
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
- `candidate/pain/*`: canonical source-aware exercise stress facts, signal/tag matching, review urgency, receiver-specific policies, candidate/result execution readiness, response ownership, and serializable pain traces.
- `candidate/scoring/assessment/*`: modular assessment normalization, relevance, feature target, demand/capability, challenge, budget, and trace responsibilities.
- `transitionComparison.ts`: observational structural deltas for reviewed cross-exercise transitions with no automatic selection effect.
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

Execution readiness is candidate-specific. Non-urgent actions with `not_applicable_no_candidate_stress_match` are ignored for that candidate; explicit acute urgency remains globally visible. Result readiness reflects the selected legal candidate, exposes lower-ranked executable candidates without choosing them, and excludes hard-rejected candidates from selected-result readiness. Prescription and Session Composer requirements are visible but are not executed in Candidate Intelligence.

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

Full-program failures should be traceable back to smaller component outputs.

## Assessment And Alignment Influence

Uploaded photos, pixels, video, landmarks, and raw pose estimates remain outside this package. The intended flow is:

raw posture photos/images -> existing Praxis pose/assessment system -> normalized assessment findings -> Training Engine V2

V2 receives normalized typed findings; it does not interpret images or diagnose. It models `AlignmentPriority` and `AssessmentInfluence` so assessment/alignment can affect phase intent, session intent, warmup intent, activation intent, main/accessory candidate scoring, prescription, and progression. Low-confidence findings remain visible but should not overpower programming.

## Deterministic Evaluation Time

`CandidateEvaluationContext.asOf` is the only evaluation time available to Candidate Intelligence. History recency parses that supplied value. Missing or invalid `asOf` yields `no_recency`; the engine never reads a hidden wall clock. Adapters and developer tools may obtain a current timestamp outside the package and serialize it into the request.

## Complexity Guard

Do not impose tiny files. Do flag modules that start combining unrelated training responsibilities. Future giant `scoring.ts` or `program.ts` modules are explicitly undesirable.

## Non-Goals In This Phase

Candidate Intelligence does not generate workouts, compose sessions, compose weeks, run beam search, define final phase gates, or connect to Praxis application code. Candidate ranking is evidence for later composition, not a program. The structured prescription and same-exercise progression contract is ready as a type, validation, and observability boundary only; it does not calibrate prescriptions or select progressions. The direct trunk/carry candidate direction remains unimplemented. Its equipment and structured prescription dependencies are ready, and its next dependency is trunk/carry pain-stress vocabulary and receiver review; no catalog row or assessment-feature behavior is authorized by those contracts.
