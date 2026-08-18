import type { SessionNeedPriority, StructuralCapacityMode } from "../domain/session";
import type { TrainingOutcomeGoal } from "../domain/sessionPlanningDirective";
import type { PrescriptionLocalPurpose, PrescriptionPurposeAuthority } from
  "../prescription/purposeResolution";
import type { ProductionPlanningObjectivePriority, ProductionWeeklyObjectiveGoalRelationship,
  ProductionWeeklySelectionTarget, ProductionWeekFrequencyRule,
  ProductionWeekPlanningFrequencyIntent, ProductionWeekObjectiveFamily,
  ProductionWeekObjectivePurpose } from "../weekPlanning/contracts";

export const PRODUCTION_WEEKLY_INTENT_PLANNER_V1_1_REFERENCE = Object.freeze({
  contractId: "PRODUCTION_WEEKLY_INTENT_PLANNER",
  contractVersion: "1.1.0",
} as const);
export const PRODUCTION_WEEK_ALLOCATION_COMPOSER_V1_1_REFERENCE = Object.freeze({
  contractId: "PRODUCTION_WEEK_ALLOCATION_COMPOSER",
  contractVersion: "1.1.0",
} as const);
export const PRODUCTION_SESSION_ALLOCATION_MATERIALIZER_V1_1_REFERENCE = Object.freeze({
  contractId: "PRODUCTION_SESSION_ALLOCATION_MATERIALIZER",
  contractVersion: "1.1.0",
} as const);
export const PRODUCTION_WEEK_POLICY_V2_REFERENCE = Object.freeze({
  policyId: "PRODUCTION_WEEK_POLICY_V2_PURPOSE_SPECIFIC_CORE",
  version: "2.0.0",
} as const);

export type ProductionWeekObjectiveFamilyV1_1 = ProductionWeekObjectiveFamily |
  "movement_quality" | "muscular_endurance";
export type ProductionWeekObjectivePurposeV1_1 = ProductionWeekObjectivePurpose |
  "movement_quality_development" | "muscular_endurance_development";

export interface ProductionWeekFrequencyRuleV2 extends Omit<ProductionWeekFrequencyRule, "family"> {
  readonly family: Exclude<ProductionWeekObjectiveFamilyV1_1, "participation" | "spacing">;
}

export interface ProductionWeekPolicyV2 {
  readonly reference: typeof PRODUCTION_WEEK_POLICY_V2_REFERENCE;
  readonly inheritedPolicyReference: { readonly policyId: string; readonly version: string };
  readonly inheritedFrequencyRules: readonly ProductionWeekFrequencyRule[];
  readonly addedFrequencyRules: readonly ProductionWeekFrequencyRuleV2[];
  readonly frequencyRules: readonly ProductionWeekFrequencyRuleV2[];
  readonly selectedMovementQualityCandidate: "MQF2";
  readonly selectedMuscularEnduranceCandidate: "MEF2";
  readonly activationAuthorized: false;
}

export interface ProductionExplicitWeeklyPriorityV1_1 {
  readonly priorityId: string;
  readonly family: Exclude<ProductionWeekObjectiveFamilyV1_1, "participation" | "spacing">;
  readonly purpose: ProductionWeekObjectivePurposeV1_1;
  readonly localPrescriptionPurpose: PrescriptionLocalPurpose;
  readonly purposeAuthority: PrescriptionPurposeAuthority;
  readonly target: ProductionWeeklySelectionTarget;
  readonly priority: ProductionPlanningObjectivePriority;
  readonly priorityOrder: number;
  readonly goalRelationships: readonly ProductionWeeklyObjectiveGoalRelationship[];
  readonly sourceEvidenceRefs: readonly string[];
}

