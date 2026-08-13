# Week Allocation Composer Design Contract

Status: `DESIGN_READY` as a non-production design lab; production implementation is `OWNER_POLICY_REQUIRED` and `DOMAIN_CHANGE_REQUIRED`.

## Responsibility

The future Week Allocation Composer distributes approved weekly responsibilities across ordered opportunities and emits `SessionAllocationReservation` values. It does not invent intent, infer a fixed split, materialize current facts, select exercises, prescribe dose, sequence sessions internally, score adaptation, repair missed work by doubling, or advance phases.

`WeekAllocationCompositionInput` contains a normalized Weekly Intent, planning horizon, ordered opportunities, completion state, prior continuity evidence, reviewed policy, recovery-spacing requirements, precomputed downstream feasibility results, evaluation time, and deterministic search policy.

## Whole-Plan Search

The design lab enumerates complete small-horizon allocations, rejects hard-invalid plans, compares survivors lexicographically, and applies a canonical final tie-break. A bounded production design may use Pareto-frontier pruning, but bounds and completeness behavior require approval. Additive weighted scores are rejected because they let soft preferences purchase violations and conceal policy tradeoffs.

The opaque feasibility oracle receives proposed responsibility combinations under an opportunity's expected context and returns feasibility status plus trace. The Week Composer must not inspect, reproduce, or override Session Planner, Candidate, or Composer internals.

## Output

`WeekAllocationPlan` records status, reservations, objective allocation/unallocation traces, recovery, continuity, equipment and capacity traces, search completeness, whole-week evaluation, objective satisfaction, unresolved Prescription/current-session requirements, reallocation state, and decision trace.

Allocation success means responsibility was reserved in an opportunity. It does not mean exercise feasibility under actual day-of facts, prescribed-dose sufficiency, completed exposure, or observed response.

## Hard Invariants

- Global safety permits planning and every selected opportunity is legal.
- Completed opportunities and completed allocation history remain immutable.
- Required approved minimums are met when feasible or explicitly unresolved when not.
- Required spacing rules are satisfied unless their dependency is explicitly deferred.
- Precomputed feasibility is respected; search does not bypass the production oracle.
- Reservations are non-empty, opportunity-bounded, and free of exercise/dose claims.
- No automatic doubling, split-label causation, or untraced fallback.

## Continuity And Marginal Value

Productive objective-to-opportunity relationships are preserved when still legal and useful. Change requires a traceable reason: availability, equipment, safety, explicit goal/priority, reviewed policy, recovery spacing, or feasibility. Optional duplication is admitted only after higher-priority obligations and only when its Boolean marginal-value lane is true.

## Policy And Goal Amendment (2026-08-12)

Allocation consumes explicit reviewed frequency rules and factual horizons; neither is invented from profile or goal labels. It chooses one session goal from dominant objective relationships and may allocate a truthful `capacity_main` responsibility where supported. Product source resolution, dose generation, and broad conditioning modality invention remain outside this composer.
