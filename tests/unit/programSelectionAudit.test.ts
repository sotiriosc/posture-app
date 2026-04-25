import { describe, expect, test } from "vitest";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import { exerciseById, type Exercise } from "@/lib/exercises";
import { generateWeeklyProgram } from "@/lib/program";

const normalizeToken = (value: string) => value.toLowerCase().replace(/[\s-]+/g, "_");

const hasAnyToken = (values: string[] | undefined, tokens: string[]) => {
  const normalized = new Set((values ?? []).map(normalizeToken));
  return tokens.some((token) => normalized.has(normalizeToken(token)));
};

const movementTokens = (exerciseId: string) =>
  exerciseById(exerciseId)?.movementPattern.map(normalizeToken) ?? [];

const isUpperMainPattern = (exerciseId: string) => {
  const patterns = new Set(movementTokens(exerciseId));
  return patterns.has("push") || patterns.has("pull") || patterns.has("verticalpush");
};

const isLowerMainPattern = (exerciseId: string) => {
  const patterns = new Set(movementTokens(exerciseId));
  return patterns.has("squat") || patterns.has("hinge");
};

const getDayExercises = (
  program: ReturnType<typeof generateWeeklyProgram>,
  dayTitle: string,
  section: "main" | "accessory"
) => {
  const day = program.week.find((entry) => entry.title === dayTitle);
  expect(day).toBeTruthy();
  if (!day) return [];
  return day.routine
    .filter((item) => item.section === section)
    .map((item) => exerciseById(item.exerciseId))
    .filter((exercise): exercise is Exercise => Boolean(exercise));
};

const hasHorizontalPullSignature = (exercise: Exercise) => {
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  const patterns = new Set(exercise.movementPattern.map(normalizeToken));
  return patterns.has("horizontal_pull") || patterns.has("horizontalpull") || descriptor.includes("row");
};

const hasVerticalPullSignature = (exercise: Exercise) => {
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  const patterns = new Set(exercise.movementPattern.map(normalizeToken));
  return (
    patterns.has("vertical_pull") ||
    patterns.has("verticalpull") ||
    descriptor.includes("pulldown") ||
    descriptor.includes("pull-down")
  );
};

const isChestMain = (exercise: Exercise) => {
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  const tags = new Set((exercise.tags ?? []).map(normalizeToken));
  return (
    tags.has("chest") ||
    descriptor.includes("bench") ||
    descriptor.includes("chest") ||
    descriptor.includes("fly") ||
    descriptor.includes("pec deck")
  );
};

const isPulloverStyle = (exercise: Exercise) =>
  `${exercise.id} ${exercise.name}`.toLowerCase().includes("pullover");

const isLatAccentStyle = (exercise: Exercise) => {
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  return (
    descriptor.includes("pullover") ||
    descriptor.includes("lat sweep") ||
    descriptor.includes("lat-sweep")
  );
};

const isBackChestSupportMainDrift = (exercise: Exercise) => {
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  return (
    isLatAccentStyle(exercise) ||
    descriptor.includes("rear-delt") ||
    descriptor.includes("rear delt") ||
    descriptor.includes("external rotation") ||
    descriptor.includes("external-rotation") ||
    descriptor.includes("swimmer") ||
    descriptor.includes("plank") ||
    descriptor.includes("prone elbow row") ||
    descriptor.includes("prone-elbow-row") ||
    descriptor.includes("back widow") ||
    descriptor.includes("supine lat pulldown isometric") ||
    descriptor.includes("supine-lat-pulldown-isometric")
  );
};

const isShoulderSupportDrill = (exercise: Exercise) => {
  const descriptor = `${exercise.id} ${exercise.name} ${exercise.familyKey ?? ""} ${
    exercise.variantKey ?? ""
  }`.toLowerCase();
  return (
    descriptor.includes("y raise") ||
    descriptor.includes("y-raise") ||
    descriptor.includes("swimmer") ||
    descriptor.includes("external rotation") ||
    descriptor.includes("external-rotation") ||
    descriptor.includes("face pull") ||
    descriptor.includes("face-pull") ||
    descriptor.includes("snow angel") ||
    descriptor.includes("snow-angel") ||
    descriptor.includes("pull-apart") ||
    descriptor.includes("pull apart")
  );
};

