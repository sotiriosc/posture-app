import { describe, expect, it } from "vitest";
import {
  SESSION_ABANDON_IDLE_MS,
  SESSION_PAUSE_IDLE_MS,
  abandonTimer,
  createSessionTimer,
  evaluateResume,
  finalizeTimer,
  formatSessionTimeSummary,
  noteActivity,
  pauseTimer,
  resumeTimer,
  tickTimer,
} from "@/lib/sessionActiveTimer";

describe("sessionActiveTimer (Phase 6j Commit 3)", () => {
  it("starts running and accrues active time until finalize", () => {
    const t0 = 1_000_000;
    let state = createSessionTimer(t0);
    state = noteActivity(state, t0 + 30_000);
    const result = finalizeTimer(state, t0 + 60_000);
    expect(result.activeDurationSec).toBe(60);
    expect(result.abandoned).toBe(false);
  });

  it("pauses after 15 minutes of inactivity via tick", () => {
    const t0 = 1_000_000;
    let state = createSessionTimer(t0);
    state = tickTimer(state, t0 + SESSION_PAUSE_IDLE_MS);
    expect(state.status).toBe("paused");
    const result = finalizeTimer(state, t0 + SESSION_PAUSE_IDLE_MS + 60_000);
    expect(result.activeDurationSec).toBe(SESSION_PAUSE_IDLE_MS / 1000);
    expect(result.pausedDurationSec).toBe(60);
  });

  it("abandons after 60 minutes of inactivity", () => {
    const t0 = 1_000_000;
    let state = createSessionTimer(t0);
    state = tickTimer(state, t0 + SESSION_ABANDON_IDLE_MS);
    expect(state.abandoned).toBe(true);
    expect(state.status).toBe("abandoned");
  });

  it("evaluateResume prompts between 15 and 60 minutes idle", () => {
    const t0 = 1_000_000;
    let state = createSessionTimer(t0);
    state = pauseTimer(state, t0 + 10_000);
    const { prompt } = evaluateResume(
      { ...state, lastActivityAt: t0 },
      t0 + SESSION_PAUSE_IDLE_MS + 1_000
    );
    expect(prompt).toBe("resume_or_restart");
  });

  it("evaluateResume abandons at 60 minutes idle", () => {
    const t0 = 1_000_000;
    const state = createSessionTimer(t0);
    const { prompt, state: next } = evaluateResume(
      state,
      t0 + SESSION_ABANDON_IDLE_MS
    );
    expect(prompt).toBe("abandoned");
    expect(next.abandoned).toBe(true);
  });

  it("resume continues accruing after a pause", () => {
    const t0 = 1_000_000;
    let state = createSessionTimer(t0);
    state = pauseTimer(state, t0 + 20_000);
    state = resumeTimer(state, t0 + 40_000);
    const result = finalizeTimer(state, t0 + 70_000);
    expect(result.activeDurationSec).toBe(50); // 20 active + 30 after resume
    expect(result.pausedDurationSec).toBe(20);
  });

  it("formats end-of-session copy with previous comparison", () => {
    const withPrev = formatSessionTimeSummary({
      activeDurationSec: 47 * 60,
      abandoned: false,
      previousActiveDurationSec: 44 * 60,
    });
    expect(withPrev.primary).toContain("47 minutes");
    expect(withPrev.secondary).toContain("44 minutes");

    const first = formatSessionTimeSummary({
      activeDurationSec: 47 * 60,
      abandoned: false,
      previousActiveDurationSec: null,
    });
    expect(first.primary).toContain("Nice work");
    expect(first.secondary).toBeNull();

    const abandoned = formatSessionTimeSummary({
      activeDurationSec: 32 * 60,
      abandoned: true,
      previousActiveDurationSec: 40 * 60,
    });
    expect(abandoned.primary).toContain("doesn't count against you");
  });

  it("abandonTimer stops further accrual", () => {
    const t0 = 1_000_000;
    let state = createSessionTimer(t0);
    state = abandonTimer(state, t0 + 10_000);
    state = noteActivity(state, t0 + 50_000);
    const result = finalizeTimer(state, t0 + 100_000);
    expect(result.activeDurationSec).toBe(10);
    expect(result.abandoned).toBe(true);
  });
});
