import type { Exercise } from "@/lib/exercises";
import type { ExerciseFeedback, ExerciseLog } from "@/lib/types";

type Range = { min: number | null; max: number | null };

export type RecommendedNext = {
  sets?: number;
  reps?: number;
  weight?: number;
  tempo?: string;
  restSeconds?: number;
};

export type ProgressionResult = {
  recommendedNext: RecommendedNext;
  reason: string;
  safetyFlag?: boolean;
};

export type ProgressionInput = {
  exercise: Exercise;
  logs: ExerciseLog[];
  feedback?: ExerciseFeedback | null;
  prescription?: {
    sets?: string | number | null;
    reps?: string | null;
    durationSec?: number | null;
    restSec?: number | null;
  };
};

const parseRange = (value?: string | number | null): Range => {
  if (typeof value === "number") {
    return { min: value, max: value };
  }
  if (!value) return { min: null, max: null };
  const match = value.match(/\d+/g);
  if (!match || !match.length) return { min: null, max: null };
  const nums = match.map((item) => Number(item)).filter(Number.isFinite);
  if (!nums.length) return { min: null, max: null };
  if (nums.length === 1) return { min: nums[0], max: nums[0] };
  return { min: nums[0], max: nums[1] };
};

const totalReps = (log: ExerciseLog) => {
  if (log.repsBySet?.length) {
    return log.repsBySet.reduce((sum, value) => sum + value, 0);
  }
  return log.reps ?? null;
};

const repsPerSet = (log: ExerciseLog) => {
  const reps = totalReps(log);
  const sets = log.setsCompleted ?? log.setsPlanned ?? null;
  if (!reps || !sets) return reps;
  return Math.round(reps / sets);
};

const clampToRange = (value: number, range: Range) => {
  const min = range.min ?? value;
  const max = range.max ?? value;
  return Math.max(min, Math.min(max, value));
};

const roundToNearest = (value: number, step = 2.5) =>
  Math.round(value / step) * step;

export const getProgressionRecommendation = ({
  exercise,
  logs,
  feedback,
  prescription,
}: ProgressionInput): ProgressionResult | null => {
  if (!logs.length) return null;
  const latest = logs[0];
  const rating = feedback?.rating ?? latest.felt ?? null;
  const setRange = parseRange(prescription?.sets ?? latest.setsPlanned);
  const repRange = parseRange(prescription?.reps ?? exercise.durationOrReps);

  if (rating === "pain") {
    return {
      recommendedNext: {
        reps: repRange.min ?? undefined,
        sets: setRange.min ?? undefined,
        tempo: "slow and controlled",
      },
      reason: "Pain flagged last time—regressing to keep this smooth.",
      safetyFlag: true,
    };
  }

  const completedSets =
    latest.setsCompleted ?? latest.setsPlanned ?? setRange.min ?? 0;
  const repsCompleted = repsPerSet(latest);
  const completedAllSets =
    setRange.min === null ? true : completedSets >= setRange.min;
  const completedReps =
    repRange.min === null || repsCompleted === null
      ? true
      : repsCompleted >= repRange.min;
  const completedAll = completedAllSets && completedReps;

  if (exercise.loadType === "weighted") {
    const weight = latest.weight ?? 0;
    if (!completedAll) {
      return {
        recommendedNext: {
          weight: weight || undefined,
          reps:
            repRange.min !== null
              ? clampToRange((repsCompleted ?? repRange.min) - 1, repRange)
              : undefined,
        },
        reason: "Last session was short of the target—ease reps and focus on control.",
      };
    }

    if (rating === "hard") {
      return {
        recommendedNext: {
          weight: weight || undefined,
          reps:
            repRange.max !== null && repsCompleted !== null
              ? clampToRange(repsCompleted + 1, repRange)
              : undefined,
        },
        reason: "Keep the load and build a little more volume next time.",
      };
    }

    const increase =
      weight >= 150 ? weight * 0.025 : weight >= 50 ? 5 : 2.5;
    const nextWeight = roundToNearest(weight + increase, 2.5);
    return {
      recommendedNext: {
        weight: nextWeight,
        reps: repRange.min ?? undefined,
        sets: setRange.min ?? undefined,
      },
      reason: "You hit the target cleanly—adding a small load bump.",
    };
  }

  if (exercise.loadType === "bodyweight" || exercise.loadType === "assisted") {
    if (!completedAll) {
      return {
        recommendedNext: {
          reps:
            repRange.min !== null
              ? clampToRange((repsCompleted ?? repRange.min) - 1, repRange)
              : undefined,
          tempo: "slow and controlled",
        },
        reason: "Keep it smooth—slightly lower reps and control the tempo.",
      };
    }

    if (rating === "hard") {
      return {
        recommendedNext: {
          reps: repsCompleted ?? repRange.min ?? undefined,
          tempo: "2-1-2",
        },
        reason: "Hold reps steady and improve control before pushing volume.",
      };
    }

    if (repRange.max !== null && repsCompleted !== null) {
      const nextReps = clampToRange(repsCompleted + 1, repRange);
      if (nextReps < repRange.max) {
        return {
          recommendedNext: { reps: nextReps },
          reason: "Add a rep to keep building momentum.",
        };
      }
    }

    return {
      recommendedNext: {
        reps: repRange.max ?? repsCompleted ?? undefined,
        tempo: "3-1-3",
      },
      reason: "At the top of the range—add tempo or pause for progression.",
    };
  }

  return {
    recommendedNext: {},
    reason: "Keep the same target and focus on consistency.",
  };
};
