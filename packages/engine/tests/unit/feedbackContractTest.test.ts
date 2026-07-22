/**
 * Phase 3.2 — Test path tests
 *
 * Coverage:
 *  - applyFeedbackContractAction("test"): sets probation=true
 *  - Dismiss treated as Test (silence-is-Test rule, §3.2)
 *  - clearProbationIfClean: clean session clears probation
 *  - Probation persists across non-clean sessions
 *  - Two-strikes: probation exercise flagged again → computeFlaggedExercises
 *    returns onProbation=true so caller applies auto-Sacrifice
 */

import { describe, expect, test } from "vitest";
import type { ExerciseFeedbackSummary, ExerciseLog } from "@/lib/types";
import {
  computeFlaggedExercises,
  applyFeedbackContractAction,
  clearProbationIfClean,
} from "@/lib/program/feedbackContract";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let counter = 0;
const makeLog = (
  overrides: Partial<ExerciseLog> & { exerciseId: string }
): ExerciseLog => ({
  id: `log-${++counter}`,
  userId: "local",
  sessionId: `sess-${counter}`,
  exerciseId: overrides.exerciseId,
  section: "main",
  originalExerciseId: null,
  substitutedExerciseId: null,
  programId: "prog-test",
  dayIndex: 0,
  createdAt: `2026-03-${String(counter).padStart(2, "0")}T10:00:00Z`,
  updatedAt: `2026-03-${String(counter).padStart(2, "0")}T10:00:00Z`,
  loadType: "weighted",
  unit: "lb",
  weight: 100,
  reps: 10,
  repsBySet: [10, 10, 10],
  setsPlanned: 3,
  setsCompleted: 3,
  durationSec: null,
  workSecondsUsed: null,
  restSecondsUsed: null,
  rpe: null,
  felt: "moderate",
  painLevel: "none",
  painLocation: null,
  nextTimeGuidance: null,
  feedbackNotes: null,
  notes: null,
  computedVolume: 3000,
  source: "local",
  deletedAt: null,
  ...overrides,
});

const baseSummary = (exerciseId: string): ExerciseFeedbackSummary => ({
  exerciseId,
  pain: "none",
  difficulty: "normal",
  completionRate: 1,
});

const hingeD3 = "db-rdl";

// ---------------------------------------------------------------------------
// 1. Test action
// ---------------------------------------------------------------------------

describe("applyFeedbackContractAction('test')", () => {
  test("sets probation=true on the summary", () => {
    const result = applyFeedbackContractAction({
      action: "test",
      exerciseId: hingeD3,
      currentSummary: baseSummary(hingeD3),
      currentLadderState: undefined,
      phase: "skill",
      sessionCount: 4,
    });
    expect(result.updatedSummary.probation).toBe(true);
  });

  test("does NOT set deferred", () => {
    const result = applyFeedbackContractAction({
      action: "test",
      exerciseId: hingeD3,
      currentSummary: baseSummary(hingeD3),
      currentLadderState: undefined,
      phase: "skill",
      sessionCount: 4,
    });
    expect(result.updatedSummary.deferred).toBeFalsy();
  });

  test("writes decisionTrace naming probation", () => {
    const result = applyFeedbackContractAction({
      action: "test",
      exerciseId: hingeD3,
      currentSummary: baseSummary(hingeD3),
      currentLadderState: undefined,
      phase: "skill",
      sessionCount: 4,
    });
    expect(result.decisionTrace).toMatch(/probation/);
  });
});

// ---------------------------------------------------------------------------
// 2. Dismiss = Test (charitable default)
// ---------------------------------------------------------------------------

describe("dismiss action treated as Test", () => {
  test("dismiss produces the same outcome as test", () => {
    const testResult = applyFeedbackContractAction({
      action: "test",
      exerciseId: hingeD3,
      currentSummary: baseSummary(hingeD3),
      currentLadderState: undefined,
      phase: "skill",
      sessionCount: 3,
    });
    const dismissResult = applyFeedbackContractAction({
      action: "dismiss",
      exerciseId: hingeD3,
      currentSummary: baseSummary(hingeD3),
      currentLadderState: undefined,
      phase: "skill",
      sessionCount: 3,
    });
    expect(dismissResult.updatedSummary.probation).toBe(testResult.updatedSummary.probation);
    expect(dismissResult.updatedSummary.deferred).toBe(testResult.updatedSummary.deferred);
  });
});

