import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import { isExerciseEligible, normalizeEquipmentSelection, type Equipment } from "@/lib/equipment";
import { exerciseById, exercises, type Exercise } from "@/lib/exercises";
import { auditWeeklyCoverage } from "@/lib/program/coverageAudit";
import type { ProgramConstraintWarning } from "@/lib/program/programFinalization";
import {
  isBackChestPosteriorSupportFamily,
  isBackExtensionHingeFamily,
  resolveBackChestAccessoryCoachFamily,
  resolveCoreCoachFamily,
  resolveLowerUnilateralCoachFamily,
} from "@/lib/program/threeDayCoachPolicy";
import type { Program, ProgramDay, ProgramRoutineItem } from "@/lib/types";
import { expectedMainCountForDayTitle } from "./expectedCounts";

export type HigherFrequencyReviewPersona = {
  name: string;
  questionnaire: QuestionnaireData;
};

type BuildPersonaParams = {
  daysPerWeek: 4 | 5;
  experience: QuestionnaireData["experience"];
  equipment: QuestionnaireData["equipment"];
  lowerBackPain?: boolean;
};

export const buildHigherFrequencyPersonaQuestionnaire = ({
  daysPerWeek,
  experience,
  equipment,
  lowerBackPain = false,
}: BuildPersonaParams): QuestionnaireData => ({
  goals: lowerBackPain ? "Reduce pain" : "General fitness",
  painAreas: lowerBackPain ? ["lower back"] : [],
  experience,
  equipment,
  daysPerWeek,
});

const persona = (
  name: string,
  params: BuildPersonaParams
): HigherFrequencyReviewPersona => ({
  name,
  questionnaire: buildHigherFrequencyPersonaQuestionnaire(params),
});

export const higherFrequencyReviewPersonas: HigherFrequencyReviewPersona[] = [
  persona("Beginner / 4 days / gym / no pain", {
    daysPerWeek: 4,
    experience: "Beginner",
    equipment: ["gym"],
  }),
  persona("Intermediate / 4 days / gym / no pain", {
    daysPerWeek: 4,
    experience: "Intermediate",
    equipment: ["gym"],
  }),
  persona("Advanced / 4 days / gym / no pain", {
    daysPerWeek: 4,
    experience: "Advanced",
    equipment: ["gym"],
  }),
  persona("Beginner / 4 days / gym / lower back pain", {
    daysPerWeek: 4,
    experience: "Beginner",
    equipment: ["gym"],
    lowerBackPain: true,
  }),
  persona("Intermediate / 4 days / dumbbells / no pain", {
    daysPerWeek: 4,
    experience: "Intermediate",
    equipment: ["dumbbells"],
  }),
  persona("Beginner / 4 days / dumbbells / lower back pain", {
    daysPerWeek: 4,
    experience: "Beginner",
    equipment: ["dumbbells"],
    lowerBackPain: true,
  }),
  persona("Intermediate / 4 days / bands / no pain", {
    daysPerWeek: 4,
    experience: "Intermediate",
    equipment: ["bands"],
  }),
  persona("Beginner / 4 days / none / no pain", {
    daysPerWeek: 4,
    experience: "Beginner",
    equipment: ["none"],
  }),
  persona("Beginner / 4 days / none / lower back pain", {
    daysPerWeek: 4,
    experience: "Beginner",
    equipment: ["none"],
    lowerBackPain: true,
  }),
  persona("Beginner / 5 days / gym / no pain", {
    daysPerWeek: 5,
    experience: "Beginner",
    equipment: ["gym"],
  }),
  persona("Intermediate / 5 days / gym / no pain", {
    daysPerWeek: 5,
    experience: "Intermediate",
    equipment: ["gym"],
  }),
  persona("Advanced / 5 days / gym / no pain", {
    daysPerWeek: 5,
    experience: "Advanced",
    equipment: ["gym"],
  }),
  persona("Beginner / 5 days / gym / lower back pain", {
    daysPerWeek: 5,
    experience: "Beginner",
    equipment: ["gym"],
    lowerBackPain: true,
  }),
  persona("Intermediate / 5 days / dumbbells / no pain", {
    daysPerWeek: 5,
    experience: "Intermediate",
    equipment: ["dumbbells"],
  }),
  persona("Beginner / 5 days / dumbbells / lower back pain", {
    daysPerWeek: 5,
    experience: "Beginner",
    equipment: ["dumbbells"],
    lowerBackPain: true,
  }),
  persona("Intermediate / 5 days / bands / no pain", {
    daysPerWeek: 5,
    experience: "Intermediate",
    equipment: ["bands"],
  }),
  persona("Beginner / 5 days / none / no pain", {
    daysPerWeek: 5,
    experience: "Beginner",
    equipment: ["none"],
  }),
  persona("Beginner / 5 days / none / lower back pain", {
    daysPerWeek: 5,
    experience: "Beginner",
    equipment: ["none"],
    lowerBackPain: true,
  }),
];

