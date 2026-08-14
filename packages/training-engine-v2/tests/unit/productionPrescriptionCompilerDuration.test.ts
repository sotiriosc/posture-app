import { describe, expect, it } from "vitest";
import {
  buildPrescriptionCompatibilityProjection,
  buildPrescriptionDurationInterval,
  type ExerciseDose,
  type ProductionPrescriptionDoseBlock,
} from "../../src";

const provenance = { source: "synthetic_contract_fixture" as const, sourceRef: "duration-unit" };

describe("production Prescription duration and compatibility truth", () => {
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
