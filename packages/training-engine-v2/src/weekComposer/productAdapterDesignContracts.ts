import type { EquipmentCapabilities } from "../domain/equipment";
import type { CurrentSessionAvailability, CurrentSessionEquipment, UnresolvedPlannerContextObservation } from "../domain/sessionPlanningDirective";
import type { StructuralCapacityMode } from "../domain/session";
import type { TrainingSafetyState } from "../domain/trainingSafety";
import type { WeekPlanningHorizon, WeekTrainingOpportunity } from "./designContracts";

/** Design-only Product Adapter contracts. Intentionally absent from the package index. */

export type ProductWeekSourceType =
  | "explicit_user_confirmation"
  | "explicit_coach_confirmation"
  | "current_product_schedule"
  | "connected_calendar_window"
  | "profile_default"
  | "explicit_travel_plan"
  | "explicit_training_location"
  | "explicit_equipment_override"
  | "prior_horizon_revision"
  | "session_completion_state";

export type ProductWeekConfirmationState =
  | "observed_free_window"
  | "suggested_training_opportunity"
  | "user_confirmed"
  | "coach_confirmed"
  | "product_confirmed"
  | "tentative"
  | "unavailable";

export interface ProductWeekSourceProvenance {
  readonly sourceId: string;
  readonly sourceType: ProductWeekSourceType;
  readonly recordedAt: string;
  readonly confirmationState: ProductWeekConfirmationState;
  readonly truthState: "expected_future_fact" | "actual_current_fact" | "completed_performance";
  readonly updateRef: string;
  readonly basedOnRevisionId?: string;
}

export interface ProductOpportunityTimeWindow {
  readonly startAt: string;
  readonly endAt: string;
  readonly timezone: string;
  readonly sourceRef: string;
  readonly confirmationState: ProductWeekConfirmationState;
}

export type ProductOpportunityEquipmentSource =
  | { readonly kind: "capability_snapshot"; readonly capabilities: EquipmentCapabilities; readonly sourceRef: string }
  | { readonly kind: "equipment_reference"; readonly equipmentRef: string; readonly sourceRef: string }
  | { readonly kind: "unknown"; readonly sourceRef: string };

export interface ProductOpportunitySourceFact {
  readonly opportunityKey: string;
  readonly order?: number;
  readonly timeWindow?: ProductOpportunityTimeWindow;
  readonly availabilityStatus: "available" | "tentative" | "cancelled" | "unknown";
  readonly completionStatus: "not_started" | "completed" | "missed" | "cancelled" | "unknown";
  readonly availableMinutes: number | null;
  readonly structuralCapacity: StructuralCapacityMode;
  readonly locationRef?: string;
  readonly equipment: ProductOpportunityEquipmentSource;
  readonly provenance: ProductWeekSourceProvenance;
}

export interface VersionedEquipmentCapabilityRecord {
  readonly equipmentRef: string;
  readonly version: string;
  readonly capabilities: EquipmentCapabilities;
  readonly sourceRef: string;
  readonly reviewedAt: string;
}

export interface ProductProfileWeekDefaults {
  readonly daysPerWeek: number;
  readonly typicalMinutes: number | null;
  readonly preferredDayRefs: readonly string[];
  readonly equipmentRef?: string;
  readonly provenance: ProductWeekSourceProvenance;
}

export interface ProductHorizonUnresolvedContext {
  readonly id: string;
  readonly category: "recovery_readiness" | "illness_or_safety" | "external_training_load" | "accessibility" | "unknown";
  readonly proposedOwner: "future_recovery_readiness_contract" | "safety_clinical" | "future_week_policy" |
    "future_accessibility_contract" | "unknown";
  readonly blocksHorizon: boolean;
  readonly sourceRef: string;
}

export interface ProductWeekHorizonSourceInput {
  readonly athleteId: string;
  readonly horizonId: string;
  readonly revisionId: string;
  readonly basedOnRevisionId?: string;
  readonly createdAt: string;
  readonly evaluationAsOf: string;
  readonly timezone?: string;
  readonly opportunityFacts: readonly ProductOpportunitySourceFact[];
  readonly profileDefaults?: ProductProfileWeekDefaults;
  readonly equipmentRecords: readonly VersionedEquipmentCapabilityRecord[];
  readonly previousHorizon?: WeekPlanningHorizon;
  readonly unresolvedContext: readonly ProductHorizonUnresolvedContext[];
  readonly trainingSafety: TrainingSafetyState;
}

