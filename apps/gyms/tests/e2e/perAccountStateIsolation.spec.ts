import { test, expect, type Page } from "@playwright/test";
import {
  completeCurrentSession,
  completeQuestionnaire,
  e2eEmail,
  getActiveProgramId,
  upsertE2eUser,
} from "./fixtures";

/**
 * Phase 6f, Commit 1 (SR-6f) — per-account state isolation, ported from
 * Phase 6e's consumer fix (ED-6e.1). Gyms carries MORE risk than consumer:
 * operators demonstrably log in and out on shared devices during pilots.
 *
 * This test builds real history for account A (a full program + a completed
 * session + a progress photo), logs out, signs in as account B on the same
 * browser/device, and asserts B starts from zero: no program, no session
 * history, no photos. Photos specifically must be *invisible*, not
 * necessarily deleted — namespacing (ED-6e.1) is the isolation mechanism; A's
 * photo may still exist on disk under A's namespace, but B must never see it.
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

// A 1x1 transparent PNG — enough for the assessment page's file input to
// accept and photoStore to persist as a real blob.
const TINY_PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";

const uploadFrontPhoto = async (page: Page) => {
  await page.goto("/assessment");
  const fileInput = page.locator('input[type="file"]').first();
  await fileInput.setInputFiles({
    name: "front.png",
    mimeType: "image/png",
    buffer: Buffer.from(TINY_PNG_BASE64, "base64"),
  });
  await expect(page.getByRole("button", { name: "Delete" }).first()).toBeVisible();
};

test("account B never sees account A's session history or photos on the same device", async ({
  page,
}) => {
  const passwordA = "playwright-password-a1";
  const passwordB = "playwright-password-b1";
  const emailA = e2eEmail("gyms-isolation-a");
  const emailB = e2eEmail("gyms-isolation-b");
  await upsertE2eUser({ email: emailA, password: passwordA, plan: "free" });
  await upsertE2eUser({ email: emailB, password: passwordB, plan: "free" });

  // Account A: sign in, build a program, complete a session, add a photo.
  let login = await page.request.post("/api/auth/login", {
    data: { email: emailA, password: passwordA },
  });
  expect(login.ok()).toBeTruthy();

  await completeQuestionnaire(page);
  await completeCurrentSession(page);
  const programIdA = await getActiveProgramId(page);
  expect(programIdA).not.toBeNull();
  expect(await countPrograms(page)).toBeGreaterThan(0);

  await uploadFrontPhoto(page);

  // Log out of account A.
  const logout = await page.request.post("/api/auth/logout");
  expect(logout.ok()).toBeTruthy();

  // Account B signs in on the same device — no explicit wipe step. The fix
  // must reconcile this automatically.
  login = await page.request.post("/api/auth/login", {
    data: { email: emailB, password: passwordB },
  });
  expect(login.ok()).toBeTruthy();

  await page.goto("/results");
  // B has zero programs, so the dashboard's "Praxis dashboard" heading never
  // renders (that only shows once a program exists) — the page-level
  // "Member Dashboard" nav still resolves, so poll on program state directly.
  await expect.poll(() => getActiveProgramId(page), { timeout: 20_000 }).toBeNull();
  await expect.poll(() => countPrograms(page), { timeout: 20_000 }).toBe(0);

  // Zero photos for B — A's photo is namespaced away, not shown.
  await page.goto("/assessment");
  await expect(page.getByRole("button", { name: "Delete" })).toHaveCount(0);
  await expect(page.getByText("No photo yet").first()).toBeVisible();
});
