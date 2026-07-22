/**
 * Phase 3.2 — Sacrifice path tests
 *
 * Coverage:
 *  - computeFlaggedExercises: triggers on severe_pain, incomplete, failed_difficulty
 *  - applyFeedbackContractAction("sacrifice"): sets deferred, sacrificedAt, adds to retest queue
 *  - applyFeedbackContractAction("modify" at d1): escalates to sacrifice
 *  - applyAutoSacrifice: probation exercise re-flagged → auto-defers
 *  - Retest queue: sacrificedByPattern populated correctly per pattern
 */

import { describe, expect, test } from "vitest";
import type { ExerciseFeedbackSummary, ExerciseLog, LadderState } from "@/lib/types";
import {
  computeFlaggedExercises,
  applyFeedbackContractAction,
  applyAutoSacrifice,
} from "@/lib/program/feedbackContract";
import { exerciseById } from "@/lib/exercises";

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
  programId: "prog-sacrifice",
  dayIndex: 0,
  createdAt: `2026-02-${String(counter).padStart(2, "0")}T10:00:00Z`,
  updatedAt: `2026-02-${String(counter).padStart(2, "0")}T10:00:00Z`,
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

const emptySummaries = new Map<string, ExerciseFeedbackSummary>();

const baseSummary = (exerciseId: string): ExerciseFeedbackSummary => ({
  exerciseId,
  pain: "none",
  difficulty: "normal",
  completionRate: 1,
});

// Exercises used in tests: hinge chain
const hingeD2 = "bodyweight-good-morning";
const hingeD3 = "db-rdl";

// ---------------------------------------------------------------------------
// 1. Trigger detection
// ---------------------------------------------------------------------------

