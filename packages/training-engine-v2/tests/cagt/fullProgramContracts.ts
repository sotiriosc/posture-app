import type {
  PrescriptionSessionCompilationResult,
  ProductionFinalSessionSequencePlan,
  ProductionPostPrescriptionWeekInputAuthorityTrace,
  ProductionPostPrescriptionWeekValidationResult,
  ProductionPostPrescriptionWeekValidationRevision,
  PrescribedWeekSourceSnapshot,
  SessionIntent,
  SessionSkeleton,
} from "../../src";
import type {
  CagtClassification,
  CagtAdaptiveRelationship,
  CagtCounterfactualContract,
  CagtFrameworkRelationship,
  CagtGateId,
} from "./contracts";
import type {
  CagtEffectiveAuthorityRegistryReference,
} from "./effectiveAuthorityRegistryV2";

export const FULL_PRESCRIBED_PROGRAM_SNAPSHOT_CONTRACT_ID =
  "FULL_PRESCRIBED_PROGRAM_SNAPSHOT" as const;
export const FULL_PRESCRIBED_PROGRAM_SNAPSHOT_CONTRACT_VERSION = "1.0.0" as const;
export const FULL_PRESCRIBED_PROGRAM_CAGT_GATE_14_CONTRACT_ID =
  "FULL_PRESCRIBED_PROGRAM_CAGT_GATE_14" as const;
export const FULL_PRESCRIBED_PROGRAM_CAGT_GATE_14_CONTRACT_VERSION = "1.0.0" as const;

export const FULL_PRESCRIBED_PROGRAM_SNAPSHOT_CONTRACT_REFERENCE = Object.freeze({
  contractId: FULL_PRESCRIBED_PROGRAM_SNAPSHOT_CONTRACT_ID,
  version: FULL_PRESCRIBED_PROGRAM_SNAPSHOT_CONTRACT_VERSION,
});
export const FULL_PRESCRIBED_PROGRAM_CAGT_GATE_14_CONTRACT_REFERENCE = Object.freeze({
  contractId: FULL_PRESCRIBED_PROGRAM_CAGT_GATE_14_CONTRACT_ID,
  version: FULL_PRESCRIBED_PROGRAM_CAGT_GATE_14_CONTRACT_VERSION,
});

export type FullPrescribedProgramSnapshotId = string;
export type FullPrescribedProgramSnapshotRevisionId = string;

export interface FullProgramUpstreamGateResult {
  readonly gate: Exclude<CagtGateId,
    "gate_14_full_prescribed_program_comparison" | "gate_15_phase_continuity" | "gate_16_longitudinal_adaptation">;
  readonly state: "PASS" | "PASS_WITH_EXPECTED_CONVERGENCE" | "PASS_WITH_JUSTIFIED_CONVERGENCE" | "FAIL_STOP";
  readonly reasonCodes: readonly string[];
  readonly authority: string;
}

export interface FullProgramReservationArtifacts {
  readonly reservationId: string;
  readonly opportunityId: string;
  readonly sessionIntent: SessionIntent;
  readonly sessionSkeleton: SessionSkeleton;
  readonly prescriptionCompilation: PrescriptionSessionCompilationResult;
  readonly finalSequencePlan: ProductionFinalSessionSequencePlan;
}

