/**
 * Phase 3 — Ladder Advancement Engine
 *
 * Pure, deterministic functions for computing per-pattern ladder decisions
 * (advance / hold / regress) from persisted ExerciseLogs.
 *
 * Design principles:
 *  - TRC-1: No Date.now() anywhere; all timestamps come from log.createdAt.
 *  - IND-1: Every pattern is evaluated independently.
 *  - REG-2: After a regression, hysteresis raises requiredForAdvance to 3.
 *  - ADV-4: At difficulty 5 (ceiling) the decision is always "hold"; load/rep
 *            progression is handled by progression.ts.
 *  - VAR-1: Callers must constrain variation rotation to getLadderSwapSet(exerciseId).
 *
 * ED-3.1 (Phase 3 constants ratified by Sotirios):
 *  - requiredForAdvance = 2 (3 after hysteresis)
 *  - Pain flag threshold: felt === "pain" OR painLevel === "moderate" | "severe"
 *  - Effort threshold: rpe ≤ 7 (moderate) OR absent (satisfies per 3.8)
 *  - Confidence threshold: absent satisfies per 3.8
 */

import { exercises, exerciseById } from "@/lib/exercises";
import type { Equipment } from "@/lib/equipment";
import type { ExerciseLog, LadderRungState, LadderState } from "@/lib/types";

/** Canonical Phase-3 main patterns eligible for ladder tracking (IND-1). */
export const LADDER_MAIN_PATTERNS = new Set([
  "horizontal_pull",
  "vertical_pull",
  "horizontal_push",
  "vertical_push",
  "knee_dominant",
  "hinge",
  "core_stability",
]);

// ---------------------------------------------------------------------------
// Ladder walk utilities
// ---------------------------------------------------------------------------

/**
 * Return the exercise ID one rung harder than the given exercise (advance
 * direction), within the same pattern.  Returns null at ceiling (d5).
 */
export const getNextLadderRung = (exerciseId: string): string | null => {
  const current = exerciseById(exerciseId);
  if (!current?.pattern) return null;
  const next = exercises.find(
    (ex) => ex.progressionOf === exerciseId && ex.pattern === current.pattern
  );
  return next?.id ?? null;
};

/**
 * Return the exercise ID one rung easier than the given exercise (regress
 * direction), within the same pattern.  Returns null at floor.
 *
 * The data model uses `progressionOf` to encode the chain: if exercise B has
 * `progressionOf === A`, then A is the predecessor (easier) rung and B is the
 * successor (harder) rung.  So the predecessor of B is A = B.progressionOf.
 * (The `regressionOf` field means "this exercise is the regression-form OF
 * a harder exercise" — it points UP the chain, not down.)
 */
export const getPrevLadderRung = (exerciseId: string): string | null => {
  const current = exerciseById(exerciseId);
  if (!current?.progressionOf) return null;
  const prev = exerciseById(current.progressionOf);
  // Respect pattern boundary — don't regress across patterns.
  if (!prev || prev.pattern !== current.pattern) return null;
  return prev.id;
};

/**
 * Find the d1 root exercise for a pattern (lowest difficulty level that has
 * category === "main" and the matching pattern).
 */
export const findD1RootForPattern = (pattern: string): string | null => {
  const candidates = exercises
    .filter(
      (ex) =>
        ex.pattern === pattern &&
        ex.category === "main" &&
        (ex.difficulty ?? 99) === 1
    )
    .sort((a, b) => a.id.localeCompare(b.id)); // deterministic sort
  return candidates[0]?.id ?? null;
};

/**
 * The VAR-1 allowed set: {currentRung ∪ currentRung.swapOptions}.
 *
 * Adjacent ladder rungs are always excluded even if they happen to appear in
 * `swapOptions` (catalog cross-contamination).  This enforces VAR-1 — never
 * let variation memory rotate to a different difficulty rung.
 */
