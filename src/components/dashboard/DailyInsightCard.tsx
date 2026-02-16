import type { Insight } from "@/lib/insightGenerator";

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
    <section className="ui-card p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        {insight.title}
      </h2>
      <p className="mt-2 text-sm text-slate-700">{insight.text}</p>
      <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Corrective Guidance Notes
        </p>
        <div className="mt-2 space-y-1 text-xs text-slate-700">
          <p>1. {coachNotes[0]}</p>
          <p>2. {coachNotes[1]}</p>
          <p>3. {coachNotes[2]}</p>
        </div>
      </div>
      <div className="mt-3">
        <p className="text-xs font-semibold text-slate-600">This week&apos;s priorities</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {priorities.slice(0, 3).map((item) => (
            <span
              key={item}
              className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-700"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
