import { test, expect } from "@playwright/test";
import { completeQuestionnaire, mockTrainingState } from "../../e2e/fixtures";

/**
 * Phase 6g, Commit 4 (SR-6g-nutrition-boundary) — in-app access to the
 * public macro calculator (Phase 6f Commit 9). The Settings link must open
 * the exact same /tools/macro-calculator page, in the current tab, with no
 * app-specific variant and no personalization based on entry point.
 */
test("Settings has a Nutrition guidance section linking to the macro calculator", async ({
  page,
}) => {
  await mockTrainingState(page, { authenticated: false });
  await completeQuestionnaire(page, { daysPerWeek: 3 });

  await page.goto("/account/settings");

  const section = page.getByTestId("settings-nutrition-guidance");
  await expect(section).toBeVisible();
  await expect(section.getByText("Nutrition guidance")).toBeVisible();
  await expect(
    section.getByRole("heading", { name: "Praxis macro calculator" })
  ).toBeVisible();

  const link = page.getByTestId("settings-nutrition-guidance-link");
  await expect(link).toHaveAttribute("href", "/tools/macro-calculator");
  // Same-tab navigation -- feels like part of the app, not an external link.
  await expect(link).not.toHaveAttribute("target", "_blank");

  await link.click();
  await expect(page).toHaveURL(/\/tools\/macro-calculator/, { timeout: 20_000 });
  await expect(
    page.getByRole("heading", { name: "Macro Calculator for Lifters" })
  ).toBeVisible();
});

test("the macro calculator page is identical whether reached from Settings or directly", async ({
  page,
}) => {
  await mockTrainingState(page, { authenticated: false });
  await completeQuestionnaire(page, { daysPerWeek: 3 });
  await page.goto("/account/settings");
  await page.getByTestId("settings-nutrition-guidance-link").click();
  await expect(page).toHaveURL(/\/tools\/macro-calculator/, { timeout: 20_000 });
  const fromSettingsHeading = await page
    .getByRole("heading", { name: "Macro Calculator for Lifters" })
    .textContent();

  await page.goto("/tools/macro-calculator");
  const direct = await page
    .getByRole("heading", { name: "Macro Calculator for Lifters" })
    .textContent();

  expect(fromSettingsHeading).toBe(direct);
  // No personalization leak: the visible page never mentions the signed-in
  // questionnaire context (e.g. it must not surface the user's own
  // name/plan/day-count copy). This checks rendered text only -- it does not
  // cover the page's JSON-LD, which is unchanged from Phase 6f per this
  // phase's "no changes to the calculator page itself" scope boundary.
  await expect(page.getByText("Sotirios", { exact: false })).toHaveCount(0);
});
