import type { ReactNode } from "react";
import ProgressBar from "@/components/ui/ProgressBar";
import { primaryActionBtn, secondaryActionBtn } from "@/components/ui/buttonStyles";

type PhaseProgressCardProps = {
  phaseName: string;
  phaseDescription: string;
  requirementsText: string;
  gateProgressText: string;
  moveButtonLabel: string;
  canMove: boolean;
  showSkip: boolean;
  workoutsCompletedInPhase: number;
  workoutTarget: number;
  daysInPhase: number;
  dayTarget: number;
  gateStatusLabel: "Ready to advance" | "Gate locked" | "Phase 3 active";
  gateStatusDetail: string;
  onOpenMove: () => void;
  onOpenSkip: () => void;
  uploadControl: ReactNode;
};

export default function PhaseProgressCard({
  phaseName,
  phaseDescription,
  requirementsText,
  gateProgressText,
  moveButtonLabel,
  canMove,
  showSkip,
  workoutsCompletedInPhase,
  workoutTarget,
  daysInPhase,
  dayTarget,
  gateStatusLabel,
  gateStatusDetail,
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
          label="Workout gate progress"
          value={workoutsCompletedInPhase}
          max={workoutTarget}
          compact
          animate
          subtitle={`${workoutsCompletedInPhase}/${workoutTarget} workouts in phase`}
        />
        <ProgressBar
          label="Days in phase"
          value={daysInPhase}
          max={dayTarget}
          compact
          animate
          subtitle={`${daysInPhase}/${dayTarget} days in phase`}
        />
      </div>

      <div className="ui-soft-surface rounded-lg px-3 py-3 text-xs text-slate-300">
        <p className="font-semibold text-white">Gate status</p>
        <p className="mt-1 text-sm font-semibold text-slate-100">
          {gateStatusLabel}
        </p>
        <p className="mt-1" data-testid="phase-gate-reason">{gateStatusDetail}</p>
        <p className="mt-2 font-semibold text-white">Requirements</p>
        <p className="mt-1">{requirementsText}</p>
        <p className="mt-1 text-[11px] text-slate-400" data-testid="phase-gate-progress">
          {gateProgressText}
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
