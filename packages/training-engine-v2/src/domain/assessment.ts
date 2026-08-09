import type {
  BodyRegion,
  ConfidenceLevel,
  MovementRole,
  MuscleGroup,
  PriorityLevel,
  Side,
} from "./primitives";

export const ASSESSMENT_SIGNAL_TYPES = [
  "movement_limitation",
  "mobility_finding",
  "stability_finding",
  "control_finding",
  "asymmetry_finding",
  "weakness_development_priority",
] as const;

export type AssessmentSignalType = (typeof ASSESSMENT_SIGNAL_TYPES)[number];

export const ASSESSMENT_SOURCES = [
  "self_report",
  "questionnaire",
  "photo_assessment",
  "movement_screen",
  "coach_review",
  "training_history",
] as const;

export type AssessmentSource = (typeof ASSESSMENT_SOURCES)[number];
export type AssessmentConfidence = ConfidenceLevel;
export type AssessmentPriority = PriorityLevel;

export interface AssessmentSignal {
  readonly id: string;
  readonly type: AssessmentSignalType;
  readonly source: AssessmentSource;
  readonly confidence: AssessmentConfidence;
  readonly priority: AssessmentPriority;
  readonly region?: BodyRegion;
  readonly movementRole?: MovementRole;
  readonly muscleGroup?: MuscleGroup;
  readonly side?: Side;
  readonly description: string;
}

export interface HistoricalWeakness {
  readonly id: string;
  readonly region?: BodyRegion;
  readonly movementRole?: MovementRole;
  readonly muscleGroup?: MuscleGroup;
  readonly lastObserved?: string;
  readonly description: string;
}

export interface AssessmentState {
  readonly signals: readonly AssessmentSignal[];
  readonly historicalWeaknesses: readonly HistoricalWeakness[];
}

export function getHighPriorityAssessmentSignals(
  assessment: AssessmentState,
): readonly AssessmentSignal[] {
  return assessment.signals.filter(
    (signal) => signal.priority === "primary" || signal.priority === "blocking",
  );
}
