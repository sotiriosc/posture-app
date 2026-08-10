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
- `domain/equipment.ts`: capability-based equipment model.
- `domain/phase.ts`: first-class Phase 1, Phase 2, Phase 3 intents.
- `domain/session.ts`: warmup, activation, main, accessory, cooldown, and preparation dependencies.
- `domain/programming.ts`: weekly intent and planned-program contracts.
- `domain/history.ts`: exercise, session, program, progression, and fatigue history.
- `domain/exercise.ts`: normalized exercise schema, structured mechanics, same-exercise progression axes, and reviewed transition relationships.
- `eligibility.ts`: hard eligibility contracts.
- `scoringContracts.ts`: inspectable score component contracts.
- `optimizerContracts.ts`: candidate set, session candidate/evaluation, and week candidate/evaluation contracts.
- `prescriptionProgression.ts`: selection, prescription, and progression boundary.
- `decisionTrace.ts`: developer-facing structured trace.
- `validation.ts`: foundation validation utilities.
- `reasonCodes.ts`: stable structured decision reason codes.
- `componentContracts.ts`: modular engine component boundaries.
- `alignment.ts`: assessment-derived alignment priority contracts.
- `pipelineObservability.ts`: stage snapshots for debugging and bug localization.
- `candidate/request.ts`: serializable Candidate Intelligence context, including explicit evaluation time.
- `candidate/scoring/assessment/*`: modular assessment normalization, relevance, feature target, demand/capability, challenge, budget, and trace responsibilities.
- `transitionComparison.ts`: observational structural deltas for reviewed cross-exercise transitions with no automatic selection effect.

## Modular Components

Training decisions should live in components with coherent responsibility:

- explicit typed input;
- explicit typed output;
- deterministic behavior;
- structured reason codes;
- isolated unit tests.

Future modules should be extracted by training responsibility, not by arbitrary file-size limits. Examples include assessment interpretation, alignment-priority derivation, equipment eligibility, pain eligibility, capability eligibility, role eligibility, assessment scoring, phase scoring, progression value, continuity value, fatigue evaluation, joint-cost evaluation, session evaluation, week evaluation, prescription, same-exercise progression, cross-exercise transition selection, and phase readiness.

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

Candidate Intelligence does not generate workouts, compose sessions, compose weeks, run beam search, define final phase gates, or connect to Praxis application code. Candidate ranking is evidence for later composition, not a program.
