# Competitive Benchmark Scorecard

This repository now includes a deterministic benchmark suite:

- Test file: `tests/unit/competitiveBenchmark.test.ts`
- Script: `npm run test:benchmark`

## What It Measures (0-100)

1. `design` (0-30)
- day structure completeness (`warmup`, `main`, `accessory`, `cooldown`)
- correct main-slot count by experience level
- no per-day duplicate exercises
- equipment eligibility
- actionable cues on main/accessory work

2. `safety` (0-25)
- split-pattern contract coverage by day title
- contraindication avoidance against declared pain areas
- chest-dominant push blocked on `Shoulders + Arms`
- reps-first prescription quality for main/accessory

3. `progression` (0-25)
- program evolves across phase 1 -> 2 -> 3
- demand trend is non-decreasing
- meaningful main-slot variation across phases
- weighted exposure does not regress in higher phases

4. `coaching` (0-20)
- next-time guidance behavior for pain/hard/failed
- under-target behavior
- overshoot behavior (`8 -> 30` reps yields `+20%` weight guidance)

## Pass Targets

- Per anchor scenario: `>= 84`
- Scenario average: `>= 88`

These thresholds are intentionally strict but stable for CI. They represent an internal best-in-class baseline and can be tightened as engine quality improves.
