import { test, expect } from "@playwright/test";
import { completeQuestionnaire, mockTrainingState } from "../../e2e/fixtures";

/**
 * Phase 6f, Commit 5.b — engine "cycle" vocabulary must never leak into
 * user-facing copy; it renders as "Week X of 4" instead.
 */
test("the dashboard hero shows 'Week X of 4' instead of a raw 'Cycle: N' chip", async ({
  page,
}) => {
  await mockTrainingState(page, { authenticated: false });
  await completeQuestionnaire(page, { daysPerWeek: 3 });

  await expect(page.getByText(/^Week \d of 4$/)).toBeVisible();
  await expect(page.getByText(/^Cycle/)).toHaveCount(0);
});
