import type { AssessmentSignal } from "../../../domain/assessment";
import type { MovementRole } from "../../../domain/primitives";
import type { AssessmentDemandDimension } from "../../../scoringContracts";

export const LOWER_BODY_ROLES: readonly MovementRole[] = ["squat", "hinge", "single_leg"];
export const UPPER_ROLES: readonly MovementRole[] = [
  "horizontal_push",
  "vertical_push",
  "horizontal_pull",
  "vertical_pull",
  "scapular_control",
];
export const CORE_ROLES: readonly MovementRole[] = [
  "anti_extension_core",
  "anti_rotation_core",
  "breathing_position",
];

export function hasAny<T extends string>(left: readonly T[], right: readonly T[]): boolean {
  return left.some((value) => right.includes(value));
}

export function signalIsScapular(signal: AssessmentSignal): boolean {
  return (
    signal.movementRole === "scapular_control" ||
    signal.region === "shoulder" ||
    signal.muscleGroup === "serratus" ||
    signal.muscleGroup === "rotator_cuff" ||
    signal.muscleGroup === "upper_back"
  );
}

export function signalIsLowerBody(signal: AssessmentSignal): boolean {
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

export function signalIsTrunk(signal: AssessmentSignal): boolean {
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

export function signalDemandDimension(signal: AssessmentSignal): AssessmentDemandDimension {
  if (signalIsTrunk(signal)) {
    return "trunk_control";
  }

  if (signalIsScapular(signal)) {
    return "scapular_control";
  }

  if (signalIsLowerBody(signal)) {
    return signal.region === "knee" || signal.region === "hip" || signal.region === "ankle"
      ? "joint_control"
      : "stability";
  }

  return "stability";
}
