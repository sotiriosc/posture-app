import type {
  AssessmentConfidence,
  AssessmentPriority,
  AssessmentSignal,
  AssessmentState,
} from "./domain/assessment";
import type {
  BodyRegion,
  MovementRole,
  MuscleGroup,
} from "./domain/primitives";
import type { ReasonCode } from "./reasonCodes";

export type AssessmentInfluenceDirection = "supports" | "neutral" | "conflicts";
export type AssessmentInfluenceRelevance = "none" | "low" | "moderate" | "high";

export interface AssessmentInfluence {
  readonly relevance: AssessmentInfluenceRelevance;
  readonly direction: AssessmentInfluenceDirection;
  readonly affectedSignalIds: readonly string[];
  readonly confidence: AssessmentConfidence;
  readonly reasonCode: ReasonCode;
  readonly reason: string;
}

export type AlignmentInfluenceTarget =
  | "phase_intent"
  | "session_intent"
  | "warmup_intent"
  | "activation_intent"
  | "main_candidate_scoring"
  | "accessory_candidate_scoring"
  | "prescription"
  | "progression";

export interface AlignmentPriority {
  readonly id: string;
  readonly sourceAssessmentSignalIds: readonly string[];
  readonly movementRoles: readonly MovementRole[];
  readonly bodyRegions: readonly BodyRegion[];
  readonly muscleGroups: readonly MuscleGroup[];
  readonly priority: AssessmentPriority;
  readonly confidence: AssessmentConfidence;
  readonly influenceTargets: readonly AlignmentInfluenceTarget[];
  readonly influence: AssessmentInfluence;
}

export interface AlignmentPriorityDerivation {
  readonly interpretedSignalIds: readonly string[];
  readonly priorities: readonly AlignmentPriority[];
  readonly ignoredLowRelevanceSignalIds: readonly string[];
}

function relevanceForSignal(signal: AssessmentSignal): AssessmentInfluenceRelevance {
  if (signal.confidence === "low") {
    return signal.priority === "blocking" ? "moderate" : "low";
  }

  if (signal.priority === "blocking" || signal.priority === "primary") {
    return "high";
  }

  if (signal.priority === "secondary") {
    return "moderate";
  }

  return "low";
}

function directionForSignal(signal: AssessmentSignal): AssessmentInfluenceDirection {
  return signal.priority === "blocking" ? "conflicts" : "supports";
}

function reasonCodeForSignal(signal: AssessmentSignal): ReasonCode {
  return directionForSignal(signal) === "conflicts"
    ? "ALIGNMENT_PRIORITY_CONFLICT"
    : "ALIGNMENT_PRIORITY_SUPPORTED";
}

export function assessmentInfluenceForSignal(signal: AssessmentSignal): AssessmentInfluence {
  const relevance = relevanceForSignal(signal);
  const direction = relevance === "low" ? "neutral" : directionForSignal(signal);

  return {
    relevance,
    direction,
    affectedSignalIds: [signal.id],
    confidence: signal.confidence,
    reasonCode: direction === "conflicts" ? "ASSESSMENT_PRIORITY_CONFLICT" : "ASSESSMENT_PRIORITY_SUPPORTED",
    reason:
      direction === "neutral"
        ? "Low-confidence or low-priority assessment signal remains visible without dominating programming."
        : signal.description,
  };
}

export function deriveAlignmentPriorities(
  assessment: AssessmentState,
): AlignmentPriorityDerivation {
  const priorities = assessment.signals
    .map((signal): AlignmentPriority | null => {
      const influence = assessmentInfluenceForSignal(signal);
      if (influence.relevance === "low") {
        return null;
      }

      return {
        id: `alignment-${signal.id}`,
        sourceAssessmentSignalIds: [signal.id],
        movementRoles: signal.movementRole ? [signal.movementRole] : [],
        bodyRegions: signal.region ? [signal.region] : [],
        muscleGroups: signal.muscleGroup ? [signal.muscleGroup] : [],
        priority: signal.priority,
        confidence: signal.confidence,
        influenceTargets: [
          "phase_intent",
          "session_intent",
          "warmup_intent",
          "activation_intent",
          "main_candidate_scoring",
          "accessory_candidate_scoring",
          "prescription",
          "progression",
        ],
        influence: {
          ...influence,
          reasonCode: reasonCodeForSignal(signal),
        },
      };
    })
    .filter((priority): priority is AlignmentPriority => Boolean(priority));

  return {
    interpretedSignalIds: assessment.signals.map((signal) => signal.id),
    priorities,
    ignoredLowRelevanceSignalIds: assessment.signals
      .filter((signal) => assessmentInfluenceForSignal(signal).relevance === "low")
      .map((signal) => signal.id),
  };
}
