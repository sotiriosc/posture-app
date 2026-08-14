import { describe, expect, it } from "vitest";
import {
  FINAL_SEQUENCING_SEARCH_RESOURCE_POLICY_ID,
  PRODUCTION_FINAL_SESSION_SEQUENCING_CONTRACT_ID,
  PRODUCTION_FINAL_SESSION_SEQUENCING_CONTRACT_REFERENCE,
  PRODUCTION_FINAL_SESSION_SEQUENCING_CONTRACT_VERSION,
  PRODUCTION_FINAL_SESSION_SEQUENCING_STATUS,
  SESSION_SEQUENCING_POLICY_V1,
  buildSequencedSessionDurationInterval,
  resolveFinalSequencingSearchResourcePolicy,
  resolveFinalSessionSequencingPolicy,
  validateFinalSessionSequencingPolicy,
} from "../../src";
import { PRODUCTION_FINAL_SEQUENCING_TEST_SEARCH_POLICY } from "../helpers/productionFinalSequencingLab";

describe("production Final Session Sequencing contracts", () => {
  it("publishes one versioned implemented-not-activated contract", () => {
    expect(PRODUCTION_FINAL_SESSION_SEQUENCING_CONTRACT_REFERENCE).toEqual({
      contractId: PRODUCTION_FINAL_SESSION_SEQUENCING_CONTRACT_ID,
      contractVersion: PRODUCTION_FINAL_SESSION_SEQUENCING_CONTRACT_VERSION,
    });
    expect(`${PRODUCTION_FINAL_SESSION_SEQUENCING_CONTRACT_ID}@${PRODUCTION_FINAL_SESSION_SEQUENCING_CONTRACT_VERSION}`)
      .toBe("PRODUCTION_FINAL_SESSION_SEQUENCING_KERNEL@1.0.0");
    expect(PRODUCTION_FINAL_SESSION_SEQUENCING_STATUS)
      .toBe("PRODUCTION_FINAL_SESSION_SEQUENCING_KERNEL_IMPLEMENTED_NOT_ACTIVATED");
  });

  it("graduates the admitted policy as one inactive production object", () => {
    expect(validateFinalSessionSequencingPolicy(SESSION_SEQUENCING_POLICY_V1)).toEqual([]);
    expect(SESSION_SEQUENCING_POLICY_V1.policyId).toBe("SESSION_SEQUENCING_POLICY_V1_CAUSAL_SEQUENTIAL");
    expect(SESSION_SEQUENCING_POLICY_V1.activationAuthorized).toBe(false);
    expect(SESSION_SEQUENCING_POLICY_V1.pairingPermitted).toBe(false);
    expect(SESSION_SEQUENCING_POLICY_V1.setupPolicy.relationshipIsDuration).toBe(false);
  });

  it("requires explicit policy injection and an explicit search resource policy", () => {
    expect(resolveFinalSessionSequencingPolicy({ policy: null })).toMatchObject({
      status: "sequencing_policy_required",
      policy: null,
    });
    expect(resolveFinalSessionSequencingPolicy({
      policy: { policyId: SESSION_SEQUENCING_POLICY_V1.policyId, version: "2.0.0" },
      availablePolicies: [SESSION_SEQUENCING_POLICY_V1],
    }).status).toBe("sequencing_policy_unavailable");
    expect(resolveFinalSessionSequencingPolicy({
      policy: {
        ...SESSION_SEQUENCING_POLICY_V1,
        policyId: "UNSUPPORTED_FINAL_SEQUENCING_POLICY",
      },
    }).status).toBe("sequencing_policy_unavailable");
    expect(resolveFinalSequencingSearchResourcePolicy({ policy: null }).status)
      .toBe("sequencing_search_policy_required");
    expect(resolveFinalSequencingSearchResourcePolicy({
      policy: { policyId: FINAL_SEQUENCING_SEARCH_RESOURCE_POLICY_ID, version: "2.0.0" },
      availablePolicies: [PRODUCTION_FINAL_SEQUENCING_TEST_SEARCH_POLICY],
    }).status).toBe("sequencing_search_policy_unavailable");
  });

  it("rejects equal-authority unresolved policy conflict independent of rule array order", () => {
    const first = SESSION_SEQUENCING_POLICY_V1.rules[0];
    const conflict = {
      ...SESSION_SEQUENCING_POLICY_V1,
      rules: [...SESSION_SEQUENCING_POLICY_V1.rules].reverse(),
      conflicts: [{
        conflictId: "policy-conflict",
        leftRuleId: first.ruleId,
        rightRuleId: SESSION_SEQUENCING_POLICY_V1.rules[1].ruleId,
        authority: "equal" as const,
        resolution: "unresolved" as const,
        provenance: { source: "synthetic_contract_fixture" as const, sourceRef: "policy-conflict" },
      }],
    };
    expect(resolveFinalSessionSequencingPolicy({ policy: conflict }).status)
      .toBe("sequencing_policy_conflict");
  });

  it("does not turn an unprescribed setup instruction into zero physical time", () => {
    const duration = buildSequencedSessionDurationInterval({
      prescriptionLowerBoundSeconds: 300,
      prescriptionUpperBoundSeconds: 300,
      prescriptionUnknownComponents: [],
      prescriptionIntervalRefs: ["prescription-revision:fixture"],
      transitionInstructions: [{
        sequencingContract: PRODUCTION_FINAL_SESSION_SEQUENCING_CONTRACT_REFERENCE,
        instructionId: "instruction:unprescribed-setup",
        transitionFactId: "transition:fixture",
        type: "setup",
        target: { kind: "not_prescribed", reasonCode: "SETUP_DURATION_NOT_PRESCRIBED" },
        sourceTransitionFactId: null,
        countedInDurationExactlyOnce: true,
        provenance: [{ source: "synthetic_contract_fixture", sourceRef: "unprescribed-setup" }],
      }],
      availableMinutes: 10,
    });
    expect(duration.knownLowerBoundSeconds).toBe(300);
    expect(duration.knownUpperBoundSeconds).toBeNull();
    expect(duration.status).toBe("unknown_due_to_setup_transition");
    expect(duration.unknownComponents).toContain("setup:SETUP_DURATION_NOT_EXPLICIT");
  });
});
