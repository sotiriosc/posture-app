import { describe, expect, it } from "vitest";
import {
  calculateMovementQualityPercent,
  calculateTrainingConsistencyPercent,
  replaceConsistencyMetricText,
} from "@/components/results/progressMetrics";
import type { Program, SessionRecord } from "@/lib/types";

const userId = "b04c651e-24a3-4f6e-a41e-4dfc821e1f8c";
const programId = "program-1";

const session = (
  id: string,
  completedAt: string,
  feedback: NonNullable<SessionRecord["feedback"]>
) =>
  ({
    id,
    userId,
    startedAt: completedAt,
    completedAt,
    createdAt: completedAt,
    updatedAt: completedAt,
    routineId: programId,
    durationSec: 2400,
    notes: null,
    feedback,
    source: "cloud",
    deletedAt: null,
  } as SessionRecord);

describe("progressMetrics", () => {
  it("computes consistency from completed session dates instead of stale program metrics", () => {
    const sessions = Array.from({ length: 12 }, (_, index) => {
      const completedAt = new Date(Date.UTC(2026, 6, 3 + index * 2, 20)).toISOString();
      return session(`s${index + 1}`, completedAt, { completed: "yes" });
    });

    expect(
      calculateTrainingConsistencyPercent({
        sessions,
        daysPerWeek: 3,
        nowMs: Date.UTC(2026, 6, 30, 12),
      })
    ).toBe(100);
  });

  it("uses assessmentHistory and feedback trend for movement quality before static metrics", () => {
    const program = {
      id: programId,
      phaseObjective: {
        metrics: {
          readiness: 0.404,
          consistency: 0,
        },
      },
      assessmentHistory: [
        {
          timestamp: "2026-07-03T13:15:00.000Z",
          phase: 0,
          confidenceScore: 0.838,
          status: "accepted",
          observations: [
            {
              focusTag: "forward_head",
              measuredValue: 0.319,
              threshold: 0.08,
              keypointConfidences: [0.927, 0.937],
            },
          ],
        },
        {
          timestamp: "2026-07-29T13:15:00.000Z",
          phase: 1,
          confidenceScore: 0.886,
          status: "user_retook",
          observations: [
            {
              focusTag: "forward_head",
              measuredValue: 0.117,
              threshold: 0.08,
              keypointConfidences: [0.916, 0.925],
            },
          ],
        },
      ],
    } as unknown as Program;
    const sessions = [
      session("s1", "2026-07-03T21:00:00.000Z", {
        completed: "yes",
        painAfter: 4,
        difficultyRPE: 7,
        techniqueConfidence: 3,
      }),
      session("s2", "2026-07-10T21:00:00.000Z", {
        completed: "yes",
        painAfter: 3,
        difficultyRPE: 6,
        techniqueConfidence: 3,
      }),
      session("s3", "2026-07-20T21:00:00.000Z", {
        completed: "yes",
        painAfter: 2,
        difficultyRPE: 5,
        techniqueConfidence: 4,
      }),
      session("s4", "2026-07-29T21:00:00.000Z", {
        completed: "yes",
        painAfter: 1,
        difficultyRPE: 4,
        techniqueConfidence: 5,
      }),
    ];

    expect(
      calculateMovementQualityPercent({
        program,
        sessions,
        consistencyPercent: 100,
      })
    ).toBeGreaterThanOrEqual(78);
  });

  it("updates stale generated consistency copy with the live metric", () => {
    expect(
      replaceConsistencyMetricText(
        "Readiness 40% and consistency 0% informed progression speed.",
        100
      )
    ).toBe("Readiness 40% and consistency 100% informed progression speed.");
    expect(replaceConsistencyMetricText("Consistency 0%", 87)).toBe("Consistency 87%");
  });
});
