import type { AssessmentFeature } from "./domain/assessment";
import type {
  ExerciseDefinition,
  ExerciseDemandAnnotationLevel,
  ExerciseTransitionRelationship,
} from "./domain/exercise";

export type TransitionDeltaDirection = "increase" | "decrease" | "same" | "unknown";

export interface TransitionValueDelta {
  readonly source: string;
  readonly target: string;
  readonly delta: TransitionDeltaDirection;
}

export interface TransitionSetDelta {
  readonly shared: readonly string[];
  readonly sourceOnly: readonly string[];
  readonly targetOnly: readonly string[];
}

export interface TransitionResistancePathDelta {
  readonly resistancePath: TransitionValueDelta;
  readonly trajectoryFreedom: TransitionValueDelta;
  readonly lineOfPullAdjustability: TransitionValueDelta;
  readonly laterality: TransitionValueDelta;
  readonly fitDependency: TransitionValueDelta;
}

export interface TransitionDemandDelta {
  readonly trunk: TransitionValueDelta;
  readonly stability: TransitionValueDelta;
  readonly coordination: TransitionValueDelta;
}

export interface TransitionScapularFeatureDelta {
  readonly feature: AssessmentFeature;
  readonly source: string;
  readonly target: string;
  readonly delta: TransitionDeltaDirection;
}

export interface ExerciseTransitionStructuralDelta {
  readonly sharedMovementRoles: readonly string[];
  readonly sourceOnlyMovementRoles: readonly string[];
  readonly targetOnlyMovementRoles: readonly string[];
  readonly sharedMuscles: readonly string[];
  readonly sourceOnlyMuscles: readonly string[];
  readonly targetOnlyMuscles: readonly string[];
  readonly support: {
    readonly externalSupport: TransitionValueDelta;
    readonly bodySupport: TransitionValueDelta;
  };
  readonly resistancePath: TransitionResistancePathDelta;
  readonly demand: TransitionDemandDelta;
  readonly loading: {
    readonly loadability: TransitionValueDelta;
    readonly loadingPotential: TransitionValueDelta;
  };
  readonly equipment: TransitionSetDelta;
  readonly assessmentFeatures: readonly TransitionScapularFeatureDelta[];
}

export interface ExerciseTransitionTrace {
  readonly sourceExerciseId: string;
  readonly targetExerciseId: string;
  readonly direction: ExerciseTransitionRelationship["direction"];
  readonly classification: ExerciseTransitionRelationship["classification"];
  readonly purposes: readonly ExerciseTransitionRelationship["purposes"][number][];
  readonly reviewStatus: ExerciseTransitionRelationship["reviewStatus"];
  readonly notes: string;
  readonly provenance: readonly string[];
  readonly structuralDelta: ExerciseTransitionStructuralDelta;
  readonly automaticSelectionEffect: "none";
}

function unique(values: readonly string[]): readonly string[] {
  return [...new Set(values)].sort();
}

function setDelta(source: readonly string[], target: readonly string[]): TransitionSetDelta {
  const sourceSet = new Set(source);
  const targetSet = new Set(target);

  return {
    shared: unique(source.filter((value) => targetSet.has(value))),
    sourceOnly: unique(source.filter((value) => !targetSet.has(value))),
    targetOnly: unique(target.filter((value) => !sourceSet.has(value))),
  };
}

function demandValue(level: string): number | null {
  switch (level) {
    case "low":
      return 1;
    case "moderate":
      return 2;
    case "high":
      return 3;
    default:
      return null;
  }
}

function loadabilityValue(loadability: string): number | null {
  switch (loadability) {
    case "none":
      return 0;
    case "limited":
      return 1;
    case "moderate":
      return 2;
    case "high":
      return 3;
    default:
      return null;
  }
}

function ordinalDelta(source: string, target: string, value: (input: string) => number | null): TransitionValueDelta {
  const sourceValue = value(source);
  const targetValue = value(target);

  if (sourceValue === null || targetValue === null) {
    return { source, target, delta: source === target ? "same" : "unknown" };
  }

  return {
    source,
    target,
    delta: targetValue > sourceValue ? "increase" : targetValue < sourceValue ? "decrease" : "same",
  };
}

function literalDelta(source: string, target: string): TransitionValueDelta {
  return {
    source,
    target,
    delta: source === target ? "same" : "unknown",
  };
}

function support(exercise: ExerciseDefinition) {
  return exercise.mechanics?.support;
}

function resistancePath(exercise: ExerciseDefinition) {
  return exercise.mechanics?.resistancePath;
}

function demandLevel(
  exercise: ExerciseDefinition,
  key: "trunk_control" | "stability" | "coordination",
): ExerciseDemandAnnotationLevel {
  return exercise.mechanics?.demands[key].level ?? "unknown";
}

function equipmentLabels(exercise: ExerciseDefinition): readonly string[] {
  return unique([
    ...exercise.equipmentRequirements.map((requirement) => requirement.label),
    ...exercise.optionalEquipment.map((requirement) => `optional: ${requirement.label}`),
  ]);
}

function muscleSet(exercise: ExerciseDefinition): readonly string[] {
  return unique([...exercise.primaryMuscles, ...exercise.secondaryMuscles]);
}

