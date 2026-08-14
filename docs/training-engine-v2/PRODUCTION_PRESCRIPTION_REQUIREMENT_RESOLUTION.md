# Production Prescription Requirement Resolution

Generated deterministically from the production Prescription Compiler kernel.

`PrescriptionExecutionRequirement` records source owner/ref, target assignment, target dimension, requested action, side, review status, provenance, resolution state, and optional typed reviewed resolution.

Only accepted, resolved, Prescription-owned facts can change output. Missing facts remain unresolved, conflicting values return `contradictory_prescription_requirements`, and Week/Sequencing/Longitudinal requirements remain outside Prescription ownership.
