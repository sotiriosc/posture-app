/**
 * Phase 3.5 — phaseGatingCriteria.test.ts
 *
 * Tests the per-criterion gating logic for activation and skill phases.
 *
 * Strategy: each "criterion individually fails → must hold" test starts from
 * a base where EXACTLY the required number of criteria are satisfied.
 * Failing one of those drops below the threshold → hold.
 *
 *   Activation: ≥3 of 5 → base has exactly 3 passing; fail one → 2/5 → hold.
 *   Skill:      ≥4 of 6 → base has exactly 4 passing; fail one → 3/6 → hold.
 *
 * Additional tests:
 *   (3) All criteria met AND min passed → advance.
 *   (4) All criteria met but min NOT passed → hold.
 *   (5) Max sessions reached with criteria unmet → advance (ceiling).
 */

import { describe, expect, test } from "vitest";
import {
  computeReadinessVerdict,
  type PhaseGatingInput,
  type SessionSnapshot,
} from "@/lib/program/phaseGatingEvaluator";
import {
  ACTIVATION_MIN_SESSIONS,
  ACTIVATION_MAX_SESSIONS,
  ACTIVATION_CONSISTENCY_WINDOW,
  SKILL_MIN_SESSIONS,
  SKILL_MAX_SESSIONS,
  SKILL_CONSISTENCY_WINDOW,
  SKILL_PAIN_TREND_WINDOW,
  SKILL_EFFORT_TREND_WINDOW,
} from "@/lib/program/phaseGatingConstants";
import type { LadderState } from "@/lib/types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const green = (): SessionSnapshot => ({
  completed: "yes",
  maxPain: "none",
  effortBand: "moderate",
  confidenceBand: "moderate",
});

const nGreen = (n: number): SessionSnapshot[] => Array.from({ length: n }, green);

// ---------------------------------------------------------------------------
// Activation phase
//
// Required: ≥3 of 5 criteria.
//
// "Barely passing" base (exactly 3/5 pass):
//   ✓ consistency    — all 5 sessions completed "yes"
//   ✓ pain_signal    — no severe pain in last 5
//   ✓ sacrifice_load — 0 deferred
//   ✗ rungs_climbed  — 0 patterns climbed (forced fail)
//   ✗ confidence     — all low confidence (forced fail)
//
// Each test fails ONE of the ✓ criteria → 2/5 → hold.
// ---------------------------------------------------------------------------

const barelyPassingActivation = (overrides: Partial<PhaseGatingInput> = {}): PhaseGatingInput => ({
  phase: "activation",
  sessionsInPhase: ACTIVATION_MIN_SESSIONS,
  // 5 sessions: all completed, no pain, but LOW confidence (confidence ✗)
  recentSessions: Array.from({ length: ACTIVATION_CONSISTENCY_WINDOW }, () => ({
    completed: "yes" as const,
    maxPain: "none" as const,
    effortBand: "moderate" as const,
    confidenceBand: "low" as const, // confidence criterion fails
  })),
  ladderState: {
    byPattern: {
      hinge: {
        exerciseId: "hip-hinge-drill",
        pattern: "hinge",
        difficulty: 1, // no rung climb (still d1)
        cleanSessionsCount: 1,
        requiredForAdvance: 2,
        inHysteresis: false,
        lastDecisionTrace: "",
      },
    },
  } satisfies LadderState,
  rungsClimbedSincePhaseStart: { hinge: 0 }, // rungs_climbed ✗
  deferredExerciseCount: 0, // sacrifice_load ✓
  trainingIntent: "build",
  ...overrides,
});

