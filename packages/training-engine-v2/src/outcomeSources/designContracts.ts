import { explicitIsoTime, stableId, uniqueSorted } from "../prescription/compiler/utilities";

export const OUTCOME_SOURCE_PERSISTENCE_FOUNDATION_CONTRACT_ID =
  "OUTCOME_SOURCE_AND_ADAPTATION_PERSISTENCE_FOUNDATION" as const;
export const OUTCOME_SOURCE_PERSISTENCE_FOUNDATION_CONTRACT_VERSION = "1.0.0" as const;
export const OUTCOME_SOURCE_PERSISTENCE_FOUNDATION_CONTRACT_REFERENCE = Object.freeze({
  contractId: OUTCOME_SOURCE_PERSISTENCE_FOUNDATION_CONTRACT_ID,
  contractVersion: OUTCOME_SOURCE_PERSISTENCE_FOUNDATION_CONTRACT_VERSION,
});
export const OUTCOME_SOURCE_PERSISTENCE_FOUNDATION_STATUS =
  "OUTCOME_SOURCE_AND_ADAPTATION_PERSISTENCE_FOUNDATION_DESIGN_EVIDENCE_NOT_RUNTIME" as const;
export const UNSUPPORTED_OUTCOME_SOURCE_PERSISTENCE_FOUNDATION_VERSION =
  "UNSUPPORTED_OUTCOME_SOURCE_PERSISTENCE_FOUNDATION_VERSION" as const;

export const OUTCOME_SOURCE_CATEGORIES = Object.freeze([
  "exercise_performance", "block_performance", "session_completion", "exercise_substitution",
  "training_response", "pain_or_discomfort_report", "recovery_readiness", "adherence",
  "training_safety", "clinician_restriction", "coach_review", "equipment_snapshot",
  "environment_constraint", "external_training_load", "athlete_report", "source_correction",
  "source_withdrawal", "unknown",
] as const);
export type OutcomeSourceCategory = typeof OUTCOME_SOURCE_CATEGORIES[number];

export const OUTCOME_SOURCE_AUTHORITIES = Object.freeze([
  "authenticated_product_event", "independently_observed_performance", "athlete_explicit_report",
  "coach_reviewed", "clinician_explicit_restriction", "production_engine_trace", "reviewed_aggregate",
  "imported_legacy_record", "unknown",
] as const);
export type OutcomeSourceAuthority = typeof OUTCOME_SOURCE_AUTHORITIES[number];

export const OUTCOME_SOURCE_AUTHORITY_ORDER: Readonly<Record<OutcomeSourceAuthority, number>> = Object.freeze({
  unknown: 0, imported_legacy_record: 1, athlete_explicit_report: 2, authenticated_product_event: 3,
  independently_observed_performance: 4, production_engine_trace: 5, reviewed_aggregate: 6,
  coach_reviewed: 7, clinician_explicit_restriction: 8,
});

export const OUTCOME_SOURCE_REVISION_STATES = Object.freeze([
  "active", "corrected", "superseded", "withdrawn", "invalid", "unknown",
] as const);
export type OutcomeSourceRevisionState = typeof OUTCOME_SOURCE_REVISION_STATES[number];

export const OUTCOME_SOURCE_AUTHORIZATION_STATES = Object.freeze([
  "authorized", "restricted", "revoked", "pending", "unknown",
] as const);
export type OutcomeSourceAuthorizationState = typeof OUTCOME_SOURCE_AUTHORIZATION_STATES[number];
export type OutcomeSourceReviewState = "validated" | "reviewed" | "pending" | "rejected" | "unknown";

export const RAW_OUTCOME_SOURCE_ENVELOPE_CONTRACT_REFERENCE = Object.freeze({
  contractId: "RAW_OUTCOME_SOURCE_ENVELOPE", contractVersion: "1.0.0",
} as const);
export const NORMALIZED_OUTCOME_SOURCE_RECORD_CONTRACT_REFERENCE = Object.freeze({
  contractId: "NORMALIZED_OUTCOME_SOURCE_RECORD", contractVersion: "1.0.0",
} as const);
export const PRODUCTION_OUTCOME_SOURCE_SNAPSHOT_CONTRACT_REFERENCE = Object.freeze({
  contractId: "PRODUCTION_OUTCOME_SOURCE_SNAPSHOT", contractVersion: "1.0.0",
} as const);

export interface OutcomeSourceLineageReference {
  readonly sourceExposureEventId: string | null;
  readonly sessionId: string | null;
  readonly opportunityId: string | null;
  readonly reservationId: string | null;
  readonly prescriptionId: string | null;
  readonly prescriptionRevisionId: string | null;
  readonly sequencePlanId: string | null;
  readonly sequenceRevisionId: string | null;
  readonly plannedBlockId: string | null;
  readonly performedBlockId: string | null;
}

