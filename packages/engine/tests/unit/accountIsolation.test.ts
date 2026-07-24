import { afterEach, describe, expect, test, vi } from "vitest";
import {
  LOCAL_OWNER_KEY,
  adoptLocalOwner,
  getStoredLocalOwnerId,
  syncLocalOwner,
} from "@/lib/accountIsolation";
import { getActivePhotoNamespace } from "@/lib/photoStore";

/**
 * Phase 6e, Commit 1 (SR-6e, ED-6e.1) — `syncLocalOwner` is the primitive
 * behind the startup stale-device check and every login/register/logout
 * call site. These tests exercise it directly against a fake
 * localStorage/indexedDB so the account-boundary logic itself (not the
 * browser plumbing, already covered in resetAppData.test.ts) is verified.
 */

const installBrowserStubs = () => {
  const store = new Map<string, string>();
  const deletedDatabases: string[] = [];

  vi.stubGlobal("window", {
    dispatchEvent: vi.fn(),
  });
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
    get length() {
      return store.size;
    },
  });
  vi.stubGlobal("sessionStorage", { clear: vi.fn() });
  vi.stubGlobal("indexedDB", {
    databases: vi.fn(async () => [
      { name: "bodycoach-logs" },
      { name: "bodycoach-drafts" },
      { name: "bodycoach-photos" },
    ]),
    deleteDatabase: vi.fn((name: string) => {
      deletedDatabases.push(name);
      const request = {} as IDBOpenDBRequest;
      queueMicrotask(() => request.onsuccess?.({} as Event));
      return request;
    }),
  });

  return { store, deletedDatabases };
};

describe("syncLocalOwner", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("guest continuity: no owner ever set stays a no-op wipe", async () => {
    const { deletedDatabases } = installBrowserStubs();

    const result = await syncLocalOwner(null);

    expect(result.wiped).toBe(false);
    expect(deletedDatabases).toEqual([]);
    expect(getStoredLocalOwnerId()).toBeNull();
    expect(getActivePhotoNamespace()).toBe("guest");
  });

  test("first sign-in on a fresh device wipes (harmlessly) and remembers the owner", async () => {
    const { deletedDatabases } = installBrowserStubs();

    const result = await syncLocalOwner("user-a");

    expect(result.wiped).toBe(true);
    expect(deletedDatabases).toEqual(
      expect.arrayContaining(["bodycoach-logs", "bodycoach-drafts"])
    );
    expect(deletedDatabases).not.toContain("bodycoach-photos");
    expect(getStoredLocalOwnerId()).toBe("user-a");
    expect(getActivePhotoNamespace()).toBe("user-a");
  });

  test("repeat visits by the same owner never trigger a wipe", async () => {
    const { store } = installBrowserStubs();
    store.set(LOCAL_OWNER_KEY, "user-a");

    const result = await syncLocalOwner("user-a");

    expect(result.wiped).toBe(false);
    expect(getStoredLocalOwnerId()).toBe("user-a");
  });

  test("switching to a different account on the same device wipes non-photo state", async () => {
    const { store, deletedDatabases } = installBrowserStubs();
    store.set(LOCAL_OWNER_KEY, "user-a");
    store.set("app_state_v1", JSON.stringify({ activeProgramId: "user-a-program" }));

    const result = await syncLocalOwner("user-b");

    expect(result.wiped).toBe(true);
    expect(deletedDatabases).toEqual(
      expect.arrayContaining(["bodycoach-logs", "bodycoach-drafts"])
    );
    expect(deletedDatabases).not.toContain("bodycoach-photos");
    // The prior owner's non-photo state is gone; the new owner is remembered.
    expect(store.get("app_state_v1")).toBeUndefined();
    expect(getStoredLocalOwnerId()).toBe("user-b");
    expect(getActivePhotoNamespace()).toBe("user-b");
  });

  test("logout (ownerId null) after a signed-in owner wipes and clears the marker", async () => {
    const { store, deletedDatabases } = installBrowserStubs();
    store.set(LOCAL_OWNER_KEY, "user-a");

    const result = await syncLocalOwner(null);

    expect(result.wiped).toBe(true);
    expect(deletedDatabases).toEqual(
      expect.arrayContaining(["bodycoach-logs", "bodycoach-drafts"])
    );
    expect(getStoredLocalOwnerId()).toBeNull();
    expect(getActivePhotoNamespace()).toBe("guest");
  });
});

describe("adoptLocalOwner", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("records the owner without deleting any database (no wipe)", async () => {
    const { deletedDatabases } = installBrowserStubs();

    adoptLocalOwner("user-a");

    expect(deletedDatabases).toEqual([]);
    expect(getStoredLocalOwnerId()).toBe("user-a");
    expect(getActivePhotoNamespace()).toBe("user-a");
  });

  test("a subsequent syncLocalOwner call for the same id is then a no-op", async () => {
    const { deletedDatabases } = installBrowserStubs();

    // Mirrors dev-seed: wipe deliberately, then adopt the current session's
    // owner so the next page load's startup check doesn't see a mismatch
    // and wipe the just-seeded state a second time.
    adoptLocalOwner("user-a");
    const result = await syncLocalOwner("user-a");

    expect(result.wiped).toBe(false);
    expect(deletedDatabases).toEqual([]);
  });

  test("null adopts guest and clears any prior marker", async () => {
    const { store } = installBrowserStubs();
    store.set(LOCAL_OWNER_KEY, "user-a");

    adoptLocalOwner(null);

    expect(getStoredLocalOwnerId()).toBeNull();
    expect(getActivePhotoNamespace()).toBe("guest");
  });
});
