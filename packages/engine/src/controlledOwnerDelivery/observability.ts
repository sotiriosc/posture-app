export const CONTROLLED_OWNER_OBSERVABILITY_EVENTS = Object.freeze([
  "eligibility_result", "enrollment_revision", "profile_revision", "generation_started",
  "generation_result", "preview_readiness", "approval", "application", "active_pointer",
  "route_read", "session_attempt", "practice_mode", "persistence_conflict", "replay_failure",
  "completion", "outcome_source", "longitudinal_observation", "rollback", "kill_switch",
] as const);

export type ControlledOwnerObservabilityEventName =
  (typeof CONTROLLED_OWNER_OBSERVABILITY_EVENTS)[number];

export interface ControlledOwnerObservabilityEvent {
  readonly name: ControlledOwnerObservabilityEventName;
  readonly occurredAt: string;
  readonly userId: string | null;
  readonly recordId: string | null;
  readonly contractVersion: string | null;
  readonly mode: "off" | "preview" | "apply" | null;
  readonly state: string | null;
  readonly reasonCodes: readonly string[];
  readonly latencyMs: number | null;
  readonly fingerprint: string | null;
  readonly appSurface: string | null;
}

export interface ControlledOwnerObservability {
  readonly emit: (event: ControlledOwnerObservabilityEvent) => void | Promise<void>;
}

export const NOOP_CONTROLLED_OWNER_OBSERVABILITY: ControlledOwnerObservability = Object.freeze({
  emit: () => undefined,
});

export function buildControlledOwnerObservabilityEvent(
  input: ControlledOwnerObservabilityEvent,
): ControlledOwnerObservabilityEvent {
  if (!CONTROLLED_OWNER_OBSERVABILITY_EVENTS.includes(input.name) ||
      !Number.isFinite(Date.parse(input.occurredAt))) {
    throw new Error("CONTROLLED_OWNER_OBSERVABILITY_EVENT_INVALID");
  }
  return Object.freeze({ ...input, reasonCodes: Object.freeze([...new Set(input.reasonCodes)].sort()) });
}

export function createBufferedControlledOwnerObservability() {
  const events: ControlledOwnerObservabilityEvent[] = [];
  return Object.freeze({
    observability: Object.freeze({ emit: (event: ControlledOwnerObservabilityEvent) => {
      events.push(buildControlledOwnerObservabilityEvent(event));
    } }),
    read: () => Object.freeze([...events]),
  });
}
