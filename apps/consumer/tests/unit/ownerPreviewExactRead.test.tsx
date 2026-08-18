import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { JSDOM } from "jsdom";
import type { ControlledOwnerV2ProgramPreview } from "@praxis/training-engine-v2";

const OWNER_ID = "owner-page-fixture";
const OTHER_OWNER_ID = "other-owner-fixture";
const PREVIEW_ID = "owner-v2-preview:8dda19cf38065a53";
const ENCODED_PREVIEW_ID = "owner-v2-preview%3A8dda19cf38065a53";
const PROFILE_REVISION_ID = "owner-profile-revision:3333333333333333";
const WEEK_OBJECTIVE_IDS = [
  `week-v1_1:objective:owner-strength-responsibility:knee_dominant_lower_body:${PROFILE_REVISION_ID}`,
  `week-v1_1:objective:owner-strength-responsibility:hinge_lower_body:${PROFILE_REVISION_ID}`,
  `week-v1_1:objective:owner-strength-responsibility:upper_body_push:${PROFILE_REVISION_ID}`,
  `week-v1_1:objective:owner-strength-responsibility:upper_body_pull:${PROFILE_REVISION_ID}`,
] as const;
const REASON_CODES = ["UPSTREAM_ASSIGNMENT_PRESERVED", "ONE_ASSIGNMENT_ONE_SOURCE_EVENT",
  "ORDERED_BLOCKS_ARE_CANONICAL", "NO_AUTOMATIC_PROGRESSION", "FINAL_DURATION_REQUIRES_SEQUENCING"] as const;

const assignment = (index: number, exerciseId: string) => ({
  assignmentId: `assignment-${index}`,
  exerciseId,
  realizationId: `${exerciseId}:fixture`,
  sourceEventId: `source-event-${index}`,
  prescriptionRevisionId: `prescription-revision:${index.toString().padStart(16, "7")}`,
  sets: 2,
  reps: "5-10",
  tempo: "natural tempo",
  restSeconds: 180,
  effort: "2-3 reps in reserve",
  doseBlocks: [{ blockId: `block-preparation-${index}`, order: 0, purpose: "preparatory_acclimation" as const,
    volume: "1 set", target: "4-8 reps", rest: "60-180 seconds before strength work",
    effort: "Quality remains the limiting standard.", tempo: "Controlled tempo",
    load: "Choose load to match the effort target", calibrationRequired: true },
  { blockId: `block-development-${index}`, order: 1, purpose: "developmental_work" as const,
    volume: "2 sets", target: "5-10 reps", rest: "90-180 seconds between strength sets",
    effort: "2-3 reps in reserve", tempo: "Natural",
    load: "Choose load to match the effort target", calibrationRequired: true }],
  equipmentRequirementIds: ["dumbbells", "adjustable_bench"],
  reasonCodes: REASON_CODES,
});

const harness = vi.hoisted(() => {
  const previews = new Map<string, unknown>();
  return {
    allowed: true,
    mode: "preview" as "off" | "preview",
    userId: "owner-page-fixture" as string | null,
    notFound: new Error("NEXT_NOT_FOUND"),
    previews,
    rows: {
      enrollments: [{ userId: "owner-page-fixture", state: "active" }],
      profiles: [{ userId: "owner-page-fixture", reviewState: "confirmed" }],
      applications: [] as unknown[],
    },
    readPreviewExact: vi.fn(async (userId: string, previewId: string) =>
      previews.get(`${userId}\u0000${previewId}`) ?? null),
  };
});

vi.mock("next/headers", () => ({
  headers: async () => new Headers({ cookie: "bac_user=fixture-session" }),
}));

vi.mock("next/navigation", () => ({
  notFound: () => { throw harness.notFound; },
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@praxis/engine/controlled-owner-delivery", () => ({
  withControlledOwnerRepositories: async (operation: (repositories: {
    delivery: { readPreviewExact: typeof harness.readPreviewExact };
  }) => unknown) => operation({ delivery: { readPreviewExact: harness.readPreviewExact } }),
}));

