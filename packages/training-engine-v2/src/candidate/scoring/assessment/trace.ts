import type { AssessmentInfluence } from "../../../alignment";
import type { AssessmentSignal } from "../../../domain/assessment";
import type { ExerciseDefinition } from "../../../domain/exercise";
import type {
  AssessmentCandidateRelationship,
  AssessmentRelevanceTrace,
  AssessmentSignalInterpretationTrace,
} from "../../../scoringContracts";
import type { CandidateRequest } from "../../request";
import { interpretAssessmentSignal } from "./athleteCapability";
import { calculateDemandCapabilityTrace } from "./demandCapabilityMatch";
import {
  demandReductionContextFor,
  relationshipFromDemand,
  relationshipReason,
  relationshipReasonCode,
} from "./developmentalRelationship";
import {
  buildFeatureDevelopmentTraces,
  hasUnassertedFeatureChallenge,
} from "./featureDevelopment";
import {
  buildFeatureTargetFitTraces,
  strongestFeatureTargetFitInfluence,
} from "./featureTargetFit";
import { calculateInfluenceBudget } from "./influenceBudget";
import type { AssessmentRelevanceDecision } from "./relevance";
import type { CandidatePainMatchTrace } from "../../pain";

function overallTaskSignalInterpretation(input: {
  readonly signalInterpretation: AssessmentSignalInterpretationTrace;
  readonly hasFeatureSpecificEvidence: boolean;
  readonly dimension: string;
}): AssessmentSignalInterpretationTrace {
  if (!input.hasFeatureSpecificEvidence) {
    return input.signalInterpretation;
  }

  return {
    ...input.signalInterpretation,
    severity: "unknown",
    severitySource: "not_applicable",
    deficitMagnitude: 0,
    evidence: [
      ...input.signalInterpretation.evidence,
      `Feature-specific severity is scoped to feature capability; overall ${input.dimension} task capability does not inherit it.`,
    ],
  };
}

function featureUnknownRelationshipReason(input: {
  readonly relationship: AssessmentCandidateRelationship;
  readonly signalId: string;
  readonly features: readonly string[];
}): string | undefined {
  if (input.relationship !== "neutral" || input.features.length === 0) {
    return undefined;
  }

  return `${input.signalId} is feature-relevant for ${input.features.join(", ")}, but feature-specific challenge demand is unknown; feature demand/capability relationship is not asserted. Overall task demand is traced separately.`;
}

export function makeAssessmentRelevanceTrace(input: {
  readonly signal: AssessmentSignal;
  readonly exercise: ExerciseDefinition;
  readonly request: CandidateRequest;
  readonly influence: AssessmentInfluence;
  readonly relevanceDecision: AssessmentRelevanceDecision;
  readonly alignmentEligible: boolean;
  readonly painMatchTrace: CandidatePainMatchTrace;
}): AssessmentRelevanceTrace {
  const signalInterpretation = interpretAssessmentSignal(input.signal);
  const taskInterpretation = overallTaskSignalInterpretation({
    signalInterpretation,
    hasFeatureSpecificEvidence: input.relevanceDecision.featureMatches.length > 0,
    dimension: input.relevanceDecision.dimension,
  });
  const demandCapability = calculateDemandCapabilityTrace({
    request: input.request,
    exercise: input.exercise,
    signal: input.signal,
    dimension: input.relevanceDecision.dimension,
    relevance: input.relevanceDecision.relevance,
    signalInterpretation: taskInterpretation,
  });
  const featureDevelopment = buildFeatureDevelopmentTraces({
    request: input.request,
    exercise: input.exercise,
    signalInterpretation,
    featureMatches: input.relevanceDecision.featureMatches,
    overallTaskDemand: demandCapability,
  });
  const featureTargetFit = buildFeatureTargetFitTraces({
    signal: input.signal,
    relevance: input.relevanceDecision.relevance,
    featureMatches: input.relevanceDecision.featureMatches,
  });
  const featureTargetFitInfluence = strongestFeatureTargetFitInfluence(featureTargetFit);
  const demandReductionContext = demandReductionContextFor({
    request: input.request,
    exercise: input.exercise,
    signal: input.signal,
    painMatchTrace: input.painMatchTrace,
  });
  const featureChallengeNotAsserted =
    input.relevanceDecision.relevance !== "none" &&
    hasUnassertedFeatureChallenge(featureDevelopment);
  const relationship = featureChallengeNotAsserted
    ? "neutral"
    : relationshipFromDemand({
        influence: input.influence,
        demandCapability,
        request: input.request,
        demandReductionContext,
      });
  const featureRelationshipReason = featureUnknownRelationshipReason({
    relationship,
    signalId: input.signal.id,
    features: featureDevelopment.map((trace) => trace.assessmentFeature),
  });
  const budget = calculateInfluenceBudget({
    signal: input.signal,
    relevance: input.relevanceDecision.relevance,
    relationship,
    capabilityEvidenceQuality: demandCapability.capabilityEstimate.evidenceQuality,
    alignmentEligible: input.alignmentEligible,
    featureTargetFitInfluence,
  });

  return {
    signalId: input.signal.id,
    candidateId: input.exercise.id,
    requestedRole: input.request.need.requestedRole,
    relevance: input.relevanceDecision.relevance,
    relevanceReasonCode:
      relationship === "neutral"
        ? input.relevanceDecision.relevanceReasonCode
        : relationshipReasonCode(relationship),
    relevanceReason: input.relevanceDecision.relevanceReason,
    signalInterpretation,
    featureMatches: input.relevanceDecision.featureMatches,
    featureTargetFit,
    featureTargetFitInfluence: budget.featureTargetFitInfluence,
    featureDevelopment,
    developmentalChallengeInfluence: budget.developmentalChallengeInfluence,
    relationship,
    relationshipReason:
      featureRelationshipReason ??
      relationshipReason(relationship, demandCapability, demandReductionContext),
    demandReductionContext,
    demandCapability,
    confidence: input.signal.confidence,
    priority: input.signal.priority,
    direction: input.influence.direction,
    boundedInfluence: budget.boundedInfluence,
    assessmentContribution: budget.assessmentContribution,
    alignmentContribution: budget.alignmentContribution,
    contributesTo: budget.contributesTo,
  };
}
