import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import { isExerciseEligible, normalizeEquipmentSelection, type Equipment } from "@/lib/equipment";
import { exerciseById, exercises, type Exercise } from "@/lib/exercises";
import type { Program, ProgramDay, ProgramRoutineItem } from "@/lib/types";
import {
  buildThreeDayCoachAuditHints,
  canUseUprightRowForThreeDayShoulder,
  isBackChestPosteriorSupportFamily,
  isBackChestTruthfulChestIsolation,
  isBackExtensionHingeFamily,
  isUprightRowFamilyExercise,
  resolveBackChestAccessoryCoachFamily,
  resolveCoreCoachFamily,
  resolveLowerUnilateralCoachFamily,
} from "@/lib/program/threeDayCoachPolicy";
import type { ProgramConstraintWarning } from "@/lib/program/programFinalization";

export type ThreeDayReviewPersona = {
  name: string;
  questionnaire: QuestionnaireData;
};

export const threeDayReviewPersonas: ThreeDayReviewPersona[] = [
  {
    name: "Beginner / 3 days / gym / no pain",
    questionnaire: {
      goals: "General fitness",
      painAreas: [],
      experience: "Beginner",
      equipment: ["gym"],
      daysPerWeek: 3,
    },
  },
  {
    name: "Intermediate / 3 days / gym / no pain",
    questionnaire: {
      goals: "General fitness",
      painAreas: [],
      experience: "Intermediate",
      equipment: ["gym"],
      daysPerWeek: 3,
    },
  },
  {
    name: "Advanced / 3 days / gym / no pain",
    questionnaire: {
      goals: "General fitness",
      painAreas: [],
      experience: "Advanced",
      equipment: ["gym"],
      daysPerWeek: 3,
    },
  },
  {
    name: "Beginner / 3 days / gym / lower back pain",
    questionnaire: {
      goals: "Reduce pain",
      painAreas: ["lower back"],
      experience: "Beginner",
      equipment: ["gym"],
      daysPerWeek: 3,
    },
  },
  {
    name: "Beginner / 3 days / dumbbells / no pain",
    questionnaire: {
      goals: "General fitness",
      painAreas: [],
      experience: "Beginner",
      equipment: ["dumbbells"],
      daysPerWeek: 3,
    },
  },
  {
    name: "Intermediate / 3 days / dumbbells / no pain",
    questionnaire: {
      goals: "General fitness",
      painAreas: [],
      experience: "Intermediate",
      equipment: ["dumbbells"],
      daysPerWeek: 3,
    },
  },
  {
    name: "Beginner / 3 days / dumbbells / lower back pain",
    questionnaire: {
      goals: "Reduce pain",
      painAreas: ["lower back"],
      experience: "Beginner",
      equipment: ["dumbbells"],
      daysPerWeek: 3,
    },
  },
  {
    name: "Beginner / 3 days / bands / no pain",
    questionnaire: {
      goals: "General fitness",
      painAreas: [],
      experience: "Beginner",
      equipment: ["bands"],
      daysPerWeek: 3,
    },
  },
  {
    name: "Intermediate / 3 days / bands / no pain",
    questionnaire: {
      goals: "General fitness",
      painAreas: [],
      experience: "Intermediate",
      equipment: ["bands"],
      daysPerWeek: 3,
    },
  },
  {
    name: "Beginner / 3 days / bands / lower back pain",
    questionnaire: {
      goals: "Reduce pain",
      painAreas: ["lower back"],
      experience: "Beginner",
      equipment: ["bands"],
      daysPerWeek: 3,
    },
  },
  {
    name: "Beginner / 3 days / none / no pain",
    questionnaire: {
      goals: "General fitness",
      painAreas: [],
      experience: "Beginner",
      equipment: ["none"],
      daysPerWeek: 3,
    },
  },
  {
    name: "Beginner / 3 days / none / lower back pain",
    questionnaire: {
      goals: "Reduce pain",
      painAreas: ["lower back"],
      experience: "Beginner",
      equipment: ["none"],
      daysPerWeek: 3,
    },
  },
];

export const threeDayReviewPhaseIndexes = [1, 2, 3] as const;

type EvaluationInput = {
  program: Program;
  questionnaire: QuestionnaireData;
  warnings: ProgramConstraintWarning[];
};

export type ThreeDayQualityEvaluation = {
  failures: string[];
  unilateralFamilies: string[];
};

const normalizeToken = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");

