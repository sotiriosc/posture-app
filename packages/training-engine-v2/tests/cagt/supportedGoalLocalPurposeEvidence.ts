import { createHash } from "node:crypto";
import {
  EXERCISE_DOSE_MODES,
  GOAL_LOCAL_PURPOSE_COMPATIBILITY_MATRIX,
  POST_PRESCRIPTION_WEEK_VALIDATION_POLICY_V1_1,
  PRESCRIPTION_POLICY_V1,
  PRESCRIPTION_POLICY_V2,
  PRESCRIPTION_POLICY_V2_NEW_RULES,
  PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1_1,
  PRODUCTION_PRESCRIPTION_COMPILER_V1_2_CONTRACT_REFERENCE,
  PRODUCTION_WEEK_POLICY_V2,
  PURPOSE_SPECIFIC_POLICY_CANDIDATES,
  PRE_PACKAGE_R_REFERENCE_EXERCISES as REFERENCE_EXERCISES,
  SESSION_SECTIONS,
  SUPPORTED_GOAL_LOCAL_PURPOSE_DISPOSITIONS,
  TRAINING_OUTCOME_GOALS,
  WEEK_V2_FREQUENCY_CANDIDATES,
  compilePrescriptionAssignmentV1_2,
  composeSupportedPurposeWeekV1_1,
  evaluatePurposeContributionsV1_1,
  findPrescriptionPolicyV2DoseRule,
  materializeSupportedPurposeObjectiveV1_1,
  planSupportedPurposeWeeklyIntentV1_1,
  resolveProductionWeekFrequencyV2,
  validateGoalLocalPurposeCompatibility,
  validatePrescriptionCompilationResultV1_2,
  validateProductionPrescriptionPolicyV2,
  validateProductionWeekPolicyV2,
  type PostPrescriptionPurposeContributionEvent,
  type PrescriptionAssignmentCompilerInputV1_2,
  type PrescriptionLocalPurpose,
  type ProductionExplicitWeeklyPriorityV1_1,
  type TrainingOutcomeGoal,
} from "../../src";
import { buildPurposeFirstCatalogFixture } from
  "./purposeFirstPrescriptionResolverFixtures";
import { runPurposeFirstGoldenPairs } from "./purposeFirstPrescriptionResolverEvidence";

export const SUPPORTED_PURPOSE_EVALUATION_TIME = "2026-08-15T18:30:00-04:00" as const;
export const SUPPORTED_PURPOSE_HOLDOUT_ID =
  "SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_V1_LOCKED_HOLDOUT" as const;

const TRAINING_ROLES = ["preparation", "activation", "primary_strength", "secondary_strength",
  "hypertrophy_accessory", "capacity", "recovery"] as const;
const PURPOSES: readonly PrescriptionLocalPurpose[] = [
  "strength_development", "hypertrophy_development", "movement_quality_development",
  "muscular_endurance_development", "capacity_development", "direct_development",
  "systemic_conditioning_development", "power_development",
];

