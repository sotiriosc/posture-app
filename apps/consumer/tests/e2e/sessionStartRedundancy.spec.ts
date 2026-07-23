import { test, expect } from "@playwright/test";
import { e2eEmail, upsertE2eUser } from "../../e2e/fixtures";

/**
 * Phase 6d, Commit 5 — session-start screen redundancy.
 *
 * The session screen used to render the day title and phase name twice at
 * session start: once in a generic non-sticky "Guided session" block at the
 * very top, and again inside `SessionProgressHeader`'s full-state render
 * (phase / day title / exercise counter / progress bar), which is the
 * ever-present sticky header that also serves the rest of the session.
 * Locks: the "Guided session" block is gone, and the one remaining header
 * still carries phase, day title, and exercise counter.
 */

const MOBILE_VIEWPORTS = [
  { name: "iphone15", width: 390, height: 844 },
  { name: "iphone-se", width: 360, height: 740 },
] as const;

for (const viewport of MOBILE_VIEWPORTS) {
  test(`session-start screen shows the day title and phase name once, not twice (${viewport.name})`, async ({
    page,
  }) => {
    const email = e2eEmail(`session-start-${viewport.name}`);
    await upsertE2eUser({ email, password: "playwright-password", plan: "pro" });
    const login = await page.request.post("/api/auth/login", {
      data: { email, password: "playwright-password" },
    });
    expect(login.ok()).toBeTruthy();

    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto("/dev-seed?seed=climber");
    await page.waitForURL((url) => !url.pathname.startsWith("/dev-seed"), {
      timeout: 30_000,
    });
    await page.waitForTimeout(1000);
    await page.evaluate(() => {
      localStorage.setItem(
        "posture_questionnaire",
        JSON.stringify({
          goals: "Improve posture",
          painAreas: [],
          experience: "Beginner",
          equipment: ["none"],
          daysPerWeek: 3,
        })
      );
    });

    await page.goto("/results");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({
      timeout: 15_000,
    });
    await page.waitForTimeout(500);

    await page.goto("/session");
    await expect(page.getByTestId("session-next")).toBeVisible({ timeout: 15_000 });

    // The old generic top block is gone entirely.
    await expect(page.getByText("Guided session", { exact: true })).toHaveCount(0);

    // The one remaining header (session-start = full state) still carries
    // phase, day title, and exercise counter — nothing of substance lost.
    const header = page.getByTestId("session-header-full");
    await expect(header).toBeVisible();
    await expect(header).toContainText(/Exercise 1 of \d+/);

    // The day title itself now renders exactly once on the page.
    const dayTitleText = (await header.locator("h1").first().textContent())?.trim() ?? "";
    expect(dayTitleText.length).toBeGreaterThan(0);
    expect(await page.getByText(dayTitleText, { exact: true }).count()).toBe(1);
  });
}
