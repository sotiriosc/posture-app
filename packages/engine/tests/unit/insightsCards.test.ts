import { describe, expect, test } from "vitest";
import { buildPhaseObjective } from "@/lib/phaseObjectives";
import { buildSessionAdaptation } from "@/lib/sessionAdaptation";
import type { MovementProfile } from "@/lib/movementProfile";
import type { ProgramDay } from "@/lib/types";
import type { UserTrainingState } from "@/lib/phases";

const movementProfile: MovementProfile = {
  generatedAt: new Date().toISOString(),
  readiness: 0.68,
  recovery: 0.74,
  consistency: 0.62,
  painRisk: 0.36,
  confidence: 0.61,
  asymmetry: 0.31,
  painSensitivity: { shoulders: 0.6 },
  skillScores: {
    squat: 0.52,
    hinge: 0.49,
    push: 0.57,
    pull: 0.46,
    core: 0.44,
    mobility: 0.41,
    balance: 0.39,
    breathing: 0.5,
  },
  priorities: ["balance", "mobility", "core"],
};

const trainingState: UserTrainingState = {
  stage: "build",
  readiness: 0.71,
  consistency: 0.66,
  painRisk: 0.28,
  fatigueRisk: 0.31,
  movementQuality: 0.7,
  capacity: 0.72,
  confidence: 0.68,
  trend: "up",
  reason: "Readiness and consistency improved this block.",
};

const week: ProgramDay[] = [
  {
    dayIndex: 0,
    title: "Upper",
    focusTags: ["upper", "push", "core"],
    routine: [],
  },
  {
    dayIndex: 1,
    title: "Lower",
    focusTags: ["lower", "hinge", "balance"],
    routine: [],
  },
];

describe("insight card builders", () => {
  test("phase objective returns rich dynamic fields", () => {
    const objective = buildPhaseObjective({
      phaseIndex: 2,
      cycleIndex: 3,
      weekIndex: 1,
      movementProfile,
    });

    expect(objective.title).toContain("Week");
    expect(objective.objective.length).toBeGreaterThan(20);
    // Phase 6f, Commit 5.b: "cycle" is engine-internal vocabulary; user-facing
    // copy renders it as "Week X of 4" (cycleIndex 3 -> week 3 of the 4-week
    // Base/Build/Push/Deload rotation).
    expect(objective.phaseFocus).toContain("Week 3 of 4");
    expect(objective.phaseFocus).not.toMatch(/cycle/i);
    expect(objective.primaryPatterns.length).toBeGreaterThanOrEqual(2);
    expect(objective.successMarkers.length).toBeGreaterThanOrEqual(3);
    expect(objective.weekIntent.length).toBeGreaterThan(10);
    expect(objective.whyNow).toContain("Readiness");
    expect(objective.riskWatchouts.length).toBeGreaterThanOrEqual(2);
    expect(objective.coachingPrompts.length).toBeGreaterThanOrEqual(2);
    expect(objective.metrics.painRisk).toBeCloseTo(movementProfile.painRisk);
  });

  test("session adaptation returns signals, reasons, and mastery checks", () => {
    const adaptation = buildSessionAdaptation({
      movementProfile,
      trainingState,
      changedSlots: 7,
      totalSlots: 14,
      week,
    });

    expect(adaptation.summary.length).toBeGreaterThan(20);
    expect(adaptation.reasons.length).toBeGreaterThanOrEqual(1);
    expect(adaptation.appliedChanges.length).toBeGreaterThanOrEqual(3);
    expect(adaptation.dataSignals.length).toBeGreaterThanOrEqual(4);
    expect(adaptation.masteryNext.length).toBeGreaterThanOrEqual(3);
    expect(adaptation.masteryChecks.length).toBeGreaterThanOrEqual(3);
    expect(adaptation.dataSignals.join(" ")).toContain("Readiness");
  });

  test("high pain profile updates guardrails and mastery checks", () => {
    const highPain: MovementProfile = {
      ...movementProfile,
      painRisk: 0.72,
      asymmetry: 0.52,
    };
    const objective = buildPhaseObjective({
      phaseIndex: 1,
      cycleIndex: 1,
      weekIndex: 2,
      movementProfile: highPain,
    });
    const adaptation = buildSessionAdaptation({
      movementProfile: highPain,
      trainingState: { ...trainingState, fatigueRisk: 0.71 },
      changedSlots: 2,
      totalSlots: 12,
      week,
    });

    expect(objective.guardrail.toLowerCase()).toContain("pain risk");
    expect(objective.riskWatchouts.join(" ").toLowerCase()).toContain("pain");
    expect(adaptation.reasons.join(" ").toLowerCase()).toContain("pain");
    expect(adaptation.masteryChecks.join(" ").toLowerCase()).toContain("symptoms");
  });
});
