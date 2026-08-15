import type { ExerciseDoseMode } from "../dose";
import type { PrescriptionPolicyUseCase } from "../policies";
import type { PrescriptionCompilationContextFacts } from "../compiler/contracts";
import type { ProgrammingContextMode, TrainingOutcomeGoal } from
  "../../domain/sessionPlanningDirective";
import type { SessionNeedPriority, SessionSection, TrainingRole } from "../../domain/session";
import type { ProductionWeeklyObjectiveGoalRelationship, ProductionWeekObjectiveFamily,
  ProductionWeekObjectivePurpose } from "../../weekPlanning/contracts";
import type { PrescriptionLocalPurpose, PrescriptionPurposeAuthority,
  PrescriptionPurposeResolutionStatus, PrescriptionPurposeSourceKind } from "./vocabularies";

export const PURPOSE_FIRST_PRESCRIPTION_RESOLVER_CONTRACT_ID =
  "PURPOSE_FIRST_GOAL_SPECIFIC_PRESCRIPTION_RESOLVER" as const;
export const PURPOSE_FIRST_PRESCRIPTION_RESOLVER_CONTRACT_VERSION = "1.0.0" as const;
export const PURPOSE_FIRST_PRESCRIPTION_RESOLVER_CONTRACT_REFERENCE =
  "PURPOSE_FIRST_GOAL_SPECIFIC_PRESCRIPTION_RESOLVER@1.0.0" as const;

export const PRESCRIPTION_PURPOSE_EVIDENCE_SNAPSHOT_CONTRACT_ID =
  "PRESCRIPTION_PURPOSE_EVIDENCE_SNAPSHOT" as const;
export const PRESCRIPTION_PURPOSE_EVIDENCE_SNAPSHOT_CONTRACT_VERSION = "1.0.0" as const;
export const PRESCRIPTION_PURPOSE_EVIDENCE_SNAPSHOT_CONTRACT_REFERENCE =
  "PRESCRIPTION_PURPOSE_EVIDENCE_SNAPSHOT@1.0.0" as const;

export const EXPLICIT_STANDALONE_PRESCRIPTION_PURPOSE_SOURCE_CONTRACT_REFERENCE =
  "EXPLICIT_STANDALONE_PRESCRIPTION_PURPOSE_SOURCE@1.0.0" as const;

export const PURPOSE_FIRST_PRESCRIPTION_RESOLVER_IMPLEMENTATION_STATUS =
  "PURPOSE_FIRST_GOAL_SPECIFIC_PRESCRIPTION_RESOLVER_V1_IMPLEMENTED_NOT_ACTIVATED" as const;

export interface PrescriptionPurposeProvenance {
  readonly owner: "production_week_purpose_projection" | "explicit_standalone_purpose_owner" |
    "typed_dependency_owner" | "legacy_compatibility";
  readonly sourceRefs: readonly string[];
  readonly ruleRefs: readonly string[];
}

export interface ProductionPrescriptionPurposeRequirement {
  readonly requirementId: string;
  readonly athleteId: string;
  readonly targetSessionIntentId: string;
  readonly targetSessionNeedIds: readonly string[];
  readonly targetAssignmentHandoffId: string;
  readonly sourceKind: PrescriptionPurposeSourceKind;
  readonly sourceWeeklyIntent: {
    readonly intentId: string;
    readonly intentRevisionId: string;
  } | null;
  readonly sourceWeekPlan: {
    readonly weekPlanId: string;
    readonly weekPlanRevisionId: string;
    readonly reservationId: string;
    readonly reservationRevisionId: string;
  } | null;
  readonly sourceWeeklyObjectiveId: string | null;
  readonly sourceObjectiveFamily: Exclude<ProductionWeekObjectiveFamily, "participation" | "spacing"> | null;
  readonly sourceObjectivePurpose: ProductionWeekObjectivePurpose | null;
  readonly sourceGoalRelationships: readonly ProductionWeeklyObjectiveGoalRelationship[];
  readonly localPurpose: PrescriptionLocalPurpose;
  readonly purposeAuthority: PrescriptionPurposeAuthority;
  readonly priority: SessionNeedPriority;
  readonly priorityOrder: number;
  readonly section: SessionSection;
  readonly role: TrainingRole;
  readonly expectedDoseModeLane: ExerciseDoseMode | null;
  readonly sourceEvidenceRefs: readonly string[];
  readonly reviewState: "owner_reviewed" | "policy_reviewed" | "dependency_validated" |
    "unknown" | "rejected";
  readonly explicitUnknowns: readonly string[];
  readonly provenance: PrescriptionPurposeProvenance;
}

