import { afterEach, describe, expect, test, vi } from "vitest";
import {
  formatStripePriceLabel,
  getAnnualPriceId,
  getFoundersPriceIdOverride,
  getMonthlyPriceId,
  getStripeCheckoutPlanAvailability,
  isStripeConfigured,
  parseStripeCheckoutPlan,
  resolveCheckoutPriceId,
  STRIPE_FOUNDERS_LOOKUP_KEY,
} from "@/lib/stripeServer";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("formatStripePriceLabel", () => {
  test("formats monthly USD prices", () => {
    expect(
      formatStripePriceLabel({
        unit_amount: 1999,
        currency: "usd",
        recurring: { interval: "month" },
      })
    ).toBe("$19.99/mo");
  });

  test("formats annual USD prices", () => {
    expect(
      formatStripePriceLabel({
        unit_amount: 19999,
        currency: "usd",
        recurring: { interval: "year" },
      })
    ).toBe("$199.99/yr");
  });
});

describe("stripe checkout plans", () => {
  test("parses known plan ids only", () => {
    expect(parseStripeCheckoutPlan("monthly")).toBe("monthly");
    expect(parseStripeCheckoutPlan("annual")).toBe("annual");
    expect(parseStripeCheckoutPlan("founders")).toBe("founders");
    expect(parseStripeCheckoutPlan("pro")).toBeNull();
    expect(parseStripeCheckoutPlan(undefined)).toBeNull();
  });

  test("monthly prefers STRIPE_PRICE_ID_MONTHLY over legacy STRIPE_PRICE_ID", () => {
    process.env.STRIPE_PRICE_ID_MONTHLY = "price_monthly";
    process.env.STRIPE_PRICE_ID = "price_legacy";
    expect(getMonthlyPriceId()).toBe("price_monthly");
  });

  test("monthly falls back to legacy STRIPE_PRICE_ID", () => {
    delete process.env.STRIPE_PRICE_ID_MONTHLY;
    process.env.STRIPE_PRICE_ID = "price_legacy";
    expect(getMonthlyPriceId()).toBe("price_legacy");
  });

  test("isStripeConfigured requires secret, monthly price, and APP_URL", () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_x";
    process.env.STRIPE_PRICE_ID_MONTHLY = "price_monthly";
    process.env.APP_URL = "https://example.com";
    delete process.env.STRIPE_PRICE_ID_ANNUAL;
    expect(isStripeConfigured()).toBe(true);

    delete process.env.STRIPE_PRICE_ID_MONTHLY;
    delete process.env.STRIPE_PRICE_ID;
    expect(isStripeConfigured()).toBe(false);
  });

  test("plan availability: founders needs secret; annual needs env", () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_x";
    process.env.STRIPE_PRICE_ID_MONTHLY = "price_monthly";
    delete process.env.STRIPE_PRICE_ID_ANNUAL;
    delete process.env.STRIPE_PRICE_ID_FOUNDERS;

    expect(getAnnualPriceId()).toBe("");
    expect(getFoundersPriceIdOverride()).toBe("");
    expect(getStripeCheckoutPlanAvailability()).toEqual({
      monthly: true,
      annual: false,
      founders: true,
    });

    process.env.STRIPE_PRICE_ID_ANNUAL = "price_annual";
    expect(getStripeCheckoutPlanAvailability().annual).toBe(true);
  });

  test("resolveCheckoutPriceId uses founders override when set", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_x";
    process.env.STRIPE_PRICE_ID_FOUNDERS = "price_founders_override";
    await expect(resolveCheckoutPriceId("founders")).resolves.toBe(
      "price_founders_override"
    );
  });

  test("resolveCheckoutPriceId resolves founders via lookup key", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_x";
    process.env.NODE_ENV = "test";
    delete process.env.STRIPE_PRICE_ID_FOUNDERS;

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [{ id: "price_from_lookup" }] }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(resolveCheckoutPriceId("founders")).resolves.toBe(
      "price_from_lookup"
    );

    expect(fetchMock).toHaveBeenCalledOnce();
    const calledUrl = String(fetchMock.mock.calls[0]?.[0] ?? "");
    expect(calledUrl).toContain("/prices?");
    expect(decodeURIComponent(calledUrl)).toContain(STRIPE_FOUNDERS_LOOKUP_KEY);
  });
});
