import type { Exercise, ExerciseAccessoryRole } from "@/lib/exercises";
import type { WeeklyCoverageAudit, WeeklyCoverageCategory } from "@/lib/program/coverageAudit";
import type { WeeklyQuotaAudit, WeeklyQuotaCategory } from "@/lib/program/quotaRegistry";

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
  weeklyQuotaAudit?: WeeklyQuotaAudit;
  phase: AccessoryPlannerPhase;
  experience: AccessoryPlannerExperience;
  trainingContext: AccessoryPlannerTrainingContext;
  goal: string;
  stableGymEquipment: boolean;
  recentAccessoryRoles?: ExerciseAccessoryRole[];
  fatigueOverlap?: string[];
};

const BACK_CHEST_SUPPORT_ROLES: ExerciseAccessoryRole[] = [
  "accessoryBackWidth",
  "accessoryBackThickness",
  "accessoryRearDelt",
  "accessoryShoulderSupport",
];

const BACK_CHEST_POSTERIOR_SUPPORT_ROLES: ExerciseAccessoryRole[] = [
  "accessoryRearDelt",
  "accessoryShoulderSupport",
];

const normalizeToken = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_");

const resolveDayKey = (dayTitle: string) => normalizeToken(dayTitle);

const resolveGoalKey = (goal: string) => normalizeToken(goal);

const resolveAccessoryRoleCluster = (role: ExerciseAccessoryRole) => {
  switch (role) {
    case "accessoryChestIsolation":
      return "chest";
    case "accessoryBackWidth":
      return "back_width";
    case "accessoryBackThickness":
      return "back_thickness";
    case "accessoryRearDelt":
    case "accessoryShoulderSupport":
      return "rear_support";
    case "accessoryCoreStability":
      return "core";
    case "accessoryCarry":
      return "carry";
    case "accessoryHamstring":
      return "hamstring";
    case "accessoryGlute":
      return "glute";
    case "accessoryCalves":
      return "calves";
    case "accessoryBiceps":
      return "biceps";
    case "accessoryTriceps":
      return "triceps";
    case "accessoryLateralDelt":
      return "lateral_delt";
    default:
      return role;
  }
};

const exerciseHasPattern = (exercise: Exercise, pattern: string) =>
  (exercise.movementPattern ?? []).some((value) => normalizeToken(value) === normalizeToken(pattern));

const exerciseHasSlotRole = (exercise: Exercise, role: string) =>
  (exercise.slotRoles ?? []).some((value) => normalizeToken(value) === normalizeToken(role));

const exerciseHasCoverageTag = (exercise: Exercise, tag: WeeklyQuotaCategory) =>
  (exercise.weeklyCoverageTags ?? []).some(
    (value) => normalizeToken(value) === normalizeToken(tag)
  );

const scoreCoverageNeed = (
  audit: WeeklyCoverageAudit,
  categories: Array<{ category: WeeklyCoverageCategory; weight: number }>
) =>
  categories.reduce((total, entry) => {
    const deficit = audit.categoryAudits[entry.category]?.deficit ?? 0;
    return total + deficit * entry.weight;
  }, 0);

const scoreQuotaNeed = (
  audit: WeeklyQuotaAudit | undefined,
  categories: Array<{ category: WeeklyQuotaCategory; weight: number }>
) =>
  categories.reduce((total, entry) => {
    const deficit = audit?.audits[entry.category]?.deficit ?? 0;
    return total + deficit * entry.weight;
  }, 0);

