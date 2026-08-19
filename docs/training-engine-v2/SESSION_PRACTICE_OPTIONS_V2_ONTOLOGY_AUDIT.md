# Session Practice Options V2 Ontology Audit

Classification: `SESSION_PRACTICE_OPTIONS_V2_ONTOLOGY_READY`

Canonical authority is `PRAXIS_PRODUCT_GOAL_ARCHITECTURE_LEDGER.md`. The current Product remains
`CURRENT_PRODUCT_RUNTIME_AUTHORITY` through the byte-frozen historical V1 implementation. The new
namespace is a versioned, default-off bridge and is not Product delivery authority.

## Concept Classification

| Concept | Classification | Finding |
|---|---|---|
| `sessionPracticeOptions.ts` | `HISTORICAL_V1_FROZEN` | Exact source fingerprint is recorded by the V1 contract. |
| `SessionPracticeOption` and current SessionClient | `CURRENT_PRODUCT_RUNTIME_AUTHORITY` | Existing copy, DOM, selection, and reset behavior stay unchanged. |
| Day-of mode request | `USER_DAY_OF_REQUEST` | The athlete explicitly chooses one of three closed modes. |
| `NextSessionRecommendation` | `RECOMMENDATION_ONLY` | Legacy mapping may suggest but has no V2 selection authority. |
| SessionIntent, SessionSkeleton, Prescription, Sequence | `SOURCE_SESSION_PLAN` | Complete immutable source truth is mandatory. |
| Full | `FULL_PASS_THROUGH` | Assignment, Prescription, Sequence, duration, and source-event differences are zero. |
| Lighter omissions | `LIGHTER_STRUCTURAL_REALIZATION` | Optional then preferred non-anchor work may be omitted under protected-purpose checks. |
| Lighter dose | `LIGHTER_PRESCRIPTION_REVISION` | Only admitted existing lower bounds may be selected. |
| Recovery | `RECOVERY_SUPPORT_REALIZATION` | Only explicit non-developmental support ownership is admitted. |
| Missing Recovery ownership | `RECOVERY_POLICY_REQUIRED` | Empty coherent support sets fail closed. |
| Supporting-work graph | `DEPENDENCY_PRUNING_REQUIRED` | Orphan main-specific preparation is removed; shared and independent support remains. |
| Source events | `SOURCE_EVENT_LINEAGE_AVAILABLE` | Retained assignments keep their source-event identities. |
| Prescription | `PRESCRIPTION_LINEAGE_AVAILABLE` | Revisions are immutable and based on the original revision. |
| Final Sequence | `SEQUENCE_LINEAGE_AVAILABLE` | A transformed plan requires a rebuilt final sequence. |
| Week reservation | `WEEK_RESPONSIBILITY_AVAILABLE` | Required and unfulfilled responsibilities remain explicit. |
| Current completion | `COMPLETION_CREDIT_OVERREACH` | Historical any-mode ProgramProgress behavior is frozen, not reused by V2. |
| Current SessionDraft | `DRAFT_PERSISTENCE_GAP` | It does not preserve mode or realization lineage. |
| Current reset behavior | `MODE_LOCK_GAP` | V2 requires immutable post-start selection; V1 stays frozen. |
| Outcome Source | `OUTCOME_SOURCE_EXTENSION_REQUIRED` | Exact realization lineage and completion disposition must be linked. |
| Gate 13 | `WEEK_VALIDATOR_EXTENSION_REQUIRED` | Realized omissions and revised prescriptions require a typed receiver. |
| Longitudinal | `LONGITUDINAL_OBSERVATION_ONLY` | Completed evidence may be observed; selection cannot cause action. |
| Future Product mapping | `PRODUCT_ADAPTER_REQUIRED` | A default-off adapter is required for a later authorization. |
| Attempt storage | `PERSISTENCE_CONTRACT_REQUIRED` | Existing legacy records cannot preserve the V2 graph. |
| Structured telemetry | `OBSERVABILITY_REQUIRED` | No current route emits V2 events. |
| Stored schema | `VERSIONED_MIGRATION_REQUIRED` | Isolated append-only storage is required; existing rows remain untouched. |
| Owner delivery and activation | `OUT_OF_SCOPE` | G and H remain open. |

## Explicit Answers

1. Current selection occurs in `SessionClient` state and current SessionRecord completion flow.
2. Current filtering occurs client-side after choosing a mode through `selectSessionPracticeItems`.
3. No. Historical Lighter omits accessories without unique-value reasoning.
4. No. It subtracts one parsed set from each main item, never below one.
5. It retains routine items, but it does not reason over explicit Prescription rest ownership.
6. No. Historical Recovery uses section checks and keyword matching.
7. It parses item notes and rationale plus exercise intensity, patterns, muscles, tags, focus tags, and carry type.
8. Yes. V1 is frozen byte-for-byte and represented by an explicit compatibility contract.
9. Yes. V2 requires the complete final prescribed session and final Sequence.
10. Structural transformation occurs against final prescribed truth; final Sequencing runs again afterward.
11. Revised blocks remain ordered blocks in an immutable based-on Prescription revision.
12. Yes. A retained assignment and its source event remain stable through dose revision.
13. Yes. Omitted dispositions are explicit and create no Performance.
14. Yes, when all required needs and dependencies remain and realized evidence passes Gate 13.
15. It remains partial whenever a required responsibility is omitted or dose sufficiency is unresolved.
16. No. Recovery cannot satisfy the ordinary developmental reservation.
17. Yes. Explicit recovery support can be observed in a separate zero-developmental-credit lane.
18. Yes. A typed remaining-responsibility handoff requests review without applying reallocation.
19. Yes. A separate V2 draft contract preserves mode without changing legacy SessionDraft.
20. Yes. The attempt lifecycle rejects changes after the earliest execution-start signal.
21. Timer start, set completion, Performance, committed load/reps/RPE, or an explicit start command.
22. Yes. Recommendation has `SUGGESTION_ONLY` authority and `automaticSelection: false`.
23. No. Legacy recommendation is restricted compatibility context until explicitly adapted.
24. Yes. TrainingSafety blocks Full, Lighter, and Recovery.
25. `sessionPracticeOptions.ts`, SessionClient, current SessionRecord, SessionDraft, ProgramProgress, routes, and DOM.
26. Yes. The future adapter maps the same labels and collapsed three-choice model without redesign.
27. Yes. Pre-G3 proves a default-off bridge while current routes remain historical V1.
28. No existing single schema preserves the complete attempt/request/realization lineage.
29. Yes. An isolated append-only table is required for exact durable replay.
30. Final Sequencing, Gate 13/Week validation, Outcome Source, Longitudinal observation, and remaining-Week review consume typed outputs.

No owner decision was reconstructed. The minimal domain corrections are isolated under `sessionPractice`.
