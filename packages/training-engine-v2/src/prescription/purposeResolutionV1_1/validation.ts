import { PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1 } from "../purposeResolution";
import type { ProductionPrescriptionPurposeResolverPolicyV1_1 } from "./contracts";

export function validatePrescriptionPurposeResolverPolicyV1_1(
  policy: ProductionPrescriptionPurposeResolverPolicyV1_1,
): readonly string[] {
  const reasons: string[] = [];
  if (policy.reference.policyId !== "PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1_SUPPORTED_CORE" ||
      policy.reference.version !== "1.1.0" || policy.activationAuthorized ||
      !policy.noBroadFallback || policy.goalCreatesPurpose) {
    reasons.push("PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1_1_BOUNDARY_INVALID");
  }
  if (policy.inheritedMappings.length !== PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1.supportedMappings.length ||
      policy.inheritedMappings.some((entry, index) =>
        entry !== PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1.supportedMappings[index])) {
    reasons.push("PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1_CHANGED");
  }
  if (policy.addedMappings.length !== 3 ||
      policy.addedMappings.some((entry) => entry.doseModes.some((mode) => mode !== "repetition_sets"))) {
    reasons.push("PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1_1_MAPPING_INVALID");
  }
  if (policy.supportedMappings.some((entry) =>
    entry.localPurpose === "power_development" ||
    entry.localPurpose === "systemic_conditioning_development")) {
    reasons.push("PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1_1_DEFERRED_PURPOSE_ADMITTED");
  }
  return Object.freeze([...new Set(reasons)].sort());
}
