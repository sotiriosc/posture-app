# Training Engine V2 Optimizer Contracts

`ENGINE_V2_BLUEPRINT.md` is authoritative.

## Search Shape

The contracts prepare for bounded deterministic search without implementing it:

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

Candidate Intelligence has passed its design handoff gate. The authorized Session Composer work remains design/laboratory only; green tests do not authorize production wiring.

## Session Composer Search Review

The controlled laboratory exhaustively enumerates small precomputed legal pools, merges duplicate identities, prunes hard-invalid combinations, requires complete required-need coverage and applies an inspectable lexicographic vector. Candidate rank is local tie evidence only; candidate totals are never summed as session quality.

Strict lexicographic evaluation is the smallest explainable recommendation. Pareto/non-dominated analysis is useful for owner consequence review. A bounded weighted score is contrast-only because no session coefficients are approved. Production beam search remains plausible, but beam width, pruning policy and truncation trace require owner approval. There is no randomness, repair loop or fallback exercise.

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

No beam search, session composition, week composition, fallback chain, or repair loop is implemented at Candidate Intelligence scope.
