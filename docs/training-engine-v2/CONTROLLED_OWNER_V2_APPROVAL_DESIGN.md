# Controlled Owner V2 Approval Design

Contract: `CONTROLLED_OWNER_V2_PROGRAM_APPROVAL@1.0.0`.

Approval is separate from application and binds one exact current preview fingerprint and version set. It requires apply mode, explicit consent, CSRF-safe same-origin mutation, idempotency, and no active-session conflict. Before apply mode enablement, health gates require `all_CI_green`, `exact_owner_eligibility`, `profile_complete`, `preview_valid`, `sessions_executable_or_explicitly_unavailable_and_accepted`, `no_Safety_blocker`, `no_required_policy_gap`, `persistence_available`, `replay_verified`, `rollback_verified`, `legacy_fallback_verified`, `observability_verified`, `current_routes_invariant`.

Design-only. Owner delivery and Product activation counts remain `0`. Exact next dependency: `CONTROLLED_OWNER_ACCOUNT_GET_STRONGER_GOAL_DELIVERY_IMPLEMENTATION_V1_AUTHORIZATION`.
