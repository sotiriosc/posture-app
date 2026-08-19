import {
  GOAL_SPECIFIC_PRODUCT_SHADOW_EVALUATION_TIME,
  GOAL_SPECIFIC_PRODUCT_SHADOW_SCENARIO_REFERENCE,
  type GoalSpecificProductShadowScenarioContract,
  type GoalSpecificTerminalClass,
} from "./contracts";

export type EvidenceProfile = "historical_v1" | "goal_realization_v1";
export type EvidenceEquipment = "none" | "dumbbells" | "bands" | "gym";
export type EvidenceEquipmentDetail =
  | "none"
  | "bodyweight_exact"
  | "dumbbell_exact"
  | "dumbbell_low_ceiling"
  | "band_exact"
  | "band_missing_anchor"
  | "gym_exact";

export interface GoalSpecificProductFixture {
  readonly fixtureId: string;
  readonly profile: EvidenceProfile;
  readonly athleteShellId: string;
  readonly productSourceRevision: string;
  readonly goal: string;
  readonly experience: "Beginner" | "Intermediate" | "Advanced";
  readonly equipment: EvidenceEquipment;
  readonly equipmentDetail: EvidenceEquipmentDetail;
  readonly daysPerWeek: 3 | 4 | 5;
  readonly trainingIntent: "build" | "maintain" | "rehab";
  readonly painAreas: readonly string[];
  readonly minutes: 25 | 30 | 45 | 60 | 70 | null;
  readonly secondaryGoal: "strength" | "hypertrophy" |
    "posture_and_movement_quality" | "general_fitness" | null;
  readonly purposeBundle: {
    readonly required: readonly string[];
    readonly preferred: readonly string[];
    readonly optional: readonly string[];
  } | null;
  readonly fitnessFocus: "mixed_general_fitness" | "local_muscular_endurance" |
    "systemic_conditioning" | null;
  readonly assessment: "none" | "irrelevant_low_confidence" | "relevant_reviewed";
  readonly cohortTags: readonly string[];
  readonly useFixtureExtensions: boolean;
}

export interface GoalSpecificScenarioDeclaration {
  readonly fixture: GoalSpecificProductFixture;
  readonly contract: GoalSpecificProductShadowScenarioContract;
}

const COMPLETE_GOALS = Object.freeze([
  "Get stronger",
  "Build muscle",
  "Improve posture and movement",
  "Improve fitness and stamina",
] as const);

const INCOMPLETE_GOALS = Object.freeze([
  "Improve posture",
  "Reduce pain",
  "General fitness",
  "Athletic performance",
  "Improve athletic performance",
  "unknown goal",
] as const);

function purposeBundle(goal: string, variant = 0): GoalSpecificProductFixture["purposeBundle"] {
  if (goal !== "General fitness" && goal !== "Improve fitness and stamina") return null;
  if (goal === "Improve fitness and stamina") return Object.freeze({
    required: Object.freeze(["muscular_endurance_development"]),
    preferred: Object.freeze([]),
    optional: Object.freeze([]),
  });
  const required = variant % 2 === 0
    ? ["strength_development", "hypertrophy_development"]
    : ["muscular_endurance_development", "movement_quality_development"];
  return Object.freeze({
    required: Object.freeze(required),
    preferred: Object.freeze([]),
    optional: Object.freeze(["direct_development"]),
  });
}

function expectedFor(fixture: GoalSpecificProductFixture): GoalSpecificTerminalClass {
  if (fixture.profile === "historical_v1") return "complete";
  if (fixture.cohortTags.includes("holdout_policy_incomplete")) return "honest_incomplete_policy";
  if (!fixture.useFixtureExtensions || fixture.goal === "Reduce pain" ||
      fixture.goal === "Athletic performance" || fixture.goal === "Improve athletic performance" ||
      fixture.goal === "unknown goal") return "honest_incomplete_product_input";
  if (fixture.equipmentDetail === "band_missing_anchor") return "honest_incomplete_mapping";
  if (fixture.equipmentDetail === "dumbbell_low_ceiling") return "honest_incomplete_mapping";
  return "calibration_complete";
}

function scenarioContract(fixture: GoalSpecificProductFixture,
  changedFactPaths: readonly string[] = Object.freeze(["questionnaire.goals"])):
