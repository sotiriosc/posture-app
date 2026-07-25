import { describe, expect, it } from "vitest";
import {
  getPhaseMaxSessions,
  getPhaseMinSessions,
} from "@/lib/program/phaseGatingConstants";
import {
  computeReadinessVerdict,
  type PhaseGatingInput,
} from "@/lib/program/phaseGatingEvaluator";
import type { LadderState } from "@/lib/types";

const greenSessions = (n: number) =>
  Array.from({ length: n }, () => ({
    completed: "yes" as const,
    maxPain: "none" as const,
    effortBand: "moderate" as const,
    confidenceBand: "moderate" as const,
  }));

const criteriaReadyActivation = (
  sessionsInPhase: number,
  sessionsPerWeek: number
): PhaseGatingInput => ({
  phase: "activation",
  sessionsInPhase,
  sessionsPerWeek,
  recentSessions: greenSessions(5),
  ladderState: {
    byPattern: {
      hinge: {
        exerciseId: "h",
        pattern: "hinge",
        difficulty: 2,
        cleanSessionsCount: 2,
        requiredForAdvance: 2,
        inHysteresis: false,
        lastDecisionTrace: "",
      },
      knee_dominant: {
        exerciseId: "k",
        pattern: "knee_dominant",
        difficulty: 2,
        cleanSessionsCount: 2,
        requiredForAdvance: 2,
        inHysteresis: false,
        lastDecisionTrace: "",
      },
    },
  } satisfies LadderState,
  rungsClimbedSincePhaseStart: { hinge: 1, knee_dominant: 1 },
  deferredExerciseCount: 0,
  trainingIntent: "build",
});

describe("phase gating floor (Phase 6j — 8 × sessions_per_week)", () => {
  it("3x/week floor is 24 sessions", () => {
    expect(getPhaseMinSessions(3)).toBe(24);
  });

  it("4x/week floor is 32 sessions", () => {
    expect(getPhaseMinSessions(4)).toBe(32);
  });

  it("5x/week floor is 40 sessions", () => {
    expect(getPhaseMinSessions(5)).toBe(40);
  });

  it("max is always above the frequency-scaled floor", () => {
    for (const spw of [3, 4, 5] as const) {
      expect(getPhaseMaxSessions("activation", spw)).toBeGreaterThanOrEqual(
        getPhaseMinSessions(spw)
      );
      expect(getPhaseMaxSessions("skill", spw)).toBeGreaterThanOrEqual(
        getPhaseMinSessions(spw)
      );
    }
  });

  it("3x persona: criteria met before floor → hold until floor", () => {
    const beforeFloor = computeReadinessVerdict(criteriaReadyActivation(23, 3));
    expect(beforeFloor.verdict).toBe("hold");
    expect(beforeFloor.reason).toBe("min_not_reached");

    const atFloor = computeReadinessVerdict(criteriaReadyActivation(24, 3));
    expect(atFloor.verdict).toBe("advance");
    expect(atFloor.reason).toBe("criteria_met");
  });

  it("4x persona: criteria met before floor → hold until 32", () => {
    const beforeFloor = computeReadinessVerdict(criteriaReadyActivation(31, 4));
    expect(beforeFloor.verdict).toBe("hold");
    expect(beforeFloor.reason).toBe("min_not_reached");

    const atFloor = computeReadinessVerdict(criteriaReadyActivation(32, 4));
    expect(atFloor.verdict).toBe("advance");
    expect(atFloor.reason).toBe("criteria_met");
  });

  it("5x persona: floor is 40; advance when both clear", () => {
    const beforeFloor = computeReadinessVerdict(criteriaReadyActivation(39, 5));
    expect(beforeFloor.verdict).toBe("hold");
    expect(beforeFloor.reason).toBe("min_not_reached");

    const atFloor = computeReadinessVerdict(criteriaReadyActivation(40, 5));
    expect(atFloor.verdict).toBe("advance");
    expect(atFloor.reason).toBe("criteria_met");
  });

  it("floor reached without criteria → hold until criteria met", () => {
    const result = computeReadinessVerdict({
      phase: "activation",
      sessionsInPhase: 24,
      sessionsPerWeek: 3,
      recentSessions: greenSessions(5).map((s) => ({
        ...s,
        completed: "no" as const,
        confidenceBand: "low" as const,
      })),
      rungsClimbedSincePhaseStart: {},
      deferredExerciseCount: 5,
      trainingIntent: "build",
    });
    expect(result.verdict).toBe("hold");
    expect(result.reason).toBe("criteria_unmet");
  });
});
