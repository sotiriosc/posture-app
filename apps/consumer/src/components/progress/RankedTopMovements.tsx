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
    <section className="ui-card ui-soft-surface-raised p-6">
      <h2 className="text-sm font-semibold text-white">Top movements</h2>
      <div className="mt-4 space-y-3 text-sm text-slate-300">
        {movements.length ? (
          movements.map((item, index) => (
            <article key={item.id} className="ui-soft-surface rounded-lg p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-sky-200/35 bg-sky-400/15 text-xs font-semibold text-sky-100">
                    #{index + 1}
                  </span>
                  <p className="truncate font-medium text-white">{item.name}</p>
                </div>
                <span className="shrink-0 text-xs font-semibold text-slate-300">
                  {item.count} sessions
                </span>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-950/70">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-400 to-blue-500 transition-[width] duration-300 ease-out"
                  style={{ width: `${item.ratioPercent}%` }}
                />
              </div>
            </article>
          ))
        ) : (
          <p className="text-sm text-slate-400">No logs yet.</p>
        )}
      </div>
    </section>
  );
}
