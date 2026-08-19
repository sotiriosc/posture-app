import { TRAINING_OUTCOME_GOALS } from "../domain/sessionPlanningDirective";
import {
  PRODUCT_GOAL_ARCHITECTURE_ACTIVATION_STATES,
  PRODUCT_GOAL_ARCHITECTURE_CHUNK_STATES,
  PRODUCT_GOAL_ARCHITECTURE_IMPLEMENTATION_CHUNKS,
  PRODUCT_GOAL_ARCHITECTURE_MAPPING_STATES,
  PRODUCT_GOAL_ARCHITECTURE_PRIORITIES,
  PRODUCT_GOAL_ARCHITECTURE_PRODUCT_LABELS,
  PRODUCT_GOAL_ARCHITECTURE_PURPOSE_FIRST_ORDER,
  PRODUCT_GOAL_ARCHITECTURE_PURPOSE_LANES,
  PRODUCT_GOAL_ARCHITECTURE_PURPOSE_POLICY_STATES,
  PRODUCT_GOAL_ARCHITECTURE_TRAINING_MODES,
  PRODUCT_TRAINING_GOAL_ARCHITECTURE_POLICY_ID,
  PRODUCT_TRAINING_GOAL_ARCHITECTURE_POLICY_REFERENCE,
  PRODUCT_TRAINING_GOAL_ARCHITECTURE_POLICY_STATUS,
  PRODUCT_TRAINING_GOAL_ARCHITECTURE_POLICY_VERSION,
} from "./contracts";

type UnknownRecord = Readonly<Record<string, unknown>>;

function record(value: unknown): UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value) ?
    value as UnknownRecord : {};
}

function values(value: unknown): readonly unknown[] {
  return Array.isArray(value) ? value : [];
}

function sameOrderedValues(actual: unknown, expected: readonly unknown[]): boolean {
  const actualValues = values(actual);
  return actualValues.length === expected.length && actualValues.every((value, index) =>
    value === expected[index]);
}

function sameSet(actual: unknown, expected: readonly unknown[]): boolean {
  const actualValues = values(actual);
  return actualValues.length === expected.length &&
    expected.every((value) => actualValues.includes(value));
}