GoalSpecificProductShadowScenarioContract {
  const expectedTerminalClass = expectedFor(fixture);
  const complete = expectedTerminalClass === "complete" || expectedTerminalClass === "calibration_complete";
  return Object.freeze({
    reference: GOAL_SPECIFIC_PRODUCT_SHADOW_SCENARIO_REFERENCE,
    scenarioId: fixture.fixtureId.replace(/^fixture:/, "scenario:"),
    fixtureId: fixture.fixtureId,
    athleteShellId: fixture.athleteShellId,
    productSourceRevision: fixture.productSourceRevision,
    mappingProfileVersion: "CONTROLLED_PRODUCT_SHADOW_GOAL_AND_REALIZATION_MAPPING@1.0.0",
    pipelineProfileVersion: "CONTROLLED_PRODUCT_SHADOW_PIPELINE_PROFILE_B1_B4@1.0.0",
    changedFactPaths: Object.freeze([...changedFactPaths]),
    unchangedFactPaths: Object.freeze([
      "questionnaire.daysPerWeek",
      "questionnaire.trainingIntent",
      "questionnaire.experience",
      "evaluationTime",
    ]),
    factOwner: changedFactPaths.includes("questionnaire.goals")
      ? "PRODUCT_GOAL_MAPPING_OWNER" : "DECLARED_TYPED_FACT_OWNER",
    materiality: complete ? "material" : "inert",
    earliestPermittedResponseStage: "product_mapping",
    latestRequiredResponseStage: complete ? "gate_14" : "product_mapping",
    invariantStages: Object.freeze(["fixture_contract"] as const),
    permittedDifferenceDimensions: Object.freeze([
      "planning_brief", "weekly_responsibility", "session_intent", "prescription", "gate_13",
    ]),
    permittedConvergenceReasons: Object.freeze([
      "same_semantic_goal", "same_local_purpose", "irrelevant_context", "same_legal_solution",
    ]),
    expectedTerminalClass,
    noRescueRequired: true,
    sourceProvenance: "synthetic_product_shaped_fixture",
    evaluationTime: GOAL_SPECIFIC_PRODUCT_SHADOW_EVALUATION_TIME,
  });
}

function completeFixture(input: {
  readonly id: string;
  readonly shell: string;
  readonly goal: typeof COMPLETE_GOALS[number] | "Improve posture" | "General fitness";
  readonly variant: number;
  readonly overrides?: Partial<Omit<GoalSpecificProductFixture,
    "fixtureId" | "profile" | "athleteShellId" | "productSourceRevision" | "goal">>;
}): GoalSpecificProductFixture {
  const details = ["bodyweight_exact", "dumbbell_exact", "band_exact", "gym_exact"] as const;
  const equipmentByDetail: Readonly<Record<typeof details[number], EvidenceEquipment>> = {
    bodyweight_exact: "none", dumbbell_exact: "dumbbells", band_exact: "bands", gym_exact: "gym",
  };
  const detail = details[input.variant % details.length];
  const base: GoalSpecificProductFixture = {
    fixtureId: `fixture:${input.id}`,
    profile: "goal_realization_v1",
    athleteShellId: input.shell,
    productSourceRevision: `product-revision:${input.id.replace(/-(baseline|counterfactual)$/, "")}`,
    goal: input.goal,
    experience: (["Beginner", "Intermediate", "Advanced"] as const)[input.variant % 3],
    equipment: equipmentByDetail[detail],
    equipmentDetail: detail,
    daysPerWeek: ([3, 4, 5] as const)[input.variant % 3],
    trainingIntent: "build",
    painAreas: Object.freeze([]),
    minutes: ([30, 45, 70] as const)[input.variant % 3],
    secondaryGoal: null,
    purposeBundle: purposeBundle(input.goal, input.variant),
    fitnessFocus: input.goal === "Improve fitness and stamina" ? "local_muscular_endurance" : null,
    assessment: "none",
    cohortTags: Object.freeze(["complete", input.goal.toLowerCase().replaceAll(" ", "_")]),
    useFixtureExtensions: true,
  };
  return Object.freeze({ ...base, ...(input.overrides ?? {}),
    painAreas: Object.freeze([...(input.overrides?.painAreas ?? base.painAreas)]),
    cohortTags: Object.freeze([...(input.overrides?.cohortTags ?? base.cohortTags)]),
  });
}

