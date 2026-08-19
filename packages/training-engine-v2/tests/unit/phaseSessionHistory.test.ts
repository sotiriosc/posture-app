import { describe, expect, it } from "vitest";
import {
  EMPTY_TRAINING_HISTORY,
  THREE_PHASE_FOUNDATION,
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

  it("expresses needs-first preparation dependencies without fixed slots", () => {
    const intent: SessionIntent = {
      id: "upper-push-session",
      athleteId: "phase-session-athlete",
      kind: "ordinary_training",
      phaseIntent: THREE_PHASE_FOUNDATION[0],
      primaryGoal: "strength",
      structuralCapacity: "standard",
      availableMinutes: 45,
      assessmentContextRefs: ["right-scapular-control-priority"],
      painResponseContextRefs: [],
      fatigueContext: [],
      continuityEvidence: { identities: [] },
      plannerSourceTrace: { plannerId: "fixture-planner", sourceRefs: ["fixture"] },
      unresolvedWeeklyContextRefs: ["week-composer-not-implemented"],
      needs: [
        {
          id: "scapular-preparation",
          section: "activation",
          priority: "required",
          priorityOrder: 0,
          standaloneAdmission: "admitted",
          sourceEvidence: [{ sourceKind: "explicit_preparation_dependency", sourceId: "right-scapular-control-priority", evidenceRefs: ["assessment"] }],
          dependencies: [{
            dependencyId: "wall-slide-prepares-press",
            targetNeedIds: ["main-press"],
            targetExerciseIds: [],
            movementRoles: ["horizontal_push"],
            actionFunctions: [],
            bodyRegions: ["shoulder", "thoracic_spine"],
            assessmentSignalIds: ["right-scapular-control-priority"],
            requiredRangeIds: [],
            painResponseRequirementIds: [],
            required: true,
          }],
          reasonCode: "explicit_press_preparation",
          explanation: "Trace-only preparation rationale.",
          selection: {
            requestedRole: "activation",
            targetMovementRoles: ["scapular_control"],
            targetActionFunctions: [],
            targetMuscles: ["serratus"],
            muscleRequirement: "primary_required",
            targetBodyRegions: ["shoulder"],
          },
        },
        {
          id: "main-press",
          section: "main",
          priority: "required",
          priorityOrder: 1,
          standaloneAdmission: "admitted",
          sourceEvidence: [{ sourceKind: "session_primary_purpose", sourceId: "strength", evidenceRefs: ["fixture"] }],
          dependencies: [],
          reasonCode: "main_horizontal_push",
          explanation: "Trace-only main rationale.",
          selection: {
            requestedRole: "primary_strength",
            targetMovementRoles: ["horizontal_push"],
            targetActionFunctions: [],
            targetMuscles: ["chest"],
            muscleRequirement: "primary_required",
            targetBodyRegions: [],
          },
        },
        {
          id: "triceps-accessory",
          section: "accessory",
          priority: "optional",
          priorityOrder: 0,
          standaloneAdmission: "duration_conditional",
          sourceEvidence: [{ sourceKind: "direct_muscle_priority", sourceId: "triceps", evidenceRefs: ["fixture"] }],
          dependencies: [],
          reasonCode: "optional_triceps",
          explanation: "Trace-only accessory rationale.",
          selection: {
            requestedRole: "hypertrophy_accessory",
            targetMovementRoles: [],
            targetActionFunctions: ["elbow_extension"],
            targetMuscles: ["triceps"],
            muscleRequirement: "primary_required",
            targetBodyRegions: [],
          },
        },
      ],
    };

    expect(intent.needs.map((need) => need.section)).toEqual(["activation", "main", "accessory"]);
    expect(intent.needs[0].dependencies[0].targetNeedIds).toEqual(["main-press"]);
    expect(intent).not.toHaveProperty("slots");
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
