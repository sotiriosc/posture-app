import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { mockTrainingState, prepareCleanQuestionnaire, resetBrowserState } from "./fixtures";

const outputRoot = path.resolve(
  process.cwd(),
  "test-results/product-goal-context-design/gyms"
);

type RenderRecord = {
  artifact: string;
  sha256: string;
  viewport: { width: number; height: number };
  state: string;
  horizontalOverflow: boolean;
  fixedControlOverlap: boolean;
  trainingModeControlCount: number;
  equipmentLocked: boolean;
};

async function layoutResult(page: Page) {
  return page.evaluate(() => {
    const submit = document.querySelector<HTMLElement>("[data-testid='generate-routine']");
    const fixedControls = [...document.querySelectorAll<HTMLElement>("button")].filter((button) => {
      const style = getComputedStyle(button);
      const name = button.getAttribute("aria-label") ?? button.textContent ?? "";
      return style.position === "fixed" && /guide|menu/i.test(name);
    });
    const submitRect = submit?.getBoundingClientRect();
    const overlaps = (left: DOMRect, right: DOMRect) =>
      left.left < right.right &&
      left.right > right.left &&
      left.top < right.bottom &&
      left.bottom > right.top;
    return {
      horizontalOverflow:
        document.documentElement.scrollWidth > document.documentElement.clientWidth,
      fixedControlOverlap: Boolean(
        submitRect &&
          fixedControls.some((control) => overlaps(control.getBoundingClientRect(), submitRect))
      ),
      trainingModeControlCount: [
        ...document.querySelectorAll<HTMLButtonElement>("button:not([type='submit'])"),
      ].filter((button) =>
        /^(Build|Maintain|Recover)/.test(button.textContent?.trim() ?? "")
      ).length,
      equipmentLocked: Boolean(document.querySelector("[data-testid='gym-equipment-profile']")),
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
  const layout = await layoutResult(page);
  const artifact = `${state}-${viewport.width}x${viewport.height}.png`;
  const bytes = await page.screenshot({ fullPage: true });
  await writeFile(path.join(outputRoot, artifact), bytes);
  records.push({
    artifact,
    sha256: createHash("sha256").update(bytes).digest("hex"),
    viewport,
    state,
    ...layout,
  });
  expect(layout.horizontalOverflow).toBe(false);
  expect(layout.fixedControlOverlap).toBe(false);
}

test("captures sanitized current-head gyms questionnaire states", async ({ page }) => {
  await mkdir(outputRoot, { recursive: true });
  await mockTrainingState(page, { authenticated: false });
  await prepareCleanQuestionnaire(page);

  const records: RenderRecord[] = [];
  await capture(page, records, "questionnaire-default", { width: 1440, height: 900 });
  await capture(page, records, "questionnaire-default", { width: 390, height: 844 });

  await page.goto("/");
  await resetBrowserState(page);
  await page.goto("/questionnaire?demo=buyer");
  await expect(page.getByTestId("gym-equipment-profile")).toBeVisible();
  await expect(page.getByTestId("equipment-gym")).toHaveCount(0);
  await capture(page, records, "buyer-demo-locked-equipment", { width: 1440, height: 900 });
  await capture(page, records, "buyer-demo-locked-equipment", { width: 390, height: 844 });

  const layout = await layoutResult(page);
  expect(layout.trainingModeControlCount).toBe(0);
  expect(layout.equipmentLocked).toBe(true);
  expect(await page.getByText("Knees", { exact: true }).count()).toBe(0);
  expect(await page.getByText(/band type|long resistance band|loop\/miniband/i).count()).toBe(0);

  await writeFile(
    path.join(outputRoot, "manifest.json"),
    `${JSON.stringify({ app: "gyms", records }, null, 2)}\n`,
    "utf8"
  );
});
