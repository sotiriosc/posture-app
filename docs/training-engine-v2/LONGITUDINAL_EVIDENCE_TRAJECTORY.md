# Longitudinal Evidence Trajectory

**Classification:** `LONGITUDINAL_ADAPTATION_GATE_16_V1_READY_FOR_PRODUCTION_KERNEL_IMPLEMENTATION_AUTHORIZATION`

**Authority:** `LONGITUDINAL_ADAPTATION_DESIGN_EVIDENCE`

**Runtime:** `LONGITUDINAL_ADAPTATION_GATE_16_DESIGN_EVIDENCE_NOT_PRODUCT_RUNTIME`; activation `NOT_ACTIVATED`.

This is test/developer evidence. It does not implement, export, activate, or wire a production Longitudinal Adaptation kernel. It does not mutate a Prescription, exercise identity, Week, phase state, or product program.

The trajectory orders included completed outcomes by explicit occurrence time and stable ID. It preserves completion, actual-dose fingerprint, execution quality, response, recovery, adherence, realization changes, re-exposure, plateau/failure records, conflicts, strongest applicability, current state, and source provenance.

No weighted adaptation score exists. State is a deterministic policy classification over typed evidence:

- `productive_continuity`
- `first_or_isolated_success`
- `repeated_success`
- `stable_appropriate_challenge`
- `stable_but_plateaued`
- `target_partially_met`
- `repeated_target_failure`
- `exact_realization_limited`
- `exact_realization_adverse`
- `adverse_across_related_realizations`
- `successful_reexposure`
- `recovery_concern`
- `adherence_constraint`
- `mixed_or_conflicting`
- `insufficient_evidence`
- `safety_blocked`
- `unknown`
