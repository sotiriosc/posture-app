import { describe, expect, test } from "vitest";
import {
  clearProgramVariationHistory,
  generateWeeklyProgram,
} from "@/lib/program";
import {
  deriveSessionAdaptationPreview,
  deriveSessionAdaptationPreviewFromFeedback,
  formatSessionAdaptationPreview,
} from "@/lib/sessionAdaptationPreview";
import type { Program } from "@/lib/types";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";

const questionnaire: QuestionnaireData = {
  goals: "Improve posture",
  painAreas: [],
  experience: "Beginner",
  equipment: ["dumbbells"],
  daysPerWeek: 3,
};

const stableProgramProjection = (program: Program) => ({
  goalTrack: program.goalTrack,
  daysPerWeek: program.daysPerWeek,
  phaseIndex: program.phaseIndex,
  phaseName: program.phaseName,
  weekIndex: program.weekIndex,
  totalWeekIndex: program.totalWeekIndex,
  cycleIndex: program.cycleIndex,
  nextWeekPlan: program.nextWeekPlan,
  phaseObjective: program.phaseObjective,
  sessionAdaptation: program.sessionAdaptation,
  week: program.week,
});

describe("session adaptation preview", () => {
  test("stable successful feedback suggests a gentle progression preview", () => {
    const preview = deriveSessionAdaptationPreviewFromFeedback({
      completed: "yes",
      difficultyRPE: 6,
      painBefore: 2,
      painAfter: 2,
      energy: 4,
      techniqueConfidence: 4,
    });

    expect(preview).toMatchObject({
      readinessHint: "progress",
      suggestedAction: "gently_progress",
    });
    expect(preview?.coachMessage).toContain("gentle progression");
    expect(formatSessionAdaptationPreview(preview)).toBe(
      "Next-time preview: gently progress while keeping the pattern familiar."
    );
  });

  test("pain increase suggests reducing dose or recovery exposure", () => {
    const reducePreview = deriveSessionAdaptationPreviewFromFeedback({
      completed: "yes",
      difficultyRPE: 6,
      painBefore: 1,
      painAfter: 3,
      energy: 4,
      techniqueConfidence: 4,
    });
    const recoverPreview = deriveSessionAdaptationPreviewFromFeedback({
      completed: "yes",
      difficultyRPE: 6,
      painBefore: 1,
      painAfter: 4,
      energy: 4,
      techniqueConfidence: 4,
    });

    expect(reducePreview?.suggestedAction).toBe("reduce_dose");
    expect(recoverPreview?.suggestedAction).toBe("recovery_session");
    expect(reducePreview?.reasons).toContain(
      "Symptoms increased during this session."
    );
  });

  test("low confidence prioritizes simplifying the pattern", () => {
    const preview = deriveSessionAdaptationPreviewFromFeedback({
      completed: "yes",
      difficultyRPE: 6,
      painBefore: 2,
      painAfter: 2,
      energy: 4,
      techniqueConfidence: 2,
    });

    expect(preview?.suggestedAction).toBe("simplify_pattern");
    expect(preview?.coachMessage).toBe(
      "Because confidence was low, Praxis would favor repeating or simplifying this pattern."
    );
  });

  test("high effort holds or reduces instead of progressing", () => {
    const preview = deriveSessionAdaptationPreviewFromFeedback({
      completed: "yes",
      difficultyRPE: 9,
      painBefore: 2,
      painAfter: 2,
      energy: 4,
      techniqueConfidence: 4,
    });

    expect(preview?.suggestedAction).not.toBe("gently_progress");
    expect(["repeat", "reduce_dose"]).toContain(preview?.suggestedAction);
  });

  test("old records without feedback remain neutral", () => {
    expect(deriveSessionAdaptationPreview(null)).toBeNull();
    expect(deriveSessionAdaptationPreviewFromFeedback(undefined)).toBeNull();
    expect(formatSessionAdaptationPreview(null)).toBeNull();
  });

  test("deriving previews does not alter generated program output", () => {
    clearProgramVariationHistory();
    const before = generateWeeklyProgram(questionnaire, "preview-noop", {
      phaseIndex: 1,
      seed: "preview-noop-seed",
    });

    deriveSessionAdaptationPreviewFromFeedback({
      completed: "yes",
      difficultyRPE: 6,
      painBefore: 1,
      painAfter: 1,
      energy: 4,
      techniqueConfidence: 4,
    });

    clearProgramVariationHistory();
    const after = generateWeeklyProgram(questionnaire, "preview-noop", {
      phaseIndex: 1,
      seed: "preview-noop-seed",
    });

    expect(stableProgramProjection(after)).toEqual(
      stableProgramProjection(before)
    );
  });
});
