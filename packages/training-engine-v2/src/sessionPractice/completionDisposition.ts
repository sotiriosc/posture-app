import { stableId, uniqueSorted } from "../prescription/compiler/utilities";
import {
  SESSION_PRACTICE_COMPLETION_DISPOSITION_CONTRACT_REFERENCE,
  type SessionPracticeCompletionDisposition,
  type SessionPracticeCompletionDispositionStatus,
  type SessionPracticeCompletionEvidence,
  type SessionPracticeRealizationPlan,
  type SessionPracticeSourceSnapshot,
} from "./contracts";
import type { SessionPracticeGate13ReceiverResult } from "./gate13Receiver";

export function deriveSessionPracticeCompletionDisposition(input: {
  readonly source: SessionPracticeSourceSnapshot;
  readonly plan: SessionPracticeRealizationPlan;
  readonly gate13: SessionPracticeGate13ReceiverResult;
  readonly evidence: SessionPracticeCompletionEvidence;
}): SessionPracticeCompletionDisposition {
  const retainedEvents = new Set(input.plan.assignments.filter((entry) => entry.state !== "omitted")
    .map((entry) => entry.sourceExposureEventId));
  const omittedEvents = new Set(input.plan.assignments.filter((entry) => entry.state === "omitted")
    .map((entry) => entry.sourceExposureEventId));
  const omittedPerformance = input.evidence.performedSourceEventIds.filter((eventId) => omittedEvents.has(eventId));
  const unknownPerformance = input.evidence.performedSourceEventIds.filter((eventId) =>
    !retainedEvents.has(eventId) && !omittedEvents.has(eventId));
  const credited = uniqueSorted(input.evidence.performedSourceEventIds.filter((eventId) => retainedEvents.has(eventId)));
  const allRetainedPerformed = retainedEvents.size > 0 && [...retainedEvents].every((eventId) => credited.includes(eventId));
  let status: SessionPracticeCompletionDispositionStatus;
  const reasons: string[] = [];
  if (input.evidence.conflictingEvidence || omittedPerformance.length || unknownPerformance.length ||
      input.evidence.realizationRevisionId !== input.plan.realizationRevisionId) {
    status = "completion_conflict";
    reasons.push("SESSION_PRACTICE_COMPLETION_LINEAGE_CONFLICT");
  } else if (!input.evidence.evidenceComplete || input.gate13.status === "failed_realized_plan") {
    status = "completion_evidence_incomplete";
    reasons.push("SESSION_PRACTICE_COMPLETION_EVIDENCE_INCOMPLETE");
  } else if (input.evidence.abandoned) {
    status = "practice_attempt_abandoned";
    reasons.push("SESSION_PRACTICE_ATTEMPT_ABANDONED");
  } else if (credited.length === 0) {
    status = "practice_attempt_not_completed";
    reasons.push("NO_REALIZED_SOURCE_EVENT_PERFORMED");
  } else if (!allRetainedPerformed || input.evidence.partiallyCompletedBlockIds.length > 0) {
    status = "practice_attempt_partially_completed";
    reasons.push("REALIZED_SESSION_PARTIALLY_COMPLETED");
  } else if (input.plan.mode === "full") {
    status = "full_completed_as_prescribed";
    reasons.push("FULL_REALIZED_EVENTS_COMPLETED");
  } else if (input.plan.mode === "lighter" && input.gate13.requiredResponsibilitySatisfied) {
    status = "lighter_completed_required_responsibilities_satisfied";
    reasons.push("LIGHTER_REQUIRED_RESPONSIBILITIES_SATISFIED");
  } else if (input.plan.mode === "lighter") {
    status = "lighter_completed_partial_responsibility";
    reasons.push("LIGHTER_COMPLETED_WITH_OPEN_RESPONSIBILITY");
  } else {
    status = "recovery_support_completed_original_responsibility_unfulfilled";
    reasons.push("RECOVERY_SUPPORT_COMPLETED_WITHOUT_DEVELOPMENTAL_CREDIT");
  }
  const unfulfilled = status === "full_completed_as_prescribed" ||
    status === "lighter_completed_required_responsibilities_satisfied" ? [] :
    input.source.week.requiredResponsibilityIds;
  return Object.freeze({
    contractReference: SESSION_PRACTICE_COMPLETION_DISPOSITION_CONTRACT_REFERENCE,
    dispositionId: stableId("session-practice-completion-disposition", {
      attemptId: input.evidence.attemptId,
      realizationRevisionId: input.evidence.realizationRevisionId,
      status,
      credited,
      completedAt: input.evidence.completedAt,
    }),
    attemptId: input.evidence.attemptId,
    realizationRevisionId: input.evidence.realizationRevisionId,
    status,
    creditedSourceEventIds: Object.freeze(credited),
    unfulfilledResponsibilityIds: Object.freeze([...unfulfilled]),
    weekReviewRequired: unfulfilled.length > 0,
    automaticReallocationApplied: false,
    automaticDoublingApplied: false,
    adaptationActionApplied: false,
    reasonCodes: Object.freeze(reasons),
  });
}
