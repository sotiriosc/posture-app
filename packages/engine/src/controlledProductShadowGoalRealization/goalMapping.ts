import {
  PRODUCT_GOAL_ARCHITECTURE_SHADOW_MAPPING_V2_REFERENCE,
  TRAINING_OUTCOME_GOALS,
  type ProductGoalShadowMappingV2,
  type ProductShadowOutcomeGoal,
} from "@praxis/training-engine-v2";
import type { ProductGoalRealizationFixtureExtensions } from "./contracts";

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

const futureLabels = new Set(["Get stronger", "Build muscle", "Improve fitness and stamina",
  "Improve posture and movement", "Improve athletic performance"]);

export function mapProductGoalForGoalRealizationProfile(input: {
  readonly questionnaire: Record<string, unknown> | null;
  readonly fixtureExtensions?: ProductGoalRealizationFixtureExtensions | null;
}): ProductGoalShadowMappingV2 {
  const sourceLabel = text(input.questionnaire?.goals);
  const requestedSecondary = input.fixtureExtensions?.secondaryOutcome ?? null;
  const secondary = requestedSecondary && TRAINING_OUTCOME_GOALS.includes(requestedSecondary as never) ?
    requestedSecondary : null;
  const sourceVocabulary = sourceLabel && futureLabels.has(sourceLabel) ? "approved_future_fixture" as const :
    ["Improve posture", "Reduce pain", "Athletic performance", "General fitness"].includes(sourceLabel ?? "") ?
      "current_product" as const : "unknown" as const;
  let primary: ProductShadowOutcomeGoal | null = null;
  let family: ProductGoalShadowMappingV2["planningBriefFamily"] = null;
  let status: ProductGoalShadowMappingV2["status"] = "mapping_required";
  const contexts: ProductGoalShadowMappingV2["programmingContexts"][number][] = [];
  const followUp: string[] = [];
  const unsupported: string[] = [];

  if (sourceLabel === "Get stronger") {
    primary = "strength";
    family = "strength_development";
    status = "mapped";
  } else if (sourceLabel === "Build muscle") {
    primary = "hypertrophy";
    family = "hypertrophy_development";
    status = "mapped";
    unsupported.push("BODY_COMPOSITION_AND_NUTRITION_OUTSIDE_MAPPING_SCOPE");
  } else if (sourceLabel === "Improve posture" || sourceLabel === "Improve posture and movement") {
    primary = "posture_and_movement_quality";
    family = "movement_quality_development";
    status = "mapped";
    unsupported.push("NO_CLINICAL_CORRECTION_OR_PAIN_REDUCTION_CLAIM");
  } else if (sourceLabel === "Reduce pain") {
    contexts.push("pain_aware_return");
    status = "follow_up_required";
    followUp.push("PRODUCT_PRIMARY_OUTCOME_GOAL_REQUIRED");
  } else if (sourceLabel === "General fitness") {
    primary = "general_fitness";
    family = "general_fitness";
    status = input.fixtureExtensions?.purposeBundle ? "mapped" : "follow_up_required";
    if (!input.fixtureExtensions?.purposeBundle) followUp.push("GENERAL_FITNESS_PURPOSE_BUNDLE_REQUIRED");
  } else if (sourceLabel === "Improve fitness and stamina") {
    primary = "general_fitness";
    family = "general_fitness";
    const focus = input.fixtureExtensions?.fitnessFocus;
    status = focus && focus !== "systemic_conditioning" && input.fixtureExtensions?.purposeBundle ?
      "mapped" : "follow_up_required";
    if (!focus) followUp.push("FITNESS_AND_STAMINA_FOCUS_REQUIRED");
    if (focus === "systemic_conditioning") followUp.push("SYSTEMIC_CONDITIONING_POLICY_REQUIRED");
    if (focus && !input.fixtureExtensions?.purposeBundle) followUp.push("GENERAL_FITNESS_PURPOSE_BUNDLE_REQUIRED");
  } else if (sourceLabel === "Athletic performance" || sourceLabel === "Improve athletic performance") {
    status = "follow_up_required";
    followUp.push("ATHLETIC_PERFORMANCE_FOLLOW_UP_REQUIRED");
  } else {
    followUp.push("PRODUCT_OUTCOME_GOAL_MAPPING_REQUIRED");
  }

  if (primary && secondary === primary) {
    status = "conflict";
    followUp.push("PRODUCT_SECONDARY_GOAL_DUPLICATES_PRIMARY");
  }
  if (requestedSecondary && !secondary) {
    status = "conflict";
    followUp.push("PRODUCT_SECONDARY_GOAL_UNSUPPORTED");
  }
  if (!input.fixtureExtensions) followUp.push("PRODUCT_SECONDARY_GOAL_NOT_CAPTURED");

  return Object.freeze({ reference: PRODUCT_GOAL_ARCHITECTURE_SHADOW_MAPPING_V2_REFERENCE,
    sourceLabel, sourceVocabulary, primaryOutcome: primary, secondaryOutcome: secondary,
    goalRelationships: Object.freeze(primary ? ["primary" as const, ...(secondary ? ["secondary" as const] : [])] : []),
    programmingContexts: Object.freeze(contexts), planningBriefFamily: family, status,
    followUpRequirements: Object.freeze([...new Set(followUp)].sort()),
    unsupportedScope: Object.freeze(unsupported.sort()), goalCreatesExercises: false,
    goalCreatesNumericDose: false });
}
