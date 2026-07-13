import { beforeEach, describe, expect, test } from "vitest";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import { exerciseById, type Exercise } from "@/lib/exercises";
import { clearProgramVariationHistory, generateWeeklyProgram } from "@/lib/program";
import {
  canUseUprightRowForThreeDayShoulder,
  getThreeDayCooldownPreferenceIds,
  isBackChestAccessorySetCoachBalanced,
  isBackChestPosteriorSupportFamily,
  isBackChestTruthfulChestIsolation,
  resolveBackChestAccessoryCoachFamily,
  resolveCoreCoachFamily,
  resolveLowerUnilateralCoachFamily,
  scoreLowerUnilateralCoachVariety,
} from "@/lib/program/threeDayCoachPolicy";

const requireExercise = (id: string) => {
  const exercise = exerciseById(id);
  if (!exercise) throw new Error(`Missing exercise ${id}`);
  return exercise;
};

const buildQuestionnaire = (
  overrides: Partial<QuestionnaireData> = {}
): QuestionnaireData => ({
  goals: "General fitness",
  painAreas: [],
  experience: "Intermediate",
  equipment: ["gym"],
  daysPerWeek: 3,
  ...overrides,
});

const getDayExercises = (
  program: ReturnType<typeof generateWeeklyProgram>,
  dayTitle: string,
  section: "main" | "accessory"
) => {
  const day = program.week.find((entry) => entry.title === dayTitle);
  expect(day).toBeTruthy();
  return (
    day?.routine
      .filter((item) => item.section === section)
      .map((item) => exerciseById(item.exerciseId))
      .filter((exercise): exercise is Exercise => Boolean(exercise)) ?? []
  );
};

const getDayItems = (
  program: ReturnType<typeof generateWeeklyProgram>,
  dayTitle: string,
  section: "main" | "accessory"
) => {
  const day = program.week.find((entry) => entry.title === dayTitle);
  expect(day).toBeTruthy();
  return day?.routine.filter((item) => item.section === section) ?? [];
};

const isFacePullFamily = (exercise: Exercise) => {
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  return descriptor.includes("face pull") || descriptor.includes("face-pull");
};

const isRowFamily = (exercise: Exercise) => {
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  return descriptor.includes("row") && !descriptor.includes("upright row");
};

const isVerticalPullSurrogate = (exercise: Exercise) => {
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  return descriptor.includes("pullover") || descriptor.includes("lat");
};

const isRearDeltMainFamily = (exercise: Exercise) => {
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  return descriptor.includes("rear-delt") ||
    descriptor.includes("rear delt") ||
    descriptor.includes("reverse pec deck") ||
    descriptor.includes("reverse-pec-deck");
};