export const getLadderSwapSet = (exerciseId: string): Set<string> => {
  const ex = exerciseById(exerciseId);
  const nextRung = getNextLadderRung(exerciseId);
  const prevRung = getPrevLadderRung(exerciseId);
  const result = new Set<string>([exerciseId]);
  (ex?.swapOptions ?? []).forEach((id) => {
    if (id !== nextRung && id !== prevRung) result.add(id);
  });
  return result;
};

// ---------------------------------------------------------------------------
// Session-level clean/regression classification (TRC-1: no Date.now)
// ---------------------------------------------------------------------------

/**
 * A session log is "clean" when all of:
 *  - All planned sets completed.
 *  - No pain flag (felt !== "pain" AND painLevel ∉ {"moderate","severe"}).
 *  - Effort ≤ moderate: rpe ≤ 7 OR absent (absent satisfies per 3.8).
 * Confidence threshold (3.8): absent value always satisfies — no check needed.
 */
export const isCleanSessionLog = (log: ExerciseLog): boolean => {
  const setsPlanned = log.setsPlanned ?? 0;
  const setsCompleted = log.setsCompleted ?? 0;
  const allSetsDone = setsPlanned > 0 && setsCompleted >= setsPlanned;
  if (!allSetsDone) return false;

  const hasPainFlag =
    log.felt === "pain" ||
    log.painLevel === "severe" ||
    log.painLevel === "moderate";
  if (hasPainFlag) return false;

  const rpe = log.rpe;
  const effortOk = rpe === null || rpe === undefined || rpe <= 7;
  return effortOk;
};

/**
 * A log is a regression trigger when it carries a pain signal (REG-1a).
 * Two consecutive incomplete sessions (REG-1b) are checked separately.
 */
export const isRegressionTriggerLog = (log: ExerciseLog): boolean =>
  log.felt === "pain" || log.painLevel === "severe" || log.painLevel === "moderate";

// ---------------------------------------------------------------------------
// Next-rung eligibility check (ADV-2)
// ---------------------------------------------------------------------------

const PHASE_ORDER: Record<string, number> = {
  activation: 1,
  skill: 2,
  growth: 3,
};

const EXPERIENCE_ORDER: Record<string, number> = {
  Beginner: 1,
  Intermediate: 2,
  Advanced: 3,
};

type NextRungEligibility = { eligible: boolean; blockedBy: string | null };

const checkNextRungEligibility = (params: {
  exerciseId: string;
  available: Set<Equipment>;
  phaseIndex: number; // 0-based (1=activation,2=skill,3=growth)
  experienceLevel: string;
  painAreas: string[];
  deferredIds: Set<string>;
}): NextRungEligibility => {
  const ex = exerciseById(params.exerciseId);
  if (!ex) return { eligible: false, blockedBy: "exercise not found" };

  // Equipment: at least one piece of equipment must be available if any listed
  if (ex.equipment.length > 0) {
    const hasEquipment = ex.equipment.some((eq) =>
      params.available.has(eq as Equipment)
    );
    if (!hasEquipment) return { eligible: false, blockedBy: "equipment" };
  }

  // Phase min (phaseMin field uses activation/skill/growth labels)
  if (ex.phaseMin) {
    const minPhaseOrder = PHASE_ORDER[ex.phaseMin] ?? 1;
    const currentPhaseOrder = params.phaseIndex + 1; // 1-indexed
    if (currentPhaseOrder < minPhaseOrder) {
      return { eligible: false, blockedBy: "phase" };
    }
  }

  // Experience min
  if (ex.experienceMin) {
    const minExp = EXPERIENCE_ORDER[ex.experienceMin] ?? 1;
    const userExp = EXPERIENCE_ORDER[params.experienceLevel] ?? 1;
    if (userExp < minExp) return { eligible: false, blockedBy: "experience" };
  }

  // Contraindications
  if (
    ex.painContraindications?.some((c) => params.painAreas.includes(c))
  ) {
    return { eligible: false, blockedBy: "contraindication" };
  }

  // Deferred (set by Phase 3.2 Sacrifice/Test/Modify)
  if (params.deferredIds.has(params.exerciseId)) {
    return { eligible: false, blockedBy: "deferred" };
  }

  return { eligible: true, blockedBy: null };
};

