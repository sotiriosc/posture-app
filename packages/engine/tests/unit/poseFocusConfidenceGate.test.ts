/**
 * Phase 4 — poseFocusConfidenceGate.test.ts
 *
 * Tests the confidence gate and keypoint minimum score logic in derivePoseFocus.
 *
 * Coverage:
 *   (1) Below CONFIDENCE_FLOOR → zero tags + status "insufficient_confidence" + message.
 *   (2) At / above CONFIDENCE_FLOOR → tags emitted with reasons, status "ok".
 *   (3) Single keypoint pair below KEYPOINT_MIN_SCORE → that observation suppressed,
 *       others from the same photo still fire.
 *   (4) null/undefined pose → status "no_pose".
 *   (5) Reason strings follow the measurement-language contract (no diagnostic copy).
 */

import { describe, expect, test } from "vitest";
import {
  derivePoseFocus,
  CONFIDENCE_FLOOR,
  KEYPOINT_MIN_SCORE,
} from "@/lib/engine/poseFocus";
import type { PoseAnalysis } from "@/lib/poseAnalyzer";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const makeAnalysis = (overrides: Partial<PoseAnalysis>): PoseAnalysis => ({
  metrics: {
    torsoHeight: null,
    avgKeypointScore: null,
    shoulderHeightDelta: null,
    hipHeightDelta: null,
    kneeAlignmentDelta: null,
    headForwardOffset: null,
    torsoLeanAngle: null,
    hipToShoulderAlignment: null,
    scapularSymmetry: null,
    hipShift: null,
  },
  observations: [],
  priorities: [],
  confidenceScore: 0.8,
  ...overrides,
});

/** Pose with a clear forward_head signal and high confidence. */
const highConfidencePose = (): PoseAnalysis =>
  makeAnalysis({
    confidenceScore: 0.85,
    metrics: {
      torsoHeight: null,
      avgKeypointScore: 0.85,
      shoulderHeightDelta: null,
      hipHeightDelta: null,
      kneeAlignmentDelta: null,
      headForwardOffset: 0.12, // > 0.08 threshold
      torsoLeanAngle: null,
      hipToShoulderAlignment: null,
      scapularSymmetry: null,
      hipShift: null,
    },
    observations: [],
    priorities: [],
  });

/** Pose below CONFIDENCE_FLOOR. */
const lowConfidencePose = (): PoseAnalysis =>
  makeAnalysis({
    confidenceScore: CONFIDENCE_FLOOR - 0.01,
    metrics: {
      torsoHeight: null,
      avgKeypointScore: CONFIDENCE_FLOOR - 0.01,
      shoulderHeightDelta: null,
      hipHeightDelta: null,
      kneeAlignmentDelta: null,
      headForwardOffset: 0.12,
      torsoLeanAngle: null,
      hipToShoulderAlignment: null,
      scapularSymmetry: null,
      hipShift: null,
    },
    observations: [],
    priorities: [],
  });

