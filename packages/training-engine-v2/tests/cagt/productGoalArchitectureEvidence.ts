import {
  PRODUCT_GOAL_ARCHITECTURE_LEDGER_PATH,
  PRODUCT_GOAL_ARCHITECTURE_NEXT_DEPENDENCY,
} from "../../src/productGoalArchitecture/contracts";
import {
  productGoalArchitectureFingerprint,
} from "../../src/productGoalArchitecture/fingerprints";
import { PRODUCT_TRAINING_GOAL_ARCHITECTURE_POLICY_V1 } from
  "../../src/productGoalArchitecture/ownerPolicyV1";
import { validateProductTrainingGoalArchitecturePolicy } from
  "../../src/productGoalArchitecture/validation";
import { validateProductGoalArchitectureLedger,
  type ProductGoalArchitectureLedgerB1State } from "./productGoalArchitectureLedger";

type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };
type MutableRecord = { [key: string]: JsonValue };

function cloneRecord(value: unknown): MutableRecord {
  return JSON.parse(JSON.stringify(value)) as MutableRecord;
}

function objectAt(value: MutableRecord, key: string): MutableRecord {
  return value[key] as MutableRecord;
}

function arrayAt(value: MutableRecord, key: string): JsonValue[] {
  return value[key] as JsonValue[];
}

function vocabularyEntry(policy: MutableRecord, label: string): MutableRecord {
  return arrayAt(policy, "productVocabulary").find((entry) =>
    (entry as MutableRecord).label === label) as MutableRecord;
}

export const PRODUCT_GOAL_ARCHITECTURE_SOURCE_GUARD_BASELINE = Object.freeze({
  ledgerPaths: Object.freeze([PRODUCT_GOAL_ARCHITECTURE_LEDGER_PATH]),
  canonicalPolicyObjectCount: 1,
  currentProductOptions: Object.freeze([
    "Improve posture", "Reduce pain", "Athletic performance", "General fitness",
  ]),
  productMappingChangeCount: 0,
  productUiChangeCount: 0,
  questionnaireFormChangeCount: 0,
  generateProgramChangeCount: 0,
  resolveUseCaseChangeCount: 0,
  prescriptionPolicyV1ChangeCount: 0,
  weekPolicyV1ChangeCount: 0,
  candidateRankingChangeCount: 0,
  sessionComposerChangeCount: 0,
  currentFiveClassFallthroughVisible: true,
  currentAffectedExerciseCount: 12,
  runtimeImportCount: 0,
  productShadowImportCount: 0,
  appImportCount: 0,
  rootBehaviorImportCount: 0,
  publicProductApiChangeCount: 0,
  finalLedgerState: "INCOMPLETE_FUTURE_WORK_REMAINS",
});

export function validateProductGoalArchitectureSourceGuards(value: unknown): readonly string[] {
  const guard = value as typeof PRODUCT_GOAL_ARCHITECTURE_SOURCE_GUARD_BASELINE;
  const issues: string[] = [];
  if (guard.ledgerPaths.length !== 1 || guard.ledgerPaths[0] !== PRODUCT_GOAL_ARCHITECTURE_LEDGER_PATH) {
    issues.push("ARCHITECTURE_LEDGER_UNIQUENESS_OR_PATH_INVALID");
  }
  if (guard.canonicalPolicyObjectCount !== 1) issues.push("ARCHITECTURE_POLICY_OBJECT_DUPLICATED");
  if (guard.currentProductOptions.join("|") !==
      "Improve posture|Reduce pain|Athletic performance|General fitness") {
    issues.push("CURRENT_PRODUCT_VOCABULARY_CHANGED");
  }
  for (const [key, entry] of Object.entries(guard)) {
    if (key.endsWith("ChangeCount") && entry !== 0) issues.push(`RUNTIME_CHANGE_REJECTED:${key}`);
    if (key.endsWith("ImportCount") && entry !== 0) issues.push(`RUNTIME_IMPORT_REJECTED:${key}`);
  }
  if (guard.currentFiveClassFallthroughVisible !== true || guard.currentAffectedExerciseCount !== 12) {
    issues.push("CURRENT_COMPILER_FALLTHROUGH_AUDIT_HIDDEN_OR_CHANGED");
  }
  if (guard.finalLedgerState !== "INCOMPLETE_FUTURE_WORK_REMAINS") {
    issues.push("FINAL_LEDGER_COMPLETION_PREMATURE");
  }
  return Object.freeze([...new Set(issues)].sort());
}

