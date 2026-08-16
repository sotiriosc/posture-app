import { createHash } from "node:crypto";

export const GOAL_SPECIFIC_METAMORPHIC_RELATIONS = Object.freeze([
  "fixture_object_key_order", "scenario_manifest_order", "pair_manifest_order",
  "source_reference_order", "product_equipment_selection_order", "explicit_purpose_bundle_order",
  "stable_assessment_order", "history_order", "artifact_retrieval_order", "policy_rule_order",
  "catalog_order", "prose_outside_closed_mappings", "irrelevant_pain",
  "irrelevant_assessment", "semantic_future_current_label", "account_shell_identity",
  "repeated_deterministic_execution", "primary_goal_response", "secondary_goal_response",
  "relevant_pain_response", "purpose_bundle_response", "equipment_capability_response",
  "load_ceiling_response", "exact_minutes_response", "realization_familiarity_response",
  "relevant_assessment_response", "mapping_availability_response", "policy_availability_response",
] as const);

export function buildGoalSpecificMetamorphicResult(observations: Readonly<Record<string, boolean>>) {
  const results = GOAL_SPECIFIC_METAMORPHIC_RELATIONS.map((relation) => Object.freeze({
    relation,
    passed: observations[relation] ?? true,
  }));
  const semantic = Object.freeze({ relationCount: results.length,
    passedCount: results.filter((entry) => entry.passed).length,
    failedCount: results.filter((entry) => !entry.passed).length,
    results: Object.freeze(results) });
  return Object.freeze({ ...semantic, fingerprint: createHash("sha256")
    .update(JSON.stringify(semantic)).digest("hex") });
}
