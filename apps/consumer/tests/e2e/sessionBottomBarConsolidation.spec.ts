import { test, expect } from "@playwright/test";
import { e2eEmail, upsertE2eUser } from "../../e2e/fixtures";

/**
 * Phase 6d, Commit 1 — session screen bar consolidation.
 *
 * Locks the two acceptance criteria named in the spec:
 *   1. The bottom bar is one thin three-action row — [i] [Next →] [Menu] —
 *      not a huge Next button stacked above two separately-floating chips.
 *   2. Total fixed-band footprint (the sticky top header+focus card, plus
 *      this bottom bar) is <= 40% of viewport height at 390x844 once the
 *      header has collapsed to its single-line "active exercise" state
 *      (i.e. past the first exercise, per SR-6d / Commit 1).
 */

const MOBILE_VIEWPORTS = [
  { name: "iphone15", width: 390, height: 844 },
  { name: "iphone-se", width: 360, height: 740 },
] as const;

async function seedAndReachSession(page: import("@playwright/test").Page) {
  const email = e2eEmail(`bottom-bar-${Math.random().toString(36).slice(2, 8)}`);
  await upsertE2eUser({ email, password: "playwright-password", plan: "pro" });
  const login = await page.request.post("/api/auth/login", {
    data: { email, password: "playwright-password" },
  });
  expect(login.ok()).toBeTruthy();

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
}

for (const viewport of MOBILE_VIEWPORTS) {
  test(`bottom bar is a single consolidated three-action row on phone (${viewport.name})`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await seedAndReachSession(page);

    const guideButton = page.getByTestId("session-bar-guide");
    const nextButton = page.getByTestId("session-next");
    const menuButton = page.getByTestId("session-bar-menu");

    await expect(guideButton).toBeVisible();
    await expect(nextButton).toBeVisible();
    await expect(menuButton).toBeVisible();

    // The old separate floating Guide button must not also be visible on
    // phone — otherwise this isn't "consolidated," it's just relabeled. (It
    // still exists in the DOM, CSS-hidden below md, so the desktop layout
    // is untouched by this pass.)
    await expect(page.locator('[aria-label="Open onboarding guide"]')).toBeHidden();

    const guideBox = await guideButton.boundingBox();
    const nextBox = await nextButton.boundingBox();
    const menuBox = await menuButton.boundingBox();
    expect(guideBox).not.toBeNull();
    expect(nextBox).not.toBeNull();
    expect(menuBox).not.toBeNull();
    if (!guideBox || !nextBox || !menuBox) return;

    // All three >= 44px tall (Apple HIG minimum tap target).
    expect(guideBox.height).toBeGreaterThanOrEqual(44);
    expect(nextBox.height).toBeGreaterThanOrEqual(44);
    expect(menuBox.height).toBeGreaterThanOrEqual(44);

    // Ordered left-to-right: guide, next, menu — and non-overlapping.
    expect(guideBox.x + guideBox.width).toBeLessThanOrEqual(nextBox.x + 1);
    expect(nextBox.x + nextBox.width).toBeLessThanOrEqual(menuBox.x + 1);

    // "Equal width class": guide/menu (icon-only) share one width; Next is
    // visually primary via color, not by dominating the row's width the way
    // the old full-width button did.
    expect(Math.abs(guideBox.width - menuBox.width)).toBeLessThan(4);
    expect(nextBox.width).toBeLessThan(guideBox.width * 2.2);

    // Opens the same guide panel the old floating trigger opened.
    await guideButton.click();
    await expect(page.getByRole("dialog", { name: "Onboarding guide" })).toBeVisible();
    await page.getByRole("button", { name: "Close", exact: true }).click();
  });
}

test("fixed-band footprint is <= 40% of viewport height once the header has collapsed", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await seedAndReachSession(page);

  // First exercise still shows the full session-start header by design
  // (Commit 1); advance once so we're measuring the steady "active exercise"
  // state the acceptance criterion is actually about.
  await expect(page.getByTestId("session-header-full")).toBeVisible();
  await page.getByTestId("session-next").click();
  await expect(page.getByTestId("session-header-compact")).toBeVisible({
    timeout: 10_000,
  });

  const footprint = await page.evaluate(() => {
    const isFixedBand = (el: Element) => {
      const style = window.getComputedStyle(el);
      return style.position === "sticky" || style.position === "fixed";
    };
    // Only count top-level fixed/sticky bands, not their descendants, so a
    // sticky wrapper and its (non-fixed) children don't get double-counted.
    const candidates = Array.from(document.body.querySelectorAll("*")).filter(isFixedBand);
    const topLevel = candidates.filter(
      (el) => !candidates.some((other) => other !== el && other.contains(el))
    );
    return topLevel
      .map((el) => el.getBoundingClientRect().height)
      .filter((height) => height > 0)
      .reduce((sum, height) => sum + height, 0);
  });

  const viewportHeight = 844;
  const footprintRatio = footprint / viewportHeight;
  expect(footprintRatio).toBeLessThanOrEqual(0.4);
});
