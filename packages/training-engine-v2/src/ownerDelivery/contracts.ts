import { deterministicToken, explicitIsoTime, stableId, uniqueSorted } from "../prescription/compiler/utilities";

export interface OwnerDeliveryContractReference {
  readonly contractId: string;
  readonly contractVersion: "1.0.0";
}

const contract = (contractId: string): OwnerDeliveryContractReference =>
  Object.freeze({ contractId, contractVersion: "1.0.0" });

export const OWNER_DELIVERY_CONTRACTS = Object.freeze({
  identityPolicy: contract("CONTROLLED_OWNER_ACCOUNT_IDENTITY_POLICY"),
  enrollment: contract("CONTROLLED_OWNER_V2_ENROLLMENT"),
  profile: contract("CONTROLLED_OWNER_GET_STRONGER_PROFILE"),
  generation: contract("CONTROLLED_OWNER_GET_STRONGER_GENERATION"),
  preview: contract("CONTROLLED_OWNER_V2_PROGRAM_PREVIEW"),
  approval: contract("CONTROLLED_OWNER_V2_PROGRAM_APPROVAL"),
  application: contract("CONTROLLED_OWNER_V2_PROGRAM_APPLICATION"),
  envelope: contract("OWNER_V2_PRODUCT_PROGRAM_ENVELOPE"),
  rollback: contract("CONTROLLED_OWNER_V2_ROLLBACK"),
  stateMachine: contract("CONTROLLED_OWNER_GET_STRONGER_DELIVERY_STATE_MACHINE"),
  implementationHandoff: contract("CONTROLLED_OWNER_GET_STRONGER_DELIVERY_IMPLEMENTATION_HANDOFF"),
  modePolicy: contract("CONTROLLED_OWNER_DELIVERY_MODE_POLICY"),
  eligibilityResult: contract("CONTROLLED_OWNER_ELIGIBILITY_RESULT"),
  profileRevision: contract("CONTROLLED_OWNER_PROFILE_REVISION"),
  generationCommand: contract("CONTROLLED_OWNER_GENERATION_COMMAND"),
  previewRepository: contract("CONTROLLED_OWNER_PREVIEW_REPOSITORY"),
  approvalRepository: contract("CONTROLLED_OWNER_APPROVAL_REPOSITORY"),
  applicationRepository: contract("CONTROLLED_OWNER_APPLICATION_REPOSITORY"),
  activeProgramPointer: contract("CONTROLLED_OWNER_ACTIVE_PROGRAM_POINTER"),
  auditEvent: contract("CONTROLLED_OWNER_DELIVERY_AUDIT_EVENT"),
  persistence: contract("CONTROLLED_OWNER_DELIVERY_PERSISTENCE"),
  observability: contract("CONTROLLED_OWNER_DELIVERY_OBSERVABILITY"),
  runtime: contract("CONTROLLED_OWNER_DELIVERY_RUNTIME"),
});

export type OwnerDeliveryMode = "off" | "preview" | "apply";
export type OwnerEnrollmentState = "active" | "suspended" | "revoked";
export type OwnerEnrollmentPermission = "preview_only" | "apply_allowed";
export type OwnerProfileReviewState = "requires_confirmation" | "confirmed";
export type OwnerTrainingSafetyState = "clear" | "review_required" | "blocked";

export const OWNER_DELIVERY_STATES = Object.freeze([
  "hidden",
  "ineligible",
  "eligible_not_enrolled",
  "profile_requires_confirmation",
  "profile_ready",
  "generating",
  "preview_blocked",
  "preview_ready",
  "approval_unavailable",
  "approval_ready",
  "approved",
  "applying",
  "applied_inactive",
  "v2_active",
  "active_session_conflict",
  "rollback_ready",
  "rolling_back",
  "legacy_restored",
  "suspended",
  "revoked",
  "stale",
  "conflict",
  "unavailable",
] as const);

export type OwnerDeliveryState = (typeof OWNER_DELIVERY_STATES)[number];

