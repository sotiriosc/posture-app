import type { Equipment } from "@/lib/equipment";
import type { Exercise, ExerciseAccessoryRole } from "@/lib/exercises";

export type HigherFrequencyDayIdentity =
  | "upperPushScapular"
  | "upperPush"
  | "upperPullThoracic"
  | "upperPull"
  | "lowerSquat"
  | "lowerHinge"
  | "armsPosture"
  | "unknown";

export type HigherFrequencyAccessoryLane =
  | "push"
  | "pull"
  | "lower"
  | "core"
  | "chest"
  | "back";

export type HigherFrequencyMainLane =
  | "push"
  | "verticalPush"
  | "pull"
  | "squat"
  | "hinge";

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

const descriptorFor = (exercise: Exercise) =>
  `${exercise.id} ${exercise.name} ${exercise.familyKey ?? ""} ${
    exercise.variantKey ?? ""
  }`.toLowerCase();

const tokenSet = (values?: string[]) =>
  new Set((values ?? []).map((value) => normalizeCoachToken(value)));

const hasPattern = (exercise: Exercise, pattern: string) =>
  tokenSet(exercise.movementPattern).has(normalizeCoachToken(pattern));

const hasTag = (exercise: Exercise, tag: string) =>
  tokenSet(exercise.tags).has(normalizeCoachToken(tag));

const hasWeeklyTag = (exercise: Exercise, tag: string) =>
  tokenSet(exercise.weeklyCoverageTags).has(normalizeCoachToken(tag));

const hasAccessoryRole = (exercise: Exercise, role: ExerciseAccessoryRole) =>
  exercise.accessoryRoles?.includes(role) ?? false;

const hasAvailable = (availableEquipment: Iterable<Equipment>, item: Equipment) => {
  for (const equipment of availableEquipment) {
    if (equipment === item) return true;
  }
  return false;
};

export const resolveHigherFrequencyDayIdentity = (
  dayTitle?: string | null
): HigherFrequencyDayIdentity => {
  const token = normalizeCoachToken(dayTitle ?? "");
  if (token === "upper_push_scapular_control") return "upperPushScapular";
  if (token === "upper_push") return "upperPush";
  if (token === "upper_pull_thoracic_posture") return "upperPullThoracic";
  if (token === "upper_pull") return "upperPull";
  if (token === "lower_squat" || token === "lower_squat_emphasis_core") {
    return "lowerSquat";
  }
  if (
    token === "lower_hinge_posterior_chain" ||
    token === "lower_hinge_emphasis_carry_anti_rotation"
  ) {
    return "lowerHinge";
  }
  if (token === "arms_posture_conditioning") return "armsPosture";
  return "unknown";
};

export const resolveHigherFrequencyAccessoryLanePlan = (params: {
  dayTitle: string;
  accessoryCount: number;
}): HigherFrequencyAccessoryLane[] => {
  const { dayTitle, accessoryCount } = params;
  if (accessoryCount <= 0) return [];

  const identity = resolveHigherFrequencyDayIdentity(dayTitle);
  const planned: HigherFrequencyAccessoryLane[] = [];
  if (identity === "upperPushScapular") {
    planned.push("push");
    if (accessoryCount >= 2) planned.push("back");
    if (accessoryCount >= 3) planned.splice(1, 0, "chest");
  } else if (identity === "upperPush") {
    planned.push("push");
    if (accessoryCount >= 2) planned.push("back");
    if (accessoryCount >= 3) planned.splice(1, 0, "chest");
  } else if (identity === "upperPullThoracic" || identity === "upperPull") {
    planned.push("pull");
    if (accessoryCount >= 2) planned.push("back");
    if (accessoryCount >= 3) planned.push("back");
  } else if (identity === "lowerSquat") {
    planned.push("core");
    if (accessoryCount >= 2) planned.push("lower");
    if (accessoryCount >= 3) planned.push("core");
    if (accessoryCount >= 4) planned.push("lower");
  } else if (identity === "lowerHinge") {
    planned.push("core");
    if (accessoryCount >= 2) planned.push("lower");
    if (accessoryCount >= 3) planned.push("core");
    if (accessoryCount >= 4) planned.push("lower");
  } else if (identity === "armsPosture") {
    if (accessoryCount >= 3) {
      planned.push("back", "push", "pull");
    } else {
      planned.push("push");
      if (accessoryCount >= 2) planned.push("pull");
    }
  }

  if (!planned.length) return [];
  while (planned.length < accessoryCount) {
    if (identity === "upperPullThoracic" || identity === "upperPull") {
      planned.push(planned.length % 2 === 0 ? "pull" : "back");
    } else if (identity === "upperPushScapular" || identity === "upperPush") {
      planned.push(planned.length % 2 === 0 ? "push" : "back");
    } else if (identity === "lowerSquat" || identity === "lowerHinge") {
      planned.push(planned.length % 2 === 0 ? "core" : "lower");
    } else {
      planned.push(planned.length % 2 === 0 ? "push" : "pull");
    }
  }
  return planned.slice(0, accessoryCount);
};

