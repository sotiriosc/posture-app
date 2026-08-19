# Controlled Owner Generation Implementation

`generateControlledOwnerGetStrongerPreview()` revalidates eligibility, mode, enrollment, profile readiness,
and restricted Product references before invoking `runControlledOwnerProductionPipeline()`.

The pipeline executes Product goal mapping, Product Horizon, Week Intent, Week allocation, Session Intent,
Candidate Intelligence, Session Composer, Prescription compiler, final Sequencing, Gate 13, Phase snapshot,
application readiness, and owner projection. Each stage stores its real output, production-kernel name, and
deterministic fingerprint. There are no canned stages, Product Shadow calls, legacy generator calls, or
client-authored engine facts.

An explicit unknown duration uses a provisional planning budget only for the counterfactual preview. The
projection remains `unknown`, records the unresolved fact, and cannot be approved.
