# Production Prescription Compiler Output

Generated deterministically from the production Prescription Compiler kernel.

Production statuses:

- `compiled`
- `blocked_by_training_readiness`
- `prescription_policy_required`
- `prescription_policy_unavailable`
- `prescription_policy_conflict`
- `unresolved_execution_requirement`
- `unsupported_dose_mode`
- `invalid_source_exposure_context`
- `contradictory_prescription_requirements`
- `current_equipment_realization_unavailable`
- `candidate_recomposition_required`
- `invalid_prior_realization_evidence`
- `invalid_revision_context`

Every session result, assignment result, and plan carries the explicit Compiler contract reference. Successful results also include a stable source event, stable Prescription lineage ID, immutable final revision, one or more ordered blocks, structured execution standards, explicit rest instructions, honest load trace, honest duration interval, compatibility projection, and structured decision trace.
