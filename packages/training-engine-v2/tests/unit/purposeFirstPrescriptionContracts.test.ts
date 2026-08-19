import { describe, expect, it } from "vitest";
import {
  PRESCRIPTION_LOCAL_PURPOSES,
  PRESCRIPTION_PURPOSE_AUTHORITIES,
  PRESCRIPTION_PURPOSE_RESOLUTION_STATUSES,
  PRESCRIPTION_PURPOSE_RESOLVER_FAIL_STOP_ORDER,
  PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1,
  PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1_REFERENCE,
  PRODUCTION_PRESCRIPTION_COMPILER_V1_0_DISPOSITION,
  PRODUCTION_PRESCRIPTION_COMPILER_V1_1_CONTRACT_REFERENCE,
  PRODUCTION_PRESCRIPTION_COMPILER_VERSION_COMPATIBILITY,
  PURPOSE_FIRST_PRESCRIPTION_RESOLVER_CONTRACT_REFERENCE,
  resolvePrescriptionPurposeResolverPolicy,
  validateProductionPrescriptionPurposeResolverPolicy,
} from "../../src";

describe("Purpose-first Prescription contracts and owner policy", () => {
  it("publishes the explicit resolver, snapshot policy, and V1.1 compiler lane", () => {
    expect(PURPOSE_FIRST_PRESCRIPTION_RESOLVER_CONTRACT_REFERENCE)
      .toBe("PURPOSE_FIRST_GOAL_SPECIFIC_PRESCRIPTION_RESOLVER@1.0.0");
    expect(PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1_REFERENCE)
      .toBe("PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1_PURPOSE_FIRST_FAIL_CLOSED@1.0.0");
    expect(PRODUCTION_PRESCRIPTION_COMPILER_V1_1_CONTRACT_REFERENCE)
      .toEqual({ contractId: "PRODUCTION_PRESCRIPTION_COMPILER_KERNEL", contractVersion: "1.1.0" });
    expect(PRODUCTION_PRESCRIPTION_COMPILER_V1_0_DISPOSITION)
      .toBe("HISTORICAL_COMPATIBILITY_COMPILER_NOT_PRODUCT_ACTIVATION_AUTHORITY");
    expect(PRODUCTION_PRESCRIPTION_COMPILER_VERSION_COMPATIBILITY).toMatchObject({
      defaultCompilerVersion: null,
      versionCoercionAllowed: false,
      automaticMigrationAllowed: false,
      v1_0: { productShadowPinned: true, futureActivationAuthority: false },
      v1_1: { activated: false, productCallerCount: 0, productShadowCallerCount: 0,
        orchestrationCallerCount: 0 },
    });
  });

  it("closes the vocabulary and validates the G4/G1 policy without numeric ownership", () => {
    expect(PRESCRIPTION_LOCAL_PURPOSES).toHaveLength(13);
    expect(PRESCRIPTION_PURPOSE_AUTHORITIES).toHaveLength(6);
    expect(PRESCRIPTION_PURPOSE_RESOLUTION_STATUSES).toHaveLength(11);
    expect(PRESCRIPTION_PURPOSE_RESOLVER_FAIL_STOP_ORDER).toEqual(
      Array.from({ length: 10 }, (_, index) => expect.stringMatching(`^P${index}_`)));
    expect(validateProductionPrescriptionPurposeResolverPolicy(
      PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1)).toEqual([]);
    expect(PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1).toMatchObject({
      conflictBehavior: "fail_closed",
      missingPurposeBehavior: "fail_closed",
      noBroadFallback: true,
      numericDoseValuesOwned: false,
      activationAuthorized: false,
    });
  });

  it("requires explicit policy or an explicit reference plus caller registry", () => {
    expect(resolvePrescriptionPurposeResolverPolicy({ policy: null }).status).toBe("required");
    expect(resolvePrescriptionPurposeResolverPolicy({
      policy: { policyId: "missing", version: "1.0.0" }, availablePolicies: [],
    }).status).toBe("unavailable");
    expect(resolvePrescriptionPurposeResolverPolicy({
      policy: { policyId: PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1.policyId,
        version: PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1.version },
      availablePolicies: [PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1,
        { ...PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1 }],
    }).status).toBe("conflict");
    expect(resolvePrescriptionPurposeResolverPolicy({
      policy: PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1,
    }).status).toBe("resolved");
  });
});
