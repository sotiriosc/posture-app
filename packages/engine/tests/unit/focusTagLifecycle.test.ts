/**
 * Phase 4 — focusTagLifecycle.test.ts
 *
 * Tests the tag lifecycle evaluator: issue → persist → retire / escalate.
 *
 * Coverage:
 *   (1) Two consecutive retests clear threshold → tag retired.
 *   (2) One retest ≥15% under threshold (strong clear) → tag retired immediately.
 *   (3) Retest ≥20% worse than baseline on high-confidence photo → escalation bump.
 *   (4) Hysteresis: one clear + one not-clear resets consecutive counter; no retirement.
 *   (5) Already retired tag stays retired; no double-write.
 *   (6) Low-confidence photo does NOT trigger escalation even if ≥20% worse.
 *   (7) Retirement trace format is deterministic and contains the tag name.
 *   (8) Escalation trace format is deterministic and contains the tag name.
 *   (9) shouldPromptRetest: session cadence trigger.
 *  (10) shouldPromptRetest: phase transition trigger (always prompts).
 */

import { describe, expect, test } from "vitest";
import {
  computeFocusTagLifecycleUpdate,
  shouldPromptRetest,
  RETEST_SESSION_CADENCE,
  RETIREMENT_STRONG_CLEAR_FACTOR,
  ESCALATION_WORSE_FACTOR,
  type AssessmentSnapshot,
  type FocusTagLifecycleState,
} from "@/lib/types";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const TAG = "forward_head";
const THRESHOLD = 0.08;
const BASELINE_VALUE = 0.11; // above threshold

const makeSnapshot = (
  measuredValue: number,
  status: AssessmentSnapshot["status"] = "accepted",
  confidenceScore = 0.85
): AssessmentSnapshot => ({
  timestamp: "2026-07-22T10:00:00.000Z",
  phase: 0,
  confidenceScore,
  observations: [
    {
      focusTag: TAG,
      measuredValue,
      threshold: THRESHOLD,
      keypointConfidences: [confidenceScore, confidenceScore],
    },
  ],
  status,
});

const baselineSnapshot = makeSnapshot(BASELINE_VALUE);

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("focusTagLifecycle — retirement: 2 consecutive clears", () => {
  test("two consecutive retests clearing threshold → tag retired", () => {
    const retest1 = makeSnapshot(THRESHOLD - 0.01); // clears, not strong
    const retest2 = makeSnapshot(THRESHOLD - 0.01); // second consecutive clear
    const result = computeFocusTagLifecycleUpdate({
      focusTag: TAG,
      baselineSnapshot,
      retestSnapshots: [retest1, retest2],
      evaluatedAt: "2026-08-01T10:00:00.000Z",
    });
    expect(result.retiredAt).toBeDefined();
    expect(result.retirementTrace).toBeDefined();
    expect(result.retirementTrace).toContain(TAG);
    expect(result.retirementTrace).toContain("corrective slot reallocated");
  });

  test("one clear retest is NOT enough for retirement (needs 2 consecutive)", () => {
    const retest1 = makeSnapshot(THRESHOLD - 0.01); // clears but only once
    const result = computeFocusTagLifecycleUpdate({
      focusTag: TAG,
      baselineSnapshot,
      retestSnapshots: [retest1],
      evaluatedAt: "2026-08-01T10:00:00.000Z",
    });
    expect(result.retiredAt).toBeUndefined();
  });
});

describe("focusTagLifecycle — retirement: strong clear (≥15% under threshold)", () => {
  test("one retest ≥15% under threshold → immediate retirement", () => {
    const strongClearValue = THRESHOLD * (1 - RETIREMENT_STRONG_CLEAR_FACTOR - 0.01);
    const retest = makeSnapshot(strongClearValue);
    const result = computeFocusTagLifecycleUpdate({
      focusTag: TAG,
      baselineSnapshot,
      retestSnapshots: [retest],
      evaluatedAt: "2026-08-01T10:00:00.000Z",
    });
    expect(result.retiredAt).toBeDefined();
    expect(result.retirementTrace).toContain("strong clear");
  });

  test("retest exactly AT ≥15% under threshold fires strong clear", () => {
    const exactStrongClear = THRESHOLD * (1 - RETIREMENT_STRONG_CLEAR_FACTOR);
    const retest = makeSnapshot(exactStrongClear);
    const result = computeFocusTagLifecycleUpdate({
      focusTag: TAG,
      baselineSnapshot,
      retestSnapshots: [retest],
      evaluatedAt: "2026-08-01T10:00:00.000Z",
    });
    expect(result.retiredAt).toBeDefined();
  });
});

