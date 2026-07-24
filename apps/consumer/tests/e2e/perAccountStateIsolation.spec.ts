import { test, expect, type Page } from "@playwright/test";
import {
  completeCurrentSession,
  completeQuestionnaire,
  e2eEmail,
  getActiveProgramId,
  upsertE2eUser,
} from "../../e2e/fixtures";

/**
 * Phase 6e, Commit 1 (SR-6e, ED-6e.1) — per-account state isolation.
 *
 * The reported bug: local device state (IndexedDB programs/logs, localStorage
 * phase-gating state) was global, not namespaced by account. A new account
 * signing in on a device that had previously hosted a different account
 * inherited that account's progress — up to and including phase gating
 * advancing before the new account had done any work.
 *
 * This test builds real history for account A (a full program + a completed
 * session + a progress photo), logs out, signs in as account B on the same
 * browser/device, and asserts B starts from zero: no program, no session
 * history, no photos. Photos specifically must be *invisible*, not
 * necessarily deleted — Sotirios ratified namespacing (ED-6e.1), so A's
 * photo may still exist on disk under A's namespace; B must never see it.
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
  // First navigation to /assessment in this run needs a fresh dev-server
  // compile, and the client-side photo processing that follows the upload
  // adds further latency -- give both room beyond Playwright's 5s default.
  await expect(page.getByRole("button", { name: "Delete" }).first()).toBeVisible({
    timeout: 15_000,
  });
};

test("account B never sees account A's session history or photos on the same device", async ({
  page,
}) => {
  const passwordA = "playwright-password-a1";
  const passwordB = "playwright-password-b1";
  const emailA = e2eEmail("isolation-a");
  const emailB = e2eEmail("isolation-b");
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
  // B has zero programs, so `ResultsRoutine`'s "Praxis dashboard" heading
  // never renders (that only shows once a program exists) — the page-level
  // "Praxis Dashboard" kicker is the render-succeeded signal here instead.
  await expect(page.getByText("Praxis Dashboard", { exact: true })).toBeVisible({
    timeout: 20_000,
  });

  // Zero session/program history for B.
  await expect.poll(() => getActiveProgramId(page), { timeout: 20_000 }).toBeNull();
  await expect.poll(() => countPrograms(page), { timeout: 20_000 }).toBe(0);

  // Zero photos for B — A's photo is namespaced away, not shown.
  await page.goto("/assessment");
  await expect(page.getByRole("button", { name: "Delete" })).toHaveCount(0);
  await expect(page.getByText("No photo yet").first()).toBeVisible();
});
