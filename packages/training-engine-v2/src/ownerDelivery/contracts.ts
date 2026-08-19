import type { EquipmentCapabilityKey, MachineId } from "../domain/equipment";
import type { ExercisePrerequisiteType } from "../domain/exercise";
import { deterministicToken, explicitIsoTime, sameSemanticValue, stableId, uniqueSorted } from
  "../prescription/compiler/utilities";

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
  profilePreflight: contract("CONTROLLED_OWNER_PROFILE_PREFLIGHT"),
  profilePreflightAnswer: contract("CONTROLLED_OWNER_PROFILE_PREFLIGHT_ANSWER"),
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

export const OWNER_AVAILABLE_TRAINING_DAYS = Object.freeze([2, 3, 4, 5, 6] as const);
export type OwnerAvailableTrainingDays = (typeof OWNER_AVAILABLE_TRAINING_DAYS)[number];
export type OwnerStoredTrainingDays = 1 | OwnerAvailableTrainingDays | 7;

export function isOwnerAvailableTrainingDays(value: unknown): value is OwnerAvailableTrainingDays {
  return typeof value === "number" && OWNER_AVAILABLE_TRAINING_DAYS.includes(value as OwnerAvailableTrainingDays);
}

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
  readonly availabilityConfirmations?: readonly OwnerEquipmentAvailabilityConfirmation[];
  readonly loadCeilings?: readonly OwnerEquipmentLoadCeiling[];
}

export interface OwnerFamiliarityReference {
  readonly exerciseId: string;
  readonly realizationId: string | null;
  readonly status: "known" | "unknown" | "calibration_required";
  readonly answer?: OwnerConfirmationAnswer;
  readonly questionId?: string;
  readonly questionRevisionId?: string;
  readonly confirmationTime?: string | null;
  readonly provenance?: OwnerRecordProvenance;
}

export const OWNER_CONFIRMATION_ANSWERS = Object.freeze([
  "yes",
  "no",
  "not_sure",
  "not_reviewed",
] as const);

export type OwnerConfirmationAnswer = (typeof OWNER_CONFIRMATION_ANSWERS)[number];
export type OwnerLoadUnit = "kg" | "lb";

export interface OwnerPrerequisiteConfirmation {
  readonly prerequisiteId: string;
  readonly prerequisiteType: ExercisePrerequisiteType;
  readonly answer: OwnerConfirmationAnswer;
  readonly questionId: string;
  readonly questionRevisionId: string;
  readonly sourceRevision: string;
  readonly confirmationTime: string | null;
  readonly provenance: OwnerRecordProvenance;
}

export interface OwnerEquipmentAvailabilityConfirmation {
  readonly capabilityId: EquipmentCapabilityKey | `machine:${MachineId}`;
  readonly answer: OwnerConfirmationAnswer;
  readonly questionId: string;
  readonly questionRevisionId: string;
  readonly sourceRevision: string;
  readonly confirmationTime: string | null;
  readonly provenance: OwnerRecordProvenance;
}

export interface OwnerEquipmentLoadCeiling {
  readonly equipmentId: "dumbbells" | "barbell";
  readonly status: "provided" | "unavailable" | "not_sure" | "not_reviewed";
  readonly enteredValue: number | null;
  readonly enteredUnit: OwnerLoadUnit | null;
  readonly normalizedKilograms: number | null;
  readonly questionId: string;
  readonly questionRevisionId: string;
  readonly sourceRevision: string;
  readonly confirmationTime: string | null;
  readonly provenance: OwnerRecordProvenance;
}

export interface OwnerLoadingSuitabilityConfirmation {
  readonly responsibilityKey: string;
  readonly exerciseId: string;
  readonly answer: OwnerConfirmationAnswer;
  readonly questionId: string;
  readonly questionRevisionId: string;
  readonly sourceRevision: string;
  readonly confirmationTime: string | null;
  readonly provenance: OwnerRecordProvenance;
}

