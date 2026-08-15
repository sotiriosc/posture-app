import type { SessionAllocationDirective } from "../../domain/sessionPlanningDirective";
import type { SessionIntent } from "../../domain/session";
import type { SessionPrescriptionHandoff, SessionSkeleton } from "../../sessionComposer/contracts";
import type { ProductionSessionAllocationReservation, ProductionWeeklyDevelopmentObjective,
  ProductionWeeklyIntent } from "../../weekPlanning/contracts";
import { stableId, uniqueSorted } from "../compiler/utilities";
import { buildProductionPrescriptionPurposeEvidenceSnapshot } from "./evidenceSnapshot";
import type { ProductionPrescriptionPurposeEvidenceSnapshot,
  ProductionPrescriptionPurposeRequirement } from "./contracts";
import type { PrescriptionLocalPurpose, PrescriptionPurposeAuthority } from "./vocabularies";

export interface ProductionWeekPurposeProjectionInput {
  readonly weeklyIntent: ProductionWeeklyIntent;
  readonly reservation: ProductionSessionAllocationReservation;
  readonly materializedDirective: SessionAllocationDirective;
  readonly sessionIntent: SessionIntent;
  readonly sessionSkeleton: SessionSkeleton;
  readonly prescriptionHandoff: SessionPrescriptionHandoff;
  readonly evaluationTime: string;
  readonly purposeResolutionAttemptId: string;
  readonly resolverPolicyReference: string;
  readonly basedOnRevisionId?: string | null;
}

function localPurpose(
  objective: ProductionWeeklyDevelopmentObjective,
  responsibilityPurpose: ProductionSessionAllocationReservation["allocatedObjectives"][number]["purpose"],
): PrescriptionLocalPurpose {
  if (responsibilityPurpose === "explicit_preparation") return "preparation";
  if (responsibilityPurpose === "activation") return "activation";
  if (responsibilityPurpose === "recovery") return "recovery";
  if (objective.family === "strength") return "strength_development";
  if (objective.family === "muscle") return "hypertrophy_development";
  if (objective.family === "direct") return "direct_development";
  if (objective.family === "capacity") return "capacity_development";
  if (objective.family === "assessment") return "technique_or_control";
  return "unknown";
}

function purposeAuthority(
  objective: ProductionWeeklyDevelopmentObjective,
  responsibilityPurpose: ProductionSessionAllocationReservation["allocatedObjectives"][number]["purpose"],
): PrescriptionPurposeAuthority {
  if (["explicit_preparation", "activation", "recovery"].includes(responsibilityPurpose)) {
    return "dependency_support";
  }
  if (objective.goalRelationships.some((entry) => entry.relationship === "primary_weekly_goal")) {
    return "primary_local_purpose";
  }
  if (objective.goalRelationships.some((entry) => entry.relationship === "secondary_weekly_goal")) {
    return "secondary_local_purpose";
  }
  if (objective.goalRelationships.some((entry) => entry.relationship === "cross_goal_support")) {
    return "cross_goal_support";
  }
  return "unknown";
}

