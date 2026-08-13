import {
  BODYWEIGHT_EQUIPMENT, CONTROLLED_CANDIDATE_SCENARIOS, FULL_GYM_EQUIPMENT,
  NO_TRAINING_SAFETY_SIGNALS, planAndComposeSessionSkeleton,
} from "../../src";
import type { WeeklyRecoverySpacingRequirement, WeeklySelectionTarget } from "../../src/weekComposer/designContracts";
import {
  allocationInput, designWeekAllocation, designWeeklyIntent, fixtureProvenance, frequencyIntent,
  materializeReservationDesign, NON_PRODUCTION_WEEKLY_POLICY, weekHorizon, weekOpportunity,
  weeklyIntentInput, weeklyPriority, weeklyTarget, WEEK_DESIGN_AS_OF,
} from "../helpers/weekComposerDesignLab";
import { CAGT_GATE_ORDER, type CagtGateId } from "./contracts";
import { digest } from "./signatures";
import {
  ATOMIC_WEEK_POLICY_CANDIDATES, COMPOSITE_WEEK_POLICY_CANDIDATES, MINIMAL_COMPOSITE,
  atomicCandidate, candidateForPriority, validateAtomicCandidate,
} from "./weekPolicyTournamentCandidates";
import type {
  AtomicPolicyCandidate, CompositePolicyCandidate, FrequencyBand, ObjectivePolicyFamily,
  PolicyFamily, PolicyResolution, TournamentGateResult, TournamentObjectiveFixture,
  TournamentScenario, TournamentScenarioResult,
} from "./weekPolicyTournamentContracts";

export type TournamentCandidate = AtomicPolicyCandidate | CompositePolicyCandidate;

const BASE_REQUEST = CONTROLLED_CANDIDATE_SCENARIOS.find((entry) => entry.id === "horizontal-pull-gym-neutral")!.request;

const PURPOSE: Readonly<Record<ObjectivePolicyFamily, Parameters<typeof weeklyPriority>[0]["purpose"]>> = {
  strength: "movement_development", muscle: "muscle_development", direct: "direct_action_development",
  assessment: "assessment_priority_development", capacity: "capacity_development",
};

function targetFor(family: ObjectivePolicyFamily): WeeklySelectionTarget {
  if (family === "strength") return weeklyTarget({ targetMovementRoles: ["horizontal_pull"], targetMuscles: ["mid_back", "lats"], targetBodyRegions: ["shoulder", "thoracic_spine"] });
  if (family === "muscle") return weeklyTarget({ targetMovementRoles: ["horizontal_push"], targetMuscles: ["chest"], targetBodyRegions: ["shoulder"] });
  if (family === "direct") return weeklyTarget({ targetMovementRoles: [], targetActionFunctions: ["elbow_flexion"], targetMuscles: ["biceps"], targetBodyRegions: ["elbow"] });
  if (family === "assessment") return weeklyTarget({ targetMovementRoles: [], targetActionFunctions: [], targetMuscles: ["serratus"], muscleRequirement: "any_meaningful_contributor", targetBodyRegions: ["shoulder"] });
  return weeklyTarget({ targetMovementRoles: ["carry"], targetActionFunctions: [], targetMuscles: ["trunk"], muscleRequirement: "any_meaningful_contributor", targetBodyRegions: ["shoulder", "wrist", "lumbar_spine"] });
}

function familyCandidate(candidate: TournamentCandidate, family: PolicyFamily): AtomicPolicyCandidate {
  if (candidate.family !== "composite" && candidate.family === family) return candidate;
  const refs = candidate.family === "composite" ? candidate.atomicCandidateIds : MINIMAL_COMPOSITE.atomicCandidateIds;
  if (!refs) return candidateForPriority(family, "required");
  return atomicCandidate(refs[family]);
}

function bandForObjective(candidate: TournamentCandidate, objective: TournamentObjectiveFixture): FrequencyBand {
  const selected = familyCandidate(candidate, objective.family);
  if (selected.priority === objective.priority && selected.band) return selected.band;
  const priorityCandidate = candidateForPriority(objective.family, objective.priority);
  if (priorityCandidate.priority === objective.priority && priorityCandidate.band) return priorityCandidate.band;
  if (objective.priority !== "required") return { minimum: 0, target: 1, softMaximum: 1 };
  if (!selected.band) throw new Error(`No required band for ${candidate.id}/${objective.id}`);
  return selected.band;
}

