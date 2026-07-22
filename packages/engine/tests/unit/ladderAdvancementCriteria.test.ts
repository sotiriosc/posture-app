/**
 * Phase 3 — Ladder Advancement Criteria
 *
 * Truth table for:
 *  ADV-1: each individual advancement criterion failing, then combined pass
 *  ADV-2: equipment-block trace
 *  ADV-3: new rung starts at cleanSessionsCount = 0
 *  ADV-4: ceiling — no auto-jump beyond d5
 *  REG-1: regression across all three triggers (pain, 2x incomplete, deferred)
 *  REG-2: hysteresis — 3 clean sessions required after a regression
 *  IND-1: patterns advance independently
 *
 * Hinge ladder used throughout:
 *   bodyweight-good-morning (d2) → db-rdl (d3) → barbell-romanian-deadlift (d4)
 *   → assisted-nordic-eccentric (d5, ceiling)
 */

import { describe, expect, test } from "vitest";
import type { ExerciseLog } from "@/lib/types";
import type { LadderRungState } from "@/lib/types";
import {
  computePatternLadderDecision,
  computeLadderState,
  getNextLadderRung,
  getPrevLadderRung,
  isCleanSessionLog,
  isRegressionTriggerLog,
  getLadderSwapSet,
  findD1RootForPattern,
} from "@/lib/program/ladderAdvancement";

// ---------------------------------------------------------------------------
// Fixture helpers
// ---------------------------------------------------------------------------

