import { beforeEach, describe, expect, test } from "vitest";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import { exerciseById, type Exercise } from "@/lib/exercises";
import {
  clearProgramVariationHistory,
  generateWeeklyProgram,
  type ProgramDayKey,
  type ProgramRecentGenerationSummary,
} from "@/lib/program";

const normalizeToken = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");

const hasHorizontalPushMain = (exercise: Exercise) => {
  const patterns = new Set((exercise.movementPattern ?? []).map(normalizeToken));
  return patterns.has("push") && !patterns.has("verticalpush");
};

const isFlyMain = (exercise: Exercise) => {
  const family = normalizeToken(exercise.familyKey ?? "");
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  return (
    family === "chestfly" ||
    descriptor.includes("fly") ||
    descriptor.includes("pec deck") ||
    descriptor.includes("pec-deck")
  );
};

const isPressMain = (exercise: Exercise) =>
  hasHorizontalPushMain(exercise) && !isFlyMain(exercise);

const isHorizontalPullMain = (exercise: Exercise) => {
  const patterns = new Set((exercise.movementPattern ?? []).map(normalizeToken));
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  return patterns.has("horizontalpull") || descriptor.includes("row");
};

const isVerticalPullMain = (exercise: Exercise) =>
  exercise.movementPattern.some((entry) => normalizeToken(entry) === "verticalpull");

const isOhpMain = (exercise: Exercise) => {
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  const patterns = new Set((exercise.movementPattern ?? []).map((entry) => normalizeToken(entry)));
  return (
    patterns.has("verticalpush") ||
    descriptor.includes("shoulder press") ||
    descriptor.includes("overhead press") ||
    descriptor.includes("pike-pushup")
  );
};

const isLateralMain = (exercise: Exercise) =>
  exercise.movementPattern.some((entry) => normalizeToken(entry) === "lateralraise");

const isRowLeakMain = (exercise: Exercise) => {
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  return descriptor.includes("row");
};

const isExternalRotationLeakMain = (exercise: Exercise) => {
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  const family = normalizeToken(exercise.familyKey ?? "");
  return (
    descriptor.includes("external rotation") ||
    descriptor.includes("external-rotation") ||
    family === "externalrotation"
  );
};

const isCarryLeakMain = (exercise: Exercise) => {
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  const patterns = new Set((exercise.movementPattern ?? []).map((entry) => normalizeToken(entry)));
  const tags = new Set((exercise.tags ?? []).map((entry) => normalizeToken(entry)));
  return (
    patterns.has("carry") ||
    tags.has("carry") ||
    descriptor.includes("carry") ||
    descriptor.includes("suitcase") ||
    descriptor.includes("farmer")
  );
};

const getDay = (
  program: ReturnType<typeof generateWeeklyProgram>,
  dayTitle: "Back + Chest" | "Shoulders + Arms"
) => {
  const day = program.week.find((entry) => entry.title === dayTitle);
  if (!day) throw new Error(`Missing ${dayTitle} day`);
  return day;
};

const getMainExercises = (
  program: ReturnType<typeof generateWeeklyProgram>,
  dayTitle: "Back + Chest" | "Shoulders + Arms"
) =>
  getDay(program, dayTitle).routine
    .filter((item) => item.section === "main")
    .map((item) => exerciseById(item.exerciseId))
    .filter((exercise): exercise is Exercise => Boolean(exercise));

const daySectionSignature = (
  program: ReturnType<typeof generateWeeklyProgram>,
  dayTitle: "Back + Chest" | "Shoulders + Arms",
  section: "main" | "accessory"
) =>
  getDay(program, dayTitle).routine
    .filter((item) => item.section === section)
    .map((item) => item.exerciseId)
    .join(",");

const weekMainSignature = (program: ReturnType<typeof generateWeeklyProgram>) =>
  program.week
    .map((day) =>
      day.routine
        .filter((item) => item.section === "main")
        .map((item) => item.exerciseId)
        .join(",")
    )
    .join("|");

const weekFullRoutineSignature = (program: ReturnType<typeof generateWeeklyProgram>) =>
  program.week
    .map((day) => day.routine.map((item) => `${item.section}:${item.exerciseId}`).join(","))
    .join("|");

const templateKeyByDayTitle: Record<string, string> = {
  "Back + Chest": "back_chest_intermediate_press_fly_row_vertical",
  "Shoulders + Arms": "shoulders_arms_ohp_lateral_rear_support",
};

