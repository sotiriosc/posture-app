# Prescription Performance Block Linkage

Current performance has one optional `actualDose`; the design lab adds `ExercisePerformanceBlockLinkage` for future production.

Block performance must record:

- planned block ID or explicit unplanned block
- performed block ID
- completion status
- actual dose or null
- actual timing or null
- block quality observations
- substitution reference when relevant
- omitted planned blocks
- additional unplanned blocks
- provenance

Actual dose and timing are never inferred from the plan. Substitution preserves the original plan and records the performed replacement without declaring the original exercise completed.

Fingerprint: `b0936c1d22120fc29df3780b95dee800b747f979bf0296ff73e0f8214649bfde`.
