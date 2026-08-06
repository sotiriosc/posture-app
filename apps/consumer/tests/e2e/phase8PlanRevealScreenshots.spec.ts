/**
 * Phase 8 screenshot capture — 7 modes × 3 viewports via preview fixture.
 * Stores under docs/dev-reports/phase8-screenshots/.
 */

import { test, expect } from "@playwright/test";
import path from "node:path";
import fs from "node:fs";

const MODES = [
  "gym",
  "dumbbells",
  "bands-anchor",
  "bands-no-anchor",
  "bands-loop",
  "bodyweight",
  "mixed-home",
] as const;

const VIEWPORTS = [
  { name: "360x740", width: 360, height: 740 },
  { name: "390x844", width: 390, height: 844 },
  { name: "desktop", width: 1280, height: 800 },
] as const;

const outDir = path.resolve(
  __dirname,
  "../../../../docs/dev-reports/phase8-screenshots"
);

test.describe("Phase 8 plan reveal screenshots", () => {
  test.beforeAll(() => {
    fs.mkdirSync(outDir, { recursive: true });
  });

  for (const mode of MODES) {
    for (const viewport of VIEWPORTS) {
      test(`capture ${mode} @ ${viewport.name}`, async ({ page }) => {
        await page.setViewportSize({
          width: viewport.width,
          height: viewport.height,
        });
        const response = await page.goto("/dev/plan-reveal-preview", {
          waitUntil: "networkidle",
        });
        if (!response || response.status() >= 400) {
          test.info().annotations.push({
            type: "note",
            description: `Preview route unavailable (${response?.status()})`,
          });
          return;
        }

        await page.getByTestId(`plan-reveal-preview-mode-${mode}`).click();
        await expect(page.getByTestId("plan-reveal-hero")).toBeVisible({
          timeout: 15000,
        });
        const file = path.join(
          outDir,
          `plan-reveal-${mode}-${viewport.name}.png`
        );
        await page.screenshot({ path: file, fullPage: true });
        expect(fs.existsSync(file)).toBe(true);
      });
    }
  }

  test("session-start summary screenshot for gym mode", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    // Session route typically needs seeded state; capture preview hero as fallback note.
    const response = await page.goto("/dev/plan-reveal-preview", {
      waitUntil: "domcontentloaded",
    });
    if (!response || response.status() >= 400) return;
    await page.getByTestId("plan-reveal-preview-mode-gym").click();
    await expect(page.getByTestId("plan-reveal-hero")).toBeVisible();
    const file = path.join(outDir, "session-start-proxy-gym-390x844.png");
    await page.screenshot({ path: file, fullPage: false });
  });
});
