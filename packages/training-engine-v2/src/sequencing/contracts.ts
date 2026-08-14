import type { EquipmentCapabilities } from "../domain/equipment";
import type { DemandLevel, JointStressTag } from "../domain/primitives";
import type {
  SessionContinuityClassification,
  SessionExerciseAssignment,
  SessionSequencingInput,
  SessionSkeleton,
  CanonicalCompositionFact,
} from "../sessionComposer/contracts";
import type {
  SessionIntent,
  SessionNeedPriority,
  SessionSection,
  TrainingRole,
} from "../domain/session";
import type { TrainingReadinessTrace } from "../domain/trainingSafety";
import type { EffortTarget } from "../prescription/executionStandard";
import type {
  PrescriptionDurationInterval,
  PrescriptionEquipmentRealization,
  PrescriptionSessionCompilationResult,
} from "../prescription/compiler/contracts";
import type { EvidenceProvenance, ISODateTimeString } from "../prescription/types";
import type {
  ExplicitFinalSessionSequencingPolicyInput,
  FinalSessionSequencingPolicyReference,
  ProductionFinalSessionSequencingPolicy,
} from "./policies/contracts";

export const PRODUCTION_FINAL_SESSION_SEQUENCING_STATUS =
  "PRODUCTION_FINAL_SESSION_SEQUENCING_KERNEL_IMPLEMENTED_NOT_ACTIVATED" as const;
export const PRODUCTION_FINAL_SESSION_SEQUENCING_CONTRACT_ID =
  "PRODUCTION_FINAL_SESSION_SEQUENCING_KERNEL" as const;
export const PRODUCTION_FINAL_SESSION_SEQUENCING_CONTRACT_VERSION = "1.0.0" as const;

export interface ProductionFinalSessionSequencingContractReference {
  readonly contractId: typeof PRODUCTION_FINAL_SESSION_SEQUENCING_CONTRACT_ID;
  readonly contractVersion: typeof PRODUCTION_FINAL_SESSION_SEQUENCING_CONTRACT_VERSION;
}

export const PRODUCTION_FINAL_SESSION_SEQUENCING_CONTRACT_REFERENCE:
  ProductionFinalSessionSequencingContractReference = Object.freeze({
    contractId: PRODUCTION_FINAL_SESSION_SEQUENCING_CONTRACT_ID,
    contractVersion: PRODUCTION_FINAL_SESSION_SEQUENCING_CONTRACT_VERSION,
  });

export const FINAL_SEQUENCING_SEARCH_RESOURCE_POLICY_ID =
  "FINAL_SEQUENCING_EXACT_SEARCH_RESOURCE_POLICY" as const;
export const FINAL_SEQUENCING_SEARCH_RESOURCE_POLICY_VERSION = "1.0.0" as const;

export interface FinalSequencingSearchResourcePolicyReference {
  readonly policyId: string;
  readonly version: string;
}

export interface FinalSequencingSearchResourcePolicy {
  readonly policyId: typeof FINAL_SEQUENCING_SEARCH_RESOURCE_POLICY_ID;
  readonly version: typeof FINAL_SEQUENCING_SEARCH_RESOURCE_POLICY_VERSION;
  readonly mode: "exact_only";
  readonly maximumStatesExpanded: number;
  readonly maximumLegalCompleteOrdersEvaluated: number;
  readonly onLimit: "RETURN_SEARCH_INCONCLUSIVE";
  readonly provenance: EvidenceProvenance;
}

export type ExplicitFinalSequencingSearchResourcePolicyInput =
  | FinalSequencingSearchResourcePolicy
  | FinalSequencingSearchResourcePolicyReference
  | null;

export const PRODUCTION_FINAL_SESSION_SEQUENCING_STATUSES = [
  "sequenced_exact_optimal",
  "blocked_by_training_readiness",
  "incomplete_due_to_unresolved_prescription",
  "sequencing_policy_required",
  "sequencing_policy_unavailable",
  "sequencing_policy_conflict",
  "sequencing_search_policy_required",
  "sequencing_search_policy_unavailable",
  "search_inconclusive",
  "ordering_infeasible",
  "invalid_session_input",
  "invalid_session_handoff",
  "unsupported_sequencing_contract_version",
  "unsupported_prescription_compiler_contract_version",
  "transition_fact_conflict",
  "invalid_sequence_revision_context",
] as const;

