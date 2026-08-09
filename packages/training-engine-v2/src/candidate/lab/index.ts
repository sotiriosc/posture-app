import type { CandidateRequest } from "../request";
import { rankCandidateRequest, type CandidateRankingOptions } from "../ranking";
import type { CandidateRankingResult } from "../types";

export interface RankingLabSummaryRow {
  readonly rank: number;
  readonly exerciseId: string;
  readonly exerciseName: string;
  readonly total: number;
  readonly componentValues: Readonly<Record<string, number>>;
}

export function runCandidateRankingLab(
  request: CandidateRequest,
  options: CandidateRankingOptions = {},
): CandidateRankingResult {
  return rankCandidateRequest(request, options);
}

export function summarizeCandidateRankingResult(
  result: CandidateRankingResult,
): readonly RankingLabSummaryRow[] {
  return result.rankedCandidates.map((candidate) => ({
    rank: candidate.rank,
    exerciseId: candidate.exercise.id,
    exerciseName: candidate.exercise.name,
    total: candidate.total,
    componentValues: Object.fromEntries(
      candidate.components.map((component) => [component.id, component.value]),
    ),
  }));
}
