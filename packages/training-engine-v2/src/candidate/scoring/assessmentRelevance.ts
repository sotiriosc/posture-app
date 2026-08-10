import {
  assessmentInfluenceForSignal,
  type AssessmentInfluence,
} from "../../alignment";
import type { AssessmentSignal } from "../../domain/assessment";
import type { ExerciseDefinition } from "../../domain/exercise";
import type { MovementRole } from "../../domain/primitives";
import type { ReasonCode } from "../../reasonCodes";
import type { AssessmentRelevanceLevel, AssessmentRelevanceTrace } from "../../scoringContracts";
import type { CandidateRequest } from "../request";
import { demandValue, overlapCount } from "./utils";

const LOWER_BODY_ROLES: readonly MovementRole[] = ["squat", "hinge", "single_leg"];
const UPPER_ROLES: readonly MovementRole[] = [
  "horizontal_push",
  "vertical_push",
  "horizontal_pull",
  "vertical_pull",
  "scapular_control",
];
const CORE_ROLES: readonly MovementRole[] = [
  "anti_extension_core",
  "anti_rotation_core",
  "breathing_position",
];

function clampInfluence(value: number): number {
  return Number(Math.max(-1.2, Math.min(1.2, value)).toFixed(3));
}

function hasAny<T extends string>(left: readonly T[], right: readonly T[]): boolean {
  return left.some((value) => right.includes(value));
}

function signalIsScapular(signal: AssessmentSignal): boolean {
  return (
    signal.movementRole === "scapular_control" ||
    signal.region === "shoulder" ||
    signal.muscleGroup === "serratus" ||
    signal.muscleGroup === "rotator_cuff" ||
    signal.muscleGroup === "upper_back"
  );
}

function signalIsLowerBody(signal: AssessmentSignal): boolean {
  return (
    signal.region === "hip" ||
    signal.region === "knee" ||
    signal.region === "ankle" ||
    signal.movementRole === "squat" ||
    signal.movementRole === "hinge" ||
    signal.movementRole === "single_leg" ||
    signal.muscleGroup === "quads" ||
    signal.muscleGroup === "hamstrings" ||
    signal.muscleGroup === "glutes" ||
    signal.muscleGroup === "hip_abductors" ||
    signal.muscleGroup === "hip_adductors"
  );
}

function signalIsTrunk(signal: AssessmentSignal): boolean {
  return (
    signal.region === "lumbar_spine" ||
    signal.region === "ribcage" ||
    signal.region === "pelvis" ||
    signal.movementRole === "anti_extension_core" ||
    signal.movementRole === "anti_rotation_core" ||
    signal.movementRole === "breathing_position" ||
    signal.muscleGroup === "trunk"
  );
}

