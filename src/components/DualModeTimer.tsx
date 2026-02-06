"use client";

import { useEffect, useRef, useState } from "react";

type TimerMode = "exercise" | "rest";

type DualModeTimerProps = {
  initialExerciseSeconds?: number;
  initialRestSeconds?: number;
  onExerciseDurationChange?: (seconds: number) => void;
  onRestDurationChange?: (seconds: number) => void;
  defaultMode?: TimerMode;
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
}: DualModeTimerProps) {
  const [mode, setMode] = useState<TimerMode>(defaultMode);
  const [running, setRunning] = useState(false);
  const [selectedExerciseSeconds, setSelectedExerciseSeconds] = useState(
    initialExerciseSeconds
  );
  const [selectedRestSeconds, setSelectedRestSeconds] = useState(
    initialRestSeconds
  );
  const [remainingSeconds, setRemainingSeconds] = useState(
    defaultMode === "exercise" ? initialExerciseSeconds : initialRestSeconds
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
      : "border-sky-300/60 bg-sky-100 text-sky-900";
  const modeBackground =
    mode === "exercise"
      ? "border-emerald-200/70 bg-emerald-50/80"
      : "border-sky-200/70 bg-sky-50/80";
  const runningAccent =
    mode === "exercise"
      ? "shadow-emerald-500/20 ring-emerald-400/30"
      : "shadow-sky-500/20 ring-sky-400/30";

  useEffect(() => {
    setSelectedExerciseSeconds(initialExerciseSeconds);
    if (mode === "exercise" && !running) {
      setRemainingSeconds(initialExerciseSeconds);
    }
  }, [initialExerciseSeconds, mode, running]);

  useEffect(() => {
    setSelectedRestSeconds(initialRestSeconds);
    if (mode === "rest" && !running) {
      setRemainingSeconds(initialRestSeconds);
    }
  }, [initialRestSeconds, mode, running]);

  useEffect(() => {
    setRunning(false);
    setRemainingSeconds(activeSelectedSeconds);
  }, [mode, activeSelectedSeconds]);

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
    if (mode === "exercise") setRemainingSeconds(next);
    onExerciseDurationChange?.(next);
  };

  const applyRestSeconds = (seconds: number) => {
    const next = clampDuration(seconds, "rest");
    setSelectedRestSeconds(next);
    if (mode === "rest") setRemainingSeconds(next);
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

  useEffect(() => {
    if (autoSwitchRef.current) {
      autoSwitchRef.current = false;
      return;
    }
    if (!running) {
      setRemainingSeconds(activeSelectedSeconds);
    }
  }, [activeSelectedSeconds, running]);

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

      <button
        type="button"
        onClick={() => setRunning((prev) => !prev)}
        className={`relative mt-4 flex w-full items-center justify-center overflow-hidden rounded-full border-4 border-slate-900 py-10 text-6xl font-semibold text-slate-900 shadow-sm transition ${modeBackground} ${
          running ? `ring-4 motion-safe:animate-pulse ${runningAccent}` : ""
        }`}
      >
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span
            className={`h-48 w-48 rounded-full border-2 border-dashed border-slate-300 ${
              running ? "motion-safe:animate-spin" : ""
            }`}
            style={{ animationDuration: "6s" }}
          />
        </span>
        <span className="pointer-events-none absolute top-6 h-2 w-2 rounded-full bg-slate-900" />
        {formatTime(remainingSeconds)}
      </button>

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
