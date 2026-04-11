import { beforeEach, describe, expect, test } from "vitest";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import { buildEngineSignals, generateProgram } from "@/lib/engine";
import { exerciseById, type Exercise } from "@/lib/exercises";
import { isExerciseEligible, normalizeEquipmentSelection } from "@/lib/equipment";
import { clearProgramVariationHistory, generateWeeklyProgram } from "@/lib/program";
import type { Program } from "@/lib/types";

const baseQuestionnaire = (
  overrides: Partial<QuestionnaireData> = {}
): QuestionnaireData => ({
  goals: "General fitness",
  painAreas: [],
  experience: "Intermediate",
  equipment: ["gym"],
  daysPerWeek: 5,
  ...overrides,
});

const generateAnchorProgram = (
  questionnaire: QuestionnaireData,
  id: string
): Program =>
  generateWeeklyProgram(questionnaire, id, {
    phaseIndex: 2,
    seed: id,
    variation: {
      seed: `${id}-slot`,
      settingsHash: `${id}-settings`,
      variationIndex: 1,
      useRecentMemory: false,
      initialLiveVariation: true,
    },
  });

const mainExercises = (program: Program, title: string) => {
  const day = program.week.find((item) => item.title === title);
  expect(day, `Missing generated day "${title}"`).toBeTruthy();
  return (day?.routine ?? [])
    .filter((item) => item.section === "main")
    .map((item) => exerciseById(item.exerciseId))
    .filter((exercise): exercise is Exercise => Boolean(exercise));
};

const accessoryExercises = (program: Program, title: string) => {
  const day = program.week.find((item) => item.title === title);
  expect(day, `Missing generated day "${title}"`).toBeTruthy();
  return (day?.routine ?? [])
    .filter((item) => item.section === "accessory")
    .map((item) => exerciseById(item.exerciseId))
    .filter((exercise): exercise is Exercise => Boolean(exercise));
};

const hasPattern = (exercise: Exercise, pattern: string) =>
  exercise.movementPattern.some((entry) => entry.toLowerCase() === pattern.toLowerCase());

const hasUpperPattern = (exercise: Exercise) =>
  ["push", "pull", "verticalpush", "horizontalpush", "horizontalpull", "verticalpull"].some(
    (pattern) => hasPattern(exercise, pattern)
  );

const hasLowerPattern = (exercise: Exercise) =>
  ["squat", "hinge"].some((pattern) => hasPattern(exercise, pattern));

const isArmIsolation = (exercise: Exercise) => {
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  return (
    descriptor.includes("biceps") ||
    descriptor.includes("curl") ||
    descriptor.includes("triceps extension") ||
    descriptor.includes("triceps-extension") ||
    descriptor.includes("pressdown") ||
    descriptor.includes("kickback")
  );
};

const isSupportDrill = (exercise: Exercise) => {
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  return [
    "face pull",
    "external rotation",
    "pull-apart",
    "snow angel",
    "swimmer",
    "y raise",
    "t raise",
    "lat sweep",
    "isometric",
    "hold",
    "dead bug",
    "plank",
    "bird dog",
  ].some((token) => descriptor.includes(token));
};

const isPostureSupportPull = (exercise: Exercise) => {
  const text = descriptor(exercise);
  const tags = new Set((exercise.tags ?? []).map((tag) => tag.toLowerCase()));
  return (
    hasPattern(exercise, "pull") &&
    (tags.has("scap") ||
      tags.has("scapular") ||
      tags.has("posture") ||
      text.includes("chest-supported") ||
      text.includes("chest supported") ||
      text.includes("seated row") ||
      text.includes("rear delt"))
  );
};

const isLowOutputPullMain = (exercise: Exercise) => {
  const text = descriptor(exercise);
  return [
    "rear delt fly",
    "rear-delt-fly",
    "row iso hold",
    "row-iso-hold",
    "prone elbow row",
    "prone-elbow-row",
    "supine elbow drive row",
    "supine-elbow-drive-row",
    "back widow",
    "back-widow",
    "lat sweep",
    "lat-sweep",
    "isometric",
    "iso-hold",
  ].some((token) => text.includes(token));
};

