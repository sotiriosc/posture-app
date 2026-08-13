# Session Composer Prescription Handoff

`SessionPrescriptionHandoff` carries exercise, phase, section, role, satisfied needs, continuity/progression refs, execution-blocking resolution IDs, potential structured stress, explicit requirement refs, typed known side/support/range/load/lever/duration/distance/step requirement buckets, ordering constraints, and one expected source exposure event. Empty buckets mean no such requirement is explicitly known; they are not inferred defaults.

It does not choose sets, reps, load, range, effort, rest, support, tempo, side, lever, duration, distance, or steps. Routine future Prescription is distinct from an execution-blocking requirement.

`evaluatePostPrescriptionDuration` consumes only explicit exercise, rest, setup/transition durations and available minutes. It returns `fits`, `over_budget`, or `unknown_or_incomplete`. Missing durations are never estimated and over-budget output never trims the skeleton.

## Timing Foundation Extension

Each assignment now includes `timingKnowledge` with `HANDOFF_ONLY` authority: selected exercise dose-mode knowledge, legal dose modes, tempo capability, duration capability, breathing-cadence capability, locomotor/march/step-cadence capability, unresolved timing requirement IDs, `PRESCRIPTION_POLICY_REQUIRED`, and provenance refs. Duration feasibility now also exposes `durationDeterminability`, `unknownTempoContribution`, `explicitRestSetupDependency`, and `noInventedSessionTime: true`.
