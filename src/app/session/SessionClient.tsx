"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { exerciseById } from "@/lib/exercises";
import { generateRoutine } from "@/lib/routine";
import { normalizeEquipmentSelectionValues } from "@/lib/equipment";
import BackgroundShell from "@/components/BackgroundShell";
import OnImage from "@/components/OnImage";
import Button from "@/components/ui/Button";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import type {
  ExerciseLog,
  LogPrefs,
  Program,
  ProgramProgress,
  ProgramRoutineItem,
  SessionRecord,
} from "@/lib/types";
import {
  createSession,
  getLatestExerciseLog,
  getProgram,
  init,
  getProgramProgress,
  loadPrefs,
  saveExerciseLog,
  savePrefs,
  saveProgramProgress,
  uuid,
  nowIso,
} from "@/lib/logStore";

const STORAGE_KEY = "posture_questionnaire";

type FeedbackEntry = "easy" | "good" | "hard";

const parseSetsRange = (sets?: string | number) => {
  if (typeof sets === "number") {
    return { minSets: sets, maxSets: sets };
  }
  if (!sets) return { minSets: 1, maxSets: 1 };
  const cleaned = sets.replace("–", "-");
  const parts = cleaned.split("-").map((part) => Number(part.trim()));
  const minSets = Number.isFinite(parts[0]) ? parts[0] : 1;
  const maxSets = Number.isFinite(parts[1]) ? parts[1] : minSets;
  return {
    minSets: Math.max(1, minSets),
    maxSets: Math.max(1, maxSets),
  };
};

const parseFirstNumber = (value?: string) => {
  if (!value) return null;
  const match = value.match(/\d+/);
  return match ? Number(match[0]) : null;
};

