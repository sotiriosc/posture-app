/**
 * Deterministic pre-fallback contract repair for known structural quality
 * families. Prefer minimum slot surgery over blind seed retries.
 */

import { exerciseById } from "@/lib/exercises";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import { coalesceMixedHomeSessionWorkOrder } from "@/lib/program/mixedHomeProgramContract";
import { resolvePrimaryProgramEquipmentMode } from "@/lib/program/equipmentMode";
import type { Program, ProgramDay, ProgramRoutineItem, LogPrefs } from "@/lib/types";
import {
  evaluateProgramQuality,
  type EvaluateProgramQualityInput,
} from "@/lib/program/qualityGate/evaluateProgramQuality";

const TRUE_HINGE_ALTERNATIVES = [
  "dumbbell-sumo-rdl",
  "db-rdl",
  "band-rdl",
  "machine-glute-drive",
  "barbell-romanian-deadlift",
  "barbell-hip-thrust",
  "single-leg-hip-thrust",
  "single-leg-glute-bridge-hold",
  "dumbbell-sumo-rdl",
] as const;

const SQUAT_PRIMARY_ALTERNATIVES = [
  "goblet-squat",
  "heels-elevated-squat",
  "split-squat",
  "dumbbell-reverse-lunge",
  "dumbbell-bulgarian-split-squat",
  "dumbbell-step-up-loaded",
  "bodyweight-squat",
  "machine-leg-press",
] as const;

const blockedIdSet = (
  blocked?: EvaluateProgramQualityInput["blockedExerciseIds"]
): Set<string> => {
  if (!blocked) return new Set();
  if (blocked instanceof Set) return blocked;
  if (Array.isArray(blocked)) return new Set(blocked);
  return new Set(Object.keys(blocked));
};

const replaceItemExercise = (
  item: ProgramRoutineItem,
  exerciseId: string
): ProgramRoutineItem => {
  const exercise = exerciseById(exerciseId);
  if (!exercise) return item;
  return {
    ...item,
    exerciseId: exercise.id,
    loadType: exercise.loadType,
  };
};

const dayUsedIds = (day: ProgramDay, exceptIndex?: number) => {
  const used = new Set<string>();
  day.routine.forEach((item, index) => {
    if (index === exceptIndex) return;
    used.add(item.exerciseId);
  });
  return used;
};

const firstUnblockedAlternative = (
  preferred: readonly string[],
  blocked: Set<string>,
  used: Set<string>
) =>
  preferred.find((id) => {
    if (blocked.has(id) || used.has(id)) return false;
    return Boolean(exerciseById(id));
  }) ?? null;

const repairBlockedPresent = (
  program: Program,
  blocked: Set<string>
): Program => {
  if (!blocked.size) return program;
  return {
    ...program,
    week: program.week.map((day) => {
      let next = day;
      next.routine.forEach((item, itemIndex) => {
        if (!blocked.has(item.exerciseId)) return;
        const used = dayUsedIds(next, itemIndex);
        const title = next.title.toLowerCase();
        const prefersHinge =
          title.includes("hinge") ||
          item.selectionDebug?.slotLane === "hinge" ||
          (item.selectionDebug?.slotKind ?? "").toLowerCase().includes("hinge");
        const prefersSquat =
          title.includes("squat") ||
          item.selectionDebug?.slotLane === "squat" ||
          (item.selectionDebug?.slotKind ?? "").toLowerCase().includes("squat");
        const pool = prefersHinge
          ? TRUE_HINGE_ALTERNATIVES
          : prefersSquat
          ? SQUAT_PRIMARY_ALTERNATIVES
          : [...TRUE_HINGE_ALTERNATIVES, ...SQUAT_PRIMARY_ALTERNATIVES];
        const replacementId = firstUnblockedAlternative(pool, blocked, used);
        if (!replacementId) return;
        const routine = [...next.routine];
        routine[itemIndex] = replaceItemExercise(item, replacementId);
        next = { ...next, routine };
      });
      return next;
    }),
  };
};

const repairPrepAsMain = (
  program: Program,
  blocked: Set<string>,
  hardCodes: string[]
): Program => {
  if (!hardCodes.includes("DUMBBELL_PREP_AS_MAIN")) return program;
  return {
    ...program,
    week: program.week.map((day) => {
      let next = day;
      next.routine.forEach((item, itemIndex) => {
        if (item.section !== "main") return;
        const exercise = exerciseById(item.exerciseId);
        if (!exercise) return;
        const isLegalSquatAlt =
          exercise.id === "bodyweight-squat" ||
          exercise.id === "heels-elevated-squat" ||
          exercise.id === "split-squat";
        const looksPrep =
          !isLegalSquatAlt &&
          (Boolean(exercise.supportOnly) ||
            Boolean(exercise.regressionOnly) ||
            exercise.category === "warmup" ||
            exercise.category === "activation" ||
            exercise.category === "cooldown");
        if (!looksPrep) return;
        const used = dayUsedIds(next, itemIndex);
        const slot = (item.selectionDebug?.slotKind ?? "").toLowerCase();
        const pool =
          slot.includes("hinge") || item.selectionDebug?.slotLane === "hinge"
            ? TRUE_HINGE_ALTERNATIVES
            : SQUAT_PRIMARY_ALTERNATIVES;
        const replacementId = firstUnblockedAlternative(pool, blocked, used);
        if (!replacementId) return;
        const routine = [...next.routine];
        routine[itemIndex] = replaceItemExercise(item, replacementId);
        next = { ...next, routine };
      });
      return next;
    }),
  };
};