export const resolveHigherFrequencyMainSlotKind = (params: {
  dayTitle: string;
  slotLane: HigherFrequencyMainLane;
  sameLaneOrdinal: number;
}) => {
  const { dayTitle, slotLane, sameLaneOrdinal } = params;
  const identity = resolveHigherFrequencyDayIdentity(dayTitle);

  if (
    slotLane === "pull" &&
    (identity === "upperPullThoracic" ||
      identity === "upperPull" ||
      identity === "armsPosture")
  ) {
    if (sameLaneOrdinal === 0) return "mainHorizontalPull";
    if (sameLaneOrdinal === 1 && identity !== "armsPosture") return "mainVerticalPull";
    return "mainExtraBackLoaded";
  }

  return undefined;
};

export const isHigherFrequencyScapularPostureSupportExercise = (
  exercise: Exercise
) => {
  const descriptor = descriptorFor(exercise);
  return (
    hasAccessoryRole(exercise, "accessoryRearDelt") ||
    hasAccessoryRole(exercise, "accessoryShoulderSupport") ||
    hasTag(exercise, "scap") ||
    hasTag(exercise, "scapular") ||
    hasTag(exercise, "posture") ||
    hasTag(exercise, "rotator_cuff") ||
    hasWeeklyTag(exercise, "scapular") ||
    descriptor.includes("face pull") ||
    descriptor.includes("face-pull") ||
    descriptor.includes("rear delt") ||
    descriptor.includes("rear-delt") ||
    descriptor.includes("reverse pec deck") ||
    descriptor.includes("reverse-pec-deck") ||
    descriptor.includes("external rotation") ||
    descriptor.includes("external-rotation") ||
    descriptor.includes("pull-apart") ||
    descriptor.includes("pull apart") ||
    descriptor.includes("snow angel") ||
    descriptor.includes("snow-angel") ||
    descriptor.includes("swimmer") ||
    descriptor.includes("prone y") ||
    descriptor.includes("prone-y") ||
    descriptor.includes("t raise") ||
    descriptor.includes("t-raise") ||
    descriptor.includes("wall angel")
  );
};

const isBicepsAccessory = (exercise: Exercise) => {
  const descriptor = descriptorFor(exercise);
  return (
    hasAccessoryRole(exercise, "accessoryBiceps") ||
    descriptor.includes("biceps") ||
    descriptor.includes("curl")
  );
};

const isTricepsAccessory = (exercise: Exercise) => {
  const descriptor = descriptorFor(exercise);
  return (
    hasAccessoryRole(exercise, "accessoryTriceps") ||
    descriptor.includes("triceps") ||
    descriptor.includes("pressdown") ||
    descriptor.includes("kickback")
  );
};

const isChestAccessory = (exercise: Exercise) => {
  const descriptor = descriptorFor(exercise);
  return (
    hasAccessoryRole(exercise, "accessoryChestIsolation") ||
    hasPattern(exercise, "horizontalPush") ||
    descriptor.includes("chest") ||
    descriptor.includes("pec deck") ||
    descriptor.includes("pec-deck") ||
    descriptor.includes("fly")
  );
};

