import { describe, expect, test } from "vitest";
import { generateWeeklyProgram } from "@/lib/program";
import { exerciseById } from "@/lib/exercises";
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
  invariants: {
    uniqueExerciseIds: boolean;
    mainCountMatchesExpected: boolean;
    accessoryCountMatchesExpected?: boolean;
    mainSectionHasOnlyMainCategory: boolean;
  };
};

type GoldenSummary = {
  anchor: string;
  profile: string;
  phase: "activation" | "skill" | "growth";
  daysPerWeek: 3 | 4 | 5;
  expectedMainPerDay: number;
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

const buildGoldenSummary = (scenario: AnchorScenario): GoldenSummary => {
  const seed = `${GOLDEN_SEED_BASE}:${scenario.key}`;
  const program = generateWeeklyProgram(scenario.questionnaire, `golden-${scenario.key}`, {
    phaseIndex: scenario.phaseIndex,
    seed,
  });
  const expectedMainPerDay = expectedMainCountForDayTitle({
    daysPerWeek: scenario.questionnaire.daysPerWeek,
    dayTitle: program.week[0]?.title ?? "Back + Chest",
    experience: scenario.questionnaire.experience,
  });

  const days: GoldenDaySummary[] = program.week.map((day) => {
    const routineIds = day.routine.map((item) => item.exerciseId);
    const mainItems = day.routine.filter((item) => item.section === "main");
    const accessoryItems = day.routine.filter((item) => item.section === "accessory");
    const expectedMainCount = expectedMainCountForDayTitle({
      daysPerWeek: scenario.questionnaire.daysPerWeek,
      dayTitle: day.title,
      experience: scenario.questionnaire.experience,
    });
    const expectedAccessoryCount = expectedAccessoryCountForDayTitle({
      daysPerWeek: scenario.questionnaire.daysPerWeek,
      dayTitle: day.title,
      experience: scenario.questionnaire.experience,
    });
    const activationBlockFirst2 = day.routine
      .filter((item) => item.section === "warmup" || item.section === "activation")
      .slice(0, 2)
      .map((item) => item.exerciseId);
    const mainSectionHasOnlyMainCategory = mainItems.every((item) => {
      return exerciseById(item.exerciseId)?.category === "main";
    });

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
      invariants: {
        uniqueExerciseIds: new Set(routineIds).size === routineIds.length,
        mainCountMatchesExpected: mainItems.length === expectedMainCount,
        ...(scenario.questionnaire.daysPerWeek === 3
          ? { accessoryCountMatchesExpected: accessoryItems.length === expectedAccessoryCount }
          : {}),
        mainSectionHasOnlyMainCategory,
      },
    };
  });

  return {
    anchor: scenario.key,
    profile: scenario.profile,
    phase: scenario.phase,
    daysPerWeek: scenario.questionnaire.daysPerWeek,
    expectedMainPerDay,
    days,
  };
};

const getAnchor = (key: AnchorScenario["key"]) => {
  const match = COACH6_ANCHORS.find((scenario) => scenario.key === key);
  if (!match) {
    throw new Error(`Missing anchor scenario: ${key}`);
  }
  return match;
};

const expectGoldenInvariants = (summary: GoldenSummary) => {
  summary.days.forEach((day) => {
    expect(day.invariants.uniqueExerciseIds).toBe(true);
    expect(day.invariants.mainCountMatchesExpected).toBe(true);
    if (typeof day.invariants.accessoryCountMatchesExpected === "boolean") {
      expect(day.invariants.accessoryCountMatchesExpected).toBe(true);
    }
    expect(day.invariants.mainSectionHasOnlyMainCategory).toBe(true);
  });
};