const scoreAccessoryRoleNeed = (
  role: ExerciseAccessoryRole,
  audit: WeeklyCoverageAudit,
  quotaAudit?: WeeklyQuotaAudit
) => {
  switch (role) {
    case "accessoryChestIsolation":
      return (
        scoreCoverageNeed(audit, [
          { category: "chest", weight: 3 },
          { category: "chestIsolation", weight: 1.25 },
        ]) +
        scoreQuotaNeed(quotaAudit, [
          { category: "chest", weight: 2.25 },
          { category: "pushCompound", weight: 0.5 },
          { category: "chestIsolation", weight: 1.25 },
        ])
      );
    case "accessoryBackThickness":
      return (
        scoreCoverageNeed(audit, [{ category: "back", weight: 2 }]) +
        scoreQuotaNeed(quotaAudit, [
          { category: "back", weight: 1.5 },
          { category: "horizontalPull", weight: 1.75 },
        ])
      );
    case "accessoryBackWidth":
      return (
        scoreCoverageNeed(audit, [{ category: "back", weight: 2.25 }]) +
        scoreQuotaNeed(quotaAudit, [
          { category: "back", weight: 1.5 },
          { category: "verticalPull", weight: 1.75 },
        ])
      );
    case "accessoryRearDelt":
      return (
        scoreCoverageNeed(audit, [
          { category: "rearDeltIsolation", weight: 1.75 },
          { category: "delts", weight: 1 },
        ]) +
        scoreQuotaNeed(quotaAudit, [
          { category: "delts", weight: 1.25 },
          { category: "back", weight: 0.5 },
          { category: "rearDeltIsolation", weight: 1.5 },
        ])
      );
    case "accessoryLateralDelt":
      return (
        scoreCoverageNeed(audit, [{ category: "delts", weight: 1.5 }]) +
        scoreQuotaNeed(quotaAudit, [{ category: "delts", weight: 1.5 }])
      );
    case "accessoryBiceps":
    case "accessoryTriceps":
      return (
        scoreCoverageNeed(audit, [{ category: "arms", weight: 1.5 }]) +
        scoreQuotaNeed(quotaAudit, [{ category: "arms", weight: 1.5 }])
      );
    case "accessoryCoreStability":
      return (
        scoreCoverageNeed(audit, [
          { category: "core", weight: 2.5 },
          { category: "antiRotation", weight: 1.5 },
        ]) +
        scoreQuotaNeed(quotaAudit, [
          { category: "core", weight: 2 },
          { category: "coreStability", weight: 2.25 },
          { category: "antiRotation", weight: 1.25 },
        ])
      );
    case "accessoryCarry":
      return (
        scoreCoverageNeed(audit, [
          { category: "carries", weight: 2 },
          { category: "core", weight: 0.5 },
        ]) +
        scoreQuotaNeed(quotaAudit, [
          { category: "carry", weight: 2.5 },
          { category: "core", weight: 0.5 },
        ])
      );
    case "accessoryCalves":
      return (
        scoreCoverageNeed(audit, [{ category: "calves", weight: 2 }]) +
        scoreQuotaNeed(quotaAudit, [{ category: "calves", weight: 2 }])
      );
    case "accessoryHamstring":
      return (
        scoreCoverageNeed(audit, [{ category: "posteriorChain", weight: 1.5 }]) +
        scoreQuotaNeed(quotaAudit, [
          { category: "posteriorChain", weight: 1.5 },
          { category: "hinge", weight: 0.75 },
        ])
      );
    case "accessoryGlute":
      return (
        scoreCoverageNeed(audit, [{ category: "posteriorChain", weight: 1.25 }]) +
        scoreQuotaNeed(quotaAudit, [
          { category: "posteriorChain", weight: 1.25 },
          { category: "unilateralLower", weight: 0.5 },
        ])
      );
    case "accessoryShoulderSupport":
      return (
        scoreCoverageNeed(audit, [
          { category: "rearDeltIsolation", weight: 1.25 },
          { category: "delts", weight: 0.75 },
        ]) +
        scoreQuotaNeed(quotaAudit, [
          { category: "delts", weight: 0.75 },
          { category: "back", weight: 0.5 },
          { category: "rearDeltIsolation", weight: 1.25 },
        ])
      );
    default:
      return 0;
  }
};