let logCounter = 0;
const makeLog = (
  overrides: Partial<ExerciseLog> & { exerciseId: string }
): ExerciseLog => ({
  id: `log-${++logCounter}`,
  userId: "local",
  sessionId: `session-${logCounter}`,
  exerciseId: overrides.exerciseId,
  section: "main",
  originalExerciseId: null,
  substitutedExerciseId: null,
  programId: "prog-1",
  dayIndex: 0,
  createdAt: overrides.createdAt ?? `2026-01-${String(logCounter).padStart(2, "0")}T10:00:00.000Z`,
  updatedAt: overrides.createdAt ?? `2026-01-${String(logCounter).padStart(2, "0")}T10:00:00.000Z`,
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

const cleanLog = (exerciseId: string, createdAt?: string): ExerciseLog =>
  makeLog({ exerciseId, createdAt, setsPlanned: 3, setsCompleted: 3, rpe: 6, felt: "moderate", painLevel: "none" });

const hingeD2 = "bodyweight-good-morning";
const hingeD3 = "db-rdl";
const hingeD4 = "barbell-romanian-deadlift";
const hingeD5 = "assisted-nordic-eccentric";

const defaultState = (exerciseId: string, overrides?: Partial<LadderRungState>): LadderRungState => ({
  exerciseId,
  pattern: "hinge",
  difficulty: 2,
  cleanSessionsCount: 0,
  requiredForAdvance: 2,
  inHysteresis: false,
  lastDecisionTrace: "init",
  ...overrides,
});

const emptyDeferredIds = new Set<string>();
const allEquipment = new Set(["gym", "barbell", "dumbbells", "cables", "pullup_bar", "bands"] as const) as Set<never>;
const noEquipment = new Set<never>();

// ---------------------------------------------------------------------------
// 1. Ladder walk utilities
// ---------------------------------------------------------------------------

describe("ladder walk utilities", () => {
  test("getNextLadderRung climbs from d2 → d3 → d4 → d5 → null", () => {
    expect(getNextLadderRung(hingeD2)).toBe(hingeD3);
    expect(getNextLadderRung(hingeD3)).toBe(hingeD4);
    expect(getNextLadderRung(hingeD4)).toBe(hingeD5);
    expect(getNextLadderRung(hingeD5)).toBeNull(); // ADV-4 ceiling
  });

  test("getPrevLadderRung descends d4 → d3 → d2 → null at floor", () => {
    expect(getPrevLadderRung(hingeD4)).toBe(hingeD3);
    expect(getPrevLadderRung(hingeD3)).toBe(hingeD2);
    // d2 regresses to d1 or null depending on catalog; either is valid
    const prevFromD2 = getPrevLadderRung(hingeD2);
    if (prevFromD2 !== null) {
      const prevFromD1 = getPrevLadderRung(prevFromD2);
      expect(prevFromD1).toBeNull(); // floor reached
    }
  });

  test("findD1RootForPattern returns a d1 exercise for hinge", () => {
    const root = findD1RootForPattern("hinge");
    expect(root).toBeTruthy();
  });

  test("getLadderSwapSet always includes the rung exercise itself", () => {
    const swapSet = getLadderSwapSet(hingeD3);
    expect(swapSet.has(hingeD3)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 2. isCleanSessionLog / isRegressionTriggerLog
// ---------------------------------------------------------------------------

describe("session log classification", () => {
  test("clean log: all sets done, no pain, rpe≤7", () => {
    expect(isCleanSessionLog(cleanLog(hingeD3))).toBe(true);
  });

  test("not clean: incomplete sets", () => {
    const log = makeLog({ exerciseId: hingeD3, setsPlanned: 3, setsCompleted: 2 });
    expect(isCleanSessionLog(log)).toBe(false);
  });

  test("not clean: pain flag (felt=pain)", () => {
    const log = makeLog({ exerciseId: hingeD3, setsPlanned: 3, setsCompleted: 3, felt: "pain" });
    expect(isCleanSessionLog(log)).toBe(false);
  });

  test("not clean: painLevel=severe", () => {
    const log = makeLog({ exerciseId: hingeD3, setsPlanned: 3, setsCompleted: 3, painLevel: "severe" });
    expect(isCleanSessionLog(log)).toBe(false);
  });

  test("not clean: painLevel=moderate", () => {
    const log = makeLog({ exerciseId: hingeD3, setsPlanned: 3, setsCompleted: 3, painLevel: "moderate" });
    expect(isCleanSessionLog(log)).toBe(false);
  });

  test("not clean: rpe>7", () => {
    const log = makeLog({ exerciseId: hingeD3, setsPlanned: 3, setsCompleted: 3, rpe: 8 });
    expect(isCleanSessionLog(log)).toBe(false);
  });

  test("clean: rpe=null (absent satisfies per §3.8 silence principle)", () => {
    const log = makeLog({ exerciseId: hingeD3, setsPlanned: 3, setsCompleted: 3, rpe: null });
    expect(isCleanSessionLog(log)).toBe(true);
  });

  test("isRegressionTriggerLog detects felt=pain", () => {
    const log = makeLog({ exerciseId: hingeD3, felt: "pain" });
    expect(isRegressionTriggerLog(log)).toBe(true);
  });

  test("isRegressionTriggerLog detects painLevel=severe", () => {
    const log = makeLog({ exerciseId: hingeD3, felt: "moderate", painLevel: "severe" });
    expect(isRegressionTriggerLog(log)).toBe(true);
  });

  test("isRegressionTriggerLog does NOT trigger for mild pain", () => {
    const log = makeLog({ exerciseId: hingeD3, felt: "hard", painLevel: "mild" });
    expect(isRegressionTriggerLog(log)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 3. ADV-1: individual conditions
// ---------------------------------------------------------------------------

describe("ADV-1: advancement requires all conditions (each fails individually)", () => {
  const advancingState = defaultState(hingeD2, { cleanSessionsCount: 1 }); // 1 already logged

  test("ADV-1 combined pass: 2 clean logs → advances to d3", () => {
    const decision = computePatternLadderDecision({
      currentState: defaultState(hingeD2),
      exerciseLogs: [cleanLog(hingeD2, "2026-01-01T00:00:00Z"), cleanLog(hingeD2, "2026-01-05T00:00:00Z")],
      available: allEquipment,
      phaseIndex: 1,
      experienceLevel: "Intermediate",
      painAreas: [],
      deferredIds: emptyDeferredIds,
    });
    expect(decision.kind).toBe("advance");
    expect(decision.newExerciseId).toBe(hingeD3);
    expect(decision.cleanSessionsCount).toBe(0); // ADV-3: reset on new rung
    expect(decision.inHysteresis).toBe(false);
  });

  test("ADV-1 fail: only 1 clean log (need 2) → hold", () => {
    const decision = computePatternLadderDecision({
      currentState: defaultState(hingeD2),
      exerciseLogs: [cleanLog(hingeD2, "2026-01-01T00:00:00Z")],
      available: allEquipment,
      phaseIndex: 1,
      experienceLevel: "Intermediate",
      painAreas: [],
      deferredIds: emptyDeferredIds,
    });
    expect(decision.kind).toBe("hold");
    expect(decision.newExerciseId).toBe(hingeD2);
  });

  test("ADV-1 fail: last log has rpe=8 (effort too high) → hold", () => {
    const decision = computePatternLadderDecision({
      currentState: defaultState(hingeD2),
      exerciseLogs: [
        cleanLog(hingeD2, "2026-01-01T00:00:00Z"),
        makeLog({ exerciseId: hingeD2, createdAt: "2026-01-05T00:00:00Z", setsPlanned: 3, setsCompleted: 3, rpe: 8 }),
      ],
      available: allEquipment,
      phaseIndex: 1,
      experienceLevel: "Intermediate",
      painAreas: [],
      deferredIds: emptyDeferredIds,
    });
    // rpe=8 breaks the clean streak → only 0 new clean sessions
    expect(decision.kind).toBe("hold");
  });

  test("ADV-1 fail: last log is incomplete → hold", () => {
    const decision = computePatternLadderDecision({
      currentState: defaultState(hingeD2),
      exerciseLogs: [
        cleanLog(hingeD2, "2026-01-01T00:00:00Z"),
        makeLog({ exerciseId: hingeD2, createdAt: "2026-01-05T00:00:00Z", setsPlanned: 3, setsCompleted: 2 }),
      ],
      available: allEquipment,
      phaseIndex: 1,
      experienceLevel: "Intermediate",
      painAreas: [],
      deferredIds: emptyDeferredIds,
    });
    expect(decision.kind).toBe("hold");
  });

  test("ADV-1 no logs → hold (preserve existing clean count)", () => {
    const decision = computePatternLadderDecision({
      currentState: defaultState(hingeD2, { cleanSessionsCount: 1 }),
      exerciseLogs: [],
      available: allEquipment,
      phaseIndex: 1,
      experienceLevel: "Intermediate",
      painAreas: [],
      deferredIds: emptyDeferredIds,
    });
    expect(decision.kind).toBe("hold");
    expect(decision.cleanSessionsCount).toBe(1); // preserved
  });

  test("ADV-1 accumulated count: prior 1 + new 1 clean → advances", () => {
    const decision = computePatternLadderDecision({
      currentState: defaultState(hingeD2, { cleanSessionsCount: 1 }),
      exerciseLogs: [cleanLog(hingeD2, "2026-01-10T00:00:00Z")],
      available: allEquipment,
      phaseIndex: 1,
      experienceLevel: "Intermediate",
      painAreas: [],
      deferredIds: emptyDeferredIds,
    });
    expect(decision.kind).toBe("advance");
    expect(decision.newExerciseId).toBe(hingeD3);
  });
});

// ---------------------------------------------------------------------------
// 4. ADV-2: equipment block trace
// ---------------------------------------------------------------------------

describe("ADV-2: equipment block — hold and emit trace", () => {
  test("holds when next rung requires equipment not in available set", () => {
    // barbell-romanian-deadlift requires "barbell" — test with no barbells
    const decision = computePatternLadderDecision({
      currentState: defaultState(hingeD3, { difficulty: 3 }),
      exerciseLogs: [
        cleanLog(hingeD3, "2026-01-01T00:00:00Z"),
        cleanLog(hingeD3, "2026-01-05T00:00:00Z"),
      ],
      available: new Set(["dumbbells", "cables"] as const) as Set<never>,
      phaseIndex: 1,
      experienceLevel: "Intermediate",
      painAreas: [],
      deferredIds: emptyDeferredIds,
    });
    expect(decision.kind).toBe("hold");
    expect(decision.trace).toMatch(/advance blocked: equipment/);
    expect(decision.trace).toMatch(/offer same-difficulty swap/);
  });
});

// ---------------------------------------------------------------------------
// 5. ADV-3: new rung starts at cleanSessionsCount = 0
// ---------------------------------------------------------------------------

describe("ADV-3: new rung initializes cleanSessionsCount to 0", () => {
  test("after advance, cleanSessionsCount resets", () => {
    const decision = computePatternLadderDecision({
      currentState: defaultState(hingeD2),
      exerciseLogs: [
        cleanLog(hingeD2, "2026-01-01T00:00:00Z"),
        cleanLog(hingeD2, "2026-01-05T00:00:00Z"),
      ],
      available: allEquipment,
      phaseIndex: 1,
      experienceLevel: "Intermediate",
      painAreas: [],
      deferredIds: emptyDeferredIds,
    });
    expect(decision.kind).toBe("advance");
    expect(decision.cleanSessionsCount).toBe(0);
    expect(decision.requiredForAdvance).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// 6. ADV-4: ceiling — no jump beyond d5
// ---------------------------------------------------------------------------

describe("ADV-4: ceiling at d5 — hold, no track jump", () => {
  test("at d5 ceiling: hold regardless of clean sessions, emit ceiling trace", () => {
    const decision = computePatternLadderDecision({
      currentState: { exerciseId: hingeD5, pattern: "hinge", difficulty: 5, cleanSessionsCount: 5, requiredForAdvance: 2, inHysteresis: false, lastDecisionTrace: "" },
      exerciseLogs: [
        cleanLog(hingeD5, "2026-01-01T00:00:00Z"),
        cleanLog(hingeD5, "2026-01-05T00:00:00Z"),
      ],
      available: allEquipment,
      phaseIndex: 2,
      experienceLevel: "Advanced",
      painAreas: [],
      deferredIds: emptyDeferredIds,
    });
    expect(decision.kind).toBe("hold");
    expect(decision.newExerciseId).toBe(hingeD5);
    expect(decision.trace).toMatch(/ceiling/);
  });
});

// ---------------------------------------------------------------------------
// 7. REG-1: regression triggers
// ---------------------------------------------------------------------------

describe("REG-1: immediate regression on any trigger", () => {
  const d3State: LadderRungState = {
    exerciseId: hingeD3,
    pattern: "hinge",
    difficulty: 3,
    cleanSessionsCount: 0,
    requiredForAdvance: 2,
    inHysteresis: false,
    lastDecisionTrace: "",
  };

  test("REG-1a: pain flag in last 2 logs → regress to d2", () => {
    const decision = computePatternLadderDecision({
      currentState: d3State,
      exerciseLogs: [
        cleanLog(hingeD3, "2026-01-01T00:00:00Z"),
        makeLog({ exerciseId: hingeD3, createdAt: "2026-01-05T00:00:00Z", setsPlanned: 3, setsCompleted: 3, felt: "pain", painLevel: "severe" }),
      ],
      available: allEquipment,
      phaseIndex: 1,
      experienceLevel: "Intermediate",
      painAreas: [],
      deferredIds: emptyDeferredIds,
    });
    expect(decision.kind).toBe("regress");
    expect(decision.newExerciseId).toBe(hingeD2);
    expect(decision.trace).toMatch(/pain flag/);
  });

  test("REG-1a: painLevel=severe only (felt=moderate) → regress", () => {
    const decision = computePatternLadderDecision({
      currentState: d3State,
      exerciseLogs: [
        makeLog({ exerciseId: hingeD3, createdAt: "2026-01-01T00:00:00Z", setsPlanned: 3, setsCompleted: 3, felt: "moderate", painLevel: "severe" }),
      ],
      available: allEquipment,
      phaseIndex: 1,
      experienceLevel: "Intermediate",
      painAreas: [],
      deferredIds: emptyDeferredIds,
    });
    expect(decision.kind).toBe("regress");
  });

  test("REG-1b: two consecutive incomplete sessions → regress", () => {
    const decision = computePatternLadderDecision({
      currentState: d3State,
      exerciseLogs: [
        makeLog({ exerciseId: hingeD3, createdAt: "2026-01-01T00:00:00Z", setsPlanned: 3, setsCompleted: 1 }),
        makeLog({ exerciseId: hingeD3, createdAt: "2026-01-05T00:00:00Z", setsPlanned: 3, setsCompleted: 2 }),
      ],
      available: allEquipment,
      phaseIndex: 1,
      experienceLevel: "Intermediate",
      painAreas: [],
      deferredIds: emptyDeferredIds,
    });
    expect(decision.kind).toBe("regress");
    expect(decision.trace).toMatch(/two consecutive incomplete/);
  });

  test("REG-1b: only ONE incomplete session → hold (not regress)", () => {
    const decision = computePatternLadderDecision({
      currentState: d3State,
      exerciseLogs: [
        cleanLog(hingeD3, "2026-01-01T00:00:00Z"),
        makeLog({ exerciseId: hingeD3, createdAt: "2026-01-05T00:00:00Z", setsPlanned: 3, setsCompleted: 2 }),
      ],
      available: allEquipment,
      phaseIndex: 1,
      experienceLevel: "Intermediate",
      painAreas: [],
      deferredIds: emptyDeferredIds,
    });
    expect(decision.kind).toBe("hold");
  });

  test("REG-1c: deferred flag (Modify) → regress", () => {
    const decision = computePatternLadderDecision({
      currentState: d3State,
      exerciseLogs: [cleanLog(hingeD3, "2026-01-01T00:00:00Z")],
      available: allEquipment,
      phaseIndex: 1,
      experienceLevel: "Intermediate",
      painAreas: [],
      deferredIds: new Set([hingeD3]),
    });
    expect(decision.kind).toBe("regress");
    expect(decision.trace).toMatch(/deferred by user/);
  });

  test("regression never goes below d1 — stays at d2 when at d2 with no prev", () => {
    // If d2 has no regressionOf within its pattern, it stays at d2
    const decision = computePatternLadderDecision({
      currentState: defaultState(hingeD2),
      exerciseLogs: [
        makeLog({ exerciseId: hingeD2, createdAt: "2026-01-01T00:00:00Z", setsPlanned: 3, setsCompleted: 3, felt: "pain", painLevel: "severe" }),
      ],
      available: allEquipment,
      phaseIndex: 1,
      experienceLevel: "Intermediate",
      painAreas: [],
      deferredIds: emptyDeferredIds,
    });
    expect(decision.kind).toBe("regress");
    // result must be ≤ d2 (safety floor)
    const { newExerciseId } = decision;
    // bodyweight-good-morning is d2; regression may go to d1 or stay at d2
    expect(decision.newDifficulty).toBeLessThanOrEqual(2);
  });
});

// ---------------------------------------------------------------------------
// 8. REG-2: hysteresis
// ---------------------------------------------------------------------------

describe("REG-2: hysteresis — 3 clean sessions required after regression", () => {
  test("after regression, requiredForAdvance = 3 and inHysteresis = true", () => {
    const decision = computePatternLadderDecision({
      currentState: defaultState(hingeD3, { difficulty: 3 }),
      exerciseLogs: [
        makeLog({ exerciseId: hingeD3, createdAt: "2026-01-01T00:00:00Z", setsPlanned: 3, setsCompleted: 3, felt: "pain", painLevel: "severe" }),
      ],
      available: allEquipment,
      phaseIndex: 1,
      experienceLevel: "Intermediate",
      painAreas: [],
      deferredIds: emptyDeferredIds,
    });
    expect(decision.kind).toBe("regress");
    expect(decision.requiredForAdvance).toBe(3);
    expect(decision.inHysteresis).toBe(true);
  });

  test("hysteresis: 2 clean sessions after regression → still hold", () => {
    const hysteresisState: LadderRungState = {
      exerciseId: hingeD2,
      pattern: "hinge",
      difficulty: 2,
      cleanSessionsCount: 0,
      requiredForAdvance: 3, // post-regression
      inHysteresis: true,
      lastDecisionTrace: "regress hinge: pain flag",
    };
    const decision = computePatternLadderDecision({
      currentState: hysteresisState,
      exerciseLogs: [
        cleanLog(hingeD2, "2026-01-01T00:00:00Z"),
        cleanLog(hingeD2, "2026-01-05T00:00:00Z"),
      ],
      available: allEquipment,
      phaseIndex: 1,
      experienceLevel: "Intermediate",
      painAreas: [],
      deferredIds: emptyDeferredIds,
    });
    expect(decision.kind).toBe("hold");
    expect(decision.cleanSessionsCount).toBe(2);
    expect(decision.requiredForAdvance).toBe(3);
  });

  test("hysteresis: 3 clean sessions after regression → advance", () => {
    const hysteresisState: LadderRungState = {
      exerciseId: hingeD2,
      pattern: "hinge",
      difficulty: 2,
      cleanSessionsCount: 1, // 1 already logged
      requiredForAdvance: 3,
      inHysteresis: true,
      lastDecisionTrace: "regress hinge: pain flag",
    };
    const decision = computePatternLadderDecision({
      currentState: hysteresisState,
      exerciseLogs: [
        cleanLog(hingeD2, "2026-01-01T00:00:00Z"),
        cleanLog(hingeD2, "2026-01-05T00:00:00Z"),
      ],
      available: allEquipment,
      phaseIndex: 1,
      experienceLevel: "Intermediate",
      painAreas: [],
      deferredIds: emptyDeferredIds,
    });
    expect(decision.kind).toBe("advance");
    expect(decision.newExerciseId).toBe(hingeD3);
    expect(decision.inHysteresis).toBe(false); // cleared after advance
    expect(decision.requiredForAdvance).toBe(2); // back to normal
  });
});

// ---------------------------------------------------------------------------
// 9. IND-1: patterns advance independently
// ---------------------------------------------------------------------------

describe("IND-1: patterns advance independently", () => {
  const hingeExerciseId = "bodyweight-good-morning"; // d2 hinge
  const pullExerciseId = "band-row"; // any horizontal_pull exercise

  test("hinge advances while pull holds — different patterns, different decisions", () => {
    const ladderState = computeLadderState({
      currentLadderState: {
        byPattern: {
          hinge: {
            exerciseId: hingeExerciseId,
            pattern: "hinge",
            difficulty: 2,
            cleanSessionsCount: 1,
            requiredForAdvance: 2,
            inHysteresis: false,
            lastDecisionTrace: "",
          },
          horizontal_pull: {
            exerciseId: pullExerciseId,
            pattern: "horizontal_pull",
            difficulty: 1,
            cleanSessionsCount: 0,
            requiredForAdvance: 2,
            inHysteresis: false,
            lastDecisionTrace: "",
          },
        },
      },
      recentLogs: [
        // Hinge: 1 clean session → will advance (1 prior + 1 new = 2)
        cleanLog(hingeExerciseId),
        // Pull: no logs → hold
      ],
      activePatterns: ["hinge", "horizontal_pull"],
      patternToInitExercise: {},
      available: allEquipment,
      phaseIndex: 1,
      experienceLevel: "Intermediate",
      painAreas: [],
      deferredIds: emptyDeferredIds,
    });

    // Hinge should advance
    expect(ladderState.byPattern.hinge?.lastDecisionTrace).toMatch(/advance/);
    // Pull should hold (no logs)
    expect(ladderState.byPattern.horizontal_pull?.lastDecisionTrace).toMatch(/hold/);
  });
});
