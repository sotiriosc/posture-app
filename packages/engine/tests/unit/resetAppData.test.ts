import { afterEach, describe, expect, test, vi } from "vitest";
import { resetAllAppData, resetAppDataKeys } from "@/lib/resetAppData";

describe("reset app data", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("destructive reset covers history, drafts, and photos", async () => {
    const removedLocalKeys: string[] = [];
    const deletedDatabases: string[] = [];

    vi.stubGlobal("window", {});
    vi.stubGlobal("localStorage", {
      removeItem: vi.fn((key: string) => {
        removedLocalKeys.push(key);
      }),
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
      ])
    );
    expect(deletedDatabases).toEqual(
      expect.arrayContaining([
        "bodycoach-logs",
        "bodycoach-drafts",
        "bodycoach-photos",
      ])
    );
  });

  test("published reset key list includes photos", () => {
    expect(resetAppDataKeys().indexedDB).toEqual(
      expect.arrayContaining(["bodycoach-logs", "bodycoach-drafts", "bodycoach-photos"])
    );
  });
});