export interface FullPrescribedProgramSnapshot {
  readonly snapshotContract: typeof FULL_PRESCRIBED_PROGRAM_SNAPSHOT_CONTRACT_REFERENCE;
  readonly snapshotId: FullPrescribedProgramSnapshotId;
  readonly snapshotRevisionId: FullPrescribedProgramSnapshotRevisionId;
  readonly athleteId: string;
  readonly planningHorizonId: string;
  readonly weeklyIntentId: string;
  readonly weekAllocationPlanId: string;
  readonly normalizedWeekSourceSnapshot: PrescribedWeekSourceSnapshot;
  readonly postPrescriptionWeekValidationResult: ProductionPostPrescriptionWeekValidationResult;
  readonly reservationArtifacts: readonly FullProgramReservationArtifacts[];
  readonly sessionIntents: readonly SessionIntent[];
  readonly sessionSkeletons: readonly SessionSkeleton[];
  readonly prescriptionSessionResults: readonly PrescriptionSessionCompilationResult[];
  readonly finalSequencePlans: readonly ProductionFinalSessionSequencePlan[];
  readonly finalValidationRevisions: readonly ProductionPostPrescriptionWeekValidationRevision[];
  readonly upstreamGateResults: readonly FullProgramUpstreamGateResult[];
  readonly evaluationTime: string;
  readonly sourceAuthorityTrace: readonly ProductionPostPrescriptionWeekInputAuthorityTrace[];
  readonly provenance: readonly string[];
}

export const FULL_PROGRAM_ALIGNMENT_STATUSES = [
  "exact_lineage_match",
  "explicit_cross_snapshot_mapping",
  "semantic_equivalent_match",
  "intentionally_unmatched_baseline",
  "intentionally_unmatched_counterfactual",
  "ambiguous_alignment",
  "invalid_alignment",
] as const;
export type FullProgramAlignmentStatus = typeof FULL_PROGRAM_ALIGNMENT_STATUSES[number];
export type FullProgramEntityKind =
  | "weekly_objective"
  | "opportunity"
  | "reservation"
  | "session"
  | "session_need"
  | "assignment"
  | "source_event"
  | "prescription_plan"
  | "sequence_step";

export interface FullProgramEntityAlignmentEntry {
  readonly entityKind: FullProgramEntityKind;
  readonly baselineId: string | null;
  readonly counterfactualId: string | null;
  readonly status: FullProgramAlignmentStatus;
  readonly semanticResponsibilitySignature: string | null;
  readonly reasonCode: string;
}

export interface FullProgramEntityAlignment {
  readonly status: Exclude<FullProgramAlignmentStatus,
    "exact_lineage_match" | "explicit_cross_snapshot_mapping" | "semantic_equivalent_match"> | "aligned";
  readonly entries: readonly FullProgramEntityAlignmentEntry[];
  readonly ambiguousRequiredEntityCount: number;
  readonly invalidEntityCount: number;
  readonly unmatchedBaselineCount: number;
  readonly unmatchedCounterfactualCount: number;
  readonly reasonCodes: readonly string[];
}

export const FULL_PROGRAM_GATE_14_DIFFERENCE_DIMENSIONS = [
  "program_horizon_structure", "prescribed_session_count", "broad_session_framework",
  "dominant_session_distribution", "section_occupancy_pattern", "final_weekly_objectives",
  "objective_priority_distribution", "objective_prescribed_frequency", "objective_execution_feasibility",
  "objective_realization_status", "unsupported_policy_state", "session_responsibility_distribution",
  "session_need_distribution", "selected_assignment_distribution", "exercise_identity_distribution",
  "anchor_distribution", "shared_coverage_distribution", "warmup_dependency_distribution",
  "activation_dependency_distribution", "main_work_distribution", "accessory_distribution",
  "cooldown_distribution", "source_event_distribution", "dose_block_distribution",
  "preparatory_block_distribution", "developmental_block_distribution", "technique_block_distribution",
  "recovery_block_distribution", "dose_mode_distribution", "sets_distribution", "reps_distribution",
  "load_distribution", "effort_distribution", "range_distribution", "support_distribution",
  "side_distribution", "tempo_distribution", "rest_distribution", "duration_distribution",
  "primary_muscle_distribution", "key_secondary_distribution", "direct_action_distribution",
  "movement_role_distribution", "capacity_lane_distribution", "assessment_lane_distribution",
  "recovery_lane_distribution", "final_sequence_distribution", "dependency_order_distribution",
  "transition_state_distribution", "duration_feasibility_distribution",
  "definitely_over_budget_distribution", "unknown_duration_distribution", "stress_exposure_distribution",
  "burden_concentration_distribution", "spacing_state_distribution", "program_label", "split_label",
  "scenario_id", "display_order", "explanation_prose", "report_format",
] as const;
export type FullProgramGate14DifferenceDimension =
  typeof FULL_PROGRAM_GATE_14_DIFFERENCE_DIMENSIONS[number];

