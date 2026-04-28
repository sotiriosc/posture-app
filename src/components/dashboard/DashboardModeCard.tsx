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
      className={`group min-h-[148px] rounded-lg border p-4 text-left ${
        active
          ? "praxis-selected-surface"
          : locked
          ? "praxis-card-muted opacity-60"
          : "praxis-card-muted hover:border-sky-200/25"
      }`}
    >
      <div className="flex h-full flex-col justify-between gap-5">
        <div className="flex items-start justify-between gap-3">
          <span
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border text-sm font-semibold ${
              active
                ? "border-sky-100/60 bg-sky-300/20 text-sky-50 shadow-[0_10px_28px_rgba(14,165,233,0.18)]"
                : locked
                ? "border-slate-500/20 bg-slate-950/35 text-slate-500"
                : "praxis-card text-slate-200"
            }`}
            aria-hidden="true"
          >
            {icon}
          </span>
          <span
            className={`rounded-lg border px-2.5 py-1 text-[10px] font-semibold uppercase ${
              locked
                ? "praxis-card-muted text-slate-400"
                : active
                ? "border-sky-100/50 bg-sky-200/12 text-sky-50"
                : "praxis-card-muted text-slate-300"
            }`}
          >
            {locked ? "Locked" : eyebrow}
          </span>
        </div>
        <div>
          <h3 className={`text-lg font-semibold ${locked ? "text-slate-300" : "text-white"}`}>
            {title}
          </h3>
          <p className={`mt-2 line-clamp-2 text-sm leading-5 ${locked ? "text-slate-500" : "text-slate-300"}`}>
            {locked ? lockReason ?? summary : summary}
          </p>
        </div>
      </div>
    </button>
  );
}
