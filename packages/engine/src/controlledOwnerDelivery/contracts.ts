import type {
  OwnerEnrollmentRevision,
  OwnerGetStrongerProfileRevision,
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
