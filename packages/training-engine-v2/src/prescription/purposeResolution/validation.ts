import { PROGRAMMING_CONTEXT_MODES, TRAINING_OUTCOME_GOALS } from
  "../../domain/sessionPlanningDirective";
import { SESSION_NEED_PRIORITIES, SESSION_SECTIONS } from "../../domain/session";
import { PRODUCT_TRAINING_GOAL_ARCHITECTURE_POLICY_REFERENCE } from
  "../../productGoalArchitecture/contracts";
import { PRESCRIPTION_PURPOSE_EVIDENCE_SNAPSHOT_CONTRACT_REFERENCE,
  PURPOSE_FIRST_PRESCRIPTION_RESOLVER_CONTRACT_REFERENCE,
  type ProductionPrescriptionPurposeEvidenceSnapshot,
  type ProductionPrescriptionPurposeRequirement,
  type ProductionPrescriptionPurposeResolverPolicy } from "./contracts";
import { PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1_REFERENCE } from "./policy";
import { stableId } from "../compiler/utilities";
import { PRESCRIPTION_LOCAL_PURPOSES, PRESCRIPTION_PURPOSE_AUTHORITIES,
  PRESCRIPTION_PURPOSE_RESOLVER_FAIL_STOP_ORDER, PRESCRIPTION_PURPOSE_SOURCE_KINDS } from "./vocabularies";

export function validateProductionPrescriptionPurposeRequirement(
  value: ProductionPrescriptionPurposeRequirement,
): readonly string[] {
  const reasons: string[] = [];
  if (!value.requirementId || !value.athleteId || !value.targetSessionIntentId ||
      !value.targetAssignmentHandoffId) reasons.push("PURPOSE_REQUIREMENT_IDENTITY_REQUIRED");
  if (value.targetSessionNeedIds.length === 0) reasons.push("PURPOSE_REQUIREMENT_NEED_LINEAGE_REQUIRED");
  if (!PRESCRIPTION_PURPOSE_SOURCE_KINDS.includes(value.sourceKind)) reasons.push("PURPOSE_SOURCE_KIND_INVALID");
  if (!PRESCRIPTION_LOCAL_PURPOSES.includes(value.localPurpose)) reasons.push("LOCAL_PURPOSE_INVALID");
  if (!PRESCRIPTION_PURPOSE_AUTHORITIES.includes(value.purposeAuthority)) reasons.push("PURPOSE_AUTHORITY_INVALID");
  if (!SESSION_NEED_PRIORITIES.includes(value.priority)) reasons.push("PURPOSE_PRIORITY_INVALID");
  if (!SESSION_SECTIONS.includes(value.section) || value.priorityOrder < 0) reasons.push("PURPOSE_PLACEMENT_INVALID");
  if (value.sourceGoalRelationships.some((entry) => !TRAINING_OUTCOME_GOALS.includes(entry.goal))) {
    reasons.push("PURPOSE_GOAL_RELATIONSHIP_INVALID");
  }
  if (value.localPurpose === "unknown" && value.reviewState !== "unknown") {
    reasons.push("UNKNOWN_PURPOSE_MUST_REMAIN_UNREVIEWED");
  }
  return Object.freeze([...new Set(reasons)].sort());
}

