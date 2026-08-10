import type { AssessmentSignal } from "../../../domain/assessment";
import type {
  AssessmentCandidateRelationship,
  AssessmentRelevanceLevel,
  CapabilityEvidenceQuality,
} from "../../../scoringContracts";
import { relationshipScalar } from "./developmentalRelationship";

export interface AssessmentInfluenceBudget {
  readonly boundedInfluence: number;
  readonly assessmentContribution: number;
  readonly alignmentContribution: number;
  readonly contributesTo: readonly ("assessment_fit" | "alignment_fit")[];
}

function clampInfluence(value: number): number {
  return Number(Math.max(-1.2, Math.min(1.2, value)).toFixed(3));
}

function confidenceScalar(confidence: AssessmentSignal["confidence"]): number {
  switch (confidence) {
    case "high":
      return 1;
    case "medium":
      return 0.6;
    case "low":
      return 0.2;
  }
}

function priorityScalar(priority: AssessmentSignal["priority"]): number {
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

function relevanceScalar(relevance: AssessmentRelevanceLevel): number {
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
}): AssessmentInfluenceBudget {
  const boundedInfluence = clampInfluence(
    relevanceScalar(input.relevance) *
      confidenceScalar(input.signal.confidence) *
      priorityScalar(input.signal.priority) *
      relationshipScalar(input.relationship) *
      capabilityEvidenceScalar(input.capabilityEvidenceQuality) *
      1.2,
  );
  const alignmentShare =
    input.alignmentEligible && boundedInfluence !== 0 ? 0.4 : 0;
  const assessmentContribution = clampInfluence(
    boundedInfluence * (alignmentShare > 0 ? 0.6 : 1),
  );
  const alignmentContribution = clampInfluence(boundedInfluence * alignmentShare);
  const contributesTo = [
    ...(assessmentContribution !== 0 ? ["assessment_fit" as const] : []),
    ...(alignmentContribution !== 0 ? ["alignment_fit" as const] : []),
  ];

  return {
    boundedInfluence,
    assessmentContribution,
    alignmentContribution,
    contributesTo,
  };
}
