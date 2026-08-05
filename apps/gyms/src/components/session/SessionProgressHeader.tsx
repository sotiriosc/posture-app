"use client";

import ClarifyTerm from "@/components/ui/ClarifyTerm";
import ClarifyWords from "@/components/ui/ClarifyWords";
import { CLARIFY } from "@/components/ui/clarifyTermCopy";

type SessionProgressHeaderProps = {
  phaseName: string;
  dayPositionLabel: string;
  dayTitle: string;
  exercisePositionLabel: string;
  progressPercent: number;
  /** Phase 7B — plain-language session purpose from presentation resolver. */
  sessionPurpose?: string | null;
  /** Phase 7B — duration / equipment summary from presentation resolver. */
  sessionMeta?: string | null;
};

export default function SessionProgressHeader({
  phaseName,
  dayPositionLabel,
  dayTitle,
  exercisePositionLabel,
  progressPercent,
  sessionPurpose = null,
  sessionMeta = null,
}: SessionProgressHeaderProps) {
  return (
    <header className="praxis-panel-strong p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-sky-200">
          <ClarifyTerm term="Phase" explanation={CLARIFY.Phase}>
            {phaseName}
          </ClarifyTerm>
        </p>
        <p className="praxis-selected-surface rounded-full px-2 py-0.5 text-xs font-semibold text-sky-50">
          {dayPositionLabel}
        </p>
      </div>
      <h1 className="mt-1 text-xl font-semibold text-white sm:text-2xl">
        <ClarifyWords text={dayTitle} />
      </h1>
      {sessionPurpose ? (
        <p className="mt-1 text-sm text-slate-300">{sessionPurpose}</p>
      ) : null}
      {sessionMeta ? (
        <p className="mt-0.5 text-xs font-medium text-slate-400">{sessionMeta}</p>
      ) : null}
      <p className="mt-1 text-sm font-medium text-slate-300">{exercisePositionLabel}</p>
      <div className="praxis-input-surface mt-3 h-1.5 w-full overflow-hidden rounded-full">
        <div
          className="h-full rounded-full bg-[linear-gradient(135deg,#0284C7_0%,#2563EB_54%,#7C3AED_100%)] transition-[width] duration-300 ease-out"
          style={{ width: `${Math.max(0, Math.min(100, progressPercent))}%` }}
        />
      </div>
    </header>
  );
}
