# Controlled Owner Preview Implementation

`CONTROLLED_OWNER_V2_PROGRAM_PREVIEW@1.0.0` is immutable and owner-scoped. It contains exact profile and
Product revisions, engine and policy versions, all production stage artifacts, an owner display projection,
unresolved facts, Safety state, readiness, and fingerprints.

It is always created as `counterfactual: true`, `applied: false`, and `stale: false`. Staleness is derived
from profile, Product, legacy Program, equipment, Safety, engine, policy, and delivery-mode changes. The
record excludes email, tokens, raw Product snapshots, free text, and photos. It has no arbitrary TTL.
