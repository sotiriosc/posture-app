# Production Outcome Source Migration Runner

- Classification: `PRODUCTION_OUTCOME_SOURCE_ADAPTERS_AND_APPEND_ONLY_PERSISTENCE_READY_FOR_PRODUCTION_WEEK_PLANNER_AND_ALLOCATION_AUTHORIZATION`
- Ontology: `TARGETED_PRODUCTION_OUTCOME_SOURCE_PERSISTENCE_DOMAIN_FIXES_REQUIRED`
- Status: `PRODUCTION_OUTCOME_SOURCE_ADAPTERS_AND_APPEND_ONLY_PERSISTENCE_IMPLEMENTED_NOT_ACTIVATED`
- Activation: `NOT_ACTIVATED`
- Contracts: `PRODUCTION_OUTCOME_SOURCE_INGESTION@1.0.0`, `PRODUCTION_OUTCOME_SOURCE_PERSISTENCE@1.0.0`, `PRODUCTION_OUTCOME_SOURCE_REPLAY@1.0.0`, `PRODUCTION_ADAPTATION_PERSISTENCE@1.0.0`

## Runner

The caller supplies a pool and migration set. Planning is read-only. Application takes a PostgreSQL advisory lock, verifies SHA-256 history, applies one transaction per migration, and records the result. Changed SQL, hidden reruns, automatic down migration, import/start/build/request execution, and deployment hooks are absent. Forward fixes require a new migration.

## Evidence

- Controlled: 180; foundation holdout: 360.
- Pure stress: PRODUCTION_OUTCOME_SOURCE_PERSISTENCE_STRESS_PASS; PostgreSQL stress executes in the isolated PR service job.
- Golden comparisons: 530; semantic mismatches: 0.
- Production adapter contracts: 15; Product mappings: 5; live app mappings: 0.
- Physical tables: 24; append-only tables: 22; indexes: 29.

## Permanent boundary

No app wiring, automatic migration, production database access, production backfill, automatic snapshot/evaluation, directive application, Product mutation, UI change, or activation is included.
