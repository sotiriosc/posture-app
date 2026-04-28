import type { PoseAnalysis } from "@/lib/poseAnalyzer";

export type PoseFocus = {
  focusTags: string[];
  reasons: Record<string, string>;
};

const MAX_FOCUS_TAGS = 5;

const POSE_THRESHOLDS = {
  headForwardOffset: 0.08,
  scapularSymmetry: 0.06,
  torsoLeanAngle: 6,
  hipShift: 0.06,
} as const;

type PoseCandidate = {
  tag: string;
  reason: string;
  priority: number;
};

const toFixedMetric = (value: number) =>
  Number.isFinite(value) ? value.toFixed(value < 1 ? 3 : 1) : "n/a";

export function derivePoseFocus(pose: PoseAnalysis | null | undefined): PoseFocus {
  if (!pose) {
    return { focusTags: [], reasons: {} };
  }

  const candidates: PoseCandidate[] = [];
  const metrics = pose.metrics;

  if (
    typeof metrics.headForwardOffset === "number" &&
    metrics.headForwardOffset > POSE_THRESHOLDS.headForwardOffset
  ) {
    candidates.push({
      tag: "forward_head",
      reason: `headForwardOffset=${toFixedMetric(
        metrics.headForwardOffset
      )} > ${POSE_THRESHOLDS.headForwardOffset}`,
      priority: metrics.headForwardOffset / POSE_THRESHOLDS.headForwardOffset,
    });
  }

  if (
    typeof metrics.scapularSymmetry === "number" &&
    metrics.scapularSymmetry > POSE_THRESHOLDS.scapularSymmetry
  ) {
    candidates.push({
      tag: "scapular_control",
      reason: `scapularSymmetry=${toFixedMetric(
        metrics.scapularSymmetry
      )} > ${POSE_THRESHOLDS.scapularSymmetry}`,
      priority: metrics.scapularSymmetry / POSE_THRESHOLDS.scapularSymmetry,
    });
  }

  if (
    typeof metrics.torsoLeanAngle === "number" &&
    metrics.torsoLeanAngle > POSE_THRESHOLDS.torsoLeanAngle
  ) {
    candidates.push({
      tag: "thoracic_extension",
      reason: `torsoLeanAngle=${toFixedMetric(
        metrics.torsoLeanAngle
      )} > ${POSE_THRESHOLDS.torsoLeanAngle}`,
      priority: metrics.torsoLeanAngle / POSE_THRESHOLDS.torsoLeanAngle,
    });
  }

  if (typeof metrics.hipShift === "number" && metrics.hipShift > POSE_THRESHOLDS.hipShift) {
    candidates.push({
      tag: "hip_stability",
      reason: `hipShift=${toFixedMetric(metrics.hipShift)} > ${POSE_THRESHOLDS.hipShift}`,
      priority: metrics.hipShift / POSE_THRESHOLDS.hipShift,
    });
  }

  const focusTags = Array.from(
    new Set(
      candidates
        .sort((left, right) => right.priority - left.priority)
        .slice(0, MAX_FOCUS_TAGS)
        .map((candidate) => candidate.tag)
    )
  );

  const reasons: Record<string, string> = {};
  focusTags.forEach((tag) => {
    const match = candidates.find((candidate) => candidate.tag === tag);
    if (match) {
      reasons[tag] = match.reason;
    }
  });

  return { focusTags, reasons };
}
