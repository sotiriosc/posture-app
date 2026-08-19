import { stableId } from "../prescription/compiler/utilities";
import {
  SESSION_PRACTICE_LONGITUDINAL_OBSERVATION_CONTRACT_REFERENCE,
  SESSION_PRACTICE_REMAINING_WEEK_HANDOFF_CONTRACT_REFERENCE,
  type SessionPracticeCompletionDisposition,
  type SessionPracticeRealizationPlan,
  type SessionPracticeSourceSnapshot,
} from "./contracts";
import type { SessionPracticeOutcomeSourceLink } from "./outcomeLink";

export interface SessionPracticeLongitudinalObservation {
  readonly contractReference: typeof SESSION_PRACTICE_LONGITUDINAL_OBSERVATION_CONTRACT_REFERENCE;
  readonly observationId: string;
  readonly athleteId: string;
  readonly mode: SessionPracticeRealizationPlan["mode"];
  readonly completionDisposition: SessionPracticeCompletionDisposition["status"];
  readonly completedEvidencePresent: boolean;
  readonly actualRealizedSourceEventIds: readonly string[];
  readonly omittedResponsibilityIds: readonly string[];
  readonly observationOnly: true;
  readonly automaticProgressionApplied: false;
  readonly automaticRegressionApplied: false;
  readonly automaticDeloadApplied: false;
  readonly automaticReplacementApplied: false;
  readonly repeatedCompletedEvidenceRequiredForAction: true;
  readonly reasonCodes: readonly string[];
}

export function buildSessionPracticeLongitudinalObservation(input: {
  readonly source: SessionPracticeSourceSnapshot;
  readonly plan: SessionPracticeRealizationPlan;
  readonly completion: SessionPracticeCompletionDisposition;
  readonly outcomeLink: SessionPracticeOutcomeSourceLink | null;
}): SessionPracticeLongitudinalObservation {
  const completedEvidencePresent = input.outcomeLink !== null &&
    input.completion.creditedSourceEventIds.length > 0 &&
    !["completion_conflict", "completion_evidence_incomplete", "practice_attempt_not_completed"]
      .includes(input.completion.status);
  return Object.freeze({
    contractReference: SESSION_PRACTICE_LONGITUDINAL_OBSERVATION_CONTRACT_REFERENCE,
    observationId: stableId("session-practice-longitudinal-observation", {
      athleteId: input.source.intent.athleteId,
      attemptId: input.plan.attemptId,
      completionDispositionId: input.completion.dispositionId,
    }),
    athleteId: input.source.intent.athleteId,
    mode: input.plan.mode,
    completionDisposition: input.completion.status,
    completedEvidencePresent,
    actualRealizedSourceEventIds: Object.freeze([...(input.outcomeLink?.performedSourceEventIds ?? [])]),
    omittedResponsibilityIds: input.completion.unfulfilledResponsibilityIds,
    observationOnly: true,
    automaticProgressionApplied: false,
    automaticRegressionApplied: false,
    automaticDeloadApplied: false,
    automaticReplacementApplied: false,
    repeatedCompletedEvidenceRequiredForAction: true,
    reasonCodes: Object.freeze(completedEvidencePresent ?
      ["COMPLETED_SESSION_PRACTICE_EVIDENCE_AVAILABLE_FOR_OBSERVATION_ONLY"] :
      ["MODE_SELECTION_WITHOUT_COMPLETED_EVIDENCE_HAS_NO_LONGITUDINAL_AUTHORITY"]),
  });
}

export interface SessionPracticeRemainingWeekHandoff {
  readonly contractReference: typeof SESSION_PRACTICE_REMAINING_WEEK_HANDOFF_CONTRACT_REFERENCE;
  readonly handoffId: string;
  readonly sourceWeekPlanId: string;
  readonly sourceWeekPlanRevisionId: string;
  readonly sourceReservationId: string;
  readonly sourceReservationRevisionId: string;
  readonly completedHistoryPreserved: true;
  readonly completedSourceEventIds: readonly string[];
  readonly unfulfilledResponsibilityIds: readonly string[];
  readonly requestedAction: "remaining_week_reallocation_review" | "no_review_required";
  readonly newOpportunityAdded: false;
  readonly completedWorkMoved: false;
  readonly originalReservationOverwritten: false;
  readonly automaticReallocationApplied: false;
  readonly automaticDoublingApplied: false;
  readonly recoverySpacingInferred: false;
  readonly applicationOwnerRequired: true;
}

export function buildSessionPracticeRemainingWeekHandoff(input: {
  readonly source: SessionPracticeSourceSnapshot;
  readonly completion: SessionPracticeCompletionDisposition;
}): SessionPracticeRemainingWeekHandoff {
  const reviewRequired = input.completion.unfulfilledResponsibilityIds.length > 0;
  return Object.freeze({
    contractReference: SESSION_PRACTICE_REMAINING_WEEK_HANDOFF_CONTRACT_REFERENCE,
    handoffId: stableId("session-practice-remaining-week-handoff", {
      weekPlanRevisionId: input.source.week.weekPlanRevisionId,
      reservationRevisionId: input.source.week.reservationRevisionId,
      dispositionId: input.completion.dispositionId,
    }),
    sourceWeekPlanId: input.source.week.weekPlanId,
    sourceWeekPlanRevisionId: input.source.week.weekPlanRevisionId,
    sourceReservationId: input.source.week.reservationId,
    sourceReservationRevisionId: input.source.week.reservationRevisionId,
    completedHistoryPreserved: true,
    completedSourceEventIds: input.completion.creditedSourceEventIds,
    unfulfilledResponsibilityIds: input.completion.unfulfilledResponsibilityIds,
    requestedAction: reviewRequired ? "remaining_week_reallocation_review" : "no_review_required",
    newOpportunityAdded: false,
    completedWorkMoved: false,
    originalReservationOverwritten: false,
    automaticReallocationApplied: false,
    automaticDoublingApplied: false,
    recoverySpacingInferred: false,
    applicationOwnerRequired: true,
  });
}