export interface OwnerRecordProvenance {
  readonly source: "configured_owner" | "proposed_product_import" | "owner_confirmation" | "server_runtime";
  readonly sourceRefs: readonly string[];
}

export interface OwnerEnrollmentRevision {
  readonly contract: OwnerDeliveryContractReference;
  readonly enrollmentId: string;
  readonly revisionId: string;
  readonly basedOnRevisionId: string | null;
  readonly userId: string;
  readonly state: OwnerEnrollmentState;
  readonly fixedGoal: "strength";
  readonly permission: OwnerEnrollmentPermission;
  readonly explicitConsent: boolean;
  readonly acceptedVersions: readonly string[];
  readonly provenance: OwnerRecordProvenance;
  readonly createdAt: string;
  readonly semanticFingerprint: string;
}

export type OwnerSessionMinutes =
  | { readonly status: "known"; readonly minutes: number }
  | { readonly status: "explicit_unknown"; readonly minutes: null };

export interface OwnerSessionOpportunity {
  readonly opportunityId: string;
  readonly order: number;
  readonly minutes: number | null;
}

export interface OwnerEquipmentCapabilitySnapshot {
  readonly environment: "home" | "commercial_gym" | "mixed";
  readonly capabilityIds: readonly string[];
  readonly confirmed: boolean;
  readonly sourceRevision: string;
}

export interface OwnerFamiliarityReference {
  readonly exerciseId: string;
  readonly realizationId: string | null;
  readonly status: "known" | "unknown" | "calibration_required";
}

export interface OwnerPainContext {
  readonly regionIds: readonly string[];
  readonly limitationIds: readonly string[];
  readonly confirmed: boolean;
  readonly diagnosticClaimCount: 0;
}

export interface OwnerGetStrongerProfileRevision {
  readonly contract: OwnerDeliveryContractReference;
  readonly revisionContract: OwnerDeliveryContractReference;
  readonly profileId: string;
  readonly revisionId: string;
  readonly basedOnRevisionId: string | null;
  readonly userId: string;
  readonly primaryGoal: "strength";
  readonly trainingMode: "develop";
  readonly secondaryGoal: null;
  readonly daysPerWeek: number;
  readonly sessionOpportunities: readonly OwnerSessionOpportunity[];
  readonly sessionMinutes: OwnerSessionMinutes;
  readonly equipmentCapabilitySnapshot: OwnerEquipmentCapabilitySnapshot;
  readonly coarseExperience: "beginner" | "intermediate" | "advanced";
  readonly familiarity: readonly OwnerFamiliarityReference[];
  readonly painContext: OwnerPainContext;
  readonly assessmentReferences: readonly string[];
  readonly trainingSafety: OwnerTrainingSafetyState;
  readonly continuityReferences: readonly string[];
  readonly evaluationTime: string;
  readonly provenance: OwnerRecordProvenance;
  readonly reviewState: OwnerProfileReviewState;
  readonly createdAt: string;
  readonly semanticFingerprint: string;
}

export type ProposedOwnerImportStatus =
  | "confirmed"
  | "requires_confirmation"
  | "insufficient"
  | "incompatible"
  | "unknown";

export interface ProposedOwnerImportFact {
  readonly factId: string;
  readonly field:
    | "days"
    | "top_level_equipment"
    | "pain_region"
    | "experience"
    | "assessment_reference"
    | "continuity_reference";
  readonly status: ProposedOwnerImportStatus;
  readonly structuredValue: string | number | readonly string[] | null;
  readonly sourceRevision: string;
}

export interface OwnerProfileReadiness {
  readonly status: "ready_for_preview" | "profile_incomplete" | "blocked_training_safety" | "blocked_equipment";
  readonly reasonCodes: readonly string[];
  readonly previewAllowed: boolean;
  readonly approvalAllowed: boolean;
  readonly minimumInputCount: 11;
}

function semanticFingerprint(value: unknown): string {
  return deterministicToken(value);
}

