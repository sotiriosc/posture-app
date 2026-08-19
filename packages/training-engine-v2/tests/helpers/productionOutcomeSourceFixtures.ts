import {
  PRODUCTION_OUTCOME_SOURCE_ADAPTERS,
  PRODUCTION_OUTCOME_SOURCE_INGESTION_CONTRACT_REFERENCE,
  createOutcomeSourceRecordRevision,
  createProductionOutcomeSourceAdapterRegistry,
  deriveCanonicalOutcomeSourceChecksum,
  normalizeOutcomeSourceEnvelope,
  type OutcomeSourceDecisionUseAuthorization,
  type OutcomeSourceRecordRevisionLedger,
  type ProductionRawOutcomeSourceEnvelope,
} from "../../src/outcomeSources";

export const PRODUCTION_SOURCE_EVENT_TIME = "2026-08-14T15:00:00.000Z";
export const PRODUCTION_SOURCE_INGESTION_TIME = "2026-08-14T15:05:00.000Z";
export const PRODUCTION_SOURCE_EVALUATION_TIME = "2026-08-14T16:00:00.000Z";

export const PRODUCTION_SOURCE_ADAPTER_REGISTRY = createProductionOutcomeSourceAdapterRegistry(
  PRODUCTION_OUTCOME_SOURCE_ADAPTERS,
);

export function buildProductionPerformancePayload(index = 1) {
  return Object.freeze({ assignmentId: `assignment-${index}`, originalExerciseId: `exercise-${index}`,
    realizedExerciseId: `exercise-${index}`, blocks: Object.freeze([
      Object.freeze({ plannedBlockId: `planned-block-${index}-1`, performedBlockId: `performed-block-${index}-1`,
        completionState: "completed" as const, actualsIndependentlyObserved: true,
        actualRepsBySet: Object.freeze([8, 8, 8]), actualSets: 3, actualLoad: 20,
        loadUnit: "kg", actualDurationSeconds: 90, actualRestSeconds: 60, actualOrder: 1,
        side: "bilateral" as const, supportKey: "unsupported", rangeKey: "full",
        loadContextKey: "20kg" }),
      Object.freeze({ plannedBlockId: `planned-block-${index}-2`, performedBlockId: `performed-block-${index}-2`,
        completionState: "partially_completed" as const, actualsIndependentlyObserved: true,
        actualRepsBySet: Object.freeze([6, 5]), actualSets: 2, actualLoad: 20,
        loadUnit: "kg", actualDurationSeconds: 55, actualRestSeconds: 75, actualOrder: 2,
        side: "bilateral" as const, supportKey: "unsupported", rangeKey: "full",
        loadContextKey: "20kg" }),
    ]), substitutionLineage: Object.freeze([`exercise-${index}`]), explicitUnknowns: Object.freeze<string[]>([]) });
}

export function buildProductionPerformanceEnvelope(index = 1): ProductionRawOutcomeSourceEnvelope {
  const payload = buildProductionPerformancePayload(index);
  return Object.freeze({ ingestionContractReference: PRODUCTION_OUTCOME_SOURCE_INGESTION_CONTRACT_REFERENCE,
    envelopeId: `envelope-${index}`, sourceCategory: "exercise_performance",
    sourceSystem: "praxis-product-test", sourceNativeRecordId: `performance-${index}`,
    sourceNativeRevisionId: `performance-revision-${index}`, athleteId: "athlete-1",
    authenticatedPrincipalId: "principal-1", lineage: Object.freeze({
      sourceExposureEventId: `source-event-${index}`, sessionId: `session-${index}`,
      opportunityId: `opportunity-${index}`, reservationId: `reservation-${index}`,
      prescriptionId: `prescription-${index}`, prescriptionRevisionId: `prescription-revision-${index}`,
      sequencePlanId: `sequence-${index}`, sequenceRevisionId: `sequence-revision-${index}`,
      plannedBlockId: null, performedBlockId: null }), eventTime: PRODUCTION_SOURCE_EVENT_TIME,
    eventTimezone: "UTC", ingestionTime: PRODUCTION_SOURCE_INGESTION_TIME,
    payloadSchemaId: "production-performance-payload", payloadSchemaVersion: "1.0.0",
    adapterId: "production-exercise-performance", adapterVersion: "1.0.0",
    payloadChecksum: deriveCanonicalOutcomeSourceChecksum(payload), idempotencyKey: `idempotency-${index}`,
    decisionUseAuthorizationReference: "authorization-performance",
    correctionOrSupersessionReference: null, structuredPayload: payload, opaquePayloadReference: null,
    provenance: Object.freeze(["test-fixture:structured-performance"]) });
}

export function buildProductionAuthorization(
  state: OutcomeSourceDecisionUseAuthorization["state"] = "authorized",
): OutcomeSourceDecisionUseAuthorization {
  return Object.freeze({ authorizationId: "authorization-performance", authorizationVersion: "1",
    athleteId: "athlete-1", sourceCategories: Object.freeze(["exercise_performance"] as const),
    permittedPurposes: Object.freeze(["longitudinal_adaptation"]), state,
    effectiveTime: "2026-01-01T00:00:00.000Z", expirationTime: null,
    revocationReference: state === "revoked" ? "revocation-1" : null,
    owner: "product-authorization", provenance: Object.freeze(["test-fixture:authorization"]) });
}

export function buildNormalizedProductionPerformance(index = 1) {
  const envelope = buildProductionPerformanceEnvelope(index);
  const authorization = buildProductionAuthorization();
  const normalized = normalizeOutcomeSourceEnvelope({ envelope, authorization,
    adapterRegistry: PRODUCTION_SOURCE_ADAPTER_REGISTRY });
  if (!normalized.record) throw new Error(normalized.reasonCodes.join(","));
  const ledger: OutcomeSourceRecordRevisionLedger = Object.freeze({ sourceRecordId: normalized.record.sourceRecordId,
    revisions: Object.freeze([createOutcomeSourceRecordRevision(normalized.record)]),
    activeFinalRevisionId: normalized.record.sourceRecordRevisionId,
    provenance: Object.freeze(["test-fixture:append-only-ledger"]) });
  return Object.freeze({ envelope, authorization, normalized, record: normalized.record, ledger });
}
