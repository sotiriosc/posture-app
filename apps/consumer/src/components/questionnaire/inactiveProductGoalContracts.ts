export const ONE_INACTIVE_PRODUCT_GOAL_OPTION_CONTRACT =
  "ONE_INACTIVE_PRODUCT_GOAL_OPTION@1.0.0" as const;
export const PRODUCT_GOAL_OPTION_REGISTRY_CONTRACT =
  "PRODUCT_GOAL_OPTION_REGISTRY_V1@1.0.0" as const;
export const INACTIVE_PRODUCT_GOAL_PREVIEW_INPUT_CONTRACT =
  "INACTIVE_PRODUCT_GOAL_PREVIEW_INPUT@1.0.0" as const;
export const INACTIVE_PRODUCT_GOAL_PREVIEW_SELECTION_CONTRACT =
  "INACTIVE_PRODUCT_GOAL_PREVIEW_SELECTION@1.0.0" as const;
export const INACTIVE_PRODUCT_GOAL_PREVIEW_RESULT_CONTRACT =
  "INACTIVE_PRODUCT_GOAL_PREVIEW_RESULT@1.0.0" as const;

export const INACTIVE_PRODUCT_GOAL_CONTRACT_VERSION = "1.0.0" as const;
export const GET_STRONGER_OPTION_ID = "get_stronger" as const;

export type InactiveProductGoalPreviewInput = {
  contract: typeof INACTIVE_PRODUCT_GOAL_PREVIEW_INPUT_CONTRACT;
  version: typeof INACTIVE_PRODUCT_GOAL_CONTRACT_VERSION;
  optionId: typeof GET_STRONGER_OPTION_ID;
  enabled: true;
};

export type InactiveProductGoalPreviewSelection = {
  contract: typeof INACTIVE_PRODUCT_GOAL_PREVIEW_SELECTION_CONTRACT;
  version: typeof INACTIVE_PRODUCT_GOAL_CONTRACT_VERSION;
  optionId: typeof GET_STRONGER_OPTION_ID;
  canonicalOutcome: "strength";
  availability: "future_inactive_internal";
  selected: true;
  source: "explicit_internal_preview";
  persisted: false;
  generationAllowed: false;
  ProductShadowAllowed: false;
  deliveredToUser: false;
  ProductMutationApplied: false;
};

export type InactiveProductGoalPreviewResult = {
  contract: typeof INACTIVE_PRODUCT_GOAL_PREVIEW_RESULT_CONTRACT;
  version: typeof INACTIVE_PRODUCT_GOAL_CONTRACT_VERSION;
  optionId: typeof GET_STRONGER_OPTION_ID;
  canonicalOutcome: "strength";
  status: "future_submission_unavailable";
  reason: "INACTIVE_PRODUCT_GOAL_PREVIEW_ONLY";
  persistenceAttempted: false;
  generationAttempted: false;
  ProductShadowAttempted: false;
  navigationAttempted: false;
  activeSessionMutationAttempted: false;
  ProductMutationApplied: false;
  V2OutputReturned: false;
};

export const GET_STRONGER_PREVIEW_INPUT: InactiveProductGoalPreviewInput =
  Object.freeze({
    contract: INACTIVE_PRODUCT_GOAL_PREVIEW_INPUT_CONTRACT,
    version: INACTIVE_PRODUCT_GOAL_CONTRACT_VERSION,
    optionId: GET_STRONGER_OPTION_ID,
    enabled: true,
  });

export function isInactiveProductGoalPreviewInput(
  value: unknown
): value is InactiveProductGoalPreviewInput {
  if (!value || typeof value !== "object") return false;
  const input = value as Record<string, unknown>;
  return (
    input.contract === INACTIVE_PRODUCT_GOAL_PREVIEW_INPUT_CONTRACT &&
    input.version === INACTIVE_PRODUCT_GOAL_CONTRACT_VERSION &&
    input.optionId === GET_STRONGER_OPTION_ID &&
    input.enabled === true
  );
}

export function createInactiveProductGoalPreviewSelection(): InactiveProductGoalPreviewSelection {
  return Object.freeze({
    contract: INACTIVE_PRODUCT_GOAL_PREVIEW_SELECTION_CONTRACT,
    version: INACTIVE_PRODUCT_GOAL_CONTRACT_VERSION,
    optionId: GET_STRONGER_OPTION_ID,
    canonicalOutcome: "strength",
    availability: "future_inactive_internal",
    selected: true,
    source: "explicit_internal_preview",
    persisted: false,
    generationAllowed: false,
    ProductShadowAllowed: false,
    deliveredToUser: false,
    ProductMutationApplied: false,
  });
}

export function createInactiveProductGoalPreviewResult(): InactiveProductGoalPreviewResult {
  return Object.freeze({
    contract: INACTIVE_PRODUCT_GOAL_PREVIEW_RESULT_CONTRACT,
    version: INACTIVE_PRODUCT_GOAL_CONTRACT_VERSION,
    optionId: GET_STRONGER_OPTION_ID,
    canonicalOutcome: "strength",
    status: "future_submission_unavailable",
    reason: "INACTIVE_PRODUCT_GOAL_PREVIEW_ONLY",
    persistenceAttempted: false,
    generationAttempted: false,
    ProductShadowAttempted: false,
    navigationAttempted: false,
    activeSessionMutationAttempted: false,
    ProductMutationApplied: false,
    V2OutputReturned: false,
  });
}