describe("three-day coach policy", () => {
  beforeEach(() => {
    clearProgramVariationHistory();
  });

  test("classifies core families truthfully", () => {
    const sidePlankStar = requireExercise("side-plank-star");
    const pallofPress = requireExercise("pallof-press");

    expect(resolveCoreCoachFamily(sidePlankStar)).toBe("lateral_stability");
    expect(sidePlankStar.weeklyCoverageTags ?? []).toContain("core");
    expect(sidePlankStar.weeklyCoverageTags ?? []).not.toContain("lowerRegion");

    expect(resolveCoreCoachFamily(pallofPress)).toBe("anti_rotation");
    expect(pallofPress.weeklyCoverageTags ?? []).toContain("antiRotation");
    expect(pallofPress.weeklyCoverageTags ?? []).not.toContain("pushCompound");
  });

  test("does not let rear-delt fly work satisfy chest isolation", () => {
    const rearDeltFly = requireExercise("band-rear-delt-fly");
    const bandChestFly = requireExercise("band-chest-fly");

    expect(isBackChestTruthfulChestIsolation(rearDeltFly)).toBe(false);
    expect(resolveBackChestAccessoryCoachFamily(rearDeltFly)).toBe("rear_delt_support");
    expect(isBackChestTruthfulChestIsolation(bandChestFly)).toBe(true);
    expect(resolveBackChestAccessoryCoachFamily(bandChestFly)).toBe("chest_isolation");
    expect(bandChestFly.slotRoles ?? []).toContain("mainChestIsolation");
    expect(bandChestFly.accessoryRoles ?? []).toContain("accessoryChestIsolation");
  });

  test("constrained surrogate metadata contributes to truthful pull and hinge coverage", () => {
    const supineLat = requireExercise("supine-lat-pulldown-isometric");
    const seatedLat = requireExercise("seated-lat-sweep-pulse");
    const gluteBridgeHold = requireExercise("single-leg-glute-bridge-hold");

    expect(supineLat.weeklyCoverageTags ?? []).toContain("verticalPullSurrogate");
    expect(seatedLat.weeklyCoverageTags ?? []).toContain("verticalPullSurrogate");
    expect(gluteBridgeHold.weeklyCoverageTags ?? []).toContain("hinge");
    expect(gluteBridgeHold.weeklyCoverageTags ?? []).toContain("posteriorChain");
  });

  test("balances Back + Chest accessories once pull coverage is already satisfied", () => {
    const rearDelt = requireExercise("dumbbell-rear-delt-fly");
    const cableRearDelt = requireExercise("cable-rear-delt-fly");
    const chestFly = requireExercise("dumbbell-chest-fly");
    const pullover = requireExercise("dumbbell-pullover");

    expect(
      isBackChestAccessorySetCoachBalanced({
        accessories: [rearDelt, chestFly],
        accessoryTargetCount: 2,
        pullCoverageSatisfied: true,
        hasLegalNonSupportAlternative: true,
      })
    ).toBe(true);
    expect(
      isBackChestAccessorySetCoachBalanced({
        accessories: [rearDelt, pullover],
        accessoryTargetCount: 2,
        pullCoverageSatisfied: true,
        hasLegalNonSupportAlternative: true,
      })
    ).toBe(true);
    expect(
      isBackChestAccessorySetCoachBalanced({
        accessories: [rearDelt, cableRearDelt],
        accessoryTargetCount: 2,
        pullCoverageSatisfied: true,
        hasLegalNonSupportAlternative: true,
      })
    ).toBe(false);
  });

  test("generated gym Back + Chest uses one support plus one truthful expansion when mains already cover press and pulls", () => {
    ["Intermediate", "Advanced"].forEach((experience) => {
      clearProgramVariationHistory();
      const program = generateWeeklyProgram(
        buildQuestionnaire({
          experience: experience as QuestionnaireData["experience"],
          equipment: ["gym"],
        }),
        `policy-gym-back-chest-expansion-${experience}`,
        { phaseIndex: 1, seed: `policy-gym-back-chest-expansion-${experience}` }
      );
      const accessories = getDayExercises(program, "Back + Chest", "accessory");
      const families = accessories.map(resolveBackChestAccessoryCoachFamily);
      const supportCount = families.filter(isBackChestPosteriorSupportFamily).length;

      expect(accessories.length).toBeGreaterThanOrEqual(2);
      expect(supportCount).toBe(1);
      expect(
        families.some((family) =>
          ["back_thickness", "back_width", "pullover_serratus"].includes(family)
        )
      ).toBe(true);
    });
  });

  test("gates upright rows to safe shoulder profiles", () => {
    const uprightRow = requireExercise("cable-upright-row");
    const safe = {
      exercise: uprightRow,
      experience: "intermediate" as const,
      painSeverity: "low" as const,
      painAreas: [],
      trainingContext: "gym" as const,
      availableEquipment: new Set(["cables", "dumbbells"] as const),
    };

    expect(canUseUprightRowForThreeDayShoulder(safe)).toBe(true);
    expect(canUseUprightRowForThreeDayShoulder({ ...safe, experience: "beginner" })).toBe(false);
    expect(canUseUprightRowForThreeDayShoulder({ ...safe, painAreas: ["Neck"] })).toBe(false);
    expect(canUseUprightRowForThreeDayShoulder({ ...safe, painAreas: ["Shoulders"] })).toBe(false);
    expect(canUseUprightRowForThreeDayShoulder({ ...safe, trainingContext: "home" })).toBe(false);
  });

  test("penalizes step-up saturation when other unilateral lower families are legal", () => {
    const stepUp = requireExercise("dumbbell-step-up-loaded");
    const reverseLunge = requireExercise("dumbbell-reverse-lunge");
    const alternativeFamilies = new Set(["step_up", "reverse_lunge", "split_squat"]);
    const recentFamilies = new Set(["step_up"]);

    const stepUpScore = scoreLowerUnilateralCoachVariety({
      exercise: stepUp,
      alternativeFamilies,
      recentFamilies,
    }).score;
    const reverseLungeScore = scoreLowerUnilateralCoachVariety({
      exercise: reverseLunge,
      alternativeFamilies,
      recentFamilies,
    }).score;

    expect(stepUpScore).toBeLessThan(reverseLungeScore);
  });

  test("generated intermediate and advanced gym shoulders do not double up rear-delt mains when loaded alternatives exist", () => {
    ["Intermediate", "Advanced"].forEach((experience) => {
      clearProgramVariationHistory();
      const program = generateWeeklyProgram(
        buildQuestionnaire({
          experience: experience as QuestionnaireData["experience"],
          equipment: ["gym"],
        }),
        `policy-shoulder-secondary-${experience}`,
        { phaseIndex: 1, seed: `policy-shoulder-secondary-${experience}` }
      );
      const mains = getDayExercises(program, "Shoulders + Arms", "main");
      const mainItems = getDayItems(program, "Shoulders + Arms", "main");
      const rearDeltMainCount = mains.filter(isRearDeltMainFamily).length;
      const secondaryLateral = mainItems.find(
        (item) =>
          item.selectionDebug?.slotKind === "mainSecondaryLoadedShoulder" &&
          item.exerciseId === "cable-lateral-raise"
      );

      expect(rearDeltMainCount).toBeLessThanOrEqual(1);
      expect(mains.some((exercise) => exercise.id === "cable-lateral-raise")).toBe(true);
      expect(secondaryLateral?.selectionDebug?.slotLane).toBe("push");
    });
  });

  test("generated intermediate and advanced gym lower unilateral slot rotates away from step-up when legal alternatives exist", () => {
    ["Intermediate", "Advanced"].forEach((experience) => {
      clearProgramVariationHistory();
      const program = generateWeeklyProgram(
        buildQuestionnaire({
          experience: experience as QuestionnaireData["experience"],
          equipment: ["gym"],
        }),
        `policy-lower-unilateral-${experience}`,
        { phaseIndex: 1, seed: `policy-lower-unilateral-${experience}` }
      );
      const unilateral = getDayExercises(program, "Legs + Abs", "main").find(
        (exercise) => resolveLowerUnilateralCoachFamily(exercise) !== "other"
      );

      expect(unilateral).toBeTruthy();
      expect(resolveLowerUnilateralCoachFamily(unilateral!)).not.toBe("step_up");
    });
  });

  test("band Back + Chest with press, fly, row, and pulldown avoids rear-delt plus face-pull accessory saturation", () => {
    const program = generateWeeklyProgram(
      buildQuestionnaire({
        experience: "Intermediate",
        equipment: ["bands"],
      }),
      "policy-band-back-chest-expansion",
      { phaseIndex: 2, seed: "policy-band-back-chest-expansion" }
    );
    const mainIds = getDayExercises(program, "Back + Chest", "main").map(
      (exercise) => exercise.id
    );
    const accessories = getDayExercises(program, "Back + Chest", "accessory");
    const accessoryIds = accessories.map((exercise) => exercise.id);
    const families = accessories.map(resolveBackChestAccessoryCoachFamily);

    expect(mainIds).toEqual(
      expect.arrayContaining([
        "band-chest-fly",
        "split-stance-row",
        "band-lat-pulldown",
      ])
    );
    expect(accessoryIds).not.toEqual(
      expect.arrayContaining(["band-rear-delt-fly", "band-face-pull-high-anchor"])
    );
    expect(families.filter(isBackChestPosteriorSupportFamily).length).toBe(1);
    expect(families).toContain("back_width");
  });

  test("uses day-aware cooldown preferences", () => {
    expect(
      getThreeDayCooldownPreferenceIds({
        dayTitle: "Shoulders + Arms",
        focus: "upper",
        selectedExercises: [requireExercise("dumbbell-shoulder-press")],
      })[0]
    ).not.toBe("doorway-pec-stretch");
    expect(
      getThreeDayCooldownPreferenceIds({
        dayTitle: "Back + Chest",
        focus: "upper",
        selectedExercises: [requireExercise("machine-chest-press")],
      })[0]
    ).toBe("doorway-pec-stretch");
    expect(
      getThreeDayCooldownPreferenceIds({
        dayTitle: "Legs + Abs",
        focus: "lower",
        selectedExercises: [requireExercise("goblet-squat")],
      }).slice(0, 2)
    ).toEqual(["hip-flexor-stretch", "hamstring-stretch"]);
  });

  test("beginner gym Back + Chest can avoid face-pull defaulting and add truthful chest work", () => {
    let sawNonFacePullAccessoryPair = false;
    let sawChestIsolationAccessory = false;

    Array.from({ length: 6 }, (_, variationIndex) => {
      const program = generateWeeklyProgram(
        buildQuestionnaire({
          goals: "Build strength",
          experience: "Beginner",
          equipment: ["gym"],
        }),
        `policy-beginner-back-chest-${variationIndex}`,
        {
          phaseIndex: 1,
          variation: {
            seed: "policy-beginner-back-chest",
            variationIndex,
            useRecentMemory: false,
          },
        }
      );
      const accessories = getDayExercises(program, "Back + Chest", "accessory");
      if (accessories.every((exercise) => !isFacePullFamily(exercise))) {
        sawNonFacePullAccessoryPair = true;
      }
      if (accessories.some(isBackChestTruthfulChestIsolation)) {
        sawChestIsolationAccessory = true;
      }
    });

    expect(sawNonFacePullAccessoryPair).toBe(true);
    expect(sawChestIsolationAccessory).toBe(true);
  });

  test("lower-back pain profiles avoid back-extension family as primary hinge when safer hinges exist", () => {
    const equipmentProfiles: QuestionnaireData["equipment"][] = [
      ["gym"],
      ["dumbbells"],
      ["bands"],
      ["bands", "dumbbells", "bench"],
      ["none"],
    ];

    equipmentProfiles.forEach((equipment) => {
      const program = generateWeeklyProgram(
        buildQuestionnaire({
          painAreas: ["lower back"],
          experience: "Beginner",
          equipment,
        }),
        `policy-low-back-${equipment.join("-")}`,
        { phaseIndex: 1, seed: `policy-low-back-${equipment.join("-")}` }
      );
      const legsDay = program.week.find((day) => day.title === "Legs + Abs");
      const mainIds =
        legsDay?.routine
          .filter((item) => item.section === "main")
          .map((item) => item.exerciseId) ?? [];

      expect(mainIds.length).toBeGreaterThan(0);
      expect(mainIds).not.toContain("back-extension");
      expect(mainIds).not.toContain("back-extension-hold");
    });
  });

  test("constrained Back + Chest uses vertical-pull surrogate instead of duplicate row mains", () => {
    const cases: QuestionnaireData["equipment"][] = [["dumbbells"], ["none"]];

    cases.forEach((equipment) => {
      const program = generateWeeklyProgram(
        buildQuestionnaire({
          experience: "Intermediate",
          equipment,
        }),
        `policy-constrained-pull-${equipment.join("-")}`,
        { phaseIndex: 2, seed: `policy-constrained-pull-${equipment.join("-")}` }
      );
      const mains = getDayExercises(program, "Back + Chest", "main");
      const rows = mains.filter(isRowFamily);
      const surrogates = mains.filter(isVerticalPullSurrogate);

      expect(surrogates.length).toBeGreaterThanOrEqual(1);
      expect(rows.length).toBeLessThanOrEqual(1);
    });
  });
});
