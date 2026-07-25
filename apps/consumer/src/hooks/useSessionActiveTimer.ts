"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  createSessionTimer,
  evaluateResume,
  finalizeTimer,
  noteActivity,
  pauseTimer,
  restartTimer,
  resumeTimer,
  tickTimer,
  type ResumePrompt,
  type SessionTimerState,
} from "@/lib/sessionActiveTimer";

type UseSessionActiveTimerParams = {
  /** When false, timer is idle (e.g. session already complete). */
  enabled: boolean;
};

/**
 * Phase 6j — invisible active-session timer with pause / abandon thresholds.
 */
export function useSessionActiveTimer({ enabled }: UseSessionActiveTimerParams) {
  // Seed with a stable epoch so render stays pure; real clock starts in effect.
  const timerRef = useRef<SessionTimerState>(createSessionTimer(0));
  const [resumePrompt, setResumePrompt] = useState<ResumePrompt>("none");

  const apply = useCallback((next: SessionTimerState) => {
    timerRef.current = next;
  }, []);

  const markActivity = useCallback(() => {
    if (!enabled) return;
    apply(noteActivity(timerRef.current, Date.now()));
  }, [apply, enabled]);

  const chooseResume = useCallback(() => {
    apply(resumeTimer(timerRef.current, Date.now()));
    setResumePrompt("none");
  }, [apply]);

  const chooseRestart = useCallback(() => {
    apply(restartTimer(Date.now()));
    setResumePrompt("none");
  }, [apply]);

  const dismissAbandonedPrompt = useCallback(() => {
    setResumePrompt("none");
  }, []);

  const finalize = useCallback(() => finalizeTimer(timerRef.current, Date.now()), []);

  const isRunning = useCallback(
    () => timerRef.current.status === "running" && !timerRef.current.abandoned,
    []
  );

  useEffect(() => {
    if (!enabled) return;
    timerRef.current = createSessionTimer(Date.now());

    const onActivity = () => markActivity();
    window.addEventListener("pointerdown", onActivity);
    window.addEventListener("keydown", onActivity);
    window.addEventListener("touchstart", onActivity, { passive: true });

    const onVisibility = () => {
      const now = Date.now();
      if (document.visibilityState === "hidden") {
        apply(pauseTimer(timerRef.current, now));
        return;
      }
      const { state, prompt } = evaluateResume(timerRef.current, now);
      apply(state);
      if (prompt !== "none") {
        queueMicrotask(() => setResumePrompt(prompt));
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    const interval = window.setInterval(() => {
      const next = tickTimer(timerRef.current, Date.now());
      if (next !== timerRef.current) {
        apply(next);
        if (next.abandoned) {
          queueMicrotask(() => setResumePrompt("abandoned"));
        }
      }
    }, 15_000);

    return () => {
      window.removeEventListener("pointerdown", onActivity);
      window.removeEventListener("keydown", onActivity);
      window.removeEventListener("touchstart", onActivity);
      document.removeEventListener("visibilitychange", onVisibility);
      window.clearInterval(interval);
    };
  }, [apply, enabled, markActivity]);

  return {
    resumePrompt,
    markActivity,
    chooseResume,
    chooseRestart,
    dismissAbandonedPrompt,
    finalize,
    isRunning,
    timerRef,
  };
}
