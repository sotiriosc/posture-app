import { test, expect } from "@playwright/test";
import { e2eEmail, upsertE2eUser } from "../../e2e/fixtures";

/**
 * Phase 9 — /admin is allowlisted by ADMIN_USER_IDS.
 * Non-admins (and the public) get 404 — do not reveal the route.
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

  const response = await page.goto("/admin");
  expect(response?.status()).toBe(404);
  await expect(page.getByTestId("admin-dashboard")).toHaveCount(0);
});

test("allowlisted admin user sees the operator dashboard", async ({ page }) => {
  await upsertE2eUser({
    id: E2E_ADMIN_ID,
    email: E2E_ADMIN_EMAIL,
    password: E2E_ADMIN_PASSWORD,
    plan: "pro",
  });
  const login = await page.request.post("/api/auth/login", {
    data: { email: E2E_ADMIN_EMAIL, password: E2E_ADMIN_PASSWORD },
  });
  expect(login.ok()).toBeTruthy();

  const response = await page.goto("/admin");
  expect(response?.status()).toBe(200);
  await expect(page.getByTestId("admin-dashboard")).toBeVisible({
    timeout: 20_000,
  });
  await expect(page.getByTestId("admin-activation-funnel")).toBeVisible();
  await expect(page.getByTestId("admin-window-selector")).toBeVisible();
});

test("logged-out visitor gets 404 on /admin", async ({ page }) => {
  const response = await page.goto("/admin");
  expect(response?.status()).toBe(404);
});
