import type { PrescriptionLocalPurpose } from "../prescription/purposeResolution";
import type { PrescriptionPurposeContributionLane } from "../prescription/compilerV1_2";
import type { PrescriptionDoseBlockPurpose } from "../prescription/designContracts";
import type { ProductionPostPrescriptionWeekValidationInput,
  ProductionPostPrescriptionWeekValidationResult } from "../weekValidation";

export const PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_V1_1_CONTRACT_REFERENCE = Object.freeze({
  contractId: "PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_KERNEL",
  contractVersion: "1.1.0",
} as const);

export const PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_V1_1_STATUS =
  "PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_V1_1_IMPLEMENTED_NOT_ACTIVATED" as const;

export const PURPOSE_AWARE_OBJECTIVE_RELATIONSHIPS = Object.freeze([
  "primary_weekly_goal", "secondary_weekly_goal", "cross_goal_support",
] as const);
export type PurposeAwareObjectiveRelationship = typeof PURPOSE_AWARE_OBJECTIVE_RELATIONSHIPS[number];

export interface PurposeAwareObjectiveView {
  readonly objectiveId: string;
  readonly localPurpose: PrescriptionLocalPurpose;
  readonly relationship: PurposeAwareObjectiveRelationship;
  readonly creditRequested: boolean;
}

export interface PostPrescriptionPurposeContributionEvent {
  readonly sourceExposureEventId: string;
  readonly blockId: string;
  readonly blockPurpose: PrescriptionDoseBlockPurpose;
  readonly localPurpose: PrescriptionLocalPurpose;
  readonly primaryLane: PrescriptionPurposeContributionLane;
  readonly objectiveViews: readonly PurposeAwareObjectiveView[];
  readonly doseFingerprint: string;
  readonly duplicateDoseCreated: false;
  readonly systemicConditioningClaimed: false;
  readonly completedPerformanceClaimed: false;
  readonly adaptationClaimed: false;
}

export interface ProductionPostPrescriptionWeekValidationInputV1_1 {
  readonly validatorContract: typeof PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_V1_1_CONTRACT_REFERENCE;
  readonly baseValidationInput: ProductionPostPrescriptionWeekValidationInput;
  readonly purposeContributionEvents: readonly PostPrescriptionPurposeContributionEvent[];
}

export type PurposeContributionValidationStatus =
  | "validated_supported_purpose_scope"
  | "invalid_purpose_contribution"
  | "unsupported_purpose_scope"
  | "base_validation_not_passed";

export interface PurposeContributionValidationTrace {
  readonly status: PurposeContributionValidationStatus;
  readonly sourceEventCount: number;
  readonly uniqueDoseCount: number;
  readonly creditedObjectiveIds: readonly string[];
  readonly traceOnlyObjectiveIds: readonly string[];
  readonly reasonCodes: readonly string[];
  readonly noDoubleCredit: boolean;
  readonly noSystemicConditioningInference: boolean;
  readonly completedPerformanceClaimed: false;
  readonly adaptationClaimed: false;
}

export interface ProductionPostPrescriptionWeekValidationResultV1_1 {
  readonly validatorContract: typeof PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_V1_1_CONTRACT_REFERENCE;
  readonly status: PurposeContributionValidationStatus;
  readonly baseValidation: ProductionPostPrescriptionWeekValidationResult;
  readonly purposeContributionTrace: PurposeContributionValidationTrace;
  readonly authority: "PRODUCTION_KERNEL_AUTHORITY_NOT_PRODUCT_RUNTIME";
  readonly productionActivationStatus: "NOT_ACTIVATED";
}
