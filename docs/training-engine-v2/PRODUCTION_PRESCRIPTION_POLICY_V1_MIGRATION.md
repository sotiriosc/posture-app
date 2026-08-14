# Production Prescription Policy V1 Migration

Generated deterministically from the production Prescription Compiler kernel.

Canonical source: `packages/training-engine-v2/src/prescription/policies/prescriptionPolicyV1.ts`.

- Policy: `PRESCRIPTION_POLICY_V1_STABLE_ADAPTIVE_CORE@1.0.0`
- Reviewer: `sotiriosc`
- Reviewed at: `2026-08-13T15:02:00-04:00`
- Migration equivalence: `BYTE_EQUIVALENT`
- Production test-helper imports: `0`
- Activation: `NOT_ACTIVATED`

Historical CAGT reports remain frozen. Admission tooling now imports the production matrix, rest projection, identity, reviewer, and specificity display projection rather than owning a second live value source.
