# Session Intent Planner Production Kernel

Status: implemented pure deterministic kernel, 2026-08-12.

`planSessionIntent(input)` validates an explicit allocation, normalizes allocated objectives, admits bounded assessment enrichment, merges equivalent need truth, projects continuity onto active needs, and emits the smallest truthful needs-first `SessionIntent`. Non-planned outcomes are `requires_week_or_explicit_session_allocation`, `under_specified`, `contradictory_directive`, `requires_week_reallocation`, and `unsupported_context`.

The Planner reuses `ExerciseSelectionNeed`; it does not select exercises. Candidate Intelligence remains the exercise legality and local evidence authority. Session Composer remains the whole-session coexistence authority. Prescription owns dose, support, load, range realization, and duration feasibility. Sequencing owns final order. The future Week Composer owns weekly split, frequency, volume, and reallocation.

`planAndComposeSessionSkeleton` is a thin integration helper only: Planner, canonical Candidate requests, then Composer. It adds no policy. Candidate requests receive the intent outcome goal, phase, section, selection need, and the same athlete, assessment, pain, safety, current equipment, history, fatigue, and timestamp.

No minute thresholds exist. Fatigue cannot erase allocation. Pain and phase cannot create needs. Prose is trace-only. Continuity is derived from history, response, equipment, and block state, and only identities serving active needs survive projection.

Overall classification: `SESSION_INTENT_PLANNER_READY_FOR_WEEK_COMPOSER_DESIGN`. The ordinary-session kernel is production-ready for its bounded contract. Typed readiness, accessibility, social constraints, crowded-gym adaptation, and standalone recovery-session ontology remain explicit future-owned gaps and are not silently approximated by this Planner.

## Week Design Consumer Boundary

The non-production Week lab confirms the Planner consumes only a materialized `SessionAllocationDirective`, never a future reservation. Actual current facts must be supplied at materialization. The Week Composer may call the existing Planner-to-Candidate-to-Composer pipeline only as an opaque precomputed feasibility oracle and may not duplicate its rules.

Capacity-only ordinary reservations currently fail the Planner's required `dominant_main` invariant. That is an explicit ontology/owner decision, not permission for the Week layer to synthesize a main strength need. Planner production behavior and fingerprint `44d959a156caa1c4d4494aaed0f30a48bf5ad3f5a6f1c6e5ffde4900217d3d13` remain frozen.
