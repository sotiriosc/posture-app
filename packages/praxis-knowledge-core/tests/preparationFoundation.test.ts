import { describe, expect, it } from "vitest";
import { PREPARATION_FOUNDATION_KNOWLEDGE_ENTRIES } from "../src/entries/preparationFoundation";
import {
  PRODUCTION_69_KNOWLEDGE_CORE,
  PRODUCTION_69_KNOWLEDGE_ENTRIES,
  PRODUCTION_69_KNOWLEDGE_REGISTRY,
} from "../src/registry";
import { PRODUCTION_69_KNOWLEDGE_REGISTRY_CONTRACT } from "../src/contracts";
import { projectCompactFallbacks } from "../src/compactProjection";
import { validateKnowledgeCore } from "../src/validation";

describe("preparation foundation Knowledge", () => {
  it("extends the immutable production registry from 64 to 69 complete entries", () => {
    expect(PREPARATION_FOUNDATION_KNOWLEDGE_ENTRIES).toHaveLength(5);
    expect(PRODUCTION_69_KNOWLEDGE_ENTRIES).toHaveLength(69);
    expect(PRODUCTION_69_KNOWLEDGE_REGISTRY.contract)
      .toBe(PRODUCTION_69_KNOWLEDGE_REGISTRY_CONTRACT);
    expect(new Set(PRODUCTION_69_KNOWLEDGE_ENTRIES.map((entry) => entry.exerciseId)).size).toBe(69);
    expect(validateKnowledgeCore(PRODUCTION_69_KNOWLEDGE_CORE)).toEqual([]);
    expect(projectCompactFallbacks(PRODUCTION_69_KNOWLEDGE_ENTRIES)).toHaveLength(69);
  });

  it("keeps selection authority out of Knowledge prose", () => {
    const prose = JSON.stringify(PREPARATION_FOUNDATION_KNOWLEDGE_ENTRIES).toLowerCase();
    expect(prose).not.toContain("if chest day");
    expect(prose).not.toContain("if leg day");
    expect(prose).not.toContain("prevents injury");
    expect(prose).not.toContain("prevents soreness");
    expect(prose).not.toContain("accelerates recovery");
  });
});
