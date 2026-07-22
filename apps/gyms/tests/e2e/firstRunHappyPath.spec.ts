import { test, expect } from "@playwright/test";
import {
  completeQuestionnaire,
  getActiveProgramId,
  mockAuthSession,
  mockTrainingState,
} from "./fixtures";

/**
 * Phase 6.5 — First-run happy path smoke test (gyms).
 *
 * The operator happy path: an operator opens the member roster and drills into
 * a member to see their projection (same engine surface as the consumer results
 * screen), framed for operators. If any step breaks, ship-readiness is a lie.
 *
 * A program is seeded via the shared questionnaire flow first, so the drill-in
 * has a real projection to render rather than the empty state.
 */
test("first run: operator views a member's projection", async ({ page }) => {
  await mockAuthSession(page, { enabled: false, authenticated: false });
  await mockTrainingState(page, { authenticated: false });

  // Seed a real, persisted program locally so the drill-in projects results.
  await completeQuestionnaire(page, { daysPerWeek: 3 });
  expect(await getActiveProgramId(page)).toBeTruthy();

  // Operator opens the member roster.
  await page.goto("/gym-admin/members");
  await expect(
    page.getByRole("heading", { name: "Member Progress" })
  ).toBeVisible();

  // Drill into the first member.
  await page.getByRole("link", { name: /View/ }).first().click();
  await expect(page).toHaveURL(/\/gym-admin\/members\/.+/);

  // The operator sees the member's projection with operator framing:
  // a coach note and the ladder-progress projection (no gamification copy).
  await expect(page.getByText("Coach note")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Ladder Progress" })
  ).toBeVisible({ timeout: 20_000 });
});
