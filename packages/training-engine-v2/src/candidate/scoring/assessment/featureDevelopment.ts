import type { ExerciseDefinition } from "../../../domain/exercise";
import type {
  AssessmentDemandCapabilityTrace,
  AssessmentDemandDimension,
  AssessmentFeatureDevelopmentTrace,
  AssessmentFeatureMatchTrace,
  AssessmentSignalInterpretationTrace,
  CapabilityEstimateSource,
  CapabilityEvidenceQuality,
  FeatureSpecificEvidenceSource,
} from "../../../scoringContracts";
import type { CandidateRequest } from "../../request";
import { demandLevelToValue } from "./candidateDemand";

function clampCapability(value: number): number {
  return Number(Math.max(0, Math.min(3, value)).toFixed(3));
}

function average(values: readonly number[]): number {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function featureEmphasisSource(
  match: AssessmentFeatureMatchTrace,
): AssessmentFeatureDevelopmentTrace["featureEmphasisSource"] {
  return match.candidateFeatureLevel === "unknown" ? "unknown" : "scapular_mechanics";
}

function experienceWeakPrior(experience: CandidateRequest["athlete"]["experience"]): number {
  switch (experience) {
    case "novice":
      return -0.1;
    case "beginner":
      return 0;
    case "intermediate":
      return 0.1;
    case "advanced":
      return 0.15;
  }
}

function phaseCapabilityPriorForDimension(
  request: CandidateRequest,
  dimension: AssessmentDemandDimension,
): number {
  switch (dimension) {
    case "trunk_control":
      return average([
        demandLevelToValue(request.phase.capabilityExpectation.control),
        demandLevelToValue(request.phase.capabilityExpectation.stability),
      ]);
    case "scapular_control":
      return average([
        demandLevelToValue(request.phase.capabilityExpectation.control),
        demandLevelToValue(request.phase.capabilityExpectation.coordination),
      ]);
    case "stability":
      return demandLevelToValue(request.phase.capabilityExpectation.stability);
    case "coordination":
      return demandLevelToValue(request.phase.capabilityExpectation.coordination);
    case "range":
    case "joint_control":
      return demandLevelToValue(request.phase.capabilityExpectation.control);
  }
}

function estimateFeatureCapability(input: {
  readonly request: CandidateRequest;
  readonly dimension: AssessmentDemandDimension;
  readonly signalInterpretation: AssessmentSignalInterpretationTrace;
}): {
  readonly value: number;
  readonly source: CapabilityEstimateSource;
  readonly evidenceQuality: CapabilityEvidenceQuality;
  readonly featureSpecificEvidenceSources: readonly FeatureSpecificEvidenceSource[];
  readonly evidence: readonly string[];
} {
  const phasePrior = phaseCapabilityPriorForDimension(input.request, input.dimension);
  const experienceAdjustment = experienceWeakPrior(input.request.athlete.experience);
  const severityAdjustment = -input.signalInterpretation.deficitMagnitude;
  const hasProvidedSeverity = input.signalInterpretation.severitySource === "provided";
  const value = clampCapability(
    Math.max(0.75, phasePrior + experienceAdjustment + severityAdjustment),
  );

  return {
    value,
    source: hasProvidedSeverity ? "assessment_inferred" : "phase_default",
    evidenceQuality: hasProvidedSeverity ? "moderate" : "weak",
    featureSpecificEvidenceSources: hasProvidedSeverity ? ["assessment_severity"] : [],
    evidence: [
      `Feature capability uses phase/experience prior ${phasePrior.toFixed(3)} plus experience adjustment ${experienceAdjustment.toFixed(3)}.`,
      `Feature-specific severity adjustment ${severityAdjustment.toFixed(3)} from ${input.signalInterpretation.severity}.`,
      "Generic movement-role history is not used as feature-specific capability evidence because ExerciseHistoryEvent has no normalized assessment-feature field.",
      "Feature-aware history support is unavailable/not_modeled at the current history boundary.",
    ],
  };
}

export function buildFeatureDevelopmentTraces(input: {
  readonly request: CandidateRequest;
  readonly exercise: ExerciseDefinition;
  readonly signalInterpretation: AssessmentSignalInterpretationTrace;
  readonly featureMatches: readonly AssessmentFeatureMatchTrace[];
  readonly overallTaskDemand: AssessmentDemandCapabilityTrace;
}): readonly AssessmentFeatureDevelopmentTrace[] {
  return input.featureMatches.map((match) => {
    const featureCapability = estimateFeatureCapability({
      request: input.request,
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
      featureCapabilitySource: featureCapability.source,
      featureCapabilityEvidenceQuality: featureCapability.evidenceQuality,
      featureCapabilityPriorSource: "phase_experience_default",
      featureSpecificEvidenceSources: featureCapability.featureSpecificEvidenceSources,
      featureSpecificHistorySupport: "unavailable_not_modeled",
      featureDemandCapabilityMatch: "not_applicable",
      evidence: [
        `${input.exercise.id} expresses ${match.assessmentFeature} at ${match.candidateFeatureLevel} via ${match.candidateFeature}.`,
        `${input.exercise.id} overall ${input.overallTaskDemand.dimension} task demand is ${input.overallTaskDemand.candidateDemandSource.level}.`,
        `No explicit ${match.assessmentFeature} challenge-demand scale is modeled, so feature demand/capability match is not asserted.`,
        `Assessment severity is scoped to ${match.assessmentFeature} capability estimate and is not treated as global ${input.overallTaskDemand.dimension} incapacity.`,
        ...featureCapability.evidence,
      ],
    };
  });
}

export function hasUnassertedFeatureChallenge(
  traces: readonly AssessmentFeatureDevelopmentTrace[],
): boolean {
  return traces.some((trace) => trace.featureDemandCapabilityMatch === "not_applicable");
}
