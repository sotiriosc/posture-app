# Program Quality V2 — Phase 7 Unified Gate

Verdict: **PASS**

- Template version: 19
- Total fuzz cases: 50000
- Elapsed: 6102874ms

## Matrices

- Coverage matrix (TWO_SCENARIOS incl. gym 5d pain baseline): PASS
- Phase matrix: FAIL
- Documented phase-matrix blockers: MATRIX_GYM_4D_BICEPS_TRICEPS_PUSH_COVERAGE, MATRIX_CARRY_EXPOSURE_INTELLIGENCE

## Baselines (former out-of-gate gym 5d pain)

- Coverage ok: true
- Evaluation passed: true
- Weekly failures: none
- Intelligence failures: none

## Mode fuzz

- gym: cases=10000 hardFailures=0 identityCollapse=0 illegalEquipment=0 deterministicRepeat=0 exceptions=0 → PASS
- dumbbells: cases=10000 hardFailures=0 identityCollapse=0 illegalEquipment=0 deterministicRepeat=0 exceptions=0 → PASS
- bands: cases=10000 hardFailures=0 identityCollapse=0 illegalEquipment=0 deterministicRepeat=0 exceptions=0 → PASS
- bodyweight: cases=10000 hardFailures=0 identityCollapse=0 illegalEquipment=0 deterministicRepeat=0 exceptions=0 → PASS
- mixedHome: cases=10000 hardFailures=0 identityCollapse=0 illegalEquipment=0 deterministicRepeat=0 exceptions=0 → PASS

## Block-aware quality gate (mandatory)

- Cases: 600
- Safe generation failures: 0
- Structural hits: 0
- Exceptions: 0
- Elapsed: 75415ms
- Verdict: PASS

Ordinary mode audits omit personal blocks; fuzz-integrity injects them on index%17===0. This gate is the mandatory block-aware PASS boundary inside audit:program-quality.

- gym: blockedCases=120 safeFails=0 structuralHits=0
- dumbbells: blockedCases=120 safeFails=0 structuralHits=0
- bands: blockedCases=120 safeFails=0 structuralHits=0
- bodyweight: blockedCases=120 safeFails=0 structuralHits=0
- mixedHome: blockedCases=120 safeFails=0 structuralHits=0

## Fallbacks

- gym: PASS (fallbackUsed=false)
- dumbbells: PASS (fallbackUsed=false)
- bands: PASS (fallbackUsed=false)
- bodyweight: PASS (fallbackUsed=false)
- mixedHome: PASS (fallbackUsed=false)

## Repeatability

- Signature diff: false
- Reason-count diff: false

## Coaching audit

- PASS

## Artifacts

- docs/dev-reports/program-quality-v2-phase7-unified-gate.md
- docs/dev-reports/program-quality-v2-phase7-unified-gate.json
- docs/dev-reports/program-quality-v2-phase7-fuzz-summary.md
- docs/dev-reports/program-quality-v2-phase7-repeatability.md
- docs/dev-reports/program-quality-v2-phase7-recovery-review.md
- docs/dev-reports/program-quality-v2-phase7-manual-review.md
- docs/dev-reports/program-quality-v2-phase7-ci-enforcement.md
- docs/dev-reports/program-quality-v2-phase7-baselines.md