export function resolveTournamentPolicy(candidate: TournamentCandidate, scenario: TournamentScenario): PolicyResolution {
  const atomic = candidate.family === "composite"
    ? candidate.atomicCandidateIds ? Object.values(candidate.atomicCandidateIds).map(atomicCandidate) : []
    : [candidate];
  const failures = atomic.flatMap(validateAtomicCandidate);
  if (candidate.version !== "1.0.0") failures.push("INVALID_POLICY_VERSION");
  const bands = candidate.family === "composite" && candidate.noPolicyControl ? {} : Object.fromEntries(
    scenario.objectives.map((objective) => [objective.id, bandForObjective(candidate, objective)]),
  );
  const spacing = familyCandidate(candidate, "spacing").id;
  const participation = familyCandidate(candidate, "participation").id;
  return {
    candidateId: candidate.id, valid: failures.length === 0, failures: [...new Set(failures)].sort(),
    bandsByObjectiveId: bands,
    spacingState: spacing.includes("R2_") ? "R2" : spacing.includes("R1_") ? "R1" : "R0",
    participationState: participation.includes("P2_") ? "P2" : participation.includes("P1_") ? "P1" : "P0",
    productionActivation: false,
  };
}

function opportunitySeries(scenario: TournamentScenario) {
  return Array.from({ length: scenario.opportunityCount }, (_, order) => weekOpportunity({
    id: `${scenario.id}:opportunity-${order + 1}`, order,
    capacity: scenario.condensedOpportunityOrders.includes(order) ? "condensed" : "standard",
    minutes: scenario.condensedOpportunityOrders.includes(order) ? 25 : 50,
    ...(scenario.unknownEquipmentOpportunityOrders.includes(order) ? {} : {
      equipment: scenario.bodyweightOpportunityOrders.includes(order) ? BODYWEIGHT_EQUIPMENT : FULL_GYM_EQUIPMENT,
    }),
    ...(scenario.cancelledOpportunityOrders.includes(order)
      ? { availabilityStatus: "cancelled" as const, completionStatus: "missed" as const } : {}),
    ...(scenario.consecutive ? { dateRef: `ordered-consecutive-${order}` } : {}),
  }));
}

function spacingRequirements(resolution: PolicyResolution, objectiveIds: readonly string[]): readonly WeeklyRecoverySpacingRequirement[] {
  if (resolution.spacingState !== "R2" || objectiveIds.length === 0) return [];
  return [{
    id: `${resolution.candidateId}:r2-gap`, weeklyObjectiveIds: objectiveIds, movementRoles: [], muscles: [], stressTags: [],
    capacityLanes: [], spacingBasis: { kind: "ordered_opportunity_gap", minimumGap: 2 }, required: true,
    policySourceRef: `${resolution.candidateId}:design-stress-only`,
    provenance: fixtureProvenance(`${resolution.candidateId}:r2-gap`, "planned_allocation"),
    unresolvedPrescriptionDependency: true,
  }];
}

