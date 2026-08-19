import { describe, expect, it } from "vitest";
import {
  EXERCISE_DOSE_MODES,
  PRE_PACKAGE_R_REFERENCE_EXERCISES as REFERENCE_EXERCISES,
  compileSessionPrescription,
  validateProductionExercisePrescriptionPlan,
} from "../../src";
import { buildCatalogCompilerInput } from "../helpers/productionPrescriptionCompiler";

describe("production Prescription Compiler full catalog", () => {
  it("compiles the primary legal mode for all 45 canonical identities", () => {
    const results = REFERENCE_EXERCISES.map((exercise) => ({
      exercise,
      result: compileSessionPrescription(buildCatalogCompilerInput(exercise)),
    }));
    expect(results).toHaveLength(45);
    expect(results.every(({ result }) => result.assignmentResults[0].status === "compiled")).toBe(true);
    expect(results.every(({ exercise, result }) => {
      const plan = result.plans[0];
      return plan &&
        plan.exerciseId === exercise.id &&
        plan.sourceExposureEvent.sessionAssignmentId === `catalog:${exercise.id}:handoff` &&
        plan.doseBlocks.every((block) => block.executionStandard.exerciseMechanicsIntent.length > 0) &&
        validateProductionExercisePrescriptionPlan(plan, exercise.prescriptionKnowledge).length === 0;
    })).toBe(true);
  });

  it("compiles every reviewed legal alternate and rejects unsupported modes explicitly", () => {
    const alternates = REFERENCE_EXERCISES.flatMap((exercise) =>
      exercise.prescriptionKnowledge.legalAlternateDoseModes.map((mode) => ({
        exercise,
        mode,
        result: compileSessionPrescription(buildCatalogCompilerInput(exercise, { requestedMode: mode })),
      }))
    );
    expect(alternates.length).toBeGreaterThan(0);
    expect(alternates.every(({ result }) => result.assignmentResults[0].status === "compiled")).toBe(true);

    const exercise = REFERENCE_EXERCISES.find((entry) =>
      [entry.prescriptionKnowledge.primaryDoseMode, ...entry.prescriptionKnowledge.legalAlternateDoseModes].length < EXERCISE_DOSE_MODES.length
    )!;
    const legal = new Set([exercise.prescriptionKnowledge.primaryDoseMode, ...exercise.prescriptionKnowledge.legalAlternateDoseModes]);
    const unsupported = EXERCISE_DOSE_MODES.find((mode) => !legal.has(mode))!;
    const result = compileSessionPrescription(buildCatalogCompilerInput(exercise, { requestedMode: unsupported }));
    expect(result.assignmentResults[0].status).toBe("unsupported_dose_mode");
  });

  it("uses all seven production dose modes without mixed-mode source events", () => {
    const modes = new Set(REFERENCE_EXERCISES.flatMap((exercise) => {
      const legal = [exercise.prescriptionKnowledge.primaryDoseMode, ...exercise.prescriptionKnowledge.legalAlternateDoseModes];
      return legal.map((mode) => compileSessionPrescription(
        buildCatalogCompilerInput(exercise, { requestedMode: mode }),
      )).flatMap((result) => result.plans.flatMap((plan) => plan.doseBlocks.map((block) => block.dose.mode)));
    }));
    expect(modes).toEqual(new Set(EXERCISE_DOSE_MODES));
  });
});
