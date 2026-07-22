# Phase 1 Move-Purity Report

Generated: 2026-07-13T06:45:41.046Z
Pre-monorepo tag: `pre-monorepo` (600bbdd8bb9ee2e828970703e498d56efc97df82)
Gyms subtree-add commit: `8f26f91`

## Summary

| Verdict | Count |
|---------|-------|
| IDENTICAL | 214 |
| JUSTIFIED | 5 |
| NEW (no pre-monorepo counterpart) | 1 |
| DIVERGED (failure) | 0 |

**Verdict: PASS — 100% identical-or-justified. No unexplained divergences.**

## Justified divergences (transport fixes, individually reviewed)

- `packages/engine/src/authToken.ts`: as BufferSource cast added — TypeScript 5.x Uint8Array<ArrayBufferLike> vs BufferSource strict-generic fix; no behavior change.
- `packages/engine/src/exercises.ts`: Three experienceMin: "advanced" corrected to "Advanced" to match ExperienceLevel enum casing; data fix, no behavior change.
- `apps/gyms/package.json`: Workspace scaffold replacement: @praxis/gyms package.json, tsconfig (extends tsconfig.base.json + monorepo paths), vitest.config.ts (root pinned, alias to engine). Infrastructure change, not app-shell business logic.
- `apps/gyms/tsconfig.json`: Workspace scaffold replacement: @praxis/gyms package.json, tsconfig (extends tsconfig.base.json + monorepo paths), vitest.config.ts (root pinned, alias to engine). Infrastructure change, not app-shell business logic.
- `apps/gyms/vitest.config.ts`: Workspace scaffold replacement: @praxis/gyms package.json, tsconfig (extends tsconfig.base.json + monorepo paths), vitest.config.ts (root pinned, alias to engine). Infrastructure change, not app-shell business logic.

## New files (introduced in Phase 1, no pre-monorepo counterpart)

- `packages/engine/src/index.ts`: Barrel — introduced in Phase 1 Day 1; no pre-monorepo counterpart.

## Full file list

