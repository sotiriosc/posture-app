# Program Quality V2 — Phase 7B Correction Validation

- Generated: 2026-08-06T19:55:42Z
- Branch: `cursor/cloud-agent-1785959822486-hte2i`
- Base / checkpoint SHA: `5c88a64e71245f137e12178f2d26a38faf5fc8f5` (`checkpoint/equipment-experience-phase4` **not** updated)
- PR: #82 (draft / unmerged; Phase 8 not started)
- Template version: **18**
- Code tip at closure audits: `96ff2763c8468e8ca825e0dd4980debc62e5fd40` (`96ff276` — close remaining phase2 gym hinge/unilateral role fails)

## Before → after root-cause closure

| Root cause | Before (prior release fuzz) | After (closure2) |
| --- | ---: | ---: |
| Gym blocked leakage (`QUALITY_BLOCKED_EXERCISE_PRESENT`) | 10 | **0** |
| Gym wrong-role (`GYM_REQUIRED_ROLE_WRONG_TRUTH`) | 15 | **0** |
| Dumbbell prep-as-main (`DUMBBELL_PREP_AS_MAIN`) | 97 | **0** |
| Mixed-home random mix (`MIXED_HOME_RANDOM_EQUIPMENT_MIX`) | 128 | **0** |
| Safe generation failures | 244 | **0** |

All five modes now final-quality **pass 10000 / fail 0 / safeGen 0** (50k overall).

## Commands and results

### 1. Fuzz-integrity release audit (closure2)

```bash
FUZZ_INTEGRITY_CASES_PER_MODE=10000 npm run audit:fuzz-integrity
```

| Field | Value |
| --- | --- |
| Log | `/tmp/phase7b-gates/fuzz-integrity-closure2.log` |
| Start | `2026-08-06T14:18:40-04:00` |
| End | `2026-08-06T15:53:51-04:00` |
| Exit | **0** |
| Verdict | **NEEDS_REVIEW** |
| Elapsed | 5710987 ms |
| Report generatedAt | `2026-08-06T19:53:51.311Z` |

Reports (kept, not restored): `program-quality-v2-fuzz-integrity.{md,json}`, `program-quality-v2-fuzz-integrity-samples.{md,json}`.

### 2. Program-quality gate (50k, closure2)

```bash
npm run audit:program-quality
```

| Field | Value |
| --- | --- |
| Log | `/tmp/phase7b-gates/program-quality-closure2.log` |
| Start | `2026-08-06T13:10:12-04:00` |
| End | `2026-08-06T14:45:13-04:00` |
| Exit | **0** |
| Verdict | **PASS** |
| Fuzz cases | 50000 |

Local audit rewrote historical Phase 2–7 report files; those were restored to `5c88a64e71245f137e12178f2d26a38faf5fc8f5` and are **not** committed. PASS is recorded only in this validation artifact.

## Historical artifact restore

```bash
git checkout 5c88a64 -- <phase2–7 historical reports>
```

Restored globs: equipment-program-audit-phase2*/3*/4*/5*/5b*, program-quality-v2-phase6-*, program-quality-v2-phase7-fuzz-summary.md, program-quality-v2-phase7-repeatability.md, program-quality-v2-phase7-unified-gate.*.

**Not** restored: fuzz-integrity* or phase7b-* presentation reports.

## Fuzz-integrity summary (release 10k/mode, closure2)

### Final quality totals (50k)

| Metric | Count |
| --- | --- |
| Final quality pass | 50000 |
| Final quality fail | 0 |
| Safe generation failures | 0 |
| Fallback passed | 0 |
| Fallback failed safely | 0 |
| Fallback evidence malformed | 0 |
| Exceptions | 0 |
| Unclassified | 0 |

### By mode

| Mode | Final pass | Final fail | Safe-gen fail | Fallback rate | Recovery rate | Fallback triage (pass/failSafe/malformed) | Hard failure codes |
| --- | ---: | ---: | ---: | --- | --- | --- | --- |
| gym | 10000 | 0 | 0 | 0.00% | 0.09% | 0/0/0 | — |
| dumbbells | 10000 | 0 | 0 | 0.00% | 0.00% | 0/0/0 | — |
| bands | 10000 | 0 | 0 | 0.00% | 0.00% | 0/0/0 | — |
| bodyweight | 10000 | 0 | 0 | 0.00% | 0.00% | 0/0/0 | — |
| mixedHome | 10000 | 0 | 0 | 0.00% | 0.00% | 0/0/0 | — |

### Mutations / metamorphic / determinism

- Mutations: **14/14** detected (false PASS 0) — acceptance **PASS**
- Metamorphic: **9/9** PASS
- Deterministic checks: **50000 / 50000** performed; mismatches **0**
- Exceptions: **0**

### Collapse categories (rootCausesByCategory)

| Category | Count |
| --- | --- |
| `expectedIrrelevantInput` | 12057 |
| `suspiciousIgnoredPainInput` | 1410 |
| `suspiciousIgnoredSupportAnchorInput` | 190 |
| `expectedStableTemplateIdentity` | 34 |
| `expectedCapabilityLimitation` | 10531 |

Analyzed representatives: suspicious **399** / expected **2101** (of 2500 analyzed; 24222 detected pairs).

### Release blocking / gate distinction

- `releaseBlockingFailures`: **[]** (0)
- `needsReviewWarnings`: `UNEXPLAINED_CROSS_INPUT_COLLAPSE` — 399 suspicious collapse pairs
- `gateDistinction`: releaseBlockingFailures=0; needsReviewWarnings=1; allFinalProgramsPass=true; allClassified=true
- Note: NEEDS_REVIEW warnings are not release failures when all finals pass and all cases are classified.

### Gym hinge repro

- Seed: `gym-fuzz-9e37e786`
- Verdict: **hinge_preserved**
- qualityPassed: True
- blockedExercisePresent: False
- hingeRemainsViaLegalAlternative: True
- finalOutcomeClass: `initialPass`
- Detail: unblockedHingeMains=db-rdl blockedHingeMains=machine-glute-drive wrongTruth=false outcome=initialPass

### Generator parity

fuzzIntegrityAudit uses the same canonical mode case generators and programQualitySignature as the ordinary program-quality gate (see packages/engine/src/__debug__/fuzzIntegrityAudit.ts header). Executable parity coverage also landed in commit 6d5247d (recovery blocks, generator parity, metamorphic).

## CI

Will wait/poll GitHub CI on the final pushed head after this docs commit. Status recorded below when available (or left pending with current checks if still running after ~30–40 min).

## PR metadata

PR #82 kept **draft** / **unmerged**. Description updated via REST API with final head SHA, audit results, template-version **18**, stop-before-Phase-8. Do not merge. Do not begin Phase 8. Do not update `checkpoint/equipment-experience-phase4`.

## Commit SHAs

- Base / checkpoint: `5c88a64e71245f137e12178f2d26a38faf5fc8f5`
- Closure code tip (audits): `96ff2763c8468e8ca825e0dd4980debc62e5fd40`
- Prior docs tip before this closure validation: `6e1fb7f46d0352d0b4a80516584b20219a87128c`
- This validation follow-up commit: 
`cd691f4d512140eb5e90094074ff2c05ee08b522`

## Stop

Keep PR #82 draft and unmerged. Do not update `checkpoint/equipment-experience-phase4`. Do not begin Phase 8.
