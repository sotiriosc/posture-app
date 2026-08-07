# Engine v19 → Main UI Parity — Integration Result

## Verdict

**NOT_READY**

Engine transplant and automated gates are green, but the required side-by-side golden/candidate screenshot matrix (same fixtures A–H, 390×844 + desktop) was not executed. Do not merge until that visual parity pass completes with 0 unexplained regressions.

Draft PR targets `main` only; do not merge.

## Frozen SHAs

| Ref | SHA |
|---|---|
| LIVE_MAIN (golden) | `1aafcc93c287a3f09914454a431a4ef23c43535d` |
| ENGINE_V19 (PR #84 tip) | `3cb036939f13061db6383f58e0112960f10face3` |
| OLD_CHECKPOINT | `921bd35bf17eeaaf32c0decd2638a45671687354` |
| Candidate tip | `7ded71abcb7f559307d98e312bb3d76e8cea4114` (plus follow-up docs stamp if any) |

## What was transplanted

- Entire `packages/engine` from ENGINE_V19
- Engine audits (`__debug__`), engine tests, equipment/quality docs under `docs/dev-reports/`
- Root `package.json` audit scripts + `fake-indexeddb` dep
- Retained from LIVE_MAIN: `packages/engine/src/sessionSetTimer.ts` (+ timer unit tests) so live-main DualModeTimer single-writer behavior is preserved

## Engine byte-equivalence vs ENGINE_V19

| Category | Status |
|---|---|
| V19 generation / program / coaching / presentation / qualityGate sources | Byte-equivalent |
| Additive `programStorageCompat.ts` + barrel export in `index.ts` | **Delta** (continuity helpers only; no generation algorithm change) |
| Retained `sessionSetTimer.ts` (LIVE_MAIN) | **Delta** (app timer contract; deleted on ENGINE_V19) |

**50k gates:** not rerun — no V19 generation/production algorithm change; PR #84 provenance retained for quality confidence.

## App files changed vs `origin/main` (allowlist)

| File | Why | Visual markup? | Interaction? |
|---|---|---|---|
| `apps/consumer/src/components/QuestionnaireForm.tsx` | `bandSetup` type + follow-up radios when bands selected | Yes (conditional follow-up only) | Yes (band setup input) |
| `apps/gyms/src/components/QuestionnaireForm.tsx` | Same bandSetup receiver | Yes (when equipment unlocked) | Yes |
| `apps/consumer/src/components/ResultsRoutine.tsx` | Presentation resolver + legacy template/signature continuity | Minor (“Setup” coach bullet when identity present) | No silent regen on open |
| `apps/gyms/src/components/ResultsRoutine.tsx` | Same | Minor | Same |
| `apps/consumer/src/app/session/SessionClient.tsx` | Plain feedback labels, no-valid-swap actions, blocked ids in swaps; **timer single-writer kept** | Copy on contract/pain buttons | Pain no-valid-swap path |
| `apps/gyms/src/app/session/SessionClient.tsx` | Same + personal-block menu (parity with consumer) | Block menu + labels | Block + no-valid-swap |
| `apps/gyms/src/app/settings/page.tsx` | Blocked exercises unblock/reset (engine personal blocks) | New settings section | Unblock/reset |
| `apps/consumer/src/components/UpgradePrompt.tsx` | Export pure plan visibility helper (no redesign) | No | No |
| `apps/consumer/tests/unit/upgradeCheckoutPlans.test.ts` | monthly+founders / annual tests | n/a | n/a |
| `apps/*/tests/unit/phase7bPresentation*.test.ts` | Presentation receiver evidence | n/a | n/a |

**Protected / unchanged from LIVE_MAIN:** GA, sitemap/robots, DualModeTimer single-writer, billing checkout routes, SEO metadata, UpgradePrompt layout/pricing cards logic (env-driven).

## Pricing env audit (booleans only — no secrets)

Local `.env.local` / `apps/consumer/.env.local`:

| Key | Presence |
|---|---|
| `STRIPE_PRICE_ID_MONTHLY` | absent |
| `STRIPE_PRICE_ID_ANNUAL` | absent |
| `STRIPE_PRICE_ID` (legacy monthly fallback) | present |
| `STRIPE_SECRET_KEY` | present |
| `APP_URL` | present |

Finding: annual card appears only when `STRIPE_PRICE_ID_ANNUAL` is present. Local annual is **absent**, so local should show monthly+founders (via secret+monthly/legacy). Classify third-card localhost issues as **ENVIRONMENT_PARITY** when annual is set locally; do not redesign pricing UI.

Tests added/retained:

- `resolveVisibleCheckoutPlanOptions` → exactly monthly+founders when annual false
- annual appears when intentionally configured
- `getStripeCheckoutPlanAvailability` live-like env case

## v18 / stored-program continuity

| Boundary | Behavior |
|---|---|
| Open Results / refresh | Stored program with `templateVersion <= 19` and legacy (pre-bandSetup) questionnaire signature remains compatible — **no silent regen** |
| Open/resume Session | Same continuity helpers |
| Explicit questionnaire change confirm | Regenerates → new `templateVersion: 19` |
| New generation paths | Always write `PROGRAM_TEMPLATE_VERSION = 19` |

Helpers: `packages/engine/src/programStorageCompat.ts`  
Tests: `packages/engine/tests/unit/programStorageCompat.test.ts`

## Settings / timer parity

- `sectionVisibility` unit suite passed (show-all / defaults / overrides)
- `sessionSetTimer` + `dualModeTimerSingleWriter` critical tests passed (LIVE_MAIN timer retained)
- Personal blocks: consumer settings unchanged; gyms settings gained blocked-exercises section

## Test / audit results

| Command | Result |
|---|---|
| `npm run test:critical` | PASS (35 files / 336 tests) |
| Continuity + pricing + timer + sectionVisibility focused | PASS |
| `npm run audit:program-presentation` | PASS |
| `npm run audit:exercise-coaching` | PASS (202/202) |
| `npm run test:full:consumer` | PASS (10 files / 44 tests) |
| `npm run test:full:gyms` | PASS (7 files / 31 tests) |
| `npm run build --workspace=apps/consumer` | PASS |
| `npm run build --workspace=apps/gyms` | PASS |
| `npm run lint` | 5 errors in pre-existing `incompleteContractPromptSuppression.spec.ts` on LIVE_MAIN (`any`); not introduced by this branch |

## Screenshot / fixture parity

**GAP — not executed in this pass.** Side-by-side golden/candidate screenshot matrix (fixtures A–H, 390×844 + desktop) was not captured here. Recommend before merge:

1. Two worktrees: LIVE_MAIN vs this branch
2. Same fixture seed / viewport / routes listed in the integration plan
3. Classify IDENTICAL / INTENTIONAL / REGRESSION

Known intentional visual deltas to expect: band-setup follow-up (bands only), Setup coach bullet, plain-language contract/pain labels, gyms block menu + blocked-exercises settings.

## Unresolved / review notes

1. Screenshot matrix still outstanding (above).
2. Lint pre-existing e2e `any` errors on main — out of scope unless release policy requires green lint.
3. Playwright configs still inject `STRIPE_PRICE_ID_ANNUAL` for e2e — intentional for annual path coverage; live-like local env should omit annual.
4. CI quality-gate workflow jobs from ENGINE_V19 were **not** transplanted (deferred); audit scripts are available locally/npm.

## Engine-quality provenance

Validated ENGINE_V19 / PR #84 tip `3cb0369` remains the quality source of truth for program quality / fuzz integrity. Integration did not alter V19 generation algorithms.