vi.mock("@/server/controlledOwnerDelivery", async () => {
  const { NextResponse } = await import("next/server");
  const gate = () => ({
    allowed: harness.allowed,
    mode: harness.mode,
    userId: harness.allowed ? harness.userId : null,
  });
  return {
    ownerCsrfTokens: () => ({}),
    ownerJson: (payload: unknown, status = 200) => NextResponse.json(payload, { status }),
    readOwnerGate: async () => gate(),
    requireOwnerPage: async () => {
      const result = gate();
      if (!result.allowed || !result.userId) throw harness.notFound;
      return result;
    },
  };
});

import OwnerPreviewPage from "@/app/account/praxis-v2/preview/[previewId]/page";
import { GET as readPreviewApi } from "@/app/api/training/v2-owner/preview/[previewId]/route";
import { normalizeOwnerDynamicRecordId } from "@/server/ownerDynamicRecordId";

const PREVIEW: ControlledOwnerV2ProgramPreview = {
  contract: { contractId: "CONTROLLED_OWNER_V2_PROGRAM_PREVIEW", contractVersion: "1.0.0" },
  previewId: PREVIEW_ID,
  userId: OWNER_ID,
  generationCommandId: "owner-v2-generation-command:1111111111111111",
  profileId: "owner-profile:2222222222222222",
  profileRevisionId: PROFILE_REVISION_ID,
  sourceProductSnapshotId: "product-snapshot:4444444444444444",
  sourceProductRevisionId: "product-revision:5555555555555555",
  activeLegacyProgramRevisionId: "legacy-program:fixture",
  engineVersion: "training-engine-v2@fixture",
  policyVersions: ["controlled-owner-policy@fixture"],
  completeProgramSnapshot: [],
  productProjection: {
    projectionContract: { contractId: "CONTROLLED_OWNER_PRODUCT_PROJECTION", contractVersion: "1.0.0" },
    goal: "strength",
    mode: "develop",
    weekObjectiveIds: WEEK_OBJECTIVE_IDS,
    sessions: [{
      sessionId: "owner-session:6666666666666666",
      opportunityId: "owner-opportunity-1",
      purpose: "strength_development",
      durationStatus: "known",
      durationMinutes: 90,
      exerciseAssignments: [assignment(1, "dumbbell-bench-press")],
      practiceModes: ["full", "lighter", "recovery"],
    }, {
      sessionId: "owner-session:7777777777777777",
      opportunityId: "owner-opportunity-2",
      purpose: "strength_development",
      durationStatus: "known",
      durationMinutes: 90,
      exerciseAssignments: [assignment(2, "chest-supported-dumbbell-row")],
      practiceModes: ["full", "lighter", "recovery"],
    }],
    unresolvedFacts: ["OWNER_LOAD_SELECTION_PENDING"],
    safetyState: "clear",
    engineVersion: "training-engine-v2@fixture",
    policyVersions: ["controlled-owner-policy@fixture"],
    authoritative: false,
    projectionFingerprint: "projection-fingerprint-fixture",
  },
  unresolvedFacts: ["OWNER_LOAD_SELECTION_PENDING"],
  readinessStatus: "ready_for_approval",
  safetyState: "clear",
  createdAt: "2026-08-17T16:00:00.000Z",
  counterfactual: true,
  applied: false,
  stale: false,
  previewFingerprint: "preview-fingerprint-fixture",
};

const key = (userId: string, previewId: string) => `${userId}\u0000${previewId}`;
const page = (previewId: string) => OwnerPreviewPage({ params: Promise.resolve({ previewId }) });
const api = (previewId: string) => readPreviewApi(
  new Request(`https://praxis.test/api/training/v2-owner/preview/${encodeURIComponent(previewId)}`),
  { params: Promise.resolve({ previewId }) }
);
const snapshotRows = () => JSON.stringify({
  previews: [...harness.previews.entries()],
  enrollments: harness.rows.enrollments,
  profiles: harness.rows.profiles,
  applications: harness.rows.applications,
});

