import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { JSDOM } from "jsdom";

const harness = vi.hoisted(() => ({
  now: "2026-08-17T14:00:00.000Z",
  userId: "owner-pain-profile-user",
  sourceRevision: "product-revision:pain-profile-1",
  snapshot: {
    questionnaire: { painAreas: ["Lower back"] },
    assessment: { observations: [{ id: "pain-lower-back", confidence: "medium" }],
      priorities: ["pain-lower-back"] },
  },
  currentProfile: null as unknown,
  appendedProfiles: [] as unknown[],
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock("@praxis/engine/controlled-owner-delivery", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@praxis/engine/controlled-owner-delivery")>();
  return {
    ...actual,
    withControlledOwnerRepositories: async (operation: (repositories: {
      enrollmentProfiles: {
        readCurrentProfile: (userId: string) => Promise<unknown>;
        appendProfile: (profile: unknown) => Promise<"appended">;
      };
    }) => unknown) => operation({
      enrollmentProfiles: {
        readCurrentProfile: async () => harness.currentProfile,
        appendProfile: async (profile: unknown) => {
          harness.appendedProfiles.push(profile);
          harness.currentProfile = profile;
          return "appended" as const;
        },
      },
    }),
  };
});

vi.mock("@/server/controlledOwnerDelivery", async () => {
  const { NextResponse } = await import("next/server");
  const gate = { allowed: true, mode: "preview" as const, userId: harness.userId,
    reasonCode: "OWNER_ELIGIBLE", sessionReadCount: 1, databaseWriteCount: 0 };
  return {
    authorizeOwnerRead: async () => ({ allowed: true, gate }),
    authorizeOwnerMutation: async () => ({ allowed: true, gate, userId: harness.userId,
      evaluatedAt: harness.now }),
    loadOwnerProductRuntimeContext: async () => ({ snapshot: harness.snapshot,
      sourceProductRevisionId: harness.sourceRevision }),
    ownerJson: (payload: unknown, status = 200) => NextResponse.json(payload, { status }),
    rejectsIdentityFields: () => false,
  };
});

import OwnerProfileClient from "@/app/account/praxis-v2/OwnerProfileClient";
import { GET, POST } from "@/app/api/training/v2-owner/profile/route";
import { proposeOwnerImportsFromTrainingSnapshot } from "@praxis/engine/controlled-owner-delivery";

const facts = () => proposeOwnerImportsFromTrainingSnapshot({ snapshot: harness.snapshot,
  sourceRevision: harness.sourceRevision });

const request = (painFactIds: readonly string[], daysPerWeek = 2) => new Request(
  "https://praxis.test/api/training/v2-owner/profile",
  { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({
    daysPerWeek,
    sessionMinutes: { status: "known", minutes: 90 },
    equipmentEnvironment: "commercial_gym",
    capabilityIds: ["commercial_gym", "dumbbells", "adjustable_bench"],
    coarseExperience: "advanced",
    painConfirmed: true,
    safetyConfirmed: true,
    assessmentReferences: ["assessment:observation:pain-lower-back"],
    painFactIds,
  }) },
);

describe("controlled owner typed pain profile handoff", () => {
  beforeEach(() => {
    harness.currentProfile = null;
    harness.appendedProfiles = [];
  });

  it("renders a distinct explicit confirmation for each typed Product pain fact", () => {
    const document = new JSDOM(renderToStaticMarkup(<OwnerProfileClient profile={null}
      proposedFacts={facts()} csrf={{ enrollment: "csrf", profile: "csrf", preview: "csrf" }}
      canApply={false} />)).window.document;

    expect(document.body.textContent).toContain("Pain region: Lower back");
    expect(document.body.textContent).toContain("Pain and limitations reviewed");
    expect(document.body.textContent).toContain("Availability and training Safety confirmed");
    const painLabel = [...document.querySelectorAll("label")].find((label) =>
      label.textContent?.includes("Pain region: Lower back"));
    expect((painLabel?.querySelector("input") as HTMLInputElement | null)?.checked).toBe(false);
    expect([...document.querySelectorAll("#owner-days option")].map((option) => option.textContent))
      .toEqual(["2", "3", "4", "5", "6"]);
  });

  it.each([1, 7])("rejects %s available days without persisting a profile", async (days) => {
    const painFact = facts().find((fact) => fact.field === "pain_region")!;
    const response = await POST(request([painFact.factId], days));
    expect(response.status).toBe(400);
    expect(harness.appendedProfiles).toEqual([]);
  });

  it("does not treat generic pain and Safety confirmation as typed pain-fact confirmation", async () => {
    const response = await POST(request([]));

    expect(response.status).toBe(409);
    expect(await response.json()).toMatchObject({ error: { code: "PAIN_FACT_CONFIRMATION_REQUIRED" } });
    expect(harness.appendedProfiles).toEqual([]);
  });

  it("stores and reads the normalized canonical region with typed-fact provenance", async () => {
    const painFact = facts().find((fact) => fact.field === "pain_region")!;
    const response = await POST(request([painFact.factId]));

    expect(response.status).toBe(200);
    expect(harness.currentProfile).toMatchObject({
      daysPerWeek: 2,
      sessionOpportunities: [
        { opportunityId: "owner-opportunity-1", order: 1, minutes: 90 },
        { opportunityId: "owner-opportunity-2", order: 2, minutes: 90 },
      ],
      painContext: { regionIds: ["lumbar_spine"], confirmed: true,
        sourceFactIds: [painFact.factId], sourceRevision: harness.sourceRevision },
      provenance: { sourceRefs: ["owner-account-profile", painFact.factId].sort() },
    });
    const read = await GET();
    expect(read.status).toBe(200);
    expect(await read.json()).toMatchObject({ ok: true, profile: {
      painContext: { regionIds: ["lumbar_spine"], sourceFactIds: [painFact.factId],
        sourceRevision: harness.sourceRevision },
    } });
  });

  it("renders a legacy availability value as reconfirmation-only and disables generation", () => {
    const profile = { daysPerWeek: 1, sessionMinutes: { status: "known", minutes: 90 },
      equipmentCapabilitySnapshot: { environment: "commercial_gym", capabilityIds: ["dumbbells"] },
      coarseExperience: "advanced", painContext: { confirmed: true, sourceFactIds: [] },
      trainingSafety: "clear", assessmentReferences: [] } as never;
    const document = new JSDOM(renderToStaticMarkup(<OwnerProfileClient profile={profile}
      proposedFacts={facts()} csrf={{ enrollment: "csrf", profile: "csrf", preview: "csrf" }}
      canApply={false} />)).window.document;
    expect([...document.querySelectorAll("#owner-days option")].map((option) => option.textContent))
      .toEqual(["1 (reconfirmation required)", "2", "3", "4", "5", "6"]);
    const generate = [...document.querySelectorAll("button")].find((button) =>
      button.textContent === "Generate preview") as HTMLButtonElement;
    expect(generate.disabled).toBe(true);
  });

  it("rejects stale pain-fact IDs without mutating an existing saved profile", async () => {
    const existing = Object.freeze({ profileId: "existing-profile", painContext: Object.freeze({
      regionIds: Object.freeze([]), limitationIds: Object.freeze([]), confirmed: true,
      diagnosticClaimCount: 0 as const,
    }) });
    harness.currentProfile = existing;

    const response = await POST(request(["owner-product-import:stale"]));

    expect(response.status).toBe(409);
    expect(await response.json()).toMatchObject({ error: { code: "PAIN_FACT_CONFIRMATION_REQUIRED" } });
    expect(harness.currentProfile).toBe(existing);
    expect(harness.appendedProfiles).toEqual([]);
  });
});