const getExercise = (item: ProgramRoutineItem) => exerciseById(item.exerciseId);

const getSectionItems = (day: ProgramDay | undefined, section: ProgramRoutineItem["section"]) =>
  day?.routine.filter((item) => item.section === section) ?? [];

const getSectionExercises = (day: ProgramDay | undefined, section: ProgramRoutineItem["section"]) =>
  getSectionItems(day, section)
    .map(getExercise)
    .filter((exercise): exercise is Exercise => Boolean(exercise));

const descriptorFor = (exercise: Exercise) =>
  `${exercise.id} ${exercise.name} ${exercise.familyKey ?? ""} ${
    exercise.variantKey ?? ""
  }`.toLowerCase();

const hasPattern = (exercise: Exercise, pattern: string) =>
  exercise.movementPattern.some((entry) => normalizeToken(entry) === normalizeToken(pattern));

const hasTag = (exercise: Exercise, tag: string) =>
  (exercise.tags ?? []).some((entry) => normalizeToken(entry) === normalizeToken(tag));

const isHorizontalPush = (exercise: Exercise) =>
  hasPattern(exercise, "push") && !hasPattern(exercise, "verticalPush");

const isHorizontalPull = (exercise: Exercise) => {
  const descriptor = descriptorFor(exercise);
  return hasPattern(exercise, "horizontalPull") || descriptor.includes("row");
};

const isVerticalPull = (exercise: Exercise) => hasPattern(exercise, "verticalPull");

const isVerticalPullSurrogate = (exercise: Exercise) => {
  const descriptor = descriptorFor(exercise);
  return (
    hasPattern(exercise, "pullover") ||
    descriptor.includes("pullover") ||
    descriptor.includes("lat sweep") ||
    descriptor.includes("lat-sweep") ||
    descriptor.includes("lat pulldown") ||
    descriptor.includes("lat-pulldown")
  );
};

const isRearDeltFamily = (exercise: Exercise) => {
  const descriptor = descriptorFor(exercise);
  return (
    descriptor.includes("rear delt") ||
    descriptor.includes("rear-delt") ||
    descriptor.includes("reverse pec deck") ||
    descriptor.includes("reverse-pec-deck")
  );
};

const isSquatPattern = (exercise: Exercise) => {
  const descriptor = descriptorFor(exercise);
  return (
    hasPattern(exercise, "squat") ||
    hasPattern(exercise, "lunge") ||
    descriptor.includes("squat") ||
    descriptor.includes("lunge") ||
    descriptor.includes("step-up") ||
    descriptor.includes("step up")
  );
};

const isHingeOrSurrogate = (exercise: Exercise) => {
  const descriptor = descriptorFor(exercise);
  return (
    hasPattern(exercise, "hinge") ||
    hasTag(exercise, "posteriorChain") ||
    descriptor.includes("rdl") ||
    descriptor.includes("romanian deadlift") ||
    descriptor.includes("hip thrust") ||
    descriptor.includes("glute bridge") ||
    descriptor.includes("hamstring curl") ||
    descriptor.includes("back extension")
  );
};

const isCoreExercise = (exercise: Exercise) => {
  const family = resolveCoreCoachFamily(exercise);
  const descriptor = descriptorFor(exercise);
  return (
    family !== "other" ||
    hasPattern(exercise, "core") ||
    hasTag(exercise, "core") ||
    descriptor.includes("plank") ||
    descriptor.includes("pallof") ||
    descriptor.includes("dead bug") ||
    descriptor.includes("hollow") ||
    descriptor.includes("brace") ||
    descriptor.includes("woodchop") ||
    descriptor.includes("carry") ||
    descriptor.includes("suitcase") ||
    descriptor.includes("farmer") ||
    descriptor.includes("march")
  );
};

const isLowerBackPainProfile = (questionnaire: QuestionnaireData) =>
  questionnaire.painAreas.some((area) => area.toLowerCase().includes("lower back"));

const allProgramItems = (program: Program) => program.week.flatMap((day) => day.routine);

const allProgramExercises = (program: Program) =>
  allProgramItems(program)
    .map(getExercise)
    .filter((exercise): exercise is Exercise => Boolean(exercise));

const trainingContextFor = (questionnaire: QuestionnaireData) =>
  questionnaire.equipment.some((item) => item.toLowerCase() === "gym") ? "gym" : "home";

