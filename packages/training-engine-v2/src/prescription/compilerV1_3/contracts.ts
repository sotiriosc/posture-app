import type { LoadTarget } from "../load";
import type { PrescriptionAssignmentCompilerInputV1_2,
  PrescriptionAssignmentCompilationResultV1_2,
  ProductionExercisePrescriptionPlanV1_2 } from "../compilerV1_2";
import type {
  AdvancedIntensityTechniqueBoundaryResult,
  AdvancedIntensityTechniqueRequest,
  AthleteAuthoredProgrammingBrief,
  AthleteSpecializationPriorityProfile,
  AthleteTrainingExperienceProfile,
  EquipmentLoadRealizationProfile,
  EquipmentLoadRealizationResult,
  ExperienceContextRealizationResult,
  ExerciseIdentityFamiliarityProfile,
  ExerciseRealizationFamiliarityProfile,
  HabitualExposureComparisonResult,
  HabitualTrainingExposureProfile,
  PainAwareRealizationContext,
  PrescriptionRampUpResult,
  ProgressionAxisRealizationOptions,
  ProgressionStartingPointEvidence,
  ProgressionStartingPointResult,
  RampLoadDelta,
  ReturnOrRebuildRealizationResult,
} from "../../realizationContext";
import type { ProgressionAxis } from "../../domain/progression";

export const PRODUCTION_PRESCRIPTION_COMPILER_V1_3_CONTRACT_REFERENCE = Object.freeze({
  contractId: "PRODUCTION_PRESCRIPTION_COMPILER_KERNEL",
  contractVersion: "1.3.0",
} as const);

export const PRODUCTION_PRESCRIPTION_COMPILER_V1_3_STATUS =
  "PRODUCTION_PRESCRIPTION_COMPILER_V1_3_IMPLEMENTED_NOT_ACTIVATED" as const;

export const PRESCRIPTION_COMPILER_V1_3_STATUSES = Object.freeze([
  "compiled_context_realization",
  "exact_productive_realization_retained",
  "self_selected_calibration_required",
  "return_rebuild_calibration_required",
  "load_ceiling_recomposition_required",
  "load_increment_unavailable_hold",
  "equipment_realization_incomplete",
  "realization_familiarity_required",
  "habitual_exposure_review_required",
  "time_budget_review_required",
  "advanced_intensity_technique_policy_required",
  "ramp_up_policy_required",
  "progression_axis_realization_available",
  "progression_axis_realization_unavailable",
  "catalog_identity_gap",
  "context_realization_conflict",
  "base_compilation_failed",
] as const);
export type PrescriptionCompilerStatusV1_3 =
  (typeof PRESCRIPTION_COMPILER_V1_3_STATUSES)[number];

export interface PrescriptionAssignmentCompilerInputV1_3 extends Omit<
  PrescriptionAssignmentCompilerInputV1_2,
  "compilerContract"
> {
  readonly compilerContract: typeof PRODUCTION_PRESCRIPTION_COMPILER_V1_3_CONTRACT_REFERENCE;
  readonly experienceProfile: AthleteTrainingExperienceProfile;
  readonly identityFamiliarityProfile: ExerciseIdentityFamiliarityProfile;
  readonly realizationFamiliarityProfile: ExerciseRealizationFamiliarityProfile;
  readonly habitualExposureProfile: HabitualTrainingExposureProfile;
  readonly habitualExposureLaneId: string;
  readonly reviewedHabitualComparison?: HabitualExposureComparisonResult["comparison"];
  readonly proposedDevelopmentalBlockCount: number;
  readonly equipmentLoadProfile: EquipmentLoadRealizationProfile;
  readonly requestedLoad: LoadTarget | null;
  readonly currentExactLoad: number | null;
  readonly loadCeilingInsufficientForPurpose: boolean;
  readonly startingPointEvidence: readonly ProgressionStartingPointEvidence[];
  readonly programmingBrief: AthleteAuthoredProgrammingBrief | null;
  readonly specializationProfile: AthleteSpecializationPriorityProfile | null;
  readonly intensityTechniqueRequests: readonly AdvancedIntensityTechniqueRequest[];
  readonly painAwareContext: PainAwareRealizationContext;
  readonly equipmentChanged: boolean;
  readonly supportOrRangeChanged: boolean;
  readonly sideSpecificRealization: boolean;
  readonly timeConstrained: boolean;
  readonly timeBudgetMinutes: number | null;
  readonly returnOrRebuildContext: {
    readonly absenceState: "short" | "extended" | "detrained" | "unknown";
    readonly priorExactOrRelatedProductive: boolean;
    readonly equipmentCompatible: boolean;
    readonly supportRangeSideCompatible: boolean;
    readonly safetyClear: boolean;
    readonly currentReadinessKnown: boolean;
    readonly currentFamiliarityKnown: boolean;
    readonly priorProductiveVolumeKnown: boolean;
    readonly currentTimeCapacityKnown: boolean;
  } | null;
  readonly loadDelta: RampLoadDelta;
  readonly exactRampLoads: readonly LoadTarget[];
  readonly reviewedRampBlockCount: 0 | 1 | 2 | 3 | 4 | null;
  readonly athletePreferredRampBlockCount: 0 | 1 | 2 | 3 | 4 | null;
  readonly blockedProgressionAxes: readonly ProgressionAxis[];
}