export function validateProductTrainingGoalArchitecturePolicy(value: unknown): readonly string[] {
  const policy = record(value);
  const reference = record(policy.policyReference);
  const vocabularies = record(policy.closedVocabularies);
  const priority = record(policy.goalPriority);
  const context = record(policy.programmingContext);
  const trainingMode = record(policy.trainingMode);
  const resolution = record(policy.prescriptionResolution);
  const purposes = record(policy.purposeLanes);
  const toning = record(policy.toningLanguage);
  const bodyComposition = record(policy.bodyComposition);
  const nutrition = record(policy.nutrition);
  const activation = record(policy.activation);
  const issues: string[] = [];

  if (reference.contractId !== PRODUCT_TRAINING_GOAL_ARCHITECTURE_POLICY_ID ||
      reference.contractVersion !== PRODUCT_TRAINING_GOAL_ARCHITECTURE_POLICY_VERSION ||
      reference.contractReference !== PRODUCT_TRAINING_GOAL_ARCHITECTURE_POLICY_REFERENCE) {
    issues.push("PRODUCT_GOAL_ARCHITECTURE_CONTRACT_REFERENCE_INVALID");
  }
  if (policy.status !== PRODUCT_TRAINING_GOAL_ARCHITECTURE_POLICY_STATUS || policy.executable !== false) {
    issues.push("PRODUCT_GOAL_ARCHITECTURE_POLICY_STATUS_INVALID");
  }
  if (!sameOrderedValues(policy.canonicalOutcomeGoals, TRAINING_OUTCOME_GOALS) ||
      values(policy.canonicalOutcomeGoals).includes("toning")) {
    issues.push("PRODUCT_GOAL_ARCHITECTURE_CANONICAL_OUTCOME_VOCABULARY_INVALID");
  }
  if (!sameOrderedValues(vocabularies.productLabels, PRODUCT_GOAL_ARCHITECTURE_PRODUCT_LABELS) ||
      !sameOrderedValues(vocabularies.goalPriorities, PRODUCT_GOAL_ARCHITECTURE_PRIORITIES) ||
      !sameOrderedValues(vocabularies.trainingModes, PRODUCT_GOAL_ARCHITECTURE_TRAINING_MODES) ||
      !sameOrderedValues(vocabularies.mappingStates, PRODUCT_GOAL_ARCHITECTURE_MAPPING_STATES) ||
      !sameOrderedValues(vocabularies.purposePolicyStates, PRODUCT_GOAL_ARCHITECTURE_PURPOSE_POLICY_STATES) ||
      !sameOrderedValues(vocabularies.activationStates, PRODUCT_GOAL_ARCHITECTURE_ACTIVATION_STATES) ||
      !sameOrderedValues(vocabularies.chunkStates, PRODUCT_GOAL_ARCHITECTURE_CHUNK_STATES)) {
    issues.push("PRODUCT_GOAL_ARCHITECTURE_CLOSED_VOCABULARY_INVALID");
  }

  const productVocabulary = values(policy.productVocabulary).map(record);
  const label = (id: string) => productVocabulary.find((entry) => entry.label === id);
  if (productVocabulary.length !== PRODUCT_GOAL_ARCHITECTURE_PRODUCT_LABELS.length ||
      !sameSet(productVocabulary.map((entry) => entry.label), PRODUCT_GOAL_ARCHITECTURE_PRODUCT_LABELS)) {
    issues.push("PRODUCT_GOAL_ARCHITECTURE_PRODUCT_VOCABULARY_INVALID");
  }
  const expectedDisplayDirections: Readonly<Record<string, string>> = {
    get_stronger: "Get stronger",
    build_muscle: "Build muscle",
    improve_fitness_and_stamina: "Improve fitness and stamina",
    improve_posture_and_movement: "Improve posture and movement",
    improve_athletic_performance: "Improve athletic performance",
  };
  if (productVocabulary.some((entry) => typeof entry.label !== "string" ||
      entry.displayDirection !== expectedDisplayDirections[entry.label])) {
    issues.push("PRODUCT_GOAL_ARCHITECTURE_PRODUCT_VOCABULARY_INVALID");
  }
  if (label("get_stronger")?.candidateOutcome !== "strength" ||
      label("build_muscle")?.candidateOutcome !== "hypertrophy" ||
      label("improve_posture_and_movement")?.candidateOutcome !== "posture_and_movement_quality") {
    issues.push("PRODUCT_GOAL_ARCHITECTURE_EXACT_CANDIDATE_MAPPING_INVALID");
  }
  if (label("improve_athletic_performance")?.candidateOutcome !== null ||
      label("improve_athletic_performance")?.mappingState !== "structured_follow_up_required" ||
      label("improve_fitness_and_stamina")?.candidateOutcome !== null) {
    issues.push("PRODUCT_GOAL_ARCHITECTURE_FOLLOW_UP_BOUNDARY_INVALID");
  }
  if (productVocabulary.some((entry) => entry.currentProductOption !== false ||
      entry.runtimeMappingImplemented !== false || entry.activationState !== "not_implemented")) {
    issues.push("PRODUCT_GOAL_ARCHITECTURE_PRODUCT_MAPPING_OR_ACTIVATION_CHANGED");
  }

  if (priority.primaryGoalCount !== 1 || priority.secondaryGoalMinimum !== 0 ||
      priority.secondaryGoalMaximum !== 1 || priority.ordered !== true ||
      priority.sameGoalMayOccupyBothPriorities !== false || priority.equalPriorityBagAllowed !== false) {
    issues.push("PRODUCT_GOAL_ARCHITECTURE_PRIORITY_POLICY_INVALID");
  }
  if (context.separateFromOutcome !== true || context.painAwareReturnIsContextOnly !== true ||
      context.painIsDiagnostic !== false) {
    issues.push("PRODUCT_GOAL_ARCHITECTURE_PROGRAMMING_CONTEXT_INVALID");
  }
  if (trainingMode.separateFromOutcome !== true ||
      !sameOrderedValues(trainingMode.values, PRODUCT_GOAL_ARCHITECTURE_TRAINING_MODES) ||
      trainingMode.currentBuildMeaning !== "developmental_progression_not_outcome") {
    issues.push("PRODUCT_GOAL_ARCHITECTURE_TRAINING_MODE_INVALID");
  }
  if (resolution.selectedArchitecture !== "G4_PURPOSE_FIRST_PLUS_G1_FAIL_CLOSED" ||
      !sameOrderedValues(resolution.purposeFirstOrder, PRODUCT_GOAL_ARCHITECTURE_PURPOSE_FIRST_ORDER) ||
      resolution.outcomeGoalRole !== "bounded_context_after_local_ownership_and_realization" ||
      resolution.missingPolicyBehavior !== "fail_closed" ||
      !sameOrderedValues(resolution.missingPolicyResults, ["POLICY_REQUIRED", "UNSUPPORTED_SCOPE"]) ||
      resolution.strengthFallthroughAllowed !== false || resolution.executableResolverImplemented !== false) {
    issues.push("PRODUCT_GOAL_ARCHITECTURE_G4_G1_RESOLUTION_INVALID");
  }
  if (!sameOrderedValues(purposes.values, PRODUCT_GOAL_ARCHITECTURE_PURPOSE_LANES) ||
      !values(purposes.futurePolicyRequired).includes("power_development") ||
      !values(purposes.futurePolicyRequired).includes("muscular_endurance") ||
      !values(purposes.futurePolicyRequired).includes("systemic_conditioning")) {
    issues.push("PRODUCT_GOAL_ARCHITECTURE_FUTURE_PURPOSE_LANES_INVALID");
  }
  if (toning.canonicalOutcome !== false || toning.initialState !== "T0_INTENTIONALLY_NOT_EXPOSED" ||
      toning.futurePreferredState !== "T2_STRUCTURED_CLARIFICATION" ||
      toning.directHighRepsShortRestResolutionAllowed !== false) {
    issues.push("PRODUCT_GOAL_ARCHITECTURE_TONING_POLICY_INVALID");
  }
  if (bodyComposition.owner !== "SEPARATE_PRODUCT_OR_PROFILE_OWNER_REQUIRED" ||
      bodyComposition.prescriptionOwnerAllowed !== false) {
    issues.push("PRODUCT_GOAL_ARCHITECTURE_BODY_COMPOSITION_OWNER_INVALID");
  }
  if (nutrition.owner !== "SEPARATE_NUTRITION_OWNER_REQUIRED" ||
      nutrition.prescriptionOwnerAllowed !== false || nutrition.fatLossPromiseFromRepRangeAllowed !== false) {
    issues.push("PRODUCT_GOAL_ARCHITECTURE_NUTRITION_OWNER_INVALID");
  }
  if (activation.productMappingChanged !== false || activation.productUiChanged !== false ||
      activation.shadowMappingChanged !== false || activation.shadowRolloutChanged !== false ||
      activation.v2Activated !== false || activation.publicProductApiChanged !== false ||
      activation.currentState !== "not_implemented") {
    issues.push("PRODUCT_GOAL_ARCHITECTURE_ACTIVATION_BOUNDARY_INVALID");
  }
  if (!sameOrderedValues(values(policy.stagedImplementation).map((entry) => record(entry).chunk),
      PRODUCT_GOAL_ARCHITECTURE_IMPLEMENTATION_CHUNKS)) {
    issues.push("PRODUCT_GOAL_ARCHITECTURE_STAGED_SEQUENCE_INVALID");
  }

  return Object.freeze([...new Set(issues)].sort());
}

