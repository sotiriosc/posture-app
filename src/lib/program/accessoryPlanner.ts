import type { Exercise, ExerciseAccessoryRole } from "@/lib/exercises";
import type { WeeklyCoverageAudit, WeeklyCoverageCategory } from "@/lib/program/coverageAudit";

export type AccessoryPlannerPhase = "activation" | "skill" | "growth";
export type AccessoryPlannerExperience = "beginner" | "intermediate" | "advanced";
export type AccessoryPlannerTrainingContext = "gym" | "home";
export type AccessoryPlannerLane = "push" | "pull" | "lower" | "core" | "chest" | "back";

export type ThreeDayAccessorySlotPlan = {
  role: ExerciseAccessoryRole;
  alternatives: ExerciseAccessoryRole[];
  lane: AccessoryPlannerLane;
  slotKind: string;
  required: boolean;
  isExpansion: boolean;
};

type ThreeDayAccessoryPlannerParams = {
  dayTitle: string;
  targetAccessoryCount: number;
  selectedMainExercises: Exercise[];
  weeklyCoverageAudit: WeeklyCoverageAudit;
  phase: AccessoryPlannerPhase;
  experience: AccessoryPlannerExperience;
  trainingContext: AccessoryPlannerTrainingContext;
  goal: string;
  stableGymEquipment: boolean;
  recentAccessoryRoles?: ExerciseAccessoryRole[];
  fatigueOverlap?: string[];
};

const normalizeToken = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_");

const resolveDayKey = (dayTitle: string) => normalizeToken(dayTitle);

const resolveGoalKey = (goal: string) => normalizeToken(goal);

const exerciseHasPattern = (exercise: Exercise, pattern: string) =>
  (exercise.movementPattern ?? []).some((value) => normalizeToken(value) === normalizeToken(pattern));

const scoreCoverageNeed = (
  audit: WeeklyCoverageAudit,
  categories: Array<{ category: WeeklyCoverageCategory; weight: number }>
) =>
  categories.reduce((total, entry) => {
    const deficit = audit.categoryAudits[entry.category]?.deficit ?? 0;
    return total + deficit * entry.weight;
  }, 0);

const scoreAccessoryRoleNeed = (
  role: ExerciseAccessoryRole,
  audit: WeeklyCoverageAudit
) => {
  switch (role) {
    case "accessoryChestIsolation":
      return scoreCoverageNeed(audit, [
        { category: "chest", weight: 3 },
        { category: "chestIsolation", weight: 1.25 },
      ]);
    case "accessoryBackThickness":
      return scoreCoverageNeed(audit, [{ category: "back", weight: 2 }]);
    case "accessoryBackWidth":
      return scoreCoverageNeed(audit, [{ category: "back", weight: 2.25 }]);
    case "accessoryRearDelt":
      return scoreCoverageNeed(audit, [
        { category: "rearDeltIsolation", weight: 1.75 },
        { category: "delts", weight: 1 },
      ]);
    case "accessoryLateralDelt":
      return scoreCoverageNeed(audit, [{ category: "delts", weight: 1.5 }]);
    case "accessoryBiceps":
    case "accessoryTriceps":
      return scoreCoverageNeed(audit, [{ category: "arms", weight: 1.5 }]);
    case "accessoryCoreStability":
      return scoreCoverageNeed(audit, [
        { category: "core", weight: 2.5 },
        { category: "antiRotation", weight: 1.5 },
      ]);
    case "accessoryCarry":
      return scoreCoverageNeed(audit, [
        { category: "carries", weight: 2 },
        { category: "core", weight: 0.5 },
      ]);
    case "accessoryCalves":
      return scoreCoverageNeed(audit, [{ category: "calves", weight: 2 }]);
    case "accessoryHamstring":
      return scoreCoverageNeed(audit, [{ category: "posteriorChain", weight: 1.5 }]);
    case "accessoryGlute":
      return scoreCoverageNeed(audit, [{ category: "posteriorChain", weight: 1.25 }]);
    case "accessoryShoulderSupport":
      return scoreCoverageNeed(audit, [
        { category: "rearDeltIsolation", weight: 1.25 },
        { category: "delts", weight: 0.75 },
      ]);
    default:
      return 0;
  }
};

