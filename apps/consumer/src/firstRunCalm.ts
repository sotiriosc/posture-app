/**
 * Phase 6L Commit 4 — first-run calm gates.
 *
 * Non-essential prompts stay quiet until the user has completed at least one
 * session. Uses the same latch as InstallApp / sessionStore.
 */

export const SESSION_LAST_COMPLETED_AT_KEY = "session_last_completed_at";

export const hasCompletedFirstSession = (): boolean => {
  if (typeof window === "undefined") return false;
  return Boolean(localStorage.getItem(SESSION_LAST_COMPLETED_AT_KEY));
};

/** Session count thresholds for calm gating (documented in docs/first-run-audit-6l.md). */
export const FIRST_RUN_CALM = {
  /** Non-essential prompts (skip checks, maintain asks, retest, weekly nudge). */
  minSessionsForNonEssential: 1,
  /** Product feedback ask on the dashboard. */
  minSessionsForFeedbackPrompt: 5,
} as const;
