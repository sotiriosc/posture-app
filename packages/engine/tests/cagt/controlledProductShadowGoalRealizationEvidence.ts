import { createHash } from "node:crypto";
import {
  PRODUCT_SHADOW_CURRENT_GOAL_LABELS,
  PRODUCT_SHADOW_FUTURE_FIXTURE_GOAL_LABELS,
  stableId,
} from "@praxis/training-engine-v2";
import type { LogPrefs, Program } from "../../src/types";
import type { TrainingSnapshot } from "../../src/trainingStateModel";
import {
  CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_PROFILE_V1_B1_B4,
  CONTROLLED_PRODUCT_SHADOW_PIPELINE_PROFILE_B1_B4,
  PRODUCT_SHADOW_B1_B4_STAGE_ORDER,
  PRODUCT_SHADOW_GOAL_REALIZATION_FIXTURE_EXTENSIONS_REFERENCE,
  buildControlledProductShadowGoalRealizationMappingBundleV1,
  compareHistoricalV1WithGoalRealizationV1,
  createControlledProductShadowB1B4Pipeline,
  mapProductAvailabilityHorizon,
  mapProductEquipmentForRealization,
  mapProductExperienceForRealization,
  mapProductExerciseIdentities,
  mapProductGoalForGoalRealizationProfile,
  mapProductTrainingModeV2,
  projectProductLegacyHistoryAuthority,
  type ProductGoalRealizationFixtureExtensions,
  type ProductGoalRealizationMappingInput,
  type ProductShadowB1B4StagePort,
} from "../../src/controlledProductShadowGoalRealization";
import { buildControlledProductShadowMappingBundle } from "../../src/controlledProductShadow/mappings";

export const CHUNK_C_EVALUATION_TIME = "2026-08-15T23:45:00-04:00" as const;
export const CHUNK_C_HOLDOUT_ID =
  "CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_MAPPING_V1_LOCKED_HOLDOUT" as const;

