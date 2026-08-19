import type { ExerciseActionFunction } from "../domain/exercise";
import type { MuscleRelationshipRequirement } from "../domain/exerciseSelectionNeed";
import type { BodyRegion, MovementRole, MuscleGroup } from "../domain/primitives";
import type { EvidenceProvenance, ISODateTimeString } from "../prescription/types";
import type { ProductionWeeklyExecutionRequirements } from "../domain/weeklyExecutionRequirements";

export const PRODUCTION_PRESCRIBED_WEEK_SOURCE_CONTRACT_ID =
  "PRODUCTION_PRESCRIBED_WEEK_SOURCE_CONTRACT" as const;
export const PRODUCTION_PRESCRIBED_WEEK_SOURCE_CONTRACT_VERSION = "1.0.0" as const;

export interface ProductionPrescribedWeekSourceContractReference {
  readonly contractId: typeof PRODUCTION_PRESCRIBED_WEEK_SOURCE_CONTRACT_ID;
  readonly contractVersion: typeof PRODUCTION_PRESCRIBED_WEEK_SOURCE_CONTRACT_VERSION;
}

export const PRODUCTION_PRESCRIBED_WEEK_SOURCE_CONTRACT_REFERENCE:
ProductionPrescribedWeekSourceContractReference = Object.freeze({
  contractId: PRODUCTION_PRESCRIBED_WEEK_SOURCE_CONTRACT_ID,
  contractVersion: PRODUCTION_PRESCRIBED_WEEK_SOURCE_CONTRACT_VERSION,
});

export const SUPPORTED_PRODUCTION_WEEK_OBJECTIVE_PURPOSES = [
  "movement_development",
  "muscle_development",
  "direct_action_development",
  "assessment_priority_development",
  "capacity_development",
  "recovery_support",
] as const;

export type SupportedProductionWeekObjectivePurpose =
  (typeof SUPPORTED_PRODUCTION_WEEK_OBJECTIVE_PURPOSES)[number];

export type ProductionWeekObjectivePriority = "required" | "preferred" | "optional";
export interface ProductionWeekObjectiveTarget {
  readonly targetMovementRoles: readonly MovementRole[];
  readonly targetActionFunctions: readonly ExerciseActionFunction[];
  readonly targetMuscles: readonly MuscleGroup[];
  readonly targetBodyRegions: readonly BodyRegion[];
  readonly muscleRequirement: MuscleRelationshipRequirement;
}

export interface ProductionWeeklyFrequencyIntent {
  readonly minimumAllocatedSessions: number;
  readonly targetAllocatedSessions: number;
  readonly softMaximumAllocatedSessions: number;
  readonly sourceRef: string;
  readonly provenance: readonly EvidenceProvenance[];
}

export interface ProductionWeekObjectiveSnapshot {
  readonly objectiveId: string;
  readonly purpose: string;
  readonly target: ProductionWeekObjectiveTarget;
  readonly priority: ProductionWeekObjectivePriority;
  readonly priorityOrder: number;
  readonly goalRelationships: readonly {
    readonly goal: string;
    readonly relationship: string;
    readonly sourceEvidenceRefs: readonly string[];
  }[];
  readonly frequencyIntent: ProductionWeeklyFrequencyIntent;
  readonly supportedPolicyRef: { readonly policyId: string; readonly version: string };
  readonly dosePolicyState: "prescribed_dose_target_not_defined" | "explicit_reviewed_target" | "not_applicable";
  readonly spacingState: "SPACING_R0_PRESCRIPTION_PENDING";
  readonly sourceEvidenceRefs: readonly string[];
  readonly executionRequirements?: ProductionWeeklyExecutionRequirements;
  readonly provenance: readonly EvidenceProvenance[];
}

export interface ProductionWeekReservationSnapshot {
  readonly reservationId: string;
  readonly opportunityId: string;
  readonly allocatedObjectiveIds: readonly string[];
  readonly expectedSessionGoal: string;
  readonly responsibilityEvidenceRefs: readonly string[];
  readonly availabilityState: "available" | "unavailable" | "unknown";
  readonly executionState: "not_started" | "in_progress" | "performed" | "cancelled" | "unknown";
  readonly invalidationState: "active" | "superseded" | "cancelled";
  readonly provenance: readonly EvidenceProvenance[];
}

export interface ProductionWeekOpportunitySnapshot {
  readonly opportunityId: string;
  readonly order: number;
  readonly calendarDateTime: ISODateTimeString | null;
  readonly availableMinutes: number | null;
  readonly availabilityState: "available" | "unavailable" | "unknown";
  readonly executionState: "not_started" | "in_progress" | "performed" | "cancelled" | "unknown";
  readonly reservationIds: readonly string[];
  readonly provenance: readonly EvidenceProvenance[];
}

export interface ProductionWeekAllocationTrace {
  readonly allocationTraceId: string;
  readonly objectiveId: string;
  readonly reservationId: string;
  readonly opportunityId: string;
  readonly sessionDirectiveId: string | null;
  readonly sessionNeedIds: readonly string[];
  readonly sourceEvidenceRefs: readonly string[];
  readonly provenance: readonly EvidenceProvenance[];
}

export type ProductionWeekSourceAuthority =
  | "PRODUCTION_WEEK_SOURCE_CONTRACT"
  | "COMPATIBILITY_ADAPTER";

export interface PrescribedWeekSourceSnapshot {
  readonly sourceContract: ProductionPrescribedWeekSourceContractReference;
  readonly sourceSnapshotId: string;
  readonly sourceSnapshotRevisionId: string;
  readonly sourceAuthority: ProductionWeekSourceAuthority;
  readonly athleteId: string;
  readonly planningHorizonId: string;
  readonly weeklyIntentId: string;
  readonly weekAllocationPlanId: string;
  readonly horizonBoundary: {
    readonly startsAt: ISODateTimeString | null;
    readonly endsAt: ISODateTimeString | null;
    readonly timezone: string | null;
  };
  readonly opportunities: readonly ProductionWeekOpportunitySnapshot[];
  readonly objectives: readonly ProductionWeekObjectiveSnapshot[];
  readonly reservations: readonly ProductionWeekReservationSnapshot[];
  readonly allocationTraces: readonly ProductionWeekAllocationTrace[];
  readonly unsupportedScopes: readonly string[];
  readonly unresolvedPolicyRefs: readonly string[];
  readonly evaluationTime: ISODateTimeString;
  readonly provenance: readonly EvidenceProvenance[];
}
