import { test, expect } from "@playwright/test";
import { completeQuestionnaire, mockTrainingState } from "../../e2e/fixtures";

/**
 * Phase 6f, Commit 3 (amended, ratified 2026-07-24) — subscription
 * persistence uses a status model, not an expiry-date model.
 *
 * Real problem: if a paid user's internet drops or Stripe is briefly down,
 * they should not lose the Pro access they've already paid for. `useUserPlan`
 * writes a local `{ status, currentPeriodEnd }` record (subscriptionStore.ts)
 * on every successful `/api/billing/status` read; when the live session
 * check itself fails, it falls back to that record instead of collapsing to
 * "signed out"/free.
 *
 * This routes `/api/auth/session` and `/api/billing/status` through a
 * toggleable failure flag (rather than `context.setOffline`, which would
 * also block the page's own navigation/reload requests via the PWA service
 * worker's offline fallback — see ED-6f.2/.3) so the underlying page load
 * itself keeps working while only the plan-check API calls fail, isolating
 * exactly the code path this commit changes.
 */
test("a device that previously confirmed active Pro access keeps showing Pro when the live session check fails", async ({
  page,
}) => {
  let failNetwork = false;
  const user = {
    id: "e2e-pro-user",
    email: "pro-offline@example.com",
    plan: "pro" as const,
  };

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
          stripeSubscriptionStatus: "active",
          stripeCurrentPeriodEnd: null,
          stripeCancelAtPeriodEnd: false,
        },
      }),
    });
  });

  await mockTrainingState(page, { authenticated: true });

  await completeQuestionnaire(page, { daysPerWeek: 3 });

  // Online: Pro is confirmed live, and the local fallback cache is written
  // in the background.
  await expect(page.getByText("Plan: Pro")).toBeVisible({ timeout: 20_000 });
  await expect
    .poll(() =>
      page.evaluate(() => localStorage.getItem("praxis_subscription_v1"))
    )
    .not.toBeNull();

  // Now the session/billing checks fail on every request (simulating
  // offline, or Stripe being down) and the page reloads — a fresh mount,
  // so `useUserPlan`'s module-scope fetch cache is reset and it genuinely
  // re-attempts (and fails) the live check.
  failNetwork = true;
  await page.reload();

  // Still Pro — the local cache, not a failed network call, is the last word.
  await expect(page.getByText("Plan: Pro")).toBeVisible({ timeout: 20_000 });
  await expect(
    page.getByText(/Couldn.t confirm your subscription while offline/)
  ).toBeHidden();
});
