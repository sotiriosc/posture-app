import { describe, expect, test } from "vitest";
import { canAdvancePhase, skipPhase1 } from "@/lib/phaseGating";
import type { ProgramProgress } from "@/lib/types";

const makeProgress = (overrides: Partial<ProgramProgress> = {}): ProgramProgress => ({
  programId: "program-1",
  lastCompletedDayIndex: 2,
  nextDayIndex: 0,
  completedDayIndices: [0, 1, 2],
  phaseIndex: 1,
  phaseStartedAt: "2026-01-01T00:00:00.000Z",
  cyclesCompletedInPhase: 3,
  workoutsCompletedInPhase: 9,
  daysPerWeek: 3,
  weekIndex: 4,
  countedWeekKeys: ["program-1:1:4"],
  updatedAt: "2026-01-28T00:00:00.000Z",
  ...overrides,
});

describe("phase skip", () => {
  test("skipping phase 1 resets counters and phase start timestamp", () => {
    const nowIso = "2026-02-15T00:00:00.000Z";
    const updated = skipPhase1(makeProgress(), nowIso);

    expect(updated.phaseIndex).toBe(2);
    expect(updated.phaseStartedAt).toBe(nowIso);
    expect(updated.cyclesCompletedInPhase).toBe(0);
    expect(updated.workoutsCompletedInPhase).toBe(0);
    expect(updated.weekIndex).toBe(0);
    expect(updated.countedWeekKeys).toEqual([]);
  });

  test("skipping phase 2 is impossible", () => {
    const phase2Progress = makeProgress({
      phaseIndex: 2,
      phaseStartedAt: "2026-02-01T00:00:00.000Z",
      cyclesCompletedInPhase: 1,
      workoutsCompletedInPhase: 1,
    });
    const updated = skipPhase1(phase2Progress, "2026-02-15T00:00:00.000Z");

    expect(updated).toEqual(phase2Progress);
  });

  test("canAdvancePhase is locked when phaseStartedAt is missing", () => {
    const gate = canAdvancePhase(
      {
        phaseIndex: 1,
        phaseStartedAt: null,
        cyclesCompletedInPhase: 10,
        workoutsCompletedInPhase: 99,
        daysPerWeek: 3,
      },
      "2026-02-15T00:00:00.000Z"
    );
    expect(gate.ok).toBe(false);
    expect(gate.reasons).toContain("Phase initialization incomplete");
  });

  test("phase remains unchanged until explicit skip action is invoked", () => {
    const progress = makeProgress({
      phaseIndex: 1,
      phaseStartedAt: "2026-01-01T00:00:00.000Z",
      cyclesCompletedInPhase: 3,
      workoutsCompletedInPhase: 12,
    });
    const gate = canAdvancePhase(
      {
        phaseIndex: progress.phaseIndex,
        phaseStartedAt: progress.phaseStartedAt,
        cyclesCompletedInPhase: progress.cyclesCompletedInPhase,
        workoutsCompletedInPhase: progress.workoutsCompletedInPhase,
        daysPerWeek: progress.daysPerWeek,
      },
      "2026-02-15T00:00:00.000Z"
    );
    expect(gate.ok).toBe(true);
    // Passing the gate alone is not a skip; explicit manual action (skipPhase1) is required.
    expect(progress.phaseIndex).toBe(1);
  });
});