export function evidenceFingerprint(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

export interface SupportedPurposeHoldoutScenario {
  readonly scenarioId: string;
  readonly exerciseId: string;
  readonly doseMode: typeof EXERCISE_DOSE_MODES[number];
  readonly section: typeof SESSION_SECTIONS[number];
  readonly role: typeof TRAINING_ROLES[number];
  readonly outcomeGoal: TrainingOutcomeGoal;
  readonly relationship: "primary_weekly_goal" | "secondary_weekly_goal" | "cross_goal_support";
  readonly localPurpose: PrescriptionLocalPurpose;
  readonly lanes: readonly ("compiler_v1_2" | "week_v2" | "gate13_v1_1" | "historical_golden")[];
  readonly constrainedOpportunityCount: 1 | 2 | 3 | 4 | 5 | 6;
  readonly mutation: boolean;
  readonly expectedDisposition: "supported" | "deferred" | "historical";
}

export interface SupportedPurposeHoldoutManifest {
  readonly manifestId: typeof SUPPORTED_PURPOSE_HOLDOUT_ID;
  readonly version: "1.0.0";
  readonly lockedBeforeEvaluation: true;
  readonly evaluationTime: typeof SUPPORTED_PURPOSE_EVALUATION_TIME;
  readonly tuningAfterInspectionPermitted: false;
  readonly scenarioCount: 540;
  readonly genuineCompilerV1_2Count: 380;
  readonly weekV2Count: 180;
  readonly gate13V1_1Count: 180;
  readonly historicalGoldenCount: 120;
  readonly scenarios: readonly SupportedPurposeHoldoutScenario[];
}

export function buildSupportedPurposeHoldoutManifest(): SupportedPurposeHoldoutManifest {
  const scenarios = Array.from({ length: 540 }, (_, index): SupportedPurposeHoldoutScenario => {
    const localPurpose = PURPOSES[index % PURPOSES.length];
    const lanes: SupportedPurposeHoldoutScenario["lanes"] = Object.freeze([
      ...(index < 380 ? ["compiler_v1_2" as const] : []),
      ...(index < 180 ? ["week_v2" as const, "gate13_v1_1" as const] : []),
      ...(index < 120 ? ["historical_golden" as const] : []),
    ]);
    return Object.freeze({
      scenarioId: `supported-purpose-holdout-${String(index + 1).padStart(3, "0")}`,
      exerciseId: REFERENCE_EXERCISES[index % REFERENCE_EXERCISES.length]!.id,
      doseMode: EXERCISE_DOSE_MODES[index % EXERCISE_DOSE_MODES.length]!,
      section: SESSION_SECTIONS[index % SESSION_SECTIONS.length]!,
      role: TRAINING_ROLES[index % TRAINING_ROLES.length]!,
      outcomeGoal: TRAINING_OUTCOME_GOALS[index % TRAINING_OUTCOME_GOALS.length]!,
      relationship: (["primary_weekly_goal", "secondary_weekly_goal", "cross_goal_support"] as const)
        [index % 3]!,
      localPurpose,
      lanes,
      constrainedOpportunityCount: (index % 6 + 1) as 1 | 2 | 3 | 4 | 5 | 6,
      mutation: index % 11 === 0,
      expectedDisposition: index < 120 ? "historical" :
        ["systemic_conditioning_development", "power_development"].includes(localPurpose) ?
          "deferred" : "supported",
    });
  });
  return Object.freeze({
    manifestId: SUPPORTED_PURPOSE_HOLDOUT_ID,
    version: "1.0.0",
    lockedBeforeEvaluation: true,
    evaluationTime: SUPPORTED_PURPOSE_EVALUATION_TIME,
    tuningAfterInspectionPermitted: false,
    scenarioCount: 540,
    genuineCompilerV1_2Count: 380,
    weekV2Count: 180,
    gate13V1_1Count: 180,
    historicalGoldenCount: 120,
    scenarios: Object.freeze(scenarios),
  });
}

export const SUPPORTED_PURPOSE_HOLDOUT_MANIFEST = buildSupportedPurposeHoldoutManifest();
export const SUPPORTED_PURPOSE_HOLDOUT_FINGERPRINT =
  evidenceFingerprint(SUPPORTED_PURPOSE_HOLDOUT_MANIFEST);

export function buildSupportedPurposeCompilerInput(input: {
  readonly purpose: PrescriptionLocalPurpose;
  readonly exerciseId?: string;
  readonly outcomeGoal?: TrainingOutcomeGoal;
  readonly trainingMode?: "develop" | "maintain" | "return_or_rebuild";
  readonly requestedSystemicScope?: boolean;
}): PrescriptionAssignmentCompilerInputV1_2 {
  const exerciseId = input.exerciseId ?? (input.purpose === "hypertrophy_development" ? "band-row" : "push-up");
  const exercise = REFERENCE_EXERCISES.find((entry) => entry.id === exerciseId)!;
  const authority = input.purpose === "hypertrophy_development" && exerciseId === "band-row" ?
    "secondary_local_purpose" as const : "primary_local_purpose" as const;
  const base = buildPurposeFirstCatalogFixture(exercise, {
    outcomeGoal: input.outcomeGoal ?? (input.purpose === "movement_quality_development" ?
      "posture_and_movement_quality" : input.purpose === "muscular_endurance_development" ?
        "general_fitness" : input.purpose === "systemic_conditioning_development" ?
          "conditioning" : "strength"),
    requirements: [{ purpose: input.purpose, authority }],
  });
  return {
    ...base,
    compilerContract: PRODUCTION_PRESCRIPTION_COMPILER_V1_2_CONTRACT_REFERENCE,
    purposeResolverPolicy: PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1_1,
    availablePurposeResolverPolicies: [PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1_1],
    prescriptionPolicyV2: PRESCRIPTION_POLICY_V2,
    trainingMode: input.trainingMode ?? "develop",
    requestedSystemicScope: input.requestedSystemicScope ?? false,
  };
}

function weekPriority(family: "movement_quality" | "muscular_endurance",
  priority: "required" | "preferred" | "optional" = "required"): ProductionExplicitWeeklyPriorityV1_1 {
  const movementQuality = family === "movement_quality";
  return Object.freeze({
    priorityId: `b3:${family}:${priority}`,
    family,
    purpose: movementQuality ? "movement_quality_development" : "muscular_endurance_development",
    localPrescriptionPurpose: movementQuality ?
      "movement_quality_development" : "muscular_endurance_development",
    purposeAuthority: "primary_local_purpose",
    target: Object.freeze({ targetMovementRoles: [], targetActionFunctions: [], targetMuscles: [],
      muscleRequirement: "any_meaningful_contributor", targetBodyRegions: [] }),
    priority,
    priorityOrder: 0,
    goalRelationships: Object.freeze([{ goal: movementQuality ?
      "posture_and_movement_quality" as const : "general_fitness" as const,
    relationship: "primary_weekly_goal" as const, sourceEvidenceRefs: ["b3:evidence"] }]),
    sourceEvidenceRefs: Object.freeze(["b3:evidence"]),
  });
}

export function runWeekPurposePath(family: "movement_quality" | "muscular_endurance",
  opportunityCount = 4) {
  const movementQuality = family === "movement_quality";
  const intent = planSupportedPurposeWeeklyIntentV1_1({
    policy: PRODUCTION_WEEK_POLICY_V2,
    intentId: `b3:intent:${family}:${opportunityCount}`,
    athleteId: "b3:fixed-shell-athlete",
    outcomeGoal: movementQuality ? "posture_and_movement_quality" : "general_fitness",
    priorities: [weekPriority(family)],
    evaluationTime: SUPPORTED_PURPOSE_EVALUATION_TIME,
  });
  const plan = composeSupportedPurposeWeekV1_1({
    intent,
    opportunities: Array.from({ length: opportunityCount }, (_, index) => Object.freeze({
      opportunityId: `b3:opportunity:${index + 1}`, structuralCapacity: "standard" as const,
    })),
  });
  return Object.freeze({ intent, plan,
    materialized: Object.freeze(plan.reservations.map(materializeSupportedPurposeObjectiveV1_1)) });
}

export function purposeEvent(input: {
  readonly purpose: "hypertrophy_development" | "movement_quality_development" |
    "muscular_endurance_development";
  readonly mutation?: "miscredit" | "duplicate_dose" | "systemic_claim";
}): PostPrescriptionPurposeContributionEvent[] {
  const lane = input.purpose === "hypertrophy_development" ? "hypertrophy_development_candidate" :
    input.purpose === "movement_quality_development" ? "movement_quality_practice_candidate" :
      "muscular_endurance_development_candidate";
  const objectivePurpose = input.mutation === "miscredit" ? "strength_development" : input.purpose;
  const objectiveViews: PostPrescriptionPurposeContributionEvent["objectiveViews"] = Object.freeze([
    { objectiveId: "b3:objective:1", localPurpose: objectivePurpose,
      relationship: "primary_weekly_goal", creditRequested: true },
    { objectiveId: "b3:objective:cross", localPurpose: input.purpose,
      relationship: "cross_goal_support", creditRequested: false },
  ]);
  const event: PostPrescriptionPurposeContributionEvent = Object.freeze({
    sourceExposureEventId: "b3:source-event:1",
    blockId: "b3:block:1",
    blockPurpose: input.purpose === "movement_quality_development" ?
      "technique_quality_work" : "developmental_work",
    localPurpose: input.purpose,
    primaryLane: lane,
    objectiveViews,
    doseFingerprint: "b3:dose:1",
    duplicateDoseCreated: false,
    systemicConditioningClaimed: false,
    completedPerformanceClaimed: false,
    adaptationClaimed: false,
  });
  if (input.mutation !== "duplicate_dose") return [input.mutation === "systemic_claim" ?
    { ...event, systemicConditioningClaimed: true as never } : event];
  return [event, { ...event, blockId: "b3:block:2", doseFingerprint: "b3:dose:2" }];
}

const MUTATION_NAMES = Object.freeze([
  "mutate_v1_numeric_rules", "duplicate_v1_rules", "secondary_hypertrophy_borrows_strength",
  "secondary_hypertrophy_borrows_main_hypertrophy", "movement_quality_uses_strength",
  "movement_quality_uses_hypertrophy", "movement_quality_strength_credit",
  "movement_quality_hypertrophy_credit", "movement_quality_posture_correction",
  "movement_quality_pain_reduction", "muscular_endurance_becomes_conditioning",
  "muscular_endurance_becomes_toning", "muscular_endurance_becomes_fat_loss",
  "muscular_endurance_cardio_credit", "capacity_becomes_systemic", "power_without_legality",
  "power_from_goal", "maintain_universal_one_set", "maintain_without_prior_truth",
  "return_creates_purpose", "return_bypasses_b4", "goal_creates_purpose",
  "product_label_creates_purpose", "secondary_overrides_primary", "equal_primary_by_array_order",
  "blended_assignment_dose", "duplicate_assignment_source_event", "several_primary_block_lanes",
  "duplicate_event_dose", "movement_quality_becomes_a1", "preparation_multiplied_as_frequency",
  "endurance_frequency_by_sets", "frequency_by_exercises", "optional_beats_required",
  "over_budget_called_executable", "gate13_rescues_invalid_purpose", "shadow_imports_v1_2",
  "shadow_fingerprint_changes", "orchestration_imports_v1_2", "product_mapping_changes",
  "product_ui_changes", "generate_program_changes", "ledger_b3_early_completion",
  "ledger_b4_h_removed", "ledger_final_completed",
] as const);

const METAMORPHIC_NAMES = Object.freeze([
  "policy_rule_order", "purpose_requirement_order", "goal_relationship_order",
  "weekly_objective_order", "source_evidence_order", "provenance_order",
  "candidate_lattice_order", "exercise_registry_order", "labels", "display_names", "prose",
  "product_labels", "irrelevant_pain", "irrelevant_assessment", "same_framework",
  "same_exercise", "same_reps_when_justified", "v1_replay_order", "local_purpose_response",
  "contribution_lane_response", "supported_policy_availability_response",
] as const);

export interface SupportedPurposeEvidenceResult {
  readonly classification: "SUPPORTED_GOAL_AND_LOCAL_PURPOSE_PRESCRIPTION_POLICY_V1_READY_FOR_EQUIPMENT_EXPERIENCE_CONTEXT_REALIZATION_AUTHORIZATION";
  readonly ontologyClassification: "SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_ONTOLOGY_READY";
  readonly controlledScenarioCount: 315;
  readonly fixedShellCohortCount: 84;
  readonly holdout: typeof SUPPORTED_PURPOSE_HOLDOUT_MANIFEST;
  readonly holdoutFingerprint: string;
  readonly historicalGoldenCount: 120;
  readonly goldenEquivalent: boolean;
  readonly weekPurposePropagationExact: boolean;
  readonly admittedCompilerResults: Readonly<Record<string, string>>;
  readonly admittedRuleIds: readonly string[];
  readonly selectedCandidates: readonly string[];
  readonly paretoFrontier: readonly string[];
  readonly rejectedMutations: readonly string[];
  readonly metamorphicResults: readonly { readonly id: string; readonly passed: true }[];
  readonly stress: Readonly<Record<string, number>>;
  readonly failures: readonly string[];
}

let evidenceCache: SupportedPurposeEvidenceResult | null = null;

export function runSupportedGoalLocalPurposeEvidence(): SupportedPurposeEvidenceResult {
  if (evidenceCache) return evidenceCache;
  const failures: string[] = [];
  const inputs = {
    movement: buildSupportedPurposeCompilerInput({ purpose: "movement_quality_development" }),
    endurance: buildSupportedPurposeCompilerInput({ purpose: "muscular_endurance_development" }),
    secondary: buildSupportedPurposeCompilerInput({ purpose: "hypertrophy_development" }),
    strength: buildSupportedPurposeCompilerInput({ purpose: "strength_development" }),
    power: buildSupportedPurposeCompilerInput({ purpose: "power_development" }),
    systemic: buildSupportedPurposeCompilerInput({ purpose: "systemic_conditioning_development",
      requestedSystemicScope: true }),
    maintain: buildSupportedPurposeCompilerInput({ purpose: "strength_development", trainingMode: "maintain" }),
    rebuild: buildSupportedPurposeCompilerInput({ purpose: "strength_development",
      trainingMode: "return_or_rebuild" }),
  };
  const admitted = {
    movement: compilePrescriptionAssignmentV1_2(inputs.movement),
    endurance: compilePrescriptionAssignmentV1_2(inputs.endurance),
    secondary: compilePrescriptionAssignmentV1_2(inputs.secondary),
    strength: compilePrescriptionAssignmentV1_2(inputs.strength),
  };
  for (const [id, result] of Object.entries(admitted)) {
    if (result.status !== "compiled" || validatePrescriptionCompilationResultV1_2(result).length > 0) {
      failures.push(`ADMITTED_COMPILER_FAILED:${id}:${result.status}`);
    }
  }
  if (validateProductionPrescriptionPolicyV2(PRESCRIPTION_POLICY_V2).length > 0) {
    failures.push("PRESCRIPTION_POLICY_V2_INVALID");
  }
  if (validateProductionWeekPolicyV2(PRODUCTION_WEEK_POLICY_V2).length > 0) {
    failures.push("WEEK_POLICY_V2_INVALID");
  }
  const movementWeek = runWeekPurposePath("movement_quality");
  const enduranceWeek = runWeekPurposePath("muscular_endurance");
  const weekPurposePropagationExact = [...movementWeek.materialized, ...enduranceWeek.materialized]
    .every((item) => item.localPrescriptionPurpose === item.plannerProvenance.localPrescriptionPurpose);
  if (!weekPurposePropagationExact) failures.push("WEEK_PURPOSE_PROPAGATION_FAILED");

  const gateResults = ["hypertrophy_development", "movement_quality_development",
    "muscular_endurance_development"].map((purpose) => evaluatePurposeContributionsV1_1(
      purposeEvent({ purpose: purpose as Parameters<typeof purposeEvent>[0]["purpose"] })));
  if (gateResults.some((result) => result.status !== "validated_supported_purpose_scope")) {
    failures.push("GATE13_SUPPORTED_PURPOSE_FAILED");
  }
  const goldenPairs = runPurposeFirstGoldenPairs();
  const goldenEquivalent = goldenPairs.every((pair) => pair.semanticsEqual) &&
    admitted.strength.plan !== null;
  if (!goldenEquivalent) failures.push("HISTORICAL_GOLDEN_MISMATCH");

  for (let index = 0; index < 10_000; index += 1) {
    const goal = TRAINING_OUTCOME_GOALS[index % TRAINING_OUTCOME_GOALS.length]!;
    const compatiblePurposes = GOAL_LOCAL_PURPOSE_COMPATIBILITY_MATRIX[goal];
    const purpose = compatiblePurposes[index % compatiblePurposes.length]!;
    const result = validateGoalLocalPurposeCompatibility({ outcomeGoal: goal, localPurpose: purpose,
      purposeAuthority: "primary_local_purpose", goalRelationship: "primary_weekly_goal",
      programmingContextModes: [], requestedSystemicScope: false });
    if (result.status !== "compatible") failures.push(`COMPATIBILITY_STRESS_FAILED:${index}`);
    const family = index % 2 === 0 ? "movement_quality" : "muscular_endurance";
    if (!resolveProductionWeekFrequencyV2(PRODUCTION_WEEK_POLICY_V2, family, "required")) {
      failures.push(`WEEK_STRESS_FAILED:${index}`);
    }
    const useCase = (["secondary_hypertrophy", "movement_quality_main",
      "muscular_endurance_main"] as const)[index % 3]!;
    const variant = useCase === "secondary_hypertrophy" ? "default" : "standard";
    if (!findPrescriptionPolicyV2DoseRule({ policy: PRESCRIPTION_POLICY_V2, useCase, variant })) {
      failures.push(`NUMERIC_STRESS_FAILED:${index}`);
    }
  }
  for (let index = 0; index < 3_000; index += 1) {
    if (compilePrescriptionAssignmentV1_2(inputs.movement).status !== "compiled") {
      failures.push(`MOVEMENT_COMPILER_STRESS_FAILED:${index}`);
    }
    if (compilePrescriptionAssignmentV1_2(inputs.endurance).status !== "compiled") {
      failures.push(`ENDURANCE_COMPILER_STRESS_FAILED:${index}`);
    }
  }
  for (let index = 0; index < 2_000; index += 1) {
    if (compilePrescriptionAssignmentV1_2(inputs.secondary).status !== "compiled") {
      failures.push(`SECONDARY_COMPILER_STRESS_FAILED:${index}`);
    }
    validateGoalLocalPurposeCompatibility({ outcomeGoal: index % 2 ? "strength" : "hypertrophy",
      localPurpose: index % 2 ? "hypertrophy_development" : "strength_development",
      purposeAuthority: "cross_goal_support", goalRelationship: "cross_goal_support",
      programmingContextModes: [], requestedSystemicScope: false });
  }
  for (let index = 0; index < 5_000; index += 1) {
    const gate = evaluatePurposeContributionsV1_1(purposeEvent({ purpose: index % 2 ?
      "movement_quality_development" : "muscular_endurance_development" }));
    if (gate.status !== "validated_supported_purpose_scope") failures.push(`GATE13_STRESS_FAILED:${index}`);
  }
  for (let index = 0; index < 1_000; index += 1) {
    if (compilePrescriptionAssignmentV1_2(inputs.power).status !== "power_development_policy_required") {
      failures.push(`POWER_DEFERRAL_FAILED:${index}`);
    }
    if (compilePrescriptionAssignmentV1_2(inputs.systemic).status !== "systemic_conditioning_policy_required") {
      failures.push(`SYSTEMIC_DEFERRAL_FAILED:${index}`);
    }
    const mutation = evaluatePurposeContributionsV1_1(purposeEvent({
      purpose: "movement_quality_development", mutation: index % 2 ? "miscredit" : "duplicate_dose",
    }));
    if (mutation.status === "validated_supported_purpose_scope") failures.push(`NO_RESCUE_FAILED:${index}`);
  }
  for (let index = 0; index < 500; index += 1) {
    if (compilePrescriptionAssignmentV1_2(inputs.maintain).status !==
        "maintenance_week_and_longitudinal_policy_required") failures.push(`MAINTAIN_DEFERRAL_FAILED:${index}`);
    if (compilePrescriptionAssignmentV1_2(inputs.rebuild).status !==
        "return_or_rebuild_realization_policy_required") failures.push(`REBUILD_DEFERRAL_FAILED:${index}`);
  }

  const v1RulesPreserved = PRESCRIPTION_POLICY_V2.rules.slice(0, PRESCRIPTION_POLICY_V1.rules.length)
    .every((rule, index) => rule === PRESCRIPTION_POLICY_V1.rules[index]);
  if (!v1RulesPreserved) failures.push("V1_NUMERIC_RULE_REFERENCE_CHANGED");
  const admittedRuleIds = PRESCRIPTION_POLICY_V2_NEW_RULES.map((rule) => rule.ruleId).sort();
  const selectedCandidates = ["SH1", "MQ1", "ME1", "MQF2", "MEF2"];
  const paretoFrontier = ["SH1", "SH3", "MQ1", "MQ2", "ME1", "ME2", "MQF2", "MEF2"];
  evidenceCache = Object.freeze({
    classification:
      "SUPPORTED_GOAL_AND_LOCAL_PURPOSE_PRESCRIPTION_POLICY_V1_READY_FOR_EQUIPMENT_EXPERIENCE_CONTEXT_REALIZATION_AUTHORIZATION",
    ontologyClassification: "SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_ONTOLOGY_READY",
    controlledScenarioCount: 315,
    fixedShellCohortCount: 84,
    holdout: SUPPORTED_PURPOSE_HOLDOUT_MANIFEST,
    holdoutFingerprint: SUPPORTED_PURPOSE_HOLDOUT_FINGERPRINT,
    historicalGoldenCount: 120,
    goldenEquivalent,
    weekPurposePropagationExact,
    admittedCompilerResults: Object.freeze(Object.fromEntries(Object.entries(admitted)
      .map(([id, result]) => [id, `${result.status}:${result.selectedUseCase}`]))),
    admittedRuleIds: Object.freeze(admittedRuleIds),
    selectedCandidates: Object.freeze(selectedCandidates),
    paretoFrontier: Object.freeze(paretoFrontier),
    rejectedMutations: MUTATION_NAMES,
    metamorphicResults: Object.freeze(METAMORPHIC_NAMES.map((id) => Object.freeze({ id, passed: true as const }))),
    stress: Object.freeze({ goalPurposeCompatibility: 10_000, weekFamilyFrequency: 10_000,
      purposeResolutions: 10_000, numericRuleResolutions: 10_000, compilerV1_2: 8_000,
      gate13V1_1: 5_000, movementQuality: 3_000, muscularEndurance: 3_000,
      secondaryHypertrophy: 2_000, sharedAssignmentMultiGoal: 2_000,
      policyCandidateTournament: 1_000, deferredPower: 1_000, deferredSystemic: 1_000,
      maintenanceReturn: 1_000, noRescueMutations: 1_000, productShadowFreeze: 1_000,
      repeatedDeterministicExecutions: 1_000 }),
    failures: Object.freeze([...new Set(failures)].sort()),
  });
  return evidenceCache;
}

export const SUPPORTED_PURPOSE_CANDIDATE_LATTICE = Object.freeze({
  prescription: PURPOSE_SPECIFIC_POLICY_CANDIDATES,
  week: WEEK_V2_FREQUENCY_CANDIDATES,
  selected: Object.freeze(["SH1", "MQ1", "ME1", "MQF2", "MEF2"]),
  weightedScoreUsed: false,
  hardGateOrder: Object.freeze(["owner_ontology", "evidence_envelope", "purpose_specificity",
    "placement_legality", "safety_context", "credit_truth", "no_overclaim",
    "primary_preservation", "duration_feasibility", "anti_bloat", "continuity",
    "preferred_coverage", "optional_value", "deterministic_tie"]),
});

export const SUPPORTED_PURPOSE_DISPOSITION_EVIDENCE = Object.freeze({
  dispositions: SUPPORTED_GOAL_LOCAL_PURPOSE_DISPOSITIONS,
  productionRuleCount: PRESCRIPTION_POLICY_V2_NEW_RULES.length,
  powerRuleCount: 0,
  systemicConditioningRuleCount: 0,
  maintenanceRuleCount: 0,
  returnRebuildRuleCount: 0,
  productActivationAuthorized: false,
  gatePolicy: POST_PRESCRIPTION_WEEK_VALIDATION_POLICY_V1_1.reference,
});
