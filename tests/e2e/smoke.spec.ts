import { test, expect } from "@playwright/test";

test("questionnaire -> results -> session -> completion", async ({ page }) => {
  await page.goto("/questionnaire");
  await page.evaluate(async () => {
    localStorage.clear();
    indexedDB.deleteDatabase("bodycoach-logs");
  });
  await page.reload();

  await page.getByTestId("equipment-none").check();
  await page.getByTestId("days-3").click();
  await page.getByTestId("generate-routine").click();

  await expect(page).toHaveURL(/\/results/);
  await page.getByTestId("start-selected-day").click();

  await expect(page).toHaveURL(/\/session/);

  for (let i = 0; i < 12; i += 1) {
    const button = page.getByTestId("session-next");
    const label = (await button.textContent()) ?? "";
    await button.click();
    if (label.toLowerCase().includes("finish")) {
      break;
    }
  }

  await expect(page.getByText("Session complete")).toBeVisible();
  await page.getByRole("button", { name: "Back to results" }).click();

  await expect(page).toHaveURL(/\/results/);
  await expect(page.getByTestId("completed-count")).toContainText("1 completed");
});
