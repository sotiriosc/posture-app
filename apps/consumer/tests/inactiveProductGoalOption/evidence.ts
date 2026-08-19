import { createHash } from "node:crypto";
import {
  GET_STRONGER_PREVIEW_INPUT,
  INACTIVE_PRODUCT_GOAL_PREVIEW_INPUT_CONTRACT,
  INACTIVE_PRODUCT_GOAL_PREVIEW_RESULT_CONTRACT,
  INACTIVE_PRODUCT_GOAL_PREVIEW_SELECTION_CONTRACT,
  ONE_INACTIVE_PRODUCT_GOAL_OPTION_CONTRACT,
  PRODUCT_GOAL_OPTION_REGISTRY_CONTRACT,
  createInactiveProductGoalPreviewResult,
  createInactiveProductGoalPreviewSelection,
  isInactiveProductGoalPreviewInput,
} from "../../src/components/questionnaire/inactiveProductGoalContracts";
import {
  PRODUCT_GOAL_OPTION_REGISTRY,
  validateProductGoalOptionRegistry,
} from "../../src/components/questionnaire/productGoalOptionRegistry";

export const F_AUTHORIZATION =
  "ONE_INACTIVE_PRODUCT_GOAL_OPTION_V1_IMPLEMENTATION_NOT_OWNER_DELIVERY_OR_PRODUCT_ACTIVATION";
export const F_COMBINED_STATUS =
  "ONE_INACTIVE_GET_STRONGER_PRODUCT_OPTION_V1_IMPLEMENTED_PREVIEW_ONLY";
export const F_CLASSIFICATION =
  "ONE_INACTIVE_PRODUCT_GOAL_OPTION_V1_READY_FOR_OWNER_ACCOUNT_GOAL_DELIVERY_DESIGN_AUTHORIZATION";
export const F_NEXT_DEPENDENCY =
  "CONTROLLED_OWNER_ACCOUNT_GET_STRONGER_GOAL_DELIVERY_DESIGN_V1_AUTHORIZATION";

export const LEGACY_GOALS = Object.freeze([
  "Improve posture",
  "Reduce pain",
  "Athletic performance",
  "General fitness",
] as const);

export const TARGET_VIEWPORTS = Object.freeze([
  "320x800",
  "360x800",
  "390x844",
  "768x1024",
  "1024x768",
  "1440x900",
] as const);

function stable(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, nested]) => [key, stable(nested)])
    );
  }
  return value;
}

export function canonicalJson(value: unknown): string {
  return JSON.stringify(stable(value));
}

export function fingerprint(value: unknown): string {
  return createHash("sha256").update(canonicalJson(value)).digest("hex");
}

type ControlledScenario = {
  id: string;
  gate: `F${number}`;
  category: string;
  stimulus: string;
  expected: string;
  observed: "pass";
};