export function buildOwnerEnrollmentRevision(input: Omit<OwnerEnrollmentRevision,
  "contract" | "enrollmentId" | "revisionId" | "semanticFingerprint"> & {
    readonly enrollmentId?: string;
  }): OwnerEnrollmentRevision {
  if (!input.userId.trim() || !explicitIsoTime(input.createdAt)) {
    throw new Error("OWNER_ENROLLMENT_IDENTITY_AND_EXPLICIT_TIME_REQUIRED");
  }
  if (input.state === "active" && !input.explicitConsent) {
    throw new Error("OWNER_ENROLLMENT_EXPLICIT_CONSENT_REQUIRED");
  }
  const enrollmentId = input.enrollmentId ?? stableId("owner-v2-enrollment", { userId: input.userId });
  const semantic = Object.freeze({
    contract: OWNER_DELIVERY_CONTRACTS.enrollment,
    enrollmentId,
    basedOnRevisionId: input.basedOnRevisionId,
    userId: input.userId,
    state: input.state,
    fixedGoal: input.fixedGoal,
    permission: input.permission,
    explicitConsent: input.explicitConsent,
    acceptedVersions: Object.freeze(uniqueSorted(input.acceptedVersions)),
    provenance: Object.freeze({ ...input.provenance, sourceRefs: Object.freeze(uniqueSorted(input.provenance.sourceRefs)) }),
    createdAt: input.createdAt,
  });
  const revisionId = stableId("owner-v2-enrollment-revision", semantic);
  return Object.freeze({ ...semantic, revisionId, semanticFingerprint: semanticFingerprint({ ...semantic, revisionId }) });
}

export function buildOwnerProfileRevision(input: Omit<OwnerGetStrongerProfileRevision,
  "contract" | "revisionContract" | "profileId" | "revisionId" | "semanticFingerprint"> & {
    readonly profileId?: string;
  }): OwnerGetStrongerProfileRevision {
  if (!input.userId.trim() || !explicitIsoTime(input.createdAt) || !explicitIsoTime(input.evaluationTime)) {
    throw new Error("OWNER_PROFILE_IDENTITY_AND_EXPLICIT_TIME_REQUIRED");
  }
  const profileId = input.profileId ?? stableId("owner-v2-profile", { userId: input.userId });
  const semantic = Object.freeze({
    ...input,
    contract: OWNER_DELIVERY_CONTRACTS.profile,
    revisionContract: OWNER_DELIVERY_CONTRACTS.profileRevision,
    profileId,
    sessionOpportunities: Object.freeze([...input.sessionOpportunities]
      .map((entry) => Object.freeze({ ...entry }))
      .sort((left, right) => left.order - right.order || left.opportunityId.localeCompare(right.opportunityId))),
    equipmentCapabilitySnapshot: Object.freeze({
      ...input.equipmentCapabilitySnapshot,
      capabilityIds: Object.freeze(uniqueSorted(input.equipmentCapabilitySnapshot.capabilityIds)),
    }),
    familiarity: Object.freeze([...input.familiarity].map((entry) => Object.freeze({ ...entry }))
      .sort((left, right) => left.exerciseId.localeCompare(right.exerciseId) ||
        (left.realizationId ?? "").localeCompare(right.realizationId ?? ""))),
    painContext: Object.freeze({
      ...input.painContext,
      regionIds: Object.freeze(uniqueSorted(input.painContext.regionIds)),
      limitationIds: Object.freeze(uniqueSorted(input.painContext.limitationIds)),
    }),
    assessmentReferences: Object.freeze(uniqueSorted(input.assessmentReferences)),
    continuityReferences: Object.freeze(uniqueSorted(input.continuityReferences)),
    provenance: Object.freeze({ ...input.provenance, sourceRefs: Object.freeze(uniqueSorted(input.provenance.sourceRefs)) }),
  });
  const revisionId = stableId("owner-v2-profile-revision", semantic);
  return Object.freeze({ ...semantic, revisionId, semanticFingerprint: semanticFingerprint({ ...semantic, revisionId }) });
}

