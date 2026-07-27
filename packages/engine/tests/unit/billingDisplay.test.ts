import { describe, expect, test } from "vitest";
import {
  deriveBillingDisplay,
  needsBillingReconcile,
  resolveBillingPhase,
} from "@/lib/billingDisplay";

describe("billingDisplay", () => {
  test("partial pro record without status still renders one coherent active view", () => {
    const record = {
      plan: "pro" as const,
      stripeCustomerId: "cus_1",
      stripeSubscriptionId: "sub_1",
      stripeSubscriptionStatus: null,
      stripeCurrentPeriodEnd: null,
      stripeCancelAtPeriodEnd: null,
    };
    const display = deriveBillingDisplay(record);
    expect(resolveBillingPhase(record)).toBe("active");
    expect(display.planLabel).toBe("Pro");
    expect(display.statusChip.label).toBe("Active");
    expect(display.accessStatus).toBe("Pro (active)");
    expect(display.renewalValue).toBe("Not available from Stripe");
    expect(display.cancellationValue).toBe("No cancellation scheduled");
    expect(needsBillingReconcile(record)).toBe(true);
  });

  test("never shows Expired chip with Pro (active) access for canceled status", () => {
    const record = {
      plan: "pro" as const,
      stripeCustomerId: "cus_1",
      stripeSubscriptionStatus: "canceled",
      stripeCurrentPeriodEnd: null,
      stripeCancelAtPeriodEnd: false,
    };
    const display = deriveBillingDisplay(record);
    expect(display.statusChip.label).toBe("Expired");
    expect(display.accessStatus).toBe("Access ended");
    expect(display.planLabel).toBe("Free");
    expect(display.accessStatus).not.toMatch(/active/i);
  });

  test("active subscription with period end and no cancel is consistent", () => {
    const record = {
      plan: "pro" as const,
      stripeSubscriptionStatus: "active",
      stripeCurrentPeriodEnd: "2035-06-01T00:00:00.000Z",
      stripeCancelAtPeriodEnd: false,
      stripeCustomerId: "cus_1",
    };
    const display = deriveBillingDisplay(record);
    expect(display.planLabel).toBe("Pro");
    expect(display.statusChip.label).toBe("Active");
    expect(display.accessStatus).toBe("Pro (active)");
    expect(display.renewalLabel).toBe("Renewal date");
    expect(display.renewalValue).toBe("2035-06-01");
    expect(display.cancellationValue).toBe("No cancellation scheduled");
    expect(needsBillingReconcile(record)).toBe(false);
  });

  test("cancel-at-period-end uses one phase for chip and access", () => {
    const record = {
      plan: "pro" as const,
      stripeSubscriptionStatus: "active",
      stripeCurrentPeriodEnd: "2035-06-01T00:00:00.000Z",
      stripeCancelAtPeriodEnd: true,
      stripeCustomerId: "cus_1",
    };
    const display = deriveBillingDisplay(record);
    expect(display.statusChip.label).toBe("Active");
    expect(display.accessStatus).toBe("Pro (scheduled to end on 2035-06-01)");
    expect(display.renewalLabel).toBe("Access ends on");
    expect(display.renewalValue).toBe("2035-06-01");
    expect(display.cancellationValue).toBe("Yes — ends on 2035-06-01");
  });

  test("plan/status conflict needs reconcile", () => {
    expect(
      needsBillingReconcile({
        plan: "pro",
        stripeCustomerId: "cus_1",
        stripeSubscriptionStatus: "canceled",
        stripeCurrentPeriodEnd: "2030-01-01T00:00:00.000Z",
        stripeCancelAtPeriodEnd: false,
      })
    ).toBe(true);
  });
});