const isLateralDeltAccessory = (exercise: Exercise) => {
  const descriptor = descriptorFor(exercise);
  return hasAccessoryRole(exercise, "accessoryLateralDelt") || descriptor.includes("lateral raise");
};

const isBackOrLatAccessory = (exercise: Exercise) => {
  const descriptor = descriptorFor(exercise);
  return (
    hasAccessoryRole(exercise, "accessoryBackThickness") ||
    hasAccessoryRole(exercise, "accessoryBackWidth") ||
    hasPattern(exercise, "pull") ||
    descriptor.includes("row") ||
    descriptor.includes("pulldown") ||
    descriptor.includes("pull-down") ||
    descriptor.includes("lat") ||
    descriptor.includes("pullover")
  );
};

const isLoadedGenericRowAccessory = (exercise: Exercise) => {
  const descriptor = descriptorFor(exercise);
  return (
    exercise.loadType === "weighted" &&
    /\brows?\b/.test(descriptor) &&
    !descriptor.includes("rear delt") &&
    !descriptor.includes("rear-delt") &&
    !descriptor.includes("face pull") &&
    !descriptor.includes("face-pull") &&
    !descriptor.includes("external rotation") &&
    !descriptor.includes("external-rotation") &&
    !descriptor.includes("chest-supported") &&
    !descriptor.includes("chest supported")
  );
};

const isCalfAccessory = (exercise: Exercise) => {
  const descriptor = descriptorFor(exercise);
  return hasAccessoryRole(exercise, "accessoryCalves") || descriptor.includes("calf");
};

const isPosteriorLowerAccessory = (exercise: Exercise) => {
  const descriptor = descriptorFor(exercise);
  return (
    hasAccessoryRole(exercise, "accessoryHamstring") ||
    hasAccessoryRole(exercise, "accessoryGlute") ||
    hasPattern(exercise, "hinge") ||
    descriptor.includes("hamstring") ||
    descriptor.includes("glute") ||
    descriptor.includes("hip thrust") ||
    descriptor.includes("hip-thrust") ||
    descriptor.includes("bridge") ||
    descriptor.includes("rdl")
  );
};

const isUnilateralOrKneeDominantLower = (exercise: Exercise) => {
  const descriptor = descriptorFor(exercise);
  return (
    hasPattern(exercise, "squat") &&
    (descriptor.includes("split") ||
      descriptor.includes("lunge") ||
      descriptor.includes("step-up") ||
      descriptor.includes("step up") ||
      descriptor.includes("cossack") ||
      descriptor.includes("single-leg") ||
      descriptor.includes("single leg"))
  );
};

const isCarryOrAntiRotationCore = (exercise: Exercise) => {
  const descriptor = descriptorFor(exercise);
  return (
    hasAccessoryRole(exercise, "accessoryCarry") ||
    hasPattern(exercise, "carry") ||
    hasPattern(exercise, "antiRotation") ||
    hasPattern(exercise, "anti_rotation") ||
    descriptor.includes("carry") ||
    descriptor.includes("suitcase") ||
    descriptor.includes("pallof") ||
    descriptor.includes("woodchop") ||
    descriptor.includes("anti-rotation") ||
    descriptor.includes("anti rotation")
  );
};

const isAntiExtensionOrBraceCore = (exercise: Exercise) => {
  const descriptor = descriptorFor(exercise);
  return (
    hasAccessoryRole(exercise, "accessoryCoreStability") ||
    hasPattern(exercise, "core") ||
    descriptor.includes("plank") ||
    descriptor.includes("dead bug") ||
    descriptor.includes("dead-bug") ||
    descriptor.includes("hollow") ||
    descriptor.includes("brace")
  );
};

const isHorizontalPullExercise = (exercise: Exercise) => {
  const descriptor = descriptorFor(exercise);
  return (
    exercise.slotRoles?.includes("pullHorizontal") ||
    hasWeeklyTag(exercise, "horizontalPull") ||
    descriptor.includes("row") ||
    descriptor.includes("widow")
  );
};

