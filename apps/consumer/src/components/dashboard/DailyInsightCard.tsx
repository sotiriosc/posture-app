import type { Insight } from "@/lib/insightGenerator";

type DailyInsightCardProps = {
  insight: Insight;
  coachNotes: [string, string, string];
  priorities: string[];
};

const RECOVERY_PREFIX = "Recovery cue:";

// Strip an engineering label prefix like "Posture cue:" / "Main focus:".
const stripPrefix = (value: string) => value.replace(/^[^:]+:\s*/, "").trim();

const lowerFirst = (value: string) =>
  value ? value.charAt(0).toLowerCase() + value.slice(1) : value;

const joinNaturally = (items: string[]) => {
  if (items.length === 0) return "your key movements";
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
};

export default function DailyInsightCard({
  insight,
  coachNotes,
  priorities,
}: DailyInsightCardProps) {
  const recovery = priorities.find((item) => item.startsWith(RECOVERY_PREFIX));

  // Dedupe the focus items case-insensitively (the raw feed can list the same
  // pattern twice — once humanized, once not) and drop the engine prefixes.
  const seen = new Set<string>();
  const focusItems: string[] = [];
  priorities
    .filter((item) => !item.startsWith(RECOVERY_PREFIX))
    .map(stripPrefix)
    .filter(Boolean)
    .forEach((item) => {
      const key = item.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      focusItems.push(`your ${lowerFirst(item)}`);
    });

  const focusSentence = `This week we're focused on ${joinNaturally(focusItems)}.`;
  const betweenSessions = recovery
    ? stripPrefix(recovery)
    : "keep it easy — walk, mobility work, sleep";

  return (
    <section className="ui-card ui-soft-surface-raised p-5">
      <h2 className="ui-kicker">{insight.title}</h2>
      <p className="mt-3 text-sm text-slate-300">{insight.text}</p>
      <div className="ui-soft-surface mt-4 rounded-lg px-3 py-3">
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
