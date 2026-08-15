import {
  buildProductionOutcomeSourceSnapshot,
  deriveOutcomeSourceImmutableContentFingerprint,
  deriveOutcomeSourceRecordRevisionId,
  NORMALIZED_OUTCOME_SOURCE_RECORD_CONTRACT_REFERENCE,
  OUTCOME_SOURCE_PERSISTENCE_FOUNDATION_CONTRACT_REFERENCE,
  RAW_OUTCOME_SOURCE_ENVELOPE_CONTRACT_REFERENCE,
  type NormalizedOutcomeSourceRecord,
  type OutcomeSourceAuthority,
  type OutcomeSourceCategory,
  type OutcomeSourceDecisionUseAuthorization,
  type OutcomeSourceRecordRevision,
  type OutcomeSourceRecordRevisionLedger,
  type ProductionOutcomeSourceSnapshot,
  type RawOutcomeSourceEnvelope,
} from "../../src/outcomeSources/designContracts";
import type {
  ProductionLongitudinalAdaptationInput,
  ProductionLongitudinalOutcomeSourceOwner,
  ProductionLongitudinalOutcomeSourceRecord,
} from "../../src/longitudinalAdaptation";
import { digest } from "../cagt/signatures";

const CATEGORY_BY_OWNER: Readonly<Record<ProductionLongitudinalOutcomeSourceOwner, OutcomeSourceCategory>> = Object.freeze({
  exercise_performance: "exercise_performance", completed_session_summary: "session_completion",
  training_response_receiver: "training_response", recovery_summary: "recovery_readiness",
  adherence_summary: "adherence", progression_readiness: "coach_review", training_safety: "training_safety",
  phase_continuity: "coach_review", coach_review: "coach_review", clinician_restriction: "clinician_restriction",
  athlete_report: "athlete_report", planned_program_truth: "coach_review", unknown: "unknown",
});

function authorityFor(owner: ProductionLongitudinalOutcomeSourceOwner): OutcomeSourceAuthority {
  if (owner === "exercise_performance") return "independently_observed_performance";
  if (owner === "clinician_restriction") return "clinician_explicit_restriction";
  if (owner === "athlete_report") return "athlete_explicit_report";
  if (owner === "coach_review") return "coach_reviewed";
  if (owner === "unknown") return "unknown";
  if (["recovery_summary", "adherence_summary", "completed_session_summary"].includes(owner)) return "reviewed_aggregate";
  return "production_engine_trace";
}

function lineage(record: ProductionLongitudinalOutcomeSourceRecord) {
  return Object.freeze({ sourceExposureEventId: record.sourceExposureEventId, sessionId: record.sessionId,
    opportunityId: record.opportunityId, reservationId: record.reservationId,
    prescriptionId: record.realization?.prescriptionLineageId ?? null,
    prescriptionRevisionId: record.realization?.prescriptionLineageId ?? null,
    sequencePlanId: record.realization?.assignmentLineageId ?? null,
    sequenceRevisionId: record.realization?.assignmentLineageId ?? null,
    plannedBlockId: record.realization?.plannedBlockIds[0] ?? null,
    performedBlockId: record.realization?.actualBlockResultIds[0] ?? null });
}

export interface OutcomeSourceFoundationFixtureProjection {
  readonly envelopes: readonly RawOutcomeSourceEnvelope[];
  readonly revisionLedgers: readonly OutcomeSourceRecordRevisionLedger[];
  readonly authorizations: readonly OutcomeSourceDecisionUseAuthorization[];
  readonly snapshot: ProductionOutcomeSourceSnapshot;
  readonly productionInput: ProductionLongitudinalAdaptationInput;
  readonly sourceRevisionMap: Readonly<Record<string, string>>;
}

