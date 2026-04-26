import { describe, expect, test } from "vitest";
import {
  clearProgramConstraintWarningBuffer,
  clearProgramVariationHistory,
  generateWeeklyProgram,
  getProgramConstraintWarningBuffer,
} from "@/lib/program";
import {
  evaluatePhaseProgressionCoherence,
  phaseProgressionPersonas,
  type PhaseProgramForQuality,
} from "./_helpers/phaseProgressionQuality";

const phaseIndexes = [1, 2, 3] as const;

describe("phase progression coherence", () => {
  test("Phase 1, 2, and 3 form intentional semantic progressions", () => {
    const failures: string[] = [];

    phaseProgressionPersonas.forEach((persona, personaIndex) => {
      const phases: PhaseProgramForQuality[] = phaseIndexes.map((phaseIndex) => {
        clearProgramVariationHistory();
        clearProgramConstraintWarningBuffer();

        const seed = `phase-progression-coherence-${personaIndex + 1}-phase-${phaseIndex}`;
        const programId = `phase-progression-${personaIndex + 1}-phase-${phaseIndex}`;
        const program = generateWeeklyProgram(persona.questionnaire, programId, {
          phaseIndex,
          seed,
        });
        const warnings = getProgramConstraintWarningBuffer().filter(
          (warning) => warning.programId === program.id
        );

        return { phaseIndex, program, warnings };
      });

      failures.push(
        ...evaluatePhaseProgressionCoherence({
          personaName: persona.name,
          questionnaire: persona.questionnaire,
          phases,
        }).map((failure) => `${persona.name}: ${failure}`)
      );
    });

    expect(failures).toEqual([]);
  }, 60000);
});
