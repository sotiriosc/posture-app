import { test, expect } from "@playwright/test";
import { completeQuestionnaire, mockTrainingState } from "../../e2e/fixtures";

/**
 * Phase 6f, Commit 4 — "Next best action" coach note visible on the daily
 * dashboard, for free users too, without repeating identically day over
 * day.
 */
test("the daily Next best action note is visible on the dashboard from day one, unauthenticated/free included", async ({
  page,
}) => {
  await mockTrainingState(page, { authenticated: false });
  await completeQuestionnaire(page, { daysPerWeek: 3 });

  const banner = page.getByTestId("coach-note-banner");
  await expect(banner).toBeVisible();
  await expect(banner).toContainText("Next best action:");
});

test("an identical note is not repeated the next calendar day (never nag)", async ({
  page,
}) => {
  await mockTrainingState(page, { authenticated: false });
  await completeQuestionnaire(page, { daysPerWeek: 3 });

  const banner = page.getByTestId("coach-note-banner");
  await expect(banner).toBeVisible();
  const noteText = await banner.textContent();
  expect(noteText).toBeTruthy();

  // Back-date the stored evaluation to "yesterday" with the exact same note
  // — nothing in the app state changed (no session logged), so today's
  // freshly-computed note will be identical, and per the never-nag rule it
  // should now be suppressed rather than shown a second day running.
  await page.evaluate((note) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const y = yesterday.getFullYear();
    const m = `${yesterday.getMonth() + 1}`.padStart(2, "0");
    const d = `${yesterday.getDate()}`.padStart(2, "0");
    localStorage.setItem(
      "praxis_coach_note_v1",
      JSON.stringify({ date: `${y}-${m}-${d}`, note, shown: true })
    );
  }, noteText);

  await page.reload();
  await expect(page.getByText("Praxis dashboard", { exact: true })).toBeVisible({
    timeout: 20_000,
  });
  await expect(page.getByTestId("coach-note-banner")).toHaveCount(0);
});
