import { compilePrescriptionAssignmentV1_3 } from "./compiler";
import {
  PRODUCTION_PRESCRIPTION_COMPILER_V1_3_CONTRACT_REFERENCE,
  type PrescriptionSessionCompilationResultV1_3,
  type PrescriptionSessionCompilerInputV1_3,
} from "./contracts";

export function compileSessionPrescriptionV1_3(
  input: PrescriptionSessionCompilerInputV1_3,
): PrescriptionSessionCompilationResultV1_3 {
  const contractValid = input.compilerContract.contractId ===
      PRODUCTION_PRESCRIPTION_COMPILER_V1_3_CONTRACT_REFERENCE.contractId &&
    input.compilerContract.contractVersion ===
      PRODUCTION_PRESCRIPTION_COMPILER_V1_3_CONTRACT_REFERENCE.contractVersion;
  const sessionValid = input.assignmentInputs.every((entry) =>
    entry.sessionIntent.id === input.sessionIntentId &&
    entry.sessionSkeleton.sessionIntentId === input.sessionIntentId &&
    entry.handoff.sessionIntentId === input.sessionIntentId);
  if (!contractValid || !sessionValid) return Object.freeze({
    compilerContract: PRODUCTION_PRESCRIPTION_COMPILER_V1_3_CONTRACT_REFERENCE,
    status: "invalid_session_handoff", assignmentResults: Object.freeze([]),
    plans: Object.freeze([]), sourceExposureEventIds: Object.freeze([]),
    sourceEventsUnique: true, assignmentCoverageComplete: false,
    fallbackApplied: false, authority: "PRODUCTION_KERNEL_AUTHORITY_NOT_PRODUCT_RUNTIME",
  });
  const assignmentResults = input.assignmentInputs.map(compilePrescriptionAssignmentV1_3);
  const plans = assignmentResults.flatMap((result) => result.plan ? [result.plan] : []);
  const eventIds = plans.map((plan) => plan.sourceExposureEvent.sourceExposureEventId);
  const sourceEventsUnique = new Set(eventIds).size === eventIds.length;
  const completedHandoffIds = new Set(input.assignmentInputs
    .filter((_, index) => assignmentResults[index]?.plan !== null)
    .map((entry) => entry.assignmentHandoffId));
  const assignmentCoverageComplete = input.expectedAssignmentHandoffIds.every((id) =>
    completedHandoffIds.has(id));
  return Object.freeze({
    compilerContract: PRODUCTION_PRESCRIPTION_COMPILER_V1_3_CONTRACT_REFERENCE,
    status: assignmentCoverageComplete && sourceEventsUnique ? "compiled" : "incomplete",
    assignmentResults: Object.freeze(assignmentResults),
    plans: Object.freeze(plans),
    sourceExposureEventIds: Object.freeze(eventIds),
    sourceEventsUnique,
    assignmentCoverageComplete,
    fallbackApplied: false,
    authority: "PRODUCTION_KERNEL_AUTHORITY_NOT_PRODUCT_RUNTIME",
  });
}
