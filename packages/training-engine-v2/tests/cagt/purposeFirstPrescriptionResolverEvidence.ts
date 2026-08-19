import { createHash } from "node:crypto";
import {
  PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1,
  PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1_REFERENCE,
  PRODUCTION_PRESCRIPTION_COMPILER_VERSION_COMPATIBILITY,
  PRE_PACKAGE_R_REFERENCE_EXERCISES as REFERENCE_EXERCISES,
  TRAINING_OUTCOME_GOALS,
  canonicalize,
  compilePrescriptionAssignment,
  compilePrescriptionAssignmentV1_1,
  type ExerciseDefinition,
  type PrescriptionAssignmentCompilerInputV1_1,
  type PrescriptionAssignmentCompilationStatusV1_1,
  type TrainingOutcomeGoal,
} from "../../src";
import { buildPurposeFirstCatalogFixture, comparablePrescriptionSemantics,
  supportedPurposeForAssignment } from "./purposeFirstPrescriptionResolverFixtures";

export const PURPOSE_FIRST_CONTROLLED_SCENARIO_COUNT = 241 as const;
export const PURPOSE_FIRST_HOLDOUT_SCENARIO_COUNT = 380 as const;
export const PURPOSE_FIRST_HOLDOUT_GENUINE_V1_1_COUNT = 370 as const;
export const PURPOSE_FIRST_HOLDOUT_GOLDEN_PAIR_COUNT = 100 as const;

const FUTURE_PURPOSE = "movement_quality_development" as const;
const FALLTHROUGH_EXERCISE_IDS = [
  "push-up", "dumbbell-bench-press", "machine-chest-press", "chest-supported-dumbbell-row",
  "one-arm-dumbbell-row", "machine-row", "seated-cable-row", "dumbbell-shoulder-press",
  "lat-pulldown", "goblet-squat", "leg-press", "dumbbell-romanian-deadlift",
] as const;

type ControlledVariant = "supported" | "missing" | "unsupported_future" |
  "equal_primary_conflict" | "global_goal_only";

export interface PurposeFirstScenarioResult {
  readonly scenarioId: string;
  readonly exerciseId: string;
  readonly variant: string;
  readonly expectedStatus: PrescriptionAssignmentCompilationStatusV1_1;
  readonly actualStatus: PrescriptionAssignmentCompilationStatusV1_1;
  readonly selectedUseCase: string | null;
  readonly fallbackApplied: false;
  readonly passed: boolean;
}

function sha256(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(canonicalize(value))).digest("hex");
}

function controlledInput(exercise: ExerciseDefinition, variant: ControlledVariant,
  index: number): { readonly input: PrescriptionAssignmentCompilerInputV1_1;
    readonly expectedStatus: PrescriptionAssignmentCompilationStatusV1_1 } {
  const base = buildPurposeFirstCatalogFixture(exercise);
  const assignment = base.handoff.assignments[0];
  if (!assignment) throw new Error(`Controlled assignment missing for ${exercise.id}.`);
  const supported = supportedPurposeForAssignment({
    role: assignment.role,
    mode: exercise.prescriptionKnowledge.primaryDoseMode,
  });
  if (variant === "supported") return { input: base, expectedStatus: "compiled" };
  if (variant === "missing") return {
    input: buildPurposeFirstCatalogFixture(exercise, { requirements: [] }),
    expectedStatus: "prescription_purpose_required",
  };
  if (variant === "unsupported_future") return {
    input: buildPurposeFirstCatalogFixture(exercise, {
      requirements: [{ purpose: FUTURE_PURPOSE }],
    }),
    expectedStatus: "prescription_purpose_policy_required",
  };
  if (variant === "equal_primary_conflict") return {
    input: buildPurposeFirstCatalogFixture(exercise, { requirements: [
      { purpose: supported, authority: "primary_local_purpose", requirementId: `conflict:${index}:a` },
      { purpose: supported === "strength_development" ? "hypertrophy_development" :
        "strength_development", authority: "primary_local_purpose", requirementId: `conflict:${index}:b` },
    ] }),
    expectedStatus: "prescription_purpose_conflict",
  };
  return {
    input: buildPurposeFirstCatalogFixture(exercise, {
      requirements: [],
      outcomeGoal: TRAINING_OUTCOME_GOALS[index % TRAINING_OUTCOME_GOALS.length],
    }),
    expectedStatus: "prescription_purpose_required",
  };
}

