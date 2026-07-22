/**
 * Phase 3.2 — Modify path tests
 *
 * Coverage:
 *  - applyFeedbackContractAction("modify"): sets deferred=true (Phase 3 REG-1c)
 *  - Modify at d1 (atFloor=true): escalates to Sacrifice with trace note
 *  - Composition rule: Modify does NOT call computePatternLadderDecision directly;
 *    it only sets the deferred flag that Phase 3 already reads
 *  - decisionTrace includes "REG-1c" reference
 */

import { describe, expect, test } from "vitest";
import type { ExerciseFeedbackSummary, LadderState } from "@/lib/types";
import { applyFeedbackContractAction } from "@/lib/program/feedbackContract";
import { getPrevLadderRung, computePatternLadderDecision } from "@/lib/program/ladderAdvancement";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const baseSummary = (exerciseId: string): ExerciseFeedbackSummary => ({
  exerciseId,
  pain: "none",
  difficulty: "normal",
  completionRate: 1,
});

const hingeD2 = "bodyweight-good-morning"; // d2, no progressionOf → atFloor
const hingeD3 = "db-rdl";                  // d3, progressionOf = hingeD2 → has prev
const hingeD4 = "barbell-romanian-deadlift"; // d4

const baseHingeLadderState = (exerciseId: string): LadderState => ({
  byPattern: {
    hinge: {
      exerciseId,
      pattern: "hinge",
      difficulty: 3,
      cleanSessionsCount: 0,
      requiredForAdvance: 2,
      inHysteresis: false,
      lastDecisionTrace: "",
    },
  },
});

// ---------------------------------------------------------------------------
// 1. Modify at mid-rung (not at floor)
// ---------------------------------------------------------------------------

