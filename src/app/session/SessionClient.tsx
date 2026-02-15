"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
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
import { primaryActionBtn } from "@/components/ui/buttonStyles";
import DualModeTimer, {
  type DualModeTimerRuntimeState,
} from "@/components/DualModeTimer";
import ExerciseCard from "@/components/ExerciseCard";
import SessionProgressHeader from "@/components/session/SessionProgressHeader";
import OnboardingInfoButton from "@/components/onboarding/OnboardingInfoButton";
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
import { markSessionComplete } from "@/lib/sessionStore";

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
  const [timerRuntimeByItemId, setTimerRuntimeByItemId] = useState<
    Record<string, DualModeTimerRuntimeState>
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
  const [exerciseCompleteFlashVisible, setExerciseCompleteFlashVisible] =
    useState(false);
  const saveStateTimerRef = useRef<number | null>(null);
  const exerciseCompleteFlashTimerRef = useRef<number | null>(null);
  const dropoffTrackedRef = useRef(false);
  const sessionCompleteRef = useRef(false);
  const activeIndexRef = useRef(0);
  const sessionIdRef = useRef<string | null>(null);
  const lastExerciseCompletionRef = useRef<{
    itemId: string | null;
    allSetsCompleted: boolean;
  }>({
    itemId: null,
    allSetsCompleted: false,
  });
  const previousActiveIndexRef = useRef(0);
  const exerciseCardRef = useRef<HTMLDivElement | null>(null);
  const weightInputRef = useRef<HTMLInputElement | null>(null);
  const repsInputRef = useRef<HTMLInputElement | null>(null);
  const rpeInputRef = useRef<HTMLInputElement | null>(null);
  const setCheckboxRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const feedbackButtonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const nextButtonRef = useRef<HTMLButtonElement | null>(null);

  function applyDraft(draft: SessionDraft) {
    setSessionId(draft.sessionId);
    setSessionStartedAt(draft.startedAt ?? null);
    setActiveIndex(Math.max(0, draft.currentExerciseIndex ?? 0));
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
    setTimerRuntimeByItemId(draft.timerRuntimeByItemId ?? {});
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
      const resumeId =
        searchParams.get("resumeSessionId") ?? searchParams.get("sessionId");
      const requestedDayIndex = dayIndexRaw ? Number(dayIndexRaw) : null;

      let resolvedProgram: Program | null = null;
      let resolvedProgress: ProgramProgress | null = null;
      let resolvedDayIndex: number | null = Number.isFinite(requestedDayIndex)
        ? (requestedDayIndex as number)
        : null;

      if (programId) {
        resolvedProgram = await getProgram(programId);
        if (resolvedProgram) {
          resolvedProgress = await getProgramProgress(resolvedProgram.id);
        }
      }

      if (resumeId) {
        const draft = await loadDraft(resumeId);
        if (draft) {
          applyDraft(draft);
          if (!resolvedProgram && draft.programId) {
            resolvedProgram = await getProgram(draft.programId);
            if (resolvedProgram) {
              resolvedProgress = await getProgramProgress(resolvedProgram.id);
            }
          }
          if (!Number.isFinite(resolvedDayIndex) && Number.isFinite(draft.dayIndex)) {
            resolvedDayIndex = draft.dayIndex as number;
          }
        }
      }

      if (resolvedProgram) {
        const fallbackDayIndex =
          resolvedProgress && Number.isFinite(resolvedProgress.nextDayIndex)
            ? resolvedProgress.nextDayIndex
            : 0;
        const boundedDayIndex = Math.min(
          Math.max(
            0,
            Number.isFinite(resolvedDayIndex)
              ? (resolvedDayIndex as number)
              : fallbackDayIndex
          ),
          Math.max(0, resolvedProgram.week.length - 1)
        );
        setProgram(resolvedProgram);
        setProgramDayIndex(boundedDayIndex);
        setProgramProgress(resolvedProgress);
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

  const totalItems = flatItems.length;
  const currentItem = flatItems[activeIndex];
  const currentItemId = currentItem?.id ?? null;
  const currentExerciseId = currentItem?.exerciseId ?? null;
  const currentDurationSec = currentItem?.durationSec ?? null;
  const currentReps = currentItem?.reps ?? null;

  useEffect(() => {
    if (!totalItems) {
      if (activeIndex !== 0) setActiveIndex(0);
      return;
    }
    if (activeIndex > totalItems - 1) {
      setActiveIndex(totalItems - 1);
    }
  }, [activeIndex, totalItems]);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    if (previousActiveIndexRef.current === activeIndex) return;
    previousActiveIndexRef.current = activeIndex;
    if (!exerciseCardRef.current) return;
    if (typeof exerciseCardRef.current.scrollIntoView !== "function") return;
    exerciseCardRef.current.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
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

  const queueFocus = useCallback(
    (element: HTMLInputElement | HTMLButtonElement | null | undefined) => {
      if (!element) return;
      if (typeof window !== "undefined" && typeof window.requestAnimationFrame === "function") {
        window.requestAnimationFrame(() => {
          element.focus();
        });
        return;
      }
      element.focus();
    },
    []
  );

  const focusNextStepAfterSet = useCallback(
    (toggledIndex: number, setStates: boolean[]) => {
      const nextIncomplete = setStates.findIndex(
        (isComplete, index) => index > toggledIndex && !isComplete
      );
      if (nextIncomplete >= 0) {
        queueFocus(setCheckboxRefs.current[nextIncomplete]);
        return;
      }
      const firstIncomplete = setStates.findIndex((isComplete) => !isComplete);
      if (firstIncomplete >= 0) {
        queueFocus(setCheckboxRefs.current[firstIncomplete]);
        return;
      }
      queueFocus(feedbackButtonRefs.current[0] ?? nextButtonRef.current);
    },
    [queueFocus]
  );

  const toggleSetComplete = (
    itemId: string,
    index: number,
    targetSetCount: number
  ) => {
    const current =
      completedSets[itemId] ?? Array.from({ length: targetSetCount }, () => false);
    const next = current.slice(0, targetSetCount);
    while (next.length < targetSetCount) next.push(false);
    next[index] = !next[index];
    setCompletedSets((prev) => ({
      ...prev,
      [itemId]: next,
    }));
    focusNextStepAfterSet(index, next);
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
      timerRuntimeByItemId,
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

  const handleNext = async () => {
    if (!currentItem) return;
    await persistSessionDraftNow();
    setExerciseCompleteFlashVisible(false);
    if (activeIndex < totalItems - 1) {
      setActiveIndex((prev) => prev + 1);
      return;
    }
    await handleCompleteSession();
  };

  const handleBack = async () => {
    await persistSessionDraftNow();
    setExerciseCompleteFlashVisible(false);
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
    setSelectedSets({});
    setTimerRuntimeByItemId({});
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
    markSessionComplete({
      sessionId: sessionIdValue,
      programId: program?.id ?? null,
      dayIndex: programDayIndex ?? null,
      completedAt,
    });
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
  const checks = Array.from({ length: currentSelectedSets }, (_, index) =>
    Boolean(completedSets[currentItemId ?? ""]?.[index])
  );
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
  const currentExerciseMeta = currentExerciseId
    ? exerciseById(currentExerciseId)
    : null;
  const phaseLabel = program?.phaseName ?? program?.phase?.name ?? "Guided session";
  const dayPositionLabel =
    program && programDayIndex !== null
      ? `Day ${programDayIndex + 1} of ${program.daysPerWeek}`
      : "Day 1 of 1";
  const dayTitle =
    (program &&
      programDayIndex !== null &&
      program.week.find((entry) => entry.dayIndex === programDayIndex)?.title) ||
    currentItem?.dayTitle ||
    "Today";
  const exercisePositionLabel = `Exercise ${Math.min(
    totalItems,
    activeIndex + 1
  )} of ${Math.max(1, totalItems)}`;
  const sessionProgressPercent = totalItems
    ? ((activeIndex + 1) / totalItems) * 100
    : 0;
  const persistedTimerRuntime = currentItemId
    ? timerRuntimeByItemId[currentItemId] ?? null
    : null;
  const hasWeightedInput = currentItem?.loadType === "weighted";
  const hasRepsInput = currentItem?.loadType !== "timed";

  const focusFirstIncompleteSet = useCallback(() => {
    const nextSetIndex = checks.findIndex((isComplete) => !isComplete);
    if (nextSetIndex < 0) return false;
    queueFocus(setCheckboxRefs.current[nextSetIndex]);
    return true;
  }, [checks, queueFocus]);

  const handleTrackingEnter = useCallback(
    (field: "weight" | "reps" | "rpe") =>
      (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key !== "Enter") return;
        event.preventDefault();
        if (field === "weight") {
          if (hasRepsInput) {
            queueFocus(repsInputRef.current);
            return;
          }
          queueFocus(rpeInputRef.current);
          return;
        }
        if (field === "reps") {
          queueFocus(rpeInputRef.current);
          return;
        }
        if (focusFirstIncompleteSet()) return;
        queueFocus(feedbackButtonRefs.current[0] ?? nextButtonRef.current);
      },
    [focusFirstIncompleteSet, hasRepsInput, queueFocus]
  );

  const handleTimerRuntimeChange = useCallback(
    (nextState: DualModeTimerRuntimeState) => {
      if (!currentItemId) return;
      setTimerRuntimeByItemId((prev) => {
        const existing = prev[currentItemId];
        if (
          existing &&
          existing.mode === nextState.mode &&
          existing.running === nextState.running &&
          existing.remainingSeconds === nextState.remainingSeconds &&
          existing.exerciseSeconds === nextState.exerciseSeconds &&
          existing.restSeconds === nextState.restSeconds
        ) {
          return prev;
        }
        return {
          ...prev,
          [currentItemId]: nextState,
        };
      });
    },
    [currentItemId]
  );

  useEffect(() => {
    setCheckboxRefs.current = {};
    feedbackButtonRefs.current = [];
  }, [currentItemId]);

  useEffect(() => {
    if (!currentItemId) return;
    if (painModalOpen) return;
    if (hasWeightedInput && weightInputRef.current) {
      queueFocus(weightInputRef.current);
      return;
    }
    if (hasRepsInput && repsInputRef.current) {
      queueFocus(repsInputRef.current);
      return;
    }
    if (rpeInputRef.current) {
      queueFocus(rpeInputRef.current);
      return;
    }
    focusFirstIncompleteSet();
  }, [
    currentItemId,
    hasWeightedInput,
    hasRepsInput,
    painModalOpen,
    queueFocus,
    focusFirstIncompleteSet,
  ]);

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
        timerRuntimeByItemId,
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
    timerRuntimeByItemId,
    sessionStartedAt,
    flatItems,
  ]);

  useEffect(() => {
    if (!currentItemId) {
      setExerciseCompleteFlashVisible(false);
      lastExerciseCompletionRef.current = {
        itemId: null,
        allSetsCompleted: false,
      };
      return;
    }
    const previous = lastExerciseCompletionRef.current;
    if (previous.itemId !== currentItemId) {
      setExerciseCompleteFlashVisible(false);
      lastExerciseCompletionRef.current = {
        itemId: currentItemId,
        allSetsCompleted,
      };
      return;
    }
    if (!previous.allSetsCompleted && allSetsCompleted) {
      setExerciseCompleteFlashVisible(true);
      if (exerciseCompleteFlashTimerRef.current) {
        window.clearTimeout(exerciseCompleteFlashTimerRef.current);
      }
      exerciseCompleteFlashTimerRef.current = window.setTimeout(() => {
        setExerciseCompleteFlashVisible(false);
      }, 800);
    } else if (previous.allSetsCompleted && !allSetsCompleted) {
      setExerciseCompleteFlashVisible(false);
    }
    lastExerciseCompletionRef.current = {
      itemId: currentItemId,
      allSetsCompleted,
    };
  }, [allSetsCompleted, currentItemId]);

  useEffect(() => {
    return () => {
      if (exerciseCompleteFlashTimerRef.current) {
        window.clearTimeout(exerciseCompleteFlashTimerRef.current);
      }
    };
  }, []);

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

  if (!currentItem) {
    return (
      <BackgroundShell>
        <div className="ui-shell flex max-w-3xl flex-col gap-6 py-8 sm:py-12">
          <OnImage>
            <h1 className="text-2xl font-semibold text-white">
              No session items available
            </h1>
            <p className="text-sm text-slate-200">
              Return to results and start a planned day to continue.
            </p>
            <Link href="/results">
              <Button variant="secondary">Back to results</Button>
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
          <OnImage className="space-y-3">
            <h1 className="text-3xl font-semibold text-white">Session complete</h1>
            <p className="text-sm text-slate-200">
              Excellent work. Your program will adapt based on today&apos;s
              performance.
            </p>
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
          <OnImage className="flex flex-col gap-3 sm:flex-row">
            <Link href="/results">
              <Button
                variant="primary"
                aria-label="Back to results"
                className="h-12 w-full rounded-xl text-base font-semibold sm:min-w-[220px]"
              >
                Return to Dashboard
              </Button>
            </Link>
            <Button
              variant="secondary"
              onClick={handleStartNewSession}
              className="h-12 w-full rounded-xl text-sm font-semibold"
            >
              Start another session
            </Button>
          </OnImage>
        </div>
      </BackgroundShell>
    );
  }

  return (
    <BackgroundShell>
      <div className="ui-shell flex max-w-4xl flex-col gap-4 py-6 sm:py-8">
        <span
          className="sr-only"
          data-testid="current-exercise-id"
          data-exercise-id={currentItem.exerciseId}
        />

        <OnImage className="py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-200">
            Guided session
          </p>
        </OnImage>

        <div className="sticky top-2 z-30 space-y-2">
          <SessionProgressHeader
            phaseName={phaseLabel}
            dayPositionLabel={dayPositionLabel}
            dayTitle={dayTitle}
            exercisePositionLabel={exercisePositionLabel}
            progressPercent={sessionProgressPercent}
          />

          <div
            className={`ui-card rounded-2xl border px-4 py-3 text-sm font-semibold shadow-sm transition-colors ${tipTone}`}
          >
            Coaching tip: <span>{activeTip}</span>
          </div>
        </div>

        <div ref={exerciseCardRef}>
          <ExerciseCard
            name={currentItem.name}
            targetMuscles={currentExerciseMeta?.muscleGroups ?? []}
            cue={
              currentItem.cues[0] ??
              "Move with control, breathe steadily, and keep posture stacked."
            }
            sets={checks}
            onToggleSet={(index) =>
              toggleSetComplete(currentItem.id, index, currentSelectedSets)
            }
            onSetEnter={(index) =>
              toggleSetComplete(currentItem.id, index, currentSelectedSets)
            }
            setCheckboxRef={(index, element) => {
              setCheckboxRefs.current[index] = element;
            }}
            completionFlashVisible={exerciseCompleteFlashVisible}
          />
        </div>

        <div className="ui-card p-4 sm:p-5">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] lg:items-start">
            <DualModeTimer
              key={currentItem.id}
              initialExerciseSeconds={currentTimer.workSeconds}
              initialRestSeconds={currentTimer.restSeconds}
              onExerciseDurationChange={(seconds) => {
                void updateTimerPrefs(
                  { workSeconds: seconds, restSeconds: currentTimer.restSeconds },
                  currentItem.exerciseId
                );
              }}
              onRestDurationChange={(seconds) => {
                void updateTimerPrefs(
                  { workSeconds: currentTimer.workSeconds, restSeconds: seconds },
                  currentItem.exerciseId
                );
              }}
              defaultMode="exercise"
              persistedState={persistedTimerRuntime}
              onStateChange={handleTimerRuntimeChange}
            />

            <div className="space-y-2 text-sm text-slate-700 lg:pt-1">
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
                  ref={weightInputRef}
                  value={currentWeightValue}
                  onChange={(event) =>
                    applyWeight(currentItem.exerciseId, event.target.value)
                  }
                  onKeyDown={handleTrackingEnter("weight")}
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
            {currentItem.loadType !== "timed" ? (
              <div className="flex flex-wrap items-center gap-2">
                <label className="text-xs font-semibold text-slate-700" htmlFor="reps-input">
                  Reps
                </label>
                <input
                  id="reps-input"
                  data-testid="reps-input"
                  type="number"
                  min={1}
                  ref={repsInputRef}
                  value={currentRepsValue}
                  onChange={(event) =>
                    applySingleReps(currentItem.exerciseId, event.target.value)
                  }
                  onKeyDown={handleTrackingEnter("reps")}
                  className="ui-input w-32 text-xs"
                  placeholder="Reps per set"
                />
              </div>
            ) : null}
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
                ref={rpeInputRef}
                value={currentRpeValue}
                onChange={(event) => applyRpe(currentItem.exerciseId, event.target.value)}
                onKeyDown={handleTrackingEnter("rpe")}
                className="ui-input w-24"
                placeholder="RPE"
              />
            </div>
          </div>
        </div>

        {allSetsCompleted ? (
          <div className="ui-card p-6">
            <p className="text-sm font-semibold text-slate-900">How did it feel?</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(
                [
                  { value: "easy", label: "Easy" },
                  { value: "moderate", label: "Moderate" },
                  { value: "hard", label: "Hard" },
                ] as Array<{ value: FeedbackEntry; label: string }>
              ).map((option, index) => (
                <button
                  key={option.value}
                  type="button"
                  ref={(element) => {
                    feedbackButtonRefs.current[index] = element;
                  }}
                  onClick={() =>
                    saveFeedback({
                      ...feedback,
                      [currentFeedbackKey]: {
                        rating: option.value,
                        painLocation: currentFeedback?.painLocation ?? null,
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
                <span className="font-semibold text-slate-700">Location (optional)</span>
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
                <span className="font-semibold text-slate-700">Notes (optional)</span>
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

        <OnImage className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Link href="/results" onClick={() => trackDropoff("exit_button")}>
                <Button variant="secondary" className="min-h-11 rounded-xl px-4 text-xs">
                  Exit session
                </Button>
              </Link>
              <Button
                type="button"
                variant="secondary"
                className="min-h-11 rounded-xl px-4 text-xs"
                onClick={() => {
                  void handleBack();
                }}
                disabled={activeIndex === 0}
              >
                Back
              </Button>
            </div>
            <div className="text-xs font-semibold text-slate-200">
              {activeIndex + 1} / {totalItems}
            </div>
          </div>
          <button
            type="button"
            data-testid="session-next"
            ref={nextButtonRef}
            onClick={() => {
              void handleNext();
            }}
            className={`${primaryActionBtn} h-14 w-full min-w-0 rounded-xl px-6 text-base font-semibold ${
              sessionComplete ? "" : "motion-safe:animate-[pulse_6s_ease-in-out_infinite]"
            }`}
          >
            {activeIndex === totalItems - 1 ? "Finish session \u2192" : "Next Exercise \u2192"}
          </button>
        </OnImage>
      </div>
      <OnboardingInfoButton onboardingKey="session" />
    </BackgroundShell>
  );
}
