import type { AssessmentSignal } from "../../../domain/assessment";
import type {
  AssessmentFeatureMatchTrace,
  AssessmentFeatureTargetFitTrace,
  AssessmentRelevanceLevel,
} from "../../../scoringContracts";
import {
  FEATURE_TARGET_FIT_MAX,
  confidenceScalar,
  priorityScalar,
  relevanceScalar,
} from "./influenceBudget";
import { relevanceFromFeatureMatch } from "./features";

function clampTargetFit(value: number): number {
  return Number(Math.max(0, Math.min(FEATURE_TARGET_FIT_MAX, value)).toFixed(3));
}

export function buildFeatureTargetFitTraces(input: {
  readonly signal: AssessmentSignal;
  readonly relevance: AssessmentRelevanceLevel;
  readonly featureMatches: readonly AssessmentFeatureMatchTrace[];
}): readonly AssessmentFeatureTargetFitTrace[] {
  return input.featureMatches.map((match) => {
    const relevance =
      input.relevance === "none" ? "none" : relevanceFromFeatureMatch(match.featureMatch);
    const influence = clampTargetFit(
      FEATURE_TARGET_FIT_MAX *
        relevanceScalar(relevance) *
        confidenceScalar(input.signal.confidence) *
        priorityScalar(input.signal.priority),
    );

    return {
      assessmentFeature: match.assessmentFeature,
      assessmentFeatureSource: match.assessmentFeatureSource,
      candidateFeature: match.candidateFeature,
      candidateFeatureLevel: match.candidateFeatureLevel,
      candidateFeatureReviewStatus: match.candidateFeatureReviewStatus,
      candidateFeatureProfileReviewStatus: match.candidateFeatureProfileReviewStatus,
      featureMatch: match.featureMatch,
      relevance,
      confidence: input.signal.confidence,
      priority: input.signal.priority,
      influence,
      source: "scapular_feature_match",
      evidence: [
        match.featureReason,
        influence === 0
          ? "Feature target fit receives no selection influence for unknown, conflict, or low-expression feature evidence."
          : `Feature match determines relevance; target fit is FEATURE_TARGET_FIT_MAX=${FEATURE_TARGET_FIT_MAX.toFixed(3)} multiplied once by relevance, confidence, and priority.`,
        "Feature target fit does not use severity, generic task demand, athlete capability, history capability, phase prior, or feature challenge demand.",
      ],
    };
  });
}

export function strongestFeatureTargetFitInfluence(
  traces: readonly AssessmentFeatureTargetFitTrace[],
): number {
  if (traces.length === 0) {
    return 0;
  }

  return clampTargetFit(Math.max(...traces.map((trace) => trace.influence)));
}
