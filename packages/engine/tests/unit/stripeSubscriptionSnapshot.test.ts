import { afterEach, describe, expect, test, vi } from "vitest";
import {
  billingPatchFromSnapshot,
  fetchStripeSubscriptionSnapshot,
  stripeSubscriptionToSnapshot,
} from "@/lib/stripeServer";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("stripe subscription snapshot", () => {
  test("maps cancel_at_period_end with current_period_end from subscription retrieve", () => {
    const snapshot = stripeSubscriptionToSnapshot({
      id: "sub_cancel",
      object: "subscription",
      status: "active",
      customer: "cus_UxVptZte1N4w3y",
      cancel_at_period_end: true,
      current_period_end: 1787702400,
      items: { data: [{ price: { id: "price_abc" } }] },
    });
    expect(snapshot.stripeCancelAtPeriodEnd).toBe(true);
    expect(snapshot.stripeCurrentPeriodEnd).toBe("2026-08-26T00:00:00.000Z");
    expect(snapshot.plan).toBe("pro");
  });

  test("falls back to cancel_at when current_period_end is absent", () => {
    const snapshot = stripeSubscriptionToSnapshot({
      id: "sub_cancel",
      status: "active",
      customer: "cus_1",
      cancel_at_period_end: true,
      cancel_at: 1787702400,
    });
    expect(snapshot.stripeCurrentPeriodEnd).toBe("2026-08-26T00:00:00.000Z");
    expect(snapshot.stripeCancelAtPeriodEnd).toBe(true);
  });

  test("reads current_period_end from subscription items (Stripe Basil)", () => {
    const snapshot = stripeSubscriptionToSnapshot({
      id: "sub_basil",
      status: "active",
      customer: "cus_UxVptZte1N4w3y",
      cancel_at_period_end: true,
      // Top-level period fields removed in API 2025-03-31.basil
      items: {
        data: [
          {
            id: "si_1",
            price: { id: "price_1" },
            current_period_end: 1787702400,
          },
        ],
      },
    });
    expect(snapshot.stripeCurrentPeriodEnd).toBe("2026-08-26T00:00:00.000Z");
    expect(snapshot.stripeCancelAtPeriodEnd).toBe(true);
    expect(snapshot.plan).toBe("pro");
  });

  test("maps a Stripe subscription object into a billing patch", () => {
    const snapshot = stripeSubscriptionToSnapshot({
      id: "sub_123",
      object: "subscription",
      status: "active",
      customer: "cus_123",
      cancel_at_period_end: false,
      current_period_end: 1893456000,
      items: { data: [{ price: { id: "price_abc" } }] },
    });
    expect(snapshot.plan).toBe("pro");
    expect(snapshot.stripeSubscriptionId).toBe("sub_123");
    expect(snapshot.stripeCurrentPeriodEnd).toMatch(/^20\d\d-/);
    expect(billingPatchFromSnapshot(snapshot)).toMatchObject({
      plan: "pro",
      stripeCustomerId: "cus_123",
      stripeSubscriptionStatus: "active",
      stripeCancelAtPeriodEnd: false,
      stripePriceId: "price_abc",
    });
  });

  test("fetchStripeSubscriptionSnapshot retrieves by subscription id", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_x";
    process.env.NODE_ENV = "test";
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: "sub_live",
        status: "active",
        customer: "cus_live",
        cancel_at_period_end: true,
        current_period_end: 1893456000,
        items: { data: [{ price: { id: "price_1" } }] },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const snapshot = await fetchStripeSubscriptionSnapshot({
      subscriptionId: "sub_live",
      customerId: "cus_live",
    });
    expect(snapshot?.plan).toBe("pro");
    expect(snapshot?.stripeCancelAtPeriodEnd).toBe(true);
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain("/subscriptions/sub_live");
  });

  test("falls back to customer list and picks the best subscription", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_x";
    process.env.NODE_ENV = "test";
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: { message: "No such subscription" } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [
            {
              id: "sub_old",
              status: "canceled",
              customer: "cus_1",
              cancel_at_period_end: false,
              current_period_end: 1700000000,
            },
            {
              id: "sub_new",
              status: "active",
              customer: "cus_1",
              cancel_at_period_end: false,
              current_period_end: 1893456000,
              items: { data: [{ price: { id: "price_new" } }] },
            },
          ],
        }),
      });
    vi.stubGlobal("fetch", fetchMock);

    const snapshot = await fetchStripeSubscriptionSnapshot({
      subscriptionId: "sub_missing",
      customerId: "cus_1",
    });
    expect(snapshot?.stripeSubscriptionId).toBe("sub_new");
    expect(snapshot?.plan).toBe("pro");
  });
});
