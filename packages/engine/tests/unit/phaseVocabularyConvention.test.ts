/**
 * Phase 6g Commit 3 — Step 1 characterization.
 *
 * BEFORE any display helper is written, establish what the real write paths
 * actually persist when a program advances through phases 1 → 2 → 3:
 *   - laddersClimbed / rungAdvancementHistory[].atPhase
 *   - phaseHistory[].phase (and phaseTransitionState.phase)
 *   - blockedExerciseIds[...].blockedAt.phase (SessionClient write mapping)
 *
 * The answers below are what the helper + tolerant reader must honor.
 * Do not "fix" the write paths in this file — observe only.
 */

import { describe, expect, test } from "vitest";
import type { ExerciseLog, LadderRungState, LadderState } from "@/lib/types";
import { generateWeeklyProgram } from "@/lib/program";
import { computeLadderState } from "@/lib/program/ladderAdvancement";
import {
  ACTIVATION_MIN_SESSIONS,
  SKILL_MIN_SESSIONS,
} from "@/lib/program/phaseGatingConstants";
import type { SessionSnapshot } from "@/lib/program/phaseGatingEvaluator";
import { projectResults } from "@/lib/results/resultsProjection";
import {
  formatPhaseName,
  phaseIndexFromPersistedStage,
} from "@/lib/phases";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

let seq = 0;
const makeLog = (
  overrides: Partial<ExerciseLog> & { exerciseId: string }
): ExerciseLog => ({
  id: `log-${++seq}`,
  userId: "local",
  sessionId: `sess-${seq}`,
  exerciseId: overrides.exerciseId,
  section: "main",
  originalExerciseId: null,
  substitutedExerciseId: null,
  programId: "prog-phase-vocab",
  dayIndex: 0,
  createdAt: `2026-04-${String((seq % 28) + 1).padStart(2, "0")}T10:00:00Z`,
  updatedAt: `2026-04-${String((seq % 28) + 1).padStart(2, "0")}T10:00:00Z`,
  loadType: "weighted",
  unit: "lb",
  weight: 100,
  reps: 12,
  repsBySet: [12, 12, 12],
  setsPlanned: 3,
  setsCompleted: 3,
  durationSec: null,
  workSecondsUsed: null,
  restSecondsUsed: null,
  rpe: 6,
  felt: "moderate",
  painLevel: "none",
  painLocation: null,
  nextTimeGuidance: null,
  feedbackNotes: null,
  notes: null,
  computedVolume: 3600,
  source: "local",
  deletedAt: null,
  ...overrides,
});

/** bodyweight-good-morning (d2) → db-rdl (d3); no phaseMin block, dumbbells only. */
const hingeD2 = "bodyweight-good-morning";

const advancingHingeState = (): LadderRungState => ({
  exerciseId: hingeD2,
  pattern: "hinge",
  difficulty: 2,
  cleanSessionsCount: 2,
  requiredForAdvance: 2,
  inHysteresis: false,
  lastDecisionTrace: "",
});

const twoCleanLogs = [
  makeLog({ exerciseId: hingeD2, createdAt: "2026-04-01T10:00:00Z" }),
  makeLog({ exerciseId: hingeD2, createdAt: "2026-04-08T10:00:00Z" }),
];

const availableEq = new Set([
  "dumbbells",
  "barbell",
  "cables",
  "gym",
] as const) as Set<never>;

const questionnaire: QuestionnaireData = {
  goals: "Build muscle",
  painAreas: [],
  experience: "Intermediate",
  daysPerWeek: 3,
  equipment: ["gym"],
};

const nGreen = (n: number): SessionSnapshot[] =>
  Array.from({ length: n }, () => ({
    completed: "yes" as const,
    maxPain: "none" as const,
    effortBand: "moderate" as const,
    confidenceBand: "moderate" as const,
  }));

/**
 * Mirrors apps/consumer/src/app/session/SessionClient.tsx handleBlockExercise
 * exactly — the LogPrefs write site is UI-side, so characterization of what
 * lands in blockedAt.phase has to re-express that ternary here. If this
 * assertion ever fails after a SessionClient edit, update this mirror first.
 */
const sessionClientBlockedAtPhase = (
  phaseIndex: number
): "activation" | "skill" | "growth" =>
  phaseIndex === 2 ? "growth" : phaseIndex === 1 ? "skill" : "activation";

/**
 * Mirrors apps/gyms MemberDrillIn climb-line display mapping
 * (atPhase number → curriculum stage word) prior to any helper.
 */
const memberDrillInStageFromAtPhase = (
  atPhase: number
): "activation" | "skill" | "growth" =>
  atPhase === 0 ? "activation" : atPhase === 1 ? "skill" : "growth";

// ---------------------------------------------------------------------------
// 1. atPhase — rungAdvancementHistory write path
// ---------------------------------------------------------------------------

