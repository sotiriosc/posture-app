import { stableId } from "../prescription/compiler/utilities";
import type {
  PhaseCycleIdentity,
  ProductionPhaseContinuityDecisionRevision,
  ProductionPhaseContinuityDecisionRevisionContext,
  ProductionPhaseContinuityDecisionRevisionLedger,
  ProductionPhaseStateIdentity,
  ProductionPhaseStateRevisionLedger,
} from "./contracts";
import type { PhaseContinuityPolicyReference } from "./policies";

export function derivePhaseCycleId(input: {
  readonly athleteId: string;
  readonly sourceProgramLineageId: string;
  readonly sourceHorizonLineageId: string;
}): string {
  return stableId("phase-cycle", { athleteId: input.athleteId,
    sourceProgramLineageId: input.sourceProgramLineageId,
    sourceHorizonLineageId: input.sourceHorizonLineageId });
}

export function derivePhaseStateId(input: {
  readonly athleteId: string;
  readonly phaseCycleId: string;
}): string {
  return stableId("phase-state", { athleteId: input.athleteId, phaseCycleId: input.phaseCycleId });
}

export function derivePhaseStateRevisionId(input: {
  readonly phaseStateId: string;
  readonly basedOnRevisionId: string | null;
  readonly currentPhaseId: string;
  readonly evidenceSnapshotId: string;
  readonly createdAt: string;
  readonly decisionAttemptId: string;
}): string {
  return stableId("phase-state-revision", { phaseStateId: input.phaseStateId,
    basedOnRevisionId: input.basedOnRevisionId, currentPhaseId: input.currentPhaseId,
    evidenceSnapshotId: input.evidenceSnapshotId, createdAt: input.createdAt,
    decisionAttemptId: input.decisionAttemptId });
}

export function derivePhaseContinuityDecisionId(input: {
  readonly kernelContract: string;
  readonly athleteId: string;
  readonly phaseCycleId: string;
  readonly phaseStateId: string;
  readonly transitionProposalId: string;
  readonly decisionAttemptId: string;
}): string {
  return stableId("phase-continuity-decision", { kernelContract: input.kernelContract,
    athleteId: input.athleteId, phaseCycleId: input.phaseCycleId, phaseStateId: input.phaseStateId,
    transitionProposalId: input.transitionProposalId, decisionAttemptId: input.decisionAttemptId });
}

export function derivePhaseContinuityDecisionRevisionId(input: {
  readonly decisionId: string;
  readonly policyRef: PhaseContinuityPolicyReference | null;
  readonly evidenceSnapshotRevisionId: string;
  readonly currentProgramSnapshotRevisionId: string;
  readonly proposedProgramSnapshotRevisionId: string;
  readonly phaseStateRevisionId: string;
  readonly createdAt: string;
  readonly basedOnRevisionId: string | null;
}): string {
  return stableId("phase-continuity-decision-revision", { decisionId: input.decisionId,
    policyRef: input.policyRef, evidenceSnapshotRevisionId: input.evidenceSnapshotRevisionId,
    currentProgramSnapshotRevisionId: input.currentProgramSnapshotRevisionId,
    proposedProgramSnapshotRevisionId: input.proposedProgramSnapshotRevisionId,
    phaseStateRevisionId: input.phaseStateRevisionId, createdAt: input.createdAt,
    basedOnRevisionId: input.basedOnRevisionId });
}

function unique(values: readonly string[]): boolean {
  return new Set(values).size === values.length;
}

function explicitTime(value: string): boolean {
  return /(?:Z|[+-]\d{2}:\d{2})$/.test(value) && !Number.isNaN(Date.parse(value));
}

