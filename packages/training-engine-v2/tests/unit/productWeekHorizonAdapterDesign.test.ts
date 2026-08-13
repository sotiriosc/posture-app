import { describe, expect, it } from "vitest";
import {
  adaptProductWeekHorizon,
  buildProductHorizonScenarioDefinitions,
  buildSameProfileCurrentWeekCohort,
  horizonSourceInput,
  opportunityFact,
  profileDefaults,
  runProductHorizonScenarios,
} from "../helpers/policyHorizonDesignLab";

describe("Product Week Horizon Adapter design", () => {
  it("covers all 23 required factual current-week scenarios", () => {
    const definitions = buildProductHorizonScenarioDefinitions();
    const results = runProductHorizonScenarios();
    expect(definitions).toHaveLength(23);
    expect(results.map((entry) => [entry.id, entry.status]))
      .toEqual(definitions.map((entry) => [entry.id, entry.expectedStatus]));
  });

  it("lets explicit current confirmation replace profile defaults without inheriting four days", () => {
    const result = adaptProductWeekHorizon(horizonSourceInput({
      opportunityFacts: [opportunityFact({ key: "one" }), opportunityFact({ key: "two", order: 1 })],
      profileDefaults: profileDefaults({ daysPerWeek: 4 }),
    }));
    expect(result.status).toBe("horizon_ready");
    expect(result.horizon?.opportunities).toHaveLength(2);
    expect(result.profileDefaultSourceRefs).toEqual([]);
  });

  it("keeps calendar free windows and profile defaults tentative", () => {
    const calendar = adaptProductWeekHorizon(horizonSourceInput({ opportunityFacts: [opportunityFact({
      key: "free", sourceType: "connected_calendar_window", confirmation: "observed_free_window",
    })] }));
    expect(calendar.status).toBe("user_confirmation_required");
    expect(calendar.horizon?.opportunities[0].availabilityStatus).toBe("tentative");

    const profile = adaptProductWeekHorizon(horizonSourceInput({ opportunityFacts: [], profileDefaults: profileDefaults({ daysPerWeek: 2 }) }));
    expect(profile.status).toBe("user_confirmation_required");
    expect(profile.profileDefaultSourceRefs).toHaveLength(2);
  });

  it("uses factual precedence and reports equal-authority conflicts", () => {
    const lower = opportunityFact({ key: "same", sourceId: "calendar", sourceType: "connected_calendar_window",
      confirmation: "observed_free_window", minutes: 60 });
    const higher = opportunityFact({ key: "same", sourceId: "user", minutes: 30 });
    const resolved = adaptProductWeekHorizon(horizonSourceInput({ opportunityFacts: [lower, higher] }));
    expect(resolved.status).toBe("horizon_ready");
    expect(resolved.horizon?.opportunities[0].expectedAvailability.availableMinutes).toBe(30);

    const conflict = adaptProductWeekHorizon(horizonSourceInput({ opportunityFacts: [higher,
      opportunityFact({ key: "same", sourceId: "other-user", minutes: 45 })] }));
    expect(conflict.status).toBe("horizon_source_conflict");
    expect(conflict.horizon).toBeNull();
  });

  it("resolves equipment only through typed versioned records", () => {
    const resolved = adaptProductWeekHorizon(horizonSourceInput({ opportunityFacts: [opportunityFact({ key: "gym" })] }));
    expect(resolved.horizon?.opportunities[0].expectedEquipment.kind).toBe("capability_snapshot");
    const missing = adaptProductWeekHorizon(horizonSourceInput({ opportunityFacts: [opportunityFact({
      key: "missing", equipmentRef: "equipment:not-registered",
    })] }));
    expect(missing.status).toBe("equipment_resolution_required");
    expect(missing.equipmentResolutionRefs).toEqual(["equipment:not-registered"]);
  });

  it("never becomes a Week Composer or exercise/dose generator", () => {
    for (const definition of buildProductHorizonScenarioDefinitions()) {
      const result = adaptProductWeekHorizon(definition.input);
      const serialized = JSON.stringify(result);
      expect(result).not.toHaveProperty("reservations");
      expect(serialized).not.toContain("weeklyObjective");
      expect(serialized).not.toContain("exerciseId");
      expect(serialized).not.toContain("selectedExercise");
      expect(serialized).not.toContain("dose");
      expect(serialized).not.toContain("split");
    }
  });

  it("personalizes current facts for one profile and preserves justified convergence", () => {
    const cohort = buildSameProfileCurrentWeekCohort();
    expect(cohort).toHaveLength(12);
    expect(new Set(cohort.slice(0, 10).map((entry) => entry.signature)).size).toBeGreaterThanOrEqual(9);
    expect(cohort.find((entry) => entry.id === "identical-a")?.signature)
      .toBe(cohort.find((entry) => entry.id === "identical-b")?.signature);
  });
});
