import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { mockTrainingState, prepareCleanQuestionnaire } from "../../e2e/fixtures";

const outputRoot = path.resolve(
  process.cwd(),
  "test-results/product-goal-context-design/consumer"
);

type RenderRecord = {
  artifact: string;
  sha256: string;
  viewport: { width: number; height: number };
  state: string;
  horizontalOverflow: boolean;
  fixedControlOverlap: boolean;
  fieldOrder: string[];
  visibleGoal: string;
};

const currentQuestionnaire = {
  goals: "Improve posture",
  painAreas: [],
  experience: "Beginner",
  equipment: ["gym"],
  daysPerWeek: 3,
};

async function semanticLayout(page: Page) {
  return page.evaluate(() => {
    const form = document.querySelector<HTMLElement>("[data-testid='questionnaire-form']");
    const submit = document.querySelector<HTMLElement>("[data-testid='generate-routine']");
    const fixedControls = [...document.querySelectorAll<HTMLElement>("button")].filter((button) => {
      const style = getComputedStyle(button);
      const name = button.getAttribute("aria-label") ?? button.textContent ?? "";
      return style.position === "fixed" && /guide|menu/i.test(name);
    });
    const intersects = (left: DOMRect, right: DOMRect) =>
      left.left < right.right &&
      left.right > right.left &&
      left.top < right.bottom &&
      left.bottom > right.top;
    const submitRect = submit?.getBoundingClientRect();
    const fixedControlOverlap = Boolean(
      submitRect &&
        fixedControls.some((control) =>
          intersects(control.getBoundingClientRect(), submitRect)
        )
    );
    const labels = form
      ? [...form.querySelectorAll("p, label")]
          .map((entry) => entry.textContent?.trim() ?? "")
          .filter((entry) =>
            [
              "Days per week",
              "Primary goal",
              "How would you describe your current approach?",
              "Pain areas",
              "Training experience",
              "Equipment",
            ].includes(entry)
          )
      : [];
    const select = form?.querySelector<HTMLSelectElement>("select");
    return {
      horizontalOverflow:
        document.documentElement.scrollWidth > document.documentElement.clientWidth,
      fixedControlOverlap,
      fieldOrder: labels,
      visibleGoal: select?.value ?? "",
      selectAssociatedLabelCount: select?.labels.length ?? 0,
      fieldsetCount: form?.querySelectorAll("fieldset").length ?? 0,
    };
  });
}

async function capture(
  page: Page,
  records: RenderRecord[],
  state: string,
  viewport: { width: number; height: number }
) {
  await page.setViewportSize(viewport);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addStyleTag({
    content: "*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}",
  });
  await page.evaluate(async () => {
    await document.fonts.ready;
    window.scrollTo(0, document.documentElement.scrollHeight);
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
  });
  const layout = await semanticLayout(page);
  const artifact = `${state}-${viewport.width}x${viewport.height}.png`;
  const bytes = await page.screenshot({ fullPage: true });
  await writeFile(path.join(outputRoot, artifact), bytes);
  records.push({
    artifact,
    sha256: createHash("sha256").update(bytes).digest("hex"),
    viewport,
    state,
    horizontalOverflow: layout.horizontalOverflow,
    fixedControlOverlap: layout.fixedControlOverlap,
    fieldOrder: layout.fieldOrder,
    visibleGoal: layout.visibleGoal,
  });
  expect(layout.horizontalOverflow).toBe(false);
  expect(layout.fixedControlOverlap).toBe(false);
}

test("captures sanitized current-head consumer questionnaire states", async ({ page }) => {
  await mkdir(outputRoot, { recursive: true });
  await mockTrainingState(page, { authenticated: false });
  await prepareCleanQuestionnaire(page);

  const records: RenderRecord[] = [];
  const desktop = { width: 1440, height: 900 };
  await capture(page, records, "questionnaire-default", desktop);

  for (const goal of [
    "Improve posture",
    "Reduce pain",
    "Athletic performance",
    "General fitness",
  ]) {
    await page.locator("select").selectOption({ label: goal });
    await capture(page, records, `goal-${goal.toLowerCase().replaceAll(" ", "-")}`, desktop);
  }

  for (const mode of ["Build", "Maintain", "Recover"]) {
    await page.getByRole("button", { name: new RegExp(`^${mode}`) }).first().click();
    await capture(page, records, `training-mode-${mode.toLowerCase()}`, desktop);
  }

  for (const equipment of ["none", "bands", "dumbbells", "gym"]) {
    await page.getByTestId("equipment-none").check();
    if (equipment !== "none") {
      await page.getByTestId(`equipment-${equipment}`).check();
    }
    await capture(page, records, `equipment-${equipment}`, desktop);
  }

  for (const viewport of [
    { width: 1024, height: 768 },
    { width: 390, height: 844 },
    { width: 360, height: 800 },
    { width: 320, height: 800 },
  ]) {
    await capture(page, records, "questionnaire-responsive", viewport);
  }

  await page.evaluate((questionnaire) => {
    localStorage.setItem("posture_questionnaire", JSON.stringify(questionnaire));
    localStorage.setItem(
      "app_state_v1",
      JSON.stringify({ activeProgramId: "synthetic-program", programVersion: 1, updatedAt: 1 })
    );
  }, currentQuestionnaire);
  await page.reload();
  await page.getByTestId("days-4").click();
  await page.getByTestId("generate-routine").click();
  await expect(page.getByTestId("questionnaire-change-confirm-modal")).toBeVisible();
  await capture(page, records, "dirty-state-confirmation", { width: 390, height: 844 });

  await page.getByTestId("questionnaire-change-cancel").click();
  await page.evaluate(() => {
    localStorage.setItem(
      "app_state_v1",
      JSON.stringify({
        activeProgramId: "synthetic-program",
        activeSessionId: "synthetic-session",
        programVersion: 1,
        updatedAt: 1,
      })
    );
  });
  await page.reload();
  await page.getByTestId("days-5").click();
  await page.getByTestId("generate-routine").click();
  await expect(page.getByText(/active session is in progress/i)).toBeVisible();
  await capture(page, records, "active-session-warning", { width: 390, height: 844 });

  const currentSemantics = await semanticLayout(page);
  expect(currentSemantics.selectAssociatedLabelCount).toBe(0);
  expect(currentSemantics.fieldsetCount).toBe(0);
  expect(await page.getByText("Knees", { exact: true }).count()).toBe(0);
  expect(await page.getByText(/band type|long resistance band|loop\/miniband/i).count()).toBe(0);

  await writeFile(
    path.join(outputRoot, "manifest.json"),
    `${JSON.stringify({ app: "consumer", records }, null, 2)}\n`,
    "utf8"
  );
});