const isPainAwareShoulderMainDrift = (exercise: Exercise) => {
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  return (
    isShoulderSupportDrill(exercise) ||
    descriptor.includes("pike push") ||
    descriptor.includes("pike-push") ||
    descriptor.includes("y raise") ||
    descriptor.includes("y-raise") ||
    descriptor.includes("t raise") ||
    descriptor.includes("t-raise")
  );
};

const isLowerRegressionOrDrillMain = (exercise: Exercise) => {
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  const blockedIds = new Set([
    "bodyweight-squat",
    "bodyweight-good-morning",
    "single-leg-hip-thrust",
    "single-leg-rdl",
    "single-leg-glute-bridge-hold",
    "back-extension",
    "back-extension-hold",
    "dead-bug",
    "bird-dog",
    "plank",
    "side-plank",
    "hollow-body-hold",
  ]);
  return (
    blockedIds.has(exercise.id) ||
    descriptor.includes("glute bridge hold") ||
    descriptor.includes("good morning") ||
    descriptor.includes("dead bug") ||
    descriptor.includes("bird dog") ||
    descriptor.includes("plank")
  );
};

const hasBicepsSignal = (exercise: Exercise) => {
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  return hasAnyToken(exercise.tags, ["biceps"]) || descriptor.includes("curl");
};

const hasTricepsSignal = (exercise: Exercise) => {
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  return hasAnyToken(exercise.tags, ["triceps"]) || descriptor.includes("triceps");
};

const weekSignature = (program: ReturnType<typeof generateWeeklyProgram>) =>
  program.week
    .map((day) =>
      day.routine
        .map((item) =>
          [
            item.section,
            item.exerciseId,
            item.selectionDebug?.source ?? "none",
            item.selectionDebug?.slotLane ?? "none",
          ].join(":")
        )
        .join(",")
    )
    .join("|");

const questionnaire: QuestionnaireData = {
  goals: "General fitness",
  painAreas: [],
  experience: "Intermediate",
  equipment: ["gym"],
  daysPerWeek: 3,
};

