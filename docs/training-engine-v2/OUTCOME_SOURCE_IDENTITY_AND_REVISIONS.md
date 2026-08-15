# OUTCOME SOURCE IDENTITY AND REVISIONS

**Classification:** `OUTCOME_SOURCE_AND_ADAPTATION_PERSISTENCE_FOUNDATION_V1_READY_FOR_PRODUCTION_IMPLEMENTATION_AUTHORIZATION`

**Design status:** `OUTCOME_SOURCE_AND_ADAPTATION_PERSISTENCE_FOUNDATION_DESIGN_EVIDENCE_NOT_RUNTIME`; runtime `NOT_ACTIVATED`.

This is ontology, contract, and CAGT evidence only. It creates no live adapter, migration, persistence write, event consumer, queue, directive application, Product behavior, or program mutation.

A sourceRecordId names one semantic source lineage and is independent of clock, randomness, note text, decisions, actions, and active revision. Revisions are immutable and use states:

- `active`
- `corrected`
- `superseded`
- `withdrawn`
- `invalid`
- `unknown`

Corrections append content-addressed revisions and preserve based-on lineage.
