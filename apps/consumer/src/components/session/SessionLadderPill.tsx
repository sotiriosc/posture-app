"use client";

import { useSectionVisiblePref } from "@/components/visibility/SectionVisibility";

/**
 * Phase 6.3 — the ladder progression pill on each session exercise card.
 * Toggleable but visible by default; controlled from Settings › Interface via
 * the "session.ladderPill" section preference.
 */
export default function SessionLadderPill({ message }: { message: string | null | undefined }) {
  const visible = useSectionVisiblePref("session.ladderPill");
  if (!visible || !message) return null;
  return (
    <div className="mt-2 flex items-center gap-2 px-1">
      <span
        className="inline-flex items-center rounded-full bg-indigo-500/15 px-3 py-1 text-xs font-medium text-indigo-300 ring-1 ring-inset ring-indigo-500/30"
        role="status"
        aria-label="Level indicator"
      >
        {message}
      </span>
    </div>
  );
}
