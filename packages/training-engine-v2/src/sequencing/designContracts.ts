import type { ISODateTimeString } from "../prescription/types";
import type {
  SessionIntent,
  SessionNeedPriority,
  SessionSection,
  TrainingRole,
} from "../domain/session";
import type {
  CanonicalCompositionFact,
  SessionExerciseAssignment,
  SessionSequencingInput,
  SessionSkeleton,
} from "../sessionComposer/contracts";
import type {
  PrescriptionEquipmentRealization,
  PrescriptionRestInstruction,
  PrescriptionSessionCompilationResult,
  ProductionPrescriptionDoseBlock,
} from "../prescription/compiler/contracts";
import type { EquipmentCapabilities } from "../domain/equipment";

export const FINAL_SESSION_SEQUENCING_DESIGN_CONTRACT = Object.freeze({
  contractId: "FINAL_SESSION_SEQUENCING_DESIGN",
  contractVersion: "1.0.0",
  authority: "DESIGN_EVIDENCE_ONLY",
  productionKernelImplemented: false,
  productionActivated: false,
} as const);

export const SESSION_SEQUENCING_POLICY_V1_REFERENCE = Object.freeze({
  policyId: "SESSION_SEQUENCING_POLICY_V1_CAUSAL_SEQUENTIAL",
  version: "1.0.0",
  state: "OWNER_SELECTED_FOR_FINAL_CAGT_ADMISSION_NOT_PRODUCTION",
} as const);

export const FINAL_SESSION_SECTION_PRECEDENCE = Object.freeze([
  "warmup",
  "activation",
  "main",
  "accessory",
  "cooldown",
] as const satisfies readonly SessionSection[]);

export const FINAL_SESSION_SEQUENCING_PHILOSOPHY = Object.freeze([
  "HARD_DEPENDENCIES_FIRST",
  "DOMINANT_PURPOSE_PRESERVED",
  "SUPPORTING_WORK_CONTEXTUAL",
  "FATIGUE_INTERFERENCE_BOUNDED",
  "SETUP_EFFICIENCY_LATE",
  "NO_INVENTED_TIME",
  "SEQUENTIAL_ONLY",
  "NO_ARTIFICIAL_ORDER_VARIATION",
] as const);

export const FINAL_SESSION_SEQUENCING_EXECUTION_MODE =
  "SEQUENTIAL_ASSIGNMENT_EXECUTION_ONLY" as const;
export const FINAL_SESSION_PAIRING_DISPOSITION =
  "SESSION_PAIRING_AND_SUPERSET_POLICY_REVIEW" as const;

export type FinalSessionSequencingPlanStatus =
  | "exact_optimal"
  | "bounded_optimality_not_proven"
  | "search_inconclusive"
  | "infeasible"
  | "blocked_by_training_safety"
  | "incomplete_due_to_unresolved_prescription";

export type SequencingSetupRelationship =
  | "same_setup"
  | "compatible_setup"
  | "setup_change_required"
  | "equipment_change_required"
  | "support_change_required"
  | "location_change_required"
  | "unknown";

export type SequencingTransitionInstructionType =
  | "setup"
  | "recovery"
  | "section_boundary"
  | "unknown";

export type SequencingTransitionTarget =
  | { readonly kind: "exact"; readonly seconds: number }
  | { readonly kind: "range"; readonly minimumSeconds: number; readonly maximumSeconds: number }
  | { readonly kind: "unknown"; readonly reasonCode: string }
  | { readonly kind: "not_prescribed"; readonly reasonCode: string };

export type SequencedSessionDurationStatus =
  | "fully_determinable"
  | "bounded"
  | "unknown_due_to_prescription"
  | "unknown_due_to_setup_transition"
  | "unknown_due_to_interexercise_recovery"
  | "unknown_due_to_section_transition"
  | "definitely_over_budget"
  | "possibly_over_budget"
  | "fits_known_bound";

export interface SequencingPolicyReference {
  readonly policyId: typeof SESSION_SEQUENCING_POLICY_V1_REFERENCE.policyId;
  readonly version: typeof SESSION_SEQUENCING_POLICY_V1_REFERENCE.version;
}

