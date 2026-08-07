# Program Quality V2 — Phase 7 Matrix Blockers

## Resolved (Phase 7 targets)

| Code | Status |
|------|--------|
| `BASELINE_GYM_5D_PAIN_GROWTH_CALVES_ACCESSORY` | **PASS** — coverage + intelligence green for pain advanced / growth / 5-day / gym |
| `BASELINE_GYM_5D_PAIN_GROWTH_UPPER_HINGE_INTELLIGENCE` | **PASS** — same persona |

`audit:coverage-matrix` (TWO_SCENARIOS) is green after baseline repair + Full Body harness ownership clarification.

## Documented remaining phase-matrix blockers (not Phase 7 out-of-gate exemptions)

These remain in the broad `audit:phase-matrix` print and are **not** suppressed inside mode contracts or the unified quality gate:

| Code | Where | Notes |
|------|-------|-------|
| `MATRIX_GYM_4D_BICEPS_TRICEPS_PUSH_COVERAGE` | Many gym 4-day profiles | Weekly minima short on biceps/triceps/push day counts |
| `MATRIX_CARRY_EXPOSURE_INTELLIGENCE` | Some activation / non-gym HF profiles | Intelligence rule: carry exposure missing for the week |

Mode-contract 10k fuzz suites and the unified production gate remain the Phase 7 hard enforcement surface. Broad phase-matrix cleanup is a follow-up (not a renamed exemption of the two resolved baselines).
