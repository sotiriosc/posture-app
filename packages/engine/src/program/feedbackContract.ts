/**
 * Phase 3.2 — Feedback Contract: Sacrifice / Test / Modify
 *
 * Pure, deterministic logic for computing per-session feedback prompts and
 * applying user choices.  No Date.now() — timestamps come from ExerciseLog
 * records and session-count values from ProgramProgress.
 *
 * Composition rule: this module SETS flags that Phase 3 advancement already
 * READS.  Do NOT modify Phase 3's computePatternLadderDecision.
 *
 * Trigger signals (heavy — prompt fires on any single one):
 *   - pain === "severe" on the most recent log
 *   - pain === "moderate" on the last TWO consecutive logs
 *   - completed === "no" on the most recent log  (setsCompleted < setsPlanned)
 *   - difficulty === "failed" on the most recent log (rpe >= 9 with full sets)
 *
 * Actions:
 *   - Sacrifice  → deferred: true + sacrificedAt + pushes to retest queue
 *   - Test       → probation: true  (second flag → auto-Sacrifice)
 *   - Modify     → deferred: true (Phase 3 REG-1c handles the one-rung regression)
 *   - Dismiss    → treated as Test (charitable default, per §3.2 silence-is-Test)
 */

import { exerciseById } from "@/lib/exercises";
import { getPrevLadderRung } from "@/lib/program/ladderAdvancement";
import type { ExerciseFeedbackSummary, ExerciseLog, LadderState } from "@/lib/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type FeedbackContractAction = "sacrifice" | "test" | "modify" | "dismiss";

/** Reason why an exercise triggered the pre-session prompt. */
export type FeedbackContractTriggerReason =
  | "severe_pain"
  | "moderate_pain_consecutive"
  | "incomplete"
  | "failed_difficulty";

/** An exercise that needs a pre-session Sacrifice/Test/Modify prompt. */
export type FeedbackContractTrigger = {
  exerciseId: string;
  reason: FeedbackContractTriggerReason;
  /** True if the exercise is already on probation (next flag → auto-Sacrifice). */
  onProbation: boolean;
  /**
   * True if the exercise is at d1 with no previous rung.
   * When true the UI must disable Modify and present only Sacrifice or Test.
   */
  atFloor: boolean;
};

/** Result of applying one user action to one flagged exercise. */
export type FeedbackContractResult = {
  updatedSummary: ExerciseFeedbackSummary;
  updatedLadderState?: LadderState;
  decisionTrace: string;
};

// ---------------------------------------------------------------------------
// Trigger computation
// ---------------------------------------------------------------------------

/** Determine whether a log represents an incomplete session (REG-1b analog). */
const isIncomplete = (log: ExerciseLog): boolean =>
  (log.setsCompleted ?? 0) < (log.setsPlanned ?? 1);

/** Determine whether a log represents a "failed" difficulty (rpe ≥ 9, all sets done). */
const isFailedDifficulty = (log: ExerciseLog): boolean => {
  const allDone =
    (log.setsPlanned ?? 0) > 0 &&
    (log.setsCompleted ?? 0) >= (log.setsPlanned ?? 0);
  return allDone && (log.rpe ?? 0) >= 9;
};

/**
 * Compute which exercises in today's plan need a pre-session prompt.
 *
 * @param todaysPlanExerciseIds  exercise IDs from today's routine (main section)
 * @param recentLogs             all available logs, caller supplies unsorted
 * @param feedbackSummaryByExercise  persisted summaries (incl. probation flags)
 * @returns                       triggers in stable order (matches plan order)
 */
export const computeFlaggedExercises = (params: {
  todaysPlanExerciseIds: readonly string[];
  recentLogs: readonly ExerciseLog[];
  feedbackSummaryByExercise: ReadonlyMap<string, ExerciseFeedbackSummary>;
}): FeedbackContractTrigger[] => {
  const { todaysPlanExerciseIds, recentLogs, feedbackSummaryByExercise } = params;

  // Sort logs newest-first (TRC-1: use createdAt timestamp from log, no Date.now).
  const sorted = [...recentLogs]
    .filter((l) => !l.deletedAt)
    .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));

  const triggers: FeedbackContractTrigger[] = [];

  for (const exerciseId of todaysPlanExerciseIds) {
    const summary = feedbackSummaryByExercise.get(exerciseId);

    // Already sacrificed (deferred) — no prompt, skip from session planning.
    if (summary?.deferred) continue;

    const logsForExercise = sorted.filter((l) => l.exerciseId === exerciseId);
    if (logsForExercise.length === 0) continue;

    const [most, second] = logsForExercise;

    let reason: FeedbackContractTriggerReason | null = null;

    // Check triggers in priority order.
    if (most.felt === "pain" || most.painLevel === "severe") {
      reason = "severe_pain";
    } else if (
      most.painLevel === "moderate" &&
      second &&
      second.painLevel === "moderate"
    ) {
      reason = "moderate_pain_consecutive";
    } else if (isIncomplete(most)) {
      reason = "incomplete";
    } else if (isFailedDifficulty(most)) {
      reason = "failed_difficulty";
    }

    if (!reason) continue;

    const onProbation = summary?.probation === true;
    const atFloor = !getPrevLadderRung(exerciseId);

    triggers.push({ exerciseId, reason, onProbation, atFloor });
  }

  return triggers;
};

