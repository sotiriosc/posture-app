"use client";

import { useEffect, useMemo, useState } from "react";

type AnimatedCountProps = {
  value: number;
  durationMs?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
};

const easeOutCubic = (progress: number) => 1 - (1 - progress) ** 3;

export default function AnimatedCount({
  value,
  durationMs = 300,
  decimals = 0,
  prefix,
  suffix,
  className,
}: AnimatedCountProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const target = Number.isFinite(value) ? value : 0;
    let frame = 0;
    const startedAt = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startedAt;
      const progress = Math.min(1, elapsed / Math.max(1, durationMs));
      const eased = easeOutCubic(progress);
      setDisplayValue(target * eased);
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [durationMs, value]);

  const formatted = useMemo(() => {
    if (decimals > 0) return displayValue.toFixed(decimals);
    return Math.round(displayValue).toString();
  }, [decimals, displayValue]);

  return (
    <span className={className}>
      {prefix ?? ""}
      {formatted}
      {suffix ?? ""}
    </span>
  );
}
