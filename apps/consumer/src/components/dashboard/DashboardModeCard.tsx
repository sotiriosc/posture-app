"use client";

type DashboardModeCardProps = {
  title: string;
  summary: string;
  icon?: string;
  active: boolean;
  locked?: boolean;
  lockReason?: string;
  onClick: () => void;
};

export default function DashboardModeCard({
  title,
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
          ? "border-sky-200/60 bg-[linear-gradient(135deg,rgba(56,189,248,0.22),rgba(30,41,59,0.52))] shadow-[0_20px_54px_rgba(14,165,233,0.2)]"
          : locked
          ? "border-slate-500/16 bg-slate-950/28"
          : "border-white/10 bg-slate-950/44 hover:border-sky-200/25 hover:bg-slate-900/62"
      }`}
    >
      <div className="flex h-full flex-col justify-center gap-5">
        <div>
          {/* Phase 6d, Commit 3 — a small inline lock icon reads as
              "aspirational, not broken"; the old full-line uppercase
              "LOCKED" badge sat louder than the title it was labeling. */}
          <h3 className={`flex items-center gap-2 text-lg font-semibold ${locked ? "text-slate-400" : "text-white"}`}>
            {icon ? (
              <span aria-hidden="true" className="text-xl leading-none">
                {icon}
              </span>
            ) : null}
            {title}
            {locked ? (
              <span
                aria-label="Locked"
                title="Locked"
                className="text-sm leading-none text-slate-500"
              >
                {"\u{1F512}"}
              </span>
            ) : null}
          </h3>
          <p className={`mt-2 line-clamp-2 text-sm leading-5 ${locked ? "text-slate-500" : "text-slate-300"}`}>
            {locked ? lockReason ?? summary : summary}
          </p>
        </div>
      </div>
    </button>
  );
}
