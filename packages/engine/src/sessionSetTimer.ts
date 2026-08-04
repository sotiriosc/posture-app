import type { ProgramRoutineItem } from "@/lib/types";
import {
  getEffectiveTimer,
  type EffectiveTimer,
  type TempoPace,
} from "@/lib/timerRules";

export const SESSION_SET_TIMER_SCHEMA_VERSION = 1 as const;

export type SessionTimerStatus = "idle" | "running" | "paused" | "completed";

export type SessionTimerMode = "exercise" | "rest";

/**
 * Deterministic identity for the workout context that owns a set/rest timer.
 * Excludes render-only / countdown fields so rerenders do not forge a new context.
 */
export type SessionTimerContextParts = {
  sessionId: string;
  dayIndex: number;
  itemId: string;
  exerciseId: string;
  section?: string | null;
};

export type SessionTimerRuntimeState = {
  schemaVersion: typeof SESSION_SET_TIMER_SCHEMA_VERSION;
  contextId: string;
  mode: SessionTimerMode;
  status: SessionTimerStatus;
  running: boolean;
  prescribedExerciseSeconds: number;
  prescribedRestSeconds: number;
  remainingSeconds: number;
  /** Wall-clock anchor for running timers (preferred over tick decrements). */
  updatedAtMs?: number;
  timerEndsAtMs?: number | null;
  userOverrideExerciseSeconds?: number | null;
  userOverrideRestSeconds?: number | null;
  reasonCodes: string[];
  calculationVersion: string;
  savedAtMs?: number;
};

export type PrescribedTimerDuration = {
  workSeconds: number;
  restSeconds: number;
  tempoPace: TempoPace;
  fromRepTempo: boolean;
  reasonCodes: string[];
  calculationVersion: string;
};

export const SESSION_TIMER_CALCULATION_VERSION = "timerRules.getEffectiveTimer@1";

export const buildSessionTimerContextId = (
  parts: SessionTimerContextParts
): string =>
  [
    parts.sessionId,
    String(parts.dayIndex),
    parts.itemId,
    parts.exerciseId,
    parts.section ?? "",
  ].join("|");

export const calculatePrescribedTimerDuration = (
  item: ProgramRoutineItem | null | undefined,
  prefs?: { workSeconds?: number | null; restSeconds?: number | null } | null
): PrescribedTimerDuration => {
  const effective: EffectiveTimer = getEffectiveTimer(item, prefs);
  const reasonCodes: string[] = [];

  if (isPositive(item?.restSec)) {
    reasonCodes.push("timer:program_prescription");
  } else if (isPositive(prefs?.restSeconds)) {
    reasonCodes.push("timer:user_override");
  } else {
    reasonCodes.push("timer:legacy_fallback");
  }

  if (item?.loadType === "timed") {
    reasonCodes.push(
      isPositive(item.durationSec)
        ? "timer:program_prescription"
        : "timer:legacy_fallback"
    );
  } else if (effective.fromRepTempo) {
    reasonCodes.push("timer:rep_range");
    reasonCodes.push("timer:tempo");
    reasonCodes.push(
      item?.section === "accessory"
        ? "timer:section_default:accessory"
        : "timer:section_default:main"
    );
  } else {
    reasonCodes.push("timer:legacy_fallback");
  }

  return {
    workSeconds: effective.workSeconds,
    restSeconds: effective.restSeconds,
    tempoPace: effective.tempoPace,
    fromRepTempo: effective.fromRepTempo,
    reasonCodes: Array.from(new Set(reasonCodes)),
    calculationVersion: SESSION_TIMER_CALCULATION_VERSION,
  };
};

export const isSameSessionTimerContext = (
  left: string | null | undefined,
  right: string | null | undefined
) => Boolean(left && right && left === right);

/** True when an update belongs to a different context than the active one. */
export const isStaleSessionTimerUpdate = (
  activeContextId: string | null | undefined,
  updateContextId: string | null | undefined
) => {
  if (!activeContextId) return false;
  if (!updateContextId) return true;
  return activeContextId !== updateContextId;
};

export const clampTimerRemaining = (value: number) => {
  if (!Number.isFinite(value)) return 0;
  // Overtime is allowed (negative) for cue-consistency scoring.
  return Math.trunc(value);
};

export const deriveRemainingFromEndsAt = (
  timerEndsAtMs: number | null | undefined,
  nowMs: number
) => {
  if (typeof timerEndsAtMs !== "number" || !Number.isFinite(timerEndsAtMs)) {
    return null;
  }
  return clampTimerRemaining((timerEndsAtMs - nowMs) / 1000);
};

export const buildTimerEndsAtMs = (
  remainingSeconds: number,
  nowMs: number,
  running: boolean
) => {
  if (!running) return null;
  return nowMs + Math.trunc(remainingSeconds) * 1000;
};

const isPositive = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value > 0;
