import type { CandidateScoreComponent } from "../types";
import { component } from "../utils";

function stressOverlapCount(
  painTags: readonly string[],
  exerciseTags: readonly string[],
): number {
  const exerciseTagSet = new Set(exerciseTags);
  return painTags.filter((tag) => exerciseTagSet.has(tag)).length;
}

export const painSuitabilityComponent: CandidateScoreComponent = {
  id: "pain_suitability",
  score({ request, exercise }) {
    const exerciseStressTags = [
      ...exercise.loading.jointStressTags,
      ...exercise.cautionStressTags,
      ...exercise.contraindicatedStressTags,
    ];
    const discomfortStress = request.painAndInjury.currentDiscomforts.filter(
      (pain) => stressOverlapCount(pain.stressTags, exerciseStressTags) > 0,
    );
    const moderateStress = request.painAndInjury.moderatePain.filter(
      (pain) => stressOverlapCount(pain.stressTags, exerciseStressTags) > 0,
    );
    const sensitivityStress = request.painAndInjury.historicalSensitivities.filter(
      (pain) => stressOverlapCount(pain.stressTags, exerciseStressTags) > 0,
    );
    const discomfortOverlap = request.painAndInjury.currentDiscomforts.reduce(
      (sum, pain) => sum + stressOverlapCount(pain.stressTags, exerciseStressTags),
      0,
    );
    const moderateOverlap = request.painAndInjury.moderatePain.reduce(
      (sum, pain) => sum + stressOverlapCount(pain.stressTags, exerciseStressTags),
      0,
    );
    const sensitivityOverlap = request.painAndInjury.historicalSensitivities.reduce(
      (sum, pain) => sum + stressOverlapCount(pain.stressTags, exerciseStressTags),
      0,
    );
    const supportiveLowBack =
      request.painAndInjury.currentDiscomforts.some((pain) => pain.region === "lumbar_spine") &&
      exercise.id.includes("chest-supported");
    const value =
      8.2 -
      discomfortOverlap * 0.9 -
      moderateOverlap * 1.8 -
      sensitivityOverlap * 0.4 +
      (supportiveLowBack ? 1 : 0);

    return component({
      id: "pain_suitability",
      family: "pain_suitability",
      value,
      reasonCode: discomfortStress.length + moderateStress.length + sensitivityStress.length === 0 ? "PAIN_SUITABLE" : "PAIN_REQUIRES_REVIEW",
      reason:
        discomfortStress.length + moderateStress.length + sensitivityStress.length === 0
          ? `${exercise.name} has no active pain-stressor overlap.`
          : `${exercise.name} overlaps pain/sensitivity signals: ${[
              ...discomfortStress,
              ...moderateStress,
              ...sensitivityStress,
            ].map((pain) => pain.id).join(", ")}.`,
      source: "pain_injury",
    });
  },
};