export function validatePhaseCycleIdentity(value: PhaseCycleIdentity): readonly string[] {
  const reasons: string[] = [];
  if (!value.phaseCycleId || !value.athleteId || !value.sourceProgramLineageId ||
      !value.sourceHorizonLineageId || !value.sourceRef) reasons.push("PHASE_CYCLE_IDENTITY_INCOMPLETE");
  if (!explicitTime(value.createdAt)) reasons.push("PHASE_CYCLE_CREATED_AT_INVALID");
  if (value.phaseCycleId !== derivePhaseCycleId(value)) reasons.push("PHASE_CYCLE_IDENTITY_NOT_LINEAGE_DERIVED");
  return Object.freeze(reasons.sort());
}

export function validatePhaseStateRevisionLedger(
  ledger: ProductionPhaseStateRevisionLedger,
): readonly string[] {
  const reasons: string[] = [];
  if (ledger.revisions.length === 0) reasons.push("PHASE_STATE_REVISION_LEDGER_EMPTY");
  if (!unique(ledger.revisions.map((entry) => entry.phaseStateRevisionId))) {
    reasons.push("DUPLICATE_PHASE_STATE_REVISION_ID");
  }
  const final = ledger.revisions.filter((entry) => entry.finalForDecision);
  if (final.length !== 1 || final[0]?.phaseStateRevisionId !== ledger.finalRevisionId) {
    reasons.push("EXACTLY_ONE_FINAL_PHASE_STATE_REVISION_REQUIRED");
  }
  for (let index = 0; index < ledger.revisions.length; index += 1) {
    const revision = ledger.revisions[index];
    if (revision.phaseStateIdentity.phaseStateId !== ledger.phaseStateId ||
        revision.automaticAdvancementAuthority !== false || !explicitTime(revision.createdAt)) {
      reasons.push("PHASE_STATE_REVISION_INVALID");
    }
    if (revision.phaseStateIdentity.phaseStateId !== derivePhaseStateId({
      athleteId: revision.phaseStateIdentity.athleteId,
      phaseCycleId: revision.phaseStateIdentity.phaseCycleId,
    })) reasons.push("PHASE_STATE_IDENTITY_NOT_LINEAGE_DERIVED");
    const expectedBasedOn = index === 0 ? null : ledger.revisions[index - 1].phaseStateRevisionId;
    if (revision.basedOnRevisionId !== expectedBasedOn) reasons.push("PHASE_STATE_REVISION_LINEAGE_INVALID");
    if (revision.phaseStateRevisionId !== derivePhaseStateRevisionId({
      phaseStateId: revision.phaseStateIdentity.phaseStateId,
      basedOnRevisionId: revision.basedOnRevisionId,
      currentPhaseId: revision.currentPhaseId,
      evidenceSnapshotId: revision.evidenceSnapshotId,
      createdAt: revision.createdAt,
      decisionAttemptId: revision.decisionAttemptId,
    })) reasons.push("PHASE_STATE_REVISION_IDENTITY_INVALID");
  }
  if (ledger.finalizedHistoricalRevisionIds.some((id) => !ledger.revisions.some((entry) =>
    entry.phaseStateRevisionId === id))) reasons.push("PHASE_STATE_HISTORICAL_FINAL_REVISION_MISSING");
  return Object.freeze([...new Set(reasons)].sort());
}

export function validatePhaseContinuityDecisionRevisionLedger(
  ledger: ProductionPhaseContinuityDecisionRevisionLedger,
): readonly string[] {
  const reasons: string[] = [];
  if (ledger.revisions.length === 0) reasons.push("PHASE_DECISION_REVISION_LEDGER_EMPTY");
  if (!unique(ledger.revisions.map((entry) => entry.decisionRevisionId))) {
    reasons.push("DUPLICATE_PHASE_DECISION_REVISION_ID");
  }
  const final = ledger.revisions.filter((entry) => entry.final);
  if (final.length !== 1 || final[0]?.decisionRevisionId !== ledger.finalRevisionId) {
    reasons.push("EXACTLY_ONE_FINAL_PHASE_DECISION_REVISION_REQUIRED");
  }
  for (let index = 0; index < ledger.revisions.length; index += 1) {
    const revision = ledger.revisions[index];
    const expectedBasedOn = index === 0 ? null : ledger.revisions[index - 1].decisionRevisionId;
    if (revision.decisionId !== ledger.decisionId || revision.basedOnRevisionId !== expectedBasedOn ||
        !explicitTime(revision.createdAt)) reasons.push("PHASE_DECISION_REVISION_LINEAGE_INVALID");
    if (revision.decisionRevisionId !== derivePhaseContinuityDecisionRevisionId(revision)) {
      reasons.push("PHASE_DECISION_REVISION_IDENTITY_INVALID");
    }
  }
  if (ledger.finalizedHistoricalRevisionIds.some((id) => !ledger.revisions.some((entry) =>
    entry.decisionRevisionId === id))) reasons.push("PHASE_DECISION_HISTORICAL_FINAL_REVISION_MISSING");
  return Object.freeze([...new Set(reasons)].sort());
}