export interface RawOutcomeSourceEnvelope {
  readonly contractReference: typeof RAW_OUTCOME_SOURCE_ENVELOPE_CONTRACT_REFERENCE;
  readonly envelopeId: string;
  readonly sourceCategory: OutcomeSourceCategory;
  readonly sourceSystem: string;
  readonly sourceNativeRecordId: string;
  readonly sourceNativeRevisionId: string | null;
  readonly athleteId: string;
  readonly authenticatedPrincipalId: string;
  readonly deviceClientId: string | null;
  readonly lineage: OutcomeSourceLineageReference;
  readonly eventTime: string;
  readonly eventTimezone: string;
  readonly ingestionTime: string;
  readonly payloadSchemaId: string;
  readonly payloadSchemaVersion: string;
  readonly payloadChecksum: string;
  readonly idempotencyKey: string;
  readonly authorizationReference: string;
  readonly correctionOrSupersessionReference: string | null;
  readonly rawPayloadReference: string;
  readonly provenance: readonly string[];
}

export const OUTCOME_SOURCE_FACT_TYPES = Object.freeze([
  "exercise_started", "session_started", "block_completed", "block_partially_completed", "block_omitted",
  "unplanned_block_completed", "session_completed", "not_performed", "actual_reps", "actual_sets",
  "actual_rounds", "actual_trips", "actual_steps", "actual_breath_cycles", "actual_load", "actual_effort",
  "actual_duration", "actual_tempo", "actual_rest", "actual_order", "actual_support", "actual_range",
  "actual_side", "substitution", "response_tolerance", "symptom_change", "symptom_onset",
  "symptom_persistence", "training_consequence", "body_region", "adherence_state", "readiness_report",
  "localized_recovery_concern", "systemic_recovery_concern", "safety_block", "clinician_prohibition",
  "clinician_permission", "equipment_available", "equipment_increment", "support_surface",
  "training_location", "environment_constraint", "external_activity_type", "external_activity_duration",
  "external_activity_intensity_descriptor", "review_confirmation", "unknown",
] as const);
export type OutcomeSourceFactType = typeof OUTCOME_SOURCE_FACT_TYPES[number];
export type OutcomeSourceFactValue = string | number | boolean | null | readonly string[] | readonly number[];

export const PERFORMANCE_COMPLETION_STATES = Object.freeze([
  "started", "completed", "partially_completed", "omitted", "additional_unplanned", "not_performed", "unknown",
] as const);
export const RESPONSE_TOLERANCE_STATES = Object.freeze([
  "tolerated", "limited", "adverse", "successful_reexposure", "unknown",
] as const);
export const ADHERENCE_STATES = Object.freeze([
  "session_completed", "session_partially_completed", "session_not_started", "session_abandoned",
  "exercise_skipped", "block_skipped", "schedule_conflict", "time_constraint", "equipment_unavailable",
  "user_declined", "unknown",
] as const);
export const RECOVERY_READINESS_STATES = Object.freeze([
  "explicit_adequate", "localized_concern", "systemic_concern", "explicit_not_ready", "unknown",
] as const);
export const EXTERNAL_TRAINING_ACTIVITY_TYPES = Object.freeze([
  "sport_practice", "running", "cycling", "manual_work", "group_class", "competition",
  "other_explicit_activity", "unknown",
] as const);

export interface OutcomeSourceStructuredFact {
  readonly factType: OutcomeSourceFactType;
  readonly value: OutcomeSourceFactValue;
  readonly unit: string | null;
  readonly blockId: string | null;
  readonly side: "left" | "right" | "bilateral" | "alternating" | "unknown" | null;
  readonly supportKey: string | null;
  readonly rangeKey: string | null;
  readonly loadContextKey: string | null;
  readonly independentlyObserved: boolean;
}

export interface OutcomeSourceDecisionUseAuthorization {
  readonly authorizationId: string;
  readonly authorizationVersion: string;
  readonly athleteId: string;
  readonly sourceCategories: readonly OutcomeSourceCategory[];
  readonly permittedPurposes: readonly string[];
  readonly state: OutcomeSourceAuthorizationState;
  readonly effectiveTime: string;
  readonly expirationTime: string | null;
  readonly revocationReference: string | null;
  readonly owner: string;
  readonly provenance: readonly string[];
}

