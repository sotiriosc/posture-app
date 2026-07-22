/**
 * Phase 3.3 — Training Intent: Rehab mode tests
 *
 * Coverage:
 *  - Advance blocked without explicitAdvanceRequested (criteria met, still hold)
 *  - Explicit request permits one advancement attempt
 *  - Extended hysteresis after regression: 5 clean sessions (vs 3 in build)
 *  - Regression paths unchanged (pain, incomplete, deferred)
 *  - explicitAdvanceRequested cleared after consume (one-shot)
 */

import { describe, expect, test } from "vitest";
import type { ExerciseLog, LadderRungState, LadderState } from "@/lib/types";
import { computePatternLadderDecision, computeLadderState } from "@/lib/program/ladderAdvancement";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let seq = 100;
const makeLog = (overrides: Partial<ExerciseLog> & { exerciseId: string }): ExerciseLog => ({
  id: `log-${++seq}`,
  userId: "local",
  sessionId: `sess-${seq}`,
  exerciseId: overrides.exerciseId,
  section: "main",
  originalExerciseId: null,
  substitutedExerciseId: null,
  programId: "prog-rehab",
  dayIndex: 0,
  createdAt: `2026-05-${String(seq % 28 + 1).padStart(2, "0")}T10:00:00Z`,
  updatedAt: `2026-05-${String(seq % 28 + 1).padStart(2, "0")}T10:00:00Z`,
  loadType: "weighted",
  unit: "lb",
  weight: 80,
  reps: 10,
  repsBySet: [10, 10, 10],
  setsPlanned: 3,
  setsCompleted: 3,
  durationSec: null,
  workSecondsUsed: null,
  restSecondsUsed: null,
  rpe: 6,
  felt: "moderate",
  painLevel: "none",
  painLocation: null,
  nextTimeGuidance: null,
  feedbackNotes: null,
  notes: null,
  computedVolume: 2400,
  source: "local",
  deletedAt: null,
  ...overrides,
});

// Use hingeD2 → hingeD3 chain: db-rdl has no phaseMin block, only needs dumbbells.
const hingeD2 = "bodyweight-good-morning";
const hingePattern = "hinge";

const baseHingeState = (overrides?: Partial<LadderRungState>): LadderRungState => ({
  exerciseId: hingeD2, // advance to db-rdl (d3, dumbbells, no phaseMin block)
  pattern: hingePattern,
  difficulty: 2,
  cleanSessionsCount: 0,
  requiredForAdvance: 2,
  inHysteresis: false,
  lastDecisionTrace: "",
  ...overrides,
});

const twoCleanLogs = [
  makeLog({ exerciseId: hingeD2, createdAt: "2026-05-01T10:00:00Z" }),
  makeLog({ exerciseId: hingeD2, createdAt: "2026-05-08T10:00:00Z" }),
];

const availableEq = new Set(["dumbbells", "barbell", "cables", "gym"] as const) as Set<never>;

// ---------------------------------------------------------------------------
// 1. Rehab mode: advance blocked without explicit request
// ---------------------------------------------------------------------------

describe("rehab mode: advancement suppressed without explicit request", () => {
  test("2 clean sessions produce HOLD in rehab mode (no explicit request)", () => {
    const decision = computePatternLadderDecision({
      currentState: baseHingeState(),
      exerciseLogs: twoCleanLogs,
      available: availableEq,
      phaseIndex: 1,
      experienceLevel: "Intermediate",
      painAreas: [],
      deferredIds: new Set(),
      trainingIntent: "rehab",
      explicitAdvanceRequested: false,
    });
    expect(decision.kind).toBe("hold");
  });

  test("rehab hold trace records 'awaiting explicit user request to progress'", () => {
    const decision = computePatternLadderDecision({
      currentState: baseHingeState(),
      exerciseLogs: twoCleanLogs,
      available: availableEq,
      phaseIndex: 1,
      experienceLevel: "Intermediate",
      painAreas: [],
      deferredIds: new Set(),
      trainingIntent: "rehab",
    });
    expect(decision.trace).toMatch(/awaiting explicit user request/);
  });
});

// ---------------------------------------------------------------------------
// 2. Rehab mode: explicit request permits one advancement
// ---------------------------------------------------------------------------

describe("rehab mode: explicit request permits advance", () => {
  test("criteria met + explicitAdvanceRequested = true → advance", () => {
    const decision = computePatternLadderDecision({
      currentState: baseHingeState(),
      exerciseLogs: twoCleanLogs,
      available: availableEq,
      phaseIndex: 1,
      experienceLevel: "Intermediate",
      painAreas: [],
      deferredIds: new Set(),
      trainingIntent: "rehab",
      explicitAdvanceRequested: true,
    });
    expect(decision.kind).toBe("advance");
  });

  test("trace notes 'explicit user request' on advance", () => {
    const decision = computePatternLadderDecision({
      currentState: baseHingeState(),
      exerciseLogs: twoCleanLogs,
      available: availableEq,
      phaseIndex: 1,
      experienceLevel: "Intermediate",
      painAreas: [],
      deferredIds: new Set(),
      trainingIntent: "rehab",
      explicitAdvanceRequested: true,
    });
    expect(decision.trace).toMatch(/explicit user request/i);
  });

  test("explicit request consumed (cleared) after advance in computeLadderState", () => {
    // Use hingeD2 so next rung (db-rdl, d3) has no phase/equipment block.
    const rehabState: LadderState = {
      byPattern: {
        hinge: baseHingeState({ exerciseId: hingeD2, cleanSessionsCount: 0 }),
      },
      explicitAdvanceRequestedByPattern: { hinge: true },
    };

    const newState = computeLadderState({
      currentLadderState: rehabState,
      recentLogs: twoCleanLogs,
      activePatterns: ["hinge"],
      patternToInitExercise: {},
      available: availableEq,
      phaseIndex: 1,
      experienceLevel: "Intermediate",
      painAreas: [],
      deferredIds: new Set(),
      trainingIntent: "rehab",
    });

    // Should have advanced.
    expect(newState.byPattern.hinge?.lastDecisionTrace).toMatch(/advance/);
    // Explicit request should be cleared (consumed).
    expect(newState.explicitAdvanceRequestedByPattern?.hinge).toBeFalsy();
  });
});

