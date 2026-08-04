/**
 * Dashboard readiness display helpers.
 *
 * Invariant: any percentage shown as "Training readiness" must satisfy
 *   0 <= score <= 100
 * and the category label must agree with that clamped score.
 */

export type DashboardReadinessSessionLike = {
  completedAt?: string | null;
  updatedAt?: string | null;
  createdAt?: string | null;
};

export type DashboardReadinessLogLike = {
  createdAt?: string | null;
  painLevel?: string | null;
  felt?: string | null;
};

export type DashboardReadinessLabel = "High" | "Good" | "Caution";

/** Final display guard — never emit out-of-range readiness percentages. */
export const clampDisplayPercent = (value: number): number => {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
};

/** Convert a 0–1 (or corrupt) metric into a safe 0–100 display percent. */
export const metric01ToDisplayPercent = (value: number | null | undefined): number | null => {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return clampDisplayPercent(value * 100);
};

export const readinessLabelFromScore = (score: number): DashboardReadinessLabel => {
  const safe = clampDisplayPercent(score);
  if (safe >= 80) return "High";
  if (safe >= 55) return "Good";
  return "Caution";
};

export const formatTrainingReadinessChip = (score: number): string => {
  const safe = clampDisplayPercent(score);
  return `Training readiness: ${safe}% (${readinessLabelFromScore(safe)})`;
};

/**
 * Heuristic readiness used on the Results hero.
 *
 * Before (inline in ResultsRoutine):
 *   start 75, subtract recent-session / dense-week / pain penalties,
 *   then clamp 0–100.
 *
 * After: same arithmetic, extracted so both apps and unit tests share one
 * domain boundary (clamp is a final guard, not a substitute for fixing inputs).
 */
export const computeDashboardReadinessScore = ({
  nowMs,
  completedSessions,
  recentLogs,
  continueSession = false,
}: {
  nowMs: number;
  completedSessions: DashboardReadinessSessionLike[];
  recentLogs: DashboardReadinessLogLike[];
  continueSession?: boolean;
}): number => {
  if (continueSession) return 70;

  let score = 75;

  const completedSessionTimestamps = completedSessions
    .map((session) => {
      const parsed = Date.parse(
        session.completedAt ?? session.updatedAt ?? session.createdAt ?? ""
      );
      return Number.isNaN(parsed) ? null : parsed;
    })
    .filter((timestamp): timestamp is number => timestamp !== null);

  if (completedSessionTimestamps.length > 0) {
    const latestSessionAt = Math.max(...completedSessionTimestamps);
    const hoursSinceLatest = (nowMs - latestSessionAt) / (60 * 60 * 1000);
    if (hoursSinceLatest < 18) {
      score -= 10;
    }
    if (hoursSinceLatest >= 24 * 7) {
      score -= 5;
    }

    const sessionsInLast3Days = completedSessionTimestamps.filter(
      (timestamp) => nowMs - timestamp <= 24 * 3 * 60 * 60 * 1000
    ).length;
    if (sessionsInLast3Days >= 2) {
      score -= 10;
    }
  }

  const hasPainFlagToday = recentLogs.some((log) => {
    const hasPainSignal =
      (log.painLevel && log.painLevel !== "none") || log.felt === "pain";
    if (!hasPainSignal) return false;
    const parsed = Date.parse(log.createdAt ?? "");
    if (Number.isNaN(parsed)) return false;
    return nowMs - parsed <= 24 * 60 * 60 * 1000;
  });
  if (hasPainFlagToday) {
    score -= 15;
  }

  return clampDisplayPercent(score);
};
