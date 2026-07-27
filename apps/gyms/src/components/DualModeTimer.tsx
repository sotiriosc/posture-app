"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ClarifyTerm from "@/components/ui/ClarifyTerm";
import { CLARIFY } from "@/components/ui/clarifyTermCopy";
import { vibrateForEvent } from "@/lib/haptics";

export type TimerMode = "exercise" | "rest";

export type DualModeTimerRuntimeState = {
  mode: TimerMode;
  running: boolean;
  remainingSeconds: number;
  exerciseSeconds: number;
  restSeconds: number;
  updatedAtMs?: number;
};

type DualModeTimerProps = {
  initialExerciseSeconds?: number;
  initialRestSeconds?: number;
  onExerciseDurationChange?: (seconds: number) => void;
  onRestDurationChange?: (seconds: number) => void;
  defaultMode?: TimerMode;
  persistedState?: DualModeTimerRuntimeState | null;
  onStateChange?: (state: DualModeTimerRuntimeState) => void;
  /** Phase 6k — settings master for timer tones. */
  timerSoundsEnabled?: boolean;
  /** Phase 6k — settings for work↔rest beeps. */
  intervalBeepsEnabled?: boolean;
  /** Phase 6k — 0–100 volume from settings. */
  soundVolume?: number;
  /** Phase 6k — session-only mute (not persisted). */
  sessionMuted?: boolean;
  onToggleSessionMute?: () => void;
  /** Phase 6k Commit 4 — haptic feedback for timer events. */
  vibrationEnabled?: boolean;
  /**
   * Classic tempo notation (e.g. "2-0-2-0"), or a plain label like "Timed hold".
   * Notation values get a Tempo ClarifyTerm; other strings render as-is.
   */
  tempoHint?: string | null;
};

/** Extra seconds so the user can set up before the working timing pattern starts. */
export const TIMER_SETUP_BUFFER_SEC = 5;

const formatTime = (seconds: number) => {
  const negative = seconds < 0;
  const abs = Math.abs(Math.trunc(seconds));
  const mins = Math.floor(abs / 60);
  const secs = abs % 60;
  return `${negative ? "-" : ""}${mins}:${secs.toString().padStart(2, "0")}`;
};

const clampDuration = (value: number, mode: TimerMode) => {
  const min = mode === "exercise" ? 15 : 30;
  const max = mode === "exercise" ? 180 : 300;
  return Math.min(max, Math.max(min, value));
};

/** Working sets get a setup buffer; rest starts on the prescribed duration. */
const durationForMode = (seconds: number, mode: TimerMode) => {
  const base = Math.max(1, Math.floor(seconds));
  return mode === "exercise" ? base + TIMER_SETUP_BUFFER_SEC : base;
};

const getCurrentTimestampMs = () => Date.now();

/**
 * Advance a running timer through wall-clock time. Remaining may go negative
 * (overtime) so the user can end the set manually for cue-consistency scoring.
 * Never auto-starts rest — that requires an explicit user action.
 */
const reconcileRuntimeState = (
  state: DualModeTimerRuntimeState | null | undefined
): DualModeTimerRuntimeState | null => {
  if (!state) return null;

  const exerciseSeconds = clampDuration(state.exerciseSeconds, "exercise");
  const restSeconds = clampDuration(state.restSeconds, "rest");
  const now = getCurrentTimestampMs();
  const baseline = Math.trunc(state.remainingSeconds);

  if (!state.running || !state.updatedAtMs) {
    return {
      ...state,
      running: false,
      remainingSeconds: baseline,
      exerciseSeconds,
      restSeconds,
      updatedAtMs: now,
    };
  }

  const elapsedSeconds = Math.max(
    0,
    Math.floor((now - state.updatedAtMs) / 1000)
  );
  return {
    ...state,
    remainingSeconds: baseline - elapsedSeconds,
    exerciseSeconds,
    restSeconds,
    updatedAtMs: now,
  };
};

