import { describe, expect, it } from "vitest";
import {
  PRODUCT_GOAL_ARCHITECTURE_INITIAL_LEDGER_FINGERPRINT,
  PRODUCT_GOAL_ARCHITECTURE_NEXT_DEPENDENCY,
  PRODUCT_TRAINING_GOAL_ARCHITECTURE_POLICY_REFERENCE,
  PRODUCT_TRAINING_GOAL_ARCHITECTURE_POLICY_STATUS,
} from "../../src/productGoalArchitecture/contracts";
import { buildProductTrainingGoalArchitecturePolicyFingerprints } from
  "../../src/productGoalArchitecture/fingerprints";
import { PRODUCT_TRAINING_GOAL_ARCHITECTURE_POLICY_V1 } from
  "../../src/productGoalArchitecture/ownerPolicyV1";
import {
  validateProductGoalArchitectureSelection,
  validateProductTrainingGoalArchitecturePolicy,
} from "../../src/productGoalArchitecture/validation";

describe("Product training goal architecture owner policy", () => {
  it("admits one inert, versioned layered purpose-first policy", () => {
    expect(validateProductTrainingGoalArchitecturePolicy(
      PRODUCT_TRAINING_GOAL_ARCHITECTURE_POLICY_V1)).toEqual([]);
    expect(PRODUCT_TRAINING_GOAL_ARCHITECTURE_POLICY_V1).toMatchObject({
      status: PRODUCT_TRAINING_GOAL_ARCHITECTURE_POLICY_STATUS,
      executable: false,
      prescriptionResolution: {
        selectedArchitecture: "G4_PURPOSE_FIRST_PLUS_G1_FAIL_CLOSED",
        missingPolicyBehavior: "fail_closed",
        strengthFallthroughAllowed: false,
        executableResolverImplemented: false,
      },
      activation: {
        productMappingChanged: false,
        productUiChanged: false,
        shadowMappingChanged: false,
        v2Activated: false,
      },
      nextDependency: PRODUCT_GOAL_ARCHITECTURE_NEXT_DEPENDENCY,
    });
    expect(PRODUCT_TRAINING_GOAL_ARCHITECTURE_POLICY_V1.policyReference.contractReference)
      .toBe(PRODUCT_TRAINING_GOAL_ARCHITECTURE_POLICY_REFERENCE);
  });

  it("keeps outcome, context, mode, and ordered priority separate", () => {
    expect(validateProductGoalArchitectureSelection({
      primaryOutcomeGoal: "strength",
      secondaryOutcomeGoal: "hypertrophy",
      programmingContexts: ["pain_aware_return"],
      trainingMode: "develop",
    })).toEqual([]);
    expect(validateProductGoalArchitectureSelection({
      primaryOutcomeGoal: "strength",
      secondaryOutcomeGoal: "strength",
      programmingContexts: ["hypertrophy"],
      trainingMode: "hypertrophy",
    })).toEqual([
      "PRODUCT_GOAL_ARCHITECTURE_CONTEXT_CANNOT_BE_OUTCOME",
      "PRODUCT_GOAL_ARCHITECTURE_DUPLICATE_PRIMARY_SECONDARY_OUTCOME",
      "PRODUCT_GOAL_ARCHITECTURE_TRAINING_MODE_CANNOT_BE_OUTCOME",
      "PRODUCT_GOAL_ARCHITECTURE_TRAINING_MODE_INVALID",
    ]);
    expect(validateProductGoalArchitectureSelection({
      primaryOutcomeGoal: null,
      secondaryOutcomeGoal: "toning",
      programmingContexts: [],
      trainingMode: "maintain",
    })).toEqual([
      "PRODUCT_GOAL_ARCHITECTURE_EXACTLY_ONE_PRIMARY_OUTCOME_REQUIRED",
      "PRODUCT_GOAL_ARCHITECTURE_SECONDARY_OUTCOME_INVALID",
    ]);
  });

  it("produces deterministic component fingerprints without import-time work", () => {
    const first = buildProductTrainingGoalArchitecturePolicyFingerprints();
    const second = buildProductTrainingGoalArchitecturePolicyFingerprints();
    expect(first).toEqual(second);
    expect(Object.values(first).every((value) => /^[a-f0-9]{64}$/.test(value))).toBe(true);
    expect(PRODUCT_GOAL_ARCHITECTURE_INITIAL_LEDGER_FINGERPRINT)
      .toBe("f72a901280feed39a5afced9e5f9b008d75776d01a5a2434e733a31526bd3457");
  });
});