function buildGates(input: {
  readonly resolution: PolicyResolution;
  readonly noPolicy: boolean;
  readonly intentStatus: string;
  readonly allocationStatus: string;
  readonly belowMinimumExplicit: number;
  readonly zeroValue: number;
  readonly unauthorizedAssessment: number;
  readonly constrainedOverload: number;
  readonly materializationFailures: number;
  readonly downstreamStatuses: readonly string[];
  readonly reservationCount: number;
}): readonly TournamentGateResult[] {
  let failed = false;
  return CAGT_GATE_ORDER.map((gate): TournamentGateResult => {
    if (["gate_13_post_prescription_weekly_validation", "gate_14_full_prescribed_program_comparison",
      "gate_15_phase_continuity", "gate_16_longitudinal_adaptation"].includes(gate)) {
      return { gate, state: "NOT_IMPLEMENTED", reasonCode: "GATE_UNAVAILABLE", actualEvidenceRefs: [] };
    }
    if (failed) return { gate, state: "NOT_REACHED", reasonCode: "EARLIER_GATE_FAILED_NO_RESCUE", actualEvidenceRefs: [] };
    let failure: string | null = null;
    let refs: readonly string[] = [];
    if (gate === "gate_0_scenario_truth") {
      failure = input.resolution.valid ? null : input.resolution.failures[0] ?? "INVALID_POLICY";
      refs = input.resolution.failures;
    } else if (gate === "gate_1_weekly_responsibility_truth") {
      failure = input.intentStatus === "weekly_intent_planned" ? null : input.noPolicy && input.intentStatus === "weekly_policy_required"
        ? "NO_POLICY_CONTROL_REQUIRES_POLICY" : "WEEKLY_INTENT_NOT_PLANNED";
      refs = [input.intentStatus];
    } else if (gate === "gate_2_whole_week_allocation_coverage") {
      failure = ["allocation_designed", "allocation_infeasible"].includes(input.allocationStatus) ? null : "ALLOCATION_NOT_EVALUATED";
      refs = [input.allocationStatus, `below_minimum_explicit:${input.belowMinimumExplicit}`];
    } else if (gate === "gate_3_weekly_causal_adaptation") {
      refs = [`reservations:${input.reservationCount}`];
    } else if (gate === "gate_4_weekly_duplication_distribution") {
      failure = input.zeroValue > 0 ? "ZERO_MARGINAL_VALUE_OPTIONAL_WORK" :
        input.unauthorizedAssessment > 0 ? "UNAUTHORIZED_ASSESSMENT_RECURRENCE" :
          input.constrainedOverload > 0 ? "CONSTRAINED_SESSION_OVERLOAD" : null;
      refs = [`zero_value:${input.zeroValue}`, `unauthorized_assessment:${input.unauthorizedAssessment}`,
        `constrained_overload:${input.constrainedOverload}`];
    } else if (gate === "gate_5_reservation_day_materialization") {
      failure = input.materializationFailures > 0 ? "MATERIALIZATION_FAILED" : null;
      refs = [`materialization_failures:${input.materializationFailures}`];
    } else if (["gate_6_session_intent_truth", "gate_7_candidate_intelligence_truth", "gate_8_session_composition_truth"].includes(gate)) {
      const infeasible = input.downstreamStatuses.filter((status) => status === "infeasible_objective_combination").length;
      failure = infeasible > 0 ? "DOWNSTREAM_SESSION_INFEASIBLE" : null;
      refs = input.downstreamStatuses;
    } else if (gate === "gate_9_prescription_handoff_truth") {
      refs = ["PRESCRIPTION_REQUIREMENTS_REMAIN_UNRESOLVED"];
    } else if (gate === "gate_10_sequencing_duration_handoff_truth") {
      refs = ["SEQUENCING_REMAINS_HANDOFF_ONLY"];
    } else if (gate === "gate_11_execution_response_foundation") {
      refs = ["RESPONSE_FOUNDATION_UNCHANGED"];
    } else if (gate === "gate_12_all_horizon_sessions") {
      refs = [`complete_pipelines:${input.downstreamStatuses.length}`, `reservations:${input.reservationCount}`];
    }
    if (failure) failed = true;
    return { gate, state: failure ? "FAIL_STOP" : "PASS", reasonCode: failure ?? "ACTUAL_SEMANTIC_OUTPUT_PASS", actualEvidenceRefs: refs };
  });
}

