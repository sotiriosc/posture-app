# Training Engine V2 Optimizer Contracts

`ENGINE_V2_BLUEPRINT.md` is authoritative.

## Search Shape

The production Session Composer implements bounded deterministic search at session scope:

1. Generate legal candidates per role/slot.
2. Keep rejected candidates with explicit reasons.
3. Build plausible session candidates.
4. Evaluate whole-session coherence.
5. Build plausible week candidates.
6. Evaluate whole-week coherence.

Future optimizers should be thin orchestrators over domain components. If a session or week optimizer starts embedding assessment interpretation, pain rules, scoring rules, or prescription rules directly, those rules should move to the responsible module.

Candidate ranking is not program generation. The optimizer may compose only from legal candidates and may use their inspectable contextual scores, but it must not treat ranking order as a completed session, infer dosage from feature target fit, or rewrite eligibility truth.

Future prescription and ledger layers must consume one explicit source exposure event with structured planned dose, completed performance, execution-quality evidence, pain response, and recovery evidence. Candidate ranking does not infer those values, and the structured prescription contract does not start Session Composer.

Future optimizers must keep stress potential distinct from realized exposure. A candidate may be inspectable and legal while carrying prescription-modifiable, variant-dependent, dose-created, or unknown stress potential. Search should defer those cases to prescription resolution instead of prematurely treating them as safe, absent, hard, preferred, or fully counted risk. When a prescription realizes exposure, `PrescriptionStressExposureTrace` provides the source event, side, load/range/support/lever/duration/distance/steps, provenance, receiver eligibility, and unresolved-state evidence.

Candidate Intelligence has passed its handoff gate. The exported Session Composer kernel is production policy authority at its low-level package boundary; product wiring and final program generation remain unauthorized.

## Session Composer Search Review

The exhaustive oracle enumerates tractable legal pools. Production search merges compatible duplicate identities, prunes hard-invalid combinations, requires complete required-need coverage and applies an inspectable lexicographic vector. Candidate rank is local tie evidence only; candidate totals are never summed as session quality.

Strict lexicographic evaluation is production authority. A bounded weighted score remains contrast-only. Exact search is used through the reviewed 350-state estimate; larger cases use budget 48 and retained frontier 4. Completeness and truncation are explicit. There is no randomness, repair loop, candidate top-K cap, or fallback exercise creation.

Exact sequence and post-prescription duration optimization remain separate. See `SESSION_COMPOSER_SEARCH_LAB.md` and `SESSION_COMPOSITION_EVALUATION_POLICY.md`.

## Session Evaluation

`SessionEvaluation` can represent:

- coverage;
- redundancy;
- fatigue;
- joint stress;
- section coherence;
- preparation dependencies;
- duration;
- equipment transitions;
- assessment priorities.

## Week Evaluation

`WeekEvaluation` can represent:

- weekly coverage;
- frequency;
- volume;
- recovery spacing;
- fatigue interference;
- joint-stress concentration;
- priority exposure;
- continuity;
- phase intent;
- stimulus summary.

## Future Weekly Development Ledger

Weekly Composer should eventually derive individualized minimum, target-range, and soft-ceiling bands for muscle exposure, with direct and meaningful secondary credit kept distinct. It should also track movement exposure, assessment-priority exposure, joint/stress exposure, recovery spacing, and capacity exposure such as grip, trunk, loaded gait, conditioning, and carries where appropriate.

Those targets should begin from experience-level priors and adjust for the athlete's enduring goal, phase, pain, assessment, priority muscles, available days and time, equipment, adherence, fatigue, and longitudinal response history. Candidate Intelligence does not implement this ledger, and phase fit for one exercise must not impersonate whole-week phase coherence.

A carry is not mandatory filler. Future carry allocation requires a real weekly need and must account for grip, hinge, trunk and unilateral fatigue, neighboring-session recovery, equipment, duration, and carry-specific prescription units.

