import { buildTrainingReadinessTrace, type TrainingSafetyState } from "../domain/trainingSafety";
import type { MovementRole } from "../domain/primitives";
import { PRODUCT_GET_STRONGER_DEVELOP_WEEKLY_RESPONSIBILITY_POLICY_REFERENCE } from
  "../productGoalArchitecture/getStrongerDevelopWeeklyPolicyV1";
import {
  canonicalWeekFingerprint,
  type ProductionSessionFeasibilityOracle,
  type ProductionSessionFeasibilityOracleInput,
  type ProductionWeekAllocationPlan,
  type ProductionWeekSearchResourcePolicy,
  type ProductionWeekTopologyPolicy,
  type ProductionWeeklyIntent,
} from "../weekPlanning";

export const OWNER_GET_STRONGER_TOPOLOGY_POLICY_REFERENCE = Object.freeze({
  policyId: "CONTROLLED_OWNER_GET_STRONGER_TOPOLOGY_POLICY",
  version: "2.0.0",
} as const);

export const OWNER_WEEK_TOPOLOGY_SEARCH_POLICY: ProductionWeekSearchResourcePolicy = Object.freeze({
  policyId: "CONTROLLED_OWNER_WEEK_EXACT_TOPOLOGY_SEARCH",
  version: "1.0.0",
  mode: "exact_only",
  maximumExpandedStates: 300_000,
  maximumCompletePlansEvaluated: 250_000,
  maximumParetoStatesRetained: 250_000,
  onLimit: "RETURN_SEARCH_INCONCLUSIVE",
  provenance: Object.freeze({ owner: "week_allocation_composer",
    sourceRefs: Object.freeze(["controlled-owner:get-stronger:exact-topology-search"]),
    ruleRefs: Object.freeze(["EXACT_ONLY", "NO_BEST_SO_FAR_APPLICATION"]) }),
});

function isProductPolicyObjective(objective: ProductionWeeklyIntent["objectives"][number]): boolean {
  return objective.executionRequirements?.provenance.policyRef ===
    PRODUCT_GET_STRONGER_DEVELOP_WEEKLY_RESPONSIBILITY_POLICY_REFERENCE;
}

function coherenceGroupId(objective: ProductionWeeklyIntent["objectives"][number]): string {
  const roles = new Set(objective.target.targetMovementRoles);
  const lowerRoles: readonly MovementRole[] = ["squat", "knee_dominant", "hinge", "single_leg"];
  const upperRoles: readonly MovementRole[] = ["horizontal_push", "vertical_push", "horizontal_pull", "vertical_pull"];
  if (lowerRoles.some((role) => roles.has(role))) {
    return "lower_body_product_responsibilities";
  }
  if (upperRoles.some((role) => roles.has(role))) return "upper_body_product_responsibilities";
  return "additional_typed_product_responsibilities";
}

export function buildOwnerGetStrongerTopologyPolicy(
  intent: ProductionWeeklyIntent,
): ProductionWeekTopologyPolicy {
  const eligible = intent.objectives.filter((objective) => objective.priority === "required" &&
    objective.executionRequirements?.developmentalCreditRequired && isProductPolicyObjective(objective))
    .sort((left, right) => left.priorityOrder - right.priorityOrder ||
      left.objectiveId.localeCompare(right.objectiveId));
  if (eligible.length === 0) throw new Error("OWNER_TOPOLOGY_PRODUCT_RESPONSIBILITIES_REQUIRED");
  const eligibleObjectiveIds = Object.freeze(eligible.map((objective) => objective.objectiveId));
  const grouped = new Map<string, string[]>();
  for (const objective of eligible) {
    const groupId = coherenceGroupId(objective);
    grouped.set(groupId, [...(grouped.get(groupId) ?? []), objective.objectiveId]);
  }
  return Object.freeze({
    reference: OWNER_GET_STRONGER_TOPOLOGY_POLICY_REFERENCE,
    scope: "controlled_owner_get_stronger_product_responsibilities",
    eligibleObjectiveIds,
    preferredMaximumRequiredResponsibilitiesPerSession: 2,
    coherenceGroups: Object.freeze([...grouped.entries()].map(([groupId, objectiveIds]) =>
      Object.freeze({ groupId, objectiveIds: Object.freeze(objectiveIds) }))),
    provenance: Object.freeze({ owner: "week_allocation_composer",
      sourceRefs: Object.freeze(eligible.flatMap((objective) => [
        ...objective.sourcePriorityIds,
        ...(objective.executionRequirements?.provenance.sourceFactIds ?? []),
      ]).sort()),
      ruleRefs: Object.freeze([
        PRODUCT_GET_STRONGER_DEVELOP_WEEKLY_RESPONSIBILITY_POLICY_REFERENCE,
        "ALL_REQUIRED_PRODUCT_RESPONSIBILITIES_ELIGIBLE",
        "PREFER_AT_MOST_TWO_PER_SESSION_WHEN_AVAILABLE",
        "FEWEST_OCCUPIED_AFTER_CONCENTRATION",
        "NO_AUTOMATIC_RECOVERY_SESSION",
        "NO_FUTURE_WEEK_ROTATION",
      ]) }),
  });
}

