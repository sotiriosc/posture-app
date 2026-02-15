import type { ProgramProgress } from "@/lib/types";

export type CompletedDayProgressResult = {
  progress: ProgramProgress;
  weekCompleted: boolean;
  countedWeekKey: string | null;
};

const normalizeCountedWeekKeys = (value: unknown) =>
  Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === "string")
    : [];

export const applyCompletedDayToProgramProgress = (params: {
  priorProgress: ProgramProgress | null | undefined;
  programId: string;
  phaseIndex: number;
  daysPerWeek: number;
  completedDayIndex: number;
  completedAtIso: string;
  phaseStartedAtFallback: string;
}): CompletedDayProgressResult => {
  const {
    priorProgress,
    programId,
    phaseIndex,
    daysPerWeek,
    completedDayIndex,
    completedAtIso,
    phaseStartedAtFallback,
  } = params;

  const phaseStartedAt =
    priorProgress?.phaseStartedAt ?? phaseStartedAtFallback;
  const weekIndex = Math.max(1, priorProgress?.weekIndex ?? 1);
  const priorCycles =
    typeof priorProgress?.cyclesCompletedInPhase === "number"
      ? priorProgress.cyclesCompletedInPhase
      : 0;
  const priorKeys = normalizeCountedWeekKeys(priorProgress?.countedWeekKeys);
  const completedDays = new Set(priorProgress?.completedDayIndices ?? []);
  completedDays.add(completedDayIndex);
  const completedDayIndices = Array.from(completedDays).sort((a, b) => a - b);
  const weekIsComplete = completedDayIndices.length === daysPerWeek;

  let cyclesCompletedInPhase = priorCycles;
  let countedWeekKey: string | null = null;
  let countedWeekKeys = priorKeys;
  let nextCompletedDayIndices = completedDayIndices;
  let nextDayIndex =
    completedDayIndex + 1 < daysPerWeek ? completedDayIndex + 1 : 0;
  let nextWeekIndex = weekIndex;

  if (weekIsComplete) {
    countedWeekKey = `${programId}:${phaseIndex}:${weekIndex}`;
    if (!priorKeys.includes(countedWeekKey)) {
      cyclesCompletedInPhase += 1;
      countedWeekKeys = [...priorKeys, countedWeekKey].slice(-32);
    }
    nextCompletedDayIndices = [];
    nextDayIndex = 0;
    nextWeekIndex = weekIndex + 1;
  }

  return {
    weekCompleted: weekIsComplete,
    countedWeekKey,
    progress: {
      programId,
      lastCompletedDayIndex: completedDayIndex,
      nextDayIndex,
      completedDayIndices: nextCompletedDayIndices,
      phaseIndex,
      phaseStartedAt,
      cyclesCompletedInPhase,
      daysPerWeek,
      weekIndex: nextWeekIndex,
      countedWeekKeys,
      updatedAt: completedAtIso,
    },
  };
};

