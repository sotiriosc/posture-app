# Weekly Intent Planner Design Contract

Status: `DESIGN_READY` for ontology review and `OWNER_POLICY_REQUIRED` for production rules. This is a non-production proposal. No public API or runtime behavior is added.

## Responsibility

The future Weekly Intent Planner may translate explicit current-horizon inputs into structured weekly development responsibilities. It owns objective truth, not placement. It must not choose session dates, split labels, exercises, sets, repetitions, loads, rest, final sequence, phase changes, or progression.

Input must include an athlete, explicit outcome goal, phase intent reference, `WeekPlanningHorizon`, assessment and pain/safety facts, history, explicit weekly priorities, external-load context, evaluation time, and a reviewed weekly programming policy. Experience, profile goal, or a legacy numeric map cannot independently create an objective.

## Result States

`WeeklyIntentPlanningResult` returns one of:

- `weekly_intent_planned` when goal, current opportunities, explicit priorities, readiness, and reviewed frequency policy are sufficient;
- `weekly_goal_under_specified` when the outcome goal is absent;
- `weekly_policy_required` when a material priority lacks approved allocation-frequency policy;
- `current_week_availability_required` when no usable current-horizon opportunity exists;
- `contradictory_week_input` when typed facts disagree;
- `blocked_by_training_readiness` for a global execution block;
- `unsupported_context` when a material fact has no legitimate receiver or reviewed rule.

Every result carries readiness, included/omitted/merged objective traces, policy findings, context-ownership findings, unresolved context, and deterministic decision trace.

## WeeklyIntent

The proposal contains one outcome goal, ordered secondary goals, structured context modes, a phase reference, normalized `WeeklyDevelopmentObjective` values, policy and assessment references, pain/safety references, continuity evidence, opportunity references, unresolved context, and source trace. It contains no session allocation and no prescribed dose.

Equivalent explicit priorities may merge only when purpose, target, and policy semantics are equivalent; source evidence remains additive. Prose is explanatory only. The legacy `WeeklyIntent` is `LEGACY_COMPATIBILITY_ONLY` and cannot be consumed behaviorally.

## Invariants

- Expected future facts remain distinct from actual current facts.
- No objective is inferred from a fixed split or generic phase prose.
- Missing policy stays explicit; it is never replaced by a default number.
- Global safety may block intent; local pain or assessment context only changes intent through a typed reviewed rule.
- Productive continuity is evidence, not an immutable schedule.
- Production implementation remains blocked on owner policy approval and product adapters for live horizon facts.

## Policy And Goal Ownership Amendment (2026-08-12)

Each proposed objective now records typed `primary_weekly_goal`, `secondary_weekly_goal`, or `cross_goal_support` evidence. Frequency has no hidden default: missing authority returns `FREQUENCY_POLICY_REQUIRED`. Phase selects only explicitly applicable reviewed policy and never multiplies values. Numeric policy remains unapproved.
