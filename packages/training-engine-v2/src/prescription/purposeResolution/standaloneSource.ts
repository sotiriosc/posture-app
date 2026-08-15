import type { SessionIntent } from "../../domain/session";
import type { SessionPrescriptionHandoff, SessionSkeleton } from "../../sessionComposer/contracts";
import { stableId } from "../compiler/utilities";
import { buildProductionPrescriptionPurposeEvidenceSnapshot } from "./evidenceSnapshot";
import type { ExplicitStandalonePrescriptionPurposeSource,
  ProductionPrescriptionPurposeEvidenceSnapshot,
  ProductionPrescriptionPurposeRequirement } from "./contracts";

export interface ExplicitStandalonePurposeSnapshotInput {
  readonly source: ExplicitStandalonePrescriptionPurposeSource;
  readonly sessionIntent: SessionIntent;
  readonly sessionSkeleton: SessionSkeleton;
  readonly prescriptionHandoff: SessionPrescriptionHandoff;
  readonly evaluationTime: string;
  readonly purposeResolutionAttemptId: string;
  readonly resolverPolicyReference: string;
  readonly basedOnRevisionId?: string | null;
}

export function buildExplicitStandalonePrescriptionPurposeEvidenceSnapshot(
  input: ExplicitStandalonePurposeSnapshotInput,
): ProductionPrescriptionPurposeEvidenceSnapshot {
  const source = input.source;
  const reasons: string[] = [];
  if (source.athleteId !== input.sessionIntent.athleteId) reasons.push("STANDALONE_PURPOSE_ATHLETE_MISMATCH");
  if (source.targetSessionIntentId !== input.sessionIntent.id ||
      input.sessionSkeleton.sessionIntentId !== input.sessionIntent.id ||
      input.prescriptionHandoff.sessionIntentId !== input.sessionIntent.id) {
    reasons.push("STANDALONE_PURPOSE_SESSION_INTENT_LINEAGE_INVALID");
  }
  const assignment = input.prescriptionHandoff.assignments.find((entry) =>
    entry.handoffId === source.targetAssignmentHandoffId);
  const skeletonAssignment = input.sessionSkeleton.assignments.find((entry) =>
    entry.routinePrescriptionHandoffId === source.targetAssignmentHandoffId);
  if (!assignment || !skeletonAssignment) reasons.push("STANDALONE_PURPOSE_ASSIGNMENT_NOT_FOUND");
  if (assignment && (assignment.section !== source.section || assignment.role !== source.role)) {
    reasons.push("STANDALONE_PURPOSE_ROLE_SECTION_MISMATCH");
  }
  if (assignment && source.targetSessionNeedIds.some((id) => !assignment.satisfiedNeedIds.includes(id))) {
    reasons.push("STANDALONE_PURPOSE_NEED_LINEAGE_INVALID");
  }
  if (source.reviewState === "unknown" || source.reviewState === "rejected" ||
      source.localPurpose === "unknown") reasons.push("STANDALONE_PURPOSE_DECLARATION_REQUIRED");
  const requirement: ProductionPrescriptionPurposeRequirement = Object.freeze({
    requirementId: stableId("standalone-prescription-purpose-requirement", {
      sourceId: source.sourceId, targetAssignmentHandoffId: source.targetAssignmentHandoffId,
      localPurpose: source.localPurpose, authority: source.purposeAuthority,
    }),
    athleteId: source.athleteId,
    targetSessionIntentId: source.targetSessionIntentId,
    targetSessionNeedIds: Object.freeze([...source.targetSessionNeedIds].sort()),
    targetAssignmentHandoffId: source.targetAssignmentHandoffId,
    sourceKind: "explicit_standalone_purpose",
    sourceWeeklyIntent: null,
    sourceWeekPlan: null,
    sourceWeeklyObjectiveId: null,
    sourceObjectiveFamily: null,
    sourceObjectivePurpose: null,
    sourceGoalRelationships: Object.freeze([{
      goal: source.outcomeGoal,
      relationship: source.purposeAuthority === "secondary_local_purpose" ?
        "secondary_weekly_goal" as const : source.purposeAuthority === "cross_goal_support" ?
          "cross_goal_support" as const : "primary_weekly_goal" as const,
      sourceEvidenceRefs: source.evidenceRefs,
    }]),
    localPurpose: source.localPurpose,
    purposeAuthority: source.purposeAuthority,
    priority: source.priority,
    priorityOrder: source.priorityOrder,
    section: source.section,
    role: source.role,
    expectedDoseModeLane: source.expectedDoseModeLane,
    sourceEvidenceRefs: Object.freeze([...source.evidenceRefs].sort()),
    reviewState: source.reviewState,
    explicitUnknowns: source.explicitUnknowns,
    provenance: source.provenance,
  });
  return buildProductionPrescriptionPurposeEvidenceSnapshot({
    athleteId: source.athleteId,
    sessionIntentId: source.targetSessionIntentId,
    sessionSkeleton: input.sessionSkeleton,
    prescriptionHandoff: input.prescriptionHandoff,
    sourceKind: "explicit_standalone_purpose",
    weeklyIntent: null,
    weekPlan: null,
    requirements: reasons.length === 0 ? [requirement] : [],
    excludedRequirements: reasons.length === 0 ? [] : [{
      requirementId: requirement.requirementId,
      reasonCodes: Object.freeze([...reasons].sort()),
    }],
    conflicts: [],
    unresolvedLineage: reasons,
    evaluationTime: input.evaluationTime,
    purposeResolutionAttemptId: input.purposeResolutionAttemptId,
    resolverPolicyReference: input.resolverPolicyReference,
    basedOnRevisionId: input.basedOnRevisionId,
    provenance: source.provenance,
  });
}