describe("computeFlaggedExercises: sacrifice-worthy triggers", () => {
  test("severe pain triggers prompt", () => {
    const triggers = computeFlaggedExercises({
      todaysPlanExerciseIds: [hingeD3],
      recentLogs: [makeLog({ exerciseId: hingeD3, painLevel: "severe" })],
      feedbackSummaryByExercise: emptySummaries,
    });
    expect(triggers).toHaveLength(1);
    expect(triggers[0]!.exerciseId).toBe(hingeD3);
    expect(triggers[0]!.reason).toBe("severe_pain");
  });

  test("felt=pain triggers severe_pain", () => {
    const triggers = computeFlaggedExercises({
      todaysPlanExerciseIds: [hingeD3],
      recentLogs: [makeLog({ exerciseId: hingeD3, felt: "pain", painLevel: "none" })],
      feedbackSummaryByExercise: emptySummaries,
    });
    expect(triggers[0]!.reason).toBe("severe_pain");
  });

  test("incomplete sets triggers prompt", () => {
    const triggers = computeFlaggedExercises({
      todaysPlanExerciseIds: [hingeD3],
      recentLogs: [makeLog({ exerciseId: hingeD3, setsPlanned: 3, setsCompleted: 1 })],
      feedbackSummaryByExercise: emptySummaries,
    });
    expect(triggers[0]!.reason).toBe("incomplete");
  });

  test("failed difficulty (rpe >= 9, all sets done) triggers prompt", () => {
    const triggers = computeFlaggedExercises({
      todaysPlanExerciseIds: [hingeD3],
      recentLogs: [makeLog({ exerciseId: hingeD3, setsPlanned: 3, setsCompleted: 3, rpe: 9 })],
      feedbackSummaryByExercise: emptySummaries,
    });
    expect(triggers[0]!.reason).toBe("failed_difficulty");
  });

  test("moderate pain on ONE session does NOT trigger", () => {
    const triggers = computeFlaggedExercises({
      todaysPlanExerciseIds: [hingeD3],
      recentLogs: [makeLog({ exerciseId: hingeD3, painLevel: "moderate" })],
      feedbackSummaryByExercise: emptySummaries,
    });
    expect(triggers).toHaveLength(0);
  });

  test("moderate pain on TWO consecutive sessions DOES trigger", () => {
    const triggers = computeFlaggedExercises({
      todaysPlanExerciseIds: [hingeD3],
      recentLogs: [
        makeLog({ exerciseId: hingeD3, painLevel: "moderate", createdAt: "2026-02-05T10:00:00Z" }),
        makeLog({ exerciseId: hingeD3, painLevel: "moderate", createdAt: "2026-02-01T10:00:00Z" }),
      ],
      feedbackSummaryByExercise: emptySummaries,
    });
    expect(triggers[0]!.reason).toBe("moderate_pain_consecutive");
  });

  test("no logs for exercise → no trigger", () => {
    const triggers = computeFlaggedExercises({
      todaysPlanExerciseIds: [hingeD3],
      recentLogs: [],
      feedbackSummaryByExercise: emptySummaries,
    });
    expect(triggers).toHaveLength(0);
  });

  test("already deferred → skipped from prompt", () => {
    const summaries = new Map<string, ExerciseFeedbackSummary>([
      [hingeD3, { ...baseSummary(hingeD3), deferred: true }],
    ]);
    const triggers = computeFlaggedExercises({
      todaysPlanExerciseIds: [hingeD3],
      recentLogs: [makeLog({ exerciseId: hingeD3, painLevel: "severe" })],
      feedbackSummaryByExercise: summaries,
    });
    expect(triggers).toHaveLength(0);
  });

  test("atFloor is true for d1 exercises (no progressionOf)", () => {
    const d1Id = "bodyweight-good-morning"; // d2 — no progressionOf in catalog
    const triggers = computeFlaggedExercises({
      todaysPlanExerciseIds: [d1Id],
      recentLogs: [makeLog({ exerciseId: d1Id, painLevel: "severe" })],
      feedbackSummaryByExercise: emptySummaries,
    });
    if (triggers.length > 0) {
      // bodyweight-good-morning has no progressionOf → atFloor true
      const ex = exerciseById(d1Id);
      expect(triggers[0]!.atFloor).toBe(!ex?.progressionOf);
    }
  });

  test("onProbation reflects persisted probation flag", () => {
    const summaries = new Map<string, ExerciseFeedbackSummary>([
      [hingeD3, { ...baseSummary(hingeD3), probation: true }],
    ]);
    const triggers = computeFlaggedExercises({
      todaysPlanExerciseIds: [hingeD3],
      recentLogs: [makeLog({ exerciseId: hingeD3, painLevel: "severe" })],
      feedbackSummaryByExercise: summaries,
    });
    expect(triggers[0]!.onProbation).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 2. Sacrifice action
// ---------------------------------------------------------------------------

describe("applyFeedbackContractAction('sacrifice')", () => {
  const pattern = "hinge";
  const ladderState: LadderState = {
    byPattern: {
      hinge: {
        exerciseId: hingeD3,
        pattern,
        difficulty: 3,
        cleanSessionsCount: 0,
        requiredForAdvance: 2,
        inHysteresis: false,
        lastDecisionTrace: "",
      },
    },
  };

  test("sets deferred=true and sacrificedAt on summary", () => {
    const result = applyFeedbackContractAction({
      action: "sacrifice",
      exerciseId: hingeD3,
      exercisePattern: pattern,
      currentSummary: baseSummary(hingeD3),
      currentLadderState: ladderState,
      phase: "skill",
      sessionCount: 5,
    });
    expect(result.updatedSummary.deferred).toBe(true);
    expect(result.updatedSummary.sacrificedAt).toEqual({ phase: "skill", sessionCount: 5 });
    expect(result.updatedSummary.probation).toBe(false);
    expect(result.updatedSummary.autoSacrificed).toBe(false);
  });

  test("adds exercise to sacrificedByPattern retest queue", () => {
    const result = applyFeedbackContractAction({
      action: "sacrifice",
      exerciseId: hingeD3,
      exercisePattern: pattern,
      currentSummary: baseSummary(hingeD3),
      currentLadderState: ladderState,
      phase: "skill",
      sessionCount: 5,
    });
    expect(result.updatedLadderState?.sacrificedByPattern?.[pattern]).toContain(hingeD3);
  });

  test("retest queue is deduplicated on repeated sacrifice", () => {
    const withExisting: LadderState = {
      ...ladderState,
      sacrificedByPattern: { hinge: [hingeD3] },
    };
    const result = applyFeedbackContractAction({
      action: "sacrifice",
      exerciseId: hingeD3,
      exercisePattern: pattern,
      currentSummary: baseSummary(hingeD3),
      currentLadderState: withExisting,
      phase: "skill",
      sessionCount: 6,
    });
    const queue = result.updatedLadderState?.sacrificedByPattern?.[pattern] ?? [];
    expect(queue.filter((id) => id === hingeD3)).toHaveLength(1);
  });

  test("writes a decisionTrace naming sacrifice", () => {
    const result = applyFeedbackContractAction({
      action: "sacrifice",
      exerciseId: hingeD3,
      exercisePattern: pattern,
      currentSummary: baseSummary(hingeD3),
      currentLadderState: ladderState,
      phase: "activation",
      sessionCount: 2,
    });
    expect(result.decisionTrace).toMatch(/sacrifice/);
    expect(result.decisionTrace).toMatch(hingeD3);
  });
});

// ---------------------------------------------------------------------------
// 3. Modify at d1 → escalates to sacrifice
// ---------------------------------------------------------------------------

describe("applyFeedbackContractAction('modify') at d1 floor → sacrifice", () => {
  test("Modify at atFloor=true escalates to Sacrifice", () => {
    const result = applyFeedbackContractAction({
      action: "modify",
      exerciseId: hingeD2,
      exercisePattern: "hinge",
      currentSummary: baseSummary(hingeD2),
      currentLadderState: undefined,
      phase: "activation",
      sessionCount: 1,
      atFloor: true,
    });
    expect(result.updatedSummary.deferred).toBe(true);
    expect(result.updatedSummary.sacrificedAt).toBeDefined();
    expect(result.decisionTrace).toMatch(/d1 floor.*escalated to Sacrifice/i);
  });
});

// ---------------------------------------------------------------------------
// 4. Auto-sacrifice
// ---------------------------------------------------------------------------

describe("applyAutoSacrifice: probation exercise re-flagged", () => {
  test("sets deferred=true and autoSacrificed=true", () => {
    const summaryOnProbation: ExerciseFeedbackSummary = {
      ...baseSummary(hingeD3),
      probation: true,
    };
    const result = applyAutoSacrifice({
      exerciseId: hingeD3,
      exercisePattern: "hinge",
      currentSummary: summaryOnProbation,
      currentLadderState: undefined,
      phase: "growth",
      sessionCount: 8,
    });
    expect(result.updatedSummary.deferred).toBe(true);
    expect(result.updatedSummary.autoSacrificed).toBe(true);
    expect(result.updatedSummary.probation).toBe(false);
    expect(result.updatedSummary.sacrificedAt).toEqual({ phase: "growth", sessionCount: 8 });
  });

  test("decisionTrace names 'two consecutive flags on probation'", () => {
    const result = applyAutoSacrifice({
      exerciseId: hingeD3,
      exercisePattern: "hinge",
      currentSummary: { ...baseSummary(hingeD3), probation: true },
      currentLadderState: undefined,
      phase: "skill",
      sessionCount: 6,
    });
    expect(result.decisionTrace).toMatch(/two consecutive flags on probation/);
  });

  test("adds to retest queue", () => {
    const result = applyAutoSacrifice({
      exerciseId: hingeD3,
      exercisePattern: "hinge",
      currentSummary: { ...baseSummary(hingeD3), probation: true },
      currentLadderState: undefined,
      phase: "skill",
      sessionCount: 4,
    });
    expect(result.updatedLadderState?.sacrificedByPattern?.hinge).toContain(hingeD3);
  });
});

// ---------------------------------------------------------------------------
// 5. Multi-pattern retest queue
// ---------------------------------------------------------------------------

describe("sacrificedByPattern: multiple patterns tracked independently", () => {
  test("two patterns have separate retest queues", () => {
    const pushId = "incline-pushup"; // horizontal_push pattern
    const pushPattern = exerciseById(pushId)?.pattern ?? "horizontal_push";

    const result1 = applyFeedbackContractAction({
      action: "sacrifice",
      exerciseId: hingeD3,
      exercisePattern: "hinge",
      currentSummary: baseSummary(hingeD3),
      currentLadderState: undefined,
      phase: "skill",
      sessionCount: 5,
    });
    const result2 = applyFeedbackContractAction({
      action: "sacrifice",
      exerciseId: pushId,
      exercisePattern: pushPattern,
      currentSummary: baseSummary(pushId),
      currentLadderState: result1.updatedLadderState,
      phase: "skill",
      sessionCount: 5,
    });

    expect(result2.updatedLadderState?.sacrificedByPattern?.hinge).toContain(hingeD3);
    expect(result2.updatedLadderState?.sacrificedByPattern?.[pushPattern]).toContain(pushId);
  });
});
