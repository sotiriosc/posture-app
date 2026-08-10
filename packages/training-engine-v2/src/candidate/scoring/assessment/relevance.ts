import type { AssessmentSignal } from "../../../domain/assessment";
import type { ExerciseDefinition } from "../../../domain/exercise";
import type { ReasonCode } from "../../../reasonCodes";
import type {
  AssessmentDemandDimension,
  AssessmentRelevanceLevel,
} from "../../../scoringContracts";
import type { CandidateRequest } from "../../request";
import {
  CORE_ROLES,
  LOWER_BODY_ROLES,
  UPPER_ROLES,
  hasAny,
  signalDemandDimension,
  signalIsLowerBody,
  signalIsScapular,
  signalIsTrunk,
} from "./classifySignal";
import { candidateHasKnownDemand } from "./candidateDemand";
import {
  candidateMatchesTrainingNeed,
  relevanceFromSpecificity,
  specificityForSignal,
} from "./specificity";

export interface AssessmentRelevanceDecision {
  readonly relevance: AssessmentRelevanceLevel;
  readonly relevanceReasonCode: ReasonCode;
  readonly relevanceReason: string;
  readonly dimension: AssessmentDemandDimension;
}

export function notRelevantDecision(input: {
  readonly signal: AssessmentSignal;
  readonly reason: string;
}): AssessmentRelevanceDecision {
  return {
    relevance: "none",
    relevanceReasonCode: "ASSESSMENT_NOT_RELEVANT",
    relevanceReason: input.reason,
    dimension: signalDemandDimension(input.signal),
  };
}

export function decideAssessmentRelevance(input: {
  readonly request: CandidateRequest;
  readonly exercise: ExerciseDefinition;
  readonly signal: AssessmentSignal;
}): AssessmentRelevanceDecision {
  const { request, exercise, signal } = input;
  const candidateIsTruthful = candidateMatchesTrainingNeed(request, exercise);
  const movementRoleMatchesNeed =
    signal.movementRole && request.need.targetMovementRoles.includes(signal.movementRole);
  const movementRoleMatchesCandidate =
    signal.movementRole && exercise.movementRoles.includes(signal.movementRole);
  const candidateMatchesRequestedMovement = hasAny(
    exercise.movementRoles,
    request.need.targetMovementRoles,
  );
  const candidateMuscles = [...exercise.primaryMuscles, ...exercise.secondaryMuscles];

  if (!candidateIsTruthful) {
    return notRelevantDecision({
      signal,
      reason: `${exercise.name} is not a truthful candidate for ${request.need.requestedRole}; assessment cannot create role relevance.`,
    });
  }

  if (movementRoleMatchesNeed && movementRoleMatchesCandidate) {
    return {
      relevance: "high",
      relevanceReasonCode: "ASSESSMENT_MOVEMENT_RELEVANT",
      relevanceReason: `${signal.id} directly matches the requested and candidate movement role ${signal.movementRole}.`,
      dimension: signalDemandDimension(signal),
    };
  }

  if (
    signalIsScapular(signal) &&
    hasAny(request.need.targetMovementRoles, UPPER_ROLES) &&
    hasAny(exercise.movementRoles, UPPER_ROLES)
  ) {
    const dimension: AssessmentDemandDimension = "scapular_control";
    const specificity = specificityForSignal({ signal, exercise, request, dimension });
    const relevance = relevanceFromSpecificity(specificity);

    if (relevance === "none" || !candidateHasKnownDemand(exercise, dimension)) {
      return notRelevantDecision({
        signal,
        reason: `${signal.id} is scapular/shoulder related, but ${exercise.name} lacks enough explicit scapular-control metadata to use the signal.`,
      });
    }

    return {
      relevance,
      relevanceReasonCode: exercise.movementRoles.includes("scapular_control")
        ? "ASSESSMENT_MOVEMENT_RELEVANT"
        : "ASSESSMENT_JOINT_RELEVANT",
      relevanceReason: `${signal.id} is scapular/shoulder related; ${exercise.name} has scapular specificity ${specificity.toFixed(3)} from role, muscle, region, and section metadata.`,
      dimension,
    };
  }

  if (
    signalIsLowerBody(signal) &&
    hasAny(request.need.targetMovementRoles, LOWER_BODY_ROLES) &&
    hasAny(exercise.movementRoles, LOWER_BODY_ROLES)
  ) {
    const regionMatches = signal.region ? exercise.bodyRegions.includes(signal.region) : false;
    const muscleMatches = signal.muscleGroup ? candidateMuscles.includes(signal.muscleGroup) : false;
    const dimension = signalDemandDimension(signal);

    return {
      relevance: movementRoleMatchesCandidate || regionMatches || muscleMatches ? "high" : "moderate",
      relevanceReasonCode: regionMatches
        ? "ASSESSMENT_JOINT_RELEVANT"
        : "ASSESSMENT_MOVEMENT_RELEVANT",
      relevanceReason: `${signal.id} is lower-body related and both the request and candidate are lower-body movement candidates.`,
      dimension,
    };
  }

  if (signalIsTrunk(signal)) {
    const dimension: AssessmentDemandDimension = "trunk_control";
    const directCoreRequest = hasAny(request.need.targetMovementRoles, CORE_ROLES);
    const directCoreCandidate = hasAny(exercise.movementRoles, CORE_ROLES);
    const hasTrunkDemand = candidateHasKnownDemand(exercise, dimension);

    if (directCoreRequest && directCoreCandidate && hasTrunkDemand) {
      const specificity = specificityForSignal({ signal, exercise, request, dimension });

      return {
        relevance: relevanceFromSpecificity(specificity) === "none"
          ? "moderate"
          : relevanceFromSpecificity(specificity),
        relevanceReasonCode: "ASSESSMENT_STABILITY_RELEVANT",
        relevanceReason: `${signal.id} directly matches a requested core-control role; ${exercise.name} has trunk-control specificity ${specificity.toFixed(3)}.`,
        dimension,
      };
    }

    const requestedRoleCanExpressStability =
      request.need.requestedSection === "main" ||
      hasAny(request.need.targetMovementRoles, [...UPPER_ROLES, ...LOWER_BODY_ROLES]);

    if (candidateMatchesRequestedMovement && requestedRoleCanExpressStability && hasTrunkDemand) {
      const specificity = specificityForSignal({ signal, exercise, request, dimension });
      const relevance = relevanceFromSpecificity(specificity);

      if (relevance === "none") {
        return notRelevantDecision({
          signal,
          reason: `${signal.id} is trunk-control related, but ${exercise.name} has insufficient candidate-specific trunk-control metadata for this requested movement.`,
        });
      }

      return {
        relevance,
        relevanceReasonCode: "ASSESSMENT_STABILITY_RELEVANT",
        relevanceReason: `${signal.id} is trunk-control related; ${exercise.name} has trunk specificity ${specificity.toFixed(3)} and explicit trunk-control demand for the requested movement.`,
        dimension,
      };
    }
  }

  if (
    signal.muscleGroup &&
    request.need.targetMuscles.includes(signal.muscleGroup) &&
    candidateMuscles.includes(signal.muscleGroup) &&
    candidateMatchesRequestedMovement
  ) {
    return {
      relevance: "moderate",
      relevanceReasonCode: "ASSESSMENT_ROLE_RELEVANT",
      relevanceReason: `${signal.id} matches a requested target muscle on a truthful movement candidate.`,
      dimension: signalDemandDimension(signal),
    };
  }

  return notRelevantDecision({
    signal,
    reason: `${signal.id} does not have movement, stability, joint, or requested-muscle relevance to this candidate in this requested role.`,
  });
}
