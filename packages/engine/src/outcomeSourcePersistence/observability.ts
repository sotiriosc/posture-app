export const OUTCOME_SOURCE_OBSERVABILITY_EVENTS = Object.freeze([
  "migration_planned", "migration_applied", "migration_failed", "ingestion_accepted",
  "ingestion_retried", "ingestion_conflicted", "ingestion_rejected", "revision_appended",
  "active_pointer_changed", "authorization_changed", "snapshot_built", "snapshot_persisted",
  "replay_matched", "replay_mismatched", "decision_persisted", "directive_persisted",
  "application_request_persisted", "stale_precondition", "repository_failure",
] as const);
export type OutcomeSourceObservabilityEventName = typeof OUTCOME_SOURCE_OBSERVABILITY_EVENTS[number];

export interface OutcomeSourceObservabilityEvent {
  readonly name: OutcomeSourceObservabilityEventName;
  readonly operationTime: string;
  readonly athleteId?: string;
  readonly entityId?: string;
  readonly status: string;
  readonly reasonCodes?: readonly string[];
  readonly metadata?: Readonly<Record<string, string | number | boolean | null>>;
}

export interface OutcomeSourceObservability {
  readonly emit: (event: OutcomeSourceObservabilityEvent) => void | Promise<void>;
}

export const NOOP_OUTCOME_SOURCE_OBSERVABILITY: OutcomeSourceObservability = Object.freeze({
  emit: () => undefined,
});

export function sanitizeOutcomeSourceObservabilityEvent(
  event: OutcomeSourceObservabilityEvent,
): OutcomeSourceObservabilityEvent {
  return Object.freeze({ name: event.name, operationTime: event.operationTime,
    athleteId: event.athleteId, entityId: event.entityId, status: event.status,
    reasonCodes: event.reasonCodes ? Object.freeze([...event.reasonCodes]) : undefined,
    metadata: event.metadata ? Object.freeze({ ...event.metadata }) : undefined });
}
