import { describe, expect, test } from "vitest";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import {
  clearProgramConstraintWarningBuffer,
  clearProgramVariationHistory,
  evaluateProgramQuality,
  generateWeeklyProgram,
  listKnownSeverityCodes,
  PROGRAM_TEMPLATE_VERSION,
  resolveProgramQualitySeverity,
  computeProgramQualitySignature,
} from "@/lib/program";
import { resolvePrimaryProgramEquipmentMode } from "@/lib/program/equipmentMode";
import { auditCoverageContract } from "@/lib/__debug__/coverageContractAudit";

const generate = (
  questionnaire: QuestionnaireData,
  id: string,
  phaseIndex: number,
  seed: string
) => {
  clearProgramVariationHistory();
  clearProgramConstraintWarningBuffer();
  return generateWeeklyProgram(questionnaire, id, { phaseIndex, seed });
};

describe("program quality gate", () => {
  test("severity policy maps deferred demos and capability limitations correctly", () => {
    expect(resolveProgramQualitySeverity("COACHING_DEMO_PLANNED")).toBe(
      "deferredContent"
    );
    expect(resolveProgramQualitySeverity("DEFERRED_DEMO")).toBe("deferredContent");
    expect(
      resolveProgramQualitySeverity("BODYWEIGHT_TRUE_VERTICAL_UNAVAILABLE")
    ).toBe("capabilityLimitation");
    expect(resolveProgramQualitySeverity("GYM_ILLEGAL_EQUIPMENT")).toBe(
      "hardFailure"
    );
    expect(listKnownSeverityCodes().hardFailurePrefixes).toContain("GYM_");
  });

  test("advanced 5-day gym pain growth baselines pass coverage intelligence", () => {
    const questionnaire: QuestionnaireData = {
      goals: "Reduce pain",
      painAreas: ["low_back", "neck"],
      experience: "Advanced",
      daysPerWeek: 5,
      equipment: ["gym"],
    };
    const program = generate(
      questionnaire,
      "p7-gym-5d-pain-baselines",
      3,
      "phase-matrix-pain advanced-5-gym-growth"
    );
    const audit = auditCoverageContract({
      profile: "pain advanced",
      phase: "growth",
      daysPerWeek: 5,
      equipment: ["gym"],
      questionnaire,
      program,
    });
    expect(audit.ok).toBe(true);
    expect(audit.weeklyFailures).toEqual([]);
    expect(audit.intelligenceFailures).toEqual([]);
  });

  test("production generation evaluates and passes flagship gym week", () => {
    const questionnaire: QuestionnaireData = {
      goals: "General fitness",
      painAreas: [],
      experience: "Beginner",
      equipment: ["gym"],
      daysPerWeek: 3,
    };
    const program = generate(
      questionnaire,
      "p7-gym-flagship",
      1,
      "p7-gym-flagship-seed"
    );
    const evaluation = evaluateProgramQuality({
      program,
      questionnaire,
      persona: "p7-gym-flagship",
    });
    expect(evaluation.passed).toBe(true);
    expect(evaluation.hardFailures).toEqual([]);
    expect(program.templateVersion).toBe(PROGRAM_TEMPLATE_VERSION);
    expect(PROGRAM_TEMPLATE_VERSION).toBe(19);
  });

  test("hard failure cannot be offset by structural score", () => {
    const questionnaire: QuestionnaireData = {
      goals: "General fitness",
      painAreas: [],
      experience: "Beginner",
      equipment: ["gym"],
      daysPerWeek: 3,
    };
    const program = generate(
      questionnaire,
      "p7-score-integrity",
      1,
      "p7-score-integrity-seed"
    );
    const broken = {
      ...program,
      week: program.week.map((day, index) =>
        index === 0
          ? {
              ...day,
              routine: day.routine.map((item) =>
                item.section === "main"
                  ? { ...item, exerciseId: "totally-invalid-exercise-id" }
                  : item
              ),
            }
          : day
      ),
    };
    const evaluation = evaluateProgramQuality({
      program: broken,
      questionnaire,
      persona: "p7-score-integrity",
    });
    expect(evaluation.passed).toBe(false);
    expect(evaluation.hardFailures.length).toBeGreaterThan(0);
    // Score may still be computed; it must not flip passed=true.
    expect(evaluation.passed && (evaluation.structuralScore ?? 0) >= 90).toBe(
      false
    );
  });

  test("deterministic signatures match for identical seeds", () => {
    const questionnaire: QuestionnaireData = {
      goals: "Improve posture",
      painAreas: [],
      experience: "Intermediate",
      equipment: ["dumbbells"],
      daysPerWeek: 3,
    };
    const a = generate(questionnaire, "p7-sig-a", 1, "p7-sig-seed");
    const b = generate(questionnaire, "p7-sig-b", 1, "p7-sig-seed");
    const mode = resolvePrimaryProgramEquipmentMode(questionnaire.equipment);
    const sigA = computeProgramQualitySignature({
      mode,
      phaseIndex: a.phaseIndex ?? 1,
      daysPerWeek: a.daysPerWeek,
      week: a.week,
    });
    const sigB = computeProgramQualitySignature({
      mode,
      phaseIndex: b.phaseIndex ?? 1,
      daysPerWeek: b.daysPerWeek,
      week: b.week,
    });
    expect(sigA).toBe(sigB);
  });

  test("cross-mode contamination: equipment identity stays truthful", () => {
    const cases: Array<{ equipment: string[]; mode: string }> = [
      { equipment: ["gym", "dumbbells", "bands"], mode: "gym" },
      { equipment: ["dumbbells"], mode: "dumbbells" },
      { equipment: ["bands"], mode: "bands" },
      { equipment: ["none"], mode: "bodyweight" },
      { equipment: ["dumbbells", "bands"], mode: "mixedHome" },
      { equipment: ["bands", "dumbbells"], mode: "mixedHome" },
    ];
    for (const entry of cases) {
      expect(resolvePrimaryProgramEquipmentMode(entry.equipment as never)).toBe(
        entry.mode
      );
      const questionnaire: QuestionnaireData = {
        goals: "General fitness",
        painAreas: [],
        experience: "Beginner",
        equipment: entry.equipment as QuestionnaireData["equipment"],
        daysPerWeek: 3,
        ...(entry.mode === "bands" || entry.mode === "mixedHome"
          ? { bandSetup: "loop_only" as const }
          : {}),
      };
      const program = generate(
        questionnaire,
        `p7-xmode-${entry.mode}`,
        1,
        `p7-xmode-${entry.mode}-seed`
      );
      const titles = program.week.map((day) => day.title).join(" ");
      if (entry.mode !== "gym") {
        expect(titles.toLowerCase()).not.toMatch(/back \+ chest|shoulders \+ arms/);
      }
      if (entry.mode === "dumbbells") {
        expect(titles.toLowerCase()).not.toMatch(/band/);
      }
      const evaluation = evaluateProgramQuality({
        program,
        questionnaire,
        persona: `p7-xmode-${entry.mode}`,
      });
      expect(evaluation.passed).toBe(true);
    }
  });

  test("stored template version 17 remains the generation version", () => {
    expect(PROGRAM_TEMPLATE_VERSION).toBe(19);
    const program = generate(
      {
        goals: "General fitness",
        painAreas: [],
        experience: "Beginner",
        equipment: ["gym"],
        daysPerWeek: 3,
      },
      "p7-template-version",
      1,
      "p7-template-version-seed"
    );
    expect(program.templateVersion).toBe(19);
  });
});
