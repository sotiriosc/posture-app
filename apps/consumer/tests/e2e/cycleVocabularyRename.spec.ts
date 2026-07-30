import { test, expect } from "@playwright/test";
import { completeQuestionnaire, mockTrainingState } from "../../e2e/fixtures";

/**
 * Phase 6f, Commit 5.b — engine "cycle" vocabulary must never leak into
 * user-facing copy; phase progress renders against the Phase 6j 8-week gate.
 */
test("the dashboard hero shows phase week copy instead of a raw 'Cycle: N' chip", async ({
  page,
}) => {
  await mockTrainingState(page, { authenticated: false });
  await completeQuestionnaire(page, { daysPerWeek: 3 });

  await expect(page.getByText(/^Week \d of 8$/)).toBeVisible();
  await expect(page.getByText(/^Cycle/)).toHaveCount(0);
});
