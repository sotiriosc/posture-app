import { PRODUCT_TRAINING_MODE_SHADOW_MAPPING_V2_REFERENCE,
  type ProductTrainingModeShadowMappingV2 } from "@praxis/training-engine-v2";

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function mapProductTrainingModeV2(
  questionnaire: Record<string, unknown> | null,
): ProductTrainingModeShadowMappingV2 {
  const sourceIntent = text(questionnaire?.trainingIntent);
  if (sourceIntent === "build") return Object.freeze({
    reference: PRODUCT_TRAINING_MODE_SHADOW_MAPPING_V2_REFERENCE, sourceIntent, mode: "develop",
    programmingContexts: Object.freeze([]), status: "mapped", reasonCodes: Object.freeze([]),
    diagnosticInferenceCount: 0,
  });
  if (sourceIntent === "maintain") return Object.freeze({
    reference: PRODUCT_TRAINING_MODE_SHADOW_MAPPING_V2_REFERENCE, sourceIntent, mode: "maintain",
    programmingContexts: Object.freeze([]), status: "policy_required",
    reasonCodes: Object.freeze(["MAINTENANCE_WEEK_AND_LONGITUDINAL_POLICY_REQUIRED"]),
    diagnosticInferenceCount: 0,
  });
  if (sourceIntent === "rehab") return Object.freeze({
    reference: PRODUCT_TRAINING_MODE_SHADOW_MAPPING_V2_REFERENCE, sourceIntent, mode: "return_or_rebuild",
    programmingContexts: Object.freeze(["pain_aware_return"] as const), status: "mapped",
    reasonCodes: Object.freeze(["RETURN_OR_REBUILD_REQUIRED_FACTS_REMAIN_EXPLICIT"]),
    diagnosticInferenceCount: 0,
  });
  return Object.freeze({ reference: PRODUCT_TRAINING_MODE_SHADOW_MAPPING_V2_REFERENCE,
    sourceIntent, mode: null, programmingContexts: Object.freeze([]), status: "mapping_required",
    reasonCodes: Object.freeze(["PRODUCT_TRAINING_MODE_MAPPING_REQUIRED"]), diagnosticInferenceCount: 0 });
}
