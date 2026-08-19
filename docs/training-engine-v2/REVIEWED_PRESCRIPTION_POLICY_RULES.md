# Reviewed Prescription Policy Rules

`ReviewedPrescriptionPolicy` is versioned system knowledge. It is not exercise knowledge, athlete data, UI state, or a key/value bag.

Required policy fields:

- policy ID and version
- source type and references
- evidence basis
- reviewer and reviewed time
- applicability scope
- typed rules
- explicit overrides
- explicit conflicts
- unknowns

Rule union:

- `dose_mode_selection`
- `block_structure`
- `count_target`
- `scalar_target`
- `load_selection`
- `effort`
- `execution_modifier`
- `timing`
- `context_adjustment`
- `acclimation_block`

Applicability may scope by goal, context, experience, phase, role, section, family, exercise ID where necessary, dose mode, timing model, equipment, muscle relationship, pain/response requirement, continuity, and progression state.

Fingerprint: reviewed policy `6254638169a9b0d833b3514e7918711e345ecfb5c051dae70b328307b91494c1`; rule union `0fa933b79d14b0ae0ada7e063002b87f176332bff908d9b7dfce50e6eb8659d2`.

## Prescription Policy V1 Owner Admission

The reviewed owner candidate is `PRESCRIPTION_POLICY_V1_STABLE_ADAPTIVE_CORE@1.0.0`; its rules remain test/developer-only and unexported from the public package API.
