import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import { isExerciseEligible, normalizeEquipmentSelection } from "@/lib/equipment";
import { exerciseById, type Exercise } from "@/lib/exercises";
import type { ProgramConstraintWarning } from "@/lib/program/programFinalization";
import type { Program, ProgramDay, ProgramRoutineItem } from "@/lib/types";

export type PhaseProgressionPersona = {
  name: string;
  questionnaire: QuestionnaireData;
};

export type PhaseProgramForQuality = {
  phaseIndex: 1 | 2 | 3;
  program: Program;
  warnings: ProgramConstraintWarning[];
};

export const phaseProgressionPersonas: PhaseProgressionPersona[] = [
  {
    name: "3-day beginner gym no pain",
    questionnaire: {
      goals: "General fitness",
      painAreas: [],
      experience: "Beginner",
      equipment: ["gym"],
      daysPerWeek: 3,
    },
  },
  {
    name: "3-day beginner gym lower-back pain",
    questionnaire: {
      goals: "Reduce pain",
      painAreas: ["lower back"],
      experience: "Beginner",
      equipment: ["gym"],
      daysPerWeek: 3,
    },
  },
  {
    name: "4-day intermediate gym no pain",
    questionnaire: {
      goals: "General fitness",
      painAreas: [],
      experience: "Intermediate",
      equipment: ["gym"],
      daysPerWeek: 4,
    },
  },
  {
    name: "4-day beginner dumbbells lower-back pain",
    questionnaire: {
      goals: "Reduce pain",
      painAreas: ["lower back"],
      experience: "Beginner",
      equipment: ["dumbbells"],
      daysPerWeek: 4,
    },
  },
  {
    name: "5-day intermediate gym no pain",
    questionnaire: {
      goals: "General fitness",
      painAreas: [],
      experience: "Intermediate",
      equipment: ["gym"],
      daysPerWeek: 5,
    },
  },
  {
    name: "5-day beginner bands lower-back pain",
    questionnaire: {
      goals: "Reduce pain",
      painAreas: ["lower back"],
      experience: "Beginner",
      equipment: ["bands"],
      daysPerWeek: 5,
    },
  },
];

const normalizeToken = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");

const descriptorFor = (exercise: Exercise) =>
  `${exercise.id} ${exercise.name} ${exercise.familyKey ?? ""} ${
    exercise.variantKey ?? ""
  } ${(exercise.tags ?? []).join(" ")}`.toLowerCase();

const hasPattern = (exercise: Exercise, pattern: string) =>
  exercise.movementPattern.some((entry) => normalizeToken(entry) === normalizeToken(pattern));

const hasTag = (exercise: Exercise, tag: string) =>
  (exercise.tags ?? []).some((entry) => normalizeToken(entry) === normalizeToken(tag));

const sectionItems = (day: ProgramDay, section: ProgramRoutineItem["section"]) =>
  day.routine.filter((item) => item.section === section);

const routineExercises = (program: Program) =>
  program.week.flatMap((day) =>
    day.routine.map((item) => ({
      day,
      item,
      exercise: exerciseById(item.exerciseId),
    }))
  );

const mainExercises = (program: Program) =>
  routineExercises(program).filter((entry) => entry.item.section === "main");

const classifyDayIdentity = (dayTitle: string) => {
  const title = dayTitle.toLowerCase();
  if (title.includes("arms") || title.includes("conditioning")) return "armsPosture";
  if (title.includes("upper") && title.includes("push")) return "upperPush";
  if (title.includes("upper") && title.includes("pull")) return "upperPull";
  if (title.includes("lower") && title.includes("hinge")) return "lowerHinge";
  if (title.includes("lower") && title.includes("squat")) return "lowerSquat";
  return normalizeToken(dayTitle);
};

const identitySignature = (program: Program) =>
  program.week.map((day) => classifyDayIdentity(day.title)).join(">");

