# Program Quality V2 — Phase 7B Correction Validation

- Generated: 2026-08-06T12:30:37Z
- Branch: `cursor/cloud-agent-1785959822486-hte2i`
- Base / checkpoint SHA: `5c88a64e71245f137e12178f2d26a38faf5fc8f5` (`checkpoint/equipment-experience-phase4` **not** updated)
- PR: #82 (draft / unmerged; Phase 8 not started)
- Template version: **18**

## Commands and results

### 1. Fuzz-integrity release audit (already finished)

```bash
FUZZ_INTEGRITY_CASES_PER_MODE=10000 npm run audit:fuzz-integrity
```

| Field | Value |
| --- | --- |
| Log | `/tmp/phase7b-gates/fuzz-integrity-r2.log` |
| Start | `2026-08-06T05:34:38-04:00` |
| End | `2026-08-06T07:07:21-04:00` |
| Exit | **1** |
| Verdict | **NEEDS_REVIEW** |
| Elapsed | 5562443 ms |
| Report generatedAt | `2026-08-06T11:07:20.814Z` |

Reports (kept, not restored): `program-quality-v2-fuzz-integrity.{md,json}`, `program-quality-v2-fuzz-integrity-samples.{md,json}`.

### 2. Program-quality gate (50k)

```bash
npm run audit:program-quality
```

| Field | Value |
| --- | --- |
| Log | `/tmp/phase7b-gates/program-quality-r2.log` |
| Start | `2026-08-06T06:55:16-04:00` |
| End | `2026-08-06T08:28:50-04:00` |
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

## Fuzz-integrity summary (release 10k/mode)

### Final quality totals (50k)

| Metric | Count |
| --- | --- |
| Final quality pass | 49756 |
| Final quality fail | 244 |
| Safe generation failures | 244 |
| Fallback passed | 0 |
| Fallback failed safely | 244 |
| Fallback evidence malformed | 0 |
| Exceptions | 0 |
| Unclassified | 0 |

### By mode

| Mode | Final pass | Final fail | Safe-gen fail | Fallback rate | Recovery rate | Fallback triage (pass/failSafe/malformed) | Hard failure codes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| gym | 9981 | 19 | 19 | 0.19% | 0.19% | 0/19/0 | QUALITY_BLOCKED_EXERCISE_PRESENT:10, GYM_REQUIRED_ROLE_WRONG_TRUTH:15 |
| dumbbells | 9903 | 97 | 97 | 0.97% | 0.97% | 0/97/0 | DUMBBELL_PREP_AS_MAIN:97 |
| bands | 10000 | 0 | 0 | 0.00% | 0.00% | 0/0/0 | — |
| bodyweight | 10000 | 0 | 0 | 0.00% | 0.00% | 0/0/0 | — |
| mixedHome | 9872 | 128 | 128 | 1.28% | 1.28% | 0/128/0 | MIXED_HOME_RANDOM_EQUIPMENT_MIX:128 |

### Mutations / metamorphic / determinism

- Mutations: **14/14** detected (false PASS 0) — acceptance **PASS**
- Metamorphic: **9/9** PASS
- Deterministic checks: **50000 / 50000** performed; mismatches **0**
- Exceptions: **0**

### Collapse categories (rootCausesByCategory)

| Category | Count |
| --- | --- |
| `expectedIrrelevantInput` | 11028 |
| `suspiciousIgnoredPainInput` | 1955 |
| `suspiciousIgnoredActiveBlock` | 1 |
| `suspiciousIgnoredSupportAnchorInput` | 677 |
| `expectedStableTemplateIdentity` | 34 |
| `expectedCapabilityLimitation` | 10531 |

Analyzed representatives: suspicious **618** / expected **1882** (of 2500 analyzed; 24226 detected pairs).

### NEEDS_REVIEW warnings (not release blockers)

- `FALLBACK_RATE_ABOVE_1PCT`: mixedHome fallbackRate=1.28% (warning — not a release failure when all finals pass)
- `UNEXPLAINED_CROSS_INPUT_COLLAPSE`: 618 suspicious collapse pairs (see categories)

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

GitHub `gh` auth is invalid in this environment (`authentication failed` / GraphQL Forbidden). CI conclusion not available here — re-check with `gh pr checks 82` after re-auth. **PR #82 description could not be updated via API**; keep draft and use this validation artifact (plus the Phase 7B Review Corrections section) as the source of truth for the latest head, PASS, NEEDS_REVIEW, fallback triage, template version 18, and stop-before-Phase-8 status.

## Commit SHAs

- Base / checkpoint: `5c88a64e71245f137e12178f2d26a38faf5fc8f5`
- Pre-follow-up branch tip (audits ran against correction series ending at): `a96862fbd4fe430213e29c44c478474160dc47fc`
- This validation follow-up commit: *(filled after commit; see git log on branch)*

## Stop

Keep PR #82 draft and unmerged. Do not update `checkpoint/equipment-experience-phase4`. Do not begin Phase 8.
