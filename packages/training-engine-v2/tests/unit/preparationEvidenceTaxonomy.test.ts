import { describe, expect, it } from "vitest";
import {
  PREPARATION_CATEGORIES,
  PREPARATION_EVIDENCE_REFERENCES,
  PREPARATION_TAXONOMY,
  REFERENCE_EXERCISES,
} from "../../src";
import {
  PREPARATION_FOUNDATION_ADMITTED_IDS,
  currentProductionCatalogAudit,
  preparationCandidateAudit,
  productExerciseCatalogAudit,
  productWarmupLibraryAudit,
} from "../preparationIntelligence/candidateAudit";

describe("preparation evidence and taxonomy foundation", () => {
  it("defines the eight ordered categories without developmental credit", () => {
    expect(PREPARATION_TAXONOMY.map((entry) => entry.category)).toEqual(PREPARATION_CATEGORIES);
    expect(PREPARATION_TAXONOMY.every((entry) => entry.developmentalCredit === false)).toBe(true);
    expect(PREPARATION_TAXONOMY.map((entry) => entry.order)).toEqual([10, 20, 30, 40, 50, 60, 70, 90]);
  });

  it("records evidence, doctrine, inference, and explicit insufficiency boundaries", () => {
    const classifications = new Set(PREPARATION_EVIDENCE_REFERENCES.map((entry) => entry.classification));
    expect(classifications).toEqual(new Set([
      "supported_evidence",
      "reasonable_biomechanical_inference",
      "praxis_coaching_doctrine",
      "insufficient_evidence",
    ]));
    expect(PREPARATION_EVIDENCE_REFERENCES.every((entry) => entry.boundary.length > 20)).toBe(true);
    expect(PREPARATION_EVIDENCE_REFERENCES.some((entry) => entry.finding.includes("injury prevention"))).toBe(true);
    expect(PREPARATION_EVIDENCE_REFERENCES.some((entry) => entry.finding.includes("delayed soreness"))).toBe(true);
  });

  it("audits every current V2 identity and both historical Product preparation catalogs", () => {
    expect(currentProductionCatalogAudit).toHaveLength(REFERENCE_EXERCISES.length);
    expect(productWarmupLibraryAudit).toHaveLength(36);
    expect(productExerciseCatalogAudit).toHaveLength(26);
    expect(new Set(preparationCandidateAudit.map((entry) => `${entry.sourceCatalog}:${entry.sourceId}`)).size)
      .toBe(preparationCandidateAudit.length);
  });

  it("admits only five distinct gap-closing migration identities", () => {
    expect(PREPARATION_FOUNDATION_ADMITTED_IDS).toEqual([
      "moving-ninety-ninety-hip-switch",
      "quadruped-hip-rock-back",
      "scapular-push-up",
      "bodyweight-squat-rehearsal",
      "half-kneeling-hip-flexor-stretch",
    ]);
    expect(preparationCandidateAudit.filter((entry) =>
      entry.disposition === "legacy_suitable_for_canonical_migration")
      .every((entry) => entry.canonicalId && PREPARATION_FOUNDATION_ADMITTED_IDS.includes(entry.canonicalId)))
      .toBe(true);
  });
});
