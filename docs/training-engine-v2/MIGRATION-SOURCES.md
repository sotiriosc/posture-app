# Training Engine V2 Migration Sources

`ENGINE_V2_BLUEPRINT.md` is authoritative.

The existing engine is a source of product knowledge, not a source architecture for V2.

## REUSE_AS_DATA

- Exercise identities that remain meaningful.
- Movement/muscle/equipment labels after normalization.
- Coaching cues that describe real execution.
- Same-exercise progression axes after review.
- Cross-exercise transition facts after review, without automatic selection effect.
- Known equipment setup facts.
- Reviewed mechanics knowledge normalized into explicit support, demand, scapular-feature, and resistance/path fields.

## REIMPLEMENT_FROM_PRINCIPLE

- Candidate scoring.
- Exercise selection.
- Session sequencing.
- Whole-week composition.
- Phase progression.
- Pain-aware prescription.
- Adaptation from history.

## KEEP_AS_TEST_ORACLE

- Golden personas and failure cases that expose prior incorrect behavior.
- Determinism expectations.
- Equipment truth cases.
- Known pain/substitution edge cases.
- Program invariants that remain domain-correct under V2.

## DO_NOT_PORT

- Template patching.
- Repair chains used as a main generator.
- Hidden giant penalties that behave like undocumented hard gates.
- UI/storage/auth/billing/account logic.
- Large legacy generator modules copied wholesale.
- Any behavior where beginner implies machine-only or advanced implies hardest-is-best.
- Runtime biomechanics inferred from exercise IDs, names, summaries, labels, equipment prose, or coaching cues.
- Legacy progression labels treated as automatic replacement decisions.

## NEEDS_REVIEW

- Final pain restrictions by region and stressor.
- Exercise equivalence classes.
- Phase advancement criteria.
- Appropriate weekly volume and exposure targets.
- Fatigue and recovery assumptions.
- Support reduction criteria.
- When to progress the same exercise's prescription versus choose a reviewed cross-exercise transition.

<!-- PRODUCTION_OUTCOME_SOURCE_PERSISTENCE_V1:START -->
## Production Outcome Source Persistence V1

- Status: `PRODUCTION_OUTCOME_SOURCE_ADAPTERS_AND_APPEND_ONLY_PERSISTENCE_IMPLEMENTED_NOT_ACTIVATED`.
- Gate 11: `PRODUCTION_KERNEL_AUTHORITY` under `CAGT_EFFECTIVE_AUTHORITY_REGISTRY@8.0.0`.
- Pure owner: `packages/training-engine-v2`; server owner: `packages/engine`.
- Schema: 24 physical tables, 22 append-only tables, 29 indexes.
- Evidence: 180 controlled, 360 holdout, 5000 replay stress, zero semantic golden mismatches.
- Activation remains zero; existing legacy stores and `generateProgram` are unchanged.
- Next dependency: `PRODUCTION_WEEK_PLANNER_AND_WEEK_ALLOCATION_COMPOSER_AUTHORIZATION`.
<!-- PRODUCTION_OUTCOME_SOURCE_PERSISTENCE_V1:END -->
