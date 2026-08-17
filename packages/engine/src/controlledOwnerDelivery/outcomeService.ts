import {
  PRODUCTION_OUTCOME_SOURCE_ADAPTERS,
  PRODUCTION_OUTCOME_SOURCE_INGESTION_CONTRACT_REFERENCE,
  buildSessionPracticeLongitudinalObservation,
  createProductionOutcomeSourceAdapterRegistry,
  deriveCanonicalOutcomeSourceChecksum,
  stableId,
  type OutcomeSourceDecisionUseAuthorization,
  type ProductionRawOutcomeSourceEnvelope,
  type SessionPracticeSourceSnapshot,
} from "@praxis/training-engine-v2";
import { createOutcomeSourceIngestionService, type OutcomeSourcePersistencePort } from
  "../outcomeSourcePersistence";
import type { PersistedSessionPracticeRevision } from "../sessionPracticeV2";

export const CONTROLLED_OWNER_OUTCOME_INTEGRATION_CONTRACT = Object.freeze({
  contractId: "CONTROLLED_OWNER_SESSION_OUTCOME_INTEGRATION",
  contractVersion: "1.0.0",
});

const registry = createProductionOutcomeSourceAdapterRegistry(PRODUCTION_OUTCOME_SOURCE_ADAPTERS);

function completionState(revision: PersistedSessionPracticeRevision) {
  if (revision.completion?.status === "full_completed_as_prescribed" ||
      revision.completion?.status === "lighter_completed_required_responsibilities_satisfied") {
    return "session_completed" as const;
  }
  if (revision.completion?.status === "practice_attempt_abandoned") return "session_abandoned" as const;
  return "session_partially_completed" as const;
}

export async function persistControlledOwnerSessionOutcome(input: {
  readonly userId: string;
  readonly revision: PersistedSessionPracticeRevision;
  readonly source: SessionPracticeSourceSnapshot;
  readonly repository: OutcomeSourcePersistencePort;
  readonly operationTime: string;
}) {
  if (!input.revision.completion || !input.revision.outcomeLink) {
    throw new Error("OWNER_SESSION_COMPLETION_OUTCOME_LINEAGE_REQUIRED");
  }
  const payload = Object.freeze({ sessionId: input.source.sourceSessionId,
    state: completionState(input.revision),
    targetIds: Object.freeze([input.revision.attemptId, input.revision.completion.dispositionId,
      ...input.revision.completion.creditedSourceEventIds]),
    explicitUnknowns: Object.freeze(["training_response", "recovery_response"]) });
  const firstLineage = Object.values(input.revision.outcomeLink.lineageByPerformedSourceEventId)[0] ?? null;
  const authorizationId = stableId("controlled-owner-outcome-authorization", { userId: input.userId });
  const authorization: OutcomeSourceDecisionUseAuthorization = Object.freeze({ authorizationId,
    authorizationVersion: "1", athleteId: input.userId,
    sourceCategories: Object.freeze(["session_completion"] as const),
    permittedPurposes: Object.freeze(["longitudinal_adaptation"]), state: "authorized",
    effectiveTime: input.revision.createdAt, expirationTime: null, revocationReference: null,
    owner: "controlled_owner_explicit_enrollment", provenance: Object.freeze([
      "controlled-owner:explicit-enrollment", input.revision.request.requestId]) });
  const envelopeId = stableId("controlled-owner-session-completion-envelope", {
    userId: input.userId, persistenceRevisionId: input.revision.persistenceRevisionId });
  const envelope: ProductionRawOutcomeSourceEnvelope = Object.freeze({
    ingestionContractReference: PRODUCTION_OUTCOME_SOURCE_INGESTION_CONTRACT_REFERENCE,
    envelopeId, sourceCategory: "session_completion", sourceSystem: "controlled-owner-session-v2",
    sourceNativeRecordId: input.revision.attemptId,
    sourceNativeRevisionId: input.revision.persistenceRevisionId,
    athleteId: input.userId, authenticatedPrincipalId: input.userId,
    lineage: Object.freeze({ sourceExposureEventId: null, sessionId: input.source.sourceSessionId,
      opportunityId: firstLineage?.opportunityId ?? input.source.week.opportunityId,
      reservationId: firstLineage?.reservationId ?? input.source.week.reservationId,
      prescriptionId: null, prescriptionRevisionId: null,
      sequencePlanId: input.revision.plan.finalSequence?.sequencePlanId ?? null,
      sequenceRevisionId: input.revision.plan.finalSequence?.sequenceRevisionId ?? null,
      plannedBlockId: null, performedBlockId: null }),
    eventTime: input.operationTime, eventTimezone: "UTC", ingestionTime: input.operationTime,
    payloadSchemaId: "production-adherence-payload", payloadSchemaVersion: "1.0.0",
    adapterId: "production-session-completion", adapterVersion: "1.0.0",
    payloadChecksum: deriveCanonicalOutcomeSourceChecksum(payload),
    idempotencyKey: `owner-session-completion:${input.revision.persistenceRevisionId}`,
    decisionUseAuthorizationReference: authorizationId, correctionOrSupersessionReference: null,
    structuredPayload: payload, opaquePayloadReference: null,
    provenance: Object.freeze([input.revision.outcomeLink.linkId,
      "controlled-owner:exact-session-completion"]) });
  const service = createOutcomeSourceIngestionService({ repository: input.repository });
  const outcome = await service.ingestOutcomeSourceEnvelope({ principal: { principalId: input.userId,
    athleteId: input.userId, authorizedAthleteIds: [input.userId], authenticationState: "authenticated" },
    envelope, authorization, adapterRegistry: registry, operationTime: input.operationTime });
  if (!outcome.sourceRecordRevisionId || !["ingested_new_record", "ingested_new_revision",
    "exact_retry_returned_prior_result", "duplicate_semantic_event_preserved_as_existing"].includes(outcome.status)) {
    throw new Error(`OWNER_OUTCOME_SOURCE_PERSISTENCE_FAILED:${outcome.status}`);
  }
  const longitudinalObservation = buildSessionPracticeLongitudinalObservation({ source: input.source,
    plan: input.revision.plan, completion: input.revision.completion, outcomeLink: input.revision.outcomeLink });
  return Object.freeze({ contract: CONTROLLED_OWNER_OUTCOME_INTEGRATION_CONTRACT, outcome,
    longitudinalObservation, responseState: "explicit_unknown" as const,
    automaticAdaptationCount: 0 as const, automaticWeekRewriteCount: 0 as const });
}