export interface NormalizedOutcomeSourceRecord {
  readonly contractReference: typeof NORMALIZED_OUTCOME_SOURCE_RECORD_CONTRACT_REFERENCE;
  readonly sourceRecordId: string;
  readonly sourceRecordRevisionId: string;
  readonly basedOnRevisionId: string | null;
  readonly sourceCategory: OutcomeSourceCategory;
  readonly sourceOwner: string;
  readonly sourceAuthority: OutcomeSourceAuthority;
  readonly athleteId: string;
  readonly targetIds: readonly string[];
  readonly lineage: OutcomeSourceLineageReference;
  readonly structuredFacts: readonly OutcomeSourceStructuredFact[];
  readonly explicitUnknowns: readonly string[];
  readonly eventTime: string;
  readonly eventTimezone: string;
  readonly ingestionTime: string;
  readonly appliesThroughTime: string | null;
  readonly reviewState: OutcomeSourceReviewState;
  readonly revisionState: OutcomeSourceRevisionState;
  readonly authorizationState: OutcomeSourceAuthorizationState;
  readonly correctionReason: string | null;
  readonly changedStructuredPaths: readonly string[];
  readonly correctionOwner: string | null;
  readonly correctionTime: string | null;
  readonly finalForSourceRecord: boolean;
  readonly provenance: readonly string[];
}

export interface OutcomeSourceRecordRevision {
  readonly sourceRecordId: string;
  readonly revision: NormalizedOutcomeSourceRecord;
  readonly immutableContentFingerprint: string;
}

export interface OutcomeSourceRecordRevisionLedger {
  readonly sourceRecordId: string;
  readonly revisions: readonly OutcomeSourceRecordRevision[];
  readonly activeFinalRevisionId: string | null;
  readonly provenance: readonly string[];
}

export interface OutcomeSourceIdempotencyAttempt {
  readonly idempotencyKey: string;
  readonly sourceNativeIdentity: string;
  readonly normalizedSemanticIdentity: string;
  readonly payloadChecksum: string;
  readonly priorIngestionResult: string | null;
  readonly retryCount: number;
  readonly firstSeenTime: string;
  readonly lastSeenTime: string;
}

export interface OutcomeSourceIdempotencyResult {
  readonly state: "first_delivery" | "exact_retry" | "conflict";
  readonly ingestionResult: string | null;
  readonly createsRevision: boolean;
  readonly reasonCode: string | null;
}

export interface OutcomeSourceExcludedRevision {
  readonly sourceRecordRevisionId: string;
  readonly reasons: readonly string[];
}

export interface ProductionOutcomeSourceSnapshot {
  readonly contractReference: typeof PRODUCTION_OUTCOME_SOURCE_SNAPSHOT_CONTRACT_REFERENCE;
  readonly snapshotId: string;
  readonly snapshotRevisionId: string;
  readonly athleteId: string;
  readonly evaluationTime: string;
  readonly activeSourceRecords: readonly NormalizedOutcomeSourceRecord[];
  readonly activeSourceRevisionIds: readonly string[];
  readonly excludedRevisions: readonly OutcomeSourceExcludedRevision[];
  readonly conflicts: readonly string[];
  readonly unresolvedSourceCategories: readonly OutcomeSourceCategory[];
  readonly authorizationStates: readonly OutcomeSourceAuthorizationState[];
  readonly sourceLineage: readonly string[];
  readonly fingerprint: string;
  readonly auditTrace: readonly string[];
  readonly provenance: readonly string[];
}

export interface BuildProductionOutcomeSourceSnapshotInput {
  readonly foundationContractReference: typeof OUTCOME_SOURCE_PERSISTENCE_FOUNDATION_CONTRACT_REFERENCE;
  readonly snapshotId: string;
  readonly athleteId: string;
  readonly evaluationTime: string;
  readonly revisionLedgers: readonly OutcomeSourceRecordRevisionLedger[];
  readonly authorizations: readonly OutcomeSourceDecisionUseAuthorization[];
  readonly unresolvedSourceCategories: readonly OutcomeSourceCategory[];
  readonly provenance: readonly string[];
}

export interface ProductionOutcomeSourceSnapshotBuildResult {
  readonly snapshot: ProductionOutcomeSourceSnapshot | null;
  readonly reasonCodes: readonly string[];
  readonly auditTrace: readonly string[];
}

export const OUTCOME_SOURCE_ACTIVE_REVISION_CONFLICT = "OUTCOME_SOURCE_ACTIVE_REVISION_CONFLICT" as const;

const REVIEW_ORDER: Readonly<Record<OutcomeSourceReviewState, number>> = Object.freeze({
  unknown: 0, pending: 1, rejected: 2, reviewed: 3, validated: 4,
});

