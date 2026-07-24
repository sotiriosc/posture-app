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
 * Phase 6f, Commit 4 — daily "Next best action" visibility (ported from
 * consumer). Not gated by plan or by the Insights-panel unlock — see the
 * consumer component of the same name for the full rationale.
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