export function buildOwnerWeekFeasibilityOracle(
  trainingSafety: TrainingSafetyState,
): ProductionSessionFeasibilityOracle {
  return Object.freeze({
    oracleId: "controlled-owner-responsibility-feasibility",
    oracleVersion: "1.0.0",
    evaluate: (input: ProductionSessionFeasibilityOracleInput) => {
      const readiness = buildTrainingReadinessTrace({ trainingSafety });
      const productDevelopmentResponsibilities = input.objectives.every((objective) =>
        objective.purpose !== "recovery_support" &&
        objective.executionRequirements?.developmentalCreditRequired && isProductPolicyObjective(objective));
      const equipmentKnown = input.opportunity.expectedEquipment.kind === "capability_snapshot";
      const status = !readiness.downstreamTrainingAllowed ? "blocked_by_training_readiness" as const :
        !productDevelopmentResponsibilities ? "unsupported_objective_scope" as const :
          !equipmentKnown ? "candidate_review_required" as const :
            "prescription_resolution_required" as const;
      const costClasses = input.objectives.map((objective) =>
        `${objective.objectiveId}:standard_required_strength_responsibility`);
      const unresolvedRequirementRefs = status === "blocked_by_training_readiness" ?
        readiness.unresolvedSignalIds : status === "unsupported_objective_scope" ?
            ["OWNER_FEASIBILITY_ONLY_SUPPORTS_TYPED_PRODUCT_DEVELOPMENT"] : !equipmentKnown ?
            ["CURRENT_EQUIPMENT_CAPABILITY_REVIEW_REQUIRED"] :
            ["FINAL_DURATION_REQUIRES_PRESCRIPTION_AND_SEQUENCING"];
      const sourceRefs = Object.freeze([
        `available_minutes:${input.opportunity.expectedAvailableMinutes ?? "unknown"}`,
        `structural_capacity:${input.opportunity.expectedStructuralCapacity}`,
        `equipment:${input.opportunity.expectedEquipment.kind}`,
        ...costClasses,
      ]);
      return Object.freeze({
        opportunityId: input.opportunity.opportunityId,
        opportunityRevisionId: input.opportunity.opportunityRevisionId,
        objectiveIds: Object.freeze(input.objectives.map((objective) => objective.objectiveId).sort()),
        status,
        sourceRefs,
        unresolvedRequirementRefs: Object.freeze([...unresolvedRequirementRefs].sort()),
        downstreamContractVersions: Object.freeze([
          "PRODUCTION_SESSION_INTENT_PLANNER@1.0.0",
          "PRODUCTION_CANDIDATE_INTELLIGENCE@1.0.0",
          "PRODUCTION_SESSION_COMPOSER@1.0.0",
          "PRODUCTION_PRESCRIPTION_COMPILER@1.0.0",
          "PRODUCTION_FINAL_SESSION_SEQUENCING@1.0.0",
        ]),
        resultFingerprint: canonicalWeekFingerprint({
          opportunityRevisionId: input.opportunity.opportunityRevisionId,
          objectiveIds: input.objectives.map((objective) => objective.objectiveId).sort(),
          status,
          sourceRefs,
        }),
      });
    },
  });
}

export interface OwnerWeekTopologyEvidence {
  readonly valid: boolean;
  readonly reasonCodes: readonly string[];
  readonly availableOpportunityCount: number;
  readonly occupiedSessionCount: number;
  readonly unusedOpportunityIds: readonly string[];
  readonly responsibilityCountsBySession: readonly number[];
  readonly weeklyExposureCounts: Readonly<Record<string, number>>;
  readonly primaryEmphasisFingerprint: string;
  readonly assignments: readonly {
    readonly opportunityId: string;
    readonly responsibilities: readonly {
      readonly weeklyObjectiveId: string;
      readonly role: "primary" | "supporting";
    }[];
  }[];
}

