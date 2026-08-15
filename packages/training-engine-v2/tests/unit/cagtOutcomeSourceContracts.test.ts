import { describe, expect, it } from "vitest";
import {
  OUTCOME_SOURCE_CATEGORIES,
  OUTCOME_SOURCE_GATE_11_SUBGATES,
  OUTCOME_SOURCE_PERSISTENCE_FOUNDATION_CONTRACT_REFERENCE,
  OUTCOME_SOURCE_PERSISTENCE_FOUNDATION_STATUS,
  UNSUPPORTED_OUTCOME_SOURCE_PERSISTENCE_FOUNDATION_VERSION,
  buildProductionOutcomeSourceSnapshot,
  validateNormalizedOutcomeSourceRecord,
  validateRawOutcomeSourceEnvelope,
} from "../../src/outcomeSources/designContracts";
import { CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V7, validateEffectiveAuthorityRegistryV7 } from
  "../cagt/effectiveAuthorityRegistryV7";
import { evaluateOutcomeSourceGate11 } from "../cagt/outcomeSourceGate11";
import {
  CURRENT_PRODUCT_SOURCE_COUNTS,
  OUTCOME_SOURCE_FOUNDATION_CLASSIFICATION,
  OUTCOME_SOURCE_ONTOLOGY_AUDIT_CLASSIFICATION,
} from "../cagt/outcomeSourceContracts";
import { buildBaselineOutcomeSourceFixture, buildBaselineOutcomeSourceSnapshot } from
  "../helpers/outcomeSourceDesignLab";

describe("outcome source foundation contracts", () => {
  it("pins the design-only foundation and explicit Registry V7 authority", () => {
    expect(OUTCOME_SOURCE_PERSISTENCE_FOUNDATION_CONTRACT_REFERENCE).toEqual({
      contractId: "OUTCOME_SOURCE_AND_ADAPTATION_PERSISTENCE_FOUNDATION", contractVersion: "1.0.0",
    });
    expect(OUTCOME_SOURCE_PERSISTENCE_FOUNDATION_STATUS)
      .toBe("OUTCOME_SOURCE_AND_ADAPTATION_PERSISTENCE_FOUNDATION_DESIGN_EVIDENCE_NOT_RUNTIME");
    expect(OUTCOME_SOURCE_FOUNDATION_CLASSIFICATION)
      .toBe("OUTCOME_SOURCE_AND_ADAPTATION_PERSISTENCE_FOUNDATION_V1_READY_FOR_PRODUCTION_IMPLEMENTATION_AUTHORIZATION");
    expect(OUTCOME_SOURCE_ONTOLOGY_AUDIT_CLASSIFICATION)
      .toBe("TARGETED_OUTCOME_SOURCE_AND_PERSISTENCE_DOMAIN_FIXES_REQUIRED");
    expect(validateEffectiveAuthorityRegistryV7(CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V7)).toEqual([]);
    expect(CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V7.gates.gate_11_execution_response_foundation).toMatchObject({
      exactAuthority: "OUTCOME_SOURCE_AND_PERSISTENCE_DESIGN_EVIDENCE",
      productionRuntimeAuthority: false, testOnlyComparison: true,
    });
  });

  it("validates raw, normalized, and pure snapshot contracts without fallback", () => {
    const fixture = buildBaselineOutcomeSourceFixture();
    expect(validateRawOutcomeSourceEnvelope(fixture.envelope)).toEqual([]);
    expect(validateNormalizedOutcomeSourceRecord(fixture.record)).toEqual([]);
    expect(buildBaselineOutcomeSourceSnapshot()).toMatchObject({ reasonCodes: [],
      snapshot: { athleteId: "athlete-1", activeSourceRevisionIds: [fixture.record.sourceRecordRevisionId] } });
    const unsupported = buildProductionOutcomeSourceSnapshot({
      foundationContractReference: { ...OUTCOME_SOURCE_PERSISTENCE_FOUNDATION_CONTRACT_REFERENCE,
        contractVersion: "9.9.9" as "1.0.0" }, snapshotId: "snapshot", athleteId: "athlete-1",
      evaluationTime: "2026-08-14T16:00:00.000Z", revisionLedgers: [], authorizations: [],
      unresolvedSourceCategories: [], provenance: [],
    });
    expect(unsupported.snapshot).toBeNull();
    expect(unsupported.reasonCodes).toContain(UNSUPPORTED_OUTCOME_SOURCE_PERSISTENCE_FOUNDATION_VERSION);
  });

  it("keeps the category vocabulary closed and records the audited Product gaps", () => {
    expect(OUTCOME_SOURCE_CATEGORIES).toHaveLength(18);
    expect(new Set(OUTCOME_SOURCE_CATEGORIES).size).toBe(18);
    expect(CURRENT_PRODUCT_SOURCE_COUNTS).toEqual({ plannedActualMixing: 1, multiBlockFlattening: 1,
      stableSourceEventLinkage: 0, prescriptionRevisionLinkage: 0, sequenceRevisionLinkage: 0,
      explicitEventTime: 2, explicitIngestionTime: 0, semanticIdempotency: 0,
      immutableRevisionHistory: 0 });
  });

  it("runs Gate 11 fail-stop with later diagnostics shadow-only", () => {
    expect(OUTCOME_SOURCE_GATE_11_SUBGATES).toHaveLength(8);
    const result = evaluateOutcomeSourceGate11([{ subgate: "11.2_normalization_truth",
      reasonCodes: ["FREE_TEXT_PARSED_INTO_BEHAVIOR"] }, { subgate: "11.7_directive_persistence_seam",
      reasonCodes: [] }]);
    expect(result).toMatchObject({ status: "FAIL_STOP", firstFailingSubgate: "11.2_normalization_truth",
      downstreamRescueAccepted: false });
    expect(result.trace.slice(3).every((entry) => !entry.scored && entry.state === "SHADOW_DIAGNOSTIC_ONLY"))
      .toBe(true);
  });
});