export const FULL_PROGRAM_NONMATERIAL_DIMENSIONS: readonly FullProgramGate14DifferenceDimension[] = Object.freeze([
  "program_label", "split_label", "scenario_id", "display_order", "explanation_prose", "report_format",
]);

export const FULL_PROGRAM_DIFFERENCE_IMPORTANCE_HIERARCHY = Object.freeze([
  "weekly_responsibilities",
  "responsibility_distribution_across_sessions",
  "final_prescribed_opportunity_realization",
  "session_needs_and_assignment_structure",
  "exercise_identity_and_support_accommodation",
  "source_events_and_developmental_preparatory_structure",
  "dose_load_effort_range_support_rest",
  "sequence_and_transition_consequences",
  "reps_and_tempo",
  "labels_and_prose",
] as const);

export interface FullPrescribedProgramCounterfactualContract extends Omit<CagtCounterfactualContract,
  "permittedDifferenceDimensions" | "prohibitedDifferenceDimensions" | "expectedFrameworkRelationship" |
  "expectedAdaptiveContentRelationship" | "expectedPrescriptionRelationship" | "expectedSequenceRelationship"> {
  readonly gate14Contract: typeof FULL_PRESCRIBED_PROGRAM_CAGT_GATE_14_CONTRACT_REFERENCE;
  readonly authorityRegistryReference: CagtEffectiveAuthorityRegistryReference;
  readonly baselineSnapshotId: string;
  readonly counterfactualSnapshotId: string;
  readonly permittedDifferenceDimensions: readonly FullProgramGate14DifferenceDimension[];
  readonly prohibitedDifferenceDimensions: readonly FullProgramGate14DifferenceDimension[];
  readonly expectedFrameworkRelationship: CagtFrameworkRelationship;
  readonly expectedAdaptiveContentRelationship: CagtAdaptiveRelationship;
  readonly expectedWeeklyResponsibilityRelationship: "same" | "may_differ" | "must_differ";
  readonly expectedAllocationRelationship: "same" | "may_differ" | "must_differ";
  readonly expectedSessionStructureRelationship: "same" | "may_differ" | "must_differ";
  readonly expectedExerciseIdentityRelationship: "same" | "may_differ" | "must_differ";
  readonly expectedPrescriptionRelationship: "same" | "may_differ" | "must_differ";
  readonly expectedSequenceRelationship: "same" | "may_differ" | "must_differ";
  readonly expectedFinalProgramRelationship: "same" | "may_converge" | "must_differ" | "defer_gate_15" | "defer_gate_16";
  readonly finalProgramDimensionsMustPreserveEarlierAdaptation: readonly FullProgramGate14DifferenceDimension[];
  readonly finalProgramDimensionsAllowedToConverge: readonly FullProgramGate14DifferenceDimension[];
  readonly acceptableStructuredConvergenceReasons: readonly string[];
  readonly finalAdaptationPersistenceRequired: boolean;
  readonly explicitEntityMappings: readonly {
    readonly entityKind: FullProgramEntityKind;
    readonly baselineId: string;
    readonly counterfactualId: string;
  }[];
}

export interface FullProgramSignature<T = unknown> {
  readonly value: T;
  readonly fingerprint: string;
}

