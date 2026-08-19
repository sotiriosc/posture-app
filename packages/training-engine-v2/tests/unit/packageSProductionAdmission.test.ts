import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  PACKAGE_S_KNOWLEDGE_ENTRIES,
  PACKAGE_S_SELECTED_EXERCISE_IDS,
  PRODUCTION_64_KNOWLEDGE_ENTRIES,
  projectCompactFallbacks,
} from "../../../praxis-knowledge-core/src";
import {
  STANDARD_GYM_COMFORT_POLICY,
  compareStandardGymComfortCandidates,
} from "../../src/candidate/standardGymComfort";
import { HOME_COMFORT_PROFILES } from "../../src/candidate/homeComfort";
import { evaluateEquipmentRequirement } from "../../src/domain/equipment";
import {
  resolvePressSupportAngleRealization,
} from "../../src/domain/pressAngleRealization";
import { resolvePullUpAssistanceRealization } from "../../src/domain/assistanceRealization";
import { EXERCISE_ACTION_FUNCTIONS } from "../../src/domain/exercise";
import { REFERENCE_EXERCISES } from "../../src/data/referenceExercises";
import { EXERCISE_DOSE_MODES } from "../../src/prescription/dose";
import { generatedExerciseCoachingFallbackStatus } from "../../dev/generateExerciseCoachingFallbacks";
import {
  PACKAGE_S_CONTRACT,
  activationGuards,
  advancedGymCohort,
  beginnerGymCohort,
  candidateComposerConsequences,
  catalogInventory,
  cohortRegistry,
  controlledScenarios,
  fileSha256,
  gapAudit,
  gymLabelOnlyEquipment,
  holdoutManifest,
  inclineCohort,
  knowledgePresentationCohort,
  machineCapabilityCohort,
  metamorphicResults,
  mutationResults,
  packageSFullGymEquipment,
  packageSFingerprints,
  packageSReadiness,
  packageSValidationSummary,
  painContextCohort,
  protectedProductSourceManifest,
  pullUpCohort,
  runPackageSDeterministicStress,
  selectedPackageRows,
  selectedRowMatrix,
  stableAnchorCohort,
  stressResults,
  timeConstrainedCohort,
  weekPrescriptionConsequences,
} from "../packageS/releaseEvidence";

const packageRoot = process.cwd().endsWith("packages/training-engine-v2")
  ? process.cwd()
  : resolve(process.cwd(), "packages/training-engine-v2");

