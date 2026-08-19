import { describe, expect, it } from "vitest";
import {
  buildPrescriptionCompatibilityProjection,
  buildPrescriptionDurationInterval,
  PRESCRIPTION_OPERATIONAL_DURATION_POLICY_V1,
  type ExerciseDose,
  type ProductionPrescriptionDoseBlock,
} from "../../src";

const provenance = { source: "synthetic_contract_fixture" as const, sourceRef: "duration-unit" };

describe("production Prescription duration and compatibility truth", () => {
  it("publishes reviewed finite execution bounds for every controlled-owner purpose", () => {
    expect(Object.keys(PRESCRIPTION_OPERATIONAL_DURATION_POLICY_V1.executionSecondsPerRepetition).sort())
      .toEqual([
        "accessory_support", "activation_control", "cooldown_recovery",
        "dependency_preparation", "lift_acclimation", "primary_developmental_strength",
        "supporting_developmental",
      ]);
    for (const bound of Object.values(
      PRESCRIPTION_OPERATIONAL_DURATION_POLICY_V1.executionSecondsPerRepetition,
    )) {
      expect(bound.lowerBoundSeconds).toBeGreaterThan(0);
      expect(bound.upperBoundSeconds).toBeGreaterThanOrEqual(bound.lowerBoundSeconds);
      expect(bound.classification).toBe("praxis_operational_doctrine");
      expect(bound.policyRef).toContain("PRESCRIPTION_OPERATIONAL_DURATION_POLICY_V1@1.0.0");
    }
  });

  it("bounds coaching-tempo repetitions through a separate reviewed operational interval", () => {
    const dose: ExerciseDose = {
      mode: "repetition_sets",
      sets: { kind: "exact", value: 3, unit: "count" },
      repetitions: { kind: "range", min: 3, max: 6, unit: "count" },
      tempo: { kind: "intent_only", intent: "natural", provenance },
    };
    const before = structuredClone(dose);
    const interval = buildPrescriptionDurationInterval({ dose, restInstructions: [],
      operationalPolicy: PRESCRIPTION_OPERATIONAL_DURATION_POLICY_V1,
      executionTimingClass: "primary_developmental_strength", assignmentId: "main",
      blockId: "main-work" });

    expect(dose).toEqual(before);
    expect(dose.tempo).toMatchObject({ kind: "intent_only", intent: "natural" });
    expect(interval).toMatchObject({ knownLowerBoundSeconds: 18, knownUpperBoundSeconds: 180,
      unknownComponents: [], status: "bounded_before_sequencing" });
    expect(interval.includedComponents).toMatchObject([{ owner: "prescription",
      kind: "dose_execution", classification: "praxis_operational_doctrine",
      lowerBoundSeconds: 18, upperBoundSeconds: 180 }]);
  });

  it("covers controlled-owner breathing, carry, and per-side step execution without claiming exact pace", () => {
    const cases: readonly { readonly dose: ExerciseDose; readonly expected: readonly [number, number] }[] = [
      { dose: { mode: "breath_cycles", rounds: { kind: "exact", value: 1, unit: "count" },
        breathCycles: { kind: "range", min: 3, max: 5, unit: "breath_cycles" } }, expected: [15, 75] },
      { dose: { mode: "distance_carry", trips: { kind: "exact", value: 2, unit: "count" },
        distancePerTrip: { kind: "range", min: 10, max: 20, unit: "metres" },
        gaitControlStandard: "controlled" }, expected: [10, 100] },
      { dose: { mode: "step_sets", sets: { kind: "exact", value: 1, unit: "count" },
        steps: { kind: "range", min: 6, max: 10, unit: "steps" }, laterality: { kind: "each_side" },
        stepCountInterpretation: "per side" }, expected: [11, 90] },
    ];
    for (const [index, entry] of cases.entries()) {
      const interval = buildPrescriptionDurationInterval({ dose: entry.dose, restInstructions: [],
        operationalPolicy: PRESCRIPTION_OPERATIONAL_DURATION_POLICY_V1,
        executionTimingClass: "dependency_preparation", assignmentId: `support-${index}`,
        blockId: `support-block-${index}` });
      expect([interval.knownLowerBoundSeconds, interval.knownUpperBoundSeconds]).toEqual(entry.expected);
      expect(interval.unknownComponents).toEqual([]);
      expect(interval.includedComponents?.every((component) =>
        component.classification === "praxis_operational_doctrine" &&
        component.policyRef.includes("@1.0.0"))).toBe(true);
    }
  });

  it("does not fabricate dynamic, breathing, distance, or step duration", () => {
    const doses: readonly ExerciseDose[] = [
      { mode: "repetition_sets", sets: { kind: "exact", value: 3, unit: "count" }, repetitions: { kind: "range", min: 3, max: 6, unit: "count" } },
      { mode: "breath_cycles", rounds: { kind: "exact", value: 1, unit: "count" }, breathCycles: { kind: "range", min: 3, max: 5, unit: "breath_cycles" } },
      { mode: "distance_carry", trips: { kind: "exact", value: 2, unit: "count" }, distancePerTrip: { kind: "range", min: 10, max: 20, unit: "metres" }, gaitControlStandard: "canonical" },
      { mode: "step_sets", sets: { kind: "exact", value: 2, unit: "count" }, steps: { kind: "range", min: 8, max: 15, unit: "steps" }, stepCountInterpretation: "canonical" },
    ];
    const intervals = doses.map((dose) => buildPrescriptionDurationInterval({ dose, restInstructions: [] }));
    expect(intervals.map((entry) => entry.status)).toEqual([
      "unknown_due_to_repetition_tempo",
      "unknown_due_to_breathing_cadence",
      "unknown_due_to_locomotor_pace",
      "unknown_due_to_step_cadence",
    ]);
    expect(intervals.every((entry) => entry.knownUpperBoundSeconds === null)).toBe(true);
  });

  it("bounds timed work from explicit work and rest only", () => {
    const dose: ExerciseDose = {
      mode: "timed_hold",
      sets: { kind: "exact", value: 2, unit: "count" },
      duration: { kind: "range", min: 20, max: 40, unit: "seconds" },
    };
    const interval = buildPrescriptionDurationInterval({
      dose,
      restInstructions: [{
        restInstructionId: "hold-rest",
        placement: "between_developmental_sets",
        target: { kind: "range", min: 60, max: 120, unit: "seconds" },
        appliesWithinBlockId: "hold-block",
        provenance,
      }],
    });
    expect(interval.knownLowerBoundSeconds).toBe(100);
    expect(interval.knownUpperBoundSeconds).toBe(200);
    expect(interval.status).toBe("bounded_before_sequencing");
  });

  it("never flattens ordered multi-block plans", () => {
    const dose: ExerciseDose = {
      mode: "repetition_sets",
      sets: { kind: "exact", value: 1, unit: "count" },
      repetitions: { kind: "exact", value: 5, unit: "count" },
    };
    const block = (id: string, index: number): ProductionPrescriptionDoseBlock => ({
      blockId: id,
      sourceExposureEventId: "event",
      purpose: index === 0 ? "preparatory_acclimation" : "developmental_work",
      dose,
      executionStandard: {
        alignmentPriorityIds: [], assessmentPriorityIds: [], painResponseRequirementIds: [],
        exerciseMechanicsIntent: "canonical", criteria: [], provenance,
      },
      restInstructions: [], policyRuleRefs: [], requirementRefs: [],
      unresolvedRequirementRefs: [],
      contributionClassification: index === 0 ? "not_weekly_developmental_credit" : "developmental_credit_candidate",
      order: { index, dependsOnBlockIds: index === 0 ? [] : ["prep"] },
      provenance,
    });
    const projection = buildPrescriptionCompatibilityProjection({
      blocks: [block("prep", 0), block("work", 1)],
      restInstructions: [],
      unresolvedRequirementRefs: [],
    });
    expect(projection.status).toBe("ordered_blocks_required");
    expect(projection.projectedDose).toBeNull();
  });
});
