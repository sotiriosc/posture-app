import { describe, expect, it } from "vitest";
import {
  EMPTY_TRAINING_HISTORY,
  THREE_PHASE_FOUNDATION,
  type PreparationDependency,
  type SessionIntent,
  type TrainingHistory,
} from "../../src";

describe("phase, session dependency, and history contracts", () => {
  it("represents Phase 1 through Phase 3 as first-class intents", () => {
    expect(THREE_PHASE_FOUNDATION.map((phase) => phase.id)).toEqual([
      "phase_1",
      "phase_2",
      "phase_3",
    ]);

    for (const phase of THREE_PHASE_FOUNDATION) {
      expect(phase.developedQualities.length).toBeGreaterThan(0);
      expect(phase.capabilityExpectation.movementRoles.length).toBeGreaterThan(0);
      expect(phase.progressionIntent.preferredProgressionAxes.length).toBeGreaterThan(0);
      expect(phase.advancementCriteria.length).toBeGreaterThan(0);
    }

    expect(THREE_PHASE_FOUNDATION[1].progressionIntent.exerciseContinuityDefault).toBe(
      "prefer_continue_when_productive",
    );
  });

  it("can express warmup and activation dependencies on the session purpose", () => {
    const dependency: PreparationDependency = {
      id: "wall-slide-prepares-press",
      fromSection: "activation",
      preparesForSections: ["main"],
      preparesForExerciseIds: ["dumbbell-bench-press"],
      movementRoles: ["scapular_control", "horizontal_push"],
      bodyRegions: ["shoulder", "thoracic_spine"],
      assessmentSignalIds: ["right-scapular-control-priority"],
      jointRangeNeeds: ["shoulder", "thoracic_spine"],
      sessionIntentId: "upper-push-session",
      explanation: "Serratus wall slide prepares scapular mechanics before pressing.",
    };

    const intent: SessionIntent = {
      id: "upper-push-session",
      phaseIntent: THREE_PHASE_FOUNDATION[0],
      primaryPurpose: "strength",
      priorityMuscles: ["chest", "triceps"],
      priorityMovementRoles: ["horizontal_push"],
      assessmentPriorityIds: ["right-scapular-control-priority"],
      assessmentPriorityLevel: "primary",
      relevantPainConstraintIds: [],
      fatigueConsiderations: ["Avoid exhausting shoulder stabilizers before main press."],
      preparationDependencies: [dependency],
      slots: [
        {
          id: "warmup-1",
          section: "warmup",
          role: "preparation",
          targetMovementRoles: ["breathing_position"],
          targetMuscles: ["trunk"],
          optional: false,
          preparationDependencyIds: [],
        },
        {
          id: "activation-1",
          section: "activation",
          role: "activation",
          targetMovementRoles: ["scapular_control"],
          targetMuscles: ["serratus"],
          optional: false,
          preparationDependencyIds: ["wall-slide-prepares-press"],
        },
        {
          id: "main-1",
          section: "main",
          role: "primary_strength",
          targetMovementRoles: ["horizontal_push"],
          targetMuscles: ["chest"],
          optional: false,
          preparationDependencyIds: [],
        },
        {
          id: "accessory-1",
          section: "accessory",
          role: "hypertrophy_accessory",
          targetMovementRoles: ["horizontal_push"],
          targetMuscles: ["triceps"],
          optional: true,
          preparationDependencyIds: [],
        },
        {
          id: "cooldown-1",
          section: "cooldown",
          role: "recovery",
          targetMovementRoles: ["mobility"],
          targetMuscles: ["upper_back"],
          optional: true,
          preparationDependencyIds: [],
        },
      ],
    };

    expect(intent.slots.map((slot) => slot.section)).toEqual([
      "warmup",
      "activation",
      "main",
      "accessory",
      "cooldown",
    ]);
    expect(intent.preparationDependencies[0].preparesForExerciseIds).toContain(
      "dumbbell-bench-press",
    );
  });

  it("keeps longitudinal exercise, session, and program history distinct", () => {
    const history: TrainingHistory = {
      ...EMPTY_TRAINING_HISTORY,
      exerciseHistory: {
        events: [
          {
            id: "row-too-easy",
            exerciseId: "seated-cable-row",
            type: "too_easy",
            movementRole: "horizontal_pull",
            notes: "Progress prescription rather than replacing by default.",
          },
          {
            id: "hinge-plateau",
            exerciseId: "dumbbell-romanian-deadlift",
            type: "plateau",
            movementRole: "hinge",
            notes: "Requires progression review.",
          },
        ],
        stableExerciseIds: ["seated-cable-row"],
        blockedExerciseIds: [],
      },
      sessionHistory: {
        completedSessionIds: ["week1-session1"],
        missedSessionIds: ["week1-session2"],
        substitutedExerciseIds: ["push-up"],
        notes: ["Missed workout should affect adaptation later."],
      },
      programHistory: {
        completedPhaseIds: ["phase_1"],
        completedWeekIds: ["week1"],
        adherenceNotes: ["Good first week except one missed session."],
      },
    };

    expect(history.exerciseHistory.events.map((event) => event.type)).toContain("too_easy");
    expect(history.exerciseHistory.events.map((event) => event.type)).toContain("plateau");
    expect(history.sessionHistory.missedSessionIds).toEqual(["week1-session2"]);
    expect(history.programHistory.completedPhaseIds).toEqual(["phase_1"]);
  });
});
