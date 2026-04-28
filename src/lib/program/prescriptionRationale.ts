import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import { exerciseById, type Exercise } from "@/lib/exercises";
import type {
  ExercisePrescription,
  ExerciseRationale,
  Program,
  ProgramDay,
  ProgramRoutineItem,
} from "@/lib/types";

type PrescriptionPhase = "control" | "capacity" | "strength";

const normalizeToken = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");

const normalizePainArea = (value: string) => normalizeToken(value).replace(/^lowback$/, "lowerback");

const resolvePrescriptionPhase = (phaseIndex: number): PrescriptionPhase => {
  if (phaseIndex >= 3) return "strength";
  if (phaseIndex === 2) return "capacity";
  return "control";
};

const resolveExperience = (experience: string) => {
  const normalized = normalizeToken(experience);
  if (normalized.includes("advanced")) return "advanced";
  if (normalized.includes("intermediate")) return "intermediate";
  return "beginner";
};

const parseSets = (sets: ProgramRoutineItem["sets"]) => {
  if (typeof sets === "number" && Number.isFinite(sets)) return Math.max(1, Math.round(sets));
  if (typeof sets !== "string") return undefined;
  const match = sets.match(/\d+/);
  return match ? Math.max(1, Number(match[0])) : undefined;
};

const hasAnyToken = (values: Array<string | undefined>, tokens: string[]) => {
  const normalizedTokens = new Set(tokens.map(normalizeToken));
  return values
    .filter((value): value is string => Boolean(value))
    .some((value) => normalizedTokens.has(normalizeToken(value)));
};

const collectExerciseTokens = (exercise: Exercise, item: ProgramRoutineItem) => [
  ...(exercise.movementPattern ?? []),
  ...(exercise.tags ?? []),
  ...(exercise.focusTags ?? []),
  ...(exercise.muscleGroups ?? []),
  ...(exercise.weeklyCoverageTags ?? []),
  ...(exercise.slotRoles ?? []),
  ...(exercise.accessoryRoles ?? []),
  item.selectionDebug?.slotKind,
  item.selectionDebug?.slotLane,
];

const isHingeLike = (exercise: Exercise, item: ProgramRoutineItem) =>
  hasAnyToken(collectExerciseTokens(exercise, item), [
    "hinge",
    "hingeprimary",
    "mainhinge",
    "mainhingeprimary",
    "mainhingesurrogate",
  ]);

const isSquatLike = (exercise: Exercise, item: ProgramRoutineItem) =>
  hasAnyToken(collectExerciseTokens(exercise, item), [
    "squat",
    "kneedominant",
    "squatprimary",
    "mainsquat",
    "mainSquatPrimary",
    "unilaterallower",
  ]);

const isPullLike = (exercise: Exercise, item: ProgramRoutineItem) =>
  hasAnyToken(collectExerciseTokens(exercise, item), [
    "pull",
    "horizontalpull",
    "verticalpull",
    "back",
    "pullhorizontal",
    "pullvertical",
    "mainpull",
  ]);

const isPushLike = (exercise: Exercise, item: ProgramRoutineItem) =>
  hasAnyToken(collectExerciseTokens(exercise, item), [
    "push",
    "horizontalpush",
    "verticalpush",
    "pushcompound",
    "chest",
    "mainpush",
  ]);

const isScapularOrPosture = (exercise: Exercise, item: ProgramRoutineItem, dayTitle: string) =>
  dayTitle.toLowerCase().includes("scapular") ||
  dayTitle.toLowerCase().includes("posture") ||
  hasAnyToken(collectExerciseTokens(exercise, item), [
    "scap",
    "scapular",
    "reardelt",
    "reardeltisolation",
    "shouldersupport",
    "upperback",
    "tspine",
  ]);

const isChestIsolation = (exercise: Exercise, item: ProgramRoutineItem) =>
  hasAnyToken(collectExerciseTokens(exercise, item), [
    "chestisolation",
    "mainchestisolation",
    "accessorychestisolation",
    "fly",
  ]);

const isCoreLike = (exercise: Exercise, item: ProgramRoutineItem) =>
  hasAnyToken(collectExerciseTokens(exercise, item), [
    "core",
    "corestability",
    "antirotation",
    "antiextension",
    "carry",
  ]);

const hasLowerBackPain = (painAreas: string[]) =>
  painAreas.map(normalizePainArea).some((area) => area === "lowerback" || area === "lowback");