| File | Verdict |
|------|---------|
| `apps/gyms/package.json` | JUSTIFIED |
| `apps/gyms/src/app/account/billing/page.tsx` | IDENTICAL |
| `apps/gyms/src/app/account/settings/page.tsx` | IDENTICAL |
| `apps/gyms/src/app/admin/access/page.tsx` | IDENTICAL |
| `apps/gyms/src/app/api/admin/access/route.ts` | IDENTICAL |
| `apps/gyms/src/app/api/auth/login/route.ts` | IDENTICAL |
| `apps/gyms/src/app/api/auth/logout/route.ts` | IDENTICAL |
| `apps/gyms/src/app/api/auth/register/route.ts` | IDENTICAL |
| `apps/gyms/src/app/api/auth/session/route.ts` | IDENTICAL |
| `apps/gyms/src/app/api/billing/checkout-session/route.ts` | IDENTICAL |
| `apps/gyms/src/app/api/billing/portal-session/route.ts` | IDENTICAL |
| `apps/gyms/src/app/api/billing/status/route.ts` | IDENTICAL |
| `apps/gyms/src/app/api/billing/webhook/route.ts` | IDENTICAL |
| `apps/gyms/src/app/api/gym-admin/signals/route.ts` | IDENTICAL |
| `apps/gyms/src/app/api/subscription/redeem/route.ts` | IDENTICAL |
| `apps/gyms/src/app/api/training/state/route.ts` | IDENTICAL |
| `apps/gyms/src/app/apple-icon.png` | IDENTICAL |
| `apps/gyms/src/app/assessment/page.tsx` | IDENTICAL |
| `apps/gyms/src/app/auth/login/LoginClient.tsx` | IDENTICAL |
| `apps/gyms/src/app/auth/login/page.tsx` | IDENTICAL |
| `apps/gyms/src/app/auth/signup/page.tsx` | IDENTICAL |
| `apps/gyms/src/app/auth/signup/SignupClient.tsx` | IDENTICAL |
| `apps/gyms/src/app/enterprise/page.tsx` | IDENTICAL |
| `apps/gyms/src/app/exercise/[id]/page.tsx` | IDENTICAL |
| `apps/gyms/src/app/globals.css` | IDENTICAL |
| `apps/gyms/src/app/gym-admin/dashboard/page.tsx` | IDENTICAL |
| `apps/gyms/src/app/gym-admin/page.tsx` | IDENTICAL |
| `apps/gyms/src/app/gym-admin/setup/page.tsx` | IDENTICAL |
| `apps/gyms/src/app/gym-admin/signals/[signalId]/page.tsx` | IDENTICAL |
| `apps/gyms/src/app/gym-demo/admin/page.tsx` | IDENTICAL |
| `apps/gyms/src/app/gym-demo/member/page.tsx` | IDENTICAL |
| `apps/gyms/src/app/gym-demo/page.tsx` | IDENTICAL |
| `apps/gyms/src/app/gym-demo/start/DemoStartClient.tsx` | IDENTICAL |
| `apps/gyms/src/app/gym-demo/start/page.tsx` | IDENTICAL |
| `apps/gyms/src/app/icon.png` | IDENTICAL |
| `apps/gyms/src/app/layout.tsx` | IDENTICAL |
| `apps/gyms/src/app/offline/page.tsx` | IDENTICAL |
| `apps/gyms/src/app/page.tsx` | IDENTICAL |
| `apps/gyms/src/app/pilot/page.tsx` | IDENTICAL |
| `apps/gyms/src/app/program/[programId]/day/[dayIndex]/page.tsx` | IDENTICAL |
| `apps/gyms/src/app/progress/page.tsx` | IDENTICAL |
| `apps/gyms/src/app/questionnaire/page.tsx` | IDENTICAL |
| `apps/gyms/src/app/results/page.tsx` | IDENTICAL |
| `apps/gyms/src/app/session/page.tsx` | IDENTICAL |
| `apps/gyms/src/app/session/SessionClient.tsx` | IDENTICAL |
| `apps/gyms/src/app/settings/page.tsx` | IDENTICAL |
| `apps/gyms/src/components/AppMenu.tsx` | IDENTICAL |
| `apps/gyms/src/components/AppMenuClient.tsx` | IDENTICAL |
| `apps/gyms/src/components/AuthControls.tsx` | IDENTICAL |
| `apps/gyms/src/components/BackgroundShell.tsx` | IDENTICAL |
| `apps/gyms/src/components/ContinueProgramCTA.tsx` | IDENTICAL |
| `apps/gyms/src/components/dashboard/DailyInsightCard.tsx` | IDENTICAL |
| `apps/gyms/src/components/dashboard/DashboardHero.tsx` | IDENTICAL |
| `apps/gyms/src/components/dashboard/DashboardModeCard.tsx` | IDENTICAL |
| `apps/gyms/src/components/dashboard/ExpandableSection.tsx` | IDENTICAL |
| `apps/gyms/src/components/dashboard/PhaseProgressCard.tsx` | IDENTICAL |
| `apps/gyms/src/components/dashboard/ProgressSummary.tsx` | IDENTICAL |
| `apps/gyms/src/components/dashboard/ReadinessIndicator.tsx` | IDENTICAL |
| `apps/gyms/src/components/DualModeTimer.tsx` | IDENTICAL |
| `apps/gyms/src/components/ExerciseCard.tsx` | IDENTICAL |
| `apps/gyms/src/components/ExerciseHistory.tsx` | IDENTICAL |
| `apps/gyms/src/components/gym-admin/BrowserDemoSignalsPanel.tsx` | IDENTICAL |
| `apps/gyms/src/components/gym-demo/B2BIcon.tsx` | IDENTICAL |
| `apps/gyms/src/components/gym-demo/GymDemoHeader.tsx` | IDENTICAL |
| `apps/gyms/src/components/InstallApp.tsx` | IDENTICAL |
| `apps/gyms/src/components/ManageSubscriptionButton.tsx` | IDENTICAL |
| `apps/gyms/src/components/onboarding/onboardingConfig.ts` | IDENTICAL |
| `apps/gyms/src/components/onboarding/OnboardingInfoButton.tsx` | IDENTICAL |
| `apps/gyms/src/components/OnImage.tsx` | IDENTICAL |
| `apps/gyms/src/components/PhotoContext.tsx` | IDENTICAL |
| `apps/gyms/src/components/PhotoUploader.tsx` | IDENTICAL |
| `apps/gyms/src/components/ProgramReferenceCard.tsx` | IDENTICAL |
| `apps/gyms/src/components/progress/AnimatedCount.tsx` | IDENTICAL |
| `apps/gyms/src/components/progress/ImprovementInsights.tsx` | IDENTICAL |
| `apps/gyms/src/components/progress/PerformanceOverview.tsx` | IDENTICAL |
| `apps/gyms/src/components/progress/RankedTopMovements.tsx` | IDENTICAL |
| `apps/gyms/src/components/progress/RecentPrList.tsx` | IDENTICAL |
| `apps/gyms/src/components/QuestionnaireForm.tsx` | IDENTICAL |
| `apps/gyms/src/components/results/AccountModePanel.tsx` | IDENTICAL |
| `apps/gyms/src/components/results/InsightsPanel.tsx` | IDENTICAL |
| `apps/gyms/src/components/results/PhaseProgressionSection.tsx` | IDENTICAL |
| `apps/gyms/src/components/results/programDashboardSelectors.ts` | IDENTICAL |
| `apps/gyms/src/components/results/usePoseAssessment.ts` | IDENTICAL |
| `apps/gyms/src/components/results/useProgramGenerationReconciliation.ts` | IDENTICAL |
| `apps/gyms/src/components/results/useResultsBootstrap.ts` | IDENTICAL |
| `apps/gyms/src/components/results/useResultsHistoryProgress.ts` | IDENTICAL |
| `apps/gyms/src/components/results/WeekViewPanel.tsx` | IDENTICAL |
| `apps/gyms/src/components/ResultsRoutine.tsx` | IDENTICAL |
| `apps/gyms/src/components/ResumeSessionBanner.tsx` | IDENTICAL |
| `apps/gyms/src/components/RoutineItemCoachingDetails.tsx` | IDENTICAL |
| `apps/gyms/src/components/ServiceWorkerRegister.tsx` | IDENTICAL |
| `apps/gyms/src/components/session/SessionFeedbackCheckIn.tsx` | IDENTICAL |
| `apps/gyms/src/components/session/SessionProgressHeader.tsx` | IDENTICAL |
| `apps/gyms/src/components/ui/Button.tsx` | IDENTICAL |
| `apps/gyms/src/components/ui/buttonStyles.ts` | IDENTICAL |
| `apps/gyms/src/components/ui/ProgressBar.tsx` | IDENTICAL |
| `apps/gyms/src/components/UpgradePrompt.tsx` | IDENTICAL |
| `apps/gyms/src/lib/gymSaas/demoData.ts` | IDENTICAL |
| `apps/gyms/src/lib/gymSaas/demoMode.ts` | IDENTICAL |
| `apps/gyms/src/lib/gymSaas/gymConfig.ts` | IDENTICAL |
| `apps/gyms/src/lib/gymSaas/operatorSignalFixtures.ts` | IDENTICAL |
| `apps/gyms/src/lib/gymSaas/operatorSignals.ts` | IDENTICAL |
| `apps/gyms/src/lib/gymSaas/sessionSignalAdapter.ts` | IDENTICAL |
| `apps/gyms/src/lib/gymSaas/trainerHandoff.ts` | IDENTICAL |
| `apps/gyms/tsconfig.json` | JUSTIFIED |
| `apps/gyms/vitest.config.ts` | JUSTIFIED |
| `packages/engine/src/__debug__/catalogAudit.ts` | IDENTICAL |
| `packages/engine/src/__debug__/coverageContractAudit.ts` | IDENTICAL |
| `packages/engine/src/__debug__/decisionTraceAudit.ts` | IDENTICAL |
| `packages/engine/src/__debug__/engineMatrixTest.ts` | IDENTICAL |
| `packages/engine/src/__debug__/exerciseCatalogValidationSmoke.ts` | IDENTICAL |
| `packages/engine/src/__debug__/higherFrequencyPersonaReview.ts` | IDENTICAL |
| `packages/engine/src/__debug__/noEquipmentMainsSmoke.ts` | IDENTICAL |
| `packages/engine/src/__debug__/painPolicySmoke.ts` | IDENTICAL |
| `packages/engine/src/__debug__/phaseEligibilitySmoke.ts` | IDENTICAL |
| `packages/engine/src/__debug__/phaseMatrixProgramPrint.ts` | IDENTICAL |
| `packages/engine/src/__debug__/photoNamespaceSmoke.ts` | IDENTICAL |
| `packages/engine/src/__debug__/poseFocusSelectionSmoke.ts` | IDENTICAL |
| `packages/engine/src/__debug__/printProgram.ts` | IDENTICAL |
| `packages/engine/src/__debug__/programContractAudit.ts` | IDENTICAL |
| `packages/engine/src/__debug__/programContractSummary.ts` | IDENTICAL |
| `packages/engine/src/__debug__/programSelectionAudit.ts` | IDENTICAL |
| `packages/engine/src/__debug__/progressionCoachSmoke.ts` | IDENTICAL |
| `packages/engine/src/__debug__/splitTemplateSmoke.ts` | IDENTICAL |
| `packages/engine/src/__debug__/storeIntegritySmoke.ts` | IDENTICAL |
| `packages/engine/src/__debug__/threeDayPersonaReview.ts` | IDENTICAL |
| `packages/engine/src/adaptiveProgramConfig.ts` | IDENTICAL |
| `packages/engine/src/adaptiveProgramIntent.ts` | IDENTICAL |
| `packages/engine/src/adminAuth.ts` | IDENTICAL |
| `packages/engine/src/appState.ts` | IDENTICAL |
| `packages/engine/src/assessmentEngine.ts` | IDENTICAL |
| `packages/engine/src/authToken.ts` | JUSTIFIED |
| `packages/engine/src/authTypes.ts` | IDENTICAL |
| `packages/engine/src/cloudLogStore.ts` | IDENTICAL |
| `packages/engine/src/continueCta.ts` | IDENTICAL |
| `packages/engine/src/debug/curriculumAudit.ts` | IDENTICAL |
| `packages/engine/src/debug/storeIntegrityAudit.ts` | IDENTICAL |
| `packages/engine/src/engine/constraints.ts` | IDENTICAL |
| `packages/engine/src/engine/curriculum.ts` | IDENTICAL |
| `packages/engine/src/engine/engine.ts` | IDENTICAL |
| `packages/engine/src/engine/engineAdapter.ts` | IDENTICAL |
| `packages/engine/src/engine/engineTypes.ts` | IDENTICAL |
| `packages/engine/src/engine/equipmentCapability.ts` | IDENTICAL |
| `packages/engine/src/engine/index.ts` | IDENTICAL |
| `packages/engine/src/engine/poseFocus.ts` | IDENTICAL |
| `packages/engine/src/equipment.ts` | IDENTICAL |
| `packages/engine/src/exerciseCatalog.ts` | IDENTICAL |
| `packages/engine/src/exercises.ts` | JUSTIFIED |
| `packages/engine/src/historyView.ts` | IDENTICAL |
| `packages/engine/src/index.ts` | NEW |
| `packages/engine/src/insightGenerator.ts` | IDENTICAL |
| `packages/engine/src/logStore.ts` | IDENTICAL |
| `packages/engine/src/mediapipePoseShim.js` | IDENTICAL |
| `packages/engine/src/movementProfile.ts` | IDENTICAL |
| `packages/engine/src/nextSessionRecommendation.ts` | IDENTICAL |
| `packages/engine/src/phaseControls.ts` | IDENTICAL |
| `packages/engine/src/phaseGating.ts` | IDENTICAL |
| `packages/engine/src/phaseObjectives.ts` | IDENTICAL |
| `packages/engine/src/phaseOptimizer.ts` | IDENTICAL |
| `packages/engine/src/phases.ts` | IDENTICAL |
| `packages/engine/src/photoStore.ts` | IDENTICAL |
| `packages/engine/src/poseAnalyzer.ts` | IDENTICAL |
| `packages/engine/src/program.ts` | IDENTICAL |
| `packages/engine/src/program/accessoryPlanner.ts` | IDENTICAL |
| `packages/engine/src/program/coverageAudit.ts` | IDENTICAL |
| `packages/engine/src/program/dayTemplates.ts` | IDENTICAL |
| `packages/engine/src/program/decisionTrace.ts` | IDENTICAL |
| `packages/engine/src/program/generationObservability.ts` | IDENTICAL |
| `packages/engine/src/program/higherFrequencyCoachPolicy.ts` | IDENTICAL |
| `packages/engine/src/program/postGenerationPipeline.ts` | IDENTICAL |
| `packages/engine/src/program/prescriptionRationale.ts` | IDENTICAL |
| `packages/engine/src/program/programAssembly.ts` | IDENTICAL |
| `packages/engine/src/program/programFinalization.ts` | IDENTICAL |
| `packages/engine/src/program/programVariationMemory.ts` | IDENTICAL |
| `packages/engine/src/program/progressionExecution.ts` | IDENTICAL |
| `packages/engine/src/program/progressionPipelineAdapters.ts` | IDENTICAL |
| `packages/engine/src/program/progressionTransition.ts` | IDENTICAL |
| `packages/engine/src/program/quotaRegistry.ts` | IDENTICAL |
| `packages/engine/src/program/selectionScore.ts` | IDENTICAL |
| `packages/engine/src/program/splitTemplatePolicy.ts` | IDENTICAL |
| `packages/engine/src/program/threeDayCoachPolicy.ts` | IDENTICAL |
| `packages/engine/src/program/variationRuntime.ts` | IDENTICAL |
| `packages/engine/src/program/warmupContracts.ts` | IDENTICAL |
| `packages/engine/src/program/warmupLibrary.ts` | IDENTICAL |
| `packages/engine/src/program/warmupPlanner.ts` | IDENTICAL |
| `packages/engine/src/program/weeklyExecution.ts` | IDENTICAL |
| `packages/engine/src/program/weeklyPipelineAdapters.ts` | IDENTICAL |
| `packages/engine/src/programProgress.ts` | IDENTICAL |
| `packages/engine/src/programVariationClient.ts` | IDENTICAL |
| `packages/engine/src/progression.ts` | IDENTICAL |
| `packages/engine/src/questionnaireSignature.ts` | IDENTICAL |
| `packages/engine/src/rateLimit.ts` | IDENTICAL |
| `packages/engine/src/resetAppData.ts` | IDENTICAL |
| `packages/engine/src/routine.ts` | IDENTICAL |
| `packages/engine/src/runtimeEnv.ts` | IDENTICAL |
| `packages/engine/src/seededRng.ts` | IDENTICAL |
| `packages/engine/src/serverAuth.ts` | IDENTICAL |
| `packages/engine/src/sessionAdaptation.ts` | IDENTICAL |
| `packages/engine/src/sessionAdaptationPreview.ts` | IDENTICAL |
| `packages/engine/src/sessionDraftStore.ts` | IDENTICAL |
| `packages/engine/src/sessionFeedback.ts` | IDENTICAL |
| `packages/engine/src/sessionFeedbackSignals.ts` | IDENTICAL |
| `packages/engine/src/sessionPracticeOptions.ts` | IDENTICAL |
| `packages/engine/src/sessionStore.ts` | IDENTICAL |
| `packages/engine/src/stripeServer.ts` | IDENTICAL |
| `packages/engine/src/stripeWebhookLogic.ts` | IDENTICAL |
| `packages/engine/src/tags.ts` | IDENTICAL |
| `packages/engine/src/telemetry.ts` | IDENTICAL |
| `packages/engine/src/timerRules.ts` | IDENTICAL |
| `packages/engine/src/trainingStateModel.ts` | IDENTICAL |
| `packages/engine/src/trainingStoreConfig.ts` | IDENTICAL |
| `packages/engine/src/trainingStoreDb.ts` | IDENTICAL |
| `packages/engine/src/trainingSyncClient.ts` | IDENTICAL |
| `packages/engine/src/trainingSyncDebug.ts` | IDENTICAL |
| `packages/engine/src/types.ts` | IDENTICAL |
| `packages/engine/src/userRepository.ts` | IDENTICAL |
| `packages/engine/src/userStore.ts` | IDENTICAL |
| `packages/engine/src/userStoreDb.ts` | IDENTICAL |
| `packages/engine/src/userStoreMemory.ts` | IDENTICAL |
| `packages/engine/src/useTrainingSyncStatus.ts` | IDENTICAL |