export function buildProductionWeekPrescriptionPurposeEvidenceSnapshot(
  input: ProductionWeekPurposeProjectionInput,
): ProductionPrescriptionPurposeEvidenceSnapshot {
  const unresolved: string[] = [];
  if (input.weeklyIntent.intentId !== input.reservation.weeklyIntentId ||
      input.weeklyIntent.intentRevisionId !== input.reservation.weeklyIntentRevisionId) {
    unresolved.push("WEEKLY_INTENT_RESERVATION_REVISION_MISMATCH");
  }
  if (input.weeklyIntent.athleteId !== input.reservation.athleteId ||
      input.reservation.athleteId !== input.materializedDirective.athleteId ||
      input.sessionIntent.athleteId !== input.reservation.athleteId) {
    unresolved.push("PURPOSE_LINEAGE_ATHLETE_MISMATCH");
  }
  if (input.sessionSkeleton.sessionIntentId !== input.sessionIntent.id ||
      input.prescriptionHandoff.sessionIntentId !== input.sessionIntent.id) {
    unresolved.push("PURPOSE_LINEAGE_SESSION_INTENT_MISMATCH");
  }
  const requirements: ProductionPrescriptionPurposeRequirement[] = [];
  const excluded: Array<{ requirementId: string; reasonCodes: readonly string[] }> = [];
  for (const assignment of input.prescriptionHandoff.assignments) {
    const skeletonAssignment = input.sessionSkeleton.assignments.find((entry) =>
      entry.routinePrescriptionHandoffId === assignment.handoffId);
    if (!skeletonAssignment) {
      unresolved.push(`PURPOSE_LINEAGE_SKELETON_ASSIGNMENT_MISSING:${assignment.handoffId}`);
      continue;
    }
    for (const needId of assignment.satisfiedNeedIds) {
      const need = input.sessionIntent.needs.find((entry) => entry.id === needId);
      if (!need) {
        unresolved.push(`PURPOSE_LINEAGE_SESSION_NEED_MISSING:${needId}`);
        continue;
      }
      for (const responsibilityId of need.plannerProvenance?.objectiveIds ?? []) {
        const reserved = input.reservation.allocatedObjectives.find((entry) =>
          entry.responsibilityId === responsibilityId);
        const directiveObjective = input.materializedDirective.allocatedObjectives.find((entry) =>
          entry.id === responsibilityId);
        const objective = reserved ? input.weeklyIntent.objectives.find((entry) =>
          entry.objectiveId === reserved.weeklyObjectiveId) : null;
        const requirementId = stableId("week-prescription-purpose-requirement", {
          assignmentHandoffId: assignment.handoffId, needId, responsibilityId,
          weeklyObjectiveId: reserved?.weeklyObjectiveId ?? null,
        });
        const reasons: string[] = [];
        if (!reserved) reasons.push("RESERVED_RESPONSIBILITY_NOT_FOUND");
        if (!directiveObjective) reasons.push("MATERIALIZED_OBJECTIVE_NOT_FOUND");
        if (!objective) reasons.push("SOURCE_WEEKLY_OBJECTIVE_NOT_FOUND");
        if (directiveObjective && reserved && !directiveObjective.sourceEvidence.some((entry) =>
          entry.sourceId === reserved.weeklyObjectiveId)) reasons.push("OBJECTIVE_SOURCE_ID_LINEAGE_INVALID");
        if (assignment.section !== need.section || assignment.role !== need.selection.requestedRole) {
          reasons.push("NEED_ASSIGNMENT_ROLE_SECTION_LINEAGE_INVALID");
        }
        if (reasons.length > 0 || !reserved || !objective) {
          excluded.push({ requirementId, reasonCodes: Object.freeze(reasons.sort()) });
          unresolved.push(...reasons.map((reason) => `${reason}:${requirementId}`));
          continue;
        }
        requirements.push(Object.freeze({
          requirementId,
          athleteId: input.reservation.athleteId,
          targetSessionIntentId: input.sessionIntent.id,
          targetSessionNeedIds: Object.freeze([needId]),
          targetAssignmentHandoffId: assignment.handoffId,
          sourceKind: "production_week_objective_lineage",
          sourceWeeklyIntent: Object.freeze({ intentId: input.weeklyIntent.intentId,
            intentRevisionId: input.weeklyIntent.intentRevisionId }),
          sourceWeekPlan: Object.freeze({ weekPlanId: input.reservation.weekPlanId,
            weekPlanRevisionId: input.reservation.weekPlanRevisionId,
            reservationId: input.reservation.reservationId,
            reservationRevisionId: input.reservation.reservationRevisionId }),
          sourceWeeklyObjectiveId: objective.objectiveId,
          sourceObjectiveFamily: objective.family,
          sourceObjectivePurpose: objective.purpose,
          sourceGoalRelationships: objective.goalRelationships,
          localPurpose: localPurpose(objective, reserved.purpose),
          purposeAuthority: purposeAuthority(objective, reserved.purpose),
          priority: reserved.sessionLocalPriority,
          priorityOrder: reserved.priorityOrder,
          section: assignment.section,
          role: assignment.role,
          expectedDoseModeLane: null,
          sourceEvidenceRefs: Object.freeze(uniqueSorted([
            ...reserved.sourceEvidenceRefs,
            ...objective.sourceEvidence.flatMap((entry) => [entry.sourceId, ...entry.evidenceRefs]),
          ])),
          reviewState: reserved.purpose === "explicit_preparation" || reserved.purpose === "activation" ||
            reserved.purpose === "recovery" ? "dependency_validated" : "policy_reviewed",
          explicitUnknowns: Object.freeze([]),
          provenance: Object.freeze({ owner: "production_week_purpose_projection",
            sourceRefs: Object.freeze([input.weeklyIntent.intentRevisionId,
              input.reservation.reservationRevisionId, objective.objectiveId, needId, assignment.handoffId]),
            ruleRefs: Object.freeze(["WEEK_OBJECTIVE_TO_RESERVED_RESPONSIBILITY_TO_NEED_TO_ASSIGNMENT"]) }),
        }));
      }
    }
  }
  return buildProductionPrescriptionPurposeEvidenceSnapshot({
    athleteId: input.reservation.athleteId,
    sessionIntentId: input.sessionIntent.id,
    sessionSkeleton: input.sessionSkeleton,
    prescriptionHandoff: input.prescriptionHandoff,
    sourceKind: "production_week_objective_lineage",
    weeklyIntent: { intentId: input.weeklyIntent.intentId,
      intentRevisionId: input.weeklyIntent.intentRevisionId },
    weekPlan: { weekPlanId: input.reservation.weekPlanId,
      weekPlanRevisionId: input.reservation.weekPlanRevisionId,
      reservationId: input.reservation.reservationId,
      reservationRevisionId: input.reservation.reservationRevisionId },
    requirements,
    excludedRequirements: excluded,
    conflicts: [],
    unresolvedLineage: uniqueSorted(unresolved),
    evaluationTime: input.evaluationTime,
    purposeResolutionAttemptId: input.purposeResolutionAttemptId,
    resolverPolicyReference: input.resolverPolicyReference,
    basedOnRevisionId: input.basedOnRevisionId,
    provenance: { owner: "production_week_purpose_projection",
      sourceRefs: [input.weeklyIntent.intentRevisionId, input.reservation.reservationRevisionId,
        input.materializedDirective.id, input.sessionIntent.id],
      ruleRefs: ["EXACT_ID_LINEAGE_NO_PROSE_PARSING"] },
  });
}