describe("phaseGatingCriteria — activation phase", () => {
  test("all criteria met + min passed → advance", () => {
    const result = computeReadinessVerdict({
      phase: "activation",
      sessionsInPhase: ACTIVATION_MIN_SESSIONS,
      recentSessions: nGreen(ACTIVATION_CONSISTENCY_WINDOW),
      ladderState: {
        byPattern: {
          hinge: { exerciseId: "h", pattern: "hinge", difficulty: 2, cleanSessionsCount: 2, requiredForAdvance: 2, inHysteresis: false, lastDecisionTrace: "" },
          knee_dominant: { exerciseId: "k", pattern: "knee_dominant", difficulty: 2, cleanSessionsCount: 2, requiredForAdvance: 2, inHysteresis: false, lastDecisionTrace: "" },
        },
      } satisfies LadderState,
      rungsClimbedSincePhaseStart: { hinge: 1, knee_dominant: 1 },
      deferredExerciseCount: 0,
      trainingIntent: "build",
    });
    expect(result.verdict).toBe("advance");
    expect(result.reason).toBe("criteria_met");
    expect(result.trace).toContain("advance activation");
    expect(result.trace).toContain("sessions passed");
  });

  test("all criteria met but min NOT passed → hold (still in min window)", () => {
    const result = computeReadinessVerdict({
      phase: "activation",
      sessionsInPhase: ACTIVATION_MIN_SESSIONS - 1,
      recentSessions: nGreen(ACTIVATION_CONSISTENCY_WINDOW),
      ladderState: {
        byPattern: {
          hinge: { exerciseId: "h", pattern: "hinge", difficulty: 2, cleanSessionsCount: 2, requiredForAdvance: 2, inHysteresis: false, lastDecisionTrace: "" },
          knee_dominant: { exerciseId: "k", pattern: "knee_dominant", difficulty: 2, cleanSessionsCount: 2, requiredForAdvance: 2, inHysteresis: false, lastDecisionTrace: "" },
        },
      } satisfies LadderState,
      rungsClimbedSincePhaseStart: { hinge: 1, knee_dominant: 1 },
      deferredExerciseCount: 0,
      trainingIntent: "build",
    });
    expect(result.verdict).toBe("hold");
    expect(result.reason).toBe("min_not_reached");
    expect(result.trace).toContain("min");
  });

  test("max sessions reached with criteria unmet → advance (safety ceiling)", () => {
    // Start from barely-passing but override to have 0 criteria satisfied and max sessions
    const result = computeReadinessVerdict(
      barelyPassingActivation({
        sessionsInPhase: ACTIVATION_MAX_SESSIONS,
        // Break all passing criteria too
        recentSessions: Array.from({ length: ACTIVATION_CONSISTENCY_WINDOW }, () => ({
          completed: "no" as const,
          maxPain: "severe" as const,
          effortBand: "high" as const,
          confidenceBand: "low" as const,
        })),
        deferredExerciseCount: 5,
      })
    );
    expect(result.verdict).toBe("advance");
    expect(result.reason).toBe("max_reached");
    expect(result.trace).toContain("max reached");
  });

  // ── Individual criterion failure tests (each drops 3→2, causing hold) ────

  test("(A-crit1) fail rungs_climbed (already failing in base) → confirm hold", () => {
    // Base has rungs ✗ + confidence ✗ → 3/5. Verify the base holds when
    // one more criterion (pain_signal) is also broken → 2/5 hold.
    const result = computeReadinessVerdict(
      barelyPassingActivation({
        recentSessions: Array.from({ length: ACTIVATION_CONSISTENCY_WINDOW }, () => ({
          completed: "yes" as const,
          maxPain: "severe" as const, // break pain_signal
          effortBand: "moderate" as const,
          confidenceBand: "low" as const,
        })),
      })
    );
    const rungsResult = result.criteriaResults.find((c) => c.criterion === "rungs_climbed");
    const painResult = result.criteriaResults.find((c) => c.criterion === "pain_signal");
    expect(rungsResult?.satisfied).toBe(false);
    expect(painResult?.satisfied).toBe(false);
    expect(result.verdict).toBe("hold");
  });

  test("(A-crit2) fail consistency (break one session) → 2/5 → hold", () => {
    const sessions = Array.from({ length: ACTIVATION_CONSISTENCY_WINDOW }, () => ({
      completed: "yes" as const,
      maxPain: "none" as const,
      effortBand: "moderate" as const,
      confidenceBand: "low" as const,
    }));
    sessions[sessions.length - 1]!.completed = "no"; // break consistency
    const result = computeReadinessVerdict(
      barelyPassingActivation({ recentSessions: sessions })
    );
    const consistencyResult = result.criteriaResults.find((c) => c.criterion === "consistency");
    expect(consistencyResult?.satisfied).toBe(false);
    // rungs_climbed ✗ + confidence ✗ + consistency ✗ = 2/5 satisfied → hold
    expect(result.verdict).toBe("hold");
  });

  test("(A-crit3) fail pain_signal (severe pain in window) → 2/5 → hold", () => {
    const sessions = Array.from({ length: ACTIVATION_CONSISTENCY_WINDOW }, () => ({
      completed: "yes" as const,
      maxPain: "none" as const,
      effortBand: "moderate" as const,
      confidenceBand: "low" as const,
    }));
    sessions[0]!.maxPain = "severe";
    const result = computeReadinessVerdict(
      barelyPassingActivation({ recentSessions: sessions })
    );
    const painResult = result.criteriaResults.find((c) => c.criterion === "pain_signal");
    expect(painResult?.satisfied).toBe(false);
    expect(result.verdict).toBe("hold");
  });

  test("(A-crit4) fail sacrifice_load (deferredCount >= 2) → 2/5 → hold", () => {
    const result = computeReadinessVerdict(
      barelyPassingActivation({ deferredExerciseCount: 2 }) // 2 >= ACTIVATION_MAX_DEFERRED(2)
    );
    const sacrificeResult = result.criteriaResults.find((c) => c.criterion === "sacrifice_load");
    expect(sacrificeResult?.satisfied).toBe(false);
    expect(result.verdict).toBe("hold");
  });

  test("(A-crit5) fail confidence — already failing in base, confirm it is evaluated", () => {
    // confidence is already failing in barelyPassingActivation (all low confidence)
    const result = computeReadinessVerdict(barelyPassingActivation());
    const confResult = result.criteriaResults.find((c) => c.criterion === "confidence");
    expect(confResult?.satisfied).toBe(false);
    // Base is exactly 3/5 → advance (not hold); this just validates evaluation
    expect(result.criteriaResults.filter((c) => c.satisfied).length).toBe(3);
  });

  test("trace includes all criterion names with numbers", () => {
    const result = computeReadinessVerdict(barelyPassingActivation());
    expect(result.trace).toContain("rungs_climbed");
    expect(result.trace).toContain("consistency");
    expect(result.trace).toContain("pain_signal");
    expect(result.trace).toContain("sacrifice_load");
    expect(result.trace).toContain("confidence");
  });
});

