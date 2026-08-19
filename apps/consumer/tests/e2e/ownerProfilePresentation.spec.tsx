import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

const component = execFileSync(process.execPath, ["--import", "tsx",
  path.resolve(process.cwd(), "tests/e2e/fixtures/renderOwnerProfilePresentation.tsx")], {
  cwd: process.cwd(), encoding: "utf8",
});
const globalCss = readFileSync(path.resolve(process.cwd(), "src/app/globals.css"), "utf8")
  .replace('@import "tailwindcss";', "");
const componentCss = readFileSync(path.resolve(process.cwd(),
  "src/app/account/praxis-v2/owner-v2.module.css"), "utf8");
const documentHtml = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width">
  <style>${globalCss}\n${componentCss}</style></head><body>${component}</body></html>`;

test("owner profile uses readable dark Praxis presentation without overflow", async ({ page }, testInfo) => {
  const viewports = [{ name: "desktop-2048", width: 2048, height: 1200 },
    { name: "tablet-768", width: 768, height: 1024 }, { name: "mobile-390", width: 390, height: 844 }];

  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.setContent(documentHtml, { waitUntil: "load" });
    const root = page.getByTestId("owner-profile-presentation");
    await expect(root).toBeVisible();
    await expect(page.getByRole("heading", { name: "Training profile" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Required review" })).toBeVisible();
    await expect(page.getByText("Can you perform a hip hinge with a comfortable, controlled trunk position?"))
      .toBeVisible();
    await expect(page.getByText("Enroll in controlled Praxis V2 owner delivery")).toBeVisible();
    await expect(page.getByText("hinge-control")).toBeHidden();

    const layout = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      document: document.documentElement.scrollWidth,
    }));
    expect(layout.document).toBeLessThanOrEqual(layout.viewport);

    const contrastRatios = await page.evaluate(() => {
      type Color = { r: number; g: number; b: number; a: number };
      const parse = (value: string): Color => {
        const channels = value.match(/[\d.]+/g)?.map(Number) ?? [];
        return { r: channels[0] ?? 0, g: channels[1] ?? 0, b: channels[2] ?? 0, a: channels[3] ?? 1 };
      };
      const composite = (front: Color, behind: Color): Color => {
        const alpha = front.a + behind.a * (1 - front.a);
        if (alpha === 0) return { r: 0, g: 0, b: 0, a: 0 };
        return {
          r: (front.r * front.a + behind.r * behind.a * (1 - front.a)) / alpha,
          g: (front.g * front.a + behind.g * behind.a * (1 - front.a)) / alpha,
          b: (front.b * front.a + behind.b * behind.a * (1 - front.a)) / alpha,
          a: alpha,
        };
      };
      const background = (element: Element): Color => {
        const ancestry: Element[] = [];
        for (let current: Element | null = element; current; current = current.parentElement) ancestry.push(current);
        return ancestry.reverse().reduce((behind, current) =>
          composite(parse(getComputedStyle(current).backgroundColor), behind),
        { r: 255, g: 255, b: 255, a: 1 });
      };
      const luminance = (color: Color) => {
        const channels = [color.r, color.g, color.b].map((value) => {
          const normalized = value / 255;
          return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
        });
        return 0.2126 * channels[0]! + 0.7152 * channels[1]! + 0.0722 * channels[2]!;
      };
      return [".shell", ".title", ".kicker", ".status", ".section h2", ".field label", ".legend",
        ".check span", "#owner-goal", "#owner-mode", "#owner-days", "#owner-environment",
        "#owner-experience", ".fact > span:first-child", ".questionPrompt", ".questionReason", ".radio span",
        ".equipmentFacts h3", ".equipmentFacts li", ".button", ".buttonSecondary", ".muted"]
        .map((selector) => {
          const element = document.querySelector(selector)!;
          const behind = background(element);
          const foreground = composite(parse(getComputedStyle(element).color), behind);
          const foregroundLuminance = luminance(foreground);
          const backgroundLuminance = luminance(behind);
          return { selector, ratio: (Math.max(foregroundLuminance, backgroundLuminance) + 0.05) /
            (Math.min(foregroundLuminance, backgroundLuminance) + 0.05) };
        });
    });
    for (const result of contrastRatios) expect(result.ratio, result.selector).toBeGreaterThanOrEqual(4.5);

    for (const id of ["owner-goal", "owner-mode"]) {
      const disabledStyle = await page.locator(`#${id}`).evaluate((element) => ({
        opacity: getComputedStyle(element).opacity,
        textFill: getComputedStyle(element).webkitTextFillColor,
      }));
      expect(disabledStyle.opacity).toBe("1");
      expect(disabledStyle.textFill).not.toBe("rgba(0, 0, 0, 0)");
    }

    const select = page.locator("#owner-days");
    await select.focus();
    const focus = await select.evaluate((element) => ({ outline: getComputedStyle(element).outlineStyle,
      shadow: getComputedStyle(element).boxShadow }));
    expect(focus.outline === "none" && focus.shadow === "none").toBe(false);
    const reviewRadio = page.getByRole("radio", { name: "Yes, confirmed" });
    await reviewRadio.focus();
    const reviewFocus = await reviewRadio.evaluate((element) => ({ outline: getComputedStyle(element).outlineStyle,
      shadow: getComputedStyle(element).boxShadow }));
    expect(reviewFocus.outline === "none" && reviewFocus.shadow === "none").toBe(false);

    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: testInfo.outputPath(`owner-profile-${viewport.name}-viewport.png`) });
    await page.screenshot({ path: testInfo.outputPath(`owner-profile-${viewport.name}.png`), fullPage: true });
  }
});
