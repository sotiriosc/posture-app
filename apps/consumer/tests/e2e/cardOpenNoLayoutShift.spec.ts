import { test, expect } from "@playwright/test";

/**
 * Phase 6c, Commit 2 — card-open background jump.
 *
 * Native <details>/<summary> (used for "N advancements logged" in
 * ResultsView, "Coach notes" in RoutineItemCoachingDetails, and the "View
 * details: plan reasoning" panel in ResultsRoutine) inserted/removed their
 * content in a single frame with no transition, so everything below jumped
 * instantly on click. All three were replaced with a shared
 * AnimatedDisclosure component that animates via grid-template-rows
 * (0fr -> 1fr), which — unlike a max-height animation — needs no JS
 * measurement of content height and therefore can't undershoot/overshoot it.
 *
 * Chrome's real Layout Instability API score for THIS specific panel turns
 * out to be near-zero regardless of animation (the shifted region is small
 * relative to the test viewport, so impact fraction * distance fraction
 * stays low even for an instant jump) — so it can't discriminate a fixed
 * regression from a real one here. Instead this samples the disclosure's
 * rendered height across animation frames immediately after the click: an
 * un-animated toggle reaches its final height on the very first frame, while
 * the intended fix takes ~200ms to get there. Asserting an early sample is
 * meaningfully below the final height is a direct, deterministic proxy for
 * "this expands gradually, not in one instant jump" — the actual bug.
 */
test("expanding the ladder advancements disclosure animates gradually, not in one jump", async ({
  page,
}) => {
  await page.goto("/dev-seed?seed=climber");
  await page.waitForURL((url) => !url.pathname.startsWith("/dev-seed"), {
    timeout: 30_000,
  });
  await expect(page).toHaveURL(/\/results\/view/);

  const toggle = page.getByText(/advancements? logged/).first();
  await expect(toggle).toBeVisible({ timeout: 10_000 });

  const contentId = await toggle.evaluate(
    (el) => el.closest("button")?.getAttribute("aria-controls") ?? null
  );
  expect(contentId).toBeTruthy();

  await toggle.click();

  const heights: number[] = await page.evaluate(async (id) => {
    const el = document.getElementById(id as string);
    if (!el) return [];
    const samples: number[] = [];
    const start = performance.now();
    while (performance.now() - start < 400) {
      samples.push(el.getBoundingClientRect().height);
      await new Promise((resolve) => requestAnimationFrame(resolve));
    }
    return samples;
  }, contentId);

  expect(heights.length).toBeGreaterThan(2);
  const finalHeight = heights[heights.length - 1];
  expect(finalHeight).toBeGreaterThan(20);

  // An instant, un-animated toggle would already be at (or within a hair of)
  // finalHeight on the very first sampled frame. A gradually-animating
  // disclosure spends its early frames well below that.
  const earliestHeight = heights[0];
  expect(earliestHeight).toBeLessThan(finalHeight * 0.85);

  // Collapsing must be equally gradual.
  await toggle.click();
  const closingHeights: number[] = await page.evaluate(async (id) => {
    const el = document.getElementById(id as string);
    if (!el) return [];
    const samples: number[] = [];
    const start = performance.now();
    while (performance.now() - start < 400) {
      samples.push(el.getBoundingClientRect().height);
      await new Promise((resolve) => requestAnimationFrame(resolve));
    }
    return samples;
  }, contentId);
  expect(closingHeights[0]).toBeGreaterThan(finalHeight * 0.15);
  expect(closingHeights[closingHeights.length - 1]).toBeLessThan(5);
});
