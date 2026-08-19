import { describe, expect, it } from "vitest";
import {
  ADAPTATION_APPLICATION_ORCHESTRATION_ACTIVATION_STATUS,
  ADAPTATION_APPLICATION_ORCHESTRATION_CONTRACT_REFERENCE,
  ADAPTATION_APPLICATION_ORCHESTRATION_STATUS,
  PRODUCTION_TO_LEGACY_ADAPTATION_OWNER_PROJECTION,
  validateProductionAdaptationApplicationOrchestrationRequest,
  validateProductionAdaptationApplicationOwnerRegistry,
} from "../../src";
import { orchestrationDependencies, orchestrationRequest } from "../helpers/applicationOrchestrationFixtures";

describe("adaptation application orchestration contracts", () => {
  it("is versioned, deterministic, inactive, and explicitly injected", () => {
    const request = orchestrationRequest();
    expect(ADAPTATION_APPLICATION_ORCHESTRATION_CONTRACT_REFERENCE).toEqual({
      contractId: "ADAPTATION_APPLICATION_ORCHESTRATION", contractVersion: "1.0.0" });
    expect(ADAPTATION_APPLICATION_ORCHESTRATION_STATUS)
      .toBe("ADAPTATION_APPLICATION_ORCHESTRATION_V1_IMPLEMENTED_NOT_ACTIVATED");
    expect(ADAPTATION_APPLICATION_ORCHESTRATION_ACTIVATION_STATUS).toBe("NOT_ACTIVATED");
    expect(validateProductionAdaptationApplicationOrchestrationRequest(request)).toEqual([]);
    expect(validateProductionAdaptationApplicationOrchestrationRequest(orchestrationRequest())).toEqual([]);
    expect(validateProductionAdaptationApplicationOwnerRegistry(orchestrationDependencies().ownerRegistry)).toEqual([]);
    expect(validateProductionAdaptationApplicationOwnerRegistry(undefined))
      .toEqual(["ADAPTATION_APPLICATION_OWNER_REGISTRY_REQUIRED"]);
  });

  it("keeps one canonical owner vocabulary with explicit legacy projection", () => {
    expect(PRODUCTION_TO_LEGACY_ADAPTATION_OWNER_PROJECTION).toMatchObject({
      candidate_intelligence_and_composer: "candidate_composer", product_application: "product_human",
      human_owner_review: "product_human", week: "week" });
  });
});
