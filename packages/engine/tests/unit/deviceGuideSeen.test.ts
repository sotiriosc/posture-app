import { afterEach, describe, expect, test, vi } from "vitest";
import {
  GUIDE_SEEN_STORAGE_KEY,
  isDeviceGuideSeen,
  markDeviceGuideSeen,
  readDeviceGuideSeen,
  restoreDeviceGuideSeen,
  snapshotDeviceGuideSeen,
  writeDeviceGuideSeen,
} from "@/lib/deviceGuideSeen";
import { clearAllLocalStateExceptPhotos } from "@/lib/resetAppData";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("deviceGuideSeen", () => {
  const stubStorage = (store: Record<string, string>) => {
    const api = {
      get length() {
        return Object.keys(store).length;
      },
      key: (index: number) => Object.keys(store)[index] ?? null,
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        for (const key of Object.keys(store)) delete store[key];
      },
    };
    vi.stubGlobal("localStorage", api);
    vi.stubGlobal("window", { localStorage: api });
    return api;
  };

  test("marks and reads per-page seen flags", () => {
    const store: Record<string, string> = {};
    stubStorage(store);

    expect(isDeviceGuideSeen("home")).toBe(false);
    markDeviceGuideSeen("home");
    expect(isDeviceGuideSeen("home")).toBe(true);
    expect(isDeviceGuideSeen("results")).toBe(false);
    expect(JSON.parse(store[GUIDE_SEEN_STORAGE_KEY] ?? "{}")).toEqual({
      home: true,
    });
  });

  test("migrates legacy onboarding_state_v1 seenByPage", () => {
    const store: Record<string, string> = {
      onboarding_state_v1: JSON.stringify({
        version: 1,
        seenByPage: { home: true, session: true },
        signupWalkthroughSeen: true,
      }),
    };
    stubStorage(store);

    expect(readDeviceGuideSeen()).toEqual({ home: true, session: true });
    expect(store[GUIDE_SEEN_STORAGE_KEY]).toBeTruthy();
  });

  test("account wipe preserves praxis_guide_seen", async () => {
    const store: Record<string, string> = {
      [GUIDE_SEEN_STORAGE_KEY]: JSON.stringify({ results: true }),
      app_state_v1: "wipe-me",
    };
    stubStorage(store);
    vi.stubGlobal("sessionStorage", { clear: vi.fn() });
    vi.stubGlobal("indexedDB", {
      databases: vi.fn(async () => [{ name: "bodycoach-logs" }]),
      deleteDatabase: vi.fn(() => {
        const request = {} as IDBOpenDBRequest;
        queueMicrotask(() => request.onsuccess?.({} as Event));
        return request;
      }),
    });

    const snap = snapshotDeviceGuideSeen();
    expect(snap).toContain("results");
    await clearAllLocalStateExceptPhotos();
    expect(store.app_state_v1).toBeUndefined();
    expect(JSON.parse(store[GUIDE_SEEN_STORAGE_KEY] ?? "{}")).toEqual({
      results: true,
    });
    restoreDeviceGuideSeen(null); // no-op
    writeDeviceGuideSeen({ home: true });
    expect(isDeviceGuideSeen("home")).toBe(true);
  });
});
