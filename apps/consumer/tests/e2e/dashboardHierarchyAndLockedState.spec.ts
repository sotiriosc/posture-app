import { test, expect } from "@playwright/test";
import {
  completeQuestionnaire,
  e2eEmail,
  mockAuthSession,
  mockTrainingState,
  upsertE2eUser,
} from "../../e2e/fixtures";

/**
 * Phase 6d, Commit 3 — dashboard hierarchy + honest-locked-state.
 *
 * Locks three acceptance criteria:
 * 1. Header pill hierarchy: "Edit profile" / "Account and billing" are
 *    tucked behind a "..." trigger instead of sitting as always-visible
 *    pills competing with the greeting and plan badge.
 * 2. Locked cards read as a small inline lock icon, not a loud full-line
 *    "LOCKED" badge.
 * 3. Card ordering: unlocked cards (Today, Week, Billing) come before
 *    locked-until-earned cards (Progress, Insights, History).
 */

const MOBILE_VIEWPORTS = [
  { name: "iphone15", width: 390, height: 844 },
  { name: "iphone-se", width: 360, height: 740 },
] as const;

for (const viewport of MOBILE_VIEWPORTS) {
  test(`dashboard header hides secondary actions behind "..." and locked cards use a small icon, not a badge (${viewport.name})`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await mockAuthSession(page, { enabled: false, authenticated: false });
    await mockTrainingState(page, { authenticated: false });

    // Fresh onboarding → a brand-new program with zero completed workouts.
    // dashboardLevel is 1 here, so Progress/Insights/History are locked —
    // the exact state the honest-locked-state UI needs to be checked against.
    await completeQuestionnaire(page);

    await expect(page.getByTestId("dashboard-edit-profile")).toBeHidden();
    await expect(page.getByTestId("dashboard-account-billing")).toBeHidden();
    await expect(page.getByText("Built from your movement profile")).toBeVisible();

    const trigger = page.getByTestId("dashboard-profile-menu-trigger");
    await expect(trigger).toBeVisible();
    const triggerBox = await trigger.boundingBox();
    expect(triggerBox).not.toBeNull();
    if (triggerBox) expect(triggerBox.height).toBeGreaterThanOrEqual(44);

    await trigger.click();
    await expect(page.getByTestId("dashboard-edit-profile")).toBeVisible();
    await trigger.click(); // close it back down

    // Locked cards: small inline lock icon, never a loud "LOCKED" badge.
    await expect(page.getByText("LOCKED", { exact: true })).toHaveCount(0);
    const lockIcons = page.getByLabel("Locked");
    expect(await lockIcons.count()).toBeGreaterThan(0);
  });
}

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
  const indexOf = (needle: string) => cardTitles.findIndex((text) => text.includes(needle));

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
