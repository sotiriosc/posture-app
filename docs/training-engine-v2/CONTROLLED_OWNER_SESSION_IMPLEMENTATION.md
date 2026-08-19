# Controlled Owner Session Implementation

`/account/praxis-v2/session/[attemptId]` is a dedicated server-gated owner route and client. It reads an exact
owner application and envelope, reconstructs the final V2 Session Intent, Composer handoff, Prescription,
Sequence, Gate 13, and Week lineage, then resumes the latest immutable revision for that exact attempt.

The client renders exact exercise realization and dose blocks plus generated compact Knowledge from the
64-entry production catalog. It does not import or modify the current `SessionClient`, legacy draft store, or
legacy exercise log path.
