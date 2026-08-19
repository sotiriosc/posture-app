import {
  normalizeOutcomeSourceEnvelope,
  type OutcomeSourceDecisionUseAuthorization,
  type ProductionOutcomeSourceAdapterRegistry,
  type ProductionRawOutcomeSourceEnvelope,
} from "@praxis/training-engine-v2";
import type { OutcomeSourcePersistencePort, OutcomeSourcePrincipalContext,
  PersistedOutcomeSourceIngestionResult } from "./contracts";
import { OutcomeSourcePersistenceError } from "./contracts";
import { NOOP_OUTCOME_SOURCE_OBSERVABILITY, type OutcomeSourceObservability } from "./observability";
import { outcomeSourceAuthorizationRevisionId } from "./postgresRepository";

export interface IngestOutcomeSourceEnvelopeInput {
  readonly principal: OutcomeSourcePrincipalContext;
  readonly envelope: ProductionRawOutcomeSourceEnvelope;
  readonly authorization: OutcomeSourceDecisionUseAuthorization | null;
  readonly basedOnAuthorizationRevisionId?: string | null;
  readonly basedOnSourceRevisionId?: string | null;
  readonly adapterRegistry: ProductionOutcomeSourceAdapterRegistry;
  readonly operationTime: string;
  readonly correction?: {
    readonly reason: string;
    readonly owner: string;
    readonly changedStructuredPaths: readonly string[];
    readonly correctionTime: string;
    readonly operation: "correction" | "supersession" | "withdrawal" | "invalidation";
  } | null;
}

export interface OutcomeSourceIngestionService {
  readonly ingestOutcomeSourceEnvelope: (
    input: IngestOutcomeSourceEnvelopeInput,
  ) => Promise<PersistedOutcomeSourceIngestionResult>;
}

function rejection(
  envelope: ProductionRawOutcomeSourceEnvelope,
  status: PersistedOutcomeSourceIngestionResult["status"],
  reasons: readonly string[],
  adapterReference: string | null = null,
): PersistedOutcomeSourceIngestionResult {
  return Object.freeze({ status, envelopeId: envelope.envelopeId, sourceRecordId: null,
    sourceRecordRevisionId: null, activeRevisionId: null, adapterReference,
    reasonCodes: Object.freeze([...new Set(reasons)].sort()), downstreamEvaluationCount: 0,
    directiveApplicationCount: 0 });
}

function revisionState(operation: NonNullable<IngestOutcomeSourceEnvelopeInput["correction"]>["operation"] | undefined) {
  return operation === "supersession" ? "superseded" as const : operation === "withdrawal" ? "withdrawn" as const :
    operation === "invalidation" ? "invalid" as const : "active" as const;
}