Knowledge breadth must not become longer workouts or redundant accumulation. Prefer the smallest coherent effective exposure that satisfies the user goal, pain/readiness context, phase, equipment, and recovery constraints.

## Non-Goals

Session Intent Planner and Session Composer production kernels are implemented. Week composition, fallback chain, repair loop, final sequencing, and Prescription generation remain unimplemented. Candidate Intelligence remains unchanged. The Planner cannot allocate a week or select exercises, and Composer cannot infer missing needs or dose.

## Week Allocation Design Recommendation (2026-08-12)

The non-production lab recommends complete-plan lexicographic evaluation: hard safety/legality/minimum/spacing invariants first, then continuity and opaque session feasibility, priority-frequency vectors, stress concentration, equipment/capacity coherence, preferred targets, unique optional marginal value, duplication burden, and a canonical tie-break. Additive weighted totals and fixed/greedy split allocation are rejected.

Exhaustive enumeration is the small-case oracle. A future production implementation should use deterministic Pareto-frontier pruning with approved bounds and must report inconclusive or unproven optimality honestly. Allocation ledger entries always carry zero dose credit; the earlier future muscle-set language is superseded by the three-ledger boundary and remains deferred to reviewed Prescription policy.

## Policy Resolution Amendment (2026-08-12)

Policy specificity is resolved before optimization. Explicitly declared specific overrides may replace broad defaults; equally authoritative conflicts return `WEEKLY_POLICY_CONFLICT`, and missing frequency authority returns `WEEKLY_POLICY_REQUIRED`. Soft maxima remain lexicographic review evidence, not hard pruning. Product source precedence changes facts only, never objective priority.

## CAGT Admission Boundary

Optimization output cannot rescue an earlier causal failure. A future search or policy rule must pass every gate it can affect, preserve upstream invariants, expose inconclusive search honestly, and avoid diversity objectives. Framework/adaptive collision metrics remain observed distributions, not optimizer terms or additive scores.

## Week Policy V1 Optimization Boundary

Week Policy V1 preserves lexicographic hard-gate semantics: required causal ownership and dependency validity precede soft targets, recurrence observations, and collision metrics. Warm-up or activation cannot be inserted as filler, credited as weekly dose, or retained after its target changes. The 10,000-combination stress result selects no production search bound.

## Prescription Timing Optimization Boundary

Tempo, duration, and cadence are not optimizer rescue variables. Same-tempo convergence is legal when meaningful structured facts converge; tempo-only differences cannot rescue Week, Planner, Candidate, or Composer failures. Future optimization may compare reviewed timing policies only after a production Prescription Compiler exists and must preserve the no hidden time-under-tension, no weekly dose credit, and no prose-parsing boundaries.

## Full Prescription Policy Search Boundary

The Prescription policy lattice is a non-production design lab with 76 frozen candidates, 24 calibration scenarios, 39 locked holdout scenarios, 30 CAGT Prescription pairs, 10,000 deterministic combinations, and 1,000 complete pipelines. No optimizer selects a production Prescription winner in this task.

## Prescription Policy V1 Owner Admission

CAGT evidence and owner choice remain separate. The optimizer may compare causal outcomes but does not select, activate, blend, or silently repair the owner policy.

<!-- FINAL_SESSION_SEQUENCING_V1:START -->
## Final Session Sequencing V1 Design Admission

- Policy: `SESSION_SEQUENCING_POLICY_V1_CAUSAL_SEQUENTIAL@1.0.0`
- Classification: `SESSION_SEQUENCING_POLICY_V1_READY_FOR_PRODUCTION_KERNEL_IMPLEMENTATION_AUTHORIZATION`
- Authority: `DESIGN_EVIDENCE_PLUS_HANDOFF_AUTHORITY`
- Execution: `SEQUENTIAL_ASSIGNMENT_EXECUTION_ONLY`
- Production kernel/activation: `NOT_IMPLEMENTED/NOT_ACTIVATED`
- Combined design fingerprint: `71fcb88e231e2953d508e0a1d6389fed98ca0f6af5a67592cdb56bb3ce563f42`

