/**
 * Phase 3.5 — Phase Gating Evaluator
 *
 * Pure, deterministic evaluator for criteria-based phase transitions.
 *
 * Composition rule: this module READS Phase 3/3.2/3.3 state and WRITES only
 * GatingVerdict and PhaseTransitionState.  Zero modifications to Phase 3,
 * 3.2, or 3.3 engine logic.
 *
 * Determinism: all inputs come from persisted state/logs; no Date.now().
 * Every verdict writes a trace naming each criterion's verdict with numbers.
 *
 * @module phaseGatingEvaluator
 */

import type {
  LadderState,
  GatingCriterionResult,
  GatingVerdict,
  PhaseTransitionState,
} from "@/lib/types";
import type { TrainingIntent } from "@/lib/program/trainingIntent";
import {
  ACTIVATION_MIN_SESSIONS,
  ACTIVATION_MAX_SESSIONS,
  SKILL_MIN_SESSIONS,
  SKILL_MAX_SESSIONS,
  GROWTH_MAX_SESSIONS,
  ACTIVATION_CRITERIA_REQUIRED,
  SKILL_CRITERIA_REQUIRED,
  ACTIVATION_RUNGS_CLIMBED_REQUIRED,
  ACTIVATION_CONSISTENCY_WINDOW,
  ACTIVATION_MAX_DEFERRED,
  ACTIVATION_CONFIDENCE_REQUIRED,
  SKILL_RUNGS_CLIMBED_REQUIRED,
  SKILL_CONSISTENCY_WINDOW,
  SKILL_PAIN_TREND_WINDOW,
  SKILL_EFFORT_TREND_WINDOW,
  SKILL_LADDER_CEILING_PROXIMITY_DIFFICULTY,
} from "@/lib/program/phaseGatingConstants";

// ---------------------------------------------------------------------------
// Input types
// ---------------------------------------------------------------------------

/**
 * A lightweight per-session snapshot used by the gating evaluator.
 * Callers compute this from their persisted session records.
 * All fields are optional so callers can pass partial data safely.
 */
export type SessionSnapshot = {
  /**
   * Whether the session was fully completed.
   * "yes" = completed, "partial" / "no" = not fully done.
   */
  completed?: "yes" | "partial" | "no";
  /**
   * Highest pain signal observed during this session across all exercises.
   * Derived from ExerciseLog.painLevel.
   */
  maxPain?: "none" | "mild" | "moderate" | "severe";
  /**
   * Effort band derived from RPE (low < 4, moderate 4-7, high > 7).
   * Matches SessionFeedbackSignals.effortBand.
   */
  effortBand?: "low" | "moderate" | "high";
  /**
   * Confidence band from technique-confidence rating (1-5 scale, same bands).
   * Matches SessionFeedbackSignals.confidenceBand.
   */
  confidenceBand?: "low" | "moderate" | "high";
};

/**
 * Full input to computeReadinessVerdict.
 * Callers supply what they have; missing fields are treated conservatively
 * (unknown confidence → not counted, etc.).
 */
export type PhaseGatingInput = {
  /**
   * Current phase being evaluated.
   * Growth phase evaluates criteria for informational display only — it
   * never auto-advances (the cycle logic handles the restart).
   */
  phase: "activation" | "skill" | "growth";

  /**
   * Total sessions completed in this phase so far (inclusive of the
   * session being evaluated).
   */
  sessionsInPhase: number;

  /**
   * Per-session snapshots in chronological order (oldest first).
   * The evaluator takes the last N sessions from this slice.
   * Caller should pass all sessions for the current phase.
   */
  recentSessions: SessionSnapshot[];

  /**
   * Current ladder state — used to count rung climbs since phase start.
   * Undefined → rungs-climbed criterion treated as 0 climbs.
   */
  ladderState?: LadderState | undefined;

  /**
   * Number of rung climbs per pattern since the current phase started.
   * Derived by the caller from ladder state + phase-start rung snapshots.
   * If absent, the evaluator reads ladderState.byPattern directly and counts
   * patterns whose difficulty > the phase-start difficulty recorded in
   * ladderState (a coarser but safe approximation when per-pattern history
   * is not available).
   */
  rungsClimbedSincePhaseStart?: Record<string, number>;

  /**
   * Number of exercises currently in deferred=true state.
   * From contractStateByExercise in LogPrefs.
   */
  deferredExerciseCount?: number;

  /**
   * Whether ALL exercises from the sacrificedByPattern retest queue that
   * were sacrificed at the activation phase have been cleared (either
   * retested-and-passed or explicitly re-sacrificed).
   * Only relevant for the skill-phase "sacrifice retest" criterion.
   */
  activationSacrificeQueueCleared?: boolean;

  /**
   * Exercises eligible for the Phase 5 retest surface, computed from
   * ladderState.sacrificedByPattern.  Passed through to PhaseTransitionState
   * for the Phase 5 hook without further evaluation here.
   */
  sacrificeRetestEligible?: PhaseTransitionState["sacrificeRetestEligible"];

  /**
   * Training intent from Phase 3.3.
   * "build"    → auto-advance when unlocked.
   * "maintain" → evaluate criteria (for display), but hold; extend the
   *              Phase 3.3 maintain prompt with the readiness reason.
   * "rehab"    → max-calendar softened to Infinity; criteria informational;
   *              advancement requires explicit user request.
   */
  trainingIntent?: TrainingIntent;
};