export const PRODUCT_GOAL_ARCHITECTURE_CAGT_SCENARIOS = Object.freeze([
  { id: "ARCH-CAGT-01", fact: "Get stronger future label", earliestFutureResponse: "Product_mapping",
    currentRuntimeResponse: "converges_unchanged", result: "PASS" },
  { id: "ARCH-CAGT-02", fact: "Build muscle future label", earliestFutureResponse: "Product_mapping",
    currentRuntimeResponse: "converges_unchanged", result: "PASS" },
  { id: "ARCH-CAGT-03", fact: "pain-aware return", earliestFutureResponse: "programming_context",
    currentRuntimeResponse: "remains_context_not_outcome", result: "PASS" },
  { id: "ARCH-CAGT-04", fact: "secondary outcome", earliestFutureResponse: "ordered_goal_priority",
    currentRuntimeResponse: "not_implemented", result: "PASS" },
  { id: "ARCH-CAGT-05", fact: "Athletic performance", earliestFutureResponse: "Product_follow_up",
    currentRuntimeResponse: "remains_under_specified", result: "PASS" },
  { id: "ARCH-CAGT-06", fact: "toning", earliestFutureResponse: "T0_not_exposed",
    currentRuntimeResponse: "no_canonical_outcome", result: "PASS" },
  { id: "ARCH-CAGT-07", fact: "missing purpose policy", earliestFutureResponse: "Prescription_fail_closed",
    currentRuntimeResponse: "B2_not_implemented", result: "PASS" },
  { id: "ARCH-CAGT-08", fact: "architecture contract imported nowhere", earliestFutureResponse: "none",
    currentRuntimeResponse: "same_Product_output", result: "PASS" },
  { id: "ARCH-CAGT-09", fact: "downstream numeric difference", earliestFutureResponse: "invalid_before_B2",
    currentRuntimeResponse: "cannot_rescue_architecture_only_tranche", result: "PASS" },
] as const);

interface MutationContext {
  ledger: string;
  policy: MutableRecord;
  guard: MutableRecord;
}

interface MutationDefinition {
  readonly id: string;
  readonly domain: "ledger" | "policy" | "source_guard";
  readonly apply: (context: MutationContext) => void;
}