export const higherFrequencyReviewPhaseIndexes = [1, 2, 3] as const;

type DayIdentity =
  | "upperPush"
  | "upperPull"
  | "lowerSquat"
  | "lowerHinge"
  | "armsPosture"
  | "unknown";

type MainLane = "push" | "verticalPush" | "pull" | "squat" | "hinge";

type EvaluationInput = {
  program: Program;
  questionnaire: QuestionnaireData;
  phaseIndex: 1 | 2 | 3;
  warnings: ProgramConstraintWarning[];
};

export type HigherFrequencyQualityEvaluation = {
  failures: string[];
  reviewFindings: string[];
};

const normalizeToken = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");

const phaseForAudit = (phaseIndex: 1 | 2 | 3) => {
  if (phaseIndex === 1) return "activation" as const;
  if (phaseIndex === 2) return "skill" as const;
  return "growth" as const;
};

const experienceForAudit = (experience: QuestionnaireData["experience"]) => {
  if (experience === "Advanced") return "advanced" as const;
  if (experience === "Intermediate") return "intermediate" as const;
  return "beginner" as const;
};

const descriptorFor = (exercise: Exercise) =>
  `${exercise.id} ${exercise.name} ${exercise.familyKey ?? ""} ${
    exercise.variantKey ?? ""
  }`.toLowerCase();

const hasPattern = (exercise: Exercise, pattern: string) =>
  exercise.movementPattern.some((entry) => normalizeToken(entry) === normalizeToken(pattern));

const hasTag = (exercise: Exercise, tag: string) =>
  (exercise.tags ?? []).some((entry) => normalizeToken(entry) === normalizeToken(tag));

const getExercise = (item: ProgramRoutineItem) => exerciseById(item.exerciseId);

export const collectRoutineItems = (
  day: ProgramDay,
  section: NonNullable<ProgramRoutineItem["section"]>
) => day.routine.filter((item) => item.section === section);

export const collectRoutineExercises = (
  day: ProgramDay,
  section: NonNullable<ProgramRoutineItem["section"]>
) =>
  collectRoutineItems(day, section)
    .map(getExercise)
    .filter((exercise): exercise is Exercise => Boolean(exercise));

export const collectFinalWarnings = (
  warnings: ProgramConstraintWarning[],
  programId: string
) => warnings.filter((warning) => warning.programId === programId);

export const classifyDayIdentity = (dayTitle: string): DayIdentity => {
  const normalized = dayTitle.toLowerCase();
  if (normalized.includes("arms") || normalized.includes("conditioning")) return "armsPosture";
  if (normalized.includes("upper") && normalized.includes("push")) return "upperPush";
  if (normalized.includes("upper") && normalized.includes("pull")) return "upperPull";
  if (normalized.includes("lower") && normalized.includes("hinge")) return "lowerHinge";
  if (normalized.includes("lower") && normalized.includes("squat")) return "lowerSquat";
  return "unknown";
};

const isPushExercise = (exercise: Exercise) => {
  const descriptor = descriptorFor(exercise);
  return (
    hasPattern(exercise, "push") ||
    hasPattern(exercise, "horizontalPush") ||
    hasPattern(exercise, "verticalPush") ||
    descriptor.includes("press") ||
    descriptor.includes("push-up") ||
    descriptor.includes("pushup") ||
    descriptor.includes("fly") ||
    descriptor.includes("lateral raise")
  );
};

