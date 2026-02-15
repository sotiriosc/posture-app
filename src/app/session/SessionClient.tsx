"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { exerciseById } from "@/lib/exercises";
import { generateRoutine } from "@/lib/routine";
import { normalizeEquipmentSelectionValues } from "@/lib/equipment";
import { previewPainSubstitutionChoices } from "@/lib/program";
import { generateNextTimeGuidance } from "@/lib/progression";
import BackgroundShell from "@/components/BackgroundShell";
import OnImage from "@/components/OnImage";
import Button from "@/components/ui/Button";
import DualModeTimer from "@/components/DualModeTimer";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import { loadAppState, saveAppState } from "@/lib/appState";
import { getEffectiveTimer } from "@/lib/timerRules";
import { saveSessionDropoffTelemetry } from "@/lib/telemetry";
import { applyCompletedDayToProgramProgress } from "@/lib/programProgress";
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
  PainLevel,
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
  saveExerciseSwapEvent,
  savePrefs,
  saveProgramProgress,
  updateSession,
  uuid,
  nowIso,
} from "@/lib/logStore";
import { loadTrainingSnapshot } from "@/lib/trainingSyncClient";

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

const parseRangeFromString = (value?: string | null) => {
  if (!value) return { min: null as number | null, max: null as number | null };
  const parts = value.match(/\d+/g)?.map(Number).filter(Number.isFinite) ?? [];
  if (!parts.length) return { min: null as number | null, max: null as number | null };
  if (parts.length === 1) return { min: parts[0], max: parts[0] };
  return { min: parts[0], max: parts[1] };
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

const normalizeLogSection = (
  section: string
): ProgramRoutineItem["section"] | null => {
  const normalized = section.trim().toLowerCase().replace(/[\s_-]+/g, "");
  if (normalized.includes("warmup")) return "warmup";
  if (normalized.includes("activation")) return "activation";
  if (normalized.includes("accessory")) return "accessory";
  if (normalized.includes("cooldown")) return "cooldown";
  if (normalized.includes("main")) return "main";
  return null;
};

type SessionPainLevel = PainLevel;

type SessionRoutineViewItem = {
  id: string;
  dayTitle: string;
  section: string;
  exerciseId: string;
  originalExerciseId: string;
};

const toPatternTokens = (exerciseId: string) =>
  new Set(
    (exerciseById(exerciseId)?.movementPattern ?? []).map((pattern) =>
      pattern.trim().toLowerCase().replace(/[\s-]+/g, "")
    )
  );

const inferMainLaneForSessionExercise = (
  exerciseId: string
): "push" | "verticalpush" | "pull" | "squat" | "hinge" | null => {
  const patterns = toPatternTokens(exerciseId);
  if (patterns.has("verticalpush")) return "verticalpush";
  if (patterns.has("push")) return "push";
  if (patterns.has("pull")) return "pull";
  if (patterns.has("squat")) return "squat";
  if (patterns.has("hinge")) return "hinge";
  return null;
};

const inferAccessoryLaneForSessionExercise = (
  exerciseId: string
): "push" | "pull" | "lower" | "core" => {
  const patterns = toPatternTokens(exerciseId);
  if (patterns.has("push") || patterns.has("verticalpush")) return "push";
  if (patterns.has("pull")) return "pull";
  if (patterns.has("squat") || patterns.has("hinge") || patterns.has("singleleg")) {
    return "lower";
  }
  if (
    patterns.has("core") ||
    patterns.has("antirotation") ||
    patterns.has("antiextension") ||
    patterns.has("carry")
  ) {
    return "core";
  }
  return "core";
};

const inferSessionFocusFromDayTitle = (dayTitle: string): "upper" | "lower" | "core" => {
  const normalized = dayTitle.toLowerCase();
  if (
    normalized.includes("legs") ||
    normalized.includes("lower") ||
    normalized.includes("squat") ||
    normalized.includes("hinge")
  ) {
    return "lower";
  }
  if (normalized.includes("core") || normalized.includes("abs")) {
    return "core";
  }
  return "upper";
};

const matchesSessionFocus = (
  exerciseId: string,
  focus: "upper" | "lower" | "core"
) => {
  const patterns = toPatternTokens(exerciseId);
  if (focus === "upper") {
    return (
      patterns.has("push") ||
      patterns.has("verticalpush") ||
      patterns.has("pull") ||
      patterns.has("scapular")
    );
  }
  if (focus === "lower") {
    return (
      patterns.has("squat") ||
      patterns.has("hinge") ||
      patterns.has("singleleg")
    );
  }
  return (
    patterns.has("core") ||
    patterns.has("antirotation") ||
    patterns.has("antiextension") ||
    patterns.has("carry")
  );
};

const findPainSwapAlternativeExerciseId = (params: {
  questionnaire: QuestionnaireData;
  currentItem: SessionRoutineViewItem;
  usedExerciseIds: Set<string>;
}): string | null => {
  const { questionnaire, currentItem, usedExerciseIds } = params;
  const currentSection = currentItem.section as ProgramRoutineItem["section"];
  const ranked = previewPainSubstitutionChoices({
    questionnaire,
    exerciseId: currentItem.exerciseId,
    section: currentSection,
    limit: 10,
  });
  if (!ranked.length) return null;

  const mainLane =
    currentSection === "main"
      ? inferMainLaneForSessionExercise(currentItem.exerciseId)
      : null;
  const accessoryLane =
    currentSection === "accessory"
      ? inferAccessoryLaneForSessionExercise(currentItem.exerciseId)
      : null;
  const sectionFocus =
    currentSection === "activation" ||
    currentSection === "warmup" ||
    currentSection === "cooldown"
      ? inferSessionFocusFromDayTitle(currentItem.dayTitle)
      : null;
  const usedWithoutCurrent = new Set(usedExerciseIds);
  usedWithoutCurrent.delete(currentItem.exerciseId);

  const candidate = ranked
    .map((entry) => entry.exerciseId)
    .filter((exerciseId) => !usedWithoutCurrent.has(exerciseId))
    .filter((exerciseId) => {
      if (currentSection === "main" && mainLane) {
        const candidateLane = inferMainLaneForSessionExercise(exerciseId);
        return candidateLane === mainLane;
      }
      if (currentSection === "accessory" && accessoryLane) {
        return inferAccessoryLaneForSessionExercise(exerciseId) === accessoryLane;
      }
      if (sectionFocus) {
        return matchesSessionFocus(exerciseId, sectionFocus);
      }
      return true;
    })[0];

  return candidate ?? null;
};

export default function SessionClient() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<QuestionnaireData | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [workSeconds, setWorkSeconds] = useState(60);
  const [restSeconds, setRestSeconds] = useState(60);
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
  const [sessionId, setSessionId] = useState<string | null>(() => uuid());
  const [sessionStartedAt, setSessionStartedAt] = useState<string | null>(() => nowIso());
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
  const [rpeByExercise, setRpeByExercise] = useState<Record<string, string>>({});
  const [repsByExercise, setRepsByExercise] = useState<Record<string, string>>(
    {}
  );
  const [substitutionByExercise, setSubstitutionByExercise] = useState<
    Record<string, string>
  >({});
  const [sessionSwapByItemId, setSessionSwapByItemId] = useState<
    Record<string, string>
  >({});
  const [painModalOpen, setPainModalOpen] = useState(false);
  const [painModalLevel, setPainModalLevel] = useState<SessionPainLevel>("none");
  const [painModalLocation, setPainModalLocation] = useState<PainLocation | "">("");
  const [painModalNotes, setPainModalNotes] = useState("");
  const [painModalMessage, setPainModalMessage] = useState<string | null>(null);
  const [painLevelByExercise, setPainLevelByExercise] = useState<
    Record<string, PainLevel>
  >({});
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const saveStateTimerRef = useRef<number | null>(null);
  const dropoffTrackedRef = useRef(false);
  const sessionCompleteRef = useRef(false);
  const activeIndexRef = useRef(0);
  const sessionIdRef = useRef<string | null>(null);

  function applyDraft(draft: SessionDraft) {
    setSessionId(draft.sessionId);
    setSessionStartedAt(draft.startedAt ?? null);
    setActiveIndex(draft.currentExerciseIndex ?? 0);
    setCompletedSets(draft.entries.completedSets ?? {});
    setSelectedSets(draft.entries.selectedSets ?? {});
    setWeightByExercise(draft.entries.weightByExercise ?? {});
    setRepsByExercise(draft.entries.repsByExercise ?? {});
    setUnitByExercise(draft.entries.unitByExercise ?? {});
    setNotesByExercise(draft.entries.notesByExercise ?? {});
    setRpeByExercise(draft.entries.rpeByExercise ?? {});
    setFeedback(
      (draft.entries.feedbackByExercise ?? {}) as Record<
        string,
        ExerciseFeedback
      >
    );
    setSessionSwapByItemId(draft.entries.substitutionByItemId ?? {});
    if (draft.timerState) {
      setWorkSeconds(draft.timerState.workSeconds);
      setRestSeconds(draft.timerState.restSeconds);
    }
    if (draft.timerByExercise) {
      setTimerByExercise(draft.timerByExercise);
    }
  }

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
      } else {
        const snapshot = await loadTrainingSnapshot();
        const remote = snapshot?.questionnaire as Partial<QuestionnaireData> | undefined;
        if (remote) {
          const next = {
            goals: remote.goals ?? "Improve posture",
            painAreas: remote.painAreas ?? [],
            experience: remote.experience ?? "Beginner",
            equipment: normalizeEquipmentSelectionValues(
              remote.equipment ?? ["none"]
            ),
            daysPerWeek: normalizeDaysPerWeek(remote.daysPerWeek),
          };
          setData(next);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        }
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

  const routine = useMemo(() => {
    if (!data) return null;
    return generateRoutine(data);
  }, [data]);

  const flatItems = useMemo(() => {
    if (program && programDayIndex !== null) {
      const day = program.week.find((entry) => entry.dayIndex === programDayIndex);
      if (!day) return [];
      return day.routine.map((item) => {
        const routineItem = item as ProgramRoutineItem;
        const itemId = `${day.title}-${routineItem.exerciseId}`;
        const sessionSwapId = sessionSwapByItemId[itemId];
        const substitutedId = substitutionByExercise[item.exerciseId];
        const effectiveExerciseId =
          sessionSwapId ?? substitutedId ?? routineItem.exerciseId;
        const exercise = exerciseById(effectiveExerciseId);
        return {
          exerciseId: effectiveExerciseId,
          originalExerciseId: routineItem.exerciseId,
          sets: routineItem.sets ?? "1",
          reps: routineItem.reps ?? "",
          durationSec: routineItem.durationSec ?? undefined,
          restSec: routineItem.restSec ?? 60,
          section: routineItem.section ?? day.title,
          dayTitle: day.title,
          id: itemId,
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
        const itemId = `${section.title}-${item.exerciseId}`;
        const sessionSwapId = sessionSwapByItemId[itemId];
        const substitutedId = substitutionByExercise[item.exerciseId];
        const effectiveExerciseId = sessionSwapId ?? substitutedId ?? item.exerciseId;
        const exercise = exerciseById(effectiveExerciseId);
        return {
          ...item,
          section: section.title,
          dayTitle: section.title,
          id: itemId,
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
  }, [program, programDayIndex, routine, substitutionByExercise, sessionSwapByItemId]);

  const currentItem = flatItems[activeIndex];
  const currentItemId = currentItem?.id ?? null;
  const currentExerciseId = currentItem?.exerciseId ?? null;
  const currentDurationSec = currentItem?.durationSec ?? null;
  const currentReps = currentItem?.reps ?? null;

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

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

  const trackDropoff = useCallback(
    (reason: "exit_button" | "pagehide" | "route_change" | "visibility_hidden") => {
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
    },
    [flatItems, program?.id, programDayIndex]
  );
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

  const updateSelectedSets = useCallback((exerciseId: string, nextCount: number) => {
    setSelectedSets((prev) => ({ ...prev, [exerciseId]: nextCount }));
    setCompletedSets((prev) => {
      const current = prev[exerciseId] ?? [];
      const next = current.slice(0, nextCount);
      while (next.length < nextCount) next.push(false);
      return { ...prev, [exerciseId]: next };
    });
  }, []);

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

  const applyRpe = (exerciseId: string, rpe: string) => {
    setRpeByExercise((prev) => ({
      ...prev,
      [exerciseId]: rpe,
    }));
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

  const ensureSessionIdentity = () => {
    const nextSessionId = sessionId ?? uuid();
    const nextStartedAt = sessionStartedAt ?? nowIso();
    if (!sessionId) setSessionId(nextSessionId);
    if (!sessionStartedAt) setSessionStartedAt(nextStartedAt);
    return { nextSessionId, nextStartedAt };
  };

  const persistSessionDraftNow = async (nextSubstitutionByItemId?: Record<string, string>) => {
    if (!program) return;
    const { nextSessionId, nextStartedAt } = ensureSessionIdentity();
    const state = loadAppState();
    const programVersion = state?.programVersion ?? 0;
    const currentExerciseId = flatItems[activeIndex]?.id ?? "";
    const sets = completedSets[currentExerciseId] ?? [];
    const currentSetIndex = Math.max(
      0,
      sets.findIndex((value) => !value)
    );
    await saveDraft({
      sessionId: nextSessionId,
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
        rpeByExercise,
        repsBySetByExercise: {},
        unitByExercise,
        notesByExercise,
        substitutionByItemId: nextSubstitutionByItemId ?? sessionSwapByItemId,
        feedbackByExercise: feedback,
      },
      timerState: {
        workSeconds,
        restSeconds,
      },
      timerByExercise,
      startedAt: nextStartedAt,
      updatedAt: nowIso(),
    });
  };

  const recordPainReportEvent = async (params: {
    painLevel: SessionPainLevel;
    swappedExerciseId?: string | null;
    painLocation?: PainLocation | null;
    notes?: string | null;
  }) => {
    if (!currentItem) return;
    const { nextSessionId } = ensureSessionIdentity();
    const originalExerciseId = currentItem.originalExerciseId;
    await saveExerciseSwapEvent({
      sessionId: nextSessionId,
      originalExerciseId,
      swappedExerciseId: params.swappedExerciseId ?? null,
      painLevel: params.painLevel,
      programId: program?.id ?? null,
      dayIndex: programDayIndex ?? null,
      loadType: currentItem.loadType,
      painLocation: params.painLocation ?? null,
      notes: params.notes ?? null,
      timestamp: nowIso(),
    });
  };

  const persistPainLevelFeedback = async (params: {
    painLevel: SessionPainLevel;
    painLocation?: PainLocation | null;
    notes?: string | null;
  }) => {
    if (!currentItem) return;
    const currentFeedbackKey = currentItem.exerciseId;
    setPainLevelByExercise((prev) => ({
      ...prev,
      [currentFeedbackKey]: params.painLevel,
    }));
    const mappedRating: FeedbackEntry =
      params.painLevel === "none"
        ? "easy"
        : params.painLevel === "mild"
        ? "moderate"
        : "pain";
    await saveFeedback({
      ...feedback,
      [currentFeedbackKey]: {
        rating: mappedRating,
        painLocation:
          params.painLocation ?? feedback[currentFeedbackKey]?.painLocation ?? null,
        notes: params.notes ?? feedback[currentFeedbackKey]?.notes ?? "",
      },
    });
  };

  const handleSavePainReportOnly = async () => {
    await persistPainLevelFeedback({
      painLevel: painModalLevel,
      painLocation: painModalLocation ? (painModalLocation as PainLocation) : null,
      notes: painModalNotes.trim() || null,
    });
    setPainModalMessage(null);
    setPainModalLocation("");
    setPainModalNotes("");
    setPainModalOpen(false);
  };

  const handleSwapFromPainReport = async () => {
    if (!data || !currentItem) return;
    const shouldSwap =
      painModalLevel === "moderate" || painModalLevel === "severe";
    if (!shouldSwap) {
      await handleSavePainReportOnly();
      return;
    }

    const candidateId = findPainSwapAlternativeExerciseId({
      questionnaire: data,
      currentItem: {
        id: currentItem.id,
        dayTitle: currentItem.dayTitle,
        section: currentItem.section,
        exerciseId: currentItem.exerciseId,
        originalExerciseId: currentItem.originalExerciseId,
      },
      usedExerciseIds: new Set(flatItems.map((item) => item.exerciseId)),
    });
    if (!candidateId || candidateId === currentItem.exerciseId) {
      setPainModalMessage("No safe same-lane substitute found for this exercise.");
      await handleSavePainReportOnly();
      return;
    }

    const nextSubstitution = {
      ...sessionSwapByItemId,
      [currentItem.id]: candidateId,
    };
    setSessionSwapByItemId(nextSubstitution);
    await recordPainReportEvent({
      painLevel: painModalLevel,
      swappedExerciseId: candidateId,
      painLocation: painModalLocation ? (painModalLocation as PainLocation) : null,
      notes: painModalNotes.trim() || null,
    });
    await persistPainLevelFeedback({
      painLevel: painModalLevel,
      painLocation: painModalLocation ? (painModalLocation as PainLocation) : null,
      notes: painModalNotes.trim() || null,
    });
    await persistSessionDraftNow(nextSubstitution);
    setPainModalMessage(null);
    setPainModalLocation("");
    setPainModalNotes("");
    setPainModalOpen(false);
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
    setSessionSwapByItemId({});
    setPainLevelByExercise({});
    setPainModalOpen(false);
    setPainModalLocation("");
    setPainModalNotes("");
    setPainModalMessage(null);
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
      const originalExerciseId = item.originalExerciseId ?? null;
      const loadPref = prefs?.loadPrefsByExercise?.[exerciseId];
      const unit = unitByExercise[exerciseId] ?? loadPref?.unit ?? "lb";
      const weightValue = weightByExercise[exerciseId] ?? loadPref?.weight ?? "";
      const weight =
        item.loadType === "weighted" && weightValue ? Number(weightValue) : null;
      const repsValue = repsByExercise[exerciseId] ?? loadPref?.reps ?? "";
      const fallbackReps =
        !item.durationSec && item.reps ? parseFirstNumber(item.reps) : null;
      const reps = repsValue ? Number(repsValue) : fallbackReps;
      const rpeRaw = rpeByExercise[exerciseId];
      const rpeParsed = Number(rpeRaw);
      const rpe =
        rpeRaw && Number.isFinite(rpeParsed)
          ? Math.min(10, Math.max(1, rpeParsed))
          : null;
      const { minSets: itemMinSets, maxSets: itemMaxSets } = parseSetsRange(item.sets);
      const preferredSets = loadPref?.selectedSets;
      const setsPlanned =
        selectedSets[item.id] ??
        (typeof preferredSets === "number" && Number.isFinite(preferredSets)
          ? Math.min(itemMaxSets, Math.max(itemMinSets, preferredSets))
          : itemMinSets);
      const setsCompleted = (completedSets[item.id] ?? []).filter(Boolean)
        .length;
      const prescribedRepsRange = parseRangeFromString(item.reps ?? null);
      const prescribedRepsPerSet = prescribedRepsRange.min;
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
      const felt = feedback[item.exerciseId]?.rating ?? feedback[item.id]?.rating ?? null;
      const painLevel =
        painLevelByExercise[item.exerciseId] ??
        painLevelByExercise[item.id] ??
        (felt === "pain" ? "moderate" : "none");
      const guidanceDifficulty: "easy" | "moderate" | "hard" | "failed" | null =
        setsPlanned > 0 && setsCompleted < setsPlanned
          ? "failed"
          : felt === "easy" || felt === "moderate" || felt === "hard"
          ? felt
          : null;
      const nextTimeGuidance = generateNextTimeGuidance({
        loadType: item.loadType,
        prescribedSets: setsPlanned,
        prescribedRepsPerSet,
        prescribedDurationSec:
          item.loadType === "timed" ? timer.workSeconds : item.durationSec ?? null,
        actualSets: setsCompleted,
        actualRepsPerSet: reps,
        actualDurationSec: item.loadType === "timed" ? timer.workSeconds : null,
        difficulty: guidanceDifficulty,
        painLevel,
      });

      return {
        id: uuid(),
        userId: null,
        sessionId: sessionIdValue,
        exerciseId,
        section: normalizeLogSection(item.section),
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
        rpe,
        felt,
        painLevel,
        painLocation:
          feedback[item.exerciseId]?.painLocation ??
          feedback[item.id]?.painLocation ??
          null,
        nextTimeGuidance,
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
      const progress = applyCompletedDayToProgramProgress({
        priorProgress: programProgress,
        programId: program.id,
        phaseIndex: program.phaseIndex ?? 1,
        daysPerWeek: program.daysPerWeek,
        completedDayIndex: programDayIndex,
        completedAtIso: completedAt,
        phaseStartedAtFallback: program.createdAt ?? completedAt,
      }).progress;
      await saveProgramProgress(progress);
      setProgramProgress(progress);
      saveAppState({
        selectedDay: progress.nextDayIndex,
      });
    }

    await clearDraft(sessionIdValue);
    saveAppState({ activeSessionId: undefined });
  };

  const { minSets, maxSets } = parseSetsRange(currentItem?.sets);
  const currentLoadPref = currentExerciseId
    ? prefs?.loadPrefsByExercise?.[currentExerciseId]
    : undefined;
  const preferredSets =
    currentLoadPref?.selectedSets ??
    lastLog?.setsCompleted ??
    lastLog?.setsPlanned ??
    minSets;
  const boundedPreferredSets = Math.min(
    maxSets,
    Math.max(minSets, preferredSets ?? minSets)
  );
  const currentSelectedSets =
    currentItemId && selectedSets[currentItemId] !== undefined
      ? selectedSets[currentItemId]
      : boundedPreferredSets;
  const checks =
    completedSets[currentItemId ?? ""] ??
    Array.from({ length: currentSelectedSets }, () => false);
  const allSetsCompleted =
    checks.length > 0 && checks.every((value) => Boolean(value));
  const currentFeedbackKey = currentItem?.exerciseId ?? "";
  const currentFeedback = feedback[currentFeedbackKey] ?? null;
  const currentUnitValue = currentExerciseId
    ? unitByExercise[currentExerciseId] ?? currentLoadPref?.unit ?? "lb"
    : "lb";
  const currentWeightValue = currentExerciseId
    ? weightByExercise[currentExerciseId] ??
      currentLoadPref?.weight ??
      (lastLog?.weight ? String(lastLog.weight) : "")
    : "";
  const currentRepsValue = currentExerciseId
    ? repsByExercise[currentExerciseId] ??
      currentLoadPref?.reps ??
      (lastLog?.reps
        ? String(lastLog.reps)
        : currentDurationSec
        ? ""
        : String(parseFirstNumber(currentReps ?? undefined) ?? ""))
    : "";
  const currentRpeValue = currentExerciseId
    ? rpeByExercise[currentExerciseId] ??
      (lastLog?.rpe ? String(lastLog.rpe) : "")
    : "";
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
      ? currentWeightValue || "-"
      : "-";
  const previewUnit =
    currentItem?.loadType === "weighted" && currentItem
      ? currentUnitValue
      : null;
  const previewReps =
    currentItem && currentItem.loadType !== "timed"
      ? currentRepsValue ||
        String(parseFirstNumber(currentItem.reps) ?? "-")
      : "-";
  const previewSetsPlanned = currentSelectedSets;
  const previewSetsCompleted = checks.filter(Boolean).length;

  useEffect(() => {
    if (!currentExerciseId) return;
    const loadLast = async () => {
      const [latest] = await listExerciseLogsByExerciseHistory(currentExerciseId, 1);
      setLastLog(latest);
    };
    loadLast();
  }, [currentExerciseId]);

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
  }, [trackDropoff]);

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
          rpeByExercise,
          repsBySetByExercise: {},
          unitByExercise,
          notesByExercise,
          substitutionByItemId: sessionSwapByItemId,
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
    sessionComplete,
    activeIndex,
    completedSets,
    selectedSets,
    weightByExercise,
    repsByExercise,
    rpeByExercise,
    unitByExercise,
    notesByExercise,
    sessionSwapByItemId,
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
            <span
              className="sr-only"
              data-testid="current-exercise-id"
              data-exercise-id={currentItem.exerciseId}
            />
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
            initialExerciseSeconds={currentTimer.workSeconds}
            initialRestSeconds={currentTimer.restSeconds}
            onExerciseDurationChange={(seconds) => {
              updateTimerPrefs(
                { workSeconds: seconds, restSeconds: currentTimer.restSeconds },
                currentItem.exerciseId
              );
            }}
            onRestDurationChange={(seconds) => {
              updateTimerPrefs(
                { workSeconds: currentTimer.workSeconds, restSeconds: seconds },
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
            <div className="flex items-center gap-2">
              <p className="ui-title">Log this exercise</p>
              <button
                type="button"
                data-testid="report-pain-trigger"
                onClick={() => {
                  setPainModalLevel("none");
                  setPainModalLocation(
                    (currentFeedback?.painLocation as PainLocation | undefined) ?? ""
                  );
                  setPainModalNotes(currentFeedback?.notes ?? "");
                  setPainModalMessage(null);
                  setPainModalOpen(true);
                }}
                className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-[11px] font-semibold text-rose-700"
              >
                Report pain
              </button>
            </div>
            <div className="flex items-center gap-3">
              {lastLog ? (
                <div className="ui-body">
                  <p>
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
                  {lastLog.nextTimeGuidance ? (
                    <p
                      className="mt-1 text-[11px] text-slate-600"
                      data-testid="next-time-guidance"
                    >
                      {lastLog.nextTimeGuidance}
                    </p>
                  ) : null}
                </div>
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
                <label className="text-xs font-semibold text-slate-700" htmlFor="weight-input">
                  Weight
                </label>
                <input
                  id="weight-input"
                  data-testid="weight-input"
                  type="number"
                  min={0}
                  value={currentWeightValue}
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
                        currentUnitValue === unit
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
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-xs font-semibold text-slate-700" htmlFor="rpe-input">
                RPE (1-10)
              </label>
              <input
                id="rpe-input"
                data-testid="rpe-input"
                type="number"
                min={1}
                max={10}
                value={currentRpeValue}
                onChange={(event) => applyRpe(currentItem.exerciseId, event.target.value)}
                className="ui-input w-24"
                placeholder="RPE"
              />
            </div>

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
                  <label className="font-semibold text-slate-700" htmlFor="reps-input">
                    Reps
                  </label>
                </div>
                <input
                  id="reps-input"
                  data-testid="reps-input"
                  type="number"
                  min={1}
                  value={currentRepsValue}
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
          </div>
        ) : null}

        {painModalOpen ? (
          <div
            className="ui-card border-rose-200 bg-rose-50 p-6"
            data-testid="pain-report-modal"
          >
            <p className="text-sm font-semibold text-slate-900">
              Pain check-in for {currentItem.name}
            </p>
            <p className="mt-1 text-xs text-slate-600">
              Select the level you felt on this exercise.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(["none", "mild", "moderate", "severe"] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  data-testid={`pain-level-${level}`}
                  onClick={() => {
                    setPainModalLevel(level);
                    setPainModalMessage(null);
                  }}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                    painModalLevel === level
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-700"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
            <div className="mt-3 grid gap-3 text-xs">
              <label className="flex flex-col gap-2">
                <span className="font-semibold text-slate-700">
                  Location (optional)
                </span>
                <select
                  data-testid="pain-report-location"
                  value={painModalLocation}
                  onChange={(event) =>
                    setPainModalLocation(
                      event.target.value ? (event.target.value as PainLocation) : ""
                    )
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
              <label className="flex flex-col gap-2">
                <span className="font-semibold text-slate-700">
                  Notes (optional)
                </span>
                <textarea
                  data-testid="pain-report-notes"
                  value={painModalNotes}
                  onChange={(event) => setPainModalNotes(event.target.value)}
                  rows={2}
                  className="ui-input"
                  placeholder="What did you feel?"
                />
              </label>
            </div>
            {painModalMessage ? (
              <p className="mt-3 text-xs font-semibold text-rose-700">
                {painModalMessage}
              </p>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                data-testid="pain-report-cancel"
                onClick={() => {
                  setPainModalMessage(null);
                  setPainModalLocation("");
                  setPainModalNotes("");
                  setPainModalOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="secondary"
                data-testid="pain-report-save"
                onClick={() => {
                  void handleSavePainReportOnly();
                }}
              >
                Save pain report
              </Button>
              {painModalLevel === "moderate" || painModalLevel === "severe" ? (
                <Button
                  type="button"
                  variant="primary"
                  data-testid="pain-report-swap"
                  onClick={() => {
                    void handleSwapFromPainReport();
                  }}
                >
                  Swap exercise
                </Button>
              ) : null}
            </div>
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
