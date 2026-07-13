# Engine Public API — `@praxis/engine`

Generated: Phase 1 Day 1 (2026-07-12). Every export is a conscious decision.
Barrel source: `packages/engine/src/index.ts`.
Enforcement: ESLint `no-restricted-imports` (active from Phase 1 Day 3).

---

## Module groups

### Core types (`./types`, `./authTypes`)

| Export origin | Why exported |
|---|---|
| `types.ts` | All shared domain types (ProgramDay, Exercise, Phase, etc.) consumed by every consumer page and component. |
| `authTypes.ts` | Session and user types used in API routes and middleware. |

### Program generation (`./program`, `./programProgress`, `./programVariationClient`, `./progression`)

| Export origin | Why exported |
|---|---|
| `program.ts` | `generateProgram`, `repairProgram` — the core engine entry points, called by questionnaire flow and results bootstrap. |
| `programProgress.ts` | Phase-progress calculations used in results and dashboard. |
| `programVariationClient.ts` | Client-side variation helpers used by session and program pages. |
| `progression.ts` | `canAdvancePhase`, `deriveAdaptationMode` — phase-gate checks consumed by results page. |

### Exercise catalog & equipment (`./exercises`, `./exerciseCatalog`, `./equipment`)

| Export origin | Why exported |
|---|---|
| `exercises.ts` | Exercise catalog array and lookup helpers (`exerciseById`, `inferPainContraindications…`). |
| `exerciseCatalog.ts` | Validator and catalog invariant helpers; also used by catalog tests. |
| `equipment.ts` | Equipment normalisation and set helpers used by questionnaire and program pages. |

### Assessment & pose analysis (`./assessmentEngine`, `./poseAnalyzer`, `./engine`)

| Export origin | Why exported |
|---|---|
| `assessmentEngine.ts` | `runAssessment` — called by assessment page and results bootstrap. |
| `poseAnalyzer.ts` | `analyzePose`, `PoseResult` — called by assessment page. |
| `engine/index.ts` (re-exports: `engine.ts`, `poseFocus.ts`, `engineTypes.ts`, …) | Full engine runtime: `createEngineSession`, `ExerciseFeedbackSummary`, pose-focus derivation, constraint evaluation. |

### Phase lifecycle (`./phases`, `./phaseGating`, `./phaseControls`)

| Export origin | Why exported |
|---|---|
| `phases.ts` | Phase definitions and phase-index helpers. |
| `phaseGating.ts` | `checkPhaseGate`, `resolvePhaseEligibility` — used by results and session pages. |
| `phaseControls.ts` | Manual phase-skip/reset controls used by settings and results page. |

### Session & feedback (`./sessionFeedback`, `./sessionFeedbackSignals`, `./sessionAdaptationPreview`, `./sessionPracticeOptions`, `./sessionDraftStore`, `./sessionStore`)

| Export origin | Why exported |
|---|---|
| `sessionFeedback.ts` | Feedback summarisation helpers consumed by session components. |
| `sessionFeedbackSignals.ts` | `SessionFeedbackSignals` type and signal constructors. |
| `sessionAdaptationPreview.ts` | Preview helpers for in-session adaptation UI. |
| `sessionPracticeOptions.ts` | Practice-mode option generators for session client. |
| `sessionDraftStore.ts` | In-progress session draft persistence (IndexedDB/local). |
| `sessionStore.ts` | Completed session log store. |

### Stores & persistence (`./logStore`, `./photoStore`, `./appState`)

| Export origin | Why exported |
|---|---|
| `logStore.ts` | Exercise log read/write — used by session, progress, results, and settings pages. |
| `photoStore.ts` | Photo blob store for pose assessment; used by assessment and results pages. |
| `appState.ts` | App-wide state (questionnaire, program ref, phase) — used by most consumer pages. |

### Training sync (`./trainingStateModel`, `./trainingStoreConfig`, `./trainingStoreDb`, `./trainingSyncClient`, `./trainingSyncDebug`, `./useTrainingSyncStatus`)

