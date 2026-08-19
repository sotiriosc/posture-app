import {
  SESSION_PRACTICE_OBSERVABILITY_CONTRACT_REFERENCE,
  stableId,
  type SessionPracticeCompletionDisposition,
  type SessionPracticeModeV2,
  type SessionPracticeOptionAvailability,
  type SessionPracticeRealizationPlan,
} from "@praxis/training-engine-v2";

export interface SessionPracticeObservabilityEvent {
  readonly contractReference: typeof SESSION_PRACTICE_OBSERVABILITY_CONTRACT_REFERENCE;
  readonly eventId: string;
  readonly eventType:
    | "options_evaluated"
    | "mode_selected"
    | "execution_locked"
    | "completion_disposed"
    | "persistence_replayed";
  readonly attemptId: string;
  readonly optionsEvaluated: readonly SessionPracticeModeV2[];
  readonly availabilityStates: Readonly<Record<SessionPracticeModeV2, SessionPracticeOptionAvailability["state"]>> | null;
  readonly selectedMode: SessionPracticeModeV2 | null;
  readonly suggestedMode: SessionPracticeModeV2 | null;
  readonly recommendationMatchedSelection: boolean | null;
  readonly sourceSessionFingerprint: string;
  readonly materialAssignmentOmissionCount: number;
  readonly doseRevisionCount: number;
  readonly recoveryEligibleAssignmentCount: number;
  readonly failClosedReasonCodes: readonly string[];
  readonly executionLockEvent: boolean;
  readonly completionDisposition: SessionPracticeCompletionDisposition["status"] | null;
  readonly remainingResponsibilityCount: number;
  readonly persistenceReplayStatus: string | null;
  readonly productOutputApplied: false;
  readonly productApplicationState: "NOT_ACTIVATED";
  readonly occurredAt: string;
}

export function buildSessionPracticeObservabilityEvent(input: {
  readonly eventType: SessionPracticeObservabilityEvent["eventType"];
  readonly plan: SessionPracticeRealizationPlan;
  readonly sourceSessionFingerprint: string;
  readonly optionsEvaluated: readonly SessionPracticeModeV2[];
  readonly availabilityStates: SessionPracticeObservabilityEvent["availabilityStates"];
  readonly suggestedMode: SessionPracticeModeV2 | null;
  readonly executionLockEvent: boolean;
  readonly completion: SessionPracticeCompletionDisposition | null;
  readonly persistenceReplayStatus: string | null;
  readonly occurredAt: string;
}): SessionPracticeObservabilityEvent {
  return Object.freeze({
    contractReference: SESSION_PRACTICE_OBSERVABILITY_CONTRACT_REFERENCE,
    eventId: stableId("session-practice-observability", {
      eventType: input.eventType,
      attemptId: input.plan.attemptId,
      realizationRevisionId: input.plan.realizationRevisionId,
      occurredAt: input.occurredAt,
    }),
    eventType: input.eventType,
    attemptId: input.plan.attemptId,
    optionsEvaluated: Object.freeze([...input.optionsEvaluated]),
    availabilityStates: input.availabilityStates,
    selectedMode: input.plan.mode,
    suggestedMode: input.suggestedMode,
    recommendationMatchedSelection: input.suggestedMode === null ? null : input.suggestedMode === input.plan.mode,
    sourceSessionFingerprint: input.sourceSessionFingerprint,
    materialAssignmentOmissionCount: input.plan.burdenDifference.materiality.assignmentOmissionCount,
    doseRevisionCount: input.plan.prescriptionRevisions.length,
    recoveryEligibleAssignmentCount: input.plan.assignments.filter((entry) =>
      entry.recoveryContributionLane !== null).length,
    failClosedReasonCodes: input.plan.status === "realized" ? Object.freeze([]) : input.plan.unresolvedRequirements,
    executionLockEvent: input.executionLockEvent,
    completionDisposition: input.completion?.status ?? null,
    remainingResponsibilityCount: input.completion?.unfulfilledResponsibilityIds.length ?? 0,
    persistenceReplayStatus: input.persistenceReplayStatus,
    productOutputApplied: false,
    productApplicationState: "NOT_ACTIVATED",
    occurredAt: input.occurredAt,
  });
}

const PROHIBITED_OBSERVABILITY_KEYS = Object.freeze([
  "cue", "notes", "medical", "diagnosis", "freeText", "photo", "hiddenProductData",
]);

export function validateSessionPracticeObservabilityEvent(
  event: SessionPracticeObservabilityEvent,
): readonly string[] {
  const serialized = JSON.stringify(event);
  return Object.freeze(PROHIBITED_OBSERVABILITY_KEYS.filter((key) =>
    new RegExp(`\\"${key}\\"`, "i").test(serialized)).map((key) =>
    `SESSION_PRACTICE_OBSERVABILITY_FIELD_PROHIBITED:${key}`));
}