export type HorizonSourceResolutionCode =
  | "explicit_user_fact_selected"
  | "explicit_coach_fact_selected"
  | "current_product_fact_selected"
  | "calendar_window_requires_confirmation"
  | "profile_default_proposed_only"
  | "source_conflict"
  | "equipment_reference_resolved"
  | "equipment_resolution_required"
  | "unknown_preserved";

export interface ProductHorizonSourceResolutionTrace {
  readonly opportunityKey: string;
  readonly selectedSourceId: string | null;
  readonly consideredSourceIds: readonly string[];
  readonly code: HorizonSourceResolutionCode;
  readonly consequence: "available" | "tentative" | "unavailable" | "conflict" | "unresolved";
}

export interface ProductWeekHorizonRevision {
  readonly horizonId: string;
  readonly revisionId: string;
  readonly basedOnRevisionId: string | null;
  readonly createdAt: string;
  readonly evaluationAsOf: string;
  readonly sourceEventRefs: readonly string[];
  readonly changedOpportunityIds: readonly string[];
  readonly unchangedOpportunityIds: readonly string[];
  readonly completedOpportunityIds: readonly string[];
  readonly invalidatedReservationIds: readonly string[];
  readonly reallocationRequired: boolean;
}

export type ProductWeekHorizonAdapterStatus =
  | "horizon_ready"
  | "horizon_ready_with_tentative_opportunities"
  | "user_confirmation_required"
  | "horizon_source_conflict"
  | "current_week_availability_required"
  | "equipment_resolution_required"
  | "unsupported_context"
  | "blocked_by_training_readiness";

export interface ProductWeekHorizonAdapterResult {
  readonly status: ProductWeekHorizonAdapterStatus;
  readonly horizon: WeekPlanningHorizon | null;
  readonly sourceResolutionTraces: readonly ProductHorizonSourceResolutionTrace[];
  readonly tentativeOpportunityIds: readonly string[];
  readonly conflictSourceRefs: readonly string[];
  readonly profileDefaultSourceRefs: readonly string[];
  readonly equipmentResolutionRefs: readonly string[];
  readonly unresolvedContext: readonly ProductHorizonUnresolvedContext[];
  readonly revision: ProductWeekHorizonRevision | null;
  readonly decisionTrace: readonly string[];
}

export interface CurrentSessionContextInput {
  readonly reservationId: string;
  readonly actualEvaluationTime: string;
  readonly actualAvailability?: CurrentSessionAvailability;
  readonly actualStructuralCapacity?: StructuralCapacityMode;
  readonly actualEquipment?: CurrentSessionEquipment;
  readonly actualTrainingSafety: TrainingSafetyState;
  readonly userCancelled: boolean;
  readonly actualLocationRef?: string;
  readonly unresolvedContext: readonly UnresolvedPlannerContextObservation[];
  readonly productUpdateRefs: readonly string[];
}

export interface CurrentSessionContextAdapterResult {
  readonly status: "current_context_ready" | "user_cancelled" | "under_specified_current_context" |
    "blocked_by_training_readiness" | "unsupported_context";
  readonly availability: CurrentSessionAvailability | null;
  readonly equipment: CurrentSessionEquipment | null;
  readonly safety: TrainingSafetyState;
  readonly unresolvedContext: readonly UnresolvedPlannerContextObservation[];
  readonly decisionTrace: readonly string[];
}

export interface StableOpportunityIdentityDecision {
  readonly previousOpportunityId: string | null;
  readonly nextOpportunityId: string;
  readonly decision: "identity_retained" | "new_identity_required";
  readonly reason: "same_intended_window" | "metadata_only" | "material_window_change" |
    "planning_identity_equipment_change" | "cancelled_and_replaced" | "new_opportunity";
}

export interface ProductAdapterScenarioResult {
  readonly id: string;
  readonly status: ProductWeekHorizonAdapterStatus;
  readonly opportunityIds: readonly string[];
  readonly availableOpportunityIds: readonly string[];
  readonly tentativeOpportunityIds: readonly string[];
  readonly unresolvedCategories: readonly ProductHorizonUnresolvedContext["category"][];
  readonly changedOpportunityIds: readonly string[];
}

export type ProductAdapterOpportunity = WeekTrainingOpportunity;
