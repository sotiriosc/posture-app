import type { AdaptationApplicationOwner } from "../adaptationPersistence/designContracts";
import type { ProductionLongitudinalActionOwner } from "../longitudinalAdaptation/policies/policyContracts";

export const PRODUCTION_TO_LEGACY_ADAPTATION_OWNER_PROJECTION = Object.freeze({
  prescription: "prescription",
  candidate_intelligence_and_composer: "candidate_composer",
  week: "week",
  phase_continuity: "phase_continuity",
  training_safety: "training_safety",
  product_application: "product_human",
  human_owner_review: "product_human",
} as const satisfies Readonly<Record<Exclude<ProductionLongitudinalActionOwner, "longitudinal_adaptation">,
  Exclude<AdaptationApplicationOwner, "unknown">>>);

export function projectProductionAdaptationOwnerToLegacy(
  owner: Exclude<ProductionLongitudinalActionOwner, "longitudinal_adaptation">,
): Exclude<AdaptationApplicationOwner, "unknown"> {
  return PRODUCTION_TO_LEGACY_ADAPTATION_OWNER_PROJECTION[owner];
}
