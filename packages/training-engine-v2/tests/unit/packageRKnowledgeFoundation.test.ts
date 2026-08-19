import { describe, expect, it } from "vitest";
import {
  PACKAGE_R_KNOWLEDGE_ENTRIES,
  PACKAGE_R_SELECTED_EXERCISE_IDS,
  validateKnowledgeCore,
  PACKAGE_R_KNOWLEDGE_CORE,
} from "../../../praxis-knowledge-core/src";
import { renderGeneratedExerciseCoachingFallbacks } from "../../dev/generateExerciseCoachingFallbacks";
import {
  knowledgeBoundaryGuards,
  knowledgeFoundationFingerprints,
  knowledgeFoundationValidation,
  knowledgeOntologyAnswers,
  knowledgeOntologyClassification,
  packageRCompactFallbackProjection,
} from "../packageRKnowledge/foundationEvidence";
import {
  current45KnowledgeAudit,
  current45KnowledgeCompletenessMatrix,
} from "../packageRKnowledge/current45Audit";

describe("Package R Knowledge foundation", () => {
  it("answers the ontology and preserves a pure Knowledge boundary", () => {
    expect(knowledgeOntologyAnswers).toHaveLength(30);
    expect(knowledgeOntologyClassification).toBe("HOME_FIRST_MIXED_CATALOG_KNOWLEDGE_ONTOLOGY_READY");
    expect(Object.values(knowledgeBoundaryGuards).every((count) => count === 0)).toBe(true);
  });

  it("validates all eight entries and their complete referenced presentations", () => {
    expect(PACKAGE_R_SELECTED_EXERCISE_IDS).toHaveLength(8);
    expect(PACKAGE_R_KNOWLEDGE_ENTRIES).toHaveLength(8);
    expect(validateKnowledgeCore(PACKAGE_R_KNOWLEDGE_CORE)).toEqual([]);
    expect(knowledgeFoundationValidation.findings).toEqual([]);
    expect(knowledgeFoundationValidation.duplicateFactCount).toBe(0);
    expect(knowledgeFoundationValidation.orphanFactCount).toBe(0);
    expect(knowledgeFoundationValidation.missingPresentationReferenceCount).toBe(0);
  });

  it("keeps the current 45 as frozen compact fallbacks pending Pre-G2K", () => {
    expect(current45KnowledgeCompletenessMatrix).toHaveLength(45);
    expect(current45KnowledgeAudit.counts).toMatchObject({
      knowledgeCoreComplete: 0,
      compactFallbackOnly: 45,
      missingFocus: 45,
      missingCues: 45,
      missingSetup: 45,
      missingDuring: 45,
      missingPattern: 45,
      missingWatchFor: 45,
      realizationOverrideRequired: 17,
      provenanceRequired: 45,
      semanticConflictReviewRequired: 0,
      rowBlockerCount: 45,
    });
    expect(current45KnowledgeAudit.compactFallbackChanges).toBe(0);
    expect(current45KnowledgeAudit.inferredKnowledgeEntries).toBe(0);
  });

  it("renders a deterministic generated production projection without writing it", () => {
    expect(packageRCompactFallbackProjection).toHaveLength(8);
    const first = renderGeneratedExerciseCoachingFallbacks();
    const second = renderGeneratedExerciseCoachingFallbacks();
    expect(first).toBe(second);
    expect(first).toContain("Do not edit by hand");
    expect(first).toContain("dumbbell-floor-press");
    expect(first).toContain("@praxis/knowledge-core");
  });

  it("fingerprints every foundation artifact deterministically", () => {
    expect(Object.values(knowledgeFoundationFingerprints).every((value) => /^[a-f0-9]{64}$/.test(value))).toBe(true);
  });
});
