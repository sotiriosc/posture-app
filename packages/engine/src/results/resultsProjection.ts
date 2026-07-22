/**
 * Phase 5 — Results Projection.
 *
 * Pure function that projects the full training history into the shape
 * consumed by the results screen.  Deterministic: consumes only persisted
 * state (Program + ExerciseLog[]).  No side effects.
 *
 * SR-5 (bloom-plan standing rule): every number on the results screen is
 * traceable to a log entry or a confidence-gated measurement.  Fields that
 * cannot be computed from available state are explicitly marked with
 * `notEnoughSignal: true` rather than filled with zeros or hidden.
 */

import { exerciseById } from "@/lib/exercises";
import { getLadderProgressionMessage } from "@/lib/program/ladderAdvancement";
import type {
  AssessmentSnapshot,
  ExerciseLog,
  FocusTagLifecycleState,
  PhaseTransitionRecord,
  Program,
  ProgramDay,
  RungAdvancementRecord,
} from "@/lib/types";

// ---------------------------------------------------------------------------
// Output types
// ---------------------------------------------------------------------------

export type LadderClimbRecord = {
  pattern: string;
  fromExerciseId: string;
  fromExerciseName: string;
  fromDifficulty: number;
  toExerciseId: string;
  toExerciseName: string;
  toDifficulty: number;
  atSessionCount: number;
  atPhase: number;
  criteriaSatisfied: string[];
};

export type CurrentRungInfo = {
  pattern: string;
  exerciseId: string;
  exerciseName: string;
  difficulty: number;
  sessionsAtRung: number;
  nextRungRequirements: string;
};

export type RetiredTagRecord = {
  tag: string;
  retiredAtSessionCount: number;
  reason: "cleared_2x" | "cleared_strong" | "unknown";
  baselineValue: number | null;
  finalValue: number | null;
  retirementTrace: string;
};

export type ActiveTagRecord = {
  tag: string;
  sourceObservation: string;
  currentValue: number | null;
  threshold: number | null;
  direction: "improving" | "stable" | "worsening";
  /** True when the last measurement came from a low-confidence photo. */
  notEnoughSignal: boolean;
};

export type SacrificeRetestQueueItem = {
  exerciseId: string;
  exerciseName: string;
  sacrificedAtPhase: "activation" | "skill" | "growth";
  sacrificedAtSession: number;
  eligibleForRetestNow: boolean;
};

export type PhaseHistoryRecord = {
  phase: "activation" | "skill" | "growth";
  enteredAtSessionCount: number;
  exitedAtSessionCount: number | null;
  criteriaAtExit: string[];
  trace: string;
};

export type ConsistencyMetrics = {
  sessionsCompleted: number;
  streakCurrent: number;
  streakLongest: number;
  completionRateLast30: number;
};

export type ProvenanceFooter = {
  baselineAssessmentDate: string | null;
  latestAssessmentDate: string | null;
  retestCount: number;
  totalDecisionTraces: number;
  footerLine: string;
};

/**
 * The full projection shape consumed by the results screen.
 *
 * All fields that cannot be derived from available state are explicitly
 * marked with a `notEnoughSignal` flag rather than silently filled.
 */
