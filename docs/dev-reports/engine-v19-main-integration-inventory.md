# Engine v19 → Main UI Integration Inventory

Generated for branch `release/engine-v19-main-ui-parity`.

## Frozen SHAs

| Ref | SHA |
|---|---|
| LIVE_MAIN | `1aafcc93c287a3f09914454a431a4ef23c43535d` |
| ENGINE_V19 | `3cb036939f13061db6383f58e0112960f10face3` |
| OLD_CHECKPOINT | `921bd35bf17eeaaf32c0decd2638a45671687354` |

## Summary

| Classification | Count |
|---|---:|
| DEPENDENCY_REQUIRED | 3 |
| DOC_ONLY | 81 |
| ENGINE_AUDIT | 19 |
| ENGINE_REQUIRED | 51 |
| ENGINE_TEST | 55 |
| LIVE_MAIN_MUST_WIN | 35 |
| **TOTAL** | **244** |

No files unclassified. `FUNCTIONAL_RECEIVER_REQUIRED` count is 0 pre-transplant; receivers will be reclassified only if compile/runtime proves a gap.

## Classification rules

- `ENGINE_REQUIRED`: `packages/engine` production source needed for v19.
- `ENGINE_TEST`: engine unit tests.
- `ENGINE_AUDIT`: `__debug__` audits + optional CI quality jobs.
- `LIVE_MAIN_MUST_WIN`: app UI/UX/runtime from current main (golden).
- `DEPENDENCY_REQUIRED`: root/engine package scripts/deps for audits/tests.
- `DOC_ONLY`: engine/phase reports and non-runtime docs.
- `FUNCTIONAL_RECEIVER_REQUIRED`: reserved for minimal main-style receivers after transplant.
- `UNKNOWN_REVIEW`: none in this inventory.

## File table

