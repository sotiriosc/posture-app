/**
 * Phase 3.3 — Training Intent: Maintain mode tests
 *
 * Coverage:
 *  - Criteria-met scenarios produce "hold" not "advance" in maintain mode
 *  - Regression still fires on pain in maintain mode (safety unchanged)
 *  - Trace records "advancement criteria met; holding by user preference"
 *  - Phase-transition prompt fires once per pattern per phase
 *  - progressionOverride flips advancement for that pattern only (IND-1)
 *  - "Keep maintaining" leaves state unchanged (prompt marked shown)
 */

import { describe, expect, test } from "vitest";
import type { ExerciseLog, LadderRungState, LadderState } from "@/lib/types";
import { computePatternLadderDecision, computeLadderState } from "@/lib/program/ladderAdvancement";
import {
  computeMaintainPrompts,
  markMaintainPromptsShown,
  applyMaintainProgressionYes,
  applyMaintainProgressionNo,
} from "@/lib/program/trainingIntent";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let seq = 0;
const makeLog = (overrides: Partial<ExerciseLog> & { exerciseId: string }): ExerciseLog => ({
  id: `log-${++seq}`,
  userId: "local",
  sessionId: `sess-${seq}`,
  exerciseId: overrides.exerciseId,
  section: "main",
  originalExerciseId: null,
  substitutedExerciseId: null,
  programId: "prog-maintain",
  dayIndex: 0,
  createdAt: `2026-04-${String(seq).padStart(2, "0")}T10:00:00Z`,
  updatedAt: `2026-04-${String(seq).padStart(2, "0")}T10:00:00Z`,
  loadType: "weighted",
  unit: "lb",
  weight: 100,
  reps: 12,
  repsBySet: [12, 12, 12],
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
  computedVolume: 3600,
  source: "local",
  deletedAt: null,
  ...overrides,
});

// Use hingeD2 → hingeD3 chain: db-rdl has no phaseMin block and only needs dumbbells.
const hingeD2 = "bodyweight-good-morning";
const hingeD3 = "db-rdl";
const hingePattern = "hinge";

const baseHingeState = (): LadderRungState => ({
  exerciseId: hingeD2, // advance to hingeD3 = db-rdl (dumbbells, no phaseMin)
  pattern: hingePattern,
  difficulty: 2,
  cleanSessionsCount: 0,
  requiredForAdvance: 2,
  inHysteresis: false,
  lastDecisionTrace: "",
});

const twoCleanLogs = [
  makeLog({ exerciseId: hingeD2, createdAt: "2026-04-01T10:00:00Z" }),
  makeLog({ exerciseId: hingeD2, createdAt: "2026-04-08T10:00:00Z" }),
];

const availableEq = new Set(["dumbbells", "barbell", "cables", "gym"] as const) as Set<never>;

// ---------------------------------------------------------------------------
// 1. Maintain mode: advance → hold
// ---------------------------------------------------------------------------

describe("maintain mode: advancement suppressed", () => {
  test("2 clean sessions would advance in build mode", () => {
    const decision = computePatternLadderDecision({
      currentState: baseHingeState(),
      exerciseLogs: twoCleanLogs,
      available: availableEq,
      phaseIndex: 1,
      experienceLevel: "Intermediate",
      painAreas: [],
      deferredIds: new Set(),
      trainingIntent: "build",
    });
    expect(decision.kind).toBe("advance");
  });

  test("same 2 clean sessions produce HOLD in maintain mode", () => {
    const decision = computePatternLadderDecision({
      currentState: baseHingeState(),
      exerciseLogs: twoCleanLogs,
      available: availableEq,
      phaseIndex: 1,
      experienceLevel: "Intermediate",
      painAreas: [],
      deferredIds: new Set(),
      trainingIntent: "maintain",
    });
    expect(decision.kind).toBe("hold");
  });

  test("maintain hold trace records 'advancement criteria met; holding by user preference'", () => {
    const decision = computePatternLadderDecision({
      currentState: baseHingeState(),
      exerciseLogs: twoCleanLogs,
      available: availableEq,
      phaseIndex: 1,
      experienceLevel: "Intermediate",
      painAreas: [],
      deferredIds: new Set(),
      trainingIntent: "maintain",
    });
    expect(decision.trace).toMatch(/advancement criteria met/);
    expect(decision.trace).toMatch(/holding by user preference/);
  });
});