export function adaptProductionInputThroughOutcomeSourceFoundation(
  input: ProductionLongitudinalAdaptationInput,
): OutcomeSourceFoundationFixtureProjection {
  const records = input.outcomeSourceSnapshot.sourceRecords;
  const byProductionRevision = new Map(records.map((record) => [record.sourceRecordRevisionId, record]));
  const normalizedByProductionRevision = new Map<string, NormalizedOutcomeSourceRecord>();
  const converting = new Set<string>();
  const convert = (record: ProductionLongitudinalOutcomeSourceRecord): NormalizedOutcomeSourceRecord => {
    const prior = normalizedByProductionRevision.get(record.sourceRecordRevisionId);
    if (prior) return prior;
    if (converting.has(record.sourceRecordRevisionId)) throw new Error("OUTCOME_SOURCE_CORRECTION_CHAIN_CYCLE");
    converting.add(record.sourceRecordRevisionId);
    const basedOn = record.basedOnRevisionId ? byProductionRevision.get(record.basedOnRevisionId) : undefined;
    const normalizedBase = basedOn ? convert(basedOn).sourceRecordRevisionId : null;
    const sourceCategory = CATEGORY_BY_OWNER[record.owner];
    const semantic = {
      contractReference: NORMALIZED_OUTCOME_SOURCE_RECORD_CONTRACT_REFERENCE,
      sourceRecordId: record.sourceRecordId,
      basedOnRevisionId: normalizedBase,
      sourceCategory,
      sourceOwner: record.owner,
      sourceAuthority: authorityFor(record.owner),
      athleteId: record.athleteId,
      targetIds: Object.freeze([record.targetId]),
      lineage: lineage(record),
      structuredFacts: Object.freeze([{ factType: record.owner === "unknown" ? "unknown" as const :
        "review_confirmation" as const, value: Object.freeze([...record.signals].sort()), unit: null, blockId: null,
        side: record.realization?.side ?? null, supportKey: record.realization?.supportKey ?? null,
        rangeKey: record.realization?.rangeKey ?? null, loadContextKey: record.realization?.loadKey ?? null,
        independentlyObserved: false }]),
      explicitUnknowns: Object.freeze(record.signals.includes("unknown_evidence") ? ["source_fact"] : []),
      eventTime: record.observedAt,
      eventTimezone: "UTC",
      ingestionTime: record.recordedAt,
      appliesThroughTime: record.appliesThrough,
      reviewState: record.reviewState,
      revisionState: record.revisionState,
      authorizationState: "authorized" as const,
      correctionReason: record.basedOnRevisionId ? "fixture_revision_projection" : null,
      changedStructuredPaths: Object.freeze(record.basedOnRevisionId ? ["structuredFacts"] : []),
      correctionOwner: record.basedOnRevisionId ? record.owner : null,
      correctionTime: record.basedOnRevisionId ? record.recordedAt : null,
      finalForSourceRecord: record.finalForSourceRecord,
    };
    const normalized = Object.freeze({ ...semantic,
      sourceRecordRevisionId: deriveOutcomeSourceRecordRevisionId(semantic),
      provenance: Object.freeze(["test-fixture-adapter:production-longitudinal-source"]) });
    normalizedByProductionRevision.set(record.sourceRecordRevisionId, normalized);
    converting.delete(record.sourceRecordRevisionId);
    return normalized;
  };
  records.forEach(convert);
  const revisionLedgers = Object.freeze([...new Set(records.map((record) => record.sourceRecordId))].sort()
    .map((sourceRecordId) => {
      const sourceRecords = records.filter((record) => record.sourceRecordId === sourceRecordId);
      const revisions: readonly OutcomeSourceRecordRevision[] = Object.freeze(sourceRecords.map((record) => {
        const revision = normalizedByProductionRevision.get(record.sourceRecordRevisionId)!;
        return Object.freeze({ sourceRecordId, revision,
          immutableContentFingerprint: deriveOutcomeSourceImmutableContentFingerprint(revision) });
      }));
      const activeProductionId = input.outcomeSourceSnapshot.activeSourceRecordRevisionIds.find((id) =>
        sourceRecords.some((record) => record.sourceRecordRevisionId === id));
      return Object.freeze({ sourceRecordId, revisions,
        activeFinalRevisionId: activeProductionId ?
          normalizedByProductionRevision.get(activeProductionId)!.sourceRecordRevisionId : null,
        provenance: Object.freeze(["test-fixture-adapter:immutable-revision-ledger"]) });
    }));
  const categories = [...new Set([...normalizedByProductionRevision.values()].map((record) => record.sourceCategory))];
  const authorizations = Object.freeze(categories.map((sourceCategory): OutcomeSourceDecisionUseAuthorization =>
    Object.freeze({ authorizationId: `fixture-authorization:${sourceCategory}`, authorizationVersion: "1",
      athleteId: input.outcomeSourceSnapshot.athleteId, sourceCategories: Object.freeze([sourceCategory]),
      permittedPurposes: Object.freeze(["longitudinal_adaptation"]), state: "authorized",
      effectiveTime: "2020-01-01T00:00:00.000Z", expirationTime: null, revocationReference: null,
      owner: "fixture_product_authorization", provenance: Object.freeze(["test-only:explicit-authorization"]) })));
  const envelopes = Object.freeze(records.map((record): RawOutcomeSourceEnvelope => Object.freeze({
    contractReference: RAW_OUTCOME_SOURCE_ENVELOPE_CONTRACT_REFERENCE,
    envelopeId: `fixture-envelope:${record.sourceRecordRevisionId}`,
    sourceCategory: CATEGORY_BY_OWNER[record.owner], sourceSystem: "production-longitudinal-fixture",
    sourceNativeRecordId: record.sourceRecordId, sourceNativeRevisionId: record.sourceRecordRevisionId,
    athleteId: record.athleteId, authenticatedPrincipalId: `fixture-principal:${record.athleteId}`,
    deviceClientId: null, lineage: lineage(record), eventTime: record.observedAt, eventTimezone: "UTC",
    ingestionTime: record.recordedAt, payloadSchemaId: "production-longitudinal-fixture",
    payloadSchemaVersion: "1", payloadChecksum: digest(record),
    idempotencyKey: `fixture-idempotency:${record.sourceRecordRevisionId}`,
    authorizationReference: `fixture-authorization:${CATEGORY_BY_OWNER[record.owner]}`,
    correctionOrSupersessionReference: record.basedOnRevisionId,
    rawPayloadReference: `fixture-payload-reference:${record.sourceRecordRevisionId}`,
    provenance: Object.freeze(["test-only:no-live-product-source"]) })));
  const built = buildProductionOutcomeSourceSnapshot({
    foundationContractReference: OUTCOME_SOURCE_PERSISTENCE_FOUNDATION_CONTRACT_REFERENCE,
    snapshotId: `foundation:${input.outcomeSourceSnapshot.snapshotId}`,
    athleteId: input.outcomeSourceSnapshot.athleteId, evaluationTime: input.evaluationTime,
    revisionLedgers, authorizations, unresolvedSourceCategories: Object.freeze([]),
    provenance: Object.freeze(["test-fixture-adapter:foundation-snapshot"]),
  });
  if (!built.snapshot) throw new Error(built.reasonCodes.join(","));
  const reverse = new Map([...normalizedByProductionRevision.entries()].map(([production, normalized]) =>
    [normalized.sourceRecordRevisionId, production]));
  const selectedProduction = built.snapshot.activeSourceRevisionIds.map((id) => reverse.get(id)!).sort();
  const expectedProduction = [...input.outcomeSourceSnapshot.activeSourceRecordRevisionIds].sort();
  if (JSON.stringify(selectedProduction) !== JSON.stringify(expectedProduction)) {
    throw new Error("OUTCOME_SOURCE_ACTIVE_REVISION_PROJECTION_MISMATCH");
  }
  return Object.freeze({ envelopes, revisionLedgers, authorizations, snapshot: built.snapshot,
    productionInput: input,
    sourceRevisionMap: Object.freeze(Object.fromEntries([...normalizedByProductionRevision.entries()]
      .map(([production, normalized]) => [production, normalized.sourceRecordRevisionId]))) });
}