export type ProductionFinalSessionSequencingStatus =
  (typeof PRODUCTION_FINAL_SESSION_SEQUENCING_STATUSES)[number];

export type SequencingTransitionSourceOwner =
  | "equipment_product_adapter"
  | "reviewed_sequencing_policy"
  | "coach_review"
  | "athlete_explicit_fact"
  | "unknown";

export type SequencingTransitionReviewState =
  | "reviewed"
  | "confirmed"
  | "reported"
  | "unknown";

export const SEQUENCING_SETUP_RELATIONSHIPS = [
  "same_setup",
  "compatible_setup",
  "setup_change_required",
  "equipment_change_required",
  "support_change_required",
  "location_change_required",
  "unknown",
] as const;

export type ProductionSequencingSetupRelationship =
  (typeof SEQUENCING_SETUP_RELATIONSHIPS)[number];

export type ProductionSequencingTransitionTarget =
  | { readonly kind: "exact"; readonly seconds: number }
  | { readonly kind: "range"; readonly minimumSeconds: number; readonly maximumSeconds: number }
  | { readonly kind: "unknown"; readonly reasonCode: string }
  | { readonly kind: "not_prescribed"; readonly reasonCode: string };

export type ExplicitSequencingTransitionFactType =
  | "setup_relationship"
  | "equipment_relationship"
  | "support_relationship"
  | "resistance_path_relationship"
  | "location_relationship"
  | "interference"
  | "setup_duration"
  | "inter_exercise_recovery"
  | "section_boundary_duration"
  | "unknown_transition_component";

export type ExplicitSequencingTransitionFactTarget =
  | { readonly kind: "setup_relationship"; readonly value: ProductionSequencingSetupRelationship }
  | { readonly kind: "relationship"; readonly value: "same" | "changed" | "unknown" }
  | { readonly kind: "location_relationship"; readonly value: "same" | "changed" | "unknown" }
  | {
    readonly kind: "interference";
    readonly value: {
      readonly dimension: SequencingInterferenceDimension;
      readonly classification: SequencingInterferenceClassification;
      readonly basis: readonly string[];
      readonly affectedActiveNeedIds: readonly string[];
    };
  }
  | { readonly kind: "timing"; readonly value: ProductionSequencingTransitionTarget }
  | { readonly kind: "unknown_component"; readonly reasonCode: string };

export interface ExplicitProductionSequencingTransitionFact {
  readonly sequencingContract: ProductionFinalSessionSequencingContractReference;
  readonly transitionFactId: string;
  readonly fromAssignmentId: string;
  readonly toAssignmentId: string;
  readonly executionAttemptId: string;
  readonly factType: ExplicitSequencingTransitionFactType;
  readonly sourceOwner: SequencingTransitionSourceOwner;
  readonly sourceRef: string;
  readonly reviewState: SequencingTransitionReviewState;
  readonly target: ExplicitSequencingTransitionFactTarget;
  readonly provenance: EvidenceProvenance;
}

export type SequencingLoadingClassification = DemandLevel | "unknown";

export interface ProductionSequencingAssignmentFact {
  readonly sequencingContract: ProductionFinalSessionSequencingContractReference;
  readonly assignmentId: string;
  readonly exerciseId: string;
  readonly section: SessionSection;
  readonly role: TrainingRole;
  readonly sourceExposureEventId: string;
  readonly prescriptionId: string;
  readonly finalPrescriptionRevisionId: string;
  readonly orderedDoseBlockIds: readonly string[];
  readonly withinExerciseRestInstructionIds: readonly string[];
  readonly satisfiedNeedIds: readonly string[];
  readonly dependencyAssignmentIds: readonly string[];
  readonly dependencyIds: readonly string[];
  readonly needPriorities: readonly SessionNeedPriority[];
  readonly plannerPriorityOrders: readonly number[];
  readonly requiredDirectObjective: boolean;
  readonly dominantPurposeRelationship: "dominant" | "supporting" | "none";
  readonly continuityClassification: SessionContinuityClassification;
  readonly executionReadiness: "ready" | "unresolved";
  readonly unresolvedRequirementIds: readonly string[];
  readonly setupSignature: string;
  readonly supportSignature: string;
  readonly resistancePathSignature: string;
  readonly equipmentRealizationId: string;
  readonly equipmentSignature: string;
  readonly localFatigue: SequencingLoadingClassification;
  readonly systemicFatigue: SequencingLoadingClassification;
  readonly axialLoading: SequencingLoadingClassification;
  readonly intrinsicStressFacts: readonly JointStressTag[];
  readonly potentialStressFacts: readonly JointStressTag[];
  readonly gripLoadingPotential: SequencingLoadingClassification;
  readonly trunkBracingPotential: SequencingLoadingClassification;
  readonly prescriptionEffortFacts: readonly EffortTarget[];
  readonly prescriptionDurationInterval: PrescriptionDurationInterval;
  readonly provenance: readonly EvidenceProvenance[];
}

