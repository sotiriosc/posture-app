/**
 * Golden-anchor persona fixtures — single source of truth.
 *
 * These factories build the *complete seedable state* for personas that the
 * golden-anchor suite already exercises. The golden anchor tests import and
 * call them (so the anchors keep guarding the exact fixture bytes), and the
 * dev-only "Seed persona" tool imports the same factories, so what a persona
 * "means" is defined in exactly one place.
 *
 * Rules for this file (per dev-tools/persona-fixtures work order):
 * - Factories are DETERMINISTIC: no Date.now(), no random UUIDs, no per-call
 *   variance. Same call = same bytes every time.
 * - A factory only exists here if the golden anchors actually built a complete
 *   seedable state for it. Personas whose story needs state the anchors never
 *   built are NOT faked here — they are logged in docs/persona-fixture-gaps.md.
 * - Imports are filesystem-relative (../../src/*) so this file resolves
 *   identically under engine vitest, the consumer build, and the gyms build.
 */

import type {
  Program,
  ExerciseLog,
  RungAdvancementRecord,
  PhaseTransitionRecord,
  FocusTagLifecycleState,
} from "../../src/types";

/**
 * 12-week climber — 4 rung climbs (2 hinge, 2 horizontal_push), 1 focus-tag
 * retirement (forward_head cleared), 1 early phase transition (activation →
 * skill). Projection-scoped: `week` is intentionally empty and there is no
 * questionnaire, because the Phase 5 golden anchor built this persona purely to
 * assert the results-screen projection (ladders climbed, retired tags, phase
 * history, consistency, provenance). See docs/persona-fixture-gaps.md.
 */
export const buildTwelveWeekClimberProgram = (): Program => ({
  id: "12wk-climber",
  userId: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-03-01T00:00:00.000Z",
  goalTrack: null,
  daysPerWeek: 3,
  estimatedSessionMinutesRange: { min: 45, max: 60 },
  phaseIndex: 1, // in skill phase after activation transition
  phaseName: "skill",
  weekIndex: 4,
  totalWeekIndex: 8,
  cycleIndex: 1,
  phase: {
    name: "skill",
    phaseIndex: 1,
    cycleIndex: 1,
    weekIndex: 4,
    weekCount: 4,
    goal: "Skill development",
  },
  nextWeekPlan: { summary: "Skill week 4", change: "Maintain load", reason: "Steady progress" },
  week: [],
  source: "local",
  deletedAt: null,
  ladderState: {
    byPattern: {
      hinge: {
        exerciseId: "deadlift-barbell",
        pattern: "hinge",
        difficulty: 3,
        cleanSessionsCount: 1,
        requiredForAdvance: 2,
        inHysteresis: false,
        lastDecisionTrace: "hold hinge: 1/2 clean sessions",
      },
      horizontal_push: {
        exerciseId: "bench-press-barbell",
        pattern: "horizontal_push",
        difficulty: 3,
        cleanSessionsCount: 0,
        requiredForAdvance: 2,
        inHysteresis: false,
        lastDecisionTrace: "hold horizontal_push: 0/2 clean sessions",
      },
    },
    rungAdvancementHistory: [
      {
        pattern: "hinge",
        fromExerciseId: "romanian-deadlift",
        fromDifficulty: 1,
        toExerciseId: "deadlift-sumo",
        toDifficulty: 2,
        atSessionCount: 5,
        atPhase: 0,
        trace: "advance hinge: 2/2 clean sessions → deadlift-sumo (d2)",
      },
      {
        pattern: "hinge",
        fromExerciseId: "deadlift-sumo",
        fromDifficulty: 2,
        toExerciseId: "deadlift-barbell",
        toDifficulty: 3,
        atSessionCount: 10,
        atPhase: 0,
        trace: "advance hinge: 2/2 clean sessions → deadlift-barbell (d3)",
      },
      {
        pattern: "horizontal_push",
        fromExerciseId: "push-up",
        fromDifficulty: 1,
        toExerciseId: "bench-press-dumbbell",
        toDifficulty: 2,
        atSessionCount: 7,
        atPhase: 0,
        trace: "advance horizontal_push: 2/2 clean sessions → bench-press-dumbbell (d2)",
      },
      {
        pattern: "horizontal_push",
        fromExerciseId: "bench-press-dumbbell",
        fromDifficulty: 2,
        toExerciseId: "bench-press-barbell",
        toDifficulty: 3,
        atSessionCount: 14,
        atPhase: 0,
        trace: "advance horizontal_push: 2/2 clean sessions → bench-press-barbell (d3)",
      },
    ] satisfies RungAdvancementRecord[],
  },
  phaseHistory: [
    {
      phase: "activation",
      enteredAtSessionCount: 0,
      exitedAtSessionCount: 12,
      criteriaAtExit: [
        "rungs_climbed: ✓ — 2/2 patterns advanced",
        "consistency: ✓ — 5/5 sessions completed",
        "pain_signal: ✓ — no severe pain",
        "sacrifice_load: ✓ — 0 deferred exercises",
        "confidence: ✓ — 4/5 sessions moderate+",
      ],
      trace: "advance activation: 5/5 criteria met, min 10 sessions passed",
    },
  ] satisfies PhaseTransitionRecord[],
  assessmentHistory: [
    {
      timestamp: "2026-01-03T10:00:00.000Z",
      phase: 0,
      confidenceScore: 0.88,
      observations: [
        {
          focusTag: "forward_head",
          measuredValue: 0.13,
          threshold: 0.08,
          keypointConfidences: [0.85, 0.9],
        },
      ],
      status: "accepted",
    },
    {
      timestamp: "2026-02-15T10:00:00.000Z",
      phase: 1,
      confidenceScore: 0.90,
      observations: [
        {
          focusTag: "forward_head",
          measuredValue: 0.05,
          threshold: 0.08,
          keypointConfidences: [0.88, 0.91],
        },
      ],
      status: "user_retook",
    },
  ],
  focusTagLifecycle: {
    forward_head: {
      focusTag: "forward_head",
      firstSeenAt: "2026-01-03T10:00:00.000Z",
      retiredAt: "2026-02-15T10:00:00.000Z",
      retirementTrace:
        "forward_head focus retired — retest cleared threshold on [2026-01-03 → 2026-02-15] — corrective slot reallocated.",
      escalationBumps: 0,
    } satisfies FocusTagLifecycleState,
  },
});

/**
 * The 12-week climber's exercise logs: 36 entries = 12 unique sessions
 * (3 per session), all deadlift-barbell, progressively loaded. Deterministic
 * timestamps derived from a fixed base date + index (no clock reads).
 */
export const buildTwelveWeekClimberLogs = (): ExerciseLog[] =>
  Array.from({ length: 36 }, (_, i) => ({
    id: `log-${i}`,
    userId: null,
    sessionId: `session-${Math.floor(i / 3)}`,
    exerciseId: "deadlift-barbell",
    createdAt: new Date(Date.UTC(2026, 0, 3 + Math.floor(i / 3) * 2)).toISOString(),
    updatedAt: new Date(Date.UTC(2026, 0, 3 + Math.floor(i / 3) * 2)).toISOString(),
    loadType: "weighted" as const,
    unit: "lb" as const,
    weight: 155 + Math.floor(i / 9) * 10,
    reps: 5,
    repsBySet: null,
    setsPlanned: 3,
    setsCompleted: 3,
    durationSec: null,
    rpe: 7,
    felt: "moderate" as const,
    notes: null,
    computedVolume: null,
    source: "local" as const,
    deletedAt: null,
  }));
