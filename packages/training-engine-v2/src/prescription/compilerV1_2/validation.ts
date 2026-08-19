import { PRESCRIPTION_PURPOSE_CONTRIBUTION_LANES,
  PRODUCTION_PRESCRIPTION_COMPILER_V1_2_CONTRACT_REFERENCE,
  type PrescriptionAssignmentCompilationResultV1_2 } from "./contracts";

export function validatePrescriptionCompilationResultV1_2(
  result: PrescriptionAssignmentCompilationResultV1_2,
): readonly string[] {
  const reasons: string[] = [];
  if (result.compilerContract.contractId !==
      PRODUCTION_PRESCRIPTION_COMPILER_V1_2_CONTRACT_REFERENCE.contractId ||
      result.compilerContract.contractVersion !==
      PRODUCTION_PRESCRIPTION_COMPILER_V1_2_CONTRACT_REFERENCE.contractVersion) {
    reasons.push("PRESCRIPTION_COMPILER_V1_2_CONTRACT_INVALID");
  }
  if (result.fallbackApplied || !result.noFallbackTrace.includes("FALLBACK_APPLIED:false")) {
    reasons.push("PRESCRIPTION_COMPILER_V1_2_FALLBACK_INVALID");
  }
  if (result.status === "compiled" && (!result.plan || !result.selectedUseCase || !result.selectedPurpose)) {
    reasons.push("PRESCRIPTION_COMPILER_V1_2_COMPILED_RESULT_INCOMPLETE");
  }
  if (result.plan) {
    if (result.plan.purposeContributions.length !== result.plan.doseBlocks.length ||
        result.plan.purposeContributions.some((entry) =>
          !PRESCRIPTION_PURPOSE_CONTRIBUTION_LANES.includes(entry.primaryLane))) {
      reasons.push("PRESCRIPTION_COMPILER_V1_2_CONTRIBUTION_INVALID");
    }
    if (new Set(result.plan.purposeContributions.map((entry) => entry.blockId)).size !==
        result.plan.purposeContributions.length) reasons.push("PRESCRIPTION_COMPILER_V1_2_CONTRIBUTION_DUPLICATE");
  }
  return Object.freeze([...new Set(reasons)].sort());
}
