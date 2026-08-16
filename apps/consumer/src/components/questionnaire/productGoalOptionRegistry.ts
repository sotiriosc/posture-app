import {
  GET_STRONGER_OPTION_ID,
  ONE_INACTIVE_PRODUCT_GOAL_OPTION_CONTRACT,
  PRODUCT_GOAL_OPTION_REGISTRY_CONTRACT,
} from "./inactiveProductGoalContracts";

export type InactiveProductGoalOption = {
  contract: typeof ONE_INACTIVE_PRODUCT_GOAL_OPTION_CONTRACT;
  id: typeof GET_STRONGER_OPTION_ID;
  displayLabel: "Get stronger";
  canonicalOutcome: "strength";
  availability: "future_inactive_internal";
  requiredFollowUp: readonly [];
  submissionBehavior: "preview_only_fail_closed";
  ordinaryConsumerVisible: false;
  ordinaryGymsVisible: false;
  buyerDemoVisible: false;
  persistenceAllowed: false;
  legacyGenerationAllowed: false;
  productShadowAllowed: false;
  v2OutputAllowed: false;
};

export type ProductGoalOptionRegistry = {
  contract: typeof PRODUCT_GOAL_OPTION_REGISTRY_CONTRACT;
  options: readonly InactiveProductGoalOption[];
};

export type ProductGoalOptionRegistryValidation = {
  valid: boolean;
  errors: readonly string[];
};

export const GET_STRONGER_INACTIVE_OPTION: InactiveProductGoalOption =
  Object.freeze({
    contract: ONE_INACTIVE_PRODUCT_GOAL_OPTION_CONTRACT,
    id: GET_STRONGER_OPTION_ID,
    displayLabel: "Get stronger",
    canonicalOutcome: "strength",
    availability: "future_inactive_internal",
    requiredFollowUp: Object.freeze([]) as readonly [],
    submissionBehavior: "preview_only_fail_closed",
    ordinaryConsumerVisible: false,
    ordinaryGymsVisible: false,
    buyerDemoVisible: false,
    persistenceAllowed: false,
    legacyGenerationAllowed: false,
    productShadowAllowed: false,
    v2OutputAllowed: false,
  });

export const PRODUCT_GOAL_OPTION_REGISTRY: ProductGoalOptionRegistry =
  Object.freeze({
    contract: PRODUCT_GOAL_OPTION_REGISTRY_CONTRACT,
    options: Object.freeze([GET_STRONGER_INACTIVE_OPTION]),
  });

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function validateProductGoalOptionRegistry(
  value: unknown
): ProductGoalOptionRegistryValidation {
  const errors: string[] = [];
  if (!isRecord(value)) return { valid: false, errors: ["registry_not_object"] };

  if (value.contract !== PRODUCT_GOAL_OPTION_REGISTRY_CONTRACT) {
    errors.push("unsupported_registry_contract");
  }
  if (!Array.isArray(value.options)) {
    return { valid: false, errors: [...errors, "options_not_array"] };
  }

  const ids = new Set<string>();
  const labels = new Set<string>();
  for (const candidate of value.options) {
    if (!isRecord(candidate)) {
      errors.push("option_not_object");
      continue;
    }

    if (candidate.contract !== ONE_INACTIVE_PRODUCT_GOAL_OPTION_CONTRACT) {
      errors.push("unsupported_option_contract");
    }
    if (candidate.id !== GET_STRONGER_OPTION_ID) errors.push("unsupported_option_id");
    if (candidate.displayLabel !== "Get stronger") errors.push("wrong_display_label");
    if (candidate.canonicalOutcome !== "strength") errors.push("wrong_canonical_outcome");
    if (candidate.availability !== "future_inactive_internal") {
      errors.push("option_not_inactive");
    }
    if (!Array.isArray(candidate.requiredFollowUp) || candidate.requiredFollowUp.length !== 0) {
      errors.push("unexpected_follow_up");
    }
    if (candidate.submissionBehavior !== "preview_only_fail_closed") {
      errors.push("submission_not_fail_closed");
    }
    if (candidate.ordinaryConsumerVisible !== false) errors.push("consumer_visibility_enabled");
    if (candidate.ordinaryGymsVisible !== false) errors.push("gyms_visibility_enabled");
    if (candidate.buyerDemoVisible !== false) errors.push("buyer_demo_visibility_enabled");
    if (candidate.persistenceAllowed !== false) errors.push("persistence_enabled");
    if (candidate.legacyGenerationAllowed !== false) errors.push("legacy_generation_enabled");
    if (candidate.productShadowAllowed !== false) errors.push("product_shadow_enabled");
    if (candidate.v2OutputAllowed !== false) errors.push("v2_output_enabled");

    if (typeof candidate.id === "string") {
      if (ids.has(candidate.id)) errors.push("duplicate_option_id");
      ids.add(candidate.id);
    }
    if (typeof candidate.displayLabel === "string") {
      if (labels.has(candidate.displayLabel)) errors.push("duplicate_display_label");
      labels.add(candidate.displayLabel);
    }
  }

  if (value.options.length !== 1) errors.push("implemented_option_count_not_one");
  return { valid: errors.length === 0, errors };
}

export function getInactiveProductGoalOption(
  optionId: string
): InactiveProductGoalOption | null {
  return optionId === GET_STRONGER_OPTION_ID ? GET_STRONGER_INACTIVE_OPTION : null;
}
