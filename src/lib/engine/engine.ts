import { buildQuestionnaireSignature } from "@/lib/questionnaireSignature";
import {
  summarizeExerciseFeedbackFromLogs,
  type ExerciseFeedbackSummary,
} from "@/lib/logStore";
import {
  generateNextCycleProgram,
  generateNextPhaseProgram,
  generateWeeklyProgram,
} from "@/lib/program";
import { buildProgramVariationOptions } from "@/lib/programVariationClient";
import { uuid } from "@/lib/logStore";
import type { Program } from "@/lib/types";
import type {
  ExerciseLog,
  LogPrefs,
  ProgramProgress,
  SessionRecord,
} from "@/lib/types";
import type {
  EngineDebugInfo,
  EngineGenerator,
  EngineMode,
  EngineProgramResult,
  EngineRequest,
  EngineSignals,
  EngineTargetState,
} from "@/lib/engine/engineTypes";

const LOOKBACK_WINDOW_DAYS = 14;
const RECENT_SESSION_WINDOW_DAYS = 7;

const PAIN_SEVERITY_RANK: Record<ExerciseFeedbackSummary["pain"], number> = {
  none: 0,
  mild: 1,
  moderate: 2,
  severe: 3,
};

const DIFFICULTY_RANK: Record<ExerciseFeedbackSummary["difficulty"], number> = {
  easy: 0,
  normal: 1,
  hard: 2,
  failed: 3,
};

const clampPhaseIndex = (value: number) => Math.min(3, Math.max(1, Math.floor(value)));

const toEpochMs = (value: string | null | undefined) => {
  if (!value) return Number.NaN;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? Number.NaN : parsed;
};

const sortLogs = (logs: ExerciseLog[]) =>
  [...logs].sort((left, right) => {
    const updatedOrder = (right.updatedAt ?? "").localeCompare(left.updatedAt ?? "");
    if (updatedOrder !== 0) return updatedOrder;
    const createdOrder = (right.createdAt ?? "").localeCompare(left.createdAt ?? "");
    if (createdOrder !== 0) return createdOrder;
    return left.id.localeCompare(right.id);
  });

const sortSessions = (sessions: SessionRecord[]) =>
  [...sessions].sort((left, right) => {
    const completedOrder = (right.completedAt ?? "").localeCompare(left.completedAt ?? "");
    if (completedOrder !== 0) return completedOrder;
    const updatedOrder = (right.updatedAt ?? "").localeCompare(left.updatedAt ?? "");
    if (updatedOrder !== 0) return updatedOrder;
    return left.id.localeCompare(right.id);
  });

