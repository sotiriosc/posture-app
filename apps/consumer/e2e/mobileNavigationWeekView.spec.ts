import { expect, test, type Page } from "@playwright/test";

const MOBILE_VIEWPORTS = [
  { width: 320, height: 800, label: "320w" },
  { width: 430, height: 932, label: "430w" },
];

const goToResults = async (page: Page) => {
  await page.goto("/questionnaire");
  await page.evaluate(() => {
    localStorage.clear();
    indexedDB.deleteDatabase("bodycoach-logs");
  });
  await page.reload();
  await page.getByTestId("equipment-none").check();
  await page.getByTestId("days-3").click();
  await page.getByTestId("generate-routine").click();
  await expect(page).toHaveURL(/\/results/);
};

for (const viewport of MOBILE_VIEWPORTS) {
  test(`mobile menu + week CTA remain visible (${viewport.label})`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await goToResults(page);

    const menuTrigger = page.getByRole("button", { name: "Open menu" });
    await expect(menuTrigger).toBeVisible();
    await menuTrigger.click();
    await expect(page.getByText("Navigation")).toBeVisible();
    await page.getByRole("button", { name: "Close", exact: true }).click();
    await expect(page.getByText("Navigation")).toHaveCount(0);

    const weekView = page.locator("#week-view");
    await weekView.scrollIntoViewIfNeeded();
    await weekView.getByRole("button", { name: /Day 1/i }).click();

    const startSelectedDayCta = weekView.getByRole("button", {
      name: "Start Selected Day",
    });
    await expect(startSelectedDayCta).toBeVisible();
    await expect(startSelectedDayCta).toBeEnabled();
    await expect(menuTrigger).toBeVisible();

    const ctaBox = await startSelectedDayCta.boundingBox();
    const menuBox = await menuTrigger.boundingBox();
    if (ctaBox && menuBox) {
      const overlaps =
        ctaBox.x < menuBox.x + menuBox.width &&
        ctaBox.x + ctaBox.width > menuBox.x &&
        ctaBox.y < menuBox.y + menuBox.height &&
        ctaBox.y + ctaBox.height > menuBox.y;
      expect(overlaps).toBe(false);
    }
  });
}
