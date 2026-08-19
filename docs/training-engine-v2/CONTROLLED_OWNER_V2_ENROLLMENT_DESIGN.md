# Controlled Owner V2 Enrollment Design

Contract: `CONTROLLED_OWNER_V2_ENROLLMENT@1.0.0`.

States: `not_eligible`, `eligible_not_enrolled`, `enrollment_profile_incomplete`, `enrolled_preview_only`, `enrolled_apply_allowed`, `suspended`, `revoked`, `conflict`. Enrollment is explicit, persists stable userId, fixed strength goal, versions and consent, and stores no email or free text.

Design-only. Owner delivery and Product activation counts remain `0`. Exact next dependency: `CONTROLLED_OWNER_ACCOUNT_GET_STRONGER_GOAL_DELIVERY_IMPLEMENTATION_V1_AUTHORIZATION`.
