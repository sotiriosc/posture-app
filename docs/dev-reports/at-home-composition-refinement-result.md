# At-home composition refinement — result (§17)

Generated: 2026-08-06

Base checkpoint: `921bd35bf17eeaaf32c0decd2638a45671687354`  
Branch: `engine/at-home-composition-refinement`  
Template version decision: **18 → 19**

## Template version

Bump required because newly generated stored program order is part of the composition contract (constraint-aware sequencing).

- Existing active programs remain unchanged in storage.
- Apps treat mismatched `templateVersion` as incompatible and regenerate on the next user-driven program load.
- No silent batch rewrite of active programs.

## What changed

### Gate intelligence (minimal)

1. Removed hard goblet-squat exclusion when machine squats are viable → soft scoring preference (`+2.5` machines / `+1` goblet).
2. Reduced activation push `machine-chest-press` bonus from `+16` → `+4` (DB bench `+4` → `+2`) to end pseudo-gate magnitude.

Philosophy preserved: Beginner = lower complexity/stability — not machine-only and not forced free-weights.

### Sequencing policy

New layer `packages/engine/src/program/sequencingPolicy.ts` after truthful selection, before quality evaluation:

```text
selected exercises → day priorities → sequencing constraints
→ equivalent-priority groups → deterministic rotate → quality re-eval
```

Preserved:

- section order warmup → activation → main → accessory → cooldown
- primary main early
- prep never becomes main
- band/mixed-home anchor-transition budgets (rotation rejected if it worsens changes)
- determinism via seeded lane (`seed|cycle|week|phase|day`)
- no unseeded randomness
- stored previous programs not mutated

## Structural correctness

- Role truth, equipment legality, pain, blocks, coaching, quality contracts unchanged in intent.
- Quality evaluation still runs after ordering.
- Band `BAND_EXCESS_ANCHOR_CHANGES` protected by sequencing constraints.

## Exercise-selection diversity vs ordering diversity

| Dimension | Finding |
|---|---|
| Selection | At-home selection judged sound after gate audit; no broad selection rewrite |
| Ordering | Constraint-aware equivalent-priority rotation + consecutive-week avoidance when safe |
| Prescription | Still a separate signature; not counted as exercise diversity |
| Longitudinal | Mean ~11.4 unique main/accessory orders / 12 weeks; max consecutive identical = 1; 0 avoidable clusters |

See:

- `at-home-composition-refinement-baseline.md` / `.json`
- `at-home-longitudinal-repeat.md` / `.json`
- `at-home-repeat-blind-samples.md`
- `engine-gate-intelligence-audit.md` / `.json`

## Flagged baseline profiles

Profiles with ≥10 seeds → one identical main/accessory order are classified in the baseline JSON (`productive_stability` / `equipment_limited` / `only_one_truthful_structure` / `avoidable_sequence_lock` / `possible_selection_lock`). Do not chase collapse warnings (prior 399) as an objective.

## Collapse warnings

Prior fuzz-integrity retained 399 cross-input collapse warnings. Post-change release run reported **448** `UNEXPLAINED_CROSS_INPUT_COLLAPSE` pairs as NEEDS_REVIEW (not a release blocker). This work does not chase that number. Identical structure may remain valid under pain-dose, redundant equipment, shared architecture, or intentional stability.

## Validation (§16)

| Gate | Result |
|---|---|
| `test:critical` | PASS (326/326) |
| `audit:program-presentation` | PASS |
| `audit:exercise-coaching` | PASS (202/202) |
| `lint` | PASS (0 errors) |
| `build` consumer / gyms | PASS |
| `audit:program-quality` | PASS — 50,000 fuzz cases |
| `audit:fuzz-integrity` release 10k/mode | **50,000 final pass**, 0 fail, 0 safeGen, 0 exceptions, 0 unclassified, 0 deterministic mismatches, **14/14 mutations**, **9/9 metamorphic**; verdict NEEDS_REVIEW only for collapse warnings |

## Deferred items

- Catalog `contraindications` vs `painContraindications` dual-field inconsistency (documented STALE_OR_REDUNDANT; not unified this phase).
- Broader family/rung-aware `phaseMin` refinement beyond machine-primer exceptions.
- Gym sequencing remains out of scope (positional role-truth contracts).
- UI / plan-reveal / body-map work remains abandoned Phase 8 UI scope (not this branch).
