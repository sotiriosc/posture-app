import { canonicalize, explicitIsoTime, stableId, uniqueSorted } from "../prescription/compiler/utilities";
import {
  NORMALIZED_OUTCOME_SOURCE_RECORD_CONTRACT_REFERENCE,
  OUTCOME_SOURCE_AUTHORIZATION_STATES,
  OUTCOME_SOURCE_CATEGORIES,
  PRODUCTION_OUTCOME_SOURCE_SNAPSHOT_CONTRACT_REFERENCE,
  deriveOutcomeSourceImmutableContentFingerprint,
  deriveOutcomeSourceRecordId,
  deriveOutcomeSourceRecordRevisionId,
  validateNormalizedOutcomeSourceRecord,
  validateOutcomeSourceAuthorization,
  validateOutcomeSourceRecordRevisionLedger,
  type BuildProductionOutcomeSourceSnapshotInput,
  type NormalizedOutcomeSourceRecord,
  type OutcomeSourceAuthorizationState,
  type OutcomeSourceCategory,
  type OutcomeSourceDecisionUseAuthorization,
  type OutcomeSourceLineageReference,
  type OutcomeSourceRecordRevision,
  type OutcomeSourceRecordRevisionLedger,
  type OutcomeSourceRevisionState,
  type OutcomeSourceStructuredFact,
  type ProductionOutcomeSourceSnapshotBuildResult,
} from "./designContracts";

export const PRODUCTION_OUTCOME_SOURCE_INGESTION_CONTRACT_REFERENCE = Object.freeze({
  contractId: "PRODUCTION_OUTCOME_SOURCE_INGESTION",
  contractVersion: "1.0.0",
} as const);
export const PRODUCTION_OUTCOME_SOURCE_PERSISTENCE_CONTRACT_REFERENCE = Object.freeze({
  contractId: "PRODUCTION_OUTCOME_SOURCE_PERSISTENCE",
  contractVersion: "1.0.0",
} as const);
export const PRODUCTION_OUTCOME_SOURCE_REPLAY_CONTRACT_REFERENCE = Object.freeze({
  contractId: "PRODUCTION_OUTCOME_SOURCE_REPLAY",
  contractVersion: "1.0.0",
} as const);
export const PRODUCTION_ADAPTATION_PERSISTENCE_CONTRACT_REFERENCE = Object.freeze({
  contractId: "PRODUCTION_ADAPTATION_PERSISTENCE",
  contractVersion: "1.0.0",
} as const);

export const PRODUCTION_OUTCOME_SOURCE_ADAPTERS_AND_APPEND_ONLY_PERSISTENCE_STATUS =
  "PRODUCTION_OUTCOME_SOURCE_ADAPTERS_AND_APPEND_ONLY_PERSISTENCE_IMPLEMENTED_NOT_ACTIVATED" as const;
export const PRODUCTION_OUTCOME_SOURCE_ADAPTERS_STATUS =
  "PRODUCTION_OUTCOME_SOURCE_ADAPTERS_IMPLEMENTED_NOT_ACTIVATED" as const;
export const PRODUCTION_OUTCOME_SOURCE_APPEND_ONLY_PERSISTENCE_STATUS =
  "PRODUCTION_OUTCOME_SOURCE_APPEND_ONLY_PERSISTENCE_IMPLEMENTED_NOT_ACTIVATED" as const;
export const PRODUCTION_OUTCOME_SOURCE_REPLAY_STATUS =
  "PRODUCTION_OUTCOME_SOURCE_REPLAY_IMPLEMENTED_NOT_ACTIVATED" as const;
export const PRODUCTION_ADAPTATION_PERSISTENCE_STATUS =
  "PRODUCTION_ADAPTATION_PERSISTENCE_IMPLEMENTED_NOT_ACTIVATED" as const;
export const PRODUCTION_OUTCOME_SOURCE_ACTIVATION_STATUS = "NOT_ACTIVATED" as const;
export const PRODUCTION_OUTCOME_SOURCE_IMPLEMENTATION_CLASSIFICATION =
  "PRODUCTION_OUTCOME_SOURCE_ADAPTERS_AND_APPEND_ONLY_PERSISTENCE_READY_FOR_PRODUCTION_WEEK_PLANNER_AND_ALLOCATION_AUTHORIZATION" as const;
export const PRODUCTION_OUTCOME_SOURCE_PERSISTENCE_ONTOLOGY_CLASSIFICATION =
  "TARGETED_PRODUCTION_OUTCOME_SOURCE_PERSISTENCE_DOMAIN_FIXES_REQUIRED" as const;

