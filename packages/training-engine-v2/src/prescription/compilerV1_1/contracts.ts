import type { SourceExposureEventIdentity } from "../designContracts";
import type { PrescriptionPolicyUseCase } from "../policies";
import type { PrescriptionAssignmentCompilerInput, PrescriptionEquipmentRealization,
  PrescriptionExecutionRequirement, ProductionExercisePrescriptionPlan,
  ProductionPrescriptionDecisionTrace, ProductionPrescriptionRevisionLedger } from "../compiler/contracts";
import type { SessionExerciseAssignment, SessionPrescriptionAssignmentHandoff } from
  "../../sessionComposer/contracts";
import type { ExplicitPrescriptionPurposeResolverPolicyInput,
  ProductionPrescriptionPurposeEvidenceSnapshot,
  ProductionPrescriptionPurposeResolutionResult,
  ProductionPrescriptionPurposeResolverPolicy } from "../purposeResolution/contracts";
import type { PrescriptionPurposeResolutionStatus } from "../purposeResolution/vocabularies";

export const PRODUCTION_PRESCRIPTION_COMPILER_V1_1_CONTRACT_ID =
  "PRODUCTION_PRESCRIPTION_COMPILER_KERNEL" as const;
export const PRODUCTION_PRESCRIPTION_COMPILER_V1_1_CONTRACT_VERSION = "1.1.0" as const;
export const PRODUCTION_PRESCRIPTION_COMPILER_V1_1_CONTRACT_REFERENCE = Object.freeze({
  contractId: PRODUCTION_PRESCRIPTION_COMPILER_V1_1_CONTRACT_ID,
  contractVersion: PRODUCTION_PRESCRIPTION_COMPILER_V1_1_CONTRACT_VERSION,
});
export const PRODUCTION_PRESCRIPTION_COMPILER_V1_1_STATUS =
  "PRODUCTION_PRESCRIPTION_COMPILER_V1_1_IMPLEMENTED_NOT_ACTIVATED" as const;

export const PRODUCTION_PRESCRIPTION_COMPILER_V1_0_DISPOSITION =
  "HISTORICAL_COMPATIBILITY_COMPILER_NOT_PRODUCT_ACTIVATION_AUTHORITY" as const;

export interface PrescriptionAssignmentCompilerInputV1_1 extends PrescriptionAssignmentCompilerInput {
  readonly compilerContract: typeof PRODUCTION_PRESCRIPTION_COMPILER_V1_1_CONTRACT_REFERENCE;
  readonly purposeEvidenceSnapshot: ProductionPrescriptionPurposeEvidenceSnapshot;
  readonly purposeResolverPolicy: ExplicitPrescriptionPurposeResolverPolicyInput;
  readonly availablePurposeResolverPolicies?: readonly ProductionPrescriptionPurposeResolverPolicy[];
  readonly purposeResolutionAttemptId: string;
}

export type ProductionExercisePrescriptionPlanV1_1 = Omit<
  ProductionExercisePrescriptionPlan,
  "compilerContract"
> & { readonly compilerContract: typeof PRODUCTION_PRESCRIPTION_COMPILER_V1_1_CONTRACT_REFERENCE };

export type PrescriptionAssignmentCompilationStatusV1_1 =
  | "compiled"
  | PrescriptionPurposeResolutionStatus
  | "blocked_by_training_readiness"
  | "prescription_policy_required"
  | "prescription_policy_unavailable"
  | "prescription_policy_conflict"
  | "unresolved_execution_requirement"
  | "invalid_source_exposure_context"
  | "contradictory_prescription_requirements"
  | "current_equipment_realization_unavailable"
  | "candidate_recomposition_required"
  | "invalid_prior_realization_evidence"
  | "invalid_revision_context"
  | "unsupported_compiler_contract";

export interface PrescriptionAssignmentCompilationResultV1_1 {
  readonly compilerContract: typeof PRODUCTION_PRESCRIPTION_COMPILER_V1_1_CONTRACT_REFERENCE;
  readonly status: PrescriptionAssignmentCompilationStatusV1_1;
  readonly purposeResolution: ProductionPrescriptionPurposeResolutionResult | null;
  readonly selectedPurpose: ProductionPrescriptionPurposeResolutionResult["selectedPrimaryPurpose"];
  readonly selectedUseCase: PrescriptionPolicyUseCase | null;
  readonly purposeSourceLineage: readonly string[];
  readonly noFallbackTrace: readonly string[];
  readonly assignment: SessionExerciseAssignment | null;
  readonly handoffAssignment: SessionPrescriptionAssignmentHandoff | null;
  readonly sourceExposureEvent: SourceExposureEventIdentity | null;
  readonly equipmentRealization: PrescriptionEquipmentRealization | null;
  readonly plan: ProductionExercisePrescriptionPlanV1_1 | null;
  readonly revisionLedger: ProductionPrescriptionRevisionLedger | null;
  readonly recompositionRequirement: PrescriptionExecutionRequirement | null;
  readonly decisionTrace: ProductionPrescriptionDecisionTrace;
  readonly compatibilityDisposition: typeof PRODUCTION_PRESCRIPTION_COMPILER_V1_0_DISPOSITION;
  readonly fallbackApplied: false;
  readonly authority: "PRODUCTION_KERNEL_AUTHORITY_NOT_PRODUCT_RUNTIME";
}

export interface PrescriptionSessionCompilerInputV1_1 extends Omit<
  PrescriptionAssignmentCompilerInputV1_1,
  "assignmentHandoffId" | "context" | "continuityEvidence" | "priorRealizationEvidence" |
  "revisionContext" | "purposeResolutionAttemptId"
> {
  readonly contextByHandoffId: Readonly<Record<string, PrescriptionAssignmentCompilerInput["context"]>>;
  readonly continuityEvidenceByHandoffId: Readonly<Record<string,
    PrescriptionAssignmentCompilerInput["continuityEvidence"]>>;
  readonly priorRealizationEvidenceByHandoffId: Readonly<Record<string,
    PrescriptionAssignmentCompilerInput["priorRealizationEvidence"]>>;
  readonly revisionContextByHandoffId: Readonly<Record<string,
    PrescriptionAssignmentCompilerInput["revisionContext"]>>;
  readonly purposeResolutionAttemptIdByHandoffId: Readonly<Record<string, string>>;
}

export interface PrescriptionSessionCompilationResultV1_1 {
  readonly compilerContract: typeof PRODUCTION_PRESCRIPTION_COMPILER_V1_1_CONTRACT_REFERENCE;
  readonly status: "compiled" | "incomplete" | "invalid_session_handoff";
  readonly assignmentResults: readonly PrescriptionAssignmentCompilationResultV1_1[];
  readonly plans: readonly ProductionExercisePrescriptionPlanV1_1[];
  readonly sourceExposureEvents: readonly SourceExposureEventIdentity[];
  readonly sourceEventsUnique: boolean;
  readonly assignmentCoverageComplete: boolean;
  readonly fallbackApplied: false;
  readonly authority: "PRODUCTION_KERNEL_AUTHORITY_NOT_PRODUCT_RUNTIME";
}
