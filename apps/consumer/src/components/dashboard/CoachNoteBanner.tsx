"use client";

import { useEffect, useState } from "react";
import { shouldShowCoachNote } from "@/lib/coachNoteStore";

type CoachNoteBannerProps = {
  /**
   * The already-computed "Next best action" coach note (e.g. `coachAction`
   * in ResultsRoutine.tsx), including its "Next best action:" prefix, or
   * `null` if none is available yet.
   */
  note: string | null;
};

/**
 * Phase 6f, Commit 4 — daily "Next best action" visibility.
 *
 * Today, the three coach notes only surface on the Insights panel, which
 * unlocks after a full week — free AND Pro users alike miss out on daily
 * guidance until then. This surfaces just the "Next best action" line on
 * the main dashboard, above the phase card, for every user from day one.
 * Deliberately not gated by plan (`isFreePlan`/`isPro`) or by the
 * Insights-panel unlock: per spec this is "a taste of depth, not a Pro
 * upsell."
 *
 * Rendered as null until the client-only suppression check
 * (`shouldShowCoachNote`, which reads localStorage) resolves after mount,
 * so server and first-paint client HTML always agree (no hydration
 * mismatch) — the banner can pop in a frame after mount, which is fine for
 * a small, non-critical text line.
 */
export default function CoachNoteBanner({ note }: CoachNoteBannerProps) {
  const [visibleNote, setVisibleNote] = useState<string | null>(null);

  useEffect(() => {
    setVisibleNote(shouldShowCoachNote(note) ? note : null);
  }, [note]);

  if (!visibleNote) return null;

  return (
    <p
      data-testid="coach-note-banner"
      className="mb-3 px-1 text-sm font-medium text-sky-100"
    >
      {visibleNote}
    </p>
  );
}