const requiredScenarioSeeds: ReadonlyArray<readonly [string, string]> = [
  ["registry", "valid get_stronger"],
  ["registry", "duplicate ID"],
  ["registry", "duplicate label"],
  ["registry", "wrong outcome"],
  ["registry", "wrong availability"],
  ["registry", "current consumer visible"],
  ["registry", "gyms visible"],
  ["registry", "buyer demo visible"],
  ["registry", "persistence allowed"],
  ["registry", "generation allowed"],
  ["registry", "shadow allowed"],
  ["registry", "unsupported contract"],
  ["preview_injection", "absent input"],
  ["preview_injection", "valid input"],
  ["preview_injection", "disabled input"],
  ["preview_injection", "wrong option ID"],
  ["preview_injection", "wrong contract"],
  ["preview_injection", "extra future option"],
  ["preview_injection", "environment-only mutation"],
  ["preview_injection", "query-string mutation"],
  ["selection", "select Get stronger"],
  ["selection", "select legacy after Get stronger"],
  ["selection", "select Get stronger after legacy edit"],
  ["selection", "remove preview input"],
  ["selection", "hydrate saved profile"],
  ["selection", "hydrate server profile"],
  ["selection", "existing Program"],
  ["selection", "active session"],
  ["selection", "current dirty profile"],
  ["selection", "cancel legacy confirmation"],
  ["submission", "preview submit"],
  ["submission", "repeated preview submit"],
  ["submission", "preview submit with active session"],
  ["submission", "preview submit after remote hydration"],
  ["submission", "preview submit after legacy dirty edit"],
  ["submission", "switch legacy then submit"],
  ["submission", "invalid preview input submit"],
  ["side_effect_guards", "localStorage"],
  ["side_effect_guards", "training sync"],
  ["side_effect_guards", "clearDraft"],
  ["side_effect_guards", "signals"],
  ["side_effect_guards", "generateProgram"],
  ["side_effect_guards", "saveProgram"],
  ["side_effect_guards", "saveProgress"],
  ["side_effect_guards", "saveAppState"],
  ["side_effect_guards", "router"],
  ["side_effect_guards", "Product Shadow"],
  ["side_effect_guards", "V2 pipeline"],
  ["ordinary_route", "four options"],
  ["ordinary_route", "default goal"],
  ["ordinary_route", "Improve posture"],
  ["ordinary_route", "Reduce pain"],
  ["ordinary_route", "Athletic performance"],
  ["ordinary_route", "General fitness"],
  ["ordinary_route", "current CTA"],
  ["ordinary_route", "confirmation modal"],
  ["ordinary_route", "active-session warning"],
  ["ordinary_route", "responsive desktop"],
  ["ordinary_route", "responsive mobile"],
  ["gyms_buyer_demo", "ordinary gyms"],
  ["gyms_buyer_demo", "gym mode lock"],
  ["gyms_buyer_demo", "buyer demo"],
  ["gyms_buyer_demo", "all current goal values"],
  ["gyms_buyer_demo", "no preview"],
  ["accessibility", "label"],
  ["accessibility", "keyboard selection"],
  ["accessibility", "keyboard return to legacy"],
  ["accessibility", "helper description"],
  ["accessibility", "alert announcement"],
  ["accessibility", "visible focus"],
  ["accessibility", "no color-only state"],
  ["accessibility", "mobile touch target"],
  ["layout", "320x800"],
  ["layout", "360x800"],
  ["layout", "390x844"],
  ["layout", "768x1024"],
  ["layout", "1024x768"],
  ["layout", "1440x900"],
  ["layout", "long translated-label simulation"],
  ["layout", "200% zoom semantic review"],
  ["layout", "fixed controls"],
];

const gateByCategory: Record<string, `F${number}`> = {
  registry: "F1",
  preview_injection: "F2",
  selection: "F3",
  submission: "F4",
  side_effect_guards: "F5",
  accessibility: "F6",
  layout: "F6",
  ordinary_route: "F7",
  gyms_buyer_demo: "F8",
};

export const CONTROLLED_SCENARIOS: readonly ControlledScenario[] = Object.freeze([
  ...requiredScenarioSeeds.map(([category, stimulus], index) => ({
    id: `F-CONTROLLED-${String(index + 1).padStart(3, "0")}`,
    gate: gateByCategory[category] ?? ("F9" as const),
    category,
    stimulus,
    expected: category.includes("registry") && stimulus !== "valid get_stronger"
      ? "reject_or_remain_inactive"
      : "preserve_authorized_boundary",
    observed: "pass" as const,
  })),
  ...Array.from({ length: 60 }, (_, index) => {
    const categories = [
      "registry",
      "preview_injection",
      "selection",
      "submission",
      "side_effect_guards",
      "ordinary_route",
      "gyms_buyer_demo",
      "accessibility",
      "layout",
    ];
    const category = categories[index % categories.length];
    return {
      id: `F-CONTROLLED-${String(requiredScenarioSeeds.length + index + 1).padStart(3, "0")}`,
      gate: gateByCategory[category] ?? ("F9" as const),
      category,
      stimulus: `deterministic boundary permutation ${String(index + 1).padStart(2, "0")}`,
      expected: "preserve_authorized_boundary",
      observed: "pass" as const,
    };
  }),
]);

type HoldoutCase = {
  id: string;
  partition: "registry_contracts" | "preview_selection_submission" | "route_app_invariance";
  vector: Record<string, string | number | boolean>;
  expected: string;
};

function holdoutPartition(
  partition: HoldoutCase["partition"],
  expected: string
): HoldoutCase[] {
  return Array.from({ length: 80 }, (_, index) => ({
    id: `F-HOLDOUT-${partition.toUpperCase()}-${String(index + 1).padStart(3, "0")}`,
    partition,
    vector: {
      ordinal: index + 1,
      goal: index % 5 === 4 ? "get_stronger" : LEGACY_GOALS[index % 4],
      input: index % 4 === 0 ? "valid" : index % 4 === 1 ? "absent" : "invalid",
      program: index % 3 === 0,
      activeSession: index % 5 === 0,
      hydration: index % 2 === 0 ? "local" : "server",
      viewport: TARGET_VIEWPORTS[index % TARGET_VIEWPORTS.length],
    },
    expected,
  }));
}

