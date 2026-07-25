/**
 * Phase 6j Commit 1 — Freemium Option B (first-week-generous).
 *
 * Free users get full access to their first generated week; after that week
 * completes, only Day 1 remains unlocked. Pro (and auth-disabled / demo)
 * always has full access.
 *
 * Single source for gating decisions — apps must not duplicate this logic.
 */

export const FIRST_WEEK_UPGRADE_COPY =
  "You've completed your first week with Praxis. Upgrade to Pro to continue with Days 2–4 and every week after.";

export const FIRST_WEEK_IN_PROGRESS_COPY =
  "You're on your free first week — every training day is unlocked. Upgrade to Pro to keep full-week access after week 1.";

export const normalizeSessionsPerWeek = (value: number | null | undefined) => {
  const parsed = Math.floor(value ?? 3);
  return parsed === 4 || parsed === 5 ? parsed : 3;
};

/**
 * True when the user has finished at least one session for every day of their
 * first program week (Day 1..N where N = sessionsPerWeek).
 */
export const deriveHasCompletedFirstWeek = (params: {
  completedDayIndexes: readonly number[];
  sessionsPerWeek: number | null | undefined;
  /** Persisted latch — once true, stays true across programs/logins. */
  persistedFlag?: boolean | null;
}): boolean => {
  if (params.persistedFlag === true) return true;
  const target = normalizeSessionsPerWeek(params.sessionsPerWeek);
  const unique = new Set(
    params.completedDayIndexes.filter(
      (dayIndex) => Number.isFinite(dayIndex) && dayIndex >= 0 && dayIndex < target
    )
  );
  return unique.size >= target;
};

export const canAccessWorkoutToday = (params: {
  /** Free-plan chrome only — Pro / auth-off / buyer-demo pass true access. */
  isFreePlan: boolean;
  hasCompletedFirstWeek: boolean;
  dayIndex: number;
}): boolean => {
  if (!params.isFreePlan) return true;
  if (!params.hasCompletedFirstWeek) return true;
  return params.dayIndex === 0;
};