export const OUTCOME_SOURCE_ADAPTER_REQUIRED = "OUTCOME_SOURCE_ADAPTER_REQUIRED" as const;
export const OUTCOME_SOURCE_ADAPTER_UNAVAILABLE = "OUTCOME_SOURCE_ADAPTER_UNAVAILABLE" as const;
export const OUTCOME_SOURCE_ADAPTER_CONFLICT = "OUTCOME_SOURCE_ADAPTER_CONFLICT" as const;
export const REPLAY_ADAPTER_VERSION_UNAVAILABLE = "REPLAY_ADAPTER_VERSION_UNAVAILABLE" as const;
export const EXTERNAL_LOAD_RECEIVER_POLICY_REQUIRED = "EXTERNAL_LOAD_RECEIVER_POLICY_REQUIRED" as const;

export const PRODUCTION_OUTCOME_SOURCE_INGESTION_STATUSES = Object.freeze([
  "ingested_new_record", "ingested_new_revision", "exact_retry_returned_prior_result",
  "duplicate_semantic_event_preserved_as_existing", "idempotency_payload_conflict",
  "active_revision_conflict", "authorization_required", "authorization_restricted",
  "adapter_required", "adapter_unavailable", "schema_unsupported", "lineage_incomplete",
  "source_event_unknown", "prescription_revision_unknown", "sequence_revision_unknown",
  "legacy_record_restricted", "invalid_payload", "invalid_time", "invalid_athlete_mapping",
  "persistence_failure",
] as const);
export type ProductionOutcomeSourceIngestionStatus =
  typeof PRODUCTION_OUTCOME_SOURCE_INGESTION_STATUSES[number];

export interface ProductionRawOutcomeSourceEnvelope {
  readonly ingestionContractReference: typeof PRODUCTION_OUTCOME_SOURCE_INGESTION_CONTRACT_REFERENCE;
  readonly envelopeId: string;
  readonly sourceCategory: OutcomeSourceCategory;
  readonly sourceSystem: string;
  readonly sourceNativeRecordId: string;
  readonly sourceNativeRevisionId: string | null;
  readonly athleteId: string;
  readonly authenticatedPrincipalId: string;
  readonly lineage: OutcomeSourceLineageReference;
  readonly eventTime: string;
  readonly eventTimezone: string;
  readonly ingestionTime: string;
  readonly payloadSchemaId: string;
  readonly payloadSchemaVersion: string;
  readonly adapterId: string;
  readonly adapterVersion: string;
  readonly payloadChecksum: string;
  readonly idempotencyKey: string;
  readonly decisionUseAuthorizationReference: string;
  readonly correctionOrSupersessionReference: string | null;
  readonly structuredPayload: Readonly<Record<string, unknown>> | null;
  readonly opaquePayloadReference: string | null;
  readonly provenance: readonly string[];
}

export interface ProductionOutcomeSourceAdapterOutput {
  readonly sourceOwner: string;
  readonly sourceAuthority: NormalizedOutcomeSourceRecord["sourceAuthority"];
  readonly targetIds: readonly string[];
  readonly structuredFacts: readonly OutcomeSourceStructuredFact[];
  readonly explicitUnknowns: readonly string[];
  readonly appliesThroughTime: string | null;
  readonly reviewState: NormalizedOutcomeSourceRecord["reviewState"];
  readonly provenance: readonly string[];
}

export interface ProductionOutcomeSourceAdapter {
  readonly adapterId: string;
  readonly adapterVersion: string;
  readonly sourceCategory: OutcomeSourceCategory;
  readonly payloadSchemaId: string;
  readonly payloadSchemaVersion: string;
  readonly normalizedSchemaId: "NORMALIZED_OUTCOME_SOURCE_RECORD";
  readonly sourceAuthorityEligible: readonly NormalizedOutcomeSourceRecord["sourceAuthority"][];
  readonly requiredLineage: readonly (keyof OutcomeSourceLineageReference)[];
  readonly freeTextPolicy: "reject" | "ignore";
  readonly decisionUseDefault: OutcomeSourceAuthorizationState;
  readonly provenance: readonly string[];
  readonly validatePayload: (payload: Readonly<Record<string, unknown>>) => readonly string[];
  readonly normalizePayload: (
    payload: Readonly<Record<string, unknown>>,
    envelope: ProductionRawOutcomeSourceEnvelope,
  ) => ProductionOutcomeSourceAdapterOutput;
}

export interface ProductionOutcomeSourceAdapterRegistry {
  readonly adapters: readonly ProductionOutcomeSourceAdapter[];
  readonly fingerprint: string;
}

