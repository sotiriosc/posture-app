"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
} from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { exerciseById } from "@/lib/exercises";
import { normalizeEquipmentSelectionValues } from "@/lib/equipment";
import SessionLadderPill from "@/components/session/SessionLadderPill";
import {
  PROGRAM_TEMPLATE_VERSION,
  previewPainSubstitutionChoices,
  getLadderProgressionMessage,
  computeFlaggedExercises,
  applyFeedbackContractAction,
  applyAutoSacrifice,
  computeMaintainPrompts,
  markMaintainPromptsShown,
  applyMaintainProgressionYes,
  applyMaintainProgressionNo,
} from "@/lib/program";
import type {
  FeedbackContractTrigger,
  MaintainProgressionPrompt,
} from "@/lib/program";
import { generateNextTimeGuidance } from "@/lib/progression";
import { buildQuestionnaireSignature } from "@/lib/questionnaireSignature";
import BackgroundShell from "@/components/BackgroundShell";
import OnImage from "@/components/OnImage";
import Button from "@/components/ui/Button";
import { primaryActionBtn } from "@/components/ui/buttonStyles";
import DualModeTimer, {
  type DualModeTimerRuntimeState,
} from "@/components/DualModeTimer";
import ExerciseCard from "@/components/ExerciseCard";
import SessionProgressHeader from "@/components/session/SessionProgressHeader";
import SessionFeedbackCheckIn from "@/components/session/SessionFeedbackCheckIn";
import OnboardingInfoButton from "@/components/onboarding/OnboardingInfoButton";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import { loadAppState, saveAppState } from "@/lib/appState";
import { getEffectiveTimer } from "@/lib/timerRules";
import {
  deriveNextSessionRecommendationFromSession,
  formatNextSessionRecommendationFromSession,
} from "@/lib/nextSessionRecommendation";
import {
  deriveSessionPracticeOptions,
  formatPracticeModeSessionNote,
  selectSessionPracticeItems,
} from "@/lib/sessionPracticeOptions";
import { formatSessionAdaptationPreviewFromFeedback } from "@/lib/sessionAdaptationPreview";
import { sanitizeSessionFeedback } from "@/lib/sessionFeedback";
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
  ExerciseFeedbackSummary,
  ExerciseLog,
  LogPrefs,
  PainLevel,
  PainLocation,
  Program,
  ProgramProgress,
  ProgramRoutineItem,
  NextSessionRecommendation,
  SessionFeedback,
  SessionPracticeOption,
  SessionRecord,
} from "@/lib/types";
import {
  createSession,
  getProgram,
  init,
  getProgramProgress,
  listAllPrograms,
  listExerciseLogsByExerciseHistory,
  listRecentExerciseLogsForProgram,
  listSessionsByProgramId,
  loadPrefs,
  saveExerciseLog,
  saveExerciseSwapEvent,
  savePrefs,
  saveProgramProgress,
  summarizeExerciseFeedbackFromLogs,
  updateSession,
  uuid,
  nowIso,
} from "@/lib/logStore";
import { loadTrainingSnapshot } from "@/lib/trainingSyncClient";
import { markSessionComplete } from "@/lib/sessionStore";

const STORAGE_KEY = "posture_questionnaire";

type FeedbackEntry = "easy" | "moderate" | "hard" | "pain";
type TrackingField = "weight" | "reps" | "rpe";

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

const parseDayIndexFromSessionNotes = (notes: string | null) => {
  const match = notes?.match(/dayIndex:(\d+)/);
  if (!match) return null;
  const parsed = Number(match[1]);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : null;
};

const sessionCompletedAnchor = (session: SessionRecord) =>
  session.completedAt ?? session.updatedAt ?? session.createdAt ?? "";

const hasRoutableProgramDay = (program: Program, dayIndex: number) => {
  const day = program.week.find((entry) => entry.dayIndex === dayIndex);
  return Boolean(day && Array.isArray(day.routine) && day.routine.length > 0);
};

const hasRoutableProgram = (program: Program | null | undefined) =>
  Boolean(
    program &&
      !program.deletedAt &&
      Array.isArray(program.week) &&
      program.week.some((day) => Array.isArray(day.routine) && day.routine.length > 0)
  );

const resolveRoutableProgramDayIndex = (
  program: Program,
  preferredDayIndex: number | null,
  fallbackDayIndex: number
) => {
  const boundedFallbackDayIndex = Math.min(
    Math.max(0, fallbackDayIndex),
    Math.max(0, program.week.length - 1)
  );
  const boundedPreferredDayIndex =
    typeof preferredDayIndex === "number" && Number.isFinite(preferredDayIndex)
      ? Math.min(
          Math.max(0, preferredDayIndex),
          Math.max(0, program.week.length - 1)
        )
      : boundedFallbackDayIndex;

  if (hasRoutableProgramDay(program, boundedPreferredDayIndex)) {
    return boundedPreferredDayIndex;
  }
  if (hasRoutableProgramDay(program, boundedFallbackDayIndex)) {
    return boundedFallbackDayIndex;
  }

  const firstRoutableDay = program.week.find(
    (day) => Array.isArray(day.routine) && day.routine.length > 0
  );
  return typeof firstRoutableDay?.dayIndex === "number"
    ? firstRoutableDay.dayIndex
    : null;
};

const isProgramCompatibleWithSessionProfile = (
  candidate: Program,
  questionnaire: QuestionnaireData | null,
  savedQuestionnaireSignature?: string | null
) => {
  if (!hasRoutableProgram(candidate)) return false;
  if (!questionnaire) return true;
  if (
    typeof candidate.templateVersion === "number" &&
    candidate.templateVersion !== PROGRAM_TEMPLATE_VERSION
  ) {
    return false;
  }
  if (candidate.daysPerWeek !== questionnaire.daysPerWeek) return false;
  if (candidate.goalTrack && candidate.goalTrack !== questionnaire.goals) return false;

  const expectedSignature = buildQuestionnaireSignature(questionnaire);
  const persistedSignature =
    candidate.questionnaireSignature ?? savedQuestionnaireSignature ?? null;
  return !persistedSignature || persistedSignature === expectedSignature;
};

