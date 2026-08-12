import type { AthleteProfile } from "./domain/athlete";
import type { ModeratePainReviewUrgency } from "./domain/painInjury";
import type { PhaseIntent } from "./domain/phase";
import type { WeeklyIntent } from "./domain/programming";
import type { SessionIntent, TrainingSlot } from "./domain/session";
import type { CandidateEligibility } from "./eligibility";
import type { SessionEvaluation, WeekEvaluation } from "./optimizerContracts";
import type { ExercisePrescription, ProgressionDecision } from "./prescriptionProgression";
import type { CandidateScore } from "./scoringContracts";
import type { PipelineSnapshot } from "./pipelineObservability";
import type { ContextualPhaseResolutionTrace } from "./phaseSuitability";
import { buildCandidatePainExecutionReadinessTrace } from "./candidate/pain";
import type {
  CandidatePainExecutionReadinessTrace,
  CandidatePainMatchTrace,
  CandidatePainResultExecutionReadinessTrace,
  PainResponseRequirementTrace,
} from "./candidate/pain";

export interface CandidateTrace {
  readonly exerciseId: string;
  readonly eligibility: CandidateEligibility;
  readonly score?: CandidateScore;
}

export interface CandidatePainSummaryTrace {
  readonly candidateExerciseId: string;
  readonly uniqueMatchCount: number;
  readonly painSuitabilityCount: number;
  readonly jointCostCount: number;
  readonly warningSignalIds: readonly string[];
  readonly moderateReviewUrgencies: readonly {
    readonly signalId: string;
    readonly urgency: ModeratePainReviewUrgency;
  }[];
  readonly hardRejectedSignalIds: readonly string[];
  readonly urgentReviewSignalIds: readonly string[];
  readonly responseRequirements: readonly PainResponseRequirementTrace[];
  readonly executionReadiness: CandidatePainExecutionReadinessTrace;
}

export interface DecisionTrace {
  readonly traceId: string;
  readonly interpretedAthleteState: Pick<AthleteProfile, "id" | "experience" | "primaryGoal">;
  readonly phaseIntent?: PhaseIntent;
  readonly weeklyIntent?: WeeklyIntent;
  readonly sessionIntent?: SessionIntent;
  readonly slot?: TrainingSlot;
  readonly candidateCount: number;
  readonly hardRejections: readonly CandidateEligibility[];
  readonly topCandidateScores: readonly CandidateScore[];
  readonly candidatePainSummaries: readonly CandidatePainSummaryTrace[];
  readonly candidatePhaseResolutions: readonly ContextualPhaseResolutionTrace[];
  readonly painExecutionReadiness?: CandidatePainResultExecutionReadinessTrace;
  readonly selectedExerciseId?: string;
  readonly whyItWon?: string;
  readonly sessionLevelEffects?: SessionEvaluation;
  readonly weekLevelEffects?: WeekEvaluation;
  readonly continuityDecision?: string;
  readonly prescriptionDecision?: ExercisePrescription;
  readonly progressionDecision?: ProgressionDecision;
  readonly pipelineSnapshots?: readonly PipelineSnapshot[];
}

function painSummary(trace: CandidatePainMatchTrace): CandidatePainSummaryTrace {
  const decision = (receiver: string) =>
    trace.receiverDecisions.find((candidate) => candidate.receiver === receiver);
  const hardRejectedSignalIds = [
    ...(decision("hard_contraindication")?.affectedSignalIds ?? []),
    ...(decision("acute_severe_eligibility")?.affectedSignalIds ?? []),
  ];

  return {
    candidateExerciseId: trace.candidateExerciseId,
    uniqueMatchCount: trace.uniqueMatchCount,
    painSuitabilityCount: decision("pain_suitability")?.countedMatchUnitCount ?? 0,
    jointCostCount: decision("joint_cost")?.countedMatchUnitCount ?? 0,
    warningSignalIds: decision("moderate_warning")?.affectedSignalIds ?? [],
    moderateReviewUrgencies: trace.signalTraces.flatMap((signal) =>
      signal.moderateReviewUrgency
        ? [{ signalId: signal.signalId, urgency: signal.moderateReviewUrgency }]
        : [],
    ),
    hardRejectedSignalIds: [...new Set(hardRejectedSignalIds)].sort(),
    urgentReviewSignalIds: trace.signalTraces
      .filter((signal) => signal.urgentReviewRecommended === true)
      .map((signal) => signal.signalId),
    responseRequirements: trace.responseRequirements,
    executionReadiness: buildCandidatePainExecutionReadinessTrace(trace),
  };
}

export function createDecisionTrace(input: {
  readonly traceId: string;
  readonly athlete: AthleteProfile;
  readonly candidates: readonly CandidateTrace[];
  readonly selectedExerciseId?: string;
  readonly whyItWon?: string;
  readonly painExecutionReadiness?: CandidatePainResultExecutionReadinessTrace;
  readonly phaseResolutions?: readonly ContextualPhaseResolutionTrace[];
  readonly pipelineSnapshots?: readonly PipelineSnapshot[];
}): DecisionTrace {
  return {
    traceId: input.traceId,
    interpretedAthleteState: {
      id: input.athlete.id,
      experience: input.athlete.experience,
      primaryGoal: input.athlete.primaryGoal,
    },
    candidateCount: input.candidates.length,
    hardRejections: input.candidates
      .map((candidate) => candidate.eligibility)
      .filter((eligibility) => !eligibility.legal),
    topCandidateScores: input.candidates
      .flatMap((candidate) => (candidate.score ? [candidate.score] : []))
      .sort((left, right) => right.aggregate.value - left.aggregate.value)
      .slice(0, 5),
    candidatePainSummaries: input.candidates.map((candidate) =>
      painSummary(candidate.eligibility.painMatchTrace),
    ),
    candidatePhaseResolutions: input.phaseResolutions ?? [],
    painExecutionReadiness: input.painExecutionReadiness,
    selectedExerciseId: input.selectedExerciseId,
    whyItWon: input.whyItWon,
    pipelineSnapshots: input.pipelineSnapshots ?? [],
  };
}
