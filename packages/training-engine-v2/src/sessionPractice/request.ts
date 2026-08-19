import { explicitIsoTime, stableId, uniqueSorted } from "../prescription/compiler/utilities";
import {
  SESSION_PRACTICE_MODES,
  SESSION_PRACTICE_REQUEST_CONTRACT_REFERENCE,
  type SessionPracticeAttemptLifecycle,
  type SessionPracticeExecutionStartEvent,
  type SessionPracticeModeV2,
  type SessionPracticeRecommendation,
  type SessionPracticeRequest,
  type SessionPracticeSourceSnapshot,
} from "./contracts";

export function deriveSessionPracticeAttemptId(input: {
  readonly athleteId: string;
  readonly sourceSessionId: string;
  readonly sourceSessionRevisionId: string;
  readonly opportunityId: string;
  readonly reservationId: string;
  readonly attemptOrdinal: number;
}): string {
  return stableId("session-practice-attempt", input);
}

export function deriveSessionPracticeRequestId(input: {
  readonly attemptId: string;
  readonly sourceSessionRevisionId: string;
  readonly mode: SessionPracticeModeV2;
  readonly selectedAt: string;
}): string {
  return stableId("session-practice-request", input);
}

export function deriveSessionPracticeRealizationRevisionId(input: {
  readonly attemptId: string;
  readonly requestId: string;
  readonly sourceSessionRevisionId: string;
  readonly mode: SessionPracticeModeV2;
  readonly basedOnRevisionId: string | null;
}): string {
  return stableId("session-practice-realization-revision", input);
}

export function buildSessionPracticeRequest(input: {
  readonly source: SessionPracticeSourceSnapshot;
  readonly athleteId: string;
  readonly attemptId: string;
  readonly mode: SessionPracticeModeV2;
  readonly requestSource: SessionPracticeRequest["source"];
  readonly recommendationReference: string | null;
  readonly selectedAt: string;
  readonly evaluationTime: string;
  readonly trainingSafetyReference: string;
  readonly actualAvailableMinutes: number | null;
  readonly provenance: readonly string[];
  readonly state: SessionPracticeRequest["state"];
}): SessionPracticeRequest {
  return Object.freeze({
    contractReference: SESSION_PRACTICE_REQUEST_CONTRACT_REFERENCE,
    requestId: deriveSessionPracticeRequestId({
      attemptId: input.attemptId,
      sourceSessionRevisionId: input.source.sourceSessionRevisionId,
      mode: input.mode,
      selectedAt: input.selectedAt,
    }),
    attemptId: input.attemptId,
    athleteId: input.athleteId,
    sourceProgramId: input.source.week.programId,
    sourceProgramRevisionId: input.source.week.programRevisionId,
    sourceWeekPlanId: input.source.week.weekPlanId,
    sourceWeekPlanRevisionId: input.source.week.weekPlanRevisionId,
    sourceReservationId: input.source.week.reservationId,
    sourceReservationRevisionId: input.source.week.reservationRevisionId,
    sourceSessionIntentId: input.source.intent.id,
    sourceSessionSkeletonId: input.source.skeleton.sessionIntentId,
    sourceSessionSkeletonFingerprint: input.source.sourceSessionFingerprint,
    sourceFinalPrescribedSessionId: input.source.finalPrescribedSessionId,
    sourceFinalPrescribedSessionRevisionId: input.source.finalPrescribedSessionRevisionId,
    requestedMode: input.mode,
    source: input.requestSource,
    recommendationReference: input.recommendationReference,
    selectedAt: input.selectedAt,
    evaluationTime: input.evaluationTime,
    currentEquipmentReference: input.source.currentEquipmentReference,
    trainingSafetyReference: input.trainingSafetyReference,
    actualAvailableMinutes: input.actualAvailableMinutes,
    provenance: Object.freeze([...input.provenance]),
    state: input.state,
  });
}

