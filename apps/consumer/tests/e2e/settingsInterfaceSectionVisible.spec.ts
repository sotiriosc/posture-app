import { test, expect } from "@playwright/test";
import { completeQuestionnaire, mockTrainingState } from "../../e2e/fixtures";

/**
 * Phase 6f, Commit 8 — restore the "Interface" (per-section visibility)
 * section on the regular-user Settings page. Phase 6.3 shipped the
 * <VisibilityGate>/useSectionVisibility feature, but its Settings mount only
 * ever lived on the admin-gated /settings page — regular users never saw it.
 */
test("the Interface section renders on Settings and its toggles persist across reload", async ({
  page,
}) => {
  await mockTrainingState(page, { authenticated: false });
  await completeQuestionnaire(page, { daysPerWeek: 3 });

  await page.goto("/account/settings");

  const section = page.getByTestId("settings-interface-section");
  await expect(section).toBeVisible();
  await expect(section.getByText("Interface")).toBeVisible();
  await expect(section.getByText("Results", { exact: true })).toBeVisible();
  await expect(section.getByText("Session", { exact: true })).toBeVisible();
  await expect(section.getByText("Day", { exact: true })).toBeVisible();
  await expect(section.getByText("Headline metric")).toBeVisible();

  const headlineToggle = page.getByTestId(
    "settings-interface-toggle-results.headline"
  );
  // Visible by default (bloom-plan § 6.3 ratified defaults).
  await expect(headlineToggle).toHaveAttribute("aria-checked", "true");

  await headlineToggle.click();
  await expect(headlineToggle).toHaveAttribute("aria-checked", "false");

  await page.reload();
  await expect(
    page.getByTestId("settings-interface-toggle-results.headline")
  ).toHaveAttribute("aria-checked", "false");

  await page.getByTestId("settings-interface-reset").click();
  await expect(
    page.getByTestId("settings-interface-toggle-results.headline")
  ).toHaveAttribute("aria-checked", "true");

  await page.reload();
  await expect(
    page.getByTestId("settings-interface-toggle-results.headline")
  ).toHaveAttribute("aria-checked", "true");
});

test("a section hidden by default (phase history) shows as off, and can be turned on", async ({
  page,
}) => {
  await mockTrainingState(page, { authenticated: false });
  await completeQuestionnaire(page, { daysPerWeek: 3 });

  await page.goto("/account/settings");

  const phaseHistoryToggle = page.getByTestId(
    "settings-interface-toggle-results.phaseHistory"
  );
  await expect(phaseHistoryToggle).toHaveAttribute("aria-checked", "false");

  await phaseHistoryToggle.click();
  await expect(phaseHistoryToggle).toHaveAttribute("aria-checked", "true");

  await page.reload();
  await expect(
    page.getByTestId("settings-interface-toggle-results.phaseHistory")
  ).toHaveAttribute("aria-checked", "true");
});
