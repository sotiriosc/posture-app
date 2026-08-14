import { explicitIsoTime, sameSemanticValue } from "../prescription/compiler/utilities";
import {
  PRODUCTION_PHASE_CHANGED_FACT_DIMENSIONS,
  PRODUCTION_PHASE_CHANGED_FACT_OWNERS,
  PRODUCTION_PHASE_CONTINUITY_CONTRACT_REFERENCE,
  type ProductionPhaseContinuityInput,
  type ProductionPhaseContinuityResult,
} from "./contracts";
import { validatePhaseContinuityDecisionRevisionLedger, validatePhaseCycleIdentity,
  validatePhaseStateRevisionLedger } from "./identity";
import { PRODUCTION_PHASE_EVIDENCE_SOURCE_CONTRACT_REFERENCE } from "./sourceContracts";
import { deriveProductionPhaseProgramSnapshotId, deriveProductionPhaseProgramSnapshotRevisionId,
  PRODUCTION_PHASE_PROGRAM_SNAPSHOT_CONTRACT_REFERENCE } from "./programSnapshot";

function unique(values: readonly string[]): readonly string[] {
  return Object.freeze([...new Set(values)].sort());
}

export function validateProductionPhaseContinuityContractAndInput(
  input: ProductionPhaseContinuityInput,
): readonly string[] {
  const reasons: string[] = [];
  if (!sameSemanticValue(input.contractReference, PRODUCTION_PHASE_CONTINUITY_CONTRACT_REFERENCE)) {
    reasons.push("UNSUPPORTED_PRODUCTION_PHASE_CONTINUITY_CONTRACT_VERSION");
  }
  if (!sameSemanticValue(input.evidenceSourceContract, PRODUCTION_PHASE_EVIDENCE_SOURCE_CONTRACT_REFERENCE)) {
    reasons.push("UNSUPPORTED_PRODUCTION_PHASE_EVIDENCE_SOURCE_CONTRACT_VERSION");
  }
  reasons.push(...validatePhaseCycleIdentity(input.phaseCycleIdentity));
  reasons.push(...validatePhaseStateRevisionLedger(input.phaseStateRevisionLedger));
  if (!input.decisionAttemptId.trim()) reasons.push("PHASE_DECISION_ATTEMPT_ID_REQUIRED");
  if (!explicitIsoTime(input.evaluationTime) || input.transitionProposal.evaluationTime !== input.evaluationTime) {
    reasons.push("PHASE_CONTINUITY_EVALUATION_TIME_INVALID");
  }
  if (input.phaseCycleIdentity.athleteId !== input.currentProgramSnapshot.athleteId ||
      input.phaseCycleIdentity.athleteId !== input.proposedProgramSnapshot.athleteId) {
    reasons.push("PHASE_CYCLE_PROGRAM_ATHLETE_MISMATCH");
  }
  if (input.currentPhaseStateRevision.phaseStateRevisionId !== input.phaseStateRevisionLedger.finalRevisionId ||
      !input.currentPhaseStateRevision.finalForDecision ||
      input.currentPhaseStateRevision.decisionAttemptId !== input.decisionAttemptId) {
    reasons.push("CURRENT_PHASE_STATE_FINAL_REVISION_INVALID");
  }
  const proposal = input.transitionProposal;
  if (proposal.phaseCycleId !== input.phaseCycleIdentity.phaseCycleId ||
      proposal.currentPhaseStateRevisionId !== input.currentPhaseStateRevision.phaseStateRevisionId ||
      proposal.currentPhaseId !== input.currentPhaseStateRevision.currentPhaseId ||
      proposal.proposedProgramSnapshotId !== input.proposedProgramSnapshot.snapshotId) {
    reasons.push("PHASE_TRANSITION_PROPOSAL_LINEAGE_INVALID");
  }
  const factIds = proposal.changedFacts.map((entry) => entry.factId);
  if (new Set(factIds).size !== factIds.length || proposal.changedFacts.some((entry) =>
    !entry.factId || !entry.sourceRef || !PRODUCTION_PHASE_CHANGED_FACT_OWNERS.includes(entry.owner) ||
    !PRODUCTION_PHASE_CHANGED_FACT_DIMENSIONS.includes(entry.dimension))) {
    reasons.push("PHASE_TRANSITION_CHANGED_FACT_INVALID");
  }
  if (input.priorDecisionRevisionContext) {
    reasons.push(...validatePhaseContinuityDecisionRevisionLedger(input.priorDecisionRevisionContext.ledger));
  }
  return unique(reasons);
}

