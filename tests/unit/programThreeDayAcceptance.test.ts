import { describe, expect, test } from "vitest";
import {
  clearProgramConstraintWarningBuffer,
  clearProgramVariationHistory,
  generateWeeklyProgram,
  getProgramConstraintWarningBuffer,
} from "@/lib/program";
import {
  evaluateThreeDayPersonaQuality,
  threeDayReviewPersonas,
  threeDayReviewPhaseIndexes,
} from "./_helpers/threeDayPersonaReviewHelpers";

describe("3-day persona acceptance guardrails", () => {
  test("reviewed personas satisfy structural quality criteria across phases", () => {
    const failures: string[] = [];
    const unilateralFamiliesAcrossReview: string[] = [];

    threeDayReviewPersonas.forEach((persona, personaIndex) => {
      threeDayReviewPhaseIndexes.forEach((phaseIndex) => {
        clearProgramVariationHistory();
        clearProgramConstraintWarningBuffer();

        const seed = `three-day-persona-review-${personaIndex + 1}-phase-${phaseIndex}`;
        const programId = `three-day-acceptance-${personaIndex + 1}-phase-${phaseIndex}`;
        const program = generateWeeklyProgram(persona.questionnaire, programId, {
          phaseIndex,
          seed,
        });
        const warnings = getProgramConstraintWarningBuffer().filter(
          (warning) => warning.programId === program.id
        );
        const evaluation = evaluateThreeDayPersonaQuality({
          program,
          questionnaire: persona.questionnaire,
          warnings,
        });

        unilateralFamiliesAcrossReview.push(...evaluation.unilateralFamilies);
        failures.push(
          ...evaluation.failures.map(
            (failure) => `${persona.name} / Phase ${phaseIndex}: ${failure}`
          )
        );
      });
    });

    expect(failures).toEqual([]);

    const reviewedUnilateralFamilies = unilateralFamiliesAcrossReview.filter(
      (family) => family !== "other"
    );
    expect(reviewedUnilateralFamilies.length).toBeGreaterThan(0);
    expect(reviewedUnilateralFamilies.every((family) => family === "step_up")).toBe(false);
    expect(new Set(reviewedUnilateralFamilies).size).toBeGreaterThan(1);
  }, 30000);
});