function emptyResult(candidate: TournamentCandidate, scenario: TournamentScenario, resolution: PolicyResolution): TournamentScenarioResult {
  const gates = buildGates({ resolution, noPolicy: candidate.family === "composite" && candidate.noPolicyControl,
    intentStatus: "not_run", allocationStatus: "not_run", belowMinimumExplicit: 0, zeroValue: 0,
    unauthorizedAssessment: 0, constrainedOverload: 0, materializationFailures: 0, downstreamStatuses: [], reservationCount: 0 });
  return {
    candidateId: candidate.id, scenarioId: scenario.id, cohort: scenario.cohort, resolution,
    weeklyIntentStatus: "not_run", allocationStatus: "not_run", reservationCount: 0,
    objectiveAllocationCounts: {}, objectiveSatisfactionStates: {}, searchStatesExpanded: 0,
    searchCompleteness: "not_run", downstreamPipelineCount: 0, downstreamStatuses: [],
    frameworkSignature: digest([scenario.opportunityCount, []]), adaptiveSignature: digest([]),
    reservationSignature: digest([]), sessionIntentSignature: digest([]), sessionSkeletonSignature: digest([]),
    requiredMinimumCovered: 0, requiredMinimumTotal: scenario.objectives.filter((entry) => entry.priority === "required").length,
    requiredBelowMinimumExplicit: 0, targetCovered: 0, softMaximumReviews: 0,
    unauthorizedAssessmentRecurrence: 0, optionalAssignments: 0, zeroMarginalValueAssignments: 0,
    directRecurrence: 0, exactReservationRecurrence: 0, averageObjectivesPerReservation: 0,
    constrainedOverload: 0, prescriptionBurden: 0, candidateReviewBurden: 0, sessionInfeasibility: 0,
    searchInconclusive: 0, gates, firstFailingGate: gates.find((entry) => entry.state === "FAIL_STOP")?.gate ?? null,
    productionActivation: false,
  };
}

function statusForSkeleton(result: ReturnType<typeof planAndComposeSessionSkeleton>): string {
  if (!result.skeleton || result.skeleton.compositionStatus === "infeasible") return "infeasible_objective_combination";
  if (result.skeleton.compositionStatus === "search_inconclusive") return "search_inconclusive";
  if (result.skeleton.executionReadiness === "candidate_review_required" ||
      result.skeleton.executionReadiness === "candidate_review_and_prescription_required") return "candidate_review_required";
  if (result.skeleton.executionReadiness === "prescription_resolution_required") return "prescription_resolution_required";
  return "feasible_session_skeleton";
}

