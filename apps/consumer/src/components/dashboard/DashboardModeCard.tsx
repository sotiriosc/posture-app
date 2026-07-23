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
      className={`group relative flex min-h-[150px] flex-col gap-3.5 rounded-2xl p-4 text-left ring-1 ring-inset transition duration-200 ${
        active
          ? "bg-[linear-gradient(150deg,rgba(56,189,248,0.16),rgba(56,189,248,0.02))] ring-sky-300/40"
          : locked
          ? "bg-white/[0.02] ring-white/[0.05]"
          : "bg-white/[0.035] ring-white/[0.07] hover:-translate-y-0.5 hover:bg-white/[0.06] hover:ring-white/[0.12]"
      }`}
    >
      <span
        className={`grid h-10 w-10 place-items-center rounded-xl ring-1 ring-inset transition ${
          active
            ? "bg-sky-400/15 text-sky-200 ring-sky-300/30"
            : locked
            ? "bg-slate-800/40 text-slate-500 ring-white/[0.06]"
            : "bg-slate-800/70 text-sky-300 ring-white/10 group-hover:text-sky-200"
        }`}
      >
        <DashboardModeIcon name={iconName} className="h-5 w-5" />
      </span>

      <div>
        <h3 className="text-base font-semibold text-white sm:text-lg">{title}</h3>
        <p
          className={`mt-1 line-clamp-1 text-sm leading-5 sm:line-clamp-2 ${
            locked ? "text-slate-500" : "text-slate-400"
          }`}
        >
          {locked ? lockReason ?? summary : summary}
        </p>
      </div>

      {/* Small lock, floated top-right — reads as "aspirational, not broken"
          (no loud "LOCKED" badge). Kept last in the DOM so it doesn't lead the
          tile's accessible name. */}
      {locked ? (
        <span
          aria-label="Locked"
          title="Locked"
          className="absolute right-3.5 top-3.5 text-slate-500"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="h-3.5 w-3.5"
          >
            <rect x="5" y="11" width="14" height="9" rx="2" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
          </svg>
        </span>
      ) : null}
    </button>
  );
}
