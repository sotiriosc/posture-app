import type {
  ProductionPhaseContinuityInput,
  ProductionPhaseCriterionEvaluation,
} from "./contracts";
import type { ProductionPhaseCriterionDefinition } from "./policies";
import type {
  ProductionPhaseCriterionEvidenceRecord,
  ProductionPhaseEvidenceQuality,
} from "./sourceContracts";

const QUALITY_RANK: Readonly<Record<ProductionPhaseEvidenceQuality, number>> = Object.freeze({
  unknown: 0, planned_only: 1, structured_observation: 2, reviewed_structured: 3, validated_completed: 4,
});

function explicitTime(value: string): boolean {
  return /(?:Z|[+-]\d{2}:\d{2})$/.test(value) && !Number.isNaN(Date.parse(value));
}
function unique(values: readonly string[]): readonly string[] {
  return Object.freeze([...new Set(values)].sort());
}

export function validateRepeatedPhaseEvidence(
  record: ProductionPhaseCriterionEvidenceRecord,
  sourceRecordIds: ReadonlySet<string>,
): readonly string[] {
  if (record.repeatedEvidenceState !== "repeated_consistent_evidence") return Object.freeze([]);
  const distinctRefs = new Set(record.sourceRecordRefs);
  const sourceBasis = record.repeatedEvidenceBasis === "distinct_source_records" && distinctRefs.size > 1 ||
    record.repeatedEvidenceBasis === "distinct_completed_exposures" && record.distinctExposureIds.length > 1 ||
    record.repeatedEvidenceBasis === "distinct_completed_sessions" && record.distinctSessionIds.length > 1 ||
    record.repeatedEvidenceBasis === "reviewed_aggregate_multiple_observations" &&
      (distinctRefs.size > 1 || new Set(record.distinctExposureIds).size > 1 ||
        new Set(record.distinctSessionIds).size > 1) && record.reviewState === "accepted";
  const reasons: string[] = [];
  if (!sourceBasis) reasons.push("REPEATED_EVIDENCE_DISTINCT_SOURCE_BASIS_REQUIRED");
  if (distinctRefs.size !== record.sourceRecordRefs.length) reasons.push("DUPLICATE_SOURCE_RECORD_CANNOT_PROVE_REPETITION");
  if ([...distinctRefs].some((id) => !sourceRecordIds.has(id))) reasons.push("REPEATED_EVIDENCE_SOURCE_UNAVAILABLE");
  if (record.sourceAuthority === "unknown") reasons.push("REPEATED_EVIDENCE_SOURCE_AUTHORITY_INSUFFICIENT");
  return unique(reasons);
}