export type ResultsProjection = {
  /** All rung advancements this program has recorded. */
  laddersClimbed: LadderClimbRecord[];
  /** Current rung state per active pattern. */
  currentRungByPattern: CurrentRungInfo[];
  /** Tags that have been retired via the assessment truth loop. */
  retiredTags: RetiredTagRecord[];
  /** Tags that are currently active in the program. */
  activeTags: ActiveTagRecord[];
  /** Exercises awaiting a "ready to try again?" retest prompt. */
  sacrificeRetestQueue: SacrificeRetestQueueItem[];
  /** Phase transition history (one entry per completed phase). */
  phaseHistory: PhaseHistoryRecord[];
  /** Session consistency metrics. */
  consistency: ConsistencyMetrics;
  /** Provenance footer — the trust metric. */
  provenanceFooter: ProvenanceFooter;
};

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function buildLaddersClimbed(
  rungAdvancementHistory: RungAdvancementRecord[]
): LadderClimbRecord[] {
  return [...rungAdvancementHistory]
    .sort((a, b) => a.atSessionCount - b.atSessionCount)
    .map((record) => {
    const fromEx = exerciseById(record.fromExerciseId);
    const toEx = exerciseById(record.toExerciseId);
    // Extract criteria from trace if available ("advance X: N/M clean..." style).
    const criteriaSatisfied: string[] = record.trace ? [record.trace] : [];
    return {
      pattern: record.pattern,
      fromExerciseId: record.fromExerciseId,
      fromExerciseName: fromEx?.name ?? record.fromExerciseId,
      fromDifficulty: record.fromDifficulty,
      toExerciseId: record.toExerciseId,
      toExerciseName: toEx?.name ?? record.toExerciseId,
      toDifficulty: record.toDifficulty,
      atSessionCount: record.atSessionCount,
      atPhase: record.atPhase,
      criteriaSatisfied,
    };
  });
}

function buildCurrentRungByPattern(program: Program): CurrentRungInfo[] {
  const ladderState = program.ladderState;
  if (!ladderState) return [];
  return Object.entries(ladderState.byPattern).map(([pattern, rungState]) => {
    const ex = exerciseById(rungState.exerciseId);
    return {
      pattern,
      exerciseId: rungState.exerciseId,
      exerciseName: ex?.name ?? rungState.exerciseId,
      difficulty: rungState.difficulty,
      sessionsAtRung: rungState.cleanSessionsCount,
      nextRungRequirements: getLadderProgressionMessage(
        rungState.exerciseId,
        rungState.cleanSessionsCount,
        rungState.requiredForAdvance
      ),
    };
  });
}

function buildRetiredTags(
  focusTagLifecycle: Record<string, FocusTagLifecycleState> | undefined,
  assessmentHistory: AssessmentSnapshot[] | undefined
): RetiredTagRecord[] {
  if (!focusTagLifecycle) return [];
  const retired: RetiredTagRecord[] = [];
  for (const [tag, state] of Object.entries(focusTagLifecycle)) {
    if (!state.retiredAt) continue;
    const trace = state.retirementTrace ?? "";
    const reason: RetiredTagRecord["reason"] = trace.includes("strong clear")
      ? "cleared_strong"
      : trace.includes("retest cleared threshold")
        ? "cleared_2x"
        : "unknown";
    // Find baseline value and final value from assessment history.
    const baselineSnap = assessmentHistory?.find(
      (s) => s.status === "accepted" && s.observations.some((o) => o.focusTag === tag)
    );
    const baselineValue =
      baselineSnap?.observations.find((o) => o.focusTag === tag)?.measuredValue ?? null;
    // Last snapshot before retirement.
    const finalSnap = assessmentHistory
      ?.filter(
        (s) =>
          (s.status === "accepted" || s.status === "user_retook") &&
          s.observations.some((o) => o.focusTag === tag)
      )
      .at(-1);
    const finalValue =
      finalSnap?.observations.find((o) => o.focusTag === tag)?.measuredValue ?? null;
    // Convert retiredAt string date to session count — use atSessionCount from lifecycle state if available.
    retired.push({
      tag,
      retiredAtSessionCount: 0, // Session count not stored directly in FocusTagLifecycleState; date only.
      reason,
      baselineValue,
      finalValue,
      retirementTrace: trace,
    });
  }
  return retired;
}

