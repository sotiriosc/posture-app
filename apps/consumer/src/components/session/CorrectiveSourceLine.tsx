"use client";

import { useSectionVisiblePref } from "@/components/visibility/SectionVisibility";

/**
 * Phase 6.3 — the "Chosen because: [reason]" corrective-source annotation
 * (Phase 4 sourceObservation surfacing).  Toggleable but visible by default;
 * controlled from Settings › Interface via the "day.correctiveSource" pref.
 */
export default function CorrectiveSourceLine({
  observation,
}: {
  observation?: string | null;
}) {
  const visible = useSectionVisiblePref("day.correctiveSource");
  if (!visible || !observation) return null;
  return (
    <p className="mt-0.5 text-[11px] leading-4 text-slate-400">
      {`Chosen because: ${observation}`}
    </p>
  );
}
