import type { ScoreComponentFamily } from "../../scoringContracts";

export type CandidateScoringWeights = Readonly<Record<ScoreComponentFamily, number>>;

export const DEFAULT_CANDIDATE_SCORING_WEIGHTS: CandidateScoringWeights = {
  role_fit: 1.4,
  goal_fit: 1.1,
  session_intent: 1.0,
  weekly_need: 0.4,
  assessment_relevance: 0.9,
  alignment_fit: 0.9,
  pain_suitability: 1.2,
  experience_suitability: 0.7,
  phase_suitability: 1.0,
  stability_fit: 0.7,
  skill_fit: 0.7,
  progression_value: 0.9,
  continuity_value: 0.9,
  loadability: 0.8,
  stimulus_potential: 0.9,
  fatigue_cost: 0.7,
  joint_cost: 0.8,
  equipment_practicality: 0.6,
  session_synergy: 0.4,
  muscle_target_fit: 1.0,
};
