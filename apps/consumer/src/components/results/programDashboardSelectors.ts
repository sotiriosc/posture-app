import type { AssessmentReport } from "@/lib/assessmentEngine";
import { exerciseById } from "@/lib/exercises";
import type { Exercise } from "@/lib/exercises";
import type { Program } from "@/lib/types";

const DEFAULT_FOCUS = "Control and alignment";
const DEFAULT_MOVEMENT_ITEM =
  "Plan movement patterns will populate as Praxis builds your week.";

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

const humanizeProgramSignal = (value: string) => {
  const cleaned = value.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
  if (!cleaned) return "";

  return cleaned.replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
};

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
  const focusAreas = uniqueClean(rawSignals.map(humanizeProgramSignal)).slice(
    0,
    limit
  );

  return focusAreas.length ? focusAreas : [DEFAULT_FOCUS];
};

const buildExerciseCoverageItems = (program: Program) => {
  const exercises = programExercises(program);

  return uniqueClean(
    exercises.map((exercise) => {
      const patterns = uniqueClean(exercise.movementPattern.map(humanizeProgramSignal))
        .slice(0, 2)
        .join(", ");
      if (!patterns) return exercise.name;
      return `${exercise.name}: ${patterns}`;
    })
  ).slice(0, 4);
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
      .map((item) => `${item.title} - ${item.description}`) ?? [];

  return observedItems.length ? observedItems : [fallback];
};

export const buildProgramMovementPatternItems = (params: {
  program: Program;
  assessmentReport?: AssessmentReport | null;
}) => {
  const { program, assessmentReport } = params;
  const focusItems = buildProgramFocusAreas(program, 4).map(
    (focus) => `Plan focus: ${focus}`
  );
  const assessmentItems =
    assessmentReport?.priorities?.slice(0, 2).map((priority) => {
      return `Assessment focus: ${priority}`;
    }) ?? [];
  const successMarkers =
    program.phaseObjective?.successMarkers
      ?.slice(0, 2)
      .map((marker) => `Success marker: ${marker}`) ?? [];
  const exerciseItems = buildExerciseCoverageItems(program);
  const items = uniqueClean([
    ...focusItems,
    ...assessmentItems,
    ...successMarkers,
    ...exerciseItems,
  ]).slice(0, 4);

  return items.length ? items : [DEFAULT_MOVEMENT_ITEM];
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
