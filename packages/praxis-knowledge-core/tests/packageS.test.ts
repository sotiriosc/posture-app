import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  PACKAGE_S_KNOWLEDGE_CONTRACT,
  PACKAGE_S_KNOWLEDGE_ENTRIES,
  PACKAGE_S_SELECTED_EXERCISE_IDS,
  PRODUCTION_53_KNOWLEDGE_ENTRIES,
  PRODUCTION_64_KNOWLEDGE_CORE,
  PRODUCTION_64_KNOWLEDGE_ENTRIES,
  PRODUCTION_64_KNOWLEDGE_REGISTRY,
  PRODUCTION_64_KNOWLEDGE_REGISTRY_CONTRACT,
  projectCompactFallbacks,
  stableKnowledgeJson,
  validateKnowledgeCore,
} from "../src";

const workspace = resolve(process.cwd(), "../..");
const baselineEntries = JSON.parse(readFileSync(resolve(
  workspace,
  "docs/training-engine-v2/pre-g2k-json/KNOWLEDGE_ENTRIES.json",
), "utf8")) as readonly (typeof PRODUCTION_53_KNOWLEDGE_ENTRIES)[number][];

describe("Package S standard-commercial-gym Knowledge", () => {
  it("publishes eleven complete selected entries and one 64-entry registry", () => {
    expect(PACKAGE_S_KNOWLEDGE_CONTRACT).toEqual({
      contractId: "PACKAGE_S_STANDARD_COMMERCIAL_GYM_FOUNDATIONS_KNOWLEDGE",
      contractVersion: "1.0.0",
    });
    expect(PRODUCTION_64_KNOWLEDGE_REGISTRY.contract)
      .toBe(PRODUCTION_64_KNOWLEDGE_REGISTRY_CONTRACT);
    expect(PACKAGE_S_KNOWLEDGE_ENTRIES).toHaveLength(11);
    expect(PACKAGE_S_SELECTED_EXERCISE_IDS).toHaveLength(11);
    expect(PRODUCTION_64_KNOWLEDGE_ENTRIES).toHaveLength(64);
    expect(new Set(PRODUCTION_64_KNOWLEDGE_ENTRIES.map((entry) => entry.exerciseId)).size)
      .toBe(64);
    expect(validateKnowledgeCore(PRODUCTION_64_KNOWLEDGE_CORE)).toEqual([]);
  });

  it("meets every mandatory presentation minimum", () => {
    for (const entry of PACKAGE_S_KNOWLEDGE_ENTRIES) {
      expect(entry.presentation.focus).toBeTruthy();
      expect(entry.presentation.cues.length).toBeGreaterThanOrEqual(2);
      expect(entry.presentation.cues.length).toBeLessThanOrEqual(5);
      expect(entry.presentation.setup.length).toBeGreaterThanOrEqual(2);
      expect(entry.presentation.during.length).toBeGreaterThanOrEqual(2);
      expect(entry.presentation.pattern.length).toBeGreaterThanOrEqual(1);
      expect(entry.presentation.watchFor.length).toBeGreaterThanOrEqual(2);
      expect(entry.unresolvedClaims.every((claim) =>
        !/\b(diagnoses|treats|prevents|cures|guarantees)\b/i.test(claim)))
        .toBe(true);
    }
  });

  it("freezes 52 entries exactly and changes machine chest press only by the authorized incline override", () => {
    const baselineById = new Map(baselineEntries.map((entry) => [entry.exerciseId, entry]));
    for (const entry of PRODUCTION_53_KNOWLEDGE_ENTRIES) {
      const baseline = baselineById.get(entry.exerciseId)!;
      if (entry.exerciseId !== "machine-chest-press") {
        expect(stableKnowledgeJson(entry)).toBe(stableKnowledgeJson(baseline));
        continue;
      }
      const addedFactIds = new Set([
        "machine-chest-press.realization.fixed-incline-machine.setup",
        "machine-chest-press.realization.fixed-incline-machine.during",
      ]);
      expect(entry.facts.filter((fact) => !addedFactIds.has(fact.id)))
        .toEqual(baseline.facts);
      expect(entry.facts.filter((fact) => addedFactIds.has(fact.id))).toHaveLength(2);
      expect(entry.realizationOverrides.filter((override) =>
        override.realizationId !== "fixed-machine-incline"))
        .toEqual(baseline.realizationOverrides);
      expect(entry.realizationOverrides.some((override) =>
        override.realizationId === "fixed-machine-incline")).toBe(true);
      expect(entry.presentation).toEqual(baseline.presentation);
    }
  });

  it("keeps all 53 compact fallbacks byte-equivalent and generates all 64", () => {
    const before = projectCompactFallbacks(baselineEntries);
    const current53 = projectCompactFallbacks(PRODUCTION_53_KNOWLEDGE_ENTRIES);
    expect(current53).toEqual(before);
    expect(projectCompactFallbacks(PRODUCTION_64_KNOWLEDGE_ENTRIES)).toHaveLength(64);
  });

  it("keeps Pull-Up one identity and straight-arm pulldown outside vertical pull", () => {
    const pullUp = PACKAGE_S_KNOWLEDGE_ENTRIES.find((entry) => entry.exerciseId === "pull-up")!;
    const straightArm = PACKAGE_S_KNOWLEDGE_ENTRIES.find(
      (entry) => entry.exerciseId === "straight-arm-cable-pulldown",
    )!;
    expect(pullUp.realizationOverrides.map((value) => value.realizationId).sort())
      .toEqual(["bodyweight-unassisted", "machine-assisted"]);
    expect(straightArm.relatedMovementRoleIds).toEqual(["accessory"]);
    expect(straightArm.relatedActionFunctionIds).toEqual(["shoulder_extension"]);
  });
});
