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
}: ProgressSummaryProps) {
  return (
    <div className="space-y-3 text-sm text-slate-700">
      <p>
        Workouts in phase: <span className="font-semibold">{workoutsCompletedInPhase}/{workoutTarget}</span>
      </p>

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
