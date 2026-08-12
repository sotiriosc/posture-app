import type { CandidateScoreComponent } from "../types";
import { component, overlapCount } from "../utils";

export const progressionValueComponent: CandidateScoreComponent = {
  id: "progression_value",
  score({ request, exercise }) {
    const preferredAxisMatches = overlapCount(
      exercise.progression.progressionAxes,
      request.phase.progressionIntent.preferredProgressionAxes,
    );
    const hasSameExerciseProgression = exercise.progression.progressionAxes.length > 0;
    const readyToProgress = request.history.progressionState.readyToProgressExerciseIds.includes(exercise.id);
    const stalled = request.history.progressionState.stalledExerciseIds.includes(exercise.id);
    const failedRecently = request.continuity.failedProgressionExerciseIds.includes(exercise.id);
    const value =
      5.7 +
      Math.min(2.2, preferredAxisMatches * 0.55) +
      (hasSameExerciseProgression ? 0.8 : 0) +
      (readyToProgress ? 1 : 0) -
      (stalled ? 1.2 : 0) -
      (failedRecently ? 1 : 0);

    return component({
      id: "progression_value",
      family: "progression_value",
      value,
      reasonCode: hasSameExerciseProgression || readyToProgress ? "PROGRESSION_AVAILABLE" : "SCORE_NEUTRAL",
      reason: `${exercise.name} has ${preferredAxisMatches} phase-preferred same-exercise progression axis match(es).`,
      source: "history",
    });
  },
};

export const continuityValueComponent: CandidateScoreComponent = {
  id: "continuity_value",
  score({ request, exercise }) {
    const isCurrent = request.continuity.currentExerciseId === exercise.id;
    const isPrevious = request.continuity.previousExerciseId === exercise.id;
    const productive = request.continuity.productiveExerciseIds.includes(exercise.id);
    const stable = request.history.exerciseHistory.stableExerciseIds.includes(exercise.id);
    const plateaued = request.continuity.plateauedExerciseIds.includes(exercise.id);
    const failedProgression = request.continuity.failedProgressionExerciseIds.includes(exercise.id);
    const painResponse = request.continuity.painResponseExerciseIds.includes(exercise.id);
    const blocked = request.history.exerciseHistory.blockedExerciseIds.includes(exercise.id);
    const preferred = request.athlete.preferences.preferredExerciseIds.includes(exercise.id);
    const disliked = request.athlete.preferences.dislikedExerciseIds.includes(exercise.id);
    const responseObservations = request.history.trainingResponseHistory?.observations.filter(
      (observation) => observation.exposure.exerciseId === exercise.id,
    ) ?? [];
    const toleratedResponse = responseObservations.some(
      (observation) => observation.tolerance === "tolerated" && observation.symptomChange !== "worsened",
    );
    const adverseResponse = responseObservations.some(
      (observation) => observation.tolerance === "not_tolerated" || observation.symptomChange === "worsened",
    );
    const retentionEvidence = [
      ...(isCurrent ? ["current" as const] : []),
      ...(isPrevious ? ["previous" as const] : []),
      ...(productive ? ["productive" as const] : []),
      ...(stable ? ["stable" as const] : []),
      ...(preferred ? ["preferred" as const] : []),
      ...(toleratedResponse ? ["tolerated_response" as const] : []),
    ];
    const reconsiderationEvidence = [
      ...(plateaued ? ["plateaued" as const] : []),
      ...(failedProgression ? ["failed_progression" as const] : []),
      ...(painResponse ? ["pain_response" as const] : []),
      ...(blocked ? ["blocked" as const] : []),
      ...(disliked ? ["disliked" as const] : []),
      ...(adverseResponse ? ["adverse_response" as const] : []),
    ];
    const value =
      5.6 +
      (isCurrent ? 1.1 : 0) +
      (isPrevious ? 0.6 : 0) +
      (productive ? 1.3 : 0) +
      (stable ? 0.7 : 0) +
      (preferred ? 0.8 : 0) +
      (toleratedResponse ? 0.8 : 0) -
      (plateaued ? 1.5 : 0) -
      (failedProgression ? 1.2 : 0) -
      (painResponse ? 2.2 : 0) -
      (blocked ? 2.4 : 0) -
      (disliked ? 1.2 : 0) -
      (adverseResponse ? 1.8 : 0);

    return component({
      id: "continuity_value",
      family: "continuity_value",
      value,
      reasonCode:
        reconsiderationEvidence.length > 0
          ? "REPLACEMENT_JUSTIFIED"
          : retentionEvidence.length > 0
            ? "CONTINUITY_FAVORED"
            : "SCORE_NEUTRAL",
      reason: [
        `${exercise.name} continuity evidence:`,
        `retention=[${retentionEvidence.join(", ") || "none"}];`,
        `reconsideration=[${reconsiderationEvidence.join(", ") || "none"}].`,
        ...(reconsiderationEvidence.length > 0
          ? ["Replacement consideration is justified; this component does not replace the exercise automatically."]
          : []),
      ].join(" "),
      source: "history",
    });
  },
};
