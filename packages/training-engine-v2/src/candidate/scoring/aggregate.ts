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
  const weightedTotal = sortedComponents.reduce(
    (sum, component) => sum + component.value * weights[component.family],
    0,
  );

  return {
    exerciseId: input.exerciseId,
    components: sortedComponents,
    aggregate: {
      method: "weighted_mean_candidate_intelligence_v0",
      value: totalWeight === 0 ? 0 : Number((weightedTotal / totalWeight).toFixed(3)),
    },
  };
}