export interface NormalizeOutcomeSourceEnvelopeInput {
  readonly envelope: ProductionRawOutcomeSourceEnvelope;
  readonly authorization: OutcomeSourceDecisionUseAuthorization | null;
  readonly adapterRegistry: ProductionOutcomeSourceAdapterRegistry;
  readonly basedOnRevisionId?: string | null;
  readonly revisionState?: OutcomeSourceRevisionState;
  readonly correction?: {
    readonly reason: string;
    readonly owner: string;
    readonly changedStructuredPaths: readonly string[];
    readonly correctionTime: string;
  } | null;
}

export interface NormalizeOutcomeSourceEnvelopeResult {
  readonly status: "normalized" | "rejected";
  readonly ingestionStatus: ProductionOutcomeSourceIngestionStatus;
  readonly record: NormalizedOutcomeSourceRecord | null;
  readonly reasonCodes: readonly string[];
  readonly adapterReference: string | null;
}

const PROHIBITED_RAW_KEYS = new Set([
  "note", "notes", "feedbacknotes", "diagnosis", "pathology", "image", "images", "document",
  "documents", "attachment", "attachments", "analytics", "debug", "displayname", "email",
]);

function walkRawPayload(value: unknown, reasons: string[], depth = 0): void {
  if (depth > 8) {
    reasons.push("OUTCOME_SOURCE_STRUCTURED_PAYLOAD_DEPTH_EXCEEDED");
    return;
  }
  if (Array.isArray(value)) {
    if (value.length > 256) reasons.push("OUTCOME_SOURCE_STRUCTURED_PAYLOAD_ARRAY_UNBOUNDED");
    value.forEach((entry) => walkRawPayload(entry, reasons, depth + 1));
    return;
  }
  if (value === null || ["string", "number", "boolean"].includes(typeof value)) return;
  if (typeof value !== "object") {
    reasons.push("OUTCOME_SOURCE_STRUCTURED_PAYLOAD_VALUE_INVALID");
    return;
  }
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    if (PROHIBITED_RAW_KEYS.has(key.toLowerCase().replace(/[_-]/g, ""))) {
      reasons.push(`OUTCOME_SOURCE_RAW_FIELD_PROHIBITED:${key}`);
    }
    walkRawPayload(child, reasons, depth + 1);
  }
}

export function deriveCanonicalOutcomeSourceChecksum(value: unknown): string {
  return stableId("outcome-source-payload", canonicalize(value));
}

export function createProductionOutcomeSourceAdapterRegistry(
  adapters: readonly ProductionOutcomeSourceAdapter[],
): ProductionOutcomeSourceAdapterRegistry {
  const ordered = [...adapters].sort((left, right) =>
    `${left.sourceCategory}:${left.adapterId}:${left.adapterVersion}:${left.payloadSchemaId}:${left.payloadSchemaVersion}`
      .localeCompare(`${right.sourceCategory}:${right.adapterId}:${right.adapterVersion}:${right.payloadSchemaId}:${right.payloadSchemaVersion}`));
  return Object.freeze({
    adapters: Object.freeze(ordered),
    fingerprint: stableId("production-outcome-source-adapter-registry", ordered.map((adapter) => ({
      adapterId: adapter.adapterId,
      adapterVersion: adapter.adapterVersion,
      sourceCategory: adapter.sourceCategory,
      payloadSchemaId: adapter.payloadSchemaId,
      payloadSchemaVersion: adapter.payloadSchemaVersion,
      requiredLineage: [...adapter.requiredLineage].sort(),
      decisionUseDefault: adapter.decisionUseDefault,
    }))),
  });
}

export function resolveProductionOutcomeSourceAdapter(
  registry: ProductionOutcomeSourceAdapterRegistry,
  envelope: ProductionRawOutcomeSourceEnvelope,
): { readonly adapter: ProductionOutcomeSourceAdapter | null; readonly reasonCode: string | null } {
  const category = registry.adapters.filter((adapter) => adapter.sourceCategory === envelope.sourceCategory);
  if (category.length === 0) return Object.freeze({ adapter: null, reasonCode: OUTCOME_SOURCE_ADAPTER_REQUIRED });
  const version = category.filter((adapter) => adapter.adapterId === envelope.adapterId &&
    adapter.adapterVersion === envelope.adapterVersion && adapter.payloadSchemaId === envelope.payloadSchemaId &&
    adapter.payloadSchemaVersion === envelope.payloadSchemaVersion);
  if (version.length === 0) return Object.freeze({ adapter: null, reasonCode: OUTCOME_SOURCE_ADAPTER_UNAVAILABLE });
  if (version.length > 1) return Object.freeze({ adapter: null, reasonCode: OUTCOME_SOURCE_ADAPTER_CONFLICT });
  return Object.freeze({ adapter: version[0]!, reasonCode: null });
}

