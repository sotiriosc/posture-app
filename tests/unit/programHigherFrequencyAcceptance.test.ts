import { describe, expect, test } from "vitest";
import {
  clearProgramConstraintWarningBuffer,
  clearProgramVariationHistory,
  generateWeeklyProgram,
  getProgramConstraintWarningBuffer,
} from "@/lib/program";
import {
  collectFinalWarnings,
  evaluateHigherFrequencyPersonaQuality,
  higherFrequencyReviewPersonas,
  higherFrequencyReviewPhaseIndexes,
} from "./_helpers/higherFrequencyPersonaReviewHelpers";

describe("4-day and 5-day persona acceptance guardrails", () => {
  test("reviewed higher-frequency personas satisfy structural quality criteria across phases", () => {
    const failures: string[] = [];
    let finalMarkerCount = 0;

    higherFrequencyReviewPersonas.forEach((persona, personaIndex) => {
      higherFrequencyReviewPhaseIndexes.forEach((phaseIndex) => {
        clearProgramVariationHistory();
        clearProgramConstraintWarningBuffer();

        const seed = `higher-frequency-persona-review-${personaIndex + 1}-phase-${phaseIndex}`;
        const programId = `higher-frequency-acceptance-${personaIndex + 1}-phase-${phaseIndex}`;
        const program = generateWeeklyProgram(persona.questionnaire, programId, {
          phaseIndex,
          seed,
        });
        const warnings = collectFinalWarnings(getProgramConstraintWarningBuffer(), program.id);
        finalMarkerCount += warnings.filter((warning) =>
          ["violation", "missing", "coverage"].includes(warning.kind)
        ).length;
        const evaluation = evaluateHigherFrequencyPersonaQuality({
          program,
          questionnaire: persona.questionnaire,
          phaseIndex,
          warnings,
        });

        failures.push(
          ...evaluation.failures.map(
            (failure) => `${persona.name} / Phase ${phaseIndex}: ${failure}`
          )
        );
      });
    });

    expect(failures).toEqual([]);
    expect(finalMarkerCount).toBe(0);
    expect(finalMarkerCount).toBeLessThan(43);
  }, 60000);
});