// ---------------------------------------------------------------------------
// Private helpers
// ---------------------------------------------------------------------------

const PAIN_RANK: Record<NonNullable<SessionSnapshot["maxPain"]>, number> = {
  none: 0,
  mild: 1,
  moderate: 2,
  severe: 3,
};

const CONFIDENCE_RANK: Record<NonNullable<SessionSnapshot["confidenceBand"]>, number> = {
  low: 0,
  moderate: 1,
  high: 2,
};

/** Return the last N elements of an array, or the whole array if shorter. */
const lastN = <T>(arr: T[], n: number): T[] => arr.slice(Math.max(0, arr.length - n));

// ---------------------------------------------------------------------------
// Activation phase criteria (5 total)
// ---------------------------------------------------------------------------

function criteriaActivation(input: PhaseGatingInput): GatingCriterionResult[] {
  const { recentSessions, ladderState, rungsClimbedSincePhaseStart, deferredExerciseCount } = input;

  // ── Criterion 1: Rungs climbed ───────────────────────────────────────────
  const climbedPatterns = rungsClimbedSincePhaseStart
    ? Object.values(rungsClimbedSincePhaseStart).filter((c) => c >= 1).length
    : Object.values(ladderState?.byPattern ?? {}).filter((r) => r.difficulty >= 2).length;
  const rungsOk = climbedPatterns >= ACTIVATION_RUNGS_CLIMBED_REQUIRED;

  // ── Criterion 2: Consistency ─────────────────────────────────────────────
  const windowC = lastN(recentSessions, ACTIVATION_CONSISTENCY_WINDOW);
  const completedYes = windowC.filter((s) => s.completed === "yes").length;
  const consistencyOk = completedYes === ACTIVATION_CONSISTENCY_WINDOW;

  // ── Criterion 3: Pain signal ─────────────────────────────────────────────
  const windowP = lastN(recentSessions, ACTIVATION_CONSISTENCY_WINDOW);
  const hasSeverePain = windowP.some((s) => (PAIN_RANK[s.maxPain ?? "none"]) >= PAIN_RANK["severe"]);
  const painOk = !hasSeverePain;

  // ── Criterion 4: Sacrifice load ──────────────────────────────────────────
  const deferred = deferredExerciseCount ?? 0;
  const sacrificeOk = deferred < ACTIVATION_MAX_DEFERRED;

  // ── Criterion 5: Confidence ──────────────────────────────────────────────
  const windowConf = lastN(recentSessions, ACTIVATION_CONSISTENCY_WINDOW);
  const confSessions = windowConf.filter(
    (s) => s.confidenceBand !== undefined && CONFIDENCE_RANK[s.confidenceBand] >= CONFIDENCE_RANK["moderate"]
  ).length;
  const confidenceOk = confSessions >= ACTIVATION_CONFIDENCE_REQUIRED;

  return [
    {
      criterion: "rungs_climbed",
      satisfied: rungsOk,
      reason: `rungs climbed: ${climbedPatterns}/${ACTIVATION_RUNGS_CLIMBED_REQUIRED} patterns`,
    },
    {
      criterion: "consistency",
      satisfied: consistencyOk,
      reason: `consistency: ${completedYes}/${ACTIVATION_CONSISTENCY_WINDOW} sessions completed`,
    },
    {
      criterion: "pain_signal",
      satisfied: painOk,
      reason: painOk
        ? `no severe pain in last ${ACTIVATION_CONSISTENCY_WINDOW} sessions`
        : `severe pain found in last ${ACTIVATION_CONSISTENCY_WINDOW} sessions`,
    },
    {
      criterion: "sacrifice_load",
      satisfied: sacrificeOk,
      reason: `deferred count: ${deferred} (max ${ACTIVATION_MAX_DEFERRED - 1})`,
    },
    {
      criterion: "confidence",
      satisfied: confidenceOk,
      reason: `confidence ≥moderate: ${confSessions}/${ACTIVATION_CRITERIA_REQUIRED} of last ${ACTIVATION_CONSISTENCY_WINDOW}`,
    },
  ];
}

