import { test, expect } from "@playwright/test";
import { e2eEmail, upsertE2eUser } from "../../e2e/fixtures";

/**
 * Phase 6d, Commit 2 — log-set screen compression.
 *
 * Locks the acceptance criterion: "Log-set screen shows one summary line +
 * two input fields + Next." The six-field "About to record" grid collapses
 * to one caption line, and Exit session / Back move behind a "..." menu so
 * they don't compete with the primary set-logging actions.
 */

const MOBILE_VIEWPORTS = [
  { name: "iphone15", width: 390, height: 844 },
  { name: "iphone-se", width: 360, height: 740 },
] as const;

for (const viewport of MOBILE_VIEWPORTS) {
  test(`log-set panel is one summary line + reps/RPE fields, with Exit/Back tucked behind a menu (${viewport.name})`, async ({
    page,
  }) => {
    const email = e2eEmail(`log-set-${viewport.name}`);
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

    // One summary line, not the old six-field grid.
    const summary = page.getByTestId("about-to-record-summary");
    await expect(summary).toBeVisible();
    await expect(summary).toContainText("target");
    await expect(summary).toContainText("RPE");

    // Reps and RPE fields present and each a real tap target.
    const repsInput = page.getByTestId("reps-input");
    const rpeInput = page.getByTestId("rpe-input");
    await expect(repsInput).toBeVisible();
    await expect(rpeInput).toBeVisible();
    const repsBox = await repsInput.boundingBox();
    const rpeBox = await rpeInput.boundingBox();
    expect(repsBox).not.toBeNull();
    expect(rpeBox).not.toBeNull();
    if (repsBox) expect(repsBox.height).toBeGreaterThanOrEqual(44);
    if (rpeBox) expect(rpeBox.height).toBeGreaterThanOrEqual(44);

    // Exit session / Back are not primary actions in the flow anymore —
    // tucked behind the "..." trigger, not directly visible.
    await expect(page.getByTestId("session-exit")).toBeHidden();
    await expect(page.getByTestId("session-back")).toBeHidden();

    const optionsTrigger = page.getByTestId("session-options-trigger");
    await expect(optionsTrigger).toBeVisible();
    await optionsTrigger.click();
    await expect(page.getByTestId("session-exit")).toBeVisible();
    await expect(page.getByTestId("session-back")).toBeVisible();
  });
}
