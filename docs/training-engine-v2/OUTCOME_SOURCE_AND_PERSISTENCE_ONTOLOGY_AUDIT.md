# OUTCOME SOURCE AND PERSISTENCE ONTOLOGY AUDIT

**Classification:** `OUTCOME_SOURCE_AND_ADAPTATION_PERSISTENCE_FOUNDATION_V1_READY_FOR_PRODUCTION_IMPLEMENTATION_AUTHORIZATION`

**Design status:** `OUTCOME_SOURCE_AND_ADAPTATION_PERSISTENCE_FOUNDATION_DESIGN_EVIDENCE_NOT_RUNTIME`; runtime `NOT_ACTIVATED`.

This is ontology, contract, and CAGT evidence only. It creates no live adapter, migration, persistence write, event consumer, queue, directive application, Product behavior, or program mutation.

## Current repository finding

| Record | Classification | Finding |
|---|---|---|
| ExerciseLog | RAW_PRODUCT_INPUT_ONLY | Mutable aggregate mixes planned and actual fields and has no block/source/revision lineage. |
| SessionRecord | RAW_PRODUCT_INPUT_ONLY | Completion and response fields are mutable Product truth, not normalized source authority. |
| SessionFeedback | RAW_PRODUCT_INPUT_ONLY | Structured selections may be adapted later; note fields remain inert. |
| LogPrefs | RAW_PRODUCT_INPUT_ONLY | Substitution and feedback preferences require an authenticated adapter. |
| Questionnaire | RAW_PRODUCT_INPUT_ONLY | Equipment/readiness inputs require effective-time and authorization semantics. |
| TrainingSnapshot cloud patch | TRANSPORT_ONLY | Offline retry and four-second request dedupe are not semantic source idempotency. |
| analytics/telemetry event | ANALYTICS_ONLY | Never Performance, health, Safety, or adaptation authority. |
| coach/user/free-text notes | FREE_TEXT_ONLY | Display/audit context only; behavior requires structured confirmation. |

PostgreSQL is accessed directly through `pg`/`DATABASE_URL`. Training tables are created at runtime and store mutable JSONB snapshots with `ON CONFLICT DO UPDATE`; browser state uses IndexedDB/localStorage and an ordered offline retry queue. The queue is transport resilience, not source idempotency.

Current counts: planned/actual mixing `1`, multi-block flattening candidates `1`, stable source-event linkage `0`, Prescription revision linkage `0`, Sequence revision linkage `0`, explicit event-time record types `2`, explicit ingestion-time record types `0`, semantic idempotency `0`, immutable revision history `0`.

**Ontology classification:** `TARGETED_OUTCOME_SOURCE_AND_PERSISTENCE_DOMAIN_FIXES_REQUIRED`. ExerciseLog and SessionRecord can become raw adapter inputs, not normalized authority unchanged. Notes remain unknown/inert. The future implementation should retain PostgreSQL and add owner-authorized append-only entities rather than selecting a new stack.

## Required audit answers

1. No current Product record becomes normalized source authority unchanged; ExerciseLog, SessionRecord, and structured feedback are raw candidates only.
2. ExerciseLog, SessionRecord, questionnaire, feedback/preferences, and sync snapshots lack production source-exposure lineage.
3. All current Product outcome candidates lack final Prescription and Sequence revision linkage.
4. ExerciseLog is one aggregate record and cannot preserve several planned/performed blocks independently.
5. ExerciseLog mixes `setsPlanned` with completed/repetition/load/timing fields.
6. Session/exercise feedback notes, coach notes, and questionnaire free text are prose-only for this boundary.
7. Product records can be edited/upserted today, but that is replacement in place rather than an auditable correction.
8. Training state, programs, progress, sessions, and logs are JSONB-upserted by key and rewritten in place.
9. No source record has a semantic idempotency key; request-signature and offline retry dedupe are transport-only.
10. No candidate distinguishes event time from explicit ingestion time; database `updated_at` is storage mutation time.
11. Current feedback preserves some explicit user selections but downstream legacy inference is not source authority here.
12. Product records do not carry a closed user/coach/clinician authority and review model.
13. Stable IDs, authenticated athlete identity, explicit structured selections, and explicit timestamps may be normalized with adapter validation.
14. Missing block actuals, source event/revisions, authority, recovery, diagnosis, and note-derived meanings remain unknown.
15. A future implementation should use the audited PostgreSQL/`pg` stack, explicit migrations, transactions, and append-only tables.
16. Current mutable snapshots alone cannot reproduce deterministic historical source selection after corrections.
17. No: a correction currently overwrites payload truth; the proposed ledger preserves original revisions.
18. No engine contract currently excludes revoked categories from future decisions while preserving policy-governed audit history.
19. No: several current fields are co-located in mutable records; the design keeps every source category independent.
20. Yes: Product notes remain referenced display/audit context and are not parsed.
21. Yes in design evidence: 530 admitted histories rebuild through the snapshot bridge with zero kernel semantic differences.
22. Week reallocation, deload, and production Product/human application have no fully implemented orchestration owner.
23. Week/deload must wait for a production Week Planner/allocation composer and cannot be routed to an invented owner.
24. Future owner-authorized migrations are required for the 20 conceptual append-only entities and their indexes/constraints.
25. Privacy/retention, adapter authentication, external-load receiver policy, Week ownership, and application orchestration each require separate owner decisions.
