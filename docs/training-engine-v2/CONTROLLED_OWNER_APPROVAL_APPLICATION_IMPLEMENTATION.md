# Controlled Owner Approval And Application Implementation

Approval requires apply mode, exact owner eligibility, apply enrollment, exact ready preview and fingerprint,
current source revisions, resolved feasibility, no active legacy or V2 session, CSRF, an explicit confirmation,
and a persisted idempotency key. Approval is immutable and has an application count of zero.

Application is a second transaction. It revalidates the same authority and exact revisions, locks the current
pointer, checks optimistic pointer revision, and atomically creates the envelope, application, pointer, audit,
and idempotency completion. Exact retries replay; mismatched reuse and stale or cross-user references conflict.
The transaction does not call `generateProgram` or write legacy Program state.