export interface ProductionWeeklyDevelopmentObjectiveV1_1 {
  readonly objectiveId: string;
  readonly family: ProductionExplicitWeeklyPriorityV1_1["family"];
  readonly purpose: ProductionWeekObjectivePurposeV1_1;
  readonly localPrescriptionPurpose: PrescriptionLocalPurpose;
  readonly purposeAuthority: PrescriptionPurposeAuthority;
  readonly target: ProductionWeeklySelectionTarget;
  readonly priority: ProductionPlanningObjectivePriority;
  readonly priorityOrder: number;
  readonly goalRelationships: readonly ProductionWeeklyObjectiveGoalRelationship[];
  readonly frequencyIntent: ProductionWeekPlanningFrequencyIntent;
  readonly sourcePriorityIds: readonly string[];
  readonly sourceEvidenceRefs: readonly string[];
}

export interface ProductionWeeklyIntentV1_1 {
  readonly plannerContract: typeof PRODUCTION_WEEKLY_INTENT_PLANNER_V1_1_REFERENCE;
  readonly intentId: string;
  readonly athleteId: string;
  readonly outcomeGoal: TrainingOutcomeGoal;
  readonly policyReference: typeof PRODUCTION_WEEK_POLICY_V2_REFERENCE;
  readonly objectives: readonly ProductionWeeklyDevelopmentObjectiveV1_1[];
  readonly evaluationTime: string;
  readonly selectionBehaviorChanged: false;
}

export type ProductionSessionResponsibilityPurposeV1_1 =
  "dominant_main" | "secondary_main" | "secondary_accessory" | "direct_accessory" |
  "capacity_main" | "capacity_accessory" | "movement_quality_main" |
  "movement_quality_accessory" | "muscular_endurance_main" |
  "muscular_endurance_accessory";

export interface ProductionReservedSessionObjectiveV1_1 {
  readonly responsibilityId: string;
  readonly weeklyObjectiveId: string;
  readonly opportunityId: string;
  readonly purpose: ProductionSessionResponsibilityPurposeV1_1;
  readonly localPrescriptionPurpose: PrescriptionLocalPurpose;
  readonly purposeAuthority: PrescriptionPurposeAuthority;
  readonly priority: ProductionPlanningObjectivePriority;
  readonly priorityOrder: number;
  readonly sourceEvidenceRefs: readonly string[];
}

export interface ProductionWeekAllocationPlanV1_1 {
  readonly composerContract: typeof PRODUCTION_WEEK_ALLOCATION_COMPOSER_V1_1_REFERENCE;
  readonly planId: string;
  readonly weeklyIntentId: string;
  readonly opportunities: readonly {
    readonly opportunityId: string;
    readonly structuralCapacity: StructuralCapacityMode;
  }[];
  readonly reservations: readonly ProductionReservedSessionObjectiveV1_1[];
  readonly omittedObjectiveIds: readonly string[];
  readonly optionalBloatCount: 0;
}

export type ProductionWeekResponsibilityPackingV1_1 =
  | "distributed_across_opportunities"
  | "coherent_shared_sessions";

export interface MaterializedAllocatedObjectiveV1_1 {
  readonly materializerContract: typeof PRODUCTION_SESSION_ALLOCATION_MATERIALIZER_V1_1_REFERENCE;
  readonly allocatedObjectiveId: string;
  readonly responsibilityId: string;
  readonly weeklyObjectiveId: string;
  readonly opportunityId: string;
  readonly localPrescriptionPurpose: PrescriptionLocalPurpose;
  readonly purposeAuthority: PrescriptionPurposeAuthority;
  readonly priority: SessionNeedPriority;
  readonly plannerProvenance: {
    readonly objectiveIds: readonly string[];
    readonly localPrescriptionPurpose: PrescriptionLocalPurpose;
    readonly purposeAuthority: PrescriptionPurposeAuthority;
    readonly transformationRuleId: "WEEK_V1_1_EXACT_PURPOSE_PROPAGATION";
    readonly sourceEvidenceRefs: readonly string[];
  };
}

export interface WeekFrequencyCandidate {
  readonly candidateId: "MQF1" | "MQF2" | "MQF3" | "MEF1" | "MEF2" | "MEF3";
  readonly family: "movement_quality" | "muscular_endurance";
  readonly ownerPreferred: boolean;
  readonly required: readonly [number, number, number];
  readonly preferred: readonly [number, number, number];
  readonly optional: readonly [number, number, number];
}
