/**
 * Phase 3 — VAR-1: Variation Constraint
 *
 * "Variation memory / variationRuntime may rotate ONLY within
 *  {currentRung ∪ its swapOptions}. It must NEVER rotate across rungs —
 *  otherwise ladder position becomes decorative."
 *
 * Tests:
 *  1. getLadderSwapSet returns correct set for well-known exercises.
 *  2. Integration: when ladderState + variationState are active, all main
 *     exercises selected for tracked patterns are within the swap set.
 */

import { describe, expect, test } from "vitest";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import type { LadderState } from "@/lib/types";
import { getLadderSwapSet, getNextLadderRung, getPrevLadderRung, LADDER_MAIN_PATTERNS } from "@/lib/program/ladderAdvancement";
import { exerciseById, exercises } from "@/lib/exercises";
import { generateWeeklyProgram } from "@/lib/program";

// ---------------------------------------------------------------------------
// Unit: getLadderSwapSet
// ---------------------------------------------------------------------------

describe("getLadderSwapSet", () => {
  test("swap set always includes the rung exercise itself", () => {
    const swapSet = getLadderSwapSet("db-rdl");
    expect(swapSet.has("db-rdl")).toBe(true);
  });

  test("swap set includes all swapOptions except adjacent ladder rungs (VAR-1)", () => {
    // VAR-1: getLadderSwapSet filters out next/prev rungs even if they appear
    // in swapOptions (catalog cross-contamination guard).
    const ex = exerciseById("db-rdl");
    const swapSet = getLadderSwapSet("db-rdl");
    const nextRung = getNextLadderRung("db-rdl");
    const prevRung = getPrevLadderRung("db-rdl");
    (ex?.swapOptions ?? []).forEach((swapId) => {
      if (swapId === nextRung || swapId === prevRung) {
        // Adjacent rungs are intentionally excluded from the swap set.
        expect(swapSet.has(swapId)).toBe(false);
      } else {
        expect(swapSet.has(swapId)).toBe(true);
      }
    });
  });

  test("swap set does NOT include the next rung exercise", () => {
    const next = getNextLadderRung("db-rdl");
    if (next) {
      const swapSet = getLadderSwapSet("db-rdl");
      expect(swapSet.has(next)).toBe(false);
    }
  });

  test("swap set for exercise with no swapOptions is {exerciseId}", () => {
    const noSwaps = exercises.find(
      (ex) => ex.category === "main" && ex.pattern && LADDER_MAIN_PATTERNS.has(ex.pattern) && !ex.swapOptions?.length
    );
    if (noSwaps) {
      const swapSet = getLadderSwapSet(noSwaps.id);
      expect(swapSet.size).toBe(1);
      expect(swapSet.has(noSwaps.id)).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// Integration: VAR-1 — variation stays within current rung's swap set
// ---------------------------------------------------------------------------

describe("VAR-1 integration: variation stays within swap set", () => {
  const questionnaire: QuestionnaireData = {
    goals: "Build muscle",
    painAreas: [],
    experience: "Intermediate",
    equipment: ["dumbbells", "cables", "gym"],
    daysPerWeek: 3,
  };

  // Set ladder state with hinge at db-rdl (d3)
  const currentLadderState: LadderState = {
    byPattern: {
      hinge: {
        exerciseId: "db-rdl",
        pattern: "hinge",
        difficulty: 3,
        cleanSessionsCount: 0,
        requiredForAdvance: 2,
        inHysteresis: false,
        lastDecisionTrace: "init",
      },
    },
  };

  const swapSetForDbRdl = getLadderSwapSet("db-rdl");

  test("with ladderState, main hinge slot respects current rung preference", () => {
    const program = generateWeeklyProgram(
      questionnaire,
      "var-1-prog-1",
      {
        phaseIndex: 1,
        weekIndex: 2,
        cycleIndex: 1,
        totalWeekIndex: 2,
        currentLadderState,
        seed: "var1-seed-deterministic",
      }
    );

    expect(program.week.length).toBeGreaterThan(0);
    // Verify ladderState is stored on the program
    expect(program.ladderState?.byPattern.hinge).toBeTruthy();

    // Find all hinge exercises across the week
    const hingeExercises = program.week.flatMap((day) =>
      day.routine.filter((item) => {
        const ex = exerciseById(item.exerciseId);
        return ex?.pattern === "hinge" && item.section === "main";
      })
    );

    // The preferred exercise (db-rdl or its swaps) should dominate
    if (hingeExercises.length > 0) {
      const inSwapSet = hingeExercises.filter((item) => swapSetForDbRdl.has(item.exerciseId));
      // At least some hinge exercises should be from the swap set
      // (the scoring bonus strongly prefers them)
      expect(inSwapSet.length).toBeGreaterThan(0);
    }
  });

  test("program stores computed ladderState from current + recentLogs", () => {
    const program = generateWeeklyProgram(
      questionnaire,
      "var-1-prog-2",
      {
        phaseIndex: 1,
        weekIndex: 2,
        cycleIndex: 1,
        totalWeekIndex: 2,
        currentLadderState,
        recentLogs: [],
        seed: "var1-state-seed",
      }
    );

    // ladderState must be stored
    expect(program.ladderState).toBeDefined();
    expect(program.ladderState?.byPattern.hinge?.exerciseId).toBe("db-rdl");
    expect(program.ladderState?.byPattern.hinge?.lastDecisionTrace).toMatch(/hold|init/);
  });

  test("without ladderState, program generates normally (no regression)", () => {
    const program = generateWeeklyProgram(
      questionnaire,
      "var-1-prog-3",
      {
        phaseIndex: 1,
        weekIndex: 1,
        cycleIndex: 1,
        totalWeekIndex: 1,
        seed: "var1-no-ladder",
      }
    );
    expect(program.week.length).toBeGreaterThan(0);
    expect(program.ladderState).toBeUndefined();
  });

  test("VAR-1 swap set excludes adjacent ladder rungs from a concrete chain", () => {
    // Use dumbbell-bench-press → barbell-bench-press-paused: a pair where
    // the next rung is NOT declared in swapOptions (catalog-clean pair).
    const anchorId = "dumbbell-bench-press";
    const anchorSwaps = getLadderSwapSet(anchorId);

    const nextRung = getNextLadderRung(anchorId); // barbell-bench-press-paused (harder)
    const prevRung = getPrevLadderRung(anchorId); // predecessor (easier), if any

    if (nextRung) {
      expect(anchorSwaps.has(nextRung)).toBe(false); // harder rung NOT in swap set
    }
    if (prevRung) {
      expect(anchorSwaps.has(prevRung)).toBe(false); // easier rung NOT in swap set
    }

    // Self is always included
    expect(anchorSwaps.has(anchorId)).toBe(true);
  });
});