export interface ProductGoalArchitectureSelectionInput {
  readonly primaryOutcomeGoal: string | null;
  readonly secondaryOutcomeGoal: string | null;
  readonly programmingContexts: readonly string[];
  readonly trainingMode: string;
}

export function validateProductGoalArchitectureSelection(
  input: ProductGoalArchitectureSelectionInput,
): readonly string[] {
  const issues: string[] = [];
  if (!input.primaryOutcomeGoal || !TRAINING_OUTCOME_GOALS.includes(
    input.primaryOutcomeGoal as typeof TRAINING_OUTCOME_GOALS[number])) {
    issues.push("PRODUCT_GOAL_ARCHITECTURE_EXACTLY_ONE_PRIMARY_OUTCOME_REQUIRED");
  }
  if (input.secondaryOutcomeGoal !== null && !TRAINING_OUTCOME_GOALS.includes(
    input.secondaryOutcomeGoal as typeof TRAINING_OUTCOME_GOALS[number])) {
    issues.push("PRODUCT_GOAL_ARCHITECTURE_SECONDARY_OUTCOME_INVALID");
  }
  if (input.secondaryOutcomeGoal !== null && input.secondaryOutcomeGoal === input.primaryOutcomeGoal) {
    issues.push("PRODUCT_GOAL_ARCHITECTURE_DUPLICATE_PRIMARY_SECONDARY_OUTCOME");
  }
  if (input.programmingContexts.some((context) => TRAINING_OUTCOME_GOALS.includes(
    context as typeof TRAINING_OUTCOME_GOALS[number]))) {
    issues.push("PRODUCT_GOAL_ARCHITECTURE_CONTEXT_CANNOT_BE_OUTCOME");
  }
  if (!PRODUCT_GOAL_ARCHITECTURE_TRAINING_MODES.includes(
    input.trainingMode as typeof PRODUCT_GOAL_ARCHITECTURE_TRAINING_MODES[number])) {
    issues.push("PRODUCT_GOAL_ARCHITECTURE_TRAINING_MODE_INVALID");
  }
  if (TRAINING_OUTCOME_GOALS.includes(input.trainingMode as typeof TRAINING_OUTCOME_GOALS[number])) {
    issues.push("PRODUCT_GOAL_ARCHITECTURE_TRAINING_MODE_CANNOT_BE_OUTCOME");
  }
  return Object.freeze([...new Set(issues)].sort());
}
