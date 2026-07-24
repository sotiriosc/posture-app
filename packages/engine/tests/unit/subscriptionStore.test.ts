import { afterEach, describe, expect, test, vi } from "vitest";
import {
  SUBSCRIPTION_STORAGE_KEY,
  clearLocalSubscription,
  deriveLocalSubscriptionStatus,
  getLocalSubscription,
  hasLocalProAccess,
  saveLocalSubscription,
} from "@/lib/subscriptionStore";

/**
 * Phase 6f, Commit 3 (amended) — status-model subscription persistence.
 * Same fake-localStorage pattern as accountIsolation.test.ts.
 */
const installLocalStorageStub = () => {
  const store = new Map<string, string>();
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
  return store;
};

describe("deriveLocalSubscriptionStatus", () => {
  test("a free plan maps to canceled with no period end", () => {
    const record = deriveLocalSubscriptionStatus({ plan: "free" });
    expect(record.status).toBe("canceled");
    expect(record.currentPeriodEnd).toBeNull();
  });

  test("a pro plan with no scheduled cancellation maps to active", () => {
    const record = deriveLocalSubscriptionStatus({
      plan: "pro",
      stripeCancelAtPeriodEnd: false,
    });
    expect(record.status).toBe("active");
    expect(record.currentPeriodEnd).toBeNull();
  });

  test("a pro plan scheduled to cancel maps to canceled_at_period_end with the period end carried over", () => {
    const record = deriveLocalSubscriptionStatus({
      plan: "pro",
      stripeCancelAtPeriodEnd: true,
      stripeCurrentPeriodEnd: "2026-08-01T00:00:00.000Z",
    });
    expect(record.status).toBe("canceled_at_period_end");
    expect(record.currentPeriodEnd).toBe("2026-08-01T00:00:00.000Z");
  });
});

describe("hasLocalProAccess", () => {
  test("active grants access regardless of any timestamp (status model, not expiry-date)", () => {
    expect(
      hasLocalProAccess(
        { status: "active", currentPeriodEnd: null, updatedAt: "2020-01-01T00:00:00.000Z" },
        "2030-01-01T00:00:00.000Z"
      )
    ).toBe(true);
  });

  test("canceled_at_period_end grants access until the period end, then lapses", () => {
    const record = {
      status: "canceled_at_period_end" as const,
      currentPeriodEnd: "2026-08-01T00:00:00.000Z",
      updatedAt: "2026-07-01T00:00:00.000Z",
    };
    expect(hasLocalProAccess(record, "2026-07-15T00:00:00.000Z")).toBe(true);
    expect(hasLocalProAccess(record, "2026-08-02T00:00:00.000Z")).toBe(false);
  });

  test("canceled never grants access", () => {
    expect(
      hasLocalProAccess({
        status: "canceled",
        currentPeriodEnd: null,
        updatedAt: "2026-07-01T00:00:00.000Z",
      })
    ).toBe(false);
  });

  test("no record at all grants no access", () => {
    expect(hasLocalProAccess(null)).toBe(false);
  });
});

describe("local subscription persistence", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("save/get round-trips a record", () => {
    installLocalStorageStub();
    saveLocalSubscription({
      status: "active",
      currentPeriodEnd: null,
      updatedAt: "2026-07-24T00:00:00.000Z",
    });
    expect(getLocalSubscription()).toEqual({
      status: "active",
      currentPeriodEnd: null,
      updatedAt: "2026-07-24T00:00:00.000Z",
    });
  });

  test("clear removes the record", () => {
    const store = installLocalStorageStub();
    saveLocalSubscription({
      status: "active",
      currentPeriodEnd: null,
      updatedAt: "2026-07-24T00:00:00.000Z",
    });
    expect(store.has(SUBSCRIPTION_STORAGE_KEY)).toBe(true);
    clearLocalSubscription();
    expect(getLocalSubscription()).toBeNull();
  });

  test("malformed JSON is treated as no record rather than throwing", () => {
    const store = installLocalStorageStub();
    store.set(SUBSCRIPTION_STORAGE_KEY, "{not json");
    expect(getLocalSubscription()).toBeNull();
  });

  test("an unrecognized status is treated as no record", () => {
    const store = installLocalStorageStub();
    store.set(
      SUBSCRIPTION_STORAGE_KEY,
      JSON.stringify({ status: "trialing", currentPeriodEnd: null, updatedAt: "x" })
    );
    expect(getLocalSubscription()).toBeNull();
  });
});
