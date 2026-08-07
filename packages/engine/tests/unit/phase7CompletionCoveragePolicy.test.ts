import { beforeEach, describe, expect, test } from "vitest";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import { exerciseById } from "@/lib/exercises";
import {
  clearProgramVariationHistory,
  generateWeeklyProgram,
  getWeeklyCoverageContract,
  hasLegalTrueCarryExposureCandidate,
  PROGRAM_TEMPLATE_VERSION,
  summarizeWeekCoverage,
} from "@/lib/program";
import { auditCoverageContract } from "@/lib/__debug__/coverageContractAudit";

const generate = (
  questionnaire: QuestionnaireData,
  seed: string,
  phaseIndex: 1 | 2 | 3 = 1
) => {
  clearProgramVariationHistory();
  return generateWeeklyProgram(questionnaire, `p7c-${seed}`, {
    phaseIndex,
    seed,
    skipQualityGate: true,
  });
};

const countAccessoryIds = (program: ReturnType<typeof generateWeeklyProgram>) =>
  program.week.flatMap((day) =>
    day.routine.filter((item) => item.section === "accessory").map((item) => item.exerciseId)
  );

const trueCarryIdsInWeek = (program: ReturnType<typeof generateWeeklyProgram>) =>
  program.week.flatMap((day) =>
    day.routine
      .filter((item) => {
        const exercise = exerciseById(item.exerciseId);
        return exercise?.carryType === "carry";
      })
      .map((item) => item.exerciseId)
  );

const coreStabilityMarchIdsInWeek = (program: ReturnType<typeof generateWeeklyProgram>) =>
  program.week.flatMap((day) =>
    day.routine
      .filter((item) => {
        const exercise = exerciseById(item.exerciseId);
        return (
          exercise?.carryType === "coreStability" ||
          /march|suitcase-hold/i.test(item.exerciseId)
        );
      })
      .map((item) => item.exerciseId)
  );

describe("Phase 7 Completion — 4-day gym arm/push quota", () => {
  beforeEach(() => {
    clearProgramVariationHistory();
  });

  test("four-day contract expects one direct biceps, triceps, and push day", () => {
    const contract = getWeeklyCoverageContract(4);
    expect(contract.bicepsDays).toBe(1);
    expect(contract.tricepsDays).toBe(1);
    expect(contract.pushDays).toBe(1);
    expect(contract.hingeDays).toBe(1);
    expect(contract.pullDays).toBe(2);
  });

  test("gym 4-day upper/lower meets arm and push quotas without volume inflation", () => {
    const questionnaire: QuestionnaireData = {
      goals: "Improve posture",
      painAreas: [],
      experience: "Beginner",
      daysPerWeek: 4,
      equipment: ["gym"],
    };
    const program = generate(
      questionnaire,
      "phase-matrix-normal beginner-4-gym-activation",
      1
    );
    const weekly = summarizeWeekCoverage(program.week);
    const contract = getWeeklyCoverageContract(4);
    expect(weekly.bicepsDays).toBeGreaterThanOrEqual(contract.bicepsDays);
    expect(weekly.tricepsDays).toBeGreaterThanOrEqual(contract.tricepsDays);
    expect(weekly.pushDays).toBeGreaterThanOrEqual(contract.pushDays);
    expect(weekly.pullDays).toBeGreaterThanOrEqual(contract.pullDays);

    const accessories = countAccessoryIds(program);
    expect(accessories.length).toBeLessThanOrEqual(8);
    // No same-day duplicate accessory insertion.
    for (const day of program.week) {
      const dayAccessories = day.routine
        .filter((item) => item.section === "accessory")
        .map((item) => item.exerciseId);
      expect(new Set(dayAccessories).size).toBe(dayAccessories.length);
    }
  });

  test("direct biceps work does not falsely satisfy push coverage", () => {
    const questionnaire: QuestionnaireData = {
      goals: "Improve posture",
      painAreas: [],
      experience: "Intermediate",
      daysPerWeek: 4,
      equipment: ["gym"],
    };
    const program = generate(
      questionnaire,
      "phase-matrix-intermediate-4-gym-skill",
      2
    );
    const weekly = summarizeWeekCoverage(program.week);
    const bicepsOnlyDays = program.week.filter((day) =>
      day.routine.some((item) => {
        const exercise = exerciseById(item.exerciseId);
        return Boolean(
          exercise &&
            (exercise.tags?.includes("biceps") || /biceps|curl/i.test(exercise.id)) &&
            !exercise.movementPattern.some((pattern) =>
              ["push", "horizontalpush", "verticalpush"].includes(pattern.toLowerCase())
            )
        );
      })
    );
    expect(bicepsOnlyDays.length).toBeGreaterThan(0);
    expect(weekly.pushDays).toBeGreaterThanOrEqual(1);
    expect(weekly.bicepsDays).toBeGreaterThanOrEqual(1);
  });

  test("indirect triceps on compounds is distinct from direct triceps accessory work", () => {
    const questionnaire: QuestionnaireData = {
      goals: "Improve posture",
      painAreas: [],
      experience: "Beginner",
      daysPerWeek: 4,
      equipment: ["gym"],
    };
    const program = generate(
      questionnaire,
      "phase-matrix-normal beginner-4-gym-growth",
      3
    );
    const directTriceps = program.week.flatMap((day) =>
      day.routine.filter((item) => {
        if (item.section !== "accessory") return false;
        const exercise = exerciseById(item.exerciseId);
        return Boolean(
          exercise &&
            (exercise.tags?.includes("triceps") || /triceps/i.test(exercise.id))
        );
      })
    );
    expect(directTriceps.length).toBeGreaterThanOrEqual(1);
    expect(summarizeWeekCoverage(program.week).tricepsDays).toBeGreaterThanOrEqual(1);
  });

  test("pain-aware four-day gym still preserves push coverage when safe capability exists", () => {
    const questionnaire: QuestionnaireData = {
      goals: "Reduce pain",
      painAreas: ["low_back", "shoulders"],
      experience: "Beginner",
      daysPerWeek: 4,
      equipment: ["gym"],
    };
    const program = generate(
      questionnaire,
      "phase-matrix-pain beginner-4-gym-activation",
      1
    );
    const weekly = summarizeWeekCoverage(program.week);
    expect(weekly.pushDays).toBeGreaterThanOrEqual(1);
    expect(weekly.bicepsDays).toBeGreaterThanOrEqual(1);
    expect(weekly.tricepsDays).toBeGreaterThanOrEqual(1);
  });
});

