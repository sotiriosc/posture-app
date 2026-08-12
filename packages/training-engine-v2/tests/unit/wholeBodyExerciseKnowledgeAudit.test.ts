import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  REFERENCE_EXERCISES,
  type ExerciseDefinition,
} from "../../src";
import {
  COMPREHENSIVE_BEHAVIOR_FINGERPRINT,
  PRODUCTION_RANKING_FINGERPRINT,
  buildWholeBodyExerciseKnowledgeAuditData,
  renderWholeBodyCandidatePoolMatrix,
  renderWholeBodyExerciseKnowledgeAudit,
  renderWholeBodyMinimalCatalogExpansionProposal,
} from "../helpers/wholeBodyExerciseKnowledgeAudit";

const data = buildWholeBodyExerciseKnowledgeAuditData();

function exercise(id: string): ExerciseDefinition {
  const found = REFERENCE_EXERCISES.find((candidate) => candidate.id === id);
  if (!found) throw new Error(`Missing exercise ${id}.`);
  return found;
}

function matrix(archetypeId: string, environmentId = "full-commercial-gym") {
  const found = data.matrix.find(
    (row) => row.archetypeId === archetypeId && row.environmentId === environmentId,
  );
  if (!found) throw new Error(`Missing matrix row ${archetypeId}/${environmentId}.`);
  return found;
}

