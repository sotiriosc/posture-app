import { describe, expect, test } from "vitest";
import { canAdvancePhase } from "@/lib/phaseGating";
import { applyCompletedDayToProgramProgress } from "@/lib/programProgress";
import type { ProgramProgress } from "@/lib/types";

describe("phase gating rules", () => {
  test("phase 1 requires at least 2 cycles and 14 days", () => {
    const blocked = canAdvancePhase(
      {
        phaseIndex: 1,
        phaseStartedAt: "2026-01-10T00:00:00.000Z",
        cyclesCompletedInPhase: 1,
      },
      "2026-01-20T00:00:00.000Z"
    );
    expect(blocked.ok).toBe(false);
    expect(blocked.reasons.join(" ")).toContain("2 cycles");
    expect(blocked.reasons.join(" ")).toContain("14 days");

    const passed = canAdvancePhase(
      {
        phaseIndex: 1,
        phaseStartedAt: "2026-01-01T00:00:00.000Z",
        cyclesCompletedInPhase: 2,
      },
      "2026-01-20T00:00:00.000Z"
    );
    expect(passed.ok).toBe(true);
  });

  test("phase 2 and phase 3+ thresholds are enforced", () => {
    const phase2Blocked = canAdvancePhase(
      {
        phaseIndex: 2,
        phaseStartedAt: "2026-01-01T00:00:00.000Z",
        cyclesCompletedInPhase: 3,
      },
      "2026-01-25T00:00:00.000Z"
    );
    expect(phase2Blocked.ok).toBe(false);
    expect(phase2Blocked.reasons.join(" ")).toContain("4 cycles");
    expect(phase2Blocked.reasons.join(" ")).toContain("28 days");

    const phase3Blocked = canAdvancePhase(
      {
        phaseIndex: 3,
        phaseStartedAt: "2026-01-01T00:00:00.000Z",
        cyclesCompletedInPhase: 7,
      },
      "2026-02-20T00:00:00.000Z"
    );
    expect(phase3Blocked.ok).toBe(false);
    expect(phase3Blocked.reasons.join(" ")).toContain("8 cycles");
    expect(phase3Blocked.reasons.join(" ")).toContain("56 days");
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
    expect(result.countedWeekKeys).toEqual(["program-1:1:1"]);
  });
});

