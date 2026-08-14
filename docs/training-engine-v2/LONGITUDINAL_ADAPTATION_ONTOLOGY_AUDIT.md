# Longitudinal Adaptation Ontology Audit

**Classification:** `LONGITUDINAL_ADAPTATION_GATE_16_V1_READY_FOR_PRODUCTION_KERNEL_IMPLEMENTATION_AUTHORIZATION`

**Authority:** `LONGITUDINAL_ADAPTATION_DESIGN_EVIDENCE`

**Runtime:** `LONGITUDINAL_ADAPTATION_GATE_16_DESIGN_EVIDENCE_NOT_PRODUCT_RUNTIME`; activation `NOT_ACTIVATED`.

This is test/developer evidence. It does not implement, export, activate, or wire a production Longitudinal Adaptation kernel. It does not mutate a Prescription, exercise identity, Week, phase state, or product program.

**Ontology audit classification:** `LONGITUDINAL_ADAPTATION_ONTOLOGY_READY`

## Finding

The repository previously had typed planned program truth, independent Performance outcome fields, Training Response Receiver applicability, Progression Readiness without axis selection, and production Phase Continuity with unapplied decisions. It did not have a canonical completed-exposure outcome ledger, bounded evidence window, longitudinal target/thread/state identity, closed action vocabulary, or decision/application validation contract.

The admitted design closes those ontology gaps without claiming runtime source adapters. Planned dose and timing remain references only; actual dose and timing require independent observation. Recovery is explicit or unknown, never inferred.

## Concept audit

| Concept | Pre-design classification | Gate 16 treatment |
|---|---|---|
| `ExercisePerformanceRecord` | `CORRECT_SINGLE_PURPOSE_CONCEPT`, `COMPLETED_OUTCOME_OWNER` | Authoritative occurrence and actual-performance source; normalized, never re-owned |
| `CompletionStatus` | `CORRECT_SINGLE_PURPOSE_CONCEPT`, `COMPLETED_OUTCOME_OWNER` | Preserves completed, partial, not-performed, substituted, and unknown distinctions |
| `actualDose` | `COMPLETED_OUTCOME_OWNER`, `OBSERVATIONAL_ONLY` | Independent observation; planned dose is reference-only |
| `actualTiming` | `COMPLETED_OUTCOME_OWNER`, `OBSERVATIONAL_ONLY` | Independent observation; prescribed timing is never copied as actual |
| `ExecutionQualityObservation` | `CORRECT_SINGLE_PURPOSE_CONCEPT`, `OBSERVATIONAL_ONLY` | Evidence with criterion and source identity, not an action |
| `ExerciseSubstitutionRecord` | `CORRECT_SINGLE_PURPOSE_CONCEPT`, `COMPLETED_OUTCOME_OWNER` | Preserves original assignment/exercise and realized exercise |
| `recoveryStatus` / `recoveryEvidenceIds` | `COMPLETED_OUTCOME_OWNER`, `UNKNOWN_REQUIRES_REVIEW` | Explicit recovered/concern/unknown truth; never inferred from elapsed time |
| `TrainingResponseObservation` | `CORRECT_SINGLE_PURPOSE_CONCEPT`, `RESPONSE_OWNER` | Response Receiver-owned signal linked to one completed source event |
| `TrainingResponseHistory` | `RESPONSE_OWNER` | Contextual history retained below exact and related realization evidence |
| Training Response Receiver | `CORRECT_SINGLE_PURPOSE_CONCEPT`, `RESPONSE_OWNER` | Owns applicability, tolerance, symptom course, re-exposure, and replacement consideration |
| exact/related/identity applicability | `RESPONSE_OWNER` | Canonical strongest-first hierarchy; structured related differences are required |
| successful re-exposure | `RESPONSE_OWNER` | Remains visible, weakens permanent-failure pressure, and preserves options |
| adverse-history summary | `RESPONSE_OWNER` | Context only; cannot override stronger current realization evidence without policy |
| `ProgressionEvidence` | `CORRECT_SINGLE_PURPOSE_CONCEPT`, `PROGRESSION_READINESS_OWNER` | Evidence, never an applied dose change |
| `ProgressionReadinessTrace` | `PROGRESSION_READINESS_OWNER` | May open progression review; selects no axis |
| `ProgressionDecision` | `OVERLOADED_CONCEPT`, `DOMAIN_CHANGE_REQUIRED` | Gate 16 separates axis authorization from downstream exact-dose realization |
| `ExerciseProgressionProfile` / `ProgressionAxis` | `CORRECT_SINGLE_PURPOSE_CONCEPT` | Defines legal axis candidates; no automatic choice |
| exercise transition relationships | `CORRECT_SINGLE_PURPOSE_CONCEPT` | Candidate/Composer knowledge after an explicit reopen directive |
| phase progression intent | `PLANNED_ONLY` | Contextual late input, never action authority |
| Production Phase Continuity result | `CORRECT_SINGLE_PURPOSE_CONCEPT` | Gate 15-owned current phase decision consumed without mutation |
| `ProgramHistory` / `ExerciseHistoryEvent` / `SessionHistory` | `LEGACY_COMPATIBILITY_ONLY` | May be adapted only through typed source records; prose/history alone has no authority |
| `FatigueState` | `OBSERVATIONAL_ONLY`, `UNKNOWN_REQUIRES_REVIEW` | Requires an explicit recovery, adherence, Performance, or reviewed aggregate owner |
| production source-exposure identity | `CORRECT_SINGLE_PURPOSE_CONCEPT` | Canonical join key; exactly one outcome entry per realized event |
| final Prescription revision | `CORRECT_SINGLE_PURPOSE_CONCEPT`, `PLANNED_ONLY` | Required lineage check; remains planned truth, not actual outcome |
| final Sequence revision | `CORRECT_SINGLE_PURPOSE_CONCEPT`, `PLANNED_ONLY` | Required lineage check; actual order remains independently observed when available |
| Production Post-Prescription Week result | `CORRECT_SINGLE_PURPOSE_CONCEPT`, `PLANNED_ONLY` | Gate 13 validates planned program truth and cannot prove completion |
| planned stress/burden traces | `PLANNED_ONLY` | References only; completed stress requires realized source evidence |
| live Performance/Product ingestion | `MISSING_COMPLETED_EXPOSURE_LEDGER`, `OUT_OF_SCOPE` | Explicit test/design adapters only; production adapters remain absent |
| Gate 11 | `CORRECT_SINGLE_PURPOSE_CONCEPT` | Foundation authority for Performance linkage, not live Gate 16 ingestion |
| Gate 13 | `CORRECT_SINGLE_PURPOSE_CONCEPT` | Production planned-Week validation authority |
| Gate 14 | `TEST_FIXTURE_ONLY` | Mixed production/design comparison evidence; no runtime decision authority |
| Gate 15 | `CORRECT_SINGLE_PURPOSE_CONCEPT` | Production Phase Continuity decision owner; application remains separate |
| current application-history storage | `MISSING_APPLICATION_CONTRACT`, `OUT_OF_SCOPE` | Candidate validation is designed; production persistence/orchestration is absent |
| completed exposure ledger | `MISSING_COMPLETED_EXPOSURE_LEDGER` | Closed by `CompletedExposureOutcomeLedgerEntry` design, not runtime storage |
| evidence window | `MISSING_EVIDENCE_WINDOW` | Closed by explicit bounded window with evaluation time and exclusions |
| target scope | `MISSING_TARGET_SCOPE` | Closed by the typed target and no-silent-broadening rule |
| action vocabulary | `MISSING_ACTION_VOCABULARY` | Closed by the 14-action vocabulary and owner/application fields |
| decision identity/revision | `MISSING_DECISION_IDENTITY`, `MISSING_DECISION_REVISION` | Closed by deterministic lineage and immutable revision-ledger designs |
| rotation/deload policy | `MISSING_ROTATION_POLICY`, `MISSING_DELOAD_POLICY` | Closed for review authorization only; application policy remains downstream |

