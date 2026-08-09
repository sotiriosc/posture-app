import type { BodyRegion, JointStressTag, Side } from "./primitives";

export type PainStateKind =
  | "historical_injury"
  | "historical_sensitivity"
  | "current_discomfort"
  | "moderate_pain"
  | "acute_severe_pain"
  | "hard_contraindication"
  | "personal_exercise_block";

export interface HistoricalInjury {
  readonly kind: "historical_injury";
  readonly id: string;
  readonly region: BodyRegion;
  readonly side?: Side;
  readonly status: "resolved" | "managed" | "recurring";
  readonly relevantStressTags: readonly JointStressTag[];
  readonly description: string;
}

export interface HistoricalSensitivity {
  readonly kind: "historical_sensitivity";
  readonly id: string;
  readonly region: BodyRegion;
  readonly stressTags: readonly JointStressTag[];
  readonly preferredModification?: "reduce_range" | "increase_support" | "reduce_load" | "monitor";
  readonly description: string;
}

export interface CurrentDiscomfort {
  readonly kind: "current_discomfort";
  readonly id: string;
  readonly region: BodyRegion;
  readonly severity0To10: 1 | 2;
  readonly stressTags: readonly JointStressTag[];
  readonly effect: "monitor" | "prefer_support" | "reduce_range" | "reduce_load";
  readonly description: string;
}

export interface ModeratePain {
  readonly kind: "moderate_pain";
  readonly id: string;
  readonly region: BodyRegion;
  readonly severity0To10: 3 | 4 | 5 | 6;
  readonly stressTags: readonly JointStressTag[];
  readonly requiredResponse: "avoid_aggravator" | "reduce_load_and_range" | "substitute_role";
  readonly description: string;
}

export interface AcuteSeverePain {
  readonly kind: "acute_severe_pain";
  readonly id: string;
  readonly region: BodyRegion;
  readonly severity0To10: 7 | 8 | 9 | 10;
  readonly stressTags: readonly JointStressTag[];
  readonly invalidatesTrainingRoles: readonly string[];
  readonly urgentReviewRecommended: boolean;
  readonly description: string;
}

export interface HardContraindication {
  readonly kind: "hard_contraindication";
  readonly id: string;
  readonly region?: BodyRegion;
  readonly exerciseIds?: readonly string[];
  readonly stressTags?: readonly JointStressTag[];
  readonly reason: string;
  readonly source: "athlete_report" | "clinician" | "coach" | "safety_rule";
}

export interface PersonalExerciseBlock {
  readonly kind: "personal_exercise_block";
  readonly id: string;
  readonly exerciseIds?: readonly string[];
  readonly exerciseFamilies?: readonly string[];
  readonly reason: string;
  readonly createdBy: "athlete" | "coach";
}

export interface PainAndInjuryState {
  readonly historicalInjuries: readonly HistoricalInjury[];
  readonly historicalSensitivities: readonly HistoricalSensitivity[];
  readonly currentDiscomforts: readonly CurrentDiscomfort[];
  readonly moderatePain: readonly ModeratePain[];
  readonly acuteSeverePain: readonly AcuteSeverePain[];
  readonly hardContraindications: readonly HardContraindication[];
  readonly personalExerciseBlocks: readonly PersonalExerciseBlock[];
}

export const NO_PAIN_OR_INJURY: PainAndInjuryState = {
  historicalInjuries: [],
  historicalSensitivities: [],
  currentDiscomforts: [],
  moderatePain: [],
  acuteSeverePain: [],
  hardContraindications: [],
  personalExerciseBlocks: [],
};