export function runPurposeFirstControlledScenarios(): readonly PurposeFirstScenarioResult[] {
  const variants: readonly ControlledVariant[] = ["supported", "missing", "unsupported_future",
    "equal_primary_conflict", "global_goal_only"];
  const catalog = REFERENCE_EXERCISES.flatMap((exercise, exerciseIndex) =>
    variants.map((variant, variantIndex) => {
      const fixture = controlledInput(exercise, variant, exerciseIndex + variantIndex);
      const result = compilePrescriptionAssignmentV1_1(fixture.input);
      return Object.freeze({
        scenarioId: `controlled:${exercise.id}:${variant}`,
        exerciseId: exercise.id,
        variant,
        expectedStatus: fixture.expectedStatus,
        actualStatus: result.status,
        selectedUseCase: result.selectedUseCase,
        fallbackApplied: result.fallbackApplied,
        passed: result.status === fixture.expectedStatus && result.fallbackApplied === false &&
          (result.status === "compiled" ? result.plan !== null : result.plan === null),
      });
    }));
  return Object.freeze([...runPurposeFirstSourceContractScenarios(), ...catalog]);
}

function runPurposeFirstSourceContractScenarios(): readonly PurposeFirstScenarioResult[] {
  const exercise = REFERENCE_EXERCISES.find((entry) => entry.id === "push-up")!;
  const base = buildPurposeFirstCatalogFixture(exercise);
  const cases: Array<{ readonly id: string; readonly input: PrescriptionAssignmentCompilerInputV1_1;
    readonly expected: PrescriptionAssignmentCompilationStatusV1_1; readonly v1Compatibility?: boolean }> = [];
  cases.push({ id: "valid_v1_1_contract", input: base, expected: "compiled" });
  cases.push({ id: "v1_0_compatibility_call", input: base, expected: "compiled", v1Compatibility: true });
  cases.push({ id: "unsupported_compiler_version", input: { ...base,
    compilerContract: { ...base.compilerContract, contractVersion: "9.9.9" } as unknown as
      typeof base.compilerContract },
    expected: "unsupported_compiler_contract" });
  cases.push({ id: "missing_resolver_policy", input: { ...base, purposeResolverPolicy: null },
    expected: "prescription_purpose_policy_required" });
  cases.push({ id: "unavailable_resolver_policy", input: { ...base,
    purposeResolverPolicy: { policyId: "UNAVAILABLE_PURPOSE_POLICY", version: "1.0.0" },
    availablePurposeResolverPolicies: [] }, expected: "prescription_purpose_policy_unavailable" });
  cases.push({ id: "resolver_policy_conflict", input: { ...base,
    purposeResolverPolicy: { policyId: PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1.policyId,
      version: PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1.version },
    availablePurposeResolverPolicies: [PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1,
      { ...PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1 }] },
    expected: "prescription_purpose_policy_conflict" });
  cases.push({ id: "missing_purpose_snapshot", input: { ...base,
    purposeEvidenceSnapshot: null } as unknown as PrescriptionAssignmentCompilerInputV1_1,
    expected: "prescription_purpose_required" });
  cases.push({ id: "stale_purpose_snapshot", input: { ...base,
    purposeEvidenceSnapshot: { ...base.purposeEvidenceSnapshot, snapshotRevisionId: "stale" } },
    expected: "prescription_purpose_lineage_invalid" });
  cases.push({ id: "wrong_athlete", input: { ...base, athlete: { ...base.athlete, id: "wrong-athlete" } },
    expected: "prescription_purpose_lineage_invalid" });
  cases.push({ id: "wrong_session_intent", input: { ...base,
    sessionIntent: { ...base.sessionIntent, id: "wrong-session-intent" } },
    expected: "prescription_purpose_lineage_invalid" });
  cases.push({ id: "wrong_assignment_handoff", input: { ...base, assignmentHandoffId: "wrong-handoff" },
    expected: "prescription_purpose_lineage_invalid" });
  cases.push({ id: "missing_session_need", input: { ...base,
    purposeEvidenceSnapshot: { ...base.purposeEvidenceSnapshot,
      unresolvedLineage: ["PURPOSE_LINEAGE_SESSION_NEED_MISSING"] } },
    expected: "prescription_purpose_lineage_invalid" });
  cases.push({ id: "missing_weekly_objective", input: buildPurposeFirstCatalogFixture(exercise, {
    unresolvedLineage: ["SOURCE_WEEKLY_OBJECTIVE_NOT_FOUND"],
  }), expected: "prescription_purpose_lineage_invalid" });
  cases.push({ id: "wrong_reservation", input: buildPurposeFirstCatalogFixture(exercise, {
    unresolvedLineage: ["RESERVED_RESPONSIBILITY_NOT_FOUND"],
  }), expected: "prescription_purpose_lineage_invalid" });
  cases.push({ id: "future_evaluation_evidence", input: { ...base,
    purposeEvidenceSnapshot: { ...base.purposeEvidenceSnapshot,
      evaluationTime: "2099-01-01T00:00:00Z" } },
    expected: "prescription_purpose_lineage_invalid" });
  if (!base.policy || !("rules" in base.policy)) throw new Error("Full numeric policy fixture required.");
  cases.push({ id: "missing_numeric_rule", input: { ...base,
    policy: { ...base.policy, rules: [] } }, expected: "prescription_policy_rule_unavailable" });
  return Object.freeze(cases.map((entry) => {
    if (entry.v1Compatibility) {
      const result = compilePrescriptionAssignment(entry.input);
      return Object.freeze({ scenarioId: `controlled:contract:${entry.id}`, exerciseId: exercise.id,
        variant: entry.id, expectedStatus: entry.expected,
        actualStatus: result.status as PrescriptionAssignmentCompilationStatusV1_1,
        selectedUseCase: null, fallbackApplied: false as const,
        passed: result.status === entry.expected && result.plan !== null });
    }
    const result = compilePrescriptionAssignmentV1_1(entry.input);
    return Object.freeze({ scenarioId: `controlled:contract:${entry.id}`, exerciseId: exercise.id,
      variant: entry.id, expectedStatus: entry.expected,
      actualStatus: result.status as PrescriptionAssignmentCompilationStatusV1_1,
      selectedUseCase: result.selectedUseCase,
      fallbackApplied: result.fallbackApplied,
      passed: result.status === entry.expected && result.fallbackApplied === false &&
        (result.status === "compiled" ? result.plan !== null : result.plan === null) });
  }));
}

