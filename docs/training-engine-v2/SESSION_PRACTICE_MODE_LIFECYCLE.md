# Session Practice Mode Lifecycle

Attempt states are `no_selection`, `selected_pre_execution`, `final_for_execution`,
`execution_started`, `completed`, `abandoned`, `superseded_pre_execution`, and `invalidated`.
Pre-execution changes create deterministic immutable realization revisions. Execution begins at the
first final timer, completed set, Performance observation, committed load/reps/RPE entry, or explicit
start command. Later changes fail with `SESSION_PRACTICE_MODE_LOCKED_AFTER_EXECUTION_START` and clear
no progress. Deliberate restart preserves the abandoned attempt and creates a new attempt identity.
