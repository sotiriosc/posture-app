import type { ReactNode } from "react";
import ProgressBar from "@/components/ui/ProgressBar";
import { primaryActionBtn, secondaryActionBtn } from "@/components/ui/buttonStyles";

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
  workoutProgressPercent: number;
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
  workoutProgressPercent,
  readinessEstimate,
  onOpenMove,
  onOpenSkip,
  uploadControl,
}: PhaseProgressCardProps) {
  return (
    <div className="space-y-3">
      <div>
        <h4 className="text-base font-semibold text-white">{phaseName}</h4>
        <p className="mt-1 text-sm text-slate-300">{phaseDescription}</p>
      </div>

      <div className="ui-soft-surface space-y-3 rounded-lg px-3 py-3">
        <ProgressBar
          label="Phase progress"
          value={phaseProgressPercent}
          max={100}
          compact
          animate
        />
        <ProgressBar
          label="Workout progress"
          value={workoutProgressPercent}
          max={100}
          compact
          animate
        />
      </div>

      <div className="ui-soft-surface rounded-lg px-3 py-3 text-xs text-slate-300">
        <p className="font-semibold text-white">Requirements</p>
        <p className="mt-1">{requirementsText}</p>
        <p className="mt-2" data-testid="phase-gate-reason">{gateReason}</p>
        <p className="mt-1 text-[11px] text-slate-400" data-testid="phase-gate-progress">
          {gateProgressText}
        </p>
        <p className="mt-2 text-[11px] text-slate-400">
          Estimated readiness: <span className="font-semibold text-slate-200">{readinessEstimate}</span>
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          data-testid="move-phase-trigger"
          onClick={onOpenMove}
          disabled={!canMove}
          className={`${primaryActionBtn} disabled:opacity-50`}
        >
          {moveButtonLabel}
        </button>
        {showSkip ? (
          <button
          type="button"
          data-testid="skip-phase-one-trigger"
          onClick={onOpenSkip}
            className={`${secondaryActionBtn} border-amber-300/35 bg-amber-400/10 text-amber-100 hover:bg-amber-400/15`}
          >
            Skip Phase 1
          </button>
        ) : null}
        {uploadControl}
      </div>
    </div>
  );
}
