import type {
  ProductionAdaptationApplicationOrchestrationAuditEvent,
  ProductionAdaptationApplicationOrchestrationInput,
  ProductionAdaptationApplicationOrchestrationRequest,
  ProductionAdaptationApplicationOrchestrationResult,
} from "@praxis/training-engine-v2";

export type AdaptationApplicationOrchestrationTransaction = unknown;

export interface PersistedAdaptationApplicationOrchestrationRun {
  readonly requestSemanticFingerprint: string;
  readonly input: ProductionAdaptationApplicationOrchestrationInput;
  readonly result: ProductionAdaptationApplicationOrchestrationResult;
  readonly auditEvent: ProductionAdaptationApplicationOrchestrationAuditEvent;
}

export interface AdaptationApplicationOrchestrationPersistencePort {
  readonly transaction: <T>(work: (transaction: AdaptationApplicationOrchestrationTransaction) => Promise<T>) => Promise<T>;
  readonly lockIdempotencyKey: (athleteId: string, idempotencyKey: string,
    transaction: AdaptationApplicationOrchestrationTransaction) => Promise<void>;
  readonly getOrchestrationByIdempotencyKey: (athleteId: string, idempotencyKey: string,
    transaction?: AdaptationApplicationOrchestrationTransaction) =>
    Promise<PersistedAdaptationApplicationOrchestrationRun | null>;
  readonly persistOrchestrationRequestRevision: (run: PersistedAdaptationApplicationOrchestrationRun,
    transaction: AdaptationApplicationOrchestrationTransaction) => Promise<void>;
  readonly persistPreconditionSnapshot: (run: PersistedAdaptationApplicationOrchestrationRun,
    transaction: AdaptationApplicationOrchestrationTransaction) => Promise<void>;
  readonly persistOwnerResult: (run: PersistedAdaptationApplicationOrchestrationRun,
    transaction: AdaptationApplicationOrchestrationTransaction) => Promise<void>;
  readonly persistShadowCandidate: (run: PersistedAdaptationApplicationOrchestrationRun,
    transaction: AdaptationApplicationOrchestrationTransaction) => Promise<void>;
  readonly persistValidationResult: (run: PersistedAdaptationApplicationOrchestrationRun,
    transaction: AdaptationApplicationOrchestrationTransaction) => Promise<void>;
  readonly persistOrchestrationRevision: (run: PersistedAdaptationApplicationOrchestrationRun,
    transaction: AdaptationApplicationOrchestrationTransaction) => Promise<void>;
  readonly persistApplicationAttempt: (run: PersistedAdaptationApplicationOrchestrationRun,
    transaction: AdaptationApplicationOrchestrationTransaction) => Promise<void>;
  readonly appendAuditEvent: (run: PersistedAdaptationApplicationOrchestrationRun,
    transaction: AdaptationApplicationOrchestrationTransaction) => Promise<void>;
  readonly readOrchestrationRun: (athleteId: string, orchestrationRevisionId: string) =>
    Promise<PersistedAdaptationApplicationOrchestrationRun | null>;
  readonly replayOrchestrationRun: (athleteId: string, orchestrationRevisionId: string) =>
    Promise<PersistedAdaptationApplicationOrchestrationRun | null>;
}

export interface AdaptationApplicationOrchestrationObservabilityEvent {
  readonly name: "request_received" | "idempotent_retry" | "preconditions_passed" | "preconditions_failed" |
    "owner_routed" | "owner_result_created" | "downstream_rebuild_completed" |
    "downstream_validation_failed" | "shadow_candidate_persisted" | "orchestration_result_persisted" |
    "persistence_failed";
  readonly operationTime: string;
  readonly athleteId?: string;
  readonly requestId?: string;
  readonly orchestrationRevisionId?: string;
  readonly status: string;
  readonly reasonCodes?: readonly string[];
}

export interface AdaptationApplicationOrchestrationObservabilityPort {
  readonly emit: (event: AdaptationApplicationOrchestrationObservabilityEvent) => Promise<void> | void;
}

export interface AdaptationApplicationOrchestrationServiceDependencies {
  readonly repository: AdaptationApplicationOrchestrationPersistencePort;
  readonly pureDependencies: import("@praxis/training-engine-v2").ProductionAdaptationApplicationOrchestrationDependencies;
  readonly observability: AdaptationApplicationOrchestrationObservabilityPort;
  readonly recheckCurrentRevisions: (request: ProductionAdaptationApplicationOrchestrationRequest,
    transaction: AdaptationApplicationOrchestrationTransaction) => Promise<boolean>;
}

export const ADAPTATION_APPLICATION_ORCHESTRATION_PERSISTENCE_ERROR_CODES = Object.freeze([
  "idempotency_conflict", "stale_before_persistence", "applied_state_rejected", "persistence_failure",
  "orchestration_not_found", "orchestration_owner_port_version_unavailable",
] as const);

export class AdaptationApplicationOrchestrationPersistenceError extends Error {
  readonly code: typeof ADAPTATION_APPLICATION_ORCHESTRATION_PERSISTENCE_ERROR_CODES[number];
  constructor(code: typeof ADAPTATION_APPLICATION_ORCHESTRATION_PERSISTENCE_ERROR_CODES[number]) {
    super(code);
    this.name = "AdaptationApplicationOrchestrationPersistenceError";
    this.code = code;
  }
}