export interface FullProgramSignatureFamily {
  readonly horizon: FullProgramSignature;
  readonly programFramework: FullProgramSignature;
  readonly weeklyResponsibility: FullProgramSignature;
  readonly allocation: FullProgramSignature;
  readonly reservation: FullProgramSignature;
  readonly sessionPurpose: FullProgramSignature;
  readonly sessionNeed: FullProgramSignature;
  readonly exerciseStructure: FullProgramSignature;
  readonly warmupActivation: FullProgramSignature;
  readonly mainWork: FullProgramSignature;
  readonly accessoryWork: FullProgramSignature;
  readonly sourceExposure: FullProgramSignature;
  readonly prescriptionStructure: FullProgramSignature;
  readonly doseLane: FullProgramSignature;
  readonly relationshipView: FullProgramSignature;
  readonly sequence: FullProgramSignature;
  readonly durationFeasibility: FullProgramSignature;
  readonly stressConcentration: FullProgramSignature;
  readonly spacing: FullProgramSignature;
  readonly unsupportedPolicy: FullProgramSignature;
  readonly gate13Realization: FullProgramSignature;
  readonly completeAdaptiveProgram: FullProgramSignature;
}

export interface FullProgramStructuredDifference {
  readonly dimension: FullProgramGate14DifferenceDimension;
  readonly material: boolean;
  readonly earliestOwnerGate: CagtGateId;
  readonly baselineFingerprint: string;
  readonly counterfactualFingerprint: string;
}

export interface FullProgramFirstMeaningfulDifference {
  readonly expectedEarliestPermittedGate: CagtGateId | null;
  readonly expectedLatestRequiredGate: CagtGateId | null;
  readonly actualFirstAnyDifferenceGate: CagtGateId | null;
  readonly actualFirstMaterialDifferenceGate: CagtGateId | null;
  readonly firstMaterialDimensions: readonly FullProgramGate14DifferenceDimension[];
  readonly firstFailingGate: CagtGateId | null;
  readonly differencePersistsToFinalProgram: boolean;
  readonly laterLayerErasedDifference: boolean;
}

export interface ProgramCausalPropagationTrace {
  readonly changedFactIds: readonly string[];
  readonly factOwner: string;
  readonly firstRightfulReceiver: CagtGateId | null;
  readonly firstMaterialResponse: CagtGateId | null;
  readonly downstreamDimensionsPreservingResponse: readonly FullProgramGate14DifferenceDimension[];
  readonly convergedDimensions: readonly FullProgramGate14DifferenceDimension[];
  readonly structuredConvergenceReason: string | null;
  readonly finalProgramManifestation: readonly FullProgramGate14DifferenceDimension[];
  readonly persistenceRequired: boolean;
  readonly persistenceOccurred: boolean;
  readonly unrelatedDimensionsChanged: readonly FullProgramGate14DifferenceDimension[];
  readonly responseErased: boolean;
}

export const FULL_PROGRAM_GATE_14_SUBGATES = [
  "14.0_pair_and_contract_truth",
  "14.1_upstream_scored_path_validity",
  "14.2_program_snapshot_completeness",
  "14.3_entity_alignment",
  "14.4_framework_comparison",
  "14.5_responsibility_and_session_structure_propagation",
  "14.6_prescription_and_relationship_propagation",
  "14.7_sequencing_duration_stress_and_spacing",
  "14.8_first_meaningful_difference_and_persistence",
  "14.9_final_convergence_adaptation_verdict",
] as const;
export type FullProgramGate14Subgate = typeof FULL_PROGRAM_GATE_14_SUBGATES[number];

