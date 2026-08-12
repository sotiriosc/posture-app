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
    expect(data.productionBehaviorChanged).toBe(true);
    expect(data.catalogCount).toBe(37);
    expect(data.uniqueCatalogCount).toBe(37);
    expect(data.productionRankingFingerprint).toBe(PRODUCTION_RANKING_FINGERPRINT);
    expect(data.comprehensiveBehaviorFingerprint).toBe(COMPREHENSIVE_BEHAVIOR_FINGERPRINT);
    expect(data.contextualPhaseFingerprint)
      .toBe("29266f305d501852e01b8b468f28544294d5af32bdef59836250960daf1b262b");
    expect(data.safetyResponseFingerprint)
      .toBe("539dba50cc8d0dda4dcaa28cfc9cc764d15049aba8bddace707bff5b98d2c562");
    expect(data.stableAdaptiveFingerprint)
      .toBe("58067eee7d9e34836e15150caf8be5de1ae4d896db43199f40583dd45020c72a");
  });

  it("records every resolved role-purity problem after applying the authorized correction", () => {
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
      .toEqual(expect.objectContaining({ futureCoverageDistortion: false, sectionGateIsSufficient: true }));
    expect(matrix("horizontal-push").productionLegalIds).not.toContain("cable-triceps-pressdown");
    expect(matrix("vertical-push").truthfulLegalIds).toEqual(["dumbbell-shoulder-press"]);
    expect(matrix("hip-dominant").truthfulLegalIds).toEqual([
      "dumbbell-romanian-deadlift",
      "cable-pull-through",
    ]);
    expect(exercise("dumbbell-curl").movementRoles).toEqual(["accessory"]);
    expect(exercise("lying-leg-curl").movementRoles).toEqual(["accessory"]);
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
      .toBe("SINGLE_CANDIDATE_DEPENDENCY");
    expect(matrix("hamstring-knee-flexion").truthfulLegalIds).toEqual(["lying-leg-curl"]);
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
      .toBe("244ad0e4c024dc9d39245a93a1ea90611e66effd731396c11db9bc931f5ee78e");
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
      catalogInventory: "ddaf455d18b6b6039afc24f72938b3e8123afa632533dff57ab19ba94ed2ae2d",
      rolePurity: "5cc82700144df493b8b0cc22044cf68a053214aa935c5b2e9fb01830dc6b4bb8",
      muscleTargetExposure: "2120876fef166a594b2bad0a087b6b98fd4994b7d5a9a0900fe82fe87066f09f",
      candidatePoolMatrix: "979903c769a1a36a1f0d4d431c860e57ad1b8c1cdae304a6c1b042e21e78e71d",
      equipmentModeCoverage: "b1f503e7d62d0d9f50729ff68659da565454bdd66fa1627ba3c0fbdecbb17ae0",
      painAwareCoverage: "244ad0e4c024dc9d39245a93a1ea90611e66effd731396c11db9bc931f5ee78e",
      progressionContinuity: "310b9068b0dab7b091ffbe1203e719037cee013b9573f2a9e02c8e3676ae53f5",
      minimalExpansionProposal: "696fae395bd6383729493d65ac0d4e656799b8797ecf75fdaa327ba33564c5d1",
      knowledgeCompatibility: "4ae9b04a475f5243b387932d1e24da70cdaa044260156a4c17b9a346106009cf",
      combinedWholeBodyAudit: "9f7578381b18c5afb381049a11d703a7c79de4851ac3994f33e67da3847978e7",
    });
    expect(data.proposedConcepts.filter((row) => row.priority === "P0")).toHaveLength(8);
    expect(data.proposedConcepts.filter((row) => row.priority === "P1")).toHaveLength(9);
  });

  it("renders all required reports from structured data and preserves Knowledge boundaries", () => {
    const audit = renderWholeBodyExerciseKnowledgeAudit(data);
    const matrixReport = renderWholeBodyCandidatePoolMatrix(data);
    const proposal = renderWholeBodyMinimalCatalogExpansionProposal(data);
    expect(audit).toContain("ROLE_MUSCLE_CONTRACT_IMPLEMENTED_P0_PROPOSALS_CURATED");
    expect(audit).toContain("canonical muscle");
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
