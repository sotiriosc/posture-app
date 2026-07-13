import { afterEach, describe, expect, test, vi } from "vitest";
import {
  clearProgramVariationHistory,
  generateWeeklyProgram,
} from "@/lib/program";
import { isAdaptiveProgrammingEnabled } from "@/lib/adaptiveProgramConfig";
import {
  deriveAdaptiveProgramIntent,
  deriveAdaptiveProgramIntentFromSession,
  formatAdaptiveProgramIntent,
} from "@/lib/adaptiveProgramIntent";
import { deriveNextSessionRecommendationFromFeedback } from "@/lib/nextSessionRecommendation";
import { deriveSessionAdaptationPreviewFromFeedback } from "@/lib/sessionAdaptationPreview";
import { deriveSessionFeedbackSignals } from "@/lib/sessionFeedbackSignals";
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

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("adaptive program intent", () => {
  test("feature flag defaults to off", () => {
    vi.stubEnv("ADAPTIVE_PROGRAMMING_ENABLED", "");
    expect(isAdaptiveProgrammingEnabled()).toBe(false);
    expect(
      isAdaptiveProgrammingEnabled({ ADAPTIVE_PROGRAMMING_ENABLED: "true" })
    ).toBe(true);
  });

  test("stable feedback derives gentle progression intent while disabled by default", () => {
    vi.stubEnv("ADAPTIVE_PROGRAMMING_ENABLED", "");
    const intent = deriveAdaptiveProgramIntentFromSession({
      feedback: {
        completed: "yes",
        difficultyRPE: 6,
        painBefore: 1,
        painAfter: 1,
        energy: 4,
        techniqueConfidence: 4,
      },
    });

    expect(intent.enabled).toBe(false);
    expect(["gently_progress", "hold"]).toContain(intent.mode);
    expect(intent.constraints).toEqual(
      expect.arrayContaining([
        "Small progression only.",
        "Keep familiar pattern.",
        "Do not progress if warm-up feels off.",
      ])
    );
  });

  test("pain increase derives reduce or recover intent", () => {
    const reduceIntent = deriveAdaptiveProgramIntentFromSession({
      feedback: {
        completed: "yes",
        difficultyRPE: 6,
        painBefore: 1,
        painAfter: 3,
        energy: 4,
        techniqueConfidence: 4,
      },
    });
    const recoverIntent = deriveAdaptiveProgramIntentFromSession({
      feedback: {
        completed: "yes",
        difficultyRPE: 6,
        painBefore: 1,
        painAfter: 4,
        energy: 4,
        techniqueConfidence: 4,
      },
    });

    expect(["reduce", "recover"]).toContain(reduceIntent.mode);
    expect(recoverIntent.mode).toBe("recover");
    expect(reduceIntent.constraints).toEqual(
      expect.arrayContaining([
        "Keep intensity conservative.",
        "Avoid adding load.",
        "Prefer an easier pattern if applied later.",
      ])
    );
  });

  test("low confidence derives simplify intent", () => {
    const intent = deriveAdaptiveProgramIntentFromSession({
      feedback: {
        completed: "yes",
        difficultyRPE: 6,
        painBefore: 2,
        painAfter: 2,
        energy: 4,
        techniqueConfidence: 2,
      },
    });

    expect(intent.mode).toBe("simplify");
    expect(intent.constraints).toEqual(
      expect.arrayContaining([
        "Reduce complexity.",
        "Repeat cues.",
        "Favor simpler pattern exposure.",
      ])
    );
  });

  test("partial and no completion derive hold or reduce intent without generator effects for hold", () => {
    const partialIntent = deriveAdaptiveProgramIntentFromSession({
      feedback: {
        completed: "partial",
        difficultyRPE: 6,
        painBefore: 2,
        painAfter: 2,
        energy: 4,
        techniqueConfidence: 4,
      },
    });
    const noCompletionIntent = deriveAdaptiveProgramIntentFromSession({
      feedback: {
        completed: "no",
        difficultyRPE: 6,
        painBefore: 2,
        painAfter: 2,
        energy: 4,
        techniqueConfidence: 4,
      },
    });
    const holdIntent = deriveAdaptiveProgramIntent({
      recommendation: {
        mode: "repeat",
        priority: "low",
        reasons: ["Hold dose steady."],
        message: "Repeat.",
        suggestedAdjustments: ["Hold dose."],
      },
      enabled: false,
    });

    expect(["hold", "reduce"]).toContain(partialIntent.mode);
    expect(["hold", "reduce"]).toContain(noCompletionIntent.mode);
    expect(holdIntent.mode).toBe("hold");
    expect(holdIntent.suggestedGeneratorEffects).toEqual([]);
  });

  test("intent can be derived from explicit recommendation, signals, and preview without side effects", () => {
    const feedback = {
      completed: "yes" as const,
      difficultyRPE: 6,
      painBefore: 1,
      painAfter: 3,
      energy: 4,
      techniqueConfidence: 4,
    };
    const signals = deriveSessionFeedbackSignals(feedback);
    const preview = deriveSessionAdaptationPreviewFromFeedback(feedback);
    const recommendation = deriveNextSessionRecommendationFromFeedback(feedback);
    const before = JSON.stringify({ signals, preview, recommendation });

    const first = deriveAdaptiveProgramIntent({
      recommendation,
      signals,
      preview,
      enabled: false,
    });
    const second = deriveAdaptiveProgramIntent({
      recommendation,
      signals,
      preview,
      enabled: false,
    });

    expect(first).toEqual(second);
    expect(JSON.stringify({ signals, preview, recommendation })).toBe(before);
    expect(formatAdaptiveProgramIntent(first)).toBe(
      "Adaptive intent: reduce dose; not applied."
    );
  });

  test("generated program output is unchanged with flag off", () => {
    vi.stubEnv("ADAPTIVE_PROGRAMMING_ENABLED", "");
    clearProgramVariationHistory();
    const before = generateWeeklyProgram(questionnaire, "adaptive-intent-noop", {
      phaseIndex: 1,
      seed: "adaptive-intent-noop-seed",
    });

    deriveAdaptiveProgramIntentFromSession({
      feedback: {
        completed: "yes",
        difficultyRPE: 6,
        painBefore: 1,
        painAfter: 4,
        energy: 4,
        techniqueConfidence: 4,
      },
    });

    clearProgramVariationHistory();
    const after = generateWeeklyProgram(questionnaire, "adaptive-intent-noop", {
      phaseIndex: 1,
      seed: "adaptive-intent-noop-seed",
    });

    expect(stableProgramProjection(after)).toEqual(
      stableProgramProjection(before)
    );
  });
});