const isKnownLowerMainDrift = (exercise: Exercise) =>
  [
    "bodyweight-good-morning",
    "back-extension",
    "back-extension-hold",
    "single-leg-glute-bridge-hold",
  ].includes(exercise.id);

const isCarryMain = (exercise: Exercise) =>
  exercise.movementPattern.some((pattern) => pattern.toLowerCase() === "carry") ||
  /carry|suitcase/i.test(`${exercise.id} ${exercise.name}`);

const isCoreOnlyMain = (exercise: Exercise) => {
  const patterns = new Set(exercise.movementPattern.map((pattern) => pattern.toLowerCase()));
  return (
    patterns.has("core") &&
    !["push", "pull", "verticalpush", "squat", "hinge"].some((pattern) =>
      patterns.has(pattern)
    )
  );
};

const descriptor = (exercise: Exercise) => `${exercise.id} ${exercise.name}`.toLowerCase();

const isChestFly = (exercise: Exercise) => descriptor(exercise).includes("fly");

const isLateralRaise = (exercise: Exercise) => descriptor(exercise).includes("lateral raise");

const isForbiddenMainSlotDrill = (exercise: Exercise) => {
  const text = descriptor(exercise);
  return (
    isCarryMain(exercise) ||
    isCoreOnlyMain(exercise) ||
    ["march", "plank", "dead bug", "bird dog"].some((token) => text.includes(token)) ||
    (text.includes("hold") && exercise.id !== "back-extension-hold")
  );
};

const hasHorizontalPressAnchor = (exercise: Exercise) =>
  hasPattern(exercise, "push") &&
  !hasPattern(exercise, "verticalpush") &&
  !isChestFly(exercise) &&
  !isLateralRaise(exercise) &&
  !isForbiddenMainSlotDrill(exercise);

const hasVerticalPressAnchor = (exercise: Exercise) =>
  hasPattern(exercise, "verticalpush") &&
  !isChestFly(exercise) &&
  !isLateralRaise(exercise) &&
  !isForbiddenMainSlotDrill(exercise);

const hasHorizontalPullAnchor = (exercise: Exercise) =>
  hasPattern(exercise, "pull") && /row/i.test(exercise.name);

const hasVerticalPullAnchor = (exercise: Exercise) =>
  hasPattern(exercise, "pull") &&
  /pulldown|pull-up|pullup|chin-up|chinup|lat/i.test(`${exercise.id} ${exercise.name}`);

const hasTrueHingeAnchor = (exercise: Exercise) =>
  hasPattern(exercise, "hinge") &&
  !/hamstring curl/i.test(exercise.name) &&
  !["bodyweight-good-morning", "back-extension", "back-extension-hold"].includes(exercise.id) &&
  !isForbiddenMainSlotDrill(exercise);

const countPattern = (exercises: Exercise[], pattern: string) =>
  exercises.filter((exercise) => hasPattern(exercise, pattern)).length;

const mainLayoutSignature = (program: Program) =>
  program.week
    .map((day) =>
      day.routine
        .filter((item) => item.section === "main")
        .map((item) => item.exerciseId)
        .join(",")
    )
    .join("|");

const comparableWeek = (program: Program) =>
  program.week.map((day) => ({
    title: day.title,
    routine: day.routine.map((item) => ({
      exerciseId: item.exerciseId,
      section: item.section,
      sets: item.sets,
      reps: item.reps,
      loadType: item.loadType,
    })),
  }));

const buildSignals = (questionnaire: QuestionnaireData) =>
  buildEngineSignals({
    questionnaire,
    history: {
      sessions: [],
      exerciseLogs: [],
      programProgress: null,
    },
    prefs: null,
    nowIso: "2026-04-11T12:00:00.000Z",
  });

