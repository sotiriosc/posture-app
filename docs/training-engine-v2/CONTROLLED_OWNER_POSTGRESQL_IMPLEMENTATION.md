# Controlled Owner PostgreSQL Implementation

The implementation uses nine isolated `owner_v2_*` tables, the existing append-only Session Practice revision
table, and existing append-only Outcome Source tables. PostgreSQL 16 integration executes enrollment/profile,
preview, approval, envelope, application, pointer, audit, idempotency, session completion, Outcome ingestion,
exact replay, rollback, cross-user isolation, and transaction-conflict cases. Local skip is permitted only when
`TEST_DATABASE_URL` is absent; the pull-request PostgreSQL 16 job is required and authoritative.