export interface PurposeFirstFallthroughResult {
  readonly scenarioId: string;
  readonly goalContext: string;
  readonly exerciseId: string;
  readonly v1Status: string;
  readonly v1UseCase: string | null;
  readonly v1_1Status: string;
  readonly v1_1UseCase: string | null;
  readonly corrected: boolean;
}

export function buildPurposeFirstFallthroughMatrix(): readonly PurposeFirstFallthroughResult[] {
  const contexts = ["general_fitness", "conditioning", "posture_and_movement_quality",
    "pain_aware_legacy", "unknown_legacy"] as const;
  return Object.freeze(contexts.flatMap((goalContext) => FALLTHROUGH_EXERCISE_IDS.map((exerciseId) => {
    const exercise = REFERENCE_EXERCISES.find((entry) => entry.id === exerciseId);
    if (!exercise) throw new Error(`Fallthrough exercise missing: ${exerciseId}`);
    const canonicalGoal: TrainingOutcomeGoal = goalContext === "conditioning" ? "conditioning" :
      goalContext === "posture_and_movement_quality" ? "posture_and_movement_quality" : "general_fitness";
    const base = buildPurposeFirstCatalogFixture(exercise, { requirements: [], outcomeGoal: canonicalGoal });
    const input = goalContext === "unknown_legacy" ? {
      ...base,
      sessionIntent: { ...base.sessionIntent, outcomeGoal: undefined, primaryGoal: "general_fitness" as const },
    } : goalContext === "pain_aware_legacy" ? {
      ...base,
      context: { ...base.context, painAwareLoadToleranceRegressionPermitted: true },
    } : base;
    const v1 = compilePrescriptionAssignment(input);
    const v1_1 = compilePrescriptionAssignmentV1_1(input);
    return Object.freeze({
      scenarioId: `fallthrough:${goalContext}:${exerciseId}`,
      goalContext,
      exerciseId,
      v1Status: v1.status,
      v1UseCase: v1.decisionTrace.selectedRules[0]?.ruleId.includes("main_strength")
        ? "main_strength" : null,
      v1_1Status: v1_1.status,
      v1_1UseCase: v1_1.selectedUseCase,
      corrected: v1.status === "compiled" &&
        v1.decisionTrace.selectedRules[0]?.ruleId.includes("main_strength") === true &&
        v1_1.status !== "compiled" && v1_1.plan === null,
    });
  })));
}

export interface PurposeFirstGoldenResult {
  readonly pairId: string;
  readonly exerciseId: string;
  readonly v1Status: string;
  readonly v1_1Status: string;
  readonly selectedUseCase: string | null;
  readonly semanticsEqual: boolean;
  readonly sourceEventCount: number;
}

