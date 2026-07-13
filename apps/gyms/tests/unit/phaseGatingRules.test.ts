import { describe, expect, test } from "vitest";
import { canAdvancePhase } from "@/lib/phaseGating";
import { applyCompletedDayToProgramProgress } from "@/lib/programProgress";
import type { ProgramProgress } from "@/lib/types";

describe("phase gating rules", () => {
  test("phase 1 passes with either 30 days or daysPerWeek * 4 workouts", () => {
    const blocked = canAdvancePhase(
      {
        phaseIndex: 1,
        phaseStartedAt: "2026-01-25T00:00:00.000Z",
        workoutsCompletedInPhase: 11,
        cyclesCompletedInPhase: 4,
        daysPerWeek: 3,
      },
      "2026-02-05T00:00:00.000Z"
    );
    expect(blocked.ok).toBe(false);
    expect(blocked.minWorkouts).toBe(12);
    expect(blocked.reasons.join(" ")).toContain("12 workouts");
    expect(blocked.reasons.join(" ")).toContain("30 days");
    expect(blocked.satisfiedBy).toBeNull();

    const passedByWorkouts = canAdvancePhase(
      {
        phaseIndex: 1,
        phaseStartedAt: "2026-01-25T00:00:00.000Z",
        workoutsCompletedInPhase: 12,
        cyclesCompletedInPhase: 0,
        daysPerWeek: 3,
      },
      "2026-02-01T00:00:00.000Z"
    );
    expect(passedByWorkouts.ok).toBe(true);
    expect(passedByWorkouts.satisfiedBy).toBe("workouts");

    const passedByDays = canAdvancePhase(
      {
        phaseIndex: 1,
        phaseStartedAt: "2026-01-01T00:00:00.000Z",
        workoutsCompletedInPhase: 1,
        cyclesCompletedInPhase: 0,
        daysPerWeek: 3,
      },
      "2026-02-01T00:00:00.000Z"
    );
    expect(passedByDays.ok).toBe(true);
    expect(passedByDays.satisfiedBy).toBe("days");

    const passedByBoth = canAdvancePhase(
      {
        phaseIndex: 1,
        phaseStartedAt: "2026-01-01T00:00:00.000Z",
        workoutsCompletedInPhase: 12,
        cyclesCompletedInPhase: 0,
        daysPerWeek: 3,
      },
      "2026-02-01T00:00:00.000Z"
    );
    expect(passedByBoth.ok).toBe(true);
    expect(passedByBoth.satisfiedBy).toBe("both");
  });

  test("phase 2 and phase 3+ pass with either 60 days or daysPerWeek * 8 workouts", () => {
    const phase2Blocked = canAdvancePhase(
      {
        phaseIndex: 2,
        phaseStartedAt: "2026-01-25T00:00:00.000Z",
        workoutsCompletedInPhase: 31,
        cyclesCompletedInPhase: 99,
        daysPerWeek: 4,
      },
      "2026-02-01T00:00:00.000Z"
    );
    expect(phase2Blocked.ok).toBe(false);
    expect(phase2Blocked.minWorkouts).toBe(32);
    expect(phase2Blocked.reasons.join(" ")).toContain("32 workouts");

    const phase2PassedByWorkouts = canAdvancePhase(
      {
        phaseIndex: 2,
        phaseStartedAt: "2026-01-25T00:00:00.000Z",
        workoutsCompletedInPhase: 32,
        cyclesCompletedInPhase: 0,
        daysPerWeek: 4,
      },
      "2026-02-01T00:00:00.000Z"
    );
    expect(phase2PassedByWorkouts.ok).toBe(true);
    expect(phase2PassedByWorkouts.satisfiedBy).toBe("workouts");

    const phase2PassedByDays = canAdvancePhase(
      {
        phaseIndex: 2,
        phaseStartedAt: "2026-01-01T00:00:00.000Z",
        workoutsCompletedInPhase: 1,
        cyclesCompletedInPhase: 0,
        daysPerWeek: 4,
      },
      "2026-03-15T00:00:00.000Z"
    );
    expect(phase2PassedByDays.ok).toBe(true);
    expect(phase2PassedByDays.satisfiedBy).toBe("days");

    const phase3Blocked = canAdvancePhase(
      {
        phaseIndex: 3,
        phaseStartedAt: "2026-01-25T00:00:00.000Z",
        workoutsCompletedInPhase: 39,
        cyclesCompletedInPhase: 99,
        daysPerWeek: 5,
      },
      "2026-02-20T00:00:00.000Z"
    );
    expect(phase3Blocked.ok).toBe(false);
    expect(phase3Blocked.minWorkouts).toBe(40);
    expect(phase3Blocked.reasons.join(" ")).toContain("40 workouts");
    expect(phase3Blocked.reasons.join(" ")).toContain("60 days");
  });
});

