import type { ReactElement, SVGProps } from "react";

export type DashboardModeIconName =
  | "today"
  | "week"
  | "progress"
  | "insights"
  | "history"
  | "account";

/**
 * Bespoke line-icon set for the dashboard mode tiles — replaces the stock
 * emoji so the grid reads as a designed product surface rather than a default
 * one. All icons share a 24×24 grid, 1.75 stroke, round caps/joins, and draw
 * in `currentColor` so the tile controls their tint (accent when active,
 * muted when locked).
 */

const shapes: Record<DashboardModeIconName, ReactElement> = {
  // Dumbbell — "today's session / do the work".
  today: (
    <>
      <path d="M6.5 8v8M4 10v4M17.5 8v8M20 10v4" />
      <path d="M6.5 12h11" />
    </>
  ),
  // Calendar with a marked day.
  week: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
      <path d="M3.5 9.5h17M8 3.5v3.5M16 3.5v3.5" />
      <path d="M7.5 13.5h3v3h-3z" />
    </>
  ),
  // Trending line with an arrow head — measurable progress.
  progress: (
    <>
      <path d="M4 19V5" />
      <path d="M4 15.5l4.5-4.5 3.5 3.5 6-6.5" />
      <path d="M17 5h3v3" />
    </>
  ),
  // Connected nodes — pattern / relationship analysis.
  insights: (
    <>
      <path d="M6.5 16.5 11 8.5M13 8.5l4.5 6" />
      <circle cx="6" cy="17.5" r="2" />
      <circle cx="12" cy="7" r="2" />
      <circle cx="18" cy="16.5" r="2" />
    </>
  ),
  // Clock with a rewind arc — session history.
  history: (
    <>
      <path d="M4.75 8.5A8 8 0 1 1 4 12" />
      <path d="M4.5 4.5v4h4" />
      <path d="M12 8.5V12l2.5 2" />
    </>
  ),
  // Card — billing / account.
  account: (
    <>
      <rect x="3" y="6" width="18" height="12" rx="2.5" />
      <path d="M3 10h18" />
      <path d="M6.5 14.5h4" />
    </>
  ),
};

type DashboardModeIconProps = SVGProps<SVGSVGElement> & {
  name: DashboardModeIconName;
};

export default function DashboardModeIcon({
  name,
  ...props
}: DashboardModeIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {shapes[name]}
    </svg>
  );
}