export interface ExplicitSequencingTimingFact {
  readonly factId: string;
  readonly fromExerciseId: string | null;
  readonly toExerciseId: string | null;
  readonly instructionType: SequencingTransitionInstructionType;
  readonly target: SequencingTransitionTarget;
  readonly sourceOwner: "equipment_product_adapter" | "reviewed_sequencing_policy";
  readonly provenanceRefs: readonly string[];
}

export interface FinalSessionSequencingInput {
  readonly designContract: typeof FINAL_SESSION_SEQUENCING_DESIGN_CONTRACT;
  readonly policy: SequencingPolicyReference;
  readonly intent: SessionIntent;
  readonly skeleton: SessionSkeleton;
  readonly sequencingHandoff: SessionSequencingInput;
  readonly prescriptionSession: PrescriptionSessionCompilationResult;
  readonly compositionFacts: readonly CanonicalCompositionFact[];
  readonly currentEquipment: EquipmentCapabilities;
  readonly equipmentRealizations: readonly PrescriptionEquipmentRealization[];
  readonly explicitTimingFacts: readonly ExplicitSequencingTimingFact[];
  readonly availableMinutes: number;
  readonly trainingSafetyStatus: "clear" | "blocked";
  readonly unresolvedTrainingSafetyRefs: readonly string[];
  readonly evaluationTime: ISODateTimeString;
  readonly executionAttemptId: string;
}

export interface SequencingAssignmentFact {
  readonly assignmentId: string;
  readonly exerciseId: string;
  readonly section: SessionSection;
  readonly role: TrainingRole;
  readonly sourceExposureEventId: string;
  readonly prescriptionId: string;
  readonly prescriptionRevisionId: string;
  readonly orderedBlockIds: readonly string[];
  readonly doseBlocks: readonly ProductionPrescriptionDoseBlock[];
  readonly withinExerciseRestInstructions: readonly PrescriptionRestInstruction[];
  readonly satisfiedNeedIds: readonly string[];
  readonly dependencyExerciseIds: readonly string[];
  readonly dependencyIds: readonly string[];
  readonly needPriorities: readonly SessionNeedPriority[];
  readonly plannerPriorityOrders: readonly number[];
  readonly dominantPurposeRelation: "dominant" | "supporting" | "none";
  readonly continuityClassification: SessionExerciseAssignment["continuityClassification"];
  readonly executionReadiness: "ready" | "unresolved";
  readonly unresolvedRequirementRefs: readonly string[];
  readonly setupSignature: string;
  readonly supportSignature: string;
  readonly resistancePathSignature: string;
  readonly equipmentRealizationId: string;
  readonly localFatigue: string;
  readonly systemicFatigue: string;
  readonly axialLoading: string;
  readonly intrinsicStressTags: readonly string[];
  readonly potentialStressTags: readonly string[];
  readonly gripLoadingPotential: "low" | "moderate" | "high" | "unknown";
  readonly trunkBracingPotential: "low" | "moderate" | "high" | "unknown";
  readonly prescriptionEffortFacts: readonly unknown[];
  readonly prescriptionDurationLowerBoundSeconds: number;
  readonly prescriptionDurationUpperBoundSeconds: number | null;
  readonly provenanceRefs: readonly string[];
}

export interface SequencingTransitionFact {
  readonly transitionId: string;
  readonly fromAssignmentId: string;
  readonly toAssignmentId: string;
  readonly fromExerciseId: string;
  readonly toExerciseId: string;
  readonly sectionRelationship: "same_section" | "section_boundary";
  readonly dependencyRelationship: "direct_dependency" | "no_direct_dependency";
  readonly crossesSectionBoundary: boolean;
  readonly dependencyIds: readonly string[];
  readonly setupRelationship: SequencingSetupRelationship;
  readonly equipmentRelationship: "same" | "changed" | "unknown";
  readonly supportRelationship: "same" | "changed" | "unknown";
  readonly resistancePathRelationship: "same" | "changed" | "unknown";
  readonly fatigueRelationship: "compatible" | "potential_interference" | "unknown";
  readonly explicitSetupTimingFactId: string | null;
  readonly explicitRecoveryTimingFactId: string | null;
  readonly explicitSectionTimingFactId: string | null;
  readonly unknowns: readonly string[];
  readonly provenanceRefs: readonly string[];
}

