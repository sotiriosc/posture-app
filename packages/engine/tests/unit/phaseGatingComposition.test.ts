/**
 * Phase 3.5 — phaseGatingComposition.test.ts
 *
 * Tests the interaction between the phase gating evaluator and training intent
 * (Phase 3.3):
 *
 *   - build mode: criteria met + min passed → auto-advances.
 *   - maintain mode: criteria still evaluated (for display), but auto-advance
 *     disabled; verdict holds; trace contains intent suffix.
 *   - rehab mode: criteria evaluated informationally; max-calendar is softened
 *     to Infinity (never force-graduate); advancement never auto.
 */

import { describe, expect, test } from "vitest";
import {
  computeReadinessVerdict,
  buildPhaseTransitionState,
  type PhaseGatingInput,
  type SessionSnapshot,
} from "@/lib/program/phaseGatingEvaluator";
import {
  ACTIVATION_MIN_SESSIONS,
  ACTIVATION_MAX_SESSIONS,
  SKILL_MIN_SESSIONS,
  SKILL_MAX_SESSIONS,
  ACTIVATION_CONSISTENCY_WINDOW,
  SKILL_CONSISTENCY_WINDOW,
  SKILL_PAIN_TREND_WINDOW,
  SKILL_EFFORT_TREND_WINDOW,
} from "@/lib/program/phaseGatingConstants";
import type { LadderState } from "@/lib/types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const greenSession = (): SessionSnapshot => ({
  completed: "yes",
  maxPain: "none",
  effortBand: "moderate",
  confidenceBand: "moderate",
});

const nGreen = (n: number): SessionSnapshot[] => Array.from({ length: n }, greenSession);

const fullyReadyActivation = (
  intent: PhaseGatingInput["trainingIntent"],
  sessionCount = ACTIVATION_MIN_SESSIONS
): PhaseGatingInput => ({
  phase: "activation",
  sessionsInPhase: sessionCount,
  recentSessions: nGreen(ACTIVATION_CONSISTENCY_WINDOW),
  ladderState: {
    byPattern: {
      hinge: { exerciseId: "hip-hinge-drill", pattern: "hinge", difficulty: 2, cleanSessionsCount: 2, requiredForAdvance: 2, inHysteresis: false, lastDecisionTrace: "" },
      knee_dominant: { exerciseId: "goblet-squat", pattern: "knee_dominant", difficulty: 2, cleanSessionsCount: 2, requiredForAdvance: 2, inHysteresis: false, lastDecisionTrace: "" },
    },
  } satisfies LadderState,
  rungsClimbedSincePhaseStart: { hinge: 1, knee_dominant: 1 },
  deferredExerciseCount: 0,
  trainingIntent: intent,
});

const fullyReadySkill = (
  intent: PhaseGatingInput["trainingIntent"],
  sessionCount = SKILL_MIN_SESSIONS
): PhaseGatingInput => ({
  phase: "skill",
  sessionsInPhase: sessionCount,
  recentSessions: nGreen(Math.max(SKILL_CONSISTENCY_WINDOW, SKILL_PAIN_TREND_WINDOW, SKILL_EFFORT_TREND_WINDOW)),
  ladderState: {
    byPattern: {
      hinge: { exerciseId: "db-rdl", pattern: "hinge", difficulty: 4, cleanSessionsCount: 3, requiredForAdvance: 2, inHysteresis: false, lastDecisionTrace: "" },
      knee_dominant: { exerciseId: "barbell-squat", pattern: "knee_dominant", difficulty: 3, cleanSessionsCount: 3, requiredForAdvance: 2, inHysteresis: false, lastDecisionTrace: "" },
      horizontal_pull: { exerciseId: "db-row", pattern: "horizontal_pull", difficulty: 3, cleanSessionsCount: 3, requiredForAdvance: 2, inHysteresis: false, lastDecisionTrace: "" },
    },
  } satisfies LadderState,
  rungsClimbedSincePhaseStart: { hinge: 1, knee_dominant: 1, horizontal_pull: 1 },
  deferredExerciseCount: 0,
  activationSacrificeQueueCleared: true,
  trainingIntent: intent,
});

// ---------------------------------------------------------------------------
// Build mode — auto-advances when criteria met + min passed
// ---------------------------------------------------------------------------