describe("owner preview exact page and API reads", () => {
  beforeEach(() => {
    harness.allowed = true;
    harness.mode = "preview";
    harness.userId = OWNER_ID;
    harness.previews.clear();
    harness.previews.set(key(OWNER_ID, PREVIEW_ID), PREVIEW);
    harness.rows.enrollments = [{ userId: OWNER_ID, state: "active" }];
    harness.rows.profiles = [{ userId: OWNER_ID, reviewState: "confirmed" }];
    harness.rows.applications = [];
    harness.readPreviewExact.mockClear();
  });

  it("normalizes encoded and raw canonical IDs exactly once and fails malformed values closed", () => {
    expect(normalizeOwnerDynamicRecordId(ENCODED_PREVIEW_ID, "owner-v2-preview")).toBe(PREVIEW_ID);
    expect(normalizeOwnerDynamicRecordId(PREVIEW_ID, "owner-v2-preview")).toBe(PREVIEW_ID);
    expect(normalizeOwnerDynamicRecordId("owner-v2-preview%253A8dda19cf38065a53",
      "owner-v2-preview")).toBeNull();
    expect(normalizeOwnerDynamicRecordId("owner-v2-preview%E0%A4%A", "owner-v2-preview")).toBeNull();
  });

  it("renders an encoded colon preview through the canonical exact persisted ID", async () => {
    const output = renderToStaticMarkup(await page(ENCODED_PREVIEW_ID));
    const document = new JSDOM(output).window.document;

    expect(harness.readPreviewExact).toHaveBeenCalledWith(OWNER_ID, PREVIEW_ID);
    expect(output).toContain("Ready for approval");
    expect(output).toContain("Week responsibilities");
    expect(document.querySelector("[data-testid='owner-preview-responsibilities']")?.textContent).toContain(
      "Knee-dominant lower body");
    expect(document.querySelector("[data-testid='owner-preview-responsibilities']")?.textContent).toContain(
      "Hinge lower body");
    expect(document.querySelector("[data-testid='owner-preview-responsibilities']")?.textContent).toContain(
      "Upper-body push");
    expect(document.querySelector("[data-testid='owner-preview-responsibilities']")?.textContent).toContain(
      "Upper-body pull");
    expect(output).toContain("Sessions");
    expect(output).toContain("Session 1");
    expect(output).toContain("Session 2");
    expect(output.match(/Strength development · 90 minutes/g)).toHaveLength(2);
    expect(output).toContain("Dumbbell bench press");
    expect(output).toContain("Preparatory acclimation block");
    expect(output).toContain("1 set");
    expect(output).toContain("60-180 seconds before strength work");
    expect(output).toContain("Developmental work block");
    expect(output).toContain("2 sets");
    expect(output).toContain("5-10 reps");
    expect(output).toContain("90-180 seconds between strength sets");
    expect(output).toContain("2-3 reps in reserve");
    expect(output).toContain("Choose load to match the effort target");
    expect(output).not.toContain("&quot;kind&quot;");
    expect(output).toContain("Owner load selection pending");
    expect(output).toContain("Technical details");
    expect(output).toContain("training-engine-v2@fixture");
    expect(output).toContain("Your legacy Program is unchanged.");
    expect(output).toContain("Application is unavailable in preview mode.");
    expect(document.querySelectorAll("[data-testid='owner-preview-dose-block']")).toHaveLength(4);
    expect(document.querySelectorAll("[data-testid='owner-preview-session-options']")).toHaveLength(2);
  });

  it("keeps raw reason codes out of the primary reading flow and available in closed disclosures", async () => {
    const document = new JSDOM(renderToStaticMarkup(await page(PREVIEW_ID))).window.document;
    const primaryReadingFlow = document.querySelector("[data-testid='owner-preview-presentation']")!.cloneNode(true) as Element;
    primaryReadingFlow.querySelectorAll("details").forEach((details) => details.remove());

    for (const reason of REASON_CODES) expect(primaryReadingFlow.textContent).not.toContain(reason);
    const traces = [...document.querySelectorAll("[data-testid='owner-preview-prescription-trace']")];
    expect(traces).toHaveLength(2);
    expect(traces.every((trace) => !trace.hasAttribute("open"))).toBe(true);
    for (const trace of traces) for (const reason of REASON_CODES) expect(trace.textContent).toContain(reason);
    const technical = document.querySelector("[data-testid='owner-preview-technical-details']")!;
    expect(technical.hasAttribute("open")).toBe(false);
    for (const objectiveId of WEEK_OBJECTIVE_IDS) expect(technical.textContent).toContain(objectiveId);
  });

  it("falls back to an unknown canonical Week objective without guessing a label", async () => {
    const unknownObjectiveId = "week-v1_1:objective:future-owner-responsibility:unknown_identity";
    const unknownPreview = { ...PREVIEW, productProjection: { ...PREVIEW.productProjection,
      weekObjectiveIds: [...WEEK_OBJECTIVE_IDS, unknownObjectiveId] } };
    harness.previews.set(key(OWNER_ID, PREVIEW_ID), unknownPreview);

    const document = new JSDOM(renderToStaticMarkup(await page(PREVIEW_ID))).window.document;
    const responsibilities = document.querySelector("[data-testid='owner-preview-responsibilities']")!;
    expect(responsibilities.textContent).toContain(unknownObjectiveId);
    expect(responsibilities.textContent).toContain("Canonical objective");
  });

  it("preserves raw canonical preview page behavior", async () => {
    const output = renderToStaticMarkup(await page(PREVIEW_ID));

    expect(output).toContain("Get stronger");
    expect(harness.readPreviewExact).toHaveBeenCalledWith(OWNER_ID, PREVIEW_ID);
  });

  it("keeps API exact reads unchanged for decoded and encoded parameter forms", async () => {
    const rawResponse = await api(PREVIEW_ID);
    const encodedResponse = await api(ENCODED_PREVIEW_ID);

    expect(rawResponse.status).toBe(200);
    expect(encodedResponse.status).toBe(200);
    expect(await rawResponse.json()).toEqual({ ok: true, preview: PREVIEW });
    expect(await encodedResponse.json()).toEqual({ ok: true, preview: PREVIEW });
    expect(harness.readPreviewExact).toHaveBeenNthCalledWith(1, OWNER_ID, PREVIEW_ID);
    expect(harness.readPreviewExact).toHaveBeenNthCalledWith(2, OWNER_ID, PREVIEW_ID);
  });

  it("returns private 404s for wrong IDs and cross-user reads", async () => {
    const wrongId = "owner-v2-preview:ffffffffffffffff";
    await expect(page(wrongId)).rejects.toBe(harness.notFound);
    expect((await api(wrongId)).status).toBe(404);

    harness.userId = OTHER_OWNER_ID;
    await expect(page(PREVIEW_ID)).rejects.toBe(harness.notFound);
    const crossUser = await api(PREVIEW_ID);
    expect(crossUser.status).toBe(404);
    expect(await crossUser.json()).toEqual({ ok: false,
      error: { code: "NOT_FOUND", message: "Not Found" } });
  });

  it("keeps ineligible and off owners behind private 404s", async () => {
    harness.allowed = false;
    harness.mode = "off";
    harness.userId = null;

    await expect(page(PREVIEW_ID)).rejects.toBe(harness.notFound);
    expect((await api(PREVIEW_ID)).status).toBe(404);
    expect(harness.readPreviewExact).not.toHaveBeenCalled();
  });

  it("fails malformed encoding closed without repository access or a 500", async () => {
    const malformed = "owner-v2-preview%E0%A4%A";

    await expect(page(malformed)).rejects.toBe(harness.notFound);
    const response = await api(malformed);
    expect(response.status).toBe(404);
    expect(harness.readPreviewExact).not.toHaveBeenCalled();
  });

  it("renders without mutating preview, enrollment, profile, or application data", async () => {
    const before = snapshotRows();

    renderToStaticMarkup(await page(ENCODED_PREVIEW_ID));

    expect(snapshotRows()).toBe(before);
    expect(harness.rows.applications).toEqual([]);
  });
});
