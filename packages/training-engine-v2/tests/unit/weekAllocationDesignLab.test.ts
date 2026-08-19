import { describe, expect, it } from "vitest";
import { NO_TRAINING_SAFETY_SIGNALS } from "../../src";
import {
  WEEK_DESIGN_AS_OF,
  allocationInput,
  buildControlledWeekScenarioDefinitions,
  designWeekAllocation,
  designWeeklyIntent,
  materializeReservationDesign,
  runControlledWeekScenarios,
  runProductionSessionFeasibilityOracle,
  weekHorizon,
} from "../helpers/weekComposerDesignLab";

describe("Week allocation design lab", () => {
  it("covers all 19 required controlled scenarios and expected statuses", () => {
    const scenarios = runControlledWeekScenarios();
    expect(scenarios).toHaveLength(19);
    for (const scenario of scenarios) {
      const actual = scenario.plan?.status ?? scenario.intent.status;
      expect(actual).toBe(scenario.expectation);
    }
  });

  it("produces reservations without exercise identities or current-fact claims", () => {
    const scenario = runControlledWeekScenarios().find((entry) => entry.id === "four-day-strength")!;
    expect(scenario.plan?.reservations.length).toBeGreaterThan(0);
    expect(JSON.stringify(scenario.plan?.reservations)).not.toContain("exerciseId");
    expect(scenario.plan?.reservations.every((entry) => entry.expectedAvailability.provenance.truthState === "expected_future_fact"))
      .toBe(true);
    expect(scenario.plan?.unresolvedCurrentSessionFacts.length).toBeGreaterThan(0);
  });

  it("materializes matching actual facts and preserves every weekly responsibility", () => {
    const scenario = runControlledWeekScenarios().find((entry) => entry.id === "two-day-strength")!;
    expect(scenario.materializations.every((entry) => entry.status === "directive_materialized")).toBe(true);
    scenario.materializations.forEach((materialized, index) => {
      expect(materialized.retainedWeeklyObjectiveIds).toEqual(
        scenario.plan?.reservations[index].allocatedObjectives.map((entry) => entry.weeklyObjectiveId).sort());
      expect(materialized.directive?.source).toBe("future_week_composer");
      expect(materialized.plannerCurrentEquipment?.provenance).toBe("explicit_today");
    });
  });

  it("routes changed structural capacity/equipment and cancelled reservations to Week reallocation", () => {
    const scenario = runControlledWeekScenarios().find((entry) => entry.id === "two-day-strength")!;
    const reservation = scenario.plan!.reservations[0];
    const changed = materializeReservationDesign({
      reservation,
      actualCurrentAvailability: { availableMinutes: 20, structuralCapacity: "condensed", provenance: "explicit_today", sourceRef: "actual-short" },
      actualCurrentEquipment: { capabilities: reservation.expectedEquipment.kind === "capability_snapshot"
        ? reservation.expectedEquipment.capabilities : {}, provenance: "explicit_today", sourceRef: "actual-equipment" } as Parameters<typeof materializeReservationDesign>[0]["actualCurrentEquipment"],
      actualEvaluationTime: WEEK_DESIGN_AS_OF,
      actualSafetyState: NO_TRAINING_SAFETY_SIGNALS,
      actualUnresolvedContext: [],
      explicitProductUserUpdateRefs: [],
    });
    expect(changed.status).toBe("requires_week_reallocation");
    const cancelled = materializeReservationDesign({
      reservation: { ...reservation, status: "cancelled_requires_reallocation" },
      actualCurrentAvailability: { availableMinutes: 45, structuralCapacity: reservation.expectedStructuralCapacity,
        provenance: "explicit_today", sourceRef: "cancelled" },
      actualCurrentEquipment: { capabilities: reservation.expectedEquipment.kind === "capability_snapshot"
        ? reservation.expectedEquipment.capabilities : {}, provenance: "explicit_today", sourceRef: "cancelled" } as Parameters<typeof materializeReservationDesign>[0]["actualCurrentEquipment"],
      actualEvaluationTime: WEEK_DESIGN_AS_OF,
      actualSafetyState: NO_TRAINING_SAFETY_SIGNALS,
      actualUnresolvedContext: [],
      explicitProductUserUpdateRefs: [],
    });
    expect(cancelled.status).toBe("requires_week_reallocation");
  });

  it("does not treat raw minutes alone as policy or exact duration feasibility", () => {
    const scenario = runControlledWeekScenarios().find((entry) => entry.id === "two-day-strength")!;
    const reservation = scenario.plan!.reservations[0];
    const equipment = reservation.expectedEquipment.kind === "capability_snapshot" ? reservation.expectedEquipment.capabilities : undefined;
    const result = materializeReservationDesign({
      reservation,
      actualCurrentAvailability: { availableMinutes: 31, structuralCapacity: reservation.expectedStructuralCapacity,
        provenance: "explicit_today", sourceRef: "different-minutes-same-capacity" },
      actualCurrentEquipment: equipment ? { capabilities: equipment, provenance: "explicit_today", sourceRef: "same-equipment" } : undefined,
      actualEvaluationTime: WEEK_DESIGN_AS_OF,
      actualSafetyState: NO_TRAINING_SAFETY_SIGNALS,
      actualUnresolvedContext: [],
      explicitProductUserUpdateRefs: [],
    });
    expect(result.status).toBe("directive_materialized");
    expect(result.directive?.currentSessionAvailability?.availableMinutes).toBe(31);
  });

  it("preserves productive responsibility placement without split-label identity", () => {
    const scenario = runControlledWeekScenarios().find((entry) => entry.id === "productive-stable")!;
    expect(scenario.plan?.reservations.map((entry) => [entry.opportunityId, entry.allocatedObjectives[0].weeklyObjectiveId]))
      .toEqual([["opportunity-1", "weekly-objective:push"], ["opportunity-3", "weekly-objective:pull"]]);
    expect(JSON.stringify(scenario.plan)).not.toContain("upper");
  });

  it("drops optional work before required responsibilities in condensed opportunities", () => {
    const scenario = runControlledWeekScenarios().find((entry) => entry.id === "two-opportunity-constrained")!;
    expect(scenario.plan?.objectiveSatisfactionStates["weekly-objective:optional-calf"]).toBe("optional_not_allocated");
    expect(scenario.plan?.objectiveSatisfactionStates["weekly-objective:push"]).toBe("allocated_target_opportunities");
    expect(scenario.plan?.objectiveSatisfactionStates["weekly-objective:pull"]).toBe("allocated_target_opportunities");
  });

  it("does not double a missed opportunity and marks explicit reallocation history", () => {
    const scenario = runControlledWeekScenarios().find((entry) => entry.id === "missed-reallocation")!;
    expect(scenario.plan?.reservations.map((entry) => entry.opportunityId)).toEqual(["opportunity-2", "opportunity-3"]);
    expect(scenario.plan?.reallocationState).toBe("completed_history_preserved");
    expect(Math.max(...scenario.plan!.reservations.map((entry) => entry.allocatedObjectives.length))).toBe(1);
  });

  it("uses the frozen production stack only as an opaque feasibility oracle", () => {
    const scenario = runControlledWeekScenarios().find((entry) => entry.id === "travel-week")!;
    const result = runProductionSessionFeasibilityOracle({ reservation: scenario.plan!.reservations[0] });
    expect(result.status).toBe("feasible_session_skeleton");
    expect(result.sourceTraceRefs).toHaveLength(2);
  });

  it("reports no availability and global safety without manufacturing reservations", () => {
    const noAvailability = runControlledWeekScenarios().find((entry) => entry.id === "no-current-availability")!;
    const safety = runControlledWeekScenarios().find((entry) => entry.id === "global-safety-block")!;
    expect(noAvailability.intent.status).toBe("current_week_availability_required");
    expect(safety.intent.status).toBe("blocked_by_training_readiness");
    expect(noAvailability.plan).toBeNull();
    expect(safety.plan).toBeNull();
  });

  it("keeps exhaustive search deterministic with no dose-sufficiency claim", () => {
    const definition = buildControlledWeekScenarioDefinitions()[0];
    const intent = designWeeklyIntent(definition.intentInput).weeklyIntent!;
    const input = allocationInput({ intent, horizon: definition.horizon, recovery: definition.recovery });
    const first = designWeekAllocation(input);
    const second = designWeekAllocation(input);
    expect(first).toEqual(second);
    expect(first.searchCompleteness).toBe("exhaustive_design_optimal");
    expect(first.unresolvedPrescriptionRequirements.length).toBeGreaterThan(0);
    expect(JSON.stringify(first)).not.toContain("doseCredit");
    expect(weekHorizon().opportunities).toHaveLength(3);
  });
});
