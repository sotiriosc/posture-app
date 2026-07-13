import { describe, expect, test } from "vitest";
import { buildConstraintReport } from "@/lib/engine/constraints";
import type { EngineSignals } from "@/lib/engine/engineTypes";

const baseSignals: EngineSignals = {
  questionnaire: {
    goals: "Improve posture",
    painAreas: [],
    experience: "Beginner",
    equipment: ["none"],
    daysPerWeek: 3,
  },
  history: {
    sessions: [],
    exerciseLogs: [],
    programProgress: null,
  },
  nowIso: "2026-02-14T00:00:00.000Z",
};

describe("buildConstraintReport", () => {
  test("returns low severity when no pain areas and no pain history", () => {
    const report = buildConstraintReport(baseSignals);
    expect(report.severity).toBe("low");
    expect(report.preferredTags).toEqual([]);
    expect(report.blockedTags).toEqual([]);
    expect(report.blockedPatterns).toEqual([]);
  });

  test("applies PAIN_RULES tags and patterns for mapped pain areas", () => {
    const report = buildConstraintReport({
      ...baseSignals,
      questionnaire: {
        ...baseSignals.questionnaire,
        painAreas: ["Lower back", "Knees"],
      },
    });
    expect(report.preferredTags).toEqual(
      expect.arrayContaining(["core", "tva", "posterior", "hinge", "glutes", "balance"])
    );
    expect(report.blockedTags).toEqual(expect.arrayContaining(["advanced"]));
    expect(report.blockedPatterns).toEqual(expect.arrayContaining(["squat"]));
    expect(report.severity).toBe("high");
  });

  test("raises severity when recent pain feedback exists", () => {
    const report = buildConstraintReport({
      ...baseSignals,
      questionnaire: {
        ...baseSignals.questionnaire,
        painAreas: ["Neck"],
      },
      history: {
        sessions: [],
        exerciseLogs: [
          {
            id: "log-1",
            userId: null,
            sessionId: "session-1",
            exerciseId: "dead-bug",
            createdAt: "2026-02-14T00:00:00.000Z",
            updatedAt: "2026-02-14T00:00:00.000Z",
            loadType: "bodyweight",
            unit: null,
            weight: null,
            reps: 10,
            repsBySet: null,
            setsPlanned: 2,
            setsCompleted: 2,
            durationSec: null,
            rpe: null,
            felt: "pain",
            notes: null,
            computedVolume: null,
            source: "local",
            deletedAt: null,
          },
        ],
        programProgress: null,
      },
    });
    expect(report.severity).toBe("high");
    expect(report.notes.join(" ")).toContain("Recent pain feedback found in history");
  });
});
