# Product Training Goal Prescription Family Options

Status: `AUDIT_ONLY_NO_BEHAVIOR_CHANGE`

Classification: `PRODUCT_TRAINING_GOAL_AND_PRESCRIPTION_SPECIFICITY_V1_READY_FOR_OWNER_POLICY_SELECTION`

Selected policy: `NO`

Production/Product/shadow rollout changed: `NO/NO/NO`

## Options, no selection

| Option | Consequence |
| --- | --- |
| G0 current behavior | Keeps the observed non-hypertrophy strength fallback. |
| G1 explicit strength/hypertrophy | Rejects unsupported main goals rather than silently defaulting. |
| G2 add general fitness | Adds one family while preserving explicit posture/conditioning gaps. |
| G3 fully goal-specific core | Adds owner-defined families for every supported canonical outcome. |
| G4 purpose first | Resolves assignment purpose first and uses global outcome as a bounded modifier. |

G4 best reflects existing role/section/dose-mode ownership, while G1 is the smallest strict correction. That is design analysis, not a policy selection. The owner must decide how unsupported goals fail, how secondary goals interact, and whether general fitness, conditioning, and posture receive distinct families or purpose-first resolution.

Audit fingerprint: `0606f9cd19d73e8cf683080c3b71fad1af7eb19d0c873a2361e294cde3be27fb`.

Next dependency: `OWNER_SELECTION_OF_PRODUCT_GOAL_VOCABULARY_AND_GOAL_SPECIFIC_PRESCRIPTION_POLICY`.

<!-- PURPOSE_FIRST_PRESCRIPTION_RESOLVER_V1:START -->
## Purpose-First Prescription Resolver V1

Chunk B2 implements `PURPOSE_FIRST_GOAL_SPECIFIC_PRESCRIPTION_RESOLVER@1.0.0` and
`PRODUCTION_PRESCRIPTION_COMPILER_KERNEL@1.1.0` as explicit, fail-closed, non-activated APIs.
V1.0 remains frozen compatibility and Controlled Product Shadow remains pinned to it.

Evidence: [implementation readiness](./PURPOSE_FIRST_PRESCRIPTION_IMPLEMENTATION_READINESS.md) and
[canonical architecture ledger](./PRAXIS_PRODUCT_GOAL_ARCHITECTURE_LEDGER.md).

Next dependency: `SUPPORTED_GOAL_AND_LOCAL_PURPOSE_PRESCRIPTION_POLICY_V1_ADMISSION_AUTHORIZATION`.
<!-- PURPOSE_FIRST_PRESCRIPTION_RESOLVER_V1:END -->
