/**
 * Phase 6f, Commit 5.a — "This week we're focused on..." dashboard copy.
 *
 * Extracted out of (identical, duplicated) DailyInsightCard.tsx in both
 * apps/consumer and apps/gyms so the dedupe fix below has one home and one
 * test suite, instead of two copies that could drift.
 *
 * Bug this fixes: `priorities` mixes two different shapes from the same
 * upstream selector — one entry is often itself a "•"-joined list of
 * several tags (e.g. "balance and asymmetry control • breathing and
 * ribcage control • squat pattern control"), while another entry can be a
 * single tag that duplicates one of those, just title-cased (e.g.
 * "Breathing And Ribcage Control"). Comparing whole strings case-
 * insensitively (the original dedupe) never catches that overlap, so this
 * splits every entry into its individual tags before deduping.
 */

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

export const buildWeeklyFocusSentence = (priorities: string[]): string => {
  const seen = new Set<string>();
  const focusItems: string[] = [];

  priorities
    .filter((item) => !item.startsWith(RECOVERY_PREFIX))
    .map(stripPrefix)
    .filter(Boolean)
    .forEach((item) => {
      const newTags = item
        .split(/\s*•\s*/)
        .map((tag) => tag.trim())
        .filter(Boolean)
        .filter((tag) => !seen.has(tag.toLowerCase()));
      if (newTags.length === 0) return;
      newTags.forEach((tag) => seen.add(tag.toLowerCase()));
      focusItems.push(`your ${lowerFirst(newTags.join(" • "))}`);
    });

  return `This week we're focused on ${joinNaturally(focusItems)}.`;
};

export const extractBetweenSessionsCue = (priorities: string[]): string => {
  const recovery = priorities.find((item) => item.startsWith(RECOVERY_PREFIX));
  return recovery
    ? stripPrefix(recovery)
    : "keep it easy — walk, mobility work, sleep";
};