// ---------------------------------------------------------------------------
// Per-pattern decision (core logic)
// ---------------------------------------------------------------------------

export type LadderDecisionKind = "advance" | "hold" | "regress";

export type LadderDecision = {
  kind: LadderDecisionKind;
  newExerciseId: string;
  newDifficulty: number;
  cleanSessionsCount: number;
  requiredForAdvance: number;
  inHysteresis: boolean;
  trace: string;
};

/**
 * Compute the ladder decision for a single pattern at a cycle/phase boundary.
 *
 * recentLogs must be ordered chronologically ascending (oldest first).
 * All are pre-filtered to exclude deleted logs by the caller.
 */
export const computePatternLadderDecision = (params: {
  currentState: LadderRungState;
  /** All available logs for the current rung exercise, oldest-first. */
  exerciseLogs: ExerciseLog[];
  available: Set<Equipment>;
  phaseIndex: number;
  experienceLevel: string;
  painAreas: string[];
  deferredIds: Set<string>;
  /**
   * Phase 3.3 — Training intent for this user.
   *   "build"    default; existing logic unchanged.
   *   "maintain" advance → hold (criteria still evaluated and traced).
   *   "rehab"    advance blocked unless explicitAdvanceRequested = true;
   *              hysteresis 3 → 5 clean sessions.
   */
  trainingIntent?: "build" | "maintain" | "rehab";
  /**
   * Phase 3.3 — Set by user's explicit "Yes, let's progress" response to the
   * maintain phase-transition prompt, or the "I'm ready" action in rehab mode.
   * Permits one advancement attempt; cleared by the caller after it's consumed.
   */
  explicitAdvanceRequested?: boolean;
}): LadderDecision => {
  const {
    currentState,
    exerciseLogs,
    available,
    phaseIndex,
    experienceLevel,
    painAreas,
    deferredIds,
    trainingIntent = "build",
    explicitAdvanceRequested = false,
  } = params;
  const { exerciseId, pattern, difficulty } = currentState;

  // ── REG-1c: user chose "Modify" in Phase 3.2 → regress ───────────────────
  // Checked BEFORE the "no logs" early-exit because it is user-driven state,
  // not log-derived.  Phase 3.2 sets deferred=true; this reads it immediately.
  const isModified = deferredIds.has(exerciseId);

  // ── No logs → hold (unless REG-1c is active) ─────────────────────────────
  if (exerciseLogs.length === 0 && !isModified) {
    return {
      kind: "hold",
      newExerciseId: exerciseId,
      newDifficulty: difficulty,
      cleanSessionsCount: currentState.cleanSessionsCount,
      requiredForAdvance: currentState.requiredForAdvance,
      inHysteresis: currentState.inHysteresis,
      trace: `hold ${pattern}: no recent logs`,
    };
  }

  // ── REG-1a: any pain flag in last 2 logs → regress ───────────────────────
  const lastTwo = exerciseLogs.slice(-2);
  const hasPainFlag = lastTwo.some(isRegressionTriggerLog);

  // ── REG-1b: two consecutive incomplete sessions → regress ─────────────────
  const hasTwoConsecutiveIncomplete =
    lastTwo.length >= 2 &&
    lastTwo.every((log) => (log.setsCompleted ?? 0) < (log.setsPlanned ?? 0));

  if (hasPainFlag || hasTwoConsecutiveIncomplete || isModified) {
    const prevId = getPrevLadderRung(exerciseId);
    const regressTarget = prevId ?? exerciseId; // never below d1
    const regressEx = exerciseById(regressTarget);
    const regressDiff = regressEx?.difficulty ?? difficulty;
    const reason = hasPainFlag
      ? "pain flag"
      : hasTwoConsecutiveIncomplete
      ? "two consecutive incomplete sessions"
      : "deferred by user (Modify)";
    // Phase 3.3 rehab: extended hysteresis (5 clean sessions vs normal 3).
    const regressHysteresis = trainingIntent === "rehab" ? 5 : 3;
    return {
      kind: "regress",
      newExerciseId: regressTarget,
      newDifficulty: regressDiff,
      cleanSessionsCount: 0,
      requiredForAdvance: regressHysteresis,
      inHysteresis: true,
      trace: `regress ${pattern}: ${reason} → ${regressTarget} (d${regressDiff})${trainingIntent === "rehab" ? "; rehab mode: 5-session hysteresis" : ""}`,
    };
  }

  // ── Count trailing clean session streak ──────────────────────────────────
  let cleanStreak = 0;
  for (let i = exerciseLogs.length - 1; i >= 0; i--) {
    if (isCleanSessionLog(exerciseLogs[i])) {
      cleanStreak++;
    } else {
      break; // any non-clean breaks the streak
    }
  }

  // Accumulate: prior clean count + new streak (capped at 0 minimum)
  const totalClean = Math.max(0, currentState.cleanSessionsCount) + cleanStreak;
  const required = currentState.requiredForAdvance;

  // ── Insufficient clean sessions → hold ───────────────────────────────────
  if (totalClean < required) {
    return {
      kind: "hold",
      newExerciseId: exerciseId,
      newDifficulty: difficulty,
      cleanSessionsCount: totalClean,
      requiredForAdvance: required,
      inHysteresis: currentState.inHysteresis,
      trace: `hold ${pattern}: ${totalClean}/${required} clean sessions at ${exerciseId} (d${difficulty})`,
    };
  }

  // ── ADV-4: at ceiling (no next rung) → hold, progression via load/rep ────
  const nextId = getNextLadderRung(exerciseId);
  if (!nextId) {
    return {
      kind: "hold",
      newExerciseId: exerciseId,
      newDifficulty: difficulty,
      cleanSessionsCount: totalClean,
      requiredForAdvance: required,
      inHysteresis: false,
      trace: `hold ${pattern}: ceiling at d${difficulty} (${exerciseId}); progression via load/rep`,
    };
  }

  // ── ADV-2: next rung eligibility check ───────────────────────────────────
  const nextEx = exerciseById(nextId);
  const { eligible, blockedBy } = checkNextRungEligibility({
    exerciseId: nextId,
    available,
    phaseIndex,
    experienceLevel,
    painAreas,
    deferredIds,
  });

  if (!eligible) {
    const traceMsg =
      blockedBy === "equipment"
        ? `hold ${pattern}: advance blocked: equipment (${nextId}); offer same-difficulty swap in accessible track`
        : `hold ${pattern}: advance blocked: ${blockedBy ?? "unknown"} (${nextId})`;
    return {
      kind: "hold",
      newExerciseId: exerciseId,
      newDifficulty: difficulty,
      cleanSessionsCount: totalClean,
      requiredForAdvance: required,
      inHysteresis: false,
      trace: traceMsg,
    };
  }

  // ── Phase 3.3: maintain mode — criteria met but user prefers no progression ──
  if (trainingIntent === "maintain" && !explicitAdvanceRequested) {
    return {
      kind: "hold",
      newExerciseId: exerciseId,
      newDifficulty: difficulty,
      cleanSessionsCount: totalClean,
      requiredForAdvance: required,
      inHysteresis: false,
      trace: `maintain intent: advancement criteria met for ${pattern}; holding by user preference`,
    };
  }

  // ── Phase 3.3: rehab mode — advance blocked without explicit request ────────
  if (trainingIntent === "rehab" && !explicitAdvanceRequested) {
    return {
      kind: "hold",
      newExerciseId: exerciseId,
      newDifficulty: difficulty,
      cleanSessionsCount: totalClean,
      requiredForAdvance: required,
      inHysteresis: currentState.inHysteresis,
      trace: `rehab intent: ${pattern} advancement criteria met; awaiting explicit user request to progress`,
    };
  }

  // ── ADV-1: advance one rung ───────────────────────────────────────────────
  const nextDiff = nextEx?.difficulty ?? difficulty + 1;
  return {
    kind: "advance",
    newExerciseId: nextId,
    newDifficulty: nextDiff,
    cleanSessionsCount: 0, // ADV-3: start at bottom of rep range on new rung
    requiredForAdvance: 2,
    inHysteresis: false,
    trace: `advance ${pattern}: ${totalClean}/${required} clean sessions → ${nextId} (d${nextDiff})${explicitAdvanceRequested ? " (explicit user request)" : ""}`,
  };
};

