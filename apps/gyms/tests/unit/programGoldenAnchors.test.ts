import { describe, expect, test } from "vitest";
import { generateWeeklyProgram } from "@/lib/program";
import { exerciseById, type Exercise } from "@/lib/exercises";
import { isExerciseEligible, normalizeEquipmentSelection } from "@/lib/equipment";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import {
  expectedAccessoryCountForDayTitle,
  expectedMainCountForDayTitle,
} from "./_helpers/expectedCounts";

type AnchorScenario = {
  key: string;
  profile: string;
  phase: "activation" | "skill" | "growth";
  phaseIndex: 1 | 2 | 3;
  questionnaire: QuestionnaireData;
};

type GoldenDaySummary = {
  dayTitle: string;
  activationBlockFirst2: string[];
  mainIds: string[];
  accessoryFirst2Ids: string[];
  counts: {
    activation: number;
    main: number;
    accessory: number;
  };
  expected: {
    main: number;
    accessory?: number;
  };
  coverage: {
    hasRequiredMovementCoverage: boolean;
  };
  invariants: {
    titleMatchesExpected: boolean;
    uniqueExerciseIds: boolean;
    mainCountMatchesExpected: boolean;
    accessoryCountMatchesExpected?: boolean;
    mainSectionHasOnlyMainCategory: boolean;
    allExercisesEquipmentEligible: boolean;
  };
};

type GoldenSummary = {
  anchor: string;
  profile: string;
  phase: "activation" | "skill" | "growth";
  daysPerWeek: 3 | 4 | 5;
  days: GoldenDaySummary[];
};

const GOLDEN_SEED_BASE = "golden-anchors-v1";

const COACH6_ANCHORS: AnchorScenario[] = [
  {
    key: "A",
    profile: "normal beginner",
    phase: "activation",
    phaseIndex: 1,
    questionnaire: {
      goals: "Improve posture",
      painAreas: [],
      experience: "Beginner",
      daysPerWeek: 3,
      equipment: ["bands"],
    },
  },
  {
    key: "B",
    profile: "normal beginner",
    phase: "growth",
    phaseIndex: 3,
    questionnaire: {
      goals: "Improve posture",
      painAreas: [],
      experience: "Beginner",
      daysPerWeek: 4,
      equipment: ["gym"],
    },
  },
  {
    key: "C",
    profile: "intermediate",
    phase: "growth",
    phaseIndex: 3,
    questionnaire: {
      goals: "Improve posture",
      painAreas: [],
      experience: "Intermediate",
      daysPerWeek: 5,
      equipment: ["gym"],
    },
  },
  {
    key: "D",
    profile: "pain beginner",
    phase: "activation",
    phaseIndex: 1,
    questionnaire: {
      goals: "Reduce pain",
      painAreas: ["low_back", "shoulders"],
      experience: "Beginner",
      daysPerWeek: 3,
      equipment: ["bands"],
    },
  },
  {
    key: "E",
    profile: "pain advanced",
    phase: "skill",
    phaseIndex: 2,
    questionnaire: {
      goals: "Reduce pain",
      painAreas: ["low_back", "neck"],
      experience: "Advanced",
      daysPerWeek: 4,
      equipment: ["gym"],
    },
  },
  {
    key: "F",
    profile: "pain advanced",
    phase: "growth",
    phaseIndex: 3,
    questionnaire: {
      goals: "Reduce pain",
      painAreas: ["low_back", "neck"],
      experience: "Advanced",
      daysPerWeek: 5,
      equipment: ["gym"],
    },
  },
];

const expectedDayTitlesForDays = (daysPerWeek: QuestionnaireData["daysPerWeek"]) => {
  if (daysPerWeek === 3) {
    return ["Back + Chest", "Shoulders + Arms", "Legs + Abs"];
  }
  if (daysPerWeek === 4) {
    return [
      "Upper Push + Scapular Control",
      "Lower (Squat Emphasis) + Core",
      "Upper Pull + Thoracic Posture",
      "Lower (Hinge Emphasis) + Carry/Anti-rotation",
    ];
  }
  return [
    "Upper Push",
    "Lower Squat",
    "Upper Pull",
    "Lower Hinge + Posterior Chain",
    "Arms + Posture + Conditioning",
  ];
};

const hasPattern = (exercise: Exercise, patternToken: string) =>
  exercise.movementPattern.some((pattern) =>
    pattern.toLowerCase().includes(patternToken.toLowerCase())
  );

const hasAnyPattern = (exercises: Exercise[], patternToken: string) =>
  exercises.some((exercise) => hasPattern(exercise, patternToken));

const hasRequiredMovementCoverage = (dayTitle: string, mainExercises: Exercise[]) => {
  if (dayTitle === "Back + Chest") {
    return hasAnyPattern(mainExercises, "push") && hasAnyPattern(mainExercises, "pull");
  }

  if (dayTitle === "Legs + Abs") {
    return hasAnyPattern(mainExercises, "squat") && hasAnyPattern(mainExercises, "hinge");
  }

  if (dayTitle.includes("Upper Push")) {
    return hasAnyPattern(mainExercises, "push");
  }

  if (dayTitle.includes("Upper Pull")) {
    return hasAnyPattern(mainExercises, "pull");
  }

  if (dayTitle.includes("Lower Squat") || dayTitle.includes("(Squat")) {
    return hasAnyPattern(mainExercises, "squat");
  }

  if (dayTitle.includes("Lower Hinge") || dayTitle.includes("(Hinge")) {
    return hasAnyPattern(mainExercises, "hinge");
  }

  return true;
};

