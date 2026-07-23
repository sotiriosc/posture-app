import { describe, expect, test } from "vitest";
import {
  clearProgramVariationHistory,
  generateWeeklyProgram,
} from "@/lib/program";
import { deriveSessionAdaptationPreviewFromFeedback } from "@/lib/sessionAdaptationPreview";
import { deriveSessionFeedbackSignals } from "@/lib/sessionFeedbackSignals";
import {
  deriveNextSessionRecommendation,
  deriveNextSessionRecommendationFromFeedback,
  deriveNextSessionRecommendationFromSession,
  formatNextSessionRecommendation,
} from "@/lib/nextSessionRecommendation";
import type { Program, SessionRecord } from "@/lib/types";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";

const questionnaire: QuestionnaireData = {
  goals: "Improve posture",
  painAreas: [],
  experience: "Beginner",
  equipment: ["dumbbells"],
  daysPerWeek: 3,
};

const oldSession: Pick<SessionRecord, "id" | "feedback"> = {
  id: "old-session",
  feedback: undefined,
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

describe("next session recommendation", () => {
  test("recommendation generation is pure", () => {
    const feedback = {
      completed: "yes" as const,
      difficultyRPE: 6,
      painBefore: 1,
      painAfter: 1,
      energy: 4,
      techniqueConfidence: 4,
    };
    const signals = deriveSessionFeedbackSignals(feedback);
    const preview = deriveSessionAdaptationPreviewFromFeedback(feedback);
    const beforeSignals = JSON.stringify(signals);
    const beforePreview = JSON.stringify(preview);

    const first = deriveNextSessionRecommendation({
      signals,
      preview,
      latestSession: { id: "session-1", feedback },
    });
    const second = deriveNextSessionRecommendation({
      signals,
      preview,
      latestSession: { id: "session-1", feedback },
    });

    expect(first).toEqual(second);
    expect(JSON.stringify(signals)).toBe(beforeSignals);
    expect(JSON.stringify(preview)).toBe(beforePreview);
    expect(first?.sourceSessionId).toBe("session-1");
  });

  test("old logs without feedback return null", () => {
    expect(deriveNextSessionRecommendationFromSession(oldSession)).toBeNull();
    expect(deriveNextSessionRecommendationFromFeedback(null)).toBeNull();
    expect(formatNextSessionRecommendation(null)).toBeNull();
  });

  test("stable successful feedback yields a normal recommendation", () => {
    const recommendation = deriveNextSessionRecommendationFromFeedback(
      {
        completed: "yes",
        difficultyRPE: 6,
        painBefore: 2,
        painAfter: 2,
        energy: 4,
        techniqueConfidence: 4,
      },
      { id: "stable-session" }
    );

    expect(["normal", "repeat"]).toContain(recommendation?.mode);
    expect(recommendation?.priority).toBe("low");
    expect(recommendation?.sourceSessionId).toBe("stable-session");
    expect(formatNextSessionRecommendation(recommendation)).toBe(
      "Next session: we'll keep going as planned — a small step up is optional. Your plan will adjust based on how it goes."
    );
  });

  test("pain increase yields reduce or recover", () => {
    const reduce = deriveNextSessionRecommendationFromFeedback({
      completed: "yes",
      difficultyRPE: 6,
      painBefore: 1,
      painAfter: 3,
      energy: 4,
      techniqueConfidence: 4,
    });
    const recover = deriveNextSessionRecommendationFromFeedback({
      completed: "yes",
      difficultyRPE: 6,
      painBefore: 1,
      painAfter: 4,
      energy: 4,
      techniqueConfidence: 4,
    });

    expect(["reduce", "recover"]).toContain(reduce?.mode);
    expect(reduce?.priority).toBe("high");
    expect(["reduce", "recover"]).toContain(recover?.mode);
    expect(recover?.priority).toBe("high");
    expect(reduce?.reasons[0]).toContain("Symptoms increased");
  });

  test("low confidence yields simplify", () => {
    const recommendation = deriveNextSessionRecommendationFromFeedback({
      completed: "yes",
      difficultyRPE: 6,
      painBefore: 2,
      painAfter: 2,
      energy: 4,
      techniqueConfidence: 2,
    });

    expect(recommendation?.mode).toBe("simplify");
    expect(recommendation?.priority).toBe("medium");
    expect(recommendation?.suggestedAdjustments.join(" ")).toContain(
      "simpler pattern variation"
    );
  });

  test("high effort and partial completion hold dose with manageable exposure", () => {
    const recommendation = deriveNextSessionRecommendationFromFeedback({
      completed: "partial",
      difficultyRPE: 9,
      painBefore: 2,
      painAfter: 2,
      energy: 4,
      techniqueConfidence: 4,
    });

    expect(["repeat", "reduce"]).toContain(recommendation?.mode);
    expect(recommendation?.reasons.join(" ")).toContain("holding dose");
    expect(recommendation?.reasons.join(" ")).toContain("manageable");
  });

  test("deriving recommendations does not alter seeded program output", () => {
    clearProgramVariationHistory();
    const before = generateWeeklyProgram(questionnaire, "recommendation-noop", {
      phaseIndex: 1,
      seed: "recommendation-noop-seed",
    });

    deriveNextSessionRecommendationFromFeedback({
      completed: "yes",
      difficultyRPE: 6,
      painBefore: 1,
      painAfter: 1,
      energy: 4,
      techniqueConfidence: 4,
    });

    clearProgramVariationHistory();
    const after = generateWeeklyProgram(questionnaire, "recommendation-noop", {
      phaseIndex: 1,
      seed: "recommendation-noop-seed",
    });

    expect(stableProgramProjection(after)).toEqual(
      stableProgramProjection(before)
    );
  });
});
