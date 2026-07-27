import { test, expect } from "@playwright/test";
import {
  completeQuestionnaire,
  e2eEmail,
  loginE2eUser,
  mockTrainingState,
  upsertE2eUser,
} from "../../e2e/fixtures";

/**
 * Phase 6d, Commit 3 — dashboard hierarchy + honest-locked-state.
 *
 * Mobile: secondary account actions live in the bottom Menu (the top "..."
 * control was redundant and clipped off-screen). Desktop keeps "...".
 */

const MOBILE_VIEWPORTS = [
  { name: "iphone15", width: 390, height: 844 },
  { name: "iphone-se", width: 360, height: 740 },
] as const;

for (const viewport of MOBILE_VIEWPORTS) {
  test(`mobile dashboard hides top "..." menu; Edit profile is in bottom Menu (${viewport.name})`, async ({
    page,
  }) => {
    const email = e2eEmail(`dash-menu-${viewport.name}`);
    await loginE2eUser(page, {
      email,
      password: "playwright-password",
      plan: "free",
    });
    await mockTrainingState(page, { authenticated: false });
    await page.setViewportSize({
      width: viewport.width,
      height: viewport.height,
    });

    await completeQuestionnaire(page);

    await expect(page.getByTestId("dashboard-profile-menu-trigger")).toBeHidden();
    await expect(page.getByText("Built from your movement profile")).toBeVisible();

    await page.getByRole("button", { name: "Open menu" }).click();
    await expect(
      page.getByRole("link", { name: "Edit profile", exact: true })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Account and billing", exact: true })
    ).toBeVisible();

    await page.locator("aside").getByRole("button", { name: "Close" }).click();
    await expect(page.getByText("LOCKED", { exact: true })).toHaveCount(0);
    const lockIcons = page.getByLabel("Locked");
    expect(await lockIcons.count()).toBeGreaterThan(0);
  });
}

test("desktop dashboard keeps secondary actions behind '...'", async ({ page }) => {
  const email = e2eEmail("dash-menu-desktop");
  await loginE2eUser(page, {
    email,
    password: "playwright-password",
    plan: "free",
  });
  await mockTrainingState(page, { authenticated: false });
  await page.setViewportSize({ width: 1280, height: 800 });
  await completeQuestionnaire(page);

  const trigger = page.getByTestId("dashboard-profile-menu-trigger");
  await expect(trigger).toBeVisible();
  await trigger.click();
  await expect(page.getByTestId("dashboard-edit-profile")).toBeVisible();
  await expect(page.getByTestId("dashboard-account-billing")).toBeVisible();
});

test("dashboard card grid orders unlocked cards (Today, Week, Billing) before locked-until-earned cards (Progress, Insights, History)", async ({
  page,
}) => {
  const email = e2eEmail("dash-card-order");
  await upsertE2eUser({ email, password: "playwright-password", plan: "pro" });
  const login = await page.request.post("/api/auth/login", {
    data: { email, password: "playwright-password" },
  });
  expect(login.ok()).toBeTruthy();

  await page.setViewportSize({ width: 390, height: 844 });
  // The 12-week climber has completed workouts and a full cycle, so every
  // card is unlocked here — this test only cares about DOM order, not lock
  // state (that's covered above with a fresh, locked persona).
  await page.goto("/dev-seed?seed=climber");
  await page.waitForURL((url) => !url.pathname.startsWith("/dev-seed"), {
    timeout: 30_000,
  });
  await page.waitForTimeout(500);
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
  await expect(page.getByRole("button", { name: /^Today/ })).toBeVisible({
    timeout: 20_000,
  });

  const cardTitles = await page
    .getByRole("button", { name: /^Today|^Week|^Billing|^Progress|^Insights|^History/ })
    .allTextContents();
  const indexOf = (needle: string) =>
    cardTitles.findIndex((text) => text.includes(needle));

  const todayIndex = indexOf("Today");
  const weekIndex = indexOf("Week");
  const billingIndex = indexOf("Billing");
  const progressIndex = indexOf("Progress");
  const insightsIndex = indexOf("Insights");
  const historyIndex = indexOf("History");

  for (const unlockedIndex of [todayIndex, weekIndex, billingIndex]) {
    expect(unlockedIndex).toBeGreaterThanOrEqual(0);
    for (const lockedIndex of [progressIndex, insightsIndex, historyIndex]) {
      expect(lockedIndex).toBeGreaterThanOrEqual(0);
      expect(unlockedIndex).toBeLessThan(lockedIndex);
    }
  }
});
