# Session Intent Planner Production Kernel

Status: implemented pure deterministic kernel, 2026-08-12.

`planSessionIntent(input)` validates an explicit allocation, normalizes allocated objectives, admits bounded assessment enrichment, merges equivalent need truth, projects continuity onto active needs, and emits the smallest truthful needs-first `SessionIntent`. Non-planned outcomes are `requires_week_or_explicit_session_allocation`, `under_specified`, `contradictory_directive`, `requires_week_reallocation`, and `unsupported_context`.

The Planner reuses `ExerciseSelectionNeed`; it does not select exercises. Candidate Intelligence remains the exercise legality and local evidence authority. Session Composer remains the whole-session coexistence authority. Prescription owns dose, support, load, range realization, and duration feasibility. Sequencing owns final order. The future Week Composer owns weekly split, frequency, volume, and reallocation.

`planAndComposeSessionSkeleton` is a thin integration helper only: Planner, canonical Candidate requests, then Composer. It adds no policy. Candidate requests receive the intent outcome goal, phase, section, selection need, and the same athlete, assessment, pain, safety, current equipment, history, fatigue, and timestamp.

No minute thresholds exist. Fatigue cannot erase allocation. Pain and phase cannot create needs. Prose is trace-only. Continuity is derived from history, response, equipment, and block state, and only identities serving active needs survive projection.

Overall classification: `SESSION_INTENT_PLANNER_READY_FOR_WEEK_COMPOSER_DESIGN`. The ordinary-session kernel is production-ready for its bounded contract. Typed readiness, accessibility, social constraints, crowded-gym adaptation, and standalone recovery-session ontology remain explicit future-owned gaps and are not silently approximated by this Planner.

## Week Design Consumer Boundary

The non-production Week lab confirms the Planner consumes only a materialized `SessionAllocationDirective`, never a future reservation. Actual current facts must be supplied at materialization. The Week Composer may call the existing Planner-to-Candidate-to-Composer pipeline only as an opaque precomputed feasibility oracle and may not duplicate its rules.

The approved narrow correction accepts one required, explicitly allocated `capacity_main` as the sole dominant ordinary-session responsibility and maps it to main/capacity. Competing dominant responsibilities remain contradictory; goal/phase cannot synthesize capacity; non-capacity behavior is unchanged. The isolated Planner fingerprint moves from `44d959a156caa1c4d4494aaed0f30a48bf5ad3f5a6f1c6e5ffde4900217d3d13` to `b7faa908aa21262ad6875b846be0fac17139ec490458a26853b58dbe5dd5a8ab`.
