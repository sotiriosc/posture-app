import { explicitIsoTime, uniqueSorted } from "../prescription/compiler/utilities";
import {
  PRODUCTION_LONGITUDINAL_OUTCOME_SOURCE_CONTRACT_REFERENCE,
  PRODUCTION_LONGITUDINAL_OUTCOME_SOURCE_OWNERS,
  PRODUCTION_LONGITUDINAL_OUTCOME_SIGNALS,
  PRODUCTION_LONGITUDINAL_SOURCE_REVISION_STATES,
  deriveProductionLongitudinalSourceRecordRevisionId,
  deriveProductionLongitudinalSourceSnapshotRevisionId,
  type ProductionLongitudinalOutcomeSourceRecord,
  type ProductionLongitudinalOutcomeSourceSnapshot,
} from "./sourceContracts";

export interface ProductionLongitudinalSourceRevisionTrace {
  readonly sourceRecordId: string;
  readonly activeRevisionId: string | null;
  readonly historicalRevisionIds: readonly string[];
  readonly valid: boolean;
  readonly reasonCodes: readonly string[];
}

function revisionReasons(record: ProductionLongitudinalOutcomeSourceRecord): readonly string[] {
  const reasons: string[] = [];
  const { sourceRecordRevisionId: _revisionId, provenance: _provenance, ...revisionContent } = record;
  void [_revisionId, _provenance];
  const expectedRevision = deriveProductionLongitudinalSourceRecordRevisionId(revisionContent);
  if (record.sourceRecordRevisionId !== expectedRevision) reasons.push("SOURCE_RECORD_REVISION_ID_INVALID");
  if (!record.sourceRecordId.trim()) reasons.push("SOURCE_RECORD_ID_REQUIRED");
  if (!PRODUCTION_LONGITUDINAL_OUTCOME_SOURCE_OWNERS.includes(record.owner)) reasons.push("SOURCE_OWNER_INVALID");
  if (record.owner === "unknown" && record.signals.some((signal) => signal !== "unknown_evidence")) {
    reasons.push("UNKNOWN_SOURCE_CANNOT_AUTHORIZE_MATERIAL_CHANGE");
  }
  if (record.signals.some((signal) => !PRODUCTION_LONGITUDINAL_OUTCOME_SIGNALS.includes(signal))) {
    reasons.push("SOURCE_SIGNAL_INVALID");
  }
  if (!PRODUCTION_LONGITUDINAL_SOURCE_REVISION_STATES.includes(record.revisionState)) {
    reasons.push("SOURCE_REVISION_STATE_INVALID");
  }
  if (!explicitIsoTime(record.observedAt) || !explicitIsoTime(record.recordedAt) ||
      record.appliesThrough !== null && !explicitIsoTime(record.appliesThrough)) reasons.push("SOURCE_TIME_INVALID");
  if (Date.parse(record.observedAt) > Date.parse(record.recordedAt)) reasons.push("SOURCE_RECORDED_BEFORE_OBSERVED");
  if (record.basedOnRevisionId === record.sourceRecordRevisionId) reasons.push("SOURCE_REVISION_SELF_REFERENCE");
  if (record.finalForSourceRecord && record.revisionState !== "active") reasons.push("FINAL_SOURCE_REVISION_NOT_ACTIVE");
  return uniqueSorted(reasons);
}