describe("program selection audit metadata", () => {
  test("attaches main and accessory selection debug metadata to generated week items", () => {
    const program = generateWeeklyProgram(questionnaire, "selection-audit", {
      phaseIndex: 2,
      weekIndex: 1,
      cycleIndex: 1,
      totalWeekIndex: 1,
      seed: "selection-audit-seed",
    });

    const auditedItems = program.week.flatMap((day) =>
      day.routine.filter((item) => item.section === "main" || item.section === "accessory")
    );

    expect(auditedItems.length).toBeGreaterThan(0);
    expect(auditedItems.every((item) => item.selectionDebug?.source)).toBe(true);
  });

  test("keeps obvious main fallback drift out of upper and lower day structures", () => {
    const program = generateWeeklyProgram(questionnaire, "selection-family-fallback", {
      phaseIndex: 2,
      weekIndex: 1,
      cycleIndex: 1,
      totalWeekIndex: 1,
      seed: "selection-family-fallback-seed",
    });

    const upperDays = program.week.filter((day) => !/legs|abs|lower/i.test(day.title));
    const lowerDays = program.week.filter((day) => /legs|abs|lower/i.test(day.title));

    upperDays.forEach((day) => {
      const mainIds = day.routine
        .filter((item) => item.section === "main")
        .map((item) => item.exerciseId);
      expect(mainIds.every((exerciseId) => !isLowerMainPattern(exerciseId))).toBe(true);
    });

    lowerDays.forEach((day) => {
      const mainIds = day.routine
        .filter((item) => item.section === "main")
        .map((item) => item.exerciseId);
      expect(mainIds.every((exerciseId) => !isUpperMainPattern(exerciseId))).toBe(true);
    });
  });

  test("uses arm-specific accessory pools on the Shoulders + Arms day", () => {
    const program = generateWeeklyProgram(questionnaire, "selection-accessory-pools", {
      phaseIndex: 2,
      weekIndex: 1,
      cycleIndex: 1,
      totalWeekIndex: 1,
      seed: "selection-accessory-pools-seed",
    });

    const shouldersDay = program.week.find((day) => day.title === "Shoulders + Arms");
    expect(shouldersDay).toBeTruthy();
    if (!shouldersDay) return;

    const armAccessories = shouldersDay.routine.filter(
      (item) =>
        item.section === "accessory" &&
        (item.selectionDebug?.slotLane === "push" ||
          item.selectionDebug?.slotLane === "pull")
    );

    expect(armAccessories.length).toBeGreaterThan(0);
    armAccessories.forEach((item) => {
      const exercise = exerciseById(item.exerciseId);
      expect(exercise).toBeTruthy();
      if (!exercise) return;
      if (item.selectionDebug?.slotLane === "push") {
        expect(hasAnyToken(exercise.tags, ["triceps"])).toBe(true);
      }
      if (item.selectionDebug?.slotLane === "pull") {
        expect(hasAnyToken(exercise.tags, ["biceps"])).toBe(true);
      }
    });
  });

  test("beginner gym Back + Chest keeps at least two true pull mains", () => {
    const program = generateWeeklyProgram(
      { ...questionnaire, experience: "Beginner" },
      "selection-beginner-back-chest-balance",
      {
        phaseIndex: 2,
        weekIndex: 1,
        cycleIndex: 1,
        totalWeekIndex: 1,
        seed: "selection-beginner-back-chest-balance-seed",
      }
    );
    const mains = getDayExercises(program, "Back + Chest", "main");
    const truePullMainCount = mains.filter(
      (exercise) => hasHorizontalPullSignature(exercise) || hasVerticalPullSignature(exercise)
    ).length;

    expect(mains.length).toBe(3);
    expect(truePullMainCount).toBeGreaterThanOrEqual(2);
    expect(mains.filter(isChestMain).length).toBeLessThanOrEqual(1);
    expect(mains.some(isPulloverStyle)).toBe(false);
  });

  test("intermediate and advanced gym Shoulders + Arms keep support drills out of mains", () => {
    (["Intermediate", "Advanced"] as const).forEach((experience) => {
      const program = generateWeeklyProgram(
        { ...questionnaire, experience },
        `selection-shoulders-support-main-${experience.toLowerCase()}`,
        {
          phaseIndex: experience === "Advanced" ? 3 : 2,
          weekIndex: 1,
          cycleIndex: 1,
          totalWeekIndex: 1,
          seed: `selection-shoulders-support-main-${experience.toLowerCase()}-seed`,
        }
      );
      const mains = getDayExercises(program, "Shoulders + Arms", "main");

      expect(mains.length).toBe(4);
      expect(mains.some(isShoulderSupportDrill)).toBe(false);
    });
  });

  test("intermediate and advanced gym Legs + Abs keep regression drills out of mains", () => {
    (["Intermediate", "Advanced"] as const).forEach((experience) => {
      const program = generateWeeklyProgram(
        { ...questionnaire, experience },
        `selection-legs-regression-main-${experience.toLowerCase()}`,
        {
          phaseIndex: experience === "Advanced" ? 3 : 2,
          weekIndex: 1,
          cycleIndex: 1,
          totalWeekIndex: 1,
          seed: `selection-legs-regression-main-${experience.toLowerCase()}-seed`,
        }
      );
      const mains = getDayExercises(program, "Legs + Abs", "main");

      expect(mains.length).toBe(4);
      expect(mains.some(isLowerRegressionOrDrillMain)).toBe(false);
    });
  });

  test("advanced gym Shoulders + Arms caps accessories while preserving biceps and triceps", () => {
    const program = generateWeeklyProgram(
      { ...questionnaire, experience: "Advanced" },
      "selection-advanced-shoulders-accessory-cap",
      {
        phaseIndex: 3,
        weekIndex: 1,
        cycleIndex: 1,
        totalWeekIndex: 1,
        seed: "selection-advanced-shoulders-accessory-cap-seed",
      }
    );
    const accessories = getDayExercises(program, "Shoulders + Arms", "accessory");

    expect(accessories.length).toBeLessThanOrEqual(4);
    expect(accessories.some(hasBicepsSignal)).toBe(true);
    expect(accessories.some(hasTricepsSignal)).toBe(true);
  });

  test("gym Back + Chest keeps pullover-style bridge movements out of main slots", () => {
    (["Beginner", "Intermediate", "Advanced"] as const).forEach((experience) => {
      const program = generateWeeklyProgram(
        { ...questionnaire, experience },
        `selection-back-chest-no-pullover-main-${experience.toLowerCase()}`,
        {
          phaseIndex: experience === "Advanced" ? 3 : 2,
          weekIndex: 1,
          cycleIndex: 1,
          totalWeekIndex: 1,
          seed: `selection-back-chest-no-pullover-main-${experience.toLowerCase()}-seed`,
        }
      );
      const mains = getDayExercises(program, "Back + Chest", "main");

      expect(mains.some(isPulloverStyle)).toBe(false);
      expect(mains.some((exercise) => hasHorizontalPullSignature(exercise))).toBe(true);
      expect(mains.some((exercise) => hasVerticalPullSignature(exercise))).toBe(true);
    });
  });

  test("non-gym General Fitness avoids worst support and regression mains when constrained alternatives exist", () => {
    const scenarios: Array<{
      equipment: QuestionnaireData["equipment"];
      maxShoulderSupportMains: number;
      maxLowerRegressionMains: number;
    }> = [
      { equipment: ["bands"], maxShoulderSupportMains: 1, maxLowerRegressionMains: 0 },
      { equipment: ["dumbbells"], maxShoulderSupportMains: 2, maxLowerRegressionMains: 0 },
      { equipment: ["dumbbells", "bands"], maxShoulderSupportMains: 0, maxLowerRegressionMains: 0 },
      { equipment: ["none"], maxShoulderSupportMains: 3, maxLowerRegressionMains: 1 },
    ];

    scenarios.forEach(({ equipment, maxShoulderSupportMains, maxLowerRegressionMains }) => {
      const program = generateWeeklyProgram(
        { ...questionnaire, equipment },
        `selection-non-gym-legality-${equipment.join("-")}`,
        {
          phaseIndex: 2,
          weekIndex: 1,
          cycleIndex: 1,
          totalWeekIndex: 1,
          seed: `selection-non-gym-legality-${equipment.join("-")}-seed`,
        }
      );

      const shoulderMains = getDayExercises(program, "Shoulders + Arms", "main");
      const legMains = getDayExercises(program, "Legs + Abs", "main");
      const backChestMains = getDayExercises(program, "Back + Chest", "main");

      expect(shoulderMains.filter(isShoulderSupportDrill).length).toBeLessThanOrEqual(
        maxShoulderSupportMains
      );
      expect(legMains.filter(isLowerRegressionOrDrillMain).length).toBeLessThanOrEqual(
        maxLowerRegressionMains
      );
      expect(backChestMains.some((exercise) => exercise.id === "plank")).toBe(false);
      expect(backChestMains.some(isLatAccentStyle)).toBe(false);
    });
  });

  test("pain-aware gym profiles preserve main identity before using corrective substitutions", () => {
    const lowerBackProgram = generateWeeklyProgram(
      { ...questionnaire, painAreas: ["Lower back"] },
      "selection-pain-aware-lower-back",
      {
        phaseIndex: 2,
        weekIndex: 1,
        cycleIndex: 1,
        totalWeekIndex: 1,
        seed: "selection-pain-aware-lower-back-seed",
      }
    );
    const lowerBackLegMains = getDayExercises(lowerBackProgram, "Legs + Abs", "main");

    expect(lowerBackLegMains.some(isLowerRegressionOrDrillMain)).toBe(false);

    const shoulderNeckProgram = generateWeeklyProgram(
      { ...questionnaire, painAreas: ["Shoulders", "Neck"] },
      "selection-pain-aware-shoulder-neck",
      {
        phaseIndex: 2,
        weekIndex: 1,
        cycleIndex: 1,
        totalWeekIndex: 1,
        seed: "selection-pain-aware-shoulder-neck-seed",
      }
    );
    const shoulderMains = getDayExercises(shoulderNeckProgram, "Shoulders + Arms", "main");
    const backChestMains = getDayExercises(shoulderNeckProgram, "Back + Chest", "main");

    expect(shoulderMains.some(isPainAwareShoulderMainDrift)).toBe(false);
    expect(backChestMains.some(isBackChestSupportMainDrift)).toBe(false);
  });

  test("preserves deterministic same-seed output with selection debug metadata", () => {
    const run = () =>
      generateWeeklyProgram(questionnaire, "selection-deterministic", {
        phaseIndex: 2,
        weekIndex: 1,
        cycleIndex: 1,
        totalWeekIndex: 1,
        seed: "selection-deterministic-seed",
      });

    expect(weekSignature(run())).toBe(weekSignature(run()));
  });
});
