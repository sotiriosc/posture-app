# Prescription Dose Block Contract

`PrescriptionDoseBlock` is the smallest truthful unit below one source exposure event.

Fields:

- stable `blockId`
- `sourceExposureEventId`
- block purpose
- one `ExerciseDose`
- policy rule refs
- unresolved requirement refs
- contribution classification
- intra-exercise order/dependencies
- provenance

Purpose vocabulary:

- `preparatory_acclimation`
- `developmental_work`
- `technique_quality_work`
- `recovery_or_downregulation`
- `unknown`

Preparatory acclimation includes ramp-up, load acclimation, and rehearsal sets of the same selected exercise. It is not automatically weekly developmental credit. Backoff working sets remain `developmental_work`.

Mixed dose modes inside one Prescription are not admitted without explicit reviewed mixed-mode policy.

Fingerprints: dose blocks `a7c595afddb0942eca0193782f2e7d810cd5a46db73592d026a1e9aa03d5a609`; purpose ontology `2045988f5bbbf243dc100c4da72b8ef9aa30256fd6eb1a77b1e49e52039abd61`.