const buildGoldenSummary = (scenario: AnchorScenario): GoldenSummary => {
  const seed = `${GOLDEN_SEED_BASE}:${scenario.key}`;
  const program = generateWeeklyProgram(scenario.questionnaire, `golden-${scenario.key}`, {
    phaseIndex: scenario.phaseIndex,
    seed,
  });
  const expectedTitles = expectedDayTitlesForDays(scenario.questionnaire.daysPerWeek);
  const availableEquipment = normalizeEquipmentSelection(scenario.questionnaire.equipment).available;

  const days: GoldenDaySummary[] = program.week.map((day, dayIndex) => {
    const routineIds = day.routine.map((item) => item.exerciseId);
    const mainItems = day.routine.filter((item) => item.section === "main");
    const accessoryItems = day.routine.filter((item) => item.section === "accessory");
    const mainExercises = mainItems
      .map((item) => exerciseById(item.exerciseId))
      .filter((exercise): exercise is Exercise => Boolean(exercise));
    const expectedMainCount = expectedMainCountForDayTitle({
      daysPerWeek: scenario.questionnaire.daysPerWeek,
      dayTitle: day.title,
      experience: scenario.questionnaire.experience,
    });
    const expectedAccessoryCount =
      scenario.questionnaire.daysPerWeek === 3
        ? expectedAccessoryCountForDayTitle({
            daysPerWeek: scenario.questionnaire.daysPerWeek,
            dayTitle: day.title,
            experience: scenario.questionnaire.experience,
          })
        : undefined;
    const activationBlockFirst2 = day.routine
      .filter((item) => item.section === "warmup" || item.section === "activation")
      .slice(0, 2)
      .map((item) => item.exerciseId);
    const mainSectionHasOnlyMainCategory = mainItems.every((item) => {
      return exerciseById(item.exerciseId)?.category === "main";
    });
    const allExercisesEquipmentEligible = day.routine.every((item) => {
      const exercise = exerciseById(item.exerciseId);
      return exercise ? isExerciseEligible(exercise, availableEquipment) : false;
    });
    const requiredMovementCoverage = hasRequiredMovementCoverage(day.title, mainExercises);

    return {
      dayTitle: day.title,
      activationBlockFirst2,
      mainIds: mainItems.map((item) => item.exerciseId),
      accessoryFirst2Ids: accessoryItems.slice(0, 2).map((item) => item.exerciseId),
      counts: {
        activation: day.routine.filter((item) => item.section === "activation").length,
        main: mainItems.length,
        accessory: accessoryItems.length,
      },
      expected: {
        main: expectedMainCount,
        ...(typeof expectedAccessoryCount === "number"
          ? { accessory: expectedAccessoryCount }
          : {}),
      },
      coverage: {
        hasRequiredMovementCoverage: requiredMovementCoverage,
      },
      invariants: {
        titleMatchesExpected: day.title === expectedTitles[dayIndex],
        uniqueExerciseIds: new Set(routineIds).size === routineIds.length,
        mainCountMatchesExpected: mainItems.length === expectedMainCount,
        ...(typeof expectedAccessoryCount === "number"
          ? { accessoryCountMatchesExpected: accessoryItems.length === expectedAccessoryCount }
          : {}),
        mainSectionHasOnlyMainCategory,
        allExercisesEquipmentEligible,
      },
    };
  });

  return {
    anchor: scenario.key,
    profile: scenario.profile,
    phase: scenario.phase,
    daysPerWeek: scenario.questionnaire.daysPerWeek,
    days,
  };
};

const expectGoldenInvariants = (summary: GoldenSummary) => {
  expect(summary.days.map((day) => day.dayTitle)).toEqual(
    expectedDayTitlesForDays(summary.daysPerWeek)
  );

  summary.days.forEach((day) => {
    expect(day.invariants.titleMatchesExpected).toBe(true);
    expect(day.invariants.uniqueExerciseIds).toBe(true);
    expect(day.invariants.mainCountMatchesExpected).toBe(true);
    if (typeof day.invariants.accessoryCountMatchesExpected === "boolean") {
      expect(day.invariants.accessoryCountMatchesExpected).toBe(true);
    }
    expect(day.invariants.mainSectionHasOnlyMainCategory).toBe(true);
    expect(day.invariants.allExercisesEquipmentEligible).toBe(true);
    expect(day.coverage.hasRequiredMovementCoverage).toBe(true);
  });
};

describe("program golden anchor contracts", () => {
  test("seeded output is deterministic across repeated runs", () => {
    COACH6_ANCHORS.forEach((scenario) => {
      const first = buildGoldenSummary(scenario);
      const second = buildGoldenSummary(scenario);
      expect(second).toEqual(first);
    });
  });

  test.each(COACH6_ANCHORS)("anchor $key follows contract", (scenario) => {
    const summary = buildGoldenSummary(scenario);
    expect(summary.anchor).toBe(scenario.key);
    expect(summary.profile).toBe(scenario.profile);
    expect(summary.phase).toBe(scenario.phase);
    expect(summary.daysPerWeek).toBe(scenario.questionnaire.daysPerWeek);
    expectGoldenInvariants(summary);
  });
});