// ---------------------------------------------------------------------------
// Phase 6f, Commit 5.c — prompt copy + self-adapting suppression
// ---------------------------------------------------------------------------

const REASON_COPY: Record<
  Exclude<FeedbackContractTriggerReason, "incomplete">,
  string
> = {
  severe_pain: "you reported pain",
  moderate_pain_consecutive: "you reported discomfort two sessions in a row",
  failed_difficulty: "the effort was maximal",
};

/**
 * The pre-session prompt's headline sentence. The "incomplete" reason gets
 * curious-not-judgmental phrasing — the old copy ("you didn't complete all
 * sets... what would you like to do?") reads as assuming the user meant to
 * skip it, when just as often they simply forgot to log it. Other reasons
 * (pain, failed difficulty) aren't about missing log entries, so they keep
 * their direct phrasing.
 */
export const buildContractPrompt = (
  reason: FeedbackContractTriggerReason,
  exerciseName: string
): string =>
  reason === "incomplete"
    ? `I noticed you didn't fill in fields for ${exerciseName} last session. Did you skip it, or want to log it now?`
    : `Last session, ${REASON_COPY[reason]} on ${exerciseName}. What would you like to do?`;

/**
 * The "incomplete" reason prompt offers a one-tap "turn this off" link once
 * it has fired at least twice — early enough to respect a user who's told
 * it (implicitly, by seeing it repeatedly) that they don't want it, without
 * offering an escape hatch the very first time it could plausibly be useful.
 */
export const shouldOfferIncompletePromptSuppression = (
  fireCount: number
): boolean => fireCount >= 2;

/**
 * Drop "incomplete"-reason triggers when the user has turned that prompt
 * off. Pain and failed-difficulty reasons are safety-relevant and are never
 * affected by this preference.
 */
export const filterSuppressedContractTriggers = (
  triggers: readonly FeedbackContractTrigger[],
  suppressIncomplete: boolean
): FeedbackContractTrigger[] =>
  suppressIncomplete
    ? triggers.filter((trigger) => trigger.reason !== "incomplete")
    : [...triggers];

// ---------------------------------------------------------------------------
// Auto-sacrifice check
// ---------------------------------------------------------------------------

/**
 * For an exercise that is already on probation and has just been flagged again,
 * apply auto-Sacrifice immediately (two-strikes-and-defer).
 */
export const applyAutoSacrifice = (params: {
  exerciseId: string;
  exercisePattern?: string;
  currentSummary: ExerciseFeedbackSummary;
  currentLadderState?: LadderState;
  phase: "activation" | "skill" | "growth";
  sessionCount: number;
}): FeedbackContractResult => {
  const { exerciseId, exercisePattern, currentSummary, currentLadderState, phase, sessionCount } = params;

  const updatedSummary: ExerciseFeedbackSummary = {
    ...currentSummary,
    deferred: true,
    probation: false,
    autoSacrificed: true,
    sacrificedAt: { phase, sessionCount },
  };

  const updatedLadderState = appendToSacrificedByPattern(
    currentLadderState,
    exercisePattern,
    exerciseId
  );

  return {
    updatedSummary,
    updatedLadderState,
    decisionTrace:
      `auto-sacrifice ${exerciseId}: two consecutive flags on probation` +
      ` — deferred=true, sacrificedAt={phase:${phase},sessionCount:${sessionCount}}`,
  };
};

// ---------------------------------------------------------------------------
// Action application
// ---------------------------------------------------------------------------

/**
 * Apply a user-chosen action (or dismiss = Test) for one flagged exercise.
 *
 * "Modify" sets deferred = true and relies on Phase 3 REG-1c
 * (computePatternLadderDecision reads deferredIds) to perform the one-rung
 * regression on the next program generation cycle.
 *
 * If the exercise is at d1 (atFloor = true), callers should not offer Modify;
 * this function treats a Modify-at-floor as Sacrifice instead, with a trace.
 */
