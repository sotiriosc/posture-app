import { describe, expect, test } from "vitest";
import {
  GET_STRONGER_OPTION_ID,
  GET_STRONGER_PREVIEW_INPUT,
  INACTIVE_PRODUCT_GOAL_CONTRACT_VERSION,
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
  GET_STRONGER_INACTIVE_OPTION,
  PRODUCT_GOAL_OPTION_REGISTRY,
  getInactiveProductGoalOption,
  validateProductGoalOptionRegistry,
} from "../../src/components/questionnaire/productGoalOptionRegistry";

const cloneRegistry = () =>
  structuredClone(PRODUCT_GOAL_OPTION_REGISTRY) as {
    contract: string;
    options: Array<Record<string, unknown>>;
  };

describe("inactive Get stronger option contracts", () => {
  test("defines exactly one immutable inactive option with the authorized identity", () => {
    expect(PRODUCT_GOAL_OPTION_REGISTRY).toEqual({
      contract: PRODUCT_GOAL_OPTION_REGISTRY_CONTRACT,
      options: [
        {
          contract: ONE_INACTIVE_PRODUCT_GOAL_OPTION_CONTRACT,
          id: "get_stronger",
          displayLabel: "Get stronger",
          canonicalOutcome: "strength",
          availability: "future_inactive_internal",
          requiredFollowUp: [],
          submissionBehavior: "preview_only_fail_closed",
          ordinaryConsumerVisible: false,
          ordinaryGymsVisible: false,
          buyerDemoVisible: false,
          persistenceAllowed: false,
          legacyGenerationAllowed: false,
          productShadowAllowed: false,
          v2OutputAllowed: false,
        },
      ],
    });
    expect(PRODUCT_GOAL_OPTION_REGISTRY.options).toHaveLength(1);
    expect(Object.isFrozen(PRODUCT_GOAL_OPTION_REGISTRY)).toBe(true);
    expect(Object.isFrozen(GET_STRONGER_INACTIVE_OPTION)).toBe(true);
    expect(Object.isFrozen(GET_STRONGER_INACTIVE_OPTION.requiredFollowUp)).toBe(true);
    expect(validateProductGoalOptionRegistry(PRODUCT_GOAL_OPTION_REGISTRY)).toEqual({
      valid: true,
      errors: [],
    });
  });

  test("resolves only the authorized stable ID", () => {
    expect(getInactiveProductGoalOption(GET_STRONGER_OPTION_ID)).toBe(
      GET_STRONGER_INACTIVE_OPTION
    );
    expect(getInactiveProductGoalOption("build_muscle")).toBeNull();
    expect(getInactiveProductGoalOption("Get stronger")).toBeNull();
    expect(getInactiveProductGoalOption("")).toBeNull();
  });

  test("accepts only the exact versioned explicit preview input", () => {
    expect(GET_STRONGER_PREVIEW_INPUT).toEqual({
      contract: INACTIVE_PRODUCT_GOAL_PREVIEW_INPUT_CONTRACT,
      version: INACTIVE_PRODUCT_GOAL_CONTRACT_VERSION,
      optionId: GET_STRONGER_OPTION_ID,
      enabled: true,
    });
    expect(isInactiveProductGoalPreviewInput(GET_STRONGER_PREVIEW_INPUT)).toBe(true);

    for (const input of [
      null,
      {},
      { ...GET_STRONGER_PREVIEW_INPUT, contract: "latest" },
      { ...GET_STRONGER_PREVIEW_INPUT, version: "2.0.0" },
      { ...GET_STRONGER_PREVIEW_INPUT, optionId: "build_muscle" },
      { ...GET_STRONGER_PREVIEW_INPUT, enabled: false },
    ]) {
      expect(isInactiveProductGoalPreviewInput(input)).toBe(false);
    }
  });

  test("creates deterministic separate selection and blocked-result records", () => {
    expect(createInactiveProductGoalPreviewSelection()).toEqual({
      contract: INACTIVE_PRODUCT_GOAL_PREVIEW_SELECTION_CONTRACT,
      version: "1.0.0",
      optionId: "get_stronger",
      canonicalOutcome: "strength",
      availability: "future_inactive_internal",
      selected: true,
      source: "explicit_internal_preview",
      persisted: false,
      generationAllowed: false,
      ProductShadowAllowed: false,
      deliveredToUser: false,
      ProductMutationApplied: false,
    });
    expect(createInactiveProductGoalPreviewResult()).toEqual({
      contract: INACTIVE_PRODUCT_GOAL_PREVIEW_RESULT_CONTRACT,
      version: "1.0.0",
      optionId: "get_stronger",
      canonicalOutcome: "strength",
      status: "future_submission_unavailable",
      reason: "INACTIVE_PRODUCT_GOAL_PREVIEW_ONLY",
      persistenceAttempted: false,
      generationAttempted: false,
      ProductShadowAttempted: false,
      navigationAttempted: false,
      activeSessionMutationAttempted: false,
      ProductMutationApplied: false,
      V2OutputReturned: false,
    });
    expect(createInactiveProductGoalPreviewSelection()).toEqual(
      createInactiveProductGoalPreviewSelection()
    );
    expect(createInactiveProductGoalPreviewResult()).toEqual(
      createInactiveProductGoalPreviewResult()
    );
  });

  test("rejects every permission, visibility, identity, and cardinality mutation", () => {
    const mutations: Array<[string, (registry: ReturnType<typeof cloneRegistry>) => void]> = [
      ["contract", (r) => void (r.contract = "PRODUCT_GOAL_OPTION_REGISTRY_V1@2.0.0")],
      ["option-contract", (r) => void (r.options[0].contract = "latest")],
      ["id", (r) => void (r.options[0].id = "build_muscle")],
      ["label", (r) => void (r.options[0].displayLabel = "Build muscle")],
      ["outcome", (r) => void (r.options[0].canonicalOutcome = "hypertrophy")],
      ["availability", (r) => void (r.options[0].availability = "active")],
      ["follow-up", (r) => void (r.options[0].requiredFollowUp = ["equipment"])],
      ["submission", (r) => void (r.options[0].submissionBehavior = "generate")],
      ["consumer", (r) => void (r.options[0].ordinaryConsumerVisible = true)],
      ["gyms", (r) => void (r.options[0].ordinaryGymsVisible = true)],
      ["buyer-demo", (r) => void (r.options[0].buyerDemoVisible = true)],
      ["persistence", (r) => void (r.options[0].persistenceAllowed = true)],
      ["legacy-generation", (r) => void (r.options[0].legacyGenerationAllowed = true)],
      ["shadow", (r) => void (r.options[0].productShadowAllowed = true)],
      ["v2", (r) => void (r.options[0].v2OutputAllowed = true)],
      ["empty", (r) => void (r.options = [])],
      ["duplicate", (r) => void r.options.push({ ...r.options[0] })],
      ["non-object", (r) => void (r.options[0] = null as unknown as Record<string, unknown>)],
    ];

    for (const [name, mutate] of mutations) {
      const registry = cloneRegistry();
      mutate(registry);
      expect(validateProductGoalOptionRegistry(registry).valid, name).toBe(false);
    }
  });
});
