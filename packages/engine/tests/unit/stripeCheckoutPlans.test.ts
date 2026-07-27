import { afterEach, describe, expect, test, vi } from "vitest";
import {
  buildCheckoutDiscountParams,
  createStripeCheckoutSession,
  formatStripePriceLabel,
  getAnnualPriceId,
  getFoundersPriceIdOverride,
  getMonthlyPriceId,
  getStripeCheckoutPlanAvailability,
  isStripeConfigured,
  parseStripeCheckoutPlan,
  resolveCheckoutPriceId,
  resolveFoundersDiscountParams,
  STRIPE_FOUNDERS_COUPON_ID,
  STRIPE_FOUNDERS_LOOKUP_KEY,
  STRIPE_MONTHLY_TRIAL_PROMO_CODE,
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

  test("buildCheckoutDiscountParams gates coupons by plan", () => {
    const monthly = buildCheckoutDiscountParams("monthly");
    expect(monthly.allow_promotion_codes).toBe("true");
    expect(monthly["custom_text[submit][message]"]).toContain(
      STRIPE_MONTHLY_TRIAL_PROMO_CODE
    );
    expect(monthly["discounts[0][coupon]"]).toBeUndefined();

    // Founders discounts are resolved async (promotion code → coupon).
    expect(buildCheckoutDiscountParams("founders")).toEqual({});

    const annual = buildCheckoutDiscountParams("annual");
    expect(annual).toEqual({});
  });

  test("resolveFoundersDiscountParams prefers promotion code object id", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_x";
    process.env.NODE_ENV = "test";
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [{ id: "promo_founders_1", code: "FOUNDERS" }],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(resolveFoundersDiscountParams()).resolves.toEqual({
      "discounts[0][promotion_code]": "promo_founders_1",
    });
    expect(String(fetchMock.mock.calls[0]?.[0] ?? "")).toContain(
      "/promotion_codes?"
    );
  });

  test("resolveFoundersDiscountParams falls back to coupon id", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_x";
    process.env.NODE_ENV = "test";
    delete process.env.STRIPE_FOUNDERS_COUPON_ID;
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [] }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(resolveFoundersDiscountParams()).resolves.toEqual({
      "discounts[0][coupon]": STRIPE_FOUNDERS_COUPON_ID,
    });
  });

  test("monthly checkout enables promo codes and never sends discounts", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_x";
    process.env.NODE_ENV = "test";
    process.env.STRIPE_PRICE_ID_MONTHLY = "price_monthly";
    process.env.APP_URL = "https://example.com";

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: "cs_test_1",
        url: "https://checkout.stripe.com/c/pay/cs_test_1",
        customer: null,
        subscription: null,
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await createStripeCheckoutSession({
      userId: "user-1",
      email: "athlete@example.com",
      plan: "monthly",
    });

    const [, init] = fetchMock.mock.calls[0] ?? [];
    const body = String((init as { body?: string } | undefined)?.body ?? "");
    expect(body).toContain("allow_promotion_codes=true");
    expect(body).toContain("custom_text%5Bsubmit%5D%5Bmessage%5D=");
    expect(decodeURIComponent(body)).toContain(STRIPE_MONTHLY_TRIAL_PROMO_CODE);
    expect(body).not.toContain("discounts");
    expect(body).toContain("client_reference_id=user-1");
    expect(body).toContain("metadata%5BuserId%5D=user-1");
  });

  test("founders checkout applies FOUNDERS promotion code without allow_promotion_codes", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_x";
    process.env.NODE_ENV = "test";
    process.env.STRIPE_PRICE_ID_FOUNDERS = "price_founders";
    process.env.APP_URL = "https://example.com";

    const fetchMock = vi.fn().mockImplementation(async (url: string) => {
      if (String(url).includes("/promotion_codes")) {
        return {
          ok: true,
          json: async () => ({
            data: [{ id: "promo_founders_1", code: "FOUNDERS" }],
          }),
        };
      }
      return {
        ok: true,
        json: async () => ({
          id: "cs_test_founders",
          url: "https://checkout.stripe.com/c/pay/cs_test_founders",
          customer: null,
          subscription: null,
        }),
      };
    });
    vi.stubGlobal("fetch", fetchMock);

    await createStripeCheckoutSession({
      userId: "user-1",
      email: "athlete@example.com",
      plan: "founders",
    });

    const sessionCall = fetchMock.mock.calls.find(([url]) =>
      String(url).includes("/checkout/sessions")
    );
    const body = String(
      (sessionCall?.[1] as { body?: string } | undefined)?.body ?? ""
    );
    expect(decodeURIComponent(body)).toContain(
      "discounts[0][promotion_code]=promo_founders_1"
    );
    expect(body).not.toContain("allow_promotion_codes");
    expect(body).not.toContain("custom_text");
  });

  test("annual checkout has no discounts or promo codes", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_x";
    process.env.NODE_ENV = "test";
    process.env.STRIPE_PRICE_ID_MONTHLY = "price_monthly";
    process.env.STRIPE_PRICE_ID_ANNUAL = "price_annual";
    process.env.APP_URL = "https://example.com";

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: "cs_test_annual",
        url: "https://checkout.stripe.com/c/pay/cs_test_annual",
        customer: null,
        subscription: null,
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await createStripeCheckoutSession({
      userId: "user-1",
      email: "athlete@example.com",
      plan: "annual",
    });

    const [, init] = fetchMock.mock.calls[0] ?? [];
    const body = String((init as { body?: string } | undefined)?.body ?? "");
    expect(body).toContain("price_annual");
    expect(body).not.toContain("allow_promotion_codes");
    expect(body).not.toContain("discounts");
    expect(body).not.toContain("custom_text");
  });
});
