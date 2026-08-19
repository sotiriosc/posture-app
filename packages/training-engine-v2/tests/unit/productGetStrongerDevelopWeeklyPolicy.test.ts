import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  applyProductGetStrongerDevelopWeeklyResponsibilityPolicyV1,
  PRODUCT_GET_STRONGER_DEVELOP_WEEKLY_RESPONSIBILITY_POLICY_ID,
  PRODUCT_GET_STRONGER_DEVELOP_WEEKLY_RESPONSIBILITY_POLICY_REFERENCE,
  PRODUCT_GET_STRONGER_DEVELOP_WEEKLY_RESPONSIBILITY_POLICY_VERSION,
  validateProductGetStrongerDevelopWeeklyResponsibilityPolicyResult,
  type ProductGetStrongerDevelopWeeklyPolicyInput,
  type ProductGetStrongerDevelopWeeklyPolicyResult,
} from "../../src/productGoalArchitecture/getStrongerDevelopWeeklyPolicyV1";

function input(
  overrides: Partial<ProductGetStrongerDevelopWeeklyPolicyInput> = {},
): ProductGetStrongerDevelopWeeklyPolicyInput {
  return {
    productLabel: "get_stronger",
    trainingMode: "develop",
    outcomeGoal: "strength",
    sourceProductRevisionId: "product-revision:policy-test",
    goalFactId: "product-fact:get-stronger",
    modeFactId: "product-fact:develop",
    experience: "advanced",
    experienceFactId: "owner-fact:advanced",
    availableOpportunityCount: 5,
    separatePlaneFacts: [],
    additionalResponsibilityFacts: [],
    loadingEvidence: [],
    ...overrides,
  };
}

function resolved(
  overrides: Partial<ProductGetStrongerDevelopWeeklyPolicyInput> = {},
): ProductGetStrongerDevelopWeeklyPolicyResult {
  const result = applyProductGetStrongerDevelopWeeklyResponsibilityPolicyV1(input(overrides));
  expect(result.status, result.reasonCodes.join(",")).toBe("resolved");
  return result;
}

function mutable<T>(value: T): T {
  return structuredClone(value);
}

