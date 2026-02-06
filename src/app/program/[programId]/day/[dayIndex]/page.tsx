"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { exerciseById } from "@/lib/exercises";
import { getProgressionRecommendation } from "@/lib/progression";
import type { ExerciseLog, Program, ProgramRoutineItem } from "@/lib/types";
import {
  getProgram,
  listSessionsByProgramDay,
  listExerciseLogsBySessionIds,
} from "@/lib/logStore";
import BackgroundShell from "@/components/BackgroundShell";
import OnImage from "@/components/OnImage";
import Button from "@/components/ui/Button";

type Props = {
  params: Promise<{ programId: string; dayIndex: string }>;
};

type RoutineWithSections = {
  warmup: ProgramRoutineItem[];
  activation: ProgramRoutineItem[];
  main: ProgramRoutineItem[];
  cooldown: ProgramRoutineItem[];
};

const groupBySection = (routine: ProgramRoutineItem[]): RoutineWithSections => {
  const warmup: ProgramRoutineItem[] = [];
  const activation: ProgramRoutineItem[] = [];
  const main: ProgramRoutineItem[] = [];
  const cooldown: ProgramRoutineItem[] = [];

  routine.forEach((item) => {
    const exercise = exerciseById(item.exerciseId);
    const category = exercise?.category ?? "main";
    if (category === "warmup") warmup.push(item);
    else if (category === "activation") activation.push(item);
    else if (category === "cooldown") cooldown.push(item);
    else main.push(item);
  });

  return { warmup, activation, main, cooldown };
};

