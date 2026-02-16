"use client";

import { useEffect, useMemo, useState } from "react";

interface ReadinessIndicatorProps {
  score: number; // 0–100
}

const SIZE = 56;
const STROKE_WIDTH = 5;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const clampScore = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

const easeOutCubic = (value: number) => 1 - (1 - value) ** 3;

const getReadinessColor = (score: number) => {
  if (score >= 80) return "#16a34a";
  if (score >= 55) return "#2563eb";
  if (score >= 0) return "#d97706";
  return "#64748b";
};

const getReadinessLabel = (score: number) => {
  if (score >= 80) return "Ready";
  if (score >= 55) return "Good";
  return "Caution";
};

export default function ReadinessIndicator({ score }: ReadinessIndicatorProps) {
  const safeScore = useMemo(() => clampScore(score), [score]);
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    let frameId = 0;
    const durationMs = 260;
    const startAt = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startAt;
      const progress = Math.min(1, elapsed / durationMs);
      const eased = easeOutCubic(progress);
      setAnimatedScore(Math.round(safeScore * eased));
      if (progress < 1) {
        frameId = window.requestAnimationFrame(tick);
      }
    };

    frameId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [safeScore]);

  const color = getReadinessColor(safeScore);
  const dashOffset = CIRCUMFERENCE - (animatedScore / 100) * CIRCUMFERENCE;

  return (
    <div className="flex items-center gap-3">
      <div className="relative h-14 w-14 shrink-0">
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="-rotate-90"
          aria-label={`Readiness for corrective progress ${animatedScore}%`}
        >
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={STROKE_WIDTH}
          />
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={color}
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
          />
        </svg>
      </div>
      <div className="space-y-0.5">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
          Readiness for Corrective Progress
        </p>
        <p className="text-xl font-semibold text-slate-900">{animatedScore}%</p>
        <p className="text-xs text-slate-600">{getReadinessLabel(safeScore)}</p>
      </div>
    </div>
  );
}