describe("Phase 7 Completion — carry exposure intelligence", () => {
  beforeEach(() => {
    clearProgramVariationHistory();
  });

  test("true carry and core-stability marches are not identical coverage", () => {
    expect(
      hasLegalTrueCarryExposureCandidate({
        capabilityMode: "hasLoad",
        painAreas: [],
      })
    ).toBe(true);
    expect(
      hasLegalTrueCarryExposureCandidate({
        capabilityMode: "noneOnly",
        painAreas: [],
      })
    ).toBe(false);
    expect(
      hasLegalTrueCarryExposureCandidate({
        capabilityMode: "bandOnly",
        painAreas: [],
      })
    ).toBe(false);

    const farmers = exerciseById("farmers-carry");
    const march = exerciseById("suitcase-hold-march");
    expect(farmers?.carryType).toBe("carry");
    expect(march?.carryType).toBe("coreStability");
  });

  test("equipment-appropriate gym activation places a true loaded carry", () => {
    const questionnaire: QuestionnaireData = {
      goals: "Improve posture",
      painAreas: [],
      experience: "Beginner",
      daysPerWeek: 4,
      equipment: ["gym"],
    };
    const program = generate(
      questionnaire,
      "phase-matrix-normal beginner-4-gym-activation",
      1
    );
    const weekly = summarizeWeekCoverage(program.week);
    const trueCarries = trueCarryIdsInWeek(program);
    expect(weekly.carryDays).toBeGreaterThanOrEqual(1);
    expect(trueCarries.length).toBeGreaterThanOrEqual(1);
    expect(trueCarries.every((id) => exerciseById(id)?.carryType === "carry")).toBe(
      true
    );
  });

  test("pain-aware carry limitation does not require loaded carries when contraindicated", () => {
    expect(
      hasLegalTrueCarryExposureCandidate({
        capabilityMode: "hasLoad",
        painAreas: ["low_back", "shoulders"],
      })
    ).toBe(false);

    const questionnaire: QuestionnaireData = {
      goals: "Reduce pain",
      painAreas: ["low_back", "shoulders"],
      experience: "Beginner",
      daysPerWeek: 4,
      equipment: ["gym"],
    };
    const program = generate(
      questionnaire,
      "phase-matrix-pain beginner-4-gym-activation",
      1
    );
    const audit = auditCoverageContract({
      profile: "pain beginner",
      phase: "activation",
      daysPerWeek: 4,
      equipment: ["gym"],
      questionnaire,
      program,
    });
    expect(
      audit.intelligenceFailures.some((failure) =>
        failure.includes("Carry exposure missing")
      )
    ).toBe(false);
    expect(trueCarryIdsInWeek(program)).toEqual([]);
  });

  test("bodyweight four-day does not require loaded carries or mislabel marches as carries", () => {
    const questionnaire: QuestionnaireData = {
      goals: "Improve posture",
      painAreas: [],
      experience: "Beginner",
      daysPerWeek: 4,
      equipment: ["none"],
    };
    const program = generate(
      questionnaire,
      "phase-matrix-normal beginner-4-none-activation",
      1
    );
    const weekly = summarizeWeekCoverage(program.week);
    expect(weekly.carryDays).toBe(0);
    expect(trueCarryIdsInWeek(program)).toEqual([]);
    const audit = auditCoverageContract({
      profile: "normal beginner",
      phase: "activation",
      daysPerWeek: 4,
      equipment: ["none"],
      questionnaire,
      program,
    });
    expect(
      audit.intelligenceFailures.some((failure) =>
        failure.includes("Carry exposure missing")
      )
    ).toBe(false);
    // Marches may appear as core stability, but must not inflate carryDays.
    for (const id of coreStabilityMarchIdsInWeek(program)) {
      expect(exerciseById(id)?.carryType).not.toBe("carry");
    }
  });

  test("frequency-specific carry quota stays bounded and deterministic", () => {
    const questionnaire: QuestionnaireData = {
      goals: "Improve posture",
      painAreas: [],
      experience: "Beginner",
      daysPerWeek: 4,
      equipment: ["gym"],
    };
    const first = generate(
      questionnaire,
      "phase-matrix-normal beginner-4-gym-activation",
      1
    );
    const second = generate(
      questionnaire,
      "phase-matrix-normal beginner-4-gym-activation",
      1
    );
    expect(first.week.map((day) => day.routine.map((item) => item.exerciseId))).toEqual(
      second.week.map((day) => day.routine.map((item) => item.exerciseId))
    );
    const accessories = countAccessoryIds(first);
    const farmersCount = accessories.filter((id) => id === "farmers-carry").length;
    expect(farmersCount).toBeGreaterThanOrEqual(1);
    expect(farmersCount).toBeLessThanOrEqual(2);
    expect(PROGRAM_TEMPLATE_VERSION).toBe(19);
  });
});

