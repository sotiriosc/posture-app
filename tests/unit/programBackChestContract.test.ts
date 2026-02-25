import { describe, expect, test } from "vitest";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import { exerciseById, exercises, type Exercise } from "@/lib/exercises";
import { isExerciseEligible, normalizeEquipmentSelection, type Equipment } from "@/lib/equipment";
import { generateNextPhaseProgram, generateWeeklyProgram } from "@/lib/program";
import type { PoseAnalysis } from "@/lib/poseAnalyzer";

const isVerticalPullMain = (exercise: Exercise) =>
  exercise.movementPattern.some((entry) => normalizeToken(entry) === "verticalpull");

const normalizeToken = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");

const isBackAccessory = (exercise: Exercise) => {
  const patterns = new Set((exercise.movementPattern ?? []).map(normalizeToken));
  const tags = new Set((exercise.tags ?? []).map(normalizeToken));
  const muscles = new Set((exercise.muscleGroups ?? []).map(normalizeToken));
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  return (
    patterns.has("pull") ||
    patterns.has("horizontalpull") ||
    patterns.has("verticalpull") ||
    tags.has("pull") ||
    tags.has("scap") ||
    tags.has("upperback") ||
    tags.has("lats") ||
    tags.has("back") ||
    muscles.has("upperback") ||
    muscles.has("lats") ||
    muscles.has("back") ||
    descriptor.includes("row") ||
    descriptor.includes("pull") ||
    descriptor.includes("lat") ||
    descriptor.includes("back")
  );
};

const isRearDeltOrExternalAccessory = (exercise: Exercise) => {
  const patterns = new Set((exercise.movementPattern ?? []).map(normalizeToken));
  const tags = new Set((exercise.tags ?? []).map(normalizeToken));
  const muscles = new Set((exercise.muscleGroups ?? []).map(normalizeToken));
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  return (
    tags.has("scap") ||
    tags.has("externalrotation") ||
    tags.has("rotatorcuff") ||
    muscles.has("reardelts") ||
    muscles.has("rotatorcuff") ||
    patterns.has("externalrotation") ||
    descriptor.includes("face-pull") ||
    descriptor.includes("face pull") ||
    descriptor.includes("rear-delt") ||
    descriptor.includes("rear delt") ||
    descriptor.includes("external rotation")
  );
};

const isRearDeltAccessory = (exercise: Exercise) => {
  const tags = new Set((exercise.tags ?? []).map(normalizeToken));
  const muscles = new Set((exercise.muscleGroups ?? []).map(normalizeToken));
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  return (
    muscles.has("reardelts") ||
    tags.has("reardelt") ||
    descriptor.includes("rear-delt") ||
    descriptor.includes("rear delt") ||
    descriptor.includes("face-pull") ||
    descriptor.includes("face pull")
  );
};

const isScapOrExternalAccessory = (exercise: Exercise) => {
  const tags = new Set((exercise.tags ?? []).map(normalizeToken));
  const patterns = new Set((exercise.movementPattern ?? []).map(normalizeToken));
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  return (
    tags.has("scap") ||
    tags.has("scapular") ||
    tags.has("externalrotation") ||
    patterns.has("scapular") ||
    patterns.has("externalrotation") ||
    descriptor.includes("face-pull") ||
    descriptor.includes("face pull") ||
    descriptor.includes("external rotation")
  );
};

const chestFlyAccessoryIds = new Set([
  "dumbbell-chest-fly",
  "machine-pec-deck-press",
  "suspension-chest-fly",
]);

const hasChestFlyAccessory = (exercise: Exercise) =>
  chestFlyAccessoryIds.has(exercise.id) ||
  (() => {
    const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
    if (descriptor.includes("reverse")) return false;
    return descriptor.includes("chest-fly") || descriptor.includes("chest fly");
  })();

const isChestIsolationAccessory = (exercise: Exercise) => {
  const tags = new Set((exercise.tags ?? []).map(normalizeToken));
  const muscles = new Set((exercise.muscleGroups ?? []).map(normalizeToken));
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  return (
    descriptor.includes("fly") ||
    descriptor.includes("pec deck") ||
    descriptor.includes("pec-deck") ||
    ((tags.has("chest") || muscles.has("chest")) &&
      (descriptor.includes("isolation") || descriptor.includes("fly")))
  );
};

const isRedundantBackAccessory = (exercise: Exercise) => {
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  const rowLike =
    descriptor.includes("row") || descriptor.includes("pulldown") || descriptor.includes("lat");
  const shoulderHealthExemption =
    descriptor.includes("face-pull") ||
    descriptor.includes("face pull") ||
    descriptor.includes("rear-delt") ||
    descriptor.includes("rear delt") ||
    descriptor.includes("upright") ||
    descriptor.includes("pullover");
  return rowLike && !shoulderHealthExemption;
};

const hasHorizontalPushMain = (exercise: Exercise) => {
  const patterns = new Set((exercise.movementPattern ?? []).map(normalizeToken));
  return patterns.has("push") && !patterns.has("verticalpush");
};

const hasHorizontalPullMain = (exercise: Exercise) => {
  const patterns = new Set((exercise.movementPattern ?? []).map(normalizeToken));
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  return patterns.has("horizontalpull") || descriptor.includes("row");
};

const hasVerticalPushMain = (exercise: Exercise) => {
  const patterns = new Set((exercise.movementPattern ?? []).map(normalizeToken));
  return patterns.has("verticalpush");
};

const pressingMainCount = (exercises: Exercise[]) =>
  exercises.filter(
    (exercise) => hasHorizontalPushMain(exercise) || hasVerticalPushMain(exercise)
  ).length;

const pullMainCount = (exercises: Exercise[]) =>
  exercises.filter((exercise) => hasPullPattern(exercise)).length;

const rowAngleSignature = (exercise: Exercise) => {
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  if (!descriptor.includes("row")) return null;
  if (descriptor.includes("machine seated row")) return "machine_seated";
  if (descriptor.includes("cable seated row")) return "cable_seated";
  if (descriptor.includes("chest-supported row")) return "chest_supported";
  if (descriptor.includes("dumbbell rows")) return "dumbbell_rows";
  if (descriptor.includes("split-stance row")) return "split_stance";
  if (descriptor.includes("suspension row")) return "suspension_row";
  return "generic_row";
};

const hasDuplicateRowAngles = (exercises: Exercise[]) => {
  const signatures = exercises
    .map((exercise) => rowAngleSignature(exercise))
    .filter(
      (entry): entry is Exclude<ReturnType<typeof rowAngleSignature>, null> =>
        entry !== null
    );
  return new Set(signatures).size !== signatures.length;
};

const hasPullPattern = (exercise: Exercise) =>
  exercise.movementPattern.some((entry) => normalizeToken(entry) === "pull");

const hasPushPattern = (exercise: Exercise) =>
  exercise.movementPattern.some((entry) => normalizeToken(entry) === "push");

const resolveTierForTest = (exercise: Exercise) => {
  if (exercise.tier) return exercise.tier;
  const weightedWithDbOrBb =
    exercise.loadType === "weighted" &&
    (exercise.equipment.includes("dumbbells") || exercise.equipment.includes("barbell"));
  return weightedWithDbOrBb ? 2 : 1;
};

const isSafeTier3BeginnerBackChestAnchorForTest = (exercise: Exercise) => {
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  if (descriptor.includes("landmine")) return true;
  if (descriptor.includes("chest-supported")) return true;
  const machineOrCable =
    exercise.equipment.includes("machines") || exercise.equipment.includes("cables");
  if (!machineOrCable) return false;
  return (
    descriptor.includes("press") ||
    descriptor.includes("pulldown") ||
    descriptor.includes("pull-down")
  );
};

const phaseRankForTest = {
  activation: 1,
  skill: 2,
  growth: 3,
} as const;

const minPhaseForTest = (exercise: Exercise) => exercise.phaseMin ?? "activation";

const isEligibleForSkillPhaseInTest = (exercise: Exercise) =>
  phaseRankForTest[minPhaseForTest(exercise)] <= phaseRankForTest.skill;

const meetsExperienceMinIntermediateInTest = (exercise: Exercise) => {
  if (!exercise.experienceMin) return true;
  return exercise.experienceMin === "Beginner" || exercise.experienceMin === "Intermediate";
};

const experienceRankForTest = {
  Beginner: 1,
  Intermediate: 2,
  Advanced: 3,
} as const;

const meetsExperienceMinForTest = (
  exercise: Exercise,
  experience: QuestionnaireData["experience"]
) => {
  if (!exercise.experienceMin) return true;
  const currentRank =
    experienceRankForTest[
      (experience as keyof typeof experienceRankForTest) ?? "Beginner"
    ] ?? experienceRankForTest.Beginner;
  return currentRank >= experienceRankForTest[exercise.experienceMin];
};

const pullVsPushVolume = (exercises: Exercise[]) => {
  const pull = exercises.filter((exercise) => hasPullPattern(exercise)).length;
  const push = exercises.filter((exercise) => hasPushPattern(exercise)).length;
  return { pull, push };
};

const redundantBackIds = new Set([
  "machine-seated-row",
  "cable-seated-row",
  "machine-lat-pulldown",
  "cable-lat-pulldown",
  "dumbbell-rows",
  "split-stance-row",
  "band-row",
  "band-lat-pulldown",
]);

const isLoadedOrAssistedAccessory = (exercise: Exercise) => {
  if (exercise.loadType === "bodyweight" || exercise.loadType === "timed") return false;
  return true;
};

const includesAnyRedundantBackId = (exercises: Exercise[]) =>
  exercises.some((exercise) => redundantBackIds.has(exercise.id));

const isLowerBodyExerciseForBackChestGuard = (exercise: Exercise) => {
  const patterns = new Set((exercise.movementPattern ?? []).map(normalizeToken));
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  return (
    patterns.has("squat") ||
    patterns.has("hinge") ||
    patterns.has("singleleg") ||
    descriptor.includes("squat") ||
    descriptor.includes("lunge") ||
    descriptor.includes("cossack")
  );
};

const isShoulderIsolationLeakForBackChestGuard = (exercise: Exercise) => {
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  const tags = new Set((exercise.tags ?? []).map(normalizeToken));
  return (
    descriptor.includes("lateral raise") ||
    descriptor.includes("rear delt raise") ||
    tags.has("lateraldelt") ||
    tags.has("shouldersisolation")
  );
};

const getBackChestDayFromProgram = (program: ReturnType<typeof generateWeeklyProgram>) => {
  const day = program.week.find((entry) => entry.title === "Back + Chest");
  expect(day).toBeTruthy();
  if (!day) {
    throw new Error("Missing Back + Chest day.");
  }
  return day;
};

const getBackChestAnchorIds = (
  program: ReturnType<typeof generateWeeklyProgram>,
  label = "back-chest"
) => {
  const day = getBackChestDayFromProgram(program);
  const mainExercises = day.routine
    .filter((item) => item.section === "main")
    .map((item) => exerciseById(item.exerciseId))
    .filter((exercise): exercise is Exercise => Boolean(exercise));
  const horizontalPull = mainExercises.find((exercise) => hasHorizontalPullMain(exercise));
  const verticalPull = mainExercises.find((exercise) => isVerticalPullMain(exercise));
  const horizontalPush = mainExercises.find((exercise) => hasHorizontalPushMain(exercise));
  expect(horizontalPull, `${label} missing horizontal pull`).toBeTruthy();
  expect(verticalPull, `${label} missing vertical pull`).toBeTruthy();
  expect(horizontalPush, `${label} missing horizontal push`).toBeTruthy();
  return {
    horizontalPull: horizontalPull?.id ?? "missing",
    verticalPull: verticalPull?.id ?? "missing",
    horizontalPush: horizontalPush?.id ?? "missing",
  };
};

const getBackChestAnchorSignature = (
  program: ReturnType<typeof generateWeeklyProgram>,
  label = "back-chest"
) => {
  const anchors = getBackChestAnchorIds(program, label);
  return [anchors.horizontalPull, anchors.verticalPull, anchors.horizontalPush].join("|");
};

const getBackChestAnchorDiffCount = (
  left: ReturnType<typeof getBackChestAnchorIds>,
  right: ReturnType<typeof getBackChestAnchorIds>
) =>
  Number(left.horizontalPull !== right.horizontalPull) +
  Number(left.verticalPull !== right.verticalPull) +
  Number(left.horizontalPush !== right.horizontalPush);

const isBandOrCableVerticalPullForTest = (exercise: Exercise) =>
  isVerticalPullMain(exercise) &&
  (exercise.equipment.includes("bands") || exercise.equipment.includes("cables"));

const isBandVerticalPulldownVariantForTest = (exercise: Exercise) => {
  if (!isVerticalPullMain(exercise)) return false;
  if (!exercise.equipment.includes("bands")) return false;
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  return descriptor.includes("lat-pulldown") || descriptor.includes("lat pulldown");
};

const resolveBackChestVariantKeyForTest = (exercise: Exercise) => {
  if (exercise.variantKey) return normalizeToken(exercise.variantKey);
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  if (descriptor.includes("single-arm") || descriptor.includes("single arm")) return "singlearm";
  if (descriptor.includes("iso-hold") || descriptor.includes("isometric")) return "isohold";
  if (descriptor.includes("split-stance") || descriptor.includes("split stance")) {
    return "splitstance";
  }
  if (descriptor.includes("kneeling")) return "kneeling";
  if (descriptor.includes("seated")) return "seated";
  return "bilateral";
};

const isBandUnilateralOrIsoRowForTest = (exerciseId: string) => {
  const exercise = exerciseById(exerciseId);
  if (!exercise) return false;
  if (exercise.familyKey && normalizeToken(exercise.familyKey) !== "bandrow") {
    return false;
  }
  const variant = resolveBackChestVariantKeyForTest(exercise);
  return variant === "singlearm" || variant === "isohold";
};

const backChestBandRowVariantIdsForTest = new Set([
  "band-row",
  "split-stance-row",
  "banded-rows-seated",
  "single-arm-band-row",
  "band-row-iso-hold",
]);

const backChestBandPressVariantIdsForTest = new Set([
  "band-chest-press",
  "split-stance-band-chest-press",
  "tall-kneeling-band-chest-press",
  "band-chest-press-iso-hold",
]);

const countEligibleBandAnchorVariantsForTest = (params: {
  variantIds: Set<string>;
  available: Set<Equipment>;
}) => {
  const { variantIds, available } = params;
  const variantKeys = new Set<string>();
  Array.from(variantIds).forEach((id) => {
    const exercise = exerciseById(id);
    if (!exercise || !isExerciseEligible(exercise, available)) return;
    variantKeys.add(resolveBackChestVariantKeyForTest(exercise));
  });
  return variantKeys.size;
};

const getBackChestAccessoryFamilyKeyForTest = (exercise: Exercise) => {
  if (exercise.familyKey) return normalizeToken(exercise.familyKey);
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  if (descriptor.includes("face-pull") || descriptor.includes("face pull")) return "face_pull";
  if (descriptor.includes("external rotation") || descriptor.includes("external-rotation")) {
    return "external_rotation";
  }
  if (descriptor.includes("pull-apart") || descriptor.includes("pull apart")) return "pull_apart";
  if (
    descriptor.includes("rear-delt") ||
    descriptor.includes("rear delt") ||
    descriptor.includes("reverse pec deck") ||
    descriptor.includes("reverse-pec-deck")
  ) {
    return "rear_delt";
  }
  if (
    descriptor.includes("prone swimmer") ||
    descriptor.includes("reverse snow angel") ||
    descriptor.includes("prone y raise") ||
    descriptor.includes("prone y-raise") ||
    descriptor.includes("prone ytw")
  ) {
    return "prone_scap_control";
  }
  if (descriptor.includes("chest fly") || descriptor.includes("chest-fly")) return "chest_fly";
  if (descriptor.includes("pullover")) return "pullover";
  if (descriptor.includes("back widow")) return "back_widow";
  return exercise.id;
};

const getBackChestMainFamilyKeyForTest = (exercise: Exercise) =>
  normalizeToken(exercise.familyKey ?? exercise.id);

