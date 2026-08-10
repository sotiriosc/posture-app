import type { AssessmentInfluence } from "../../../alignment";
import type { AssessmentSignal } from "../../../domain/assessment";
import type { ExerciseDefinition } from "../../../domain/exercise";
import type { AssessmentRelevanceTrace } from "../../../scoringContracts";
import type { CandidateRequest } from "../../request";
import { interpretAssessmentSignal } from "./athleteCapability";
import { calculateDemandCapabilityTrace } from "./demandCapabilityMatch";
import {
  demandReductionContextFor,
  relationshipFromDemand,
  relationshipReason,
  relationshipReasonCode,
} from "./developmentalRelationship";
import { calculateInfluenceBudget } from "./influenceBudget";
import type { AssessmentRelevanceDecision } from "./relevance";

export function makeAssessmentRelevanceTrace(input: {
  readonly signal: AssessmentSignal;
  readonly exercise: ExerciseDefinition;
  readonly request: CandidateRequest;
  readonly influence: AssessmentInfluence;
  readonly relevanceDecision: AssessmentRelevanceDecision;
  readonly alignmentEligible: boolean;
}): AssessmentRelevanceTrace {
  const signalInterpretation = interpretAssessmentSignal(input.signal);
  const demandCapability = calculateDemandCapabilityTrace({
    request: input.request,
    exercise: input.exercise,
    signal: input.signal,
    dimension: input.relevanceDecision.dimension,
    relevance: input.relevanceDecision.relevance,
    signalInterpretation,
  });
  const demandReductionContext = demandReductionContextFor({
    request: input.request,
    exercise: input.exercise,
    signal: input.signal,
  });
  const relationship = relationshipFromDemand({
    influence: input.influence,
    demandCapability,
    request: input.request,
    demandReductionContext,
  });
  const budget = calculateInfluenceBudget({
    signal: input.signal,
    relevance: input.relevanceDecision.relevance,
    relationship,
    capabilityEvidenceQuality: demandCapability.capabilityEstimate.evidenceQuality,
    alignmentEligible: input.alignmentEligible,
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
    relationship,
    relationshipReason: relationshipReason(relationship, demandCapability, demandReductionContext),
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
