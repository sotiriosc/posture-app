import { describe, expect, test } from "vitest";
import { exerciseById } from "@/lib/exercises";
import { planThreeDayAccessorySlots } from "@/lib/program/accessoryPlanner";
import {
  WEEKLY_COVERAGE_TARGETS,
  type WeeklyCoverageAudit,
  type WeeklyCoverageCategory,
} from "@/lib/program/coverageAudit";

const coverageCategories = Object.keys(
  WEEKLY_COVERAGE_TARGETS
) as WeeklyCoverageCategory[];

const makeCoverageAudit = (
  hitOverrides: Partial<Record<WeeklyCoverageCategory, number>> = {}
): WeeklyCoverageAudit => {
  const categoryHits = coverageCategories.reduce(
    (accumulator, category) => {
      const target = WEEKLY_COVERAGE_TARGETS[category];
      const defaultHits = target.priority === "optional" ? 0 : target.min;
      accumulator[category] = hitOverrides[category] ?? defaultHits;
      return accumulator;
    },
    {} as Record<WeeklyCoverageCategory, number>
  );
  const categoryAudits = coverageCategories.reduce(
    (accumulator, category) => {
      const target = WEEKLY_COVERAGE_TARGETS[category];
      const hits = categoryHits[category];
      const deficit = Math.max(0, target.min - hits);
      accumulator[category] = {
        ...target,
        hits,
        deficit,
        met: deficit === 0 && (target.max === undefined || hits <= target.max),
      };
      return accumulator;
    },
    {} as WeeklyCoverageAudit["categoryAudits"]
  );

  return {
    movementPatternsHit: ["push", "pull", "squat", "hinge", "core"],
    majorBodyRegionsHit: ["upper", "lower", "core"],
    missingMustHitCategories: [],
    categoryHits,
    categoryAudits,
    missingMustHitCoverage: coverageCategories.filter(
      (category) =>
        WEEKLY_COVERAGE_TARGETS[category].priority === "must" &&
        categoryAudits[category].deficit > 0
    ),
    underHitShouldCoverage: coverageCategories.filter(
      (category) =>
        WEEKLY_COVERAGE_TARGETS[category].priority === "should" &&
        categoryAudits[category].deficit > 0
    ),
    optionalCoverageOpportunities: coverageCategories.filter(
      (category) =>
        WEEKLY_COVERAGE_TARGETS[category].priority === "optional" &&
        categoryAudits[category].deficit > 0
    ),
  };
};

const pickExercises = (ids: string[]) =>
  ids
    .map((id) => exerciseById(id))
    .filter((exercise): exercise is NonNullable<ReturnType<typeof exerciseById>> =>
      Boolean(exercise)
    );

