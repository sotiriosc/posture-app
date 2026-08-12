# Week Planning Horizon And Opportunity Contract

Status: `DOMAIN_CHANGE_REQUIRED`; design proposal only.

## WeekPlanningHorizon

The horizon is an explicit planning boundary, not necessarily a calendar week. It uses either an inclusive date range or an ordered-cycle range and records athlete, evaluation time, provenance, timezone/calendar references, ordered opportunities, completed and remaining IDs, and unresolved schedule context.

The horizon must be rebuilt from current product facts for each planning event. `sessionsPerWeek`, preferred days, and historical cadence are not substitutes for actual current-horizon opportunities.

## WeekTrainingOpportunity

An opportunity has stable ID and order, optional date reference, expected availability, expected equipment, provenance, availability and completion states, typed constraints, and unresolved actual-day references. Expected values are `expected_future_fact`; they are neither a promise nor a current execution fact.

Availability states are `available`, `tentative`, `cancelled`, `completed`, and `unknown`. Completion states are separate: `not_started`, `completed`, `missed`, `cancelled`, and `unknown`. This prevents a past completion from being rewritten when the remaining week is reallocated.

Expected equipment may be a capability snapshot, a resolvable reference, or explicitly unknown. Profile defaults do not silently fill missing per-opportunity equipment. Structural capacity may constrain future placement, but actual minutes, equipment, and capacity must be supplied again at materialization.

## Reallocation

Completed history is immutable. Missed/cancelled opportunities are evidence for deterministic reallocation of remaining responsibility; they do not authorize doubling, automatic compensation, or phase advancement. If required responsibility cannot fit, the result remains explicitly below minimum, blocked, policy-required, or infeasible.

## Deferred Context

Live calendar integration, accessibility, social/environmental constraints, sleep, illness, and external activity ingestion require typed Product Adapter, Safety/Clinical, or future policy contracts. Unknown context remains visible and may block intent, allocation, or materialization according to its declared owner.
