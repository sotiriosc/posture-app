import {
  PRESCRIPTION_LOCAL_PURPOSES,
  PRODUCT_GOAL_TO_PLANNING_BRIEF_SHADOW_POLICY_V1_REFERENCE,
  type ProductGoalArchitectureShadowPlanningBrief,
  type ProductGoalShadowMappingV2,
  type ProductTrainingModeShadowMappingV2,
  type PrescriptionLocalPurpose,
} from "@praxis/training-engine-v2";
import type { ProductGoalRealizationFixtureExtensions } from "./contracts";

function purposes(values: readonly string[]): readonly PrescriptionLocalPurpose[] | null {
  if (values.some((value) => !PRESCRIPTION_LOCAL_PURPOSES.includes(value as PrescriptionLocalPurpose))) return null;
  return Object.freeze([...new Set(values as readonly PrescriptionLocalPurpose[])].sort());
}

export function createProductGoalArchitectureShadowPlanningBrief(input: {
  readonly goal: ProductGoalShadowMappingV2;
  readonly trainingMode: ProductTrainingModeShadowMappingV2;
  readonly fixtureExtensions?: ProductGoalRealizationFixtureExtensions | null;
}): ProductGoalArchitectureShadowPlanningBrief | null {
  if (input.goal.status !== "mapped" || !input.goal.primaryOutcome || !input.trainingMode.mode ||
      input.trainingMode.status === "mapping_required") return null;

  let required: readonly PrescriptionLocalPurpose[] = Object.freeze([]);
  let preferred: readonly PrescriptionLocalPurpose[] = Object.freeze([]);
  let optional: readonly PrescriptionLocalPurpose[] = Object.freeze([]);
  if (input.goal.planningBriefFamily === "strength_development") {
    required = Object.freeze(["strength_development"]);
  } else if (input.goal.planningBriefFamily === "hypertrophy_development") {
    required = Object.freeze(["hypertrophy_development"]);
  } else if (input.goal.planningBriefFamily === "movement_quality_development") {
    required = Object.freeze(["movement_quality_development"]);
  } else if (input.goal.planningBriefFamily === "general_fitness") {
    const bundle = input.fixtureExtensions?.purposeBundle;
    const parsedRequired = purposes(bundle?.required ?? []);
    const parsedPreferred = purposes(bundle?.preferred ?? []);
    const parsedOptional = purposes(bundle?.optional ?? []);
    if (!bundle || !parsedRequired || !parsedPreferred || !parsedOptional || parsedRequired.length === 0) return null;
    required = parsedRequired;
    preferred = parsedPreferred;
    optional = parsedOptional;
  }

  const contexts = Object.freeze([...new Set([
    ...input.goal.programmingContexts,
    ...input.trainingMode.programmingContexts,
  ])].sort());
  const relationships = Object.freeze([
    Object.freeze({ outcome: input.goal.primaryOutcome, relationship: "primary" as const }),
    ...(input.goal.secondaryOutcome ? [Object.freeze({ outcome: input.goal.secondaryOutcome,
      relationship: "secondary" as const })] : []),
  ]);
  return Object.freeze({ policyReference: PRODUCT_GOAL_TO_PLANNING_BRIEF_SHADOW_POLICY_V1_REFERENCE,
    sourceProductLabel: input.goal.sourceLabel, primaryOutcome: input.goal.primaryOutcome,
    secondaryOutcome: input.goal.secondaryOutcome, goalRelationships: relationships,
    programmingContexts: contexts, trainingMode: input.trainingMode.mode,
    requiredPurposeFamilies: required, preferredPurposeFamilies: preferred, optionalPurposeFamilies: optional,
    followUpRequirements: Object.freeze([...new Set([
      ...input.goal.followUpRequirements.filter((entry) => entry !== "PRODUCT_SECONDARY_GOAL_NOT_CAPTURED"),
      ...input.trainingMode.reasonCodes,
    ])].sort()), unsupportedScope: input.goal.unsupportedScope,
    sourceFacts: Object.freeze([`product-goal:${input.goal.sourceLabel}`,
      `product-training-intent:${input.trainingMode.sourceIntent}`]),
    provenance: Object.freeze(["product-goal-mapping-policy:owner-authored-planning-brief",
      "week-planner:exact-objective-owner"]), exerciseCreationCount: 0, numericDoseCreationCount: 0,
    applied: false });
}
