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

Session Composer work begins only after the permanent Candidate Intelligence readiness gate in `ENGINE_V2_BLUEPRINT.md` is explicitly accepted. Green tests alone do not satisfy that gate.

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

## Non-Goals

No beam search, session composition, week composition, fallback chain, or repair loop is implemented at Candidate Intelligence scope.