describe("canonical Get Stronger / Develop weekly responsibility policy", () => {
  it("publishes the exact policy identity and four broad typed foundations", () => {
    const result = resolved();

    expect(result.policyReference).toEqual({
      policyId: PRODUCT_GET_STRONGER_DEVELOP_WEEKLY_RESPONSIBILITY_POLICY_ID,
      version: PRODUCT_GET_STRONGER_DEVELOP_WEEKLY_RESPONSIBILITY_POLICY_VERSION,
      reference: PRODUCT_GET_STRONGER_DEVELOP_WEEKLY_RESPONSIBILITY_POLICY_REFERENCE,
    });
    expect(result.responsibilityTraces.map((trace) => trace.foundationKey)).toEqual([
      "knee_dominant_squat", "hinge_hip_extension", "upper_push", "upper_pull",
    ]);
    expect(result.priorities.map((priority) => priority.target.targetMovementRoles)).toEqual([
      ["knee_dominant", "squat"], ["hinge"], ["horizontal_push", "vertical_push"],
      ["horizontal_pull", "vertical_pull"],
    ]);
    expect(result.priorities.every((priority) => priority.priority === "required" &&
      priority.executionRequirements?.developmentalCreditRequired &&
      priority.executionRequirements.requiredPrescriptionPurpose === "strength_development")).toBe(true);
    expect(validateProductGetStrongerDevelopWeeklyResponsibilityPolicyResult(result)).toEqual([]);
    expect(JSON.stringify(result)).not.toMatch(/exerciseId|sets|repetitions|splitName|warmup|cooldown|durationEstimate|novelty/i);
  });

  it("uses broad push/pull OR semantics unless one typed fact requires both planes", () => {
    const broad = resolved();
    expect(broad.priorities).toHaveLength(4);
    expect(broad.priorities.flatMap((priority) => priority.target.targetMovementRoles)).toEqual(
      expect.arrayContaining(["horizontal_push", "vertical_push", "horizontal_pull", "vertical_pull"]));

    const separate = resolved({ separatePlaneFacts: [{
      factId: "product-fact:both-push-planes",
      family: "upper_push",
      requiredPlanes: ["horizontal", "vertical"],
      owner: "explicit_subgoal",
      evidenceRefs: ["owner-confirmation:both-push-planes"],
    }] });
    expect(separate.priorities).toHaveLength(5);
    expect(separate.responsibilityTraces.filter((trace) => trace.foundationKey === "upper_push")
      .map((trace) => trace.responsibilityKey)).toEqual([
      "foundation:upper_push:horizontal", "foundation:upper_push:vertical",
    ]);
    expect(separate.responsibilityTraces.filter((trace) => trace.foundationKey === "upper_pull")).toHaveLength(1);
    expect(separate.responsibilityTraces.filter((trace) => trace.foundationKey === "upper_push")
      .every((trace) => trace.owningFactId === "product-fact:both-push-planes")).toBe(true);
  });

  it("requires typed ownership for conditional/preferred/optional work and never uses capacity as purpose", () => {
    const five = resolved({ availableOpportunityCount: 5 });
    const eight = resolved({ availableOpportunityCount: 8 });
    expect(eight.priorities).toEqual(five.priorities);
    expect(eight.responsibilityTraces).toEqual(five.responsibilityTraces);

    const withOwnedWork = resolved({ additionalResponsibilityFacts: [
      { factId: "fact:reviewed-unilateral", kind: "unilateral", classification: "conditional_required",
        owner: "reviewed_assessment", evidenceRefs: ["assessment:accepted"] },
      { factId: "fact:coverage-carry", kind: "carry", classification: "optional",
        owner: "reviewed_nonredundant_whole_program_coverage", evidenceRefs: ["coverage:carry"] },
    ] });
    expect(withOwnedWork.priorities).toHaveLength(6);
    expect(withOwnedWork.priorities.slice(4).map((priority) => priority.priority)).toEqual(["required", "optional"]);

    const capacityOnly = applyProductGetStrongerDevelopWeeklyResponsibilityPolicyV1(input({
      additionalResponsibilityFacts: [{ factId: "fact:spare-capacity", kind: "carry", classification: "optional",
        owner: "available_capacity" as never, evidenceRefs: ["five-days"] }],
    }));
    expect(capacityOnly).toMatchObject({ status: "invalid_input",
      reasonCodes: ["RESPONSIBILITY_OWNING_FACT_REQUIRED"] });
  });

  it("retains every loading state and blocks unresolved or insufficient capability without guessing", () => {
    const result = resolved({ loadingEvidence: [
      { evidenceId: "load:knee", responsibilityKey: "foundation:knee_dominant_squat", state: "confirmed",
        sourceFactIds: ["load-fact:knee"] },
      { evidenceId: "load:hinge", responsibilityKey: "foundation:hinge_hip_extension",
        state: "bounded_initial_calibration", sourceFactIds: ["load-fact:hinge"] },
      { evidenceId: "load:push", responsibilityKey: "foundation:upper_push", state: "unresolved",
        sourceFactIds: ["load-fact:push"], unresolvedCapabilityRef: "ASK_EXACT_PUSH_LOAD_CAPABILITY" },
      { evidenceId: "load:pull", responsibilityKey: "foundation:upper_pull", state: "insufficient",
        sourceFactIds: ["load-fact:pull"], unresolvedCapabilityRef: "ASK_EXACT_PULL_LOAD_CAPABILITY" },
    ] });
    expect(result.responsibilityTraces.map((trace) => trace.loadingCompletenessState)).toEqual([
      "confirmed", "bounded_initial_calibration", "unresolved", "insufficient",
    ]);
    expect(result.unresolvedCapabilityRefs).toEqual([
      "ASK_EXACT_PULL_LOAD_CAPABILITY", "ASK_EXACT_PUSH_LOAD_CAPABILITY",
    ]);
    expect(result.priorities[1]!.executionRequirements).toMatchObject({
      calibrationStateRequired: true, unresolvedCapabilityDisposition: "none",
    });
    expect(result.priorities.slice(2).every((priority) =>
      priority.executionRequirements?.unresolvedCapabilityDisposition === "retained_blocks_approval")).toBe(true);
  });

  it("is deterministic and treats Advanced as scoring context, never history or prerequisite proof", () => {
    const first = resolved();
    const second = resolved();
    expect(second).toEqual(first);
    const serialized = JSON.stringify(first);
    expect(serialized).not.toMatch(/satisfiedPrerequisiteIds|reliablePriorPerformance|progression|nextWeekPrimary/);
    expect(first.decisionTrace).toContain("ADVANCED_DOES_NOT_FABRICATE_HISTORY_LOAD_OR_PREREQUISITES");
    expect(first.decisionTrace).toContain("STABLE_CANONICAL_PRIORITY_ORDER_NO_AUTOMATIC_CROSS_WEEK_ROTATION");
  });

  it("rejects policy mutations that erase ownership, development, loading truth, or isolation", () => {
    const base = resolved();
    const deleted = mutable(base);
    (deleted as unknown as { priorities: unknown[] }).priorities.shift();
    (deleted as unknown as { responsibilityTraces: unknown[] }).responsibilityTraces.shift();

    const downgraded = mutable(base);
    (downgraded.priorities[0] as { priority: string }).priority = "preferred";

    const separate = mutable(resolved({ separatePlaneFacts: [{ factId: "fact:both-pull", family: "upper_pull",
      requiredPlanes: ["horizontal", "vertical"], owner: "explicit_subgoal", evidenceRefs: ["fact:both-pull"] }] }));
    (separate.priorities.find((priority) => priority.priorityId.endsWith("upper_pull:vertical"))!
      .target as unknown as { targetMovementRoles: string[] }).targetMovementRoles = ["horizontal_pull"];

    const injectedExercise = Object.assign(mutable(base), { exerciseId: "not-policy-owned" });
    const injectedDose = Object.assign(mutable(base), { sets: 3 });
    const injectedRotation = Object.assign(mutable(base), { rotationRule: "change-next-week" });
    const fabricatedPrerequisite = Object.assign(mutable(base), { satisfiedPrerequisiteIds: ["hinge-control"] });
    const shadowActivated = Object.assign(mutable(base), { productShadowActivated: true });

    const preparationCredit = mutable(base);
    (preparationCredit.priorities[0]!.executionRequirements as { developmentalCreditRequired: boolean })
      .developmentalCreditRequired = false;

    const wrongExecutionSemantics = mutable(base);
    Object.assign(wrongExecutionSemantics.priorities[0]!.executionRequirements!, {
      requiredPrescriptionPurpose: "capacity_development",
      loadingSuitabilityRequired: false,
      calibrationStateRequired: false,
    });

    const hiddenUnmet = mutable(base);
    const hiddenRequirements = hiddenUnmet.priorities[0]!.executionRequirements as unknown as {
      unresolvedCapabilityDisposition: string;
      unresolvedCapabilityRefs: string[];
    };
    hiddenRequirements.unresolvedCapabilityDisposition = "none";
    hiddenRequirements.unresolvedCapabilityRefs = [];

    for (const mutation of [deleted, downgraded, separate, injectedExercise, injectedDose,
      injectedRotation, fabricatedPrerequisite, shadowActivated, preparationCredit,
      wrongExecutionSemantics, hiddenUnmet]) {
      expect(validateProductGetStrongerDevelopWeeklyResponsibilityPolicyResult(
        mutation as ProductGetStrongerDevelopWeeklyPolicyResult)).not.toEqual([]);
    }
  });

  it("contains no temporary bridge or fallback authority", () => {
    const pipeline = readFileSync(new URL("../../src/ownerDelivery/pipeline.ts", import.meta.url), "utf8");
    expect(pipeline).not.toContain("buildOwnerGetStrongerWeeklyPriorities");
    expect(pipeline).not.toContain("OWNER_GET_STRONGER_RESPONSIBILITY_KEYS");
    expect(pipeline).not.toContain("push-up-plank-control\", \"hinge-control");
    expect(pipeline).toContain("applyProductGetStrongerDevelopWeeklyResponsibilityPolicyV1");
  });
});
