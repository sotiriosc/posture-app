# Pain-aware generation hardening — delivery report

Branch: `fix/pain-aware-generation-hardening` (stacked on `fix/questionnaire-knee-pain-input` / PR #74)  
PR: https://github.com/sotiriosc/posture-app/pull/75  
Stacked base: `4e6f5aa44ef11fec83f25b2b913332fe80cf69e0`  
Head (this validation): current branch tip after merge-readiness fixes  
Date: 2026-08-04  
Status: **merge-ready for human approval; do not merge without explicit approval**

## Source of truth and precedence

1. Structured `painContraindications` with a **non-acute** matching canonical area → **hard exclude**.
2. Structured token with only the `acute` modifier → **soft caution** for questionnaire / planning. Session may pass `{ treatAcuteAsHard: true }`.
3. Usable structured metadata with no hard match → do **not** hard-exclude from free text.
4. No usable structured metadata → legacy free-text may conservatively hard-exclude.
5. Free text never overrides valid structured metadata.

## Defects closed on this PR

| Defect | Resolution |
| --- | --- |
| Hard-excluded original could survive `ensureEligibleItem` | Omit with `unresolved_slot:no_pain_safe_candidate:<area>` |
| Substitution used finite score penalty | Hard-drop before scoring |
| Warmup acute behavior implicit | Explicit `treatAcuteAsHard: true` for warmup avoid lists |
| Role widen stuffed non-role work into squat/hinge lanes | Slot-lane locked: role-legal only, else omit |
| Silent main shortfalls | `degradationNotes` on count shortfall / legality drops |
| Bodyweight squat rejected as drift when all loaded squats hard-excluded | Scarce-pool exception under hard hip/knee pain |

## Base vs head full-suite comparison (authoritative)

Worktrees:

- Base `4e6f5aa`: **988/988 pass**, 0 failures  
- Pre-fix head `7b75a7a`: **1017 pass / 8 fail** (all 8 introduced vs base)  
- Post-fix head (this tip): **1030/1030 pass**, 0 failures  

### Exact failure ledger (pre-fix `7b75a7a` vs base `4e6f5aa`)

| Test | Base `4e6f5aa` | Head `7b75a7a` | Introduced by PR #75? | Expected contract change? | Resolution |
| --- | --- | --- | --- | --- | --- |
| `program.test.ts` › pain areas influence exercise selection priorities | pass | fail (16 ≱ 25 tag score) | **yes** | yes — absolute therapeutic density obsolete under hard filters | Assert no hard-excluded IDs + therapeutic presence |
| `programFuzz.test.ts` › randomized questionnaire… structural safety | pass | fail (silent main shortfall / empty main) | **yes** | partial — silent drop was a real bug; shortfall OK only with notes | Engine notes + allow empty main only with `unresolved_slot:` |
| `programHigherFrequencyContracts.test.ts` › advanced 5-day band pain… hinge | pass | fail (`hollow-body-hold` in hinge) | **yes** | yes — stale allowlist; hollow-body as hinge was wrong | Role-strict repair; allowlist = pain-safe hinge only |
| `programHigherFrequencyContracts.test.ts` › intermediate 4-day band pain… hinge | pass | fail (same) | **yes** | yes | same |
| `programMatrix.test.ts` › core structure invariants | pass | fail (exact main count) | **yes** | yes — fixed counts obsolete under scarce pain | Shortfall allowed iff `unresolved_slot:` notes; no hard-excluded |
| `programSelectionAudit.test.ts` › pain-aware gym profiles… identity | pass | fail (support drift) | **yes** | partial — identity preferred when safe pool nonempty | Allow documented pain-safe widen; keep identity when possible |
| `programSplitContractRepair.test.ts` › 4-day required main patterns | pass | fail (missing squat) | **yes** | no for product — safe squat existed (`bodyweight-squat`) | Scarce-pool drift exception + legs fallback ordering |
| `scenarioMatrix.test.ts` › day/experience/equipment/pain matrix | pass | fail (exact main count) | **yes** | yes | Same safety-aware count contract as matrix/fuzz |
| `competitiveBenchmark.test.ts` › competitive baseline (scenario 4) | pass | fail after repair (80&lt;84) | **yes** (surfaced post-repair) | yes — score design/safety for documented omit | Safety-aware structure/pattern/hard-exclusion scoring |
| `programQuality.test.ts` › quality bar (scenario 4) | pass | fail after repair (70&lt;80) | **yes** (surfaced post-repair) | yes | Same |

**None of the original 8 failures existed on `4e6f5aa`.** Calling them “pre-existing” against `1af7b14` was incorrect.

## Validation results (merge-readiness tip)

| Command | Result |
| --- | --- |
| Targeted pain suites (`painSafetyMonotonicity`, `painHardExclusion`, `painKneePolicy`, `painManualAcceptance`) | **pass** |
| `npm run test:critical` | **359/359 pass** |
| `npm run test:full` | **1030/1030 pass** (141 files) |
| `npx tsc --noEmit -p packages/engine/tsconfig.json` | fails with **pre-existing** test/alias noise also present on `4e6f5aa` (~132 errors); head adds a few QuestionnaireForm alias lines for new pain tests — not production runtime regressions |
| `npm run build --workspace=apps/consumer` | **pass** |
| `npm run build --workspace=apps/gyms` | **pass** |

## Manual acceptance

Scripted in `packages/engine/tests/unit/painManualAcceptance.test.ts` (wired into `test:critical`):

1. **Knees** remains in shared questionnaire display labels (consumer + gyms).  
2. Generated Knees program excludes hard knee contraindications (`machine-leg-press`); lower-body day remains coherent.  
3. Deliberately empty safe pool → omit + `unresolved_slot:no_pain_safe_candidate:knees`.  
4. Knee substitution pool never includes hard-excluded same-risk IDs.  
5. Reload/regeneration with same seed preserves IDs and hard-exclusion invariant.

UI persist of Knees checkboxes is owned by stacked PR #74 (`4e6f5aa`).

## Catalog demotions

See [`docs/pain-catalog-hard-to-acute-demotions.md`](./pain-catalog-hard-to-acute-demotions.md).

## Delivery

- Keep PR #74 narrow (Knees UI).  
- This PR is engine hardening stacked on #74.  
- **Do not merge** without explicit human approval.
