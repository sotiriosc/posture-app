import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import type { Exercise } from "@/lib/exercises";
import { exerciseById, exercises } from "@/lib/exercises";
import type { Equipment } from "@/lib/equipment";
import { isExerciseEligible } from "@/lib/equipment";
import type { ProgramDay, ProgramRoutineItem } from "@/lib/types";

type PhaseOptimizerInput = {
  proposedWeek: ProgramDay[];
  previousWeek?: ProgramDay[] | null;
  questionnaire: QuestionnaireData;
  availableEquipment: Set<Equipment>;
  phaseIndex: number;
  cycleIndex: number;
};

type PhaseOptimizerResult = {
  week: ProgramDay[];
  changedSlots: number;
  totalSlots: number;
  summary: string;
  priorities: string[];
  exerciseReasons: Record<string, string[]>;
};

const PAIN_AREA_TAGS: Record<string, string[]> = {
  neck: ["neck", "t-spine", "scap", "breath"],
  "upper back": ["upper-back", "scap", "t-spine", "pull"],
  "lower back": ["core", "tva", "hinge", "hips"],
  shoulders: ["scap", "upper-back", "shoulders", "push"],
  hips: ["hips", "glutes", "hinge", "balance"],
  knees: ["legs", "squat", "ankles", "glutes"],
};

const unique = <T,>(values: T[]) => Array.from(new Set(values));

const getPriorityTags = (questionnaire: QuestionnaireData) => {
  const painTags = questionnaire.painAreas.flatMap(
    (area) => PAIN_AREA_TAGS[area.toLowerCase()] ?? []
  );
  const goalTags =
    questionnaire.goals === "Improve posture"
      ? ["scap", "upper-back", "core", "t-spine"]
      : questionnaire.goals === "Reduce pain"
      ? ["core", "tva", "breath", "hips"]
      : questionnaire.goals === "Athletic performance"
      ? ["hinge", "squat", "push", "pull", "balance"]
      : ["core", "pull", "hips"];
  return new Set(unique([...painTags, ...goalTags]));
};

const countOverlap = (left: string[], right: string[]) => {
  const rightSet = new Set(right);
  return left.reduce((sum, item) => (rightSet.has(item) ? sum + 1 : sum), 0);
};

const scoreCandidate = (params: {
  candidate: Exercise;
  baseline?: Exercise;
  cycleIndex: number;
  phaseIndex: number;
  priorityTags: Set<string>;
  previousWeekIds: Set<string>;
}) => {
  const { candidate, baseline, cycleIndex, phaseIndex, priorityTags, previousWeekIds } =
    params;
  let score = 0;
  if (baseline) {
    if (candidate.category === baseline.category) score += 4;
    score += countOverlap(candidate.movementPattern, baseline.movementPattern) * 4;
    score += countOverlap(candidate.tags, baseline.tags) * 2;
    if (candidate.loadType === baseline.loadType) score += 2;
  }

  score += candidate.tags.reduce(
    (sum, tag) => (priorityTags.has(tag.toLowerCase()) ? sum + 3 : sum),
    0
  );

  const isMain = candidate.category === "main";
  if (isMain && phaseIndex >= 2) {
    if (candidate.loadType === "weighted" || candidate.loadType === "assisted") {
      score += 3;
    }
  }
  if (isMain && phaseIndex === 1 && candidate.loadType === "bodyweight") {
    score += 2;
  }

  if (previousWeekIds.has(candidate.id)) {
    score -= cycleIndex >= 2 ? 4 : 2;
  } else {
    score += 2;
  }

  if (candidate.movementPattern.includes("single-leg") || candidate.tags.includes("balance")) {
    score += 1;
  }

  return score;
};

const buildSignature = (week: ProgramDay[]) =>
  week.map((day) => day.routine.map((item) => item.exerciseId).join("|")).join("||");

const chooseReplacement = (params: {
  item: ProgramRoutineItem;
  baseline?: Exercise;
  usedIds: Set<string>;
  priorityTags: Set<string>;
  availableEquipment: Set<Equipment>;
  previousWeekIds: Set<string>;
  cycleIndex: number;
  phaseIndex: number;
}) => {
  const {
    item,
    baseline,
    usedIds,
    priorityTags,
    availableEquipment,
    previousWeekIds,
    cycleIndex,
    phaseIndex,
  } = params;
  const current = exerciseById(item.exerciseId);
  if (!current) return null;

  const pool = exercises.filter((candidate) => {
    if (candidate.id === current.id) return false;
    if (usedIds.has(candidate.id)) return false;
    if (!isExerciseEligible(candidate, availableEquipment)) return false;
    if (candidate.category !== current.category) return false;
    const overlap = candidate.movementPattern.some((pattern) =>
      current.movementPattern.includes(pattern)
    );
    return overlap;
  });
  if (!pool.length) return null;

  const sorted = [...pool].sort((left, right) => {
    const rightScore = scoreCandidate({
      candidate: right,
      baseline: baseline ?? current,
      cycleIndex,
      phaseIndex,
      priorityTags,
      previousWeekIds,
    });
    const leftScore = scoreCandidate({
      candidate: left,
      baseline: baseline ?? current,
      cycleIndex,
      phaseIndex,
      priorityTags,
      previousWeekIds,
    });
    if (rightScore !== leftScore) return rightScore - leftScore;
    return left.id.localeCompare(right.id);
  });
  return sorted[0] ?? null;
};

