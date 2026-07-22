import { test, expect, type Locator, type Page } from "@playwright/test";
import { e2eEmail, upsertE2eUser } from "../../e2e/fixtures";

/**
 * Phase 6b, Commit 3 — Layout audit / header overlap regression.
 *
 * The dashboard header stacks a fixed top-right control cluster (Log in/out,
 * plan chip, Menu) against the page banner (title, Edit profile, Account and
 * billing) and the info pills (Plan: …, "Built from your movement profile").
 * On narrower viewports these collided. This test captures the header region at
 * the four QA breakpoints and asserts ZERO overlapping bounding boxes.
 */

const BREAKPOINTS = [
  { name: "1920x1080", width: 1920, height: 1080 },
  { name: "1440x900", width: 1440, height: 900 },
  { name: "1024x768", width: 1024, height: 768 },
  { name: "360x740", width: 360, height: 740 },
] as const;

type NamedBox = { name: string; x: number; y: number; w: number; h: number };

const OVERLAP_TOLERANCE = 1; // px — ignore sub-pixel/rounding touches

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
    const count = await entry.locator.count();
    if (count === 0) continue;
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
      const area = overlapArea(boxes[i], boxes[j]);
      if (area > OVERLAP_TOLERANCE) {
        overlaps.push(
          `${boxes[i].name} ∩ ${boxes[j].name} = ${area.toFixed(0)}px²`
        );
      }
    }
  }
  return overlaps;
};

test("dashboard header has no overlapping controls across breakpoints", async ({
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
    // Let the fixed control cluster hydrate (AuthControls resolves useUserPlan).
    await page.waitForTimeout(400);

    const boxes = await collectBoxes(headerEntries(page));
    const overlaps = findOverlaps(boxes);
    for (const o of overlaps) allOverlaps.push(`${bp.name}: ${o}`);
  }
  expect(allOverlaps, allOverlaps.join(" | ")).toEqual([]);
});

/**
 * Phase 6c, Commit 6 — the 6b fix above only checked scroll position 0.
 * Sotirios kept seeing overlap on his machine after 6b shipped; the actual
 * bug was scoped to a screen and interaction the above test never visits:
 * the session screen's sticky in-page header (phase/day pill, progress bar)
 * re-anchors to the *viewport* top on scroll, which — unlike the initial
 * render, which is protected by .ui-shell's own padding-top — ignores that
 * ancestor padding and can slide directly under the fixed top-right
 * cluster (Log out/plan chip/Menu, which only moves to the top at md+).
 * This locks zero overlap at a mid-scroll state on the one screen that
 * actually has a sticky header competing for that space.
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

  await page.goto("/dev-seed?seed=climber");
  await page.waitForURL((url) => !url.pathname.startsWith("/dev-seed"), {
    timeout: 30_000,
  });
  await page.waitForTimeout(1000);
  // dev-seed only seeds program/logs, not the local questionnaire key the
  // dashboard/session flow checks for.
  await page.evaluate(() => {
    localStorage.setItem(
      "posture_questionnaire",
      JSON.stringify({
        goals: "Improve posture",
        painAreas: [],
        experience: "Beginner",
        equipment: ["none"],
        daysPerWeek: 3,
      })
    );
  });

  const allOverlaps: string[] = [];
  for (const bp of SESSION_SCROLL_BREAKPOINTS) {
    await page.setViewportSize({ width: bp.width, height: bp.height });
    // Visiting /results first ensures the seeded state above is picked up
    // before navigating straight to /session.
    await page.goto("/results");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({
      timeout: 20_000,
    });
    await page.waitForTimeout(500);
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
    const overlaps = findOverlaps(boxes);
    for (const o of overlaps) allOverlaps.push(`${bp.name} (scrolled): ${o}`);
  }
  expect(allOverlaps, allOverlaps.join(" | ")).toEqual([]);
});