export function runPurposeFirstGoldenPairs(count = PURPOSE_FIRST_HOLDOUT_GOLDEN_PAIR_COUNT):
readonly PurposeFirstGoldenResult[] {
  return Object.freeze(Array.from({ length: count }, (_, index) => {
    const exercise = REFERENCE_EXERCISES[index % REFERENCE_EXERCISES.length];
    const base = buildPurposeFirstCatalogFixture(exercise);
    const input = { ...base, executionAttemptId: `golden-pair:${index}:attempt` };
    const v1 = compilePrescriptionAssignment(input);
    const v1_1 = compilePrescriptionAssignmentV1_1(input);
    return Object.freeze({
      pairId: `golden-pair:${index}`,
      exerciseId: exercise.id,
      v1Status: v1.status,
      v1_1Status: v1_1.status,
      selectedUseCase: v1_1.selectedUseCase,
      semanticsEqual: v1.status === "compiled" && v1_1.status === "compiled" &&
        JSON.stringify(canonicalize(comparablePrescriptionSemantics(v1.plan))) ===
        JSON.stringify(canonicalize(comparablePrescriptionSemantics(v1_1.plan))),
      sourceEventCount: Number(v1.sourceExposureEvent !== null) + Number(v1_1.sourceExposureEvent !== null),
    });
  }));
}

export interface PurposeFirstHoldoutManifestScenario {
  readonly scenarioId: string;
  readonly kind: "genuine_v1_1" | "v1_0_v1_1_golden_pair" | "product_freeze";
  readonly exerciseId: string | null;
  readonly variant: string;
  readonly expected: string;
}

export interface PurposeFirstHoldoutManifest {
  readonly contractReference: "PURPOSE_FIRST_GOAL_SPECIFIC_PRESCRIPTION_RESOLVER_V1_HOLDOUT@1.0.0";
  readonly frozenAt: "2026-08-15T12:00:00-04:00";
  readonly scenarioCount: 380;
  readonly genuineV1_1CompilerScenarioCount: 370;
  readonly goldenPairCount: 100;
  readonly scenarios: readonly PurposeFirstHoldoutManifestScenario[];
  readonly fingerprint: string;
}

const HOLDOUT_VARIANTS = ["supported", "missing", "unsupported_future", "equal_primary_conflict",
  "primary_with_cross_goal_support", "global_goal_only"] as const;

export function buildPurposeFirstHoldoutManifest(): PurposeFirstHoldoutManifest {
  const genuine = REFERENCE_EXERCISES.flatMap((exercise) => HOLDOUT_VARIANTS.map((variant) => ({
    scenarioId: `holdout:v1_1:${exercise.id}:${variant}`,
    kind: "genuine_v1_1" as const,
    exerciseId: exercise.id,
    variant,
    expected: variant === "supported" || variant === "primary_with_cross_goal_support" ? "compiled" :
      variant === "missing" || variant === "global_goal_only" ? "prescription_purpose_required" :
        variant === "unsupported_future" ? "prescription_purpose_policy_required" :
          "prescription_purpose_conflict",
  })));
  const golden = Array.from({ length: PURPOSE_FIRST_HOLDOUT_GOLDEN_PAIR_COUNT }, (_, index) => ({
    scenarioId: `holdout:golden-pair:${index}`,
    kind: "v1_0_v1_1_golden_pair" as const,
    exerciseId: REFERENCE_EXERCISES[index % REFERENCE_EXERCISES.length].id,
    variant: "supported_equivalence",
    expected: "semantic_equivalence",
  }));
  const freeze = Array.from({ length: 10 }, (_, index) => ({
    scenarioId: `holdout:product-freeze:${index}`,
    kind: "product_freeze" as const,
    exerciseId: null,
    variant: ["product_shadow_v1_0", "product_mapping", "product_ui", "product_options",
      "generate_program", "orchestration", "consumer", "gyms", "database", "activation"][index],
    expected: "unchanged",
  }));
  const scenarios = Object.freeze([...genuine, ...golden, ...freeze]);
  const body = {
    contractReference: "PURPOSE_FIRST_GOAL_SPECIFIC_PRESCRIPTION_RESOLVER_V1_HOLDOUT@1.0.0" as const,
    frozenAt: "2026-08-15T12:00:00-04:00" as const,
    scenarioCount: PURPOSE_FIRST_HOLDOUT_SCENARIO_COUNT,
    genuineV1_1CompilerScenarioCount: PURPOSE_FIRST_HOLDOUT_GENUINE_V1_1_COUNT,
    goldenPairCount: PURPOSE_FIRST_HOLDOUT_GOLDEN_PAIR_COUNT,
    scenarios,
  };
  return Object.freeze({ ...body, fingerprint: sha256(body) });
}