// ---------------------------------------------------------------------------
// Skill phase criteria (6 total)
// ---------------------------------------------------------------------------

function criteriaSkill(input: PhaseGatingInput): GatingCriterionResult[] {
  const {
    recentSessions,
    ladderState,
    rungsClimbedSincePhaseStart,
    activationSacrificeQueueCleared,
  } = input;

  // ── Criterion 1: Rungs climbed ───────────────────────────────────────────
  const climbedPatterns = rungsClimbedSincePhaseStart
    ? Object.values(rungsClimbedSincePhaseStart).filter((c) => c >= 1).length
    : Object.values(ladderState?.byPattern ?? {}).filter((r) => r.difficulty >= 2).length;
  const rungsOk = climbedPatterns >= SKILL_RUNGS_CLIMBED_REQUIRED;

  // ── Criterion 2: Consistency ─────────────────────────────────────────────
  const windowC = lastN(recentSessions, SKILL_CONSISTENCY_WINDOW);
  const completedYes = windowC.filter((s) => s.completed === "yes").length;
  const consistencyOk = completedYes === SKILL_CONSISTENCY_WINDOW;

  // ── Criterion 3: Pain trend ──────────────────────────────────────────────
  // No escalation: moderate→severe or mild→moderate in last 7 sessions.
  const windowPain = lastN(recentSessions, SKILL_PAIN_TREND_WINDOW);
  let painEscalated = false;
  for (let i = 1; i < windowPain.length; i++) {
    const prev = PAIN_RANK[windowPain[i - 1]!.maxPain ?? "none"];
    const curr = PAIN_RANK[windowPain[i]!.maxPain ?? "none"];
    if (curr > prev && curr >= PAIN_RANK["moderate"]) {
      painEscalated = true;
      break;
    }
  }
  const painTrendOk = !painEscalated;

  // ── Criterion 4: Sacrifice retest queue cleared ──────────────────────────
  const retestOk = activationSacrificeQueueCleared === true;

  // ── Criterion 5: Effort trend ────────────────────────────────────────────
  // Last 5 sessions should NOT be trending upward (i.e. not all high effort).
  // "trending upward" = every session in window is "high".
  const windowEffort = lastN(recentSessions, SKILL_EFFORT_TREND_WINDOW);
  const allHighEffort =
    windowEffort.length >= SKILL_EFFORT_TREND_WINDOW &&
    windowEffort.every((s) => s.effortBand === "high");
  const effortOk = !allHighEffort;

  // ── Criterion 6: Ladder ceiling proximity ───────────────────────────────
  const patternsNearCeiling = Object.values(ladderState?.byPattern ?? {}).filter(
    (r) => r.difficulty >= SKILL_LADDER_CEILING_PROXIMITY_DIFFICULTY
  ).length;
  const ceilingOk = patternsNearCeiling >= 1;

  return [
    {
      criterion: "rungs_climbed",
      satisfied: rungsOk,
      reason: `rungs climbed: ${climbedPatterns}/${SKILL_RUNGS_CLIMBED_REQUIRED} patterns`,
    },
    {
      criterion: "consistency",
      satisfied: consistencyOk,
      reason: `consistency: ${completedYes}/${SKILL_CONSISTENCY_WINDOW} sessions completed`,
    },
    {
      criterion: "pain_trend",
      satisfied: painTrendOk,
      reason: painTrendOk
        ? `no pain escalation in last ${SKILL_PAIN_TREND_WINDOW} sessions`
        : `pain escalated in last ${SKILL_PAIN_TREND_WINDOW} sessions`,
    },
    {
      criterion: "sacrifice_retest",
      satisfied: retestOk,
      reason: retestOk
        ? "activation sacrifice queue cleared"
        : "activation sacrifice queue not fully cleared",
    },
    {
      criterion: "effort_trend",
      satisfied: effortOk,
      reason: effortOk
        ? `effort not trending upward (not all-high in last ${SKILL_EFFORT_TREND_WINDOW})`
        : `effort trending upward: all ${SKILL_EFFORT_TREND_WINDOW} recent sessions high`,
    },
    {
      criterion: "ladder_ceiling_proximity",
      satisfied: ceilingOk,
      reason: `patterns at d${SKILL_LADDER_CEILING_PROXIMITY_DIFFICULTY}+: ${patternsNearCeiling}`,
    },
  ];
}

