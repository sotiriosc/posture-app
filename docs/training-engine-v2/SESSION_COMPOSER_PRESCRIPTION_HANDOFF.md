# Session Composer Prescription Handoff

`SessionPrescriptionHandoff` carries exercise, phase, section, role, satisfied needs, continuity/progression refs, execution-blocking resolution IDs, potential structured stress, explicit requirement refs, typed known side/support/range/load/lever/duration/distance/step requirement buckets, ordering constraints, and one expected source exposure event. Empty buckets mean no such requirement is explicitly known; they are not inferred defaults.

It does not choose sets, reps, load, range, effort, rest, support, tempo, side, lever, duration, distance, or steps. Routine future Prescription is distinct from an execution-blocking requirement.

`evaluatePostPrescriptionDuration` consumes only explicit exercise, rest, setup/transition durations and available minutes. It returns `fits`, `over_budget`, or `unknown_or_incomplete`. Missing durations are never estimated and over-budget output never trims the skeleton.
