# Program Quality V2 — Phase 7 CI Structure

Blocking jobs (no `continue-on-error`):

- `quality-core` — severity registry, baselines, repeatability, focused unit tests
- `quality-gym` — `audit:gym-program`
- `quality-dumbbells` — `audit:dumbbell-program`
- `quality-bands` — `audit:band-program`
- `quality-bodyweight` — `audit:bodyweight-program`
- `quality-mixed-home` — `audit:mixed-home-program`
- `quality-coaching` — `audit:exercise-coaching`
- `quality-builds` — consumer + gyms builds

`npm run audit:program-quality` orchestrates the full gate and writes unified reports.

Local orchestrator verdict: **PASS**
