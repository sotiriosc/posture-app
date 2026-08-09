import type { AssessmentInfluence } from "../../alignment";
import type { ExerciseDefinition } from "../../domain/exercise";
import type { DemandLevel, Loadability, MovementRole, MuscleGroup } from "../../domain/primitives";
import type { ReasonCode } from "../../reasonCodes";
import type { ScoreComponent, ScoreComponentFamily, ScoreComponentSource } from "../../scoringContracts";

export function overlapCount<T extends string>(left: readonly T[], right: readonly T[]): number {
  return left.filter((value) => right.includes(value)).length;
}

export function clampScore(value: number): number {
  return Math.max(0, Math.min(10, Number(value.toFixed(3))));
}

export function demandValue(level: DemandLevel): number {
  return level === "low" ? 1 : level === "moderate" ? 2 : 3;
}

export function loadabilityValue(loadability: Loadability): number {
  switch (loadability) {
    case "none":
      return 0;
    case "limited":
      return 1;
    case "moderate":
      return 2;
    case "high":
      return 3;
  }
}

export function average(values: readonly number[]): number {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function component(input: {
  readonly id: string;
  readonly family: ScoreComponentFamily;
  readonly value: number;
  readonly reasonCode: ReasonCode;
  readonly reason: string;
  readonly source: ScoreComponentSource;
  readonly assessmentInfluence?: AssessmentInfluence;
}): ScoreComponent {
  return {
    id: input.id,
    family: input.family,
    value: clampScore(input.value),
    reasonCode: input.reasonCode,
    reason: input.reason,
    source: input.source,
    assessmentInfluence: input.assessmentInfluence,
  };
}

export function hasMovementRole(exercise: ExerciseDefinition, roles: readonly MovementRole[]): boolean {
  return overlapCount(exercise.movementRoles, roles) > 0;
}

export function hasTargetMuscle(exercise: ExerciseDefinition, muscles: readonly MuscleGroup[]): boolean {
  return overlapCount([...exercise.primaryMuscles, ...exercise.secondaryMuscles], muscles) > 0;
}
