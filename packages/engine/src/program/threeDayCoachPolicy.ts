import type {
  Exercise,
  ExerciseAccessoryRole,
  ExerciseSlotRole,
} from "@/lib/exercises";
import type { Equipment } from "@/lib/equipment";
import type { ProgramDay } from "@/lib/types";

export type ThreeDayCoachDayKey = "back_chest" | "shoulders_arms" | "legs_abs";
export type ThreeDayCoachPhase = "activation" | "skill" | "growth";
export type ThreeDayCoachExperience = "beginner" | "intermediate" | "advanced";
export type ThreeDayCoachTrainingContext = "gym" | "home";
export type ThreeDayCoachPainSeverity = "low" | "medium" | "high";
export type ThreeDayCoachSection = "main" | "accessory" | "warmup" | "activation" | "cooldown";

export type BackChestCoachAccessoryFamily =
  | "chest_isolation"
  | "back_thickness"
  | "back_width"
  | "pullover_serratus"
  | "rear_delt_support"
  | "shoulder_support"
  | "other";

export type CoreCoachFamily =
  | "anti_extension"
  | "anti_rotation"
  | "lateral_stability"
  | "carry"
  | "brace_hollow"
  | "march_gait_control"
  | "other";

export type LowerUnilateralCoachFamily =
  | "step_up"
  | "reverse_lunge"
  | "split_squat"
  | "bulgarian_split_squat"
  | "walking_lunge"
  | "lateral_lunge_cossack"
  | "other";

export type ScoreWithReasons = {
  score: number;
  reasons: string[];
};

const normalizeCoachToken = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

export const resolveThreeDayCoachDayKey = (
  dayTitle?: string | null
): ThreeDayCoachDayKey | null => {
  const token = normalizeCoachToken(dayTitle ?? "");
  if (token === "back_chest") return "back_chest";
  if (token === "shoulders_arms") return "shoulders_arms";
  if (token === "legs_abs") return "legs_abs";
  return null;
};

const descriptorFor = (exercise: Exercise) =>
  `${exercise.id} ${exercise.name} ${exercise.familyKey ?? ""} ${
    exercise.variantKey ?? ""
  }`.toLowerCase();

const tokenSet = (values?: string[]) =>
  new Set((values ?? []).map((value) => normalizeCoachToken(value)));

const equipmentSet = (availableEquipment?: Iterable<Equipment>) =>
  availableEquipment instanceof Set
    ? availableEquipment
    : new Set(availableEquipment ?? []);

const exerciseHasSlotRole = (exercise: Exercise, role: ExerciseSlotRole) =>
  exercise.slotRoles?.includes(role) ?? false;

const exerciseHasAccessoryRole = (exercise: Exercise, role: ExerciseAccessoryRole) =>
  exercise.accessoryRoles?.includes(role) ?? false;

const hasPattern = (exercise: Exercise, pattern: string) =>
  tokenSet(exercise.movementPattern).has(normalizeCoachToken(pattern));

const hasWeeklyTag = (exercise: Exercise, tag: string) =>
  tokenSet(exercise.weeklyCoverageTags).has(normalizeCoachToken(tag));

const isRearDeltDescriptor = (exercise: Exercise) => {
  const descriptor = descriptorFor(exercise);
  const tags = tokenSet(exercise.tags);
  const muscles = tokenSet(exercise.muscleGroups);
  return (
    descriptor.includes("rear delt") ||
    descriptor.includes("rear-delt") ||
    descriptor.includes("reverse pec deck") ||
    descriptor.includes("reverse-pec-deck") ||
    tags.has("rear_delt") ||
    tags.has("reardelt") ||
    muscles.has("rear_delts") ||
    muscles.has("rear_delt")
  );
};

const isFacePullOrScapSupportDescriptor = (exercise: Exercise) => {
  const descriptor = descriptorFor(exercise);
  const tags = tokenSet(exercise.tags);
  return (
    descriptor.includes("face pull") ||
    descriptor.includes("face-pull") ||
    descriptor.includes("external rotation") ||
    descriptor.includes("external-rotation") ||
    descriptor.includes("pull apart") ||
    descriptor.includes("pull-apart") ||
    descriptor.includes("prone y") ||
    descriptor.includes("prone-y") ||
    descriptor.includes("ytw") ||
    tags.has("scap") ||
    tags.has("scapular") ||
    tags.has("rotator_cuff") ||
    tags.has("external_rotation")
  );
};

