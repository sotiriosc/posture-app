import { describe, expect, it } from "vitest";
import {
  OUTCOME_SOURCE_ADAPTER_CONFLICT,
  OUTCOME_SOURCE_ADAPTER_REQUIRED,
  OUTCOME_SOURCE_ADAPTER_UNAVAILABLE,
  PRODUCTION_OUTCOME_SOURCE_ADAPTERS,
  PRODUCTION_OUTCOME_SOURCE_ADAPTERS_AND_APPEND_ONLY_PERSISTENCE_STATUS,
  PRODUCTION_OUTCOME_SOURCE_ADAPTER_COUNT,
  PRODUCTION_OUTCOME_SOURCE_INGESTION_CONTRACT_REFERENCE,
  PRODUCTION_OUTCOME_SOURCE_IMPLEMENTATION_CLASSIFICATION,
  PRODUCTION_OUTCOME_SOURCE_PERSISTENCE_CONTRACT_REFERENCE,
  PRODUCTION_OUTCOME_SOURCE_REPLAY_CONTRACT_REFERENCE,
  buildVersionedProductionOutcomeSourceSnapshot,
  createOutcomeSourceRecordRevision,
  createProductionOutcomeSourceAdapterRegistry,
  deriveOutcomeSourceRecordRevisionId,
  normalizeOutcomeSourceEnvelope,
  resolveProductionOutcomeSourceAdapter,
  validateOutcomeSourceEnvelope,
} from "../../src/outcomeSources";
import { buildProductionAuthorization, buildProductionPerformanceEnvelope,
  buildNormalizedProductionPerformance, PRODUCTION_SOURCE_ADAPTER_REGISTRY,
  PRODUCTION_SOURCE_EVALUATION_TIME } from "../helpers/productionOutcomeSourceFixtures";

