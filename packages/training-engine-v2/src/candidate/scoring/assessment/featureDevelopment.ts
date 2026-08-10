import type { AssessmentSignal } from "../../../domain/assessment";
import type { ExerciseDefinition } from "../../../domain/exercise";
import type {
  AssessmentDemandCapabilityTrace,
  AssessmentFeatureDevelopmentTrace,
  AssessmentFeatureMatchTrace,
  AssessmentSignalInterpretationTrace,
} from "../../../scoringContracts";
import type { CandidateRequest } from "../../request";
import { estimateAthleteCapability } from "./athleteCapability";

function featureEmphasisSource(
  match: AssessmentFeatureMatchTrace,
): AssessmentFeatureDevelopmentTrace["featureEmphasisSource"] {
  return match.candidateFeatureLevel === "unknown" ? "unknown" : "scapular_mechanics";
}

export function buildFeatureDevelopmentTraces(input: {
  readonly request: CandidateRequest;
  readonly exercise: ExerciseDefinition;
  readonly signal: AssessmentSignal;
  readonly signalInterpretation: AssessmentSignalInterpretationTrace;
  readonly featureMatches: readonly AssessmentFeatureMatchTrace[];
  readonly overallTaskDemand: AssessmentDemandCapabilityTrace;
}): readonly AssessmentFeatureDevelopmentTrace[] {
  return input.featureMatches.map((match) => {
    const featureCapability = estimateAthleteCapability({
      request: input.request,
      signal: input.signal,
      dimension: input.overallTaskDemand.dimension,
      signalInterpretation: input.signalInterpretation,
    });

    return {
      assessmentFeature: match.assessmentFeature,
      featureMatch: match.featureMatch,
      featureEmphasisLevel: match.candidateFeatureLevel,
      featureEmphasisSource: featureEmphasisSource(match),
      featureReviewStatus: match.candidateFeatureReviewStatus,
      overallTaskDemand: input.overallTaskDemand.candidateDemand,
      overallTaskDemandSource: input.overallTaskDemand.candidateDemandSource,
      featureChallengeDemand: null,
      featureChallengeDemandSource: "not_modeled",
      featureCapabilityEstimate: featureCapability.value,
      featureCapabilitySource: featureCapability.estimateSource,
      featureCapabilityEvidenceQuality: featureCapability.evidenceQuality,
      featureDemandCapabilityMatch: "not_applicable",
      evidence: [
        `${input.exercise.id} expresses ${match.assessmentFeature} at ${match.candidateFeatureLevel} via ${match.candidateFeature}.`,
        `${input.exercise.id} overall ${input.overallTaskDemand.dimension} task demand is ${input.overallTaskDemand.candidateDemandSource.level}.`,
        `No explicit ${match.assessmentFeature} challenge-demand scale is modeled, so feature demand/capability match is not asserted.`,
        `Assessment severity is scoped to ${match.assessmentFeature} capability estimate and is not treated as global ${input.overallTaskDemand.dimension} incapacity.`,
      ],
    };
  });
}

export function hasUnassertedFeatureChallenge(
  traces: readonly AssessmentFeatureDevelopmentTrace[],
): boolean {
  return traces.some((trace) => trace.featureDemandCapabilityMatch === "not_applicable");
}