export type SequencingInterferenceDimension =
  | "local_fatigue_overlap"
  | "systemic_fatigue"
  | "axial_loading"
  | "grip_loading"
  | "trunk_bracing"
  | "repeated_joint_stress"
  | "unresolved_prescription_burden";

export type SequencingInterferenceClassification =
  | "no_known_interference"
  | "potential_interference"
  | "reviewed_interference"
  | "unknown";

export interface SequencingInterferenceObservation {
  readonly observationId: string;
  readonly precedingAssignmentId: string;
  readonly protectedAssignmentId: string;
  readonly dimension: SequencingInterferenceDimension;
  readonly basis: readonly string[];
  readonly classification: SequencingInterferenceClassification;
  readonly affectedActiveNeedIds: readonly string[];
  readonly reviewState: SequencingTransitionReviewState;
  readonly provenance: readonly EvidenceProvenance[];
}

export interface ProductionSequencingTransitionFact {
  readonly sequencingContract: ProductionFinalSessionSequencingContractReference;
  readonly transitionFactId: string;
  readonly fromAssignmentId: string;
  readonly toAssignmentId: string;
  readonly executionAttemptId: string;
  readonly sectionRelationship: "same_section" | "section_boundary";
  readonly dependencyRelationship: "direct_dependency" | "no_direct_dependency";
  readonly dependencyIds: readonly string[];
  readonly setupRelationship: ProductionSequencingSetupRelationship;
  readonly equipmentRelationship: "same" | "changed" | "unknown";
  readonly supportRelationship: "same" | "changed" | "unknown";
  readonly resistancePathRelationship: "same" | "changed" | "unknown";
  readonly locationRelationship: "same" | "changed" | "unknown";
  readonly interferenceObservations: readonly SequencingInterferenceObservation[];
  readonly explicitTimingFactIds: readonly string[];
  readonly unknownTimingComponents: readonly string[];
  readonly provenance: readonly EvidenceProvenance[];
}

export type ProductionInterExerciseTransitionInstructionType =
  | "setup"
  | "recovery"
  | "section_boundary"
  | "unknown";

export interface ProductionInterExerciseTransitionInstruction {
  readonly sequencingContract: ProductionFinalSessionSequencingContractReference;
  readonly instructionId: string;
  readonly transitionFactId: string;
  readonly type: ProductionInterExerciseTransitionInstructionType;
  readonly target: ProductionSequencingTransitionTarget;
  readonly sourceTransitionFactId: string | null;
  readonly countedInDurationExactlyOnce: true;
  readonly provenance: readonly EvidenceProvenance[];
}

export const FINAL_SEQUENCED_SESSION_DURATION_STATUSES = [
  "fully_determinable",
  "bounded",
  "unknown_due_to_prescription",
  "unknown_due_to_setup_transition",
  "unknown_due_to_interexercise_recovery",
  "unknown_due_to_section_transition",
  "definitely_over_budget",
  "possibly_over_budget",
  "fits_known_bound",
] as const;

export type FinalSequencedSessionDurationStatus =
  (typeof FINAL_SEQUENCED_SESSION_DURATION_STATUSES)[number];

