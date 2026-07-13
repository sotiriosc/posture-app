import { describe, expect, test } from "vitest";
import {
  mapPlanFromEvent,
  resolveBillingPatch,
  resolveEmailFromEvent,
  resolveUserIdFromEvent,
} from "@/lib/stripeWebhookLogic";
import type { StripeWebhookEvent } from "@/lib/stripeServer";

const event = (type: string, object: Record<string, unknown>): StripeWebhookEvent =>
  ({
    id: `evt_${type}`,
    type,
    data: { object },
  }) as StripeWebhookEvent;

describe("stripe webhook logic", () => {
  test("maps checkout completion to pro", () => {
    const e = event("checkout.session.completed", {
      metadata: { userId: "u1", email: "u@example.com" },
      customer: "cus_1",
      subscription: "sub_1",
      payment_status: "paid",
    });
    expect(mapPlanFromEvent(e)).toBe("pro");
    expect(resolveUserIdFromEvent(e)).toBe("u1");
    expect(resolveEmailFromEvent(e)).toBe("u@example.com");
  });

  test("maps active subscription update to pro", () => {
    const e = event("customer.subscription.updated", {
      id: "sub_1",
      object: "subscription",
      status: "active",
      customer: "cus_1",
      items: { data: [{ price: { id: "price_1" } }] },
      current_period_end: 1790000000,
      cancel_at_period_end: false,
    });
    expect(mapPlanFromEvent(e)).toBe("pro");
    const patch = resolveBillingPatch(e);
    expect(patch.stripeSubscriptionId).toBe("sub_1");
    expect(patch.stripePriceId).toBe("price_1");
    expect(patch.stripeSubscriptionStatus).toBe("active");
    expect(patch.stripeCancelAtPeriodEnd).toBe(false);
    expect(patch.stripeCurrentPeriodEnd).toMatch(/^20\d\d-/);
  });

  test("maps canceled subscription state to free", () => {
    const e = event("customer.subscription.updated", {
      id: "sub_1",
      object: "subscription",
      status: "canceled",
      customer: "cus_1",
      cancel_at_period_end: true,
    });
    expect(mapPlanFromEvent(e)).toBe("free");
  });

  test("does not change entitlement on transient incomplete subscription state", () => {
    const e = event("customer.subscription.updated", {
      id: "sub_1",
      object: "subscription",
      status: "incomplete",
      customer: "cus_1",
    });
    expect(mapPlanFromEvent(e)).toBeNull();
  });

  test("maps deleted subscription to free", () => {
    const e = event("customer.subscription.deleted", {
      id: "sub_1",
      object: "subscription",
      customer: "cus_1",
      status: "canceled",
    });
    expect(mapPlanFromEvent(e)).toBe("free");
  });
});