const getBackChestMainFamilyVariantFingerprintForTest = (exercise: Exercise) =>
  `${getBackChestMainFamilyKeyForTest(exercise)}::${resolveBackChestVariantKeyForTest(exercise)}`;

type BackChestMainCategoryForTest =
  | "row"
  | "press"
  | "vertical"
  | "fly"
  | "latAccent"
  | "other";

const isBackChestFlyPatternForTest = (exercise: Exercise) => {
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  return (
    descriptor.includes("fly") ||
    descriptor.includes("pec deck") ||
    descriptor.includes("pec-deck")
  );
};

const isBackChestLatAccentForTest = (exercise: Exercise) => {
  const family = normalizeToken(exercise.familyKey ?? "");
  if (family.includes("pullover")) return true;
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  return descriptor.includes("pullover");
};

const resolveBackChestMainCategoryForTest = (
  exercise: Exercise
): BackChestMainCategoryForTest => {
  if (isBackChestFlyPatternForTest(exercise)) return "fly";
  if (isVerticalPullMain(exercise)) return "vertical";
  if (isBackChestLatAccentForTest(exercise)) return "latAccent";
  if (hasHorizontalPullMain(exercise)) return "row";
  if (hasHorizontalPushMain(exercise)) return "press";
  return "other";
};

const resolveBackChestStimulusKeyForTest = (exercise: Exercise) => {
  const category = resolveBackChestMainCategoryForTest(exercise);
  const family = getBackChestMainFamilyKeyForTest(exercise);
  const variant = resolveBackChestVariantKeyForTest(exercise);
  const unilateral = variant === "singlearm" ? "single" : "bilateral";
  const isIso = variant === "isohold" || exercise.loadType === "timed" ? "iso" : "dynamic";
  return `${family}::${category}::${unilateral}::${isIso}::${exercise.loadType}`;
};

const isBackChestShoulderPressLeakForTest = (exercise: Exercise) => {
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  return (
    descriptor.includes("shoulder press") ||
    descriptor.includes("strict press") ||
    descriptor.includes("overhead press") ||
    descriptor.includes("arnold press")
  );
};

const isBackChestMainBoundaryAllowedForTest = (exercise: Exercise) =>
  !hasVerticalPushMain(exercise) &&
  !isBackChestShoulderPressLeakForTest(exercise) &&
  !isLowerBodyExerciseForBackChestGuard(exercise) &&
  !isShoulderIsolationLeakForBackChestGuard(exercise) &&
  (hasHorizontalPullMain(exercise) ||
    hasHorizontalPushMain(exercise) ||
    isVerticalPullMain(exercise) ||
    isChestIsolationAccessory(exercise));

const resolveExerciseTierForTest = (exercise: Exercise) => {
  if (exercise.tier) return exercise.tier;
  const weightedWithDbOrBb =
    exercise.loadType === "weighted" &&
    (exercise.equipment.includes("dumbbells") || exercise.equipment.includes("barbell"));
  return weightedWithDbOrBb ? 2 : 1;
};

const hasSameTierBackChestAnchorAlternative = (params: {
  selected: Exercise;
  role: "horizontalPull" | "verticalPull" | "horizontalPush";
  available: Set<Equipment>;
}) => {
  const { selected, role, available } = params;
  const selectedTier = resolveExerciseTierForTest(selected);
  return exercises
    .filter((exercise) => exercise.category === "main")
    .filter((exercise) => exercise.id !== selected.id)
    .filter((exercise) => isExerciseEligible(exercise, available))
    .filter((exercise) => resolveExerciseTierForTest(exercise) === selectedTier)
    .some((exercise) => {
      if (role === "horizontalPull") return hasHorizontalPullMain(exercise);
      if (role === "verticalPull") return isVerticalPullMain(exercise);
      return hasHorizontalPushMain(exercise);
    });
};

const hasAnySameTierAnchorAlternative = (params: {
  program: ReturnType<typeof generateWeeklyProgram>;
  questionnaire: QuestionnaireData;
}) => {
  const { program, questionnaire } = params;
  const day = getBackChestDayFromProgram(program);
  const mainExercises = day.routine
    .filter((item) => item.section === "main")
    .map((item) => exerciseById(item.exerciseId))
    .filter((exercise): exercise is Exercise => Boolean(exercise));
  const horizontalPull = mainExercises.find((exercise) => hasHorizontalPullMain(exercise));
  const verticalPull = mainExercises.find((exercise) => isVerticalPullMain(exercise));
  const horizontalPush = mainExercises.find((exercise) => hasHorizontalPushMain(exercise));
  if (!horizontalPull || !verticalPull || !horizontalPush) return false;
  const available = normalizeEquipmentSelection(questionnaire.equipment).available;
  return (
    hasSameTierBackChestAnchorAlternative({
      selected: horizontalPull,
      role: "horizontalPull",
      available,
    }) ||
    hasSameTierBackChestAnchorAlternative({
      selected: verticalPull,
      role: "verticalPull",
      available,
    }) ||
    hasSameTierBackChestAnchorAlternative({
      selected: horizontalPush,
      role: "horizontalPush",
      available,
    })
  );
};

const countEligibleBackChestRoleCandidatesForTest = (params: {
  questionnaire: QuestionnaireData;
  role: "horizontalPull" | "horizontalPush" | "verticalPull";
}) => {
  const { questionnaire, role } = params;
  const available = normalizeEquipmentSelection(questionnaire.equipment).available;
  if (questionnaire.equipment.includes("gym")) {
    available.add("machines");
    available.add("cables");
  }
  return exercises
    .filter((exercise) => exercise.category === "main")
    .filter((exercise) => isExerciseEligible(exercise, available))
    .filter((exercise) =>
      meetsExperienceMinForTest(exercise, questionnaire.experience)
    )
    .filter((exercise) => isBackChestMainBoundaryAllowedForTest(exercise))
    .filter((exercise) => {
      if (role === "horizontalPull") return hasHorizontalPullMain(exercise);
      if (role === "horizontalPush") return hasHorizontalPushMain(exercise);
      return isVerticalPullMain(exercise);
    }).length;
};

const countSameTierAnchorAlternatives = (params: {
  program: ReturnType<typeof generateWeeklyProgram>;
  questionnaire: QuestionnaireData;
}) => {
  const { program, questionnaire } = params;
  const anchors = getBackChestAnchorIds(program, "same-tier-alternatives");
  const day = getBackChestDayFromProgram(program);
  const mainExercises = day.routine
    .filter((item) => item.section === "main")
    .map((item) => exerciseById(item.exerciseId))
    .filter((exercise): exercise is Exercise => Boolean(exercise));
  const horizontalPull = mainExercises.find((exercise) => exercise.id === anchors.horizontalPull);
  const verticalPull = mainExercises.find((exercise) => exercise.id === anchors.verticalPull);
  const horizontalPush = mainExercises.find((exercise) => exercise.id === anchors.horizontalPush);
  if (!horizontalPull || !verticalPull || !horizontalPush) return 0;
  const available = normalizeEquipmentSelection(questionnaire.equipment).available;
  return Number(
    hasSameTierBackChestAnchorAlternative({
      selected: horizontalPull,
      role: "horizontalPull",
      available,
    })
  ) +
    Number(
      hasSameTierBackChestAnchorAlternative({
        selected: verticalPull,
        role: "verticalPull",
        available,
      })
    ) +
    Number(
      hasSameTierBackChestAnchorAlternative({
        selected: horizontalPush,
        role: "horizontalPush",
        available,
      })
    );
};

const getBackChestFullRoutineIds = (program: ReturnType<typeof generateWeeklyProgram>) =>
  getBackChestDayFromProgram(program).routine.map((item) => item.exerciseId);

const countEligibleBackChestSecondaryCandidatesForTest = (params: {
  questionnaire: QuestionnaireData;
  category: "row" | "press";
}) => {
  const { questionnaire, category } = params;
  const available = normalizeEquipmentSelection(questionnaire.equipment).available;
  if (questionnaire.equipment.includes("gym")) {
    available.add("machines");
    available.add("cables");
    available.add("pullup_bar");
  }
  return exercises
    .filter((exercise) => exercise.category === "main")
    .filter((exercise) => isExerciseEligible(exercise, available))
    .filter((exercise) => meetsExperienceMinForTest(exercise, questionnaire.experience))
    .filter((exercise) => isBackChestMainBoundaryAllowedForTest(exercise))
    .filter((exercise) => {
      if (category === "row") return resolveBackChestMainCategoryForTest(exercise) === "row";
      return resolveBackChestMainCategoryForTest(exercise) === "press";
    }).length;
};

const isBandPressForTest = (exercise: Exercise) =>
  `${exercise.id} ${exercise.name}`.toLowerCase().includes("band chest press");

const isSuspensionRowLikeAccessoryForTest = (exercise: Exercise) => {
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  return descriptor.includes("suspension-row") || descriptor.includes("suspension row");
};

const advanceToNextPhaseForBackChest = (params: {
  currentProgram: ReturnType<typeof generateWeeklyProgram>;
  questionnaire: QuestionnaireData;
  nextProgramId: string;
  seed: string;
}) => {
  const next = generateNextPhaseProgram({
    currentProgram: params.currentProgram,
    questionnaire: params.questionnaire,
    painFlag: false,
    complianceRate: 0.95,
    fatigueFlag: false,
    completedSessionsCount: 6,
    completedWeeksCount: 2,
    nextProgramId: params.nextProgramId,
    seed: params.seed,
  });
  expect(next.status).toBe("advanced");
  if (next.status !== "advanced") {
    throw new Error(`Expected advanced status for ${params.nextProgramId}.`);
  }
  return next.program;
};

