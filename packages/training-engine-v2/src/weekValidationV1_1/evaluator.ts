import { POST_PRESCRIPTION_WEEK_VALIDATION_POLICY_V1_1 } from "./policy";
import type { PostPrescriptionPurposeContributionEvent,
  PurposeContributionValidationTrace } from "./contracts";

const DEVELOPMENTAL_PURPOSES = new Set([
  "strength_development", "hypertrophy_development", "direct_development",
  "muscular_endurance_development", "capacity_development",
]);
const UNSUPPORTED_PURPOSES = new Set([
  "systemic_conditioning_development", "power_development", "unknown",
]);

export function evaluatePurposeContributionsV1_1(
  events: readonly PostPrescriptionPurposeContributionEvent[],
): PurposeContributionValidationTrace {
  const reasons: string[] = [];
  const credited = new Set<string>();
  const traceOnly = new Set<string>();
  const blockIds = new Set<string>();
  const doseByEvent = new Map<string, string>();

  for (const event of events) {
    if (!event.sourceExposureEventId.trim() || !event.blockId.trim() || !event.doseFingerprint.trim()) {
      reasons.push("PURPOSE_CONTRIBUTION_IDENTITY_REQUIRED");
    }
    if (blockIds.has(event.blockId)) reasons.push(`MULTIPLE_PRIMARY_LANES_FOR_BLOCK:${event.blockId}`);
    blockIds.add(event.blockId);
    const priorDose = doseByEvent.get(event.sourceExposureEventId);
    if (priorDose && priorDose !== event.doseFingerprint) {
      reasons.push(`DUPLICATE_SOURCE_EVENT_DOSE:${event.sourceExposureEventId}`);
    } else {
      doseByEvent.set(event.sourceExposureEventId, event.doseFingerprint);
    }
    if (event.duplicateDoseCreated) reasons.push(`DUPLICATE_DOSE_CREATED:${event.blockId}`);
    if (event.systemicConditioningClaimed) reasons.push(`SYSTEMIC_CONDITIONING_INFERENCE:${event.blockId}`);
    if (event.completedPerformanceClaimed) reasons.push(`COMPLETED_PERFORMANCE_CLAIM:${event.blockId}`);
    if (event.adaptationClaimed) reasons.push(`ADAPTATION_CLAIM:${event.blockId}`);

    const expectedLane = POST_PRESCRIPTION_WEEK_VALIDATION_POLICY_V1_1.laneByPurpose[event.localPurpose];
    if (event.primaryLane !== expectedLane) reasons.push(`PURPOSE_LANE_MISMATCH:${event.blockId}`);
    if (DEVELOPMENTAL_PURPOSES.has(event.localPurpose) &&
        event.blockPurpose !== "developmental_work" &&
        event.localPurpose !== "movement_quality_development") {
      reasons.push(`DEVELOPMENTAL_BLOCK_PURPOSE_REQUIRED:${event.blockId}`);
    }
    if (event.localPurpose === "movement_quality_development" &&
        event.blockPurpose !== "technique_quality_work") {
      reasons.push(`MOVEMENT_QUALITY_BLOCK_PURPOSE_REQUIRED:${event.blockId}`);
    }

    for (const view of event.objectiveViews) {
      if (!view.creditRequested || view.relationship === "cross_goal_support") {
        traceOnly.add(view.objectiveId);
        continue;
      }
      if (view.localPurpose !== event.localPurpose) {
        reasons.push(`OBJECTIVE_PURPOSE_MISCREDIT:${view.objectiveId}`);
      } else if (UNSUPPORTED_PURPOSES.has(view.localPurpose)) {
        reasons.push(`UNSUPPORTED_OBJECTIVE_SCOPE:${view.objectiveId}`);
      } else {
        credited.add(view.objectiveId);
      }
    }
  }

  const uniqueReasons = [...new Set(reasons)].sort();
  const unsupported = uniqueReasons.some((reason) => reason.startsWith("UNSUPPORTED_OBJECTIVE_SCOPE"));
  return Object.freeze({
    status: uniqueReasons.length === 0 ? "validated_supported_purpose_scope" :
      unsupported ? "unsupported_purpose_scope" : "invalid_purpose_contribution",
    sourceEventCount: doseByEvent.size,
    uniqueDoseCount: doseByEvent.size,
    creditedObjectiveIds: Object.freeze([...credited].sort()),
    traceOnlyObjectiveIds: Object.freeze([...traceOnly].sort()),
    reasonCodes: Object.freeze(uniqueReasons),
    noDoubleCredit: !uniqueReasons.some((reason) => reason.startsWith("DUPLICATE")),
    noSystemicConditioningInference: !uniqueReasons.some((reason) =>
      reason.startsWith("SYSTEMIC_CONDITIONING_INFERENCE")),
    completedPerformanceClaimed: false,
    adaptationClaimed: false,
  });
}
