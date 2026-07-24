import type { Insight } from "@/lib/insightGenerator";
import {
  buildWeeklyFocusSentence,
  extractBetweenSessionsCue,
} from "@/lib/focusSentence";

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
  const focusSentence = buildWeeklyFocusSentence(priorities);
  const betweenSessions = extractBetweenSessionsCue(priorities);

  return (
    <section className="praxis-panel p-5">
      <h2 className="ui-kicker">{insight.title}</h2>
      <p className="mt-3 text-sm text-slate-300">{insight.text}</p>
      <div className="praxis-card mt-4 rounded-lg px-3 py-3">
        <p className="text-xs font-semibold uppercase text-slate-400">
          Coach notes
        </p>
        <div className="mt-2 space-y-1 text-xs text-slate-300">
          <p>1. {coachNotes[0]}</p>
          <p>2. {coachNotes[1]}</p>
          <p>3. {coachNotes[2]}</p>
        </div>
      </div>
      <div className="mt-4 space-y-1 text-sm text-slate-300">
        <p>{focusSentence}</p>
        <p>Between sessions: {betweenSessions}.</p>
      </div>
    </section>
  );
}
