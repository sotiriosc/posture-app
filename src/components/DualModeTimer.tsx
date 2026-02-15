"use client";

import { useEffect, useRef, useState } from "react";

export type TimerMode = "exercise" | "rest";

export type DualModeTimerRuntimeState = {
  mode: TimerMode;
  running: boolean;
  remainingSeconds: number;
  exerciseSeconds: number;
  restSeconds: number;
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

export default function DualModeTimer({
  initialExerciseSeconds = 60,
  initialRestSeconds = 60,
  onExerciseDurationChange,
  onRestDurationChange,
  defaultMode = "exercise",
  persistedState = null,
  onStateChange,
}: DualModeTimerProps) {
  const [mode, setMode] = useState<TimerMode>(
    persistedState?.mode ?? defaultMode
  );
  const [running, setRunning] = useState(persistedState?.running ?? false);
  const [selectedExerciseSeconds, setSelectedExerciseSeconds] = useState(
    persistedState?.exerciseSeconds ?? initialExerciseSeconds
  );
  const [selectedRestSeconds, setSelectedRestSeconds] = useState(
    persistedState?.restSeconds ?? initialRestSeconds
  );
  const [remainingSeconds, setRemainingSeconds] = useState(
    persistedState?.remainingSeconds ??
      (defaultMode === "exercise" ? initialExerciseSeconds : initialRestSeconds)
  );
  const lastRunningRef = useRef(false);
  const lastRemainingRef = useRef(remainingSeconds);
  const autoSwitchRef = useRef(false);

  const activeSelectedSeconds =
    mode === "exercise" ? selectedExerciseSeconds : selectedRestSeconds;
  const sliderMin = mode === "exercise" ? 15 : 30;
  const sliderMax = mode === "exercise" ? 180 : 300;

  const accentClasses =
    mode === "exercise"
      ? "border-emerald-300/60 bg-emerald-100 text-emerald-900"
      : "border-violet-300/60 bg-violet-100 text-violet-900";
  const modeBackground =
    mode === "exercise"
      ? "border-emerald-200/70 bg-emerald-50/80"
      : "border-violet-200/70 bg-violet-50/80";
  const runningAccent =
    mode === "exercise"
      ? "shadow-emerald-500/20 ring-emerald-400/30"
      : "shadow-violet-500/20 ring-violet-400/30";
  const ringGradient =
    mode === "exercise"
      ? "conic-gradient(from 180deg at 50% 50%, rgba(16,185,129,0.92), rgba(52,211,153,0.42), rgba(59,130,246,0.52), rgba(16,185,129,0.92))"
      : "conic-gradient(from 180deg at 50% 50%, rgba(124,58,237,0.88), rgba(167,139,250,0.42), rgba(59,130,246,0.5), rgba(124,58,237,0.88))";
  const ringShadow =
    mode === "exercise"
      ? "0 10px 24px rgba(16,185,129,0.24)"
      : "0 10px 24px rgba(124,58,237,0.22)";

  useEffect(() => {
    if (persistedState) return;
    setSelectedExerciseSeconds(initialExerciseSeconds);
  }, [initialExerciseSeconds, persistedState]);

  useEffect(() => {
    if (persistedState) return;
    setSelectedRestSeconds(initialRestSeconds);
  }, [initialRestSeconds, persistedState]);

  useEffect(() => {
    if (persistedState) {
      setMode(persistedState.mode);
      setRunning(persistedState.running);
      setRemainingSeconds(persistedState.remainingSeconds);
      setSelectedExerciseSeconds(persistedState.exerciseSeconds);
      setSelectedRestSeconds(persistedState.restSeconds);
    } else {
      setRunning(false);
      autoSwitchRef.current = false;
      setMode(defaultMode);
      setRemainingSeconds(
        defaultMode === "exercise" ? initialExerciseSeconds : initialRestSeconds
      );
      setSelectedExerciseSeconds(initialExerciseSeconds);
      setSelectedRestSeconds(initialRestSeconds);
    }
    lastRunningRef.current = false;
    lastRemainingRef.current = persistedState
      ? persistedState.remainingSeconds
      : defaultMode === "exercise"
      ? initialExerciseSeconds
      : initialRestSeconds;
  }, [defaultMode, initialExerciseSeconds, initialRestSeconds, persistedState]);

  useEffect(() => {
    if (!running || remainingSeconds <= 0) return;
    const timer = window.setInterval(() => {
      setRemainingSeconds((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [running, remainingSeconds]);

  useEffect(() => {
    if (remainingSeconds !== 0) return;
    if (mode === "exercise") {
      autoSwitchRef.current = true;
      setMode("rest");
      setRemainingSeconds(selectedRestSeconds);
      setRunning(true);
      return;
    }
    setRunning(false);
  }, [mode, remainingSeconds, selectedRestSeconds]);

  const handleModeChange = (nextMode: TimerMode) => {
    if (nextMode === mode) return;
    autoSwitchRef.current = false;
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
    if (mode === "exercise" && !running) setRemainingSeconds(next);
    onExerciseDurationChange?.(next);
  };

  const applyRestSeconds = (seconds: number) => {
    const next = clampDuration(seconds, "rest");
    setSelectedRestSeconds(next);
    if (mode === "rest" && !running) setRemainingSeconds(next);
    onRestDurationChange?.(next);
  };

  const applyForMode = (seconds: number) => {
    if (mode === "exercise") {
      applyExerciseSeconds(seconds);
    } else {
      applyRestSeconds(seconds);
    }
  };

  const resetTimer = () => {
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
      className={`rounded-2xl border p-4 shadow-sm transition ${modeBackground}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-full border border-slate-200 bg-white p-1 shadow-sm">
          {(["exercise", "rest"] as TimerMode[]).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => handleModeChange(value)}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                mode === value
                  ? "bg-slate-900 text-white"
                  : "text-slate-700 hover:text-slate-900"
              }`}
            >
              {value === "exercise" ? "Exercise" : "Rest"}
            </button>
          ))}
        </div>
        <div
          className={`rounded-full border px-3 py-1 text-xs font-semibold ${accentClasses}`}
        >
          {mode === "exercise" ? "Exercise mode" : "Rest mode"}
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
            className={`pointer-events-none absolute inset-[4px] rounded-full border border-white/70 ${modeBackground}`}
          />
          <button
            type="button"
            onClick={() => setRunning((prev) => !prev)}
            className={`relative z-10 m-[10px] flex h-[calc(100%-20px)] w-[calc(100%-20px)] items-center justify-center overflow-hidden rounded-full border-4 border-slate-900 text-5xl font-semibold text-slate-900 shadow-sm transition sm:text-6xl ${
              mode === "exercise" ? "bg-emerald-50/95" : "bg-violet-50/95"
            } ${running ? `ring-4 motion-safe:animate-pulse ${runningAccent}` : ""}`}
          >
            <span className="pointer-events-none absolute top-5 h-2 w-2 rounded-full bg-slate-900" />
            {formatTime(remainingSeconds)}
          </button>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs font-semibold text-slate-600">
        <span>{running ? "Tap to pause" : "Tap to start"}</span>
        <button
          type="button"
          onClick={resetTimer}
          className="text-slate-700 underline-offset-4 hover:text-slate-900 hover:underline"
        >
          Reset
        </button>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
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
          className="mt-3 w-full accent-slate-900"
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold text-slate-600">
        <span>Exercise: {formatTime(selectedExerciseSeconds)}</span>
        <span>Rest: {formatTime(selectedRestSeconds)}</span>
      </div>
    </div>
  );
}