export function validateProductionLongitudinalOutcomeSourceSnapshot(
  snapshot: ProductionLongitudinalOutcomeSourceSnapshot,
): { readonly reasonCodes: readonly string[]; readonly revisionTrace: readonly ProductionLongitudinalSourceRevisionTrace[] } {
  const reasons: string[] = [];
  if (snapshot.contractReference.contractId !== PRODUCTION_LONGITUDINAL_OUTCOME_SOURCE_CONTRACT_REFERENCE.contractId ||
      snapshot.contractReference.contractVersion !== PRODUCTION_LONGITUDINAL_OUTCOME_SOURCE_CONTRACT_REFERENCE.contractVersion) {
    reasons.push("UNSUPPORTED_PRODUCTION_LONGITUDINAL_OUTCOME_SOURCE_CONTRACT_VERSION");
  }
  if (!explicitIsoTime(snapshot.evaluationTime)) reasons.push("SOURCE_SNAPSHOT_EVALUATION_TIME_INVALID");
  if (snapshot.snapshotRevisionId !== deriveProductionLongitudinalSourceSnapshotRevisionId(snapshot)) {
    reasons.push("SOURCE_SNAPSHOT_REVISION_ID_INVALID");
  }
  const revisionIds = snapshot.sourceRecords.map((record) => record.sourceRecordRevisionId);
  if (new Set(revisionIds).size !== revisionIds.length) reasons.push("DUPLICATE_SOURCE_RECORD_REVISION_ID");
  const byLineage = new Map<string, ProductionLongitudinalOutcomeSourceRecord[]>();
  for (const record of snapshot.sourceRecords) {
    if (record.athleteId !== snapshot.athleteId) reasons.push("SOURCE_RECORD_ATHLETE_MISMATCH");
    if (Date.parse(record.recordedAt) > Date.parse(snapshot.evaluationTime)) reasons.push("FUTURE_SOURCE_RECORD");
    const records = byLineage.get(record.sourceRecordId) ?? [];
    records.push(record);
    byLineage.set(record.sourceRecordId, records);
  }
  const traces: ProductionLongitudinalSourceRevisionTrace[] = [];
  for (const [sourceRecordId, records] of [...byLineage.entries()].sort(([left], [right]) => left.localeCompare(right))) {
    const lineageReasons = records.flatMap(revisionReasons);
    const finalRecords = records.filter((record) => record.finalForSourceRecord && record.revisionState === "active");
    if (finalRecords.length !== 1) lineageReasons.push("EXACTLY_ONE_ACTIVE_FINAL_SOURCE_REVISION_REQUIRED");
    const ids = new Set(records.map((record) => record.sourceRecordRevisionId));
    for (const record of records) {
      if (record.basedOnRevisionId !== null && !ids.has(record.basedOnRevisionId)) {
        lineageReasons.push("SOURCE_REVISION_BASED_ON_LINEAGE_INVALID");
      }
    }
    const activeRevisionId = finalRecords[0]?.sourceRecordRevisionId ?? null;
    if (activeRevisionId && !snapshot.activeSourceRecordRevisionIds.includes(activeRevisionId)) {
      lineageReasons.push("ACTIVE_SOURCE_REVISION_NOT_SELECTED");
    }
    const unique = uniqueSorted(lineageReasons);
    reasons.push(...unique);
    traces.push(Object.freeze({ sourceRecordId, activeRevisionId,
      historicalRevisionIds: Object.freeze(records.filter((record) => record.sourceRecordRevisionId !== activeRevisionId)
        .map((record) => record.sourceRecordRevisionId).sort()), valid: unique.length === 0, reasonCodes: unique }));
  }
  const activeIds = snapshot.sourceRecords.filter((record) => record.finalForSourceRecord && record.revisionState === "active")
    .map((record) => record.sourceRecordRevisionId).sort();
  if (JSON.stringify(activeIds) !== JSON.stringify([...snapshot.activeSourceRecordRevisionIds].sort())) {
    reasons.push("ACTIVE_SOURCE_REVISION_SELECTION_INVALID");
  }
  return Object.freeze({ reasonCodes: uniqueSorted(reasons), revisionTrace: Object.freeze(traces) });
}

export function activeProductionLongitudinalSourceRecords(
  snapshot: ProductionLongitudinalOutcomeSourceSnapshot,
): readonly ProductionLongitudinalOutcomeSourceRecord[] {
  const selected = new Set(snapshot.activeSourceRecordRevisionIds);
  return Object.freeze(snapshot.sourceRecords.filter((record) => selected.has(record.sourceRecordRevisionId) &&
    record.finalForSourceRecord && record.revisionState === "active").sort((left, right) =>
    left.observedAt.localeCompare(right.observedAt) || left.sourceRecordRevisionId.localeCompare(right.sourceRecordRevisionId)));
}
