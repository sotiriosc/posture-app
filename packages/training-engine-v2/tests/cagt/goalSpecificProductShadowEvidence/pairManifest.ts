import {
  GOAL_SPECIFIC_PRODUCT_SHADOW_CAUSAL_PAIR_REFERENCE,
  type GoalSpecificProductShadowCausalPairContract,
} from "./contracts";
import { GOAL_SPECIFIC_CONTROLLED_SCENARIOS } from "./scenarioManifest";

const FAMILY = Object.freeze([
  Object.freeze({ name: "strength_hypertrophy", path: "primaryGoal", owner: "PRODUCT_GOAL_MAPPING_OWNER",
    materiality: "material" as const, earliest: "product_mapping" as const, latest: "gate_14" as const,
    convergence: null, prescriptionSame: false, first: "product_mapping" as const }),
  Object.freeze({ name: "semantic_label_equivalence", path: "displayGoalLabel",
    owner: "PRODUCT_GOAL_MAPPING_OWNER", materiality: "inert" as const,
    earliest: "product_mapping" as const, latest: "gate_14" as const,
    convergence: "equivalent_goal_semantics", prescriptionSame: true, first: "none" as const }),
  Object.freeze({ name: "irrelevant_pain", path: "painContext.irrelevantRegion",
    owner: "CANDIDATE_PRESCRIPTION_CONTEXT_OWNER", materiality: "inert" as const,
    earliest: "candidate_intelligence" as const, latest: "gate_13" as const,
    convergence: "irrelevant_pain_is_inert", prescriptionSame: true, first: "none" as const }),
  Object.freeze({ name: "equipment_capability", path: "equipment.capabilities",
    owner: "CANDIDATE_COMPOSER_AND_REALIZATION_OWNER", materiality: "material" as const,
    earliest: "candidate_intelligence" as const, latest: "prescription" as const,
    convergence: null, prescriptionSame: false, first: "candidate_intelligence" as const }),
  Object.freeze({ name: "session_minutes", path: "availability.minutes",
    owner: "WEEK_SESSION_FEASIBILITY_OWNER", materiality: "material" as const,
    earliest: "week_allocation" as const, latest: "gate_13" as const,
    convergence: "required_work_already_fits_both_windows", prescriptionSame: true,
    first: "final_sequence" as const }),
  Object.freeze({ name: "secondary_goal", path: "secondaryGoal",
    owner: "WEEKLY_RESPONSIBILITY_OWNER", materiality: "material" as const,
    earliest: "planning_brief" as const, latest: "week_allocation" as const,
    convergence: "secondary_goal_recorded_without_unreviewed_extra_dose", prescriptionSame: true,
    first: "planning_brief" as const }),
  Object.freeze({ name: "coarse_experience", path: "experience.coarseLabel",
    owner: "REALIZATION_CONTEXT_OWNER", materiality: "inert" as const,
    earliest: "prescription" as const, latest: "prescription" as const,
    convergence: "coarse_label_has_no_exact_realization_authority", prescriptionSame: true,
    first: "none" as const }),
  Object.freeze({ name: "relevant_pain", path: "painContext.relevantRegion",
    owner: "CANDIDATE_PRESCRIPTION_CONTEXT_OWNER", materiality: "material" as const,
    earliest: "candidate_intelligence" as const, latest: "prescription" as const,
    convergence: "same_legal_exercise_with_local_realization_review", prescriptionSame: false,
    first: "candidate_intelligence" as const }),
]);

function scenarioId(pairIndex: number, side: "baseline" | "counterfactual"): string {
  const fixtureId = `fixture:controlled-pair-${String(pairIndex + 1).padStart(3, "0")}-${side}`;
  const row = GOAL_SPECIFIC_CONTROLLED_SCENARIOS.find((entry) => entry.fixture.fixtureId === fixtureId);
  if (!row) throw new Error(`GOAL_SPECIFIC_PAIR_SCENARIO_MISSING:${fixtureId}`);
  return row.contract.scenarioId;
}

export const GOAL_SPECIFIC_CAUSAL_PAIR_MATRIX = Object.freeze(Array.from({ length: 260 },
  (_, index): GoalSpecificProductShadowCausalPairContract => {
    const family = FAMILY[index % FAMILY.length];
    return Object.freeze({
      reference: GOAL_SPECIFIC_PRODUCT_SHADOW_CAUSAL_PAIR_REFERENCE,
      pairId: `goal-specific-pair-${String(index + 1).padStart(3, "0")}-${family.name}`,
      baselineScenarioId: scenarioId(index, "baseline"),
      counterfactualScenarioId: scenarioId(index, "counterfactual"),
      changedFactPath: family.path,
      rightfulOwner: family.owner,
      materiality: family.materiality,
      earliestResponseStage: family.earliest,
      latestResponseStage: family.latest,
      invariantDimensions: Object.freeze([
        "counterfactual_boundary", "product_authority", "application", "outcome_claim",
      ]),
      permittedDifferenceDimensions: Object.freeze(family.materiality === "material"
        ? ["weekly_responsibility", "session_need", "assignment", "prescription", "duration"]
        : []),
      frameworkSamenessExpected: !["strength_hypertrophy", "session_minutes"].includes(family.name),
      assignmentSamenessPermitted: true,
      exerciseSamenessPermitted: true,
      prescriptionSamenessPermitted: family.prescriptionSame,
      justifiedConvergencePermitted: family.convergence !== null,
      convergenceReason: family.convergence,
      firstMaterialDifferenceExpectation: family.first,
      persistenceExpectation: family.materiality === "material" ? "through_gate_14" : "not_required",
      noRescueRequired: true,
    });
  }));

export const GOAL_SPECIFIC_PAIR_EXPECTATIONS = Object.freeze(Object.fromEntries(
  GOAL_SPECIFIC_CAUSAL_PAIR_MATRIX.map((pair) => [pair.pairId, Object.freeze({
    materiality: pair.materiality,
    firstMaterialDifference: pair.firstMaterialDifferenceExpectation,
    convergenceReason: pair.convergenceReason,
    persistence: pair.persistenceExpectation,
  })]),
));