export function evaluateOwnerProfileReadiness(profile: OwnerGetStrongerProfileRevision): OwnerProfileReadiness {
  const reasons: string[] = [];
  if (profile.primaryGoal !== "strength" || profile.trainingMode !== "develop" || profile.secondaryGoal !== null) {
    reasons.push("OWNER_PROFILE_FIXED_GOAL_MODE_CONFLICT");
  }
  if (profile.reviewState !== "confirmed") reasons.push("OWNER_PROFILE_CONFIRMATION_REQUIRED");
  if (!Number.isInteger(profile.daysPerWeek) || profile.daysPerWeek < 1 || profile.daysPerWeek > 7 ||
      profile.sessionOpportunities.length !== profile.daysPerWeek) {
    reasons.push("OWNER_PROFILE_DAYS_OPPORTUNITIES_INVALID");
  }
  if (!profile.equipmentCapabilitySnapshot.confirmed ||
      profile.equipmentCapabilitySnapshot.capabilityIds.length === 0) {
    reasons.push("OWNER_PROFILE_EXACT_EQUIPMENT_REQUIRED");
  }
  if (!profile.painContext.confirmed) reasons.push("OWNER_PROFILE_PAIN_CONTEXT_CONFIRMATION_REQUIRED");
  if (profile.trainingSafety === "blocked") reasons.push("OWNER_PROFILE_TRAINING_SAFETY_BLOCKED");
  if (profile.trainingSafety === "review_required") reasons.push("OWNER_PROFILE_TRAINING_SAFETY_REVIEW_REQUIRED");
  const status = reasons.includes("OWNER_PROFILE_TRAINING_SAFETY_BLOCKED")
    ? "blocked_training_safety"
    : reasons.includes("OWNER_PROFILE_EXACT_EQUIPMENT_REQUIRED")
      ? "blocked_equipment"
      : reasons.length
        ? "profile_incomplete"
        : "ready_for_preview";
  const previewAllowed = status === "ready_for_preview";
  return Object.freeze({
    status,
    reasonCodes: Object.freeze(uniqueSorted(reasons)),
    previewAllowed,
    approvalAllowed: previewAllowed && profile.sessionMinutes.status === "known",
    minimumInputCount: 11,
  });
}

export function validateOwnerEnrollmentRevision(value: OwnerEnrollmentRevision): readonly string[] {
  const reasons: string[] = [];
  if (value.contract.contractId !== OWNER_DELIVERY_CONTRACTS.enrollment.contractId ||
      value.contract.contractVersion !== "1.0.0") reasons.push("OWNER_ENROLLMENT_VERSION_UNSUPPORTED");
  if (!value.userId || !explicitIsoTime(value.createdAt)) reasons.push("OWNER_ENROLLMENT_INVALID");
  if (semanticFingerprint({ ...value, semanticFingerprint: undefined }) !== value.semanticFingerprint) {
    reasons.push("OWNER_ENROLLMENT_FINGERPRINT_INVALID");
  }
  return Object.freeze(uniqueSorted(reasons));
}

export function validateOwnerProfileRevision(value: OwnerGetStrongerProfileRevision): readonly string[] {
  const reasons: string[] = [];
  if (value.contract.contractId !== OWNER_DELIVERY_CONTRACTS.profile.contractId ||
      value.revisionContract.contractId !== OWNER_DELIVERY_CONTRACTS.profileRevision.contractId) {
    reasons.push("OWNER_PROFILE_VERSION_UNSUPPORTED");
  }
  if (!value.userId || !explicitIsoTime(value.createdAt) || !explicitIsoTime(value.evaluationTime)) {
    reasons.push("OWNER_PROFILE_INVALID");
  }
  if (semanticFingerprint({ ...value, semanticFingerprint: undefined }) !== value.semanticFingerprint) {
    reasons.push("OWNER_PROFILE_FINGERPRINT_INVALID");
  }
  return Object.freeze(uniqueSorted(reasons));
}