export function validateOutcomeSourceEnvelope(
  envelope: ProductionRawOutcomeSourceEnvelope,
  adapterRegistry?: ProductionOutcomeSourceAdapterRegistry,
): readonly string[] {
  const reasons: string[] = [];
  if (envelope.ingestionContractReference.contractId !== PRODUCTION_OUTCOME_SOURCE_INGESTION_CONTRACT_REFERENCE.contractId ||
      envelope.ingestionContractReference.contractVersion !== PRODUCTION_OUTCOME_SOURCE_INGESTION_CONTRACT_REFERENCE.contractVersion) {
    reasons.push("UNSUPPORTED_PRODUCTION_OUTCOME_SOURCE_INGESTION_VERSION");
  }
  if (!OUTCOME_SOURCE_CATEGORIES.includes(envelope.sourceCategory)) reasons.push("OUTCOME_SOURCE_CATEGORY_INVALID");
  const required = [envelope.envelopeId, envelope.sourceSystem, envelope.sourceNativeRecordId,
    envelope.athleteId, envelope.authenticatedPrincipalId, envelope.eventTimezone, envelope.payloadSchemaId,
    envelope.payloadSchemaVersion, envelope.adapterId, envelope.adapterVersion, envelope.payloadChecksum,
    envelope.idempotencyKey, envelope.decisionUseAuthorizationReference];
  if (required.some((value) => !value.trim())) reasons.push("RAW_ENVELOPE_FIELD_REQUIRED");
  if (!explicitIsoTime(envelope.eventTime) || !explicitIsoTime(envelope.ingestionTime)) {
    reasons.push("OUTCOME_SOURCE_TIME_INVALID");
  } else if (Date.parse(envelope.eventTime) > Date.parse(envelope.ingestionTime)) {
    reasons.push("OUTCOME_SOURCE_EVENT_AFTER_INGESTION");
  }
  if ((envelope.structuredPayload === null) === (envelope.opaquePayloadReference === null)) {
    reasons.push("OUTCOME_SOURCE_EXACTLY_ONE_PAYLOAD_FORM_REQUIRED");
  }
  if (envelope.structuredPayload !== null) {
    walkRawPayload(envelope.structuredPayload, reasons);
    if (JSON.stringify(envelope.structuredPayload).length > 65_536) reasons.push("OUTCOME_SOURCE_STRUCTURED_PAYLOAD_TOO_LARGE");
    if (deriveCanonicalOutcomeSourceChecksum(envelope.structuredPayload) !== envelope.payloadChecksum) {
      reasons.push("OUTCOME_SOURCE_PAYLOAD_CHECKSUM_INVALID");
    }
  }
  if (adapterRegistry) {
    const resolved = resolveProductionOutcomeSourceAdapter(adapterRegistry, envelope);
    if (resolved.reasonCode) reasons.push(resolved.reasonCode);
    if (resolved.adapter) {
      for (const key of resolved.adapter.requiredLineage) {
        if (!envelope.lineage[key]) reasons.push(`OUTCOME_SOURCE_LINEAGE_REQUIRED:${key}`);
      }
    }
  }
  return uniqueSorted(reasons);
}

function authorizationReasons(
  authorization: OutcomeSourceDecisionUseAuthorization | null,
  envelope: ProductionRawOutcomeSourceEnvelope,
): readonly string[] {
  if (authorization === null) return Object.freeze(["OUTCOME_SOURCE_AUTHORIZATION_REQUIRED"]);
  const reasons: string[] = [];
  if (authorization.authorizationId !== envelope.decisionUseAuthorizationReference) {
    reasons.push("OUTCOME_SOURCE_AUTHORIZATION_REFERENCE_MISMATCH");
  }
  if (authorization.athleteId !== envelope.athleteId) reasons.push("OUTCOME_SOURCE_AUTHORIZATION_ATHLETE_MISMATCH");
  if (!authorization.sourceCategories.includes(envelope.sourceCategory)) reasons.push("OUTCOME_SOURCE_CATEGORY_NOT_AUTHORIZED");
  if (!authorization.permittedPurposes.includes("longitudinal_adaptation")) {
    reasons.push("OUTCOME_SOURCE_DECISION_PURPOSE_NOT_AUTHORIZED");
  }
  if (!explicitIsoTime(authorization.effectiveTime) ||
      Date.parse(authorization.effectiveTime) > Date.parse(envelope.ingestionTime)) {
    reasons.push("OUTCOME_SOURCE_AUTHORIZATION_NOT_EFFECTIVE");
  }
  if (authorization.expirationTime !== null &&
      (!explicitIsoTime(authorization.expirationTime) ||
       Date.parse(authorization.expirationTime) < Date.parse(envelope.ingestionTime))) {
    reasons.push("OUTCOME_SOURCE_AUTHORIZATION_EXPIRED");
  }
  if (authorization.state !== "authorized") reasons.push(`OUTCOME_SOURCE_AUTHORIZATION_${authorization.state.toUpperCase()}`);
  return uniqueSorted(reasons);
}

