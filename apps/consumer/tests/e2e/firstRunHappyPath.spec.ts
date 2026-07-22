import { test, expect } from "@playwright/test";
import {
  completeCurrentSession,
  completeQuestionnaire,
  getActiveProgramId,
  getStoredDaysPerWeek,
  mockAuthSession,
  mockTrainingState,
} from "../../e2e/fixtures";

/**
 * Phase 6.5 — First-run happy path smoke test (consumer).
 *
 * If any step here breaks, ship-readiness is a lie. The path:
 *   open app → complete onboarding as a Build-intent user → generate program
 *   → open session → mark exercises complete → open results → see headline.
 *
 * trainingIntent defaults to "build" for new profiles (Phase 3.3), so the
 * default questionnaire flow IS the Build-intent flow.
 */
test("first run: onboarding → program → session → results headline", async ({
  page,
}) => {
  await mockAuthSession(page, { enabled: false, authenticated: false });
  await mockTrainingState(page, { authenticated: false });

  // Onboarding + program generation (lands on the results dashboard).
  await completeQuestionnaire(page, { daysPerWeek: 3 });

  // A program was actually generated and persisted.
  const programId = await getActiveProgramId(page);
  expect(programId).toBeTruthy();

  // Build-intent user: default profile has no explicit override → "build".
  const daysPerWeek = await getStoredDaysPerWeek(page);
  expect(daysPerWeek).toBe(3);

  // Open the session and mark exercises complete.
  await completeCurrentSession(page);
  await expect(page.getByTestId("completed-count")).toContainText("1 completed");

  // Open the undeniable-results screen and see the headline metric.
  await page.goto("/results/view");
  const headline = page.getByTestId("results-headline");
  await expect(headline).toBeVisible({ timeout: 20_000 });
  // The headline is always an honest number + label (rungs climbed OR clean
  // sessions building baseline) — never blank, never a fake score.
  await expect(headline).toContainText(/clean session|ladder rung/);
});