const experienceForPolicy = (questionnaire: QuestionnaireData) => {
  if (questionnaire.experience === "Advanced") return "advanced";
  if (questionnaire.experience === "Intermediate") return "intermediate";
  return "beginner";
};

const hasLegalNonSupportBackChestAccessoryAlternative = (
  available: Set<Equipment>,
  selectedIds: Set<string>
) =>
  exercises.some((exercise) => {
    if (selectedIds.has(exercise.id)) return false;
    if (!isExerciseEligible(exercise, available)) return false;

    const family = resolveBackChestAccessoryCoachFamily(exercise);
    return (
      !isBackChestPosteriorSupportFamily(family) &&
      ["back_thickness", "back_width", "pullover_serratus", "chest_isolation"].includes(family) &&
      ((Boolean(exercise.supportOnly) && !exercise.equipment.includes("none")) ||
        family === "pullover_serratus" ||
        family === "chest_isolation")
    );
  });

const formatExerciseIds = (exercisesToFormat: Exercise[]) =>
  exercisesToFormat.map((exercise) => exercise.id).join(", ");

const isChestIsolationSlot = (item: ProgramRoutineItem) => {
  const slotLane = item.selectionDebug?.slotLane ?? "";
  const slotRole = (item.selectionDebug as { slotRole?: string } | undefined)?.slotRole ?? "";
  const slotKind = item.selectionDebug?.slotKind ?? "";
  return (
    slotLane === "chest" ||
    slotRole === "accessoryChestIsolation" ||
    slotKind.toLowerCase().includes("chest")
  );
};

