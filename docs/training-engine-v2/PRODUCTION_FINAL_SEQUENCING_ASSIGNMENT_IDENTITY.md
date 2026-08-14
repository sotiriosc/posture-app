# Production Final Sequencing Assignment Identity

Generated deterministically from the inactive production Final Session Sequencing kernel.

Canonical ownership chain:

1. `SessionExerciseAssignment.routinePrescriptionHandoffId`
2. matching handoff assignment ID
3. matching compiler assignment result
4. `SourceExposureEvent.sessionAssignmentId`
5. matching execution attempt and Prescription ledger
6. exactly one final Prescription revision and zero/one plan according to status

Exercise ID is validated semantic truth, never the ownership key. Duplicate, missing, extra, cross-attempt, exercise, section, role, source, plan, or revision mappings reject before search.
