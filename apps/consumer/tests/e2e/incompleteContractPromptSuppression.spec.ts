import { test, expect, type Page } from "@playwright/test";
import { completeQuestionnaire, mockTrainingState } from "../../e2e/fixtures";

/**
 * Phase 6f, Commit 5.c — session-adjustment ("incomplete last session")
 * prompt tone + self-adapting suppression.
 *
 * Seeds an incomplete exercise log directly into IndexedDB (schema mirrors
 * `packages/engine/src/logStore.ts`) so the pre-session feedback contract
 * prompt fires deterministically for a specific, known exercise, without
 * depending on the randomized program generator's exact exercise selection
 * or on driving a full multi-set session UI to intentionally leave sets
 * incomplete.
 */
const seedIncompleteContractTrigger = async (
  page: Page,
  incompleteContractPromptFireCount: number
) => {
  return page.evaluate(async (priorFireCount) => {
    const DB_NAME = "bodycoach-logs";
    const DB_VERSION = 2;

    const appStateRaw = localStorage.getItem("app_state_v1");
    const appState = appStateRaw ? JSON.parse(appStateRaw) : null;
    const programId: string | null =
      appState?.activeProgramId ?? appState?.programId ?? null;
    if (!programId) throw new Error("No active program in app_state_v1");

    const db: IDBDatabase = await new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    const getStore = (name: string) =>
      new Promise<any>((resolve, reject) => {
        const tx = db.transaction(name, "readonly");
        const request = tx.objectStore(name).get(programId);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

    const program = await getStore("programs");
    if (!program) throw new Error(`No stored program for id ${programId}`);
    const day0 = (program.week ?? []).find((d: any) => d.dayIndex === 0);
    const mainExercise = (day0?.routine ?? []).find(
      (item: any) => item.section === "main"
    );
    if (!mainExercise) throw new Error("Day 0 has no main-section exercise");
    const exerciseId: string = mainExercise.exerciseId;
    const exerciseName: string = mainExercise.name ?? exerciseId;

    const nowIso = new Date().toISOString();
    const sessionId = `e2e-incomplete-session-${Date.now()}`;

    const putRecord = (storeName: string, record: unknown) =>
      new Promise<void>((resolve, reject) => {
        const tx = db.transaction(storeName, "readwrite");
        const request = tx.objectStore(storeName).put(record);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

    await putRecord("sessions", {
      id: sessionId,
      userId: null,
      startedAt: nowIso,
      completedAt: nowIso,
      createdAt: nowIso,
      updatedAt: nowIso,
      routineId: programId,
      durationSec: 600,
      notes: "dayIndex:0",
      source: "local",
      deletedAt: null,
    });

    await putRecord("exercise_logs", {
      id: `e2e-incomplete-log-${Date.now()}`,
      userId: null,
      sessionId,
      exerciseId,
      section: "main",
      programId,
      dayIndex: 0,
      createdAt: nowIso,
      updatedAt: nowIso,
      loadType: "bodyweight",
      unit: null,
      weight: null,
      reps: null,
      repsBySet: null,
      setsPlanned: 3,
      setsCompleted: 1,
      durationSec: null,
      rpe: null,
      felt: null,
      painLevel: null,
      painLocation: null,
      notes: null,
      computedVolume: null,
      source: "local",
      deletedAt: null,
    });

    const existingPrefsTx = db.transaction("prefs", "readonly");
    const existingPrefsRequest = existingPrefsTx.objectStore("prefs").get("prefs");
    const existingPrefs: any = await new Promise((resolve, reject) => {
      existingPrefsRequest.onsuccess = () => resolve(existingPrefsRequest.result);
      existingPrefsRequest.onerror = () => reject(existingPrefsRequest.error);
    });

    await putRecord("prefs", {
      key: "prefs",
      value: {
        ...(existingPrefs?.value ?? { schemaVersion: 2 }),
        incompleteContractPromptFireCount: priorFireCount,
      },
    });

    db.close();
    return { exerciseName };
  }, incompleteContractPromptFireCount);
};

test("the 'incomplete' reason prompt uses curious-not-judgmental copy and offers to turn itself off after firing twice", async ({
  page,
}) => {
  await mockTrainingState(page, { authenticated: false });
  await completeQuestionnaire(page, { daysPerWeek: 3 });

  // This prompt has already fired once before (per stored prefs); today's
  // firing will be its second, so the self-adapting suppression link should
  // appear immediately.
  await seedIncompleteContractTrigger(page, 1);

  await page.getByTestId("start-selected-day").click();

  const prompt = page.getByText(/I noticed you didn't fill in fields for/);
  await expect(prompt).toBeVisible({ timeout: 20_000 });
  await expect(prompt).toContainText("last session");
  await expect(prompt).toContainText("Did you skip it, or want to log it now?");
  await expect(page.getByText(/^Did you skip this exercise\?/)).toHaveCount(0);

  const suppressLink = page.getByTestId("suppress-incomplete-prompt");
  await expect(suppressLink).toBeVisible();
  await suppressLink.click();

  // The prompt itself is dismissed immediately...
  await expect(prompt).toHaveCount(0);

  // ...and the preference is persisted so future sessions never compute the
  // "incomplete" trigger again.
  await expect
    .poll(() =>
      page.evaluate(async () => {
        const db: IDBDatabase = await new Promise((resolve, reject) => {
          const request = indexedDB.open("bodycoach-logs", 2);
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
        const value: any = await new Promise((resolve, reject) => {
          const tx = db.transaction("prefs", "readonly");
          const request = tx.objectStore("prefs").get("prefs");
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
        db.close();
        return value?.value?.suppressIncompleteContractPrompts ?? false;
      })
    )
    .toBe(true);
});

test("the suppression link is not offered the first time the 'incomplete' prompt fires", async ({
  page,
}) => {
  await mockTrainingState(page, { authenticated: false });
  await completeQuestionnaire(page, { daysPerWeek: 3 });

  await seedIncompleteContractTrigger(page, 0);

  await page.getByTestId("start-selected-day").click();

  await expect(
    page.getByText(/I noticed you didn't fill in fields for/)
  ).toBeVisible({ timeout: 20_000 });
  await expect(page.getByTestId("suppress-incomplete-prompt")).toHaveCount(0);
});

test("the suppressed prompt can be re-enabled from Account Settings", async ({
  page,
}) => {
  await mockTrainingState(page, { authenticated: false });
  await completeQuestionnaire(page, { daysPerWeek: 3 });
  await seedIncompleteContractTrigger(page, 1);

  await page.goto("/account/settings");
  const toggle = page.getByTestId("settings-suppress-incomplete-prompts");
  await expect(toggle).not.toBeChecked();
  await toggle.check();
  await expect(toggle).toBeChecked();

  await page.reload();
  await expect(page.getByTestId("settings-suppress-incomplete-prompts")).toBeChecked();

  // Turned off directly from Settings: today's already-seeded "incomplete"
  // trigger must no longer fire when a session starts.
  await page.goto("/results");
  await page.getByTestId("start-selected-day").click();
  await expect(page).toHaveURL(/\/session/);
  await expect(
    page.getByText(/I noticed you didn't fill in fields for/)
  ).toHaveCount(0);

  // Re-enabling brings it back.
  await page.goto("/account/settings");
  const toggleAgain = page.getByTestId("settings-suppress-incomplete-prompts");
  // Wait for the persisted (checked) value to load before interacting —
  // otherwise Playwright can sample the pre-hydration default (unchecked)
  // and treat `.uncheck()` as a no-op.
  await expect(toggleAgain).toBeChecked();
  await toggleAgain.uncheck();
  await expect(toggleAgain).not.toBeChecked();

  await page.goto("/results");
  await page.getByTestId("start-selected-day").click();
  await expect(
    page.getByText(/I noticed you didn't fill in fields for/)
  ).toBeVisible({ timeout: 20_000 });
});
