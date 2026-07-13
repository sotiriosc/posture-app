import type { Insight } from "@praxis/engine";

type DailyInsightCardProps = {
  insight: Insight;
  coachNotes: [string, string, string];
  priorities: string[];
};

export default function DailyInsightCard({
  insight,
  coachNotes,
  priorities,
}: DailyInsightCardProps) {
  return (
    <section className="ui-card ui-soft-surface-raised p-5">
      <h2 className="ui-kicker">
        {insight.title}
      </h2>
      <p className="mt-3 text-sm text-slate-300">{insight.text}</p>
      <div className="ui-soft-surface mt-4 rounded-lg px-3 py-3">
        <p className="text-xs font-semibold uppercase text-slate-400">
          Corrective Guidance Notes
        </p>
        <div className="mt-2 space-y-1 text-xs text-slate-300">
          <p>1. {coachNotes[0]}</p>
          <p>2. {coachNotes[1]}</p>
          <p>3. {coachNotes[2]}</p>
        </div>
      </div>
      <div className="mt-4">
        <p className="text-xs font-semibold text-slate-400">This week&apos;s priorities</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {priorities.slice(0, 3).map((item) => (
            <span
              key={item}
              className="rounded-lg border border-slate-500/25 bg-slate-950/45 px-2.5 py-1 text-[11px] text-slate-300"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