export interface FinalSequencedSessionDurationInterval {
  readonly sequencingContract: ProductionFinalSessionSequencingContractReference;
  readonly knownLowerBoundSeconds: number;
  readonly knownUpperBoundSeconds: number | null;
  readonly availableSeconds: number;
  readonly status: FinalSequencedSessionDurationStatus;
  readonly unknownComponents: readonly string[];
  readonly prescriptionIntervalRefs: readonly string[];
  readonly transitionInstructionIds: readonly string[];
  readonly timingFactReuseCount: number;
  readonly noInventedTime: true;
  readonly provenance: readonly EvidenceProvenance[];
}

export interface ProductionFinalSessionSequencingInput {
  readonly sequencingContract: ProductionFinalSessionSequencingContractReference;
  readonly policy: ExplicitFinalSessionSequencingPolicyInput;
  readonly availablePolicies?: readonly ProductionFinalSessionSequencingPolicy[];
  readonly intent: SessionIntent;
  readonly skeleton: SessionSkeleton;
  readonly sequencingHandoff: SessionSequencingInput;
  readonly prescriptionSession: PrescriptionSessionCompilationResult;
  readonly compositionFacts: readonly CanonicalCompositionFact[];
  readonly currentEquipment: EquipmentCapabilities;
  readonly equipmentRealizations: readonly PrescriptionEquipmentRealization[];
  readonly explicitTransitionFacts: readonly ExplicitProductionSequencingTransitionFact[];
  readonly availableMinutes: number;
  readonly trainingReadiness: TrainingReadinessTrace;
  readonly executionAttemptId: string;
  readonly evaluationTime: ISODateTimeString;
  readonly searchResourcePolicy: ExplicitFinalSequencingSearchResourcePolicyInput;
  readonly availableSearchResourcePolicies?: readonly FinalSequencingSearchResourcePolicy[];
  readonly revisionContext: FinalSessionSequenceRevisionContext | null;
}

export interface ProductionSequencedAssignmentStep {
  readonly sequenceIndex: number;
  readonly assignmentId: string;
  readonly exerciseId: string;
  readonly section: SessionSection;
  readonly role: TrainingRole;
  readonly sourceExposureEventId: string;
  readonly prescriptionId: string;
  readonly finalPrescriptionRevisionId: string;
  readonly orderedDoseBlockIds: readonly string[];
  readonly satisfiedNeedIds: readonly string[];
  readonly dependencyAssignmentIds: readonly string[];
  readonly executionReadiness: ProductionSequencingAssignmentFact["executionReadiness"];
  readonly sideOrder: "SIDE_ORDER_NOT_PRESCRIBED";
  readonly reasonCodes: readonly string[];
  readonly provenance: readonly EvidenceProvenance[];
}

export interface ProductionSequencedSectionBoundary {
  readonly section: SessionSection;
  readonly empty: boolean;
  readonly firstStepIndex: number | null;
  readonly lastStepIndex: number | null;
  readonly priorAssignmentId: string | null;
  readonly nextAssignmentId: string | null;
  readonly transitionFactId: string | null;
  readonly unknownDurationComponents: readonly string[];
  readonly reasonCode: string;
}

export interface FinalSequencingIntegrityTrace {
  readonly assignmentAdditionCount: number;
  readonly assignmentRemovalCount: number;
  readonly duplicateAssignmentCount: number;
  readonly sourceEventRewriteCount: number;
  readonly prescriptionIdRewriteCount: number;
  readonly prescriptionRevisionRewriteCount: number;
  readonly blockReorderCount: number;
  readonly blockInterleavingCount: number;
  readonly dependencyViolationCount: number;
  readonly sectionViolationCount: number;
  readonly mainPurposeLossCount: number;
  readonly accessoryPurposeLossCount: number;
  readonly policyCreatedStructureCount: number;
  readonly restOverwriteCount: number;
  readonly timingFactReuseCount: number;
  readonly fakeDurationCount: number;
  readonly hardFailureCount: number;
}

export interface FinalSequencingAssignmentPreservationTrace {
  readonly expectedAssignmentIds: readonly string[];
  readonly orderedAssignmentIds: readonly string[];
  readonly additionCount: number;
  readonly removalCount: number;
  readonly duplicateCount: number;
}

export interface FinalSequencingDependencyTrace {
  readonly dependenciesByAssignmentId: Readonly<Record<string, readonly string[]>>;
  readonly violationCount: number;
}