const mainCountSignature = (program: Program) =>
  program.week.map((day) => sectionItems(day, "main").length).join(">");

const isPush = (exercise: Exercise, item?: ProgramRoutineItem) => {
  const descriptor = descriptorFor(exercise);
  return (
    item?.selectionDebug?.slotLane === "push" ||
    item?.selectionDebug?.slotLane === "verticalPush" ||
    hasPattern(exercise, "push") ||
    hasPattern(exercise, "horizontalPush") ||
    hasPattern(exercise, "verticalPush") ||
    descriptor.includes("press") ||
    descriptor.includes("pushup") ||
    descriptor.includes("push-up")
  );
};

const isPull = (exercise: Exercise, item?: ProgramRoutineItem) => {
  const descriptor = descriptorFor(exercise);
  return (
    item?.selectionDebug?.slotLane === "pull" ||
    hasPattern(exercise, "pull") ||
    hasPattern(exercise, "horizontalPull") ||
    hasPattern(exercise, "verticalPull") ||
    descriptor.includes("row") ||
    descriptor.includes("pulldown") ||
    descriptor.includes("pull") ||
    descriptor.includes("lat") ||
    descriptor.includes("rear delt") ||
    descriptor.includes("back widow")
  );
};

const isSquat = (exercise: Exercise, item?: ProgramRoutineItem) => {
  const descriptor = descriptorFor(exercise);
  return (
    item?.selectionDebug?.slotLane === "squat" ||
    hasPattern(exercise, "squat") ||
    hasPattern(exercise, "lunge") ||
    descriptor.includes("squat") ||
    descriptor.includes("lunge") ||
    descriptor.includes("step-up") ||
    descriptor.includes("step up")
  );
};