describe("program golden anchor fingerprints", () => {
  test("seeded output is deterministic across repeated runs", () => {
    COACH6_ANCHORS.forEach((scenario) => {
      const first = buildGoldenSummary(scenario);
      const second = buildGoldenSummary(scenario);
      expect(second).toEqual(first);
    });
  });

  test("anchor A fingerprint", () => {
    const summary = buildGoldenSummary(getAnchor("A"));
    expectGoldenInvariants(summary);
    expect(summary).toMatchInlineSnapshot(`
      {
        "anchor": "A",
        "days": [
          {
            "accessoryFirst2Ids": [
              "band-rear-delt-fly",
              "band-face-pull-high-anchor",
            ],
            "activationBlockFirst2": [
              "wall-slides",
              "wall-angel-hold",
            ],
            "counts": {
              "accessory": 2,
              "activation": 1,
              "main": 3,
            },
            "dayTitle": "Back + Chest",
            "invariants": {
              "accessoryCountMatchesExpected": true,
              "mainCountMatchesExpected": true,
              "mainSectionHasOnlyMainCategory": true,
              "uniqueExerciseIds": true,
            },
            "mainIds": [
              "split-stance-band-chest-press",
              "band-chest-press",
              "split-stance-row",
            ],
          },
          {
            "accessoryFirst2Ids": [
              "band-triceps-pressdown",
              "band-biceps-curl",
            ],
            "activationBlockFirst2": [
              "wall-slides",
              "wall-angel-hold",
            ],
            "counts": {
              "accessory": 3,
              "activation": 1,
              "main": 3,
            },
            "dayTitle": "Shoulders + Arms",
            "invariants": {
              "accessoryCountMatchesExpected": true,
              "mainCountMatchesExpected": true,
              "mainSectionHasOnlyMainCategory": true,
              "uniqueExerciseIds": true,
            },
            "mainIds": [
              "band-overhead-press",
              "prone-t-raise",
              "band-rear-delt-fly",
            ],
          },
          {
            "accessoryFirst2Ids": [
              "side-plank",
              "single-leg-calf-raise",
            ],
            "activationBlockFirst2": [
              "cat-cow",
              "wall-angel-hold",
            ],
            "counts": {
              "accessory": 2,
              "activation": 1,
              "main": 3,
            },
            "dayTitle": "Legs + Abs",
            "invariants": {
              "accessoryCountMatchesExpected": true,
              "mainCountMatchesExpected": true,
              "mainSectionHasOnlyMainCategory": true,
              "uniqueExerciseIds": true,
            },
            "mainIds": [
              "band-front-squat",
              "back-extension-hold",
              "split-squat",
            ],
          },
        ],
        "daysPerWeek": 3,
        "expectedMainPerDay": 3,
        "phase": "activation",
        "profile": "normal beginner",
      }
    `);
  });

  test("anchor B fingerprint", () => {
    const summary = buildGoldenSummary(getAnchor("B"));
    expectGoldenInvariants(summary);
    expect(summary).toMatchInlineSnapshot(`
      {
        "anchor": "B",
        "days": [
          {
            "accessoryFirst2Ids": [
              "bodyweight-triceps-extension",
              "db-biceps-curl",
            ],
            "activationBlockFirst2": [
              "wall-slides",
              "wall-angel-hold",
            ],
            "counts": {
              "accessory": 2,
              "activation": 1,
              "main": 2,
            },
            "dayTitle": "Upper Push + Scapular Control",
            "invariants": {
              "mainCountMatchesExpected": true,
              "mainSectionHasOnlyMainCategory": true,
              "uniqueExerciseIds": true,
            },
            "mainIds": [
              "dumbbell-floor-press",
              "dumbbell-shoulder-press",
            ],
          },
          {
            "accessoryFirst2Ids": [
              "single-leg-calf-raise",
              "farmers-carry",
            ],
            "activationBlockFirst2": [
              "cat-cow",
              "dead-bug",
            ],
            "counts": {
              "accessory": 2,
              "activation": 1,
              "main": 2,
            },
            "dayTitle": "Lower (Squat Emphasis) + Core",
            "invariants": {
              "mainCountMatchesExpected": true,
              "mainSectionHasOnlyMainCategory": true,
              "uniqueExerciseIds": true,
            },
            "mainIds": [
              "machine-leg-press",
              "db-rdl",
            ],
          },
          {
            "accessoryFirst2Ids": [
              "cable-biceps-curl",
              "bodyweight-triceps-extension",
            ],
            "activationBlockFirst2": [
              "wall-slides",
              "wall-angel-hold",
            ],
            "counts": {
              "accessory": 2,
              "activation": 1,
              "main": 2,
            },
            "dayTitle": "Upper Pull + Thoracic Posture",
            "invariants": {
              "mainCountMatchesExpected": true,
              "mainSectionHasOnlyMainCategory": true,
              "uniqueExerciseIds": true,
            },
            "mainIds": [
              "dumbbell-rows",
              "dumbbell-chest-supported-row",
            ],
          },
          {
            "accessoryFirst2Ids": [
              "single-leg-calf-raise",
              "farmers-carry",
            ],
            "activationBlockFirst2": [
              "cat-cow",
              "dead-bug",
            ],
            "counts": {
              "accessory": 2,
              "activation": 1,
              "main": 2,
            },
            "dayTitle": "Lower (Hinge Emphasis) + Carry/Anti-rotation",
            "invariants": {
              "mainCountMatchesExpected": true,
              "mainSectionHasOnlyMainCategory": true,
              "uniqueExerciseIds": true,
            },
            "mainIds": [
              "db-rdl",
              "machine-leg-press",
            ],
          },
        ],
        "daysPerWeek": 4,
        "expectedMainPerDay": 2,
        "phase": "growth",
        "profile": "normal beginner",
      }
    `);
  });

  test("anchor C fingerprint", () => {
    const summary = buildGoldenSummary(getAnchor("C"));
    expectGoldenInvariants(summary);
    expect(summary).toMatchInlineSnapshot(`
      {
        "anchor": "C",
        "days": [
          {
            "accessoryFirst2Ids": [
              "dumbbell-chest-fly",
              "contralateral-reach-march",
            ],
            "activationBlockFirst2": [
              "wall-slides",
              "wall-angel-hold",
            ],
            "counts": {
              "accessory": 2,
              "activation": 1,
              "main": 3,
            },
            "dayTitle": "Upper Push",
            "invariants": {
              "mainCountMatchesExpected": true,
              "mainSectionHasOnlyMainCategory": true,
              "uniqueExerciseIds": true,
            },
            "mainIds": [
              "dumbbell-floor-press",
              "dumbbell-arnold-press",
              "machine-chest-press",
            ],
          },
          {
            "accessoryFirst2Ids": [
              "single-leg-calf-raise",
              "farmers-carry",
            ],
            "activationBlockFirst2": [
              "cat-cow",
              "dead-bug",
            ],
            "counts": {
              "accessory": 2,
              "activation": 1,
              "main": 3,
            },
            "dayTitle": "Lower Squat",
            "invariants": {
              "mainCountMatchesExpected": true,
              "mainSectionHasOnlyMainCategory": true,
              "uniqueExerciseIds": true,
            },
            "mainIds": [
              "machine-leg-press",
              "db-rdl",
              "machine-hack-squat",
            ],
          },
          {
            "accessoryFirst2Ids": [
              "cable-biceps-curl",
              "farmers-carry",
            ],
            "activationBlockFirst2": [
              "wall-slides",
              "wall-angel-hold",
            ],
            "counts": {
              "accessory": 2,
              "activation": 1,
              "main": 3,
            },
            "dayTitle": "Upper Pull",
            "invariants": {
              "mainCountMatchesExpected": true,
              "mainSectionHasOnlyMainCategory": true,
              "uniqueExerciseIds": true,
            },
            "mainIds": [
              "dumbbell-rows",
              "barbell-landmine-pulldown",
              "single-arm-dumbbell-row",
            ],
          },
          {
            "accessoryFirst2Ids": [
              "single-leg-calf-raise",
              "farmers-carry",
            ],
            "activationBlockFirst2": [
              "cat-cow",
              "dead-bug",
            ],
            "counts": {
              "accessory": 2,
              "activation": 1,
              "main": 3,
            },
            "dayTitle": "Lower Hinge + Posterior Chain",
            "invariants": {
              "mainCountMatchesExpected": true,
              "mainSectionHasOnlyMainCategory": true,
              "uniqueExerciseIds": true,
            },
            "mainIds": [
              "db-rdl",
              "machine-leg-press",
              "machine-seated-hamstring-curl",
            ],
          },
          {
            "accessoryFirst2Ids": [
              "bodyweight-triceps-extension",
              "cable-biceps-curl",
            ],
            "activationBlockFirst2": [
              "wall-slides",
              "wall-angel-hold",
            ],
            "counts": {
              "accessory": 2,
              "activation": 1,
              "main": 3,
            },
            "dayTitle": "Arms + Posture + Conditioning",
            "invariants": {
              "mainCountMatchesExpected": true,
              "mainSectionHasOnlyMainCategory": true,
              "uniqueExerciseIds": true,
            },
            "mainIds": [
              "dumbbell-rows",
              "dumbbell-shoulder-press",
              "dumbbell-floor-press",
            ],
          },
        ],
        "daysPerWeek": 5,
        "expectedMainPerDay": 3,
        "phase": "growth",
        "profile": "intermediate",
      }
    `);
  });

  test("anchor D fingerprint", () => {
    const summary = buildGoldenSummary(getAnchor("D"));
    expectGoldenInvariants(summary);
    expect(summary).toMatchInlineSnapshot(`
      {
        "anchor": "D",
        "days": [
          {
            "accessoryFirst2Ids": [
              "band-face-pull-high-anchor",
              "band-rear-delt-fly",
            ],
            "activationBlockFirst2": [
              "wall-slides",
              "band-pull-aparts",
            ],
            "counts": {
              "accessory": 2,
              "activation": 1,
              "main": 3,
            },
            "dayTitle": "Back + Chest",
            "invariants": {
              "accessoryCountMatchesExpected": true,
              "mainCountMatchesExpected": true,
              "mainSectionHasOnlyMainCategory": true,
              "uniqueExerciseIds": true,
            },
            "mainIds": [
              "band-chest-press",
              "split-stance-band-chest-press",
              "band-lat-pulldown",
            ],
          },
          {
            "accessoryFirst2Ids": [
              "band-triceps-pressdown",
              "band-biceps-curl",
            ],
            "activationBlockFirst2": [
              "wall-slides",
              "band-pull-aparts",
            ],
            "counts": {
              "accessory": 3,
              "activation": 1,
              "main": 3,
            },
            "dayTitle": "Shoulders + Arms",
            "invariants": {
              "accessoryCountMatchesExpected": true,
              "mainCountMatchesExpected": true,
              "mainSectionHasOnlyMainCategory": true,
              "uniqueExerciseIds": true,
            },
            "mainIds": [
              "band-overhead-press",
              "band-lateral-raise",
              "band-rear-delt-fly",
            ],
          },
          {
            "accessoryFirst2Ids": [
              "pallof-press",
              "band-calf-raise",
            ],
            "activationBlockFirst2": [
              "cat-cow",
              "dead-bug",
            ],
            "counts": {
              "accessory": 2,
              "activation": 1,
              "main": 3,
            },
            "dayTitle": "Legs + Abs",
            "invariants": {
              "accessoryCountMatchesExpected": true,
              "mainCountMatchesExpected": true,
              "mainSectionHasOnlyMainCategory": true,
              "uniqueExerciseIds": true,
            },
            "mainIds": [
              "band-front-squat",
              "band-rdl",
              "split-squat",
            ],
          },
        ],
        "daysPerWeek": 3,
        "expectedMainPerDay": 3,
        "phase": "activation",
        "profile": "pain beginner",
      }
    `);
  });

  test("anchor E fingerprint", () => {
    const summary = buildGoldenSummary(getAnchor("E"));
    expectGoldenInvariants(summary);
    expect(summary).toMatchInlineSnapshot(`
      {
        "anchor": "E",
        "days": [
          {
            "accessoryFirst2Ids": [
              "bodyweight-triceps-extension",
              "dumbbell-rows",
            ],
            "activationBlockFirst2": [
              "wall-slides",
              "wall-angel-hold",
            ],
            "counts": {
              "accessory": 3,
              "activation": 1,
              "main": 4,
            },
            "dayTitle": "Upper Push + Scapular Control",
            "invariants": {
              "mainCountMatchesExpected": true,
              "mainSectionHasOnlyMainCategory": true,
              "uniqueExerciseIds": true,
            },
            "mainIds": [
              "dumbbell-floor-press",
              "dumbbell-bench-press",
              "dumbbell-chest-fly",
              "dumbbell-lateral-raise",
            ],
          },
          {
            "accessoryFirst2Ids": [
              "single-leg-calf-raise",
              "hollow-body-hold",
            ],
            "activationBlockFirst2": [
              "cat-cow",
              "hip-hinge-drill",
            ],
            "counts": {
              "accessory": 3,
              "activation": 1,
              "main": 4,
            },
            "dayTitle": "Lower (Squat Emphasis) + Core",
            "invariants": {
              "mainCountMatchesExpected": true,
              "mainSectionHasOnlyMainCategory": true,
              "uniqueExerciseIds": true,
            },
            "mainIds": [
              "machine-leg-press",
              "farmers-carry",
              "split-squat",
              "machine-seated-hamstring-curl",
            ],
          },
          {
            "accessoryFirst2Ids": [
              "cable-biceps-curl",
              "farmers-carry",
            ],
            "activationBlockFirst2": [
              "wall-slides",
              "wall-angel-hold",
            ],
            "counts": {
              "accessory": 3,
              "activation": 1,
              "main": 4,
            },
            "dayTitle": "Upper Pull + Thoracic Posture",
            "invariants": {
              "mainCountMatchesExpected": true,
              "mainSectionHasOnlyMainCategory": true,
              "uniqueExerciseIds": true,
            },
            "mainIds": [
              "dumbbell-rows",
              "machine-rear-delt-row",
              "single-arm-dumbbell-row",
              "dumbbell-rear-delt-fly",
            ],
          },
          {
            "accessoryFirst2Ids": [
              "single-leg-calf-raise",
              "hollow-body-hold",
            ],
            "activationBlockFirst2": [
              "cat-cow",
              "hip-hinge-drill",
            ],
            "counts": {
              "accessory": 3,
              "activation": 1,
              "main": 4,
            },
            "dayTitle": "Lower (Hinge Emphasis) + Carry/Anti-rotation",
            "invariants": {
              "mainCountMatchesExpected": true,
              "mainSectionHasOnlyMainCategory": true,
              "uniqueExerciseIds": true,
            },
            "mainIds": [
              "machine-seated-hamstring-curl",
              "machine-leg-press",
              "farmers-carry",
              "split-squat",
            ],
          },
        ],
        "daysPerWeek": 4,
        "expectedMainPerDay": 4,
        "phase": "skill",
        "profile": "pain advanced",
      }
    `);
  });

  test("anchor F fingerprint", () => {
    const summary = buildGoldenSummary(getAnchor("F"));
    expectGoldenInvariants(summary);
    expect(summary).toMatchInlineSnapshot(`
      {
        "anchor": "F",
        "days": [
          {
            "accessoryFirst2Ids": [
              "dumbbell-chest-fly",
              "contralateral-reach-march",
            ],
            "activationBlockFirst2": [
              "wall-slides",
              "wall-angel-hold",
            ],
            "counts": {
              "accessory": 3,
              "activation": 1,
              "main": 4,
            },
            "dayTitle": "Upper Push",
            "invariants": {
              "mainCountMatchesExpected": true,
              "mainSectionHasOnlyMainCategory": true,
              "uniqueExerciseIds": true,
            },
            "mainIds": [
              "dumbbell-floor-press",
              "dumbbell-shoulder-press",
              "machine-chest-press",
              "dumbbell-arnold-press",
            ],
          },
          {
            "accessoryFirst2Ids": [
              "single-leg-calf-raise",
              "hollow-body-hold",
            ],
            "activationBlockFirst2": [
              "cat-cow",
              "hip-hinge-drill",
            ],
            "counts": {
              "accessory": 3,
              "activation": 1,
              "main": 4,
            },
            "dayTitle": "Lower Squat",
            "invariants": {
              "mainCountMatchesExpected": true,
              "mainSectionHasOnlyMainCategory": true,
              "uniqueExerciseIds": true,
            },
            "mainIds": [
              "machine-leg-press",
              "db-rdl",
              "barbell-back-squat",
              "dumbbell-step-up-loaded",
            ],
          },
          {
            "accessoryFirst2Ids": [
              "reverse-snow-angel",
              "farmers-carry",
            ],
            "activationBlockFirst2": [
              "wall-slides",
              "wall-angel-hold",
            ],
            "counts": {
              "accessory": 3,
              "activation": 1,
              "main": 4,
            },
            "dayTitle": "Upper Pull",
            "invariants": {
              "mainCountMatchesExpected": true,
              "mainSectionHasOnlyMainCategory": true,
              "uniqueExerciseIds": true,
            },
            "mainIds": [
              "dumbbell-rows",
              "barbell-bent-over-row",
              "cable-seated-row",
              "cable-lat-pulldown",
            ],
          },
          {
            "accessoryFirst2Ids": [
              "single-leg-calf-raise",
              "hollow-body-hold",
            ],
            "activationBlockFirst2": [
              "cat-cow",
              "hip-hinge-drill",
            ],
            "counts": {
              "accessory": 3,
              "activation": 1,
              "main": 4,
            },
            "dayTitle": "Lower Hinge + Posterior Chain",
            "invariants": {
              "mainCountMatchesExpected": true,
              "mainSectionHasOnlyMainCategory": true,
              "uniqueExerciseIds": true,
            },
            "mainIds": [
              "db-rdl",
              "machine-leg-press",
              "barbell-hip-thrust",
              "machine-glute-drive",
            ],
          },
          {
            "accessoryFirst2Ids": [
              "dumbbell-chest-fly",
              "cable-biceps-curl",
            ],
            "activationBlockFirst2": [
              "wall-slides",
              "wall-angel-hold",
            ],
            "counts": {
              "accessory": 3,
              "activation": 1,
              "main": 4,
            },
            "dayTitle": "Arms + Posture + Conditioning",
            "invariants": {
              "mainCountMatchesExpected": true,
              "mainSectionHasOnlyMainCategory": true,
              "uniqueExerciseIds": true,
            },
            "mainIds": [
              "dumbbell-rows",
              "dumbbell-arnold-press",
              "dumbbell-floor-press",
              "dumbbell-rear-delt-fly",
            ],
          },
        ],
        "daysPerWeek": 5,
        "expectedMainPerDay": 4,
        "phase": "growth",
        "profile": "pain advanced",
      }
    `);
  });
});