export function evaluateOwnerWeekTopology(input: {
  readonly plan: ProductionWeekAllocationPlan;
  readonly intent: ProductionWeeklyIntent;
  readonly policy: ProductionWeekTopologyPolicy;
  readonly opportunityIds: readonly string[];
}): OwnerWeekTopologyEvidence {
  const reasons: string[] = [];
  const eligible = new Set(input.policy.eligibleObjectiveIds);
  const reservations = [...input.plan.reservations].sort((left, right) =>
    input.opportunityIds.indexOf(left.opportunityId) - input.opportunityIds.indexOf(right.opportunityId));
  const exposureCounts = Object.fromEntries(input.policy.eligibleObjectiveIds.map((objectiveId) => [objectiveId, 0]));
  for (const reservation of reservations) {
    for (const objective of reservation.allocatedObjectives) {
      if (eligible.has(objective.weeklyObjectiveId)) {
        exposureCounts[objective.weeklyObjectiveId] = (exposureCounts[objective.weeklyObjectiveId] ?? 0) + 1;
      }
    }
  }
  const expectedExposureCount = input.intent.objectives.filter((objective) => eligible.has(objective.objectiveId))
    .reduce((sum, objective) => sum + objective.frequencyIntent.targetAllocatedSessions, 0);
  const expectedOccupiedSessionCount = Math.min(input.opportunityIds.length,
    Math.ceil(expectedExposureCount / input.policy.preferredMaximumRequiredResponsibilitiesPerSession));
  const expectedMaximumConcentration = Math.ceil(expectedExposureCount / expectedOccupiedSessionCount);
  const responsibilityCountsBySession = reservations.map((reservation) => reservation.allocatedObjectives
    .filter((objective) => eligible.has(objective.weeklyObjectiveId)).length);
  const maximumConcentration = Math.max(0, ...responsibilityCountsBySession);
  const primaryFingerprint = reservations.map((reservation) => {
    const primary = reservation.allocatedObjectives.filter((objective) => objective.purpose === "dominant_main");
    if (primary.length !== 1) reasons.push("OWNER_TOPOLOGY_EXACTLY_ONE_PRIMARY_REQUIRED");
    return `${reservation.opportunityId}:${primary[0]?.weeklyObjectiveId ?? "unresolved"}`;
  }).join("|");
  if (reservations.length !== expectedOccupiedSessionCount) {
    reasons.push("OWNER_TOPOLOGY_OCCUPIED_SESSION_COUNT_INVALID");
  }
  if (maximumConcentration !== expectedMaximumConcentration) {
    reasons.push("OWNER_TOPOLOGY_MAXIMUM_RESPONSIBILITY_CONCENTRATION_INVALID");
  }
  if (input.policy.eligibleObjectiveIds.some((objectiveId) => {
    const objective = input.intent.objectives.find((entry) => entry.objectiveId === objectiveId);
    return !objective || exposureCounts[objectiveId] !== objective.frequencyIntent.targetAllocatedSessions;
  })) reasons.push("OWNER_TOPOLOGY_TARGET_EXPOSURE_INVALID");
  if (input.plan.wholeWeekEvaluation?.primaryEmphasisFingerprint !== primaryFingerprint) {
    reasons.push("OWNER_TOPOLOGY_PRIMARY_EMPHASIS_FINGERPRINT_INVALID");
  }
  const policyRef = `${input.policy.reference.policyId}@${input.policy.reference.version}`;
  if (input.plan.wholeWeekEvaluation?.topologyPolicyReference?.policyId !== input.policy.reference.policyId ||
      input.plan.wholeWeekEvaluation?.topologyPolicyReference?.version !== input.policy.reference.version ||
      !input.plan.decisionTrace.includes(`TOPOLOGY_POLICY:${policyRef}`) ||
      !input.plan.provenance.ruleRefs.includes(policyRef)) {
    reasons.push("OWNER_TOPOLOGY_PROVENANCE_INVALID");
  }
  const objectiveById = new Map(input.intent.objectives.map((objective) => [objective.objectiveId, objective]));
  if (reservations.some((reservation) => reservation.allocatedObjectives.some((objective) => {
    const source = objectiveById.get(objective.weeklyObjectiveId);
    return objective.purpose === "recovery" || !source || !isProductPolicyObjective(source) ||
      source.priority === "required" && !eligible.has(source.objectiveId);
  }))) {
    reasons.push("OWNER_TOPOLOGY_UNAUTHORIZED_RESPONSIBILITY_INVALID");
  }
  const occupied = new Set(reservations.map((reservation) => reservation.opportunityId));
  return Object.freeze({
    valid: reasons.length === 0,
    reasonCodes: Object.freeze([...new Set(reasons)].sort()),
    availableOpportunityCount: input.opportunityIds.length,
    occupiedSessionCount: reservations.length,
    unusedOpportunityIds: Object.freeze(input.opportunityIds.filter((opportunityId) => !occupied.has(opportunityId))),
    responsibilityCountsBySession: Object.freeze(responsibilityCountsBySession),
    weeklyExposureCounts: Object.freeze(exposureCounts),
    primaryEmphasisFingerprint: primaryFingerprint,
    assignments: Object.freeze(reservations.map((reservation) => Object.freeze({
      opportunityId: reservation.opportunityId,
      responsibilities: Object.freeze(reservation.allocatedObjectives.map((objective) => Object.freeze({
        weeklyObjectiveId: objective.weeklyObjectiveId,
        role: objective.purpose === "dominant_main" ? "primary" as const : "supporting" as const,
      }))),
    }))),
  });
}