describe("focusTagLifecycle — escalation", () => {
  test("retest ≥20% worse than baseline on high-confidence photo → escalation bump", () => {
    const worseFactor = ESCALATION_WORSE_FACTOR + 0.01;
    const worseValue = BASELINE_VALUE * (1 + worseFactor);
    const retest = makeSnapshot(worseValue, "accepted", 0.85); // high confidence
    const result = computeFocusTagLifecycleUpdate({
      focusTag: TAG,
      baselineSnapshot,
      retestSnapshots: [retest],
      evaluatedAt: "2026-08-01T10:00:00.000Z",
    });
    expect(result.escalatedAt).toBeDefined();
    expect(result.escalationBumps).toBe(1);
    expect(result.escalationTrace).toContain(TAG);
    expect(result.escalationTrace).toContain("worse than baseline");
    expect(result.retiredAt).toBeUndefined();
  });

  test("low-confidence photo does NOT trigger escalation even if ≥20% worse", () => {
    const worseValue = BASELINE_VALUE * (1 + ESCALATION_WORSE_FACTOR + 0.05);
    const retest = makeSnapshot(worseValue, "accepted", 0.4); // below CONFIDENCE_FLOOR
    const result = computeFocusTagLifecycleUpdate({
      focusTag: TAG,
      baselineSnapshot,
      retestSnapshots: [retest],
      evaluatedAt: "2026-08-01T10:00:00.000Z",
    });
    expect(result.escalatedAt).toBeUndefined();
    expect(result.escalationBumps).toBe(0);
  });

  test("escalation is bounded to 1 bump per retest (no compounding in single call)", () => {
    const worseValue = BASELINE_VALUE * (1 + ESCALATION_WORSE_FACTOR + 0.1);
    const retest1 = makeSnapshot(worseValue, "accepted", 0.85);
    const result = computeFocusTagLifecycleUpdate({
      focusTag: TAG,
      baselineSnapshot,
      retestSnapshots: [retest1],
      evaluatedAt: "2026-08-01T10:00:00.000Z",
    });
    // Returns after first escalation — bounded to 1 bump
    expect(result.escalationBumps).toBe(1);
  });
});

describe("focusTagLifecycle — hysteresis", () => {
  test("clear then not-clear resets consecutive counter — no retirement", () => {
    const clear = makeSnapshot(THRESHOLD - 0.005); // clears once
    const fail = makeSnapshot(THRESHOLD + 0.02); // doesn't clear → resets counter
    const result = computeFocusTagLifecycleUpdate({
      focusTag: TAG,
      baselineSnapshot,
      retestSnapshots: [clear, fail],
      evaluatedAt: "2026-08-01T10:00:00.000Z",
    });
    expect(result.retiredAt).toBeUndefined();
    expect(result.escalationBumps).toBe(0);
  });
});

describe("focusTagLifecycle — already retired stays retired", () => {
  test("subsequent calls on retired tag return unchanged state", () => {
    const priorRetired: FocusTagLifecycleState = {
      focusTag: TAG,
      firstSeenAt: "2026-07-01T00:00:00.000Z",
      retiredAt: "2026-07-20T00:00:00.000Z",
      retirementTrace: "already retired",
      escalationBumps: 0,
    };
    const retest = makeSnapshot(THRESHOLD - 0.01);
    const result = computeFocusTagLifecycleUpdate({
      focusTag: TAG,
      baselineSnapshot,
      retestSnapshots: [retest, retest],
      evaluatedAt: "2026-08-01T10:00:00.000Z",
      priorState: priorRetired,
    });
    expect(result.retiredAt).toBe(priorRetired.retiredAt);
    expect(result.retirementTrace).toBe(priorRetired.retirementTrace);
  });
});

describe("focusTagLifecycle — trace format determinism", () => {
  test("retirement trace is identical across N runs for same inputs", () => {
    const strongClearValue = THRESHOLD * (1 - RETIREMENT_STRONG_CLEAR_FACTOR - 0.01);
    const retest = makeSnapshot(strongClearValue);
    const evaluatedAt = "2026-08-01T10:00:00.000Z";
    const runs = Array.from({ length: 5 }, () =>
      computeFocusTagLifecycleUpdate({
        focusTag: TAG,
        baselineSnapshot,
        retestSnapshots: [retest],
        evaluatedAt,
      })
    );
    const firstTrace = runs[0].retirementTrace;
    runs.forEach((run) => {
      expect(run.retirementTrace).toBe(firstTrace);
    });
  });

  test("escalation trace is deterministic across N runs", () => {
    const worseValue = BASELINE_VALUE * (1 + ESCALATION_WORSE_FACTOR + 0.05);
    const retest = makeSnapshot(worseValue, "accepted", 0.85);
    const evaluatedAt = "2026-08-01T10:00:00.000Z";
    const runs = Array.from({ length: 5 }, () =>
      computeFocusTagLifecycleUpdate({
        focusTag: TAG,
        baselineSnapshot,
        retestSnapshots: [retest],
        evaluatedAt,
      })
    );
    const firstTrace = runs[0].escalationTrace;
    runs.forEach((run) => {
      expect(run.escalationTrace).toBe(firstTrace);
    });
  });
});

describe("shouldPromptRetest — cadence", () => {
  test(`triggers when sessions since last retest ≥ ${RETEST_SESSION_CADENCE}`, () => {
    expect(
      shouldPromptRetest({
        sessionCount: RETEST_SESSION_CADENCE,
        phaseTransitionOccurred: false,
        lastRetestSessionCount: 0,
      })
    ).toBe(true);
  });

  test("does not trigger before cadence threshold", () => {
    expect(
      shouldPromptRetest({
        sessionCount: RETEST_SESSION_CADENCE - 1,
        phaseTransitionOccurred: false,
        lastRetestSessionCount: 0,
      })
    ).toBe(false);
  });

  test("always triggers on phase transition regardless of session count", () => {
    expect(
      shouldPromptRetest({
        sessionCount: 1,
        phaseTransitionOccurred: true,
        lastRetestSessionCount: 0,
      })
    ).toBe(true);
  });

  test("cadence resets after retest (lastRetestSessionCount updated)", () => {
    const currentSession = RETEST_SESSION_CADENCE + 5;
    const lastRetest = currentSession - (RETEST_SESSION_CADENCE - 2);
    expect(
      shouldPromptRetest({
        sessionCount: currentSession,
        phaseTransitionOccurred: false,
        lastRetestSessionCount: lastRetest,
      })
    ).toBe(false);
  });
});
