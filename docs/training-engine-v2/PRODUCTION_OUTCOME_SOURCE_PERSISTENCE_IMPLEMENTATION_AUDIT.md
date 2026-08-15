# Production Outcome Source Persistence Implementation Audit

- Classification: `PRODUCTION_OUTCOME_SOURCE_ADAPTERS_AND_APPEND_ONLY_PERSISTENCE_READY_FOR_PRODUCTION_WEEK_PLANNER_AND_ALLOCATION_AUTHORIZATION`
- Ontology: `TARGETED_PRODUCTION_OUTCOME_SOURCE_PERSISTENCE_DOMAIN_FIXES_REQUIRED`
- Status: `PRODUCTION_OUTCOME_SOURCE_ADAPTERS_AND_APPEND_ONLY_PERSISTENCE_IMPLEMENTED_NOT_ACTIVATED`
- Activation: `NOT_ACTIVATED`
- Contracts: `PRODUCTION_OUTCOME_SOURCE_INGESTION@1.0.0`, `PRODUCTION_OUTCOME_SOURCE_PERSISTENCE@1.0.0`, `PRODUCTION_OUTCOME_SOURCE_REPLAY@1.0.0`, `PRODUCTION_ADAPTATION_PERSISTENCE@1.0.0`

## Repository findings

| Area | Classification | Finding |
| --- | --- | --- |
| trainingStoreDb | MUTABLE_SNAPSHOT_STORE | Runtime DDL and JSONB upserts remain unchanged. |
| ExerciseLog | PLANNED_ACTUAL_MIXED / MULTI_BLOCK_FLATTENED | Useful restricted facts, no exact realization authority. |
| SessionRecord | PRODUCTION_ADAPTER_INPUT_CANDIDATE / LEGACY_IMPORT_ONLY | Structured completion and timing are useful but lineage is incomplete. |
| SessionFeedback | PRODUCTION_ADAPTER_INPUT_CANDIDATE / FREE_TEXT_ONLY | Scalars are projectable; notes are excluded. |
| IndexedDB/localStorage | TRANSPORT_ONLY / MUTABLE_SNAPSHOT_STORE | Retry and synchronization are not source idempotency. |
| Consumer and gyms routes | OUT_OF_SCOPE | Existing training-state routes remain unchanged and unwired. |
| Identity | MISSING_AUTHORIZATION | Current user ID can anchor athlete mapping only after Product authorization. |
| CI | PRODUCTION_READY_UNCHANGED | New isolated PostgreSQL service job is additive. |
| Account deletion/export | DOMAIN_CHANGE_REQUIRED | New-table retention/export behavior requires Product/legal policy. |
| Analytics/logging | ANALYTICS_ONLY | Never adaptation authority; raw payload logging is prohibited. |

## Binding audit answers

1. Pure source contracts belong to `packages/training-engine-v2`.
2. Server-only PostgreSQL persistence belongs to `packages/engine` through its explicit subpath.
3. Yes. Training Engine V2 retains zero `pg` or database dependencies.
4. Structured portions of ExerciseLog, SessionRecord, SessionFeedback, questionnaire, and equipment preferences can be projected as restricted context.
5. Every current Product mapping remains legacy/import-only until source-event and revision lineage is supplied.
6. ExerciseLog mixes planned sets with user-entered actual-like fields.
7. ExerciseLog flattens prescribed multi-block work to one exercise-level record.
8. ExerciseLog, SessionRecord, feedback, questionnaire, and equipment preferences lack production source-event lineage.
9. All current Product records lack explicit Prescription and Sequence revisions.
10. Questionnaire/equipment snapshots and some SessionRecord/feedback records lack independent event time.
11. TrainingSnapshot, programs, progress, sessions, exercise logs, IndexedDB, and localStorage use mutable overwrite semantics.
12. No prior versioned application migration system existed; runtime `ensureDb` created legacy tables.
13. A dedicated PR job with PostgreSQL 16 and `TEST_DATABASE_URL` hosts the real integration suite.
14. Connections must be pooled, bounded, caller-managed, short-lived, and never created by package import or migration-on-request.
15. The existing `pg` stack and secure DATABASE_URL normalization convention are retained; the new repository requires injected pool/client ownership.
16. Existing `ensureDb` behavior remains byte-equivalent and untouched.
17. Yes. New tables exist only in a versioned explicit migration.
18. Yes. Persistence is exported only from `@praxis/engine/outcome-source-persistence` and is absent from app imports.
19. Yes. The legacy analyzer is pure, read-only, and reports zero writes.
20. Retention, erasure/anonymization, consent wording, lawful basis, data residency, medical-record policy, and jurisdictional compliance remain Product/legal decisions.


## Evidence

- Controlled: 180; foundation holdout: 360.
- Pure stress: PRODUCTION_OUTCOME_SOURCE_PERSISTENCE_STRESS_PASS; PostgreSQL stress executes in the isolated PR service job.
- Golden comparisons: 530; semantic mismatches: 0.
- Production adapter contracts: 15; Product mappings: 5; live app mappings: 0.
- Physical tables: 24; append-only tables: 22; indexes: 29.

## Permanent boundary

No app wiring, automatic migration, production database access, production backfill, automatic snapshot/evaluation, directive application, Product mutation, UI change, or activation is included.