export interface OwnerPainContext {
  readonly regionIds: readonly string[];
  readonly limitationIds: readonly string[];
  readonly confirmed: boolean;
  readonly diagnosticClaimCount: 0;
  readonly sourceFactIds?: readonly string[];
  readonly sourceRevision?: string;
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
  readonly daysPerWeek: OwnerStoredTrainingDays;
  readonly sessionOpportunities: readonly OwnerSessionOpportunity[];
  readonly sessionMinutes: OwnerSessionMinutes;
  readonly equipmentCapabilitySnapshot: OwnerEquipmentCapabilitySnapshot;
  readonly coarseExperience: "beginner" | "intermediate" | "advanced";
  readonly familiarity: readonly OwnerFamiliarityReference[];
  readonly prerequisiteConfirmations?: readonly OwnerPrerequisiteConfirmation[];
  readonly loadingSuitabilityConfirmations?: readonly OwnerLoadingSuitabilityConfirmation[];
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

export type OwnerPreviewReadinessStatus =
  | "ready_for_approval"
  | "preview_only_unknown_duration"
  | "blocked";

export interface OwnerGenerationCommand {
  readonly contract: OwnerDeliveryContractReference;
  readonly commandId: string;
  readonly userId: string;
  readonly enrollmentRevisionId: string;
  readonly profileRevisionId: string;
  readonly sourceProductSnapshotId: string;
  readonly sourceProductRevisionId: string;
  readonly activeLegacyProgramRevisionId: string | null;
  readonly engineVersion: string;
  readonly policyVersions: readonly string[];
  readonly evaluationTime: string;
  readonly requestedAt: string;
}

export interface OwnerPipelineStageArtifact {
  readonly stage:
    | "product_mapping"
    | "product_horizon"
    | "week_intent"
    | "week_allocation"
    | "session_intent"
    | "candidate_intelligence"
    | "session_composer"
    | "prescription_compiler"
    | "final_sequencing"
    | "gate_13"
    | "phase_snapshot"
    | "application_readiness"
    | "owner_envelope_projection";
  readonly productionKernel: string;
  readonly status: "complete" | "blocked";
  readonly artifactFingerprint: string;
  readonly payload: unknown;
  readonly reasonCodes: readonly string[];
}

export interface OwnerProgramExerciseProjection {
  readonly assignmentId: string;
  readonly exerciseId: string;
  readonly realizationId: string | null;
  readonly sourceEventId: string | null;
  readonly prescriptionRevisionId: string | null;
  readonly sets: number | null;
  readonly reps: string;
  readonly tempo: string | null;
  readonly restSeconds: number | null;
  readonly effort: string | null;
  readonly doseBlocks?: readonly OwnerProgramDoseBlockProjection[];
  readonly equipmentRequirementIds: readonly string[];
  readonly reasonCodes: readonly string[];
  /** Present on projections created after ordered owner section support was introduced. */
  readonly section?: "warmup" | "activation" | "main" | "accessory" | "cooldown";
  readonly role?: "preparation" | "activation" | "primary_strength" | "secondary_strength" |
    "hypertrophy_accessory" | "capacity" | "recovery";
  readonly preparationCategories?: readonly string[];
  readonly dependencyIds?: readonly string[];
  readonly dependencyReasons?: readonly string[];
}

export interface OwnerProgramDoseBlockProjection {
  readonly blockId: string;
  readonly order: number;
  readonly purpose: string;
  readonly volume: string;
  readonly target: string;
  readonly rest: string;
  readonly effort: string;
  readonly tempo: string;
  readonly load: string;
  readonly calibrationRequired: boolean;
}

export interface OwnerProgramSessionProjection {
  readonly sessionId: string;
  readonly opportunityId: string;
  readonly purpose: string;
  readonly durationStatus: "known" | "unknown";
  readonly durationMinutes: number | null;
  /** Available time and calculated work are separate facts. Optional for immutable older previews. */
  readonly availableMinutes?: number | null;
  readonly calculatedDuration?: {
    readonly status: "fully_determinable" | "bounded" | "unknown_due_to_prescription" |
      "unknown_due_to_setup_transition" | "unknown_due_to_interexercise_recovery" |
      "unknown_due_to_section_transition" | "definitely_over_budget" | "possibly_over_budget" |
      "fits_known_bound";
    readonly knownLowerBoundSeconds: number;
    readonly knownUpperBoundSeconds: number | null;
    readonly unknownComponents: readonly string[];
    readonly accountedAssignmentIds: readonly string[];
    readonly noInventedTime: true;
  };
  readonly exerciseAssignments: readonly OwnerProgramExerciseProjection[];
  readonly practiceModes: readonly ["full", "lighter", "recovery"];
}

export interface OwnerProgramProjection {
  readonly projectionContract: OwnerDeliveryContractReference;
  readonly goal: "strength";
  readonly mode: "develop";
  readonly weekObjectiveIds: readonly string[];
  readonly sessions: readonly OwnerProgramSessionProjection[];
  readonly unresolvedFacts: readonly string[];
  readonly safetyState: OwnerTrainingSafetyState;
  readonly engineVersion: string;
  readonly policyVersions: readonly string[];
  readonly authoritative: false;
  readonly projectionFingerprint: string;
}

export interface ControlledOwnerV2ProgramPreview {
  readonly contract: OwnerDeliveryContractReference;
  readonly previewId: string;
  readonly userId: string;
  readonly generationCommandId: string;
  readonly profileId: string;
  readonly profileRevisionId: string;
  readonly sourceProductSnapshotId: string;
  readonly sourceProductRevisionId: string;
  readonly activeLegacyProgramRevisionId: string | null;
  readonly engineVersion: string;
  readonly policyVersions: readonly string[];
  readonly completeProgramSnapshot: readonly OwnerPipelineStageArtifact[];
  readonly productProjection: OwnerProgramProjection;
  readonly unresolvedFacts: readonly string[];
  readonly readinessStatus: OwnerPreviewReadinessStatus;
  readonly safetyState: OwnerTrainingSafetyState;
  readonly createdAt: string;
  readonly counterfactual: true;
  readonly applied: false;
  readonly stale: false;
  readonly previewFingerprint: string;
}

export interface ControlledOwnerV2ProgramApproval {
  readonly contract: OwnerDeliveryContractReference;
  readonly approvalId: string;
  readonly userId: string;
  readonly previewId: string;
  readonly previewFingerprint: string;
  readonly profileRevisionId: string;
  readonly sourceProductRevisionId: string;
  readonly engineVersion: string;
  readonly policyVersions: readonly string[];
  readonly explicitConfirmation: true;
  readonly approvedAt: string;
  readonly approvalFingerprint: string;
}

export interface OwnerV2ProductProgramEnvelope {
  readonly contract: OwnerDeliveryContractReference;
  readonly envelopeId: string;
  readonly envelopeRevisionId: string;
  readonly userId: string;
  readonly previewId: string;
  readonly previewFingerprint: string;
  readonly approvalId: string;
  readonly applicationId: string;
  readonly profileRevisionId: string;
  readonly sourceProductSnapshotId: string;
  readonly sourceProductRevisionId: string;
  readonly legacyFallbackReference: string | null;
  readonly engineVersion: string;
  readonly policyVersions: readonly string[];
  readonly programSnapshot: readonly OwnerPipelineStageArtifact[];
  readonly productProjection: OwnerProgramProjection;
  readonly assignmentIds: readonly string[];
  readonly sourceEventIds: readonly string[];
  readonly prescriptionRevisionIds: readonly string[];
  readonly weekObjectiveIds: readonly string[];
  readonly practiceModeReferences: readonly ["full", "lighter", "recovery"];
  readonly createdAt: string;
  readonly envelopeFingerprint: string;
}

export interface ControlledOwnerV2ProgramApplication {
  readonly contract: OwnerDeliveryContractReference;
  readonly applicationId: string;
  readonly userId: string;
  readonly approvalId: string;
  readonly previewId: string;
  readonly envelopeId: string;
  readonly envelopeRevisionId: string;
  readonly priorPointerRevision: number;
  readonly appliedAt: string;
  readonly applicationFingerprint: string;
}

export interface ControlledOwnerActiveProgramPointer {
  readonly contract: OwnerDeliveryContractReference;
  readonly userId: string;
  readonly mode: "legacy" | "v2_owner";
  readonly activeApplicationId: string | null;
  readonly legacyFallbackReference: string | null;
  readonly revision: number;
  readonly updatedAt: string;
  readonly provenance: OwnerRecordProvenance;
  readonly pointerFingerprint: string;
}

export interface ControlledOwnerDeliveryAuditEvent {
  readonly contract: OwnerDeliveryContractReference;
  readonly eventId: string;
  readonly userId: string;
  readonly action: string;
  readonly targetId: string;
  readonly occurredAt: string;
  readonly metadata: Readonly<Record<string, string | number | boolean | null>>;
  readonly eventFingerprint: string;
}

export function buildOwnerGenerationCommand(input: Omit<OwnerGenerationCommand,
"contract" | "commandId">): OwnerGenerationCommand {
  if (!input.userId.trim() || !explicitIsoTime(input.evaluationTime) || !explicitIsoTime(input.requestedAt)) {
    throw new Error("OWNER_GENERATION_EXPLICIT_IDENTITY_AND_TIME_REQUIRED");
  }
  const semantic = Object.freeze({ ...input, policyVersions: Object.freeze(uniqueSorted(input.policyVersions)) });
  return Object.freeze({ contract: OWNER_DELIVERY_CONTRACTS.generationCommand,
    commandId: stableId("owner-v2-generation-command", semantic), ...semantic });
}

export function buildOwnerProgramProjection(input: Omit<OwnerProgramProjection,
"projectionContract" | "projectionFingerprint" | "authoritative">): OwnerProgramProjection {
  const semantic = Object.freeze({ ...input, weekObjectiveIds: Object.freeze(uniqueSorted(input.weekObjectiveIds)),
    policyVersions: Object.freeze(uniqueSorted(input.policyVersions)), authoritative: false as const });
  return Object.freeze({ projectionContract: contract("CONTROLLED_OWNER_PRODUCT_PROJECTION"), ...semantic,
    projectionFingerprint: semanticFingerprint(semantic) });
}

export function buildOwnerProgramPreview(input: Omit<ControlledOwnerV2ProgramPreview,
"contract" | "previewId" | "previewFingerprint" | "counterfactual" | "applied" | "stale">):
ControlledOwnerV2ProgramPreview {
  if (!input.userId.trim() || !explicitIsoTime(input.createdAt)) throw new Error("OWNER_PREVIEW_INVALID");
  const semantic = Object.freeze({ ...input, policyVersions: Object.freeze(uniqueSorted(input.policyVersions)),
    counterfactual: true as const, applied: false as const, stale: false as const });
  const previewId = stableId("owner-v2-preview", semantic);
  return Object.freeze({ contract: OWNER_DELIVERY_CONTRACTS.preview, previewId, ...semantic,
    previewFingerprint: semanticFingerprint({ previewId, ...semantic }) });
}

export function buildOwnerProgramApproval(input: Omit<ControlledOwnerV2ProgramApproval,
"contract" | "approvalId" | "approvalFingerprint">): ControlledOwnerV2ProgramApproval {
  if (!input.explicitConfirmation || !explicitIsoTime(input.approvedAt)) throw new Error("OWNER_APPROVAL_INVALID");
  const semantic = Object.freeze({ ...input, policyVersions: Object.freeze(uniqueSorted(input.policyVersions)) });
  const approvalId = stableId("owner-v2-approval", semantic);
  return Object.freeze({ contract: OWNER_DELIVERY_CONTRACTS.approval, approvalId, ...semantic,
    approvalFingerprint: semanticFingerprint({ approvalId, ...semantic }) });
}

export function buildOwnerProgramEnvelope(input: Omit<OwnerV2ProductProgramEnvelope,
"contract" | "envelopeId" | "envelopeRevisionId" | "envelopeFingerprint">): OwnerV2ProductProgramEnvelope {
  if (!explicitIsoTime(input.createdAt)) throw new Error("OWNER_ENVELOPE_EXPLICIT_TIME_REQUIRED");
  const semantic = Object.freeze({ ...input,
    policyVersions: Object.freeze(uniqueSorted(input.policyVersions)),
    assignmentIds: Object.freeze(uniqueSorted(input.assignmentIds)),
    sourceEventIds: Object.freeze(uniqueSorted(input.sourceEventIds)),
    prescriptionRevisionIds: Object.freeze(uniqueSorted(input.prescriptionRevisionIds)),
    weekObjectiveIds: Object.freeze(uniqueSorted(input.weekObjectiveIds)) });
  const envelopeId = stableId("owner-v2-program-envelope", { userId: input.userId, applicationId: input.applicationId });
  const envelopeRevisionId = stableId("owner-v2-program-envelope-revision", semantic);
  return Object.freeze({ contract: OWNER_DELIVERY_CONTRACTS.envelope, envelopeId, envelopeRevisionId,
    ...semantic, envelopeFingerprint: semanticFingerprint({ envelopeId, envelopeRevisionId, ...semantic }) });
}

export function buildOwnerProgramApplication(input: Omit<ControlledOwnerV2ProgramApplication,
"contract" | "applicationId" | "applicationFingerprint">): ControlledOwnerV2ProgramApplication {
  if (!explicitIsoTime(input.appliedAt)) throw new Error("OWNER_APPLICATION_EXPLICIT_TIME_REQUIRED");
  const applicationId = deriveOwnerApplicationId(input);
  return Object.freeze({ contract: OWNER_DELIVERY_CONTRACTS.application, applicationId, ...input,
    applicationFingerprint: semanticFingerprint({ applicationId, ...input }) });
}

export function deriveOwnerApplicationId(input: Pick<ControlledOwnerV2ProgramApplication,
"userId" | "approvalId" | "previewId" | "priorPointerRevision" | "appliedAt">): string {
  return stableId("owner-v2-application", { userId: input.userId, approvalId: input.approvalId,
    previewId: input.previewId, priorPointerRevision: input.priorPointerRevision, appliedAt: input.appliedAt });
}

export function buildOwnerActiveProgramPointer(input: Omit<ControlledOwnerActiveProgramPointer,
"contract" | "pointerFingerprint">): ControlledOwnerActiveProgramPointer {
  if (!explicitIsoTime(input.updatedAt) || input.revision < 0 ||
      (input.mode === "v2_owner" && !input.activeApplicationId)) throw new Error("OWNER_POINTER_INVALID");
  return Object.freeze({ contract: OWNER_DELIVERY_CONTRACTS.activeProgramPointer, ...input,
    pointerFingerprint: semanticFingerprint(input) });
}

export function buildOwnerDeliveryAuditEvent(input: Omit<ControlledOwnerDeliveryAuditEvent,
"contract" | "eventId" | "eventFingerprint">): ControlledOwnerDeliveryAuditEvent {
  if (!explicitIsoTime(input.occurredAt)) throw new Error("OWNER_AUDIT_EXPLICIT_TIME_REQUIRED");
  const eventId = stableId("owner-v2-audit-event", input);
  return Object.freeze({ contract: OWNER_DELIVERY_CONTRACTS.auditEvent, eventId, ...input,
    eventFingerprint: semanticFingerprint({ eventId, ...input }) });
}

export function deriveOwnerPreviewStaleness(input: {
  readonly preview: ControlledOwnerV2ProgramPreview;
  readonly currentProfileRevisionId: string;
  readonly currentProductRevisionId: string;
  readonly currentLegacyProgramRevisionId: string | null;
  readonly currentEngineVersion: string;
  readonly currentPolicyVersions: readonly string[];
  readonly currentEquipmentSourceRevision: string;
  readonly previewEquipmentSourceRevision: string;
  readonly currentSafetyState: OwnerTrainingSafetyState;
  readonly deliveryMode: OwnerDeliveryMode;
}): readonly string[] {
  const reasons: string[] = [];
  if (input.deliveryMode === "off") reasons.push("OWNER_DELIVERY_MODE_OFF");
  if (input.preview.profileRevisionId !== input.currentProfileRevisionId) reasons.push("OWNER_PROFILE_REVISION_CHANGED");
  if (input.preview.sourceProductRevisionId !== input.currentProductRevisionId) reasons.push("OWNER_PRODUCT_REVISION_CHANGED");
  if (input.preview.activeLegacyProgramRevisionId !== input.currentLegacyProgramRevisionId) reasons.push("OWNER_LEGACY_PROGRAM_REVISION_CHANGED");
  if (input.preview.engineVersion !== input.currentEngineVersion) reasons.push("OWNER_ENGINE_VERSION_CHANGED");
  if (!sameSemanticValue(uniqueSorted(input.preview.policyVersions), uniqueSorted(input.currentPolicyVersions))) reasons.push("OWNER_POLICY_VERSION_CHANGED");
  if (input.previewEquipmentSourceRevision !== input.currentEquipmentSourceRevision) reasons.push("OWNER_EQUIPMENT_REVISION_CHANGED");
  if (input.preview.safetyState !== input.currentSafetyState) reasons.push("OWNER_SAFETY_STATE_CHANGED");
  return Object.freeze(uniqueSorted(reasons));
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
  "contract" | "revisionContract" | "profileId" | "revisionId" | "semanticFingerprint" | "daysPerWeek"> & {
    readonly profileId?: string;
    readonly daysPerWeek: OwnerAvailableTrainingDays;
  }): OwnerGetStrongerProfileRevision {
  if (!input.userId.trim() || !explicitIsoTime(input.createdAt) || !explicitIsoTime(input.evaluationTime)) {
    throw new Error("OWNER_PROFILE_IDENTITY_AND_EXPLICIT_TIME_REQUIRED");
  }
  if (!isOwnerAvailableTrainingDays(input.daysPerWeek) ||
      input.sessionOpportunities.length !== input.daysPerWeek ||
      input.sessionOpportunities.some((entry, index) => !entry.opportunityId.trim() || entry.order !== index + 1) ||
      new Set(input.sessionOpportunities.map((entry) => entry.opportunityId)).size !== input.sessionOpportunities.length) {
    throw new Error("OWNER_PROFILE_DAYS_OPPORTUNITIES_INVALID");
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
      ...(input.equipmentCapabilitySnapshot.availabilityConfirmations ? {
        availabilityConfirmations: Object.freeze([...input.equipmentCapabilitySnapshot.availabilityConfirmations]
          .map((entry) => Object.freeze({ ...entry, provenance: Object.freeze({ ...entry.provenance,
            sourceRefs: Object.freeze(uniqueSorted(entry.provenance.sourceRefs)) }) }))
          .sort((left, right) => left.capabilityId.localeCompare(right.capabilityId))),
      } : {}),
      ...(input.equipmentCapabilitySnapshot.loadCeilings ? {
        loadCeilings: Object.freeze([...input.equipmentCapabilitySnapshot.loadCeilings]
          .map((entry) => Object.freeze({ ...entry, provenance: Object.freeze({ ...entry.provenance,
            sourceRefs: Object.freeze(uniqueSorted(entry.provenance.sourceRefs)) }) }))
          .sort((left, right) => left.equipmentId.localeCompare(right.equipmentId))),
      } : {}),
    }),
    familiarity: Object.freeze([...input.familiarity].map((entry) => Object.freeze({ ...entry,
      ...(entry.provenance ? { provenance: Object.freeze({ ...entry.provenance,
        sourceRefs: Object.freeze(uniqueSorted(entry.provenance.sourceRefs)) }) } : {}) }))
      .sort((left, right) => left.exerciseId.localeCompare(right.exerciseId) ||
        (left.realizationId ?? "").localeCompare(right.realizationId ?? ""))),
    ...(input.prerequisiteConfirmations ? {
      prerequisiteConfirmations: Object.freeze([...input.prerequisiteConfirmations]
        .map((entry) => Object.freeze({ ...entry, provenance: Object.freeze({ ...entry.provenance,
          sourceRefs: Object.freeze(uniqueSorted(entry.provenance.sourceRefs)) }) }))
        .sort((left, right) => left.prerequisiteId.localeCompare(right.prerequisiteId))),
    } : {}),
    ...(input.loadingSuitabilityConfirmations ? {
      loadingSuitabilityConfirmations: Object.freeze([...input.loadingSuitabilityConfirmations]
        .map((entry) => Object.freeze({ ...entry, provenance: Object.freeze({ ...entry.provenance,
          sourceRefs: Object.freeze(uniqueSorted(entry.provenance.sourceRefs)) }) }))
        .sort((left, right) => left.responsibilityKey.localeCompare(right.responsibilityKey) ||
          left.exerciseId.localeCompare(right.exerciseId))),
    } : {}),
    painContext: Object.freeze({
      ...input.painContext,
      regionIds: Object.freeze(uniqueSorted(input.painContext.regionIds)),
      limitationIds: Object.freeze(uniqueSorted(input.painContext.limitationIds)),
      ...(input.painContext.sourceFactIds
        ? { sourceFactIds: Object.freeze(uniqueSorted(input.painContext.sourceFactIds)) }
        : {}),
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
  if (!isOwnerAvailableTrainingDays(profile.daysPerWeek)) {
    reasons.push("OWNER_PROFILE_AVAILABILITY_RECONFIRMATION_REQUIRED");
  }
  if (profile.sessionOpportunities.length !== profile.daysPerWeek ||
      profile.sessionOpportunities.some((entry, index) => !entry.opportunityId.trim() || entry.order !== index + 1) ||
      new Set(profile.sessionOpportunities.map((entry) => entry.opportunityId)).size !==
        profile.sessionOpportunities.length) {
    reasons.push("OWNER_PROFILE_DAYS_OPPORTUNITIES_INVALID");
  }
  if (!profile.equipmentCapabilitySnapshot.confirmed) {
    reasons.push("OWNER_PROFILE_EXACT_EQUIPMENT_REQUIRED");
  }
  if (!profile.painContext.confirmed) reasons.push("OWNER_PROFILE_PAIN_CONTEXT_CONFIRMATION_REQUIRED");
  if (profile.painContext.sourceFactIds && !profile.painContext.sourceRevision) {
    reasons.push("OWNER_PROFILE_PAIN_CONTEXT_PROVENANCE_INCOMPLETE");
  }
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
  if (!isOwnerAvailableTrainingDays(value.daysPerWeek) ||
      value.sessionOpportunities.length !== value.daysPerWeek ||
      value.sessionOpportunities.some((entry, index) => !entry.opportunityId.trim() || entry.order !== index + 1) ||
      new Set(value.sessionOpportunities.map((entry) => entry.opportunityId)).size !==
        value.sessionOpportunities.length) {
    reasons.push("OWNER_PROFILE_DAYS_OPPORTUNITIES_INVALID");
  }
  if (semanticFingerprint({ ...value, semanticFingerprint: undefined }) !== value.semanticFingerprint) {
    reasons.push("OWNER_PROFILE_FINGERPRINT_INVALID");
  }
  return Object.freeze(uniqueSorted(reasons));
}