describe("Package S standard commercial-gym production admission", () => {
  it("admits exactly the atomic 11-row package into one 64-ID catalog", () => {
    expect(PACKAGE_S_CONTRACT.packageId).toBe("PACKAGE_S_STANDARD_COMMERCIAL_GYM_FOUNDATIONS_V1");
    expect(PACKAGE_S_SELECTED_EXERCISE_IDS).toHaveLength(11);
    expect(selectedPackageRows).toHaveLength(11);
    expect(REFERENCE_EXERCISES.slice(53, 64).map((row) => row.id)).toEqual(PACKAGE_S_SELECTED_EXERCISE_IDS);
    expect(catalogInventory).toMatchObject({ beforeRowCount: 53, afterRowCount: 64, uniqueIdCount: 64, duplicateIdCount: 0, selectedRowCount: 11, unselectedNewRowCount: 0 });
    expect(packageSValidationSummary.catalogErrorCount).toBe(0);
  });

  it("keeps the selected identities in truthful roles and action functions", () => {
    const row = (id: string) => selectedPackageRows.find((candidate) => candidate.id === id)!;
    expect(row("pull-up").movementRoles).toEqual(["vertical_pull"]);
    expect(row("hack-squat").movementRoles).toEqual(["squat", "knee_dominant"]);
    expect(row("machine-chest-fly").movementRoles).toEqual(["accessory"]);
    expect(row("machine-chest-fly").actionFunctions.map((entry) => entry.action)).toEqual(["shoulder_horizontal_adduction"]);
    expect(row("straight-arm-cable-pulldown").movementRoles).toEqual(["accessory"]);
    expect(row("straight-arm-cable-pulldown").actionFunctions.map((entry) => entry.action)).toEqual(["shoulder_extension"]);
    expect(EXERCISE_ACTION_FUNCTIONS).toContain("shoulder_extension");
    for (const matrix of selectedRowMatrix) {
      expect(matrix.knowledgeEntry?.relatedMovementRoleIds).toEqual(matrix.movementRoles);
      expect(matrix.knowledgeEntry?.relatedActionFunctionIds).toEqual(matrix.actionFunctions);
      expect(matrix.knowledgeEntry?.relatedStressTags).toEqual(matrix.stressAnnotations.map((entry) => entry.tag));
    }
    expect(candidateComposerConsequences).toMatchObject({ wrongMacroPoolCount: 0, fakeVerticalPullCount: 0, fakeSquatCount: 0 });
  });

  it("requires exact machine and cable capabilities instead of a gym label", () => {
    for (const row of selectedPackageRows) {
      expect(row.equipmentRequirements.every((requirement) =>
        evaluateEquipmentRequirement(packageSFullGymEquipment, requirement).satisfied), row.id).toBe(true);
      if (row.id !== "pull-up" && !row.equipmentRequirements.some((requirement) => requirement.allOf?.includes("cable_stack"))) {
        expect(row.equipmentRequirements.some((requirement) =>
          !evaluateEquipmentRequirement(gymLabelOnlyEquipment, requirement).satisfied), row.id).toBe(true);
      }
    }
    for (const id of ["cable-lateral-raise", "overhead-cable-triceps-extension", "straight-arm-cable-pulldown"]) {
      const row = selectedPackageRows.find((candidate) => candidate.id === id)!;
      const noCable = { ...packageSFullGymEquipment, cables: { available: false, adjustableHeight: false, availableHeights: [] as const } };
      expect(row.equipmentRequirements.some((requirement) => !evaluateEquipmentRequirement(noCable, requirement).satisfied)).toBe(true);
    }
  });

  it("represents incline presses as typed realizations of existing identities", () => {
    const dumbbell = resolvePressSupportAngleRealization({ exerciseId: "dumbbell-bench-press", explicitRealizationId: "adjustable-bench-incline", currentProductiveRealizationId: null, equipment: packageSFullGymEquipment });
    const machine = resolvePressSupportAngleRealization({ exerciseId: "machine-chest-press", explicitRealizationId: "fixed-machine-incline", currentProductiveRealizationId: null, equipment: packageSFullGymEquipment });
    expect(dumbbell.selected).toMatchObject({ exerciseId: "dumbbell-bench-press", angleClass: "incline" });
    expect(machine.selected).toMatchObject({ exerciseId: "machine-chest-press", angleClass: "fixed_machine_incline" });
    expect(dumbbell.automaticRotationApplied).toBe(false);
    expect(machine.upperChestGuaranteeApplied).toBe(false);
    expect(REFERENCE_EXERCISES.some((row) => row.id.includes("incline-dumbbell"))).toBe(false);
    expect(REFERENCE_EXERCISES.some((row) => row.id.includes("incline-machine"))).toBe(false);
    const machinePress = REFERENCE_EXERCISES.find((row) => row.id === "machine-chest-press")!;
    expect(machinePress.equipmentRequirements[0]?.oneOfMachineIds).toEqual(["chest_press", "incline_chest_press"]);
  });

  it("keeps one Pull-Up identity with unassisted and machine-assisted realizations", () => {
    const unassisted = resolvePullUpAssistanceRealization({ requestedRealizationId: "bodyweight-unassisted", exactMachineAssistanceSetting: null, equipment: packageSFullGymEquipment });
    const assisted = resolvePullUpAssistanceRealization({ requestedRealizationId: "machine-assisted", exactMachineAssistanceSetting: 35, equipment: packageSFullGymEquipment });
    expect(unassisted).toMatchObject({ exerciseId: "pull-up", sourceEventCount: 1, assistanceTreatedAsExternalLoad: false, automaticProgressionApplied: false });
    expect(assisted).toMatchObject({ exerciseId: "pull-up", sourceEventCount: 1, assistanceTreatedAsExternalLoad: false, automaticProgressionApplied: false, assistanceMagnitude: { kind: "machine_setting", setting: 35 } });
    expect(selectedPackageRows.filter((row) => row.id === "pull-up")).toHaveLength(1);
  });

  it("uses standard-gym comfort only as a late score-neutral preference", () => {
    expect(STANDARD_GYM_COMFORT_POLICY).toMatchObject({ weightedScore: null, noveltyQuota: 0, varietyQuota: 0, machineMandatory: false, machineSaferClaim: false });
    const unknown = compareStandardGymComfortCandidates("hack-squat", "goblet-squat", { environment: "commercial_gym", familiarityByExerciseId: {}, productiveContinuityIds: [], availableMachineIds: ["hack_squat"] });
    expect(unknown.trace).toMatchObject({ winnerExerciseId: "hack-squat", exactMachineCapabilityConfirmed: true, weightedScoreApplied: false, machineSafetyClaimApplied: false });
    const stable = compareStandardGymComfortCandidates("hack-squat", "goblet-squat", { environment: "commercial_gym", familiarityByExerciseId: {}, productiveContinuityIds: ["goblet-squat"], availableMachineIds: ["hack_squat"] });
    expect(stable.trace).toMatchObject({ winnerExerciseId: "goblet-squat", productiveAnchorPreserved: true });
    const noMachine = compareStandardGymComfortCandidates("hack-squat", "goblet-squat", { environment: "commercial_gym", familiarityByExerciseId: {}, productiveContinuityIds: [], availableMachineIds: [] });
    expect(noMachine.comparison).toBe(0);
  });

  it("has complete Knowledge and generated compact fallbacks for all 64 rows", () => {
    expect(PACKAGE_S_KNOWLEDGE_ENTRIES).toHaveLength(11);
    expect(PRODUCTION_64_KNOWLEDGE_ENTRIES).toHaveLength(64);
    expect(packageSValidationSummary.knowledgeFindings).toEqual([]);
    expect(Object.keys(HOME_COMFORT_PROFILES)).toHaveLength(69);
    expect(packageSValidationSummary.homeComfortFindings).toEqual([]);
    expect(generatedExerciseCoachingFallbackStatus()).toMatchObject({ exists: true, stale: false });
    expect(projectCompactFallbacks(PRODUCTION_64_KNOWLEDGE_ENTRIES)).toHaveLength(64);
    for (const matrix of selectedRowMatrix) {
      expect(matrix.knowledgeEntry).toBeDefined();
      expect(matrix.generatedFallback?.summary).toBe(selectedPackageRows.find((row) => row.id === matrix.id)?.summary);
      expect(matrix.generatedFallback?.coachingFocus).toEqual(selectedPackageRows.find((row) => row.id === matrix.id)?.coachingFocus);
      expect(matrix.primaryDoseMode).toBe("repetition_sets");
    }
  });

  it("freezes controlled scenarios, all fixed cohorts, and the locked holdout", () => {
    expect(controlledScenarios.length).toBeGreaterThanOrEqual(520);
    expect(beginnerGymCohort).toHaveLength(100);
    expect(advancedGymCohort).toHaveLength(80);
    expect(inclineCohort).toHaveLength(80);
    expect(pullUpCohort).toHaveLength(80);
    expect(machineCapabilityCohort).toHaveLength(80);
    expect(timeConstrainedCohort).toHaveLength(60);
    expect(painContextCohort).toHaveLength(60);
    expect(stableAnchorCohort).toHaveLength(60);
    expect(knowledgePresentationCohort).toHaveLength(60);
    expect(Object.values(cohortRegistry).flat()).toHaveLength(660);
    expect(holdoutManifest.length).toBeGreaterThanOrEqual(850);
    expect(new Set(holdoutManifest.map((entry) => entry.exerciseId)).size).toBe(64);
    expect(new Set(holdoutManifest.map((entry) => entry.doseMode))).toEqual(new Set(EXERCISE_DOSE_MODES));
    expect(new Set(holdoutManifest.map((entry) => entry.section)).size).toBe(5);
  });

  it("rejects every mutation and passes every metamorphic relation", () => {
    expect(mutationResults.length).toBeGreaterThanOrEqual(50);
    expect(mutationResults.every((entry) => entry.semanticStructureChanged && entry.rejected && entry.acceptedDownstreamRescueCount === 0)).toBe(true);
    expect(metamorphicResults.invariants).toHaveLength(11);
    expect(metamorphicResults.materialResponses).toHaveLength(10);
    expect([...metamorphicResults.invariants, ...metamorphicResults.materialResponses].every((entry) => entry.passed)).toBe(true);
  });

  it("runs deterministic high-volume catalog, capability, realization, Knowledge, fallback, and Candidate checks", () => {
    expect(stressResults).toMatchObject({ catalogValidations: 15_000, machineCapabilityValidations: 15_000, pressAngleRealizations: 10_000, assistanceRealizations: 10_000, knowledgeFactValidations: 10_000, fallbackGenerations: 10_000, candidateEvaluations: 10_000, composerExecutions: 7_000, prescriptionCompilations: 5_000, weekValidations: 4_000, beginnerGymCases: 3_000, advancedGymCases: 3_000, inclineComparisons: 3_000, pullUpComparisons: 3_000, productShadowInvarianceComparisons: 1_000, staleFallbackAttacks: 1_000, noRescueMutations: 1_000, failureCount: 0 });
    expect(runPackageSDeterministicStress()).toMatchObject({ executions: 80_000, failures: 0 });
  });

  it("preserves Product, Product Shadow, visibility, delivery, and activation", () => {
    expect(Object.values(activationGuards).every((count) => [0, 9, 11, 64].includes(count))).toBe(true);
    expect(weekPrescriptionConsequences).toMatchObject({ selectedRowsWithRepetitionSets: 11, catalogCreatedObjectives: 0, angleCreatedObjectives: 0, automaticProgressionCount: 0 });
    for (const [path, sha] of Object.entries(protectedProductSourceManifest)) expect(fileSha256(path), path).toBe(sha);
    const productionPaths = ["src/candidate/ranking/rankCandidates.ts", "src/sessionComposer/composeSessionSkeleton.ts", "src/weekPlanning/planner.ts", "src/prescription/compiler/compilePrescriptionAssignment.ts"];
    for (const relativePath of productionPaths) {
      const source = readFileSync(resolve(packageRoot, relativePath), "utf8");
      expect(source).not.toMatch(/from\s+["'][^"']*(?:praxis-knowledge-core|@praxis\/knowledge-core)/);
    }
  });

  it("leaves no owner-delivery blocker in the read-only deferred gap audit", () => {
    expect(gapAudit.every((entry) => !entry.admitted)).toBe(true);
    expect(gapAudit.filter((entry) => entry.requiredBeforeOwnerDelivery)).toHaveLength(0);
  });

  it("earns the exact Pre-G2L classification while leaving later work open", () => {
    expect(packageSReadiness.classification).toBe("STANDARD_COMMERCIAL_GYM_FOUNDATIONS_AND_INCLINE_PRESS_REALIZATION_V1_READY_FOR_SESSION_PRACTICE_OPTIONS_V2_BRIDGE_AUTHORIZATION");
    expect(packageSReadiness).toMatchObject({ preG3: "open_exact_next_dependency", g: "open", h: "open", finalState: "INCOMPLETE_FUTURE_WORK_REMAINS" });
    expect(packageSReadiness.nextDependency).toBe("SESSION_PRACTICE_OPTIONS_FULL_LIGHTER_RECOVERY_V2_BRIDGE_AUTHORIZATION");
    expect(Object.values(packageSFingerprints).every((value) => /^[a-f0-9]{64}$/.test(value))).toBe(true);
  });
});
