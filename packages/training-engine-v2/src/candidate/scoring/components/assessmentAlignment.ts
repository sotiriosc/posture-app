import type { CandidateScoreComponent } from "../types";
import {
  calculateAssessmentRelevanceTraces,
  relevantAssessmentTraces,
  sumAlignmentContribution,
  sumAssessmentContribution,
} from "../assessmentRelevance";
import { component } from "../utils";

export const assessmentFitComponent: CandidateScoreComponent = {
  id: "assessment_fit",
  score({ request, exercise }) {
    const traces = calculateAssessmentRelevanceTraces({ request, exercise });
    const relevantTraces = relevantAssessmentTraces(traces);
    const conflict = relevantTraces.some((trace) => trace.direction === "conflicts");
    const contribution = sumAssessmentContribution(traces);

    return component({
      id: "assessment_fit",
      family: "assessment_relevance",
      value: 6 + contribution,
      reasonCode:
        conflict
          ? "ASSESSMENT_PRIORITY_CONFLICT"
          : relevantTraces[0]?.relevanceReasonCode ?? "ASSESSMENT_NOT_RELEVANT",
      reason:
        relevantTraces.length > 0
          ? `${exercise.name} has assessment relevance for: ${relevantTraces.map((trace) => trace.signalId).join(", ")}.`
          : `${exercise.name} has no assessment signal relevant to this requested training need.`,
      source: "assessment",
      assessmentRelevance: traces,
    });
  },
};

export const alignmentFitComponent: CandidateScoreComponent = {
  id: "alignment_fit",
  score({ request, exercise }) {
    const traces = calculateAssessmentRelevanceTraces({ request, exercise });
    const alignmentTraces = traces.filter((trace) => trace.alignmentContribution !== 0);
    const conflict = alignmentTraces.some((trace) => trace.direction === "conflicts");
    const contribution = sumAlignmentContribution(traces);

    return component({
      id: "alignment_fit",
      family: "alignment_fit",
      value: 6 + contribution,
      reasonCode:
        conflict
          ? "ALIGNMENT_PRIORITY_CONFLICT"
          : alignmentTraces[0]?.relevanceReasonCode ?? "ASSESSMENT_NOT_RELEVANT",
      reason:
        alignmentTraces.length > 0
          ? `${exercise.name} has alignment/control relevance for: ${alignmentTraces.map((trace) => trace.signalId).join(", ")}.`
          : `${exercise.name} is neutral to derived alignment priorities for this requested training need.`,
      source: "alignment",
      assessmentRelevance: traces,
    });
  },
};