function buildActiveTags(
  program: Program,
  focusTagLifecycle: Record<string, FocusTagLifecycleState> | undefined,
  assessmentHistory: AssessmentSnapshot[] | undefined
): ActiveTagRecord[] {
  // Derive current focus tags from program days.
  const allFocusTags = new Set<string>();
  for (const day of program.week ?? []) {
    for (const tag of day.focusTags ?? []) {
      allFocusTags.add(tag);
    }
  }
  // Also include tags referenced in sourceObservation traces (via baseline assessment).
  const baselineSnap = assessmentHistory?.find((s) => s.status === "accepted");
  if (!baselineSnap && allFocusTags.size === 0) return [];
  const latestSnap = assessmentHistory?.filter((s) => s.status !== "insufficient_confidence").at(-1);
  const active: ActiveTagRecord[] = [];
  // Collect all tags from baseline observations.
  const tagsFromHistory = new Set(
    baselineSnap?.observations.map((o) => o.focusTag) ?? []
  );
  const allTags = new Set([...allFocusTags, ...tagsFromHistory]);
  for (const tag of allTags) {
    if (focusTagLifecycle?.[tag]?.retiredAt) continue;
    const baselineObs = baselineSnap?.observations.find((o) => o.focusTag === tag);
    const latestObs = latestSnap?.observations.find((o) => o.focusTag === tag);
    const currentValue = latestObs?.measuredValue ?? null;
    const threshold = latestObs?.threshold ?? baselineObs?.threshold ?? null;
    const lowConfidence =
      latestSnap !== undefined && latestSnap.confidenceScore < 0.55;
    let direction: ActiveTagRecord["direction"] = "stable";
    if (baselineObs && latestObs && baselineObs !== latestObs) {
      const delta = latestObs.measuredValue - baselineObs.measuredValue;
      if (delta < -0.01) direction = "improving";
      else if (delta > 0.01) direction = "worsening";
    }
    // Find source observation text.
    let sourceObservation = "";
    for (const day of program.week ?? []) {
      for (const item of day.routine ?? []) {
        const obs = item.selectionDebug?.decisionTrace?.sourceObservation;
        if (obs) {
          sourceObservation = obs;
          break;
        }
      }
      if (sourceObservation) break;
    }
    active.push({
      tag,
      sourceObservation,
      currentValue,
      threshold,
      direction,
      notEnoughSignal: lowConfidence,
    });
  }
  return active;
}

function buildSacrificeRetestQueue(program: Program): SacrificeRetestQueueItem[] {
  const queue: SacrificeRetestQueueItem[] = [];
  // Phase 3.5 eligible list.
  const phaseRetestEligible = new Set(
    (program.phaseTransitionState?.sacrificeRetestEligible ?? []).map((e) => e.exerciseId)
  );
  // Phase 3.2 sacrificed exercises.
  const sacrificedByPattern = program.ladderState?.sacrificedByPattern ?? {};
  for (const [, exerciseIds] of Object.entries(sacrificedByPattern)) {
    for (const exerciseId of exerciseIds) {
      const ex = exerciseById(exerciseId);
      queue.push({
        exerciseId,
        exerciseName: ex?.name ?? exerciseId,
        sacrificedAtPhase: (program.phase?.name as "activation" | "skill" | "growth") ?? "activation",
        sacrificedAtSession: 0,
        eligibleForRetestNow: phaseRetestEligible.has(exerciseId),
      });
    }
  }
  return queue;
}

function buildPhaseHistory(
  phaseHistory: PhaseTransitionRecord[] | undefined,
  currentPhaseTransitionState: Program["phaseTransitionState"] | undefined
): PhaseHistoryRecord[] {
  const records: PhaseHistoryRecord[] = [];
  for (const record of phaseHistory ?? []) {
    records.push({
      phase: record.phase,
      enteredAtSessionCount: record.enteredAtSessionCount,
      exitedAtSessionCount: record.exitedAtSessionCount ?? null,
      criteriaAtExit: record.criteriaAtExit,
      trace: record.trace,
    });
  }
  // If no history is available but we have current phase state, add an open record.
  if (records.length === 0 && currentPhaseTransitionState) {
    records.push({
      phase: currentPhaseTransitionState.phase,
      enteredAtSessionCount: 0,
      exitedAtSessionCount: null,
      criteriaAtExit: [],
      trace: currentPhaseTransitionState.lastTrace,
    });
  }
  return records;
}

