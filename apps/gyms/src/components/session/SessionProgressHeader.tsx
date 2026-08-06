"use client";

import ClarifyTerm from "@/components/ui/ClarifyTerm";
import ClarifyWords from "@/components/ui/ClarifyWords";
import { CLARIFY } from "@/components/ui/clarifyTermCopy";
import SessionStartSummary from "@/components/session/SessionStartSummary";

type SessionProgressHeaderProps = {
  phaseName: string;
  dayPositionLabel: string;
  dayTitle: string;
  exercisePositionLabel: string;
  progressPercent: number;
  /**
   * Phase 6d, Commit 1 — the full header (title, day pill, progress bar) is
   * only useful once, at session start; once the user is actively moving
   * through exercises it's the same information restated on every scroll
   * with no new value, so it collapses to a single caption line here.
   */
  compact?: boolean;
  compactLabel?: string;
  /** Phase 7B — plain-language session purpose from presentation resolver. */
  sessionPurpose?: string | null;
  /** Phase 7B — duration / equipment summary from presentation resolver. */
  sessionMeta?: string | null;
  /** Phase 8 — structured session-start fields. */
  expectedDuration?: string | null;
  equipmentLabel?: string | null;
  focusLabel?: string | null;
  capabilityNote?: string | null;
  exerciseCount?: number | null;
  onBeginSession?: (() => void) | null;
};

export default function SessionProgressHeader({
  phaseName,
  dayPositionLabel,
  dayTitle,
  exercisePositionLabel,
  progressPercent,
  compact = false,
  compactLabel,
  sessionPurpose = null,
  sessionMeta = null,
  expectedDuration = null,
  equipmentLabel = null,
  focusLabel = null,
  capabilityNote = null,
  exerciseCount = null,
  onBeginSession = null,
}: SessionProgressHeaderProps) {
  if (compact) {
    return (
      <header
        data-testid="session-header-compact"
        className="ui-card flex min-h-8 items-center border-sky-200/70 bg-[linear-gradient(135deg,rgba(239,246,255,0.96),rgba(250,245,255,0.94))] px-3 py-1.5 backdrop-blur-md"
      >
        <p className="truncate text-xs font-medium text-slate-700">
          {compactLabel ?? `${exercisePositionLabel} · ${dayPositionLabel} · ${phaseName}`}
        </p>
      </header>
    );
  }

  return (
    <header
      data-testid="session-header-full"
      className="ui-card border-sky-200/70 bg-[linear-gradient(135deg,rgba(239,246,255,0.96),rgba(250,245,255,0.94))] p-4 backdrop-blur-md"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-sky-700/90">
          <ClarifyTerm term="Phase" explanation={CLARIFY.Phase}>
            {phaseName}
          </ClarifyTerm>
        </p>
        <p className="rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700">
          {dayPositionLabel}
        </p>
      </div>
      <h1 className="mt-1 text-xl font-semibold text-slate-900 sm:text-2xl">
        <ClarifyWords text={dayTitle} />
      </h1>
      {sessionPurpose ? (
        <p className="mt-1 text-sm text-slate-600">{sessionPurpose}</p>
      ) : null}
      {sessionMeta ? (
        <p className="mt-0.5 text-xs font-medium text-slate-500">{sessionMeta}</p>
      ) : null}
      <p className="mt-1 text-sm font-medium text-slate-700">{exercisePositionLabel}</p>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-sky-100">
        <div
          className="h-full rounded-full bg-[linear-gradient(135deg,#0284C7_0%,#2563EB_54%,#7C3AED_100%)] transition-[width] duration-[180ms] ease-out motion-reduce:transition-none"
          style={{ width: `${Math.max(0, Math.min(100, progressPercent))}%` }}
        />
      </div>

      <div className="[&_.ui-soft-surface]:border-indigo-200/60 [&_.ui-soft-surface]:bg-white/70 [&_li]:border-indigo-200/70 [&_li]:bg-indigo-50/80 [&_li]:text-slate-700 [&_p]:text-slate-700 [&_[data-testid=session-start-capability]]:text-amber-800">
        <SessionStartSummary
          purpose={null}
          expectedDuration={expectedDuration}
          equipmentLabel={equipmentLabel}
          focusLabel={focusLabel}
          capabilityNote={capabilityNote}
          exerciseCount={exerciseCount}
          onBegin={onBeginSession}
        />
      </div>
    </header>
  );
}
