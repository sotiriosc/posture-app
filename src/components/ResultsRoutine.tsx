"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { QuestionnaireData } from "./QuestionnaireForm";
import { exerciseById } from "@/lib/exercises";
import type { Routine } from "@/lib/routine";
import { generateRoutine } from "@/lib/routine";
import {
  generateNextCycleProgram,
  generateNextPhaseProgram,
  generateWeeklyProgram,
  PROGRAM_TEMPLATE_VERSION,
} from "@/lib/program";
import {
  normalizeEquipmentSelection,
  normalizeEquipmentSelectionValues,
  type Equipment,
} from "@/lib/equipment";
import { usePhotoContext } from "@/components/PhotoContext";
import {
  analyzeImagePose,
  computeMetrics,
  generateObservations,
  type PoseAnalysis,
  type PoseMetrics,
} from "@/lib/poseAnalyzer";
import {
  buildAssessmentReport,
  type AssessmentReport,
} from "@/lib/assessmentEngine";
import OnImage from "@/components/OnImage";
import Button from "@/components/ui/Button";
import { loadAppState, saveAppState } from "@/lib/appState";
import type { Exercise } from "@/lib/exercises";
import type {
  ExerciseFeedback,
  ExerciseLog,
  Program,
  ProgramProgress,
  ProgramRoutineItem,
  SessionRecord,
} from "@/lib/types";
import {
  getProgramProgress,
  getLatestProgram,
  getProgram,
  listSessionsByProgramId,
  listExerciseLogsByExercise,
  listExerciseLogsBySessionIds,
  loadPrefs,
  saveProgram,
  saveProgramProgress,
  uuid,
} from "@/lib/logStore";
import type { SubscriptionPlan } from "@/lib/authTypes";
import { loadTrainingSnapshot, pushTrainingPatch } from "@/lib/trainingSyncClient";
import { getProgressionRecommendation } from "@/lib/progression";
import {
  buildNextWeekPlan,
  getPhaseMetaByIndex,
  getPhaseProfile,
} from "@/lib/phases";
import { clearDraftsByProgramId } from "@/lib/sessionDraftStore";

const STORAGE_KEY = "posture_questionnaire";

const defaultRoutine: Routine = {
  summary:
    "A balanced routine focused on mobility, postural strength, and daily posture reminders.",
  priorities: [],
  observed: [],
  sections: [],
};

const loadImageFromFile = (file: File) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Unable to read image file."));
    };
    img.src = url;
  });

const normalizeDaysPerWeek = (value: unknown): 3 | 4 | 5 => {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string"
      ? Number(value)
      : NaN;
  return parsed === 4 || parsed === 5 ? parsed : 3;
};

const hasValidWeekStructure = (program: Program) => {
  const targetDays = program.daysPerWeek;
  if (!Array.isArray(program.week) || program.week.length !== targetDays) {
    return false;
  }
  const dayIndexes = new Set(program.week.map((day) => day.dayIndex));
  if (dayIndexes.size !== targetDays) return false;
  for (let index = 0; index < targetDays; index += 1) {
    if (!dayIndexes.has(index)) return false;
  }
  return true;
};

const isProgramCompatibleWithQuestionnaire = (
  candidate: Program | null,
  questionnaire: QuestionnaireData
) => {
  if (!candidate) return false;
  return (
    candidate.templateVersion === PROGRAM_TEMPLATE_VERSION &&
    candidate.daysPerWeek === questionnaire.daysPerWeek &&
    candidate.goalTrack === questionnaire.goals &&
    hasValidWeekStructure(candidate)
  );
};