function incompleteFixture(id: string, index: number, shell: string): GoalSpecificProductFixture {
  const goal = INCOMPLETE_GOALS[index % INCOMPLETE_GOALS.length];
  return Object.freeze({
    fixtureId: `fixture:${id}`,
    profile: "goal_realization_v1",
    athleteShellId: shell,
    productSourceRevision: `product-revision:${id}`,
    goal,
    experience: (["Beginner", "Intermediate", "Advanced"] as const)[index % 3],
    equipment: (["none", "dumbbells", "bands", "gym"] as const)[index % 4],
    equipmentDetail: "none",
    daysPerWeek: ([3, 4, 5] as const)[index % 3],
    trainingIntent: (["build", "maintain", "rehab"] as const)[index % 3],
    painAreas: Object.freeze(index % 2 === 0 ? ["shoulder"] : []),
    minutes: null,
    secondaryGoal: null,
    purposeBundle: null,
    fitnessFocus: null,
    assessment: index % 3 === 0 ? "irrelevant_low_confidence" : "none",
    cohortTags: Object.freeze(["honest_incomplete", goal.toLowerCase().replaceAll(" ", "_")]),
    useFixtureExtensions: false,
  });
}

function pairFixtures(pairIndex: number): readonly [GoalSpecificProductFixture, GoalSpecificProductFixture] {
  const family = pairIndex % 8;
  const shell = `fixed-pair-shell:${String(pairIndex + 1).padStart(3, "0")}`;
  const baselineId = `controlled-pair-${String(pairIndex + 1).padStart(3, "0")}-baseline`;
  const counterId = `controlled-pair-${String(pairIndex + 1).padStart(3, "0")}-counterfactual`;
  const baseline = completeFixture({ id: baselineId, shell, goal: "Get stronger", variant: pairIndex,
    overrides: { equipment: "gym", equipmentDetail: "gym_exact", daysPerWeek: 4,
      minutes: 45, experience: "Intermediate", cohortTags: ["fixed_shell", `pair_family_${family}`] } });
  if (family === 0) return Object.freeze([baseline, completeFixture({ id: counterId, shell,
    goal: "Build muscle", variant: pairIndex, overrides: { equipment: "gym", equipmentDetail: "gym_exact",
      daysPerWeek: 4, minutes: 45, experience: "Intermediate", cohortTags: ["strength_hypertrophy_pair"] } })]);
  if (family === 1) return Object.freeze([completeFixture({ id: baselineId, shell, goal: "Improve posture",
    variant: pairIndex, overrides: { equipment: "gym", equipmentDetail: "gym_exact", daysPerWeek: 4,
      minutes: 45, experience: "Intermediate", cohortTags: ["semantic_label_equivalence"] } }),
  completeFixture({ id: counterId, shell, goal: "Improve posture and movement", variant: pairIndex,
    overrides: { equipment: "gym", equipmentDetail: "gym_exact", daysPerWeek: 4, minutes: 45,
      experience: "Intermediate", cohortTags: ["semantic_label_equivalence"] } })]);
  if (family === 2) return Object.freeze([baseline, completeFixture({ id: counterId, shell,
    goal: "Get stronger", variant: pairIndex, overrides: { equipment: "gym", equipmentDetail: "gym_exact",
      daysPerWeek: 4, minutes: 45, experience: "Intermediate", painAreas: ["knee"],
      cohortTags: ["irrelevant_pain"] } })]);
  if (family === 3) return Object.freeze([completeFixture({ id: baselineId, shell, goal: "Get stronger",
    variant: pairIndex, overrides: { equipment: "none", equipmentDetail: "bodyweight_exact",
      daysPerWeek: 4, minutes: 45, experience: "Intermediate", cohortTags: ["equipment_pair"] } }),
  completeFixture({ id: counterId, shell, goal: "Get stronger", variant: pairIndex,
    overrides: { equipment: "dumbbells", equipmentDetail: "dumbbell_exact", daysPerWeek: 4,
      minutes: 45, experience: "Intermediate", cohortTags: ["equipment_pair"] } })]);
  if (family === 4) return Object.freeze([baseline, completeFixture({ id: counterId, shell,
    goal: "Get stronger", variant: pairIndex, overrides: { equipment: "gym", equipmentDetail: "gym_exact",
      daysPerWeek: 4, minutes: 70, experience: "Intermediate", cohortTags: ["time_pair"] } })]);
  if (family === 5) return Object.freeze([baseline, completeFixture({ id: counterId, shell,
    goal: "Get stronger", variant: pairIndex, overrides: { equipment: "gym", equipmentDetail: "gym_exact",
      daysPerWeek: 4, minutes: 45, experience: "Intermediate", secondaryGoal: "hypertrophy",
      cohortTags: ["primary_secondary_pair"] } })]);
  if (family === 6) return Object.freeze([completeFixture({ id: baselineId, shell, goal: "Get stronger",
    variant: pairIndex, overrides: { equipment: "gym", equipmentDetail: "gym_exact", daysPerWeek: 4,
      minutes: 45, experience: "Beginner", cohortTags: ["experience_convergence"] } }),
  completeFixture({ id: counterId, shell, goal: "Get stronger", variant: pairIndex,
    overrides: { equipment: "gym", equipmentDetail: "gym_exact", daysPerWeek: 4, minutes: 45,
      experience: "Advanced", cohortTags: ["experience_convergence"] } })]);
  return Object.freeze([baseline, completeFixture({ id: counterId, shell, goal: "Get stronger",
    variant: pairIndex, overrides: { equipment: "gym", equipmentDetail: "gym_exact", daysPerWeek: 4,
      minutes: 45, experience: "Intermediate", painAreas: ["shoulder"],
      cohortTags: ["relevant_pain"] } })]);
}

