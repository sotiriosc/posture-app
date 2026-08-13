# Session Composer Production Kernel

Public low-level functions:

- `buildSessionCandidateResults(intent, context)` creates one authoritative Candidate Intelligence request/result per need.
- `validateSessionCandidateResults(intent, results)` rejects stale or cross-context inputs.
- `deriveCanonicalCompositionFacts(...)` projects immutable exercise/session evidence.
- `composeSessionSkeleton(...)` runs the approved production policy.
- `composeSessionSkeletonExhaustive(...)` is the tractable oracle.
- `buildSessionPrescriptionHandoff(...)`, `evaluatePostPrescriptionDuration(...)`, and `buildSessionSequencingInput(...)` preserve downstream ownership.

Assignments have exactly one section and role, one stable identity, one future source exposure, one routine Prescription handoff, all satisfied need IDs, per-need candidate evidence, continuity evidence, unresolved review/resolution IDs, fallback visibility, and marginal-value reasons.

The kernel is pure and deterministic. It is not connected to application UI, program generation, Week Composer, final workout output, dose generation, or final sequencing.

## Planner Integration

The upstream production Planner now emits authoritative needs-first intents. Composer consumes those needs unchanged and remains forbidden from reconstructing allocation, parsing phase or assessment prose, or applying current-minute thresholds. The optional `planAndComposeSessionSkeleton` helper performs only Planner, canonical Candidate adaptation, and this kernel. The frozen combined Composer fingerprint remains `3062491178d9578ca3c4c3093cfab8cc5149bf1c9213b489102c81e88598efe9`.

## Week Feasibility Oracle Boundary

The Week design may precompute proposed responsibility-combination feasibility by invoking the frozen Planner, Candidate, and Composer stack as an opaque oracle. Results are evidence statuses, not permission to inspect internals, select exercises in the Week layer, or claim actual-day feasibility. The production Composer does not know about horizons, reservations, frequency intent, reallocation, or weekly ledgers.

All controlled reservations selected by the design lab pass this downstream oracle after materialization under matching facts. Composer behavior, API, and fingerprint remain unchanged.

## Coherent Session CAGT Evidence

The frozen production kernel was exercised as the Gate 8 authority for 38 complete-session coherence scenarios. It accepts empty preparation, preserves required dependencies under condensed capacity, enforces role/section legality and identity uniqueness, emits dependency order, and reports required gaps as infeasible. No Composer behavior or public API changed; the combined fingerprint remains `3062491178d9578ca3c4c3093cfab8cc5149bf1c9213b489102c81e88598efe9`.