// ---------------------------------------------------------------------------
// 3. clearProbationIfClean
// ---------------------------------------------------------------------------

describe("clearProbationIfClean", () => {
  test("clean log clears probation", () => {
    const summary: ExerciseFeedbackSummary = { ...baseSummary(hingeD3), probation: true };
    const cleanLog = makeLog({
      exerciseId: hingeD3,
      setsPlanned: 3,
      setsCompleted: 3,
      rpe: 6,
      felt: "moderate",
      painLevel: "none",
    });
    const result = clearProbationIfClean(summary, cleanLog);
    expect(result.probation).toBe(false);
  });

  test("pain log does NOT clear probation", () => {
    const summary: ExerciseFeedbackSummary = { ...baseSummary(hingeD3), probation: true };
    const painLog = makeLog({
      exerciseId: hingeD3,
      setsPlanned: 3,
      setsCompleted: 3,
      rpe: 9,
      felt: "pain",
      painLevel: "severe",
    });
    const result = clearProbationIfClean(summary, painLog);
    expect(result.probation).toBe(true);
  });

  test("incomplete log does NOT clear probation", () => {
    const summary: ExerciseFeedbackSummary = { ...baseSummary(hingeD3), probation: true };
    const incompleteLog = makeLog({
      exerciseId: hingeD3,
      setsPlanned: 3,
      setsCompleted: 1,
    });
    const result = clearProbationIfClean(summary, incompleteLog);
    expect(result.probation).toBe(true);
  });

  test("high-rpe log (rpe=8) does NOT clear probation", () => {
    const summary: ExerciseFeedbackSummary = { ...baseSummary(hingeD3), probation: true };
    const hardLog = makeLog({
      exerciseId: hingeD3,
      setsPlanned: 3,
      setsCompleted: 3,
      rpe: 8,
      felt: "hard",
      painLevel: "none",
    });
    const result = clearProbationIfClean(summary, hardLog);
    expect(result.probation).toBe(true);
  });

  test("exercise without probation is returned unchanged", () => {
    const summary = baseSummary(hingeD3);
    const cleanLog = makeLog({ exerciseId: hingeD3, setsPlanned: 3, setsCompleted: 3 });
    const result = clearProbationIfClean(summary, cleanLog);
    expect(result).toBe(summary); // Reference equality — no allocation.
  });
});

// ---------------------------------------------------------------------------
// 4. Two-strikes: computeFlaggedExercises surfaces onProbation=true for
//    a probation exercise that is re-flagged → caller auto-Sacrifices
// ---------------------------------------------------------------------------

describe("two-strikes: probation exercise re-flagged → onProbation=true", () => {
  test("probation exercise with a new severe-pain log → onProbation flag set", () => {
    const summaries = new Map<string, ExerciseFeedbackSummary>([
      [hingeD3, { ...baseSummary(hingeD3), probation: true }],
    ]);
    const triggers = computeFlaggedExercises({
      todaysPlanExerciseIds: [hingeD3],
      recentLogs: [makeLog({ exerciseId: hingeD3, painLevel: "severe" })],
      feedbackSummaryByExercise: summaries,
    });
    expect(triggers).toHaveLength(1);
    expect(triggers[0]!.onProbation).toBe(true);
  });

  test("probation exercise with clean logs → NOT flagged (no trigger)", () => {
    const summaries = new Map<string, ExerciseFeedbackSummary>([
      [hingeD3, { ...baseSummary(hingeD3), probation: true }],
    ]);
    const triggers = computeFlaggedExercises({
      todaysPlanExerciseIds: [hingeD3],
      recentLogs: [
        makeLog({ exerciseId: hingeD3, setsPlanned: 3, setsCompleted: 3, rpe: 6, painLevel: "none" }),
      ],
      feedbackSummaryByExercise: summaries,
    });
    expect(triggers).toHaveLength(0);
  });
});
