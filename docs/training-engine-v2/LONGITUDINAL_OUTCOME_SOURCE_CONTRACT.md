# Longitudinal Outcome Source Contract

**Classification:** `LONGITUDINAL_ADAPTATION_GATE_16_V1_READY_FOR_PRODUCTION_KERNEL_IMPLEMENTATION_AUTHORIZATION`

**Authority:** `LONGITUDINAL_ADAPTATION_DESIGN_EVIDENCE`

**Runtime:** `LONGITUDINAL_ADAPTATION_GATE_16_DESIGN_EVIDENCE_NOT_PRODUCT_RUNTIME`; activation `NOT_ACTIVATED`.

This is test/developer evidence. It does not implement, export, activate, or wire a production Longitudinal Adaptation kernel. It does not mutate a Prescription, exercise identity, Week, phase state, or product program.

Contract: `LONGITUDINAL_OUTCOME_SOURCE_CONTRACT@1.0.0`.

## Supported owner vocabulary

- `exercise_performance_record`
- `completed_session_summary`
- `training_response_receiver`
- `recovery_summary`
- `adherence_summary`
- `progression_readiness`
- `training_safety`
- `phase_continuity`
- `coach_review`
- `clinician_restriction`
- `athlete_report`
- `planned_program_truth`
- `unknown`

## Signal vocabulary

- `productive_completion`
- `first_completed_exposure`
- `isolated_success`
- `repeated_success`
- `appropriate_challenge`
- `target_met`
- `target_partially_met`
- `target_failed`
- `repeated_target_failure`
- `quality_met`
- `quality_not_met`
- `tolerated_response`
- `limited_response`
- `adverse_response`
- `repeated_adverse_response`
- `successful_reexposure`
- `recovery_adequate`
- `recovery_concern`
- `recovery_unknown`
- `adherence_constraint`
- `progression_ready`
- `progression_not_ready`
- `plateau`
- `replacement_consideration`
- `prescription_review_attempted`
- `prescription_review_exhausted`
- `rotation_preference`
- `equivalent_candidate_pool`
- `week_reallocation_aggregate`
- `deload_review_aggregate`
- `phase_review_requested`
- `safety_block`
- `external_review_required`
- `mixed_evidence`
- `unknown_evidence`

Source records require stable IDs, authority, athlete/target lineage, explicit occurred-at time, optional source event/session, realization context, declared applicability, typed signals, reviewed aggregate members, and provenance. Live Performance and adherence adapter counts remain zero.
