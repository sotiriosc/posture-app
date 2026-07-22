/**
 * Phase 3.5 — phaseGatingDeterminism.test.ts
 *
 * Verifies that the gating evaluator is fully deterministic:
 * same inputs always produce identical outputs across N independent calls.
 *
 * Also extends the existing determinism matrix with gating scenarios:
 *   - quick-adapter (criteria met at session 8)
 *   - slow-adapter (criteria not met until session 20)
 *   - partial-criteria (some criteria met, some not)
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
  ACTIVATION_CONSISTENCY_WINDOW,
} from "@/lib/program/phaseGatingConstants";
import type { LadderState, GatingVerdict, PhaseTransitionState } from "@/lib/types";

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

/** Deep-equal two verdicts (all fields except internal object identity). */
const verdictsEqual = (a: GatingVerdict, b: GatingVerdict): boolean =>
  JSON.stringify(a) === JSON.stringify(b);

const statesEqual = (a: PhaseTransitionState, b: PhaseTransitionState): boolean =>
  JSON.stringify(a) === JSON.stringify(b);

// ---------------------------------------------------------------------------
// Determinism matrix
// ---------------------------------------------------------------------------

type DeterminismScenario = {
  label: string;
  input: PhaseGatingInput;
  expectedVerdict: "advance" | "hold";
};

const N_RUNS = 5;

