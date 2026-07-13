"use client";

export type PrSnapshot = {
  label: string;
  weight: number | null;
  reps: number | null;
  unit: "lb" | "kg" | null;
};

export type RecentPrItem = {
  key: string;
  name: string;
  last: PrSnapshot;
  previous: PrSnapshot | null;
  improvement: string | null;
};

type RecentPrListProps = {
  items: RecentPrItem[];
};

export default function RecentPrList({ items }: RecentPrListProps) {
  return (
    <section className="ui-card ui-soft-surface-raised p-6">
      <h2 className="text-sm font-semibold text-white">Recent PRs</h2>
      <div className="mt-4 space-y-3 text-sm text-slate-300">
        {items.length ? (
          items.map((item) => (
            <article
              key={item.key}
              className="ui-soft-surface rounded-lg p-3"
            >
              <p className="font-semibold text-white">{item.name}</p>
              <p className="mt-1 text-xs text-slate-300">Last PR: {item.last.label}</p>
              {item.previous ? (
                <p className="mt-1 text-xs text-slate-400">
                  Previous PR: {item.previous.label}
                </p>
              ) : null}
              {item.improvement ? (
                <p className="mt-2 text-xs font-semibold text-emerald-200">
                  Improvement: {item.improvement}
                </p>
              ) : null}
            </article>
          ))
        ) : (
          <p className="text-sm text-slate-400">No PRs yet.</p>
        )}
      </div>
    </section>
  );
}
