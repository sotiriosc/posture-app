import { afterEach, describe, expect, it, vi } from "vitest";
import { buildControlledProductShadowClientTrigger,
  notifyControlledProductShadowAfterSuccessfulSync } from
  "../../src/controlledProductShadow/triggerClient";
import { productShadowSnapshot, SHADOW_TIME } from "../helpers/controlledProductShadowFixtures";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("controlled Product shadow minimized client trigger", () => {
  it("is deterministic and contains references rather than Product payloads", () => {
    const snapshot = productShadowSnapshot();
    const trigger = buildControlledProductShadowClientTrigger({ patch: snapshot, operationalTime: SHADOW_TIME });
    expect(trigger).toMatchObject({ triggerKind: "product_mixed_state_changed", appSurface: "server_resolved",
      anchorProgramId: "legacy-program-1", anchorSessionId: null });
    expect(Object.keys(trigger).sort()).toEqual(["anchorLogIds", "anchorProgramId", "anchorSessionId", "appSurface",
      "changedEntityCategories", "changedEntityIds", "clientObservedOperationalTime", "clientOperationId",
      "productPatchSemanticFingerprint", "provenance", "triggerContract", "triggerKind"]);
    expect(trigger).toEqual(buildControlledProductShadowClientTrigger({ patch: snapshot,
      operationalTime: SHADOW_TIME }));
    const body = JSON.stringify(trigger);
    for (const forbidden of ["painAreas", "Lower back", "Day 1", "dead-bug", "questionnaireSignature",
      "programs", "sessions", "exerciseLogs"]) expect(body).not.toContain(forbidden);
  });

  it("makes no request while transport is default-off", () => {
    vi.stubEnv("NEXT_PUBLIC_PRAXIS_V2_SHADOW_TRIGGER_ENABLED", "false");
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    notifyControlledProductShadowAfterSuccessfulSync({ patch: productShadowSnapshot(), operationalTime: SHADOW_TIME });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("uses one nonblocking, no-store, non-queued request when explicitly transport-enabled", () => {
    vi.stubEnv("NEXT_PUBLIC_PRAXIS_V2_SHADOW_TRIGGER_ENABLED", "true");
    const fetch = vi.fn(() => Promise.reject(new Error("isolated shadow failure")));
    vi.stubGlobal("fetch", fetch);
    expect(() => notifyControlledProductShadowAfterSuccessfulSync({ patch: productShadowSnapshot(),
      operationalTime: SHADOW_TIME })).not.toThrow();
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith("/api/training/v2-shadow", expect.objectContaining({ method: "POST",
      cache: "no-store", credentials: "include", keepalive: true }));
  });
});