const isHinge = (exercise: Exercise, item?: ProgramRoutineItem) => {
  const descriptor = descriptorFor(exercise);
  return (
    item?.selectionDebug?.slotLane === "hinge" ||
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

const isCore = (exercise: Exercise) => {
  const descriptor = descriptorFor(exercise);
  return (
    hasPattern(exercise, "core") ||
    hasPattern(exercise, "antiRotation") ||
    hasPattern(exercise, "antiExtension") ||
    hasTag(exercise, "core") ||
    descriptor.includes("plank") ||
    descriptor.includes("pallof") ||
    descriptor.includes("dead bug") ||
    descriptor.includes("hollow") ||
    descriptor.includes("brace") ||
    descriptor.includes("woodchop") ||
    descriptor.includes("carry") ||
    descriptor.includes("suitcase") ||
    descriptor.includes("march")
  );
};

const isUnilateralLower = (exercise: Exercise) => {
  const descriptor = descriptorFor(exercise);
  return (
    (isSquat(exercise) || isHinge(exercise)) &&
    (hasPattern(exercise, "single-leg") ||
      descriptor.includes("single-leg") ||
      descriptor.includes("split squat") ||
      descriptor.includes("reverse lunge") ||
      descriptor.includes("bulgarian") ||
      descriptor.includes("step-up") ||
      descriptor.includes("cossack") ||
      descriptor.includes("shrimp"))
  );
};

const coverageForProgram = (program: Program) => {
  const coverage = new Set<string>();
  routineExercises(program).forEach(({ exercise, item }) => {
    if (!exercise) return;
    if (isPush(exercise, item)) coverage.add("push");
    if (isPull(exercise, item)) coverage.add("pull");
    if (isSquat(exercise, item)) coverage.add("squat");
    if (isHinge(exercise, item)) coverage.add("hinge");
    if (isCore(exercise)) coverage.add("core");
    if (isUnilateralLower(exercise)) coverage.add("unilateralLower");
  });
  return coverage;
};

const demandForExercise = (exercise: Exercise, item: ProgramRoutineItem) => {
  const loadScore =
    exercise.loadType === "weighted"
      ? 3
      : exercise.loadType === "assisted"
        ? 2
        : exercise.loadType === "bodyweight"
          ? 1
          : 0.75;
  const difficultyScore =
    exercise.difficultyTier === "hard"
      ? 2
      : exercise.difficultyTier === "moderate"
        ? 1
        : exercise.difficulty
          ? Math.max(0, exercise.difficulty - 2) * 0.35
          : 0;
  const phaseScore =
    exercise.phaseMin === "growth" ? 1.25 : exercise.phaseMin === "skill" ? 0.5 : 0;
  const roleScore = exercise.loadedMainEligible ? 0.75 : 0;
  const sectionMultiplier = item.section === "main" ? 1 : 0.35;
  return (loadScore + difficultyScore + phaseScore + roleScore) * sectionMultiplier;
};

const demandScore = (program: Program) =>
  routineExercises(program).reduce((score, entry) => {
    if (!entry.exercise) return score;
    return score + demandForExercise(entry.exercise, entry.item);
  }, 0);

const controlScore = (program: Program) =>
  routineExercises(program).reduce((score, entry) => {
    const exercise = entry.exercise;
    if (!exercise) return score;
    const descriptor = descriptorFor(exercise);
    const controlish =
      exercise.loadType === "timed" ||
      exercise.difficultyTier === "easy" ||
      descriptor.includes("control") ||
      descriptor.includes("stability") ||
      descriptor.includes("balance") ||
      descriptor.includes("tempo") ||
      descriptor.includes("hold") ||
      descriptor.includes("mobility");
    return score + (controlish ? 1 : 0);
  }, 0);

const exactPainMatch = (contraindication: string, painArea: string) => {
  const text = contraindication.toLowerCase();
  if (text.includes("acute")) return false;
  if (painArea === "lower back") {
    return text.includes("lower back");
  }
  return text.includes(painArea.toLowerCase());
};

const hasContraindicationForPain = (exercise: Exercise, painAreas: string[]) =>
  (exercise.painContraindications ?? []).some((entry) =>
    painAreas.some((painArea) => exactPainMatch(entry, painArea))
  );

const isBackExtensionFamily = (exercise: Exercise) => {
  const descriptor = descriptorFor(exercise);
  return (
    exercise.id === "back-extension" ||
    exercise.id === "back-extension-hold" ||
    descriptor.includes("back extension")
  );
};

const isGoodMorningFamily = (exercise: Exercise) => {
  const descriptor = descriptorFor(exercise);
  return exercise.id === "bodyweight-good-morning" || descriptor.includes("good morning");
};

const phaseLabel = (phaseIndex: 1 | 2 | 3) => `Phase ${phaseIndex}`;

export const evaluatePhaseProgressionCoherence = (params: {
  personaName: string;
  questionnaire: QuestionnaireData;
  phases: PhaseProgramForQuality[];
}) => {
  const failures: string[] = [];
  const phases = [...params.phases].sort((a, b) => a.phaseIndex - b.phaseIndex);
  const phase1 = phases.find((entry) => entry.phaseIndex === 1);
  const phase2 = phases.find((entry) => entry.phaseIndex === 2);
  const phase3 = phases.find((entry) => entry.phaseIndex === 3);
  if (!phase1 || !phase2 || !phase3) {
    return [`${params.personaName}: missing one or more phase programs`];
  }

  const { available } = normalizeEquipmentSelection(params.questionnaire.equipment);
  phases.forEach(({ phaseIndex, program, warnings }) => {
    if (warnings.length) {
      failures.push(
        `${phaseLabel(phaseIndex)} emitted final warnings: ${warnings
          .map((warning) => `${warning.kind}:${warning.dayTitle}:${warning.message}`)
          .join("; ")}`
      );
    }

    routineExercises(program).forEach(({ day, item, exercise }) => {
      if (!exercise) {
        failures.push(`${phaseLabel(phaseIndex)} ${day.title}: missing ${item.exerciseId}`);
        return;
      }
      if (!isExerciseEligible(exercise, available)) {
        failures.push(
          `${phaseLabel(phaseIndex)} ${day.title}: ${exercise.id} is not eligible for ${[
            ...available,
          ].join(",")}`
        );
      }
    });

    const coverage = coverageForProgram(program);
    ["push", "pull", "squat", "hinge", "core", "unilateralLower"].forEach((category) => {
      if (!coverage.has(category)) {
        failures.push(`${phaseLabel(phaseIndex)} is missing weekly ${category} coverage`);
      }
    });
  });

  const baseIdentity = identitySignature(phase1.program);
  const baseMainCounts = mainCountSignature(phase1.program);
  [phase2, phase3].forEach((phase) => {
    if (identitySignature(phase.program) !== baseIdentity) {
      failures.push(
        `${phaseLabel(phase.phaseIndex)} changed split identity from ${baseIdentity} to ${identitySignature(
          phase.program
        )}`
      );
    }
    if (mainCountSignature(phase.program) !== baseMainCounts) {
      failures.push(
        `${phaseLabel(phase.phaseIndex)} changed main-count identity from ${baseMainCounts} to ${mainCountSignature(
          phase.program
        )}`
      );
    }
  });

  const phase1CoverageSize = coverageForProgram(phase1.program).size;
  [phase2, phase3].forEach((phase) => {
    if (coverageForProgram(phase.program).size < phase1CoverageSize) {
      failures.push(
        `${phaseLabel(phase.phaseIndex)} coverage is narrower than Phase 1`
      );
    }
  });

  const phase1Demand = demandScore(phase1.program);
  const phase2Demand = demandScore(phase2.program);
  const phase3Demand = demandScore(phase3.program);
  if (phase2Demand + 0.01 < phase1Demand) {
    failures.push(
      `Phase 2 demand regressed below Phase 1 (${phase2Demand.toFixed(1)} < ${phase1Demand.toFixed(1)})`
    );
  }
  if (phase3Demand + 0.01 < phase1Demand) {
    failures.push(
      `Phase 3 demand regressed below Phase 1 (${phase3Demand.toFixed(1)} < ${phase1Demand.toFixed(1)})`
    );
  }

  const equipment = params.questionnaire.equipment ?? [];
  const painAreas = params.questionnaire.painAreas ?? [];
  const loadedGymProgressionContext =
    equipment.includes("gym") &&
    params.questionnaire.experience !== "Beginner" &&
    painAreas.length === 0;
  if (loadedGymProgressionContext && phase3Demand <= phase1Demand) {
    failures.push(
      `Phase 3 should increase loaded strength suitability in gym context (${phase3Demand.toFixed(
        1
      )} <= ${phase1Demand.toFixed(1)})`
    );
  }

  if (controlScore(phase1.program) === 0) {
    failures.push("Phase 1 has no visible control, stability, tempo, hold, or mobility exposure");
  }

  const lowerBackPain = painAreas.includes("lower back");
  if (lowerBackPain) {
    phases.forEach(({ phaseIndex, program }) => {
      mainExercises(program).forEach(({ day, item, exercise }) => {
        if (!exercise) return;
        const isHingeMain =
          item.selectionDebug?.slotLane === "hinge" || isHinge(exercise, item);
        if (isHingeMain && (isBackExtensionFamily(exercise) || isGoodMorningFamily(exercise))) {
          failures.push(
            `${phaseLabel(phaseIndex)} ${day.title}: ${exercise.id} is too risky as a lower-back pain hinge main`
          );
        }
      });
    });
  }

  mainExercises(phase3.program).forEach(({ day, exercise }) => {
    if (!exercise) return;
    if (hasContraindicationForPain(exercise, painAreas)) {
      failures.push(
        `Phase 3 ${day.title}: ${exercise.id} is contraindicated for ${painAreas.join(", ")}`
      );
    }
  });

  return failures;
};