The future production receiver must preserve assignment, section, role, source event, Prescription lineage/final revision, block order, and intra-exercise rest exactly. It may add only a final linear assignment order, typed consecutive transitions, and a truthful final duration interval. Pairing remains deferred.

<!-- FINAL_SESSION_SEQUENCING_V1:END -->

<!-- PRODUCTION_FINAL_SEQUENCING_STATUS_START -->
## Production Final Session Sequencing Status

- Kernel: `PRODUCTION_FINAL_SESSION_SEQUENCING_KERNEL@1.0.0`
- Status: `PRODUCTION_FINAL_SESSION_SEQUENCING_KERNEL_IMPLEMENTED_NOT_ACTIVATED`
- Classification: `PRODUCTION_FINAL_SESSION_SEQUENCING_KERNEL_READY_FOR_POST_PRESCRIPTION_WEEK_VALIDATION_AUTHORIZATION`
- Policy: `SESSION_SEQUENCING_POLICY_V1_CAUSAL_SEQUENTIAL@1.0.0`, explicit injection only
- Search: exact-only with explicit caller resource policy and no fallback
- Identity: assignment/handoff ID, source event, execution attempt, and final Prescription revision
- Gate 10: `PRODUCTION_KERNEL_AUTHORITY`
- Activation: `NOT_ACTIVATED`; no app, Product Adapter, UI, or generateProgram wiring
- Next dependency: `POST_PRESCRIPTION_WEEK_VALIDATION_AUTHORIZATION`

Public V2 exports include the pure kernel, production contracts, Policy V1 object, explicit search policy contracts, transition/duration/revision contracts, and validators. Importing the package does not execute Sequencing.
<!-- PRODUCTION_FINAL_SEQUENCING_STATUS_END -->

<!-- POST_PRESCRIPTION_WEEK_VALIDATION_V1:START -->
## Post-Prescription Week Validation V1

Design admission: `POST_PRESCRIPTION_WEEK_VALIDATION_V1_READY_FOR_PRODUCTION_KERNEL_IMPLEMENTATION_AUTHORIZATION`. Gate 13 authority is `POST_PRESCRIPTION_WEEK_VALIDATION_DESIGN_EVIDENCE`; Gates 14-15 remain `NOT_IMPLEMENTED` and Gate 16 remains `FOUNDATION_ONLY`. The three-ledger invariant, source-event uniqueness, final Prescription/Sequence revisions, objective provenance, contribution truth, dose-lane separation, planned stress/duration/spacing, and no-downstream-rescue behavior are admitted as design evidence only. No production validator, Week activation, app wiring, Performance ingestion, or Longitudinal behavior exists. Combined design fingerprint: `6beea85cca5cfb73343c1ae7b6705ba6a9be4a6b82c737d09945357f6563fb82`.
<!-- POST_PRESCRIPTION_WEEK_VALIDATION_V1:END -->

<!-- PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_KERNEL:START -->
## Production Post-Prescription Week Validator Kernel

Classification: `PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_KERNEL_READY_FOR_FULL_PRESCRIBED_PROGRAM_CAGT_AUTHORIZATION`. Status: `PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_KERNEL_IMPLEMENTED_NOT_ACTIVATED`. The public pure kernel consumes `PRODUCTION_PRESCRIBED_WEEK_SOURCE_CONTRACT@1.0.0` with explicit policy injection and owns production Gate 13 authority. Golden evidence is `128/128` common-semantic matches with `0` unexplained differences and `860/860/860` expected/observed/unique events. Gate 14 and Gate 15 remain `NOT_IMPLEMENTED`; Gate 16 remains `FOUNDATION_ONLY / NOT_IMPLEMENTED`. There is no app, generateProgram, Product Horizon, Performance, Longitudinal, UI, implicit policy, or runtime design-adapter wiring. Combined production fingerprint: `c4d87d526f87dddbb9ded6b642c5b8b51dedec7d8aa6e052751bc27149f85951`.
<!-- PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_KERNEL:END -->

