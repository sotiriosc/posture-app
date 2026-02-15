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
    <section className="ui-card p-6">
      <h2 className="text-sm font-semibold text-slate-900">Recent PRs</h2>
      <div className="mt-4 space-y-3 text-sm text-slate-700">
        {items.length ? (
          items.map((item) => (
            <article
              key={item.key}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-3"
            >
              <p className="font-semibold text-slate-900">{item.name}</p>
              <p className="mt-1 text-xs text-slate-600">Last PR: {item.last.label}</p>
              {item.previous ? (
                <p className="mt-1 text-xs text-slate-500">
                  Previous PR: {item.previous.label}
                </p>
              ) : null}
              {item.improvement ? (
                <p className="mt-2 text-xs font-semibold text-emerald-700">
                  Improvement: {item.improvement}
                </p>
              ) : null}
            </article>
          ))
        ) : (
          <p className="text-sm text-slate-500">No PRs yet.</p>
        )}
      </div>
    </section>
  );
}