export interface FinalSequencingBlockAtomicityTrace {
  readonly orderedBlockIdsByAssignmentId: Readonly<Record<string, readonly string[]>>;
  readonly reorderCount: number;
  readonly interleavingCount: number;
}

export interface FinalSequencingPurposePreservationTrace {
  readonly dominantAssignmentIds: readonly string[];
  readonly preserved: boolean;
  readonly lossCount: number;
}

export interface FinalSequencingSupportingWorkTrace {
  readonly supportingAssignmentIds: readonly string[];
  readonly preserved: boolean;
  readonly lossCount: number;
}

export interface FinalSequencingSearchTrace {
  readonly mode: "exact_only";
  readonly resourcePolicyRef: FinalSequencingSearchResourcePolicyReference;
  readonly statesExpanded: number;
  readonly statesPruned: number;
  readonly legalCompleteOrdersEvaluated: number;
  readonly limitReached: boolean;
  readonly optimalityProven: boolean;
  readonly pruningReasonCounts: Readonly<Record<string, number>>;
  readonly canonicalExpansionOrderApplied: true;
}

export interface FinalSequencingDiagnosticBestOrder {
  readonly assignmentIds: readonly string[];
  readonly executable: false;
  readonly optimalityProven: false;
}

export interface FinalSequencingDecisionTrace {
  readonly inputValidation: readonly string[];
  readonly contractVersion: readonly string[];
  readonly policyResolution: readonly string[];
  readonly searchPolicyResolution: readonly string[];
  readonly assignmentMapping: readonly string[];
  readonly sourceEventPreservation: readonly string[];
  readonly revisionPreservation: readonly string[];
  readonly blockAtomicity: readonly string[];
  readonly dependency: readonly string[];
  readonly section: readonly string[];
  readonly dominantPurpose: readonly string[];
  readonly plannerPriority: readonly string[];
  readonly warmupActivation: readonly string[];
  readonly mainAccessory: readonly string[];
  readonly interference: readonly string[];
  readonly setupTransition: readonly string[];
  readonly transitionFact: readonly string[];
  readonly duration: readonly string[];
  readonly unresolvedRequirement: readonly string[];
  readonly search: readonly string[];
  readonly compatibility: readonly string[];
  readonly finalReasonCodes: readonly string[];
}

export interface FinalSessionSequenceCompatibilityProjection {
  readonly orderedExerciseIds: readonly string[];
  readonly orderedExerciseIdsBySection: Readonly<Record<SessionSection, readonly string[]>>;
  readonly executionMode: "SEQUENTIAL_ASSIGNMENT_EXECUTION_ONLY";
  readonly pairing: false;
  readonly unresolvedTransitionFactIds: readonly string[];
  readonly durationStatus: FinalSequencedSessionDurationStatus;
  readonly nonCanonical: true;
}

export type FinalSessionSequenceRevisionReasonCode =
  | "initial_sequence"
  | "prescription_revision"
  | "equipment_transition_update"
  | "explicit_timing_fact_update"
  | "policy_revision"
  | "coach_review"
  | "athlete_reported_constraint";

export interface ProductionFinalSequenceRevision {
  readonly sequencingContract: ProductionFinalSessionSequencingContractReference;
  readonly sequenceRevisionId: string;
  readonly sequencePlanId: string;
  readonly executionAttemptId: string;
  readonly basedOnRevisionId: string | null;
  readonly reasonCode: FinalSessionSequenceRevisionReasonCode;
  readonly createdAt: ISODateTimeString;
  readonly changedFieldRefs: readonly string[];
  readonly policyRef: FinalSessionSequencingPolicyReference;
  readonly finalPrescriptionRevisionIds: readonly string[];
  readonly transitionFactIds: readonly string[];
  readonly searchResourcePolicyRef: FinalSequencingSearchResourcePolicyReference;
  readonly provenance: readonly EvidenceProvenance[];
  readonly revisionContentFingerprint: string;
}

export interface FinalSequenceRevisionSupersession {
  readonly supersededRevisionId: string;
  readonly supersedingRevisionId: string;
  readonly occurredAt: ISODateTimeString;
  readonly reasonCode: Exclude<FinalSessionSequenceRevisionReasonCode, "initial_sequence">;
}

