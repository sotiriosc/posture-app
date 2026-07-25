import type { AssessmentReport } from "@/lib/assessmentEngine";
import { exerciseById } from "@/lib/exercises";
import type { Exercise } from "@/lib/exercises";
import type { Program } from "@/lib/types";

const DEFAULT_FOCUS = "Control and alignment";
const DEFAULT_MOVEMENT_ITEM =
  "Movement patterns will populate as Praxis builds your week.";

const uniqueClean = (values: Array<string | null | undefined>) => {
  const seen = new Set<string>();
  const output: string[] = [];

  values.forEach((value) => {
    const normalized = value?.replace(/\s+/g, " ").trim();
    if (!normalized) return;
    const key = normalized.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    output.push(normalized);
  });

  return output;
};

/**
 * Drop shorter tags that are already covered by a longer tag
 * ("Balance" vs "Balance And Asymmetry Control").
 */
const dropCoveredTags = (values: string[]) => {
  const sortedByLength = [...values].sort((a, b) => b.length - a.length);
  const kept: string[] = [];

  for (const value of sortedByLength) {
    const key = value.toLowerCase();
    const covered = kept.some((existing) => {
      const existingKey = existing.toLowerCase();
      return existingKey !== key && existingKey.includes(key);
    });
    if (!covered) kept.push(value);
  }

  const keptKeys = new Set(kept.map((value) => value.toLowerCase()));
  return values.filter((value) => keptKeys.has(value.toLowerCase()));
};

const humanizeProgramSignal = (value: string) => {
  const cleaned = value.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
  if (!cleaned) return "";

  return cleaned.replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
};

const stripObservationTemplateGlue = (description: string) =>
  description
    .replace(/^(Pattern|Goal) suggests\s+/i, "")
    .replace(/\s+/g, " ")
    .trim();

const programExercises = (program: Program) =>
  program.week
    .flatMap((day) => day.routine)
    .map((item) => exerciseById(item.exerciseId))
    .filter((exercise): exercise is Exercise => Boolean(exercise));

export const buildProgramFocusAreas = (program: Program, limit = 4) => {
  const exercises = programExercises(program);
  const rawSignals = uniqueClean([
    ...(program.phaseObjective?.primaryPatterns ?? []),
    ...(program.movementProfile?.priorities ?? []),
    program.phaseObjective?.phaseFocus,
    ...program.week.flatMap((day) => day.focusTags),
    ...exercises.flatMap((exercise) => exercise.movementPattern),
    ...exercises.flatMap((exercise) => exercise.focusTags ?? exercise.tags ?? []),
  ]);
  const focusAreas = dropCoveredTags(
    uniqueClean(rawSignals.map(humanizeProgramSignal))
  ).slice(0, limit);

  return focusAreas.length ? focusAreas : [DEFAULT_FOCUS];
};

const buildObservationItems = (
  report: AssessmentReport | null | undefined,
  matcher: RegExp,
  fallback: string
) => {
  const observedItems =
    report?.observations
      ?.filter((item) => matcher.test(`${item.title} ${item.description}`))
      .slice(0, 3)
      .map((item) => {
        const cleaned = stripObservationTemplateGlue(item.description);
        if (!cleaned) return item.title;
        const sentence =
          cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
        return `${item.title} — ${sentence}`;
      }) ?? [];

  return observedItems.length ? observedItems : [fallback];
};

/** Tag names only — no "Plan focus:" template prefix (Phase 6i Commit 1). */
export const buildProgramMovementPatternItems = (params: {
  program: Program;
  assessmentReport?: AssessmentReport | null;
}) => {
  const { program } = params;
  const focusItems = buildProgramFocusAreas(program, 4);
  return focusItems.length ? focusItems : [DEFAULT_MOVEMENT_ITEM];
};

export const buildProgramDashboardCopy = (params: {
  program: Program;
  assessmentReport?: AssessmentReport | null;
  painTrendLabel: string;
}) => {
  const { program, assessmentReport, painTrendLabel } = params;
  const focusAreas = buildProgramFocusAreas(program, 4);
  const movementPatternItems = buildProgramMovementPatternItems({
    program,
    assessmentReport,
  });
  const stabilityPatternItems = buildObservationItems(
    assessmentReport,
    /stability|alignment|control|scap|hip|core/i,
    "Trunk alignment and control are monitored through assessment and session signals."
  );
  const compensationPatternItems = buildObservationItems(
    assessmentReport,
    /forward|tilt|shift|asym|compens|flare|lean/i,
    "Compensation signals are monitored and adjusted through movement quality."
  );
  const postureCue =
    program.phaseObjective?.coachingPrompts?.[0] ??
    (focusAreas[0]
      ? `Posture cue: ${focusAreas[0]}`
      : "Posture cue: stack ribs over pelvis");
  const mainFocus =
    focusAreas[1] ??
    focusAreas[0] ??
    program.phaseObjective?.weekIntent ??
    "Main focus: controlled compound reps";
  const recoveryCue =
    painTrendLabel === "Needs caution"
      ? "Recovery cue: lower intensity and protect range"
      : "Recovery cue: easy walk + mobility after sessions";

  return {
    focusAreas,
    movementPatternItems,
    stabilityPatternItems,
    compensationPatternItems,
    weeklyPriorities: [postureCue, mainFocus, recoveryCue],
    coachFocus:
      focusAreas[0] ??
      program.phaseObjective?.weekIntent ??
      program.phaseObjective?.objective ??
      DEFAULT_FOCUS,
  };
};
