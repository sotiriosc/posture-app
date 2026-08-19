import { canonicalize, explicitIsoTime, stableId } from "../compiler/utilities";
import { PRESCRIPTION_PURPOSE_EVIDENCE_SNAPSHOT_CONTRACT_REFERENCE,
  type ProductionPrescriptionPurposeEvidenceSnapshot,
  type PurposeEvidenceSnapshotBuildInput } from "./contracts";

export function purposeEvidenceSemanticFingerprint(value: unknown): string {
  return stableId("purpose-evidence-fingerprint", canonicalize(value));
}

export function purposeEvidenceSessionSkeletonFingerprint(value: {
  readonly sessionIntentId: string;
  readonly assignments: readonly {
    readonly exerciseId: string;
    readonly section: string;
    readonly role: string;
    readonly satisfiedNeedIds: readonly string[];
    readonly routinePrescriptionHandoffId: string;
  }[];
}): string {
  return purposeEvidenceSemanticFingerprint({
    sessionIntentId: value.sessionIntentId,
    assignments: [...value.assignments].map((assignment) => ({
      exerciseId: assignment.exerciseId,
      section: assignment.section,
      role: assignment.role,
      satisfiedNeedIds: [...assignment.satisfiedNeedIds].sort(),
      routinePrescriptionHandoffId: assignment.routinePrescriptionHandoffId,
    })).sort((left, right) => left.routinePrescriptionHandoffId.localeCompare(
      right.routinePrescriptionHandoffId)),
  });
}

export function purposeEvidencePrescriptionHandoffFingerprint(value: {
  readonly sessionIntentId: string;
  readonly assignments: readonly {
    readonly handoffId: string;
    readonly exerciseId: string;
    readonly section: string;
    readonly role: string;
    readonly satisfiedNeedIds: readonly string[];
  }[];
}): string {
  return purposeEvidenceSemanticFingerprint({
    sessionIntentId: value.sessionIntentId,
    assignments: [...value.assignments].map((assignment) => ({
      handoffId: assignment.handoffId,
      exerciseId: assignment.exerciseId,
      section: assignment.section,
      role: assignment.role,
      satisfiedNeedIds: [...assignment.satisfiedNeedIds].sort(),
    })).sort((left, right) => left.handoffId.localeCompare(right.handoffId)),
  });
}

function canonicalRequirements(
  requirements: PurposeEvidenceSnapshotBuildInput["requirements"],
): PurposeEvidenceSnapshotBuildInput["requirements"] {
  return Object.freeze([...requirements].map((requirement) => Object.freeze({
    ...requirement,
    targetSessionNeedIds: Object.freeze([...requirement.targetSessionNeedIds].sort()),
    sourceGoalRelationships: Object.freeze([...requirement.sourceGoalRelationships]
      .map((relationship) => Object.freeze({ ...relationship,
        sourceEvidenceRefs: Object.freeze([...relationship.sourceEvidenceRefs].sort()),
      })).sort((left, right) => `${left.goal}:${left.relationship}`.localeCompare(
        `${right.goal}:${right.relationship}`))),
    sourceEvidenceRefs: Object.freeze([...requirement.sourceEvidenceRefs].sort()),
    explicitUnknowns: Object.freeze([...requirement.explicitUnknowns].sort()),
    provenance: Object.freeze({ ...requirement.provenance,
      sourceRefs: Object.freeze([...requirement.provenance.sourceRefs].sort()),
      ruleRefs: Object.freeze([...requirement.provenance.ruleRefs].sort()),
    }),
  })).sort((left, right) => left.requirementId.localeCompare(right.requirementId)));
}

export function buildProductionPrescriptionPurposeEvidenceSnapshot(
  input: PurposeEvidenceSnapshotBuildInput,
): ProductionPrescriptionPurposeEvidenceSnapshot {
  if (!explicitIsoTime(input.evaluationTime)) {
    throw new Error("PRESCRIPTION_PURPOSE_EVIDENCE_EVALUATION_TIME_REQUIRED");
  }
  if (!input.purposeResolutionAttemptId.trim()) {
    throw new Error("PRESCRIPTION_PURPOSE_RESOLUTION_ATTEMPT_ID_REQUIRED");
  }
  const requirements = canonicalRequirements(input.requirements);
  const sessionSkeletonFingerprint = purposeEvidenceSessionSkeletonFingerprint(input.sessionSkeleton as
    Parameters<typeof purposeEvidenceSessionSkeletonFingerprint>[0]);
  const prescriptionHandoffFingerprint = purposeEvidencePrescriptionHandoffFingerprint(
    input.prescriptionHandoff as Parameters<typeof purposeEvidencePrescriptionHandoffFingerprint>[0]);
  const snapshotId = stableId("prescription-purpose-evidence", {
    athleteId: input.athleteId,
    sessionIntentId: input.sessionIntentId,
    sessionSkeletonFingerprint,
    prescriptionHandoffFingerprint,
    sourceKind: input.sourceKind,
    weeklyIntent: input.weeklyIntent,
    weekPlan: input.weekPlan,
    purposeResolutionAttemptId: input.purposeResolutionAttemptId,
  });
  const snapshotRevisionId = stableId("prescription-purpose-evidence-revision", {
    snapshotId,
    requirements,
    excludedRequirements: input.excludedRequirements,
    conflicts: [...input.conflicts].sort(),
    unresolvedLineage: [...input.unresolvedLineage].sort(),
    sourceRevisions: { weeklyIntent: input.weeklyIntent, weekPlan: input.weekPlan },
    resolverPolicyReference: input.resolverPolicyReference,
    evaluationTime: input.evaluationTime,
    basedOnRevisionId: input.basedOnRevisionId ?? null,
  });
  return Object.freeze({
    contractReference: PRESCRIPTION_PURPOSE_EVIDENCE_SNAPSHOT_CONTRACT_REFERENCE,
    snapshotId,
    snapshotRevisionId,
    basedOnRevisionId: input.basedOnRevisionId ?? null,
    purposeResolutionAttemptId: input.purposeResolutionAttemptId,
    resolverPolicyReference: input.resolverPolicyReference,
    athleteId: input.athleteId,
    sessionIntentId: input.sessionIntentId,
    sessionSkeletonFingerprint,
    prescriptionHandoffFingerprint,
    sourceKind: input.sourceKind,
    weeklyIntent: input.weeklyIntent,
    weekPlan: input.weekPlan,
    requirements,
    excludedRequirements: Object.freeze([...input.excludedRequirements]
      .sort((left, right) => left.requirementId.localeCompare(right.requirementId))),
    conflicts: Object.freeze([...input.conflicts].sort()),
    unresolvedLineage: Object.freeze([...input.unresolvedLineage].sort()),
    evaluationTime: input.evaluationTime,
    provenance: input.provenance,
  });
}
