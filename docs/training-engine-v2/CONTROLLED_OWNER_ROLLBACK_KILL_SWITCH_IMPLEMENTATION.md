# Controlled Owner Rollback And Kill Switch Implementation

Rollback requires apply mode, the exact owner, same-origin CSRF, an idempotency key, explicit confirmation, and
the exact active application/pointer revision. One transaction compare-and-swaps the pointer to legacy and appends
the audit/idempotency records. It deletes `0` rows and preserves envelopes, Performance, Outcomes, drafts, audit,
and legacy data. Exact retries return the prior result; stale transitions fail closed.

Off mode short-circuits before session or database access. Owner routes and mutations return 404, active attempts
are suspended/read-only, exact drafts remain stored, and ordinary legacy Product remains authoritative.
