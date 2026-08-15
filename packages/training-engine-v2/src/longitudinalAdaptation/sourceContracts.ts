import type { ExerciseDoseMode } from "../prescription/dose";
import { stableId } from "../prescription/compiler/utilities";

export const PRODUCTION_LONGITUDINAL_OUTCOME_SOURCE_CONTRACT_ID =
  "PRODUCTION_LONGITUDINAL_OUTCOME_SOURCE_CONTRACT" as const;
export const PRODUCTION_LONGITUDINAL_OUTCOME_SOURCE_CONTRACT_VERSION = "1.0.0" as const;
export const PRODUCTION_LONGITUDINAL_OUTCOME_SOURCE_CONTRACT_REFERENCE = Object.freeze({
  contractId: PRODUCTION_LONGITUDINAL_OUTCOME_SOURCE_CONTRACT_ID,
  contractVersion: PRODUCTION_LONGITUDINAL_OUTCOME_SOURCE_CONTRACT_VERSION,
});
export type ProductionLongitudinalOutcomeSourceContractReference =
  typeof PRODUCTION_LONGITUDINAL_OUTCOME_SOURCE_CONTRACT_REFERENCE;

export const PRODUCTION_LONGITUDINAL_OUTCOME_SOURCE_OWNERS = Object.freeze([
  "exercise_performance", "completed_session_summary", "training_response_receiver", "recovery_summary",
  "adherence_summary", "progression_readiness", "training_safety", "phase_continuity", "coach_review",
  "clinician_restriction", "athlete_report", "planned_program_truth", "unknown",
] as const);
export type ProductionLongitudinalOutcomeSourceOwner =
  typeof PRODUCTION_LONGITUDINAL_OUTCOME_SOURCE_OWNERS[number];

export const PRODUCTION_LONGITUDINAL_OUTCOME_SIGNALS = Object.freeze([
  "productive_completion", "first_completed_exposure", "isolated_success", "repeated_success",
  "appropriate_challenge", "target_met", "target_partially_met", "target_failed",
  "repeated_target_failure", "quality_met", "quality_not_met", "tolerated_response", "limited_response",
  "adverse_response", "repeated_adverse_response", "successful_reexposure", "recovery_adequate",
  "recovery_concern", "recovery_unknown", "adherence_constraint", "progression_ready",
  "progression_not_ready", "plateau", "replacement_consideration", "prescription_review_attempted",
  "prescription_review_exhausted", "rotation_preference", "equivalent_candidate_pool",
  "week_reallocation_aggregate", "deload_review_aggregate", "phase_review_requested", "safety_block",
  "external_review_required", "mixed_evidence", "unknown_evidence",
] as const);
export type ProductionLongitudinalOutcomeSignal = typeof PRODUCTION_LONGITUDINAL_OUTCOME_SIGNALS[number];

export const PRODUCTION_LONGITUDINAL_SOURCE_REVISION_STATES = Object.freeze([
  "active", "corrected", "superseded", "withdrawn", "invalid", "unknown",
] as const);
export type ProductionLongitudinalSourceRevisionState =
  typeof PRODUCTION_LONGITUDINAL_SOURCE_REVISION_STATES[number];

export const PRODUCTION_LONGITUDINAL_REALIZATION_DIFFERENCES = Object.freeze([
  "exercise_identity", "prescription_lineage", "assignment_lineage", "dose_mode", "equipment", "support",
  "range", "lever", "laterality", "side", "load", "effort", "tempo", "rest", "block_structure",
  "completion", "quality", "timing", "substitution", "unknown",
] as const);
export type ProductionLongitudinalRealizationDifference =
  typeof PRODUCTION_LONGITUDINAL_REALIZATION_DIFFERENCES[number];

export type ProductionLongitudinalEvidenceApplicability =
  | "EXACT_REALIZATION_EVIDENCE"
  | "RELATED_REALIZATION_EVIDENCE"
  | "EXERCISE_IDENTITY_HISTORY";

export interface ProductionLongitudinalRealizationContext {
  readonly exerciseId: string;
  readonly prescriptionLineageId: string | null;
  readonly assignmentLineageId: string | null;
  readonly doseMode: ExerciseDoseMode | null;
  readonly equipmentIds: readonly string[];
  readonly supportKey: string | null;
  readonly rangeKey: string | null;
  readonly leverKey: string | null;
  readonly laterality: "unilateral" | "bilateral" | "alternating" | "unknown" | null;
  readonly side: "left" | "right" | "bilateral" | "alternating" | "unknown" | null;
  readonly loadKey: string | null;
  readonly effortKey: string | null;
  readonly tempoKey: string | null;
  readonly restKey: string | null;
  readonly plannedBlockIds: readonly string[];
  readonly actualBlockResultIds: readonly string[];
}

