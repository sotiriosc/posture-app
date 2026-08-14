import type { TrainingReadinessTrace } from "../domain/trainingSafety";
import type { ProgressionReadinessTrace } from "../prescription/progressionEvidence";
import type { TrainingResponseReceiverTrace } from "../trainingResponseReceiver";
import type { ProductionPostPrescriptionWeekValidationResult } from "../weekValidation/contracts";
import { stableId } from "../prescription/compiler/utilities";
import {
  PRODUCTION_PHASE_EVIDENCE_SOURCE_CONTRACT_REFERENCE,
  type ProductionPhaseEvidenceSnapshot,
  type ProductionPhaseEvidenceSourceRecord,
} from "./sourceContracts";

export interface ProductionPhaseEvidenceAdapterContext {
  readonly athleteId: string;
  readonly phaseCycleId: string;
  readonly phaseStateRevisionId: string;
  readonly evaluationTime: string;
}

function immutableSourceRecord(record: ProductionPhaseEvidenceSourceRecord): ProductionPhaseEvidenceSourceRecord {
  return Object.freeze({ ...record, provenance: Object.freeze([...record.provenance]) });
}

function immutableCriterionRecord(
  record: ProductionPhaseEvidenceSnapshot["criterionRecords"][number],
): ProductionPhaseEvidenceSnapshot["criterionRecords"][number] {
  return Object.freeze({ ...record,
    sourceRecordRefs: Object.freeze([...record.sourceRecordRefs]),
    distinctExposureIds: Object.freeze([...record.distinctExposureIds]),
    distinctSessionIds: Object.freeze([...record.distinctSessionIds]),
    observedInterval: Object.freeze({ ...record.observedInterval }),
    provenance: Object.freeze([...record.provenance]),
  });
}

export function adaptTrainingSafetyToPhaseEvidence(
  trace: TrainingReadinessTrace,
): readonly ProductionPhaseEvidenceSourceRecord[] {
  return Object.freeze(trace.evidence.map((entry) => Object.freeze({
    sourceRecordId: entry.signalId,
    owner: "training_safety" as const,
    sourceAuthority: "production_owner_validated" as const,
    occurredAt: entry.authority.reportedAt,
    completedObservation: true,
    provenance: Object.freeze([entry.authority.sourceRef, ...entry.authority.evidenceBasis]),
  })));
}

export function adaptTrainingResponseReceiverToPhaseEvidence(
  traces: readonly TrainingResponseReceiverTrace[],
  evaluationTime: string,
): readonly ProductionPhaseEvidenceSourceRecord[] {
  return Object.freeze(traces.flatMap((trace) => [
    ...trace.exactRealizationEvidence,
    ...trace.relatedRealizationEvidence,
    ...trace.exerciseIdentityHistory,
  ].map((entry) => Object.freeze({
    sourceRecordId: entry.observationId,
    owner: "training_response_receiver" as const,
    sourceAuthority: "production_owner_validated" as const,
    occurredAt: evaluationTime,
    completedObservation: true,
    provenance: Object.freeze([`response:${trace.exerciseId}:${trace.prescriptionId}`]),
  }))));
}

export function adaptProgressionReadinessToPhaseEvidence(
  traces: readonly ProgressionReadinessTrace[],
  evaluationTime: string,
): readonly ProductionPhaseEvidenceSourceRecord[] {
  return Object.freeze(traces.flatMap((trace) => trace.evidence.evidenceRecordIds.map((recordId) => Object.freeze({
    sourceRecordId: recordId,
    owner: "progression_readiness" as const,
    sourceAuthority: "production_owner_validated" as const,
    occurredAt: evaluationTime,
    completedObservation: true,
    provenance: Object.freeze([`progression-review:${trace.exerciseId}:${trace.prescriptionId}`]),
  }))));
}

export function adaptPostPrescriptionWeekToPlannedProgramEvidence(
  result: ProductionPostPrescriptionWeekValidationResult,
  evaluationTime: string,
): ProductionPhaseEvidenceSourceRecord {
  return Object.freeze({ sourceRecordId: result.validationRevisionId, owner: "planned_program_truth",
    sourceAuthority: "planned_program_validator", occurredAt: evaluationTime,
    completedObservation: false,
    provenance: Object.freeze([result.validationId, result.sourceSnapshotRevisionId]) });
}

export function buildProductionPhaseEvidenceSnapshot(input: {
  readonly context: ProductionPhaseEvidenceAdapterContext;
  readonly sourceRecords: readonly ProductionPhaseEvidenceSourceRecord[];
  readonly criterionRecords: ProductionPhaseEvidenceSnapshot["criterionRecords"];
  readonly unresolvedSourceOwners?: ProductionPhaseEvidenceSnapshot["unresolvedSourceOwners"];
  readonly basedOnRevisionId?: string | null;
  readonly provenance: readonly string[];
}): ProductionPhaseEvidenceSnapshot {
  const sourceRecords = input.sourceRecords.map(immutableSourceRecord);
  const criterionRecords = input.criterionRecords.map(immutableCriterionRecord);
  const stable = { athleteId: input.context.athleteId, phaseCycleId: input.context.phaseCycleId,
    phaseStateRevisionId: input.context.phaseStateRevisionId };
  const evidenceSnapshotId = stableId("production-phase-evidence", stable);
  const evidenceSnapshotRevisionId = stableId("production-phase-evidence-revision", {
    evidenceSnapshotId, sourceRecordIds: sourceRecords.map((entry) => entry.sourceRecordId).sort(),
    criterionRecordIds: criterionRecords.map((entry) => entry.evidenceRecordId).sort(),
    evaluationTime: input.context.evaluationTime, basedOnRevisionId: input.basedOnRevisionId ?? null,
  });
  return Object.freeze({ evidenceContract: PRODUCTION_PHASE_EVIDENCE_SOURCE_CONTRACT_REFERENCE,
    evidenceSnapshotId, evidenceSnapshotRevisionId, athleteId: input.context.athleteId,
    phaseCycleId: input.context.phaseCycleId, phaseStateRevisionId: input.context.phaseStateRevisionId,
    sourceRecords: Object.freeze(sourceRecords.sort((a, b) => a.sourceRecordId.localeCompare(b.sourceRecordId))),
    criterionRecords: Object.freeze(criterionRecords.sort((a, b) =>
      a.evidenceRecordId.localeCompare(b.evidenceRecordId))),
    unresolvedSourceOwners: Object.freeze([...(input.unresolvedSourceOwners ?? [])].sort()),
    evaluationTime: input.context.evaluationTime,
    provenance: Object.freeze([...new Set(input.provenance)].sort()) });
}