describe("3-day accessory planner", () => {
  test("beginner gym Day 1 can open a chest-isolation expansion without changing required main roles", () => {
    const mains = pickExercises([
      "machine-chest-press",
      "machine-seated-row",
      "machine-lat-pulldown",
    ]);

    expect(mains[0]?.slotRoles).toContain("pushCompound");
    expect(mains[1]?.slotRoles).toContain("pullHorizontal");
    expect(mains[2]?.slotRoles).toContain("pullVertical");

    const plan = planThreeDayAccessorySlots({
      dayTitle: "Back + Chest",
      targetAccessoryCount: 2,
      selectedMainExercises: mains,
      weeklyCoverageAudit: makeCoverageAudit({
        chest: 1,
        chestIsolation: 0,
      }),
      phase: "skill",
      experience: "beginner",
      trainingContext: "gym",
      goal: "Build strength",
      stableGymEquipment: true,
    });

    expect(plan.map((slot) => slot.role)).toEqual([
      "accessoryRearDelt",
      "accessoryChestIsolation",
    ]);
    expect(plan[1]?.isExpansion).toBe(true);
  });

  test("Day 1 accessory expansion changes with phase and weekly chest deficit", () => {
    const mains = pickExercises([
      "machine-chest-press",
      "machine-seated-row",
      "machine-lat-pulldown",
    ]);

    const skillDeficitPlan = planThreeDayAccessorySlots({
      dayTitle: "Back + Chest",
      targetAccessoryCount: 2,
      selectedMainExercises: mains,
      weeklyCoverageAudit: makeCoverageAudit({
        chest: 1,
        chestIsolation: 0,
      }),
      phase: "skill",
      experience: "beginner",
      trainingContext: "gym",
      goal: "Build strength",
      stableGymEquipment: true,
    });
    const activationPlan = planThreeDayAccessorySlots({
      dayTitle: "Back + Chest",
      targetAccessoryCount: 2,
      selectedMainExercises: mains,
      weeklyCoverageAudit: makeCoverageAudit({
        chest: 1,
        chestIsolation: 0,
      }),
      phase: "activation",
      experience: "beginner",
      trainingContext: "gym",
      goal: "Build strength",
      stableGymEquipment: true,
    });
    const coveredChestPlan = planThreeDayAccessorySlots({
      dayTitle: "Back + Chest",
      targetAccessoryCount: 2,
      selectedMainExercises: mains,
      weeklyCoverageAudit: makeCoverageAudit({
        chest: 2,
        chestIsolation: 1,
      }),
      phase: "skill",
      experience: "beginner",
      trainingContext: "gym",
      goal: "Build strength",
      stableGymEquipment: true,
    });

    expect(skillDeficitPlan[1]?.role).toBe("accessoryChestIsolation");
    expect(activationPlan[1]?.role).not.toBe("accessoryChestIsolation");
    expect(coveredChestPlan[1]?.role).not.toBe("accessoryChestIsolation");
  });

  test("expansion slots preserve 3-day day identity", () => {
    const shouldersPlan = planThreeDayAccessorySlots({
      dayTitle: "Shoulders + Arms",
      targetAccessoryCount: 3,
      selectedMainExercises: pickExercises([
        "dumbbell-shoulder-press",
        "cable-lateral-raise",
        "cable-rear-delt-fly",
      ]),
      weeklyCoverageAudit: makeCoverageAudit({
        delts: 0,
        arms: 0,
        carries: 0,
      }),
      phase: "skill",
      experience: "beginner",
      trainingContext: "gym",
      goal: "Build strength",
      stableGymEquipment: true,
    });
    const legsPlan = planThreeDayAccessorySlots({
      dayTitle: "Legs + Abs",
      targetAccessoryCount: 3,
      selectedMainExercises: pickExercises([
        "machine-leg-press",
        "db-rdl",
        "dumbbell-step-up-loaded",
      ]),
      weeklyCoverageAudit: makeCoverageAudit({
        core: 0,
        calves: 0,
        carries: 0,
      }),
      phase: "growth",
      experience: "intermediate",
      trainingContext: "gym",
      goal: "Build strength",
      stableGymEquipment: true,
    });

    expect(shouldersPlan.map((slot) => slot.role)).toEqual([
      "accessoryTriceps",
      "accessoryBiceps",
      "accessoryCarry",
    ]);
    expect(shouldersPlan.every((slot) => ["push", "pull", "core"].includes(slot.lane))).toBe(
      true
    );
    expect(shouldersPlan[2]?.isExpansion).toBe(true);

    expect(legsPlan.every((slot) => ["lower", "core"].includes(slot.lane))).toBe(true);
    expect(legsPlan[2]?.isExpansion).toBe(true);
  });

  test("carry and chest-isolation metadata stay distinct from core-stability and rear-delt work", () => {
    expect(exerciseById("farmers-carry")?.carryType).toBe("carry");
    expect(exerciseById("farmers-carry")?.accessoryRoles).toContain("accessoryCarry");

    expect(exerciseById("band-suitcase-march")?.carryType).toBe("coreStability");
    expect(exerciseById("band-suitcase-march")?.accessoryRoles).toContain(
      "accessoryCoreStability"
    );
    expect(exerciseById("band-suitcase-march")?.accessoryRoles ?? []).not.toContain(
      "accessoryCarry"
    );

    expect(exerciseById("cable-rear-delt-fly")?.accessoryRoles).toContain(
      "accessoryRearDelt"
    );
    expect(exerciseById("cable-rear-delt-fly")?.accessoryRoles ?? []).not.toContain(
      "accessoryChestIsolation"
    );
    expect(exerciseById("dumbbell-chest-fly")?.accessoryRoles).toContain(
      "accessoryChestIsolation"
    );
  });
});
