import { PRODUCT_SHADOW_MAPPING_READINESS_STATES, type ProductShadowMappingReadiness,
  type ProductShadowMappingReadinessState, type ProductShadowMappingReadinessTraceEntry } from "./contracts";

const READINESS_PRIORITY: Readonly<Record<ProductShadowMappingReadinessState, number>> = Object.freeze({
  mapping_conflict: 1,
  primary_outcome_follow_up_required: 3,
  purpose_bundle_follow_up_required: 7,
  training_mode_policy_required: 6,
  experience_context_incomplete: 8,
  legacy_history_restricted: 9,
  equipment_capability_incomplete: 10,
  equipment_realization_incomplete: 11,
  availability_incomplete: 12,
  exercise_mapping_incomplete: 14,
  unsupported_scope: 15,
  complete_with_self_selected_calibration: 16,
  complete_for_shadow_planning: 17,
});

export function createProductShadowMappingReadiness(
  trace: readonly ProductShadowMappingReadinessTraceEntry[],
): ProductShadowMappingReadiness {
  for (const entry of trace) {
    if (!PRODUCT_SHADOW_MAPPING_READINESS_STATES.includes(entry.state)) {
      throw new Error("PRODUCT_SHADOW_MAPPING_READINESS_STATE_INVALID");
    }
  }
  const material = trace.filter((entry) => entry.material).sort((left, right) =>
    left.order - right.order || READINESS_PRIORITY[left.state] - READINESS_PRIORITY[right.state]);
  const primaryState = material[0]?.state ?? (trace.some((entry) =>
    entry.state === "complete_with_self_selected_calibration") ?
      "complete_with_self_selected_calibration" : "complete_for_shadow_planning");
  const unresolvedRequirements = [...new Set(material.flatMap((entry) => entry.reasonCodes))].sort();
  return Object.freeze({ primaryState, trace: Object.freeze([...trace].sort((left, right) => left.order - right.order)),
    unresolvedRequirements: Object.freeze(unresolvedRequirements), downstreamRescueAcceptedCount: 0 });
}