export interface ProductionFinalSequenceRevisionLedger {
  readonly sequencingContract: ProductionFinalSessionSequencingContractReference;
  readonly sequencePlanId: string;
  readonly executionAttemptId: string;
  readonly revisions: readonly ProductionFinalSequenceRevision[];
  readonly supersessions: readonly FinalSequenceRevisionSupersession[];
  readonly finalRevisionId: string;
  readonly completedRevisionIds: readonly string[];
}

export interface FinalSessionSequenceRevisionContext {
  readonly ledger: ProductionFinalSequenceRevisionLedger;
  readonly reasonCode: Exclude<FinalSessionSequenceRevisionReasonCode, "initial_sequence">;
  readonly changedFieldRefs: readonly string[];
}

export interface ProductionFinalSessionSequencePlan {
  readonly sequencingContract: ProductionFinalSessionSequencingContractReference;
  readonly policyRef: FinalSessionSequencingPolicyReference;
  readonly sequencePlanId: string;
  readonly sequenceRevisionId: string;
  readonly executionAttemptId: string;
  readonly sessionIntentId: string;
  readonly status: "sequenced_exact_optimal";
  readonly executable: true;
  readonly steps: readonly ProductionSequencedAssignmentStep[];
  readonly sectionBoundaries: readonly ProductionSequencedSectionBoundary[];
  readonly consecutiveTransitionFacts: readonly ProductionSequencingTransitionFact[];
  readonly transitionInstructions: readonly ProductionInterExerciseTransitionInstruction[];
  readonly sourceExposureEventIds: readonly string[];
  readonly prescriptionIds: readonly string[];
  readonly finalPrescriptionRevisionIds: readonly string[];
  readonly integrity: FinalSequencingIntegrityTrace;
  readonly assignmentPreservationTrace: FinalSequencingAssignmentPreservationTrace;
  readonly dependencyTrace: FinalSequencingDependencyTrace;
  readonly blockAtomicityTrace: FinalSequencingBlockAtomicityTrace;
  readonly purposePreservationTrace: FinalSequencingPurposePreservationTrace;
  readonly supportingWorkTrace: FinalSequencingSupportingWorkTrace;
  readonly purposePreserved: boolean;
  readonly supportingWorkPreserved: boolean;
  readonly interferenceTrace: readonly SequencingInterferenceObservation[];
  readonly setupTransitionTrace: readonly string[];
  readonly unresolvedRequirementIds: readonly string[];
  readonly duration: FinalSequencedSessionDurationInterval;
  readonly search: FinalSequencingSearchTrace;
  readonly decisionTrace: FinalSequencingDecisionTrace;
  readonly compatibilityProjection: FinalSessionSequenceCompatibilityProjection;
  readonly revisionLedger: ProductionFinalSequenceRevisionLedger;
  readonly provenance: readonly EvidenceProvenance[];
}

export interface FinalSessionSequencingValidationFinding {
  readonly severity: "error" | "warning";
  readonly code: string;
  readonly targetId?: string;
}

export interface ProductionFinalSessionSequencingResult {
  readonly sequencingContract: ProductionFinalSessionSequencingContractReference;
  readonly status: ProductionFinalSessionSequencingStatus;
  readonly policyRef: FinalSessionSequencingPolicyReference | null;
  readonly sequencePlanId: string;
  readonly sequenceRevisionId: string | null;
  readonly plan: ProductionFinalSessionSequencePlan | null;
  readonly diagnosticBestOrder: FinalSequencingDiagnosticBestOrder | null;
  readonly findings: readonly FinalSessionSequencingValidationFinding[];
  readonly decisionTrace: FinalSequencingDecisionTrace;
  readonly authority: "PRODUCTION_KERNEL_AUTHORITY";
  readonly productionActivationStatus: "NOT_ACTIVATED";
}

export interface ValidatedFinalSessionSequencingContext {
  readonly input: ProductionFinalSessionSequencingInput;
  readonly policy: ProductionFinalSessionSequencingPolicy;
  readonly searchResourcePolicy: FinalSequencingSearchResourcePolicy;
  readonly assignments: readonly SessionExerciseAssignment[];
}
