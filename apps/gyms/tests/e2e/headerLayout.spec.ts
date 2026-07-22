import { test, expect, type Locator, type Page } from "@playwright/test";
import { e2eEmail, upsertE2eUser } from "./fixtures";

/**
 * Phase 6b, Commit 3 — Layout audit / header overlap regression (gyms).
 *
 * Mirrors the consumer spec: captures the member dashboard header region at the
 * four QA breakpoints and asserts ZERO overlapping bounding boxes between the
 * fixed control cluster and the page banner/info pills.
 */

const BREAKPOINTS = [
  { name: "1920x1080", width: 1920, height: 1080 },
  { name: "1440x900", width: 1440, height: 900 },
  { name: "1024x768", width: 1024, height: 768 },
  { name: "360x740", width: 360, height: 740 },
] as const;

type NamedBox = { name: string; x: number; y: number; w: number; h: number };

const OVERLAP_TOLERANCE = 1;

const overlapArea = (a: NamedBox, b: NamedBox) => {
  const xOverlap = Math.max(
    0,
    Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)
  );
  const yOverlap = Math.max(
    0,
    Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y)
  );
  return xOverlap * yOverlap;
};

const collectBoxes = async (
  entries: Array<{ name: string; locator: Locator }>
): Promise<NamedBox[]> => {
  const boxes: NamedBox[] = [];
  for (const entry of entries) {
    if ((await entry.locator.count()) === 0) continue;
    const first = entry.locator.first();
    if (!(await first.isVisible().catch(() => false))) continue;
    const box = await first.boundingBox();
    if (!box || box.width === 0 || box.height === 0) continue;
    boxes.push({ name: entry.name, x: box.x, y: box.y, w: box.width, h: box.height });
  }
  return boxes;
};

const headerEntries = (page: Page) => [
  { name: "menu", locator: page.getByRole("button", { name: "Open menu" }) },
  { name: "logout", locator: page.getByRole("button", { name: "Log out" }) },
  { name: "plan-chip", locator: page.locator(".ui-chip") },
  { name: "heading", locator: page.getByRole("heading", { level: 1 }) },
  { name: "edit-profile", locator: page.getByRole("button", { name: "Edit profile" }) },
  {
    name: "account-billing",
    locator: page.getByRole("button", { name: "Account and billing" }),
  },
  {
    name: "built-from-pill",
    locator: page.getByText("Built from your movement profile"),
  },
  { name: "plan-pill", locator: page.getByText(/^Plan:/) },
];

const findOverlaps = (boxes: NamedBox[]) => {
  const overlaps: string[] = [];
  for (let i = 0; i < boxes.length; i += 1) {
    for (let j = i + 1; j < boxes.length; j += 1) {
      if (overlapArea(boxes[i], boxes[j]) > OVERLAP_TOLERANCE) {
        overlaps.push(`${boxes[i].name} ∩ ${boxes[j].name}`);
      }
    }
  }
  return overlaps;
};

test("member dashboard header has no overlapping controls across breakpoints", async ({
  page,
}) => {
  const email = e2eEmail("header-layout");
  await upsertE2eUser({ email, password: "playwright-password", plan: "pro" });
  const login = await page.request.post("/api/auth/login", {
    data: { email, password: "playwright-password" },
  });
  expect(login.ok()).toBeTruthy();

  const allOverlaps: string[] = [];
  for (const bp of BREAKPOINTS) {
    await page.setViewportSize({ width: bp.width, height: bp.height });
    await page.goto("/results");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({
      timeout: 20_000,
    });
    await page.waitForTimeout(400);

    const boxes = await collectBoxes(headerEntries(page));
    for (const o of findOverlaps(boxes)) allOverlaps.push(`${bp.name}: ${o}`);
  }
  expect(allOverlaps, allOverlaps.join(" | ")).toEqual([]);
});

/**
 * Phase 6c, Commit 6 — same fix and same regression as consumer (identical
 * SessionClient.tsx sticky-header code in both apps). The 6b fix only
 * checked scroll position 0 on /results; the sticky in-page header on
 * /session re-anchors to the viewport top on scroll and can slide under the
 * fixed top-right cluster at md+, which the dashboard-only test never
 * exercises.
 */
const SESSION_SCROLL_BREAKPOINTS = [
  { name: "1920x1080", width: 1920, height: 1080 },
  { name: "1440x900", width: 1440, height: 900 },
  { name: "1024x768", width: 1024, height: 768 },
] as const;

const sessionHeaderEntries = (page: Page) => [
  { name: "menu", locator: page.getByRole("button", { name: "Open menu" }) },
  { name: "logout", locator: page.getByRole("button", { name: "Log out" }) },
  { name: "plan-chip", locator: page.locator(".ui-chip") },
  { name: "day-pill", locator: page.getByText(/^Day \d+ of \d+$/) },
];

test("session screen's sticky header has no overlapping controls at a mid-scroll state", async ({
  page,
}) => {
  const email = e2eEmail("header-layout-scroll");
  await upsertE2eUser({ email, password: "playwright-password", plan: "pro" });
  const login = await page.request.post("/api/auth/login", {
    data: { email, password: "playwright-password" },
  });
  expect(login.ok()).toBeTruthy();

  // Build a real program via the questionnaire flow (gyms has no dev-seed
  // persona that reaches a member-side /session state — its dev-seed data
  // is operator/roster-shaped) so the sticky session header actually
  // renders.
  await page.goto("/questionnaire");
  await page.evaluate(() => {
    localStorage.clear();
    indexedDB.deleteDatabase("bodycoach-logs");
  });
  await page.reload();
  await page.getByTestId("equipment-none").check();
  await page.getByTestId("days-3").click();
  await page.getByTestId("generate-routine").click();
  await expect(page).toHaveURL(/\/results/);

  const allOverlaps: string[] = [];
  for (const bp of SESSION_SCROLL_BREAKPOINTS) {
    await page.setViewportSize({ width: bp.width, height: bp.height });
    await page.goto("/session");
    await expect(page.getByText(/^Day \d+ of \d+$/)).toBeVisible({
      timeout: 20_000,
    });
    await page.waitForTimeout(400);

    // Scroll past the sticky header's normal position so it re-anchors to
    // the viewport top, then check it against the fixed control cluster.
    await page.mouse.wheel(0, 400);
    await page.waitForTimeout(300);

    const boxes = await collectBoxes(sessionHeaderEntries(page));
    for (const o of findOverlaps(boxes)) {
      allOverlaps.push(`${bp.name} (scrolled): ${o}`);
    }
  }
  expect(allOverlaps, allOverlaps.join(" | ")).toEqual([]);
});
