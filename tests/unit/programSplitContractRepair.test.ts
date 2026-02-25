import { describe, expect, test } from "vitest";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import { exerciseById, type Exercise } from "@/lib/exercises";
import { generateWeeklyProgram } from "@/lib/program";

type MainPattern = "push" | "verticalPush" | "pull" | "squat" | "hinge";

const normalizePattern = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");

const hasMainPattern = (
  day: ReturnType<typeof generateWeeklyProgram>["week"][number],
  required: MainPattern
) => {
  const requiredToken = normalizePattern(required);
  return day.routine
    .filter((item) => item.section === "main")
    .some((item) => {
      const exercise = exerciseById(item.exerciseId);
      if (!exercise) return false;
      const patternMatch = exercise.movementPattern.some(
        (pattern) => normalizePattern(pattern) === requiredToken
      );
      if (patternMatch) return true;
      if (required !== "verticalPush") return false;
      const tagTokens = new Set((exercise.tags ?? []).map(normalizePattern));
      const muscleTokens = new Set((exercise.muscleGroups ?? []).map(normalizePattern));
      const shouldersTagMatch = tagTokens.has("shoulders") || tagTokens.has("vertical");
      const shouldersMuscleMatch = muscleTokens.has("shoulders");
      return shouldersTagMatch && shouldersMuscleMatch;
    });
};

const expectDayHasRequiredMainPatterns = (params: {
  program: ReturnType<typeof generateWeeklyProgram>;
  dayTitle: string;
  requiredPatterns: MainPattern[];
}) => {
  const { program, dayTitle, requiredPatterns } = params;
  const day = program.week.find((entry) => entry.title === dayTitle);
  expect(day).toBeTruthy();
  if (!day) return;
  requiredPatterns.forEach((pattern) => {
    expect(
      hasMainPattern(day, pattern),
      `${dayTitle} missing required main ${pattern}`
    ).toBe(true);
  });
};

const expectDayLacksMainPatterns = (params: {
  program: ReturnType<typeof generateWeeklyProgram>;
  dayTitle: string;
  forbiddenPatterns: MainPattern[];
}) => {
  const { program, dayTitle, forbiddenPatterns } = params;
  const day = program.week.find((entry) => entry.title === dayTitle);
  expect(day).toBeTruthy();
  if (!day) return;
  forbiddenPatterns.forEach((pattern) => {
    expect(
      hasMainPattern(day, pattern),
      `${dayTitle} should not include main ${pattern}`
    ).toBe(false);
  });
};

const isChestDominantMain = (exerciseId: string) => {
  const exercise = exerciseById(exerciseId);
  if (!exercise) return false;
  const patterns = new Set((exercise.movementPattern ?? []).map(normalizePattern));
  if (!patterns.has("push")) return false;
  const tags = new Set((exercise.tags ?? []).map(normalizePattern));
  const muscles = new Set((exercise.muscleGroups ?? []).map(normalizePattern));
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  return (
    tags.has("chest") ||
    muscles.has("chest") ||
    descriptor.includes("chest") ||
    descriptor.includes("bench") ||
    descriptor.includes("floor press") ||
    descriptor.includes("floor-press")
  );
};

const isCarryLikeExercise = (exercise: Exercise) => {
  const patterns = new Set((exercise.movementPattern ?? []).map(normalizePattern));
  const tags = new Set((exercise.tags ?? []).map(normalizePattern));
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  return (
    patterns.has("carry") ||
    tags.has("carry") ||
    descriptor.includes("carry") ||
    descriptor.includes("suitcase")
  );
};