export function createOutcomeSourceIngestionService(input: {
  readonly repository: OutcomeSourcePersistencePort;
  readonly observability?: OutcomeSourceObservability;
}): OutcomeSourceIngestionService {
  const observability = input.observability ?? NOOP_OUTCOME_SOURCE_OBSERVABILITY;
  return Object.freeze({
    ingestOutcomeSourceEnvelope: async (ingestionInput: IngestOutcomeSourceEnvelopeInput) => {
      const { envelope, principal } = ingestionInput;
      if (principal.authenticationState !== "authenticated" || principal.principalId !== envelope.authenticatedPrincipalId) {
        return rejection(envelope, "authorization_required", ["OUTCOME_SOURCE_AUTHENTICATED_PRINCIPAL_REQUIRED"]);
      }
      if (principal.athleteId !== envelope.athleteId || !principal.authorizedAthleteIds.includes(envelope.athleteId)) {
        return rejection(envelope, "invalid_athlete_mapping", ["OUTCOME_SOURCE_ATHLETE_MAPPING_INVALID"]);
      }
      const normalized = normalizeOutcomeSourceEnvelope({ envelope, authorization: ingestionInput.authorization,
        adapterRegistry: ingestionInput.adapterRegistry, basedOnRevisionId: ingestionInput.basedOnSourceRevisionId ?? null,
        revisionState: revisionState(ingestionInput.correction?.operation),
        correction: ingestionInput.correction ? { reason: ingestionInput.correction.reason,
          owner: ingestionInput.correction.owner,
          changedStructuredPaths: ingestionInput.correction.changedStructuredPaths,
          correctionTime: ingestionInput.correction.correctionTime } : null });
      if (!normalized.record || normalized.status === "rejected" || !ingestionInput.authorization) {
        await observability.emit({ name: "ingestion_rejected", operationTime: ingestionInput.operationTime,
          athleteId: envelope.athleteId, entityId: envelope.envelopeId,
          status: normalized.ingestionStatus, reasonCodes: normalized.reasonCodes });
        return rejection(envelope, normalized.ingestionStatus, normalized.reasonCodes, normalized.adapterReference);
      }
      const record = normalized.record;
      const result: PersistedOutcomeSourceIngestionResult = Object.freeze({
        status: record.basedOnRevisionId ? "ingested_new_revision" : "ingested_new_record",
        envelopeId: envelope.envelopeId, sourceRecordId: record.sourceRecordId,
        sourceRecordRevisionId: record.sourceRecordRevisionId,
        activeRevisionId: record.revisionState === "active" ? record.sourceRecordRevisionId : null,
        adapterReference: normalized.adapterReference, reasonCodes: Object.freeze([]),
        downstreamEvaluationCount: 0, directiveApplicationCount: 0,
      });
      try {
        const persistenceInput = { principal, envelope, authorization: ingestionInput.authorization,
          authorizationRevisionId: outcomeSourceAuthorizationRevisionId(ingestionInput.authorization),
          basedOnAuthorizationRevisionId: ingestionInput.basedOnAuthorizationRevisionId ?? null,
          normalizedRecord: record, result, operationTime: ingestionInput.operationTime };
        if (ingestionInput.correction?.operation === "correction") return await input.repository.appendCorrection(persistenceInput);
        if (ingestionInput.correction?.operation === "supersession") return await input.repository.appendSupersession(persistenceInput);
        if (ingestionInput.correction?.operation === "withdrawal") return await input.repository.appendWithdrawal(persistenceInput);
        return await input.repository.persistNormalizedRevision(persistenceInput);
      } catch (error) {
        if (error instanceof OutcomeSourcePersistenceError) {
          const status = error.code === "idempotency_payload_conflict" ? "idempotency_payload_conflict" :
            error.code === "active_revision_conflict" ? "active_revision_conflict" :
              error.code === "athlete_scope_violation" ? "invalid_athlete_mapping" : "persistence_failure";
          const reason = error.code === "idempotency_payload_conflict" ?
            "OUTCOME_SOURCE_IDEMPOTENCY_PAYLOAD_CONFLICT" : error.code === "active_revision_conflict" ?
              "OUTCOME_SOURCE_ACTIVE_REVISION_CONFLICT" : error.code.toUpperCase();
          await observability.emit({ name: error.code === "idempotency_payload_conflict" ?
            "ingestion_conflicted" : "repository_failure", operationTime: ingestionInput.operationTime,
          athleteId: envelope.athleteId, entityId: envelope.envelopeId, status, reasonCodes: [reason] });
          return rejection(envelope, status, [reason], normalized.adapterReference);
        }
        await observability.emit({ name: "repository_failure", operationTime: ingestionInput.operationTime,
          athleteId: envelope.athleteId, entityId: envelope.envelopeId, status: "persistence_failure",
          reasonCodes: ["OUTCOME_SOURCE_PERSISTENCE_FAILURE"] });
        return rejection(envelope, "persistence_failure", ["OUTCOME_SOURCE_PERSISTENCE_FAILURE"],
          normalized.adapterReference);
      }
    },
  });
}

export const OUTCOME_SOURCE_INGESTION_AUTOMATIC_SNAPSHOT_BUILD_COUNT = 0 as const;
export const OUTCOME_SOURCE_INGESTION_AUTOMATIC_LONGITUDINAL_CALL_COUNT = 0 as const;
export const OUTCOME_SOURCE_INGESTION_DIRECTIVE_APPLICATION_COUNT = 0 as const;