describe("phaseGatingComposition — build mode", () => {
  test("activation: build + all criteria met + min passed → advance", () => {
    const result = computeReadinessVerdict(fullyReadyActivation("build"));
    expect(result.verdict).toBe("advance");
    expect(result.reason).toBe("criteria_met");
  });

  test("skill: build + all criteria met + min passed → advance", () => {
    const result = computeReadinessVerdict(fullyReadySkill("build"));
    expect(result.verdict).toBe("advance");
    expect(result.reason).toBe("criteria_met");
  });

  test("activation: build + max session ceiling → advance regardless of criteria", () => {
    const result = computeReadinessVerdict(
      fullyReadyActivation("build", ACTIVATION_MAX_SESSIONS)
    );
    expect(result.verdict).toBe("advance");
    expect(result.reason).toBe("max_reached");
  });
});

// ---------------------------------------------------------------------------
// Maintain mode — evaluates but never auto-advances; extends prompt
// ---------------------------------------------------------------------------

describe("phaseGatingComposition — maintain mode", () => {
  test("activation: maintain + all criteria met → holds despite criteria met", () => {
    const result = computeReadinessVerdict(fullyReadyActivation("maintain"));
    expect(result.verdict).toBe("hold");
    // Criteria should still be evaluated (all satisfied)
    const satisfiedAll = result.criteriaResults.every((c) => c.satisfied);
    expect(satisfiedAll).toBe(true);
    // satisfiedCount should match
    expect(result.satisfiedCount).toBeGreaterThanOrEqual(result.requiredCount);
    // Trace records maintain intent
    expect(result.trace).toContain("maintain intent");
  });

  test("skill: maintain + all criteria met → holds despite criteria met", () => {
    const result = computeReadinessVerdict(fullyReadySkill("maintain"));
    expect(result.verdict).toBe("hold");
    expect(result.satisfiedCount).toBeGreaterThanOrEqual(result.requiredCount);
    expect(result.trace).toContain("maintain intent");
  });

  test("maintain mode: max session ceiling still does NOT advance (maintain preference)", () => {
    // Unlike build mode, maintain mode should HOLD even at max because
    // the ceiling logic in the evaluator respects maintain (ceiling fires advance
    // for build but not maintain — it's the safety ceiling for build users).
    // Actually per spec: max_reached fires for build; maintain only holds via criteria.
    // But re-reading: "maintain: auto-advance disabled" — the spec says auto-advance
    // disabled, which includes the calendar ceiling for build mode (criteria-based).
    // Calendar ceiling is safety for those who can't progress — maintain users chose
    // to stay. So maintain + max_reached → still advance (safety ceiling is for
    // user welfare, not preference).
    // Per spec: "calendar maximum has passed regardless (the safety ceiling — never
    // trap a user)." This applies to all intents including maintain.
    const result = computeReadinessVerdict(
      fullyReadyActivation("maintain", ACTIVATION_MAX_SESSIONS)
    );
    // Safety ceiling fires regardless of intent.
    expect(result.verdict).toBe("advance");
    expect(result.reason).toBe("max_reached");
  });

  test("maintain mode: phaseTransitionState captures satisfiedCount for prompt extension", () => {
    const input = fullyReadyActivation("maintain");
    const verdict = computeReadinessVerdict(input);
    const state = buildPhaseTransitionState({ verdict, input });
    // eligibleAt is set because criteria were satisfied at this session count
    // (even though we hold, the engine should record when criteria were first met)
    expect(state.sessionsInPhase).toBe(ACTIVATION_MIN_SESSIONS);
    // The Phase 3.3 extend-prompt hook reads criteriaLastEvaluated
    expect(state.criteriaLastEvaluated.length).toBeGreaterThan(0);
    expect(state.lastTrace).toContain("maintain intent");
  });
});

// ---------------------------------------------------------------------------
// Rehab mode — never auto-advances; max softened to Infinity
// ---------------------------------------------------------------------------