| Path | Status | Classification | Action | Rationale |
|---|---|---|---|---|
| `.github/workflows/ci.yml` | M | ENGINE_AUDIT | SELECTIVE_MERGE_OR_DEFER | CI quality gate jobs for engine audits; transplant carefully if releasing; expensive CI jobs — bring audit scripts first; CI workflow optional for draft PR |
| `apps/consumer/package.json` | M | LIVE_MAIN_MUST_WIN | KEEP_LIVE_MAIN | App deps (e.g. @next/third-parties/GA) — main must win |
| `apps/consumer/src/app/exercise/[id]/page.tsx` | M | LIVE_MAIN_MUST_WIN | KEEP_LIVE_MAIN | App UI/runtime from live main golden baseline — do not transplant checkpoint UI |
| `apps/consumer/src/app/layout.tsx` | M | LIVE_MAIN_MUST_WIN | KEEP_LIVE_MAIN | App UI/runtime from live main golden baseline — do not transplant checkpoint UI |
| `apps/consumer/src/app/robots.ts` | D | LIVE_MAIN_MUST_WIN | KEEP_LIVE_MAIN | App UI/runtime from live main golden baseline — do not transplant checkpoint UI |
| `apps/consumer/src/app/session/SessionClient.tsx` | M | LIVE_MAIN_MUST_WIN | KEEP_LIVE_MAIN | App UI/runtime from live main golden baseline — do not transplant checkpoint UI |
| `apps/consumer/src/app/sitemap.ts` | M | LIVE_MAIN_MUST_WIN | KEEP_LIVE_MAIN | App UI/runtime from live main golden baseline — do not transplant checkpoint UI |
| `apps/consumer/src/components/Analytics.tsx` | M | LIVE_MAIN_MUST_WIN | KEEP_LIVE_MAIN | App UI/runtime from live main golden baseline — do not transplant checkpoint UI |
| `apps/consumer/src/components/DualModeTimer.tsx` | M | LIVE_MAIN_MUST_WIN | KEEP_LIVE_MAIN | App UI/runtime from live main golden baseline — do not transplant checkpoint UI |
| `apps/consumer/src/components/ExerciseCard.tsx` | M | LIVE_MAIN_MUST_WIN | KEEP_LIVE_MAIN | App UI/runtime from live main golden baseline — do not transplant checkpoint UI |
| `apps/consumer/src/components/ExerciseCoachingGuide.tsx` | A | LIVE_MAIN_MUST_WIN | KEEP_LIVE_MAIN | Checkpoint/Phase7b UI or tests — keep main by default; reclassify only if engine compile requires receiver |
| `apps/consumer/src/components/QuestionnaireForm.tsx` | M | LIVE_MAIN_MUST_WIN | KEEP_LIVE_MAIN | App UI/runtime from live main golden baseline — do not transplant checkpoint UI |
| `apps/consumer/src/components/ResultsRoutine.tsx` | M | LIVE_MAIN_MUST_WIN | KEEP_LIVE_MAIN | App UI/runtime from live main golden baseline — do not transplant checkpoint UI |
| `apps/consumer/src/components/RoutineItemCoachingDetails.tsx` | M | LIVE_MAIN_MUST_WIN | KEEP_LIVE_MAIN | App UI/runtime from live main golden baseline — do not transplant checkpoint UI |
| `apps/consumer/src/components/onboarding/onboardingConfig.ts` | M | LIVE_MAIN_MUST_WIN | KEEP_LIVE_MAIN | App UI/runtime from live main golden baseline — do not transplant checkpoint UI |
| `apps/consumer/src/components/results-view/ResultsView.tsx` | M | LIVE_MAIN_MUST_WIN | KEEP_LIVE_MAIN | App UI/runtime from live main golden baseline — do not transplant checkpoint UI |
| `apps/consumer/src/components/session/SessionProgressHeader.tsx` | M | LIVE_MAIN_MUST_WIN | KEEP_LIVE_MAIN | App UI/runtime from live main golden baseline — do not transplant checkpoint UI |
| `apps/consumer/src/gaMeasurementId.ts` | D | LIVE_MAIN_MUST_WIN | KEEP_LIVE_MAIN | App UI/runtime from live main golden baseline — do not transplant checkpoint UI |
| `apps/consumer/src/siteUrl.ts` | D | LIVE_MAIN_MUST_WIN | KEEP_LIVE_MAIN | App UI/runtime from live main golden baseline — do not transplant checkpoint UI |
| `apps/consumer/tests/e2e/incompleteContractPromptSuppression.spec.ts` | M | LIVE_MAIN_MUST_WIN | KEEP_LIVE_MAIN | App UI/runtime from live main golden baseline — do not transplant checkpoint UI |
| `apps/consumer/tests/unit/gaMeasurementId.test.ts` | D | LIVE_MAIN_MUST_WIN | KEEP_LIVE_MAIN | App UI/runtime from live main golden baseline — do not transplant checkpoint UI |
| `apps/consumer/tests/unit/phase7bPresentationParity.test.ts` | A | LIVE_MAIN_MUST_WIN | KEEP_LIVE_MAIN | Checkpoint/Phase7b UI or tests — keep main by default; reclassify only if engine compile requires receiver |
| `apps/consumer/tests/unit/siteUrl.test.ts` | D | LIVE_MAIN_MUST_WIN | KEEP_LIVE_MAIN | App UI/runtime from live main golden baseline — do not transplant checkpoint UI |
| `apps/gyms/src/app/exercise/[id]/page.tsx` | M | LIVE_MAIN_MUST_WIN | KEEP_LIVE_MAIN | App UI/runtime from live main golden baseline — do not transplant checkpoint UI |
| `apps/gyms/src/app/session/SessionClient.tsx` | M | LIVE_MAIN_MUST_WIN | KEEP_LIVE_MAIN | App UI/runtime from live main golden baseline — do not transplant checkpoint UI |
| `apps/gyms/src/app/settings/page.tsx` | M | LIVE_MAIN_MUST_WIN | KEEP_LIVE_MAIN | App UI/runtime from live main golden baseline — do not transplant checkpoint UI |
| `apps/gyms/src/components/DualModeTimer.tsx` | M | LIVE_MAIN_MUST_WIN | KEEP_LIVE_MAIN | App UI/runtime from live main golden baseline — do not transplant checkpoint UI |
| `apps/gyms/src/components/ExerciseCard.tsx` | M | LIVE_MAIN_MUST_WIN | KEEP_LIVE_MAIN | App UI/runtime from live main golden baseline — do not transplant checkpoint UI |
| `apps/gyms/src/components/ExerciseCoachingGuide.tsx` | A | LIVE_MAIN_MUST_WIN | KEEP_LIVE_MAIN | Checkpoint/Phase7b UI or tests — keep main by default; reclassify only if engine compile requires receiver |
| `apps/gyms/src/components/QuestionnaireForm.tsx` | M | LIVE_MAIN_MUST_WIN | KEEP_LIVE_MAIN | App UI/runtime from live main golden baseline — do not transplant checkpoint UI |
| `apps/gyms/src/components/ResultsRoutine.tsx` | M | LIVE_MAIN_MUST_WIN | KEEP_LIVE_MAIN | App UI/runtime from live main golden baseline — do not transplant checkpoint UI |
| `apps/gyms/src/components/RoutineItemCoachingDetails.tsx` | M | LIVE_MAIN_MUST_WIN | KEEP_LIVE_MAIN | App UI/runtime from live main golden baseline — do not transplant checkpoint UI |
| `apps/gyms/src/components/onboarding/onboardingConfig.ts` | M | LIVE_MAIN_MUST_WIN | KEEP_LIVE_MAIN | App UI/runtime from live main golden baseline — do not transplant checkpoint UI |
| `apps/gyms/src/components/session/SessionProgressHeader.tsx` | M | LIVE_MAIN_MUST_WIN | KEEP_LIVE_MAIN | App UI/runtime from live main golden baseline — do not transplant checkpoint UI |
| `apps/gyms/tests/unit/phase7bPresentationParity.test.ts` | A | LIVE_MAIN_MUST_WIN | KEEP_LIVE_MAIN | Checkpoint/Phase7b UI or tests — keep main by default; reclassify only if engine compile requires receiver |
| `apps/gyms/tests/unit/phase7bPresentationReachability.test.ts` | A | LIVE_MAIN_MUST_WIN | KEEP_LIVE_MAIN | Checkpoint/Phase7b UI or tests — keep main by default; reclassify only if engine compile requires receiver |
| `docs/PROGRAM_EQUIPMENT_EXPERIENCE_V2.md` | A | DOC_ONLY | CHECKOUT_ENGINE_V19 | Engine/equipment audit and phase reports from ENGINE_V19 |
| `docs/dev-reports/at-home-composition-refinement-baseline.json` | A | DOC_ONLY | CHECKOUT_ENGINE_V19 | Engine/equipment audit and phase reports from ENGINE_V19 |
| `docs/dev-reports/at-home-composition-refinement-baseline.md` | A | DOC_ONLY | CHECKOUT_ENGINE_V19 | Engine/equipment audit and phase reports from ENGINE_V19 |
| `docs/dev-reports/at-home-composition-refinement-result.json` | A | DOC_ONLY | CHECKOUT_ENGINE_V19 | Engine/equipment audit and phase reports from ENGINE_V19 |
| `docs/dev-reports/at-home-composition-refinement-result.md` | A | DOC_ONLY | CHECKOUT_ENGINE_V19 | Engine/equipment audit and phase reports from ENGINE_V19 |
| `docs/dev-reports/at-home-longitudinal-repeat.json` | A | DOC_ONLY | CHECKOUT_ENGINE_V19 | Engine/equipment audit and phase reports from ENGINE_V19 |
| `docs/dev-reports/at-home-longitudinal-repeat.md` | A | DOC_ONLY | CHECKOUT_ENGINE_V19 | Engine/equipment audit and phase reports from ENGINE_V19 |
| `docs/dev-reports/at-home-repeat-blind-samples.md` | A | DOC_ONLY | CHECKOUT_ENGINE_V19 | Engine/equipment audit and phase reports from ENGINE_V19 |
| `docs/dev-reports/engine-gate-intelligence-audit.json` | A | DOC_ONLY | CHECKOUT_ENGINE_V19 | Engine/equipment audit and phase reports from ENGINE_V19 |
| `docs/dev-reports/engine-gate-intelligence-audit.md` | A | DOC_ONLY | CHECKOUT_ENGINE_V19 | Engine/equipment audit and phase reports from ENGINE_V19 |
| `docs/dev-reports/equipment-program-audit-phase0-twelve-personas.md` | A | DOC_ONLY | CHECKOUT_ENGINE_V19 | Engine/equipment audit and phase reports from ENGINE_V19 |
| `docs/dev-reports/equipment-program-audit-phase0.json` | A | DOC_ONLY | CHECKOUT_ENGINE_V19 | Engine/equipment audit and phase reports from ENGINE_V19 |
| `docs/dev-reports/equipment-program-audit-phase0.md` | A | DOC_ONLY | CHECKOUT_ENGINE_V19 | Engine/equipment audit and phase reports from ENGINE_V19 |
| `docs/dev-reports/equipment-program-audit-phase1-twelve-personas.md` | A | DOC_ONLY | CHECKOUT_ENGINE_V19 | Engine/equipment audit and phase reports from ENGINE_V19 |
| `docs/dev-reports/equipment-program-audit-phase1-vs-phase0.md` | A | DOC_ONLY | CHECKOUT_ENGINE_V19 | Engine/equipment audit and phase reports from ENGINE_V19 |
| `docs/dev-reports/equipment-program-audit-phase1.json` | A | DOC_ONLY | CHECKOUT_ENGINE_V19 | Engine/equipment audit and phase reports from ENGINE_V19 |
| `docs/dev-reports/equipment-program-audit-phase1.md` | A | DOC_ONLY | CHECKOUT_ENGINE_V19 | Engine/equipment audit and phase reports from ENGINE_V19 |
| `docs/dev-reports/equipment-program-audit-phase2-gym-fuzz-10k.md` | A | DOC_ONLY | CHECKOUT_ENGINE_V19 | Engine/equipment audit and phase reports from ENGINE_V19 |
| `docs/dev-reports/equipment-program-audit-phase2-gym-personas.md` | A | DOC_ONLY | CHECKOUT_ENGINE_V19 | Engine/equipment audit and phase reports from ENGINE_V19 |
| `docs/dev-reports/equipment-program-audit-phase2-hard-failures-initial-vs-final.md` | A | DOC_ONLY | CHECKOUT_ENGINE_V19 | Engine/equipment audit and phase reports from ENGINE_V19 |
| `docs/dev-reports/equipment-program-audit-phase2.json` | A | DOC_ONLY | CHECKOUT_ENGINE_V19 | Engine/equipment audit and phase reports from ENGINE_V19 |
| `docs/dev-reports/equipment-program-audit-phase2.md` | A | DOC_ONLY | CHECKOUT_ENGINE_V19 | Engine/equipment audit and phase reports from ENGINE_V19 |
| `docs/dev-reports/equipment-program-audit-phase3-dumbbell-fuzz-10k.md` | A | DOC_ONLY | CHECKOUT_ENGINE_V19 | Engine/equipment audit and phase reports from ENGINE_V19 |
| `docs/dev-reports/equipment-program-audit-phase3-dumbbell-personas.md` | A | DOC_ONLY | CHECKOUT_ENGINE_V19 | Engine/equipment audit and phase reports from ENGINE_V19 |
| `docs/dev-reports/equipment-program-audit-phase3-hard-failures-initial-vs-final.md` | A | DOC_ONLY | CHECKOUT_ENGINE_V19 | Engine/equipment audit and phase reports from ENGINE_V19 |
| `docs/dev-reports/equipment-program-audit-phase3.json` | A | DOC_ONLY | CHECKOUT_ENGINE_V19 | Engine/equipment audit and phase reports from ENGINE_V19 |
| `docs/dev-reports/equipment-program-audit-phase3.md` | A | DOC_ONLY | CHECKOUT_ENGINE_V19 | Engine/equipment audit and phase reports from ENGINE_V19 |
| `docs/dev-reports/equipment-program-audit-phase4-band-fuzz-10k.md` | A | DOC_ONLY | CHECKOUT_ENGINE_V19 | Engine/equipment audit and phase reports from ENGINE_V19 |
| `docs/dev-reports/equipment-program-audit-phase4-band-personas.md` | A | DOC_ONLY | CHECKOUT_ENGINE_V19 | Engine/equipment audit and phase reports from ENGINE_V19 |
| `docs/dev-reports/equipment-program-audit-phase4-baseline-bands.md` | A | DOC_ONLY | CHECKOUT_ENGINE_V19 | Engine/equipment audit and phase reports from ENGINE_V19 |
| `docs/dev-reports/equipment-program-audit-phase4-capability-migration.md` | A | DOC_ONLY | CHECKOUT_ENGINE_V19 | Engine/equipment audit and phase reports from ENGINE_V19 |
| `docs/dev-reports/equipment-program-audit-phase4-hard-failures-initial-vs-final.md` | A | DOC_ONLY | CHECKOUT_ENGINE_V19 | Engine/equipment audit and phase reports from ENGINE_V19 |
| `docs/dev-reports/equipment-program-audit-phase4.json` | A | DOC_ONLY | CHECKOUT_ENGINE_V19 | Engine/equipment audit and phase reports from ENGINE_V19 |
| `docs/dev-reports/equipment-program-audit-phase4.md` | A | DOC_ONLY | CHECKOUT_ENGINE_V19 | Engine/equipment audit and phase reports from ENGINE_V19 |
| `docs/dev-reports/equipment-program-audit-phase5-bodyweight-fuzz-10k.md` | A | DOC_ONLY | CHECKOUT_ENGINE_V19 | Engine/equipment audit and phase reports from ENGINE_V19 |
| `docs/dev-reports/equipment-program-audit-phase5-bodyweight-personas.md` | A | DOC_ONLY | CHECKOUT_ENGINE_V19 | Engine/equipment audit and phase reports from ENGINE_V19 |
| `docs/dev-reports/equipment-program-audit-phase5-hard-failures-initial-vs-final.md` | A | DOC_ONLY | CHECKOUT_ENGINE_V19 | Engine/equipment audit and phase reports from ENGINE_V19 |
| `docs/dev-reports/equipment-program-audit-phase5.json` | A | DOC_ONLY | CHECKOUT_ENGINE_V19 | Engine/equipment audit and phase reports from ENGINE_V19 |
| `docs/dev-reports/equipment-program-audit-phase5.md` | A | DOC_ONLY | CHECKOUT_ENGINE_V19 | Engine/equipment audit and phase reports from ENGINE_V19 |
| `docs/dev-reports/equipment-program-audit-phase5b-equipment-rationale.md` | A | DOC_ONLY | CHECKOUT_ENGINE_V19 | Engine/equipment audit and phase reports from ENGINE_V19 |
| `docs/dev-reports/equipment-program-audit-phase5b-hard-failures-initial-vs-final.md` | A | DOC_ONLY | CHECKOUT_ENGINE_V19 | Engine/equipment audit and phase reports from ENGINE_V19 |
| `docs/dev-reports/equipment-program-audit-phase5b-mixed-home-fuzz-10k.md` | A | DOC_ONLY | CHECKOUT_ENGINE_V19 | Engine/equipment audit and phase reports from ENGINE_V19 |
| `docs/dev-reports/equipment-program-audit-phase5b-mixed-home-personas.md` | A | DOC_ONLY | CHECKOUT_ENGINE_V19 | Engine/equipment audit and phase reports from ENGINE_V19 |
| `docs/dev-reports/equipment-program-audit-phase5b-setup-transitions.md` | A | DOC_ONLY | CHECKOUT_ENGINE_V19 | Engine/equipment audit and phase reports from ENGINE_V19 |
| `docs/dev-reports/equipment-program-audit-phase5b.json` | A | DOC_ONLY | CHECKOUT_ENGINE_V19 | Engine/equipment audit and phase reports from ENGINE_V19 |
| `docs/dev-reports/equipment-program-audit-phase5b.md` | A | DOC_ONLY | CHECKOUT_ENGINE_V19 | Engine/equipment audit and phase reports from ENGINE_V19 |
| `docs/dev-reports/program-quality-v2-fuzz-integrity-samples.json` | A | DOC_ONLY | CHECKOUT_ENGINE_V19 | Engine/equipment audit and phase reports from ENGINE_V19 |
| `docs/dev-reports/program-quality-v2-fuzz-integrity-samples.md` | A | DOC_ONLY | CHECKOUT_ENGINE_V19 | Engine/equipment audit and phase reports from ENGINE_V19 |
| `docs/dev-reports/program-quality-v2-fuzz-integrity.json` | A | DOC_ONLY | CHECKOUT_ENGINE_V19 | Engine/equipment audit and phase reports from ENGINE_V19 |
| `docs/dev-reports/program-quality-v2-fuzz-integrity.md` | A | DOC_ONLY | CHECKOUT_ENGINE_V19 | Engine/equipment audit and phase reports from ENGINE_V19 |
| `docs/dev-reports/program-quality-v2-phase6-card-screenshot-review.md` | A | DOC_ONLY | CHECKOUT_ENGINE_V19 | Engine/equipment audit and phase reports from ENGINE_V19 |
| `docs/dev-reports/program-quality-v2-phase6-coaching-audit.json` | A | DOC_ONLY | CHECKOUT_ENGINE_V19 | Engine/equipment audit and phase reports from ENGINE_V19 |
| `docs/dev-reports/program-quality-v2-phase6-coaching-audit.md` | A | DOC_ONLY | CHECKOUT_ENGINE_V19 | Engine/equipment audit and phase reports from ENGINE_V19 |
| `docs/dev-reports/program-quality-v2-phase6-demo-queue.md` | A | DOC_ONLY | CHECKOUT_ENGINE_V19 | Engine/equipment audit and phase reports from ENGINE_V19 |
| `docs/dev-reports/program-quality-v2-phase6-no-research-review.md` | A | DOC_ONLY | CHECKOUT_ENGINE_V19 | Engine/equipment audit and phase reports from ENGINE_V19 |
| `docs/dev-reports/program-quality-v2-phase6-surface-audit.md` | A | DOC_ONLY | CHECKOUT_ENGINE_V19 | Engine/equipment audit and phase reports from ENGINE_V19 |
| `docs/dev-reports/program-quality-v2-phase7-baselines.md` | A | DOC_ONLY | CHECKOUT_ENGINE_V19 | Engine/equipment audit and phase reports from ENGINE_V19 |
| `docs/dev-reports/program-quality-v2-phase7-ci-enforcement.md` | A | DOC_ONLY | CHECKOUT_ENGINE_V19 | Engine/equipment audit and phase reports from ENGINE_V19 |
| `docs/dev-reports/program-quality-v2-phase7-completion.json` | A | DOC_ONLY | CHECKOUT_ENGINE_V19 | Engine/equipment audit and phase reports from ENGINE_V19 |
| `docs/dev-reports/program-quality-v2-phase7-completion.md` | A | DOC_ONLY | CHECKOUT_ENGINE_V19 | Engine/equipment audit and phase reports from ENGINE_V19 |
| `docs/dev-reports/program-quality-v2-phase7-fuzz-summary.md` | A | DOC_ONLY | CHECKOUT_ENGINE_V19 | Engine/equipment audit and phase reports from ENGINE_V19 |
| `docs/dev-reports/program-quality-v2-phase7-gate-inventory.md` | A | DOC_ONLY | CHECKOUT_ENGINE_V19 | Engine/equipment audit and phase reports from ENGINE_V19 |
| `docs/dev-reports/program-quality-v2-phase7-manual-review.md` | A | DOC_ONLY | CHECKOUT_ENGINE_V19 | Engine/equipment audit and phase reports from ENGINE_V19 |
| `docs/dev-reports/program-quality-v2-phase7-matrix-blockers.md` | A | DOC_ONLY | CHECKOUT_ENGINE_V19 | Engine/equipment audit and phase reports from ENGINE_V19 |
| `docs/dev-reports/program-quality-v2-phase7-reason-code-policy.md` | A | DOC_ONLY | CHECKOUT_ENGINE_V19 | Engine/equipment audit and phase reports from ENGINE_V19 |
| `docs/dev-reports/program-quality-v2-phase7-recovery-review.md` | A | DOC_ONLY | CHECKOUT_ENGINE_V19 | Engine/equipment audit and phase reports from ENGINE_V19 |
| `docs/dev-reports/program-quality-v2-phase7-repeatability.md` | A | DOC_ONLY | CHECKOUT_ENGINE_V19 | Engine/equipment audit and phase reports from ENGINE_V19 |
| `docs/dev-reports/program-quality-v2-phase7-unified-gate.json` | A | DOC_ONLY | CHECKOUT_ENGINE_V19 | Engine/equipment audit and phase reports from ENGINE_V19 |
| `docs/dev-reports/program-quality-v2-phase7-unified-gate.md` | A | DOC_ONLY | CHECKOUT_ENGINE_V19 | Engine/equipment audit and phase reports from ENGINE_V19 |
| `docs/dev-reports/program-quality-v2-phase7b-correction-validation.json` | A | DOC_ONLY | CHECKOUT_ENGINE_V19 | Engine/equipment audit and phase reports from ENGINE_V19 |
| `docs/dev-reports/program-quality-v2-phase7b-correction-validation.md` | A | DOC_ONLY | CHECKOUT_ENGINE_V19 | Engine/equipment audit and phase reports from ENGINE_V19 |
| `docs/dev-reports/program-quality-v2-phase7b-input-continuity.md` | A | DOC_ONLY | CHECKOUT_ENGINE_V19 | Engine/equipment audit and phase reports from ENGINE_V19 |
| `docs/dev-reports/program-quality-v2-phase7b-pain-swap-trace.md` | A | DOC_ONLY | CHECKOUT_ENGINE_V19 | Engine/equipment audit and phase reports from ENGINE_V19 |
| `docs/dev-reports/program-quality-v2-phase7b-phase8-requirements.md` | A | DOC_ONLY | CHECKOUT_ENGINE_V19 | Engine/equipment audit and phase reports from ENGINE_V19 |
| `docs/dev-reports/program-quality-v2-phase7b-presentation-contract.json` | A | DOC_ONLY | CHECKOUT_ENGINE_V19 | Engine/equipment audit and phase reports from ENGINE_V19 |
| `docs/dev-reports/program-quality-v2-phase7b-presentation-contract.md` | A | DOC_ONLY | CHECKOUT_ENGINE_V19 | Engine/equipment audit and phase reports from ENGINE_V19 |
| `docs/dev-reports/program-quality-v2-phase7b-relational-inventory.json` | A | DOC_ONLY | CHECKOUT_ENGINE_V19 | Engine/equipment audit and phase reports from ENGINE_V19 |
| `docs/dev-reports/program-quality-v2-phase7b-relational-inventory.md` | A | DOC_ONLY | CHECKOUT_ENGINE_V19 | Engine/equipment audit and phase reports from ENGINE_V19 |
| `docs/dev-reports/program-quality-v2-phase7b-screenshot-review.md` | A | DOC_ONLY | CHECKOUT_ENGINE_V19 | Engine/equipment audit and phase reports from ENGINE_V19 |
| `docs/local-env.example` | M | DOC_ONLY | SKIP | Env example doc delta; review separately from UI |
| `newpromptforpengine.md` | A | DOC_ONLY | SKIP | Engine prompt/notes doc on ENGINE_V19; not required for live UI |
| `package-lock.json` | M | DEPENDENCY_REQUIRED | REGENERATE_AFTER_DEPS | Root scripts/lockfile for audit:* scripts and test:critical path updates |
| `package.json` | M | DEPENDENCY_REQUIRED | SELECTIVE_PATCH | Root scripts/lockfile for audit:* scripts and test:critical path updates; add audit scripts + update test:critical; keep other main scripts |
| `packages/engine/package.json` | M | DEPENDENCY_REQUIRED | CHECKOUT_ENGINE_V19 | Engine package deps (fake-indexeddb) needed for tests |
| `packages/engine/src/__debug__/atHomeCompositionBaselineAudit.ts` | A | ENGINE_AUDIT | CHECKOUT_ENGINE_V19 | Engine audit/debug utilities required for release gates |
| `packages/engine/src/__debug__/atHomeLongitudinalRepeatAudit.ts` | A | ENGINE_AUDIT | CHECKOUT_ENGINE_V19 | Engine audit/debug utilities required for release gates |
| `packages/engine/src/__debug__/bandProgramAudit.ts` | A | ENGINE_AUDIT | CHECKOUT_ENGINE_V19 | Engine audit/debug utilities required for release gates |
| `packages/engine/src/__debug__/bodyweightProgramAudit.ts` | A | ENGINE_AUDIT | CHECKOUT_ENGINE_V19 | Engine audit/debug utilities required for release gates |
| `packages/engine/src/__debug__/coverageContractAudit.ts` | M | ENGINE_AUDIT | CHECKOUT_ENGINE_V19 | Engine audit/debug utilities required for release gates |
| `packages/engine/src/__debug__/dumbbellProgramAudit.ts` | A | ENGINE_AUDIT | CHECKOUT_ENGINE_V19 | Engine audit/debug utilities required for release gates |
| `packages/engine/src/__debug__/engineGateIntelligenceAudit.ts` | A | ENGINE_AUDIT | CHECKOUT_ENGINE_V19 | Engine audit/debug utilities required for release gates |
| `packages/engine/src/__debug__/equipmentProgramAudit.ts` | A | ENGINE_AUDIT | CHECKOUT_ENGINE_V19 | Engine audit/debug utilities required for release gates |
| `packages/engine/src/__debug__/exerciseCoachingAudit.ts` | A | ENGINE_AUDIT | CHECKOUT_ENGINE_V19 | Engine audit/debug utilities required for release gates |
| `packages/engine/src/__debug__/extractGymSeeds.ts` | A | ENGINE_AUDIT | CHECKOUT_ENGINE_V19 | Engine audit/debug utilities required for release gates |
| `packages/engine/src/__debug__/fuzzIntegrityAudit.ts` | A | ENGINE_AUDIT | CHECKOUT_ENGINE_V19 | Engine audit/debug utilities required for release gates |
| `packages/engine/src/__debug__/gymProgramAudit.ts` | A | ENGINE_AUDIT | CHECKOUT_ENGINE_V19 | Engine audit/debug utilities required for release gates |
| `packages/engine/src/__debug__/lib/canonicalFuzzCases.ts` | A | ENGINE_AUDIT | CHECKOUT_ENGINE_V19 | Engine audit/debug utilities required for release gates |
| `packages/engine/src/__debug__/mixedHomeProgramAudit.ts` | A | ENGINE_AUDIT | CHECKOUT_ENGINE_V19 | Engine audit/debug utilities required for release gates |
| `packages/engine/src/__debug__/phaseMatrixProgramPrint.ts` | M | ENGINE_AUDIT | CHECKOUT_ENGINE_V19 | Engine audit/debug utilities required for release gates |
| `packages/engine/src/__debug__/programPresentationAudit.ts` | A | ENGINE_AUDIT | CHECKOUT_ENGINE_V19 | Engine audit/debug utilities required for release gates |
| `packages/engine/src/__debug__/programQualityAudit.ts` | A | ENGINE_AUDIT | CHECKOUT_ENGINE_V19 | Engine audit/debug utilities required for release gates |
| `packages/engine/src/__debug__/reproGym5dPainBaselines.ts` | A | ENGINE_AUDIT | CHECKOUT_ENGINE_V19 | Engine audit/debug utilities required for release gates |
| `packages/engine/src/coaching/exerciseCoachingContract.ts` | A | ENGINE_REQUIRED | CHECKOUT_ENGINE_V19 | Validated v19 engine production source |
| `packages/engine/src/coaching/exerciseCoachingOverrides.ts` | A | ENGINE_REQUIRED | CHECKOUT_ENGINE_V19 | Validated v19 engine production source |
| `packages/engine/src/coaching/exerciseCoachingRegistry.ts` | A | ENGINE_REQUIRED | CHECKOUT_ENGINE_V19 | Validated v19 engine production source |
| `packages/engine/src/coaching/exerciseDemoPolicy.ts` | A | ENGINE_REQUIRED | CHECKOUT_ENGINE_V19 | Validated v19 engine production source |
| `packages/engine/src/coaching/index.ts` | A | ENGINE_REQUIRED | CHECKOUT_ENGINE_V19 | Validated v19 engine production source |
| `packages/engine/src/coaching/releaseCriticalExercises.ts` | A | ENGINE_REQUIRED | CHECKOUT_ENGINE_V19 | Validated v19 engine production source |
| `packages/engine/src/coaching/releaseCriticalGymSeeds.ts` | A | ENGINE_REQUIRED | CHECKOUT_ENGINE_V19 | Validated v19 engine production source |
| `packages/engine/src/coaching/resolveExerciseCoaching.ts` | A | ENGINE_REQUIRED | CHECKOUT_ENGINE_V19 | Validated v19 engine production source |
| `packages/engine/src/coaching/synthesizeExerciseCoaching.ts` | A | ENGINE_REQUIRED | CHECKOUT_ENGINE_V19 | Validated v19 engine production source |
| `packages/engine/src/coaching/validateExerciseCoaching.ts` | A | ENGINE_REQUIRED | CHECKOUT_ENGINE_V19 | Validated v19 engine production source |
| `packages/engine/src/engine/engine.ts` | M | ENGINE_REQUIRED | CHECKOUT_ENGINE_V19 | Validated v19 engine production source |
| `packages/engine/src/engine/engineTypes.ts` | M | ENGINE_REQUIRED | CHECKOUT_ENGINE_V19 | Validated v19 engine production source |
| `packages/engine/src/exercises.ts` | M | ENGINE_REQUIRED | CHECKOUT_ENGINE_V19 | Validated v19 engine production source |
| `packages/engine/src/index.ts` | M | ENGINE_REQUIRED | CHECKOUT_ENGINE_V19 | Validated v19 engine production source |
| `packages/engine/src/program.ts` | M | ENGINE_REQUIRED | CHECKOUT_ENGINE_V19 | Validated v19 engine production source |
| `packages/engine/src/program/bandExerciseRequirements.ts` | A | ENGINE_REQUIRED | CHECKOUT_ENGINE_V19 | Validated v19 engine production source |
| `packages/engine/src/program/bandProgramContract.ts` | A | ENGINE_REQUIRED | CHECKOUT_ENGINE_V19 | Validated v19 engine production source |
| `packages/engine/src/program/bandSetup.ts` | A | ENGINE_REQUIRED | CHECKOUT_ENGINE_V19 | Validated v19 engine production source |
| `packages/engine/src/program/bandTemplates.ts` | A | ENGINE_REQUIRED | CHECKOUT_ENGINE_V19 | Validated v19 engine production source |
| `packages/engine/src/program/bodyweightProgramContract.ts` | A | ENGINE_REQUIRED | CHECKOUT_ENGINE_V19 | Validated v19 engine production source |
| `packages/engine/src/program/bodyweightTemplates.ts` | A | ENGINE_REQUIRED | CHECKOUT_ENGINE_V19 | Validated v19 engine production source |
| `packages/engine/src/program/dayTemplates.ts` | M | ENGINE_REQUIRED | CHECKOUT_ENGINE_V19 | Validated v19 engine production source |
| `packages/engine/src/program/dumbbellProgramContract.ts` | A | ENGINE_REQUIRED | CHECKOUT_ENGINE_V19 | Validated v19 engine production source |
| `packages/engine/src/program/dumbbellTemplates.ts` | A | ENGINE_REQUIRED | CHECKOUT_ENGINE_V19 | Validated v19 engine production source |
| `packages/engine/src/program/equipmentCapabilities.ts` | A | ENGINE_REQUIRED | CHECKOUT_ENGINE_V19 | Validated v19 engine production source |
| `packages/engine/src/program/equipmentMode.ts` | A | ENGINE_REQUIRED | CHECKOUT_ENGINE_V19 | Validated v19 engine production source |
| `packages/engine/src/program/gymProgramContract.ts` | A | ENGINE_REQUIRED | CHECKOUT_ENGINE_V19 | Validated v19 engine production source |
| `packages/engine/src/program/mixedHomeProgramContract.ts` | A | ENGINE_REQUIRED | CHECKOUT_ENGINE_V19 | Validated v19 engine production source |
| `packages/engine/src/program/mixedHomeTemplates.ts` | A | ENGINE_REQUIRED | CHECKOUT_ENGINE_V19 | Validated v19 engine production source |
| `packages/engine/src/program/presentation/index.ts` | A | ENGINE_REQUIRED | CHECKOUT_ENGINE_V19 | Validated v19 engine production source |
| `packages/engine/src/program/presentation/presentationContractTypes.ts` | A | ENGINE_REQUIRED | CHECKOUT_ENGINE_V19 | Validated v19 engine production source |
| `packages/engine/src/program/presentation/presentationReceiverEvidence.ts` | A | ENGINE_REQUIRED | CHECKOUT_ENGINE_V19 | Validated v19 engine production source |
| `packages/engine/src/program/presentation/programPresentationInventory.ts` | A | ENGINE_REQUIRED | CHECKOUT_ENGINE_V19 | Validated v19 engine production source |
| `packages/engine/src/program/presentation/resolveAdaptationPresentation.ts` | A | ENGINE_REQUIRED | CHECKOUT_ENGINE_V19 | Validated v19 engine production source |
| `packages/engine/src/program/presentation/resolveAssessmentFocusFromPose.ts` | A | ENGINE_REQUIRED | CHECKOUT_ENGINE_V19 | Validated v19 engine production source |
| `packages/engine/src/program/presentation/resolveProgramPresentation.ts` | A | ENGINE_REQUIRED | CHECKOUT_ENGINE_V19 | Validated v19 engine production source |
| `packages/engine/src/program/presentation/validateProgramPresentation.ts` | A | ENGINE_REQUIRED | CHECKOUT_ENGINE_V19 | Validated v19 engine production source |
| `packages/engine/src/program/qualityGate/ProgramQualityGateError.ts` | A | ENGINE_REQUIRED | CHECKOUT_ENGINE_V19 | Validated v19 engine production source |
| `packages/engine/src/program/qualityGate/evaluateProgramQuality.ts` | A | ENGINE_REQUIRED | CHECKOUT_ENGINE_V19 | Validated v19 engine production source |
| `packages/engine/src/program/qualityGate/index.ts` | A | ENGINE_REQUIRED | CHECKOUT_ENGINE_V19 | Validated v19 engine production source |
| `packages/engine/src/program/qualityGate/modeQualityFallback.ts` | A | ENGINE_REQUIRED | CHECKOUT_ENGINE_V19 | Validated v19 engine production source |
| `packages/engine/src/program/qualityGate/programQualityObservability.ts` | A | ENGINE_REQUIRED | CHECKOUT_ENGINE_V19 | Validated v19 engine production source |
| `packages/engine/src/program/qualityGate/programQualityPolicy.ts` | A | ENGINE_REQUIRED | CHECKOUT_ENGINE_V19 | Validated v19 engine production source |
| `packages/engine/src/program/qualityGate/programQualitySignature.ts` | A | ENGINE_REQUIRED | CHECKOUT_ENGINE_V19 | Validated v19 engine production source |
| `packages/engine/src/program/qualityGate/qualityGateTypes.ts` | A | ENGINE_REQUIRED | CHECKOUT_ENGINE_V19 | Validated v19 engine production source |
| `packages/engine/src/program/qualityGate/recoverProgramQuality.ts` | A | ENGINE_REQUIRED | CHECKOUT_ENGINE_V19 | Validated v19 engine production source |
| `packages/engine/src/program/qualityGate/repairProgramQualityContracts.ts` | A | ENGINE_REQUIRED | CHECKOUT_ENGINE_V19 | Validated v19 engine production source |
| `packages/engine/src/program/sequencingPolicy.ts` | A | ENGINE_REQUIRED | CHECKOUT_ENGINE_V19 | Validated v19 engine production source |
| `packages/engine/src/program/splitTemplatePolicy.ts` | M | ENGINE_REQUIRED | CHECKOUT_ENGINE_V19 | Validated v19 engine production source |
| `packages/engine/src/questionnaireSignature.ts` | M | ENGINE_REQUIRED | CHECKOUT_ENGINE_V19 | Validated v19 engine production source |
| `packages/engine/src/sessionSetTimer.ts` | D | ENGINE_REQUIRED | CHECKOUT_ENGINE_V19 | Validated v19 engine production source |
| `packages/engine/tests/unit/_helpers/dumbbellTestTitles.ts` | A | ENGINE_TEST | CHECKOUT_ENGINE_V19 | Engine unit/integration tests from ENGINE_V19 |
| `packages/engine/tests/unit/_helpers/expectedCounts.ts` | M | ENGINE_TEST | CHECKOUT_ENGINE_V19 | Engine unit/integration tests from ENGINE_V19 |
| `packages/engine/tests/unit/_helpers/higherFrequencyPersonaReviewHelpers.ts` | M | ENGINE_TEST | CHECKOUT_ENGINE_V19 | Engine unit/integration tests from ENGINE_V19 |
| `packages/engine/tests/unit/_helpers/phaseProgressionQuality.ts` | M | ENGINE_TEST | CHECKOUT_ENGINE_V19 | Engine unit/integration tests from ENGINE_V19 |
| `packages/engine/tests/unit/_helpers/threeDayPersonaReviewHelpers.ts` | M | ENGINE_TEST | CHECKOUT_ENGINE_V19 | Engine unit/integration tests from ENGINE_V19 |
| `packages/engine/tests/unit/atHomeCompositionSequencing.test.ts` | A | ENGINE_TEST | CHECKOUT_ENGINE_V19 | Engine unit/integration tests from ENGINE_V19 |
| `packages/engine/tests/unit/canonicalFuzzCasesParity.test.ts` | A | ENGINE_TEST | CHECKOUT_ENGINE_V19 | Engine unit/integration tests from ENGINE_V19 |
| `packages/engine/tests/unit/catalogLadderInvariants.test.ts` | M | ENGINE_TEST | CHECKOUT_ENGINE_V19 | Engine unit/integration tests from ENGINE_V19 |
| `packages/engine/tests/unit/competitiveBenchmark.test.ts` | M | ENGINE_TEST | CHECKOUT_ENGINE_V19 | Engine unit/integration tests from ENGINE_V19 |
| `packages/engine/tests/unit/dualModeTimerSingleWriter.test.ts` | D | ENGINE_TEST | CHECKOUT_ENGINE_V19 | Engine unit/integration tests from ENGINE_V19 |
| `packages/engine/tests/unit/engineProgramEntry.test.ts` | M | ENGINE_TEST | CHECKOUT_ENGINE_V19 | Engine unit/integration tests from ENGINE_V19 |
| `packages/engine/tests/unit/fuzzIntegrityMetamorphic.test.ts` | A | ENGINE_TEST | CHECKOUT_ENGINE_V19 | Engine unit/integration tests from ENGINE_V19 |
| `packages/engine/tests/unit/mergeReadinessAnchors.test.ts` | M | ENGINE_TEST | CHECKOUT_ENGINE_V19 | Engine unit/integration tests from ENGINE_V19 |
| `packages/engine/tests/unit/phase7CompletionCoveragePolicy.test.ts` | A | ENGINE_TEST | CHECKOUT_ENGINE_V19 | Engine unit/integration tests from ENGINE_V19 |
| `packages/engine/tests/unit/phase7bFinalQualityClosure.test.ts` | A | ENGINE_TEST | CHECKOUT_ENGINE_V19 | Engine unit/integration tests from ENGINE_V19 |
| `packages/engine/tests/unit/program.test.ts` | M | ENGINE_TEST | CHECKOUT_ENGINE_V19 | Engine unit/integration tests from ENGINE_V19 |
| `packages/engine/tests/unit/programBackChestContract.test.ts` | M | ENGINE_TEST | CHECKOUT_ENGINE_V19 | Engine unit/integration tests from ENGINE_V19 |
| `packages/engine/tests/unit/programBandContract.test.ts` | A | ENGINE_TEST | CHECKOUT_ENGINE_V19 | Engine unit/integration tests from ENGINE_V19 |
| `packages/engine/tests/unit/programBodyweightContract.test.ts` | A | ENGINE_TEST | CHECKOUT_ENGINE_V19 | Engine unit/integration tests from ENGINE_V19 |
| `packages/engine/tests/unit/programControlledVariety.test.ts` | M | ENGINE_TEST | CHECKOUT_ENGINE_V19 | Engine unit/integration tests from ENGINE_V19 |
| `packages/engine/tests/unit/programControlledVarietyRefinement.test.ts` | M | ENGINE_TEST | CHECKOUT_ENGINE_V19 | Engine unit/integration tests from ENGINE_V19 |
| `packages/engine/tests/unit/programDumbbellContract.test.ts` | A | ENGINE_TEST | CHECKOUT_ENGINE_V19 | Engine unit/integration tests from ENGINE_V19 |
| `packages/engine/tests/unit/programEnvironmentEligibility.test.ts` | M | ENGINE_TEST | CHECKOUT_ENGINE_V19 | Engine unit/integration tests from ENGINE_V19 |
| `packages/engine/tests/unit/programEquipmentMode.test.ts` | A | ENGINE_TEST | CHECKOUT_ENGINE_V19 | Engine unit/integration tests from ENGINE_V19 |
| `packages/engine/tests/unit/programExerciseCoachingCompleteness.test.ts` | A | ENGINE_TEST | CHECKOUT_ENGINE_V19 | Engine unit/integration tests from ENGINE_V19 |
| `packages/engine/tests/unit/programFuzz.test.ts` | M | ENGINE_TEST | CHECKOUT_ENGINE_V19 | Engine unit/integration tests from ENGINE_V19 |
| `packages/engine/tests/unit/programGoldenAnchors.test.ts` | M | ENGINE_TEST | CHECKOUT_ENGINE_V19 | Engine unit/integration tests from ENGINE_V19 |
| `packages/engine/tests/unit/programGymContract.test.ts` | A | ENGINE_TEST | CHECKOUT_ENGINE_V19 | Engine unit/integration tests from ENGINE_V19 |
| `packages/engine/tests/unit/programHigherFrequencyAcceptance.test.ts` | M | ENGINE_TEST | CHECKOUT_ENGINE_V19 | Engine unit/integration tests from ENGINE_V19 |
| `packages/engine/tests/unit/programHigherFrequencyContracts.test.ts` | M | ENGINE_TEST | CHECKOUT_ENGINE_V19 | Engine unit/integration tests from ENGINE_V19 |
| `packages/engine/tests/unit/programIdentityAnchors.test.ts` | M | ENGINE_TEST | CHECKOUT_ENGINE_V19 | Engine unit/integration tests from ENGINE_V19 |
| `packages/engine/tests/unit/programMatrix.test.ts` | M | ENGINE_TEST | CHECKOUT_ENGINE_V19 | Engine unit/integration tests from ENGINE_V19 |
| `packages/engine/tests/unit/programMixedHomeContract.test.ts` | A | ENGINE_TEST | CHECKOUT_ENGINE_V19 | Engine unit/integration tests from ENGINE_V19 |
| `packages/engine/tests/unit/programPresentationCapabilityReload.test.ts` | A | ENGINE_TEST | CHECKOUT_ENGINE_V19 | Engine unit/integration tests from ENGINE_V19 |
| `packages/engine/tests/unit/programPresentationContinuity.test.ts` | A | ENGINE_TEST | CHECKOUT_ENGINE_V19 | Engine unit/integration tests from ENGINE_V19 |
| `packages/engine/tests/unit/programPresentationContract.test.ts` | A | ENGINE_TEST | CHECKOUT_ENGINE_V19 | Engine unit/integration tests from ENGINE_V19 |
| `packages/engine/tests/unit/programPresentationNoValidSwap.test.ts` | A | ENGINE_TEST | CHECKOUT_ENGINE_V19 | Engine unit/integration tests from ENGINE_V19 |
| `packages/engine/tests/unit/programPresentationPainSwap.test.ts` | A | ENGINE_TEST | CHECKOUT_ENGINE_V19 | Engine unit/integration tests from ENGINE_V19 |
| `packages/engine/tests/unit/programPresentationPersistenceRoundTrip.test.ts` | A | ENGINE_TEST | CHECKOUT_ENGINE_V19 | Engine unit/integration tests from ENGINE_V19 |
| `packages/engine/tests/unit/programPresentationPhotoFocus.test.ts` | A | ENGINE_TEST | CHECKOUT_ENGINE_V19 | Engine unit/integration tests from ENGINE_V19 |
| `packages/engine/tests/unit/programQuality.test.ts` | M | ENGINE_TEST | CHECKOUT_ENGINE_V19 | Engine unit/integration tests from ENGINE_V19 |
| `packages/engine/tests/unit/programQualityGate.test.ts` | A | ENGINE_TEST | CHECKOUT_ENGINE_V19 | Engine unit/integration tests from ENGINE_V19 |
| `packages/engine/tests/unit/programRoleTruth.test.ts` | M | ENGINE_TEST | CHECKOUT_ENGINE_V19 | Engine unit/integration tests from ENGINE_V19 |
| `packages/engine/tests/unit/programSelectionAudit.test.ts` | M | ENGINE_TEST | CHECKOUT_ENGINE_V19 | Engine unit/integration tests from ENGINE_V19 |
| `packages/engine/tests/unit/programShouldersArmsDay2Contract.test.ts` | M | ENGINE_TEST | CHECKOUT_ENGINE_V19 | Engine unit/integration tests from ENGINE_V19 |
| `packages/engine/tests/unit/programSplitContractRepair.test.ts` | M | ENGINE_TEST | CHECKOUT_ENGINE_V19 | Engine unit/integration tests from ENGINE_V19 |
| `packages/engine/tests/unit/programThreeDayCoachPolicy.test.ts` | M | ENGINE_TEST | CHECKOUT_ENGINE_V19 | Engine unit/integration tests from ENGINE_V19 |
| `packages/engine/tests/unit/programWarmupContracts.test.ts` | M | ENGINE_TEST | CHECKOUT_ENGINE_V19 | Engine unit/integration tests from ENGINE_V19 |
| `packages/engine/tests/unit/recoverProgramQualityBlocks.test.ts` | A | ENGINE_TEST | CHECKOUT_ENGINE_V19 | Engine unit/integration tests from ENGINE_V19 |
| `packages/engine/tests/unit/scenarioMatrix.test.ts` | M | ENGINE_TEST | CHECKOUT_ENGINE_V19 | Engine unit/integration tests from ENGINE_V19 |
| `packages/engine/tests/unit/sessionSetTimer.test.ts` | D | ENGINE_TEST | CHECKOUT_ENGINE_V19 | Engine unit/integration tests from ENGINE_V19 |
| `packages/engine/tests/unit/slotDegradationContract.test.ts` | M | ENGINE_TEST | CHECKOUT_ENGINE_V19 | Engine unit/integration tests from ENGINE_V19 |
| `packages/engine/tests/unit/warmupContract.test.ts` | M | ENGINE_TEST | CHECKOUT_ENGINE_V19 | Engine unit/integration tests from ENGINE_V19 |
| `packages/engine/tests/unit/warmupDegradation.test.ts` | M | ENGINE_TEST | CHECKOUT_ENGINE_V19 | Engine unit/integration tests from ENGINE_V19 |
| `packages/engine/tests/unit/warmupProtectiveInjection.test.ts` | M | ENGINE_TEST | CHECKOUT_ENGINE_V19 | Engine unit/integration tests from ENGINE_V19 |

## Transplant plan (next)

1. `git checkout ENGINE_V19 -- packages/engine`
2. Selective root `package.json` audit scripts + `test:critical` update
3. Checkout engine audit docs under `docs/dev-reports` + `docs/PROGRAM_EQUIPMENT_EXPERIENCE_V2.md`
4. Keep all `apps/**` from LIVE_MAIN unless compile forces a minimal receiver
5. Do not import checkpoint/Phase8 UI

