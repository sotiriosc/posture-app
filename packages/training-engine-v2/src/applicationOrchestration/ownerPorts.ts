import type { ProductionLongitudinalAction, ProductionLongitudinalActionOwner } from
  "../longitudinalAdaptation/policies/policyContracts";
import type { ProductionPhaseProgramSnapshot } from "../phaseContinuity/programSnapshot";
import type { ProductionWeekAllocationPlan } from "../weekPlanning/contracts";
import type { ProductionAdaptationApplicationDownstreamValidation,
  ProductionAdaptationApplicationLocalityTrace, ProductionAdaptationApplicationOrchestrationInput,
  ProductionAdaptationApplicationOwnerResult, VersionedOrchestrationContractReference } from "./contracts";

export interface ProductionAdaptationApplicationOwnerInvocation {
  readonly input: ProductionAdaptationApplicationOrchestrationInput;
  readonly explicitOwnerPolicyReferences: readonly VersionedOrchestrationContractReference[];
  readonly ownerInput: Readonly<Record<string, unknown>>;
}

export interface ProductionAdaptationApplicationOwnerPort<
  TOwner extends Exclude<ProductionLongitudinalActionOwner, "longitudinal_adaptation"> =
    Exclude<ProductionLongitudinalActionOwner, "longitudinal_adaptation">,
> {
  readonly owner: TOwner;
  readonly contractReference: VersionedOrchestrationContractReference;
  readonly supportedActions: readonly ProductionLongitudinalAction[];
  readonly invoke: (invocation: ProductionAdaptationApplicationOwnerInvocation) =>
    Promise<ProductionAdaptationApplicationOwnerResult> | ProductionAdaptationApplicationOwnerResult;
}

export type ProductionPrescriptionApplicationOwnerPort =
  ProductionAdaptationApplicationOwnerPort<"prescription">;
export type ProductionCandidateComposerApplicationOwnerPort =
  ProductionAdaptationApplicationOwnerPort<"candidate_intelligence_and_composer">;
export type ProductionWeekApplicationOwnerPort = ProductionAdaptationApplicationOwnerPort<"week">;
export type ProductionPhaseContinuityApplicationOwnerPort =
  ProductionAdaptationApplicationOwnerPort<"phase_continuity">;
export type ProductionTrainingSafetyApplicationOwnerPort =
  ProductionAdaptationApplicationOwnerPort<"training_safety">;
export type ProductionProductHumanApplicationOwnerPort =
  ProductionAdaptationApplicationOwnerPort<"product_application" | "human_owner_review">;

export type ProductionAdaptationApplicationOwnerPortFamily =
  | ProductionPrescriptionApplicationOwnerPort
  | ProductionCandidateComposerApplicationOwnerPort
  | ProductionWeekApplicationOwnerPort
  | ProductionPhaseContinuityApplicationOwnerPort
  | ProductionTrainingSafetyApplicationOwnerPort
  | ProductionProductHumanApplicationOwnerPort;

export interface ProductionAffectedSessionRebuildResult {
  readonly status: "rebuilt" | "not_required" | "incomplete" | "failed";
  readonly proposedProgramSnapshot: ProductionPhaseProgramSnapshot | null;
  readonly changedEntityIds: readonly string[];
  readonly unchangedEntityIds: readonly string[];
  readonly prescriptionRebuildCount: number;
  readonly sequenceRebuildCount: number;
  readonly warmupActivationDependencyReevaluationCount: number;
  readonly reasonCodes: readonly string[];
  readonly applicationApplied: false;
}

export interface ProductionAffectedSessionRebuildPort {
  readonly contractReference: VersionedOrchestrationContractReference;
  readonly rebuild: (input: {
    readonly orchestrationInput: ProductionAdaptationApplicationOrchestrationInput;
    readonly ownerResult: ProductionAdaptationApplicationOwnerResult;
    readonly evaluationTime: string;
  }) => Promise<ProductionAffectedSessionRebuildResult> | ProductionAffectedSessionRebuildResult;
}

export interface ProductionWeekPlanProgramRebuildPort {
  readonly contractReference: VersionedOrchestrationContractReference;
  readonly rebuild: (input: {
    readonly orchestrationInput: ProductionAdaptationApplicationOrchestrationInput;
    readonly revisedWeekPlan: ProductionWeekAllocationPlan;
    readonly evaluationTime: string;
  }) => Promise<ProductionAffectedSessionRebuildResult> | ProductionAffectedSessionRebuildResult;
}

export interface ProductionApplicationDownstreamValidationPort {
  readonly contractReference: VersionedOrchestrationContractReference;
  readonly validate: (input: {
    readonly orchestrationInput: ProductionAdaptationApplicationOrchestrationInput;
    readonly ownerResult: ProductionAdaptationApplicationOwnerResult;
    readonly proposedProgramSnapshot: ProductionPhaseProgramSnapshot | null;
    readonly proposedWeekPlan: ProductionWeekAllocationPlan | null;
    readonly evaluationTime: string;
  }) => Promise<ProductionAdaptationApplicationDownstreamValidation> |
    ProductionAdaptationApplicationDownstreamValidation;
}

export interface ProductionApplicationLocalityValidationPort {
  readonly contractReference: VersionedOrchestrationContractReference;
  readonly validate: (input: {
    readonly orchestrationInput: ProductionAdaptationApplicationOrchestrationInput;
    readonly ownerResult: ProductionAdaptationApplicationOwnerResult;
    readonly proposedProgramSnapshot: ProductionPhaseProgramSnapshot | null;
    readonly proposedWeekPlan: ProductionWeekAllocationPlan | null;
  }) => ProductionAdaptationApplicationLocalityTrace;
}

export interface ProductionAdaptationApplicationOrchestrationDependencies {
  readonly ownerRegistry: import("./contracts").ProductionAdaptationApplicationOwnerRegistry;
  readonly orchestrationPolicy: import("./contracts").ProductionAdaptationApplicationOrchestrationPolicy;
  readonly confirmationPolicy: import("./contracts").ProductionAdaptationApplicationConfirmationPolicy;
  readonly ownerPorts: readonly ProductionAdaptationApplicationOwnerPortFamily[];
  readonly explicitOwnerPolicyReferences: readonly VersionedOrchestrationContractReference[];
  readonly ownerInputs: Readonly<Record<string, Readonly<Record<string, unknown>>>>;
  readonly affectedSessionRebuildPort?: ProductionAffectedSessionRebuildPort;
  readonly weekPlanProgramRebuildPort?: ProductionWeekPlanProgramRebuildPort;
  readonly downstreamValidationPort?: ProductionApplicationDownstreamValidationPort;
  readonly localityValidationPort?: ProductionApplicationLocalityValidationPort;
}
