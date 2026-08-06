/**
 * Phase 7B — Canonical assessment focus for presentation.
 * Photo → derivePoseFocus → confidence-qualified tags (not observation titles).
 */

import {
  derivePoseFocus,
  type PoseFocus,
} from "@/lib/engine/poseFocus";
import type { PoseAnalysis } from "@/lib/poseAnalyzer";

export type AssessmentFocusFromPose = {
  status: PoseFocus["status"];
  /** Presentation-safe tags (underscores → spaces). Empty when status !== "ok". */
  focusTags: string[];
  /** True only when derivePoseFocus status is "ok". */
  highConfidence: boolean;
  reasons: Record<string, string>;
};

/** Format a canonical focus tag for UI (forward_head → "forward head"). */
export const formatFocusTagForPresentation = (tag: string): string =>
  tag.replace(/_/g, " ").replace(/\s+/g, " ").trim();

/**
 * Map PoseAnalysis through derivePoseFocus into presentation-safe focus input.
 * status !== "ok" ⇒ no photo-informed adaptation (highConfidence false, empty tags).
 */
export const resolveAssessmentFocusFromPose = (
  pose: PoseAnalysis | null | undefined
): AssessmentFocusFromPose => {
  const focus = derivePoseFocus(pose);
  if (focus.status !== "ok") {
    return {
      status: focus.status,
      focusTags: [],
      highConfidence: false,
      reasons: {},
    };
  }
  return {
    status: focus.status,
    focusTags: focus.focusTags.map(formatFocusTagForPresentation),
    highConfidence: true,
    reasons: { ...focus.reasons },
  };
};
