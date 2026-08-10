import type { AssessmentFeature } from "./domain/assessment";
import type {
  ExerciseDefinition,
  ExerciseDemandAnnotationLevel,
  ExerciseTransitionPurpose,
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

export type TransitionPurposeEvidenceStatus =
  | "structurally_confirmed"
  | "contextual_intent"
  | "unknown_metadata"
  | "contradicted";

export interface TransitionPurposeEvidenceTrace {
  readonly purpose: ExerciseTransitionPurpose;
  readonly status: TransitionPurposeEvidenceStatus;
  readonly evidence: string;
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
  readonly purposeEvidence: readonly TransitionPurposeEvidenceTrace[];
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

function valueDeltaEvidence(label: string, delta: TransitionValueDelta): string {
  return `${label}: ${delta.source} -> ${delta.target} (${delta.delta})`;
}

function categoricalDeltaEvidence(label: string, delta: TransitionValueDelta): string {
  return `${label}: ${delta.source} -> ${delta.target}`;
}

function directionalPurposeEvidence(input: {
  readonly purpose: ExerciseTransitionPurpose;
  readonly label: string;
  readonly delta: TransitionValueDelta;
  readonly expected: "increase" | "decrease";
}): TransitionPurposeEvidenceTrace {
  const metadataUnknown = input.delta.source === "unknown" || input.delta.target === "unknown";

  if (metadataUnknown) {
    return {
      purpose: input.purpose,
      status: "unknown_metadata",
      evidence: `${valueDeltaEvidence(input.label, input.delta)}; source and/or target metadata is unknown`,
    };
  }

  return {
    purpose: input.purpose,
    status:
      input.delta.delta === input.expected ? "structurally_confirmed" : "contradicted",
    evidence: `${valueDeltaEvidence(input.label, input.delta)}; expected ${input.expected}`,
  };
}

function resistancePathPurposeEvidence(
  purpose: ExerciseTransitionPurpose,
  delta: TransitionResistancePathDelta,
): TransitionPurposeEvidenceTrace {
  const entries = [
    ["path", delta.resistancePath],
    ["trajectory", delta.trajectoryFreedom],
    ["line", delta.lineOfPullAdjustability],
    ["laterality", delta.laterality],
    ["fit", delta.fitDependency],
  ] as const;
  const knownChanges = entries.filter(
    ([, value]) =>
      value.source !== "unknown" &&
      value.target !== "unknown" &&
      value.source !== value.target,
  );

  if (knownChanges.length > 0) {
    return {
      purpose,
      status: "structurally_confirmed",
      evidence: knownChanges.map(([label, value]) => categoricalDeltaEvidence(label, value)).join("; "),
    };
  }

  const hasUnknownMetadata = entries.some(
    ([, value]) => value.source === "unknown" || value.target === "unknown",
  );

  return {
    purpose,
    status: hasUnknownMetadata ? "unknown_metadata" : "contradicted",
    evidence: hasUnknownMetadata
      ? "source and/or target resistance-path profile is not modeled"
      : `all modeled resistance-path fields are unchanged: ${entries
          .map(([label, value]) => categoricalDeltaEvidence(label, value))
          .join("; ")}`,
  };
}

function equipmentPurposeEvidence(
  purpose: ExerciseTransitionPurpose,
  delta: TransitionSetDelta,
): TransitionPurposeEvidenceTrace {
  const changed = delta.sourceOnly.length > 0 || delta.targetOnly.length > 0;

  return {
    purpose,
    status: changed ? "structurally_confirmed" : "contradicted",
    evidence: `equipment: sourceOnly=[${delta.sourceOnly.join(", ") || "none"}]; targetOnly=[${delta.targetOnly.join(", ") || "none"}]`,
  };
}

function featurePurposeEvidence(
  purpose: ExerciseTransitionPurpose,
  features: readonly TransitionScapularFeatureDelta[],
): TransitionPurposeEvidenceTrace {
  const knownChanges = features.filter(
    (feature) =>
      feature.source !== "unknown" &&
      feature.target !== "unknown" &&
      feature.source !== feature.target,
  );

  if (knownChanges.length > 0) {
    return {
      purpose,
      status: "structurally_confirmed",
      evidence: knownChanges
        .map((feature) => `${feature.feature}: ${feature.source} -> ${feature.target}`)
        .join("; "),
    };
  }

  const hasUnknownMetadata =
    features.length === 0 ||
    features.some((feature) => feature.source === "unknown" || feature.target === "unknown");

  return {
    purpose,
    status: hasUnknownMetadata ? "unknown_metadata" : "contradicted",
    evidence: hasUnknownMetadata
      ? "source and/or target assessment-feature mechanics are not modeled"
      : "all modeled assessment-feature levels are unchanged",
  };
}

function contextualRelationshipEvidence(
  relationship: ExerciseTransitionRelationship,
  structuredEvidence: string,
): string {
  return `${structuredEvidence}; contextual intent; transition note retained; review=${relationship.reviewStatus}; provenance=[${relationship.provenance.join(", ") || "none"}]`;
}

function movementRoleEvidence(delta: ExerciseTransitionStructuralDelta): string {
  const source = unique([...delta.sharedMovementRoles, ...delta.sourceOnlyMovementRoles]);
  const target = unique([...delta.sharedMovementRoles, ...delta.targetOnlyMovementRoles]);

  return `movement roles: source=[${source.join(", ") || "none"}] -> target=[${target.join(", ") || "none"}]`;
}

function supportEvidence(delta: ExerciseTransitionStructuralDelta): string {
  return [
    categoricalDeltaEvidence("external support", delta.support.externalSupport),
    categoricalDeltaEvidence("body support", delta.support.bodySupport),
  ].join("; ");
}

function contextualPurposeEvidence(input: {
  readonly purpose: ExerciseTransitionPurpose;
  readonly relationship: ExerciseTransitionRelationship;
  readonly delta: ExerciseTransitionStructuralDelta;
}): TransitionPurposeEvidenceTrace {
  let structuredEvidence: string;

  switch (input.purpose) {
    case "increase_support":
    case "reduce_support":
      structuredEvidence = supportEvidence(input.delta);
      break;
    case "movement_pattern_development":
      structuredEvidence = movementRoleEvidence(input.delta);
      break;
    case "preparation_to_loaded_training":
      structuredEvidence = valueDeltaEvidence("loadability", input.delta.loading.loadability);
      break;
    case "stimulus_shift":
      structuredEvidence = `${movementRoleEvidence(input.delta)}; muscles: sourceOnly=[${input.delta.sourceOnlyMuscles.join(", ") || "none"}]; targetOnly=[${input.delta.targetOnlyMuscles.join(", ") || "none"}]; ${valueDeltaEvidence("loadability", input.delta.loading.loadability)}`;
      break;
    case "pain_or_tolerance_regression":
      structuredEvidence = `${supportEvidence(input.delta)}; ${valueDeltaEvidence("trunk demand", input.delta.demand.trunk)}; ${valueDeltaEvidence("stability demand", input.delta.demand.stability)}`;
      break;
    default:
      throw new Error(`Purpose ${input.purpose} is not contextual.`);
  }

  return {
    purpose: input.purpose,
    status: "contextual_intent",
    evidence: contextualRelationshipEvidence(input.relationship, structuredEvidence),
  };
}

export function buildTransitionPurposeEvidenceTraces(input: {
  readonly relationship: ExerciseTransitionRelationship;
  readonly structuralDelta: ExerciseTransitionStructuralDelta;
}): readonly TransitionPurposeEvidenceTrace[] {
  return input.relationship.purposes.map((purpose) => {
    switch (purpose) {
      case "increase_loadability":
        return directionalPurposeEvidence({
          purpose,
          label: "loadability",
          delta: input.structuralDelta.loading.loadability,
          expected: "increase",
        });
      case "reduce_loadability":
        return directionalPurposeEvidence({
          purpose,
          label: "loadability",
          delta: input.structuralDelta.loading.loadability,
          expected: "decrease",
        });
      case "increase_stability_demand":
        return directionalPurposeEvidence({
          purpose,
          label: "stability demand",
          delta: input.structuralDelta.demand.stability,
          expected: "increase",
        });
      case "reduce_stability_demand":
        return directionalPurposeEvidence({
          purpose,
          label: "stability demand",
          delta: input.structuralDelta.demand.stability,
          expected: "decrease",
        });
      case "increase_coordination_demand":
        return directionalPurposeEvidence({
          purpose,
          label: "coordination demand",
          delta: input.structuralDelta.demand.coordination,
          expected: "increase",
        });
      case "reduce_coordination_demand":
        return directionalPurposeEvidence({
          purpose,
          label: "coordination demand",
          delta: input.structuralDelta.demand.coordination,
          expected: "decrease",
        });
      case "change_resistance_path":
        return resistancePathPurposeEvidence(purpose, input.structuralDelta.resistancePath);
      case "equipment_transition":
        return equipmentPurposeEvidence(purpose, input.structuralDelta.equipment);
      case "feature_shift":
        return featurePurposeEvidence(purpose, input.structuralDelta.assessmentFeatures);
      case "increase_support":
      case "reduce_support":
      case "movement_pattern_development":
      case "preparation_to_loaded_training":
      case "stimulus_shift":
      case "pain_or_tolerance_regression":
        return contextualPurposeEvidence({
          purpose,
          relationship: input.relationship,
          delta: input.structuralDelta,
        });
    }
  });
}

export function buildExerciseTransitionTrace(input: {
  readonly source: ExerciseDefinition;
  readonly target: ExerciseDefinition;
  readonly relationship: ExerciseTransitionRelationship;
}): ExerciseTransitionTrace {
  const structuralDelta = compareExerciseTransition(input.source, input.target);

  return {
    sourceExerciseId: input.source.id,
    targetExerciseId: input.relationship.targetExerciseId,
    direction: input.relationship.direction,
    classification: input.relationship.classification,
    purposes: input.relationship.purposes,
    reviewStatus: input.relationship.reviewStatus,
    notes: input.relationship.notes,
    provenance: input.relationship.provenance,
    structuralDelta,
    purposeEvidence: buildTransitionPurposeEvidenceTraces({
      relationship: input.relationship,
      structuralDelta,
    }),
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