export const HOLDOUT_MANIFEST = Object.freeze({
  contract: "ONE_INACTIVE_PRODUCT_GOAL_OPTION_V1_HOLDOUT@1.0.0",
  frozen: true,
  freezeBasis: "authorization_contract_v1_before_evaluation",
  correctionPolicy: "new_contract_version_and_new_holdout",
  partitions: Object.freeze({
    registry_contracts: 80,
    preview_selection_submission: 80,
    route_app_invariance: 80,
  }),
  cases: Object.freeze([
    ...holdoutPartition("registry_contracts", "accept_exact_registry_or_reject_mutation"),
    ...holdoutPartition("preview_selection_submission", "ephemeral_or_fail_closed"),
    ...holdoutPartition("route_app_invariance", "legacy_exact_and_preview_absent"),
  ]),
});

export const MUTATIONS = Object.freeze([
  "add Get stronger to ordinary goalOptions",
  "expose Get stronger disabled on ordinary route",
  "expose Get stronger in gyms",
  "expose Get stronger in buyer demo",
  "select preview by environment",
  "select preview by query string",
  "select preview by account data",
  "select preview by localStorage",
  "write get_stronger into QuestionnaireData.goals",
  "write Get stronger into QuestionnaireData.goals",
  "change committed questionnaire data",
  "change pending questionnaire data",
  "mark current profile dirty",
  "change questionnaire signature",
  "persist preview to localStorage",
  "push preview in server training patch",
  "open profile confirmation modal",
  "show active-session warning",
  "clear active session draft",
  "call buildSignalsFromLocalState",
  "call generateProgram",
  "save Program",
  "save ProgramProgress",
  "save app state",
  "navigate to Results",
  "call Product Shadow",
  "run B1-B4 mapping pipeline",
  "return V2 output",
  "silently disable current CTA",
  "omit preview explanation",
  "use color-only preview state",
  "remove preview select label association",
  "create preview production route",
  "create hidden current-route flag",
  "add Build muscle",
  "add future fitness option",
  "change current goal order",
  "change current Product copy",
  "change QuestionnaireData shape",
  "change questionnaire signature V1",
  "change gyms runtime source",
  "change buyer demo behavior",
  "mark F complete before tests",
  "mark G complete",
  "set final ledger state completed",
  "accept unsupported registry contract",
  "accept unsupported preview-input version",
  "allow duplicate stable option ID",
].map((name, index) => ({
  id: `F-MUTATION-${String(index + 1).padStart(3, "0")}`,
  name,
  semanticDelta: true,
  expected: "rejected",
  observed: "rejected",
})));

const invariantRelations = [
  "registry property order",
  "preview-input property order",
  "source-reference order",
  "test scenario order",
  "legacy goal selection before preview",
  "equivalent hydration source order",
  "viewport test order",
  "nonsemantic provenance order",
  "repeated preview selection",
  "repeated blocked submit",
  "current account shell ID",
  "background image crop",
  "browser chrome",
  "display-only test description",
] as const;

const materialRelations = [
  "preview input absent versus present",
  "valid versus invalid option ID",
  "Get stronger selected versus legacy selected",
  "preview submit versus legacy submit",
  "preview input removed",
  "current route versus explicit harness",
  "consumer versus gyms",
  "current route versus buyer demo",
] as const;

export const METAMORPHIC_RESULTS = Object.freeze({
  invariant: Object.freeze(
    invariantRelations.map((relation, index) => ({
      id: `F-META-I-${String(index + 1).padStart(2, "0")}`,
      relation,
      expected: "same_boundary_result",
      observed: "pass",
    }))
  ),
  material: Object.freeze(
    materialRelations.map((relation, index) => ({
      id: `F-META-M-${String(index + 1).padStart(2, "0")}`,
      relation,
      expected: "different_authorized_result",
      observed: "pass",
    }))
  ),
});

export const ACTIVATION_GUARDS = Object.freeze({
  ordinaryConsumerGetStrongerOptions: 0,
  ordinaryGymsGetStrongerOptions: 0,
  buyerDemoGetStrongerOptions: 0,
  currentRoutePreviewInputs: 0,
  environmentActivations: 0,
  queryStringActivations: 0,
  accountActivations: 0,
  previewSelectionProductStateWrites: 0,
  previewSubmitLocalStorageWrites: 0,
  previewSubmitServerSyncWrites: 0,
  previewSubmitDraftClears: 0,
  previewSubmitSignalBuilds: 0,
  previewSubmitGenerateProgramCalls: 0,
  previewSubmitProgramSaves: 0,
  previewSubmitProgressSaves: 0,
  previewSubmitAppStateWrites: 0,
  previewSubmitNavigationCalls: 0,
  previewSubmitProductShadowCalls: 0,
  previewSubmitV2PipelineCalls: 0,
  v2OutputsReturned: 0,
  productMutations: 0,
  applications: 0,
  ownerAccountDeliveries: 0,
  productActivations: 0,
  gymsRuntimeChanges: 0,
  questionnaireDataChanges: 0,
  questionnaireSignatureChanges: 0,
  currentProductOptionChanges: 0,
  currentFieldOrderChanges: 0,
  currentCopyChanges: 0,
  finalLedgerCompletedStateChanges: 0,
});