describe("week completion cycle counting", () => {
  test("completing all days increments cycles and resets day completion state", () => {
    const base: ProgramProgress = {
      programId: "program-1",
      lastCompletedDayIndex: null,
      nextDayIndex: 0,
      completedDayIndices: [],
      phaseIndex: 1,
      phaseStartedAt: "2026-01-01T00:00:00.000Z",
      cyclesCompletedInPhase: 0,
      workoutsCompletedInPhase: 0,
      daysPerWeek: 3,
      weekIndex: 1,
      countedWeekKeys: [],
      updatedAt: "2026-01-01T00:00:00.000Z",
    };

    const afterDay1 = applyCompletedDayToProgramProgress({
      priorProgress: base,
      programId: "program-1",
      phaseIndex: 1,
      daysPerWeek: 3,
      completedDayIndex: 0,
      completedAtIso: "2026-01-02T00:00:00.000Z",
      phaseStartedAtFallback: "2026-01-01T00:00:00.000Z",
    }).progress;
    const afterDay2 = applyCompletedDayToProgramProgress({
      priorProgress: afterDay1,
      programId: "program-1",
      phaseIndex: 1,
      daysPerWeek: 3,
      completedDayIndex: 1,
      completedAtIso: "2026-01-03T00:00:00.000Z",
      phaseStartedAtFallback: "2026-01-01T00:00:00.000Z",
    }).progress;
    const afterDay3 = applyCompletedDayToProgramProgress({
      priorProgress: afterDay2,
      programId: "program-1",
      phaseIndex: 1,
      daysPerWeek: 3,
      completedDayIndex: 2,
      completedAtIso: "2026-01-04T00:00:00.000Z",
      phaseStartedAtFallback: "2026-01-01T00:00:00.000Z",
    }).progress;

    expect(afterDay1.workoutsCompletedInPhase).toBe(1);
    expect(afterDay2.workoutsCompletedInPhase).toBe(2);
    expect(afterDay3.workoutsCompletedInPhase).toBe(3);
    expect(afterDay3.cyclesCompletedInPhase).toBe(1);
    expect(afterDay3.completedDayIndices).toEqual([]);
    expect(afterDay3.nextDayIndex).toBe(0);
    expect(afterDay3.weekIndex).toBe(2);
  });

  test("same week key cannot increment cycles twice", () => {
    const prior: ProgramProgress = {
      programId: "program-1",
      lastCompletedDayIndex: 1,
      nextDayIndex: 2,
      completedDayIndices: [0, 1],
      phaseIndex: 1,
      phaseStartedAt: "2026-01-01T00:00:00.000Z",
      cyclesCompletedInPhase: 1,
      workoutsCompletedInPhase: 2,
      daysPerWeek: 3,
      weekIndex: 1,
      countedWeekKeys: ["program-1:1:1"],
      updatedAt: "2026-01-04T00:00:00.000Z",
    };

    const result = applyCompletedDayToProgramProgress({
      priorProgress: prior,
      programId: "program-1",
      phaseIndex: 1,
      daysPerWeek: 3,
      completedDayIndex: 2,
      completedAtIso: "2026-01-05T00:00:00.000Z",
      phaseStartedAtFallback: "2026-01-01T00:00:00.000Z",
    }).progress;

    expect(result.cyclesCompletedInPhase).toBe(1);
    expect(result.workoutsCompletedInPhase).toBe(3);
    expect(result.countedWeekKeys).toEqual(["program-1:1:1"]);
  });
});
