# Controlled Owner Legacy Fallback

Before application, capture `legacyProgramId`, `programVersion`, `ProgramProgressReference`, `activeDraftConflict`, `capturedAt`. Rollback restores the pointer without deleting V2 Program, Performance, legacy Program, progress, history, or drafts.

Design-only. Owner delivery and Product activation counts remain `0`. Exact next dependency: `CONTROLLED_OWNER_ACCOUNT_GET_STRONGER_GOAL_DELIVERY_IMPLEMENTATION_V1_AUTHORIZATION`.
