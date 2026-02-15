import { useMemo } from "react";

type ProgressBarProps = {
  label: string;
  value: number;
  max?: number;
  subtitle?: string;
  showPercent?: boolean;
  compact?: boolean;
  variant?: "default" | "mini";
};

export default function ProgressBar({
  label,
  value,
  max = 100,
  subtitle,
  showPercent = true,
  compact = false,
  variant = "default",
}: ProgressBarProps) {
  const percent = useMemo(() => {
    if (!Number.isFinite(value) || !Number.isFinite(max) || max <= 0) return 0;
    return Math.max(0, Math.min(100, Math.round((value / max) * 100)));
  }, [value, max]);

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
          className="h-full rounded-full bg-gradient-to-r from-slate-600 via-slate-500 to-slate-400 transition-[width] duration-300 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
      {subtitle ? <p className="text-[11px] text-slate-500">{subtitle}</p> : null}
    </div>
  );
}
