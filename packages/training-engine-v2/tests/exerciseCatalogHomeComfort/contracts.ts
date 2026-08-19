import { createHash } from "node:crypto";

export const CURATION_REFERENCE = Object.freeze({
  contractId: "EXERCISE_CATALOG_COVERAGE_AND_HOME_COMFORT_CURATION_V1",
  contractVersion: "1.0.0",
  authority: "read_only_not_production_catalog_expansion",
});

export const HOME_COMFORT_PROFILE_REFERENCE = Object.freeze({
  contractId: "EXERCISE_HOME_COMFORT_PROFILE",
  contractVersion: "1.0.0",
  activation: "design_only",
});

export const HOME_COMFORT_SELECTION_POLICY_REFERENCE = Object.freeze({
  contractId: "HOME_EXERCISE_COMFORT_SELECTION_POLICY_V1",
  contractVersion: "1.0.0",
  activation: "not_active",
});

export const CURATION_STARTING_COMMIT =
  "cc2438248debef43ee829283ff08ab661300b63e";
export const LEDGER_BEFORE_SHA =
  "9265f70a7c0707ff88314a6673e954c54326956a187a50aa834793541982b562";
export const REFERENCE_CATALOG_SOURCE_SHA =
  "a7c69bae80c58b346d2e907387dd16ecd0f3f33f797b0aa239be5401df4d887d";
export const SESSION_COMPOSER_CATALOG_FINGERPRINT =
  "bfb21d7dc91504de5da8f4cd92850c8bb97ca5a0ce5f65624d2db4971d5e1a91";

export type ClosedLevel = "low" | "moderate" | "high" | "unknown";
export type ClosedFit = "poor" | "possible" | "good" | "excellent" | "unknown";
export type ReviewState = "accepted_for_curation" | "owner_review_required" | "unknown";

export type ComfortProfile = {
  readonly recognizability: ClosedLevel;
  readonly setupComplexity: ClosedLevel;
  readonly instructionBurden: ClosedLevel;
  readonly balanceDemand: ClosedLevel;
  readonly coordinationDemand: ClosedLevel;
  readonly supportClarity: ClosedLevel;
  readonly equipmentAmbiguity: ClosedLevel;
  readonly anchorComplexity: ClosedLevel;
  readonly floorTransitionDemand: ClosedLevel;
  readonly spaceRequirement: ClosedLevel;
  readonly failureConsequenceClarity: ClosedLevel;
  readonly unilateralComplexity: ClosedLevel;
  readonly externalLoadHandlingComplexity: ClosedLevel;
  readonly firstSessionConfidenceSuitability: ClosedFit;
  readonly homeEnvironmentFit: ClosedFit;
  readonly unknowns: readonly string[];
  readonly reviewState: ReviewState;
  readonly provenance: readonly string[];
};

export const DISPOSITIONS = [
  "ready_for_owner_selection",
  "same_identity_realization",
  "ready_after_targeted_metadata_curation",
  "equipment_contract_required",
  "support_or_safety_review_required",
  "exercise_science_review_required",
  "receiver_policy_required",
  "catalog_identity_gap_confirmed",
  "duplicate_low_value",
  "home_comfort_rejected",
  "deferred_power_or_conditioning",
  "deferred_accessibility_owner",
  "insufficient_evidence",
  "rejected",
] as const;

export type CandidateDisposition = (typeof DISPOSITIONS)[number];

export type CandidateConcept = {
  readonly id: string;
  readonly group: "home" | "historical_p1" | "common_strength" | "deferred";
  readonly identityBoundary: string;
  readonly equipmentTruth: string;
  readonly support: string;
  readonly risk: string;
  readonly familiarity: string;
  readonly setupComplexity: ClosedLevel;
  readonly homeComfort: ClosedFit;
  readonly movementRole: string;
  readonly actionFunctions: readonly string[];
  readonly purpose: readonly string[];
  readonly doseMode: string;
  readonly progressionAxes: readonly string[];
  readonly loadCeiling: string;
  readonly receiver: string;
  readonly redundancy: string;
  readonly coachingBurden: ClosedLevel;
  readonly evidence: string;
  readonly disposition: CandidateDisposition;
  readonly firstTrancheEligible: boolean;
};

export type CoverageStatus =
  | "sufficient"
  | "thin"
  | "empty"
  | "impossible_without_equipment"
  | "candidate_expansion_available"
  | "truthful_limitation";

export type CoverageCell = {
  readonly environment: string;
  readonly pattern: string;
  readonly experienceAndFamiliarityStates: readonly string[];
  readonly applicablePurposes: readonly string[];
  readonly status: CoverageStatus;
  readonly currentIds: readonly string[];
  readonly candidateIds: readonly string[];
  readonly reason: string;
};

export type RealizationDecision = {
  readonly identity: string;
  readonly variants: readonly string[];
  readonly decision: "same_identity" | "distinct_identity" | "unresolved";
  readonly reason: string;
  readonly requiredMetadata: readonly string[];
};

export type GuardModel = {
  readonly homeSetsBeginner: boolean;
  readonly homeBlocksAdvanced: boolean;
  readonly comfortMeansLowStimulus: boolean;
  readonly precedence: readonly string[];
  readonly noveltyQuota: number;
  readonly varietyQuota: number;
  readonly inferredEquipment: readonly string[];
  readonly fakeSubstitutions: readonly string[];
  readonly duplicateIdentityReasons: readonly string[];
  readonly candidateWithoutReceiverCount: number;
  readonly catalogSizeTarget: number | null;
  readonly productionRowAdditions: number;
  readonly productionRowModifications: number;
  readonly productionRowDeletions: number;
  readonly rankingChanges: number;
  readonly eligibilityChanges: number;
  readonly composerChanges: number;
  readonly weekChanges: number;
  readonly prescriptionChanges: number;
  readonly productShadowChanges: number;
  readonly productUiChanges: number;
  readonly getStrongerVisibilityChanges: number;
  readonly productPersistenceChanges: number;
  readonly generateProgramChanges: number;
  readonly ownerDeliveryCount: number;
  readonly practiceOptionsImplementationCount: number;
  readonly productActivationCount: number;
  readonly genericWarmupCount: number;
  readonly genericActivationCount: number;
  readonly productHomeProgramGrowthCount: number;
  readonly ledgerCompleted: boolean;
  readonly gCompleted: boolean;
};

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([, entry]) => entry !== undefined)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => [key, canonicalize(entry)]),
  );
}

export const stableJson = (value: unknown) => JSON.stringify(canonicalize(value));
export const fingerprint = (value: unknown) =>
  createHash("sha256").update(stableJson(value)).digest("hex");
export const jsonReport = (value: unknown) => `${JSON.stringify(value, null, 2)}\n`;