function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value)
    .sort(([left], [right]) => left.localeCompare(right)).map(([key, entry]) => [key, canonical(entry)]));
  return value;
}

function contentFingerprint(value: unknown): string {
  return stableId("outcome-source-content", canonical(value));
}

export function deriveOutcomeSourceImmutableContentFingerprint(value: unknown): string {
  return contentFingerprint(value);
}

function validReference(reference: { readonly contractId: string; readonly contractVersion: string },
  expected: { readonly contractId: string; readonly contractVersion: string }): boolean {
  return reference.contractId === expected.contractId && reference.contractVersion === expected.contractVersion;
}

export function deriveOutcomeSourceRecordId(input: {
  readonly sourceSystem: string; readonly sourceNativeRecordId: string; readonly athleteId: string;
  readonly sourceCategory: OutcomeSourceCategory;
}): string {
  return stableId("outcome-source-record", input);
}

export function deriveOutcomeSourceRecordRevisionId(input: Omit<NormalizedOutcomeSourceRecord,
"sourceRecordRevisionId" | "provenance">): string {
  return stableId("outcome-source-record-revision", canonical(input));
}

export function validateRawOutcomeSourceEnvelope(envelope: RawOutcomeSourceEnvelope): readonly string[] {
  const reasons: string[] = [];
  if (!validReference(envelope.contractReference, RAW_OUTCOME_SOURCE_ENVELOPE_CONTRACT_REFERENCE)) {
    reasons.push("UNSUPPORTED_RAW_OUTCOME_SOURCE_ENVELOPE_VERSION");
  }
  if (!OUTCOME_SOURCE_CATEGORIES.includes(envelope.sourceCategory)) reasons.push("OUTCOME_SOURCE_CATEGORY_INVALID");
  if (![envelope.envelopeId, envelope.sourceSystem, envelope.sourceNativeRecordId, envelope.athleteId,
    envelope.authenticatedPrincipalId, envelope.payloadSchemaId, envelope.payloadSchemaVersion,
    envelope.payloadChecksum, envelope.idempotencyKey, envelope.authorizationReference,
    envelope.rawPayloadReference].every((value) => value.trim().length > 0)) reasons.push("RAW_ENVELOPE_FIELD_REQUIRED");
  if (!explicitIsoTime(envelope.eventTime) || !explicitIsoTime(envelope.ingestionTime)) {
    reasons.push("OUTCOME_SOURCE_TIME_INVALID");
  }
  if (Date.parse(envelope.eventTime) > Date.parse(envelope.ingestionTime)) {
    reasons.push("OUTCOME_SOURCE_EVENT_AFTER_INGESTION");
  }
  return uniqueSorted(reasons);
}

export function validateOutcomeSourceAuthorization(
  authorization: OutcomeSourceDecisionUseAuthorization,
  category: OutcomeSourceCategory,
  athleteId: string,
  evaluationTime: string,
): readonly string[] {
  const reasons: string[] = [];
  if (authorization.athleteId !== athleteId) reasons.push("OUTCOME_SOURCE_AUTHORIZATION_ATHLETE_MISMATCH");
  if (!authorization.sourceCategories.includes(category)) reasons.push("OUTCOME_SOURCE_CATEGORY_NOT_AUTHORIZED");
  if (authorization.state !== "authorized") reasons.push(`OUTCOME_SOURCE_AUTHORIZATION_${authorization.state.toUpperCase()}`);
  if (!authorization.permittedPurposes.includes("longitudinal_adaptation")) {
    reasons.push("OUTCOME_SOURCE_DECISION_PURPOSE_NOT_AUTHORIZED");
  }
  if (!explicitIsoTime(authorization.effectiveTime) || Date.parse(authorization.effectiveTime) > Date.parse(evaluationTime)) {
    reasons.push("OUTCOME_SOURCE_AUTHORIZATION_NOT_EFFECTIVE");
  }
  if (authorization.expirationTime !== null &&
      (!explicitIsoTime(authorization.expirationTime) || Date.parse(authorization.expirationTime) < Date.parse(evaluationTime))) {
    reasons.push("OUTCOME_SOURCE_AUTHORIZATION_EXPIRED");
  }
  return uniqueSorted(reasons);
}

