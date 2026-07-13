import { exerciseById } from "@/lib/exercises";
import type {
  NextSessionRecommendation,
  ProgramDay,
  ProgramRoutineItem,
  SessionPracticeOption,
} from "@/lib/types";

type PracticeMode = SessionPracticeOption["mode"];

const optionCopy: Record<
  PracticeMode,
  Pick<SessionPracticeOption, "label" | "description">
> = {
  full: {
    label: "Full Session",
    description: "Use the saved plan exactly as written for today.",
  },
  steady: {
    label: "Steady Session",
    description: "Keep the saved session intact and hold dose steady.",
  },
  reduced: {
    label: "Reduced Session",
    description: "Keep the key pattern work while trimming total exposure.",
  },
  simplified: {
    label: "Simplified Session",
    description: "Favor easier pattern practice and fewer main items.",
  },
  recovery: {
    label: "Recovery Session",
    description: "Use low-intensity mobility, activation, and cooldown work.",
  },
};

const recommendationModeToPracticeMode: Record<
  NextSessionRecommendation["mode"],
  PracticeMode
> = {
  normal: "full",
  repeat: "steady",
  reduce: "reduced",
  simplify: "simplified",
  recover: "recovery",
};

const sectionOf = (item: ProgramRoutineItem) => item.section ?? "main";

const isWarmupOrCorrective = (item: ProgramRoutineItem) => {
  const section = sectionOf(item);
  return section === "warmup" || section === "activation";
};

const isMain = (item: ProgramRoutineItem) => sectionOf(item) === "main";

const isCooldown = (item: ProgramRoutineItem) => sectionOf(item) === "cooldown";

const isCoreOrMobility = (item: ProgramRoutineItem) => {
  const exercise = exerciseById(item.exerciseId);
  const search = [
    item.notes,
    item.rationale?.whyThisExercise,
    exercise?.movementIntensity,
    exercise?.movementPattern.join(" "),
    exercise?.muscleGroups.join(" "),
    exercise?.tags.join(" "),
    exercise?.focusTags?.join(" "),
    exercise?.carryType,
  ]
    .filter((value): value is string => Boolean(value))
    .join(" ")
    .toLowerCase();

  return /\b(core|mobility|breath|spine|t-spine|hip|hips|scap|posture)\b/.test(
    search
  );
};

const isSimplerMain = (item: ProgramRoutineItem) => {
  if (!isMain(item)) return false;
  const exercise = exerciseById(item.exerciseId);
  if (item.loadType !== "weighted") return true;
  if (exercise?.movementIntensity === "pattern") return true;
  if (exercise?.difficulty !== undefined && exercise.difficulty <= 2) return true;
  if (exercise?.difficultyTier === "easy") return true;
  if (item.prescription?.targetRPE !== undefined && item.prescription.targetRPE <= 6) {
    return true;
  }
  return Boolean(item.prescription?.regressionRule);
};

const appendUnique = (
  target: ProgramRoutineItem[],
  items: ProgramRoutineItem[],
  seen: Set<ProgramRoutineItem>
) => {
  items.forEach((item) => {
    if (seen.has(item)) return;
    target.push(item);
    seen.add(item);
  });
};

export const selectSessionPracticeItems = (
  day: ProgramDay,
  mode: PracticeMode
): ProgramRoutineItem[] => {
  const routine = day.routine;
  if (mode === "full" || mode === "steady") return [...routine];

  const selected: ProgramRoutineItem[] = [];
  const seen = new Set<ProgramRoutineItem>();
  const warmupCorrective = routine.filter(isWarmupOrCorrective);
  const mainItems = routine.filter(isMain);
  const cooldownItems = routine.filter(isCooldown);
  const coreOrMobilitySupport = routine.filter(
    (item) =>
      !isMain(item) &&
      !isWarmupOrCorrective(item) &&
      !isCooldown(item) &&
      isCoreOrMobility(item)
  );

  appendUnique(selected, warmupCorrective, seen);

  if (mode === "reduced") {
    appendUnique(selected, mainItems.slice(0, 2), seen);
    appendUnique(
      selected,
      (cooldownItems.length ? cooldownItems : coreOrMobilitySupport).slice(0, 1),
      seen
    );
    return selected;
  }

  if (mode === "simplified") {
    const simplerMains = mainItems.filter(isSimplerMain);
    appendUnique(
      selected,
      (simplerMains.length ? simplerMains : mainItems).slice(0, 2),
      seen
    );
    appendUnique(selected, coreOrMobilitySupport.slice(0, 1), seen);
    appendUnique(selected, cooldownItems.slice(0, 1), seen);
    return selected;
  }

  appendUnique(
    selected,
    routine.filter(
      (item) =>
        !isMain(item) &&
        !isWarmupOrCorrective(item) &&
        (isCooldown(item) || isCoreOrMobility(item))
    ),
    seen
  );
  appendUnique(selected, cooldownItems, seen);
  return selected;
};

export const recommendedPracticeModeForRecommendation = (
  recommendation: NextSessionRecommendation | null | undefined
): PracticeMode => {
  if (!recommendation) return "full";
  return recommendationModeToPracticeMode[recommendation.mode];
};

export const deriveSessionPracticeOptions = (
  day: ProgramDay,
  recommendation?: NextSessionRecommendation | null
): SessionPracticeOption[] => {
  const recommendedMode = recommendedPracticeModeForRecommendation(recommendation);
  const modes: PracticeMode[] = [
    "full",
    "steady",
    "reduced",
    "simplified",
    "recovery",
  ];

  return modes
    .filter((mode) => {
      if (mode === "full") return true;
      return selectSessionPracticeItems(day, mode).length > 0;
    })
    .map((mode) => ({
      mode,
      ...optionCopy[mode],
      isRecommended: mode === recommendedMode,
      ...(recommendation
        ? { sourceRecommendationMode: recommendation.mode }
        : {}),
    }));
};

export const formatPracticeModeSessionNote = (
  option: SessionPracticeOption | null | undefined
) => {
  if (!option) return null;
  if (option.mode === "full") return "Using the full saved session.";
  if (option.mode === "steady") return "Holding today's session steady.";
  if (option.mode === "reduced") return "Using a reduced session view today.";
  if (option.mode === "simplified") return "Using a simplified session view today.";
  return "Using a recovery-oriented session view today.";
};
