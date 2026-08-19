import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  PRE_PACKAGE_R_REFERENCE_EXERCISES as REFERENCE_EXERCISES,
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
  it("freezes all production baselines while auditing exactly one 45-row catalog", () => {
    expect(data.productionBehaviorChanged).toBe(true);
    expect(data.catalogCount).toBe(45);
    expect(data.uniqueCatalogCount).toBe(45);
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
    expect(matrix("direct-calves").truthfulLegalIds).toEqual(["standing-calf-raise"]);
    expect(matrix("direct-hip-abductors").truthfulLegalIds).toEqual(["loop-band-lateral-walk"]);
    expect(matrix("direct-hip-adductors").truthfulLegalIds).toEqual(["side-lying-hip-adduction"]);
    expect(matrix("direct-rotator-cuff").truthfulLegalIds).toEqual(["side-lying-dumbbell-external-rotation"]);
    expect(matrix("hamstring-knee-flexion").classification)
      .toBe("SUFFICIENT_AND_DISTINCT");
    expect(matrix("hamstring-knee-flexion").truthfulLegalIds).toEqual(["lying-leg-curl", "supine-hamstring-walkout"]);
    expect(matrix("prep-cuff")).toEqual(expect.objectContaining({
      truthfulLegalIds: ["side-lying-dumbbell-external-rotation"],
      classification: "SINGLE_CANDIDATE_DEPENDENCY",
    }));
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
      .toBe("0326b5b0e3a2e806617dab3838c740ec2ec3b70a3c4eaef562c0a184d4331e7d");
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
    expect(data.proposedConcepts.filter((concept) => concept.priority === "P0").every((concept) => REFERENCE_EXERCISES.some((row) => row.id === concept.id))).toBe(true);
    expect(data.proposedConcepts.filter((concept) => concept.priority === "P1").every((concept) => !REFERENCE_EXERCISES.some((row) => row.id === concept.id))).toBe(true);
    expect(data.catalogCount).toBe(45);
  });

  it("freezes separate whole-body fingerprints and the owner proposal tranches", () => {
    expect(data.fingerprints).toEqual({
      catalogInventory: "510372defce7b9893d4523fe5f763616bdba47b9700d863874b715150049e2d8",
      rolePurity: "64a83992f33f42489b6f0229de5052f4416f65f050998f4ec5ec907fc6e5f7fd",
      muscleTargetExposure: "64dbfe124198a6e6c6a4728c61fb1af5844c0ece946f0c01339719239557c422",
      candidatePoolMatrix: "29eb15f92f4f6d8fd7049255aed6430c99ed6c3780866daa8c38c044080349bf",
      equipmentModeCoverage: "af01c56f31a3a0d54ad063d92c34bb0a6d35e2bf7b827e40ddb3615bf86d5b15",
      painAwareCoverage: "0326b5b0e3a2e806617dab3838c740ec2ec3b70a3c4eaef562c0a184d4331e7d",
      progressionContinuity: "fd8c3f13a7c7ec4549ea8fb4bb9e628b8c4503af63323b953d3588b6816f22ad",
      minimalExpansionProposal: "3041dc5d491d5d41d314f6bcea033e259baec63382c70fff89e4b4c29fff4a6e",
      knowledgeCompatibility: "dfb8a57bb6fa5755c606590f69ec7ce6feb6c8d33077a9753e7c6c741dd9ee82",
      combinedWholeBodyAudit: "58ff39398893487e5a4474210fffb6df06395d7abf2d70efadef15e334e0b098",
    });
    expect(data.proposedConcepts.filter((row) => row.priority === "P0")).toHaveLength(8);
    expect(data.proposedConcepts.filter((row) => row.priority === "P1")).toHaveLength(9);
  });

  it("renders all required reports from structured data and preserves Knowledge boundaries", () => {
    const audit = renderWholeBodyExerciseKnowledgeAudit(data);
    const matrixReport = renderWholeBodyCandidatePoolMatrix(data);
    const proposal = renderWholeBodyMinimalCatalogExpansionProposal(data);
    expect(audit).toContain("P0_WHOLE_BODY_PRODUCTION_ADMITTED");
    expect(audit).toContain("canonical muscle");
    expect(matrixReport).toContain("Production legal");
    expect(matrixReport).toContain("EQUIPMENT_UNAVAILABLE");
    expect(proposal).toContain("NEW_SLOT_WHEN");
    expect(proposal).toContain("DO_NOT_ADD_WHEN");
    expect(proposal).toContain("WHY_CURRENT_CATALOG_CANNOT_ALREADY_SOLVE_THIS");
    expect(data.fingerprints.knowledgeCompatibility)
      .toBe("dfb8a57bb6fa5755c606590f69ec7ce6feb6c8d33077a9753e7c6c741dd9ee82");
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
