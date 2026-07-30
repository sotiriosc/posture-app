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
  test("counts program-start-aligned goal-met weeks for the seeded demo cadence", () => {
    const now = Date.parse("2026-07-30T16:00:00.000Z");
    const completedDates = [
      "2026-07-03T21:58:23.000Z",
      "2026-07-05T22:59:42.000Z",
      "2026-07-09T00:01:28.000Z",
      "2026-07-10T22:04:46.000Z",
      "2026-07-13T23:06:49.000Z",
      "2026-07-15T23:54:14.000Z",
      "2026-07-17T21:58:32.000Z",
      "2026-07-20T23:00:10.000Z",
      "2026-07-23T00:07:32.000Z",
      "2026-07-24T22:08:25.000Z",
      "2026-07-27T22:51:35.000Z",
      "2026-07-29T23:53:04.000Z",
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
