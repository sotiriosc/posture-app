import { test, expect } from "@playwright/test";
import {
  completeCurrentSession,
  completeQuestionnaire,
  getActiveProgramId,
  mockAuthSession,
  mockTrainingState,
} from "./fixtures";

test("questionnaire -> results -> session -> completion", async ({ page }) => {
  await mockAuthSession(page, { enabled: false, authenticated: false });
  await mockTrainingState(page, { authenticated: false });
  await completeQuestionnaire(page, { daysPerWeek: 3 });
  await completeCurrentSession(page);

  await expect(page.getByTestId("completed-count")).toContainText("1 completed");
});

test("session logging renders fixed history schema rows", async ({ page }) => {
  await mockAuthSession(page, { enabled: false, authenticated: false });
  await mockTrainingState(page, { authenticated: false });
  await completeQuestionnaire(page, { daysPerWeek: 3 });
  await completeCurrentSession(page);

  const programId = await getActiveProgramId(page);
  expect(programId).toBeTruthy();

  await page.goto(`/program/${programId}/day/0`);
  await expect(page.getByTestId("history-row-current").first()).toBeVisible();
  await expect(page.getByTestId("history-row-current").first()).toContainText("•");
  await expect(page.getByText("Tap for history")).toHaveCount(0);
});
