import type { AssessmentState } from "./assessment";
import type { EquipmentCapabilities } from "./equipment";
import type { TrainingHistory } from "./history";
import type { PainAndInjuryState } from "./painInjury";
import type { PhaseState } from "./phase";
import type { ExperienceLevel, TrainingGoal } from "./primitives";
import type { TrainingSafetyState } from "./trainingSafety";

export interface TrainingPreferences {
  readonly preferredExerciseIds: readonly string[];
  readonly dislikedExerciseIds: readonly string[];
  readonly varietyPreference: "low" | "moderate" | "high";
  readonly notes: readonly string[];
}

export interface TrainingAvailability {
  readonly daysPerWeek: number;
  readonly minutesPerSession: number;
  readonly preferredTrainingDays: readonly string[];
}

export interface AthleteProfile {
  readonly id: string;
  readonly label: string;
  readonly experience: ExperienceLevel;
  readonly primaryGoal: TrainingGoal;
  readonly secondaryGoals: readonly TrainingGoal[];
  readonly preferences: TrainingPreferences;
  readonly availability: TrainingAvailability;
}

export interface CurrentTrainingState {
  readonly phase: PhaseState;
  readonly weekIndex: number;
  readonly sessionIndex?: number;
}

export interface TrainingEngineInput {
  readonly athlete: AthleteProfile;
  readonly assessment: AssessmentState;
  readonly painAndInjury: PainAndInjuryState;
  readonly trainingSafety?: TrainingSafetyState;
  readonly equipment: EquipmentCapabilities;
  readonly history: TrainingHistory;
  readonly currentState: CurrentTrainingState;
}
