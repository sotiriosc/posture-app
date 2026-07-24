import { test, expect, type Page } from "@playwright/test";
import { e2eEmail, upsertE2eUser } from "./fixtures";

/**
 * Phase 6f, Commit 1 (SR-6f) — startup stale-device check, ported from
 * Phase 6e's consumer fix (ED-6e.1).
 *
 * Simulates a device that already carries a full, real program from some
 * account this browser has no memory of signing out of (e.g. a device
 * handed off without an explicit logout, or state seeded by tooling — the
 * exact scenario operators create during shared-device pilots). A brand-new
 * account then signs in. The fix must detect that the locally remembered
 * owner doesn't match the server session's account and wipe the orphaned
 * state before the new account's first render — not just on the explicit
 * login-form code path.
 */

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

test("a stale device carrying an untracked prior account's state is wiped clean before a new account's first render", async ({
  page,
}) => {
  const email = e2eEmail("gyms-stale-device");
  const password = "playwright-password-stale";
  await upsertE2eUser({ email, password, plan: "free" });

  // Orphaned state from some account this browser has no logout record for
  // — dev-seed gives us a real program + logs + app-state, which is more
  // representative than hand-rolled fixtures.
  await page.goto("/dev-seed?seed=member-drill-in");
  await page.waitForURL((url) => !url.pathname.startsWith("/dev-seed"), {
    timeout: 30_000,
  });
  expect(await countPrograms(page)).toBeGreaterThan(0);
  expect(
    await page.evaluate(() => localStorage.getItem("app_state_v1"))
  ).not.toBeNull();

  // Forge a stale ownership marker that matches nobody Praxis knows — this
  // is what the device looks like after a handoff with no clean logout (or
  // simply predates this feature).
  await page.evaluate(() => {
    localStorage.setItem("praxis_local_owner_id", "some-other-untracked-user");
  });

  // A brand-new account signs in on this device.
  const login = await page.request.post("/api/auth/login", {
    data: { email, password },
  });
  expect(login.ok()).toBeTruthy();

  await page.goto("/results");

  // Clean state at first render: no inherited program, no inherited
  // app-state, and the device now remembers the new account as its owner.
  await expect.poll(() => countPrograms(page), { timeout: 20_000 }).toBe(0);
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem("app_state_v1")), {
      timeout: 20_000,
    })
    .toBeNull();
  await expect
    .poll(
      () => page.evaluate(() => localStorage.getItem("praxis_local_owner_id")),
      { timeout: 20_000 }
    )
    .not.toBeNull();
  expect(
    await page.evaluate(() => localStorage.getItem("praxis_local_owner_id"))
  ).not.toBe("some-other-untracked-user");
});
