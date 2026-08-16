import { createControlledProductShadowComparisonV1_1,
  type ControlledProductShadowComparisonV1_1 } from "@praxis/training-engine-v2";
import type { ProductGoalRealizationComparisonBuilder } from "./contracts";

export const compareHistoricalV1WithGoalRealizationV1: ProductGoalRealizationComparisonBuilder = ({
  mappingBundle, pipelineResult, historicalMappingSummary,
}): ControlledProductShadowComparisonV1_1 => {
  const dimensions: Parameters<typeof createControlledProductShadowComparisonV1_1>[0]["dimensions"] = [
    { dimension: "product_source_contract", state: "same", reasonCodes: [] },
    { dimension: "primary_goal", state: historicalMappingSummary.primaryGoal ===
      mappingBundle.goalMapping.primaryOutcome ? "same" : mappingBundle.goalMapping.primaryOutcome ?
        "different" : "unresolved", reasonCodes: mappingBundle.goalMapping.followUpRequirements },
    { dimension: "secondary_goal", state: mappingBundle.goalMapping.secondaryOutcome ? "different" : "same",
      reasonCodes: mappingBundle.goalMapping.secondaryOutcome ? ["VERSIONED_SECONDARY_GOAL_FIXTURE_PRESENT"] :
        ["PRODUCT_SECONDARY_GOAL_NOT_CAPTURED"] },
    { dimension: "programming_context", state: mappingBundle.goalMapping.programmingContexts.length ?
      "different" : "same", reasonCodes: [] },
    { dimension: "training_mode", state: historicalMappingSummary.trainingIntentStatus ===
      mappingBundle.trainingModeMapping.status ? "same" : "different",
      reasonCodes: mappingBundle.trainingModeMapping.reasonCodes },
    { dimension: "planning_brief", state: mappingBundle.planningBrief ? "different" : "unresolved",
      reasonCodes: mappingBundle.planningBrief ? [] : mappingBundle.unresolvedRequirements },
    { dimension: "experience_familiarity", state: "different",
      reasonCodes: ["COARSE_EXPERIENCE_SEPARATED_FROM_EXACT_FAMILIARITY"] },
    { dimension: "equipment", state: historicalMappingSummary.equipmentStatus ===
      mappingBundle.equipmentCapabilityMapping.status ? "same" :
        mappingBundle.equipmentCapabilityMapping.status === "exact_capability_available" ? "different" : "unresolved",
      reasonCodes: mappingBundle.equipmentCapabilityMapping.explicitUnknowns },
    { dimension: "availability", state: mappingBundle.availabilityMapping.status ===
      "ordered_opportunities_with_minutes" ? "different" : "unresolved",
      reasonCodes: mappingBundle.availabilityMapping.status === "ordered_opportunities_with_minutes" ? [] :
        ["PRODUCT_SESSION_MINUTES_REQUIRED"] },
    { dimension: "exercise_identity", state: mappingBundle.exerciseIdentityMapping.entries.some((entry) =>
      !entry.v2ExerciseId) ? "unresolved" : "same", reasonCodes: mappingBundle.exerciseIdentityMapping.entries
        .filter((entry) => !entry.v2ExerciseId)
        .map((entry) => `PRODUCT_EXERCISE_IDENTITY_MAPPING_REQUIRED:${entry.productExerciseId}`) },
    { dimension: "weekly_responsibility", state: pipelineResult.status.startsWith("shadow_program_complete") ?
      "different" : "not_comparable", reasonCodes: pipelineResult.unresolvedRequirements },
    { dimension: "session_purpose_needs", state: pipelineResult.completedStages.includes("session_intent") ?
      "different" : "not_comparable", reasonCodes: [] },
    { dimension: "assignment", state: pipelineResult.completedStages.includes("session_composer") ?
      "different" : "not_comparable", reasonCodes: [] },
    { dimension: "prescription_realization", state: pipelineResult.completedStages.includes("prescription") ?
      "different" : "not_comparable", reasonCodes: [] },
    { dimension: "sequence_duration", state: pipelineResult.completedStages.includes("final_sequence") ?
      "different" : "not_comparable", reasonCodes: [] },
    { dimension: "gate_13", state: pipelineResult.gate13Status === "passed" ? "different" : "not_comparable",
      reasonCodes: [] },
    { dimension: "labels_prose", state: "same", reasonCodes: [] },
  ];
  return createControlledProductShadowComparisonV1_1({ mappingFingerprint: mappingBundle.mappingFingerprint,
    dimensions, unresolvedRequirements: mappingBundle.unresolvedRequirements,
    legacyProgramStructuralComparison: historicalMappingSummary.legacyProgramAvailable ? "partial" : "unavailable" });
};
