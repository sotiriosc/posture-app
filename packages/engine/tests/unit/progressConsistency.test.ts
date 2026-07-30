import { describe, expect, test } from "vitest";
import { calculateWeeklyGoalStreak } from "@/lib/progressConsistency";
import type { SessionRecord } from "@/lib/types";

const makeSession = (id: string, completedAt: string): SessionRecord => ({
  id,
  userId: "test-user",
  startedAt: completedAt,
  completedAt,
  createdAt: completedAt,
  updatedAt: completedAt,
  routineId: "program-1",
  durationSec: 1800,
  notes: null,
  source: "local",
  deletedAt: null,
});

describe("progress consistency streak", () => {
  test("counts rolling goal-met weeks ending at the latest completed session", () => {
    const now = Date.parse("2026-07-30T16:00:00.000Z");
    const completedDates = [
      "2026-07-03T12:00:00.000Z",
      "2026-07-05T12:00:00.000Z",
      "2026-07-08T12:00:00.000Z",
      "2026-07-10T12:00:00.000Z",
      "2026-07-13T12:00:00.000Z",
      "2026-07-15T12:00:00.000Z",
      "2026-07-17T12:00:00.000Z",
      "2026-07-20T12:00:00.000Z",
      "2026-07-22T12:00:00.000Z",
      "2026-07-24T12:00:00.000Z",
      "2026-07-27T12:00:00.000Z",
      "2026-07-29T12:00:00.000Z",
    ];

    expect(
      calculateWeeklyGoalStreak({
        sessions: completedDates.map((date, index) => makeSession(`s-${index}`, date)),
        prescribedWorkoutsPerWeek: 3,
        nowMs: now,
      })
    ).toBe(4);
  });

  test("does not count duplicate same-day sessions as separate consistency days", () => {
    expect(
      calculateWeeklyGoalStreak({
        sessions: [
          makeSession("s-1", "2026-07-29T09:00:00.000Z"),
          makeSession("s-2", "2026-07-29T18:00:00.000Z"),
        ],
        prescribedWorkoutsPerWeek: 2,
        nowMs: Date.parse("2026-07-30T16:00:00.000Z"),
      })
    ).toBe(0);
  });
});
