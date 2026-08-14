import type { AthleteProfile } from "../../domain/athlete";
import type {
  EquipmentCapabilities,
  EquipmentRequirementTrace,
} from "../../domain/equipment";
import type { ExerciseDefinition } from "../../domain/exercise";
import type { ExercisePrescriptionKnowledgeProfile } from "../../domain/exercisePrescriptionKnowledge";
import type { PhaseId } from "../../domain/phase";
import type { Side } from "../../domain/primitives";
import type { SessionIntent, StructuralCapacityMode } from "../../domain/session";
import type { TrainingReadinessTrace } from "../../domain/trainingSafety";
import type {
  SessionExerciseAssignment,
  SessionPrescriptionAssignmentHandoff,
  SessionPrescriptionHandoff,
  SessionSkeleton,
} from "../../sessionComposer/contracts";
import type { TrainingResponseReceiverTrace } from "../../trainingResponseReceiver";
import type { ExerciseDose, ExerciseDoseMode, RestTarget } from "../dose";
import type {
  ExecutionStandard,
  LeverPrescription,
  BreathingCadencePrescription,
  LocomotorCadencePrescription,
  RangePrescription,
  SupportPrescription,
  TempoPrescription,
  EffortTarget,
} from "../executionStandard";
import type { LoadTarget } from "../load";
import type {
  PrescriptionBlockContributionClassification,
  PrescriptionDoseBlockOrder,
  PrescriptionDoseBlockPurpose,
  SourceExposureEventIdentity,
} from "../designContracts";
import type {
  EvidenceProvenance,
  ISODateTimeString,
  PrescriptionLaterality,
  PrescriptionSideBehavior,
} from "../types";
import type {
  PrescriptionPolicyReference,
  ProductionPrescriptionPolicy,
  RejectedPrescriptionPolicyRuleTrace,
  ResolvedPrescriptionPolicyRuleTrace,
} from "../policies";

export const PRODUCTION_PRESCRIPTION_COMPILER_STATUS =
  "PRODUCTION_PRESCRIPTION_COMPILER_IMPLEMENTED_NOT_ACTIVATED" as const;

export const PRODUCTION_PRESCRIPTION_COMPILER_CONTRACT_ID =
  "PRODUCTION_PRESCRIPTION_COMPILER_KERNEL" as const;
export const PRODUCTION_PRESCRIPTION_COMPILER_CONTRACT_VERSION = "1.0.0" as const;

export interface ProductionPrescriptionCompilerContractReference {
  readonly contractId: typeof PRODUCTION_PRESCRIPTION_COMPILER_CONTRACT_ID;
  readonly contractVersion: typeof PRODUCTION_PRESCRIPTION_COMPILER_CONTRACT_VERSION;
}

export const PRODUCTION_PRESCRIPTION_COMPILER_CONTRACT_REFERENCE:
  ProductionPrescriptionCompilerContractReference = Object.freeze({
  contractId: PRODUCTION_PRESCRIPTION_COMPILER_CONTRACT_ID,
  contractVersion: PRODUCTION_PRESCRIPTION_COMPILER_CONTRACT_VERSION,
});

export const PRODUCTION_PRESCRIPTION_COMPILATION_STATUSES = [
  "compiled",
  "blocked_by_training_readiness",
  "prescription_policy_required",
  "prescription_policy_unavailable",
  "prescription_policy_conflict",
  "unresolved_execution_requirement",
  "unsupported_dose_mode",
  "invalid_source_exposure_context",
  "contradictory_prescription_requirements",
  "current_equipment_realization_unavailable",
  "candidate_recomposition_required",
  "invalid_prior_realization_evidence",
  "invalid_revision_context",
] as const;

export type ProductionPrescriptionCompilationStatus =
  (typeof PRODUCTION_PRESCRIPTION_COMPILATION_STATUSES)[number];

export type PrescriptionExecutionRequirementSourceOwner =
  | "training_safety"
  | "pain_response"
  | "assessment"
  | "exercise_knowledge"
  | "session_intent"
  | "session_composer"
  | "equipment"
  | "training_response_receiver"
  | "coach_review"
  | "athlete"
  | "longitudinal"
  | "week"
  | "sequencing"
  | "unknown";

export const PRESCRIPTION_REQUIREMENT_TARGET_DIMENSIONS = [
  "load",
  "range",
  "support",
  "lever",
  "laterality",
  "side",
  "duration",
  "distance",
  "steps",
  "cadence",
  "tempo",
  "effort",
  "rest",
  "dose_mode",
  "unresolved_other",
] as const;