const isVerticalPullExercise = (exercise: Exercise) => {
  const descriptor = descriptorFor(exercise);
  return (
    exercise.slotRoles?.includes("pullVertical") ||
    hasWeeklyTag(exercise, "verticalPull") ||
    descriptor.includes("pulldown") ||
    descriptor.includes("pull-down") ||
    descriptor.includes("pullup") ||
    descriptor.includes("pull-up") ||
    descriptor.includes("chinup") ||
    descriptor.includes("chin-up") ||
    descriptor.includes("lat")
  );
};

const isLowOutputSupportPull = (exercise: Exercise) => {
  const descriptor = descriptorFor(exercise);
  return (
    exercise.supportOnly === true ||
    descriptor.includes("isometric") ||
    descriptor.includes("iso-hold") ||
    descriptor.includes("lat sweep") ||
    descriptor.includes("lat-sweep") ||
    descriptor.includes("snow angel") ||
    descriptor.includes("snow-angel") ||
    descriptor.includes("swimmer")
  );
};

const lowerFamilyKey = (exercise: Exercise) =>
  normalizeCoachToken(exercise.familyKey ?? exercise.id);

const scoreMainCoachIdentity = (params: {
  exercise: Exercise;
  dayIdentity: HigherFrequencyDayIdentity;
  slotKind?: string;
  slotLane?: string;
  selectedMainExercises: Exercise[];
  sameWeekRelatedMainExercises: Exercise[];
}) => {
  const {
    exercise,
    dayIdentity,
    slotKind,
    slotLane,
    selectedMainExercises,
    sameWeekRelatedMainExercises,
  } = params;
  let score = 0;
  const reasons: string[] = [];

  if (slotKind === "mainHorizontalPull") {
    if (isHorizontalPullExercise(exercise)) {
      score += 5;
      reasons.push("+5 higher-frequency horizontal pull role");
    } else if (isVerticalPullExercise(exercise)) {
      score -= 2;
      reasons.push("-2 vertical pull in horizontal pull role");
    }
  }
  if (slotKind === "mainVerticalPull") {
    if (isVerticalPullExercise(exercise)) {
      score += 5;
      reasons.push("+5 higher-frequency vertical pull role");
    } else if (isHorizontalPullExercise(exercise)) {
      score -= 2;
      reasons.push("-2 horizontal pull in vertical pull role");
    }
  }
  if (slotKind === "mainExtraBackLoaded") {
    if (isBackOrLatAccessory(exercise) && exercise.loadType === "weighted") {
      score += 3;
      reasons.push("+3 loaded extra back role");
    }
    if (isLowOutputSupportPull(exercise)) {
      score -= 4;
      reasons.push("-4 low-output extra back main");
    }
  }

  const lowerIdentity = dayIdentity === "lowerSquat" || dayIdentity === "lowerHinge";
  if (lowerIdentity && (slotLane === "squat" || slotLane === "hinge")) {
    const exactRepeat = sameWeekRelatedMainExercises.some(
      (selected) => selected.id === exercise.id
    );
    if (exactRepeat) {
      score -= 10;
      reasons.push("-10 same-week lower exact-main repeat");
    }

    const familyRepeat = sameWeekRelatedMainExercises.some(
      (selected) => lowerFamilyKey(selected) === lowerFamilyKey(exercise)
    );
    if (!exactRepeat && familyRepeat) {
      score -= 3;
      reasons.push("-3 same-week lower family repeat");
    }

    const alreadySelectedSameDay = selectedMainExercises.some(
      (selected) => selected.id === exercise.id
    );
    if (alreadySelectedSameDay) {
      score -= 8;
      reasons.push("-8 same-day exact-main repeat");
    }

    if (dayIdentity === "lowerSquat" && slotLane === "squat") {
      score += 2;
      reasons.push("+2 lower squat day knee-dominant anchor");
      if (isUnilateralOrKneeDominantLower(exercise)) {
        score += 1.5;
        reasons.push("+1.5 lower squat unilateral/knee emphasis");
      }
    }

    if (dayIdentity === "lowerHinge" && slotLane === "hinge") {
      score += 2;
      reasons.push("+2 lower hinge day posterior-chain anchor");
      if (isPosteriorLowerAccessory(exercise) && !isCalfAccessory(exercise)) {
        score += 1.5;
        reasons.push("+1.5 lower hinge posterior-chain family");
      }
    }

    if (dayIdentity === "lowerHinge" && slotLane === "squat") {
      if (isUnilateralOrKneeDominantLower(exercise)) {
        score += 2;
        reasons.push("+2 lower hinge secondary unilateral squat");
      }
    }
  }

  return { score, reasons };
};

