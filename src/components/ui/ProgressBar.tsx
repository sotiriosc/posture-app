import { useEffect, useMemo, useRef, useState } from "react";

type ProgressBarProps = {
  label: string;
  value: number;
  max?: number;
  subtitle?: string;
  showPercent?: boolean;
  compact?: boolean;
  variant?: "default" | "mini";
  animate?: boolean;
};

export default function ProgressBar({
  label,
  value,
  max = 100,
  subtitle,
  showPercent = true,
  compact = false,
  variant = "default",
  animate = true,
}: ProgressBarProps) {
  const percent = useMemo(() => {
    if (!Number.isFinite(value) || !Number.isFinite(max) || max <= 0) return 0;
    return Math.max(0, Math.min(100, Math.round((value / max) * 100)));
  }, [value, max]);
  const [displayedPercent, setDisplayedPercent] = useState(animate ? 0 : percent);
  const [flashProgress, setFlashProgress] = useState(false);
  const hasMountedRef = useRef(false);
  const previousPercentRef = useRef<number | null>(null);

  useEffect(() => {
    let frame = 0;
    if (!animate) {
      frame = window.requestAnimationFrame(() => {
        setDisplayedPercent(percent);
      });
      return () => window.cancelAnimationFrame(frame);
    }
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      frame = window.requestAnimationFrame(() => {
        setDisplayedPercent(percent);
      });
      return () => window.cancelAnimationFrame(frame);
    }
    frame = window.requestAnimationFrame(() => {
      setDisplayedPercent(percent);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [percent, animate]);

  useEffect(() => {
    const previousPercent = previousPercentRef.current;
    previousPercentRef.current = percent;
    if (previousPercent === null) return;
    if (percent <= previousPercent) return;

    const flashFrame = window.requestAnimationFrame(() => {
      setFlashProgress(true);
    });
    const timer = window.setTimeout(() => {
      setFlashProgress(false);
    }, 800);

    return () => {
      window.cancelAnimationFrame(flashFrame);
      window.clearTimeout(timer);
    };
  }, [percent]);

  return (
    <div className={compact ? "space-y-1" : "space-y-1.5"}>
      <div className="flex items-center justify-between gap-2 text-xs">
        <p className="font-medium text-slate-700">{label}</p>
        {showPercent ? <span className="text-slate-500">{percent}%</span> : null}
      </div>
      <div
        className={`w-full overflow-hidden rounded-full border border-slate-300/70 bg-slate-200/80 ${
          variant === "mini" ? "h-2" : "h-2.5"
        }`}
      >
        <div
          className={`progress-fill h-full rounded-full bg-gradient-to-r from-slate-600 via-slate-500 to-slate-400 transition-[width,filter] duration-[700ms] ease-[cubic-bezier(.22,1,.36,1)] ${
            flashProgress ? "progress-flash" : ""
          }`}
          style={{ width: `${displayedPercent}%` }}
        />
      </div>
      {subtitle ? <p className="text-[11px] text-slate-500">{subtitle}</p> : null}
      <style jsx>{`
        .progress-flash {
          animation: progressFlash 800ms ease-out;
        }

        @keyframes progressFlash {
          0% {
            filter: brightness(1.24) saturate(1.2);
          }
          100% {
            filter: brightness(1) saturate(1);
          }
        }
      `}</style>
    </div>
  );
}
