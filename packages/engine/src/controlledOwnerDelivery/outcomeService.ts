import {
  PRODUCTION_OUTCOME_SOURCE_ADAPTERS,
  PRODUCTION_OUTCOME_SOURCE_INGESTION_CONTRACT_REFERENCE,
  buildSessionPracticeLongitudinalObservation,
  createProductionOutcomeSourceAdapterRegistry,
  deriveCanonicalOutcomeSourceChecksum,
  stableId,
  type OutcomeSourceDecisionUseAuthorization,
  type OwnerCalibrationCycleRevision,
  type OwnerCalibrationRecoveryObservation,
  type OwnerCalibrationSessionObservation,
  type ProductionPerformancePayload,
  type ProductionRecoveryPayload,
  type ProductionRawOutcomeSourceEnvelope,
  type ProductionSafetyPayload,
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
  readonly calibration?: {
    readonly cycle: OwnerCalibrationCycleRevision;
    readonly observation: OwnerCalibrationSessionObservation;
  };
}) {
  if (!input.revision.completion || !input.revision.outcomeLink) {
    throw new Error("OWNER_SESSION_COMPLETION_OUTCOME_LINEAGE_REQUIRED");
  }
  const payload = Object.freeze({ sessionId: input.source.sourceSessionId,
    state: completionState(input.revision),
    targetIds: Object.freeze([input.revision.attemptId, input.revision.completion.dispositionId,
      ...input.revision.completion.creditedSourceEventIds,
      ...(input.calibration ? [input.calibration.cycle.cycleId, input.source.sourceSessionId] : [])]),
    explicitUnknowns: Object.freeze(input.calibration ? ["recovery_response"] :
      ["training_response", "recovery_response"]),
    ...(input.calibration ? { difficulty: input.calibration.observation.session.difficulty,
      energy: input.calibration.observation.session.energy,
      immediatePainResponse: input.calibration.observation.session.immediatePainResponse,
      reportingAuthority: "athlete_explicit_report" as const } : {}) });
  const firstLineage = Object.values(input.revision.outcomeLink.lineageByPerformedSourceEventId)[0] ?? null;
  const authorizationId = stableId("controlled-owner-outcome-authorization", { userId: input.userId });
  const authorization: OutcomeSourceDecisionUseAuthorization = Object.freeze({ authorizationId,
    authorizationVersion: "1", athleteId: input.userId,
    sourceCategories: Object.freeze(input.calibration ? ["session_completion", "block_performance",
      "training_response", "pain_or_discomfort_report", "training_safety"] as const :
      ["session_completion"] as const),
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
  const performanceOutcomes = [];
  const responseOutcomes = [];
  const safetyOutcomes = [];
  if (input.calibration) {
    for (const observation of input.calibration.observation.assignments) {
      const obligation = input.calibration.cycle.obligations.find((entry) =>
        entry.obligationId === observation.obligationId);
      if (!obligation) throw new Error("OWNER_CALIBRATION_OBLIGATION_LINEAGE_REQUIRED");
      const performancePayload: ProductionPerformancePayload = Object.freeze({
        assignmentId: obligation.assignmentId,
        originalExerciseId: obligation.exerciseId,
        realizedExerciseId: obligation.exerciseId,
        blocks: Object.freeze(observation.sets.map((set) => Object.freeze({
          plannedBlockId: obligation.doseBlockId,
          performedBlockId: stableId("owner-calibration-performed-set", {
            attemptId: input.revision.attemptId,
            obligationId: obligation.obligationId,
            setNumber: set.setNumber,
          }),
          completionState: set.completionState === "completed" ? "completed" as const :
            "partially_completed" as const,
          actualsIndependentlyObserved: true,
          actualRepsBySet: Object.freeze([set.repetitions]),
          actualSets: 1,
          ...(set.load.kind === "recorded" ? { actualLoad: set.load.value, loadUnit: set.load.unit } :
            { loadNotApplicable: true }),
          actualEffort: set.effort.value,
          effortScale: set.effort.scale,
          techniqueResponse: set.techniqueResponse,
          painResponse: set.painResponse,
          actualOrder: set.setNumber,
        }))),
        substitutionLineage: Object.freeze([obligation.exerciseId]),
        explicitUnknowns: Object.freeze([]),
        reportingAuthority: "athlete_explicit_report",
        calibrationContext: Object.freeze({ cycleId: input.calibration.cycle.cycleId,
          obligationId: obligation.obligationId, programFingerprint: input.calibration.cycle.programFingerprint,
          profileRevisionId: input.calibration.cycle.profileRevisionId }),
      });
      const performanceEnvelope: ProductionRawOutcomeSourceEnvelope = Object.freeze({
        ingestionContractReference: PRODUCTION_OUTCOME_SOURCE_INGESTION_CONTRACT_REFERENCE,
        envelopeId: stableId("owner-calibration-performance-envelope", {
          attemptId: input.revision.attemptId, obligationId: obligation.obligationId,
          persistenceRevisionId: input.revision.persistenceRevisionId }),
        sourceCategory: "block_performance", sourceSystem: "controlled-owner-session-v2",
        sourceNativeRecordId: `${input.revision.attemptId}:${obligation.obligationId}`,
        sourceNativeRevisionId: input.revision.persistenceRevisionId,
        athleteId: input.userId, authenticatedPrincipalId: input.userId,
        lineage: Object.freeze({ sourceExposureEventId: obligation.sourceExposureEventId,
          sessionId: obligation.sessionId, opportunityId: input.source.week.opportunityId,
          reservationId: input.source.week.reservationId, prescriptionId: obligation.prescriptionId,
          prescriptionRevisionId: obligation.prescriptionRevisionId,
          sequencePlanId: input.revision.plan.finalSequence?.sequencePlanId ?? null,
          sequenceRevisionId: input.revision.plan.finalSequence?.sequenceRevisionId ?? null,
          plannedBlockId: obligation.doseBlockId, performedBlockId: null }),
        eventTime: input.operationTime, eventTimezone: "UTC", ingestionTime: input.operationTime,
        payloadSchemaId: "production-performance-payload", payloadSchemaVersion: "1.0.0",
        adapterId: "production-block-performance", adapterVersion: "1.0.0",
        payloadChecksum: deriveCanonicalOutcomeSourceChecksum(performancePayload),
        idempotencyKey: `owner-calibration-performance:${input.revision.persistenceRevisionId}:${obligation.obligationId}`,
        decisionUseAuthorizationReference: authorizationId, correctionOrSupersessionReference: null,
        structuredPayload: performancePayload, opaquePayloadReference: null,
        provenance: Object.freeze([input.revision.outcomeLink.linkId, obligation.obligationId,
          "controlled-owner:athlete-explicit-post-performance"]),
      });
      const performance = await service.ingestOutcomeSourceEnvelope({ principal: { principalId: input.userId,
        athleteId: input.userId, authorizedAthleteIds: [input.userId], authenticationState: "authenticated" },
        envelope: performanceEnvelope, authorization, adapterRegistry: registry, operationTime: input.operationTime });
      if (!performance.sourceRecordRevisionId) throw new Error("OWNER_CALIBRATION_PERFORMANCE_PERSISTENCE_FAILED");
      performanceOutcomes.push(performance);

      const concern = observation.sets.find((set) => set.painResponse !== "none" ||
        set.techniqueResponse !== "controlled");
      if (concern) {
        const responsePayload = Object.freeze({ responseObservationId: stableId("owner-calibration-response", {
          attemptId: input.revision.attemptId, obligationId: obligation.obligationId }),
        targetIds: Object.freeze([input.calibration.cycle.cycleId, obligation.obligationId,
          obligation.exerciseId]),
        tolerance: concern.painResponse === "pain" || concern.painResponse === "session_stopped" ||
          concern.techniqueResponse === "stopped" ? "adverse" as const : "limited" as const,
        region: null, side: "unknown" as const,
        symptomChange: concern.painResponse === "none" ? "unknown" as const : "new" as const,
        onset: "during" as const, persistence: "unknown" as const,
        consequence: concern.completionState === "stopped" ? "block_stopped" as const : "review_required" as const,
        supportKey: null, rangeKey: null, loadContextKey: null,
        explicitUnknowns: Object.freeze(["body_region", "symptom_persistence"]) });
        const responseCategory = concern.painResponse === "none" ? "training_response" as const :
          "pain_or_discomfort_report" as const;
        const responseEnvelope: ProductionRawOutcomeSourceEnvelope = Object.freeze({
          ingestionContractReference: PRODUCTION_OUTCOME_SOURCE_INGESTION_CONTRACT_REFERENCE,
          envelopeId: stableId("owner-calibration-response-envelope", responsePayload),
          sourceCategory: responseCategory, sourceSystem: "controlled-owner-session-v2",
          sourceNativeRecordId: `${input.revision.attemptId}:${obligation.obligationId}:response`,
          sourceNativeRevisionId: input.revision.persistenceRevisionId,
          athleteId: input.userId, authenticatedPrincipalId: input.userId,
          lineage: Object.freeze({ sourceExposureEventId: obligation.sourceExposureEventId,
            sessionId: obligation.sessionId, opportunityId: input.source.week.opportunityId,
            reservationId: input.source.week.reservationId, prescriptionId: obligation.prescriptionId,
            prescriptionRevisionId: obligation.prescriptionRevisionId,
            sequencePlanId: input.revision.plan.finalSequence?.sequencePlanId ?? null,
            sequenceRevisionId: input.revision.plan.finalSequence?.sequenceRevisionId ?? null,
            plannedBlockId: obligation.doseBlockId, performedBlockId: null }),
          eventTime: input.operationTime, eventTimezone: "UTC", ingestionTime: input.operationTime,
          payloadSchemaId: "production-response-payload", payloadSchemaVersion: "1.0.0",
          adapterId: `production-${responseCategory.replaceAll("_", "-")}`, adapterVersion: "1.0.0",
          payloadChecksum: deriveCanonicalOutcomeSourceChecksum(responsePayload),
          idempotencyKey: `owner-calibration-response:${input.revision.persistenceRevisionId}:${obligation.obligationId}`,
          decisionUseAuthorizationReference: authorizationId, correctionOrSupersessionReference: null,
          structuredPayload: responsePayload, opaquePayloadReference: null,
          provenance: Object.freeze([performance.sourceRecordRevisionId,
            "controlled-owner:athlete-explicit-response"]),
        });
        const response = await service.ingestOutcomeSourceEnvelope({ principal: { principalId: input.userId,
          athleteId: input.userId, authorizedAthleteIds: [input.userId], authenticationState: "authenticated" },
          envelope: responseEnvelope, authorization, adapterRegistry: registry, operationTime: input.operationTime });
        if (!response.sourceRecordRevisionId) throw new Error("OWNER_CALIBRATION_RESPONSE_PERSISTENCE_FAILED");
        responseOutcomes.push(response);

        const safetyPayload: ProductionSafetyPayload = Object.freeze({ targetIds: Object.freeze([
          input.calibration.cycle.cycleId, obligation.obligationId, obligation.exerciseId]),
        restrictionType: "activity", restrictionValue: "calibration_response_requires_review", permitted: false,
        effectiveThroughTime: null, explicitUnknowns: Object.freeze(["review_disposition"]) });
        const safetyEnvelope: ProductionRawOutcomeSourceEnvelope = Object.freeze({
          ingestionContractReference: PRODUCTION_OUTCOME_SOURCE_INGESTION_CONTRACT_REFERENCE,
          envelopeId: stableId("owner-calibration-safety-envelope", safetyPayload),
          sourceCategory: "training_safety", sourceSystem: "controlled-owner-session-v2",
          sourceNativeRecordId: `${input.revision.attemptId}:${obligation.obligationId}:safety`,
          sourceNativeRevisionId: input.revision.persistenceRevisionId,
          athleteId: input.userId, authenticatedPrincipalId: input.userId,
          lineage: Object.freeze({ sourceExposureEventId: obligation.sourceExposureEventId,
            sessionId: obligation.sessionId, opportunityId: input.source.week.opportunityId,
            reservationId: input.source.week.reservationId, prescriptionId: obligation.prescriptionId,
            prescriptionRevisionId: obligation.prescriptionRevisionId,
            sequencePlanId: input.revision.plan.finalSequence?.sequencePlanId ?? null,
            sequenceRevisionId: input.revision.plan.finalSequence?.sequenceRevisionId ?? null,
            plannedBlockId: obligation.doseBlockId, performedBlockId: null }),
          eventTime: input.operationTime, eventTimezone: "UTC", ingestionTime: input.operationTime,
          payloadSchemaId: "production-safety-restriction-payload", payloadSchemaVersion: "1.0.0",
          adapterId: "production-training-safety", adapterVersion: "1.0.0",
          payloadChecksum: deriveCanonicalOutcomeSourceChecksum(safetyPayload),
          idempotencyKey: `owner-calibration-safety:${input.revision.persistenceRevisionId}:${obligation.obligationId}`,
          decisionUseAuthorizationReference: authorizationId, correctionOrSupersessionReference: null,
          structuredPayload: safetyPayload, opaquePayloadReference: null,
          provenance: Object.freeze([response.sourceRecordRevisionId,
            "controlled-owner:canonical-safety-review-handoff"]),
        });
        const safety = await service.ingestOutcomeSourceEnvelope({ principal: { principalId: input.userId,
          athleteId: input.userId, authorizedAthleteIds: [input.userId], authenticationState: "authenticated" },
          envelope: safetyEnvelope, authorization, adapterRegistry: registry, operationTime: input.operationTime });
        if (!safety.sourceRecordRevisionId) throw new Error("OWNER_CALIBRATION_SAFETY_PERSISTENCE_FAILED");
        safetyOutcomes.push(safety);
      }
    }
  }
  const longitudinalObservation = buildSessionPracticeLongitudinalObservation({ source: input.source,
    plan: input.revision.plan, completion: input.revision.completion, outcomeLink: input.revision.outcomeLink });
  return Object.freeze({ contract: CONTROLLED_OWNER_OUTCOME_INTEGRATION_CONTRACT, outcome,
    longitudinalObservation, responseState: "explicit_unknown" as const,
    performanceOutcomes: Object.freeze(performanceOutcomes),
    responseOutcomes: Object.freeze(responseOutcomes),
    safetyOutcomes: Object.freeze(safetyOutcomes),
    automaticAdaptationCount: 0 as const, automaticWeekRewriteCount: 0 as const });
}

export async function persistControlledOwnerCalibrationRecovery(input: {
  readonly userId: string;
  readonly cycle: OwnerCalibrationCycleRevision;
  readonly observation: OwnerCalibrationRecoveryObservation;
  readonly repository: OutcomeSourcePersistencePort;
  readonly operationTime: string;
}) {
  const payload: ProductionRecoveryPayload = Object.freeze({
    targetIds: Object.freeze([input.cycle.cycleId, input.observation.sessionId]),
    scope: "session",
    readiness: input.observation.readiness,
    sleepReport: input.observation.sleepReport,
    appliesThroughTime: null,
    explicitUnknowns: Object.freeze([]),
  });
  const authorizationId = stableId("controlled-owner-outcome-authorization", { userId: input.userId });
  const authorization: OutcomeSourceDecisionUseAuthorization = Object.freeze({ authorizationId,
    authorizationVersion: "1", athleteId: input.userId,
    sourceCategories: Object.freeze(["recovery_readiness"] as const),
    permittedPurposes: Object.freeze(["longitudinal_adaptation"]), state: "authorized",
    effectiveTime: input.operationTime, expirationTime: null, revocationReference: null,
    owner: "controlled_owner_explicit_enrollment", provenance: Object.freeze([
      "controlled-owner:explicit-enrollment", input.cycle.enrollmentRevisionId]) });
  const envelope: ProductionRawOutcomeSourceEnvelope = Object.freeze({
    ingestionContractReference: PRODUCTION_OUTCOME_SOURCE_INGESTION_CONTRACT_REFERENCE,
    envelopeId: stableId("owner-calibration-recovery-envelope", {
      cycleRevisionId: input.cycle.cycleRevisionId, observation: input.observation }),
    sourceCategory: "recovery_readiness", sourceSystem: "controlled-owner-session-v2",
    sourceNativeRecordId: `${input.cycle.cycleId}:${input.observation.sessionId}:recovery`,
    sourceNativeRevisionId: stableId("owner-calibration-recovery-revision", input.observation),
    athleteId: input.userId, authenticatedPrincipalId: input.userId,
    lineage: Object.freeze({ sourceExposureEventId: null, sessionId: input.observation.sessionId,
      opportunityId: null, reservationId: null, prescriptionId: null, prescriptionRevisionId: null,
      sequencePlanId: null, sequenceRevisionId: null, plannedBlockId: null, performedBlockId: null }),
    eventTime: input.operationTime, eventTimezone: "UTC", ingestionTime: input.operationTime,
    payloadSchemaId: "production-recovery-readiness-payload", payloadSchemaVersion: "1.0.0",
    adapterId: "production-recovery-readiness", adapterVersion: "1.0.0",
    payloadChecksum: deriveCanonicalOutcomeSourceChecksum(payload),
    idempotencyKey: `owner-calibration-recovery:${input.cycle.cycleId}:${input.observation.sessionId}`,
    decisionUseAuthorizationReference: authorizationId, correctionOrSupersessionReference: null,
    structuredPayload: payload, opaquePayloadReference: null,
    provenance: Object.freeze([input.cycle.cycleRevisionId, "controlled-owner:athlete-explicit-recovery"]),
  });
  const outcome = await createOutcomeSourceIngestionService({ repository: input.repository })
    .ingestOutcomeSourceEnvelope({ principal: { principalId: input.userId, athleteId: input.userId,
      authorizedAthleteIds: [input.userId], authenticationState: "authenticated" }, envelope, authorization,
    adapterRegistry: registry, operationTime: input.operationTime });
  if (!outcome.sourceRecordRevisionId) throw new Error("OWNER_CALIBRATION_RECOVERY_PERSISTENCE_FAILED");
  return outcome;
}
