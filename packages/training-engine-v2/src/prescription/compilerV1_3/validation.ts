import { validatePrescriptionRampUpResult } from "../../realizationContext";
import { PRODUCTION_PRESCRIPTION_COMPILER_V1_3_CONTRACT_REFERENCE,
  type PrescriptionAssignmentCompilationResultV1_3 } from "./contracts";

export function validatePrescriptionCompilationResultV1_3(
  result: PrescriptionAssignmentCompilationResultV1_3,
): readonly string[] {
  const reasons: string[] = [];
  if (result.compilerContract.contractId !==
      PRODUCTION_PRESCRIPTION_COMPILER_V1_3_CONTRACT_REFERENCE.contractId ||
      result.compilerContract.contractVersion !==
      PRODUCTION_PRESCRIPTION_COMPILER_V1_3_CONTRACT_REFERENCE.contractVersion) {
    reasons.push("COMPILER_V1_3_CONTRACT_INVALID");
  }
  if (result.fallbackApplied) reasons.push("COMPILER_V1_3_FALLBACK_FORBIDDEN");
  if (result.progressionApplied) reasons.push("COMPILER_V1_3_PROGRESSION_FORBIDDEN");
  if (result.plan) {
    if (result.plan.progressionApplied) reasons.push("PLAN_PROGRESSION_FORBIDDEN");
    if (result.plan.volumeAdded) reasons.push("PLAN_VOLUME_ADDITION_FORBIDDEN");
    if (result.plan.exerciseIdentitySelected) reasons.push("PLAN_EXERCISE_SELECTION_FORBIDDEN");
    reasons.push(...validatePrescriptionRampUpResult(result.plan.rampUp));
    if (result.plan.rampUp.blocks.some((block) =>
      block.sourceExposureEventId !== result.plan!.sourceExposureEvent.sourceExposureEventId)) {
      reasons.push("RAMP_SOURCE_EVENT_LINEAGE_INVALID");
    }
  }
  return Object.freeze([...new Set(reasons)].sort());
}
