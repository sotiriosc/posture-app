import { closeDb } from "./logStore";

const LOCAL_KEYS = [
  "app_state_v1",
  "posture_questionnaire",
  "posture_photo_meta",
  "exercise_logs",
  "bodycoach_sessions",
  "timer_prefs",
  "session_feedback",
];

const DB_NAMES = ["bodycoach-logs", "bodycoach-drafts", "bodycoach-photos"];

const deleteDatabase = (name: string) =>
  new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase(name);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    request.onblocked = () => resolve();
  });

/**
 * Scoped reset: clears the known plan/log/photo keys and named databases.
 * Kept intentionally surgical — this is the "Reset app data" path and the many
 * internal callers that only want to clear the active plan/progress.
 */
export const resetAllAppData = async () => {
  if (typeof window === "undefined") return;

  LOCAL_KEYS.forEach((key) => localStorage.removeItem(key));

  await Promise.all(DB_NAMES.map((name) => deleteDatabase(name)));
};

export const resetAppDataKeys = () => ({
  localStorage: [...LOCAL_KEYS],
  indexedDB: [...DB_NAMES],
});

/**
 * Enumerate every IndexedDB database in this origin. Every database in the
 * Praxis origin is ours, so a full erase deletes them all rather than trusting
 * a hard-coded allowlist (which is how seeded state leaked before). Falls back
 * to the known names where `indexedDB.databases()` is unavailable.
 */
const listAllDatabaseNames = async (): Promise<string[]> => {
  const factory = indexedDB as IDBFactory & {
    databases?: () => Promise<Array<{ name?: string }>>;
  };
  if (typeof factory.databases === "function") {
    try {
      const entries = await factory.databases();
      const names = entries
        .map((entry) => entry.name)
        .filter((name): name is string => Boolean(name));
      return Array.from(new Set([...names, ...DB_NAMES]));
    } catch {
      return [...DB_NAMES];
    }
  }
  return [...DB_NAMES];
};

/**
 * Full device wipe (Phase 6b, Commit 6).
 *
 * Removes EVERYTHING Praxis has stored on this device: every IndexedDB
 * database in the origin and all of localStorage/sessionStorage — not just the
 * program/plan keys. Used by:
 *   - the dev-seed tool, before writing any persona (so seeded state can never
 *     leak across persona loads), and
 *   - the user-facing "Erase all local data" button in Settings.
 *
 * The cached IndexedDB connection is closed first so `deleteDatabase` runs
 * unblocked. A dev-console line is emitted so QA can immediately confirm the
 * wipe happened (and spot any leak that survives it). Nothing is sent to a
 * server — the whole point is that the data leaves the device.
 */
export const eraseAllLocalData = async (): Promise<void> => {
  if (typeof window === "undefined") return;

  await closeDb().catch(() => undefined);

  const dbNames = await listAllDatabaseNames();
  await Promise.all(dbNames.map((name) => deleteDatabase(name)));

  const localKeyCount = localStorage.length;
  localStorage.clear();
  try {
    sessionStorage.clear();
  } catch {
    // sessionStorage can be unavailable in some embedded contexts; ignore.
  }

  // Dev-visible confirmation of a complete wipe (see spec 6.a).
  console.info(
    `[praxis] erase-all-local-data: cleared ${localKeyCount} localStorage keys and ` +
      `${dbNames.length} IndexedDB database(s): ${dbNames.join(", ") || "none"}`
  );
};