describe("applyFeedbackContractAction('modify') at mid-rung", () => {
  test("sets deferred=true on the summary", () => {
    const result = applyFeedbackContractAction({
      action: "modify",
      exerciseId: hingeD3,
      exercisePattern: "hinge",
      currentSummary: baseSummary(hingeD3),
      currentLadderState: baseHingeLadderState(hingeD3),
      phase: "skill",
      sessionCount: 5,
      atFloor: false,
    });
    expect(result.updatedSummary.deferred).toBe(true);
  });

  test("does NOT set sacrificedAt (Modify is not Sacrifice)", () => {
    const result = applyFeedbackContractAction({
      action: "modify",
      exerciseId: hingeD3,
      exercisePattern: "hinge",
      currentSummary: baseSummary(hingeD3),
      currentLadderState: baseHingeLadderState(hingeD3),
      phase: "skill",
      sessionCount: 5,
      atFloor: false,
    });
    expect(result.updatedSummary.sacrificedAt).toBeUndefined();
  });

  test("clears probation", () => {
    const result = applyFeedbackContractAction({
      action: "modify",
      exerciseId: hingeD3,
      exercisePattern: "hinge",
      currentSummary: { ...baseSummary(hingeD3), probation: true },
      currentLadderState: baseHingeLadderState(hingeD3),
      phase: "skill",
      sessionCount: 5,
      atFloor: false,
    });
    expect(result.updatedSummary.probation).toBe(false);
  });

  test("decisionTrace references REG-1c and names the previous rung", () => {
    const result = applyFeedbackContractAction({
      action: "modify",
      exerciseId: hingeD3,
      exercisePattern: "hinge",
      currentSummary: baseSummary(hingeD3),
      currentLadderState: baseHingeLadderState(hingeD3),
      phase: "skill",
      sessionCount: 5,
      atFloor: false,
    });
    const prevRung = getPrevLadderRung(hingeD3); // "bodyweight-good-morning"
    expect(result.decisionTrace).toMatch(/REG-1c/);
    expect(result.decisionTrace).toMatch(prevRung ?? "floor");
  });

  test("ladderState is NOT changed by Modify (composition rule — Phase 3 reads deferred)", () => {
    const result = applyFeedbackContractAction({
      action: "modify",
      exerciseId: hingeD3,
      exercisePattern: "hinge",
      currentSummary: baseSummary(hingeD3),
      currentLadderState: baseHingeLadderState(hingeD3),
      phase: "skill",
      sessionCount: 5,
      atFloor: false,
    });
    // The rung should NOT have been moved — Phase 3 cycle will handle it.
    expect(result.updatedLadderState).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// 2. Modify at d4 — prev rung is d3
// ---------------------------------------------------------------------------

describe("applyFeedbackContractAction('modify') at d4", () => {
  test("deferred=true set; Phase 3 will regress from d4 to d3", () => {
    const result = applyFeedbackContractAction({
      action: "modify",
      exerciseId: hingeD4,
      exercisePattern: "hinge",
      currentSummary: baseSummary(hingeD4),
      currentLadderState: baseHingeLadderState(hingeD4),
      phase: "growth",
      sessionCount: 10,
      atFloor: false,
    });
    expect(result.updatedSummary.deferred).toBe(true);
    expect(result.decisionTrace).toMatch(/db-rdl/); // prev of barbell-rdl
  });
});

// ---------------------------------------------------------------------------
// 3. Modify at d1 (atFloor) — escalate to Sacrifice
// ---------------------------------------------------------------------------

describe("applyFeedbackContractAction('modify') at d1 floor", () => {
  test("escalates to Sacrifice, sets deferred + sacrificedAt", () => {
    const result = applyFeedbackContractAction({
      action: "modify",
      exerciseId: hingeD2,
      exercisePattern: "hinge",
      currentSummary: baseSummary(hingeD2),
      currentLadderState: undefined,
      phase: "activation",
      sessionCount: 2,
      atFloor: true,
    });
    expect(result.updatedSummary.deferred).toBe(true);
    expect(result.updatedSummary.sacrificedAt).toEqual({
      phase: "activation",
      sessionCount: 2,
    });
  });

  test("trace explicitly names d1 floor escalation", () => {
    const result = applyFeedbackContractAction({
      action: "modify",
      exerciseId: hingeD2,
      exercisePattern: "hinge",
      currentSummary: baseSummary(hingeD2),
      currentLadderState: undefined,
      phase: "activation",
      sessionCount: 2,
      atFloor: true,
    });
    expect(result.decisionTrace).toMatch(/d1 floor/i);
    expect(result.decisionTrace).toMatch(/Sacrifice/i);
  });

  test("escalated sacrifice adds to retest queue", () => {
    const result = applyFeedbackContractAction({
      action: "modify",
      exerciseId: hingeD2,
      exercisePattern: "hinge",
      currentSummary: baseSummary(hingeD2),
      currentLadderState: undefined,
      phase: "activation",
      sessionCount: 1,
      atFloor: true,
    });
    expect(result.updatedLadderState?.sacrificedByPattern?.hinge).toContain(hingeD2);
  });
});

// ---------------------------------------------------------------------------
// 4. Composition rule: deferred flag triggers Phase 3 REG-1c on next cycle
// ---------------------------------------------------------------------------

describe("composition rule: Modify deferred flag consumed by Phase 3", () => {
  test("Phase 3 computePatternLadderDecision treats deferredIds as REG-1c trigger", () => {
    // Verify that the deferred flag Modify sets is the exact same flag REG-1c reads.
    // Cross-module integration check — no mocking.
    const decision = computePatternLadderDecision({
      currentState: {
        exerciseId: hingeD3,
        pattern: "hinge",
        difficulty: 3,
        cleanSessionsCount: 0,
        requiredForAdvance: 2,
        inHysteresis: false,
        lastDecisionTrace: "",
      },
      exerciseLogs: [], // no logs needed — deferredIds is the only trigger
      available: new Set(["dumbbells", "gym"] as const) as Set<never>,
      phaseIndex: 1,
      experienceLevel: "Intermediate",
      painAreas: [],
      deferredIds: new Set([hingeD3]), // ← what Modify sets
    });

    expect(decision.kind).toBe("regress");
    expect(decision.trace).toMatch(/deferred by user/);
  });
});