export function validateNormalizedOutcomeSourceRecord(record: NormalizedOutcomeSourceRecord): readonly string[] {
  const reasons: string[] = [];
  if (!validReference(record.contractReference, NORMALIZED_OUTCOME_SOURCE_RECORD_CONTRACT_REFERENCE)) {
    reasons.push("UNSUPPORTED_NORMALIZED_OUTCOME_SOURCE_RECORD_VERSION");
  }
  if (!OUTCOME_SOURCE_CATEGORIES.includes(record.sourceCategory)) reasons.push("OUTCOME_SOURCE_CATEGORY_INVALID");
  if (!OUTCOME_SOURCE_AUTHORITIES.includes(record.sourceAuthority)) reasons.push("OUTCOME_SOURCE_AUTHORITY_INVALID");
  if (!OUTCOME_SOURCE_REVISION_STATES.includes(record.revisionState)) reasons.push("OUTCOME_SOURCE_REVISION_STATE_INVALID");
  if (!OUTCOME_SOURCE_AUTHORIZATION_STATES.includes(record.authorizationState)) {
    reasons.push("OUTCOME_SOURCE_AUTHORIZATION_STATE_INVALID");
  }
  if (!explicitIsoTime(record.eventTime) || !explicitIsoTime(record.ingestionTime) ||
      record.appliesThroughTime !== null && !explicitIsoTime(record.appliesThroughTime) ||
      record.correctionTime !== null && !explicitIsoTime(record.correctionTime)) reasons.push("OUTCOME_SOURCE_TIME_INVALID");
  if (Date.parse(record.eventTime) > Date.parse(record.ingestionTime)) reasons.push("OUTCOME_SOURCE_EVENT_AFTER_INGESTION");
  if (record.basedOnRevisionId === record.sourceRecordRevisionId) reasons.push("OUTCOME_SOURCE_REVISION_SELF_REFERENCE");
  if (record.finalForSourceRecord && record.revisionState !== "active") reasons.push("OUTCOME_SOURCE_FINAL_REVISION_NOT_ACTIVE");
  if (record.sourceAuthority === "unknown" && record.structuredFacts.some((fact) => fact.factType !== "unknown")) {
    reasons.push("UNKNOWN_SOURCE_CANNOT_AUTHORIZE_MATERIAL_CHANGE");
  }
  if (record.structuredFacts.some((fact) => !OUTCOME_SOURCE_FACT_TYPES.includes(fact.factType))) {
    reasons.push("OUTCOME_SOURCE_FACT_TYPE_INVALID");
  }
  if (record.structuredFacts.some((fact) => fact.factType.startsWith("actual_") && !fact.independentlyObserved)) {
    reasons.push("PLANNED_VALUE_CANNOT_BECOME_ACTUAL");
  }
  const { sourceRecordRevisionId: _revision, provenance: _provenance, ...semantic } = record;
  void [_revision, _provenance];
  if (deriveOutcomeSourceRecordRevisionId(semantic) !== record.sourceRecordRevisionId) {
    reasons.push("OUTCOME_SOURCE_RECORD_REVISION_ID_INVALID");
  }
  return uniqueSorted(reasons);
}

function lineageReasons(ledger: OutcomeSourceRecordRevisionLedger): readonly string[] {
  const reasons: string[] = [];
  const ids = new Set(ledger.revisions.map((entry) => entry.revision.sourceRecordRevisionId));
  if (ids.size !== ledger.revisions.length) reasons.push("DUPLICATE_OUTCOME_SOURCE_REVISION");
  const roots = ledger.revisions.filter((entry) => entry.revision.basedOnRevisionId === null);
  if (ledger.revisions.length && roots.length !== 1) reasons.push("OUTCOME_SOURCE_REVISION_ROOT_INVALID");
  for (const entry of ledger.revisions) {
    const record = entry.revision;
    reasons.push(...validateNormalizedOutcomeSourceRecord(record));
    if (record.sourceRecordId !== ledger.sourceRecordId || entry.sourceRecordId !== ledger.sourceRecordId) {
      reasons.push("OUTCOME_SOURCE_RECORD_LINEAGE_MISMATCH");
    }
    if (record.basedOnRevisionId !== null && !ids.has(record.basedOnRevisionId)) {
      reasons.push("OUTCOME_SOURCE_BASED_ON_REVISION_MISSING");
    }
    if (entry.immutableContentFingerprint !== contentFingerprint(record)) {
      reasons.push("OUTCOME_SOURCE_IMMUTABLE_CONTENT_FINGERPRINT_INVALID");
    }
    const visited = new Set<string>();
    let cursor: string | null = record.sourceRecordRevisionId;
    while (cursor !== null) {
      if (visited.has(cursor)) { reasons.push("OUTCOME_SOURCE_CORRECTION_CHAIN_CYCLE"); break; }
      visited.add(cursor);
      cursor = ledger.revisions.find((candidate) => candidate.revision.sourceRecordRevisionId === cursor)
        ?.revision.basedOnRevisionId ?? null;
    }
  }
  return uniqueSorted(reasons);
}

