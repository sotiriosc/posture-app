"use client";

import DashboardModeIcon, {
  type DashboardModeIconName,
} from "@/components/dashboard/DashboardModeIcon";

type DashboardModeCardProps = {
  title: string;
  summary: string;
  iconName: DashboardModeIconName;
  active: boolean;
  locked?: boolean;
  lockReason?: string;
  onClick: () => void;
};

export default function DashboardModeCard({
  title,
  summary,
  iconName,
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
      // Phase 6e, Commit 2 — the box/ring is reserved for the active tile only;
      // every other tile (locked or not) renders directly on the dashboard
      // background so the eye lands on icon + label first, boxes only where
      // selection actually matters.
      className={`group relative flex min-h-[150px] flex-col items-center justify-center gap-2 rounded-2xl px-3 py-4 text-center transition duration-200 ${
        active
          ? "bg-[linear-gradient(150deg,rgba(56,189,248,0.16),rgba(56,189,248,0.02))] ring-1 ring-inset ring-sky-300/40"
          : "hover:-translate-y-0.5 hover:bg-white/[0.04]"
      }`}
    >
      <span
        className={`grid h-11 w-11 place-items-center rounded-xl ring-1 ring-inset transition ${
          active
            ? "bg-sky-400/15 text-sky-200 ring-sky-300/30"
            : locked
            ? "bg-slate-800/40 text-slate-500 ring-white/[0.06]"
            : "bg-slate-800/70 text-sky-300 ring-white/10 group-hover:text-sky-200"
        }`}
      >
        <DashboardModeIcon name={iconName} className="h-6 w-6" />
      </span>

      <span className="flex items-center gap-1.5">
        <h3
          className={`text-sm font-semibold sm:text-base ${
            locked ? "text-slate-400" : "text-white"
          }`}
        >
          {title}
        </h3>
        {/* Lock sits inline next to the label rather than a full-width
            "LOCKED" pill or a floating badge — reads as "aspirational, not
            broken." Kept after the title text so it doesn't lead the tile's
            accessible name. */}
        {locked ? (
          <span aria-label="Locked" title="Locked" className="text-slate-500">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.75}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="h-3 w-3"
            >
              <rect x="5" y="11" width="14" height="9" rx="2" />
              <path d="M8 11V8a4 4 0 0 1 8 0v3" />
            </svg>
          </span>
        ) : null}
      </span>

      <p
        className={`line-clamp-1 text-xs leading-4 sm:text-sm ${
          locked ? "text-slate-500" : "text-slate-400"
        }`}
      >
        {locked ? lockReason ?? summary : summary}
      </p>
    </button>
  );
}