export function validateProductionPrescriptionPurposeEvidenceSnapshot(
  snapshot: ProductionPrescriptionPurposeEvidenceSnapshot,
): readonly string[] {
  const reasons: string[] = [];
  if (snapshot.contractReference !== PRESCRIPTION_PURPOSE_EVIDENCE_SNAPSHOT_CONTRACT_REFERENCE) {
    reasons.push("PURPOSE_EVIDENCE_SNAPSHOT_CONTRACT_UNSUPPORTED");
  }
  if (!snapshot.snapshotId || !snapshot.snapshotRevisionId || !snapshot.athleteId ||
      !snapshot.sessionIntentId || !snapshot.sessionSkeletonFingerprint ||
      !snapshot.prescriptionHandoffFingerprint || !snapshot.purposeResolutionAttemptId) {
    reasons.push("PURPOSE_EVIDENCE_SNAPSHOT_IDENTITY_INVALID");
  }
  if (!/(?:Z|[+-]\d{2}:\d{2})$/.test(snapshot.evaluationTime) ||
      Number.isNaN(Date.parse(snapshot.evaluationTime))) reasons.push("PURPOSE_EVIDENCE_EVALUATION_TIME_INVALID");
  if (snapshot.resolverPolicyReference !== PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1_REFERENCE) {
    reasons.push("PURPOSE_EVIDENCE_RESOLVER_POLICY_REFERENCE_UNAVAILABLE");
  }
  for (const requirement of snapshot.requirements) {
    reasons.push(...validateProductionPrescriptionPurposeRequirement(requirement));
    if (requirement.athleteId !== snapshot.athleteId ||
        requirement.targetSessionIntentId !== snapshot.sessionIntentId) {
      reasons.push("PURPOSE_REQUIREMENT_SNAPSHOT_LINEAGE_INVALID");
    }
  }
  if (new Set(snapshot.requirements.map((entry) => entry.requirementId)).size !==
      snapshot.requirements.length) reasons.push("DUPLICATE_PURPOSE_REQUIREMENT_ID");
  const expectedSnapshotId = stableId("prescription-purpose-evidence", {
    athleteId: snapshot.athleteId,
    sessionIntentId: snapshot.sessionIntentId,
    sessionSkeletonFingerprint: snapshot.sessionSkeletonFingerprint,
    prescriptionHandoffFingerprint: snapshot.prescriptionHandoffFingerprint,
    sourceKind: snapshot.sourceKind,
    weeklyIntent: snapshot.weeklyIntent,
    weekPlan: snapshot.weekPlan,
    purposeResolutionAttemptId: snapshot.purposeResolutionAttemptId,
  });
  if (snapshot.snapshotId !== expectedSnapshotId) reasons.push("PURPOSE_EVIDENCE_SNAPSHOT_IDENTITY_STALE");
  const expectedRevisionId = stableId("prescription-purpose-evidence-revision", {
    snapshotId: snapshot.snapshotId,
    requirements: snapshot.requirements,
    excludedRequirements: snapshot.excludedRequirements,
    conflicts: [...snapshot.conflicts].sort(),
    unresolvedLineage: [...snapshot.unresolvedLineage].sort(),
    sourceRevisions: { weeklyIntent: snapshot.weeklyIntent, weekPlan: snapshot.weekPlan },
    resolverPolicyReference: snapshot.resolverPolicyReference,
    evaluationTime: snapshot.evaluationTime,
    basedOnRevisionId: snapshot.basedOnRevisionId,
  });
  if (snapshot.snapshotRevisionId !== expectedRevisionId) {
    reasons.push("PURPOSE_EVIDENCE_SNAPSHOT_REVISION_STALE");
  }
  if (snapshot.sourceKind === "legacy_compatibility_restricted" && snapshot.requirements.some((entry) =>
    entry.purposeAuthority === "primary_local_purpose" ||
    entry.purposeAuthority === "secondary_local_purpose")) {
    reasons.push("LEGACY_RESTRICTED_SOURCE_CANNOT_AUTHORIZE_DEVELOPMENTAL_PURPOSE");
  }
  return Object.freeze([...new Set(reasons)].sort());
}

export function validateProductionPrescriptionPurposeResolverPolicy(
  policy: ProductionPrescriptionPurposeResolverPolicy,
): readonly string[] {
  const reasons: string[] = [];
  if (policy.reference !== PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1_REFERENCE ||
      policy.ownerArchitecturePolicyReference !== PRODUCT_TRAINING_GOAL_ARCHITECTURE_POLICY_REFERENCE) {
    reasons.push("PURPOSE_RESOLVER_POLICY_REFERENCE_INVALID");
  }
  if (policy.state !== "OWNER_SELECTED_RESOLUTION_POLICY_IMPLEMENTED_NOT_ACTIVATED" ||
      policy.activationAuthorized !== false || policy.numericDoseValuesOwned !== false) {
    reasons.push("PURPOSE_RESOLVER_POLICY_ACTIVATION_OR_NUMERIC_OWNERSHIP_INVALID");
  }
  if (JSON.stringify(policy.resolutionOrder) !== JSON.stringify(PRESCRIPTION_PURPOSE_RESOLVER_FAIL_STOP_ORDER)) {
    reasons.push("PURPOSE_RESOLVER_G4_ORDER_INVALID");
  }
  if (!policy.noBroadFallback || policy.conflictBehavior !== "fail_closed" ||
      policy.missingPurposeBehavior !== "fail_closed") reasons.push("PURPOSE_RESOLVER_G1_FAIL_CLOSED_INVALID");
  if (policy.supportedMappings.some((mapping) => mapping.localPurpose === "movement_quality_development" ||
      mapping.localPurpose === "muscular_endurance_development" ||
      mapping.localPurpose === "systemic_conditioning_development" ||
      mapping.localPurpose === "power_development")) reasons.push("B3_PURPOSE_POLICY_PREMATURELY_ADMITTED");
  if (new Set(policy.supportedMappings.map((mapping) => mapping.mappingId)).size !==
      policy.supportedMappings.length) reasons.push("PURPOSE_RESOLVER_MAPPING_ID_CONFLICT");
  if (policy.supportedMappings.some((mapping) => !PRESCRIPTION_LOCAL_PURPOSES.includes(mapping.localPurpose) ||
      mapping.sections.length === 0 || mapping.roles.length === 0 || mapping.doseModes.length === 0 ||
      mapping.useCases.length === 0)) reasons.push("PURPOSE_RESOLVER_MAPPING_INVALID");
  return Object.freeze([...new Set(reasons)].sort());
}

export const PURPOSE_FIRST_RESOLVER_STATIC_BOUNDARIES = Object.freeze({
  resolverContract: PURPOSE_FIRST_PRESCRIPTION_RESOLVER_CONTRACT_REFERENCE,
  outcomeGoals: TRAINING_OUTCOME_GOALS,
  programmingContexts: PROGRAMMING_CONTEXT_MODES,
  toningCanonical: false,
  bodyCompositionOwner: "outside_prescription_purpose_resolver",
  nutritionOwner: "outside_prescription_purpose_resolver",
  productActivationAuthorized: false,
});
