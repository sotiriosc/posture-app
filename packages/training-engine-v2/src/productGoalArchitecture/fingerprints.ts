import { createHash } from "node:crypto";
import { PRODUCT_TRAINING_GOAL_ARCHITECTURE_POLICY_V1 } from "./ownerPolicyV1";

function canonicalValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalValue);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(Object.entries(value as Readonly<Record<string, unknown>>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => [key, canonicalValue(entry)]));
  }
  return value;
}

export function canonicalProductGoalArchitectureJson(value: unknown): string {
  return JSON.stringify(canonicalValue(value));
}

export function productGoalArchitectureFingerprint(value: unknown): string {
  return createHash("sha256").update(canonicalProductGoalArchitectureJson(value)).digest("hex");
}

export function buildProductTrainingGoalArchitecturePolicyFingerprints() {
  const policy = PRODUCT_TRAINING_GOAL_ARCHITECTURE_POLICY_V1;
  return Object.freeze({
    ownerPolicyContract: productGoalArchitectureFingerprint(policy),
    productVocabulary: productGoalArchitectureFingerprint(policy.productVocabulary),
    primarySecondaryPolicy: productGoalArchitectureFingerprint(policy.goalPriority),
    programmingContextPolicy: productGoalArchitectureFingerprint(policy.programmingContext),
    trainingModePolicy: productGoalArchitectureFingerprint(policy.trainingMode),
    purposeFirstArchitecture: productGoalArchitectureFingerprint({
      order: policy.prescriptionResolution.purposeFirstOrder,
      role: policy.prescriptionResolution.outcomeGoalRole,
    }),
    failClosedArchitecture: productGoalArchitectureFingerprint({
      behavior: policy.prescriptionResolution.missingPolicyBehavior,
      results: policy.prescriptionResolution.missingPolicyResults,
      strengthFallthroughAllowed: policy.prescriptionResolution.strengthFallthroughAllowed,
    }),
    strengthBoundary: productGoalArchitectureFingerprint(policy.strengthBoundary),
    hypertrophyBoundary: productGoalArchitectureFingerprint(policy.hypertrophyBoundary),
    toningPolicy: productGoalArchitectureFingerprint(policy.toningLanguage),
    bodyCompositionBoundary: productGoalArchitectureFingerprint(policy.bodyComposition),
    nutritionBoundary: productGoalArchitectureFingerprint(policy.nutrition),
    futurePurposeLanes: productGoalArchitectureFingerprint(policy.purposeLanes),
    activationState: productGoalArchitectureFingerprint(policy.activation),
  });
}
