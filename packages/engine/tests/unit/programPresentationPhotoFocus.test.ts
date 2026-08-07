/**
 * Phase 7B §3 — Photo-confidence continuity via real derivePoseFocus.
 */

import { describe, expect, it, beforeEach } from "vitest";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import {
  CONFIDENCE_FLOOR,
  derivePoseFocus,
} from "@/lib/engine/poseFocus";
import type { PoseAnalysis } from "@/lib/poseAnalyzer";
import {
  clearProgramVariationHistory,
  generateWeeklyProgram,
} from "@/lib/program";
import {
  resolveAssessmentFocusFromPose,
  resolveProgramPresentation,
} from "@/lib/program/presentation";

beforeEach(() => {
  clearProgramVariationHistory();
});

const questionnaire: QuestionnaireData = {
  goals: "Improve posture",
  painAreas: [],
  experience: "Beginner",
  daysPerWeek: 3,
  equipment: ["dumbbells"],
};

const makeAnalysis = (overrides: Partial<PoseAnalysis>): PoseAnalysis => ({
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
  observations: [],
  priorities: [],
  confidenceScore: 0.8,
  ...overrides,
});

describe("Phase 7B photo-confidence presentation continuity", () => {
  it("resolveProgramPresentation omits/includes assessment focus via derivePoseFocus confidence", () => {
    const lowPose = makeAnalysis({
      confidenceScore: CONFIDENCE_FLOOR - 0.05,
      metrics: {
        torsoHeight: null,
        avgKeypointScore: CONFIDENCE_FLOOR - 0.05,
        shoulderHeightDelta: null,
        hipHeightDelta: null,
        kneeAlignmentDelta: null,
        headForwardOffset: 0.12,
        torsoLeanAngle: null,
        hipToShoulderAlignment: null,
        scapularSymmetry: null,
        hipShift: null,
      },
    });
    const highPose = makeAnalysis({
      confidenceScore: CONFIDENCE_FLOOR + 0.2,
      metrics: {
        torsoHeight: null,
        avgKeypointScore: 0.85,
        shoulderHeightDelta: null,
        hipHeightDelta: null,
        kneeAlignmentDelta: null,
        headForwardOffset: 0.12,
        torsoLeanAngle: null,
        hipToShoulderAlignment: null,
        scapularSymmetry: null,
        hipShift: null,
      },
    });

    const lowFocus = derivePoseFocus(lowPose);
    expect(lowFocus.status).toBe("insufficient_confidence");
    expect(lowFocus.focusTags).toEqual([]);

    const highFocus = derivePoseFocus(highPose);
    expect(highFocus.status).toBe("ok");
    expect(highFocus.focusTags).toContain("forward_head");

    const lowPresentation = resolveAssessmentFocusFromPose(lowPose);
    expect(lowPresentation.highConfidence).toBe(false);
    expect(lowPresentation.focusTags).toEqual([]);
    expect(lowPresentation.status).toBe("insufficient_confidence");

    const highPresentation = resolveAssessmentFocusFromPose(highPose);
    expect(highPresentation.highConfidence).toBe(true);
    expect(highPresentation.focusTags).toContain("forward head");
    expect(highPresentation.focusTags.join(" ")).not.toContain("forward_head");

    const program = generateWeeklyProgram(questionnaire, "p7b-photo-focus", {
      seed: "p7b-photo-focus",
    });

    const lowModel = resolveProgramPresentation({
      program,
      questionnaire,
      assessmentFocusTags: lowPresentation.focusTags,
      assessmentFocusHighConfidence: lowPresentation.highConfidence,
    });
    expect(
      lowModel.program.adaptationSummary.some((m) => m.reason === "assessmentFocus")
    ).toBe(false);

    const highModel = resolveProgramPresentation({
      program,
      questionnaire,
      assessmentFocusTags: highPresentation.focusTags,
      assessmentFocusHighConfidence: highPresentation.highConfidence,
    });
    expect(
      highModel.program.adaptationSummary.some((m) => m.reason === "assessmentFocus")
    ).toBe(true);
    const focusMsg = highModel.program.adaptationSummary.find(
      (m) => m.reason === "assessmentFocus"
    );
    expect(focusMsg?.text.toLowerCase()).toContain("forward head");
    expect(focusMsg?.text).not.toMatch(/forward_head/);
  });
});
