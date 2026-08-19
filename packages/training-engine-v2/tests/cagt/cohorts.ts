import { FULL_GYM_EQUIPMENT } from "../../src";
import { buildFixedShellPlannerCohort, behavioralSignature } from "../helpers/sessionIntentPlannerProduction";
import { allocationInput, allocationSignature, designWeekAllocation, designWeeklyIntent, weekHorizon, weekOpportunity,
  weeklyIntentInput, weeklyIntentSignature, weeklyPriority, weeklyTarget } from "../helpers/weekComposerDesignLab";
import type { CagtCounterfactualContract, CagtDifferenceDimension, CagtGateId, CagtScenario } from "./contracts";
import { gateSnapshot, frameworkSignature, digest } from "./signatures";
import { runCagtPair } from "./runner";

export interface CagtPairDefinition { readonly contract: CagtCounterfactualContract; readonly baseline: CagtScenario;
  readonly counterfactual: CagtScenario }

function contract(input: { id: string; fact: string; owner: string; earliest: CagtGateId | null; latest: CagtGateId | null;
  permitted?: readonly CagtDifferenceDimension[]; inert?: boolean; framework?: CagtCounterfactualContract["expectedFrameworkRelationship"];
  justifiedReason?: string }): CagtCounterfactualContract {
  return { id: input.id, version: "1.0.0", baselineScenarioId: `${input.id}:baseline`,
    counterfactualScenarioId: `${input.id}:counterfactual`, changedFactPaths: [input.fact], changedFactIds: [`${input.id}:fact`],
    canonicalFactOwner: input.owner, materiality: input.inert ? "inert" : "material",
    earliestPermittedResponseGate: input.earliest, latestRequiredResponseGate: input.latest,
    invariantGates: input.earliest ? (["gate_0_scenario_truth"] as readonly CagtGateId[]).filter((gate) => gate !== input.earliest) : [],
    permittedDifferenceDimensions: input.permitted ?? [], prohibitedDifferenceDimensions: [],
    acceptableConvergenceReasons: input.justifiedReason ? [input.justifiedReason] : [],
    ...(input.justifiedReason ? { justifiedConvergenceReason: input.justifiedReason } : {}),
    expectedFrameworkRelationship: input.framework ?? "may_converge",
    expectedAdaptiveContentRelationship: input.inert ? "expected_same" : input.justifiedReason ? "justified_same_allowed" : "must_differ",
    expectedPrescriptionRelationship: "not_implemented", expectedSequenceRelationship: "not_implemented",
    layerAuthorityExpectations: {}, downstreamRescueProhibited: true,
    source: { sourceType: "reviewed_test_contract", sourceRef: `cagt:${input.id}` },
    explanation: `Predeclared causal contract for ${input.id}; explanation is inert.` };
}

function blankScenario(id: string, fact: string, value: unknown): CagtScenario {
  return { id, fixture: { [fact]: value }, gates: {} };
}
function syntheticPair(input: { id: string; fact: string; owner: string; gate: CagtGateId | null;
  dimension?: CagtDifferenceDimension; inert?: boolean; justifiedReason?: string; framework?: CagtCounterfactualContract["expectedFrameworkRelationship"] }): CagtPairDefinition {
  const baselineBase = blankScenario(`${input.id}:baseline`, input.fact, "baseline");
  const counterfactualBase = blankScenario(`${input.id}:counterfactual`, input.fact, "counterfactual");
  const baseline: CagtScenario = { ...baselineBase, gates: input.gate && input.dimension ?
    { [input.gate]: gateSnapshot({ [input.dimension]: "baseline" }) } : {} };
  const counterfactual: CagtScenario = { ...counterfactualBase, gates: input.gate && input.dimension ?
    { [input.gate]: gateSnapshot({ [input.dimension]: "counterfactual" }) } : {} };
  return { contract: contract({ id: input.id, fact: input.fact, owner: input.owner, earliest: input.gate,
    latest: input.gate, permitted: input.dimension ? [input.dimension] : [], inert: input.inert,
    justifiedReason: input.justifiedReason, framework: input.framework }), baseline, counterfactual };
}

