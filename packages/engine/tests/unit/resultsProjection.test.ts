/**
 * Phase 5 — resultsProjection.test.ts
 *
 * Tests that the projectResults() pure function produces the expected
 * ResultsProjection shape from persisted program state.
 *
 * Coverage:
 *   (1) Pure & deterministic: same inputs → same output across N runs.
 *   (2) laddersClimbed: populated from rungAdvancementHistory.
 *   (3) currentRungByPattern: populated from ladderState.byPattern.
 *   (4) retiredTags: only tags with retiredAt are included.
 *   (5) activeTags: tags not retired are included; notEnoughSignal flag
 *       set when last assessment was below CONFIDENCE_FLOOR.
 *   (6) sacrificeRetestQueue: populated from sacrificedByPattern.
 *   (7) phaseHistory: populated from Program.phaseHistory.
 *   (8) consistency: session count from log sessionIds.
 *   (9) provenanceFooter: baselineDate, retestCount, trace count.
 *  (10) Empty program (no history) produces valid zero-state projection.
 */

import { describe, expect, test } from "vitest";
import { projectResults } from "@/lib/results/resultsProjection";
import type {
  AssessmentObservationRecord,
  AssessmentSnapshot,
  ExerciseLog,
  FocusTagLifecycleState,
  PhaseTransitionRecord,
  Program,
  ProgramDay,
  RungAdvancementRecord,
} from "@/lib/types";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const TIMESTAMP_1 = "2026-01-01T10:00:00.000Z";
const TIMESTAMP_2 = "2026-02-01T10:00:00.000Z";
const TIMESTAMP_3 = "2026-03-01T10:00:00.000Z";

const makeDay = (overrides: Partial<ProgramDay> = {}): ProgramDay => ({
  dayIndex: 0,
  title: "Full Body A",
  focusTags: [],
  routine: [],
  ...overrides,
});

const makeProgram = (overrides: Partial<Program> = {}): Program => ({
  id: "test-program",
  userId: null,
  createdAt: TIMESTAMP_1,
  updatedAt: TIMESTAMP_1,
  templateVersion: 1,
  goalTrack: null,
  daysPerWeek: 3,
  estimatedSessionMinutesRange: { min: 45, max: 60 },
  phaseIndex: 0,
  phaseName: "activation",
  weekIndex: 0,
  totalWeekIndex: 0,
  cycleIndex: 0,
  phase: {
    name: "activation",
    phaseIndex: 0,
    cycleIndex: 0,
    weekIndex: 0,
    weekCount: 4,
    goal: "Build movement baseline",
  },
  nextWeekPlan: {
    summary: "Foundation week",
    change: "Continue",
    reason: "Building base",
  },
  week: [makeDay()],
  source: "local",
  deletedAt: null,
  ...overrides,
});

const makeLog = (overrides: Partial<ExerciseLog> = {}): ExerciseLog => ({
  id: `log-${Math.random().toString(36).slice(2)}`,
  userId: null,
  sessionId: "session-1",
  exerciseId: "deadlift-barbell",
  createdAt: "2026-01-10T09:00:00.000Z",
  updatedAt: "2026-01-10T09:00:00.000Z",
  loadType: "weighted",
  unit: "lb",
  weight: 135,
  reps: 5,
  repsBySet: null,
  setsPlanned: 3,
  setsCompleted: 3,
  durationSec: null,
  rpe: 7,
  felt: "moderate",
  notes: null,
  computedVolume: 2025,
  source: "local",
  deletedAt: null,
  ...overrides,
});

const makeObservation = (
  overrides: Partial<AssessmentObservationRecord> = {}
): AssessmentObservationRecord => ({
  focusTag: "forward_head",
  measuredValue: 0.12,
  threshold: 0.08,
  keypointConfidences: [0.8, 0.8],
  ...overrides,
});

const makeSnapshot = (overrides: Partial<AssessmentSnapshot> = {}): AssessmentSnapshot => ({
  timestamp: TIMESTAMP_1,
  phase: 0,
  confidenceScore: 0.85,
  observations: [makeObservation()],
  status: "accepted",
  ...overrides,
});

