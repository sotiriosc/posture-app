# Controlled Owner V2 Application Design

Contract: `CONTROLLED_OWNER_V2_PROGRAM_APPLICATION@1.0.0`.

Application creates an immutable V2 envelope and owner-scoped active pointer. Legacy Program, ProgramProgress, history, and drafts are preserved. Stale previews and active-session conflicts fail closed. Legacy overwrite counts are 0.

Design-only. Owner delivery and Product activation counts remain `0`. Exact next dependency: `CONTROLLED_OWNER_ACCOUNT_GET_STRONGER_GOAL_DELIVERY_IMPLEMENTATION_V1_AUTHORIZATION`.
