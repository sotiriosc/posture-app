# Controlled Owner Identity Gate Implementation

Contract: `CONTROLLED_OWNER_ACCOUNT_IDENTITY_POLICY@1.0.0` with result `CONTROLLED_OWNER_ELIGIBILITY_RESULT@1.0.0`.

The server parser accepts exactly one trimmed, lowercased, syntactically valid configured reference. It rejects lists, whitespace-separated values, domain matching, substring matching, and client-authored identity. The gate uses `readServerSession()` and `findUserByEmail()` passively, requires exact stored user ID and email consistency, returns stable `userId` only, and performs zero bootstrap or database writes.

The configured email is never returned, persisted, logged, fingerprinted, displayed, or included in evidence. Tests use only synthetic identities.