export default function SessionClient() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<QuestionnaireData | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState(0);
  const [workSeconds, setWorkSeconds] = useState(60);
  const [restSeconds, setRestSeconds] = useState(60);
  const [restRunning, setRestRunning] = useState(false);
  const [restSecondsLeft, setRestSecondsLeft] = useState(60);
  const [completedSets, setCompletedSets] = useState<Record<string, boolean[]>>(
    {}
  );
  const [selectedSets, setSelectedSets] = useState<Record<string, number>>({});
  const [sessionComplete, setSessionComplete] = useState(false);
  const [summary, setSummary] = useState<SessionRecord | null>(null);
  const [summaryStats, setSummaryStats] = useState<{
    completedExercises: number;
    estimatedMinutes: number;
  } | null>(null);
  const [feedback, setFeedback] = useState<Record<string, FeedbackEntry>>({});
  const [prefs, setPrefs] = useState<LogPrefs | null>(null);
  const [lastLog, setLastLog] = useState<ExerciseLog | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionStartedAt, setSessionStartedAt] = useState<string | null>(null);
  const [program, setProgram] = useState<Program | null>(null);
  const [programDayIndex, setProgramDayIndex] = useState<number | null>(null);
  const [programProgress, setProgramProgress] =
    useState<ProgramProgress | null>(null);
  const [tipIndex, setTipIndex] = useState(0);
  const [unitByExercise, setUnitByExercise] = useState<
    Record<string, "lb" | "kg">
  >({});
  const [weightByExercise, setWeightByExercise] = useState<
    Record<string, string>
  >({});
  const [notesByExercise, setNotesByExercise] = useState<Record<string, string>>(
    {}
  );
  const [repsModeByExercise, setRepsModeByExercise] = useState<
    Record<string, "single" | "per-set">
  >({});
  const [repsByExercise, setRepsByExercise] = useState<Record<string, string>>(
    {}
  );
  const [repsBySetByExercise, setRepsBySetByExercise] = useState<
    Record<string, string[]>
  >({});

  useEffect(() => {
    const load = async () => {
      await init();
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<QuestionnaireData>;
        setData({
          goals: parsed.goals ?? "Improve posture",
          painAreas: parsed.painAreas ?? [],
          experience: parsed.experience ?? "Beginner",
          equipment: normalizeEquipmentSelectionValues(
            parsed.equipment ?? ["none"]
          ),
          daysPerWeek: parsed.daysPerWeek ?? 3,
        });
      }

      const storedPrefs = await loadPrefs();
      setPrefs(storedPrefs);
      if (storedPrefs.timerPrefs?.workSeconds) {
        setWorkSeconds(storedPrefs.timerPrefs.workSeconds);
      }
      if (storedPrefs.timerPrefs?.restSeconds) {
        setRestSeconds(storedPrefs.timerPrefs.restSeconds);
      }
      if (storedPrefs.feedbackByExercise) {
        setFeedback(storedPrefs.feedbackByExercise);
      }

      const programId = searchParams.get("programId");
      const dayIndexRaw = searchParams.get("dayIndex");
      const dayIndex = dayIndexRaw ? Number(dayIndexRaw) : null;
      if (programId) {
        const loadedProgram = await getProgram(programId);
        if (loadedProgram) {
          setProgram(loadedProgram);
          setProgramDayIndex(
            Number.isFinite(dayIndex) ? (dayIndex as number) : 0
          );
          const progress = await getProgramProgress(loadedProgram.id);
          setProgramProgress(progress);
        }
      }
    };
    load();
  }, [searchParams]);

  const routine = useMemo(() => {
    if (!data) return null;
    return generateRoutine(data);
  }, [data]);

  const flatItems = useMemo(() => {
    if (program && programDayIndex !== null) {
      const day = program.week.find((entry) => entry.dayIndex === programDayIndex);
      if (!day) return [];
      return day.routine.map((item) => {
        const exercise = exerciseById(item.exerciseId);
        const routineItem = item as ProgramRoutineItem;
        return {
          exerciseId: routineItem.exerciseId,
          sets: routineItem.sets ?? "1",
          reps: routineItem.reps ?? "",
          durationSec: routineItem.durationSec ?? undefined,
          restSec: routineItem.restSec ?? 60,
          section: day.title,
          id: `${day.title}-${routineItem.exerciseId}`,
          name: exercise?.name ?? "Exercise",
          cues: routineItem.cues ?? exercise?.cues ?? [],
          mistake: exercise?.mistakes?.[0] ?? "Keep form controlled",
          duration: exercise?.durationOrReps ?? routineItem.reps ?? "",
          loadType: routineItem.loadType ?? exercise?.loadType ?? "bodyweight",
        };
      });
    }

    if (!routine) return [];
    return routine.sections.flatMap((section) =>
      section.items.map((item) => {
        const exercise = exerciseById(item.exerciseId);
        return {
          ...item,
          section: section.title,
          id: `${section.title}-${item.exerciseId}`,
          name: exercise?.name ?? "Exercise",
          cues: exercise?.cues ?? [],
          mistake: exercise?.mistakes?.[0] ?? "Keep form controlled",
          duration: exercise?.durationOrReps ?? item.reps,
          loadType: exercise?.loadType ?? "bodyweight",
        };
      })
    );
  }, [program, programDayIndex, routine]);

  const currentItem = flatItems[activeIndex];
  const totalItems = flatItems.length;
  const tips = [
    "Breathe steadily",
    "Move with control",
    "Maintain posture",
    "Relax your jaw and neck",
    "Smooth tempo over speed",
  ];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTipIndex((prev) => (prev + 1) % tips.length);
    }, 12000);
    return () => window.clearInterval(timer);
  }, [tips.length]);

  useEffect(() => {
    if (!currentItem) return;
    if (currentItem.durationSec) {
      setTimerSecondsLeft(workSeconds);
      setTimerRunning(false);
    } else {
      setTimerSecondsLeft(0);
      setTimerRunning(false);
    }
  }, [currentItem, workSeconds]);

  useEffect(() => {
    if (!timerRunning || timerSecondsLeft <= 0) return;
    const timer = window.setInterval(() => {
      setTimerSecondsLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [timerRunning, timerSecondsLeft]);

  useEffect(() => {
    if (!restRunning || restSecondsLeft <= 0) return;
    const timer = window.setInterval(() => {
      setRestSecondsLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [restRunning, restSecondsLeft]);

  useEffect(() => {
    setRestSecondsLeft(restSeconds);
    setRestRunning(false);
  }, [restSeconds]);

  const toggleSetComplete = (exerciseId: string, index: number) => {
    setCompletedSets((prev) => {
      const current = prev[exerciseId] ?? [];
      const next = [...current];
      next[index] = !next[index];
      return { ...prev, [exerciseId]: next };
    });
  };

  const updateSelectedSets = (exerciseId: string, nextCount: number) => {
    setSelectedSets((prev) => ({ ...prev, [exerciseId]: nextCount }));
    setCompletedSets((prev) => {
      const current = prev[exerciseId] ?? [];
      const next = current.slice(0, nextCount);
      while (next.length < nextCount) next.push(false);
      return { ...prev, [exerciseId]: next };
    });
  };

  const saveFeedback = async (next: Record<string, FeedbackEntry>) => {
    setFeedback(next);
    const nextPrefs: LogPrefs = {
      ...(prefs ?? { schemaVersion: 1 }),
      timerPrefs: prefs?.timerPrefs,
      feedbackByExercise: next,
    };
    setPrefs(nextPrefs);
    await savePrefs(nextPrefs);
  };

  const updateTimerPrefs = async (next: {
    workSeconds: number;
    restSeconds: number;
  }) => {
    const nextPrefs: LogPrefs = {
      ...(prefs ?? { schemaVersion: 1 }),
      timerPrefs: next,
      feedbackByExercise: prefs?.feedbackByExercise,
    };
    setPrefs(nextPrefs);
    await savePrefs(nextPrefs);
  };

  const handleNext = () => {
    setRestRunning(false);
    if (activeIndex < totalItems - 1) {
      setActiveIndex((prev) => prev + 1);
    } else {
      handleCompleteSession();
    }
  };

  const handleBack = () => {
    setRestRunning(false);
    setActiveIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleStartNewSession = () => {
    setSessionId(uuid());
    setSessionStartedAt(nowIso());
    setSessionComplete(false);
    setSummary(null);
    setSummaryStats(null);
    setActiveIndex(0);
    setCompletedSets({});
  };

  const handleCompleteSession = async () => {
    const sessionIdValue = sessionId ?? uuid();
    const startedAt = sessionStartedAt ?? nowIso();
    const completedAt = nowIso();
    const totalSeconds = flatItems.reduce(
      (sum, item) => sum + (item.durationSec ?? 60),
      0
    );
    const estimatedMinutes = Math.max(
      1,
      Math.round((totalSeconds + restSeconds * totalItems) / 60)
    );

    const sessionRecord: SessionRecord = {
      id: sessionIdValue,
      userId: null,
      startedAt,
      completedAt,
      createdAt: startedAt,
      updatedAt: completedAt,
      routineId: program?.id ?? null,
      durationSec: estimatedMinutes * 60,
      notes:
        program && programDayIndex !== null
          ? `dayIndex:${programDayIndex}`
          : null,
      source: "local",
      deletedAt: null,
    };

    await createSession(sessionRecord);

    const logsToSave: ExerciseLog[] = flatItems.map((item) => {
      const exerciseId = item.exerciseId;
      const unit = unitByExercise[exerciseId] ?? "lb";
      const weightValue = weightByExercise[exerciseId];
      const weight =
        item.loadType === "weighted" && weightValue ? Number(weightValue) : null;
      const repsMode = repsModeByExercise[exerciseId] ?? "single";
      const repsValue = repsByExercise[exerciseId];
      const reps = repsValue ? Number(repsValue) : null;
      const repsBySet =
        repsMode === "per-set"
          ? (repsBySetByExercise[exerciseId] ?? []).map((value) =>
              value ? Number(value) : 0
            )
          : null;
      const setsPlanned = selectedSets[item.id] ?? parseSetsRange(item.sets).minSets;
      const setsCompleted = (completedSets[item.id] ?? []).filter(Boolean)
        .length;
      const volumeFromReps =
        weight && reps
          ? weight * reps * Math.max(1, setsCompleted)
          : null;
      const volumeFromSets =
        weight && repsBySet
          ? repsBySet.reduce((sum, value) => sum + value, 0) * weight
          : null;

      return {
        id: uuid(),
        userId: null,
        sessionId: sessionIdValue,
        exerciseId,
        createdAt: completedAt,
        updatedAt: completedAt,
        loadType: item.loadType,
        unit: item.loadType === "weighted" ? unit : null,
        weight,
        reps: repsMode === "single" ? reps : null,
        repsBySet: repsMode === "per-set" ? repsBySet : null,
        setsPlanned,
        setsCompleted,
        durationSec: item.durationSec ?? null,
        rpe: null,
        felt: feedback[item.id] ?? null,
        notes: notesByExercise[exerciseId]?.trim() || null,
        computedVolume: volumeFromReps ?? volumeFromSets ?? null,
        source: "local",
        deletedAt: null,
      };
    });

    await Promise.all(logsToSave.map((log) => saveExerciseLog(log)));

    const completedExercises = totalItems;
    setSummary(sessionRecord);
    setSummaryStats({ completedExercises, estimatedMinutes });
    setSessionComplete(true);

    if (program && programDayIndex !== null) {
      const completed = new Set(
        programProgress?.completedDayIndices ?? []
      );
      completed.add(programDayIndex);
      const nextIndex =
        programDayIndex + 1 < program.daysPerWeek ? programDayIndex + 1 : 0;
      const progress: ProgramProgress = {
        programId: program.id,
        lastCompletedDayIndex: programDayIndex,
        nextDayIndex: nextIndex,
        completedDayIndices: Array.from(completed),
        updatedAt: completedAt,
      };
      await saveProgramProgress(progress);
      setProgramProgress(progress);
    }
  };

  const { minSets, maxSets } = parseSetsRange(currentItem?.sets);
  const currentSelectedSets =
    currentItem && selectedSets[currentItem.id]
      ? selectedSets[currentItem.id]
      : minSets;
  const checks =
    completedSets[currentItem?.id ?? ""] ??
    Array.from({ length: currentSelectedSets }, () => false);
  const allSetsCompleted =
    checks.length > 0 && checks.every((value) => Boolean(value));

  useEffect(() => {
    if (!currentItem) return;
    const loadLast = async () => {
      const latest = await getLatestExerciseLog(currentItem.exerciseId);
      setLastLog(latest);
    };
    loadLast();
  }, [currentItem?.exerciseId]);

  useEffect(() => {
    if (!currentItem) return;
    updateSelectedSets(currentItem.id, currentSelectedSets);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentItem?.id, currentSelectedSets]);

  const adjustTimer = (
    type: "work" | "rest",
    delta: number,
    fallback: number
  ) => {
    if (type === "work") {
      const next = Math.max(15, (workSeconds || fallback) + delta);
      setWorkSeconds(next);
      setTimerSecondsLeft(next);
      updateTimerPrefs({ workSeconds: next, restSeconds });
      return;
    }
    const next = Math.max(15, (restSeconds || fallback) + delta);
    setRestSeconds(next);
    setRestSecondsLeft(next);
    updateTimerPrefs({ workSeconds, restSeconds: next });
  };

  const applyTimerPreset = (type: "work" | "rest", value: number) => {
    if (type === "work") {
      setWorkSeconds(value);
      setTimerSecondsLeft(value);
      updateTimerPrefs({ workSeconds: value, restSeconds });
      return;
    }
    setRestSeconds(value);
    setRestSecondsLeft(value);
    updateTimerPrefs({ workSeconds, restSeconds: value });
  };

  useEffect(() => {
    if (!currentItem) return;
    updateSelectedSets(currentItem.id, currentSelectedSets);

    const exerciseId = currentItem.exerciseId;
    if (!unitByExercise[exerciseId]) {
      setUnitByExercise((prev) => ({ ...prev, [exerciseId]: "lb" }));
    }

    if (lastLog && !weightByExercise[exerciseId] && lastLog.weight) {
      setWeightByExercise((prev) => ({
        ...prev,
        [exerciseId]: String(lastLog.weight),
      }));
    }

    if (!repsByExercise[exerciseId] && !currentItem.durationSec) {
      const defaultReps = parseFirstNumber(currentItem.reps);
      if (defaultReps) {
        setRepsByExercise((prev) => ({
          ...prev,
          [exerciseId]: String(defaultReps),
        }));
      }
    }

    if (!repsModeByExercise[exerciseId]) {
      setRepsModeByExercise((prev) => ({
        ...prev,
        [exerciseId]: "single",
      }));
    }
  }, [currentItem?.id, currentSelectedSets, lastLog]);

  useEffect(() => {
    if (!sessionId) setSessionId(uuid());
    if (!sessionStartedAt) setSessionStartedAt(nowIso());
  }, [sessionId, sessionStartedAt]);

  if (!data || !routine) {
    return (
      <BackgroundShell>
        <div className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-12">
          <OnImage>
            <h1 className="text-2xl font-semibold text-white">
              We need your questionnaire first
            </h1>
            <p className="text-sm text-slate-200">
              Complete the questionnaire to build your routine and start a
              session.
            </p>
            <Link href="/questionnaire">
              <Button variant="primary">Go to questionnaire</Button>
            </Link>
          </OnImage>
        </div>
      </BackgroundShell>
    );
  }

  if (sessionComplete && summary && summaryStats) {
    return (
      <BackgroundShell>
        <div className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-12">
          <OnImage>
            <h1 className="text-3xl font-semibold text-white">
              Session complete
            </h1>
          </OnImage>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-600">
              You completed {summaryStats.completedExercises} exercises in about{" "}
              {summaryStats.estimatedMinutes} minutes.
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Great work staying consistent today.
            </p>
          </div>
          <OnImage className="flex flex-wrap gap-3">
            <Button variant="primary" onClick={handleStartNewSession}>
              Start another session
            </Button>
            <Link href="/results">
              <Button variant="secondary">Back to results</Button>
            </Link>
          </OnImage>
        </div>
      </BackgroundShell>
    );
  }

  return (
    <BackgroundShell>
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-12">
        <OnImage>
          <header className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-200">
              Guided session
            </p>
            <h1 className="text-3xl font-semibold text-white">
              {currentItem.section}: {currentItem.name}
            </h1>
            <p className="text-sm text-slate-200">
              {currentItem.sets} sets • {currentItem.duration ?? currentItem.reps}
            </p>
          </header>
        </OnImage>

        <div className="sticky top-3 z-10 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-900 shadow-lg coach-tip-pulse">
          Coaching tip: <span className="text-slate-900">{tips[tipIndex]}</span>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          {currentItem.durationSec ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between text-sm font-semibold text-slate-900">
                <span>Exercise timer</span>
                <span>
                  {Math.floor(timerSecondsLeft / 60)
                    .toString()
                    .padStart(1, "0")}
                  :
                  {(timerSecondsLeft % 60).toString().padStart(2, "0")}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setTimerRunning((prev) => !prev)}
                  className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
                >
                  {timerRunning ? "Pause" : "Start timer"}
                </button>
                <button
                  type="button"
                  onClick={() => setTimerSecondsLeft(workSeconds)}
                  className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700"
                >
                  Reset
                </button>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                <span className="font-semibold text-slate-900">Work timer</span>
                <button
                  type="button"
                  onClick={() => adjustTimer("work", -15, 60)}
                  className="rounded-full border border-slate-200 px-3 py-1 font-semibold text-slate-700"
                >
                  -15s
                </button>
                <button
                  type="button"
                  onClick={() => adjustTimer("work", 15, 60)}
                  className="rounded-full border border-slate-200 px-3 py-1 font-semibold text-slate-700"
                >
                  +15s
                </button>
                {[30, 45, 60, 90, 120].map((value) => (
                  <button
                    key={`work-${value}`}
                    type="button"
                    onClick={() => applyTimerPreset("work", value)}
                    className={`rounded-full border px-3 py-1 font-semibold ${
                      workSeconds === value
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 text-slate-700"
                    }`}
                  >
                    {value}s
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-6 space-y-2 text-sm text-slate-700">
            <p className="font-semibold text-slate-900">Cues</p>
            <ul className="list-disc pl-5">
              {currentItem.cues.map((cue) => (
                <li key={cue}>{cue}</li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-slate-500">
              Common mistake: {currentItem.mistake}
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold text-slate-900">
              Log this exercise
            </p>
            {lastLog ? (
              <p className="text-xs text-slate-500">
                Last time:{" "}
                {lastLog.weight
                  ? `${lastLog.weight}${lastLog.unit ?? ""}`
                  : currentItem.loadType === "timed"
                  ? "Timed"
                  : currentItem.loadType === "assisted"
                  ? "Assisted"
                  : "Bodyweight"}{" "}
                {lastLog.reps ? `x ${lastLog.reps} reps` : ""}
              </p>
            ) : null}
          </div>

          <div className="mt-4 grid gap-3">
            {currentItem.loadType === "weighted" ? (
              <div className="flex flex-wrap items-center gap-2">
                <label className="text-xs font-semibold text-slate-700">
                  Weight
                </label>
                <input
                  type="number"
                  min={0}
                  value={weightByExercise[currentItem.exerciseId] ?? ""}
                  onChange={(event) =>
                    setWeightByExercise((prev) => ({
                      ...prev,
                      [currentItem.exerciseId]: event.target.value,
                    }))
                  }
                  className="w-28 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 shadow-sm outline-none focus-visible:border-slate-900 focus-visible:ring-2 focus-visible:ring-slate-900/20"
                />
                <div className="flex rounded-full border border-slate-200 p-1 text-xs">
                  {(["lb", "kg"] as const).map((unit) => (
                    <button
                      key={unit}
                      type="button"
                      onClick={() =>
                        setUnitByExercise((prev) => ({
                          ...prev,
                          [currentItem.exerciseId]: unit,
                        }))
                      }
                      className={`rounded-full px-3 py-1 font-semibold ${
                        (unitByExercise[currentItem.exerciseId] ?? "lb") === unit
                          ? "bg-slate-900 text-white"
                          : "text-slate-600"
                      }`}
                    >
                      {unit}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs font-semibold text-slate-600">
                Load:{" "}
                {currentItem.loadType === "timed"
                  ? "Timed"
                  : currentItem.loadType === "assisted"
                  ? "Assisted"
                  : "Bodyweight"}
              </p>
            )}

            {!currentItem.durationSec ? (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                  <span className="font-semibold text-slate-700">Reps</span>
                  <button
                    type="button"
                    onClick={() =>
                      setRepsModeByExercise((prev) => ({
                        ...prev,
                        [currentItem.exerciseId]: "single",
                      }))
                    }
                    className={`rounded-full border px-3 py-1 font-semibold ${
                      (repsModeByExercise[currentItem.exerciseId] ?? "single") ===
                      "single"
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 text-slate-700"
                    }`}
                  >
                    Same for all sets
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setRepsModeByExercise((prev) => ({
                        ...prev,
                        [currentItem.exerciseId]: "per-set",
                      }))
                    }
                    className={`rounded-full border px-3 py-1 font-semibold ${
                      repsModeByExercise[currentItem.exerciseId] === "per-set"
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 text-slate-700"
                    }`}
                  >
                    Per set
                  </button>
                </div>

                {(repsModeByExercise[currentItem.exerciseId] ?? "single") ===
                "single" ? (
                  <input
                    type="number"
                    min={1}
                    value={repsByExercise[currentItem.exerciseId] ?? ""}
                    onChange={(event) =>
                      setRepsByExercise((prev) => ({
                        ...prev,
                        [currentItem.exerciseId]: event.target.value,
                      }))
                    }
                    className="w-28 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 shadow-sm outline-none focus-visible:border-slate-900 focus-visible:ring-2 focus-visible:ring-slate-900/20"
                  />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: currentSelectedSets }).map(
                      (_, index) => {
                        const values =
                          repsBySetByExercise[currentItem.exerciseId] ?? [];
                        return (
                          <input
                            key={`${currentItem.exerciseId}-reps-${index}`}
                            type="number"
                            min={1}
                            value={values[index] ?? ""}
                            onChange={(event) =>
                              setRepsBySetByExercise((prev) => {
                                const current = prev[currentItem.exerciseId]
                                  ? [...prev[currentItem.exerciseId]]
                                  : Array.from(
                                      { length: currentSelectedSets },
                                      () => ""
                                    );
                                current[index] = event.target.value;
                                return {
                                  ...prev,
                                  [currentItem.exerciseId]: current,
                                };
                              })
                            }
                            className="w-20 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 shadow-sm outline-none focus-visible:border-slate-900 focus-visible:ring-2 focus-visible:ring-slate-900/20"
                            placeholder={`Set ${index + 1}`}
                          />
                        );
                      }
                    )}
                  </div>
                )}
              </div>
            ) : null}

            <div>
              <label className="text-xs font-semibold text-slate-700">
                Notes (optional)
              </label>
              <textarea
                value={notesByExercise[currentItem.exerciseId] ?? ""}
                onChange={(event) =>
                  setNotesByExercise((prev) => ({
                    ...prev,
                    [currentItem.exerciseId]: event.target.value,
                  }))
                }
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 shadow-sm outline-none focus-visible:border-slate-900 focus-visible:ring-2 focus-visible:ring-slate-900/20"
                rows={2}
                placeholder="How did it feel?"
              />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold text-slate-900">Sets</p>
            {maxSets > minSets ? (
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span className="font-semibold text-slate-900">Sets</span>
                <button
                  type="button"
                  onClick={() =>
                    updateSelectedSets(
                      currentItem.id,
                      Math.max(minSets, currentSelectedSets - 1)
                    )
                  }
                  className="rounded-full border border-slate-200 px-3 py-1 font-semibold text-slate-700"
                >
                  -
                </button>
                <span className="w-6 text-center font-semibold text-slate-900">
                  {currentSelectedSets}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    updateSelectedSets(
                      currentItem.id,
                      Math.min(maxSets, currentSelectedSets + 1)
                    )
                  }
                  className="rounded-full border border-slate-200 px-3 py-1 font-semibold text-slate-700"
                >
                  +
                </button>
              </div>
            ) : null}
          </div>
          <div className="mt-3 flex flex-wrap gap-3">
            {Array.from({ length: currentSelectedSets }).map((_, index) => (
              <label
                key={`${currentItem.id}-set-${index}`}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700"
              >
                <input
                  type="checkbox"
                  checked={Boolean(checks[index])}
                  onChange={() =>
                    toggleSetComplete(currentItem.id, index)
                  }
                  className="h-4 w-4 accent-slate-900"
                />
                Set {index + 1}
              </label>
            ))}
          </div>
        </div>

        {allSetsCompleted ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">
              How did that feel?
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(["easy", "good", "hard"] as FeedbackEntry[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() =>
                    saveFeedback({
                      ...feedback,
                      [currentItem.id]: option,
                    })
                  }
                  className={`rounded-full border px-4 py-2 text-xs font-semibold ${
                    feedback[currentItem.id] === option
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 text-slate-700"
                  }`}
                >
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">Rest timer</p>
              <p className="text-xs text-slate-500">
                Default {restSeconds}s between sets
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-sm font-semibold text-slate-900">
            <span>Rest countdown</span>
            <span>
              {Math.floor(restSecondsLeft / 60)
                .toString()
                .padStart(1, "0")}
              :
              {(restSecondsLeft % 60).toString().padStart(2, "0")}
            </span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setRestRunning((prev) => !prev)}
              className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
            >
              {restRunning ? "Pause rest" : "Start rest"}
            </button>
            <button
              type="button"
              onClick={() => setRestSecondsLeft(restSeconds)}
              className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700"
            >
              Reset rest
            </button>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-600">
            <span className="font-semibold text-slate-900">Rest timer</span>
            <button
              type="button"
              onClick={() => adjustTimer("rest", -15, 60)}
              className="rounded-full border border-slate-200 px-3 py-1 font-semibold text-slate-700"
            >
              -15s
            </button>
            <button
              type="button"
              onClick={() => adjustTimer("rest", 15, 60)}
              className="rounded-full border border-slate-200 px-3 py-1 font-semibold text-slate-700"
            >
              +15s
            </button>
            {[30, 45, 60, 90, 120].map((value) => (
              <button
                key={`rest-${value}`}
                type="button"
                onClick={() => applyTimerPreset("rest", value)}
                className={`rounded-full border px-3 py-1 font-semibold ${
                  restSeconds === value
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 text-slate-700"
                }`}
              >
                {value}s
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <OnImage className="flex flex-wrap items-center gap-3">
            <Link href="/results">
              <Button variant="secondary">Exit session</Button>
            </Link>
            <Button
              type="button"
              variant="secondary"
              onClick={handleBack}
              disabled={activeIndex === 0}
            >
              Back
            </Button>
          </OnImage>
          <div className="text-xs font-semibold text-slate-500">
            {activeIndex + 1} / {totalItems}
          </div>
          <Button type="button" variant="primary" onClick={handleNext}>
            {activeIndex === totalItems - 1 ? "Finish session" : "Next"}
          </Button>
        </div>
      </div>
    </BackgroundShell>
  );
}
