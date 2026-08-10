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
    const value =
      5.6 +
      (isCurrent ? 1.1 : 0) +
      (isPrevious ? 0.6 : 0) +
      (productive ? 1.3 : 0) +
      (stable ? 0.7 : 0) -
      (plateaued ? 1.5 : 0) -
      (failedProgression ? 1.2 : 0) -
      (painResponse ? 2.2 : 0) -
      (blocked ? 2.4 : 0);

    return component({
      id: "continuity_value",
      family: "continuity_value",
      value,
      reasonCode:
        productive || isCurrent || stable
          ? "CONTINUITY_FAVORED"
          : plateaued || failedProgression || painResponse || blocked
            ? "REPLACEMENT_JUSTIFIED"
            : "SCORE_NEUTRAL",
      reason: `${exercise.name} continuity signals: current=${isCurrent}, productive=${productive}, plateaued=${plateaued}, painResponse=${painResponse}.`,
      source: "history",
    });
  },
};
