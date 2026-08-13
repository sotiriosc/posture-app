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
