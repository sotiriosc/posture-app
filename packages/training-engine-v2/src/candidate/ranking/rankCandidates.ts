import { assessmentInfluenceForSignal } from "../../alignment";
import { createDecisionTrace, type CandidateTrace } from "../../decisionTrace";
import {
  appendPipelineSnapshot,
  createPipelineSnapshot,
  type PipelineObservationLog,
} from "../../pipelineObservability";
import type { ReasonCode } from "../../reasonCodes";
import { evaluateHardEligibilityComponents } from "../eligibility";
import {
  interpretCandidateRequest,
  type CandidateRequest,
} from "../request";
import { aggregateCandidateScore } from "../scoring/aggregate";
import type { CandidateScoringWeights } from "../scoring/config";
import { CANDIDATE_SCORE_COMPONENTS } from "../scoring/components";
import type { CandidateScoreComponent } from "../scoring/types";
import type {
  CandidateRankingResult,
  LegalCandidate,
  RankedCandidate,
  RejectedCandidate,
} from "../types";

export interface CandidateRankingOptions {
  readonly scoreComponents?: readonly CandidateScoreComponent[];
  readonly weights?: CandidateScoringWeights;
}

function uniqueReasonCodes(codes: readonly ReasonCode[]): readonly ReasonCode[] {
  return [...new Set(codes)].sort();
}

function summarizeRankedCandidate(candidate: RankedCandidate): string {
  const strongest = [...candidate.components].sort(
    (left, right) => right.value - left.value || left.id.localeCompare(right.id),
  )[0];

  return strongest
    ? `${candidate.exercise.name} ranked #${candidate.rank} with ${candidate.total.toFixed(3)}; strongest component was ${strongest.id}.`
    : `${candidate.exercise.name} ranked #${candidate.rank} with ${candidate.total.toFixed(3)}.`;
}

function rankLegalCandidates(input: {
  readonly request: CandidateRequest;
  readonly legalCandidates: readonly LegalCandidate[];
  readonly scoreComponents: readonly CandidateScoreComponent[];
  readonly weights?: CandidateScoringWeights;
}): readonly RankedCandidate[] {
  const scored = input.legalCandidates.map((candidate) => {
    const components = input.scoreComponents.map((scoreComponent) =>
      scoreComponent.score({
        request: input.request,
        exercise: candidate.exercise,
      }),
    );
    const score = aggregateCandidateScore({
      exerciseId: candidate.exercise.id,
      components,
      weights: input.weights,
    });

    return {
      exercise: candidate.exercise,
      score,
      total: score.aggregate.value,
      components: score.components,
    };
  });

  return scored
    .sort((left, right) => right.total - left.total || left.exercise.id.localeCompare(right.exercise.id))
    .map((candidate, index) => {
      const ranked: RankedCandidate = {
        ...candidate,
        rank: index + 1,
        summary: "",
      };

      return {
        ...ranked,
        summary: summarizeRankedCandidate(ranked),
      };
    });
}

