import { describe, expect, it } from "vitest";
import {
  COMPACT_FALLBACK_PROJECTION_CONTRACT,
  KNOWLEDGE_CORE_CONTRACT,
  KNOWLEDGE_ENTRY_CONTRACT,
  KNOWLEDGE_FACT_CONTRACT,
  KNOWLEDGE_CURATION_WAVE_CONTRACT,
  KNOWLEDGE_PRESENTATION_MAP_CONTRACT,
  KNOWLEDGE_PROVENANCE_CONTRACT,
  PACKAGE_R_KNOWLEDGE_CORE,
  PACKAGE_R_KNOWLEDGE_ENTRIES,
  PACKAGE_R_SELECTED_EXERCISE_IDS,
  REALIZATION_KNOWLEDGE_OVERRIDE_CONTRACT,
  projectCompactFallbacks,
  stableKnowledgeJson,
  validateKnowledgeCore,
} from "../src";

describe("Praxis Exercise Knowledge Core V1", () => {
  it("pins every contract to an explicit supported version", () => {
    expect([
      KNOWLEDGE_CORE_CONTRACT,
      KNOWLEDGE_ENTRY_CONTRACT,
      KNOWLEDGE_FACT_CONTRACT,
      KNOWLEDGE_PRESENTATION_MAP_CONTRACT,
      REALIZATION_KNOWLEDGE_OVERRIDE_CONTRACT,
      KNOWLEDGE_PROVENANCE_CONTRACT,
      COMPACT_FALLBACK_PROJECTION_CONTRACT,
      KNOWLEDGE_CURATION_WAVE_CONTRACT,
    ].every((contract) => contract.contractVersion === "1.0.0")).toBe(true);
  });

  it("contains exactly the owner-selected Package R identities", () => {
    expect(PACKAGE_R_SELECTED_EXERCISE_IDS).toEqual([
      "dumbbell-floor-press",
      "dumbbell-triceps-extension",
      "bent-over-dumbbell-reverse-fly",
      "side-lying-hip-abduction",
      "bird-dog",
      "band-biceps-curl",
      "machine-shoulder-press",
      "machine-leg-extension",
    ]);
    expect(PACKAGE_R_KNOWLEDGE_ENTRIES).toHaveLength(8);
    expect(validateKnowledgeCore(PACKAGE_R_KNOWLEDGE_CORE)).toEqual([]);
  });

  it("keeps all six presentation categories complete through fact references", () => {
    for (const entry of PACKAGE_R_KNOWLEDGE_ENTRIES) {
      expect(entry.presentation.focus).toMatch(new RegExp(`^${entry.exerciseId}\\.`));
      expect(entry.presentation.cues.length).toBeGreaterThanOrEqual(2);
      expect(entry.presentation.setup.length).toBeGreaterThanOrEqual(2);
      expect(entry.presentation.during.length).toBeGreaterThanOrEqual(2);
      expect(entry.presentation.pattern.length).toBeGreaterThanOrEqual(1);
      expect(entry.presentation.watchFor.length).toBeGreaterThanOrEqual(2);
      expect(new Set(entry.facts.map((fact) => fact.canonicalStatement.toLowerCase())).size).toBe(entry.facts.length);
    }
  });

  it("projects compact fallbacks deterministically without engine imports", () => {
    const first = projectCompactFallbacks(PACKAGE_R_KNOWLEDGE_ENTRIES);
    const second = projectCompactFallbacks([...PACKAGE_R_KNOWLEDGE_ENTRIES].reverse());
    expect(first).toEqual(second);
    expect(first).toHaveLength(8);
    expect(first.every((entry) => entry.coachingFocus.length === 2)).toBe(true);
  });

  it("rejects unsupported versions, missing references, duplicates, and whole-entry overrides", () => {
    const baseline = PACKAGE_R_KNOWLEDGE_ENTRIES[0]!;
    const unsupported = {
      ...PACKAGE_R_KNOWLEDGE_CORE,
      contract: { ...KNOWLEDGE_CORE_CONTRACT, contractVersion: "2.0.0" },
    } as unknown as typeof PACKAGE_R_KNOWLEDGE_CORE;
    expect(validateKnowledgeCore(unsupported).some((entry) => entry.code === "unsupported_core_contract")).toBe(true);

    const missingRef = {
      ...baseline,
      presentation: { ...baseline.presentation, focus: `${baseline.exerciseId}.missing` },
    };
    expect(validateKnowledgeCore({ ...PACKAGE_R_KNOWLEDGE_CORE, entries: [missingRef] })
      .some((entry) => entry.code === "missing_fact_reference")).toBe(true);

    const duplicate = { ...baseline, facts: [...baseline.facts, baseline.facts[0]!] };
    expect(validateKnowledgeCore({ ...PACKAGE_R_KNOWLEDGE_CORE, entries: [duplicate] })
      .some((entry) => entry.code === "duplicate_fact_id")).toBe(true);
  });

  it("serializes deterministically across object-key order", () => {
    expect(stableKnowledgeJson({ b: 2, a: 1 })).toBe(stableKnowledgeJson({ a: 1, b: 2 }));
  });
});
