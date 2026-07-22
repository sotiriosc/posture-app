import ProgressBar from "@/components/ui/ProgressBar";

type ProgressSummaryProps = {
  consistencyPercent: number;
  completionPercent: number;
  painTrend: string;
  painTrendPercent: number;
  movementQualityTrend: string;
  movementQualityPercent: number;
  workoutsCompletedInPhase: number;
  workoutTarget: number;
  daysInPhase: number;
  dayTarget: number;
  gateStatusLabel: "Ready to advance" | "Keep going" | "Phase 3 active";
  gateStatusDetail: string;
};

export default function ProgressSummary({
  consistencyPercent,
  completionPercent,
  painTrend,
  painTrendPercent,
  movementQualityTrend,
  movementQualityPercent,
  workoutsCompletedInPhase,
  workoutTarget,
  daysInPhase,
  dayTarget,
  gateStatusLabel,
  gateStatusDetail,
}: ProgressSummaryProps) {
  return (
    <div className="space-y-3 text-sm text-slate-300">
      <p>
        Workouts in phase: <span className="font-semibold">{workoutsCompletedInPhase}/{workoutTarget}</span>
      </p>
      <p>
        Days in phase: <span className="font-semibold">{daysInPhase}/{dayTarget}</span>
      </p>
      <p>
        Phase status: <span className="font-semibold">{gateStatusLabel}</span>
      </p>
      <p className="text-xs text-slate-400">{gateStatusDetail}</p>

      <ProgressBar
        label="Sessions this phase"
        value={workoutsCompletedInPhase}
        max={workoutTarget}
        animate
        subtitle={`${workoutsCompletedInPhase}/${workoutTarget} workouts in phase`}
      />
      <ProgressBar
        label="Days in phase"
        value={daysInPhase}
        max={dayTarget}
        animate
        subtitle={`${daysInPhase}/${dayTarget} days in phase`}
      />

      <ProgressBar label="Consistency" value={consistencyPercent} max={100} animate />
      <ProgressBar label="Completion" value={completionPercent} max={100} animate />
      <ProgressBar
        label="Pain trend"
        value={painTrendPercent}
        max={100}
        animate
        subtitle={painTrend}
      />
      <ProgressBar
        label="Movement quality trend"
        value={movementQualityPercent}
        max={100}
        animate
        subtitle={movementQualityTrend}
      />
    </div>
  );
}