// ---------------------------------------------------------------------------
// Skill phase
//
// Required: ≥4 of 6 criteria.
//
// "Barely passing" base (exactly 4/6 pass):
//   ✓ consistency              — 7/7 completed
//   ✓ pain_trend               — no escalation
//   ✓ sacrifice_retest         — queue cleared
//   ✓ ladder_ceiling_proximity — one pattern at d4+
//   ✗ rungs_climbed            — only 2 patterns (need 3)
//   ✗ effort_trend             — all high effort
//
// Each test fails ONE of the ✓ criteria → 3/6 → hold.
// ---------------------------------------------------------------------------

const skillWindow = Math.max(
  SKILL_CONSISTENCY_WINDOW,
  SKILL_PAIN_TREND_WINDOW,
  SKILL_EFFORT_TREND_WINDOW
);

const barelyPassingSkill = (overrides: Partial<PhaseGatingInput> = {}): PhaseGatingInput => ({
  phase: "skill",
  sessionsInPhase: SKILL_MIN_SESSIONS,
  // All sessions completed, no pain, but ALL high effort (effort_trend ✗)
  recentSessions: Array.from({ length: skillWindow }, () => ({
    completed: "yes" as const,
    maxPain: "none" as const,
    effortBand: "high" as const, // effort_trend ✗
    confidenceBand: "moderate" as const,
  })),
  ladderState: {
    byPattern: {
      hinge: { exerciseId: "db-rdl", pattern: "hinge", difficulty: 4, cleanSessionsCount: 3, requiredForAdvance: 2, inHysteresis: false, lastDecisionTrace: "" },
      knee_dominant: { exerciseId: "barbell-squat", pattern: "knee_dominant", difficulty: 3, cleanSessionsCount: 3, requiredForAdvance: 2, inHysteresis: false, lastDecisionTrace: "" },
      // Only 2 patterns tracked → rungs_climbed ✗ (needs 3)
    },
  } satisfies LadderState,
  rungsClimbedSincePhaseStart: { hinge: 1, knee_dominant: 1 }, // 2 climbed, need 3 → ✗
  deferredExerciseCount: 0,
  activationSacrificeQueueCleared: true, // sacrifice_retest ✓
  trainingIntent: "build",
  ...overrides,
});

