import { describe, expect, test } from "vitest";
import {
  clearProgramVariationHistory,
  generateWeeklyProgram,
} from "@/lib/program";
import {
  deriveSessionFeedbackSignals,
  formatSessionFeedbackCoachSummary,
} from "@/lib/sessionFeedbackSignals";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";

const questionnaire: QuestionnaireData = {
  goals: "Improve posture",
  painAreas: [],
  experience: "Beginner",
  equipment: ["dumbbells"],
  daysPerWeek: 3,
};

describe("session feedback signals", () => {
  test("derives progress-supporting signals for stable successful feedback", () => {
    const signals = deriveSessionFeedbackSignals({
      completed: "yes",
      difficultyRPE: 6,
      painBefore: 2,
      painAfter: 2,
      energy: 4,
      techniqueConfidence: 4,
    });

    expect(signals).toMatchObject({
      painDelta: 0,
      completed: "yes",
      effortBand: "moderate",
      confidenceBand: "high",
      energyBand: "high",
      readinessHint: "progress",
      flags: [],
    });
    expect(signals?.coachSummary).toBe(
      "You completed the session with stable symptoms. This supports maintaining or gently progressing next time."
    );
    expect(
      formatSessionFeedbackCoachSummary({
        completed: "yes",
        difficultyRPE: 6,
        painBefore: 2,
        painAfter: 2,
        energy: 4,
        techniqueConfidence: 4,
      })
    ).toBe("Coach read: symptoms stable, effort moderate, confidence good.");
  });

  test("pain increase produces a conservative readiness hint", () => {
    const signals = deriveSessionFeedbackSignals({
      completed: "yes",
      difficultyRPE: 6,
      painBefore: 1,
      painAfter: 4,
      energy: 4,
      techniqueConfidence: 4,
    });

    expect(signals?.painDelta).toBe(3);
    expect(signals?.readinessHint).toBe("recover");
    expect(signals?.flags).toContain("pain_increased");
    expect(signals?.coachSummary).toBe(
      "Pain increased during this session. Keep the next exposure conservative."
    );
  });

  test("low technique confidence flags simplification without medical claims", () => {
    const signals = deriveSessionFeedbackSignals({
      completed: "yes",
      difficultyRPE: 6,
      painBefore: 2,
      painAfter: 2,
      energy: 4,
      techniqueConfidence: 2,
    });

    expect(signals?.readinessHint).toBe("reduce");
    expect(signals?.flags).toContain("low_technique_confidence");
    expect(signals?.coachSummary).toBe(
      "Technique confidence was low. Repeating or simplifying the pattern may be better than adding load."
    );
  });

  test("high effort without pain maintains or reduces based on context", () => {
    const completedSignals = deriveSessionFeedbackSignals({
      completed: "yes",
      difficultyRPE: 9,
      painBefore: 2,
      painAfter: 2,
      energy: 4,
      techniqueConfidence: 4,
    });
    const partialSignals = deriveSessionFeedbackSignals({
      completed: "partial",
      difficultyRPE: 9,
      painBefore: 2,
      painAfter: 2,
      energy: 4,
      techniqueConfidence: 4,
    });

    expect(completedSignals?.readinessHint).toBe("maintain");
    expect(completedSignals?.flags).toContain("high_effort");
    expect(partialSignals?.readinessHint).toBe("reduce");
    expect(partialSignals?.flags).toEqual(
      expect.arrayContaining(["partial_completion", "high_effort"])
    );
  });

  test("old records without feedback remain neutral", () => {
    expect(deriveSessionFeedbackSignals(undefined)).toBeNull();
    expect(formatSessionFeedbackCoachSummary(null)).toBeNull();
  });

  test("deriving signals does not change generated program output", () => {
    clearProgramVariationHistory();
    const before = generateWeeklyProgram(questionnaire, "signals-noop", {
      phaseIndex: 1,
      seed: "signals-noop-seed",
    });

    deriveSessionFeedbackSignals({
      completed: "yes",
      difficultyRPE: 6,
      painBefore: 1,
      painAfter: 1,
      energy: 4,
      techniqueConfidence: 4,
    });

    clearProgramVariationHistory();
    const after = generateWeeklyProgram(questionnaire, "signals-noop", {
      phaseIndex: 1,
      seed: "signals-noop-seed",
    });

    expect(after.week).toEqual(before.week);
  });
});
