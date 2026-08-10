import {
  assessmentInfluenceForSignal,
} from "../../alignment";
import type { ExerciseDefinition } from "../../domain/exercise";
import type { AssessmentRelevanceTrace } from "../../scoringContracts";
import type { CandidateRequest } from "../request";
import { decideAssessmentRelevance } from "./assessment/relevance";
import { makeAssessmentRelevanceTrace } from "./assessment/trace";

export function calculateAssessmentRelevanceTraces(input: {
  readonly request: CandidateRequest;
  readonly exercise: ExerciseDefinition;
}): readonly AssessmentRelevanceTrace[] {
  const alignmentPrioritySignalIds = new Set(
    input.request.alignmentPriorities.flatMap((priority) => priority.sourceAssessmentSignalIds),
  );

  return input.request.assessment.signals.map((signal) => {
    const influence = assessmentInfluenceForSignal(signal);

    return makeAssessmentRelevanceTrace({
      request: input.request,
      exercise: input.exercise,
      signal,
      influence,
      relevanceDecision: decideAssessmentRelevance({
        request: input.request,
        exercise: input.exercise,
        signal,
      }),
      alignmentEligible: alignmentPrioritySignalIds.has(signal.id),
    });
  });
}

export function sumAssessmentContribution(
  traces: readonly AssessmentRelevanceTrace[],
): number {
  const total = traces.reduce((sum, trace) => sum + trace.assessmentContribution, 0);
  return Number(Math.max(-1.2, Math.min(1.2, total)).toFixed(3));
}

export function sumAlignmentContribution(
  traces: readonly AssessmentRelevanceTrace[],
): number {
  const total = traces.reduce((sum, trace) => sum + trace.alignmentContribution, 0);
  return Number(Math.max(-0.8, Math.min(0.8, total)).toFixed(3));
}

export function relevantAssessmentTraces(
  traces: readonly AssessmentRelevanceTrace[],
): readonly AssessmentRelevanceTrace[] {
  return traces.filter((trace) => trace.relevance !== "none");
}
