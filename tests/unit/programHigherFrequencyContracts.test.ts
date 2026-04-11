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

const hasTrueSquatAnchor = (exercise: Exercise) =>
  hasPattern(exercise, "squat") && !isForbiddenMainSlotDrill(exercise);

const isAntiRotationOrBraceDrill = (exercise: Exercise) => {
  const text = descriptor(exercise);
  return [
    "pallof",
    "woodchop",
    "anti-rotation",
    "anti rotation",
    "brace hold",
    "hollow body",
    "hollow-body",
    "plank",
    "dead bug",
    "dead-bug",
    "march",
  ].some((token) => text.includes(token));
};

const isForbiddenHingeMain = (exercise: Exercise) =>
  [
    "goblet-squat",
    "split-squat",
    "heels-elevated-squat",
    "dumbbell-step-up-loaded",
    "farmers-carry",
    "suitcase-carry",
    "suitcase-hold-march",
    "band-suitcase-march",
    "pallof-press",
    "band-woodchop",
    "hollow-body-hold",
    "plank",
    "side-plank",
    "dead-bug",
    "marching-brace-hold",
  ].includes(exercise.id) ||
  isCarryMain(exercise) ||
  isCoreOnlyMain(exercise) ||
  isAntiRotationOrBraceDrill(exercise);

const isTrueCoreAccessory = (exercise: Exercise) => {
  const text = descriptor(exercise);
  const tags = new Set((exercise.tags ?? []).map((tag) => tag.toLowerCase()));
  const patterns = new Set(exercise.movementPattern.map((pattern) => pattern.toLowerCase()));
  const carryOrMarch = isCarryMain(exercise) || text.includes("march");
  if (carryOrMarch) return true;
  const coreOrBrace =
    patterns.has("core") ||
    patterns.has("anti-rotation") ||
    patterns.has("anti_rotation") ||
    patterns.has("anti-extension") ||
    patterns.has("anti_extension") ||
    tags.has("core") ||
    tags.has("tva") ||
    tags.has("anti-rotation") ||
    tags.has("anti_rotation") ||
    ["plank", "dead bug", "dead-bug", "bird dog", "bird-dog", "pallof", "woodchop", "hollow", "brace"].some(
      (token) => text.includes(token)
    );
  const mainPatternLeak = [
    "push",
    "verticalpush",
    "horizontalpush",
    "pull",
    "horizontalpull",
    "verticalpull",
    "squat",
    "hinge",
  ].some((pattern) => patterns.has(pattern));
  return coreOrBrace && !mainPatternLeak;
};

const routineItemsForDay = (program: Program, title: string) => {
  const day = program.week.find((item) => item.title === title);
  expect(day, `Missing generated day "${title}"`).toBeTruthy();
  return day?.routine ?? [];
};

const mainRoutineItems = (program: Program, title: string) =>
  routineItemsForDay(program, title).filter((item) => item.section === "main");

const expectLowerSlotPurity = (program: Program, title: string) => {
  mainRoutineItems(program, title).forEach((item) => {
    const exercise = exerciseById(item.exerciseId);
    expect(exercise, `${title}: ${item.exerciseId}`).toBeTruthy();
    if (!exercise) return;
    const slotKind = item.selectionDebug?.slotKind;
    const slotLane = item.selectionDebug?.slotLane;

    if (slotKind === "mainHinge" || slotLane === "hinge") {
      expect(isForbiddenHingeMain(exercise), `${title}: ${exercise.id}`).toBe(false);
      expect(hasTrueHingeAnchor(exercise), `${title}: ${exercise.id}`).toBe(true);
    }
    if (slotKind === "mainSquat" || slotLane === "squat") {
      expect(hasTrueSquatAnchor(exercise), `${title}: ${exercise.id}`).toBe(true);
    }
  });
};