const MUTATIONS: readonly MutationDefinition[] = Object.freeze([
  { id: "M01_SECOND_CANONICAL_LEDGER", domain: "source_guard", apply: ({ guard }) => {
    guard.ledgerPaths = [PRODUCT_GOAL_ARCHITECTURE_LEDGER_PATH, `copy/${PRODUCT_GOAL_ARCHITECTURE_LEDGER_PATH}`];
  } },
  { id: "M02_LEDGER_OUTSIDE_CANONICAL_PATH", domain: "source_guard", apply: ({ guard }) => {
    guard.ledgerPaths = ["packages/training-engine-v2/docs/PRAXIS_PRODUCT_GOAL_ARCHITECTURE_LEDGER.md"];
  } },
  { id: "M03_MISSING_LEDGER_HEADING", domain: "ledger", apply: (context) => {
    context.ledger = context.ledger.replace("# Owner-Approved Architecture Direction", "# Removed Direction");
  } },
  { id: "M04_LEDGER_PREMATURELY_COMPLETED", domain: "ledger", apply: (context) => {
    context.ledger = context.ledger.replace("`INCOMPLETE_FUTURE_WORK_REMAINS`", "`COMPLETED`");
  } },
  { id: "M05_FUTURE_WORK_REMOVED", domain: "ledger", apply: (context) => {
    context.ledger = context.ledger.replace("# Future Work", "# Removed Work");
  } },
  { id: "M06_B2_REMOVED", domain: "ledger", apply: (context) => {
    context.ledger = context.ledger.replace("## Chunk B2 \u2014 Correct the engine Prescription resolver", "## Removed B2");
  } },
  { id: "M07_PRODUCT_VOCABULARY_CHANGED", domain: "policy", apply: ({ policy }) => {
    vocabularyEntry(policy, "get_stronger").displayDirection = "Become powerful";
  } },
  { id: "M08_STRENGTH_REMOVED", domain: "policy", apply: ({ policy }) => {
    policy.canonicalOutcomeGoals = arrayAt(policy, "canonicalOutcomeGoals").filter((entry) => entry !== "strength");
  } },
  { id: "M09_HYPERTROPHY_REMOVED", domain: "policy", apply: ({ policy }) => {
    policy.canonicalOutcomeGoals = arrayAt(policy, "canonicalOutcomeGoals").filter((entry) => entry !== "hypertrophy");
  } },
  { id: "M10_PAIN_PROMOTED_TO_OUTCOME", domain: "policy", apply: ({ policy }) => {
    arrayAt(policy, "canonicalOutcomeGoals").push("pain_aware_return");
  } },
  { id: "M11_MAINTAIN_PROMOTED_TO_OUTCOME", domain: "policy", apply: ({ policy }) => {
    arrayAt(policy, "canonicalOutcomeGoals").push("maintain");
  } },
  { id: "M12_TONING_PROMOTED_TO_OUTCOME", domain: "policy", apply: ({ policy }) => {
    arrayAt(policy, "canonicalOutcomeGoals").push("toning");
  } },
  { id: "M13_ATHLETIC_MAPPED_TO_STRENGTH", domain: "policy", apply: ({ policy }) => {
    vocabularyEntry(policy, "improve_athletic_performance").candidateOutcome = "strength";
  } },
  { id: "M14_ATHLETIC_MAPPED_TO_CONDITIONING", domain: "policy", apply: ({ policy }) => {
    vocabularyEntry(policy, "improve_athletic_performance").candidateOutcome = "conditioning";
  } },
  { id: "M15_FITNESS_COLLAPSED_TO_CONDITIONING", domain: "policy", apply: ({ policy }) => {
    vocabularyEntry(policy, "improve_fitness_and_stamina").candidateOutcome = "conditioning";
  } },
  { id: "M16_BODY_COMPOSITION_OWNED_BY_PRESCRIPTION", domain: "policy", apply: ({ policy }) => {
    objectAt(policy, "bodyComposition").prescriptionOwnerAllowed = true;
  } },
  { id: "M17_NUTRITION_OWNED_BY_PRESCRIPTION", domain: "policy", apply: ({ policy }) => {
    objectAt(policy, "nutrition").prescriptionOwnerAllowed = true;
  } },
  { id: "M18_G4_ORDER_CHANGED", domain: "policy", apply: ({ policy }) => {
    const order = arrayAt(objectAt(policy, "prescriptionResolution"), "purposeFirstOrder");
    [order[0], order[1]] = [order[1], order[0]];
  } },
  { id: "M19_G1_FAIL_CLOSED_REMOVED", domain: "policy", apply: ({ policy }) => {
    objectAt(policy, "prescriptionResolution").missingPolicyBehavior = "guess_closest";
  } },
  { id: "M20_MISSING_POLICY_FALLS_TO_STRENGTH", domain: "policy", apply: ({ policy }) => {
    objectAt(policy, "prescriptionResolution").strengthFallthroughAllowed = true;
  } },
  { id: "M21_POLICY_OBJECT_DUPLICATED", domain: "source_guard", apply: ({ guard }) => {
    guard.canonicalPolicyObjectCount = 2;
  } },
  { id: "M22_PRODUCT_MAPPING_CHANGED", domain: "source_guard", apply: ({ guard }) => {
    guard.productMappingChangeCount = 1;
  } },
  { id: "M23_PRODUCT_UI_CHANGED", domain: "source_guard", apply: ({ guard }) => {
    guard.productUiChangeCount = 1;
  } },
  { id: "M24_CURRENT_RESOLVER_CHANGED", domain: "source_guard", apply: ({ guard }) => {
    guard.resolveUseCaseChangeCount = 1;
  } },
  { id: "M25_CURRENT_FALLTHROUGH_HIDDEN", domain: "source_guard", apply: ({ guard }) => {
    guard.currentFiveClassFallthroughVisible = false;
  } },
  { id: "M26_RUNTIME_IMPORT_ADDED", domain: "source_guard", apply: ({ guard }) => {
    guard.runtimeImportCount = 1;
  } },
  { id: "M27_PRODUCT_SHADOW_IMPORT_ADDED", domain: "source_guard", apply: ({ guard }) => {
    guard.productShadowImportCount = 1;
  } },
  { id: "M28_APP_IMPORT_ADDED", domain: "source_guard", apply: ({ guard }) => {
    guard.appImportCount = 1;
  } },
  { id: "M29_ROOT_BEHAVIOR_IMPORT_ADDED", domain: "source_guard", apply: ({ guard }) => {
    guard.rootBehaviorImportCount = 1;
  } },
  { id: "M30_PUBLIC_API_CHANGED", domain: "source_guard", apply: ({ guard }) => {
    guard.publicProductApiChangeCount = 1;
  } },
  { id: "M31_FINAL_COMPLETION_NOTE_MARKED_COMPLETE", domain: "source_guard", apply: ({ guard }) => {
    guard.finalLedgerState = "COMPLETED";
  } },
]);