export function rankCandidateRequest(
  request: CandidateRequest,
  options: CandidateRankingOptions = {},
): CandidateRankingResult {
  const scoreComponents = options.scoreComponents ?? CANDIDATE_SCORE_COMPONENTS;
  const interpretedContext = interpretCandidateRequest(request);
  const assessmentInfluence = request.assessment.signals.map(assessmentInfluenceForSignal);

  const evaluatedCandidates = request.candidatePool.map((exercise) => {
    const eligibility = evaluateHardEligibilityComponents(exercise, {
      equipment: request.equipment,
      painAndInjury: request.painAndInjury,
      assessment: request.assessment,
      requestedRole: request.need.requestedRole,
      satisfiedPrerequisiteIds: request.satisfiedPrerequisiteIds,
    });

    return { exercise, eligibility };
  });

  const hardRejectedCandidates: readonly RejectedCandidate[] = evaluatedCandidates
    .filter((candidate) => !candidate.eligibility.legal)
    .map((candidate) => ({
      exercise: candidate.exercise,
      eligibility: candidate.eligibility,
    }));
  const legalCandidates: readonly LegalCandidate[] = evaluatedCandidates
    .filter((candidate) => candidate.eligibility.legal)
    .map((candidate) => ({
      exercise: candidate.exercise,
      eligibility: candidate.eligibility,
    }));
  const rankedCandidates = rankLegalCandidates({
    request,
    legalCandidates,
    scoreComponents,
    weights: options.weights,
  });
  const scoresByExerciseId = new Map(
    rankedCandidates.map((candidate) => [candidate.exercise.id, candidate.score] as const),
  );
  const rejectionReasonCodes = uniqueReasonCodes(
    hardRejectedCandidates.flatMap((candidate) =>
      candidate.eligibility.rejectionReasons.map((reason) => reason.code),
    ),
  );
  const scoreReasonCodes = uniqueReasonCodes(
    rankedCandidates.flatMap((candidate) => candidate.components.map((component) => component.reasonCode)),
  );

  let pipeline: PipelineObservationLog = { snapshots: [] };
  pipeline = appendPipelineSnapshot(
    pipeline,
    createPipelineSnapshot({
      stage: "normalized_athlete_state",
      localizationStage: "input_interpretation",
      componentId: "candidate_request_interpreter",
      payload: interpretedContext,
    }),
  );
  pipeline = appendPipelineSnapshot(
    pipeline,
    createPipelineSnapshot({
      stage: "interpreted_assessment",
      localizationStage: "assessment_interpretation",
      componentId: "assessment_influence",
      payload: {
        signalIds: request.assessment.signals.map((signal) => signal.id),
        influence: assessmentInfluence,
      },
      reasonCodes: uniqueReasonCodes(assessmentInfluence.map((influence) => influence.reasonCode)),
    }),
  );
  pipeline = appendPipelineSnapshot(
    pipeline,
    createPipelineSnapshot({
      stage: "alignment_priorities",
      localizationStage: "assessment_interpretation",
      componentId: "alignment_priority_derivation",
      payload: request.alignmentPriorities,
      reasonCodes: uniqueReasonCodes(
        request.alignmentPriorities.map((priority) => priority.influence.reasonCode),
      ),
    }),
  );
  pipeline = appendPipelineSnapshot(
    pipeline,
    createPipelineSnapshot({
      stage: "hard_rejected_candidates",
      localizationStage: "eligibility",
      componentId: "hard_eligibility",
      payload: hardRejectedCandidates.map((candidate) => ({
        exerciseId: candidate.exercise.id,
        rejectionReasons: candidate.eligibility.rejectionReasons,
        warnings: candidate.eligibility.warnings,
      })),
      reasonCodes: rejectionReasonCodes,
    }),
  );
  pipeline = appendPipelineSnapshot(
    pipeline,
    createPipelineSnapshot({
      stage: "legal_candidate_pool",
      localizationStage: "eligibility",
      componentId: "legal_pool_builder",
      payload: {
        legalExerciseIds: legalCandidates.map((candidate) => candidate.exercise.id),
        legalCount: legalCandidates.length,
      },
    }),
  );
  pipeline = appendPipelineSnapshot(
    pipeline,
    createPipelineSnapshot({
      stage: "candidate_score_breakdowns",
      localizationStage: "candidate_scoring",
      componentId: "candidate_score_components",
      payload: rankedCandidates.map((candidate) => ({
        rank: candidate.rank,
        exerciseId: candidate.exercise.id,
        total: candidate.total,
        components: candidate.components,
      })),
      reasonCodes: scoreReasonCodes,
    }),
  );

  const candidateTraces: readonly CandidateTrace[] = evaluatedCandidates.map((candidate) => ({
    exerciseId: candidate.exercise.id,
    eligibility: candidate.eligibility,
    score: scoresByExerciseId.get(candidate.exercise.id),
  }));
  const winner = rankedCandidates[0];
  const decisionTrace = createDecisionTrace({
    traceId: `candidate-ranking:${request.id}`,
    athlete: request.athlete,
    candidates: candidateTraces,
    selectedExerciseId: winner?.exercise.id,
    whyItWon: winner?.summary,
    pipelineSnapshots: pipeline.snapshots,
  });

  return {
    request,
    interpretedContext,
    hardRejectedCandidates,
    legalCandidateCount: legalCandidates.length,
    rankedCandidates,
    assessmentInfluence,
    alignmentPriorities: request.alignmentPriorities,
    decisionTrace,
    pipeline,
  };
}