const SCENARIOS: DeterminismScenario[] = [
  {
    label: "quick-adapter: all criteria met at session 8 (below min 10) → hold until min",
    input: {
      phase: "activation",
      sessionsInPhase: 8,
      recentSessions: nGreen(ACTIVATION_CONSISTENCY_WINDOW),
      ladderState: {
        byPattern: {
          hinge: { exerciseId: "hip-hinge-drill", pattern: "hinge", difficulty: 2, cleanSessionsCount: 2, requiredForAdvance: 2, inHysteresis: false, lastDecisionTrace: "" },
          knee_dominant: { exerciseId: "goblet-squat", pattern: "knee_dominant", difficulty: 2, cleanSessionsCount: 2, requiredForAdvance: 2, inHysteresis: false, lastDecisionTrace: "" },
        },
      } satisfies LadderState,
      rungsClimbedSincePhaseStart: { hinge: 1, knee_dominant: 1 },
      deferredExerciseCount: 0,
      trainingIntent: "build",
    },
    expectedVerdict: "hold",
  },
  {
    label: "quick-adapter: all criteria met at session 10 (exactly min) → advance",
    input: {
      phase: "activation",
      sessionsInPhase: ACTIVATION_MIN_SESSIONS,
      recentSessions: nGreen(ACTIVATION_CONSISTENCY_WINDOW),
      ladderState: {
        byPattern: {
          hinge: { exerciseId: "hip-hinge-drill", pattern: "hinge", difficulty: 2, cleanSessionsCount: 2, requiredForAdvance: 2, inHysteresis: false, lastDecisionTrace: "" },
          knee_dominant: { exerciseId: "goblet-squat", pattern: "knee_dominant", difficulty: 2, cleanSessionsCount: 2, requiredForAdvance: 2, inHysteresis: false, lastDecisionTrace: "" },
        },
      } satisfies LadderState,
      rungsClimbedSincePhaseStart: { hinge: 1, knee_dominant: 1 },
      deferredExerciseCount: 0,
      trainingIntent: "build",
    },
    expectedVerdict: "advance",
  },
  {
    label: "slow-adapter: criteria not met at session 15 → hold",
    input: {
      phase: "activation",
      sessionsInPhase: 15,
      recentSessions: [
        ...nGreen(2),
        { completed: "partial" as const, maxPain: "severe" as const, confidenceBand: "low" as const, effortBand: "high" as const },
        { completed: "no" as const, maxPain: "mild" as const, confidenceBand: "low" as const, effortBand: "high" as const },
        { completed: "partial" as const, maxPain: "none" as const, confidenceBand: "low" as const, effortBand: "moderate" as const },
      ],
      ladderState: {
        byPattern: {
          hinge: { exerciseId: "hip-hinge-drill", pattern: "hinge", difficulty: 1, cleanSessionsCount: 1, requiredForAdvance: 2, inHysteresis: false, lastDecisionTrace: "" },
        },
      } satisfies LadderState,
      rungsClimbedSincePhaseStart: { hinge: 0 },
      deferredExerciseCount: 1,
      trainingIntent: "build",
    },
    expectedVerdict: "hold",
  },
  {
    label: "slow-adapter: reaches max at session 21 → advance (ceiling)",
    input: {
      phase: "activation",
      sessionsInPhase: ACTIVATION_MAX_SESSIONS,
      recentSessions: nGreen(ACTIVATION_CONSISTENCY_WINDOW),
      ladderState: {
        byPattern: {
          hinge: { exerciseId: "hip-hinge-drill", pattern: "hinge", difficulty: 1, cleanSessionsCount: 1, requiredForAdvance: 2, inHysteresis: false, lastDecisionTrace: "" },
        },
      } satisfies LadderState,
      rungsClimbedSincePhaseStart: { hinge: 0 },
      deferredExerciseCount: 3,
      trainingIntent: "build",
    },
    expectedVerdict: "advance",
  },
  {
    label: "skill phase: min met + all criteria → advance",
    input: {
      phase: "skill",
      sessionsInPhase: SKILL_MIN_SESSIONS,
      recentSessions: nGreen(10),
      ladderState: {
        byPattern: {
          hinge: { exerciseId: "db-rdl", pattern: "hinge", difficulty: 4, cleanSessionsCount: 3, requiredForAdvance: 2, inHysteresis: false, lastDecisionTrace: "" },
          knee_dominant: { exerciseId: "barbell-squat", pattern: "knee_dominant", difficulty: 3, cleanSessionsCount: 3, requiredForAdvance: 2, inHysteresis: false, lastDecisionTrace: "" },
          horizontal_pull: { exerciseId: "db-row", pattern: "horizontal_pull", difficulty: 3, cleanSessionsCount: 3, requiredForAdvance: 2, inHysteresis: false, lastDecisionTrace: "" },
        },
      } satisfies LadderState,
      rungsClimbedSincePhaseStart: { hinge: 1, knee_dominant: 1, horizontal_pull: 1 },
      activationSacrificeQueueCleared: true,
      trainingIntent: "build",
    },
    expectedVerdict: "advance",
  },
  {
    label: "growth phase: always holds",
    input: {
      phase: "growth",
      sessionsInPhase: 50,
      recentSessions: nGreen(10),
      trainingIntent: "build",
    },
    expectedVerdict: "hold",
  },
  {
    label: "maintain mode: criteria met → still holds",
    input: {
      phase: "activation",
      sessionsInPhase: ACTIVATION_MIN_SESSIONS,
      recentSessions: nGreen(ACTIVATION_CONSISTENCY_WINDOW),
      ladderState: {
        byPattern: {
          hinge: { exerciseId: "hip-hinge-drill", pattern: "hinge", difficulty: 2, cleanSessionsCount: 2, requiredForAdvance: 2, inHysteresis: false, lastDecisionTrace: "" },
          knee_dominant: { exerciseId: "goblet-squat", pattern: "knee_dominant", difficulty: 2, cleanSessionsCount: 2, requiredForAdvance: 2, inHysteresis: false, lastDecisionTrace: "" },
        },
      } satisfies LadderState,
      rungsClimbedSincePhaseStart: { hinge: 1, knee_dominant: 1 },
      deferredExerciseCount: 0,
      trainingIntent: "maintain",
    },
    expectedVerdict: "hold",
  },
  {
    label: "rehab mode: all criteria met, max sessions exceeded → still holds",
    input: {
      phase: "activation",
      sessionsInPhase: ACTIVATION_MAX_SESSIONS + 10,
      recentSessions: nGreen(ACTIVATION_CONSISTENCY_WINDOW),
      ladderState: {
        byPattern: {
          hinge: { exerciseId: "hip-hinge-drill", pattern: "hinge", difficulty: 2, cleanSessionsCount: 2, requiredForAdvance: 2, inHysteresis: false, lastDecisionTrace: "" },
          knee_dominant: { exerciseId: "goblet-squat", pattern: "knee_dominant", difficulty: 2, cleanSessionsCount: 2, requiredForAdvance: 2, inHysteresis: false, lastDecisionTrace: "" },
        },
      } satisfies LadderState,
      rungsClimbedSincePhaseStart: { hinge: 1, knee_dominant: 1 },
      deferredExerciseCount: 0,
      trainingIntent: "rehab",
    },
    expectedVerdict: "hold",
  },
];

