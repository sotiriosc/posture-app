# Controlled Owner Get Stronger Delivery State Machine

Contract: `CONTROLLED_OWNER_GET_STRONGER_DELIVERY_STATE_MACHINE@1.0.0`.

States (23): `hidden`, `ineligible`, `eligible_not_enrolled`, `profile_requires_confirmation`, `profile_ready`, `generating`, `preview_blocked`, `preview_ready`, `approval_unavailable`, `approval_ready`, `approved`, `applying`, `applied_inactive`, `v2_active`, `active_session_conflict`, `rollback_ready`, `rolling_back`, `legacy_restored`, `suspended`, `revoked`, `stale`, `conflict`, `unavailable`. Every transition declares owner, preconditions, side effects, idempotency, failure and rollback. Automatic apply transitions: 0.

Design-only. Owner delivery and Product activation counts remain `0`. Exact next dependency: `CONTROLLED_OWNER_ACCOUNT_GET_STRONGER_GOAL_DELIVERY_IMPLEMENTATION_V1_AUTHORIZATION`.
