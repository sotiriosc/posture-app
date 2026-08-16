export const HOME_COMFORT_PROFILE_CONTRACT = Object.freeze({
  contractId: "HOME_COMFORT_PRODUCTION_PROFILE",
  contractVersion: "1.0.0",
} as const);

export const HOME_COMFORT_SELECTION_POLICY_CONTRACT = Object.freeze({
  contractId: "HOME_COMFORT_PRODUCTION_SELECTION_POLICY",
  contractVersion: "1.0.0",
} as const);

export type HomeComfortBurden = "low" | "moderate" | "high";
export type HomeComfortConfidence = "low" | "moderate" | "high";
export type HomeComfortFit = "poor" | "possible" | "good" | "excellent";
export type HomeComfortProfileStatus = "accepted" | "not_applicable" | "unknown_review_required";

export interface HomeComfortProductionProfile {
  readonly contract: typeof HOME_COMFORT_PROFILE_CONTRACT;
  readonly exerciseId: string;
  readonly status: HomeComfortProfileStatus;
  readonly recognitionFamiliarityExpectation: HomeComfortConfidence;
  readonly setupComplexity: HomeComfortBurden;
  readonly environmentalAnchorDependence: HomeComfortBurden;
  readonly supportConfidence: HomeComfortConfidence;
  readonly balanceStabilityBurden: HomeComfortBurden;
  readonly coordinationBurden: HomeComfortBurden;
  readonly transitionComplexity: HomeComfortBurden;
  readonly stopRestartClarity: HomeComfortConfidence;
  readonly equipmentAmbiguity: HomeComfortBurden;
  readonly firstSessionComfortDisposition: HomeComfortFit;
  readonly provenance: readonly string[];
}

export type HomeComfortFamiliarity =
  | "unknown"
  | "limited"
  | "exact_tolerated"
  | "exact_productive";

export interface HomeComfortSelectionContext {
  readonly environment: "home" | "commercial_gym" | "travel" | "clinic";
  readonly familiarityByExerciseId: Readonly<Record<string, HomeComfortFamiliarity>>;
  readonly productiveContinuityIds: readonly string[];
}

export interface HomeComfortSelectionTrace {
  readonly applicable: boolean;
  readonly winnerExerciseId: string | null;
  readonly firstMeaningfulDifference: string | null;
  readonly leftFamiliarity: HomeComfortFamiliarity;
  readonly rightFamiliarity: HomeComfortFamiliarity;
  readonly stableAnchorPreserved: boolean;
  readonly comfortOverrodeSafetyOrLegality: false;
  readonly noveltyRewarded: false;
}
