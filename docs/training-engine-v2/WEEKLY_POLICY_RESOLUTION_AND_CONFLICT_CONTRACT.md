# Weekly Policy Resolution And Conflict Contract

Status: design-only `OWNER_SEMANTICS_APPROVED`.

`ReviewedWeeklyProgrammingPolicy.rules` is a compact typed union for participation intent, objective frequency intent, direct-development ownership, assessment recurrence, spacing requirements, soft-ceiling behavior, constrained-horizon priority, phase applicability, and explicit conflict resolution. Rule prose and `ruleRefs` are trace evidence, not executable behavior.

Applicability may inspect explicit outcome and secondary goals, experience, phase, programming context, objective purpose, target type, population, and horizon capacity. A more specific rule overrides a broader applicable rule only through an explicit override reference. Equally authoritative, equally specific incompatible rules do not blend and return `WEEKLY_POLICY_CONFLICT`. Missing frequency authority returns `WEEKLY_POLICY_REQUIRED`; unknown never becomes zero.

Resolution is deterministic and emits considered rule IDs, matched scope dimensions, override evidence, rejected alternatives, and conflict evidence. Timestamps, array order, prose, and arbitrary authority ranking do not break ties. No rule becomes executable merely because it cites evidence.
