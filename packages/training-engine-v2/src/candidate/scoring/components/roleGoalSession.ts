import type { CandidateScoreComponent } from "../types";
import { component, overlapCount } from "../utils";

export const roleFitComponent: CandidateScoreComponent = {
  id: "role_fit",
  score({ request, exercise }) {
    const roleMatch = exercise.trainingRoles.includes(request.need.requestedRole);
    const movementMatches = overlapCount(exercise.movementRoles, request.need.targetMovementRoles);
    const value = roleMatch
      ? movementMatches > 0
        ? 7 + Math.min(2, movementMatches)
        : 4.8
      : 2.5 + movementMatches;

    return component({
      id: "role_fit",
      family: "role_fit",
      value,
      reasonCode: roleMatch ? "ROLE_MATCH" : "ROLE_MISMATCH",
      reason: roleMatch
        ? `${exercise.name} can serve ${request.need.requestedRole} and matches ${movementMatches} requested movement role(s).`
        : `${exercise.name} does not naturally serve ${request.need.requestedRole}.`,
      source: "session_intent",
    });
  },
};

export const goalFitComponent: CandidateScoreComponent = {
  id: "goal_fit",
  score({ request, exercise }) {
    const loadable = exercise.loading.loadability === "high" || exercise.loading.loadability === "moderate";
    const isControl = exercise.movementRoles.some((role) =>
      ["breathing_position", "scapular_control", "anti_extension_core", "anti_rotation_core"].includes(role),
    );
    let value = 6;

    if (request.goal === "hypertrophy") {
      value = exercise.trainingRoles.includes("hypertrophy_accessory") || loadable ? 8 : 5.5;
    } else if (request.goal === "strength") {
      value = exercise.trainingRoles.includes("primary_strength") && loadable ? 8.5 : loadable ? 7 : 5.5;
    } else if (request.goal === "posture_and_movement_quality" || request.goal === "pain_aware_return") {
      value = isControl || exercise.trainingRoles.includes("preparation") ? 8.5 : 6.5;
    } else if (request.goal === "general_fitness") {
      value = 7;
    }

    return component({
      id: "goal_fit",
      family: "goal_fit",
      value,
      reasonCode: value >= 7 ? "GOAL_MATCH" : "SCORE_NEUTRAL",
      reason: `${exercise.name} goal fit for ${request.goal}: ${value >= 7 ? "supports" : "partially supports"} the stated goal.`,
      source: "training_goal",
    });
  },
};

export const sessionIntentFitComponent: CandidateScoreComponent = {
  id: "session_intent_fit",
  score({ request, exercise }) {
    const sectionSuitability = request.need.requestedSection
      ? exercise.sectionSuitability[request.need.requestedSection]?.suitability
      : undefined;
    const sectionValue =
      sectionSuitability === "excellent"
        ? 2
        : sectionSuitability === "good"
          ? 1.25
          : sectionSuitability === "possible"
            ? 0.25
            : 0;
    const movementMatches = overlapCount(exercise.movementRoles, request.need.targetMovementRoles);
    const muscleMatches = overlapCount(
      [...exercise.primaryMuscles, ...exercise.secondaryMuscles],
      request.need.targetMuscles,
    );

    return component({
      id: "session_intent_fit",
      family: "session_intent",
      value: 5.5 + sectionValue + Math.min(1.5, movementMatches) + Math.min(1, muscleMatches * 0.5),
      reasonCode: "SESSION_INTENT_MATCH",
      reason: `${exercise.name} was evaluated against "${request.need.whyNeeded}" with section suitability ${sectionSuitability ?? "unspecified"}.`,
      source: "session_intent",
    });
  },
};

export const muscleTargetFitComponent: CandidateScoreComponent = {
  id: "muscle_target_fit",
  score({ request, exercise }) {
    const primaryMatches = overlapCount(exercise.primaryMuscles, request.need.targetMuscles);
    const secondaryMatches = overlapCount(exercise.secondaryMuscles, request.need.targetMuscles);
    const value = 4.5 + primaryMatches * 2.2 + secondaryMatches * 0.9;

    return component({
      id: "muscle_target_fit",
      family: "muscle_target_fit",
      value,
      reasonCode: primaryMatches > 0 || secondaryMatches > 0 ? "MUSCLE_TARGET_MATCH" : "SCORE_NEUTRAL",
      reason: `${exercise.name} primary target matches ${primaryMatches}, secondary target matches ${secondaryMatches}.`,
      source: "session_intent",
    });
  },
};