const pairedControlledFixtures = Array.from({ length: 260 }, (_, index) => pairFixtures(index)).flat();
const incompleteControlledFixtures = Array.from({ length: 80 }, (_, index) =>
  incompleteFixture(`controlled-incomplete-${String(index + 1).padStart(3, "0")}`, index,
    `controlled-incomplete-shell:${index % 20}`));

export const GOAL_SPECIFIC_CONTROLLED_SCENARIOS = Object.freeze([
  ...pairedControlledFixtures,
  ...incompleteControlledFixtures,
].map((fixture) => Object.freeze({ fixture, contract: scenarioContract(fixture) })));

export const GOAL_SPECIFIC_FIXED_SHELL_SCENARIOS = Object.freeze(Array.from({ length: 160 }, (_, index) => {
  const goal = COMPLETE_GOALS[(index + Math.floor(index / COMPLETE_GOALS.length)) % COMPLETE_GOALS.length];
  const fixture = completeFixture({
    id: `fixed-shell-${String(index + 1).padStart(3, "0")}`,
    shell: "fixed-shell:four-opportunities",
    goal,
    variant: index,
    overrides: {
      daysPerWeek: 4,
      experience: "Intermediate",
      assessment: index % 5 === 0 ? "relevant_reviewed" : "none",
      painAreas: index % 8 === 0 ? ["shoulder"] : index % 8 === 1 ? ["knee"] : [],
      secondaryGoal: index % 6 === 0 ? "hypertrophy" : null,
      cohortTags: ["fixed_shell", "four_opportunities"],
    },
  });
  return Object.freeze({ fixture, contract: scenarioContract(fixture,
    Object.freeze(["declared_fixed_shell_fact"])) });
}));

function historicalFixture(index: number): GoalSpecificProductFixture {
  const id = `holdout-historical-${String(index + 1).padStart(3, "0")}`;
  return Object.freeze({
    ...incompleteFixture(id, index, `historical-shell:${index % 30}`),
    profile: "historical_v1",
    goal: (["Improve posture", "Reduce pain", "General fitness", "Athletic performance"] as const)[index % 4],
    cohortTags: Object.freeze(["historical_v1_golden"]),
  });
}