export function evaluateProductionPhaseCriterion(input: {
  readonly kernelInput: ProductionPhaseContinuityInput;
  readonly definition: ProductionPhaseCriterionDefinition;
  readonly records: readonly ProductionPhaseCriterionEvidenceRecord[];
}): ProductionPhaseCriterionEvaluation {
  const accepted: string[] = [];
  const rejected: string[] = [];
  const reasons: string[] = [];
  const snapshot = input.kernelInput.evidenceSnapshot;
  const sourceRecords = new Map((snapshot?.sourceRecords ?? []).map((entry) => [entry.sourceRecordId, entry]));
  for (const record of input.records) {
    const row: string[] = [];
    if (record.criterionId !== input.definition.criterionId) row.push("CRITERION_EVIDENCE_ID_MISMATCH");
    if (record.athleteId !== input.kernelInput.phaseCycleIdentity.athleteId ||
        record.phaseCycleId !== input.kernelInput.phaseCycleIdentity.phaseCycleId ||
        record.phaseStateRevisionId !== input.kernelInput.currentPhaseStateRevision.phaseStateRevisionId ||
        record.currentPhaseId !== input.definition.currentPhaseId) row.push("CRITERION_EVIDENCE_LINEAGE_MISMATCH");
    if (!input.definition.acceptedEvidenceOwners.includes(record.sourceOwner) || record.sourceOwner === "unknown") {
      row.push("CRITERION_EVIDENCE_SOURCE_OWNER_NOT_ACCEPTED");
    }
    if (record.sourceRecordRefs.length === 0 || record.sourceRecordRefs.some((id) => !sourceRecords.has(id))) {
      row.push("CRITERION_EVIDENCE_SOURCE_RECORD_UNAVAILABLE");
    }
    if (record.sourceRecordRefs.some((id) => sourceRecords.get(id)?.owner !== record.sourceOwner)) {
      row.push("CRITERION_EVIDENCE_SOURCE_OWNER_MISMATCH");
    }
    if (QUALITY_RANK[record.evidenceQuality] < QUALITY_RANK[input.definition.requiredEvidenceQuality]) {
      row.push("CRITERION_EVIDENCE_QUALITY_INSUFFICIENT");
    }
    if (!explicitTime(record.observedInterval.startsAt) || !explicitTime(record.observedInterval.endsAt) ||
        !explicitTime(record.appliesThrough) || Date.parse(record.observedInterval.startsAt) >
          Date.parse(record.observedInterval.endsAt) || Date.parse(record.appliesThrough) <
          Date.parse(input.kernelInput.evaluationTime)) row.push("CRITERION_EVIDENCE_TIME_INVALID_OR_STALE");
    if (record.supportsTransition && record.contradictsTransition && record.uncertaintyState !== "conflicting") {
      row.push("CRITERION_EVIDENCE_CONTRADICTION_UNMARKED");
    }
    if (record.evidenceClassification === "supports_criterion" && !record.supportsTransition) {
      row.push("CRITERION_EVIDENCE_SUPPORT_FLAG_MISSING");
    }
    if (record.evidenceClassification === "contradicts_criterion" && !record.contradictsTransition) {
      row.push("CRITERION_EVIDENCE_CONTRADICTION_FLAG_MISSING");
    }
    if (record.sourceOwner === "planned_program_truth" &&
        input.definition.domain !== "active_objective_realization" &&
        input.definition.domain !== "continuity_runway") {
      row.push("PLANNED_PROGRAM_TRUTH_USED_AS_COMPLETED_EVIDENCE");
    }
    row.push(...validateRepeatedPhaseEvidence(record, new Set(sourceRecords.keys())));
    if (row.length === 0) accepted.push(record.evidenceRecordId);
    else { rejected.push(record.evidenceRecordId); reasons.push(...row); }
  }
  const valid = input.records.filter((record) => accepted.includes(record.evidenceRecordId));
  const conflict = valid.some((record) => record.evidenceClassification === "mixed_evidence" ||
    record.repeatedEvidenceState === "repeated_mixed_evidence" || record.uncertaintyState === "conflicting") ||
    valid.some((record) => record.supportsTransition) && valid.some((record) => record.contradictsTransition);
  const blocked = valid.some((record) => record.contradictsTransition ||
    input.definition.blockingEvidenceClasses.includes(record.evidenceClassification));
  const repeated = input.definition.repeatedEvidenceRequirement === "not_required" || valid.some((record) =>
    record.repeatedEvidenceState === "repeated_consistent_evidence");
  const support = valid.some((record) => record.evidenceClassification === "supports_criterion" &&
    record.supportsTransition);
  const insufficient = valid.length === 0 || !support || !repeated || valid.some((record) =>
    record.evidenceClassification === "insufficient_observation" || record.evidenceClassification === "unknown" ||
    record.repeatedEvidenceState === "insufficient_history" || record.repeatedEvidenceState === "unknown");
  const state: ProductionPhaseCriterionEvaluation["state"] = conflict ? "conflict" : blocked ? "blocked" :
    insufficient ? (rejected.length > 0 && accepted.length === 0 ? "invalid" : "insufficient") : "met";
  if (!repeated) reasons.push("REPEATED_EVIDENCE_REQUIREMENT_NOT_MET");
  if (!support) reasons.push("SUPPORTING_CRITERION_EVIDENCE_MISSING");
  if (conflict) reasons.push("EQUAL_AUTHORITY_EVIDENCE_CONFLICT");
  if (blocked) reasons.push("BLOCKING_CRITERION_EVIDENCE_ACTIVE");
  if (state === "met") reasons.push("CRITERION_MET_BY_TYPED_EVIDENCE");
  return Object.freeze({ criterionId: input.definition.criterionId, state,
    acceptedEvidenceRecordIds: unique(accepted), rejectedEvidenceRecordIds: unique(rejected),
    reasonCodes: unique(reasons) });
}