/** Pose AT the confidence floor (exactly). */
const atFloorPose = (): PoseAnalysis =>
  makeAnalysis({
    confidenceScore: CONFIDENCE_FLOOR,
    metrics: {
      torsoHeight: null,
      avgKeypointScore: CONFIDENCE_FLOOR,
      shoulderHeightDelta: null,
      hipHeightDelta: null,
      kneeAlignmentDelta: null,
      headForwardOffset: 0.11,
      torsoLeanAngle: null,
      hipToShoulderAlignment: null,
      scapularSymmetry: null,
      hipShift: null,
    },
    observations: [],
    priorities: [],
  });

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("poseFocusConfidenceGate — overall confidence", () => {
  test("below CONFIDENCE_FLOOR → zero tags + status insufficient_confidence + message", () => {
    const result = derivePoseFocus(lowConfidencePose());
    expect(result.focusTags).toHaveLength(0);
    expect(result.status).toBe("insufficient_confidence");
    expect(typeof result.message).toBe("string");
    expect(result.message).toContain("Retake");
  });

  test("at CONFIDENCE_FLOOR → tags emitted (not gated)", () => {
    const result = derivePoseFocus(atFloorPose());
    expect(result.status).toBe("ok");
    expect(result.focusTags.length).toBeGreaterThan(0);
    expect(result.focusTags).toContain("forward_head");
  });

  test("above CONFIDENCE_FLOOR → tags emitted with reasons, status ok", () => {
    const result = derivePoseFocus(highConfidencePose());
    expect(result.status).toBe("ok");
    expect(result.focusTags).toContain("forward_head");
    expect(result.reasons["forward_head"]).toBeDefined();
    expect(typeof result.reasons["forward_head"]).toBe("string");
    expect(result.reasons["forward_head"].length).toBeGreaterThan(0);
  });

  test("null pose → status no_pose, zero tags", () => {
    const result = derivePoseFocus(null);
    expect(result.status).toBe("no_pose");
    expect(result.focusTags).toHaveLength(0);
  });

  test("undefined pose → status no_pose, zero tags", () => {
    const result = derivePoseFocus(undefined);
    expect(result.status).toBe("no_pose");
    expect(result.focusTags).toHaveLength(0);
  });
});

describe("poseFocusConfidenceGate — keypoint minimum score", () => {
  test("low avgKeypointScore suppresses scapular_control but forward_head can still fire", () => {
    const lowKeypointPose = makeAnalysis({
      confidenceScore: 0.75,
      metrics: {
        torsoHeight: null,
        // Low avg means scapular_control (shoulder pair) is suppressed.
        avgKeypointScore: KEYPOINT_MIN_SCORE - 0.01,
        shoulderHeightDelta: null,
        hipHeightDelta: null,
        kneeAlignmentDelta: null,
        headForwardOffset: 0.15, // above threshold
        torsoLeanAngle: null,
        hipToShoulderAlignment: null,
        scapularSymmetry: 0.09, // above threshold but suppressed by low keypoint
        hipShift: null,
      },
      observations: [],
      priorities: [],
    });
    const result = derivePoseFocus(lowKeypointPose);
    expect(result.status).toBe("ok");
    expect(result.focusTags).toContain("forward_head");
    expect(result.focusTags).not.toContain("scapular_control");
  });

  test("adequate avgKeypointScore allows scapular_control to fire", () => {
    const goodKeypointPose = makeAnalysis({
      confidenceScore: 0.75,
      metrics: {
        torsoHeight: null,
        avgKeypointScore: KEYPOINT_MIN_SCORE + 0.1,
        shoulderHeightDelta: null,
        hipHeightDelta: null,
        kneeAlignmentDelta: null,
        headForwardOffset: null,
        torsoLeanAngle: null,
        hipToShoulderAlignment: null,
        scapularSymmetry: 0.09, // above threshold
        hipShift: null,
      },
      observations: [],
      priorities: [],
    });
    const result = derivePoseFocus(goodKeypointPose);
    expect(result.status).toBe("ok");
    expect(result.focusTags).toContain("scapular_control");
  });
});

describe("poseFocusConfidenceGate — observation language contract", () => {
  test("reason strings follow measurement-language contract (no diagnostic copy)", () => {
    const result = derivePoseFocus(highConfidencePose());
    expect(result.status).toBe("ok");
    const reason = result.reasons["forward_head"] ?? "";
    // Must contain measurement value, not diagnosis
    expect(reason).toMatch(/measured/i);
    expect(reason).toMatch(/threshold/i);
    // Must not contain diagnostic language
    expect(reason.toLowerCase()).not.toContain("you have");
    expect(reason.toLowerCase()).not.toContain("posture is bad");
    expect(reason.toLowerCase()).not.toContain("fix your");
  });

  test("insufficient_confidence message is user-facing copy, not stack trace", () => {
    const result = derivePoseFocus(lowConfidencePose());
    expect(result.message).toBeDefined();
    expect(result.message!.length).toBeGreaterThan(10);
    expect(result.message!.toLowerCase()).not.toContain("error");
    expect(result.message!.toLowerCase()).not.toContain("undefined");
  });
});
