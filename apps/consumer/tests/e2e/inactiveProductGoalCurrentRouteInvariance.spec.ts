import { expect, test } from "@playwright/test";
import { mockTrainingState, prepareCleanQuestionnaire } from "../../e2e/fixtures";

const legacyGoals = [
  "Improve posture",
  "Reduce pain",
  "Athletic performance",
  "General fitness",
];

const viewports = [
  { width: 320, height: 800 },
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1440, height: 900 },
];

test("ordinary questionnaire remains preview-free and responsive", async ({ page }) => {
  await mockTrainingState(page, { authenticated: false });
  await prepareCleanQuestionnaire(page);

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    const semantics = await page.evaluate(() => {
      const form = document.querySelector<HTMLElement>(
        "[data-testid='questionnaire-form']"
      );
      const select = form?.querySelector<HTMLSelectElement>("select");
      return {
        options: select ? [...select.options].map((option) => option.value) : [],
        defaultGoal: select?.value ?? null,
        optgroups: select?.querySelectorAll("optgroup").length ?? -1,
        previewPanels:
          form?.querySelectorAll(
            "[data-testid='inactive-goal-preview-panel'], [data-testid='inactive-goal-preview-submit-alert'], [data-testid='primary-goal-select']"
          ).length ?? -1,
        horizontalOverflow:
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth,
      };
    });

    expect(semantics.options).toEqual(legacyGoals);
    expect(semantics.defaultGoal).toBe("Improve posture");
    expect(semantics.optgroups).toBe(0);
    expect(semantics.previewPanels).toBe(0);
    expect(semantics.horizontalOverflow).toBe(false);
    await expect(page.getByText("Get stronger", { exact: true })).toHaveCount(0);
    await expect(page.getByText("INTERNAL PREVIEW", { exact: true })).toHaveCount(0);
    await expect(page.getByTestId("generate-routine")).toHaveText(
      "Build my Praxis plan"
    );
  }
});
