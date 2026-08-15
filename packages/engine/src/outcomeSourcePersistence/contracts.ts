import type {
  AdaptationDirectiveApplicationRequest,
  NormalizedOutcomeSourceRecord,
  OutcomeSourceDecisionUseAuthorization,
  OutcomeSourceRecordRevisionLedger,
  PersistedAdaptationApplicationAttempt,
  ProductionAdaptationDecisionBundle,
  ProductionOutcomeSourceIngestionStatus,
  ProductionOutcomeSourceSnapshot,
  ProductionRawOutcomeSourceEnvelope,
} from "@praxis/training-engine-v2";
import type { OutcomeSourceMigration } from "./migrations";
import type { OutcomeSourceMigrationPlan } from "./migrationRunner";

export interface OutcomeSourcePrincipalContext {
  readonly principalId: string;
  readonly athleteId: string;
  readonly authorizedAthleteIds: readonly string[];
  readonly authenticationState: "authenticated";
}

export interface OutcomeSourceAuditEvent {
  readonly auditEventId: string;
  readonly athleteId: string | null;
  readonly principalId: string;
  readonly operation: string;
  readonly entityType: string;
  readonly entityId: string;
  readonly entityRevisionId: string | null;
  readonly beforeReference: string | null;
  readonly afterReference: string | null;
  readonly reasonCode: string;
  readonly operationTime: string;
  readonly result: string;
  readonly provenance: readonly string[];
}

export interface PersistedOutcomeSourceIngestionResult {
  readonly status: ProductionOutcomeSourceIngestionStatus;
  readonly envelopeId: string;
  readonly sourceRecordId: string | null;
  readonly sourceRecordRevisionId: string | null;
  readonly activeRevisionId: string | null;
  readonly adapterReference: string | null;
  readonly reasonCodes: readonly string[];
  readonly downstreamEvaluationCount: 0;
  readonly directiveApplicationCount: 0;
}

export interface PersistNormalizedOutcomeSourceRevisionInput {
  readonly principal: OutcomeSourcePrincipalContext;
  readonly envelope: ProductionRawOutcomeSourceEnvelope;
  readonly authorization: OutcomeSourceDecisionUseAuthorization;
  readonly authorizationRevisionId: string;
  readonly basedOnAuthorizationRevisionId: string | null;
  readonly normalizedRecord: NormalizedOutcomeSourceRecord;
  readonly result: PersistedOutcomeSourceIngestionResult;
  readonly operationTime: string;
}

export interface OutcomeSourceSnapshotPersistenceInput {
  readonly principal: OutcomeSourcePrincipalContext;
  readonly snapshot: ProductionOutcomeSourceSnapshot;
  readonly operationTime: string;
}

export interface AdaptationApplicationRequestPersistenceInput {
  readonly principal: OutcomeSourcePrincipalContext;
  readonly requestRevisionId: string;
  readonly request: AdaptationDirectiveApplicationRequest;
  readonly confirmationState: "required" | "confirmed" | "not_required" | "unknown";
  readonly operationTime: string;
}

export interface OutcomeSourcePersistencePort {
  readonly planMigrations: (migrations: readonly OutcomeSourceMigration[], operationTime: string) =>
    Promise<OutcomeSourceMigrationPlan>;
  readonly persistNormalizedRevision: (
    input: PersistNormalizedOutcomeSourceRevisionInput,
  ) => Promise<PersistedOutcomeSourceIngestionResult>;
  readonly appendCorrection: (
    input: PersistNormalizedOutcomeSourceRevisionInput,
  ) => Promise<PersistedOutcomeSourceIngestionResult>;
  readonly appendSupersession: (
    input: PersistNormalizedOutcomeSourceRevisionInput,
  ) => Promise<PersistedOutcomeSourceIngestionResult>;
  readonly appendWithdrawal: (
    input: PersistNormalizedOutcomeSourceRevisionInput,
  ) => Promise<PersistedOutcomeSourceIngestionResult>;
  readonly readActiveSourceRecords: (
    athleteId: string,
    evaluationTime: string,
  ) => Promise<readonly NormalizedOutcomeSourceRecord[]>;
  readonly readRevisionLedgers: (athleteId: string) => Promise<readonly OutcomeSourceRecordRevisionLedger[]>;
  readonly persistSourceSnapshot: (input: OutcomeSourceSnapshotPersistenceInput) => Promise<void>;
  readonly readSourceSnapshot: (
    athleteId: string,
    snapshotRevisionId: string,
  ) => Promise<ProductionOutcomeSourceSnapshot | null>;
  readonly persistLongitudinalDecisionBundle: (input: {
    readonly principal: OutcomeSourcePrincipalContext;
    readonly bundle: ProductionAdaptationDecisionBundle;
    readonly operationTime: string;
  }) => Promise<void>;
  readonly persistApplicationRequest: (input: AdaptationApplicationRequestPersistenceInput) => Promise<void>;
  readonly persistApplicationAttempt: (input: {
    readonly principal: OutcomeSourcePrincipalContext;
    readonly requestRevisionId: string;
    readonly attempt: PersistedAdaptationApplicationAttempt;
    readonly operationTime: string;
  }) => Promise<void>;
  readonly appendAuditEvent: (event: OutcomeSourceAuditEvent) => Promise<void>;
}

export const OUTCOME_SOURCE_PERSISTENCE_ERROR_STATUSES = Object.freeze([
  "migration_invalid", "migration_checksum_conflict", "authorization_required", "authorization_restricted",
  "idempotency_payload_conflict", "active_revision_conflict", "athlete_scope_violation",
  "revision_lineage_invalid", "snapshot_membership_invalid", "application_applied_rejected",
  "persistence_failure",
] as const);

export class OutcomeSourcePersistenceError extends Error {
  readonly code: typeof OUTCOME_SOURCE_PERSISTENCE_ERROR_STATUSES[number];
  readonly diagnostics: Readonly<Record<string, string | number | boolean | null>>;

  constructor(
    code: typeof OUTCOME_SOURCE_PERSISTENCE_ERROR_STATUSES[number],
    diagnostics: Readonly<Record<string, string | number | boolean | null>> = {},
  ) {
    super(code);
    this.name = "OutcomeSourcePersistenceError";
    this.code = code;
    this.diagnostics = Object.freeze({ ...diagnostics });
  }
}
