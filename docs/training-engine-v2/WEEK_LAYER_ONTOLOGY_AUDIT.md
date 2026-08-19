# Week Layer Ontology Audit

Status: mandatory pre-design gate, 2026-08-12. Baseline: `17efa3e8cdf3e5c4eacb195bf62f8445043aa3df`.

## Classification

The production baseline is `WEEK_ONTOLOGY_FOUNDATION_GAP`. Candidate Intelligence, Session Composer, and Session Intent Planner remain valid production authorities, but the legacy weekly domain cannot truthfully control weekly behavior.

| Existing or proposed concept | Classification | Audit disposition |
| --- | --- | --- |
| legacy `WeeklyIntent` | OVERLOADED_CONCEPT | Compatibility audit target only; it mixes intent, allocation counts, dose labels, spacing, phase context, and prose. |
| `sessionsPerWeek` | WRONG_OWNER | A profile or intent count cannot substitute for explicit current-horizon opportunities. |
| `movementExposure` numbers | UNDEFINED_UNIT | Neither allocation opportunity, prescribed dose, completed exposure, nor response is declared. |
| `muscleExposure` numbers | UNDEFINED_CREDIT_SEMANTICS | No relationship, dose, source-event, or completion semantics exist. |
| `priorityExposure` strings | OVERLOADED_CONCEPT | Untyped strings cannot establish purpose, target, priority, provenance, or receiver. |
| `recoverySpacing` numbers | UNDEFINED_UNIT | Hours, days, opportunity distance, and expected versus realized burden are unspecified. |
| `volumeIntent` labels | TRACE_ONLY_NOT_BEHAVIORAL | Labels cannot replace reviewed dose targets or Prescription. |
| `phaseObjective` prose | TRACE_ONLY_NOT_BEHAVIORAL | Prose cannot create weekly objectives. |
| fixed split labels | WRONG_OWNER | Presentation may derive labels after allocation; labels cannot cause allocation. |
| `WeekPlanningHorizon` | DOMAIN_CHANGE_REQUIRED | Design explicit ordered opportunities, provenance, completion, and unresolved schedule context. |
| `WeekTrainingOpportunity` | DOMAIN_CHANGE_REQUIRED | Separate expected future availability/equipment from profile preference and actual day-of facts. |
| proposed `WeeklyIntent` | DOMAIN_CHANGE_REQUIRED | Normalize outcome, explicit objectives, policy references, contexts, continuity, and provenance without day allocation. |
| `WeeklyDevelopmentObjective` | DOMAIN_CHANGE_REQUIRED | One stable weekly responsibility with structured target and policy-owned frequency intent. |
| `ReviewedWeeklyProgrammingPolicy` | MISSING_CONTEXT | Required owner for any scientific or programming rule; no production numeric values are approved. |
| `SessionAllocationReservation` | DOMAIN_CHANGE_REQUIRED | Planned future responsibility, explicitly not a current-session fact or directive. |
| materialized `SessionAllocationDirective` | CORRECT_SINGLE_PURPOSE_CONCEPT | Existing production contract remains the execution-time handoff after actual facts are supplied. |
| allocation ledger | DOMAIN_CHANGE_REQUIRED | Tracks responsibility/opportunity only, with no dose credit. |
| planned Prescription ledger | DEFER_TO_PRESCRIPTION | Future prescribed source exposures and dose. |
| completed response ledger | DEFER_TO_LONGITUDINAL_ADAPTATION | Future performance, adherence, symptoms, recovery, and adaptation evidence. |
| external training load | MISSING_CONTEXT | Design a typed seam; unsupported load remains unresolved until reviewed policy has a receiver. |
| sleep, illness, accessibility, social constraints | UNKNOWN_REQUIRES_REVIEW | Route to Product Adapter, Safety/Clinical, materialization, or future typed contracts. |
| standalone recovery session | UNKNOWN_REQUIRES_REVIEW | `KEEP_DEFERRED`; ordinary-session invariants do not establish a distinct recovery-session ontology. |
| exercise selection, dose, final order | OUT_OF_SCOPE | Candidate/Composer, Prescription, and Sequencing remain downstream owners. |

## Truth-State Separation

The Week design must never collapse these states:

| Truth state | Canonical example | Permitted Week consequence |
| --- | --- | --- |
| expected future fact | opportunity expected minutes/equipment | planning feasibility only |
| actual current fact | materializer current minutes/equipment/safety | directive materialization or explicit reroute |
| planned allocation | reservation objective responsibility | allocation ledger entry only |
| prescribed dose | sets/reps/load/time/range/rest | future planned Prescription ledger |
| completed performance | completed source exposure | future completed response ledger |
| observed response | symptoms, tolerance, recovery, progression | future longitudinal policy input |

Absence of a current opportunity means unknown/unavailable, never profile-default availability unless that fallback is explicit and traced. Absence of frequency or recovery policy means policy required. Absence of prescribed dose means physiological satisfaction and exact recovery burden are unknown. Prose is inert everywhere.

## Required Design Corrections

The design lab must separate Weekly Intent Planner, Week Allocation Composer, Session Allocation Materializer, Session Intent Planner, Candidate Intelligence, Session Composer, Prescription, post-Prescription Week evaluation, and Longitudinal Adaptation. It must model responsibilities rather than split labels, reserve future sessions without claiming current facts, and use a downstream feasibility oracle without inspecting or rewriting production internals.

## Policy And Horizon Amendment (2026-08-12)

The foundation gap is narrowed by typed reviewed-policy rules and a private Product Horizon Adapter design. Objectives now own structured goal relationships; reservations own session-specific goals; spacing declares ordered-gap, elapsed-time, pending-Prescription, or external-event basis. These remain non-production. The sole production amendment is Planner acceptance of one explicitly allocated required `capacity_main` as the ordinary session's dominant responsibility.
