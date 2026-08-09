import type { AthleteProfile } from "./domain/athlete";
import type { PhaseIntent } from "./domain/phase";
import type { WeeklyIntent } from "./domain/programming";
import type { SessionIntent, TrainingSlot } from "./domain/session";
import type { CandidateEligibility } from "./eligibility";
import type { SessionEvaluation, WeekEvaluation } from "./optimizerContracts";
import type { ExercisePrescription, ProgressionDecision } from "./prescriptionProgression";
import type { CandidateScore } from "./scoringContracts";
import type { PipelineSnapshot } from "./pipelineObservability";

export interface CandidateTrace {
  readonly exerciseId: string;
  readonly eligibility: CandidateEligibility;
  readonly score?: CandidateScore;
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
  readonly selectedExerciseId?: string;
  readonly whyItWon?: string;
  readonly sessionLevelEffects?: SessionEvaluation;
  readonly weekLevelEffects?: WeekEvaluation;
  readonly continuityDecision?: string;
  readonly prescriptionDecision?: ExercisePrescription;
  readonly progressionDecision?: ProgressionDecision;
  readonly pipelineSnapshots?: readonly PipelineSnapshot[];
}

export function createDecisionTrace(input: {
  readonly traceId: string;
  readonly athlete: AthleteProfile;
  readonly candidates: readonly CandidateTrace[];
  readonly selectedExerciseId?: string;
  readonly whyItWon?: string;
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
    selectedExerciseId: input.selectedExerciseId,
    whyItWon: input.whyItWon,
    pipelineSnapshots: input.pipelineSnapshots ?? [],
  };
}
