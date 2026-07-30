import type { SessionRecord } from "@/lib/types";

const DAY_MS = 24 * 60 * 60 * 1000;
const DAYS_PER_WEEK = 7;

const toTimestampMs = (value: string | null | undefined) => {
  if (!value) return null;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const sessionCompletedAtMs = (session: SessionRecord) =>
  toTimestampMs(session.completedAt ?? session.startedAt ?? session.createdAt);

const dayBucket = (timestampMs: number) => Math.floor(timestampMs / DAY_MS);

export function calculateWeeklyGoalStreak({
  sessions,
  prescribedWorkoutsPerWeek,
  nowMs = Date.now(),
  maxWeeks = 260,
}: {
  sessions: SessionRecord[];
  prescribedWorkoutsPerWeek: number;
  nowMs?: number;
  maxWeeks?: number;
}) {
  const requiredPerWeek = Math.max(1, Math.round(prescribedWorkoutsPerWeek || 0));
  const completedTrainingDays = Array.from(
    new Set(
      sessions
        .map(sessionCompletedAtMs)
        .filter((timestamp): timestamp is number => timestamp !== null && timestamp <= nowMs)
        .map(dayBucket)
    )
  ).sort((left, right) => left - right);

  if (!completedTrainingDays.length) return 0;

  const latestTrainingDay = completedTrainingDays[completedTrainingDays.length - 1];
  let streak = 0;

  for (let index = 0; index < maxWeeks; index += 1) {
    const windowEndDay = latestTrainingDay - index * DAYS_PER_WEEK;
    const windowStartDay = windowEndDay - (DAYS_PER_WEEK - 1);
    const completedDaysInWindow = completedTrainingDays.filter(
      (day) => day >= windowStartDay && day <= windowEndDay
    ).length;

    if (completedDaysInWindow < requiredPerWeek) break;
    streak += 1;
  }

  return streak;
}