const expectAccessoryCorePurity = (program: Program) => {
  program.week.forEach((day) => {
    day.routine
      .filter((item) => item.section === "accessory")
      .forEach((item) => {
        expect(item.selectionDebug?.slotKind, `${day.title}: ${item.exerciseId}`).not.toBe(
          "accessoryFinal"
        );
        if (item.selectionDebug?.slotLane !== "core") return;
        const exercise = exerciseById(item.exerciseId);
        expect(exercise, `${day.title}: ${item.exerciseId}`).toBeTruthy();
        if (!exercise) return;
        expect(exercise.id).not.toBe("goblet-squat");
        expect(exercise.id).not.toBe("dumbbell-floor-press");
        expect(isTrueCoreAccessory(exercise), `${day.title}: ${exercise.id}`).toBe(true);
      });
  });
};

const expectProgramEquipmentEligible = (
  program: Program,
  questionnaire: QuestionnaireData
) => {
  const available = normalizeEquipmentSelection(questionnaire.equipment).available;
  program.week.forEach((day) => {
    day.routine.forEach((item) => {
      const exercise = exerciseById(item.exerciseId);
      expect(exercise, `${day.title}: ${item.exerciseId}`).toBeTruthy();
      if (!exercise) return;
      expect(
        isExerciseEligible(exercise, available),
        `${day.title}: ${exercise.id} requires ${exercise.equipment.join(", ")}`
      ).toBe(true);
    });
  });
};

const hingeMainExercises = (program: Program) =>
  program.week
    .filter((day) => day.title.toLowerCase().includes("lower"))
    .flatMap((day) =>
      day.routine
        .filter(
          (item) =>
            item.section === "main" && item.selectionDebug?.slotLane === "hinge"
        )
        .map((item) => exerciseById(item.exerciseId))
        .filter((exercise): exercise is Exercise => Boolean(exercise))
    );

