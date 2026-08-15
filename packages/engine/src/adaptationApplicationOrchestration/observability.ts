import type { AdaptationApplicationOrchestrationObservabilityEvent,
  AdaptationApplicationOrchestrationObservabilityPort } from "./contracts";

export const NOOP_ADAPTATION_APPLICATION_ORCHESTRATION_OBSERVABILITY = Object.freeze({
  emit: () => undefined,
} satisfies AdaptationApplicationOrchestrationObservabilityPort);

export function sanitizeAdaptationApplicationOrchestrationObservabilityEvent(
  event: AdaptationApplicationOrchestrationObservabilityEvent,
): AdaptationApplicationOrchestrationObservabilityEvent {
  return Object.freeze({ name: event.name, operationTime: event.operationTime, athleteId: event.athleteId,
    requestId: event.requestId, orchestrationRevisionId: event.orchestrationRevisionId, status: event.status,
    reasonCodes: event.reasonCodes ? Object.freeze([...event.reasonCodes].sort()) : undefined });
}
