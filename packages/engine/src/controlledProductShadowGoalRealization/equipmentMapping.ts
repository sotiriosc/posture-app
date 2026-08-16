import { PRODUCT_EQUIPMENT_REALIZATION_SHADOW_MAPPING_REFERENCE,
  type ProductEquipmentCapabilityShadowMapping,
  type ProductEquipmentLoadRealizationShadowMapping } from "@praxis/training-engine-v2";
import type { ProductGoalRealizationFixtureExtensions } from "./contracts";

function strings(value: unknown): readonly string[] {
  return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string") : [];
}

const unknownsByLabel: Readonly<Record<string, readonly string[]>> = Object.freeze({
  none: Object.freeze(["floor_space", "wall", "support_surface", "pull_up_bar", "external_loading"]),
  dumbbells: Object.freeze(["pair_availability", "bench", "maximum_load", "load_increment", "fixed_or_adjustable"]),
  bands: Object.freeze(["band_type", "band_anchor", "anchor_stability", "resistance", "stretch_context"]),
  gym: Object.freeze(["machine_inventory", "cables", "racks", "barbells", "benches", "smith_machine",
    "load_increments", "loaded_gait", "support_surfaces"]),
});

export function mapProductEquipmentForRealization(input: {
  readonly questionnaire: Record<string, unknown> | null;
  readonly fixtureExtensions?: ProductGoalRealizationFixtureExtensions | null;
}): { readonly capability: ProductEquipmentCapabilityShadowMapping;
  readonly load: ProductEquipmentLoadRealizationShadowMapping } {
  const selectedLabels = [...new Set(strings(input.questionnaire?.equipment)
    .map((value) => value.trim().toLowerCase()).filter(Boolean))].sort();
  const recognized = selectedLabels.every((label) => Object.hasOwn(unknownsByLabel, label));
  const knownPresence = new Set<string>();
  for (const label of selectedLabels) {
    if (label === "none") knownPresence.add("bodyweight_context_no_external_equipment_selected");
    if (label === "dumbbells") knownPresence.add("dumbbell_presence");
    if (label === "bands") knownPresence.add("band_presence");
    if (label === "gym") knownPresence.add("commercial_gym_environment_label");
  }
  const details = input.fixtureExtensions?.equipmentDetails ?? [];
  const detailedLabels = new Set<string>(details.map((detail) => detail.productLabel));
  const explicitUnknowns = selectedLabels.flatMap((label) => detailedLabels.has(label) ? [] :
    (unknownsByLabel[label] ?? [`unknown_product_equipment:${label}`]));
  const capabilities = [...new Set(details.flatMap((detail) => detail.capabilities))].sort();
  const conflict = details.some((detail) => !selectedLabels.includes(detail.productLabel));
  const status = conflict ? "conflict" as const : !selectedLabels.length || !recognized ? "mapping_required" as const :
    explicitUnknowns.length ? "presence_only" as const : "exact_capability_available" as const;
  const capability = Object.freeze({ reference: PRODUCT_EQUIPMENT_REALIZATION_SHADOW_MAPPING_REFERENCE,
    selectedLabels: Object.freeze(selectedLabels), knownPresence: Object.freeze([...knownPresence].sort()),
    knownCapabilities: Object.freeze(capabilities), explicitUnknowns: Object.freeze([...new Set(explicitUnknowns)].sort()),
    exactCapabilitySource: details.length ? "versioned_test_or_replay_fixture" as const :
      selectedLabels.length ? "current_product" as const : "none" as const,
    status, universalGymCapabilityInferenceCount: 0, legacyProgramEquipmentInferenceCount: 0 });
  const completeLoad = details.length > 0 && details.every((detail) => detail.loadMinimum !== null &&
    detail.loadMaximum !== null && detail.loadIncrement !== null && detail.unit !== null);
  const baseLegalityKnown = status === "exact_capability_available";
  const load = Object.freeze({ reference: PRODUCT_EQUIPMENT_REALIZATION_SHADOW_MAPPING_REFERENCE,
    exactRealizationAvailable: completeLoad, selfSelectedCalibrationAvailable: baseLegalityKnown && !completeLoad,
    implementReferences: Object.freeze(details.map((detail) => detail.implementReference).sort()),
    loadMinimum: details.length === 1 ? details[0]!.loadMinimum : null,
    loadMaximum: details.length === 1 ? details[0]!.loadMaximum : null,
    loadIncrement: details.length === 1 ? details[0]!.loadIncrement : null,
    unit: details.length === 1 ? details[0]!.unit : null,
    exactUnknowns: Object.freeze(completeLoad ? [] : ["minimum_load", "maximum_load", "load_increment",
      "mechanism_or_resistance_realization"]), guessedLoadCount: 0, progressionAuthorityCount: 0 });
  return { capability, load };
}
