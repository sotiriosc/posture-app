import type {
  ControlledOwnerActiveProgramPointer,
  ControlledOwnerDeliveryAuditEvent,
  ControlledOwnerV2ProgramApplication,
  ControlledOwnerV2ProgramApproval,
  ControlledOwnerV2ProgramPreview,
  OwnerEnrollmentRevision,
  OwnerGetStrongerProfileRevision,
  OwnerV2ProductProgramEnvelope,
  ProposedOwnerImportFact,
} from "@praxis/training-engine-v2";

export const OWNER_ELIGIBILITY_REASON_CODES = Object.freeze([
  "OWNER_DELIVERY_MODE_OFF",
  "OWNER_CONFIGURATION_MISSING",
  "OWNER_CONFIGURATION_INVALID",
  "OWNER_SESSION_MISSING",
  "CONFIGURED_OWNER_NOT_FOUND",
  "OWNER_USER_ID_MISMATCH",
  "OWNER_STORED_EMAIL_MISMATCH",
  "OWNER_TOKEN_EMAIL_MISMATCH",
  "OWNER_ELIGIBLE",
] as const);

export type OwnerEligibilityReasonCode = (typeof OWNER_ELIGIBILITY_REASON_CODES)[number];

export interface ControlledOwnerEligibilityResult {
  readonly contractId: "CONTROLLED_OWNER_ELIGIBILITY_RESULT";
  readonly contractVersion: "1.0.0";
  readonly eligible: boolean;
  readonly userId: string | null;
  readonly reasonCode: OwnerEligibilityReasonCode;
  readonly evaluatedAt: string;
  readonly databaseWriteCount: 0;
  readonly bootstrapCallCount: 0;
}

export interface OwnerEnrollmentProfileRepository {
  appendEnrollment(revision: OwnerEnrollmentRevision): Promise<"appended" | "exact_retry" | "conflict">;
  readEnrollmentExact(userId: string, enrollmentId: string, revisionId: string): Promise<OwnerEnrollmentRevision | null>;
  readCurrentEnrollment(userId: string): Promise<OwnerEnrollmentRevision | null>;
  appendProfile(revision: OwnerGetStrongerProfileRevision): Promise<"appended" | "exact_retry" | "conflict">;
  readProfileExact(userId: string, profileId: string, revisionId: string): Promise<OwnerGetStrongerProfileRevision | null>;
  readCurrentProfile(userId: string): Promise<OwnerGetStrongerProfileRevision | null>;
}

export interface OwnerProductImportAdapter {
  loadProposedFacts(userId: string): Promise<readonly ProposedOwnerImportFact[]>;
}

export interface OwnerPostgresQueryable {
  query<Row extends Record<string, unknown> = Record<string, unknown>>(
    text: string,
    values?: readonly unknown[],
  ): Promise<{ readonly rows: readonly Row[]; readonly rowCount?: number | null }>;
}

export type OwnerAppendResult = "appended" | "exact_retry" | "conflict";

export interface OwnerIdempotencyRecord {
  readonly userId: string;
  readonly action: "preview" | "approve" | "apply" | "rollback" | "practice";
  readonly idempotencyKey: string;
  readonly requestFingerprint: string;
  readonly responsePayload: unknown | null;
  readonly createdAt: string;
  readonly completedAt: string | null;
}

export interface OwnerProgramApplicationTransaction {
  readonly preview: ControlledOwnerV2ProgramPreview;
  readonly approval: ControlledOwnerV2ProgramApproval;
  readonly application: ControlledOwnerV2ProgramApplication;
  readonly envelope: OwnerV2ProductProgramEnvelope;
  readonly pointer: ControlledOwnerActiveProgramPointer;
  readonly auditEvent: ControlledOwnerDeliveryAuditEvent;
  readonly idempotency: OwnerIdempotencyRecord;
  readonly expectedPointerRevision: number;
}

export interface OwnerProgramApplicationTransactionResult {
  readonly status: "applied" | "exact_retry" | "conflict";
  readonly application: ControlledOwnerV2ProgramApplication | null;
  readonly envelope: OwnerV2ProductProgramEnvelope | null;
  readonly pointer: ControlledOwnerActiveProgramPointer | null;
}

export interface OwnerProgramRollbackTransaction {
  readonly pointer: ControlledOwnerActiveProgramPointer;
  readonly auditEvent: ControlledOwnerDeliveryAuditEvent;
  readonly idempotency: OwnerIdempotencyRecord;
  readonly expectedPointerRevision: number;
  readonly expectedApplicationId: string;
}

export interface OwnerProgramRollbackTransactionResult {
  readonly status: "rolled_back" | "exact_retry" | "conflict";
  readonly pointer: ControlledOwnerActiveProgramPointer | null;
  readonly auditEvent: ControlledOwnerDeliveryAuditEvent | null;
}

export interface OwnerDeliveryRepository {
  appendPreview(preview: ControlledOwnerV2ProgramPreview): Promise<OwnerAppendResult>;
  appendPreviewIdempotent(preview: ControlledOwnerV2ProgramPreview,
    idempotency: OwnerIdempotencyRecord): Promise<OwnerAppendResult>;
  readPreviewExact(userId: string, previewId: string): Promise<ControlledOwnerV2ProgramPreview | null>;
  appendApproval(approval: ControlledOwnerV2ProgramApproval): Promise<OwnerAppendResult>;
  appendApprovalIdempotent(approval: ControlledOwnerV2ProgramApproval,
    idempotency: OwnerIdempotencyRecord): Promise<OwnerAppendResult>;
  readApprovalExact(userId: string, approvalId: string): Promise<ControlledOwnerV2ProgramApproval | null>;
  readApplicationExact(userId: string, applicationId: string): Promise<ControlledOwnerV2ProgramApplication | null>;
  listApplications(userId: string): Promise<readonly ControlledOwnerV2ProgramApplication[]>;
  readEnvelopeExact(userId: string, envelopeId: string,
    envelopeRevisionId: string): Promise<OwnerV2ProductProgramEnvelope | null>;
  readActivePointer(userId: string): Promise<ControlledOwnerActiveProgramPointer | null>;
  readIdempotency(userId: string, action: OwnerIdempotencyRecord["action"],
    idempotencyKey: string): Promise<OwnerIdempotencyRecord | null>;
  appendIdempotency(record: OwnerIdempotencyRecord): Promise<OwnerAppendResult>;
  applyApprovedProgram(transaction: OwnerProgramApplicationTransaction):
    Promise<OwnerProgramApplicationTransactionResult>;
  rollbackActiveProgram(transaction: OwnerProgramRollbackTransaction):
    Promise<OwnerProgramRollbackTransactionResult>;
  appendAuditEvent(event: ControlledOwnerDeliveryAuditEvent): Promise<OwnerAppendResult>;
  listAuditEvents(userId: string): Promise<readonly ControlledOwnerDeliveryAuditEvent[]>;
}
