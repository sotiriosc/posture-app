import { test, expect } from "@playwright/test";
import { e2eEmail, upsertE2eUser } from "../../e2e/fixtures";

/**
 * Billing page must never show contradictory subscription fields, and Refresh
 * must reconcile via /api/billing/refresh (direct Stripe fetch path) rather
 * than a no-op reload of stale local state.
 */

const PASSWORD = "playwright-password";

test("partial local subscription renders one coherent billing view", async ({
  page,
}) => {
  const email = e2eEmail("billing-partial");
  await upsertE2eUser({
    email,
    password: PASSWORD,
    plan: "pro",
    stripeCustomerId: "cus_partial_e2e",
    stripeSubscriptionId: "sub_partial_e2e",
    stripeSubscriptionStatus: "canceled",
    stripeCurrentPeriodEnd: null,
    stripeCancelAtPeriodEnd: null,
  });

  const login = await page.request.post("/api/auth/login", {
    data: { email, password: PASSWORD },
  });
  expect(login.ok()).toBeTruthy();

  await page.goto("/account/billing");
  await expect(page.getByTestId("billing-plan-card")).toBeVisible();

  const chip = (await page.getByTestId("billing-status-chip").innerText()).trim();
  const access = (
    await page.getByTestId("billing-field-access-status").innerText()
  ).toLowerCase();
  const plan = (await page.getByTestId("billing-plan-label").innerText()).trim();

  // Chip + access + plan label must agree — never Expired + "Pro (active)".
  if (chip.toUpperCase() === "EXPIRED") {
    expect(access).not.toContain("active");
    expect(plan).toBe("Free");
  } else {
    expect(access).toContain("pro");
    expect(plan).toBe("Pro");
  }

  const cancellation = await page
    .getByTestId("billing-field-scheduled-cancellation")
    .innerText();
  expect(cancellation).not.toMatch(/(^|\s)--(\s|$)/);
  expect(cancellation.toLowerCase()).toContain("cancellation");
});

test("refresh subscription status calls reconcile endpoint then reloads", async ({
  page,
}) => {
  const email = e2eEmail("billing-refresh");
  await upsertE2eUser({
    email,
    password: PASSWORD,
    plan: "pro",
    stripeCustomerId: "cus_refresh_e2e",
    stripeSubscriptionId: "sub_refresh_e2e",
    stripeSubscriptionStatus: null,
    stripeCurrentPeriodEnd: null,
    stripeCancelAtPeriodEnd: null,
  });

  const login = await page.request.post("/api/auth/login", {
    data: { email, password: PASSWORD },
  });
  expect(login.ok()).toBeTruthy();

  let stripeRefreshHits = 0;
  await page.route("**/api/billing/refresh", async (route) => {
    const body = route.request().postDataJSON() as { mode?: string } | null;
    const mode = body?.mode ?? "stripe";
    if (mode === "session-only") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true }),
      });
      return;
    }
    stripeRefreshHits += 1;
    await upsertE2eUser({
      email,
      password: PASSWORD,
      plan: "pro",
      stripeCustomerId: "cus_refresh_e2e",
      stripeSubscriptionId: "sub_refresh_e2e",
      stripeSubscriptionStatus: "active",
      stripeCurrentPeriodEnd: "2035-08-01T00:00:00.000Z",
      stripeCancelAtPeriodEnd: false,
    });
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        user: {
          plan: "pro",
          stripeSubscriptionStatus: "active",
          stripeCurrentPeriodEnd: "2035-08-01T00:00:00.000Z",
          stripeCancelAtPeriodEnd: false,
        },
      }),
    });
  });

  await page.goto("/account/billing");
  await expect(page.getByTestId("billing-refresh-status")).toBeVisible();
  await page.getByTestId("billing-refresh-status").click();

  await expect.poll(() => stripeRefreshHits).toBeGreaterThan(0);
  await expect(page.getByTestId("billing-status-chip")).toHaveText(/Active/i, {
    timeout: 15_000,
  });
  await expect(page.getByTestId("billing-field-access-status")).toContainText(
    /Pro \(active\)/i
  );
  await expect(page.getByTestId("billing-field-renews-on")).toContainText(
    "Aug 1, 2035"
  );
  await expect(
    page.getByTestId("billing-field-scheduled-cancellation")
  ).toContainText(/No cancellation scheduled/i);
});
