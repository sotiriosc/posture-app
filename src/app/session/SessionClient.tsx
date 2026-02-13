"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { exerciseById } from "@/lib/exercises";
import { generateRoutine } from "@/lib/routine";
import { normalizeEquipmentSelectionValues } from "@/lib/equipment";
import BackgroundShell from "@/components/BackgroundShell";
import OnImage from "@/components/OnImage";
import Button from "@/components/ui/Button";
import DualModeTimer from "@/components/DualModeTimer";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import { loadAppState, saveAppState } from "@/lib/appState";
import { getEffectiveTimer } from "@/lib/timerRules";
import { saveSessionDropoffTelemetry } from "@/lib/telemetry";
import {
  clearDraft,
  loadDraft,
  saveDraft,
  type SessionDraft,
} from "@/lib/sessionDraftStore";
import type {
  ExerciseFeedback,
  ExerciseLog,
  LogPrefs,
  PainLocation,
  Program,
  ProgramProgress,
  ProgramRoutineItem,
  SessionRecord,
} from "@/lib/types";
import {
  createSession,
  getProgram,
  init,
  getProgramProgress,
  listExerciseLogsByExerciseHistory,
  loadPrefs,
  saveExerciseLog,
  savePrefs,
  saveProgramProgress,
  updateSession,
  uuid,
  nowIso,
} from "@/lib/logStore";

const STORAGE_KEY = "posture_questionnaire";

type FeedbackEntry = "easy" | "moderate" | "hard" | "pain";

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

const normalizeDaysPerWeek = (value: unknown): 3 | 4 | 5 => {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string"
      ? Number(value)
      : NaN;
  return parsed === 4 || parsed === 5 ? parsed : 3;
};

