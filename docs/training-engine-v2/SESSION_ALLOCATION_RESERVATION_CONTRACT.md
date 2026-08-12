# Session Allocation Reservation Contract

Status: `DESIGN_READY` for ontology review and `DOMAIN_CHANGE_REQUIRED` for production adoption.

`SessionAllocationReservation` is the Week Composer's planned assignment of weekly responsibilities to one future opportunity. It is not a `SessionAllocationDirective`, current-session truth, exercise prescription, completed session, or fixed split.

## Required Content

- week intent, opportunity, and athlete identity;
- ordinary-training session type, outcome goal, and context modes;
- one or more `ReservedSessionObjective` responsibilities;
- expected structural capacity, availability, and equipment with future-fact provenance;
- neighboring reservation and weekly source references;
- unresolved weekly and current-session context;
- reservation status and deterministic source trace.

Each reserved objective retains weekly objective ID and weekly priority while adding a session-local role and priority. The dominant responsibility of an ordinary training reservation becomes locally required so the current frozen Session Planner can enforce it; this does not rewrite the weekly priority or grant dose credit.

## Status And Invariants

Statuses are `reserved`, `completed_immutable`, `missed_requires_reallocation`, `cancelled_requires_reallocation`, `blocked_by_training_readiness`, and `unresolved`.

- A reservation contains no exercise identity, set/rep/load target, final order, or completion claim.
- A reservation must reference an explicit current-horizon opportunity.
- Empty reservations are prohibited.
- Required objectives are considered before preferred and optional objectives.
- Assessment or optional responsibilities are not repeated without unique marginal value.
- A fixed-split label cannot create, remove, or position a responsibility.
- Actual-day divergence routes through materialization and Week reallocation.