export default function DualModeTimer({
  initialExerciseSeconds = 60,
  initialRestSeconds = 60,
  onExerciseDurationChange,
  onRestDurationChange,
  defaultMode = "exercise",
  persistedState = null,
  onStateChange,
  timerSoundsEnabled = true,
  intervalBeepsEnabled = true,
  soundVolume = 70,
  sessionMuted = false,
  onToggleSessionMute,
  vibrationEnabled = true,
  tempoHint = null,
}: DualModeTimerProps) {
  const reconciledPersistedState = useMemo(
    () => reconcileRuntimeState(persistedState),
    [persistedState]
  );
  const [mode, setMode] = useState<TimerMode>(
    reconciledPersistedState?.mode ?? defaultMode
  );
  const [running, setRunning] = useState(reconciledPersistedState?.running ?? false);
  const [selectedExerciseSeconds, setSelectedExerciseSeconds] = useState(
    reconciledPersistedState?.exerciseSeconds ?? initialExerciseSeconds
  );
  const [selectedRestSeconds, setSelectedRestSeconds] = useState(
    reconciledPersistedState?.restSeconds ?? initialRestSeconds
  );
  const initialPresetSeconds = durationForMode(
    defaultMode === "exercise" ? initialExerciseSeconds : initialRestSeconds,
    defaultMode
  );
  const [remainingSeconds, setRemainingSeconds] = useState(
    reconciledPersistedState?.remainingSeconds ?? initialPresetSeconds
  );
  const modeRef = useRef<TimerMode>(
    reconciledPersistedState?.mode ?? defaultMode
  );
  const runningRef = useRef<boolean>(
    reconciledPersistedState?.running ?? false
  );
  const remainingRef = useRef<number>(
    reconciledPersistedState?.remainingSeconds ?? initialPresetSeconds
  );
  const selectedExerciseRef = useRef<number>(
    reconciledPersistedState?.exerciseSeconds ?? initialExerciseSeconds
  );
  const selectedRestRef = useRef<number>(
    reconciledPersistedState?.restSeconds ?? initialRestSeconds
  );
  const lastRunningRef = useRef(false);
  const lastRemainingRef = useRef(remainingSeconds);
  const zeroCrossBeepRef = useRef(false);
  const runtimeAnchorMsRef = useRef<number>(
    reconciledPersistedState?.updatedAtMs ?? getCurrentTimestampMs()
  );

  const activeSelectedSeconds =
    mode === "exercise" ? selectedExerciseSeconds : selectedRestSeconds;
  const safeSelectedSeconds = Math.max(1, activeSelectedSeconds);
  const startSeconds = durationForMode(activeSelectedSeconds, mode);
  const inSetupPhase =
    mode === "exercise" && remainingSeconds > activeSelectedSeconds;
  // Cue consistency: 100% when ending exactly on the timing pattern (0:00).
  // Rises as the clock approaches zero, falls again in overtime.
  const cueConsistencyPercent = inSetupPhase
    ? null
    : Math.max(
        0,
        Math.min(
          100,
          Math.round(
            100 * (1 - Math.abs(remainingSeconds) / safeSelectedSeconds)
          )
        )
      );
  // Ring fill tracks progress through setup + pattern (caps at 100% in overtime).
  const progressPercent = Math.round(
    Math.min(
      100,
      Math.max(0, ((startSeconds - remainingSeconds) / startSeconds) * 100)
    )
  );
  const sliderMin = mode === "exercise" ? 15 : 30;
  const sliderMax = mode === "exercise" ? 180 : 300;
  const isExerciseMode = mode === "exercise";

  // Outer shell wash — mode color bleeds into the card so Working/Resting
  // read instantly even before the ring spins.
  const modeBackground = isExerciseMode
    ? "border-cyan-300/55 bg-cyan-200/25"
    : "border-amber-200/70 bg-amber-100/20";
  const runningAccent = isExerciseMode
    ? "shadow-cyan-400/45 ring-cyan-300/55"
    : "shadow-amber-400/50 ring-amber-300/60";
  const activeModeButtonClasses = isExerciseMode
    ? "bg-gradient-to-r from-sky-500 to-cyan-400 text-white shadow-[0_8px_20px_rgba(34,211,238,0.45)]"
    : "bg-gradient-to-r from-amber-500 to-orange-400 text-slate-950 shadow-[0_8px_20px_rgba(251,146,60,0.42)]";
  const sliderAccentClass = isExerciseMode ? "accent-cyan-400" : "accent-amber-400";
  // Phase 6k — dark face + pure white digits (WCAG AAA), punched accents.
  const timerFaceBackground = isExerciseMode
    ? "bg-[radial-gradient(circle_at_30%_22%,rgba(8,47,73,.98)_0%,rgba(2,6,23,.99)_52%,rgba(2,6,23,1)_100%)]"
    : "bg-[radial-gradient(circle_at_28%_20%,rgba(69,26,3,.98)_0%,rgba(20,10,2,.99)_52%,rgba(12,8,2,1)_100%)]";
  const ringGradient = isExerciseMode
    ? "conic-gradient(from 180deg at 50% 50%, rgba(224,242,254,1), rgba(34,211,238,1), rgba(14,165,233,0.98), rgba(37,99,235,0.95), rgba(2,6,23,0.92), rgba(224,242,254,1))"
    : "conic-gradient(from 180deg at 50% 50%, rgba(255,251,235,1), rgba(253,224,71,1), rgba(251,146,60,0.98), rgba(234,88,12,0.92), rgba(20,10,2,0.9), rgba(255,251,235,1))";
  const ringProgress = isExerciseMode
    ? `conic-gradient(from -90deg at 50% 50%, rgba(34,211,238,1) 0 ${progressPercent}%, rgba(2,6,23,0.4) ${progressPercent}% 100%)`
    : `conic-gradient(from -90deg at 50% 50%, rgba(251,191,36,1) 0 ${progressPercent}%, rgba(20,10,2,0.4) ${progressPercent}% 100%)`;
  const ringShadow = isExerciseMode
    ? "0 0 28px rgba(34,211,238,0.45), 0 16px 36px rgba(14,165,233,0.35)"
    : "0 0 28px rgba(251,191,36,0.48), 0 16px 36px rgba(234,88,12,0.32)";
  const polarShellClasses = isExerciseMode
    ? "border-cyan-400/55 bg-[linear-gradient(160deg,rgba(2,12,32,0.98)_0%,rgba(8,47,73,0.92)_48%,rgba(2,6,23,0.98)_100%)] text-sky-50 shadow-[0_0_40px_rgba(34,211,238,0.18)]"
    : "border-amber-400/65 bg-[linear-gradient(160deg,rgba(28,12,2,0.98)_0%,rgba(120,53,15,0.88)_48%,rgba(12,8,2,0.98)_100%)] text-amber-50 shadow-[0_0_40px_rgba(251,146,60,0.2)]";
  const secondaryTextClass = isExerciseMode
    ? "text-cyan-100"
    : "text-amber-100";
  const neutralPillClasses = isExerciseMode
    ? "border-cyan-500/35 bg-slate-950/70"
    : "border-amber-500/40 bg-slate-950/55";
  const inactiveModeButtonClasses = isExerciseMode
    ? "text-slate-300 hover:bg-cyan-950/50 hover:text-cyan-100"
    : "text-amber-100/80 hover:bg-amber-950/45 hover:text-amber-50";
  const timerButtonFrameClasses = isExerciseMode
    ? "border-[5px] border-cyan-400/70 text-white shadow-[0_0_24px_rgba(34,211,238,0.35),0_14px_30px_rgba(14,165,233,0.28)]"
    : "border-[5px] border-amber-400/75 text-white shadow-[0_0_24px_rgba(251,191,36,0.4),0_14px_30px_rgba(234,88,12,0.3)]";
  const timerInnerRingClasses = isExerciseMode
    ? "border border-cyan-300/40"
    : "border border-amber-300/45";
  const timerInnerShadeClasses = isExerciseMode
    ? "shadow-[inset_0_8px_18px_rgba(34,211,238,0.14),inset_0_-14px_20px_rgba(2,6,23,0.65)]"
    : "shadow-[inset_0_8px_18px_rgba(251,191,36,0.16),inset_0_-14px_20px_rgba(20,10,2,0.65)]";
  const timerTopGlowClasses = isExerciseMode
    ? "bg-cyan-300/25"
    : "bg-amber-300/30";
  const timerNeedleDotClasses = isExerciseMode
    ? "bg-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.9)]"
    : "bg-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.9)]";
  const progressBadgeClasses = isExerciseMode
    ? "rounded-full border border-cyan-300/80 bg-cyan-100 px-2 py-0.5 text-[11px] font-semibold text-sky-950"
    : "rounded-full border border-amber-300/90 bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-950";
  const presetChipClasses = isExerciseMode
    ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-50"
    : "border-amber-400/45 bg-amber-400/10 text-amber-50";

  useEffect(() => {
    if (!reconciledPersistedState) return;
    modeRef.current = reconciledPersistedState.mode;
    runningRef.current = reconciledPersistedState.running;
    remainingRef.current = reconciledPersistedState.remainingSeconds;
    selectedExerciseRef.current = reconciledPersistedState.exerciseSeconds;
    selectedRestRef.current = reconciledPersistedState.restSeconds;
    runtimeAnchorMsRef.current =
      reconciledPersistedState.updatedAtMs ?? getCurrentTimestampMs();
    lastRunningRef.current = false;
    lastRemainingRef.current = reconciledPersistedState.remainingSeconds;
    queueMicrotask(() => {
      setMode(reconciledPersistedState.mode);
      setRunning(reconciledPersistedState.running);
      setRemainingSeconds(reconciledPersistedState.remainingSeconds);
      setSelectedExerciseSeconds(reconciledPersistedState.exerciseSeconds);
      setSelectedRestSeconds(reconciledPersistedState.restSeconds);
    });
  }, [reconciledPersistedState]);

  useEffect(() => {
    modeRef.current = mode;
    runningRef.current = running;
    remainingRef.current = remainingSeconds;
    selectedExerciseRef.current = selectedExerciseSeconds;
    selectedRestRef.current = selectedRestSeconds;
  }, [mode, running, remainingSeconds, selectedExerciseSeconds, selectedRestSeconds]);

  const reconcileElapsedRuntime = () => {
    const runningNow = runningRef.current;
    if (!runningNow) return;
    const remainingNow = remainingRef.current;
    const anchorMs = runtimeAnchorMsRef.current;
    const elapsedSeconds = Math.max(
      0,
      Math.floor((getCurrentTimestampMs() - anchorMs) / 1000)
    );
    if (elapsedSeconds <= 0) return;

    const reconciled = reconcileRuntimeState({
      mode: modeRef.current,
      running: runningNow,
      remainingSeconds: remainingNow,
      exerciseSeconds: selectedExerciseRef.current,
      restSeconds: selectedRestRef.current,
      updatedAtMs: anchorMs,
    });
    if (!reconciled) return;

    runtimeAnchorMsRef.current =
      reconciled.updatedAtMs ?? getCurrentTimestampMs();
    if (reconciled.remainingSeconds !== remainingRef.current) {
      remainingRef.current = reconciled.remainingSeconds;
      setRemainingSeconds(reconciled.remainingSeconds);
    }
  };

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      reconcileElapsedRuntime();
    }, 250);
    return () => window.clearInterval(timer);
  }, [running]);

  useEffect(() => {
    const syncIfVisible = () => {
      if (document.visibilityState === "visible") {
        reconcileElapsedRuntime();
      }
    };
    const syncOnFocus = () => reconcileElapsedRuntime();
    document.addEventListener("visibilitychange", syncIfVisible);
    window.addEventListener("focus", syncOnFocus);
    return () => {
      document.removeEventListener("visibilitychange", syncIfVisible);
      window.removeEventListener("focus", syncOnFocus);
    };
  }, []);

  const handleModeChange = (nextMode: TimerMode) => {
    if (nextMode === mode) return;
    zeroCrossBeepRef.current = false;
    runtimeAnchorMsRef.current = getCurrentTimestampMs();
    modeRef.current = nextMode;
    runningRef.current = false;
    const nextRemaining = durationForMode(
      nextMode === "exercise"
        ? selectedExerciseRef.current
        : selectedRestRef.current,
      nextMode
    );
    remainingRef.current = nextRemaining;
    setRunning(false);
    setMode(nextMode);
    setRemainingSeconds(nextRemaining);
  };

  const applyExerciseSeconds = (seconds: number) => {
    const next = clampDuration(seconds, "exercise");
    setSelectedExerciseSeconds(next);
    selectedExerciseRef.current = next;
    if (mode === "exercise" && !running) {
      const withSetup = durationForMode(next, "exercise");
      setRemainingSeconds(withSetup);
      remainingRef.current = withSetup;
      runtimeAnchorMsRef.current = getCurrentTimestampMs();
      zeroCrossBeepRef.current = false;
    }
    return next;
  };

  const applyRestSeconds = (seconds: number) => {
    const next = clampDuration(seconds, "rest");
    setSelectedRestSeconds(next);
    selectedRestRef.current = next;
    if (mode === "rest" && !running) {
      const restDuration = durationForMode(next, "rest");
      setRemainingSeconds(restDuration);
      remainingRef.current = restDuration;
      runtimeAnchorMsRef.current = getCurrentTimestampMs();
      zeroCrossBeepRef.current = false;
    }
    return next;
  };

  const applyForMode = (seconds: number) => {
    if (mode === "exercise") {
      applyExerciseSeconds(seconds);
    } else {
      applyRestSeconds(seconds);
    }
  };

  const persistForMode = () => {
    if (mode === "exercise") {
      onExerciseDurationChange?.(selectedExerciseSeconds);
      return;
    }
    onRestDurationChange?.(selectedRestSeconds);
  };

  const resetTimer = () => {
    runtimeAnchorMsRef.current = getCurrentTimestampMs();
    runningRef.current = false;
    zeroCrossBeepRef.current = false;
    const nextRemaining = durationForMode(activeSelectedSeconds, mode);
    remainingRef.current = nextRemaining;
    setRunning(false);
    setRemainingSeconds(nextRemaining);
  };

  const playBeep = (type: "start" | "finish") => {
    if (typeof window === "undefined") return;
    if (sessionMuted) return;
    if (!timerSoundsEnabled) return;
    if (type === "finish" && !intervalBeepsEnabled) return;
    try {
      const context = new AudioContext();
      const now = context.currentTime;
      const volumeScale = Math.min(1, Math.max(0, soundVolume / 100));

      if (type === "start") {
        const osc = context.createOscillator();
        const gain = context.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
        gain.gain.setValueAtTime(0.12 * volumeScale, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.connect(gain);
        gain.connect(context.destination);
        osc.start(now);
        osc.stop(now + 0.2);
      } else {
        const osc1 = context.createOscillator();
        const osc2 = context.createOscillator();
        const gain = context.createGain();
        osc1.type = "sine";
        osc2.type = "sine";
        osc1.frequency.setValueAtTime(520, now);
        osc2.frequency.setValueAtTime(780, now);
        gain.gain.setValueAtTime(0.08 * volumeScale, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(context.destination);
        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.35);
        osc2.stop(now + 0.35);
      }

      setTimeout(() => context.close(), 400);
    } catch {
      // no-op
    }
  };

  useEffect(() => {
    const wasRunning = lastRunningRef.current;
    const wasRemaining = lastRemainingRef.current;

    if (!wasRunning && running) {
      playBeep("start");
      zeroCrossBeepRef.current = false;
    }

    // Target reached — beep once, then keep running into overtime until the
    // user taps to end (cue-consistency scoring uses distance from 0:00).
    if (
      running &&
      wasRemaining > 0 &&
      remainingSeconds <= 0 &&
      !zeroCrossBeepRef.current
    ) {
      zeroCrossBeepRef.current = true;
      playBeep("finish");
      vibrateForEvent(
        mode === "rest" ? "restEnding" : "setComplete",
        vibrationEnabled
      );
    }

    lastRunningRef.current = running;
    lastRemainingRef.current = remainingSeconds;
  }, [
    running,
    remainingSeconds,
    mode,
    sessionMuted,
    timerSoundsEnabled,
    intervalBeepsEnabled,
    soundVolume,
    vibrationEnabled,
  ]);

  useEffect(() => {
    onStateChange?.({
      mode,
      running,
      remainingSeconds,
      exerciseSeconds: selectedExerciseSeconds,
      restSeconds: selectedRestSeconds,
      updatedAtMs: getCurrentTimestampMs(),
    });
  }, [
    mode,
    running,
    remainingSeconds,
    selectedExerciseSeconds,
    selectedRestSeconds,
    onStateChange,
  ]);

  return (
    <div
      className={`rounded-2xl border p-4 shadow-sm transition ${polarShellClasses}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className={`inline-flex rounded-full border p-1 shadow-sm ${neutralPillClasses}`}>
          {(["exercise", "rest"] as TimerMode[]).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => handleModeChange(value)}
              className={`min-h-11 rounded-full px-4 py-2 text-xs font-semibold transition ${
                mode === value
                  ? activeModeButtonClasses
                  : inactiveModeButtonClasses
              }`}
            >
              {value === "exercise" ? "Working" : "Resting"}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex justify-center">
        <div className="relative h-56 w-56 sm:h-64 sm:w-64">
          {onToggleSessionMute ? (
            <button
              type="button"
              data-testid="session-timer-quick-mute"
              aria-label={sessionMuted ? "Unmute timer sounds" : "Mute timer sounds"}
              title={
                sessionMuted
                  ? "Unmute for this session"
                  : "Mute for this session only"
              }
              onClick={onToggleSessionMute}
              className="absolute -right-1 -top-1 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-slate-500/40 bg-slate-950/80 text-white shadow-sm hover:border-sky-300/50"
            >
              {sessionMuted ? (
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M11 5 6 9H3v6h3l5 4V5z" />
                  <path d="m22 9-6 6M16 9l6 6" />
                </svg>
              ) : (
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M11 5 6 9H3v6h3l5 4V5z" />
                  <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
                </svg>
              )}
            </button>
          ) : null}
          <span
            className={`pointer-events-none absolute inset-0 rounded-full transition ${
              running ? "motion-safe:animate-spin" : ""
            }`}
            style={{
              background: ringGradient,
              boxShadow: ringShadow,
              animationDuration: "4s",
            }}
          />
          <span
            className="pointer-events-none absolute inset-[2px] rounded-full transition-[opacity] duration-300"
            style={{
              background: ringProgress,
              opacity: running ? 1 : 0.88,
            }}
          />
          <span
            className={`pointer-events-none absolute inset-[4px] rounded-full border border-white/70 ${modeBackground}`}
          />
          <button
            type="button"
            onClick={() =>
              setRunning((prev) => {
                runtimeAnchorMsRef.current = getCurrentTimestampMs();
                const next = !prev;
                runningRef.current = next;
                return next;
              })
            }
          className={`relative z-10 m-[10px] flex h-[calc(100%-20px)] w-[calc(100%-20px)] items-center justify-center overflow-hidden rounded-full transition sm:text-6xl ${timerButtonFrameClasses} ${timerFaceBackground} ${
            running ? `ring-4 motion-safe:animate-pulse ${runningAccent}` : ""
          }`}
          data-testid="session-timer-face"
          >
            <span className={`pointer-events-none absolute inset-[6px] rounded-full ${timerInnerRingClasses}`} />
            <span className={`pointer-events-none absolute inset-[9px] rounded-full ${timerInnerShadeClasses}`} />
            <span className={`pointer-events-none absolute top-8 left-10 h-6 w-20 rounded-full blur-sm ${timerTopGlowClasses}`} />
            <span className={`pointer-events-none absolute top-5 h-2 w-2 rounded-full ${timerNeedleDotClasses}`} />
            <div className="relative z-10 flex flex-col items-center gap-1">
              <span
                className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${secondaryTextClass}`}
              >
                {inSetupPhase
                  ? "Get ready"
                  : remainingSeconds < 0
                    ? "Overtime"
                    : isExerciseMode
                      ? "Working"
                      : "Resting"}
              </span>
              {/* Phase 6k — pure white, bold, ≥48px for gym-floor glanceability (WCAG AAA). */}
              <span
                className="text-5xl font-bold tracking-tight text-[#FFFFFF] sm:text-6xl"
                data-testid="session-timer-digits"
              >
                {formatTime(remainingSeconds)}
              </span>
            </div>
          </button>
        </div>
      </div>

      <div className={`mt-3 flex items-center justify-between text-xs font-semibold ${secondaryTextClass}`}>
        <span>
          {running
            ? remainingSeconds <= 0
              ? "Tap to end"
              : "Tap to pause"
            : "Tap to start"}
        </span>
        {cueConsistencyPercent !== null ? (
          <span
            className={progressBadgeClasses}
            data-testid="session-timer-cue-consistency"
            title="How closely you finish on the prescribed timing pattern (100% at 0:00)."
          >
            Cue consistency: {cueConsistencyPercent}%
          </span>
        ) : running ? (
          <span
            className={progressBadgeClasses}
            data-testid="session-timer-setup-badge"
          >
            Setup +{TIMER_SETUP_BUFFER_SEC}s
          </span>
        ) : null}
        <button
          type="button"
          onClick={resetTimer}
          className={`flex min-h-11 min-w-11 items-center justify-center ${secondaryTextClass} underline-offset-4 hover:underline`}
        >
          Reset
        </button>
      </div>
      <p className={`mt-2 text-center text-[11px] font-medium ${secondaryTextClass}`}>
        {running
          ? remainingSeconds <= 0
            ? mode === "exercise"
              ? "Pattern complete — tap when you finish the set."
              : "Rest complete — tap when you're ready."
            : inSetupPhase
              ? "Get set. Timing pattern starts after the setup buffer."
              : mode === "exercise"
                ? "Stay controlled and aligned."
                : "Breathe and reset for the next set."
          : mode === "exercise"
            ? `Includes ${TIMER_SETUP_BUFFER_SEC}s setup. Timer waits until you tap start.`
            : "Rest starts when you tap. No setup buffer."}
      </p>

      <div className="mt-4">
        <div
          className={`flex items-center justify-between text-xs font-semibold ${secondaryTextClass}`}
        >
          <span>Duration</span>
          <span>{formatTime(activeSelectedSeconds)}</span>
        </div>
        <input
          type="range"
          min={sliderMin}
          max={sliderMax}
          step={15}
          value={activeSelectedSeconds}
          onChange={(event) => applyForMode(Number(event.target.value))}
          onMouseUp={persistForMode}
          onTouchEnd={persistForMode}
          onKeyUp={(event) => {
            if (
              event.key === "ArrowLeft" ||
              event.key === "ArrowRight" ||
              event.key === "ArrowUp" ||
              event.key === "ArrowDown" ||
              event.key === "Home" ||
              event.key === "End" ||
              event.key === "PageUp" ||
              event.key === "PageDown"
            ) {
              persistForMode();
            }
          }}
          className={`mt-3 w-full ${sliderAccentClass}`}
          data-testid="session-timer-duration-slider"
        />
      </div>

      <div
        className={`mt-4 flex min-w-0 flex-wrap gap-2 text-xs font-semibold ${secondaryTextClass}`}
        data-testid="session-timer-presets"
      >
        {tempoHint ? (
          <span
            className={`max-w-full break-words rounded-lg border px-2.5 py-1 ${presetChipClasses}`}
            data-testid="session-timer-tempo-hint"
          >
            {/^\d-\d-\d-\d$/.test(tempoHint) ? (
              <>
                <ClarifyTerm term="Tempo" explanation={CLARIFY.Tempo}>
                  Tempo
                </ClarifyTerm>{" "}
                {tempoHint}
              </>
            ) : (
              tempoHint
            )}
          </span>
        ) : null}
        <span
          className={`max-w-full break-words rounded-lg border px-2.5 py-1 ${presetChipClasses}`}
        >
          Working {formatTime(selectedExerciseSeconds)} +{TIMER_SETUP_BUFFER_SEC}s
        </span>
        <span
          className={`max-w-full break-words rounded-lg border px-2.5 py-1 ${presetChipClasses}`}
        >
          Resting {formatTime(selectedRestSeconds)}
        </span>
      </div>
    </div>
  );
}
