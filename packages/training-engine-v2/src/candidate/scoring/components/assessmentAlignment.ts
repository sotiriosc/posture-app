import {
  assessmentInfluenceForSignal,
  type AssessmentInfluence,
} from "../../../alignment";
import type { CandidateScoreComponent } from "../types";
import { component, overlapCount } from "../utils";

function valueForInfluence(influences: readonly AssessmentInfluence[]): number {
  if (influences.length === 0) {
    return 6;
  }

  return influences.reduce((sum, influence) => {
    const confidence =
      influence.confidence === "high" ? 1.2 : influence.confidence === "medium" ? 0.8 : 0.25;
    const relevance =
      influence.relevance === "high" ? 1.4 : influence.relevance === "moderate" ? 0.8 : 0.2;
    const direction = influence.direction === "supports" ? 1 : influence.direction === "conflicts" ? -1 : 0;
    return sum + confidence * relevance * direction;
  }, 6);
}

export const assessmentFitComponent: CandidateScoreComponent = {
  id: "assessment_fit",
  score({ request, exercise }) {
    const relevantSignals = request.assessment.signals.filter((signal) => {
      const movementMatch = signal.movementRole ? exercise.movementRoles.includes(signal.movementRole) : false;
      const muscleMatch = signal.muscleGroup
        ? [...exercise.primaryMuscles, ...exercise.secondaryMuscles].includes(signal.muscleGroup)
        : false;
      const regionMatch = signal.region ? exercise.bodyRegions.includes(signal.region) : false;
      return movementMatch || muscleMatch || regionMatch;
    });
    const influences = relevantSignals.map(assessmentInfluenceForSignal);
    const strongestInfluence = influences[0];
    const conflict = influences.some((influence) => influence.direction === "conflicts");

    return component({
      id: "assessment_fit",
      family: "assessment_relevance",
      value: valueForInfluence(influences),
      reasonCode: conflict ? "ASSESSMENT_PRIORITY_CONFLICT" : relevantSignals.length > 0 ? "ASSESSMENT_PRIORITY_SUPPORTED" : "SCORE_NEUTRAL",
      reason:
        relevantSignals.length > 0
          ? `${exercise.name} intersects assessment signals: ${relevantSignals.map((signal) => signal.id).join(", ")}.`
          : `${exercise.name} has no direct assessment-signal relationship.`,
      source: "assessment",
      assessmentInfluence: strongestInfluence,
    });
  },
};

export const alignmentFitComponent: CandidateScoreComponent = {
  id: "alignment_fit",
  score({ request, exercise }) {
    const matchingPriorities = request.alignmentPriorities.filter((priority) => {
      const movementMatches = overlapCount(exercise.movementRoles, priority.movementRoles);
      const muscleMatches = overlapCount(
        [...exercise.primaryMuscles, ...exercise.secondaryMuscles],
        priority.muscleGroups,
      );
      const regionMatches = overlapCount(exercise.bodyRegions, priority.bodyRegions);
      return movementMatches + muscleMatches + regionMatches > 0;
    });
    const conflict = matchingPriorities.some((priority) => priority.influence.direction === "conflicts");
    const highConfidenceMatches = matchingPriorities.filter((priority) => priority.confidence === "high").length;
    const value = 6 + Math.min(2.5, highConfidenceMatches * 1.1 + matchingPriorities.length * 0.45) - (conflict ? 2 : 0);

    return component({
      id: "alignment_fit",
      family: "alignment_fit",
      value,
      reasonCode: conflict ? "ALIGNMENT_PRIORITY_CONFLICT" : matchingPriorities.length > 0 ? "ALIGNMENT_PRIORITY_SUPPORTED" : "SCORE_NEUTRAL",
      reason:
        matchingPriorities.length > 0
          ? `${exercise.name} supports alignment priorities: ${matchingPriorities.map((priority) => priority.id).join(", ")}.`
          : `${exercise.name} is neutral to derived alignment priorities.`,
      source: "alignment",
      assessmentInfluence: matchingPriorities[0]?.influence,
    });
  },
};
