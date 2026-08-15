import { PRODUCTION_PRESCRIPTION_COMPILER_V1_1_CONTRACT_REFERENCE,
  type PrescriptionAssignmentCompilationResultV1_1,
  type PrescriptionAssignmentCompilerInputV1_1 } from "./contracts";

export function validatePrescriptionCompilerInputV1_1(
  input: PrescriptionAssignmentCompilerInputV1_1,
): readonly string[] {
  const reasons: string[] = [];
  if (input.compilerContract.contractId !== PRODUCTION_PRESCRIPTION_COMPILER_V1_1_CONTRACT_REFERENCE.contractId ||
      input.compilerContract.contractVersion !== PRODUCTION_PRESCRIPTION_COMPILER_V1_1_CONTRACT_REFERENCE.contractVersion) {
    reasons.push("V1_1_COMPILER_CONTRACT_REQUIRED");
  }
  if (!input.purposeEvidenceSnapshot || !input.purposeResolutionAttemptId) {
    reasons.push("V1_1_EXPLICIT_PURPOSE_EVIDENCE_REQUIRED");
  }
  if (!input.purposeResolverPolicy) reasons.push("V1_1_EXPLICIT_PURPOSE_RESOLVER_POLICY_REQUIRED");
  return Object.freeze(reasons.sort());
}

export function validatePrescriptionCompilerResultV1_1(
  result: PrescriptionAssignmentCompilationResultV1_1,
): readonly string[] {
  const reasons: string[] = [];
  if (result.fallbackApplied || !result.noFallbackTrace.includes("FALLBACK_APPLIED:false")) {
    reasons.push("V1_1_NO_FALLBACK_TRACE_REQUIRED");
  }
  if (result.status === "compiled" && (!result.plan || !result.purposeResolution ||
      result.purposeResolution.status !== "purpose_resolved" || !result.selectedPurpose ||
      !result.selectedUseCase)) reasons.push("V1_1_COMPILED_RESULT_PURPOSE_TRACE_REQUIRED");
  if (result.status !== "compiled" && result.plan) reasons.push("V1_1_FAIL_CLOSED_RESULT_MUST_NOT_BUILD_PLAN");
  if (result.plan?.compilerContract.contractVersion !== "1.1.0") reasons.push("V1_1_PLAN_CONTRACT_INVALID");
  return Object.freeze(reasons.sort());
}
