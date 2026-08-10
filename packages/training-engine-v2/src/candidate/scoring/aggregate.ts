import type { CandidateScore } from "../../scoringContracts";
import type { CandidateScoringWeights } from "./config";
import { DEFAULT_CANDIDATE_SCORING_WEIGHTS } from "./config";

export function aggregateCandidateScore(input: {
  readonly exerciseId: string;
  readonly components: readonly CandidateScore["components"][number][];
  readonly weights?: CandidateScoringWeights;
}): CandidateScore {
  const weights = input.weights ?? DEFAULT_CANDIDATE_SCORING_WEIGHTS;
  const sortedComponents = [...input.components].sort((left, right) => left.id.localeCompare(right.id));
  const totalWeight = sortedComponents.reduce((sum, component) => sum + weights[component.family], 0);
  const components = sortedComponents.map((component) => {
    const unnormalizedWeight = weights[component.family];
    const normalizedWeight = totalWeight === 0 ? 0 : unnormalizedWeight / totalWeight;

    return {
      ...component,
      rawValue: component.value,
      weight: Number(normalizedWeight.toFixed(6)),
      unnormalizedWeight,
      weightedContribution: Number((component.value * normalizedWeight).toFixed(6)),
    };
  });
  const unroundedValue =
    totalWeight === 0
      ? 0
      : sortedComponents.reduce(
          (sum, component) => sum + component.value * weights[component.family],
          0,
        ) / totalWeight;

  return {
    exerciseId: input.exerciseId,
    components,
    aggregate: {
      method: "weighted_mean_candidate_intelligence_v0",
      value: Number(unroundedValue.toFixed(3)),
      unroundedValue: Number(unroundedValue.toFixed(6)),
      totalWeight,
      weightNormalization: "component_family_weight_divided_by_total_family_weight",
    },
  };
}