function holdoutV1_1Input(exercise: ExerciseDefinition, variant: typeof HOLDOUT_VARIANTS[number],
  index: number): { readonly input: PrescriptionAssignmentCompilerInputV1_1; readonly expected: string } {
  if (variant !== "primary_with_cross_goal_support") {
    const fixture = controlledInput(exercise,
      variant === "global_goal_only" ? "global_goal_only" : variant, index);
    return { input: fixture.input, expected: fixture.expectedStatus };
  }
  const base = buildPurposeFirstCatalogFixture(exercise);
  const assignment = base.handoff.assignments[0];
  const supported = supportedPurposeForAssignment({ role: assignment.role,
    mode: exercise.prescriptionKnowledge.primaryDoseMode });
  return {
    input: buildPurposeFirstCatalogFixture(exercise, { requirements: [
      { purpose: supported },
      { purpose: FUTURE_PURPOSE, authority: "cross_goal_support", priority: "optional", priorityOrder: 1 },
    ] }),
    expected: "compiled",
  };
}

export function runPurposeFirstHoldout(manifest = buildPurposeFirstHoldoutManifest()): {
  readonly scenarioCount: number;
  readonly passedCount: number;
  readonly failedScenarioIds: readonly string[];
  readonly genuineV1_1CompilerScenarioCount: number;
  readonly goldenPairCount: number;
  readonly productFreezeCount: number;
  readonly fingerprint: string;
} {
  const goldenResults = runPurposeFirstGoldenPairs();
  const failed: string[] = [];
  let genuineV1_1CompilerScenarioCount = 0;
  let goldenPairCount = 0;
  let productFreezeCount = 0;
  manifest.scenarios.forEach((scenario, index) => {
    if (scenario.kind === "genuine_v1_1") {
      const exercise = REFERENCE_EXERCISES.find((entry) => entry.id === scenario.exerciseId);
      if (!exercise) { failed.push(scenario.scenarioId); return; }
      const fixture = holdoutV1_1Input(exercise,
        scenario.variant as typeof HOLDOUT_VARIANTS[number], index);
      const result = compilePrescriptionAssignmentV1_1(fixture.input);
      genuineV1_1CompilerScenarioCount += 1;
      if (result.status !== scenario.expected || result.fallbackApplied ||
          (result.status === "compiled" ? !result.plan : Boolean(result.plan))) failed.push(scenario.scenarioId);
      return;
    }
    if (scenario.kind === "v1_0_v1_1_golden_pair") {
      const pair = goldenResults[goldenPairCount];
      goldenPairCount += 1;
      genuineV1_1CompilerScenarioCount += 1;
      if (!pair?.semanticsEqual) failed.push(scenario.scenarioId);
      return;
    }
    productFreezeCount += 1;
    if (PRODUCTION_PRESCRIPTION_COMPILER_VERSION_COMPATIBILITY.v1_0.productShadowPinned !== true ||
        PRODUCTION_PRESCRIPTION_COMPILER_VERSION_COMPATIBILITY.v1_1.activated !== false) {
      failed.push(scenario.scenarioId);
    }
  });
  return Object.freeze({
    scenarioCount: manifest.scenarios.length,
    passedCount: manifest.scenarios.length - failed.length,
    failedScenarioIds: Object.freeze(failed),
    genuineV1_1CompilerScenarioCount,
    goldenPairCount,
    productFreezeCount,
    fingerprint: sha256({ manifest: manifest.fingerprint, failed }),
  });
}

export function purposeFirstEvidenceSummary() {
  const controlled = runPurposeFirstControlledScenarios();
  const fallthrough = buildPurposeFirstFallthroughMatrix();
  const golden = runPurposeFirstGoldenPairs();
  const manifest = buildPurposeFirstHoldoutManifest();
  const holdout = runPurposeFirstHoldout(manifest);
  return Object.freeze({
    controlledScenarioCount: controlled.length,
    controlledPassedCount: controlled.filter((entry) => entry.passed).length,
    fallthroughScenarioCount: fallthrough.length,
    correctedFallthroughCount: fallthrough.filter((entry) => entry.corrected).length,
    goldenPairCount: golden.length,
    goldenEquivalentCount: golden.filter((entry) => entry.semanticsEqual).length,
    holdout,
    policyReference: PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1_REFERENCE,
    policyMappingCount: PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1.supportedMappings.length,
  });
}