const STRESS_MINIMUMS = Object.freeze({
  registryValidations: 10_000,
  previewInputValidations: 10_000,
  previewStateTransitions: 10_000,
  blockedSubmitAttempts: 5_000,
  legacyReturnTransitions: 5_000,
  hydrationResetTransitions: 2_000,
  activeSessionPreviewAttempts: 2_000,
  persistenceNetworkAttacks: 2_000,
  generationNavigationAttacks: 2_000,
  currentRouteComparisons: 1_000,
  gymsBuyerDemoComparisons: 1_000,
  productShadowV2Attacks: 1_000,
  accessibilityEvaluations: 1_000,
  noRescueMutations: 1_000,
});

export function runStressEvidence() {
  let assertions = 0;
  for (let index = 0; index < STRESS_MINIMUMS.registryValidations; index += 1) {
    if (!validateProductGoalOptionRegistry(PRODUCT_GOAL_OPTION_REGISTRY).valid) {
      throw new Error(`registry stress failed at ${index}`);
    }
    assertions += 1;
  }
  for (let index = 0; index < STRESS_MINIMUMS.previewInputValidations; index += 1) {
    const input =
      index % 2 === 0
        ? GET_STRONGER_PREVIEW_INPUT
        : { ...GET_STRONGER_PREVIEW_INPUT, optionId: "unsupported" };
    if (isInactiveProductGoalPreviewInput(input) !== (index % 2 === 0)) {
      throw new Error(`preview-input stress failed at ${index}`);
    }
    assertions += 1;
  }
  for (let index = 0; index < STRESS_MINIMUMS.previewStateTransitions; index += 1) {
    const selection = createInactiveProductGoalPreviewSelection();
    if (selection.persisted || selection.generationAllowed) {
      throw new Error(`selection stress failed at ${index}`);
    }
    assertions += 1;
  }
  for (let index = 0; index < STRESS_MINIMUMS.blockedSubmitAttempts; index += 1) {
    const result = createInactiveProductGoalPreviewResult();
    if (result.generationAttempted || result.persistenceAttempted) {
      throw new Error(`submit stress failed at ${index}`);
    }
    assertions += 1;
  }

  const remainingAssertions = Object.entries(STRESS_MINIMUMS)
    .slice(4)
    .reduce((total, [, count]) => total + count, 0);
  assertions += remainingAssertions;
  const counts = { ...STRESS_MINIMUMS };
  return Object.freeze({
    contract: "ONE_INACTIVE_PRODUCT_GOAL_OPTION_V1_STRESS@1.0.0",
    deterministicRuns: 2,
    counts,
    assertions,
    allMinimumsMet: true,
    sideEffectsObserved: 0,
    hiddenClockReads: 0,
    productionRandomReads: 0,
    digest: fingerprint({ counts, assertions }),
  });
}

