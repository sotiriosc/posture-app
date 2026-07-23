import { test, expect } from "@playwright/test";
import {
  completeQuestionnaire,
  e2eEmail,
  mockAuthSession,
  mockTrainingState,
  upsertE2eUser,
} from "../../e2e/fixtures";

/**
 * Phase 6d, Commit 4 — Progress screen honest early numbers.
 *
 * Locks the acceptance criterion: metrics below their statistical floor
 * show baseline coaching copy instead of a near-zero number that reads
 * like a report card on a user who is, by definition, just starting.
 */

test("fresh user sees baseline coaching copy instead of near-zero metrics on the Progress screen", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockAuthSession(page, { enabled: false, authenticated: false });
  await mockTrainingState(page, { authenticated: false });
  await completeQuestionnaire(page);

  await page.goto("/progress");
  await expect(page.getByText("Training insights")).toBeVisible({ timeout: 15_000 });

  // Consistency %, streak, and trend are all below floor for a fresh user —
  // each shows the baseline coaching line instead of a number.
  const baselineNotices = page.getByText("Building your baseline.", { exact: false });
  expect(await baselineNotices.count()).toBeGreaterThanOrEqual(3);

  // "Sessions this week" is never gated — it's a count, not a judgment —
  // and its copy is reframed to trajectory tone rather than a bare label.
  await expect(page.getByText("Log a session this week to get started.")).toBeVisible();
});

test("an established user with real history sees real Progress numbers, not baseline copy", async ({
  page,
}) => {
  const email = e2eEmail("progress-floors-established");
  await upsertE2eUser({ email, password: "playwright-password", plan: "pro" });
  const login = await page.request.post("/api/auth/login", {
    data: { email, password: "playwright-password" },
  });
  expect(login.ok()).toBeTruthy();

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/dev-seed?seed=climber");
  await page.waitForURL((url) => !url.pathname.startsWith("/dev-seed"), {
    timeout: 30_000,
  });
  await page.waitForTimeout(500);
  await page.evaluate(() => {
    localStorage.setItem(
      "posture_questionnaire",
      JSON.stringify({
        goals: "Improve posture",
        painAreas: [],
        experience: "Beginner",
        equipment: ["none"],
        daysPerWeek: 3,
      })
    );
    // dev-seed activates the fixture's program "now," which stamps a fresh
    // activeProgramBaselineAt — fine for most metrics, but it defeats the
    // "2+ full weeks" streak floor on a fixture whose actual session
    // history is months old. Back-date it so the streak floor reflects the
    // fixture's real history, the same way a long-tenured real user's
    // baseline would read.
    const raw = localStorage.getItem("app_state_v1");
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      parsed.activeProgramBaselineAt = Date.now() - 30 * 24 * 60 * 60 * 1000;
      localStorage.setItem("app_state_v1", JSON.stringify(parsed));
    }
  });

  await page.goto("/progress");
  await expect(page.getByText("Training insights")).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText("Since active baseline")).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText("Based on recent difficulty pattern")).toBeVisible();
  await expect(
    page.getByText("Consecutive weeks hitting", { exact: false })
  ).toBeVisible();
  await expect(page.getByText("Building your baseline.", { exact: false })).toHaveCount(0);
});
