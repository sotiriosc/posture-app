import { describe, expect, it } from "vitest";
import {
  EXPLICIT_STANDALONE_PRESCRIPTION_PURPOSE_SOURCE_CONTRACT_REFERENCE,
  PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1_REFERENCE,
  REFERENCE_EXERCISES,
  buildExplicitStandalonePrescriptionPurposeEvidenceSnapshot,
  buildProductionPrescriptionPurposeEvidenceSnapshot,
  buildProductionWeekPrescriptionPurposeEvidenceSnapshot,
  materializeSessionAllocation,
  validateProductionPrescriptionPurposeEvidenceSnapshot,
} from "../../src";
import { buildPurposeFirstCatalogFixture,
  PURPOSE_FIRST_TEST_TIME } from "../cagt/purposeFirstPrescriptionResolverFixtures";
import { productionMaterializationInput, productionWeekPlan,
  productionWeeklyIntent } from "../helpers/productionWeekPlanningFixtures";

describe("Purpose evidence snapshot and source projections", () => {
  it("builds deterministic, order-invariant snapshot revisions with no hidden clock", () => {
    const fixture = buildPurposeFirstCatalogFixture(REFERENCE_EXERCISES[3]);
    const requirement = fixture.purposeEvidenceSnapshot.requirements[0]!;
    const second = { ...requirement, requirementId: "snapshot:second",
      purposeAuthority: "cross_goal_support" as const, priority: "optional" as const, priorityOrder: 1 };
    const build = (requirements: readonly typeof requirement[]) =>
      buildProductionPrescriptionPurposeEvidenceSnapshot({
        athleteId: fixture.athlete.id, sessionIntentId: fixture.sessionIntent.id,
        sessionSkeleton: fixture.sessionSkeleton, prescriptionHandoff: fixture.handoff,
        sourceKind: "explicit_standalone_purpose", weeklyIntent: null, weekPlan: null,
        requirements, excludedRequirements: [], conflicts: [], unresolvedLineage: [],
        evaluationTime: PURPOSE_FIRST_TEST_TIME,
        purposeResolutionAttemptId: fixture.purposeResolutionAttemptId,
        resolverPolicyReference: PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1_REFERENCE,
        provenance: fixture.purposeEvidenceSnapshot.provenance,
      });
    const left = build([requirement, second]);
    const right = build([second, requirement]);
    expect(left).toEqual(right);
    expect(validateProductionPrescriptionPurposeEvidenceSnapshot(left)).toEqual([]);
  });

  it("accepts an explicit standalone owner declaration and rejects undeclared purpose", () => {
    const fixture = buildPurposeFirstCatalogFixture(REFERENCE_EXERCISES[3]);
    const assignment = fixture.handoff.assignments[0]!;
    const source = {
      contractReference: EXPLICIT_STANDALONE_PRESCRIPTION_PURPOSE_SOURCE_CONTRACT_REFERENCE,
      sourceId: "standalone:strength", owner: "reviewed-standalone-brief",
      athleteId: fixture.athlete.id, outcomeGoal: "strength" as const,
      localPurpose: "strength_development" as const,
      purposeAuthority: "primary_local_purpose" as const,
      targetSessionIntentId: fixture.sessionIntent.id, targetObjectiveIds: ["standalone-objective"],
      targetSessionNeedIds: assignment.satisfiedNeedIds,
      targetAssignmentHandoffId: assignment.handoffId,
      priority: "required" as const, priorityOrder: 0, section: assignment.section, role: assignment.role,
      expectedDoseModeLane: "repetition_sets" as const, evidenceRefs: ["standalone-owner-review"],
      reviewState: "owner_reviewed" as const, explicitUnknowns: [],
      provenance: { owner: "explicit_standalone_purpose_owner" as const,
        sourceRefs: ["standalone:strength"], ruleRefs: ["OWNER_DECLARATION"] },
    };
    const snapshot = buildExplicitStandalonePrescriptionPurposeEvidenceSnapshot({
      source, sessionIntent: fixture.sessionIntent, sessionSkeleton: fixture.sessionSkeleton,
      prescriptionHandoff: fixture.handoff, evaluationTime: PURPOSE_FIRST_TEST_TIME,
      purposeResolutionAttemptId: "standalone-attempt",
      resolverPolicyReference: PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1_REFERENCE,
    });
    expect(snapshot.requirements).toHaveLength(1);
    expect(snapshot.requirements[0]?.localPurpose).toBe("strength_development");
    const missing = buildExplicitStandalonePrescriptionPurposeEvidenceSnapshot({
      source: { ...source, localPurpose: "unknown", reviewState: "unknown" },
      sessionIntent: fixture.sessionIntent, sessionSkeleton: fixture.sessionSkeleton,
      prescriptionHandoff: fixture.handoff, evaluationTime: PURPOSE_FIRST_TEST_TIME,
      purposeResolutionAttemptId: "standalone-missing-attempt",
      resolverPolicyReference: PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1_REFERENCE,
    });
    expect(missing.requirements).toHaveLength(0);
    expect(missing.unresolvedLineage).toContain("STANDALONE_PURPOSE_DECLARATION_REQUIRED");
  });

  it("reconstructs exact Week objective to responsibility to need to assignment lineage", () => {
    const weeklyIntent = productionWeeklyIntent();
    const plan = productionWeekPlan({ intent: weeklyIntent });
    const reservation = plan.reservations[0]!;
    const materialized = materializeSessionAllocation(productionMaterializationInput(plan));
    expect(materialized.status).toBe("directive_materialized");
    const directive = materialized.directive!;
    const fixture = buildPurposeFirstCatalogFixture(REFERENCE_EXERCISES[3]);
    const responsibilityId = reservation.allocatedObjectives[0]!.responsibilityId;
    const sessionIntent = {
      ...fixture.sessionIntent,
      athleteId: reservation.athleteId,
      needs: fixture.sessionIntent.needs.map((need) => ({ ...need,
        plannerProvenance: { objectiveIds: [responsibilityId], owner: "production_session_intent_planner",
          transformationRuleId: "ALLOCATED_OBJECTIVE_TO_SESSION_NEED",
          sourceEvidenceRefs: [responsibilityId], assessmentSignalRefs: [], dependencyRefs: [],
          mergeHistory: [], priorityOrigin: "allocated_objective",
          sectionRoleMappingOrigin: "fixed_objective_kind_mapping",
          standaloneAdmissionOrigin: "allocation_policy", unknowns: [] } })),
    };
    const snapshot = buildProductionWeekPrescriptionPurposeEvidenceSnapshot({
      weeklyIntent, reservation, materializedDirective: directive, sessionIntent,
      sessionSkeleton: fixture.sessionSkeleton, prescriptionHandoff: fixture.handoff,
      evaluationTime: PURPOSE_FIRST_TEST_TIME, purposeResolutionAttemptId: "week-projection-attempt",
      resolverPolicyReference: PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1_REFERENCE,
    });
    expect(snapshot.unresolvedLineage).toEqual([]);
    expect(snapshot.requirements).toHaveLength(1);
    expect(snapshot.requirements[0]).toMatchObject({
      sourceWeeklyObjectiveId: reservation.allocatedObjectives[0]!.weeklyObjectiveId,
      targetSessionNeedIds: fixture.handoff.assignments[0]!.satisfiedNeedIds,
      targetAssignmentHandoffId: fixture.handoff.assignments[0]!.handoffId,
      localPurpose: "strength_development",
      purposeAuthority: "primary_local_purpose",
    });
  });
});
