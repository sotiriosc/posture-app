import { test, expect } from "@playwright/test";
import { e2eEmail, upsertE2eUser } from "../../e2e/fixtures";

/**
 * Phase 6c, Commit 4 — mobile audit, session screen.
 *
 * The "Next →" / "Finish session →" button (the primary action that advances
 * — and effectively logs — the current exercise) was the last element in
 * normal document flow. On any exercise with more than a couple of cues or
 * sets it scrolled out of view, so reaching it required scrolling on every
 * single exercise of every session. It's now pinned above the viewport
 * bottom on phone widths. This locks two things: the button is visible
 * without any scrolling, and it does not overlap the fixed bottom-right Menu
 * pill that AppMenuClient floats on the same viewport.
 */
test("session advance button is pinned and visible without scrolling on phone, and clears the Menu pill", async ({
  page,
}) => {
  const email = e2eEmail("session-next-pinned");
  await upsertE2eUser({ email, password: "playwright-password", plan: "pro" });
  const login = await page.request.post("/api/auth/login", {
    data: { email, password: "playwright-password" },
  });
  expect(login.ok()).toBeTruthy();

  await page.setViewportSize({ width: 390, height: 844 });

  await page.goto("/dev-seed?seed=climber");
  await page.waitForURL((url) => !url.pathname.startsWith("/dev-seed"), {
    timeout: 30_000,
  });
  await page.waitForTimeout(1000);
  // dev-seed only seeds program/logs, not the local questionnaire key that
  // the dashboard/session flow checks for.
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

  // Visiting /results first ensures the program/questionnaire state seeded
  // above is picked up before navigating straight to /session.
  await page.goto("/results");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible({
    timeout: 15_000,
  });
  await page.waitForTimeout(500);

  await page.goto("/session");
  const nextButton = page.getByTestId("session-next");
  await expect(nextButton).toBeVisible({ timeout: 15_000 });

  // Visible without scrolling: bounding box must be fully within the current
  // viewport at load, before any user scroll action.
  const buttonBox = await nextButton.boundingBox();
  expect(buttonBox).not.toBeNull();
  const viewport = page.viewportSize();
  expect(viewport).not.toBeNull();
  if (buttonBox && viewport) {
    expect(buttonBox.y).toBeGreaterThanOrEqual(0);
    expect(buttonBox.y + buttonBox.height).toBeLessThanOrEqual(viewport.height);
  }

  // Does not overlap the fixed Menu pill sharing the same corner of the screen.
  const menuButton = page.getByRole("button", { name: "Open menu" });
  await expect(menuButton).toBeVisible();
  const menuBox = await menuButton.boundingBox();
  expect(menuBox).not.toBeNull();
  if (buttonBox && menuBox) {
    const xOverlap =
      Math.min(buttonBox.x + buttonBox.width, menuBox.x + menuBox.width) -
      Math.max(buttonBox.x, menuBox.x);
    const yOverlap =
      Math.min(buttonBox.y + buttonBox.height, menuBox.y + menuBox.height) -
      Math.max(buttonBox.y, menuBox.y);
    const overlapArea = Math.max(0, xOverlap) * Math.max(0, yOverlap);
    expect(overlapArea).toBe(0);
  }
});
