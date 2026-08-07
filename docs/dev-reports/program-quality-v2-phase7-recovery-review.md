# Program Quality V2 — Phase 7 Recovery & Fallback

Recovery sequence: evaluate → ≤2 deterministic seed-offset regenerations → mode-template fallback seed → re-evaluate → structured failure.

Fallback family uses existing authorship via canonical mode seeds (`modeQualityFallback.ts`).

## Fallback validation

- gym: PASS; hardFailures=none
- dumbbells: PASS; hardFailures=none
- bands: PASS; hardFailures=none
- bodyweight: PASS; hardFailures=none
- mixedHome: PASS; hardFailures=none
