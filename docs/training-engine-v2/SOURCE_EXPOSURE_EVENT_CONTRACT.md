# Source Exposure Event Contract

Invariant: one `SessionExerciseAssignment` creates one planned source exposure event.

The event represents the selected exercise's planned presence in one session. It is not one event per role, muscle, need, set, or dose block. An assignment satisfying several needs still creates one event. Ramp-up sets of the selected main exercise remain inside the same event.

## Identity

`SourceExposureEventIdentity` exposes:

- `sourceExposureEventId`
- `sessionIntentId`
- `sessionAssignmentId`
- `exerciseId`
- `originalSelectedExerciseId`
- `currentPlannedExerciseId`
- `eventStatus`
- Prescription revision references
- substitution references
- cancellation or supersession state
- provenance

The event ID is stable across pre-execution Prescription revisions for the same session assignment. It must not derive from clock time, prose, set count, load, tempo, or Prescription ID alone.

Fingerprint: `1067e729ee57544047c16ef1796f206ce626d82a9dc7620eae76bcf6df91b27c`.