const expectAnyHingeId = (
  program: Program,
  expectedIds: string[],
  label: string
) => {
  const hingeIds = hingeMainExercises(program).map((exercise) => exercise.id);
  expect(hingeIds.length, label).toBeGreaterThan(0);
  expect(
    hingeIds.some((id) => expectedIds.includes(id)),
    `${label}: ${hingeIds.join(", ")}`
  ).toBe(true);
};

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

  test("5-day bands and dumbbells posture split keeps anti-rotation out of mainHinge", () => {
    const program = generateAnchorProgram(
      baseQuestionnaire({
        goals: "Improve posture",
        equipment: ["bands", "dumbbells"],
        experience: "Advanced",
        daysPerWeek: 5,
      }),
      "hf-5day-posture-bands-db-lower-slot-purity"
    );

    expectLowerSlotPurity(program, "Lower Squat");
    expectLowerSlotPurity(program, "Lower Hinge + Posterior Chain");

    const lowerHingeItems = mainRoutineItems(program, "Lower Hinge + Posterior Chain");
    const lowerHingeExercises = lowerHingeItems
      .map((item) => exerciseById(item.exerciseId))
      .filter((exercise): exercise is Exercise => Boolean(exercise));
    expect(lowerHingeExercises.some((exercise) => exercise.id === "pallof-press")).toBe(false);
    expect(lowerHingeExercises.some(hasTrueHingeAnchor)).toBe(true);

    const firstTrueHingeIndex = lowerHingeExercises.findIndex(hasTrueHingeAnchor);
    const firstSupportIndex = lowerHingeExercises.findIndex(
      (exercise) =>
        isCarryMain(exercise) || isCoreOnlyMain(exercise) || isAntiRotationOrBraceDrill(exercise)
    );
    expect(firstTrueHingeIndex).toBeGreaterThanOrEqual(0);
    if (firstSupportIndex >= 0) {
      expect(firstTrueHingeIndex).toBeLessThan(firstSupportIndex);
    }
  });

  test("4-day dumbbell athletic lower slots keep squat, carry, and core out of mainHinge", () => {
    const program = generateAnchorProgram(
      baseQuestionnaire({
        goals: "Athletic performance",
        equipment: ["dumbbells"],
        experience: "Intermediate",
        daysPerWeek: 4,
      }),
      "hf-4day-athletic-db-lower-slot-purity"
    );

    expectLowerSlotPurity(program, "Lower (Squat Emphasis) + Core");
    expectLowerSlotPurity(program, "Lower (Hinge Emphasis) + Carry/Anti-rotation");

    const hingeDayItems = mainRoutineItems(
      program,
      "Lower (Hinge Emphasis) + Carry/Anti-rotation"
    );
    const hingeSlotIds = hingeDayItems
      .filter(
        (item) =>
          item.selectionDebug?.slotKind === "mainHinge" ||
          item.selectionDebug?.slotLane === "hinge"
      )
      .map((item) => item.exerciseId);
    expect(hingeSlotIds).not.toContain("goblet-squat");
    expect(hingeSlotIds).not.toContain("farmers-carry");

    const hingeDayMains = hingeDayItems
      .map((item) => exerciseById(item.exerciseId))
      .filter((exercise): exercise is Exercise => Boolean(exercise));
    expect(hingeDayMains.some(hasTrueHingeAnchor)).toBe(true);

    const loadedMains = program.week.flatMap((day) =>
      day.routine.filter((item) => item.section === "main" && item.loadType === "weighted")
    );
    expect(loadedMains.length).toBeGreaterThan(0);
    loadedMains.forEach((item) => {
      expect(item.reps).toBe("8-12");
    });
  });

  test("mixed dumbbells and bands athletic split keeps accessory core lane pure", () => {
    const program = generateAnchorProgram(
      baseQuestionnaire({
        goals: "Athletic performance",
        equipment: ["dumbbells", "bands"],
        experience: "Intermediate",
        daysPerWeek: 5,
      }),
      "hf-5day-athletic-db-bands-accessory-core-purity"
    );

    expectAccessoryCorePurity(program);
  });

  test.each([
    [
      "dumbbells-only",
      baseQuestionnaire({
        goals: "General fitness",
        equipment: ["dumbbells"],
        experience: "Intermediate",
        daysPerWeek: 5,
      }),
    ],
    [
      "bands-only",
      baseQuestionnaire({
        goals: "General fitness",
        equipment: ["bands"],
        experience: "Intermediate",
        daysPerWeek: 5,
      }),
    ],
    [
      "bands + dumbbells",
      baseQuestionnaire({
        goals: "Athletic performance",
        equipment: ["bands", "dumbbells"],
        experience: "Intermediate",
        daysPerWeek: 5,
      }),
    ],
    [
      "no-equipment",
      baseQuestionnaire({
        goals: "General fitness",
        equipment: ["none"],
        experience: "Intermediate",
        daysPerWeek: 5,
      }),
    ],
    [
      "mixed home reduce pain shoulders",
      baseQuestionnaire({
        goals: "Reduce pain",
        painAreas: ["Shoulders"],
        equipment: ["bands", "dumbbells"],
        experience: "Intermediate",
        daysPerWeek: 5,
      }),
    ],
    [
      "dumbbells-only hips and lower back",
      baseQuestionnaire({
        goals: "General fitness",
        painAreas: ["Hips", "Lower back"],
        equipment: ["dumbbells"],
        experience: "Intermediate",
        daysPerWeek: 5,
      }),
    ],
    [
      "bands-only lower and upper back",
      baseQuestionnaire({
        goals: "Reduce pain",
        painAreas: ["Lower back", "Upper back"],
        equipment: ["bands"],
        experience: "Intermediate",
        daysPerWeek: 5,
      }),
    ],
  ] as const)("home profile equipment legality holds for %s", (label, questionnaire) => {
    const program = generateWeeklyProgram(questionnaire, `hf-home-equipment-${label}`, {
      phaseIndex: 1,
      seed: `hf-home-equipment-${label}`,
    });

    expectProgramEquipmentEligible(program, questionnaire);
  });

  test.each([
    [
      "dumbbells-only low-pain",
      baseQuestionnaire({
        goals: "General fitness",
        equipment: ["dumbbells"],
        experience: "Beginner",
        daysPerWeek: 5,
      }),
      ["db-rdl"],
    ],
    [
      "dumbbells-only shoulder pain",
      baseQuestionnaire({
        goals: "Reduce pain",
        painAreas: ["Shoulders"],
        equipment: ["dumbbells"],
        experience: "Intermediate",
        daysPerWeek: 5,
      }),
      ["db-rdl"],
    ],
    [
      "bands-only low-pain",
      baseQuestionnaire({
        goals: "General fitness",
        equipment: ["bands"],
        experience: "Beginner",
        daysPerWeek: 5,
      }),
      ["band-rdl"],
    ],
    [
      "bands-only shoulder pain",
      baseQuestionnaire({
        goals: "Reduce pain",
        painAreas: ["Shoulders"],
        equipment: ["bands"],
        experience: "Intermediate",
        daysPerWeek: 5,
      }),
      ["band-rdl"],
    ],
    [
      "mixed home shoulder pain",
      baseQuestionnaire({
        goals: "Reduce pain",
        painAreas: ["Shoulders"],
        equipment: ["bands", "dumbbells"],
        experience: "Intermediate",
        daysPerWeek: 5,
      }),
      ["db-rdl", "band-rdl"],
    ],
  ] as const)(
    "Phase 1 home hinge quality prefers real anchors for %s",
    (label, questionnaire, expectedIds) => {
      const program = generateWeeklyProgram(questionnaire, `hf-home-hinge-${label}`, {
        phaseIndex: 1,
        seed: `hf-home-hinge-${label}`,
      });

      expectProgramEquipmentEligible(program, questionnaire);
      expectAnyHingeId(program, [...expectedIds], label);
    }
  );

  test("high-pain bands profile preserves conservative Phase 1 hinge fallback", () => {
    const questionnaire = baseQuestionnaire({
      goals: "Reduce pain",
      painAreas: ["Lower back", "Upper back"],
      equipment: ["bands"],
      experience: "Intermediate",
      daysPerWeek: 5,
    });
    const program = generateWeeklyProgram(questionnaire, "hf-home-high-pain-conservative-hinge", {
      phaseIndex: 1,
      seed: "hf-home-high-pain-conservative-hinge",
    });
    const hingeIds = hingeMainExercises(program).map((exercise) => exercise.id);

    expectProgramEquipmentEligible(program, questionnaire);
    expect(hingeIds.length).toBeGreaterThan(0);
    expect(hingeIds.includes("band-rdl"), hingeIds.join(", ")).toBe(false);
    hingeIds.forEach((id) => {
      expect(
        [
          "single-leg-glute-bridge-hold",
          "bodyweight-good-morning",
          "back-extension-hold",
          "back-extension",
          "single-leg-rdl",
        ].includes(id),
        id
      ).toBe(true);
    });
  });

  test("5-day beginner gym athletic Phase 1 lower days prefer a real loaded hinge when low-pain", () => {
    const program = generateWeeklyProgram(
      baseQuestionnaire({
        goals: "Athletic performance",
        equipment: ["gym"],
        experience: "Beginner",
        daysPerWeek: 5,
      }),
      "hf-5day-beginner-gym-phase1-loaded-hinge",
      {
        phaseIndex: 1,
        seed: "hf-5day-beginner-gym-phase1-loaded-hinge",
      }
    );

    ["Lower Squat", "Lower Hinge + Posterior Chain"].forEach((title) => {
      const hingeSlotExercises = mainRoutineItems(program, title)
        .filter((item) => item.selectionDebug?.slotLane === "hinge")
        .map((item) => exerciseById(item.exerciseId))
        .filter((exercise): exercise is Exercise => Boolean(exercise));
      expect(hingeSlotExercises.length, title).toBeGreaterThan(0);
      expect(hingeSlotExercises.some(hasTrueHingeAnchor), title).toBe(true);
      hingeSlotExercises.forEach((exercise) => {
        expect(
          ["bodyweight-good-morning", "back-extension", "back-extension-hold"].includes(
            exercise.id
          ),
          `${title}: ${exercise.id}`
        ).toBe(false);
      });
    });
  });

  test("4-day beginner gym general fitness Phase 1 lower days prefer a real loaded hinge when low-pain", () => {
    const program = generateWeeklyProgram(
      baseQuestionnaire({
        goals: "General fitness",
        equipment: ["gym"],
        experience: "Beginner",
        daysPerWeek: 4,
      }),
      "hf-4day-beginner-gym-phase1-loaded-hinge",
      {
        phaseIndex: 1,
        seed: "hf-4day-beginner-gym-phase1-loaded-hinge",
      }
    );

    [
      "Lower (Squat Emphasis) + Core",
      "Lower (Hinge Emphasis) + Carry/Anti-rotation",
    ].forEach((title) => {
      const hingeSlotExercises = mainRoutineItems(program, title)
        .filter((item) => item.selectionDebug?.slotLane === "hinge")
        .map((item) => exerciseById(item.exerciseId))
        .filter((exercise): exercise is Exercise => Boolean(exercise));
      expect(hingeSlotExercises.length, title).toBeGreaterThan(0);
      expect(hingeSlotExercises.some(hasTrueHingeAnchor), title).toBe(true);
      hingeSlotExercises.forEach((exercise) => {
        expect(
          ["bodyweight-good-morning", "back-extension", "back-extension-hold"].includes(
            exercise.id
          ),
          `${title}: ${exercise.id}`
        ).toBe(false);
      });
    });
  });

  test.each([
    ["advanced 5-day", "Advanced", 5],
    ["intermediate 4-day", "Intermediate", 4],
  ] as const)(
    "%s band pain profile preserves conservative Phase 1 hinge behavior",
    (_, experience, daysPerWeek) => {
      const program = generateWeeklyProgram(
        baseQuestionnaire({
          goals: "Reduce pain",
          painAreas: ["Lower back", "Hips"],
          equipment: ["bands"],
          experience,
          daysPerWeek,
        }),
        `hf-${daysPerWeek}day-${experience.toLowerCase()}-bands-pain-conservative-hinge`,
        {
          phaseIndex: 1,
          seed: `hf-${daysPerWeek}day-${experience.toLowerCase()}-bands-pain-conservative-hinge`,
        }
      );
      const conservativeHingeIds = new Set([
        "single-leg-glute-bridge-hold",
        "bodyweight-good-morning",
        "back-extension-hold",
        "back-extension",
        "single-leg-rdl",
      ]);

      const hingeSlotIds = program.week
        .filter((day) => day.title.toLowerCase().includes("lower"))
        .flatMap((day) =>
          day.routine
            .filter(
              (item) =>
                item.section === "main" && item.selectionDebug?.slotLane === "hinge"
            )
            .map((item) => item.exerciseId)
        );
      expect(hingeSlotIds.length).toBeGreaterThan(0);
      hingeSlotIds.forEach((id) => {
        expect(conservativeHingeIds.has(id), id).toBe(true);
      });
    }
  );

  test.each([
    ["shoulder pain", ["Shoulders"]],
    ["upper-back pain", ["Upper back"]],
  ] as const)("4-day beginner gym with %s keeps conservative lower structure", (_, painAreas) => {
    const program = generateAnchorProgram(
      baseQuestionnaire({
        equipment: ["gym"],
        experience: "Beginner",
        painAreas: [...painAreas],
        daysPerWeek: 4,
      }),
      `hf-4day-beginner-gym-${painAreas[0].toLowerCase().replace(/\s+/g, "-")}`
    );

    [
      "Lower (Squat Emphasis) + Core",
      "Lower (Hinge Emphasis) + Carry/Anti-rotation",
    ].forEach((title) => {
      const lowerMains = mainRoutineItems(program, title);
      expect(lowerMains).toHaveLength(2);
      expectLowerSlotPurity(program, title);
    });
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