const resolveTempo = (params: {
  phase: PrescriptionPhase;
  section: ProgramRoutineItem["section"];
  painAware: boolean;
  hingeLike: boolean;
}) => {
  if (params.section === "warmup" || params.section === "activation") {
    return "smooth and controlled";
  }
  if (params.section === "cooldown") return "easy breathing pace";
  if (params.painAware && params.hingeLike) return "3-1-2 controlled";
  if (params.phase === "control") return "3-1-2 controlled";
  if (params.phase === "capacity") return "2-0-2 steady";
  return "controlled 2-0-1";
};

const resolveRestSeconds = (params: {
  item: ProgramRoutineItem;
  phase: PrescriptionPhase;
  section: ProgramRoutineItem["section"];
  experience: "beginner" | "intermediate" | "advanced";
  painAware: boolean;
}) => {
  if (params.section === "cooldown") return undefined;
  if (typeof params.item.restSec === "number") return params.item.restSec;
  if (params.section === "warmup" || params.section === "activation") return 20;
  if (params.section === "accessory") return params.phase === "strength" ? 60 : 45;
  const base =
    params.phase === "strength"
      ? 90
      : params.phase === "capacity"
      ? 75
      : 60;
  const experienceBuffer = params.experience === "beginner" ? 15 : 0;
  const painBuffer = params.painAware ? 15 : 0;
  return base + experienceBuffer + painBuffer;
};

const resolveTargetRpe = (params: {
  phase: PrescriptionPhase;
  section: ProgramRoutineItem["section"];
  experience: "beginner" | "intermediate" | "advanced";
  painAware: boolean;
  lowerBackHinge: boolean;
}) => {
  if (
    params.section === "warmup" ||
    params.section === "activation" ||
    params.section === "cooldown"
  ) {
    return undefined;
  }
  const mainBase =
    params.phase === "strength" ? 8 : params.phase === "capacity" ? 7 : 6;
  const accessoryBase = Math.max(5, mainBase - 1);
  let rpe = params.section === "accessory" ? accessoryBase : mainBase;
  if (params.experience === "beginner") rpe -= 0.5;
  if (params.painAware) rpe -= 1;
  if (params.lowerBackHinge) rpe = Math.min(rpe, 6.5);
  return Math.max(4, Math.min(8, Math.round(rpe)));
};

const resolveReps = (item: ProgramRoutineItem, exercise: Exercise) => {
  if (item.reps) return item.reps;
  if (typeof item.durationSec === "number" && item.durationSec > 0) {
    return `${item.durationSec} seconds`;
  }
  return exercise.durationOrReps;
};

const buildPrescription = (params: {
  item: ProgramRoutineItem;
  exercise: Exercise;
  phase: PrescriptionPhase;
  experience: "beginner" | "intermediate" | "advanced";
  painAreas: string[];
}): ExercisePrescription => {
  const { item, exercise, phase, experience, painAreas } = params;
  const section = item.section;
  const lowerBackHinge = hasLowerBackPain(painAreas) && isHingeLike(exercise, item);
  const painAware = painAreas.length > 0;
  const prescription: ExercisePrescription = {
    sets:
      section === "cooldown"
        ? undefined
        : parseSets(item.sets) ?? (section === "warmup" || section === "activation" ? 1 : undefined),
    reps: resolveReps(item, exercise),
    tempo: resolveTempo({
      phase,
      section,
      painAware,
      hingeLike: isHingeLike(exercise, item),
    }),
    restSeconds: resolveRestSeconds({
      item,
      phase,
      section,
      experience,
      painAware,
    }),
    targetRPE: resolveTargetRpe({
      phase,
      section,
      experience,
      painAware,
      lowerBackHinge,
    }),
  };

  if (section === "main") {
    prescription.progressionRule =
      phase === "strength"
        ? "Add load or a small difficulty step only after all sets stay crisp at the target effort."
        : "Add reps first; progress the variation only when every set is smooth and repeatable.";
    prescription.regressionRule = lowerBackHinge
      ? "Shorten the range, slow the tempo, or switch to the easier hip-extension option."
      : "Reduce load, range, or variation difficulty if tempo or control breaks.";
  } else if (section === "accessory") {
    prescription.progressionRule =
      "Add reps before load, keeping the movement quiet and controlled.";
    prescription.regressionRule = "Use a smaller range or lighter variation if form gets noisy.";
  }

  prescription.stopRule = lowerBackHinge
    ? "Stop if lower-back pain increases, travels, or changes your brace."
    : painAware
    ? "Stop if symptoms increase or the movement stops feeling controlled."
    : "Stop if form breaks or discomfort changes sharply.";

  return Object.fromEntries(
    Object.entries(prescription).filter(([, value]) => value !== undefined)
  ) as ExercisePrescription;
};

const resolveVersionName = (id: string | undefined) => {
  if (!id) return undefined;
  return exerciseById(id)?.name;
};

