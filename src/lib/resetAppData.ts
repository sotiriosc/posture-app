const LOCAL_KEYS = [
  "app_state_v1",
  "posture_questionnaire",
  "posture_photo_meta",
  "exercise_logs",
  "bodycoach_sessions",
  "timer_prefs",
  "session_feedback",
];

const DB_NAMES = ["bodycoach-logs", "bodycoach-drafts"];

const deleteDatabase = (name: string) =>
  new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase(name);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    request.onblocked = () => resolve();
  });

export const resetAllAppData = async () => {
  if (typeof window === "undefined") return;

  LOCAL_KEYS.forEach((key) => localStorage.removeItem(key));

  await Promise.all(DB_NAMES.map((name) => deleteDatabase(name)));
};

export const resetAppDataKeys = () => ({
  localStorage: [...LOCAL_KEYS],
  indexedDB: [...DB_NAMES],
});
