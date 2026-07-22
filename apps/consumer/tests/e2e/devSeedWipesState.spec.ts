import { test, expect, type Page } from "@playwright/test";

/**
 * Phase 6b, Commit 6 (6.a) — dev-seed fully wipes state on every persona load.
 *
 * The QA leak: seeding persona A then persona B left A's IndexedDB data behind,
 * producing a false "ready for next phase" report. This test seeds the
 * data-bearing "12-week climber" (A), confirms its program landed in
 * IndexedDB, then seeds the "empty new user" (B) and asserts A's data is fully
 * gone — no programs in IndexedDB and no app-state key in localStorage.
 *
 * dev-seed is only reachable under NODE_ENV=development, which is exactly how
 * the Playwright webServer runs (`npm run dev`).
 */

// Count programs persisted in the app's IndexedDB store. Opening a missing DB
// creates an empty one with no object stores, which correctly reads as 0.
const countPrograms = (page: Page) =>
  page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        const request = indexedDB.open("bodycoach-logs");
        request.onsuccess = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains("programs")) {
            db.close();
            resolve(0);
            return;
          }
          const countRequest = db
            .transaction("programs", "readonly")
            .objectStore("programs")
            .count();
          countRequest.onsuccess = () => {
            resolve(countRequest.result);
            db.close();
          };
          countRequest.onerror = () => {
            resolve(-1);
            db.close();
          };
        };
        request.onerror = () => resolve(-1);
      })
  );

const seedPersona = async (page: Page, id: string) => {
  await page.goto(`/dev-seed?seed=${id}`);
  // The client seeds, then redirects off /dev-seed (to the persona's screen or,
  // for gated routes, the login page). Either way we leave /dev-seed.
  await page.waitForURL((url) => !url.pathname.startsWith("/dev-seed"), {
    timeout: 30_000,
  });
};

test("dev-seed wipes prior persona state on every load", async ({ page }) => {
  // Persona A — the climber seeds a full program + logs.
  await seedPersona(page, "climber");
  expect(await countPrograms(page)).toBeGreaterThan(0);
  expect(
    await page.evaluate(() => localStorage.getItem("app_state_v1"))
  ).not.toBeNull();

  // Persona B — the empty new user. Loading it must fully wipe A first.
  await seedPersona(page, "empty");

  // A's data is gone: no programs, no app-state key.
  expect(await countPrograms(page)).toBe(0);
  expect(
    await page.evaluate(() => localStorage.getItem("app_state_v1"))
  ).toBeNull();
});
