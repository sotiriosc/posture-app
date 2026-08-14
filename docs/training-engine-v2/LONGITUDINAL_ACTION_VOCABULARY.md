# Longitudinal Action Vocabulary

**Classification:** `LONGITUDINAL_ADAPTATION_GATE_16_V1_READY_FOR_PRODUCTION_KERNEL_IMPLEMENTATION_AUTHORIZATION`

**Authority:** `LONGITUDINAL_ADAPTATION_DESIGN_EVIDENCE`

**Runtime:** `LONGITUDINAL_ADAPTATION_GATE_16_DESIGN_EVIDENCE_NOT_PRODUCT_RUNTIME`; activation `NOT_ACTIVATED`.

This is test/developer evidence. It does not implement, export, activate, or wire a production Longitudinal Adaptation kernel. It does not mutate a Prescription, exercise identity, Week, phase state, or product program.

Closed action vocabulary:

- `keep_current`
- `repeat_for_confirmation`
- `hold_current_prescription`
- `prescription_modification_review`
- `progress_prescription_axis`
- `regress_prescription_axis`
- `reopen_candidate_selection_for_replacement`
- `reopen_candidate_selection_for_bounded_rotation`
- `week_reallocation_review`
- `deload_review`
- `phase_review`
- `external_safety_review`
- `owner_review_required`
- `no_action_insufficient_evidence`

Priority is Safety, conflict review, replacement reopening, local modification, local regression/progression, bounded rotation reopening, owner reviews, hold/repeat/keep, then insufficient evidence. Each candidate declares eligibility, required/missing evidence, axis, conflicts, continuity cost, action owner, application owner, and provenance.
