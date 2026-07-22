import { test, expect, type Page } from "@playwright/test";
import { createHash } from "node:crypto";

/**
 * Phase 6b, Commit 6 (6.b) — "Erase all local data" in Settings.
 *
 * Verifies the confirmation gate works (the destructive button stays disabled
 * until the user types exactly ERASE) and that confirming actually wipes the
 * device — no programs left in IndexedDB, no app-state key in localStorage.
 *
 * /settings is admin-gated, so we set the bac_admin cookie (sha256 of the
 * ADMIN_ACCESS_KEY the Playwright webServer runs with) before navigating.
 */

const ADMIN_KEY = "playwright-admin-key";
const ADMIN_COOKIE_NAME = "bac_admin";

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

test("erase-all-local-data requires the ERASE confirmation, then wipes the device", async ({
  page,
  context,
  baseURL,
}) => {
  const adminCookie = createHash("sha256").update(ADMIN_KEY).digest("hex");
  await context.addCookies([
    { name: ADMIN_COOKIE_NAME, value: adminCookie, url: baseURL! },
  ]);

  // Seed real data so the wipe has something to remove.
  await page.goto("/dev-seed?seed=climber");
  await page.waitForURL((url) => !url.pathname.startsWith("/dev-seed"), {
    timeout: 30_000,
  });
  expect(await countPrograms(page)).toBeGreaterThan(0);

  await page.goto("/settings");
  await expect(page).toHaveURL(/\/settings/);

  // Reveal the confirmation input.
  await page.getByRole("button", { name: "Erase all local data" }).click();

  const confirmButton = page.getByRole("button", { name: "Erase everything" });
  const input = page.getByLabel("Type ERASE to confirm");

  // Disabled until the exact confirmation text is typed.
  await expect(confirmButton).toBeDisabled();
  await input.fill("erase");
  await expect(confirmButton).toBeDisabled();
  await input.fill("ERASE");
  await expect(confirmButton).toBeEnabled();

  await confirmButton.click();

  // The handler wipes local data then reloads. Whichever route it lands on, the
  // device must end up empty — poll to ride out the reload navigation.
  const safeCountPrograms = async () => {
    try {
      return await countPrograms(page);
    } catch {
      return -2; // execution context torn down mid-reload; poll will retry
    }
  };
  await expect.poll(safeCountPrograms, { timeout: 20_000 }).toBe(0);

  await expect
    .poll(
      async () => {
        try {
          return await page.evaluate(() =>
            localStorage.getItem("app_state_v1")
          );
        } catch {
          return "pending";
        }
      },
      { timeout: 20_000 }
    )
    .toBeNull();
});
