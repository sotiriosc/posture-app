import { stableId, uniqueSorted } from "../prescription/compiler/utilities";
import type { OutcomeSourceLineageReference } from "../outcomeSources/designContracts";
import {
  SESSION_PRACTICE_OUTCOME_SOURCE_LINK_CONTRACT_REFERENCE,
  type SessionPracticeCompletionDisposition,
  type SessionPracticeCompletionEvidence,
  type SessionPracticeRealizationPlan,
} from "./contracts";

export interface SessionPracticeOutcomeSourceLink {
  readonly contractReference: typeof SESSION_PRACTICE_OUTCOME_SOURCE_LINK_CONTRACT_REFERENCE;
  readonly linkId: string;
  readonly selectedMode: SessionPracticeRealizationPlan["mode"];
  readonly requestId: string;
  readonly attemptId: string;
  readonly realizationRevisionId: string;
  readonly sourceSessionRevisionId: string;
  readonly finalSequencePlanId: string;
  readonly finalSequenceRevisionId: string;
  readonly finalPrescriptionRevisionIds: readonly string[];
  readonly retainedAssignmentIds: readonly string[];
  readonly omittedAssignmentIds: readonly string[];
  readonly performedSourceEventIds: readonly string[];
  readonly skippedOrUnperformedSourceEventIds: readonly string[];
  readonly completedBlockIds: readonly string[];
  readonly completionDispositionId: string;
  readonly completionDisposition: SessionPracticeCompletionDisposition["status"];
  readonly lineageByPerformedSourceEventId: Readonly<Record<string, OutcomeSourceLineageReference>>;
  readonly omittedAssignmentPerformanceCount: 0;
  readonly selectedModeTreatedAsPerformance: false;
  readonly provenance: readonly string[];
}

export function buildSessionPracticeOutcomeSourceLink(input: {
  readonly plan: SessionPracticeRealizationPlan;
  readonly evidence: SessionPracticeCompletionEvidence;
  readonly completion: SessionPracticeCompletionDisposition;
}): SessionPracticeOutcomeSourceLink {
  if (!input.plan.finalSequence) throw new Error("SESSION_PRACTICE_FINAL_SEQUENCE_REQUIRED_FOR_OUTCOME_LINK");
  const retained = input.plan.assignments.filter((entry) => entry.state !== "omitted");
  const omitted = input.plan.assignments.filter((entry) => entry.state === "omitted");
  const omittedEvents = new Set(omitted.map((entry) => entry.sourceExposureEventId));
  if (input.evidence.performedSourceEventIds.some((eventId) => omittedEvents.has(eventId))) {
    throw new Error("SESSION_PRACTICE_OMITTED_ASSIGNMENT_CANNOT_HAVE_PERFORMANCE");
  }
  const stepByEventId = new Map(input.plan.finalSequence.steps.map((step) => [step.sourceExposureEventId, step]));
  const lineageByPerformedSourceEventId = Object.fromEntries(input.evidence.performedSourceEventIds.map((eventId) => {
    const step = stepByEventId.get(eventId);
    if (!step) throw new Error(`SESSION_PRACTICE_PERFORMED_SOURCE_EVENT_UNKNOWN:${eventId}`);
    const lineage: OutcomeSourceLineageReference = Object.freeze({
      sourceExposureEventId: eventId,
      sessionId: input.plan.sourceSessionId,
      opportunityId: null,
      reservationId: null,
      prescriptionId: step.prescriptionId,
      prescriptionRevisionId: step.finalPrescriptionRevisionId,
      sequencePlanId: input.plan.finalSequence!.sequencePlanId,
      sequenceRevisionId: input.plan.finalSequence!.sequenceRevisionId,
      plannedBlockId: null,
      performedBlockId: null,
    });
    return [eventId, lineage];
  }));
  const performed = uniqueSorted(input.evidence.performedSourceEventIds);
  return Object.freeze({
    contractReference: SESSION_PRACTICE_OUTCOME_SOURCE_LINK_CONTRACT_REFERENCE,
    linkId: stableId("session-practice-outcome-source-link", {
      attemptId: input.plan.attemptId,
      realizationRevisionId: input.plan.realizationRevisionId,
      completionDispositionId: input.completion.dispositionId,
    }),
    selectedMode: input.plan.mode,
    requestId: input.plan.requestId,
    attemptId: input.plan.attemptId,
    realizationRevisionId: input.plan.realizationRevisionId,
    sourceSessionRevisionId: input.plan.sourceSessionRevisionId,
    finalSequencePlanId: input.plan.finalSequence.sequencePlanId,
    finalSequenceRevisionId: input.plan.finalSequence.sequenceRevisionId,
    finalPrescriptionRevisionIds: input.plan.finalSequence.finalPrescriptionRevisionIds,
    retainedAssignmentIds: Object.freeze(retained.map((entry) => entry.assignmentId)),
    omittedAssignmentIds: Object.freeze(omitted.map((entry) => entry.assignmentId)),
    performedSourceEventIds: Object.freeze(performed),
    skippedOrUnperformedSourceEventIds: Object.freeze(retained.map((entry) => entry.sourceExposureEventId)
      .filter((eventId) => !performed.includes(eventId))),
    completedBlockIds: Object.freeze(uniqueSorted(input.evidence.completedBlockIds)),
    completionDispositionId: input.completion.dispositionId,
    completionDisposition: input.completion.status,
    lineageByPerformedSourceEventId: Object.freeze(lineageByPerformedSourceEventId),
    omittedAssignmentPerformanceCount: 0,
    selectedModeTreatedAsPerformance: false,
    provenance: Object.freeze([input.plan.policyReference, input.completion.dispositionId,
      "outcome-source:actual-performance-required"]),
  });
}