export function validateOutcomeSourceRecordRevisionLedger(
  ledger: OutcomeSourceRecordRevisionLedger,
): readonly string[] {
  return lineageReasons(ledger);
}

function semanticRevisionContent(record: NormalizedOutcomeSourceRecord): string {
  return contentFingerprint({ category: record.sourceCategory, facts: record.structuredFacts,
    unknowns: record.explicitUnknowns, eventTime: record.eventTime, appliesThroughTime: record.appliesThroughTime,
    lineage: record.lineage, targetIds: record.targetIds });
}

export function selectActiveOutcomeSourceRevision(
  ledger: OutcomeSourceRecordRevisionLedger,
  evaluationTime: string,
): { readonly active: NormalizedOutcomeSourceRecord | null; readonly reasonCodes: readonly string[] } {
  const reasons = [...lineageReasons(ledger)];
  if (!explicitIsoTime(evaluationTime)) reasons.push("OUTCOME_SOURCE_EVALUATION_TIME_INVALID");
  if (reasons.length) return Object.freeze({ active: null, reasonCodes: uniqueSorted(reasons) });
  const eligible = ledger.revisions.map((entry) => entry.revision).filter((record) =>
    validateNormalizedOutcomeSourceRecord(record).length === 0 && record.finalForSourceRecord &&
    record.revisionState === "active" && record.authorizationState === "authorized" &&
    Date.parse(record.eventTime) <= Date.parse(evaluationTime) &&
    (record.appliesThroughTime === null || Date.parse(record.appliesThroughTime) >= Date.parse(evaluationTime)));
  if (eligible.length === 0) return Object.freeze({ active: null, reasonCodes: uniqueSorted(reasons) });
  const ranked = [...eligible].sort((left, right) =>
    OUTCOME_SOURCE_AUTHORITY_ORDER[right.sourceAuthority] - OUTCOME_SOURCE_AUTHORITY_ORDER[left.sourceAuthority] ||
    REVIEW_ORDER[right.reviewState] - REVIEW_ORDER[left.reviewState] ||
    right.eventTime.localeCompare(left.eventTime) ||
    left.sourceRecordRevisionId.localeCompare(right.sourceRecordRevisionId));
  const top = ranked[0]!;
  const tied = ranked.filter((record) => OUTCOME_SOURCE_AUTHORITY_ORDER[record.sourceAuthority] ===
      OUTCOME_SOURCE_AUTHORITY_ORDER[top.sourceAuthority] && REVIEW_ORDER[record.reviewState] === REVIEW_ORDER[top.reviewState] &&
      record.eventTime === top.eventTime);
  if (new Set(tied.map(semanticRevisionContent)).size > 1) {
    reasons.push(OUTCOME_SOURCE_ACTIVE_REVISION_CONFLICT);
    return Object.freeze({ active: null, reasonCodes: uniqueSorted(reasons) });
  }
  if (eligible.length > 1) {
    reasons.push("MULTIPLE_ACTIVE_FINAL_OUTCOME_SOURCE_REVISIONS");
    return Object.freeze({ active: null, reasonCodes: uniqueSorted(reasons) });
  }
  if (ledger.activeFinalRevisionId !== null && ledger.activeFinalRevisionId !== top.sourceRecordRevisionId) {
    reasons.push("OUTCOME_SOURCE_STALE_ACTIVE_POINTER");
  }
  if (reasons.length) return Object.freeze({ active: null, reasonCodes: uniqueSorted(reasons) });
  return Object.freeze({ active: top, reasonCodes: uniqueSorted(reasons) });
}

export function evaluateOutcomeSourceIdempotency(
  attempt: OutcomeSourceIdempotencyAttempt,
  prior: OutcomeSourceIdempotencyAttempt | null,
): OutcomeSourceIdempotencyResult {
  if (prior === null) return Object.freeze({ state: "first_delivery", ingestionResult: null,
    createsRevision: true, reasonCode: null });
  const samePayload = attempt.payloadChecksum === prior.payloadChecksum &&
    attempt.sourceNativeIdentity === prior.sourceNativeIdentity &&
    attempt.normalizedSemanticIdentity === prior.normalizedSemanticIdentity;
  if (attempt.idempotencyKey === prior.idempotencyKey && samePayload) {
    return Object.freeze({ state: "exact_retry", ingestionResult: prior.priorIngestionResult,
      createsRevision: false, reasonCode: null });
  }
  if (attempt.idempotencyKey === prior.idempotencyKey) {
    return Object.freeze({ state: "conflict", ingestionResult: null, createsRevision: false,
      reasonCode: "OUTCOME_SOURCE_IDEMPOTENCY_PAYLOAD_CONFLICT" });
  }
  return Object.freeze({ state: "first_delivery", ingestionResult: null, createsRevision: true, reasonCode: null });
}