<!-- FULL_PRESCRIBED_PROGRAM_CAGT_GATE_14:START -->
## Full Prescribed Program CAGT Gate 14

Classification: `FULL_PRESCRIBED_PROGRAM_CAGT_V1_READY_FOR_PHASE_CONTINUITY_AUTHORIZATION`. Authority Registry: `CAGT_EFFECTIVE_AUTHORITY_REGISTRY@2.0.0`. Gate 14 is `MIXED_PRODUCTION_AND_DESIGN_PROGRAM_COMPARISON_EVIDENCE` test/developer tooling and is not a product-runtime kernel. The frozen holdout contains `248` pairs with `0` expectation mismatches, `0` accepted rescues, and combined fingerprint `ca12131efdc1fc1a8253bbfa8586be705b6e8bf68384366566eda13dcab8bee6`. Historical CAGT V1 and all production fingerprints remain unchanged. Gate 15 is `NOT_IMPLEMENTED`; Gate 16 is `FOUNDATION_ONLY_NOT_IMPLEMENTED`.
<!-- FULL_PRESCRIBED_PROGRAM_CAGT_GATE_14:END -->

<!-- PHASE_CONTINUITY_GATE_15_V1:START -->
## Phase Continuity Gate 15 V1

Classification: `PHASE_CONTINUITY_GATE_15_V1_READY_FOR_PRODUCTION_KERNEL_IMPLEMENTATION_AUTHORIZATION`. Ontology: `PHASE_CONTINUITY_ONTOLOGY_READY`. Authority Registry: `CAGT_EFFECTIVE_AUTHORITY_REGISTRY@3.0.0`; Gate 15 is `PHASE_CONTINUITY_DESIGN_EVIDENCE` and remains test/developer tooling, not product runtime. The frozen holdout has `295` cases, `0` mismatches, and `0` accepted rescues. No automatic phase advancement/regression/reset, progression, replacement, rotation or deload exists. Gate 16 remains `FOUNDATION_ONLY_NOT_IMPLEMENTED`. Combined fingerprint: `9b5602fbbfe5f9f32537bff8c07b434e8cb7528f62513a97d6c823d0cba3f3fc`.
<!-- PHASE_CONTINUITY_GATE_15_V1:END -->

<!-- PRODUCTION_PHASE_CONTINUITY_KERNEL_V1:START -->
## Production Phase Continuity Kernel V1

- Status: `PRODUCTION_PHASE_CONTINUITY_KERNEL_IMPLEMENTED_NOT_ACTIVATED`
- Classification: `PRODUCTION_PHASE_CONTINUITY_KERNEL_READY_FOR_LONGITUDINAL_ADAPTATION_GATE_16_AUTHORIZATION`
- Activation: `NOT_ACTIVATED`
- Contract: `PRODUCTION_PHASE_CONTINUITY_KERNEL@1.0.0`
- Policy injection is explicit; no default policy or evidence source is selected.
- Decisions remain unapplied: `stateMutationApplied=false`, `applicationOwnerRequired=true`.
- Gate 15 authority is production kernel; Gate 16 remains foundation-only and not implemented.
- Golden equivalence: `PRODUCTION_PHASE_CONTINUITY_GOLDEN_EQUIVALENCE_PASS` with 0 unexplained differences.
- Deterministic stress: `PRODUCTION_PHASE_CONTINUITY_DETERMINISTIC_STRESS_PASS` across 10000 evaluations.
- Combined fingerprint: `39236671808d605a53258351b58b081a64231b8c4fd6dee4125501e68e9bd232`
<!-- PRODUCTION_PHASE_CONTINUITY_KERNEL_V1:END -->
