import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  PACKAGE_R_KNOWLEDGE_ENTRIES,
  PACKAGE_R_SELECTED_EXERCISE_IDS,
} from "../../../praxis-knowledge-core/src";
import {
  PRE_PACKAGE_S_HOME_COMFORT_PROFILES as HOME_COMFORT_PROFILES,
  HOME_COMFORT_SELECTION_POLICY,
  compareHomeComfortCandidates,
} from "../../src/candidate/homeComfort";
import { evaluateEquipmentRequirement } from "../../src/domain/equipment";
import {
  BANDS_WITHOUT_ANCHOR_EQUIPMENT,
  DUMBBELLS_NO_BENCH_EQUIPMENT,
  FULL_GYM_EQUIPMENT,
} from "../../src/data/goldenPersonas";
import { PRE_PACKAGE_S_REFERENCE_EXERCISES as REFERENCE_EXERCISES } from "../../src/data/referenceExercises";
import { EXERCISE_DOSE_MODES } from "../../src/prescription/dose";
import { generatedExerciseCoachingFallbackStatus } from "../../dev/generateExerciseCoachingFallbacks";
import {
  PACKAGE_R_CONTRACT,
  activationGuards,
  advancedHomeCohort,
  beginnerGymCohort,
  catalogInventory,
  cohortRegistry,
  controlledScenarios,
  holdoutManifest,
  knowledgePresentationCohort,
  metamorphicResults,
  mutationResults,
  packageRBehavioralConsequences,
  packageRFingerprints,
  packageRReadiness,
  packageRValidationSummary,
  painContextCohort,
  protectedProductSourceManifest,
  selectedPackageRows,
  selectedRowMatrix,
  stableAnchorCohort,
  stressResults,
  timeConstrainedCohort,
  unknownHomeCohort,
  fileSha256,
} from "../packageRKnowledge/releaseEvidence";

const packageRoot = process.cwd().endsWith("packages/training-engine-v2")
  ? process.cwd()
  : resolve(process.cwd(), "packages/training-engine-v2");

