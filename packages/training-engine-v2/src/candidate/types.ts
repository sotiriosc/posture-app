import type { AssessmentInfluence, AlignmentPriority } from "../alignment";
import type { ExerciseDefinition } from "../domain/exercise";
import type { CandidateEligibility } from "../eligibility";
import type { PipelineObservationLog } from "../pipelineObservability";
import type { CandidateScore, ScoreComponent } from "../scoringContracts";
import type { CandidateRequest, InterpretedCandidateContext } from "./request";
import type { DecisionTrace } from "../decisionTrace";
import type {
  CandidatePainExecutionReadinessTrace,
  CandidatePainMatchTrace,
  CandidatePainResultExecutionReadinessTrace,
} from "./pain";
import type { TrainingReadinessTrace } from "../domain/trainingSafety";

export interface LegalCandidate {
  readonly exercise: ExerciseDefinition;
  readonly eligibility: CandidateEligibility;
}

export interface RejectedCandidate {
  readonly exercise: ExerciseDefinition;
  readonly eligibility: CandidateEligibility;
}

export interface RankedCandidate {
  readonly rank: number;
  readonly exercise: ExerciseDefinition;
  readonly eligibility: CandidateEligibility;
  readonly score: CandidateScore;
  readonly total: number;
  readonly components: readonly ScoreComponent[];
  readonly summary: string;
  readonly painMatchTrace: CandidatePainMatchTrace;
  readonly painExecutionReadiness: CandidatePainExecutionReadinessTrace;
}

export interface CandidateRankingResult {
  readonly request: CandidateRequest;
  readonly interpretedContext: InterpretedCandidateContext;
  readonly hardRejectedCandidates: readonly RejectedCandidate[];
  readonly legalCandidateCount: number;
  readonly rankedCandidates: readonly RankedCandidate[];
  readonly painExecutionReadiness: CandidatePainResultExecutionReadinessTrace;
  readonly trainingReadiness: TrainingReadinessTrace;
  readonly assessmentInfluence: readonly AssessmentInfluence[];
  readonly alignmentPriorities: readonly AlignmentPriority[];
  readonly decisionTrace: DecisionTrace;
  readonly pipeline: PipelineObservationLog;
}
