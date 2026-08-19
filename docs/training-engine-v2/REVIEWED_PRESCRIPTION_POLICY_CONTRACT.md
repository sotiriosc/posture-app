# Reviewed Prescription Policy Contract

`ReviewedPrescriptionPolicy` is future authority. It is not implemented as a production rule language in this tranche.

## Future Ownership

The policy may eventually own:

- sets and reps policy;
- effort policy;
- load policy;
- rest policy;
- tempo policy;
- duration policy;
- section/role adjustments;
- goal adjustments;
- phase applicability;
- pain/response modifications;
- progression policy;
- conflict resolution.

## Current Boundary

No numeric values are approved here. Exercise knowledge only records legal capability. Prescription later selects exact quantities from reviewed policy and live context.

Required failures:

- missing policy: `PRESCRIPTION_POLICY_REQUIRED`;
- conflicting equal-authority policy: `PRESCRIPTION_POLICY_CONFLICT`.

Fingerprint: `7af1893b603a8d9e02931d5cb2128cd73ec3012f048f93bda414d9d789fd91a9`.

## Typed Rule Extension

`ReviewedPrescriptionPolicy` now has a typed design union for dose-mode selection, block structure, counts, scalar targets, load, effort, execution modifiers, timing, context adjustments, and acclimation blocks. Missing policy returns `prescription_policy_required`; equal conflicts return `prescription_policy_conflict`.

Reviewed policy fingerprint: `6254638169a9b0d833b3514e7918711e345ecfb5c051dae70b328307b91494c1`.
