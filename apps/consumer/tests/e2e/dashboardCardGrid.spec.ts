import { test, expect, type Page } from "@playwright/test";
import {
  completeQuestionnaire,
  mockAuthSession,
  mockTrainingState,
} from "../../e2e/fixtures";

/**
 * dashboard-grid — the six dashboard mode tiles (Today / Week / Billing /
 * Progress / Insights / History) render as a compact 2-column × 3-row grid
 * on phone viewports so all six are scannable without a long scroll, while
 * the existing 2-col (sm) / 3-col (lg) desktop layout is preserved. The free
 * user's Praxis Pro upsell collapses to a slim banner on phone and keeps its
 * full card on desktop.
 */

const CARD_NAME = /^Today|^Week|^Billing|^Progress|^Insights|^History/;

const cardBoxes = async (page: Page) => {
  const cards = page.getByRole("button", { name: CARD_NAME });
  await expect(cards.first()).toBeVisible({ timeout: 20_000 });
  const count = await cards.count();
  const boxes: Array<{ x: number; y: number; width: number; height: number }> =
    [];
  for (let i = 0; i < count; i += 1) {
    const box = await cards.nth(i).boundingBox();
    expect(box).not.toBeNull();
    if (box) boxes.push(box);
  }
  return boxes;
};

const distinctColumns = (
  boxes: Array<{ x: number }>,
  tolerance = 8
): number[] => {
  const columns: number[] = [];
  for (const box of boxes) {
    if (!columns.some((x) => Math.abs(x - box.x) <= tolerance)) {
      columns.push(box.x);
    }
  }
  return columns.sort((a, b) => a - b);
};

const PHONE_VIEWPORTS = [
  { name: "iphone15", width: 390, height: 844 },
  { name: "iphone-se", width: 360, height: 740 },
] as const;

for (const viewport of PHONE_VIEWPORTS) {
  test(`dashboard mode cards form a 2-column, 3-row compact grid on phone (${viewport.name})`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await mockAuthSession(page, { enabled: false, authenticated: false });
    await mockTrainingState(page, { authenticated: false });
    await completeQuestionnaire(page);

    const boxes = await cardBoxes(page);
    expect(boxes.length).toBe(6);

    // Exactly two columns on phone.
    const columns = distinctColumns(boxes);
    expect(columns.length).toBe(2);

    // Row 0 = tiles 0/1 side by side; row 1 starts below them.
    expect(Math.abs(boxes[0].y - boxes[1].y)).toBeLessThanOrEqual(4);
    expect(boxes[0].x).toBeLessThan(boxes[1].x);
    expect(boxes[2].y).toBeGreaterThan(boxes[0].y + 20);

    // Every tile is a comfortable, compact tap target (44px min, not the old
    // full-width ~280px stacked card).
    for (const box of boxes) {
      expect(box.height).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeLessThanOrEqual(240);
    }
  });
}

test("dashboard mode cards keep the 3-column desktop grid at 1440", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await mockAuthSession(page, { enabled: false, authenticated: false });
  await mockTrainingState(page, { authenticated: false });
  await completeQuestionnaire(page);

  const boxes = await cardBoxes(page);
  expect(boxes.length).toBe(6);

  // lg breakpoint keeps three columns: first three tiles share a row.
  const columns = distinctColumns(boxes);
  expect(columns.length).toBe(3);
  expect(Math.abs(boxes[0].y - boxes[1].y)).toBeLessThanOrEqual(4);
  expect(Math.abs(boxes[1].y - boxes[2].y)).toBeLessThanOrEqual(4);
  expect(boxes[3].y).toBeGreaterThan(boxes[0].y + 20);
});

test("free-user Praxis Pro upsell is a slim banner on phone and a full card on desktop", async ({
  page,
}) => {
  await mockAuthSession(page, {
    enabled: true,
    authenticated: true,
    plan: "free",
  });
  await mockTrainingState(page, { authenticated: true, snapshot: null });
  await page.route("**/api/billing/status", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true, stripeConfigured: true }),
    });
  });

  // Phone: slim banner copy visible, full-card heading hidden.
  await page.setViewportSize({ width: 390, height: 844 });
  await completeQuestionnaire(page);
  await expect(page.getByText("Unlock every training day")).toBeVisible({
    timeout: 20_000,
  });
  await expect(
    page.getByRole("button", { name: /Upgrade/ })
  ).toBeVisible();
  await expect(
    page.getByText("Unlock the full weekly plan")
  ).toBeHidden();

  // Desktop: full card heading visible, slim banner copy hidden.
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(
    page.getByText("Unlock the full weekly plan")
  ).toBeVisible();
  await expect(page.getByText("Unlock every training day")).toBeHidden();
});
