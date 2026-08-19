# Session Composer Search Lab

This document records the pre-production laboratory and its production consequence. Greedy-per-need and weighted whole-session scoring remain rejected. The production kernel uses exact exhaustive search when tractable and deterministic bounded expansion otherwise.

Search expands every local candidate; it does not apply a per-need top-K cut. Duplicate compatible identities merge, hard-invalid branches prune, equivalent states deduplicate, and strict Pareto dominance applies only to future-equivalent identity/coverage states with no lost anchor, dependency, or future interaction. Incomparable partial states remain until the visible frontier bound.

Calibration over 16 named scenarios, 11 fixed-shell factors, raw-minute variants, multiple-anchor/readiness variants, full-candidate boundary cases, order permutations, and 10,000 deterministic generated cases selected:

- exact expanded-state threshold: `350`;
- bounded expanded-state budget: `48`;
- retained frontier per layer: `4`.

The full-candidate expanded boundary required 351 exhaustive expansions and a peak frontier of 192. Bounded search reproduced the same winner with 47 expansions/frontier 4, while correctly reporting `bounded_optimality_not_proven`.

Completeness is explicit: `exact_optimal`, `exact_infeasible_proven`, `bounded_optimality_not_proven`, or `search_inconclusive_no_complete_skeleton`. Limit exhaustion is never mislabeled SessionIntent infeasibility.
