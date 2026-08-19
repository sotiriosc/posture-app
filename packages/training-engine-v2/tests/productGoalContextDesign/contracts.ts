import { createHash } from "node:crypto";

export const PRODUCT_GOAL_CONTEXT_DESIGN_REFERENCE = Object.freeze({
  contractId: "SCREENSHOT_GUIDED_PRODUCT_GOAL_CONTEXT_INPUT_DESIGN",
  contractVersion: "1.0.0",
});

export const OWNER_SCREENSHOT_CORPUS_REFERENCE = Object.freeze({
  contractId: "OWNER_SUPPLIED_PRODUCT_SCREENSHOT_OBSERVATION_CORPUS",
  contractVersion: "1.0.0",
});

export const CURRENT_RENDER_BASELINE_REFERENCE = Object.freeze({
  contractId: "PRODUCT_GOAL_CONTEXT_CURRENT_RENDER_BASELINE",
  contractVersion: "1.0.0",
});

export const PRODUCT_PROFILE_V2_REFERENCE = Object.freeze({
  contractId: "PRODUCT_TRAINING_PROFILE_V2_DESIGN",
  contractVersion: "2.0.0-design-only",
});

export const QUESTIONNAIRE_SIGNATURE_V2_REFERENCE = Object.freeze({
  contractId: "QUESTIONNAIRE_SIGNATURE_V2_DESIGN",
  contractVersion: "2.0.0-design-only",
});

export const F_HANDOFF_REFERENCE = Object.freeze({
  contractId: "ONE_INACTIVE_GET_STRONGER_PRODUCT_OPTION_V1_IMPLEMENTATION_HANDOFF",
  contractVersion: "1.0.0",
});

export const CHUNK_E_STARTING_COMMIT =
  "3f46f40da6405725b7694252ac7e127c0cd1df09";
export const CHUNK_E_LEDGER_BEFORE_SHA =
  "f980d94802c7137007602d69fbf214e438909875c2ccf114d68194fd3ec42386";

export type GoalOptionState =
  | "legacy_active"
  | "future_inactive_internal"
  | "future_shadow_only"
  | "owner_account_only"
  | "generally_available"
  | "follow_up_required"
  | "policy_required"
  | "deprecated_legacy"
  | "unsupported";

export type DriftClassification =
  | "screenshot_matches_current_branch"
  | "screenshot_matches_deployed_but_not_branch"
  | "current_branch_only"
  | "consumer_gyms_difference"
  | "conditional_state_not_captured"
  | "stale_build_possible"
  | "owner_observation_unverified"
  | "historical_compatibility_behavior"
  | "future_architecture_difference"
  | "requires_owner_review"
  | "not_material_to_Chunk_E";

export type OwnershipClassification =
  | "legacy_Product_authority"
  | "current_UI_only"
  | "current_engine_input"
  | "current_signature_input"
  | "current_shadow_mapping_input"
  | "future_structured_input"
  | "display_only"
  | "context_only"
  | "migration_required"
  | "duplicated_consumer_gyms"
  | "locked_by_gym_owner"
  | "unresolved";

export type DesignGuardModel = {
  surfaceCount: number;
  targetOrder: readonly string[];
  allFutureFieldsVisible: boolean;
  multiPageWizard: boolean;
  ordinaryFollowUpModal: boolean;
  painOwner: "context" | "outcome";
  diagnosisInferenceCount: number;
  genericCorrectiveCircuitCount: number;
  reducePainFuturePrimary: boolean;
  buildModeMapsToStrength: boolean;
  generalFitnessSilentDefault: string | null;
  athleticPerformanceSilentDefault: string | null;
  gymUniversalCapabilityInferenceCount: number;
  dumbbellCapabilityInferenceCount: number;
  bandCapabilityInferenceCount: number;
  advancedExactLoadInferenceCount: number;
  secondaryOverridesPrimary: boolean;
  fCurrentRouteVisible: boolean;
  fCallsGenerateProgram: boolean;
  fPersistsQuestionnaire: boolean;
  fCallsCurrentRouteShadow: boolean;
  currentSignatureChanged: boolean;
  screenshotPersonalDataCopied: boolean;
  consumerScreenshotProvesGymsParity: boolean;
  screenshotKneesAddedToCode: boolean;
  reportedBandDetailInvented: boolean;
  eCompletedBeforeEvidence: boolean;
  fCompleted: boolean;
  ledgerFinalCompleted: boolean;
};

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([, entry]) => entry !== undefined)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => [key, canonicalize(entry)])
  );
}

export const stableJson = (value: unknown) => JSON.stringify(canonicalize(value));

export const fingerprint = (value: unknown) =>
  createHash("sha256").update(stableJson(value)).digest("hex");

export const jsonReport = (value: unknown) => `${JSON.stringify(value, null, 2)}\n`;