const repairGymWrongRoleTruth = (
  program: Program,
  blocked: Set<string>,
  hardCodes: string[]
): Program => {
  if (!hardCodes.includes("GYM_REQUIRED_ROLE_WRONG_TRUTH")) return program;
  return {
    ...program,
    week: program.week.map((day) => {
      if (!day.title.toLowerCase().includes("legs")) return day;
      const mains = day.routine
        .map((item, itemIndex) => ({ item, itemIndex }))
        .filter((entry) => entry.item.section === "main");
      // Gym Legs + Abs role plan: squat (0), hinge (1), unilateral (2).
      const hingeEntry = mains[1];
      if (!hingeEntry) return day;
      const exercise = exerciseById(hingeEntry.item.exerciseId);
      if (!exercise) return day;
      const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
      const isTrueHinge =
        !exercise.supportOnly &&
        !exercise.regressionOnly &&
        (exercise.movementPattern.some((p) => p.toLowerCase() === "hinge") ||
          descriptor.includes("rdl") ||
          descriptor.includes("deadlift") ||
          descriptor.includes("hip thrust") ||
          descriptor.includes("glute drive") ||
          descriptor.includes("glute bridge"));
      if (isTrueHinge) return day;
      const used = dayUsedIds(day, hingeEntry.itemIndex);
      const replacementId = firstUnblockedAlternative(
        TRUE_HINGE_ALTERNATIVES,
        blocked,
        used
      );
      if (!replacementId) return day;
      const routine = [...day.routine];
      routine[hingeEntry.itemIndex] = replaceItemExercise(
        hingeEntry.item,
        replacementId
      );
      return { ...day, routine };
    }),
  };
};

const repairMixedHomeEquipmentMix = (
  program: Program,
  hardCodes: string[]
): Program => {
  if (!hardCodes.includes("MIXED_HOME_RANDOM_EQUIPMENT_MIX")) return program;
  return {
    ...program,
    week: program.week.map((day) => coalesceMixedHomeSessionWorkOrder(day)),
  };
};

/**
 * One-shot deterministic repair for known contract families. Returns the
 * repaired program (may be unchanged) for re-evaluation by the caller.
 */
export const repairProgramQualityContracts = (params: {
  program: Program;
  questionnaire: QuestionnaireData;
  blockedExerciseIds?: EvaluateProgramQualityInput["blockedExerciseIds"] | LogPrefs["blockedExerciseIds"];
  hardFailureCodes: string[];
}): Program => {
  const blocked = blockedIdSet(params.blockedExerciseIds as EvaluateProgramQualityInput["blockedExerciseIds"]);
  const codes = params.hardFailureCodes;
  let next = params.program;

  if (codes.includes("QUALITY_BLOCKED_EXERCISE_PRESENT") || blocked.size > 0) {
    next = repairBlockedPresent(next, blocked);
  }
  next = repairPrepAsMain(next, blocked, codes);
  next = repairGymWrongRoleTruth(next, blocked, codes);

  const mode = resolvePrimaryProgramEquipmentMode(
    params.questionnaire.equipment ?? []
  );
  if (mode === "mixedHome") {
    next = repairMixedHomeEquipmentMix(next, codes);
  }

  return next;
};

export const tryDeterministicQualityRepair = (params: {
  program: Program;
  questionnaire: QuestionnaireData;
  persona: string;
  blockedExerciseIds?: EvaluateProgramQualityInput["blockedExerciseIds"];
}): {
  program: Program;
  evaluation: ReturnType<typeof evaluateProgramQuality>;
  repaired: boolean;
} => {
  const initial = evaluateProgramQuality({
    program: params.program,
    questionnaire: params.questionnaire,
    persona: params.persona,
    blockedExerciseIds: params.blockedExerciseIds,
  });
  if (initial.passed) {
    return { program: params.program, evaluation: initial, repaired: false };
  }
  const repairedProgram = repairProgramQualityContracts({
    program: params.program,
    questionnaire: params.questionnaire,
    blockedExerciseIds: params.blockedExerciseIds,
    hardFailureCodes: initial.hardFailures.map((f) => f.code),
  });
  if (repairedProgram === params.program) {
    return { program: params.program, evaluation: initial, repaired: false };
  }
  const evaluation = evaluateProgramQuality({
    program: repairedProgram,
    questionnaire: params.questionnaire,
    persona: `${params.persona}:deterministic-repair`,
    blockedExerciseIds: params.blockedExerciseIds,
  });
  return {
    program: repairedProgram,
    evaluation,
    repaired: true,
  };
};