export default function SessionClient() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<QuestionnaireData | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [workSeconds, setWorkSeconds] = useState(60);
  const [restSeconds, setRestSeconds] = useState(60);
  const [timerConfig, setTimerConfig] = useState<{ workSeconds: number; restSeconds: number }>({
    workSeconds: 60,
    restSeconds: 60,
  });
  const [timerByExercise, setTimerByExercise] = useState<
    Record<string, { workSeconds: number; restSeconds: number }>
  >({});
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
  const [feedback, setFeedback] = useState<Record<string, ExerciseFeedback>>(
    {}
  );
  const [sessionFeedback, setSessionFeedback] =
    useState<ExerciseFeedback | null>(null);
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
  const [repsByExercise, setRepsByExercise] = useState<Record<string, string>>(
    {}
  );
  const [substitutionByExercise, setSubstitutionByExercise] = useState<
    Record<string, string>
  >({});
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const saveStateTimerRef = useRef<number | null>(null);
  const dropoffTrackedRef = useRef(false);
  const sessionCompleteRef = useRef(false);
  const activeIndexRef = useRef(0);
  const sessionIdRef = useRef<string | null>(null);

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
          daysPerWeek: normalizeDaysPerWeek(parsed.daysPerWeek),
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
      if (storedPrefs.timerPrefsByExercise) {
        setTimerByExercise(storedPrefs.timerPrefsByExercise);
      }
      if (storedPrefs.loadPrefsByExercise) {
        const entries = Object.entries(storedPrefs.loadPrefsByExercise);
        setUnitByExercise(
          Object.fromEntries(
            entries
              .filter(([, value]) => value.unit === "lb" || value.unit === "kg")
              .map(([key, value]) => [key, value.unit as "lb" | "kg"])
          )
        );
        setWeightByExercise(
          Object.fromEntries(
            entries
              .filter(([, value]) => typeof value.weight === "string")
              .map(([key, value]) => [key, value.weight as string])
          )
        );
        setRepsByExercise(
          Object.fromEntries(
            entries
              .filter(([, value]) => typeof value.reps === "string")
              .map(([key, value]) => [key, value.reps as string])
          )
        );
      }
      if (storedPrefs.feedbackByExercise) {
        const normalized = Object.fromEntries(
          Object.entries(storedPrefs.feedbackByExercise).map(([key, value]) => {
            if (typeof value === "string") {
              const rating =
                value === "good"
                  ? "moderate"
                  : (value as FeedbackEntry);
              return [
                key,
                { rating, painLocation: null, notes: "" } as ExerciseFeedback,
              ];
            }
            return [
              key,
              {
                rating: value.rating,
                painLocation: value.painLocation ?? null,
                notes: value.notes ?? "",
              } as ExerciseFeedback,
            ];
          })
        );
        setFeedback(normalized);
      }
      if (storedPrefs.substitutionByExercise) {
        setSubstitutionByExercise(storedPrefs.substitutionByExercise);
      }

      const programId = searchParams.get("programId");
      const dayIndexRaw = searchParams.get("dayIndex");
      const resumeId = searchParams.get("resumeSessionId");
      const dayIndex = dayIndexRaw ? Number(dayIndexRaw) : null;
      if (programId) {
        const loadedProgram = await getProgram(programId);
        if (loadedProgram) {
          const progress = await getProgramProgress(loadedProgram.id);
          const fallbackDayIndex =
            progress && Number.isFinite(progress.nextDayIndex)
              ? progress.nextDayIndex
              : 0;
          const requestedDayIndex = Number.isFinite(dayIndex) ? (dayIndex as number) : fallbackDayIndex;
          const boundedDayIndex = Math.min(
            Math.max(0, requestedDayIndex),
            Math.max(0, loadedProgram.week.length - 1)
          );
          setProgram(loadedProgram);
          setProgramDayIndex(boundedDayIndex);
          setProgramProgress(progress);
        }
      }

      if (resumeId) {
        const draft = await loadDraft(resumeId);
        if (draft) {
          applyDraft(draft);
        }
      }
    };
    load();
  }, [searchParams]);

  const applyDraft = (draft: SessionDraft) => {
    setSessionId(draft.sessionId);
    setSessionStartedAt(draft.startedAt ?? null);
    setActiveIndex(draft.currentExerciseIndex ?? 0);
    setCompletedSets(draft.entries.completedSets ?? {});
    setSelectedSets(draft.entries.selectedSets ?? {});
    setWeightByExercise(draft.entries.weightByExercise ?? {});
    setRepsByExercise(draft.entries.repsByExercise ?? {});
    setUnitByExercise(draft.entries.unitByExercise ?? {});
    setNotesByExercise(draft.entries.notesByExercise ?? {});
    setFeedback(
      (draft.entries.feedbackByExercise ?? {}) as Record<
        string,
        ExerciseFeedback
      >
    );
    if (draft.timerState) {
      setWorkSeconds(draft.timerState.workSeconds);
      setRestSeconds(draft.timerState.restSeconds);
    }
    if (draft.timerByExercise) {
      setTimerByExercise(draft.timerByExercise);
    }
  };

  const routine = useMemo(() => {
    if (!data) return null;
    return generateRoutine(data);
  }, [data]);

  const flatItems = useMemo(() => {
    if (program && programDayIndex !== null) {
      const day = program.week.find((entry) => entry.dayIndex === programDayIndex);
      if (!day) return [];
      return day.routine.map((item) => {
        const substitutedId = substitutionByExercise[item.exerciseId];
        const effectiveExerciseId = substitutedId ?? item.exerciseId;
        const exercise = exerciseById(effectiveExerciseId);
        const routineItem = item as ProgramRoutineItem;
        return {
          exerciseId: effectiveExerciseId,
          originalExerciseId: routineItem.exerciseId,
          sets: routineItem.sets ?? "1",
          reps: routineItem.reps ?? "",
          durationSec: routineItem.durationSec ?? undefined,
          restSec: routineItem.restSec ?? 60,
          section: routineItem.section ?? day.title,
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
        const substitutedId = substitutionByExercise[item.exerciseId];
        const effectiveExerciseId = substitutedId ?? item.exerciseId;
        const exercise = exerciseById(effectiveExerciseId);
        return {
          ...item,
          section: section.title,
          id: `${section.title}-${item.exerciseId}`,
          exerciseId: effectiveExerciseId,
          originalExerciseId: item.exerciseId,
          restSec: 60,
          name: exercise?.name ?? "Exercise",
          cues: exercise?.cues ?? [],
          mistake: exercise?.mistakes?.[0] ?? "Keep form controlled",
          duration: exercise?.durationOrReps ?? item.reps,
          loadType: exercise?.loadType ?? "bodyweight",
        };
      })
    );
  }, [program, programDayIndex, routine, substitutionByExercise]);

  const currentItem = flatItems[activeIndex];
  activeIndexRef.current = activeIndex;
  sessionIdRef.current = sessionId;

  useEffect(() => {
    if (saveState !== "saved") return;
    if (saveStateTimerRef.current) {
      window.clearTimeout(saveStateTimerRef.current);
    }
    saveStateTimerRef.current = window.setTimeout(() => {
      setSaveState("idle");
    }, 1100);
    return () => {
      if (saveStateTimerRef.current) {
        window.clearTimeout(saveStateTimerRef.current);
      }
    };
  }, [saveState]);

  const trackDropoff = (reason: "exit_button" | "pagehide" | "route_change" | "visibility_hidden") => {
    if (dropoffTrackedRef.current) return;
    if (sessionCompleteRef.current) return;
    if (!sessionIdRef.current) return;
    if (!flatItems.length) return;
    const item = flatItems[activeIndexRef.current] ?? null;
    const progressPct = ((activeIndexRef.current + 1) / flatItems.length) * 100;
    saveSessionDropoffTelemetry({
      sessionId: sessionIdRef.current,
      programId: program?.id ?? null,
      dayIndex: programDayIndex ?? null,
      exerciseId: item?.exerciseId ?? null,
      exerciseIndex: activeIndexRef.current,
      totalExercises: flatItems.length,
      progressPct,
      reason,
    });
    dropoffTrackedRef.current = true;
  };
  const totalItems = flatItems.length;
  const tips = [
    "Breathe steadily",
    "Move with control",
    "Maintain posture",
    "Relax your jaw and neck",
    "Smooth tempo over speed",
  ];
  const activeTip = tips[tipIndex] ?? "";
  const tipTone = (() => {
    if (/breathe|breath/i.test(activeTip)) {
      return "border-sky-200 bg-sky-50 text-sky-900";
    }
    if (/move|control|tempo/i.test(activeTip)) {
      return "border-amber-200 bg-amber-50 text-amber-900";
    }
    if (/posture/i.test(activeTip)) {
      return "border-indigo-200 bg-indigo-50 text-indigo-900";
    }
    if (/relax|jaw|neck/i.test(activeTip)) {
      return "border-rose-200 bg-rose-50 text-rose-900";
    }
    return "border-slate-200 bg-slate-50 text-slate-900";
  })();

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTipIndex((prev) => (prev + 1) % tips.length);
    }, 12000);
    return () => window.clearInterval(timer);
  }, [tips.length]);

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

  const applySelectedSets = (
    itemId: string,
    exerciseId: string,
    nextCount: number
  ) => {
    updateSelectedSets(itemId, nextCount);
    void persistLoadPref(exerciseId, { selectedSets: nextCount });
  };

  const applyWeight = (exerciseId: string, value: string) => {
    setWeightByExercise((prev) => ({
      ...prev,
      [exerciseId]: value,
    }));
    void persistLoadPref(exerciseId, { weight: value });
  };

  const applyUnit = (exerciseId: string, unit: "lb" | "kg") => {
    setUnitByExercise((prev) => ({
      ...prev,
      [exerciseId]: unit,
    }));
    void persistLoadPref(exerciseId, { unit });
  };

  const applySingleReps = (exerciseId: string, reps: string) => {
    setRepsByExercise((prev) => ({
      ...prev,
      [exerciseId]: reps,
    }));
    void persistLoadPref(exerciseId, { reps });
  };

  const saveFeedback = async (next: Record<string, ExerciseFeedback>) => {
    setFeedback(next);
    const nextPrefs: LogPrefs = {
      ...(prefs ?? { schemaVersion: 1 }),
      timerPrefs: prefs?.timerPrefs,
      timerPrefsByExercise: prefs?.timerPrefsByExercise,
      loadPrefsByExercise: prefs?.loadPrefsByExercise,
      feedbackByExercise: next,
      substitutionByExercise: substitutionByExercise,
    };
    setPrefs(nextPrefs);
    setSaveState("saving");
    await savePrefs(nextPrefs);
    setSaveState("saved");
  };

  const saveSubstitution = async (originalId: string, substituteId: string) => {
    const nextMap = { ...substitutionByExercise, [originalId]: substituteId };
    setSubstitutionByExercise(nextMap);
    const nextPrefs: LogPrefs = {
      ...(prefs ?? { schemaVersion: 1 }),
      timerPrefs: prefs?.timerPrefs,
      timerPrefsByExercise: prefs?.timerPrefsByExercise,
      loadPrefsByExercise: prefs?.loadPrefsByExercise,
      feedbackByExercise: feedback,
      substitutionByExercise: nextMap,
    };
    setPrefs(nextPrefs);
    setSaveState("saving");
    await savePrefs(nextPrefs);
    setSaveState("saved");
  };

  const persistLoadPref = async (
    exerciseId: string,
    partial: NonNullable<LogPrefs["loadPrefsByExercise"]>[string]
  ) => {
    const nextByExercise = {
      ...(prefs?.loadPrefsByExercise ?? {}),
      [exerciseId]: {
        ...(prefs?.loadPrefsByExercise?.[exerciseId] ?? {}),
        ...partial,
      },
    };
    const nextPrefs: LogPrefs = {
      ...(prefs ?? { schemaVersion: 1 }),
      timerPrefs: prefs?.timerPrefs,
      timerPrefsByExercise: prefs?.timerPrefsByExercise,
      loadPrefsByExercise: nextByExercise,
      feedbackByExercise: feedback,
      substitutionByExercise: substitutionByExercise,
    };
    setPrefs(nextPrefs);
    setSaveState("saving");
    await savePrefs(nextPrefs);
    setSaveState("saved");
  };

  const updateTimerPrefs = async (
    next: {
      workSeconds: number;
      restSeconds: number;
    },
    exerciseId?: string
  ) => {
    const nextByExercise = exerciseId
      ? {
          ...(prefs?.timerPrefsByExercise ?? timerByExercise),
          [exerciseId]: next,
        }
      : prefs?.timerPrefsByExercise ?? timerByExercise;
    setTimerByExercise(nextByExercise);
    setWorkSeconds(next.workSeconds);
    setRestSeconds(next.restSeconds);

    const nextPrefs: LogPrefs = {
      ...(prefs ?? { schemaVersion: 1 }),
      timerPrefs: next,
      timerPrefsByExercise: nextByExercise,
      loadPrefsByExercise: prefs?.loadPrefsByExercise,
      feedbackByExercise: feedback,
      substitutionByExercise: substitutionByExercise,
    };
    setPrefs(nextPrefs);
    setSaveState("saving");
    await savePrefs(nextPrefs);
    setSaveState("saved");
  };

  const getTimerForExercise = (params: {
    exerciseId: string;
    durationSec?: number | null;
    restSec?: number | null;
    sets: string | number | null;
    reps?: string | null;
    loadType: "weighted" | "bodyweight" | "timed" | "assisted";
  }) => {
    const exerciseTimerPref =
      timerByExercise[params.exerciseId] ??
      prefs?.timerPrefsByExercise?.[params.exerciseId];
    if (exerciseTimerPref) {
      return {
        workSeconds: exerciseTimerPref.workSeconds,
        restSeconds: exerciseTimerPref.restSeconds,
      };
    }

    return getEffectiveTimer(
      {
        exerciseId: params.exerciseId,
        durationSec: params.durationSec ?? null,
        restSec: params.restSec ?? null,
        sets: params.sets,
        reps: params.reps ?? null,
        loadType: params.loadType,
      },
      prefs?.timerPrefs
    );
  };

  const saveSessionFeedback = async (next: ExerciseFeedback) => {
    setSessionFeedback(next);
    if (!summary) return;
    const updated: SessionRecord = {
      ...summary,
      sessionFeedback: next.rating,
      sessionPainLocation: next.painLocation ?? null,
      sessionFeedbackNotes: next.notes ?? null,
      updatedAt: nowIso(),
    };
    setSummary(updated);
    await updateSession(updated);
  };

  const handleNext = () => {
    if (activeIndex < totalItems - 1) {
      setActiveIndex((prev) => prev + 1);
    } else {
      handleCompleteSession();
    }
  };

  const handleBack = () => {
    setActiveIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleStartNewSession = () => {
    setSessionId(uuid());
    setSessionStartedAt(nowIso());
    setSessionComplete(false);
    sessionCompleteRef.current = false;
    dropoffTrackedRef.current = false;
    setSummary(null);
    setSummaryStats(null);
    setActiveIndex(0);
    setCompletedSets({});
  };

  const handleCompleteSession = async () => {
    const sessionIdValue = sessionId ?? uuid();
    const startedAt = sessionStartedAt ?? nowIso();
    const completedAt = nowIso();
    const totalSeconds = flatItems.reduce((sum, item) => {
      const timer = getTimerForExercise({
        exerciseId: item.exerciseId,
        durationSec: item.durationSec,
        restSec: item.restSec,
        sets: item.sets,
        reps: item.reps,
        loadType: item.loadType,
      });
      return sum + timer.workSeconds;
    }, 0);
    const totalRestSeconds = flatItems.reduce((sum, item) => {
      const timer = getTimerForExercise({
        exerciseId: item.exerciseId,
        durationSec: item.durationSec,
        restSec: item.restSec,
        sets: item.sets,
        reps: item.reps,
        loadType: item.loadType,
      });
      return sum + timer.restSeconds;
    }, 0);
    const estimatedMinutes = Math.max(
      1,
      Math.round((totalSeconds + totalRestSeconds) / 60)
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
      sessionFeedback: sessionFeedback?.rating ?? null,
      sessionPainLocation: sessionFeedback?.painLocation ?? null,
      sessionFeedbackNotes: sessionFeedback?.notes ?? null,
      source: "local",
      deletedAt: null,
    };

    await createSession(sessionRecord);

    const logsToSave: ExerciseLog[] = flatItems.map((item) => {
      const exerciseId = item.exerciseId;
      const originalExerciseId =
        "originalExerciseId" in item ? item.originalExerciseId : null;
      const unit = unitByExercise[exerciseId] ?? "lb";
      const weightValue = weightByExercise[exerciseId];
      const weight =
        item.loadType === "weighted" && weightValue ? Number(weightValue) : null;
      const repsValue = repsByExercise[exerciseId];
      const fallbackReps =
        !item.durationSec && item.reps ? parseFirstNumber(item.reps) : null;
      const reps = repsValue ? Number(repsValue) : fallbackReps;
      const setsPlanned = selectedSets[item.id] ?? parseSetsRange(item.sets).minSets;
      const setsCompleted = (completedSets[item.id] ?? []).filter(Boolean)
        .length;
      const volumeFromReps =
        weight && reps
          ? weight * reps * Math.max(1, setsCompleted)
          : null;
      const volumeFromSets =
        null;
      const timer = getTimerForExercise({
        exerciseId: item.exerciseId,
        durationSec: item.durationSec,
        restSec: item.restSec,
        sets: item.sets,
        reps: item.reps,
        loadType: item.loadType,
      });

      return {
        id: uuid(),
        userId: null,
        sessionId: sessionIdValue,
        exerciseId,
        originalExerciseId:
          originalExerciseId && originalExerciseId !== exerciseId
            ? originalExerciseId
            : null,
        substitutedExerciseId:
          originalExerciseId && originalExerciseId !== exerciseId
            ? exerciseId
            : null,
        createdAt: completedAt,
        updatedAt: completedAt,
        loadType: item.loadType,
        unit: item.loadType === "weighted" ? unit : null,
        weight,
        reps,
        repsBySet: null,
        setsPlanned,
        setsCompleted,
        durationSec:
          item.loadType === "timed"
            ? timer.workSeconds
            : item.durationSec ?? null,
        workSecondsUsed: timer.workSeconds,
        restSecondsUsed: timer.restSeconds,
        rpe: null,
        felt: feedback[item.exerciseId]?.rating ?? feedback[item.id]?.rating ?? null,
        painLocation:
          feedback[item.exerciseId]?.painLocation ??
          feedback[item.id]?.painLocation ??
          null,
        feedbackNotes:
          feedback[item.exerciseId]?.notes ??
          feedback[item.id]?.notes ??
          null,
        notes: notesByExercise[exerciseId]?.trim() || null,
        programId: program?.id ?? null,
        dayIndex: programDayIndex ?? null,
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
    sessionCompleteRef.current = true;

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
      saveAppState({
        selectedDay: nextIndex,
      });
    }

    await clearDraft(sessionIdValue);
    saveAppState({ activeSessionId: undefined });
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
  const currentFeedbackKey = currentItem?.exerciseId ?? "";
  const currentFeedback = feedback[currentFeedbackKey] ?? null;
  const currentTimer = currentItem
    ? getTimerForExercise({
        exerciseId: currentItem.exerciseId,
        durationSec: currentItem.durationSec ?? null,
        restSec: currentItem.restSec ?? null,
        sets: currentItem.sets,
        reps: currentItem.reps ?? null,
        loadType: currentItem.loadType,
      })
    : { workSeconds: 60, restSeconds: 60 };
  const previewWeight =
    currentItem?.loadType === "weighted" && currentItem
      ? weightByExercise[currentItem.exerciseId] || "-"
      : "-";
  const previewUnit =
    currentItem?.loadType === "weighted" && currentItem
      ? unitByExercise[currentItem.exerciseId] ?? "lb"
      : null;
  const previewReps =
    currentItem && currentItem.loadType !== "timed"
      ? repsByExercise[currentItem.exerciseId] ||
        String(parseFirstNumber(currentItem.reps) ?? "-")
      : "-";
  const previewSetsPlanned = currentSelectedSets;
  const previewSetsCompleted = checks.filter(Boolean).length;

  useEffect(() => {
    if (!currentItem) return;
    const loadLast = async () => {
      const [latest] = await listExerciseLogsByExerciseHistory(
        currentItem.exerciseId,
        1
      );
      setLastLog(latest);
    };
    loadLast();
  }, [currentItem?.exerciseId]);

  useEffect(() => {
    if (!currentItem) return;
    updateSelectedSets(currentItem.id, currentSelectedSets);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentItem?.id, currentSelectedSets]);

  useEffect(() => {
    if (!currentItem) return;
    const exerciseId = currentItem.exerciseId;
    const loadPref = prefs?.loadPrefsByExercise?.[exerciseId];

    if (selectedSets[currentItem.id] === undefined) {
      const preferred =
        loadPref?.selectedSets ??
        lastLog?.setsCompleted ??
        lastLog?.setsPlanned ??
        minSets;
      const bounded = Math.min(maxSets, Math.max(minSets, preferred ?? minSets));
      updateSelectedSets(currentItem.id, bounded);
    }

    if (!unitByExercise[exerciseId]) {
      setUnitByExercise((prev) => ({
        ...prev,
        [exerciseId]: loadPref?.unit ?? "lb",
      }));
    }

    if (!weightByExercise[exerciseId] && loadPref?.weight) {
      setWeightByExercise((prev) => ({
        ...prev,
        [exerciseId]: loadPref.weight ?? "",
      }));
    } else if (lastLog && !weightByExercise[exerciseId] && lastLog.weight) {
      setWeightByExercise((prev) => ({
        ...prev,
        [exerciseId]: String(lastLog.weight),
      }));
    }

    if (!repsByExercise[exerciseId] && !currentItem.durationSec) {
      if (loadPref?.reps) {
        setRepsByExercise((prev) => ({
          ...prev,
          [exerciseId]: loadPref.reps ?? "",
        }));
      } else if (lastLog?.reps) {
        setRepsByExercise((prev) => ({
          ...prev,
          [exerciseId]: String(lastLog.reps),
        }));
      } else {
        const defaultReps = parseFirstNumber(currentItem.reps);
        if (defaultReps) {
          setRepsByExercise((prev) => ({
            ...prev,
            [exerciseId]: String(defaultReps),
          }));
        }
      }
    }
  }, [currentItem?.id, currentSelectedSets, lastLog, prefs?.loadPrefsByExercise, repsByExercise, selectedSets, minSets, maxSets]);

  useEffect(() => {
    if (!currentItem) return;
    const next = getTimerForExercise({
      exerciseId: currentItem.exerciseId,
      sets: currentItem.sets,
      reps: currentItem.reps ?? null,
      durationSec: currentItem.durationSec ?? null,
      restSec: currentItem.restSec ?? null,
      loadType: currentItem.loadType,
    });
    setTimerConfig(next);
    setWorkSeconds(next.workSeconds);
    setRestSeconds(next.restSeconds);
  }, [currentItem?.id, timerByExercise, prefs?.timerPrefs, prefs?.timerPrefsByExercise]);

  useEffect(() => {
    if (!sessionId) setSessionId(uuid());
    if (!sessionStartedAt) setSessionStartedAt(nowIso());
  }, [sessionId, sessionStartedAt]);

  useEffect(() => {
    const onPageHide = () => trackDropoff("pagehide");
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        trackDropoff("visibility_hidden");
      }
    };
    window.addEventListener("pagehide", onPageHide);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.removeEventListener("pagehide", onPageHide);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      trackDropoff("route_change");
    };
  }, [flatItems.length, program?.id, programDayIndex]);

  useEffect(() => {
    if (!sessionId) return;
    if (!program || programDayIndex === null) return;
    const state = loadAppState();
    saveAppState({
      activeSessionId: sessionId,
      programId: program.id,
      activeProgramId: program.id,
      selectedDay: programDayIndex,
      activePhaseIndex: program.phaseIndex ?? 1,
      activeCycleIndex: program.cycleIndex ?? 1,
      programVersion: state?.programVersion ?? 0,
      lastRoute: `/session?programId=${program.id}&dayIndex=${programDayIndex}`,
    });
  }, [sessionId, program, programDayIndex]);

  useEffect(() => {
    if (!sessionId) return;
    if (!program) return;
    if (sessionComplete) return;
    const state = loadAppState();
    const programVersion = state?.programVersion ?? 0;
    const currentExerciseId = flatItems[activeIndex]?.id ?? "";
    const sets = completedSets[currentExerciseId] ?? [];
    const currentSetIndex = Math.max(
      0,
      sets.findIndex((value) => !value)
    );
    const timer = window.setTimeout(() => {
      saveDraft({
        sessionId,
        programId: program.id,
        dayIndex: programDayIndex,
        programVersion,
        phaseIndex: program.phaseIndex ?? program.phase?.weekIndex ?? 1,
        cycleIndex: program.cycleIndex ?? 1,
        currentExerciseIndex: activeIndex,
        currentSetIndex,
        entries: {
          completedSets,
          selectedSets,
          weightByExercise,
          repsByExercise,
          repsBySetByExercise: {},
          unitByExercise,
          notesByExercise,
          feedbackByExercise: feedback,
        },
        timerState: {
          workSeconds,
          restSeconds,
        },
        timerByExercise,
        startedAt: sessionStartedAt,
        updatedAt: nowIso(),
      });
    }, 300);

    return () => window.clearTimeout(timer);
  }, [
    sessionId,
    program,
    programDayIndex,
    activeIndex,
    completedSets,
    selectedSets,
    weightByExercise,
    repsByExercise,
    unitByExercise,
    notesByExercise,
    feedback,
    workSeconds,
    restSeconds,
    timerByExercise,
    sessionStartedAt,
    flatItems,
  ]);

  if (!data || !routine) {
    return (
      <BackgroundShell>
        <div className="ui-shell flex max-w-3xl flex-col gap-6 py-8 sm:py-12">
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
        <div className="ui-shell flex max-w-3xl flex-col gap-6 py-8 sm:py-12">
          <OnImage>
            <h1 className="text-3xl font-semibold text-white">
              Session complete
            </h1>
          </OnImage>
          <div className="ui-card p-6">
            <p className="text-sm text-slate-600">
              You completed {summaryStats.completedExercises} exercises in about{" "}
              {summaryStats.estimatedMinutes} minutes.
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Great work staying consistent today.
            </p>
          </div>
          <div className="ui-card p-6">
            <p className="text-sm font-semibold text-slate-900">
              How did the workout feel?
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(
                [
                  { value: "easy", label: "Easy" },
                  { value: "moderate", label: "Moderate" },
                  { value: "hard", label: "Hard" },
                  { value: "pain", label: "Pain / discomfort" },
                ] as Array<{ value: FeedbackEntry; label: string }>
              ).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    saveSessionFeedback({
                      rating: option.value,
                      painLocation: sessionFeedback?.painLocation ?? null,
                      notes: sessionFeedback?.notes ?? "",
                    })
                  }
                  className={`rounded-full border px-4 py-2 text-xs font-semibold ${
                    sessionFeedback?.rating === option.value
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 text-slate-700"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            {sessionFeedback?.rating === "pain" ? (
              <div className="mt-4 grid gap-3 text-xs">
                <label className="flex flex-col gap-2">
                  <span className="font-semibold text-slate-700">Location</span>
                  <select
                    value={sessionFeedback?.painLocation ?? ""}
                    onChange={(event) =>
                      saveSessionFeedback({
                        rating: "pain",
                        painLocation: event.target.value
                          ? (event.target.value as PainLocation)
                          : null,
                        notes: sessionFeedback?.notes ?? null,
                      })
                    }
                    className="ui-select"
                  >
                    <option value="">Select location</option>
                    {[
                      "neck",
                      "shoulder",
                      "upper back",
                      "lower back",
                      "hips",
                      "knees",
                      "other",
                    ].map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            ) : null}
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
      <div className="ui-shell flex max-w-3xl flex-col gap-6 py-8 sm:py-12">
        <OnImage>
          <header className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-200">
              Guided session
            </p>
            <h1 className="text-3xl font-semibold text-white">
              {currentItem.section}: {currentItem.name}
            </h1>
            {program && programDayIndex !== null ? (
              <p className="text-xs font-semibold text-slate-200">
                Schedule day {programDayIndex + 1} of {program.daysPerWeek}
              </p>
            ) : null}
            <p className="text-sm text-slate-200">
              {currentItem.sets} sets • {currentItem.duration ?? currentItem.reps}
            </p>
          </header>
        </OnImage>

        <div
          className={`sticky top-3 z-20 rounded-2xl border px-5 py-4 text-[1.2rem] font-semibold leading-tight shadow-lg coach-tip-pulse ${tipTone}`}
        >
          Coaching tip:{" "}
          <span>{activeTip}</span>
        </div>

        <div className="ui-card p-6">
          <DualModeTimer
            key={currentItem.id}
            initialExerciseSeconds={timerConfig.workSeconds}
            initialRestSeconds={timerConfig.restSeconds}
            onExerciseDurationChange={(seconds) => {
              updateTimerPrefs(
                { workSeconds: seconds, restSeconds: timerConfig.restSeconds },
                currentItem.exerciseId
              );
            }}
            onRestDurationChange={(seconds) => {
              updateTimerPrefs(
                { workSeconds: timerConfig.workSeconds, restSeconds: seconds },
                currentItem.exerciseId
              );
            }}
            defaultMode="exercise"
          />

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

        <div className="ui-card p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="ui-title">
              Log this exercise
            </p>
            <div className="flex items-center gap-3">
              {lastLog ? (
                <p className="ui-body">
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
              <span
                className="ui-saving-indicator rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600"
                data-state={saveState}
              >
                {saveState === "saving"
                  ? "Saving..."
                  : saveState === "saved"
                  ? "Saved"
                  : "Autosave on"}
              </span>
            </div>
          </div>
          <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              About to record
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-700">
              <p>
                <span className="font-semibold text-slate-900">Load:</span>{" "}
                {currentItem.loadType === "weighted"
                  ? `${previewWeight}${previewUnit ? ` ${previewUnit}` : ""}`
                  : currentItem.loadType}
              </p>
              <p>
                <span className="font-semibold text-slate-900">Reps/set:</span>{" "}
                {previewReps}
              </p>
              <p>
                <span className="font-semibold text-slate-900">Sets:</span>{" "}
                {previewSetsCompleted}/{previewSetsPlanned}
              </p>
              <p>
                <span className="font-semibold text-slate-900">Timer:</span>{" "}
                {currentTimer.workSeconds}s work • {currentTimer.restSeconds}s rest
              </p>
              <p className="col-span-2">
                <span className="font-semibold text-slate-900">Feedback:</span>{" "}
                {currentFeedback?.rating ?? "not set"}
                {currentFeedback?.rating === "pain" && currentFeedback?.painLocation
                  ? ` (${currentFeedback.painLocation})`
                  : ""}
              </p>
            </div>
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
                    applyWeight(currentItem.exerciseId, event.target.value)
                  }
                  className="ui-input w-28"
                />
                <div className="flex rounded-full border border-slate-200 p-1 text-xs">
                  {(["lb", "kg"] as const).map((unit) => (
                    <button
                      key={unit}
                      type="button"
                      onClick={() => applyUnit(currentItem.exerciseId, unit)}
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

          </div>
        </div>

        <div className="ui-card p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold text-slate-900">Sets</p>
            {maxSets > minSets ? (
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span className="font-semibold text-slate-900">Sets</span>
                <button
                  type="button"
                  onClick={() =>
                    applySelectedSets(
                      currentItem.id,
                      currentItem.exerciseId,
                      Math.max(minSets, currentSelectedSets - 1)
                    )
                  }
                  className="rounded-full border border-slate-300 bg-white px-3 py-1 font-semibold text-slate-700 hover:bg-slate-100"
                >
                  -
                </button>
                <span className="w-6 text-center font-semibold text-slate-900">
                  {currentSelectedSets}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    applySelectedSets(
                      currentItem.id,
                      currentItem.exerciseId,
                      Math.min(maxSets, currentSelectedSets + 1)
                    )
                  }
                  className="rounded-full border border-slate-300 bg-white px-3 py-1 font-semibold text-slate-700 hover:bg-slate-100"
                >
                  +
                </button>
              </div>
            ) : null}
          </div>
          <div className="mt-3 flex flex-wrap gap-3">
            {currentItem.loadType !== "timed" ? (
              <div className="w-full space-y-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                  <span className="font-semibold text-slate-700">Reps</span>
                </div>
                <input
                  type="number"
                  min={1}
                  value={repsByExercise[currentItem.exerciseId] ?? ""}
                  onChange={(event) =>
                    applySingleReps(currentItem.exerciseId, event.target.value)
                  }
                  className="ui-input w-32 text-xs"
                  placeholder="Reps per set"
                />
              </div>
            ) : null}
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
          <div className="ui-card p-6">
            <p className="text-sm font-semibold text-slate-900">
              How did it feel?
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(
                [
                  { value: "easy", label: "Easy" },
                  { value: "moderate", label: "Moderate" },
                  { value: "hard", label: "Hard" },
                  { value: "pain", label: "Pain / discomfort" },
                ] as Array<{ value: FeedbackEntry; label: string }>
              ).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    saveFeedback({
                      ...feedback,
                      [currentFeedbackKey]: {
                        rating: option.value,
                        painLocation:
                          currentFeedback?.painLocation ?? null,
                        notes: currentFeedback?.notes ?? "",
                      },
                    })
                  }
                  className={`rounded-full border px-4 py-2 text-xs font-semibold ${
                    currentFeedback?.rating === option.value
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 text-slate-700"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            {currentFeedback?.rating === "pain" ? (
              <div className="mt-4 grid gap-3 text-xs">
                <label className="flex flex-col gap-2">
                  <span className="font-semibold text-slate-700">Location</span>
                  <select
                    value={currentFeedback?.painLocation ?? ""}
                    onChange={(event) =>
                      saveFeedback({
                        ...feedback,
                        [currentFeedbackKey]: {
                          rating: "pain",
                          painLocation: event.target.value
                            ? (event.target.value as PainLocation)
                            : null,
                          notes: currentFeedback?.notes ?? null,
                        },
                      })
                    }
                    className="ui-select"
                  >
                    <option value="">Select location</option>
                    {[
                      "neck",
                      "shoulder",
                      "upper back",
                      "lower back",
                      "hips",
                      "knees",
                      "other",
                    ].map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </label>
                {(() => {
                  const baseOriginalId =
                    "originalExerciseId" in currentItem && currentItem.originalExerciseId
                      ? currentItem.originalExerciseId
                      : currentItem.exerciseId;
                  const exercise = exerciseById(currentItem.exerciseId);
                  const options = exercise?.swapOptions ?? [];
                  if (!options.length) return null;
                  return (
                    <div className="grid gap-2">
                      <p className="font-semibold text-slate-700">
                        Try this instead
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {options.map((optionId) => {
                          const option = exerciseById(optionId);
                          if (!option) return null;
                          const isSelected =
                            substitutionByExercise[baseOriginalId] === optionId;
                          return (
                            <button
                              key={optionId}
                              type="button"
                              onClick={() =>
                                saveSubstitution(baseOriginalId, optionId)
                              }
                              className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${
                                isSelected
                                  ? "border-slate-900 bg-slate-900 text-white"
                                  : "border-slate-200 text-slate-700"
                              }`}
                            >
                              {option.name}
                            </button>
                          );
                        })}
                      </div>
                      {substitutionByExercise[baseOriginalId] ? (
                        <p className="text-[11px] text-slate-500">
                          Substitution saved for next session.
                        </p>
                      ) : null}
                    </div>
                  );
                })()}
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <OnImage className="flex flex-wrap items-center gap-3">
            <Link href="/results" onClick={() => trackDropoff("exit_button")}>
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
          <Button
            type="button"
            variant="primary"
            data-testid="session-next"
            onClick={handleNext}
          >
            {activeIndex === totalItems - 1 ? "Finish session" : "Next"}
          </Button>
        </div>
      </div>
    </BackgroundShell>
  );
}
