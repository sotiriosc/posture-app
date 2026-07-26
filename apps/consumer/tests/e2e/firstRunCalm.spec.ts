import { test, expect } from "@playwright/test";
import {
  completeQuestionnaire,
  mockAuthSession,
  mockTrainingState,
} from "../../e2e/fixtures";

/**
 * Phase 6L Commit 4 — first-run calm guard.
 *
 * A brand-new user completes onboarding and their first session encountering
 * ZERO non-essential prompts. Only the guide card (once) and the session
 * itself are allowed interruptions. Future features that add first-run
 * prompts must update this test deliberately.
 */
test("first run: no non-essential prompts through first session", async ({
  page,
}) => {
  await mockAuthSession(page, { enabled: false, authenticated: false });
  await mockTrainingState(page, { authenticated: false });

  await completeQuestionnaire(page, { daysPerWeek: 3 });

  // Dashboard after onboarding — before any session complete.
  await expect(page.getByTestId("feedback-session-prompt")).toHaveCount(0);
  await expect(page.getByTestId("retest-prompt-card")).toHaveCount(0);

  // Enter the first session — contract / maintain / skip prompts must not block.
  await page.getByTestId("start-selected-day").click();
  await expect(page).toHaveURL(/\/session/, { timeout: 20_000 });
  await expect(page.getByTestId("incomplete-log-it-now")).toHaveCount(0, {
    timeout: 15_000,
  });
  await expect(page.getByTestId("incomplete-skipped-it")).toHaveCount(0);
  await expect(page.getByTestId("suppress-incomplete-prompt")).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: /Your body has been responding well/i })
  ).toHaveCount(0);
  await expect(page.getByRole("button", { name: /^Sacrifice$/i })).toHaveCount(0);

  // Finish the session from here (already on /session).
  for (let i = 0; i < 20; i += 1) {
    const button = page.getByTestId("session-next");
    await expect(button).toBeEnabled();
    const label = (await button.textContent()) ?? "";
    await button.evaluate((element: HTMLElement) => element.click());
    if (label.toLowerCase().includes("finish")) break;
  }
  await expect(page.getByText("Session complete")).toBeVisible({
    timeout: 20_000,
  });
  await page.getByRole("button", { name: "Back to results" }).click();
  await expect(page).toHaveURL(/\/results/, { timeout: 20_000 });

  // Still no 5th-session feedback ask after session 1.
  await expect(page.getByTestId("feedback-session-prompt")).toHaveCount(0);
});
