/**
 * Phase 6j Commit 3 — invisible session active-time tracking.
 *
 * Pure state machine: apps drive it with activity / visibility / ticks.
 * User never sees a live clock; end-of-session copy uses finalize().
 */

export const SESSION_PAUSE_IDLE_MS = 15 * 60 * 1000;
export const SESSION_ABANDON_IDLE_MS = 60 * 60 * 1000;

export type SessionTimerStatus = "running" | "paused" | "abandoned";

export type SessionTimerState = {
  accumulatedActiveMs: number;
  accumulatedPausedMs: number;
  lastActivityAt: number;
  /** When non-null, timer is accruing active time from this timestamp. */
  runningSince: number | null;
  /** When non-null, timer is accruing paused time from this timestamp. */
  pausedSince: number | null;
  abandoned: boolean;
  status: SessionTimerStatus;
};

export type ResumePrompt = "none" | "resume_or_restart" | "abandoned";

export const createSessionTimer = (now: number): SessionTimerState => ({
  accumulatedActiveMs: 0,
  accumulatedPausedMs: 0,
  lastActivityAt: now,
  runningSince: now,
  pausedSince: null,
  abandoned: false,
  status: "running",
});

const flushRunning = (state: SessionTimerState, now: number): SessionTimerState => {
  if (state.runningSince === null) return state;
  const delta = Math.max(0, now - state.runningSince);
  return {
    ...state,
    accumulatedActiveMs: state.accumulatedActiveMs + delta,
    runningSince: null,
  };
};

const flushPaused = (state: SessionTimerState, now: number): SessionTimerState => {
  if (state.pausedSince === null) return state;
  const delta = Math.max(0, now - state.pausedSince);
  return {
    ...state,
    accumulatedPausedMs: state.accumulatedPausedMs + delta,
    pausedSince: null,
  };
};

export const noteActivity = (
  state: SessionTimerState,
  now: number
): SessionTimerState => {
  if (state.abandoned) return state;
  if (state.status === "paused") {
    // Foreground idle pause: any input resumes. (Background return uses
    // evaluateResume, which may prompt restart vs resume instead.)
    return resumeTimer(state, now);
  }
  return { ...state, lastActivityAt: now };
};

export const pauseTimer = (
  state: SessionTimerState,
  now: number
): SessionTimerState => {
  if (state.abandoned || state.status === "paused") return state;
  const flushed = flushRunning(state, now);
  return {
    ...flushed,
    status: "paused",
    pausedSince: now,
    runningSince: null,
  };
};

export const abandonTimer = (
  state: SessionTimerState,
  now: number
): SessionTimerState => {
  if (state.abandoned) return state;
  const flushedRun = flushRunning(state, now);
  const flushed = flushPaused(flushedRun, now);
  return {
    ...flushed,
    abandoned: true,
    status: "abandoned",
    runningSince: null,
    pausedSince: null,
  };
};

/**
 * Resume after backgrounding / tab return.
 * - idle < 15m: continue running
 * - 15–60m: paused; caller should prompt restart vs resume
 * - ≥60m: abandoned
 */
export const evaluateResume = (
  state: SessionTimerState,
  now: number
): { state: SessionTimerState; prompt: ResumePrompt } => {
  if (state.abandoned) {
    return { state, prompt: "abandoned" };
  }
  const idleMs = Math.max(0, now - state.lastActivityAt);
  if (idleMs >= SESSION_ABANDON_IDLE_MS) {
    return { state: abandonTimer(state, now), prompt: "abandoned" };
  }
  if (idleMs >= SESSION_PAUSE_IDLE_MS) {
    const paused = state.status === "paused" ? state : pauseTimer(state, now);
    return { state: paused, prompt: "resume_or_restart" };
  }
  if (state.status === "paused") {
    const flushed = flushPaused(state, now);
    return {
      state: {
        ...flushed,
        status: "running",
        runningSince: now,
        pausedSince: null,
        lastActivityAt: now,
      },
      prompt: "none",
    };
  }
  return { state: { ...state, lastActivityAt: now }, prompt: "none" };
};

export const resumeTimer = (
  state: SessionTimerState,
  now: number
): SessionTimerState => {
  if (state.abandoned) return state;
  const flushed = flushPaused(state, now);
  return {
    ...flushed,
    status: "running",
    runningSince: now,
    pausedSince: null,
    lastActivityAt: now,
  };
};

export const restartTimer = (now: number): SessionTimerState =>
  createSessionTimer(now);

/**
 * Periodic tick: auto-pause at 15m idle, abandon at 60m idle.
 */
export const tickTimer = (
  state: SessionTimerState,
  now: number
): SessionTimerState => {
  if (state.abandoned) return state;
  const idleMs = Math.max(0, now - state.lastActivityAt);
  if (idleMs >= SESSION_ABANDON_IDLE_MS) {
    return abandonTimer(state, now);
  }
  if (idleMs >= SESSION_PAUSE_IDLE_MS && state.status === "running") {
    return pauseTimer(state, now);
  }
  return state;
};

export const finalizeTimer = (
  state: SessionTimerState,
  now: number
): {
  activeDurationSec: number;
  pausedDurationSec: number;
  abandoned: boolean;
} => {
  let next = state;
  if (next.status === "running") next = flushRunning(next, now);
  if (next.status === "paused") next = flushPaused(next, now);
  return {
    activeDurationSec: Math.max(0, Math.round(next.accumulatedActiveMs / 1000)),
    pausedDurationSec: Math.max(0, Math.round(next.accumulatedPausedMs / 1000)),
    abandoned: next.abandoned,
  };
};

export const formatMinutes = (totalSec: number): number =>
  Math.max(1, Math.round(Math.max(0, totalSec) / 60));

/**
 * End-of-session copy (Phase 6j 3.c).
 */
export const formatSessionTimeSummary = (params: {
  activeDurationSec: number;
  abandoned: boolean;
  previousActiveDurationSec: number | null;
}): { primary: string; secondary: string | null } => {
  const minutes = formatMinutes(params.activeDurationSec);
  if (params.abandoned) {
    return {
      primary: `Active session time: ${minutes} minutes. (You paused for a while — that doesn't count against you.)`,
      secondary: null,
    };
  }
  if (
    params.previousActiveDurationSec !== null &&
    params.previousActiveDurationSec > 0
  ) {
    const previousMinutes = formatMinutes(params.previousActiveDurationSec);
    return {
      primary: `You worked out for ${minutes} minutes today.`,
      secondary: `Last same-day session: ${previousMinutes} minutes.`,
    };
  }
  return {
    primary: `You worked out for ${minutes} minutes today. Nice work.`,
    secondary: null,
  };
};