// ---------------------------------------------------------------------------
// Trace builder
// ---------------------------------------------------------------------------

function buildTrace(params: {
  phase: "activation" | "skill" | "growth";
  sessionsInPhase: number;
  minSessions: number;
  maxSessions: number;
  criteriaResults: GatingCriterionResult[];
  satisfiedCount: number;
  requiredCount: number;
  verdict: "advance" | "hold";
  reason: GatingVerdict["reason"];
  trainingIntent?: TrainingIntent;
}): string {
  const {
    phase,
    sessionsInPhase,
    minSessions,
    maxSessions,
    criteriaResults,
    satisfiedCount,
    requiredCount,
    verdict,
    reason,
    trainingIntent,
  } = params;

  const criteriaLine = criteriaResults
    .map((c) => `${c.criterion} ${c.satisfied ? "✓" : "✗"} (${c.reason})`)
    .join(", ");

  const intentSuffix =
    trainingIntent === "maintain"
      ? " — maintain intent: hold despite criteria met"
      : trainingIntent === "rehab"
        ? " — rehab intent: advance requires explicit request"
        : "";

  let verdictLine: string;
  switch (reason) {
    case "criteria_met":
      verdictLine = `advance ${phase}: ${criteriaLine} — ${satisfiedCount}/${requiredCount} criteria met, min ${sessionsInPhase}/${minSessions} sessions passed${intentSuffix}`;
      break;
    case "max_reached":
      verdictLine = `advance ${phase} (max reached): ${sessionsInPhase}/${maxSessions} sessions — ${criteriaLine}${intentSuffix}`;
      break;
    case "min_not_reached":
      verdictLine = `hold ${phase}: min ${sessionsInPhase}/${minSessions} sessions not yet passed — ${criteriaLine}${intentSuffix}`;
      break;
    default:
      verdictLine = `hold ${phase}: ${satisfiedCount}/${requiredCount} criteria met — ${criteriaLine}, ${sessionsInPhase} sessions in phase${intentSuffix}`;
  }

  return verdictLine;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Core evaluator: given a snapshot of state and session history, return a
 * verdict on whether the phase should advance.
 *
 * This is a pure function — same inputs always produce the same output.
 * No side effects, no Date.now().
 */
export const computeReadinessVerdict = (input: PhaseGatingInput): GatingVerdict => {
  const {
    phase,
    sessionsInPhase,
    trainingIntent = "build",
  } = input;

  // Growth phase: no auto-advance.
  if (phase === "growth") {
    return {
      verdict: "hold",
      reason: "criteria_unmet",
      criteriaResults: [],
      satisfiedCount: 0,
      requiredCount: 0,
      trace: `hold growth: growth phase has no auto-advance ceiling — cycle restarts via Phase 3 cycle logic`,
    };
  }

  const minSessions = phase === "activation" ? ACTIVATION_MIN_SESSIONS : SKILL_MIN_SESSIONS;
  const maxSessions =
    trainingIntent === "rehab"
      ? Infinity
      : phase === "activation"
        ? ACTIVATION_MAX_SESSIONS
        : SKILL_MAX_SESSIONS;
  const requiredCount =
    phase === "activation" ? ACTIVATION_CRITERIA_REQUIRED : SKILL_CRITERIA_REQUIRED;

  const criteriaResults =
    phase === "activation" ? criteriaActivation(input) : criteriaSkill(input);
  const satisfiedCount = criteriaResults.filter((c) => c.satisfied).length;

  // Maximum ceiling: always advance (except rehab, which softens to Infinity).
  if (sessionsInPhase >= maxSessions) {
    const trace = buildTrace({
      phase,
      sessionsInPhase,
      minSessions,
      maxSessions,
      criteriaResults,
      satisfiedCount,
      requiredCount,
      verdict: "advance",
      reason: "max_reached",
      trainingIntent,
    });
    return { verdict: "advance", reason: "max_reached", criteriaResults, satisfiedCount, requiredCount, trace };
  }

  // Minimum not yet passed: always hold.
  if (sessionsInPhase < minSessions) {
    const trace = buildTrace({
      phase,
      sessionsInPhase,
      minSessions,
      maxSessions,
      criteriaResults,
      satisfiedCount,
      requiredCount,
      verdict: "hold",
      reason: "min_not_reached",
      trainingIntent,
    });
    return { verdict: "hold", reason: "min_not_reached", criteriaResults, satisfiedCount, requiredCount, trace };
  }

  // Criteria check.
  const criteriaMetForAdvance = satisfiedCount >= requiredCount;

  // Maintain: criteria evaluated but auto-advance disabled.
  // Rehab: criteria informational only; advancement never auto.
  const autoAdvanceBlocked =
    trainingIntent === "maintain" || trainingIntent === "rehab";

  const verdict: "advance" | "hold" =
    criteriaMetForAdvance && !autoAdvanceBlocked ? "advance" : "hold";
  const reason: GatingVerdict["reason"] =
    !criteriaMetForAdvance
      ? "criteria_unmet"
      : autoAdvanceBlocked
        ? "criteria_unmet"
        : "criteria_met";

  const trace = buildTrace({
    phase,
    sessionsInPhase,
    minSessions,
    maxSessions,
    criteriaResults,
    satisfiedCount,
    requiredCount,
    verdict,
    reason,
    trainingIntent,
  });

  return { verdict, reason, criteriaResults, satisfiedCount, requiredCount, trace };
};

// ---------------------------------------------------------------------------
// PhaseTransitionState builder
// ---------------------------------------------------------------------------

/**
 * Build the persisted PhaseTransitionState from a verdict.
 *
 * Called at the session boundary after computeReadinessVerdict().
 * Merges with any prior state to preserve eligibleAt / unlockedAt.
 */
export const buildPhaseTransitionState = (params: {
  verdict: GatingVerdict;
  input: PhaseGatingInput;
  priorState?: PhaseTransitionState;
}): PhaseTransitionState => {
  const { verdict, input, priorState } = params;

  const eligibleAt: number | undefined =
    priorState?.eligibleAt ??
    (verdict.reason === "criteria_met" ? input.sessionsInPhase : undefined);

  const unlockedAt: number | undefined =
    priorState?.unlockedAt ??
    (verdict.verdict === "advance" ? input.sessionsInPhase : undefined);

  // Wire Phase 5 sacrifice-retest hook at every phase transition.
  const sacrificeRetestEligible: PhaseTransitionState["sacrificeRetestEligible"] =
    verdict.verdict === "advance"
      ? (input.sacrificeRetestEligible ?? buildSacrificeRetestFromLadder(input))
      : (priorState?.sacrificeRetestEligible ?? []);

  return {
    phase: input.phase,
    sessionsInPhase: input.sessionsInPhase,
    criteriaLastEvaluated: verdict.criteriaResults,
    eligibleAt,
    unlockedAt,
    lastTrace: verdict.trace,
    sacrificeRetestEligible,
  };
};

/**
 * Derive sacrifice-retest candidates from ladderState.sacrificedByPattern.
 * Falls back to empty array when no ladder state is available.
 */
function buildSacrificeRetestFromLadder(
  input: PhaseGatingInput
): PhaseTransitionState["sacrificeRetestEligible"] {
  if (!input.ladderState?.sacrificedByPattern) return [];
  const result: NonNullable<PhaseTransitionState["sacrificeRetestEligible"]> = [];
  for (const [, exerciseIds] of Object.entries(input.ladderState.sacrificedByPattern)) {
    for (const exerciseId of exerciseIds) {
      result.push({
        exerciseId,
        sacrificedAtPhase: input.phase,
        trace: `sacrifice retest eligible: ${exerciseId} — sacrificed at ${input.phase}`,
      });
    }
  }
  return result;
}
