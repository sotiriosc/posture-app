"use client";

import { useEffect, useMemo, useRef, useState } from "react";

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
};

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const clampDuration = (value: number, mode: TimerMode) => {
  const min = mode === "exercise" ? 15 : 30;
  const max = mode === "exercise" ? 180 : 300;
  return Math.min(max, Math.max(min, value));
};

const getCurrentTimestampMs = () => Date.now();

const reconcileRuntimeState = (
  state: DualModeTimerRuntimeState | null | undefined
): DualModeTimerRuntimeState | null => {
  if (!state) return null;

  const exerciseSeconds = clampDuration(state.exerciseSeconds, "exercise");
  const restSeconds = clampDuration(state.restSeconds, "rest");
  const now = getCurrentTimestampMs();
  const baseline = Math.max(0, Math.floor(state.remainingSeconds));

  if (!state.running || !state.updatedAtMs) {
    return {
      ...state,
      remainingSeconds: baseline,
      exerciseSeconds,
      restSeconds,
      updatedAtMs: now,
    };
  }

  const elapsedSeconds = Math.max(0, Math.floor((now - state.updatedAtMs) / 1000));
  if (elapsedSeconds <= 0) {
    return {
      ...state,
      remainingSeconds: baseline,
      exerciseSeconds,
      restSeconds,
      updatedAtMs: now,
    };
  }

  if (state.mode === "exercise") {
    if (elapsedSeconds < baseline) {
      return {
        ...state,
        remainingSeconds: baseline - elapsedSeconds,
        exerciseSeconds,
        restSeconds,
        updatedAtMs: now,
      };
    }
    const elapsedIntoRest = elapsedSeconds - baseline;
    if (elapsedIntoRest < restSeconds) {
      return {
        ...state,
        mode: "rest",
        running: true,
        remainingSeconds: restSeconds - elapsedIntoRest,
        exerciseSeconds,
        restSeconds,
        updatedAtMs: now,
      };
    }
    return {
      ...state,
      mode: "rest",
      running: false,
      remainingSeconds: 0,
      exerciseSeconds,
      restSeconds,
      updatedAtMs: now,
    };
  }

  if (elapsedSeconds < baseline) {
    return {
      ...state,
      remainingSeconds: baseline - elapsedSeconds,
      exerciseSeconds,
      restSeconds,
      updatedAtMs: now,
    };
  }
  return {
    ...state,
    mode: "rest",
    running: false,
    remainingSeconds: 0,
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
  const [remainingSeconds, setRemainingSeconds] = useState(
    reconciledPersistedState?.remainingSeconds ??
      (defaultMode === "exercise" ? initialExerciseSeconds : initialRestSeconds)
  );
  const modeRef = useRef<TimerMode>(
    reconciledPersistedState?.mode ?? defaultMode
  );
  const runningRef = useRef<boolean>(
    reconciledPersistedState?.running ?? false
  );
  const remainingRef = useRef<number>(
    reconciledPersistedState?.remainingSeconds ??
      (defaultMode === "exercise" ? initialExerciseSeconds : initialRestSeconds)
  );
  const selectedExerciseRef = useRef<number>(
    reconciledPersistedState?.exerciseSeconds ?? initialExerciseSeconds
  );
  const selectedRestRef = useRef<number>(
    reconciledPersistedState?.restSeconds ?? initialRestSeconds
  );
  const lastRunningRef = useRef(false);
  const lastRemainingRef = useRef(remainingSeconds);
  const autoSwitchRef = useRef(false);
  const runtimeAnchorMsRef = useRef<number>(
    reconciledPersistedState?.updatedAtMs ?? getCurrentTimestampMs()
  );

  const activeSelectedSeconds =
    mode === "exercise" ? selectedExerciseSeconds : selectedRestSeconds;
  const safeSelectedSeconds = Math.max(1, activeSelectedSeconds);
  const completionRatio = Math.min(
    1,
    Math.max(0, 1 - remainingSeconds / safeSelectedSeconds)
  );
  const progressPercent = Math.round(completionRatio * 100);
  const sliderMin = mode === "exercise" ? 15 : 30;
  const sliderMax = mode === "exercise" ? 180 : 300;
  const isExerciseMode = mode === "exercise";

  const accentClasses =
    isExerciseMode
      ? "border-sky-300/60 bg-sky-100 text-sky-900"
      : "border-amber-300/60 bg-amber-100 text-amber-900";
  const modeBackground = isExerciseMode
    ? "border-sky-200/70 bg-sky-50/80"
    : "border-amber-200/80 bg-amber-50/85";
  const runningAccent = isExerciseMode
    ? "shadow-sky-500/28 ring-sky-400/40"
    : "shadow-yellow-500/38 ring-yellow-300/55";
  const activeModeButtonClasses =
    isExerciseMode
      ? "bg-sky-600 text-white shadow-[0_6px_16px_rgba(2,132,199,0.28)]"
      : "bg-amber-500 text-slate-900 shadow-[0_6px_16px_rgba(245,158,11,0.26)]";
  const sliderAccentClass = isExerciseMode ? "accent-sky-600" : "accent-amber-500";
  const timerFaceBackground = isExerciseMode
    ? "bg-[radial-gradient(circle_at_30%_24%,rgba(255,255,255,.98)_0%,rgba(224,242,254,.96)_46%,rgba(125,211,252,.9)_70%,rgba(30,64,175,.58)_100%)]"
    : "bg-[radial-gradient(circle_at_28%_22%,rgba(255,255,255,.99)_0%,rgba(255,247,214,.98)_36%,rgba(253,224,71,.95)_58%,rgba(251,146,60,.88)_78%,rgba(172,94,35,.74)_100%)]";
  const ringGradient = isExerciseMode
    ? "conic-gradient(from 180deg at 50% 50%, rgba(191,219,254,0.98), rgba(56,189,248,0.96), rgba(37,99,235,0.92), rgba(15,23,42,0.9), rgba(191,219,254,0.98))"
    : "conic-gradient(from 180deg at 50% 50%, rgba(255,254,240,0.99), rgba(250,204,21,0.98), rgba(245,158,11,0.95), rgba(236,72,153,0.75), rgba(124,58,237,0.62), rgba(255,254,240,0.99))";
  const ringProgress = isExerciseMode
    ? `conic-gradient(from -90deg at 50% 50%, rgba(14,116,234,0.99) 0 ${progressPercent}%, rgba(15,23,42,0.34) ${progressPercent}% 100%)`
    : `conic-gradient(from -90deg at 50% 50%, rgba(255,215,64,0.99) 0 ${progressPercent}%, rgba(30,27,45,0.34) ${progressPercent}% 100%)`;
  const ringShadow = isExerciseMode
    ? "0 14px 30px rgba(14,116,234,0.34)"
    : "0 16px 32px rgba(234,179,8,0.36), 0 0 22px rgba(236,72,153,0.2)";
  const polarShellClasses =
    isExerciseMode
      ? "border-sky-500/45 bg-[linear-gradient(145deg,rgba(2,6,23,0.97),rgba(7,25,51,0.95))] text-sky-50"
      : "border-amber-500/60 bg-[linear-gradient(145deg,rgba(24,14,5,0.97),rgba(58,32,8,0.95))] text-amber-50";
  const secondaryTextClass = isExerciseMode ? "text-sky-100/95" : "text-amber-100/95";
  const neutralPillClasses =
    isExerciseMode
      ? "border-slate-700 bg-slate-950/60"
      : "border-amber-900/50 bg-slate-950/45";
  const inactiveModeButtonClasses =
    isExerciseMode
      ? "text-slate-300 hover:bg-slate-800 hover:text-sky-100"
      : "text-amber-100/85 hover:bg-amber-950/35 hover:text-amber-50";
  const timerButtonFrameClasses = isExerciseMode
    ? "border-[5px] border-sky-900/80 text-sky-950 shadow-[0_14px_30px_rgba(14,116,234,0.24)]"
    : "border-[5px] border-amber-900/80 text-amber-950 shadow-[0_14px_30px_rgba(234,179,8,0.3)]";
  const timerInnerRingClasses = isExerciseMode
    ? "border border-sky-900/35"
    : "border border-amber-900/35";
  const timerInnerShadeClasses = isExerciseMode
    ? "shadow-[inset_0_8px_14px_rgba(255,255,255,0.2),inset_0_-12px_16px_rgba(2,6,23,0.24)]"
    : "shadow-[inset_0_8px_14px_rgba(255,255,255,0.32),inset_0_-12px_16px_rgba(120,53,15,0.24)]";
  const timerTopGlowClasses = isExerciseMode
    ? "bg-white/22"
    : "bg-white/36";
  const timerNeedleDotClasses = isExerciseMode
    ? "bg-sky-950/90"
    : "bg-amber-950/90";
  const progressBadgeClasses = isExerciseMode
    ? "rounded-full border border-sky-300/70 bg-sky-100/95 px-2 py-0.5 text-[11px] font-semibold text-sky-900"
    : "rounded-full border border-amber-300/80 bg-amber-200/95 px-2 py-0.5 text-[11px] font-semibold text-amber-950";

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
    const remainingNow = remainingRef.current;
    if (!runningNow || remainingNow <= 0) return;
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
    if (reconciled.mode !== modeRef.current) {
      modeRef.current = reconciled.mode;
      setMode(reconciled.mode);
    }
    if (reconciled.running !== runningRef.current) {
      runningRef.current = reconciled.running;
      setRunning(reconciled.running);
    }
    if (reconciled.remainingSeconds !== remainingRef.current) {
      remainingRef.current = reconciled.remainingSeconds;
      setRemainingSeconds(reconciled.remainingSeconds);
    }
  };

  useEffect(() => {
    if (!running || remainingSeconds <= 0) return;
    const timer = window.setInterval(() => {
      reconcileElapsedRuntime();
    }, 250);
    return () => window.clearInterval(timer);
  }, [running, remainingSeconds]);

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

  useEffect(() => {
    if (remainingSeconds !== 0) return;
    if (mode === "exercise") {
      autoSwitchRef.current = true;
      runtimeAnchorMsRef.current = getCurrentTimestampMs();
      modeRef.current = "rest";
      runningRef.current = true;
      remainingRef.current = selectedRestSeconds;
      queueMicrotask(() => {
        setMode("rest");
        setRemainingSeconds(selectedRestSeconds);
        setRunning(true);
      });
      return;
    }
    runtimeAnchorMsRef.current = getCurrentTimestampMs();
    runningRef.current = false;
    queueMicrotask(() => {
      setRunning(false);
    });
  }, [mode, remainingSeconds, selectedRestSeconds]);

  const handleModeChange = (nextMode: TimerMode) => {
    if (nextMode === mode) return;
    autoSwitchRef.current = false;
    runtimeAnchorMsRef.current = getCurrentTimestampMs();
    modeRef.current = nextMode;
    runningRef.current = false;
    remainingRef.current =
      nextMode === "exercise"
        ? selectedExerciseRef.current
        : selectedRestRef.current;
    setRunning(false);
    setMode(nextMode);
    setRemainingSeconds(
      nextMode === "exercise"
        ? selectedExerciseSeconds
        : selectedRestSeconds
    );
  };

  const applyExerciseSeconds = (seconds: number) => {
    const next = clampDuration(seconds, "exercise");
    setSelectedExerciseSeconds(next);
    selectedExerciseRef.current = next;
    if (mode === "exercise" && !running) setRemainingSeconds(next);
    if (mode === "exercise" && !running) {
      remainingRef.current = next;
      runtimeAnchorMsRef.current = getCurrentTimestampMs();
    }
    return next;
  };

  const applyRestSeconds = (seconds: number) => {
    const next = clampDuration(seconds, "rest");
    setSelectedRestSeconds(next);
    selectedRestRef.current = next;
    if (mode === "rest" && !running) setRemainingSeconds(next);
    if (mode === "rest" && !running) {
      remainingRef.current = next;
      runtimeAnchorMsRef.current = getCurrentTimestampMs();
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
    remainingRef.current = activeSelectedSeconds;
    setRunning(false);
    setRemainingSeconds(activeSelectedSeconds);
  };

  const playBeep = (type: "start" | "finish") => {
    if (typeof window === "undefined") return;
    try {
      const context = new AudioContext();
      const now = context.currentTime;

      if (type === "start") {
        const osc = context.createOscillator();
        const gain = context.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
        gain.gain.setValueAtTime(0.12, now);
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
        gain.gain.setValueAtTime(0.08, now);
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

    if (!wasRunning && running && remainingSeconds > 0) {
      playBeep("start");
    }

    if (wasRemaining > 0 && remainingSeconds === 0) {
      playBeep("finish");
    }

    lastRunningRef.current = running;
    lastRemainingRef.current = remainingSeconds;
  }, [running, remainingSeconds]);

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
              className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                mode === value
                  ? activeModeButtonClasses
                  : inactiveModeButtonClasses
              }`}
            >
              {value === "exercise" ? "Movement pattern focus" : "Rest"}
            </button>
          ))}
        </div>
        <div
          className={`rounded-full border px-3 py-1 text-xs font-semibold ${accentClasses}`}
        >
          {mode === "exercise" ? "Movement pattern focus mode" : "Rest mode"}
        </div>
      </div>

      <div className="mt-4 flex justify-center">
        <div className="relative h-56 w-56 sm:h-64 sm:w-64">
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
          className={`relative z-10 m-[10px] flex h-[calc(100%-20px)] w-[calc(100%-20px)] items-center justify-center overflow-hidden rounded-full text-5xl font-semibold transition sm:text-6xl ${timerButtonFrameClasses} ${timerFaceBackground} ${
            running ? `ring-4 motion-safe:animate-pulse ${runningAccent}` : ""
          }`}
          >
            <span className={`pointer-events-none absolute inset-[6px] rounded-full ${timerInnerRingClasses}`} />
            <span className={`pointer-events-none absolute inset-[9px] rounded-full ${timerInnerShadeClasses}`} />
            <span className={`pointer-events-none absolute top-8 left-10 h-6 w-20 rounded-full blur-sm ${timerTopGlowClasses}`} />
            <span className={`pointer-events-none absolute top-5 h-2 w-2 rounded-full ${timerNeedleDotClasses}`} />
            {formatTime(remainingSeconds)}
          </button>
        </div>
      </div>

      <div className={`mt-3 flex items-center justify-between text-xs font-semibold ${secondaryTextClass}`}>
        <span>{running ? "Tap to pause" : "Tap to start"}</span>
        <span
          className={progressBadgeClasses}
        >
          Pattern proficiency {progressPercent}%
        </span>
        <button
          type="button"
          onClick={resetTimer}
          className={`${secondaryTextClass} underline-offset-4 hover:underline`}
        >
          Reset
        </button>
      </div>
      <p className={`mt-2 text-center text-[11px] font-medium ${secondaryTextClass}`}>
        Stay controlled and aligned.
      </p>

      <div className="mt-4">
        <div className={`flex items-center justify-between text-xs font-semibold ${secondaryTextClass}`}>
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
        />
      </div>

      <div className={`mt-4 flex flex-wrap gap-3 text-xs font-semibold ${secondaryTextClass}`}>
        <span>Movement pattern focus: {formatTime(selectedExerciseSeconds)}</span>
        <span>Rest: {formatTime(selectedRestSeconds)}</span>
      </div>
    </div>
  );
}