export const isBackChestTruthfulChestIsolation = (exercise: Exercise) => {
  if (isRearDeltDescriptor(exercise)) return false;
  const descriptor = descriptorFor(exercise);
  const family = normalizeCoachToken(exercise.familyKey ?? "");
  const patterns = tokenSet(exercise.movementPattern);
  return (
    exerciseHasSlotRole(exercise, "mainChestIsolation") ||
    exerciseHasAccessoryRole(exercise, "accessoryChestIsolation") ||
    hasWeeklyTag(exercise, "chestIsolation") ||
    family === "chest_fly" ||
    family === "chestfly" ||
    patterns.has("fly") ||
    descriptor.includes("chest fly") ||
    descriptor.includes("chest-fly") ||
    descriptor.includes("pec deck") ||
    descriptor.includes("pec-deck")
  );
};

export const resolveBackChestAccessoryCoachFamily = (
  exercise: Exercise
): BackChestCoachAccessoryFamily => {
  if (isBackChestTruthfulChestIsolation(exercise)) return "chest_isolation";

  const descriptor = descriptorFor(exercise);
  const roles = tokenSet(exercise.accessoryRoles);
  const weeklyTags = tokenSet(exercise.weeklyCoverageTags);
  const patterns = tokenSet(exercise.movementPattern);
  const muscles = tokenSet(exercise.muscleGroups);

  if (isRearDeltDescriptor(exercise)) return "rear_delt_support";
  if (
    descriptor.includes("pullover") ||
    descriptor.includes("serratus") ||
    patterns.has("serratus") ||
    weeklyTags.has("lat_accent")
  ) {
    return "pullover_serratus";
  }
  if (
    roles.has("accessorybackwidth") ||
    roles.has("accessory_back_width") ||
    weeklyTags.has("vertical_pull") ||
    weeklyTags.has("verticalpull") ||
    descriptor.includes("pulldown") ||
    descriptor.includes("pull-down") ||
    descriptor.includes("lat")
  ) {
    return "back_width";
  }
  if (
    roles.has("accessorybackthickness") ||
    roles.has("accessory_back_thickness") ||
    weeklyTags.has("horizontal_pull") ||
    weeklyTags.has("horizontalpull") ||
    descriptor.includes("row")
  ) {
    return "back_thickness";
  }
  if (
    roles.has("accessoryshouldersupport") ||
    roles.has("accessory_shoulder_support") ||
    isFacePullOrScapSupportDescriptor(exercise)
  ) {
    return "shoulder_support";
  }
  if (muscles.has("upper_back") || muscles.has("lats")) return "back_thickness";
  return "other";
};

export const isBackChestPosteriorSupportFamily = (
  family: BackChestCoachAccessoryFamily
) => family === "rear_delt_support" || family === "shoulder_support";

export const isBackChestAccessorySetCoachBalanced = (params: {
  accessories: Exercise[];
  accessoryTargetCount?: number;
  pullCoverageSatisfied?: boolean;
  hasLegalNonSupportAlternative?: boolean;
}) => {
  const {
    accessories,
    accessoryTargetCount = accessories.length,
    pullCoverageSatisfied = false,
    hasLegalNonSupportAlternative = false,
  } = params;
  if (!accessories.length) return false;
  if (accessories.length < Math.min(2, accessoryTargetCount)) return accessories.length > 0;

  const families = accessories.map(resolveBackChestAccessoryCoachFamily);
  const hasPosteriorSupport = families.some(isBackChestPosteriorSupportFamily);
  const hasTruthfulExpansion = families.some(
    (family) =>
      family === "chest_isolation" ||
      family === "back_thickness" ||
      family === "back_width" ||
      family === "pullover_serratus"
  );
  if (families.includes("chest_isolation")) {
    return hasPosteriorSupport;
  }
  if (!hasPosteriorSupport) return false;
  if (hasTruthfulExpansion) return true;
  if (pullCoverageSatisfied && hasLegalNonSupportAlternative) return false;
  return true;
};

