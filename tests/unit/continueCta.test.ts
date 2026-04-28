import { describe, expect, test } from "vitest";
import { shouldShowContinueCTA } from "@/lib/continueCta";

describe("continue CTA visibility", () => {
  test("shows when draft matches active program + version + phase", () => {
    const state = {
      activeProgramId: "program-1",
      programVersion: 2,
      activePhaseIndex: 2,
      updatedAt: Date.now(),
    };
    const draft = {
      sessionId: "s1",
      programId: "program-1",
      dayIndex: 0,
      programVersion: 2,
      phaseIndex: 2,
      currentExerciseIndex: 0,
      currentSetIndex: 0,
      entries: {
        completedSets: {},
        selectedSets: {},
        weightByExercise: {},
        repsByExercise: {},
        repsBySetByExercise: {},
        unitByExercise: {},
        notesByExercise: {},
        feedbackByExercise: {},
      },
      updatedAt: new Date().toISOString(),
    };
    expect(shouldShowContinueCTA(state, draft)).toBe(true);
  });

  test("blocks when program version mismatches", () => {
    const state = {
      activeProgramId: "program-1",
      programVersion: 3,
      activePhaseIndex: 2,
      updatedAt: Date.now(),
    };
    const draft = {
      sessionId: "s1",
      programId: "program-1",
      dayIndex: 0,
      programVersion: 2,
      phaseIndex: 2,
      currentExerciseIndex: 0,
      currentSetIndex: 0,
      entries: {
        completedSets: {},
        selectedSets: {},
        weightByExercise: {},
        repsByExercise: {},
        repsBySetByExercise: {},
        unitByExercise: {},
        notesByExercise: {},
        feedbackByExercise: {},
      },
      updatedAt: new Date().toISOString(),
    };
    expect(shouldShowContinueCTA(state, draft)).toBe(false);
  });
});
