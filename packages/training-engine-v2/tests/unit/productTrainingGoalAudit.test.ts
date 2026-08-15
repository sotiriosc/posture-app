import { describe, expect, it } from "vitest";
import {
  PRODUCT_TRAINING_GOAL_AFFECTED_EXERCISES,
  PRODUCT_TRAINING_GOAL_AUDIT_FINGERPRINTS,
  PRODUCT_TRAINING_GOAL_CAGT_MUTATIONS,
  PRODUCT_TRAINING_GOAL_CAGT_RESULT,
  PRODUCT_TRAINING_GOAL_SCENARIOS,
  buildProductTrainingGoalAuditReport,
} from "../cagt/productTrainingGoalAudit";

describe("Product training goal audit", () => {
  it("returns the owner-selection classification without selecting or activating policy", () => {
    const report = buildProductTrainingGoalAuditReport();
    expect(report).toMatchObject({
      classification: "PRODUCT_TRAINING_GOAL_AND_PRESCRIPTION_SPECIFICITY_V1_READY_FOR_OWNER_POLICY_SELECTION",
      ontologyClassification: "PRODUCT_TRAINING_GOAL_ONTOLOGY_READY",
      nextDependency: "OWNER_SELECTION_OF_PRODUCT_GOAL_VOCABULARY_AND_GOAL_SPECIFIC_PRESCRIPTION_POLICY",
      productionBehaviorChanged: false,
      productBehaviorChanged: false,
      shadowRolloutChanged: false,
      selectedPolicy: false,
      publicApiChanges: 0,
      productionCodeChanges: 0,
    });
  });

  it("identifies the exact canonical primary-main repetition exercises exposed to fallthrough", () => {
    expect(PRODUCT_TRAINING_GOAL_AFFECTED_EXERCISES).toEqual([
      "push-up", "dumbbell-bench-press", "machine-chest-press",
      "chest-supported-dumbbell-row", "one-arm-dumbbell-row", "machine-row",
      "seated-cable-row", "dumbbell-shoulder-press", "lat-pulldown",
      "goblet-squat", "leg-press", "dumbbell-romanian-deadlift",
    ]);
    expect(buildProductTrainingGoalAuditReport()).toMatchObject({
      compilerFallthroughGoalCount: 5,
      compilerFallthroughCharacterization:
        "OVERBROAD_ACCIDENTAL_FALLTHROUGH_FOR_MAIN_REPETITION_SET_ASSIGNMENTS",
    });
  });

  it("covers the required design-only scenario dimensions without artificial uniqueness", () => {
    expect(PRODUCT_TRAINING_GOAL_SCENARIOS).toHaveLength(180);
    expect(new Set(PRODUCT_TRAINING_GOAL_SCENARIOS.map((entry) => entry.goalTruth)).size).toBe(10);
    expect(new Set(PRODUCT_TRAINING_GOAL_SCENARIOS.map((entry) => entry.equipment)).size).toBe(6);
    expect(new Set(PRODUCT_TRAINING_GOAL_SCENARIOS.map((entry) => entry.experience)).size).toBe(3);
    expect(new Set(PRODUCT_TRAINING_GOAL_SCENARIOS.map((entry) => entry.section)).size).toBe(5);
    expect(new Set(PRODUCT_TRAINING_GOAL_SCENARIOS.map((entry) => entry.context)).size).toBe(5);
    expect(new Set(PRODUCT_TRAINING_GOAL_SCENARIOS.map((entry) => entry.comparisonCase)).size).toBe(7);
    expect(new Set(PRODUCT_TRAINING_GOAL_SCENARIOS.map((entry) => entry.comparisonShellId)).size).toBe(18);
    expect(PRODUCT_TRAINING_GOAL_SCENARIOS.filter((entry) => entry.comparisonShellId === "SHELL-01"))
      .toHaveLength(10);
    expect(PRODUCT_TRAINING_GOAL_SCENARIOS.some((entry) => entry.goalPosition === "secondary")).toBe(true);
    expect(PRODUCT_TRAINING_GOAL_SCENARIOS.every((entry) =>
      !entry.selectedPolicy && !entry.productionBehaviorChanged)).toBe(true);
    expect(PRODUCT_TRAINING_GOAL_CAGT_RESULT).toMatchObject({
      artificialUniquenessCount: 0,
      diversityQuotaCount: 0,
      genericStrengthWarmupCount: 0,
      genericHypertrophyActivationCount: 0,
      acceptedDownstreamRescueCount: 0,
    });
  });

  it("rejects every required causal mutation and fingerprints the complete audit", () => {
    expect(PRODUCT_TRAINING_GOAL_CAGT_MUTATIONS).toHaveLength(11);
    expect(PRODUCT_TRAINING_GOAL_CAGT_MUTATIONS.every((entry) => entry.result === "REJECTED")).toBe(true);
    expect(Object.keys(PRODUCT_TRAINING_GOAL_AUDIT_FINGERPRINTS)).toHaveLength(20);
    expect(PRODUCT_TRAINING_GOAL_AUDIT_FINGERPRINTS.combinedAudit).toMatch(/^[a-f0-9]{64}$/);
  });
});