export const scoreBackChestAccessoryRoleBudget = (params: {
  dayTitle: string;
  targetAccessoryCount: number;
  selectedMainExercises: Exercise[];
  role: ExerciseAccessoryRole;
  phase: ThreeDayCoachPhase;
  experience: ThreeDayCoachExperience;
  trainingContext: ThreeDayCoachTrainingContext;
  stableGymEquipment: boolean;
  chestDeficit?: number;
  fatigueOverlap?: string[];
  recentAccessoryRoles?: ExerciseAccessoryRole[];
}): ScoreWithReasons => {
  if (resolveThreeDayCoachDayKey(params.dayTitle) !== "back_chest") {
    return { score: 0, reasons: [] };
  }

  const hasHorizontalPull = params.selectedMainExercises.some(
    (exercise) =>
      hasPattern(exercise, "horizontalPull") ||
      exerciseHasSlotRole(exercise, "pullHorizontal") ||
      hasWeeklyTag(exercise, "horizontalPull") ||
      hasWeeklyTag(exercise, "horizontalPullTrue")
  );
  const hasVerticalPull = params.selectedMainExercises.some(
    (exercise) =>
      hasPattern(exercise, "verticalPull") ||
      exerciseHasSlotRole(exercise, "pullVertical") ||
      hasWeeklyTag(exercise, "verticalPull") ||
      hasWeeklyTag(exercise, "verticalPullTrue")
  );
  const pullCoverageSatisfied = hasHorizontalPull && hasVerticalPull;
  const chestExposureLow = (params.chestDeficit ?? 0) > 0;
  const canExpand =
    params.targetAccessoryCount >= 2 &&
    pullCoverageSatisfied &&
    chestExposureLow &&
    !params.fatigueOverlap?.includes("verticalPush") &&
    (params.trainingContext !== "gym" || params.stableGymEquipment || params.phase === "activation");

  let score = 0;
  const reasons: string[] = [];
  const recentRearSupportCluster = params.recentAccessoryRoles?.some((role) =>
    role === "accessoryRearDelt" || role === "accessoryShoulderSupport"
  );

  if (params.role === "accessoryChestIsolation") {
    if (!pullCoverageSatisfied) {
      score -= 5;
      reasons.push("-5 Back + Chest chest accessory waits for pull coverage");
    } else if (canExpand) {
      const bonus =
        params.phase === "activation" && params.experience === "beginner" ? 3.25 : 2.75;
      score += bonus;
      reasons.push(`+${bonus.toFixed(2)} Back + Chest low chest exposure expansion`);
    }
  }

  if (
    params.role === "accessoryBackThickness" ||
    params.role === "accessoryBackWidth"
  ) {
    if (pullCoverageSatisfied) {
      score += 0.75;
      reasons.push("+0.75 Back + Chest rotates support toward back volume");
    }
  }

  if (
    params.role === "accessoryRearDelt" ||
    params.role === "accessoryShoulderSupport"
  ) {
    if (pullCoverageSatisfied && chestExposureLow && params.targetAccessoryCount >= 2) {
      score -= 0.85;
      reasons.push("-0.85 Back + Chest avoids spending every accessory on rear/scap support");
    }
    if (recentRearSupportCluster) {
      score -= 0.45;
      reasons.push("-0.45 Back + Chest recent rear/scap support cluster");
    }
  }

  return { score, reasons };
};

export const shouldAllowBackChestChestIsolationAccessory = (params: {
  dayTitle: string;
  daysPerWeek: 3 | 4 | 5;
  phase: ThreeDayCoachPhase;
  experience: ThreeDayCoachExperience;
  painSeverity: ThreeDayCoachPainSeverity;
  selectedMainExercises: Exercise[];
  selectedAccessoryExercises: Exercise[];
  candidateExercise?: Exercise | null;
  accessoryTargetCount: number;
  existingChestIsolationCount?: number;
  chestDeficit?: number;
}) => {
  if (params.daysPerWeek !== 3) return false;
  if (resolveThreeDayCoachDayKey(params.dayTitle) !== "back_chest") return false;
  if (params.accessoryTargetCount < 2) return false;
  if ((params.existingChestIsolationCount ?? 0) >= 1) return false;
  if (params.painSeverity !== "low") return false;
  if (params.candidateExercise && !isBackChestTruthfulChestIsolation(params.candidateExercise)) {
    return false;
  }
  const hasHorizontalPull = params.selectedMainExercises.some(
    (exercise) =>
      hasPattern(exercise, "horizontalPull") ||
      exerciseHasSlotRole(exercise, "pullHorizontal") ||
      hasWeeklyTag(exercise, "horizontalPull") ||
      hasWeeklyTag(exercise, "horizontalPullTrue")
  );
  const hasVerticalPull = params.selectedMainExercises.some(
    (exercise) =>
      hasPattern(exercise, "verticalPull") ||
      exerciseHasSlotRole(exercise, "pullVertical") ||
      hasWeeklyTag(exercise, "verticalPull") ||
      hasWeeklyTag(exercise, "verticalPullTrue")
  );
  if (!hasHorizontalPull || !hasVerticalPull) return false;
  if (
    !params.selectedAccessoryExercises.some((exercise) =>
      isBackChestPosteriorSupportFamily(resolveBackChestAccessoryCoachFamily(exercise))
    )
  ) {
    return false;
  }
  const lowChestExposure =
    (params.chestDeficit ?? 0) > 0 ||
    params.selectedMainExercises.filter((exercise) => hasWeeklyTag(exercise, "chest")).length <= 1;
  if (!lowChestExposure) return false;
  if (params.phase === "activation") {
    return params.experience === "beginner" || params.experience === "intermediate";
  }
  return true;
};

