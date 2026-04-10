import { describe, expect, test } from "vitest";

import { EQUIPMENT_ENUM } from "@/lib/equipment";
import {
  adaptExercisesToV3Catalog,
  buildThreeDayThreeWeekRotation,
  generateV3PrototypeProgram,
  rankSlotCandidates,
  scoreUniquenessAgainstHistory,
  type V3CapabilityProfile,
  type V3PrototypeExercise,
} from "@/lib/engine_v3";

const FULL_EQUIPMENT = [...EQUIPMENT_ENUM];

const baseCapabilityProfile: V3CapabilityProfile = {
  availableEquipment: FULL_EQUIPMENT,
  allowOverheadLoading: true,
  allowUnsupportedHinge: true,
};

const extractPickSignature = (program: ReturnType<typeof generateV3PrototypeProgram>) =>
  program.days.map((day) =>
    day.picks.map((pick) => ({
      slotId: pick.slot.id,
      family: pick.slot.family,
      exerciseId: pick.exercise?.id ?? null,
      total: pick.selectedScore?.total ?? null,
    }))
  );

describe("engine_v3 prototype scaffold", () => {
  test("same seed yields the same 3-week prototype picks and audit shape", () => {
    const first = generateV3PrototypeProgram({
      seed: "v3-deterministic-anchor",
      experienceLevel: "Intermediate",
      capabilityProfile: baseCapabilityProfile,
    });
    const second = generateV3PrototypeProgram({
      seed: "v3-deterministic-anchor",
      experienceLevel: "Intermediate",
      capabilityProfile: baseCapabilityProfile,
    });

    expect(extractPickSignature(first)).toEqual(extractPickSignature(second));
    expect(first.audit.uniquenessBySlot).toEqual(second.audit.uniquenessBySlot);
    expect(first.audit.volumeSummary).toEqual(second.audit.volumeSummary);
    expect(first.audit.missingSlots).toEqual([]);
  });

  test("3-week block covers every target family in schedule and picks", () => {
    const schedule = buildThreeDayThreeWeekRotation({
      seed: "v3-coverage",
    });
    const scheduledFamilies = new Set(
      schedule.days.flatMap((day) => day.slots.map((slot) => slot.family))
    );

    expect(Array.from(scheduledFamilies).sort()).toEqual([
      "anti_ext",
      "anti_rot",
      "core",
      "hinge",
      "horiz_pull",
      "horiz_push",
      "squat",
      "vert_pull",
      "vert_push",
    ]);

    const generated = generateV3PrototypeProgram({
      seed: "v3-coverage",
      experienceLevel: "Intermediate",
      capabilityProfile: baseCapabilityProfile,
    });

    expect(generated.audit.missingSlots).toEqual([]);
    expect(
      Object.values(generated.audit.coverageMatrix).every(
        (entry) => entry.scheduledSlotCount > 0 && entry.pickedSlotCount > 0
      )
    ).toBe(true);
  });

  test("experience bias prefers supported options for beginners and freer options for advanced", () => {
    const catalog = adaptExercisesToV3Catalog();
    const machinePress = catalog.find(
      (exercise) => exercise.id === "machine-chest-press"
    ) as V3PrototypeExercise | undefined;
    const barbellBench = catalog.find(
      (exercise) => exercise.id === "barbell-bench-press-paused"
    ) as V3PrototypeExercise | undefined;

    expect(machinePress?.supportProfile).toBe("machine");
    expect(barbellBench?.supportProfile).toBe("free");
    expect(machinePress).toBeTruthy();
    expect(barbellBench).toBeTruthy();

    const slot = {
      id: "bias-slot",
      label: "Main horiz push",
      role: "main" as const,
      family: "horiz_push" as const,
      templateId: "A",
      order: 0,
      required: true,
    };

    const beginnerRanked = rankSlotCandidates({
      slot,
      catalog: [machinePress!, barbellBench!],
      capabilityProfile: baseCapabilityProfile,
      experienceLevel: "Beginner",
      seed: "bias-seed",
    });
    const advancedRanked = rankSlotCandidates({
      slot,
      catalog: [machinePress!, barbellBench!],
      capabilityProfile: baseCapabilityProfile,
      experienceLevel: "Advanced",
      seed: "bias-seed",
    });

    expect(beginnerRanked[0]?.exercise.id).toBe("machine-chest-press");
    expect(advancedRanked[0]?.exercise.id).toBe("barbell-bench-press-paused");
  });

  test("uniqueness scoring penalizes repeats more than same-family variety", () => {
    const recentPicks = [
      {
        exerciseId: "dumbbell-chest-supported-row",
        family: "horiz_pull" as const,
      },
      {
        exerciseId: "machine-seated-row",
        family: "horiz_pull" as const,
      },
    ];

    const repeatedExercise = scoreUniquenessAgainstHistory({
      candidate: {
        id: "dumbbell-chest-supported-row",
        familyKey: "db_row",
        variantKey: "chest_supported",
        families: ["horiz_pull"],
      },
      recentPicks,
    });

    const sameFamilyDifferentExercise = scoreUniquenessAgainstHistory({
      candidate: {
        id: "cable-seated-row",
        familyKey: "cable_row",
        variantKey: "seated",
        families: ["horiz_pull"],
      },
      recentPicks,
    });

    const differentFamily = scoreUniquenessAgainstHistory({
      candidate: {
        id: "goblet-squat",
        familyKey: "goblet_squat",
        variantKey: "standard",
        families: ["squat"],
      },
      recentPicks,
    });

    expect(repeatedExercise).toBeLessThan(sameFamilyDifferentExercise);
    expect(sameFamilyDifferentExercise).toBeLessThan(differentFamily);
  });
});
