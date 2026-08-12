# Session Composer Design Contract

The design review at commit `823d465` produced `TARGETED_DESIGN_DECISIONS_REQUIRED`. That classification is historical. The owner subsequently approved strict lexicographic evaluation, needs-first domain migration, and calibrated deterministic search.

Current production authority is `SESSION_COMPOSER_PRODUCTION_KERNEL_READY_FOR_SESSION_INTENT_PLANNER`. The public low-level API builds Candidate Intelligence results, validates their shared context, composes a non-prescribed skeleton, and emits Prescription, duration, and Sequencing handoffs. It is not wired to the application or `generateProgram`.

Binding ownership remains: Planner supplies active ordered needs and structural capacity; Candidate Intelligence supplies legal local evidence; Composer decides coexistence; Prescription owns dose and exact duration; Sequencing owns final within-section order; Week Composer owns allocation across sessions.

The historical 17 design fingerprints remain audit evidence. Current production authority is fingerprinted separately in `SESSION_COMPOSER_PRODUCTION_VALIDATION.md`.

## Frozen Upstream Fingerprints

- Ranking: `d218c647c71af0fc6ae86ad9032065d37aa3006239c6dfce959483f9ebecf7f7`
- Comprehensive behavior: `1e9abd5713469223636ead6edfdd3a7a5725027529e58a33b476ac9a0753bd1e`
- Catalog: `bfb21d7dc91504de5da8f4cd92850c8bb97ca5a0ce5f65624d2db4971d5e1a91`
- Knowledge compatibility: `e31f864adaa0707a22bfb92d172fc596476acc923fe023cedf3abfd3ece8ac73`