export function validateProductionPhaseProgramTruth(input: ProductionPhaseContinuityInput): readonly string[] {
  const reasons: string[] = [];
  for (const snapshot of [input.currentProgramSnapshot, input.proposedProgramSnapshot]) {
    if (!sameSemanticValue(snapshot.snapshotContract, PRODUCTION_PHASE_PROGRAM_SNAPSHOT_CONTRACT_REFERENCE)) {
      reasons.push("UNSUPPORTED_PRODUCTION_PHASE_PROGRAM_SNAPSHOT_CONTRACT");
    }
    if (!snapshot.gate13Valid || snapshot.executionFeasibilityState === "invalid") {
      reasons.push("UPSTREAM_PRODUCTION_PROGRAM_INVALID");
    }
    if (snapshot.snapshotId !== deriveProductionPhaseProgramSnapshotId(snapshot)) {
      reasons.push("PRODUCTION_PHASE_PROGRAM_SNAPSHOT_IDENTITY_INVALID");
    }
    if (snapshot.snapshotRevisionId !== deriveProductionPhaseProgramSnapshotRevisionId(snapshot)) {
      reasons.push("PRODUCTION_PHASE_PROGRAM_SNAPSHOT_REVISION_IDENTITY_INVALID");
    }
    if (snapshot.completedEvidenceInferred !== false) reasons.push("PLANNED_PROGRAM_INFERRED_COMPLETED_EVIDENCE");
  }
  return unique(reasons);
}

export function validateProductionPhaseContinuityResult(result: ProductionPhaseContinuityResult): readonly string[] {
  const reasons: string[] = [];
  if (!sameSemanticValue(result.contractReference, PRODUCTION_PHASE_CONTINUITY_CONTRACT_REFERENCE)) {
    reasons.push("PHASE_CONTINUITY_RESULT_CONTRACT_INVALID");
  }
  reasons.push(...validatePhaseContinuityDecisionRevisionLedger(result.decisionRevisionLedger));
  const first = result.subgateTrace.find((entry) => entry.state === "FAIL_STOP" || entry.state === "NOT_REACHED");
  if ((first?.subgate ?? null) !== result.firstFailingStage) reasons.push("PHASE_CONTINUITY_FIRST_FAILURE_INVALID");
  const failureIndex = result.firstFailingStage ? result.subgateTrace.findIndex((entry) =>
    entry.subgate === result.firstFailingStage) : -1;
  if (failureIndex >= 0 && result.subgateTrace.slice(failureIndex + 1).some((entry) => entry.scored)) {
    reasons.push("PHASE_CONTINUITY_DOWNSTREAM_STAGE_SCORED");
  }
  if (result.stateMutationApplied !== false || result.applicationOwnerRequired !== true) {
    reasons.push("PHASE_DECISION_APPLICATION_BOUNDARY_VIOLATED");
  }
  if (result.noRescueTrace.downstreamRescueAccepted !== false) reasons.push("PHASE_CONTINUITY_DOWNSTREAM_RESCUE_ACCEPTED");
  if (result.automaticProgressionCount + result.automaticReplacementCount + result.automaticRotationCount +
      result.automaticDeloadCount > 0) reasons.push("PHASE_CONTINUITY_GATE_16_ACTION_SELECTED");
  return unique(reasons);
}
