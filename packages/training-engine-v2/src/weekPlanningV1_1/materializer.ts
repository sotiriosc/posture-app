import { PRODUCTION_SESSION_ALLOCATION_MATERIALIZER_V1_1_REFERENCE,
  type MaterializedAllocatedObjectiveV1_1,
  type ProductionReservedSessionObjectiveV1_1 } from "./contracts";

export function materializeSupportedPurposeObjectiveV1_1(
  reservation: ProductionReservedSessionObjectiveV1_1,
): MaterializedAllocatedObjectiveV1_1 {
  return Object.freeze({
    materializerContract: PRODUCTION_SESSION_ALLOCATION_MATERIALIZER_V1_1_REFERENCE,
    allocatedObjectiveId: `week-v1_1:allocated:${reservation.responsibilityId}`,
    responsibilityId: reservation.responsibilityId,
    weeklyObjectiveId: reservation.weeklyObjectiveId,
    opportunityId: reservation.opportunityId,
    localPrescriptionPurpose: reservation.localPrescriptionPurpose,
    purposeAuthority: reservation.purposeAuthority,
    priority: reservation.priority,
    plannerProvenance: Object.freeze({
      objectiveIds: Object.freeze([reservation.weeklyObjectiveId]),
      localPrescriptionPurpose: reservation.localPrescriptionPurpose,
      purposeAuthority: reservation.purposeAuthority,
      transformationRuleId: "WEEK_V1_1_EXACT_PURPOSE_PROPAGATION",
      sourceEvidenceRefs: reservation.sourceEvidenceRefs,
    }),
  });
}