describe("phaseGatingDeterminism", () => {
  SCENARIOS.forEach(({ label, input, expectedVerdict }) => {
    test(`verdict is correct and deterministic — ${label}`, () => {
      // Run N times, verify same result every time
      const results = Array.from({ length: N_RUNS }, () => computeReadinessVerdict(input));

      // Correctness
      expect(results[0]!.verdict, `expected verdict "${expectedVerdict}" for: ${label}`).toBe(expectedVerdict);

      // Determinism — all results must be identical
      for (let i = 1; i < N_RUNS; i++) {
        expect(
          verdictsEqual(results[0]!, results[i]!),
          `Run ${i + 1} differed from run 1 for: ${label}`
        ).toBe(true);
      }
    });
  });

  test("PhaseTransitionState is deterministic across N builds", () => {
    const input = SCENARIOS[1]!.input; // quick-adapter at session 10
    const verdict = computeReadinessVerdict(input);

    const states = Array.from({ length: N_RUNS }, () =>
      buildPhaseTransitionState({ verdict, input })
    );

    for (let i = 1; i < N_RUNS; i++) {
      expect(
        statesEqual(states[0]!, states[i]!),
        `PhaseTransitionState run ${i + 1} differed from run 1`
      ).toBe(true);
    }
  });

  test("incrementally advancing session counts produce monotonically increasing satisfiedCount or stable verdict", () => {
    // As sessions accumulate, the verdict should either hold or advance — never
    // revert from advance to hold within the same criteria state.
    const sessionsRange = Array.from({ length: 25 }, (_, i) => i + 1);
    let prevVerdict: "advance" | "hold" | null = null;

    sessionsRange.forEach((sessionsInPhase) => {
      const input: PhaseGatingInput = {
        phase: "activation",
        sessionsInPhase,
        recentSessions: nGreen(ACTIVATION_CONSISTENCY_WINDOW),
        rungsClimbedSincePhaseStart: { hinge: 1, knee_dominant: 1 },
        deferredExerciseCount: 0,
        trainingIntent: "build",
      };
      const result = computeReadinessVerdict(input);

      // Once advance fires, it can't revert to hold (idempotent ceiling).
      if (prevVerdict === "advance") {
        expect(result.verdict).toBe("advance");
      }

      prevVerdict = result.verdict;
    });
  });

  test("trace format is stable across N calls (no timestamps or random tokens)", () => {
    const input = SCENARIOS[0]!.input;
    const traces = Array.from({ length: N_RUNS }, () => computeReadinessVerdict(input).trace);

    // All traces must be identical strings
    traces.forEach((trace, i) => {
      expect(trace, `trace run ${i + 1} differed`).toBe(traces[0]);
    });

    // Trace must NOT contain any date-time-like tokens
    expect(traces[0]).not.toMatch(/\d{4}-\d{2}-\d{2}/);
    expect(traces[0]).not.toMatch(/Date\.now/);
  });
});
