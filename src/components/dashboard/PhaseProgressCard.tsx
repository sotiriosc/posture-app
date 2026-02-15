import type { ReactNode } from "react";
import ProgressBar from "@/components/ui/ProgressBar";
import { secondaryActionBtn } from "@/components/ui/buttonStyles";

type PhaseProgressCardProps = {
  phaseName: string;
  phaseDescription: string;
  requirementsText: string;
  gateReason: string;
  gateProgressText: string;
  moveButtonLabel: string;
  canMove: boolean;
  showSkip: boolean;
  phaseProgressPercent: number;
  cycleProgressPercent: number;
  readinessEstimate: string;
  onOpenMove: () => void;
  onOpenSkip: () => void;
  uploadControl: ReactNode;
};

export default function PhaseProgressCard({
  phaseName,
  phaseDescription,
  requirementsText,
  gateReason,
  gateProgressText,
  moveButtonLabel,
  canMove,
  showSkip,
  phaseProgressPercent,
  cycleProgressPercent,
  readinessEstimate,
  onOpenMove,
  onOpenSkip,
  uploadControl,
}: PhaseProgressCardProps) {
  return (
    <div className="space-y-3">
      <div>
        <h4 className="text-base font-semibold text-slate-900">{phaseName}</h4>
        <p className="mt-1 text-sm text-slate-600">{phaseDescription}</p>
      </div>

      <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
        <ProgressBar
          label="Phase progress"
          value={phaseProgressPercent}
          max={100}
          compact
        />
        <ProgressBar
          label="Cycle progress"
          value={cycleProgressPercent}
          max={100}
          compact
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-xs text-slate-700">
        <p className="font-semibold text-slate-800">Requirements</p>
        <p className="mt-1">{requirementsText}</p>
        <p className="mt-2" data-testid="phase-gate-reason">{gateReason}</p>
        <p className="mt-1 text-[11px] text-slate-500" data-testid="phase-gate-progress">
          {gateProgressText}
        </p>
        <p className="mt-2 text-[11px] text-slate-500">
          Estimated readiness: <span className="font-semibold text-slate-700">{readinessEstimate}</span>
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          data-testid="move-phase-trigger"
          onClick={onOpenMove}
          disabled={!canMove}
          className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
        >
          {moveButtonLabel}
        </button>
        {showSkip ? (
          <button
            type="button"
            data-testid="skip-phase-one-trigger"
            onClick={onOpenSkip}
            className={`${secondaryActionBtn} border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100`}
          >
            Skip Phase 1
          </button>
        ) : null}
        {uploadControl}
      </div>
    </div>
  );
}
