"use client";

type DashboardModeCardProps = {
  title: string;
  eyebrow: string;
  summary: string;
  icon: string;
  active: boolean;
  locked?: boolean;
  lockReason?: string;
  onClick: () => void;
};

export default function DashboardModeCard({
  title,
  eyebrow,
  summary,
  icon,
  active,
  locked = false,
  lockReason,
  onClick,
}: DashboardModeCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-disabled={locked}
      className={`group min-h-[132px] rounded-lg border p-3 text-left transition ${
        active
          ? "border-sky-300/70 bg-sky-400/15 shadow-[0_16px_42px_rgba(14,165,233,0.18)]"
          : "border-white/10 bg-slate-950/44 hover:-translate-y-px hover:border-slate-300/25 hover:bg-slate-900/66"
      } ${locked ? "opacity-55" : ""}`}
    >
      <div className="flex h-full flex-col justify-between gap-4">
        <div className="flex items-start justify-between gap-3">
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border text-sm font-semibold ${
              active
                ? "border-sky-200/70 bg-sky-300/20 text-sky-50"
                : "border-slate-500/30 bg-slate-900/70 text-slate-200"
            }`}
            aria-hidden="true"
          >
            {icon}
          </span>
          <span
            className={`rounded-lg border px-2 py-1 text-[10px] font-semibold uppercase ${
              locked
                ? "border-amber-300/30 bg-amber-400/10 text-amber-100"
                : active
                ? "border-sky-200/50 bg-sky-200/10 text-sky-100"
                : "border-slate-500/25 bg-slate-950/40 text-slate-300"
            }`}
          >
            {locked ? "Locked" : eyebrow}
          </span>
        </div>
        <div>
          <h3 className="text-base font-semibold text-white">{title}</h3>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-300">
            {locked ? lockReason ?? summary : summary}
          </p>
        </div>
      </div>
    </button>
  );
}
