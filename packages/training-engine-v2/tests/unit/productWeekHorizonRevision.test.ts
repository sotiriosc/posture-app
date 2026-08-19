import { describe, expect, it } from "vitest";
import { BODYWEIGHT_EQUIPMENT, FULL_GYM_EQUIPMENT, NO_TRAINING_SAFETY_SIGNALS } from "../../src";
import {
  POLICY_HORIZON_AS_OF,
  adaptCurrentSessionContext,
  adaptProductWeekHorizon,
  decideStableOpportunityIdentity,
  horizonSourceInput,
  opportunityFact,
} from "../helpers/policyHorizonDesignLab";

describe("Product Week horizon revision and day-of context", () => {
  it("retains identity for metadata changes and replaces it for a material window move", () => {
    const previous = opportunityFact({ key: "slot", minutes: 45, startAt: "2026-08-13T08:00:00-04:00",
      endAt: "2026-08-13T09:00:00-04:00" });
    const metadata = { ...previous, availableMinutes: 30 };
    expect(decideStableOpportunityIdentity({ horizonId: "h", previous, next: metadata }))
      .toMatchObject({ decision: "identity_retained", reason: "metadata_only" });
    const moved = opportunityFact({ key: "slot", startAt: "2026-08-14T08:00:00-04:00",
      endAt: "2026-08-14T09:00:00-04:00" });
    expect(decideStableOpportunityIdentity({ horizonId: "h", previous, next: moved }))
      .toMatchObject({ decision: "new_identity_required", reason: "material_window_change" });
  });

  it("creates an immutable revision and invalidates only replaced opportunities", () => {
    const first = adaptProductWeekHorizon(horizonSourceInput({ opportunityFacts: [opportunityFact({ key: "mon" }),
      opportunityFact({ key: "wed", order: 1 })] }));
    const serializedFirst = JSON.stringify(first.horizon);
    const second = adaptProductWeekHorizon(horizonSourceInput({ revisionId: "revision:2", basedOnRevisionId: "revision:1",
      previousHorizon: first.horizon!, opportunityFacts: [opportunityFact({ key: "mon" }), opportunityFact({ key: "thu", order: 1 })] }));
    expect(JSON.stringify(first.horizon)).toBe(serializedFirst);
    expect(second.revision).toMatchObject({ basedOnRevisionId: "revision:1", reallocationRequired: true });
    expect(second.revision?.unchangedOpportunityIds).toHaveLength(1);
    expect(second.revision?.changedOpportunityIds).toHaveLength(1);
    expect(second.revision?.invalidatedReservationIds).toHaveLength(1);
  });

  it("preserves completed history in the new revision", () => {
    const result = adaptProductWeekHorizon(horizonSourceInput({ opportunityFacts: [opportunityFact({
      key: "done", completion: "completed",
    }), opportunityFact({ key: "remaining", order: 1 })] }));
    expect(result.horizon?.completedOpportunityIds).toHaveLength(1);
    expect(result.revision?.completedOpportunityIds).toEqual(result.horizon?.completedOpportunityIds);
  });

  it("collects actual day-of facts without inventing programming consequences", () => {
    const result = adaptCurrentSessionContext({ reservationId: "reservation", actualEvaluationTime: POLICY_HORIZON_AS_OF,
      actualAvailability: { availableMinutes: 30, structuralCapacity: "standard", provenance: "explicit_today", sourceRef: "user-today" },
      actualStructuralCapacity: "standard",
      actualEquipment: { capabilities: BODYWEIGHT_EQUIPMENT, provenance: "explicit_today", sourceRef: "actual-home" },
      actualTrainingSafety: NO_TRAINING_SAFETY_SIGNALS, userCancelled: false, actualLocationRef: "home",
      unresolvedContext: [], productUpdateRefs: ["location-change"] });
    expect(result.status).toBe("current_context_ready");
    expect(result.equipment?.capabilities).toEqual(BODYWEIGHT_EQUIPMENT);
    expect(JSON.stringify(result)).not.toContain("weeklyObjective");
    expect(JSON.stringify(result)).not.toContain("exerciseId");
  });

  it("reports cancellation and under-specification explicitly", () => {
    const base = { reservationId: "reservation", actualEvaluationTime: POLICY_HORIZON_AS_OF,
      actualTrainingSafety: NO_TRAINING_SAFETY_SIGNALS, unresolvedContext: [], productUpdateRefs: [] };
    expect(adaptCurrentSessionContext({ ...base, userCancelled: true }).status).toBe("user_cancelled");
    expect(adaptCurrentSessionContext({ ...base, userCancelled: false,
      actualEquipment: { capabilities: FULL_GYM_EQUIPMENT, provenance: "explicit_today" as const, sourceRef: "gym" } }).status)
      .toBe("under_specified_current_context");
  });
});
