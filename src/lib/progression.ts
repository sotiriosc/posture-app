import type { Exercise } from "@/lib/exercises";
import type { ExerciseFeedback, ExerciseLog, PainLevel } from "@/lib/types";

type Range = { min: number | null; max: number | null };

export type RecommendedNext = {
  sets?: number;
  reps?: number;
  weight?: number;
  durationSeconds?: number;
  tempo?: string;
  restSeconds?: number;
};

export type ProgressionResult = {
  recommendedNext: RecommendedNext;
  reason: string;
  safetyFlag?: boolean;
  coachNote?: string;
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

export type NextTimeGuidanceInput = {
  loadType?: ExerciseLog["loadType"] | null;
  prescribedSets?: number | null;
  prescribedRepsPerSet?: number | null;
  prescribedDurationSec?: number | null;
  actualSets?: number | null;
  actualRepsPerSet?: number | null;
  actualDurationSec?: number | null;
  difficulty?: "easy" | "moderate" | "hard" | "failed" | null;
  painLevel?: PainLevel | null;
};

export const generateNextTimeGuidance = (
  input: NextTimeGuidanceInput
): string => {
  const painLevel = input.painLevel ?? "none";
  if (painLevel === "moderate" || painLevel === "severe") {
    return "Next time: reduce range + use lighter load.";
  }

  const prescribedSets = input.prescribedSets ?? null;
  const prescribedRepsPerSet = input.prescribedRepsPerSet ?? null;
  const prescribedDurationSec = input.prescribedDurationSec ?? null;
  const actualSets = input.actualSets ?? null;
  const actualRepsPerSet = input.actualRepsPerSet ?? null;
  const actualDurationSec = input.actualDurationSec ?? null;

  const setsMet =
    prescribedSets === null || (actualSets !== null && actualSets >= prescribedSets);

  const repsTargetTotal =
    prescribedSets !== null && prescribedRepsPerSet !== null
      ? prescribedSets * prescribedRepsPerSet
      : null;
  const repsActualTotal =
    actualSets !== null && actualRepsPerSet !== null
      ? actualSets * actualRepsPerSet
      : null;
  const repsMet =
    repsTargetTotal === null ||
    (repsActualTotal !== null && repsActualTotal >= repsTargetTotal);
  const durationMet =
    prescribedDurationSec === null ||
    (actualDurationSec !== null && actualDurationSec >= prescribedDurationSec);
  const underTarget =
    input.loadType === "timed" ? !(setsMet && durationMet) : !(setsMet && repsMet);

  if (input.difficulty === "failed" || input.difficulty === "hard") {
    return "Next time: reduce load 5-10% or drop 1 set.";
  }

  if (input.difficulty === "easy" && !underTarget) {
    return "Next time: add small load or reps.";
  }

  if (input.difficulty === "moderate" && underTarget) {
    return "Next time: keep load, aim for +2 reps total.";
  }

  if (underTarget) {
    return "Next time: keep load, aim for +2 reps total.";
  }

  return "Next time: repeat with clean form and steady tempo.";
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

const parseDurationRange = (
  prescriptionDuration?: number | null,
  exerciseDurationOrReps?: string | null
): Range => {
  if (!exerciseDurationOrReps) {
    if (typeof prescriptionDuration === "number" && Number.isFinite(prescriptionDuration)) {
      return { min: prescriptionDuration, max: prescriptionDuration + 10 };
    }
    return { min: null, max: null };
  }
  const lower = exerciseDurationOrReps.toLowerCase();
  const isTimeLike =
    lower.includes("sec") || lower.includes("second") || lower.includes("min");
  if (!isTimeLike) return { min: null, max: null };
  const nums = lower.match(/\d+/g)?.map(Number).filter(Number.isFinite) ?? [];
  if (!nums.length) return { min: null, max: null };
  const toSeconds = (value: number) =>
    lower.includes("min") && !lower.includes("sec") ? value * 60 : value;
  if (nums.length === 1) {
    const seconds = toSeconds(nums[0]);
    if (typeof prescriptionDuration === "number" && Number.isFinite(prescriptionDuration)) {
      return { min: prescriptionDuration, max: Math.max(seconds, prescriptionDuration + 10) };
    }
    return { min: seconds, max: seconds };
  }
  const parsedMin = toSeconds(nums[0]);
  const parsedMax = toSeconds(nums[1]);
  if (typeof prescriptionDuration === "number" && Number.isFinite(prescriptionDuration)) {
    return { min: prescriptionDuration, max: Math.max(parsedMax, prescriptionDuration + 5) };
  }
  return { min: parsedMin, max: parsedMax };
};

const totalReps = (log: ExerciseLog) => {
  if (log.repsBySet?.length) {
    return log.repsBySet.reduce((sum, value) => sum + value, 0);
  }
  return log.reps ?? null;
};

const repsPerSet = (log: ExerciseLog) => {
  if (log.repsBySet?.length) {
    const total = log.repsBySet.reduce((sum, value) => sum + value, 0);
    const sets = log.repsBySet.length;
    return sets > 0 ? Math.round(total / sets) : null;
  }
  return log.reps ?? null;
};

const clampToRange = (value: number, range: Range) => {
  const min = range.min ?? value;
  const max = range.max ?? value;
  return Math.max(min, Math.min(max, value));
};

const roundToNearest = (value: number, step = 2.5) =>
  Math.round(value / step) * step;

const formatTargetLabel = (range: Range, unit: string, fallback: string) => {
  if (range.min === null && range.max === null) return fallback;
  if (range.min !== null && range.max !== null) {
    if (range.min === range.max) return `${range.min} ${unit}`;
    return `${range.min}-${range.max} ${unit}`;
  }
  return `${range.min ?? range.max} ${unit}`;
};

const isPainPresent = (
  latest: ExerciseLog,
  feedback?: ExerciseFeedback | null
) => {
  if (feedback?.rating === "pain") return true;
  if (latest.felt === "pain") return true;
  if (feedback?.painLocation) return true;
  if (latest.painLocation) return true;
  return false;
};

const isEasyOrModerate = (log: ExerciseLog) =>
  log.felt === "easy" || log.felt === "moderate";

const isBandExercise = (exercise: Exercise) =>
  exercise.equipment.some((entry) => {
    const token = String(entry).toLowerCase();
    return token === "band" || token === "bands";
  });

const getCoachNoteForLowReadiness = (latest: ExerciseLog, rating: ExerciseFeedback["rating"] | null) => {
  if (rating === "hard" || (typeof latest.rpe === "number" && latest.rpe >= 8)) {
    return "Hold steady this session—quality > load.";
  }
  return null;
};

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
  const durationRange = parseDurationRange(
    prescription?.durationSec,
    exercise.durationOrReps
  );
  const repTargetLabel = formatTargetLabel(repRange, "reps", "prescribed reps");
  const setTargetLabel = formatTargetLabel(setRange, "sets", "prescribed sets");
  const lowReadinessCoachNote = getCoachNoteForLowReadiness(latest, rating);

  if (isPainPresent(latest, feedback)) {
    const isTimed = exercise.loadType === "timed";
    const currentWeight = latest.weight ?? null;
    const reducedWeight =
      currentWeight !== null && Number.isFinite(currentWeight)
        ? roundToNearest(Math.max(0, currentWeight * 0.85), 2.5)
        : undefined;
    const reducedReps =
      !isTimed && repRange.min !== null
        ? Math.max(1, repRange.min - 2)
        : !isTimed && repsPerSet(latest) !== null
        ? Math.max(1, (repsPerSet(latest) ?? 0) - 2)
        : undefined;
    const reducedDuration =
      isTimed && durationRange.min !== null
        ? Math.max(15, Math.round(durationRange.min * 0.85))
        : isTimed && latest.durationSec !== null
        ? Math.max(15, Math.round(latest.durationSec * 0.85))
        : undefined;
    return {
      recommendedNext: {
        weight: isTimed ? undefined : reducedWeight,
        reps: isTimed ? undefined : reducedReps,
        durationSeconds: reducedDuration,
        sets: setRange.min ?? undefined,
        tempo: "slow and controlled",
        restSeconds:
          typeof prescription?.restSec === "number"
            ? prescription.restSec + 15
            : undefined,
      },
      reason: "Pain flagged last time—regressing to keep this smooth.",
      safetyFlag: true,
      coachNote: "Stay smooth—leave 2 reps in reserve and own the range.",
    };
  }

  const completedSets =
    latest.setsCompleted ?? latest.setsPlanned ?? setRange.min ?? 0;
  const repsCompleted = repsPerSet(latest);
  const completedAllSets = setRange.min === null ? true : completedSets >= setRange.min;
  const completedReps =
    repRange.min === null || repsCompleted === null ? true : repsCompleted >= repRange.min;
  const overshotRepsTarget =
    repRange.max !== null && repsCompleted !== null ? repsCompleted > repRange.max : false;
  const completedAll = completedAllSets && completedReps;

  if (exercise.loadType === "weighted") {
    const weight = latest.weight ?? 0;
    if (completedAllSets && overshotRepsTarget) {
      const increase =
        weight >= 150 ? weight * 0.025 : weight >= 50 ? 5 : 2.5;
      const nextWeight = roundToNearest(weight + increase, 2.5);
      return {
        recommendedNext: {
          weight: nextWeight,
          reps: repRange.min ?? undefined,
          sets: setRange.min ?? undefined,
        },
        reason: `You overshot the prescribed target (${repsCompleted} reps vs ${repTargetLabel}, ${setTargetLabel}). Next progression: increase weight from ${weight} to ${nextWeight} and reset near the lower rep target.`,
        coachNote:
          lowReadinessCoachNote ?? "Stay smooth—leave 2 reps in reserve and own the range.",
      };
    }

    if (!completedAll) {
      const missReason = !completedAllSets
        ? `you completed ${completedSets} set${completedSets === 1 ? "" : "s"} and target starts at ${setRange.min}`
        : repRange.min !== null && repsCompleted !== null
        ? `you completed ${repsCompleted} reps and target starts at ${repRange.min}`
        : "the target wasn't fully met";
      return {
        recommendedNext: {
          weight: weight || undefined,
          reps:
            repRange.min !== null
              ? clampToRange((repsCompleted ?? repRange.min) - 1, repRange)
              : undefined,
        },
        reason: `Last session was short of the prescribed target (${repTargetLabel}, ${setTargetLabel}; ${missReason}). Ease reps and focus on control.`,
        coachNote:
          lowReadinessCoachNote ?? "Hold steady this session—quality > load.",
      };
    }

    if (rating === "hard") {
      const nextRepTarget =
        repRange.max !== null && repsCompleted !== null
          ? clampToRange(repsCompleted + 1, repRange)
          : undefined;
      return {
        recommendedNext: {
          weight: weight || undefined,
          reps: nextRepTarget,
          restSeconds:
            typeof prescription?.restSec === "number"
              ? prescription.restSec + 10
              : undefined,
        },
        reason: "Keep the load and nudge volume with +1 rep or a touch more rest.",
        coachNote: "Hold steady this session—quality > load.",
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
      reason: `You hit target reps and sets. Next progression: increase weight from ${weight} to ${nextWeight} and keep form strict.`,
      coachNote:
        lowReadinessCoachNote ?? "Stay smooth—leave 2 reps in reserve and own the range.",
    };
  }

  if (exercise.loadType === "bodyweight" || exercise.loadType === "assisted") {
    const bandExercise = isBandExercise(exercise);
    const topRepTarget = repRange.max;
    const bandGatePassed =
      bandExercise &&
      topRepTarget !== null &&
      logs.slice(0, 2).length >= 2 &&
      logs.slice(0, 2).every((log) => {
        const perSet = repsPerSet(log);
        return perSet !== null && perSet >= topRepTarget && isEasyOrModerate(log);
      });

    if (!completedAll) {
      const missReason = !completedAllSets
        ? `you completed ${completedSets} set${completedSets === 1 ? "" : "s"} and target starts at ${setRange.min}`
        : repRange.min !== null && repsCompleted !== null
        ? `you completed ${repsCompleted} reps and target starts at ${repRange.min}`
        : "the target wasn't fully met";
      return {
        recommendedNext: {
          reps:
            repRange.min !== null
              ? clampToRange((repsCompleted ?? repRange.min) - 1, repRange)
              : undefined,
          tempo: "slow and controlled",
        },
        reason: `Next progression step is quality first (${repTargetLabel}, ${setTargetLabel}; ${missReason}). Reduce reps slightly and use slower tempo to rebuild control.`,
        coachNote:
          lowReadinessCoachNote ?? "Stay smooth—leave 2 reps in reserve and own the range.",
      };
    }

    if (rating === "hard") {
      const nextRepTarget =
        repRange.max !== null && repsCompleted !== null
          ? clampToRange(repsCompleted + 1, repRange)
          : repsCompleted ?? repRange.min ?? undefined;
      return {
        recommendedNext: {
          reps: nextRepTarget,
          tempo: "2-1-2",
          restSeconds:
            typeof prescription?.restSec === "number"
              ? prescription.restSec + 10
              : undefined,
        },
        reason: "Keep effort controlled and add just +1 rep or a little more rest.",
        coachNote: "Hold steady this session—quality > load.",
      };
    }

    if (bandExercise && !bandGatePassed) {
      const nextRepTarget =
        topRepTarget !== null && repsCompleted !== null
          ? clampToRange(repsCompleted + 1, repRange)
          : topRepTarget ?? repsCompleted ?? undefined;
      return {
        recommendedNext: {
          reps: nextRepTarget,
          tempo: "3-1-2",
        },
        reason:
          "Band progression gate not yet met: build reps toward the top target for 2 consecutive easy/moderate sessions before increasing tension.",
        coachNote:
          lowReadinessCoachNote ??
          "Increase band tension only if pain-free and form stays crisp.",
      };
    }

    if (bandExercise && bandGatePassed) {
      return {
        recommendedNext: {
          reps: repRange.min ?? repsCompleted ?? undefined,
          tempo: "2-1-2",
        },
        reason:
          "You hit top reps twice at easy/moderate effort. Progress by increasing band tension or stepping farther from anchor, then reset reps lower.",
        coachNote:
          lowReadinessCoachNote ??
          "Increase band tension only if pain-free and form stays crisp.",
      };
    }

    if (repRange.max !== null && repsCompleted !== null) {
      const nextReps = clampToRange(repsCompleted + 1, repRange);
      if (nextReps < repRange.max) {
        return {
          recommendedNext: { reps: nextReps },
          reason: `Next progression: add 1 rep (to ${nextReps}) while keeping the same quality.`,
          coachNote:
            lowReadinessCoachNote ?? "Stay smooth—leave 2 reps in reserve and own the range.",
        };
      }
    }

    return {
      recommendedNext: {
        reps: repRange.max ?? repsCompleted ?? undefined,
        tempo: "3-1-3",
      },
      reason: "You are near the top of the rep range. Next progression: keep reps steady and increase time under tension with 3-1-3 tempo.",
      coachNote:
        lowReadinessCoachNote ?? "Stay smooth—leave 2 reps in reserve and own the range.",
    };
  }

  if (exercise.loadType === "timed") {
    const currentDuration =
      latest.durationSec ?? durationRange.min ?? durationRange.max ?? null;
    const sets = latest.setsCompleted ?? latest.setsPlanned ?? setRange.min ?? null;
    const completedAllSets = setRange.min === null || (sets ?? 0) >= setRange.min;
    const targetDuration =
      prescription?.durationSec ?? durationRange.max ?? durationRange.min ?? currentDuration;
    const timedGatePassed =
      targetDuration !== null &&
      logs.slice(0, 2).length >= 2 &&
      logs.slice(0, 2).every((log) => {
        const duration = log.durationSec ?? null;
        return duration !== null && duration >= targetDuration && isEasyOrModerate(log);
      });

    if (!completedAllSets) {
      return {
        recommendedNext: {
          durationSeconds:
            currentDuration !== null ? Math.max(15, currentDuration - 5) : undefined,
          sets: setRange.min ?? undefined,
          tempo: "controlled",
        },
        reason: "Next progression step is regression for quality: reduce work time slightly and complete all sets with control.",
        coachNote:
          lowReadinessCoachNote ?? "Stay smooth—leave 2 reps in reserve and own the range.",
      };
    }

    if (rating === "hard") {
      return {
        recommendedNext: {
          durationSeconds: currentDuration ?? durationRange.min ?? undefined,
          sets: setRange.min ?? undefined,
          restSeconds:
            typeof prescription?.restSec === "number"
              ? prescription.restSec + 10
              : undefined,
        },
        reason: "Keep work duration steady next session and add more rest to protect movement quality.",
        coachNote: "Hold steady this session—quality > load.",
      };
    }

    if (currentDuration !== null) {
      if (rating === "moderate") {
        const bumpedModerate = Math.max(
          currentDuration + 5,
          Math.round(currentDuration * 1.15)
        );
        const nextDuration =
          durationRange.max !== null ? Math.min(bumpedModerate, durationRange.max) : bumpedModerate;
        return {
          recommendedNext: {
            durationSeconds: nextDuration,
            sets: setRange.min ?? undefined,
          },
          reason: `You completed the timed work with moderate effort. Next progression: increase interval duration (to ${nextDuration}s).`,
          coachNote:
            lowReadinessCoachNote ?? "Stay smooth—leave 2 reps in reserve and own the range.",
        };
      }
      if (!timedGatePassed) {
        return {
          recommendedNext: {
            durationSeconds: currentDuration,
            sets: setRange.min ?? undefined,
          },
          reason:
            "Timed progression gate not yet met: complete 2 consecutive sessions at target duration with easy/moderate effort before adding 5s.",
          coachNote:
            lowReadinessCoachNote ?? "Hold steady this session—quality > load.",
        };
      }
      const bumped = currentDuration + 5;
      const nextDuration =
        durationRange.max !== null ? Math.min(bumped, durationRange.max) : bumped;
      return {
        recommendedNext: {
          durationSeconds: nextDuration,
          sets: setRange.min ?? undefined,
        },
        reason: `You controlled the current interval well. Next progression: increase work time by 5s (to ${nextDuration}s).`,
        coachNote:
          lowReadinessCoachNote ?? "Stay smooth—leave 2 reps in reserve and own the range.",
      };
    }
  }

  return {
    recommendedNext: {},
    reason: "Keep the same target and focus on consistency.",
    coachNote: lowReadinessCoachNote ?? undefined,
  };
};
