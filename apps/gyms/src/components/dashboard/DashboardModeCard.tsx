"use client";

type DashboardModeCardProps = {
  title: string;
  summary: string;
  active: boolean;
  locked?: boolean;
  lockReason?: string;
  onClick: () => void;
};

export default function DashboardModeCard({
  title,
  summary,
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
        {locked ? (
          <div className="flex justify-end">
            <span className="rounded-lg border px-2.5 py-1 text-[10px] font-semibold uppercase praxis-card-muted text-slate-400">
              Locked
            </span>
          </div>
        ) : null}
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