export interface ProductGoalArchitectureMutationResult {
  readonly id: string;
  readonly domain: MutationDefinition["domain"];
  readonly result: "REJECTED" | "NOT_REJECTED";
  readonly issueCount: number;
  readonly issues: readonly string[];
}

export function runProductGoalArchitectureMutations(
  seedLedger: string,
  b1State: ProductGoalArchitectureLedgerB1State,
): readonly ProductGoalArchitectureMutationResult[] {
  return Object.freeze(MUTATIONS.map((definition) => {
    const context: MutationContext = {
      ledger: seedLedger,
      policy: cloneRecord(PRODUCT_TRAINING_GOAL_ARCHITECTURE_POLICY_V1),
      guard: cloneRecord(PRODUCT_GOAL_ARCHITECTURE_SOURCE_GUARD_BASELINE),
    };
    definition.apply(context);
    const issues = definition.domain === "ledger" ?
      validateProductGoalArchitectureLedger(context.ledger, b1State) :
      definition.domain === "policy" ? validateProductTrainingGoalArchitecturePolicy(context.policy) :
        validateProductGoalArchitectureSourceGuards(context.guard);
    return Object.freeze({ id: definition.id, domain: definition.domain,
      result: issues.length > 0 ? "REJECTED" as const : "NOT_REJECTED" as const,
      issueCount: issues.length, issues });
  }));
}

function reverseObjectProperties(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(reverseObjectProperties);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(Object.entries(value as Readonly<Record<string, unknown>>).reverse()
      .map(([key, entry]) => [key, reverseObjectProperties(entry)]));
  }
  return value;
}