export function normalizeOutcomeSourceEnvelope(
  input: NormalizeOutcomeSourceEnvelopeInput,
): NormalizeOutcomeSourceEnvelopeResult {
  const envelopeReasons = [...validateOutcomeSourceEnvelope(input.envelope, input.adapterRegistry)];
  const resolved = resolveProductionOutcomeSourceAdapter(input.adapterRegistry, input.envelope);
  if (resolved.reasonCode || !resolved.adapter) {
    const ingestionStatus = resolved.reasonCode === OUTCOME_SOURCE_ADAPTER_REQUIRED ? "adapter_required" :
      resolved.reasonCode === OUTCOME_SOURCE_ADAPTER_UNAVAILABLE ? "adapter_unavailable" : "invalid_payload";
    return Object.freeze({ status: "rejected", ingestionStatus, record: null,
      reasonCodes: uniqueSorted([...envelopeReasons, resolved.reasonCode ?? OUTCOME_SOURCE_ADAPTER_REQUIRED]),
      adapterReference: null });
  }
  if (input.envelope.structuredPayload === null) {
    return Object.freeze({ status: "rejected", ingestionStatus: "invalid_payload", record: null,
      reasonCodes: uniqueSorted([...envelopeReasons, "OUTCOME_SOURCE_STRUCTURED_PAYLOAD_REQUIRED_BY_ADAPTER"]),
      adapterReference: `${resolved.adapter.adapterId}@${resolved.adapter.adapterVersion}` });
  }
  const authReasons = [...authorizationReasons(input.authorization, input.envelope)];
  const payloadReasons = [...resolved.adapter.validatePayload(input.envelope.structuredPayload)];
  const reasons = uniqueSorted([...envelopeReasons, ...authReasons, ...payloadReasons]);
  if (reasons.length) {
    const ingestionStatus: ProductionOutcomeSourceIngestionStatus = authReasons.some((reason) => reason.endsWith("REQUIRED")) ?
      "authorization_required" : authReasons.length ? "authorization_restricted" :
        reasons.some((reason) => reason.includes("LINEAGE")) ? "lineage_incomplete" :
          reasons.some((reason) => reason.includes("TIME")) ? "invalid_time" : "invalid_payload";
    return Object.freeze({ status: "rejected", ingestionStatus, record: null, reasonCodes: reasons,
      adapterReference: `${resolved.adapter.adapterId}@${resolved.adapter.adapterVersion}` });
  }
  const output = resolved.adapter.normalizePayload(input.envelope.structuredPayload, input.envelope);
  const sourceRecordId = deriveOutcomeSourceRecordId({ sourceSystem: input.envelope.sourceSystem,
    sourceNativeRecordId: input.envelope.sourceNativeRecordId, athleteId: input.envelope.athleteId,
    sourceCategory: input.envelope.sourceCategory });
  const correction = input.correction ?? null;
  const semantic = {
    contractReference: NORMALIZED_OUTCOME_SOURCE_RECORD_CONTRACT_REFERENCE,
    sourceRecordId,
    basedOnRevisionId: input.basedOnRevisionId ?? null,
    sourceCategory: input.envelope.sourceCategory,
    sourceOwner: output.sourceOwner,
    sourceAuthority: output.sourceAuthority,
    athleteId: input.envelope.athleteId,
    targetIds: Object.freeze([...new Set(output.targetIds)].sort()),
    lineage: input.envelope.lineage,
    structuredFacts: Object.freeze([...output.structuredFacts].sort((left, right) =>
      `${left.blockId ?? ""}:${left.factType}:${JSON.stringify(left.value)}`.localeCompare(
        `${right.blockId ?? ""}:${right.factType}:${JSON.stringify(right.value)}`))),
    explicitUnknowns: Object.freeze([...new Set(output.explicitUnknowns)].sort()),
    eventTime: input.envelope.eventTime,
    eventTimezone: input.envelope.eventTimezone,
    ingestionTime: input.envelope.ingestionTime,
    appliesThroughTime: output.appliesThroughTime,
    reviewState: output.reviewState,
    revisionState: input.revisionState ?? "active" as const,
    authorizationState: input.authorization?.state ?? "unknown" as const,
    correctionReason: correction?.reason ?? null,
    changedStructuredPaths: Object.freeze([...(correction?.changedStructuredPaths ?? [])].sort()),
    correctionOwner: correction?.owner ?? null,
    correctionTime: correction?.correctionTime ?? null,
    finalForSourceRecord: (input.revisionState ?? "active") === "active",
  };
  const record: NormalizedOutcomeSourceRecord = Object.freeze({ ...semantic,
    sourceRecordRevisionId: deriveOutcomeSourceRecordRevisionId(semantic),
    provenance: Object.freeze([...input.envelope.provenance, ...output.provenance,
      `adapter:${resolved.adapter.adapterId}@${resolved.adapter.adapterVersion}`]) });
  const normalizedReasons = validateNormalizedOutcomeSourceRecord(record);
  if (normalizedReasons.length) return Object.freeze({ status: "rejected", ingestionStatus: "invalid_payload",
    record: null, reasonCodes: normalizedReasons,
    adapterReference: `${resolved.adapter.adapterId}@${resolved.adapter.adapterVersion}` });
  return Object.freeze({ status: "normalized", ingestionStatus: input.basedOnRevisionId ?
    "ingested_new_revision" : "ingested_new_record", record, reasonCodes: Object.freeze([]),
    adapterReference: `${resolved.adapter.adapterId}@${resolved.adapter.adapterVersion}` });
}

