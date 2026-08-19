import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

const component = execFileSync(process.execPath, ["--import", "tsx",
  path.resolve(process.cwd(), "tests/e2e/fixtures/renderOwnerCalibrationSessionPresentation.tsx")], {
  cwd: process.cwd(), encoding: "utf8",
});
const componentCss = readFileSync(path.resolve(process.cwd(),
  "src/app/account/praxis-v2/owner-v2.module.css"), "utf8");
const documentHtml = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width">
  <style>
    :root { --background: #0a0f19; --foreground: #f8fafc; --accent: #34d399;
      --ui-input-placeholder: #a8b1bf; --ui-mist-border-strong: #536174; --ui-card-border: #536174;
      --ui-card-surface: #121b29; --ui-input-border: #718096; --ui-input-surface: #0f1724;
      --ui-input-text: #f8fafc; --focus-ring: 0 0 0 2px rgba(52, 211, 153, .28); }
    html, body { margin: 0; min-height: 100%; }
    body { background: var(--background); color: var(--foreground); font-family: Arial, sans-serif; letter-spacing: 0; }
    ${componentCss}
  </style></head><body>${component}</body></html>`;

test("calibration session results are accessible and responsive", async ({ page }, testInfo) => {
  const viewports = [{ name: "desktop-1440", width: 1440, height: 1000 },
    { name: "tablet-768", width: 768, height: 1024 }, { name: "mobile-390", width: 390, height: 844 }];

  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.setContent(documentHtml, { waitUntil: "load" });
    const root = page.getByTestId("owner-calibration-session-presentation");
    await expect(root).toBeVisible();
    await expect(page.getByRole("heading", { name: "Session results" })).toBeVisible();
    await expect(page.getByRole("spinbutton", { name: "Actual repetitions" }).first()).toBeVisible();
    await expect(page.getByRole("combobox", { name: "Effort scale" }).first()).toBeVisible();
    await expect(page.getByRole("combobox", { name: "Technique / control" }).first()).toBeVisible();
    await expect(page.getByRole("combobox", { name: "Pain / discomfort" }).first()).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Session notes (context only)" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Lighter" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Recovery" })).toBeDisabled();
    await expect(page.getByText(/do not prescribe a future load or apply progression/)).toBeVisible();

    const layout = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth,
      document: document.documentElement.scrollWidth,
      minControlHeight: Math.min(...[...document.querySelectorAll("input:not([type='checkbox']), select, button")]
        .map((element) => element.getBoundingClientRect().height)),
      fieldsetFits: [...document.querySelectorAll("fieldset")].every((element) =>
        element.scrollWidth <= element.clientWidth) }));
    expect(layout.document).toBeLessThanOrEqual(layout.viewport);
    expect(layout.minControlHeight).toBeGreaterThanOrEqual(44);
    expect(layout.fieldsetFits).toBe(true);

    const textarea = page.getByRole("textbox", { name: "Session notes (context only)" });
    await textarea.focus();
    expect(await textarea.evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe("none");
    const complete = page.getByRole("button", { name: "Complete session" });
    await complete.focus();
    expect(await complete.evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe("none");

    const primaryText = await root.textContent();
    expect(primaryText).not.toContain("owner-v2-calibration-obligation:");
    expect(primaryText).not.toContain("persistence-revision:");
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: testInfo.outputPath(`owner-calibration-session-${viewport.name}.png`),
      fullPage: true });
  }
});