export type PrescriptionRequirementTargetDimension =
  (typeof PRESCRIPTION_REQUIREMENT_TARGET_DIMENSIONS)[number];

export type PrescriptionRequirementResolutionState =
  | "resolved"
  | "unresolved"
  | "conflicting"
  | "no_applicable_resolution"
  | "outside_prescription_ownership";

export type PrescriptionRequirementReviewStatus =
  | "accepted"
  | "needs_review"
  | "rejected"
  | "unknown";

export type PrescriptionReviewedResolution =
  | { readonly kind: "load"; readonly value: LoadTarget }
  | { readonly kind: "range"; readonly value: RangePrescription }
  | { readonly kind: "support"; readonly value: SupportPrescription }
  | { readonly kind: "lever"; readonly value: LeverPrescription }
  | { readonly kind: "laterality"; readonly value: PrescriptionLaterality }
  | { readonly kind: "side"; readonly value: Side }
  | { readonly kind: "duration"; readonly value: ExerciseDose["mode"] extends never ? never : import("../dose").TimeTarget }
  | { readonly kind: "distance"; readonly value: import("../dose").DistanceTarget }
  | { readonly kind: "steps"; readonly value: import("../dose").StepTarget }
  | { readonly kind: "cadence"; readonly value: LocomotorCadencePrescription | BreathingCadencePrescription }
  | { readonly kind: "tempo"; readonly value: TempoPrescription }
  | { readonly kind: "effort"; readonly value: EffortTarget }
  | { readonly kind: "rest"; readonly value: RestTarget; readonly placement: PrescriptionRestPlacement }
  | { readonly kind: "dose_mode"; readonly value: ExerciseDoseMode }
  | { readonly kind: "unresolved_other"; readonly reasonCode: string };

export interface PrescriptionExecutionRequirement {
  readonly requirementId: string;
  readonly targetAssignmentHandoffId: string;
  readonly sourceOwner: PrescriptionExecutionRequirementSourceOwner;
  readonly sourceRef: string;
  readonly targetDimension: PrescriptionRequirementTargetDimension;
  readonly requestedAction:
    | "apply_reviewed_resolution"
    | "preserve_current_realization"
    | "prohibit_realization"
    | "review_required"
    | "observe_only";
  readonly side: Side | null;
  readonly reviewStatus: PrescriptionRequirementReviewStatus;
  readonly provenance: EvidenceProvenance;
  readonly resolutionState: PrescriptionRequirementResolutionState;
  readonly reviewedResolution?: PrescriptionReviewedResolution;
}

export interface ResolvedPrescriptionRequirementSet {
  readonly status: "resolved" | "unresolved" | "conflicting";
  readonly applicable: readonly PrescriptionExecutionRequirement[];
  readonly ignoredOutsideOwnership: readonly PrescriptionExecutionRequirement[];
  readonly unresolved: readonly PrescriptionExecutionRequirement[];
  readonly conflicting: readonly PrescriptionExecutionRequirement[];
  readonly values: Readonly<Partial<Record<PrescriptionRequirementTargetDimension, PrescriptionReviewedResolution>>>;
  readonly reasonCodes: readonly string[];
}

export type PrescriptionFamiliarity =
  | "known_productive"
  | "unfamiliar"
  | "unknown";

export type PrescriptionObjectivePriority = "required" | "preferred" | "optional";

