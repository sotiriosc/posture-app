import { test, expect } from "@playwright/test";
import { e2eEmail, upsertE2eUser } from "../../e2e/fixtures";

/**
 * Phase 6b, Commit 1 — Session persistence across Stripe (SHIP-CRITICAL).
 *
 * Reproduces the QA failure: a logged-in user upgrades via Stripe and, on the
 * redirect back into the app, is either logged out or still shown as "free".
 *
 * We stand up a real file-backed account, log in (plan: free), then simulate
 * the Stripe webhook flipping the account to Pro server-side while the browser
 * is away at checkout. Finally we follow the Stripe success redirect and assert
 * the user is still authenticated AND the session now reflects Pro.
 *
 * Against current main this fails: success_url landed directly on /results,
 * which never re-issued the session token, so the cookie kept the stale "free"
 * plan (and the /api/billing/return handler did not exist at all). After the
 * fix, the return handler re-establishes the session from the DB.
 */

const AUTH_COOKIE_NAME = "bac_user";
const PASSWORD = "playwright-password";

const decodeTokenPlan = (token: string): string | null => {
  const [, body] = token.split(".");
  if (!body) return null;
  const base64 = body.replace(/-/g, "+").replace(/_/g, "/");
  try {
    const json = Buffer.from(base64, "base64").toString("utf8");
    return (JSON.parse(json) as { plan?: string }).plan ?? null;
  } catch {
    return null;
  }
};

test("stays logged in with Pro reflected after the Stripe return", async ({
  page,
  context,
}) => {
  const email = e2eEmail("stripe-persist");

  // Pre-checkout state: an existing account, currently on the free plan.
  await upsertE2eUser({ email, password: PASSWORD, plan: "free" });

  const loginResponse = await page.request.post("/api/auth/login", {
    data: { email, password: PASSWORD },
  });
  expect(loginResponse.ok()).toBeTruthy();

  // The cookie we hold at checkout time encodes the free plan.
  const before = (await context.cookies()).find((c) => c.name === AUTH_COOKIE_NAME);
  expect(before?.value).toBeTruthy();
  expect(decodeTokenPlan(before!.value)).toBe("free");

  // Stripe webhook upgrades the account to Pro while the browser is at checkout.
  await upsertE2eUser({ email, password: PASSWORD, plan: "pro" });

  // Follow the Stripe success redirect (success_url → /api/billing/return).
  await page.goto("/api/billing/return?billing=success");

  // Still logged in, landed on the dashboard.
  await expect(page).toHaveURL(/\/results/);
  await expect(page.getByRole("heading", { name: /Welcome back/i })).toBeVisible({
    timeout: 20_000,
  });

  // The re-issued session cookie now reflects Pro — not the stale free plan.
  const after = (await context.cookies()).find((c) => c.name === AUTH_COOKIE_NAME);
  expect(after?.value).toBeTruthy();
  expect(decodeTokenPlan(after!.value)).toBe("pro");
});