const resolveLatestCompatibleProgram = async (
  questionnaire: QuestionnaireData | null,
  savedQuestionnaireSignature?: string | null
) => {
  const programs = await listAllPrograms();
  return (
    programs.find((candidate) =>
      isProgramCompatibleWithSessionProfile(
        candidate,
        questionnaire,
        savedQuestionnaireSignature
      )
    ) ?? null
  );
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
  const searchParamString = searchParams.toString();
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
  const [sessionFeedbackDraft, setSessionFeedbackDraft] = useState<
    Partial<SessionFeedback>
  >({ completed: "yes" });
  const [sessionFeedbackSaveState, setSessionFeedbackSaveState] = useState<
    "idle" | "saving" | "saved"
  >("idle");
  const [prefs, setPrefs] = useState<LogPrefs | null>(null);
  const [lastLog, setLastLog] = useState<ExerciseLog | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(() => uuid());
  const [sessionStartedAt, setSessionStartedAt] = useState<string | null>(() => nowIso());
  const [program, setProgram] = useState<Program | null>(null);
  const [programDayIndex, setProgramDayIndex] = useState<number | null>(null);
  const [programProgress, setProgramProgress] =
    useState<ProgramProgress | null>(null);
  const [nextSessionRecommendation, setNextSessionRecommendation] =
    useState<NextSessionRecommendation | null>(null);
  const [selectedPracticeMode, setSelectedPracticeMode] =
    useState<SessionPracticeOption["mode"]>("full");
  const [sessionPlanLoading, setSessionPlanLoading] = useState(true);
  const [sessionPlanIssue, setSessionPlanIssue] = useState<string | null>(null);
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

  // Phase 3.2 — pre-session feedback contract prompt state
  const [contractTriggers, setContractTriggers] = useState<FeedbackContractTrigger[]>([]);
  const [contractPromptIndex, setContractPromptIndex] = useState(0);
  const [contractDismissed, setContractDismissed] = useState(false);

  // Phase 3.3 — maintain-mode phase-transition prompts
  const [maintainPrompts, setMaintainPrompts] = useState<MaintainProgressionPrompt[]>([]);
  const [maintainPromptIndex, setMaintainPromptIndex] = useState(0);
  const [maintainPromptsDismissed, setMaintainPromptsDismissed] = useState(false);

  // Phase 3.3 — exercise block menu state
  const [blockMenuOpen, setBlockMenuOpen] = useState(false);
  const [blockMenuExerciseId, setBlockMenuExerciseId] = useState<string | null>(null);
  const [blockConfirmOpen, setBlockConfirmOpen] = useState(false);

  const [activeTrackingField, setActiveTrackingField] =
    useState<TrackingField | null>(null);
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
  const trackingPanelRef = useRef<HTMLDivElement | null>(null);
  const weightInputRef = useRef<HTMLInputElement | null>(null);
  const repsInputRef = useRef<HTMLInputElement | null>(null);
  const rpeInputRef = useRef<HTMLInputElement | null>(null);
  const setCheckboxRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const feedbackButtonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const nextButtonRef = useRef<HTMLButtonElement | null>(null);
  const prefsRef = useRef<LogPrefs | null>(null);
  const timerByExerciseRef = useRef<
    Record<string, { workSeconds: number; restSeconds: number }>
  >({});
  const timerPrefsSaveSeqRef = useRef(0);
  const focusedItemIdRef = useRef<string | null>(null);
  const wasPainModalOpenRef = useRef(false);

  useEffect(() => {
    prefsRef.current = prefs;
  }, [prefs]);

  useEffect(() => {
    timerByExerciseRef.current = timerByExercise;
  }, [timerByExercise]);

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
      setSessionPlanLoading(true);
      setSessionPlanIssue(null);
      try {
        await init();
        let resolvedQuestionnaire: QuestionnaireData | null = null;
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as Partial<QuestionnaireData>;
          resolvedQuestionnaire = {
            goals: parsed.goals ?? "Improve posture",
            painAreas: parsed.painAreas ?? [],
            experience: parsed.experience ?? "Beginner",
            equipment: normalizeEquipmentSelectionValues(
              parsed.equipment ?? ["none"]
            ),
            daysPerWeek: normalizeDaysPerWeek(parsed.daysPerWeek),
          };
          setData(resolvedQuestionnaire);
        } else {
          const snapshot = await loadTrainingSnapshot();
          const remote = snapshot?.questionnaire as Partial<QuestionnaireData> | undefined;
          if (remote) {
            resolvedQuestionnaire = {
              goals: remote.goals ?? "Improve posture",
              painAreas: remote.painAreas ?? [],
              experience: remote.experience ?? "Beginner",
              equipment: normalizeEquipmentSelectionValues(
                remote.equipment ?? ["none"]
              ),
              daysPerWeek: normalizeDaysPerWeek(remote.daysPerWeek),
            };
            setData(resolvedQuestionnaire);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(resolvedQuestionnaire));
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

        const currentSearchParams = new URLSearchParams(searchParamString);
        const state = loadAppState();
        const explicitProgramId = currentSearchParams.get("programId");
        const dayIndexRaw = currentSearchParams.get("dayIndex");
        const resumeId =
          currentSearchParams.get("resumeSessionId") ?? currentSearchParams.get("sessionId");
        const requestedDayIndex = dayIndexRaw ? Number(dayIndexRaw) : null;
        const resumeDraft = resumeId ? await loadDraft(resumeId) : null;

        if (resumeDraft) {
          applyDraft(resumeDraft);
        }

        let resolvedProgram: Program | null = null;
        let resolvedProgress: ProgramProgress | null = null;
        let resolvedDayIndex: number | null = Number.isFinite(requestedDayIndex)
          ? (requestedDayIndex as number)
          : null;

        if (!Number.isFinite(resolvedDayIndex) && Number.isFinite(resumeDraft?.dayIndex)) {
          resolvedDayIndex = resumeDraft?.dayIndex as number;
        }

        const candidateProgramIds = [
          explicitProgramId,
          resumeDraft?.programId ?? null,
          state?.activeProgramId ?? null,
          state?.programId ?? null,
        ].filter((id): id is string => Boolean(id));
        const triedProgramIds = new Set<string>();

        for (const candidateProgramId of candidateProgramIds) {
          if (triedProgramIds.has(candidateProgramId)) continue;
          triedProgramIds.add(candidateProgramId);
          const candidate = await getProgram(candidateProgramId);
          if (!hasRoutableProgram(candidate)) continue;
          resolvedProgram = candidate;
          resolvedProgress = await getProgramProgress(candidate.id);
          break;
        }

        if (!resolvedProgram) {
          const latest = await resolveLatestCompatibleProgram(resolvedQuestionnaire, null);
          if (latest) {
            resolvedProgram = latest;
            resolvedProgress = await getProgramProgress(latest.id);
          }
        }

        if (resolvedProgram) {
          const fallbackDayIndex =
            resolvedProgress && Number.isFinite(resolvedProgress.nextDayIndex)
              ? resolvedProgress.nextDayIndex
              : 0;
          const routableDayIndex = resolveRoutableProgramDayIndex(
            resolvedProgram,
            Number.isFinite(resolvedDayIndex) ? (resolvedDayIndex as number) : null,
            fallbackDayIndex
          );
          const programSessions = await listSessionsByProgramId(resolvedProgram.id);
          const feedbackSessions = programSessions
            .filter((session) => !session.deletedAt && Boolean(session.feedback))
            .sort((left, right) =>
              sessionCompletedAnchor(right).localeCompare(sessionCompletedAnchor(left))
            );
          const sameDayFeedbackSession =
            routableDayIndex === null
              ? null
              : feedbackSessions.find(
                  (session) =>
                    parseDayIndexFromSessionNotes(session.notes) === routableDayIndex
                ) ?? null;
          const latestFeedbackSession =
            sameDayFeedbackSession ?? feedbackSessions[0] ?? null;
          setProgram(resolvedProgram);
          setProgramDayIndex(routableDayIndex);
          setProgramProgress(resolvedProgress);
          setNextSessionRecommendation(
            deriveNextSessionRecommendationFromSession(latestFeedbackSession)
          );
          setSessionPlanIssue(null);

          // Phase 3.2 — compute pre-session feedback contract triggers.
          if (routableDayIndex !== null) {
            try {
              const day = resolvedProgram.week.find(
                (d) => d.dayIndex === routableDayIndex
              );
              const mainExerciseIds = (day?.routine ?? [])
                .filter((item) => item.section === "main")
                .map((item) => item.exerciseId);

              if (mainExerciseIds.length > 0) {
                const recentLogs = await listRecentExerciseLogsForProgram({
                  programId: resolvedProgram.id,
                  lookbackDays: 14,
                });
                const logSummaries = summarizeExerciseFeedbackFromLogs(
                  recentLogs,
                  "local"
                );
                // Merge persisted contract state (probation, deferred, etc.)
                // into computed log summaries before checking triggers.
                const contractState =
                  storedPrefs.contractStateByExercise ?? {};
                const mergedSummaries = new Map<string, ExerciseFeedbackSummary>(
                  logSummaries
                );
                Object.entries(contractState).forEach(([exId, state]) => {
                  const base = mergedSummaries.get(exId) ?? {
                    exerciseId: exId,
                    pain: "none",
                    difficulty: "normal",
                    completionRate: 1,
                  };
                  mergedSummaries.set(exId, { ...base, ...state });
                });

                const triggers = computeFlaggedExercises({
                  todaysPlanExerciseIds: mainExerciseIds,
                  recentLogs,
                  feedbackSummaryByExercise: mergedSummaries,
                });
                if (triggers.length > 0) {
                  setContractTriggers(triggers);
                  setContractPromptIndex(0);
                  setContractDismissed(false);
                }
              }
            } catch {
              // Non-critical: if contract check fails, proceed with session normally.
            }
          }

          // Phase 3.3 — compute maintain-mode phase-transition prompts.
          try {
            const intent = resolvedQuestionnaire?.trainingIntent ?? "build";
            if (intent === "maintain" && resolvedProgram.ladderState) {
              const phaseIdx = resolvedProgress?.phaseIndex ?? 0;
              const prompts = computeMaintainPrompts({
                trainingIntent: "maintain",
                ladderState: resolvedProgram.ladderState,
                phaseIndex: phaseIdx,
              });
              if (prompts.length > 0) {
                setMaintainPrompts(prompts);
                setMaintainPromptIndex(0);
                setMaintainPromptsDismissed(false);
              }
            }
          } catch {
            // Non-critical: proceed with session normally.
          }
          return;
        }

        setProgram(null);
        setProgramDayIndex(null);
        setProgramProgress(null);
        setNextSessionRecommendation(null);
        setSessionPlanIssue(
          resolvedQuestionnaire
            ? "No saved Praxis program is available for this session yet. Return to Results to rebuild your active plan."
            : "No saved Praxis profile or program is available for this session yet. Build your profile to create a plan."
        );
      } catch {
        setProgram(null);
        setProgramDayIndex(null);
        setProgramProgress(null);
        setNextSessionRecommendation(null);
        setSessionPlanIssue(
          "Praxis could not load your saved program for this session. Your local data is still safe."
        );
      } finally {
        setSessionPlanLoading(false);
      }
    };
    load();
  }, [searchParamString]);

  const currentProgramDay = useMemo(() => {
    if (!program || programDayIndex === null) return null;
    return program.week.find((entry) => entry.dayIndex === programDayIndex) ?? null;
  }, [program, programDayIndex]);

  const practiceOptions = useMemo(
    () =>
      currentProgramDay
        ? deriveSessionPracticeOptions(
            currentProgramDay,
            nextSessionRecommendation
          )
        : [],
    [currentProgramDay, nextSessionRecommendation]
  );

  const selectedPracticeOption =
    practiceOptions.find((option) => option.mode === selectedPracticeMode) ??
    practiceOptions[0] ??
    null;
  const effectivePracticeMode = selectedPracticeOption?.mode ?? "full";

  useEffect(() => {
    if (!practiceOptions.length) return;
    if (practiceOptions.some((option) => option.mode === selectedPracticeMode)) {
      return;
    }
    setSelectedPracticeMode("full");
  }, [practiceOptions, selectedPracticeMode]);

  const practiceRoutineItems = useMemo(() => {
    if (!currentProgramDay) return [] as ProgramRoutineItem[];
    return selectSessionPracticeItems(currentProgramDay, effectivePracticeMode);
  }, [currentProgramDay, effectivePracticeMode]);

  const flatItems = useMemo(() => {
    if (currentProgramDay) {
      const day = currentProgramDay;
      return practiceRoutineItems.map((item) => {
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

    return [];
  }, [currentProgramDay, practiceRoutineItems, substitutionByExercise, sessionSwapByItemId]);

  const totalItems = flatItems.length;
  const currentItem = flatItems[activeIndex];
  const currentItemId = currentItem?.id ?? null;
  const currentExerciseId = currentItem?.exerciseId ?? null;
  const currentDurationSec = currentItem?.durationSec ?? null;
  const currentReps = currentItem?.reps ?? null;

  useEffect(() => {
    if (sessionPlanLoading) return;
    if (!totalItems) {
      if (activeIndex !== 0) {
        queueMicrotask(() => {
          setActiveIndex(0);
        });
      }
      return;
    }
    if (activeIndex > totalItems - 1) {
      queueMicrotask(() => {
        setActiveIndex(totalItems - 1);
      });
    }
  }, [activeIndex, sessionPlanLoading, totalItems]);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  const scrollSessionTop = useCallback((behavior: ScrollBehavior = "smooth") => {
    if (typeof navigator !== "undefined" && /jsdom/i.test(navigator.userAgent)) {
      return;
    }
    if (typeof window !== "undefined" && typeof window.scrollTo === "function") {
      try {
        window.scrollTo({ top: 0, behavior });
        return;
      } catch {
        // JSDOM and some embedded browsers can throw on scrollTo.
      }
    }
    if (!exerciseCardRef.current) return;
    if (typeof exerciseCardRef.current.scrollIntoView !== "function") return;
    exerciseCardRef.current.scrollIntoView({
      behavior,
      block: "start",
    });
  }, []);

  useEffect(() => {
    if (previousActiveIndexRef.current === activeIndex) return;
    previousActiveIndexRef.current = activeIndex;
    scrollSessionTop();
  }, [activeIndex, scrollSessionTop]);

  useEffect(() => {
    scrollSessionTop("auto");
  }, [scrollSessionTop]);

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
    "Keep your posture steady",
    "Relax your jaw and neck",
    "Smooth tempo over speed",
  ];
  const activeTip = tips[tipIndex] ?? "";
  const tipTone = (() => {
    if (/breathe|breath/i.test(activeTip)) {
      return "border-sky-300/35 bg-sky-400/10 text-sky-100 shadow-[0_18px_42px_rgba(14,165,233,0.16)]";
    }
    if (/move|control|tempo/i.test(activeTip)) {
      return "border-amber-300/35 bg-amber-300/10 text-amber-100 shadow-[0_18px_42px_rgba(245,158,11,0.12)]";
    }
    if (/posture/i.test(activeTip)) {
      return "border-indigo-300/35 bg-indigo-300/10 text-indigo-100 shadow-[0_18px_42px_rgba(99,102,241,0.14)]";
    }
    if (/relax|jaw|neck/i.test(activeTip)) {
      return "border-rose-300/35 bg-rose-300/10 text-rose-100 shadow-[0_18px_42px_rgba(244,63,94,0.13)]";
    }
    return "border-slate-300/25 bg-slate-900/65 text-slate-100 shadow-[0_18px_42px_rgba(15,23,42,0.22)]";
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
      const shouldSelectInput =
        element instanceof HTMLInputElement &&
        ["text", "search", "tel", "url", "password", "number"].includes(
          element.type
        );
      const focusAction = () => {
        try {
          element.focus({ preventScroll: true });
        } catch {
          element.focus();
        }
        if (!shouldSelectInput) return;
        try {
          (element as HTMLInputElement).select();
        } catch {
          // Some input types do not support selection.
        }
      };
      if (typeof window !== "undefined" && typeof window.requestAnimationFrame === "function") {
        window.requestAnimationFrame(() => {
          focusAction();
        });
        return;
      }
      focusAction();
    },
    []
  );

  const scrollTrackingPanelIntoView = useCallback(
    (behavior: ScrollBehavior = "smooth") => {
      if (typeof navigator !== "undefined" && /jsdom/i.test(navigator.userAgent)) {
        return;
      }
      const panel = trackingPanelRef.current;
      if (!panel || typeof panel.scrollIntoView !== "function") return;
      try {
        panel.scrollIntoView({ behavior, block: "center" });
      } catch {
        panel.scrollIntoView();
      }
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
      if (currentItem?.loadType === "weighted" && weightInputRef.current) {
        queueFocus(weightInputRef.current);
        return;
      }
      if (currentItem?.loadType !== "timed" && repsInputRef.current) {
        queueFocus(repsInputRef.current);
        return;
      }
      if (rpeInputRef.current) {
        queueFocus(rpeInputRef.current);
        return;
      }
      queueFocus(feedbackButtonRefs.current[0] ?? nextButtonRef.current);
    },
    [currentItem, queueFocus]
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
    const isNowComplete = !next[index];
    next[index] = isNowComplete;
    setCompletedSets((prev) => ({
      ...prev,
      [itemId]: next,
    }));
    if (isNowComplete) {
      focusNextStepAfterSet(index, next);
      return;
    }
    queueFocus(setCheckboxRefs.current[index]);
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
    const currentPrefs = prefsRef.current;
    const currentTimerByExercise = timerByExerciseRef.current;
    const nextByExercise = exerciseId
      ? {
          ...(currentPrefs?.timerPrefsByExercise ?? currentTimerByExercise),
          [exerciseId]: next,
        }
      : currentPrefs?.timerPrefsByExercise ?? currentTimerByExercise;
    setTimerByExercise(nextByExercise);
    timerByExerciseRef.current = nextByExercise;
    setWorkSeconds(next.workSeconds);
    setRestSeconds(next.restSeconds);

    const nextPrefs: LogPrefs = {
      ...(currentPrefs ?? { schemaVersion: 1 }),
      timerPrefs: next,
      timerPrefsByExercise: nextByExercise,
      loadPrefsByExercise: currentPrefs?.loadPrefsByExercise,
      feedbackByExercise: feedback,
      substitutionByExercise: substitutionByExercise,
    };
    setPrefs(nextPrefs);
    prefsRef.current = nextPrefs;
    const saveSeq = timerPrefsSaveSeqRef.current + 1;
    timerPrefsSaveSeqRef.current = saveSeq;
    setSaveState("saving");
    await savePrefs(nextPrefs);
    if (timerPrefsSaveSeqRef.current !== saveSeq) return;
    setSaveState("saved");
  };

  const getTimerForExercise = useCallback(
    (params: {
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
    },
    [prefs?.timerPrefs, prefs?.timerPrefsByExercise, timerByExercise]
  );

  const getRecordedTimerForItem = useCallback(
    (item: {
      id: string;
      exerciseId: string;
      durationSec?: number | null;
      restSec?: number | null;
      sets: string | number | null;
      reps?: string | null;
      loadType: "weighted" | "bodyweight" | "timed" | "assisted";
    }) => {
      const runtime = timerRuntimeByItemId[item.id];
      if (
        runtime &&
        Number.isFinite(runtime.exerciseSeconds) &&
        runtime.exerciseSeconds > 0 &&
        Number.isFinite(runtime.restSeconds) &&
        runtime.restSeconds > 0
      ) {
        return {
          workSeconds: runtime.exerciseSeconds,
          restSeconds: runtime.restSeconds,
        };
      }
      return getTimerForExercise({
        exerciseId: item.exerciseId,
        durationSec: item.durationSec ?? null,
        restSec: item.restSec ?? null,
        sets: item.sets,
        reps: item.reps ?? null,
        loadType: item.loadType,
      });
    },
    [getTimerForExercise, timerRuntimeByItemId]
  );

  const saveSessionCheckIn = async () => {
    if (!summary) return;
    const sanitized = sanitizeSessionFeedback(sessionFeedbackDraft);
    if (!sanitized) return;
    setSessionFeedbackSaveState("saving");
    const updated: SessionRecord = {
      ...summary,
      feedback: sanitized,
      updatedAt: nowIso(),
    };
    setSessionFeedbackDraft(sanitized);
    try {
      const saved = await updateSession(updated);
      setSummary(saved);
      setSessionFeedbackSaveState("saved");
    } catch {
      setSessionFeedbackSaveState("idle");
    }
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

  // Phase 3.2 — apply a feedback contract action for the current prompt.
  const handleContractAction = async (
    action: "sacrifice" | "test" | "modify" | "dismiss"
  ) => {
    const trigger = contractTriggers[contractPromptIndex];
    if (!trigger) return;

    const currentPrefs = await loadPrefs();
    const contractState = currentPrefs.contractStateByExercise ?? {};
    const currentSummary: ExerciseFeedbackSummary = {
      exerciseId: trigger.exerciseId,
      pain: "none",
      difficulty: "normal",
      completionRate: 1,
      ...(contractState[trigger.exerciseId] ?? {}),
    };

    const phase =
      programProgress?.phaseIndex === 2
        ? "growth"
        : programProgress?.phaseIndex === 1
        ? "skill"
        : "activation";
    const sessionCount =
      (programProgress?.workoutsCompletedInPhase ?? 0) +
      (programProgress?.cyclesCompletedInPhase ?? 0) * 3;

    // Auto-sacrifice applies when the exercise is already on probation.
    const result =
      trigger.onProbation && action !== "sacrifice" && action !== "dismiss"
        ? applyAutoSacrifice({
            exerciseId: trigger.exerciseId,
            exercisePattern:
              exerciseById(trigger.exerciseId)?.pattern ?? undefined,
            currentSummary,
            currentLadderState: program?.ladderState ?? undefined,
            phase,
            sessionCount,
          })
        : applyFeedbackContractAction({
            action,
            exerciseId: trigger.exerciseId,
            exercisePattern:
              exerciseById(trigger.exerciseId)?.pattern ?? undefined,
            currentSummary,
            currentLadderState: program?.ladderState ?? undefined,
            phase,
            sessionCount,
            atFloor: trigger.atFloor,
          });

    // Persist the updated contract state.
    const updatedContractState: NonNullable<LogPrefs["contractStateByExercise"]> = {
      ...contractState,
      [trigger.exerciseId]: {
        deferred: result.updatedSummary.deferred,
        probation: result.updatedSummary.probation,
        sacrificedAt: result.updatedSummary.sacrificedAt,
        autoSacrificed: result.updatedSummary.autoSacrificed,
      },
    };
    await savePrefs({ ...currentPrefs, contractStateByExercise: updatedContractState });

    // Advance to next trigger or dismiss the prompt.
    if (contractPromptIndex < contractTriggers.length - 1) {
      setContractPromptIndex((i) => i + 1);
    } else {
      setContractDismissed(true);
    }
  };

  // Phase 3.3 — handle maintain-mode progression prompt response.
  const handleMaintainPrompt = async (answer: "yes" | "no" | "dismiss") => {
    const prompt = maintainPrompts[maintainPromptIndex];
    if (!prompt || !program?.ladderState) return;

    const currentPrefs = await loadPrefs();
    // Update ladder state in saved prefs (non-destructive merge).
    let updatedLadderState = program.ladderState;
    if (answer === "yes") {
      updatedLadderState = applyMaintainProgressionYes(updatedLadderState, prompt.pattern);
    } else {
      updatedLadderState = applyMaintainProgressionNo(updatedLadderState);
    }
    updatedLadderState = markMaintainPromptsShown(updatedLadderState, [prompt.pattern], prompt.phaseIndex);

    // Persist updated ladder state to prefs (re-uses contractStateByExercise slot indirectly
    // via a dedicated field; we persist through the program update flow instead).
    // For now store the progressionOverride in prefs until program regenerates.
    if (answer === "yes") {
      await savePrefs({
        ...currentPrefs,
        contractStateByExercise: {
          ...(currentPrefs.contractStateByExercise ?? {}),
          [`__maintain_override_${prompt.pattern}`]: { deferred: false },
        },
      });
    }

    // Advance to next prompt or dismiss.
    if (maintainPromptIndex < maintainPrompts.length - 1) {
      setMaintainPromptIndex((i) => i + 1);
    } else {
      setMaintainPromptsDismissed(true);
    }
  };

  // Phase 3.3 — block exercise until reset (personal equipment block).
  const handleBlockExercise = async (exerciseId: string, reason: "no_equipment" | "personal_preference") => {
    const phaseIndex = programProgress?.phaseIndex ?? program?.phaseIndex ?? 0;
    const phaseLabel: "activation" | "skill" | "growth" =
      phaseIndex === 2 ? "growth" : phaseIndex === 1 ? "skill" : "activation";
    const sessionCount = programProgress?.completedDayIndices?.length ?? 0;

    const currentPrefs = await loadPrefs();
    const nextPrefs: LogPrefs = {
      ...currentPrefs,
      blockedExerciseIds: {
        ...(currentPrefs.blockedExerciseIds ?? {}),
        [exerciseId]: { reason, blockedAt: { phase: phaseLabel, sessionCount } },
      },
    };
    await savePrefs(nextPrefs);
    setPrefs(nextPrefs);
    setBlockMenuOpen(false);
    setBlockConfirmOpen(false);
    setBlockMenuExerciseId(null);
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
    if (!currentItem) return;
    if (!data) {
      await handleSavePainReportOnly();
      return;
    }
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
      setPainModalMessage("No safe substitute found for this exercise.");
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
    setActiveTrackingField(null);
    setExerciseCompleteFlashVisible(false);
    if (activeIndex < totalItems - 1) {
      setActiveIndex((prev) => prev + 1);
      return;
    }
    window.setTimeout(() => {
      void handleCompleteSession();
    }, 250);
  };

  const handleBack = async () => {
    await persistSessionDraftNow();
    setActiveTrackingField(null);
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
    setSessionFeedbackDraft({ completed: "yes" });
    setSessionFeedbackSaveState("idle");
    setActiveTrackingField(null);
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
    setSelectedPracticeMode("full");
    scrollSessionTop("auto");
  };

  const handleSelectPracticeMode = (
    mode: SessionPracticeOption["mode"]
  ) => {
    setSelectedPracticeMode(mode);
    setActiveIndex(0);
    setCompletedSets({});
    setSelectedSets({});
    setTimerRuntimeByItemId({});
    setActiveTrackingField(null);
    scrollSessionTop("auto");
  };

  const handleCompleteSession = async () => {
    const sessionIdValue = sessionId ?? uuid();
    const startedAt = sessionStartedAt ?? nowIso();
    const completedAt = nowIso();
    const totalSeconds = flatItems.reduce((sum, item) => {
      const timer = getRecordedTimerForItem(item);
      return sum + timer.workSeconds;
    }, 0);
    const totalRestSeconds = flatItems.reduce((sum, item) => {
      const timer = getRecordedTimerForItem(item);
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
      sessionFeedback: null,
      sessionPainLocation: null,
      sessionFeedbackNotes: null,
      feedback: null,
      selectedPracticeMode: effectivePracticeMode,
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
      const timer = getRecordedTimerForItem(item);
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
    setSessionFeedbackDraft({ completed: "yes" });
    setSessionFeedbackSaveState("idle");
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
  const previewRpe = currentRpeValue || "-";
  const previewSetsPlanned = currentSelectedSets;
  const previewSetsCompleted = checks.filter(Boolean).length;
  const currentExerciseMeta = currentExerciseId
    ? exerciseById(currentExerciseId)
    : null;

  // Phase 3: ladder rung progression message for the session screen (read-only).
  // Only shown for main-section exercises that match the current ladder rung.
  const ladderProgressionMessage = useMemo(() => {
    if (!program?.ladderState || !currentExerciseId || !currentItem) return null;
    const section = (currentItem as { section?: string }).section;
    if (section !== "main") return null;
    const ex = exerciseById(currentExerciseId);
    if (!ex?.pattern) return null;
    const rungState = program.ladderState.byPattern[ex.pattern];
    if (!rungState || rungState.exerciseId !== currentExerciseId) return null;
    return getLadderProgressionMessage(
      rungState.exerciseId,
      rungState.cleanSessionsCount,
      rungState.requiredForAdvance
    );
  }, [program?.ladderState, currentExerciseId, currentItem]);
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
  const runningTimerRuntime = Object.values(timerRuntimeByItemId)
    .filter((runtime) => runtime.running)
    .sort(
      (a, b) => (b.updatedAtMs ?? 0) - (a.updatedAtMs ?? 0)
    )[0] ?? null;
  const currentItemRuntime = currentItemId
    ? timerRuntimeByItemId[currentItemId] ?? null
    : null;
  const persistedTimerRuntime =
    currentItemRuntime?.running
      ? currentItemRuntime
      : runningTimerRuntime ?? currentItemRuntime;
  const hasWeightedInput = currentItem?.loadType === "weighted";
  const hasRepsInput = currentItem?.loadType !== "timed";
  const trackingFieldOrder = useMemo<TrackingField[]>(() => {
    const fields: TrackingField[] = [];
    if (hasWeightedInput) fields.push("weight");
    if (hasRepsInput) fields.push("reps");
    fields.push("rpe");
    return fields;
  }, [hasRepsInput, hasWeightedInput]);

  const getTrackingFieldElement = useCallback((field: TrackingField) => {
    if (field === "weight") return weightInputRef.current;
    if (field === "reps") return repsInputRef.current;
    return rpeInputRef.current;
  }, []);

  const focusFirstTrackingField = useCallback(() => {
    for (const field of trackingFieldOrder) {
      const element = getTrackingFieldElement(field);
      if (!element) continue;
      scrollTrackingPanelIntoView();
      queueFocus(element);
      return true;
    }
    return false;
  }, [getTrackingFieldElement, queueFocus, scrollTrackingPanelIntoView, trackingFieldOrder]);

  const focusNextTrackingField = useCallback(
    (field: TrackingField) => {
      const currentIndex = trackingFieldOrder.indexOf(field);
      if (currentIndex < 0) return false;
      for (let index = currentIndex + 1; index < trackingFieldOrder.length; index += 1) {
        const element = getTrackingFieldElement(trackingFieldOrder[index]);
        if (!element) continue;
        scrollTrackingPanelIntoView();
        queueFocus(element);
        return true;
      }
      return false;
    },
    [getTrackingFieldElement, queueFocus, scrollTrackingPanelIntoView, trackingFieldOrder]
  );

  const focusFirstIncompleteSet = useCallback(() => {
    const nextSetIndex = checks.findIndex((isComplete) => !isComplete);
    if (nextSetIndex < 0) return false;
    queueFocus(setCheckboxRefs.current[nextSetIndex]);
    return true;
  }, [checks, queueFocus]);

  const handleTrackingEnter = useCallback(
    (field: TrackingField) =>
      (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key !== "Enter") return;
        event.preventDefault();
        if (focusNextTrackingField(field)) return;
        if (focusFirstIncompleteSet()) return;
        queueFocus(feedbackButtonRefs.current[0] ?? nextButtonRef.current);
      },
    [focusFirstIncompleteSet, focusNextTrackingField, queueFocus]
  );

  const handleTrackingBlur = useCallback(
    (field: TrackingField) =>
      (event: FocusEvent<HTMLInputElement>) => {
        if (!allSetsCompleted) return;
        if (painModalOpen) return;
        if (!(event.currentTarget.value ?? "").trim()) return;
        if (event.relatedTarget instanceof HTMLElement) return;
        if (focusNextTrackingField(field)) return;
        queueFocus(feedbackButtonRefs.current[0] ?? nextButtonRef.current);
      },
    [allSetsCompleted, focusNextTrackingField, painModalOpen, queueFocus]
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
        const nextRuntimeByItemId = {
          ...prev,
          [currentItemId]: nextState,
        };
        if (!nextState.running) {
          return nextRuntimeByItemId;
        }
        for (const [itemId, runtime] of Object.entries(nextRuntimeByItemId)) {
          if (itemId === currentItemId || !runtime.running) continue;
          nextRuntimeByItemId[itemId] = {
            ...runtime,
            running: false,
          };
        }
        return nextRuntimeByItemId;
      });
    },
    [currentItemId]
  );

  useEffect(() => {
    setCheckboxRefs.current = {};
    feedbackButtonRefs.current = [];
  }, [currentItemId]);

  useEffect(() => {
    const itemChanged = focusedItemIdRef.current !== currentItemId;
    const modalJustClosed = wasPainModalOpenRef.current && !painModalOpen;
    wasPainModalOpenRef.current = painModalOpen;
    if (!currentItemId) {
      focusedItemIdRef.current = null;
      return;
    }
    if (painModalOpen) return;
    if (!itemChanged && !modalJustClosed) return;
    focusedItemIdRef.current = currentItemId;

    if (focusFirstIncompleteSet()) return;

    if (allSetsCompleted) {
      if (focusFirstTrackingField()) return;
      queueFocus(feedbackButtonRefs.current[0] ?? nextButtonRef.current);
      return;
    }
    queueFocus(setCheckboxRefs.current[0]);
  }, [
    allSetsCompleted,
    currentItemId,
    focusFirstIncompleteSet,
    focusFirstTrackingField,
    painModalOpen,
    queueFocus,
  ]);

  useEffect(() => {
    if (!currentExerciseId) return;
    const loadLast = async () => {
      const [latest] = await listExerciseLogsByExerciseHistory(currentExerciseId, 1);
      setLastLog(latest);
      if (typeof latest?.rpe === "number") {
        setRpeByExercise((prev) => {
          if (prev[currentExerciseId] !== undefined) return prev;
          return {
            ...prev,
            [currentExerciseId]: String(latest.rpe),
          };
        });
      }
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
      queueMicrotask(() => {
        setExerciseCompleteFlashVisible(false);
      });
      lastExerciseCompletionRef.current = {
        itemId: null,
        allSetsCompleted: false,
      };
      return;
    }
    const previous = lastExerciseCompletionRef.current;
    if (previous.itemId !== currentItemId) {
      queueMicrotask(() => {
        setExerciseCompleteFlashVisible(false);
      });
      lastExerciseCompletionRef.current = {
        itemId: currentItemId,
        allSetsCompleted,
      };
      return;
    }
    if (!previous.allSetsCompleted && allSetsCompleted) {
      queueMicrotask(() => {
        setExerciseCompleteFlashVisible(true);
      });
      if (exerciseCompleteFlashTimerRef.current) {
        window.clearTimeout(exerciseCompleteFlashTimerRef.current);
      }
      exerciseCompleteFlashTimerRef.current = window.setTimeout(() => {
        setExerciseCompleteFlashVisible(false);
      }, 800);
    } else if (previous.allSetsCompleted && !allSetsCompleted) {
      queueMicrotask(() => {
        setExerciseCompleteFlashVisible(false);
      });
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

  if (sessionPlanLoading) {
    return (
      <BackgroundShell>
        <div className="ui-shell flex max-w-3xl flex-col gap-6 py-8 sm:py-12">
          <OnImage>
            <h1 className="text-2xl font-semibold text-white">
              Loading your session
            </h1>
            <p className="text-sm text-slate-200">
              Praxis is finding your saved program and restoring any active session draft.
            </p>
          </OnImage>
        </div>
      </BackgroundShell>
    );
  }

  // Phase 3.3 — maintain-mode phase-transition prompt.
  const activeMaintainPrompt =
    !maintainPromptsDismissed && maintainPrompts.length > 0
      ? maintainPrompts[maintainPromptIndex] ?? null
      : null;

  // Phase 3.2 — pre-session feedback contract prompt.
  // One card per flagged exercise, shown before the session begins.
  const activeContractTrigger =
    !contractDismissed && contractTriggers.length > 0
      ? contractTriggers[contractPromptIndex] ?? null
      : null;

  if (activeMaintainPrompt) {
    const ex = exerciseById(activeMaintainPrompt.exerciseId);
    const exName = ex?.name ?? activeMaintainPrompt.exerciseId;
    const patternLabel = activeMaintainPrompt.pattern.replace(/_/g, " ");
    const remaining = maintainPrompts.length - maintainPromptIndex;

    return (
      <BackgroundShell>
        <div className="ui-shell flex max-w-3xl flex-col gap-6 py-8 sm:py-12">
          <OnImage>
            {remaining > 1 && (
              <p className="text-xs font-medium text-indigo-300 mb-1">
                {maintainPromptIndex + 1} of {maintainPrompts.length}
              </p>
            )}
            <h1 className="text-xl font-semibold text-white">
              Your body has been responding well
            </h1>
            <p className="mt-2 text-sm text-slate-200">
              You&apos;ve been consistent on {patternLabel} ({exName}). Want to try progressing?
            </p>

            <div className="mt-6 flex flex-col gap-3">
              <button
                onClick={() => { void handleMaintainPrompt("yes"); }}
                className="w-full rounded-xl bg-sky-600 px-5 py-3 text-left font-semibold text-white shadow hover:bg-sky-500 active:bg-sky-700"
              >
                <span className="block text-base">Yes, let&apos;s progress</span>
                <span className="block text-xs font-normal text-sky-200 mt-0.5">
                  Try a harder variation for this movement
                </span>
              </button>
              <button
                onClick={() => { void handleMaintainPrompt("no"); }}
                className="w-full rounded-xl bg-slate-700 px-5 py-3 text-left font-semibold text-white shadow hover:bg-slate-600 active:bg-slate-800"
              >
                <span className="block text-base">Keep maintaining</span>
                <span className="block text-xs font-normal text-slate-300 mt-0.5">
                  I&apos;m happy with where I am
                </span>
              </button>
            </div>

            <button
              onClick={() => { void handleMaintainPrompt("dismiss"); }}
              className="mt-4 w-full text-center text-xs text-slate-400 underline-offset-2 hover:text-slate-200 hover:underline"
            >
              Ask me later
            </button>
          </OnImage>
        </div>
      </BackgroundShell>
    );
  }

  if (activeContractTrigger) {
    const ex = exerciseById(activeContractTrigger.exerciseId);
    const exerciseName = ex?.name ?? activeContractTrigger.exerciseId;
    const remaining = contractTriggers.length - contractPromptIndex;
    const reasonCopy: Record<typeof activeContractTrigger.reason, string> = {
      severe_pain: "you reported pain",
      moderate_pain_consecutive: "you reported discomfort two sessions in a row",
      incomplete: "you didn't complete all sets",
      failed_difficulty: "the effort was maximal",
    };
    const prompt = `Last session, ${reasonCopy[activeContractTrigger.reason]} on ${exerciseName}. What would you like to do?`;

    return (
      <BackgroundShell>
        <div className="ui-shell flex max-w-3xl flex-col gap-6 py-8 sm:py-12">
          <OnImage>
            {remaining > 1 && (
              <p className="text-xs font-medium text-indigo-300 mb-1">
                {contractPromptIndex + 1} of {contractTriggers.length}
              </p>
            )}
            <h1 className="text-xl font-semibold text-white">{exerciseName}</h1>
            <p className="mt-2 text-sm text-slate-200">{prompt}</p>

            <div className="mt-6 flex flex-col gap-3">
              {/* Sacrifice */}
              <button
                onClick={() => { void handleContractAction("sacrifice"); }}
                className="w-full rounded-xl bg-rose-600 px-5 py-3 text-left font-semibold text-white shadow hover:bg-rose-500 active:bg-rose-700"
              >
                <span className="block text-base">Sacrifice</span>
                <span className="block text-xs font-normal text-rose-200 mt-0.5">
                  Skip this exercise for now — I&apos;ll retest it later
                </span>
              </button>

              {/* Test */}
              <button
                onClick={() => { void handleContractAction("test"); }}
                className="w-full rounded-xl bg-slate-700 px-5 py-3 text-left font-semibold text-white shadow hover:bg-slate-600 active:bg-slate-800"
              >
                <span className="block text-base">Test</span>
                <span className="block text-xs font-normal text-slate-300 mt-0.5">
                  Keep it in — I&apos;ll try again this session
                </span>
              </button>

              {/* Modify — disabled at d1 floor */}
              <button
                onClick={() => { void handleContractAction("modify"); }}
                disabled={activeContractTrigger.atFloor}
                className={[
                  "w-full rounded-xl px-5 py-3 text-left font-semibold text-white shadow",
                  activeContractTrigger.atFloor
                    ? "bg-slate-800 opacity-40 cursor-not-allowed"
                    : "bg-amber-600 hover:bg-amber-500 active:bg-amber-700",
                ].join(" ")}
              >
                <span className="block text-base">Modify</span>
                <span
                  className={[
                    "block text-xs font-normal mt-0.5",
                    activeContractTrigger.atFloor
                      ? "text-slate-400"
                      : "text-amber-200",
                  ].join(" ")}
                >
                  {activeContractTrigger.atFloor
                    ? "Already at the easiest version"
                    : "Drop to an easier variation"}
                </span>
              </button>
            </div>

            {/* Dismiss link — treated as Test */}
            <button
              onClick={() => { void handleContractAction("dismiss"); }}
              className="mt-4 w-full text-center text-xs text-slate-400 underline-offset-2 hover:text-slate-200 hover:underline"
            >
              Skip for now
            </button>
          </OnImage>
        </div>
      </BackgroundShell>
    );
  }

  if (!currentItem) {
    const recoveryHref = data ? "/results" : "/questionnaire";
    const recoveryLabel = data ? "Back to results" : "Build profile";
    const recoveryTitle = program
      ? "No session items available"
      : data
      ? "No saved Praxis program found"
      : "We need your movement profile first";
    const recoveryCopy =
      sessionPlanIssue ??
      (program
        ? "Return to results and start a planned day to continue."
        : data
        ? "Return to Results to rebuild your active Praxis plan before starting a session."
        : "Complete your Praxis profile to build a plan and start a session.");

    return (
      <BackgroundShell>
        <div className="ui-shell flex max-w-3xl flex-col gap-6 py-8 sm:py-12">
          <OnImage>
            <h1 className="text-2xl font-semibold text-white">
              {recoveryTitle}
            </h1>
            <p className="text-sm text-slate-200">
              {recoveryCopy}
            </p>
            <Link href={recoveryHref}>
              <Button variant={data ? "secondary" : "primary"}>
                {recoveryLabel}
              </Button>
            </Link>
          </OnImage>
        </div>
      </BackgroundShell>
    );
  }

  if (sessionComplete && summary && summaryStats) {
    const adaptationPreview = formatSessionAdaptationPreviewFromFeedback(
      summary.feedback ?? null
    );
    const nextSessionRecommendation =
      formatNextSessionRecommendationFromSession(summary);

    return (
      <BackgroundShell>
        <div className="ui-shell flex max-w-3xl flex-col gap-6 py-8 sm:py-12">
          <OnImage className="space-y-3">
            <h1 className="text-3xl font-semibold text-white">Session complete</h1>
            <p className="text-sm text-slate-200">
              Excellent work. Your session is logged for future coaching context.
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
          <SessionFeedbackCheckIn
            value={sessionFeedbackDraft}
            savedFeedback={summary.feedback ?? null}
            saveState={sessionFeedbackSaveState}
            onChange={(next) => {
              setSessionFeedbackDraft(next);
              setSessionFeedbackSaveState("idle");
            }}
            onSave={saveSessionCheckIn}
          />
          {adaptationPreview ? (
            <div
              className="ui-card p-4 text-sm font-semibold text-slate-700"
              data-testid="adaptation-preview"
            >
              {adaptationPreview}
              <span className="mt-1 block text-xs font-medium text-slate-500">
                Preview only; no workout has been changed.
              </span>
            </div>
          ) : null}
          {nextSessionRecommendation ? (
            <div
              className="ui-card p-4 text-sm font-semibold text-slate-700"
              data-testid="next-session-recommendation"
            >
              {nextSessionRecommendation}
              <span className="mt-1 block text-xs font-medium text-slate-500">
                Recommendation only; your plan has not been changed.
              </span>
            </div>
          ) : null}
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
      <div className="ui-shell flex max-w-5xl flex-col gap-4 py-6 pb-[10rem] sm:py-8 md:pb-8">
        <span
          className="sr-only"
          data-testid="current-exercise-id"
          data-exercise-id={currentItem.exerciseId}
        />

        <OnImage className="border-b border-white/10 py-3">
          <p className="text-xs font-semibold uppercase text-slate-300">
            Guided session
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-white">{dayTitle}</h1>
          <p className="mt-1 text-sm text-slate-300">{phaseLabel}</p>
        </OnImage>

        {practiceOptions.length ? (
          <section
            className="ui-card rounded-lg border-slate-500/25 bg-slate-950/58 p-4 sm:p-5"
            data-testid="session-practice-options"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">Today&apos;s options</p>
                <p className="mt-1 text-xs text-slate-300">
                  Adjust just today&apos;s session — your plan stays the same.
                </p>
              </div>
              {selectedPracticeOption ? (
                <span
                  className="rounded-lg border border-slate-500/30 bg-slate-950/55 px-2 py-1 text-[11px] font-semibold text-slate-300"
                  data-testid="selected-practice-mode"
                >
                  {selectedPracticeOption.label}
                </span>
              ) : null}
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {practiceOptions.map((option) => {
                const selected = option.mode === effectivePracticeMode;
                return (
                  <button
                    key={option.mode}
                    type="button"
                    data-testid={`practice-option-${option.mode}`}
                    onClick={() => handleSelectPracticeMode(option.mode)}
                    className={`rounded-lg border px-3 py-3 text-left transition ${
                      selected
                        ? "border-sky-300 bg-sky-400/15 text-white shadow-[0_14px_28px_rgba(14,165,233,0.12)]"
                        : "border-slate-500/25 bg-slate-950/35 text-slate-200 hover:border-sky-300/45"
                    }`}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold">{option.label}</span>
                      {option.isRecommended ? (
                        <span className="rounded-full border border-emerald-300/35 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-100">
                          Suggested
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-slate-300">
                      {option.description}
                    </span>
                  </button>
                );
              })}
            </div>
            {selectedPracticeOption ? (
              <p className="mt-3 text-xs font-semibold text-slate-300">
                {formatPracticeModeSessionNote(selectedPracticeOption)}
              </p>
            ) : null}
          </section>
        ) : null}

        {/* Phase 6c, Commit 6 — the fixed top-right control cluster
            (AppMenuClient) only moves to the top at md+; this sticky header
            must clear it there too, not just at initial scroll position 0.
            .ui-shell's own padding-top reserves that space for content at
            the top of the page, but a sticky descendant re-anchors to the
            viewport on scroll and ignores an ancestor's padding, so it
            needs its own matching offset. */}
        <div className="sticky top-2 z-30 space-y-2 md:top-16">
          <SessionProgressHeader
            phaseName={phaseLabel}
            dayPositionLabel={dayPositionLabel}
            dayTitle={dayTitle}
            exercisePositionLabel={exercisePositionLabel}
            progressPercent={sessionProgressPercent}
          />

          <div
            className={`ui-card relative overflow-hidden rounded-lg border px-4 py-3 transition-[border-color,background-color,box-shadow,color] duration-500 ${tipTone}`}
          >
            <div className="pointer-events-none absolute inset-y-0 left-0 w-28 bg-current opacity-[0.08] blur-2xl" />
            <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-current shadow-[0_0_18px_currentColor]" />
                  <p className="text-[11px] font-semibold uppercase text-slate-300">
                    Focus
                  </p>
                </div>
                <p
                  key={activeTip}
                  className="mt-1 text-base font-semibold leading-snug text-white sm:text-lg"
                  style={{ animation: "slideUpIn 260ms ease-out both" }}
                >
                  {activeTip}
                </p>
              </div>
              <div className="flex items-center gap-1.5" aria-label="Cycling guidance">
                {tips.map((tip, index) => (
                  <span
                    key={tip}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      index === tipIndex
                        ? "w-5 bg-current opacity-95"
                        : "w-1.5 bg-slate-400/45"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div ref={exerciseCardRef}>
          {/* Phase 3.3 — exercise block menu affordance */}
          <div className="mb-1 flex justify-end">
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setBlockMenuExerciseId(currentItem.exerciseId);
                  setBlockMenuOpen((o) => !o);
                  setBlockConfirmOpen(false);
                }}
                className="rounded p-1 text-slate-500 hover:bg-slate-700/50 hover:text-slate-300"
                aria-label="Exercise options"
              >
                ···
              </button>
              {blockMenuOpen && blockMenuExerciseId === currentItem.exerciseId && (
                <div className="absolute right-0 top-8 z-20 min-w-44 rounded-lg border border-slate-600/40 bg-slate-900 shadow-lg">
                  {!blockConfirmOpen ? (
                    <button
                      type="button"
                      onClick={() => setBlockConfirmOpen(true)}
                      className="block w-full px-4 py-3 text-left text-sm text-slate-200 hover:bg-slate-700/50"
                    >
                      Remove from my program
                    </button>
                  ) : (
                    <div className="px-4 py-3">
                      <p className="mb-3 text-xs font-semibold text-slate-300">
                        Remove {currentItem.name}?
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          // "Just today" — session-level swap, no persistence.
                          if (currentItem && data) {
                            const candidateId = findPainSwapAlternativeExerciseId({
                              questionnaire: data,
                              currentItem: {
                                id: currentItem.id,
                                dayTitle: currentItem.dayTitle,
                                section: currentItem.section,
                                exerciseId: currentItem.exerciseId,
                                originalExerciseId: currentItem.originalExerciseId,
                              },
                              usedExerciseIds: new Set(flatItems.map((i) => i.exerciseId)),
                            });
                            if (candidateId && candidateId !== currentItem.exerciseId) {
                              setSessionSwapByItemId((prev) => ({
                                ...prev,
                                [currentItem.id]: candidateId,
                              }));
                            }
                          }
                          setBlockMenuOpen(false);
                          setBlockConfirmOpen(false);
                        }}
                        className="mb-2 block w-full rounded-lg border border-slate-600/40 bg-slate-800 px-3 py-2 text-left text-xs text-slate-200 hover:bg-slate-700"
                      >
                        <span className="block font-semibold">Just today</span>
                        <span className="block text-slate-400">Swap out this session only</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => { void handleBlockExercise(currentItem.exerciseId, "personal_preference"); }}
                        className="block w-full rounded-lg border border-red-500/30 bg-red-950/30 px-3 py-2 text-left text-xs text-red-300 hover:bg-red-950/50"
                      >
                        <span className="block font-semibold">Block until I reset</span>
                        <span className="block text-red-400/70">Never appear in my program</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

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
          <SessionLadderPill message={ladderProgressionMessage} />
        </div>

        <div className="ui-card rounded-lg border-slate-500/25 bg-slate-950/58 p-4 sm:p-5">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] lg:items-stretch">
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

            <div className="flex h-full min-h-[220px] flex-col justify-center rounded-lg border border-sky-300/25 bg-sky-400/10 px-4 py-5 text-sm text-slate-100 sm:px-5 sm:py-6">
              <div>
                <p className="font-semibold text-white">Cues</p>
                <ul className="mt-4 list-disc space-y-2 pl-5 leading-6">
                  {currentItem.cues.map((cue) => (
                    <li key={cue}>{cue}</li>
                  ))}
                </ul>
                <p className="mt-5 border-t border-sky-200/15 pt-4 text-xs leading-5 text-slate-300">
                  Common mistake: {currentItem.mistake}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div
          ref={trackingPanelRef}
          className="ui-card rounded-lg border-sky-300/25 bg-slate-950/58 p-5 sm:p-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <p className="ui-title">Log this set</p>
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
                className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-[11px] font-semibold text-rose-700 shadow-sm"
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
                className="ui-saving-indicator rounded-lg border border-sky-300/35 bg-sky-400/10 px-2 py-0.5 text-[10px] font-semibold text-sky-100"
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
          <div className="mt-3 rounded-lg border border-slate-600/35 bg-slate-950/45 px-3 py-3">
            <p className="text-[11px] font-semibold uppercase text-slate-300">
              About to record
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-200">
              <p>
                <span className="font-semibold text-white">Load:</span>{" "}
                {currentItem.loadType === "weighted"
                  ? `${previewWeight}${previewUnit ? ` ${previewUnit}` : ""}`
                  : currentItem.loadType}
              </p>
              <p>
                <span className="font-semibold text-white">Reps/set:</span>{" "}
                {previewReps}
              </p>
              <p data-testid="about-to-record-rpe">
                <span className="font-semibold text-white">RPE:</span> {previewRpe}
              </p>
              <p>
                <span className="font-semibold text-white">Sets:</span>{" "}
                {previewSetsCompleted}/{previewSetsPlanned}
              </p>
              <p>
                <span className="font-semibold text-white">Timer:</span>{" "}
                {currentTimer.workSeconds}s work • {currentTimer.restSeconds}s rest
              </p>
              <p className="col-span-2">
                <span className="font-semibold text-white">Feedback:</span>{" "}
                {currentFeedback?.rating ?? "not set"}
                {currentFeedback?.rating === "pain" && currentFeedback?.painLocation
                  ? ` (${currentFeedback.painLocation})`
                  : ""}
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-3">
            {maxSets > minSets ? (
              <div className="flex items-center gap-2 text-xs text-sky-700">
                <span className="font-semibold text-sky-900">Sets</span>
                <button
                  type="button"
                  onClick={() =>
                    applySelectedSets(
                      currentItem.id,
                      currentItem.exerciseId,
                      Math.max(minSets, currentSelectedSets - 1)
                    )
                  }
                  className="rounded-full border border-sky-300 bg-white px-3 py-1 font-semibold text-sky-700 transition-colors hover:bg-sky-50"
                >
                  -
                </button>
                <span className="w-6 text-center font-semibold text-sky-900">
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
                  className="rounded-full border border-sky-300 bg-white px-3 py-1 font-semibold text-sky-700 transition-colors hover:bg-sky-50"
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
                  onFocus={() => {
                    setActiveTrackingField("weight");
                    scrollTrackingPanelIntoView();
                  }}
                  onKeyDown={handleTrackingEnter("weight")}
                  onBlur={(event) => {
                    setActiveTrackingField((current) =>
                      current === "weight" ? null : current
                    );
                    handleTrackingBlur("weight")(event);
                  }}
                  enterKeyHint={hasRepsInput ? "next" : "done"}
                  className={`ui-input w-28 ${
                    activeTrackingField === "weight"
                      ? "border-sky-400 ring-2 ring-sky-400/60"
                      : ""
                  }`}
                />
                <div className="flex rounded-full border border-indigo-200 bg-white/80 p-1 text-xs">
                  {(["lb", "kg"] as const).map((unit) => (
                    <button
                      key={unit}
                      type="button"
                      onClick={() => applyUnit(currentItem.exerciseId, unit)}
                      className={`rounded-full px-3 py-1 font-semibold ${
                        currentUnitValue === unit
                          ? "bg-indigo-600 text-white"
                          : "text-indigo-700 hover:bg-indigo-50"
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
                  onFocus={() => {
                    setActiveTrackingField("reps");
                    scrollTrackingPanelIntoView();
                  }}
                  onKeyDown={handleTrackingEnter("reps")}
                  onBlur={(event) => {
                    setActiveTrackingField((current) =>
                      current === "reps" ? null : current
                    );
                    handleTrackingBlur("reps")(event);
                  }}
                  enterKeyHint="next"
                  className={`ui-input w-32 text-xs ${
                    activeTrackingField === "reps"
                      ? "border-sky-400 ring-2 ring-sky-400/60"
                      : ""
                  }`}
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
                onFocus={() => {
                  setActiveTrackingField("rpe");
                  scrollTrackingPanelIntoView();
                }}
                onKeyDown={handleTrackingEnter("rpe")}
                onBlur={(event) => {
                  setActiveTrackingField((current) =>
                    current === "rpe" ? null : current
                  );
                  handleTrackingBlur("rpe")(event);
                }}
                enterKeyHint="done"
                className={`ui-input w-24 ${
                  activeTrackingField === "rpe"
                    ? "border-sky-400 ring-2 ring-sky-400/60"
                    : ""
                }`}
                placeholder="RPE"
              />
            </div>
            <p className="text-[11px] text-slate-600" aria-live="polite">
              {activeTrackingField
                ? `Active input: ${
                    activeTrackingField === "rpe"
                      ? "RPE"
                      : activeTrackingField === "reps"
                      ? "Reps"
                      : "Weight"
                  }.`
                : null}{" "}
              Values may be prefilled from history. Press Enter/Go on each field to confirm or edit.
            </p>
          </div>
        </div>

        {allSetsCompleted ? (
          <div className="ui-card rounded-lg border-amber-300/25 bg-amber-400/10 p-5 sm:p-6">
            <p className="text-sm font-semibold text-white">How did it feel?</p>
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
                  onClick={() => {
                    void saveFeedback({
                      ...feedback,
                      [currentFeedbackKey]: {
                        rating: option.value,
                        painLocation: currentFeedback?.painLocation ?? null,
                        notes: currentFeedback?.notes ?? "",
                      },
                    });
                    queueFocus(nextButtonRef.current);
                  }}
                  className={`rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${
                    currentFeedback?.rating === option.value
                      ? option.value === "easy"
                        ? "border-emerald-600 bg-emerald-600 text-white"
                        : option.value === "moderate"
                        ? "border-sky-600 bg-sky-600 text-white"
                        : "border-amber-600 bg-amber-500 text-slate-950"
                      : option.value === "easy"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : option.value === "moderate"
                      ? "border-sky-200 bg-sky-50 text-sky-800"
                      : "border-amber-200 bg-amber-50 text-amber-800"
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
            className="ui-card rounded-lg border-rose-300/30 bg-rose-400/10 p-5 sm:p-6"
            data-testid="pain-report-modal"
          >
            <p className="text-sm font-semibold text-white">
              Pain check-in for {currentItem.name}
            </p>
            <p className="mt-1 text-xs text-slate-300">
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
        </OnImage>
      </div>
      {/* Pinned above the viewport bottom on phone (Phase 6c, Commit 4) so the
          primary "advance/log this set" action never scrolls out of reach.
          Offset (not flush bottom-0) clears the fixed Menu pill that
          AppMenuClient floats bottom-right on mobile (see globals.css
          .ui-shell mobile padding-bottom comment). Static and inline again
          at md+, where that cluster moves to the top and there's room in
          flow. */}
      <div className="fixed inset-x-0 bottom-16 z-30 mx-auto w-full max-w-5xl px-4 md:static md:bottom-auto md:px-0">
        <button
          type="button"
          data-testid="session-next"
          ref={nextButtonRef}
          onClick={() => {
            void handleNext();
          }}
          className={`${primaryActionBtn} h-14 w-full min-w-0 rounded-lg px-6 text-base font-semibold shadow-lg shadow-black/30 md:shadow-none`}
        >
          {activeIndex === totalItems - 1 ? "Finish session \u2192" : "Next \u2192"}
        </button>
      </div>
      <OnboardingInfoButton onboardingKey="session" />
    </BackgroundShell>
  );
}
