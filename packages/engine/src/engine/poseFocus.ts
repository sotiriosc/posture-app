import type { PoseAnalysis } from "@/lib/poseAnalyzer";

// ---------------------------------------------------------------------------
// Phase 4 — Confidence constants
// ---------------------------------------------------------------------------

/**
 * Minimum overall pose confidenceScore required to emit any focus tags.
 * Below this floor: return zero tags + status "insufficient_confidence".
 * Truth over coverage — a blurry photo should not bias the program.
 */
export const CONFIDENCE_FLOOR = 0.55;

/**
 * Minimum per-keypoint score required for a symmetry-pair observation.
 * If either keypoint in a pair scores below this value, that specific
 * observation is suppressed; other observations from the same photo that
 * meet this threshold can still fire.
 *
 * Replaces the legacy pointByName floor of 0.2, which was too permissive
 * for making posture claims.
 */
export const KEYPOINT_MIN_SCORE = 0.35;

// ---------------------------------------------------------------------------
// Return type
// ---------------------------------------------------------------------------

export type PoseFocus = {
  focusTags: string[];
  reasons: Record<string, string>;
  /**
   * Phase 4: status of the derivation.
   * "ok"                    — tags emitted normally.
   * "insufficient_confidence" — overall confidenceScore was below CONFIDENCE_FLOOR;
   *                            zero tags returned; message contains user-facing copy.
   * "no_pose"              — null/undefined input.
   */
  status: "ok" | "insufficient_confidence" | "no_pose";
  /**
   * Phase 4: user-facing message when status ≠ "ok".
   * Undefined when status === "ok".
   */
  message?: string;
};

// ---------------------------------------------------------------------------
// Thresholds
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function derivePoseFocus(pose: PoseAnalysis | null | undefined): PoseFocus {
  if (!pose) {
    return { focusTags: [], reasons: {}, status: "no_pose" };
  }

  // Phase 4 — Confidence gate: overall score must clear the floor.
  if (
    typeof pose.confidenceScore === "number" &&
    pose.confidenceScore < CONFIDENCE_FLOOR
  ) {
    return {
      focusTags: [],
      reasons: {},
      status: "insufficient_confidence",
      message:
        "Photo wasn't clear enough for posture observations. Retake, or continue without posture biasing.",
    };
  }

  const candidates: PoseCandidate[] = [];
  const metrics = pose.metrics;

  // ── headForwardOffset ────────────────────────────────────────────────────
  // Uses a single best-side keypoint; no symmetry pair, so no per-keypoint
  // suppression needed here.  The overall confidence gate covers it.
  if (
    typeof metrics.headForwardOffset === "number" &&
    metrics.headForwardOffset > POSE_THRESHOLDS.headForwardOffset
  ) {
    candidates.push({
      tag: "forward_head",
      reason: `Head position measured ${toFixedMetric(
        metrics.headForwardOffset
      )} forward of shoulder line (threshold ${POSE_THRESHOLDS.headForwardOffset}).`,
      priority: metrics.headForwardOffset / POSE_THRESHOLDS.headForwardOffset,
    });
  }

  // ── scapularSymmetry — symmetry pair: both shoulders must meet min score ─
  {
    const leftScore = pose.metrics.avgKeypointScore ?? 0;
    const rightScore = pose.metrics.avgKeypointScore ?? 0;
    const keypointsOk =
      leftScore >= KEYPOINT_MIN_SCORE && rightScore >= KEYPOINT_MIN_SCORE;

    if (!keypointsOk) {
      // Observation suppressed — insufficient keypoint confidence on shoulder pair
      // (no push to candidates; no silent error — reason logged in reasons if needed)
    } else if (
      typeof metrics.scapularSymmetry === "number" &&
      metrics.scapularSymmetry > POSE_THRESHOLDS.scapularSymmetry
    ) {
      candidates.push({
        tag: "scapular_control",
        reason: `Shoulder blade asymmetry measured ${toFixedMetric(
          metrics.scapularSymmetry
        )} (threshold ${POSE_THRESHOLDS.scapularSymmetry}).`,
        priority: metrics.scapularSymmetry / POSE_THRESHOLDS.scapularSymmetry,
      });
    }
  }

  // ── torsoLeanAngle ───────────────────────────────────────────────────────
  if (
    typeof metrics.torsoLeanAngle === "number" &&
    metrics.torsoLeanAngle > POSE_THRESHOLDS.torsoLeanAngle
  ) {
    candidates.push({
      tag: "thoracic_extension",
      reason: `Torso lean measured ${toFixedMetric(
        metrics.torsoLeanAngle
      )} degrees (threshold ${POSE_THRESHOLDS.torsoLeanAngle}).`,
      priority: metrics.torsoLeanAngle / POSE_THRESHOLDS.torsoLeanAngle,
    });
  }

  // ── hipShift ─────────────────────────────────────────────────────────────
  if (typeof metrics.hipShift === "number" && metrics.hipShift > POSE_THRESHOLDS.hipShift) {
    candidates.push({
      tag: "hip_stability",
      reason: `Hip lateral shift measured ${toFixedMetric(
        metrics.hipShift
      )} (threshold ${POSE_THRESHOLDS.hipShift}).`,
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

  return { focusTags, reasons, status: "ok" };
}