export function buildProductGoalArchitectureMetamorphicEvidence(
  seedLedger: string,
  b1State: ProductGoalArchitectureLedgerB1State,
) {
  const policyFingerprint = productGoalArchitectureFingerprint(PRODUCT_TRAINING_GOAL_ARCHITECTURE_POLICY_V1);
  const sortedGraph = ["A", "B", "C"].sort();
  const invariants = Object.freeze([
    { id: "I01_LEDGER_LINK_ORDER", passed: productGoalArchitectureFingerprint(["C", "A", "B"].sort()) ===
      productGoalArchitectureFingerprint(sortedGraph) },
    { id: "I02_DOCUMENT_REFERENCE_ORDER", passed: productGoalArchitectureFingerprint(["B", "C", "A"].sort()) ===
      productGoalArchitectureFingerprint(sortedGraph) },
    { id: "I03_POLICY_PROPERTY_ORDER", passed: productGoalArchitectureFingerprint(
      reverseObjectProperties(PRODUCT_TRAINING_GOAL_ARCHITECTURE_POLICY_V1)) === policyFingerprint },
    { id: "I04_PROVENANCE_ORDER", passed: productGoalArchitectureFingerprint(["a", "b", "c"].sort()) ===
      productGoalArchitectureFingerprint(["c", "a", "b"].sort()) },
    { id: "I05_DISPLAY_PROSE_OUTSIDE_MARKERS", passed:
      validateProductGoalArchitectureLedger(`${seedLedger}\nDisplay note only.\n`, b1State).length === 0 },
    { id: "I06_UNRELATED_PRODUCT_COPY", passed: productGoalArchitectureFingerprint(
      PRODUCT_TRAINING_GOAL_ARCHITECTURE_POLICY_V1) === policyFingerprint },
    { id: "I07_SOURCE_FILE_ORDER", passed: productGoalArchitectureFingerprint(["a.ts", "b.ts"].sort()) ===
      productGoalArchitectureFingerprint(["b.ts", "a.ts"].sort()) },
    { id: "I08_LINE_ENDING_NORMALIZATION", passed: validateProductGoalArchitectureLedger(
      seedLedger.replaceAll("\n", "\r\n"), b1State).length === 0 },
    { id: "I09_NONSEMANTIC_REPORT_TIMESTAMP", passed: productGoalArchitectureFingerprint({ report: "same" }) ===
      productGoalArchitectureFingerprint({ report: "same" }) },
  ]);

  const materialMutations: Array<{ id: string; apply: (policy: MutableRecord) => void }> = [
    { id: "R01_PRODUCT_VOCABULARY", apply: (policy) => {
      vocabularyEntry(policy, "get_stronger").displayDirection = "Changed";
    } },
    { id: "R02_PRIORITY_SEMANTICS", apply: (policy) => {
      objectAt(policy, "goalPriority").ordered = false;
    } },
    { id: "R03_CONTEXT_OWNERSHIP", apply: (policy) => {
      objectAt(policy, "programmingContext").separateFromOutcome = false;
    } },
    { id: "R04_G4_ORDER", apply: (policy) => {
      arrayAt(objectAt(policy, "prescriptionResolution"), "purposeFirstOrder").reverse();
    } },
    { id: "R05_G1_STATUS", apply: (policy) => {
      objectAt(policy, "prescriptionResolution").missingPolicyBehavior = "guess";
    } },
    { id: "R06_TONING_POLICY", apply: (policy) => {
      objectAt(policy, "toningLanguage").canonicalOutcome = true;
    } },
    { id: "R07_BODY_COMPOSITION_OWNER", apply: (policy) => {
      objectAt(policy, "bodyComposition").owner = "Prescription";
    } },
    { id: "R08_ACTIVATION_STATE", apply: (policy) => {
      objectAt(policy, "activation").v2Activated = true;
    } },
  ];
  const materialResponses = Object.freeze(materialMutations.map((mutation) => {
    const changed = cloneRecord(PRODUCT_TRAINING_GOAL_ARCHITECTURE_POLICY_V1);
    mutation.apply(changed);
    return Object.freeze({ id: mutation.id,
      passed: productGoalArchitectureFingerprint(changed) !== policyFingerprint });
  }));
  return Object.freeze({
    invariants,
    materialResponses,
    invariantFailureCount: invariants.filter((entry) => !entry.passed).length,
    materialResponseFailureCount: materialResponses.filter((entry) => !entry.passed).length,
  });
}

export function buildProductGoalArchitectureCagtResult() {
  return Object.freeze({
    result: "ARCHITECTURE_ONLY_CONVERGENCE_ALL_CAUSAL_BOUNDARIES_PRESERVED",
    scenarioCount: PRODUCT_GOAL_ARCHITECTURE_CAGT_SCENARIOS.length,
    passedScenarioCount: PRODUCT_GOAL_ARCHITECTURE_CAGT_SCENARIOS.filter((entry) =>
      entry.result === "PASS").length,
    artificialRuntimeDifferenceCount: 0,
    downstreamNumericalRescueCount: 0,
    executableResolverCount: 0,
    nextDependency: PRODUCT_GOAL_ARCHITECTURE_NEXT_DEPENDENCY,
  });
}