describe("characterization: rungAdvancementHistory[].atPhase", () => {
  test("computeLadderState stores the phaseIndex argument verbatim (pass-through)", () => {
    const observed: Record<number, number | undefined> = {};

    for (const phaseIndex of [0, 1, 2, 3] as const) {
      const state = computeLadderState({
        currentLadderState: {
          byPattern: { hinge: advancingHingeState() },
        } satisfies LadderState,
        recentLogs: twoCleanLogs,
        activePatterns: ["hinge"],
        patternToInitExercise: {},
        available: availableEq,
        phaseIndex,
        experienceLevel: "Intermediate",
        painAreas: [],
        deferredIds: new Set(),
        trainingIntent: "build",
        sessionCount: 10 + phaseIndex,
      });
      const record = state.rungAdvancementHistory?.find(
        (r) => r.pattern === "hinge"
      );
      expect(record, `expected advance at phaseIndex=${phaseIndex}`).toBeDefined();
      observed[phaseIndex] = record!.atPhase;
      expect(record!.atPhase).toBe(phaseIndex);
    }

    // CONVENTION ANSWER (atPhase):
    // atPhase is NOT inherently 0-based or 1-based — it is a pass-through of
    // whatever phaseIndex the caller supplied to computeLadderState.
    // generateWeeklyProgram calls computeLadderState with
    //   phaseIndex: options?.phaseIndex ?? 0
    // so a missing options.phaseIndex writes atPhase=0, while a normal
    // generateWeeklyProgram({ phaseIndex: 1|2|3 }) write (matching
    // getPhaseMetaByIndex's 1-based world) writes atPhase=1|2|3.
    // The 12-week climber golden fixture hand-authors atPhase: 0 for climbs
    // that occurred during "activation", which is a 0-based authoring
    // convention — NOT what the live write path produces when called with
    // phaseIndex=1.
    expect(observed).toEqual({ 0: 0, 1: 1, 2: 2, 3: 3 });
  });

  test("generateWeeklyProgram with phaseIndex 1|2|3 writes the same values into atPhase", () => {
    for (const phaseIndex of [1, 2, 3] as const) {
      const program = generateWeeklyProgram(
        questionnaire,
        `phase-vocab-ladder-${phaseIndex}`,
        {
          phaseIndex,
          seed: `phase-vocab-ladder-${phaseIndex}`,
          currentLadderState: {
            byPattern: { hinge: advancingHingeState() },
          },
          recentLogs: twoCleanLogs,
          trainingIntent: "build",
        }
      );
      const record = program.ladderState?.rungAdvancementHistory?.find(
        (r) => r.pattern === "hinge"
      );
      // May or may not advance depending on equipment/phase gates; if it did,
      // atPhase must equal the options.phaseIndex we passed.
      if (record) {
        expect(record.atPhase).toBe(phaseIndex);
      }
      // projectResults must surface the same number unchanged.
      if (record) {
        const climbed = projectResults(program, twoCleanLogs).laddersClimbed.find(
          (c) => c.pattern === "hinge"
        );
        expect(climbed?.atPhase).toBe(phaseIndex);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// 2. phaseHistory[].phase — generateWeeklyProgram write path
// ---------------------------------------------------------------------------

describe("characterization: phaseHistory[].phase + phaseTransitionState.phase", () => {
  const advancingSnapshots = (n: number) => nGreen(Math.max(n, 5));

  const strongLadder: LadderState = {
    byPattern: {
      hinge: {
        exerciseId: "hip-hinge-drill",
        pattern: "hinge",
        difficulty: 2,
        cleanSessionsCount: 2,
        requiredForAdvance: 2,
        inHysteresis: false,
        lastDecisionTrace: "",
      },
      knee_dominant: {
        exerciseId: "goblet-squat",
        pattern: "knee_dominant",
        difficulty: 2,
        cleanSessionsCount: 2,
        requiredForAdvance: 2,
        inHysteresis: false,
        lastDecisionTrace: "",
      },
      horizontal_pull: {
        exerciseId: "db-row",
        pattern: "horizontal_pull",
        difficulty: 3,
        cleanSessionsCount: 3,
        requiredForAdvance: 2,
        inHysteresis: false,
        lastDecisionTrace: "",
      },
    },
  };

  test("phaseHistory write ternary for phaseIndex 1|2|3 (observe, do not correct)", () => {
    // generateWeeklyProgram maps weeklyRuntimeContext.phaseIndex through:
    //   phaseIndex === 2 ? "growth" : phaseIndex === 1 ? "skill" : "activation"
    // (see packages/engine/src/program.ts phaseHistory / phaseTransitionState).
    // That is NOT the same mapping as phaseStageFromIndex (1→activation,
    // 2→skill, 3→growth). Characterization records what the write path
    // actually produces so the display helper / tolerant reader can decide
    // what to do about the mismatch — this test must not "fix" it.
    const observed: Record<number, string | undefined> = {};

    for (const phaseIndex of [1, 2, 3] as const) {
      const sessionsInPhase =
        phaseIndex === 1
          ? ACTIVATION_MIN_SESSIONS
          : phaseIndex === 2
          ? SKILL_MIN_SESSIONS
          : SKILL_MIN_SESSIONS;

      const program = generateWeeklyProgram(
        questionnaire,
        `phase-vocab-history-${phaseIndex}`,
        {
          phaseIndex,
          seed: `phase-vocab-history-${phaseIndex}`,
          sessionsInPhase,
          phaseSessionSnapshots: advancingSnapshots(sessionsInPhase),
          currentLadderState: strongLadder,
          rungsClimbedSincePhaseStart: {
            hinge: 1,
            knee_dominant: 1,
            horizontal_pull: 1,
          },
          deferredExerciseCount: 0,
          activationSacrificeQueueCleared: true,
          trainingIntent: "build",
          priorPhaseHistory: [],
        }
      );

      // Prefer the appended phaseHistory record; fall back to transition state.
      const historyPhase = program.phaseHistory?.at(-1)?.phase;
      const transitionPhase = program.phaseTransitionState?.phase;
      observed[phaseIndex] = historyPhase ?? transitionPhase;
    }

    // Documented observed mapping (write-path ternary, NOT phaseStageFromIndex):
    //   phaseIndex 1 → "skill"
    //   phaseIndex 2 → "growth"
    //   phaseIndex 3 → "activation"   (else branch — 3 is not handled)
    //
    // Contrast with phaseStageFromIndex (selection, DO NOT TOUCH):
    //   phaseIndex 1 → "activation"
    //   phaseIndex 2 → "skill"
    //   phaseIndex 3 → "growth"
    //
    // And with getPhaseMetaByIndex (hero display, 1-based):
    //   1 → "Phase 1: Control & Technique"
    //   2 → "Phase 2: Hypertrophy & Capacity"
    //   3 → "Phase 3: Strength Focus"
    expect(observed[1]).toBe("skill");
    expect(observed[2]).toBe("growth");
    expect(observed[3]).toBe("activation");
  });
});

// ---------------------------------------------------------------------------
// 3. blockedAt.phase — SessionClient write mapping (UI-side)
// ---------------------------------------------------------------------------

describe("characterization: blockedExerciseIds[].blockedAt.phase (pre-Step-3)", () => {
  test("historical SessionClient ternary for phaseIndex 0|1|2|3 (superseded)", () => {
    // PRE-Step-3 write mapping, kept so the off-by-one is still documented.
    // Step 3 changed handleBlockExercise to persist the numeric phaseIndex
    // instead; new reads go through phaseIndexFromPersistedStage.
    expect(sessionClientBlockedAtPhase(0)).toBe("activation");
    expect(sessionClientBlockedAtPhase(1)).toBe("skill");
    expect(sessionClientBlockedAtPhase(2)).toBe("growth");
    expect(sessionClientBlockedAtPhase(3)).toBe("activation");
  });
});

// ---------------------------------------------------------------------------
// 4. Gyms MemberDrillIn display mapping vs real atPhase values
// ---------------------------------------------------------------------------

describe("characterization: MemberDrillIn atPhase → stage word (pre-Step-3)", () => {
  test("historical MemberDrillIn assumed 0-based atPhase (superseded)", () => {
    // PRE-Step-3 display mapping. Step 3 replaced it with formatPhaseName(atPhase).
    expect(memberDrillInStageFromAtPhase(0)).toBe("activation");
    expect(memberDrillInStageFromAtPhase(1)).toBe("skill");
    expect(memberDrillInStageFromAtPhase(2)).toBe("growth");
    expect(memberDrillInStageFromAtPhase(3)).toBe("growth");
  });
});

// ---------------------------------------------------------------------------
// Step 2+ helpers — locked to the characterization answers above
// ---------------------------------------------------------------------------

describe("formatPhaseName (Step 2 helper)", () => {
  test("1-based phaseIndex → Phase N: profile label", () => {
    expect(formatPhaseName(1)).toBe("Phase 1: Control & Technique");
    expect(formatPhaseName(2)).toBe("Phase 2: Hypertrophy & Capacity");
    expect(formatPhaseName(3)).toBe("Phase 3: Strength Focus");
  });

  test("atPhase=0 (missing/??0 / fixture) clamps to Phase 1 — no second convention", () => {
    expect(formatPhaseName(0)).toBe("Phase 1: Control & Technique");
  });
});

describe("phaseIndexFromPersistedStage (Step 4 tolerant reader)", () => {
  test("legacy stage words → selection-canonical 1-based index", () => {
    expect(phaseIndexFromPersistedStage("activation")).toBe(1);
    expect(phaseIndexFromPersistedStage("skill")).toBe(2);
    expect(phaseIndexFromPersistedStage("growth")).toBe(3);
  });

  test("numeric phaseIndex pass-through (new blockedAt writes)", () => {
    expect(phaseIndexFromPersistedStage(1)).toBe(1);
    expect(phaseIndexFromPersistedStage(2)).toBe(2);
    expect(phaseIndexFromPersistedStage(3)).toBe(3);
    expect(phaseIndexFromPersistedStage(0)).toBe(1);
  });

  test("already-formatted Phase N strings and unknowns", () => {
    expect(phaseIndexFromPersistedStage("Phase 2: Hypertrophy & Capacity")).toBe(2);
    expect(phaseIndexFromPersistedStage(undefined)).toBe(1);
    expect(phaseIndexFromPersistedStage("")).toBe(1);
  });
});