export const isUprightRowFamilyExercise = (exercise: Exercise) => {
  const descriptor = descriptorFor(exercise);
  return (
    descriptor.includes("upright row") ||
    descriptor.includes("upright-row") ||
    tokenSet(exercise.movementPattern).has("uprightrow")
  );
};

export const canUseUprightRowForThreeDayShoulder = (params: {
  exercise?: Exercise | null;
  experience: ThreeDayCoachExperience;
  painSeverity: ThreeDayCoachPainSeverity;
  painAreas: string[];
  trainingContext: ThreeDayCoachTrainingContext;
  availableEquipment: Iterable<Equipment>;
}) => {
  if (params.exercise && !isUprightRowFamilyExercise(params.exercise)) return false;
  if (params.experience === "beginner") return false;
  if (params.painSeverity !== "low") return false;
  const painTokens = params.painAreas.map((area) => normalizeCoachToken(area));
  if (painTokens.some((token) => token === "shoulders" || token === "shoulder" || token === "neck")) {
    return false;
  }
  if (params.trainingContext !== "gym") return false;
  const available = equipmentSet(params.availableEquipment);
  if (!available.has("cables") && !available.has("dumbbells")) return false;
  if (!params.exercise) return true;
  return params.exercise.equipment.some(
    (equipment) =>
      (equipment === "cables" && available.has("cables")) ||
      (equipment === "dumbbells" && available.has("dumbbells"))
  );
};

export const resolveLowerUnilateralCoachFamily = (
  exercise: Exercise
): LowerUnilateralCoachFamily => {
  const descriptor = descriptorFor(exercise);
  if (descriptor.includes("bulgarian")) return "bulgarian_split_squat";
  if (descriptor.includes("reverse lunge") || descriptor.includes("reverse-lunge")) {
    return "reverse_lunge";
  }
  if (descriptor.includes("walking lunge") || descriptor.includes("walking-lunge")) {
    return "walking_lunge";
  }
  if (
    descriptor.includes("lateral lunge") ||
    descriptor.includes("lateral-lunge") ||
    descriptor.includes("cossack")
  ) {
    return "lateral_lunge_cossack";
  }
  if (descriptor.includes("split squat") || descriptor.includes("split-squat")) {
    return "split_squat";
  }
  if (descriptor.includes("step up") || descriptor.includes("step-up")) return "step_up";
  return "other";
};

export const scoreLowerUnilateralCoachVariety = (params: {
  exercise: Exercise;
  alternativeFamilies: Set<string>;
  recentFamilies: Set<string>;
  selectedFamilies?: Set<string>;
  experience?: ThreeDayCoachExperience;
  phase?: ThreeDayCoachPhase;
}): ScoreWithReasons => {
  const family = resolveLowerUnilateralCoachFamily(params.exercise);
  if (family === "other") return { score: 0, reasons: [] };
  const alternativesExist = params.alternativeFamilies.size > 1;
  let score = 0;
  const reasons: string[] = [];
  if (alternativesExist && family === "step_up") {
    const penalty =
      params.experience && params.experience !== "beginner"
        ? params.phase === "activation"
          ? 4.25
          : 3.1
        : 1.4;
    score -= penalty;
    reasons.push(
      `-${penalty.toFixed(2)} step-up saturation penalty when unilateral alternatives exist`
    );
  }
  if (params.recentFamilies.has(family)) {
    const penalty = family === "step_up" ? 4.25 : 2.35;
    score -= penalty;
    reasons.push(`-${penalty.toFixed(2)} recent unilateral lower family cooldown (${family})`);
  } else if (alternativesExist) {
    score += 0.75;
    reasons.push("+0.75 unilateral lower novel family bonus");
  }
  if (params.selectedFamilies?.has(family)) {
    score -= 3;
    reasons.push(`-3.00 current-week unilateral family duplicate (${family})`);
  }
  return { score, reasons };
};

