import type { PhaseId } from "../domain/phase";

export const PRODUCTION_PHASE_EVIDENCE_SOURCE_CONTRACT_ID =
  "PRODUCTION_PHASE_EVIDENCE_SOURCE_CONTRACT" as const;
export const PRODUCTION_PHASE_EVIDENCE_SOURCE_CONTRACT_VERSION = "1.0.0" as const;

export interface ProductionPhaseEvidenceSourceContractReference {
  readonly contractId: typeof PRODUCTION_PHASE_EVIDENCE_SOURCE_CONTRACT_ID;
  readonly contractVersion: typeof PRODUCTION_PHASE_EVIDENCE_SOURCE_CONTRACT_VERSION;
}

export const PRODUCTION_PHASE_EVIDENCE_SOURCE_CONTRACT_REFERENCE:
ProductionPhaseEvidenceSourceContractReference = Object.freeze({
  contractId: PRODUCTION_PHASE_EVIDENCE_SOURCE_CONTRACT_ID,
  contractVersion: PRODUCTION_PHASE_EVIDENCE_SOURCE_CONTRACT_VERSION,
});

export const PRODUCTION_PHASE_EVIDENCE_OWNERS = [
  "performance_summary",
  "completed_session_summary",
  "training_response_receiver",
  "progression_readiness",
  "training_safety",
  "coach_review",
  "clinician_restriction",
  "athlete_report",
  "product_adherence",
  "planned_program_truth",
  "unknown",
] as const;
export type ProductionPhaseEvidenceOwner = typeof PRODUCTION_PHASE_EVIDENCE_OWNERS[number];

export const PRODUCTION_PHASE_EVIDENCE_QUALITIES = [
  "validated_completed",
  "reviewed_structured",
  "structured_observation",
  "planned_only",
  "unknown",
] as const;
export type ProductionPhaseEvidenceQuality = typeof PRODUCTION_PHASE_EVIDENCE_QUALITIES[number];

export const PRODUCTION_PHASE_EVIDENCE_CLASSIFICATIONS = [
  "supports_criterion",
  "contradicts_criterion",
  "insufficient_observation",
  "mixed_evidence",
  "not_applicable",
  "invalid_source",
  "unknown",
] as const;
export type ProductionPhaseEvidenceClassification =
  typeof PRODUCTION_PHASE_EVIDENCE_CLASSIFICATIONS[number];

export const PRODUCTION_PHASE_REPEATED_EVIDENCE_STATES = [
  "isolated_observation",
  "repeated_consistent_evidence",
  "repeated_mixed_evidence",
  "insufficient_history",
  "unknown",
] as const;
export type ProductionPhaseRepeatedEvidenceState =
  typeof PRODUCTION_PHASE_REPEATED_EVIDENCE_STATES[number];

export const PRODUCTION_PHASE_REPEATED_EVIDENCE_BASES = [
  "not_required",
  "distinct_source_records",
  "distinct_completed_exposures",
  "distinct_completed_sessions",
  "reviewed_aggregate_multiple_observations",
  "insufficient_unique_observations",
  "unknown",
] as const;
export type ProductionPhaseRepeatedEvidenceBasis =
  typeof PRODUCTION_PHASE_REPEATED_EVIDENCE_BASES[number];

export const PRODUCTION_PHASE_SOURCE_AUTHORITIES = [
  "production_owner_validated",
  "reviewed_external_authority",
  "caller_validated_summary",
  "planned_program_validator",
  "unknown",
] as const;
export type ProductionPhaseSourceAuthority = typeof PRODUCTION_PHASE_SOURCE_AUTHORITIES[number];

export interface ProductionPhaseEvidenceSourceRecord {
  readonly sourceRecordId: string;
  readonly owner: ProductionPhaseEvidenceOwner;
  readonly sourceAuthority: ProductionPhaseSourceAuthority;
  readonly occurredAt: string;
  readonly completedObservation: boolean;
  readonly provenance: readonly string[];
}

export interface ProductionPhaseCriterionEvidenceRecord {
  readonly evidenceContract: ProductionPhaseEvidenceSourceContractReference;
  readonly evidenceRecordId: string;
  readonly criterionId: string;
  readonly athleteId: string;
  readonly phaseCycleId: string;
  readonly phaseStateRevisionId: string;
  readonly currentPhaseId: PhaseId;
  readonly sourceOwner: ProductionPhaseEvidenceOwner;
  readonly sourceRecordRefs: readonly string[];
  readonly distinctExposureIds: readonly string[];
  readonly distinctSessionIds: readonly string[];
  readonly evidenceQuality: ProductionPhaseEvidenceQuality;
  readonly evidenceClassification: ProductionPhaseEvidenceClassification;
  readonly repeatedEvidenceState: ProductionPhaseRepeatedEvidenceState;
  readonly repeatedEvidenceBasis: ProductionPhaseRepeatedEvidenceBasis;
  readonly observedInterval: {
    readonly startsAt: string;
    readonly endsAt: string;
  };
  readonly appliesThrough: string;
  readonly supportsTransition: boolean;
  readonly contradictsTransition: boolean;
  readonly uncertaintyState: "none" | "unknown" | "conflicting";
  readonly sourceAuthority: ProductionPhaseSourceAuthority;
  readonly reviewState: "accepted" | "review_required" | "unknown";
  readonly provenance: readonly string[];
}

export interface ProductionPhaseEvidenceSnapshot {
  readonly evidenceContract: ProductionPhaseEvidenceSourceContractReference;
  readonly evidenceSnapshotId: string;
  readonly evidenceSnapshotRevisionId: string;
  readonly athleteId: string;
  readonly phaseCycleId: string;
  readonly phaseStateRevisionId: string;
  readonly sourceRecords: readonly ProductionPhaseEvidenceSourceRecord[];
  readonly criterionRecords: readonly ProductionPhaseCriterionEvidenceRecord[];
  readonly unresolvedSourceOwners: readonly ProductionPhaseEvidenceOwner[];
  readonly evaluationTime: string;
  readonly provenance: readonly string[];
}

export interface ProductionPhasePerformanceSummary {
  readonly summaryId: string;
  readonly athleteId: string;
  readonly completedSessionIds: readonly string[];
  readonly completedExposureIds: readonly string[];
  readonly executionQuality: "stable" | "mixed" | "insufficient" | "unknown";
  readonly observedInterval: { readonly startsAt: string; readonly endsAt: string };
  readonly sourceAuthority: "caller_validated_summary";
}

export interface ProductionCompletedSessionSummary {
  readonly summaryId: string;
  readonly athleteId: string;
  readonly sessionId: string;
  readonly completedExposureIds: readonly string[];
  readonly completedAt: string;
  readonly sourceAuthority: "caller_validated_summary";
}

export interface ProductionPhaseAdherenceSummary {
  readonly summaryId: string;
  readonly athleteId: string;
  readonly completedSessionIds: readonly string[];
  readonly missedSessionIds: readonly string[];
  readonly observedInterval: { readonly startsAt: string; readonly endsAt: string };
  readonly sourceAuthority: "caller_validated_summary";
}