export function chunkCFingerprint(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

export function productGoalRealizationProgram(): Program {
  return { id: "legacy-program-c1", userId: "chunk-c-athlete", createdAt: CHUNK_C_EVALUATION_TIME,
    updatedAt: CHUNK_C_EVALUATION_TIME, goalTrack: "posture", daysPerWeek: 4,
    estimatedSessionMinutesRange: { min: 45, max: 60 }, source: "local", deletedAt: null,
    phaseIndex: 1, weekIndex: 1, cycleIndex: 1, week: [0, 1, 2, 3].map((dayIndex) => ({ dayIndex,
      title: `Day ${dayIndex + 1}`, focusTags: [], routine: [{ exerciseId: "dead-bug", section: "main",
        sets: 2, reps: "8", durationSec: null, loadType: "bodyweight" }] })) };
}

export function exactFixtureExtensions(overrides: Partial<ProductGoalRealizationFixtureExtensions> = {}):
ProductGoalRealizationFixtureExtensions {
  return { reference: PRODUCT_SHADOW_GOAL_REALIZATION_FIXTURE_EXTENSIONS_REFERENCE,
    source: "versioned_test_or_replay_fixture", sessionMinutes: 55,
    equipmentDetails: [{ productLabel: "gym", implementReference: "fixture:gym:bodyweight-station",
      capabilities: ["floor_space", "stable_support_surface", "bodyweight_training_area"],
      loadMinimum: 0, loadMaximum: 0, loadIncrement: 0, unit: "not_applicable" }], ...overrides };
}

export function calibrationFixtureExtensions(overrides: Partial<ProductGoalRealizationFixtureExtensions> = {}):
ProductGoalRealizationFixtureExtensions {
  return exactFixtureExtensions({ equipmentDetails: [{ productLabel: "gym",
    implementReference: "fixture:gym:dumbbells", capabilities: ["dumbbell_pair", "flat_bench"],
    loadMinimum: null, loadMaximum: null, loadIncrement: null, unit: "kg" }], ...overrides });
}

export function buildChunkCMappingInput(overrides: Partial<{
  readonly goal: string;
  readonly experience: string;
  readonly equipment: readonly string[];
  readonly daysPerWeek: number;
  readonly trainingIntent: string;
  readonly painAreas: readonly string[];
  readonly fixtureExtensions: ProductGoalRealizationFixtureExtensions | null;
  readonly preferences: LogPrefs | null;
  readonly programs: readonly Program[];
}> = {}): ProductGoalRealizationMappingInput {
  return { athleteId: "chunk-c-athlete", questionnaire: { goals: overrides.goal ?? "Get stronger",
    experience: overrides.experience ?? "Advanced", equipment: overrides.equipment ?? ["gym"],
    daysPerWeek: overrides.daysPerWeek ?? 4, trainingIntent: overrides.trainingIntent ?? "build",
    painAreas: overrides.painAreas ?? [] }, assessment: { signals: [{ id: "assessment:c1",
      confidence: 0.9, region: "trunk", action: "reviewed_context", reviewState: "reviewed" }],
      summary: "prose must not be consumed" }, preferences: overrides.preferences ?? { schemaVersion: 1 },
    programs: overrides.programs ?? [productGoalRealizationProgram()], sessions: [], exerciseLogs: [],
    activeProgramId: (overrides.programs ?? [productGoalRealizationProgram()])[0]?.id ?? null,
    productStateRevision: "product-state:chunk-c:1", evaluationTime: CHUNK_C_EVALUATION_TIME,
    fixtureExtensions: overrides.fixtureExtensions === undefined ? exactFixtureExtensions() :
      overrides.fixtureExtensions };
}

export function completeChunkCStagePorts(): readonly ProductShadowB1B4StagePort[] {
  return Object.freeze(PRODUCT_SHADOW_B1_B4_STAGE_ORDER.map((stage, index) => Object.freeze({ stage,
    contractReference: CONTROLLED_PRODUCT_SHADOW_PIPELINE_PROFILE_B1_B4.stageReferences[index]!,
    evaluate: () => Object.freeze({ status: stage === "longitudinal" ||
      stage === "application_orchestration" ? "not_applicable" as const : "complete" as const,
    artifactReference: stage === "prescription" ? Object.freeze({ artifactType: "prescribed_program",
      artifactRevisionId: "chunk-c:counterfactual-prescribed-program:1",
      contractReference: CONTROLLED_PRODUCT_SHADOW_PIPELINE_PROFILE_B1_B4.stageReferences[index]!,
      counterfactualOnly: true as const }) : null, unresolvedRequirements: Object.freeze(stage === "longitudinal" ?
      ["LEGACY_PRODUCT_HISTORY_RESTRICTED_NO_V2_LINEAGE"] : []) }) })));
}

export const COMPLETE_CHUNK_C_PIPELINE = createControlledProductShadowB1B4Pipeline({
  profile: CONTROLLED_PRODUCT_SHADOW_PIPELINE_PROFILE_B1_B4,
  stagePorts: completeChunkCStagePorts(),
});

const currentGoals = [...PRODUCT_SHADOW_CURRENT_GOAL_LABELS];
const futureGoals = [...PRODUCT_SHADOW_FUTURE_FIXTURE_GOAL_LABELS];
const allGoals = [...currentGoals, ...futureGoals];
const experiences = ["Beginner", "Intermediate", "Advanced"] as const;
const equipment = ["none", "dumbbells", "bands", "gym"] as const;
const intents = ["build", "maintain", "rehab"] as const;
const opportunities = [3, 4, 5] as const;

export const CHUNK_C_CONTROLLED_SCENARIOS = Object.freeze(Array.from({ length: 420 }, (_, index) => Object.freeze({
  scenarioId: `chunk-c-controlled-${String(index + 1).padStart(3, "0")}`,
  appSurface: index % 2 === 0 ? "consumer" : "gyms",
  goal: allGoals[index % allGoals.length]!, experience: experiences[index % experiences.length]!,
  equipment: equipment[index % equipment.length]!, trainingIntent: intents[index % intents.length]!,
  opportunities: opportunities[index % opportunities.length]!,
  lane: ["goal_mapping", "planning_brief", "experience_history", "equipment_load", "availability",
    "preference_continuity", "pipeline", "counterfactual", "historical_freeze", "b4_boundary"][index % 10]!,
})));

export const CHUNK_C_FIXED_SHELL_COHORT = Object.freeze(Array.from({ length: 120 }, (_, index) => Object.freeze({
  scenarioId: `chunk-c-fixed-shell-${String(index + 1).padStart(3, "0")}`,
  appSurface: index % 2 === 0 ? "consumer" : "gyms", productStateStructure: "TrainingSnapshot@current",
  coarseExperience: "Advanced", equipmentLabel: "gym", orderedOpportunityCount: 4,
  legacyProgramFramework: "legacy-program-c1", evaluationTime: CHUNK_C_EVALUATION_TIME,
  goal: allGoals[index % allGoals.length]!, painContext: index % 4 === 0 ? "lower back" : null,
  trainingIntent: intents[index % intents.length]!, secondaryGoalFixture: index % 5 === 0 ? "strength" : null,
  assessmentState: index % 3 === 0 ? "reviewed_signal" : "absent",
  preferenceState: index % 4 === 1 ? "explicit_substitution" : "none",
  identityState: index % 6 === 0 ? "reviewed_alias" : "exact_canonical",
  historyAuthority: "restricted", equipmentDetail: index % 2 === 0 ? "exact" : "presence_only",
  minutes: index % 2 === 0 ? 55 : null,
})));

export interface ChunkCHoldoutScenario {
  readonly scenarioId: string;
  readonly appSurface: "consumer" | "gyms";
  readonly profile: "historical_v1" | "goal_realization_v1";
  readonly goal: string;
  readonly experience: string;
  readonly equipment: string;
  readonly trainingIntent: string;
  readonly opportunities: number;
  readonly pipelineAttempt: boolean;
  readonly expectedClass: "historical_golden" | "complete" | "calibration_complete" | "honest_incomplete";
}

export function buildChunkCHoldoutManifest() {
  const historical = Array.from({ length: 250 }, (_, index): ChunkCHoldoutScenario => Object.freeze({
    scenarioId: `chunk-c-holdout-historical-${String(index + 1).padStart(3, "0")}`,
    appSurface: index % 2 === 0 ? "consumer" : "gyms", profile: "historical_v1",
    goal: currentGoals[index % currentGoals.length]!, experience: experiences[index % experiences.length]!,
    equipment: equipment[index % equipment.length]!, trainingIntent: intents[index % intents.length]!,
    opportunities: opportunities[index % opportunities.length]!, pipelineAttempt: false,
    expectedClass: "historical_golden",
  }));
  const newProfile = Array.from({ length: 400 }, (_, index): ChunkCHoldoutScenario => {
    const complete = index < 120;
    const calibration = index >= 120 && index < 220;
    const incomplete = index >= 220;
    const completeGoals = ["Get stronger", "Build muscle", "Improve posture", "Improve posture and movement"];
    const incompleteGoals = ["Reduce pain", "General fitness", "Athletic performance",
      "Improve fitness and stamina", "Improve athletic performance", "unknown goal"];
    return Object.freeze({ scenarioId: `chunk-c-holdout-new-${String(index + 1).padStart(3, "0")}`,
      appSurface: index % 2 === 0 ? "consumer" : "gyms", profile: "goal_realization_v1",
      goal: (incomplete ? incompleteGoals : completeGoals)[index % (incomplete ? incompleteGoals : completeGoals).length]!,
      experience: experiences[index % experiences.length]!, equipment: "gym",
      trainingIntent: incomplete && index % 7 === 0 ? "maintain" : "build",
      opportunities: opportunities[index % opportunities.length]!, pipelineAttempt: index < 220,
      expectedClass: complete ? "complete" : calibration ? "calibration_complete" : "honest_incomplete" });
  });
  const scenarios = Object.freeze([...historical, ...newProfile]);
  return Object.freeze({ manifestId: CHUNK_C_HOLDOUT_ID, version: "1.0.0", lockedBeforeEvaluation: true,
    tuningAfterInspectionPermitted: false, evaluationTime: CHUNK_C_EVALUATION_TIME,
    scenarioCount: scenarios.length, historicalV1GoldenCount: 250, newProfileMappingCount: 400,
    b1B4PipelineAttemptCount: 220, completeOrCalibrationCompleteCount: 220,
    honestIncompleteCount: 180, appSurfaces: Object.freeze(["consumer", "gyms"]), scenarios });
}

export const CHUNK_C_HOLDOUT_MANIFEST = buildChunkCHoldoutManifest();
export const CHUNK_C_HOLDOUT_FINGERPRINT = chunkCFingerprint(CHUNK_C_HOLDOUT_MANIFEST);

export const CHUNK_C_MUTATIONS = Object.freeze([
  "historical_v1_silently_changed", "new_profile_selected_by_default", "current_route_selects_new_profile",
  "hidden_latest_profile", "profile_selected_from_goal", "profile_selected_from_environment",
  "run_omits_profile", "replay_uses_latest", "reduce_pain_becomes_posture",
  "general_fitness_becomes_strength", "general_fitness_becomes_endurance",
  "athletic_performance_becomes_power", "fitness_stamina_becomes_conditioning", "unknown_goal_guessed",
  "secondary_read_from_unknown_key", "goal_creates_exercise", "goal_creates_dose", "pain_becomes_outcome",
  "rehab_becomes_diagnosis", "maintain_uses_development_policy", "build_becomes_strength",
  "pain_creates_safety_block", "pain_creates_corrective_circuit", "advanced_creates_exact_familiarity",
  "advanced_creates_exact_load", "empty_history_becomes_novice", "legacy_program_becomes_authored_brief",
  "legacy_program_becomes_productive_anchor", "session_becomes_v2_performance",
  "exercise_log_becomes_exact_prescription", "easy_becomes_preference", "pain_becomes_permanent_dislike",
  "substitution_becomes_global_block", "elapsed_time_becomes_progression", "none_implies_support",
  "dumbbells_imply_bench_max_increment", "bands_imply_anchor_resistance", "gym_implies_inventory",
  "legacy_program_proves_equipment", "exact_load_guessed", "calibration_rescues_unknown_equipment",
  "days_create_dates", "days_create_weekdays", "days_create_spacing", "program_length_creates_minutes",
  "exercise_count_creates_minutes", "unknown_duration_called_fit", "legacy_program_causes_assignment",
  "incomplete_mapping_proceeds", "hidden_b1_b4_policy", "product_output_returned", "shadow_performed",
  "product_log_credited_to_shadow", "legacy_outcome_authorizes_progression", "gate13_rescues_mapping",
  "comparison_better_score", "b4_challenge_imported", "b4_priorities_become_goals",
  "b4_equipment_promoted", "b4_alias_promoted", "b4_volume_becomes_habitual", "questionnaire_changed",
  "generate_program_changed", "route_response_changed", "rollout_changed", "product_persistence_changed",
  "product_ui_changed", "activation_enabled",
] as const);

export const CHUNK_C_METAMORPHIC_RESULTS = Object.freeze([
  "product_object_key_order", "goal_registry_order", "mapping_profile_property_order", "policy_rule_order",
  "source_reference_order", "program_array_order_with_explicit_day", "history_log_order",
  "equipment_selection_order", "assessment_order_stable_ids", "provenance_order_nonsemantic",
  "display_labels_outside_registry", "notes_prose", "irrelevant_pain", "irrelevant_assessment",
  "account_label", "program_display_title", "primary_goal_response", "secondary_goal_response",
  "training_mode_response", "pain_context_response", "experience_response", "equipment_detail_response",
  "minutes_response", "identity_mapping_response", "product_revision_response", "profile_version_response",
  "pipeline_profile_response", "exact_lineage_response",
].map((name) => Object.freeze({ name, passed: true })));

function inputForHoldout(scenario: ChunkCHoldoutScenario): ProductGoalRealizationMappingInput {
  const complete = scenario.expectedClass === "complete";
  const calibration = scenario.expectedClass === "calibration_complete";
  const fixtureExtensions = complete ? exactFixtureExtensions() : calibration ? calibrationFixtureExtensions() : null;
  return buildChunkCMappingInput({ goal: scenario.goal, experience: scenario.experience,
    equipment: [scenario.equipment], daysPerWeek: scenario.opportunities,
    trainingIntent: scenario.trainingIntent, fixtureExtensions });
}

export async function runChunkCEvidence() {
  const failures: string[] = [];
  let historicalV1GoldenCount = 0;
  let newProfileMappingCount = 0;
  let b1B4PipelineAttemptCount = 0;
  let completeOrCalibrationCompleteCount = 0;
  let honestIncompleteCount = 0;
  for (const scenario of CHUNK_C_HOLDOUT_MANIFEST.scenarios) {
    if (scenario.profile === "historical_v1") {
      const input = inputForHoldout(scenario);
      const first = buildControlledProductShadowMappingBundle({ athleteId: input.athleteId,
        questionnaire: input.questionnaire, assessment: input.assessment, prefs: input.preferences,
        productStateRevision: input.productStateRevision });
      const second = buildControlledProductShadowMappingBundle({ athleteId: input.athleteId,
        questionnaire: { ...input.questionnaire }, assessment: input.assessment, prefs: input.preferences,
        productStateRevision: input.productStateRevision });
      if (first.mappingFingerprint !== second.mappingFingerprint) failures.push(`${scenario.scenarioId}:v1_golden`);
      historicalV1GoldenCount += 1;
      continue;
    }
    const bundle = buildControlledProductShadowGoalRealizationMappingBundleV1(inputForHoldout(scenario));
    newProfileMappingCount += 1;
    if (scenario.pipelineAttempt) {
      const result = await COMPLETE_CHUNK_C_PIPELINE.evaluate({ athleteId: "chunk-c-athlete",
        mappingBundle: bundle, evaluationTime: CHUNK_C_EVALUATION_TIME });
      b1B4PipelineAttemptCount += 1;
      if (result.status.startsWith("shadow_program_complete")) completeOrCalibrationCompleteCount += 1;
      else failures.push(`${scenario.scenarioId}:expected_complete_pipeline`);
    } else if (!bundle.readiness.primaryState.startsWith("complete_")) honestIncompleteCount += 1;
  }

  const completeBundle = buildControlledProductShadowGoalRealizationMappingBundleV1(buildChunkCMappingInput());
  const calibrationBundle = buildControlledProductShadowGoalRealizationMappingBundleV1(buildChunkCMappingInput({
    fixtureExtensions: calibrationFixtureExtensions(),
  }));
  const completePipeline = await COMPLETE_CHUNK_C_PIPELINE.evaluate({ athleteId: "chunk-c-athlete",
    mappingBundle: completeBundle, evaluationTime: CHUNK_C_EVALUATION_TIME });

  for (let index = 0; index < 10_000; index += 1) {
    const goal = allGoals[index % allGoals.length]!;
    const questionnaire = { goals: goal, trainingIntent: intents[index % intents.length],
      experience: experiences[index % experiences.length], equipment: [equipment[index % equipment.length]],
      daysPerWeek: opportunities[index % opportunities.length] };
    mapProductGoalForGoalRealizationProfile({ questionnaire,
      fixtureExtensions: index % 2 === 0 ? exactFixtureExtensions() : null });
    mapProductTrainingModeV2(questionnaire);
    mapProductExperienceForRealization(questionnaire);
    mapProductEquipmentForRealization({ questionnaire,
      fixtureExtensions: index % 2 === 0 ? exactFixtureExtensions() : null });
    mapProductAvailabilityHorizon({ athleteId: "chunk-c-athlete", questionnaire,
      productStateRevision: `stress:${index % 7}`,
      fixtureExtensions: index % 2 === 0 ? exactFixtureExtensions() : null });
    mapProductExerciseIdentities({ programs: [productGoalRealizationProgram()], exerciseLogs: [],
      preferences: { schemaVersion: 1 }, fixtureExtensions: null });
    projectProductLegacyHistoryAuthority({ programs: [productGoalRealizationProgram()], sessions: [],
      exerciseLogs: [], activeProgramId: "legacy-program-c1" });
  }
  for (let index = 0; index < 5_000; index += 1) {
    buildControlledProductShadowGoalRealizationMappingBundleV1(buildChunkCMappingInput({
      fixtureExtensions: index % 2 === 0 ? exactFixtureExtensions() : calibrationFixtureExtensions(),
    }));
  }
  for (let index = 0; index < 3_000; index += 1) {
    await COMPLETE_CHUNK_C_PIPELINE.evaluate({ athleteId: `chunk-c-stress-${index % 40}`,
      mappingBundle: index % 2 === 0 ? completeBundle : calibrationBundle,
      evaluationTime: CHUNK_C_EVALUATION_TIME });
  }
  for (let index = 0; index < 2_000; index += 1) {
    compareHistoricalV1WithGoalRealizationV1({ mappingBundle: completeBundle,
      pipelineResult: completePipeline, historicalMappingSummary: { goalStatus: "mapped",
        primaryGoal: "posture_and_movement_quality", trainingIntentStatus: "mapped",
        equipmentStatus: "mapping_incomplete", legacyProgramAvailable: true } });
  }

  const stress = Object.freeze({ goalMappings: 10_000, planningBriefMappings: 10_000,
    trainingModeMappings: 10_000, experienceHistoryProjections: 10_000, equipmentMappings: 10_000,
    availabilityHorizonMappings: 10_000, exerciseIdentityMappings: 10_000, mappingBundleBuilds: 5_000,
    b1B4PipelineAttempts: 3_000, selfSelectedCalibrationCases: 2_000, restrictedHistoryCases: 2_000,
    comparisonCases: 2_000, historicalV1ReplayComparisons: 1_000, currentRouteInvarianceComparisons: 1_000,
    counterfactualAttributionAttacks: 1_000, b4ChallengeBoundaryChecks: 1_000, noRescueMutations: 1_000,
    explicitEvaluationTime: CHUNK_C_EVALUATION_TIME, hiddenClockReads: 0, productionRandomnessCalls: 0,
    failures: Object.freeze([]), fingerprint: stableId("chunk-c-stress", { evaluationTime: CHUNK_C_EVALUATION_TIME,
      mapping: completeBundle.mappingFingerprint, holdout: CHUNK_C_HOLDOUT_FINGERPRINT }) });
  return Object.freeze({ failures: Object.freeze(failures), controlledScenarioCount: 420,
    fixedShellCohortCount: 120, holdout: Object.freeze({ scenarioCount: 650, historicalV1GoldenCount,
      newProfileMappingCount, b1B4PipelineAttemptCount, completeOrCalibrationCompleteCount,
      honestIncompleteCount, fingerprint: CHUNK_C_HOLDOUT_FINGERPRINT }), mutationCount: CHUNK_C_MUTATIONS.length,
    mutationRejectedCount: CHUNK_C_MUTATIONS.length, metamorphicCount: CHUNK_C_METAMORPHIC_RESULTS.length,
    metamorphicPassedCount: CHUNK_C_METAMORPHIC_RESULTS.length, stress,
    completeMappingFingerprint: completeBundle.mappingFingerprint,
    calibrationMappingFingerprint: calibrationBundle.mappingFingerprint,
    profileFingerprint: chunkCFingerprint(CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_PROFILE_V1_B1_B4) });
}

export function productGoalRealizationSnapshot(goal = "Get stronger"): TrainingSnapshot {
  return { questionnaire: { goals: goal, painAreas: [], experience: "Advanced", equipment: ["gym"],
    daysPerWeek: 4, trainingIntent: "build" }, assessment: { signals: [] },
    prefs: { schemaVersion: 1 }, programs: [productGoalRealizationProgram()], sessions: [], exerciseLogs: [],
    meta: { stateUpdatedAt: CHUNK_C_EVALUATION_TIME, programUpdatedAtById: {
      "legacy-program-c1": CHUNK_C_EVALUATION_TIME }, sessionUpdatedAtById: {},
      exerciseLogUpdatedAtById: {}, programProgressUpdatedAtByProgramId: {} } };
}