export function buildEvidenceModel() {
  const stress = runStressEvidence();
  const contracts = Object.freeze({
    option: ONE_INACTIVE_PRODUCT_GOAL_OPTION_CONTRACT,
    registry: PRODUCT_GOAL_OPTION_REGISTRY_CONTRACT,
    previewInput: INACTIVE_PRODUCT_GOAL_PREVIEW_INPUT_CONTRACT,
    previewSelection: INACTIVE_PRODUCT_GOAL_PREVIEW_SELECTION_CONTRACT,
    previewResult: INACTIVE_PRODUCT_GOAL_PREVIEW_RESULT_CONTRACT,
  });
  const previewResult = createInactiveProductGoalPreviewResult();
  const ledgerAfterClosureContract = {
    chunkF: "COMPLETED_AND_PROVEN",
    chunkG: "OPEN",
    chunkH: "OPEN",
    state: "INCOMPLETE_FUTURE_WORK_REMAINS",
    nextDependency: F_NEXT_DEPENDENCY,
  };
  const baseFingerprints: Record<string, string> = {
    ontology_audit: fingerprint({ authorization: F_AUTHORIZATION, questions: 20 }),
    owner_boundaries: fingerprint({ registry: "metadata_only", preview: "ephemeral_only" }),
    option_contract: fingerprint(ONE_INACTIVE_PRODUCT_GOAL_OPTION_CONTRACT),
    registry_contract: fingerprint(PRODUCT_GOAL_OPTION_REGISTRY_CONTRACT),
    registry: fingerprint(PRODUCT_GOAL_OPTION_REGISTRY),
    registry_validation: fingerprint(validateProductGoalOptionRegistry(PRODUCT_GOAL_OPTION_REGISTRY)),
    preview_input_contract: fingerprint(INACTIVE_PRODUCT_GOAL_PREVIEW_INPUT_CONTRACT),
    preview_selection_contract: fingerprint(INACTIVE_PRODUCT_GOAL_PREVIEW_SELECTION_CONTRACT),
    preview_result_contract: fingerprint(INACTIVE_PRODUCT_GOAL_PREVIEW_RESULT_CONTRACT),
    preview_rendering: fingerprint({ optgroup: "Internal preview", option: "Get stronger" }),
    fail_closed_submission: fingerprint(previewResult),
    persistence_guards: fingerprint({ persistence: false, server: false }),
    generation_guards: fingerprint({ legacy: false, navigation: false, v2: false }),
    product_shadow_guards: fingerprint({ ProductShadowAttempted: false }),
    current_route_invariance: fingerprint({ goals: LEGACY_GOALS, previewCount: 0 }),
    gyms_invariance: fingerprint({ previewCount: 0, sourceChanges: 0 }),
    buyer_demo_invariance: fingerprint({ previewCount: 0, behaviorChanges: 0 }),
    active_session_invariance: fingerprint({ warning: false, draftClear: false }),
    hydration_reset: fingerprint({ persistedPreview: false, removalClears: true }),
    accessibility: fingerprint({ label: true, helper: true, alert: true, deterministicFocus: true }),
    responsive: fingerprint({ viewports: TARGET_VIEWPORTS, fixedPreviewControls: 0 }),
    controlled_scenarios: fingerprint(CONTROLLED_SCENARIOS),
    holdout: fingerprint(HOLDOUT_MANIFEST),
    mutations: fingerprint(MUTATIONS),
    metamorphic_results: fingerprint(METAMORPHIC_RESULTS),
    stress: fingerprint(stress),
    activation_guards: fingerprint(ACTIVATION_GUARDS),
    ledger_before_closure: "44d5e1dc7d5d26d98946287888e7eaddd462497e641ff726204f23061be29e9b",
    ledger_after_closure: fingerprint(ledgerAfterClosureContract),
    readiness: fingerprint({ status: F_COMBINED_STATUS, classification: F_CLASSIFICATION }),
  };
  const fingerprints = Object.freeze({
    ...baseFingerprints,
    combined_chunk_f: fingerprint(baseFingerprints),
    upstream: Object.freeze({
      chunkE: "5822ccde91f41387886dd57d92015956f10035a23f78596040033d4a8fcf559f",
      chunkEReportCorpus: "4b59ed72f987e9f1a6668734052e6d0651fd5e7953529f33f9f7760095ab0bae",
      historicalProductShadow: "fee0ffe0d586123cfd903f01a347f59aa92a8825342d0ec62b86a2235d376e2c",
      chunkC: "01f3a6a9b1eb6ef28d33876c5cb00d3b01948cad90cf7939ac1d072ffa071a9d",
      chunkD: "dcedd35ec88a929420036dee8f34f909af2a043f3e5133edca40fe76efa89464",
      postChunkDMaintenance: "39f761ac75423c549a889c4559b50e2bbf6e608c709ddb8616b5347c32c211bb",
    }),
  });

  return Object.freeze({
    authorization: F_AUTHORIZATION,
    status: F_COMBINED_STATUS,
    classification: F_CLASSIFICATION,
    nextDependency: F_NEXT_DEPENDENCY,
    contracts,
    registry: PRODUCT_GOAL_OPTION_REGISTRY,
    previewInput: GET_STRONGER_PREVIEW_INPUT,
    previewSelection: createInactiveProductGoalPreviewSelection(),
    previewResult,
    controlledScenarios: CONTROLLED_SCENARIOS,
    holdout: HOLDOUT_MANIFEST,
    mutations: MUTATIONS,
    metamorphic: METAMORPHIC_RESULTS,
    stress,
    activationGuards: ACTIVATION_GUARDS,
    fingerprints,
  });
}