const scoreAccessoryCoachIdentity = (params: {
  exercise: Exercise;
  dayIdentity: HigherFrequencyDayIdentity;
  slotLane?: string;
  selectedAccessoryExercises: Exercise[];
}) => {
  const { exercise, dayIdentity, slotLane, selectedAccessoryExercises } = params;
  let score = 0;
  const reasons: string[] = [];
  const scapSupport = isHigherFrequencyScapularPostureSupportExercise(exercise);
  const selectedScapSupport = selectedAccessoryExercises.some(
    isHigherFrequencyScapularPostureSupportExercise
  );

  if (dayIdentity === "upperPushScapular" || dayIdentity === "upperPush") {
    if (isTricepsAccessory(exercise)) {
      score += 5;
      reasons.push("+5 upper push triceps accessory identity");
    }
    if (isChestAccessory(exercise)) {
      score += 4;
      reasons.push("+4 upper push chest accessory identity");
    }
    if (isLateralDeltAccessory(exercise)) {
      score += 3;
      reasons.push("+3 upper push lateral delt identity");
    }
    if (scapSupport) {
      score += slotLane === "back" ? 8 : 3;
      reasons.push(
        `${slotLane === "back" ? "+8" : "+3"} upper push scapular support identity`
      );
      if (!selectedScapSupport && dayIdentity === "upperPushScapular") {
        score += 2;
        reasons.push("+2 promised scapular-control exposure");
      }
    }
    if (slotLane === "back" && !scapSupport) {
      score -= 6;
      reasons.push("-6 upper push back slot prefers scapular support");
    }
    if (slotLane === "back" && isLoadedGenericRowAccessory(exercise)) {
      score -= 10;
      reasons.push("-10 upper push back slot avoids generic loaded row");
    }
    if (isBicepsAccessory(exercise)) {
      score -= 8;
      reasons.push("-8 biceps accessory on upper push identity");
    }
    if (hasPattern(exercise, "pull") && !scapSupport && !isBackOrLatAccessory(exercise)) {
      score -= 4;
      reasons.push("-4 generic pull accessory on upper push identity");
    }
  }

  if (dayIdentity === "upperPullThoracic" || dayIdentity === "upperPull") {
    if (isBicepsAccessory(exercise)) {
      score += slotLane === "pull" ? 5 : 1;
      reasons.push(
        `${slotLane === "pull" ? "+5" : "+1"} upper pull biceps accessory identity`
      );
    }
    if (scapSupport) {
      score += slotLane === "back" ? 7 : 4;
      reasons.push(
        `${slotLane === "back" ? "+7" : "+4"} upper pull posture support identity`
      );
    }
    if (isBackOrLatAccessory(exercise)) {
      score += slotLane === "back" ? 5 : 2;
      reasons.push(
        `${slotLane === "back" ? "+5" : "+2"} upper pull back/lat accessory identity`
      );
    }
    if (isTricepsAccessory(exercise) || isChestAccessory(exercise)) {
      score -= 9;
      reasons.push("-9 push/chest accessory on upper pull identity");
    }
  }

  if (dayIdentity === "lowerSquat") {
    if (slotLane === "core" && (isCarryOrAntiRotationCore(exercise) || isAntiExtensionOrBraceCore(exercise))) {
      score += 4;
      reasons.push("+4 lower squat core accessory identity");
    }
    if (slotLane === "lower" && isCalfAccessory(exercise)) {
      score += 4;
      reasons.push("+4 lower squat calf/accessory lower identity");
    }
    if (slotLane === "lower" && isUnilateralOrKneeDominantLower(exercise)) {
      score += 2;
      reasons.push("+2 lower squat unilateral accessory identity");
    }
  }

  if (dayIdentity === "lowerHinge") {
    if (slotLane === "core" && isCarryOrAntiRotationCore(exercise)) {
      score += 6;
      reasons.push("+6 lower hinge carry/anti-rotation identity");
    } else if (slotLane === "core" && isAntiExtensionOrBraceCore(exercise)) {
      score += 2;
      reasons.push("+2 lower hinge brace accessory identity");
    }
    if (slotLane === "lower" && isPosteriorLowerAccessory(exercise) && !isCalfAccessory(exercise)) {
      score += 8;
      reasons.push("+8 lower hinge posterior-chain accessory identity");
    }
    if (slotLane === "lower" && isCalfAccessory(exercise)) {
      score -= 5;
      reasons.push("-5 calf accessory on hinge-emphasis lower slot");
    }
  }

  return { score, reasons };
};