export function createOutcomeSourceRecordRevision(record: NormalizedOutcomeSourceRecord): OutcomeSourceRecordRevision {
  const reasons = validateNormalizedOutcomeSourceRecord(record);
  if (reasons.length) throw new Error(reasons.join(","));
  return Object.freeze({ sourceRecordId: record.sourceRecordId, revision: record,
    immutableContentFingerprint: deriveOutcomeSourceImmutableContentFingerprint(record) });
}

export type AppendOutcomeSourceRevisionOperation = "correction" | "supersession" | "withdrawal" | "invalidation";

export function appendOutcomeSourceRevision(input: {
  readonly ledger: OutcomeSourceRecordRevisionLedger;
  readonly record: NormalizedOutcomeSourceRecord;
  readonly operation: AppendOutcomeSourceRevisionOperation;
}): OutcomeSourceRecordRevisionLedger {
  if (input.record.sourceRecordId !== input.ledger.sourceRecordId) throw new Error("OUTCOME_SOURCE_RECORD_LINEAGE_MISMATCH");
  if (!input.record.basedOnRevisionId ||
      !input.ledger.revisions.some((entry) => entry.revision.sourceRecordRevisionId === input.record.basedOnRevisionId)) {
    throw new Error("OUTCOME_SOURCE_BASED_ON_REVISION_MISSING");
  }
  if (!input.record.correctionReason || !input.record.correctionOwner || !input.record.correctionTime) {
    throw new Error("OUTCOME_SOURCE_CORRECTION_METADATA_REQUIRED");
  }
  const expectedState: OutcomeSourceRevisionState = input.operation === "withdrawal" ? "withdrawn" :
    input.operation === "invalidation" ? "invalid" : input.operation === "supersession" ? "superseded" : "active";
  if (input.record.revisionState !== expectedState) throw new Error("OUTCOME_SOURCE_REVISION_OPERATION_STATE_MISMATCH");
  if (input.ledger.revisions.some((entry) => entry.revision.sourceRecordRevisionId === input.record.sourceRecordRevisionId)) {
    throw new Error("DUPLICATE_OUTCOME_SOURCE_REVISION");
  }
  return Object.freeze({ sourceRecordId: input.ledger.sourceRecordId,
    revisions: Object.freeze([...input.ledger.revisions, createOutcomeSourceRecordRevision(input.record)]),
    activeFinalRevisionId: input.operation === "correction" ? input.record.sourceRecordRevisionId : null,
    provenance: Object.freeze([...input.ledger.provenance, `append-only:${input.operation}`]) });
}

export const appendCorrection = (ledger: OutcomeSourceRecordRevisionLedger, record: NormalizedOutcomeSourceRecord) =>
  appendOutcomeSourceRevision({ ledger, record, operation: "correction" });
export const appendSupersession = (ledger: OutcomeSourceRecordRevisionLedger, record: NormalizedOutcomeSourceRecord) =>
  appendOutcomeSourceRevision({ ledger, record, operation: "supersession" });
export const appendWithdrawal = (ledger: OutcomeSourceRecordRevisionLedger, record: NormalizedOutcomeSourceRecord) =>
  appendOutcomeSourceRevision({ ledger, record, operation: "withdrawal" });
export const appendInvalidation = (ledger: OutcomeSourceRecordRevisionLedger, record: NormalizedOutcomeSourceRecord) =>
  appendOutcomeSourceRevision({ ledger, record, operation: "invalidation" });