function scapularFeatureLevels(exercise: ExerciseDefinition): Partial<Record<AssessmentFeature, string>> {
  const scapular = exercise.mechanics?.scapularMechanics;

  if (!scapular) {
    return {};
  }

  return {
    serratus_or_protraction_control: scapular.serratusContribution.level,
    upward_rotation_control: scapular.upwardRotationControl.level,
    retraction_control: scapular.retractionDemand.level,
    external_rotation_or_cuff_control: scapular.externalRotationContribution.level,
    loaded_scapular_stability: scapular.loadedScapularControl.level,
  };
}

function scapularFeatureDelta(
  source: ExerciseDefinition,
  target: ExerciseDefinition,
): readonly TransitionScapularFeatureDelta[] {
  const sourceFeatures = scapularFeatureLevels(source);
  const targetFeatures = scapularFeatureLevels(target);
  const featureIds = unique([
    ...Object.keys(sourceFeatures),
    ...Object.keys(targetFeatures),
  ]) as AssessmentFeature[];

  return featureIds.map((feature) => {
    const sourceLevel = sourceFeatures[feature] ?? "unknown";
    const targetLevel = targetFeatures[feature] ?? "unknown";
    const delta = ordinalDelta(sourceLevel, targetLevel, demandValue);

    return {
      feature,
      source: sourceLevel,
      target: targetLevel,
      delta: delta.delta,
    };
  });
}

export function compareExerciseTransition(
  source: ExerciseDefinition,
  target: ExerciseDefinition,
): ExerciseTransitionStructuralDelta {
  const sourceSupport = support(source);
  const targetSupport = support(target);
  const sourceResistancePath = resistancePath(source);
  const targetResistancePath = resistancePath(target);
  const movementRoleDelta = setDelta(source.movementRoles, target.movementRoles);
  const muscleDelta = setDelta(muscleSet(source), muscleSet(target));

  return {
    sharedMovementRoles: movementRoleDelta.shared,
    sourceOnlyMovementRoles: movementRoleDelta.sourceOnly,
    targetOnlyMovementRoles: movementRoleDelta.targetOnly,
    sharedMuscles: muscleDelta.shared,
    sourceOnlyMuscles: muscleDelta.sourceOnly,
    targetOnlyMuscles: muscleDelta.targetOnly,
    support: {
      externalSupport: literalDelta(
        sourceSupport?.externalSupport ?? "unknown",
        targetSupport?.externalSupport ?? "unknown",
      ),
      bodySupport: literalDelta(
        sourceSupport?.bodySupport ?? "unknown",
        targetSupport?.bodySupport ?? "unknown",
      ),
    },
    resistancePath: {
      resistancePath: literalDelta(
        sourceResistancePath?.resistancePath ?? "unknown",
        targetResistancePath?.resistancePath ?? "unknown",
      ),
      trajectoryFreedom: ordinalDelta(
        sourceResistancePath?.trajectoryFreedom ?? "unknown",
        targetResistancePath?.trajectoryFreedom ?? "unknown",
        demandValue,
      ),
      lineOfPullAdjustability: ordinalDelta(
        sourceResistancePath?.lineOfPullAdjustability ?? "unknown",
        targetResistancePath?.lineOfPullAdjustability ?? "unknown",
        demandValue,
      ),
      laterality: literalDelta(
        sourceResistancePath?.laterality ?? "unknown",
        targetResistancePath?.laterality ?? "unknown",
      ),
      fitDependency: literalDelta(
        sourceResistancePath?.fitDependency ?? "unknown",
        targetResistancePath?.fitDependency ?? "unknown",
      ),
    },
    demand: {
      trunk: ordinalDelta(demandLevel(source, "trunk_control"), demandLevel(target, "trunk_control"), demandValue),
      stability: ordinalDelta(demandLevel(source, "stability"), demandLevel(target, "stability"), demandValue),
      coordination: ordinalDelta(demandLevel(source, "coordination"), demandLevel(target, "coordination"), demandValue),
    },
    loading: {
      loadability: ordinalDelta(source.loading.loadability, target.loading.loadability, loadabilityValue),
      loadingPotential: ordinalDelta(source.loading.loadingPotential, target.loading.loadingPotential, demandValue),
    },
    equipment: setDelta(equipmentLabels(source), equipmentLabels(target)),
    assessmentFeatures: scapularFeatureDelta(source, target),
  };
}

export function buildExerciseTransitionTrace(input: {
  readonly source: ExerciseDefinition;
  readonly target: ExerciseDefinition;
  readonly relationship: ExerciseTransitionRelationship;
}): ExerciseTransitionTrace {
  return {
    sourceExerciseId: input.source.id,
    targetExerciseId: input.relationship.targetExerciseId,
    direction: input.relationship.direction,
    classification: input.relationship.classification,
    purposes: input.relationship.purposes,
    reviewStatus: input.relationship.reviewStatus,
    notes: input.relationship.notes,
    provenance: input.relationship.provenance,
    structuralDelta: compareExerciseTransition(input.source, input.target),
    automaticSelectionEffect: "none",
  };
}

export function buildExerciseTransitionTraces(
  source: ExerciseDefinition,
  catalog: readonly ExerciseDefinition[],
): readonly ExerciseTransitionTrace[] {
  const byId = new Map(catalog.map((exercise) => [exercise.id, exercise]));

  return source.progression.transitionRelationships.flatMap((relationship) => {
    const target = byId.get(relationship.targetExerciseId);

    if (!target) {
      return [];
    }

    return [
      buildExerciseTransitionTrace({
        source,
        target,
        relationship,
      }),
    ];
  });
}
