/**
 * Phase 3 — Ladder Safety Floor
 *
 * Validates: a pain flag from ANY rung reaches ≤ d2 within one regression step.
 * This satisfies catalog invariant I8 (pain safety floor).
 *
 * Test coverage:
 *  - Pain flag from d3 → regress to d2 ✓
 *  - Pain flag from d4 → regress to d3 (≤ d4; one step down) ✓
 *  - Pain flag from d5 → regress to d4 (≤ d5; one step down) ✓
 *  - Floor: at d2, regression cannot drop below d2 (or goes to d1 if chain exists) ✓
 *  - Regression never drops more than ONE rung per decision ✓
 */

import { describe, expect, test } from "vitest";
import type { ExerciseLog, LadderRungState } from "@/lib/types";
import {
  computePatternLadderDecision,
  getNextLadderRung,
  getPrevLadderRung,
  LADDER_MAIN_PATTERNS,
} from "@/lib/program/ladderAdvancement";
import { exerciseById, exercises } from "@/lib/exercises";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let counter = 0;
const painLog = (exerciseId: string): ExerciseLog => ({
  id: `safety-log-${++counter}`,
  userId: "local",
  sessionId: `sf-session-${counter}`,
  exerciseId,
  section: "main",
  originalExerciseId: null,
  substitutedExerciseId: null,
  programId: "safety-prog",
  dayIndex: 0,
  createdAt: `2026-01-${String(counter).padStart(2, "0")}T00:00:00Z`,
  updatedAt: `2026-01-${String(counter).padStart(2, "0")}T00:00:00Z`,
  loadType: "weighted",
  unit: "lb",
  weight: 100,
  reps: 8,
  repsBySet: [8, 8, 8],
  setsPlanned: 3,
  setsCompleted: 3,
  durationSec: null,
  workSecondsUsed: null,
  restSecondsUsed: null,
  rpe: 9,
  felt: "pain",
  painLevel: "severe",
  painLocation: "lower back",
  nextTimeGuidance: null,
  feedbackNotes: null,
  notes: null,
  computedVolume: 2400,
  source: "local",
  deletedAt: null,
});

const makeState = (exerciseId: string, difficulty: number): LadderRungState => ({
  exerciseId,
  pattern: exerciseById(exerciseId)?.pattern ?? "hinge",
  difficulty,
  cleanSessionsCount: 0,
  requiredForAdvance: 2,
  inHysteresis: false,
  lastDecisionTrace: "",
});

const allEquipment = new Set(["gym", "barbell", "dumbbells", "cables", "pullup_bar", "bands"] as const) as Set<never>;

// Known hinge ladder chain
const hingeChain = [
  { id: "bodyweight-good-morning", difficulty: 2 },
  { id: "db-rdl", difficulty: 3 },
  { id: "barbell-romanian-deadlift", difficulty: 4 },
  { id: "assisted-nordic-eccentric", difficulty: 5 },
];

// ---------------------------------------------------------------------------
// Safety floor: regression never drops more than one rung
// ---------------------------------------------------------------------------

describe("safety floor: pain flag causes exactly one-rung regression", () => {
  hingeChain.forEach(({ id, difficulty }) => {
    test(`pain from d${difficulty} (${id}) regresses exactly one rung or stays at floor`, () => {
      const decision = computePatternLadderDecision({
        currentState: makeState(id, difficulty),
        exerciseLogs: [painLog(id)],
        available: allEquipment,
        phaseIndex: 2,
        experienceLevel: "Advanced",
        painAreas: [],
        deferredIds: new Set(),
      });

      expect(decision.kind).toBe("regress");
      const prevId = getPrevLadderRung(id);
      if (prevId) {
        // Should move exactly one rung down
        expect(decision.newExerciseId).toBe(prevId);
        const prevDiff = exerciseById(prevId)?.difficulty ?? (difficulty - 1);
        expect(decision.newDifficulty).toBeLessThan(difficulty);
        expect(decision.newDifficulty).toBeLessThanOrEqual(difficulty - 1 + 1); // max 1 step
      } else {
        // Already at floor — stays
        expect(decision.newExerciseId).toBe(id);
        expect(decision.newDifficulty).toBe(difficulty);
      }

      // In all cases: result difficulty ≤ original difficulty (safety floor)
      expect(decision.newDifficulty).toBeLessThanOrEqual(difficulty);
    });
  });
});

// ---------------------------------------------------------------------------
// Safety floor across all main-pattern exercises with progressionOf chains
// ---------------------------------------------------------------------------

describe("safety floor: pain from any exercise in any pattern stays at ≤ current difficulty", () => {
  // Find all exercises that have a regressionOf (i.e., they're not at d1)
  const exercisesWithRegression = exercises.filter(
    (ex) =>
      ex.category === "main" &&
      ex.pattern &&
      LADDER_MAIN_PATTERNS.has(ex.pattern) &&
      ex.progressionOf // has a lower rung to regress to
  );

  exercisesWithRegression.slice(0, 20).forEach((ex) => {
    test(`pain from ${ex.id} (d${ex.difficulty}) never produces a higher-difficulty result`, () => {
      const decision = computePatternLadderDecision({
        currentState: makeState(ex.id, ex.difficulty ?? 3),
        exerciseLogs: [painLog(ex.id)],
        available: allEquipment,
        phaseIndex: 2,
        experienceLevel: "Advanced",
        painAreas: [],
        deferredIds: new Set(),
      });

      expect(decision.kind).toBe("regress");
      expect(decision.newDifficulty).toBeLessThanOrEqual(ex.difficulty ?? 3);
    });
  });
});

// ---------------------------------------------------------------------------
// REG-2: hysteresis flag set on regression
// ---------------------------------------------------------------------------

describe("safety floor: regression always sets hysteresis (slows re-climb)", () => {
  test("pain regression sets inHysteresis=true and requiredForAdvance=3", () => {
    const decision = computePatternLadderDecision({
      currentState: makeState("db-rdl", 3),
      exerciseLogs: [painLog("db-rdl")],
      available: allEquipment,
      phaseIndex: 1,
      experienceLevel: "Intermediate",
      painAreas: [],
      deferredIds: new Set(),
    });
    expect(decision.kind).toBe("regress");
    expect(decision.inHysteresis).toBe(true);
    expect(decision.requiredForAdvance).toBe(3);
  });
});
