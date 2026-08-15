import type { ControlledProductShadowObservabilityEvent,
  ControlledProductShadowObservabilityPort } from "./contracts";

export const NOOP_CONTROLLED_PRODUCT_SHADOW_OBSERVABILITY = Object.freeze({
  emit: () => undefined,
} satisfies ControlledProductShadowObservabilityPort);

export function sanitizeControlledProductShadowObservabilityEvent(
  event: ControlledProductShadowObservabilityEvent,
): ControlledProductShadowObservabilityEvent {
  return Object.freeze({ name: event.name, operationTime: event.operationTime, athleteId: event.athleteId,
    triggerId: event.triggerId, runRevisionId: event.runRevisionId, status: event.status,
    reasonCodes: event.reasonCodes ? Object.freeze([...event.reasonCodes].sort()) : undefined });
}
