import type { ProgramRoutineItem } from "@/lib/types";

type TimerPrefs = {
  workSeconds?: number | null;
  restSeconds?: number | null;
};

export type TempoPace = "slow" | "fast";

/**
 * Classic ecc–pause–conc–pause notation (single source of truth for display + timer).
 *
 * Evidence note (hypertrophy / control): meta-analyses find similar hypertrophy
 * across ~0.5–8s repetition durations; very slow (>~10s/rep) tends to force
 * loads too light. A moderate controlled tempo (~4s/rep) keeps quality high,
 * builds time-under-tension in a practical window, and makes “feel the
 * difference” motor control learnable — without the inefficiency of ultra-slow
 * tempos. Faster ~2s/rep accessories keep density up on higher-rep support work.
 *
 * Digits sum to seconds per rep (2-0-2-0 → 4s, 1-0-1-0 → 2s).
 */
export const TEMPO_NOTATION: Record<TempoPace, string> = {
  slow: "2-0-2-0",
  fast: "1-0-1-0",
};

/** Seconds per rep for section-default tempos (sum of TEMPO_NOTATION digits). */
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

export const tempoNotationForPace = (pace: TempoPace): string =>
  TEMPO_NOTATION[pace];

/** Display label for UI dose chips / session — always from section, never prescription.tempo. */
export const tempoDisplayForSection = (
  section?: ProgramRoutineItem["section"] | string | null
): string => `Tempo ${tempoNotationForPace(tempoPaceForSection(section))}`;

/** Timed holds have no rep tempo; everything else uses section defaults. */
export const tempoDisplayForItem = (
  item: Pick<ProgramRoutineItem, "section" | "loadType"> | null | undefined
): string | null => {
  if (!item || item.loadType === "timed") return null;
  return tempoDisplayForSection(item.section);
};

/** @deprecated Prefer tempoNotationForPace — kept for any residual callers. */
export const tempoPaceLabel = (pace: TempoPace): string =>
  `Tempo ${TEMPO_NOTATION[pace]}`;
/**
 * Parse a rep prescription into a countable target.
 * Uses the upper end of a range when present ("8-12" → 12) so the timer
 * covers a full quality set.
 * - "per side" / bare "each" doubles total reps (bilateral).
 * - "per letter" / "each letter" triples (Y-T-W shapes).
 * Bare "each" does not apply when qualified (each direction / letter / way).
 */
export const parseRepTarget = (
  reps?: string | number | null
): { reps: number; perSide: boolean; perLetter: boolean } | null => {
  if (typeof reps === "number" && Number.isFinite(reps) && reps > 0) {
    return { reps: Math.round(reps), perSide: false, perLetter: false };
  }
  if (typeof reps !== "string") return null;
  const raw = reps.trim().toLowerCase();
  if (!raw) return null;
  const perLetter = /\b(per letter|each letter)\b/i.test(raw);
  const qualifiedEach = /\beach\s+(direction|letter|way)\b/i.test(raw);
  const perSide =
    /\b(per side|each side|\/\s*side)\b/i.test(raw) ||
    (/\beach\b/i.test(raw) && !perLetter && !qualifiedEach);
  const range = raw.match(/(\d+)\s*[-–]\s*(\d+)/);
  if (range) {
    const hi = Number(range[2]);
    if (Number.isFinite(hi) && hi > 0) {
      return { reps: hi, perSide, perLetter };
    }
  }
  const single = raw.match(/(\d+)/);
  if (!single) return null;
  const value = Number(single[1]);
  if (!Number.isFinite(value) || value <= 0) return null;
  return { reps: value, perSide, perLetter };
};

export const workSecondsFromRepsAndTempo = (params: {
  reps: number;
  perSide?: boolean;
  perLetter?: boolean;
  pace: TempoPace;
}): number => {
  const secPerRep = TEMPO_SEC_PER_REP[params.pace];
  const totalReps =
    Math.max(1, params.reps) *
    (params.perSide ? 2 : 1) *
    (params.perLetter ? 3 : 1);
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
        perLetter: parsed.perLetter,
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