export interface ProductionLongitudinalOutcomeSourceRecord {
  readonly sourceRecordId: string;
  readonly sourceRecordRevisionId: string;
  readonly basedOnRevisionId: string | null;
  readonly owner: ProductionLongitudinalOutcomeSourceOwner;
  readonly upstreamSourceRecordIds: readonly string[];
  readonly athleteId: string;
  readonly targetId: string;
  readonly targetScope: string;
  readonly sourceExposureEventId: string | null;
  readonly sessionId: string | null;
  readonly opportunityId: string | null;
  readonly reservationId: string | null;
  readonly realization: ProductionLongitudinalRealizationContext | null;
  readonly declaredApplicability: ProductionLongitudinalEvidenceApplicability;
  readonly observedAt: string;
  readonly recordedAt: string;
  readonly appliesThrough: string | null;
  readonly confidence: "high" | "moderate" | "low" | "unknown";
  readonly reviewState: "validated" | "reviewed" | "pending" | "unknown";
  readonly revisionState: ProductionLongitudinalSourceRevisionState;
  readonly finalForSourceRecord: boolean;
  readonly signals: readonly ProductionLongitudinalOutcomeSignal[];
  readonly reviewedAggregateSourceEventIds: readonly string[];
  readonly provenance: readonly string[];
}

export interface ProductionLongitudinalOutcomeSourceSnapshot {
  readonly contractReference: ProductionLongitudinalOutcomeSourceContractReference;
  readonly snapshotId: string;
  readonly snapshotRevisionId: string;
  readonly basedOnRevisionId: string | null;
  readonly athleteId: string;
  readonly sourceRecords: readonly ProductionLongitudinalOutcomeSourceRecord[];
  readonly activeSourceRecordRevisionIds: readonly string[];
  readonly unresolvedSourceOwners: readonly ProductionLongitudinalOutcomeSourceOwner[];
  readonly evaluationTime: string;
  readonly provenance: readonly string[];
}

export function deriveProductionLongitudinalSourceRecordId(input: Pick<ProductionLongitudinalOutcomeSourceRecord,
  "owner" | "upstreamSourceRecordIds" | "athleteId" | "sourceExposureEventId" | "sessionId"> & {
    readonly observationKind: string;
  }): string {
  return stableId("production-longitudinal-source", {
    owner: input.owner, upstreamSourceRecordIds: [...input.upstreamSourceRecordIds].sort(), athleteId: input.athleteId,
    sourceExposureEventId: input.sourceExposureEventId, sessionId: input.sessionId,
    observationKind: input.observationKind,
  });
}

export function deriveProductionLongitudinalSourceRecordRevisionId(
  input: Omit<ProductionLongitudinalOutcomeSourceRecord, "sourceRecordRevisionId" | "provenance">,
): string {
  return stableId("production-longitudinal-source-revision", { ...input,
    upstreamSourceRecordIds: [...input.upstreamSourceRecordIds].sort(),
    signals: [...input.signals].sort(),
    reviewedAggregateSourceEventIds: [...input.reviewedAggregateSourceEventIds].sort(),
    realization: input.realization ? { ...input.realization,
      equipmentIds: [...input.realization.equipmentIds].sort(),
      plannedBlockIds: [...input.realization.plannedBlockIds].sort(),
      actualBlockResultIds: [...input.realization.actualBlockResultIds].sort() } : null,
  });
}

export function deriveProductionLongitudinalSourceSnapshotRevisionId(input: Pick<
ProductionLongitudinalOutcomeSourceSnapshot, "snapshotId" | "basedOnRevisionId" | "sourceRecords" |
"activeSourceRecordRevisionIds" | "evaluationTime">): string {
  return stableId("production-longitudinal-source-snapshot-revision", {
    snapshotId: input.snapshotId, basedOnRevisionId: input.basedOnRevisionId,
    sourceRecordRevisionIds: input.sourceRecords.map((record) => record.sourceRecordRevisionId).sort(),
    activeSourceRecordRevisionIds: [...input.activeSourceRecordRevisionIds].sort(),
    evaluationTime: input.evaluationTime,
  });
}
