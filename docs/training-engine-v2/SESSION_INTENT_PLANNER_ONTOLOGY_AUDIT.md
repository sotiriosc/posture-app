# Session Intent Planner Ontology Audit

Status: production gate, 2026-08-12. Baseline: `fdfbe03edd243a467bc1304a738649dc9a796c52`.

## Classification

The pre-Planner domain is `TARGETED_PLANNER_DOMAIN_FIXES_REQUIRED`. Candidate Intelligence and Session Composer are sound downstream authorities, but five concepts are overloaded or underspecified for Planner authority.

| Concept | Classification | Production disposition |
| --- | --- | --- |
| `TrainingGoal` | OVERLOADED_CONCEPT | Retain for Candidate compatibility; Planner uses outcome goal plus separate context mode. |
| `SessionKind` | OVERLOADED_CONCEPT | Replace on the authoritative path with `ordinary_training`; retain legacy values only through compatibility. |
| `PhaseIntent.primaryGoal` | WRONG_OWNER | Developmental context only; never overrides directive outcome goal. |
| `PhaseIntent.priorityMuscles` | WRONG_OWNER | Phase/Week context only; never creates SessionNeeds. |
| `WeeklyIntent` numeric maps | LEGACY_COMPATIBILITY_ONLY | Never consumed by Planner; future Week Composer requires its own review. |
| `SessionAllocationDirective` | DOMAIN_CHANGE_REQUIRED | Required explicit upstream allocation authority. |
| profile availability | CORRECT_SINGLE_PURPOSE_CONCEPT | Typical/default facts only. |
| current-session availability | MISSING_CONTEXT | Add explicit minutes, capacity, and provenance. |
| `AssessmentSignal.actionFunctions` | DOMAIN_CHANGE_REQUIRED | Add optional canonical action truth; absent means unknown. |
| string dependency actions | DUPLICATE_FACT | Replace with `ExerciseActionFunction[]`. |
| `requiredRangeIds` | OVERLOADED_CONCEPT | Replace with typed `SessionRangeRequirement[]`. |
| exercise preferences | CORRECT_SINGLE_PURPOSE_CONCEPT | Candidate evidence only; never creates a need. |
| explicit session request | MISSING_CONTEXT | Add distinct objective source kind. |
| unresolved prose/context | TRACE_ONLY_NOT_BEHAVIORAL | Surface as typed observations; never parse it. |
| Week allocation, dose, final order | OUT_OF_SCOPE | Future Week Composer, Prescription, and Sequencing authority. |

## Corrected Ontology

The Planner consumes exactly one explicit `SessionAllocationDirective`, canonical athlete/phase/assessment/pain/safety/equipment/history/response facts, and explicit evaluation time. It emits the smallest truthful needs-first `SessionIntent` or a structured non-planned status.

Outcome goal is `strength`, `hypertrophy`, `general_fitness`, `conditioning`, or `posture_and_movement_quality`. `pain_aware_return` is a programming context, not an outcome. Session type is `ordinary_training`; dedicated recovery-session semantics remain unreviewed.

Allocated objectives are programming purposes, not exercises. Their kinds map explicitly to one section and role. Equivalent selection truth merges once while retaining provenance. Assessment may add at most one preferred preparation/activation need per coherent high-confidence relevant cluster. Pain, phase, preferences, and generic profile facts create no purposes.

## Unknowns And Remaining Gaps

Daily recovery/readiness, illness, accessibility/support, crowded-gym constraints, partner/superset preferences, and standalone recovery-session semantics lack reviewed typed owners/receivers. They remain unresolved observations. This does not block the ordinary-session Planner kernel; it blocks claiming those contexts are behaviorally represented.
