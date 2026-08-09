import type { CandidateEligibility } from "./eligibility";
import type { CandidateScore } from "./scoringContracts";
import type { TrainingStimulusSummary, WeeklyIntent } from "./domain/programming";
import type { SessionIntent, TrainingSlot } from "./domain/session";

export interface ExerciseCandidate {
  readonly exerciseId: string;
  readonly slotId: string;
  readonly eligibility: CandidateEligibility;
  readonly score?: CandidateScore;
}

export interface CandidateSet {
  readonly slot: TrainingSlot;
  readonly legalCandidates: readonly ExerciseCandidate[];
  readonly rejectedCandidates: readonly ExerciseCandidate[];
}

export interface EvaluationComponent {
  readonly id: string;
  readonly value: "positive" | "neutral" | "negative" | "error";
  readonly reason: string;
}

export interface SessionCandidate {
  readonly id: string;
  readonly sessionIntent: SessionIntent;
  readonly selectedExerciseIdsBySlot: Readonly<Record<string, string>>;
}

export interface SessionEvaluation {
  readonly sessionCandidateId: string;
  readonly coverage: readonly EvaluationComponent[];
  readonly redundancy: readonly EvaluationComponent[];
  readonly fatigue: readonly EvaluationComponent[];
  readonly jointStress: readonly EvaluationComponent[];
  readonly sectionCoherence: readonly EvaluationComponent[];
  readonly preparationDependencies: readonly EvaluationComponent[];
  readonly duration: readonly EvaluationComponent[];
  readonly equipmentTransitions: readonly EvaluationComponent[];
  readonly assessmentPriorities: readonly EvaluationComponent[];
}

export interface WeekCandidate {
  readonly id: string;
  readonly weeklyIntent: WeeklyIntent;
  readonly sessionCandidates: readonly SessionCandidate[];
}

export interface WeekEvaluation {
  readonly weekCandidateId: string;
  readonly weeklyCoverage: readonly EvaluationComponent[];
  readonly frequency: readonly EvaluationComponent[];
  readonly volume: readonly EvaluationComponent[];
  readonly recoverySpacing: readonly EvaluationComponent[];
  readonly fatigueInterference: readonly EvaluationComponent[];
  readonly jointStressConcentration: readonly EvaluationComponent[];
  readonly priorityExposure: readonly EvaluationComponent[];
  readonly continuity: readonly EvaluationComponent[];
  readonly phaseIntent: readonly EvaluationComponent[];
  readonly stimulusSummary: TrainingStimulusSummary;
}

export interface SessionOptimizerContract {
  proposeSessionCandidates(candidateSets: readonly CandidateSet[]): readonly SessionCandidate[];
  evaluateSession(candidate: SessionCandidate): SessionEvaluation;
}

export interface WeekOptimizerContract {
  proposeWeekCandidates(sessionCandidates: readonly SessionCandidate[]): readonly WeekCandidate[];
  evaluateWeek(candidate: WeekCandidate): WeekEvaluation;
}
