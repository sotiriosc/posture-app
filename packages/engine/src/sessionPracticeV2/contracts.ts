import type {
  SessionPracticeAttemptLifecycle,
  SessionPracticeCompletionDisposition,
  SessionPracticeOutcomeSourceLink,
  SessionPracticeRealizationPlan,
  SessionPracticeRequest,
  SessionPracticeV2Draft,
} from "@praxis/training-engine-v2";

export interface PersistedSessionPracticeRevision {
  readonly persistenceContract: {
    readonly contractId: "SESSION_PRACTICE_PERSISTENCE";
    readonly contractVersion: "1.0.0";
  };
  readonly persistenceRevisionId: string;
  readonly basedOnPersistenceRevisionId: string | null;
  readonly athleteId: string;
  readonly attemptId: string;
  readonly requestId: string;
  readonly realizationRevisionId: string;
  readonly sourceSessionRevisionId: string;
  readonly finalForExecutionRevisionId: string | null;
  readonly lifecycle: SessionPracticeAttemptLifecycle;
  readonly request: SessionPracticeRequest;
  readonly plan: SessionPracticeRealizationPlan;
  readonly completion: SessionPracticeCompletionDisposition | null;
  readonly outcomeLink: SessionPracticeOutcomeSourceLink | null;
  readonly draft: SessionPracticeV2Draft | null;
  readonly contractVersions: readonly string[];
  readonly sourceFingerprint: string;
  readonly planFingerprint: string;
  readonly semanticFingerprint: string;
  readonly createdAt: string;
  readonly evaluationTime: string;
  readonly currentProductWriteApplied: false;
  readonly productActivationApplied: false;
}

export type AppendSessionPracticeRevisionStatus =
  | "appended"
  | "exact_retry"
  | "idempotency_conflict"
  | "lineage_conflict";

export interface AppendSessionPracticeRevisionResult {
  readonly status: AppendSessionPracticeRevisionStatus;
  readonly persistenceRevisionId: string;
  readonly priorRevision: PersistedSessionPracticeRevision | null;
  readonly mutationCount: 0;
  readonly productWriteCount: 0;
}

export interface SessionPracticePersistenceRepository {
  readonly appendRevision: (
    revision: PersistedSessionPracticeRevision,
  ) => Promise<AppendSessionPracticeRevisionResult>;
  readonly readExactRevision: (
    athleteId: string,
    attemptId: string,
    persistenceRevisionId: string,
  ) => Promise<PersistedSessionPracticeRevision | null>;
  readonly readAttemptRevisions: (
    athleteId: string,
    attemptId: string,
  ) => Promise<readonly PersistedSessionPracticeRevision[]>;
  readonly listAthleteCurrentRevisions: (
    athleteId: string,
  ) => Promise<readonly PersistedSessionPracticeRevision[]>;
}

export interface SessionPracticePostgresQueryable {
  readonly query: <T extends Record<string, unknown> = Record<string, unknown>>(
    text: string,
    values?: readonly unknown[],
  ) => Promise<{ readonly rows: readonly T[]; readonly rowCount?: number | null }>;
}