describe("phaseGatingCriteria — skill phase", () => {
  test("all criteria met + min passed → advance", () => {
    const result = computeReadinessVerdict({
      phase: "skill",
      sessionsInPhase: SKILL_MIN_SESSIONS,
      recentSessions: nGreen(skillWindow),
      ladderState: {
        byPattern: {
          hinge: { exerciseId: "db-rdl", pattern: "hinge", difficulty: 4, cleanSessionsCount: 3, requiredForAdvance: 2, inHysteresis: false, lastDecisionTrace: "" },
          knee_dominant: { exerciseId: "bs", pattern: "knee_dominant", difficulty: 3, cleanSessionsCount: 3, requiredForAdvance: 2, inHysteresis: false, lastDecisionTrace: "" },
          horizontal_pull: { exerciseId: "dr", pattern: "horizontal_pull", difficulty: 3, cleanSessionsCount: 3, requiredForAdvance: 2, inHysteresis: false, lastDecisionTrace: "" },
        },
      } satisfies LadderState,
      rungsClimbedSincePhaseStart: { hinge: 1, knee_dominant: 1, horizontal_pull: 1 },
      deferredExerciseCount: 0,
      activationSacrificeQueueCleared: true,
      trainingIntent: "build",
    });
    expect(result.verdict).toBe("advance");
    expect(result.reason).toBe("criteria_met");
    expect(result.trace).toContain("advance skill");
  });

  test("all criteria met but min NOT passed → hold", () => {
    const result = computeReadinessVerdict({
      phase: "skill",
      sessionsInPhase: SKILL_MIN_SESSIONS - 1,
      recentSessions: nGreen(skillWindow),
      ladderState: {
        byPattern: {
          hinge: { exerciseId: "db-rdl", pattern: "hinge", difficulty: 4, cleanSessionsCount: 3, requiredForAdvance: 2, inHysteresis: false, lastDecisionTrace: "" },
          knee_dominant: { exerciseId: "bs", pattern: "knee_dominant", difficulty: 3, cleanSessionsCount: 3, requiredForAdvance: 2, inHysteresis: false, lastDecisionTrace: "" },
          horizontal_pull: { exerciseId: "dr", pattern: "horizontal_pull", difficulty: 3, cleanSessionsCount: 3, requiredForAdvance: 2, inHysteresis: false, lastDecisionTrace: "" },
        },
      } satisfies LadderState,
      rungsClimbedSincePhaseStart: { hinge: 1, knee_dominant: 1, horizontal_pull: 1 },
      activationSacrificeQueueCleared: true,
      trainingIntent: "build",
    });
    expect(result.verdict).toBe("hold");
    expect(result.reason).toBe("min_not_reached");
  });

  test("max sessions reached with criteria unmet → advance (safety ceiling)", () => {
    const result = computeReadinessVerdict(
      barelyPassingSkill({
        sessionsInPhase: SKILL_MAX_SESSIONS,
        activationSacrificeQueueCleared: false, // break one more
      })
    );
    expect(result.verdict).toBe("advance");
    expect(result.reason).toBe("max_reached");
  });

  // ── Individual criterion failure tests (each drops 4→3, causing hold) ────

  test("(S-crit1) fail rungs_climbed — already failing in base, confirm 4/6 pass without it", () => {
    const result = computeReadinessVerdict(barelyPassingSkill());
    const rungsResult = result.criteriaResults.find((c) => c.criterion === "rungs_climbed");
    expect(rungsResult?.satisfied).toBe(false);
    // Base is exactly 4/6 satisfied → advance
    expect(result.criteriaResults.filter((c) => c.satisfied).length).toBe(4);
  });

  test("(S-crit2) fail consistency (break one session) → 3/6 → hold", () => {
    const sessions = Array.from({ length: skillWindow }, () => ({
      completed: "yes" as const,
      maxPain: "none" as const,
      effortBand: "high" as const,
      confidenceBand: "moderate" as const,
    }));
    sessions[3]!.completed = "no"; // break consistency
    const result = computeReadinessVerdict(barelyPassingSkill({ recentSessions: sessions }));
    const consistencyResult = result.criteriaResults.find((c) => c.criterion === "consistency");
    expect(consistencyResult?.satisfied).toBe(false);
    expect(result.verdict).toBe("hold");
  });

  test("(S-crit3) fail pain_trend (escalation mild→moderate) → 3/6 → hold", () => {
    const sessions = Array.from({ length: skillWindow }, () => ({
      completed: "yes" as const,
      maxPain: "none" as const,
      effortBand: "high" as const,
      confidenceBand: "moderate" as const,
    }));
    // Inject escalation
    sessions[2]!.maxPain = "mild";
    sessions[3]!.maxPain = "moderate";
    const result = computeReadinessVerdict(barelyPassingSkill({ recentSessions: sessions }));
    const painResult = result.criteriaResults.find((c) => c.criterion === "pain_trend");
    expect(painResult?.satisfied).toBe(false);
    expect(result.verdict).toBe("hold");
  });

  test("(S-crit4) fail sacrifice_retest (queue not cleared) → 3/6 → hold", () => {
    const result = computeReadinessVerdict(
      barelyPassingSkill({ activationSacrificeQueueCleared: false })
    );
    const retestResult = result.criteriaResults.find((c) => c.criterion === "sacrifice_retest");
    expect(retestResult?.satisfied).toBe(false);
    expect(result.verdict).toBe("hold");
  });

  test("(S-crit5) fail effort_trend — already failing in base, confirm 4/6 pass without it", () => {
    const result = computeReadinessVerdict(barelyPassingSkill());
    const effortResult = result.criteriaResults.find((c) => c.criterion === "effort_trend");
    expect(effortResult?.satisfied).toBe(false);
    // Base passes 4/6 exactly
    expect(result.criteriaResults.filter((c) => c.satisfied).length).toBe(4);
  });

  test("(S-crit6) fail ladder_ceiling_proximity (no patterns at d4+) → 3/6 → hold", () => {
    const result = computeReadinessVerdict(
      barelyPassingSkill({
        ladderState: {
          byPattern: {
            hinge: { exerciseId: "db-rdl", pattern: "hinge", difficulty: 3, cleanSessionsCount: 3, requiredForAdvance: 2, inHysteresis: false, lastDecisionTrace: "" },
            knee_dominant: { exerciseId: "bs", pattern: "knee_dominant", difficulty: 3, cleanSessionsCount: 3, requiredForAdvance: 2, inHysteresis: false, lastDecisionTrace: "" },
          },
        } satisfies LadderState,
      })
    );
    const ceilingResult = result.criteriaResults.find((c) => c.criterion === "ladder_ceiling_proximity");
    expect(ceilingResult?.satisfied).toBe(false);
    expect(result.verdict).toBe("hold");
  });

  test("trace includes all six criterion names", () => {
    const result = computeReadinessVerdict(barelyPassingSkill());
    expect(result.trace).toContain("rungs_climbed");
    expect(result.trace).toContain("consistency");
    expect(result.trace).toContain("pain_trend");
    expect(result.trace).toContain("sacrifice_retest");
    expect(result.trace).toContain("effort_trend");
    expect(result.trace).toContain("ladder_ceiling_proximity");
  });
});

// ---------------------------------------------------------------------------
// Growth phase — never auto-advances
// ---------------------------------------------------------------------------

describe("phaseGatingCriteria — growth phase", () => {
  test("growth phase always holds regardless of criteria or session count", () => {
    const result = computeReadinessVerdict({
      phase: "growth",
      sessionsInPhase: 100,
      recentSessions: nGreen(10),
      trainingIntent: "build",
    });
    expect(result.verdict).toBe("hold");
    expect(result.trace).toContain("growth");
    expect(result.trace).toContain("no auto-advance");
  });
});
