import { test, expect } from "@playwright/test";

/**
 * Phase 6f, Commit 9 — public /tools/macro-calculator marketing page.
 * Deliberately no auth fixtures: this route is outside middleware.ts's
 * matcher and must be reachable by a fully anonymous visitor (search
 * traffic), which is exactly what this spec exercises.
 */

test("renders without requiring a login, with the calculator, coaching content, and an assessment CTA", async ({
  page,
}) => {
  await page.goto("/tools/macro-calculator");

  await expect(page.getByRole("heading", { level: 1, name: "Macro Calculator for Lifters" })).toBeVisible();
  await expect(page.getByTestId("macro-calculator")).toBeVisible();

  await expect(
    page.getByRole("heading", { name: "Why moderate fat, high carb, high protein for lifters" })
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Hydration, salt, and muscle performance" })
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Creatine: what it does, how to use it" })
  ).toBeVisible();

  const cta = page.getByRole("link", { name: /try the assessment/i });
  await expect(cta).toBeVisible();
  await expect(cta).toHaveAttribute("href", "/assessment");
});

test("meta title and description are present and tuned for the target keywords", async ({
  page,
}) => {
  await page.goto("/tools/macro-calculator");

  await expect(page).toHaveTitle(/Macro Calculator for Lifters/);
  const description = page.locator('meta[name="description"]');
  await expect(description).toHaveAttribute("content", /macro calculator/i);

  const canonical = page.locator('link[rel="canonical"]');
  await expect(canonical).toHaveAttribute("href", /\/tools\/macro-calculator$/);

  const jsonLdScripts = page.locator('script[type="application/ld+json"]');
  await expect(jsonLdScripts).toHaveCount(2);
  const payloads = await jsonLdScripts.allTextContents();
  const parsed = payloads.map((raw) => JSON.parse(raw));
  expect(parsed.some((entry) => entry["@type"] === "SoftwareApplication")).toBe(true);
  expect(parsed.some((entry) => entry["@type"] === "Article")).toBe(true);
});

test("the calculator computes a calorie and macro target from the default inputs", async ({
  page,
}) => {
  await page.goto("/tools/macro-calculator");

  // Defaults (180 lb, 70 in, 30 yo, male, moderate, maintain) should already
  // produce a result with no interaction required.
  await expect(page.getByTestId("macro-results")).toBeVisible();
  await expect(page.getByTestId("macro-result-calories")).toHaveText("2763");
  await expect(page.getByTestId("macro-result-protein")).toHaveText("147");
  await expect(page.getByTestId("macro-result-carbs")).toHaveText("371");
  await expect(page.getByTestId("macro-result-fat")).toHaveText("77");
});

test("changing an input recomputes the result, and out-of-range values show a validation message instead of a crash", async ({
  page,
}) => {
  await page.goto("/tools/macro-calculator");
  // The calculator is a client component with controlled inputs; interacting
  // before React finishes hydrating can change the native <select>'s DOM
  // value without firing React's onChange, and hydration then silently
  // resets it back to the pre-hydration state. Waiting for network idle
  // gives the (tiny) client bundle time to load and attach listeners before
  // the first interaction, under slow/loaded CI or dev-server conditions.
  await page.waitForLoadState("networkidle");
  await expect(page.getByTestId("macro-results")).toBeVisible();

  await page.getByTestId("macro-input-goal").selectOption("build");
  await expect(page.getByTestId("macro-result-calories")).toHaveText("3063");

  await page.getByTestId("macro-input-weight").fill("10");
  await expect(page.getByTestId("macro-results-invalid")).toBeVisible();
  await expect(page.getByTestId("macro-results")).toHaveCount(0);
});

test("sitemap.xml includes the macro calculator page", async ({ page }) => {
  const response = await page.request.get("/sitemap.xml");
  expect(response.ok()).toBeTruthy();
  const body = await response.text();
  expect(body).toContain("/tools/macro-calculator");
});
