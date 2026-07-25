/**
 * Phase 3.5 — Phase Gating Constants
 *
 * Single source of truth for all min/max session windows and criteria
 * thresholds used by the criteria-based phase gating evaluator.
 *
 * Phase 6j — session floors scale with training frequency:
 *   minSessions = 8 × sessions_per_week  (~8 weeks of real training)
 *
 * exported from @/lib/program/phaseGatingConstants
 */

// ---------------------------------------------------------------------------
// Session window constants (frequency-scaled — Phase 6j)
// ---------------------------------------------------------------------------

/** Weeks of actual training required before a phase may advance. */
export const PHASE_FLOOR_WEEKS = 8;

/** Soft ceiling for Activation when criteria never clear (~12 weeks). */
export const ACTIVATION_MAX_WEEKS = 12;

/** Soft ceiling for Skill when criteria never clear (~14 weeks). */
export const SKILL_MAX_WEEKS = 14;

const normalizeSessionsPerWeek = (value: number | null | undefined): 3 | 4 | 5 => {
  const parsed = Math.floor(value ?? 3);
  return parsed === 4 || parsed === 5 ? parsed : 3;
};

/**
 * Phase 6j ratified floor: every phase lasts at least 8 weeks of real
 * training, scaled to the user's sessions_per_week.
 *
 * 3x → 24 · 4x → 32 · 5x → 40
 */
export const getPhaseMinSessions = (sessionsPerWeek: number | null | undefined): number =>
  PHASE_FLOOR_WEEKS * normalizeSessionsPerWeek(sessionsPerWeek);

/**
 * Soft max cap (still frequency-scaled). Always ≥ min so the evaluator's
 * max-reached path cannot fire before the floor.
 */
export const getPhaseMaxSessions = (
  phase: "activation" | "skill",
  sessionsPerWeek: number | null | undefined
): number => {
  const weeks = phase === "activation" ? ACTIVATION_MAX_WEEKS : SKILL_MAX_WEEKS;
  return weeks * normalizeSessionsPerWeek(sessionsPerWeek);
};

/**
 * Default-3x aliases kept for tests and call sites that have not yet
 * threaded sessionsPerWeek. Prefer getPhaseMinSessions / getPhaseMaxSessions.
 */
export const ACTIVATION_MIN_SESSIONS = getPhaseMinSessions(3);
export const ACTIVATION_MAX_SESSIONS = getPhaseMaxSessions("activation", 3);

export const SKILL_MIN_SESSIONS = getPhaseMinSessions(3);
export const SKILL_MAX_SESSIONS = getPhaseMaxSessions("skill", 3);

/**
 * Growth phase has no auto-advance ceiling — the cycle restarts at activation
 * from Phase 3's existing cycle logic.  Infinity is the intentional sentinel.
 */
export const GROWTH_MAX_SESSIONS = Infinity;

// ---------------------------------------------------------------------------
// Criteria threshold constants
// ---------------------------------------------------------------------------

/** Number of criteria that must be satisfied to advance the activation phase early. */
export const ACTIVATION_CRITERIA_REQUIRED = 3;

/** Total activation-phase criteria count. */
export const ACTIVATION_CRITERIA_TOTAL = 5;

/** Number of criteria that must be satisfied to advance the skill phase early. */
export const SKILL_CRITERIA_REQUIRED = 4;

/** Total skill-phase criteria count. */
export const SKILL_CRITERIA_TOTAL = 6;

// ---------------------------------------------------------------------------
// Per-criterion sub-thresholds
// ---------------------------------------------------------------------------

/** Activation: how many patterns must have climbed ≥1 rung since phase start. */
export const ACTIVATION_RUNGS_CLIMBED_REQUIRED = 2;

/** Activation: how many recent sessions must have been completed = "yes". */
export const ACTIVATION_CONSISTENCY_WINDOW = 5;

/** Activation: max deferred exercises allowed (strict-less-than). */
export const ACTIVATION_MAX_DEFERRED = 2;

/** Activation: how many sessions in the recent window need confidenceBand >= moderate. */
export const ACTIVATION_CONFIDENCE_REQUIRED = 3;

/** Skill: how many patterns must have climbed ≥1 rung since phase start. */
export const SKILL_RUNGS_CLIMBED_REQUIRED = 3;

/** Skill: how many recent sessions must have been completed = "yes". */
export const SKILL_CONSISTENCY_WINDOW = 7;

/** Skill: how many recent sessions to check for no pain escalation. */
export const SKILL_PAIN_TREND_WINDOW = 7;

/** Skill: how many recent sessions to check effort-band trend. */
export const SKILL_EFFORT_TREND_WINDOW = 5;

/**
 * Minimum difficulty that means "within one rung of d5".
 * d5 is the ceiling, so ≥d4 counts as "within one rung".
 */
export const SKILL_LADDER_CEILING_PROXIMITY_DIFFICULTY = 4;
