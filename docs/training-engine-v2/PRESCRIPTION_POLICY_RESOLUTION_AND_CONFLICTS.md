# Prescription Policy Resolution And Conflicts

Resolution is deterministic:

1. Exercise knowledge and hard eligibility apply before policy.
2. Missing applicable policy returns `prescription_policy_required`.
3. More specific rules override broad rules only through explicit override relationships.
4. Equally authoritative conflicts return `prescription_policy_conflict`.
5. Conflicting rules do not average.
6. Unknown does not become zero.
7. Missing does not become natural.
8. Phase prose does not multiply values.
9. Prose cannot resolve conflicts.

The design lab validates both explicit missing-policy and conflict paths:

- no-policy control status: `prescription_policy_required`
- high-complexity stress conflict status: `prescription_policy_conflict`

Fingerprint: `c12429156f09f8a320a08f5bcd95b4b0c44ca2a514d989b3ffe78ea74ac57d7c`.

## Numeric Tournament Resolution Status

The executable numeric tournament keeps the same resolution boundaries:

- no-policy controls return explicit policy-required states
- equally authoritative conflicts remain conflict states
- broad rules do not override exercise-specific constraints
- unknown duration does not become zero duration
- tempo-only rescue attempts are rejected as wrong-layer effects
- no downstream compiler repair loop is allowed

Owner recommendation fingerprint: `fa7e942aff30d6dda4d572c4b6793e384820ed93026ca98a933554a3d640fec5`.

Pareto frontier fingerprint: `2133cbd7cdf7ca632c4557cce9cf83aa66d2ac588535e8413ecee1ec98803fbe`.

Detailed owner-decision report: `PRESCRIPTION_NUMERIC_OWNER_RECOMMENDATION.md`.

## Prescription Policy V1 Owner Admission

V1 uses the 13-level specificity order. A lower rule cannot erase a higher rule, and equal-authority conflict returns `PRESCRIPTION_POLICY_CONFLICT` without weighted blending.

<!-- PURPOSE_FIRST_PRESCRIPTION_RESOLVER_V1:START -->
## Purpose-First Prescription Resolver V1

Chunk B2 implements `PURPOSE_FIRST_GOAL_SPECIFIC_PRESCRIPTION_RESOLVER@1.0.0` and
`PRODUCTION_PRESCRIPTION_COMPILER_KERNEL@1.1.0` as explicit, fail-closed, non-activated APIs.
V1.0 remains frozen compatibility and Controlled Product Shadow remains pinned to it.

Evidence: [implementation readiness](./PURPOSE_FIRST_PRESCRIPTION_IMPLEMENTATION_READINESS.md) and
[canonical architecture ledger](./PRAXIS_PRODUCT_GOAL_ARCHITECTURE_LEDGER.md).

Next dependency: `SUPPORTED_GOAL_AND_LOCAL_PURPOSE_PRESCRIPTION_POLICY_V1_ADMISSION_AUTHORIZATION`.
<!-- PURPOSE_FIRST_PRESCRIPTION_RESOLVER_V1:END -->
