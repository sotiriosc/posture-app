import { describe, expect, it, vi } from "vitest";
import {
  buildOwnerEnrollmentRevision,
  buildOwnerProfileRevision,
} from "@praxis/training-engine-v2";
import {
  createInMemoryOwnerEnrollmentProfileRepository,
  createBufferedControlledOwnerObservability,
  loadControlledOwnerDeliveryMigrations,
  parseConfiguredOwnerReference,
  proposeOwnerImportsFromTrainingSnapshot,
  resolveConfiguredOwnerEligibility,
  resolveControlledOwnerRequestGate,
  resolveOwnerDeliveryModeFromEnvironment,
} from "../../src/controlledOwnerDelivery";
import type { StoredUser } from "../../src/userStore";

const NOW = "2026-08-17T10:00:00.000Z";
const USER: StoredUser = {
  id: "owner-user-1",
  email: "owner@example.test",
  passwordHash: "synthetic",
  passwordSalt: "synthetic",
  plan: "free",
  createdAt: NOW,
  updatedAt: NOW,
};

describe("controlled owner identity and profile foundation", () => {
  it("normalizes exactly one synthetic configured identity and rejects lists", () => {
    expect(parseConfiguredOwnerReference(" OWNER@EXAMPLE.TEST ")).toEqual({
      status: "valid",
      normalized: "owner@example.test",
    });
    expect(parseConfiguredOwnerReference("owner@example.test,other@example.test").status).toBe("invalid");
  });

  it("resolves passively without bootstrap or writes", async () => {
    const findUserByEmail = vi.fn(async () => USER);
    const eligibility = await resolveConfiguredOwnerEligibility({
      environment: { AUTH_USER_EMAIL: "OWNER@EXAMPLE.TEST" },
      readSession: async () => ({ id: USER.id, email: USER.email, plan: USER.plan }),
      userRepository: { findUserByEmail },
      evaluationTime: NOW,
    });
    expect(eligibility).toMatchObject({ eligible: true, userId: USER.id, reasonCode: "OWNER_ELIGIBLE",
      bootstrapCallCount: 0, databaseWriteCount: 0 });
    expect(findUserByEmail).toHaveBeenCalledWith("owner@example.test");
    expect(JSON.stringify(eligibility)).not.toContain(USER.email);
  });

  it("short-circuits off before session or repository access", async () => {
    const readSession = vi.fn(async () => ({ id: USER.id, email: USER.email, plan: USER.plan }));
    const findUserByEmail = vi.fn(async () => USER);
    const observed = createBufferedControlledOwnerObservability();
    const gate = await resolveControlledOwnerRequestGate({
      operation: "preview",
      environment: {},
      readSession,
      userRepository: { findUserByEmail },
      evaluationTime: NOW,
      observability: observed.observability,
    });
    expect(gate).toMatchObject({ allowed: false, mode: "off", sessionReadCount: 0,
      reasonCode: "OWNER_DELIVERY_MODE_OFF" });
    expect(readSession).not.toHaveBeenCalled();
    expect(findUserByEmail).not.toHaveBeenCalled();
    expect(observed.read()).toEqual([expect.objectContaining({ name: "kill_switch", mode: "off",
      state: "suspended", reasonCodes: ["OWNER_DELIVERY_MODE_OFF"] })]);
    expect(resolveOwnerDeliveryModeFromEnvironment({ PRAXIS_V2_OWNER_DELIVERY_MODE: "unknown" }).mode)
      .toBe("off");
  });

  it("stores exact immutable revisions and never falls back for exact reads", async () => {
    const repository = createInMemoryOwnerEnrollmentProfileRepository();
    const enrollment = buildOwnerEnrollmentRevision({
      userId: USER.id,
      basedOnRevisionId: null,
      state: "active",
      fixedGoal: "strength",
      permission: "preview_only",
      explicitConsent: true,
      acceptedVersions: ["owner-delivery@1.0.0"],
      provenance: { source: "owner_confirmation", sourceRefs: ["consent:1"] },
      createdAt: NOW,
    });
    expect(await repository.appendEnrollment(enrollment)).toBe("appended");
    expect(await repository.appendEnrollment(enrollment)).toBe("exact_retry");
    expect(await repository.readEnrollmentExact(USER.id, enrollment.enrollmentId, "missing")).toBeNull();

    const profile = buildOwnerProfileRevision({
      userId: USER.id,
      basedOnRevisionId: null,
      primaryGoal: "strength",
      trainingMode: "develop",
      secondaryGoal: null,
      daysPerWeek: 1,
      sessionOpportunities: [{ opportunityId: "opportunity-1", order: 1, minutes: 45 }],
      sessionMinutes: { status: "known", minutes: 45 },
      equipmentCapabilitySnapshot: { environment: "home", capabilityIds: ["bodyweight"], confirmed: true,
        sourceRevision: "equipment:1" },
      coarseExperience: "beginner",
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
    expect(await repository.appendProfile(profile)).toBe("appended");
    expect(await repository.readCurrentProfile(USER.id)).toEqual(profile);
    expect(await repository.readProfileExact(USER.id, profile.profileId, "missing")).toBeNull();
  });

  it("projects restricted proposed facts without persisting a raw snapshot", () => {
    const facts = proposeOwnerImportsFromTrainingSnapshot({
      snapshot: {
        questionnaire: { daysPerWeek: 3, equipment: ["gym"], painAreas: ["shoulder"],
          experience: "intermediate", sessionMinutes: 60, exactLoad: 40 },
        assessment: { observations: [{ id: "pose-shoulder-asymmetry", confidence: "high" }],
          priorities: ["pose-shoulder-asymmetry"] },
        meta: { sessionUpdatedAtById: { "legacy-session-1": NOW } },
      },
      sourceRevision: "product-snapshot:synthetic-1",
    });
    expect(facts.map((fact) => fact.field)).toEqual(expect.arrayContaining([
      "days", "top_level_equipment", "pain_region", "experience", "assessment_reference",
      "continuity_reference",
    ]));
    expect(JSON.stringify(facts)).not.toContain("exactLoad");
    expect(JSON.stringify(facts)).not.toContain("sessionMinutes");
    expect(facts.find((fact) => fact.field === "assessment_reference")?.structuredValue)
      .toBe("assessment:observation:pose-shoulder-asymmetry");
  });

  it("locks the isolated enrollment/profile migration and contains no email column", () => {
    const migrations = loadControlledOwnerDeliveryMigrations();
    expect(migrations).toHaveLength(2);
    expect(migrations[0]?.checksum).toBe(
      "40479d0a27dbe0c706608b15b9d4d7624fc0daba609cc4fdd5f4adf9ab8d953a",
    );
    expect(migrations[0]?.sql).toContain("owner_v2_enrollments");
    expect(migrations[0]?.sql).toContain("owner_v2_profiles");
    expect(migrations[0]?.sql).not.toMatch(/email/i);
    expect(migrations[1]?.checksum).toBe(
      "3f7ff3e2dee0f793b646e63109405d75ed2d7310e8d1ad4bb798741b90fbb22b",
    );
    expect(migrations[1]?.sql).toContain("owner_v2_program_envelopes");
    expect(migrations[1]?.sql).not.toMatch(/email/i);
  });
});