export const optimizePhaseWeek = (
  input: PhaseOptimizerInput
): PhaseOptimizerResult => {
  const {
    proposedWeek,
    previousWeek,
    questionnaire,
    availableEquipment,
    phaseIndex,
    cycleIndex,
  } = input;
  const previousIds = new Set(
    (previousWeek ?? []).flatMap((day) => day.routine.map((item) => item.exerciseId))
  );
  const priorityTags = getPriorityTags(questionnaire);
  const previousByDay = new Map((previousWeek ?? []).map((day) => [day.dayIndex, day]));
  const totalSlots = proposedWeek.reduce((sum, day) => sum + day.routine.length, 0);
  const targetChangeRatio =
    cycleIndex >= 2 ? (phaseIndex >= 2 ? 0.55 : 0.45) : phaseIndex >= 2 ? 0.4 : 0.25;
  const maxChanges = Math.max(1, Math.round(totalSlots * targetChangeRatio));

  let remainingChanges = maxChanges;
  let changedSlots = 0;

  const week = proposedWeek.map((day) => {
    const baselineDay = previousByDay.get(day.dayIndex);
    const usedIds = new Set(day.routine.map((item) => item.exerciseId));
    const changePriority = [...day.routine.keys()].sort((a, b) => {
      const left = exerciseById(day.routine[a].exerciseId);
      const right = exerciseById(day.routine[b].exerciseId);
      const weight = (exercise?: Exercise) =>
        exercise?.category === "main" ? 3 : exercise?.category === "activation" ? 2 : 1;
      return weight(right) - weight(left);
    });

    const routine = [...day.routine];
    for (const index of changePriority) {
      if (remainingChanges <= 0) break;
      const item = routine[index];
      const baseline = exerciseById(
        baselineDay?.routine[index]?.exerciseId ?? item.exerciseId
      );
      const replacement = chooseReplacement({
        item,
        baseline,
        usedIds,
        priorityTags,
        availableEquipment,
        previousWeekIds: previousIds,
        cycleIndex,
        phaseIndex,
      });
      if (!replacement) continue;
      usedIds.delete(item.exerciseId);
      usedIds.add(replacement.id);
      routine[index] = {
        ...item,
        exerciseId: replacement.id,
        loadType: replacement.loadType,
        cues: replacement.cues,
      };
      remainingChanges -= 1;
      changedSlots += 1;
    }

    return { ...day, routine };
  });

  const unchanged = previousWeek ? buildSignature(previousWeek) === buildSignature(week) : false;
  const effectiveChanged = unchanged ? 0 : changedSlots;
  const summary = `Phase optimizer changed ${effectiveChanged}/${totalSlots} exercise slots with priority on movement deficits and progression demands.`;
  const priorities = Array.from(priorityTags).slice(0, 6);
  const exerciseReasons: Record<string, string[]> = {};

  week.forEach((day) => {
    const baselineDay = previousByDay.get(day.dayIndex);
    day.routine.forEach((item, index) => {
      const exercise = exerciseById(item.exerciseId);
      if (!exercise) return;
      const baselineExercise = exerciseById(
        baselineDay?.routine[index]?.exerciseId ?? ""
      );
      const reasons: string[] = [];
      const primaryPattern = exercise.movementPattern[0];
      if (primaryPattern) {
        reasons.push(`Builds ${primaryPattern} pattern quality.`);
      }
      const priorityMatch = exercise.tags.find((tag) =>
        priorityTags.has(tag.toLowerCase())
      );
      if (priorityMatch) {
        reasons.push(`Targets priority area: ${priorityMatch}.`);
      }
      if (
        baselineExercise &&
        baselineExercise.id !== exercise.id &&
        cycleIndex >= 2
      ) {
        reasons.push("Cycle variation to prevent plateaus and build adaptability.");
      }
      if (
        phaseIndex >= 2 &&
        (exercise.loadType === "weighted" || exercise.loadType === "assisted")
      ) {
        reasons.push("Progresses difficulty with higher load/control demand.");
      }
      if (!reasons.length) {
        reasons.push("Selected to keep movement balance and session structure intact.");
      }
      exerciseReasons[exercise.id] = unique([
        ...(exerciseReasons[exercise.id] ?? []),
        ...reasons,
      ]);
    });
  });

  return {
    week,
    changedSlots: effectiveChanged,
    totalSlots,
    summary,
    priorities,
    exerciseReasons,
  };
};
