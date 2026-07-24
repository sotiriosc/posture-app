import { test, expect } from "@playwright/test";
import { completeQuestionnaire, mockTrainingState } from "../../e2e/fixtures";

/**
 * Phase 6f, Commit 3 (amended) — status-model access rules:
 *   status === "canceled_at_period_end" AND now >= currentPeriodEnd → free
 *   access, with a graceful "reconnect to restore Pro access" message
 *   rather than a silent, unexplained downgrade.
 *
 * See offlineSessionCompletion... er, subscriptionOfflineAccess.spec.ts for
 * why this uses toggleable route failures instead of `context.setOffline`.
 */
test("a subscription whose grace period has already lapsed degrades to free gracefully, with a reconnect nudge, when the live check fails", async ({
  page,
}) => {
  let failNetwork = false;
  const user = {
    id: "e2e-expired-user",
    email: "expired-offline@example.com",
    plan: "pro" as const,
  };
  const pastPeriodEnd = "2020-01-01T00:00:00.000Z";

  await page.route("**/api/auth/session", async (route) => {
    if (failNetwork) {
      await route.abort("internetdisconnected");
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true, enabled: true, authenticated: true, user }),
    });
  });

  await page.route("**/api/billing/status", async (route) => {
    if (failNetwork) {
      await route.abort("internetdisconnected");
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        authenticated: true,
        stripeConfigured: true,
        user: {
          ...user,
          stripeCustomerId: "cus_e2e",
          stripeSubscriptionId: "sub_e2e",
          stripePriceId: "price_e2e",
          stripeSubscriptionStatus: "canceled",
          stripeCurrentPeriodEnd: pastPeriodEnd,
          stripeCancelAtPeriodEnd: true,
        },
      }),
    });
  });

  await mockTrainingState(page, { authenticated: true });

  await completeQuestionnaire(page, { daysPerWeek: 3 });

  // Online: still Pro today per the live session (the webhook's binary plan
  // hasn't flipped yet), but the local cache now remembers a period end
  // that's already in the past.
  await expect(page.getByText("Plan: Pro")).toBeVisible({ timeout: 20_000 });
  await expect
    .poll(() =>
      page.evaluate(() => localStorage.getItem("praxis_subscription_v1"))
    )
    .not.toBeNull();

  failNetwork = true;
  await page.reload();

  // The live check fails, so Praxis falls back to the local record — whose
  // grace period has lapsed — and degrades gracefully to free rather than
  // silently keeping Pro forever or bouncing the user to a login screen.
  await expect(page.getByText("Plan: Free")).toBeVisible({ timeout: 20_000 });
  await expect(
    page.getByText(/Couldn.t confirm your subscription while offline/)
  ).toBeVisible();
  await expect(
    page.getByText(/Reconnect to\s*restore Pro access/)
  ).toBeVisible();
});
