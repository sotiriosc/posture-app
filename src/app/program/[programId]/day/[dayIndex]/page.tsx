"use client";

import { useEffect, useMemo, useState } from "react";
import type { TouchEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { exerciseById, resolveExerciseHistoryIds } from "@/lib/exercises";
import { getProgressionRecommendation } from "@/lib/progression";
import { formatHistorySchemaRow, getHistoryDeltaPills } from "@/lib/historyView";
import type { ExerciseLog, Program, ProgramRoutineItem, SessionRecord } from "@/lib/types";
import type { SubscriptionPlan } from "@/lib/authTypes";
import {
  getProgram,
  listExerciseLogsBySessionIds,
  listSessionsByProgramId,
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

type SectionKey = "warmup" | "activation" | "main" | "cooldown";

const parseDayIndexFromNotes = (notes: string | null) => {
  if (!notes) return null;
  const match = notes.match(/dayIndex:(\d+)/);
  return match ? Number(match[1]) : null;
};

const groupBySection = (routine: ProgramRoutineItem[]): RoutineWithSections => {
  const warmup: ProgramRoutineItem[] = [];
  const activation: ProgramRoutineItem[] = [];
  const main: ProgramRoutineItem[] = [];
  const cooldown: ProgramRoutineItem[] = [];

  routine.forEach((item) => {
    if (item.section === "warmup") {
      warmup.push(item);
      return;
    }
    if (item.section === "activation" || item.section === "accessory") {
      activation.push(item);
      return;
    }
    if (item.section === "main") {
      main.push(item);
      return;
    }
    if (item.section === "cooldown") {
      cooldown.push(item);
      return;
    }

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
  const router = useRouter();
  const [program, setProgram] = useState<Program | null>(null);
  const [dayIndex, setDayIndex] = useState<number>(0);
  const [logs, setLogs] = useState<ExerciseLog[]>([]);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [authEnabled, setAuthEnabled] = useState(false);
  const [plan, setPlan] = useState<SubscriptionPlan>("free");
  const [sessionResolved, setSessionResolved] = useState(false);

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
        const programSessions = await listSessionsByProgramId(loaded.id);
        const logsBySession = await listExerciseLogsBySessionIds(
          programSessions.map((session) => session.id)
        );
        if (!isMounted) return;
        setLogs(logsBySession);
        setSessions(programSessions);
      } else {
        setLogs([]);
        setSessions([]);
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

  useEffect(() => {
    const loadSession = async () => {
      try {
        const response = await fetch("/api/auth/session", {
          cache: "no-store",
          credentials: "include",
        });
        const payload = (await response.json()) as {
          enabled?: boolean;
          user?: { plan?: SubscriptionPlan } | null;
        };
        setAuthEnabled(Boolean(payload.enabled));
        setPlan(payload.user?.plan === "pro" ? "pro" : "free");
      } catch {
        setAuthEnabled(false);
        setPlan("free");
      } finally {
        setSessionResolved(true);
      }
    };
    loadSession();
  }, []);

  const day = program?.week[dayIndex] ?? null;
  const isFreePlan = authEnabled && plan !== "pro";
  const sections = useMemo(
    () =>
      day
        ? groupBySection(day.routine)
        : { warmup: [], activation: [], main: [], cooldown: [] },
    [day]
  );
  const daySessions = useMemo(() => {
    if (!program) return [] as SessionRecord[];
    return sessions
      .filter(
        (session) =>
          session.routineId === program.id &&
          parseDayIndexFromNotes(session.notes) === dayIndex
      )
      .sort((a, b) => {
        const aStamp = a.completedAt ?? a.updatedAt ?? a.createdAt ?? "";
        const bStamp = b.completedAt ?? b.updatedAt ?? b.createdAt ?? "";
        return bStamp.localeCompare(aStamp);
      });
  }, [sessions, program, dayIndex]);

  useEffect(() => {
    setHistoryIndex(0);
  }, [dayIndex, daySessions.length]);

  useEffect(() => {
    if (!program) return;
    if (isFreePlan && dayIndex > 0) {
      setDayIndex(0);
      router.replace(`/program/${program.id}/day/0`);
    }
  }, [isFreePlan, dayIndex, program, router]);

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

  const sectionGroups = useMemo(
    () =>
      [
        { sectionKey: "activation" as SectionKey, sectionTitle: "Accessory", items: sections.activation },
        { sectionKey: "main" as SectionKey, sectionTitle: "Main", items: sections.main },
      ].filter((group) => group.items.length > 0),
    [sections]
  );

  const navigateDay = (targetIndex: number) => {
    if (!program) return;
    if (isFreePlan) return;
    const bounded = Math.max(0, Math.min(targetIndex, program.week.length - 1));
    if (bounded === dayIndex) return;
    setDayIndex(bounded);
    router.replace(`/program/${program.id}/day/${bounded}`);
  };

  const navigateHistory = (targetIndex: number) => {
    if (!daySessions.length) return;
    const bounded = Math.max(0, Math.min(targetIndex, daySessions.length - 1));
    setHistoryIndex(bounded);
  };

  const onTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    setTouchStartX(event.changedTouches[0]?.clientX ?? null);
  };

  const onTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (touchStartX === null) return;
    const endX = event.changedTouches[0]?.clientX ?? touchStartX;
    const delta = endX - touchStartX;
    if (Math.abs(delta) >= 60) {
      if (delta < 0) navigateHistory(historyIndex + 1);
      if (delta > 0) navigateHistory(historyIndex - 1);
    }
    setTouchStartX(null);
  };

  if (!sessionResolved || !program || !day) {
    return (
      <BackgroundShell>
        <div className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-12">
          <OnImage>
            <h1 className="text-2xl font-semibold text-white">
              {!sessionResolved ? "Loading access..." : "Program not found"}
            </h1>
            <Link href="/results">
              <Button variant="secondary">Back to program</Button>
            </Link>
          </OnImage>
        </div>
      </BackgroundShell>
    );
  }

  const activeSession = daySessions[historyIndex] ?? null;
  const previousSession = daySessions[historyIndex + 1] ?? null;
  const activeSessionDate = activeSession
    ? (activeSession.completedAt ?? activeSession.updatedAt ?? activeSession.createdAt).slice(0, 10)
    : null;
  const activeSessionLogs = activeSession
    ? logs.filter((log) => log.sessionId === activeSession.id)
    : [];
  const previousSessionLogs = previousSession
    ? logs.filter((log) => log.sessionId === previousSession.id)
    : [];

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
              <Link href="/results">
                <Button variant="secondary">Back to Program</Button>
              </Link>
            </div>
            <p className="text-xs text-slate-200">
              {isLoading
                ? "Loading performance history..."
                : `Logs found: ${logs.length}`}
            </p>
            <div className="flex flex-wrap gap-2">
              {program.week.map((programDay, index) => (
                <button
                  key={`${programDay.title}-${index}`}
                  type="button"
                  onClick={() => navigateDay(index)}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                    index === dayIndex
                      ? "border-white bg-white text-slate-900"
                      : "border-slate-300/80 bg-slate-900/20 text-slate-100 hover:border-white"
                  }`}
                  disabled={isFreePlan}
                >
                  {programDay.title}
                </button>
              ))}
            </div>
            {isFreePlan ? (
              <p className="text-xs text-slate-200">
                Free plan shows Day 1 history only. Upgrade to switch days.
              </p>
            ) : null}
          </header>
        </OnImage>
        <div className="ui-card p-5 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="ui-kicker">
                Day Performance
              </p>
              <p className="ui-body">
                {activeSessionDate
                  ? `Recorded session: ${activeSessionDate}`
                  : "No completed session yet for this day."}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigateHistory(historyIndex - 1)}
                disabled={historyIndex <= 0}
                className="rounded-full border border-slate-200 px-3 py-1 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ←
              </button>
              <span className="text-xs font-semibold text-slate-500">
                {daySessions.length ? `${historyIndex + 1}/${daySessions.length}` : "0/0"}
              </span>
              <button
                type="button"
                onClick={() => navigateHistory(historyIndex + 1)}
                disabled={historyIndex >= daySessions.length - 1}
                className="rounded-full border border-slate-200 px-3 py-1 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                →
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {sectionGroups.map((group) => {
              return (
                <span
                  key={group.sectionKey}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600"
                >
                  {group.sectionTitle} ({group.items.length})
                </span>
              );
            })}
          </div>
          {!daySessions.length ? (
            <p className="mt-3 ui-body">
              No recorded workouts yet for this day. Start this day to create the first dated entry.
            </p>
          ) : null}

          <div
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            className="mt-4 space-y-4"
          >
            {sectionGroups.map((group) => (
              <section key={group.sectionKey} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="ui-title">{group.sectionTitle}</h3>
                <div className="mt-3 space-y-3">
                  {group.items.map((item, index) => {
                    const exercise = exerciseById(item.exerciseId);
                    const historyIds = new Set(resolveExerciseHistoryIds(item.exerciseId, 0));
                    if (!historyIds.size) historyIds.add(item.exerciseId);
                    const matchesExerciseHistory = (log: ExerciseLog) => {
                      if (historyIds.has(log.exerciseId)) return true;
                      if (log.originalExerciseId && historyIds.has(log.originalExerciseId)) return true;
                      if (log.substitutedExerciseId && historyIds.has(log.substitutedExerciseId)) return true;
                      return false;
                    };
                    const lastLog = activeSessionLogs.find(matchesExerciseHistory) ?? null;
                    const prevLog = previousSessionLogs.find(matchesExerciseHistory) ?? null;
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
                    const latestWorkSeconds = lastLog?.workSecondsUsed ?? null;
                    const prescribedLine =
                      item.loadType === "timed"
                        ? `${latestWorkSeconds ?? item.durationSec ?? 60} sec`
                        : item.reps ?? exercise?.durationOrReps ?? "As prescribed";
                    const nextLine = recommendation
                      ? `Next: ${formatRecommendation(recommendation)}`
                      : "Next: Keep targets consistent";
                    const deltaPills = getHistoryDeltaPills(lastLog, prevLog);
                    const thisSessionRow = formatHistorySchemaRow(lastLog);
                    const previousSessionRow = formatHistorySchemaRow(prevLog);
                    return (
                      <article
                        key={`${group.sectionKey}-${item.exerciseId}-${index}`}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="truncate ui-title">
                              {exercise?.name ?? "Exercise"}
                            </p>
                            <p className="mt-1 ui-body font-semibold text-slate-700">{nextLine}</p>
                            <p className="mt-1 ui-body">Prescribed: {prescribedLine}</p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold text-slate-500">
                            <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5">
                              {metaLabel}
                            </span>
                          </div>
                        </div>

                        <div className="mt-2 flex flex-col gap-1.5">
                          <span className="ui-row-schema" data-testid="history-row-current">
                            This session: {thisSessionRow}
                          </span>
                          <span className="ui-row-schema" data-testid="history-row-previous">
                            Previous: {previousSessionRow}
                          </span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {deltaPills.length ? (
                            deltaPills.map((pill) => (
                              <span
                                key={pill}
                                className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700"
                              >
                                {pill}
                              </span>
                            ))
                          ) : (
                            <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                              No measurable delta
                            </span>
                          )}
                        </div>

                        <div className="mt-3 border-t border-slate-200/80 pt-3 text-xs text-slate-600">
                          {activeSessionDate ? (
                            <p className="text-[11px] text-slate-500">
                              Session date: {activeSessionDate}
                            </p>
                          ) : null}

                          {recommendation ? (
                            <div className="mt-2">
                              {recommendation.safetyFlag ? (
                                <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-900">
                                  Safety
                                </span>
                              ) : null}
                              <p className="mt-2 text-[11px] font-semibold text-slate-900">Why this next step</p>
                              <p className="text-[11px] text-slate-500">{recommendation.reason}</p>
                            </div>
                          ) : null}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </BackgroundShell>
  );
}
