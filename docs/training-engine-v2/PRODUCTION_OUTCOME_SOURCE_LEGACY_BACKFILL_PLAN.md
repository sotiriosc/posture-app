# Production Outcome Source Legacy Backfill Plan

- Classification: `PRODUCTION_OUTCOME_SOURCE_ADAPTERS_AND_APPEND_ONLY_PERSISTENCE_READY_FOR_PRODUCTION_WEEK_PLANNER_AND_ALLOCATION_AUTHORIZATION`
- Ontology: `TARGETED_PRODUCTION_OUTCOME_SOURCE_PERSISTENCE_DOMAIN_FIXES_REQUIRED`
- Status: `PRODUCTION_OUTCOME_SOURCE_ADAPTERS_AND_APPEND_ONLY_PERSISTENCE_IMPLEMENTED_NOT_ACTIVATED`
- Activation: `NOT_ACTIVATED`
- Contracts: `PRODUCTION_OUTCOME_SOURCE_INGESTION@1.0.0`, `PRODUCTION_OUTCOME_SOURCE_PERSISTENCE@1.0.0`, `PRODUCTION_OUTCOME_SOURCE_REPLAY@1.0.0`, `PRODUCTION_ADAPTATION_PERSISTENCE@1.0.0`

## No-write plan

Legacy source tables are app_user_state, app_user_sessions, and app_user_exercise_logs. Stable record IDs may support contextual history, but source-event, block, Prescription-revision, Sequence-revision, and independently observed timing mappings are absent. A dry run classifies every gap; no mapping is fabricated and no production write is available. Product/coach confirmation, correction review, monitoring, rollback, deletion/export, and retention policy remain prerequisites.

## Evidence

- Controlled: 180; foundation holdout: 360.
- Pure stress: PRODUCTION_OUTCOME_SOURCE_PERSISTENCE_STRESS_PASS; PostgreSQL stress executes in the isolated PR service job.
- Golden comparisons: 530; semantic mismatches: 0.
- Production adapter contracts: 15; Product mappings: 5; live app mappings: 0.
- Physical tables: 24; append-only tables: 22; indexes: 29.

## Permanent boundary

No app wiring, automatic migration, production database access, production backfill, automatic snapshot/evaluation, directive application, Product mutation, UI change, or activation is included.