const scoreRoleWithContext = (
  params: ThreeDayAccessoryPlannerParams,
  role: ExerciseAccessoryRole
) => {
  const {
    weeklyCoverageAudit,
    weeklyQuotaAudit,
    phase,
    trainingContext,
    stableGymEquipment,
    recentAccessoryRoles,
    fatigueOverlap,
    goal,
  } = params;
  let score = scoreAccessoryRoleNeed(role, weeklyCoverageAudit, weeklyQuotaAudit);
  const goalKey = resolveGoalKey(goal);
  const recentPenalty = recentAccessoryRoles?.includes(role) ? 0.5 : 0;
  const recentClusterPenalty = recentAccessoryRoles?.some(
    (recentRole) => resolveAccessoryRoleCluster(recentRole) === resolveAccessoryRoleCluster(role)
  )
    ? 0.35
    : 0;

  if (role === "accessoryChestIsolation") {
    if (phase === "activation") score -= 2.5;
    if (phase === "growth") score += 0.5;
    if (trainingContext !== "gym" && !stableGymEquipment) score -= 5;
    if (!stableGymEquipment && trainingContext === "gym") score -= 2;
    if (goalKey === "improve_posture" || goalKey === "reduce_pain") score -= 1.5;
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

  return score - recentPenalty - recentClusterPenalty;
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
    exerciseHasPattern(exercise, "horizontalPull") ||
    exerciseHasSlotRole(exercise, "pullHorizontal") ||
    exerciseHasCoverageTag(exercise, "horizontalPull") ||
    exerciseHasCoverageTag(exercise, "horizontalPullTrue")
  );
  const hasVerticalPull = selectedMainExercises.some((exercise) =>
    exerciseHasPattern(exercise, "verticalPull") ||
    exerciseHasSlotRole(exercise, "pullVertical") ||
    exerciseHasCoverageTag(exercise, "verticalPull") ||
    exerciseHasCoverageTag(exercise, "verticalPullTrue")
  );
  const chestDeficit = weeklyCoverageAudit.categoryAudits.chest?.deficit ?? 0;
  const fatigueAllowsChestExpansion = !fatigueOverlap?.includes("verticalPush");
  const supportRoleScores = BACK_CHEST_SUPPORT_ROLES.map((role) => ({
    role,
    score: scoreRoleWithContext(params, role),
  })).sort((left, right) => {
    if (right.score !== left.score) return right.score - left.score;
    return left.role.localeCompare(right.role);
  });
  const posteriorSupportRoleScores = BACK_CHEST_POSTERIOR_SUPPORT_ROLES.map((role) => ({
    role,
    score: scoreRoleWithContext(params, role),
  })).sort((left, right) => {
    if (right.score !== left.score) return right.score - left.score;
    return left.role.localeCompare(right.role);
  });
  const bestSupportRole = supportRoleScores[0]?.role ?? "accessoryRearDelt";
  const bestPosteriorSupportRole =
    posteriorSupportRoleScores[0]?.role ?? "accessoryRearDelt";
  const chestExpansionScore = scoreRoleWithContext(params, "accessoryChestIsolation");
  const canUseChestExpansion =
    targetAccessoryCount >= 2 &&
    chestDeficit > 0 &&
    hasHorizontalPull &&
    hasVerticalPull &&
    phase !== "activation" &&
    fatigueAllowsChestExpansion &&
    (trainingContext === "gym" ? stableGymEquipment : true);
  const shouldSpendOnChestExpansion =
    canUseChestExpansion &&
    chestExpansionScore >= (supportRoleScores[0]?.score ?? 0) - (phase === "skill" ? 1 : 0.35);

  const chooseSupportRole = (usedRoles: ExerciseAccessoryRole[]) =>
    supportRoleScores
      .map((entry) => {
        let adjustedScore = entry.score;
        if (usedRoles.includes(entry.role)) adjustedScore -= 4;
        if (
          usedRoles.some(
            (usedRole) =>
              resolveAccessoryRoleCluster(usedRole) === resolveAccessoryRoleCluster(entry.role)
          )
        ) {
          adjustedScore -= 1.25;
        }
        return {
          role: entry.role,
          score: adjustedScore,
        };
      })
      .sort((left, right) => {
        if (right.score !== left.score) return right.score - left.score;
        return left.role.localeCompare(right.role);
      })[0]?.role ?? bestSupportRole;

  const resolveSupportSlotKind = (role: ExerciseAccessoryRole) =>
    role === "accessoryRearDelt" ? "accessoryBackRearDelt" : "accessoryBackSupport";

  const primarySupportRole = shouldSpendOnChestExpansion
    ? bestPosteriorSupportRole
    : bestSupportRole;
  const slots: ThreeDayAccessorySlotPlan[] = [
    {
      role: primarySupportRole,
      alternatives: BACK_CHEST_SUPPORT_ROLES.filter((role) => role !== primarySupportRole),
      lane: "back",
      slotKind: resolveSupportSlotKind(primarySupportRole),
      required: true,
      isExpansion: false,
    },
  ];

  if (targetAccessoryCount >= 2) {
    if (shouldSpendOnChestExpansion) {
      slots.push({
        role: "accessoryChestIsolation",
        alternatives: BACK_CHEST_SUPPORT_ROLES,
        lane: "chest",
        slotKind: "accessoryChestExpansion",
        required: false,
        isExpansion: true,
      });
    } else {
      const secondarySupportRole = chooseSupportRole([primarySupportRole]);
      slots.push({
        role: secondarySupportRole,
        alternatives: BACK_CHEST_SUPPORT_ROLES.filter((role) => role !== secondarySupportRole),
        lane: "back",
        slotKind: resolveSupportSlotKind(secondarySupportRole),
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
