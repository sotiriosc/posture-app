"use client";

import { planRevealTransition } from "@/components/plan-reveal/planRevealStyles";

type SessionStartSummaryProps = {
  purpose?: string | null;
  expectedDuration?: string | null;
  equipmentLabel?: string | null;
  focusLabel?: string | null;
  capabilityNote?: string | null;
  exerciseCount?: number | null;
  onBegin?: (() => void) | null;
  beginLabel?: string;
};

/**
 * Phase 8 session-start presentation — pre-begin only.
 * Does not redesign active workout or Phase 7B pain/swap flows.
 */
export default function SessionStartSummary({
  purpose,
  expectedDuration,
  equipmentLabel,
  focusLabel,
  capabilityNote,
  exerciseCount,
  onBegin = null,
  beginLabel = "Begin session",
}: SessionStartSummaryProps) {
  const hasContent =
    purpose ||
    expectedDuration ||
    equipmentLabel ||
    focusLabel ||
    capabilityNote ||
    typeof exerciseCount === "number";

  if (!hasContent && !onBegin) return null;

  return (
    <section
      className={`ui-soft-surface mt-3 rounded-lg border border-slate-400/20 px-3 py-3 ${planRevealTransition}`}
      data-testid="session-start-summary"
      aria-label="Session start summary"
    >
      {purpose ? (
        <p className="text-sm text-slate-200" data-testid="session-start-purpose">
          {purpose}
        </p>
      ) : null}
      <ul className="mt-2 flex flex-wrap gap-2" aria-label="Session setup">
        {expectedDuration ? (
          <li className="inline-flex min-h-11 items-center rounded-lg border border-slate-400/25 bg-slate-950/40 px-3 py-2 text-xs font-medium text-slate-200">
            {expectedDuration}
          </li>
        ) : null}
        {equipmentLabel ? (
          <li className="inline-flex min-h-11 items-center rounded-lg border border-slate-400/25 bg-slate-950/40 px-3 py-2 text-xs font-medium text-slate-200">
            {equipmentLabel}
          </li>
        ) : null}
        {focusLabel ? (
          <li className="inline-flex min-h-11 items-center rounded-lg border border-slate-400/25 bg-slate-950/40 px-3 py-2 text-xs font-medium text-slate-200">
            Focus: {focusLabel}
          </li>
        ) : null}
        {typeof exerciseCount === "number" ? (
          <li className="inline-flex min-h-11 items-center rounded-lg border border-slate-400/25 bg-slate-950/40 px-3 py-2 text-xs font-medium text-slate-200">
            {exerciseCount} exercises
          </li>
        ) : null}
      </ul>
      {capabilityNote ? (
        <p
          className="mt-2 text-xs text-amber-100/90"
          data-testid="session-start-capability"
          role="status"
        >
          {capabilityNote}
        </p>
      ) : null}
      {onBegin ? (
        <button
          type="button"
          onClick={onBegin}
          className="mt-3 flex min-h-11 w-full items-center justify-center rounded-lg bg-[linear-gradient(135deg,#38BDF8_0%,#2563EB_100%)] px-4 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300/70"
          data-testid="session-begin-action"
        >
          {beginLabel}
        </button>
      ) : null}
    </section>
  );
}