function candidateMatchesTrainingNeed(
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

function relevanceScalar(relevance: AssessmentRelevanceLevel): number {
  switch (relevance) {
    case "high":
      return 1;
    case "moderate":
      return 0.65;
    case "low":
      return 0.35;
    case "none":
      return 0;
  }
}

function confidenceScalar(confidence: AssessmentSignal["confidence"]): number {
  switch (confidence) {
    case "high":
      return 1;
    case "medium":
      return 0.6;
    case "low":
      return 0.2;
  }
}

function priorityScalar(priority: AssessmentSignal["priority"]): number {
  switch (priority) {
    case "blocking":
    case "primary":
      return 1;
    case "secondary":
      return 0.65;
    case "context":
      return 0.3;
  }
}

function directionScalar(direction: AssessmentInfluence["direction"]): number {
  switch (direction) {
    case "supports":
      return 1;
    case "conflicts":
      return -1;
    case "neutral":
      return 0;
  }
}

function makeTrace(input: {
  readonly signal: AssessmentSignal;
  readonly exercise: ExerciseDefinition;
  readonly request: CandidateRequest;
  readonly influence: AssessmentInfluence;
  readonly relevance: AssessmentRelevanceLevel;
  readonly relevanceReasonCode: ReasonCode;
  readonly relevanceReason: string;
  readonly alignmentEligible: boolean;
}): AssessmentRelevanceTrace {
  const boundedInfluence = clampInfluence(
    relevanceScalar(input.relevance) *
      confidenceScalar(input.signal.confidence) *
      priorityScalar(input.signal.priority) *
      directionScalar(input.influence.direction) *
      1.2,
  );
  const alignmentShare =
    input.alignmentEligible && boundedInfluence !== 0 ? 0.4 : 0;
  const assessmentContribution = clampInfluence(
    boundedInfluence * (alignmentShare > 0 ? 0.6 : 1),
  );
  const alignmentContribution = clampInfluence(boundedInfluence * alignmentShare);
  const contributesTo = [
    ...(assessmentContribution !== 0 ? ["assessment_fit" as const] : []),
    ...(alignmentContribution !== 0 ? ["alignment_fit" as const] : []),
  ];

  return {
    signalId: input.signal.id,
    candidateId: input.exercise.id,
    requestedRole: input.request.need.requestedRole,
    relevance: input.relevance,
    relevanceReasonCode: input.relevanceReasonCode,
    relevanceReason: input.relevanceReason,
    confidence: input.signal.confidence,
    priority: input.signal.priority,
    direction: input.influence.direction,
    boundedInfluence,
    assessmentContribution,
    alignmentContribution,
    contributesTo,
  };
}

function notRelevantTrace(input: {
  readonly signal: AssessmentSignal;
  readonly exercise: ExerciseDefinition;
  readonly request: CandidateRequest;
  readonly influence: AssessmentInfluence;
  readonly reason: string;
}): AssessmentRelevanceTrace {
  return makeTrace({
    ...input,
    relevance: "none",
    relevanceReasonCode: "ASSESSMENT_NOT_RELEVANT",
    relevanceReason: input.reason,
    alignmentEligible: false,
  });
}

function evaluateSignalRelevance(input: {
  readonly request: CandidateRequest;
  readonly exercise: ExerciseDefinition;
  readonly signal: AssessmentSignal;
  readonly alignmentPrioritySignalIds: ReadonlySet<string>;
}): AssessmentRelevanceTrace {
  const { request, exercise, signal } = input;
  const influence = assessmentInfluenceForSignal(signal);
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
  const alignmentEligible = input.alignmentPrioritySignalIds.has(signal.id);

  if (!candidateIsTruthful) {
    return notRelevantTrace({
      signal,
      exercise,
      request,
      influence,
      reason: `${exercise.name} is not a truthful candidate for ${request.need.requestedRole}; assessment cannot create role relevance.`,
    });
  }

  if (movementRoleMatchesNeed && movementRoleMatchesCandidate) {
    return makeTrace({
      signal,
      exercise,
      request,
      influence,
      relevance: "high",
      relevanceReasonCode: "ASSESSMENT_MOVEMENT_RELEVANT",
      relevanceReason: `${signal.id} directly matches the requested and candidate movement role ${signal.movementRole}.`,
      alignmentEligible,
    });
  }

  if (
    signalIsScapular(signal) &&
    hasAny(request.need.targetMovementRoles, UPPER_ROLES) &&
    hasAny(exercise.movementRoles, UPPER_ROLES)
  ) {
    const directScapularCandidate = exercise.movementRoles.includes("scapular_control");
    return makeTrace({
      signal,
      exercise,
      request,
      influence,
      relevance: directScapularCandidate || request.need.requestedSection === "activation" ? "high" : "moderate",
      relevanceReasonCode: directScapularCandidate
        ? "ASSESSMENT_MOVEMENT_RELEVANT"
        : "ASSESSMENT_JOINT_RELEVANT",
      relevanceReason: `${signal.id} is scapular/shoulder related and the requested need is an upper-body movement the candidate actually performs.`,
      alignmentEligible,
    });
  }

  if (
    signalIsLowerBody(signal) &&
    hasAny(request.need.targetMovementRoles, LOWER_BODY_ROLES) &&
    hasAny(exercise.movementRoles, LOWER_BODY_ROLES)
  ) {
    const regionMatches = signal.region ? exercise.bodyRegions.includes(signal.region) : false;
    const muscleMatches = signal.muscleGroup ? candidateMuscles.includes(signal.muscleGroup) : false;
    return makeTrace({
      signal,
      exercise,
      request,
      influence,
      relevance: movementRoleMatchesCandidate || regionMatches || muscleMatches ? "high" : "moderate",
      relevanceReasonCode: regionMatches
        ? "ASSESSMENT_JOINT_RELEVANT"
        : "ASSESSMENT_MOVEMENT_RELEVANT",
      relevanceReason: `${signal.id} is lower-body related and both the request and candidate are lower-body movement candidates.`,
      alignmentEligible,
    });
  }

  if (signalIsTrunk(signal)) {
    const directCoreRequest = hasAny(request.need.targetMovementRoles, CORE_ROLES);
    const directCoreCandidate = hasAny(exercise.movementRoles, CORE_ROLES);
    if (directCoreRequest && directCoreCandidate) {
      return makeTrace({
        signal,
        exercise,
        request,
        influence,
        relevance: "high",
        relevanceReasonCode: "ASSESSMENT_STABILITY_RELEVANT",
        relevanceReason: `${signal.id} directly matches a requested core-control role.`,
        alignmentEligible,
      });
    }

    const stabilityDemand = demandValue(exercise.loading.stabilityDemand);
    const trunkDemand =
      candidateMuscles.includes("trunk") ||
      exercise.bodyRegions.includes("lumbar_spine") ||
      exercise.bodyRegions.includes("ribcage") ||
      exercise.bodyRegions.includes("pelvis") ||
      stabilityDemand > 1;
    const requestedRoleCanExpressStability =
      request.need.requestedSection === "main" ||
      hasAny(request.need.targetMovementRoles, [...UPPER_ROLES, ...LOWER_BODY_ROLES]);

    if (candidateMatchesRequestedMovement && requestedRoleCanExpressStability && trunkDemand) {
      return makeTrace({
        signal,
        exercise,
        request,
        influence,
        relevance: stabilityDemand >= 3 || candidateMuscles.includes("trunk") ? "moderate" : "low",
        relevanceReasonCode: "ASSESSMENT_STABILITY_RELEVANT",
        relevanceReason: `${signal.id} is trunk-control related and ${exercise.name} has candidate-specific trunk or stability demand for the requested movement.`,
        alignmentEligible,
      });
    }
  }

  if (
    signal.muscleGroup &&
    request.need.targetMuscles.includes(signal.muscleGroup) &&
    candidateMuscles.includes(signal.muscleGroup) &&
    candidateMatchesRequestedMovement
  ) {
    return makeTrace({
      signal,
      exercise,
      request,
      influence,
      relevance: "moderate",
      relevanceReasonCode: "ASSESSMENT_ROLE_RELEVANT",
      relevanceReason: `${signal.id} matches a requested target muscle on a truthful movement candidate.`,
      alignmentEligible: false,
    });
  }

  return notRelevantTrace({
    signal,
    exercise,
    request,
    influence,
    reason: `${signal.id} does not have movement, stability, joint, or requested-muscle relevance to this candidate in this requested role.`,
  });
}

export function calculateAssessmentRelevanceTraces(input: {
  readonly request: CandidateRequest;
  readonly exercise: ExerciseDefinition;
}): readonly AssessmentRelevanceTrace[] {
  const alignmentPrioritySignalIds = new Set(
    input.request.alignmentPriorities.flatMap((priority) => priority.sourceAssessmentSignalIds),
  );

  return input.request.assessment.signals.map((signal) =>
    evaluateSignalRelevance({
      request: input.request,
      exercise: input.exercise,
      signal,
      alignmentPrioritySignalIds,
    }),
  );
}

export function sumAssessmentContribution(
  traces: readonly AssessmentRelevanceTrace[],
): number {
  const total = traces.reduce((sum, trace) => sum + trace.assessmentContribution, 0);
  return Number(Math.max(-1.2, Math.min(1.2, total)).toFixed(3));
}

export function sumAlignmentContribution(
  traces: readonly AssessmentRelevanceTrace[],
): number {
  const total = traces.reduce((sum, trace) => sum + trace.alignmentContribution, 0);
  return Number(Math.max(-0.8, Math.min(0.8, total)).toFixed(3));
}

export function relevantAssessmentTraces(
  traces: readonly AssessmentRelevanceTrace[],
): readonly AssessmentRelevanceTrace[] {
  return traces.filter((trace) => trace.relevance !== "none" && trace.boundedInfluence !== 0);
}