export function validateSessionPracticeRecommendation(
  recommendation: SessionPracticeRecommendation,
): readonly string[] {
  const reasons: string[] = [];
  if (!recommendation.recommendationId.trim()) reasons.push("SESSION_PRACTICE_RECOMMENDATION_ID_REQUIRED");
  if (!SESSION_PRACTICE_MODES.includes(recommendation.suggestedMode)) {
    reasons.push("SESSION_PRACTICE_RECOMMENDATION_MODE_INVALID");
  }
  if (recommendation.authority !== "SUGGESTION_ONLY" || recommendation.automaticSelection !== false) {
    reasons.push("SESSION_PRACTICE_RECOMMENDATION_MUST_NOT_SELECT");
  }
  if (!explicitIsoTime(recommendation.issuedAt) ||
      recommendation.expiresAt !== null && !explicitIsoTime(recommendation.expiresAt)) {
    reasons.push("SESSION_PRACTICE_RECOMMENDATION_TIME_INVALID");
  }
  return Object.freeze(uniqueSorted(reasons));
}

export function validateSessionPracticeRequest(request: SessionPracticeRequest): readonly string[] {
  const reasons: string[] = [];
  if (request.contractReference.contractId !== SESSION_PRACTICE_REQUEST_CONTRACT_REFERENCE.contractId ||
      request.contractReference.contractVersion !== SESSION_PRACTICE_REQUEST_CONTRACT_REFERENCE.contractVersion) {
    reasons.push("UNSUPPORTED_SESSION_PRACTICE_REQUEST_VERSION");
  }
  if (!SESSION_PRACTICE_MODES.includes(request.requestedMode)) reasons.push("SESSION_PRACTICE_MODE_INVALID");
  const required = [request.requestId, request.attemptId, request.athleteId, request.sourceProgramId,
    request.sourceProgramRevisionId, request.sourceWeekPlanId, request.sourceWeekPlanRevisionId,
    request.sourceReservationId, request.sourceReservationRevisionId, request.sourceSessionIntentId,
    request.sourceSessionSkeletonId, request.sourceSessionSkeletonFingerprint,
    request.sourceFinalPrescribedSessionId, request.sourceFinalPrescribedSessionRevisionId,
    request.currentEquipmentReference, request.trainingSafetyReference];
  if (required.some((value) => !value.trim())) reasons.push("SESSION_PRACTICE_REQUEST_FIELD_REQUIRED");
  if (!explicitIsoTime(request.selectedAt) || !explicitIsoTime(request.evaluationTime) ||
      Date.parse(request.selectedAt) > Date.parse(request.evaluationTime)) {
    reasons.push("SESSION_PRACTICE_REQUEST_TIME_INVALID");
  }
  if (request.actualAvailableMinutes !== null &&
      (!Number.isFinite(request.actualAvailableMinutes) || request.actualAvailableMinutes <= 0)) {
    reasons.push("SESSION_PRACTICE_ACTUAL_AVAILABLE_MINUTES_INVALID");
  }
  if (request.source === "structured_recommendation_confirmed_by_athlete" &&
      request.recommendationReference === null) {
    reasons.push("SESSION_PRACTICE_RECOMMENDATION_REFERENCE_REQUIRED");
  }
  return Object.freeze(uniqueSorted(reasons));
}

export function createSessionPracticeAttemptLifecycle(input: {
  readonly attemptId: string;
  readonly sourceSessionRevisionId: string;
}): SessionPracticeAttemptLifecycle {
  return Object.freeze({
    attemptId: input.attemptId,
    sourceSessionRevisionId: input.sourceSessionRevisionId,
    state: "no_selection",
    selectedMode: null,
    realizationRevisionIds: Object.freeze([]),
    finalForExecutionRevisionId: null,
    executionStartEvent: null,
    executionStartedAt: null,
    abandonedAt: null,
    supersededByAttemptId: null,
  });
}