const holdoutHistorical = Array.from({ length: 300 }, (_, index) => historicalFixture(index));
const holdoutComplete = Array.from({ length: 300 }, (_, index) => completeFixture({
  id: `holdout-new-complete-${String(index + 1).padStart(3, "0")}`,
  shell: `holdout-shell:${index % 40}`,
  goal: COMPLETE_GOALS[(index + Math.floor(index / COMPLETE_GOALS.length)) % COMPLETE_GOALS.length],
  variant: index,
  overrides: {
    painAreas: index % 20 === 0 ? ["shoulder"] : index % 20 === 1 ? ["knee"] : [],
    secondaryGoal: null,
    assessment: index % 11 === 0 ? "relevant_reviewed" : "none",
    cohortTags: ["locked_holdout", "genuine_pipeline"],
  },
}));
const holdoutPipelineIncomplete = Array.from({ length: 150 }, (_, index) => completeFixture({
  id: `holdout-new-policy-incomplete-${String(index + 1).padStart(3, "0")}`,
  shell: `holdout-policy-incomplete-shell:${index % 30}`,
  goal: "General fitness",
  variant: index,
  overrides: {
    purposeBundle: Object.freeze({
      required: Object.freeze(["muscular_endurance_development", "movement_quality_development"]),
      preferred: Object.freeze([]),
      optional: Object.freeze([]),
    }),
    cohortTags: ["locked_holdout", "genuine_pipeline", "holdout_policy_incomplete"],
  },
}));
const holdoutInputIncomplete = Array.from({ length: 100 }, (_, index) =>
  Object.freeze({
    ...incompleteFixture(`holdout-new-incomplete-${String(index + 1).padStart(3, "0")}`, index,
      `holdout-incomplete-shell:${index % 30}`),
    goal: "unknown goal",
    cohortTags: Object.freeze(["locked_holdout", "honest_incomplete_product_input"]),
  }));

export const GOAL_SPECIFIC_HOLDOUT_SCENARIOS = Object.freeze([
  ...holdoutHistorical,
  ...holdoutComplete,
  ...holdoutPipelineIncomplete,
  ...holdoutInputIncomplete,
].map((fixture) => Object.freeze({ fixture, contract: scenarioContract(fixture) })));

export const GOAL_SPECIFIC_HOLDOUT_MANIFEST = Object.freeze({
  manifestId: "GOAL_SPECIFIC_CONTROLLED_PRODUCT_SHADOW_EVIDENCE_V1_HOLDOUT",
  version: "1.0.0",
  lockedBeforeExecution: true,
  tuningAfterInspectionPermitted: false,
  evaluationTime: GOAL_SPECIFIC_PRODUCT_SHADOW_EVALUATION_TIME,
  scenarioCount: GOAL_SPECIFIC_HOLDOUT_SCENARIOS.length,
  historicalV1GoldenCount: holdoutHistorical.length,
  newProfileMappingCount: holdoutComplete.length + holdoutPipelineIncomplete.length +
    holdoutInputIncomplete.length,
  genuinePipelineExecutionTarget: holdoutComplete.length + holdoutPipelineIncomplete.length,
  completeOrCalibrationCompleteTarget: holdoutComplete.length,
  honestIncompleteTarget: holdoutPipelineIncomplete.length + holdoutInputIncomplete.length,
  gate14ComparisonTarget: 260,
  causalPairContractTarget: 260,
  scenarios: GOAL_SPECIFIC_HOLDOUT_SCENARIOS.map(({ fixture, contract }) => Object.freeze({
    scenarioId: contract.scenarioId,
    fixtureId: fixture.fixtureId,
    profile: fixture.profile,
    goal: fixture.goal,
    experience: fixture.experience,
    equipment: fixture.equipment,
    equipmentDetail: fixture.equipmentDetail,
    opportunities: fixture.daysPerWeek,
    minutes: fixture.minutes,
    expectedTerminalClass: contract.expectedTerminalClass,
  })),
});

export const GOAL_SPECIFIC_SCENARIO_EXPECTATIONS = Object.freeze(Object.fromEntries([
  ...GOAL_SPECIFIC_CONTROLLED_SCENARIOS,
  ...GOAL_SPECIFIC_FIXED_SHELL_SCENARIOS,
  ...GOAL_SPECIFIC_HOLDOUT_SCENARIOS,
].map(({ contract }) => [contract.scenarioId, Object.freeze({
  terminalClass: contract.expectedTerminalClass,
  earliestPermittedResponseStage: contract.earliestPermittedResponseStage,
  latestRequiredResponseStage: contract.latestRequiredResponseStage,
})])));