export function buildVersionedProductionOutcomeSourceSnapshot(
  input: Omit<BuildProductionOutcomeSourceSnapshotInput, "foundationContractReference"> & {
    readonly ingestionContractReference: typeof PRODUCTION_OUTCOME_SOURCE_INGESTION_CONTRACT_REFERENCE;
  },
): ProductionOutcomeSourceSnapshotBuildResult {
  if (input.ingestionContractReference.contractId !== PRODUCTION_OUTCOME_SOURCE_INGESTION_CONTRACT_REFERENCE.contractId ||
      input.ingestionContractReference.contractVersion !== PRODUCTION_OUTCOME_SOURCE_INGESTION_CONTRACT_REFERENCE.contractVersion) {
    return Object.freeze({ snapshot: null,
      reasonCodes: Object.freeze(["UNSUPPORTED_PRODUCTION_OUTCOME_SOURCE_INGESTION_VERSION"]),
      auditTrace: Object.freeze(["11.0:contract-and-authorization-failed"]) });
  }
  const audit = ["11.0:contract-and-authorization", "11.1:raw-envelope-not-consumed",
    "11.2:normalization", "11.3:active-pointer-revision-selection"];
  const reasons: string[] = [];
  if (!explicitIsoTime(input.evaluationTime)) reasons.push("OUTCOME_SOURCE_EVALUATION_TIME_INVALID");
  const active: NormalizedOutcomeSourceRecord[] = [];
  const excluded: { readonly sourceRecordRevisionId: string; readonly reasons: readonly string[] }[] = [];
  for (const ledger of [...input.revisionLedgers]
    .sort((left, right) => left.sourceRecordId.localeCompare(right.sourceRecordId))) {
    const ledgerReasons = validateOutcomeSourceRecordRevisionLedger(ledger);
    const selected = ledger.activeFinalRevisionId === null ? null : ledger.revisions.find((entry) =>
      entry.revision.sourceRecordRevisionId === ledger.activeFinalRevisionId)?.revision ?? null;
    const selectionReasons = [...ledgerReasons];
    if (ledger.activeFinalRevisionId !== null && selected === null) {
      selectionReasons.push("OUTCOME_SOURCE_STALE_ACTIVE_POINTER");
    }
    if (selected !== null && (selected.revisionState !== "active" || !selected.finalForSourceRecord ||
        selected.authorizationState !== "authorized" || Date.parse(selected.eventTime) > Date.parse(input.evaluationTime) ||
        selected.appliesThroughTime !== null && Date.parse(selected.appliesThroughTime) < Date.parse(input.evaluationTime))) {
      selectionReasons.push("NO_ACTIVE_APPLICABLE_REVISION");
    }
    if (selected === null || selectionReasons.length) {
      const rejected = uniqueSorted(selectionReasons.length ? selectionReasons : ["NO_ACTIVE_APPLICABLE_REVISION"]);
      ledger.revisions.forEach((entry) => excluded.push(Object.freeze({
        sourceRecordRevisionId: entry.revision.sourceRecordRevisionId, reasons: rejected,
      })));
      continue;
    }
    if (selected.athleteId !== input.athleteId) {
      reasons.push("OUTCOME_SOURCE_SNAPSHOT_ATHLETE_MISMATCH");
      continue;
    }
    ledger.revisions.filter((entry) => entry.revision.sourceRecordRevisionId !== selected.sourceRecordRevisionId)
      .forEach((entry) => excluded.push(Object.freeze({
        sourceRecordRevisionId: entry.revision.sourceRecordRevisionId,
        reasons: Object.freeze(["SUPERSEDED_BY_ACTIVE_POINTER"]),
      })));
    const authorizationValid = input.authorizations.some((authorization) =>
      authorization.athleteId === input.athleteId && authorization.sourceCategories.includes(selected.sourceCategory) &&
      validateOutcomeSourceAuthorization(authorization, selected.sourceCategory,
        input.athleteId, input.evaluationTime).length === 0);
    if (!authorizationValid) {
      excluded.push(Object.freeze({ sourceRecordRevisionId: selected.sourceRecordRevisionId,
        reasons: Object.freeze(["OUTCOME_SOURCE_DECISION_USE_NOT_AUTHORIZED"]) }));
      continue;
    }
    active.push(selected);
  }
  audit.push("11.4:linkage", "11.5:snapshot");
  if (reasons.length) return Object.freeze({ snapshot: null, reasonCodes: uniqueSorted(reasons),
    auditTrace: Object.freeze(audit) });
  const ordered = Object.freeze(active.sort((left, right) => left.eventTime.localeCompare(right.eventTime) ||
    left.sourceRecordRevisionId.localeCompare(right.sourceRecordRevisionId)));
  const semantic = Object.freeze({ snapshotId: input.snapshotId, athleteId: input.athleteId,
    evaluationTime: input.evaluationTime,
    activeSourceRevisionIds: Object.freeze(ordered.map((record) => record.sourceRecordRevisionId)),
    excludedRevisions: Object.freeze(excluded.sort((left, right) =>
      left.sourceRecordRevisionId.localeCompare(right.sourceRecordRevisionId))),
    conflicts: Object.freeze<string[]>([]),
    unresolvedSourceCategories: Object.freeze([...input.unresolvedSourceCategories].sort()) });
  const fingerprint = stableId("outcome-source-content", canonicalize(semantic));
  const snapshot = Object.freeze({ contractReference: PRODUCTION_OUTCOME_SOURCE_SNAPSHOT_CONTRACT_REFERENCE,
    snapshotId: input.snapshotId,
    snapshotRevisionId: stableId("production-outcome-source-snapshot-revision", semantic),
    athleteId: input.athleteId, evaluationTime: input.evaluationTime, activeSourceRecords: ordered,
    activeSourceRevisionIds: semantic.activeSourceRevisionIds, excludedRevisions: semantic.excludedRevisions,
    conflicts: semantic.conflicts, unresolvedSourceCategories: semantic.unresolvedSourceCategories,
    authorizationStates: Object.freeze([...new Set(input.authorizations.map((entry) => entry.state))].sort()),
    sourceLineage: Object.freeze(ordered.map((record) => record.sourceRecordId).sort()), fingerprint,
    auditTrace: Object.freeze([...audit, "snapshot:fingerprint-emitted"]),
    provenance: Object.freeze([...input.provenance]) });
  return Object.freeze({ snapshot, reasonCodes: Object.freeze([]), auditTrace: snapshot.auditTrace });
}

