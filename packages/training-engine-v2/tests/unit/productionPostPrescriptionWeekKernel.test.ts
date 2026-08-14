import { describe, expect, it } from "vitest";
import {
  EXERCISE_DOSE_MODES,
  PRODUCTION_POST_PRESCRIPTION_WEEK_GATE_13_SUBGATES,
  exactCount,
  exactSteps,
  validatePostPrescriptionWeek,
  validateProductionBlockContributionViews,
  validateProductionAssessmentPreparationTrace,
  validateProductionBurdenVectors,
  validateProductionCompleteWeekArgument,
  validateProductionDoseLanes,
  validateProductionDurationView,
  validateProductionFinalPrescriptionRevisions,
  validateProductionFinalSequenceRevisions,
  validateProductionGate13Trace,
  validateProductionObjectiveToEventChain,
  validateProductionPlannedSourceExposureLedger,
  validateProductionRelationshipViews,
  validateProductionRecoveryViews,
  validateProductionSpacingTraces,
  validateProductionStressViews,
} from "../../src";
import {
  buildProductionPostPrescriptionWeekBaseInput,
  productionCleanHoldoutInputs,
} from "../helpers/productionPostPrescriptionWeekValidationLab";

describe("production post-Prescription Week kernel", () => {
  it("derives one canonical event row and a complete typed causal surface", () => {
    const input = buildProductionPostPrescriptionWeekBaseInput(2);
    const result = validatePostPrescriptionWeek(input);
    expect(result).toMatchObject({
      authority: "PRODUCTION_KERNEL_AUTHORITY",
      productionActivationStatus: "NOT_ACTIVATED",
      decisionTrace: { actualPerformanceConsumed: false, longitudinalDecisionConsumed: false },
    });
    expect(result.sourceEventIntegrityTrace).toMatchObject({
      duplicateEventCount: 0,
      missingEventCount: 0,
      orphanEventCount: 0,
      crossSessionEventCollisionCount: 0,
      stalePrescriptionRevisionCount: 0,
      staleSequenceRevisionCount: 0,
      wrongReservationCount: 0,
      wrongOpportunityCount: 0,
      wrongExecutionAttemptCount: 0,
    });
    expect(new Set(result.sourceExposureLedger.map((event) => event.sourceExposureEventId)).size)
      .toBe(result.sourceExposureLedger.length);
    expect(validateProductionPlannedSourceExposureLedger(result.sourceExposureLedger)).toEqual([]);
    expect(validateProductionObjectiveToEventChain(input, result.sourceExposureLedger)).toEqual([]);
    expect(validateProductionFinalPrescriptionRevisions(input, result.sourceExposureLedger)).toEqual([]);
    expect(validateProductionFinalSequenceRevisions(input, result.sourceExposureLedger)).toEqual([]);
  });

  it("preserves block, dose, relationship, stress, burden, duration, and spacing truth", () => {
    const input = buildProductionPostPrescriptionWeekBaseInput(2);
    const result = validatePostPrescriptionWeek(input);
    expect(validateProductionBlockContributionViews(result.sourceExposureLedger.flatMap((event) => event.blockPurposeViews)))
      .toEqual([]);
    expect(validateProductionDoseLanes(result.doseLaneSummaries)).toEqual([]);
    expect(validateProductionRelationshipViews(result.muscleRelationshipViews)).toEqual([]);
    expect(validateProductionAssessmentPreparationTrace(result.assessmentPreparationTrace)).toEqual([]);
    expect(validateProductionRecoveryViews(result.recoveryViews)).toEqual([]);
    expect(validateProductionStressViews(result.stressTraces)).toEqual([]);
    expect(validateProductionBurdenVectors(result.burdenVectors)).toEqual([]);
    expect(validateProductionDurationView(result.weeklyDurationView)).toEqual([]);
    expect(validateProductionSpacingTraces(result.spacingTraces)).toEqual([]);
    expect(validateProductionCompleteWeekArgument(result.completeWeekArgument)).toEqual([]);
    expect(result.muscleRelationshipViews.every((view) => view.fractionalCoefficient === null)).toBe(true);
    expect(result.burdenVectors.every((vector) => vector.aggregateScore === null && vector.observedRecoveryCost === null)).toBe(true);
  });

  it("keeps prescribed, executable, and pending frequency separate", () => {
    const result = validatePostPrescriptionWeek(buildProductionPostPrescriptionWeekBaseInput());
    expect(result.objectiveRealizationTraces.some((objective) =>
      objective.prescribedFrequencyCount > objective.executablePrescribedFrequencyCount &&
      objective.pendingFeasibilityOpportunityCount > 0)).toBe(true);
    expect(result.sessionAdmissibilityTraces.some((session) =>
      session.prescribedRealizationPresent && !session.executableMinimumEligible && session.pendingFeasibilityEligible)).toBe(true);
  });

  it("covers all seven noncommensurable dose modes across the frozen clean corpus", () => {
    const results = productionCleanHoldoutInputs().map(validatePostPrescriptionWeek);
    const modes = new Set(results.flatMap((result) => result.doseLaneSummaries.map((lane) => lane.mode)));
    const lane = results.flatMap((result) => result.doseLaneSummaries)[0];
    if (!lane) throw new Error("PRODUCTION_DOSE_LANE_FIXTURE_REQUIRED");
    const stepLanes = [
      {
        ...lane,
        mode: "step_march" as const,
        dose: {
          mode: "step_march" as const,
          stationary: true as const,
          sets: exactCount(2),
          steps: exactSteps(10),
          marchControlStandard: "Explicit canonical stationary-march fixture.",
        },
      },
      {
        ...lane,
        mode: "step_sets" as const,
        dose: {
          mode: "step_sets" as const,
          sets: exactCount(2),
          steps: exactSteps(8),
          stepCountInterpretation: "Explicit canonical counted-step fixture.",
        },
      },
    ];
    expect(validateProductionDoseLanes(stepLanes)).toEqual([]);
    stepLanes.forEach((entry) => modes.add(entry.mode));
    expect([...modes].sort()).toEqual([
      "breath_cycles", "distance_carry", "repetition_sets", "step_march", "step_sets", "timed_carry", "timed_hold",
    ]);
    expect([...modes].sort()).toEqual([...EXERCISE_DOSE_MODES].sort());
  });

  it("runs Gate 13 in exact fail-stop order and never rescues an upstream failure", () => {
    const input = buildProductionPostPrescriptionWeekBaseInput();
    const pass = validatePostPrescriptionWeek(input);
    expect(pass.gate13Trace.map((subgate) => subgate.subgate)).toEqual(PRODUCTION_POST_PRESCRIPTION_WEEK_GATE_13_SUBGATES);
    expect(validateProductionGate13Trace(pass.gate13Trace, "PASS")).toEqual([]);
    const shadow = validatePostPrescriptionWeek({ ...input, upstreamGateState: "FAIL_STOP" });
    expect(shadow.gate13Trace.every((subgate) => subgate.state === "SHADOW_DIAGNOSTIC_ONLY" && !subgate.scored)).toBe(true);
    expect(validateProductionGate13Trace(shadow.gate13Trace, "FAIL_STOP")).toEqual([]);
    expect(shadow.decisionTrace.noRescueTrace).toContain("UPSTREAM_FAILURE_RETAINED");
  });

  it("never creates or removes sessions, exercises, or completed facts", () => {
    const result = validatePostPrescriptionWeek(buildProductionPostPrescriptionWeekBaseInput());
    expect(result.completeWeekArgument).toMatchObject({
      validationAddedSessionCount: 0,
      validationRemovedSessionCount: 0,
      validationAddedExerciseCount: 0,
      validationRemovedExerciseCount: 0,
      plannedFactsCalledCompletedCount: 0,
    });
  });
});
