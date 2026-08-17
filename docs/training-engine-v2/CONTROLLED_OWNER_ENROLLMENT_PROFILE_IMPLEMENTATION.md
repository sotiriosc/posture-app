# Controlled Owner Enrollment and Profile Implementation

Contracts: `CONTROLLED_OWNER_V2_ENROLLMENT@1.0.0`, `CONTROLLED_OWNER_GET_STRONGER_PROFILE@1.0.0`, and `CONTROLLED_OWNER_PROFILE_REVISION@1.0.0`.

Enrollment and profiles are immutable, stable-user-ID-scoped revisions with deterministic identities, exact revision reads, explicit lineage, exact retries, and fail-closed conflicts. Enrollment is never created by route access. Goal is fixed to `strength`, training mode to `develop`, and secondary goal to `null`.

Profile readiness requires explicit days/opportunities, exact equipment capabilities, confirmed pain/limitation context, safe training state, explicit review, and the designed 11-input floor. Explicit unknown minutes may preview but block approval. Records contain no email, free text, exercise selection, numeric Prescription, token, password, or raw Product snapshot.

Migration `001_owner_v2_enrollment_profile` creates only isolated owner revision tables and inserts no rows.

