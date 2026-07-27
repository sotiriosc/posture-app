import { test, expect } from "@playwright/test";
import { e2eEmail, upsertE2eUser } from "../../e2e/fixtures";

/**
 * Phase 9 — /api/admin/metrics must never include emails, user IDs, names,
 * or opaque account keys.
 */

const E2E_ADMIN_ID = "e2e-admin-operator";
const E2E_ADMIN_EMAIL = "operator-admin@e2e.local";
const E2E_ADMIN_PASSWORD = "playwright-password";

const PII_FIELD_RE =
  /"(email|name|userId|accountKey|passwordHash|passwordSalt)"\s*:/i;
const EMAIL_LITERAL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;

test("admin metrics API response contains no PII fields or email literals", async ({
  page,
}) => {
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

  const metrics = await page.request.get("/api/admin/metrics?window=30d");
  expect(metrics.status()).toBe(200);
  const bodyText = await metrics.text();
  expect(bodyText).not.toMatch(PII_FIELD_RE);
  expect(bodyText).not.toMatch(EMAIL_LITERAL_RE);
  expect(bodyText).not.toContain(E2E_ADMIN_EMAIL);
  expect(bodyText).not.toContain(E2E_ADMIN_ID);

  const json = JSON.parse(bodyText) as {
    glance?: { totalAccounts?: number };
    activationFunnel?: { steps?: unknown[] };
  };
  expect(typeof json.glance?.totalAccounts).toBe("number");
  expect(Array.isArray(json.activationFunnel?.steps)).toBe(true);
});

test("non-admin cannot read metrics API", async ({ page }) => {
  const email = e2eEmail("admin-pii-deny");
  await upsertE2eUser({ email, password: "playwright-password", plan: "pro" });
  const login = await page.request.post("/api/auth/login", {
    data: { email, password: "playwright-password" },
  });
  expect(login.ok()).toBeTruthy();

  const metrics = await page.request.get("/api/admin/metrics?window=30d");
  expect(metrics.status()).toBe(404);
});