const buildWhyThisExercise = (params: {
  exercise: Exercise;
  item: ProgramRoutineItem;
  dayTitle: string;
  phase: PrescriptionPhase;
  painAreas: string[];
}) => {
  const { exercise, item, dayTitle, painAreas } = params;
  const dayTitleLower = dayTitle.toLowerCase();
  const lowerBackHinge = hasLowerBackPain(painAreas) && isHingeLike(exercise, item);
  if (lowerBackHinge) {
    return "Chosen as a conservative hinge option for lower-back sensitivity while training the posterior chain.";
  }
  if (
    isScapularOrPosture(exercise, item, dayTitle) &&
    (!isPullLike(exercise, item) ||
      item.section !== "main" ||
      dayTitleLower.includes("scapular") ||
      dayTitleLower.includes("posture"))
  ) {
    return "Chosen to support scapular control and posture so the rest of the session stays cleaner.";
  }
  if (isChestIsolation(exercise, item) && item.section === "accessory") {
    return "Chosen to add chest work after the main pressing and pulling needs are covered.";
  }
  if (isPullLike(exercise, item)) {
    return "Chosen to balance pulling strength with your pressing work.";
  }
  if (isPushLike(exercise, item)) {
    return "Chosen to build pressing strength with a variation that fits your equipment and phase.";
  }
  if (isHingeLike(exercise, item)) {
    return "Chosen to train the hinge pattern and posterior chain with controllable effort.";
  }
  if (isSquatLike(exercise, item)) {
    return "Chosen to build lower-body strength and keep the squat pattern practiced.";
  }
  if (isCoreLike(exercise, item)) {
    return "Chosen to train trunk control so your positions stay steady under fatigue.";
  }
  if (item.section === "warmup" || item.section === "activation") {
    return "Included to prepare range, control, and coordination before the working sets.";
  }
  if (item.section === "cooldown") {
    return "Included to downshift breathing and restore comfortable range after the session.";
  }
  return `Chosen to fit the ${dayTitle} session with your current equipment and phase.`;
};

const buildMainCue = (exercise: Exercise, item: ProgramRoutineItem) => {
  if (exercise.cues?.[0]) return exercise.cues[0];
  if (isHingeLike(exercise, item)) return "Brace first, then move from the hips.";
  if (isPullLike(exercise, item)) return "Pull with the elbows and keep the neck relaxed.";
  if (isPushLike(exercise, item)) return "Control the lowering phase before pressing.";
  if (isCoreLike(exercise, item)) return "Breathe behind the brace without rushing.";
  return "Move with control and stop before form changes.";
};

const buildRationale = (params: {
  item: ProgramRoutineItem;
  exercise: Exercise;
  dayTitle: string;
  phase: PrescriptionPhase;
  painAreas: string[];
  prescription: ExercisePrescription;
}): ExerciseRationale => {
  const { item, exercise, dayTitle, phase, painAreas, prescription } = params;
  const harder =
    resolveVersionName(exercise.regressionOf) ??
    (exercise.swapOptions ?? [])
      .map((id) => exerciseById(id))
      .find((candidate) => candidate && (candidate.difficulty ?? 0) > (exercise.difficulty ?? 0))
      ?.name;
  const easier =
    resolveVersionName(exercise.progressionOf) ??
    (exercise.swapOptions ?? [])
      .map((id) => exerciseById(id))
      .find((candidate) => candidate && (candidate.difficulty ?? 99) < (exercise.difficulty ?? 99))
      ?.name;

  return {
    whyThisExercise: buildWhyThisExercise({
      exercise,
      item,
      dayTitle,
      phase,
      painAreas,
    }),
    mainCue: buildMainCue(exercise, item),
    commonMistake: exercise.mistakes?.[0] ?? "Rushing or chasing range after control drops.",
    easierVersion: easier,
    harderVersion: harder,
    stopIf: prescription.stopRule,
  };
};

export const attachRoutineItemCoachingMetadata = (params: {
  week: Program["week"];
  questionnaire: QuestionnaireData;
  phaseIndex: number;
}): Program["week"] => {
  const phase = resolvePrescriptionPhase(params.phaseIndex);
  const experience = resolveExperience(params.questionnaire.experience);
  const painAreas = params.questionnaire.painAreas ?? [];

  return params.week.map((day): ProgramDay => ({
    ...day,
    routine: day.routine.map((item) => {
      const exercise = exerciseById(item.exerciseId);
      if (!exercise) return item;
      const prescription = buildPrescription({
        item,
        exercise,
        phase,
        experience,
        painAreas,
      });
      return {
        ...item,
        prescription,
        rationale: buildRationale({
          item,
          exercise,
          dayTitle: day.title,
          phase,
          painAreas,
          prescription,
        }),
      };
    }),
  }));
};