export const evaluateThreeDayPersonaQuality = ({
  program,
  questionnaire,
  warnings,
}: EvaluationInput): ThreeDayQualityEvaluation => {
  const failures: string[] = [];
  const available = normalizeEquipmentSelection(questionnaire.equipment).available;
  const selectedIds = new Set(allProgramItems(program).map((item) => item.exerciseId));

  const blockingWarnings = warnings.filter((warning) =>
    ["violation", "missing", "coverage"].includes(warning.kind)
  );
  if (blockingWarnings.length > 0) {
    failures.push(
      `final warning buffer contains blocking warnings: ${blockingWarnings
        .map((warning) => `${warning.kind}:${warning.message}`)
        .join("; ")}`
    );
  }

  const coachHints = buildThreeDayCoachAuditHints(program.week);
  if (coachHints.length > 0) {
    failures.push(`coach audit hints remain: ${coachHints.join("; ")}`);
  }

  const dayOne = program.week.find((day) => day.title === "Back + Chest");
  const dayTwo = program.week.find((day) => day.title === "Shoulders + Arms");
  const dayThree = program.week.find((day) => day.title === "Legs + Abs");

  if (!dayOne) failures.push("missing Back + Chest day");
  if (!dayTwo) failures.push("missing Shoulders + Arms day");
  if (!dayThree) failures.push("missing Legs + Abs day");

  const dayOneMains = getSectionExercises(dayOne, "main");
  const dayOneAccessories = getSectionExercises(dayOne, "accessory");
  const dayTwoMains = getSectionExercises(dayTwo, "main");
  const dayThreeMainItems = getSectionItems(dayThree, "main");
  const dayThreeMains = dayThreeMainItems
    .map(getExercise)
    .filter((exercise): exercise is Exercise => Boolean(exercise));
  const dayThreeAccessories = getSectionItems(dayThree, "accessory");

  const hasDayOnePush = dayOneMains.some(isHorizontalPush);
  const hasDayOneHorizontalPull = dayOneMains.some(isHorizontalPull);
  const hasDayOneVerticalPullOrSurrogate = dayOneMains.some(
    (exercise) => isVerticalPull(exercise) || isVerticalPullSurrogate(exercise)
  );
  if (!hasDayOnePush || !hasDayOneHorizontalPull || !hasDayOneVerticalPullOrSurrogate) {
    failures.push(
      `Day 1 lacks required main coverage: push=${hasDayOnePush}, horizontalPull=${hasDayOneHorizontalPull}, verticalOrSurrogate=${hasDayOneVerticalPullOrSurrogate}`
    );
  }

  const dayOneAccessoryFamilies = dayOneAccessories.map((exercise) =>
    resolveBackChestAccessoryCoachFamily(exercise)
  );
  const dayOneAccessoriesAllSupport =
    dayOneAccessories.length > 1 &&
    dayOneAccessoryFamilies.every((family) => isBackChestPosteriorSupportFamily(family));
  const doubleSupportJustified =
    questionnaire.goals.toLowerCase().includes("posture") ||
    questionnaire.goals.toLowerCase().includes("pain") ||
    questionnaire.painAreas.some((area) => {
      const normalized = area.toLowerCase();
      return (
        normalized.includes("neck") ||
        normalized.includes("shoulder") ||
        normalized.includes("upper back")
      );
    });
  if (
    dayOneAccessoriesAllSupport &&
    !doubleSupportJustified &&
    hasLegalNonSupportBackChestAccessoryAlternative(available, selectedIds)
  ) {
    failures.push(
      `Day 1 accessories double rear/scap support despite legal alternatives: ${formatExerciseIds(
        dayOneAccessories
      )}`
    );
  }

  const rearDeltMainCount = dayTwoMains.filter(isRearDeltFamily).length;
  if (rearDeltMainCount > 1) {
    failures.push(`Day 2 over-stacks rear-delt mains: ${formatExerciseIds(dayTwoMains)}`);
  }

  const uprightRows = allProgramExercises(program).filter(isUprightRowFamilyExercise);
  const uprightRowSafe = canUseUprightRowForThreeDayShoulder({
    experience: experienceForPolicy(questionnaire),
    painSeverity: questionnaire.painAreas.length > 0 ? "medium" : "low",
    painAreas: questionnaire.painAreas,
    trainingContext: trainingContextFor(questionnaire),
    availableEquipment: available,
  });
  if (uprightRows.length > 0 && !uprightRowSafe) {
    failures.push(`upright row selected outside safe profile: ${formatExerciseIds(uprightRows)}`);
  }

  const hasDayThreeSquat = dayThreeMains.some(isSquatPattern);
  const hasDayThreeHinge = dayThreeMains.some(isHingeOrSurrogate);
  const dayThreeUnilateralFamilies = dayThreeMains
    .map((exercise) => resolveLowerUnilateralCoachFamily(exercise))
    .filter((family) => family !== "other");
  if (!hasDayThreeSquat || !hasDayThreeHinge || dayThreeUnilateralFamilies.length === 0) {
    failures.push(
      `Day 3 lacks required lower coverage: squat=${hasDayThreeSquat}, hinge=${hasDayThreeHinge}, unilateral=${dayThreeUnilateralFamilies.join(",") || "none"}`
    );
  }

  const mislabeledCoreAccessories = dayThreeAccessories
    .filter((item) => item.selectionDebug?.slotLane === "core")
    .map(getExercise)
    .filter((exercise): exercise is Exercise => Boolean(exercise))
    .filter((exercise) => !isCoreExercise(exercise));
  if (mislabeledCoreAccessories.length > 0) {
    failures.push(
      `core accessory slot contains non-core exercise: ${formatExerciseIds(mislabeledCoreAccessories)}`
    );
  }

  if (isLowerBackPainProfile(questionnaire)) {
    const lowerBackBackExtensionPrimaryHinges = dayThreeMainItems
      .filter((item) => item.selectionDebug?.slotKind === "mainHingePrimary")
      .map(getExercise)
      .filter((exercise): exercise is Exercise => Boolean(exercise))
      .filter(isBackExtensionHingeFamily);
    if (lowerBackBackExtensionPrimaryHinges.length > 0) {
      failures.push(
        `lower-back pain primary hinge uses back extension: ${formatExerciseIds(
          lowerBackBackExtensionPrimaryHinges
        )}`
      );
    }
  }

  const ineligibleExercises = allProgramExercises(program).filter(
    (exercise) => !isExerciseEligible(exercise, available)
  );
  if (ineligibleExercises.length > 0) {
    failures.push(
      `selected exercises violate equipment context: ${formatExerciseIds(ineligibleExercises)}`
    );
  }

  const fakeChestIsolationItems = allProgramItems(program)
    .filter(isChestIsolationSlot)
    .map(getExercise)
    .filter((exercise): exercise is Exercise => Boolean(exercise))
    .filter((exercise) => isRearDeltFamily(exercise) && !isBackChestTruthfulChestIsolation(exercise));
  if (fakeChestIsolationItems.length > 0) {
    failures.push(
      `rear-delt movement selected as chest isolation: ${formatExerciseIds(fakeChestIsolationItems)}`
    );
  }

  return {
    failures,
    unilateralFamilies: dayThreeUnilateralFamilies,
  };
};
