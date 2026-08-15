import { compilePrescriptionAssignmentV1_2 } from "./compiler";
import { PRODUCTION_PRESCRIPTION_COMPILER_V1_2_CONTRACT_REFERENCE,
  type PrescriptionSessionCompilationResultV1_2,
  type PrescriptionSessionCompilerInputV1_2 } from "./contracts";

export function compileSessionPrescriptionV1_2(
  input: PrescriptionSessionCompilerInputV1_2,
): PrescriptionSessionCompilationResultV1_2 {
  if (input.handoff.sessionIntentId !== input.sessionIntent.id ||
      input.sessionSkeleton.sessionIntentId !== input.sessionIntent.id) {
    return Object.freeze({
      compilerContract: PRODUCTION_PRESCRIPTION_COMPILER_V1_2_CONTRACT_REFERENCE,
      status: "invalid_session_handoff", assignmentResults: [], plans: [],
      sourceExposureEvents: [], sourceEventsUnique: true, assignmentCoverageComplete: false,
      fallbackApplied: false, authority: "PRODUCTION_KERNEL_AUTHORITY_NOT_PRODUCT_RUNTIME",
    });
  }
  const assignmentResults = input.handoff.assignments.map((assignment) =>
    compilePrescriptionAssignmentV1_2({
      ...input,
      assignmentHandoffId: assignment.handoffId,
      context: input.contextByHandoffId[assignment.handoffId],
      continuityEvidence: input.continuityEvidenceByHandoffId[assignment.handoffId] ?? null,
      priorRealizationEvidence: input.priorRealizationEvidenceByHandoffId[assignment.handoffId] ?? null,
      revisionContext: input.revisionContextByHandoffId[assignment.handoffId] ?? null,
      purposeResolutionAttemptId: input.purposeResolutionAttemptIdByHandoffId[assignment.handoffId] ?? "",
    }));
  const plans = assignmentResults.flatMap((entry) => entry.plan ? [entry.plan] : []);
  const eventIds = plans.map((entry) => entry.sourceExposureEvent.sourceExposureEventId);
  const sourceExposureEvents = plans.map((entry) => entry.sourceExposureEvent);
  const sourceEventsUnique = new Set(eventIds).size === eventIds.length;
  const assignmentCoverageComplete = plans.length === input.handoff.assignments.length;
  return Object.freeze({
    compilerContract: PRODUCTION_PRESCRIPTION_COMPILER_V1_2_CONTRACT_REFERENCE,
    status: assignmentCoverageComplete && sourceEventsUnique ? "compiled" : "incomplete",
    assignmentResults: Object.freeze(assignmentResults), plans: Object.freeze(plans),
    sourceExposureEvents: Object.freeze(sourceExposureEvents), sourceEventsUnique,
    assignmentCoverageComplete, fallbackApplied: false,
    authority: "PRODUCTION_KERNEL_AUTHORITY_NOT_PRODUCT_RUNTIME",
  });
}
