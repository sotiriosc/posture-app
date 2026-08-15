import { compilePrescriptionAssignmentV1_1 } from "./compilePrescriptionAssignmentV1_1";
import { PRODUCTION_PRESCRIPTION_COMPILER_V1_1_CONTRACT_REFERENCE,
  type PrescriptionSessionCompilationResultV1_1,
  type PrescriptionSessionCompilerInputV1_1 } from "./contracts";

export function compileSessionPrescriptionV1_1(
  input: PrescriptionSessionCompilerInputV1_1,
): PrescriptionSessionCompilationResultV1_1 {
  const handoffIds = input.handoff.assignments.map((entry) => entry.handoffId);
  const assignmentIds = input.sessionSkeleton.assignments.map((entry) =>
    entry.routinePrescriptionHandoffId);
  const invalid = input.sessionIntent.id !== input.sessionSkeleton.sessionIntentId ||
    input.sessionIntent.id !== input.handoff.sessionIntentId ||
    new Set(handoffIds).size !== handoffIds.length ||
    new Set(assignmentIds).size !== assignmentIds.length ||
    assignmentIds.some((id) => !handoffIds.includes(id)) ||
    handoffIds.some((id) => !assignmentIds.includes(id));
  const assignmentResults = invalid ? [] : assignmentIds.map((assignmentHandoffId) =>
    compilePrescriptionAssignmentV1_1({
      ...input,
      assignmentHandoffId,
      context: input.contextByHandoffId[assignmentHandoffId],
      continuityEvidence: input.continuityEvidenceByHandoffId[assignmentHandoffId] ?? null,
      priorRealizationEvidence: input.priorRealizationEvidenceByHandoffId[assignmentHandoffId] ?? null,
      revisionContext: input.revisionContextByHandoffId[assignmentHandoffId] ?? null,
      purposeResolutionAttemptId: input.purposeResolutionAttemptIdByHandoffId[assignmentHandoffId] ?? "",
    }));
  const plans = assignmentResults.flatMap((entry) => entry.plan ? [entry.plan] : []);
  const sourceExposureEvents = assignmentResults.flatMap((entry) =>
    entry.sourceExposureEvent ? [entry.sourceExposureEvent] : []);
  const sourceEventsUnique = new Set(sourceExposureEvents.map((entry) =>
    entry.sourceExposureEventId)).size === sourceExposureEvents.length;
  const assignmentCoverageComplete = assignmentResults.length === assignmentIds.length &&
    assignmentResults.every((entry) => entry.handoffAssignment !== null);
  return Object.freeze({
    compilerContract: PRODUCTION_PRESCRIPTION_COMPILER_V1_1_CONTRACT_REFERENCE,
    status: invalid ? "invalid_session_handoff" :
      assignmentResults.every((entry) => entry.status === "compiled") &&
      sourceEventsUnique && assignmentCoverageComplete ? "compiled" : "incomplete",
    assignmentResults,
    plans,
    sourceExposureEvents,
    sourceEventsUnique,
    assignmentCoverageComplete,
    fallbackApplied: false,
    authority: "PRODUCTION_KERNEL_AUTHORITY_NOT_PRODUCT_RUNTIME",
  });
}