export interface PrescriptionCompilationContextFacts {
  readonly familiarity: PrescriptionFamiliarity;
  readonly returnAfterAbsence: boolean;
  readonly painAwareLoadToleranceRegressionPermitted: boolean;
  readonly reliablePriorPerformance: boolean;
  readonly reviewedRegression: boolean;
  readonly adverseResponseSupportsReducedDose: boolean;
  readonly newEquipmentRealization: boolean;
  readonly requiredPreparationDependency: boolean;
  readonly reviewedRangeOrControlDependency: boolean;
  readonly sharedPreparationDependency: boolean;
  readonly successfulBoundedPriorPreparation: boolean;
  readonly requiredActivationDependency: boolean;
  readonly explicitControlRequirement: boolean;
  readonly lowFatigueActivationSuitable: boolean;
  readonly adverseActivationFatigueResponse: boolean;
  readonly mainWorkPreserved: boolean;
  readonly secondaryObjectiveRequired: boolean;
  readonly secondaryWeeklyPriority: boolean;
  readonly secondaryCapacitySupported: boolean;
  readonly secondaryHigherPriorityConflict: boolean;
  readonly secondaryNonRedundantUpstream: boolean;
  readonly accessoryPriority: PrescriptionObjectivePriority;
  readonly accessoryUniquePurposeActive: boolean;
  readonly accessoryCoherencePreserved: boolean;
  readonly overlappingExposureRepresented: boolean;
  readonly firstExposure: boolean;
  readonly insufficientResponseHistory: boolean;
  readonly directObjectiveConfirmedUpstream: boolean;
  readonly allocatedRecoveryResponsibility: boolean;
  readonly successfulBreathResponse: boolean;
  readonly sessionCapacityPreservesMainWork: boolean;
  readonly carryPurpose: "capacity_main" | "accessory";
  readonly stationaryMarchRealization: "count" | "duration";
  readonly reviewedAcclimationBlockCount: 0 | 1 | 2 | null;
  readonly requestedTempoIntent: "natural" | "controlled" | null;
  readonly explicitPowerObjective: "explosive_intent" | "maximal_intent" | null;
  readonly powerIntentPermittedByExerciseKnowledge: boolean;
  readonly assessmentPriorityIds: readonly string[];
  readonly alignmentPriorityIds: readonly string[];
  readonly provenanceRefs: readonly string[];
}

export interface PrescriptionEquipmentRealization {
  readonly realizationId: string;
  readonly status: "available" | "unavailable";
  readonly equipment: EquipmentCapabilities;
  readonly requirementTraces: readonly EquipmentRequirementTrace[];
  readonly missingCapabilityIds: readonly string[];
  readonly evaluatedAt: ISODateTimeString;
}

export interface PriorPrescriptionRealizationEvidence {
  readonly exerciseId: string;
  readonly prescriptionId: string;
  readonly prescriptionRevisionId: string;
  readonly sourceExposureEventId: string;
  readonly doseMode: ExerciseDoseMode;
  readonly plannedDose: ExerciseDose;
  readonly equipmentRealization: PrescriptionEquipmentRealization;
  readonly sideBehavior: PrescriptionSideBehavior | null;
  readonly support: SupportPrescription | null;
  readonly range: RangePrescription | null;
  readonly lever: LeverPrescription | null;
  readonly plannedLoad: LoadTarget | null;
  readonly observedActualLoad: LoadTarget | null;
  readonly plannedEffort: EffortTarget | null;
  readonly actualPerformanceRef: string;
  readonly responseReceiverTrace: TrainingResponseReceiverTrace | null;
  readonly completed: boolean;
  readonly productivelyTolerated: boolean;
  readonly occurredAt: ISODateTimeString;
  readonly exactIncrementStillAvailable: boolean;
  readonly unresolvedLoadRestriction: boolean;
  readonly progressionAssumed: false;
  readonly provenance: EvidenceProvenance;
}

export interface PrescriptionContinuityEvidence {
  readonly exerciseId: string;
  readonly legal: boolean;
  readonly productive: boolean;
  readonly tolerated: boolean;
  readonly assignmentCompatible: boolean;
  readonly equipmentCompatible: boolean;
  readonly requirementCompatible: boolean;
  readonly successfulReExposure: boolean;
  readonly adverseResponseRequiresPrescriptionReview: boolean;
  readonly sourceRefs: readonly string[];
}

export interface CompletedPrescriptionPerformanceReference {
  readonly performanceRecordId: string;
  readonly prescriptionId: string;
  readonly prescriptionRevisionId: string;
  readonly sourceExposureEventId: string;
  readonly actualObserved: true;
  readonly completedAt: ISODateTimeString;
}

export interface ProductionPrescriptionRevision {
  readonly prescriptionRevisionId: string;
  readonly prescriptionId: string;
  readonly sourceExposureEventId: string;
  readonly executionAttemptId: string;
  readonly basedOnRevisionId: string | null;
  readonly reasonCode:
    | "initial_compilation"
    | "policy_revision"
    | "pain_response_requirement"
    | "equipment_availability_change"
    | "coach_review"
    | "athlete_reported_constraint";
  readonly createdAt: ISODateTimeString;
  readonly changedFieldRefs: readonly string[];
  readonly policyRef: PrescriptionPolicyReference;
  readonly unresolvedRequirementRefs: readonly string[];
  readonly provenance: EvidenceProvenance;
}

