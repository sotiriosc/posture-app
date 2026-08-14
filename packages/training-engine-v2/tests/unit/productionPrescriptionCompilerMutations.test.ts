import { describe, expect, it } from "vitest";
import {
  PRESCRIPTION_POLICY_V1,
  REFERENCE_EXERCISES,
  buildSourceExposureEventId,
  compileSessionPrescription,
  validatePerformanceBlockLinkage,
  validatePrescriptionSessionCompilation,
  validateProductionExercisePrescriptionPlan,
  type ExercisePerformanceBlockLinkage,
  type PrescriptionSessionCompilationResult,
  type ProductionExercisePrescriptionPlan,
} from "../../src";
import { buildCatalogCompilerInput } from "../helpers/productionPrescriptionCompiler";
import { PRODUCTION_PRESCRIPTION_COMPILER_MUTATIONS } from "../helpers/productionPrescriptionCompilerReport";

const exercise = REFERENCE_EXERCISES.find((entry) => entry.id === "machine-chest-press")!;

describe("production Prescription Compiler semantic mutations", () => {
  it("enumerates every required semantic mutation", () => {
    expect(PRODUCTION_PRESCRIPTION_COMPILER_MUTATIONS).toHaveLength(39);
    expect(new Set(PRODUCTION_PRESCRIPTION_COMPILER_MUTATIONS).size).toBe(39);
  });

  it("rejects an unsupported future Compiler contract version", () => {
    const compiled = compileSessionPrescription(buildCatalogCompilerInput(exercise));
    const unsupported = {
      ...compiled.compilerContract,
      contractVersion: "2.0.0" as "1.0.0",
    };
    const mutated: PrescriptionSessionCompilationResult = {
      ...compiled,
      compilerContract: unsupported,
      assignmentResults: compiled.assignmentResults.map((entry) => ({
        ...entry,
        compilerContract: unsupported,
      })),
      plans: compiled.plans.map((plan) => ({
        ...plan,
        compilerContract: unsupported,
      })),
    };
    expect(validatePrescriptionSessionCompilation(mutated).map((entry) => entry.code)).toContain(
      "UNSUPPORTED_PRESCRIPTION_COMPILER_CONTRACT",
    );
    expect(validateProductionExercisePrescriptionPlan(
      mutated.plans[0],
      exercise.prescriptionKnowledge,
    ).map((entry) => entry.code)).toContain("UNSUPPORTED_PRESCRIPTION_COMPILER_CONTRACT");
  });

  it("rejects malformed block, rest, duration, and compatibility structure", () => {
    const compiled = compileSessionPrescription(buildCatalogCompilerInput(exercise));
    const plan = compiled.plans[0];
    const block = plan.doseBlocks[0];
    const second = {
      ...block,
      blockId: "mutated-second-block",
      purpose: "preparatory_acclimation" as const,
      dose: {
        mode: "timed_hold" as const,
        sets: { kind: "exact" as const, value: 1, unit: "count" as const },
        duration: { kind: "exact" as const, value: 10, unit: "seconds" as const },
      },
      contributionClassification: "developmental_credit_candidate" as const,
      order: { index: 1, dependsOnBlockIds: [block.blockId] },
    };
    const mutated: ProductionExercisePrescriptionPlan = {
      ...plan,
      doseBlocks: [
        { ...block, order: { index: 0, dependsOnBlockIds: ["mutated-second-block"] } },
        second,
        { ...second, order: { index: 2, dependsOnBlockIds: [block.blockId] } },
      ],
      restInstructions: [{
        restInstructionId: "duplicated-rest",
        placement: "after_block",
        target: { kind: "exact", value: 60, unit: "seconds" },
        appliesAfterBlockId: second.blockId,
        provenance: { source: "synthetic_contract_fixture", sourceRef: "mutation:rest" },
      }, {
        restInstructionId: "duplicated-rest",
        placement: "inter_exercise_transition" as never,
        target: { kind: "exact", value: 60, unit: "seconds" },
        appliesAfterBlockId: second.blockId,
        provenance: { source: "synthetic_contract_fixture", sourceRef: "mutation:rest-duplicate" },
      }],
      compatibilityProjection: {
        ...plan.compatibilityProjection,
        projectedDose: block.dose,
      },
      durationInterval: {
        ...plan.durationInterval,
        knownUpperBoundSeconds: 120,
        unknownComponents: ["repetition_tempo"],
      },
    };
    const codes = validateProductionExercisePrescriptionPlan(
      mutated,
      exercise.prescriptionKnowledge,
    ).map((entry) => entry.code);
    expect(codes).toEqual(expect.arrayContaining([
      "DUPLICATE_PRESCRIPTION_BLOCK_ID",
      "ILLEGAL_MIXED_DOSE_MODES",
      "PREPARATORY_BLOCK_MISCREDITED",
      "CYCLIC_BLOCK_DEPENDENCY",
      "DUPLICATE_REST_INSTRUCTION",
      "INVALID_PRESCRIPTION_REST_PLACEMENT",
      "FAKE_DURATION_BOUND_WITH_UNKNOWN_COMPONENT",
      "MULTI_BLOCK_PLAN_FLATTENED",
    ]));
  });

  it("rejects policy-created/removed identity, silent substitution, and unjustified exact load", () => {
    const compiled = compileSessionPrescription(buildCatalogCompilerInput(exercise));
    const entry = compiled.assignmentResults[0];
    const plan = entry.plan!;
    const exactLoadPlan: ProductionExercisePrescriptionPlan = {
      ...plan,
      doseBlocks: plan.doseBlocks.map((block) => ({
        ...block,
        dose: {
          ...block.dose,
          load: {
            kind: "external_load" as const,
            target: { kind: "exact" as const, value: 20, unit: "kg" as const },
            application: "single_implement" as const,
          },
        },
      })),
      sourceExposureEvent: {
        ...plan.sourceExposureEvent,
        currentPlannedExerciseId: "goblet-squat",
      },
    };
    const createdPlan = {
      ...plan,
      prescriptionId: "policy-created-prescription",
      sourceExposureEvent: {
        ...plan.sourceExposureEvent,
        sourceExposureEventId: "policy-created-event",
        sessionAssignmentId: "policy-created-assignment",
      },
    };
    const mutation: PrescriptionSessionCompilationResult = {
      ...compiled,
      plans: [exactLoadPlan, createdPlan],
      assignmentResults: [{
        ...entry,
        plan: exactLoadPlan,
        decisionTrace: {
          ...entry.decisionTrace,
          loadTrace: {
            ...entry.decisionTrace.loadTrace!,
            automaticProgressionApplied: true as false,
          },
        },
      }, {
        ...entry,
        status: "compiled",
        plan: null,
      }],
    };
    const codes = validatePrescriptionSessionCompilation(mutation).map((finding) => finding.code);
    expect(codes).toEqual(expect.arrayContaining([
      "POLICY_CREATED_ASSIGNMENT",
      "POLICY_REMOVED_ASSIGNMENT",
      "SILENT_SUBSTITUTION",
      "EXACT_LOAD_WITHOUT_EVIDENCE",
      "AUTOMATIC_LOAD_PROGRESSION_FORBIDDEN",
    ]));
  });

  it("keeps source identity independent of dose, labels, rank, clock, and revision", () => {
    const identity = {
      sessionIntentId: "mutation:intent",
      assignmentHandoffId: "mutation:assignment",
      executionAttemptId: "mutation:attempt",
    };
    const first = buildSourceExposureEventId(identity);
    const second = buildSourceExposureEventId(identity);
    expect(second).toBe(first);
    expect(first).not.toContain("dose");
    expect(first).not.toContain("rank");
  });

  it("rejects planned dose or timing being treated as observed actual", () => {
    const plan = compileSessionPrescription(buildCatalogCompilerInput(exercise)).plans[0];
    const linkage: ExercisePerformanceBlockLinkage = {
      performanceRecordId: "mutation:performance",
      prescriptionId: plan.prescriptionId,
      prescriptionRevisionId: plan.prescriptionRevisionId,
      sourceExposureEventId: plan.sourceExposureEvent.sourceExposureEventId,
      plannedBlockIds: plan.doseBlocks.map((block) => block.blockId),
      blockResults: [],
      omittedPlannedBlockIds: [],
      additionalUnplannedBlockIds: [],
      actualDoseAssumedFromPlan: true as false,
      actualTimingAssumedFromPlan: true as false,
      originalPlanImmutable: true,
      provenance: { source: "synthetic_contract_fixture", sourceRef: "mutation:performance" },
    };
    expect(validatePerformanceBlockLinkage(linkage).map((entry) => entry.code)).toEqual(
      expect.arrayContaining(["actual_dose_assumed_from_plan", "actual_timing_assumed_from_plan"]),
    );
  });

  it("detects structurally equal applicability conflicts rather than depending on rule order", () => {
    const first = PRESCRIPTION_POLICY_V1.rules[0];
    const conflict = {
      ...PRESCRIPTION_POLICY_V1,
      rules: [
        ...PRESCRIPTION_POLICY_V1.rules,
        {
          ...first,
          ruleId: "mutation:equal-applicability",
          value: { ...first.value, count: { kind: "exact" as const, value: 9, unit: "count" as const } },
        },
      ],
    };
    const result = compileSessionPrescription(buildCatalogCompilerInput(exercise, { policy: conflict }));
    expect(result.assignmentResults[0].status).toBe("prescription_policy_conflict");
  });
});
