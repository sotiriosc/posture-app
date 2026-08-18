import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
const component = execFileSync(process.execPath, ["--import", "tsx",
  path.resolve(process.cwd(), "tests/e2e/fixtures/renderOwnerPreviewPresentation.tsx")], {
  cwd: process.cwd(), encoding: "utf8",
});
const componentCss = readFileSync(path.resolve(process.cwd(),
  "src/app/account/praxis-v2/owner-v2.module.css"), "utf8");
const documentHtml = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width">
  <style>
    :root { --background: #0a0f19; }
    html, body { margin: 0; min-height: 100%; }
    body { background: var(--background); color: #cbd5e1; font-family: Manrope, Arial, sans-serif; letter-spacing: 0; }
    h1, h2, h3, h4, h5, h6 { color: #ffffff; font-family: Arial, sans-serif; letter-spacing: 0; }
    ${componentCss}
  </style></head><body>${component}</body></html>`;

test("owner preview is readable and responsive inside the dark account layout", async ({ page }, testInfo) => {
  const viewports = [{ name: "desktop-2048", width: 2048, height: 1200 },
    { name: "tablet-768", width: 768, height: 1024 }, { name: "mobile-390", width: 390, height: 844 }];

  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.setContent(documentHtml, { waitUntil: "load" });
    const root = page.getByTestId("owner-preview-presentation");
    await expect(root).toBeVisible();
    await expect(page.getByRole("heading", { name: "Session 1" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Session 2" })).toBeVisible();
    await expect(page.getByText("Application is unavailable in preview mode.")).toBeVisible();
    await expect(page.getByTestId("owner-preview-dose-block")).toHaveCount(16);
    await expect(page.getByTestId("owner-preview-prescription-trace").first()).not.toHaveAttribute("open", "");
    await expect(page.getByTestId("owner-preview-technical-details")).not.toHaveAttribute("open", "");

    const layout = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth,
      document: document.documentElement.scrollWidth,
      rootFontSize: Number.parseFloat(getComputedStyle(document.querySelector(
        "[data-testid='owner-preview-presentation']")!).fontSize) }));
    expect(layout.document).toBeLessThanOrEqual(layout.viewport);
    expect(layout.rootFontSize).toBeGreaterThanOrEqual(16);

    const contrastRatios = await page.evaluate(() => {
      const parse = (value: string) => (value.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
      const luminance = (color: number[]) => {
        const channels = color.map((value) => {
          const normalized = value / 255;
          return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
        });
        return 0.2126 * channels[0]! + 0.7152 * channels[1]! + 0.0722 * channels[2]!;
      };
      const background = (element: Element) => {
        let current: Element | null = element;
        while (current) {
          const value = getComputedStyle(current).backgroundColor;
          if (value !== "rgba(0, 0, 0, 0)" && value !== "transparent") return value;
          current = current.parentElement;
        }
        return "rgb(10, 15, 25)";
      };
      return [".previewShell", ".mode", ".status", ".statusLabel", ".notice", ".sessionMeta",
        ".doseFact dd", ".doseFact dt", ".code", ".warning", ".technical summary"].map((selector) => {
        const element = document.querySelector(selector)!;
        const foreground = luminance(parse(getComputedStyle(element).color));
        const behind = luminance(parse(background(element)));
        return { selector, ratio: (Math.max(foreground, behind) + 0.05) / (Math.min(foreground, behind) + 0.05) };
      });
    });
    for (const result of contrastRatios) expect(result.ratio, result.selector).toBeGreaterThanOrEqual(4.5);

    const headings = await page.locator("h1, h2, h3, h4, h5, h6").evaluateAll((elements) =>
      elements.map((element) => Number(element.tagName.slice(1))));
    for (let index = 1; index < headings.length; index += 1) {
      expect(headings[index]! - headings[index - 1]!).toBeLessThanOrEqual(1);
    }

    const firstTrace = page.getByTestId("owner-preview-prescription-trace").first();
    await firstTrace.locator("summary").focus();
    expect(await firstTrace.locator("summary").evaluate((element) => getComputedStyle(element).outlineStyle))
      .not.toBe("none");
    await page.keyboard.press("Enter");
    await expect(firstTrace).toHaveAttribute("open", "");
    await page.keyboard.press("Enter");
    await expect(firstTrace).not.toHaveAttribute("open", "");

    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: testInfo.outputPath(`owner-preview-${viewport.name}-viewport.png`) });
    await page.screenshot({ path: testInfo.outputPath(`owner-preview-${viewport.name}.png`), fullPage: true });
  }
});
