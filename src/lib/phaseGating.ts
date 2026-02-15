import type { ProgramProgress } from "@/lib/types";

export type PhaseGateThreshold = {
  minCycles: number;
  minDays: number;
};

export type PhaseAdvanceGateResult = {
  ok: boolean;
  reasons: string[];
  minCycles: number;
  minDays: number;
  cyclesCompletedInPhase: number;
  daysSincePhaseStart: number;
};

const DAY_MS = 24 * 60 * 60 * 1000;

export const getPhaseGateThreshold = (phaseIndex: number): PhaseGateThreshold => {
  if (phaseIndex <= 1) {
    return { minCycles: 2, minDays: 14 };
  }
  if (phaseIndex === 2) {
    return { minCycles: 4, minDays: 28 };
  }
  return { minCycles: 8, minDays: 56 };
};

const safeDaysSince = (phaseStartedAt: string | null | undefined, nowIso: string) => {
  if (!phaseStartedAt) return 0;
  const now = Date.parse(nowIso);
  const startedAt = Date.parse(phaseStartedAt);
  if (Number.isNaN(now) || Number.isNaN(startedAt)) return 0;
  return Math.max(0, Math.floor((now - startedAt) / DAY_MS));
};

export const canAdvancePhase = (params: {
  phaseIndex?: number;
  phaseStartedAt?: string | null;
  cyclesCompletedInPhase?: number;
}, nowIso = new Date().toISOString()): PhaseAdvanceGateResult => {
  const {
    phaseIndex = 1,
    phaseStartedAt = null,
    cyclesCompletedInPhase = 0,
  } = params;
  const { minCycles, minDays } = getPhaseGateThreshold(phaseIndex);
  const safeCycles = Math.max(0, Math.floor(cyclesCompletedInPhase));
  if (!phaseStartedAt) {
    return {
      ok: false,
      reasons: ["Phase initialization incomplete"],
      minCycles,
      minDays,
      cyclesCompletedInPhase: safeCycles,
      daysSincePhaseStart: 0,
    };
  }
  const daysSincePhaseStart = safeDaysSince(phaseStartedAt, nowIso);
  const reasons: string[] = [];

  if (safeCycles < minCycles) {
    reasons.push(`Complete ${minCycles} cycles in this phase.`);
  }
  if (daysSincePhaseStart < minDays) {
    reasons.push(`Spend at least ${minDays} days in this phase.`);
  }

  return {
    ok: reasons.length === 0,
    reasons,
    minCycles,
    minDays,
    cyclesCompletedInPhase: safeCycles,
    daysSincePhaseStart,
  };
};

export const skipPhase1 = (
  progress: ProgramProgress,
  nowIso = new Date().toISOString()
): ProgramProgress => {
  if ((progress.phaseIndex ?? 1) !== 1) {
    return progress;
  }
  return {
    ...progress,
    phaseIndex: 2,
    phaseStartedAt: nowIso,
    cyclesCompletedInPhase: 0,
    weekIndex: 0,
    countedWeekKeys: [],
    updatedAt: nowIso,
  };
};

export const formatPhaseGateReason = (result: PhaseAdvanceGateResult) => {
  if (result.ok) return "Gate passed. You can move to the next phase.";
  return result.reasons.join(" ");
};
