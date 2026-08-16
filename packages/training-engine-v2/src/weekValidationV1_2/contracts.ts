import type { HabitualExposureComparisonResult,
  PrescriptionRampUpBlock } from "../realizationContext";
import type { ProductionPostPrescriptionWeekValidationInputV1_1,
  ProductionPostPrescriptionWeekValidationResultV1_1 } from "../weekValidationV1_1";

export const PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_V1_2_CONTRACT_REFERENCE = Object.freeze({
  contractId: "PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_KERNEL",
  contractVersion: "1.2.0",
} as const);

export const PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_V1_2_STATUS =
  "PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_V1_2_IMPLEMENTED_NOT_ACTIVATED" as const;

export interface PostPrescriptionRealizationContextEvent {
  readonly sourceExposureEventId: string;
  readonly exerciseId: string;
  readonly prescriptionRevisionId: string;
  readonly equipmentRealizationProfileId: string;
  readonly experienceProfileId: string;
  readonly identityFamiliarityProfileId: string;
  readonly realizationFamiliarityProfileId: string;
  readonly contextRealizationVariant: string;
  readonly startingPointStatus: string;
  readonly returnOrRebuildStatus: string | null;
  readonly habitualExposureComparison: HabitualExposureComparisonResult;
  readonly rampUpBlocks: readonly PrescriptionRampUpBlock[];
  readonly timeBudgetState: "within_budget" | "over_budget" | "unknown";
  readonly advancedIntensityTechniqueRequestCount: number;
  readonly intensityTechniqueFlattenedCount: 0;
  readonly preparatoryDevelopmentalCreditCount: 0;
  readonly completedPerformanceClaimed: false;
  readonly adaptationClaimed: false;
  readonly systemicConditioningClaimed: false;
  readonly fractionalCoefficient: null;
}
export interface ProductionPostPrescriptionWeekValidationInputV1_2 {
  readonly validatorContract: typeof PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_V1_2_CONTRACT_REFERENCE;
  readonly baseValidationInput: ProductionPostPrescriptionWeekValidationInputV1_1;
  readonly realizationContextEvents: readonly PostPrescriptionRealizationContextEvent[];
}

export type RealizationContextValidationStatus =
  | "validated_context_realization_scope"
  | "validated_with_context_review_required"
  | "invalid_context_realization"
  | "base_validation_not_passed";

export interface RealizationContextValidationTrace {
  readonly status: RealizationContextValidationStatus;
  readonly sourceEventCount: number;
  readonly rampBlockCount: number;
  readonly preparatoryDevelopmentalCreditCount: 0;
  readonly duplicateSourceEventCount: number;
  readonly intensityTechniqueFlatteningCount: 0;
  readonly completedPerformanceClaimed: false;
  readonly adaptationClaimed: false;
  readonly automaticProgressionApplied: false;
  readonly reasonCodes: readonly string[];
}

export interface ProductionPostPrescriptionWeekValidationResultV1_2 {
  readonly validatorContract: typeof PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_V1_2_CONTRACT_REFERENCE;
  readonly status: RealizationContextValidationStatus;
  readonly baseValidation: ProductionPostPrescriptionWeekValidationResultV1_1;
  readonly realizationContextTrace: RealizationContextValidationTrace;
  readonly authority: "PRODUCTION_KERNEL_AUTHORITY_NOT_PRODUCT_RUNTIME";
  readonly productionActivationStatus: "NOT_ACTIVATED";
}