const isPullExercise = (exercise: Exercise) => {
  const descriptor = descriptorFor(exercise);
  return (
    hasPattern(exercise, "pull") ||
    hasPattern(exercise, "horizontalPull") ||
    hasPattern(exercise, "verticalPull") ||
    hasPattern(exercise, "externalRotation") ||
    hasPattern(exercise, "scapular") ||
    descriptor.includes("row") ||
    descriptor.includes("pull") ||
    descriptor.includes("lat") ||
    descriptor.includes("rear delt") ||
    descriptor.includes("reverse pec deck") ||
    descriptor.includes("external rotation") ||
    descriptor.includes("snow angel") ||
    descriptor.includes("swimmer")
  );
};

const isSquatExercise = (exercise: Exercise) => {
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

const isHingeExercise = (exercise: Exercise) => {
  const descriptor = descriptorFor(exercise);
  return (
    hasPattern(exercise, "hinge") ||
    hasTag(exercise, "posteriorChain") ||
    descriptor.includes("rdl") ||
    descriptor.includes("romanian deadlift") ||
    descriptor.includes("hip thrust") ||
    descriptor.includes("glute bridge") ||
    descriptor.includes("hamstring curl") ||
    descriptor.includes("good morning") ||
    descriptor.includes("back extension")
  );
};

const isCoreExercise = (exercise: Exercise) => {
  const family = resolveCoreCoachFamily(exercise);
  const descriptor = descriptorFor(exercise);
  return (
    family !== "other" ||
    hasPattern(exercise, "core") ||
    hasPattern(exercise, "antiRotation") ||
    hasPattern(exercise, "antiExtension") ||
    hasTag(exercise, "core") ||
    descriptor.includes("plank") ||
    descriptor.includes("pallof") ||
    descriptor.includes("dead bug") ||
    descriptor.includes("bird dog") ||
    descriptor.includes("hollow") ||
    descriptor.includes("brace") ||
    descriptor.includes("woodchop") ||
    descriptor.includes("carry") ||
    descriptor.includes("suitcase") ||
    descriptor.includes("farmer") ||
    descriptor.includes("march")
  );
};

const isUnilateralLowerExercise = (exercise: Exercise) => {
  const family = resolveLowerUnilateralCoachFamily(exercise);
  const descriptor = descriptorFor(exercise);
  return (
    family !== "other" ||
    ((isSquatExercise(exercise) || isHingeExercise(exercise)) &&
      (descriptor.includes("single-leg") ||
        descriptor.includes("single leg") ||
        descriptor.includes("split squat") ||
        descriptor.includes("bulgarian") ||
        descriptor.includes("lunge") ||
        descriptor.includes("step-up") ||
        descriptor.includes("step up") ||
        descriptor.includes("cossack")))
  );
};

const isCalfRaise = (exercise: Exercise) => descriptorFor(exercise).includes("calf raise");

const isStructuralShoulderDrill = (exercise: Exercise) => {
  const descriptor = descriptorFor(exercise);
  return [
    "face pull",
    "external rotation",
    "pull-apart",
    "pull apart",
    "snow angel",
    "swimmer",
    "wall slide",
    "wall angel",
    "y raise",
    "t raise",
    "ytw",
    "scapular push",
    "scapular-push",
  ].some((token) => descriptor.includes(token));
};

const isCorrectiveOrSupport = (exercise: Exercise) => {
  const descriptor = descriptorFor(exercise);
  const family = resolveBackChestAccessoryCoachFamily(exercise);
  return (
    Boolean(exercise.supportOnly) ||
    isStructuralShoulderDrill(exercise) ||
    isBackChestPosteriorSupportFamily(family) ||
    [
      "lat sweep",
      "isometric",
      "iso hold",
      "hold",
      "dead bug",
      "bird dog",
      "plank",
      "brace",
    ].some((token) => descriptor.includes(token))
  );
};

const isLoadedExercise = (exercise: Exercise) =>
  exercise.loadType === "weighted" || exercise.loadType === "assisted";

const laneForExercise = (exercise: Exercise): MainLane | null => {
  if (hasPattern(exercise, "verticalPush")) return "verticalPush";
  if (isPushExercise(exercise) && !isPullExercise(exercise)) return "push";
  if (isPullExercise(exercise) && !isPushExercise(exercise)) return "pull";
  if (isSquatExercise(exercise)) return "squat";
  if (isHingeExercise(exercise)) return "hinge";
  return null;
};

const matchesLane = (exercise: Exercise, lane: MainLane) => {
  if (lane === "verticalPush") return hasPattern(exercise, "verticalPush");
  if (lane === "push") return isPushExercise(exercise) && !isPullExercise(exercise);
  if (lane === "pull") return isPullExercise(exercise);
  if (lane === "squat") return isSquatExercise(exercise);
  return isHingeExercise(exercise);
};

const hasLoadedCandidateForLane = (available: Set<Equipment>, lane: MainLane) =>
  exercises.some(
    (exercise) =>
      exercise.category === "main" &&
      isLoadedExercise(exercise) &&
      !exercise.supportOnly &&
      isExerciseEligible(exercise, available) &&
      matchesLane(exercise, lane)
  );

const hasSaferHingeAlternative = (available: Set<Equipment>, selectedIds: Set<string>) =>
  exercises.some((exercise) => {
    if (selectedIds.has(exercise.id)) return false;
    if (!isExerciseEligible(exercise, available)) return false;
    if (!isHingeExercise(exercise)) return false;
    return (
      !isBackExtensionHingeFamily(exercise) &&
      !["bodyweight-good-morning", "back-extension", "back-extension-hold"].includes(exercise.id)
    );
  });

const hasLoadedAccessoryAlternative = (
  available: Set<Equipment>,
  selectedIds: Set<string>,
  identity: DayIdentity
) => {
  const lanes: MainLane[] =
    identity === "upperPush"
      ? ["push", "verticalPush"]
      : identity === "upperPull" || identity === "armsPosture"
      ? ["pull"]
      : identity === "lowerSquat"
      ? ["squat"]
      : identity === "lowerHinge"
      ? ["hinge"]
      : [];

  if (!lanes.length) return false;

  return exercises.some((exercise) => {
    if (selectedIds.has(exercise.id)) return false;
    if (!isExerciseEligible(exercise, available)) return false;
    if (!isLoadedExercise(exercise) || isCorrectiveOrSupport(exercise)) return false;
    return lanes.some((lane) => matchesLane(exercise, lane));
  });
};

const formatIds = (exercisesToFormat: Exercise[]) =>
  exercisesToFormat.map((exercise) => exercise.id).join(", ");

const allProgramItems = (program: Program) => program.week.flatMap((day) => day.routine);

const allProgramExercises = (program: Program) =>
  allProgramItems(program)
    .map(getExercise)
    .filter((exercise): exercise is Exercise => Boolean(exercise));

const lowerBackPainProfile = (questionnaire: QuestionnaireData) =>
  questionnaire.painAreas.some((area) => area.toLowerCase().includes("lower back"));

const assertSlotLaneTruth = (
  day: ProgramDay,
  item: ProgramRoutineItem,
  exercise: Exercise,
  failures: string[]
) => {
  const slotLane = item.selectionDebug?.slotLane;

  if (slotLane === "pull" && isPushExercise(exercise) && !isPullExercise(exercise)) {
    failures.push(`${day.title}: push exercise in pull slot (${exercise.id})`);
  }
  if (
    (slotLane === "push" || slotLane === "verticalPush") &&
    isPullExercise(exercise) &&
    !isPushExercise(exercise)
  ) {
    failures.push(`${day.title}: pull exercise in push slot (${exercise.id})`);
  }
};

export const evaluateHigherFrequencyPersonaQuality = ({
  program,
  questionnaire,
  phaseIndex,
  warnings,
}: EvaluationInput): HigherFrequencyQualityEvaluation => {
  const failures: string[] = [];
  const reviewFindings: string[] = [];
  const available = normalizeEquipmentSelection(questionnaire.equipment).available;
  const selectedIds = new Set(allProgramItems(program).map((item) => item.exerciseId));
  const blockingWarnings = warnings.filter((warning) =>
    ["violation", "missing", "coverage"].includes(warning.kind)
  );

  if (blockingWarnings.length > 0) {
    reviewFindings.push(
      `final warning buffer contains blocking warnings: ${blockingWarnings
        .map((warning) => `${warning.kind}:${warning.dayTitle}:${warning.message}`)
        .join("; ")}`
    );
  }

  program.week.forEach((day) => {
    const mains = collectRoutineItems(day, "main");
    const expectedMainCount = expectedMainCountForDayTitle({
      daysPerWeek: questionnaire.daysPerWeek,
      dayTitle: day.title,
      experience: questionnaire.experience,
    });
    if (mains.length !== expectedMainCount) {
      reviewFindings.push(
        `${day.title}: expected ${expectedMainCount} mains, received ${mains.length}`
      );
    }

    const seenDayIds = new Set<string>();
    day.routine.forEach((item) => {
      if (seenDayIds.has(item.exerciseId)) {
        failures.push(`${day.title}: duplicate exercise appears in same day (${item.exerciseId})`);
      }
      seenDayIds.add(item.exerciseId);
    });

    mains.forEach((item) => {
      const exercise = getExercise(item);
      if (!exercise) return;

      assertSlotLaneTruth(day, item, exercise, failures);

      if (item.selectionDebug?.slotKind === "mainFinal" && laneForExercise(exercise)) {
        failures.push(`${day.title}: generic mainFinal leaked for ${exercise.id}`);
      }

      if (isCalfRaise(exercise)) {
        failures.push(`${day.title}: calf raise selected as main (${exercise.id})`);
      }

      const slotLane = item.selectionDebug?.slotLane as MainLane | undefined;
      if (
        slotLane &&
        ["push", "verticalPush"].includes(slotLane) &&
        isStructuralShoulderDrill(exercise) &&
        hasLoadedCandidateForLane(available, slotLane)
      ) {
        failures.push(
          `${day.title}: structural shoulder drill used as loaded shoulder main (${exercise.id})`
        );
      }

      if (
        lowerBackPainProfile(questionnaire) &&
        slotLane === "hinge" &&
        isBackExtensionHingeFamily(exercise) &&
        hasSaferHingeAlternative(available, selectedIds)
      ) {
        failures.push(
          `${day.title}: lower-back pain hinge defaults to back-extension family (${exercise.id})`
        );
      }
    });

    const accessories = collectRoutineExercises(day, "accessory");
    const strengthOrHypertrophyPhase = phaseIndex === 2 || phaseIndex === 3;
    const painAware = questionnaire.goals.toLowerCase().includes("pain") || questionnaire.painAreas.length > 0;
    if (
      strengthOrHypertrophyPhase &&
      !painAware &&
      accessories.length > 1 &&
      accessories.every(isCorrectiveOrSupport) &&
      hasLoadedAccessoryAlternative(available, selectedIds, classifyDayIdentity(day.title))
    ) {
      reviewFindings.push(
        `${day.title}: accessories are all corrective/support despite loaded alternatives (${formatIds(
          accessories
        )})`
      );
    }
  });

  const ineligibleExercises = allProgramExercises(program).filter(
    (exercise) => !isExerciseEligible(exercise, available)
  );
  if (ineligibleExercises.length > 0) {
    failures.push(
      `selected exercises violate equipment context: ${formatIds(ineligibleExercises)}`
    );
  }

  const weeklyCoverage = auditWeeklyCoverage(program.week, {
    daysPerWeek: questionnaire.daysPerWeek,
    phase: phaseForAudit(phaseIndex),
    experience: experienceForAudit(questionnaire.experience),
  });
  const missingMovementCoverage = ["push", "pull", "squat", "hinge", "core"].filter(
    (pattern) => !weeklyCoverage.movementPatternsHit.includes(pattern as never)
  );
  if (missingMovementCoverage.length > 0) {
    reviewFindings.push(`weekly coverage missing movement(s): ${missingMovementCoverage.join(", ")}`);
  }

  const hasUnilateralLower = allProgramExercises(program).some(isUnilateralLowerExercise);
  if (!hasUnilateralLower) {
    reviewFindings.push("weekly coverage missing unilateral lower exposure");
  }

  const hasCore = allProgramExercises(program).some(isCoreExercise);
  if (!hasCore) {
    reviewFindings.push("weekly coverage missing truthful core exposure");
  }

  return { failures, reviewFindings };
};
