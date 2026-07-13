import type { ProgramRoutineItem } from "@/lib/types";

type TimerPrefs = {
  workSeconds?: number | null;
  restSeconds?: number | null;
};

const isPositiveNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value > 0;

const pickPositiveOr = (value: unknown, fallback: number): number =>
  isPositiveNumber(value) ? value : fallback;

export const getEffectiveTimer = (
  item: ProgramRoutineItem | null | undefined,
  prefs?: TimerPrefs | null
) => {
  const fallbackWork = pickPositiveOr(prefs?.workSeconds, 60);
  const fallbackRest = pickPositiveOr(prefs?.restSeconds, 60);

  const workSeconds = pickPositiveOr(item?.durationSec, fallbackWork);
  const restSeconds = pickPositiveOr(item?.restSec, fallbackRest);

  return { workSeconds, restSeconds };
};
