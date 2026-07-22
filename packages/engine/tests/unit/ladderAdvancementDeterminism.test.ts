/**
 * Phase 3 — Ladder Advancement Determinism
 *
 * TRC-1: All decisions derive ONLY from persisted logs + seed.
 * Same inputs → same decisions across N runs.
 * No Date.now() inside decision logic.
 *
 * Extends existing determinism suite matrix.
 */

import { describe, expect, test } from "vitest";
import type { ExerciseLog, LadderRungState, LadderState } from "@/lib/types";
import {
  computePatternLadderDecision,
  computeLadderState,
  LADDER_MAIN_PATTERNS,
} from "@/lib/program/ladderAdvancement";

// ---------------------------------------------------------------------------
// Fixture helpers (duplicated from criteria test to keep tests independent)
// ---------------------------------------------------------------------------

let seq = 0;
const makeLog = (overrides: Partial<ExerciseLog> & { exerciseId: string }): ExerciseLog => ({
  id: `det-log-${++seq}`,
  userId: "local",
  sessionId: `det-session-${seq}`,
  exerciseId: overrides.exerciseId,
  section: "main",
  originalExerciseId: null,
  substitutedExerciseId: null,
  programId: "det-prog",
  dayIndex: 0,
  createdAt: overrides.createdAt ?? `2026-01-${String(seq).padStart(2, "0")}T10:00:00.000Z`,
  updatedAt: overrides.createdAt ?? `2026-01-${String(seq).padStart(2, "0")}T10:00:00.000Z`,
  loadType: "weighted",
  unit: "lb",
  weight: 100,
  reps: 10,
  repsBySet: [10, 10, 10],
  setsPlanned: overrides.setsPlanned ?? 3,
  setsCompleted: overrides.setsCompleted ?? 3,
  durationSec: null,
  workSecondsUsed: null,
  restSecondsUsed: null,
  rpe: overrides.rpe ?? 6,
  felt: overrides.felt ?? "moderate",
  painLevel: overrides.painLevel ?? "none",
  painLocation: null,
  nextTimeGuidance: null,
  feedbackNotes: null,
  notes: null,
  computedVolume: 1000,
  source: "local",
  deletedAt: null,
  ...overrides,
});

const hingeD2 = "bodyweight-good-morning";
const hingeD3 = "db-rdl";
const allEquipment = new Set(["gym", "barbell", "dumbbells", "cables", "pullup_bar", "bands"] as const) as Set<never>;

const makeHingeState = (exerciseId: string, overrides?: Partial<LadderRungState>): LadderRungState => ({
  exerciseId,
  pattern: "hinge",
  difficulty: 2,
  cleanSessionsCount: 0,
  requiredForAdvance: 2,
  inHysteresis: false,
  lastDecisionTrace: "init hinge",
  ...overrides,
});

// ---------------------------------------------------------------------------
// TRC-1: same inputs → same output, N runs
// ---------------------------------------------------------------------------

describe("TRC-1: ladder decisions are deterministic (no Date.now)", () => {
  const exerciseLogs = [
    makeLog({ exerciseId: hingeD2, createdAt: "2026-01-10T00:00:00Z", setsPlanned: 3, setsCompleted: 3, rpe: 6, felt: "moderate" }),
    makeLog({ exerciseId: hingeD2, createdAt: "2026-01-15T00:00:00Z", setsPlanned: 3, setsCompleted: 3, rpe: 5, felt: "easy" }),
  ];
  const currentState = makeHingeState(hingeD2);

  test("computePatternLadderDecision: 10 identical runs produce identical output", () => {
    const first = computePatternLadderDecision({
      currentState,
      exerciseLogs,
      available: allEquipment,
      phaseIndex: 1,
      experienceLevel: "Intermediate",
      painAreas: [],
      deferredIds: new Set(),
    });

    for (let i = 0; i < 9; i++) {
      const run = computePatternLadderDecision({
        currentState,
        exerciseLogs,
        available: allEquipment,
        phaseIndex: 1,
        experienceLevel: "Intermediate",
        painAreas: [],
        deferredIds: new Set(),
      });
      expect(run.kind).toBe(first.kind);
      expect(run.newExerciseId).toBe(first.newExerciseId);
      expect(run.cleanSessionsCount).toBe(first.cleanSessionsCount);
      expect(run.requiredForAdvance).toBe(first.requiredForAdvance);
      expect(run.inHysteresis).toBe(first.inHysteresis);
      expect(run.trace).toBe(first.trace);
    }
  });

  test("computePatternLadderDecision: regression scenario deterministic", () => {
    const painLogs = [
      makeLog({ exerciseId: hingeD3, createdAt: "2026-01-10T00:00:00Z", felt: "pain", painLevel: "severe" }),
    ];
    const d3State = makeHingeState(hingeD3, { difficulty: 3 });

    const first = computePatternLadderDecision({
      currentState: d3State,
      exerciseLogs: painLogs,
      available: allEquipment,
      phaseIndex: 1,
      experienceLevel: "Intermediate",
      painAreas: [],
      deferredIds: new Set(),
    });
    expect(first.kind).toBe("regress");

    for (let i = 0; i < 9; i++) {
      const run = computePatternLadderDecision({
        currentState: d3State,
        exerciseLogs: painLogs,
        available: allEquipment,
        phaseIndex: 1,
        experienceLevel: "Intermediate",
        painAreas: [],
        deferredIds: new Set(),
      });
      expect(run.kind).toBe("regress");
      expect(run.newExerciseId).toBe(first.newExerciseId);
      expect(run.trace).toBe(first.trace);
    }
  });

  test("computeLadderState: full state computation deterministic", () => {
    const currentLadderState: LadderState = {
      byPattern: {
        hinge: makeHingeState(hingeD2),
      },
    };
    const recentLogs = [
      makeLog({ exerciseId: hingeD2, createdAt: "2026-01-05T00:00:00Z", setsPlanned: 3, setsCompleted: 3, rpe: 6, felt: "moderate" }),
      makeLog({ exerciseId: hingeD2, createdAt: "2026-01-10T00:00:00Z", setsPlanned: 3, setsCompleted: 3, rpe: 5, felt: "easy" }),
    ];

    const first = computeLadderState({
      currentLadderState,
      recentLogs,
      activePatterns: ["hinge"],
      patternToInitExercise: {},
      available: allEquipment,
      phaseIndex: 1,
      experienceLevel: "Intermediate",
      painAreas: [],
      deferredIds: new Set(),
    });

    for (let i = 0; i < 4; i++) {
      const run = computeLadderState({
        currentLadderState,
        recentLogs,
        activePatterns: ["hinge"],
        patternToInitExercise: {},
        available: allEquipment,
        phaseIndex: 1,
        experienceLevel: "Intermediate",
        painAreas: [],
        deferredIds: new Set(),
      });
      expect(JSON.stringify(run)).toBe(JSON.stringify(first));
    }
  });
});

