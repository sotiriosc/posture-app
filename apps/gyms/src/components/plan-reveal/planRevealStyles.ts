/** Shared Phase 8 motion + target tokens (consumer). Gyms mirrors intentionally. */
export const PLAN_REVEAL_MOTION_MS = 180;

export const planRevealTransition =
  "transition-[opacity,transform,border-color,background-color] duration-[180ms] ease-out motion-reduce:transition-none";

export const planRevealPillBase =
  "inline-flex min-h-11 items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950";
