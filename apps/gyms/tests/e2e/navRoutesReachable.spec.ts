import { test, expect } from "@playwright/test";
import { e2eEmail, upsertE2eUser } from "./fixtures";

/**
 * Phase 6c, Commit 3 — Settings and FAQ must be reachable from the nav
 * (gyms member-facing side; mirrors the consumer spec).
 */
test("nav menu exposes Help & FAQ and a plainly-labeled Settings link", async ({
  page,
}) => {
  const email = e2eEmail("nav-routes");
  await upsertE2eUser({ email, password: "playwright-password", plan: "free" });
  const login = await page.request.post("/api/auth/login", {
    data: { email, password: "playwright-password" },
  });
  expect(login.ok()).toBeTruthy();

  await page.goto("/results");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible({
    timeout: 20_000,
  });

  await page.getByRole("button", { name: "Open menu" }).click();

  const settingsLink = page.getByRole("link", { name: "Settings", exact: true });
  await expect(settingsLink).toBeVisible();
  await expect(settingsLink).toHaveAttribute("href", "/account/settings");
  await expect(page.getByRole("link", { name: "Admin Settings" })).toHaveCount(0);

  const faqLink = page.getByRole("link", { name: "Help & FAQ" });
  await expect(faqLink).toBeVisible();
  await expect(faqLink).toHaveAttribute("href", "/faq");

  await faqLink.click();
  await expect(page).toHaveURL(/\/faq$/);
  await expect(page.getByRole("heading", { name: "Help & FAQ" })).toBeVisible();
});
