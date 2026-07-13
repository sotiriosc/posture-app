import { describe, expect, test } from "vitest";
import { buildAssessmentReport } from "@/lib/assessmentEngine";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";

const baseData: QuestionnaireData = {
  goals: "Improve posture",
  painAreas: [],
  experience: "Beginner",
  equipment: ["none"],
  daysPerWeek: 3,
};

describe("assessment engine", () => {
  test("builds posture and pose-specific observations", () => {
    const report = buildAssessmentReport({
      questionnaire: {
        ...baseData,
        painAreas: ["Neck"],
      },
      poseAnalysis: {
        metrics: {
          torsoHeight: null,
          avgKeypointScore: null,
          shoulderHeightDelta: null,
          hipHeightDelta: null,
          kneeAlignmentDelta: null,
          headForwardOffset: null,
          torsoLeanAngle: null,
          hipToShoulderAlignment: null,
          scapularSymmetry: null,
          hipShift: null,
        },
        observations: ["Forward head offset noted", "Shoulder height asymmetry"],
        priorities: [],
        confidenceScore: 0.8,
      },
    });

    expect(report.observations.length).toBeGreaterThanOrEqual(3);
    expect(
      report.observations.some((observation) => observation.id === "pose-forward-head")
    ).toBe(true);
    expect(
      report.observations.some((observation) => observation.id === "goal-posture-control")
    ).toBe(true);
  });

  test("deduplicates repeated pose pattern observations across views", () => {
    const report = buildAssessmentReport({
      questionnaire: baseData,
      poseAnalysis: {
        metrics: {
          torsoHeight: null,
          avgKeypointScore: null,
          shoulderHeightDelta: null,
          hipHeightDelta: null,
          kneeAlignmentDelta: null,
          headForwardOffset: 0.12,
          torsoLeanAngle: null,
          hipToShoulderAlignment: null,
          scapularSymmetry: null,
          hipShift: null,
        },
        observations: [
          "front: Forward head posture tendency detected.",
          "side: Forward head posture tendency detected.",
        ],
        priorities: [],
        confidenceScore: 0.8,
      },
    });

    const forwardHeadItems = report.observations.filter(
      (observation) => observation.id === "pose-forward-head"
    );
    expect(forwardHeadItems).toHaveLength(1);
    expect(
      forwardHeadItems[0].evidence.some((entry) => entry.toLowerCase().includes("view: front"))
    ).toBe(true);
    expect(
      forwardHeadItems[0].evidence.some((entry) => entry.toLowerCase().includes("view: side"))
    ).toBe(true);
  });
});