export interface PrescriptionRevisionSupersession {
  readonly supersededRevisionId: string;
  readonly supersedingRevisionId: string;
  readonly occurredAt: ISODateTimeString;
  readonly reasonCode: ProductionPrescriptionRevision["reasonCode"];
}

export interface ProductionPrescriptionRevisionLedger {
  readonly prescriptionId: string;
  readonly sourceExposureEventId: string;
  readonly executionAttemptId: string;
  readonly revisions: readonly ProductionPrescriptionRevision[];
  readonly supersessions: readonly PrescriptionRevisionSupersession[];
  readonly finalRevisionId: string;
  readonly completedRevisionIds: readonly string[];
}

export interface PrescriptionRevisionContext {
  readonly ledger: ProductionPrescriptionRevisionLedger;
  readonly reasonCode: Exclude<ProductionPrescriptionRevision["reasonCode"], "initial_compilation">;
  readonly changedFieldRefs: readonly string[];
}

export type PrescriptionRestPlacement =
  | "between_sets"
  | "between_preparatory_blocks"
  | "before_developmental_block"
  | "between_developmental_sets"
  | "between_rounds"
  | "between_trips"
  | "between_sides"
  | "after_block";

export interface PrescriptionRestInstruction {
  readonly restInstructionId: string;
  readonly placement: PrescriptionRestPlacement;
  readonly target: RestTarget;
  readonly appliesAfterBlockId?: string;
  readonly appliesBeforeBlockId?: string;
  readonly appliesWithinBlockId?: string;
  readonly provenance: EvidenceProvenance;
}

export interface ProductionPrescriptionDoseBlock {
  readonly blockId: string;
  readonly sourceExposureEventId: string;
  readonly purpose: PrescriptionDoseBlockPurpose;
  readonly dose: ExerciseDose;
  readonly executionStandard: ExecutionStandard;
  readonly restInstructions: readonly PrescriptionRestInstruction[];
  readonly policyRuleRefs: readonly string[];
  readonly requirementRefs: readonly string[];
  readonly unresolvedRequirementRefs: readonly string[];
  readonly contributionClassification: PrescriptionBlockContributionClassification;
  readonly order: PrescriptionDoseBlockOrder;
  readonly provenance: EvidenceProvenance;
}

export const PRESCRIPTION_DURATION_INTERVAL_STATUSES = [
  "fully_determinable_before_sequencing",
  "bounded_before_sequencing",
  "unknown_due_to_repetition_tempo",
  "unknown_due_to_breathing_cadence",
  "unknown_due_to_locomotor_pace",
  "unknown_due_to_step_cadence",
  "unknown_due_to_rest",
  "unknown_due_to_side_transition",
  "unknown_due_to_sequencing",
  "definitely_over_budget",
  "possibly_over_budget",
  "fits_known_prescription_bound",
] as const;

export type PrescriptionDurationIntervalStatus =
  (typeof PRESCRIPTION_DURATION_INTERVAL_STATUSES)[number];

export type PrescriptionDurationUnknownComponent =
  | "repetition_tempo"
  | "breathing_cadence"
  | "locomotor_pace"
  | "step_cadence"
  | "rest"
  | "side_transition"
  | "sequencing_setup"
  | "sequencing_transition"
  | "sequencing_recovery";

export interface PrescriptionDurationInterval {
  readonly knownLowerBoundSeconds: number;
  readonly knownUpperBoundSeconds: number | null;
  readonly unknownComponents: readonly PrescriptionDurationUnknownComponent[];
  readonly status: PrescriptionDurationIntervalStatus;
  readonly provenance: EvidenceProvenance;
}

export type ProductionCompatibilityProjectionStatus =
  | "single_uniform_dose_compatible"
  | "legacy_single_dose_projection_available"
  | "ordered_blocks_required"
  | "no_truthful_single_dose_projection";

export interface ProductionPrescriptionCompatibilityProjection {
  readonly status: ProductionCompatibilityProjectionStatus;
  readonly projectedDose: ExerciseDose | null;
  readonly preservedRestInstructionIds: readonly string[];
  readonly unresolvedRequirementRefs: readonly string[];
  readonly reasonCode: string;
}

