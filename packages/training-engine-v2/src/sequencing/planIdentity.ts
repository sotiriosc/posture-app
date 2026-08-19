import type {
  FinalSequencingSearchResourcePolicy,
  ProductionFinalSessionSequencingContractReference,
  ProductionSequencingAssignmentFact,
  ExplicitProductionSequencingTransitionFact,
} from "./contracts";
import type { FinalSessionSequencingPolicyReference } from "./policies/contracts";

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, child]) => child !== undefined)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, child]) => [key, canonicalize(child)]),
    );
  }
  return value;
}

function fnv1a(value: string, seed: number): number {
  let hash = seed >>> 0;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash;
}

export function finalSequencingDeterministicToken(value: unknown): string {
  const source = JSON.stringify(canonicalize(value));
  const parts = [0x811c9dc5, 0x9e3779b9, 0x85ebca6b, 0xc2b2ae35]
    .map((seed) => fnv1a(source, seed).toString(16).padStart(8, "0"));
  return parts.join("");
}

export function buildFinalSessionSequencePlanId(input: {
  readonly sequencingContract: ProductionFinalSessionSequencingContractReference;
  readonly sessionIntentId: string;
  readonly executionAttemptId: string;
}): string {
  return `final-sequence-plan:${finalSequencingDeterministicToken({
    contractId: input.sequencingContract.contractId,
    sessionIntentId: input.sessionIntentId,
    executionAttemptId: input.executionAttemptId,
  })}`;
}

export function buildFinalSessionSequenceRevisionId(input: {
  readonly sequencingContract: ProductionFinalSessionSequencingContractReference;
  readonly sequencePlanId: string;
  readonly policyRef: FinalSessionSequencingPolicyReference;
  readonly assignments: readonly ProductionSequencingAssignmentFact[];
  readonly transitionFacts: readonly ExplicitProductionSequencingTransitionFact[];
  readonly searchResourcePolicy: FinalSequencingSearchResourcePolicy;
  readonly evaluationTime: string;
  readonly priorRevisionId: string | null;
}): string {
  return `final-sequence-revision:${finalSequencingDeterministicToken({
    sequencingContract: input.sequencingContract,
    sequencePlanId: input.sequencePlanId,
    policyRef: input.policyRef,
    assignments: [...input.assignments]
      .sort((left, right) => left.assignmentId.localeCompare(right.assignmentId))
      .map((fact) => ({
        assignmentId: fact.assignmentId,
        exerciseId: fact.exerciseId,
        section: fact.section,
        role: fact.role,
        sourceExposureEventId: fact.sourceExposureEventId,
        prescriptionId: fact.prescriptionId,
        finalPrescriptionRevisionId: fact.finalPrescriptionRevisionId,
        orderedDoseBlockIds: fact.orderedDoseBlockIds,
        withinExerciseRestInstructionIds: fact.withinExerciseRestInstructionIds,
        satisfiedNeedIds: [...fact.satisfiedNeedIds].sort(),
        dependencyAssignmentIds: [...fact.dependencyAssignmentIds].sort(),
        dependencyIds: [...fact.dependencyIds].sort(),
        needPriorities: [...fact.needPriorities],
        plannerPriorityOrders: [...fact.plannerPriorityOrders],
        requiredDirectObjective: fact.requiredDirectObjective,
        dominantPurposeRelationship: fact.dominantPurposeRelationship,
        continuityClassification: fact.continuityClassification,
        executionReadiness: fact.executionReadiness,
        unresolvedRequirementIds: [...fact.unresolvedRequirementIds].sort(),
        setupSignature: fact.setupSignature,
        supportSignature: fact.supportSignature,
        resistancePathSignature: fact.resistancePathSignature,
        equipmentRealizationId: fact.equipmentRealizationId,
        equipmentSignature: fact.equipmentSignature,
        localFatigue: fact.localFatigue,
        systemicFatigue: fact.systemicFatigue,
        axialLoading: fact.axialLoading,
        intrinsicStressFacts: [...fact.intrinsicStressFacts].sort(),
        potentialStressFacts: [...fact.potentialStressFacts].sort(),
        gripLoadingPotential: fact.gripLoadingPotential,
        trunkBracingPotential: fact.trunkBracingPotential,
        prescriptionEffortFacts: fact.prescriptionEffortFacts,
        prescriptionDurationInterval: fact.prescriptionDurationInterval,
      })),
    transitionFacts: [...input.transitionFacts]
      .sort((left, right) => left.transitionFactId.localeCompare(right.transitionFactId))
      .map((fact) => ({
        ...fact,
        target: fact.target.kind === "interference"
          ? {
            ...fact.target,
            value: {
              ...fact.target.value,
              basis: [...fact.target.value.basis].sort(),
              affectedActiveNeedIds: [...fact.target.value.affectedActiveNeedIds].sort(),
            },
          }
          : fact.target,
      })),
    searchResourcePolicy: {
      policyId: input.searchResourcePolicy.policyId,
      version: input.searchResourcePolicy.version,
      mode: input.searchResourcePolicy.mode,
      maximumStatesExpanded: input.searchResourcePolicy.maximumStatesExpanded,
      maximumLegalCompleteOrdersEvaluated: input.searchResourcePolicy.maximumLegalCompleteOrdersEvaluated,
      onLimit: input.searchResourcePolicy.onLimit,
    },
    evaluationTime: input.evaluationTime,
    priorRevisionId: input.priorRevisionId,
  })}`;
}