const dayTitleToKey = (dayTitle: string): ProgramDayKey | null => {
  if (dayTitle === "Back + Chest") return "day1_back_chest";
  if (dayTitle === "Shoulders + Arms") return "day2_shoulders_arms";
  if (dayTitle === "Legs + Abs") return "day3_legs_abs";
  return null;
};

const buildRecentGenerationSummary = (
  program: ReturnType<typeof generateWeeklyProgram>,
  context: {
    settingsHash: string;
    variationIndex: number;
  }
): ProgramRecentGenerationSummary => {
  const resolvedPhaseIndex = ((): 1 | 2 | 3 => {
    const rawPhase = Number(program.phaseIndex ?? program.phase?.phaseIndex ?? 1);
    if (rawPhase >= 3) return 3;
    if (rawPhase <= 1) return 1;
    return 2;
  })();
  const exerciseIds = program.week.flatMap((day) =>
    day.routine.map((item) => item.exerciseId)
  );
  const familyKeys = exerciseIds
    .map((id) => exerciseById(id))
    .filter((exercise): exercise is Exercise => Boolean(exercise))
    .map((exercise) => exercise.familyKey ?? exercise.id);
  const variantKeys = exerciseIds
    .map((id) => exerciseById(id))
    .filter((exercise): exercise is Exercise => Boolean(exercise))
    .map(
      (exercise) =>
        exercise.variantKey ??
        `${exercise.loadType}-${exercise.equipment.slice().sort().join("_") || "none"}`
    );
  const days = Object.fromEntries(
    program.week.map((day) => {
      const dayKey = dayTitleToKey(day.title);
      const routineIds = day.routine
        .filter((item) => item.section === "main")
        .map((item) => item.exerciseId);
      const accessoryIds = day.routine
        .filter((item) => item.section === "accessory")
        .map((item) => item.exerciseId);
      const routineExercises = routineIds
        .map((id) => exerciseById(id))
        .filter((exercise): exercise is Exercise => Boolean(exercise));
      const accessoryExercises = accessoryIds
        .map((id) => exerciseById(id))
        .filter((exercise): exercise is Exercise => Boolean(exercise));
      const dayExercises = [...routineExercises, ...accessoryExercises];
      const routineFamilyKeys = routineExercises.map(
        (exercise) => exercise.familyKey ?? exercise.id
      );
      const accessoryFamilyKeys = accessoryExercises.map(
        (exercise) => exercise.familyKey ?? exercise.id
      );
      const routineVariantKeys = routineExercises.map(
        (exercise) =>
          exercise.variantKey ??
          `${exercise.loadType}-${exercise.equipment.slice().sort().join("_") || "none"}`
      );
      const accessoryVariantKeys = accessoryExercises.map(
        (exercise) =>
          exercise.variantKey ??
          `${exercise.loadType}-${exercise.equipment.slice().sort().join("_") || "none"}`
      );
      const summary = {
        templateKey: templateKeyByDayTitle[day.title],
        phaseSummaries: [
          {
            phase: resolvedPhaseIndex,
            routineIds,
            accessoryIds,
            routineFamilyKeys,
            accessoryFamilyKeys,
            routineVariantKeys,
            accessoryVariantKeys,
          },
        ],
        // Keep legacy fields for backward-compatibility hooks.
        routineIds,
        accessoryIds,
        familyKeys: dayExercises.map((exercise) => exercise.familyKey ?? exercise.id),
        variantKeys: dayExercises.map(
          (exercise) =>
            exercise.variantKey ??
            `${exercise.loadType}-${exercise.equipment.slice().sort().join("_") || "none"}`
        ),
      };
      return [
        dayKey ?? day.title,
        summary,
      ];
    })
  );
  return {
    settingsHash: context.settingsHash,
    variationIndex: context.variationIndex,
    generatedAt: Date.now(),
    phaseIndex: resolvedPhaseIndex,
    days,
    exerciseIds,
    familyKeys,
    variantKeys,
    dayTemplateKeys: Object.fromEntries(
      Object.entries(templateKeyByDayTitle).map(([title, templateKey]) => [
        dayTitleToKey(title) ?? title,
        templateKey,
      ])
    ),
  };
};

