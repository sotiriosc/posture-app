import { CONTROLLED_PRODUCT_SHADOW_COMPARISON_V1_1_REFERENCE,
  CONTROLLED_PRODUCT_SHADOW_RUN_V1_1_REFERENCE,
  PRODUCT_GOAL_REALIZATION_MAPPING_BUNDLE_REFERENCE,
  PRODUCT_SHADOW_MAPPING_READINESS_STATES,
  type ControlledProductShadowGoalRealizationMappingBundleV1,
  type ControlledProductShadowRunV1_1 } from "./contracts";

export function validateProductShadowGoalRealizationMappingBundle(
  bundle: ControlledProductShadowGoalRealizationMappingBundleV1,
): readonly string[] {
  const reasons: string[] = [];
  if (bundle.bundleReference.contractId !== PRODUCT_GOAL_REALIZATION_MAPPING_BUNDLE_REFERENCE.contractId ||
      bundle.bundleReference.contractVersion !== PRODUCT_GOAL_REALIZATION_MAPPING_BUNDLE_REFERENCE.contractVersion) {
    reasons.push("PRODUCT_GOAL_REALIZATION_MAPPING_BUNDLE_VERSION_UNSUPPORTED");
  }
  if (!PRODUCT_SHADOW_MAPPING_READINESS_STATES.includes(bundle.readiness.primaryState)) {
    reasons.push("PRODUCT_SHADOW_MAPPING_READINESS_INVALID");
  }
  if (bundle.planningBrief && (bundle.planningBrief.exerciseCreationCount !== 0 ||
      bundle.planningBrief.numericDoseCreationCount !== 0 || bundle.planningBrief.applied)) {
    reasons.push("PRODUCT_GOAL_MAPPER_CREATED_EXERCISE_DOSE_OR_APPLIED_STATE");
  }
  if (!bundle.counterfactualOnly || bundle.rawProductPayloadIncluded) {
    reasons.push("PRODUCT_SHADOW_MAPPING_COUNTERFACTUAL_OR_MINIMIZATION_INVALID");
  }
  if (!bundle.mappingFingerprint || bundle.provenance.length === 0) {
    reasons.push("PRODUCT_SHADOW_MAPPING_LINEAGE_REQUIRED");
  }
  return Object.freeze([...new Set(reasons)].sort());
}

export function validateControlledProductShadowRunV1_1(
  run: ControlledProductShadowRunV1_1,
): readonly string[] {
  const reasons: string[] = [];
  if (run.runReference.contractId !== CONTROLLED_PRODUCT_SHADOW_RUN_V1_1_REFERENCE.contractId ||
      run.runReference.contractVersion !== CONTROLLED_PRODUCT_SHADOW_RUN_V1_1_REFERENCE.contractVersion) {
    reasons.push("CONTROLLED_PRODUCT_SHADOW_RUN_V1_1_REQUIRED");
  }
  if (run.comparison && (run.comparison.comparisonReference.contractId !==
      CONTROLLED_PRODUCT_SHADOW_COMPARISON_V1_1_REFERENCE.contractId ||
      run.comparison.comparisonReference.contractVersion !==
      CONTROLLED_PRODUCT_SHADOW_COMPARISON_V1_1_REFERENCE.contractVersion)) {
    reasons.push("CONTROLLED_PRODUCT_SHADOW_COMPARISON_V1_1_REQUIRED");
  }
  if (!run.counterfactualOnly || run.deliveredToUser || run.performed || run.productMutationApplied ||
      run.applicationApplied) reasons.push("CONTROLLED_PRODUCT_SHADOW_RUN_APPLIED_OR_PERFORMED_REJECTED");
  if (!run.mappingProfileReference.contractVersion || !run.pipelineProfileReference.contractVersion ||
      !run.sourceSnapshotRevision || !run.sourceTriggerRevisionId || !run.productStateRevision ||
      !run.evaluationTime || !["consumer", "gyms"].includes(run.appSurface)) {
    reasons.push("CONTROLLED_PRODUCT_SHADOW_RUN_V1_1_EXACT_LINEAGE_REQUIRED");
  }
  reasons.push(...validateProductShadowGoalRealizationMappingBundle(run.mappingBundle));
  return Object.freeze([...new Set(reasons)].sort());
}
