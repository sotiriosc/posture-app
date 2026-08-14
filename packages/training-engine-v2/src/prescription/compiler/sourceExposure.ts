import type { SourceExposureEventIdentity } from "../designContracts";
import type { PrescriptionRevisionReference } from "../designContracts";
import type { SessionPrescriptionAssignmentHandoff } from "../../sessionComposer/contracts";
import { productionProvenance, stableId } from "./utilities";

export function buildSourceExposureEventId(input: {
  readonly sessionIntentId: string;
  readonly assignmentHandoffId: string;
  readonly executionAttemptId: string;
}): string {
  return stableId("source-exposure", {
    sessionIntentId: input.sessionIntentId,
    assignmentHandoffId: input.assignmentHandoffId,
    executionAttemptId: input.executionAttemptId,
  });
}

export function buildPrescriptionId(sourceExposureEventId: string): string {
  return stableId("prescription", { sourceExposureEventId });
}

export function buildSourceExposureEvent(input: {
  readonly sessionIntentId: string;
  readonly assignment: SessionPrescriptionAssignmentHandoff;
  readonly executionAttemptId: string;
  readonly revisionRefs?: readonly PrescriptionRevisionReference[];
}): SourceExposureEventIdentity {
  const sourceExposureEventId = buildSourceExposureEventId({
    sessionIntentId: input.sessionIntentId,
    assignmentHandoffId: input.assignment.handoffId,
    executionAttemptId: input.executionAttemptId,
  });
  return {
    sourceExposureEventId,
    sessionIntentId: input.sessionIntentId,
    sessionAssignmentId: input.assignment.handoffId,
    exerciseId: input.assignment.exerciseId,
    originalSelectedExerciseId: input.assignment.exerciseId,
    currentPlannedExerciseId: input.assignment.exerciseId,
    eventStatus: "planned",
    prescriptionRevisionRefs: input.revisionRefs ?? [],
    substitutionRefs: [],
    cancellationSupersessionState: { kind: "none" },
    provenance: productionProvenance(
      `prescription-compiler:source-event:${sourceExposureEventId}`,
      "Identity uses sessionIntentId, assignment handoff ID, and explicit executionAttemptId only.",
    ),
  };
}