describe("split contract repair enforcement", () => {
  test("3-day split enforces required main patterns per day", () => {
    const input: QuestionnaireData = {
      goals: "Reduce pain",
      painAreas: ["Shoulders", "Lower back"],
      experience: "Beginner",
      equipment: ["bands"],
      daysPerWeek: 3,
    };
    const program = generateWeeklyProgram(input, "split-3-day-repair", {
      phaseIndex: 3,
      seed: "split-3-day-repair",
    });

    expectDayHasRequiredMainPatterns({
      program,
      dayTitle: "Back + Chest",
      requiredPatterns: ["pull", "push"],
    });
    expectDayLacksMainPatterns({
      program,
      dayTitle: "Back + Chest",
      forbiddenPatterns: ["squat", "hinge"],
    });
    expectDayHasRequiredMainPatterns({
      program,
      dayTitle: "Shoulders + Arms",
      requiredPatterns: ["verticalPush"],
    });
    expectDayLacksMainPatterns({
      program,
      dayTitle: "Shoulders + Arms",
      forbiddenPatterns: ["squat", "hinge"],
    });
    const shouldersDay = program.week.find((entry) => entry.title === "Shoulders + Arms");
    expect(shouldersDay).toBeTruthy();
    if (shouldersDay) {
      const shoulderMainExercises = shouldersDay.routine
        .filter((item) => item.section === "main")
        .map((item) => exerciseById(item.exerciseId))
        .filter((exercise): exercise is Exercise => Boolean(exercise));
      const hasPullMain = shoulderMainExercises.some((exercise) => {
        const patterns = new Set((exercise.movementPattern ?? []).map(normalizePattern));
        return patterns.has("pull") || patterns.has("horizontalpull");
      });
      const hasLateralMain = shoulderMainExercises.some((exercise) => {
        const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
        const patterns = new Set((exercise.movementPattern ?? []).map(normalizePattern));
        const tags = new Set((exercise.tags ?? []).map(normalizePattern));
        return (
          patterns.has("lateralraise") ||
          tags.has("lateraldelt") ||
          tags.has("lateral_delt") ||
          descriptor.includes("lateral raise") ||
          descriptor.includes("lateral-raise")
        );
      });
      const hasArmMain = shoulderMainExercises.some((exercise) => {
        const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
        const patterns = new Set((exercise.movementPattern ?? []).map(normalizePattern));
        const tags = new Set((exercise.tags ?? []).map(normalizePattern));
        return (
          patterns.has("curl") ||
          patterns.has("extension") ||
          tags.has("biceps") ||
          tags.has("triceps") ||
          descriptor.includes("biceps") ||
          descriptor.includes("triceps") ||
          descriptor.includes("pressdown")
        );
      });
      expect(hasPullMain).toBe(true);
      expect(hasLateralMain).toBe(true);
      expect(hasArmMain).toBe(false);
      const accessories = shouldersDay.routine
        .filter((item) => item.section === "accessory")
        .map((item) => exerciseById(item.exerciseId))
        .filter((exercise): exercise is Exercise => Boolean(exercise));
      expect(accessories.length).toBeGreaterThanOrEqual(2);
      const hasTricepsAccessory = accessories.some((exercise) => {
        const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
        const patterns = new Set((exercise.movementPattern ?? []).map(normalizePattern));
        const tags = new Set((exercise.tags ?? []).map(normalizePattern));
        return (
          patterns.has("extension") ||
          tags.has("triceps") ||
          descriptor.includes("triceps") ||
          descriptor.includes("pressdown")
        );
      });
      const hasBicepsAccessory = accessories.some((exercise) => {
        const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
        const patterns = new Set((exercise.movementPattern ?? []).map(normalizePattern));
        const tags = new Set((exercise.tags ?? []).map(normalizePattern));
        return patterns.has("curl") || tags.has("biceps") || descriptor.includes("biceps");
      });
      const hasCarryAccessory = accessories.some((exercise) => isCarryLikeExercise(exercise));
      expect(hasTricepsAccessory).toBe(true);
      expect(hasBicepsAccessory).toBe(true);
      if (hasCarryAccessory) {
        expect(accessories.length).toBeGreaterThanOrEqual(3);
      }
    }
    expectDayHasRequiredMainPatterns({
      program,
      dayTitle: "Legs + Abs",
      requiredPatterns: ["squat", "hinge"],
    });
    expectDayLacksMainPatterns({
      program,
      dayTitle: "Legs + Abs",
      forbiddenPatterns: ["push", "pull", "verticalPush"],
    });
  });

  test("3-day beginner main/accessory counts follow day templates", () => {
    const input: QuestionnaireData = {
      goals: "General fitness",
      painAreas: [],
      experience: "Beginner",
      equipment: ["bands"],
      daysPerWeek: 3,
    };
    const program = generateWeeklyProgram(input, "split-3-day-beginner-template-counts", {
      phaseIndex: 2,
      seed: "split-3-day-beginner-template-counts",
    });

    const expectedByTitle: Record<string, { mains: number; accessory: number | [number, number] }> = {
      "Back + Chest": { mains: 3, accessory: 2 },
      "Shoulders + Arms": { mains: 3, accessory: [2, 3] },
      "Legs + Abs": { mains: 3, accessory: 2 },
    };

    program.week.forEach((day) => {
      const expected = expectedByTitle[day.title];
      if (!expected) return;
      const mainItems = day.routine.filter((item) => item.section === "main");
      const accessoryItems = day.routine.filter((item) => item.section === "accessory");
      expect(mainItems.length).toBe(expected.mains);
      if (Array.isArray(expected.accessory)) {
        expect(accessoryItems.length).toBeGreaterThanOrEqual(expected.accessory[0]);
        expect(accessoryItems.length).toBeLessThanOrEqual(expected.accessory[1]);
      } else {
        expect(accessoryItems.length).toBe(expected.accessory);
      }
      expect(new Set(mainItems.map((item) => item.exerciseId)).size).toBe(mainItems.length);
    });
  });

  test("3-day Legs + Abs accessories include core + calves and cap carry usage", () => {
    const beginner = generateWeeklyProgram(
      {
        goals: "General fitness",
        painAreas: [],
        experience: "Beginner",
        equipment: ["bands", "dumbbells"],
        daysPerWeek: 3,
      },
      "split-3-day-legs-accessory-beginner",
      {
        phaseIndex: 2,
        seed: "split-3-day-legs-accessory-beginner",
      }
    );
    const advanced = generateWeeklyProgram(
      {
        goals: "General fitness",
        painAreas: [],
        experience: "Advanced",
        equipment: ["gym"],
        daysPerWeek: 3,
      },
      "split-3-day-legs-accessory-advanced",
      {
        phaseIndex: 3,
        seed: "split-3-day-legs-accessory-advanced",
      }
    );

    const assertLegsAccessoryContract = (
      program: ReturnType<typeof generateWeeklyProgram>,
      expectedAccessoryCount: number,
      expectExtraAb: boolean
    ) => {
      const legsDay = program.week.find((entry) => entry.title === "Legs + Abs");
      expect(legsDay).toBeTruthy();
      if (!legsDay) return;
      const accessories = legsDay.routine
        .filter((item) => item.section === "accessory")
        .map((item) => exerciseById(item.exerciseId))
        .filter((exercise): exercise is Exercise => Boolean(exercise));
      expect(accessories.length).toBe(expectedAccessoryCount);
      const hasCore = accessories.some((exercise) => {
        const patterns = new Set((exercise.movementPattern ?? []).map(normalizePattern));
        const tags = new Set((exercise.tags ?? []).map(normalizePattern));
        const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
        return (
          patterns.has("core") ||
          patterns.has("antirotation") ||
          tags.has("core") ||
          tags.has("anti_rotation") ||
          descriptor.includes("plank") ||
          descriptor.includes("dead bug") ||
          descriptor.includes("dead-bug") ||
          descriptor.includes("pallof") ||
          descriptor.includes("woodchop")
        );
      });
      const calvesCount = accessories.filter((exercise) => {
        const patterns = new Set((exercise.movementPattern ?? []).map(normalizePattern));
        const tags = new Set((exercise.tags ?? []).map(normalizePattern));
        const muscles = new Set((exercise.muscleGroups ?? []).map(normalizePattern));
        return patterns.has("calf") || tags.has("calves") || muscles.has("calves");
      }).length;
      const carryCount = accessories.filter((exercise) => {
        const patterns = new Set((exercise.movementPattern ?? []).map(normalizePattern));
        const tags = new Set((exercise.tags ?? []).map(normalizePattern));
        const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
        return (
          patterns.has("carry") ||
          tags.has("carry") ||
          descriptor.includes("carry") ||
          descriptor.includes("suitcase")
        );
      }).length;
      expect(hasCore).toBe(true);
      expect(calvesCount).toBeGreaterThanOrEqual(1);
      expect(carryCount).toBeLessThanOrEqual(1);
      if (expectExtraAb) {
        const coreCount = accessories.filter((exercise) => {
          const patterns = new Set((exercise.movementPattern ?? []).map(normalizePattern));
          const tags = new Set((exercise.tags ?? []).map(normalizePattern));
          const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
          return (
            patterns.has("core") ||
            patterns.has("antirotation") ||
            tags.has("core") ||
            tags.has("anti_rotation") ||
            descriptor.includes("plank") ||
            descriptor.includes("dead bug") ||
            descriptor.includes("dead-bug") ||
            descriptor.includes("pallof") ||
            descriptor.includes("woodchop")
          );
        }).length;
        expect(coreCount).toBeGreaterThanOrEqual(2);
      }
    };

    assertLegsAccessoryContract(beginner, 2, false);
    assertLegsAccessoryContract(advanced, 3, true);
  });

  test("3-day Shoulders + Arms keeps shoulders/pull emphasis and rep-based prescriptions", () => {
    const input: QuestionnaireData = {
      goals: "Reduce pain",
      painAreas: ["Shoulders", "Upper back"],
      experience: "Beginner",
      equipment: ["dumbbells", "bands", "machines"],
      daysPerWeek: 3,
    };
    const program = generateWeeklyProgram(input, "split-3-day-shoulders-safety", {
      phaseIndex: 2,
      seed: "split-3-day-shoulders-safety",
    });

    const shoulderDay = program.week.find((day) => day.title === "Shoulders + Arms");
    expect(shoulderDay).toBeTruthy();
    if (!shoulderDay) return;

    const mainItems = shoulderDay.routine.filter((item) => item.section === "main");
    expect(mainItems.length).toBeGreaterThan(0);
    expect(mainItems.some((item) => isChestDominantMain(item.exerciseId))).toBe(false);

    const hasShoulderPressMain = mainItems.some((item) => {
      const exercise = exerciseById(item.exerciseId);
      if (!exercise) return false;
      const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
      const tags = new Set((exercise.tags ?? []).map(normalizePattern));
      return descriptor.includes("press") && tags.has("shoulders");
    });
    expect(hasShoulderPressMain).toBe(true);
    const hasPullMain = mainItems.some((item) => {
      const exercise = exerciseById(item.exerciseId);
      if (!exercise) return false;
      const patterns = new Set((exercise.movementPattern ?? []).map(normalizePattern));
      return patterns.has("pull") || patterns.has("horizontalpull");
    });
    expect(hasPullMain).toBe(true);
    const hasCalvesOnShoulderDay = shoulderDay.routine.some((item) => {
      if (item.section !== "accessory") return false;
      const exercise = exerciseById(item.exerciseId);
      if (!exercise) return false;
      const patterns = new Set((exercise.movementPattern ?? []).map(normalizePattern));
      const tags = new Set((exercise.tags ?? []).map(normalizePattern));
      const muscles = new Set((exercise.muscleGroups ?? []).map(normalizePattern));
      return patterns.has("calf") || tags.has("calves") || muscles.has("calves");
    });
    expect(hasCalvesOnShoulderDay).toBe(false);

    shoulderDay.routine.forEach((item) => {
      if (item.section !== "main" && item.section !== "accessory") return;
      const exercise = exerciseById(item.exerciseId);
      const descriptor = `${exercise?.id ?? ""} ${exercise?.name ?? ""}`.toLowerCase();
      const isCarryAccessory =
        item.section === "accessory" &&
        (descriptor.includes("carry") || descriptor.includes("suitcase"));
      if (isCarryAccessory) {
        expect(item.durationSec).toBeTruthy();
      } else {
        expect(item.reps).toBeTruthy();
        expect(item.durationSec ?? null).toBeNull();
      }
    });
  });

  test("3-day Shoulders + Arms beginner/intermediate always includes a lateral-delt main", () => {
    const buildProgram = (experience: QuestionnaireData["experience"]) =>
      generateWeeklyProgram(
        {
          goals: "General fitness",
          painAreas: [],
          experience,
          equipment: ["gym"],
          daysPerWeek: 3,
        },
        `split-3-day-shoulders-lateral-${experience.toLowerCase()}`,
        {
          phaseIndex: 2,
          seed: `split-3-day-shoulders-lateral-${experience.toLowerCase()}`,
        }
      );

    const beginner = buildProgram("Beginner");
    const intermediate = buildProgram("Intermediate");

    [beginner, intermediate].forEach((program) => {
      const shoulderDay = program.week.find((day) => day.title === "Shoulders + Arms");
      expect(shoulderDay).toBeTruthy();
      if (!shoulderDay) return;
      const mainExercises = shoulderDay.routine
        .filter((item) => item.section === "main")
        .map((item) => exerciseById(item.exerciseId))
        .filter((exercise): exercise is Exercise => Boolean(exercise));
      const hasLateralMain = mainExercises.some((exercise) => {
        const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
        const patterns = new Set((exercise.movementPattern ?? []).map(normalizePattern));
        const tags = new Set((exercise.tags ?? []).map(normalizePattern));
        return (
          patterns.has("lateralraise") ||
          tags.has("lateraldelt") ||
          tags.has("lateral_delt") ||
          descriptor.includes("lateral raise") ||
          descriptor.includes("lateral-raise")
        );
      });
      expect(hasLateralMain).toBe(true);
    });
  });

  test("3-day split keeps carry usage capped with no duplicate carries on any day", () => {
    const program = generateWeeklyProgram(
      {
        goals: "General fitness",
        painAreas: [],
        experience: "Advanced",
        equipment: ["gym", "dumbbells", "bands"],
        daysPerWeek: 3,
      },
      "split-3-day-carry-governance",
      {
        phaseIndex: 3,
        seed: "split-3-day-carry-governance",
      }
    );

    program.week.forEach((day) => {
      const carryAccessories = day.routine
        .filter((item) => item.section === "accessory")
        .map((item) => exerciseById(item.exerciseId))
        .filter((exercise): exercise is Exercise => Boolean(exercise))
        .filter((exercise) => isCarryLikeExercise(exercise));
      expect(carryAccessories.length).toBeLessThanOrEqual(1);
      const carryIds = carryAccessories.map((exercise) => exercise.id);
      expect(new Set(carryIds).size).toBe(carryIds.length);
    });
  });

  test("vertical pressing progression avoids chest-dominant push and advances to dumbbells in growth", () => {
    const input: QuestionnaireData = {
      goals: "Reduce pain",
      painAreas: ["Shoulders"],
      experience: "Beginner",
      equipment: ["gym"],
      daysPerWeek: 3,
    };

    const skillProgram = generateWeeklyProgram(input, "split-3-day-vertical-progress-skill", {
      phaseIndex: 2,
      seed: "split-3-day-vertical-progress",
    });
    const growthProgram = generateWeeklyProgram(input, "split-3-day-vertical-progress-growth", {
      phaseIndex: 3,
      seed: "split-3-day-vertical-progress",
    });

    const skillShoulderDay = skillProgram.week.find((day) => day.title === "Shoulders + Arms");
    const growthShoulderDay = growthProgram.week.find((day) => day.title === "Shoulders + Arms");
    expect(skillShoulderDay).toBeTruthy();
    expect(growthShoulderDay).toBeTruthy();
    if (!skillShoulderDay || !growthShoulderDay) return;

    const skillMainIds = skillShoulderDay.routine
      .filter((item) => item.section === "main")
      .map((item) => item.exerciseId);
    const growthMainIds = growthShoulderDay.routine
      .filter((item) => item.section === "main")
      .map((item) => item.exerciseId);

    expect(
      skillMainIds.some((id) =>
        ["machine-shoulder-press", "band-overhead-press", "pike-pushup", "dumbbell-shoulder-press"].includes(id)
      )
    ).toBe(true);
    expect(
      skillMainIds.some((id) => isChestDominantMain(id)),
      `skill mains=${JSON.stringify(skillMainIds)}`
    ).toBe(false);
    expect(
      growthMainIds.some(
        (id) => id === "dumbbell-shoulder-press" || id === "dumbbell-arnold-press"
      )
    ).toBe(true);
    expect(
      growthMainIds.some((id) => isChestDominantMain(id)),
      `growth mains=${JSON.stringify(growthMainIds)}`
    ).toBe(false);
  });

  test("3-day beginner safety gates keep Back + Chest and Legs progression conservative", () => {
    const beginnerGymInput: QuestionnaireData = {
      goals: "General fitness",
      painAreas: [],
      experience: "Beginner",
      equipment: ["gym"],
      daysPerWeek: 3,
    };

    const phase1 = generateWeeklyProgram(beginnerGymInput, "split-3-day-beginner-safety-p1", {
      phaseIndex: 1,
      seed: "split-3-day-beginner-safety",
    });
    const phase3 = generateWeeklyProgram(beginnerGymInput, "split-3-day-beginner-safety-p3", {
      phaseIndex: 3,
      seed: "split-3-day-beginner-safety",
    });

    const phase1BackChest = phase1.week.find((entry) => entry.title === "Back + Chest");
    expect(phase1BackChest).toBeTruthy();
    if (phase1BackChest) {
      const phase1MainIds = phase1BackChest.routine
        .filter((item) => item.section === "main")
        .map((item) => item.exerciseId);
      expect(phase1MainIds).not.toContain("dumbbell-bench-press");
      expect(phase1MainIds).not.toContain("dumbbell-incline-press");
    }

    const phase3BackChest = phase3.week.find((entry) => entry.title === "Back + Chest");
    expect(phase3BackChest).toBeTruthy();
    if (phase3BackChest) {
      const phase3MainIds = phase3BackChest.routine
        .filter((item) => item.section === "main")
        .map((item) => item.exerciseId);
      const firstMainExercise = phase3MainIds[0] ? exerciseById(phase3MainIds[0]) : null;
      expect(firstMainExercise).toBeTruthy();
      if (firstMainExercise) {
        const descriptor = `${firstMainExercise.id} ${firstMainExercise.name}`.toLowerCase();
        expect(descriptor.includes("fly")).toBe(false);
        expect(hasMainPattern(phase3BackChest, "push")).toBe(true);
      }
    }

    const phase3Legs = phase3.week.find((entry) => entry.title === "Legs + Abs");
    expect(phase3Legs).toBeTruthy();
    if (phase3Legs) {
      const phase3LegMainIds = phase3Legs.routine
        .filter((item) => item.section === "main")
        .map((item) => item.exerciseId);
      expect(phase3LegMainIds).not.toContain("barbell-back-squat");
    }
  });

  test("3-day beginner Back + Chest phase 2 rotates chest stimulus to press when phase 1 chest lane is fly", () => {
    const input: QuestionnaireData = {
      goals: "General fitness",
      painAreas: [],
      experience: "Beginner",
      equipment: ["gym"],
      daysPerWeek: 3,
    };

    const seed = "split-3-day-back-chest-phase-family";
    const phase1 = generateWeeklyProgram(input, "split-3-day-back-chest-phase-family-p1", {
      phaseIndex: 1,
      seed,
    });
    const phase2 = generateWeeklyProgram(input, "split-3-day-back-chest-phase-family-p2", {
      phaseIndex: 2,
      seed,
      previousWeek: phase1.week,
    });

    const phase1BackChest = phase1.week.find((entry) => entry.title === "Back + Chest");
    const phase2BackChest = phase2.week.find((entry) => entry.title === "Back + Chest");
    expect(phase1BackChest).toBeTruthy();
    expect(phase2BackChest).toBeTruthy();
    if (!phase1BackChest || !phase2BackChest) return;

    const phase1ChestMain = exerciseById(
      phase1BackChest.routine.find((item) => item.section === "main")?.exerciseId ?? ""
    );
    const phase2ChestMain = exerciseById(
      phase2BackChest.routine.find((item) => item.section === "main")?.exerciseId ?? ""
    );
    expect(phase1ChestMain).toBeTruthy();
    expect(phase2ChestMain).toBeTruthy();
    if (!phase1ChestMain || !phase2ChestMain) return;

    const phase1ChestDescriptor = `${phase1ChestMain.id} ${phase1ChestMain.name}`.toLowerCase();
    const phase2ChestDescriptor = `${phase2ChestMain.id} ${phase2ChestMain.name}`.toLowerCase();
    const phase1IsFly = phase1ChestDescriptor.includes("fly") || phase1ChestDescriptor.includes("pec deck");
    if (phase1IsFly) {
      expect(phase2ChestDescriptor.includes("fly")).toBe(false);
      const phase2Patterns = new Set(
        (phase2ChestMain.movementPattern ?? []).map((pattern) => normalizePattern(pattern))
      );
      expect(phase2Patterns.has("push") || phase2Patterns.has("horizontalpush")).toBe(true);
    }
  });

  test("3-day beginner Legs + Abs phase 1 enforces squat + hinge + single-leg lanes", () => {
    const input: QuestionnaireData = {
      goals: "General fitness",
      painAreas: [],
      experience: "Beginner",
      equipment: ["gym"],
      daysPerWeek: 3,
    };

    const program = generateWeeklyProgram(input, "split-3-day-legs-phase1-lane-integrity", {
      phaseIndex: 1,
      seed: "split-3-day-legs-phase1-lane-integrity",
    });
    const legsDay = program.week.find((entry) => entry.title === "Legs + Abs");
    expect(legsDay).toBeTruthy();
    if (!legsDay) return;

    const mainExercises = legsDay.routine
      .filter((item) => item.section === "main")
      .map((item) => exerciseById(item.exerciseId))
      .filter((exercise): exercise is Exercise => Boolean(exercise));
    const isSingleLegMain = (exercise: Exercise) => {
      const patterns = new Set((exercise.movementPattern ?? []).map((pattern) => normalizePattern(pattern)));
      const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
      return (
        patterns.has("singleleg") ||
        patterns.has("single_leg") ||
        descriptor.includes("split-squat") ||
        descriptor.includes("split squat") ||
        descriptor.includes("step-up") ||
        descriptor.includes("step up") ||
        descriptor.includes("lunge")
      );
    };
    const isSquatPrimaryMain = (exercise: Exercise) => {
      const patterns = new Set((exercise.movementPattern ?? []).map((pattern) => normalizePattern(pattern)));
      return patterns.has("squat") && !isSingleLegMain(exercise);
    };
    const isHingeMain = (exercise: Exercise) => {
      const patterns = new Set((exercise.movementPattern ?? []).map((pattern) => normalizePattern(pattern)));
      return patterns.has("hinge");
    };

    const squatPrimaryCount = mainExercises.filter(isSquatPrimaryMain).length;
    const hingeCount = mainExercises.filter(isHingeMain).length;
    const singleLegCount = mainExercises.filter(isSingleLegMain).length;

    expect(squatPrimaryCount).toBeGreaterThanOrEqual(1);
    expect(hingeCount).toBeGreaterThanOrEqual(1);
    expect(singleLegCount).toBeGreaterThanOrEqual(1);
    expect(squatPrimaryCount).toBe(1);
  });

  test("4-day split enforces required main patterns per day", () => {
    const input: QuestionnaireData = {
      goals: "General fitness",
      painAreas: ["Hips"],
      experience: "Intermediate",
      equipment: ["dumbbells", "bands"],
      daysPerWeek: 4,
    };
    const program = generateWeeklyProgram(input, "split-4-day-repair", {
      phaseIndex: 2,
      seed: "split-4-day-repair",
    });

    expectDayHasRequiredMainPatterns({
      program,
      dayTitle: "Upper Push + Scapular Control",
      requiredPatterns: ["push"],
    });
    expectDayLacksMainPatterns({
      program,
      dayTitle: "Upper Push + Scapular Control",
      forbiddenPatterns: ["squat", "hinge"],
    });
    expectDayHasRequiredMainPatterns({
      program,
      dayTitle: "Lower (Squat Emphasis) + Core",
      requiredPatterns: ["squat"],
    });
    expectDayLacksMainPatterns({
      program,
      dayTitle: "Lower (Squat Emphasis) + Core",
      forbiddenPatterns: ["push", "pull", "verticalPush"],
    });
    expectDayHasRequiredMainPatterns({
      program,
      dayTitle: "Upper Pull + Thoracic Posture",
      requiredPatterns: ["pull"],
    });
    expectDayLacksMainPatterns({
      program,
      dayTitle: "Upper Pull + Thoracic Posture",
      forbiddenPatterns: ["squat", "hinge"],
    });
    expectDayHasRequiredMainPatterns({
      program,
      dayTitle: "Lower (Hinge Emphasis) + Carry/Anti-rotation",
      requiredPatterns: ["hinge"],
    });
    expectDayLacksMainPatterns({
      program,
      dayTitle: "Lower (Hinge Emphasis) + Carry/Anti-rotation",
      forbiddenPatterns: ["push", "pull", "verticalPush"],
    });
  });

  test("5-day split enforces required main patterns per day", () => {
    const input: QuestionnaireData = {
      goals: "Athletic performance",
      painAreas: [],
      experience: "Advanced",
      equipment: ["dumbbells", "bands", "bench"],
      daysPerWeek: 5,
    };
    const program = generateWeeklyProgram(input, "split-5-day-repair", {
      phaseIndex: 3,
      seed: "split-5-day-repair",
    });

    expectDayHasRequiredMainPatterns({
      program,
      dayTitle: "Upper Push",
      requiredPatterns: ["push"],
    });
    expectDayLacksMainPatterns({
      program,
      dayTitle: "Upper Push",
      forbiddenPatterns: ["squat", "hinge"],
    });
    expectDayHasRequiredMainPatterns({
      program,
      dayTitle: "Lower Squat",
      requiredPatterns: ["squat"],
    });
    expectDayLacksMainPatterns({
      program,
      dayTitle: "Lower Squat",
      forbiddenPatterns: ["push", "pull", "verticalPush"],
    });
    expectDayHasRequiredMainPatterns({
      program,
      dayTitle: "Upper Pull",
      requiredPatterns: ["pull"],
    });
    expectDayLacksMainPatterns({
      program,
      dayTitle: "Upper Pull",
      forbiddenPatterns: ["squat", "hinge"],
    });
    expectDayHasRequiredMainPatterns({
      program,
      dayTitle: "Lower Hinge + Posterior Chain",
      requiredPatterns: ["hinge"],
    });
    expectDayLacksMainPatterns({
      program,
      dayTitle: "Lower Hinge + Posterior Chain",
      forbiddenPatterns: ["push", "pull", "verticalPush"],
    });
    expectDayHasRequiredMainPatterns({
      program,
      dayTitle: "Arms + Posture + Conditioning",
      requiredPatterns: ["pull", "verticalPush"],
    });
    expectDayLacksMainPatterns({
      program,
      dayTitle: "Arms + Posture + Conditioning",
      forbiddenPatterns: ["squat", "hinge"],
    });
  });
});
