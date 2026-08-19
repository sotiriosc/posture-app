import { describe, expect, it } from "vitest";
import {
  LEGACY_PRODUCT_COMPATIBILITY_ADAPTER_COUNT,
  PRODUCT_NATIVE_COMPATIBILITY_MAPPING_COUNT,
  PRODUCTION_OUTCOME_SOURCE_INGESTION_CONTRACT_REFERENCE,
  PRODUCTION_OUTCOME_SOURCE_REPLAY_CONTRACT_REFERENCE,
  REPLAY_ADAPTER_VERSION_UNAVAILABLE,
  analyzeLegacyOutcomeSourceBackfill,
  buildVersionedProductionOutcomeSourceSnapshot,
  replayOutcomeSourceHistory,
} from "../../src/outcomeSources";
import { buildNormalizedProductionPerformance, buildProductionAuthorization,
  PRODUCTION_SOURCE_ADAPTER_REGISTRY, PRODUCTION_SOURCE_EVALUATION_TIME } from
  "../helpers/productionOutcomeSourceFixtures";

describe("production replay and legacy compatibility", () => {
  it("replays immutable records deterministically without writes, decisions, or applications", () => {
    const fixture = buildNormalizedProductionPerformance();
    const snapshot = buildVersionedProductionOutcomeSourceSnapshot({
      ingestionContractReference: PRODUCTION_OUTCOME_SOURCE_INGESTION_CONTRACT_REFERENCE,
      snapshotId: "snapshot-1", athleteId: "athlete-1", evaluationTime: PRODUCTION_SOURCE_EVALUATION_TIME,
      revisionLedgers: [fixture.ledger], authorizations: [buildProductionAuthorization()],
      unresolvedSourceCategories: [], provenance: ["test:initial-snapshot"],
    }).snapshot!;
    const result = replayOutcomeSourceHistory({
      replayContractReference: PRODUCTION_OUTCOME_SOURCE_REPLAY_CONTRACT_REFERENCE,
      mode: "full_audit_compare", athleteId: "athlete-1", evaluationTime: PRODUCTION_SOURCE_EVALUATION_TIME,
      snapshotId: "snapshot-1", revisionLedgers: [fixture.ledger], authorizations: [buildProductionAuthorization()],
      unresolvedSourceCategories: [], historicalAdapterReferences: [{
        adapterId: fixture.envelope.adapterId, adapterVersion: fixture.envelope.adapterVersion,
        payloadSchemaId: fixture.envelope.payloadSchemaId,
        payloadSchemaVersion: fixture.envelope.payloadSchemaVersion,
      }], adapterRegistry: PRODUCTION_SOURCE_ADAPTER_REGISTRY, storedSnapshotFingerprint: snapshot.fingerprint,
      storedLedger: { ids: snapshot.activeSourceRevisionIds }, storedDecision: { action: "hold" },
      buildCompletedLedger: (rebuilt) => ({ ids: rebuilt.activeSourceRevisionIds }),
      evaluateDecision: () => ({ action: "hold" }),
    });
    expect(result.status).toBe("matched");
    expect(result.persistenceWriteCount).toBe(0);
    expect(result.duplicateDecisionCount).toBe(0);
    expect(result.directiveApplicationCount).toBe(0);
  });

  it("fails closed when an historical adapter version is unavailable", () => {
    const fixture = buildNormalizedProductionPerformance();
    const result = replayOutcomeSourceHistory({
      replayContractReference: PRODUCTION_OUTCOME_SOURCE_REPLAY_CONTRACT_REFERENCE,
      mode: "source_only", athleteId: "athlete-1", evaluationTime: PRODUCTION_SOURCE_EVALUATION_TIME,
      snapshotId: "snapshot-1", revisionLedgers: [fixture.ledger], authorizations: [buildProductionAuthorization()],
      unresolvedSourceCategories: [], historicalAdapterReferences: [{ adapterId: fixture.envelope.adapterId,
        adapterVersion: "0.1.0", payloadSchemaId: fixture.envelope.payloadSchemaId,
        payloadSchemaVersion: fixture.envelope.payloadSchemaVersion }],
      adapterRegistry: PRODUCTION_SOURCE_ADAPTER_REGISTRY, storedSnapshotFingerprint: null,
      storedLedger: null, storedDecision: null,
    });
    expect(result.reasonCodes).toContain(REPLAY_ADAPTER_VERSION_UNAVAILABLE);
  });

  it("keeps all five Product compatibility adapters restricted and performs no backfill write", () => {
    const result = analyzeLegacyOutcomeSourceBackfill({
      exerciseLogs: [{ id: "log-1", sessionId: "session-1", exerciseId: "exercise-1",
        setsPlanned: 3, setsCompleted: 2, reps: 8, notes: "ignored", createdAt: null }],
      sessions: [{ id: "session-1", completedAt: null, notes: "ignored" }],
      structuredFeedback: [{ id: "feedback-1", sessionId: "session-1", completed: "partial", notes: "ignored" }],
      questionnaire: { id: "questionnaire-1", completedAt: null, structuredAnswers: { goal: "build" } },
      equipmentPreferences: { id: "equipment-1", equipmentIds: ["dumbbell"], updatedAt: null },
    });
    expect(LEGACY_PRODUCT_COMPATIBILITY_ADAPTER_COUNT).toBe(5);
    expect(PRODUCT_NATIVE_COMPATIBILITY_MAPPING_COUNT).toBe(5);
    expect(result.recordCount).toBe(5);
    expect(result.writeCount).toBe(0);
    expect(result.projections.every((entry) => entry.decisionUseState === "restricted")).toBe(true);
    expect(result.classifications.source_event_mapping_required).toBeGreaterThan(0);
    expect(result.classifications.planned_actual_mixed).toBe(1);
    expect(result.classifications.free_text_ignored).toBe(3);
  });
});