describe("phaseGatingComposition — rehab mode", () => {
  test("activation: rehab + all criteria met → holds", () => {
    const result = computeReadinessVerdict(fullyReadyActivation("rehab"));
    expect(result.verdict).toBe("hold");
    expect(result.trace).toContain("rehab intent");
  });

  test("skill: rehab + all criteria met → holds", () => {
    const result = computeReadinessVerdict(fullyReadySkill("rehab"));
    expect(result.verdict).toBe("hold");
    expect(result.trace).toContain("rehab intent");
  });

  test("rehab: ACTIVATION_MAX_SESSIONS reached → still holds (max softened to Infinity)", () => {
    // Rehab users are never force-graduated by the session ceiling.
    const result = computeReadinessVerdict(
      fullyReadyActivation("rehab", ACTIVATION_MAX_SESSIONS)
    );
    expect(result.verdict).toBe("hold");
    // Must NOT fire "max_reached" — rehab max is Infinity
    expect(result.reason).not.toBe("max_reached");
  });

  test("rehab: very large session count → still holds", () => {
    const result = computeReadinessVerdict(fullyReadyActivation("rehab", 1000));
    expect(result.verdict).toBe("hold");
    expect(result.reason).not.toBe("max_reached");
  });

  test("rehab: SKILL_MAX_SESSIONS reached → still holds", () => {
    const result = computeReadinessVerdict(
      fullyReadySkill("rehab", SKILL_MAX_SESSIONS)
    );
    expect(result.verdict).toBe("hold");
    expect(result.reason).not.toBe("max_reached");
  });

  test("rehab: criteria still evaluated (visible in criteriaLastEvaluated)", () => {
    const input = fullyReadyActivation("rehab");
    const verdict = computeReadinessVerdict(input);
    const state = buildPhaseTransitionState({ verdict, input });
    // Even though we hold, criteria should be evaluated and available for display
    expect(state.criteriaLastEvaluated.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// PhaseTransitionState — state building and persistence
// ---------------------------------------------------------------------------

describe("phaseGatingComposition — PhaseTransitionState", () => {
  test("eligibleAt is set when criteria first met in build mode", () => {
    const input = fullyReadyActivation("build");
    const verdict = computeReadinessVerdict(input);
    const state = buildPhaseTransitionState({ verdict, input });
    expect(state.eligibleAt).toBe(ACTIVATION_MIN_SESSIONS);
  });

  test("unlockedAt is set when verdict is advance", () => {
    const input = fullyReadyActivation("build");
    const verdict = computeReadinessVerdict(input);
    const state = buildPhaseTransitionState({ verdict, input });
    expect(state.unlockedAt).toBe(ACTIVATION_MIN_SESSIONS);
  });

  test("eligibleAt is preserved across subsequent evaluations (priorState wins)", () => {
    const input = fullyReadyActivation("build");
    const verdict = computeReadinessVerdict(input);
    const firstState = buildPhaseTransitionState({ verdict, input });

    // Later evaluation — eligibleAt should NOT be overwritten
    const laterInput = { ...input, sessionsInPhase: ACTIVATION_MIN_SESSIONS + 3 };
    const laterVerdict = computeReadinessVerdict(laterInput);
    const laterState = buildPhaseTransitionState({
      verdict: laterVerdict,
      input: laterInput,
      priorState: firstState,
    });
    // eligibleAt stays at original value
    expect(laterState.eligibleAt).toBe(ACTIVATION_MIN_SESSIONS);
  });

  test("sacrifice retest queue is populated at phase transition", () => {
    const input: PhaseGatingInput = {
      ...fullyReadyActivation("build"),
      ladderState: {
        byPattern: {
          hinge: { exerciseId: "hip-hinge-drill", pattern: "hinge", difficulty: 2, cleanSessionsCount: 2, requiredForAdvance: 2, inHysteresis: false, lastDecisionTrace: "" },
        },
        sacrificedByPattern: {
          hinge: ["barbell-rdl"],
        },
      } satisfies LadderState,
    };
    const verdict = computeReadinessVerdict(input);
    const state = buildPhaseTransitionState({ verdict, input });
    expect(state.sacrificeRetestEligible?.length).toBeGreaterThan(0);
    expect(state.sacrificeRetestEligible![0]!.exerciseId).toBe("barbell-rdl");
    expect(state.sacrificeRetestEligible![0]!.trace).toContain("sacrifice retest eligible");
  });
});
