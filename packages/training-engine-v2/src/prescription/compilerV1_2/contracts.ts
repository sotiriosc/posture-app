import type { PrescriptionPolicyUseCaseV2, ProductionPrescriptionPolicyV2 } from "../policiesV2";
import type { ExplicitPrescriptionPurposeResolverPolicyV1_1Input,
  ProductionPrescriptionPurposeResolutionResultV1_1,
  ProductionPrescriptionPurposeResolverPolicyV1_1 } from "../purposeResolutionV1_1";
import type { PrescriptionAssignmentCompilerInputV1_1,
  PrescriptionAssignmentCompilationResultV1_1,
  ProductionExercisePrescriptionPlanV1_1 } from "../compilerV1_1";
import type { SourceExposureEventIdentity } from "../designContracts";
import type { PrescriptionAssignmentCompilationResult } from "../compiler/contracts";

export const PRODUCTION_PRESCRIPTION_COMPILER_V1_2_CONTRACT_REFERENCE = Object.freeze({
  contractId: "PRODUCTION_PRESCRIPTION_COMPILER_KERNEL",
  contractVersion: "1.2.0",
} as const);
export const PRODUCTION_PRESCRIPTION_COMPILER_V1_2_STATUS =
  "PRODUCTION_PRESCRIPTION_COMPILER_V1_2_IMPLEMENTED_NOT_ACTIVATED" as const;
export const PRESCRIPTION_PURPOSE_CONTRIBUTION_CONTRACT_REFERENCE = Object.freeze({
  contractId: "PRESCRIPTION_PURPOSE_CONTRIBUTION",
  contractVersion: "1.0.0",
} as const);

export const PRESCRIPTION_PURPOSE_CONTRIBUTION_LANES = Object.freeze([
  "strength_development_candidate",
  "hypertrophy_development_candidate",
  "direct_development_candidate",
  "movement_quality_practice_candidate",
  "muscular_endurance_development_candidate",
  "local_capacity_development_candidate",
  "preparation_support_only",
  "activation_support_only",
  "technique_control_observation_only",
  "recovery_support_only",
  "unknown_requires_review",
] as const);
export type PrescriptionPurposeContributionLane =
  typeof PRESCRIPTION_PURPOSE_CONTRIBUTION_LANES[number];

export interface PrescriptionPurposeContribution {
  readonly contractReference: typeof PRESCRIPTION_PURPOSE_CONTRIBUTION_CONTRACT_REFERENCE;
  readonly blockId: string;
  readonly sourceExposureEventId: string;
  readonly primaryLane: PrescriptionPurposeContributionLane;
  readonly localPurpose: ProductionPrescriptionPurposeResolutionResultV1_1["selectedPrimaryPurpose"];
  readonly sourceObjectiveIds: readonly string[];
  readonly crossGoalTrace: readonly string[];
  readonly weeklyCreditCandidate: boolean;
  readonly systemicConditioningCredit: false;
  readonly completedAdaptationClaimed: false;
  readonly fractionalCoefficient: null;
}

export interface PrescriptionAssignmentCompilerInputV1_2 extends Omit<
  PrescriptionAssignmentCompilerInputV1_1,
  "compilerContract" | "purposeResolverPolicy" | "availablePurposeResolverPolicies"
> {
  readonly compilerContract: typeof PRODUCTION_PRESCRIPTION_COMPILER_V1_2_CONTRACT_REFERENCE;
  readonly purposeResolverPolicy: ExplicitPrescriptionPurposeResolverPolicyV1_1Input;
  readonly availablePurposeResolverPolicies?: readonly ProductionPrescriptionPurposeResolverPolicyV1_1[];
  readonly prescriptionPolicyV2: ProductionPrescriptionPolicyV2 | null;
  readonly trainingMode: "develop" | "maintain" | "return_or_rebuild";
  readonly requestedSystemicScope: boolean;
}

export type ProductionExercisePrescriptionPlanV1_2 = Omit<
  ProductionExercisePrescriptionPlanV1_1,
  "compilerContract"
> & {
  readonly compilerContract: typeof PRODUCTION_PRESCRIPTION_COMPILER_V1_2_CONTRACT_REFERENCE;
  readonly purposeContributions: readonly PrescriptionPurposeContribution[];
};

export type PrescriptionAssignmentCompilationStatusV1_2 =
  | PrescriptionAssignmentCompilationResultV1_1["status"]
  | PrescriptionAssignmentCompilationResult["status"]
  | "maintenance_week_and_longitudinal_policy_required"
  | "return_or_rebuild_realization_policy_required"
  | "systemic_conditioning_policy_required"
  | "power_development_policy_required"
  | "prescription_policy_v2_required"
  | "prescription_policy_v2_invalid";

export interface PrescriptionAssignmentCompilationResultV1_2 extends Omit<
  PrescriptionAssignmentCompilationResultV1_1,
  "compilerContract" | "status" | "purposeResolution" | "selectedUseCase" | "plan"
> {
  readonly compilerContract: typeof PRODUCTION_PRESCRIPTION_COMPILER_V1_2_CONTRACT_REFERENCE;
  readonly status: PrescriptionAssignmentCompilationStatusV1_2;
  readonly purposeResolution: ProductionPrescriptionPurposeResolutionResultV1_1 | null;
  readonly selectedUseCase: PrescriptionPolicyUseCaseV2 | null;
  readonly plan: ProductionExercisePrescriptionPlanV1_2 | null;
  readonly authority: "PRODUCTION_KERNEL_AUTHORITY_NOT_PRODUCT_RUNTIME";
}

export interface PrescriptionSessionCompilerInputV1_2 extends Omit<
  PrescriptionAssignmentCompilerInputV1_2,
  "assignmentHandoffId" | "context" | "continuityEvidence" | "priorRealizationEvidence" |
  "revisionContext" | "purposeResolutionAttemptId"
> {
  readonly contextByHandoffId: Readonly<Record<string, PrescriptionAssignmentCompilerInputV1_1["context"]>>;
  readonly continuityEvidenceByHandoffId: Readonly<Record<string,
    PrescriptionAssignmentCompilerInputV1_1["continuityEvidence"]>>;
  readonly priorRealizationEvidenceByHandoffId: Readonly<Record<string,
    PrescriptionAssignmentCompilerInputV1_1["priorRealizationEvidence"]>>;
  readonly revisionContextByHandoffId: Readonly<Record<string,
    PrescriptionAssignmentCompilerInputV1_1["revisionContext"]>>;
  readonly purposeResolutionAttemptIdByHandoffId: Readonly<Record<string, string>>;
}

export interface PrescriptionSessionCompilationResultV1_2 {
  readonly compilerContract: typeof PRODUCTION_PRESCRIPTION_COMPILER_V1_2_CONTRACT_REFERENCE;
  readonly status: "compiled" | "incomplete" | "invalid_session_handoff";
  readonly assignmentResults: readonly PrescriptionAssignmentCompilationResultV1_2[];
  readonly plans: readonly ProductionExercisePrescriptionPlanV1_2[];
  readonly sourceExposureEvents: readonly SourceExposureEventIdentity[];
  readonly sourceEventsUnique: boolean;
  readonly assignmentCoverageComplete: boolean;
  readonly fallbackApplied: false;
  readonly authority: "PRODUCTION_KERNEL_AUTHORITY_NOT_PRODUCT_RUNTIME";
}