export const FULL_PROGRAM_GATE_14_CLASSIFICATIONS = [
  "PROGRAM_EXPECTED_CONVERGENCE", "PROGRAM_JUSTIFIED_CONVERGENCE",
  "PROGRAM_MATERIAL_ADAPTATION_PRESERVED", "PROGRAM_OPTIONAL_VARIATION",
  "PROGRAM_DIFFERENCE_DEFERRED_TO_GATE_15", "PROGRAM_DIFFERENCE_DEFERRED_TO_GATE_16",
  "PROGRAM_COSMETIC_ONLY_DIFFERENCE", "PROGRAM_UNRESPONSIVE_TO_MATERIAL_INPUT",
  "PROGRAM_OVER_ADAPTATION", "PROGRAM_WRONG_LAYER_EFFECT", "MATERIAL_ADAPTATION_ERASED_DOWNSTREAM",
  "PROGRAM_ALIGNMENT_AMBIGUOUS", "PROGRAM_SNAPSHOT_INCOMPLETE", "PROGRAM_UPSTREAM_FAILED_SHADOW_ONLY",
  "PROGRAM_COMPARISON_INCONCLUSIVE",
] as const;
export type FullProgramGate14Classification = typeof FULL_PROGRAM_GATE_14_CLASSIFICATIONS[number];

export type FullProgramCollisionClassification =
  | "EXPECTED_SHARED_FRAMEWORK"
  | "PRODUCTIVE_STABILITY"
  | "JUSTIFIED_SHARED_SOLUTION"
  | "EXPECTED_SEMANTIC_CONVERGENCE"
  | "SUSPICIOUS_ADAPTIVE_COLLISION"
  | "TEMPLATE_COLLISION"
  | "UNKNOWN_REQUIRES_REVIEW";

export interface FullProgramGate14SubgateTrace {
  readonly subgate: FullProgramGate14Subgate;
  readonly state: "PASS" | "FAIL_STOP" | "NOT_REACHED" | "SHADOW_DIAGNOSTIC_ONLY";
  readonly scored: boolean;
  readonly reasonCodes: readonly string[];
}

export interface FullPrescribedProgramCagtResult {
  readonly gate14Contract: typeof FULL_PRESCRIBED_PROGRAM_CAGT_GATE_14_CONTRACT_REFERENCE;
  readonly authorityRegistryReference: CagtEffectiveAuthorityRegistryReference;
  readonly counterfactualContractId: string;
  readonly baselineSnapshotId: string;
  readonly counterfactualSnapshotId: string;
  readonly fixtureValid: boolean;
  readonly upstreamGateSummary: readonly FullProgramUpstreamGateResult[];
  readonly alignmentResult: FullProgramEntityAlignment;
  readonly baselineSignatures: FullProgramSignatureFamily;
  readonly counterfactualSignatures: FullProgramSignatureFamily;
  readonly structuredDifferences: readonly FullProgramStructuredDifference[];
  readonly frameworkRelationshipResult: "same" | "different";
  readonly adaptiveContentRelationshipResult: "same" | "different";
  readonly firstMeaningfulDifference: FullProgramFirstMeaningfulDifference;
  readonly causalPropagationTrace: ProgramCausalPropagationTrace;
  readonly adaptationPersistenceResult: "not_required" | "preserved" | "erased";
  readonly convergenceResult: "not_applicable" | "expected" | "justified" | "rejected";
  readonly underAdaptationResult: "not_detected" | "detected";
  readonly overAdaptationResult: "not_detected" | "detected";
  readonly wrongLayerResult: "not_detected" | "detected";
  readonly cosmeticDifferenceResult: "not_detected" | "detected";
  readonly noRescueTrace: {
    readonly upstreamFailureGate: CagtGateId | null;
    readonly downstreamDifferenceObserved: boolean;
    readonly downstreamRescueAttempted: boolean;
    readonly downstreamRescueAccepted: false;
  };
  readonly collisionClassifications: readonly FullProgramCollisionClassification[];
  readonly observedMetrics: Readonly<Record<string, number>>;
  readonly finalClassification: FullProgramGate14Classification;
  readonly legacyClassification: CagtClassification;
  readonly firstFailingSubgate: FullProgramGate14Subgate | null;
  readonly subgateTrace: readonly FullProgramGate14SubgateTrace[];
  readonly shadowDiagnostics: readonly string[];
  readonly decisionTrace: readonly string[];
  readonly provenance: readonly string[];
}
