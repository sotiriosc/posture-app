import { stableId, uniqueSorted } from "../prescription/compiler/utilities";
import type { ControlledProductShadowCounterfactualAttributionClaim,
  ControlledProductShadowCounterfactualValidationResult } from "./contracts";

export const SHADOW_COUNTERFACTUAL_MISATTRIBUTED_AS_PERFORMED =
  "SHADOW_COUNTERFACTUAL_MISATTRIBUTED_AS_PERFORMED" as const;

export function validateControlledProductShadowCounterfactualAttribution(
  claim: ControlledProductShadowCounterfactualAttributionClaim,
): ControlledProductShadowCounterfactualValidationResult {
  const reasons: string[] = [];
  if (claim.shadowProgramId && claim.productPerformanceProgramId === claim.shadowProgramId) {
    reasons.push("PRODUCT_PERFORMANCE_LINKED_TO_SHADOW_PROGRAM");
  }
  if (claim.legacyExerciseLogPrescriptionRevisionId) {
    reasons.push("LEGACY_EXERCISE_LOG_LINKED_TO_SHADOW_PRESCRIPTION");
  }
  if (claim.legacySessionSequenceRevisionId) {
    reasons.push("LEGACY_SESSION_LINKED_TO_SHADOW_SEQUENCE");
  }
  if (claim.shadowSourceEventCompleted) reasons.push("SHADOW_SOURCE_EVENT_MARKED_COMPLETED");
  if (claim.unmappedLegacyToleranceCreditedToShadow) reasons.push("UNMAPPED_LEGACY_TOLERANCE_CREDITED_TO_SHADOW");
  if (claim.productOutcomeAuthorizesShadowAdaptation) reasons.push("PRODUCT_OUTCOME_AUTHORIZES_UNSERVED_SHADOW_ADAPTATION");
  if (claim.outcomeSuperiorityClaimed) reasons.push("COUNTERFACTUAL_OUTCOME_SUPERIORITY_CLAIMED");
  if (reasons.length) reasons.push(SHADOW_COUNTERFACTUAL_MISATTRIBUTED_AS_PERFORMED);
  const reasonCodes = uniqueSorted(reasons);
  return Object.freeze({ valid: reasonCodes.length === 0, reasonCodes: Object.freeze(reasonCodes),
    fingerprint: stableId("controlled-product-shadow-counterfactual-validation", { claim, reasonCodes }),
    shadowPerformanceCreditCount: 0, counterfactualOutcomeAttributionCount: 0 });
}
