import { describe, expect, it } from "vitest";
import {
  CURRENT_45_KNOWLEDGE_COMPLETION_CONTRACT,
  LEGACY_FALLBACK_EQUIVALENCE_CONTRACT,
  ORIGINAL_45_KNOWLEDGE_ENTRIES,
  ORIGINAL_45_KNOWLEDGE_IDS,
  PACKAGE_R_KNOWLEDGE_ENTRIES,
  PRODUCTION_53_KNOWLEDGE_CORE,
  PRODUCTION_53_KNOWLEDGE_ENTRIES,
  PRODUCTION_53_KNOWLEDGE_REGISTRY,
  PRODUCTION_KNOWLEDGE_REGISTRY_CONTRACT,
  PRODUCTION_KNOWLEDGE_REVIEW_LEDGER_CONTRACT,
  projectCompactFallbacks,
  validateKnowledgeCore,
} from "../src";

describe("production 53 exercise Knowledge registry", () => {
  it("publishes all completion contracts at version 1.0.0", () => {
    expect([
      CURRENT_45_KNOWLEDGE_COMPLETION_CONTRACT,
      PRODUCTION_KNOWLEDGE_REGISTRY_CONTRACT,
      LEGACY_FALLBACK_EQUIVALENCE_CONTRACT,
      PRODUCTION_KNOWLEDGE_REVIEW_LEDGER_CONTRACT,
    ].every((contract) => contract.contractVersion === "1.0.0")).toBe(true);
  });

  it("contains 45 migrated and eight frozen entries exactly once", () => {
    expect(ORIGINAL_45_KNOWLEDGE_ENTRIES).toHaveLength(45);
    expect(PACKAGE_R_KNOWLEDGE_ENTRIES).toHaveLength(8);
    expect(PRODUCTION_53_KNOWLEDGE_ENTRIES).toHaveLength(53);
    expect(new Set(PRODUCTION_53_KNOWLEDGE_ENTRIES.map((entry) => entry.exerciseId)).size).toBe(53);
    expect(PRODUCTION_53_KNOWLEDGE_REGISTRY.contract).toBe(PRODUCTION_KNOWLEDGE_REGISTRY_CONTRACT);
  });

  it("validates every entry and projects every fallback deterministically", () => {
    expect(validateKnowledgeCore(PRODUCTION_53_KNOWLEDGE_CORE)).toEqual([]);
    expect(projectCompactFallbacks(PRODUCTION_53_KNOWLEDGE_ENTRIES)).toHaveLength(53);
    expect(projectCompactFallbacks([...PRODUCTION_53_KNOWLEDGE_ENTRIES].reverse()))
      .toEqual(projectCompactFallbacks(PRODUCTION_53_KNOWLEDGE_ENTRIES));
  });

  it("keeps the exact original-45 wave order", () => {
    expect(ORIGINAL_45_KNOWLEDGE_IDS.slice(0, 3)).toEqual([
      "ninety-ninety-breathing", "serratus-wall-slide", "dead-bug",
    ]);
    expect(ORIGINAL_45_KNOWLEDGE_IDS.slice(-3)).toEqual([
      "wall-ankle-dorsiflexion-rock", "bodyweight-hip-hinge-rehearsal", "single-leg-balance-rehearsal",
    ]);
  });
});