export function buildPhaseContinuityDecisionRevision(input: {
  readonly decisionId: string;
  readonly policyRef: PhaseContinuityPolicyReference | null;
  readonly evidenceSnapshotRevisionId: string;
  readonly currentProgramSnapshotRevisionId: string;
  readonly proposedProgramSnapshotRevisionId: string;
  readonly phaseStateRevisionId: string;
  readonly evaluationTime: string;
  readonly contentFingerprint: string;
  readonly priorContext: ProductionPhaseContinuityDecisionRevisionContext | null;
}): { readonly revision: ProductionPhaseContinuityDecisionRevision;
  readonly ledger: ProductionPhaseContinuityDecisionRevisionLedger } {
  const prior = input.priorContext?.ledger.revisions ?? [];
  const basedOnRevisionId = input.priorContext?.ledger.finalRevisionId ?? null;
  const revision = Object.freeze({
    decisionId: input.decisionId,
    decisionRevisionId: derivePhaseContinuityDecisionRevisionId({ decisionId: input.decisionId,
      policyRef: input.policyRef, evidenceSnapshotRevisionId: input.evidenceSnapshotRevisionId,
      currentProgramSnapshotRevisionId: input.currentProgramSnapshotRevisionId,
      proposedProgramSnapshotRevisionId: input.proposedProgramSnapshotRevisionId,
      phaseStateRevisionId: input.phaseStateRevisionId, createdAt: input.evaluationTime, basedOnRevisionId }),
    basedOnRevisionId,
    reasonCode: input.priorContext?.reasonCode ?? "initial_evaluation",
    policyRef: input.policyRef,
    evidenceSnapshotRevisionId: input.evidenceSnapshotRevisionId,
    currentProgramSnapshotRevisionId: input.currentProgramSnapshotRevisionId,
    proposedProgramSnapshotRevisionId: input.proposedProgramSnapshotRevisionId,
    phaseStateRevisionId: input.phaseStateRevisionId,
    createdAt: input.evaluationTime,
    final: true as const,
    decisionContentFingerprint: input.contentFingerprint,
    provenance: Object.freeze(["production-kernel:PRODUCTION_PHASE_CONTINUITY_KERNEL@1.0.0"]),
  });
  const historical = prior.map((entry) => Object.freeze({ ...entry, final: false as const }));
  return Object.freeze({ revision, ledger: Object.freeze({ decisionId: input.decisionId,
    revisions: Object.freeze([...historical, revision]), finalRevisionId: revision.decisionRevisionId,
    finalizedHistoricalRevisionIds: Object.freeze(prior.map((entry) => entry.decisionRevisionId)) }) });
}

export function buildPhaseStateIdentity(input: {
  readonly cycle: PhaseCycleIdentity;
  readonly createdAt: string;
  readonly owner: ProductionPhaseStateIdentity["owner"];
  readonly provenance: readonly string[];
}): ProductionPhaseStateIdentity {
  return Object.freeze({ phaseStateId: derivePhaseStateId(input.cycle),
    phaseCycleId: input.cycle.phaseCycleId, athleteId: input.cycle.athleteId,
    createdAt: input.createdAt, owner: input.owner, provenance: Object.freeze([...input.provenance]) });
}