const scoreRoleWithContext = (
  params: ThreeDayAccessoryPlannerParams,
  role: ExerciseAccessoryRole
) => {
  const { weeklyCoverageAudit, phase, trainingContext, recentAccessoryRoles, fatigueOverlap, goal } =
    params;
  let score = scoreAccessoryRoleNeed(role, weeklyCoverageAudit);
  const goalKey = resolveGoalKey(goal);
  const recentPenalty = recentAccessoryRoles?.includes(role) ? 0.5 : 0;

  if (role === "accessoryChestIsolation") {
    if (phase !== "skill") score -= 6;
    if (trainingContext !== "gym") score -= 6;
    if (goalKey === "improve_posture" || goalKey === "reduce_pain") score -= 3;
  }

  if (role === "accessoryCarry") {
    if (trainingContext !== "gym") score -= 2;
    if (phase === "growth") score -= 0.75;
    if (fatigueOverlap?.includes("pull")) score -= 0.25;
  }

  if (role === "accessoryCoreStability" && fatigueOverlap?.includes("hinge")) {
    score += 0.35;
  }

  if (
    (role === "accessoryShoulderSupport" || role === "accessoryRearDelt") &&
    goalKey === "improve_posture"
  ) {
    score += 0.5;
  }

  return score - recentPenalty;
};

const planBackChestSlots = (params: ThreeDayAccessoryPlannerParams): ThreeDayAccessorySlotPlan[] => {
  const {
    targetAccessoryCount,
    selectedMainExercises,
    phase,
    trainingContext,
    stableGymEquipment,
    goal,
    weeklyCoverageAudit,
    fatigueOverlap,
  } = params;
  if (targetAccessoryCount <= 0) return [];
  const goalKey = resolveGoalKey(goal);
  const hasHorizontalPull = selectedMainExercises.some((exercise) =>
    exerciseHasPattern(exercise, "horizontalPull")
  );
  const hasVerticalPull = selectedMainExercises.some((exercise) =>
    exerciseHasPattern(exercise, "verticalPull")
  );
  const chestDeficit = weeklyCoverageAudit.categoryAudits.chest?.deficit ?? 0;
  const fatigueAllowsChestExpansion = !fatigueOverlap?.includes("verticalPush");
  const canUseChestExpansion =
    targetAccessoryCount >= 2 &&
    phase === "skill" &&
    trainingContext === "gym" &&
    stableGymEquipment &&
    chestDeficit > 0 &&
    hasHorizontalPull &&
    hasVerticalPull &&
    fatigueAllowsChestExpansion &&
    goalKey !== "improve_posture" &&
    goalKey !== "reduce_pain";

  const slots: ThreeDayAccessorySlotPlan[] = [
    {
      role: "accessoryRearDelt",
      alternatives: ["accessoryShoulderSupport"],
      lane: "back",
      slotKind: "accessoryBackRearDelt",
      required: true,
      isExpansion: false,
    },
  ];

  if (targetAccessoryCount >= 2) {
    if (canUseChestExpansion) {
      slots.push({
        role: "accessoryChestIsolation",
        alternatives: ["accessoryShoulderSupport", "accessoryBackWidth"],
        lane: "chest",
        slotKind: "accessoryChestExpansion",
        required: false,
        isExpansion: true,
      });
    } else {
      const supportCandidates: ExerciseAccessoryRole[] = [
        "accessoryShoulderSupport",
        "accessoryBackWidth",
        "accessoryBackThickness",
      ];
      const bestSupportRole =
        supportCandidates
          .map((role) => ({ role, score: scoreRoleWithContext(params, role) }))
          .sort((left, right) => right.score - left.score)[0]?.role ?? "accessoryShoulderSupport";
      slots.push({
        role: bestSupportRole,
        alternatives: supportCandidates.filter((role) => role !== bestSupportRole),
        lane: "back",
        slotKind: "accessoryBackSupport",
        required: true,
        isExpansion: false,
      });
    }
  }

  return slots.slice(0, targetAccessoryCount);
};