export interface ExcludedPrescriptionPurposeRequirement {
  readonly requirementId: string;
  readonly reasonCodes: readonly string[];
}

export interface ProductionPrescriptionPurposeEvidenceSnapshot {
  readonly contractReference: typeof PRESCRIPTION_PURPOSE_EVIDENCE_SNAPSHOT_CONTRACT_REFERENCE;
  readonly snapshotId: string;
  readonly snapshotRevisionId: string;
  readonly basedOnRevisionId: string | null;
  readonly purposeResolutionAttemptId: string;
  readonly resolverPolicyReference: string;
  readonly athleteId: string;
  readonly sessionIntentId: string;
  readonly sessionSkeletonFingerprint: string;
  readonly prescriptionHandoffFingerprint: string;
  readonly sourceKind: PrescriptionPurposeSourceKind;
  readonly weeklyIntent: { readonly intentId: string; readonly intentRevisionId: string } | null;
  readonly weekPlan: {
    readonly weekPlanId: string;
    readonly weekPlanRevisionId: string;
    readonly reservationId: string;
    readonly reservationRevisionId: string;
  } | null;
  readonly requirements: readonly ProductionPrescriptionPurposeRequirement[];
  readonly excludedRequirements: readonly ExcludedPrescriptionPurposeRequirement[];
  readonly conflicts: readonly string[];
  readonly unresolvedLineage: readonly string[];
  readonly evaluationTime: string;
  readonly provenance: PrescriptionPurposeProvenance;
}

export interface ExplicitStandalonePrescriptionPurposeSource {
  readonly contractReference: typeof EXPLICIT_STANDALONE_PRESCRIPTION_PURPOSE_SOURCE_CONTRACT_REFERENCE;
  readonly sourceId: string;
  readonly owner: string;
  readonly athleteId: string;
  readonly outcomeGoal: TrainingOutcomeGoal;
  readonly localPurpose: PrescriptionLocalPurpose;
  readonly purposeAuthority: PrescriptionPurposeAuthority;
  readonly targetSessionIntentId: string;
  readonly targetObjectiveIds: readonly string[];
  readonly targetSessionNeedIds: readonly string[];
  readonly targetAssignmentHandoffId: string;
  readonly priority: SessionNeedPriority;
  readonly priorityOrder: number;
  readonly section: SessionSection;
  readonly role: TrainingRole;
  readonly expectedDoseModeLane: ExerciseDoseMode | null;
  readonly evidenceRefs: readonly string[];
  readonly reviewState: "owner_reviewed" | "policy_reviewed" | "unknown" | "rejected";
  readonly explicitUnknowns: readonly string[];
  readonly provenance: PrescriptionPurposeProvenance;
}

export interface PrescriptionPurposeResolverPolicyReference {
  readonly policyId: string;
  readonly version: string;
}

export interface PrescriptionPurposeSupportedMapping {
  readonly mappingId: string;
  readonly localPurpose: PrescriptionLocalPurpose;
  readonly sections: readonly SessionSection[];
  readonly roles: readonly TrainingRole[];
  readonly doseModes: readonly ExerciseDoseMode[];
  readonly useCases: readonly PrescriptionPolicyUseCase[];
  readonly authorityRequirement: "primary_or_secondary_local" | "dependency_support" |
    "explicit_local_or_dependency";
}

export interface ProductionPrescriptionPurposeResolverPolicy {
  readonly policyId: string;
  readonly version: string;
  readonly reference: string;
  readonly state: "OWNER_SELECTED_RESOLUTION_POLICY_IMPLEMENTED_NOT_ACTIVATED";
  readonly ownerArchitecturePolicyReference: string;
  readonly resolutionOrder: readonly string[];
  readonly authorityOrder: readonly PrescriptionPurposeAuthority[];
  readonly supportedMappings: readonly PrescriptionPurposeSupportedMapping[];
  readonly unsupportedPurposes: readonly PrescriptionLocalPurpose[];
  readonly conflictBehavior: "fail_closed";
  readonly missingPurposeBehavior: "fail_closed";
  readonly noBroadFallback: true;
  readonly numericDoseValuesOwned: false;
  readonly activationAuthorized: false;
}

