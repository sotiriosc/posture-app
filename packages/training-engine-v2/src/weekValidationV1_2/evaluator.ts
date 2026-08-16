import type { PostPrescriptionRealizationContextEvent,
  RealizationContextValidationTrace } from "./contracts";

export function evaluateRealizationContextEventsV1_2(
  events: readonly PostPrescriptionRealizationContextEvent[],
): RealizationContextValidationTrace {
  const reasons: string[] = [];
  const eventIds = new Set<string>();
  let duplicateSourceEventCount = 0;
  let rampBlockCount = 0;
  let reviewRequired = false;
  for (const event of events) {
    if (!event.sourceExposureEventId.trim() || !event.exerciseId.trim() ||
        !event.prescriptionRevisionId.trim()) reasons.push("REALIZATION_EVENT_IDENTITY_REQUIRED");
    if (eventIds.has(event.sourceExposureEventId)) duplicateSourceEventCount += 1;
    eventIds.add(event.sourceExposureEventId);
    if (event.rampUpBlocks.length > 4) reasons.push("RAMP_BLOCK_LIMIT_EXCEEDED");
    rampBlockCount += event.rampUpBlocks.length;
    if (event.rampUpBlocks.some((block) =>
      block.sourceExposureEventId !== event.sourceExposureEventId)) {
      reasons.push("RAMP_SOURCE_EVENT_LINEAGE_INVALID");
    }
    if (event.rampUpBlocks.some((block) => block.developmentalCredit)) {
      reasons.push("RAMP_DEVELOPMENTAL_CREDIT_FORBIDDEN");
    }
    if (event.preparatoryDevelopmentalCreditCount !== 0) reasons.push("PREPARATORY_CREDIT_FORBIDDEN");
    if (event.intensityTechniqueFlattenedCount !== 0) reasons.push("INTENSITY_TECHNIQUE_FLATTENING_FORBIDDEN");
    if (event.advancedIntensityTechniqueRequestCount > 0) reviewRequired = true;
    if (event.completedPerformanceClaimed) reasons.push("COMPLETED_PERFORMANCE_CLAIM_FORBIDDEN");
    if (event.adaptationClaimed) reasons.push("ADAPTATION_CLAIM_FORBIDDEN");
    if (event.systemicConditioningClaimed) reasons.push("SYSTEMIC_CONDITIONING_CLAIM_FORBIDDEN");
    if (event.fractionalCoefficient !== null) reasons.push("FRACTIONAL_COEFFICIENT_FORBIDDEN");
    if (event.timeBudgetState !== "within_budget" || event.habitualExposureComparison.reviewRequired) {
      reviewRequired = true;
    }
  }
  const uniqueReasons = [...new Set(reasons)].sort();
  return Object.freeze({
    status: uniqueReasons.length > 0 ? "invalid_context_realization" :
      reviewRequired ? "validated_with_context_review_required" :
        "validated_context_realization_scope",
    sourceEventCount: eventIds.size,
    rampBlockCount,
    preparatoryDevelopmentalCreditCount: 0,
    duplicateSourceEventCount,
    intensityTechniqueFlatteningCount: 0,
    completedPerformanceClaimed: false,
    adaptationClaimed: false,
    automaticProgressionApplied: false,
    reasonCodes: Object.freeze(uniqueReasons),
  });
}