export const applyFeedbackContractAction = (params: {
  action: FeedbackContractAction;
  exerciseId: string;
  exercisePattern?: string;
  currentSummary: ExerciseFeedbackSummary;
  currentLadderState?: LadderState;
  phase: "activation" | "skill" | "growth";
  sessionCount: number;
  atFloor?: boolean;
}): FeedbackContractResult => {
  const {
    exerciseId,
    exercisePattern,
    currentSummary,
    currentLadderState,
    phase,
    sessionCount,
    atFloor,
  } = params;

  // Dismiss is treated as Test (charitable default, §3.2 silence-is-Test).
  const effectiveAction: Exclude<FeedbackContractAction, "dismiss"> =
    params.action === "dismiss" ? "test" : params.action;

  // Modify at d1 (no lower rung) → treat as Sacrifice with a trace note.
  const resolvedAction =
    effectiveAction === "modify" && atFloor ? "sacrifice" : effectiveAction;

  switch (resolvedAction) {
    case "sacrifice": {
      const wasModifyAtFloor = effectiveAction === "modify" && atFloor;
      const updatedSummary: ExerciseFeedbackSummary = {
        ...currentSummary,
        deferred: true,
        probation: false,
        autoSacrificed: false,
        sacrificedAt: { phase, sessionCount },
      };
      const updatedLadderState = appendToSacrificedByPattern(
        currentLadderState,
        exercisePattern,
        exerciseId
      );
      return {
        updatedSummary,
        updatedLadderState,
        decisionTrace: wasModifyAtFloor
          ? `sacrifice ${exerciseId}: Modify requested at d1 floor — escalated to Sacrifice` +
            ` deferred=true, sacrificedAt={phase:${phase},sessionCount:${sessionCount}}`
          : `sacrifice ${exerciseId}: user chose Sacrifice` +
            ` — deferred=true, sacrificedAt={phase:${phase},sessionCount:${sessionCount}}`,
      };
    }

    case "test": {
      const updatedSummary: ExerciseFeedbackSummary = {
        ...currentSummary,
        probation: true,
        // Keep any existing deferred/sacrificedAt so re-prompting preserves history.
      };
      return {
        updatedSummary,
        decisionTrace:
          `test ${exerciseId}: user chose Test — probation=true; next flag triggers auto-Sacrifice`,
      };
    }

    case "modify": {
      // Phase 3 REG-1c reads the deferredIds set and regresses one rung.
      // We set deferred=true here; the next program generation cycle applies
      // the regression.  Clearing deferred after regression is Phase 3's job.
      const updatedSummary: ExerciseFeedbackSummary = {
        ...currentSummary,
        deferred: true,
        probation: false,
      };
      const prevRung = getPrevLadderRung(exerciseId);
      const ex = exerciseById(exerciseId);
      return {
        updatedSummary,
        decisionTrace:
          `modify ${exerciseId}: user chose Modify — deferred=true, Phase 3 REG-1c will` +
          ` regress to ${prevRung ?? "floor (d1)"} (${ex?.name ?? exerciseId})`,
      };
    }
  }
};

// ---------------------------------------------------------------------------
// Probation-clear helper
// ---------------------------------------------------------------------------

/**
 * Clear the probation flag when an exercise logs a clean session.
 * A "clean" session: all sets done, no pain flag, rpe ≤ 7 (or absent).
 * Callers should invoke this when processing post-session logs.
 */
export const clearProbationIfClean = (
  summary: ExerciseFeedbackSummary,
  mostRecentLog: ExerciseLog
): ExerciseFeedbackSummary => {
  if (!summary.probation) return summary;

  const setsOk =
    (mostRecentLog.setsPlanned ?? 0) > 0 &&
    (mostRecentLog.setsCompleted ?? 0) >= (mostRecentLog.setsPlanned ?? 0);
  const noPain =
    mostRecentLog.felt !== "pain" &&
    mostRecentLog.painLevel !== "severe" &&
    mostRecentLog.painLevel !== "moderate";
  const effortOk =
    mostRecentLog.rpe == null || mostRecentLog.rpe <= 7;

  if (setsOk && noPain && effortOk) {
    return { ...summary, probation: false };
  }
  return summary;
};

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Append an exerciseId to the pattern's sacrificed retest queue. */
const appendToSacrificedByPattern = (
  ladderState: LadderState | undefined,
  pattern: string | undefined,
  exerciseId: string
): LadderState | undefined => {
  if (!pattern) return ladderState;

  const existing = ladderState?.sacrificedByPattern?.[pattern] ?? [];
  // Deduplicate — don't add the same exercise twice.
  if (existing.includes(exerciseId)) return ladderState;

  return {
    byPattern: ladderState?.byPattern ?? {},
    ...ladderState,
    sacrificedByPattern: {
      ...(ladderState?.sacrificedByPattern ?? {}),
      [pattern]: [...existing, exerciseId],
    },
  };
};