export function outcomeSourcesAreDuplicates(left: RawOutcomeSourceEnvelope, right: RawOutcomeSourceEnvelope): boolean {
  return left.sourceSystem === right.sourceSystem && left.sourceNativeRecordId === right.sourceNativeRecordId &&
    left.sourceNativeRevisionId === right.sourceNativeRevisionId && left.athleteId === right.athleteId &&
    left.sourceCategory === right.sourceCategory && left.lineage.sourceExposureEventId === right.lineage.sourceExposureEventId &&
    left.payloadChecksum === right.payloadChecksum;
}

export function buildProductionOutcomeSourceSnapshot(
  input: BuildProductionOutcomeSourceSnapshotInput,
): ProductionOutcomeSourceSnapshotBuildResult {
  const reasons: string[] = [];
  const audit: string[] = ["11.0:contract-and-authorization", "11.1:raw-envelope-not-consumed",
    "11.2:normalization", "11.3:revision-selection"];
  if (!validReference(input.foundationContractReference, OUTCOME_SOURCE_PERSISTENCE_FOUNDATION_CONTRACT_REFERENCE)) {
    reasons.push(UNSUPPORTED_OUTCOME_SOURCE_PERSISTENCE_FOUNDATION_VERSION);
  }
  if (!explicitIsoTime(input.evaluationTime)) reasons.push("OUTCOME_SOURCE_EVALUATION_TIME_INVALID");
  const active: NormalizedOutcomeSourceRecord[] = [];
  const excluded: OutcomeSourceExcludedRevision[] = [];
  const conflicts: string[] = [];
  for (const ledger of [...input.revisionLedgers].sort((left, right) => left.sourceRecordId.localeCompare(right.sourceRecordId))) {
    const selected = selectActiveOutcomeSourceRevision(ledger, input.evaluationTime);
    if (selected.reasonCodes.includes(OUTCOME_SOURCE_ACTIVE_REVISION_CONFLICT)) conflicts.push(ledger.sourceRecordId);
    if (selected.active === null) {
      for (const entry of ledger.revisions) excluded.push(Object.freeze({
        sourceRecordRevisionId: entry.revision.sourceRecordRevisionId,
        reasons: selected.reasonCodes.length ? selected.reasonCodes : Object.freeze(["NO_ACTIVE_APPLICABLE_REVISION"]),
      }));
      continue;
    }
    if (selected.active.athleteId !== input.athleteId) {
      reasons.push("OUTCOME_SOURCE_SNAPSHOT_ATHLETE_MISMATCH");
      continue;
    }
    const authorizations = input.authorizations.filter((authorization) =>
      authorization.athleteId === input.athleteId && authorization.sourceCategories.includes(selected.active!.sourceCategory));
    const authorizationValid = authorizations.some((authorization) =>
      validateOutcomeSourceAuthorization(authorization, selected.active!.sourceCategory,
        input.athleteId, input.evaluationTime).length === 0);
    if (!authorizationValid) {
      excluded.push(Object.freeze({ sourceRecordRevisionId: selected.active.sourceRecordRevisionId,
        reasons: Object.freeze(["OUTCOME_SOURCE_DECISION_USE_NOT_AUTHORIZED"]) }));
      continue;
    }
    active.push(selected.active);
  }
  audit.push("11.4:linkage", "11.5:snapshot");
  if (conflicts.length) reasons.push(OUTCOME_SOURCE_ACTIVE_REVISION_CONFLICT);
  if (reasons.length) return Object.freeze({ snapshot: null, reasonCodes: uniqueSorted(reasons), auditTrace: Object.freeze(audit) });
  const ordered = Object.freeze(active.sort((left, right) => left.eventTime.localeCompare(right.eventTime) ||
    left.sourceRecordRevisionId.localeCompare(right.sourceRecordRevisionId)));
  const semantic = { snapshotId: input.snapshotId, athleteId: input.athleteId, evaluationTime: input.evaluationTime,
    activeSourceRevisionIds: ordered.map((record) => record.sourceRecordRevisionId),
    excludedRevisions: [...excluded].sort((left, right) => left.sourceRecordRevisionId.localeCompare(right.sourceRecordRevisionId)),
    conflicts: [...conflicts].sort(), unresolvedSourceCategories: [...input.unresolvedSourceCategories].sort() };
  const fingerprint = contentFingerprint(semantic);
  const snapshot: ProductionOutcomeSourceSnapshot = Object.freeze({
    contractReference: PRODUCTION_OUTCOME_SOURCE_SNAPSHOT_CONTRACT_REFERENCE,
    snapshotId: input.snapshotId,
    snapshotRevisionId: stableId("production-outcome-source-snapshot-revision", semantic),
    athleteId: input.athleteId, evaluationTime: input.evaluationTime, activeSourceRecords: ordered,
    activeSourceRevisionIds: Object.freeze(semantic.activeSourceRevisionIds),
    excludedRevisions: Object.freeze(semantic.excludedRevisions), conflicts: Object.freeze(semantic.conflicts),
    unresolvedSourceCategories: Object.freeze(semantic.unresolvedSourceCategories),
    authorizationStates: Object.freeze([...new Set(input.authorizations.map((entry) => entry.state))].sort()),
    sourceLineage: Object.freeze(ordered.map((record) => record.sourceRecordId).sort()), fingerprint,
    auditTrace: Object.freeze([...audit, "snapshot:fingerprint-emitted"]), provenance: Object.freeze([...input.provenance]),
  });
  return Object.freeze({ snapshot, reasonCodes: Object.freeze([]), auditTrace: snapshot.auditTrace });
}

