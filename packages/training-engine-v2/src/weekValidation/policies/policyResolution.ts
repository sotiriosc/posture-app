import type {
  PostPrescriptionWeekValidationPolicyReference,
  ProductionPostPrescriptionWeekValidationPolicy,
} from "./contracts";
import type { ProductionPostPrescriptionWeekValidationInput } from "../contracts";

export interface PostPrescriptionWeekValidationPolicyResolution {
  readonly status: "resolved" | "required" | "unavailable" | "conflict";
  readonly policy: ProductionPostPrescriptionWeekValidationPolicy | null;
  readonly reasonCodes: readonly string[];
}

function sameReference(
  left: PostPrescriptionWeekValidationPolicyReference,
  right: PostPrescriptionWeekValidationPolicyReference,
): boolean {
  return left.policyId === right.policyId && left.version === right.version;
}

export function resolvePostPrescriptionWeekValidationPolicy(
  input: Pick<ProductionPostPrescriptionWeekValidationInput, "validationPolicy" | "availableValidationPolicies">,
): PostPrescriptionWeekValidationPolicyResolution {
  if (input.validationPolicy === null) {
    return {
      status: "required",
      policy: null,
      reasonCodes: ["POST_PRESCRIPTION_WEEK_VALIDATION_POLICY_REQUIRED"],
    };
  }
  if ("frequencyRules" in input.validationPolicy) {
    return input.validationPolicy.state === "reviewed_not_activated" &&
      input.validationPolicy.automaticSelection === false &&
      input.validationPolicy.productionActivation === false
      ? {
          status: "resolved",
          policy: input.validationPolicy,
          reasonCodes: [`VALIDATION_POLICY_RESOLVED:${input.validationPolicy.policyId}@${input.validationPolicy.version}`],
        }
      : {
          status: "conflict",
          policy: null,
          reasonCodes: ["POST_PRESCRIPTION_WEEK_VALIDATION_POLICY_CONFLICT"],
        };
  }
  const reference = input.validationPolicy as PostPrescriptionWeekValidationPolicyReference;
  const matches = (input.availableValidationPolicies ?? [])
    .filter((policy) => sameReference(policy, reference));
  if (matches.length === 0) {
    return {
      status: "unavailable",
      policy: null,
      reasonCodes: ["POST_PRESCRIPTION_WEEK_VALIDATION_POLICY_UNAVAILABLE"],
    };
  }
  if (matches.length !== 1) {
    return {
      status: "conflict",
      policy: null,
      reasonCodes: ["POST_PRESCRIPTION_WEEK_VALIDATION_POLICY_CONFLICT"],
    };
  }
  return {
    status: "resolved",
    policy: matches[0],
    reasonCodes: [`VALIDATION_POLICY_RESOLVED_FROM_REGISTRY:${matches[0].policyId}@${matches[0].version}`],
  };
}
