"use client";

import { useEffect, useId, useRef } from "react";
import { planRevealPillBase, planRevealTransition } from "./planRevealStyles";

type TechnicalDetailDrawerProps = {
  open: boolean;
  onClose: () => void;
  phaseLabel: string;
  phasePurpose: string;
  frequencyLabel: string;
  equipmentIdentity: string;
  weekLabel: string;
  templateVersion: number;
};

export default function TechnicalDetailDrawer({
  open,
  onClose,
  phaseLabel,
  phasePurpose,
  frequencyLabel,
  equipmentIdentity,
  weekLabel,
  templateVersion,
}: TechnicalDetailDrawerProps) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-950/70 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      data-testid="plan-reveal-technical-drawer"
    >
      <div
        className={`w-full max-w-lg rounded-lg border border-slate-400/25 bg-slate-900 p-5 text-slate-100 shadow-xl ${planRevealTransition}`}
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id={titleId} className="text-lg font-semibold text-white">
            Technical detail
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className={`${planRevealPillBase} border-slate-400/30 bg-slate-950/50 text-slate-200`}
            data-testid="plan-reveal-technical-close"
          >
            Close
          </button>
        </div>
        <dl className="mt-4 space-y-3 text-sm">
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-400">Phase</dt>
            <dd className="mt-0.5 text-slate-100">{phaseLabel}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-400">Purpose</dt>
            <dd className="mt-0.5 text-slate-100">{phasePurpose}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-400">Schedule</dt>
            <dd className="mt-0.5 text-slate-100">
              {frequencyLabel} · {weekLabel}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-400">Equipment</dt>
            <dd className="mt-0.5 text-slate-100">{equipmentIdentity}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-400">
              Program template
            </dt>
            <dd className="mt-0.5 text-slate-100">Version {templateVersion}</dd>
          </div>
        </dl>
        <p className="mt-4 text-xs text-slate-400">
          Exact progression gates and internal ranking codes stay out of this view.
        </p>
      </div>
    </div>
  );
}