export type ProductionExercisePrescriptionPlanV1_3 = Omit<
  ProductionExercisePrescriptionPlanV1_2,
  "compilerContract"
> & {
  readonly compilerContract: typeof PRODUCTION_PRESCRIPTION_COMPILER_V1_3_CONTRACT_REFERENCE;
  readonly equipmentLoadRealization: EquipmentLoadRealizationResult;
  readonly startingPoint: ProgressionStartingPointResult;
  readonly contextRealization: ExperienceContextRealizationResult;
  readonly returnOrRebuild: ReturnOrRebuildRealizationResult | null;
  readonly habitualExposureComparison: HabitualExposureComparisonResult;
  readonly rampUp: PrescriptionRampUpResult;
  readonly progressionOptions: ProgressionAxisRealizationOptions;
  readonly intensityTechniqueBoundary: AdvancedIntensityTechniqueBoundaryResult;
  readonly progressionApplied: false;
  readonly volumeAdded: false;
  readonly exerciseIdentitySelected: false;
};

export interface PrescriptionAssignmentCompilationResultV1_3 {
  readonly compilerContract: typeof PRODUCTION_PRESCRIPTION_COMPILER_V1_3_CONTRACT_REFERENCE;
  readonly status: PrescriptionCompilerStatusV1_3;
  readonly realizationStatusTrace: readonly string[];
  readonly baseCompilation: PrescriptionAssignmentCompilationResultV1_2 | null;
  readonly plan: ProductionExercisePrescriptionPlanV1_3 | null;
  readonly equipmentLoadRealization: EquipmentLoadRealizationResult | null;
  readonly startingPoint: ProgressionStartingPointResult | null;
  readonly contextRealization: ExperienceContextRealizationResult | null;
  readonly returnOrRebuild: ReturnOrRebuildRealizationResult | null;
  readonly habitualExposureComparison: HabitualExposureComparisonResult | null;
  readonly rampUp: PrescriptionRampUpResult | null;
  readonly progressionOptions: ProgressionAxisRealizationOptions | null;
  readonly intensityTechniqueBoundary: AdvancedIntensityTechniqueBoundaryResult;
  readonly fallbackApplied: false;
  readonly progressionApplied: false;
  readonly authority: "PRODUCTION_KERNEL_AUTHORITY_NOT_PRODUCT_RUNTIME";
  readonly productionActivationStatus: "NOT_ACTIVATED";
}

export interface PrescriptionSessionCompilerInputV1_3 {
  readonly compilerContract: typeof PRODUCTION_PRESCRIPTION_COMPILER_V1_3_CONTRACT_REFERENCE;
  readonly sessionIntentId: string;
  readonly expectedAssignmentHandoffIds: readonly string[];
  readonly assignmentInputs: readonly PrescriptionAssignmentCompilerInputV1_3[];
}

export interface PrescriptionSessionCompilationResultV1_3 {
  readonly compilerContract: typeof PRODUCTION_PRESCRIPTION_COMPILER_V1_3_CONTRACT_REFERENCE;
  readonly status: "compiled" | "incomplete" | "invalid_session_handoff";
  readonly assignmentResults: readonly PrescriptionAssignmentCompilationResultV1_3[];
  readonly plans: readonly ProductionExercisePrescriptionPlanV1_3[];
  readonly sourceExposureEventIds: readonly string[];
  readonly sourceEventsUnique: boolean;
  readonly assignmentCoverageComplete: boolean;
  readonly fallbackApplied: false;
  readonly authority: "PRODUCTION_KERNEL_AUTHORITY_NOT_PRODUCT_RUNTIME";
}