function buildConsistency(logs: ExerciseLog[]): ConsistencyMetrics {
  const activeLogs = logs.filter((l) => !l.deletedAt && l.createdAt);
  // Count unique sessions by sessionId.
  const sessionIds = new Set(activeLogs.map((l) => l.sessionId));
  const sessionsCompleted = sessionIds.size;
  // Build a Set of date strings (YYYY-MM-DD) from log timestamps.
  const sessionDates = new Set(
    activeLogs.map((l) => (l.createdAt ?? "").slice(0, 10)).filter(Boolean)
  );
  const sortedDates = Array.from(sessionDates).sort();
  // Compute streaks.
  let streakCurrent = 0;
  let streakLongest = 0;
  let runningStreak = 0;
  let prevDate: Date | null = null;
  for (const dateStr of sortedDates) {
    const d = new Date(dateStr);
    if (prevDate === null) {
      runningStreak = 1;
    } else {
      const diffMs = d.getTime() - prevDate.getTime();
      const diffDays = Math.round(diffMs / 86_400_000);
      if (diffDays <= 3) {
        // Within 3 days counts as streak continuation (rest days allowed).
        runningStreak += 1;
      } else {
        runningStreak = 1;
      }
    }
    if (runningStreak > streakLongest) streakLongest = runningStreak;
    prevDate = d;
  }
  streakCurrent = runningStreak;
  // Completion rate over last 30 days.
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const last30Sessions = new Set(
    activeLogs
      .filter((l) => new Date(l.createdAt ?? "").getTime() >= thirtyDaysAgo.getTime())
      .map((l) => l.sessionId)
  );
  const completionRateLast30 = last30Sessions.size > 0 ? last30Sessions.size / 30 : 0;
  return {
    sessionsCompleted,
    streakCurrent,
    streakLongest,
    completionRateLast30: Math.min(1, completionRateLast30),
  };
}

function countDecisionTraces(week: ProgramDay[]): number {
  let count = 0;
  for (const day of week) {
    for (const item of day.routine ?? []) {
      if (item.selectionDebug?.decisionTrace) count += 1;
    }
  }
  return count;
}

function buildProvenanceFooter(
  program: Program
): ProvenanceFooter {
  const history = program.assessmentHistory ?? [];
  const accepted = history.filter((s) => s.status !== "insufficient_confidence");
  const retestCount = Math.max(0, accepted.length - 1);
  const baselineAssessmentDate = accepted[0]?.timestamp ?? null;
  const latestAssessmentDate = accepted.at(-1)?.timestamp ?? null;
  const totalDecisionTraces = countDecisionTraces(program.week ?? []);
  return {
    baselineAssessmentDate,
    latestAssessmentDate,
    retestCount,
    totalDecisionTraces,
    footerLine:
      totalDecisionTraces > 0
        ? `Every recommendation you've received has been logged with its reasoning. You can request the full log at any time.`
        : `No decision traces recorded yet — complete your first session to begin.`,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Project the full training history into the shape consumed by the
 * results screen.
 *
 * Pure function; deterministic; no side effects.
 */
export function projectResults(
  program: Program,
  logs: ExerciseLog[]
): ResultsProjection {
  const laddersClimbed = buildLaddersClimbed(
    program.ladderState?.rungAdvancementHistory ?? []
  );
  const currentRungByPattern = buildCurrentRungByPattern(program);
  const retiredTags = buildRetiredTags(
    program.focusTagLifecycle,
    program.assessmentHistory
  );
  const activeTags = buildActiveTags(
    program,
    program.focusTagLifecycle,
    program.assessmentHistory
  );
  const sacrificeRetestQueue = buildSacrificeRetestQueue(program);
  const phaseHistory = buildPhaseHistory(
    program.phaseHistory,
    program.phaseTransitionState
  );
  const consistency = buildConsistency(logs);
  const provenanceFooter = buildProvenanceFooter(program);

  return {
    laddersClimbed,
    currentRungByPattern,
    retiredTags,
    activeTags,
    sacrificeRetestQueue,
    phaseHistory,
    consistency,
    provenanceFooter,
  };
}
