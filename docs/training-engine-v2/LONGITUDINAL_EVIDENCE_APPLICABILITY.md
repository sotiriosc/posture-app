# Longitudinal Evidence Applicability

**Classification:** `LONGITUDINAL_ADAPTATION_GATE_16_V1_READY_FOR_PRODUCTION_KERNEL_IMPLEMENTATION_AUTHORIZATION`

**Authority:** `LONGITUDINAL_ADAPTATION_DESIGN_EVIDENCE`

**Runtime:** `LONGITUDINAL_ADAPTATION_GATE_16_DESIGN_EVIDENCE_NOT_PRODUCT_RUNTIME`; activation `NOT_ACTIVATED`.

This is test/developer evidence. It does not implement, export, activate, or wire a production Longitudinal Adaptation kernel. It does not mutate a Prescription, exercise identity, Week, phase state, or product program.

1. `EXACT_REALIZATION_EVIDENCE`: exercise plus current Prescription/assignment, side, support, range, load, and dose-mode context match.
2. `RELATED_REALIZATION_EVIDENCE`: exercise identity matches while one or more structured realization dimensions differ.
3. `EXERCISE_IDENTITY_HISTORY`: broader historical context; visible but insufficient to claim an exact realization effect.

Declared and computed applicability must agree. Wrong side/support, unknown authority, target mismatch, and planned truth posing as completed evidence fail at 16.3. Broader evidence can inform review but cannot silently broaden a local action.

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