// ---------------------------------------------------------------------------
// 2. Maintain mode: regression still fires on pain (safety unchanged)
// ---------------------------------------------------------------------------

describe("maintain mode: regression on pain is unchanged", () => {
  test("pain log → regress in maintain mode", () => {
    const painLog = makeLog({ exerciseId: hingeD2, felt: "pain", painLevel: "severe" });
    const decision = computePatternLadderDecision({
      currentState: baseHingeState(),
      exerciseLogs: [painLog],
      available: availableEq,
      phaseIndex: 1,
      experienceLevel: "Intermediate",
      painAreas: [],
      deferredIds: new Set(),
      trainingIntent: "maintain",
    });
    expect(decision.kind).toBe("regress");
  });

  test("two consecutive incomplete → regress in maintain mode", () => {
    const logs = [
      makeLog({ exerciseId: hingeD2, setsPlanned: 3, setsCompleted: 1, createdAt: "2026-04-01T10:00:00Z" }),
      makeLog({ exerciseId: hingeD2, setsPlanned: 3, setsCompleted: 2, createdAt: "2026-04-08T10:00:00Z" }),
    ];
    const decision = computePatternLadderDecision({
      currentState: baseHingeState(),
      exerciseLogs: logs,
      available: availableEq,
      phaseIndex: 1,
      experienceLevel: "Intermediate",
      painAreas: [],
      deferredIds: new Set(),
      trainingIntent: "maintain",
    });
    expect(decision.kind).toBe("regress");
  });
});

// ---------------------------------------------------------------------------
// 3. Phase-transition prompt fires once per pattern per phase
// ---------------------------------------------------------------------------