const expectThreeDayContractsHold = (program: ReturnType<typeof generateWeeklyProgram>) => {
  const day1Mains = getMainExercises(program, "Back + Chest");
  const day2Mains = getMainExercises(program, "Shoulders + Arms");

  expect(day1Mains.length).toBe(4);
  expect(day1Mains.filter(isPressMain).length).toBe(1);
  expect(day1Mains.filter(isFlyMain).length).toBe(1);
  expect(day1Mains.filter(isHorizontalPullMain).length).toBeGreaterThanOrEqual(1);
  expect(day1Mains.filter(isVerticalPullMain).length).toBeGreaterThanOrEqual(1);
  expect(new Set(day1Mains.map((exercise) => exercise.id)).size).toBe(day1Mains.length);

  expect(day2Mains.length).toBe(4);
  expect(day2Mains.filter(isOhpMain).length).toBe(1);
  expect(day2Mains.filter(isLateralMain).length).toBe(1);
  expect(day2Mains.some((exercise) => isRowLeakMain(exercise))).toBe(false);
  expect(day2Mains.some((exercise) => isExternalRotationLeakMain(exercise))).toBe(false);
  expect(day2Mains.some((exercise) => isCarryLeakMain(exercise))).toBe(false);
  expect(new Set(day2Mains.map((exercise) => exercise.id)).size).toBe(day2Mains.length);
};

