# Prescription Revision Contract

`ExercisePrescriptionRevision` is the future history unit for Prescription edits.

Required fields:

- `prescriptionId`
- `prescriptionRevisionId`
- `sourceExposureEventId`
- `basedOnRevisionId`
- revision reason code
- explicit `createdAt`
- revision state
- final-for-execution boolean
- supersession reference
- policy version references
- changed field refs
- unresolved requirement refs
- provenance

Only one revision may be final for one execution attempt. A revision may change dose, load, effort, rest, range, support, side, timing, and unresolved requirement resolution. It must not silently rewrite completed history.

Design validation rejects duplicate revision IDs, missing explicit timestamps, superseded revisions without a target, and multiple final revisions.

Fingerprint: `d84d569028d110495dc38b9dc191cf5efb7ba72c99feb125ce150dcdf6f0e786`.