export default function ProgramDayPage({ params }: Props) {
  const [program, setProgram] = useState<Program | null>(null);
  const [dayIndex, setDayIndex] = useState<number>(0);
  const [logs, setLogs] = useState<ExerciseLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const logMap = useMemo(() => {
    const map = new Map<string, ExerciseLog[]>();
    logs.forEach((log) => {
      if (!map.has(log.exerciseId)) {
        map.set(log.exerciseId, []);
      }
      map.get(log.exerciseId)?.push(log);
    });
    map.forEach((items, key) => {
      items.sort((a, b) => {
        const aStamp = a.updatedAt ?? a.createdAt ?? "";
        const bStamp = b.updatedAt ?? b.createdAt ?? "";
        return bStamp.localeCompare(aStamp);
      });
      map.set(key, items);
    });
    return map;
  }, [logs]);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setIsLoading(true);
      const { programId, dayIndex } = await params;
      const numericDay = Number(dayIndex);
      const loaded = await getProgram(programId);
      if (!isMounted) return;
      setDayIndex(Number.isFinite(numericDay) ? numericDay : 0);
      setProgram(loaded);
      if (loaded) {
        const sessions = await listSessionsByProgramDay(
          loaded.id,
          Number.isFinite(numericDay) ? numericDay : 0
        );
        const completedSessions = sessions
          .filter((session) => session.completedAt)
          .sort((a, b) =>
            (b.completedAt ?? "").localeCompare(a.completedAt ?? "")
          );
        const sessionIds = completedSessions.map((session) => session.id);
        const logsBySession = await listExerciseLogsBySessionIds(sessionIds);
        if (!isMounted) return;
        setLogs(logsBySession);
      } else {
        setLogs([]);
      }
      setIsLoading(false);
    };
    load();
    const refresh = () => {
      load();
    };
    window.addEventListener("focus", refresh);
    return () => {
      isMounted = false;
      window.removeEventListener("focus", refresh);
    };
  }, [params]);

  if (!program) {
    return (
      <BackgroundShell>
        <div className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-12">
          <OnImage>
            <h1 className="text-2xl font-semibold text-white">
              Program not found
            </h1>
            <Link href="/results">
              <Button variant="secondary">Back to program</Button>
            </Link>
          </OnImage>
        </div>
      </BackgroundShell>
    );
  }

  const day = program.week[dayIndex];
  const sections = groupBySection(day.routine);

  const formatSets = (log: ExerciseLog) =>
    log.setsCompleted ?? log.setsPlanned ?? null;

  const totalReps = (log: ExerciseLog) => {
    if (log.repsBySet?.length) {
      return log.repsBySet.reduce((sum, value) => sum + value, 0);
    }
    return log.reps ?? null;
  };

  const repsPerSet = (log: ExerciseLog) => {
    if (log.repsBySet?.length) {
      const [first, ...rest] = log.repsBySet;
      if (rest.every((value) => value === first)) return first;
      return null;
    }
    return log.reps ?? null;
  };

  const formatWeightedLabel = (log: ExerciseLog) => {
    const weight = log.weight ?? null;
    const unit = log.unit ?? "";
    const reps = repsPerSet(log);
    const sets = formatSets(log);
    if (weight === null) return null;
    if (reps !== null && sets !== null) {
      return `${weight}${unit} × ${reps} × ${sets}`;
    }
    if (reps !== null) return `${weight}${unit} × ${reps}`;
    return `${weight}${unit}`;
  };

  const formatBodyweightLabel = (log: ExerciseLog) => {
    const reps = repsPerSet(log) ?? totalReps(log);
    const sets = formatSets(log);
    if (reps === null) return null;
    if (sets !== null) return `${reps} reps × ${sets}`;
    return `${reps} reps`;
  };

  const formatTimedLabel = (log: ExerciseLog) => {
    const duration = log.durationSec ?? null;
    const sets = formatSets(log);
    if (duration === null) return null;
    if (sets !== null) return `${duration}s × ${sets}`;
    return `${duration}s`;
  };

  const formatPerformance = (log: ExerciseLog | null) => {
    if (!log) return "No logs yet";
    if (log.loadType === "timed") return formatTimedLabel(log) ?? "—";
    if (log.loadType === "weighted") return formatWeightedLabel(log) ?? "—";
    return formatBodyweightLabel(log) ?? "—";
  };

  const formatFeedbackBadge = (log: ExerciseLog) => {
    if (!log.felt) return null;
    const label =
      log.felt === "moderate"
        ? "Moderate"
        : log.felt === "pain"
        ? "Pain"
        : log.felt.charAt(0).toUpperCase() + log.felt.slice(1);
    const tone =
      log.felt === "pain"
        ? "border-amber-300 bg-amber-50 text-amber-900"
        : log.felt === "hard"
        ? "border-rose-200 bg-rose-50 text-rose-900"
        : "border-slate-200 bg-white text-slate-600";
    return (
      <span
        className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${tone}`}
      >
        {label}
      </span>
    );
  };

  const formatLogSummary = (
    log: ExerciseLog,
    exerciseLoadType: ExerciseLog["loadType"]
  ) => {
    const date = log.createdAt.slice(0, 10);
    const sets = formatSets(log);
    const reps = repsPerSet(log) ?? totalReps(log);
    const weight =
      exerciseLoadType === "weighted" && log.weight
        ? `${log.weight}${log.unit ?? ""}`
        : null;
    const summary = [weight, reps ? `${reps} reps` : null, sets ? `${sets} sets` : null]
      .filter(Boolean)
      .join(" • ");
    return { date, summary };
  };

  const formatRecommendation = (
    rec: ReturnType<typeof getProgressionRecommendation>
  ) => {
    if (!rec) return "Keep targets consistent";
    const parts: string[] = [];
    if (rec.recommendedNext.weight) parts.push(`${rec.recommendedNext.weight} lb`);
    if (rec.recommendedNext.reps) parts.push(`${rec.recommendedNext.reps} reps`);
    if (rec.recommendedNext.sets) parts.push(`${rec.recommendedNext.sets} sets`);
    if (rec.recommendedNext.tempo) parts.push(`tempo ${rec.recommendedNext.tempo}`);
    if (!parts.length) return "Keep targets consistent";
    return parts.join(" • ");
  };

  const formatFeedback = (log: ExerciseLog | null) => {
    if (!log?.felt) return null;
    const label =
      log.felt === "moderate"
        ? "Moderate"
        : log.felt === "pain"
        ? "Pain / discomfort"
        : log.felt.charAt(0).toUpperCase() + log.felt.slice(1);
    const location = log.painLocation ? ` • ${log.painLocation}` : "";
    const notes = log.feedbackNotes ? ` — ${log.feedbackNotes}` : "";
    return `${label}${location}${notes}`;
  };

  const getDelta = (last: ExerciseLog | null, prev: ExerciseLog | null) => {
    if (!last || !prev) return null;
    if (last.loadType === "timed") {
      if (last.durationSec !== null && prev.durationSec !== null) {
        const diff = last.durationSec - prev.durationSec;
        return `${diff >= 0 ? "+" : ""}${diff}s`;
      }
      return null;
    }

    if (last.loadType === "weighted") {
      if (last.weight !== null && prev.weight !== null) {
        const diff = last.weight - prev.weight;
        if (diff !== 0) {
          return `${diff >= 0 ? "+" : ""}${diff}${last.unit ?? ""}`;
        }
      }
      if (
        last.computedVolume !== null &&
        prev.computedVolume !== null
      ) {
        const diff = last.computedVolume - prev.computedVolume;
        return `${diff >= 0 ? "+" : ""}${diff} volume`;
      }
      const lastReps = totalReps(last);
      const prevReps = totalReps(prev);
      if (lastReps !== null && prevReps !== null) {
        const diff = lastReps - prevReps;
        return `${diff >= 0 ? "+" : ""}${diff} reps`;
      }
    }

    const lastReps = totalReps(last);
    const prevReps = totalReps(prev);
    if (lastReps !== null && prevReps !== null) {
      const diff = lastReps - prevReps;
      return `${diff >= 0 ? "+" : ""}${diff} reps`;
    }
    return null;
  };

  const renderSection = (title: string, items: ProgramRoutineItem[]) => (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
      <div className="mt-4 space-y-3 text-sm text-slate-700">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
            No exercises in this section.
          </div>
        ) : (
          items.map((item, index) => {
            const exercise = exerciseById(item.exerciseId);
            const exerciseLogs = logMap.get(item.exerciseId) ?? [];
            const lastLog = exerciseLogs[0] ?? null;
            const prevLog = exerciseLogs[1] ?? null;
            const delta = getDelta(lastLog, prevLog);
            const recentLogs = exerciseLogs.slice(0, 3);
            const recommendation =
              exercise && lastLog
                ? getProgressionRecommendation({
                    exercise,
                    logs: [lastLog],
                    feedback: lastLog.felt
                      ? {
                          rating: lastLog.felt,
                          painLocation: lastLog.painLocation ?? null,
                          notes: lastLog.feedbackNotes ?? null,
                        }
                      : null,
                    prescription: {
                      sets: item.sets,
                      reps: item.reps ?? exercise.durationOrReps,
                      durationSec: item.durationSec ?? null,
                      restSec: item.restSec ?? null,
                    },
                  })
                : null;
            const metaLabel =
              item.loadType === "weighted"
                ? "WEIGHTED"
                : item.loadType === "timed"
                ? "TIMED"
                : item.loadType === "assisted"
                ? "ASSISTED"
                : "BODYWEIGHT";
            const repHint = item.durationSec
              ? `${item.durationSec} sec`
              : item.reps
              ? item.reps
              : null;
            const nextLine = recommendation
              ? `Next: ${formatRecommendation(recommendation)}`
              : "Next: Keep targets consistent";
            return (
              <details
                key={`${item.exerciseId}-${index}`}
                className="group rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {exercise?.name ?? "Exercise"}
                    </p>
                    <p className="mt-1 text-xs text-slate-600">{nextLine}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold text-slate-500">
                    <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5">
                      {metaLabel}
                    </span>
                    {repHint ? (
                      <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5">
                        {repHint}
                      </span>
                    ) : null}
                  </div>
                  <span className="ml-2 text-[11px] font-semibold text-slate-400">
                    Tap for history
                  </span>
                  <span className="ml-auto text-slate-400 transition group-open:rotate-180">
                    ▾
                  </span>
                </summary>

                <div className="mt-3 border-t border-slate-200/70 pt-3 text-xs text-slate-700">
                  {recentLogs.length ? (
                    <div>
                      <p className="text-[11px] font-semibold text-slate-700">
                        Last 3 sessions
                      </p>
                      <div className="mt-2 space-y-2 text-[11px] text-slate-600">
                        {recentLogs.map((log, index) => {
                          const { date, summary } = formatLogSummary(
                            log,
                            exercise?.loadType ?? log.loadType
                          );
                          return (
                            <div
                              key={`${log.exerciseId}-${log.createdAt}-${index}`}
                              className="flex flex-wrap items-center justify-between gap-2"
                            >
                              <span className="text-slate-500">{date}</span>
                              <span className="text-slate-700">{summary || "—"}</span>
                              {formatFeedbackBadge(log)}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500">No logs yet.</p>
                  )}

                  {recommendation ? (
                    <div className="mt-3 border-t border-slate-200/70 pt-3">
                      {recommendation.safetyFlag ? (
                        <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-900">
                          Safety
                        </span>
                      ) : null}
                      <p className="mt-2 text-[11px] font-semibold text-slate-900">
                        Next time
                      </p>
                      <p className="text-[11px] text-slate-700">
                        {formatRecommendation(recommendation)}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {recommendation.reason}
                      </p>
                    </div>
                  ) : null}
                </div>
              </details>
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <BackgroundShell>
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 px-6 py-12">
        <OnImage>
          <header className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-200">
              Day {dayIndex + 1}
            </p>
            <h1 className="text-3xl font-semibold text-white">{day.title}</h1>
            <p className="text-sm text-slate-200">
              Focus: {day.focusTags.join(", ")} • Estimated 45–60 min
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href={`/session?programId=${program.id}&dayIndex=${dayIndex}`}>
                <Button variant="primary">Start This Day</Button>
              </Link>
              <Link href={`/session?programId=${program.id}&dayIndex=${dayIndex}`}>
                <Button variant="secondary">Log Now</Button>
              </Link>
              <Link href="/results">
                <Button variant="secondary">Back to Program</Button>
              </Link>
            </div>
            <p className="text-xs text-slate-200">
              {isLoading
                ? "Loading performance history..."
                : `Logs found: ${logs.length}`}
            </p>
          </header>
        </OnImage>

        {renderSection("Warm-up", sections.warmup)}
        {renderSection("Activation", sections.activation)}
        {renderSection("Main", sections.main)}
        {renderSection("Cooldown", sections.cooldown)}
      </div>
    </BackgroundShell>
  );
}