describe("back + chest contract regression", () => {
  test("pain beginner growth 3-day bands keeps structural push-pull architecture", () => {
    const questionnaire: QuestionnaireData = {
      goals: "Reduce pain",
      painAreas: ["low_back", "shoulders"],
      experience: "Beginner",
      daysPerWeek: 3,
      equipment: ["bands"],
    };

    const program = generateWeeklyProgram(questionnaire, "regression-back-chest-band-only", {
      phaseIndex: 3,
      seed: "regression-back-chest-band-only",
    });

    const backChestDay = program.week.find((day) => day.title === "Back + Chest");
    expect(backChestDay).toBeTruthy();
    if (!backChestDay) return;

    const mainExercises = backChestDay.routine
      .filter((item) => item.section === "main")
      .map((item) => exerciseById(item.exerciseId))
      .filter((exercise): exercise is Exercise => Boolean(exercise));
    expect(mainExercises.length).toBeGreaterThanOrEqual(3);
    expect(mainExercises.filter((exercise) => hasHorizontalPushMain(exercise)).length).toBe(1);
    expect(mainExercises.filter((exercise) => hasHorizontalPullMain(exercise)).length).toBe(1);
    expect(mainExercises.filter((exercise) => isVerticalPullMain(exercise)).length).toBe(1);

    const accessoryExercises = backChestDay.routine
      .filter((item) => item.section === "accessory")
      .map((item) => exerciseById(item.exerciseId))
      .filter((exercise): exercise is Exercise => Boolean(exercise));
    expect(accessoryExercises.length).toBeGreaterThanOrEqual(2);
    expect(accessoryExercises.every((exercise) => isBackAccessory(exercise))).toBe(true);
    expect(accessoryExercises.some((exercise) => isRearDeltOrExternalAccessory(exercise))).toBe(
      true
    );
    expect(accessoryExercises.filter((exercise) => isChestIsolationAccessory(exercise)).length).toBeLessThanOrEqual(1);
    expect(accessoryExercises.some((exercise) => isRedundantBackAccessory(exercise))).toBe(false);

    const volume = pullVsPushVolume([...mainExercises, ...accessoryExercises]);
    expect(volume.pull).toBeGreaterThanOrEqual(volume.push);
  });

  test("gym profile keeps accessory posterior bias and avoids redundant row stacking", () => {
    const questionnaire: QuestionnaireData = {
      goals: "Improve posture",
      painAreas: [],
      experience: "Beginner",
      daysPerWeek: 3,
      equipment: ["gym"],
    };

    const program = generateWeeklyProgram(questionnaire, "regression-back-chest-gym-priority", {
      phaseIndex: 2,
      seed: "regression-back-chest-gym-priority",
    });

    const backChestDay = program.week.find((day) => day.title === "Back + Chest");
    expect(backChestDay).toBeTruthy();
    if (!backChestDay) return;

    const mainExercises = backChestDay.routine
      .filter((item) => item.section === "main")
      .map((item) => exerciseById(item.exerciseId))
      .filter((exercise): exercise is Exercise => Boolean(exercise));
    const accessoryExercises = backChestDay.routine
      .filter((item) => item.section === "accessory")
      .map((item) => exerciseById(item.exerciseId))
      .filter((exercise): exercise is Exercise => Boolean(exercise));

    expect(accessoryExercises.length).toBeGreaterThanOrEqual(2);
    expect(
      accessoryExercises.every(
        (exercise) => isBackAccessory(exercise) || hasChestFlyAccessory(exercise)
      )
    ).toBe(true);
    expect(accessoryExercises.every((exercise) => isLoadedOrAssistedAccessory(exercise))).toBe(
      true
    );
    expect(accessoryExercises.some((exercise) => isRearDeltOrExternalAccessory(exercise))).toBe(
      true
    );
    if (accessoryExercises.some((exercise) => hasChestFlyAccessory(exercise))) {
      expect(accessoryExercises.some((exercise) => isRearDeltAccessory(exercise))).toBe(true);
      expect(accessoryExercises.some((exercise) => isScapOrExternalAccessory(exercise))).toBe(
        true
      );
    }
    expect(accessoryExercises.some((exercise) => isRedundantBackAccessory(exercise))).toBe(false);
    expect(includesAnyRedundantBackId(accessoryExercises)).toBe(false);
    expect(accessoryExercises.filter((exercise) => isChestIsolationAccessory(exercise)).length).toBeLessThanOrEqual(1);

    const volume = pullVsPushVolume([...mainExercises, ...accessoryExercises]);
    expect(volume.pull).toBeGreaterThanOrEqual(volume.push);
  });

  test("phase 1 gym prioritizes machine mains and shoulder-health accessories", () => {
    const questionnaire: QuestionnaireData = {
      goals: "Improve posture",
      painAreas: [],
      experience: "Beginner",
      daysPerWeek: 3,
      equipment: ["gym"],
    };

    const program = generateWeeklyProgram(
      questionnaire,
      "regression-back-chest-phase1-machine-priority",
      {
        phaseIndex: 1,
        seed: "regression-back-chest-phase1-machine-priority",
      }
    );

    const backChestDay = program.week.find((day) => day.title === "Back + Chest");
    expect(backChestDay).toBeTruthy();
    if (!backChestDay) return;

    const mainExercises = backChestDay.routine
      .filter((item) => item.section === "main")
      .map((item) => exerciseById(item.exerciseId))
      .filter((exercise): exercise is Exercise => Boolean(exercise));
    const machineMains = mainExercises.filter((exercise) =>
      exercise.equipment.includes("machines")
    );

    expect(machineMains.length).toBeGreaterThanOrEqual(2);
    expect(mainExercises.some((exercise) => exercise.id === "machine-seated-row")).toBe(true);
    expect(mainExercises.some((exercise) => exercise.id === "machine-lat-pulldown")).toBe(true);
    expect(mainExercises.filter((exercise) => hasHorizontalPushMain(exercise)).length).toBe(1);
    expect(mainExercises.filter((exercise) => hasHorizontalPullMain(exercise)).length).toBe(1);
    expect(mainExercises.filter((exercise) => isVerticalPullMain(exercise)).length).toBe(1);

    const accessoryExercises = backChestDay.routine
      .filter((item) => item.section === "accessory")
      .map((item) => exerciseById(item.exerciseId))
      .filter((exercise): exercise is Exercise => Boolean(exercise));
    expect(accessoryExercises.every((exercise) => isBackAccessory(exercise))).toBe(true);
    expect(accessoryExercises.every((exercise) => isLoadedOrAssistedAccessory(exercise))).toBe(
      true
    );
    expect(accessoryExercises.some((exercise) => isRearDeltOrExternalAccessory(exercise))).toBe(
      true
    );
    expect(accessoryExercises.some((exercise) => isRedundantBackAccessory(exercise))).toBe(false);
    expect(includesAnyRedundantBackId(accessoryExercises)).toBe(false);
  });

  test("experience scaling applies fixed Back + Chest main/accessory counts", () => {
    const cases: Array<{
      experience: QuestionnaireData["experience"];
      expectedMain: number;
      expectedAccessory: number;
    }> = [
      { experience: "Beginner", expectedMain: 3, expectedAccessory: 2 },
      { experience: "Intermediate", expectedMain: 4, expectedAccessory: 2 },
      { experience: "Advanced", expectedMain: 5, expectedAccessory: 2 },
    ];

    cases.forEach(({ experience, expectedMain, expectedAccessory }) => {
      const questionnaire: QuestionnaireData = {
        goals: "Improve posture",
        painAreas: [],
        experience,
        daysPerWeek: 3,
        equipment: ["gym"],
      };
      const program = generateWeeklyProgram(
        questionnaire,
        `regression-back-chest-scaling-${experience.toLowerCase()}`,
        {
          phaseIndex: 2,
          seed: `regression-back-chest-scaling-${experience.toLowerCase()}`,
        }
      );
      const backChestDay = program.week.find((day) => day.title === "Back + Chest");
      expect(backChestDay).toBeTruthy();
      if (!backChestDay) return;

      const mainExercises = backChestDay.routine
        .filter((item) => item.section === "main")
        .map((item) => exerciseById(item.exerciseId))
        .filter((exercise): exercise is Exercise => Boolean(exercise));
      const accessoryExercises = backChestDay.routine
        .filter((item) => item.section === "accessory")
        .map((item) => exerciseById(item.exerciseId))
        .filter((exercise): exercise is Exercise => Boolean(exercise));

      expect(mainExercises.length).toBe(expectedMain);
      expect(accessoryExercises.length).toBe(expectedAccessory);
      expect(mainExercises.filter((exercise) => hasHorizontalPushMain(exercise)).length).toBeGreaterThanOrEqual(1);
      expect(mainExercises.filter((exercise) => hasHorizontalPushMain(exercise)).length).toBeLessThanOrEqual(2);
      expect(mainExercises.filter((exercise) => hasHorizontalPullMain(exercise)).length).toBeGreaterThanOrEqual(1);
      expect(mainExercises.filter((exercise) => isVerticalPullMain(exercise)).length).toBeGreaterThanOrEqual(1);
      expect(
        mainExercises.filter((exercise) => isChestIsolationAccessory(exercise)).length
      ).toBeLessThanOrEqual(1);
    });
  });

  test("advanced Back + Chest keeps pull bias, press cap, no floor-press default, and no duplicate row angles", () => {
    const questionnaire: QuestionnaireData = {
      goals: "Athletic performance",
      painAreas: [],
      experience: "Advanced",
      daysPerWeek: 3,
      equipment: ["gym", "pullup_bar"],
    };

    const program = generateWeeklyProgram(
      questionnaire,
      "regression-back-chest-advanced-pattern-integrity",
      {
        phaseIndex: 3,
        seed: "regression-back-chest-advanced-pattern-integrity",
      }
    );
    const backChestDay = program.week.find((day) => day.title === "Back + Chest");
    expect(backChestDay).toBeTruthy();
    if (!backChestDay) return;

    const mainExercises = backChestDay.routine
      .filter((item) => item.section === "main")
      .map((item) => exerciseById(item.exerciseId))
      .filter((exercise): exercise is Exercise => Boolean(exercise));
    expect(mainExercises.length).toBe(5);
    expect(pullMainCount(mainExercises)).toBeGreaterThanOrEqual(3);
    expect(pressingMainCount(mainExercises)).toBeLessThanOrEqual(2);
    expect(mainExercises.filter((exercise) => hasHorizontalPushMain(exercise)).length).toBeGreaterThanOrEqual(1);
    expect(mainExercises.filter((exercise) => hasHorizontalPushMain(exercise)).length).toBeLessThanOrEqual(2);
    expect(mainExercises.filter((exercise) => hasHorizontalPullMain(exercise)).length).toBeGreaterThanOrEqual(1);
    expect(mainExercises.filter((exercise) => isVerticalPullMain(exercise)).length).toBeGreaterThanOrEqual(1);
    expect(hasDuplicateRowAngles(mainExercises)).toBe(false);
    expect(
      mainExercises.some((exercise) => exercise.id === "dumbbell-floor-press")
    ).toBe(false);
  });

  test("intermediate phase 2 gym Back + Chest required mains avoid tier 1 when tier 2 options exist for the same slot", () => {
    const questionnaire: QuestionnaireData = {
      goals: "Improve posture",
      painAreas: [],
      experience: "Intermediate",
      daysPerWeek: 3,
      equipment: ["gym"],
    };

    const program = generateWeeklyProgram(
      questionnaire,
      "regression-back-chest-intermediate-skill-tier2-floor",
      {
        phaseIndex: 2,
        seed: "regression-back-chest-intermediate-skill-tier2-floor",
      }
    );
    const backChestDay = program.week.find((day) => day.title === "Back + Chest");
    expect(backChestDay).toBeTruthy();
    if (!backChestDay) return;

    const mainExercises = backChestDay.routine
      .filter((item) => item.section === "main")
      .map((item) => exerciseById(item.exerciseId))
      .filter((exercise): exercise is Exercise => Boolean(exercise));

    const horizontalPullMain = mainExercises.find((exercise) => hasHorizontalPullMain(exercise));
    const horizontalPushMain = mainExercises.find((exercise) => hasHorizontalPushMain(exercise));
    const verticalPullMain = mainExercises.find((exercise) => isVerticalPullMain(exercise));
    expect(horizontalPullMain).toBeTruthy();
    expect(horizontalPushMain).toBeTruthy();
    expect(verticalPullMain).toBeTruthy();
    if (!horizontalPullMain || !horizontalPushMain || !verticalPullMain) return;

    const available = normalizeEquipmentSelection(["gym"]).available;
    const hasTier2ForHorizontalPull = exercises
      .filter((exercise) => exercise.category === "main")
      .filter((exercise) => hasHorizontalPullMain(exercise))
      .filter((exercise) => !isChestIsolationAccessory(exercise))
      .filter((exercise) => isExerciseEligible(exercise, available))
      .filter((exercise) => isEligibleForSkillPhaseInTest(exercise))
      .filter((exercise) => meetsExperienceMinIntermediateInTest(exercise))
      .some((exercise) => resolveTierForTest(exercise) >= 2);
    const hasTier2ForHorizontalPush = exercises
      .filter((exercise) => exercise.category === "main")
      .filter((exercise) => hasHorizontalPushMain(exercise))
      .filter((exercise) => !isChestIsolationAccessory(exercise))
      .filter((exercise) => isExerciseEligible(exercise, available))
      .filter((exercise) => isEligibleForSkillPhaseInTest(exercise))
      .filter((exercise) => meetsExperienceMinIntermediateInTest(exercise))
      .some((exercise) => resolveTierForTest(exercise) >= 2);
    const hasTier2ForVerticalPull = exercises
      .filter((exercise) => exercise.category === "main")
      .filter((exercise) => isVerticalPullMain(exercise))
      .filter((exercise) => isExerciseEligible(exercise, available))
      .filter((exercise) => isEligibleForSkillPhaseInTest(exercise))
      .filter((exercise) => meetsExperienceMinIntermediateInTest(exercise))
      .some((exercise) => resolveTierForTest(exercise) >= 2);

    if (hasTier2ForHorizontalPull) {
      expect(resolveTierForTest(horizontalPullMain)).toBeGreaterThanOrEqual(2);
    }
    if (hasTier2ForHorizontalPush) {
      expect(resolveTierForTest(horizontalPushMain)).toBeGreaterThanOrEqual(2);
    }
    if (hasTier2ForVerticalPull) {
      expect(resolveTierForTest(verticalPullMain)).toBeGreaterThanOrEqual(2);
    }
  });

  test("beginner phase 3 gym Back + Chest keeps horizontal row/press anchors at tier 2 unless tier 3 is explicitly supported", () => {
    const questionnaire: QuestionnaireData = {
      goals: "Athletic performance",
      painAreas: [],
      experience: "Beginner",
      daysPerWeek: 3,
      equipment: ["gym"],
    };

    const program = generateWeeklyProgram(
      questionnaire,
      "regression-back-chest-beginner-growth-safety-cap",
      {
        phaseIndex: 3,
        seed: "regression-back-chest-beginner-growth-safety-cap",
      }
    );
    const backChestDay = program.week.find((day) => day.title === "Back + Chest");
    expect(backChestDay).toBeTruthy();
    if (!backChestDay) return;

    const mainExercises = backChestDay.routine
      .filter((item) => item.section === "main")
      .map((item) => exerciseById(item.exerciseId))
      .filter((exercise): exercise is Exercise => Boolean(exercise));

    const horizontalPullMain = mainExercises.find((exercise) => hasHorizontalPullMain(exercise));
    const horizontalPushMain = mainExercises.find((exercise) => hasHorizontalPushMain(exercise));
    expect(horizontalPullMain).toBeTruthy();
    expect(horizontalPushMain).toBeTruthy();
    if (!horizontalPullMain || !horizontalPushMain) return;

    expect(horizontalPullMain.id).not.toBe("barbell-bent-over-row");
    expect(horizontalPushMain.id).not.toBe("barbell-bench-press-paused");

    [horizontalPullMain, horizontalPushMain].forEach((exercise) => {
      const tier = resolveTierForTest(exercise);
      if (tier >= 3) {
        expect(isSafeTier3BeginnerBackChestAnchorForTest(exercise)).toBe(true);
      } else {
        expect(tier).toBeLessThanOrEqual(2);
      }
    });
  });

  test("reduce pain beginner bands+dumbbells rotates Back + Chest mains across phases and keeps phase 3 tier-2-safe", () => {
    const questionnaire: QuestionnaireData = {
      goals: "Reduce pain",
      painAreas: ["shoulders"],
      experience: "Beginner",
      daysPerWeek: 3,
      equipment: ["bands", "dumbbells"],
    };

    const phase1 = generateWeeklyProgram(questionnaire, "regression-back-chest-reduce-pain-p1", {
      phaseIndex: 1,
      seed: "regression-back-chest-reduce-pain-p1",
    });
    const phase2Result = generateNextPhaseProgram({
      currentProgram: phase1,
      questionnaire,
      painFlag: false,
      complianceRate: 0.95,
      fatigueFlag: false,
      completedSessionsCount: 6,
      completedWeeksCount: 2,
      nextProgramId: "regression-back-chest-reduce-pain-p2",
      seed: "regression-back-chest-reduce-pain-p2",
    });
    expect(phase2Result.status).toBe("advanced");
    if (phase2Result.status !== "advanced") return;

    const phase3Result = generateNextPhaseProgram({
      currentProgram: phase2Result.program,
      questionnaire,
      painFlag: false,
      complianceRate: 0.95,
      fatigueFlag: false,
      completedSessionsCount: 6,
      completedWeeksCount: 2,
      nextProgramId: "regression-back-chest-reduce-pain-p3",
      seed: "regression-back-chest-reduce-pain-p3",
    });
    expect(phase3Result.status).toBe("advanced");
    if (phase3Result.status !== "advanced") return;

    const phase1BackChest = phase1.week.find((day) => day.title === "Back + Chest");
    const phase2BackChest = phase2Result.program.week.find((day) => day.title === "Back + Chest");
    const phase3BackChest = phase3Result.program.week.find((day) => day.title === "Back + Chest");
    expect(phase1BackChest).toBeTruthy();
    expect(phase2BackChest).toBeTruthy();
    expect(phase3BackChest).toBeTruthy();
    if (!phase1BackChest || !phase2BackChest || !phase3BackChest) return;

    const phase1MainIds = phase1BackChest.routine
      .filter((item) => item.section === "main")
      .map((item) => item.exerciseId)
      .join("|");
    const phase2MainIds = phase2BackChest.routine
      .filter((item) => item.section === "main")
      .map((item) => item.exerciseId)
      .join("|");
    const phase3MainIds = phase3BackChest.routine
      .filter((item) => item.section === "main")
      .map((item) => item.exerciseId)
      .join("|");

    expect(phase2MainIds).not.toBe(phase1MainIds);
    expect(phase3MainIds).not.toBe(phase2MainIds);

    const phase3MainExercises = phase3BackChest.routine
      .filter((item) => item.section === "main")
      .map((item) => exerciseById(item.exerciseId))
      .filter((exercise): exercise is Exercise => Boolean(exercise));
    const phase3HorizontalPullMain = phase3MainExercises.find((exercise) =>
      hasHorizontalPullMain(exercise)
    );
    const phase3HorizontalPushMain = phase3MainExercises.find((exercise) =>
      hasHorizontalPushMain(exercise)
    );
    expect(phase3HorizontalPullMain).toBeTruthy();
    expect(phase3HorizontalPushMain).toBeTruthy();
    if (!phase3HorizontalPullMain || !phase3HorizontalPushMain) return;

    expect(phase3MainExercises.map((exercise) => exercise.id)).not.toContain("barbell-bent-over-row");
    expect(phase3MainExercises.map((exercise) => exercise.id)).not.toContain("pendlay-row");
    expect(resolveTierForTest(phase3HorizontalPullMain)).toBeLessThanOrEqual(2);
    expect(resolveTierForTest(phase3HorizontalPushMain)).toBeLessThanOrEqual(2);
  });

  test("phase progression rotates Back + Chest accessory pairing across phases", () => {
    const questionnaire: QuestionnaireData = {
      goals: "Improve posture",
      painAreas: [],
      experience: "Beginner",
      daysPerWeek: 3,
      equipment: ["gym"],
    };

    const phase1 = generateWeeklyProgram(questionnaire, "regression-back-chest-phase1-rotation", {
      phaseIndex: 1,
      seed: "regression-back-chest-phase1-rotation",
    });
    const phase2Advanced = generateNextPhaseProgram({
      currentProgram: phase1,
      questionnaire,
      painFlag: false,
      complianceRate: 0.95,
      fatigueFlag: false,
      completedSessionsCount: 6,
      completedWeeksCount: 2,
      nextProgramId: "regression-back-chest-phase2-rotation",
      seed: "regression-back-chest-phase2-rotation",
    });

    expect(phase2Advanced.status).toBe("advanced");
    if (phase2Advanced.status !== "advanced") return;
    const phase3Advanced = generateNextPhaseProgram({
      currentProgram: phase2Advanced.program,
      questionnaire,
      painFlag: false,
      complianceRate: 0.95,
      fatigueFlag: false,
      completedSessionsCount: 6,
      completedWeeksCount: 2,
      nextProgramId: "regression-back-chest-phase3-rotation",
      seed: "regression-back-chest-phase3-rotation",
    });
    expect(phase3Advanced.status).toBe("advanced");
    if (phase3Advanced.status !== "advanced") return;

    const phase1BackChest = phase1.week.find((day) => day.title === "Back + Chest");
    const phase2BackChest = phase2Advanced.program.week.find((day) => day.title === "Back + Chest");
    const phase3BackChest = phase3Advanced.program.week.find((day) => day.title === "Back + Chest");
    expect(phase1BackChest).toBeTruthy();
    expect(phase2BackChest).toBeTruthy();
    expect(phase3BackChest).toBeTruthy();
    if (!phase1BackChest || !phase2BackChest || !phase3BackChest) return;

    const phase1Signature = phase1BackChest.routine
      .filter((item) => item.section === "accessory")
      .map((item) => item.exerciseId)
      .sort((left, right) => left.localeCompare(right))
      .join("|");
    const phase2Signature = phase2BackChest.routine
      .filter((item) => item.section === "accessory")
      .map((item) => item.exerciseId)
      .sort((left, right) => left.localeCompare(right))
      .join("|");
    const phase3Signature = phase3BackChest.routine
      .filter((item) => item.section === "accessory")
      .map((item) => item.exerciseId)
      .sort((left, right) => left.localeCompare(right))
      .join("|");

    expect(phase2Signature).not.toBe(phase1Signature);
    expect(phase3Signature).not.toBe(phase2Signature);
  });

  test("gym phase 2 Back + Chest keeps structural accessory architecture when chest lane rotates", () => {
    const questionnaire: QuestionnaireData = {
      goals: "Improve posture",
      painAreas: [],
      experience: "Beginner",
      daysPerWeek: 3,
      equipment: ["gym"],
    };
    const withFlySeed = "phase2-gym-fly-cycle-with-fly";
    const withoutFlySeed = "phase2-gym-fly-cycle-without-fly";
    const withFlyProgram = generateWeeklyProgram(questionnaire, "phase2-gym-fly-cycle-with-fly", {
      phaseIndex: 2,
      seed: withFlySeed,
    });
    const withoutFlyProgram = generateWeeklyProgram(
      questionnaire,
      "phase2-gym-fly-cycle-without-fly",
      {
        phaseIndex: 2,
        seed: withoutFlySeed,
      }
    );
    const withFlyDay = withFlyProgram.week.find((day) => day.title === "Back + Chest");
    const withoutFlyDay = withoutFlyProgram.week.find((day) => day.title === "Back + Chest");
    expect(withFlyDay).toBeTruthy();
    expect(withoutFlyDay).toBeTruthy();
    if (!withFlyDay || !withoutFlyDay) return;

    const withFlyMainExercises = withFlyDay.routine
      .filter((item) => item.section === "main")
      .map((item) => exerciseById(item.exerciseId))
      .filter((exercise): exercise is Exercise => Boolean(exercise));
    const withFlyAccessoryExercises = withFlyDay.routine
      .filter((item) => item.section === "accessory")
      .map((item) => exerciseById(item.exerciseId))
      .filter((exercise): exercise is Exercise => Boolean(exercise));
    const withoutFlyMainExercises = withoutFlyDay.routine
      .filter((item) => item.section === "main")
      .map((item) => exerciseById(item.exerciseId))
      .filter((exercise): exercise is Exercise => Boolean(exercise));
    const withoutFlyAccessoryExercises = withoutFlyDay.routine
      .filter((item) => item.section === "accessory")
      .map((item) => exerciseById(item.exerciseId))
      .filter((exercise): exercise is Exercise => Boolean(exercise));
    expect(withFlyAccessoryExercises.some((exercise) => isRearDeltAccessory(exercise))).toBe(true);
    expect(withFlyAccessoryExercises.some((exercise) => isScapOrExternalAccessory(exercise))).toBe(
      true
    );
    expect(withoutFlyAccessoryExercises.some((exercise) => isRearDeltAccessory(exercise))).toBe(
      true
    );
    expect(
      withoutFlyAccessoryExercises.some((exercise) => isScapOrExternalAccessory(exercise))
    ).toBe(true);
  });

  test("improve posture phase 2 Back + Chest keeps posterior bias when chest fly is cycled", () => {
    const questionnaire: QuestionnaireData = {
      goals: "Improve posture",
      painAreas: [],
      experience: "Beginner",
      daysPerWeek: 3,
      equipment: ["gym"],
    };

    const program = generateWeeklyProgram(
      questionnaire,
      "regression-back-chest-posture-no-chest-fly",
      {
        phaseIndex: 2,
        seed: "regression-back-chest-posture-no-chest-fly",
      }
    );
    const backChestDay = program.week.find((day) => day.title === "Back + Chest");
    expect(backChestDay).toBeTruthy();
    if (!backChestDay) return;

    const mainExercises = backChestDay.routine
      .filter((item) => item.section === "main")
      .map((item) => exerciseById(item.exerciseId))
      .filter((exercise): exercise is Exercise => Boolean(exercise));
    const accessoryExercises = backChestDay.routine
      .filter((item) => item.section === "accessory")
      .map((item) => exerciseById(item.exerciseId))
      .filter((exercise): exercise is Exercise => Boolean(exercise));

    expect(accessoryExercises.filter((exercise) => hasChestFlyAccessory(exercise)).length).toBeLessThanOrEqual(1);
    const volume = pullVsPushVolume([...mainExercises, ...accessoryExercises]);
    expect(volume.pull).toBeGreaterThanOrEqual(volume.push);
    expect(accessoryExercises.some((exercise) => isRearDeltAccessory(exercise))).toBe(true);
    expect(accessoryExercises.some((exercise) => isScapOrExternalAccessory(exercise))).toBe(true);
    expect(accessoryExercises.some((exercise) => isRearDeltOrExternalAccessory(exercise))).toBe(
      true
    );
  });

  test("Back + Chest accessory rep targets stay phase-specific (10-15 in phase 1/2, 8-12 in phase 3)", () => {
    const questionnaire: QuestionnaireData = {
      goals: "Reduce pain",
      painAreas: [],
      experience: "Beginner",
      daysPerWeek: 3,
      equipment: ["gym"],
    };
    const phase1 = generateWeeklyProgram(questionnaire, "back-chest-accessory-reps-p1", {
      phaseIndex: 1,
      seed: "back-chest-accessory-reps",
    });
    const phase2 = advanceToNextPhaseForBackChest({
      currentProgram: phase1,
      questionnaire,
      nextProgramId: "back-chest-accessory-reps-p2",
      seed: "back-chest-accessory-reps-p2",
    });
    const phase3 = advanceToNextPhaseForBackChest({
      currentProgram: phase2,
      questionnaire,
      nextProgramId: "back-chest-accessory-reps-p3",
      seed: "back-chest-accessory-reps-p3",
    });

    const phase1Accessories = getBackChestDayFromProgram(phase1).routine.filter(
      (item) => item.section === "accessory"
    );
    const phase2Accessories = getBackChestDayFromProgram(phase2).routine.filter(
      (item) => item.section === "accessory"
    );
    const phase3Accessories = getBackChestDayFromProgram(phase3).routine.filter(
      (item) => item.section === "accessory"
    );

    expect(phase1Accessories.length).toBeGreaterThan(0);
    expect(phase2Accessories.length).toBeGreaterThan(0);
    expect(phase3Accessories.length).toBeGreaterThan(0);
    phase1Accessories.forEach((item) => expect(item.reps).toBe("10-15"));
    phase2Accessories.forEach((item) => expect(item.reps).toBe("10-15"));
    phase3Accessories.forEach((item) => expect(item.reps).toBe("8-12"));
  });

  test("athletic performance intermediate phase 3 prefers pull-up family over pulldown when eligible", () => {
    const questionnaire: QuestionnaireData = {
      goals: "Athletic performance",
      painAreas: [],
      experience: "Intermediate",
      daysPerWeek: 3,
      equipment: ["gym", "pullup bar"],
    };

    const program = generateWeeklyProgram(
      questionnaire,
      "regression-back-chest-athletic-pullup-preference",
      {
        phaseIndex: 3,
        seed: "regression-back-chest-athletic-pullup-preference",
      }
    );
    const backChestDay = program.week.find((day) => day.title === "Back + Chest");
    expect(backChestDay).toBeTruthy();
    if (!backChestDay) return;

    const mainExercises = backChestDay.routine
      .filter((item) => item.section === "main")
      .map((item) => exerciseById(item.exerciseId))
      .filter((exercise): exercise is Exercise => Boolean(exercise));
    const verticalPullMain = mainExercises.find((exercise) => isVerticalPullMain(exercise));
    expect(verticalPullMain).toBeTruthy();
    if (!verticalPullMain) return;

    const descriptor = `${verticalPullMain.id} ${verticalPullMain.name}`.toLowerCase();
    expect(descriptor.includes("pullup") || descriptor.includes("pull-up") || descriptor.includes("chinup")).toBe(true);
    expect(descriptor.includes("pulldown") || descriptor.includes("pull-down")).toBe(false);
  });

  test("pull-up ladder escalates to weighted pull-up for advanced phase 3 when pull-up bar is available", () => {
    const questionnaire: QuestionnaireData = {
      goals: "Athletic performance",
      painAreas: [],
      experience: "Advanced",
      daysPerWeek: 3,
      equipment: ["gym", "pullup bar"],
    };

    const program = generateWeeklyProgram(
      questionnaire,
      "regression-back-chest-advanced-weighted-pullup",
      {
        phaseIndex: 3,
        seed: "regression-back-chest-advanced-weighted-pullup",
      }
    );
    const backChestDay = program.week.find((day) => day.title === "Back + Chest");
    expect(backChestDay).toBeTruthy();
    if (!backChestDay) return;

    const mainExercises = backChestDay.routine
      .filter((item) => item.section === "main")
      .map((item) => exerciseById(item.exerciseId))
      .filter((exercise): exercise is Exercise => Boolean(exercise));
    expect(mainExercises.map((exercise) => exercise.id)).toContain("weighted-pullup");
  });

  test("kneeling prayer lat pulldown is excluded when equipment does not include bands or cables", () => {
    const scenarios: Array<{
      id: string;
      equipment: QuestionnaireData["equipment"];
    }> = [
      { id: "none", equipment: ["none"] },
      { id: "dumbbells", equipment: ["dumbbells"] },
    ];

    scenarios.forEach((scenario) => {
      ([1, 2, 3] as const).forEach((phaseIndex) => {
        const questionnaire: QuestionnaireData = {
          goals: "Reduce pain",
          painAreas: [],
          experience: "Beginner",
          daysPerWeek: 3,
          equipment: scenario.equipment,
        };
        const program = generateWeeklyProgram(
          questionnaire,
          `regression-back-chest-kneeling-prayer-${scenario.id}-p${phaseIndex}`,
          {
            phaseIndex,
            seed: `regression-back-chest-kneeling-prayer-${scenario.id}-p${phaseIndex}`,
          }
        );
        const backChestDay = getBackChestDayFromProgram(program);
        const allIds = backChestDay.routine.map((item) => item.exerciseId);
        expect(allIds).not.toContain("kneeling-prayer-lat-pulldown");
      });
    });
  });

  test("beginner dumbbells-only phase 3 uses dumbbell pullover for Back + Chest vertical pull anchor", () => {
    const questionnaire: QuestionnaireData = {
      goals: "Reduce pain",
      painAreas: [],
      experience: "Beginner",
      daysPerWeek: 3,
      equipment: ["dumbbells"],
    };

    const program = generateWeeklyProgram(
      questionnaire,
      "regression-back-chest-dumbbells-vertical-pull-anchor",
      {
        phaseIndex: 3,
        seed: "regression-back-chest-dumbbells-vertical-pull-anchor",
      }
    );
    const backChestDay = getBackChestDayFromProgram(program);
    const mainExercises = backChestDay.routine
      .filter((item) => item.section === "main")
      .map((item) => exerciseById(item.exerciseId))
      .filter((exercise): exercise is Exercise => Boolean(exercise));
    const verticalPullMain = mainExercises.find((exercise) => isVerticalPullMain(exercise));
    expect(verticalPullMain).toBeTruthy();
    if (!verticalPullMain) return;
    expect(verticalPullMain.id).toBe("dumbbell-pullover");
    expect(verticalPullMain.equipment.includes("dumbbells")).toBe(true);
    expect(verticalPullMain.equipment.includes("bands")).toBe(false);
    expect(verticalPullMain.equipment.includes("cables")).toBe(false);
  });

  test("reduce pain beginner 3-day anchor trio rotates across phases for none/bands/dumbbells/gym when alternatives exist", () => {
    const scenarios: Array<{
      id: string;
      equipment: QuestionnaireData["equipment"];
    }> = [
      { id: "none", equipment: ["none"] },
      { id: "bands", equipment: ["bands"] },
      { id: "dumbbells", equipment: ["dumbbells"] },
      { id: "gym", equipment: ["gym"] },
    ];

    scenarios.forEach((scenario) => {
      const questionnaire: QuestionnaireData = {
        goals: "Reduce pain",
        painAreas: [],
        experience: "Beginner",
        daysPerWeek: 3,
        equipment: scenario.equipment,
      };

      const phase1 = generateWeeklyProgram(
        questionnaire,
        `regression-back-chest-${scenario.id}-p1`,
        {
          phaseIndex: 1,
          seed: `regression-back-chest-${scenario.id}-p1`,
        }
      );
      const phase2 = advanceToNextPhaseForBackChest({
        currentProgram: phase1,
        questionnaire,
        nextProgramId: `regression-back-chest-${scenario.id}-p2`,
        seed: `regression-back-chest-${scenario.id}-p2`,
      });
      const phase3 = advanceToNextPhaseForBackChest({
        currentProgram: phase2,
        questionnaire,
        nextProgramId: `regression-back-chest-${scenario.id}-p3`,
        seed: `regression-back-chest-${scenario.id}-p3`,
      });

      const phase1Anchors = getBackChestAnchorSignature(phase1, `${scenario.id}-p1`);
      const phase2Anchors = getBackChestAnchorSignature(phase2, `${scenario.id}-p2`);
      const phase3Anchors = getBackChestAnchorSignature(phase3, `${scenario.id}-p3`);

      expect(phase2Anchors).not.toBe(phase1Anchors);
      expect(phase3Anchors).not.toBe(phase2Anchors);

      if (scenario.id === "none" || scenario.id === "dumbbells") {
        [phase1, phase2, phase3].forEach((program) => {
          const backChestDay = getBackChestDayFromProgram(program);
          backChestDay.routine.forEach((item) => {
            const exercise = exerciseById(item.exerciseId);
            expect(exercise).toBeTruthy();
            if (!exercise) return;
            expect(exercise.equipment.includes("bands")).toBe(false);
            expect(exercise.equipment.includes("cables")).toBe(false);
          });
          expect(backChestDay.routine.length).toBeGreaterThan(0);
        });
      }
    });
  });

  test("standalone phase previews prevent NONE/BANDS Back + Chest boilerplate when same-tier alternatives exist", () => {
    const scenarios: Array<{
      id: "none" | "bands";
      equipment: QuestionnaireData["equipment"];
    }> = [
      { id: "none", equipment: ["none"] },
      { id: "bands", equipment: ["bands"] },
    ];

    scenarios.forEach((scenario) => {
      const questionnaire: QuestionnaireData = {
        goals: "Reduce pain",
        painAreas: [],
        experience: "Beginner",
        daysPerWeek: 3,
        equipment: scenario.equipment,
      };

      const phase1 = generateWeeklyProgram(
        questionnaire,
        `standalone-back-chest-${scenario.id}-p1`,
        {
          phaseIndex: 1,
          seed: `standalone-back-chest-${scenario.id}`,
        }
      );
      const phase2 = generateWeeklyProgram(
        questionnaire,
        `standalone-back-chest-${scenario.id}-p2`,
        {
          phaseIndex: 2,
          seed: `standalone-back-chest-${scenario.id}`,
        }
      );
      const phase3 = generateWeeklyProgram(
        questionnaire,
        `standalone-back-chest-${scenario.id}-p3`,
        {
          phaseIndex: 3,
          seed: `standalone-back-chest-${scenario.id}`,
        }
      );

      const p1Sig = getBackChestAnchorSignature(phase1, `standalone-${scenario.id}-p1`);
      const p2Sig = getBackChestAnchorSignature(phase2, `standalone-${scenario.id}-p2`);
      const p3Sig = getBackChestAnchorSignature(phase3, `standalone-${scenario.id}-p3`);

      if (
        hasAnySameTierAnchorAlternative({ program: phase2, questionnaire }) ||
        hasAnySameTierAnchorAlternative({ program: phase1, questionnaire })
      ) {
        expect(p2Sig).not.toBe(p1Sig);
      }

      if (
        hasAnySameTierAnchorAlternative({ program: phase3, questionnaire }) ||
        hasAnySameTierAnchorAlternative({ program: phase2, questionnaire })
      ) {
        expect(p3Sig).not.toBe(p2Sig);
      }

      [phase1, phase2, phase3].forEach((program) => {
        const backChestDay = getBackChestDayFromProgram(program);
        const mains = backChestDay.routine
          .filter((item) => item.section === "main")
          .map((item) => exerciseById(item.exerciseId))
          .filter((exercise): exercise is Exercise => Boolean(exercise));
        expect(mains.filter((exercise) => hasHorizontalPullMain(exercise)).length).toBe(1);
        expect(mains.filter((exercise) => hasHorizontalPushMain(exercise)).length).toBe(1);
        expect(mains.filter((exercise) => isVerticalPullMain(exercise)).length).toBe(1);
      });
    });
  });

  test("beginner NONE reduce pain phase 2 differs from phase 1 in at least two anchors when alternatives exist", () => {
    const questionnaire: QuestionnaireData = {
      goals: "Reduce pain",
      painAreas: [],
      experience: "Beginner",
      daysPerWeek: 3,
      equipment: ["none"],
    };

    const phase1 = generateWeeklyProgram(questionnaire, "none-two-anchor-shift-p1", {
      phaseIndex: 1,
      seed: "none-two-anchor-shift",
    });
    const phase2 = advanceToNextPhaseForBackChest({
      currentProgram: phase1,
      questionnaire,
      nextProgramId: "none-two-anchor-shift-p2",
      seed: "none-two-anchor-shift-p2",
    });

    const phase1Anchors = getBackChestAnchorIds(phase1, "none-p1");
    const phase2Anchors = getBackChestAnchorIds(phase2, "none-p2");
    const differenceCount = getBackChestAnchorDiffCount(phase1Anchors, phase2Anchors);
    const alternatives = countSameTierAnchorAlternatives({ program: phase1, questionnaire });

    if (alternatives >= 2) {
      expect(differenceCount).toBeGreaterThanOrEqual(2);
    } else if (alternatives >= 1) {
      expect(differenceCount).toBeGreaterThanOrEqual(1);
    }
  });

  test("beginner BANDS reduce pain keeps phase 2 vertical pull band-based when band alternatives exist", () => {
    const questionnaire: QuestionnaireData = {
      goals: "Reduce pain",
      painAreas: [],
      experience: "Beginner",
      daysPerWeek: 3,
      equipment: ["bands"],
    };

    const phase1 = generateWeeklyProgram(questionnaire, "bands-vertical-integrity-p1", {
      phaseIndex: 1,
      seed: "bands-vertical-integrity",
    });
    const phase2 = advanceToNextPhaseForBackChest({
      currentProgram: phase1,
      questionnaire,
      nextProgramId: "bands-vertical-integrity-p2",
      seed: "bands-vertical-integrity-p2",
    });

    const phase2Day = getBackChestDayFromProgram(phase2);
    const phase2Main = phase2Day.routine
      .filter((item) => item.section === "main")
      .map((item) => exerciseById(item.exerciseId))
      .filter((exercise): exercise is Exercise => Boolean(exercise));
    const phase2Vertical = phase2Main.find((exercise) => isVerticalPullMain(exercise));
    expect(phase2Vertical).toBeTruthy();
    if (!phase2Vertical) return;

    const available = normalizeEquipmentSelection(questionnaire.equipment).available;
    const hasBandVerticalAlternative = exercises
      .filter((exercise) => exercise.category === "main")
      .filter((exercise) => isExerciseEligible(exercise, available))
      .some((exercise) => isBandOrCableVerticalPullForTest(exercise));

    if (hasBandVerticalAlternative) {
      expect(isBandOrCableVerticalPullForTest(phase2Vertical)).toBe(true);
      expect(phase2Vertical.id).not.toBe("seated-lat-sweep-pulse");
      expect(phase2Vertical.id).not.toBe("prone-lat-sweep");
    }
  });

  test("beginner BANDS reduce pain phase 3 differs from phase 2 anchors when alternatives exist", () => {
    const questionnaire: QuestionnaireData = {
      goals: "Reduce pain",
      painAreas: [],
      experience: "Beginner",
      daysPerWeek: 3,
      equipment: ["bands"],
    };

    const phase1 = generateWeeklyProgram(questionnaire, "bands-phase3-variety-p1", {
      phaseIndex: 1,
      seed: "bands-phase3-variety",
    });
    const phase2 = advanceToNextPhaseForBackChest({
      currentProgram: phase1,
      questionnaire,
      nextProgramId: "bands-phase3-variety-p2",
      seed: "bands-phase3-variety-p2",
    });
    const phase3 = advanceToNextPhaseForBackChest({
      currentProgram: phase2,
      questionnaire,
      nextProgramId: "bands-phase3-variety-p3",
      seed: "bands-phase3-variety-p3",
    });

    const phase2Anchors = getBackChestAnchorIds(phase2, "bands-p2");
    const phase3Anchors = getBackChestAnchorIds(phase3, "bands-p3");
    const differenceCount = getBackChestAnchorDiffCount(phase2Anchors, phase3Anchors);
    const alternatives = countSameTierAnchorAlternatives({ program: phase2, questionnaire });

    if (alternatives >= 1) {
      expect(differenceCount).toBeGreaterThanOrEqual(1);
    }
  });

  test("beginner BANDS improve posture rotates Back + Chest mains across phases when alternatives exist", () => {
    const questionnaire: QuestionnaireData = {
      goals: "Improve posture",
      painAreas: [],
      experience: "Beginner",
      daysPerWeek: 3,
      equipment: ["bands"],
    };

    const phase1 = generateWeeklyProgram(questionnaire, "bands-posture-variety-p1", {
      phaseIndex: 1,
      seed: "bands-posture-variety",
    });
    const phase2 = advanceToNextPhaseForBackChest({
      currentProgram: phase1,
      questionnaire,
      nextProgramId: "bands-posture-variety-p2",
      seed: "bands-posture-variety-p2",
    });
    const phase3 = advanceToNextPhaseForBackChest({
      currentProgram: phase2,
      questionnaire,
      nextProgramId: "bands-posture-variety-p3",
      seed: "bands-posture-variety-p3",
    });

    const phase1Anchors = getBackChestAnchorIds(phase1, "bands-posture-p1");
    const phase2Anchors = getBackChestAnchorIds(phase2, "bands-posture-p2");
    const phase3Anchors = getBackChestAnchorIds(phase3, "bands-posture-p3");
    const p1ToP2Diff = getBackChestAnchorDiffCount(phase1Anchors, phase2Anchors);
    const p2ToP3Diff = getBackChestAnchorDiffCount(phase2Anchors, phase3Anchors);
    const p1Alternatives = countSameTierAnchorAlternatives({ program: phase1, questionnaire });
    const p2Alternatives = countSameTierAnchorAlternatives({ program: phase2, questionnaire });
    const available = normalizeEquipmentSelection(questionnaire.equipment).available;
    const phase1Main = getBackChestDayFromProgram(phase1).routine
      .filter((item) => item.section === "main")
      .map((item) => exerciseById(item.exerciseId))
      .filter((exercise): exercise is Exercise => Boolean(exercise));
    const rowPhase1 = phase1Main.find((exercise) => hasHorizontalPullMain(exercise));
    const pressPhase1 = phase1Main.find((exercise) => hasHorizontalPushMain(exercise));
    const rowAlternativesExist = Boolean(
      rowPhase1 &&
        hasSameTierBackChestAnchorAlternative({
          selected: rowPhase1,
          role: "horizontalPull",
          available,
        })
    );
    const pressAlternativesExist = Boolean(
      pressPhase1 &&
        hasSameTierBackChestAnchorAlternative({
          selected: pressPhase1,
          role: "horizontalPush",
          available,
        })
    );
    const verticalChangedP1ToP2 = phase1Anchors.verticalPull !== phase2Anchors.verticalPull;
    const rowChangedP1ToP2 = phase1Anchors.horizontalPull !== phase2Anchors.horizontalPull;
    const pressChangedP1ToP2 = phase1Anchors.horizontalPush !== phase2Anchors.horizontalPush;

    if (p1Alternatives >= 1) {
      expect(p1ToP2Diff).toBeGreaterThanOrEqual(1);
    }
    if (p2Alternatives >= 1) {
      expect(p2ToP3Diff).toBeGreaterThanOrEqual(1);
    }
    if (verticalChangedP1ToP2 && (rowAlternativesExist || pressAlternativesExist)) {
      expect(rowChangedP1ToP2 || pressChangedP1ToP2).toBe(true);
    }
    if (rowAlternativesExist) {
      expect(
        !(
          phase1Anchors.horizontalPull === phase2Anchors.horizontalPull &&
          phase2Anchors.horizontalPull === phase3Anchors.horizontalPull
        )
      ).toBe(true);
    }
    if (pressAlternativesExist) {
      expect(
        !(
          phase1Anchors.horizontalPush === phase2Anchors.horizontalPush &&
          phase2Anchors.horizontalPush === phase3Anchors.horizontalPush
        )
      ).toBe(true);
    }
    const unilateralOrIsoRowAvailable = ["single-arm-band-row", "band-row-iso-hold"].some(
      (exerciseId) => {
        const exercise = exerciseById(exerciseId);
        if (!exercise) return false;
        return isExerciseEligible(exercise, available);
      }
    );
    if (unilateralOrIsoRowAvailable) {
      expect(
        [phase2Anchors.horizontalPull, phase3Anchors.horizontalPull].some(
          isBandUnilateralOrIsoRowForTest
        )
      ).toBe(true);
    }
  });

  test("beginner BANDS general fitness rotates mains and favors split-stance over iso rows in phase 2", () => {
    const questionnaire: QuestionnaireData = {
      goals: "General fitness",
      painAreas: [],
      experience: "Beginner",
      daysPerWeek: 3,
      equipment: ["bands"],
    };

    const phase1 = generateWeeklyProgram(questionnaire, "bands-fitness-variety-p1", {
      phaseIndex: 1,
      seed: "bands-fitness-variety",
    });
    const phase2 = advanceToNextPhaseForBackChest({
      currentProgram: phase1,
      questionnaire,
      nextProgramId: "bands-fitness-variety-p2",
      seed: "bands-fitness-variety-p2",
    });
    const phase3 = advanceToNextPhaseForBackChest({
      currentProgram: phase2,
      questionnaire,
      nextProgramId: "bands-fitness-variety-p3",
      seed: "bands-fitness-variety-p3",
    });

    const phase1Anchors = getBackChestAnchorIds(phase1, "bands-fitness-p1");
    const phase2Anchors = getBackChestAnchorIds(phase2, "bands-fitness-p2");
    const phase3Anchors = getBackChestAnchorIds(phase3, "bands-fitness-p3");
    const p1ToP2Diff = getBackChestAnchorDiffCount(phase1Anchors, phase2Anchors);
    const p2ToP3Diff = getBackChestAnchorDiffCount(phase2Anchors, phase3Anchors);
    const p1Alternatives = countSameTierAnchorAlternatives({ program: phase1, questionnaire });
    const p2Alternatives = countSameTierAnchorAlternatives({ program: phase2, questionnaire });

    if (p1Alternatives >= 1) {
      expect(p1ToP2Diff).toBeGreaterThanOrEqual(1);
    }
    if (p2Alternatives >= 1) {
      expect(p2ToP3Diff).toBeGreaterThanOrEqual(1);
    }
    expect(
      phase3Anchors.horizontalPull !== phase1Anchors.horizontalPull ||
        phase3Anchors.horizontalPush !== phase1Anchors.horizontalPush
    ).toBe(true);

    const available = normalizeEquipmentSelection(questionnaire.equipment).available;
    const splitStanceRow = exerciseById("split-stance-row");
    const isoRow = exerciseById("band-row-iso-hold");
    if (
      splitStanceRow &&
      isoRow &&
      isExerciseEligible(splitStanceRow, available) &&
      isExerciseEligible(isoRow, available)
    ) {
      expect(phase2Anchors.horizontalPull).not.toBe("band-row-iso-hold");
    }
  });

  test("beginner BANDS scap-control assessment focus biases phase 2 row toward control variants", () => {
    const questionnaire: QuestionnaireData = {
      goals: "General fitness",
      painAreas: [],
      experience: "Beginner",
      daysPerWeek: 3,
      equipment: ["bands"],
    };
    const scapControlPose: PoseAnalysis = {
      metrics: {
        torsoHeight: 1,
        avgKeypointScore: 0.92,
        shoulderHeightDelta: 0.01,
        hipHeightDelta: 0.01,
        kneeAlignmentDelta: 0.01,
        headForwardOffset: 0.02,
        torsoLeanAngle: 3,
        hipToShoulderAlignment: 0.02,
        scapularSymmetry: 0.12,
        hipShift: 0.02,
      },
      observations: [],
      priorities: [],
      confidenceScore: 0.92,
    };

    const phase2Baseline = generateWeeklyProgram(
      questionnaire,
      "bands-scap-focus-baseline-p2",
      {
        phaseIndex: 2,
        seed: "bands-scap-focus-phase2",
      }
    );
    const phase2Focused = generateWeeklyProgram(
      questionnaire,
      "bands-scap-focus-focused-p2",
      {
        phaseIndex: 2,
        seed: "bands-scap-focus-phase2",
        poseAnalysis: scapControlPose,
      }
    );

    const baselineAnchors = getBackChestAnchorIds(phase2Baseline, "bands-scap-focus-baseline");
    const focusedAnchors = getBackChestAnchorIds(phase2Focused, "bands-scap-focus-focused");
    const available = normalizeEquipmentSelection(questionnaire.equipment).available;
    const controlledRowVariantIds = [
      "single-arm-band-row",
      "band-row-iso-hold",
      "split-stance-row",
    ].filter((exerciseId) => {
      const exercise = exerciseById(exerciseId);
      if (!exercise) return false;
      return isExerciseEligible(exercise, available);
    });

    if (controlledRowVariantIds.length) {
      expect(controlledRowVariantIds).toContain(focusedAnchors.horizontalPull);
      if (!controlledRowVariantIds.includes(baselineAnchors.horizontalPull)) {
        expect(focusedAnchors.horizontalPull).not.toBe(baselineAnchors.horizontalPull);
      }
    }
  });

  test("beginner BANDS accessories rotate phase-to-phase and keep rear-delt + scap coverage with phase reps", () => {
    const questionnaire: QuestionnaireData = {
      goals: "Improve posture",
      painAreas: [],
      experience: "Beginner",
      daysPerWeek: 3,
      equipment: ["bands"],
    };
    const phase1 = generateWeeklyProgram(questionnaire, "bands-accessory-rotation-p1", {
      phaseIndex: 1,
      seed: "bands-accessory-rotation",
    });
    const phase2 = advanceToNextPhaseForBackChest({
      currentProgram: phase1,
      questionnaire,
      nextProgramId: "bands-accessory-rotation-p2",
      seed: "bands-accessory-rotation-p2",
    });
    const phase3 = advanceToNextPhaseForBackChest({
      currentProgram: phase2,
      questionnaire,
      nextProgramId: "bands-accessory-rotation-p3",
      seed: "bands-accessory-rotation-p3",
    });

    const extractAccessories = (program: ReturnType<typeof generateWeeklyProgram>) => {
      const day = getBackChestDayFromProgram(program);
      const accessoryItems = day.routine.filter((item) => item.section === "accessory");
      const accessoryExercises = accessoryItems
        .map((item) => exerciseById(item.exerciseId))
        .filter((exercise): exercise is Exercise => Boolean(exercise));
      const signature = accessoryItems
        .map((item) => item.exerciseId)
        .sort((left, right) => left.localeCompare(right))
        .join("|");
      return { accessoryItems, accessoryExercises, signature };
    };

    const phase1Accessory = extractAccessories(phase1);
    const phase2Accessory = extractAccessories(phase2);
    const phase3Accessory = extractAccessories(phase3);

    const available = normalizeEquipmentSelection(questionnaire.equipment).available;
    const rearAlternatives = exercises
      .filter((exercise) => isExerciseEligible(exercise, available))
      .filter((exercise) => isRearDeltAccessory(exercise)).length;
    const scapAlternatives = exercises
      .filter((exercise) => isExerciseEligible(exercise, available))
      .filter((exercise) => isScapOrExternalAccessory(exercise)).length;
    const alternativesExist = rearAlternatives > 1 || scapAlternatives > 1;

    if (alternativesExist) {
      expect(phase2Accessory.signature).not.toBe(phase1Accessory.signature);
      expect(phase3Accessory.signature).not.toBe(phase2Accessory.signature);
    }

    [phase1Accessory, phase2Accessory, phase3Accessory].forEach((accessorySet) => {
      expect(accessorySet.accessoryExercises.some((exercise) => isRearDeltAccessory(exercise))).toBe(true);
      expect(accessorySet.accessoryExercises.some((exercise) => isScapOrExternalAccessory(exercise))).toBe(true);
    });

    phase1Accessory.accessoryItems.forEach((item) => {
      expect(item.reps).toBe("10-15");
    });
    phase2Accessory.accessoryItems.forEach((item) => {
      expect(item.reps).toBe("10-15");
    });
    phase3Accessory.accessoryItems.forEach((item) => {
      expect(item.reps).toBe("8-12");
    });
  });

  test("bands Back + Chest vertical anchor stays on band pulldown family when eligible", () => {
    const questionnaire: QuestionnaireData = {
      goals: "Improve posture",
      painAreas: [],
      experience: "Beginner",
      daysPerWeek: 3,
      equipment: ["bands"],
    };
    const phase1 = generateWeeklyProgram(questionnaire, "bands-vertical-family-p1", {
      phaseIndex: 1,
      seed: "bands-vertical-family",
    });
    const phase2 = advanceToNextPhaseForBackChest({
      currentProgram: phase1,
      questionnaire,
      nextProgramId: "bands-vertical-family-p2",
      seed: "bands-vertical-family-p2",
    });
    const phase3 = advanceToNextPhaseForBackChest({
      currentProgram: phase2,
      questionnaire,
      nextProgramId: "bands-vertical-family-p3",
      seed: "bands-vertical-family-p3",
    });

    const available = normalizeEquipmentSelection(questionnaire.equipment).available;
    const hasBandPulldownAlternative = exercises
      .filter((exercise) => exercise.category === "main")
      .filter((exercise) => isExerciseEligible(exercise, available))
      .some((exercise) => isBandVerticalPulldownVariantForTest(exercise));

    const verticalAnchors = [phase1, phase2, phase3].map((program, index) => {
      const day = getBackChestDayFromProgram(program);
      const mainExercises = day.routine
        .filter((item) => item.section === "main")
        .map((item) => exerciseById(item.exerciseId))
        .filter((exercise): exercise is Exercise => Boolean(exercise));
      const vertical = mainExercises.find((exercise) => isVerticalPullMain(exercise));
      expect(vertical, `bands vertical anchor missing for phase ${index + 1}`).toBeTruthy();
      return vertical;
    });

    if (hasBandPulldownAlternative) {
      verticalAnchors.forEach((vertical) => {
        expect(vertical).toBeTruthy();
        if (!vertical) return;
        expect(isBandVerticalPulldownVariantForTest(vertical)).toBe(true);
        expect(vertical.id).not.toBe("seated-lat-sweep-pulse");
        expect(vertical.id).not.toBe("prone-lat-sweep");
        expect(vertical.id).not.toBe("supine-lat-pulldown-isometric");
      });
    }
  });

  test("beginner BANDS keeps row and press non-static across phases when alternatives exist", () => {
    ([
      "Improve posture",
      "General fitness",
      "Reduce pain",
    ] as QuestionnaireData["goals"][]).forEach((goal) => {
      const questionnaire: QuestionnaireData = {
        goals: goal,
        painAreas: [],
        experience: "Beginner",
        daysPerWeek: 3,
        equipment: ["bands"],
      };
      const seedKey = normalizeToken(goal);
      const phase1 = generateWeeklyProgram(questionnaire, `bands-non-static-${seedKey}-p1`, {
        phaseIndex: 1,
        seed: `bands-non-static-${seedKey}-p1`,
      });
      const phase2 = advanceToNextPhaseForBackChest({
        currentProgram: phase1,
        questionnaire,
        nextProgramId: `bands-non-static-${seedKey}-p2`,
        seed: `bands-non-static-${seedKey}-p2`,
      });
      const phase3 = advanceToNextPhaseForBackChest({
        currentProgram: phase2,
        questionnaire,
        nextProgramId: `bands-non-static-${seedKey}-p3`,
        seed: `bands-non-static-${seedKey}-p3`,
      });

      const phase1Anchors = getBackChestAnchorIds(phase1, `bands-non-static-${seedKey}-p1`);
      const phase2Anchors = getBackChestAnchorIds(phase2, `bands-non-static-${seedKey}-p2`);
      const phase3Anchors = getBackChestAnchorIds(phase3, `bands-non-static-${seedKey}-p3`);
      const available = normalizeEquipmentSelection(questionnaire.equipment).available;
      const rowVariantCount = countEligibleBandAnchorVariantsForTest({
        variantIds: backChestBandRowVariantIdsForTest,
        available,
      });
      const pressVariantCount = countEligibleBandAnchorVariantsForTest({
        variantIds: backChestBandPressVariantIdsForTest,
        available,
      });

      if (rowVariantCount >= 2) {
        expect(
          !(
            phase1Anchors.horizontalPull === phase2Anchors.horizontalPull &&
            phase2Anchors.horizontalPull === phase3Anchors.horizontalPull
          )
        ).toBe(true);
      }
      if (pressVariantCount >= 2) {
        expect(
          !(
            phase1Anchors.horizontalPush === phase2Anchors.horizontalPush &&
            phase2Anchors.horizontalPush === phase3Anchors.horizontalPush
          )
        ).toBe(true);
      }
      if (rowVariantCount >= 2 || pressVariantCount >= 2) {
        const phase1Signature = getBackChestAnchorSignature(
          phase1,
          `bands-non-static-signature-${seedKey}-p1`
        );
        const phase2Signature = getBackChestAnchorSignature(
          phase2,
          `bands-non-static-signature-${seedKey}-p2`
        );
        const phase3Signature = getBackChestAnchorSignature(
          phase3,
          `bands-non-static-signature-${seedKey}-p3`
        );
        expect(phase2Signature).not.toBe(phase1Signature);
        expect(phase3Signature).not.toBe(phase2Signature);
      }
    });
  });

  test("beginner BANDS accessory pairs keep unique family keys and preserve structural coverage", () => {
    const questionnaire: QuestionnaireData = {
      goals: "Improve posture",
      painAreas: [],
      experience: "Beginner",
      daysPerWeek: 3,
      equipment: ["bands"],
    };
    const phase1 = generateWeeklyProgram(questionnaire, "bands-family-dedup-p1", {
      phaseIndex: 1,
      seed: "bands-family-dedup-p1",
    });
    const phase2 = advanceToNextPhaseForBackChest({
      currentProgram: phase1,
      questionnaire,
      nextProgramId: "bands-family-dedup-p2",
      seed: "bands-family-dedup-p2",
    });
    const phase3 = advanceToNextPhaseForBackChest({
      currentProgram: phase2,
      questionnaire,
      nextProgramId: "bands-family-dedup-p3",
      seed: "bands-family-dedup-p3",
    });

    [phase1, phase2, phase3].forEach((program) => {
      const day = getBackChestDayFromProgram(program);
      const accessoryItems = day.routine.filter((item) => item.section === "accessory");
      const accessoryExercises = accessoryItems
        .map((item) => exerciseById(item.exerciseId))
        .filter((exercise): exercise is Exercise => Boolean(exercise));
      const families = accessoryExercises.map(getBackChestAccessoryFamilyKeyForTest);
      expect(new Set(families).size).toBe(families.length);
      expect(accessoryExercises.some((exercise) => isRearDeltAccessory(exercise))).toBe(true);
      expect(accessoryExercises.some((exercise) => isScapOrExternalAccessory(exercise))).toBe(
        true
      );
    });
  });

  test("beginner BANDS phase progression remains deterministic with fixed seeds", () => {
    const questionnaire: QuestionnaireData = {
      goals: "Improve posture",
      painAreas: [],
      experience: "Beginner",
      daysPerWeek: 3,
      equipment: ["bands"],
    };

    const buildSignature = (seedBase: string) => {
      const phase1 = generateWeeklyProgram(questionnaire, `${seedBase}-p1`, {
        phaseIndex: 1,
        seed: `${seedBase}-p1`,
      });
      const phase2 = advanceToNextPhaseForBackChest({
        currentProgram: phase1,
        questionnaire,
        nextProgramId: `${seedBase}-p2`,
        seed: `${seedBase}-p2`,
      });
      const phase3 = advanceToNextPhaseForBackChest({
        currentProgram: phase2,
        questionnaire,
        nextProgramId: `${seedBase}-p3`,
        seed: `${seedBase}-p3`,
      });
      return [phase1, phase2, phase3].map((program) => {
        const day = getBackChestDayFromProgram(program);
        const mainIds = day.routine
          .filter((item) => item.section === "main")
          .map((item) => item.exerciseId)
          .join("|");
        const accessoryIds = day.routine
          .filter((item) => item.section === "accessory")
          .map((item) => item.exerciseId)
          .join("|");
        return `${mainIds}::${accessoryIds}`;
      });
    };

    const firstRun = buildSignature("bands-determinism-seed");
    const secondRun = buildSignature("bands-determinism-seed");
    expect(secondRun).toEqual(firstRun);
  });

  test("hard boundary keeps Back + Chest mains inside allowed families and blocks vertical-push/lower-body leaks", () => {
    const scenarios: Array<{
      id: string;
      equipment: QuestionnaireData["equipment"];
    }> = [
      { id: "gym", equipment: ["gym", "pullup_bar"] },
      { id: "bands", equipment: ["bands"] },
      { id: "dumbbells", equipment: ["dumbbells"] },
      { id: "none", equipment: ["none"] },
    ];

    scenarios.forEach((scenario) => {
      const questionnaire: QuestionnaireData = {
        goals: "Athletic performance",
        painAreas: [],
        experience: "Advanced",
        daysPerWeek: 3,
        equipment: scenario.equipment,
      };
      const phase1 = generateWeeklyProgram(questionnaire, `boundary-${scenario.id}-p1`, {
        phaseIndex: 1,
        seed: `boundary-${scenario.id}-p1`,
      });
      const phase2 = advanceToNextPhaseForBackChest({
        currentProgram: phase1,
        questionnaire,
        nextProgramId: `boundary-${scenario.id}-p2`,
        seed: `boundary-${scenario.id}-p2`,
      });
      const phase3 = advanceToNextPhaseForBackChest({
        currentProgram: phase2,
        questionnaire,
        nextProgramId: `boundary-${scenario.id}-p3`,
        seed: `boundary-${scenario.id}-p3`,
      });

      [phase1, phase2, phase3].forEach((program) => {
        const mainExercises = getBackChestDayFromProgram(program).routine
          .filter((item) => item.section === "main")
          .map((item) => exerciseById(item.exerciseId))
          .filter((exercise): exercise is Exercise => Boolean(exercise));
        mainExercises.forEach((exercise) => {
          expect(isBackChestMainBoundaryAllowedForTest(exercise)).toBe(true);
        });
      });
    });
  });

  test("extra main slots stay governed for intermediate/advanced Back + Chest in 3-day split", () => {
    const intermediateQuestionnaire: QuestionnaireData = {
      goals: "General fitness",
      painAreas: [],
      experience: "Intermediate",
      daysPerWeek: 3,
      equipment: ["gym"],
    };
    const advancedQuestionnaire: QuestionnaireData = {
      goals: "Athletic performance",
      painAreas: [],
      experience: "Advanced",
      daysPerWeek: 3,
      equipment: ["gym", "pullup_bar"],
    };

    const intermediateProgram = generateWeeklyProgram(
      intermediateQuestionnaire,
      "extra-slot-intermediate",
      {
        phaseIndex: 2,
        seed: "extra-slot-intermediate",
      }
    );
    const advancedProgram = generateWeeklyProgram(
      advancedQuestionnaire,
      "extra-slot-advanced",
      {
        phaseIndex: 3,
        seed: "extra-slot-advanced",
      }
    );

    const intermediateMain = getBackChestDayFromProgram(intermediateProgram).routine
      .filter((item) => item.section === "main")
      .map((item) => exerciseById(item.exerciseId))
      .filter((exercise): exercise is Exercise => Boolean(exercise));
    expect(intermediateMain.length).toBe(4);
    expect(new Set(intermediateMain.map((exercise) => exercise.id)).size).toBe(
      intermediateMain.length
    );
    intermediateMain.slice(3).forEach((exercise) => {
      expect(isBackChestMainBoundaryAllowedForTest(exercise)).toBe(true);
    });

    const advancedMain = getBackChestDayFromProgram(advancedProgram).routine
      .filter((item) => item.section === "main")
      .map((item) => exerciseById(item.exerciseId))
      .filter((exercise): exercise is Exercise => Boolean(exercise));
    expect(advancedMain.length).toBe(5);
    expect(new Set(advancedMain.map((exercise) => exercise.id)).size).toBe(advancedMain.length);
    expect(
      advancedMain.some((exercise) => isBackChestShoulderPressLeakForTest(exercise))
    ).toBe(false);
    const advancedFingerprints = advancedMain.map((exercise) =>
      getBackChestMainFamilyVariantFingerprintForTest(exercise)
    );
    expect(new Set(advancedFingerprints).size).toBe(advancedFingerprints.length);
    advancedMain.slice(3).forEach((exercise) => {
      expect(isBackChestMainBoundaryAllowedForTest(exercise)).toBe(true);
    });
  });

  test("cross-phase anchor non-static enforcement applies across equipment when alternatives exist", () => {
    const scenarios: Array<{
      id: string;
      equipment: QuestionnaireData["equipment"];
    }> = [
      { id: "none", equipment: ["none"] },
      { id: "bands", equipment: ["bands"] },
      { id: "dumbbells", equipment: ["dumbbells"] },
      { id: "gym", equipment: ["gym"] },
    ];

    scenarios.forEach((scenario) => {
      const questionnaire: QuestionnaireData = {
        goals: "General fitness",
        painAreas: [],
        experience: "Beginner",
        daysPerWeek: 3,
        equipment: scenario.equipment,
      };
      const phase1 = generateWeeklyProgram(questionnaire, `non-static-all-${scenario.id}-p1`, {
        phaseIndex: 1,
        seed: `non-static-all-${scenario.id}-p1`,
      });
      const phase2 = advanceToNextPhaseForBackChest({
        currentProgram: phase1,
        questionnaire,
        nextProgramId: `non-static-all-${scenario.id}-p2`,
        seed: `non-static-all-${scenario.id}-p2`,
      });
      const phase3 = advanceToNextPhaseForBackChest({
        currentProgram: phase2,
        questionnaire,
        nextProgramId: `non-static-all-${scenario.id}-p3`,
        seed: `non-static-all-${scenario.id}-p3`,
      });
      const phase1Anchors = getBackChestAnchorIds(phase1, `non-static-all-${scenario.id}-p1`);
      const phase2Anchors = getBackChestAnchorIds(phase2, `non-static-all-${scenario.id}-p2`);
      const phase3Anchors = getBackChestAnchorIds(phase3, `non-static-all-${scenario.id}-p3`);

      const available = normalizeEquipmentSelection(questionnaire.equipment).available;
      const roleCandidateCount = (role: "horizontalPull" | "verticalPull" | "horizontalPush") =>
        exercises
          .filter((exercise) => exercise.category === "main")
          .filter((exercise) => isExerciseEligible(exercise, available))
          .filter((exercise) =>
            meetsExperienceMinForTest(exercise, questionnaire.experience)
          )
          .filter((exercise) => isBackChestMainBoundaryAllowedForTest(exercise))
          .filter((exercise) => {
            if (role === "horizontalPull") return hasHorizontalPullMain(exercise);
            if (role === "verticalPull") return isVerticalPullMain(exercise);
            return hasHorizontalPushMain(exercise);
          }).length;

      if (roleCandidateCount("horizontalPull") > 1) {
        expect(
          !(
            phase1Anchors.horizontalPull === phase2Anchors.horizontalPull &&
            phase2Anchors.horizontalPull === phase3Anchors.horizontalPull
          )
        ).toBe(true);
      }
      if (roleCandidateCount("verticalPull") > 1) {
        expect(
          !(
            phase1Anchors.verticalPull === phase2Anchors.verticalPull &&
            phase2Anchors.verticalPull === phase3Anchors.verticalPull
          )
        ).toBe(true);
      }
      if (roleCandidateCount("horizontalPush") > 1) {
        expect(
          !(
            phase1Anchors.horizontalPush === phase2Anchors.horizontalPush &&
            phase2Anchors.horizontalPush === phase3Anchors.horizontalPush
          )
        ).toBe(true);
      }
    });
  });

  test("accessory family de-dup holds by phase and richer equipment rotates pairings across phases", () => {
    const scenarios: Array<{
      id: string;
      equipment: QuestionnaireData["equipment"];
      enforceCrossPhaseRotation: boolean;
    }> = [
      { id: "none", equipment: ["none"], enforceCrossPhaseRotation: false },
      { id: "bands", equipment: ["bands"], enforceCrossPhaseRotation: true },
      { id: "dumbbells", equipment: ["dumbbells"], enforceCrossPhaseRotation: false },
      { id: "gym", equipment: ["gym"], enforceCrossPhaseRotation: true },
    ];

    scenarios.forEach((scenario) => {
      const questionnaire: QuestionnaireData = {
        goals: "General fitness",
        painAreas: [],
        experience: "Beginner",
        daysPerWeek: 3,
        equipment: scenario.equipment,
      };
      const phase1 = generateWeeklyProgram(questionnaire, `acc-rotation-${scenario.id}-p1`, {
        phaseIndex: 1,
        seed: `acc-rotation-${scenario.id}-p1`,
      });
      const phase2 = advanceToNextPhaseForBackChest({
        currentProgram: phase1,
        questionnaire,
        nextProgramId: `acc-rotation-${scenario.id}-p2`,
        seed: `acc-rotation-${scenario.id}-p2`,
      });
      const phase3 = advanceToNextPhaseForBackChest({
        currentProgram: phase2,
        questionnaire,
        nextProgramId: `acc-rotation-${scenario.id}-p3`,
        seed: `acc-rotation-${scenario.id}-p3`,
      });
      const phasePrograms = [phase1, phase2, phase3];
      const accessorySignatures: string[] = [];
      phasePrograms.forEach((program) => {
        const accessoryExercises = getBackChestDayFromProgram(program).routine
          .filter((item) => item.section === "accessory")
          .map((item) => exerciseById(item.exerciseId))
          .filter((exercise): exercise is Exercise => Boolean(exercise));
        const familyKeys = accessoryExercises.map(getBackChestAccessoryFamilyKeyForTest);
        expect(new Set(familyKeys).size).toBe(familyKeys.length);
        accessorySignatures.push(familyKeys.sort().join("|"));
      });

      if (scenario.enforceCrossPhaseRotation) {
        expect(accessorySignatures[1]).not.toBe(accessorySignatures[0]);
        expect(accessorySignatures[2]).not.toBe(accessorySignatures[1]);
      }
    });
  });

  test("Back + Chest phase generation remains deterministic across equipment with fixed seeds", () => {
    const scenarios: Array<{
      id: string;
      equipment: QuestionnaireData["equipment"];
    }> = [
      { id: "none", equipment: ["none"] },
      { id: "bands", equipment: ["bands"] },
      { id: "dumbbells", equipment: ["dumbbells"] },
      { id: "gym", equipment: ["gym"] },
    ];

    const buildSequenceSignature = (scenarioId: string, questionnaire: QuestionnaireData) => {
      const phase1 = generateWeeklyProgram(questionnaire, `det-all-${scenarioId}-p1`, {
        phaseIndex: 1,
        seed: `det-all-${scenarioId}-p1`,
      });
      const phase2 = advanceToNextPhaseForBackChest({
        currentProgram: phase1,
        questionnaire,
        nextProgramId: `det-all-${scenarioId}-p2`,
        seed: `det-all-${scenarioId}-p2`,
      });
      const phase3 = advanceToNextPhaseForBackChest({
        currentProgram: phase2,
        questionnaire,
        nextProgramId: `det-all-${scenarioId}-p3`,
        seed: `det-all-${scenarioId}-p3`,
      });
      return [phase1, phase2, phase3].map((program) => {
        const day = getBackChestDayFromProgram(program);
        const mains = day.routine
          .filter((item) => item.section === "main")
          .map((item) => item.exerciseId)
          .join("|");
        const accessories = day.routine
          .filter((item) => item.section === "accessory")
          .map((item) => item.exerciseId)
          .join("|");
        return `${mains}::${accessories}`;
      });
    };

    scenarios.forEach((scenario) => {
      const questionnaire: QuestionnaireData = {
        goals: "General fitness",
        painAreas: [],
        experience: "Beginner",
        daysPerWeek: 3,
        equipment: scenario.equipment,
      };
      const first = buildSequenceSignature(scenario.id, questionnaire);
      const second = buildSequenceSignature(scenario.id, questionnaire);
      expect(second).toEqual(first);
    });
  });

  test("reduce pain intermediate 3-day keeps Back + Chest legal, varied, and dumbbells vertical pull is structured", () => {
    const scenarios: Array<{
      id: string;
      equipment: QuestionnaireData["equipment"];
    }> = [
      { id: "gym", equipment: ["gym"] },
      { id: "none", equipment: ["none"] },
      { id: "bands", equipment: ["bands"] },
      { id: "dumbbells", equipment: ["dumbbells"] },
    ];

    scenarios.forEach((scenario) => {
      const questionnaire: QuestionnaireData = {
        goals: "Reduce pain",
        painAreas: [],
        experience: "Intermediate",
        daysPerWeek: 3,
        equipment: scenario.equipment,
      };

      const phase1 = generateWeeklyProgram(
        questionnaire,
        `acceptance-back-chest-${scenario.id}-p1`,
        {
          phaseIndex: 1,
          seed: `acceptance-back-chest-${scenario.id}-p1`,
        }
      );
      const phase2 = advanceToNextPhaseForBackChest({
        currentProgram: phase1,
        questionnaire,
        nextProgramId: `acceptance-back-chest-${scenario.id}-p2`,
        seed: `acceptance-back-chest-${scenario.id}-p2`,
      });
      const phase3 = advanceToNextPhaseForBackChest({
        currentProgram: phase2,
        questionnaire,
        nextProgramId: `acceptance-back-chest-${scenario.id}-p3`,
        seed: `acceptance-back-chest-${scenario.id}-p3`,
      });
      const phase1Anchors = getBackChestAnchorSignature(phase1, `accept-${scenario.id}-p1`);
      const phase2Anchors = getBackChestAnchorSignature(phase2, `accept-${scenario.id}-p2`);
      const phase3Anchors = getBackChestAnchorSignature(phase3, `accept-${scenario.id}-p3`);

      expect(phase2Anchors).not.toBe(phase1Anchors);
      expect(phase3Anchors).not.toBe(phase2Anchors);

      const available = normalizeEquipmentSelection(questionnaire.equipment).available;
      if (scenario.id === "gym") {
        available.add("pullup_bar");
      }
      [phase1, phase2, phase3].forEach((program) => {
        const backChestDay = getBackChestDayFromProgram(program);
        backChestDay.routine.forEach((item) => {
          const exercise = exerciseById(item.exerciseId);
          expect(exercise).toBeTruthy();
          if (!exercise) return;
          if (item.section === "main" || item.section === "accessory") {
            expect(isExerciseEligible(exercise, available)).toBe(true);
          }
        });
      });

      if (scenario.id === "none" || scenario.id === "dumbbells") {
        [phase1, phase2, phase3].forEach((program) => {
          const backChestDay = getBackChestDayFromProgram(program);
          backChestDay.routine
            .filter((item) => item.section === "main" || item.section === "accessory")
            .forEach((item) => {
              const exercise = exerciseById(item.exerciseId);
              expect(exercise).toBeTruthy();
              if (!exercise) return;
              expect(exercise.equipment.includes("bands")).toBe(false);
              expect(exercise.equipment.includes("cables")).toBe(false);
            });
        });
      }

      if (scenario.id === "dumbbells") {
        const phase2Day = getBackChestDayFromProgram(phase2);
        const phase3Day = getBackChestDayFromProgram(phase3);
        const phase2Main = phase2Day.routine
          .filter((item) => item.section === "main")
          .map((item) => exerciseById(item.exerciseId))
          .filter((exercise): exercise is Exercise => Boolean(exercise));
        const phase3Main = phase3Day.routine
          .filter((item) => item.section === "main")
          .map((item) => exerciseById(item.exerciseId))
          .filter((exercise): exercise is Exercise => Boolean(exercise));
        const phase2Vertical = phase2Main.find((exercise) => isVerticalPullMain(exercise));
        const phase3Vertical = phase3Main.find((exercise) => isVerticalPullMain(exercise));
        expect(phase2Vertical).toBeTruthy();
        expect(phase3Vertical).toBeTruthy();
        if (!phase2Vertical || !phase3Vertical) return;

        expect(phase2Vertical.id).toBe("dumbbell-pullover");
        expect(phase3Vertical.id).toBe("dumbbell-pullover");

        [phase2Day, phase3Day].forEach((day) => {
          day.routine
            .filter((item) => item.section === "main" || item.section === "accessory")
            .forEach((item) => {
              const exercise = exerciseById(item.exerciseId);
              expect(exercise).toBeTruthy();
              if (!exercise) return;
              expect(isLowerBodyExerciseForBackChestGuard(exercise)).toBe(false);
              expect(isShoulderIsolationLeakForBackChestGuard(exercise)).toBe(false);
            });
        });
      }
    });
  });

  test("intermediate and advanced Back + Chest mains enforce one vertical pull and category caps", () => {
    const cases: Array<{
      id: string;
      questionnaire: QuestionnaireData;
      phaseIndex: 1 | 2 | 3;
      expectedMainCount: number;
    }> = [
      {
        id: "intermediate-gym-skill",
        questionnaire: {
          goals: "General fitness",
          painAreas: [],
          experience: "Intermediate",
          daysPerWeek: 3,
          equipment: ["gym"],
        },
        phaseIndex: 2,
        expectedMainCount: 4,
      },
      {
        id: "advanced-gym-growth",
        questionnaire: {
          goals: "Athletic performance",
          painAreas: [],
          experience: "Advanced",
          daysPerWeek: 3,
          equipment: ["gym", "pullup bar"],
        },
        phaseIndex: 3,
        expectedMainCount: 5,
      },
    ];

    cases.forEach((entry) => {
      const program = generateWeeklyProgram(entry.questionnaire, `category-caps-${entry.id}`, {
        phaseIndex: entry.phaseIndex,
        seed: `category-caps-${entry.id}`,
      });
      const mainExercises = getBackChestDayFromProgram(program).routine
        .filter((item) => item.section === "main")
        .map((item) => exerciseById(item.exerciseId))
        .filter((exercise): exercise is Exercise => Boolean(exercise));
      expect(mainExercises.length).toBe(entry.expectedMainCount);

      const rowCount = mainExercises.filter((exercise) => hasHorizontalPullMain(exercise)).length;
      const pressCount = mainExercises.filter((exercise) =>
        hasHorizontalPushMain(exercise)
      ).length;
      const verticalCount = mainExercises.filter(
        (exercise) => resolveBackChestMainCategoryForTest(exercise) === "vertical"
      ).length;
      const flyCount = mainExercises.filter((exercise) =>
        isBackChestFlyPatternForTest(exercise)
      ).length;
      const latAccentCount = mainExercises.filter((exercise) =>
        isBackChestLatAccentForTest(exercise)
      ).length;

      expect(verticalCount).toBe(1);
      expect(rowCount).toBeLessThanOrEqual(2);
      expect(pressCount).toBeLessThanOrEqual(2);
      expect(flyCount).toBeLessThanOrEqual(1);
      expect(latAccentCount).toBeLessThanOrEqual(1);
    });
  });

  test("secondary mains do not duplicate anchor stimulus keys", () => {
    const scenarios: QuestionnaireData[] = [
      {
        goals: "General fitness",
        painAreas: [],
        experience: "Intermediate",
        daysPerWeek: 3,
        equipment: ["bands"],
      },
      {
        goals: "Athletic performance",
        painAreas: [],
        experience: "Advanced",
        daysPerWeek: 3,
        equipment: ["gym", "pullup bar"],
      },
    ];

    scenarios.forEach((questionnaire, index) => {
      const program = generateWeeklyProgram(questionnaire, `secondary-stimulus-${index}`, {
        phaseIndex: questionnaire.experience === "Intermediate" ? 2 : 3,
        seed: `secondary-stimulus-${index}`,
      });
      const mains = getBackChestDayFromProgram(program).routine
        .filter((item) => item.section === "main")
        .map((item) => exerciseById(item.exerciseId))
        .filter((exercise): exercise is Exercise => Boolean(exercise));
      if (mains.length <= 3) return;

      const anchorStimulus = new Set(
        mains.slice(0, 3).map((exercise) => resolveBackChestStimulusKeyForTest(exercise))
      );
      mains.slice(3).forEach((secondary) => {
        expect(anchorStimulus.has(resolveBackChestStimulusKeyForTest(secondary))).toBe(false);
      });
    });
  });

  test("phase 1 Back + Chest keeps category discipline even for advanced users", () => {
    const questionnaire: QuestionnaireData = {
      goals: "Athletic performance",
      painAreas: [],
      experience: "Advanced",
      daysPerWeek: 3,
      equipment: ["gym", "pullup bar"],
    };
    const program = generateWeeklyProgram(questionnaire, "phase1-category-discipline", {
      phaseIndex: 1,
      seed: "phase1-category-discipline",
    });
    const mains = getBackChestDayFromProgram(program).routine
      .filter((item) => item.section === "main")
      .map((item) => exerciseById(item.exerciseId))
      .filter((exercise): exercise is Exercise => Boolean(exercise));

    const rowCount = mains.filter((exercise) => hasHorizontalPullMain(exercise)).length;
    const pressCount = mains.filter((exercise) => hasHorizontalPushMain(exercise)).length;
    const verticalCount = mains.filter(
      (exercise) => resolveBackChestMainCategoryForTest(exercise) === "vertical"
    ).length;
    expect(verticalCount).toBe(1);
    expect(rowCount).toBeLessThanOrEqual(2);
    expect(pressCount).toBeLessThanOrEqual(2);
  });

  test("if a Back + Chest main fly is selected it belongs to chest_fly family", () => {
    const questionnaire: QuestionnaireData = {
      goals: "General fitness",
      painAreas: [],
      experience: "Intermediate",
      daysPerWeek: 3,
      equipment: ["gym"],
    };
    const program = generateWeeklyProgram(questionnaire, "fly-family-correctness", {
      phaseIndex: 2,
      seed: "fly-family-correctness",
    });
    const flyMains = getBackChestDayFromProgram(program).routine
      .filter((item) => item.section === "main")
      .map((item) => exerciseById(item.exerciseId))
      .filter((exercise): exercise is Exercise => Boolean(exercise))
      .filter((exercise) => isBackChestFlyPatternForTest(exercise));

    flyMains.forEach((exercise) => {
      expect(normalizeToken(exercise.familyKey ?? "")).toBe("chestfly");
      expect(normalizeToken(exercise.id)).not.toBe("machinechestpress");
    });
  });

  test("advanced gym Back + Chest keeps vertical category capped in phase 2 and phase 3", () => {
    const questionnaire: QuestionnaireData = {
      goals: "General fitness",
      painAreas: [],
      experience: "Advanced",
      daysPerWeek: 3,
      equipment: ["gym", "pullup bar"],
    };
    const phase1 = generateWeeklyProgram(questionnaire, "vertical-cap-advanced-gym-p1", {
      phaseIndex: 1,
      seed: "vertical-cap-advanced-gym-p1",
    });
    const phase2 = advanceToNextPhaseForBackChest({
      currentProgram: phase1,
      questionnaire,
      nextProgramId: "vertical-cap-advanced-gym-p2",
      seed: "vertical-cap-advanced-gym-p2",
    });
    const phase3 = advanceToNextPhaseForBackChest({
      currentProgram: phase2,
      questionnaire,
      nextProgramId: "vertical-cap-advanced-gym-p3",
      seed: "vertical-cap-advanced-gym-p3",
    });

    [phase2, phase3].forEach((program) => {
      const mainExercises = getBackChestDayFromProgram(program).routine
        .filter((item) => item.section === "main")
        .map((item) => exerciseById(item.exerciseId))
        .filter((exercise): exercise is Exercise => Boolean(exercise));
      const verticalCount = mainExercises.filter(
        (exercise) => resolveBackChestMainCategoryForTest(exercise) === "vertical"
      ).length;
      expect(verticalCount).toBeLessThanOrEqual(1);

      const hasPullupFamily = mainExercises.some((exercise) => {
        const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
        return (
          descriptor.includes("pullup") ||
          descriptor.includes("pull-up") ||
          descriptor.includes("chin-up") ||
          descriptor.includes("chinup")
        );
      });
      const hasPulldownFamily = mainExercises.some((exercise) => {
        const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
        return descriptor.includes("pulldown") || descriptor.includes("pull-down");
      });
      expect(!(hasPullupFamily && hasPulldownFamily)).toBe(true);
    });
  });

  test("vertical category safety-net holds under multiple advanced gym seeds", () => {
    const questionnaire: QuestionnaireData = {
      goals: "General fitness",
      painAreas: [],
      experience: "Advanced",
      daysPerWeek: 3,
      equipment: ["gym", "pullup bar"],
    };
    const verticalOptionCount = countEligibleBackChestRoleCandidatesForTest({
      questionnaire,
      role: "verticalPull",
    });
    expect(verticalOptionCount).toBeGreaterThan(1);

    ["a", "b", "c", "d"].forEach((seedSuffix) => {
      const program = generateWeeklyProgram(
        questionnaire,
        `vertical-cap-safety-${seedSuffix}`,
        {
          phaseIndex: 3,
          seed: `vertical-cap-safety-${seedSuffix}`,
        }
      );
      const mainExercises = getBackChestDayFromProgram(program).routine
        .filter((item) => item.section === "main")
        .map((item) => exerciseById(item.exerciseId))
        .filter((exercise): exercise is Exercise => Boolean(exercise));
      const verticalCount = mainExercises.filter(
        (exercise) => resolveBackChestMainCategoryForTest(exercise) === "vertical"
      ).length;
      expect(verticalCount).toBeLessThanOrEqual(1);
    });
  });

  test("intermediate dumbbells Back + Chest mains keep unique IDs (no anchor/secondary duplicates)", () => {
    const questionnaire: QuestionnaireData = {
      goals: "Improve posture",
      painAreas: [],
      experience: "Intermediate",
      daysPerWeek: 3,
      equipment: ["dumbbells"],
    };
    const program = generateWeeklyProgram(questionnaire, "unique-main-ids-intermediate-db", {
      phaseIndex: 2,
      seed: "unique-main-ids-intermediate-db",
    });
    const mainIds = getBackChestDayFromProgram(program).routine
      .filter((item) => item.section === "main")
      .map((item) => item.exerciseId);

    expect(mainIds.length).toBeGreaterThanOrEqual(3);
    expect(new Set(mainIds).size).toBe(mainIds.length);
  });

  test("advanced gym Back + Chest mains keep unique IDs with 5-main template", () => {
    const questionnaire: QuestionnaireData = {
      goals: "General fitness",
      painAreas: [],
      experience: "Advanced",
      daysPerWeek: 3,
      equipment: ["gym", "pullup bar"],
    };
    const program = generateWeeklyProgram(questionnaire, "unique-main-ids-advanced-gym", {
      phaseIndex: 3,
      seed: "unique-main-ids-advanced-gym",
    });
    const mainIds = getBackChestDayFromProgram(program).routine
      .filter((item) => item.section === "main")
      .map((item) => item.exerciseId);

    expect(mainIds.length).toBe(5);
    expect(new Set(mainIds).size).toBe(mainIds.length);
  });

  test("Back + Chest duplicate-ID guard remains deterministic for fixed seed", () => {
    const questionnaire: QuestionnaireData = {
      goals: "Improve posture",
      painAreas: [],
      experience: "Intermediate",
      daysPerWeek: 3,
      equipment: ["dumbbells"],
    };
    const first = generateWeeklyProgram(questionnaire, "unique-main-ids-deterministic-a", {
      phaseIndex: 2,
      seed: "unique-main-ids-deterministic",
    });
    const second = generateWeeklyProgram(questionnaire, "unique-main-ids-deterministic-b", {
      phaseIndex: 2,
      seed: "unique-main-ids-deterministic",
    });
    const firstMainIds = getBackChestDayFromProgram(first).routine
      .filter((item) => item.section === "main")
      .map((item) => item.exerciseId);
    const secondMainIds = getBackChestDayFromProgram(second).routine
      .filter((item) => item.section === "main")
      .map((item) => item.exerciseId);

    expect(firstMainIds).toEqual(secondMainIds);
    expect(new Set(firstMainIds).size).toBe(firstMainIds.length);
    expect(new Set(secondMainIds).size).toBe(secondMainIds.length);
  });

  test("intermediate dumbbells Back + Chest rotates full day routine IDs across phases when secondary alternatives exist", () => {
    const questionnaire: QuestionnaireData = {
      goals: "Improve posture",
      painAreas: [],
      experience: "Intermediate",
      daysPerWeek: 3,
      equipment: ["dumbbells"],
    };
    const phase1 = generateWeeklyProgram(questionnaire, "full-routine-db-p1", {
      phaseIndex: 1,
      seed: "full-routine-db-seed",
    });
    const phase2 = advanceToNextPhaseForBackChest({
      currentProgram: phase1,
      questionnaire,
      nextProgramId: "full-routine-db-p2",
      seed: "full-routine-db-seed",
    });
    const phase3 = advanceToNextPhaseForBackChest({
      currentProgram: phase2,
      questionnaire,
      nextProgramId: "full-routine-db-p3",
      seed: "full-routine-db-seed",
    });

    const phase1Ids = getBackChestFullRoutineIds(phase1);
    const phase2Ids = getBackChestFullRoutineIds(phase2);
    const phase3Ids = getBackChestFullRoutineIds(phase3);
    const hasSecondaryAlternatives =
      countEligibleBackChestSecondaryCandidatesForTest({
        questionnaire,
        category: "press",
      }) > 1 ||
      countEligibleBackChestSecondaryCandidatesForTest({
        questionnaire,
        category: "row",
      }) > 1;

    if (hasSecondaryAlternatives) {
      expect(phase1Ids).not.toEqual(phase2Ids);
      expect(phase2Ids).not.toEqual(phase3Ids);
    }
  });

  test("intermediate none Back + Chest phase 1 and phase 2 are not identical when alternatives exist", () => {
    const questionnaire: QuestionnaireData = {
      goals: "Improve posture",
      painAreas: [],
      experience: "Intermediate",
      daysPerWeek: 3,
      equipment: ["none"],
    };
    const phase1 = generateWeeklyProgram(questionnaire, "full-routine-none-p1", {
      phaseIndex: 1,
      seed: "full-routine-none-seed",
    });
    const phase2 = advanceToNextPhaseForBackChest({
      currentProgram: phase1,
      questionnaire,
      nextProgramId: "full-routine-none-p2",
      seed: "full-routine-none-seed",
    });
    const phase1Ids = getBackChestFullRoutineIds(phase1);
    const phase2Ids = getBackChestFullRoutineIds(phase2);
    const hasSecondaryAlternatives =
      countEligibleBackChestSecondaryCandidatesForTest({
        questionnaire,
        category: "press",
      }) > 1 ||
      countEligibleBackChestSecondaryCandidatesForTest({
        questionnaire,
        category: "row",
      }) > 1;

    if (hasSecondaryAlternatives) {
      expect(phase1Ids).not.toEqual(phase2Ids);
    }
  });

  test("mixed gym + bands + dumbbells Back + Chest phase 1 prefers non-band press anchor when load options exist", () => {
    const questionnaire: QuestionnaireData = {
      goals: "General fitness",
      painAreas: [],
      experience: "Intermediate",
      daysPerWeek: 3,
      equipment: ["gym", "bands", "dumbbells"],
    };
    const program = generateWeeklyProgram(questionnaire, "mixed-gym-prefer-load-press", {
      phaseIndex: 1,
      seed: "mixed-gym-prefer-load-press",
    });
    const anchorIds = getBackChestAnchorIds(program, "mixed-gym-prefer-load-press");
    const anchorPress = exerciseById(anchorIds.horizontalPush);
    expect(anchorPress).toBeTruthy();
    if (!anchorPress) return;

    const available = normalizeEquipmentSelection(questionnaire.equipment).available;
    available.add("machines");
    available.add("cables");
    const hasMachineOrDbPress = exercises
      .filter((exercise) => exercise.category === "main")
      .filter((exercise) => isExerciseEligible(exercise, available))
      .filter((exercise) => hasHorizontalPushMain(exercise))
      .some(
        (exercise) =>
          exercise.equipment.includes("machines") ||
          exercise.equipment.includes("cables") ||
          exercise.equipment.includes("dumbbells")
      );

    if (hasMachineOrDbPress) {
      expect(isBandPressForTest(anchorPress)).toBe(false);
    }
  });

  test("Back + Chest accessory tightening avoids suspension-row accessories when scap/rear options are available", () => {
    const questionnaire: QuestionnaireData = {
      goals: "Improve posture",
      painAreas: [],
      experience: "Intermediate",
      daysPerWeek: 3,
      equipment: ["gym", "bands", "dumbbells"],
    };
    const program = generateWeeklyProgram(questionnaire, "accessory-row-tightening", {
      phaseIndex: 2,
      seed: "accessory-row-tightening",
    });
    const available = normalizeEquipmentSelection(questionnaire.equipment).available;
    available.add("machines");
    available.add("cables");
    const hasScapRearAlternatives = exercises
      .filter((exercise) => exercise.category === "main")
      .filter((exercise) => isExerciseEligible(exercise, available))
      .filter(
        (exercise) =>
          isRearDeltAccessory(exercise) || isScapOrExternalAccessory(exercise)
      )
      .filter((exercise) => !isSuspensionRowLikeAccessoryForTest(exercise)).length;

    const accessoryExercises = getBackChestDayFromProgram(program).routine
      .filter((item) => item.section === "accessory")
      .map((item) => exerciseById(item.exerciseId))
      .filter((exercise): exercise is Exercise => Boolean(exercise));

    if (hasScapRearAlternatives >= 2) {
      expect(
        accessoryExercises.some((exercise) => isSuspensionRowLikeAccessoryForTest(exercise))
      ).toBe(false);
    }
  });

  test("intermediate dumbbells Back + Chest anchors are globally non-static across phases when alternatives exist", () => {
    const questionnaire: QuestionnaireData = {
      goals: "Improve posture",
      painAreas: [],
      experience: "Intermediate",
      daysPerWeek: 3,
      equipment: ["dumbbells"],
    };
    const phase1 = generateWeeklyProgram(questionnaire, "non-static-dumbbells-p1", {
      phaseIndex: 1,
      seed: "non-static-dumbbells-p1",
    });
    const phase2 = advanceToNextPhaseForBackChest({
      currentProgram: phase1,
      questionnaire,
      nextProgramId: "non-static-dumbbells-p2",
      seed: "non-static-dumbbells-p2",
    });
    const phase3 = advanceToNextPhaseForBackChest({
      currentProgram: phase2,
      questionnaire,
      nextProgramId: "non-static-dumbbells-p3",
      seed: "non-static-dumbbells-p3",
    });

    const p1 = getBackChestAnchorIds(phase1, "dumbbells-p1");
    const p2 = getBackChestAnchorIds(phase2, "dumbbells-p2");
    const p3 = getBackChestAnchorIds(phase3, "dumbbells-p3");

    const available = normalizeEquipmentSelection(questionnaire.equipment).available;
    const anchorsByPhase = [p1, p2, p3].map((anchors) => ({
      horizontalPull: exerciseById(anchors.horizontalPull),
      horizontalPush: exerciseById(anchors.horizontalPush),
      verticalPull: exerciseById(anchors.verticalPull),
    }));
    const rowAlternativesExist = anchorsByPhase.some(
      (phaseAnchors) =>
        phaseAnchors.horizontalPull &&
        hasSameTierBackChestAnchorAlternative({
          selected: phaseAnchors.horizontalPull,
          role: "horizontalPull",
          available,
        })
    );
    const pressAlternativesExist = anchorsByPhase.some(
      (phaseAnchors) =>
        phaseAnchors.horizontalPush &&
        hasSameTierBackChestAnchorAlternative({
          selected: phaseAnchors.horizontalPush,
          role: "horizontalPush",
          available,
        })
    );
    const verticalAlternativesExist = anchorsByPhase.some(
      (phaseAnchors) =>
        phaseAnchors.verticalPull &&
        hasSameTierBackChestAnchorAlternative({
          selected: phaseAnchors.verticalPull,
          role: "verticalPull",
          available,
        })
    );

    if (rowAlternativesExist) {
      expect(!(p1.horizontalPull === p2.horizontalPull && p2.horizontalPull === p3.horizontalPull)).toBe(true);
    }
    if (pressAlternativesExist) {
      expect(!(p1.horizontalPush === p2.horizontalPush && p2.horizontalPush === p3.horizontalPush)).toBe(true);
    }
    if (verticalAlternativesExist) {
      expect(!(p1.verticalPull === p2.verticalPull && p2.verticalPull === p3.verticalPull)).toBe(true);
    }
  });

  test("mixed dumbbells+bands Back + Chest keeps vertical category cap and non-static anchors", () => {
    const questionnaire: QuestionnaireData = {
      goals: "Improve posture",
      painAreas: [],
      experience: "Intermediate",
      daysPerWeek: 3,
      equipment: ["dumbbells", "bands"],
    };
    const phase1 = generateWeeklyProgram(questionnaire, "mixed-non-static-p1", {
      phaseIndex: 1,
      seed: "mixed-non-static-p1",
    });
    const phase2 = advanceToNextPhaseForBackChest({
      currentProgram: phase1,
      questionnaire,
      nextProgramId: "mixed-non-static-p2",
      seed: "mixed-non-static-p2",
    });
    const phase3 = advanceToNextPhaseForBackChest({
      currentProgram: phase2,
      questionnaire,
      nextProgramId: "mixed-non-static-p3",
      seed: "mixed-non-static-p3",
    });

    [phase1, phase2, phase3].forEach((program) => {
      const mainExercises = getBackChestDayFromProgram(program).routine
        .filter((item) => item.section === "main")
        .map((item) => exerciseById(item.exerciseId))
        .filter((exercise): exercise is Exercise => Boolean(exercise));
      const verticalCount = mainExercises.filter(
        (exercise) => resolveBackChestMainCategoryForTest(exercise) === "vertical"
      ).length;
      expect(verticalCount).toBeLessThanOrEqual(1);
    });

    const roleAlternativesExist =
      countEligibleBackChestRoleCandidatesForTest({
        questionnaire,
        role: "horizontalPull",
      }) > 1 ||
      countEligibleBackChestRoleCandidatesForTest({
        questionnaire,
        role: "horizontalPush",
      }) > 1 ||
      countEligibleBackChestRoleCandidatesForTest({
        questionnaire,
        role: "verticalPull",
      }) > 1;

    if (roleAlternativesExist) {
      const p1 = getBackChestAnchorSignature(phase1, "mixed-p1");
      const p2 = getBackChestAnchorSignature(phase2, "mixed-p2");
      const p3 = getBackChestAnchorSignature(phase3, "mixed-p3");
      expect(p2).not.toBe(p1);
      expect(p3).not.toBe(p2);
    }
  });
});
