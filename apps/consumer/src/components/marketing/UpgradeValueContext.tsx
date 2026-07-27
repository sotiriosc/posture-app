/**
 * Phase 6L Commit 1 — paywall value math (SR-6L).
 * Honest comparison only; user does the math. No fake "$X value" badges.
 */

type UpgradeValueContextProps = {
  /** Tighter copy for the mobile upgrade banner — same facts, less bulk. */
  compact?: boolean;
};

export default function UpgradeValueContext({
  compact = false,
}: UpgradeValueContextProps) {
  if (compact) {
    return (
      <div
        className="mt-3 rounded-lg border border-slate-500/25 bg-slate-950/45 px-3 py-2.5"
        data-testid="upgrade-value-context"
      >
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          What this actually costs
        </p>
        <p className="mt-1.5 text-xs leading-snug text-slate-200">
          A good personal trainer runs $6,000–$15,000 a year. Praxis is $240.
        </p>
        <p className="mt-1 text-xs font-medium text-slate-100">
          $19.99/month. Cancel anytime.
        </p>
      </div>
    );
  }

  return (
    <div
      className="mt-4 rounded-lg border border-slate-500/25 bg-slate-950/45 px-3 py-3"
      data-testid="upgrade-value-context"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        What this actually costs
      </p>
      <p className="mt-2 text-sm leading-relaxed text-slate-200">
        A good personal trainer runs $6,000 to $15,000 a year. Praxis is $240.
      </p>
      <p className="mt-2 text-sm leading-relaxed text-slate-300">
        That&apos;s not because an app replaces a great coach — it&apos;s because most
        people don&apos;t have one, and everyone deserves a plan that adapts to
        their body and shows up every day.
      </p>
      <p className="mt-2 text-sm leading-relaxed text-slate-300">
        You&apos;re not paying for workouts. You&apos;re paying for structure that
        remembers every rep, notices what&apos;s changing, and adjusts before you
        plateau.
      </p>
      <p className="mt-3 text-sm font-medium text-slate-100">
        $19.99/month. Cancel anytime.
      </p>
    </div>
  );
}