## Required boundary answers

1. **Yes.** Actual dose remains independent from planned dose and requires an observed source.
2. **Yes.** Actual timing remains independent from prescribed timing and requires an observed source.
3. **Yes.** One completed exposure links to exactly one production source event.
4. **Yes.** Several response observations reference one event without multiplying exposures.
5. **Yes.** Substitution lineage preserves both original and realized exercise truth.
6. **Yes.** Exact realization evidence remains above related realization evidence.
7. **Yes.** Identity history remains contextual and weaker than realization evidence.
8. **Yes.** Successful re-exposure blocks inappropriate permanent-failure pressure without erasing history.
9. **Yes.** Progression Readiness remains evidence and selects no action or axis.
10. **Yes.** Gate 16 may authorize one legal axis without selecting exact future dose.
11. **Yes.** A separately authorized Prescription Compiler policy may later realize that axis.
12. **Yes.** One failed target cannot authorize global regression.
13. **Yes.** One adverse realization is insufficient for replacement review.
14. **Yes.** Repeated adverse evidence remains scoped to structured support/load/range/side context.
15. **Yes.** Local evidence remains local; unrelated targets are invariant.
16. **Yes.** Week fatigue/adherence requires a separate reviewed aggregate over distinct events.
17. **Yes.** Deload review is possible from that aggregate without a universal schedule.
18. **Yes.** Bounded rotation remains distinct from adverse-response replacement.
19. **Yes.** Phase review remains a request to Gate 15, separate from phase-state application.
20. **Yes.** Gate 16 can consume caller-supplied normalized outcomes while live Product ingestion is absent.

## Canonical layers

1. Source owners emit typed records and remain authoritative for their domains.
2. The outcome snapshot normalizes explicit source records without inventing observations.
3. One completed-outcome ledger entry represents one source exposure event.
4. Applicability is classified exact, related, then exercise identity history.
5. A bounded evidence window produces an ordered trajectory for one target.
6. Gate 16 selects one closed-vocabulary action for that target.
7. A directive records the decision; a rightful downstream owner may later propose application.
8. Gate 16 validates persistence and scope but applies nothing.

## Prohibited conflations

- planned is not completed;
- several sets are not several exposures;
- elapsed calendar time is not progression evidence;
- a phase label is not an adaptation signal;
- pain-region evidence is not a global exercise ban;
- replacement consideration is not replacement identity selection;
- an authorized action is not an applied program mutation;
- missing evidence is not poor response.
