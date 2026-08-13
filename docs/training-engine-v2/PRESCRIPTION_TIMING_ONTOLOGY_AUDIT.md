# Prescription Timing Ontology Audit

Classification: `PRESCRIPTION_TIMING_FOUNDATION_READY_FOR_NON_PRODUCTION_COMPILER_DESIGN`.

## Finding Summary

| Concept | Classification | Current disposition |
| --- | --- | --- |
| `ExerciseDose` | DOMAIN_CHANGE_REQUIRED | Canonical vocabulary now includes `step_sets`; all modes remain discriminated. |
| `DoseBase.tempo` | OVERLOADED_CONCEPT | Removed from base dose. Tempo is legal only on repetition/step-set shapes that explicitly expose it. |
| `TempoPrescription` | DOMAIN_CHANGE_REQUIRED | Replaced by Tempo V2 discriminated union: `repetition_phase_tempo`, `intent_only`, `not_prescribed`, `not_applicable`, `unknown`, `legacy_compatibility`. |
| `pauseSeconds` | AMBIGUOUS_PHASE_MEANING | Preserved only through `adaptLegacyTempoPrescription`; ambiguous pause returns `LEGACY_TEMPO_PHASE_AMBIGUOUS`. |
| `topOrEndRangePauseSeconds` | AMBIGUOUS_PHASE_MEANING | Same legacy-only boundary; not production authority. |
| `breathingPhaseStandard` | LEGACY_COMPATIBILITY_ONLY | Retained as inert prose; structured `breathingCadence` is separate. |
| `gaitControlStandard` | LEGACY_COMPATIBILITY_ONLY | Retained as inert prose; structured `locomotorCadence` is separate. |
| `marchControlStandard` | LEGACY_COMPATIBILITY_ONLY | Retained as inert prose; structured `marchCadence` is separate. |
| `TimeTarget` | CORRECT_SINGLE_PURPOSE_CONCEPT | Still represents seconds target; owner depends on dose mode context. |
| `BreathCyclesDose` | CORRECT_SINGLE_PURPOSE_CONCEPT | Breath cycles are not repetitions and do not accept rep tempo. |
| `TimedHoldDose` | CORRECT_SINGLE_PURPOSE_CONCEPT | Hold duration is exposure duration and does not accept rep tempo. |
| `DistanceCarryDose` / `TimedCarryDose` | CORRECT_SINGLE_PURPOSE_CONCEPT | Carry distance/duration remain dose; pace is cadence, not tempo. |
| `StepMarchDose` | CORRECT_SINGLE_PURPOSE_CONCEPT | Stationary truth is explicit; distance claims hard-fail. |
| `StepSetsDose` | MISSING_DOSE_MODE resolved | Added for non-stationary counted-step tasks. |
| `ExerciseDefinition` | MISSING_EXERCISE_KNOWLEDGE resolved | Every row now carries `prescriptionKnowledge`. |
| Performance outcome | DOMAIN_CHANGE_REQUIRED | `actualTiming` separates observed/unknown actual tempo/duration from prescribed timing. |
| Prescription handoff | DOMAIN_CHANGE_REQUIRED | Gate 9 handoff now carries timing capability/provenance and policy requirement only. |
| Duration handoff | DOMAIN_CHANGE_REQUIRED | Gate 10 now reports determinability, unknown tempo contribution, rest/setup dependency, and no invented session time. |

## Timing Concepts

The implementation separates five concepts:

1. repetition tempo inside one dynamic repetition;
2. total exposure duration for holds, trips, marches, and selected timed exposures;
3. breathing cadence;
4. locomotor, march, or step cadence;
5. session duration after Prescription and Sequencing facts exist.

No source parses prose for behavior. Unknown is not natural. Missing pause is not zero. Prescribed tempo is not actual tempo.

Fingerprint: `289711148281fd432934709d59460c0e510bc2b25a6073ce64b689f98056baea`.

## Full Prescription Extension

The full Prescription design lab consumes this timing foundation unchanged. Timing remains one ontology inside the larger Prescription plan; source exposure, revisions, block purposes, policy resolution, performance block linkage, and weekly ledger boundaries are added separately.

Full design fingerprint: `9c32aa988525f229b8bf9d31574689fd492fc5bd7e9b3756f164c6c9f4a02805`.