describe("Package R home-first mixed production release", () => {
  it("admits the exact atomic eight-row package into one 53-row catalog", () => {
    expect(PACKAGE_R_CONTRACT.packageId).toBe("PACKAGE_R_HOME_FIRST_MIXED_RELEASE_V1");
    expect(PACKAGE_R_SELECTED_EXERCISE_IDS).toHaveLength(8);
    expect(selectedPackageRows).toHaveLength(8);
    expect(catalogInventory).toMatchObject({
      beforeRowCount: 45,
      afterRowCount: 53,
      uniqueIdCount: 53,
      duplicateIdCount: 0,
      selectedRowCount: 8,
      unselectedNewRowCount: 0,
    });
    expect(REFERENCE_EXERCISES.slice(45).map((row) => row.id)).toEqual(PACKAGE_R_SELECTED_EXERCISE_IDS);
    expect(packageRValidationSummary.catalogErrorCount).toBe(0);
  });

  it("keeps selected identities in truthful pools", () => {
    expect(packageRBehavioralConsequences.falsePoolMemberships).toEqual({
      reverseFlyHorizontalPull: false,
      bandCurlPull: false,
      machineLegExtensionSquat: false,
      birdDogBackPainDefault: false,
    });
    expect(selectedPackageRows.find((row) => row.id === "dumbbell-floor-press")?.movementRoles).toEqual(["horizontal_push"]);
    expect(selectedPackageRows.find((row) => row.id === "machine-shoulder-press")?.movementRoles).toEqual(["vertical_push"]);
    expect(selectedPackageRows.find((row) => row.id === "machine-leg-extension")?.family).toBe("quad_accessory");
    expect(selectedPackageRows.find((row) => row.id === "band-biceps-curl")?.actionFunctions.map((entry) => entry.action)).toEqual(["elbow_flexion"]);
  });

  it("requires exact equipment truth without bench, anchor, or gym-label inference", () => {
    const floorPress = selectedPackageRows.find((row) => row.id === "dumbbell-floor-press")!;
    expect(floorPress.equipmentRequirements.every((requirement) =>
      evaluateEquipmentRequirement(DUMBBELLS_NO_BENCH_EQUIPMENT, requirement).satisfied)).toBe(true);
    const noFloor = {
      ...DUMBBELLS_NO_BENCH_EQUIPMENT,
      bodyweight: { ...DUMBBELLS_NO_BENCH_EQUIPMENT.bodyweight, floorSpace: false },
    };
    expect(floorPress.equipmentRequirements.some((requirement) =>
      !evaluateEquipmentRequirement(noFloor, requirement).satisfied)).toBe(true);

    const bandCurl = selectedPackageRows.find((row) => row.id === "band-biceps-curl")!;
    const selfAnchorReady = {
      ...BANDS_WITHOUT_ANCHOR_EQUIPMENT,
      trainingSpace: { ...BANDS_WITHOUT_ANCHOR_EQUIPMENT.trainingSpace, stableLoadedStandingSpace: true },
    };
    expect(bandCurl.equipmentRequirements.every((requirement) =>
      evaluateEquipmentRequirement(selfAnchorReady, requirement).satisfied)).toBe(true);

    const gymLabelOnly = {
      ...FULL_GYM_EQUIPMENT,
      machines: { availableMachineIds: [] },
    };
    const packageRFullGym = {
      ...FULL_GYM_EQUIPMENT,
      machines: {
        availableMachineIds: [...FULL_GYM_EQUIPMENT.machines.availableMachineIds, "leg_extension" as const],
      },
    };
    for (const id of ["machine-shoulder-press", "machine-leg-extension"]) {
      const row = selectedPackageRows.find((candidate) => candidate.id === id)!;
      expect(row.equipmentRequirements.every((requirement) =>
        evaluateEquipmentRequirement(packageRFullGym, requirement).satisfied)).toBe(true);
      expect(row.equipmentRequirements.some((requirement) =>
        !evaluateEquipmentRequirement(gymLabelOnly, requirement).satisfied)).toBe(true);
    }
  });

  it("uses complete Knowledge and committed generated compact fallbacks", () => {
    expect(PACKAGE_R_KNOWLEDGE_ENTRIES).toHaveLength(8);
    expect(packageRValidationSummary.knowledgeFindings).toEqual([]);
    expect(generatedExerciseCoachingFallbackStatus()).toMatchObject({ exists: true, stale: false });
    for (const matrix of selectedRowMatrix) {
      expect(matrix.generatedFallback).toBeDefined();
      expect(matrix.generatedFallback?.summary).toBe(selectedPackageRows.find((row) => row.id === matrix.id)?.summary);
      expect(matrix.generatedFallback?.coachingFocus).toEqual(selectedPackageRows.find((row) => row.id === matrix.id)?.coachingFocus);
    }
  });

  it("curates decision intelligence without inventing phase or mixed-dose policy", () => {
    for (const matrix of selectedRowMatrix) {
      expect(matrix.phaseDisposition).toBe("explicit_abstention");
      expect(matrix.primaryDoseMode).toBe("repetition_sets");
      expect(matrix.legalDoseModes).toEqual(["repetition_sets"]);
      expect(matrix.progressionAxes.length).toBeGreaterThan(0);
      expect(matrix.transitionRelationships.every((entry) => entry.classification === "context_dependent")).toBe(true);
      expect(matrix.homeComfortProfile?.status).toBe("accepted");
    }
  });

  it("covers all 53 profiles and applies comfort only after exact familiarity", () => {
    expect(Object.keys(HOME_COMFORT_PROFILES)).toHaveLength(53);
    expect(packageRValidationSummary.homeComfortFindings).toEqual([]);
    expect(HOME_COMFORT_SELECTION_POLICY.weightedScore).toBeNull();
    expect(HOME_COMFORT_SELECTION_POLICY.noveltyQuota).toBe(0);
    expect(HOME_COMFORT_SELECTION_POLICY.varietyQuota).toBe(0);

    const unknown = compareHomeComfortCandidates("dumbbell-floor-press", "dumbbell-bench-press", {
      environment: "home", familiarityByExerciseId: {}, productiveContinuityIds: [],
    });
    expect(unknown.trace.winnerExerciseId).toBe("dumbbell-floor-press");
    const advanced = compareHomeComfortCandidates("dumbbell-floor-press", "dumbbell-bench-press", {
      environment: "home", familiarityByExerciseId: { "dumbbell-bench-press": "exact_productive" }, productiveContinuityIds: ["dumbbell-bench-press"],
    });
    expect(advanced.trace.winnerExerciseId).toBe("dumbbell-bench-press");
    expect(advanced.trace.stableAnchorPreserved).toBe(true);
  });

  it("freezes controlled scenarios, fixed-shell cohorts, and the locked holdout", () => {
    expect(controlledScenarios.length).toBeGreaterThanOrEqual(420);
    expect(unknownHomeCohort).toHaveLength(80);
    expect(advancedHomeCohort).toHaveLength(60);
    expect(beginnerGymCohort).toHaveLength(60);
    expect(timeConstrainedCohort).toHaveLength(60);
    expect(painContextCohort).toHaveLength(60);
    expect(stableAnchorCohort).toHaveLength(40);
    expect(knowledgePresentationCohort).toHaveLength(40);
    expect(Object.values(cohortRegistry).flat()).toHaveLength(400);
    expect(holdoutManifest.length).toBeGreaterThanOrEqual(700);
    expect(new Set(holdoutManifest.map((entry) => entry.exerciseId)).size).toBe(53);
    expect(new Set(holdoutManifest.map((entry) => entry.doseMode))).toEqual(new Set(EXERCISE_DOSE_MODES));
    expect(new Set(holdoutManifest.map((entry) => entry.section)).size).toBe(5);
    expect(new Set(holdoutManifest.map((entry) => entry.knowledgeCategory)).size).toBe(6);
  });

  it("rejects semantic mutations, passes metamorphic checks, and records full stress", () => {
    expect(mutationResults.length).toBeGreaterThanOrEqual(50);
    expect(mutationResults.every((entry) => entry.semanticStructureChanged && entry.rejected && entry.acceptedDownstreamRescueCount === 0)).toBe(true);
    expect(metamorphicResults.invariants.every((entry) => entry.passed)).toBe(true);
    expect(metamorphicResults.materialResponses.every((entry) => entry.passed && entry.baseline !== entry.changed)).toBe(true);
    expect(stressResults).toMatchObject({
      catalogValidations: 10_000, knowledgeFactValidations: 10_000,
      presentationMapValidations: 10_000, realizationOverrideValidations: 10_000,
      fallbackGenerations: 10_000, homeComfortEvaluations: 10_000,
      candidateEvaluations: 8_000, composerExecutions: 5_000,
      prescriptionCompilations: 5_000, weekValidations: 3_000,
      productShadowInvarianceComparisons: 1_000, staleFallbackAttacks: 1_000,
      noRescueMutations: 1_000, failureCount: 0,
    });
  });

  it("keeps Knowledge out of every production decision and Product runtime", () => {
    expect(Object.values(activationGuards).every((count) => count === 0 || [8, 53].includes(count))).toBe(true);
    const productionPaths = [
      "src/candidate/ranking/rankCandidates.ts",
      "src/sessionComposer/composeSessionSkeleton.ts",
      "src/weekPlanning/planner.ts",
      "src/prescription/compiler/compilePrescriptionAssignment.ts",
    ];
    for (const relativePath of productionPaths) {
      const source = readFileSync(resolve(packageRoot, relativePath), "utf8");
      expect(source).not.toMatch(/from\s+["'][^"']*(?:praxis-knowledge-core|@praxis\/knowledge-core)/);
    }
    for (const [path, sha] of Object.entries(protectedProductSourceManifest)) {
      expect(fileSha256(path), path).toBe(sha);
    }
  });

  it("earns the top Pre-G2 classification while keeping later stages open", () => {
    expect(packageRReadiness.classification).toBe("HOME_FIRST_MIXED_EXERCISE_CATALOG_EXPANSION_AND_KNOWLEDGE_CORE_V1_READY_FOR_CURRENT_CATALOG_KNOWLEDGE_COMPLETENESS_AUTHORIZATION");
    expect(packageRReadiness).toMatchObject({ preG2K: "open_hard_blocker", preG3: "open", g: "open", h: "open", finalState: "INCOMPLETE_FUTURE_WORK_REMAINS" });
    expect(packageRReadiness.nextDependency).toBe("CURRENT_45_EXERCISE_KNOWLEDGE_CORE_COMPLETENESS_V1_AUTHORIZATION");
    expect(Object.values(packageRFingerprints).every((value) => /^[a-f0-9]{64}$/.test(value))).toBe(true);
  });
});
