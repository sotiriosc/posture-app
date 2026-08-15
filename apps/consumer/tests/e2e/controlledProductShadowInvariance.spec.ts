import { expect, test } from "@playwright/test";
import { completeQuestionnaire, e2eEmail, getActiveProgramId, loginE2eUser,
  mockTrainingState } from "../../e2e/fixtures";

test("controlled Product shadow is request- and UI-inert while default-off", async ({ page }) => {
  const password = "playwright-password";
  await loginE2eUser(page, { email: e2eEmail("shadow-off-consumer"), password, plan: "free" });
  await mockTrainingState(page, { authenticated: false });
  let shadowRequests = 0;
  page.on("request", (request) => {
    if (new URL(request.url()).pathname === "/api/training/v2-shadow") shadowRequests += 1;
  });

  await completeQuestionnaire(page, { daysPerWeek: 3 });
  expect(await getActiveProgramId(page)).toBeTruthy();
  await expect(page).toHaveURL(/\/results/);
  await page.waitForTimeout(100);
  expect(shadowRequests).toBe(0);
  await expect(page.locator("[data-product-shadow], [data-v2-shadow]")).toHaveCount(0);
});
