import type { ReactNode, SVGProps } from "react";

export type B2BIconName =
  | "assessment"
  | "plan"
  | "coach"
  | "handoff"
  | "dashboard"
  | "metrics"
  | "library"
  | "pilot"
  | "system";

type B2BIconProps = Omit<SVGProps<SVGSVGElement>, "children"> & {
  name: B2BIconName;
  size?: number | string;
  title?: string;
};

const iconPaths: Record<B2BIconName, ReactNode> = {
  assessment: (
    <>
      <rect x="4" y="3" width="16" height="18" rx="2.5" />
      <path d="M8 8h8" />
      <path d="M8 12h6" />
      <path d="M8 16h4" />
      <path d="m14.5 16.5 1.7 1.7 3-3" />
    </>
  ),
  plan: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="2.5" />
      <path d="M8 3.5v3" />
      <path d="M16 3.5v3" />
      <path d="M4 9h16" />
      <path d="M8 13h8" />
      <path d="M8 17h5" />
    </>
  ),
  coach: (
    <>
      <circle cx="8.5" cy="8.5" r="3" />
      <path d="M3.5 18.5c0-2.8 2.2-5 5-5s5 2.2 5 5" />
      <path d="M15 6.5h4a2 2 0 0 1 2 2V11a2 2 0 0 1-2 2h-1.5l-2.5 2v-2h-1a2 2 0 0 1-2-2v-1" />
    </>
  ),
  handoff: (
    <>
      <path d="M3 7h9" />
      <path d="m9 3 4 4-4 4" />
      <path d="M21 17h-9" />
      <path d="m15 13-4 4 4 4" />
    </>
  ),
  dashboard: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <path d="M3 9h18" />
      <path d="M8 13v4" />
      <path d="M12 11v6" />
      <path d="M16 14v3" />
    </>
  ),
  metrics: (
    <>
      <path d="M4 19h16" />
      <path d="M6 15.5 10 11l3 3 5-6" />
      <circle cx="10" cy="11" r="1" />
      <circle cx="13" cy="14" r="1" />
      <circle cx="18" cy="8" r="1" />
    </>
  ),
  library: (
    <>
      <rect x="4" y="4" width="4" height="16" rx="1.3" />
      <rect x="10" y="4" width="4" height="16" rx="1.3" />
      <path d="M16 5.5h3A1.5 1.5 0 0 1 20.5 7v11A1.5 1.5 0 0 1 19 19h-3Z" />
      <path d="M5.5 8h1" />
      <path d="M11.5 10h1" />
      <path d="M17 9h2" />
    </>
  ),
  pilot: (
    <>
      <path d="M6 20V4" />
      <path d="M7 4h10l-1.8 3L17 10H7" />
      <circle cx="18.5" cy="17.5" r="2.5" />
      <path d="M18.5 15.8v3.4" />
      <path d="M16.8 17.5h3.4" />
    </>
  ),
  system: (
    <>
      <circle cx="6" cy="6" r="2.5" />
      <circle cx="18" cy="6" r="2.5" />
      <circle cx="12" cy="18" r="2.5" />
      <path d="M8.2 7.2 10.7 15" />
      <path d="M15.8 7.2 13.3 15" />
      <path d="M8.5 6h7" />
    </>
  ),
};

export default function B2BIcon({
  name,
  size = 24,
  title,
  className,
  ...props
}: B2BIconProps) {
  const isDecorative = !title;

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role={isDecorative ? undefined : "img"}
      aria-hidden={isDecorative}
      aria-label={title}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      {iconPaths[name]}
    </svg>
  );
}