export const resolveCoreCoachFamily = (exercise: Exercise): CoreCoachFamily => {
  if (exercise.carryType === "carry") return "carry";
  const descriptor = descriptorFor(exercise);
  const patterns = tokenSet(exercise.movementPattern);
  const tags = tokenSet(exercise.tags);
  const weeklyTags = tokenSet(exercise.weeklyCoverageTags);
  if (descriptor.includes("side plank") || descriptor.includes("side-plank")) {
    return "lateral_stability";
  }
  if (
    descriptor.includes("pallof") ||
    descriptor.includes("woodchop") ||
    patterns.has("anti_rotation") ||
    patterns.has("antirotation") ||
    weeklyTags.has("anti_rotation") ||
    weeklyTags.has("antirotation") ||
    tags.has("anti_rotation")
  ) {
    return "anti_rotation";
  }
  if (
    descriptor.includes("dead bug") ||
    descriptor.includes("dead-bug") ||
    descriptor.includes("plank") ||
    descriptor.includes("rollout") ||
    patterns.has("anti_extension") ||
    patterns.has("antiextension")
  ) {
    return "anti_extension";
  }
  if (descriptor.includes("march") || descriptor.includes("gait")) {
    return "march_gait_control";
  }
  if (
    descriptor.includes("brace") ||
    descriptor.includes("hollow") ||
    descriptor.includes("crunch")
  ) {
    return "brace_hollow";
  }
  return "other";
};

export const scoreCoreCoachFamilyVariety = (params: {
  exercise: Exercise;
  recentFamilies: Set<string>;
  selectedFamilies?: Set<string>;
  alternativeFamilies?: Set<string>;
  antiRotationDeficit?: boolean;
  carryDeficit?: boolean;
}): ScoreWithReasons => {
  const family = resolveCoreCoachFamily(params.exercise);
  if (family === "other") return { score: 0, reasons: [] };
  let score = 0;
  const reasons: string[] = [];
  if (params.selectedFamilies?.has(family)) {
    score -= 2.75;
    reasons.push(`-2.75 current-day core family duplicate (${family})`);
  }
  if (params.recentFamilies.has(family)) {
    const penalty = family === "lateral_stability" ? 3.25 : 1.55;
    score -= penalty;
    reasons.push(`-${penalty.toFixed(2)} recent core family cooldown (${family})`);
  } else if ((params.alternativeFamilies?.size ?? 0) > 1) {
    score += 0.65;
    reasons.push("+0.65 core family novelty");
  }
  if ((params.alternativeFamilies?.size ?? 0) > 1 && family === "lateral_stability") {
    score -= 1.55;
    reasons.push("-1.55 lateral core saturation guard");
  }
  if (family === "anti_rotation" && params.antiRotationDeficit) {
    score += 1.4;
    reasons.push("+1.40 anti-rotation quota fit");
  }
  if (family === "carry" && params.carryDeficit) {
    score += 1.5;
    reasons.push("+1.50 carry quota fit");
  }
  return { score, reasons };
};

export const isBackExtensionHingeFamily = (exercise: Exercise) => {
  const descriptor = descriptorFor(exercise);
  return (
    exercise.id === "back-extension" ||
    exercise.id === "back-extension-hold" ||
    descriptor.includes("back extension") ||
    descriptor.includes("back-extension")
  );
};

export const isLowerBackSaferHingeCandidate = (exercise: Exercise) => {
  const descriptor = descriptorFor(exercise);
  return (
    descriptor.includes("hip thrust") ||
    descriptor.includes("hip-thrust") ||
    descriptor.includes("glute bridge") ||
    descriptor.includes("glute-bridge") ||
    descriptor.includes("hamstring curl") ||
    descriptor.includes("hamstring-curl") ||
    exercise.id === "band-rdl" ||
    exercise.id === "db-rdl" ||
    exercise.id === "single-leg-rdl" ||
    exercise.id === "machine-glute-drive"
  );
};