describe("production outcome source contracts", () => {
  it("pins the implementation contracts without activation", () => {
    expect(PRODUCTION_OUTCOME_SOURCE_ADAPTERS_AND_APPEND_ONLY_PERSISTENCE_STATUS).toBe(
      "PRODUCTION_OUTCOME_SOURCE_ADAPTERS_AND_APPEND_ONLY_PERSISTENCE_IMPLEMENTED_NOT_ACTIVATED");
    expect(PRODUCTION_OUTCOME_SOURCE_IMPLEMENTATION_CLASSIFICATION).toBe(
      "PRODUCTION_OUTCOME_SOURCE_ADAPTERS_AND_APPEND_ONLY_PERSISTENCE_READY_FOR_PRODUCTION_WEEK_PLANNER_AND_ALLOCATION_AUTHORIZATION");
    expect(PRODUCTION_OUTCOME_SOURCE_INGESTION_CONTRACT_REFERENCE.contractVersion).toBe("1.0.0");
    expect(PRODUCTION_OUTCOME_SOURCE_PERSISTENCE_CONTRACT_REFERENCE.contractVersion).toBe("1.0.0");
    expect(PRODUCTION_OUTCOME_SOURCE_REPLAY_CONTRACT_REFERENCE.contractVersion).toBe("1.0.0");
    expect(PRODUCTION_OUTCOME_SOURCE_ADAPTER_COUNT).toBe(15);
    expect(PRODUCTION_OUTCOME_SOURCE_ADAPTERS.every((adapter) => !adapter.provenance.includes("live-app"))).toBe(true);
  });

  it("requires a caller-supplied exact adapter version and rejects ambiguity", () => {
    const envelope = buildProductionPerformanceEnvelope();
    expect(resolveProductionOutcomeSourceAdapter(createProductionOutcomeSourceAdapterRegistry([]), envelope)
      .reasonCode).toBe(OUTCOME_SOURCE_ADAPTER_REQUIRED);
    expect(resolveProductionOutcomeSourceAdapter(createProductionOutcomeSourceAdapterRegistry([
      { ...PRODUCTION_OUTCOME_SOURCE_ADAPTERS[0]!, adapterVersion: "0.9.0" },
    ]), envelope).reasonCode).toBe(OUTCOME_SOURCE_ADAPTER_UNAVAILABLE);
    expect(resolveProductionOutcomeSourceAdapter(createProductionOutcomeSourceAdapterRegistry([
      PRODUCTION_OUTCOME_SOURCE_ADAPTERS[0]!, PRODUCTION_OUTCOME_SOURCE_ADAPTERS[0]!,
    ]), envelope).reasonCode).toBe(OUTCOME_SOURCE_ADAPTER_CONFLICT);
  });

  it("normalizes authoritative multi-block Performance without flattening planned values into actuals", () => {
    const result = normalizeOutcomeSourceEnvelope({ envelope: buildProductionPerformanceEnvelope(),
      authorization: buildProductionAuthorization(), adapterRegistry: PRODUCTION_SOURCE_ADAPTER_REGISTRY });
    expect(result.reasonCodes).toEqual([]);
    expect(result.record?.structuredFacts.filter((fact) => fact.factType === "actual_reps")).toHaveLength(2);
    expect(new Set(result.record?.structuredFacts.filter((fact) => fact.factType === "actual_reps")
      .map((fact) => fact.blockId)).size).toBe(2);
    expect(result.record?.structuredFacts.filter((fact) => fact.factType.startsWith("actual_") &&
      !fact.independentlyObserved)).toEqual([]);
  });

  it("rejects free text, checksum drift, and unobserved actual values", () => {
    const baseline = buildProductionPerformanceEnvelope();
    const withText = { ...baseline, structuredPayload: { ...baseline.structuredPayload, notes: "do not parse" } };
    expect(validateOutcomeSourceEnvelope(withText, PRODUCTION_SOURCE_ADAPTER_REGISTRY)).toContain(
      "OUTCOME_SOURCE_RAW_FIELD_PROHIBITED:notes");
    const unobserved = { ...baseline, structuredPayload: { ...baseline.structuredPayload,
      blocks: [{ ...(baseline.structuredPayload!.blocks as object[])[0], actualsIndependentlyObserved: false }] } };
    const result = normalizeOutcomeSourceEnvelope({ envelope: { ...unobserved,
      payloadChecksum: baseline.payloadChecksum }, authorization: buildProductionAuthorization(),
    adapterRegistry: PRODUCTION_SOURCE_ADAPTER_REGISTRY });
    expect(result.reasonCodes).toEqual(expect.arrayContaining([
      "OUTCOME_SOURCE_PAYLOAD_CHECKSUM_INVALID", "PLANNED_VALUE_CANNOT_BECOME_ACTUAL",
    ]));
  });

  it("defaults authorization closed and excludes revoked records from snapshots", () => {
    const envelope = buildProductionPerformanceEnvelope();
    expect(normalizeOutcomeSourceEnvelope({ envelope, authorization: null,
      adapterRegistry: PRODUCTION_SOURCE_ADAPTER_REGISTRY }).ingestionStatus).toBe("authorization_required");
    expect(normalizeOutcomeSourceEnvelope({ envelope, authorization: buildProductionAuthorization("revoked"),
      adapterRegistry: PRODUCTION_SOURCE_ADAPTER_REGISTRY }).ingestionStatus).toBe("authorization_restricted");
    const fixture = buildNormalizedProductionPerformance();
    const built = buildVersionedProductionOutcomeSourceSnapshot({
      ingestionContractReference: PRODUCTION_OUTCOME_SOURCE_INGESTION_CONTRACT_REFERENCE,
      snapshotId: "snapshot-1", athleteId: "athlete-1", evaluationTime: PRODUCTION_SOURCE_EVALUATION_TIME,
      revisionLedgers: [fixture.ledger], authorizations: [buildProductionAuthorization("revoked")],
      unresolvedSourceCategories: [], provenance: ["test:revoked-exclusion"],
    });
    expect(built.snapshot?.activeSourceRevisionIds).toEqual([]);
    expect(built.snapshot?.excludedRevisions[0]?.reasons).toContain("OUTCOME_SOURCE_DECISION_USE_NOT_AUTHORIZED");
  });

  it("uses the separate active pointer for an immutable correction history", () => {
    const fixture = buildNormalizedProductionPerformance();
    const { sourceRecordRevisionId: _priorRevisionId, provenance: _priorProvenance,
      ...priorSemantic } = fixture.record;
    void [_priorRevisionId, _priorProvenance];
    const correctionSemantic = Object.freeze({ ...priorSemantic,
      basedOnRevisionId: fixture.record.sourceRecordRevisionId,
      correctionReason: "observed_load_corrected", changedStructuredPaths: Object.freeze(["structuredFacts"]),
      correctionOwner: "test-owner", correctionTime: PRODUCTION_SOURCE_EVALUATION_TIME });
    const correction = Object.freeze({ ...correctionSemantic,
      sourceRecordRevisionId: deriveOutcomeSourceRecordRevisionId(correctionSemantic),
      provenance: Object.freeze(["test:immutable-correction"]) });
    const ledger = Object.freeze({ ...fixture.ledger,
      revisions: Object.freeze([...fixture.ledger.revisions, createOutcomeSourceRecordRevision(correction)]),
      activeFinalRevisionId: correction.sourceRecordRevisionId });
    const built = buildVersionedProductionOutcomeSourceSnapshot({
      ingestionContractReference: PRODUCTION_OUTCOME_SOURCE_INGESTION_CONTRACT_REFERENCE,
      snapshotId: "snapshot-correction", athleteId: "athlete-1",
      evaluationTime: PRODUCTION_SOURCE_EVALUATION_TIME, revisionLedgers: [ledger],
      authorizations: [buildProductionAuthorization()], unresolvedSourceCategories: [],
      provenance: ["test:pointer-selection"],
    });
    expect(built.reasonCodes).toEqual([]);
    expect(built.snapshot?.activeSourceRevisionIds).toEqual([correction.sourceRecordRevisionId]);
    expect(built.snapshot?.excludedRevisions).toContainEqual({
      sourceRecordRevisionId: fixture.record.sourceRecordRevisionId,
      reasons: ["SUPERSEDED_BY_ACTIVE_POINTER"],
    });
  });
});
