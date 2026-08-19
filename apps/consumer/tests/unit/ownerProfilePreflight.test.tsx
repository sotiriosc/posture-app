import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { JSDOM } from "jsdom";

const harness = vi.hoisted(() => ({
  userId: "owner-profile-preflight-user",
  now: "2026-08-18T12:00:00.000Z",
  currentProfile: null as unknown,
  currentEnrollment: null as unknown,
  appendedProfiles: [] as unknown[],
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock("@praxis/engine/controlled-owner-delivery", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@praxis/engine/controlled-owner-delivery")>();
  return { ...actual,
    withControlledOwnerRepositories: async (operation: (repositories: { enrollmentProfiles: {
      readCurrentProfile: () => Promise<unknown>;
      readCurrentEnrollment: () => Promise<unknown>;
      appendProfile: (profile: unknown) => Promise<"appended">;
    } }) => unknown) => operation({ enrollmentProfiles: {
      readCurrentProfile: async () => harness.currentProfile,
      readCurrentEnrollment: async () => harness.currentEnrollment,
      appendProfile: async (profile: unknown) => {
        harness.appendedProfiles.push(profile); harness.currentProfile = profile; return "appended" as const;
      },
    } }),
  };
});

vi.mock("@/server/controlledOwnerDelivery", async () => {
  const { NextResponse } = await import("next/server");
  const gate = { allowed: true, mode: "preview" as const, userId: harness.userId,
    reasonCode: "OWNER_ELIGIBLE", sessionReadCount: 1, databaseWriteCount: 0 };
  return {
    authorizeOwnerRead: async () => ({ allowed: true, gate, userId: harness.userId,
      evaluatedAt: harness.now }),
    authorizeOwnerMutation: async () => ({ allowed: true, gate, userId: harness.userId,
      evaluatedAt: harness.now }),
    loadOwnerProductRuntimeContext: async () => ({ snapshot: { questionnaire: {} },
      sourceProductSnapshotId: "product-snapshot:preflight",
      sourceProductRevisionId: "product-revision:preflight",
      activeLegacyProgramRevisionId: "legacy-program:unchanged" }),
    OWNER_ENGINE_VERSION: "training-engine-v2@controlled-owner-delivery-1.0.0",
    OWNER_POLICY_VERSIONS: ["owner-preflight-policy@1.0.0"],
    ownerJson: (payload: unknown, status = 200) => NextResponse.json(payload, { status }),
    rejectsIdentityFields: () => false,
  };
});

import OwnerProfileClient from "@/app/account/praxis-v2/OwnerProfileClient";
import { GET, POST } from "@/app/api/training/v2-owner/preflight/route";
import {
  buildOwnerEnrollmentRevision,
  buildOwnerProfileRevision,
  type OwnerProfilePreflight,
} from "@praxis/training-engine-v2";

function records() {
  const enrollment = buildOwnerEnrollmentRevision({ userId: harness.userId, basedOnRevisionId: null,
    state: "active", fixedGoal: "strength", permission: "preview_only", explicitConsent: true,
    acceptedVersions: ["controlled-owner-delivery@1.0.0"],
    provenance: { source: "owner_confirmation", sourceRefs: ["test"] }, createdAt: harness.now });
  const profile = buildOwnerProfileRevision({ userId: harness.userId, basedOnRevisionId: null,
    primaryGoal: "strength", trainingMode: "develop", secondaryGoal: null, daysPerWeek: 5,
    sessionOpportunities: Array.from({ length: 5 }, (_, index) => ({
      opportunityId: `owner-opportunity-${index + 1}`, order: index + 1, minutes: 90,
    })), sessionMinutes: { status: "known", minutes: 90 }, equipmentCapabilitySnapshot: {
      environment: "commercial_gym", capabilityIds: ["bodyweight", "dumbbells", "adjustable_bench"],
      confirmed: true, sourceRevision: "owner-equipment:preflight" }, coarseExperience: "advanced",
    familiarity: [], painContext: { regionIds: [], limitationIds: [], confirmed: true,
      diagnosticClaimCount: 0 }, assessmentReferences: [], trainingSafety: "clear", continuityReferences: [],
    evaluationTime: harness.now, provenance: { source: "owner_confirmation", sourceRefs: ["test"] },
    reviewState: "confirmed", createdAt: harness.now });
  return { enrollment, profile };
}

describe("controlled owner profile preflight presentation and revision route", () => {
  beforeEach(() => {
    const current = records();
    harness.currentEnrollment = current.enrollment;
    harness.currentProfile = current.profile;
    harness.appendedProfiles = [];
  });

  it("renders human wording, semantic answers, hidden technical IDs, and no broad equipment inventory", async () => {
    const read = await GET();
    expect(read.status).toBe(200);
    const payload = await read.json() as { readonly preflight: OwnerProfilePreflight };
    const document = new JSDOM(renderToStaticMarkup(<OwnerProfileClient
      profile={harness.currentProfile as never} proposedFacts={[]} preflight={payload.preflight}
      csrf={{ enrollment: "csrf", profile: "csrf", preview: "csrf" }} canApply={false} />)).window.document;

    expect(document.body.textContent).toContain(
      "Can you perform a hip hinge with a comfortable, controlled trunk position?");
    expect(document.body.textContent).toContain("Hinge and hip-extension strength");
    expect(document.body.textContent).toContain("Required before preview");
    const review = [...document.querySelectorAll("fieldset")].find((entry) =>
      entry.textContent?.includes("hip hinge"))!;
    expect(review.querySelectorAll('input[type="radio"]')).toHaveLength(4);
    expect([...review.querySelectorAll("label")].map((entry) => entry.textContent?.trim())).toEqual([
      "Yes, confirmed", "No, unavailable", "Not sure", "Not yet reviewed",
    ]);
    const technical = review.querySelector("details")!;
    expect(technical.open).toBe(false);
    expect(technical.textContent).toContain("hinge-control");
    expect(review.querySelector("p")?.textContent).not.toContain("hinge-control");
    expect(document.body.textContent).not.toContain("selectorized machines");
    expect(document.querySelectorAll('input[type="checkbox"]')).toHaveLength(4);
    const generate = [...document.querySelectorAll("button")].find((entry) =>
      entry.textContent === "Generate preview") as HTMLButtonElement;
    expect(generate.disabled).toBe(true);
  });

  it("appends an immutable answer revision and rejects replay against the superseded question source", async () => {
    const read = await GET();
    const first = (await read.json() as { readonly preflight: OwnerProfilePreflight }).preflight;
    const question = first.questions[0]!;
    const request = () => new Request("https://praxis.test/api/training/v2-owner/preflight", {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ answers: [{
        questionId: question.questionId, questionRevisionId: question.questionRevisionId, answer: "yes",
      }] }),
    });

    const written = await POST(request());
    expect(written.status).toBe(200);
    expect(harness.appendedProfiles).toHaveLength(1);
    expect(harness.currentProfile).toMatchObject({ basedOnRevisionId: first.sourceProfileRevisionId,
      prerequisiteConfirmations: [{ prerequisiteId: "hinge-control", answer: "yes",
        confirmationTime: harness.now, provenance: { source: "owner_confirmation" } }] });

    const stale = await POST(request());
    expect(stale.status).toBe(409);
    expect(await stale.json()).toMatchObject({ error: { code: "PREFLIGHT_ANSWERS_REJECTED" } });
    expect(harness.appendedProfiles).toHaveLength(1);
  }, 15_000);

  it("rejects malformed answer payloads without entering profile revision logic", async () => {
    const response = await POST(new Request("https://praxis.test/api/training/v2-owner/preflight", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ answers: [null] }),
    }));

    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ error: { code: "INVALID_PREFLIGHT_ANSWERS" } });
    expect(harness.appendedProfiles).toEqual([]);
  });
});
