import { exerciseById } from "@/lib/exercises";
import type {
  NextSessionRecommendation,
  ProgramDay,
  ProgramRoutineItem,
  SessionPracticeOption,
} from "@/lib/types";

type PracticeMode = SessionPracticeOption["mode"];

/**
 * Phase 6b, Commit 4 — session options consolidated 5 → 3.
 *
 * Canonical set:
 *   full     — the whole session as saved (absorbs legacy "full" + "steady")
 *   lighter  — same movement patterns, reduced work (absorbs "reduced" + "simplified")
 *   recovery — mobility, activation, and cooldown only (unchanged behaviour)
 *
 * Legacy stored values are migrated on read via normalizePracticeMode, so no
 * one-time data migration script is needed.
 */
const optionCopy: Record<
  PracticeMode,
  Pick<SessionPracticeOption, "label" | "description">
> = {
  full: {
    label: "Full",
    description: "The whole session as planned.",
  },
  lighter: {
    label: "Lighter",
    description: "Same movements, less work.",
  },
  recovery: {
    label: "Recovery",
    description: "Mobility and easy movement only.",
  },
};

const recommendationModeToPracticeMode: Record<
  NextSessionRecommendation["mode"],
  PracticeMode
> = {
  normal: "full",
  repeat: "full",
  reduce: "lighter",
  simplify: "lighter",
  recover: "recovery",
};

/**
 * Migrate any stored/legacy practice-mode value to the canonical three. Applied
 * at every read entry point (option selection, note formatting) so previously
 * saved sessions carrying "steady"/"reduced"/"simplified" resolve cleanly.
 */
export const normalizePracticeMode = (mode: string | null | undefined): PracticeMode => {
  switch (mode) {
    case "steady":
    case "full":
      return "full";
    case "reduced":
    case "simplified":
    case "lighter":
      return "lighter";
    case "recovery":
      return "recovery";
    default:
      return "full";
  }
};

const parseSetCount = (sets: ProgramRoutineItem["sets"]): number => {
  const parsed = Number.parseInt(String(sets ?? ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
};

/**
 * "Lighter" keeps the movement pattern but trims one working set (never below
 * one). Returns a shallow clone so the saved routine is never mutated.
 */
const toLighterMain = (item: ProgramRoutineItem): ProgramRoutineItem => {
  const sets = parseSetCount(item.sets);
  if (sets <= 1) return item;
  return { ...item, sets: String(sets - 1) };
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
  modeInput: PracticeMode | string
): ProgramRoutineItem[] => {
  const mode = normalizePracticeMode(modeInput);
  const routine = day.routine;
  if (mode === "full") return [...routine];

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

  if (mode === "lighter") {
    // Same movement patterns as the full session, but one less working set per
    // main slot (cloned, never mutating the saved routine).
    mainItems.forEach((item) => selected.push(toLighterMain(item)));
    appendUnique(selected, cooldownItems, seen);
    return selected;
  }

  // recovery — mobility, activation, and cooldown only; no main strength work.
  appendUnique(selected, coreOrMobilitySupport, seen);
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
  const modes: PracticeMode[] = ["full", "lighter", "recovery"];

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
  const mode = normalizePracticeMode(option.mode);
  if (mode === "full") return "Using the full saved session.";
  if (mode === "lighter") return "Using a lighter version of today's session.";
  return "Using a recovery-oriented session view today.";
};
