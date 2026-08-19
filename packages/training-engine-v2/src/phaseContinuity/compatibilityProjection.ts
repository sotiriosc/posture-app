import type { PhaseState } from "../domain/phase";
import type { ProductionPhaseContinuityResult, ProductionPhaseStateRevision } from "./contracts";

export interface ProductionPhaseStateCompatibilityProjection {
  readonly phaseState: PhaseState;
  readonly decisionStatus: ProductionPhaseContinuityResult["status"];
  readonly decisionRevisionId: string;
  readonly metCriterionIds: readonly string[];
  readonly blockedCriterionIds: readonly string[];
  readonly conflicts: readonly string[];
  readonly blockers: readonly string[];
  readonly continuityClassifications: ProductionPhaseContinuityResult["continuityClassifications"];
  readonly gate16DeferralTrace: readonly string[];
  readonly stateMutationApplied: false;
  readonly noncanonical: true;
}

export function projectProductionPhaseState(
  revision: ProductionPhaseStateRevision,
  result: ProductionPhaseContinuityResult,
): ProductionPhaseStateCompatibilityProjection {
  const metCriterionIds = Object.freeze(result.criterionEvaluations.filter((entry) => entry.state === "met")
    .map((entry) => entry.criterionId).sort());
  const blockedCriterionIds = Object.freeze(result.criterionEvaluations.filter((entry) =>
    entry.state === "blocked").map((entry) => entry.criterionId).sort());
  return Object.freeze({
    phaseState: Object.freeze({ currentPhaseId: revision.currentPhaseId,
      weekInPhase: revision.weekInPhaseObservation ?? 0, metCriterionIds, blockedCriterionIds }),
    decisionStatus: result.status,
    decisionRevisionId: result.decisionRevisionId,
    metCriterionIds,
    blockedCriterionIds,
    conflicts: result.conflicts,
    blockers: result.blockers,
    continuityClassifications: result.continuityClassifications,
    gate16DeferralTrace: result.gate16DeferralTrace,
    stateMutationApplied: false,
    noncanonical: true,
  });
}

export function projectAdmittedGate15Semantics(result: ProductionPhaseContinuityResult) {
  return Object.freeze({
    status: result.status,
    detailedClassifications: result.detailedClassifications,
    criterionEvaluations: result.criterionEvaluations,
    blockers: result.blockers,
    conflicts: result.conflicts,
    trainingSafetyTrace: result.trainingSafetyTrace,
    crossHorizonAlignment: result.crossHorizonAlignment,
    continuityClassifications: result.continuityClassifications,
    stableBaseTrace: result.stableBaseTrace,
    anchorTrace: result.anchorTrace,
    prescriptionContinuityTrace: result.prescriptionContinuityTrace,
    warmupActivationTrace: result.warmupActivationTrace,
    replacementTrace: result.replacementTrace,
    rotationTrace: result.rotationTrace,
    gate16DeferralTrace: result.gate16DeferralTrace,
    automaticProgressionCount: result.automaticProgressionCount,
    automaticReplacementCount: result.automaticReplacementCount,
    automaticRotationCount: result.automaticRotationCount,
    automaticDeloadCount: result.automaticDeloadCount,
    firstFailingStage: result.firstFailingStage,
    noRescueTrace: result.noRescueTrace,
    decisionRevisionId: result.decisionRevisionId,
    stateMutationApplied: false,
    noncanonical: true,
  });
}
