/**
 * @praxis/engine — public barrel (Phase 1 v1)
 *
 * Every export here is a conscious decision; rationale in docs/engine-api.md.
 * Apps MUST import from this barrel only — never from deep paths inside the package.
 * Boundary enforced by ESLint no-restricted-imports (Phase 1 Day 3).
 *
 * Engine-internal files may continue to use @/lib/* path aliases via tsconfig;
 * the relative-import codemod is scheduled for Phase 1 Day 2 (engine-internal only).
 */

// ── Core types ────────────────────────────────────────────────────────────────
export * from "./types";
export * from "./authTypes";

// ── Program generation engine ─────────────────────────────────────────────────
export * from "./program";
export * from "./programProgress";
export * from "./programVariationClient";
export * from "./progression";

// ── Exercise catalog & equipment ──────────────────────────────────────────────
export * from "./exercises";
export * from "./exerciseCatalog";
export * from "./equipment";

// ── Assessment & pose analysis ────────────────────────────────────────────────
export * from "./assessmentEngine";
export * from "./poseAnalyzer";
export * from "./engine"; // engine/ subdir (index.ts re-exports engine.ts, poseFocus.ts, …)

// ── Phase lifecycle ───────────────────────────────────────────────────────────
export * from "./phases";
export * from "./phaseGating";
export * from "./phaseControls";

// ── Session & feedback ────────────────────────────────────────────────────────
export * from "./sessionFeedback";
export * from "./sessionFeedbackSignals";
export * from "./sessionAdaptationPreview";
export * from "./sessionPracticeOptions";
export * from "./sessionDraftStore";
export * from "./sessionStore";

// ── Stores & persistence ──────────────────────────────────────────────────────
export * from "./logStore";
export * from "./photoStore";
export * from "./accountIsolation";
export * from "./appState";

// ── Training sync ─────────────────────────────────────────────────────────────
export * from "./trainingStateModel";
export * from "./trainingStoreConfig";
export * from "./trainingStoreDb";
export * from "./trainingSyncClient";
export * from "./trainingSyncDebug";
export * from "./useTrainingSyncStatus";

// ── Auth, user, server utilities ─────────────────────────────────────────────
export * from "./authToken";
export * from "./adminAuth";
export * from "./serverAuth";
export * from "./userRepository";
export * from "./rateLimit";
export * from "./runtimeEnv";

// ── Stripe / billing ─────────────────────────────────────────────────────────
export * from "./stripeServer";
export * from "./stripeWebhookLogic";

// ── UI-layer logic (shared helpers consumed by consumer components) ────────────
export * from "./historyView";
export * from "./insightGenerator";
export * from "./nextSessionRecommendation";
export * from "./questionnaireSignature";
export * from "./timerRules";
export * from "./telemetry";
export * from "./resetAppData";
