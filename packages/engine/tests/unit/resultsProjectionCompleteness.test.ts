/**
 * Phase 5 — resultsProjectionCompleteness.test.ts
 *
 * SR-5 compliance: every field in the projection is either derived from real
 * state or explicitly marked as missing.  No silent zeros.  No fake data.
 *
 * Coverage:
 *   (1) Projection fields that lack state sources produce honest markers,
 *       not silent zeros or fabricated numbers.
 *   (2) Low-confidence photo persona: notEnoughSignal=true for affected
 *       observations; no fake values substituted.
 *   (3) No field silently shows "0" when data is genuinely absent vs. zero.
 *   (4) All required projection fields are present (schema completeness).
 *   (5) provenanceFooter.footerLine is never empty.
 *   (6) Round-trip: JSON.stringify/parse of projection produces identical shape.
 */

import { describe, expect, test } from "vitest";
import { projectResults } from "@/lib/results/resultsProjection";
import type {
  AssessmentSnapshot,
  ExerciseLog,
  Program,
  ProgramDay,
} from "@/lib/types";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const makeProgram = (overrides: Partial<Program> = {}): Program => ({
  id: "test",
  userId: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
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
    goal: "Base",
  },
  nextWeekPlan: { summary: "week 1", change: "none", reason: "first" },
  week: [],
  source: "local",
  deletedAt: null,
  ...overrides,
});

const makeDay = (overrides: Partial<ProgramDay> = {}): ProgramDay => ({
  dayIndex: 0,
  title: "Day 1",
  focusTags: [],
  routine: [],
  ...overrides,
});