// ---------------------------------------------------------------------------
// Full LadderState computation (entry point)
// ---------------------------------------------------------------------------

/**
 * Compute the new LadderState at a cycle/phase boundary.
 *
 * Patterns with no `currentLadderState` entry are initialized from
 * `patternToInitExercise` (the questionnaire-chosen exercise for that
 * pattern) or from the d1 root if no choice was made.
 */
export const computeLadderState = (params: {
  currentLadderState?: LadderState;
  /** All recent exercise logs, unfiltered. */
  recentLogs: ExerciseLog[];
  /** Patterns to evaluate (subset of LADDER_MAIN_PATTERNS). */
  activePatterns: string[];
  /**
   * For initialization: map of pattern → exerciseId that the user selected
   * in the questionnaire.  May be partial or empty.
   */
  patternToInitExercise: Record<string, string>;
  available: Set<Equipment>;
  phaseIndex: number;
  experienceLevel: string;
  painAreas: string[];
  /** Set of exerciseIds that have deferred===true in feedbackSummaryByExercise. */
  deferredIds: Set<string>;
  /**
   * Phase 3.3 — user's training intent.  Forwarded to computePatternLadderDecision.
   * Defaults to "build" (existing behavior) when absent.
   */
  trainingIntent?: "build" | "maintain" | "rehab";
  /**
   * Phase 5 — Total session count at the time of this computation.
   * Written into rungAdvancementHistory records.  Optional for backwards
   * compatibility; defaults to 0 when absent.
   */
  sessionCount?: number;
}): LadderState => {
  const {
    currentLadderState,
    recentLogs,
    activePatterns,
    patternToInitExercise,
    available,
    phaseIndex,
    experienceLevel,
    painAreas,
    deferredIds,
    trainingIntent = "build",
    sessionCount = 0,
  } = params;

  const byPattern: Record<string, LadderRungState> = {};
  // Phase 5 — collect advancement records for history append.
  const newAdvancementRecords: import("@/lib/types").RungAdvancementRecord[] = [];

  const sortedLogs = recentLogs
    .filter((log) => !log.deletedAt)
    .sort((a, b) => {
      const ca = a.createdAt ?? "";
      const cb = b.createdAt ?? "";
      return ca.localeCompare(cb);
    });

  for (const pattern of activePatterns) {
    const existing = currentLadderState?.byPattern[pattern];

    if (!existing) {
      // First-time initialization
      const initId =
        patternToInitExercise[pattern] ?? findD1RootForPattern(pattern);
      if (!initId) continue;
      const ex = exerciseById(initId);
      byPattern[pattern] = {
        exerciseId: initId,
        pattern,
        difficulty: ex?.difficulty ?? 1,
        cleanSessionsCount: 0,
        requiredForAdvance: 2,
        inHysteresis: false,
        lastDecisionTrace: `init ${pattern}: ${initId} (d${ex?.difficulty ?? 1})`,
      };
      continue;
    }

    // Filter logs for the current rung exercise only
    const exerciseLogs = sortedLogs.filter(
      (log) => log.exerciseId === existing.exerciseId
    );

    // Phase 3.3: check for per-pattern progression override / explicit advance.
    const explicitAdvanceRequested =
      currentLadderState?.explicitAdvanceRequestedByPattern?.[pattern] === true ||
      currentLadderState?.progressionOverrideByPattern?.[pattern] === "build";

    const decision = computePatternLadderDecision({
      currentState: existing,
      exerciseLogs,
      available,
      phaseIndex,
      experienceLevel,
      painAreas,
      deferredIds,
      trainingIntent,
      explicitAdvanceRequested,
    });

    byPattern[pattern] = {
      exerciseId: decision.newExerciseId,
      pattern,
      difficulty: decision.newDifficulty,
      cleanSessionsCount: decision.cleanSessionsCount,
      requiredForAdvance: decision.requiredForAdvance,
      inHysteresis: decision.inHysteresis,
      lastDecisionTrace: decision.trace,
    };

    // Phase 5 — record the advance in history.
    if (decision.kind === "advance" && existing) {
      newAdvancementRecords.push({
        pattern,
        fromExerciseId: existing.exerciseId,
        fromDifficulty: existing.difficulty,
        toExerciseId: decision.newExerciseId,
        toDifficulty: decision.newDifficulty,
        atSessionCount: sessionCount,
        atPhase: phaseIndex,
        trace: decision.trace,
      });
    }
  }

  // Carry forward Phase 3.2 state (sacrificedByPattern, etc.) unchanged.
  // Clear any per-pattern explicit advance flags that were just consumed
  // (the advance opportunity was taken; don't persist the request).
  const clearedOverrides = Object.fromEntries(
    Object.entries(currentLadderState?.progressionOverrideByPattern ?? {}).filter(
      ([pat]) => byPattern[pat]?.lastDecisionTrace?.includes("advance") !== true
    )
  ) as Record<string, "build">;
  const clearedExplicit = Object.fromEntries(
    Object.entries(currentLadderState?.explicitAdvanceRequestedByPattern ?? {}).filter(
      ([pat]) => byPattern[pat]?.lastDecisionTrace?.includes("advance") !== true
    )
  );

  return {
    byPattern,
    sacrificedByPattern: currentLadderState?.sacrificedByPattern,
    progressionOverrideByPattern:
      Object.keys(clearedOverrides).length > 0 ? clearedOverrides : undefined,
    explicitAdvanceRequestedByPattern:
      Object.keys(clearedExplicit).length > 0 ? clearedExplicit : undefined,
    maintainPromptShownAtPhase: currentLadderState?.maintainPromptShownAtPhase,
    // Phase 5: carry forward existing history and append new advances.
    rungAdvancementHistory:
      newAdvancementRecords.length > 0
        ? [...(currentLadderState?.rungAdvancementHistory ?? []), ...newAdvancementRecords]
        : currentLadderState?.rungAdvancementHistory,
  };
};

// ---------------------------------------------------------------------------
// UI helper — session screen rung message
// ---------------------------------------------------------------------------

/**
 * Produce the concise "what earns the next rung" message for the session
 * screen.  Read-only; no user actions on this surface in Phase 3.
 *
 * Examples:
 *   "2 clean sessions away from Dumbbell RDL."
 *   "Ready to advance → Barbell RDL next week."
 *   "At ceiling for this movement — progressing via load and reps."
 */
export const getLadderProgressionMessage = (
  exerciseId: string,
  cleanSessionsCount: number,
  requiredForAdvance: number
): string => {
  const nextId = getNextLadderRung(exerciseId);
  if (!nextId) {
    return "At ceiling for this movement — progressing via load and reps.";
  }
  const nextEx = exerciseById(nextId);
  if (!nextEx) {
    return "At ceiling for this movement — progressing via load and reps.";
  }
  const remaining = Math.max(0, requiredForAdvance - cleanSessionsCount);
  if (remaining === 0) {
    return `Ready to advance \u2192 ${nextEx.name} next week.`;
  }
  return `${remaining} clean session${remaining === 1 ? "" : "s"} away from ${nextEx.name}.`;
};
