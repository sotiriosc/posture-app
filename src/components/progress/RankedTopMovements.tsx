"use client";

export type RankedTopMovement = {
  id: string;
  name: string;
  count: number;
  ratioPercent: number;
};

type RankedTopMovementsProps = {
  movements: RankedTopMovement[];
};

export default function RankedTopMovements({ movements }: RankedTopMovementsProps) {
  return (
    <section className="ui-card p-6">
      <h2 className="text-sm font-semibold text-slate-900">Top movements</h2>
      <div className="mt-4 space-y-3 text-sm text-slate-700">
        {movements.length ? (
          movements.map((item, index) => (
            <article key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                    #{index + 1}
                  </span>
                  <p className="truncate font-medium text-slate-900">{item.name}</p>
                </div>
                <span className="shrink-0 text-xs font-semibold text-slate-600">
                  {item.count} sessions
                </span>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-500 to-blue-600 transition-[width] duration-300 ease-out"
                  style={{ width: `${item.ratioPercent}%` }}
                />
              </div>
            </article>
          ))
        ) : (
          <p className="text-sm text-slate-500">No logs yet.</p>
        )}
      </div>
    </section>
  );
}