function plannerScenario(id: string, fixture: Record<string, unknown>, row: ReturnType<typeof buildFixedShellPlannerCohort>[number]): CagtScenario {
  const candidate = Object.fromEntries(Object.entries(row.result.candidateResultsByNeed ?? {}).map(([needId, result]) => [needId, {
    legal: result.rankedCandidates.map((entry) => entry.exercise.id), order: result.rankedCandidates.map((entry) => entry.exercise.id),
    readiness: result.rankedCandidates.map((entry) => [entry.exercise.id, entry.painExecutionReadiness]),
  }]));
  return { id, fixture, gates: {
    gate_6_session_intent_truth: gateSnapshot({ session_needs: behavioralSignature(row.result.planning),
      assessment_enrichment: row.result.planning.assessmentEnrichmentTraces, active_continuity: row.result.planning.sessionIntent?.continuityEvidence }),
    gate_7_candidate_intelligence_truth: gateSnapshot({ candidate_pool: candidate, candidate_order: candidate,
      candidate_readiness: candidate, candidate_pain_evidence: Object.fromEntries(Object.entries(row.result.candidateResultsByNeed ?? {})
        .map(([needId, result]) => [needId, result.painExecutionReadiness])) }),
    gate_8_session_composition_truth: gateSnapshot({ selected_identity: row.result.skeleton?.assignments.map((entry) => entry.exerciseId),
      section_assignment: row.result.skeleton?.assignments.map((entry) => [entry.exerciseId, entry.section]),
      supporting_work: row.result.skeleton?.assignments.filter((entry) => entry.role !== "primary_strength").map((entry) => entry.exerciseId) }),
    gate_9_prescription_handoff_truth: gateSnapshot({ unresolved_prescription_requirement: row.result.skeleton?.infeasibility }),
  } };
}

function plannerPair(id: string, fact: string, rowId: string, earliest: CagtGateId, latest: CagtGateId,
  permitted: readonly CagtDifferenceDimension[], justifiedReason?: string): CagtPairDefinition {
  const rows = buildFixedShellPlannerCohort();
  const baselineRow = rows.find((row) => row.id === "strength-allocation")!;
  const changedRow = rows.find((row) => row.id === rowId)!;
  return { contract: contract({ id, fact, owner: earliest.includes("candidate") ? "Candidate Intelligence" : "Session Intent Planner",
    earliest, latest, permitted, justifiedReason }),
    baseline: plannerScenario(`${id}:baseline`, { [fact]: "baseline" }, baselineRow),
    counterfactual: plannerScenario(`${id}:counterfactual`, { [fact]: "counterfactual" }, changedRow) };
}