export const EXERCISE_PERFORMANCE_SOURCE_ADAPTER_CONTRACT = Object.freeze({
  contractId: "EXERCISE_PERFORMANCE_SOURCE_ADAPTER_CONTRACT", version: "1.0.0", liveAdapter: false,
  plannedValuesMayBecomeActual: false, blockLevelRequired: true, preservesPrescriptionAndSequenceRevisions: true,
});
export const TRAINING_RESPONSE_SOURCE_ADAPTER_CONTRACT = Object.freeze({
  contractId: "TRAINING_RESPONSE_SOURCE_ADAPTER_CONTRACT", version: "1.0.0", liveAdapter: false,
  diagnoses: false, painRegionAloneCreatesIntolerance: false, automaticallyCreatesSafetyBlock: false,
});
export const ADHERENCE_SOURCE_ADAPTER_CONTRACT = Object.freeze({
  contractId: "ADHERENCE_SOURCE_ADAPTER_CONTRACT", version: "1.0.0", liveAdapter: false,
  oneMissedSessionCreatesRegressionOrDeload: false,
});
export const RECOVERY_READINESS_SOURCE_ADAPTER_CONTRACT = Object.freeze({
  contractId: "RECOVERY_READINESS_SOURCE_ADAPTER_CONTRACT", version: "1.0.0", liveAdapter: false,
  inferredFromCalendarOrSilence: false, universalThreshold: false,
});
export const TRAINING_SAFETY_SOURCE_ADAPTER_CONTRACT = Object.freeze({
  contractId: "TRAINING_SAFETY_SOURCE_ADAPTER_CONTRACT", version: "1.0.0", liveAdapter: false,
  authorityOwner: "training_safety",
});
export const CLINICIAN_RESTRICTION_SOURCE_ADAPTER_CONTRACT = Object.freeze({
  contractId: "CLINICIAN_RESTRICTION_SOURCE_ADAPTER_CONTRACT", version: "1.0.0", liveAdapter: false,
  structuredRestrictionsOnly: true, diagnosisInference: false,
});
export const EQUIPMENT_ENVIRONMENT_SOURCE_ADAPTER_CONTRACT = Object.freeze({
  contractId: "EQUIPMENT_ENVIRONMENT_SOURCE_ADAPTER_CONTRACT", version: "1.0.0", liveAdapter: false,
  createsGoalProgressionOrWeekObjective: false,
});
export const EXTERNAL_TRAINING_LOAD_SOURCE_CONTRACT = Object.freeze({
  contractId: "EXTERNAL_TRAINING_LOAD_SOURCE_CONTRACT", version: "1.0.0", liveAdapter: false,
  inventedLoadScore: false, receiverState: "EXTERNAL_LOAD_RECEIVER_POLICY_REQUIRED",
});

export const OUTCOME_SOURCE_REPLAY_CONTRACT = Object.freeze({
  contractId: "OUTCOME_SOURCE_REPLAY_CONTRACT", version: "1.0.0", immutableEventsOnly: true,
  policyVersionsExplicit: true, hiddenClock: false, randomIds: false, reapplyDirectives: false,
});

export const OUTCOME_SOURCE_GATE_11_SUBGATES = Object.freeze([
  "11.0_contract_and_authorization_truth", "11.1_raw_envelope_truth", "11.2_normalization_truth",
  "11.3_revision_and_correction_truth", "11.4_linkage_truth", "11.5_snapshot_truth",
  "11.6_replay_truth", "11.7_directive_persistence_seam",
] as const);
