import type {
  ExerciseDefinition,
  ExerciseDemandAnnotation,
  ExerciseDemandAnnotationLevel,
} from "../../../domain/exercise";
import type { AssessmentDemandDimension, CandidateDemandSourceTrace } from "../../../scoringContracts";
import { demandValue } from "../utils";

function clampDemand(value: number): number {
  return Number(Math.max(0, Math.min(3, value)).toFixed(3));
}

export function demandLevelToValue(level: ExerciseDemandAnnotationLevel): number {
  if (level === "unknown") {
    return 0;
  }

  return demandValue(level);
}

function fallbackLoadingDemand(
  exercise: ExerciseDefinition,
  dimension: AssessmentDemandDimension,
): ExerciseDemandAnnotation | undefined {
  switch (dimension) {
    case "stability":
      return {
        level: exercise.loading.stabilityDemand,
        source: "existing_loading_profile",
        reviewStatus: "accepted",
        notes: "Reused normalized ExerciseLoadingProfile.stabilityDemand.",
      };
    case "coordination":
      return {
        level: exercise.loading.coordinationDemand,
        source: "existing_loading_profile",
        reviewStatus: "accepted",
        notes: "Reused normalized ExerciseLoadingProfile.coordinationDemand.",
      };
    case "range":
      return {
        level: exercise.loading.skillDemand,
        source: "existing_loading_profile",
        reviewStatus: "needs_review",
        notes: "Temporary range proxy from skill demand until range is reviewed explicitly.",
      };
    case "joint_control":
      return {
        level: exercise.loading.skillDemand,
        source: "existing_loading_profile",
        reviewStatus: "needs_review",
        notes: "Temporary joint-control proxy from skill demand until joint-control demand is reviewed explicitly.",
      };
    case "trunk_control":
    case "scapular_control":
      return undefined;
  }
}

export function candidateDemandForDimension(input: {
  readonly exercise: ExerciseDefinition;
  readonly dimension: AssessmentDemandDimension;
}): CandidateDemandSourceTrace {
  const explicit = input.exercise.mechanics?.demands[input.dimension];
  const annotation = explicit?.level === "unknown"
    ? fallbackLoadingDemand(input.exercise, input.dimension) ?? explicit
    : explicit ?? fallbackLoadingDemand(input.exercise, input.dimension);

  if (!annotation || annotation.level === "unknown") {
    return {
      level: "unknown",
      value: null,
      source: "unknown",
      reviewStatus: "needs_review",
      evidence: [
        `${input.exercise.id} has no explicit ${input.dimension} demand annotation.`,
      ],
    };
  }

  return {
    level: annotation.level,
    value: clampDemand(demandLevelToValue(annotation.level)),
    source:
      annotation.source === "reference_catalog"
        ? "exercise_definition"
        : annotation.source === "existing_loading_profile"
          ? "existing_loading_profile"
          : annotation.source === "human_review_needed"
            ? "human_review_needed"
            : "unknown",
    reviewStatus: annotation.reviewStatus,
    evidence: [annotation.notes],
  };
}

export function candidateHasKnownDemand(
  exercise: ExerciseDefinition,
  dimension: AssessmentDemandDimension,
): boolean {
  return candidateDemandForDimension({ exercise, dimension }).level !== "unknown";
}
