import { test, expect } from "@playwright/test";
import {
  completeQuestionnaire,
  e2eEmail,
  loginE2eUser,
  mockTrainingState,
  prepareCleanQuestionnaire,
} from "../../e2e/fixtures";

/**
 * Fresh users must not see judgmental near-zero readiness/consistency %.
 * Below 3 completed sessions, dashboard surfaces show baseline coaching copy.
 */
test("fresh user sees baseline readiness/consistency copy on the dashboard", async ({
  page,
}) => {
  const email = e2eEmail("baseline-metrics");
  const password = "playwright-password";
  await loginE2eUser(page, { email, password, plan: "free" });
  await mockTrainingState(page, { authenticated: false });

  await page.setViewportSize({ width: 390, height: 844 });
  await completeQuestionnaire(page);

  await expect(page.getByText("Praxis dashboard", { exact: true })).toBeVisible({
    timeout: 30_000,
  });

  await expect(
    page.getByText("Readiness: building your baseline", { exact: true })
  ).toBeVisible();
  await expect(page.getByText(/Training readiness:\s*\d+%/i)).toHaveCount(0);
  await expect(page.getByText(/Consistency\s+\d+%/)).toHaveCount(0);
});

test("questionnaire defaults equipment to Gym", async ({ page }) => {
  const email = e2eEmail("equipment-default-gym");
  const password = "playwright-password";
  await loginE2eUser(page, { email, password, plan: "free" });
  await mockTrainingState(page, { authenticated: false });

  await page.setViewportSize({ width: 390, height: 844 });
  await prepareCleanQuestionnaire(page);

  await expect(page.getByTestId("equipment-gym")).toBeChecked();
  await expect(page.getByTestId("equipment-none")).not.toBeChecked();
});
