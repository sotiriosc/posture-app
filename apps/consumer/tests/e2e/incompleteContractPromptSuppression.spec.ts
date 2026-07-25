import { test, expect, type Page } from "@playwright/test";
import { completeQuestionnaire, mockTrainingState } from "../../e2e/fixtures";

/**
 * Phase 6i Commit 4 — incomplete-field prompt uses three buttons with
 * instant "Stop asking" (no fire-count gate, no Settings navigation).
 */

const seedIncompleteContractTrigger = async (
  page: Page,
  incompleteContractPromptFireCount = 0
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

test("incomplete prompt offers Log it now / Skipped it / Stop asking on first fire", async ({
  page,
}) => {
  await mockTrainingState(page, { authenticated: false });
  await completeQuestionnaire(page, { daysPerWeek: 3 });
  await seedIncompleteContractTrigger(page, 0);

  await page.getByTestId("start-selected-day").click();

  const prompt = page.getByText(/I noticed you didn't fill in fields for/);
  await expect(prompt).toBeVisible({ timeout: 20_000 });
  await expect(page.getByTestId("incomplete-log-it-now")).toBeVisible();
  await expect(page.getByTestId("incomplete-skipped-it")).toBeVisible();
  await expect(page.getByTestId("suppress-incomplete-prompt")).toBeVisible();
  await expect(
    page.getByText("You can turn these back on anytime in Settings.")
  ).toBeVisible();
  // Legacy Sacrifice/Test/Modify labels stay off this incomplete path.
  await expect(page.getByText(/^Sacrifice$/)).toHaveCount(0);
});

test("Stop asking persists suppression without navigating to Settings", async ({
  page,
}) => {
  await mockTrainingState(page, { authenticated: false });
  await completeQuestionnaire(page, { daysPerWeek: 3 });
  await seedIncompleteContractTrigger(page, 0);

  await page.getByTestId("start-selected-day").click();

  const prompt = page.getByText(/I noticed you didn't fill in fields for/);
  await expect(prompt).toBeVisible({ timeout: 20_000 });
  await page.getByTestId("suppress-incomplete-prompt").click();
  await expect(prompt).toHaveCount(0);

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

test("the suppressed prompt can be re-enabled from Account Settings", async ({
  page,
}) => {
  await mockTrainingState(page, { authenticated: false });
  await completeQuestionnaire(page, { daysPerWeek: 3 });
  await seedIncompleteContractTrigger(page, 0);

  await page.goto("/account/settings");
  const toggle = page.getByTestId("settings-suppress-incomplete-prompts");
  await expect(toggle).toBeEnabled();
  // Pref may still be false; turn suppression on then off to prove the path.
  if (!(await toggle.isChecked())) {
    await toggle.click();
  }
  await expect(toggle).toBeChecked();
  await toggle.click();
  await expect(toggle).not.toBeChecked();
});