describe("controlled variety engine pass", () => {
  beforeEach(() => {
    clearProgramVariationHistory();
  });

  test("different variation seeds/indexes create non-identical valid programs when alternatives exist", () => {
    const input: QuestionnaireData = {
      goals: "General fitness",
      painAreas: [],
      experience: "Intermediate",
      equipment: ["gym"],
      daysPerWeek: 3,
    };

    const signatures = Array.from({ length: 5 }, (_, index) => {
      const program = generateWeeklyProgram(input, `var-seed-${index}`, {
        phaseIndex: 2,
        variation: {
          seed: "controlled-variety",
          index,
          useRecentMemory: false,
        },
      });
      expectThreeDayContractsHold(program);
      return weekFullRoutineSignature(program);
    });

    expect(new Set(signatures).size).toBeGreaterThan(1);
  });

  test("variationIndex is supported as an alias for index", () => {
    const input: QuestionnaireData = {
      goals: "General fitness",
      painAreas: [],
      experience: "Intermediate",
      equipment: ["gym"],
      daysPerWeek: 3,
    };
    const withVariationIndex = generateWeeklyProgram(input, "variation-index-alias-a", {
      phaseIndex: 2,
      variation: {
        seed: "alias-check",
        variationIndex: 3,
        useRecentMemory: false,
      },
    });
    const withLegacyIndex = generateWeeklyProgram(input, "variation-index-alias-b", {
      phaseIndex: 2,
      variation: {
        seed: "alias-check",
        index: 3,
        useRecentMemory: false,
      },
    });

    expectThreeDayContractsHold(withVariationIndex);
    expectThreeDayContractsHold(withLegacyIndex);
    expect(weekFullRoutineSignature(withVariationIndex)).toBe(
      weekFullRoutineSignature(withLegacyIndex)
    );
  });

  test("omitted variationIndex defaults to 0", () => {
    const input: QuestionnaireData = {
      goals: "General fitness",
      painAreas: [],
      experience: "Intermediate",
      equipment: ["gym"],
      daysPerWeek: 3,
    };
    const omittedIndex = generateWeeklyProgram(input, "variation-default-omitted", {
      phaseIndex: 2,
      variation: {
        seed: "default-index-check",
        useRecentMemory: false,
      },
    });
    const explicitZero = generateWeeklyProgram(input, "variation-default-explicit", {
      phaseIndex: 2,
      variation: {
        seed: "default-index-check",
        variationIndex: 0,
        useRecentMemory: false,
      },
    });

    expectThreeDayContractsHold(omittedIndex);
    expectThreeDayContractsHold(explicitZero);
    expect(weekFullRoutineSignature(omittedIndex)).toBe(weekFullRoutineSignature(explicitZero));
  });

  test("limited-option slot may repeat across variation seeds (acceptable)", () => {
    const input: QuestionnaireData = {
      goals: "General fitness",
      painAreas: [],
      experience: "Beginner",
      equipment: ["none"],
      daysPerWeek: 3,
    };

    const first = generateWeeklyProgram(input, "limited-repeat-a", {
      phaseIndex: 1,
      variation: { seed: "limited", index: 1, useRecentMemory: false },
    });
    const second = generateWeeklyProgram(input, "limited-repeat-b", {
      phaseIndex: 1,
      variation: { seed: "limited", index: 2, useRecentMemory: false },
    });

    const firstLateralId = getMainExercises(first, "Shoulders + Arms").find((exercise) =>
      isLateralMain(exercise)
    )?.id;
    const secondLateralId = getMainExercises(second, "Shoulders + Arms").find((exercise) =>
      isLateralMain(exercise)
    )?.id;

    expect(firstLateralId).toBeTruthy();
    expect(secondLateralId).toBe(firstLateralId);
  });

  test("variation logic never violates 3-day day contracts and caps", () => {
    const input: QuestionnaireData = {
      goals: "Improve posture",
      painAreas: [],
      experience: "Intermediate",
      equipment: ["gym", "bands"],
      daysPerWeek: 3,
    };

    Array.from({ length: 6 }, (_, index) => {
      const program = generateWeeklyProgram(input, `var-contract-${index}`, {
        phaseIndex: 2,
        variation: {
          seed: "contract-safe",
          index,
          useRecentMemory: true,
        },
      });
      expectThreeDayContractsHold(program);
    });
  });

  test("prior-memory variety penalty changes subsequent generation when alternatives exist", () => {
    const input: QuestionnaireData = {
      goals: "General fitness",
      painAreas: [],
      experience: "Intermediate",
      equipment: ["gym"],
      daysPerWeek: 3,
    };
    const options = {
      phaseIndex: 2 as const,
      variation: {
        seed: "memory-pass",
        index: 7,
        useRecentMemory: true,
        settingsHash: "memory-pass-profile",
      },
    };

    const first = generateWeeklyProgram(input, "memory-var-first", options);
    const second = generateWeeklyProgram(input, "memory-var-second", options);

    expectThreeDayContractsHold(first);
    expectThreeDayContractsHold(second);
    expect(weekMainSignature(second)).not.toBe(weekMainSignature(first));
  });

  test("day-specific variety intent emphasizes Day 1 mains and Day 2 mains/accessories across same-profile regenerations", () => {
    const input: QuestionnaireData = {
      goals: "General fitness",
      painAreas: [],
      experience: "Intermediate",
      equipment: ["gym", "bands"],
      daysPerWeek: 3,
    };
    const options = {
      phaseIndex: 2 as const,
      variation: {
        seed: "day-specific-variety-intent",
        variationIndex: 2,
        useRecentMemory: true,
        settingsHash: "day-specific-variety-intent-profile",
      },
    };

    const generated = Array.from({ length: 5 }, (_, index) =>
      generateWeeklyProgram(input, `day-specific-variety-intent-${index}`, options)
    );

    generated.forEach((program) => expectThreeDayContractsHold(program));

    const day1MainSignatures = generated.map((program) =>
      daySectionSignature(program, "Back + Chest", "main")
    );
    const day2MainSignatures = generated.map((program) =>
      daySectionSignature(program, "Shoulders + Arms", "main")
    );
    const day2AccessorySignatures = generated.map((program) =>
      daySectionSignature(program, "Shoulders + Arms", "accessory")
    );

    expect(new Set(day1MainSignatures).size).toBeGreaterThan(1);
    expect(new Set(day2MainSignatures).size).toBeGreaterThan(1);
    expect(new Set(day2AccessorySignatures).size).toBeGreaterThan(1);
  });

  test("external recent-generation summary enforces repetition penalties while preserving contracts", () => {
    const input: QuestionnaireData = {
      goals: "General fitness",
      painAreas: [],
      experience: "Intermediate",
      equipment: ["gym"],
      daysPerWeek: 3,
    };
    const baseVariation = {
      seed: "summary-hook",
      index: 11,
      useRecentMemory: false,
      settingsHash: "summary-hook-profile",
    } as const;

    const first = generateWeeklyProgram(input, "summary-hook-first", {
      phaseIndex: 2,
      variation: baseVariation,
    });
    const second = generateWeeklyProgram(input, "summary-hook-second", {
      phaseIndex: 2,
      variation: {
        ...baseVariation,
        recentGenerationSummary: buildRecentGenerationSummary(first, {
          settingsHash: baseVariation.settingsHash,
          variationIndex: baseVariation.index,
        }),
      },
    });
    const third = generateWeeklyProgram(input, "summary-hook-third", {
      phaseIndex: 2,
      variation: {
        ...baseVariation,
        recentGenerationSummary: buildRecentGenerationSummary(first, {
          settingsHash: baseVariation.settingsHash,
          variationIndex: baseVariation.index,
        }),
      },
    });

    expectThreeDayContractsHold(first);
    expectThreeDayContractsHold(second);
    expectThreeDayContractsHold(third);
    expect(weekFullRoutineSignature(second)).not.toBe(weekFullRoutineSignature(first));
    expect(weekFullRoutineSignature(third)).toBe(weekFullRoutineSignature(second));
  });
});