// ---------------------------------------------------------------------------
// 3. Rehab mode: extended hysteresis after regression (5 clean sessions)
// ---------------------------------------------------------------------------

describe("rehab mode: extended hysteresis (5 clean sessions) after regression", () => {
  test("pain flag in rehab mode triggers regression with requiredForAdvance=5", () => {
    const painLog = makeLog({ exerciseId: hingeD2, felt: "pain", painLevel: "severe" });
    const decision = computePatternLadderDecision({
      currentState: baseHingeState(),
      exerciseLogs: [painLog],
      available: availableEq,
      phaseIndex: 1,
      experienceLevel: "Intermediate",
      painAreas: [],
      deferredIds: new Set(),
      trainingIntent: "rehab",
    });
    expect(decision.kind).toBe("regress");
    expect(decision.requiredForAdvance).toBe(5);
    expect(decision.trace).toMatch(/5-session hysteresis/);
  });

  test("regression in build mode has requiredForAdvance=3 (baseline)", () => {
    const painLog = makeLog({ exerciseId: hingeD2, felt: "pain", painLevel: "severe" });
    const decision = computePatternLadderDecision({
      currentState: baseHingeState(),
      exerciseLogs: [painLog],
      available: availableEq,
      phaseIndex: 1,
      experienceLevel: "Intermediate",
      painAreas: [],
      deferredIds: new Set(),
      trainingIntent: "build",
    });
    expect(decision.kind).toBe("regress");
    expect(decision.requiredForAdvance).toBe(3);
  });

  test("3 clean sessions not enough to re-advance after rehab regression", () => {
    const inHysteresisState = baseHingeState({
      requiredForAdvance: 5,
      inHysteresis: true,
      cleanSessionsCount: 0,
    });

    const threeCleanLogs = [
      makeLog({ exerciseId: hingeD2, createdAt: "2026-05-01T10:00:00Z" }),
      makeLog({ exerciseId: hingeD2, createdAt: "2026-05-08T10:00:00Z" }),
      makeLog({ exerciseId: hingeD2, createdAt: "2026-05-15T10:00:00Z" }),
    ];

    const decision = computePatternLadderDecision({
      currentState: inHysteresisState,
      exerciseLogs: threeCleanLogs,
      available: availableEq,
      phaseIndex: 1,
      experienceLevel: "Intermediate",
      painAreas: [],
      deferredIds: new Set(),
      trainingIntent: "rehab",
    });

    // Should still hold — need 5 total.
    expect(decision.kind).toBe("hold");
    expect(decision.cleanSessionsCount).toBe(3);
  });

  test("5 clean sessions re-enables advance check (but rehab still blocks without request)", () => {
    const inHysteresisState = baseHingeState({
      requiredForAdvance: 5,
      inHysteresis: true,
      cleanSessionsCount: 0,
    });

    const fiveCleanLogs = Array.from({ length: 5 }, (_, i) =>
      makeLog({
        exerciseId: hingeD2,
        createdAt: `2026-05-${String(i + 1).padStart(2, "0")}T10:00:00Z`,
      })
    );

    const decision = computePatternLadderDecision({
      currentState: inHysteresisState,
      exerciseLogs: fiveCleanLogs,
      available: availableEq,
      phaseIndex: 1,
      experienceLevel: "Intermediate",
      painAreas: [],
      deferredIds: new Set(),
      trainingIntent: "rehab",
      explicitAdvanceRequested: false,
    });

    // Rehab without explicit request → hold even at 5 sessions.
    expect(decision.kind).toBe("hold");
    expect(decision.trace).toMatch(/awaiting explicit user request/);
  });
});

// ---------------------------------------------------------------------------
// 4. Rehab mode: regression paths unchanged
// ---------------------------------------------------------------------------

describe("rehab mode: regression paths identical to build", () => {
  test("deferred (Modify) still triggers regression in rehab", () => {
    const decision = computePatternLadderDecision({
      currentState: baseHingeState(),
      exerciseLogs: [],
      available: availableEq,
      phaseIndex: 1,
      experienceLevel: "Intermediate",
      painAreas: [],
      deferredIds: new Set([hingeD2]),
      trainingIntent: "rehab",
    });
    expect(decision.kind).toBe("regress");
  });

  test("two incomplete sessions → regress in rehab", () => {
    const incompleteLogs = [
      makeLog({ exerciseId: hingeD2, setsPlanned: 3, setsCompleted: 1, createdAt: "2026-05-01T10:00:00Z" }),
      makeLog({ exerciseId: hingeD2, setsPlanned: 3, setsCompleted: 2, createdAt: "2026-05-08T10:00:00Z" }),
    ];
    const decision = computePatternLadderDecision({
      currentState: baseHingeState(),
      exerciseLogs: incompleteLogs,
      available: availableEq,
      phaseIndex: 1,
      experienceLevel: "Intermediate",
      painAreas: [],
      deferredIds: new Set(),
      trainingIntent: "rehab",
    });
    expect(decision.kind).toBe("regress");
  });
});