describe("higher-frequency split contracts", () => {
  beforeEach(() => {
    clearProgramVariationHistory();
  });

  test("4-day gym split preserves two upper and two lower day identities", () => {
    const program = generateAnchorProgram(
      baseQuestionnaire({
        experience: "Beginner",
        daysPerWeek: 4,
      }),
      "hf-4day-beginner-gym"
    );

    expect(program.week.map((day) => day.title)).toEqual([
      "Upper Push + Scapular Control",
      "Lower (Squat Emphasis) + Core",
      "Upper Pull + Thoracic Posture",
      "Lower (Hinge Emphasis) + Carry/Anti-rotation",
    ]);

    program.week.forEach((day) => {
      const mains = day.routine
        .filter((item) => item.section === "main")
        .map((item) => exerciseById(item.exerciseId))
        .filter((exercise): exercise is Exercise => Boolean(exercise));
      expect(mains.length).toBeGreaterThanOrEqual(2);
      if (day.title.startsWith("Upper")) {
        expect(mains.some(hasUpperPattern)).toBe(true);
        expect(mains.some(hasLowerPattern)).toBe(false);
      } else {
        expect(mains.some(hasLowerPattern)).toBe(true);
        expect(mains.some(hasUpperPattern)).toBe(false);
      }
      expect(day.warmup?.items.length ?? 0).toBeLessThanOrEqual(
        3
      );
      expect(day.activation?.items.length ?? 0).toBeLessThanOrEqual(2);
      expect(day.cooldown?.items.length ?? 0).toBe(1);
    });

    const hingeMains = mainExercises(program, "Lower (Hinge Emphasis) + Carry/Anti-rotation");
    expect(hingeMains[0] ? hasPattern(hingeMains[0], "hinge") : false).toBe(true);
    expect(hingeMains.some((exercise) => hasPattern(exercise, "hinge"))).toBe(true);
    expect(hingeMains.some(isCarryMain)).toBe(false);
    expect(countPattern(hingeMains, "squat")).toBeLessThanOrEqual(
      Math.max(1, countPattern(hingeMains, "hinge"))
    );
  });

  test("5-day gym split keeps arms/posture as an upper exposure, not an isolation main day", () => {
    const program = generateAnchorProgram(
      baseQuestionnaire({
        equipment: ["gym"],
        daysPerWeek: 5,
      }),
      "hf-5day-intermediate-gym"
    );

    const lowerSquat = mainExercises(program, "Lower Squat");
    const lowerHinge = mainExercises(program, "Lower Hinge + Posterior Chain");
    expect(lowerSquat.some((exercise) => hasPattern(exercise, "squat"))).toBe(true);
    expect(lowerSquat.some((exercise) => hasPattern(exercise, "hinge"))).toBe(true);
    expect(lowerSquat.some((exercise) => exercise.id === "bodyweight-good-morning")).toBe(false);
    expect(countPattern(lowerSquat, "squat")).toBeGreaterThanOrEqual(
      countPattern(lowerSquat, "hinge")
    );
    expect(lowerHinge[0] ? hasPattern(lowerHinge[0], "hinge") : false).toBe(true);
    expect(lowerHinge.some((exercise) => hasPattern(exercise, "hinge"))).toBe(true);
    expect(countPattern(lowerHinge, "hinge")).toBeGreaterThanOrEqual(
      countPattern(lowerHinge, "squat")
    );
    expect(lowerHinge.some(isKnownLowerMainDrift)).toBe(false);
    expect(lowerHinge.some(isCarryMain)).toBe(false);

    const weeklyMains = program.week.flatMap((day) =>
      day.routine
        .filter((item) => item.section === "main")
        .map((item) => exerciseById(item.exerciseId))
        .filter((exercise): exercise is Exercise => Boolean(exercise))
    );
    expect(weeklyMains.some((exercise) => hasPattern(exercise, "squat"))).toBe(true);
    expect(weeklyMains.some(hasTrueHingeAnchor)).toBe(true);
    expect(weeklyMains.some(hasHorizontalPullAnchor)).toBe(true);
    expect(weeklyMains.some(hasVerticalPullAnchor)).toBe(true);
    expect(weeklyMains.some(hasHorizontalPressAnchor)).toBe(true);
    expect(weeklyMains.some(hasVerticalPressAnchor)).toBe(true);

    const armsMains = mainExercises(program, "Arms + Posture + Conditioning");
    expect(armsMains.some((exercise) => hasPattern(exercise, "pull"))).toBe(true);
    expect(armsMains.some((exercise) => hasPattern(exercise, "verticalpush"))).toBe(true);
    expect(armsMains.some(hasHorizontalPressAnchor)).toBe(false);
    expect(armsMains.some(hasHorizontalPullAnchor)).toBe(true);
    expect(armsMains.some(isPostureSupportPull)).toBe(true);
    expect(armsMains.some(isLowOutputPullMain)).toBe(false);
    expect(armsMains.some(isArmIsolation)).toBe(false);
    expect(armsMains.some(isSupportDrill)).toBe(false);
    expect(armsMains.some(isCarryMain)).toBe(false);
    expect(armsMains.some(isCoreOnlyMain)).toBe(false);

    const armsAccessories = accessoryExercises(program, "Arms + Posture + Conditioning");
    expect(armsAccessories.some((exercise) => /triceps|extension/i.test(exercise.name))).toBe(true);
    expect(armsAccessories.some((exercise) => /biceps|curl/i.test(exercise.name))).toBe(true);
    expect([...armsMains, ...armsAccessories].some(isPostureSupportPull)).toBe(true);
  });

  test("5-day pain-aware gym split protects lower mains from hold/drill fallback", () => {
    const program = generateAnchorProgram(
      baseQuestionnaire({
        painAreas: ["Lower back", "Shoulders/neck"],
        equipment: ["gym"],
        daysPerWeek: 5,
      }),
      "hf-5day-pain-gym"
    );

    const lowerMains = [
      ...mainExercises(program, "Lower Squat"),
      ...mainExercises(program, "Lower Hinge + Posterior Chain"),
    ];
    expect(lowerMains.some(isKnownLowerMainDrift)).toBe(false);
    expect(lowerMains.some((exercise) => hasPattern(exercise, "squat"))).toBe(true);
    expect(lowerMains.some((exercise) => hasPattern(exercise, "hinge"))).toBe(true);
  });

  test("5-day gym split keeps strict main-slot anchors after repairs", () => {
    const program = generateAnchorProgram(
      baseQuestionnaire({
        equipment: ["gym"],
        daysPerWeek: 5,
      }),
      "hf-5day-slot-fitness-gym"
    );

    program.week.forEach((day) => {
      day.routine
        .filter((item) => item.section === "main")
        .forEach((item) => {
          const exercise = exerciseById(item.exerciseId);
          expect(exercise, item.exerciseId).toBeTruthy();
          if (!exercise) return;
          expect(isForbiddenMainSlotDrill(exercise)).toBe(false);

          const slotKind = item.selectionDebug?.slotKind;
          const slotLane = item.selectionDebug?.slotLane;
          if (slotKind === "mainPush" || slotKind === "mainPushCompound") {
            expect(hasHorizontalPressAnchor(exercise)).toBe(true);
          }
          if (slotKind === "mainVerticalPush" || slotLane === "verticalPush") {
            expect(hasVerticalPressAnchor(exercise)).toBe(true);
          }
          if (slotKind === "mainHinge" || slotLane === "hinge") {
            expect(hasTrueHingeAnchor(exercise)).toBe(true);
          }
        });
    });
  });

  test("5-day gym pull slots keep low-output posture variants out of primary mains when stronger pulls exist", () => {
    const program = generateAnchorProgram(
      baseQuestionnaire({
        equipment: ["gym"],
        daysPerWeek: 5,
      }),
      "hf-5day-pull-anchor-quality-gym"
    );

    const pullMainExercises = program.week.flatMap((day) =>
      day.routine
        .filter(
          (item) =>
            item.section === "main" &&
            (item.selectionDebug?.slotLane === "pull" ||
              item.selectionDebug?.slotKind?.startsWith("mainPull"))
        )
        .map((item) => exerciseById(item.exerciseId))
        .filter((exercise): exercise is Exercise => Boolean(exercise))
    );

    expect(pullMainExercises.length).toBeGreaterThan(0);
    expect(pullMainExercises.some(hasHorizontalPullAnchor)).toBe(true);
    expect(pullMainExercises.some(hasVerticalPullAnchor)).toBe(true);
    expect(pullMainExercises.some(isLowOutputPullMain)).toBe(false);
  });

  test("gym and dumbbell hinge days prefer true hinge anchors over back extension fallbacks", () => {
    const programs = [
      generateAnchorProgram(
        baseQuestionnaire({
          equipment: ["gym"],
          experience: "Advanced",
          daysPerWeek: 5,
        }),
        "hf-5day-hinge-priority-gym"
      ),
      generateAnchorProgram(
        baseQuestionnaire({
          equipment: ["dumbbells", "bench"],
          experience: "Advanced",
          daysPerWeek: 5,
        }),
        "hf-5day-hinge-priority-db"
      ),
    ];

    programs.forEach((program) => {
      const lowerHinge = mainExercises(program, "Lower Hinge + Posterior Chain");
      expect(lowerHinge.some(hasTrueHingeAnchor)).toBe(true);
      expect(
        lowerHinge.some((exercise) =>
          ["back-extension", "back-extension-hold", "bodyweight-good-morning"].includes(
            exercise.id
          )
        )
      ).toBe(false);
    });
  });

  test("5-day no-equipment split keeps constrained lower days anchored instead of filler-only", () => {
    const program = generateAnchorProgram(
      baseQuestionnaire({
        equipment: ["none"],
        experience: "Advanced",
        daysPerWeek: 5,
      }),
      "hf-5day-advanced-none"
    );

    const lowerSquat = mainExercises(program, "Lower Squat");
    const lowerHinge = mainExercises(program, "Lower Hinge + Posterior Chain");
    expect(lowerSquat.some((exercise) => exercise.id === "bodyweight-good-morning")).toBe(false);
    expect(lowerSquat.some(isCarryMain)).toBe(false);
    expect(countPattern(lowerSquat, "squat")).toBeGreaterThanOrEqual(2);
    expect(lowerHinge[0] ? hasPattern(lowerHinge[0], "hinge") : false).toBe(true);
    expect(countPattern(lowerHinge, "hinge")).toBeGreaterThanOrEqual(2);
    expect(lowerHinge.some(isCarryMain)).toBe(false);
    expect(
      lowerHinge.some((exercise) =>
        ["back-extension-hold", "single-leg-glute-bridge-hold"].includes(
          exercise.id
        )
      )
    ).toBe(false);

    const armsMains = mainExercises(program, "Arms + Posture + Conditioning");
    expect(armsMains.some((exercise) => hasPattern(exercise, "pull"))).toBe(true);
    expect(armsMains.some((exercise) => hasPattern(exercise, "verticalpush"))).toBe(true);
    expect(armsMains.some(isArmIsolation)).toBe(false);
    expect(armsMains.some(isCarryMain)).toBe(false);
    expect(armsMains.some(isCoreOnlyMain)).toBe(false);
  });

  test("5-day repairs keep every final exercise inside the questionnaire equipment universe", () => {
    const questionnaire = baseQuestionnaire({
      equipment: ["dumbbells"],
      painAreas: ["Lower back"],
      daysPerWeek: 5,
    });
    const available = normalizeEquipmentSelection(questionnaire.equipment).available;
    const program = generateAnchorProgram(questionnaire, "hf-5day-equipment-legality-db");

    program.week.forEach((day) => {
      day.routine.forEach((item) => {
        const exercise = exerciseById(item.exerciseId);
        expect(exercise, item.exerciseId).toBeTruthy();
        if (!exercise) return;
        expect(isExerciseEligible(exercise, available), `${day.title}: ${exercise.id}`).toBe(true);
      });
    });
  });

  test("5-day quality-first beginner budget stays lean across main, accessory, and prep blocks", () => {
    const program = generateAnchorProgram(
      baseQuestionnaire({
        goals: "Improve posture",
        painAreas: ["Shoulders", "Lower back"],
        experience: "Beginner",
        equipment: ["gym"],
        daysPerWeek: 5,
      }),
      "hf-5day-beginner-quality-budget"
    );

    program.week.forEach((day) => {
      expect(day.routine.filter((item) => item.section === "main")).toHaveLength(2);
      expect(day.routine.filter((item) => item.section === "accessory").length).toBeLessThanOrEqual(2);
      expect(day.warmup?.items.length ?? 0).toBeLessThanOrEqual(3);
      expect(day.activation?.items.length ?? 0).toBeLessThanOrEqual(2);
      expect(day.cooldown?.items.length ?? 0).toBe(1);
    });
  });

  test("Strength Focus mains use lower-rep strength prescriptions while accessories stay moderate", () => {
    const program = generateWeeklyProgram(
      baseQuestionnaire({
        goals: "Athletic performance",
        equipment: ["gym"],
        experience: "Beginner",
        daysPerWeek: 5,
      }),
      "hf-5day-strength-reps",
      {
        phaseIndex: 3,
        seed: "hf-5day-strength-reps",
      }
    );

    const mains = program.week.flatMap((day) =>
      day.routine.filter((item) => item.section === "main")
    );
    expect(mains.length).toBeGreaterThan(0);
    mains.forEach((item) => {
      expect(item.reps).toBe("4-8");
    });

    const accessories = program.week.flatMap((day) =>
      day.routine.filter((item) => item.section === "accessory")
    );
    expect(accessories.some((item) => item.reps !== "4-8")).toBe(true);
  });

  test("Hypertrophy & Capacity standard advanced gym mains stay in a hypertrophy rep range", () => {
    const program = generateWeeklyProgram(
      baseQuestionnaire({
        goals: "General fitness",
        equipment: ["gym"],
        experience: "Advanced",
        daysPerWeek: 5,
      }),
      "hf-5day-hypertrophy-reps",
      {
        phaseIndex: 2,
        seed: "hf-5day-hypertrophy-reps",
      }
    );

    const mains = program.week.flatMap((day) =>
      day.routine.filter((item) => item.section === "main")
    );
    expect(mains.length).toBeGreaterThan(0);
    mains.forEach((item) => {
      expect(item.reps).toBe("8-12");
    });
  });

  test("Strength Focus keeps 4-8 main reps across constrained pain-sensitive profiles", () => {
    const program = generateWeeklyProgram(
      baseQuestionnaire({
        goals: "Reduce pain",
        painAreas: ["Lower back", "Shoulders"],
        equipment: ["bands"],
        experience: "Beginner",
        daysPerWeek: 5,
      }),
      "hf-5day-strength-constrained-reps",
      {
        phaseIndex: 3,
        seed: "hf-5day-strength-constrained-reps",
      }
    );

    const mains = program.week.flatMap((day) =>
      day.routine.filter((item) => item.section === "main")
    );
    expect(mains.length).toBeGreaterThan(0);
    mains.forEach((item) => {
      expect(item.reps).toBe("4-8");
    });
  });

  test("4/5-day live initial variation changes main layout while same slot stays stable", () => {
    const questionnaire = baseQuestionnaire({
      equipment: ["gym"],
      daysPerWeek: 5,
    });
    const signals = buildSignals(questionnaire);
    const generateLive = (slot: string, id: string) =>
      generateProgram({
        mode: "weekly",
        signals,
        nextProgramId: id,
        initialVariationSeed: slot,
        phaseIndex: 2,
        cycleIndex: 1,
        weekIndex: 1,
        totalWeekIndex: 1,
      });

    const slotA = generateLive("hf-live-slot-a", "hf-live-slot-a");
    const slotARepeat = generateLive("hf-live-slot-a", "hf-live-slot-a-repeat");
    const slotB = generateLive("hf-live-slot-b", "hf-live-slot-b");

    expect(slotA.status).toBe("generated");
    expect(slotARepeat.status).toBe("generated");
    expect(slotB.status).toBe("generated");
    if ("program" in slotA && "program" in slotARepeat && "program" in slotB) {
      expect(slotA.program.week).toHaveLength(5);
      expect(comparableWeek(slotA.program)).toEqual(comparableWeek(slotARepeat.program));
      expect(mainLayoutSignature(slotA.program)).not.toBe(mainLayoutSignature(slotB.program));
    }
  });
});
