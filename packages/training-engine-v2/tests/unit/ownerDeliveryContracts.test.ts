import { describe, expect, it } from "vitest";
import {
  OWNER_DELIVERY_CONTRACTS,
  OWNER_DELIVERY_STATE_MACHINE,
  buildOwnerEnrollmentRevision,
  buildOwnerProfileRevision,
  evaluateOwnerProfileReadiness,
  validateOwnerProfileRevision,
  resolveOwnerDeliveryMode,
} from "../../src";

const NOW = "2026-08-17T10:00:00.000Z";

describe("controlled owner delivery pure contracts", () => {
  it("keeps the delivery mode closed and default off", () => {
    expect(resolveOwnerDeliveryMode(undefined).mode).toBe("off");
    expect(resolveOwnerDeliveryMode(" preview ").mode).toBe("preview");
    expect(resolveOwnerDeliveryMode("apply").mode).toBe("apply");
    expect(resolveOwnerDeliveryMode("enabled").mode).toBe("off");
  });

  it("builds immutable enrollment and profile revisions without email", () => {
    const enrollment = buildOwnerEnrollmentRevision({
      basedOnRevisionId: null,
      userId: "owner-user-1",
      state: "active",
      fixedGoal: "strength",
      permission: "preview_only",
      explicitConsent: true,
      acceptedVersions: ["engine@1"],
      provenance: { source: "owner_confirmation", sourceRefs: ["consent:1"] },
      createdAt: NOW,
    });
    const profile = buildOwnerProfileRevision({
      basedOnRevisionId: null,
      userId: "owner-user-1",
      primaryGoal: "strength",
      trainingMode: "develop",
      secondaryGoal: null,
      daysPerWeek: 3,
      sessionOpportunities: [
        { opportunityId: "opportunity-1", order: 1, minutes: null },
        { opportunityId: "opportunity-2", order: 2, minutes: null },
        { opportunityId: "opportunity-3", order: 3, minutes: null },
      ],
      sessionMinutes: { status: "explicit_unknown", minutes: null },
      equipmentCapabilitySnapshot: {
        environment: "commercial_gym",
        capabilityIds: ["dumbbells", "bench"],
        confirmed: true,
        sourceRevision: "equipment:1",
      },
      coarseExperience: "intermediate",
      familiarity: [],
      painContext: { regionIds: [], limitationIds: [], confirmed: true, diagnosticClaimCount: 0 },
      assessmentReferences: [],
      trainingSafety: "clear",
      continuityReferences: [],
      evaluationTime: NOW,
      provenance: { source: "owner_confirmation", sourceRefs: ["profile:1"] },
      reviewState: "confirmed",
      createdAt: NOW,
    });
    expect(JSON.stringify({ enrollment, profile })).not.toContain("email");
    expect(enrollment.contract).toEqual(OWNER_DELIVERY_CONTRACTS.enrollment);
    expect(evaluateOwnerProfileReadiness(profile)).toMatchObject({
      status: "ready_for_preview",
      previewAllowed: true,
      approvalAllowed: false,
      minimumInputCount: 11,
    });
  });

  it("implements all 23 design states with no automatic apply", () => {
    expect(OWNER_DELIVERY_STATE_MACHINE.stateCount).toBe(23);
    expect(OWNER_DELIVERY_STATE_MACHINE.automaticApplyTransitions).toBe(0);
    expect(OWNER_DELIVERY_STATE_MACHINE.transitions).toHaveLength(23);
  });

  it.each([1, 7] as const)("keeps legacy %s-day profiles readable but requires reconfirmation", (days) => {
    const current = buildOwnerProfileRevision({ basedOnRevisionId: null, userId: "legacy-owner",
      primaryGoal: "strength", trainingMode: "develop", secondaryGoal: null, daysPerWeek: 2,
      sessionOpportunities: [
        { opportunityId: "opportunity-1", order: 1, minutes: 90 },
        { opportunityId: "opportunity-2", order: 2, minutes: 90 },
      ], sessionMinutes: { status: "known", minutes: 90 },
      equipmentCapabilitySnapshot: { environment: "commercial_gym", capabilityIds: ["dumbbells"],
        confirmed: true, sourceRevision: "equipment:legacy" }, coarseExperience: "advanced", familiarity: [],
      painContext: { regionIds: [], limitationIds: [], confirmed: true, diagnosticClaimCount: 0 },
      assessmentReferences: [], trainingSafety: "clear", continuityReferences: [], evaluationTime: NOW,
      provenance: { source: "owner_confirmation", sourceRefs: ["legacy-profile"] },
      reviewState: "confirmed", createdAt: NOW });
    const legacy = { ...current, daysPerWeek: days,
      sessionOpportunities: Array.from({ length: days }, (_, index) => ({
        opportunityId: `legacy-opportunity-${index + 1}`, order: index + 1, minutes: 90,
      })) } as typeof current;
    expect(legacy.daysPerWeek).toBe(days);
    expect(evaluateOwnerProfileReadiness(legacy)).toMatchObject({ status: "profile_incomplete",
      previewAllowed: false, approvalAllowed: false,
      reasonCodes: ["OWNER_PROFILE_AVAILABILITY_RECONFIRMATION_REQUIRED"] });
    expect(validateOwnerProfileRevision(legacy)).toContain("OWNER_PROFILE_DAYS_OPPORTUNITIES_INVALID");
  });

  it.each([1, 7] as const)("rejects new %s-day profile revisions", (days) => {
    expect(() => buildOwnerProfileRevision({ basedOnRevisionId: null, userId: "new-owner",
      primaryGoal: "strength", trainingMode: "develop", secondaryGoal: null,
      daysPerWeek: days as never, sessionOpportunities: Array.from({ length: days }, (_, index) => ({
        opportunityId: `opportunity-${index + 1}`, order: index + 1, minutes: 90 })),
      sessionMinutes: { status: "known", minutes: 90 }, equipmentCapabilitySnapshot: {
        environment: "commercial_gym", capabilityIds: ["dumbbells"], confirmed: true,
        sourceRevision: "equipment:new" }, coarseExperience: "advanced", familiarity: [],
      painContext: { regionIds: [], limitationIds: [], confirmed: true, diagnosticClaimCount: 0 },
      assessmentReferences: [], trainingSafety: "clear", continuityReferences: [], evaluationTime: NOW,
      provenance: { source: "owner_confirmation", sourceRefs: ["new-profile"] },
      reviewState: "confirmed", createdAt: NOW })).toThrow("OWNER_PROFILE_DAYS_OPPORTUNITIES_INVALID");
  });
});
