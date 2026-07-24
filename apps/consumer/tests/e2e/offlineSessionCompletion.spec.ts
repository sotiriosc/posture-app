import { test, expect } from "@playwright/test";
import { completeQuestionnaire, mockAuthSession } from "../../e2e/fixtures";

/**
 * Phase 6f, Commit 2 — offline mode for the current workout.
 *
 * Sotirios trains in a basement with spotty internet: session data written
 * while offline must never be lost, and must sync once the connection
 * returns. Local writes (IndexedDB) already worked offline before this
 * commit; the gap was the fire-and-forget server mirror (`pushTrainingPatch`
 * in trainingSyncClient.ts) having no retry. This drives a full session to
 * completion while genuinely offline (Playwright's `context.setOffline`,
 * which also flips `navigator.onLine` and fires real `online`/`offline`
 * events in Chromium), then reconnects and verifies the queued patches
 * drain automatically.
 */
test("offline session completion queues sync and drains once reconnected", async ({
  page,
  context,
}) => {
  await mockAuthSession(page, {
    enabled: true,
    authenticated: true,
    plan: "free",
  });
  await page.route("**/api/billing/status", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true, stripeConfigured: false }),
    });
  });

  // Playwright's route interception happens ahead of the (virtual) network
  // layer, so a `page.route` handler keeps answering even while
  // `context.setOffline(true)` is active. To simulate a genuine sync
  // failure in lockstep with the visible offline state, this route consults
  // its own flag (toggled alongside `context.setOffline` below) rather than
  // trusting routing to fail on its own.
  let simulateSyncFailure = false;
  let postCount = 0;
  await page.route("**/api/training/state", async (route) => {
    const method = route.request().method();
    if (method === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, authenticated: true, snapshot: null }),
      });
      return;
    }
    if (method === "POST") {
      postCount += 1;
      if (simulateSyncFailure) {
        await route.abort("internetdisconnected");
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, authenticated: true }),
      });
      return;
    }
    await route.continue();
  });

  // Build the plan and load the session screen while still online, so no
  // navigation (and therefore no network round-trip for route chunks/RSC
  // payloads) is required once we go offline below.
  await completeQuestionnaire(page, { daysPerWeek: 3 });
  await page.getByTestId("start-selected-day").click();
  await expect(page).toHaveURL(/\/session/);

  const readOfflineQueueLength = () =>
    page.evaluate(() => {
      const raw = localStorage.getItem("praxis_offline_sync_queue");
      if (!raw) return 0;
      try {
        const parsed = JSON.parse(raw) as unknown;
        return Array.isArray(parsed) ? parsed.length : 0;
      } catch {
        return 0;
      }
    });

  simulateSyncFailure = true;
  await context.setOffline(true);
  await expect(page.getByTestId("offline-badge")).toBeVisible();

  // Drive the already-loaded session to completion via same-page
  // interactions only (no route change while offline).
  for (let i = 0; i < 20; i += 1) {
    const button = page.getByTestId("session-next");
    await expect(button).toBeEnabled();
    const label = (await button.textContent()) ?? "";
    await button.evaluate((element: HTMLElement) => element.click());
    if (label.toLowerCase().includes("finish")) break;
  }
  await expect(page.getByText("Session complete")).toBeVisible({
    timeout: 20_000,
  });

  // Training data still saved locally even though every server push failed
  // while offline — nothing was lost, it was queued instead.
  await expect.poll(readOfflineQueueLength).toBeGreaterThan(0);

  const postCountBeforeReconnect = postCount;

  simulateSyncFailure = false;
  await context.setOffline(false);
  await expect(page.getByTestId("offline-badge")).toBeHidden();

  // The queue drains on its own (the `online` window event triggers it) —
  // nothing further to click.
  await expect
    .poll(readOfflineQueueLength, { timeout: 15_000 })
    .toBe(0);
  expect(postCount).toBeGreaterThan(postCountBeforeReconnect);
});
