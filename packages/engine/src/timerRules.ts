import type { ProgramRoutineItem } from "@/lib/types";

type TimerPrefs = {
  workSeconds?: number | null;
  restSeconds?: number | null;
};

export type TempoPace = "slow" | "fast";

/** Seconds per rep for section-default tempos. */
export const TEMPO_SEC_PER_REP: Record<TempoPace, number> = {
  slow: 4,
  fast: 2,
};

/** DualModeTimer exercise clamp upper bound — keep prescriptions inside it. */
export const MAX_WORK_TIMER_SEC = 180;

const isPositiveNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value > 0;

const pickPositiveOr = (value: unknown, fallback: number): number =>
  isPositiveNumber(value) ? value : fallback;

/**
 * Section → tempo pace.
 * Warmups + mains (+ activation/cooldown) stay controlled/slow.
 * Accessories use a faster working tempo.
 */
export const tempoPaceForSection = (
  section?: ProgramRoutineItem["section"] | string | null
): TempoPace => {
  if (section === "accessory") return "fast";
  return "slow";
};

export const tempoPaceLabel = (pace: TempoPace): string =>
  pace === "fast" ? "Fast tempo" : "Slow tempo";

/**
 * Parse a rep prescription into a countable target.
 * Uses the upper end of a range when present ("8-12" → 12) so the timer
 * covers a full quality set. "per side" / "each" doubles total reps.
 */
export const parseRepTarget = (
  reps?: string | number | null
): { reps: number; perSide: boolean } | null => {
  if (typeof reps === "number" && Number.isFinite(reps) && reps > 0) {
    return { reps: Math.round(reps), perSide: false };
  }
  if (typeof reps !== "string") return null;
  const raw = reps.trim().toLowerCase();
  if (!raw) return null;
  const perSide = /\b(per side|each side|\/\s*side|each)\b/i.test(raw);
  const range = raw.match(/(\d+)\s*[-–]\s*(\d+)/);
  if (range) {
    const hi = Number(range[2]);
    if (Number.isFinite(hi) && hi > 0) {
      return { reps: hi, perSide };
    }
  }
  const single = raw.match(/(\d+)/);
  if (!single) return null;
  const value = Number(single[1]);
  if (!Number.isFinite(value) || value <= 0) return null;
  return { reps: value, perSide };
};

export const workSecondsFromRepsAndTempo = (params: {
  reps: number;
  perSide?: boolean;
  pace: TempoPace;
}): number => {
  const secPerRep = TEMPO_SEC_PER_REP[params.pace];
  const totalReps = Math.max(1, params.reps) * (params.perSide ? 2 : 1);
  const raw = Math.round(totalReps * secPerRep);
  return Math.min(MAX_WORK_TIMER_SEC, Math.max(15, raw));
};

export type EffectiveTimer = {
  workSeconds: number;
  restSeconds: number;
  tempoPace: TempoPace;
  /** True when workSeconds came from reps × tempo (not a timed hold). */
  fromRepTempo: boolean;
};

export const getEffectiveTimer = (
  item: ProgramRoutineItem | null | undefined,
  prefs?: TimerPrefs | null
): EffectiveTimer => {
  const fallbackWork = pickPositiveOr(prefs?.workSeconds, 60);
  const fallbackRest = pickPositiveOr(prefs?.restSeconds, 60);
  const restSeconds = pickPositiveOr(item?.restSec, fallbackRest);
  const tempoPace = tempoPaceForSection(item?.section);

  // Timed / hold prescriptions keep explicit duration.
  if (item?.loadType === "timed") {
    return {
      workSeconds: pickPositiveOr(item.durationSec, fallbackWork),
      restSeconds,
      tempoPace,
      fromRepTempo: false,
    };
  }

  const parsed = parseRepTarget(item?.reps ?? null);
  if (parsed) {
    return {
      workSeconds: workSecondsFromRepsAndTempo({
        reps: parsed.reps,
        perSide: parsed.perSide,
        pace: tempoPace,
      }),
      restSeconds,
      tempoPace,
      fromRepTempo: true,
    };
  }

  // No countable reps — fall back to durationSec / prefs.
  return {
    workSeconds: pickPositiveOr(item?.durationSec, fallbackWork),
    restSeconds,
    tempoPace,
    fromRepTempo: false,
  };
};
