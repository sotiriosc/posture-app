import { test, expect } from "@playwright/test";

/**
 * Phase 6h Commit 1 — favicon / PWA / OG icon paths must resolve to real files.
 * A missing icon reads as "hobby project"; the Praxis mark must load.
 */

const REQUIRED_ICON_PATHS = [
  "/icons/praxis-favicon-32.png",
  "/icons/praxis-mark-192.png",
  "/icons/praxis-mark-512.png",
  "/icons/praxis-logo-full.png",
  "/icons/praxis-og-1200x630.png",
  "/icons/icon-192.svg",
  "/icons/icon-512.svg",
] as const;

test("metadata favicon points at a resolvable Praxis icon file", async ({ page, request }) => {
  await page.goto("/");

  const iconLink = page.locator('link[rel="icon"]').first();
  await expect(iconLink).toHaveCount(1);

  const href = await iconLink.getAttribute("href");
  expect(href).toBeTruthy();

  const absolute = new URL(href!, page.url()).toString();
  const response = await request.get(absolute);
  expect(response.ok(), `favicon ${absolute} should return 2xx`).toBeTruthy();

  const contentType = response.headers()["content-type"] ?? "";
  expect(contentType.length).toBeGreaterThan(0);
  expect(
    contentType.includes("image/") || contentType.includes("svg"),
    `unexpected content-type for favicon: ${contentType}`
  ).toBeTruthy();

  // Browser-tab preference: PNG Praxis mark first (not a placeholder SVG).
  expect(href).toContain("praxis-favicon-32.png");
});

test("all metadata-referenced icon paths resolve to real files", async ({ request }) => {
  for (const path of REQUIRED_ICON_PATHS) {
    const response = await request.get(path);
    expect(response.ok(), `${path} should return 2xx`).toBeTruthy();
  }
});

test("web manifest icons resolve to real files", async ({ request }) => {
  const manifestResponse = await request.get("/manifest.webmanifest");
  expect(manifestResponse.ok()).toBeTruthy();

  const manifest = (await manifestResponse.json()) as {
    icons?: Array<{ src: string }>;
  };
  expect(manifest.icons?.length).toBeGreaterThan(0);

  for (const icon of manifest.icons ?? []) {
    const response = await request.get(icon.src);
    expect(response.ok(), `manifest icon ${icon.src} should return 2xx`).toBeTruthy();
  }
});