| Export origin | Why exported |
|---|---|
| `trainingStateModel.ts` | Cloud-sync state model and merge logic. |
| `trainingStoreConfig.ts` | Sync configuration constants. |
| `trainingStoreDb.ts` | Database helpers for cloud-sync writes. |
| `trainingSyncClient.ts` | `syncTrainingState` — called by results bootstrap and session page. |
| `trainingSyncDebug.ts` | Debug helpers; consumer uses them in dev/settings page. |
| `useTrainingSyncStatus.ts` | React hook for sync status indicator in AppMenu. |

### Auth, user, server utilities (`./authToken`, `./adminAuth`, `./serverAuth`, `./userRepository`, `./rateLimit`, `./runtimeEnv`)

| Export origin | Why exported |
|---|---|
| `authToken.ts` | `signSessionToken`, `verifySessionToken` — used by auth API routes and middleware. |
| `adminAuth.ts` | Admin session verification used by admin API route and middleware. |
| `serverAuth.ts` | `readServerSession` — used by server components and API routes. |
| `userRepository.ts` | `getUserRepository`, user CRUD — used by auth and account API routes. |
| `rateLimit.ts` | `takeRateLimit` — used by auth and admin API routes. |
| `runtimeEnv.ts` | `requireEnv`, env-var type helpers — used across API routes and server components. |

### Stripe / billing (`./stripeServer`, `./stripeWebhookLogic`)

| Export origin | Why exported |
|---|---|
| `stripeServer.ts` | Stripe client initialisation and webhook verification. |
| `stripeWebhookLogic.ts` | Pure webhook event handlers (deterministic, testable); used by billing webhook route. |

### UI-layer logic helpers (`./historyView`, `./insightGenerator`, `./nextSessionRecommendation`, `./questionnaireSignature`, `./timerRules`, `./telemetry`, `./resetAppData`)

| Export origin | Why exported |
|---|---|
| `historyView.ts` | Progress and history view computation used by progress page. |
| `insightGenerator.ts` | `generateInsights` — used by dashboard insight card. |
| `nextSessionRecommendation.ts` | Next-session date/recommendation logic for results and dashboard. |
| `questionnaireSignature.ts` | Questionnaire hash helpers used by results bootstrap and questionnaire page. |
| `timerRules.ts` | Timer-interval rules consumed by session timer component. |
| `telemetry.ts` | Event logging helpers used by session and assessment pages. |
| `resetAppData.ts` | `resetAllAppData` — used by settings page. |

---

## Out of barrel (intentionally not exported)

| Module | Reason |
|---|---|
| `seededRng.ts` | Engine-internal only; no consumer direct use. |
| `adaptiveProgramConfig.ts` | Internal program config; not a public contract. |
| `adaptiveProgramIntent.ts` | Internal intent resolution; not a public contract. |
| `routine.ts` | Internal routine builder; consumer sees `ProgramDay` shape only. |
| `movementProfile.ts` | Internal scoring; not consumed by consumer directly. |
| `tags.ts` | Internal tag constants; referenced via typed fields in exported types. |
| `cloudLogStore.ts` | Internal sync layer; exposed via `trainingSyncClient`. |
| `sessionAdaptation.ts` | Internal adaptation engine; exposed via `sessionAdaptationPreview`. |
| `phaseObjectives.ts` | Internal objectives; referenced via exported phase types. |
| `phaseOptimizer.ts` | Internal optimizer; not a public contract. |
| `continueCta.ts` | Internal CTA helper; not consumed by consumer directly. |
| `engine/` internals | Exported via `engine/index.ts` group above. |
| `program/` internals | Exported via `program.ts` group above. |
| `__debug__/` | Dev-only audit scripts; never a consumer dependency. |
| `debug/` | Dev-only audit scripts; never a consumer dependency. |
| `mediapipePoseShim.js` | Browser-only shim; loaded dynamically, not imported. |
| `userStore.ts`, `userStoreDb.ts`, `userStoreMemory.ts` | Used via `userRepository.ts` abstraction; not a public contract. |