const makeLog = (overrides: Partial<ExerciseLog> = {}): ExerciseLog => ({
  id: `log-${Math.random().toString(36).slice(2)}`,
  userId: null,
  sessionId: "s1",
  exerciseId: "ex1",
  createdAt: "2026-01-01T09:00:00.000Z",
  updatedAt: "2026-01-01T09:00:00.000Z",
  loadType: "bodyweight",
  unit: null,
  weight: null,
  reps: 10,
  repsBySet: null,
  setsPlanned: 3,
  setsCompleted: 3,
  durationSec: null,
  rpe: 6,
  felt: "moderate",
  notes: null,
  computedVolume: null,
  source: "local",
  deletedAt: null,
  ...overrides,
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("SR-5 — no silent zeros or fake data", () => {
  test("(1) sessionsCompleted is 0 when no logs are present, not fabricated", () => {
    const result = projectResults(makeProgram(), []);
    // 0 is honest when no logs exist.
    expect(result.consistency.sessionsCompleted).toBe(0);
  });

  test("(1) laddersClimbed is [] when rungAdvancementHistory is absent, not fabricated", () => {
    const program = makeProgram({
      ladderState: { byPattern: {} },
    });
    const result = projectResults(program, []);
    expect(result.laddersClimbed).toEqual([]);
  });

  test("(3) retestCount is 0 when only the baseline snapshot exists, not -1 or undefined", () => {
    const program = makeProgram({
      assessmentHistory: [
        {
          timestamp: "2026-01-01T10:00:00.000Z",
          phase: 0,
          confidenceScore: 0.85,
          observations: [],
          status: "accepted",
        } satisfies AssessmentSnapshot,
      ],
    });
    const result = projectResults(program, []);
    expect(result.provenanceFooter.retestCount).toBe(0);
  });
});

describe("(2) Low-confidence photo — notEnoughSignal", () => {
  test("tag from low-confidence assessment has notEnoughSignal=true", () => {
    const program = makeProgram({
      assessmentHistory: [
        {
          timestamp: "2026-01-01T10:00:00.000Z",
          phase: 0,
          confidenceScore: 0.85,
          observations: [
            {
              focusTag: "forward_head",
              measuredValue: 0.12,
              threshold: 0.08,
              keypointConfidences: [0.9],
            },
          ],
          status: "accepted",
        },
        {
          timestamp: "2026-02-01T10:00:00.000Z",
          phase: 0,
          confidenceScore: 0.40, // below CONFIDENCE_FLOOR = 0.55
          observations: [
            {
              focusTag: "forward_head",
              measuredValue: 0.10,
              threshold: 0.08,
              keypointConfidences: [0.3],
            },
          ],
          status: "user_retook",
        },
      ],
    });
    const result = projectResults(program, []);
    const fhTag = result.activeTags.find((t) => t.tag === "forward_head");
    expect(fhTag).toBeDefined();
    expect(fhTag!.notEnoughSignal).toBe(true);
  });

  test("high-confidence latest assessment does not set notEnoughSignal", () => {
    const program = makeProgram({
      assessmentHistory: [
        {
          timestamp: "2026-01-01T10:00:00.000Z",
          phase: 0,
          confidenceScore: 0.85,
          observations: [
            {
              focusTag: "forward_head",
              measuredValue: 0.12,
              threshold: 0.08,
              keypointConfidences: [0.9],
            },
          ],
          status: "accepted",
        },
      ],
    });
    const result = projectResults(program, []);
    const fhTag = result.activeTags.find((t) => t.tag === "forward_head");
    if (fhTag) {
      expect(fhTag.notEnoughSignal).toBe(false);
    }
  });
});

describe("(4) Schema completeness", () => {
  test("all required top-level fields are present", () => {
    const result = projectResults(makeProgram(), []);
    const requiredFields: (keyof typeof result)[] = [
      "laddersClimbed",
      "currentRungByPattern",
      "retiredTags",
      "activeTags",
      "sacrificeRetestQueue",
      "phaseHistory",
      "consistency",
      "provenanceFooter",
    ];
    for (const field of requiredFields) {
      expect(result).toHaveProperty(field);
    }
  });

  test("consistency has all required sub-fields", () => {
    const result = projectResults(makeProgram(), [makeLog()]);
    expect(result.consistency).toHaveProperty("sessionsCompleted");
    expect(result.consistency).toHaveProperty("streakCurrent");
    expect(result.consistency).toHaveProperty("streakLongest");
    expect(result.consistency).toHaveProperty("completionRateLast30");
  });

  test("provenanceFooter has all required sub-fields", () => {
    const result = projectResults(makeProgram(), []);
    expect(result.provenanceFooter).toHaveProperty("baselineAssessmentDate");
    expect(result.provenanceFooter).toHaveProperty("latestAssessmentDate");
    expect(result.provenanceFooter).toHaveProperty("retestCount");
    expect(result.provenanceFooter).toHaveProperty("totalDecisionTraces");
    expect(result.provenanceFooter).toHaveProperty("footerLine");
  });
});

describe("(5) provenanceFooter.footerLine", () => {
  test("is never empty", () => {
    const result = projectResults(makeProgram(), []);
    expect(result.provenanceFooter.footerLine.length).toBeGreaterThan(0);
  });

  test("has trust message when decision traces exist", () => {
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
          ],
        }),
      ],
    });
    const result = projectResults(program, []);
    expect(result.provenanceFooter.footerLine).toContain("logged with its reasoning");
  });
});

describe("(6) JSON round-trip", () => {
  test("projection survives JSON.stringify / JSON.parse", () => {
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
            lastDecisionTrace: "hold hinge",
          },
        },
        rungAdvancementHistory: [
          {
            pattern: "hinge",
            fromExerciseId: "deadlift-sumo",
            fromDifficulty: 1,
            toExerciseId: "romanian-deadlift",
            toDifficulty: 2,
            atSessionCount: 6,
            atPhase: 0,
            trace: "advance hinge: 2/2 clean sessions → romanian-deadlift (d2)",
          },
        ],
      },
    });
    const original = projectResults(program, [makeLog()]);
    const roundTripped = JSON.parse(JSON.stringify(original));
    expect(roundTripped).toEqual(original);
  });
});