export default function ResultsRoutine() {
  const router = useRouter();
  const [data, setData] = useState<QuestionnaireData | null>(null);
  const [program, setProgram] = useState<Program | null>(null);
  const [selectedDay, setSelectedDay] = useState(0);
  const [showDebug, setShowDebug] = useState(false);
  const [progress, setProgress] = useState<ProgramProgress | null>(null);
  const [programSessions, setProgramSessions] = useState<SessionRecord[]>([]);
  const [latestLogsByExercise, setLatestLogsByExercise] = useState<
    Record<string, ExerciseLog | null>
  >({});
  const [substitutionByExercise, setSubstitutionByExercise] = useState<
    Record<string, string>
  >({});
  const [isReady, setIsReady] = useState(false);
  const [advanceOpen, setAdvanceOpen] = useState(false);
  const [advanceConfirm, setAdvanceConfirm] = useState(false);
  const [advanceMessage, setAdvanceMessage] = useState<string | null>(null);
  const [lastTwoLogs, setLastTwoLogs] = useState<ExerciseLog[]>([]);
  const [authEnabled, setAuthEnabled] = useState(false);
  const [plan, setPlan] = useState<SubscriptionPlan>("free");
  const { photos } = usePhotoContext();
  const [poseState, setPoseState] = useState<{
    loading: boolean;
    error: string | null;
    report: AssessmentReport | null;
  }>({ loading: false, error: null, report: null });

  useEffect(() => {
    const loadBootstrap = async () => {
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
      setIsReady(true);
    };
    const loadPrefsData = async () => {
      const prefs = await loadPrefs();
      if (prefs.substitutionByExercise) {
        setSubstitutionByExercise(prefs.substitutionByExercise);
      }
    };
    loadBootstrap().finally(() => loadPrefsData());
  }, []);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const response = await fetch("/api/auth/session", {
          cache: "no-store",
          credentials: "include",
        });
        const payload = (await response.json()) as {
          enabled?: boolean;
          authenticated?: boolean;
          user?: { plan?: SubscriptionPlan } | null;
        };
        setAuthEnabled(Boolean(payload.enabled));
        setPlan(payload.user?.plan === "pro" ? "pro" : "free");
      } catch {
        setAuthEnabled(false);
        setPlan("free");
      }
    };
    loadSession();
  }, []);

  useEffect(() => {
    const loadLogs = async () => {
      if (!program) return;
      const dayIndex = authEnabled && plan !== "pro" ? 0 : selectedDay;
      const day = program.week[dayIndex];
      if (!day) return;
      const ids = Array.from(new Set(day.routine.map((item) => item.exerciseId)));
      const entries = await Promise.all(
        ids.map(async (id) => {
          const effectiveId = substitutionByExercise[id] ?? id;
          const logs = await listExerciseLogsByExercise(effectiveId, 1);
          return [id, logs[0] ?? null] as const;
        })
      );
      setLatestLogsByExercise(Object.fromEntries(entries));
    };
    loadLogs();
  }, [program, selectedDay, substitutionByExercise, authEnabled, plan]);

  const routine = useMemo(() => {
    if (!data) return defaultRoutine;
    return generateRoutine(data);
  }, [data]);

  const dayPreviewRecommendations = useMemo(() => {
    if (!program) return [];
    const dayIndex = authEnabled && plan !== "pro" ? 0 : selectedDay;
    const day = program.week[dayIndex];
    if (!day) return [];
    return day.routine
      .map((item) => {
        const effectiveId = substitutionByExercise[item.exerciseId] ?? item.exerciseId;
        const exercise = exerciseById(effectiveId);
        if (!exercise) return null;
        const latestLog = latestLogsByExercise[item.exerciseId] ?? null;
        if (!latestLog) return null;
        const feedback: ExerciseFeedback | null = latestLog.felt
          ? {
              rating: latestLog.felt,
              painLocation: latestLog.painLocation ?? null,
              notes: latestLog.feedbackNotes ?? null,
            }
          : null;
        const rec = getProgressionRecommendation({
          exercise,
          logs: [latestLog],
          feedback,
          prescription: {
            sets: item.sets,
            reps: item.reps ?? exercise.durationOrReps,
            durationSec: item.durationSec ?? null,
            restSec: item.restSec ?? null,
          },
        });
        if (!rec) return null;
        return { item, exercise, rec };
      })
      .filter(Boolean) as Array<{
      item: ProgramRoutineItem;
      exercise: Exercise;
      rec: ReturnType<typeof getProgressionRecommendation>;
    }>;
  }, [program, selectedDay, latestLogsByExercise, authEnabled, plan]);

  const optimizerReasonsByExercise = useMemo(
    () => program?.phaseOptimizerReport?.exerciseReasons ?? {},
    [program]
  );

  const selectedDayMastery = useMemo(() => {
    if (!program) return [];
    const dayIndex = authEnabled && plan !== "pro" ? 0 : selectedDay;
    const day = program.week[dayIndex];
    if (!day) return [];
    return day.routine.slice(0, 4).map((item) => {
      const exercise = exerciseById(item.exerciseId);
      const cue = (exercise?.cues?.[0] ?? "Control each rep").replace(/\.$/, "");
      const checkpoint = (() => {
        if (item.section === "main") return "last 2 reps stay clean";
        if (item.section === "accessory") return "tempo stays steady";
        if (item.section === "warmup") return "breathing stays calm";
        return "range stays smooth";
      })();
      return `Day ${day.dayIndex + 1} ${day.title}: ${exercise?.name ?? "Exercise"} - ${cue}; check: ${checkpoint}.`;
    });
  }, [program, selectedDay, authEnabled, plan]);
  const masteryItems = useMemo(() => {
    if (selectedDayMastery.length) return selectedDayMastery.slice(0, 4);
    return (
      program?.sessionAdaptation?.masteryNext ??
      program?.phaseObjective?.successMarkers ??
      []
    ).slice(0, 4);
  }, [selectedDayMastery, program]);

  const equipmentContext = useMemo(() => {
    if (!data) {
      return { available: new Set<Equipment>(), hasGym: false };
    }
    return normalizeEquipmentSelection(data.equipment);
  }, [data]);

  const buildWhyPicked = (exercise: Exercise) => {
    const patterns = exercise.movementPattern;
    const slotLabel = (() => {
      if (patterns.includes("mobility")) return "Mobility";
      if (patterns.includes("pull")) return "Main pull";
      if (patterns.includes("push")) return "Main push";
      if (patterns.includes("squat")) return "Squat pattern";
      if (patterns.includes("hinge")) return "Hinge pattern";
      if (patterns.includes("core")) return "Core stability";
      return "Support work";
    })();

    const goalMatch = [
      "posture",
      data?.goals === "Reduce pain" ? "pain reduction" : "strength",
    ].filter(Boolean) as string[];

    const trains = exercise.muscleGroups;

    const purpose = (() => {
      if (patterns.includes("mobility")) {
        return "Improves range and reduces stiffness so daily movement feels smoother.";
      }
      if (patterns.includes("pull")) {
        return "Builds upper-back strength to support tall, stable posture.";
      }
      if (patterns.includes("push")) {
        return "Builds pushing strength and shoulder control without compensation.";
      }
      if (patterns.includes("squat")) {
        return "Reinforces leg strength and alignment for better lower-body support.";
      }
      if (patterns.includes("hinge")) {
        return "Reinforces hip control and posterior-chain strength.";
      }
      if (patterns.includes("core")) {
        return "Trains bracing and stability to protect spine alignment.";
      }
      return "Supports balanced posture and coordination.";
    })();

    const setup = (() => {
      if (exercise.equipment.includes("bands")) {
        return "Anchor band at chest height, step back to tension, stay tall.";
      }
      if (patterns.includes("mobility")) {
        return "Slow reps with full breaths, stay relaxed.";
      }
      return "Control each rep, steady tempo.";
    })();

    const progressions = (() => {
      if (patterns.includes("mobility")) return ["Add pause at end range"];
      if (patterns.includes("pull")) return ["Add band tension or pause"];
      if (patterns.includes("push")) return ["Slow tempo or add reps"];
      if (patterns.includes("squat")) return ["Add tempo or split stance"];
      if (patterns.includes("hinge")) return ["Single-leg or add reach"];
      if (patterns.includes("core")) return ["Longer holds or slower reps"];
      return [];
    })();

    const regressions = (() => {
      if (patterns.includes("push")) return ["Incline variation"];
      if (patterns.includes("squat")) return ["Shallower depth"];
      if (patterns.includes("hinge")) return ["Hands to thighs"];
      return [];
    })();

    return {
      slot: slotLabel,
      goalMatch,
      trains,
      purpose,
      setup,
      progressions: progressions.length ? progressions : undefined,
      regressions: regressions.length ? regressions : undefined,
    };
  };

  const formatRecommendation = (rec: ReturnType<typeof getProgressionRecommendation>) => {
    if (!rec) return "";
    const { recommendedNext } = rec;
    const parts: string[] = [];
    if (recommendedNext.weight) parts.push(`${recommendedNext.weight} lb`);
    if (recommendedNext.reps) parts.push(`${recommendedNext.reps} reps`);
    if (recommendedNext.sets) parts.push(`${recommendedNext.sets} sets`);
    if (recommendedNext.durationSeconds) {
      parts.push(`${recommendedNext.durationSeconds} sec`);
    }
    if (recommendedNext.tempo) parts.push(`tempo ${recommendedNext.tempo}`);
    if (!parts.length) return "Keep targets consistent";
    return parts.join(" • ");
  };

  const nextPhaseButtonLabel = `Advance to Phase ${(program?.phaseIndex ?? 1) + 1}`;
  const nextCycleButtonLabel = `Start Cycle ${(program?.cycleIndex ?? 1) + 1}`;

  const previewSummary = () => {
    const currentPhaseIndex = program?.phaseIndex ?? 1;
    const nextPhaseIndex = currentPhaseIndex + 1;
    const nextProfile = getPhaseProfile(nextPhaseIndex);
    return `Next phase focuses on ${nextProfile.label.toLowerCase()}. ${nextProfile.description}`;
  };

  const handleAdvanceProgram = async (mode: "phase" | "cycle") => {
    if (!program || !data) return;
    setAdvanceMessage(null);
    const state = loadAppState();
    const nextProgramVersion =
      typeof state?.programVersion === "number" ? state.programVersion + 1 : 1;
    const result =
      mode === "phase"
        ? generateNextPhaseProgram({
            currentProgram: program,
            questionnaire: data,
            painFlag: Boolean(advanceStatus.painFlag),
            complianceRate: advanceStatus.complianceRate ?? 0,
            fatigueFlag: Boolean(advanceStatus.fatigueFlag),
            completedSessionsCount: completedSessions.length,
            completedWeeksCount: completedWeeks,
            recentLogs: lastTwoLogs,
            nextProgramId: uuid(),
          })
        : generateNextCycleProgram({
            currentProgram: program,
            questionnaire: data,
            painFlag: Boolean(advanceStatus.painFlag),
            complianceRate: advanceStatus.complianceRate ?? 0,
            fatigueFlag: Boolean(advanceStatus.fatigueFlag),
            completedSessionsCount: completedSessions.length,
            completedWeeksCount: completedWeeks,
            recentLogs: lastTwoLogs,
            nextProgramId: uuid(),
          });

    if (result.status === "advanced") {
      await saveProgram(result.program);
      setProgram(result.program);
      setSelectedDay(0);
      await clearDraftsByProgramId(program.id);
      saveAppState({
        programId: result.program.id,
        activeProgramId: result.program.id,
        selectedDay: 0,
        activePhaseIndex: result.program.phaseIndex ?? 1,
        activeCycleIndex: result.program.cycleIndex ?? 1,
        programVersion: nextProgramVersion,
        activeSessionId: undefined,
        lastRoute: "/results",
      });
      setAdvanceOpen(false);
      setAdvanceConfirm(false);
      return;
    }

    setAdvanceMessage(result.message);
  };

  useEffect(() => {
    if (!data) return;
    const loadProgram = async () => {
      const state = loadAppState();
      if (state?.activeProgramId) {
        const active = await getProgram(state.activeProgramId);
        if (isProgramCompatibleWithQuestionnaire(active, data)) {
          setProgram(active);
          return;
        }
      }
      const latest = await getLatestProgram();
      if (isProgramCompatibleWithQuestionnaire(latest, data)) {
        setProgram(latest);
        return;
      }
      const newProgram = generateWeeklyProgram(data, uuid());
      await saveProgram(newProgram);
      setProgram(newProgram);
    };
    loadProgram();
  }, [data]);

  useEffect(() => {
    if (!program || !data) return;
    if (isProgramCompatibleWithQuestionnaire(program, data)) return;

    const reconcileProgram = async () => {
      const reconciled = generateWeeklyProgram(data, uuid(), {
        phaseIndex: program.phaseIndex ?? 1,
        weekIndex: program.weekIndex ?? 1,
        cycleIndex: program.cycleIndex ?? 1,
        totalWeekIndex: program.totalWeekIndex ?? program.weekIndex ?? 1,
      });
      await saveProgram(reconciled);
      setProgram(reconciled);
      setSelectedDay(0);
      saveAppState({
        programId: reconciled.id,
        activeProgramId: reconciled.id,
        selectedDay: 0,
        activePhaseIndex: reconciled.phaseIndex ?? 1,
        activeCycleIndex: reconciled.cycleIndex ?? 1,
      });
    };

    reconcileProgram();
  }, [program, data]);

  useEffect(() => {
    if (!program) return;
    const state = loadAppState();
    if (state?.programId === program.id && typeof state.selectedDay === "number") {
      const maxIndex = Math.max(0, program.week.length - 1);
      const next = Math.min(Math.max(0, state.selectedDay), maxIndex);
      setSelectedDay(next);
    }
  }, [program]);

  useEffect(() => {
    if (!program) return;
    if (!authEnabled || plan === "pro") return;
    if (selectedDay > 0) {
      setSelectedDay(0);
    }
  }, [program, authEnabled, plan, selectedDay]);

  useEffect(() => {
    if (!program) return;
    const stateDay =
      authEnabled && plan !== "pro"
        ? 0
        : Math.min(Math.max(0, selectedDay), Math.max(0, program.week.length - 1));
    const state = loadAppState();
    const nextVersion =
      typeof state?.programVersion === "number"
        ? state.programVersion
        : 0;
    saveAppState({
      programId: program.id,
      activeProgramId: program.id,
      selectedDay: stateDay,
      activePhaseIndex: program.phaseIndex ?? 1,
      activeCycleIndex: program.cycleIndex ?? 1,
      programVersion: nextVersion,
      lastRoute: "/results",
    });
  }, [program, selectedDay, authEnabled, plan]);

  const completedByDay = useMemo(() => {
    const map = new Map<number, SessionRecord[]>();
    programSessions.forEach((session) => {
      if (!session.completedAt) return;
      const match = session.notes?.match(/dayIndex:(\d+)/);
      if (!match) return;
      const dayIndex = Number(match[1]);
      const list = map.get(dayIndex) ?? [];
      list.push(session);
      map.set(dayIndex, list);
    });
    return map;
  }, [programSessions]);

  const nextDayIndex = useMemo(() => {
    if (!program) return 0;
    if (progress && Number.isFinite(progress.nextDayIndex)) {
      return Math.min(
        Math.max(0, progress.nextDayIndex),
        Math.max(0, program.week.length - 1)
      );
    }
    const completedDays = Array.from(completedByDay.keys()).sort((a, b) => a - b);
    if (!completedDays.length) return 0;
    const last = completedDays[completedDays.length - 1];
    return last + 1 < program.daysPerWeek ? last + 1 : 0;
  }, [program, progress, completedByDay]);

  const completedCount = useMemo(() => {
    return Array.from(completedByDay.keys()).length;
  }, [completedByDay]);

  const activeDaysPerWeek = program?.daysPerWeek ?? data?.daysPerWeek ?? 3;
  const isFreePlan = authEnabled && plan !== "pro";
  const isDayLocked = (dayIndex: number) => isFreePlan && dayIndex > 0;
  const effectiveSelectedDay = isDayLocked(selectedDay) ? 0 : selectedDay;
  const effectiveNextDayIndex = isDayLocked(nextDayIndex) ? 0 : nextDayIndex;

  const completedSessions = useMemo(() => {
    return programSessions
      .filter((session) => session.completedAt)
      .sort(
        (a, b) =>
          (b.completedAt ?? "").localeCompare(a.completedAt ?? "")
      );
  }, [programSessions]);

  const completedWeeks = useMemo(() => {
    if (!program || !completedSessions.length) return 0;
    return Math.floor(completedSessions.length / program.daysPerWeek);
  }, [program, completedSessions]);

  useEffect(() => {
    const loadLastTwo = async () => {
      if (!completedSessions.length) {
        setLastTwoLogs([]);
        return;
      }
      const lastTwo = completedSessions.slice(0, 2);
      const logs = await listExerciseLogsBySessionIds(
        lastTwo.map((session) => session.id)
      );
      setLastTwoLogs(logs);
    };
    loadLastTwo();
  }, [completedSessions]);

  const advanceStatus = useMemo(() => {
    if (!program) {
      const fallback = getPhaseMetaByIndex(1);
      return {
        canAdvance: false,
        reason: "Program not ready yet.",
        phaseLabel: fallback.phaseName,
        cycleIndex: 1,
        isPhaseBoundary: false,
        completedSessionsCount: 0,
        requiredSessionsCount: 0,
        completedWeeksCount: 0,
        requiredWeeksCount: 0,
      };
    }

    if (!completedSessions.length) {
      const fallback = getPhaseMetaByIndex(program.phaseIndex ?? 1);
      return {
        canAdvance: false,
        reason: "Complete at least 1 session to unlock progression.",
        phaseLabel: program.phaseName ?? fallback.phaseName,
        cycleIndex: program.cycleIndex ?? 1,
        isPhaseBoundary: false,
        completedSessionsCount: 0,
        requiredSessionsCount: program.daysPerWeek,
        completedWeeksCount: 0,
        requiredWeeksCount: 1,
      };
    }

    const now = Date.parse(new Date().toISOString());
    const recentSessions = completedSessions.filter((session) => {
      if (!session.completedAt) return false;
      const timestamp = Date.parse(session.completedAt);
      if (Number.isNaN(timestamp)) return false;
      return now - timestamp <= 7 * 24 * 60 * 60 * 1000;
    });
    const complianceRate = Math.min(
      1,
      recentSessions.length / program.daysPerWeek
    );

    const painFlag =
      lastTwoLogs.some((log) => log.felt === "pain") ||
      completedSessions.slice(0, 2).some((session) => session.sessionFeedback === "pain");

    const hardCount = lastTwoLogs.filter((log) => log.felt === "hard").length;
    const fatigueFlag =
      lastTwoLogs.length > 0 && hardCount / lastTwoLogs.length >= 0.5;

    if (painFlag) {
      const fallback = getPhaseMetaByIndex(program.phaseIndex ?? 1);
      return {
        canAdvance: false,
        reason: "Address pain first before advancing.",
        phaseLabel: program.phaseName ?? fallback.phaseName,
        complianceRate,
        painFlag,
        fatigueFlag,
        cycleIndex: program.cycleIndex ?? 1,
        isPhaseBoundary: false,
        completedSessionsCount: completedSessions.length,
        requiredSessionsCount: completedSessions.length,
        completedWeeksCount: completedWeeks,
        requiredWeeksCount: 0,
      };
    }

    if (complianceRate < 0.85) {
      const fallback = getPhaseMetaByIndex(program.phaseIndex ?? 1);
      return {
        canAdvance: false,
        reason: "Hit at least 85% weekly compliance to advance.",
        phaseLabel: program.phaseName ?? fallback.phaseName,
        complianceRate,
        painFlag,
        fatigueFlag,
        cycleIndex: program.cycleIndex ?? 1,
        isPhaseBoundary: false,
        completedSessionsCount: completedSessions.length,
        requiredSessionsCount: Math.max(program.daysPerWeek, completedSessions.length),
        completedWeeksCount: completedWeeks,
        requiredWeeksCount: 1,
      };
    }

    const minWeeksForPhaseAdvance = 2;
    const canAdvancePhase = completedWeeks >= minWeeksForPhaseAdvance;
    const requiredWeeksForCurrentCycle = 1;
    const requiredSessionsForCurrentCycle = program.daysPerWeek;
    if (completedSessions.length < requiredSessionsForCurrentCycle) {
      return {
        canAdvance: false,
        reason: `Complete ${requiredSessionsForCurrentCycle} sessions before starting the next cycle.`,
        phaseLabel:
          program.phaseName ?? getPhaseMetaByIndex(program.phaseIndex ?? 1).phaseName,
        complianceRate,
        painFlag,
        fatigueFlag,
        cycleIndex: program.cycleIndex ?? 1,
        isPhaseBoundary: false,
        completedSessionsCount: completedSessions.length,
        requiredSessionsCount: requiredSessionsForCurrentCycle,
        completedWeeksCount: completedWeeks,
        requiredWeeksCount: requiredWeeksForCurrentCycle,
      };
    }

    if ((program.cycleIndex ?? 1) % 4 === 0 && !canAdvancePhase) {
      return {
        canAdvance: false,
        reason: `Complete at least ${minWeeksForPhaseAdvance} full weeks before advancing phase.`,
        phaseLabel:
          program.phaseName ?? getPhaseMetaByIndex(program.phaseIndex ?? 1).phaseName,
        complianceRate,
        painFlag,
        fatigueFlag,
        cycleIndex: program.cycleIndex ?? 1,
        isPhaseBoundary: true,
        completedSessionsCount: completedSessions.length,
        requiredSessionsCount: requiredSessionsForCurrentCycle,
        completedWeeksCount: completedWeeks,
        requiredWeeksCount: minWeeksForPhaseAdvance,
      };
    }

    return {
      canAdvance: true,
      reason: "You’re ready to progress to the next phase/week.",
      phaseLabel:
        program.phaseName ?? getPhaseMetaByIndex(program.phaseIndex ?? 1).phaseName,
      complianceRate,
      painFlag,
      fatigueFlag,
      cycleIndex: program.cycleIndex ?? 1,
      isPhaseBoundary: (program.cycleIndex ?? 1) % 4 === 0 && canAdvancePhase,
      completedSessionsCount: completedSessions.length,
      requiredSessionsCount: requiredSessionsForCurrentCycle,
      completedWeeksCount: completedWeeks,
      requiredWeeksCount: (program.cycleIndex ?? 1) % 4 === 0 ? minWeeksForPhaseAdvance : requiredWeeksForCurrentCycle,
    };
  }, [program, completedSessions, completedWeeks, lastTwoLogs]);


  useEffect(() => {
    if (!program) return;
    getProgramProgress(program.id).then((stored) => {
      if (stored) {
        setProgress(stored);
        setSelectedDay(stored.nextDayIndex ?? 0);
      } else {
        const initial: ProgramProgress = {
          programId: program.id,
          lastCompletedDayIndex: null,
          nextDayIndex: 0,
          completedDayIndices: [],
          updatedAt: new Date().toISOString(),
        };
        saveProgramProgress(initial);
        setProgress(initial);
        setSelectedDay(0);
      }
    });
  }, [program]);

  useEffect(() => {
    if (!program) return;
    const loadSessions = () => {
      listSessionsByProgramId(program.id).then(setProgramSessions);
    };
    loadSessions();
    window.addEventListener("focus", loadSessions);
    window.addEventListener("visibilitychange", loadSessions);
    return () => {
      window.removeEventListener("focus", loadSessions);
      window.removeEventListener("visibilitychange", loadSessions);
    };
  }, [program]);

  useEffect(() => {
    if (!program) return;
    const completedIndices = Array.from(completedByDay.keys());
    const updated: ProgramProgress = {
      programId: program.id,
      lastCompletedDayIndex: completedIndices.length
        ? completedIndices.sort((a, b) => a - b)[completedIndices.length - 1]
        : null,
      nextDayIndex,
      completedDayIndices: completedIndices,
      updatedAt: new Date().toISOString(),
    };
    saveProgramProgress(updated);
    setProgress(updated);
  }, [program, completedByDay, nextDayIndex]);

  useEffect(() => {
    if (!program) return;
    const updatePhasePlan = async () => {
      const completedSessions = programSessions.filter(
        (session) => session.completedAt
      );
      const computedWeekIndex =
        Math.floor(completedSessions.length / program.daysPerWeek) + 1;
      const weekIndex = Math.max(program.weekIndex ?? 1, computedWeekIndex);
      const phaseIndex = program.phaseIndex ?? 1;
      const phaseMeta = getPhaseMetaByIndex(phaseIndex);
      const phaseName = program.phaseName ?? phaseMeta.phaseName;
      const phaseProfile = getPhaseProfile(phaseIndex);
      const phase = {
        name: phaseName,
        phaseIndex,
        cycleIndex: program.cycleIndex ?? 1,
        weekIndex,
        weekCount: weekIndex,
        goal: phaseProfile.description,
      };

      const now = Date.now();
      const recentSessions = completedSessions.filter((session) => {
        if (!session.completedAt) return false;
        const timestamp = Date.parse(session.completedAt);
        if (Number.isNaN(timestamp)) return false;
        return now - timestamp <= 7 * 24 * 60 * 60 * 1000;
      });

      const recentLogs = await listExerciseLogsBySessionIds(
        recentSessions.map((session) => session.id)
      );

      const feedbackRatings = [
        ...recentSessions
          .map((session) => session.sessionFeedback)
          .filter(Boolean),
        ...recentLogs.map((log) => log.felt).filter(Boolean),
      ];

      const painFlag = feedbackRatings.includes("pain");
      const hardCount = feedbackRatings.filter((rating) => rating === "hard")
        .length;
      const fatigueFlag =
        feedbackRatings.length >= 3 &&
        hardCount / feedbackRatings.length >= 0.5;
      const complianceRate = Math.min(
        1,
        recentSessions.length / program.daysPerWeek
      );

      const nextWeekPlan = buildNextWeekPlan({
        complianceRate,
        painFlag,
        fatigueFlag,
        phaseName,
      });

      const needsUpdate =
        program.weekIndex !== weekIndex ||
        program.phaseName !== phaseName ||
        program.phase?.weekIndex !== phase.weekIndex ||
        program.phase?.name !== phase.name ||
        program.nextWeekPlan?.summary !== nextWeekPlan.summary;

      if (needsUpdate) {
        const updatedProgram = {
          ...program,
          phaseIndex,
          phaseName,
          weekIndex,
          phase,
          nextWeekPlan,
          updatedAt: new Date().toISOString(),
        };
        await saveProgram(updatedProgram);
        setProgram(updatedProgram);
      }
    };

    updatePhasePlan();
  }, [program, programSessions, data]);

  useEffect(() => {
    const runPoseAnalysis = async () => {
      if (!data) return;
      const entries = Object.entries(photos).filter(
        ([, value]) => value !== null
      ) as [string, File][];

      if (!entries.length) {
        const fallbackReport = buildAssessmentReport({ questionnaire: data });
        setPoseState({
          loading: false,
          error: null,
          report: fallbackReport,
        });
        void pushTrainingPatch({ assessment: fallbackReport as unknown as Record<string, unknown> });
        return;
      }

      setPoseState({ loading: true, error: null, report: null });

      try {
        const metricsByView: Record<string, PoseMetrics> = {};
        const observations: string[] = [];
        const priorities: string[] = [];
        const confidenceScores: number[] = [];

        for (const [view, file] of entries) {
          const image = await loadImageFromFile(file);
          const keypoints = await analyzeImagePose(image);
          if (!keypoints) continue;
          const metrics = computeMetrics(keypoints);
          metricsByView[view] = metrics;
          const analysis = generateObservations(metrics);
          observations.push(...analysis.observations.map((item) => `${view}: ${item}`));
          priorities.push(...analysis.priorities);
          confidenceScores.push(analysis.confidenceScore);
        }

        const combined: PoseAnalysis = {
          metrics: {
            torsoHeight: null,
            avgKeypointScore: null,
            shoulderHeightDelta: metricsByView.front?.shoulderHeightDelta ?? null,
            hipHeightDelta: metricsByView.front?.hipHeightDelta ?? null,
            kneeAlignmentDelta: metricsByView.front?.kneeAlignmentDelta ?? null,
            headForwardOffset: metricsByView.side?.headForwardOffset ?? null,
            torsoLeanAngle: metricsByView.side?.torsoLeanAngle ?? null,
            hipToShoulderAlignment:
              metricsByView.side?.hipToShoulderAlignment ?? null,
            scapularSymmetry: metricsByView.back?.scapularSymmetry ?? null,
            hipShift: metricsByView.back?.hipShift ?? null,
          },
          observations: observations.length
            ? observations
            : ["We couldn’t reliably detect posture landmarks in these photos."],
          priorities: Array.from(new Set(priorities)).slice(0, 4),
          confidenceScore: confidenceScores.length
            ? confidenceScores.reduce((sum, value) => sum + value, 0) /
              confidenceScores.length
            : 0.4,
        };

        const report = buildAssessmentReport({
          questionnaire: data,
          poseAnalysis: combined,
        });
        setPoseState({ loading: false, error: null, report });
        void pushTrainingPatch({ assessment: report as unknown as Record<string, unknown> });
      } catch (error) {
        const fallbackReport = buildAssessmentReport({ questionnaire: data });
        setPoseState({
          loading: false,
          error:
            error instanceof Error
              ? error.message
              : "Pose detection failed. Try clearer photos.",
          report: fallbackReport,
        });
        void pushTrainingPatch({ assessment: fallbackReport as unknown as Record<string, unknown> });
      }
    };

    runPoseAnalysis();
  }, [photos, data]);


  if (!isReady) {
    return (
      <div className="ui-card p-6">
        <p className="text-sm text-slate-600">Loading your program...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-6 text-center">
        <p className="text-sm text-slate-600">
          We need your questionnaire answers to build a routine.
        </p>
        <Link
          href="/questionnaire"
          className="mt-4 inline-flex rounded-full bg-slate-900 px-6 py-2 text-sm font-semibold text-white"
        >
          Go to questionnaire
        </Link>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="ui-card p-6">
        <p className="text-sm text-slate-600">Loading your weekly program...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="ui-card p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Summary
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">
          Weekly posture reset
        </h2>
        <p className="mt-2 text-sm text-slate-600">{routine.summary}</p>
        <div className="mt-4 space-y-2 text-sm text-slate-700">
          {routine.priorities.map((item) => (
            <div
              key={item}
              className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2"
            >
              <span className="h-2 w-2 rounded-full bg-slate-900" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="ui-card p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            This Week Objective
          </p>
          <h3 className="mt-2 text-lg font-semibold text-slate-900">
            {program.phaseObjective?.title ?? "Movement Quality Week"}
          </h3>
          <p className="mt-2 text-xs font-medium text-slate-600">
            {program.phaseObjective?.weekIntent ?? "Build clean movement quality."}
          </p>
          <p className="mt-2 text-sm text-slate-700">
            {program.phaseObjective?.objective ??
              "Move with clean mechanics and consistent effort across all planned days."}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            {program.phaseObjective?.phaseFocus ??
              `Phase ${program.phaseIndex ?? 1} • Cycle ${program.cycleIndex ?? 1}`}
          </p>
          {program.phaseObjective?.primaryPatterns?.length ? (
            <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-600">
              {program.phaseObjective.primaryPatterns.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1"
                >
                  {item}
                </span>
              ))}
            </div>
          ) : null}
          {program.phaseObjective?.metrics ? (
            <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-600">
              <span className="rounded-full border border-slate-200 px-2.5 py-1">
                Readiness {Math.round(program.phaseObjective.metrics.readiness * 100)}%
              </span>
              <span className="rounded-full border border-slate-200 px-2.5 py-1">
                Consistency {Math.round(program.phaseObjective.metrics.consistency * 100)}%
              </span>
              <span className="rounded-full border border-slate-200 px-2.5 py-1">
                Pain risk {Math.round(program.phaseObjective.metrics.painRisk * 100)}%
              </span>
            </div>
          ) : null}
          <div className="mt-3 space-y-1 text-xs text-slate-600">
            {(program.phaseObjective?.successMarkers ?? []).slice(0, 3).map((item) => (
              <p key={item}>• {item}</p>
            ))}
          </div>
          {program.phaseObjective?.guardrail ? (
            <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-900">
              Guardrail: {program.phaseObjective.guardrail}
            </div>
          ) : null}
        </div>

        <div className="ui-card p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Why This Changed
            </p>
            {program.phaseOptimizerReport ? (
              <span className="rounded-full border border-slate-200 px-2 py-0.5 text-[11px] text-slate-600">
                {program.phaseOptimizerReport.changedSlots}/
                {program.phaseOptimizerReport.totalSlots} slots changed
              </span>
            ) : null}
          </div>
          <p className="mt-2 text-sm text-slate-700">
            {program.sessionAdaptation?.summary ??
              program.phaseOptimizerReport?.summary ??
              "Progression was tuned using your recent training response."}
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-600">
            {(program.sessionAdaptation?.dataSignals ?? []).slice(0, 4).map((item) => (
              <span
                key={item}
                className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1"
              >
                {item}
              </span>
            ))}
          </div>
          <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-600">
            <p>
              <span className="font-semibold text-slate-700">Readiness</span>:
              how prepared your body is to progress this week.
            </p>
            <p>
              <span className="font-semibold text-slate-700">Consistency</span>:
              how regularly you completed planned sessions.
            </p>
            <p>
              <span className="font-semibold text-slate-700">Recovery</span>:
              how well you bounced back from recent sessions.
            </p>
            <p>
              <span className="font-semibold text-slate-700">Pain risk</span>:
              how likely current loading could flare symptoms.
            </p>
          </div>
          <div className="mt-3 space-y-1 text-xs text-slate-600">
            {(program.sessionAdaptation?.reasons ?? []).slice(0, 3).map((item) => (
              <p key={item}>• {item}</p>
            ))}
          </div>
          <div className="mt-3 space-y-1 text-[11px] text-slate-500">
            {(program.sessionAdaptation?.appliedChanges ?? []).slice(0, 3).map((item) => (
              <p key={item}>- {item}</p>
            ))}
          </div>
        </div>

        <div className="ui-card p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            What To Master Next
          </p>
          <h3 className="mt-2 text-lg font-semibold text-slate-900">
            Priority execution cues
          </h3>
          <p className="mt-1 text-xs font-medium text-slate-700">
            Viewing Day {effectiveSelectedDay + 1}: {program.week[effectiveSelectedDay]?.title ?? "Current day"}
          </p>
          <p className="mt-2 text-[11px] text-slate-500">
            Click any day in Program Dashboard below and this list updates for that day.
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            This is the exact day this card is coaching right now.
          </p>
          <Link
            href={`/session?programId=${program.id}&dayIndex=${effectiveSelectedDay}`}
            className="mt-3 inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
          >
            Start Day {effectiveSelectedDay + 1} now
          </Link>
          <div className="mt-3 space-y-2 text-xs text-slate-700">
            {masteryItems.map((item) => (
              <div key={item} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <p className="font-medium text-slate-800">{item}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 space-y-1 text-[11px] text-slate-600">
            {(program.sessionAdaptation?.masteryChecks ??
              program.phaseObjective?.coachingPrompts ??
              []).slice(0, 3).map((item) => (
              <p key={item}>• {item}</p>
            ))}
          </div>
        </div>
      </div>

      <div className="ui-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Posture scan
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">
              What we observed
            </h2>
          </div>
          {poseState.report ? (
            <div className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600">
              Confidence:{" "}
              {poseState.report.observations.some(
                (obs) => obs.confidence === "high"
              )
                ? "High"
                : poseState.report.observations.some(
                    (obs) => obs.confidence === "medium"
                  )
                ? "Medium"
                : "Low"}
            </div>
          ) : null}
        </div>

        {poseState.loading ? (
          <p className="mt-4 text-sm text-slate-600">
            Analyzing your posture photos…
          </p>
        ) : poseState.error ? (
          <p className="mt-4 text-sm text-rose-600">{poseState.error}</p>
        ) : poseState.report ? (
          <>
            <div className="mt-4 space-y-3 text-sm text-slate-700">
              {poseState.report.observations.map((item, index) => (
                <div
                  key={`${item.id}-${index}`}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-slate-900">{item.title}</p>
                    <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                      {item.confidence}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600">
                    {item.description}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Evidence: {item.evidence.join(", ")}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Likely drivers: {item.likelyDrivers.join(", ")}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Why it matters: {item.riskIfIgnored}
                  </p>
                  {item.recommendedInterventions.length ? (
                    <p className="mt-1 text-[11px] font-medium text-slate-600">
                      Next action: {item.recommendedInterventions[0].suggestion}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                What we’ll focus on
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                {Array.from(
                  new Set([
                    ...poseState.report.priorities.map((id) => {
                      const match = poseState.report?.observations.find(
                        (obs) => obs.id === id
                      );
                      return match?.title ?? id;
                    }),
                    ...routine.priorities,
                  ])
                )
                  .slice(0, 5)
                  .map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1"
                    >
                      {item}
                    </span>
                  ))}
              </div>
            </div>
            <p className="mt-4 text-xs text-slate-500">
              {poseState.report.summary}
            </p>
          </>
        ) : (
          <p className="mt-4 text-sm text-slate-600">
            Upload posture photos to see observations here.
          </p>
        )}

        {poseState.report?.disclaimers?.length ? (
          <p className="mt-6 text-xs text-slate-500">
            {poseState.report.disclaimers.join(" ")}
          </p>
        ) : (
          <p className="mt-6 text-xs text-slate-500">
            This scan estimates posture patterns — not a medical diagnosis.
          </p>
        )}
      </div>

      <div className="ui-card p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Observed patterns
        </p>
        <div className="mt-3 space-y-2 text-sm text-slate-700">
          {routine.observed.map((item) => (
            <div key={item} className="rounded-2xl bg-slate-50 px-3 py-2">
              {item}
            </div>
          ))}
        </div>
      </div>

      <div className="ui-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Your weekly program
            </p>
            <h3 className="mt-2 text-lg font-semibold text-slate-900">
              {activeDaysPerWeek}-day split • Estimated 45–60 minutes
            </h3>
            {program.phaseIndex ? (
              <p className="mt-2 text-sm text-slate-600">
                Phase {program.phaseIndex} • Cycle {program.cycleIndex ?? 1}
              </p>
            ) : null}
            {program.nextWeekPlan ? (
              <p className="mt-2 text-sm text-slate-600">
                {program.nextWeekPlan.summary}
              </p>
            ) : null}
          </div>
          <Link
            href={`/session?programId=${program?.id ?? ""}&dayIndex=${effectiveNextDayIndex}`}
            className="rounded-full bg-slate-900 px-5 py-2 text-xs font-semibold text-white"
          >
            {completedCount >= activeDaysPerWeek
              ? "Continue Program"
              : completedCount
              ? "Continue Program"
              : "Continue Program"}
          </Link>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-600">
          <span className="rounded-full border border-slate-200 px-3 py-1">
            Day {effectiveNextDayIndex + 1} of {activeDaysPerWeek}
          </span>
          <span className="rounded-full border border-slate-200 px-3 py-1">
            You are on Week {completedWeeks + 1}, Day {effectiveNextDayIndex + 1}
          </span>
          <span
            data-testid="completed-count"
            className="rounded-full border border-slate-200 px-3 py-1"
          >
            {completedCount} completed
          </span>
        </div>
      </div>

      {program ? (
        <div className="space-y-6">
          <div className="ui-card p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Program Dashboard
                </p>
                <h3 className="mt-2 text-lg font-semibold text-slate-900">
                  Weekly calendar
                </h3>
              </div>
              <span className="text-xs text-slate-500">
                Tap a day to view details
              </span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {program.week.map((day) => {
                const isCompleted = completedByDay.has(day.dayIndex);
                const isNext = day.dayIndex === nextDayIndex;
                const isSelected = day.dayIndex === effectiveSelectedDay;
                const isLocked = isDayLocked(day.dayIndex);
                return (
                  <div
                    key={day.dayIndex}
                    className={`relative overflow-hidden rounded-2xl border bg-slate-50 px-4 py-3 text-left transition ${
                      isSelected
                        ? "border-slate-900 ring-2 ring-slate-900/20"
                        : "border-slate-200"
                    } ${isLocked ? "opacity-85" : ""}`}
                  >
                    <button
                      type="button"
                      aria-label={`Select Day ${day.dayIndex + 1}`}
                      aria-pressed={isSelected}
                      onClick={() => {
                        if (isLocked) return;
                        setSelectedDay(day.dayIndex);
                      }}
                      className="absolute inset-0 rounded-2xl disabled:cursor-not-allowed"
                      disabled={isLocked}
                    />
                    <div className="relative z-10 pointer-events-none">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                            Day {day.dayIndex + 1}
                          </p>
                          <p className="mt-1 text-sm font-semibold text-slate-900">
                            {day.title}
                          </p>
                        </div>
                        {isCompleted ? (
                          <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                            ✓
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                        <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-slate-500">
                          {isNext ? "Next" : isCompleted ? "Completed" : "Pending"}
                        </span>
                        <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-slate-500">
                          {day.routine.length} exercises
                        </span>
                      </div>
                    </div>
                    <div className="absolute right-2 top-2 z-20 flex gap-2">
                      {!isLocked ? (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            router.push(
                              `/program/${program.id}/day/${day.dayIndex}`
                            );
                          }}
                          aria-label={`View Day ${day.dayIndex + 1} history`}
                          title="History"
                          className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-700 shadow-sm hover:bg-slate-100"
                        >
                          History
                        </button>
                      ) : null}
                    </div>
                    {isLocked ? (
                      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center backdrop-blur-[2px]">
                        <span className="rounded-full border border-slate-300 bg-white/85 px-3 py-1 text-[10px] font-semibold text-slate-700">
                          Pro required
                        </span>
                      </div>
                    ) : null}
                    {isLocked ? (
                      <div className="pointer-events-none absolute inset-0 z-[9] bg-gradient-to-r from-slate-100/20 via-slate-100/35 to-slate-100/20" />
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>

          <OnImage>
            <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-sm flex h-[640px] flex-col">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-200">
                    Day Preview
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-white">
                    Day {effectiveSelectedDay + 1}: {program.week[effectiveSelectedDay].title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-200">
                    Focus: {program.week[effectiveSelectedDay].focusTags.join(", ")}
                  </p>
                </div>
                <Link
                  href={`/session?programId=${program.id}&dayIndex=${effectiveSelectedDay}`}
                >
                  <Button variant="secondary" data-testid="start-selected-day">
                    Start Selected Day
                  </Button>
                </Link>
              </div>
              <div className="mt-2">
                <button
                  type="button"
                  onClick={() =>
                    router.push(`/program/${program.id}/day/${effectiveSelectedDay}`)
                  }
                  className="text-xs font-semibold text-slate-200 underline-offset-4 hover:underline"
                >
                  View Day {effectiveSelectedDay + 1} history
                </button>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-200">
                <label className="flex items-center gap-2 rounded-full border border-white/20 px-3 py-1">
                  <input
                    type="checkbox"
                    checked={showDebug}
                    onChange={() => setShowDebug((prev) => !prev)}
                    className="h-3 w-3 accent-white"
                  />
                  Why this exercise was picked
                </label>
                <span className="text-[11px] text-slate-200">
                  Tap to see quick rationale
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {program.week.map((day) => (
                  <button
                    key={day.dayIndex}
                    type="button"
                    onClick={() => {
                      if (isDayLocked(day.dayIndex)) return;
                      setSelectedDay(day.dayIndex);
                    }}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                      effectiveSelectedDay === day.dayIndex
                        ? "border-white/40 bg-white/20 text-white"
                        : "border-white/20 text-slate-200"
                    } ${isDayLocked(day.dayIndex) ? "opacity-60 blur-[1px] cursor-not-allowed" : ""}`}
                    disabled={isDayLocked(day.dayIndex)}
                  >
                    Day {day.dayIndex + 1}{isDayLocked(day.dayIndex) ? " (Pro)" : ""}
                  </button>
                ))}
              </div>
              {isFreePlan ? (
                <p className="mt-2 text-[11px] text-slate-200">
                  Free plan preview is limited to Day 1. Upgrade to unlock Day 2–{program.daysPerWeek}.
                </p>
              ) : null}

              <div className="mt-4 flex-1 overflow-y-auto pr-1">
                <div className="space-y-2 text-xs text-slate-200">
                  {program.week[effectiveSelectedDay].routine.map((item, index) => {
                    const exercise = exerciseById(item.exerciseId);
                    if (!exercise) return null;
                    const reason =
                      optimizerReasonsByExercise[item.exerciseId]?.[0] ??
                      buildWhyPicked(exercise).purpose;
                    return (
                      <div
                        key={`${item.exerciseId}-${index}-${effectiveSelectedDay}`}
                        className="rounded-2xl border border-white/20 bg-white/10 px-3 py-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-white">{exercise.name}</p>
                          {item.section ? (
                            <span className="rounded-full border border-white/20 px-2 py-0.5 text-[10px] uppercase tracking-wide text-white/80">
                              {item.section}
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-1 text-[11px] text-slate-200">{reason}</p>
                      </div>
                    );
                  })}
                </div>
                {dayPreviewRecommendations.length ? (
                  <div className="mt-4 space-y-2 text-xs text-slate-200">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-300">
                      Next-time recommendations
                    </p>
                    {dayPreviewRecommendations.map(({ exercise, rec }, index) => (
                      <div
                        key={`${exercise.id}-next-${index}`}
                        className="rounded-2xl border border-white/15 bg-white/10 px-3 py-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold text-white">
                            {exercise.name}
                          </p>
                          {rec?.safetyFlag ? (
                            <span className="rounded-full border border-amber-200/60 bg-amber-50/10 px-2 py-0.5 text-[10px] font-semibold text-amber-200">
                              Safety
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-1 text-[11px] text-white/90">
                          Next time: {formatRecommendation(rec)}
                        </p>
                        <p className="text-[11px] text-white/70">
                          {rec?.reason}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : null}
                {showDebug ? (
                  <div className="mt-4 space-y-2 text-xs text-slate-200">
                    {program.week[effectiveSelectedDay].routine.map((item, index) => {
                      const exercise = exerciseById(item.exerciseId);
                      if (!exercise) return null;
                      const why = buildWhyPicked(exercise);
                      return (
                        <div
                          key={`debug-${item.exerciseId}-${index}-${effectiveSelectedDay}`}
                          className="rounded-2xl border border-white/20 bg-white/10 px-3 py-2"
                        >
                          <p className="font-semibold text-white">
                            {exercise.name}
                          </p>
                          <ul className="mt-2 space-y-1 text-[11px] text-slate-200">
                            <li>Slot: {why.slot}</li>
                            <li>Goal match: {why.goalMatch.join(", ")}</li>
                            <li>Trains: {why.trains.join(", ")}</li>
                            <li>Purpose: {why.purpose}</li>
                            <li>Setup: {why.setup}</li>
                            {why.progressions?.length ? (
                              <li>
                                Progression: {why.progressions.join(" / ")}
                              </li>
                            ) : null}
                            {why.regressions?.length ? (
                              <li>
                                Regression: {why.regressions.join(" / ")}
                              </li>
                            ) : null}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
                <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-200">
                  <span className="rounded-full border border-white/20 px-3 py-1">
                    {completedByDay.has(effectiveSelectedDay) ? "Completed" : "Pending"}
                  </span>
                  <span className="rounded-full border border-white/20 px-3 py-1">
                    Sessions: {completedByDay.get(effectiveSelectedDay)?.length ?? 0}
                  </span>
                </div>

                <div className="mt-6 border-t border-white/10 pt-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-semibold text-white">
                        Coach&apos;s Corner
                      </h4>
                      <p className="text-xs text-slate-200">
                        Tap an exercise to see form cues + demo video
                      </p>
                    </div>
                    <a
                      href="#coachs-corner-list"
                      className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/15"
                    >
                      Get form help
                    </a>
                  </div>

                  <div
                    id="coachs-corner-list"
                    className="mt-4 flex flex-wrap gap-2 text-xs"
                  >
                    {program.week[effectiveSelectedDay].routine.map((item, index) => {
                      const exercise = exerciseById(item.exerciseId);
                      if (!exercise) return null;
                      return (
                        <Link
                          key={`${item.exerciseId}-coach-${index}`}
                          href={`/exercise/${exercise.id}`}
                          className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-white transition hover:bg-white/15"
                        >
                          <span>{exercise.name}</span>
                          <span className="rounded-full border border-white/20 px-2 py-0.5 text-[10px] text-white/90">
                            Video
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </OnImage>

        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {routine.sections.map((section) => (
            <div
              key={section.title}
              className="ui-card p-6"
            >
              <h3 className="text-lg font-semibold text-slate-900">
                {section.title}
              </h3>
              <div className="mt-4 space-y-4">
                {section.items.map((item) => {
                  const exercise = exerciseById(item.exerciseId);
                  return (
                    <div
                      key={item.exerciseId}
                      className="rounded-2xl bg-slate-50 p-4"
                    >
                      <p className="text-sm font-semibold text-slate-900">
                        {exercise ? (
                          <Link
                            href={`/exercise/${exercise.id}`}
                            className="hover:underline"
                          >
                            {exercise.name}
                          </Link>
                        ) : (
                          "Exercise"
                        )}
                      </p>
                      <p className="text-xs text-slate-500">
                        {item.sets} sets • {item.reps} reps
                      </p>
                      <div className="mt-3 text-xs text-slate-600">
                        <p className="font-semibold text-slate-700">Cues</p>
                        <ul className="list-disc pl-4">
                          {(exercise?.cues ?? []).map((cue) => (
                            <li key={cue}>{cue}</li>
                          ))}
                        </ul>
                        <p className="mt-2 text-slate-500">
                          Common mistake:{" "}
                          {exercise?.mistakes?.[0] ?? "Keep form controlled"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <OnImage>
        <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-white">
                Progressive Plan
              </h3>
              <p className="mt-2 text-sm text-slate-200">
                {program?.phaseName ?? "Phase 1"} is focused on{" "}
                {getPhaseProfile(program?.phaseIndex ?? 1).label.toLowerCase()}
                . Each phase adjusts volume, intensity, and variations in a
                safe, progressive way.
              </p>
              <ul className="mt-3 space-y-1 text-xs text-slate-200">
                <li>
                  Advance when you complete 3–5 sessions or a full week.
                </li>
                <li>No pain flags in the last 2 sessions.</li>
                <li>Most exercises feel Easy or Moderate.</li>
              </ul>
              <p className="mt-3 text-xs text-slate-200">
                Advancing creates the next progressive week while preserving
                your history and logs.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setAdvanceOpen(true)}
                disabled={!advanceStatus.canAdvance}
                className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-900 disabled:opacity-50"
              >
                {advanceStatus.isPhaseBoundary
                  ? nextPhaseButtonLabel
                  : nextCycleButtonLabel}
              </button>
              <button
                type="button"
                onClick={() => setAdvanceMessage(previewSummary())}
                className="rounded-full border border-white/30 px-4 py-2 text-xs font-semibold text-white hover:bg-white/10"
              >
                {advanceStatus.isPhaseBoundary
                  ? "Preview next phase"
                  : "Preview next cycle"}
              </button>
            </div>
          </div>
          <div className="mt-4 text-xs text-slate-200">
            {advanceStatus.reason}
          </div>
          <div className="mt-2 text-[11px] text-slate-300">
            Sessions: {advanceStatus.completedSessionsCount ?? 0}/
            {advanceStatus.requiredSessionsCount ?? 0} • Weeks:{" "}
            {advanceStatus.completedWeeksCount ?? 0}/
            {advanceStatus.requiredWeeksCount ?? 0}
          </div>
          {advanceMessage ? (
            <div className="mt-3 rounded-2xl border border-white/15 bg-white/10 px-3 py-2 text-xs text-slate-200">
              {advanceMessage}
            </div>
          ) : null}
        </div>
      </OnImage>

      {advanceOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setAdvanceOpen(false);
              setAdvanceConfirm(false);
            }}
          />
          <div className="relative w-full max-w-md rounded-3xl border border-white/20 bg-slate-950/90 p-6 text-white shadow-xl">
            <h3 className="text-lg font-semibold">
              {advanceStatus.isPhaseBoundary
                ? `Advance to Phase ${(program?.phaseIndex ?? 1) + 1}?`
                : `Start Cycle ${(program?.cycleIndex ?? 1) + 1}?`}
            </h3>
            <p className="mt-2 text-sm text-slate-200">
              This will generate a new progressive plan. Your past logs stay
              saved.
            </p>
            {!advanceStatus.canAdvance ? (
              <div className="mt-3 rounded-2xl border border-amber-200/30 bg-amber-50/10 px-3 py-2 text-xs text-amber-100">
                {advanceStatus.reason} Sessions {advanceStatus.completedSessionsCount ?? 0}/
                {advanceStatus.requiredSessionsCount ?? 0}, Weeks{" "}
                {advanceStatus.completedWeeksCount ?? 0}/
                {advanceStatus.requiredWeeksCount ?? 0}.
              </div>
            ) : null}
            {advanceMessage ? (
              <div className="mt-3 rounded-2xl border border-white/15 bg-white/10 px-3 py-2 text-xs text-slate-200">
                {advanceMessage}
              </div>
            ) : null}
            <label className="mt-4 flex items-center gap-2 text-xs text-slate-200">
              <input
                type="checkbox"
                checked={advanceConfirm}
                onChange={(event) => setAdvanceConfirm(event.target.checked)}
                className="h-4 w-4 accent-white"
              />
              I’m ready to progress
            </label>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setAdvanceOpen(false);
                  setAdvanceConfirm(false);
                }}
                className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white/90 hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!advanceConfirm}
                onClick={() =>
                  handleAdvanceProgram(
                    advanceStatus.isPhaseBoundary ? "phase" : "cycle"
                  )
                }
                className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-900 disabled:opacity-50"
              >
                {advanceStatus.isPhaseBoundary ? "Advance phase" : "Start cycle"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <OnImage className="flex flex-wrap gap-3">
        <Link href="/assessment">
          <Button variant="secondary">Update photos</Button>
        </Link>
        <Link href="/questionnaire">
          <Button variant="secondary">Edit answers</Button>
        </Link>
      </OnImage>
    </div>
  );
}