export type ExplicitPrescriptionPurposeResolverPolicyInput =
  | ProductionPrescriptionPurposeResolverPolicy
  | PrescriptionPurposeResolverPolicyReference
  | null;

export interface ProductionPrescriptionPurposeResolutionResult {
  readonly resolverContract: typeof PURPOSE_FIRST_PRESCRIPTION_RESOLVER_CONTRACT_REFERENCE;
  readonly resolverPolicy: PrescriptionPurposeResolverPolicyReference | null;
  readonly status: PrescriptionPurposeResolutionStatus;
  readonly failedSubgate: string | null;
  readonly assignmentHandoffId: string;
  readonly selectedPrimaryPurpose: PrescriptionLocalPurpose | null;
  readonly supportingPurposes: readonly PrescriptionLocalPurpose[];
  readonly crossGoalPurposes: readonly PrescriptionLocalPurpose[];
  readonly selectedUseCase: PrescriptionPolicyUseCase | null;
  readonly section: SessionSection;
  readonly role: TrainingRole;
  readonly selectedDoseMode: ExerciseDoseMode | null;
  readonly sourceRequirementIds: readonly string[];
  readonly sourceObjectiveIds: readonly string[];
  readonly sourceNeedIds: readonly string[];
  readonly goalRelationshipTrace: readonly string[];
  readonly structuralCompatibilityTrace: readonly string[];
  readonly exerciseKnowledgeTrace: readonly string[];
  readonly equipmentTrace: readonly string[];
  readonly contextTrace: readonly string[];
  readonly excludedRequirements: readonly ExcludedPrescriptionPurposeRequirement[];
  readonly conflicts: readonly string[];
  readonly unresolvedPolicyRefs: readonly string[];
  readonly fallbackApplied: false;
  readonly provenance: PrescriptionPurposeProvenance;
}

export interface PurposeFirstPrescriptionResolutionInput {
  readonly policy: ExplicitPrescriptionPurposeResolverPolicyInput;
  readonly availablePolicies?: readonly ProductionPrescriptionPurposeResolverPolicy[];
  readonly snapshot: ProductionPrescriptionPurposeEvidenceSnapshot | null;
  readonly athleteId: string;
  readonly sessionIntentId: string;
  readonly outcomeGoal: TrainingOutcomeGoal;
  readonly programmingContextModes: readonly ProgrammingContextMode[];
  readonly assignmentHandoffId: string;
  readonly assignmentNeedIds: readonly string[];
  readonly section: SessionSection;
  readonly role: TrainingRole;
  readonly selectedDoseMode: ExerciseDoseMode | null;
  readonly legalDoseModes: readonly ExerciseDoseMode[];
  readonly exerciseKnowledgeRef: string;
  readonly equipmentTrace: readonly string[];
  readonly context: PrescriptionCompilationContextFacts;
}

export interface PurposeEvidenceSnapshotBuildInput {
  readonly athleteId: string;
  readonly sessionIntentId: string;
  readonly sessionSkeleton: unknown;
  readonly prescriptionHandoff: unknown;
  readonly sourceKind: PrescriptionPurposeSourceKind;
  readonly weeklyIntent: ProductionPrescriptionPurposeEvidenceSnapshot["weeklyIntent"];
  readonly weekPlan: ProductionPrescriptionPurposeEvidenceSnapshot["weekPlan"];
  readonly requirements: readonly ProductionPrescriptionPurposeRequirement[];
  readonly excludedRequirements: readonly ExcludedPrescriptionPurposeRequirement[];
  readonly conflicts: readonly string[];
  readonly unresolvedLineage: readonly string[];
  readonly evaluationTime: string;
  readonly purposeResolutionAttemptId: string;
  readonly resolverPolicyReference: string;
  readonly basedOnRevisionId?: string | null;
  readonly provenance: PrescriptionPurposeProvenance;
}
