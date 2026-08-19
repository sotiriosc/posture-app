# Controlled Owner Privacy and Security

Persisted identity is userId only. Tests use synthetic fixtures. Email, raw free text, photos, passwords, tokens, and raw Product snapshots are excluded. Security requires server session verification, exact identity consistency, CSRF, same-origin, no GET mutation, rate limits, idempotency, append-only audit, no caching, and 404 for ineligible access.

Design-only. Owner delivery and Product activation counts remain `0`. Exact next dependency: `CONTROLLED_OWNER_ACCOUNT_GET_STRONGER_GOAL_DELIVERY_IMPLEMENTATION_V1_AUTHORIZATION`.
