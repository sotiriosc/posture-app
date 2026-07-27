import { afterEach, describe, expect, test, vi } from "vitest";
import {
  clearAllLocalState,
  clearAllLocalStateExceptPhotos,
  clearPraxisOwnedLocalStorageKeys,
  eraseAllLocalData,
  resetAllAppData,
  resetAppDataKeys,
} from "@/lib/resetAppData";

describe("reset app data", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("destructive reset covers history, drafts, and photos", async () => {
    const removedLocalKeys: string[] = [];
    const deletedDatabases: string[] = [];
    const store: Record<string, string> = {
      app_state_v1: "{}",
      posture_questionnaire: "{}",
      posture_photo_meta: "{}",
      "phase-ready-dismissed:prog:phase-1": "1",
      unrelated_third_party: "keep",
    };

    vi.stubGlobal("window", {});
    vi.stubGlobal("localStorage", {
      get length() {
        return Object.keys(store).length;
      },
      key: (index: number) => Object.keys(store)[index] ?? null,
      getItem: (key: string) => store[key] ?? null,
      removeItem: vi.fn((key: string) => {
        removedLocalKeys.push(key);
        delete store[key];
      }),
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
    });
    vi.stubGlobal("indexedDB", {
      deleteDatabase: vi.fn((name: string) => {
        deletedDatabases.push(name);
        const request = {} as IDBOpenDBRequest;
        queueMicrotask(() => request.onsuccess?.({} as Event));
        return request;
      }),
    });

    await resetAllAppData();

    expect(removedLocalKeys).toEqual(
      expect.arrayContaining([
        "app_state_v1",
        "posture_questionnaire",
        "posture_photo_meta",
        "phase-ready-dismissed:prog:phase-1",
      ])
    );
    expect(removedLocalKeys).not.toContain("unrelated_third_party");
    expect(deletedDatabases).toEqual(
      expect.arrayContaining([
        "bodycoach-logs",
        "bodycoach-drafts",
        "bodycoach-photos",
      ])
    );
  });

  test("clearPraxisOwnedLocalStorageKeys covers prefix-matched future keys", () => {
    const store: Record<string, string> = {
      praxis_future_feature_v1: "1",
      posture_new_draft: "1",
      chrome_extension_junk: "keep",
    };
    vi.stubGlobal("localStorage", {
      get length() {
        return Object.keys(store).length;
      },
      key: (index: number) => Object.keys(store)[index] ?? null,
      removeItem: (key: string) => {
        delete store[key];
      },
    });
    const removed = clearPraxisOwnedLocalStorageKeys();
    expect(removed).toEqual(
      expect.arrayContaining(["praxis_future_feature_v1", "posture_new_draft"])
    );
    expect(store.chrome_extension_junk).toBe("keep");
  });

  test("clearAllLocalState is the logout wipe alias", async () => {
    expect(clearAllLocalState).toBe(clearAllLocalStateExceptPhotos);
  });

  test("published reset key list includes photos", () => {
    expect(resetAppDataKeys().indexedDB).toEqual(
      expect.arrayContaining(["bodycoach-logs", "bodycoach-drafts", "bodycoach-photos"])
    );
  });

  test("erase-all-local-data enumerates every database and clears all storage", async () => {
    const deletedDatabases: string[] = [];
    let cleared = false;

    vi.stubGlobal("window", {});
    vi.stubGlobal("localStorage", {
      length: 5,
      key: vi.fn(),
      getItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(() => {
        cleared = true;
      }),
    });
    vi.stubGlobal("sessionStorage", { clear: vi.fn() });
    vi.stubGlobal("indexedDB", {
      // A stray database not in the hard-coded allowlist — the full wipe must
      // still delete it (this is the leak the fixed list used to miss).
      databases: vi.fn(async () => [
        { name: "bodycoach-logs" },
        { name: "praxis-experimental-store" },
      ]),
      deleteDatabase: vi.fn((name: string) => {
        deletedDatabases.push(name);
        const request = {} as IDBOpenDBRequest;
        queueMicrotask(() => request.onsuccess?.({} as Event));
        return request;
      }),
    });

    await eraseAllLocalData();

    expect(cleared).toBe(true);
    // Both the known and the enumerated-only database are deleted.
    expect(deletedDatabases).toEqual(
      expect.arrayContaining([
        "bodycoach-logs",
        "bodycoach-drafts",
        "bodycoach-photos",
        "praxis-experimental-store",
      ])
    );
  });

  test("clear-local-state-except-photos wipes everything except the photo database (Phase 6e / ED-6e.1)", async () => {
    const deletedDatabases: string[] = [];
    let cleared = false;

    vi.stubGlobal("window", {});
    vi.stubGlobal("localStorage", {
      length: 5,
      key: vi.fn(),
      getItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(() => {
        cleared = true;
      }),
    });
    vi.stubGlobal("sessionStorage", { clear: vi.fn() });
    vi.stubGlobal("indexedDB", {
      databases: vi.fn(async () => [
        { name: "bodycoach-logs" },
        { name: "bodycoach-drafts" },
        { name: "bodycoach-photos" },
        { name: "praxis-experimental-store" },
      ]),
      deleteDatabase: vi.fn((name: string) => {
        deletedDatabases.push(name);
        const request = {} as IDBOpenDBRequest;
        queueMicrotask(() => request.onsuccess?.({} as Event));
        return request;
      }),
    });

    await clearAllLocalStateExceptPhotos();

    expect(cleared).toBe(true);
    expect(deletedDatabases).toEqual(
      expect.arrayContaining(["bodycoach-logs", "bodycoach-drafts", "praxis-experimental-store"])
    );
    // Photos are namespaced, not wiped — this is the whole point of ED-6e.1.
    expect(deletedDatabases).not.toContain("bodycoach-photos");
  });
});
