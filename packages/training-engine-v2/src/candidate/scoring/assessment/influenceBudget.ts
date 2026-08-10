import type { AssessmentSignal } from "../../../domain/assessment";
import type {
  AssessmentCandidateRelationship,
  AssessmentRelevanceLevel,
  CapabilityEvidenceQuality,
} from "../../../scoringContracts";
import { relationshipScalar } from "./developmentalRelationship";

export interface AssessmentInfluenceBudget {
  readonly boundedInfluence: number;
  readonly featureTargetFitInfluence: number;
  readonly developmentalChallengeInfluence: number;
  readonly assessmentContribution: number;
  readonly alignmentContribution: number;
  readonly contributesTo: readonly ("assessment_fit" | "alignment_fit")[];
}

export const ASSESSMENT_INFLUENCE_MAX = 1.2;
export const FEATURE_TARGET_FIT_MAX = 0.6;

function clampInfluence(value: number): number {
  return Number(
    Math.max(-ASSESSMENT_INFLUENCE_MAX, Math.min(ASSESSMENT_INFLUENCE_MAX, value)).toFixed(3),
  );
}

function clampFeatureTargetFit(value: number): number {
  return Number(Math.max(0, Math.min(FEATURE_TARGET_FIT_MAX, value)).toFixed(3));
}

export function confidenceScalar(confidence: AssessmentSignal["confidence"]): number {
  switch (confidence) {
    case "high":
      return 1;
    case "medium":
      return 0.6;
    case "low":
      return 0.2;
  }
}

export function priorityScalar(priority: AssessmentSignal["priority"]): number {
  switch (priority) {
    case "blocking":
    case "primary":
      return 1;
    case "secondary":
      return 0.65;
    case "context":
      return 0.3;
  }
}

export function relevanceScalar(relevance: AssessmentRelevanceLevel): number {
  switch (relevance) {
    case "high":
      return 1;
    case "moderate":
      return 0.65;
    case "low":
      return 0.35;
    case "none":
      return 0;
  }
}

function capabilityEvidenceScalar(evidenceQuality: CapabilityEvidenceQuality): number {
  switch (evidenceQuality) {
    case "strong":
      return 1;
    case "moderate":
      return 0.75;
    case "weak":
      return 0.5;
    case "unknown":
      return 0.25;
  }
}

export function calculateInfluenceBudget(input: {
  readonly signal: AssessmentSignal;
  readonly relevance: AssessmentRelevanceLevel;
  readonly relationship: AssessmentCandidateRelationship;
  readonly capabilityEvidenceQuality: CapabilityEvidenceQuality;
  readonly alignmentEligible: boolean;
  readonly featureTargetFitInfluence?: number;
}): AssessmentInfluenceBudget {
  const featureTargetFitInfluence = clampFeatureTargetFit(input.featureTargetFitInfluence ?? 0);
  const developmentalChallengeInfluence = clampInfluence(
    relevanceScalar(input.relevance) *
      confidenceScalar(input.signal.confidence) *
      priorityScalar(input.signal.priority) *
      relationshipScalar(input.relationship) *
      capabilityEvidenceScalar(input.capabilityEvidenceQuality) *
      ASSESSMENT_INFLUENCE_MAX,
  );
  const alignmentShare =
    input.alignmentEligible && developmentalChallengeInfluence !== 0 ? 0.4 : 0;
  const developmentalAssessmentContribution =
    developmentalChallengeInfluence * (alignmentShare > 0 ? 0.6 : 1);
  const developmentalAlignmentContribution = developmentalChallengeInfluence * alignmentShare;
  const rawAssessmentContribution =
    featureTargetFitInfluence + developmentalAssessmentContribution;
  const rawCombinedInfluence = rawAssessmentContribution + developmentalAlignmentContribution;
  const boundedInfluence = clampInfluence(rawCombinedInfluence);
  const scale =
    rawCombinedInfluence !== 0 && Math.abs(rawCombinedInfluence) > ASSESSMENT_INFLUENCE_MAX
      ? boundedInfluence / rawCombinedInfluence
      : 1;
  const assessmentContribution = clampInfluence(rawAssessmentContribution * scale);
  const alignmentContribution = clampInfluence(developmentalAlignmentContribution * scale);
  const contributesTo = [
    ...(assessmentContribution !== 0 ? ["assessment_fit" as const] : []),
    ...(alignmentContribution !== 0 ? ["alignment_fit" as const] : []),
  ];

  return {
    boundedInfluence,
    featureTargetFitInfluence,
    developmentalChallengeInfluence,
    assessmentContribution,
    alignmentContribution,
    contributesTo,
  };
}