export const scoreHigherFrequencyCoachCandidate = (params: {
  exercise: Exercise;
  section?: "main" | "accessory" | "warmup" | "activation" | "cooldown";
  dayTitle?: string | null;
  slotKind?: string;
  slotLane?: string;
  availableEquipment?: Iterable<Equipment>;
  selectedMainExercises?: Exercise[];
  selectedAccessoryExercises?: Exercise[];
  sameWeekRelatedMainExercises?: Exercise[];
}): ScoreWithReasons => {
  const {
    exercise,
    section,
    dayTitle,
    slotKind,
    slotLane,
    selectedMainExercises = [],
    selectedAccessoryExercises = [],
    sameWeekRelatedMainExercises = [],
  } = params;
  const dayIdentity = resolveHigherFrequencyDayIdentity(dayTitle);
  if (dayIdentity === "unknown") return { score: 0, reasons: [] };
  if (section !== "main" && section !== "accessory") return { score: 0, reasons: [] };

  const scores: ScoreWithReasons[] = [];
  if (section === "main") {
    scores.push(
      scoreMainCoachIdentity({
        exercise,
        dayIdentity,
        slotKind,
        slotLane,
        selectedMainExercises,
        sameWeekRelatedMainExercises,
      })
    );
  }
  if (section === "accessory") {
    scores.push(
      scoreAccessoryCoachIdentity({
        exercise,
        dayIdentity,
        slotLane,
        selectedAccessoryExercises,
      })
    );
  }

  let score = 0;
  const reasons: string[] = [];
  scores.forEach((entry) => {
    score += entry.score;
    reasons.push(...entry.reasons);
  });

  if (
    section === "main" &&
    dayIdentity === "upperPullThoracic" &&
    slotKind === "mainHorizontalPull" &&
    params.availableEquipment &&
    hasAvailable(params.availableEquipment, "machines") &&
    descriptorFor(exercise).includes("seated row")
  ) {
    score += 1.5;
    reasons.push("+1.5 gym upper-pull posture row preference");
  }

  return { score, reasons };
};

export const buildHigherFrequencyCoachAuditHints = (params: {
  dayTitle: string;
  mains: Exercise[];
  accessories: Exercise[];
}) => {
  const identity = resolveHigherFrequencyDayIdentity(params.dayTitle);
  const hints: string[] = [];
  if (
    identity === "upperPushScapular" &&
    !params.accessories.some(isHigherFrequencyScapularPostureSupportExercise)
  ) {
    hints.push("Upper Push + Scapular Control has no accessory scapular support.");
  }
  if (
    (identity === "upperPull" || identity === "upperPullThoracic") &&
    params.accessories.some((exercise) => isTricepsAccessory(exercise) || isChestAccessory(exercise))
  ) {
    hints.push("Upper Pull includes push/chest accessory before pull identity is filled.");
  }
  return hints;
};
