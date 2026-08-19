# Session Need And Dependency Model

`ExerciseSelectionNeed` is canonical selection truth: role, movement roles, action/functions, muscles, muscle relationship, and body regions. It contains no goal, section, count, score, phase, equipment, assessment, pain, or prose. The legacy `CandidateNeed` is produced by one deterministic adapter for Candidate Intelligence compatibility.

`SessionNeed` owns stable ID, one section, required/preferred/optional priority, unique non-negative `priorityOrder` within its tier, explicit standalone admission, source/dependency evidence, reason code, inert explanation, and one `ExerciseSelectionNeed`. `SessionIntent.primaryGoal` is session goal authority; `CandidateRequest.goal` is candidate goal authority.

Required preparation dependencies are hard. Selected preparation emits partial-order edges to its targets. A missing required dependency proves infeasibility; a dependency cycle is contradictory intent. No generic warmup accumulation exists.

`structuralCapacity` is serialized Planner input: condensed, standard, expanded, or unknown. Raw minutes never derive it and never activate/deactivate a need.

## Complete Session Argument Invariant

Warm-up, activation, main work, accessory work, and cooldown are one coherent session argument, not independent lists. Every selected preparation assignment must satisfy an owned need whose dependency is active after final main selection. Required preparation survives condensation; stale or orphaned preparation is removed or fails; one exercise identity cannot occupy multiple roles or sections in the same event.