export interface ProductionExercisePrescriptionPlan {
  readonly compilerContract: ProductionPrescriptionCompilerContractReference;
  readonly prescriptionId: string;
  readonly prescriptionRevisionId: string;
  readonly sourceExposureEvent: SourceExposureEventIdentity;
  readonly exerciseId: string;
  readonly phaseId: PhaseId;
  readonly doseBlocks: readonly ProductionPrescriptionDoseBlock[];
  readonly restInstructions: readonly PrescriptionRestInstruction[];
  readonly compatibilityProjection: ProductionPrescriptionCompatibilityProjection;
  readonly selectedPolicyRuleRefs: readonly string[];
  readonly requirementRefs: readonly string[];
  readonly unresolvedRequirementRefs: readonly string[];
  readonly durationInterval: PrescriptionDurationInterval;
  readonly executionStandardsByBlockId: Readonly<Record<string, ExecutionStandard>>;
  readonly revisionLedger: ProductionPrescriptionRevisionLedger;
  readonly rationaleReasonCodes: readonly string[];
  readonly provenance: EvidenceProvenance;
}

export interface PrescriptionLoadResolutionTrace {
  readonly status:
    | "EXACT_PRIOR_LOAD_RETAINED"
    | "USER_SELECTED_BY_EFFORT"
    | "BODYWEIGHT"
    | "LOAD_NOT_APPLICABLE"
    | "REVIEWED_REQUIREMENT_APPLIED";
  readonly selectedLoad: LoadTarget;
  readonly exactPriorRejectionReasonCodes: readonly string[];
  readonly automaticProgressionApplied: false;
}

export interface ProductionPrescriptionDecisionTrace {
  readonly trainingReadinessTrace: TrainingReadinessTrace;
  readonly policyResolutionTrace: readonly string[];
  readonly selectedRules: readonly ResolvedPrescriptionPolicyRuleTrace[];
  readonly rejectedRules: readonly RejectedPrescriptionPolicyRuleTrace[];
  readonly overriddenRules: readonly string[];
  readonly conflictTrace: readonly string[];
  readonly legalModeTrace: readonly string[];
  readonly blockStructureTrace: readonly string[];
  readonly loadTrace: PrescriptionLoadResolutionTrace | null;
  readonly effortTrace: readonly string[];
  readonly modifierTrace: readonly string[];
  readonly timingTrace: readonly string[];
  readonly restPlacementTrace: readonly string[];
  readonly durationTrace: readonly string[];
  readonly continuityTrace: readonly string[];
  readonly unresolvedRequirementIds: readonly string[];
  readonly finalReasonCodes: readonly string[];
}

export type ExplicitPrescriptionPolicyInput =
  | ProductionPrescriptionPolicy
  | PrescriptionPolicyReference
  | null;

export interface PrescriptionAssignmentCompilerInput {
  readonly sessionIntent: SessionIntent;
  readonly sessionSkeleton: SessionSkeleton;
  readonly handoff: SessionPrescriptionHandoff;
  readonly assignmentHandoffId: string;
  readonly athlete: AthleteProfile;
  readonly exerciseRegistry: readonly ExerciseDefinition[];
  readonly exerciseKnowledgeRegistry: readonly ExercisePrescriptionKnowledgeProfile[];
  readonly currentEquipment: EquipmentCapabilities;
  readonly trainingReadiness: TrainingReadinessTrace;
  readonly executionRequirements: readonly PrescriptionExecutionRequirement[];
  readonly context: PrescriptionCompilationContextFacts;
  readonly continuityEvidence: PrescriptionContinuityEvidence | null;
  readonly priorRealizationEvidence: PriorPrescriptionRealizationEvidence | null;
  readonly completedPerformanceReferences: readonly CompletedPrescriptionPerformanceReference[];
  readonly responseReceiverEvidence: readonly TrainingResponseReceiverTrace[];
  readonly executionAttemptId: string;
  readonly evaluationTime: ISODateTimeString;
  readonly policy: ExplicitPrescriptionPolicyInput;
  readonly availablePolicies?: readonly ProductionPrescriptionPolicy[];
  readonly revisionContext: PrescriptionRevisionContext | null;
}

export interface PrescriptionAssignmentCompilationResult {
  readonly compilerContract: ProductionPrescriptionCompilerContractReference;
  readonly status: ProductionPrescriptionCompilationStatus;
  readonly assignment: SessionExerciseAssignment | null;
  readonly handoffAssignment: SessionPrescriptionAssignmentHandoff | null;
  readonly sourceExposureEvent: SourceExposureEventIdentity | null;
  readonly equipmentRealization: PrescriptionEquipmentRealization | null;
  readonly plan: ProductionExercisePrescriptionPlan | null;
  readonly revisionLedger: ProductionPrescriptionRevisionLedger | null;
  readonly recompositionRequirement: PrescriptionExecutionRequirement | null;
  readonly decisionTrace: ProductionPrescriptionDecisionTrace;
  readonly authority: "PRODUCTION_KERNEL_AUTHORITY";
}

