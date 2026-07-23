"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import BackgroundShell from "@/components/BackgroundShell";
import OnImage from "@/components/OnImage";
import ImprovementInsights from "@/components/progress/ImprovementInsights";
import PerformanceOverview from "@/components/progress/PerformanceOverview";
import RankedTopMovements, {
  type RankedTopMovement,
} from "@/components/progress/RankedTopMovements";
import RecentPrList, {
  type PrSnapshot,
  type RecentPrItem,
} from "@/components/progress/RecentPrList";
import { loadAppState } from "@/lib/appState";
import { exerciseById } from "@/lib/exercises";
import {
  init,
  listAllPrograms,
  listExerciseLogsBySession,
  listSessions,
} from "@/lib/logStore";
import { formatNextSessionRecommendationFromSession } from "@/lib/nextSessionRecommendation";
import { formatSessionFeedbackCoachSummary } from "@/lib/sessionFeedbackSignals";
import { resolveActiveProgramFromList } from "@/lib/trainingStateModel";
import type { ExerciseLog, SessionRecord } from "@/lib/types";

const DAY_MS = 86_400_000;

type DifficultyTrendLabel =
  | "Pattern quality improving"
  | "Stable performance"
  | "Corrective strength trend";

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const formatNumber = (value: number) =>
  Number.isInteger(value) ? value.toString() : value.toFixed(1);

const sessionTimestampMs = (session: SessionRecord) => {
  const timestamp = Date.parse(
    session.completedAt ?? session.startedAt ?? session.createdAt
  );
  return Number.isFinite(timestamp) ? timestamp : 0;
};

const logTimestampMs = (log: ExerciseLog) => {
  const timestamp = Date.parse(log.updatedAt ?? log.createdAt);
  return Number.isFinite(timestamp) ? timestamp : 0;
};

const dayBucket = (timestampMs: number) => Math.floor(timestampMs / DAY_MS);
const currentTimestampMs = () => Date.now();

const toDateKey = (timestampMs: number) =>
  new Date(timestampMs).toISOString().slice(0, 10);

const weekStartFromTimestampMs = (timestampMs: number) => {
  const date = new Date(timestampMs);
  date.setHours(0, 0, 0, 0);
  const offset = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - offset);
  return date.getTime();
};

const startOfWeekMs = () => {
  return weekStartFromTimestampMs(currentTimestampMs());
};

const difficultyScoreFromLabel = (
  value: SessionRecord["sessionFeedback"] | ExerciseLog["felt"]
) => {
  if (!value) return null;
  if (value === "easy") return 1;
  if (value === "moderate") return 2;
  if (value === "hard") return 3;
  return 4;
};

const repsFromLog = (log: ExerciseLog) => {
  if (typeof log.reps === "number" && Number.isFinite(log.reps)) return log.reps;
  if (!Array.isArray(log.repsBySet)) return null;
  const reps = log.repsBySet.filter((value) => Number.isFinite(value));
  if (!reps.length) return null;
  return Math.max(...reps);
};

const formatLoad = (weight: number | null, unit: "lb" | "kg" | null) => {
  if (weight === null) return null;
  const unitLabel = unit === "kg" ? "kg" : "lb";
  return `${formatNumber(weight)} ${unitLabel}`;
};

const toPrSnapshot = (log: ExerciseLog): PrSnapshot => {
  const reps = repsFromLog(log);
  const weight =
    typeof log.weight === "number" && Number.isFinite(log.weight) ? log.weight : null;
  const unit = log.unit ?? null;
  const volume =
    typeof log.computedVolume === "number" && Number.isFinite(log.computedVolume)
      ? log.computedVolume
      : null;
  const loadLabel = formatLoad(weight, unit);
  const label =
    loadLabel && typeof reps === "number"
      ? `${loadLabel} x ${formatNumber(reps)}`
      : loadLabel
        ? loadLabel
        : volume !== null
          ? `Volume ${formatNumber(volume)}`
          : "Bodyweight";

  return {
    label,
    weight,
    reps,
    unit,
  };
};