describe("computeMaintainPrompts: fires once per pattern per phase", () => {
  const maintainHoldState: LadderState = {
    byPattern: {
      hinge: {
        exerciseId: hingeD2,
        pattern: hingePattern,
        difficulty: 2,
        cleanSessionsCount: 2,
        requiredForAdvance: 2,
        inHysteresis: false,
        lastDecisionTrace: "maintain intent: advancement criteria met for hinge; holding by user preference",
      },
    },
  };

  test("returns prompt for hinge when criteria met and not yet shown", () => {
    const prompts = computeMaintainPrompts({
      trainingIntent: "maintain",
      ladderState: maintainHoldState,
      phaseIndex: 1,
    });
    expect(prompts).toHaveLength(1);
    expect(prompts[0]!.pattern).toBe("hinge");
    expect(prompts[0]!.phaseIndex).toBe(1);
  });

  test("does NOT fire when already shown at current phase", () => {
    const shownState: LadderState = {
      ...maintainHoldState,
      maintainPromptShownAtPhase: { hinge: 1 },
    };
    const prompts = computeMaintainPrompts({
      trainingIntent: "maintain",
      ladderState: shownState,
      phaseIndex: 1,
    });
    expect(prompts).toHaveLength(0);
  });

  test("fires again at next phase", () => {
    const shownState: LadderState = {
      ...maintainHoldState,
      maintainPromptShownAtPhase: { hinge: 1 },
    };
    const prompts = computeMaintainPrompts({
      trainingIntent: "maintain",
      ladderState: shownState,
      phaseIndex: 2,
    });
    expect(prompts).toHaveLength(1);
  });

  test("does NOT fire for build or rehab intent", () => {
    for (const intent of ["build", "rehab"] as const) {
      const prompts = computeMaintainPrompts({
        trainingIntent: intent,
        ladderState: maintainHoldState,
        phaseIndex: 1,
      });
      expect(prompts).toHaveLength(0);
    }
  });

  test("does NOT fire when last trace is not 'advancement criteria met'", () => {
    const holdState: LadderState = {
      byPattern: {
        hinge: {
          ...maintainHoldState.byPattern.hinge!,
          lastDecisionTrace: "hold hinge: 1/2 clean sessions",
        },
      },
    };
    const prompts = computeMaintainPrompts({
      trainingIntent: "maintain",
      ladderState: holdState,
      phaseIndex: 1,
    });
    expect(prompts).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// 4. progressionOverride: "Yes, let's progress" flips advance for one pattern
// ---------------------------------------------------------------------------

describe("applyMaintainProgressionYes: sets progressionOverride for one pattern", () => {
  test("sets progressionOverrideByPattern[pattern] = 'build'", () => {
    const initial: LadderState = {
      byPattern: {
        hinge: {
          exerciseId: hingeD2,
          pattern: hingePattern,
          difficulty: 2,
          cleanSessionsCount: 2,
          requiredForAdvance: 2,
          inHysteresis: false,
          lastDecisionTrace: "maintain intent: advancement criteria met for hinge; holding by user preference",
        },
      },
    };
    const updated = applyMaintainProgressionYes(initial, "hinge");
    expect(updated.progressionOverrideByPattern?.hinge).toBe("build");
  });

  test("override causes advance on next computeLadderState call", () => {
    const hingeState: LadderState = {
      byPattern: {
        hinge: {
          exerciseId: hingeD2, // d2 → d3 (db-rdl, no phase block)
          pattern: hingePattern,
          difficulty: 2,
          cleanSessionsCount: 2,
          requiredForAdvance: 2,
          inHysteresis: false,
          lastDecisionTrace: "",
        },
      },
      progressionOverrideByPattern: { hinge: "build" },
    };

    const newState = computeLadderState({
      currentLadderState: hingeState,
      recentLogs: twoCleanLogs,
      activePatterns: ["hinge"],
      patternToInitExercise: {},
      available: availableEq,
      phaseIndex: 1,
      experienceLevel: "Intermediate",
      painAreas: [],
      deferredIds: new Set(),
      trainingIntent: "maintain", // intent still maintain, but override is present
    });

    expect(newState.byPattern.hinge?.lastDecisionTrace).toMatch(/advance/);
  });

  test("override is per-pattern — other patterns still hold", () => {
    const multiState: LadderState = {
      byPattern: {
        hinge: {
          exerciseId: hingeD2, // d2 → d3 (db-rdl, no phase block)
          pattern: "hinge",
          difficulty: 2,
          cleanSessionsCount: 2,
          requiredForAdvance: 2,
          inHysteresis: false,
          lastDecisionTrace: "",
        },
        horizontal_push: {
          exerciseId: "incline-pushup",
          pattern: "horizontal_push",
          difficulty: 2,
          cleanSessionsCount: 2,
          requiredForAdvance: 2,
          inHysteresis: false,
          lastDecisionTrace: "",
        },
      },
      progressionOverrideByPattern: { hinge: "build" }, // only hinge overridden
    };

    const pushLogs = [
      makeLog({ exerciseId: "incline-pushup", createdAt: "2026-04-01T10:00:00Z" }),
      makeLog({ exerciseId: "incline-pushup", createdAt: "2026-04-08T10:00:00Z" }),
    ];

    const newState = computeLadderState({
      currentLadderState: multiState,
      recentLogs: [...twoCleanLogs, ...pushLogs],
      activePatterns: ["hinge", "horizontal_push"],
      patternToInitExercise: {},
      available: availableEq,
      phaseIndex: 1,
      experienceLevel: "Intermediate",
      painAreas: [],
      deferredIds: new Set(),
      trainingIntent: "maintain",
    });

    // hinge should advance (override present)
    expect(newState.byPattern.hinge?.lastDecisionTrace).toMatch(/advance/);
    // horizontal_push should hold (no override)
    expect(newState.byPattern.horizontal_push?.lastDecisionTrace).toMatch(/maintain intent|hold/);
  });
});

// ---------------------------------------------------------------------------
// 5. "Keep maintaining" — prompt marked shown, state unchanged
// ---------------------------------------------------------------------------

describe("applyMaintainProgressionNo + markMaintainPromptsShown", () => {
  test("applyMaintainProgressionNo returns unchanged ladderState", () => {
    const state: LadderState = { byPattern: {} };
    const result = applyMaintainProgressionNo(state);
    expect(result).toBe(state); // strict reference equality
  });

  test("markMaintainPromptsShown records phase for all given patterns", () => {
    const state: LadderState = { byPattern: {} };
    const updated = markMaintainPromptsShown(state, ["hinge", "horizontal_push"], 2);
    expect(updated.maintainPromptShownAtPhase?.hinge).toBe(2);
    expect(updated.maintainPromptShownAtPhase?.horizontal_push).toBe(2);
  });

  test("marking empty array returns unchanged state", () => {
    const state: LadderState = { byPattern: {} };
    const result = markMaintainPromptsShown(state, [], 1);
    expect(result).toBe(state);
  });
});