const planShouldersArmsSlots = (
  params: ThreeDayAccessoryPlannerParams
): ThreeDayAccessorySlotPlan[] => {
  const { targetAccessoryCount, experience } = params;
  if (targetAccessoryCount <= 0) return [];
  const slots: ThreeDayAccessorySlotPlan[] = [
    {
      role: "accessoryTriceps",
      alternatives: [],
      lane: "push",
      slotKind: "accessoryTriIso",
      required: true,
      isExpansion: false,
    },
    {
      role: "accessoryBiceps",
      alternatives: [],
      lane: "pull",
      slotKind: "accessoryBiIso",
      required: true,
      isExpansion: false,
    },
  ];

  if (targetAccessoryCount >= 3) {
    if (experience === "advanced") {
      slots.push({
        role: "accessoryTriceps",
        alternatives: [],
        lane: "push",
        slotKind: "accessoryTriIsoVariant",
        required: true,
        isExpansion: false,
      });
    } else {
      slots.push({
        role: "accessoryCarry",
        alternatives: ["accessoryShoulderSupport", "accessoryRearDelt"],
        lane: "core",
        slotKind: "accessoryCarryExpansion",
        required: false,
        isExpansion: true,
      });
    }
  }

  if (targetAccessoryCount >= 4) {
    slots.push({
      role: "accessoryBiceps",
      alternatives: [],
      lane: "pull",
      slotKind: "accessoryBiIsoVariant",
      required: true,
      isExpansion: false,
    });
  }

  return slots.slice(0, targetAccessoryCount);
};

const planLegsAbsSlots = (params: ThreeDayAccessoryPlannerParams): ThreeDayAccessorySlotPlan[] => {
  const { targetAccessoryCount, phase, trainingContext } = params;
  if (targetAccessoryCount <= 0) return [];
  const slots: ThreeDayAccessorySlotPlan[] = [
    {
      role: "accessoryCoreStability",
      alternatives: ["accessoryCarry"],
      lane: "core",
      slotKind: "accessoryCorePrimary",
      required: true,
      isExpansion: false,
    },
    {
      role: "accessoryCalves",
      alternatives: [],
      lane: "lower",
      slotKind: "accessoryCalvesPrimary",
      required: true,
      isExpansion: false,
    },
  ];

  if (targetAccessoryCount >= 3) {
    const optionalRoles: ExerciseAccessoryRole[] = [
      "accessoryCoreStability",
      "accessoryHamstring",
      "accessoryGlute",
      ...(trainingContext === "gym" ? (["accessoryCarry"] as ExerciseAccessoryRole[]) : []),
    ];
    const bestRole =
      optionalRoles
        .map((role) => ({ role, score: scoreRoleWithContext(params, role) }))
        .sort((left, right) => right.score - left.score)[0]?.role ?? "accessoryCoreStability";
    const lane = bestRole === "accessoryCoreStability" || bestRole === "accessoryCarry" ? "core" : "lower";
    slots.push({
      role: bestRole,
      alternatives: optionalRoles.filter((role) => role !== bestRole),
      lane,
      slotKind:
        bestRole === "accessoryCoreStability"
          ? "accessoryCoreExpansion"
          : bestRole === "accessoryCarry"
          ? "accessoryCarryExpansion"
          : "accessoryLowerExpansion",
      required: phase !== "activation",
      isExpansion: true,
    });
  }

  return slots.slice(0, targetAccessoryCount);
};

export const planThreeDayAccessorySlots = (
  params: ThreeDayAccessoryPlannerParams
): ThreeDayAccessorySlotPlan[] => {
  const dayKey = resolveDayKey(params.dayTitle);
  if (dayKey === "back_chest") {
    return planBackChestSlots(params);
  }
  if (dayKey === "shoulders_arms") {
    return planShouldersArmsSlots(params);
  }
  if (dayKey === "legs_abs") {
    return planLegsAbsSlots(params);
  }
  return [];
};