const prScore = (log: ExerciseLog) => {
  const weight =
    typeof log.weight === "number" && Number.isFinite(log.weight) ? log.weight : null;
  if (weight !== null) {
    const reps = repsFromLog(log) ?? 0;
    return weight * 1_000 + reps;
  }
  if (typeof log.computedVolume === "number" && Number.isFinite(log.computedVolume)) {
    return log.computedVolume;
  }
  return null;
};

const formatImprovement = (last: PrSnapshot, previous: PrSnapshot) => {
  if (last.weight !== null && previous.weight !== null) {
    const diff = last.weight - previous.weight;
    if (Math.abs(diff) >= 0.1) {
      const unit = (last.unit ?? previous.unit ?? "lb") === "kg" ? "kg" : "lbs";
      return `${diff > 0 ? "+" : ""}${formatNumber(diff)} ${unit}`;
    }
  }

  if (last.reps !== null && previous.reps !== null) {
    const diff = last.reps - previous.reps;
    if (diff !== 0) {
      return `${diff > 0 ? "+" : ""}${formatNumber(diff)} reps`;
    }
  }

  return null;
};

export default function ProgressPage() {
  const [logs, setLogs] = useState<ExerciseLog[]>([]);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [baselineAt, setBaselineAt] = useState(0);
  const [prescribedWorkoutsPerWeek, setPrescribedWorkoutsPerWeek] = useState(3);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      await init();
      const sessionList = await listSessions(250);
      const appState = loadAppState();
      const programs = await listAllPrograms();
      const activeProgramResolution = resolveActiveProgramFromList(programs, appState);
      const activeProgramId = activeProgramResolution.programId;
      const activeProgram = activeProgramResolution.program;
      const activeProgramSessions = activeProgramId
        ? sessionList.filter((session) => session.routineId === activeProgramId)
        : [];
      const sessionsForActiveProgram =
        activeProgramId && activeProgramSessions.length
          ? activeProgramSessions
          : sessionList;

      const fallbackBaselineAt = sessionsForActiveProgram.reduce((earliest, session) => {
        const timestamp = sessionTimestampMs(session);
        if (!timestamp) return earliest;
        if (!earliest) return timestamp;
        return Math.min(earliest, timestamp);
      }, 0);

      const storedBaselineAt =
        typeof appState?.activeProgramBaselineAt === "number" &&
        Number.isFinite(appState.activeProgramBaselineAt)
          ? appState.activeProgramBaselineAt
          : 0;

      const effectiveBaselineAt =
        storedBaselineAt > 0 ? storedBaselineAt : fallbackBaselineAt;

      const baselineFilteredSessions =
        effectiveBaselineAt > 0
          ? sessionsForActiveProgram.filter(
              (session) => sessionTimestampMs(session) >= effectiveBaselineAt
            )
          : sessionsForActiveProgram;
      const sessionsSinceBaseline =
        baselineFilteredSessions.length || !sessionsForActiveProgram.length
          ? baselineFilteredSessions
          : sessionsForActiveProgram;

      const orderedSessions = [...sessionsSinceBaseline].sort(
        (left, right) => sessionTimestampMs(right) - sessionTimestampMs(left)
      );

      const logsBySession = await Promise.all(
        orderedSessions.map((session) => listExerciseLogsBySession(session.id))
      );

      if (cancelled) return;

      setBaselineAt(effectiveBaselineAt);
      setPrescribedWorkoutsPerWeek(activeProgram?.daysPerWeek ?? 3);
      setSessions(orderedSessions);
      setLogs(logsBySession.flat().filter((log) => !log.deletedAt));
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const logsBySessionId = useMemo(() => {
    const grouped = new Map<string, ExerciseLog[]>();
    logs.forEach((log) => {
      const items = grouped.get(log.sessionId) ?? [];
      items.push(log);
      grouped.set(log.sessionId, items);
    });
    return grouped;
  }, [logs]);

  const topMovements = useMemo<RankedTopMovement[]>(() => {
    const counts = logs.reduce<Record<string, number>>((acc, log) => {
      acc[log.exerciseId] = (acc[log.exerciseId] ?? 0) + 1;
      return acc;
    }, {});

    const sorted = Object.entries(counts).sort((left, right) => right[1] - left[1]);
    const maxCount = sorted[0]?.[1] ?? 1;

    return sorted.slice(0, 5).map(([id, count]) => ({
      id,
      name: exerciseById(id)?.name ?? id,
      count,
      ratioPercent: clamp(Math.round((count / maxCount) * 100), 6, 100),
    }));
  }, [logs]);

  const recentPRs = useMemo<RecentPrItem[]>(() => {
    const byExercise = new Map<string, ExerciseLog[]>();
    logs.forEach((log) => {
      const items = byExercise.get(log.exerciseId) ?? [];
      items.push(log);
      byExercise.set(log.exerciseId, items);
    });

    const entries = Array.from(byExercise.entries())
      .map(([exerciseId, exerciseLogs]) => {
        const ordered = [...exerciseLogs].sort(
          (left, right) => logTimestampMs(left) - logTimestampMs(right)
        );

        let bestScore = -Infinity;
        const prEvents: ExerciseLog[] = [];

        ordered.forEach((log) => {
          const score = prScore(log);
          if (score === null) return;
          if (score > bestScore) {
            bestScore = score;
            prEvents.push(log);
          }
        });

        if (!prEvents.length) return null;

        const last = prEvents[prEvents.length - 1];
        const previous = prEvents.length > 1 ? prEvents[prEvents.length - 2] : null;
        const lastSnapshot = toPrSnapshot(last);
        const previousSnapshot = previous ? toPrSnapshot(previous) : null;

        return {
          key: `${exerciseId}-${last.id}`,
          occurredAt: logTimestampMs(last),
          name: exerciseById(exerciseId)?.name ?? exerciseId,
          last: lastSnapshot,
          previous: previousSnapshot,
          improvement: previousSnapshot
            ? formatImprovement(lastSnapshot, previousSnapshot)
            : null,
        };
      })
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
      .sort((left, right) => right.occurredAt - left.occurredAt)
      .slice(0, 5);

    return entries.map(({ key, name, last, previous, improvement }) => ({
      key,
      name,
      last,
      previous,
      improvement,
    }));
  }, [logs]);

  const weeklyFrequency = useMemo(() => {
    const now = currentTimestampMs();
    const recentWindowStart = now - 7 * DAY_MS;
    const previousWindowStart = now - 14 * DAY_MS;

    const recentCount = sessions.filter(
      (session) => sessionTimestampMs(session) >= recentWindowStart
    ).length;

    const previousCount = sessions.filter((session) => {
      const timestamp = sessionTimestampMs(session);
      return timestamp < recentWindowStart && timestamp >= previousWindowStart;
    }).length;

    return { recentCount, previousCount };
  }, [sessions]);

  const consistencyPercent = useMemo(() => {
    if (!sessions.length) return 0;

    const uniqueDays = new Set(
      sessions.map((session) => dayBucket(sessionTimestampMs(session)))
    );

    if (baselineAt <= 0) {
      return clamp(Math.round((uniqueDays.size / sessions.length) * 100), 0, 100);
    }

    const baselineDay = dayBucket(baselineAt);
    const currentDay = dayBucket(currentTimestampMs());
    const trackedDays = Math.max(1, currentDay - baselineDay + 1);

    return clamp(Math.round((uniqueDays.size / trackedDays) * 100), 0, 100);
  }, [baselineAt, sessions]);

  const sessionsThisWeek = useMemo(() => {
    const start = startOfWeekMs();
    return sessions.filter(
      (session) => Boolean(session.completedAt) && sessionTimestampMs(session) >= start
    ).length;
  }, [sessions]);

  const weeklyGoalStreak = useMemo(() => {
    const completedSessions = sessions.filter((session) => Boolean(session.completedAt));
    if (!completedSessions.length) return 0;

    const countsByWeek = new Map<number, number>();
    completedSessions.forEach((session) => {
      const timestamp = sessionTimestampMs(session);
      if (!timestamp) return;
      const weekStart = weekStartFromTimestampMs(timestamp);
      countsByWeek.set(weekStart, (countsByWeek.get(weekStart) ?? 0) + 1);
    });

    const requiredPerWeek = Math.max(1, prescribedWorkoutsPerWeek);
    let streak = 0;
    let cursorWeekStart = startOfWeekMs();
    for (let index = 0; index < 260; index += 1) {
      const weeklyCount = countsByWeek.get(cursorWeekStart) ?? 0;
      if (weeklyCount < requiredPerWeek) break;
      streak += 1;
      cursorWeekStart -= 7 * DAY_MS;
    }
    return streak;
  }, [sessions, prescribedWorkoutsPerWeek]);

  // Phase 6d, Commit 4 — all difficulty-derived entries, unsliced, so we can
  // tell "not enough data yet" apart from an actual stable trend. The old
  // code collapsed both cases to the literal string "Stable performance",
  // which reads as a real (if unexciting) verdict on a fresh user who has
  // logged zero or one session — that's the exact "weaponized early number"
  // this commit exists to fix.
  const difficultyDataPoints = useMemo(() => {
    return sessions
      .map((session) => {
        const fromSession = difficultyScoreFromLabel(session.sessionFeedback ?? null);
        if (fromSession !== null) {
          return {
            timestamp: sessionTimestampMs(session),
            score: fromSession,
          };
        }

        const logsForSession = logsBySessionId.get(session.id) ?? [];
        const logScores = logsForSession
          .map((log) => difficultyScoreFromLabel(log.felt))
          .filter((score): score is 1 | 2 | 3 | 4 => score !== null);

        if (!logScores.length) return null;

        const averageScore =
          logScores.reduce((total, score) => total + score, 0) / logScores.length;

        return {
          timestamp: sessionTimestampMs(session),
          score: averageScore,
        };
      })
      .filter(
        (entry): entry is { timestamp: number; score: number } => entry !== null
      )
      .sort((left, right) => right.timestamp - left.timestamp);
  }, [logsBySessionId, sessions]);

  const hasEnoughTrendData = difficultyDataPoints.length >= 3;

  const difficultyTrendLabel = useMemo<DifficultyTrendLabel>(() => {
    const recentScores = difficultyDataPoints.slice(0, 3);
    if (recentScores.length < 3) return "Stable performance";

    const chronologicalScores = [...recentScores].reverse();
    const delta =
      chronologicalScores[chronologicalScores.length - 1].score -
      chronologicalScores[0].score;

    if (delta <= -0.35) return "Pattern quality improving";
    if (delta >= 0.35) return "Corrective strength trend";
    return "Stable performance";
  }, [difficultyDataPoints]);

  // 4.a — statistical floors. Metrics render only once they cross a floor of
  // meaning; below it, PerformanceOverview shows baseline coaching copy
  // instead of a dimmed/near-zero number. "Sessions this week" has no floor
  // — it's a plain count, not a judgment about the user's trajectory.
  const completedSessionsCount = useMemo(
    () => sessions.filter((session) => Boolean(session.completedAt)).length,
    [sessions]
  );
  const daysSinceBaseline =
    baselineAt > 0 ? Math.floor((currentTimestampMs() - baselineAt) / DAY_MS) : 0;

  const consistencyFloorMet = completedSessionsCount >= 5;
  const streakFloorMet = daysSinceBaseline >= 14; // 2 full weeks
  const trendFloorMet = hasEnoughTrendData;

  const recentInsights = useMemo(() => {
    const insights: string[] = [];

    if (weeklyFrequency.recentCount > weeklyFrequency.previousCount) {
      insights.push("Training consistency increased this week.");
    } else if (
      weeklyFrequency.recentCount === weeklyFrequency.previousCount &&
      weeklyFrequency.recentCount > 0
    ) {
      insights.push("Training consistency remained stable week to week.");
    } else if (weeklyFrequency.recentCount > 0) {
      insights.push("Session frequency dipped slightly versus the prior week.");
    } else {
      insights.push("Log your first session to unlock adaptive trend insights.");
    }

    if (difficultyTrendLabel === "Pattern quality improving") {
      insights.push("Movement quality emphasis is improving across recent sessions.");
    } else if (difficultyTrendLabel === "Corrective strength trend") {
      insights.push("Corrective strength trend is building steadily across recent sessions.");
    } else {
      insights.push("Session effort is stable and repeatable.");
    }

    if (weeklyGoalStreak >= 1) {
      insights.push(
        `${weeklyGoalStreak}-week consistency streak at prescribed training volume.`
      );
    } else if (sessionsThisWeek >= prescribedWorkoutsPerWeek) {
      insights.push("This week hit the prescribed workout target.");
    } else if (sessionsThisWeek >= 3) {
      insights.push("Weekly training frequency is supporting steady progression.");
    } else {
      insights.push("One additional session this week would strengthen trend clarity.");
    }

    return insights;
  }, [
    weeklyGoalStreak,
    difficultyTrendLabel,
    sessionsThisWeek,
    weeklyFrequency,
    prescribedWorkoutsPerWeek,
  ]);

  const lastSessions = useMemo(() => sessions.slice(0, 7), [sessions]);

  const volumeByDate = useMemo(() => {
    return logs.reduce<Record<string, number>>((acc, log) => {
      const volume = log.computedVolume ?? 0;
      const date = toDateKey(logTimestampMs(log));
      acc[date] = (acc[date] ?? 0) + volume;
      return acc;
    }, {});
  }, [logs]);

  return (
    <BackgroundShell>
      <div className="ui-shell flex max-w-6xl flex-col gap-6 py-8 sm:py-12">
        <OnImage>
          <header className="ui-page-heading flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-300">
                Progress
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-white">Training insights</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-200">
                Review corrective performance trends, movement frequency, and personal records.
              </p>
            </div>
            <Link href="/results">
              <span className="inline-flex min-h-11 items-center rounded-lg border border-slate-300/40 bg-slate-900/55 px-5 py-2 text-xs font-semibold text-slate-100 hover:bg-slate-800/65">
                Back to dashboard
              </span>
            </Link>
          </header>
        </OnImage>

        <PerformanceOverview
          consistencyPercent={consistencyPercent}
          consistencyFloorMet={consistencyFloorMet}
          sessionsThisWeek={sessionsThisWeek}
          weeklyGoalStreak={weeklyGoalStreak}
          streakFloorMet={streakFloorMet}
          prescribedWorkoutsPerWeek={prescribedWorkoutsPerWeek}
          trendLabel={difficultyTrendLabel}
          trendFloorMet={trendFloorMet}
        />

        <RankedTopMovements movements={topMovements} />
        <RecentPrList items={recentPRs} />
        <ImprovementInsights insights={recentInsights} />

        <div className="ui-card ui-soft-surface-raised rounded-lg p-5 sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="ui-kicker">History</p>
              <h2 className="mt-1 text-lg font-semibold text-white">Last 7 sessions</h2>
            </div>
            <span className="rounded-lg border border-slate-500/30 bg-slate-950/45 px-3 py-1 text-xs text-slate-300">
              {sessions.length} sessions tracked
            </span>
          </div>
          <div className="mt-4 space-y-3 text-sm text-slate-700">
            {lastSessions.length ? (
              lastSessions.map((session) => {
                const dateKey = toDateKey(sessionTimestampMs(session));
                const feedbackSummary = formatSessionFeedbackCoachSummary(
                  session.feedback ?? null
                );
                const nextSessionRecommendation =
                  formatNextSessionRecommendationFromSession(session);
                return (
                  <div
                    key={session.id}
                    className="ui-soft-surface flex flex-wrap items-center justify-between gap-2 rounded-lg px-3 py-2"
                  >
                    <span className="text-slate-100">{dateKey}</span>
                    <span className="text-right text-xs text-slate-400">
                      {session.durationSec ? `${Math.round(session.durationSec / 60)} min` : "--"}{" "}
                      • Volume {volumeByDate[dateKey] ?? 0}
                      {feedbackSummary ? (
                        <span className="block text-slate-300">
                          {feedbackSummary}
                        </span>
                      ) : null}
                      {nextSessionRecommendation ? (
                        <span
                          className="block text-slate-300"
                          data-testid="next-session-recommendation"
                        >
                          {nextSessionRecommendation}
                        </span>
                      ) : null}
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-slate-400">No completed sessions yet.</p>
            )}
          </div>
        </div>
      </div>
    </BackgroundShell>
  );
}
