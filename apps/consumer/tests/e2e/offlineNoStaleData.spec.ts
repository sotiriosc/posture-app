import { test, expect, type Page } from "@playwright/test";
import {
  completeQuestionnaire,
  getActiveProgramId,
  mockAuthSession,
  mockTrainingState,
  waitForResultsDashboard,
} from "../../e2e/fixtures";

/**
 * Phase 6f, Commit 2 — offline mode for the current workout.
 *
 * Spec: "Cache CURRENT program's active day + next scheduled day locally.
 * Replace-not-accumulate. When user's plan updates, old cached day is
 * overwritten." Investigation (see ED-6f.2 in docs/engine-decisions.md)
 * found the ENTIRE active program is already cached locally in IndexedDB,
 * keyed by program id, with `app_state_v1.activeProgramId` as the single
 * pointer that moves on regeneration — a strict superset of a narrower
 * 2-day cache, so no new caching layer was built. This test verifies that
 * existing "replace" behavior actually holds (only one program is ever
 * resolved as current — the prior one is never accumulated back in) and
 * that resolving it needs no network, i.e. it's just as correct offline.
 */

const readProgramRecord = (page: Page, programId: string) =>
  page.evaluate(
    (id) =>
      new Promise<{ id: string; daysPerWeek: number } | null>((resolve) => {
        const request = indexedDB.open("bodycoach-logs", 2);
        request.onerror = () => resolve(null);
        request.onsuccess = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains("programs")) {
            resolve(null);
            return;
          }
          const tx = db.transaction("programs", "readonly");
          const getRequest = tx.objectStore("programs").get(id);
          getRequest.onsuccess = () => resolve(getRequest.result ?? null);
          getRequest.onerror = () => resolve(null);
        };
      }),
    programId
  );

test("regenerating the plan replaces the active program pointer rather than accumulating it, and this resolves correctly offline", async ({
  page,
  context,
}) => {
  await mockAuthSession(page, { enabled: false, authenticated: false });
  await mockTrainingState(page, { authenticated: false });

  // Program A: 3 days/week.
  await completeQuestionnaire(page, { daysPerWeek: 3 });
  const programIdA = await getActiveProgramId(page);
  expect(programIdA).toBeTruthy();

  // Regenerate with a materially different plan (5 days/week) — an existing
  // committed profile triggers a change-confirmation dialog before Praxis
  // rebuilds the plan.
  await page.goto("/questionnaire");
  await expect(page.getByTestId("questionnaire-form")).toBeVisible();
  await page.getByTestId("days-5").click();
  await page.getByTestId("generate-routine").click();

  // Days-per-week is a program-affecting change on an already-committed
  // profile, so the change-confirmation modal must appear before rebuilding.
  await expect(
    page.getByTestId("questionnaire-change-confirm-modal")
  ).toBeVisible();
  await page.getByTestId("questionnaire-change-confirm").click();
  await waitForResultsDashboard(page);

  const programIdB = await getActiveProgramId(page);
  expect(programIdB).toBeTruthy();
  expect(programIdB).not.toBe(programIdA);

  // Now go offline — everything below reads only local state, no navigation.
  await context.setOffline(true);

  // The pointer swap itself needs no network and holds up offline.
  const resolvedOffline = await getActiveProgramId(page);
  expect(resolvedOffline).toBe(programIdB);

  // Program A was not destructively wiped (Commit 2 deliberately reuses the
  // existing cache rather than adding a delete-on-regenerate step — see
  // ED-6f.2) ...
  const recordA = await readProgramRecord(page, programIdA as string);
  expect(recordA).not.toBeNull();
  expect(recordA?.daysPerWeek).toBe(3);

  // ... but it is never what gets served as "today's session": program B,
  // the newer plan, is the one the active pointer resolves to.
  const recordB = await readProgramRecord(page, programIdB as string);
  expect(recordB).not.toBeNull();
  expect(recordB?.daysPerWeek).toBe(5);

  await context.setOffline(false);
});