export interface SelectSessionPracticeModeResult {
  readonly status: "selected" | "locked" | "terminal";
  readonly lifecycle: SessionPracticeAttemptLifecycle;
  readonly realizationRevisionId: string | null;
  readonly reasonCodes: readonly string[];
}

export function selectSessionPracticeMode(input: {
  readonly lifecycle: SessionPracticeAttemptLifecycle;
  readonly request: SessionPracticeRequest;
  readonly basedOnRevisionId: string | null;
  readonly finalForExecution: boolean;
}): SelectSessionPracticeModeResult {
  if (["execution_started", "completed"].includes(input.lifecycle.state)) {
    return Object.freeze({ status: "locked", lifecycle: input.lifecycle, realizationRevisionId: null,
      reasonCodes: Object.freeze(["SESSION_PRACTICE_MODE_LOCKED_AFTER_EXECUTION_START"]) });
  }
  if (["abandoned", "invalidated"].includes(input.lifecycle.state)) {
    return Object.freeze({ status: "terminal", lifecycle: input.lifecycle, realizationRevisionId: null,
      reasonCodes: Object.freeze(["SESSION_PRACTICE_ATTEMPT_TERMINAL"]) });
  }
  const realizationRevisionId = deriveSessionPracticeRealizationRevisionId({
    attemptId: input.lifecycle.attemptId,
    requestId: input.request.requestId,
    sourceSessionRevisionId: input.lifecycle.sourceSessionRevisionId,
    mode: input.request.requestedMode,
    basedOnRevisionId: input.basedOnRevisionId,
  });
  return Object.freeze({
    status: "selected",
    realizationRevisionId,
    reasonCodes: Object.freeze([input.lifecycle.selectedMode === null ?
      "SESSION_PRACTICE_MODE_SELECTED" : "SESSION_PRACTICE_MODE_REVISED_PRE_EXECUTION"]),
    lifecycle: Object.freeze({
      ...input.lifecycle,
      state: input.finalForExecution ? "final_for_execution" : "selected_pre_execution",
      selectedMode: input.request.requestedMode,
      realizationRevisionIds: Object.freeze([...input.lifecycle.realizationRevisionIds, realizationRevisionId]),
      finalForExecutionRevisionId: input.finalForExecution ? realizationRevisionId : null,
    }),
  });
}

export function recordSessionPracticeExecutionStart(input: {
  readonly lifecycle: SessionPracticeAttemptLifecycle;
  readonly event: SessionPracticeExecutionStartEvent;
  readonly occurredAt: string;
}): SessionPracticeAttemptLifecycle {
  if (input.lifecycle.state === "execution_started" || input.lifecycle.state === "completed") {
    return input.lifecycle;
  }
  if (input.lifecycle.state !== "final_for_execution" || !input.lifecycle.finalForExecutionRevisionId ||
      !explicitIsoTime(input.occurredAt)) {
    return Object.freeze({ ...input.lifecycle, state: "invalidated" });
  }
  return Object.freeze({ ...input.lifecycle, state: "execution_started",
    executionStartEvent: input.event, executionStartedAt: input.occurredAt });
}

export function deliberatelyRestartSessionPracticeAttempt(input: {
  readonly lifecycle: SessionPracticeAttemptLifecycle;
  readonly newAttemptId: string;
  readonly occurredAt: string;
}): { readonly abandoned: SessionPracticeAttemptLifecycle; readonly replacement: SessionPracticeAttemptLifecycle } {
  const abandoned = Object.freeze({ ...input.lifecycle, state: "abandoned" as const,
    abandonedAt: input.occurredAt, supersededByAttemptId: input.newAttemptId });
  return Object.freeze({ abandoned, replacement: createSessionPracticeAttemptLifecycle({
    attemptId: input.newAttemptId, sourceSessionRevisionId: input.lifecycle.sourceSessionRevisionId,
  }) });
}