export function buildCuratedCagtPairs(): readonly CagtPairDefinition[] {
  return [
    syntheticPair({ id: "identical-meaningful-facts", fact: "equivalentFactOrder", owner: "none", gate: null, inert: true }),
    syntheticPair({ id: "athlete-id-only", fact: "athleteId", owner: "trace", gate: null, inert: true }),
    syntheticPair({ id: "athlete-label-only", fact: "label", owner: "display", gate: null, inert: true }),
    syntheticPair({ id: "prose-only", fact: "prose", owner: "trace", gate: null, inert: true }),
    plannerPair("irrelevant-pain", "pain.irrelevant", "irrelevant-pain", "gate_7_candidate_intelligence_truth", "gate_7_candidate_intelligence_truth",
      ["candidate_pain_evidence"], "same_legal_pool_after_irrelevant_stress_match"),
    plannerPair("relevant-shoulder", "pain.shoulder", "shoulder-discomfort", "gate_7_candidate_intelligence_truth", "gate_9_prescription_handoff_truth",
      ["candidate_pool", "candidate_order", "candidate_readiness", "candidate_pain_evidence", "selected_identity", "unresolved_prescription_requirement"]),
    plannerPair("low-back-sensitivity", "pain.lowBack", "low-back-sensitivity", "gate_7_candidate_intelligence_truth", "gate_9_prescription_handoff_truth",
      ["candidate_pool", "candidate_order", "candidate_readiness", "candidate_pain_evidence", "selected_identity", "unresolved_prescription_requirement"],
      "structured_stress_not_relevant_to_active_pull_need"),
    plannerPair("knee-sensitivity", "pain.knee", "knee-sensitivity", "gate_7_candidate_intelligence_truth", "gate_9_prescription_handoff_truth",
      ["candidate_pool", "candidate_order", "candidate_readiness", "candidate_pain_evidence", "selected_identity", "unresolved_prescription_requirement"],
      "structured_stress_not_relevant_to_active_pull_need"),
    plannerPair("strength-vs-hypertrophy", "goal", "hypertrophy-allocation", "gate_6_session_intent_truth", "gate_7_candidate_intelligence_truth",
      ["session_needs", "candidate_order", "selected_identity"]),
    plannerPair("strength-vs-general-fitness", "goal", "posture-allocation", "gate_6_session_intent_truth", "gate_8_session_composition_truth",
      ["session_needs", "candidate_order", "selected_identity"]),
    plannerPair("pain-aware-same-goal", "context.painAware", "pain-aware-strength", "gate_6_session_intent_truth", "gate_7_candidate_intelligence_truth",
      ["session_needs", "candidate_pool", "candidate_order"]),
    plannerPair("direct-calf-priority", "priority.calf", "calf-priority", "gate_6_session_intent_truth", "gate_8_session_composition_truth",
      ["session_needs", "candidate_pool", "candidate_order", "selected_identity", "optional_work"]),
    plannerPair("high-assessment", "assessment.high", "high-assessment", "gate_6_session_intent_truth", "gate_8_session_composition_truth",
      ["session_needs", "assessment_enrichment", "candidate_pool", "selected_identity", "preparation_dependency"]),
    plannerPair("low-assessment", "assessment.low", "low-assessment", "gate_6_session_intent_truth", "gate_8_session_composition_truth",
      ["session_needs", "assessment_enrichment", "candidate_pool", "selected_identity"], "low_confidence_does_not_cross_enrichment_threshold"),
    plannerPair("productive-press-anchor", "history.press", "productive-continuity", "gate_6_session_intent_truth", "gate_8_session_composition_truth",
      ["active_continuity", "candidate_continuity", "candidate_order", "anchor_retention", "selected_identity"]),
    plannerPair("productive-row-anchor", "history.row", "productive-continuity", "gate_6_session_intent_truth", "gate_8_session_composition_truth",
      ["active_continuity", "candidate_continuity", "candidate_order", "anchor_retention", "selected_identity"]),
    plannerPair("adverse-response", "response.adverse", "adverse-response", "gate_6_session_intent_truth", "gate_9_prescription_handoff_truth",
      ["active_continuity", "candidate_continuity", "candidate_readiness", "candidate_order", "selected_identity", "unresolved_prescription_requirement"]),
    plannerPair("expected-gym-actual-home", "equipment.actual", "home-equipment", "gate_7_candidate_intelligence_truth", "gate_8_session_composition_truth",
      ["candidate_legality", "candidate_pool", "candidate_order", "selected_identity"]),
    plannerPair("raw-minutes-same-capacity", "availability.minutes", "strength-allocation", "gate_6_session_intent_truth", "gate_6_session_intent_truth",
      ["session_needs"], "raw_minutes_do_not_change_structural_capacity"),
    plannerPair("structural-capacity", "availability.capacity", "condensed", "gate_6_session_intent_truth", "gate_8_session_composition_truth",
      ["session_needs", "selected_identity", "optional_work"]),
    syntheticPair({ id: "plateau", fact: "history.plateau", owner: "Longitudinal evidence foundation", gate: "gate_16_longitudinal_adaptation", dimension: "realized_stress" }),
    syntheticPair({ id: "explicit-block", fact: "history.block", owner: "Candidate Intelligence", gate: "gate_7_candidate_intelligence_truth", dimension: "candidate_legality" }),
    syntheticPair({ id: "missed-without-reallocation", fact: "horizon.missed", owner: "Week Allocation", gate: "gate_2_whole_week_allocation_coverage", dimension: "reallocation_state" }),
    syntheticPair({ id: "explicit-reallocation", fact: "horizon.reallocation", owner: "Week Allocation", gate: "gate_2_whole_week_allocation_coverage", dimension: "objective_allocation" }),
    syntheticPair({ id: "same-four-day-different-responsibility", fact: "priority.direct", owner: "Weekly Intent", gate: "gate_1_weekly_responsibility_truth", dimension: "weekly_objectives", framework: "expected_same" }),
    syntheticPair({ id: "same-framework-different-support", fact: "assessment", owner: "Session Intent", gate: "gate_6_session_intent_truth", dimension: "preparation_dependency", framework: "expected_same" }),
    syntheticPair({ id: "framework-identical", fact: "label", owner: "none", gate: null, inert: true, framework: "expected_same" }),
    syntheticPair({ id: "framework-material-change", fact: "horizon.opportunityCount", owner: "Product Horizon", gate: "gate_1_weekly_responsibility_truth", dimension: "horizon_opportunities", framework: "must_differ" }),
    syntheticPair({ id: "capacity-main-session", fact: "session.capacityMain", owner: "Session Intent", gate: "gate_6_session_intent_truth", dimension: "need_role" }),
    syntheticPair({ id: "same-reps-permitted", fact: "weekly.priority", owner: "Weekly Intent", gate: "gate_1_weekly_responsibility_truth", dimension: "weekly_objectives" }),
    syntheticPair({ id: "same-exercise-justified", fact: "preference.variety", owner: "Session Composer",
      gate: "gate_8_session_composition_truth", justifiedReason: "productive_anchor_remains_truthfully_best" }),
    syntheticPair({ id: "compound-real-user", fact: "facts", owner: "multiple", gate: "gate_1_weekly_responsibility_truth", dimension: "weekly_objectives" }),
  ];
}