export interface InterExerciseTransitionInstruction {
  readonly instructionId: string;
  readonly transitionId: string;
  readonly type: SequencingTransitionInstructionType;
  readonly target: SequencingTransitionTarget;
  readonly sourceTimingFactId: string | null;
  readonly countedInDurationExactlyOnce: true;
  readonly provenanceRefs: readonly string[];
}

export interface SequencedSessionDurationInterval {
  readonly knownLowerBoundSeconds: number;
  readonly knownUpperBoundSeconds: number | null;
  readonly availableSeconds: number;
  readonly status: SequencedSessionDurationStatus;
  readonly unknownComponents: readonly string[];
  readonly prescriptionIntervalRefs: readonly string[];
  readonly transitionInstructionIds: readonly string[];
  readonly noInventedTime: true;
  readonly provenanceRefs: readonly string[];
}

export interface SequencedAssignmentStep {
  readonly assignmentId: string;
  readonly exerciseId: string;
  readonly sequenceIndex: number;
  readonly section: SessionSection;
  readonly role: TrainingRole;
  readonly sourceExposureEventId: string;
  readonly prescriptionId: string;
  readonly prescriptionRevisionId: string;
  readonly doseBlockIds: readonly string[];
  readonly satisfiedNeedIds: readonly string[];
  readonly dependencyExerciseIds: readonly string[];
  readonly executionReadiness: SequencingAssignmentFact["executionReadiness"];
  readonly reasonCodes: readonly string[];
  readonly provenanceRefs: readonly string[];
}

export interface SequencedSectionBoundary {
  readonly boundaryId: string;
  readonly section: SessionSection;
  readonly firstSequenceIndex: number | null;
  readonly lastSequenceIndex: number | null;
  readonly empty: boolean;
}

export interface FinalSessionSequenceSearchTrace {
  readonly mode: "exhaustive" | "bounded_frontier";
  readonly completeness: FinalSessionSequencingPlanStatus;
  readonly legalOrdersEvaluated: number;
  readonly statesExpanded: number;
  readonly statesPruned: number;
  readonly optimalityProven: boolean;
  readonly deterministicSeed: number;
  readonly canonicalTieBreakApplied: boolean;
}

export interface FinalSessionSequencePlan {
  readonly designContract: typeof FINAL_SESSION_SEQUENCING_DESIGN_CONTRACT;
  readonly policy: SequencingPolicyReference;
  readonly sessionIntentId: string;
  readonly executionAttemptId: string;
  readonly status: FinalSessionSequencingPlanStatus;
  readonly steps: readonly SequencedAssignmentStep[];
  readonly sectionBoundaries: readonly SequencedSectionBoundary[];
  readonly transitionFacts: readonly SequencingTransitionFact[];
  readonly transitionInstructions: readonly InterExerciseTransitionInstruction[];
  readonly sourceExposureEventIds: readonly string[];
  readonly prescriptionIds: readonly string[];
  readonly prescriptionRevisionIds: readonly string[];
  readonly assignmentPreservation: {
    readonly addedCount: number;
    readonly removedCount: number;
    readonly duplicateCount: number;
  };
  readonly dependencyViolationCount: number;
  readonly sectionViolationCount: number;
  readonly purposePreserved: boolean;
  readonly fatigueInterferenceReasonCodes: readonly string[];
  readonly setupReasonCodes: readonly string[];
  readonly unresolvedRequirementRefs: readonly string[];
  readonly duration: SequencedSessionDurationInterval;
  readonly search: FinalSessionSequenceSearchTrace;
  readonly decisionTrace: readonly string[];
  readonly compatibilityProjection: {
    readonly orderedExerciseIds: readonly string[];
    readonly groupedExecution: false;
    readonly unresolvedRequirementRefs: readonly string[];
    readonly nonCanonical: true;
  };
}
