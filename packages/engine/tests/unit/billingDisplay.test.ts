import { describe, expect, test } from "vitest";
import {
  deriveBillingDisplay,
  formatBillingDate,
  needsBillingReconcile,
  resolveBillingPhase,
} from "@/lib/billingDisplay";

describe("formatBillingDate", () => {
  test("formats UTC ISO timestamps for billing copy", () => {
    expect(formatBillingDate("2026-08-26T00:00:00.000Z")).toBe("Aug 26, 2026");
  });
});

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
    expect(display.renewalLabel).toBe("Renews on");
    expect(display.renewalValue).toBe("Date not available from Stripe");
    expect(display.cancellationValue).toBe("No cancellation scheduled");
    expect(needsBillingReconcile(record)).toBe(true);
  });

  test("active subscription renews on period end with no cancellation", () => {
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
    expect(display.renewalLabel).toBe("Renews on");
    expect(display.renewalValue).toBe("Jun 1, 2035");
    expect(display.cancellationValue).toBe("No cancellation scheduled");
    expect(needsBillingReconcile(record)).toBe(false);
  });

  test("active cancel_at_period_end shows access end — not renewal", () => {
    const record = {
      plan: "pro" as const,
      stripeSubscriptionStatus: "active",
      stripeCurrentPeriodEnd: "2026-08-26T00:00:00.000Z",
      stripeCancelAtPeriodEnd: true,
      stripeCustomerId: "cus_UxVptZte1N4w3y",
    };
    const display = deriveBillingDisplay(record);
    expect(display.statusChip.label).toBe("Active");
    expect(display.planLabel).toBe("Pro");
    expect(display.accessStatus).toBe("Pro (access ends Aug 26, 2026)");
    expect(display.renewalLabel).toBe("Access ends on");
    expect(display.renewalValue).toBe("Aug 26, 2026");
    expect(display.cancellationValue).toBe("Yes — access ends Aug 26, 2026");
    expect(display.renewalLabel).not.toMatch(/renew/i);
  });

  test("canceled subscription shows ended date and free access", () => {
    const record = {
      plan: "free" as const,
      stripeSubscriptionStatus: "canceled",
      stripeCurrentPeriodEnd: "2026-08-26T00:00:00.000Z",
      stripeCancelAtPeriodEnd: false,
      stripeCustomerId: "cus_1",
    };
    const display = deriveBillingDisplay(record);
    expect(display.statusChip.label).toBe("Expired");
    expect(display.planLabel).toBe("Free");
    expect(display.accessStatus).toBe("Free access");
    expect(display.renewalLabel).toBe("Subscription ended");
    expect(display.renewalValue).toBe("Aug 26, 2026");
    expect(display.cancellationValue).toBe("No cancellation scheduled");
  });

  test("never shows Expired chip with Pro (active) access for canceled status on stale pro plan", () => {
    const record = {
      plan: "pro" as const,
      stripeCustomerId: "cus_1",
      stripeSubscriptionStatus: "canceled",
      stripeCurrentPeriodEnd: null,
      stripeCancelAtPeriodEnd: false,
    };
    const display = deriveBillingDisplay(record);
    expect(display.statusChip.label).toBe("Expired");
    expect(display.accessStatus).toBe("Free access");
    expect(display.planLabel).toBe("Free");
    expect(display.accessStatus).not.toMatch(/active/i);
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
