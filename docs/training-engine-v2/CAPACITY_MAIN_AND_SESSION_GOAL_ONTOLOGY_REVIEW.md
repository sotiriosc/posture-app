# Capacity Main And Session Goal Ontology Review

Status: two targeted corrections approved; broad conditioning remains bounded.

## Dominant Responsibility

Production Planner validation now accepts exactly one required dominant ordinary-session responsibility represented by `dominant_main` or `capacity_main`. `capacity_main` maps to main/capacity, requires explicit allocation, and cannot coexist with a competing dominant responsibility. Goal, phase, or a carry exercise cannot synthesize it. Recovery cannot become dominant main, and no new session type is introduced.

| Capability | Classification |
|---|---|
| Loaded carry, bracing, and represented work-capacity responsibility | `CURRENTLY_SUPPORTED` |
| Local muscular capacity | `PARTIALLY_SUPPORTED` |
| Systemic/cardiorespiratory conditioning | `PRESCRIPTION_CONTRACT_REQUIRED` |
| Interval/cardio modalities outside the catalog | `CATALOG_OR_MODALITY_REQUIRED` |
| Carries as a complete conditioning substitute | `CURRENTLY_UNSUPPORTED` |

## Session Goal Ownership

`WeeklyDevelopmentObjective.goalRelationships` records `primary_weekly_goal`, `secondary_weekly_goal`, or `cross_goal_support` with evidence. A reservation separately records weekly primary/secondary goals and one `sessionOutcomeGoal` justified by dominant objective evidence. Materialization copies that goal into the directive; Candidate receives the directive goal unchanged. Conflicting dominant-goal evidence returns `SESSION_GOAL_CONFLICT`; section and exercise targets cannot invent a goal.

Candidate Intelligence, catalog, Knowledge, Session Composer, public API, and non-capacity Planner behavior are unchanged. The isolated Planner fingerprint changes from `44d959a156caa1c4d4494aaed0f30a48bf5ad3f5a6f1c6e5ffde4900217d3d13` to `b7faa908aa21262ad6875b846be0fac17139ec490458a26853b58dbe5dd5a8ab`.