// ---------------------------------------------------------------------------
// TRC-1: log order matters only by timestamp — not insertion order
// ---------------------------------------------------------------------------

describe("TRC-1: sort by createdAt, not array insertion order", () => {
  test("reversed log array produces same result as chronological order", () => {
    const chronological = [
      makeLog({ exerciseId: hingeD2, createdAt: "2026-01-01T00:00:00Z", setsPlanned: 3, setsCompleted: 3, rpe: 6, felt: "moderate" }),
      makeLog({ exerciseId: hingeD2, createdAt: "2026-01-10T00:00:00Z", setsPlanned: 3, setsCompleted: 3, rpe: 5, felt: "easy" }),
    ];
    const reversed = [...chronological].reverse();

    const state = makeHingeState(hingeD2);
    const baseParams = {
      currentState: state,
      available: allEquipment,
      phaseIndex: 1,
      experienceLevel: "Intermediate" as const,
      painAreas: [] as string[],
      deferredIds: new Set<string>(),
    };

    const fromChronological = computePatternLadderDecision({ ...baseParams, exerciseLogs: chronological });
    const fromReversed = computePatternLadderDecision({ ...baseParams, exerciseLogs: reversed });

    expect(fromChronological.kind).toBe(fromReversed.kind);
    expect(fromChronological.newExerciseId).toBe(fromReversed.newExerciseId);
    expect(fromChronological.cleanSessionsCount).toBe(fromReversed.cleanSessionsCount);
  });
});

// ---------------------------------------------------------------------------
// Silence principle (§3.8): absent feedback fields satisfy criteria
// ---------------------------------------------------------------------------

describe("§3.8 silence principle: absent feedback fields satisfy advancement", () => {
  test("null rpe + null felt + all sets done = clean session", () => {
    const decision = computePatternLadderDecision({
      currentState: makeHingeState(hingeD2),
      exerciseLogs: [
        makeLog({ exerciseId: hingeD2, createdAt: "2026-01-01T00:00:00Z", setsPlanned: 3, setsCompleted: 3, rpe: null, felt: null, painLevel: null }),
        makeLog({ exerciseId: hingeD2, createdAt: "2026-01-05T00:00:00Z", setsPlanned: 3, setsCompleted: 3, rpe: null, felt: null, painLevel: null }),
      ],
      available: allEquipment,
      phaseIndex: 1,
      experienceLevel: "Intermediate",
      painAreas: [],
      deferredIds: new Set(),
    });
    expect(decision.kind).toBe("advance");
  });

  test("silent persona: 8 sessions, all completed, no feedback → advances normally", () => {
    const silentLogs = Array.from({ length: 8 }, (_, i) =>
      makeLog({
        exerciseId: hingeD2,
        createdAt: `2026-01-${String(i + 1).padStart(2, "0")}T00:00:00Z`,
        setsPlanned: 3,
        setsCompleted: 3,
        rpe: null,
        felt: null,
        painLevel: null,
      })
    );

    // Start with clean 0; should advance after processing
    const decision = computePatternLadderDecision({
      currentState: makeHingeState(hingeD2),
      exerciseLogs: silentLogs,
      available: allEquipment,
      phaseIndex: 1,
      experienceLevel: "Intermediate",
      painAreas: [],
      deferredIds: new Set(),
    });
    expect(decision.kind).toBe("advance");
  });

  test("abandonment persona: incomplete sessions → hold (not advance)", () => {
    const abandonedLogs = Array.from({ length: 4 }, (_, i) =>
      makeLog({
        exerciseId: hingeD2,
        createdAt: `2026-01-${String(i + 1).padStart(2, "0")}T00:00:00Z`,
        setsPlanned: 3,
        setsCompleted: 1, // abandoned
        rpe: null,
        felt: null,
        painLevel: null,
      })
    );

    const decision = computePatternLadderDecision({
      currentState: makeHingeState(hingeD2),
      exerciseLogs: abandonedLogs,
      available: allEquipment,
      phaseIndex: 1,
      experienceLevel: "Intermediate",
      painAreas: [],
      deferredIds: new Set(),
    });
    expect(decision.kind).not.toBe("advance");
  });
});