const makeRungAdvancement = (
  overrides: Partial<RungAdvancementRecord> = {}
): RungAdvancementRecord => ({
  pattern: "hinge",
  fromExerciseId: "romanian-deadlift",
  fromDifficulty: 1,
  toExerciseId: "deadlift-barbell",
  toDifficulty: 2,
  atSessionCount: 8,
  atPhase: 0,
  trace: "advance hinge: 2/2 clean sessions → deadlift-barbell (d2)",
  ...overrides,
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("projectResults — core shape", () => {
  test("(10) empty program produces valid zero-state projection", () => {
    const result = projectResults(makeProgram(), []);
    expect(result.laddersClimbed).toEqual([]);
    expect(result.currentRungByPattern).toEqual([]);
    expect(result.retiredTags).toEqual([]);
    expect(result.activeTags).toEqual([]);
    expect(result.sacrificeRetestQueue).toEqual([]);
    expect(result.consistency.sessionsCompleted).toBe(0);
    expect(result.provenanceFooter.retestCount).toBe(0);
    expect(result.provenanceFooter.totalDecisionTraces).toBe(0);
  });

  test("(1) deterministic: same inputs produce identical output", () => {
    const program = makeProgram({
      ladderState: {
        byPattern: {
          hinge: {
            exerciseId: "romanian-deadlift",
            pattern: "hinge",
            difficulty: 1,
            cleanSessionsCount: 1,
            requiredForAdvance: 2,
            inHysteresis: false,
            lastDecisionTrace: "hold hinge: 1/2 clean sessions",
          },
        },
        rungAdvancementHistory: [makeRungAdvancement()],
      },
    });
    const logs = [makeLog()];
    const r1 = projectResults(program, logs);
    const r2 = projectResults(program, logs);
    expect(r1).toEqual(r2);
  });
});

describe("laddersClimbed", () => {
  test("(2) populated from rungAdvancementHistory", () => {
    const advancement = makeRungAdvancement();
    const program = makeProgram({
      ladderState: {
        byPattern: {},
        rungAdvancementHistory: [advancement],
      },
    });
    const result = projectResults(program, []);
    expect(result.laddersClimbed).toHaveLength(1);
    const climbed = result.laddersClimbed[0];
    expect(climbed.pattern).toBe("hinge");
    expect(climbed.fromDifficulty).toBe(1);
    expect(climbed.toDifficulty).toBe(2);
    expect(climbed.atSessionCount).toBe(8);
    expect(climbed.atPhase).toBe(0);
    expect(climbed.criteriaSatisfied).toContain(advancement.trace);
  });

  test("empty rungAdvancementHistory → no ladders climbed", () => {
    const program = makeProgram({ ladderState: { byPattern: {} } });
    const result = projectResults(program, []);
    expect(result.laddersClimbed).toEqual([]);
  });

  test("multiple advancements across patterns are all included", () => {
    const advancements = [
      makeRungAdvancement({ pattern: "hinge", atSessionCount: 5 }),
      makeRungAdvancement({ pattern: "horizontal_push", fromDifficulty: 1, toDifficulty: 2, atSessionCount: 10 }),
      makeRungAdvancement({ pattern: "hinge", fromDifficulty: 2, toDifficulty: 3, atSessionCount: 15 }),
    ];
    const program = makeProgram({
      ladderState: { byPattern: {}, rungAdvancementHistory: advancements },
    });
    const result = projectResults(program, []);
    expect(result.laddersClimbed).toHaveLength(3);
  });
});

describe("currentRungByPattern", () => {
  test("(3) populated from ladderState.byPattern", () => {
    const program = makeProgram({
      ladderState: {
        byPattern: {
          hinge: {
            exerciseId: "romanian-deadlift",
            pattern: "hinge",
            difficulty: 1,
            cleanSessionsCount: 1,
            requiredForAdvance: 2,
            inHysteresis: false,
            lastDecisionTrace: "hold hinge: 1/2 clean sessions",
          },
        },
      },
    });
    const result = projectResults(program, []);
    expect(result.currentRungByPattern).toHaveLength(1);
    const rung = result.currentRungByPattern[0];
    expect(rung.pattern).toBe("hinge");
    expect(rung.exerciseId).toBe("romanian-deadlift");
    expect(rung.difficulty).toBe(1);
    expect(rung.sessionsAtRung).toBe(1);
    expect(typeof rung.nextRungRequirements).toBe("string");
    expect(rung.nextRungRequirements.length).toBeGreaterThan(0);
  });
});

describe("retiredTags", () => {
  test("(4) only tags with retiredAt are included", () => {
    const activeState: FocusTagLifecycleState = {
      focusTag: "scapular_control",
      firstSeenAt: TIMESTAMP_1,
      escalationBumps: 0,
    };
    const retiredState: FocusTagLifecycleState = {
      focusTag: "forward_head",
      firstSeenAt: TIMESTAMP_1,
      retiredAt: TIMESTAMP_2,
      retirementTrace:
        "forward_head focus retired — retest cleared threshold on [2026-01-01 → 2026-02-01] — corrective slot reallocated.",
      escalationBumps: 0,
    };
    const program = makeProgram({
      focusTagLifecycle: {
        scapular_control: activeState,
        forward_head: retiredState,
      },
      assessmentHistory: [
        makeSnapshot({ observations: [makeObservation({ focusTag: "forward_head" })] }),
      ],
    });
    const result = projectResults(program, []);
    expect(result.retiredTags).toHaveLength(1);
    expect(result.retiredTags[0].tag).toBe("forward_head");
    expect(result.retiredTags[0].reason).toBe("cleared_2x");
  });

  test("strong clear reason is parsed from retirementTrace", () => {
    const state: FocusTagLifecycleState = {
      focusTag: "forward_head",
      firstSeenAt: TIMESTAMP_1,
      retiredAt: TIMESTAMP_2,
      retirementTrace: "forward_head focus retired — strong clear: metric 0.040 ≥15% under threshold 0.08 — corrective slot reallocated.",
      escalationBumps: 0,
    };
    const program = makeProgram({ focusTagLifecycle: { forward_head: state } });
    const result = projectResults(program, []);
    expect(result.retiredTags[0].reason).toBe("cleared_strong");
  });

  test("retired tag includes baseline and final values when available", () => {
    const state: FocusTagLifecycleState = {
      focusTag: "forward_head",
      firstSeenAt: TIMESTAMP_1,
      retiredAt: TIMESTAMP_3,
      retirementTrace: "forward_head focus retired — retest cleared threshold on [x → y] — corrective slot reallocated.",
      escalationBumps: 0,
    };
    const program = makeProgram({
      focusTagLifecycle: { forward_head: state },
      assessmentHistory: [
        makeSnapshot({ timestamp: TIMESTAMP_1, observations: [makeObservation({ measuredValue: 0.12 })] }),
        makeSnapshot({ timestamp: TIMESTAMP_2, status: "user_retook", observations: [makeObservation({ measuredValue: 0.06 })] }),
      ],
    });
    const result = projectResults(program, []);
    expect(result.retiredTags[0].baselineValue).toBe(0.12);
    expect(result.retiredTags[0].finalValue).toBe(0.06);
  });
});

describe("activeTags", () => {
  test("(5) active tags exclude retired ones", () => {
    const program = makeProgram({
      focusTagLifecycle: {
        forward_head: {
          focusTag: "forward_head",
          firstSeenAt: TIMESTAMP_1,
          retiredAt: TIMESTAMP_2,
          retirementTrace: "forward_head focus retired — retest cleared threshold — corrective slot reallocated.",
          escalationBumps: 0,
        },
      },
      assessmentHistory: [
        makeSnapshot({ observations: [makeObservation({ focusTag: "forward_head" })] }),
      ],
    });
    const result = projectResults(program, []);
    expect(result.activeTags.map((t) => t.tag)).not.toContain("forward_head");
  });

  test("(5) notEnoughSignal flag set when last assessment was low-confidence", () => {
    const program = makeProgram({
      assessmentHistory: [
        makeSnapshot({ confidenceScore: 0.85, timestamp: TIMESTAMP_1 }),
        makeSnapshot({
          confidenceScore: 0.40, // below CONFIDENCE_FLOOR
          timestamp: TIMESTAMP_2,
          status: "user_retook",
        }),
      ],
    });
    const result = projectResults(program, []);
    const activeWithSignal = result.activeTags.filter((t) => t.notEnoughSignal);
    expect(activeWithSignal.length).toBeGreaterThan(0);
  });

  test("active tag direction is improving when latest value < baseline", () => {
    const program = makeProgram({
      assessmentHistory: [
        makeSnapshot({ timestamp: TIMESTAMP_1, observations: [makeObservation({ measuredValue: 0.15 })] }),
        makeSnapshot({ timestamp: TIMESTAMP_2, status: "user_retook", observations: [makeObservation({ measuredValue: 0.09 })] }),
      ],
    });
    const result = projectResults(program, []);
    const fh = result.activeTags.find((t) => t.tag === "forward_head");
    expect(fh?.direction).toBe("improving");
  });
});

describe("sacrificeRetestQueue", () => {
  test("(6) populated from sacrificedByPattern; eligibility from phaseTransitionState", () => {
    const program = makeProgram({
      ladderState: {
        byPattern: {},
        sacrificedByPattern: { hinge: ["romanian-deadlift"] },
      },
      phaseTransitionState: {
        phase: "activation",
        sessionsInPhase: 12,
        criteriaLastEvaluated: [],
        unlockedAt: 12,
        lastTrace: "advance activation",
        sacrificeRetestEligible: [
          {
            exerciseId: "romanian-deadlift",
            sacrificedAtPhase: "activation",
            trace: "sacrifice retest eligible: romanian-deadlift",
          },
        ],
      },
    });
    const result = projectResults(program, []);
    expect(result.sacrificeRetestQueue).toHaveLength(1);
    expect(result.sacrificeRetestQueue[0].exerciseId).toBe("romanian-deadlift");
    expect(result.sacrificeRetestQueue[0].eligibleForRetestNow).toBe(true);
  });
});

describe("phaseHistory", () => {
  test("(7) populated from Program.phaseHistory", () => {
    const phaseRecord: PhaseTransitionRecord = {
      phase: "activation",
      enteredAtSessionCount: 0,
      exitedAtSessionCount: 12,
      criteriaAtExit: ["rungs_climbed: ✓ — 2/2 patterns advanced"],
      trace: "advance activation: 5/5 criteria met",
    };
    const program = makeProgram({ phaseHistory: [phaseRecord] });
    const result = projectResults(program, []);
    expect(result.phaseHistory).toHaveLength(1);
    expect(result.phaseHistory[0].phase).toBe("activation");
    expect(result.phaseHistory[0].exitedAtSessionCount).toBe(12);
    expect(result.phaseHistory[0].criteriaAtExit).toEqual(phaseRecord.criteriaAtExit);
  });

  test("no phaseHistory but current phaseTransitionState → produces 1 open record", () => {
    const program = makeProgram({
      phaseTransitionState: {
        phase: "skill",
        sessionsInPhase: 6,
        criteriaLastEvaluated: [],
        lastTrace: "hold skill: 3/6 criteria met",
      },
    });
    const result = projectResults(program, []);
    expect(result.phaseHistory).toHaveLength(1);
    expect(result.phaseHistory[0].exitedAtSessionCount).toBeNull();
  });
});

describe("consistency", () => {
  test("(8) sessionsCompleted counts unique sessionIds", () => {
    const logs = [
      makeLog({ sessionId: "s1", createdAt: "2026-01-05T09:00:00.000Z" }),
      makeLog({ sessionId: "s1", createdAt: "2026-01-05T09:05:00.000Z" }),
      makeLog({ sessionId: "s2", createdAt: "2026-01-08T09:00:00.000Z" }),
      makeLog({ sessionId: "s3", createdAt: "2026-01-10T09:00:00.000Z" }),
    ];
    const result = projectResults(makeProgram(), logs);
    expect(result.consistency.sessionsCompleted).toBe(3);
  });

  test("deleted logs are excluded from session count", () => {
    const logs = [
      makeLog({ sessionId: "s1", createdAt: "2026-01-05T09:00:00.000Z" }),
      makeLog({ sessionId: "s2", createdAt: "2026-01-08T09:00:00.000Z", deletedAt: "2026-01-09T00:00:00.000Z" }),
    ];
    const result = projectResults(makeProgram(), logs);
    expect(result.consistency.sessionsCompleted).toBe(1);
  });
});

describe("provenanceFooter", () => {
  test("(9) baseline and latest dates from assessmentHistory", () => {
    const program = makeProgram({
      assessmentHistory: [
        makeSnapshot({ timestamp: TIMESTAMP_1 }),
        makeSnapshot({ timestamp: TIMESTAMP_2, status: "user_retook" }),
        makeSnapshot({ timestamp: TIMESTAMP_3, status: "user_retook" }),
      ],
    });
    const result = projectResults(program, []);
    expect(result.provenanceFooter.baselineAssessmentDate).toBe(TIMESTAMP_1);
    expect(result.provenanceFooter.latestAssessmentDate).toBe(TIMESTAMP_3);
    expect(result.provenanceFooter.retestCount).toBe(2);
  });

  test("insufficient_confidence snapshots excluded from retest count", () => {
    const program = makeProgram({
      assessmentHistory: [
        makeSnapshot({ timestamp: TIMESTAMP_1, status: "accepted" }),
        makeSnapshot({ timestamp: TIMESTAMP_2, status: "insufficient_confidence" }),
        makeSnapshot({ timestamp: TIMESTAMP_3, status: "user_retook" }),
      ],
    });
    const result = projectResults(program, []);
    // Only accepted + user_retook count: 2 − 1 = 1 retest.
    expect(result.provenanceFooter.retestCount).toBe(1);
  });

  test("totalDecisionTraces counts selectionDebug.decisionTrace entries in week", () => {
    const program = makeProgram({
      week: [
        makeDay({
          routine: [
            {
              exerciseId: "deadlift-barbell",
              section: "main",
              selectionDebug: {
                source: "scored",
                decisionTrace: {
                  patternSlotId: "hinge-main",
                  slotScore: 8.5,
                  penaltyReasons: [],
                  bonusReasons: [],
                  fatigueOverlapPenalty: 0,
                },
              },
            },
            {
              exerciseId: "romanian-deadlift",
              section: "main",
              selectionDebug: {
                source: "scored",
                decisionTrace: {
                  patternSlotId: "hinge-secondary",
                  slotScore: 7.2,
                  penaltyReasons: [],
                  bonusReasons: [],
                  fatigueOverlapPenalty: 0,
                },
              },
            },
          ],
        }),
      ],
    });
    const result = projectResults(program, []);
    expect(result.provenanceFooter.totalDecisionTraces).toBe(2);
  });
});
