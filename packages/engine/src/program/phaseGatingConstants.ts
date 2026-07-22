/**
 * Phase 3.5 — Phase Gating Constants
 *
 * Single source of truth for all min/max session windows and criteria
 * thresholds used by the criteria-based phase gating evaluator.
 *
 * Changing any value here propagates to the evaluator and all tests
 * automatically.  Sotirios-ratified drafts (2026-07-22).
 *
 * exported from @/lib/program/phaseGatingConstants
 */

// ---------------------------------------------------------------------------
// Session window constants
// ---------------------------------------------------------------------------

export const ACTIVATION_MIN_SESSIONS = 10;
export const ACTIVATION_MAX_SESSIONS = 21;

export const SKILL_MIN_SESSIONS = 12;
export const SKILL_MAX_SESSIONS = 28;

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