describe("Phase 7 Completion — quality-gate recovery preserves blocks", () => {
  beforeEach(() => {
    clearProgramVariationHistory();
  });

  test("blocked exercise stays excluded across quality-gate recovery", () => {
    const questionnaire: QuestionnaireData = {
      goals: "Improve posture",
      painAreas: [],
      experience: "Beginner",
      daysPerWeek: 3,
      equipment: ["gym"],
      trainingIntent: "build",
    };
    const program = generateWeeklyProgram(questionnaire, "prog-gym-blocked", {
      blockedExerciseIds: {
        "machine-leg-press": {
          reason: "no_equipment",
          blockedAt: { phase: "skill", sessionCount: 6 },
        },
      },
      seed: "deterministic-seed-gym",
    });
    const ids = program.week.flatMap((day) =>
      day.routine.map((item) => item.exerciseId)
    );
    expect(ids).not.toContain("machine-leg-press");
    expect(ids).toContain("goblet-squat");
  });

  test("blocked db-rdl falls back to band hinge without starving hinge_primary", () => {
    const questionnaire: QuestionnaireData = {
      goals: "Improve posture",
      painAreas: [],
      experience: "Intermediate",
      daysPerWeek: 3,
      equipment: ["dumbbells", "bands", "gym", "barbell", "cables"],
    };
    const program = generateWeeklyProgram(questionnaire, "prog-block-db-rdl", {
      blockedExerciseIds: {
        "db-rdl": {
          reason: "personal_preference",
          blockedAt: { phase: "skill", sessionCount: 5 },
        },
      },
    });
    const ids = program.week.flatMap((day) =>
      day.routine.map((item) => item.exerciseId)
    );
    expect(ids).not.toContain("db-rdl");
    expect(ids).toContain("band-rdl");
  });
});