export function executeTournamentScenario(candidate: TournamentCandidate, scenario: TournamentScenario): TournamentScenarioResult {
  const resolution = resolveTournamentPolicy(candidate, scenario);
  if (!resolution.valid) return emptyResult(candidate, scenario, resolution);
  const horizon = weekHorizon({ id: `${scenario.id}:${candidate.id}`, opportunities: opportunitySeries(scenario) });
  const priorities = scenario.objectives.map((entry) => {
    const selectedBand = resolution.bandsByObjectiveId[entry.id] ?? { minimum: 1, target: 1, softMaximum: 1 };
    return weeklyPriority({ id: entry.id, purpose: PURPOSE[entry.family], target: targetFor(entry.family),
      priority: entry.priority, priorityOrder: entry.priorityOrder,
      frequencyIntent: frequencyIntent({ ...selectedBand, sourceRef: `${candidate.id}:${entry.id}` }),
      goalRelationships: [{ goal: entry.family === "muscle" ? "hypertrophy" : "strength",
        relationship: entry.family === "strength" || entry.family === "muscle" ? "primary_weekly_goal" : "cross_goal_support",
        sourceEvidenceRefs: [`${scenario.id}:${entry.id}:explicit`] }],
    });
  });
  const noPolicy = candidate.family === "composite" && candidate.noPolicyControl;
  const intentResult = designWeeklyIntent(weeklyIntentInput({ priorities, horizon, policy: noPolicy ? null : NON_PRODUCTION_WEEKLY_POLICY,
    contextModes: scenario.context === "pain_aware" ? ["pain_aware_return"] : [] }));
  if (!intentResult.weeklyIntent) {
    const base = emptyResult(candidate, scenario, resolution);
    const gates = buildGates({ resolution, noPolicy, intentStatus: intentResult.status, allocationStatus: "not_run",
      belowMinimumExplicit: 0, zeroValue: 0, unauthorizedAssessment: 0, constrainedOverload: 0, materializationFailures: 0,
      downstreamStatuses: [], reservationCount: 0 });
    return { ...base, weeklyIntentStatus: intentResult.status, gates,
      firstFailingGate: gates.find((entry) => entry.state === "FAIL_STOP")?.gate ?? null };
  }
  const recovery = spacingRequirements(resolution, intentResult.weeklyIntent.objectives
    .filter((entry) => entry.purpose === "movement_development" || entry.purpose === "muscle_development")
    .map((entry) => entry.id));
  const plan = designWeekAllocation(allocationInput({ intent: intentResult.weeklyIntent, horizon, recovery }));
  const objectiveCounts = Object.fromEntries(Object.entries(plan.objectiveAllocationTraces).map(([id, opportunities]) => [id, opportunities.length]));
  const fixtureById = new Map(scenario.objectives.flatMap((entry) =>
    [[entry.id, entry] as const, [`weekly-objective:${entry.id}`, entry] as const]));
  const requiredObjectives = intentResult.weeklyIntent.objectives.filter((entry) => entry.priority === "required");
  const requiredCovered = requiredObjectives.filter((entry) => (objectiveCounts[entry.id] ?? 0) >= (entry.frequencyIntent?.minimumAllocatedSessions ?? 0)).length;
  const belowMinimum = requiredObjectives.length - requiredCovered;
  const targetCovered = intentResult.weeklyIntent.objectives.filter((entry) =>
    (objectiveCounts[entry.id] ?? 0) >= (entry.frequencyIntent?.targetAllocatedSessions ?? Number.POSITIVE_INFINITY)).length;
  const softReviews = Object.values(plan.objectiveSatisfactionStates).filter((state) => state === "above_soft_ceiling_review").length;
  const assessmentRecurrence = intentResult.weeklyIntent.objectives.filter((entry) => entry.purpose === "assessment_priority_development")
    .reduce((total, entry) => total + (!fixtureById.get(entry.id)?.assessmentRepeatAuthorized && (objectiveCounts[entry.id] ?? 0) > 1 ? (objectiveCounts[entry.id] ?? 0) - 1 : 0), 0);
  const optionalAssignments = intentResult.weeklyIntent.objectives.filter((entry) => entry.priority === "optional")
    .reduce((total, entry) => total + (objectiveCounts[entry.id] ?? 0), 0);
  const zeroValue = intentResult.weeklyIntent.objectives.filter((entry) => entry.priority === "optional" && !fixtureById.get(entry.id)?.uniqueMarginalValue)
    .reduce((total, entry) => total + (objectiveCounts[entry.id] ?? 0), 0);
  const directRecurrence = intentResult.weeklyIntent.objectives.filter((entry) => entry.purpose === "direct_action_development")
    .reduce((total, entry) => total + Math.max(0, (objectiveCounts[entry.id] ?? 0) - 1), 0);
  const materialized = plan.reservations.map((reservation) => materializeReservationDesign({
    reservation,
    actualCurrentAvailability: { availableMinutes: reservation.expectedAvailability.availableMinutes ?? 45,
      structuralCapacity: reservation.expectedStructuralCapacity, provenance: "explicit_today",
      sourceRef: `${reservation.id}:tournament-availability` },
    actualCurrentEquipment: { capabilities: reservation.expectedEquipment.kind === "capability_snapshot"
      ? reservation.expectedEquipment.capabilities : FULL_GYM_EQUIPMENT,
      provenance: "explicit_today", sourceRef: `${reservation.id}:tournament-equipment` },
    actualEvaluationTime: WEEK_DESIGN_AS_OF, actualSafetyState: NO_TRAINING_SAFETY_SIGNALS,
    actualUnresolvedContext: [], explicitProductUserUpdateRefs: [scenario.id, candidate.id],
  }));
  const pipelines = materialized.flatMap((entry) => {
    if (entry.status !== "directive_materialized" || !entry.directive || !entry.plannerCurrentEquipment) return [];
    const production = planAndComposeSessionSkeleton({
      directive: entry.directive, athlete: BASE_REQUEST.athlete, phaseIntent: BASE_REQUEST.phase,
      assessment: BASE_REQUEST.assessment, painAndInjury: BASE_REQUEST.painAndInjury,
      trainingSafety: BASE_REQUEST.trainingSafety ?? NO_TRAINING_SAFETY_SIGNALS,
      currentEquipment: entry.plannerCurrentEquipment, history: BASE_REQUEST.history,
      trainingResponseHistory: BASE_REQUEST.history.trainingResponseHistory ?? { observations: [] },
      satisfiedPrerequisiteIds: ["push-up-plank-control", "hinge-control", "suitcase-carry-loaded-gait-setup"],
      evaluationAsOf: WEEK_DESIGN_AS_OF,
    });
    return [{ production, status: statusForSkeleton(production) }];
  });
  const statuses = pipelines.map((entry) => entry.status);
  const reservationShapes = plan.reservations.map((entry) => entry.allocatedObjectives.map((objective) => objective.purpose).sort().join("+"));
  const exactRecurrence = Math.max(0, reservationShapes.length - new Set(reservationShapes).size);
  const constrainedOverload = plan.reservations.filter((entry) => entry.expectedStructuralCapacity === "condensed" && entry.allocatedObjectives.length > 2).length;
  const trace = plan.decisionTrace.find((entry) => entry.startsWith("exhaustive_states:"));
  const searchStates = trace ? Number(trace.split(":")[1]) : 0;
  const gates = buildGates({ resolution, noPolicy, intentStatus: intentResult.status, allocationStatus: plan.status,
    belowMinimumExplicit: belowMinimum, zeroValue, unauthorizedAssessment: assessmentRecurrence,
    constrainedOverload, materializationFailures: materialized.length - pipelines.length, downstreamStatuses: statuses,
    reservationCount: plan.reservations.length });
  return {
    candidateId: candidate.id, scenarioId: scenario.id, cohort: scenario.cohort, resolution,
    weeklyIntentStatus: intentResult.status, allocationStatus: plan.status, reservationCount: plan.reservations.length,
    objectiveAllocationCounts: objectiveCounts, objectiveSatisfactionStates: plan.objectiveSatisfactionStates,
    searchStatesExpanded: searchStates, searchCompleteness: plan.searchCompleteness,
    downstreamPipelineCount: pipelines.length, downstreamStatuses: statuses,
    frameworkSignature: digest({ opportunities: horizon.opportunities.map((entry) => entry.expectedAvailability.structuralCapacity),
      reservationCount: plan.reservations.length, objectiveCounts: plan.reservations.map((entry) => entry.allocatedObjectives.length) }),
    adaptiveSignature: digest({ objectiveCounts, satisfaction: plan.objectiveSatisfactionStates }),
    reservationSignature: digest(plan.reservations.map((entry) => entry.allocatedObjectives.map((objective) => [objective.weeklyObjectiveId, objective.purpose]))),
    sessionIntentSignature: digest(pipelines.map((entry) => entry.production.planning.sessionIntent)),
    sessionSkeletonSignature: digest(pipelines.map((entry) => entry.production.skeleton)),
    requiredMinimumCovered: requiredCovered, requiredMinimumTotal: requiredObjectives.length,
    requiredBelowMinimumExplicit: belowMinimum, targetCovered, softMaximumReviews: softReviews,
    unauthorizedAssessmentRecurrence: assessmentRecurrence, optionalAssignments, zeroMarginalValueAssignments: zeroValue,
    directRecurrence, exactReservationRecurrence: exactRecurrence,
    averageObjectivesPerReservation: plan.reservations.length === 0 ? 0 :
      plan.reservations.reduce((sum, entry) => sum + entry.allocatedObjectives.length, 0) / plan.reservations.length,
    constrainedOverload, prescriptionBurden: plan.unresolvedPrescriptionRequirements.length,
    candidateReviewBurden: statuses.filter((status) => status === "candidate_review_required").length,
    sessionInfeasibility: statuses.filter((status) => status === "infeasible_objective_combination").length,
    searchInconclusive: statuses.filter((status) => status === "search_inconclusive").length +
      (plan.wholeWeekEvaluation?.sessionFeasibilityVector.filter((status) => status === "search_inconclusive").length ?? 0),
    gates, firstFailingGate: gates.find((entry) => entry.state === "FAIL_STOP")?.gate ?? null,
    productionActivation: false,
  };
}

export const ALL_TOURNAMENT_CANDIDATES: readonly TournamentCandidate[] = Object.freeze([
  ...ATOMIC_WEEK_POLICY_CANDIDATES, ...COMPOSITE_WEEK_POLICY_CANDIDATES,
]);

export function firstFailingGate(result: TournamentScenarioResult): CagtGateId | null {
  return result.gates.find((entry) => entry.state === "FAIL_STOP")?.gate ?? null;
}
