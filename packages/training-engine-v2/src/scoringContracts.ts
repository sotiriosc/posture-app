import type { AssessmentInfluence } from "./alignment";
import type { ReasonCode } from "./reasonCodes";

export type ScoreComponentSource =
  | "athlete_profile"
  | "training_goal"
  | "session_intent"
  | "weekly_intent"
  | "assessment"
  | "alignment"
  | "pain_injury"
  | "equipment"
  | "phase"
  | "history"
  | "exercise_definition"
  | "optimizer_context";

export type ScoreComponentFamily =
  | "role_fit"
  | "goal_fit"
  | "muscle_target_fit"
  | "session_intent"
  | "weekly_need"
  | "assessment_relevance"
  | "alignment_fit"
  | "pain_suitability"
  | "experience_suitability"
  | "phase_suitability"
  | "stability_fit"
  | "skill_fit"
  | "progression_value"
  | "continuity_value"
  | "loadability"
  | "stimulus_potential"
  | "fatigue_cost"
  | "joint_cost"
  | "equipment_practicality"
  | "session_synergy";

export type AssessmentRelevanceLevel = "none" | "low" | "moderate" | "high";

export interface AssessmentRelevanceTrace {
  readonly signalId: string;
  readonly candidateId: string;
  readonly requestedRole: string;
  readonly relevance: AssessmentRelevanceLevel;
  readonly relevanceReasonCode: ReasonCode;
  readonly relevanceReason: string;
  readonly confidence: string;
  readonly priority: string;
  readonly direction: "supports" | "neutral" | "conflicts";
  readonly boundedInfluence: number;
  readonly assessmentContribution: number;
  readonly alignmentContribution: number;
  readonly contributesTo: readonly ("assessment_fit" | "alignment_fit")[];
}

export interface ScoreComponent {
  readonly id: string;
  readonly family: ScoreComponentFamily;
  readonly value: number;
  readonly reason: string;
  readonly reasonCode: ReasonCode;
  readonly source: ScoreComponentSource;
  readonly assessmentInfluence?: AssessmentInfluence;
  readonly assessmentRelevance?: readonly AssessmentRelevanceTrace[];
}

export interface CandidateScore {
  readonly exerciseId: string;
  readonly components: readonly ScoreComponent[];
  readonly aggregate: {
    readonly method:
      | "unweighted_mean_foundation_placeholder"
      | "weighted_mean_candidate_intelligence_v0";
    readonly value: number;
  };
}

export interface CandidateScoringModel {
  scoreCandidate(input: CandidateScoringInput): CandidateScore;
}

export interface CandidateScoringInput {
  readonly exerciseId: string;
  readonly components: readonly ScoreComponent[];
}

export function composeCandidateScore(input: CandidateScoringInput): CandidateScore {
  const total = input.components.reduce((sum, component) => sum + component.value, 0);
  const value = input.components.length === 0 ? 0 : Number((total / input.components.length).toFixed(3));

  return {
    exerciseId: input.exerciseId,
    components: [...input.components].sort((left, right) => left.id.localeCompare(right.id)),
    aggregate: {
      method: "unweighted_mean_foundation_placeholder",
      value,
    },
  };
}
