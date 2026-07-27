import { test, expect } from "@playwright/test";
import { e2eEmail, upsertE2eUser } from "../../e2e/fixtures";

/**
 * Phase 9 — /admin is allowlisted by ADMIN_USER_IDS.
 * Non-admins (and the public) get 404 — do not reveal the route.
 *
 * Status codes are asserted via `page.request` (document navigations under
 * the App Router can surface 200 while rendering the not-found UI).
 */

const E2E_ADMIN_ID = "e2e-admin-operator";
const E2E_ADMIN_EMAIL = "operator-admin@e2e.local";
const E2E_ADMIN_PASSWORD = "playwright-password";

test("non-admin authenticated user gets 404 on /admin", async ({ page }) => {
  const email = e2eEmail("admin-deny");
  await upsertE2eUser({ email, password: "playwright-password", plan: "pro" });
  const login = await page.request.post("/api/auth/login", {
    data: { email, password: "playwright-password" },
  });
  expect(login.ok()).toBeTruthy();

  const status = await page.request.get("/admin");
  expect(status.headers()["x-praxis-admin-gate"] ?? "missing").toBe(
    "denied-not-allowlisted"
  );
  expect(status.status()).toBe(404);

  await page.goto("/admin");
  await expect(page.getByTestId("admin-dashboard")).toHaveCount(0);
});

test("allowlisted admin user sees the operator dashboard", async ({ page }) => {
  const created = await upsertE2eUser({
    id: E2E_ADMIN_ID,
    email: E2E_ADMIN_EMAIL,
    password: E2E_ADMIN_PASSWORD,
    plan: "pro",
  });
  expect(created.id).toBe(E2E_ADMIN_ID);

  const login = await page.request.post("/api/auth/login", {
    data: { email: E2E_ADMIN_EMAIL, password: E2E_ADMIN_PASSWORD },
  });
  expect(login.ok()).toBeTruthy();
  const loginBody = (await login.json()) as { user?: { id?: string } };
  expect(loginBody.user?.id).toBe(E2E_ADMIN_ID);

  const session = await page.request.get("/api/auth/session");
  const sessionBody = (await session.json()) as {
    authenticated?: boolean;
    user?: { id?: string; email?: string };
  };
  expect(sessionBody.authenticated).toBeTruthy();
  expect(sessionBody.user?.email).toBe(E2E_ADMIN_EMAIL);
  expect(sessionBody.user?.id).toBe(E2E_ADMIN_ID);

  const status = await page.request.get("/admin");
  expect(status.headers()["x-praxis-admin-gate"] ?? "missing").toBe(
    "allowed"
  );
  expect(status.status()).toBe(200);

  await page.goto("/admin");
  await expect(page.getByTestId("admin-dashboard")).toBeVisible({
    timeout: 20_000,
  });
  await expect(page.getByTestId("admin-activation-funnel")).toBeVisible();
  await expect(page.getByTestId("admin-window-selector")).toBeVisible();
  const largest = page.locator('[data-largest-dropoff="1"]');
  // With sparse data the largest drop-off highlight may still exist on step 2+.
  await expect(largest.first()).toBeVisible();
});

test("logged-out visitor gets 404 on /admin", async ({ page }) => {
  const status = await page.request.get("/admin");
  expect(status.headers()["x-praxis-admin-gate"] ?? "missing").toBe(
    "denied-no-session"
  );
  expect(status.status()).toBe(404);
});