export const scoreLowerBackPainHingeCoachSafety = (params: {
  exercise: Exercise;
  lowBackPain: boolean;
  hasSaferAlternative: boolean;
  slotLane?: string;
  section?: string;
}): ScoreWithReasons => {
  if (!params.lowBackPain || params.section !== "main" || params.slotLane !== "hinge") {
    return { score: 0, reasons: [] };
  }
  if (isBackExtensionHingeFamily(params.exercise)) {
    const penalty = params.hasSaferAlternative ? 18 : 6;
    return {
      score: -penalty,
      reasons: [`-${penalty} lower-back pain demotes back-extension primary hinge`],
    };
  }
  if (isLowerBackSaferHingeCandidate(params.exercise)) {
    return {
      score: 3.25,
      reasons: ["+3.25 lower-back pain safer hinge preference"],
    };
  }
  return { score: 0, reasons: [] };
};

export const scoreThreeDayCoachCandidate = (params: {
  exercise: Exercise;
  section?: ThreeDayCoachSection;
  dayTitle?: string | null;
  slotKind?: string;
  slotRole?: string;
  slotLane?: string;
  phase: ThreeDayCoachPhase;
  experience: ThreeDayCoachExperience;
  painSeverity: ThreeDayCoachPainSeverity;
  painAreas: string[];
  trainingContext: ThreeDayCoachTrainingContext;
  availableEquipment: Iterable<Equipment>;
  selectedMainExercises?: Exercise[];
  selectedAccessoryExercises?: Exercise[];
  recentlyUsedExercises?: Exercise[];
  lowerBackSaferHingeAlternative?: boolean;
}): ScoreWithReasons => {
  const dayKey = resolveThreeDayCoachDayKey(params.dayTitle);
  let score = 0;
  const reasons: string[] = [];

  if (dayKey === "back_chest" && params.section === "accessory") {
    const family = resolveBackChestAccessoryCoachFamily(params.exercise);
    const selectedFamilies = (params.selectedAccessoryExercises ?? []).map(
      resolveBackChestAccessoryCoachFamily
    );
    const hasPullCoverage =
      (params.selectedMainExercises ?? []).some(
        (exercise) => hasPattern(exercise, "horizontalPull") || exerciseHasSlotRole(exercise, "pullHorizontal")
      ) &&
      (params.selectedMainExercises ?? []).some(
        (exercise) => hasPattern(exercise, "verticalPull") || exerciseHasSlotRole(exercise, "pullVertical")
      );
    const selectedHasSupport = selectedFamilies.some(isBackChestPosteriorSupportFamily);
    if (params.slotRole === "accessoryChestIsolation" && family !== "chest_isolation") {
      score -= 8;
      reasons.push("-8 chest-isolation slot rejects non-chest family");
    }
    if (family === "chest_isolation" && hasPullCoverage && selectedHasSupport) {
      const bonus = params.phase === "activation" ? 5.5 : 4.25;
      score += bonus;
      reasons.push(`+${bonus.toFixed(2)} Back + Chest truthful chest isolation after pull coverage`);
    }
    if (
      (family === "back_thickness" ||
        family === "back_width" ||
        family === "pullover_serratus") &&
      hasPullCoverage
    ) {
      score += 1.25;
      reasons.push("+1.25 Back + Chest back-width/thickness accessory rotation");
    }
    if (
      isBackChestPosteriorSupportFamily(family) &&
      selectedFamilies.some(isBackChestPosteriorSupportFamily)
    ) {
      score -= 3.25;
      reasons.push("-3.25 Back + Chest rear/scap support saturation");
    }
  }

  if (dayKey === "shoulders_arms" && params.section === "main") {
    if (isUprightRowFamilyExercise(params.exercise)) {
      if (
        canUseUprightRowForThreeDayShoulder({
          exercise: params.exercise,
          experience: params.experience,
          painSeverity: params.painSeverity,
          painAreas: params.painAreas,
          trainingContext: params.trainingContext,
          availableEquipment: params.availableEquipment,
        })
      ) {
        score += 2.5;
        reasons.push("+2.50 safe upright-row secondary shoulder option");
      } else {
        score -= 14;
        reasons.push("-14 upright-row blocked outside low-pain safe profile");
      }
    }
  }

  const lowBackPain = params.painAreas
    .map((area) => normalizeCoachToken(area))
    .some((area) => area === "lower_back" || area === "low_back" || area === "back");
  const hingeSafety = scoreLowerBackPainHingeCoachSafety({
    exercise: params.exercise,
    lowBackPain,
    hasSaferAlternative: Boolean(params.lowerBackSaferHingeAlternative),
    slotLane: params.slotLane,
    section: params.section,
  });
  score += hingeSafety.score;
  reasons.push(...hingeSafety.reasons);

  return { score, reasons };
};

