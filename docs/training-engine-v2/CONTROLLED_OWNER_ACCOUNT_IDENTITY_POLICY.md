# Controlled Owner Account Identity Policy

Contract: `CONTROLLED_OWNER_ACCOUNT_IDENTITY_POLICY@1.0.0`.

Configured identity is referenced only as `configured_owner_email_reference`. Normalization: `trim`, `lowercase`, `exactly_one_email`, `no_list`, `no_wildcard`, `no_domain_match`, `no_substring_match`. Passive calls: `readServerSession`, `findUserByEmail`. Prohibited calls: `ensureBootstrapUser`, `createUser`, `updateUserCredentials`, `updateUserPlan`. Persisted owner identity: `userId`. The signed token resolves by sub and current readServerSession projects stored id/email/plan; token email is not delivery authority. Mismatch behavior: `FAIL_CLOSED_REAUTHORIZATION_REQUIRED_NO_AUTOMATIC_MIGRATION`.

Design-only. Owner delivery and Product activation counts remain `0`. Exact next dependency: `CONTROLLED_OWNER_ACCOUNT_GET_STRONGER_GOAL_DELIVERY_IMPLEMENTATION_V1_AUTHORIZATION`.
