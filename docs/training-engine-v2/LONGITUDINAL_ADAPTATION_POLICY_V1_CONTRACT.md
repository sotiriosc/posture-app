# Longitudinal Adaptation Policy V1 Contract

**Classification:** `LONGITUDINAL_ADAPTATION_GATE_16_V1_READY_FOR_PRODUCTION_KERNEL_IMPLEMENTATION_AUTHORIZATION`

**Authority:** `LONGITUDINAL_ADAPTATION_DESIGN_EVIDENCE`

**Runtime:** `LONGITUDINAL_ADAPTATION_GATE_16_DESIGN_EVIDENCE_NOT_PRODUCT_RUNTIME`; activation `NOT_ACTIVATED`.

This is test/developer evidence. It does not implement, export, activate, or wire a production Longitudinal Adaptation kernel. It does not mutate a Prescription, exercise identity, Week, phase state, or product program.

Policy: `LONGITUDINAL_ADAPTATION_POLICY_V1_STABLE_RESPONSE_LED@1.0.0`.

Owner state: `OWNER_SELECTED_FOR_GATE_16_CAGT_ADMISSION_NOT_PRODUCTION`.

## Philosophy

- `CONTINUITY_BY_DEFAULT`
- `COMPLETED_EVIDENCE_BEFORE_CHANGE`
- `EXACT_REALIZATION_EVIDENCE_FIRST`
- `REPEATED_EVIDENCE_BEFORE_MATERIAL_CHANGE`
- `LOCAL_SCOPE_BEFORE_GLOBAL_CHANGE`
- `MINIMUM_CAUSALLY_SUFFICIENT_CHANGE`
- `PRESCRIPTION_REVIEW_BEFORE_REPLACEMENT`
- `SUCCESSFUL_REEXPOSURE_PRESERVES_OPTIONS`
- `ONE_PRIMARY_ACTION_PER_TARGET`
- `NO_CALENDAR_PROGRESSION`
- `NO_PHASE_ONLY_PROGRESSION`
- `NO_NOVELTY_QUOTA`
- `NO_AUTOMATIC_ROTATION`
- `NO_AUTOMATIC_DELOAD`
- `NO_GOAL_REWRITE`
- `UNKNOWN_MEANS_HOLD`
- `CONFLICT_MEANS_REVIEW`
- `DECISION_SEPARATE_FROM_APPLICATION`

The policy uses ordered typed conditions, not a weighted score. Unknown or mixed evidence holds continuity. Material changes require repeated distinct completed exposures. Local modification precedes replacement review, and successful re-exposure preserves the current option set.

<!-- PRODUCTION_LONGITUDINAL_ADAPTATION_KERNEL_V1:START -->
## Production Longitudinal Adaptation Kernel V1

- Status: `PRODUCTION_LONGITUDINAL_ADAPTATION_KERNEL_IMPLEMENTED_NOT_ACTIVATED`
- Classification: `PRODUCTION_LONGITUDINAL_ADAPTATION_KERNEL_READY_FOR_OUTCOME_SOURCE_AND_APPLICATION_INTEGRATION_AUTHORIZATION`
- Activation: `NOT_ACTIVATED`
- Contract: `PRODUCTION_LONGITUDINAL_ADAPTATION_KERNEL@1.0.0`
- Policy and caller-supplied outcome sources are explicit; no live adapter or default is selected.
- Decisions remain unapplied; program, Prescription, replacement, rotation, deload, Week, and Phase mutation flags are false.
- Registry V6 records Gate 16 production-kernel authority; production code imports no CAGT registry.
- Golden equivalence: `PRODUCTION_LONGITUDINAL_ADAPTATION_GOLDEN_EQUIVALENCE_PASS` across 130 controlled, 40 shell, and 360 holdout cases.
- Stress: `PRODUCTION_LONGITUDINAL_ADAPTATION_DETERMINISTIC_STRESS_PASS` across 10000 evaluations.
- Combined fingerprint: `8827a14a2e06dc0c6ddd8902852337946babdca501c81119324b420a69917581`
- Exact next dependency: `OWNER_AUTHORIZATION_FOR_PRODUCTION_OUTCOME_SOURCE_ADAPTERS_PERSISTENCE_AND_ADAPTATION_APPLICATION_ORCHESTRATION`.
<!-- PRODUCTION_LONGITUDINAL_ADAPTATION_KERNEL_V1:END -->