export const getThreeDayCooldownPreferenceIds = (params: {
  dayTitle?: string | null;
  focus: "upper" | "lower" | "core";
  selectedExercises?: Exercise[];
}) => {
  const dayKey = resolveThreeDayCoachDayKey(params.dayTitle);
  const hasChestDominantWork = (params.selectedExercises ?? []).some((exercise) => {
    const descriptor = descriptorFor(exercise);
    return (
      descriptor.includes("chest") ||
      descriptor.includes("bench") ||
      descriptor.includes("pec") ||
      (hasPattern(exercise, "push") && hasWeeklyTag(exercise, "chest"))
    );
  });

  if (dayKey === "back_chest") {
    return hasChestDominantWork
      ? ["doorway-pec-stretch", "banded-lat-stretch", "thread-the-needle", "chin-tucks"]
      : ["banded-lat-stretch", "thread-the-needle", "doorway-pec-stretch", "chin-tucks"];
  }
  if (dayKey === "shoulders_arms") {
    return hasChestDominantWork
      ? ["thread-the-needle", "chin-tucks", "doorway-pec-stretch", "banded-lat-stretch"]
      : ["thread-the-needle", "chin-tucks", "banded-lat-stretch", "doorway-pec-stretch"];
  }
  if (dayKey === "legs_abs") {
    return ["hip-flexor-stretch", "hamstring-stretch", "breathing-90-90", "thread-the-needle"];
  }
  if (params.focus === "upper") {
    return ["thread-the-needle", "banded-lat-stretch", "doorway-pec-stretch", "chin-tucks"];
  }
  if (params.focus === "lower") {
    return ["hip-flexor-stretch", "hamstring-stretch", "breathing-90-90"];
  }
  return ["breathing-90-90", "thread-the-needle", "hip-flexor-stretch"];
};

export const buildThreeDayCoachAuditHints = (week: ProgramDay[]) => {
  const hints: string[] = [];

  week.forEach((day) => {
    const dayKey = resolveThreeDayCoachDayKey(day.title);
    if (!dayKey) return;
    const items = day.routine
      .map((item) => ({ item, exercise: item.exerciseId }))
      .filter((entry) => Boolean(entry.exercise));

    if (dayKey === "back_chest") {
      const accessoryFamilies = day.routine
        .filter((item) => item.section === "accessory")
        .map((item) => item.exerciseId)
        .filter(Boolean);
      const supportOnlyCount = accessoryFamilies.filter((id) => {
        const text = normalizeCoachToken(id);
        return (
          text.includes("face_pull") ||
          text.includes("rear_delt") ||
          text.includes("reverse_pec_deck") ||
          text.includes("external_rotation")
        );
      }).length;
      if (accessoryFamilies.length >= 2 && supportOnlyCount >= accessoryFamilies.length) {
        hints.push("Back + Chest accessories are saturated with rear-delt/scap support.");
      }
    }

    if (dayKey === "shoulders_arms") {
      const mainIds = items
        .filter((entry) => entry.item.section === "main")
        .map((entry) => normalizeCoachToken(entry.item.exerciseId));
      const rearDeltCount = mainIds.filter(
        (id) => id.includes("rear_delt") || id.includes("reverse_pec_deck")
      ).length;
      if (rearDeltCount > 1) {
        hints.push("Shoulders + Arms secondary shoulder role is rear-delt saturated.");
      }
    }

    if (dayKey === "legs_abs") {
      const mainIds = items
        .filter((entry) => entry.item.section === "main")
        .map((entry) => normalizeCoachToken(entry.item.exerciseId));
      if (mainIds.some((id) => id === "back_extension" || id === "back_extension_hold")) {
        hints.push("Legs + Abs primary hinge should be checked for lower-back pain safety.");
      }
      const accessoryIds = items
        .filter((entry) => entry.item.section === "accessory")
        .map((entry) => normalizeCoachToken(entry.item.exerciseId));
      if (accessoryIds.filter((id) => id.includes("side_plank")).length > 1) {
        hints.push("Legs + Abs core accessories are lateral-stability saturated.");
      }
    }
  });

  return hints;
};