export interface PrescriptionSessionCompilerInput extends Omit<
  PrescriptionAssignmentCompilerInput,
  "assignmentHandoffId" | "context" | "continuityEvidence" | "priorRealizationEvidence" | "revisionContext"
> {
  readonly contextByHandoffId: Readonly<Record<string, PrescriptionCompilationContextFacts>>;
  readonly continuityEvidenceByHandoffId: Readonly<Record<string, PrescriptionContinuityEvidence | null>>;
  readonly priorRealizationEvidenceByHandoffId: Readonly<Record<string, PriorPrescriptionRealizationEvidence | null>>;
  readonly revisionContextByHandoffId: Readonly<Record<string, PrescriptionRevisionContext | null>>;
}

export type CompiledPrescriptionSessionArgumentStatus =
  | "coherent"
  | "blocked_by_training_readiness"
  | "incomplete_due_to_unresolved_requirement"
  | "incoherent_orphan_preparation"
  | "incoherent_missing_required_preparation"
  | "incoherent_main_purpose_lost"
  | "incoherent_accessory_purpose_lost"
  | "incoherent_duplicate_assignment"
  | "incoherent_policy_created_structure"
  | "invalid_session_handoff";

export interface CompiledPrescriptionSessionArgumentTrace {
  readonly status: CompiledPrescriptionSessionArgumentStatus;
  readonly sessionExistsReasonCodes: readonly string[];
  readonly everyPlanMapsToOneSelectedAssignment: boolean;
  readonly everyAssignmentHasOneCompilationResult: boolean;
  readonly warmupPlansServeActiveDependencies: boolean;
  readonly activationPlansServeActiveDependencies: boolean;
  readonly requiredPreparationDependenciesRetained: boolean;
  readonly supportingWorkBoundedCollectively: boolean;
  readonly developmentalMainWorkPresent: boolean;
  readonly prescriptionErasedUpstreamPurpose: boolean;
  readonly accessoriesRetainAllocatedPurpose: boolean;
  readonly cooldownExplicitlyAllocatedOrAbsent: boolean;
  readonly policyAddedStructure: boolean;
  readonly policyRemovedStructure: boolean;
  readonly sourceEventsUnique: boolean;
  readonly unresolvedRequirementIds: readonly string[];
  readonly finalDurationSequencingDependent: true;
  readonly reasonCodes: readonly string[];
}

export interface PrescriptionSupportingWorkAggregate {
  readonly warmupAssignmentCount: number;
  readonly activationAssignmentCount: number;
  readonly preparationBlockCount: number;
  readonly activationBlockCount: number;
  readonly totalSupportingSetRoundTripRange: readonly [number, number];
  readonly unresolvedDurationComponents: readonly PrescriptionDurationUnknownComponent[];
  readonly mainDevelopmentalBlockCount: number;
  readonly mainWorkRemainsPresent: boolean;
  readonly preparationDependenciesCovered: boolean;
  readonly duplicateDependencyIds: readonly string[];
  readonly sharedSupportingAssignmentIds: readonly string[];
  readonly structuralContradictionCount: number;
}

export interface PrescriptionSessionCompilationResult {
  readonly compilerContract: ProductionPrescriptionCompilerContractReference;
  readonly status:
    | "compiled"
    | "blocked_by_training_readiness"
    | "incomplete"
    | "invalid_session_handoff";
  readonly assignmentResults: readonly PrescriptionAssignmentCompilationResult[];
  readonly plans: readonly ProductionExercisePrescriptionPlan[];
  readonly sourceExposureEvents: readonly SourceExposureEventIdentity[];
  readonly sessionDurationInterval: PrescriptionDurationInterval;
  readonly completeSessionArgument: CompiledPrescriptionSessionArgumentTrace;
  readonly supportingWorkAggregate: PrescriptionSupportingWorkAggregate;
  readonly authority: "PRODUCTION_KERNEL_AUTHORITY";
}

export interface ProductionPrescriptionValidationFinding {
  readonly severity: "error" | "warning";
  readonly code: string;
  readonly targetId?: string;
}

export function structuralCapacityFromIntent(
  intent: SessionIntent,
): StructuralCapacityMode {
  return intent.structuralCapacity;
}