const stableSerialize = (value: unknown): string => {
  if (value === null || value === undefined) return "null";
  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : "null";
  }
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "boolean") return value ? "true" : "false";
  if (Array.isArray(value)) return `[${value.map((entry) => stableSerialize(entry)).join(",")}]`;
  if (typeof value === "object") {
    const objectValue = value as Record<string, unknown>;
    return `{${Object.keys(objectValue)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableSerialize(objectValue[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(String(value));
};

const stableHash = (value: string) => {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(36);
};

const projectionHash = (value: unknown) => stableHash(stableSerialize(value));

const roundMetric = (value: number | null | undefined) =>
  typeof value === "number" && Number.isFinite(value) ? Number(value.toFixed(4)) : null;

const buildWeekSignature = (program: Program) =>
  program.week
    .map((day) =>
      [
        day.dayIndex,
        day.title,
        day.routine
          .map((item) => `${item.section ?? "none"}:${item.exerciseId}:${item.sets}:${item.reps}`)
          .join("|"),
      ].join("::")
    )
    .join("||");

const projectPoseAnalysis = (signals: EngineSignals) => {
  const pose = signals.poseAnalysis;
  if (!pose) return null;
  return {
    confidenceScore: roundMetric(pose.confidenceScore),
    priorities: [...pose.priorities].sort(),
    observations: [...pose.observations].sort(),
    metrics: Object.fromEntries(
      Object.entries(pose.metrics).map(([key, value]) => [key, roundMetric(value)])
    ),
  };
};

const projectAssessmentReport = (signals: EngineSignals) => {
  const report = signals.assessmentReport;
  if (!report) return null;
  return {
    summary: report.summary,
    priorities: [...report.priorities].sort(),
    observations: [...report.observations]
      .map((observation) => ({
        id: observation.id,
        title: observation.title,
        confidence: observation.confidence,
        focusTags: [...observation.primaryFocusTags].sort(),
      }))
      .sort((left, right) => left.id.localeCompare(right.id)),
  };
};

const projectPrefs = (prefs?: LogPrefs | null) => {
  if (!prefs) return null;
  const feedbackByExercise = Object.fromEntries(
    Object.entries(prefs.feedbackByExercise ?? {})
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([exerciseId, feedback]) => [
        exerciseId,
        {
          rating: feedback.rating,
          painLocation: feedback.painLocation ?? null,
        },
      ])
  );
  const substitutionByExercise = Object.fromEntries(
    Object.entries(prefs.substitutionByExercise ?? {}).sort(([left], [right]) =>
      left.localeCompare(right)
    )
  );
  return {
    feedbackByExercise,
    substitutionByExercise,
  };
};

const projectProgress = (progress: ProgramProgress | null) => {
  if (!progress) return null;
  return {
    programId: progress.programId,
    phaseIndex: progress.phaseIndex ?? 1,
    weekIndex: progress.weekIndex ?? 1,
    nextDayIndex: progress.nextDayIndex,
    completedDayIndices: [...progress.completedDayIndices].sort((left, right) => left - right),
    cyclesCompletedInPhase: progress.cyclesCompletedInPhase ?? 0,
    countedWeekKeys: [...(progress.countedWeekKeys ?? [])].sort(),
  };
};

const projectLog = (log: ExerciseLog) => ({
  exerciseId: log.exerciseId,
  originalExerciseId: log.originalExerciseId ?? null,
  substitutedExerciseId: log.substitutedExerciseId ?? null,
  programId: log.programId ?? null,
  dayIndex: log.dayIndex ?? null,
  felt: log.felt ?? null,
  painLevel: log.painLevel ?? null,
  painLocation: log.painLocation ?? null,
  setsPlanned: log.setsPlanned ?? null,
  setsCompleted: log.setsCompleted ?? null,
  reps: log.reps ?? null,
  repsBySet: log.repsBySet ?? null,
  rpe: log.rpe ?? null,
  createdAt: log.createdAt,
  updatedAt: log.updatedAt,
});

const projectSession = (session: SessionRecord) => ({
  routineId: session.routineId ?? null,
  completedAt: session.completedAt ?? null,
  feedback: session.sessionFeedback ?? null,
});

const mergeFeedbackSummaries = (
  base: Map<string, ExerciseFeedbackSummary>,
  overlay: Map<string, ExerciseFeedbackSummary>
) => {
  const merged = new Map(base);
  overlay.forEach((summary, exerciseId) => {
    const existing = merged.get(exerciseId);
    if (!existing) {
      merged.set(exerciseId, summary);
      return;
    }
    const pain =
      PAIN_SEVERITY_RANK[summary.pain] > PAIN_SEVERITY_RANK[existing.pain]
        ? summary.pain
        : existing.pain;
    const difficulty =
      DIFFICULTY_RANK[summary.difficulty] > DIFFICULTY_RANK[existing.difficulty]
        ? summary.difficulty
        : existing.difficulty;
    merged.set(exerciseId, {
      exerciseId,
      pain,
      difficulty,
      completionRate: Math.min(existing.completionRate, summary.completionRate),
    });
  });
  return merged;
};

const buildPrefsFeedbackSummary = (prefs?: LogPrefs | null) => {
  const summary = new Map<string, ExerciseFeedbackSummary>();
  Object.entries(prefs?.feedbackByExercise ?? {}).forEach(([exerciseId, feedback]) => {
    const pain: ExerciseFeedbackSummary["pain"] =
      feedback.rating === "pain" ? "moderate" : "none";
    const difficulty: ExerciseFeedbackSummary["difficulty"] =
      feedback.rating === "pain"
        ? "failed"
        : feedback.rating === "hard"
        ? "hard"
        : feedback.rating === "easy"
        ? "easy"
        : "normal";
    summary.set(exerciseId, {
      exerciseId,
      pain,
      difficulty,
      completionRate: feedback.rating === "pain" ? 0.75 : 1,
    });
  });
  return summary;
};

const normalizeHistory = (signals: EngineSignals) => ({
  sessions: (signals.history?.sessions ?? []).filter((session) => !session.deletedAt),
  exerciseLogs: (signals.history?.exerciseLogs ?? []).filter((log) => !log.deletedAt),
  programProgress: signals.history?.programProgress ?? null,
});

const collectRelevantSessions = (signals: EngineSignals, currentProgram?: Program | null) => {
  const history = normalizeHistory(signals);
  if (!currentProgram) return sortSessions(history.sessions);
  return sortSessions(
    history.sessions.filter((session) => session.routineId === currentProgram.id)
  );
};

const collectRelevantLogs = (
  signals: EngineSignals,
  currentProgram?: Program | null,
  sessions?: SessionRecord[]
) => {
  const history = normalizeHistory(signals);
  if (!currentProgram) return sortLogs(history.exerciseLogs);
  const sessionIds = new Set((sessions ?? []).map((session) => session.id));
  return sortLogs(
    history.exerciseLogs.filter(
      (log) => log.programId === currentProgram.id || sessionIds.has(log.sessionId)
    )
  );
};

const resolveRelevantProgress = (
  signals: EngineSignals,
  currentProgram?: Program | null
) => {
  const progress = normalizeHistory(signals).programProgress;
  if (!progress) return null;
  if (!currentProgram) return null;
  return progress.programId === currentProgram.id ? progress : null;
};

const resolveWeeklyTarget = (request: Extract<EngineRequest, { mode: "weekly" }>): EngineTargetState => {
  const fallbackWeekIndex = request.currentProgram?.weekIndex ?? 1;
  const weekIndex = Math.max(1, request.weekIndex ?? fallbackWeekIndex);
  const phaseIndex = clampPhaseIndex(
    request.phaseIndex ?? request.currentProgram?.phaseIndex ?? 1
  );
  const cycleIndex = Math.max(1, request.cycleIndex ?? request.currentProgram?.cycleIndex ?? 1);
  const totalWeekIndex = Math.max(
    1,
    request.totalWeekIndex ??
      request.currentProgram?.totalWeekIndex ??
      request.currentProgram?.weekIndex ??
      weekIndex
  );
  return {
    phaseIndex,
    cycleIndex,
    weekIndex,
    totalWeekIndex,
  };
};

const resolveTargetForRequest = (request: EngineRequest): EngineTargetState => {
  if (request.mode === "weekly") return resolveWeeklyTarget(request);
  const currentProgram = request.currentProgram;
  return {
    phaseIndex: clampPhaseIndex(currentProgram.phaseIndex ?? 1),
    cycleIndex: Math.max(1, currentProgram.cycleIndex ?? 1),
    weekIndex: Math.max(1, currentProgram.weekIndex ?? 1),
    totalWeekIndex: Math.max(
      1,
      currentProgram.totalWeekIndex ?? currentProgram.weekIndex ?? 1
    ),
  };
};

const deriveProgressionContext = (signals: EngineSignals, currentProgram?: Program | null) => {
  const targetDaysPerWeek = currentProgram?.daysPerWeek ?? signals.questionnaire.daysPerWeek;
  const nowMs = toEpochMs(signals.nowIso);
  const recentWindowMs =
    Number.isNaN(nowMs) ? Number.POSITIVE_INFINITY : nowMs - RECENT_SESSION_WINDOW_DAYS * 86400000;
  const lookbackWindowMs =
    Number.isNaN(nowMs) ? Number.NEGATIVE_INFINITY : nowMs - LOOKBACK_WINDOW_DAYS * 86400000;
  const relevantSessions = collectRelevantSessions(signals, currentProgram);
  const completedSessions = relevantSessions.filter((session) => Boolean(session.completedAt));
  const recentSessions = completedSessions.filter((session) => {
    const sessionAt = toEpochMs(session.completedAt ?? session.updatedAt ?? session.createdAt);
    if (Number.isNaN(sessionAt)) return false;
    return sessionAt >= recentWindowMs;
  });
  const relevantLogs = collectRelevantLogs(signals, currentProgram, relevantSessions);
  const lookbackLogs = relevantLogs.filter((log) => {
    const loggedAt = toEpochMs(log.updatedAt ?? log.createdAt);
    if (Number.isNaN(loggedAt)) return false;
    return loggedAt >= lookbackWindowMs;
  });
  const fallbackLogLimit = Math.max(targetDaysPerWeek * 2, 6);
  const recentLogs = (lookbackLogs.length ? lookbackLogs : relevantLogs).slice(
    0,
    currentProgram ? 250 : Math.max(fallbackLogLimit, 18)
  );
  const feedbackRatings = [
    ...completedSessions
      .map((session) => session.sessionFeedback)
      .filter((rating): rating is "easy" | "moderate" | "hard" | "pain" => Boolean(rating)),
    ...recentLogs
      .map((log) => log.felt)
      .filter((rating): rating is "easy" | "moderate" | "hard" | "pain" => Boolean(rating)),
  ];
  const painFlag = feedbackRatings.includes("pain");
  const hardCount = feedbackRatings.filter((rating) => rating === "hard").length;
  const fatigueFlag =
    feedbackRatings.length > 0 && hardCount / feedbackRatings.length >= 0.5;
  const complianceRate = Math.min(
    1,
    recentSessions.length / Math.max(1, targetDaysPerWeek)
  );
  const progress = resolveRelevantProgress(signals, currentProgram);
  const completedWeeksCount = progress
    ? Math.max(0, (progress.weekIndex ?? 1) - 1)
    : Math.floor(completedSessions.length / Math.max(1, targetDaysPerWeek));
  const feedbackSummaryByExercise = mergeFeedbackSummaries(
    summarizeExerciseFeedbackFromLogs(recentLogs, ""),
    buildPrefsFeedbackSummary(signals.prefs)
  );

  return {
    relevantSessions,
    completedSessions,
    recentSessions,
    recentLogs,
    feedbackSummaryByExercise,
    painFlag,
    fatigueFlag,
    complianceRate,
    completedSessionsCount: completedSessions.length,
    completedWeeksCount,
    progress,
  };
};

const buildSeedPolicy = (params: {
  request: EngineRequest;
  target: EngineTargetState;
  progression: ReturnType<typeof deriveProgressionContext>;
}) => {
  const { request, target, progression } = params;
  const signals = request.signals;
  const questionSignature = buildQuestionnaireSignature(signals.questionnaire);
  const initialVariationSeed =
    request.mode === "weekly" &&
    !request.currentProgram &&
    signals.questionnaire.daysPerWeek === 3
      ? String(request.initialVariationSeed ?? "").trim()
      : "";
  const settingsProjection = {
    questionnaireSignature: questionSignature,
    poseAnalysis: projectPoseAnalysis(signals),
    assessmentReport: projectAssessmentReport(signals),
    prefs: projectPrefs(signals.prefs),
  };
  const historyProjection = {
    progress: projectProgress(progression.progress),
    sessions: progression.completedSessions.slice(0, 12).map(projectSession),
    logs: progression.recentLogs.slice(0, 24).map(projectLog),
    currentProgram:
      "currentProgram" in request && request.currentProgram
        ? {
            id: request.currentProgram.id,
            weekSignature: buildWeekSignature(request.currentProgram),
            phaseIndex: request.currentProgram.phaseIndex ?? 1,
            cycleIndex: request.currentProgram.cycleIndex ?? 1,
            weekIndex: request.currentProgram.weekIndex ?? 1,
            totalWeekIndex:
              request.currentProgram.totalWeekIndex ?? request.currentProgram.weekIndex ?? 1,
          }
        : null,
  };
  const settingsHash = `engine-settings-${projectionHash(settingsProjection)}`;
  const seed = [
    "engine-v1",
    request.mode,
    `target:${target.phaseIndex}:${target.cycleIndex}:${target.weekIndex}:${target.totalWeekIndex}`,
    `questionnaire:${projectionHash(questionSignature)}`,
    `settings:${projectionHash(settingsProjection)}`,
    initialVariationSeed ? `initialVariation:${initialVariationSeed}` : "",
    `history:${projectionHash(historyProjection)}`,
  ].filter(Boolean).join("|");
  const variationIndex = Math.max(0, target.totalWeekIndex - 1);

  return {
    seed,
    settingsHash,
    initialVariationSeed,
    variationIndex,
  };
};

const buildDebugInfo = (params: {
  mode: EngineMode;
  seed: string;
  settingsHash: string;
  target: EngineTargetState;
  progression: ReturnType<typeof deriveProgressionContext>;
}): EngineDebugInfo => ({
  mode: params.mode,
  seed: params.seed,
  settingsHash: params.settingsHash,
  target: params.target,
  progression: {
    complianceRate: Number(params.progression.complianceRate.toFixed(4)),
    painFlag: params.progression.painFlag,
    fatigueFlag: params.progression.fatigueFlag,
    completedSessionsCount: params.progression.completedSessionsCount,
    completedWeeksCount: params.progression.completedWeeksCount,
    recentLogCount: params.progression.recentLogs.length,
    recentSessionCount: params.progression.recentSessions.length,
  },
});

const buildWeeklyProgram = (
  request: Extract<EngineRequest, { mode: "weekly" }>
): EngineProgramResult => {
  const target = resolveWeeklyTarget(request);
  const progression = deriveProgressionContext(request.signals, request.currentProgram);
  const seedPolicy = buildSeedPolicy({
    request,
    target,
    progression,
  });
  const variation = request.currentProgram
    ? buildProgramVariationOptions({
        settingsHash: seedPolicy.settingsHash,
        variationIndex: seedPolicy.variationIndex,
        recentProgram: request.currentProgram,
      })
    : seedPolicy.initialVariationSeed || seedPolicy.variationIndex > 0
    ? {
        seed: seedPolicy.seed,
        settingsHash: seedPolicy.settingsHash,
        variationIndex: seedPolicy.variationIndex,
        index: seedPolicy.variationIndex,
        useRecentMemory: false,
      }
    : undefined;
  const program = generateWeeklyProgram(request.signals.questionnaire, request.nextProgramId, {
    phaseIndex: target.phaseIndex,
    weekIndex: target.weekIndex,
    cycleIndex: target.cycleIndex,
    totalWeekIndex: target.totalWeekIndex,
    seed: seedPolicy.seed,
    poseAnalysis: request.signals.poseAnalysis ?? null,
    assessmentReport: request.signals.assessmentReport ?? null,
    recentLogs: progression.recentLogs,
    previousWeek: request.currentProgram?.week,
    feedbackSummaryByExercise: progression.feedbackSummaryByExercise,
    variation: variation ? { ...variation, seed: seedPolicy.seed } : undefined,
  });

  return {
    status: "generated",
    program,
    seed: seedPolicy.seed,
    debug: buildDebugInfo({
      mode: request.mode,
      seed: seedPolicy.seed,
      settingsHash: seedPolicy.settingsHash,
      target,
      progression,
    }),
  };
};

const buildAdvancedResult = (params: {
  request: EngineRequest;
  progression: ReturnType<typeof deriveProgressionContext>;
  target: EngineTargetState;
  seed: string;
  settingsHash: string;
  result:
    | ReturnType<typeof generateNextCycleProgram>
    | ReturnType<typeof generateNextPhaseProgram>;
}): EngineProgramResult => {
  const { request, progression, target, seed, settingsHash, result } = params;
  const debug = buildDebugInfo({
    mode: request.mode,
    seed,
    settingsHash,
    target,
    progression,
  });
  if (result.status !== "advanced") {
    return {
      status: result.status,
      message: result.message,
      seed,
      debug,
    };
  }
  return {
    status: "advanced",
    program: result.program,
    seed,
    debug,
  };
};

export const generateProgram: EngineGenerator = (
  request: EngineRequest
): EngineProgramResult => {
  if (request.mode === "weekly") {
    return buildWeeklyProgram(request);
  }

  const target = resolveTargetForRequest(request);
  const progression = deriveProgressionContext(request.signals, request.currentProgram);
  const seedPolicy = buildSeedPolicy({
    request,
    target,
    progression,
  });

  if (request.mode === "nextCycle") {
    return buildAdvancedResult({
      request,
      progression,
      target,
      seed: seedPolicy.seed,
      settingsHash: seedPolicy.settingsHash,
      result: generateNextCycleProgram({
        currentProgram: request.currentProgram,
        questionnaire: request.signals.questionnaire,
        painFlag: progression.painFlag,
        complianceRate: progression.complianceRate,
        fatigueFlag: progression.fatigueFlag,
        completedSessionsCount: progression.completedSessionsCount,
        completedWeeksCount: progression.completedWeeksCount,
        recentLogs: progression.recentLogs,
        feedbackSummaryByExercise: progression.feedbackSummaryByExercise,
        poseAnalysis: request.signals.poseAnalysis ?? null,
        assessmentReport: request.signals.assessmentReport ?? null,
        nextProgramId: request.nextProgramId,
        seed: seedPolicy.seed,
      }),
    });
  }

  return buildAdvancedResult({
    request,
    progression,
    target,
    seed: seedPolicy.seed,
    settingsHash: seedPolicy.settingsHash,
    result: generateNextPhaseProgram({
      currentProgram: request.currentProgram,
      questionnaire: request.signals.questionnaire,
      painFlag: progression.painFlag,
      complianceRate: progression.complianceRate,
      fatigueFlag: progression.fatigueFlag,
      completedSessionsCount: progression.completedSessionsCount,
      completedWeeksCount: progression.completedWeeksCount,
      recentLogs: progression.recentLogs,
      feedbackSummaryByExercise: progression.feedbackSummaryByExercise,
      poseAnalysis: request.signals.poseAnalysis ?? null,
      assessmentReport: request.signals.assessmentReport ?? null,
      nextProgramId: request.nextProgramId,
      seed: seedPolicy.seed,
    }),
  });
};

export function generateProgramV2(signals: EngineSignals): Program {
  const result = generateProgram({
    mode: "weekly",
    signals,
    nextProgramId: uuid(),
  });
  if ("program" in result) return result.program;
  throw new Error(result.message);
}