export function validateProductionOutcomeSourceSnapshot(snapshot: {
  readonly contractReference: { readonly contractId: string; readonly contractVersion: string };
  readonly snapshotRevisionId: string;
  readonly athleteId: string;
  readonly evaluationTime: string;
  readonly activeSourceRevisionIds: readonly string[];
  readonly activeSourceRecords: readonly NormalizedOutcomeSourceRecord[];
  readonly fingerprint: string;
}): readonly string[] {
  const reasons: string[] = [];
  if (snapshot.contractReference.contractId !== PRODUCTION_OUTCOME_SOURCE_SNAPSHOT_CONTRACT_REFERENCE.contractId ||
      snapshot.contractReference.contractVersion !== PRODUCTION_OUTCOME_SOURCE_SNAPSHOT_CONTRACT_REFERENCE.contractVersion) {
    reasons.push("UNSUPPORTED_PRODUCTION_OUTCOME_SOURCE_SNAPSHOT_VERSION");
  }
  if (!snapshot.snapshotRevisionId.trim() || !snapshot.athleteId.trim()) reasons.push("OUTCOME_SOURCE_SNAPSHOT_IDENTITY_REQUIRED");
  if (!explicitIsoTime(snapshot.evaluationTime)) reasons.push("OUTCOME_SOURCE_EVALUATION_TIME_INVALID");
  if (new Set(snapshot.activeSourceRevisionIds).size !== snapshot.activeSourceRevisionIds.length) {
    reasons.push("OUTCOME_SOURCE_SNAPSHOT_MEMBERSHIP_DUPLICATE");
  }
  if (snapshot.activeSourceRecords.some((record) => record.athleteId !== snapshot.athleteId)) {
    reasons.push("OUTCOME_SOURCE_SNAPSHOT_ATHLETE_MISMATCH");
  }
  return uniqueSorted(reasons);
}

export function createDecisionUseAuthorizationRevision(input: {
  readonly prior: OutcomeSourceDecisionUseAuthorization | null;
  readonly next: OutcomeSourceDecisionUseAuthorization;
}): OutcomeSourceDecisionUseAuthorization {
  if (!OUTCOME_SOURCE_AUTHORIZATION_STATES.includes(input.next.state)) {
    throw new Error("OUTCOME_SOURCE_AUTHORIZATION_STATE_INVALID");
  }
  if (input.prior && (input.prior.authorizationId !== input.next.authorizationId ||
      input.prior.athleteId !== input.next.athleteId ||
      Number(input.next.authorizationVersion) <= Number(input.prior.authorizationVersion))) {
    throw new Error("OUTCOME_SOURCE_AUTHORIZATION_REVISION_INVALID");
  }
  return Object.freeze({ ...input.next, sourceCategories: Object.freeze([...input.next.sourceCategories].sort()),
    permittedPurposes: Object.freeze([...input.next.permittedPurposes].sort()),
    provenance: Object.freeze([...input.next.provenance]) });
}
