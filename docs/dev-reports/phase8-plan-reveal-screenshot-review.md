# Phase 8 — Plan Reveal Screenshot Review

- Branch: `phase8/plan-reveal-experience`
- Capture script: `scripts/phase8-capture-plan-reveal-screenshots.ts`
- Output: `docs/dev-reports/phase8-screenshots/`
- Matrix index: `docs/dev-reports/phase8-screenshots/matrix.json`

## Honesty statement

Plan-reveal PNGs were captured from **engine-backed static HTML fixtures** that use the same `resolveProgramPresentation` → `buildPlanRevealModel` labels as production UI. This was required because client-side `generateWeeklyProgram` on `/dev/plan-reveal-preview` blocked hydration long enough that Playwright could not reliably screenshot the live React tree in this environment.

Live React receivers remain:

- `/results` when `dashboardLevel === 1` → `PlanRevealExperience`
- `/dev/plan-reveal-preview` (deferred generation after mount)
- Session start → `SessionStartSummary` inside `SessionProgressHeader`

Do **not** treat these fixtures as Phase 7B screenshot reuse — labels and hierarchy were regenerated on this branch.

## Plan reveal matrix (21)

| Mode | 360×740 | 390×844 | desktop |
| --- | --- | --- | --- |
| Gym | `plan-reveal-gym-360x740.png` | `plan-reveal-gym-390x844.png` | `plan-reveal-gym-desktop.png` |
| Dumbbells | `plan-reveal-dumbbells-360x740.png` | `plan-reveal-dumbbells-390x844.png` | `plan-reveal-dumbbells-desktop.png` |
| Anchored bands | `plan-reveal-bands-anchor-360x740.png` | `plan-reveal-bands-anchor-390x844.png` | `plan-reveal-bands-anchor-desktop.png` |
| No-anchor bands | `plan-reveal-bands-no-anchor-360x740.png` | `plan-reveal-bands-no-anchor-390x844.png` | `plan-reveal-bands-no-anchor-desktop.png` |
| Loop-only bands | `plan-reveal-bands-loop-360x740.png` | `plan-reveal-bands-loop-390x844.png` | `plan-reveal-bands-loop-desktop.png` |
| Bodyweight | `plan-reveal-bodyweight-360x740.png` | `plan-reveal-bodyweight-390x844.png` | `plan-reveal-bodyweight-desktop.png` |
| Mixed Home | `plan-reveal-mixed-home-360x740.png` | `plan-reveal-mixed-home-390x844.png` | `plan-reveal-mixed-home-desktop.png` |

## Session-start (4)

| Mode | File |
| --- | --- |
| Gym | `session-start-gym-390x844.png` |
| Bodyweight | `session-start-bodyweight-390x844.png` |
| No-anchor bands | `session-start-bands-no-anchor-390x844.png` |
| Mixed Home | `session-start-mixed-home-390x844.png` |

## Consumer/gyms parity (3)

Semantic labels are identical via shared engine helpers. Captures:

- `parity-consumer-gyms-gym-390x844.png`
- `parity-consumer-gyms-bodyweight-390x844.png`
- `parity-consumer-gyms-mixed-home-390x844.png`

**Gap:** separate live gyms browser captures were not taken (same engine labels; mirrored React components). Documented as fixture parity, not dual-app live pixels.

## Review checklist

| Criterion | Result |
| --- | --- |
| First-viewport clarity (phase / purpose / days / duration / equipment / CTA) | PASS |
| CTA hierarchy (Start Day 1 dominant) | PASS |
| Wrapping / overflow at 360 | PASS |
| Excessive card wall | PASS (pills/rails/typography) |
| Capability language present where relevant | PASS |
| Raw internal tokens | PASS (none observed) |
| Professional appearance | PASS for fixture fidelity; live React styling follows app tokens |

## Gaps

1. Live React `/results` first-reveal screenshots blocked by auth/program seed + heavy client generation on preview.
2. Dual-app live pixel diffs for gyms not captured.
3. Playwright e2e screenshot suite exists but depends on browser install + server readiness.
