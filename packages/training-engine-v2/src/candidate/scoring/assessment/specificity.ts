import type { AssessmentSignal } from "../../../domain/assessment";
import type { ExerciseDefinition } from "../../../domain/exercise";
import type { AssessmentDemandDimension, AssessmentRelevanceLevel } from "../../../scoringContracts";
import type { CandidateRequest } from "../../request";
import { overlapCount } from "../utils";
import { CORE_ROLES, hasAny, signalIsScapular } from "./classifySignal";

function clampSpecificity(value: number): number {
  return Number(Math.max(0, Math.min(3, value)).toFixed(3));
}

export function candidateMatchesTrainingNeed(
  request: CandidateRequest,
  exercise: ExerciseDefinition,
): boolean {
  const roleMatches = exercise.trainingRoles.includes(request.need.requestedRole);
  const sectionMatches =
    !request.need.requestedSection ||
    Boolean(exercise.sectionSuitability[request.need.requestedSection]?.suitability);
  const movementMatches =
    request.need.targetMovementRoles.length === 0 ||
    overlapCount(exercise.movementRoles, request.need.targetMovementRoles) > 0;
  const muscleMatches =
    request.need.targetMuscles.length === 0 ||
    overlapCount([...exercise.primaryMuscles, ...exercise.secondaryMuscles], request.need.targetMuscles) > 0;

  return roleMatches && sectionMatches && movementMatches && muscleMatches;
}

export function specificityForSignal(input: {
  readonly signal: AssessmentSignal;
  readonly exercise: ExerciseDefinition;
  readonly request: CandidateRequest;
  readonly dimension: AssessmentDemandDimension;
}): number {
  const { signal, exercise, request } = input;
  const candidateMuscles = [...exercise.primaryMuscles, ...exercise.secondaryMuscles];
  const roleSpecificity = signal.movementRole && exercise.movementRoles.includes(signal.movementRole)
    ? 1
    : signal.movementRole && hasAny(request.need.targetMovementRoles, [signal.movementRole])
      ? 0.65
      : 0;
  const muscleSpecificity = signal.muscleGroup && exercise.primaryMuscles.includes(signal.muscleGroup)
    ? 1
    : signal.muscleGroup && exercise.secondaryMuscles.includes(signal.muscleGroup)
      ? 0.7
      : signalIsScapular(signal) && hasAny(candidateMuscles, ["serratus", "rotator_cuff", "upper_back"])
        ? 0.45
        : 0;
  const regionSpecificity = signal.region && exercise.bodyRegions.includes(signal.region) ? 0.45 : 0;
  const familySpecificity =
    input.dimension === "trunk_control" && hasAny(exercise.movementRoles, CORE_ROLES)
      ? 0.75
      : input.dimension === "scapular_control" && exercise.movementRoles.includes("scapular_control")
        ? 0.75
        : 0;
  const sectionSuitability = request.need.requestedSection
    ? exercise.sectionSuitability[request.need.requestedSection]?.suitability
    : undefined;
  const sectionSpecificity =
    sectionSuitability === "excellent"
      ? 0.25
      : sectionSuitability === "good"
        ? 0.15
        : 0;

  return clampSpecificity(
    Math.max(roleSpecificity, familySpecificity) +
      Math.max(muscleSpecificity, regionSpecificity) +
      sectionSpecificity,
  );
}

export function relevanceFromSpecificity(specificity: number): AssessmentRelevanceLevel {
  if (specificity >= 1.45) {
    return "high";
  }

  if (specificity >= 0.85) {
    return "moderate";
  }

  if (specificity > 0.25) {
    return "low";
  }

  return "none";
}