describe("whole-body exercise knowledge and candidate-pool audit", () => {
  it("freezes all production baselines while auditing exactly one 37-row catalog", () => {
    expect(data.productionBehaviorChanged).toBe(false);
    expect(data.catalogCount).toBe(37);
    expect(data.uniqueCatalogCount).toBe(37);
    expect(data.productionRankingFingerprint).toBe(PRODUCTION_RANKING_FINGERPRINT);
    expect(data.comprehensiveBehaviorFingerprint).toBe(COMPREHENSIVE_BEHAVIOR_FINGERPRINT);
    expect(data.contextualPhaseFingerprint)
      .toBe("3eaf245600d09813bd2313d0cc3a079e29f1c7aa1c6ce01f4513f404dc203216");
    expect(data.safetyResponseFingerprint)
      .toBe("539dba50cc8d0dda4dcaa28cfc9cc764d15049aba8bddace707bff5b98d2c562");
    expect(data.stableAdaptiveFingerprint)
      .toBe("58067eee7d9e34836e15150caf8be5de1ae4d896db43199f40583dd45020c72a");
  });

  it("identifies every role-purity problem without applying a production correction", () => {
    expect(data.roleProblemIds).toEqual([
      "dumbbell-curl",
      "cable-triceps-pressdown",
      "dumbbell-lateral-raise",
      "lying-leg-curl",
      "cable-chest-fly",
      "reverse-pec-deck",
      "band-face-pull",
      "glute-bridge",
      "serratus-wall-slide",
      "leg-press",
    ]);
    expect(data.roleAudit.find((row) => row.exerciseId === "dumbbell-curl"))
      .toEqual(expect.objectContaining({ futureCoverageDistortion: true, sectionGateIsSufficient: false }));
    expect(matrix("horizontal-push").productionLegalIds).not.toContain("cable-triceps-pressdown");
    expect(matrix("vertical-push").truthfulLegalIds).toEqual(["dumbbell-shoulder-press"]);
    expect(matrix("hip-dominant").truthfulLegalIds).toEqual([
      "dumbbell-romanian-deadlift",
      "cable-pull-through",
    ]);
    expect(exercise("dumbbell-curl").movementRoles).toEqual(["horizontal_pull"]);
    expect(exercise("lying-leg-curl").movementRoles).toEqual(["hinge"]);
  });

  it("proves direct muscle-only slots work and exposes their exact limits", () => {
    expect(matrix("direct-biceps").truthfulLegalIds).toEqual(["dumbbell-curl"]);
    expect(matrix("direct-triceps").truthfulLegalIds).toEqual(["cable-triceps-pressdown"]);
    expect(matrix("direct-side-delts").truthfulLegalIds).toEqual(["dumbbell-lateral-raise"]);
    expect(matrix("direct-rear-delts").truthfulLegalIds).toEqual([
      "reverse-pec-deck",
      "band-face-pull",
    ]);
    expect(matrix("direct-calves").truthfulLegalIds).toEqual([]);
    expect(matrix("direct-hip-abductors").truthfulLegalIds).toEqual([]);
    expect(matrix("direct-hip-adductors").truthfulLegalIds).toEqual([]);
    expect(matrix("direct-rotator-cuff").truthfulLegalIds).toEqual([]);
    expect(matrix("hamstring-knee-flexion").classification)
      .toBe("DOMAIN_MODEL_BLOCKS_TRUTHFUL_POOL");
    expect(data.recommendedDomainOption)
      .toBe("OPTION_D_HYBRID_MACRO_SELECTION_ROLES_PLUS_OPTIONAL_ACTION_FUNCTION_PROFILE");
  });

  it("keeps primary and secondary muscle relationships separate and invents no credits", () => {
    const biceps = data.muscleAudit.find((row) => row.muscle === "biceps");
    expect(biceps?.primaryIds).toEqual(["dumbbell-curl"]);
    expect(biceps?.secondaryIds).toEqual(expect.arrayContaining([
      "chest-supported-dumbbell-row",
      "lat-pulldown",
    ]));
    expect(matrix("direct-biceps").secondaryContributorIds).toEqual([]);
    expect(data.weeklyExposureContract).toContain("one exercise/set event singular");
    expect(JSON.stringify(data)).not.toMatch(/setEquivalence|set_equivalence|0\.5 set/i);
  });

  it("builds every archetype/environment row deterministically with hard equipment truth", () => {
    expect(new Set(data.matrix.map((row) => row.archetypeId)).size).toBe(44);
    expect(data.matrix).toHaveLength(440);
    expect(matrix("horizontal-pull", "anchored-bands").truthfulLegalIds).toEqual(["band-row"]);
    expect(matrix("horizontal-pull", "bands-no-anchor").truthfulLegalIds).toEqual([]);
    expect(matrix("horizontal-pull", "bodyweight").truthfulLegalIds).toEqual([]);
    expect(matrix("capacity-loaded-gait", "limited-walking-space").classification)
      .toBe("NOT_REQUIRED_IN_THIS_CONTEXT");
    expect(matrix("capacity-loaded-gait", "full-loaded-gait-space").truthfulLegalIds)
      .toEqual(["farmer-carry", "suitcase-carry"]);
    expect(buildWholeBodyExerciseKnowledgeAuditData().matrix).toEqual(data.matrix);
  });

  it("keeps pain, response, support, and stable-adaptive boundaries observable", () => {
    expect(data.fingerprints.painAwareCoverage)
      .toBe("950c6d4b0d9724e433ada8e9c88c4cedbbe45a6a47d36210eac84f5ef940d87b");
    expect(matrix("horizontal-pull").supportedIds).toEqual(expect.arrayContaining([
      "chest-supported-dumbbell-row",
      "machine-row",
      "seated-cable-row",
    ]));
    expect(matrix("horizontal-pull").supportedIds).toContain("one-arm-dumbbell-row");
    expect(exercise("one-arm-dumbbell-row").mechanics?.support.supportAmount).toBe("partial");
    expect(data.blockersBeforeSessionComposer).not.toContain(expect.stringMatching(/automatic/i));
    expect(data.nextDependency).toContain("OWNER_AUTHORIZATION");
  });

  it("keeps one row as one candidate despite multiple tags and proposes no composer behavior", () => {
    const carries = matrix("loaded-bracing").truthfulLegalIds;
    expect(carries.filter((id) => id === "farmer-carry")).toHaveLength(1);
    expect(carries.filter((id) => id === "suitcase-carry")).toHaveLength(1);
    expect(exercise("suitcase-carry").movementRoles).toHaveLength(3);
    expect(data.proposedConcepts.every((concept) => !REFERENCE_EXERCISES.some((row) => row.id === concept.id)))
      .toBe(true);
    expect(data.catalogCount).toBe(37);
  });

  it("freezes separate whole-body fingerprints and the owner proposal tranches", () => {
    expect(data.fingerprints).toEqual({
      catalogInventory: "834d3790fd8a6218fd1d2be00ffd947607099496426c2d89bf4736010a316d83",
      rolePurity: "a2915bd4c70a473faa7d3859d506b53160d3606ecaab0f9aaabf7cfac804e4fd",
      muscleTargetExposure: "09d99b9dcdc2c8c1db79543f8df7137cb3cc68d71e7a9f13386734fbec73daed",
      candidatePoolMatrix: "300f1a87923b35e8ec7c823de81ae1e54be94ffce8a730449bf82bd834761bc9",
      equipmentModeCoverage: "a71eaa38c43b15dbebf23906f7ba2b316913151f45e9612ab60b89c5467aca10",
      painAwareCoverage: "950c6d4b0d9724e433ada8e9c88c4cedbbe45a6a47d36210eac84f5ef940d87b",
      progressionContinuity: "310b9068b0dab7b091ffbe1203e719037cee013b9573f2a9e02c8e3676ae53f5",
      minimalExpansionProposal: "6af656e496037cc1e177c0d706d7c7e71a1413dbc93b09efb32507a564f6b392",
      knowledgeCompatibility: "4ae9b04a475f5243b387932d1e24da70cdaa044260156a4c17b9a346106009cf",
      combinedWholeBodyAudit: "56059dce8eea38552d34d732ba5025c0fb357dc2fd01564df34740db9642c98b",
    });
    expect(data.proposedConcepts.filter((row) => row.priority === "P0")).toHaveLength(8);
    expect(data.proposedConcepts.filter((row) => row.priority === "P1")).toHaveLength(9);
  });

  it("renders all required reports from structured data and preserves Knowledge boundaries", () => {
    const audit = renderWholeBodyExerciseKnowledgeAudit(data);
    const matrixReport = renderWholeBodyCandidatePoolMatrix(data);
    const proposal = renderWholeBodyMinimalCatalogExpansionProposal(data);
    expect(audit).toContain("TARGETED_DOMAIN_AND_CATALOG_FIXES_REQUIRED_BEFORE_COMPOSITION");
    expect(audit).toContain("No production row, role, muscle group, score");
    expect(matrixReport).toContain("Production legal");
    expect(matrixReport).toContain("EQUIPMENT_UNAVAILABLE");
    expect(proposal).toContain("NEW_SLOT_WHEN");
    expect(proposal).toContain("DO_NOT_ADD_WHEN");
    expect(proposal).toContain("WHY_CURRENT_CATALOG_CANNOT_ALREADY_SOLVE_THIS");
    expect(data.fingerprints.knowledgeCompatibility)
      .toBe("4ae9b04a475f5243b387932d1e24da70cdaa044260156a4c17b9a346106009cf");
  });

  it("regenerates the current reference report with contextual rather than legacy phase truth", () => {
    const report = readFileSync(join(
      __dirname,
      "../../../../docs/training-engine-v2/REFERENCE_EXERCISE_KNOWLEDGE_REVIEW.md",
    ), "utf8");
    expect(report).toContain("This report presents contextual phase annotations as current production truth");
    expect(report).toContain("phase_1:abstain");
    expect(report).not.toContain("phase_1:excellent, phase_2:good, phase_3:possible");
    expect(data.sourceConsistency.currentReportConsistency)
      .toBe("PASS_REGENERATED_FROM_CANONICAL_SOURCE");
    expect(data.sourceConsistency.staleFields).toEqual([]);
  });
});