function priority(id: string, role: "horizontal_push" | "horizontal_pull" | "squat", order: number) {
  return weeklyPriority({ id, purpose: "movement_development", priority: "required", priorityOrder: order,
    target: weeklyTarget({ targetMovementRoles: [role], targetMuscles: role === "horizontal_push" ? ["chest"] :
      role === "horizontal_pull" ? ["mid_back"] : ["quads"], muscleRequirement: "primary_required",
      targetBodyRegions: role === "squat" ? ["knee"] : ["shoulder"] }) });
}
export function buildFourDayFrameworkCohort() {
  const horizon = weekHorizon({ id: "cagt-four-day", opportunities: Array.from({ length: 4 }, (_, index) =>
    weekOpportunity({ id: `day-${index + 1}`, order: index, equipment: FULL_GYM_EQUIPMENT })) });
  const push = priority("push", "horizontal_push", 0); const pull = priority("pull", "horizontal_pull", 1);
  const squat = priority("squat", "squat", 2);
  const rows = [
    ["strength", "strength", [push, pull]], ["hypertrophy", "hypertrophy", [push, pull]],
    ["general-fitness", "general_fitness", [push, pull, squat]], ["direct-calf", "hypertrophy", [push, pull,
      weeklyPriority({ id: "calf", purpose: "direct_action_development", priority: "preferred", priorityOrder: 2,
        target: weeklyTarget({ targetMovementRoles: ["accessory"], targetActionFunctions: ["ankle_plantar_flexion"],
          targetMuscles: ["calves"], muscleRequirement: "primary_required", targetBodyRegions: ["ankle"] }) })]],
    ["shoulder-sensitive", "strength", [pull, squat]], ["low-back-sensitive", "strength", [push, pull]],
    ["assessment", "posture_and_movement_quality", [pull]], ["productive-continuity", "strength", [push, pull]],
    ["adverse-response", "strength", [push, pull]], ["condensed-one-day", "general_fitness", [push, pull, squat]],
  ] as const;
  return rows.map(([id, goal, priorities]) => {
    const intent = designWeeklyIntent(weeklyIntentInput({ outcomeGoal: goal, priorities, horizon }));
    const plan = intent.weeklyIntent ? designWeekAllocation(allocationInput({ intent: intent.weeklyIntent, horizon })) : null;
    return { id, confirmedOpportunities: 4, framework: frameworkSignature({ opportunityCount: 4,
      reservationCount: plan?.reservations.length ?? 0, dominantResponsibilityPattern: plan?.reservations.map((entry) =>
        entry.allocatedObjectives[0]?.purpose ?? "none") ?? [] }), weeklyResponsibility: weeklyIntentSignature(intent),
      weeklyAllocation: allocationSignature(plan), adaptiveSignature: digest({ intent: weeklyIntentSignature(intent), allocation: allocationSignature(plan) }) };
  });
}

export function runCuratedCagtPairs() { return buildCuratedCagtPairs().map((pair) => runCagtPair(pair)); }
